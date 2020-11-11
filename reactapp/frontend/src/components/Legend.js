import React, { Component } from 'react';
import { iucnColors } from '../utils/timelineUtils';
import { dangerColorMap } from '../utils/utils';

class Legend extends Component {
    /*     constructor(props) {
            super(props);
        } */

    componentDidMount() {
    }

    /*  componentWillReceiveProps(someProps) {
         console.log("RECEIVE!", someProps); */

    /*    this.setState({ ...this.state, someProp }) */
    /*   } */

    render() {
        return (
            <div style={{ textAlign: "center" }}>
                <div>
                    {(Object.keys(iucnColors).map(e => {
                        let style = {
                            display: "inline-block",
                            width: "30px",
                            height: "20px",
                            backgroundColor: iucnColors[e].bg,
                            color: iucnColors[e].fg
                        };
                        return (<div
                            key={e}
                            style={style}
                        >
                            {e}
                        </div>);
                    }))
                    }
                </div>

                <div>
                    {(Object.keys(dangerColorMap).map(e => {
                        let style = {
                            display: "inline-block",
                            width: "30px",
                            height: "20px",
                            backgroundColor: dangerColorMap[e].bg,
                            color: dangerColorMap[e].fg
                        };
                        return (<div
                            key={e}
                            style={style}
                        >
                            {e}
                        </div>);
                    }))
                    }
                </div>

                {/* < div > {this.props.zoomLevel + 1} / {this.props.maxZoomLevel + 1}</div >
                <button onClick={this.props.onZoomOut}>-</button>
                <button onClick={this.props.onZoom}>+</button> */}
                <br />
                <select
                    value={this.props.pieStyle}
                    onChange={(event) => {
                        this.props.onPieStyle(event.target.value);
                    }}>
                    <option value="pie">Pies</option>
                    <option value="bar">Bars</option>
                    <option value="ver">Vertical Bars</option>
                </select>
                <button style={{
                    "marginLeft": "10px"
                }} onClick={(event) => {
                    this.props.onGroupSame(!this.props.groupSame);
                }}>
                    {this.props.groupSame ? "Group Same" : "Not"}
                </button>
                <select
                    value={this.props.sortGrouped}
                    onChange={(event) => {
                        this.props.onSortGrouped(event.target.value);
                    }}
                    style={{
                        "marginLeft": "10px"
                    }}>
                    <option value="trend">Trend</option>
                    <option value="avg">Average</option>
                    <option value="quant">Quantity</option>
                </select>
                <select
                    value={this.props.heatStyle}
                    onChange={(event) => {
                        this.props.onHeatStyle(event.target.value);
                    }}
                    style={{
                        "marginLeft": "10px"
                    }}>
                    <option value="dom">Dominant</option>
                    <option value="avg">Average</option>
                    <option value="max">Max</option>
                </select>
            </div >
        );
    }
}

export default Legend;