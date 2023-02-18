import ContentPanel from "./ContentPanel";
import ContentWrapper from "./ContentWrapper";
import Content from "./Content";

import { useEffect, useRef, useState, useMemo } from "react";

import { useIntersection } from "./useIntersection";
import { active } from "d3";
import { padding } from "@mui/system";

export default function BowStory(props) {
  const ref = useRef(null);

  const [activeFigure, setActiveFigure] = useState();

  const [trigger, setTrigger] = useState(true);
  const offset = 0;

  const fontStyle = "classic"; // "modern" | "classic"
  const alignment = "centerBlockText"; // "center" | "left" | "right" | "centerBlockText"

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
          window.history.pushState(null, `bowstory#${idx}`, `bowstory#${idx}`);
        } else {
          window.location.hash = idx;
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
      rootMargin: "-49% 0px -49% 0px"
    }
  );

  const contents = [
    {
      type: "storyTitle",
      title: (
        <div>
          The Story of
          <br />
          Stringed Instrument Bows
        </div>
      )
    },
    {
      type: "fullSizeQuote",
      quote: {
        text: (
          <div>
            <div
              style={{
                marginLeft: "-100%",
                whiteSpace: "nowrap"
              }}
            >
              "Le violon
            </div>
            <div
              style={{
                marginRight: "-100%",
                whiteSpace: "nowrap"
              }}
            >
              c'est l'archet"
            </div>
          </div>
        ),
        author: "Giovanni Battista Viotti (violanist)",
        translation: "The violin, that is the bow."
      }
    },
    {
      type: "text",
      title: "Mata Atlântica",
      text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots."
    },
    {
      type: "text",
      title: "Mata Atlântica",
      text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots.",
      image: {
        url: "https://upload.wikimedia.org/wikipedia/commons/8/85/Ba%C3%ADa_de_Antonina_vista_da_Serra_do_Mar2.JPG",
        caption: "Antonina Bay as viewed from the Serra do Mar Paranaense.",
        width: "60%",
        copyright: (
          <>
            <a href="https://commons.wikimedia.org/wiki/File:Ba%C3%ADa_de_Antonina_vista_da_Serra_do_Mar2.JPG">
              Deyvid Setti e Eloy Olindo Setti
            </a>
            ,{" "}
            <a href="https://creativecommons.org/licenses/by-sa/3.0">
              CC BY-SA 3.0
            </a>
            , via Wikimedia Commons
          </>
        )
      }
    },
    {
      type: "text",
      title: "Mata Atlântica",
      text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots."
    },
    {
      type: "text",
      title: "Mata Atlântica",
      text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots.",
      width: "50%"
    },
    {
      type: "text",
      title: "Mata Atlântica",
      text: "The emblematic and culturally important brazilwood tree tells a bundle of stories - on one hand a story of social and cultural exploitation and on the other of music and culture. The beauty of its flowers with their sweet smell attracts bees and fascinates people. Brazilwood is an endemic species only found in the Mata Atlântica biome located along the east coast of Brazil. This coastal rainforest counts with an extraordinary species richness, many of these species being endemic while at the same time ⅔ of Brazilians population is living in that same region. As a result of deforestation, land use change and urbanization the Mata Atlântica is decimated to only 7% of its original extent, a highly threatened ecoregion and one of the 36 global biodiversity hotspots."
    },
    { type: "end", title: "Le Fin" },
    {
      type: "text",
      title: "Authors",
      height: "25vh",
      text: (
        <>
          Silke Lichtenberg
          <br />
          Jakob Kusnick
        </>
      )
    },
    {
      type: "text",
      title: "Images",
      height: "25vh",
      text: (
        <>
          Silke Lichtenberg
          <br />
          Jakob Kusnick
        </>
      )
    },
    {
      type: "text",
      title: "Music",
      height: "25vh",
      text: (
        <>
          Silke Lichtenberg
          <br />
          Jakob Kusnick
        </>
      )
    },
    {
      type: "text",
      title: "Thanks",
      height: "25vh",
      text: (
        <>
          Silke Lichtenberg
          <br />
          Jakob Kusnick
        </>
      )
    }
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "grid",
        gridTemplateRows: "100vh",
        gridTemplateColumns: "50% 50%",
        color: "#1C0F13"
      }}
    >
      <div style={{ width: "100%", height: "100%" }}>{activeFigure}</div>
      <ContentPanel ref={ref}>
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
              <Content {...content} alignment={alignment} />
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
