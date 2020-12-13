import React, { Component } from 'react';
import TimelineHelper from './TimelineHelper';
import '../utils/utils';

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
            console.log("zoom");
            this.props.addUnmutedSpecies(this.props.speciesName);
            this.setState({ zoomLevel: setValue });
        }
        else {
            this.props.removeUnmutedSpecies(this.props.speciesName)
            this.setState({ zoomLevel: setValue, muted: true });
        }
    }

    componentDidMount() {
        TimelineHelper.draw({
            id: this.state.id,
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
            addTreeSpeciesToMap: this.props.addTreeSpeciesToMap,
            removeTreeSpeciesFromMap: this.props.removeTreeSpeciesFromMap,
            muted: this.props.muted !== undefined ? this.props.muted : false
        });
    }

    componentDidUpdate() {
        TimelineHelper.draw({
            id: this.state.id,
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
            addTreeSpeciesToMap: this.props.addTreeSpeciesToMap,
            removeTreeSpeciesFromMap: this.props.removeTreeSpeciesFromMap,
            muted: this.props.muted !== undefined ? this.props.muted : false
        });
    }

    render() {
        return (
            <div id={this.state.id} class="timelineVis"></div>
        );
    }
}

export default Timeline;