import { useEffect, useState, useMemo } from "react";
import FullScreenButton from "./FullScreenButton";
import Tooltip from "./Tooltip";
import TimelineViewNew from "./TimelineViewNew";
import ResizeComponent from "./ResizeComponent";
import CenterPanel from "./CenterPanel";
import OrchestraNew from "./OrchestraNew";
import TreeMapView from "./TreeMapViewNew";
//import Map from "./MapNewTest";
import Map from "./MapNew";
import { getOrCreate, pushOrCreateWithoutDuplicates } from "../utils/utils";
import {
  bgciAssessment,
  citesAssessment,
  iucnAssessment
} from "../utils/timelineUtils";
import Overlay from "./Overlay";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";

import { HoverProvider } from "./HoverProvider";
import { TooltipProvider } from "./TooltipProvider";
import { OverlayProvider } from "./OverlayProvider";
import { filter, tree } from "d3";

export const returnDummyLink = (speciesObj) => {
  return speciesObj["Foto dummy"].trim() !== ""
    ? "fotos/" + speciesObj["Foto dummy"].replace(" ", "")
    : null;
};

export const returnImageLink = (speciesObj) => {
  if (speciesObj["photos"] !== null) {
    let sortedPhotos = speciesObj["photos"].sort((pA, pB) => {
      return pA.Priority - pB.Priority;
    });

    if (sortedPhotos.length > 0) {
      if (sortedPhotos[0].Foto !== null) {
        return "fotos/" + sortedPhotos[0].Foto.replace(" ", "");
      }
    }
  }
  return null;
};

