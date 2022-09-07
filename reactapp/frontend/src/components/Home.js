import Switch from "@mui/material/Switch";
import { Component, default as React } from "react";
import CenterPieChart from "./CenterPieChart";
import Legend from "./Legend";
import MapSearchBar from "./MapSearchBar";
import Orchestra from "./Orchestra";
import SearchBar from "./SearchBar";
import TreeMap from "./TreeMap";
import TimelineView from "./TimelineView";
import Tooltip from "./Tooltip";

import "react-tabs/style/react-tabs.css";
import {
  bgciAssessment,
  citesAppendixSorted,
  citesAssessment,
  citesScore,
  iucnAssessment,
  iucnColors,
  iucnScore,
  threatScore,
  threatScoreReverse
} from "../utils/timelineUtils";
import {
  getOrCreate,
  pushOrCreate,
  pushOrCreateWithoutDuplicates,
  replaceSpecialCharacters
} from "../utils/utils";
import FullScreenButton from "./FullScreenButton";
import Map from "./Map";
import ResizeComponent from "./ResizeComponent";

class Home extends Component {
  constructor(props) {
    super(props);

    this.usePreGenerated = true;
    this.renderMap = false;
    this.renderTreeMap = false;
    this.slice = false;

    this.tempSpeciesData = {};
    this.tempFetchedSpecies = [];
    this.tmpSpeciesDataCache = {};
    this.species = {};

    this.plantIcon = {};
    this.animalIcon = {};

    this.ecoRegionSpeciesThreats = [];

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
      initWidthForVis: parseInt(Math.floor(window.innerWidth / 2)) - 20,
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
      filterSettings: {},
      colorBlind: false,
      mapSearchMode: "country",
      mapSearchBarData: {},
      lastSpeciesThreats: {},
      lastSpeciesSigns: {},
      transformOrigin: "0% 0%",
      transform: "",
      tooltipPosition: undefined,
      tooltipText: ""
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

  setMapSearchBarData(mode, newVal) {
    const newSearchBarData = { ...this.state.mapSearchBarData };
    newSearchBarData[mode] = newVal;
    this.setState({ mapSearchBarData: newSearchBarData });
  }

  setMapSearchMode(newVal) {
    this.setState({ mapSearchMode: newVal });
  }

  setFilter(obj) {
    let newSettings = { ...this.state.filterSettings };

    for (let cat of Object.keys(obj)) {
      newSettings[cat] = obj[cat];
    }

    this.setState({ filterSettings: newSettings });
  }

  getAllThreats(speciesData, timeFrame = null) {
    let myLastSpeciesThreats = {};
    let myLastSignThreats = {};

    for (let species of Object.keys(speciesData)) {
      let lastSpeciesThreats = this.getSpeciesLastThreats(
        species,
        speciesData[species],
        timeFrame
      );

      myLastSpeciesThreats[species] = lastSpeciesThreats;

      myLastSignThreats[species] = {
        economically: this.getSpeciesAssessment(
          species,
          "economically",
          speciesData[species],
          timeFrame,
          lastSpeciesThreats
        ),
        ecologically: this.getSpeciesAssessment(
          species,
          "ecologically",
          speciesData[species],
          timeFrame,
          lastSpeciesThreats
        )
      };
    }

    return [myLastSpeciesThreats, myLastSignThreats];
  }

  importAllSpeciesFromGeneratedJSON() {
    console.log("IMPORT ALL SPecies");
    let timeFrame = this.state.timeFrame;

    fetch("/plantIcon2.svg")
      .then((res) => res.text())
      .then((text) => {
        this.plantIcon = text;
        fetch("/animalIcon.svg")
          .then((res) => res.text())
          .then((text) => {
            this.animalIcon = text;
          });
      });

    fetch("/generatedOutput/allSpecies.json")
      .then((res) => res.json())
      .then(
        function (speciesData) {
          speciesData = Object.fromEntries(
            Object.entries(speciesData)
              .filter(
                (t) => (t[1].Kingdom ? t[1].Kingdom.trim() !== "" : false)
                //t[0] === "Dalbergia nigra" || t[0] === "Paubrasilia echinata"
              )
              .slice(0, this.slice ? 70 : Object.keys(speciesData).length)
          );
          let newMapData = {};

          let [myLastSpeciesThreats, myLastSignThreats] =
            this.getAllThreats(speciesData);

          this.setState({
            speciesData: speciesData,
            mapSpecies: newMapData,
            speciesDataCache: speciesData,
            finishedFetching: true,
            lastSpeciesSigns: myLastSignThreats,
            lastSpeciesThreats: myLastSpeciesThreats
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
      let [myLastSpeciesThreats, myLastSignThreats] = this.getAllThreats(
        this.state.speciesData,
        timeFrame
      );

      this.setState({
        timeFrame,
        lastSpeciesSigns: myLastSignThreats,
        lastSpeciesThreats: myLastSpeciesThreats
      });
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
    document.title = "MusEcology";
    if (this.usePreGenerated) {
      this.importAllSpeciesFromGeneratedJSON();
    }
    /* this.readAndSetWoodMap();*/
    this.fetchAndSetSpecies(this.usePreGenerated);
  }

  componentDidUpdate(prevProps) {
    /* this.setState(); */

    if (this.state.finishedFetching) {
      this.onFishishFetching();
    }

    /* if (
      JSON.stringify(this.state.speciesSignThreats) !==
      JSON.stringify(prevProps.speciesSignThreats)
    ) {
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

  getPlantIcon() {
    return this.plantIcon;
  }

  getAnimalIcon() {
    return this.animalIcon;
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
        let splitter = "|";
        if (speciesObj["Foto assigment"].includes(",")) {
          splitter = ",";
        }
        let photos = speciesObj["Foto assigment"].split(splitter);
        if (photos.length > 0) {
          if (speciesObj["Family"] === "Balaenidae") {
            return "fotos/" + photos[1].trim();
          }
          return "fotos/" + photos[0].replace(" ", "");
        }
      }
      return null;
    };

    let imageLinks = {};
    let dummyLinks = {};

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
            valueObject["iucnThreat"] =
              this.state.lastSpeciesThreats[value]["iucn"];
            valueObject["citesThreat"] =
              this.state.lastSpeciesThreats[value]["cites"];
            valueObject["bgciThreat"] =
              this.state.lastSpeciesThreats[value]["bgci"];
            valueObject["kingdom"] = this.state.speciesData[value].Kingdom;
            valueObject["ecologically"] =
              this.state.lastSpeciesSigns[value]["ecologically"];
            valueObject["economically"] =
              this.state.lastSpeciesSigns[value]["economically"];
            valueObject["colname"] = "level4";
            valueObject["value"] = subgroupData[family][group][value].length;

            valueObject["link"] = returnImageLink(
              this.state.speciesData[value]
            );

            valueObject["dummylink"] =
              this.state.speciesData[value]["Foto dummy"].trim() !== ""
                ? "fotos/" +
                  this.state.speciesData[value]["Foto dummy"].replace(" ", "")
                : null;

            //if (valueObject["link"] !== null) {
            sum += valueObject[value];
            valueObjects.push(valueObject);
            //}

            if (valueObject["link"]) {
              valueObject["FotoSource"] =
                this.state.speciesData[value]["Foto source"];
              imageLinks[valueObject["name"]] = valueObject["link"];
            }
            if (valueObject["dummylink"])
              valueObject["FotoSource"] =
                this.state.speciesData[value]["Foto source"];
            dummyLinks[valueObject["name"]] = valueObject["dummylink"];
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

    return [{ name: "Kingdoms", children: treeMap }, imageLinks, dummyLinks];
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

  fetchAndSetSpecies(alreadyLoaded = false) {
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

    if (alreadyLoaded === false) {
      console.log("FETCH SOME", url);
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          let speciesObject = {};
          for (let e of data.filter(
            (t) => t.Genus.trim() !== "" && t.Kingdom.trim() !== ""
          )) {
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
                speciesObject[speciesName]["groups"].push(
                  e["Instrument_groups"]
                );
              }

              if (
                !speciesObject[speciesName]["instruments"].includes(
                  e["Instruments"]
                )
              ) {
                speciesObject[speciesName]["instruments"].push(
                  e["Instruments"]
                );
              }

              if (
                !speciesObject[speciesName]["main_parts"].includes(
                  e["Main_part"]
                )
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
            /*  */
            Object.entries(speciesObject).slice(
              0,
              this.slice ? 70 : Object.keys(speciesObject).length
            )
          );

          this.setSpecies(speciesObject);
        });
    }
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

    let myLastSignThreats = {};
    for (let species of Object.keys(speciesObject)) {
      myLastSignThreats[species] = {
        economically: this.getSpeciesAssessment(
          species,
          "economically",
          speciesObject[species]
        ),
        ecologically: this.getSpeciesAssessment(
          species,
          "ecologically",
          speciesObject[species]
        )
      };
    }

    this.setState({
      speciesData: speciesObject,
      species: species,
      mapSpecies: {},
      addAllCountries: false,
      fetchedSpecies: [],
      lastSpeciesThreats: myLastSignThreats
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
      }
    } else {
      speciesSignThreats[key] = { cites: null, iucn: null, threat: null };
      speciesSignThreats[key][subkey] = value;
    }
    this.setState({
      speciesSignThreats: speciesSignThreats
    });
  }

  getSpeciesSignThreats(species) {
    if (this.state.speciesSignThreats.hasOwnProperty(species)) {
      let returnElement = this.state.speciesSignThreats[species];
      return returnElement;
    } else {
      return { cites: null, iucn: null, threat: null };
    }
  }

  getSpeciesThreatLevel_old(treeName, type = null) {
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

  getLastSpeciesThreatForType(species, type, data = null, timeFrame = null) {
    let threats = null;
    let last = null;
    timeFrame = timeFrame ? timeFrame : this.state.timeFrame;

    let obj;
    if (data) {
      obj = data;
    } else if (this.state.speciesData && this.state.speciesData[species]) {
      obj = this.state.speciesData[species];
    }
    if (obj) {
      switch (type) {
        case "cites":
          if (!obj.hasOwnProperty("timeListing")) return null;

          threats = obj.timeListing;

          if (timeFrame[1] !== undefined) {
            threats = threats.filter((e) => parseInt(e.year) < timeFrame[1]);
          }

          last = null;
          for (let threat of threats) {
            if (last) {
              if (parseInt(threat.year) > parseInt(last.year)) {
                last = threat;
              } else if (
                parseInt(threat.year) === parseInt(last.year) &&
                citesAssessment.get(threat.appendix).sort >
                  citesAssessment.get(last.appendix).sort
              ) {
                last = threat;
              }
            } else {
              last = threat;
            }
          }
          return last;
        case "iucn":
          if (!obj.hasOwnProperty("timeIUCN")) return null;

          threats = obj.timeIUCN;

          if (timeFrame[1] !== undefined) {
            threats = threats.filter((e) => parseInt(e.year) < timeFrame[1]);
          }

          for (let threat of threats) {
            if (last) {
              if (parseInt(threat.year) > parseInt(last.year)) {
                if (timeFrame[1] !== undefined) {
                  if (parseInt(threat.year) < timeFrame[1]) {
                    last = threat;
                  }
                } else {
                  last = threat;
                }
              } else if (
                parseInt(threat.year) === parseInt(last.year) &&
                iucnAssessment.get(threat.code).sort <
                  iucnAssessment.get(last.code).sort
              ) {
                last = threat;
              }
            } else {
              last = threat;
            }
          }
          return last;
        case "bgci":
          if (!obj.hasOwnProperty("timeThreat")) return null;

          threats = obj.timeThreat;

          if (timeFrame[1] !== undefined) {
            threats = threats.filter((e) => parseInt(e.year) < timeFrame[1]);
          }

          for (let threat of threats) {
            if (last) {
              if (parseInt(threat.year) > parseInt(last.year)) {
                if (timeFrame[1] !== undefined) {
                  if (parseInt(threat.year) < timeFrame[1]) {
                    last = threat;
                  }
                } else {
                  last = threat;
                }
              } else if (
                parseInt(threat.year) === parseInt(last.year) &&
                bgciAssessment.get(threat.danger).sort >
                  bgciAssessment.get(last.danger).sort
              ) {
                last = threat;
              }
            } else {
              last = threat;
            }
          }
          return last;

        default:
          break;
      }
    } else {
      return null;
    }
  }

  getSpeciesAssessment(
    species,
    type,
    data = null,
    timeFrame = null,
    lastThreats = null
  ) {
    switch (type) {
      case "economically":
        if (lastThreats) {
          return lastThreats["cites"]
            ? lastThreats["cites"]
            : citesAssessment.dataDeficient;
        } else {
          let lastAssessment = this.getLastSpeciesThreatForType(
            species,
            "cites",
            data,
            timeFrame
          );
          return lastAssessment
            ? citesAssessment.get(lastAssessment.appendix)
            : citesAssessment.dataDeficient;
        }
      case "ecologically":
        if (lastThreats) {
          if (lastThreats["iucn"] !== null) {
            return lastThreats["iucn"];
          } else {
            return lastThreats["bgci"]
              ? lastThreats["bgci"]
              : bgciAssessment.dataDeficient;
          }
        } else {
          let iucn = this.getLastSpeciesThreatForType(
            species,
            "iucn",
            data,
            timeFrame
          );
          if (iucn !== null) {
            return iucnAssessment.get(iucn.code);
          } else {
            let bgci = this.getLastSpeciesThreatForType(
              species,
              "bgci",
              data,
              timeFrame
            );
            return bgci
              ? bgciAssessment.get(bgci.danger)
              : iucnAssessment.dataDeficient;
          }
        }
      default:
        return null;
    }
  }

  getSpeciesLastThreats(species, data = null, timeFrame = null) {
    let obj = {};
    let lastAssessment = this.getLastSpeciesThreatForType(
      species,
      "cites",
      data,
      timeFrame
    );

    obj["cites"] = lastAssessment
      ? citesAssessment.get(lastAssessment.appendix)
      : null;

    let lastAssessmentIUCN = this.getLastSpeciesThreatForType(
      species,
      "iucn",
      data,
      timeFrame
    );

    obj["iucn"] = lastAssessmentIUCN
      ? iucnAssessment.get(lastAssessmentIUCN.code)
      : null;

    let lastAssessmentBGCI = this.getLastSpeciesThreatForType(
      species,
      "bgci",
      data,
      timeFrame
    );

    obj["bgci"] = lastAssessmentBGCI
      ? bgciAssessment.get(lastAssessmentBGCI.danger)
      : null;

    return obj;
  }

  getSpeciesThreatLevel(treeName, type = null) {
    return this.getSpeciesAssessment(treeName, type);
  }

  save() {
    let data = { ...this.state.speciesData };
    let signThreats = { ...this.state.speciesSignThreats };
    for (let key of Object.keys(data)) {
      data[key]["speciesSignThreats"] = signThreats[key];
    }

    let file = new Blob([JSON.stringify(data, null, 4)], {
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

  setEcoRegionStatistics(data) {
    let columnNames = [
      "Name",
      "ID",
      "Nr. of Species",
      "Nr. Endangered",
      "Nr. Possibly",
      "Nr. Least Concern",
      "Nr. Decreasing",
      "Nr. Population Trend",
      "NNH"
    ];
    this.ecoRegionSpeciesThreats = data.map((entry) => {
      let ret = {};
      for (let i = 0; i < columnNames.length; i++) {
        ret[columnNames[i]] = entry[i];
      }
      return ret;
    });
  }

  saveEcoRegionSpecies() {
    let data = this.ecoRegionSpeciesThreats;

    let file = new Blob([JSON.stringify(data, null, 4)], {
      type: "application/json"
    });
    let filename = "ecoRegionStatistics.json";
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

  renderMapScale(scale, type) {
    let scaleElements = [];

    let typeText = "";

    switch (type) {
      case "countries":
        typeText = "Species/Country";
        break;
      case "hexagons":
        typeText = "Species/Hexagon";
        break;
      case "ecoregions":
        typeText = "Species/Ecoregion";
        break;
      case "rescure":
        typeText = "Rescure Potential";
        break;
      default:
        break;
    }

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
              paddingRight: "2px",
              textAlign: "end",
              fontSize: "smaller"
            }}
          >
            {scaleValue.scaleLabel
              ? scaleValue.scaleLabel
              : scaleValue.scaleValue}
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
        <div
          style={{
            whiteSpace: "break-spaces",
            textAlign: "center",
            height: "100%",
            alignSelf: "center"
          }}
        >
          {typeText}
        </div>
      </div>
    );

    //return <div style={{  }}></div>;
  }

  setDiversityScale(scale, type) {
    this.setState({ diversityScale: scale, diversityScaleType: type });
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

  setZoom(zoomString) {
    this.setState({ transform: "scale(2)", transformOrigin: zoomString });
  }

  tooltip(text, position) {
    this.setState({ tooltipPosition: position, tooltipText: text });
  }

  render() {
    //console.log("SPECIES DATA", Object.keys(this.state.speciesData).length, this.state.speciesData, this.state.instrument);

    /*     let [barChartData, showIcons] = this.generateBarChartDataAllTypes(
      this.state.speciesSignThreats
    ); */

    let filter = { ...this.state.filterSettings };

    console.log("filters", filter);

    const instrumentGroup = filter["instrumentGroup"]
      ? filter["instrumentGroup"][0]
      : null;
    const instrument = filter["instrument"] ? filter["instrument"][0] : null;
    const mainPart = filter["mainPart"] ? filter["mainPart"][0] : null;

    let kingdom = filter["kingdom"] ? filter["kingdom"][0] : null;
    const familia = filter["familia"] ? filter["familia"][0] : null;
    const genus = filter["genus"] ? filter["genus"][0] : null;
    const species = filter["species"] ? filter["species"][0] : null;

    const country = filter["country"] ? filter["country"][0] : null;
    const ecoRegion = filter["eco"] ? filter["eco"][0] : null;
    const category = filter["category"] ? filter["category"] : null;

    let lastSpeciesSigns = this.state.lastSpeciesSigns;
    let lastSpeciesThreats = this.state.lastSpeciesThreats;

    /* console.log("lastSpeciesSigns", lastSpeciesSigns, lastSpeciesThreats); */

    const mapSearchMode = this.state.mapSearchMode;

    let mapSearchValue = null;

    const asArray = Object.entries(this.state.speciesData);

    let speciesWithOutOrchestraFilter = {};

    const filtered = asArray.filter(([key, value]) => {
      let hit = true;
      /* if (filter["searchBarSpecies"] && hit) {
        hit = key.includes(filter["searchBarSpecies"]);
      } */

      if (hit && kingdom) {
        hit = kingdom === value.Kingdom.trim();
      }

      if (hit && familia) {
        hit = familia === value.Family.trim();
      }

      if (hit && genus) {
        hit = genus === value.Genus.trim();
      }

      if (hit && species) {
        hit = species === key;
      }

      if (hit && category) {
        hit = false;
        if (lastSpeciesThreats.hasOwnProperty(key)) {
          if (lastSpeciesThreats[key][category.type] !== null) {
            hit =
              lastSpeciesThreats[key][category.type].abbreviation ===
              category.cat;
          }
        }
      }

      if (
        hit &&
        country !== null &&
        country !== undefined &&
        mapSearchMode === "country"
      ) {
        let countries = [];
        if (value.hasOwnProperty("treeCountriesShort")) {
          countries = value.treeCountriesShort;
        } else {
          if (value.hasOwnProperty("iucnCountriesShort")) {
            countries = value.iucnCountriesShort;
          } else {
            if (value.hasOwnProperty("allCountries")) {
              countries = value.allCountries;
            }
          }
        }
        hit = Object.values(country).some((item) => countries.includes(item));
        mapSearchValue = country;
      }

      if (
        hit &&
        ecoRegion !== null &&
        ecoRegion !== undefined &&
        mapSearchMode === "eco"
      ) {
        let ecoRegions = [];
        if (value.ecoregions !== undefined) {
          ecoRegions = value.ecoregions;
        }
        if (ecoRegion.ecoArray !== undefined) {
          hit = ecoRegion.ecoArray
            .flat()
            .some((item) => ecoRegions.includes(item.toString()));
        } else {
          hit = Object.values(ecoRegion).some((item) =>
            ecoRegions.includes(item.toString())
          );
        }
        mapSearchValue = ecoRegion;
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
        hit = filter["mainPart"].some((item) =>
          mainParts.includes(item.toLowerCase())
        );
      }

      return hit;
    });

    const filteredSpeciesData = Object.fromEntries(filtered);
    const mapSpecies = Object.fromEntries(
      Object.keys(filteredSpeciesData).map((e) => [e, 1])
    );

    let [treeMapData, imageLinks, dummyLinks] =
      this.generateTreeMapData(filteredSpeciesData);

    const zoomOrigin = this.state.transformOrigin;
    const scaleString = this.state.transform;

    return (
      <>
        <Tooltip
          text={this.state.tooltipText}
          position={this.state.tooltipPosition}
        />
        <div
          style={{
            display: "grid",
            width: "100%",
            height: "100%",
            gridTemplateColumns: "50% 50%",
            gridTemplateRows: "40% 20% 45%",
            transformOrigin: zoomOrigin,
            transform: scaleString
          }}
        >
          <div
            style={{
              gridColumnStart: 1,
              gridColumnEnd: 1,
              gridRowStart: 1,
              gridRowEnd: 1,
              position: "relative"
            }}
          >
            <ResizeComponent>
              <Orchestra
                id="orchestraVis"
                mainPart={mainPart}
                instrument={instrument}
                instrumentGroup={instrumentGroup}
                getTreeThreatLevel={this.getSpeciesThreatLevel.bind(this)}
                treeThreatType={this.state.treeThreatType}
                speciesData={speciesWithOutOrchestraFilter}
                finishedFetching={this.state.finishedFetching}
                lastSpeciesSigns={lastSpeciesSigns}
                lastSpeciesThreats={lastSpeciesThreats}
                setFilter={this.setFilter.bind(this)}
                timeFrame={this.state.timeFrame}
                colorBlind={this.state.colorBlind}
              />
            </ResizeComponent>
            <FullScreenButton
              scaleString={scaleString}
              onClick={() => {
                this.setState({
                  transform: scaleString !== "" ? "" : "scale(2)",
                  transformOrigin: scaleString !== "" ? "0% 0%" : "0% 0%"
                });
              }}
            />
          </div>
          <div
            style={{
              gridColumnStart: 2,
              gridColumnEnd: 2,
              gridRowStart: 1,
              gridRowEnd: 1,
              position: "relative"
            }}
          >
            {this.renderTreeMap ? (
              <TreeMap
                id="treeMapView"
                data={treeMapData}
                filter={filter}
                kingdom={kingdom}
                familia={familia}
                genus={genus}
                species={species}
                colorBlind={this.state.colorBlind}
                setFilter={this.setFilter.bind(this)}
                getAnimalIcon={this.getAnimalIcon.bind(this)}
                getPlantIcon={this.getPlantIcon.bind(this)}
              ></TreeMap>
            ) : (
              []
            )}
            <FullScreenButton
              scaleString={scaleString}
              onClick={() => {
                this.setState({
                  transform: scaleString !== "" ? "" : "scale(2)",
                  transformOrigin: scaleString !== "" ? "0% 0%" : "100% 0%"
                });
              }}
            />
          </div>
          <div
            style={{
              gridColumnStart: 1,
              gridColumnEnd: "span 2",
              gridRowStart: 2,
              gridRowEnd: 2
            }}
          >
            {
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "10px 0",
                  marginRight: "15px"
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "grid",
                    gridTemplateColumns: "calc(50% - 50px) 90px auto",
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
                        colorBlind={this.state.colorBlind}
                        setFilter={this.setFilter.bind(this)}
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
                    <div
                      className="middlePieChart"
                      style={{ position: "relative" }}
                    >
                      <CenterPieChart
                        data={filteredSpeciesData}
                        getTreeThreatLevel={this.getSpeciesThreatLevel.bind(
                          this
                        )}
                        treeThreatType={this.state.treeThreatType}
                        colorBlind={this.state.colorBlind}
                        lastSpeciesSigns={lastSpeciesSigns}
                        lastSpeciesThreats={lastSpeciesThreats}
                      />
                    </div>
                    <div
                      style={{
                        lineHeight: "1.5em",
                        fontSize: "larg",
                        fontWeight: "bold",
                        textAlign: "center"
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
                      gridRowEnd: 1,
                      alignSelf: "center",
                      justifySelf: "center"
                    }}
                  >
                    <div
                      style={{
                        margin: 0,
                        padding: 0,
                        marginLeft: "10px"
                      }}
                      className="searchBarWrapper"
                    >
                      <SearchBar
                        data={this.state.speciesData}
                        kingdom={kingdom}
                        familia={familia}
                        species={species}
                        genus={genus}
                        setFilter={this.setFilter.bind(this)}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      gridColumnStart: 4,
                      gridColumnEnd: 4,
                      gridRowStart: 1,
                      gridRowEnd: 1,
                      alignSelf: "center",
                      justifySelf: "center"
                    }}
                  >
                    <div
                      style={{
                        margin: 0,
                        marginLeft: "10px",
                        padding: 0
                      }}
                      className="searchBarWrapper"
                    >
                      <MapSearchBar
                        data={this.state.speciesData}
                        setFilter={this.setFilter.bind(this)}
                        mapSearchMode={this.state.mapSearchMode}
                        mapSearchBarData={this.state.mapSearchBarData}
                        value={mapSearchValue}
                        mode={mapSearchMode}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      gridColumnStart: 5,
                      gridColumnEnd: 5,
                      gridRowStart: 1,
                      gridRowEnd: 1,
                      alignSelf: "center",
                      justifySelf: "center"
                    }}
                  >
                    <div
                      style={{
                        margin: 0,
                        padding: 0
                      }}
                      className="searchBarWrapper"
                    >
                      <div>Color Blind Mode</div>
                      <div className="switchWrapper">
                        <Switch
                          onChange={(e, value) =>
                            this.setState({
                              colorBlind: !this.state.colorBlind
                            })
                          }
                          checked={this.state.colorBlind}
                          className="colorBlindSwitch"
                          color="secondary"
                        />
                      </div>
                    </div>
                  </div>
                  {/* {
                  <button onClick={this.fetchAndSetSpecies.bind(this)}>
                    Run!
                  </button>
                } */}
                </div>
              </div>
            }
          </div>
          <div
            style={{
              gridColumnStart: 1,
              gridColumnEnd: 1,
              gridRowStart: 3,
              gridRowEnd: 3,
              position: "relative",
              height: "100%"
            }}
          >
            {Object.keys(filteredSpeciesData).length > 0 && (
              <>
                <ResizeComponent>
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
                    setSpeciesSignThreats={this.setSpeciesSignThreats.bind(
                      this
                    )}
                    getSpeciesSignThreats={this.getSpeciesSignThreats.bind(
                      this
                    )}
                    getTreeThreatLevel={this.getSpeciesThreatLevel.bind(this)}
                    treeImageLinks={imageLinks}
                    dummyImageLinks={dummyLinks}
                    setHover={this.setHover.bind(this)}
                    setTimeFrame={this.setTimeFrame.bind(this)}
                    timeFrame={this.state.timeFrame}
                    colorBlind={this.state.colorBlind}
                    setFilter={this.setFilter.bind(this)}
                    getAnimalIcon={this.getAnimalIcon.bind(this)}
                    getPlantIcon={this.getPlantIcon.bind(this)}
                    species={species}
                    lastSpeciesSigns={lastSpeciesSigns}
                    lastSpeciesThreats={lastSpeciesThreats}
                    tooltip={this.tooltip.bind(this)}
                  />
                </ResizeComponent>
              </>
            )}
            <FullScreenButton
              scaleString={scaleString}
              onClick={() => {
                this.setState({
                  transform: scaleString !== "" ? "" : "scale(2)",
                  transformOrigin:
                    scaleString !== "" ? "0% 0%" : "0% calc(100% - 60px)"
                });
              }}
            />
          </div>
          <div
            style={{
              gridColumnStart: 2,
              gridColumnEnd: 2,
              gridRowStart: 3,
              gridRowEnd: 3,
              position: "relative"
            }}
          >
            {this.renderMapScale(
              this.state.diversityScale,
              this.state.diversityScaleType
            )}
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
                colorBlind={this.state.colorBlind}
                setMapSearchBarData={this.setMapSearchBarData.bind(this)}
                setMapSearchMode={this.setMapSearchMode.bind(this)}
                country={country}
                selectedEcoRegion={ecoRegion}
                lastSpeciesSigns={lastSpeciesSigns}
                lastSpeciesThreats={lastSpeciesThreats}
                setEcoRegionStatistics={this.setEcoRegionStatistics.bind(this)}
              />
            ) : (
              []
            )}
            <FullScreenButton
              scaleString={scaleString}
              onClick={() => {
                this.setState({
                  transform: scaleString !== "" ? "" : "scale(2)",
                  transformOrigin:
                    scaleString !== "" ? "0% 0%" : "100% calc(100% - 60px)"
                });
              }}
            />
          </div>
          <div
            style={{
              gridColumnStart: 1,
              gridColumnEnd: "span 2",
              gridRowStart: 4,
              gridRowEnd: 4
            }}
          >
            Footer
          </div>
        </div>
      </>
    );
  }
}

export default Home;
