import { h, render, Component } from 'preact';
import Data from './data';

export default class ApplicationView extends Component {
  constructor() {
    super();
    this.state = {
      ready: false
    };
    this.getPrice();
    setInterval(this.getPrice.bind(this), 30000);
  }

  render() {
    return (
      <div className='container'>
        <h3>USD -> AUD compared to the current exchange rate</h3>
        { this.state.ready ?
          this.showCalculations() :
          this.showWaiting()
        }
      </div>
    );
  }

  showCalculations() {
    return (
      <div className="row">
        <div className="col-md-6">
          <p>Using Limits</p>
          { this.calculationForItems(this.state.data.bidUSD, this.state.data.askAUD, this.state.data.exchangeRate) }
        </div>
        <div className="col-md-6">
          <p>Using Market Buy</p>
          { this.calculationForItems(this.state.data.askUSD, this.state.data.bidAUD, this.state.data.exchangeRate) }
        </div>
      </div>
    );
  }

  calculationForItems(buy, sell, baselineExchange) {
    var bitcoinExchange = sell / buy;
    var currencyDifference = bitcoinExchange / baselineExchange;
    var percentage = (currencyDifference - 1) * 100;
    var sign = percentage > 0 ? '+' : '-';
    var className = percentage > 0 ? 'text-success' : 'text-danger';
    var percentageString = Math.abs(percentage).toFixed(2);
    return (
      <div>
        <h2 className={className}>{sign}{percentageString}%</h2>
        <p>
          Baseline exchange rate: {baselineExchange.toFixed(4)}<br/>
          Bitcoin exchange rate: {bitcoinExchange.toFixed(4)}
        </p>
      </div>
    );
  }

  showWaiting() {
    return (<p>Loading...</p>);
  }

  getPrice() {
    Data.getPrices().then((data) => {
      this.setState({
        data: data,
        ready: true
      })
    });
  }
}
