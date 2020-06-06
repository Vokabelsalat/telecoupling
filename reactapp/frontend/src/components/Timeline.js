import React, { Component } from 'react';
import TimelineHelper from './TimelineHelper';
import '../utils/utils';

class Timeline extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.speciesName.replaceSpecialCharacters() + "TimelineVis",
        };
    }

    /* callAPI() {
        fetch("http://localhost:9000/api")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }));
    } */

    componentDidMount() {
        TimelineHelper.draw({
            id: this.state.id,
            data: this.props.data,
            sourceColorMap: this.props.sourceColorMap,
            domainYears: this.props.domainYears,
            zoomLevel: this.props.zoomLevel,
            speciesName: this.props.speciesName,
            maxPerYear: this.props.maxPerYear,
            pieStyle: this.props.pieStyle
        });
    }

    componentDidUpdate() {
        TimelineHelper.draw({
            id: this.state.id,
            data: this.props.data,
            sourceColorMap: this.props.sourceColorMap,
            domainYears: this.props.domainYears,
            zoomLevel: this.props.zoomLevel,
            speciesName: this.props.speciesName,
            maxPerYear: this.props.maxPerYear,
            pieStyle: this.props.pieStyle
        });
    }

    render() {
        return (
            <div id={this.state.id}></div>
        );
    }
}

export default Timeline;