import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { addWishlistItemSchema, bookIdParamSchema } from './schemas.js';
import * as wishlistService from './service.js';

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await wishlistService.getWishlist(req.userId!);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

wishlistRouter.post(
  '/items',
  validate({ body: addWishlistItemSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.body;
      const result = await wishlistService.addWishlistItem(req.userId!, bookId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

wishlistRouter.delete(
  '/items/:bookId',
  validate({ params: bookIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = Number(req.params.bookId);
      await wishlistService.removeWishlistItem(req.userId!, bookId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

wishlistRouter.post(
  '/items/:bookId/move-to-cart',
  validate({ params: bookIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = Number(req.params.bookId);
      const result = await wishlistService.moveToCart(req.userId!, bookId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);
