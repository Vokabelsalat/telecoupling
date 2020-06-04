import React, { Component } from 'react';
import './App.css';
import TimelineView from "./components/TimelineView";

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
        <TimelineView />
        <div
          key="tooltip"
          id="tooltip"
          className="tooltip">
        </div>
      </div>
    );
  }
}

export default App;
