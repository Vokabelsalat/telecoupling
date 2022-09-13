import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function VisInfoButton(props) {
  const {
    scaleString,
    onClick,
    top = 5,
    right = 30,
    left = "unset",
    children
  } = props;

  return (
    <button
      style={{
        position: "absolute",
        right: right,
        left: left,
        top: top,
        backgroundColor: "rgba(255, 255, 255, 0.50)",
        border: "none",
        display: "grid",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        width: "25px",
        height: "25px"
      }}
      className="visOptionButton"
      onClick={onClick}
    >
      {children}
      <InformationCircleIcon style={{ width: "22px", height: "22px" }} />
    </button>
  );
}
