import React, {Component} from "react";
import { Link } from "react-router-dom";
import Meditem from '../meditem'
import AddButton from './addMed.png'
class Medlist extends Component {

    render() {
        console.log(this.props.meds);
        let meds;
        if (this.props.meds.length > 0 ){ 
            meds = this.props.meds.map(med =>{
            //console.log(med)
            return (<Meditem key={med.id} meditem={med} />)
            })
        }
        //console.log(this.props)
        // Notice how each input has a `value`, `name`, and `onChange` prop
        return ( 
            <div className = 'Medlist' >
            <table className='medtable'>
                <tbody>
                <tr className='medlistkeyrow'>
                    <th className="medlistkey">Brand Name</th>
                    <th className="medlistkey">Trade Name</th> 
                    <th className="medlistkey">
                        <span id="newmedlabel">New Med  </span>
                        <Link to="/search">
                            <img id="addmedbutton" src={AddButton} alt="addMed" />
                        </Link>
                    </th>
                </tr>
                
                {meds}
                </tbody>
            </table>
            </div>
        )
    }
}

export default Medlist;