import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import marketRoutes from './routes/marketRoutes.js';
import WebSocketManager from './websocket/WebSocketManager.js';
import config from './config/config.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req,res) => {
  res.json({'status': 'up and running'})
})
app.use('/api', marketRoutes);

// WebSocket setup
const wsManager = new WebSocketManager(server);

// MongoDB connection
mongoose.connect(config.mongodb_uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;

