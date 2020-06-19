import React, { Component } from 'react';
import TimelineHelper from './TimelineHelper';
import '../utils/utils';
import { thresholdScott } from 'd3';

class Timeline extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            zoomLevel: this.props.zoomLevel
        };
    }

    /* callAPI() {
        fetch("http://localhost:9000/api")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }));
    } */

    setZoomLevel(setValue) {
        this.setState({ zoomLevel: setValue });
    }

    componentDidMount() {
        TimelineHelper.draw({
            id: this.state.id,
            data: this.props.data,
            sourceColorMap: this.props.sourceColorMap,
            domainYears: this.props.domainYears,
            zoomLevel: this.state.zoomLevel,
            setZoomLevel: this.setZoomLevel.bind(this),
            speciesName: this.props.speciesName,
            maxPerYear: this.props.maxPerYear,
            pieStyle: this.props.pieStyle,
            justTrade: this.props.justTrade
        });
    }

    componentDidUpdate() {
        TimelineHelper.draw({
            id: this.state.id,
            data: this.props.data,
            sourceColorMap: this.props.sourceColorMap,
            domainYears: this.props.domainYears,
            zoomLevel: this.state.zoomLevel,
            setZoomLevel: this.setZoomLevel.bind(this),
            speciesName: this.props.speciesName,
            maxPerYear: this.props.maxPerYear,
            pieStyle: this.props.pieStyle,
            justTrade: this.props.justTrade
        });
    }

    render() {
        return (
            <div id={this.state.id}></div>
        );
    }
}

export default Timeline;