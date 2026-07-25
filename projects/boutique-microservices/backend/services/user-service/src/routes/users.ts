/**
 * User profile routes.
 *
 * SECURITY CHANGES vs. the previous implementation:
 *
 *  1. REMOVED `jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')`.
 *     Because JWT_SECRET was never set anywhere, that fallback was the live
 *     signing key and anyone could forge a token for any account. The secret
 *     is now required at boot and validated for length.
 *  2. Token verification moved into shared middleware with the algorithm
 *     pinned to HS256, blocking `alg: none` and algorithm-confusion forgeries.
 *  3. Address input is validated and length-bounded.
 *  4. Errors no longer distinguish "bad token" from "expired token" to clients.
 */

import express, { Request, Response } from 'express';
import { query } from '../database/connection';
import { UserProfile, Address, ServiceResponse } from '../types';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = express.Router();

// Every route below requires a verified token.
router.use(requireAuth);

const MAX_NAME = 100;
const MAX_ADDRESS_FIELD = 200;

function validateName(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} is required`);
  }
  if (value.length > MAX_NAME) {
    throw new Error(`${field} is too long`);
  }
  return value.trim();
}

// ---------------------------------------------------------------------------
// GET /profile
// ---------------------------------------------------------------------------
router.get('/profile', async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;

  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const dbUser = result.rows[0];

    const [preferencesResult, addressesResult] = await Promise.all([
      query('SELECT * FROM user_preferences WHERE user_id = $1', [dbUser.id]),
      query('SELECT * FROM addresses WHERE user_id = $1', [dbUser.id]),
    ]);

    const response: ServiceResponse<UserProfile> = {
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        role: dbUser.role,
        preferences: preferencesResult.rows[0] || {
          currency: 'USD',
          language: 'en',
          newsletter: true,
          promotions: true,
        },
        addresses: addressesResult.rows,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('[user-service] get profile failed:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// ---------------------------------------------------------------------------
// PUT /profile — can only ever modify the caller's own row
// ---------------------------------------------------------------------------
router.put('/profile', async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;

  try {
    const firstName = validateName((req.body as any)?.firstName, 'firstName');
    const lastName = validateName((req.body as any)?.lastName, 'lastName');

    // Note the WHERE clause binds to the token subject, not to anything the
    // client supplied — there is no way to target another user's record.
    const result = await query(
      `UPDATE users
       SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, email, first_name, last_name, role, created_at, updated_at`,
      [firstName, lastName, user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const dbUser = result.rows[0];
    const addressesResult = await query(
      'SELECT * FROM addresses WHERE user_id = $1',
      [dbUser.id]
    );

    const response: ServiceResponse<UserProfile> = {
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        role: dbUser.role,
        preferences: {
          currency: 'USD',
          language: 'en',
          newsletter: true,
          promotions: true,
        },
        addresses: addressesResult.rows,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at,
      },
    };

    res.json(response);
  } catch (error: any) {
    if (error?.message?.includes('required') || error?.message?.includes('too long')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('[user-service] update profile failed:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ---------------------------------------------------------------------------
// POST /addresses
// ---------------------------------------------------------------------------
router.post('/addresses', async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;

  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const fields = ['street', 'city', 'state', 'zipCode', 'country'];
    const values: Record<string, string> = {};

    for (const field of fields) {
      const value = body[field];
      if (typeof value !== 'string' || value.trim() === '') {
        return res
          .status(400)
          .json({ success: false, error: `${field} is required` });
      }
      if (value.length > MAX_ADDRESS_FIELD) {
        return res
          .status(400)
          .json({ success: false, error: `${field} is too long` });
      }
      values[field] = value.trim();
    }

    const isDefault = body.isDefault === true;

    const result = await query(
      `INSERT INTO addresses (user_id, street, city, state, zip_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user.sub,
        values.street,
        values.city,
        values.state,
        values.zipCode,
        values.country,
        isDefault,
      ]
    );

    const response: ServiceResponse<Address> = { success: true, data: result.rows[0] };
    res.status(201).json(response);
  } catch (error) {
    console.error('[user-service] add address failed:', error);
    res.status(500).json({ success: false, error: 'Failed to add address' });
  }
});

export { router as userRoutes };
