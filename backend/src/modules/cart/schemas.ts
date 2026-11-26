import { z } from 'zod';

export const addCartItemSchema = z.object({
  bookId: z.coerce.number().int().positive('Invalid book ID'),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(999),
});

export const bookIdParamSchema = z.object({
  bookId: z.coerce.number().int().positive('Invalid book ID'),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
