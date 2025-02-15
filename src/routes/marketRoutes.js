import express from 'express';
import MarketController from '../controllers/MarketController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.get('/spot', apiLimiter, MarketController.getSpotOHLCV);
router.get('/futures', apiLimiter, MarketController.getFuturesOHLCV);

export default router;
