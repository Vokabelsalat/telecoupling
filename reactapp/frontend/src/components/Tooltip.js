export default function Tooltip(props) {
  const { text, position = { x: 0, y: 0 } } = props;

  if (text === "") {
    return <></>;
  } else {
    return (
      <div
        style={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          border: "1px solid gray",
          padding: "3px",
          borderRadius: "5px",
          backgroundColor: "white",
          zIndex: 99999
        }}
      >
        {text}
      </div>
    );
  }
}
