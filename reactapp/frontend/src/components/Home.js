import React, { Component } from 'react';
import Orchestra from './Orchestra';
import DataTable from './DataTable';
import TimelineView from "./TimelineView";

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            species: [],
            speciesData: {},
            instrumentGroup: props.instrumentGroup,
            instrument: props.instrument,
            mainPart: props.mainPart,
            mainPartList: [],
            /*          speciesTrades: {},
                     speciesThreats: {}, */
        };
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    setInstrument(instrument) {
        this.setState({ ...this.state, instrument: instrument, mainPart: "" });
        this.getMainParts(instrument);
    }

    onSelectChange(event) {
        this.setMainPart(event.target.value);
    }

    setMainPart(mainPart) {
        this.setState({ ...this.state, mainPart: mainPart });
        this.fetchAndSetSpecies();
    }

    setInstrumentAndMainPart(instrument, mainPart) {
        this.setState({ ...this.state, instrument, mainPart });
        this.fetchAndSetSpecies();
    }

    getMainParts(instrument) {
        let setMainPartList = this.setMainPartList.bind(this);
        fetch("http://localhost:9000/api/getMainParts/" + instrument)
            .then(res => res.json())
            .then(function (data) {
                setMainPartList(data.map(e => e.Main_part));
            });
    }

    setMainPartList(mainParts) {
        this.setState({ ...this.state, mainPartList: mainParts, mainPart: mainParts[0] });
        this.fetchAndSetSpecies();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    fetchAndSetSpecies() {
        if (this.state.mainPart !== "") {
            fetch("http://localhost:9000/api/getMaterial/" + this.state.instrument + "/" + this.state.mainPart)
                .then(res => res.json())
                .then(data => {
                    this.setSpecies(
                        data.map(e =>
                            (e.Genus.trim() + " " + e.Species.trim()).trim()
                        )
                    );
                });
        }
        else {
            this.setSpecies([]);
        }
    }

    fetchSpeciesTrades(species) {
        fetch("http://localhost:3000/species/" + species.replaceSpecialCharacters() + "_trades.json")
            .then(res => {
                return res.json();
            })
            .then(function (data) {
                let newSpeciesData = { ...this.state.speciesTrades };

                newSpeciesData[species] = data;
                this.setStateAsync({
                    ...this.state,
                    speciesTrades: newSpeciesData
                });
            }.bind(this));
    }

    fetchSpeciesThreats(species) {
        fetch("http://localhost:3000/species/" + species.replaceSpecialCharacters() + "_threats.json")
            .then(res => {
                return res.json();
            })
            .then(function (data) {
                let newSpeciesData = { ...this.state.speciesThreats };

                newSpeciesData[species] = data;
                this.setStateAsync({
                    ...this.state,
                    speciesThreats: newSpeciesData
                });
            }.bind(this));
    }

    fetchSpeciesData(species) {
        fetch("http://localhost:3000/species/" + species.replaceSpecialCharacters() + ".json")
            .then(res => {
                return res.json();
            })
            .then(function (data) {
                let newSpeciesData = { ...this.state.speciesData };

                newSpeciesData[species] = data;
                this.setStateAsync({
                    ...this.state,
                    speciesData: newSpeciesData
                });
            }.bind(this));
    }

    setSpecies(species) {
        species = [...new Set(species)];

        this.setStateAsync({ speciesData: {}, species: species });

        for (let spec of species.values()) {
            this.fetchSpeciesData(spec);
            /*             this.fetchSpeciesTrades(spec);
                        this.fetchSpeciesThreats(spec); */
        }
    }

    render() {
        return (
            <div>
                <Orchestra id="orchestraVis"
                    mainPart={this.state.mainPart}
                    instrument={this.state.instrument}
                    instrumentGroup={this.state.instrumentGroup}
                    setInstrument={this.setInstrument.bind(this)}
                    setInstrumentAndMainPart={this.setInstrumentAndMainPart.bind(this)}
                />
                <select
                    id="mainPartSelect"
                    value={this.state.mainPart}
                    onChange={this.onSelectChange.bind(this)}>
                    {
                        this.state.mainPartList.map(e =>
                            <option key={e} value={e} name={e}>{e}</option>
                        )
                    }
                </select>
                <DataTable data={this.state.speciesData}
                    /* threatData={this.state.speciesThreats}
                    tradeData={this.state.speciesTrades} */></DataTable>
                {Object.keys(this.state.speciesData).length > 0 && <div>
                    <TimelineView data={this.state.speciesData} />
                    <div
                        key="tooltip"
                        id="tooltip"
                        className="tooltip">
                    </div>
                </div>

                }
            </div >
        );
    }
}

export default Home;