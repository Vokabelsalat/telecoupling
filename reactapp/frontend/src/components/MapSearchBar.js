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
      country: this.props.country
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

    if (
      JSON.stringify(prevProps.country) !== JSON.stringify(this.props.country)
    ) {
      this.setState({ country: this.props.country });
    }

    if (
      JSON.stringify(prevProps.mapSearchBarData) !==
      JSON.stringify(this.props.mapSearchBarData)
    ) {
      this.setState({ searchBarData: this.props.mapSearchBarData });
    }
  }

  setValue(val) {
    this.state.setFilter({
      country: val
        ? [{ ROMNAM: val.ROMNAM, MAPLAB: val.MAPLAB, bgciName: val.bgciName }]
        : null
    });
    this.setState({ country: val });
  }

  render() {
    let country = this.state.country;
    let setValue = this.setValue.bind(this);
    let data = this.state.searchBarData;
    let options = [];

    if (data) {
      for (let entry of data) {
        options.push({ ...entry, key: entry.ROMNAM });
      }
    }

    return (
      <Autocomplete
        value={country}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some(
            (option) => inputValue === option.ROMNAM
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
          return option.ROMNAM;
        }}
        renderOption={(props, option) => (
          <li {...props}>
            {/* {option.type === "genus" ? option.title + " (Genus)" : option.title} */}
            {option.ROMNAM}
          </li>
        )}
        sx={{ width: 300 }}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            className={country ? "filterUsed" : ""}
            label="Country Search"
            size="small"
          />
        )}
        style={{ display: "table-cell", verticalAlign: "middle" }}
      />
    );
  }
}

export default MapSearchBar;
