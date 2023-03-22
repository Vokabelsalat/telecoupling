import ContentPanel from "./ContentPanel";
import ContentWrapper from "./ContentWrapper";
import { Content } from "./Content";
import ResizeComponent from "../ResizeComponent";
import StoryMap from "../StoryMapCleanUp";
import contents from "./StoryContents";
import { useRefDimensions } from "./useRefDimensions";
import {
  bgciAssessment,
  citesAssessment,
  iucnAssessment
} from "../../utils/timelineUtils";

import { returnDummyLink, returnImageLink } from "../HomeNew";

import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";

import { useIntersection } from "./useIntersection";
import { active } from "d3";
import { padding } from "@mui/system";
import Overlay from "../Overlay/Overlay";

export default function BowStory(props) {
  const { width, height } = props;

  const ref = useRef(null);

  const [activeFigure, setActiveFigure] = useState();
  const [activeMapLayer, setActiveMapLayer] = useState();

  const [trigger, setTrigger] = useState(true);
  const [isIntro, setIsIntro] = useState(true);
  const [enableAutoPlay, setEnableAutoPlay] = useState(false);
  const offset = 0;

  const fontStyle = "classic"; // "modern" | "classic"
  const alignment = "centerBlockText"; // "center" | "left" | "right" | "centerBlockText"
  const [effect, setEffect] = useState("");
  const [mapMode, setMapMode] = useState("light");
  const [showCountries, setShowCountries] = useState(true);

  const mapRef = useRef(null);
  const wrapperRef = useRef(null);

  const [timeFrame, setTimeFrame] = useState([]);
  const [threatType, setThreatType] = useState("economically");

  const [overlayContent, setOverlayContent] = useState(null);

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

  function flyToMapPosition(flyTo) {
    if (mapRef.current) {
      mapRef.current.flyTo({
        /* center: [(Math.random() - 0.5) * 360, (Math.random() - 0.5) * 100],
        essential: true // this animation is considered essential with respect to prefers-reduced-motion */
        ...flyTo,
        essential: true
      });
    }
  }

  function keyDown(event) {
    var code = event.code;
    // Alert the key name and key code on keydown
    //alert(`Key pressed ${name} \r\n Key code value: ${code}`);
    if (code === "KeyM") {
      setActiveFigure(activeFigure + 1);
    } else if (code === "KeyN") {
      setActiveFigure(activeFigure - 1);
    }
  }

  const mobile = useMemo(() => {
    if (width < 600) {
      return true;
    } else {
      return false;
    }
  }, [width]);

  useEffect(() => {
    const scrollToHashElement = () => {
      const { hash } = window.location;
      const elementToScroll = document.getElementById(hash?.replace("#", ""));

      if (!elementToScroll) return;

      ref.current.scrollTo({
        top: elementToScroll.offsetTop - offset,
        behavior: "instant"
      });
    };

    if (!trigger) return;

    scrollToHashElement();

    window.addEventListener("hashchange", scrollToHashElement);
    return window.removeEventListener("hashchange", scrollToHashElement);
  }, [trigger]);

  useIntersection(
    ref,
    "div.contentWrapper",
    (entry, idx) => {
      /* if (entry.intersectionRatio > 0.1) {
        setActiveFigure(idx);
      } */
      if (entry.isIntersecting === true) {
        /* const tmpTest = [...activeFigure];
        tmpTest[idx] = entry.intersectionRatio; */
        if (typeof window.history.pushState == "function") {
          setTimeout(() => {
            window.history.pushState(
              null,
              `bowstory#${idx}`,
              `bowstory#${idx}`
            );
          }, 500);
        } else {
          setTimeout(() => {
            window.location.hash = idx;
          }, 500);
        }
        setActiveFigure(idx);
      }

      /*       tmpTest[idx] = entry.intersectionRatio;
      setActiveFigure(tmpTest); */
    },
    //{ threshold: 1, rootMargin: "32px 0px -65% 0px" }
    {
      // threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      threshold: 0,
      rootMargin: "-30% 0px -35% 0px"
      // rootMargin: "0px 0px 0px 0px"
    }
  );

  function applyContentEffect(effect) {
    switch (effect.type) {
      case "black":
        setMapMode("dark");
        setEffect(effect.type);
        break;
      default:
    }
  }

  useEffect(() => {
    if (activeFigure != null) {
      if (activeFigure > 0) {
        setIsIntro(false);
      } else {
        setIsIntro(true);
      }
    }

    if (activeFigure !== null && contents[activeFigure] != null) {
      setActiveMapLayer(contents[activeFigure].mapLayer ?? null);
    }

    if (
      activeFigure !== null &&
      contents[activeFigure] != null &&
      contents[activeFigure].showCountries != null
    ) {
      setShowCountries(contents[activeFigure].showCountries);
    }

    if (
      activeFigure != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].effect != null
    ) {
      applyContentEffect(contents[activeFigure].effect);
    } else {
      setEffect("");
      setMapMode("light");
    }

    if (
      activeFigure != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].speciesFilter != null
    ) {
      setSpeciesFilter(contents[activeFigure].speciesFilter);
    } else {
      setSpeciesFilter([]);
    }

    if (
      activeFigure != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].countriesFilter != null
    ) {
      setCountriesFilter(contents[activeFigure].countriesFilter);
    } else {
      setCountriesFilter([]);
    }

    if (
      activeFigure != null &&
      contents[activeFigure] &&
      contents[activeFigure].flyTo != null
    ) {
      flyToMapPosition(contents[activeFigure].flyTo);
    }
  }, [activeFigure]);

  const [instrumentGroupData, setInstrumentGroupData] = useState({});
  const [instrumentData, setInstrumentData] = useState({});
  const [imageLinks, setImageLinks] = useState({});
  const [dummyImageLinks, setDummyImageLinks] = useState({});
  const [species, setSpecies] = useState({});
  const [timelineData, setTimelineData] = useState({});
  const [speciesSignThreats, setSpeciesSignThreats] = useState({});
  const [domainYears, setDomainYears] = useState({ maxYear: 1, minYear: 2 });
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [speciesCountries, setSpeciesCountries] = useState({});
  const [speciesEcos, setSpeciesEcos] = useState({});
  const [speciesHexas, setSpeciesHexas] = useState({});
  const [kingdomData, setKingdomData] = useState([]);
  const [instrument, setInstrument] = useState();
  const [instrumentGroup, setInstrumentGroup] = useState();
  const [colorBlind, setColorBlind] = useState(false);

  useEffect(() => {
    fetch("/generatedOutput/allSpecies.json")
      .then((res) => res.json())
      .then(function (speciesData) {
        speciesData = Object.fromEntries(
          Object.entries(speciesData).filter(
            (t) => (t[1].Kingdom ? t[1].Kingdom.trim() !== "" : false)
            //t[0] === "Dalbergia nigra" || t[0] === "Paubrasilia echinata"
          )
          // .slice(0, slice ? 70 : Object.keys(speciesData).length)
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
  }, []);

  function arrayIntersection(a, b) {
    const setA = new Set(a);
    return b.filter((value) => setA.has(value));
  }

  const [speciesFilter, setSpeciesFilter] = useState([]);
  const [hexaFilter, setHexaFilter] = useState([]);
  const [countriesFilter, setCountriesFilter] = useState([]);

  const filteredSpeciesCountries = useMemo(() => {
    return Object.fromEntries(
      Object.entries(speciesCountries).filter(([key]) => {
        let hit = true;

        if (speciesFilter.length > 0) {
          hit = speciesFilter.includes(key);
        }

        if (hit && countriesFilter.length > 0) {
          hit =
            arrayIntersection(speciesCountries[key], countriesFilter).length >
            0;
        }

        if (hit && instrumentGroup != null) {
          let filteredInstruments = instrumentGroupData[instrumentGroup];

          if (hit && instrument != null) {
            filteredInstruments = [instrument];
          }

          const testSpecies = [];

          filteredInstruments.forEach((inst) => {
            if (instrumentData[inst].includes(key)) {
              testSpecies.push(inst);
            }
          });

          hit = testSpecies.length > 0;
        }
        return hit;
      })
    );
  }, [
    speciesCountries,
    speciesFilter,
    countriesFilter,
    instrument,
    instrumentGroup,
    instrumentData,
    instrumentGroupData
  ]);

  const filteredSpeciesEcos = useMemo(() => {
    return Object.fromEntries(
      Object.entries(speciesEcos).filter(([key]) => {
        let hit = true;

        if (speciesFilter.length > 0) {
          hit = speciesFilter.includes(key);
        }

        return hit;
      })
    );
  }, [speciesEcos, speciesFilter]);

  console.log("timeline", timelineData);

  const filteredSpeciesTimelineData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(timelineData).filter(([key]) => {
        let hit = true;

        if (speciesFilter.length > 0) {
          hit = speciesFilter.includes(key);
        }

        return hit;
      })
    );
  }, [speciesFilter, timelineData]);

  const filteredSpeciesHexas = useMemo(() => {
    return Object.fromEntries(
      Object.entries(speciesHexas).filter(([key]) => {
        let hit = true;

        if (speciesFilter.length > 0) {
          hit = speciesFilter.includes(key);
        }

        /*   if (hit && hexaFilter.length > 0) {
          hit = arrayIntersection(speciesHexas[key], hexaFilter).length > 0;
        }

        if (hit && instrumentGroup != null) {
          let filteredInstruments = instrumentGroupData[instrumentGroup];

          if (hit && instrument != null) {
            filteredInstruments = [instrument];
          }

          const testSpecies = [];

          filteredInstruments.forEach((inst) => {
            if (instrumentData[inst].includes(key)) {
              testSpecies.push(inst);
            }
          });

          hit = testSpecies.length > 0;
        } */
        return hit;
      })
    );
  }, [
    speciesHexas,
    speciesFilter,
    hexaFilter,
    instrument,
    instrumentGroup,
    instrumentData,
    instrumentGroupData
  ]);

  /*  const filteredSpeciesHexas = useMemo(() => {
    return Object.fromEntries(
      Object.entries(speciesHexas).filter(([key]) =>
        speciesFilter.includes(key)
      )
    );
  }, [speciesHexas, speciesFilter]); */

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateRows: "repeat(auto-fit, minmax(100px, 1fr))",
          gridTemplateColumns: "100% 20px"
        }}
        ref={wrapperRef}
        onKeyDown={keyDown}
      >
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <ResizeComponent>
            <StoryMap
              /* speciesCountries={Object.fromEntries(
                  Object.entries(speciesCountries).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
              speciesCountries={filteredSpeciesCountries}
              /* speciesEcos={Object.fromEntries(
                  Object.entries(speciesEcos).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
              speciesEcos={filteredSpeciesEcos}
              /* speciesHexas={Object.fromEntries(
                  Object.entries(speciesHexas).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
              speciesHexas={filteredSpeciesHexas}
              // colorBlind={colorBlind}
              getSpeciesThreatLevel={getSpeciesSignThreat}
              // threatType={threatType}
              // setSelectedCountry={setSelectedCountry}
              ref={mapRef}
              mode={mapMode}
              activeMapLayer={activeMapLayer}
              showCountries={showCountries}
            />
          </ResizeComponent>
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              display: isIntro ? "flex" : "none",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                boxShadow: "5px 10px 8px #888888",
                padding: "15px",
                borderRadius: "5px"
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: "5px",
                  gridTemplateColumns: "auto auto"
                }}
              >
                <div
                  style={{
                    gridColumn: "span 2"
                    /* fontSize: "x-large",
                  fontWeight: "bold",
                  marginBottom: "15px" */
                  }}
                >
                  <h3>Welcome to the Story of Stringed Instrument Bows!</h3>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  For the full immersive experience please enable:
                </div>
                <label
                  style={{ gridColumn: "span 2" }}
                  class="checkMarkContainer"
                >
                  <div style={{ gridColumn: "1" }}>
                    &#x266A; Automatic Replay of Audios & Videos
                  </div>
                  <input
                    style={{ gridColumn: "2" }}
                    type="checkbox"
                    checked={enableAutoPlay ? "checked" : ""}
                    onChange={(event) => {
                      setEnableAutoPlay(event.target.checked);
                    }}
                  />
                  <span style={{ gridColumn: "2" }} class="checkmark"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <ContentPanel className={`contentPanel ${effect}`} ref={ref}>
            {contents.map((content, index) => {
              return (
                <ContentWrapper
                  id={index}
                  key={`content${index}`}
                  style={{
                    opacity: activeFigure === index ? 1.0 : 0.3,
                    height: ["storyTitle", "fullSizeQuote", "end"].includes(
                      content.type
                    )
                      ? mobile
                        ? "45vh"
                        : "100vh"
                      : null
                  }}
                >
                  {/* <div
                style={{
                  height: "600px",
                  width: "100%",
                  border: "1px solid black",
                  marginBottom: "10px"
                }}
              >
                {index}
              </div> */}
                  <Content
                    {...content}
                    alignment={alignment}
                    playAudio={enableAutoPlay && activeFigure === index}
                    mobile={mobile}
                    setOverlayContent={setOverlayContent}
                    visualization={
                      content.visualization != null
                        ? {
                            ...content.visualization,
                            instrumentData: instrumentData,
                            instrumentGroupData: instrumentGroupData,
                            getThreatLevel: getSpeciesSignThreat,
                            threatType: threatType,
                            colorBlind: colorBlind,
                            setInstrument: setInstrument,
                            setInstrumentGroup: setInstrumentGroup,
                            speciesTimelineData: filteredSpeciesTimelineData,
                            imageLinks: imageLinks,
                            dummyImageLinks: dummyImageLinks,
                            setTimeFrame: setTimeFrame,
                            timeFrame: timeFrame,
                            domainYears: domainYears
                          }
                        : null
                    }
                  />
                </ContentWrapper>
              );
            })}
            <ContentWrapper>
              <Content type={"restart"} height={"25vh"} alignment={alignment} />
            </ContentWrapper>
          </ContentPanel>
        </div>
      </div>
      <Overlay
        open={overlayContent !== null}
        onClose={() => {
          setOverlayContent(null);
        }}
      >
        {overlayContent}
      </Overlay>
    </>
  );
}
