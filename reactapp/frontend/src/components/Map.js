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

        this.addTreesFromMapSpecies();
    }

    addTreesFromMapSpecies() {
        let trees = this.MapHelper.getTrees();

        if (this.props.data && this.props.mapSpecies) {
            for (let species of Object.keys(this.props.mapSpecies)) {

                if (this.props.data.hasOwnProperty(species)) {

                    if (this.props.data[species].hasOwnProperty("treeCountries")) {
                        let countries = Object.keys(this.props.data[species]["treeCountries"]);

                        if (countries.length > 0) {
                            this.MapHelper.addTreeCountries(species, countries);
                        }
                    }

                    let mapHelper = this.MapHelper;

                    if (this.props.coordinates !== undefined &&
                        this.props.coordinates.hasOwnProperty(species) &&
                        this.props.coordinates[species].length > 0) {
                        mapHelper.addTreeCoordinates(species, this.props.coordinates[species]);
                    }
                }
            }
        }
    }

    removeTreesByMapSpecies(diff) {
        for (let species of diff) {
            this.MapHelper.removeTreeCountries(species);
        }
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.mapSpecies) !== JSON.stringify(this.props.mapSpecies)) {
            this.addTreesFromMapSpecies();
            let newSpecies = Object.keys(this.props.mapSpecies);
            let diff = Object.keys(prevProps.mapSpecies).filter(x => !newSpecies.includes(x));

            this.removeTreesByMapSpecies(diff);
        }
    }

    render() {
        return (
            <div>
                <div id="mapid" style={{
                    height: "50vh",
                    width: "50vw"
                }}></div>
            </div>
        );
    }
}

export default Map;