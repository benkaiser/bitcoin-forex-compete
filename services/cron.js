const later = require('later');
const APIs = require('./apis');
const DB = require('../db');
const PushBullet = require('pushbullet');

class Cron {
  start() {
    this.fetchData();
    this._pushbullet = new PushBullet(process.env.PUSHBULLET_KEY);
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
      this.checkSubscriptions(
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

  checkSubscriptions(bidUSD, askUSD, bidAUD, askAUD, exchangeRate) {
    const diffs = {
      'market': (bidAUD / askUSD / exchangeRate - 1) * 100,
      'limit': (askAUD / bidUSD / exchangeRate - 1) * 100
    };
    DB.getSubscriptions().then((subscriptions) => {
      subscriptions
        .filter((subscription) => (subscription.isHigher && diffs[subscription.type] > subscription.value) ||
                (!subscription.isHigher && diffs[subscription.type] < subscription.value))
        .forEach((subscription) => {
          this._pushbullet.link(
            process.env.PUSHBULLET_DEVICE,
            'Arbitrage Notification',
            process.env.DOMAIN,
            `${diffs['market']}% (${subscription.type}) crossed threshold ${subscription.value}`,
            (error, response) => {
              error && console.log(error);
              console.log(response);
              DB.removeSubscription(subscription);
            }
          );
        });
    });
  }
}

module.exports = new Cron();
