const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const request = require('ajax-request');
global.request = request;
const app = express();
const database = require("./database.js");
const utils = require("./public/js/utils.js");

const { getHomePage, getMainPart, getMaterial, getSynonyms, getTrade, queryGBIF, queryGBIFspecies, queryIUCN, queryTreeSearchSpecies, queryTreeSearchSpeciesWithSciName, queryThreatSearchWithSciName } = require('./routes/index');
const { getSpecies, searchSpeciesNotes, searchSpeciesNotesPage } = require('./routes/species');
/*const {addPlayerPage, addPlayer, deletePlayer, editPlayer, editPlayerPage} = require('./routes/player');*/
const port = 5000;

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
global.db = db;

global.knex = require('knex')({
    client: 'mysql',
    connection: database.databaseConfig
});

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

// routes for the app

app.get('/', getHomePage);
app.get('/:selectedInstruments', getHomePage);
app.post('/getMainPart/:instruments', getMainPart);
app.post('/getMaterial/:instruments/:mainPart', getMaterial);
app.post('/getSpecies/:family/:genus/:species', getSpecies);
app.post('/getSynonyms/:word', getSynonyms);
app.post('/getTrade/:taxon', getTrade);
app.post('/searchSpeciesNotes/:word', searchSpeciesNotes);
app.get('/searchSpeciesNotes/:word', searchSpeciesNotesPage);
app.post('/queryIUCN/:species', queryIUCN);
app.post('/queryGBIF/:taxonKey', queryGBIF);
app.post('/queryGBIFspecies/:word', queryGBIFspecies);
app.post('/queryTreeSearchSpecies/:genus/:species', queryTreeSearchSpecies);
app.post('/queryTreeSearchSpeciesWithSciName/:name', queryTreeSearchSpeciesWithSciName);
app.post('/queryThreatSearchWithSciName/:name', queryThreatSearchWithSciName);
/*app.get('/add', addPlayerPage);
app.get('/edit/:id', editPlayerPage);
app.get('/delete/:id', deletePlayer);
app.post('/add', addPlayer);
app.post('/edit/:id', editPlayer);
*/

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});