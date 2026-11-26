import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError, ErrorDetail } from '../lib/errors.js';

interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export function validate(schemas: ValidationSchemas) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const details: ErrorDetail[] = [];

    if (schemas.body) {
      const result = await schemas.body.safeParseAsync(req.body);
      if (!result.success) {
        formatZodErrors(result.error, details);
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = await schemas.query.safeParseAsync(req.query);
      if (!result.success) {
        formatZodErrors(result.error, details);
      } else {
        req.query = result.data as any;
      }
    }

    if (schemas.params) {
      const result = await schemas.params.safeParseAsync(req.params);
      if (!result.success) {
        formatZodErrors(result.error, details);
      } else {
        req.params = result.data as any;
      }
    }

    if (details.length > 0) {
      next(new ValidationError('Invalid request parameters', details));
      return;
    }

    next();
  };
}

function formatZodErrors(error: ZodError, details: ErrorDetail[]): void {
  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'root';
    details.push({
      field,
      message: issue.message,
    });
  }
}
