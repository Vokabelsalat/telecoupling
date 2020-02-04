module.exports = {
    getHomePage: (req, res) => {
        let seleselectedinstrument = req.params.selectedInstruments;
        knex.select("Instruments").from('materials').groupBy("Instruments").then(rows =>
            res.render('index.ejs', {
                title: "Welcome to Telecoupling",
                instruments: rows,
                seleselectedinstrument: seleselectedinstrument
            })
        );
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
        knex.select("Trade_name", "Family", "Genus", "Species").from("materials").where({ "Instruments": instruments, "Main_part": mainPart }).then(rows => {
            res.end(JSON.stringify(rows));
        });
    },
    getSynonyms: (req, res) => {
        let word = req.params.word;
        //let query = knex.raw("select DISTINCT `FullName`, `NomenclatureNote` from `listinghistory` where `NomenclatureNote` LIKE '%synonym%'");

        let query = knex.select().from("synonyms").where({ "A": word }).orWhere({ "B": word });
        query.then(rows => {
            res.end(JSON.stringify(rows.map(e => [e.A, e.B]).flat().filter(e => e !== word)));
        });
    },
    getTrade: (req, res) => {
        let taxon = req.params.taxon;
        let query = knex.select().from("trade").where({ "Taxon": taxon });
        query.then(rows => {
            res.end(JSON.stringify(rows));
        });
    },
    queryIUCN: (req, res) => {
        let species = req.params.species;
        let outerRes = res;

        request({
            url: encodeURI('http://apiv3.iucnredlist.org/api/v3/species/' + species + '?token=58238783dc4a815f380f9cc8e36fc01e468db5672e464f8411bb4f323a4c7c94'),
            method: 'GET',
            json: true,
        }, function(err, res, data) {
            let results = data["result"];
            outerRes.end(JSON.stringify(results));
        });
    },
    queryGBIFspecies: (req, res) => {
        let word = req.params.word;
        let outerRes = res;

        request({
            url: 'http://api.gbif.org/v1/species/match',
            method: 'GET',
            json: true,
            data: {
                "name": word
            }
        }, function(err, res, data) {
            /*console.log(data);*/
            let taxonKey = data["usageKey"];
            let conf = data["confidence"];
            /* console.log(word, taxonKey, conf);*/
            if (conf > 80) {
                console.log(word + " = " + taxonKey);
                outerRes.end(JSON.stringify({ word, taxonKey, conf }));
            } else {
                outerRes.end();
            }
        });
    },
    queryGBIF: (req, res) => {
        /* TODOs
            - Bilder aus den Daten ziehen => z.B.
             media: [
                {
                  type: 'StillImage',
                  format: 'image/jpeg',
                  identifier: 'http://imagens3.jbrj.gov.br/fsi/server?type=image&source=rb/1/40/17/34/01401734.JPG'
                }
              ],

            - Abwarten, bis alle reuqests gemacht wurden

        */

        let key = req.params.taxonKey;
        //let url = "http://api.gbif.org/v1/occurrence/search?scientificName=";
        let outerRes = res;

        request({
            url: 'http://api.gbif.org/v1/occurrence/search',
            method: 'GET',
            json: true,
            data: {
                "taxonKey": key,
                "limit": 300,
                /*"hasCoordinate": true*/
            }
        }, function(err, res, data) {
            let count = data["count"];
            console.log(count);
            let pages = Math.ceil(count / 300);

            let results = [];

            let wait = Array(pages - 1).fill(0);

            let fin = (data) => {
                console.log("FIN");
                console.log(data.length);
                outerRes.end(JSON.stringify(data));
            };

            results.push(...(data.results));

            if (wait.length === 0) {
                fin(results);
            }

            if (pages > 1) {
                for (let pageCount = 1; pageCount < pages; pageCount++) {
                    let offset = 300 * pageCount;

                    console.log(offset);

                    request({
                        url: 'http://api.gbif.org/v1/occurrence/search',
                        method: 'GET',
                        json: true,
                        data: {
                            "taxonKey": key,
                            "limit": 300,
                            "offset": offset
                        }
                    }, function(err, res, data) {
                        console.log("POP", wait);
                        wait.pop();

                        results.push(...(data.results));

                        if (wait.length === 0) {
                            fin(results);
                        }

                        /*console.log("DONE", data.results.length);
                        console.log(data.results[0]);*/
                    });

                    /*                outerRes.render('info.ejs', {
                                        title: "Welcome to Telecoupling",
                                        info: { "text": "Found: " + count + " in " + pages + " pages" }
                                    });*/
                }
            }
        });
    },
    queryTreeSearchSpecies: (req, res) => {
        let genus = req.params.genus;
        let species = req.params.species;
        //let url = "http://api.gbif.org/v1/occurrence/search?scientificName=";
        let outerRes = res;

        request({
            url: 'https://data.bgci.org/treesearch/genus/' + genus + '/species/' + species,
            method: 'GET',
            json: true,
        }, function(err, res, data) {
            if (data.results.length > 0) {
                outerRes.end(JSON.stringify(data.results[0]));
            } else {
                outerRes.end();
            }
        });
    },
    queryTreeSearchSpeciesWithSciName: (req, res) => {
        let name = req.params.name;
        //let url = "http://api.gbif.org/v1/occurrence/search?scientificName=";
        let outerRes = res;

        if (name.includes(" ")) {
            let split = name.split(" ");
            let genus = split[0];
            let species = split[1];

            request({
                url: 'https://data.bgci.org/treesearch/genus/' + genus + '/species/' + species,
                method: 'GET',
                json: true,
            }, function(err, res, data) {
                if (data.results.length > 0) {
                    outerRes.end(JSON.stringify(data.results[0]));
                } else {
                    outerRes.end();
                }
            });
        } else {
            res.end();
        }
    },
    queryThreatSearchWithSciName: (req, res) => {
        let name = req.params.name;
        //let url = "http://api.gbif.org/v1/occurrence/search?scientificName=";
        let outerRes = res;

        if (name.includes(" ")) {
            let split = name.split(" ");
            let genus = split[0];
            let species = split[1];

            request({
                url: ' https://data.bgci.org/threatsearch/genus/' + genus + '/species/' + species,
                method: 'GET',
                json: true,
            }, function(err, res, data) {
                outerRes.end(JSON.stringify(data.results));
            });
        } else {
            res.end();
        }
    }
};