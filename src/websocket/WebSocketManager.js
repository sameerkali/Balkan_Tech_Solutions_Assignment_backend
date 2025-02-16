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
    this.connections = new Map();
    this.setupSocketIO();
  }

  setupSocketIO() {
    this.io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('subscribe', ({ market, symbol }) => {
        this.subscribeToMarket(market, symbol, socket);
      });

      socket.on('unsubscribe', ({ market, symbol }) => {
        this.unsubscribeFromMarket(market, symbol, socket);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  subscribeToMarket(market, symbol, socket) {
    const wsUrl = market === 'futures' ? config.binance.futuresWsUrl : config.binance.wsBaseUrl;
    const streamName = `${symbol.toLowerCase()}@trade`;
    const connectionKey = `${market}-${symbol}`;

    if (!this.connections.has(connectionKey)) {
      const ws = new WebSocket(`${wsUrl}/${streamName}`);

      ws.on('open', () => {
        console.log(`Connected to Binance ${market} WebSocket for ${symbol}`);
      });

      ws.on('message', (data) => {
        const parsedData = JSON.parse(data);
        const normalizedData = this.normalizeTradeData(parsedData);
        this.io.to(connectionKey).emit('trade', normalizedData);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${connectionKey}:`, error);
        this.reconnect(market, symbol);
      });

      ws.on('close', () => {
        console.log(`WebSocket closed for ${connectionKey}`);
        this.reconnect(market, symbol);
      });

      this.connections.set(connectionKey, ws);
    }

    socket.join(connectionKey);
  }

  unsubscribeFromMarket(market, symbol, socket) {
    const connectionKey = `${market}-${symbol}`;
    socket.leave(connectionKey);

    if (this.io.sockets.adapter.rooms.get(connectionKey)?.size === 0) {
      const ws = this.connections.get(connectionKey);
      if (ws) {
        ws.close();
        this.connections.delete(connectionKey);
      }
    }
  }

  handleDisconnect(socket) {
    console.log('Client disconnected');
    for (const [connectionKey, ws] of this.connections.entries()) {
      if (this.io.sockets.adapter.rooms.get(connectionKey)?.size === 0) {
        ws.close();
        this.connections.delete(connectionKey);
      }
    }
  }

  normalizeTradeData(data) {
    return {
      symbol: data.s,
      price: parseFloat(data.p),
      quantity: parseFloat(data.q),
      timestamp: new Date(data.T)
    };
  }

  reconnect(market, symbol) {
    const connectionKey = `${market}-${symbol}`;
    setTimeout(() => {
      console.log(`Reconnecting to ${connectionKey}`);
      const ws = this.connections.get(connectionKey);
      if (ws) {
        ws.close();
        this.connections.delete(connectionKey);
      }
      if (this.io.sockets.adapter.rooms.get(connectionKey)?.size > 0) {
        this.subscribeToMarket(market, symbol, this.io);
      }
    }, 5000);
  }
}

export default WebSocketManager;
