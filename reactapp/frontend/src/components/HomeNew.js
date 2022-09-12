import { useEffect, useState } from "react";
import FullScreenButton from "./FullScreenButton";
import Tooltip from "./Tooltip";
import TimelineView from "./TimelineView";
import TimelineViewNew from "./TimelineViewNew";
import ResizeComponent from "./ResizeComponent";
import CenterPanel from "./CenterPanel";
import OrchestraNew from "./OrchestraNew";
import { getOrCreate, pushOrCreateWithoutDuplicates } from "../utils/utils";
import {
  bgciAssessment,
  citesAssessment,
  iucnAssessment
} from "../utils/timelineUtils";
import Orchestra from "./Orchestra";

export default function HomeNew(props) {
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
  const [timelineData, setTimelineData] = useState({});

  const [filteredSpecies, setFilteredSpecies] = useState([]);

  const [instrumentGroupData, setInstrumentGroupData] = useState({});
  const [instrumentData, setInstrumentData] = useState({});

  const [domainYears, setDomainYears] = useState({ maxYear: 1, minYear: 2 });

  const slice = false;

  const setTooltip = (text, position) => {
    setTooltipText(text);
    setTooltipPosition(position);
  };

  const returnDummyLink = (speciesObj) => {
    return speciesObj["Foto dummy"].trim() !== ""
      ? "fotos/" + speciesObj["Foto dummy"].replace(" ", "")
      : null;
  };

  const returnImageLink = (speciesObj) => {
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

  const getSpeciesSignThreat = (species, type = null) => {
    if (type === null) {
      type = threatType;
    }

    const speciesObj = timelineData[species];

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

        for (const spec of Object.keys(speciesData)) {
          let instrumentGroupHit = true;
          const speciesObj = speciesData[spec];

          if (instrumentGroup && !speciesObj.groups.includes(instrumentGroup)) {
            instrumentGroupHit = false;
          }

          tmpImageLinks[spec] = returnImageLink(speciesObj);
          tmpDummyImageLinks[spec] = returnDummyLink(speciesObj);

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
              if (instrumentGroupHit) {
                tmpYears.add(parseInt(element.year));
              }
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
              if (instrumentGroupHit) {
                tmpYears.add(parseInt(element.year));
              }
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
              if (instrumentGroupHit) {
                tmpYears.add(parseInt(element.year));
              }
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

          if (instrumentGroupHit) {
            tmpFilteredSpecies.push(spec);
          }
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

        console.log(tmpDomainYears, tmpYears);

        setImageLinks(tmpImageLinks);
        setDummyImageLinks(tmpDummyImageLinks);
        setSpeciesSignThreats(tmpSpeciesSignThreats);
        setTimelineData(tmpTimelineData);
        setSpecies(speciesData);
        setDomainYears(tmpDomainYears);
        setInstrumentData(tmpInstrumentData);
        setInstrumentGroupData(tmpInstrumentGroupData);
        setFilteredSpecies(tmpFilteredSpecies);
      })
      .catch((error) => {
        console.log(`Couldn't find file allSpecies.json`, error);
      });
  }, [slice, instrumentGroup]);

  const filteredSpeciesData = species;

  //const filteredSpeciesData = Object.fromEntries(filtered);
  const mapSpecies = Object.fromEntries(
    Object.keys(filteredSpeciesData).map((e) => [e, 1])
  );

  return (
    <>
      {<Tooltip text={tooltipText} position={tooltipPosition} />}
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          gridTemplateColumns: "50% 50%",
          gridTemplateRows: "40% 20% 40%",
          transformOrigin: zoomOrigin,
          transform: zoomTransform
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
          <ResizeComponent>
            <OrchestraNew
              instrumentData={instrumentData}
              instrumentGroupData={instrumentGroupData}
              getThreatLevel={getSpeciesSignThreat}
              threatType={"economically"}
              colorBlind={colorBlind}
              setInstrument={setInstrument}
              setInstrumentGroup={setInstrumentGroup}
            />
          </ResizeComponent>
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
              data={timelineData}
              getSpeciesThreatLevel={getSpeciesSignThreat}
              threatType={threatType}
              colorBlind={colorBlind}
              setColorBlind={setColorBlind}
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
          {Object.keys(filteredSpeciesData).length > 0 && (
            <>
              <ResizeComponent>
                <TimelineViewNew
                  data={timelineData}
                  getTreeThreatLevel={getSpeciesSignThreat}
                  imageLinks={imageLinks}
                  dummyImageLinks={dummyImageLinks}
                  setTimeFrame={setTimeFrame}
                  timeFrame={timeFrame}
                  colorBlind={colorBlind}
                  tooltip={setTooltip}
                  domainYears={domainYears}
                  filteredSpecies={filteredSpecies}
                />
              </ResizeComponent>
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
