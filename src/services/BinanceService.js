import axios from 'axios';
import config from '../config/config.js';

class BinanceService {
  constructor() {
    this.axios = axios.create({
      baseURL: config.binance.baseUrl,
      headers: {
        'X-MBX-APIKEY': config.binance.apiKey
      }
    });
  }

  async getSpotOHLCV(symbol, interval, limit) {
    try {
      const response = await this.axios.get('/api/v3/klines', {
        params: {
          symbol,
          interval,
          limit
        }
      });

      return this.normalizeOHLCVData(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch Binance spot data: ${error.message}`);
    }
  }

  async getFuturesOHLCV(symbol, interval, limit) {
    try {
      const response = await this.axios.get('/fapi/v1/klines', {
        params: {
          symbol,
          interval,
          limit
        }
      });

      return this.normalizeOHLCVData(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch Binance futures data: ${error.message}`);
    }
  }

  normalizeOHLCVData(data) {
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

export default BinanceService;
