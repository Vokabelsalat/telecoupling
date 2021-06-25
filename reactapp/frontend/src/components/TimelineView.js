import React, { Component } from 'react';
import Timeline from './Timeline.js';
import { TimelineDatagenerator } from '../utils/TimelineDatagenerator'
import timelinedata from '../data/timelinedata.json'

class TimelineView extends Component {
    constructor(props) {
        super(props);

        this.usePreGenerated = props.usePreGenerated;

        this.state = {
            zoomLevel: 0,
            maxZoomLevel: 2,
            sourceColorMap: {},
            data: {},
            maxPerYear: 0,
            domainYears: [],
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
        let tmpdata;
        let domainYears;
        if (this.usePreGenerated === false) {
            let generator = new TimelineDatagenerator(this.state.oldTimelineData);
            generator.processData(this.props.data, this.props.tradeData);

            tmpdata = generator.getData();

            domainYears = generator.getDomainYears();
        }
        else {
            tmpdata = this.props.data;
        }

        let reducer = (accumulator, currentValue) => { return accumulator + currentValue.length; };
        let sortedKeys = Object.keys(tmpdata).sort((a, b) => {
            if (!tmpdata[b].hasOwnProperty("timeIUCN")) {
                return -1;
            }
            else if (!tmpdata[a].hasOwnProperty("timeIUCN")) {
                return 1;
            }
            else {
                return (tmpdata[b].timeIUCN.length + tmpdata[b].timeListing.length + tmpdata[b].timeThreat.length) - (tmpdata[a].timeIUCN.length + tmpdata[a].timeListing.length + tmpdata[a].timeThreat.length);
            }
        });

        let maxPerYear = Math.max(...Object.values(tmpdata).map(e => e.hasOwnProperty("timeThreat") ? (e.timeThreat.length > 0 ? e.timeThreat[0].maxPerYear : 0) : 0));

        if (this.usePreGenerated) {
            let allTimeExtends = [];
            Object.values(tmpdata).forEach(e => {
                if (e.hasOwnProperty("timeExtent")) {
                    e.timeExtent.forEach(i => {
                        if (i !== null)
                            allTimeExtends.push(parseInt(i))
                    });
                }
            });

            let maxYear = Math.max(...allTimeExtends);
            let minYear = Math.min(...allTimeExtends);

            domainYears = { minYear, maxYear };
        }

        this.setState({
            "maxPerYear": maxPerYear,
            "sortedKeys": sortedKeys,
            "data": tmpdata,
            "domainYears": domainYears,
            "sourceColorMap": {},
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

    addUnmutedSpecies(species) {
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
        this.setState({ unmutedSpecies: {} });
    }

    render() {
        let renderTimelines = false;
        if (Number.isInteger(this.state.domainYears.minYear) && Number.isInteger(this.state.domainYears.maxYear)) {
            if (this.state.domainYears.maxYear - this.state.domainYears.minYear > 0) {
                renderTimelines = true;
            }
        }

        if (renderTimelines) {
            return (
                <div>
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
                        initWidth={this.props.initWidth}
                        key={"scaleToptimeline"}
                        data={null}
                        speciesName={"scaleTop"}
                        sourceColorMap={this.state.sourceColorMap}
                        domainYears={this.state.domainYears}
                        zoomLevel={this.state.zoomLevel}
                    />
                    <div style={{ maxHeight: window.innerHeight / 2 + "px", overflowY: "scroll" }}> {
                        this.state.sortedKeys
                            /* .filter(e => {
                                return e.trim().includes(" ")
                            }) */
                            .map(e => {
                                return (
                                    <Timeline
                                        id={e.replaceSpecialCharacters() + "TimelineVis"}
                                        key={e.replaceSpecialCharacters() + "timeline"}
                                        data={this.state.data[e]}
                                        initWidth={this.props.initWidth}
                                        speciesName={e}
                                        sourceColorMap={this.state.sourceColorMap}
                                        domainYears={this.state.domainYears}
                                        zoomLevel={this.state.zoomLevel}
                                        setZoomLevel={this.setZoomLevel.bind(this)}
                                        maxPerYear={this.state.maxPerYear}
                                        pieStyle={this.props.pieStyle}
                                        groupSame={this.props.groupSame}
                                        heatStyle={this.props.heatStyle}
                                        sortGrouped={this.props.sortGrouped}
                                        justGenus={e.trim().includes(" ") ? false : true}
                                        setSpeciesSignThreats={this.props.setSpeciesSignThreats}
                                        getSpeciesSignThreats={this.props.getSpeciesSignThreats}
                                        getTreeThreatLevel={this.props.getTreeThreatLevel}
                                        addSpeciesToMap={this.props.addSpeciesToMap}
                                        removeSpeciesFromMap={this.props.removeSpeciesFromMap}
                                        muted={Object.keys(this.state.unmutedSpecies).includes(e) ? false :
                                            Object.keys(this.state.unmutedSpecies).length > 0 ? true : false}
                                        removeAllUnmutedSpecies={this.removeAllUnmutedSpecies.bind(this)}
                                        addUnmutedSpecies={this.addUnmutedSpecies.bind(this)}
                                        removeUnmutedSpecies={this.removeUnmutedSpecies.bind(this)}
                                        treeImageLinks={this.props.treeImageLinks}
                                        setHover={this.props.setHover}
                                    />
                                )
                            })
                    } </div>
                    <Timeline
                        id={"scaleBottom2"}
                        initWidth={this.props.initWidth}
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