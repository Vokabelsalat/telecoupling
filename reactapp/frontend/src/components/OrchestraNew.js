import Orchestra from "./Orchestra";
import OrchestraGroup from "./OrchestraGroup";
import InstrumentGroupIcon from "./InstrumentGroupIcon";
import { useState, useRef, useEffect, useCallback } from "react";

const groupToPosition = {
  Keyboard: 0,
  Plucked: 1,
  Percussion: 2,
  Woodwinds: 3,
  Brasses: 4,
  Strings: 5
};

export default function OrchestraNew(props) {
  const {
    data,
    width,
    height,
    instrumentData,
    instrumentGroupData,
    colorBlind,
    threatType,
    getThreatLevel,
    setInstrument,
    setInstrumentGroup
  } = props;

  const ref = useRef(null);

  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [scaleString, setScaleString] = useState(null);

  const [scaledWidth, setScaledWidth] = useState(width);
  const [scaledHeight, setScaledHeight] = useState(height);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (ref) {
      if (ref.current) {
        let actWidth = ref.current.getBBox().width;
        let actHeight = ref.current.getBBox().height;

        actWidth = actWidth > 0 ? actWidth : 1;
        actHeight = actHeight > 0 ? actHeight : 0.5;

        let tmpScale = scale;
        if (width < height) {
          tmpScale = width / actWidth;
        }
        if (height < width) {
          tmpScale = height / actHeight;
        }

        setScaledWidth(actWidth * scale);
        setScaledHeight(actHeight * scale);
        setScale(tmpScale);
      }
    }
  }, [width, height, scale, instrumentGroupData]);

  const zoomInto = useCallback(
    (i_zoom) => {
      let scaleStringTmp;
      if (i_zoom) {
        let x0 = i_zoom.x;
        let x1 = i_zoom.x + i_zoom.width;
        let y0 = i_zoom.y;
        let y1 = i_zoom.y + i_zoom.height;

        scaleStringTmp = `translate(${scaledWidth / 2}, ${
          scaledHeight / 2
        }) scale(${Math.min(
          8,
          0.9 / Math.max((x1 - x0) / scaledWidth, (y1 - y0) / scaledHeight)
        )}) translate(${-(x0 + x1) / 2}, ${-(y0 + y1) / 2})`;
        setScaleString(scaleStringTmp);
      } else {
        scaleStringTmp = `scale(${scale})`;
        setScaleString(scaleStringTmp);
      }
    },
    [scaledWidth, scaledHeight]
  );

  return (
    <div
      style={{
        width: { width },
        height: { height },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 5,
          left: 5,
          backgroundColor: "blue",
          color: "white",
          padding: "1px"
        }}
        onClick={() => {
          setSelected(null);
          zoomInto(null);
          setInstrument(null);
          setInstrumentGroup(null);
        }}
      >
        Reset
      </div>
      <svg
        width={scaledWidth}
        height={scaledHeight}
        style={{
          border: "1px solid gray"
        }}
      >
        <g
          ref={ref}
          transform={`${scaleString ? scaleString : `scale(${scale})`}`}
        >
          {Object.keys(instrumentGroupData).map((group) => {
            const i = groupToPosition[group];

            const asArray = Object.entries(instrumentData);

            const filtered = asArray.filter(([key, value]) =>
              instrumentGroupData[group].includes(key)
            );

            const species = Object.fromEntries(filtered);

            return (
              <OrchestraGroup
                key={`OrchestraGroup${i}`}
                groupName={group}
                id={i}
                position={{
                  x: 510 / 2,
                  y: 255
                }}
                setSelected={setSelected}
                selected={selected}
                setZoom={zoomInto}
                instruments={instrumentGroupData[group]}
                species={species}
                getThreatLevel={getThreatLevel}
                threatType={threatType}
                colorBlind={colorBlind}
                setInstrument={setInstrument}
                setInstrumentGroup={setInstrumentGroup}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/* return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "lime",
        display: "flex",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <OrchestraGroup
        posX={width / 2 - height / 2}
        posY={height / 2}
        parentWidth={parentWidth}
      ></OrchestraGroup>
      <OrchestraGroup
        posX={width / 2 - height / 2}
        posY={height / 2}
        parentWidth={parentWidth}
        rotation={40}
      ></OrchestraGroup>
      <OrchestraGroup
        posX={width / 2 - height / 2}
        posY={height / 2}
        parentWidth={parentWidth}
        rotation={-40}
      ></OrchestraGroup>
      <OrchestraGroup
        posX={width / 2 - height / 2}
        posY={height / 2}
        parentWidth={parentWidth}
        rotation={80}
      ></OrchestraGroup>
      <OrchestraGroup
        posX={width / 2 - height / 2}
        posY={height / 2}
        parentWidth={parentWidth}
        rotation={-80}
      ></OrchestraGroup>
      <OrchestraGroup
        middle={true}
        posX={width / 2 - height / 2}
        posY={height / 2}
        parentWidth={parentWidth}
        rotation={0}
      ></OrchestraGroup>
    </div>
  ); */
