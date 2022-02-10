import React, { Component } from "react";
import "../utils/utils";
import TreeMapHelper from "./TreeMapHelper";
import NewTreeMapHelper from "./NewTreeMapHelper";

class TreeMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      data: this.props.data,
      selected: null
    };
  }

  componentDidMount() {
    /* TreeMapHelper.draw({
            id: this.state.id,
            data: this.state.data
        }); */

    NewTreeMapHelper.draw({
      id: this.state.id,
      data: this.state.data,
      setSelected: this.setSelected.bind(this),
      selected: this.state.selected
    });
  }

  setSelected(sel) {
    this.setState({ selected: sel });
  }

  componentDidUpdate(newProps) {
    /* TreeMapHelper.draw({
            id: this.state.id,
            data: this.props.data
        }); */
    if (JSON.stringify(this.props) !== JSON.stringify(newProps)) {
      NewTreeMapHelper.draw({
        id: this.state.id,
        data: this.props.data,
        setSelected: this.setSelected.bind(this),
        selected: this.state.selected
      });
    }
  }

  render() {
    return <div id={this.state.id} style={{ display: "inline-block" }}></div>;
  }
}

export default TreeMap;
