import { useMemo } from "react";

export function useMapFilter(species, speciesCountries, selectedCountry) {
  return useMemo(() => {
    let filtSpecies = [];

    for (let speciesName of Object.keys(species)) {
      let specCountries = speciesCountries[speciesName];

      if (selectedCountry && speciesCountries != null) {
        if (specCountries != null && !specCountries.includes(selectedCountry)) {
          continue;
        }
      }

      filtSpecies.push(speciesName);
    }

    return filtSpecies;
  }, [species, speciesCountries, selectedCountry]);
}
