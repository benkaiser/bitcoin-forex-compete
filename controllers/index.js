const Promise = require("es6-promise").Promise
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/data', (req, res) => {
  Promise.all([
    fetch('https://api.fixer.io/latest?base=USD&symbols=AUD'),
    fetch('https://api.gdax.com/products/BTC-USD/ticker'),
    fetch('https://api.independentreserve.com/Public/GetMarketSummary?primaryCurrencyCode=xbt&secondaryCurrencyCode=aud')
  ]).then((results) => Promise.all(results.map((result) => result.json()))
  ).then((jsonResults) => {
    res.send({
      exchangeRate: 1 / jsonResults[0].rates.AUD,
      bidUSD: parseFloat(jsonResults[1].bid),
      askUSD: parseFloat(jsonResults[1].ask),
      bidAUD: jsonResults[2].CurrentHighestBidPrice,
      askAUD: jsonResults[2].CurrentLowestOfferPrice
    });
  }).catch((error) => {
    console.log(error);
    res.send({ error: error });
  })
});

router.get('*', (req, res) => {
  res.render('index');
});

module.exports = router;
