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
        this.MapHelper = new MapHelper("mapid", this.props.getTreeThreatLevel, this.props.initWidth, this.props.setDiversityScale);

        this.addSpeciesFromMapSpecies();

        this.MapHelper.updateHeatMap(this.props.heatMap, this.props.treeThreatType);
        this.MapHelper.updateDiversity(this.props.diversity, this.props.diversityMode, this.props.diversityAttribute);
    }

    addSpeciesFromMapSpecies() {
        if (this.props.data && this.props.mapSpecies) {
            for (let species of Object.keys(this.props.mapSpecies)) {

                if (this.props.data.hasOwnProperty(species)) {
                    fetch("/distribution/" + species.replace(" ", "_") + ".geojson")
                        .then(res => res.json())
                        .then(data => {
                            this.MapHelper.addDistribution(species, data);
                        })
                        .catch(e => {

                            let justGenus = false;
                            if (!species.includes(" ")) {
                                justGenus = true;
                            }

                            if (this.props.data[species].hasOwnProperty("treeCountries")) {
                                let countries = Object.keys(this.props.data[species]["treeCountries"]);

                                if (countries.length > 0) {
                                    if (justGenus) {
                                        let speciesCountries = {};
                                        let acceptedTreeSpecies = Object.keys(this.props.data[species]["speciesNamesAndSyns"]);
                                        for (let treeName of Object.keys(this.props.data[species]["speciesCountries"])) {
                                            if (acceptedTreeSpecies.includes(treeName)) {
                                                speciesCountries[treeName] = this.props.data[species]["speciesCountries"][treeName];
                                            }
                                        }
                                        this.MapHelper.addTreeCountries(species, countries, speciesCountries);
                                    }
                                    else {
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
                        });
                }
            }
        }
    }

    removeSpeciesByMapSpecies(diff) {
        for (let species of diff) {
            this.MapHelper.removeSpeciesCountries(species);
            this.MapHelper.removeSpeciesEcoRegions(species);
        }
    }

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.mapSpecies) !== JSON.stringify(this.props.mapSpecies)) {
            this.addSpeciesFromMapSpecies();
            let newSpecies = Object.keys(this.props.mapSpecies);
            let diff = Object.keys(prevProps.mapSpecies).filter(x => !newSpecies.includes(x));

            this.removeSpeciesByMapSpecies(diff);
            this.MapHelper.updateHeatMap(this.props.heatMap, this.props.treeThreatType);
            this.MapHelper.updateDiversity(this.props.diversity, this.props.diversityMode, this.props.diversityAttribute);
        }

        if (prevProps.heatMap !== this.props.heatMap) {
            this.MapHelper.updateHeatMap(this.props.heatMap, this.props.treeThreatType);
        }

        if (prevProps.diversity !== this.props.diversity
            || prevProps.diversityMode !== this.props.diversityMode
            || prevProps.diversityAttribute !== this.props.diversityAttribute) {
            this.MapHelper.updateDiversity(this.props.diversity, this.props.diversityMode, this.props.diversityAttribute);
        }

        if (prevProps.treeThreatType !== this.props.treeThreatType) {
            this.MapHelper.updateHeatMap(this.props.heatMap, this.props.treeThreatType);
            this.MapHelper.updateDiversity(this.props.diversity, this.props.diversityMode, this.props.diversityAttribute);
        }
    }

    render() {
        return (
            <div>
                <div id="mapid" style={{
                    height: "50vh",
                    width: "70vw"
                }}></div>
            </div>
        );
    }
}

export default Map;