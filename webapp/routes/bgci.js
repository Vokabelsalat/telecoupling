module.exports = {
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