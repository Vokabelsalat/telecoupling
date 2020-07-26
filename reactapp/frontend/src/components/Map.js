import React, { Component } from 'react';
import MapHelper from './MapHelper';
import '../utils/utils';

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
        };
    }

    init() {
        this.MapHelper = new MapHelper("mapid");

        for (let species of Object.keys(this.props.data).values()) {

            if (this.props.data[species].hasOwnProperty("trees")) {
                let countries = [];

                function processEntry(e) {
                    countries.push(e.country);
                }

                this.props.data[species]["trees"].forEach(function (element, index) {
                    element.TSGeolinks.map(processEntry);
                });

                this.MapHelper.addTreeCountries(species, countries);

                /* fetch("/Eucalyptus_bancroftii.json")
                    .then(res => res.json())
                    .then(data => {
                        let coordinates = data.map(entry => {
                            return [];
                        });
                    }) */
            }
        }
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate() {
        this.init();
    }

    render() {
        return (
            <div>
                <div id="mapid" style={{
                    height: "80vh",
                    width: "80vw"
                }}></div>
            </div>
        );
    }
}

export default Map;