module.exports = {
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
        }, function (err, res, data) {
            if (data) {
                let conf = data["confidence"];
                if (conf > 80) {
                    outerRes.json(data);
                } else {
                    outerRes.end();
                }
            }
            else {
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
        }, function (err, res, data) {
            let count = data["count"];
            let pages = Math.ceil(count / 300);

            let results = [];

            let wait = Array(pages - 1).fill(0);

            let fin = (data) => {
                outerRes.json(data);
            };

            results.push(...(data.results));

            if (wait.length === 0) {
                fin(results);
            }

            if (pages > 1) {
                for (let pageCount = 1; pageCount < pages; pageCount++) {
                    let offset = 300 * pageCount;

                    request({
                        url: 'http://api.gbif.org/v1/occurrence/search',
                        method: 'GET',
                        json: true,
                        data: {
                            "taxonKey": key,
                            "limit": 300,
                            "offset": offset
                        }
                    }, function (err, res, data) {
                        wait.pop();

                        results.push(...(data.results));

                        if (wait.length === 0) {
                            fin(results);
                        }
                    });
                }
            }
        });
    },
    queryGBIFspeciesByGenus: (req, res) => {

        let genus = req.params.genus;
        let outerRes = res;

        if (genus) {
            request({
                url: 'http://api.gbif.org/v1/species/match',
                method: 'GET',
                json: true,
                data: {
                    "genus": genus
                }
            }, function (err, res, data) {
                if (data !== null && data !== undefined && data.hasOwnProperty("genusKey")) {
                    let genusKey = data["genusKey"];
                    outerRes.end(genusKey.toString());
                }
                else {
                    outerRes.end();
                }
            });
        } else {
            outerRes.end();
        }
    },
    queryGBIFchildren: (req, res) => {

        let genusKey = req.params.genusKey;
        let offset = req.params.offset;
        let outerRes = res;

        if (genusKey) {
            request({
                url: 'http://api.gbif.org/v1/species/' + genusKey + '/children',
                method: 'GET',
                json: true,
                data: {
                    limit: 1000,
                    offset: offset
                }
            }, function (err, res, data) {
                if (data !== null && data !== undefined && data.hasOwnProperty("results")) {

                    let endOfRecords = data.endOfRecords
                    outerRes.json({ "data": data["results"], "endOfRecords": endOfRecords });
                }
                else {
                    outerRes.end();
                }
            });
        } else {
            outerRes.end();
        }
    },
    queryGBIFsynonyms: (req, res) => {

        let taxonKey = req.params.taxonKey;
        let outerRes = res;

        if (taxonKey) {
            request({
                url: 'http://api.gbif.org/v1/species/' + taxonKey + '/synonyms',
                method: 'GET',
                data: {
                    limit: 1000
                }
            }, function (err, res, data) {
                if (data) {
                    data = JSON.parse(data);
                    if (data !== null && data !== undefined && data.hasOwnProperty("results")) {
                        outerRes.json(data["results"]);
                    }
                    else {
                        outerRes.end();
                    }
                }
                else {
                    outerRes.end();
                }
            });
        } else {
            outerRes.end();
        }
    }
};