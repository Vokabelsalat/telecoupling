const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const fs = require("fs");
const request = require("ajax-request");
global.request = request;
const app = express();
const database = require("./database.js");
//const variables = require("./variables.js");
const utils = require("./public/js/utils.js");

const {
  getHomePage,
  getMainPart,
  getMaterial,
  getAllMaterials,
  getAllSpecies,
  getSynonyms,
  queryIUCN,
  requestMapboxToken,
  getCountriesGeoJSON,
  getMusicalChairs,
  processMusicalChairs,
  getInstrumentsFromGroup,
  getTimeline,
  queryGenusAnnotations
} = require("./routes/index");
const {
  getTrade,
  getTradeByGenus,
  getListingHistory,
  getListingHistoryByGenus,
} = require("./routes/cites");
const {
  queryGBIF,
  queryGBIFspecies,
  queryGBIFspeciesByGenus,
  queryGBIFchildren,
  queryGBIFsynonyms,
  queryGBIFGenusKeyBySpeciesName,
} = require("./routes/gbif");
const {
  queryTreeSearchSpecies,
  queryTreeSearchSpeciesWithSciName,
  queryThreatSearchWithSciName,
  queryBGCITreeSearchByGenus,
  queryBGCIThreatSearchByGenus,
  queryCountriesForNationalRedList,
} = require("./routes/bgci");
const {
  getSpecies,
  searchSpeciesNotes,
  searchSpeciesNotesPage,
  getSpeciesJustGenus,
} = require("./routes/species");
/*const {addPlayerPage, addPlayer, deletePlayer, editPlayer, editPlayerPage} = require('./routes/player');*/
const port = 8080;

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection(database.databaseConfig);
//global.variables = variables.variables;

/* let rawdata = fs.readFileSync("./public/locations.json");
global.musicalChairsLocations = JSON.parse(rawdata); */

// connect to database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});
global.db = db;

global.knex = require("knex")({
  client: "mysql",
  connection: database.databaseConfig,
});

// configure middleware
app.set("port", process.env.port || port); // set express to use this port
app.set("views", __dirname + "/views"); // set express to look in this folder to render our view
app.set("view engine", "ejs"); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, "public"))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

// routes for the app

app.get("/", getHomePage);
app.get("/timeline", getTimeline);
app.post("/group/:selectedGroup", getInstrumentsFromGroup);
app.post("/getMainPart/:instruments", getMainPart);
app.post("/getMaterial/:instruments/:mainPart", getMaterial);
app.post("/getAllMaterials", getAllMaterials);
app.post("/getAllSpecies", getAllSpecies);
app.post("/getSpecies/:scientificName", getSpecies);
app.post("/getSpeciesJustGenus/:genus", getSpeciesJustGenus);
app.post("/getSynonyms/:word", getSynonyms);
app.post("/getTrade/:taxon", getTrade);
app.post("/getListingHistory/:scientificName", getListingHistory);
app.post("/getListingHistoryByGenus/:genus", getListingHistoryByGenus);
app.post("/getTradeByGenus/:genus", getTradeByGenus);
app.post("/searchSpeciesNotes/:word", searchSpeciesNotes);
app.get("/searchSpeciesNotes/:word", searchSpeciesNotesPage);
app.post("/queryIUCN/:species", queryIUCN);
app.post("/queryGBIF/:taxonKey", queryGBIF);
app.post("/queryGBIFspeciesByGenus/:genus", queryGBIFspeciesByGenus);
//app.post("/queryGBIFchildren/:genusKey", queryGBIFchildren);
app.post("/queryGBIFchildren/:genusKey/:offset", queryGBIFchildren);
app.post("/queryGBIFsynonyms/:taxonKey", queryGBIFsynonyms);
app.post("/queryGBIFspecies/:word", queryGBIFspecies);
app.post("/queryGBIFGenusKeyBySpeciesName/:genus", queryGBIFGenusKeyBySpeciesName);
app.post("/queryTreeSearchSpecies/:genus/:species", queryTreeSearchSpecies);
app.post("/queryTreeSearchSpeciesWithSciName/:name", queryTreeSearchSpeciesWithSciName);
app.post("/queryThreatSearchWithSciName/:name", queryThreatSearchWithSciName);
app.post("/queryBGCITreeSearchByGenus/:genus", queryBGCITreeSearchByGenus);
app.post("/queryBGCIThreatSearchByGenus/:genus", queryBGCIThreatSearchByGenus);
app.post("/requestMapboxToken", requestMapboxToken);
app.post("/getCountriesGeoJSON", getCountriesGeoJSON);
app.post("/queryCountriesForNationalRedList", queryCountriesForNationalRedList);
app.post("/queryGenusAnnotations/:genus", queryGenusAnnotations);
/*app.post('/getMusicalChairs', getMusicalChairs);*/
/*app.get('/processMusicalChairs', processMusicalChairs);*/
/*app.get('/add', addPlayerPage);
app.get('/edit/:id', editPlayerPage);
app.get('/delete/:id', deletePlayer);
app.post('/add', addPlayer);
app.post('/edit/:id', editPlayer);
*/
app.get("/:selectedInstruments/:selectedMainPart", getHomePage);
app.get("/:selectedInstruments", getHomePage);

// set the app to listen on the port
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
