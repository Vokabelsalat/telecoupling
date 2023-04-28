import { TooltipContext } from "./TooltipProvider";

import { useState, useContext } from "react";

import ThreatIcon from "./ThreatIcon";

export default function TimelineHeader(props) {
  const { speciesName, leftColor, rightColor, isAnimal } = props;

  const [hover, setHover] = useState(false);
  const { setTooltip } = useContext(TooltipContext);

  return (
    <div
      style={{
        fontSize: "14px",
        display: "grid",
        width: "100%",
        height: "20px",
        gridTemplateColumns: "20px auto",
        gridTemplateRows: "auto"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <ThreatIcon
          leftColor={leftColor}
          rightColor={rightColor}
          isAnimal={isAnimal}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <span
          style={{ fontWeight: hover ? "bold" : "normal", cursor: "pointer" }}
          onMouseEnter={(event) => {
            setTooltip(speciesName, "species", {
              x: event.pageX + 15,
              y: event.pageY + 15
            });
            event.stopPropagation();
            event.preventDefault();
            setHover(true);
          }}
          onMouseLeave={(event) => {
            setHover(false);
            setTooltip(null, null, null);
          }}
        >
          {speciesName}
        </span>
      </div>
    </div>
  );
}
