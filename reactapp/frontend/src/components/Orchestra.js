import React, { Component } from "react";
import OrchestraHelper from "./OrchestraHelper";
import "../utils/utils";

class Orchestra extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      instrumentGroup: this.props.instrumentGroup,
      instrument: this.props.instrument,
      mainPart: this.props.mainPart,
      getTreeThreatLevel: this.props.getTreeThreatLevel,
      treeThreatType: this.props.treeThreatType,
      speciesData: this.props.speciesData,
      finishedFetching: this.props.finishedFetching
    };
  }

  componentDidMount() {
    console.log("componentDidMount");
    this.OrchestraHelper = OrchestraHelper.draw({
      id: this.state.id,
      instrumentGroup: this.state.instrumentGroup,
      instrument: this.state.instrument,
      mainPart: this.state.mainPart,
      getTreeThreatLevel: this.state.getTreeThreatLevel,
      treeThreatType: this.state.treeThreatType,
      speciesData: this.state.speciesData,
      finishedFetching: this.props.finishedFetching,
      setFilter: this.props.setFilter
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.instrumentGroup !== this.props.instrumentGroup ||
      prevProps.instrument !== this.props.instrument ||
      prevProps.mainPart !== this.props.mainPart
    ) {
      this.OrchestraHelper.setInstrument(this.props.instrument);
      this.OrchestraHelper.setInstrumentGroup(this.props.instrumentGroup);
      this.OrchestraHelper.setMainPart(this.props.mainPart);
      this.OrchestraHelper.setTreeThreatType(this.props.treeThreatType);
      this.OrchestraHelper.updateThreatPies(this.props.speciesData);
    }

    if (prevProps.treeThreatType !== this.props.treeThreatType) {
      this.OrchestraHelper.updateThreatPies(this.props.speciesData);
    }

    if (
      JSON.stringify(this.props.speciesData) !==
      JSON.stringify(prevProps.speciesData)
    ) {
      this.OrchestraHelper.updateThreatPies(this.props.speciesData);
    }

    if (
      JSON.stringify(this.props.timeFrame) !==
      JSON.stringify(prevProps.timeFrame)
    ) {
      this.OrchestraHelper.updateThreatPies(this.props.speciesData);
    }
  }

  render() {
    return (
      <div style={{ display: "inline-block" }}>
        <div id={this.state.id}></div>
        <div id={"selectmainpartWrapper"}></div>
      </div>
    );
  }
}

export default Orchestra;
