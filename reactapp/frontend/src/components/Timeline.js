import React, { Component } from 'react';
import TimelineHelper from './TimelineHelper';
import '../utils/utils';

class Timeline extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            zoomLevel: this.props.zoomLevel
        };
    }

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