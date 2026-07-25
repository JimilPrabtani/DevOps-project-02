/**
 * Authentication routes.
 *
 * SECURITY CHANGES vs. the previous implementation:
 *
 *  1. REMOVED the `if (password === 'demo')` branch. It let anyone log in as
 *     any email address, and auto-created the account if it did not exist.
 *  2. REMOVED `token: user.id.toString()`. Tokens are now signed JWTs with an
 *     expiry, an issuer/audience, and a pinned algorithm.
 *  3. REMOVED the module-level `let currentUser` global. It was shared across
 *     every concurrent request in the process — one user's login overwrote
 *     another's state. Identity now comes only from the verified token.
 *  4. Refresh tokens live in an httpOnly cookie, are recorded in the database
 *     by `jti`, are rotated on every use, and are revoked on logout.
 *  5. Login failures are constant-ish time and return an identical message
 *     whether the email exists or not, so the endpoint cannot be used to
 *     enumerate registered users.
 */

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/connection';
import { config } from '../config/env';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTtlMs,
} from '../security/tokens';
import {
  validateLogin,
  validateRegister,
  ValidationError,
} from '../security/validate';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = express.Router();

// A pre-computed hash used to equalise timing when the email does not exist.
// Without this, "no such user" returns much faster than "wrong password",
// which leaks whether an address is registered.
const DUMMY_HASH = bcrypt.hashSync('timing-equalisation-placeholder', 10);

interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

function publicUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(config.cookie.name, token, {
    httpOnly: true, // unreadable from JavaScript — an XSS cannot exfiltrate it
    secure: config.cookie.secure, // HTTPS-only when COOKIE_SECURE=true
    sameSite: config.cookie.sameSite, // blocks cross-site CSRF submission
    path: '/api/auth',
    maxAge: refreshTtlMs(),
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(config.cookie.name, { path: '/api/auth' });
}

/** Record a freshly issued refresh token so it can later be revoked. */
async function persistRefreshToken(jti: string, userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + refreshTtlMs());
  await query(
    `INSERT INTO refresh_tokens (jti, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [jti, userId, expiresAt]
  );
}

async function issueSession(res: Response, user: DbUser) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const { token: refreshToken, jti } = signRefreshToken(user.id);
  await persistRefreshToken(jti, user.id);
  setRefreshCookie(res, refreshToken);
  return accessToken;
}

// ---------------------------------------------------------------------------
// POST /register
// ---------------------------------------------------------------------------
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = validateRegister(req.body);

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      // Same generic message as a successful-shape failure elsewhere; we do not
      // confirm that the address is already registered.
      return res
        .status(409)
        .json({ error: 'Unable to register with those details' });
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, password_hash, first_name, last_name, role, created_at, updated_at`,
      [email, hashedPassword, firstName, lastName, 'customer']
    );

    const user = result.rows[0] as DbUser;
    const accessToken = await issueSession(res, user);

    res.status(201).json({
      user: publicUser(user),
      token: accessToken,
      expiresIn: config.jwt.accessTtl,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: 'Validation failed', fields: error.fields });
    }
    console.error('[auth] register failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ---------------------------------------------------------------------------
// POST /login
// ---------------------------------------------------------------------------
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = validateLogin(req.body);

    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, role, created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0] as DbUser | undefined;

    // Always run a bcrypt comparison, even when the user does not exist, so
    // response time does not reveal whether the account is registered.
    const isValid = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_HASH
    );

    if (!user || !isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = await issueSession(res, user);

    res.json({
      user: publicUser(user),
      token: accessToken,
      expiresIn: config.jwt.accessTtl,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: 'Validation failed', fields: error.fields });
    }
    console.error('[auth] login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ---------------------------------------------------------------------------
// POST /refresh — rotates the refresh token and detects replay
// ---------------------------------------------------------------------------
router.post('/refresh', async (req: Request, res: Response) => {
  const presented = req.cookies?.[config.cookie.name];

  if (!presented) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const { sub: userId, jti } = verifyRefreshToken(presented);

    const stored = await query(
      `SELECT jti, user_id, revoked_at, expires_at
       FROM refresh_tokens WHERE jti = $1`,
      [jti]
    );

    const row = stored.rows[0];

    // Unknown jti, or one we already rotated away: treat as token theft.
    // Revoke every outstanding token for this user and force a fresh login.
    if (!row || row.revoked_at !== null) {
      await query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId]
      );
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Refresh token is no longer valid' });
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Rotate: retire the presented token before issuing its replacement.
    await query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE jti = $1`, [jti]);

    const userResult = await query(
      `SELECT id, email, password_hash, first_name, last_name, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    const user = userResult.rows[0] as DbUser | undefined;
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'User no longer exists' });
    }

    const accessToken = await issueSession(res, user);

    res.json({
      user: publicUser(user),
      token: accessToken,
      expiresIn: config.jwt.accessTtl,
    });
  } catch (error) {
    clearRefreshCookie(res);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ---------------------------------------------------------------------------
// POST /logout — actually revokes, rather than clearing a variable
// ---------------------------------------------------------------------------
router.post('/logout', async (req: Request, res: Response) => {
  const presented = req.cookies?.[config.cookie.name];

  if (presented) {
    try {
      const { jti } = verifyRefreshToken(presented);
      await query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE jti = $1 AND revoked_at IS NULL`,
        [jti]
      );
    } catch {
      // An unparseable cookie still gets cleared below; nothing to revoke.
    }
  }

  clearRefreshCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// ---------------------------------------------------------------------------
// GET /me — identity comes from the verified token, never from a raw header
// ---------------------------------------------------------------------------
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;

  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(publicUser(result.rows[0] as DbUser));
  } catch (error) {
    console.error('[auth] /me failed:', error);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

export { router as authRoutes };
