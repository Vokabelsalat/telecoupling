import React, { Component } from "react";
import {
  iucnColors,
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";
import { dangerColorMap } from "../utils/utils";

import Switch from "@mui/material/Switch";

class Legend extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  /*  componentWillReceiveProps(someProps) {
         console.log("RECEIVE!", someProps); */

  /*    this.setState({ ...this.state, someProp }) */
  /*   } */

  onChange() {
    this.props.setTreeThreatType(!this.props.treeThreatType);
  }

  render() {
    let setTreeThreatType = this.props.setTreeThreatType.bind(this);
    let treeThreatType = this.props.treeThreatType;
    let onChange = this.onChange.bind(this);
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            height: "auto",
            display: "grid",
            gridTemplateColumns: "auto auto auto",
            gridTemplateRows: "auto auto",
            gap: "10px"
          }}
        >
          <div
            style={{
              gridColumnStart: 1,
              gridColumnEnd: 1,
              gridRowStart: 1,
              gridRowEnd: "span 2",
              "align-self": "center",
              "justify-self": "center",
              opacity: !treeThreatType ? 0.5 : 1.0,
              marginTop: "-1.7em"
            }}
          >
            <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
              Cites
              <a
                href="https://cites.org/eng/app/index.php"
                target="_blank"
                style={{ "text-decoration": "none" }}
              >
                <div className="infoI">i</div>
              </a>
            </div>
            {citesAssessment.getSortedLevels().map((e) => {
              let style = {
                display: "inline-block",
                minWidth: "60px",
                height: "20px",
                backgroundColor: citesAssessment.get(e).getColor(),
                color: citesAssessment.get(e).getForegroundColor(),
                textAlign: "center"
              };
              return (
                <div key={e} style={style}>
                  {e}
                </div>
              );
            })}
          </div>
          <div
            style={{
              gridColumnStart: 2,
              gridColumnEnd: 2,
              gridRowStart: 1,
              gridRowEnd: "span 2",
              "align-self": "center",
              "justify-self": "center",
              "font-weight": treeThreatType ? "bold" : "normal",
              "font-size": "larger",
              opacity: !treeThreatType ? 0.5 : 1.0
            }}
          >
            Trade
          </div>
          <div
            style={{
              gridColumnStart: 3,
              gridColumnEnd: 3,
              gridRowStart: 1,
              gridRowEnd: "span 2",
              "align-self": "center",
              "justify-self": "center"
            }}
          >
            <div className="switchWrapper">
              <Switch
                onChange={onChange}
                checked={!treeThreatType}
                color="secondary"
              />
            </div>
          </div>
          <div
            style={{
              gridColumnStart: 4,
              gridColumnEnd: 4,
              gridRowStart: 1,
              gridRowEnd: "span 2",
              "align-self": "center",
              "justify-self": "center",
              "font-weight": !treeThreatType ? "bold" : "normal",
              "font-size": "larger",
              opacity: treeThreatType ? 0.5 : 1.0
            }}
          >
            Threat
          </div>
          <div
            style={{
              gridColumnStart: 5,
              gridColumnEnd: 5,
              gridRowStart: 1,
              gridRowEnd: 1,
              opacity: treeThreatType ? 0.5 : 1.0
            }}
          >
            <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
              IUCN Red List
              <a
                href="https://www.iucnredlist.org/about/regional"
                target="_blank"
                style={{ "text-decoration": "none" }}
              >
                <div className="infoI">i</div>
              </a>
            </div>
            {iucnAssessment.getSortedLevels().map((e, i) => {
              let width;
              if (["LR/cd"].includes(e)) {
                width = "50px";
              } else {
                width = "35px";
              }

              let style = {
                display: "inline-block",
                minWidth: width,
                height: "20px",
                backgroundColor: iucnAssessment.get(e).getColor(),
                color: iucnAssessment.get(e).getForegroundColor(),
                textAlign: "center"
              };
              return (
                <div key={e} style={style}>
                  {e}
                </div>
              );
            })}
          </div>

          <div
            style={{
              gridColumnStart: 5,
              gridColumnEnd: 5,
              gridRowStart: 2,
              gridRowEnd: 2,
              opacity: treeThreatType ? 0.5 : 1.0
            }}
          >
            {bgciAssessment.getSortedLevels().map((e) => {
              let width;
              if (["EX"].includes(e)) {
                width = "105px";
              } else if (["TH"].includes(e)) {
                width = "175px";
              } else if (["PT"].includes(e)) {
                width = "85px";
              } else {
                width = "35px";
              }

              let style = {
                display: "inline-block",
                minWidth: width,
                height: "20px",
                backgroundColor: bgciAssessment.get(e).getColor(),
                color: bgciAssessment.get(e).getForegroundColor(),
                textAlign: "center"
              };
              return (
                <div key={e} style={style}>
                  {e}
                </div>
              );
            })}
            <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
              BGCI ThreatSearch
              <a
                href="https://www.bgci.org/resources/bgci-databases/threatsearch/"
                target="_blank"
                style={{ "text-decoration": "none" }}
              >
                <div className="infoI">i</div>
              </a>
            </div>
          </div>
        </div>

        {/* < div > {this.props.zoomLevel + 1} / {this.props.maxZoomLevel + 1}</div >
                <button onClick={this.props.onZoomOut}>-</button>
                <button onClick={this.props.onZoom}>+</button> */}
        {/* <select
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
                </select> */}
      </div>
    );
  }
}

export default Legend;
