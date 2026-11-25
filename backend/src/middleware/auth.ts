import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { UnauthorizedError } from '../lib/errors.js';

export interface JwtPayload {
  sub: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    next(new UnauthorizedError('Authentication token missing'));
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as unknown as { sub: number };
    if (!decoded || typeof decoded.sub !== 'number') {
      next(new UnauthorizedError('Invalid authentication token payload'));
      return;
    }
    req.userId = decoded.sub;
    next();
  } catch (err) {
    next(new UnauthorizedError('Authentication token expired or invalid'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    req.userId = undefined;
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as unknown as { sub: number };
    if (decoded && typeof decoded.sub === 'number') {
      req.userId = decoded.sub;
    }
  } catch {
    req.userId = undefined;
  }

  next();
}
