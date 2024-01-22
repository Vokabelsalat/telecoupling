import { useContext } from "react";
import { OverlayContext } from "./OverlayProvider";

export default function Overlay(props) {
  const [overlay, setOverlay] = useContext(OverlayContext);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 5000,
        display: overlay ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        cursor: "zoom-out"
      }}
      onClick={(e) => {
        setOverlay(null);
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "5px"
        }}
      >
        {overlay}
      </div>
    </div>
  );
}
