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
            sortedKeys: []
        };
    }

    componentDidMount() {
        this.create();
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(Object.keys(prevProps.data).sort()) !==
            JSON.stringify(Object.keys(this.props.data).sort())) {
            this.create();
        }
    }

    create() {
        let generator = new TimelineDatagenerator();
        generator.processData(this.props.data, this.props.threatData, this.props.tradeData);

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

    setPieStyle(setValue) {
        this.setState({ pieStyle: setValue });
    }

    onPieStyle(style) {
        this.setPieStyle(style);
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
                    <Legend
                        onZoom={() => this.onZoom(1)}
                        onZoomOut={() => this.onZoom(-1)}
                        zoomLevel={this.state.zoomLevel}
                        maxZoomLevel={this.state.maxZoomLevel}
                        onPieStyle={this.onPieStyle.bind(this)}
                        pieStyle={this.state.pieStyle}
                    />
                    <br />
                    <Timeline
                        id={"scaleTop"}
                        key={"scaleToptimelineLegend"}
                        data={null}
                        speciesName={"scaleTop"}
                        sourceColorMap={this.state.sourceColorMap}
                        domainYears={this.state.domainYears}
                        zoomLevel={this.state.zoomLevel}
                    />
                    <div> {
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
                                    justTrade={true}
                                />
                            )
                        })
                    } </div>
                    <Timeline
                        id={"scaleBottom"}
                        key={"scaleBottomtimelineLegend"}
                        data={null}
                        speciesName={"scaleBottom"}
                        sourceColorMap={this.state.sourceColorMap}
                        domainYears={this.state.domainYears}
                        zoomLevel={this.state.zoomLevel}
                    />
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
                                    key={e + "timeline"}
                                    data={this.state.data[e]}
                                    speciesName={e}
                                    sourceColorMap={this.state.sourceColorMap}
                                    domainYears={this.state.domainYears}
                                    zoomLevel={this.state.zoomLevel}
                                    maxPerYear={this.state.maxPerYear}
                                    pieStyle={this.state.pieStyle}
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
                </div>
            );
        }
        else {
            return <div></div>
        }
    }
}

export default TimelineView;