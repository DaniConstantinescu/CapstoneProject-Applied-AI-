import { z } from 'zod';

export const shippingAddressSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{6,20}$/, 'Invalid phone number format'),
  address: z.string().trim().min(1, 'Address is required').max(200),
  city: z.string().trim().min(1, 'City is required').max(100),
  postalCode: z.string().trim().min(1, 'Postal code is required').max(20),
  state: z.string().trim().min(1, 'State is required').max(100),
  country: z.string().trim().min(1, 'Country is required').max(100),
});

export const checkoutRequestSchema = z.object({
  paymentMethod: z.enum(['credit_card', 'debit_card']),
  address: shippingAddressSchema,
});

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid order ID'),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
