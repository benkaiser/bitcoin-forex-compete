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
    const fiveMinutes = 300000;
    return this._prices.aggregate([
      { $match: { time: { $gte: aDayAgo } } },
      { $group: {
        _id: { $floor: { $divide: ['$time', fiveMinutes] } },
        bidUSD: { $first: '$bidUSD' },
        askUSD: { $first: '$askUSD' },
        bidAUD: { $first: '$bidAUD' },
        askAUD: { $first: '$askAUD' },
        exchangeRate: { $first: '$exchangeRate' },
        time: { $first: '$time' },
        }
      },
      { $sort: { time: 1 } }
    ]);
  }
}

module.exports = new DB();
