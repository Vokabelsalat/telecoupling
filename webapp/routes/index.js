module.exports = {
    requestMapboxToken: (req, res) => {
        res.end(JSON.stringify({ accessToken: variables.mapboxAccessToken }));
    },
    getHomePage: (req, res) => {
        let selectedinstrument = req.params.selectedInstruments;
        let selectedMainPart = req.params.selectedMainPart;
        knex.select("Instruments").from('materials').groupBy("Instruments").then(rows =>
            res.render('index.ejs', {
                title: "Welcome to Telecoupling",
                instruments: rows,
                selectedinstrument: selectedinstrument,
                selectedMainPart: selectedMainPart
            })
        );
    },
    getTimeline: (req, res) => {
        res.render("timeline.ejs", {
            title: "Welcome to Teletimeline",
        });
    },
    getInstrumentsFromGroup: (req, res) => {
        let group = req.params.selectedGroup;
        knex.select("Instruments").from('materials').where("Instrument_groups", group).groupBy("Instruments").then(rows => {
            res.end(JSON.stringify(rows));
        });
    },
    getMainPart: (req, res) => {
        let instruments = req.params.instruments;
        knex.select("Main_part").from("materials").where({ "Instruments": instruments }).whereNot({ "Main_part": "" }).groupBy("Main_part").then(rows => {
            res.end(JSON.stringify(rows));
        });
    },
    getMaterial: (req, res) => {
        let instruments = req.params.instruments;
        let mainPart = req.params.mainPart;

        knex.select("Trade_name", "Family", "Genus", "Species", "Main_part", "Subpart", "CITES_regulation").from("materials").where({ "Instruments": instruments, "Main_part": mainPart }).then(rows => {
            res.json(rows);
        });
    },
    getAllMaterials: (req, res) => {
        knex.select("Trade_name", "Family", "Genus", "Species", "Main_part", "Subpart", "CITES_regulation").from("materials").limit(20).offset(0).then(rows => {
            res.json(rows);
        });
    },
    getAllSpecies: (req, res) => {
        knex.distinct('Genus', 'Species').from("materials").limit(20).offset(140).then(rows => {
            res.json(rows);
        });
    },
    getSynonyms: (req, res) => {
        let word = req.params.word;
        //let query = knex.raw("select DISTINCT `FullName`, `NomenclatureNote` from `listinghistory` where `NomenclatureNote` LIKE '%synonym%'");

        let query = knex.select().from("synonyms").where({ "A": word }).orWhere({ "B": word });
        query.then(rows => {
            let fromSynonyms = rows.map(e => [e.A, e.B]).reduce((acc, val) => acc.concat(val), []).filter(e => e !== word);

            res.end(JSON.stringify(fromSynonyms));

            /*let query = knex.select("FullName").from("speciesFull").where("SynonymsWithAuthors", "like", "%" + word + "%")
                .whereNot({ "FullName": word })
                .whereNot("SynonymsWithAuthors", "like", "%" + word + " var.%");
            query.then(rows => {
                let fromSpeciesFull = rows.map(e => e["FullName"]);
                fromSynonyms.push(...fromSpeciesFull);
                res.end(JSON.stringify(fromSynonyms));
            });*/
        });
    },
    queryIUCN: (req, res) => {
        let species = req.params.species;
        let outerRes = res;

        let query = knex.select().from("iucnCache").where({ "Scientific Name": species });
        query.then(rows => {
            if (rows.length === 0) {
                request({
                    url: encodeURI('https://apiv3.iucnredlist.org/api/v3/species/history/name/' + species + '?token=58238783dc4a815f380f9cc8e36fc01e468db5672e464f8411bb4f323a4c7c94'),
                    method: 'GET',
                }, function (err, res, data) {
                    try {
                        data = JSON.parse(data);
                        let results = data["result"];
                        results.forEach(function (element, index) {
                            knex('iucnCache').insert({ "Scientific Name": species, "year": element["year"], "code": element["code"], "category": element["category"] }).then(result => { });
                        });

                        outerRes.json(results);
                    } catch (e) {
                        if (e instanceof SyntaxError) {
                            outerRes.end(data);
                        }
                        else {
                            console.error(e);
                            outerRes.end();
                        }
                    }
                });
            } else {
                outerRes.json(rows);
            }
        });
    },
    getCountriesGeoJSON: (req, res) => {
        res.end(JSON.stringify(countriesGeoJson));
    },
    getMusicalChairs: (req, res) => {
        let query = knex.select().from("musicalchair");
        query.then(rows => {
            let secondQuery = knex.select().from("musicalchairslocations");
            secondQuery.then(data => {
                res.end(JSON.stringify({ orchestras: rows, locations: data }));
            });
        });
    },
    processMusicalChairs: (req, res) => {

        /*        let query = knex.select().from("musicalchair");
                query.then(rows => {
                    for (let entry of rows) {
                        let locs = musicalChairsLocations[entry.country];
                        if (locs !== null && locs !== undefined) {
                            let filter = locs.filter(e => e.city === entry.city);
                            if (filter.length === 1) {
                                if (filter[0].location.lat && filter[0].location.lon) {
                                    let query = knex('musicalchair')
                                        .where('country', '=', entry.country)
                                        .andWhere("city", "=", entry.city)
                                        .update({
                                            lat: filter[0].location.lat,
                                            lon: filter[0].location.lon
                                        });
                                    query.then(result => {
                                    });
                                }
                            }
                        }
                    }
                });*/

        /*let query = knex('musicalchair')
            .where('published_date', '=', 2000)
            .update({
                status: 'archived',
                thisKeyIsSkipped: undefined
            })
        let query = knex.select().from("musicalchair");
        query.then(rows => {
            let secondQuery = knex.select().from("musicalchairslocations");
            secondQuery.then(data => {
                res.end(JSON.stringify({ orchestras: rows, locations: data }));
            });
        });*/
    }
};