import React, { Component, useEffect } from 'react';
import Orchestra from './Orchestra';
import DataTable from './DataTable';
import BarChart from './BarChart';
import Legend from './Legend';
import TimelineView from "./TimelineView";
import { getOrCreate, iucnToDangerMap, dangerSorted, pushOrCreate, getThreatColor } from "../utils/utils";
import { iucnScore, threatScore, citesScore, citesScoreReverse, threatScoreReverse, citesAppendixSorted, iucnColors, getCitesColor, getIucnColor } from '../utils/timelineUtils';
import Map from "./Map";

class Home extends Component {
    constructor(props) {
        super(props);

        this.usePreGenerated = true;

        this.state = {
            species: [],
            speciesData: {},
            instrumentGroup: props.instrumentGroup,
            instrument: props.instrument,
            mainPart: props.mainPart,
            mainPartList: [],
            mapSpecies: {},
            speciesSignThreats: {},
            pieStyle: "pie",
            groupSame: true,
            sortGrouped: "trend",
            heatStyle: "dom",
            addAllCountries: false,
            heatMap: false,
            diversity: false,
            initWidthForVis: 900,
            fetchedSpecies: [],
            finishedFetching: false,
            diversityScale: [],
            treeThreatType: true,
            diversityMode: true,
            barChartData: { "cites": [], "iucn": [], "threat": [] }
            /*          speciesTrades: {},
                     speciesThreats: {}, */
        };
    }

    componentDidMount() {
    }

    componentDidUpdate() {
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

            this.saveSpeciesSignThreatsToDB(genus, speciesName, signThreat, index);
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
    }

    setInstrument(instrument) {
        this.setState({ ...this.state, instrument: instrument, mainPart: "" });
        this.getMainParts(instrument);
    }

    onSelectChange(event) {
        this.setMainPart(event.target.value);
    }

    setMainPart(mainPart) {
        this.setState({ ...this.state, mainPart: mainPart });
    }

    setInstrumentAndMainPart(instrument, mainPart) {
        this.setState({ ...this.state, instrument, mainPart });
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
        this.setState({ heatMap: true });
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
        this.setState({ diversity: true });
    }

    deactivateDiversity() {
        this.setState({ diversity: false });
    }

    generateBarChartData(input, type) {
        let barChartData = {};

        for (let species of Object.keys(input)) {
            let value = input[species][type];
            pushOrCreate(barChartData, value, 1);
        }

        let newBarChartData = [];
        for (let value of Object.keys(barChartData)) {
            newBarChartData.push({ category: value, value: barChartData[value].length });
        }

        return newBarChartData;
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

    fetchAndSetSpecies() {
        let url, mainPart;
        mainPart = this.state.mainPart === "All" ? "" : this.state.mainPart;

        if (this.state.instrument === "Test (all)") {
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
        //fetch("http://localhost:9000/api/getTestMaterial")
        fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                let speciesObject = {};
                for (let e of data) {
                    speciesObject[(e.Genus.trim() + " " + e.Species.trim()).trim()] = e;
                }
                this.setSpecies(speciesObject);
            });
        /*}
          else {
             this.setSpecies({});
         } */
    }

    fetchSpeciesTrades(species) {
        fetch("http://localhost:3000/data/" + species.replaceSpecialCharacters() + "_trades.json")
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
        fetch("http://localhost:3000/data/" + species.replaceSpecialCharacters() + "_threats.json")
            .then(res => {
                return res.json();
            })
            .then(function (data) {
                if (data) {
                    let newSpeciesData = { ...this.state.speciesData };

                    let newData = getOrCreate(newSpeciesData, species, {});

                    newSpeciesData[species] = { ...newData, threats: data };

                    let newFetchedSpecies = [...this.state.fetchedSpecies, species];

                    this.setState({
                        speciesData: newSpeciesData,
                        fetchedSpecies: newFetchedSpecies,
                        finishedFetching: newFetchedSpecies.length >= Object.keys(newSpeciesData).length * 2 ? true : false
                    });
                }
            }.bind(this))
            .catch((error) => {
                console.log(`Couldn't find file ${species.trim().replaceSpecialCharacters()}_threats.json`);
            });
    }

