import { PatternRect } from "leaflet";
import { useEffect, useRef, useState, cloneElement } from "react";
import {
  citesAssessment,
  bgciAssessment,
  iucnAssessment
} from "../utils/timelineUtils";
import { pushOrCreate } from "../utils/utils";

export default function TimelineRow(props) {
  const { type, data, x, width, colorBlind, populationTrend, tooltip } = props;

  const rowHeight = 20;

  let populationTrendColor = "transparent";
  let populationTrendIcon = "transparent";

  switch (populationTrend) {
    case "Decreasing":
      populationTrendColor = iucnAssessment.get("EX").getColor(colorBlind);
      populationTrendIcon = "\u21D8";
      break;
    case "Increasing":
      populationTrendColor = iucnAssessment.get("LC").getColor(colorBlind);
      populationTrendIcon = "\u21D7";
      break;
    case "Stable":
      populationTrendColor = iucnAssessment.get("NT").getColor(colorBlind);
      populationTrendIcon = "\u21D2";
      break;
    case null:
      populationTrendColor = "transparent";
      populationTrendIcon = "";
      break;
    case "Unknown":
      populationTrendColor = "transparent";
      populationTrendIcon = "";
      break;
    default:
      break;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: "5px"
        }}
      >
        {type.toUpperCase()}
      </div>
      <svg height={`${rowHeight}`} width={width}>
        {data.map((assessmentAndElement) => {
          let year = assessmentAndElement.element.year;
          let xVal = x(parseInt(assessmentAndElement.element.year));
          if (xVal < 0) {
            return;
          }
          console.log(
            width,
            xVal,
            width - xVal,
            parseInt(assessmentAndElement.element.year),
            assessmentAndElement
          );

          let color = assessmentAndElement.assessment.getColor(colorBlind);
          return (
            <g
              key={`${assessmentAndElement.element.year}${assessmentAndElement.element.type}${assessmentAndElement.element.text}${assessmentAndElement.element.sciName}${colorBlind}`}
              transform={`translate(${xVal}, 0)`}
            >
              <rect
                height={4}
                width={width - xVal}
                x={0}
                y={rowHeight / 2 - 2}
                fill={color}
              ></rect>
              <path
                d={`M 0 0 L ${Math.min(rowHeight, x.bandwidth())} ${
                  rowHeight / 2
                } L 0 ${rowHeight} z`}
                fill={color}
                onMouseEnter={(event) => {
                  tooltip(year, { x: event.pageX + 15, y: event.pageY + 15 });
                }}
                onMouseLeave={(event) => {
                  tooltip("", { x: event.pageX + 15, y: event.pageY + 15 });
                }}
              />
            </g>
          );
        })}
      </svg>
      <div>
        {type === "iucn" && populationTrend !== null && (
          <>
            <div
              style={{
                height: "100%",
                width: "15px",
                backgroundColor: populationTrendColor,
                display: "flex",
                justifyContent: "center",
                fontSize: populationTrend !== "Stable" ? "17px" : "13px"
              }}
            >
              {populationTrendIcon}
            </div>
          </>
        )}
      </div>
    </>
  );
}
