import { h, render, Component } from 'preact';
import { Line as LineChart } from 'react-chartjs-2';
import { Chart } from 'react-google-charts';
import moment from 'moment';

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
          this.showData() :
          this.showWaiting()
        }
      </div>
    );
  }

  showData() {
    return (
      <div>
        { this.showCalculations() }
        { this.showSpreadChart() }
        { this.showCandleStickChart() }
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

  showSpreadChart() {
    const data = {
      labels: this._historicTimestamps(),
      datasets: [
        {
          label: 'Limit Difference',
          borderColor: 'rgba(8, 61, 119, 0.6)',
          backgroundColor: 'rgba(88, 164, 176, 0.6)',
          data: this._limitDifferenceOverTime(),
          fill: false
        },
        {
          label: 'Market Buy Difference',
          borderColor: 'rgba(209, 0, 0, 0.6)',
          data: this._marketDifferenceOverTime(),
          backgroundColor: 'rgba(240, 84, 79, 0.6)',
          fill: false
        }
      ]
    };
    const options = {
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              tooltipFormat: 'h:mm a',
              displayFormats: {
                'minute': 'h:mm a',
                'hour': 'h a'
              }
            }
          }
        ]
      },
      tooltips: {
        mode: 'index',
        intersect: false
      },
      elements: {
        line: {
          tension: 0.2
        },
        point: {
          radius: 2
        }
      }
    };
    return (
      <div className="row">
        <div className="col-md-12">
          <LineChart data={data} options={options} height={200}/>
        </div>
      </div>
    );
  }

  showCandleStickChart() {
    const data = [
      ['Time', 'min', 'opening', 'closing', 'maximum'],
    ];
    this.state.candlestickChartData.map(item => data.push([new Date(item.time), item.diffMin, item.diffOpen, item.diffClose, item.diffMax]));
    console.log(data);
    return (
      <div className="row">
        <div className="col-md-12">
          <Chart
            chartType="CandlestickChart"
            data={data}
            options={{
              legend: 'none',
              bar: { groupWidth: '100%' },
              colors: ['#666'],
              candlestick: {
                fallingColor: { strokeWidth: 0, fill: '#a52714' },
                risingColor: { strokeWidth: 0, fill: '#0f9d58' }
              }
            }}
            graph_id="CandleStickChart"
            width="100%"
            height="400px"
          />
        </div>
      </div>
    );
  }

  calculateDifference(buy, sell, baselineExchange) {
    const bitcoinExchange = sell / buy;
    const currencyDifference = bitcoinExchange / baselineExchange;
    const percentageDifference = (currencyDifference - 1) * 100;
    return {
      bitcoinExchange,
      percentageDifference
    };
  }

  calculationForItems(buy, sell, baselineExchange) {
    const { bitcoinExchange, percentageDifference } = this.calculateDifference(buy, sell, baselineExchange);
    var sign = percentageDifference > 0 ? '+' : '-';
    var className = percentageDifference > 0 ? 'text-success' : 'text-danger';
    var percentageString = Math.abs(percentageDifference).toFixed(2);
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
    Promise.all([
      Data.getPrices(),
      Data.getHistoric(86400, 600),
      Data.getHistoric(86400 * 3, 3600)
    ]).then((results) => {
      this.setState({
        data: results[0],
        lineChartData: results[1],
        candlestickChartData: results[2],
        ready: true
      })
    });
  }

  _historicTimestamps() {
    return this.state.lineChartData.map(item => moment(item.time));
  }

  _limitDifferenceOverTime() {
    return this.state.lineChartData.map(item => {
      return item.diffLimitMin + (item.diffLimitMax - item.diffLimitMin) / 2;
    });
  }

  _marketDifferenceOverTime() {
    return this.state.lineChartData.map(item => {
      return item.diffMin + (item.diffMax - item.diffMin) / 2;
    });
  }
}
