import React, { Component } from 'react';
import Timeline from './Timeline.js';
import Legend from './Legend.js';

class TimelineView extends Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
    }

    callAPI() {
        fetch("http://localhost:9000/api")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }));
    }

    componentDidMount() {
        this.callAPI();
    }

    render() {
        return (
            <div>
                <h1>TimelineView</h1>
                <Legend />
                <br />
                <div>{this.state.apiResponse}</div>
                <Timeline />
            </div>
        );
    }
}

export default TimelineView;