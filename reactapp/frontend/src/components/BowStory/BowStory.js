import ContentPanel from "./ContentPanel";
import ContentWrapper from "./ContentWrapper";
import { Content } from "./Content";
import ResizeComponent from "../ResizeComponent";
import StoryMap from "../StoryMap";
import contents from "./StoryContents";
import { useRefDimensions } from "./useRefDimensions";

import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";

import { useIntersection } from "./useIntersection";
import { active } from "d3";
import { padding } from "@mui/system";

export default function BowStory(props) {
  const { width, height } = props;

  const ref = useRef(null);

  const [activeFigure, setActiveFigure] = useState();

  const [trigger, setTrigger] = useState(true);
  const [isIntro, setIsIntro] = useState(true);
  const [enableAutoPlay, setEnableAutoPlay] = useState(false);
  const offset = 0;

  const fontStyle = "classic"; // "modern" | "classic"
  const alignment = "centerBlockText"; // "center" | "left" | "right" | "centerBlockText"
  const [effect, setEffect] = useState("");
  const [mapMode, setMapMode] = useState("light");

  const mapRef = useRef(null);
  const wrapperRef = useRef(null);

  function flyToMapPosition(flyTo) {
    if (mapRef.current) {
      mapRef.current.flyTo({
        /* center: [(Math.random() - 0.5) * 360, (Math.random() - 0.5) * 100],
        essential: true // this animation is considered essential with respect to prefers-reduced-motion */
        ...flyTo,
        essential: true
      });
    }
  }

  const mobile = useMemo(() => {
    if (width < 600) {
      return true;
    } else {
      return false;
    }
  }, [width]);

  useEffect(() => {
    const scrollToHashElement = () => {
      const { hash } = window.location;
      const elementToScroll = document.getElementById(hash?.replace("#", ""));

      if (!elementToScroll) return;

      ref.current.scrollTo({
        top: elementToScroll.offsetTop - offset,
        behavior: "instant"
      });
    };

    if (!trigger) return;

    scrollToHashElement();

    window.addEventListener("hashchange", scrollToHashElement);
    return window.removeEventListener("hashchange", scrollToHashElement);
  }, [trigger]);

  useIntersection(
    ref,
    "div.contentWrapper",
    (entry, idx) => {
      /* if (entry.intersectionRatio > 0.1) {
        setActiveFigure(idx);
      } */
      if (entry.isIntersecting === true) {
        /* const tmpTest = [...activeFigure];
        tmpTest[idx] = entry.intersectionRatio; */
        if (typeof window.history.pushState == "function") {
          setTimeout(() => {
            window.history.pushState(
              null,
              `bowstory#${idx}`,
              `bowstory#${idx}`
            );
          }, 500);
        } else {
          setTimeout(() => {
            window.location.hash = idx;
          }, 500);
        }
        setActiveFigure(idx);
      }

      /*       tmpTest[idx] = entry.intersectionRatio;
      setActiveFigure(tmpTest); */
    },
    //{ threshold: 1, rootMargin: "32px 0px -65% 0px" }
    {
      // threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      threshold: 0,
      rootMargin: "-33% 0px -43% 0px"
      // rootMargin: "0px 0px 0px 0px"
    }
  );

  function applyContentEffect(effect) {
    switch (effect.type) {
      case "black":
        setMapMode("dark");
        setEffect(effect.type);
        break;
      default:
    }
  }

  useEffect(() => {
    if (activeFigure != null) {
      if (activeFigure > 0) {
        setIsIntro(false);
      } else {
        setIsIntro(true);
      }
    }

    if (
      activeFigure != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].effect != null
    ) {
      applyContentEffect(contents[activeFigure].effect);
    } else {
      setEffect("");
      setMapMode("light");
    }

    if (
      activeFigure != null &&
      contents[activeFigure] &&
      contents[activeFigure].flyTo != null
    ) {
      flyToMapPosition(contents[activeFigure].flyTo);
    }
  }, [activeFigure]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "repeat(auto-fit, minmax(100px, 1fr))",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
      }}
      ref={wrapperRef}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <ResizeComponent>
          <StoryMap
            /* speciesCountries={Object.fromEntries(
                  Object.entries(speciesCountries).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
            // speciesCountries={visibleSpeciesCountries}
            /* speciesEcos={Object.fromEntries(
                  Object.entries(speciesEcos).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
            // speciesEcos={speciesEcos}
            /* speciesHexas={Object.fromEntries(
                  Object.entries(speciesHexas).filter(
                    ([key]) => key === "Paubrasilia echinata"
                  )
                )} */
            // speciesHexas={speciesHexas}
            // colorBlind={colorBlind}
            // getSpeciesThreatLevel={getSpeciesSignThreat}
            // threatType={threatType}
            // setSelectedCountry={setSelectedCountry}
            ref={mapRef}
            mode={mapMode}
          />
        </ResizeComponent>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            display: isIntro ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              boxShadow: "5px 10px 8px #888888",
              padding: "15px",
              borderRadius: "5px"
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "5px",
                gridTemplateColumns: "auto auto"
              }}
            >
              <div
                style={{
                  gridColumn: "span 2"
                  /* fontSize: "x-large",
                  fontWeight: "bold",
                  marginBottom: "15px" */
                }}
              >
                <h3>Welcome to the Story of Stringed Instrument Bows!</h3>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                For the full immersive experience please enable:
              </div>
              <label
                style={{ gridColumn: "span 2" }}
                class="checkMarkContainer"
              >
                <div style={{ gridColumn: "1" }}>
                  &#x266A; Automatic Replay of Audios & Videos
                </div>
                <input
                  style={{ gridColumn: "2" }}
                  type="checkbox"
                  checked={enableAutoPlay ? "checked" : ""}
                  onChange={(event) => {
                    setEnableAutoPlay(event.target.checked);
                  }}
                />
                <span style={{ gridColumn: "2" }} class="checkmark"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <ContentPanel className={`contentPanel ${effect}`} ref={ref}>
          {contents.map((content, index) => {
            return (
              <ContentWrapper
                id={index}
                key={`content${index}`}
                style={{
                  opacity: activeFigure === index ? 1.0 : 0.3,
                  height: ["storyTitle", "fullSizeQuote", "end"].includes(
                    content.type
                  )
                    ? mobile
                      ? "45vh"
                      : "100vh"
                    : null
                }}
              >
                {/* <div
                style={{
                  height: "600px",
                  width: "100%",
                  border: "1px solid black",
                  marginBottom: "10px"
                }}
              >
                {index}
              </div> */}
                <Content
                  {...content}
                  alignment={alignment}
                  playAudio={enableAutoPlay && activeFigure === index}
                  mobile={mobile}
                />
              </ContentWrapper>
            );
          })}
          <ContentWrapper>
            <Content type={"restart"} height={"25vh"} alignment={alignment} />
          </ContentWrapper>
        </ContentPanel>
      </div>
    </div>
  );
}
