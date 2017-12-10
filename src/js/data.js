export default class Data {
  static getPrices() {
    return fetch('/latest')
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
  }

  static getHistoric() {
    return fetch('/history')
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
  }
}
