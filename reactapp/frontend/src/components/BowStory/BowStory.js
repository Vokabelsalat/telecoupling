import ContentPanel from "./ContentPanel";
import ContentWrapper from "./ContentWrapper";
import Content from "./Content";
import ResizeComponent from "../ResizeComponent";
import StoryMap from "../StoryMap";
import contents from "./StoryContents";

import { useEffect, useRef, useState, useMemo } from "react";

import { useIntersection } from "./useIntersection";
import { active } from "d3";
import { padding } from "@mui/system";

export default function BowStory(props) {
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
        /*   if (typeof window.history.pushState == "function") {
          window.history.pushState(null, `bowstory#${idx}`, `bowstory#${idx}`);
        } else {
          window.location.hash = idx;
        } */
        setActiveFigure(idx);
      }

      /*       tmpTest[idx] = entry.intersectionRatio;
      setActiveFigure(tmpTest); */
    },
    //{ threshold: 1, rootMargin: "32px 0px -65% 0px" }
    {
      // threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      threshold: 0,
      rootMargin: "-49% 0px -49% 0px"
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

    if (activeFigure != null && contents[activeFigure].effect != null) {
      console.log("EFFECT", contents[activeFigure].effect);
      applyContentEffect(contents[activeFigure].effect);
    } else {
      setEffect("");
      setMapMode("light");
    }

    console.log("CHANGED!", activeFigure, contents, contents[activeFigure]);
    if (activeFigure != null && contents[activeFigure].flyTo != null) {
      console.log("FLY TO!", contents[activeFigure].flyTo);
      flyToMapPosition(contents[activeFigure].flyTo);
    }
  }, [activeFigure]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "grid",
        gridTemplateRows: "100vh",
        gridTemplateColumns: "50% 50%"
      }}
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
              padding: "15px"
            }}
          >
            <div>Welcome to the story!</div>
            <div>For the full immersive experience please enable</div>
            <label class="checkMarkContainer">
              Automatic Replay of Audios & Videos
              <input
                type="checkbox"
                checked={enableAutoPlay ? "checked" : ""}
                onChange={(event) => {
                  setEnableAutoPlay(event.target.checked);
                }}
              />
              <span class="checkmark"></span>
            </label>
            <div>Use you mouse or trackpad to experience the story.</div>
          </div>
        </div>
      </div>
      <ContentPanel className={`contentPanel ${effect}`} ref={ref}>
        {contents.map((content, index) => {
          return (
            <ContentWrapper
              id={index}
              key={`content${index}`}
              parentRef={ref}
              style={{
                opacity: activeFigure === index ? 1.0 : 0.3
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
              />
            </ContentWrapper>
          );
        })}
        <ContentWrapper>
          <Content type={"restart"} height={"25vh"} alignment={alignment} />
        </ContentWrapper>
      </ContentPanel>
    </div>
  );
}
