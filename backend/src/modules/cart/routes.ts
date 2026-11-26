import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { addCartItemSchema, updateCartItemSchema, bookIdParamSchema } from './schemas.js';
import * as cartService from './service.js';

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cartService.getCart(req.userId!);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

cartRouter.post(
  '/items',
  validate({ body: addCartItemSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookId, quantity } = req.body;
      const result = await cartService.addCartItem(req.userId!, bookId, quantity);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

cartRouter.put(
  '/items/:bookId',
  validate({ params: bookIdParamSchema, body: updateCartItemSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = Number(req.params.bookId);
      const { quantity } = req.body;
      const result = await cartService.updateCartItem(req.userId!, bookId, quantity);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);
