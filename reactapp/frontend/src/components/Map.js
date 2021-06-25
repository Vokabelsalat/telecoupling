import React, { Component } from 'react';
import MapHelper from './MapHelper';
import '../utils/utils';

class Map extends Component {
    constructor(props) {
        super(props);

        this.treeCoordinates = {};
        this.treeCoordinateQueue = [];

        this.distributionQueue = [];
        this.expetedDistributionQueueLength = [];

        this.state = {
            id: this.props.id
        };

        console.log("INIT MAP", this.state.id);
    }

    init() {
        this.treeCoordinateQueue = [];
        this.MapHelper = new MapHelper(this.state.id, this.props.getTreeThreatLevel, this.props.initWidth, this.props.setDiversityScale, this.props.heatMap, this.props.diversity);

        this.addSpeciesFromMapSpecies();

        if (this.props.heatMap) {
            this.MapHelper.updateHeatMap(this.props.heatMap, this.props.treeThreatType);
        }
        if (this.props.diversity) {
            this.MapHelper.updateDiversity(this.props.diversity, this.props.diversityMode, this.props.diversityAttribute);
        }
    }

    addSpeciesFromMapSpecies() {
        console.log("here trying to update the map", this.props.mapSpecies);
        this.MapHelper.speciesImageLinks = this.props.speciesImageLinks;

        if (this.props.data && this.props.mapSpecies) {
            let mapSpeciesData = {};
            this.expetedDistributionQueueLength = Object.keys(this.props.mapSpecies).length;

            for (let species of Object.keys(this.props.mapSpecies)) {

                if (this.props.data.hasOwnProperty(species)) {
                    fetch("/distribution/" + species.replace(" ", "_") + ".geojson")
                        .then(res => res.json())
                        .then(data => {
                            this.pushAndCheckDistributionQueue({ type: "distribution", value: [species, data] });
                        })
                        .catch(e => {

                            let justGenus = false;
                            if (!species.includes(" ")) {
                                justGenus = true;
                            }

                            if (this.props.data.hasOwnProperty(species)) {
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
                                            this.pushAndCheckDistributionQueue({ type: "treeCountries", value: [species, countries, speciesCountries] });
                                            //this.MapHelper.addTreeCountries(species, countries, speciesCountries);
                                        }
                                        else {
                                            this.pushAndCheckDistributionQueue({ type: "treeCountries", value: [species, countries] });
                                            //this.MapHelper.addTreeCountries(species, countries);
                                        }
                                    }
                                    else {
                                        this.pushAndCheckDistributionQueue({});
                                    }

                                    let mapHelper = this.MapHelper;

                                    if (this.props.coordinates !== undefined &&
                                        this.props.coordinates.hasOwnProperty(species) &&
                                        this.props.coordinates[species].length > 0) {
                                        mapHelper.addTreeCoordinates(species, this.props.coordinates[species]);
                                    }
                                }
                                else {
                                    this.pushAndCheckDistributionQueue({});
                                }
                            }

                        });
                }
                else {
                    this.pushAndCheckDistributionQueue({});
                }
            }
        }
    }

    pushAndCheckDistributionQueue(element) {
        this.distributionQueue.push(element);
        if (this.distributionQueue.length >= this.expetedDistributionQueueLength) {
            for (let speciesObj of this.distributionQueue) {
                switch (speciesObj.type) {
                    case "treeCountries":
                        this.MapHelper.addTreeCountries(...speciesObj.value);
                        break;
                    case "distribution":
                        this.MapHelper.addDistribution(...speciesObj.value);
                        break
                    default:
                        break;
                }
            }
            this.distributionQueue = [];
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
        console.log("MOUNT MAP", this.state.id);
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.mapSpecies) !== JSON.stringify(this.props.mapSpecies)) {
            console.log("UPDATE MAP", this.state.id);
            this.addSpeciesFromMapSpecies();
            let newSpecies = Object.keys(this.props.mapSpecies);
            let diff = Object.keys(prevProps.mapSpecies).filter(x => !newSpecies.includes(x));

            this.removeSpeciesByMapSpecies(diff);
            if (this.props.heatMap) {
                this.MapHelper.updateHeatMap(this.props.heatMap, this.props.treeThreatType);
            }
            if (this.props.diversity) {
                this.MapHelper.updateDiversity(this.props.diversity, this.props.diversityMode, this.props.diversityAttribute);
            }
        }

        if (prevProps.heatMap !== this.props.heatMap) {
            if (this.props.heatMap) {
                this.MapHelper.updateHeatMap(this.props.heatMap, this.props.treeThreatType);
            }
        }

        if (prevProps.diversity !== this.props.diversity) {
            console.log("SET", this.props.diversity);

            this.MapHelper.setDiversity(this.props.diversity);

            if (this.props.diversity) {
                this.MapHelper.updateDiversity(this.props.diversity, this.props.diversityMode, this.props.diversityAttribute);
            }
        }

        if (prevProps.treeThreatType !== this.props.treeThreatType) {
            this.MapHelper.setTreeThreatType(this.props.treeThreatType);

            if (this.props.heatMap) {
                this.MapHelper.updateHeatMap(this.props.heatMap, this.props.treeThreatType);
            }
            if (this.props.diversity) {
                this.MapHelper.updateDiversity(this.props.diversity, this.props.diversityMode, this.props.diversityAttribute);
            }
        }

        if (JSON.stringify(prevProps.hoverSpecies) !== JSON.stringify(this.props.hoverSpecies)) {
            this.MapHelper.highlight(this.props.hoverSpecies);
        }
    }

    render() {
        return (
            <div>
                <div id={this.state.id} style={{
                    height: "50vh",
                    width: "70vw"
                }}></div>
            </div>
        );
    }
}

export default Map;