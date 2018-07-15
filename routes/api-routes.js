const router = require('express').Router();
const pharma = require('../controls/pharma');
const db = require('../models');

//middleware for protecting routes
function checkAuth(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).json({Error: "Unauthorized"});
    }
}

//test route: check auth
router.get('/test', checkAuth, (req, res) => {
    res.json(req.user);
})

//test route: get rxnorm id 
router.get('/rxnorm/:med', (req, res) => {
    pharma.getRxNorm(req.params.med)
        .then(result => res.json(result))
        .catch(err => res.json(err));
});

//test route: give meds as /rxnorms/med1+med2+med3 and get reactions back in array
router.get('/rxnorms/:meds', (req, res) => {
    let meds = req.params.meds.split("+");
    pharma.getAllRxNorms(meds)
    //debug .then to give interactions off of rxnorm_ids
        .then(result => pharma.getInteractions(result.map(x => x.rxnorm_id)))
        .then(result => res.json(result) )
        .catch(err => res.json(err) );
});

//find med in FDA db
// ADD BACK IN CHECKAUTH
router.get('/searchMed/:med', (req, res) => {
    pharma.searchFDA(req.params.med)
        .then(result => res.json(result))
        .catch(err => res.json(err));
});

//get all user's meds
//joined substances for contents of med
// ADD BACK IN CHECKAUTH AND REQ.USER.ID
router.get('/allMeds', (req, res) => {
    db.Med.findAll({
        where: {
            UserId: process.env.TEST_ID, //req.user.id,
        },
        include: [
            {
                model: db.Substance,
                as: "substances"
            },
            {
                model: db.Dose_Time,
                as: "dose_times"
            }
        ]
    }).then(results => res.json(results))
    .catch(err => res.json(err));
})

//get interactions
// ADD BACK IN CHECKAUTH AND REQ.USER.ID
router.get('/interactions', (req, res) => {
    db.Substance.findAll({
        where: {
            UserId: process.env.TEST_ID, //req.user.id,
        }
    }).then(results => {
        console.log(results.length);
        let rxnorm_ids = results.map(substance => substance.rxnorm_id);
        return pharma.getInteractions(rxnorm_ids);
    }).then(results => res.json(results))
    .catch(err => res.json(err));
})

//add a med 
// ADD BACK IN CHECKAUTH AND REQ.USER.ID
router.post('/addMed', (req, res) => {
    let substances = req.body.substance;
    Promise.all([
        //convert substances to rxnormids
        pharma.getAllRxNorms(substances),
        //add med to DB
        db.Med.create({
            //manually inserting id here so that I can test without a frontend
            UserId: process.env.TEST_ID, //req.user.id,
            brand_name: req.body.brand_name,
            generic_name: req.body.generic_name,
            user_name: req.body.user_name,
            openFDA_id: req.body.openfda_id
        })
    ])
    //result returns as an array [0] is rxnorm results, [1] the created Med result
    .then(result => {
        //add MedId foreign key to substances results
        let bulkSubstances = result[0].map(x => {
            return ({
                rxnorm_id: x.rxnorm_id,
                name: x.name,
                MedId: result[1].id,
                UserId: process.env.TEST_ID, //req.user.id,
            });
        })
        //bulk insert those substances into db under added med's ID
        //return "db.Substance.bulkCreate(bulkSubstances)" also works,
        //but will only return result of bulkInsert, and not previous result
        return new Promise((resolve, reject) => {
            db.Substance.bulkCreate(bulkSubstances)
                //"[result[1], result2]" gives "[added med from previous insert, [ added substances] ]"
                //back to client in json. 
                .then(result2 => resolve([result[1], result2]))
                .catch(err => reject(err));
        });
    }).then(result => res.json(result))
    .catch(err => res.json(err));
});

//add a dosage and time to administer
// ADD BACK IN CHECKAUTH AND REQ.USER.ID
router.post('/addDose/:medId', (req, res) => {
    db.Dose_Time.create({
        UserId: process.env.TEST_ID, //req.user.id,        
        MedId: req.params.medId,
        time: req.body.time,
        dose: req.body.dose,
        note: req.body.note
    }).then(result => res.json(result))
    .catch(err => res.json(err));
});


//get a schedule
// ADD BACK IN CHECKAUTH AND REQ.USER.ID
router.get('/schedule', (req, res) => {
    db.Dose_Time.findAll({
        where: {
            UserId: process.env.TEST_ID, //req.user.id,
        },
        include: [
            {
                model: db.Med
            }
        ]
    }).then(result => {
        
        let groupedByTime = result.reduce((newArr, dose) => {
            //find if we've started a group at this time
            let timeObj = newArr.find(x => x.time === dose.time)
            //push data to that group
            if(timeObj) {
                timeObj.meds.push({
                    dose: dose.dose,
                    note: dose.note,
                    med: dose.Med
                })
            //if there's no group at this time, create one and push
            } else {
                newArr.push({
                    time: dose.time,
                    meds: [{
                        dose: dose.dose,
                        note: dose.note,
                        med: dose.Med
                    }]
                })
            }
            return newArr;
        }, []);
        //sort results by time
        groupedByTime.sort((a, b) => {
            let aTime = a.time.split(":");
            let bTime = b.time.split(":");
            let aHour = parseInt(aTime[0]);
            let bHour = parseInt(bTime[0]);
            let aMin = parseInt(aTime[1]);
            let bMin = parseInt(bTime[1]);
            if(aHour === bHour) {
                return aMin - bMin;
            } else {
                return aHour - bHour;
            }
        });
        res.json(groupedByTime);
    })
    .catch(err => res.json(err));
});

module.exports = router;