import React, { Component } from "react";
import OrchestraHelper from "./OrchestraHelper";
import "../utils/utils";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

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
      lastSpeciesSigns: this.props.lastSpeciesSigns,
      speciesData: this.props.speciesData,
      finishedFetching: this.props.finishedFetching,
      mainPartOptions: [],
      open: false,
      instrumentGroups: this.props.instrumentGroups,
      instruments: this.props.instruments,
      mainParts: this.props.mainParts
    };
  }

  componentDidMount() {
    this.OrchestraHelper = OrchestraHelper.draw({
      id: this.state.id,
      instrumentGroup: this.state.instrumentGroup,
      instrument: this.state.instrument,
      mainPart: this.state.mainPart,
      getTreeThreatLevel: this.state.getTreeThreatLevel,
      treeThreatType: this.state.treeThreatType,
      speciesData: this.state.speciesData,
      finishedFetching: this.props.finishedFetching,
      setFilter: this.props.setFilter,
      colorBlind: this.props.colorBlind,
      lastSpeciesSigns: this.props.lastSpeciesSigns,
      setMainPartOptions: this.setMainPartOptions.bind(this),
      width: this.props.width,
      height: this.props.height,
      instrumentGroups: this.props.instrumentGroups,
      instruments: this.props.instruments,
      mainParts: this.props.mainParts
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
      this.OrchestraHelper.updateThreatPies(
        this.props.speciesData,
        this.props.colorBlind,
        this.props.lastSpeciesSigns
      );
    }

    if (prevProps.treeThreatType !== this.props.treeThreatType) {
      this.OrchestraHelper.setTreeThreatType(this.props.treeThreatType);
      this.OrchestraHelper.updateThreatPies(
        this.props.speciesData,
        this.props.colorBlind,
        this.props.lastSpeciesSigns
      );
    }

    if (
      JSON.stringify(this.props.lastSpeciesSigns) !==
      JSON.stringify(prevProps.lastSpeciesSigns)
    ) {
      this.OrchestraHelper.updateThreatPies(
        this.props.speciesData,
        this.props.colorBlind,
        this.props.lastSpeciesSigns
      );
    }

    if (
      JSON.stringify(this.props.speciesData) !==
      JSON.stringify(prevProps.speciesData)
    ) {
      this.OrchestraHelper.updateThreatPies(
        this.props.speciesData,
        this.props.colorBlind,
        this.props.lastSpeciesSigns
      );
    }

    if (this.props.colorBlind !== prevProps.colorBlind) {
      this.OrchestraHelper.updateThreatPies(
        this.props.speciesData,
        this.props.colorBlind,
        this.props.lastSpeciesSigns
      );
    }
  }

  setMainPartOptions(newVal) {
    this.setState({ mainPartOptions: newVal });
  }

  setMainPart(event) {
    this.props.setFilter({ mainPart: [event.target.value] });
  }

  render() {
    let mainPartOptions = this.state.mainPartOptions;
    let mainPart = this.props.mainPart;

    if (mainPartOptions.length === 0 && mainPart) {
      mainPartOptions.push(mainPart);
    }

    let open = this.state.open;
    let instrument = this.props.instrument;

    return (
      <div
        style={{
          display: "inline-block",
          verticalAlign: "top",
          position: "relative",
          width: "100%",
          height: "100%"
        }}
      >
        <div id={this.state.id}></div>
        <div
          id={"mainPartSelectorDiv"}
          className={this.props.mainPart ? "filterUsed" : ""}
          style={{
            position: "absolute",
            top: "10px",
            left: "100px",
            display: "none"
          }}
        >
          <FormControl sx={{ m: 1, minWidth: 80 }} size="small">
            <InputLabel
              style={{ backgroundColor: "white" }}
              id="demo-simple-select-label"
            >
              Select Main Part
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="mainPartSelector"
              value={this.props.mainPart ? this.props.mainPart : ""}
              label="Select Main Part"
              sx={{
                width: 300,
                boxShadow: "0 3px 14px rgb(0 0 0 / 40%)"
                //height: 50
              }}
              onChange={this.setMainPart.bind(this)}
              onOpen={(e) => {
                this.setState({ open: true });
              }}
              onClose={(e) => {
                this.setState({ open: false });
              }}
            >
              {mainPartOptions.map((e) => (
                <MenuItem key={"option" + e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div
          id="mainPartSelectSVGWrapper"
          style={{
            position: "absolute",
            top: "50px",
            left: "100px",
            backgroundColor: "white",
            display: open && instrument ? "block" : "none",
            zIndex: 9999,
            borderRadius: "4px",
            boxShadow:
              "0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%)"
          }}
        ></div>
      </div>
    );
  }
}

export default Orchestra;
