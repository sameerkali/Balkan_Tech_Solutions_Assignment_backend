import ExchangeService from '../services/ExchangeService.js';
import { MarketData } from '../models/MarketData.js';

class MarketController {
  static async getSpotOHLCV(req, res) {
    try {
      const { exchange, symbol, interval, limit } = req.query;
      const exchangeService = new ExchangeService(exchange);
      const data = await exchangeService.getSpotOHLCV(symbol, interval, parseInt(limit));
      
      // Store data in MongoDB
      await MarketData.insertMany(
        data.map(candle => ({
          exchange,
          market: 'spot',
          symbol,
          ...candle
        }))
      );

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFuturesOHLCV(req, res) {
    try {
      const { exchange, symbol, interval, limit } = req.query;
      const exchangeService = new ExchangeService(exchange);
      const data = await exchangeService.getFuturesOHLCV(symbol, interval, parseInt(limit));
      
      // Store data in MongoDB
      await MarketData.insertMany(
        data.map(candle => ({
          exchange,
          market: 'futures',
          symbol,
          ...candle
        }))
      );

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default MarketController;

