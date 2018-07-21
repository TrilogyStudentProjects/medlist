import React, { Component } from 'react';
import $ from "axios";
import Meddetailitem from './meddetailitem';
import Doseform from './doseform';
import Dosedetail from './dosedetail';

class Meddetail extends Component {

    constructor() {
        super();
        this.state = { 
            medInfo: []
        };
    }

    componentDidMount(){
            $.get(`/api/doses/${this.props.match.params.medId}`)
                .then(res => {
                    this.setState({
                        doses: res.data
                    })
                })
                .catch(err => console.log(err));


            $.get(`/api/medInfo/${this.props.match.params.FDAId}`)
                .then( res=> {
                    this.setState({
                        medInfo: Object.entries(res.data)
                    });
                })
                .catch( error=> {
                console.log(error);
                });       
    }

    updateDoses = () => {
        $.get(`/api/doses/${this.props.match.params.medId}`)
            .then(res => {
                this.setState({
                    doses: res.data
                })
            })
            .catch(err => console.log(err));
    }

    deleteDose = doseId => {
        $.delete(`/api/dose/${doseId}`)
        .then(res => this.updateDoses())
        .catch(err => console.log(err));
    }

    render() {
        
        return (
            <div className="column y-center">
                <h1 className="meddetaildrugtitle">{this.props.match.params.brandname}</h1>
                <div className="row split">
                    <Doseform medId={this.props.match.params.medId} update={this.updateDoses}/>
                    <div className="column">
                        {
                            this.state.doses &&
                            this.state.doses.map((x, i) => (
                                <Dosedetail key={i}
                                delete={() => this.deleteDose(x.id)}
                                note={x.note}
                                dose={x.dose}
                                time={x.time}/>
                            ))
                        }
                    </div>
                </div>
                <h1 className="meddetaildrugtitle">
                    Label Info for {this.props.match.params.brandname}:
                </h1>
                <div>
                    {
                        this.state.medInfo.length > 0 &&
                        this.state.medInfo.map(x => {
                            return <Meddetailitem key={x[0]} title={x[0].replace(/_/gi, ' ')} text={x[1]} />
                        })
                    }
                </div>
            </div> 
        )

    }


}


export default Meddetail;