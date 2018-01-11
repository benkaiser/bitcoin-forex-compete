export default class Data {
  static getPrices() {
    return fetch('/latest')
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
  }

  static getHistoric(timeframe, interval) {
    return fetch(`/history?timeframe=${timeframe}&interval=${interval}`)
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
  }
}
