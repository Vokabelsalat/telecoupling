import React, { Component } from 'react';
import Orchestra from './Orchestra';
import DataTable from './DataTable';
import TimelineView from "./TimelineView";
import Map from "./Map";

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
        fetch("http://localhost:3000/data/" + species.replaceSpecialCharacters() + "_trades.json")
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
        fetch("http://localhost:3000/data/" + species.replaceSpecialCharacters() + "_threats.json")
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
        let fetchSpeciesOccurrencesBound = this.fetchSpeciesOccurrences.bind(this);
        fetch("http://localhost:3000/data/" + species.replaceSpecialCharacters() + ".json")
            .then(res => {
                return res.json();
            })
            .then(function (data) {
                let newSpeciesData = { ...this.state.speciesData };

                newSpeciesData[species] = data;

                setTimeout(fetchSpeciesOccurrencesBound(species, data.species));

                this.setStateAsync({
                    ...this.state,
                    speciesData: newSpeciesData
                });
            }.bind(this));
    }

    fetchSpeciesOccurrences(species, speciesObject) {
        console.log("TRY TO FETCH", species, speciesObject);

        let callback = function (data) {
            let coordinates = data.map(entry => {
                return [parseInt(entry.decimalLatitude), parseInt(entry.decimalLongitude)];
            });

            let newSpeciesData = { ...this.state.speciesOccurrences };

            newSpeciesData[species] = coordinates;
            this.setStateAsync({
                speciesOccurrences: newSpeciesData
            });
        }.bind(this);

        if (species.includes(" ")) {
            let speciesKeys = Object.values(speciesObject).map(entry => entry.speciesKey);
            console.log("speciesKeys", speciesKeys);

            fetch("http://localhost:9000/api/getTreeOccurrences/species", {
                body: JSON.stringify(speciesKeys),
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    console.log("Data", species, data);
                    callback(data);
                })
        }
        else {
            fetch("http://localhost:9000/api/getTreeOccurrences/genus/" + species)
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    /* map.treeCoordinates[species] = data;

                    let coordinates = data.map(entry => {
                        return [parseInt(entry.decimalLatitude), parseInt(entry.decimalLongitude)];
                    });

                    if (coordinates.length > 0) {
                        mapHelper.addTreeCoordinates(species, coordinates);
                    }

                    setTimeout(boundCallback, 5); */
                    console.log("Just Genus", species, data);
                    callback(data);
                })
        }
    }

    setSpecies(species) {
        species = [...new Set(species)];

        this.setStateAsync({ speciesData: {}, species: species });

        for (let spec of species.values()) {
            this.fetchSpeciesData(spec);
            this.fetchSpeciesTrades(spec);
            this.fetchSpeciesThreats(spec);
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
                    threatData={this.state.speciesThreats}
                    tradeData={this.state.speciesTrades}
                ></DataTable>
                {Object.keys(this.state.speciesData).length > 0 && <div>
                    <TimelineView data={this.state.speciesData} />
                    <div
                        key="tooltip"
                        id="tooltip"
                        className="tooltip">
                    </div>
                </div>
                }
                <Map
                    data={this.state.speciesData}
                    coordinates={this.state.speciesOccurrences}
                ></Map>
            </div >
        );
    }
}

export default Home;