/**
 * Fail-fast environment validation.
 *
 * WHY: the previous code used `process.env.JWT_SECRET || 'your-secret-key'`.
 * Because JWT_SECRET was never actually set in any manifest, the hardcoded
 * fallback was what ran in production — meaning anyone who read the source
 * could forge tokens. Silent fallbacks for secrets are the bug.
 *
 * This module throws on boot if anything is missing or weak. A service that
 * refuses to start is infinitely safer than one running on a known secret.
 */

const MIN_SECRET_LENGTH = 32;

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `[config] Required environment variable ${name} is not set. ` +
        `Copy .env.example to .env and populate it.`
    );
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
    throw new Error(
      `[config] ${name} still holds a placeholder value. Set a real secret.`
    );
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

const accessSecret = requiredSecret('JWT_ACCESS_SECRET');
const refreshSecret = requiredSecret('JWT_REFRESH_SECRET');

// Reusing one secret for both token types lets an attacker present a
// long-lived refresh token wherever an access token is accepted.
if (accessSecret === refreshSecret) {
  throw new Error(
    '[config] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values.'
  );
}

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',
  port: optionalInt('PORT', 3002),

  databaseUrl: required('DATABASE_URL'),

  jwt: {
    accessSecret,
    refreshSecret,
    accessTtl: optional('JWT_ACCESS_TTL', '15m'),
    refreshTtl: optional('JWT_REFRESH_TTL', '7d'),
    issuer: optional('JWT_ISSUER', 'boutique-auth'),
    audience: optional('JWT_AUDIENCE', 'boutique-api'),
  },

  bcryptRounds: optionalInt('BCRYPT_ROUNDS', 12),

  cors: {
    // Explicit allowlist. `cors()` with no arguments emits
    // `Access-Control-Allow-Origin: *`, which cannot be used with credentials
    // and lets any site call the API from a victim's browser.
    allowedOrigins: optional('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  cookie: {
    secure: optional('COOKIE_SECURE', 'false') === 'true',
    sameSite: optional('COOKIE_SAMESITE', 'lax') as 'lax' | 'strict' | 'none',
    name: 'boutique_rt',
  },

  rateLimit: {
    windowMs: optionalInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    authMax: optionalInt('AUTH_RATE_LIMIT_MAX', 5),
  },
};

export type Config = typeof config;
