import { h, render, Component } from 'preact';
import { Line as LineChart } from 'react-chartjs-2';
import { Chart } from 'react-google-charts';
import moment from 'moment';

import Data from './data';

export default class ApplicationView extends Component {
  constructor() {
    super();
    this.state = {
      fastUpdates: false,
      ready: false,
      candlestickIsMarket: true,
      timeframe: 'day'
    };
    this.getPrice();
    this._updateRefreshTimer();
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
        <div className="col-md-12">
          <div className="btn btn-default" onCLick={this._changeTimeframe.bind(this, 'day')}>1 day</div>
          <div className="btn btn-default" onCLick={this._changeTimeframe.bind(this, '3day')}>3 days</div>
          <div className="btn btn-default" onCLick={this._changeTimeframe.bind(this, 'week')}>7 days</div>
          <div className="btn btn-default" onCLick={this._changeTimeframe.bind(this, 'month')}>30 days</div>
          <div className="btn btn-default" onCLick={this._changeRefreshSpeed.bind(this)}>{this.state.fastUpdates ? 'Fast Updates' : 'Slow Updates'}</div>
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
    this.state.candlestickChartData.map(item => data.push([
      new Date(item.time),
      this.state.candlestickIsMarket ? item.diffMin : item.diffLimitMin,
      this.state.candlestickIsMarket ? item.diffOpen : item.diffLimitOpen,
      this.state.candlestickIsMarket ? item.diffClose : item.diffLimitClose,
      this.state.candlestickIsMarket ? item.diffMax : item.diffLimitMax
    ]));
    return (
      <div className="row">
        <div className="col-md-12">
          <h4>CandleStick - {this.state.candlestickIsMarket ? 'Market' : 'Limit'} Data</h4>
          <div className="btn btn-default" onClick={this._changeChartType.bind(this)}>Switch Chart Type</div>
          <Chart
            chartType="CandlestickChart"
            data={data}
            loader={<div></div>}
            options={{
              chartArea: { left: '5%', top: '5%', width: '90%', height: '90%'},
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

  _changeChartType() {
    this.setState({
      candlestickIsMarket: !this.state.candlestickIsMarket
    });
  }

  _changeTimeframe(timeframe) {
    this.setState({
      timeframe: timeframe
    });
    this.getPrice(timeframe);
  }

  _changeRefreshSpeed() {
    this.setState({
      fastUpdates: !this.state.fastUpdates
    });
    this._updateRefreshTimer();
  }

  _updateRefreshTimer() {
    this.updateInterval && clearInterval(this.updateInterval);
    this.updateInterval = setInterval(this.getPrice.bind(this), this.state.fastUpdates ? 1000 : 30000);
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

  getPrice(timeframe) {
    const daySeconds = 86400;
    const tenMinutesSeconds = 600;
    const hourSeconds = 3600;
    let timeframes = {
      'day': { period: daySeconds, smallInterval: tenMinutesSeconds, largeInterval: hourSeconds },
      '3day': { period: daySeconds * 3, smallInterval: tenMinutesSeconds * 3, largeInterval: hourSeconds * 3 },
      'week': { period: daySeconds * 7, smallInterval: hourSeconds, largeInterval: hourSeconds * 3 },
      'month': { period: daySeconds * 30, smallInterval: hourSeconds * 6, largeInterval: daySeconds }
    };
    const chosenPeriod = timeframes[timeframe] || timeframes[this.state.timeframe];
    Promise.all([
      Data.getPrices(),
      Data.getHistoric(chosenPeriod.period, chosenPeriod.smallInterval),
      Data.getHistoric(chosenPeriod.period, chosenPeriod.largeInterval)
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
      return (item.diffLimitMin + (item.diffLimitMax - item.diffLimitMin) / 2).toFixed(2);
    });
  }

  _marketDifferenceOverTime() {
    return this.state.lineChartData.map(item => {
      return (item.diffMin + (item.diffMax - item.diffMin) / 2).toFixed(2);
    });
  }
}
