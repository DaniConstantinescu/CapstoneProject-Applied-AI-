import { z } from 'zod';

export const listBooksQuerySchema = z.object({
  q: z.string().max(100).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  authorId: z.coerce.number().int().positive().optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'title_asc']).default('relevance'),
});

export const bookIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid book ID'),
});

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>;
