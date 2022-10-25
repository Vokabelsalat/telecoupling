import PieChartNew from "./PieChartNew";
import Switch from "@mui/material/Switch";
import ResizeComponent from "./ResizeComponent";

export default function CenterPanel(props) {
  const {
    data,
    getSpeciesThreatLevel,
    threatType,
    setThreatType,
    colorBlind,
    setColorBlind
  } = props;

  console.log("center threatType", threatType, data);

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateRows: "auto",
        gridTemplateColumns: "45% 10% 15% 15% 15%"
      }}
    >
      <div>
        <div
          style={{
            margin: 0,
            padding: 0
          }}
          className="searchBarWrapper"
        >
          <div>Threat Style</div>
          <div className="switchWrapper">
            <Switch
              onChange={() => {
                setThreatType(
                  threatType === "economically"
                    ? "ecologically"
                    : "economically"
                );
              }}
              checked={threatType === "economically" ? false : true}
              className="colorBlindSwitch"
              color="secondary"
            />
          </div>
        </div>
      </div>
      <PieChartNew
        data={data}
        getThreatLevel={getSpeciesThreatLevel}
        threatType={threatType}
        colorBlind={colorBlind}
      />
      <div></div>
      <div></div>
      <div
        style={{
          alignSelf: "center",
          justifySelf: "center"
        }}
      >
        <div
          style={{
            margin: 0,
            padding: 0
          }}
          className="searchBarWrapper"
        >
          <div>Color Blind Mode</div>
          <div className="switchWrapper">
            <Switch
              onChange={() => {
                setColorBlind(!colorBlind);
              }}
              checked={colorBlind}
              className="colorBlindSwitch"
              color="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
