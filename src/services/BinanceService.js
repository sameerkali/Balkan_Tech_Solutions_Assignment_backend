import axios from 'axios';
import crypto from 'crypto';

class BinanceService {
  constructor() {
    this.spotBaseURL = 'https://api.binance.com';
    this.futuresBaseURL = 'https://fapi.binance.com';
    this.testBaseURL = 'https://testnet.binance.vision';

    const useTestnet = process.env.USE_TESTNET === 'true';
    this.spotAPI = useTestnet ? this.testBaseURL : this.spotBaseURL;
    this.futuresAPI = this.futuresBaseURL;

    this.spotAxios = axios.create({
      baseURL: this.spotAPI,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': process.env.BINANCE_API_KEY
      }
    });

    this.futuresAxios = axios.create({
      baseURL: this.futuresAPI,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': process.env.BINANCE_API_KEY
      }
    });

    this.spotAxios.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );

    this.futuresAxios.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          throw new Error('Unauthorized: Please check your API keys');
        case 403:
          throw new Error("Forbidden: You don't have permission to access this resource");
        case 429:
          throw new Error('Rate limit exceeded. Please try again later');
        case 451:
          throw new Error('Request unavailable for legal reasons. Try using testnet');
        default:
          throw new Error(`Binance API error: ${data.msg || 'Unknown error'}`);
      }
    }
    throw error;
  }

  generateSignature(queryString) {
    return crypto
      .createHmac('sha256', process.env.BINANCE_API_SECRET)
      .update(queryString)
      .digest('hex');
  }

  signRequest(params = {}) {
    const timestamp = Date.now();
    const queryString = Object.entries({ ...params, timestamp })
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const signature = this.generateSignature(queryString);
    return `${queryString}&signature=${signature}`;
  }

  async getSpotOHLCV(symbol, interval, limit = 100) {
    try {
      const response = await this.spotAxios.get('/api/v3/klines', {
        params: { symbol: symbol.toUpperCase(), interval, limit }
      });
      return this.normalizeOHLCVData(response.data);
    } catch (error) {
      console.error('Spot OHLCV Error:', error);
      throw new Error(`Failed to fetch Binance spot data: ${error.message}`);
    }
  }

  async getFuturesOHLCV(symbol, interval, limit = 100) {
    try {
      const response = await this.futuresAxios.get('/fapi/v1/klines', {
        params: { symbol: symbol.toUpperCase(), interval, limit }
      });
      return this.normalizeOHLCVData(response.data);
    } catch (error) {
      console.error('Futures OHLCV Error:', error);
      throw new Error(`Failed to fetch Binance futures data: ${error.message}`);
    }
  }

  async getCurrentPrice(symbol, isFutures = false) {
    try {
      const api = isFutures ? this.futuresAxios : this.spotAxios;
      const response = await api.get('/api/v3/ticker/price', {
        params: { symbol: symbol.toUpperCase() }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Current Price Error:', error);
      throw new Error(`Failed to fetch current price: ${error.message}`);
    }
  }

  async get24hTicker(symbol, isFutures = false) {
    try {
      const api = isFutures ? this.futuresAxios : this.spotAxios;
      const response = await api.get('/api/v3/ticker/24hr', {
        params: { symbol: symbol.toUpperCase() }
      });
      return this.normalize24hData(response.data);
    } catch (error) {
      console.error('24h Ticker Error:', error);
      throw new Error(`Failed to fetch 24h ticker: ${error.message}`);
    }
  }

  normalizeOHLCVData(data) {
    return data.map(candle => ({
      timestamp: new Date(candle[0]),
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
      closeTime: new Date(candle[6]),
      quoteVolume: parseFloat(candle[7]),
      trades: parseInt(candle[8]),
      buyBaseVolume: parseFloat(candle[9]),
      buyQuoteVolume: parseFloat(candle[10])
    }));
  }

  normalize24hData(data) {
    return {
      symbol: data.symbol,
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      weightedAvgPrice: parseFloat(data.weightedAvgPrice),
      prevClosePrice: parseFloat(data.prevClosePrice),
      lastPrice: parseFloat(data.lastPrice),
      lastQty: parseFloat(data.lastQty),
      bidPrice: parseFloat(data.bidPrice),
      askPrice: parseFloat(data.askPrice),
      openPrice: parseFloat(data.openPrice),
      highPrice: parseFloat(data.highPrice),
      lowPrice: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
      quoteVolume: parseFloat(data.quoteVolume),
      openTime: new Date(data.openTime),
      closeTime: new Date(data.closeTime),
      count: parseInt(data.count)
    };
  }

  static validateInterval(interval) {
    const validIntervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
    if (!validIntervals.includes(interval)) {
      throw new Error(`Invalid interval. Valid intervals are: ${validIntervals.join(', ')}`);
    }
    return interval;
  }
}

export default BinanceService;
