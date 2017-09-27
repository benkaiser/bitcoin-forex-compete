export default class Data {
  static getPrices() {
    return fetch('/data')
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
  }
}