    fetchSpeciesData(species) {
        let fetchSpeciesOccurrencesBound = this.fetchSpeciesOccurrences.bind(this);
        fetch("http://localhost:3000/data/" + species.trim().replaceSpecialCharacters() + ".json")
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
                console.log(`Couldn't find file ${species.trim().replaceSpecialCharacters()}.json`);
            });
    }

    fetchAllSpeciesData(species) {
        console.log("JE", species, "http://localhost:3000/generatedOutput/" + species.trim().replaceSpecialCharacters() + ".json");
        fetch("http://localhost:3000/generatedOutput/" + species.trim().replaceSpecialCharacters() + ".json")
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
                console.log(`Couldn't find file ${species.trim().replaceSpecialCharacters()}.json`);
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
        let species = Object.keys(speciesObject);
        this.setState({ speciesData: speciesObject, species: species, mapSpecies: {}, addAllCountries: false, fetchedSpecies: [] });

        for (let spec of species) {
            if (this.usePreGenerated) {
                this.fetchAllSpeciesData(spec);
            }
            else {
                this.fetchSpeciesData(spec);
                this.fetchSpeciesThreats(spec);
            }

            //this.fetchSpeciesTrades(spec);
        }
    }

    saveSpeciesSignThreatsToDB(genus, species, signThreats, index) {
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

                let newBarChartData = { ...this.state.barChartData };
                newBarChartData[subkey] = this.generateBarChartData(speciesSignThreats, subkey);

                this.setState({ speciesSignThreats: speciesSignThreats, barChartData: newBarChartData });
            }
        }
        else {
            let speciesSignThreats = this.state.speciesSignThreats;
            speciesSignThreats[key] = { cites: "DD", iucn: "DD", threat: "DD" };
            speciesSignThreats[key][subkey] = value;

            let newBarChartData = { ...this.state.barChartData };
            newBarChartData[subkey] = this.generateBarChartData(speciesSignThreats, subkey);

            this.setState({ speciesSignThreats: speciesSignThreats, barChartData: newBarChartData });
        }
    }

    getSpeciesSignThreats(species) {
        if (this.state.speciesSignThreats.hasOwnProperty(species)) {
            let returnElement = this.state.speciesSignThreats[species];
            return returnElement;
        }
        else {
            return { cites: "DD", iucn: "DD", threat: "DD" };
        }
    }

    getTreeThreatLevel(treeName, type = null) {

        let threatsSigns = this.getSpeciesSignThreats(treeName);
        switch (type) {
            case "economically":
                return citesScoreReverse(Math.max(citesScore(threatsSigns.cites), 0));
            case "ecologically":
                //console.log(treeName, type, dangerSorted, threatsSigns.iucn + " => " + iucnToDangerMap[threatsSigns.iucn], threatsSigns.threat, Math.max(dangerSorted.indexOf(iucnToDangerMap[threatsSigns.iucn]), dangerSorted.indexOf(threatsSigns.threat), 0));
                return dangerSorted[Math.max(dangerSorted.indexOf(iucnToDangerMap[threatsSigns.iucn]), dangerSorted.indexOf(threatsSigns.threat), 0)];
            default:
                let sumScore = 0.5 * Math.max(citesScore(threatsSigns.cites), 0) + 0.5 * Math.max(iucnScore(threatsSigns.iucn), threatScore(threatsSigns.threat), 0);
                let sumCat = threatScoreReverse(sumScore);
                return sumCat;
        }
    }

    save() {
        console.log("SAVE!", Object.keys(this.state.speciesData).length);
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
                    width: "60px",
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

    render() {
        console.log("SPECIES DATA", this.state.speciesData, this.state.instrument);
        return (
            <div>
                <Orchestra id="orchestraVis"
                    mainPart={this.state.mainPart}
                    instrument={this.state.instrument}
                    instrumentGroup={this.state.instrumentGroup}
                    setInstrumentGroup={this.setInstrumentGroup.bind(this)}
                    setInstrument={this.setInstrument.bind(this)}
                    setInstrumentAndMainPart={this.setInstrumentAndMainPart.bind(this)}
                />
                <BarChart id="citesBars" data={this.state.barChartData["cites"]} colorFunction={getCitesColor}></BarChart>
                <BarChart id="iucnBars" data={this.state.barChartData["iucn"]} colorFunction={getIucnColor}></BarChart>
                <BarChart id="threatBars" data={this.state.barChartData["threat"]} colorFunction={getThreatColor}></BarChart>

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
                {<Legend
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
                            marginTop: "30px"
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
                        <button onClick={(event) => {
                            if (this.state.addAllCountries === false) {
                                this.addAllCountries();
                            }
                            else {
                                this.removeAllCountries();
                            }
                        }}>
                            {this.state.addAllCountries ? "Remove all Countries" : "Add all countries"}
                        </button>
                        <button onClick={(event) => {
                            if (this.state.heatMap === false) {
                                this.activateHeatMap();
                            }
                            else {
                                this.deactivateHeatMap();
                            }
                        }}>
                            {this.state.heatMap ? "Deactivate HeatMap" : "Activate HeatMap"}
                        </button>
                        <button onClick={(event) => {
                            if (this.state.diversity === false) {
                                this.activateDiversity();
                            }
                            else {
                                this.deactivateDiversity();
                            }
                        }}>
                            {this.state.diversity ? "Deactivate Diversity" : "Activate Diversity"}
                        </button>
                        <button onClick={(event) => {
                            this.toggleTreeThreatType();
                        }}>
                            {this.state.treeThreatType ? "Economically" : "Ecologically"}
                        </button>
                        <button onClick={(event) => {
                            this.toggleDiversityMapMode();
                        }}>
                            {this.state.diversityMode ? "Distribution" : "Eco/Eco"}
                        </button>
                        <select
                            id="diversitySelect"
                            value={this.state.diversityAttribute}
                            onChange={this.onSelectChangeDiversityAttribute.bind(this)}>
                            {
                                this.getDiverstiyAttributeSelectOptions()
                            }
                        </select>
                        {/* {
                            <button onClick={(event) => { this.save(); }}>
                                {"Save"}
                            </button>
                        } */}
                        {
                            this.renderMapScale(this.state.diversityScale)
                        }
                        {
                            <Map
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
                            ></Map>
                        }
                    </div >
                </div >
            </div >
        );
    }
}

export default Home;