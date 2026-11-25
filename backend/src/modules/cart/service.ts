import { config } from '../../config.js';
import { calculatePricing } from '../../lib/pricing.js';
import { getEstimatedDeliveryDate } from '../../lib/delivery.js';
import { NotFoundError } from '../../lib/errors.js';
import { BookDto, toBookDto } from '../catalogue/service.js';
import { findBookById } from '../catalogue/repository.js';
import * as cartRepo from './repository.js';

export interface CartItemDto {
  book: BookDto;
  quantity: number;
  lineTotalCents: number;
}

export interface CartDto {
  items: CartItemDto[];
  itemCount: number;
  itemsTotalCents: number;
  taxIncludedCents: number;
  shippingCents: number;
  totalCents: number;
}

export async function getCart(userId: number): Promise<CartDto> {
  const rows = await cartRepo.findCartItemsWithBook(userId);
  const deliveryDate = getEstimatedDeliveryDate();

  const pricingItems = rows.map((r) => ({
    unitPriceCents: r.price_cents,
    quantity: r.quantity,
  }));

  const pricing = calculatePricing(pricingItems, config.TAX_RATE, config.SHIPPING_COST_CENTS);

  const items: CartItemDto[] = rows.map((r) => {
    const book: BookDto = {
      id: r.book_id,
      title: r.title,
      description: r.description,
      format: r.format,
      priceCents: r.price_cents,
      coverUrl: r.cover_url,
      publisher: r.publisher,
      author: {
        id: r.author_id,
        name: r.author_name,
      },
      category: {
        id: r.category_id,
        name: r.category_name,
      },
      estimatedDeliveryDate: deliveryDate,
    };

    return {
      book,
      quantity: r.quantity,
      lineTotalCents: r.price_cents * r.quantity,
    };
  });

  return {
    items,
    ...pricing,
  };
}

export async function addCartItem(
  userId: number,
  bookId: number,
  quantity: number = 1
): Promise<CartDto> {
  const book = await findBookById(bookId);
  if (!book) {
    throw new NotFoundError(`Book with ID ${bookId} not found`);
  }

  await cartRepo.upsertCartItem(userId, bookId, quantity);
  return getCart(userId);
}

export async function updateCartItem(
  userId: number,
  bookId: number,
  quantity: number
): Promise<CartDto> {
  await cartRepo.setCartItemQuantity(userId, bookId, quantity);
  return getCart(userId);
}
