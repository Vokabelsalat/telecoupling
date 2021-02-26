import React, { Component, useEffect } from 'react';
import { TimelineDatagenerator } from '../utils/TimelineDatagenerator'

class DataGeneratorView extends Component {
    constructor(props) {
        super(props);

        this.data = props.data;

        /*         this.genusSpecies = props.genusSpecies;
        
                fetch("http://localhost:3000/data/" + this.genusSpecies.trim().replaceSpecialCharacters() + ".json")
                    .then(res => res.json())
                    .then(function (data) {
                        console.log(data);
        
                        let obj = {};
                        obj[props.genusSpecies.replace("_", " ")] = data;
        
                        let species = props.genusSpecies.replace("_", " ");
        
                        fetch("http://localhost:3000/data/" + species.trim().replaceSpecialCharacters() + "_threats.json")
                            .then(res => {
                                return res.json();
                            })
                            .then(function (data) {
                                obj[species.replace("_", " ")].threats = data;
        
                                let generator = new TimelineDatagenerator(obj);
                                generator.processData(obj, undefined, undefined);
                            });
        
                    }); */
    }

    componentDidMount() {

    }

    render() {
        console.log(this.data);
        return (
            <div>
                {this.data}
            </div>
        );
    }
}

export default DataGeneratorView;