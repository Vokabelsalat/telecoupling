import { tickStep } from "d3";
import React, { Component } from "react";
import {
  iucnColors,
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";
import { dangerColorMap } from "../utils/utils";

import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

const filter = createFilterOptions();

class MapSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "MapSearchBar",
      data: this.props.data,
      setFilter: this.props.setFilter,
      mode: this.props.mapSearchMode,
      searchBarData: this.props.mapSearchBarData,
      currentValue: this.props.value
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
      this.setState({ data: this.props.data });
    }

    if (
      JSON.stringify(prevProps.mapSearchMode) !==
      JSON.stringify(this.props.mapSearchMode)
    ) {
      this.setState({ mode: this.props.mapSearchMode });
    }

    if (JSON.stringify(prevProps.value) !== JSON.stringify(this.props.value)) {
      this.setState({ currentValue: this.props.value });
    }

    if (
      JSON.stringify(prevProps.mapSearchBarData) !==
      JSON.stringify(this.props.mapSearchBarData)
    ) {
      this.setState({ searchBarData: this.props.mapSearchBarData });
    }
  }

  setValue(val) {
    console.log("VAL", val);
    const filter = {};
    filter[this.state.mode] = val
      ? [
          {
            value: val.value,
            title: val.title
          }
        ]
      : null;
    this.state.setFilter(filter);
  }

  render() {
    let currentValue = this.state.currentValue;
    let setValue = this.setValue.bind(this);
    const mode = this.state.mode;
    let data = this.state.searchBarData[mode];
    let options = [];

    console.log(data, mode, this.state.searchBarData, currentValue);

    if (data) {
      for (let entry of data) {
        if (entry.title.trim() !== "")
          options.push({ ...entry, key: entry.title });
      }
    }

    return (
      <Autocomplete
        value={currentValue}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some(
            (option) => inputValue === option.title
          );
          /*  if (inputValue !== "" && !isExisting) {
            filtered.push({
              inputValue,
              title: `Add "${inputValue}"`
            });
          } */

          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        id="free-solo-with-text-demo"
        options={options}
        getOptionLabel={(option) => {
          return option.title;
        }}
        renderOption={(props, option) => (
          <li {...props}>
            {/* {option.type === "genus" ? option.title + " (Genus)" : option.title} */}
            {option.title}
          </li>
        )}
        sx={{ width: 300 }}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            className={currentValue ? "filterUsed" : ""}
            label={`${mode} Search`}
            size="small"
          />
        )}
        style={{ display: "table-cell", verticalAlign: "middle" }}
      />
    );
  }
}

export default MapSearchBar;
