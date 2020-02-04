const csv = require('csv-parser')
const fs = require('fs')
const mysql = require('mysql');
const utils = require('../public/js/utils.js');
const database = require('../database.js');

function createInsertQeury(data, columnsString, table) {

    let splitColumns = columnsString.split(",");

    let values = "";
    for (let col of splitColumns.values()) {
        col = col.trim().replaceAll("`", "");
        values += "'" + data[col].replaceAll("'", "`") + "',";
    }

    values = values.substring(0, values.lastIndexOf(","));

    let query = "INSERT INTO `" + table + "` (" + columnsString + ") VALUES (" + values + ")";

    return query;
}

function processFile(filename) {
    const results = [];
    var count = 0;

    console.log(filename);

    let infotext = filename;

    fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (data) => { data.Kingdom !== "Animalia" ? results.push(data) : {}; })
        .on('end', () => {
            console.log(results.length);
            for (let row of results.values()) {
                let query = createInsertQeury(row, "`Id`, `Kingdom`, `Phylum`, `Class`, `Order`, `Family`, `Genus`, `Species`, `Subspecies`, `Scientific Name`, `Author`, `Rank`, `Listing`, `Party`, `Listed under`, `Full note`, `# Full note`, `All_DistributionFullNames`, `All_DistributionISOCodes`, `NativeDistributionFullNames`, `Introduced_Distribution`, `Introduced(?)_Distribution`, `Reintroduced_Distribution`, `Extinct_Distribution`, `Extinct(?)_Distribution`, `Distribution_Uncertain`", "species");

                db.query(query, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("INSERT");
                    }
                });
            }
        });
}

const db = mysql.createConnection(database.databaseConfig);

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

processFile("./data/species.csv");