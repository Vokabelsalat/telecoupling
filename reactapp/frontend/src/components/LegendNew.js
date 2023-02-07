import {
  citesAssessment,
  iucnAssessment,
  bgciAssessment
} from "../utils/timelineUtils";

export default function Legend(props) {
  const { threatType, type, colorBlind, setThreatType, setCategoryFilter } =
    props;

  if (type === "economically") {
    return (
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          gridTemplateRows: "auto auto",
          gridTemplateColumns: "auto auto",
          gap: "2px"
        }}
      >
        <div
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 1,
            gridRowStart: 1,
            gridRowEnd: "span 2",
            alignSelf: "center",
            justifySelf: "center",
            opacity: threatType === type ? 1.0 : 0.5
          }}
        >
          <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
            CITES
            <a
              href="https://cites.org/eng/app/index.php"
              target="_blank"
              style={{ textDecoration: "none" }}
              rel="noreferrer"
            >
              <div className="infoI">i</div>
            </a>
          </div>
          {citesAssessment.getSortedLevels().map((e) => {
            let style = {
              display: "inline-block",
              minWidth: "40px",
              /*  border:
                categoryFilter &&
                categoryFilter.type === "cites" &&
                categoryFilter.cat === e
                  ? "2px solid var(--highlightpurple)"
                  : "none",*/
              backgroundColor: citesAssessment.get(e).getColor(colorBlind),
              color: citesAssessment.get(e).getForegroundColor(colorBlind)
            };
            return (
              <div
                key={e}
                style={style}
                data-info="CITES"
                data-key={e}
                className={`legendEntry ${
                  threatType === type ? "clickable" : ""
                }`}
                onClick={(event) => {
                  if (threatType === type) {
                    setCategoryFilter({ type: "cites", value: e });
                  }
                }}
                /*  onMouseEnter={(e) => this.tooltip(e, true)}
                onMouseLeave={(e) => this.tooltip(e, false)}
                onMouseMove={(e) => this.tooltipMove(e)} */
              >
                {e}
              </div>
            );
          })}
        </div>
        <div
          style={{
            gridColumnStart: 2,
            gridColumnEnd: 2,
            gridRowStart: 1,
            gridRowEnd: "span 2",
            alignSelf: "center",
            justifySelf: "center"
          }}
        >
          <button
            onClick={() => {
              setThreatType(type);
            }}
            className={`threatTypeButton ${
              threatType === type ? "active" : ""
            }`}
          >
            Trade-related
            <br />
            Threat
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          gridTemplateRows: "auto auto",
          gridTemplateColumns: "auto auto",
          gap: "2px"
        }}
      >
        <div
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 1,
            gridRowStart: 1,
            gridRowEnd: "span 2",
            alignSelf: "center",
            justifySelf: "center"
          }}
        >
          <button
            onClick={() => {
              setThreatType(type);
            }}
            className={`threatTypeButton ${
              threatType === type ? "active" : ""
            }`}
          >
            Ecological
            <br />
            Threat
          </button>
        </div>
        <div
          style={{
            gridColumnStart: 2,
            gridColumnEnd: 2,
            gridRowStart: 1,
            gridRowEnd: 1,
            opacity: threatType === type ? 1.0 : 0.5
          }}
        >
          <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
            IUCN Red List
            <a
              href="https://www.iucnredlist.org/about/regional"
              target="_blank"
              style={{ textDecoration: "none" }}
              rel="noreferrer"
            >
              <div className="infoI">i</div>
            </a>
          </div>
          <div>
            {iucnAssessment.getSortedLevels().map((e, i) => {
              let width;
              if (["LR/cd"].includes(e)) {
                width = "50px";
              } else {
                width = "35px";
              }

              let style = {
                minWidth: width,
                cursor: threatType === type ? "pointer" : "default",
                /*border:
                categoryFilter &&
                categoryFilter.type === "iucn" &&
                categoryFilter.cat === e
                  ? "2px solid var(--highlightpurple)"
                  : "none", */
                backgroundColor: iucnAssessment.get(e).getColor(colorBlind),
                color: iucnAssessment.get(e).getForegroundColor(colorBlind)
              };
              return (
                <div
                  key={e}
                  style={style}
                  data-info="IUCN"
                  className={`legendEntry ${
                    threatType === type ? "clickable" : ""
                  }`}
                  data-key={e}
                  onClick={(event) => {
                    if (threatType === type) {
                      setCategoryFilter({ type: "iucn", value: e });
                    }
                  }}
                  /* onMouseEnter={(e) => this.tooltip(e, true)}
                  onMouseLeave={(e) => this.tooltip(e, false)}
                  onMouseMove={(e) => this.tooltipMove(e)} */
                >
                  {e}
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            gridColumnStart: 2,
            gridColumnEnd: 2,
            gridRowStart: 2,
            gridRowEnd: 2,
            opacity: threatType === type ? 1.0 : 0.5
          }}
        >
          {bgciAssessment.getSortedLevels().map((e) => {
            let width;
            if (["EX"].includes(e)) {
              width = "105px";
            } else if (["TH"].includes(e)) {
              width = "175px";
            } else if (["PT"].includes(e)) {
              width = "85px";
            } else {
              width = "35px";
            }

            let style = {
              minWidth: width,
              cursor: threatType === type ? "pointer" : "default",
              /* border:
                categoryFilter &&
                categoryFilter.type === "bgci" &&
                categoryFilter.cat === e
                  ? "2px solid var(--highlightpurple)"
                  : "none", */
              backgroundColor: bgciAssessment.get(e).getColor(colorBlind),
              color: bgciAssessment.get(e).getForegroundColor(colorBlind)
            };
            return (
              <div
                key={e}
                style={style}
                data-info="BGCI"
                data-key={e}
                className={`legendEntry ${
                  threatType === type ? "clickable" : ""
                }`}
                onClick={(event) => {
                  if (threatType === type) {
                    setCategoryFilter({ type: "bgci", value: e });
                  }
                }}
                /* onMouseEnter={(e) => this.tooltip(e, true)}
                onMouseLeave={(e) => this.tooltip(e, false)}
                onMouseMove={(e) => this.tooltipMove(e)} */
              >
                {e}
              </div>
            );
          })}
          <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
            BGCI ThreatSearch
            <a
              href="https://www.bgci.org/resources/bgci-databases/threatsearch/"
              target="_blank"
              style={{ textDecoration: "none" }}
              rel="noreferrer"
            >
              <div className="infoI">i</div>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
