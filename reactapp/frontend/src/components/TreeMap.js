import React, { Component } from "react";
import "../utils/utils";
import TreeMapHelper from "./TreeMapHelper";

class TreeMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      data: this.props.data,
      selected: null,
      filter: this.props.filter
    };
  }

  componentDidMount() {
    TreeMapHelper.draw({
      id: this.state.id,
      data: this.state.data,
      setSelected: this.setSelected.bind(this),
      selected: this.state.selected,
      filter: this.state.filter,
      setFilter: this.props.setFilter
    });
  }

  setSelected(sel) {
    this.setState({ selected: sel });
  }

  componentDidUpdate(newProps) {
    if (JSON.stringify(this.props.data) !== JSON.stringify(newProps.data)) {
      TreeMapHelper.draw({
        id: this.state.id,
        data: this.props.data,
        setSelected: this.setSelected.bind(this),
        selected: this.state.selected,
        filter: newProps.filter,
        setFilter: this.props.setFilter
      });
    }
  }

  render() {
    return <div id={this.state.id} style={{ display: "inline-block" }}></div>;
  }
}

export default TreeMap;
