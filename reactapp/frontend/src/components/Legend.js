import React, { Component } from 'react';
import { iucnColors } from '../utils/timelineUtils';

class Legend extends Component {
    /*     constructor(props) {
            super(props);
        } */

    componentDidMount() {
    }

    /*  componentWillReceiveProps(someProps) {
         console.log("RECEIVE!", someProps); */

    /*    this.setState({ ...this.state, someProp }) */
    /*   } */

    render() {
        return (
            <div>
                {(Object.keys(iucnColors).map(e => {
                    let style = {
                        display: "inline-block",
                        width: "30px",
                        height: "20px",
                        backgroundColor: iucnColors[e].bg,
                        color: iucnColors[e].fg
                    };
                    return (<div
                        key={e}
                        style={style}
                    >
                        {e}
                    </div>);
                }))
                }

                < div > {this.props.zoomLevel} / {this.props.maxZoomLevel}</div >
                <button onClick={this.props.onZoomOut}>-</button>
                <button onClick={this.props.onZoom}>+</button>
            </div >
        );
    }
}

export default Legend;