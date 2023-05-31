import { useMemo } from "react";

export function useFilterSpecies(
  kingdomData,
  filterTreeMap,
  instrumentData,
  speciesCountries,
  timelineData,
  intersectedSpecies,
  speciesEcos,
  speciesHexas
) {
  return useMemo(() => {
    let tmpKingdomData = JSON.parse(kingdomData);
    let filteredTreeMap = tmpKingdomData;
    let filtSpecies = JSON.parse(intersectedSpecies);
    let tmpSpeciesEcos = JSON.parse(speciesEcos);
    let tmpSpeciesHexas = JSON.parse(speciesHexas);
    let tmpTimelineData = JSON.parse(timelineData);
    let tmpInstrumentData = JSON.parse(instrumentData);
    let tmpSpeciesCountries = JSON.parse(speciesCountries);
    let visibleSpeciesTimelineData = {};
    let tmpVisibleSpeciesCountries = {};
    let tmpVisibleSpeciesEcos = {};
    let tmpVisibleSpeciesHexas = {};

    let tmpFiltSpecies = [];
    for (let speciesName of filtSpecies) {
      let specCountries = tmpSpeciesCountries[speciesName];
      tmpVisibleSpeciesCountries[speciesName] =
        specCountries != null ? specCountries : [];

      let specEcos = tmpSpeciesEcos[speciesName];
      tmpVisibleSpeciesEcos[speciesName] = specEcos != null ? specEcos : [];

      tmpFiltSpecies.push(speciesName);

      visibleSpeciesTimelineData[speciesName] = tmpTimelineData[speciesName];

      let specHexas = tmpSpeciesHexas[speciesName];
      tmpVisibleSpeciesHexas[speciesName] = specHexas != null ? specHexas : [];
    }

    filtSpecies = tmpFiltSpecies;

    let filteredInstrumentData = {};

    for (let inst of Object.keys(tmpInstrumentData)) {
      filteredInstrumentData[inst] = Object.fromEntries(
        Object.keys(tmpInstrumentData[inst]).map((e) => [
          e,
          tmpInstrumentData[inst][e].filter((value) =>
            filtSpecies.includes(value)
          )
        ])
      );
    }

    filteredTreeMap = filterTreeMap(
      structuredClone(tmpKingdomData),
      filtSpecies,
      4
    );

    return {
      filteredKingdomData: filteredTreeMap,
      filteredInstrumentData: filteredInstrumentData,
      visibleSpeciesTimelineData: visibleSpeciesTimelineData,
      visibleSpeciesCountries: tmpVisibleSpeciesCountries,
      visibleSpeciesEcos: tmpVisibleSpeciesEcos,
      visibleSpeciesHexas: tmpVisibleSpeciesHexas
    };
  }, [
    kingdomData,
    filterTreeMap,
    instrumentData,
    speciesCountries,
    timelineData,
    intersectedSpecies,
    speciesEcos,
    speciesHexas
  ]);
}
