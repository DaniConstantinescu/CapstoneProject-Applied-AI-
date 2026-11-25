import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

const app = createApp();

describe('Catalogue & Recommendations API', () => {
  it('GET /api/categories returns categories ordered by sort_order', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(8);
    expect(res.body.items[0].name).toBe('Self-help');
  });

  it('GET /api/authors returns authors ordered by name', async () => {
    const res = await request(app).get('/api/authors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(10);
  });

  it('GET /api/books returns all books with estimated delivery date', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(30);

    const first = res.body.items[0];
    expect(first.title).toBeDefined();
    expect(first.priceCents).toBeGreaterThan(0);
    expect(first.author.name).toBeDefined();
    expect(first.category.name).toBeDefined();
    expect(first.estimatedDeliveryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('GET /api/books?q=minimalism searches case-insensitively', async () => {
    const res = await request(app).get('/api/books?q=minimalism');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0].title).toBe('The Joy of Minimalism');
  });

  it('GET /api/books?sort=price_asc sorts books by price ascending', async () => {
    const res = await request(app).get('/api/books?sort=price_asc');
    expect(res.status).toBe(200);
    const prices = res.body.items.map((b: any) => b.priceCents);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  it('GET /api/books/:id returns book details with author bio', async () => {
    const res = await request(app).get('/api/books/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.author.bio).toBeDefined();
    expect(res.body.inWishlist).toBe(false);
  });

  it('GET /api/books/99999 returns 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/books/99999');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/books/:id/related returns up to 4 books in same category excluding self', async () => {
    const res = await request(app).get('/api/books/1/related');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeLessThanOrEqual(4);
    // None should be book 1
    const ids = res.body.items.map((b: any) => b.id);
    expect(ids).not.toContain(1);
    // All should be category 'Self-help' (categoryId 1)
    for (const b of res.body.items) {
      expect(b.category.name).toBe('Self-help');
    }
  });

  it('GET /api/recommendations returns up to 10 books for guest', async () => {
    const res = await request(app).get('/api/recommendations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeLessThanOrEqual(10);
  });
});
