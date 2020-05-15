import React, { Component } from 'react';
import drawTimeline from './TimelineHelper';
import '../utils/utils';

class Timeline extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.speciesName.replaceSpecialCharacters() + "TimelineVis",
            data: this.props.data,
            sourceColorMap: this.props.sourceColorMap,
            domainYears: this.props.domainYears
        };
    }

    /* callAPI() {
        fetch("http://localhost:9000/api")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }));
    } */

    componentDidMount() {
        drawTimeline({ id: this.state.id, data: this.state.data, sourceColorMap: this.state.sourceColorMap, domainYears: this.state.domainYears });
    }

    componentDidUpdate() {
        drawTimeline({ id: this.state.id, data: this.state.data, sourceColorMap: this.state.sourceColorMap, domainYears: this.state.domainYears });
    }

    render() {
        return (
            <div id={this.state.id}></div>
        );
    }
}

export default Timeline;