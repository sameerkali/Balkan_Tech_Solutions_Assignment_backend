# Crypto Market Tracker API Documentation

## Overview
This API provides real-time and historical cryptocurrency market data from Binance. It supports both REST APIs for historical data and WebSocket connections for real-time trade updates.

## Base URL
```
http://localhost:5000/api
```

## REST API Endpoints

### 1. Get Spot Market OHLCV Data
```http
GET /spot
```

#### Query Parameters
| Parameter | Type   | Required | Description                                    | Example  |
|-----------|--------|----------|------------------------------------------------|----------|
| symbol    | string | Yes      | Trading pair symbol                           | BTCUSDT  |
| interval  | string | Yes      | Candlestick interval                          | 1m       |
| limit     | number | No       | Number of candlesticks (default: 100, max: 1000) | 100    |

#### Supported Intervals
- 1m (1 minute)
- 5m (5 minutes)
- 15m (15 minutes)
- 1h (1 hour)
- 4h (4 hours)
- 1d (1 day)

#### Sample Request
```javascript
const response = await fetch('http://localhost:5000/api/spot?symbol=BTCUSDT&interval=1m&limit=100');
const data = await response.json();
```

#### Sample Response
```json
[
  {
    "timestamp": "2024-02-15T10:00:00.000Z",
    "open": 52145.23,
    "high": 52198.45,
    "low": 52100.12,
    "close": 52180.67,
    "volume": 123.45
  },
  // ... more candles
]
```

### 2. Get Futures Market OHLCV Data
```http
GET /futures
```
(Same parameters and response format as spot endpoint)

## WebSocket Integration

### Connection
The WebSocket server uses Socket.IO for real-time updates.

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
```

### Subscribe to Market Updates
```javascript
// Subscribe to spot market
socket.emit('subscribe', {
  market: 'spot',
  symbol: 'BTCUSDT'
});

// Subscribe to futures market
socket.emit('subscribe', {
  market: 'futures',
  symbol: 'BTCUSDT'
});
```

### Receive Trade Updates
```javascript
socket.on('trade', (data) => {
  console.log(data);
});
```

#### Sample Trade Update
```json
{
  "symbol": "BTCUSDT",
  "price": 52180.67,
  "quantity": 0.12345,
  "timestamp": "2024-02-15T10:00:00.123Z"
}
```

### Unsubscribe from Updates
```javascript
socket.emit('unsubscribe', {
  market: 'spot',
  symbol: 'BTCUSDT'
});
```

## React Implementation Example

### 1. Market Data Hook
```javascript
// hooks/useMarketData.js
import { useState, useEffect } from 'react';

export const useMarketData = (symbol, interval = '1m') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/spot?symbol=${symbol}&interval=${interval}`
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, interval]);

  return { data, loading, error };
};
```

### 2. WebSocket Hook
```javascript
// hooks/useTradeStream.js
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useTradeStream = (market, symbol) => {
  const [trades, setTrades] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('subscribe', { market, symbol });
    });

    socket.on('trade', (trade) => {
      setTrades((prevTrades) => [trade, ...prevTrades].slice(0, 100));
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.emit('unsubscribe', { market, symbol });
      socket.disconnect();
    };
  }, [market, symbol]);

  return { trades, connected };
};
```

### 3. Market Data Component
```javascript
// components/MarketChart.js
import React from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { useTradeStream } from '../hooks/useTradeStream';

const MarketChart = ({ symbol, interval }) => {
  const { data, loading, error } = useMarketData(symbol, interval);
  const { trades, connected } = useTradeStream('spot', symbol);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{symbol} Market Data</h2>
      <div>WebSocket Status: {connected ? 'Connected' : 'Disconnected'}</div>
      
      {/* Historical Data */}
      <div>
        <h3>Historical Data</h3>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {data.map((candle) => (
              <tr key={candle.timestamp}>
                <td>{new Date(candle.timestamp).toLocaleTimeString()}</td>
                <td>{candle.open}</td>
                <td>{candle.high}</td>
                <td>{candle.low}</td>
                <td>{candle.close}</td>
                <td>{candle.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live Trades */}
      <div>
        <h3>Live Trades</h3>
        <ul>
          {trades.map((trade, index) => (
            <li key={index}>
              Price: {trade.price} | Quantity: {trade.quantity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MarketChart;
```

### 4. Usage in App
```javascript
// App.js
import React from 'react';
import MarketChart from './components/MarketChart';

function App() {
  return (
    <div>
      <h1>Crypto Market Tracker</h1>
      <MarketChart symbol="BTCUSDT" interval="1m" />
    </div>
  );
}

export default App;
```

## Error Handling

### HTTP Status Codes
- 200: Successful request
- 400: Bad request (invalid parameters)
- 429: Too many requests
- 500: Server error

### Error Response Format
```json
{
  "error": "Error message here",
  "details": "Additional error details if available"
}
```

## Rate Limiting
- 100 requests per IP address per 15 minutes for REST APIs
- WebSocket connections are limited to 10 concurrent subscriptions per client

## Best Practices
1. Implement error handling for both REST and WebSocket connections
2. Cache historical data when appropriate
3. Implement reconnection logic for WebSocket disconnections
4. Use appropriate intervals based on your use case
5. Unsubscribe from WebSocket feeds when components unmount

## Common Issues and Solutions

### CORS Issues
If you encounter CORS errors, ensure your frontend application is running on an allowed origin (default: http://localhost:3000).

### WebSocket Connection Issues
1. Check if the WebSocket server is running
2. Verify the connection URL
3. Implement reconnection logic
4. Check for firewall restrictions

### Rate Limiting
If you hit rate limits:
1. Implement caching
2. Reduce request frequency
3. Implement exponential backoff

## Support
For issues and feature requests, please create an issue in the GitHub repository.