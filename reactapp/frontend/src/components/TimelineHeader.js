import ThreatIcon from "./ThreatIcon";

export default function TimelineHeader(props) {
  const { speciesName, leftColor, rightColor, isAnimal } = props;

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
      <div style={{ display: "flex", alignItems: "center" }}>{speciesName}</div>
    </div>
  );
}
