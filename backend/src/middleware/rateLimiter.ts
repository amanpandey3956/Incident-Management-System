import rateLimit from 'express-rate-limit';

export const signalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '60 seconds',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
