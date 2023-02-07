import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useEffect, useState } from "react";

export default function SearchBar(props) {
  const { id, data, kingdom, familia, species, genus, setFilter } = props;

  const filter = createFilterOptions();

  const [value, setValue] = useState(null);

  useEffect(() => {
    let tmpValue = null;
    if (species) {
      tmpValue = {
        title: species,
        type: "species",
        kingdom: kingdom,
        family: familia,
        genus: genus,
        species: species
      };
    } else if (genus) {
      tmpValue = {
        title: genus,
        type: "genus",
        kingdom: kingdom,
        family: familia,
        genus: genus,
        species: null
      };
    } else {
      tmpValue = null;
    }
  }, []);

  const select = (val) => {
    setFilter({
      searchBarSpecies: val ? val.title : null,
      kingdom: val ? [val.kingdom] : null,
      familia: val ? [val.family] : null,
      genus: val ? [val.genus] : null,
      species: val ? (val.species ? [val.species] : null) : null
    });
    setValue(val);
  };

  let options = [];

  if (data) {
    let genus = [];
    for (let key of Object.keys(data)) {
      let keyGenus = data[key].Genus.trim();
      if (!genus.includes(keyGenus)) {
        genus.push(keyGenus);
        options.push({
          title: keyGenus,
          type: "genus",
          kingdom: data[key].Kingdom.trim(),
          family: data[key].Family.trim(),
          genus: data[key].Genus.trim(),
          species: null
        });
      }
      options.push({
        title: key,
        type: "species",
        kingdom: data[key].Kingdom.trim(),
        family: data[key].Family.trim(),
        genus: data[key].Genus.trim(),
        species: key
      });
    }
  }

  return (
    <Autocomplete
      value={value}
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
          {option.type === "genus" ? (
            <span>
              <b>{option.title}</b> (Genus)
            </span>
          ) : (
            option.title
          )}
        </li>
      )}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          className={value ? "filterUsed" : ""}
          label="Species Search"
          size="small"
        />
      )}
      style={{ display: "table-cell", verticalAlign: "middle" }}
    />
  );
}
