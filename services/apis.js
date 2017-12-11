const Promise = require("es6-promise").Promise
const fetch = require('node-fetch');

module.exports = class APIs {
  static fetch() {
    return Promise.all([
      fetch('https://api.fixer.io/latest?base=USD&symbols=AUD'),
      fetch('https://api.gdax.com/products/BTC-USD/ticker'),
      fetch('https://api.independentreserve.com/Public/GetMarketSummary?primaryCurrencyCode=xbt&secondaryCurrencyCode=aud')
    ]).then((results) => Promise.all(results.map((result) => result.json()))
  ).then(([fixer, gdax, independentReserve]) => {
      if (!fixer.rates.AUD ||
        !gdax.bid ||
        !gdax.ask ||
        !independentReserve.CurrentHighestBidPrice ||
        !independentReserve.CurrentLowestOfferPrice) {
        console.log([fixer, gdax, independentReserve]);
        return Promise.reject(new Error('One of the API calls failed'));
      }
      return {
        exchangeRate: fixer.rates.AUD,
        bidUSD: parseFloat(gdax.bid),
        askUSD: parseFloat(gdax.ask),
        bidAUD: independentReserve.CurrentHighestBidPrice,
        askAUD: independentReserve.CurrentLowestOfferPrice
      };
    }).catch((error) => {
      console.log('Unable to fetch data');
      console.log(error);
      return Promise.reject(error);
    });
  }
}
