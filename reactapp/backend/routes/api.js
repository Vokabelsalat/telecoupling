var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const database = require("../database.js");

const knex = require("knex")({
  client: "mysql",
  connection: database.databaseConfig
});

router.get("/", function (req, res, next) {
  res.send("API is working properly");
});

router.get("/testDatabase", function (req, res, next) {
  try {
    knex.raw("select 1+1 as result").then(function () {
      res.send("Connection to database works!");
    });
  } catch (error) {
    console.error("Couldn't connect to DB: ", error);
  }
});

router.get(
  "/getInstrumentsFromGroup/:selectedGroup",
  function (req, res, next) {
    let group = req.params.selectedGroup;
    knex
      .select("Instruments")
      .from("materials")
      .where("Instrument_groups", group)
      .groupBy("Instruments")
      .then((rows) => {
        res.end(JSON.stringify(rows));
      });
  }
);

router.get(
  "/getMaterial/:instrumentGroup/:instruments?/:mainPart?",
  (req, res) => {
    let instrumentGroup = req.params.instrumentGroup;
    let instruments = req.params.instruments;
    let mainPart = req.params.mainPart;
    console.log(instrumentGroup, instruments, mainPart);

    if (instruments) {
      if (mainPart) {
        knex
          .select()
          .from("materials")
          .where({ Instruments: instruments, "Main part": mainPart })
          .then((rows) => {
            res.json(rows);
          });
      } else {
        knex
          .select()
          .from("materials")
          .where({ Instruments: instruments })
          .then((rows) => {
            res.json(rows);
          });
      }
    } else {
      knex
        .select()
        .from("materials")
        .where({ Instrument_groups: instrumentGroup })
        .then((rows) => {
          res.json(rows);
        });
    }
  }
);

router.get("/getAllMaterials", (req, res) => {
  knex
    .select()
    .from("materials")
    .then((rows) => {
      res.json(rows);
    });
  /* knex.select().from("materials4").offset(440).limit(60).then(rows => {
        res.json(rows);
    }); */
});

router.get("/getTestMaterial", (req, res) => {
  /*  knex.select("Trade_name", "Family", "Genus", "Species", "Main_part", "Subpart", "CITES_regulation").from("materials4").then(rows => {
         res.json(rows);
     }); */

  /* knex.select().from("materials4").where({ "Genus": "Swietenia", "Species": "mahagoni" })
        .orWhere({ "Genus": "Paubrasilia", "Species": "Echinata" })
        .orWhere({ "Genus": "Brosimum", "Species": "guianense" })
        .orWhere({ "Genus": "Dalbergia", "Species": "melanoxylon" })
        .then(rows => {
             */

  //knex.select().from("materials4").where({ "Genus": "Dalbergia", "Species": "" }).orWhere({ "Genus": "Paubrasilia", "Species": "Echinata" }).then(rows => {
  //knex.select().from("materials4").where({ "Instruments": "violin, viola, cello, double bass" }).then(rows => {
  knex
    .select()
    .from("materials")
    .where({ Genus: "Paubrasilia", Species: "Echinata" })
    .orWhere({ Genus: "Brosimum", Species: "guianense" })
    .orWhere({ Genus: "Dalbergia", Species: "melanoxylon" })
    .orWhere({ Genus: "Betula", Species: "pendula" })
    .orWhere({ Genus: "Dalbergia", Species: "" })
    .orWhere({ Genus: "Calamus", Species: "" })
    .orWhere({ Genus: "Fraxinus", Species: "" })
    .orWhere({ Genus: "Loxodonta", Species: "africana" })
    /* .where({ "Genus": "Betula", "Species": "pendula" }) */
    .then((rows) => {
      res.json(rows);
    });
});

router.put("/saveThreatSignToDB", (req, res) => {
  let genus = req.body.genus;
  let species = req.body.species;
  let signThreats = req.body.signThreats;

  knex("materials4")
    .where({ Genus: genus, Species: species })
    .update(signThreats)
    .then((rows) => {
      res.json(rows);
    });
});

router.get("/getMainParts/:instruments", (req, res) => {
  let instruments = req.params.instruments;
  knex
    .select("Main_part")
    .from("materials")
    .where({ Instruments: instruments })
    .whereNot({ Main_part: "" })
    .groupBy("Main_part")
    .then((rows) => {
      res.json(rows);
    });
});

router.post("/getTreeOccurrences/species", (req, res) => {
  let speciesKeys = req.body;

  knex
    .select()
    .from("treeOccurrences")
    .whereIn("speciesKey", speciesKeys)
    .then((rows) => {
      res.json(rows);
    });
});

router.get("/getTreeOccurrences/genus/:genus", (req, res) => {
  let genus = req.params.genus;
  knex
    .select()
    .from("treeOccurrences")
    .where({ genus: genus })
    .then((rows) => {
      res.json(rows);
    });
});

router.put("/writeJSONFile", (req, res) => {});

module.exports = router;
