import { z } from 'zod';

export const addWishlistItemSchema = z.object({
  bookId: z.coerce.number().int().positive('Invalid book ID'),
});

export const bookIdParamSchema = z.object({
  bookId: z.coerce.number().int().positive('Invalid book ID'),
});

export type AddWishlistItemInput = z.infer<typeof addWishlistItemSchema>;
