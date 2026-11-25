import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { checkoutRequestSchema, orderIdParamSchema } from './schemas.js';
import * as ordersService from './service.js';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.post(
  '/',
  validate({ body: checkoutRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ordersService.checkout(req.userId!, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

ordersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ordersService.getUserOrders(req.userId!);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

ordersRouter.get(
  '/:id',
  validate({ params: orderIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = Number(req.params.id);
      const result = await ordersService.getOrderById(orderId, req.userId!);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

ordersRouter.post(
  '/:id/cancel',
  validate({ params: orderIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = Number(req.params.id);
      const result = await ordersService.cancelOrder(orderId, req.userId!);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

ordersRouter.post(
  '/:id/buy-again',
  validate({ params: orderIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = Number(req.params.id);
      const result = await ordersService.buyAgain(orderId, req.userId!);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);
