import { Router, Request, Response, NextFunction } from 'express';
import { optionalAuth } from '../../middleware/auth.js';
import * as recService from './service.js';

export const recommendationsRouter = Router();

recommendationsRouter.get(
  '/',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await recService.getRecommendations(req.userId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);
