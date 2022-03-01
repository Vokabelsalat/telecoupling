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

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "SearchBar",
      data: this.props.data,
      value: "",
      setFilter: this.props.setFilter
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
      this.setState({ data: this.props.data });
    }
  }

  setValue(val) {
    this.state.setFilter({ searchBarSpecies: val ? val.title : null });
    this.setState({ value: val });
  }

  render() {
    let value = this.state.value;
    let setValue = this.setValue.bind(this);
    let data = this.state.data;
    let options = [];

    if (data) {
      let genus = [];
      for (let key of Object.keys(data)) {
        let keyGenus = data[key].Genus.trim();
        if (!genus.includes(keyGenus)) {
          genus.push(keyGenus);
          options.push({ title: keyGenus, type: "genus" });
        }
        options.push({ title: key, type: "species" });
      }
    }

    return (
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setValue({
              title: newValue
            });
          } else if (newValue && newValue.inputValue) {
            // Create a new value from the user input
            setValue({
              title: newValue.inputValue
            });
          } else {
            setValue(newValue);
          }
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
          // Value selected with enter, right from the input
          if (typeof option === "string") {
            return option;
          }
          // Add "xxx" option created dynamically
          if (option.inputValue) {
            return option.inputValue;
          }
          // Regular option
          return option.title;
        }}
        renderOption={(props, option) => (
          <li {...props}>
            {option.type === "genus" ? option.title + " (Genus)" : option.title}
          </li>
        )}
        sx={{ width: 300 }}
        freeSolo
        renderInput={(params) => <TextField {...params} className={value ? "filterUsed" : ""} label="Search" />}
        style={{display: "table-cell", verticalAlign: "middle"}}
      />
    );
  }
}

export default SearchBar;
