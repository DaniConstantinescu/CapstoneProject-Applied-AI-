import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './lib/errors.js';
import { authRouter } from './modules/auth/routes.js';
import { categoriesRouter, authorsRouter, booksRouter } from './modules/catalogue/routes.js';
import { recommendationsRouter } from './modules/recommendations/routes.js';
import { cartRouter } from './modules/cart/routes.js';
import { wishlistRouter } from './modules/wishlist/routes.js';
import { ordersRouter } from './modules/orders/routes.js';

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  // Mount API modules
  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/authors', authorsRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/recommendations', recommendationsRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/orders', ordersRouter);

  // Catch-all 404 handler
  app.use('/api/*', (_req, _res, next) => {
    next(new NotFoundError('API endpoint not found'));
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
