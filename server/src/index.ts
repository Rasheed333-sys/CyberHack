import express from 'express';
import cors from 'cors';
import { config } from './config';
import { securityHeaders } from './middleware/security';
import { chatRateLimiter, searchRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { chatRouter } from './routes/chat';
import { searchRouter } from './routes/search';

const app = express();

app.disable('x-powered-by');
app.use(securityHeaders);

// Dev-only localhost origins, always allowed in addition to configured
// production origins — never used to widen access in production itself.
const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (curl, server-to-server, same-origin) — allow.
      if (!origin) {
        callback(null, true);
        return;
      }
      const allowed =
        config.nodeEnv === 'production' ? config.allowedOrigins : [...config.allowedOrigins, ...DEV_ORIGINS];
      if (allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  }),
);

app.use(express.json({ limit: config.limits.maxBodyBytes }));

app.use('/api', healthRouter);
app.use('/api', chatRateLimiter, chatRouter);
app.use('/api', searchRateLimiter, searchRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[cyberhack-api] listening on port ${config.port} — AI: ${config.useMockAI ? 'MOCK' : 'LIVE (groq)'}, ` +
      `search: ${config.useMockSearch ? 'MOCK' : 'LIVE (tavily)'}`,
  );
});