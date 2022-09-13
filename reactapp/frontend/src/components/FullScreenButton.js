import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

export default function FullScreenButton(props) {
  const {
    scaleString,
    onClick,
    setTooltip,
    top = 5,
    right = 5,
    left = "unset"
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
      onMouseEnter={(event) => {
        if (setTooltip)
          setTooltip("Enter Fullscreen", { x: event.pageX, y: event.pageY });
      }}
      onMouseLeave={(event) => {
        if (setTooltip) setTooltip("", { x: event.pageX, y: event.pageY });
      }}
    >
      {scaleString !== "" ? (
        <ArrowsPointingInIcon
          style={{
            width: "18px",
            height: "18px"
          }}
        />
      ) : (
        <ArrowsPointingOutIcon
          style={{
            width: "18px",
            height: "18px"
          }}
        />
      )}
    </button>
  );
}
