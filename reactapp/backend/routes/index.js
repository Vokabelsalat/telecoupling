var express = require('express');
var router = express.Router();

console.log("UI");

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("THERE");

  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/statistics', function (req, res, next) {
  console.log("HERE");

  res.render('statistics.js', { title: 'Express' });
});

module.exports = router;
