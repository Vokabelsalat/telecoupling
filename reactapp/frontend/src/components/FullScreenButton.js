import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

export default function FullScreenButton(props) {
  const { scaleString, onClick } = props;

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
