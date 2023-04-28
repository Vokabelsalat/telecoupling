import { transform } from "proj4";
import { useEffect, useRef, useState } from "react";
import PieChartNew from "./PieChartNew";
import { replaceSpecialCharacters } from "../utils/utils";

export default function OrchestraThreatPieChart(props) {
  const {
    group,
    position,
    angle,
    instruments,
    species,
    colorBlind,
    threatType,
    getThreatLevel
  } = props;

  const width = 75;
  const height = 75;

  const [processedSpecies, setProcessedSpecies] = useState({});

  useEffect(() => {
    let tmpData = {};
    for (const spec of Object.values(species).flat()) {
      tmpData[spec] = {};
    }
    setProcessedSpecies(tmpData);
  }, [species]);

  let x = position.x;
  let y = position.y;
  let cx = width / 2;
  let cy = height / 2;

  const transformString =
    "translate(" +
    x +
    " " +
    y +
    ") rotate(" +
    angle +
    ") translate(" +
    -cx +
    " " +
    -cy +
    ")";

  return (
    <foreignObject transform={transformString} width={width} height={height}>
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`
        }}
      >
        {
          <PieChartNew
            id={`${replaceSpecialCharacters(group)}ThreatPie`}
            data={processedSpecies}
            getThreatLevel={getThreatLevel}
            threatType={threatType}
            colorBlind={colorBlind}
            size={45}
          />
        }
      </div>
    </foreignObject>
  );
}
