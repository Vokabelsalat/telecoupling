import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
import TimelineView from "./components/TimelineView";
import Statistics from './components/Statistics';
import Home from './components/Home';

function HomeWithParams({ match }) {
  let { instrumentGroup } = match.params
  let { instrument } = match.params
  let { mainPart } = match.params

  console.log("Group", instrumentGroup);
  console.log("Instrument", instrument);
  console.log("Main Part", mainPart);

  return <Home instrumentGroup={instrumentGroup} instrument={instrument} mainPart={mainPart} />

}

class App extends Component {
  /* constructor(props) {
    super(props);
  } */

  componentDidMount() {

  }

  render() {
    return (
      <div className="App" >
        <Router>
          <Switch>
            <Route exact path="/statistics">
              <Statistics />
            </Route>
            <Route path="/:instrumentGroup/:instrument/:mainPart" component={HomeWithParams} />
            <Route path="/:instrumentGroup/:instrument" component={HomeWithParams} />
            <Route path="/:instrumentGroup" component={HomeWithParams} />
            <Route path="/" children={<Home />} />
          </Switch>
          <Route exact path="/timeline">
            <TimelineView />
            <div
              key="tooltip"
              id="tooltip"
              className="tooltip">
            </div>
          </Route>
        </Router>
      </div>
    );
  }
}

export default App;
