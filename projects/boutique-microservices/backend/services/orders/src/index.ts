import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

dotenv.config();

import { config } from './config/env';
import { orderRoutes } from './routes/orders';
import { connectDB } from './database/connection';
import { metricsMiddleware, setupMetrics } from './metrics';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (config.cors.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '32kb' }));

setupMetrics(app, { serviceName: 'orders', serviceVersion: '1.0.0' });
app.use(metricsMiddleware);

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

app.use('', orderRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[orders] unhandled error:', err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`Orders service listening on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (error) {
    console.error('Failed to start orders service:', error);
    process.exit(1);
  }
};

startServer();
