import { useContext, useMemo } from "react";
import { TooltipContext } from "./TooltipProvider";

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const langUnicode = {
  de: "DE",
  en: "GB",
  es: "ES",
  fr: "FR"
};

export default function Tooltip(props) {
  const { speciesLabels } = props;

  const { tooltipText, tooltipMode, tooltipPosition } =
    useContext(TooltipContext);

  const tooltipContent = useMemo(() => {
    if (tooltipMode === "text") {
      return tooltipText;
    } else if (tooltipMode === "species") {
      let species = tooltipText;
      let labels = speciesLabels[species];

      return (
        <div>
          {<b>{species}</b>}
          {Object.keys(labels).map((language) => {
            if (labels[language] == null) {
              return <></>;
            } else {
              return (
                <div>
                  {getFlagEmoji(langUnicode[language])} : {labels[language]}
                </div>
              );
            }
          })}
        </div>
      );
    } else {
      return "";
    }
  }, [tooltipText, tooltipMode]);

  if (tooltipText === "" || tooltipText == null) {
    return <></>;
  } else {
    return (
      <div
        style={{
          position: "absolute",
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          border: "1px solid gray",
          padding: "3px",
          borderRadius: "5px",
          backgroundColor: "white",
          zIndex: 99999
        }}
      >
        {tooltipContent}
      </div>
    );
  }
}
