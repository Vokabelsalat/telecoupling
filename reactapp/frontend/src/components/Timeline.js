import React, { Component } from "react";
import TimelineHelper from "./TimelineHelper";
import TimelineElement from "./TimelineElement";
import "../utils/utils";

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      zoomLevel: this.props.zoomLevel
    };
  }

  setZoomLevel(setValue) {
    if (setValue > 0) {
      this.props.addUnmutedSpecies(this.props.speciesName);
      this.setState({ zoomLevel: setValue });
    } else {
      this.props.removeUnmutedSpecies(this.props.speciesName);
      this.setState({ zoomLevel: setValue, muted: true });
    }
  }

  componentDidMount() {
    /* TimelineHelper.draw({
      id: this.state.id,
      initWidth: this.props.initWidth,
      data: this.props.data,
      sourceColorMap: this.props.sourceColorMap,
      domainYears: this.props.domainYears,
      zoomLevel: this.state.zoomLevel,
      setZoomLevel: this.setZoomLevel.bind(this),
      speciesName: this.props.speciesName,
      maxPerYear: this.props.maxPerYear,
      pieStyle: this.props.pieStyle,
      groupSame: this.props.groupSame,
      sortGrouped: this.props.sortGrouped,
      heatStyle: this.props.heatStyle,
      justTrade: this.props.justTrade,
      justGenus: this.props.justGenus,
      setSpeciesSignThreats: this.props.setSpeciesSignThreats,
      getSpeciesSignThreats: this.props.getSpeciesSignThreats,
      getTreeThreatLevel: this.props.getTreeThreatLevel,
      addSpeciesToMap: this.props.addSpeciesToMap,
      removeSpeciesFromMap: this.props.removeSpeciesFromMap,
      muted: this.props.muted !== undefined ? this.props.muted : false,
      treeImageLinks: this.props.treeImageLinks,
      dummyImageLinks: this.props.dummyImageLinks,
      setHover: this.props.setHover,
      setTimeFrame: this.props.setTimeFrame,
      timeFrame: this.props.timeFrame,
      colorBlind: this.props.colorBlind,
      setFilter: this.props.setFilter,
      species: this.props.species,
      getPlantIcon: this.props.getPlantIcon,
      getAnimalIcon: this.props.getAnimalIcon,
      lastSpeciesSigns: this.props.lastSpeciesSigns,
      lastSpeciesThreats: this.props.lastSpeciesThreats
    }); */
  }

  componentDidUpdate(prevProps) {
    /* if (
      (JSON.stringify(prevProps.timeFrame) !==
        JSON.stringify(this.props.timeFrame) &&
        !this.state.id.includes("scale")) ||
      JSON.stringify(prevProps.colorBlind) !==
        JSON.stringify(this.props.colorBlind) ||
      JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data) ||
      JSON.stringify(prevProps.domainYears) !==
        JSON.stringify(this.props.domainYears) ||
      JSON.stringify(prevProps.lastSpeciesSigns) !==
        JSON.stringify(this.props.lastSpeciesSigns) ||
      JSON.stringify(prevProps.lastSpeciesThreats) !==
        JSON.stringify(this.props.lastSpeciesThreats)
    ) {
      TimelineHelper.draw({
        id: this.state.id,
        initWidth: this.props.initWidth,
        data: this.props.data,
        sourceColorMap: this.props.sourceColorMap,
        domainYears: this.props.domainYears,
        zoomLevel: this.state.zoomLevel,
        setZoomLevel: this.setZoomLevel.bind(this),
        speciesName: this.props.speciesName,
        maxPerYear: this.props.maxPerYear,
        pieStyle: this.props.pieStyle,
        groupSame: this.props.groupSame,
        sortGrouped: this.props.sortGrouped,
        heatStyle: this.props.heatStyle,
        justTrade: this.props.justTrade,
        justGenus: this.props.justGenus,
        setSpeciesSignThreats: this.props.setSpeciesSignThreats,
        getSpeciesSignThreats: this.props.getSpeciesSignThreats,
        getTreeThreatLevel: this.props.getTreeThreatLevel,
        addSpeciesToMap: this.props.addSpeciesToMap,
        removeSpeciesFromMap: this.props.removeSpeciesFromMap,
        muted: this.props.muted !== undefined ? this.props.muted : false,
        treeImageLinks: this.props.treeImageLinks,
        dummyImageLinks: this.props.dummyImageLinks,
        setHover: this.props.setHover,
        setTimeFrame: this.props.setTimeFrame,
        timeFrame: this.props.timeFrame,
        colorBlind: this.props.colorBlind,
        setFilter: this.props.setFilter,
        species: this.props.species,
        getPlantIcon: this.props.getPlantIcon,
        getAnimalIcon: this.props.getAnimalIcon,
        lastSpeciesSigns: this.props.lastSpeciesSigns,
        lastSpeciesThreats: this.props.lastSpeciesThreats
      });
    } */
  }

  render() {
    return (
      <div key={this.state.id}>
        <TimelineElement {...this.props} />
      </div>
    );
    //return <div id={this.state.id} className="timelineVis"></div>;
  }
}

export default Timeline;