export default function HomeNew(props) {
  const showMap = true;
  const showTimeline = true;
  const showOrchestra = true;
  const showTreeMap = true;

  const [zoomOrigin, setZoomOrigin] = useState("0% 0%");
  const [zoomTransform, setZoomTransform] = useState("");

  const [imageLinks, setImageLinks] = useState({});
  const [dummyImageLinks, setDummyImageLinks] = useState({});

  const [instrument, setInstrument] = useState();
  const [instrumentGroup, setInstrumentGroup] = useState();
  const [instrumentPart, setInstrumentPart] = useState();

  const [species, setSpecies] = useState({});

  const [timeFrame, setTimeFrame] = useState([]);

  const [colorBlind, setColorBlind] = useState(false);

  const [threatType, setThreatType] = useState("economically");

  const [speciesSignThreats, setSpeciesSignThreats] = useState({});
  const [speciesCountries, setSpeciesCountries] = useState({});
  const [speciesEcos, setSpeciesEcos] = useState({});
  const [speciesHexas, setSpeciesHexas] = useState({});
  const [timelineData, setTimelineData] = useState({});
  const [speciesLabels, setSpeciesLabels] = useState({});

  const [instrumentGroupData, setInstrumentGroupData] = useState({});
  const [instrumentData, setInstrumentData] = useState({});

  const [kingdomData, setKingdomData] = useState([]);

  const [selectedKingdom, setSelectedKingdom] = useState();
  const [selectedFamily, setSelectedFamily] = useState();
  const [selectedGenus, setSelectedGenus] = useState();
  const [selectedSpecies, setSelectedSpecies] = useState();

  const [selectedCountry, setSelectedCountry] = useState();

  const [treeMapFilter, setTreeMapFilter] = useState({});

  const [domainYears, setDomainYears] = useState({ maxYear: 1, minYear: 2 });

  const [categoryFilter, setCategoryFilter] = useState(null);

  const slice = false;

  /* const returnDummyLink = (speciesObj) => {
    return speciesObj["Foto dummy"].trim() !== ""
      ? "fotos/" + speciesObj["Foto dummy"].replace(" ", "")
      : null;
  }; */

  /*   let returnImageLink = (speciesObj) => {
    if (speciesObj["photos"] !== null) {
      let sortedPhotos = speciesObj["photos"].sort((pA, pB) => {
        return pA.Priority - pB.Priority;
      });

      if (sortedPhotos.length > 0) {
        if (sortedPhotos[0].Foto !== null) {
          return "fotos/" + sortedPhotos[0].Foto.replace(" ", "");
        }
      }
    }
    return null;
  }; */

  let getSpeciesFromTreeMap = (treeMapData) => {
    return treeMapData.flatMap((el) => {
      if (el.children) {
        return getSpeciesFromTreeMap(el.children);
      } else {
        return el.name;
      }
    });
  };

  const filterTreeMap = (node, keys, filterLevel) => {
    return node.filter((el) => {
      if (el.filterDepth === filterLevel) {
        return keys.includes(el.name);
      } else {
        el.children = filterTreeMap(el.children, keys, filterLevel);
        return el.children.length > 0;
      }
    });
  };

  let returnDummyLink = (speciesObj) => {
    if (speciesObj["photos"] !== null) {
      let sortedPhotos = speciesObj["photos"].sort((pA, pB) => {
        return pA.Priority - pB.Priority;
      });

      if (sortedPhotos.length > 0) {
        if (sortedPhotos[0].Proxy !== null) {
          return "fotos/" + sortedPhotos[0].Proxy.replace(" ", "");
        }
      }
    }
    return null;
  };

  const getSpeciesSignThreat = (species, type = null) => {
    if (type === null) {
      type = threatType;
    }

    const speciesObj = timelineData[species];

    if (speciesObj == null) {
      return citesAssessment.dataDeficient;
    }

    if (type === "economically") {
      let lastElement = [...speciesObj["cites"]]
        .filter((e) =>
          timeFrame[1] !== undefined ? e.element.year < timeFrame[1] : true
        )
        .pop();
      if (lastElement) {
        return lastElement.assessment;
      } else {
        return citesAssessment.dataDeficient;
      }
    } else {
      let lastElementIUCN = [...speciesObj["iucn"]]
        .filter((e) =>
          timeFrame[1] !== undefined ? e.element.year < timeFrame[1] : true
        )
        .pop();
      if (lastElementIUCN) {
        return lastElementIUCN.assessment;
      } else {
        let lastElementBGCI = [...speciesObj["bgci"]]
          .filter((e) =>
            timeFrame[1] !== undefined
              ? e.element.assessmentYear < timeFrame[1]
              : true
          )
          .pop();
        if (lastElementBGCI) {
          return lastElementBGCI.assessment;
        } else {
          return bgciAssessment.dataDeficient;
        }
      }
    }
  };

  useEffect(() => {
    fetch("./generatedOutput/allSpecies.json")
      .then((res) => res.json())
      .then(function (speciesData) {
        speciesData = Object.fromEntries(
          Object.entries(speciesData["species"]).slice(
            0,
            slice ? 140 : Object.keys(speciesData["species"]).length
          )
        );

        let tmpImageLinks = {};
        let tmpDummyImageLinks = {};
        let tmpSpeciesSignThreats = {};
        let tmpTimelineData = {};
        let tmpYears = new Set();
        let tmpInstrumentGroupData = {};
        let tmpInstrumentData = {};
        let tmpSpeciesCountries = {};
        let tmpSpeciesEcos = {};
        let tmpSpeciesHexas = {};
        let tmpSpeciesLabels = {};
        /* let tmpTreeMapData = {
          Animalia: { name: "Animalia", children:  },
          Plantae: { name: "Plantae", children: {} }
        }; */

        let kingdoms = { Animalia: [], Plantae: [] };
        let families = {};
        let genera = {};
        let speciesTreeMapData = {};

        for (const spec of Object.keys(speciesData)) {
          const speciesObj = speciesData[spec];

          if (
            speciesObj.Kingdom === null ||
            !Object.keys(kingdoms).includes(speciesObj.Kingdom)
          ) {
            let tempKingdom = null;
            for (let mat of speciesObj.origMat) {
              if (
                mat.Kingdom != null &&
                Object.keys(kingdoms).includes(mat.Kingdom)
              ) {
                tempKingdom = mat.Kingdom;
              }
            }
            speciesObj.Kingdom = tempKingdom;
          }

          if (speciesObj.Family === null) {
            let tempFamily = null;
            for (let mat of speciesObj.origMat) {
              if (mat.Family != null) {
                tempFamily = mat.Family;
              }
            }
            speciesObj.Family = tempFamily;
          }

          let family =
            speciesObj.Family != null ? speciesObj.Family.trim() : "";
          let genus = speciesObj.Genus.trim();
          let species = speciesObj.Species.trim();
          let genusSpecies = `${genus.trim()} ${species.trim()}`;

          kingdoms[speciesObj.Kingdom].push(family);
          if (families.hasOwnProperty(family)) {
            families[family].push(genus);
          } else {
            families[family] = [genus];
          }

          if (genera.hasOwnProperty(genus)) {
            genera[genus].push(genusSpecies);
          } else {
            genera[genus] = [genusSpecies];
          }

          tmpImageLinks[spec] = returnImageLink(speciesObj);
          tmpDummyImageLinks[spec] = returnDummyLink(speciesObj);

          speciesTreeMapData[genusSpecies] = {
            image: tmpImageLinks[spec]
              ? tmpImageLinks[spec]
              : tmpDummyImageLinks[spec],
            mediaUrls: speciesObj["mediaUrls"]
          };

          for (const mat of speciesObj.origMat) {
            if (
              tmpInstrumentGroupData[mat["Instrument groups"]] &&
              mat.Instruments != null
            ) {
              tmpInstrumentGroupData[mat["Instrument groups"]].push(
                mat.Instruments
              );
            } else if (mat.Instruments != null) {
              tmpInstrumentGroupData[mat["Instrument groups"]] = [
                mat.Instruments
              ];
            }

            const mP = mat["Main part"];
            if (tmpInstrumentData[mat.Instruments]) {
              if (tmpInstrumentData[mat.Instruments][mP]) {
                if (!tmpInstrumentData[mat.Instruments][mP].includes(spec)) {
                  tmpInstrumentData[mat.Instruments][mP].push(spec);
                }
              } else {
                tmpInstrumentData[mat.Instruments][mP] = [spec];
              }
            } else {
              tmpInstrumentData[mat.Instruments] = {};
              tmpInstrumentData[mat.Instruments][mP] = [spec];
            }
          }

          let tmpElement = {
            iucn: [],
            cites: [],
            bgci: [],
            populationTrend: speciesObj.populationTrend,
            isAnimal: speciesObj.Kingdom === "Animalia" ? true : false
          };

          if (speciesObj.timeIUCN.length > 0) {
            let assessmentPerYear = {};
            for (let element of speciesObj.timeIUCN) {
              tmpYears.add(parseInt(element.year));
              let year = element.year.toString();
              let assessment = iucnAssessment.get(element.code);

              if (assessmentPerYear.hasOwnProperty(year)) {
                if (assessment.sort > assessmentPerYear[year].assessment.sort) {
                  assessmentPerYear[year] = {
                    assessment: assessment,
                    element: element
                  };
                }
              } else {
                assessmentPerYear[year] = {
                  assessment: assessment,
                  element: element
                };
              }
            }

            tmpElement["iucn"] = Object.values(assessmentPerYear).sort(
              (a, b) => {
                return parseInt(a.element.year) - parseInt(b.element.year);
              }
            );
          }

          if (speciesObj.timeThreat.length > 0) {
            let assessmentPerYear = {};
            for (let element of speciesObj.timeThreat) {
              if (
                element.assessmentYear === null ||
                element.bgciScope !== "Global"
              ) {
                continue;
              }
              let year = element.assessmentYear.toString();
              element.year = year;
              element.type = "bgci";
              tmpYears.add(parseInt(element.assessmentYear));
              let assessment = bgciAssessment.get(element.threatened);

              if (assessmentPerYear.hasOwnProperty(year)) {
                if (assessment.sort > assessmentPerYear[year].assessment.sort) {
                  assessmentPerYear[year] = {
                    assessment: assessment,
                    element: element
                  };
                }
              } else {
                assessmentPerYear[year] = {
                  assessment: assessment,
                  element: element
                };
              }
            }

            tmpElement["bgci"] = Object.values(assessmentPerYear).sort(
              (a, b) => {
                return parseInt(a.element.year) - parseInt(b.element.year);
              }
            );
          }

          if (speciesObj.timeListing.length > 0) {
            let assessmentPerYear = {};
            for (let element of speciesObj.timeListing) {
              let year = element.effectiveYear.toString();
              element.year = element.effectiveYear;
              tmpYears.add(parseInt(element.year));
              let assessment = citesAssessment.get(element.appendix);

              if (assessmentPerYear.hasOwnProperty(year)) {
                if (assessment.sort > assessmentPerYear[year].assessment.sort) {
                  assessmentPerYear[year] = {
                    assessment: assessment,
                    element: element
                  };
                }
              } else {
                assessmentPerYear[year] = {
                  assessment: assessment,
                  element: element
                };
              }
            }

            tmpElement["cites"] = Object.values(assessmentPerYear).sort(
              (a, b) => {
                return parseInt(a.element.year) - parseInt(b.element.year);
              }
            );
          }

          tmpTimelineData[spec] = tmpElement;
          tmpSpeciesSignThreats[spec] = {
            cites: [...tmpElement["cites"]].pop(),
            threats: [...tmpElement["bgci"]].pop(),
            iucn: [...tmpElement["iucn"]].pop()
          };

          let tmpCountries = [];
          if (speciesObj.hasOwnProperty("treeCountries")) {
            tmpCountries = speciesObj["treeCountries"];
          } else {
            if (this.props.data[species].hasOwnProperty("iucnCountriesShort")) {
              tmpCountries = speciesObj["iucnCountriesShort"];
            } else {
              if (this.props.data[species].hasOwnProperty("allCountries")) {
                tmpCountries = speciesObj["allCountries"];
              }
            }
          }

          tmpSpeciesCountries[genusSpecies] = tmpCountries;
          tmpSpeciesEcos[genusSpecies] = speciesObj.ecos;
          tmpSpeciesHexas[genusSpecies] = speciesObj.hexas;

          // Labels as Common Names from Wikipedia
          tmpSpeciesLabels[genusSpecies] = speciesObj.fixedCommonNames;
        }

        for (const group of Object.keys(tmpInstrumentGroupData)) {
          tmpInstrumentGroupData[group] = [
            ...new Set(tmpInstrumentGroupData[group])
          ];
        }

        /* for (const instrument of Object.keys(tmpInstrumentData)) {
          tmpInstrumentData[instrument] = [
            ...new Set(tmpInstrumentData[instrument])
          ];
        } */

        let tmpDomainYears = {
          maxYear: Math.max(...tmpYears) + 1,
          minYear: Math.min(...tmpYears) - 1
        };

        setImageLinks(tmpImageLinks);
        setDummyImageLinks(tmpDummyImageLinks);
        setSpeciesSignThreats(tmpSpeciesSignThreats);
        setTimelineData(tmpTimelineData);
        setSpecies(speciesData);
        setDomainYears(tmpDomainYears);
        setInstrumentData(tmpInstrumentData);
        setInstrumentGroupData(tmpInstrumentGroupData);
        setSpeciesCountries(tmpSpeciesCountries);
        setSpeciesEcos(tmpSpeciesEcos);
        setSpeciesHexas(tmpSpeciesHexas);
        setSpeciesLabels(tmpSpeciesLabels);

        /* console.log(kingdoms);
        console.log(families);
        console.log(genera);
        console.log(speciesTreeMapData); */

        let tmpKingdomData = [];
        for (let kingdom of Object.keys(kingdoms)) {
          let familiesInKingdom = [...new Set(kingdoms[kingdom])];
          let kingdomValue = 0;

          let familyData = [];
          for (let family of familiesInKingdom) {
            let genusInFamily = [...new Set(families[family])];

            let genusData = [];
            let familyValue = 0;
            for (let genus of genusInFamily) {
              let speciesInGenus = genera[genus];

              let speciesData = [];
              let speciesCount = {};
              let genusValue = 0;
              for (let genusSpecies of speciesInGenus) {
                if (speciesCount.hasOwnProperty(genusSpecies)) {
                  speciesCount[genusSpecies] = speciesCount[genusSpecies] + 1;
                } else {
                  speciesCount[genusSpecies] = 1;
                }
              }

              for (let genusSpecies of [...new Set(speciesInGenus)]) {
                speciesData.push({
                  name: genusSpecies,
                  image: speciesTreeMapData[genusSpecies]["image"],
                  mediaUrls: speciesTreeMapData[genusSpecies]["mediaUrls"],
                  value: speciesCount[genusSpecies],
                  filterDepth: 4
                });
                //genusValue = genusValue + speciesCount[genusSpecies];
              }

              genusData.push({
                name: genus,
                children: speciesData,
                filterDepth: 3
                //value: genusValue
              });

              familyValue = familyValue + genusValue;
            }
            familyData.push({
              name: family,
              children: genusData,
              filterDepth: 2
              //value: familyValue
            });
            kingdomValue = kingdomValue + familyValue;
          }
          tmpKingdomData.push({
            name: kingdom,
            children: familyData,
            /* value: kingdomValue, */
            filterDepth: 1
          });
        }

        setKingdomData(tmpKingdomData);
      })
      .catch((error) => {
        console.log(`Couldn't find file allSpecies.json`, error);
      });
  }, [slice]);

  //FilterSection
  const filteredSpeciesFromOrchestra = useMemo(() => {
    let filtSpecies = Object.keys(species);
    if (instrumentGroup) {
      let filtInstruments = instrumentGroupData[instrumentGroup];
      if (instrument) {
        filtInstruments = [instrument];
      }

      if (instrumentPart) {
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

  /* console.log("instrumentData", instrumentData);
  console.log("filteredSpeciesFromOrchestra", filteredSpeciesFromOrchestra); */

  const filteredSpeciesFromTreeMap = useMemo(() => {
    let filtSpecies = Object.keys(species);
    let filteredTreeMap = kingdomData;

    if (treeMapFilter.species != null) {
      filtSpecies = getSpeciesFromTreeMap(
        filterTreeMap(
          structuredClone(filteredTreeMap),
          [treeMapFilter.species],
          4
        )
      );
    } else if (treeMapFilter.genus != null) {
      filtSpecies = getSpeciesFromTreeMap(
        filterTreeMap(
          structuredClone(filteredTreeMap),
          [treeMapFilter.genus],
          3
        )
      );
    } else if (treeMapFilter.family != null) {
      filtSpecies = getSpeciesFromTreeMap(
        filterTreeMap(
          structuredClone(filteredTreeMap),
          [treeMapFilter.family],
          2
        )
      );
    } else if (treeMapFilter.kingdom != null) {
      filtSpecies = getSpeciesFromTreeMap(
        filterTreeMap(
          structuredClone(filteredTreeMap),
          [treeMapFilter.kingdom],
          1
        )
      );
    }

    return filtSpecies;
  }, [
    treeMapFilter,
    filterTreeMap,
    getSpeciesFromTreeMap,
    kingdomData,
    species
  ]);

  /* console.log("filteredSpeciesFromTreeMap", filteredSpeciesFromTreeMap); */

  const filteredSpeciesFromMap = useMemo(() => {
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

  const filteredSpeciesFromTimeline = useMemo(() => {
    if (categoryFilter === null) {
      return Object.keys(species);
    }

    let filtSpecies = [];
    const catType =
      categoryFilter.type === "cites" ? "economically" : "ecological";

    for (let speciesName of Object.keys(species)) {
      const signThreat = getSpeciesSignThreat(speciesName, catType);
      if (
        signThreat.abbreviation === categoryFilter.value &&
        signThreat.assessmentType === categoryFilter.type.toUpperCase()
      ) {
        filtSpecies.push(speciesName);
      }
    }

    return filtSpecies;
  }, [categoryFilter, species, getSpeciesSignThreat]);

  const intersectedSpecies = filteredSpeciesFromMap.filter(
    (value) =>
      filteredSpeciesFromTreeMap.includes(value) &&
      filteredSpeciesFromOrchestra.includes(value) &&
      filteredSpeciesFromTimeline.includes(value)
  );

  /* console.log("filteredSpeciesFromOrchestra", filteredSpeciesFromOrchestra);
  console.log("filteredSpeciesFromTreeMap", filteredSpeciesFromTreeMap);
  console.log("filteredSpeciesFromMap", filteredSpeciesFromMap);
  console.log("intersectedSpecies", intersectedSpecies); */

  const {
    filteredKingdomData,
    visibleSpeciesTimelineData,
    filteredInstrumentData,
    visibleSpeciesCountries,
    visibleSpeciesEcos
  } = useMemo(() => {
    let filteredTreeMap = kingdomData;
    let filtSpecies = intersectedSpecies;
    let visibleSpeciesTimelineData = {};
    let tmpVisibleSpeciesCountries = {};
    let tmpVisibleSpeciesEcos = {};

    let tmpFiltSpecies = [];
    for (let speciesName of filtSpecies) {
      let specCountries = speciesCountries[speciesName];
      tmpVisibleSpeciesCountries[speciesName] =
        specCountries != null ? specCountries : [];

      let specEcos = speciesEcos[speciesName];
      tmpVisibleSpeciesEcos[speciesName] = specEcos != null ? specEcos : [];

      tmpFiltSpecies.push(speciesName);

      visibleSpeciesTimelineData[speciesName] = timelineData[speciesName];
    }

    filtSpecies = tmpFiltSpecies;

    let filteredInstrumentData = {};

    for (let inst of Object.keys(instrumentData)) {
      filteredInstrumentData[inst] = Object.fromEntries(
        Object.keys(instrumentData[inst]).map((e) => [
          e,
          instrumentData[inst][e].filter((value) => filtSpecies.includes(value))
        ])
      );
    }

    filteredTreeMap = filterTreeMap(
      structuredClone(kingdomData),
      filtSpecies,
      4
    );

    return {
      filteredKingdomData: filteredTreeMap,
      filteredInstrumentData: filteredInstrumentData,
      visibleSpeciesTimelineData: visibleSpeciesTimelineData,
      visibleSpeciesCountries: tmpVisibleSpeciesCountries,
      visibleSpeciesEcos: tmpVisibleSpeciesEcos
    };
  }, [
    kingdomData,
    filterTreeMap,
    instrumentData,
    speciesCountries,
    timelineData,
    intersectedSpecies,
    speciesEcos
  ]);

  return (
    <>
      <HoverProvider>
        <TooltipProvider>
          <OverlayProvider>
            {<Tooltip speciesLabels={speciesLabels} />}
            {<Overlay />}
            <div
              style={{
                display: "grid",
                width: "100%",
                height: "100%",
                gridTemplateColumns: "50% 50%",
                gridTemplateRows: "45% 10% 45%",
                transformOrigin: zoomOrigin,
                transform: zoomTransform,
                transitionProperty: "transform",
                transitionDuration: "0.4s"
              }}
            >
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: 1,
                  gridRowStart: 1,
                  gridRowEnd: 1,
                  position: "relative"
                }}
              >
                {/*   <iframe
                  style={{ width: "500px", height: "500px" }}
                  src="https://commons.wikimedia.org/wiki/Diospyros_mespiliformis#/media/File:Diospyros_mespiliformis_Kruger-NP.jpg"
                ></iframe> */}
                {showOrchestra && (
                  <ResizeComponent>
                    <OrchestraNew
                      instrumentData={filteredInstrumentData}
                      instrumentGroupData={instrumentGroupData}
                      getThreatLevel={getSpeciesSignThreat}
                      threatType={threatType}
                      colorBlind={colorBlind}
                      setInstrument={setInstrument}
                      setInstrumentGroup={setInstrumentGroup}
                      instrument={instrument}
                      instrumentGroup={instrumentGroup}
                      instrumentPart={instrumentPart}
                      setInstrumentPart={setInstrumentPart}
                    />
                  </ResizeComponent>
                )}
                <FullScreenButton
                  scaleString={zoomTransform}
                  onClick={() => {
                    setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
                    setZoomOrigin(zoomTransform !== "" ? "0% 0%" : "0% 0%");
                  }}
                />
              </div>
              <div
                style={{
                  gridColumnStart: 2,
                  gridColumnEnd: 2,
                  gridRowStart: 1,
                  gridRowEnd: 1,
                  position: "relative"
                }}
              >
                {showTreeMap && (
                  <ResizeComponent>
                    <TreeMapView
                      data={{
                        name: "Kingdom",
                        children: filteredKingdomData,
                        filterDepth: 0
                      }}
                      /* kingdom={selectedKingdom}
              family={selectedFamily}
              genus={selectedGenus}
              species={selectedSpecies} */
                      treeMapFilter={treeMapFilter}
                      setTreeMapFilter={setTreeMapFilter}
                    />
                  </ResizeComponent>
                )}
                <FullScreenButton
                  scaleString={zoomTransform}
                  onClick={() => {
                    setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
                    setZoomOrigin(zoomTransform !== "" ? "0% 0%" : "100% 0%");
                  }}
                />
              </div>
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: "span 2",
                  gridRowStart: 2,
                  gridRowEnd: 2
                }}
              >
                {
                  <CenterPanel
                    data={visibleSpeciesTimelineData}
                    getSpeciesThreatLevel={getSpeciesSignThreat}
                    threatType={threatType}
                    setThreatType={setThreatType}
                    colorBlind={colorBlind}
                    setColorBlind={setColorBlind}
                    setCategoryFilter={setCategoryFilter}
                    categoryFilter={categoryFilter}
                    speciesData={species}
                    setTreeMapFilter={setTreeMapFilter}
                  />
                }
              </div>
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: 1,
                  gridRowStart: 3,
                  gridRowEnd: 3,
                  position: "relative",
                  height: "100%"
                }}
              >
                {Object.keys(visibleSpeciesTimelineData).length > 0 && (
                  <>
                    {showTimeline && (
                      <ResizeComponent>
                        <TimelineViewNew
                          data={visibleSpeciesTimelineData}
                          getTreeThreatLevel={getSpeciesSignThreat}
                          imageLinks={imageLinks}
                          dummyImageLinks={dummyImageLinks}
                          setTimeFrame={setTimeFrame}
                          timeFrame={timeFrame}
                          colorBlind={colorBlind}
                          domainYears={domainYears}
                        />
                      </ResizeComponent>
                    )}
                  </>
                )}
                <FullScreenButton
                  scaleString={zoomTransform}
                  onClick={() => {
                    setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
                    setZoomOrigin(
                      zoomTransform !== "" ? "0% 0%" : "0% calc(100% - 60px)"
                    );
                  }}
                />
              </div>
              <div
                style={{
                  gridColumnStart: 2,
                  gridColumnEnd: 2,
                  gridRowStart: 3,
                  gridRowEnd: 3,
                  position: "relative"
                }}
              >
                <div>
                  {selectedCountry}
                  <button
                    onClick={() => {
                      setSelectedCountry(null);
                    }}
                  >
                    X
                  </button>
                </div>
                {showMap && (
                  <ResizeComponent>
                    <Map
                      /* speciesCountries={Object.fromEntries(
                  Object.entries(speciesCountries).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
                      speciesCountries={visibleSpeciesCountries}
                      /* speciesEcos={Object.fromEntries(
                  Object.entries(speciesEcos).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
                      speciesEcos={visibleSpeciesEcos}
                      /* speciesHexas={Object.fromEntries(
                  Object.entries(speciesHexas).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
                      speciesHexas={speciesHexas}
                      colorBlind={colorBlind}
                      getSpeciesThreatLevel={getSpeciesSignThreat}
                      threatType={threatType}
                      setSelectedCountry={setSelectedCountry}
                    />
                  </ResizeComponent>
                )}
                <FullScreenButton
                  scaleString={zoomTransform}
                  onClick={() => {
                    setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
                    setZoomOrigin(
                      zoomTransform !== "" ? "0% 0%" : "100% calc(100% - 60px)"
                    );
                  }}
                />
              </div>
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: "span 2",
                  gridRowStart: 4,
                  gridRowEnd: 4
                }}
              >
                Footer
              </div>
            </div>
          </OverlayProvider>
        </TooltipProvider>
      </HoverProvider>
    </>
  );
}
