import React, { Component } from 'react';
import Timeline from './Timeline.js';
import Legend from './Legend.js';
import { TimelineDatagenerator } from '../utils/TimelineDatagenerator'
import timelinedata from '../data/timelinedata.json'

class TimelineView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            zoomLevel: 0,
            maxZoomLevel: 2,
            sourceColorMap: {},
            data: {},
            maxPerYear: 0,
            domainYears: [],
            pieStyle: "pie",
            groupSame: true,
            sortGrouped: "trend",
            heatStyle: "dom",
            sortedKeys: [],
            speciesSignThreats: {},
            oldTimelineData: {},
            unmutedSpecies: {}
        };
    }

    componentDidMount() {
        this.create();
    }

    compareObjects(objA, objB) {
        let keysA = Object.keys(objA).sort();
        let keysB = Object.keys(objB).sort();
        if (JSON.stringify(keysA) !==
            JSON.stringify(keysB)) {
            return false;
        }
        else {
            for (let key of keysA.values()) {
                let valueA = objA[key];

                if (Array.isArray(valueA)) {
                    if (valueA.length !== objB[key]) {
                        return false;
                    }
                }
                else {
                    if (
                        JSON.stringify(Object.keys(valueA).sort()) !==
                        JSON.stringify(Object.keys(objB[key]).sort())
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    componentDidUpdate(prevProps) {

        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            //console.log("update timeline");
            this.create();
        }

        /*  let create = false;
         for (let species of Object.keys(this.props.data)) {
             if (!prevProps.data.hasOwnProperty(species)) {
                 this.create();
                 break;
             }
             else {
                 console.log(species, this.props.data.threats !== undefined ? this.props.data.threats.length : 0);
             }
         } */

    }

    create() {
        let generator = new TimelineDatagenerator(this.state.oldTimelineData);
        generator.processData(this.props.data, this.props.tradeData);

        let tmpdata = generator.getData();
        let reducer = (accumulator, currentValue) => { return accumulator + currentValue.length; };
        let sortedKeys = Object.keys(tmpdata).sort((a, b) => {
            return Object.values(tmpdata[b].timeTrade[1]).reduce(reducer, 0) - Object.values(tmpdata[a].timeTrade[1]).reduce(reducer, 0);
        });
        let maxPerYear = Math.max(...Object.values(tmpdata).map(e => e.timeThreat.length > 0 ? e.timeThreat[0].maxPerYear : 0));

        this.setState({
            "maxPerYear": maxPerYear,
            "sortedKeys": sortedKeys,
            "data": tmpdata,
            "domainYears": generator.getDomainYears(),
            "sourceColorMap": generator.getSourceColorMap(),
            "oldTimelineData": tmpdata
        });
    }

    setZoomLevel(setValue) {
        this.setState({ zoomLevel: setValue });
    }

    onZoom(add) {
        let zoomLevel = this.state.zoomLevel + add;
        zoomLevel = Math.min(zoomLevel, this.state.maxZoomLevel);
        zoomLevel = Math.max(zoomLevel, 0);

        this.setZoomLevel(zoomLevel);
    }

    setMuted(setValue) {
        this.setState({ muted: setValue });
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

    setHeatStyle(setValue) {
        this.setState({ heatStyle: setValue });
    }

    onHeatStyle(style) {
        this.setHeatStyle(style);
    }

    addUnmutedSpecies(species) {
        console.log("add unmuted species", species);
        let newUnmutedSpecies = { ...this.state.unmutedSpecies };
        newUnmutedSpecies[species] = 1;
        this.setState({ unmutedSpecies: newUnmutedSpecies });
    }

    removeUnmutedSpecies(species) {
        let newUnmutedSpecies = { ...this.state.unmutedSpecies };
        delete newUnmutedSpecies[species];
        this.setState({ unmutedSpecies: newUnmutedSpecies });
    }

    removeAllUnmutedSpecies() {
        console.log("remove all!");
        this.setState({ unmutedSpecies: {} });
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
            speciesSignThreats[key] = { cites: "DD", iucn: "DD", threat: "DD" };
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
            return { cites: "DD", iucn: "DD", threat: "DD" };
        }
    }

    render() {
        console.log(this.state.unmutedSpecies);
        let renderTimelines = false;
        if (Number.isInteger(this.state.domainYears.minYear) && Number.isInteger(this.state.domainYears.maxYear)) {
            if (this.state.domainYears.maxYear - this.state.domainYears.minYear > 0) {
                renderTimelines = true;
            }
        }

        if (renderTimelines) {
            return (
                <div>
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
                    /* <br />
                    <Timeline
                        id={"scaleTop"}
                        key={"scaleToptimelineLegend"}
                        data={null}
                        speciesName={"scaleTop"}
                        sourceColorMap={this.state.sourceColorMap}
                        domainYears={this.state.domainYears}
                        zoomLevel={this.state.zoomLevel}
                    /> */}
                    {/*                     <div> {
                        this.state.sortedKeys.filter(key => this.state.data[key].timeTrade[0].length > 1).map(e => {
                            return (
                                <Timeline
                                    id={e.replaceSpecialCharacters() + "TimelineVisJustTrade"}
                                    key={e + "timelineJustTrade"}
                                    data={this.state.data[e]}
                                    speciesName={e}
                                    sourceColorMap={this.state.sourceColorMap}
                                    domainYears={this.state.domainYears}
                                    zoomLevel={this.state.zoomLevel}
                                    maxPerYear={this.state.maxPerYear}
                                    pieStyle={this.state.pieStyle}
                                    groupSame={this.state.groupSame}
                                    sortGrouped={this.state.sortGrouped}
                                    heatStyle={this.state.heatStyle}
                                    justTrade={true}
                                    getSpeciesSignThreats={this.getSpeciesSignThreats.bind(this)}
                                />
                            )
                        })
                    } </div> */}
                    {/*  <Timeline
                        id={"scaleBottom"}
                        key={"scaleBottomtimelineLegend"}
                        data={null}
                        speciesName={"scaleBottom"}
                        sourceColorMap={this.state.sourceColorMap}
                        domainYears={this.state.domainYears}
                        zoomLevel={this.state.zoomLevel}
                    /> */}
                    <Timeline
                        id={"scaleTop2"}
                        key={"scaleToptimeline"}
                        data={null}
                        speciesName={"scaleTop"}
                        sourceColorMap={this.state.sourceColorMap}
                        domainYears={this.state.domainYears}
                        zoomLevel={this.state.zoomLevel}
                    />
                    <div> {
                        this.state.sortedKeys.map(e => {
                            return (
                                <Timeline
                                    id={e.replaceSpecialCharacters() + "TimelineVis"}
                                    key={e.replaceSpecialCharacters() + "timeline"}
                                    data={this.state.data[e]}
                                    speciesName={e}
                                    sourceColorMap={this.state.sourceColorMap}
                                    domainYears={this.state.domainYears}
                                    zoomLevel={this.state.zoomLevel}
                                    setZoomLevel={this.setZoomLevel.bind(this)}
                                    maxPerYear={this.state.maxPerYear}
                                    pieStyle={this.state.pieStyle}
                                    groupSame={this.state.groupSame}
                                    heatStyle={this.state.heatStyle}
                                    sortGrouped={this.state.sortGrouped}
                                    justGenus={e.trim().includes(" ") ? false : true}
                                    setSpeciesSignThreats={this.setSpeciesSignThreats.bind(this)}
                                    getSpeciesSignThreats={this.getSpeciesSignThreats.bind(this)}
                                    addTreeSpeciesToMap={this.props.addTreeSpeciesToMap}
                                    removeTreeSpeciesFromMap={this.props.removeTreeSpeciesFromMap}
                                    muted={Object.keys(this.state.unmutedSpecies).includes(e) ? false :
                                        Object.keys(this.state.unmutedSpecies).length > 0 ? true : false}
                                    removeAllUnmutedSpecies={this.removeAllUnmutedSpecies.bind(this)}
                                    addUnmutedSpecies={this.addUnmutedSpecies.bind(this)}
                                    removeUnmutedSpecies={this.removeUnmutedSpecies.bind(this)}
                                />
                            )
                        })
                    } </div>
                    <Timeline
                        id={"scaleBottom2"}
                        key={"scaleBottomtimeline"}
                        data={null}
                        speciesName={"scaleBottom"}
                        sourceColorMap={this.state.sourceColorMap}
                        domainYears={this.state.domainYears}
                        zoomLevel={this.state.zoomLevel}
                    />
                </div >
            );
        }
        else {
            return <div></div>
        }
    }
}

export default TimelineView;