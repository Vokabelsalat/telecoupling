import React, { Component } from 'react';
import BarChartHelper from './BarChartHelper';
import '../utils/utils';

class BarChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            data: this.props.data,
            colorFunction: this.props.colorFunction
        };
    }

    componentDidMount() {
        BarChartHelper.draw({
            id: this.state.id,
            data: this.state.data,
            colorFunction: this.state.colorFunction
        });
    }

    componentDidUpdate() {
        console.log("UPDATED BARCHART");
        BarChartHelper.draw({
            id: this.state.id,
            data: this.props.data,
            colorFunction: this.state.colorFunction
        });
    }

    render() {
        return (
            <div id={this.state.id} style={{ display: "inline-block" }}></div>
        );
    }
}

export default BarChart;