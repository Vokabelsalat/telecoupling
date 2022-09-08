import Orchestra from "./Orchestra";
import OrchestraGroup from "./OrchestraGroup";
import { useState, useRef, useEffect, useCallback } from "react";

export default function OrchestraNew(props) {
  const { data, width, height } = props;

  const ref = useRef(null);
  const scale = useRef(null);

  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [scaleString, setScaleString] = useState(null);

  let scaledWidth = useRef(null);
  let scaledHeight = useRef(null);

  useEffect(() => {
    if (ref) {
      if (ref.current) {
        let actWidth = ref.current.getBBox().width;
        let actHeight = ref.current.getBBox().height;

        if (width < height) scale.current = width / actWidth;
        if (height < width) scale.current = height / actHeight;

        scaledWidth.current = actWidth * scale.current;
        scaledHeight.current = actHeight * scale.current;
      }
    }
  }, [width, height]);

  const zoomInto = useCallback((i_zoom) => {
    let scaleStringTmp;
    if (i_zoom) {
      let x0 = i_zoom.x;
      let x1 = i_zoom.x + i_zoom.width;
      let y0 = i_zoom.y;
      let y1 = i_zoom.y + i_zoom.height;

      scaleStringTmp = `translate(${scaledWidth.current / 2}, ${
        scaledHeight.current / 2
      }) scale(${Math.min(
        8,
        0.9 /
          Math.max(
            (x1 - x0) / scaledWidth.current,
            (y1 - y0) / scaledHeight.current
          )
      )}) translate(${-(x0 + x1) / 2}, ${-(y0 + y1) / 2})`;
      setScaleString(scaleStringTmp);
    } else {
      scaleStringTmp = `scale(${scale.current})`;
      setScaleString(scaleStringTmp);
    }
  }, []);

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
          zoomInto(null);
          setSelected(null);
        }}
      >
        Reset
      </div>
      <svg
        width={scaledWidth.current}
        height={scaledHeight.current}
        style={{
          border: "1px solid gray"
        }}
      >
        <g
          ref={ref}
          transform={`${scaleString ? scaleString : `scale(${scale.current})`}`}
        >
          <OrchestraGroup
            position={0}
            setSelected={setSelected}
            selected={selected}
            setZoom={zoomInto}
          />
          <OrchestraGroup
            position={1}
            setSelected={setSelected}
            selected={selected}
            setZoom={zoomInto}
          />
          <OrchestraGroup
            position={2}
            setSelected={setSelected}
            selected={selected}
            setZoom={zoomInto}
          />
          <OrchestraGroup
            position={3}
            setSelected={setSelected}
            selected={selected}
            setZoom={zoomInto}
          />
          <OrchestraGroup
            position={4}
            setSelected={setSelected}
            selected={selected}
            setZoom={zoomInto}
          />
          <OrchestraGroup
            position={5}
            setSelected={setSelected}
            selected={selected}
            setZoom={zoomInto}
          />
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
