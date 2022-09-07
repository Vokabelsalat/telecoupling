export default function Tooltip(props) {
  const { text, position = { x: 0, y: 0 } } = props;

  console.log(position);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {text}
    </div>
  );
}
