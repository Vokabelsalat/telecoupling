import React, { Component } from 'react';
import '../utils/utils';
import TreeMapHelper from './TreeMapHelper';

class TreeMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            data: this.props.data
        };
    }

    componentDidMount() {
        TreeMapHelper.draw({
            id: this.state.id,
            data: this.state.data
        });
    }

    componentDidUpdate() {
        TreeMapHelper.draw({
            id: this.state.id,
            data: this.props.data
        });
    }

    render() {
        return (
            <div id={this.state.id} style={{ display: "inline-block" }}></div>
        );
    }
}

export default TreeMap;