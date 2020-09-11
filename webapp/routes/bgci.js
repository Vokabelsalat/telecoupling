const https = require("https");
const { parse } = require("node-html-parser");

module.exports = {
  queryTreeSearchSpecies: (req, res) => {
    let genus = req.params.genus;
    let species = req.params.species;
    //let url = "http://api.gbif.org/v1/occurrence/search?scientificName=";
    let outerRes = res;

    request(
      {
        url: "https://data.bgci.org/treesearch/genus/" + genus + "/species/" + species,
        method: "GET",
        json: true,
      },
      function (err, res, data) {
        if (data.results.length > 0) {
          outerRes.end(JSON.stringify(data.results[0]));
        } else {
          outerRes.end();
        }
      }
    );
  },
  queryTreeSearchSpeciesWithSciName: (req, res) => {
    let name = req.params.name;
    //let url = "http://api.gbif.org/v1/occurrence/search?scientificName=";
    let outerRes = res;

    if (name.includes(" ")) {
      let split = name.split(" ");
      let genus = split[0];
      let species = split[1];

      request(
        {
          url: "https://data.bgci.org/treesearch/genus/" + genus + "/species/" + species,
          method: "GET",
          json: true,
        },
        function (err, res, data) {
          if (data && data.results.length > 0) {
            outerRes.json(data.results);
          } else {
            outerRes.end();
          }
        }
      );
    } else {
      res.end();
    }
  },
  queryCountriesForNationalRedList: (req, res) => {
    let outerRes = res;
    let bgciUrl = req.body.bgciUrl;

    console.log("BGCI Url", bgciUrl);

    https
      .get(bgciUrl.replace("http", "https"), (resp) => {
        let data = "";
        let retElement = {};

        // A chunk of data has been recieved.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          const root = parse(data);
          let isCountry = false;
          for (let child of root.querySelector("#search_generic_border").childNodes.values()) {
            if (isCountry === false) {
              if (child.tagName === "strong") {
                let countryElements = child.childNodes.filter(
                  (e) => e.nodeType === 3 && e.rawText === "Country:"
                );

                if (countryElements.length > 0) {
                  isCountry = true;
                }
              }
            } else {
              if (child.nodeType === 3) {
                let countries = child.rawText;
                retElement.countries = countries;
              }
            }
          }

          for (let child of root.querySelector("#content").childNodes.values()) {
            for (let subchild of child.childNodes.values()) {
              if (subchild.tagName === "div") {
                for (let subsubchild of subchild.childNodes.values()) {
                  let filteredStatus = subsubchild.childNodes.filter(
                    (e) => e.rawText.trim() === "Regional Status"
                  );
                  if (filteredStatus.length > 0) {
                    for (let ps of subchild.querySelectorAll("p").values()) {
                      let entries = ps.childNodes.map(e => e.rawText);
                      retElement.regionalStatus = entries;
                    }
                  }

                  let filteredCrit = subsubchild.childNodes.filter(
                    (e) => e.rawText.trim() === "Criteria Used"
                  );
                  if (filteredCrit.length > 0) {
                    for (let ps of subchild.querySelectorAll("p").values()) {
                      let entries = ps.childNodes.map(e => e.rawText);
                      retElement.criteriaUsed = entries;
                    }
                  }
                }
              }
            }
          }

          outerRes.json(retElement);
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
        outerRes.end();
      });
  },
  queryThreatSearchWithSciName: (req, res) => {
    let name = req.params.name;
    //let url = "http://api.gbif.org/v1/occurrence/search?scientificName=";
    let outerRes = res;

    if (name.includes(" ")) {
      let split = name.split(" ");
      let genus = split[0];
      let species = split[1];

      console.log("URL", "https://data.bgci.org/threatsearch/genus/" + genus + "/species/" + species);


      request(
        {
          url: "https://data.bgci.org/threatsearch/genus/" + genus + "/species/" + species,
          method: "GET",
          json: true,
        },
        function (err, res, data) {
          if (data) {
            outerRes.json(data.results);
          } else {
            outerRes.end();
          }
        }
      );
    } else {
      res.end();
    }
  },
  queryBGCITreeSearchByGenus: (req, res) => {
    let genus = req.params.genus;
    let outerRes = res;

    if (genus) {
      request(
        {
          url: "https://data.bgci.org/treesearch/genus/" + genus,
          method: "GET",
          json: true,
        },
        function (err, res, data) {
          if (data && data.hasOwnProperty("results")) {
            outerRes.json(data["results"]);
          } else {
            outerRes.end();
          }
        }
      );
    } else {
      outerRes.end();
    }
  },
  queryBGCIThreatSearchByGenus: (req, res) => {
    let genus = req.params.genus;
    let outerRes = res;

    if (genus) {
      request(
        {
          url: "https://data.bgci.org/threatsearch/genus/" + genus,
          method: "GET",
          json: true,
        },
        function (err, res, data) {
          if (data) {
            if (data.hasOwnProperty("results")) {
              outerRes.json(data["results"]);
            } else {
              outerRes.end();
            }
          } else {
            outerRes.end();
          }
        }
      );
    } else {
      outerRes.end();
    }
  },
};
