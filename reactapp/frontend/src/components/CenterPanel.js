import PieChartNew from "./PieChartNew";
import Switch from "@mui/material/Switch";
import ResizeComponent from "./ResizeComponent";
import Legend from "./LegendNew";

export default function CenterPanel(props) {
  const {
    data,
    getSpeciesThreatLevel,
    threatType,
    setThreatType,
    colorBlind,
    setColorBlind,
    setCategoryFilter
  } = props;

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateRows: "auto",
        gridTemplateColumns: "calc(50% - 35px) 70px calc(50% - 35px)",
        gap: "3px"
      }}
    >
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          gridTemplateRows: "auto",
          gridTemplateColumns: "auto auto auto auto",
          gap: "3px"
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
        <Legend
          type={"economically"}
          threatType={threatType}
          colorBlind={colorBlind}
          setThreatType={setThreatType}
          setCategoryFilter={setCategoryFilter}
        />
      </div>
      <PieChartNew
        data={data}
        getThreatLevel={getSpeciesThreatLevel}
        threatType={threatType}
        colorBlind={colorBlind}
      />
      <Legend
        type={"ecologically"}
        threatType={threatType}
        colorBlind={colorBlind}
        setThreatType={setThreatType}
        setCategoryFilter={setCategoryFilter}
      />
      <div></div>
      <div></div>

      <div></div>
      <div></div>
    </div>
  );
}
