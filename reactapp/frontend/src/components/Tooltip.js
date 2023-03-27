import { useContext } from "react";
import { TooltipContext } from "./TooltipProvider";

export default function Tooltip(props) {
  const { tooltipText, tooltipPosition } = useContext(TooltipContext);

  if (tooltipText === "") {
    return <></>;
  } else {
    return (
      <div
        style={{
          position: "absolute",
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          border: "1px solid gray",
          padding: "3px",
          borderRadius: "5px",
          backgroundColor: "white",
          zIndex: 99999
        }}
      >
        {tooltipText}
      </div>
    );
  }
}
