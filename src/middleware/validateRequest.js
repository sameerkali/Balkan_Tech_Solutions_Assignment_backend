import { normalizeSymbol, normalizeInterval } from '../utils/exchangeUtils.js';

export const validateMarketRequest = (req, res, next) => {
  const { exchange, symbol, interval, limit } = req.query;

  if (!exchange || !symbol || !interval) {
    return res.status(400).json({
      error: 'Missing required parameters',
      details: 'exchange, symbol, and interval are required'
    });
  }

  const supportedExchanges = ['binance', 'bybit', 'mexc', 'kucoin'];
  if (!supportedExchanges.includes(exchange.toLowerCase())) {
    return res.status(400).json({
      error: 'Invalid exchange',
      details: `Supported exchanges: ${supportedExchanges.join(', ')}`
    });
  }

  const supportedIntervals = ['1m', '5m', '15m', '1h', '4h', '1d'];
  if (!supportedIntervals.includes(interval)) {
    return res.status(400).json({
      error: 'Invalid interval',
      details: `Supported intervals: ${supportedIntervals.join(', ')}`
    });
  }

  // Normalize the request parameters
  req.query.symbol = normalizeSymbol(exchange, symbol);
  req.query.interval = normalizeInterval(exchange, interval);
  req.query.limit = parseInt(limit) || 100;

  next();
};
