import { getEstimatedDeliveryDate } from '../../lib/delivery.js';
import { NotFoundError } from '../../lib/errors.js';
import { ListBooksQuery } from './schemas.js';
import * as catalogueRepo from './repository.js';

export interface CategoryDto {
  id: number;
  name: string;
  sortOrder: number;
}

export interface AuthorSummaryDto {
  id: number;
  name: string;
}

export interface AuthorDetailDto {
  id: number;
  name: string;
  bio: string | null;
  photoUrl: string | null;
}

export interface BookDto {
  id: number;
  title: string;
  description: string;
  format: 'Paperback' | 'Hardcover';
  priceCents: number;
  coverUrl: string;
  publisher: string;
  author: AuthorSummaryDto;
  category: { id: number; name: string };
  estimatedDeliveryDate: string;
}

export interface BookDetailDto extends Omit<BookDto, 'author'> {
  author: AuthorDetailDto;
  inWishlist: boolean;
}

export function toBookDto(row: catalogueRepo.BookRow, deliveryDate: string = getEstimatedDeliveryDate()): BookDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    format: row.format,
    priceCents: row.price_cents,
    coverUrl: row.cover_url,
    publisher: row.publisher,
    author: {
      id: row.author_id,
      name: row.author_name,
    },
    category: {
      id: row.category_id,
      name: row.category_name,
    },
    estimatedDeliveryDate: deliveryDate,
  };
}

export async function getCategories(): Promise<{ items: CategoryDto[] }> {
  const rows = await catalogueRepo.findCategories();
  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      sortOrder: r.sort_order,
    })),
  };
}

export async function getAuthors(): Promise<{ items: AuthorSummaryDto[] }> {
  const rows = await catalogueRepo.findAuthors();
  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
    })),
  };
}

export async function getBooks(filters: ListBooksQuery): Promise<{ items: BookDto[] }> {
  const rows = await catalogueRepo.findBooks(filters);
  const deliveryDate = getEstimatedDeliveryDate();
  return {
    items: rows.map((r) => toBookDto(r, deliveryDate)),
  };
}

export async function getBookById(id: number, userId?: number): Promise<BookDetailDto> {
  const row = await catalogueRepo.findBookById(id);
  if (!row) {
    throw new NotFoundError(`Book with ID ${id} not found`);
  }

  const inWishlist = userId ? await catalogueRepo.isBookInWishlist(userId, id) : false;
  const deliveryDate = getEstimatedDeliveryDate();

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    format: row.format,
    priceCents: row.price_cents,
    coverUrl: row.cover_url,
    publisher: row.publisher,
    author: {
      id: row.author_id,
      name: row.author_name,
      bio: row.author_bio,
      photoUrl: row.author_photo_url,
    },
    category: {
      id: row.category_id,
      name: row.category_name,
    },
    estimatedDeliveryDate: deliveryDate,
    inWishlist,
  };
}

export async function getRelatedBooks(bookId: number): Promise<{ items: BookDto[] }> {
  const book = await catalogueRepo.findBookById(bookId);
  if (!book) {
    throw new NotFoundError(`Book with ID ${bookId} not found`);
  }

  const rows = await catalogueRepo.findRelatedBooks(bookId);
  const deliveryDate = getEstimatedDeliveryDate();
  return {
    items: rows.map((r) => toBookDto(r, deliveryDate)),
  };
}
