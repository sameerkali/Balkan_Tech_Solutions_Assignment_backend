import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details
    });
  }

  if (err.type === 'rate_limit') {
    return res.status(429).json({
      error: 'Too Many Requests',
      details: 'Please try again later'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: config.app.env === 'development' ? err.message : 'Something went wrong'
  });
};

