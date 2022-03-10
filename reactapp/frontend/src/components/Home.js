import React, { Component, useEffect } from "react";
import Orchestra from "./Orchestra";
import BarChartView from "./BarChartView";
import TreeMap from "./TreeMap";
import Legend from "./Legend";
import CenterPieChart from "./CenterPieChart";
import SearchBar from "./SearchBar";
import TimelineView from "./TimelineView";
import {
  getOrCreate,
  iucnToDangerMap,
  dangerSorted,
  pushOrCreate,
  pushOrCreateWithoutDuplicates,
  getThreatColor,
  replaceSpecialCharacters
} from "../utils/utils";
import {
  iucnScore,
  threatScore,
  citesScore,
  citesScoreReverse,
  threatScoreReverse,
  citesAppendixSorted,
  iucnColors,
  getCitesColor,
  getIucnColor,
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";
import Map from "./Map";
import {
  cluster,
  json,
  scaleLog,
  scalePoint,
  thresholdScott,
  treemap
} from "d3";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

class Home extends Component {
  constructor(props) {
    super(props);

    this.usePreGenerated = true;
    this.renderMap = true;
    this.renderTreeMap = true;
    this.slice = false;

    this.tempSpeciesData = {};
    this.tempFetchedSpecies = [];
    this.tmpSpeciesDataCache = {};
    this.species = {};

    let tabs = {
      maps: { diversityMapTab: true, threatMapTab: false },
      charts: { barChartTab: true, treeMapTab: false }
    };

    this.state = {
      species: [],
      speciesData: {},
      instrumentGroup: props.instrumentGroup,
      /* instrumentGroup: "Strings", */
      instrument: props.instrument,
      /* instrument: "String instrument bow", */
      mainPart: props.mainPart,
      mainPartList: [],
      mapSpecies: {},
      speciesSignThreats: {},
      pieStyle: "pie",
      groupSame: true,
      sortGrouped: "trend",
      heatStyle: "dom",
      addAllCountries: true,
      heatMap: false,
      diversity: true,
      initWidthForVis: parseInt(Math.floor(window.innerWidth / 2)) - 50,
      fetchedSpecies: [],
      finishedFetching: false,
      diversityScale: [],
      treeThreatType: true,
      diversityMode: true,
      isDiv: true,
      isThreat: false,
      tabs: tabs,
      hoverSpecies: [],
      timeFrame: [],
      speciesDataCache: {},
      population: [],
      filterSettings: {}
    };
  }

  resetFilterSettings(category) {
    let filterSettings = { ...this.state.filterSettings };
    if (category) {
      filterSettings[category] = null;
    } else {
      filterSettings = {};
    }

    this.setState({ filterSettings });
  }

  setFilter(obj) {
    let newSettings = { ...this.state.filterSettings };

    for (let cat of Object.keys(obj)) {
      newSettings[cat] = obj[cat];
    }

    this.setState({ filterSettings: newSettings });
  }

  importAllSpeciesFromGeneratedJSON() {
    fetch("/generatedOutput/allSpecies.json")
      .then((res) => res.json())
      .then(
        function (speciesData) {
          speciesData = Object.fromEntries(
            Object.entries(speciesData).slice(
              0,
              this.slice ? 70 : Object.keys(speciesData).length
            )
          );
          let newMapData = {};
          for (let speciesName of Object.keys(speciesData)) {
            newMapData[speciesName] = 1;
          }

          this.setState({
            speciesData: speciesData,
            mapSpecies: newMapData,
            speciesDataCache: speciesData,
            finishedFetching: true
          });
        }.bind(this)
      )
      .catch((error) => {
        console.log(`Couldn't find file allSpecies.json`, error);
      });
  }

  setTimeFrame(timeFrame) {
    if (
      timeFrame[0] !== this.state.timeFrame[0] ||
      timeFrame[1] !== this.state.timeFrame[1]
    ) {
      this.setState({ timeFrame });
    }
  }

  readAndSetWoodMap() {
    fetch("/data/woodMapData.json")
      .then((res) => {
        return res.json();
      })
      .then(
        function (data) {
          this.woodMap = data;
        }.bind(this)
      );
  }

  componentDidMount() {
    if (this.usePreGenerated) {
      this.importAllSpeciesFromGeneratedJSON();
    }
    /* this.readAndSetWoodMap();*/
    this.fetchAndSetSpecies();
  }

  componentDidUpdate(prevProps) {
    /* this.setState(); */

    if (this.state.finishedFetching) {
      this.onFishishFetching();
    }

    /* if(JSON.stringify(this.state.speciesSignThreats) !== JSON.stringify(prevProps.speciesSignThreats) ) {
            console.log("HERE!");
            this.setState();
        } */
  }

  onFishishFetching() {
    let index = 0;
    for (let species of Object.keys(this.state.speciesData)) {
      let speciesEntry = this.state.speciesData[species];
      let genus = speciesEntry.Genus;
      let speciesName = speciesEntry.Species;
      let signThreat = this.getSpeciesSignThreats(species);

      /* this.saveSpeciesSignThreatsToDB(genus, speciesName, signThreat, index); */
      index++;
    }
  }

  setHeatStyle(setValue) {
    this.setState({ heatStyle: setValue });
  }

  onHeatStyle(style) {
    this.setHeatStyle(style);
  }

  setPieStyle(setValue) {
    this.setState({ pieStyle: setValue });
  }

  onPieStyle(style) {
    this.setPieStyle(style);
  }

  setGroupSame(setValue) {
    this.setState({ groupSame: setValue });
  }

  onGroupSame(style) {
    this.setGroupSame(style);
  }

  setSortGrouped(setValue) {
    this.setState({ sortGrouped: setValue });
  }

  onSortGrouped(style) {
    this.setSortGrouped(style);
  }

  setInstrumentGroup(instrumentGroup) {
    this.setState({ instrumentGroup, instrument: "", mainPart: "" });
    this.fetchAndSetSpecies();
  }

  setInstrument(instrument) {
    this.setState({ instrument: instrument, mainPart: "" });
    this.getMainParts(instrument);
  }

  onSelectChange(event) {
    this.setMainPart(event.target.value);
  }

  setMainPart(mainPart) {
    this.setState({ mainPart: mainPart });
    this.fetchAndSetSpecies();
  }

  setInstrumentAndMainPart(instrument, mainPart) {
    this.setState({ instrument, mainPart });
    this.fetchAndSetSpecies();
  }

  getMainParts(instrument) {
    let setMainPartList = this.setMainPartList.bind(this);
    fetch("/api/getMainParts/" + instrument)
      .then((res) => res.json())
      .then(function (data) {
        let options = ["All"];
        options.push(...data.map((e) => e["Main part"]));
        setMainPartList(options);
      });
  }

  setMainPartList(mainParts) {
    this.setState({
      ...this.state,
      mainPartList: mainParts,
      mainPart: mainParts[0]
    });
    this.fetchAndSetSpecies();
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  addAllCountries() {
    let newMapSpecies = {};
    for (let species of Object.keys(this.state.speciesData)) {
      newMapSpecies[species] = 1;
    }
    this.setState({ mapSpecies: newMapSpecies, addAllCountries: true });
  }

  removeAllCountries() {
    this.setState({ mapSpecies: {}, addAllCountries: false });
  }

  activateHeatMap() {
    this.setState({ diversity: false, heatMap: true });
  }

  deactivateHeatMap() {
    this.setState({ heatMap: false });
  }

  toggleTreeThreatType() {
    this.setState({ treeThreatType: !this.state.treeThreatType });
  }

  setTreeThreatType(val) {
    this.setState({ treeThreatType: val });
  }

  toggleDiversityMapMode() {
    this.setState({ diversityMode: !this.state.diversityMode });
  }

  activateDiversity() {
    this.setState({ diversity: true, heatMap: false });
  }

  deactivateDiversity() {
    this.setState({ diversity: false });
  }

  generateTreeMapData(input) {
    let kingdomGroupData = {};

    for (let species of Object.keys(input)) {
      if (this.state.speciesData.hasOwnProperty(species)) {
        getOrCreate(
          kingdomGroupData,
          this.state.speciesData[species]["Kingdom"],
          []
        ).push(this.state.speciesData[species]);
      }
    }

    for (let kingdom of Object.keys(kingdomGroupData)) {
      let subgroupData = {};
      let speciesInKingdom = kingdomGroupData[kingdom];
      for (let species of speciesInKingdom) {
        let groups = species["groups"];
        let subgroups = species["instruments"];

        /*    for (let entry of species["origMat"]) {
                    entry["Family"] = entry["Family"].trim();
                    if (entry["Family"] !== "") {
                        entry["Genus"] = entry["Genus"].trim();
                        if (entry["Genus"] !== "") {
                            pushOrCreate(getOrCreate(subgroupData, entry["Family"], {}), entry["Genus"].trim(), 1);
                        }
                    }
                }   */
        for (let entry of species["origMat"]) {
          entry["Family"] = entry["Family"].trim();
          if (entry["Family"] !== "") {
            entry["Genus"] = entry["Genus"].trim();
            if (entry["Genus"] !== "") {
              //if (entry["main used material"] === "1")
              pushOrCreateWithoutDuplicates(
                getOrCreate(
                  getOrCreate(subgroupData, entry["Family"], {}),
                  entry["Genus"],
                  {}
                ),
                entry["Genus"].trim() + " " + entry["Species"].trim(),
                entry["Genus"].trim() + " " + entry["Species"].trim()
              );
            }
          }
        }
      }
      kingdomGroupData[kingdom] = subgroupData;
    }

    let returnImageLink = (speciesObj) => {
      if (speciesObj["Foto assigment"] !== "") {
        let photos = speciesObj["Foto assigment"].split("|");
        if (photos.length > 0) {
          if (speciesObj["Family"] === "Balaenidae") {
            return "fotos/" + photos[1];
          }
          return "fotos/" + photos[0].replace(" ", "");
        }
      }
      return null;
    };

    let imageLinks = {};

    let treeMap = [];
    for (let kingdom of Object.keys(kingdomGroupData)) {
      let subgroupData = kingdomGroupData[kingdom];
      let familyData = [];
      for (let family of Object.keys(subgroupData)) {
        let treeMapData = [];
        let genusData = [];
        for (let group of Object.keys(subgroupData[family])) {
          let sum = 0;
          let valueObjects = [];
          for (let value of Object.keys(subgroupData[family][group])) {
            let valueObject = {};
            valueObject["name"] = value;
            valueObject["species"] = value;
            valueObject["kingdom"] = this.state.speciesData[value].Kingdom;
            valueObject["ecologically"] = this.getSpeciesThreatLevel(
              value,
              "ecologically"
            );
            valueObject["economically"] = this.getSpeciesThreatLevel(
              value,
              "economically"
            );
            valueObject["colname"] = "level4";
            valueObject["value"] = subgroupData[family][group][value].length;

            valueObject["link"] = returnImageLink(
              this.state.speciesData[value]
            );

            //if (valueObject["link"] !== null) {
            sum += valueObject[value];
            valueObjects.push(valueObject);
            //}

            imageLinks[valueObject["name"]] = valueObject["link"];
          }

          if (valueObjects.length > 0)
            genusData.push({
              children: valueObjects,
              name: group,
              genus: group,
              sum,
              colname: "level3"
            });
        }
        familyData.push({
          children: genusData,
          name: family,
          kingodm: kingdom,
          family: family,
          sum: genusData.length,
          colname: "level2"
        });
      }
      treeMap.push({
        children: familyData,
        name: kingdom,
        kingdom: kingdom,
        sum: familyData.length,
        colname: "level1"
      });
    }

    return [{ name: "Kingdoms", children: treeMap }, imageLinks];
  }

  generateBarChartDataAllTypes(input) {
    let overAllGrouped = [];
    let barChartData = { cites: [], iucn: [], threat: [] };
    let showIcons = true;

    for (let type of Object.keys(barChartData)) {
      barChartData[type] = this.generateBarChartData(input, type);
      let [grouped, tmpIcons] = this.generateGroupedBarChartData(input, type);
      showIcons = tmpIcons;
      barChartData[type + "Grouped"] = grouped;
      for (let entry of grouped.values()) {
        let tmpEntry = { ...entry };
        tmpEntry.type = type;
        overAllGrouped.push(tmpEntry);
      }
    }

    barChartData["overAllGrouped"] = overAllGrouped;

    barChartData["cites"] = barChartData["cites"].filter(
      (e) => e.category !== "DD" && e.category !== null
    );

    return [barChartData, showIcons];
  }

  generateBarChartData(input, type) {
    let barChartData = {};

    for (let species of Object.keys(input)) {
      if (
        this.state.hoverSpecies.length > 0 &&
        !this.state.hoverSpecies.includes(species)
      ) {
        continue;
      }
      let value = input[species][type];
      if (value !== null && value !== "null")
        pushOrCreate(barChartData, value, 1);
    }

    let newBarChartData = [];
    for (let value of Object.keys(barChartData)) {
      newBarChartData.push({
        category: value,
        value: barChartData[value].length
      });
    }

    return newBarChartData;
  }

  generateGroupedBarChartData(input, type) {
    let barChartData = {};
    let subgroupData = {};
    let showIcons = true;

    for (let species of Object.keys(input)) {
      if (
        this.state.hoverSpecies.length > 0 &&
        !this.state.hoverSpecies.includes(species)
      ) {
        continue;
      }

      if (this.state.speciesData.hasOwnProperty(species)) {
        let value = input[species][type];

        if (value === null) continue;

        let groups = this.state.speciesData[species]["groups"];
        let subgroups = this.state.speciesData[species]["instruments"];
        for (let group of groups) {
          if (group !== "")
            pushOrCreate(getOrCreate(barChartData, group, {}), value, 1);
        }

        for (let subgroup of subgroups) {
          if (subgroup !== "")
            pushOrCreate(getOrCreate(subgroupData, subgroup, {}), value, 1);
        }
      }
    }

    if (Object.keys(barChartData).length === 1) {
      barChartData = subgroupData;
      showIcons = false;
    }

    let newBarChartData = [];
    for (let group of Object.keys(barChartData)) {
      let valueObject = {};
      let sum = 0;
      for (let value of Object.keys(barChartData[group])) {
        valueObject[value] = barChartData[group][value].length;
        sum += valueObject[value];
      }
      newBarChartData.push({ ...valueObject, group: group, sum });
    }

    return [newBarChartData, showIcons];
  }

  addSpeciesToMap(species) {
    let newMapSpecies = { ...this.state.mapSpecies };
    newMapSpecies[species] = 1;

    this.setState({ mapSpecies: newMapSpecies });
  }

  removeSpeciesFromMap(species) {
    let newMapSpecies = { ...this.state.mapSpecies };
    delete newMapSpecies[species];

    this.setState({ mapSpecies: newMapSpecies });
  }

  resetSpeciesData() {
    this.tempSpeciesData = {};
    this.tempFetchedSpecies = [];
  }

  createSpeciesTable() {
    fetch("/api/getAllMaterials")
      .then((res) => res.json())
      .then((data) => {
        let speciesTable = {};
        for (let e of data) {
          if (e.Species.trim() === "") continue;

          let speciesName = (e.Genus.trim() + " " + e.Species.trim()).trim();
          if (speciesTable.hasOwnProperty(speciesName)) {
            speciesTable[speciesName]["origMat"].push({ ...e });

            if (
              !speciesTable[speciesName]["groups"].includes(
                e["Instrument_groups"]
              )
            ) {
              speciesTable[speciesName]["groups"].push(e["Instrument_groups"]);
            }

            if (
              !speciesTable[speciesName]["instruments"].includes(
                e["Instruments"]
              )
            ) {
              speciesTable[speciesName]["instruments"].push(e["Instruments"]);
            }

            if (
              !speciesTable[speciesName]["main_parts"].includes(e["Main_part"])
            ) {
              speciesTable[speciesName]["main_parts"].push(e["Main_part"]);
            }
          } else {
            e["origMat"] = [{ ...e }];
            e["groups"] = [e["Instrument_groups"]];
            e["instruments"] = [e["Instruments"]];
            e["main_parts"] = [e["Main_part"]];
            speciesTable[speciesName] = e;
          }
        }
      });
  }

  fetchAndSetSpecies() {
    let url, mainPart;
    mainPart = this.state.mainPart === "All" ? "" : this.state.mainPart;

    if (
      this.state.instrument === "Test (all)" ||
      this.state.instrumentGroup === undefined
    ) {
      url = "/api/getAllMaterials";
    } else {
      url = "/api/getMaterial/" + this.state.instrumentGroup;
      if (this.state.instrument !== "") {
        url += "/" + this.state.instrument;
      }

      if (mainPart !== "") {
        url += "/" + mainPart;
      }
    }

    //fetch("/api/getMaterial/" + this.state.instrument + "/" + this.state.mainPart)
    //fetch("/api/getTestMaterial")
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let speciesObject = {};
        for (let e of data) {
          //for (let e of data) {
          /* for (let e of data) { */
          if (e.Species.trim() === "") continue;

          let speciesName = (e.Genus.trim() + " " + e.Species.trim()).trim();
          if (speciesObject.hasOwnProperty(speciesName)) {
            speciesObject[speciesName]["origMat"].push({ ...e });

            if (
              !speciesObject[speciesName]["groups"].includes(
                e["Instrument_groups"]
              )
            ) {
              speciesObject[speciesName]["groups"].push(e["Instrument_groups"]);
            }

            if (
              !speciesObject[speciesName]["instruments"].includes(
                e["Instruments"]
              )
            ) {
              speciesObject[speciesName]["instruments"].push(e["Instruments"]);
            }

            if (
              !speciesObject[speciesName]["main_parts"].includes(e["Main_part"])
            ) {
              speciesObject[speciesName]["main_parts"].push(e["Main_part"]);
            }
          } else {
            e["origMat"] = [{ ...e }];
            e["groups"] = [e["Instrument_groups"]];
            e["instruments"] = [e["Instruments"]];
            e["main_parts"] = [e["Main_part"]];
            speciesObject[speciesName] = e;
          }
        }

        speciesObject = Object.fromEntries(
          Object.entries(speciesObject).slice(
            0,
            this.slice ? 70 : Object.keys(speciesObject).length
          )
        );
        this.setSpecies(speciesObject);
      });
  }

  fetchSpeciesTrades(species) {
    fetch("/data/" + replaceSpecialCharacters(species) + "_trades.json")
      .then((res) => {
        return res.json();
      })
      .then(
        function (data) {
          let newSpeciesData = { ...this.state.speciesTrades };

          newSpeciesData[species] = data;
          this.setState({
            speciesTrades: newSpeciesData
          });
        }.bind(this)
      );
    /*.catch((error) => {
            console.log(`Couldn't find file ${species.trim().replaceSpecialCharacters()}"_trades.json`);
        });*/
  }

  fetchSpeciesThreats(species) {
    fetch("/data/" + replaceSpecialCharacters(species) + "_threats.json")
      .then((res) => {
        return res.json();
      })
      .then(
        function (data) {
          if (data) {
            let newSpeciesData = { ...this.speciesData };

            let newData = getOrCreate(newSpeciesData, species, {});

            newSpeciesData[species] = { ...newData, threats: data };

            this.speciesData = newSpeciesData;
            this.tempFetchedSpecies.push(species);
            this.checkFetching();

            /* if (newFetchedSpecies.length >= Object.keys(newSpeciesData).length * 2) { */
            /*   this.setState({
                            speciesData: newSpeciesData,
                            fetchedSpecies: newFetchedSpecies,
                            finishedFetching: false
                        }); */
            /* }
                    else {

                    } */
          }
        }.bind(this)
      )
      .catch(
        function (error) {
          console.log(
            `Couldn't find file ${replaceSpecialCharacters(
              species.trim()
            )}_threats.json`
          );
          let newSpeciesData = { ...this.speciesData };

          let newData = getOrCreate(newSpeciesData, species, {});

          newSpeciesData[species] = { ...newData };

          this.speciesData = newSpeciesData;
          this.tempFetchedSpecies.push(species);
          this.checkFetching();
        }.bind(this)
      );
  }

  fetchSpeciesData(species) {
    let fetchSpeciesOccurrencesBound = this.fetchSpeciesOccurrences.bind(this);
    fetch("/data/" + replaceSpecialCharacters(species.trim()) + ".json")
      .then((res) => res.json())
      .then(
        function (data) {
          if (data) {
            let newSpeciesData = { ...this.speciesData };

            let newData = getOrCreate(newSpeciesData, species, {});

            newSpeciesData[species] = { ...newData, ...data };

            this.speciesData = newSpeciesData;
            this.tempFetchedSpecies.push(species);
            this.checkFetching();

            //fetchSpeciesOccurrencesBound(species, data.species);

            /*                     this.setState({
                        speciesData: newSpeciesData,
                        fetchedSpecies: newFetchedSpecies,
                        finishedFetching: false
                    }); */
          }
        }.bind(this)
      )
      .catch(
        function (error) {
          console.log(
            `Couldn't find file ${replaceSpecialCharacters(
              species.trim()
            )}.json`
          );
          let newSpeciesData = { ...this.speciesData };

          let newData = getOrCreate(newSpeciesData, species, {});

          newSpeciesData[species] = { ...newData };

          this.speciesData = newSpeciesData;
          this.tempFetchedSpecies.push(species);
          this.checkFetching();
        }.bind(this)
      );
  }

  checkAndSet(species, data) {
    let newSpeciesData = { ...this.state.speciesData, ...this.tempSpeciesData };

    let newData = getOrCreate(newSpeciesData, species, {});

    newSpeciesData[species] = { ...newData, ...data };

    this.tmpSpeciesDataCache = {
      ...this.state.speciesDataCache,
      ...this.tmpSpeciesDataCache
    };
    this.tmpSpeciesDataCache[species] = newSpeciesData[species];

    let newFetchedSpecies = [
      ...this.state.fetchedSpecies,
      ...this.tempFetchedSpecies,
      species
    ];

    //fetchSpeciesOccurrencesBound(species, data.species);

    this.tempSpeciesData = newSpeciesData;
    this.tempFetchedSpecies = newFetchedSpecies;

    if (newFetchedSpecies.length >= Object.keys(newSpeciesData).length) {
      let newMapSpecies = {};
      Object.keys(newSpeciesData).forEach((e) => {
        return (newMapSpecies[e] = 1);
      });
      this.setState({
        speciesData: this.tempSpeciesData,
        fetchedSpecies: this.tempFetchedSpecies,
        finishedFetching: true,
        mapSpecies: newMapSpecies,
        speciesDataCache: this.tmpSpeciesDataCache
      });
    }
  }

  checkFetching() {
    if (
      Object.keys(this.state.species).length * 2 <=
      this.tempFetchedSpecies.length
    ) {
      this.setState({
        speciesData: this.speciesData,
        fetchedSpecies: this.tempFetchedSpecies,
        finishedFetching: true
      });
    }
  }

  fetchAllSpeciesData(species) {
    fetch(
      "/generatedOutput/" + replaceSpecialCharacters(species.trim()) + ".json"
    )
      .then((res) => res.json())
      .then(
        function (data) {
          if (data) {
            this.checkAndSet(species, data);
          }
        }.bind(this)
      )
      .catch((error) => {
        console.log(
          `Couldn't find file ${replaceSpecialCharacters(species.trim())}.json`,
          error
        );
        this.checkAndSet(species, {});
      });
  }

  fetchSpeciesOccurrences(species, speciesObject) {
    let callback = function (data) {
      let coordinates = data.map((entry) => {
        return [
          parseInt(entry.decimalLatitude),
          parseInt(entry.decimalLongitude)
        ];
      });

      let newSpeciesData = { ...this.state.speciesOccurrences };

      newSpeciesData[species] = coordinates;
      this.setState({
        speciesOccurrences: newSpeciesData
      });
    }.bind(this);

    if (species.includes(" ")) {
      let speciesKeys = Object.values(speciesObject).map(
        (entry) => entry.speciesKey
      );
      fetch("/api/getTreeOccurrences/species", {
        body: JSON.stringify(speciesKeys),
        method: "POST",
        headers: {
          "Content-Type": "slication/json"
        }
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          callback(data);
        });
    } else {
      fetch("/api/getTreeOccurrences/genus/" + species)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          /* map.treeCoordinates[species] = data;
     
                    let coordinates = data.map(entry => {
                        return [parseInt(entry.decimalLatitude), parseInt(entry.decimalLongitude)];
                    });
     
                    if (coordinates.length > 0) {
                        mapHelper.addTreeCoordinates(species, coordinates);
                    }
     
                    setTimeout(boundCallback, 5); */
          callback(data);
        });
    }
  }

  setSpecies(speciesObject) {
    let speciesDataCache = {
      ...this.state.speciesDataCache,
      ...this.state.speciesData
    };

    let species = Object.keys(speciesObject);

    this.resetSpeciesData();
    this.speciesData = speciesObject;
    this.setState({
      speciesData: speciesObject,
      species: species,
      mapSpecies: {},
      addAllCountries: false,
      fetchedSpecies: []
    });

    for (let spec of species) {
      if (speciesDataCache.hasOwnProperty(spec)) {
        let tmpSpecData = speciesDataCache[spec];
        tmpSpecData.groups = speciesObject[spec].groups;
        tmpSpecData.instruments = speciesObject[spec].instruments;
        tmpSpecData.origMat = speciesObject[spec].origMat;
        this.checkAndSet(spec, tmpSpecData);
      } else {
        if (this.usePreGenerated) {
          this.fetchAllSpeciesData(spec);
        } else {
          this.fetchSpeciesData(spec);
          this.fetchSpeciesThreats(spec);
        }
      }
      //this.fetchSpeciesTrades(spec);
    }
  }

  saveSpeciesSignThreatsToDB(genus, species, signThreats, index) {
    setTimeout(() => {
      fetch("/api/saveThreatSignToDB", {
        body: JSON.stringify({ genus, species, signThreats }),
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });
    }, index * 10);
  }

  setSpeciesSignThreats(key, subkey, value) {
    let speciesSignThreats = this.state.speciesSignThreats;
    if (speciesSignThreats.hasOwnProperty(key)) {
      if (speciesSignThreats[key][subkey] !== value) {
        speciesSignThreats[key][subkey] = value;

        this.setState({ speciesSignThreats: speciesSignThreats });
      }
    } else {
      let speciesSignThreats = this.state.speciesSignThreats;
      speciesSignThreats[key] = { cites: null, iucn: null, threat: null };
      speciesSignThreats[key][subkey] = value;

      this.setState({ speciesSignThreats: speciesSignThreats });
    }
  }

  getSpeciesSignThreats(species) {
    if (this.state.speciesSignThreats.hasOwnProperty(species)) {
      let returnElement = this.state.speciesSignThreats[species];
      return returnElement;
    } else {
      return { cites: null, iucn: null, threat: null };
    }
  }

  getSpeciesThreatLevel(treeName, type = null) {
    let threatsSigns = this.getSpeciesSignThreats(treeName);
    switch (type) {
      case "economically":
        return citesAssessment.get(threatsSigns.cites);
      case "ecologically":
        if (threatsSigns.iucn !== null) {
          return iucnAssessment.get(threatsSigns.iucn);
        } else {
          return bgciAssessment.get(threatsSigns.threat);
        }
      default:
        let sumScore =
          0.5 * Math.max(citesScore(threatsSigns.cites), 0) +
          0.5 *
            Math.max(
              iucnScore(threatsSigns.iucn),
              threatScore(threatsSigns.threat),
              0
            );
        let sumCat = threatScoreReverse(sumScore);
        return sumCat;
    }
  }

  save() {
    let file = new Blob([JSON.stringify(this.state.speciesData, null, 4)], {
      type: "application/json"
    });
    let filename = "generatedData.json";
    if (window.navigator.msSaveOrOpenBlob)
      // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      // Others
      let a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  renderMapScale(scale) {
    let scaleElements = [];

    //let width =
    let col = 1;

    for (let scaleValue of scale) {
      scaleElements.push(
        <div
          key={"scaleElement" + scaleValue.scaleValue}
          className="scaleElement"
          style={{
            gridColumnStart: col,
            gridColumnEnd: col,
            gridRowStart: 1,
            gridRowEnd: 1,
            height: "20px"
          }}
        >
          <div
            className="innerScaleElement color"
            style={{
              backgroundColor: scaleValue.scaleColor,
              border: "solid 1px #f4f4f4",
              height: "10px"
            }}
          ></div>
          <div
            className="innerScaleElement text"
            style={{
              height: "10px",
              textAlign: "center",
              fontSize: "smaller"
            }}
          >
            {scaleValue.scaleValue}
          </div>
        </div>
      );
      col = col + 1;
    }

    return (
      <div
        style={{
          width: "100%",
          height: "auto",
          display: "grid",
          gridTemplateColumns: Array.from(Array(col).keys())
            .map((e) => "auto")
            .join(" "),
          gridTemplateRows: "40px"
        }}
      >
        {scaleElements}
      </div>
    );

    //return <div style={{  }}></div>;
  }

  setDiversityScale(scale) {
    this.setState({ diversityScale: scale });
  }

  getDiverstiyAttributeSelectOptions() {
    if (this.state.treeThreatType) {
      return citesAppendixSorted.map((e) => (
        <option key={e} value={e} name={e}>
          {e}
        </option>
      ));
    } else {
      return Object.keys(iucnColors).map((e) => (
        <option key={e} value={e} name={e}>
          {e}
        </option>
      ));
    }
  }

  onSelectChangeDiversityAttribute(event) {
    this.setState({ diversityAttribute: event.target.value });
  }

  activateTab(group, id) {
    let newTabs = { ...this.state.tabs };
    if (newTabs.hasOwnProperty(group)) {
      for (let tab of Object.keys(newTabs[group])) {
        if (tab === id) {
          newTabs[group][tab] = true;
        } else {
          newTabs[group][tab] = false;
        }
      }
    }

    this.setState({ tabs: newTabs });
  }

  setHover(speciesNames) {
    let oldHoverSpecies = this.state.hoverSpecies;

    if (JSON.stringify(oldHoverSpecies) !== JSON.stringify(speciesNames)) {
      this.setState({ hoverSpecies: speciesNames });
    }
  }

  render() {
    //console.log("SPECIES DATA", Object.keys(this.state.speciesData).length, this.state.speciesData, this.state.instrument);

    /*     let [barChartData, showIcons] = this.generateBarChartDataAllTypes(
      this.state.speciesSignThreats
    ); */

    let filter = { ...this.state.filterSettings };

    const instrumentGroup = filter["instrumentGroup"]
      ? filter["instrumentGroup"][0]
      : null;
    const instrument = filter["instrument"] ? filter["instrument"][0] : null;
    const mainPart = filter["mainPart"] ? filter["mainPart"][0] : null;

    let kingdom = filter["kingdom"] ? filter["kingdom"][0] : null;
    const familia = filter["familia"] ? filter["familia"][0] : null;
    const genus = filter["genus"] ? filter["genus"][0] : null;
    const species = filter["species"] ? filter["species"][0] : null;

    const asArray = Object.entries(this.state.speciesData);

    let speciesWithOutOrchestraFilter = {};

    const filtered = asArray.filter(([key, value]) => {
      let hit = true;
      /* if (filter["searchBarSpecies"] && hit) {
        hit = key.includes(filter["searchBarSpecies"]);
      } */

      if (hit && kingdom) {
        hit = kingdom === value.Kingdom;
      }

      if (hit && familia) {
        hit = familia === value.Family;
      }

      if (hit && genus) {
        hit = genus === value.Genus;
      }

      if (hit && species) {
        hit = species === key;
      }

      if (hit && filter["country"]) {
        if (
          value.hasOwnProperty("speciesCountries") &&
          value.speciesCountries.hasOwnProperty(key)
        ) {
          let countries = value.speciesCountries[key];
          console.log("countries", countries);
          hit = filter["country"].some((item) =>
            value.speciesCountries[key].includes(item)
          );
        } else {
          hit = false;
        }
      }

      if (hit) {
        speciesWithOutOrchestraFilter[key] = value;
      }

      if (hit && filter["instrumentGroup"]) {
        hit = filter["instrumentGroup"].some((item) =>
          value.groups.includes(item)
        );
      }

      if (hit && filter["instrument"]) {
        hit = filter["instrument"].some((item) =>
          value.instruments.includes(item)
        );
      }

      if (hit && filter["mainPart"]) {
        let mainParts = value.main_parts.map((e) => e.toLowerCase());
        hit = filter["mainPart"].some((item) => mainParts.includes(item));
      }

      return hit;
    });

    console.log("FILTER", filter);

    const filteredSpeciesData = Object.fromEntries(filtered);
    const mapSpecies = Object.fromEntries(
      Object.keys(filteredSpeciesData).map((e) => [e, 1])
    );

    let [treeMapData, imageLinks] = this.generateTreeMapData(
      //this.state.speciesSignThreats
      filteredSpeciesData
    );

    return (
      <div>
        {/* <div className="tabPanel" style={{ width: this.state.initWidthForVis + "px", height: window.innerHeight / 2 + "px" }}>
                    <div
                        className="tabButton"
                        onClick={(event) => {
                            this.activateTab("charts", "barChartTab");
                        }}
                        style={{
                            border: this.state.tabs["charts"]["barChartTab"] ? "1px solid gray" : "none"
                        }}
                    >
                        {"BarChart"}
                    </div>
                    <div
                        className="tabButton"
                        onClick={(event) => {
                            this.activateTab("charts", "treeMapTab");
                        }}
                        style={{
                            border: this.state.tabs["charts"]["treeMapTab"] ? "1px solid gray" : "none"
                        }}
                    >
                        {"TreeMap"}
                    </div>
                    <div style={{ display: "block" }}>
                        <div className="tab"
                            id="barChartTab"
                            ref={this.diversityMapTab}
                            style={{
                                visibility: this.state.tabs["charts"]["barChartTab"] ? "visible" : "hidden",
                                //display: this.state.tabs["charts"]["barChartTab"] ? "block" : "none",
                                position: "absolute",
                                top: "30px"
                            }}>
                            <BarChartView id="barChartView" data={barChartData} showIcons={showIcons}></BarChartView>
                        </div>
                        <div className="tab"
                            id="treeMapTab"
                            ref={this.diversityMapTab}
                            style={{
                                visibility: this.state.tabs["charts"]["treeMapTab"] ? "visible" : "hidden",
                                //display: this.state.tabs["charts"]["treeMapTab"] ? "block" : "none",
                                position: "absolute",
                                top: "30px"
                            }}>
                            </div>
                            </div >
                        </div> */}
        {this.renderTreeMap ? (
          <TreeMap
            id="treeMapView"
            data={treeMapData}
            filter={filter}
            kingdom={kingdom}
            familia={familia}
            genus={genus}
            species={species}
            setFilter={this.setFilter.bind(this)}
          ></TreeMap>
        ) : (
          []
        )}

        <Orchestra
          id="orchestraVis"
          mainPart={mainPart}
          instrument={instrument}
          instrumentGroup={instrumentGroup}
          getTreeThreatLevel={this.getSpeciesThreatLevel.bind(this)}
          treeThreatType={this.state.treeThreatType}
          speciesData={speciesWithOutOrchestraFilter}
          finishedFetching={this.state.finishedFetching}
          speciesSignThreats={this.state.speciesSignThreats}
          setFilter={this.setFilter.bind(this)}
          timeFrame={this.state.timeFrame}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px 0",
            paddingRight: "40px"
          }}
        >
          <div
            style={{
              width: "100%",
              height: "auto",
              display: "grid",
              gridTemplateColumns: "45% 10% auto",
              gridTemplateRows: "auto"
            }}
          >
            <div
              style={{
                gridColumnStart: 1,
                gridColumnEnd: 1,
                gridRowStart: 1,
                gridRowEnd: 1
              }}
            >
              <div className="legend">
                <Legend
                  onZoom={() => this.onZoom(1)}
                  onZoomOut={() => this.onZoom(-1)}
                  zoomLevel={this.state.zoomLevel}
                  maxZoomLevel={this.state.maxZoomLevel}
                  onPieStyle={this.onPieStyle.bind(this)}
                  pieStyle={this.state.pieStyle}
                  groupSame={this.state.groupSame}
                  onGroupSame={this.onGroupSame.bind(this)}
                  sortGrouped={this.state.sortGrouped}
                  onSortGrouped={this.onSortGrouped.bind(this)}
                  heatStyle={this.state.heatStyle}
                  onHeatStyle={this.onHeatStyle.bind(this)}
                  treeThreatType={this.state.treeThreatType}
                  setTreeThreatType={this.setTreeThreatType.bind(this)}
                />
              </div>
            </div>
            <div
              style={{
                gridColumnStart: 2,
                gridColumnEnd: 2,
                gridRowStart: 1,
                gridRowEnd: 1,
                alignSelf: "center",
                justifySelf: "center"
              }}
            >
              <div className="middlePieChart" style={{ position: "relative" }}>
                <CenterPieChart
                  data={filteredSpeciesData}
                  getTreeThreatLevel={this.getSpeciesThreatLevel.bind(this)}
                  treeThreatType={this.state.treeThreatType}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  lineHeight: "2em",
                  fontSize: "larger",
                  fontWeight: "bold"
                }}
              >
                Species
              </div>
            </div>
            <div
              style={{
                gridColumnStart: 3,
                gridColumnEnd: 3,
                gridRowStart: 1,
                gridRowEnd: 1
                /*  "align-self": "center",
                "justify-self": "center", */
              }}
            >
              <div
                style={{
                  margin: 0,
                  padding: 0,
                  height: "100%",
                  display: "table"
                }}
                className="searchBarWrapper"
              >
                <SearchBar
                  data={this.state.speciesData}
                  setFilter={this.setFilter.bind(this)}
                />
              </div>
            </div>
            {/* <button onClick={this.fetchAndSetSpecies.bind(this)}>Run!</button> */}
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: "auto",
            display: "grid",
            gridTemplateColumns: "50% 50%",
            gridTemplateRows: "auto auto"
          }}
        >
          {Object.keys(filteredSpeciesData).length > 0 && (
            <div
              style={{
                gridColumnStart: 1,
                gridColumnEnd: 1,
                gridRowStart: 1,
                gridRowEnd: 1,
                height: window.innerHeight / 2 + "px",
                overflow: "unset"
              }}
            >
              <TimelineView
                data={filteredSpeciesData}
                initWidth={this.state.initWidthForVis}
                tradeData={this.state.speciesTrades}
                pieStyle="pie"
                groupSame="true"
                sortGrouped="trend"
                heatStyle="dom"
                usePreGenerated={this.usePreGenerated}
                addSpeciesToMap={this.addSpeciesToMap.bind(this)}
                removeSpeciesFromMap={this.removeSpeciesFromMap.bind(this)}
                setSpeciesSignThreats={this.setSpeciesSignThreats.bind(this)}
                getSpeciesSignThreats={this.getSpeciesSignThreats.bind(this)}
                getTreeThreatLevel={this.getSpeciesThreatLevel.bind(this)}
                treeImageLinks={imageLinks}
                setHover={this.setHover.bind(this)}
                setTimeFrame={this.setTimeFrame.bind(this)}
                timeFrame={this.state.timeFrame}
              />
              <div key="tooltip" id="tooltip" className="tooltip"></div>
            </div>
          )}
          <div
            style={{
              gridColumnStart: 2,
              gridColumnEnd: 2,
              gridRowStart: 1,
              gridRowEnd: 1
            }}
          >
            {/* <button onClick={(event) => {
                            if (this.state.addAllCountries === false) {
                                this.addAllCountries();
                            }
                            else {
                                this.removeAllCountries();
                            }
                        }}>
                            {this.state.addAllCountries ? "Remove all Countries" : "Add all countries"}
                        </button> */}
            {/* <button onClick={(event) => {
                            if (this.state.heatMap === false) {
                                this.activateHeatMap();
                            }
                            else {
                                this.deactivateHeatMap();
                            }
                        }}>
                            {this.state.heatMap ? "Deactivate HeatMap" : "Activate HeatMap"}
                        </button> */}
            {/* <button onClick={(event) => {
                            if (this.state.diversity === false) {
                                this.activateDiversity();
                            }
                            else {
                                this.deactivateDiversity();
                            }
                        }}>
                            {this.state.diversity ? "Deactivate Diversity" : "Activate Diversity"}
                        </button> */}
            {/*  <button
              onClick={(event) => {
                this.toggleTreeThreatType();
              }}
            >
              {this.state.treeThreatType ? "Economically" : "Ecologically"}
            </button> */}
            {/* <button onClick={(event) => {
                            this.toggleDiversityMapMode();
                        }}>
                            {this.state.diversityMode ? "Distribution" : "Eco/Eco"}
                        </button> */}
            {/* <select
                            id="diversitySelect"
                            value={this.state.diversityAttribute}
                            onChange={this.onSelectChangeDiversityAttribute.bind(this)}>
                            {
                                this.getDiverstiyAttributeSelectOptions()
                            }
                        </select> */}
            {/*  {
              <button
                onClick={(event) => {
                  this.save();
                }}
              >
                {"Save"}
              </button>
            } */}
            {this.renderMapScale(this.state.diversityScale)}
            {this.renderMap ? (
              <Map
                id="map"
                data={this.state.speciesData}
                initWidth={this.state.initWidthForVis}
                mapSpecies={mapSpecies}
                getTreeThreatLevel={this.getSpeciesThreatLevel.bind(this)}
                heatMap={this.state.heatMap}
                diversity={this.state.diversity}
                coordinates={this.state.speciesOccurrences}
                setDiversityScale={this.setDiversityScale.bind(this)}
                treeThreatType={this.state.treeThreatType}
                diversityMode={this.state.diversityMode}
                diversityAttribute={this.state.diversityAttribute}
                speciesImageLinks={imageLinks}
                hoverSpecies={this.state.hoverSpecies}
                timeFrame={this.state.timeFrame}
                setFilter={this.setFilter.bind(this)}
              />
            ) : (
              []
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
