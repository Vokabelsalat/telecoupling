import React, { Component } from 'react';

class Timeline extends Component {
    constructor(props) {
        super(props);
        this.state = { apiResponse: "" };
    }

    /* callAPI() {
        fetch("http://localhost:9000/api")
            .then(res => res.text())
            .then(res => this.setState({ apiResponse: res }));
    } */

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <h2>Timeline</h2>
            </div>
        );
    }
}

export default Timeline;