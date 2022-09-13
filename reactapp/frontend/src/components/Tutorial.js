import { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { XMarkIcon } from "@heroicons/react/24/solid";

const tutorialTexts = {
  orchestraVisWrapper: (
    <>
      <h3>The Orchestra</h3>
      <h4>Orchestra Overview</h4>
      <>
        For the orchestra we also have four Zoom levels: Orchestra overview:
        Shows in every musical instrument group a pie chart showing the number
        of materials (species) that may be used for the construction of this
        instrument and the species threats or CITES trade regulations are
        displayed, whether there the species threats displayed, or the species
        trade regulations depend on the selection in the legend (trade or
        threat).
      </>
      <h4>Musical instrument group</h4>
      <>
        Selecting a musical instrument group zooms into the orchestra and shows
        which instruments form part of the musical instrument group already
        indicating for each musical instrument the number of species that can be
        used and the threat or trade regulation division for the species.
      </>
      <h4>Musical instrument</h4>
      <>
        Selecting the musical instrument (here: Grand piano, piano) shows only
        the species used for the selected instrument and renews for all other
        instruments to only display the species that are used for pianos and the
        displayed other instruments.
      </>
      <h4>Selection of Musical instrument parts – Main parts</h4>
      <>
        When the selection for a musical instrument is loaded it appears the box
        for the selection of the main part of that musical instrument that can
        be chosen from a trop down list.
      </>
      <h4>Musical instrument part</h4>
      <>
        After selecting the main part from the drop down list you are interested
        in it is marked with a purple frame and as always all other screens get
        updated only with the species piano keys can be made of.
      </>
    </>
  ),
  centerPanel: (
    <>
      <h2>Central Panel</h2>
    </>
  ),
  treeMapVisWrapper: (
    <>
      <h2>Material Map</h2>
    </>
  ),
  mapVisWrapper: (
    <>
      <h2>Destribution Map</h2>
    </>
  ),
  timelineVisWrapper: (
    <>
      <h2>Timeline</h2>
      <p>
        The timeline always adapts to the selected criteria within the orchestra
        (Instrument group, Instrument, Instrument Main part) and/or the selected
        zoom within the TreeMap (Kingdom, Family, Genus, Species) and/or the map
        (country, ecoregion) and/or the selected species or country in the
        search boxes. There are several ways of exploration for further
        information by hovering within the timeline over the species name, the
        assessments within the timeline and the population trends (the small
        arrows at the end of each line).
      </p>
      <p>
        Hovering over the image and species name gives an explanation how the
        tree/paw icon can be understood, as it is composed of the listings in
        CITES (trade-related threat) and of the listings in the IUCN Red List
        and the BGCI ThreatSearch (IUCN is always prioritized).
        <div className="tutorialImageWrapper">
          <img src="./tutorial/tooltip.png" />
        </div>
      </p>
      <p>
        Hovering on along the timeline gives further information on the IUCN red
        listings, CITES listings and or the BGCI ThreatSearch listings (see here
        the example for Dalbergia retusa):
        <div className="tutorialImageWrapper">
          <img src="./tutorial/hover.png" />
        </div>
      </p>
      <p>
        In case of availability from the IUCN red list the timeline also
        indicates at the end of the IUCN line the population trend of the
        species:
        <div className="tutorialImageWrapper">
          <img src="./tutorial/populationTrend.png" />
        </div>
      </p>
    </>
  )
};

export default function Tutorial(props) {
  const { tutorial, setTutorial, tour = 0, next, previous } = props;

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [up, setUp] = useState(true);

  const ref = useRef(null);

  useEffect(() => {
    const allWithClass = Array.from(
      document.getElementsByClassName("elevated")
    );

    if (allWithClass[0] !== undefined) {
      let boundingRext = allWithClass[0].getBoundingClientRect();
      if (ref) {
        if (ref.current) {
          const refRect = ref.current.getBoundingClientRect();
          if (
            boundingRext.y + boundingRext.height + refRect.height >
            window.innerHeight
          ) {
            setUp(false);
          }
          setX(boundingRext.x + boundingRext.width / 2 - 6);
          setY(
            up ? boundingRext.y + boundingRext.height + 6 : boundingRext.y - 6
          );
        }
      }
    }
  }, [tutorial, up]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "rgba(30, 30, 30, 0.75)",
        zIndex: 9000
      }}
      onClick={() => {
        if (setTutorial) {
          setTutorial(null);
        }
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative"
        }}
      >
        <div
          key={`${up}Tutorial`}
          style={{
            position: "absolute",
            left: `${x}px`,
            top: `${y}px`,
            zIndex: "9003",
            maxHeight: "40%",
            width: "50%",
            transform: up ? "translate(-50%)" : "translate(-50%, -100%)",
            transitionProperty: "top left",
            transitionDuration: "0.3s",
            display: "grid",
            gridTemplateRows: "min-content 1fr min-content",
            gridTemplateColumns: "auto",
            margin: "0px 10px"
          }}
          ref={ref}
        >
          <div
            ref={ref}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {up && (
              <div
                className="arrow-up"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottomColor: "white"
                }}
              />
            )}
          </div>
          <div
            style={{
              /* ,
              display: "grid",
              gridTemplateRows: "1fr min-content" */
              display: "block",
              overflow: "hidden",
              borderRadius: "5px",
              backgroundColor: "white",
              height: "100%"
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateRows: "1fr min-content",
                height: "100%"
              }}
            >
              <div
                style={{
                  overflowY: "scroll",
                  padding: "10px",
                  boxSizing: "border-box"
                }}
              >
                {tutorialTexts[tutorial]}
              </div>

              <div
                style={{
                  display: "grid",
                  justifyContent: "center",
                  alignContent: "center",
                  backgroundColor: "white",
                  gap: "10px",
                  gridTemplateColumns: "auto auto",
                  padding: "8px"
                }}
              >
                {tour > 1 && (
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      if (previous) {
                        previous();
                        e.stopPropagation();
                      }
                    }}
                  >
                    Previous
                  </Button>
                )}
                {tour > 0 && (
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      if (next) {
                        next();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {tour < 5 ? "Next" : "End"}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div
            ref={ref}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {up === false && (
              <div
                className="arrow-down"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderTopColor: "white"
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
