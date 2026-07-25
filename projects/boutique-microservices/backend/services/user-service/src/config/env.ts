/**
 * Fail-fast environment validation for the user service.
 *
 * THE BUG THIS FIXES: `process.env.JWT_SECRET || 'your-secret-key'`.
 * JWT_SECRET was never set in docker-compose or any Kubernetes manifest, so
 * the literal string 'your-secret-key' — visible to anyone reading the repo —
 * was the production signing key. Anyone could mint a token for any user.
 *
 * See backend/SHARED-CODE.md for why this file is duplicated per service.
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
  port: optionalInt('PORT', 3006),
  databaseUrl: required('DATABASE_URL'),

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
};
