import React, { Component } from "react";
/* import MapHelper from "./MapHelper"; */
import MapHelper from "./MapHelper";
import "../utils/utils";

class Map extends Component {
  constructor(props) {
    super(props);

    this.treeCoordinates = {};
    this.treeCoordinateQueue = [];

    this.distributionQueue = [];
    this.expetedDistributionQueueLength = [];
    this.processedDistributionQueue = [];

    this.state = {
      id: this.props.id
    };
  }

  init() {
    this.treeCoordinateQueue = [];
    this.MapHelper = new MapHelper(
      this.state.id,
      this.props.getTreeThreatLevel,
      this.props.initWidth,
      this.props.setDiversityScale,
      this.props.treeThreatType,
      this.props.setFilter,
      this.props.colorBlind,
      this.props.setMapSearchBarData,
      this.props.lastSpeciesThreats
    );

    this.addSpeciesFromMapSpecies();

    if (this.props.heatMap) {
      this.MapHelper.updateHeatMap(
        this.props.heatMap,
        this.props.treeThreatType,
        this.props.colorBlind
      );
    }
    if (this.props.diversity) {
      this.MapHelper.updateDiversity(
        this.props.diversity,
        this.props.diversityMode,
        this.props.diversityAttribute
      );
    }
  }

  setProcessedSpecies(speciesName) {
    this.processedDistributionQueue.push(speciesName);
    if (
      this.processedDistributionQueue.length >=
      this.expetedDistributionQueueLength
    ) {
      this.MapHelper.updateDiversity(
        this.props.diversity,
        this.props.diversityMode,
        this.props.diversityAttribute
      );
      this.MapHelper.updateHeatMap(
        true,
        this.props.treeThreatType,
        this.props.colorBlind
      );
    }
  }

  addSpeciesFromMapSpecies() {
    console.log("addSpeciesFromMapSpecies", this.props.mapSpecies);

    //this.MapHelper.speciesImageLinks = this.props.speciesImageLinks;
    let speciesCountries = {};
    let speciesEcoRegions = {};
    let speciesHexagons = {};

    if (this.props.data && this.props.mapSpecies) {
      let mapSpeciesData = {};
      this.expetedDistributionQueueLength = 0;
      this.processedDistributionQueue = [];

      for (let species of Object.keys(this.props.mapSpecies)) {
        if (this.props.data.hasOwnProperty(species)) {
          let countries = [];
          if (this.props.data[species].hasOwnProperty("treeCountriesShort")) {
            countries = this.props.data[species]["treeCountriesShort"];
          } else {
            if (this.props.data[species].hasOwnProperty("iucnCountriesShort")) {
              countries = this.props.data[species]["iucnCountriesShort"];
            } else {
              if (this.props.data[species].hasOwnProperty("allCountries")) {
                countries = this.props.data[species]["allCountries"];
              }
            }
          }
          /* let countries = [];
          if (this.props.data[species].hasOwnProperty("treeCountries")) {
            countries.push(
              ...Object.keys(this.props.data[species]["treeCountries"])
            );
          }

          if (countries.length > 0) {
            speciesCountries[species] = countries;
          } else {
            if (this.props.data[species].hasOwnProperty("iucnCountries")) {
              countries.push(
                ...this.props.data[species]["iucnCountries"][species].map(
                  (e) => e.country
                )
              );
            }
          } */

          if (countries.length > 0) {
            speciesCountries[species] = countries;
          }

          if (this.props.data[species].hasOwnProperty("ecoregions")) {
            let ecoRegions = this.props.data[species]["ecoregions"];

            if (ecoRegions.length > 0) {
              speciesEcoRegions[species] = ecoRegions;
            }
          }

          if (
            this.props.data[species].hasOwnProperty("hexagons") &&
            ![
              "Balaena",
              "Eubalaena",
              "Balaenoptera",
              "Megaptera",
              "Eretmochelys",
              "Eschrichtius",
              "Fontitrygon",
              "Haliotis",
              "Monodon",
              "Odebenus",
              "Pinctada",
              "Salmo",
              "Sepia"
            ].includes(this.props.data[species]["Genus"].trim())
          ) {
            let hexagons = this.props.data[species]["hexagons"];

            if (hexagons.length > 0) {
              speciesHexagons[species] = hexagons;
            }
          }

          /* if (this.props.data[species].hasOwnProperty("ecoZones")) {
            let ecoZones = Object.keys(this.props.data[species]["ecoZones"]);

            if (ecoZones.length > 0) {
              this.pushAndCheckDistributionQueue({
                type: "ecoRegions",
                value: [species, ecoZones]
              });
            }
          }

          if (this.props.data[species].hasOwnProperty("hexagons")) {
            let hexagons = this.props.data[species]["hexagons"];
            if (hexagons.length > 0) {
              this.pushAndCheckDistributionQueue({
                type: "hexagons",
                value: [species, hexagons]
              });
            }
          } */
        }
      }
    }
    if (this.props.country) {
      this.MapHelper.setSelected(
        "countries",
        {
          properties: { ...this.props.country }
        },
        true
      );
    } else {
      this.MapHelper.setSelected("countries", null, true);
    }
    this.MapHelper.setSpeciesCountries(speciesCountries);
    this.MapHelper.setEcoRegions(speciesEcoRegions);
    this.MapHelper.setSpeciesHexagons(speciesHexagons);
    this.MapHelper.updateDiversityPolygons();
    this.MapHelper.updateThreatPies();
    //this.MapHelper.updateEcoRegions();
    //this.MapHelper.updateHexagons();
  }

