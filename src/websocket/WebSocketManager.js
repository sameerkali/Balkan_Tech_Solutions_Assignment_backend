import WebSocket from 'ws';
import { Server } from 'socket.io';
import config from '../config/config.js';

class WebSocketManager {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.exchangeWS = new Map();
    this.setupSocketIO();
  }

  setupSocketIO() {
    this.io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('subscribe', ({ exchange, market, symbol }) => {
        this.subscribeToExchange(exchange, market, symbol);
        socket.join(`${exchange}-${market}-${symbol}`);
      });

      socket.on('unsubscribe', ({ exchange, market, symbol }) => {
        socket.leave(`${exchange}-${market}-${symbol}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  subscribeToExchange(exchange, market, symbol) {
    const wsConfig = config.exchanges[exchange];
    const wsKey = `${exchange}-${market}-${symbol}`;

    if (this.exchangeWS.has(wsKey)) return;

    const ws = new WebSocket(wsConfig.wsUrl);

    ws.on('open', () => {
      console.log(`Connected to ${exchange} WebSocket`);
      const subscribeMsg = this.getSubscribeMessage(exchange, market, symbol);
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on('message', (data) => {
      const parsedData = JSON.parse(data);
      const normalizedData = this.normalizeWebSocketData(exchange, parsedData);
      if (normalizedData) {
        this.io.to(wsKey).emit('marketUpdate', normalizedData);
      }
    });

    ws.on('error', (error) => {
      console.error(`${exchange} WebSocket error:`, error);
      this.reconnect(exchange, market, symbol);
    });

    ws.on('close', () => {
      console.log(`${exchange} WebSocket closed`);
      this.reconnect(exchange, market, symbol);
    });

    this.exchangeWS.set(wsKey, ws);
  }

  getSubscribeMessage(exchange, market, symbol) {
    // Exchange-specific subscription messages
    const subscriptions = {
      binance: {
        method: 'SUBSCRIBE',
        params: [`${symbol.toLowerCase()}@trade`],
        id: 1
      },
      bybit: {
        op: 'subscribe',
        args: [`${market}.${symbol}.trade`]
      },
      // Add other exchanges...
    };
    return subscriptions[exchange];
  }

  normalizeWebSocketData(exchange, data) {
    // Normalize WebSocket data from different exchanges
    try {
      const normalizers = {
        binance: (d) => ({
          exchange,
          symbol: d.s,
          price: parseFloat(d.p),
          quantity: parseFloat(d.q),
          timestamp: new Date(d.T)
        }),
        // Add other exchanges...
      };
      return normalizers[exchange](data);
    } catch (error) {
      console.error(`Error normalizing ${exchange} data:`, error);
      return null;
    }
  }

  reconnect(exchange, market, symbol) {
    const wsKey = `${exchange}-${market}-${symbol}`;
    setTimeout(() => {
      console.log(`Reconnecting to ${exchange} WebSocket`);
      this.exchangeWS.delete(wsKey);
      this.subscribeToExchange(exchange, market, symbol);
    }, 5000);
  }
}

export default WebSocketManager;
