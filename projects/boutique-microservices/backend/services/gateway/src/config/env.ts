/**
 * Fail-fast environment validation for the gateway.
 * See backend-shared-README.md for why this file is duplicated per service.
 */

const MIN_SECRET_LENGTH = 32;

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`[config] Required environment variable ${name} is not set.`);
  }
  return value;
}

function requiredSecret(name: string): string {
  const value = required(name);
  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `[config] ${name} must be at least ${MIN_SECRET_LENGTH} characters ` +
        `(got ${value.length}). Generate one with: openssl rand -base64 48`
    );
  }
  if (value.includes('CHANGE_ME') || value === 'your-secret-key') {
    throw new Error(`[config] ${name} still holds a placeholder value.`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : fallback;
}

function optionalInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`[config] ${name} must be an integer, got "${raw}"`);
  }
  return parsed;
}

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',
  // Accept either GATEWAY_PORT or PORT. The old code read only GATEWAY_PORT
  // while every manifest set PORT — it worked purely because the hardcoded
  // fallback happened to match the intended port.
  port: optionalInt('GATEWAY_PORT', optionalInt('PORT', 3001)),

  jwt: {
    accessSecret: requiredSecret('JWT_ACCESS_SECRET'),
    issuer: optional('JWT_ISSUER', 'boutique-auth'),
    audience: optional('JWT_AUDIENCE', 'boutique-api'),
  },

  cors: {
    allowedOrigins: optional('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  rateLimit: {
    windowMs: optionalInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: optionalInt('RATE_LIMIT_MAX_REQUESTS', 100),
    authMax: optionalInt('AUTH_RATE_LIMIT_MAX', 5),
  },

  services: {
    auth: required('AUTH_SERVICE_URL'),
    products: required('PRODUCTS_SERVICE_URL'),
    orders: required('ORDERS_SERVICE_URL'),
    users: required('USERS_SERVICE_URL'),
  },
};
