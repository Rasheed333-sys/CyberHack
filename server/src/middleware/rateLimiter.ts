import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Basic abuse protection appropriate for an MVP — not DDoS-grade. Limits
 * requests per IP within a rolling window to reduce accidental floods and
 * casual API-key draining. A dedicated service (e.g. Cloudflare) would be
 * needed for real DDoS protection.
 */
export const chatRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please slow down and try again shortly.',
    },
  },
});

/**
 * Standalone /api/search is cheaper than a full /api/chat turn (no AI
 * call), so it gets a more generous allowance under the same window —
 * still bounded, still per-IP, still MVP-level rather than DDoS-grade.
 */
export const searchRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max * 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please slow down and try again shortly.',
    },
  },
});