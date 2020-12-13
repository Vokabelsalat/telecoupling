var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const database = require("../database.js");

const knex = require("knex")({
    client: "mysql",
    connection: database.databaseConfig,
});

router.get("/", function (req, res, next) {
    res.send("API is working properly");
});

router.get("/getInstrumentsFromGroup/:selectedGroup", function (req, res, next) {
    let group = req.params.selectedGroup;
    knex.select("Instruments").from('materials4').where("Instrument groups", group).groupBy("Instruments").then(rows => {
        res.end(JSON.stringify(rows));
    });
});

router.get("/getMaterial/:instruments/:mainPart", (req, res) => {
    let instruments = req.params.instruments;
    let mainPart = req.params.mainPart;

    knex.select().from("materials4").where({ "Instruments": instruments, "Main part": mainPart }).then(rows => {
        res.json(rows);
    });
});

router.get("/getTestMaterial", (req, res) => {
    /*  knex.select("Trade_name", "Family", "Genus", "Species", "Main_part", "Subpart", "CITES_regulation").from("materials4").then(rows => {
         res.json(rows);
     }); */

    knex.select().from("materials4").where({ "Genus": "Dalbergia", "Species": " " }).orWhere({ "Genus": "Paubrasilia", "Species": "Echinata" }).then(rows => {
        res.json(rows);
    });
});


router.get("/getMainParts/:instruments", (req, res) => {
    let instruments = req.params.instruments;
    knex.select("Main part").from("materials4").where({ "Instruments": instruments }).whereNot({ "Main part": "" }).groupBy("Main part").then(rows => {
        res.json(rows);
    });
});

router.post("/getTreeOccurrences/species", (req, res) => {
    let speciesKeys = req.body;

    knex.select().from("treeOccurrences").whereIn('speciesKey', speciesKeys).then(rows => {
        res.json(rows);
    });
});

router.get("/getTreeOccurrences/genus/:genus", (req, res) => {
    let genus = req.params.genus;
    knex.select().from("treeOccurrences").where({ "genus": genus }).then(rows => {
        res.json(rows);
    });
});


router.put("/writeJSONFile", (req, res) => {
    console.log("BODY", req.body);

});

module.exports = router;