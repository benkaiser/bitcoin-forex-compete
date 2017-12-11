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

  getLastDay() {
    const aDayAgo = Date.now() - 86400000;
    const tenMinutes = 600000;
    return this._prices.aggregate([
      { $match: {
        time: { $gte: aDayAgo },
        bidUSD: { $ne: NaN },
        askUSD: { $ne: NaN },
        bidAUD: { $ne: NaN },
        askAUD: { $ne: NaN },
        exchangeRate: { $ne: NaN }
      }},
      { $group: {
        _id: { $floor: { $divide: ['$time', tenMinutes] } },
        bidUSD: { $avg: '$bidUSD' },
        askUSD: { $avg: '$askUSD' },
        bidAUD: { $avg: '$bidAUD' },
        askAUD: { $avg: '$askAUD' },
        exchangeRate: { $avg: '$exchangeRate' },
        time: { $avg: '$time' },
        }
      },
      { $sort: { time: 1 } }
    ]);
  }
}

module.exports = new DB();
