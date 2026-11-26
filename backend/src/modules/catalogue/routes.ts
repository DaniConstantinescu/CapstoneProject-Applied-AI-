import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validate.js';
import { optionalAuth } from '../../middleware/auth.js';
import { listBooksQuerySchema, bookIdParamSchema } from './schemas.js';
import * as catalogueService from './service.js';

export const categoriesRouter = Router();
export const authorsRouter = Router();
export const booksRouter = Router();

categoriesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await catalogueService.getCategories();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

authorsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await catalogueService.getAuthors();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

booksRouter.get(
  '/',
  validate({ query: listBooksQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await catalogueService.getBooks(req.query as any);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

booksRouter.get(
  '/:id/related',
  validate({ params: bookIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = Number(req.params.id);
      const result = await catalogueService.getRelatedBooks(bookId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

booksRouter.get(
  '/:id',
  optionalAuth,
  validate({ params: bookIdParamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = Number(req.params.id);
      const result = await catalogueService.getBookById(bookId, req.userId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);
