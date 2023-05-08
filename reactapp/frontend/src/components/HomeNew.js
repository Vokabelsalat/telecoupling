import { useEffect, useState } from "react";
import FullScreenButton from "./FullScreenButton";
import Tooltip from "./Tooltip";
import TimelineView from "./TimelineView";
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
import Orchestra from "./Orchestra";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";

export const returnDummyLink = (speciesObj) => {
  return speciesObj["Foto dummy"].trim() !== ""
    ? "fotos/" + speciesObj["Foto dummy"].replace(" ", "")
    : null;
};

export const returnImageLink = (speciesObj) => {
  if (speciesObj["Foto assigment"] !== "") {
    let splitter = "|";
    if (speciesObj["Foto assigment"].includes(",")) {
      splitter = ",";
    }
    let photos = speciesObj["Foto assigment"].split(splitter);
    if (photos.length > 0) {
      if (speciesObj["Family"] === "Balaenidae") {
        return "fotos/" + photos[1].trim();
      }
      return "fotos/" + photos[0].replace(" ", "");
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

  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const [imageLinks, setImageLinks] = useState({});
  const [dummyImageLinks, setDummyImageLinks] = useState({});

  const [instrument, setInstrument] = useState();
  const [instrumentGroup, setInstrumentGroup] = useState();

  const [species, setSpecies] = useState({});

  const [timeFrame, setTimeFrame] = useState([]);

  const [colorBlind, setColorBlind] = useState(false);

  const [threatType, setThreatType] = useState("economically");

  const [speciesSignThreats, setSpeciesSignThreats] = useState({});
  const [speciesCountries, setSpeciesCountries] = useState({});
  const [speciesEcos, setSpeciesEcos] = useState({});
  const [speciesHexas, setSpeciesHexas] = useState({});
  const [timelineData, setTimelineData] = useState({});

  const [filteredSpecies, setFilteredSpecies] = useState([]);

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

  const setTooltip = (text, position) => {
    setTooltipText(text);
    setTooltipPosition(position);
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
            timeFrame[1] !== undefined ? e.element.year < timeFrame[1] : true
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
    fetch("/generatedOutput/allSpecies.json")
      .then((res) => res.json())
      .then(function (speciesData) {
        speciesData = Object.fromEntries(
          Object.entries(speciesData)
            .filter(
              (t) => (t[1].Kingdom ? t[1].Kingdom.trim() !== "" : false)
              //t[0] === "Dalbergia nigra" || t[0] === "Paubrasilia echinata"
            )
            .slice(0, slice ? 70 : Object.keys(speciesData).length)
        );

        let tmpImageLinks = {};
        let tmpDummyImageLinks = {};
        let tmpSpeciesSignThreats = {};
        let tmpTimelineData = {};
        let tmpYears = new Set();
        let tmpInstrumentGroupData = {};
        let tmpInstrumentData = {};
        let tmpFilteredSpecies = [];
        let tmpSpeciesCountries = {};
        let tmpSpeciesEcos = {};
        let tmpSpeciesHexas = {};
        /* let tmpTreeMapData = {
          Animalia: { name: "Animalia", children:  },
          Plantae: { name: "Plantae", children: {} }
        }; */

        let kingdoms = { Animalia: [], Plantae: [] };
        let families = {};
        let genera = {};
        let speciesTreeMapData = {};

        for (const spec of Object.keys(speciesData)) {
          let instrumentGroupHit = true;
          const speciesObj = speciesData[spec];

          let family = speciesObj.Family.trim();
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

          speciesTreeMapData[genusSpecies] = tmpImageLinks[spec]
            ? tmpImageLinks[spec]
            : tmpDummyImageLinks[spec];

          for (const mat of speciesObj.origMat) {
            if (tmpInstrumentGroupData[mat.Instrument_groups]) {
              tmpInstrumentGroupData[mat.Instrument_groups].push(
                mat.Instruments
              );
            } else {
              tmpInstrumentGroupData[mat.Instrument_groups] = [mat.Instruments];
            }

            if (tmpInstrumentData[mat.Instruments]) {
              tmpInstrumentData[mat.Instruments].push(spec);
            } else {
              tmpInstrumentData[mat.Instruments] = [spec];
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
              let year = element.year.toString();
              tmpYears.add(parseInt(element.year));
              let assessment = bgciAssessment.get(element.danger);

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
              let year = element.year.toString();
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

          tmpFilteredSpecies.push(spec);

          let tmpCountries = [];
          if (speciesObj.hasOwnProperty("treeCountriesShort")) {
            tmpCountries = speciesObj["treeCountriesShort"];
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
          tmpSpeciesEcos[genusSpecies] = speciesObj.ecoregions;
          tmpSpeciesHexas[genusSpecies] = speciesObj.hexagons;
        }

        for (const group of Object.keys(tmpInstrumentGroupData)) {
          tmpInstrumentGroupData[group] = [
            ...new Set(tmpInstrumentGroupData[group])
          ];
        }

        for (const instrument of Object.keys(tmpInstrumentData)) {
          tmpInstrumentData[instrument] = [
            ...new Set(tmpInstrumentData[instrument])
          ];
        }

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
        setFilteredSpecies(tmpFilteredSpecies);
        setSpeciesCountries(tmpSpeciesCountries);
        setSpeciesEcos(tmpSpeciesEcos);
        setSpeciesHexas(tmpSpeciesHexas);

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
                  image: speciesTreeMapData[genusSpecies],
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

  const filteredSpeciesData = species;

  //const filteredSpeciesData = Object.fromEntries(filtered);
  const mapSpecies = Object.fromEntries(
    Object.keys(filteredSpeciesData).map((e) => [e, 1])
  );

  //FilterSection
  let visibleSpeciesCountries = {};
  let visibleSpeciesTimelineData = {};
  let hit = true;

  for (let speciesName of Object.keys(species)) {
    let specCountries = speciesCountries[speciesName];

    if (selectedCountry && speciesCountries) {
      if (!specCountries.includes(selectedCountry)) {
        continue;
      }
    }

    visibleSpeciesCountries[speciesName] =
      specCountries != null ? specCountries : [];

    visibleSpeciesTimelineData[speciesName] = timelineData[speciesName];
  }

  //visibleSpeciesTimelineData = timelineData;

  return (
    <>
      {<Tooltip text={tooltipText} position={tooltipPosition} />}
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
          {showOrchestra && (
            <ResizeComponent>
              <OrchestraNew
                instrumentData={instrumentData}
                instrumentGroupData={instrumentGroupData}
                getThreatLevel={getSpeciesSignThreat}
                threatType={threatType}
                colorBlind={colorBlind}
                setInstrument={setInstrument}
                setInstrumentGroup={setInstrumentGroup}
              />
            </ResizeComponent>
          )}
          <FullScreenButton
            scaleString={zoomTransform}
            onClick={() => {
              setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
              setZoomOrigin(zoomTransform !== "" ? "0% 0%" : "0% 0%");
            }}
            setTooltip={setTooltip}
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
                  children: kingdomData,
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
                    tooltip={setTooltip}
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
                speciesEcos={speciesEcos}
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
    </>
  );
}