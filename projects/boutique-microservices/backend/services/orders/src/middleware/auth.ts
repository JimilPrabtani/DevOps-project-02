/**
 * Defence-in-depth authentication for the orders service.
 *
 * The gateway already verifies the JWT and forwards x-user-* headers, but this
 * service must NOT trust those headers alone: anything with network access to
 * the pod (any other pod, pre-NetworkPolicy) could set them directly and
 * impersonate a user. So we re-verify the token here.
 *
 * See backend/SHARED-CODE.md for why this file is duplicated per service.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface OrdersUser {
  sub: string;
  email: string;
  role: string;
}

export interface AuthedRequest extends Request {
  user: OrdersUser;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(
      header.slice('Bearer '.length).trim(),
      config.jwt.accessSecret,
      {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
        algorithms: ['HS256'],
      }
    ) as jwt.JwtPayload;

    (req as AuthedRequest).user = {
      sub: String(decoded.sub),
      email: String(decoded.email ?? ''),
      role: String(decoded.role ?? 'customer'),
    };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthedRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
