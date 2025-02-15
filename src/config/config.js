import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongodb_uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_tracker',
  binance: {
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    baseUrl: 'https://api.binance.com',
    wsBaseUrl: 'wss://stream.binance.com:9443/ws',
    futuresWsUrl: 'wss://fstream.binance.com/ws'
  }
};

export default config;

