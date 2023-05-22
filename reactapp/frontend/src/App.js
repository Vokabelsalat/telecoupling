import "mapbox-gl/dist/mapbox-gl.css";
import React, { Component } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Story from "./components/Story/Story";
import ResizeComponent from "./components/ResizeComponent";
import HomeNew from "./components/HomeNew";
import StoryEditor from "./components/StoryEditor";

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
};
window.addEventListener("resize", appHeight);

/* function HomeWithParams({ match }) {
  let { instrumentGroup } = match.params;
  let { instrument } = match.params;
  let { mainPart } = match.params;

  console.log("Group", instrumentGroup);
  console.log("Instrument", instrument);
  console.log("Main Part", mainPart);

  return (
    <Home
      instrumentGroup={instrumentGroup}
      instrument={instrument}
      mainPart={mainPart}
    />
  );
} */

class App extends Component {
  /* constructor(props) {
    super(props);
  } */

  componentDidMount() {
    appHeight();
  }

  render() {
    return (
      <div className="App">
        <Router>
          <Routes>
            {/*  <Route exact path="/statistics">
              <Statistics />
            </Route> */}
            {/*  <Route
              path="/:instrumentGroup/:instrument/:mainPart"
              component={HomeWithParams}
            />
            <Route
              path="/:instrumentGroup/:instrument"
              component={HomeWithParams}
            />
            <Route path="/:instrumentGroup" component={HomeWithParams} /> */}
            {/* <Route exact path="/" element={<Home />} /> */}
            <Route exact path="/" element={<HomeNew />} />
            <Route
              exact
              path="/bowstory"
              element={
                <div
                  style={{
                    width: "100%",
                    height: "100%"
                  }}
                >
                  <ResizeComponent>
                    <Story storyName="bowstory" />
                  </ResizeComponent>
                </div>
              }
            />
            <Route
              exact
              path="/concertstory"
              element={
                <div
                  style={{
                    width: "100%",
                    height: "100%"
                  }}
                >
                  <ResizeComponent>
                    <Story storyName="concertstory" />
                  </ResizeComponent>
                </div>
              }
            />
            <Route
              exact
              path="/storyeditor"
              element={
                <div
                  style={{
                    width: "100%",
                    height: "100%"
                  }}
                >
                  <ResizeComponent>
                    <StoryEditor />
                  </ResizeComponent>
                </div>
              }
            />
          </Routes>
          {/* <Route exact path="/timeline">
            <TimelineView />
            <div key="tooltip" id="tooltip" className="tooltip"></div>
          </Route> */}
        </Router>
      </div>
    );
  }
}

export default App;
