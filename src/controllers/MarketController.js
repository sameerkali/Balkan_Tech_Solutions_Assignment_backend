import BinanceService from '../services/BinanceService.js';
import { MarketData } from '../models/MarketData.js';

const binanceService = new BinanceService();

class MarketController {
  static async getSpotOHLCV(req, res) {
    try {
      const { symbol, interval, limit = 100 } = req.query;
      const data = await binanceService.getSpotOHLCV(symbol, interval, parseInt(limit));
      
      // Store data in MongoDB
      await MarketData.insertMany(
        data.map(candle => ({
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
      const { symbol, interval, limit = 100 } = req.query;
      const data = await binanceService.getFuturesOHLCV(symbol, interval, parseInt(limit));
      
      // Store data in MongoDB
      await MarketData.insertMany(
        data.map(candle => ({
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
