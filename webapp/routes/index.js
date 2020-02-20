module.exports = {
    requestMapboxToken: (req, res) => {
        res.end(JSON.stringify({ accessToken: variables.mapboxAccessToken}));
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
            res.end(JSON.stringify(rows.map(e => [e.A, e.B]).reduce((acc, val) => acc.concat(val), []).filter(e => e !== word)));
        });
    },
    queryIUCN: (req, res) => {
        let species = req.params.species;
        let outerRes = res;

        request({
            url: encodeURI('https://apiv3.iucnredlist.org/api/v3/species/history/name/' + species + '?token=58238783dc4a815f380f9cc8e36fc01e468db5672e464f8411bb4f323a4c7c94'),
            method: 'GET',
            json: true,
        }, function(err, res, data) {
            let results = data["result"];
            outerRes.end(JSON.stringify(results));
        });
    },
    getCountriesGeoJSON: (req, res) => {
        res.end(JSON.stringify(countriesGeoJson));
    }
};