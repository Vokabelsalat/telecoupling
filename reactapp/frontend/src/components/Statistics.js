import React, { Component } from 'react';
import { getOrCreate, pushOrCreate } from '../utils/utils';

import statdata from "../data/statdata.json";

/* import data1 from "../data/crawledData2.json";
import data2 from "../data/crawledData3.json";
import data3 from "../data/crawledData4.json";
import data4 from "../data/crawledData5.json";
import data5 from "../data/crawledData6.json";
import data6 from "../data/crawledData7.json"; */
/* import data7 from "../data/crawledData8.json";
import data8 from "../data/crawledData9.json";
import data9 from "../data/crawledData10.json";
import data10 from "../data/crawledData11.json"; */
/* import data11 from "../data/crawledData12.json";
import data12 from "../data/crawledData13.json"; */
/* import data13 from "../data/crawledData14.json";
import data14 from "../data/crawledData15.json"; 
import data15 from "../data/crawledData16.json";
import data16 from "../data/crawledData17.json";
import data17 from "../data/crawledData18.json";*/
/* import data18 from "../data/crawledData19.json";
import data19 from "../data/crawledData20.json"; */
/* import data20 from "../data/crawledData21.json";
import data21 from "../data/crawledData22.json"; */
import data22 from "../data/crawledData23.json";
import data23 from "../data/crawledData24.json";

class Statistics extends Component {
    constructor(props) {
        super(props);

        /* for (let name of Object.keys(eval("data1")).values()) {
            console.log(name);
        } */

        this.statistics = statdata.statistics;
        this.statdata = statdata.statdata;

        this.state = {
            testdata: {
                /* ...data1,
                ...data2,
                ...data3, */
                /* ...data4,
                ...data5,
                ...data6, */
                /* ...data7,
                ...data8,
                ...data9,
                ...data10 */
                /* ...data11,
                ...data12, */
                /* ...data13,
                ...data14, */
                /*                 ...data15,
                                ...data16,
                                ...data17,  */
                /* ...data18,
                ...data19, */
                /* ...data20,
                ...data21, */
                ...data22,
                ...data23,
            }
        };
    }

    countSpecies() {
        this.statistics.count = Object.keys(this.state.testdata).length;
    }

    countThreats() {
        for (let species of Object.keys(this.state.testdata).values()) {
            if (this.state.testdata[species].threats) {
                getOrCreate(this.statdata, species, { threatCount: 0 }).threatCount = this.state.testdata[species].threats.length;
                this.statistics.threatCount = this.statistics.threatCount + this.state.testdata[species].threats.length;

                for (let threat of this.state.testdata[species].threats.values()) {
                    pushOrCreate(this.statistics.threatCats, threat.consAssCategory, {
                        threatened: threat.threatened,
                        consAssCategory: threat.consAssCategory,
                        bgciUrl: threat.bgciUrl,
                        reference: threat.reference,
                        taxonName: threat.taxonName,
                        threatId: threat.threatId,
                    });
                }
            }
            else {
                getOrCreate(this.statdata, species, { threatCount: 0 }).threatCount = 0;
            }
        }

        for (let cat of Object.keys(this.statistics.threatCats).values()) {
            this.statistics.threatCatsCount[cat] = this.statistics.threatCats[cat].length;
        }

        this.statistics.threatCatsCountSorted = Object.keys(this.statistics.threatCatsCount).sort((a, b) => (this.statistics.threatCatsCount[b] - this.statistics.threatCatsCount[a]));
    }

    countTrades() {
        for (let species of Object.keys(this.state.testdata).values()) {
            if (this.state.testdata[species].trade) {
                for (let innerspecies of Object.keys(this.state.testdata[species].trade)) {
                    getOrCreate(this.statdata, species, { tradeCount: 0 }).tradeCount = this.state.testdata[species].trade[innerspecies].length;
                    this.statistics.tradeCount = this.statistics.tradeCount + this.state.testdata[species].trade[innerspecies].length;

                    for (let trade of this.state.testdata[species].trade[innerspecies].values()) {
                        pushOrCreate(this.statistics.tradeUnits, trade.Unit, trade);
                    }
                }
            }
            else {
                getOrCreate(this.statdata, species, { tradeCount: 0 }).tradeCount = 0;
            }
        }

        for (let cat of Object.keys(this.statistics.tradeUnits).values()) {
            this.statistics.tradeUnitsCount[cat] = this.statistics.tradeUnits[cat].length;
        }

        this.statistics.tradeUnitsCountSorted = Object.keys(this.statistics.tradeUnitsCount).sort((a, b) => (this.statistics.tradeUnitsCount[b] - this.statistics.tradeUnitsCount[a]));

        this.statistics.tradeSpeciesCountSorted = Object.keys(this.statdata).sort((a, b) => (this.statdata[b].tradeCount - this.statdata[a].tradeCount));

    }

    render() {
        this.countSpecies();
        this.countThreats();
        this.countTrades();

        return (
            <div>
                <button onClick={() => {
                    this.statistics.threatCats = [];
                    this.statistics.tradeUnits = [];
                    let file = new Blob([JSON.stringify({ statdata: this.statdata, statistics: this.statistics }, null, 4)], { type: "application/json" });
                    let filename = "statdata.json";
                    if (window.navigator.msSaveOrOpenBlob) // IE10+
                        window.navigator.msSaveOrOpenBlob(file, filename);
                    else { // Others
                        let a = document.createElement("a"),
                            url = URL.createObjectURL(file);
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(function () {
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        }, 0);
                    }
                }}>SAVE</button>

                <h2>Species ({Object.keys(this.statdata).length})</h2>
                {
                    Object.keys(this.statdata).map(key => {
                        return (<div key={key + "species"}>
                            {key}
                        </div>);
                    })
                }
                <h2>Statistics</h2>
                <h3>Threats ({this.statistics.threatCount}):</h3>
                {
                    this.statistics.threatCatsCountSorted.map(key => {
                        return (<div key={key + "threats"}>
                            {key}: {this.statistics.threatCatsCount[key]}
                        </div>);
                    })
                }
                <h3>Trades ({this.statistics.tradeCount}):</h3>
                <h4>Units:</h4>
                {
                    this.statistics.tradeUnitsCountSorted.map(key => {
                        return (<div key={key + "trades"}>
                            {key}: {this.statistics.tradeUnitsCount[key]}
                        </div>);
                    })
                }
                <h4>Species:</h4>
                {
                    this.statistics.tradeSpeciesCountSorted.map(key => {
                        return (<div key={key + "tradeSpecies"}>
                            {key}: {this.statdata[key].tradeCount}
                        </div>);
                    })
                }
            </div>
        );
    }
}

export default Statistics;