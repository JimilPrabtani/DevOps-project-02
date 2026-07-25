/**
 * JWT verification middleware.
 *
 * REPLACES the old pattern of reading the Authorization header and using its
 * raw contents as a database key:
 *
 *   const userId = authHeader.split(' ')[1];
 *   query('SELECT ... WHERE id = $1', [userId]);   // <- forgeable by anyone
 *
 * Every protected handler now receives an identity that was cryptographically
 * verified, not merely asserted by the caller.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../security/tokens';

export interface AuthedRequest extends Request {
  user: AccessTokenPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    (req as AuthedRequest).user = verifyAccessToken(token);
    next();
  } catch {
    // Do not echo the library's error — "jwt expired" vs "invalid signature"
    // tells an attacker which part of their forgery attempt was wrong.
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Route guard for privileged operations. */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthedRequest).user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
