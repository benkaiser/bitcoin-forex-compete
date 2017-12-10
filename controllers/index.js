const express = require('express');
const router = express.Router();
const APIs = require('../services/apis');
const DB = require('../db');

router.get('/latest', (req, res) => {
  APIs.fetch()
  .then((jsonResults) => {
    res.send(jsonResults);
  })
  .catch((error) => {
    res.send({ error: 'Unable to fetch data, see log' });
  });
});

router.get('/history', (req, res) => {
  DB.getLastDay()
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    console.log('error');
    res.send({ error: 'Unable to fetch datapoints, see log' });
  });
});

router.get('*', (req, res) => {
  res.render('index');
});

module.exports = router;
