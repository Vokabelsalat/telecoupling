import React, { Component, useEffect } from 'react';
import Orchestra from './Orchestra';
import BarChartView from './BarChartView';
import TreeMapView from './TreeMapView';
import Legend from './Legend';
import TimelineView from "./TimelineView";
import { getOrCreate, iucnToDangerMap, dangerSorted, pushOrCreate, getThreatColor, replaceSpecialCharacters } from "../utils/utils";
import { iucnScore, threatScore, citesScore, citesScoreReverse, threatScoreReverse, citesAppendixSorted, iucnColors, getCitesColor, getIucnColor, iucnAssessment, bgciAssessment, citesAssessment } from '../utils/timelineUtils';
import Map from "./Map";
import { cluster, json, scaleLog, scalePoint, treemap } from 'd3';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

class Home extends Component {
    constructor(props) {
        super(props);

        this.usePreGenerated = true;

        this.tempSpeciesData = {};
        this.tempFetchedSpecies = [];
        this.speciesDataCache = {};



        let tabs = { "maps": { "diversityMapTab": true, "threatMapTab": false }, "charts": { "barChartTab": true, "treeMapTab": false } };

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
            hoverSpecies: []
        };
    }

    readAndSetWoodMap() {
        fetch("http://localhost:3000/data/woodMapData.json")
            .then(res => {
                return res.json();
            })
            .then(function (data) {
                this.woodMap = data;
            }.bind(this))
    }

    componentDidMount() {
        this.readAndSetWoodMap();
        this.fetchAndSetSpecies();
    }

    componentDidUpdate(prevProps) {
        if (this.state.finishedFetching) {
            this.onFishishFetching();
        }
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
        fetch("http://localhost:9000/api/getMainParts/" + instrument)
            .then(res => res.json())
            .then(function (data) {
                let options = ["All"];
                options.push(...data.map(e => e["Main part"]))
                setMainPartList(options);
            });
    }

    setMainPartList(mainParts) {
        this.setState({ ...this.state, mainPartList: mainParts, mainPart: mainParts[0] });
        this.fetchAndSetSpecies();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
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
        let subgroupData = {};

        for (let species of Object.keys(input)) {
            if (this.state.speciesData.hasOwnProperty(species)) {

                let groups = this.state.speciesData[species]["groups"];
                let subgroups = this.state.speciesData[species]["instruments"];

                for (let entry of this.state.speciesData[species]["origMat"]) {
                    if (entry["Instrument groups"] !== "") {
                        if (entry["main used material"] === "1")
                            pushOrCreate(getOrCreate(subgroupData, entry["Instrument groups"], {}), species, 1);
                    }
                }

                /* for (let group of groups) {
                    if (group !== "") {
                        if (this.state.speciesData[species]["main used material"] === "1")
                            pushOrCreate(getOrCreate(subgroupData, group, {}), species, 1);
                    }
                } */
            }
        }

        let imageLinks = {};

        let treeMapData = [];
        for (let group of Object.keys(subgroupData)) {
            let sum = 0;
            let valueObjects = [];
            for (let value of Object.keys(subgroupData[group])) {
                let valueObject = {};
                valueObject["name"] = value;
                valueObject["colname"] = "level3";
                valueObject["value"] = subgroupData[group][value].reduce(function (a, b) {
                    return a + b;
                }, 0);
                if (this.woodMap.hasOwnProperty(value)) {
                    valueObject["link"] = this.woodMap[value];
                }
                else {
                    for (let key of Object.keys(this.woodMap)) {
                        if (key.includes(value)) {
                            valueObject["link"] = this.woodMap[key];
                            break;
                        }
                    }

                    if (!valueObject.hasOwnProperty("link")) {
                        let genus = value.split(" ")[0];
                        for (let key of Object.keys(this.woodMap)) {
                            if (key.includes(genus)) {
                                valueObject["link"] = this.woodMap[key];
                                break;
                            }
                        }
                    }
                }
                if (valueObject.hasOwnProperty("link")) {
                    sum += valueObject[value];
                    valueObjects.push(valueObject);
                }

                imageLinks[valueObject["name"]] = valueObject["link"]
            }

            /* console.log(group, valueObjects); */

            if (valueObjects.length > 0)
                treeMapData.push({ children: valueObjects, name: group, sum, colname: "level2" });
        }

        return [{ name: "Test", children: treeMapData }, imageLinks];
    }

    generateBarChartDataAllTypes(input) {
        let overAllGrouped = [];
        let barChartData = { "cites": [], "iucn": [], "threat": [] }
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

        barChartData["cites"] = barChartData["cites"].filter(e => e.category !== "DD" && e.category !== null);

        return [barChartData, showIcons];
    }

    generateBarChartData(input, type) {
        let barChartData = {};

        for (let species of Object.keys(input)) {
            if (this.state.hoverSpecies.length > 0 && !this.state.hoverSpecies.includes(species)) {
                continue;
            }
            let value = input[species][type];
            pushOrCreate(barChartData, value, 1);
        }

        let newBarChartData = [];
        for (let value of Object.keys(barChartData)) {
            newBarChartData.push({ category: value, value: barChartData[value].length });
        }

        return newBarChartData;
    }

    generateGroupedBarChartData(input, type) {
        let barChartData = {};
        let subgroupData = {};
        let showIcons = true;

        for (let species of Object.keys(input)) {
            if (this.state.hoverSpecies.length > 0 && !this.state.hoverSpecies.includes(species)) {
                continue;
            }

            if (this.state.speciesData.hasOwnProperty(species)) {
                let value = input[species][type];

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

    fetchAndSetSpecies() {

        let url, mainPart;
        mainPart = this.state.mainPart === "All" ? "" : this.state.mainPart;

        if (this.state.instrument === "Test (all)" || this.state.instrumentGroup === undefined) {
            url = "http://localhost:9000/api/getAllMaterials";
        }
        else {
            url = "http://localhost:9000/api/getMaterial/" + this.state.instrumentGroup;
            if (this.state.instrument !== "") {
                url += "/" + this.state.instrument;
            }

            if (mainPart !== "") {
                url += "/" + mainPart;
            }
        }


        //fetch("http://localhost:9000/api/getMaterial/" + this.state.instrument + "/" + this.state.mainPart)
        fetch("http://localhost:9000/api/getTestMaterial")
            //fetch(url)
            .then(res => res.json())
            .then(data => {
                let speciesObject = {};
                for (let e of data) {
                    if (e.Species.trim() === "")
                        continue;

                    let speciesName = (e.Genus.trim() + " " + e.Species.trim()).trim();
                    if (speciesObject.hasOwnProperty(speciesName)) {
                        speciesObject[speciesName]["origMat"].push({ ...e });

                        if (!speciesObject[speciesName]["groups"].includes(e["Instrument groups"])) {
                            speciesObject[speciesName]["groups"].push(e["Instrument groups"]);
                        }

                        if (!speciesObject[speciesName]["instruments"].includes(e["Instruments"])) {
                            speciesObject[speciesName]["instruments"].push(e["Instruments"]);
                        }

                    }
                    else {
                        e["origMat"] = [{ ...e }];
                        e["groups"] = [e["Instrument groups"]];
                        e["instruments"] = [e["Instruments"]];
                        speciesObject[speciesName] = e;
                    }
                }
                this.setSpecies(speciesObject);
            });
    }

    fetchSpeciesTrades(species) {
        fetch("http://localhost:3000/data/" + replaceSpecialCharacters(species) + "_trades.json")
            .then(res => {
                return res.json();
            })
            .then(function (data) {
                let newSpeciesData = { ...this.state.speciesTrades };

                newSpeciesData[species] = data;
                this.setState({
                    speciesTrades: newSpeciesData
                });
            }.bind(this))
        /*.catch((error) => {
            console.log(`Couldn't find file ${species.trim().replaceSpecialCharacters()}"_trades.json`);
        });*/
    }

    fetchSpeciesThreats(species) {
        fetch("http://localhost:3000/data/" + replaceSpecialCharacters(species) + "_threats.json")
            .then(res => {
                return res.json();
            })
            .then(function (data) {
                if (data) {
                    let newSpeciesData = { ...this.state.speciesData };

                    let newData = getOrCreate(newSpeciesData, species, {});

                    newSpeciesData[species] = { ...newData, threats: data };

                    let newFetchedSpecies = [...this.state.fetchedSpecies, species];

                    if (newFetchedSpecies.length >= Object.keys(newSpeciesData).length * 2) {
                        this.setState({
                            speciesData: newSpeciesData,
                            fetchedSpecies: newFetchedSpecies,
                            finishedFetching: true
                        });
                    }
                    else {

                    }

                }
            }.bind(this))
            .catch((error) => {
                console.log(`Couldn't find file ${replaceSpecialCharacters(species.trim())}_threats.json`);
            });
    }

    fetchSpeciesData(species) {
        let fetchSpeciesOccurrencesBound = this.fetchSpeciesOccurrences.bind(this);
        fetch("http://localhost:3000/data/" + replaceSpecialCharacters(species.trim()) + ".json")
            .then(res => res.json())
            .then(function (data) {
                if (data) {

                    let newSpeciesData = { ...this.state.speciesData };

                    let newData = getOrCreate(newSpeciesData, species, {});

                    newSpeciesData[species] = { ...newData, ...data };

                    let newFetchedSpecies = [...this.state.fetchedSpecies, species];

                    //fetchSpeciesOccurrencesBound(species, data.species);

                    this.setState({
                        speciesData: newSpeciesData,
                        fetchedSpecies: newFetchedSpecies,
                        finishedFetching: newFetchedSpecies.length >= Object.keys(newSpeciesData).length * 2 ? true : false
                    });
                }
            }.bind(this))
            .catch((error) => {
                console.log(`Couldn't find file ${replaceSpecialCharacters(species.trim())}.json`);
            });
    }

    checkAndSet(species, data) {
        let newSpeciesData = { ...this.state.speciesData, ...this.tempSpeciesData };

        let newData = getOrCreate(newSpeciesData, species, {});

        newSpeciesData[species] = { ...newData, ...data };

        let newFetchedSpecies = [...this.state.fetchedSpecies, ...this.tempFetchedSpecies, species];

        //fetchSpeciesOccurrencesBound(species, data.species);

        this.tempSpeciesData = newSpeciesData;
        this.tempFetchedSpecies = newFetchedSpecies;

        if (newFetchedSpecies.length >= Object.keys(newSpeciesData).length) {
            let newMapSpecies = {};
            Object.keys(newSpeciesData).forEach(e => {
                return newMapSpecies[e] = 1;
            });
            this.setState({
                speciesData: this.tempSpeciesData,
                fetchedSpecies: this.tempFetchedSpecies,
                finishedFetching: true,
                mapSpecies: newMapSpecies
            });
        }
    }

    fetchAllSpeciesData(species) {
        fetch("http://localhost:3000/generatedOutput/" + replaceSpecialCharacters(species.trim()) + ".json")
            .then(res => res.json())
            .then(function (data) {
                if (data) {
                    this.checkAndSet(species, data);
                }
            }.bind(this))
            .catch((error) => {
                console.log(`Couldn't find file ${replaceSpecialCharacters(species.trim())}.json`, error);
                this.checkAndSet(species, {});
            });
    }

    fetchSpeciesOccurrences(species, speciesObject) {
        let callback = function (data) {
            let coordinates = data.map(entry => {
                return [parseInt(entry.decimalLatitude), parseInt(entry.decimalLongitude)];
            });

            let newSpeciesData = { ...this.state.speciesOccurrences };

            newSpeciesData[species] = coordinates;
            this.setState({
                speciesOccurrences: newSpeciesData
            });
        }.bind(this);

        if (species.includes(" ")) {
            let speciesKeys = Object.values(speciesObject).map(entry => entry.speciesKey);
            fetch("http://localhost:9000/api/getTreeOccurrences/species", {
                body: JSON.stringify(speciesKeys),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    callback(data);
                })
        }
        else {
            fetch("http://localhost:9000/api/getTreeOccurrences/genus/" + species)
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    /* map.treeCoordinates[species] = data;
     
                    let coordinates = data.map(entry => {
                        return [parseInt(entry.decimalLatitude), parseInt(entry.decimalLongitude)];
                    });
     
                    if (coordinates.length > 0) {
                        mapHelper.addTreeCoordinates(species, coordinates);
                    }
     
                    setTimeout(boundCallback, 5); */
                    callback(data);
                })
        }
    }

    setSpecies(speciesObject) {
        this.speciesDataCache = { ...this.speciesDataCache, ...this.state.speciesData };

        let species = Object.keys(speciesObject);

        this.resetSpeciesData();
        this.setState({ speciesData: speciesObject, species: species, mapSpecies: {}, addAllCountries: false, fetchedSpecies: [] });

        for (let spec of species) {
            if (this.speciesDataCache.hasOwnProperty(spec)) {
                let tmpSpecData = this.speciesDataCache[spec];
                tmpSpecData.groups = speciesObject[spec].groups;
                tmpSpecData.instruments = speciesObject[spec].instruments;
                tmpSpecData.origMat = speciesObject[spec].origMat;
                this.checkAndSet(spec, tmpSpecData);
            }
            else {
                if (this.usePreGenerated) {
                    this.fetchAllSpeciesData(spec);
                }
                else {
                    this.fetchSpeciesData(spec);
                    this.fetchSpeciesThreats(spec);
                }
            }
            //this.fetchSpeciesTrades(spec);
        }
    }

    saveSpeciesSignThreatsToDB(genus, species, signThreats, index) {
        console.log(signThreats);

        setTimeout(() => {
            fetch("http://localhost:9000/api/saveThreatSignToDB", {
                body: JSON.stringify({ genus, species, signThreats }),
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
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
        }
        else {
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
        }
        else {
            return { cites: null, iucn: null, threat: null };
        }
    }

    getTreeThreatLevel(treeName, type = null) {

        let threatsSigns = this.getSpeciesSignThreats(treeName);
        console.log(threatsSigns);
        switch (type) {
            case "economically":
                return citesAssessment.get(threatsSigns.cites);
            case "ecologically":
                if (threatsSigns.iucn !== null) {
                    return iucnAssessment.get(threatsSigns.iucn);
                }
                else {
                    return bgciAssessment.get(threatsSigns.threat);
                }
            default:
                let sumScore = 0.5 * Math.max(citesScore(threatsSigns.cites), 0) + 0.5 * Math.max(iucnScore(threatsSigns.iucn), threatScore(threatsSigns.threat), 0);
                let sumCat = threatScoreReverse(sumScore);
                return sumCat;
        }
    }

    save() {
        let file = new Blob([JSON.stringify(this.state.speciesData, null, 4)], { type: "application/json" });
        let filename = "generatedData.json";
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
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

        for (let scaleValue of scale) {
            scaleElements.push(
                <div key={"scaleElement" + scaleValue.scaleValue} className="scaleElement" style={{
                    width: "70px",
                    height: "20px",
                    display: "inline-block"
                }}>
                    <div className="innerScaleElement color" style={{
                        backgroundColor: scaleValue.scaleColor,
                        border: "solid 1px #f4f4f4",
                        height: "10px"
                    }}></div>
                    <div className="innerScaleElement text" style={{
                        height: "10px",
                        textAlign: "center",
                        fontSize: "smaller"
                    }}>
                        {scaleValue.scaleValue}
                    </div>
                </div >
            );
        }

        return (
            <div style={{ margin: "10px" }}>
                {scaleElements}
            </div >
        );
    }

    setDiversityScale(scale) {
        this.setState({ diversityScale: scale })
    }

    getDiverstiyAttributeSelectOptions() {
        if (this.state.treeThreatType) {
            return citesAppendixSorted.map(e =>
                <option key={e} value={e} name={e}>{e}</option>
            );
        }
        else {
            return Object.keys(iucnColors).map(e =>
                <option key={e} value={e} name={e}>{e}</option>
            );
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
                }
                else {
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

        let [barChartData, showIcons] = this.generateBarChartDataAllTypes(this.state.speciesSignThreats);
        let [treeMapData, imageLinks] = this.generateTreeMapData(this.state.speciesSignThreats);

        return (
            <div>
                <div className="tabPanel" style={{ width: this.state.initWidthForVis + "px", height: window.innerHeight / 2 + "px" }}>
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
                            <TreeMapView id="treeMapView" data={treeMapData}></TreeMapView>
                        </div>
                    </div >
                </div>

                <Orchestra id="orchestraVis"
                    mainPart={this.state.mainPart}
                    instrument={this.state.instrument}
                    instrumentGroup={this.state.instrumentGroup}
                    setInstrumentGroup={this.setInstrumentGroup.bind(this)}
                    setInstrument={this.setInstrument.bind(this)}
                    setInstrumentAndMainPart={this.setInstrumentAndMainPart.bind(this)}
                />

                <div style={{ "display": "flex", "justifyContent": "center", "margin": "20px 0" }} >
                    <div style={{ width: "25%", height: "auto", display: "grid", gridTemplateColumns: "50% 50%", gridTemplateRows: "auto auto" }}>
                        <div style={{ gridColumnStart: 1, gridColumnEnd: 1, gridRowStart: 1, gridRowEnd: 1, }}>
                            Instrument Group:
                        </div>
                        <div style={{ gridColumnStart: 2, gridColumnEnd: 2, gridRowStart: 1, gridRowEnd: 1, }}>
                            {this.state.instrumentGroup}
                        </div>
                        <div style={{ gridColumnStart: 1, gridColumnEnd: 1, gridRowStart: 2, gridRowEnd: 2, }}>
                            Instrument:
                        </div>
                        <div style={{ gridColumnStart: 2, gridColumnEnd: 2, gridRowStart: 2, gridRowEnd: 2, }}>
                            {this.state.instrument}
                        </div>
                        <div style={{ gridColumnStart: 1, gridColumnEnd: 1, gridRowStart: 3, gridRowEnd: 3, }}>
                            Main Part:
                        </div>
                        <div style={{ gridColumnStart: 2, gridColumnEnd: 2, gridRowStart: 3, gridRowEnd: 3, }}>
                            <select
                                id="mainPartSelect"
                                value={this.state.mainPart}
                                onChange={this.onSelectChange.bind(this)}>
                                {
                                    this.state.mainPartList.map(e =>
                                        <option key={e} value={e} name={e}>{e}</option>
                                    )
                                }
                            </select>
                        </div>
                    </div>
                    <button onClick={this.fetchAndSetSpecies.bind(this)}>Run!</button>
                </div>
                {/* <DataTable data={this.state.speciesData}
                    threatData={this.state.speciesThreats}
                    tradeData={this.state.speciesTrades}
                ></DataTable> */}
                {
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
                    />
                }
                <div style={{
                    width: "100%",
                    height: "auto",
                    display: "grid",
                    gridTemplateColumns: "50% 50%",
                    gridTemplateRows: "auto auto"
                }}>
                    {Object.keys(this.state.speciesData).length > 0 &&
                        <div style={{
                            gridColumnStart: 1,
                            gridColumnEnd: 1,
                            gridRowStart: 1,
                            gridRowEnd: 1,
                            marginTop: "30px",
                            height: window.innerHeight / 2 + "px",
                            overflow: "unset"
                        }}>
                            <TimelineView
                                data={this.state.speciesData}
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
                                getTreeThreatLevel={this.getTreeThreatLevel.bind(this)}
                                treeImageLinks={imageLinks}
                                setHover={this.setHover.bind(this)}
                            />
                            <div
                                key="tooltip"
                                id="tooltip"
                                className="tooltip">
                            </div>
                        </div>
                    }
                    <div style={{
                        gridColumnStart: 2,
                        gridColumnEnd: 2,
                        gridRowStart: 1,
                        gridRowEnd: 1,
                        marginTop: "30px"
                    }}>
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
                        <button onClick={(event) => {
                            this.toggleTreeThreatType();
                        }}>
                            {this.state.treeThreatType ? "Economically" : "Ecologically"}
                        </button>
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
                        {/* {
                            <button onClick={(event) => { this.save(); }}>
                            {"Save"}
                            </button>
                        } */}
                        {
                            this.renderMapScale(this.state.diversityScale)
                        }
                        <div className="tabPanel" style={{ width: this.state.initWidthForVis + "px", height: window.innerHeight / 2 + "px" }}>
                            <div
                                className="tabButton"
                                onClick={(event) => {
                                    /* this.activateTab("maps", "diversityMapTab"); */
                                    this.activateDiversity();
                                }}
                                style={{
                                    //border: this.state.tabs["maps"]["diversityMapTab"] ? "1px solid gray" : "none"
                                    border: this.state.diversity ? "1px solid gray" : "none"
                                }}
                            >
                                {"Diversity"}
                            </div>
                            <div
                                className="tabButton"
                                onClick={(event) => {
                                    //this.activateTab("maps", "threatMapTab");
                                    this.activateHeatMap();
                                }}
                                style={{
                                    //border: this.state.tabs["maps"]["threatMapTab"] ? "1px solid gray" : "none"
                                    border: this.state.heatMap ? "1px solid gray" : "none"
                                }}
                            >
                                {"Threat"}
                            </div>
                            <div style={{}}>
                                <div className="tab"
                                    id="diversityMapTab"
                                    ref={this.diversityMapTab}
                                    style={{
                                        visibility: this.state.tabs["maps"]["diversityMapTab"] ? "visible" : "hidden",
                                        position: "absolute",
                                        top: "30px"
                                    }}>
                                    {< Map
                                        id="map"
                                        data={this.state.speciesData}
                                        initWidth={this.state.initWidthForVis}
                                        mapSpecies={this.state.mapSpecies}
                                        getTreeThreatLevel={this.getTreeThreatLevel.bind(this)}
                                        heatMap={this.state.heatMap}
                                        diversity={this.state.diversity}
                                        coordinates={this.state.speciesOccurrences}
                                        setDiversityScale={this.setDiversityScale.bind(this)}
                                        treeThreatType={this.state.treeThreatType}
                                        diversityMode={this.state.diversityMode}
                                        diversityAttribute={this.state.diversityAttribute}
                                        speciesImageLinks={imageLinks}
                                        hoverSpecies={this.state.hoverSpecies}
                                    ></Map>}
                                </div>
                                <div className="tab"
                                    id="threatMapTab"
                                    ref={this.threatMapTab}
                                    style={{
                                        visibility: this.state.tabs["maps"]["threatMapTab"] ? "visible" : "hidden",
                                        position: "absolute",
                                        top: "30px"
                                    }}>
                                    {/* <Map
                                        id="dangerMap"
                                        data={this.state.speciesData}
                                        initWidth={this.state.initWidthForVis}
                                        mapSpecies={this.state.mapSpecies}
                                        getTreeThreatLevel={this.getTreeThreatLevel.bind(this)}
                                        heatMap={true}
                                        diversity={false}
                                        coordinates={this.state.speciesOccurrences}
                                        setDiversityScale={this.setDiversityScale.bind(this)}
                                        treeThreatType={this.state.treeThreatType}
                                        diversityMode={this.state.diversityMode}
                                        diversityAttribute={this.state.diversityAttribute}
                                    ></Map> */}
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        );
    }
}

export default Home;