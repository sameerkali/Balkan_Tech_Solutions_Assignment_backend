import axios from 'axios';
import config from '../config/config.js';

class ExchangeService {
  constructor(exchange) {
    this.exchange = exchange;
    this.config = config.exchanges[exchange];
    this.axios = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'X-API-KEY': this.config.apiKey
      }
    });
  }

  async getSpotOHLCV(symbol, interval, limit) {
    try {
      const endpoints = {
        binance: `/api/v3/klines`,
        bybit: `/v5/market/kline`,
        mexc: `/api/v3/klines`,
        kucoin: `/api/v1/market/candles`
      };

      const response = await this.axios.get(endpoints[this.exchange], {
        params: {
          symbol,
          interval,
          limit
        }
      });

      return this.normalizeOHLCVData(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch ${this.exchange} spot data: ${error.message}`);
    }
  }

  async getFuturesOHLCV(symbol, interval, limit) {
    try {
      const endpoints = {
        binance: `/fapi/v1/klines`,
        bybit: `/v5/market/kline`,
        mexc: `/api/v3/klines`,
        kucoin: `/api/v1/market/candles`
      };

      const response = await this.axios.get(endpoints[this.exchange], {
        params: {
          symbol,
          interval,
          limit,
          category: 'linear'
        }
      });

      return this.normalizeOHLCVData(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch ${this.exchange} futures data: ${error.message}`);
    }
  }

  normalizeOHLCVData(data) {
    // Normalize data format across different exchanges
    return data.map(candle => ({
      timestamp: new Date(candle[0]),
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
  }
}

export default ExchangeService;
