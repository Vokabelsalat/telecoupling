import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import TimelineView from "./components/TimelineView";
import Statistics from './components/Statistics';

class App extends Component {
  /*   constructor(props) {
      super(props);
    }
   */
  componentDidMount() {
  }

  render() {
    return (
      <div className="App" >
        <Router>
          <Route exact path="/">
            <TimelineView />
            <div
              key="tooltip"
              id="tooltip"
              className="tooltip">
            </div>
          </Route>
          <Route exact path="/statistics">
            <Statistics />
          </Route>
        </Router>
      </div>
    );
  }
}

export default App;
