import mongoose from 'mongoose';

const marketDataSchema = new mongoose.Schema({
  exchange: {
    type: String,
    required: true,
    enum: ['binance', 'bybit', 'mexc', 'kucoin']
  },
  market: {
    type: String,
    required: true,
    enum: ['spot', 'futures']
  },
  symbol: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number
}, {
  timestamps: true,
  index: { exchange: 1, market: 1, symbol: 1, timestamp: 1 }
});

export const MarketData = mongoose.model('MarketData', marketDataSchema);