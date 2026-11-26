import { getEstimatedDeliveryDate } from '../../lib/delivery.js';
import { NotFoundError } from '../../lib/errors.js';
import { BookDto, toBookDto } from '../catalogue/service.js';
import { findBookById } from '../catalogue/repository.js';
import { getCart, CartDto } from '../cart/service.js';
import * as wishlistRepo from './repository.js';

export async function getWishlist(userId: number): Promise<{ items: BookDto[] }> {
  const rows = await wishlistRepo.findWishlistBooks(userId);
  const deliveryDate = getEstimatedDeliveryDate();
  return {
    items: rows.map((r) => toBookDto(r, deliveryDate)),
  };
}

export async function addWishlistItem(userId: number, bookId: number): Promise<{ items: BookDto[] }> {
  const book = await findBookById(bookId);
  if (!book) {
    throw new NotFoundError(`Book with ID ${bookId} not found`);
  }

  await wishlistRepo.addWishlistItem(userId, bookId);
  return getWishlist(userId);
}

export async function removeWishlistItem(userId: number, bookId: number): Promise<void> {
  await wishlistRepo.removeWishlistItem(userId, bookId);
}

export async function moveToCart(userId: number, bookId: number): Promise<CartDto> {
  const book = await findBookById(bookId);
  if (!book) {
    throw new NotFoundError(`Book with ID ${bookId} not found`);
  }

  await wishlistRepo.moveWishlistItemToCartTx(userId, bookId);
  return getCart(userId);
}
