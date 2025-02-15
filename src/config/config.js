import dotenv from 'dotenv';
dotenv.config();

const config = {
  app: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  db: {
    mongodb_uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_market',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    }
  },
  exchanges: {
    binance: {
      apiKey: process.env.BINANCE_API_KEY,
      apiSecret: process.env.BINANCE_API_SECRET,
      baseUrl: 'https://api.binance.com',
      wsUrl: 'wss://stream.binance.com:9443/ws',
      futuresWsUrl: 'wss://fstream.binance.com/ws',
      testnet: process.env.BINANCE_TESTNET === 'true'
    },
    bybit: {
      apiKey: process.env.BYBIT_API_KEY,
      apiSecret: process.env.BYBIT_API_SECRET,
      baseUrl: 'https://api.bybit.com',
      wsUrl: 'wss://stream.bybit.com/v5/public/spot',
      futuresWsUrl: 'wss://stream.bybit.com/v5/public/linear',
      testnet: process.env.BYBIT_TESTNET === 'true'
    },
    mexc: {
      apiKey: process.env.MEXC_API_KEY,
      apiSecret: process.env.MEXC_API_SECRET,
      baseUrl: 'https://api.mexc.com',
      wsUrl: 'wss://wbs.mexc.com/ws',
      futuresWsUrl: 'wss://contract.mexc.com/ws'
    },
    kucoin: {
      apiKey: process.env.KUCOIN_API_KEY,
      apiSecret: process.env.KUCOIN_API_SECRET,
      passphrase: process.env.KUCOIN_PASSPHRASE,
      baseUrl: 'https://api.kucoin.com',
      wsUrl: 'wss://ws-api.kucoin.com',
      testnet: process.env.KUCOIN_TESTNET === 'true'
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log'
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300 // 5 minutes in seconds
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT) || 100
  }
};

export default config;

