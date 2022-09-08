import { useEffect, useRef } from "react";
import { polarToCartesian, describeArc } from "../utils/orchestraUtils";
import InstrumentGroupIcon from "./InstrumentGroupIcon";

const positionsToPathString = {
  0: { width: 190, strokeWidth: 130, start: 305 - 1, end: 270 },
  1: { width: 190, strokeWidth: 130, start: 340 - 1, end: 305 },
  2: { width: 190, strokeWidth: 130, start: 380, end: 340 },
  3: { width: 190, strokeWidth: 130, start: 415, end: 380 + 1 },
  4: { width: 190, strokeWidth: 130, start: 450, end: 415 + 1 },
  5: { width: 65, strokeWidth: 114, start: 90, end: 270 }
};

const calculatePath = (x, y, options) => {
  const { width, strokeWidth, start, end } = options;
  const upper = describeArc(x, y, width + strokeWidth / 2, start, end, 1);

  const lower = describeArc(x, y, width - strokeWidth / 2, start, end, 0, true);

  return [upper, lower, "Z"].join(" ");
};

export default function OrchestraGroup(props) {
  const { id, groupName, position, selected, setSelected, setZoom } = props;

  const ref = useRef(null);
  const iconTextRef = useRef(null);

  const pathString = calculatePath(
    position.x,
    position.y,
    positionsToPathString[id.toString()]
  );

  let acrOptions = positionsToPathString[id.toString()];
  const textPathString = describeArc(
    position.x,
    position.y,
    acrOptions.width + acrOptions.strokeWidth / 2 - 18,
    acrOptions.start,
    acrOptions.end,
    1,
    false
  );

  const threatIconPathString = describeArc(
    position.x,
    position.y,
    acrOptions.width,
    acrOptions.start,
    acrOptions.end,
    1,
    false
  );

  const iconPathString = describeArc(
    position.x,
    position.y,
    acrOptions.width - acrOptions.strokeWidth / 2 + 28,
    acrOptions.start,
    acrOptions.end,
    1,
    false
  );

  return (
    <>
      <g>
        <path
          ref={ref}
          fill={selected === id ? "white" : "white"}
          stroke={selected === id ? "purple" : "gray"}
          strokeWidth={selected === id ? "3px" : "1px"}
          d={pathString}
          onClick={() => {
            if (ref) {
              if (ref.current) {
                setZoom(ref.current.getBBox());
              }
            }
            setSelected(id);
          }}
        ></path>
        <path
          id={`pathForText${id}`}
          stroke={selected === id ? "purple" : "gray"}
          strokeWidth={selected === id ? "3px" : "1px"}
          fill="none"
          d={textPathString}
        ></path>
        <text id={`${id}text`} className="text" style={{ opacity: 1 }}>
          <textPath
            className="textonpath noselect"
            href={`#pathForText${id}`}
            fontSize="10"
            textAnchor="middle"
            startOffset="50%"
            id={`textPath${id}`}
            style={{ dominantBaseline: "central" }}
          >
            {groupName}
          </textPath>
        </text>
        <path
          stroke={selected === id ? "purple" : "gray"}
          strokeWidth={selected === id ? "3px" : "1px"}
          fill="none"
          id={`pathForThreatIcon${id}`}
          d={threatIconPathString}
        ></path>
        <path
          stroke={selected === id ? "purple" : "gray"}
          strokeWidth={selected === id ? "3px" : "1px"}
          fill="none"
          id={`pathForIcon${id}`}
          d={iconPathString}
        ></path>
        <text id={`${id}textForIcon`} className="text" style={{ opacity: 1 }}>
          <textPath
            ref={iconTextRef}
            className="textonpath noselect"
            href={`#pathForIcon${id}`}
            fontSize="1"
            textAnchor="middle"
            startOffset="50%"
            id={`textPath${id}`}
            style={{ dominantBaseline: "central", opacity: 0 }}
          >
            m
          </textPath>
        </text>
        <InstrumentGroupIcon
          group={groupName}
          position={{
            x:
              iconTextRef.current !== null
                ? iconTextRef.current.getBBox().x
                : 0,
            y:
              iconTextRef.current !== null ? iconTextRef.current.getBBox().y : 0
          }}
        />
      </g>
    </>
  );
}
