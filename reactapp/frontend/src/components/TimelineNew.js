import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

import TimelineHeader from "./TimelineHeader";
import TimelineFront from "./TimelineFront";
import TimelineRows from "./TimelineRows";

export default function TimelineNew(props) {
  const {
    species,
    data,
    x,
    width,
    colorBlind,
    populationTrend,
    getTreeThreatLevel,
    imageLink,
    dummyImageLink,
    isAnimal,
    timeFrame,
    setTreeMapFilter
  } = props;

  const { speciesName, genusName } = species;
  const sciName = `${genusName} ${speciesName}`;

  const leftIconColor = getTreeThreatLevel(sciName, "economically").getColor(
    colorBlind
  );

  const rightIconColor = getTreeThreatLevel(sciName, "ecologically").getColor(
    colorBlind
  );

  return (
    <div
      key={`timelineNew${sciName}`}
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
          species={species}
          getTreeThreatLevel={getTreeThreatLevel}
          colorBlind={colorBlind}
          isAnimal={isAnimal}
          leftColor={leftIconColor}
          rightColor={rightIconColor}
          setTreeMapFilter={setTreeMapFilter}
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
          speciesName={sciName}
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
            speciesName={sciName}
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
