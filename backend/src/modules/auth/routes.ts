import { Router, Request, Response, NextFunction } from 'express';
import { config } from '../../config.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { registerSchema, loginSchema } from './schemas.js';
import * as authService from './service.js';

export const authRouter = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 3600 * 1000,
  secure: config.NODE_ENV === 'production',
};

authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await authService.register(req.body);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post(
  '/login',
  validate({ body: loginSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await authService.login(req.body);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  res.status(204).send();
});

authRouter.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.getMe(req.userId!);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);
