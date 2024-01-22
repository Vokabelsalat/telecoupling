import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

export default function FullScreenButton(props) {
  const { scaleString, onClick, setTooltip } = props;

  return (
    <button
      style={{
        position: "absolute",
        right: 5,
        top: 5,
        backgroundColor: "transparent",
        border: "none"
      }}
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
            width: "15px",
            height: "15px"
          }}
        />
      ) : (
        <ArrowsPointingOutIcon
          style={{
            width: "15px",
            height: "15px"
          }}
        />
      )}
    </button>
  );
}
