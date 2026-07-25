import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

// Imported after dotenv so validation sees loaded values; throws on boot if
// JWT_ACCESS_SECRET or any service URL is missing.
import { config } from './config/env';
import { metricsMiddleware, setupMetrics } from './metrics';
import {
  requireAuth,
  optionalAuth,
  requireRole,
  stripClientIdentityHeaders,
} from './middleware/auth';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    // The gateway serves JSON only; a restrictive CSP costs nothing here.
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    },
    hsts: config.isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// Explicit origin allowlist. Previously `cors()` with no options replied
// `Access-Control-Allow-Origin: *`, letting any website on the internet call
// this API from a logged-in user's browser.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (config.cors.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// MUST run before any route: removes client-supplied identity headers so they
// cannot be spoofed. Only the gateway may set x-user-*.
app.use(stripClientIdentityHeaders);

setupMetrics(app, { serviceName: 'gateway', serviceVersion: '1.0.0' });
app.use(metricsMiddleware);

const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count toward the limit
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

app.use(globalLimiter);

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

const proxyDefaults = {
  changeOrigin: true,
  xfwd: true,
  proxyTimeout: 10_000,
  timeout: 10_000,
  onError(err: Error, _req: express.Request, res: any) {
    console.error('[gateway] upstream error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Upstream service unavailable' });
    }
  },
};

// ---------------------------------------------------------------------------
// PUBLIC — no token required
// ---------------------------------------------------------------------------

// Auth endpoints must stay public (you cannot present a token before you have
// one). Rate limited aggressively instead.
app.use(
  '/api/auth',
  authLimiter,
  createProxyMiddleware({
    ...proxyDefaults,
    target: config.services.auth,
    pathRewrite: { '^/api/auth': '' },
  })
);

// Product browsing is public, but identity is attached when available so the
// catalogue can personalise later without another round trip.
app.use(
  '/api/products',
  optionalAuth,
  createProxyMiddleware({
    ...proxyDefaults,
    target: config.services.products,
    pathRewrite: { '^/api/products': '' },
  })
);

// ---------------------------------------------------------------------------
// PROTECTED — a valid access token is mandatory
// ---------------------------------------------------------------------------

// Order status changes are an operator action, not a customer one. Previously
// ANY unauthenticated caller could mark ANY order as shipped.
app.patch(
  '/api/orders/:id/status',
  requireAuth,
  requireRole('admin'),
  createProxyMiddleware({
    ...proxyDefaults,
    target: config.services.orders,
    pathRewrite: { '^/api/orders': '' },
  })
);

app.use(
  '/api/orders',
  requireAuth,
  createProxyMiddleware({
    ...proxyDefaults,
    target: config.services.orders,
    pathRewrite: { '^/api/orders': '' },
  })
);

app.use(
  '/api/users',
  requireAuth,
  createProxyMiddleware({
    ...proxyDefaults,
    target: config.services.users,
    pathRewrite: { '^/api/users': '' },
  })
);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[gateway] unhandled error:', err);
    if (res.headersSent) return;
    res.status(500).json({ error: 'Internal server error' });
  }
);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`API Gateway listening on port ${config.port} [${config.nodeEnv}]`);
  console.log('Upstreams:', config.services);
});
