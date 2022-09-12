import { transform } from "proj4";
import { useEffect, useRef, useState } from "react";

const groupToFileName = {
  Strings: "strings2.svg",
  Plucked: "plucked2.svg",
  Percussion: "percussion2.svg",
  Keyboard: "keyboard2.svg",
  Brasses: "brasses2.svg",
  Woodwinds: "woodwinds2.svg"
};

export default function InstrumentGroupIcon(props) {
  const { group, position, angle } = props;

  const fileName = groupToFileName[group];

  let x = position.x;
  let y = position.y;
  let cx = 25 / 2;
  let cy = 25 / 2;

  const transformString =
    "translate(" +
    x +
    " " +
    y +
    ") rotate(" +
    angle +
    ") translate(" +
    -cx +
    " " +
    -cy +
    ")";

  return (
    <foreignObject transform={transformString} width={25} height={25}>
      <div
        style={{
          width: "25px",
          height: "25px"
        }}
      >
        <img
          style={{ width: "auto", height: "auto" }}
          src={`${fileName}`}
        ></img>
      </div>
    </foreignObject>
  );
}
/*  */
