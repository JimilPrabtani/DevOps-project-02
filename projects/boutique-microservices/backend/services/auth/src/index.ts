import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';

dotenv.config();

// Imported AFTER dotenv so validation sees the loaded values. This throws and
// kills the process if any secret is missing or weak — by design.
import { config } from './config/env';
import { authRoutes } from './routes/auth';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

const app = express();

// Required so express-rate-limit and req.ip see the real client address
// behind the gateway/ingress rather than rate-limiting the proxy itself.
app.set('trust proxy', 1);

app.use(helmet());

// Explicit CORS allowlist with credentials enabled, so the browser will
// send and store the httpOnly refresh cookie. A wildcard origin is invalid
// in combination with credentials and is rejected here.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // same-origin / server-to-server
      if (config.cors.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Bound body size — the default 100kb is fine, but being explicit stops a
// future change from silently allowing multi-megabyte JSON payloads.
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

setupMetrics(app, { serviceName: 'auth', serviceVersion: '1.0.0' });
app.use(metricsMiddleware);

// Brute-force protection. The old service had none: an attacker could try
// unlimited passwords against /login at full speed.
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/refresh', authLimiter);

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

app.use('', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler. In production the stack trace is logged but never returned —
// NODE_ENV was previously "development" in every deployment, which leaked
// internal paths and library versions to clients.
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[auth] unhandled error:', err);
    if (config.isProduction) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(500).json({ error: 'Internal server error', detail: err?.message });
    }
  }
);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`Auth service listening on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (error) {
    console.error('Failed to start auth service:', error);
    process.exit(1);
  }
};

startServer();
