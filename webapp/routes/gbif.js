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
        }, function(err, res, data) {
            let taxonKey = data["usageKey"];
            let conf = data["confidence"];
            console.log("HERE", data);
            if (conf > 80) {
                outerRes.end(JSON.stringify(data));
            } else {
                outerRes.end();
            }
        });
    },
    getGBIFsynonyms: (req, res) => {
        let taxonKey = req.params.taxonKey;
        let outerRes = res;

        request({
            url: 'http://api.gbif.org/v1/species/' + taxonKey + '/synonyms',
            method: 'GET',
            json: true,
            /*data: {
                "name": word
            }*/
        }, function(err, res, data) {

            if (data !== undefined) {

                let syns = [];
                data["results"].forEach(function(element, index) {
                    /*if (element["taxonomicStatus"] === "SYNONYM") {*/
                        syns.push(element["canonicalName"]);
  /*                  }
                    else if(element["taxonomicStatus"] === "HOMOTYPIC_SYNONYM") {
                        if(element["origin"] === "SOURCE") {
                            syns.push(element["species"]);   
                        }
                        else if(element["origin"] === "EX_AUTHOR_SYNONYM"){
                            syns.push(element["canonicalName"]);
                        }
                    }*/
                });

                outerRes.end(JSON.stringify(syns));
            }
            else {
                outerRes.end();
            }

            /*            let taxonKey = data["usageKey"];
                        let conf = data["confidence"];
                        if (conf > 80) {
                            outerRes.end(JSON.stringify({ word, taxonKey, conf }));
                        } else {
                        }*/

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
            let pages = Math.ceil(count / 300);

            let results = [];

            let wait = Array(pages - 1).fill(0);

            let fin = (data) => {
                outerRes.end(JSON.stringify(data));
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
                    }, function(err, res, data) {
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
    }
};