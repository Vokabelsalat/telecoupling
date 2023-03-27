import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

import TimelineHeader from "./TimelineHeader";
import TimelineFront from "./TimelineFront";
import TimelineRows from "./TimelineRows";

export default function TimelineNew(props) {
  const {
    speciesName,
    data,
    x,
    width,
    colorBlind,
    populationTrend,
    getTreeThreatLevel,
    imageLink,
    dummyImageLink,
    isAnimal,
    timeFrame
  } = props;

  const leftIconColor = getTreeThreatLevel(
    speciesName,
    "economically"
  ).getColor(colorBlind);

  const rightIconColor = getTreeThreatLevel(
    speciesName,
    "ecologically"
  ).getColor(colorBlind);

  return (
    <div
      key={`timelineNew${speciesName}`}
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateColumns: "100px auto",
        gridTemplateRows: "auto auto"
      }}
    >
      <div
        style={{
          gridColumnStart: 1,
          gridColumnEnd: "span 2",
          gridRowStart: 1,
          gridRowEnd: 1
        }}
      >
        <TimelineHeader
          speciesName={speciesName}
          getTreeThreatLevel={getTreeThreatLevel}
          colorBlind={colorBlind}
          isAnimal={isAnimal}
          leftColor={leftIconColor}
          rightColor={rightIconColor}
        />
      </div>
      <div
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 1,
          gridRowStart: 2,
          gridRowEnd: 2
        }}
      >
        <TimelineFront
          speciesName={speciesName}
          imageLink={imageLink}
          dummyLink={dummyImageLink}
        />
      </div>
      <div
        style={{
          gridColumnStart: 2,
          gridColumnEnd: 2,
          gridRowStart: 2,
          gridRowEnd: 2
        }}
      >
        {data !== null && (
          <TimelineRows
            width={width}
            data={data}
            speciesName={speciesName}
            x={x}
            colorBlind={colorBlind}
            populationTrend={populationTrend}
            timeFrame={timeFrame}
          />
        )}
      </div>
    </div>
  );
}
