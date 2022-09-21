import { useEffect, useRef, useState } from "react";
import {
  polarToCartesian,
  describeArc,
  calculatePath
} from "../utils/orchestraUtils";
import InstrumentGroupIcon from "./InstrumentGroupIcon";
import OrchestraThreatPieChart from "./OrchestraThreatPieChart";
import OrchestraGroupContent from "./OrchestraGroupContent";
import OrchestraInstruments from "./OrchestraInstruments";

const positionsToPathString = {
  0: { width: 190, strokeWidth: 130, start: 305 - 1, end: 270 },
  1: { width: 190, strokeWidth: 130, start: 340 - 1, end: 305 },
  2: { width: 190, strokeWidth: 130, start: 380, end: 340 },
  3: { width: 190, strokeWidth: 130, start: 415, end: 380 + 1 },
  4: { width: 190, strokeWidth: 130, start: 450, end: 415 + 1 },
  5: { width: 65, strokeWidth: 114, start: 90, end: 270, widthOffset: 110 }
};

export default function OrchestraGroup(props) {
  const {
    id,
    groupName,
    position,
    selected,
    setSelected,
    setZoom,
    getThreatLevel,
    threatType,
    colorBlind,
    instruments,
    species,
    setInstrument,
    setInstrumentGroup
  } = props;

  const ref = useRef(null);
  const iconTextRef = useRef(null);
  const threatTextRef = useRef(null);

  const [highlight, setHighlight] = useState(false);

  const pathString = calculatePath(
    position.x,
    position.y,
    positionsToPathString[id.toString()]
  );

  let acrOptions = positionsToPathString[id.toString()];

  return (
    <>
      <g
        onClick={() => {
          if (ref) {
            if (ref.current) {
              setZoom(ref.current.getBBox());
            }
          }
          setSelected(id);
          setInstrumentGroup(groupName);
          setInstrument(null);
        }}
        onMouseEnter={() => {
          setHighlight(true);
        }}
        onMouseLeave={() => {
          setHighlight(false);
        }}
        className="orchestraGroupGroup"
      >
        <path
          ref={ref}
          fill={selected === id ? "white" : "white"}
          stroke={highlight && selected !== id ? "purple" : "gray"}
          strokeWidth={highlight ? "1px" : "1px"}
          d={pathString}
        ></path>
        {selected === id ? (
          <OrchestraInstruments
            {...props}
            acrOptions={acrOptions}
            isSelected={selected === id}
          />
        ) : (
          <OrchestraGroupContent {...props} acrOptions={acrOptions} />
        )}
      </g>
    </>
  );
}
