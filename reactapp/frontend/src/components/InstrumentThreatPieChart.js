import { transform } from "proj4";
import { useEffect, useRef, useState } from "react";
import PieChartNew from "./PieChartNew";
import { replaceSpecialCharacters } from "../utils/utils";

export default function InstrumentThreatPieChart(props) {
  const {
    instrument,
    angle,
    instruments,
    species,
    colorBlind,
    threatType,
    getThreatLevel,
    position
  } = props;

  const width = 12;
  const height = 12;

  const [processedSpecies, setProcessedSpecies] = useState({});
  const [transformString, setTransformString] = useState();

  const threatTextRef = useRef(null);

  useEffect(() => {
    let tmpData = {};
    for (const spec of species[instrument]) {
      tmpData[spec] = {};
    }
    setProcessedSpecies(tmpData);
  }, []);

  useEffect(() => {
    let x = position.x;
    let y = position.y;
    let cx = width / 2;
    let cy = height / 2;

    const tmpTransformString =
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

    setTransformString(tmpTransformString);
  }, [threatTextRef]);

  return (
    <>
      <foreignObject transform={transformString} width={width} height={height}>
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`
          }}
        >
          {
            <PieChartNew
              id={`${replaceSpecialCharacters(instrument)}ThreatPie`}
              data={processedSpecies}
              getThreatLevel={getThreatLevel}
              threatType={threatType}
              colorBlind={colorBlind}
              size={width}
            />
          }
        </div>
      </foreignObject>
    </>
  );
}
