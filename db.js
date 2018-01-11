class DB {
  initialize(dburl) {
    this._db = require('monk')(dburl);
    this._prices = this._db.get('prices');
  }

  store(bidUSD, askUSD, bidAUD, askAUD, exchangeRate) {
    const timestamp = Date.now();
    return this._prices.insert({
      bidUSD,
      askUSD,
      bidAUD,
      askAUD,
      exchangeRate,
      time: timestamp
    }).then(() => {
      console.log(`data stored for ${timestamp}`);
    });
  }

  getHistory(timeframe, intervalSeconds) {
    const intervalMillis = intervalSeconds * 1000;
    const lookupAfter = timeframe ? Date.now() - timeframe * 1000 : Date.now() - 86400000;
    return this._prices.aggregate([
      { $match: {
        time: { $gte: lookupAfter },
        bidUSD: { $ne: NaN },
        askUSD: { $ne: NaN },
        bidAUD: { $ne: NaN },
        askAUD: { $ne: NaN },
        exchangeRate: { $ne: NaN }
      }},
      { $project: {
        _id: true,
        time: true,
        exchangeRate: true,
        diff: {$multiply: [{$subtract: [{$divide: [{$divide: ['$bidAUD', '$askUSD']}, '$exchangeRate']}, 1]}, 100] },
        diffLimit: {$multiply: [{$subtract: [{$divide: [{$divide: ['$askAUD', '$bidUSD']}, '$exchangeRate']}, 1]}, 100] }
      }},
      { $group: {
        _id: { $floor: { $divide: ['$time', intervalMillis] } },
        exchangeRate: { $avg: '$exchangeRate' },
        time: { $avg: '$time' },
        diffMin: { $min: '$diff' },
        diffOpen: { $first: '$diff' },
        diffClose: { $last: '$diff' },
        diffMax: { $max: '$diff' },
        diffLimitMin: { $min: '$diffLimit' },
        diffLimitOpen: { $first: '$diffLimit' },
        diffLimitClose: { $last: '$diffLimit' },
        diffLimitMax: { $max: '$diffLimit' }
        }
      },
      { $sort: { time: 1 } }
    ]);
  }
}

module.exports = new DB();
