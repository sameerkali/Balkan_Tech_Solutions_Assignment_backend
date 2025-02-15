import express from 'express';
import MarketController from '../controllers/MarketController.js';

const router = express.Router();

router.get('/spot', MarketController.getSpotOHLCV);
router.get('/futures', MarketController.getFuturesOHLCV);

export default router;