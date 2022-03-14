import { tickStep } from "d3";
import React, { Component } from "react";
import {
  iucnColors,
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";
import { dangerColorMap } from "../utils/utils";
import CenterPieChartHelper from "./CenterPieChartHelper";

class CenterPieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "CenterPieChartVis",
      data: this.props.data,
      getTreeThreatLevel: this.props.getTreeThreatLevel,
      treeThreatType: this.props.treeThreatType
    };
  }

  componentDidMount() {
    CenterPieChartHelper.draw({
      id: this.state.id,
      data: this.props.data,
      getTreeThreatLevel: this.props.getTreeThreatLevel,
      treeThreatType: this.props.treeThreatType,
      colorBlind: this.props.colorBlind
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.treeThreatType !== prevProps.treeThreatType ||
      this.props.colorBlind !== prevProps.colorBlind ||
      JSON.stringify(this.props.data) !== JSON.stringify(prevProps.data)
    ) {
      CenterPieChartHelper.draw({
        id: this.state.id,
        data: this.props.data,
        getTreeThreatLevel: this.props.getTreeThreatLevel,
        treeThreatType: this.props.treeThreatType,
        colorBlind: this.props.colorBlind
      });
    }
  }

  render() {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div id={this.state.id} />
      </div>
    );
  }
}

export default CenterPieChart;
