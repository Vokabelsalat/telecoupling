const csv = require('csv-parser');
const fs = require('fs');
const mysql = require('mysql');
var MySql = require('sync-mysql');
const utils = require('../../public/js/utils.js');
const database = require('../../database.js');

const path = require('path');

var connection = new MySql(database.databaseConfig);

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection(database.databaseConfig);

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

let globfiles = [];
let fileindex = 0;

function scanFiles() {
    //joining path of directory 
    const directoryPath = path.join(__dirname, './data/tradeDB');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file) {
            if (file.indexOf(".csv") > 0) {
                globfiles.push("./data/tradeDB/" + file);
                /*processFile("./data/tradeDB/"+file);*/
            }
        });
        next();
    });
}

function next() {
    console.log("NEXT");
    if (fileindex < globfiles.length) {
        processFile(globfiles[fileindex]);
        fileindex++;
    }
}

function createInsertQuery(data, columnsString, table) {

    let splitColumns = columnsString.split(",");

    let values = [];
    for (let col of splitColumns.values()) {
        col = col.trim().replaceAll("`", "");
        values.push(data[col].replaceAll("'", "`"));
    }

    return values;
}

function insert(ofg, row) {
    let order = row.Order;
    let family = row.Family;
    let genus = row.Genus;

    if (row.Class === "") {
        return createInsertQuery(row, "`Year`, `Appendix`, `Taxon`, `Class`, `Order`, `Family`, `Genus`, `Term`, `Quantity`, `Unit`, `Importer`, `Exporter`, `Origin`, `Purpose`, `Source`, `Reporter.type`, `Import.permit.RandomID`, `Export.permit.RandomID`, `Origin.permit.RandomID`", "trade");
    }
    return null;
}

function fire(vals, nextbool) {
    if (vals.length > 0) {
        db.query("INSERT INTO `" + "trade" + "` (" + "`Year`, `Appendix`, `Taxon`, `Class`, `Order`, `Family`, `Genus`, `Term`, `Quantity`, `Unit`, `Importer`, `Exporter`, `Origin`, `Purpose`, `Source`, `Reporter.type`, `Import.permit.RandomID`, `Export.permit.RandomID`, `Origin.permit.RandomID`" + ") VALUES ?", [vals], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("DONE", vals.length);
                if (nextbool)
                    next();
            }
        });
    }
}

function processFile(filename) {

    const results = [];

    console.log(filename);

    let infotext = filename;

    let bulkValues = [];

    let query = "SELECT `Order`, `Family`, `Genus` FROM `species`";
    const ofg = connection.query(query);

    fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (data) => { results.push(data); })
        .on('end', () => {

            for (let index = 0; index < results.length; index++) {
                let ret = insert(ofg, results[index]);
                if (ret !== null) {
                    bulkValues.push(ret);
                }

                if (index > 0 && index % 8000 === 0) {
                    const newBulks = bulkValues.map(e => e);
                    console.log("INSERT " + newBulks.length);
                    fire(newBulks);
                    bulkValues = [];
                }
            }

            const newBulks = bulkValues.map(e => e);
            console.log("INSERT " + newBulks.length);
            fire(newBulks, true);
            bulkValues = [];
        });
}

scanFiles();