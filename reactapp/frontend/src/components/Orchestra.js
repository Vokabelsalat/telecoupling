import React, { Component } from 'react';
import OrchestraHelper from './OrchestraHelper';
import '../utils/utils';

class Orchestra extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            instrumentGroup: this.props.instrumentGroup,
            instrument: this.props.instrument,
            mainPart: this.props.mainPart,
            setInstrumentAndMainPart: this.props.setInstrumentAndMainPart,
            setInstrument: this.props.setInstrument
        };
    }

    componentDidMount() {
        OrchestraHelper.draw({
            id: this.state.id,
            instrumentGroup: this.state.instrumentGroup,
            instrument: this.state.instrument,
            mainPart: this.state.mainPart,
            setInstrumentAndMainPart: this.state.setInstrumentAndMainPart,
            setInstrument: this.state.setInstrument
        });
    }

    componentDidUpdate() {
        /*  OrchestraHelper.draw({
             id: this.state.id,
             setSpecies: this.state.setSpecies
         }); */
    }

    render() {
        return (
            <div>
                <div id={this.state.id}></div>
                <div id={"selectmainpartWrapper"}></div>
            </div>
        );
    }
}

export default Orchestra;