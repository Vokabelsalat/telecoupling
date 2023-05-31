import { useMemo } from "react";

export default function DiversityScale(props) {
  const { scales = {}, className } = props;
  /*   const stringedScales = JSON.stringify(scales);

  const scale = useMemo(() => {
    const parsed = JSON.parse(stringedScales);
    if (parsed.hasOwnProperty(mapMode)) {
      return JSON.parse(stringedScales)[mapMode];
    } else {
      return [];
    }
  }, [stringedScales, mapMode]);

  console.log(scales, mapMode, scale); */

  const scale = scales.scale ?? [];
  const mapMode = scales.type ?? "countries";

  const { scaleElements, typeText, typeTextSecond, col } = useMemo(() => {
    let scaleElements = [];

    let typeText = "";
    let typeTextSecond = "";

    switch (mapMode) {
      case "countries":
        typeText = "Species";
        typeTextSecond = "Country";
        break;
      case "hexagons":
        typeText = "Species";
        typeTextSecond = "Hexagon";
        break;
      case "ecoregions":
        typeText = "Species";
        typeTextSecond = "Ecoregion";
        break;
      case "rescure":
        typeText = "Protection";
        typeTextSecond = "Potential";
        break;
      case "orchestras":
        typeText = "Orchestras";
        typeTextSecond = "Country";
        break;
      default:
        break;
    }

    //let width =
    let col = 1;

    for (let scaleValue of scale) {
      scaleElements.push(
        <div
          key={"scaleElement" + scaleValue.scaleValue}
          className="scaleElement"
          style={{
            gridColumnStart: col,
            gridColumnEnd: col,
            gridRowStart: 1,
            gridRowEnd: 1,
            height: "20px"
          }}
        >
          <div
            className="innerScaleElement color"
            style={{
              backgroundColor: "white",
              border: "solid 1px #f4f4f4",
              height: "10px"
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: scaleValue.scaleColor
              }}
            ></div>
          </div>
          <div
            className="innerScaleElement text"
            style={{
              height: "10px",
              paddingRight: "2px",
              textAlign: "end",
              fontSize: "smaller"
            }}
          >
            {scaleValue.scaleLabel
              ? scaleValue.scaleLabel
              : scaleValue.scaleValue}
          </div>
        </div>
      );
      col = col + 1;
    }

    return { scaleElements, typeText, typeTextSecond, col };
  }, [scale, mapMode]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "auto",
        display: "grid",
        gridTemplateColumns: Array.from(Array(col).keys())
          .map((e) => "auto")
          .join(" "),
        gridTemplateRows: "30px",
        paddingTop: "6px"
      }}
    >
      {scaleElements}
      <div
        style={{
          /* whiteSpace: "break-spaces", */
          textAlign: "center",
          height: "100%",
          alignSelf: "center",
          width: "min-content",
          display: "grid",
          gridTemplateColumns: "auto",
          gridTemplateRows: "auto auto",
          fontSize: "smaller",
          marginTop: "-9px",
          marginLeft: "5px"
        }}
      >
        <div>{typeText}</div>
        <div
          style={{ borderTop: mapMode === "rescure" ? "" : "1px solid black" }}
        >
          {typeTextSecond}
        </div>
      </div>
    </div>
  );

  //return <div style={{  }}></div>;
}
