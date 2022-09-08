import { useEffect, useRef } from "react";
import { polarToCartesian } from "../utils/orchestraUtils";

const positionsToPathString = {
  0: "M 0,264.58333 A 264.58333,264.58333 0 0 1 45.23381,116.63021 l 111.82524,75.42709 a 129.69771,129.69771 0 0 0 -22.17343,72.52603 z",
  1: "M 47.849356,112.82457 A 264.58333,264.58333 0 0 1 169.76514,17.573514 l 48.33869,125.926576 a 129.69771,129.69771 0 0 0 -59.76265,46.6917 z",
  2: "m 174.0905,15.95633 a 264.58333,264.58333 0 0 1 180.98567,0 l -46.1336,126.75102 a 129.69771,129.69771 0 0 0 -88.71847,0 z",
  3: "m 359.40152,17.573514 a 264.58333,264.58333 0 0 1 121.91579,95.251056 l -110.49183,77.36722 a 129.69771,129.69771 0 0 0 -59.76265,-46.6917 z",
  4: "m 483.93286,116.63021 a 264.58333,264.58333 0 0 1 45.23381,147.95312 H 394.28105 A 129.69771,129.69771 0 0 0 372.10761,192.0573 Z",
  5: "m 137.99837,264.58333 a 126.58497,126.58497 0 0 1 253.16993,0 H 272.88399 a 8.300655,8.300655 0 0 0 -16.60131,0 z"
};

const describeArc = (
  x,
  y,
  radius,
  startAngle,
  endAngle,
  direction = 0,
  withoutM = false
) => {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  if (direction === 0) {
    let tmp = start;
    start = end;
    end = tmp;
  }

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  let d;

  if (withoutM) {
    d = [
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      direction,
      end.x,
      end.y
    ].join(" ");
  } else {
    d = [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      direction,
      end.x,
      end.y
    ].join(" ");
  }

  return d;
};

const describeLine = (x, y, endX, endY, withoutM) => {
  if (withoutM) return ["L", endX, endY].join(" ");
  else return ["M", x, y, "L", endX, endY].join(" ");
};

export default function OrchestraGroup(props) {
  const { position, selected, setSelected, setZoom } = props;

  const ref = useRef(null);

  const pathString = positionsToPathString[position.toString()];

  return (
    <>
      <g>
        <path
          ref={ref}
          fill={selected === position ? "white" : "white"}
          stroke={selected === position ? "purple" : "gray"}
          strokeWidth={selected === position ? "3px" : "1px"}
          d={pathString}
          onClick={() => {
            if (ref) {
              if (ref.current) {
                setZoom(ref.current.getBBox());
              }
            }
            setSelected(position);
          }}
        ></path>
        <g>
          <rect
            width="2"
            height="2"
            fill="purple"
            x={`${
              ref.current
                ? ref.current.getBBox().x + ref.current.getBBox().width / 2
                : 0
            }`}
            y={`${
              ref.current
                ? ref.current.getBBox().y + ref.current.getBBox().height / 2
                : 0
            }`}
          ></rect>
        </g>
      </g>
    </>
  );
}
