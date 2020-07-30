import React, { Component } from 'react';
import MapHelper from './MapHelper';
import '../utils/utils';

class Map extends Component {
    constructor(props) {
        super(props);

        this.treeCoordinates = {};
        this.treeCoordinateQueue = [];

        this.state = {
            id: this.props.id,
        };
    }

    init() {
        this.treeCoordinateQueue = [];
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
            }

            let mapHelper = this.MapHelper;

            if (this.props.coordinates !== undefined &&
                this.props.coordinates.hasOwnProperty(species) &&
                this.props.coordinates[species].length > 0) {
                mapHelper.addTreeCoordinates(species, this.props.coordinates[species]);
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