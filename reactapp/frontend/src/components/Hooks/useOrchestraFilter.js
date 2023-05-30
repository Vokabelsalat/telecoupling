import { useMemo } from "react";

export function useOrchestraFilter(
  species,
  instrument,
  instrumentData,
  instrumentGroup,
  instrumentGroupData,
  instrumentPart
) {
  return useMemo(() => {
    let filtSpecies = Object.keys(species);
    if (instrumentGroup) {
      let filtInstruments = instrumentGroupData[instrumentGroup];
      if (instrument) {
        filtInstruments = [instrument];
      }

      if (instrumentPart && instrumentData.hasOwnProperty(instrument)) {
        filtSpecies = instrumentData[instrument][instrumentPart];
      } else {
        filtSpecies = filtInstruments
          .filter((key) => key in instrumentData)
          .reduce(
            (obj2, key) => (
              obj2.push(
                ...Object.values(instrumentData[key]).flatMap((entry) => {
                  return entry;
                })
              ),
              obj2
            ),
            []
          );
      }

      filtSpecies = [...new Set(filtSpecies)];
    }

    return filtSpecies;
  }, [
    instrument,
    instrumentData,
    instrumentGroup,
    instrumentGroupData,
    instrumentPart,
    species
  ]);
}
