/**
 * Gateway authentication boundary.
 *
 * WHY THIS FILE EXISTS: the gateway previously applied helmet + cors and then
 * proxied every request straight through. It enforced nothing. Any client
 * could reach any backend route unauthenticated, because the backends assumed
 * "the gateway handles auth" and the gateway assumed nothing at all.
 *
 * Now the gateway verifies the JWT once and forwards the verified identity to
 * backends as trusted headers.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface GatewayUser {
  sub: string;
  email: string;
  role: string;
}

export interface AuthedRequest extends Request {
  user?: GatewayUser;
}

/**
 * Headers the gateway sets itself to convey verified identity downstream.
 * They MUST be stripped from inbound requests first — otherwise a client
 * could simply send `x-user-id: <victim>` and impersonate anyone, since the
 * backends trust these headers.
 */
export const IDENTITY_HEADERS = [
  'x-user-id',
  'x-user-email',
  'x-user-role',
  'x-authenticated',
] as const;

export function stripClientIdentityHeaders(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  for (const header of IDENTITY_HEADERS) {
    delete req.headers[header];
  }
  next();
}

function verify(token: string): GatewayUser {
  const decoded = jwt.verify(token, config.jwt.accessSecret, {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    algorithms: ['HS256'],
  }) as jwt.JwtPayload;

  return {
    sub: String(decoded.sub),
    email: String(decoded.email ?? ''),
    role: String(decoded.role ?? 'customer'),
  };
}

/** Rejects the request unless a valid access token is present. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const user = verify(token);
    (req as AuthedRequest).user = user;
    req.headers['x-user-id'] = user.sub;
    req.headers['x-user-email'] = user.email;
    req.headers['x-user-role'] = user.role;
    req.headers['x-authenticated'] = 'true';
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Attaches identity when a valid token is present, but allows anonymous
 * access. Used for browsing products, where logged-in and logged-out users
 * both get a response.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (header?.startsWith('Bearer ')) {
    try {
      const user = verify(header.slice('Bearer '.length).trim());
      (req as AuthedRequest).user = user;
      req.headers['x-user-id'] = user.sub;
      req.headers['x-user-email'] = user.email;
      req.headers['x-user-role'] = user.role;
      req.headers['x-authenticated'] = 'true';
    } catch {
      // Invalid token on a public route: proceed as anonymous rather than
      // failing, but make sure no identity headers survive.
      for (const h of IDENTITY_HEADERS) delete req.headers[h];
    }
  }
  next();
}

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
