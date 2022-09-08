import { useEffect } from "react";
import CenterPieChartHelper from "./CenterPieChartHelper";

export default function CenterPieChartNew(props) {
  const { data, getThreatLevel, threatType, colorBlind } = props;

  useEffect(() => {
    CenterPieChartHelper.draw({
      id: "centerPieChart",
      data: data,
      getTreeThreatLevel: getThreatLevel,
      treeThreatType: threatType,
      colorBlind: colorBlind
    });
  });

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div id="centerPieChart" />
    </div>
  );
}
