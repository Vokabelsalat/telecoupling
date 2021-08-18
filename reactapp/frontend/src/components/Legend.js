import React, { Component } from 'react';
import { iucnColors, iucnAssessment, bgciAssessment, citesAssessment } from '../utils/timelineUtils';
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
            <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "60px auto 30px",
                    gridTemplateRows: "23px 23px 23px"
                }}>
                    <div style={{ gridColumnStart: 1, gridColumnEnd: 1, gridRowStart: 1, gridRowEnd: 1 }}>IUCN</div>
                    <div style={{ gridColumnStart: 2, gridColumnEnd: 2, gridRowStart: 1, gridRowEnd: 1 }}>
                        {(iucnAssessment.getSortedLevels().map((e, i) => {

                            let style = {
                                display: "inline-block",
                                minWidth: "30px",
                                height: "20px",
                                backgroundColor: iucnAssessment.get(e).getColor(),
                                color: iucnAssessment.get(e).getForegroundColor(),
                                textAlign: "center"
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

                    <div style={{ gridColumnStart: 1, gridColumnEnd: 1, gridRowStart: 2, gridRowEnd: 2 }}>BGCI</div>
                    <div style={{ gridColumnStart: 2, gridColumnEnd: 2, gridRowStart: 2, gridRowEnd: 2 }}>
                        {(bgciAssessment.getSortedLevels().map(e => {
                            let width;
                            if (["EX"].includes(e)) {
                                width = "90px";
                            }
                            else if (["TH"].includes(e)) {
                                width = "150px";
                            }
                            else if (["PT"].includes(e)) {
                                width = "72px";
                            }
                            else {
                                width = "30px";
                            }

                            let style = {
                                display: "inline-block",
                                minWidth: width,
                                height: "20px",
                                backgroundColor: bgciAssessment.get(e).getColor(),
                                color: bgciAssessment.get(e).getForegroundColor(),
                                textAlign: "center"
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
                    <div style={{ gridColumnStart: 1, gridColumnEnd: 1, gridRowStart: 3, gridRowEnd: 3 }}>CITES</div>
                    <div style={{ gridColumnStart: 2, gridColumnEnd: 2, gridRowStart: 3, gridRowEnd: 3 }}>
                        {(citesAssessment.getSortedLevels().map(e => {
                            let width;
                            if (["I"].includes(e)) {
                                width = "90px";
                            }
                            else if (["II"].includes(e)) {
                                width = "150px";
                            }
                            else if (["III"].includes(e)) {
                                width = "72px";
                            }
                            else {
                                width = "30px";
                            }

                            let style = {
                                display: "inline-block",
                                minWidth: width,
                                height: "20px",
                                backgroundColor: citesAssessment.get(e).getColor(),
                                color: citesAssessment.get(e).getForegroundColor(),
                                textAlign: "center"
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