const Promise = require("es6-promise").Promise
const fetch = require('node-fetch');

module.exports = class APIs {
  static fetch() {
    return Promise.all([
      fetch('https://api.fixer.io/latest?base=USD&symbols=AUD'),
      fetch('https://api.gdax.com/products/BTC-USD/ticker'),
      fetch('https://api.independentreserve.com/Public/GetMarketSummary?primaryCurrencyCode=xbt&secondaryCurrencyCode=aud')
    ]).then((results) => Promise.all(results.map((result) => result.json()))
    ).then((jsonResults) => {
      return {
        exchangeRate: jsonResults[0].rates.AUD,
        bidUSD: parseFloat(jsonResults[1].bid),
        askUSD: parseFloat(jsonResults[1].ask),
        bidAUD: jsonResults[2].CurrentHighestBidPrice,
        askAUD: jsonResults[2].CurrentLowestOfferPrice
      };
    }).catch((error) => {
      console.log('Unable to fetch data');
      console.log(error);
      return Promise.reject(error);
    });
  }
}
