const Promise = require('es6-promise').Promise
const fetch = require('node-fetch');
const Cache = require('lite-node-cache');

const fixerCache = new Cache({
    ttl: 30000
});

module.exports = class APIs {
  static fetch() {
    return Promise.all([
      fetch('https://api.gdax.com/products/BTC-USD/ticker'),
      fetch('https://api.independentreserve.com/Public/GetMarketSummary?primaryCurrencyCode=xbt&secondaryCurrencyCode=aud')
    ])
    .then((results) => Promise.all(results.map((result) => result.json())))
    .then(([gdax, independentReserve]) => {
      return this.getExchangeRate().then((fixer) => {
        return [fixer, gdax, independentReserve];
      });
    }).then(([fixer, gdax, independentReserve]) => {
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

  static getExchangeRate() {
    const cacheItem = fixerCache.get('fixer');
    if (cacheItem) {
      return Promise.resolve(cacheItem);
    } else {
      return fetch('https://exchangeratesapi.io/api/latest?base=USD&symbols=AUD')
      .then((result) => result.json())
      .then((fixer) => {
        fixerCache.set('fixer', fixer);
        return fixer;
      }).catch((error) => {
        console.log('fixer fetch failed');
        console.log(error);
      });
    }
  }
}
