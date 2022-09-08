import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

import TimelineHeader from "./TimelineHeader";
import TimelineFront from "./TimelineFront";
import TimelineRows from "./TimelineRows";
import TimelineScaleD3 from "./TimelineScaleD3";
import TimelineNew from "./TimelineNew";

import { useState, useEffect, useRef } from "react";

import { replaceSpecialCharacters } from "../utils/utils";

import * as d3 from "d3";

export default function TimelineViewNew(props) {
  const {
    data,
    width,
    timeFrame,
    setTimeFrame,
    domainYears,
    tooltip,
    imageLinks,
    dummyImageLinks,
    colorBlind,
    getTreeThreatLevel
  } = props;

  //const [x, setX] = useState(null);
  const [timescaleWidth, setTimescaleWidth] = useState(0);

  let x = useRef(null);

  useEffect(() => {
    let timescaleWidth = Math.max(width, 160) - 160;
    if (
      Number.isInteger(domainYears.minYear) &&
      Number.isInteger(domainYears.maxYear)
    ) {
      let yearDiff = domainYears.maxYear - domainYears.minYear;

      let xDomain = Array(yearDiff + 1)
        .fill()
        .map((_, i) => domainYears.minYear - 1 + i + 1);

      x.current = d3
        .scaleBand()
        .domain(xDomain)
        .rangeRound([0, timescaleWidth]);
    }

    setTimescaleWidth(timescaleWidth);
  }, [domainYears, width]);

  const sortedKeys = Object.keys(data).sort();

  if (x.current === null) {
    return <></>;
  } else {
    return (
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          gridTemplateColumns: "auto",
          gridTemplateRows: `min-content 1fr min-content`
        }}
      >
        {
          <TimelineScaleD3
            id={"scaleTop2"}
            key={"scaleToptimeline"}
            data={null}
            speciesName={"scaleTop"}
            domainYears={domainYears}
            setTimeFrame={setTimeFrame}
            timeFrame={timeFrame}
            x={x.current}
            width={timescaleWidth}
          />
        }
        {
          <div
            style={{
              overflowY: "scroll",
              width: "fit-content",
              position: "relative",
              marginLeft: "3px"
            }}
          >
            <div
              style={{
                position: "relative"
              }}
            >
              {sortedKeys.map((e) => {
                return (
                  <TimelineNew
                    id={replaceSpecialCharacters(e) + "TimelineVis"}
                    key={replaceSpecialCharacters(e) + "timeline"}
                    data={data[e]}
                    speciesName={e}
                    domainYears={domainYears}
                    getTreeThreatLevel={getTreeThreatLevel}
                    colorBlind={colorBlind}
                    timeFrame={timeFrame}
                    x={x.current}
                    width={timescaleWidth}
                    populationTrend={data[e].populationTrend}
                    imageLink={imageLinks[e]}
                    dummyImageLink={dummyImageLinks[e]}
                    isAnimal={data[e].Kingdom === "Animalia" ? true : false}
                    tooltip={tooltip}
                  />
                );
              })}
              {timeFrame[1] !== undefined &&
                timeFrame[1] !== domainYears.maxYear && (
                  <div
                    style={{
                      position: "absolute",
                      left: 140 + x.current(timeFrame[1]),
                      top: 0,
                      width: timescaleWidth - x.current(timeFrame[1]),
                      height: "100%",
                      backgroundColor: "rgba(255,255,255,0.7)",
                      borderLeft: "2px solid var(--highlightpurple)"
                    }}
                  />
                )}
            </div>
          </div>
        }
        {
          <TimelineScaleD3
            id={"scaleBottom2"}
            key={"scaleBottomtimeline"}
            data={null}
            domainYears={domainYears}
            setTimeFrame={setTimeFrame}
            timeFrame={timeFrame}
            x={x.current}
            width={timescaleWidth}
            bottom={true}
          />
        }
      </div>
    );
  }
}