  OldaddSpeciesFromMapSpecies() {
    this.MapHelper.speciesImageLinks = this.props.speciesImageLinks;

    if (this.props.data && this.props.mapSpecies) {
      let mapSpeciesData = {};
      this.expetedDistributionQueueLength = 0;
      this.processedDistributionQueue = [];

      for (let species of Object.keys(this.props.mapSpecies)) {
        if (this.props.data.hasOwnProperty(species)) {
          let justGenus = false;
          if (!species.includes(" ")) {
            justGenus = true;
          }

          if (this.props.data.hasOwnProperty(species)) {
            if (this.props.data[species].hasOwnProperty("treeCountries")) {
              let countries = Object.keys(
                this.props.data[species]["treeCountries"]
              );

              if (countries.length > 0) {
                if (justGenus) {
                  let speciesCountries = {};
                  let acceptedTreeSpecies = Object.keys(
                    this.props.data[species]["speciesNamesAndSyns"]
                  );
                  for (let treeName of Object.keys(
                    this.props.data[species]["speciesCountries"]
                  )) {
                    if (acceptedTreeSpecies.includes(treeName)) {
                      speciesCountries[treeName] =
                        this.props.data[species]["speciesCountries"][treeName];
                    }
                  }
                  this.pushAndCheckDistributionQueue({
                    type: "treeCountries",
                    value: [species, countries, speciesCountries]
                  });
                  //this.MapHelper.addTreeCountries(species, countries, speciesCountries);
                } else {
                  this.pushAndCheckDistributionQueue({
                    type: "treeCountries",
                    value: [species, countries]
                  });
                  //this.MapHelper.addTreeCountries(species, countries);
                }
              } else {
                //this.pushAndCheckDistributionQueue({});
              }

              let mapHelper = this.MapHelper;

              if (
                this.props.coordinates !== undefined &&
                this.props.coordinates.hasOwnProperty(species) &&
                this.props.coordinates[species].length > 0
              ) {
                mapHelper.addTreeCoordinates(
                  species,
                  this.props.coordinates[species]
                );
              }
            } else {
              //this.pushAndCheckDistributionQueue({});
            }

            if (this.props.data[species].hasOwnProperty("ecoZones")) {
              let ecoZones = Object.keys(this.props.data[species]["ecoZones"]);

              if (ecoZones.length > 0) {
                this.pushAndCheckDistributionQueue({
                  type: "ecoRegions",
                  value: [species, ecoZones]
                });
              }
            }

            if (this.props.data[species].hasOwnProperty("hexagons")) {
              let hexagons = this.props.data[species]["hexagons"];
              if (hexagons.length > 0) {
                this.pushAndCheckDistributionQueue({
                  type: "hexagons",
                  value: [species, hexagons]
                });
              }
            }
          }
        } else {
          //this.pushAndCheckDistributionQueue({});
        }
      }
    }
  }

  pushAndCheckDistributionQueue(element) {
    this.expetedDistributionQueueLength =
      this.expetedDistributionQueueLength + 1;
    this.distributionQueue.push(element);
    if (this.distributionQueue.length > 0) {
      for (let speciesObj of this.distributionQueue) {
        switch (speciesObj.type) {
          case "treeCountries":
            this.MapHelper.addTreeCountries(...speciesObj.value);
            break;
          case "distribution":
            this.MapHelper.addDistribution(...speciesObj.value);
            break;
          case "ecoRegions":
            this.MapHelper.addSpeciesEcoRegions(...speciesObj.value);
            break;
          case "hexagons":
            this.MapHelper.addSpeciesHexagons(...speciesObj.value);
            break;
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
      /* this.MapHelper.removeSpeciesEcoRegions(species); */
    }
  }

  componentDidMount() {
    this.init();
    console.log("MOUNT MAP", this.state.id);
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.mapSpecies) !==
        JSON.stringify(this.props.mapSpecies) ||
      JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)
    ) {
      this.addSpeciesFromMapSpecies();
    }

    if (
      JSON.stringify(this.props.lastSpeciesThreats) !==
      JSON.stringify(prevProps.lastSpeciesThreats)
    ) {
      this.MapHelper.setLastSpeciesThreats(this.props.lastSpeciesThreats);
    }

    if (
      JSON.stringify(this.props.colorBlind) !==
      JSON.stringify(prevProps.colorBlind)
    ) {
      this.MapHelper.updateColorBlind(this.props.colorBlind);
    }

    if (prevProps.heatMap !== this.props.heatMap) {
      if (this.props.heatMap) {
        this.MapHelper.updateHeatMap(
          this.props.heatMap,
          this.props.treeThreatType
        );
      }
    }

    if (prevProps.diversity !== this.props.diversity) {
      this.MapHelper.setDiversity(this.props.diversity);

      if (this.props.diversity) {
        this.MapHelper.updateDiversity(
          this.props.diversity,
          this.props.diversityMode,
          this.props.diversityAttribute
        );
      }
    }

    if (prevProps.treeThreatType !== this.props.treeThreatType) {
      this.MapHelper.setTreeThreatType(this.props.treeThreatType);

      /* this.MapHelper.updateHeatMap(
        this.props.heatMap,
        this.props.treeThreatType
      );
      this.MapHelper.updateDiversity(
        this.props.diversity,
        this.props.diversityMode,
        this.props.diversityAttribute
      ); */
    }

    /*   if (
      JSON.stringify(prevProps.hoverSpecies) !==
      JSON.stringify(this.props.hoverSpecies)
    ) {
      this.MapHelper.highlight(this.props.hoverSpecies);
    } */
  }

  render() {
    return (
      <div>
        <div
          id={this.state.id}
          style={{
            height: "calc(50vh - 85px)",
            width: "calc(50vw - 10px)"
          }}
        ></div>
      </div>
    );
  }
}

export default Map;
