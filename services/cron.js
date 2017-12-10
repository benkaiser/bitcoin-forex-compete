const later = require('later');
const APIs = require('./apis');
const DB = require('../db');

class Cron {
  start() {
    this.fetchData();
    later.setInterval(this.fetchData.bind(this), later.parse.text('every 1 min'));
  }

  fetchData() {
    APIs.fetch()
    .then((jsonResults) => {
      DB.store(
        jsonResults.bidUSD,
        jsonResults.askUSD,
        jsonResults.bidAUD,
        jsonResults.askAUD,
        jsonResults.exchangeRate
      );
    }).catch((error) => {
      console.log(`failure fetching data at interval: ${Date.now()}`);
      console.log(error);
    });
  }
}

module.exports = new Cron();
