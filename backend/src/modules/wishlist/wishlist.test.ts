import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

const app = createApp();

describe('Wishlist Module API', () => {
  let authCookie: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Wishlist Tester',
        email: 'wishlist.tester@example.com',
        password: 'password123',
      });
    authCookie = res.headers['set-cookie'][0];
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.status).toBe(401);
  });

  it('returns empty wishlist initially', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it('adds book to wishlist idempotently', async () => {
    // First add
    const res1 = await request(app)
      .post('/api/wishlist/items')
      .set('Cookie', authCookie)
      .send({ bookId: 1 });

    expect(res1.status).toBe(200);
    expect(res1.body.items.length).toBe(1);
    expect(res1.body.items[0].id).toBe(1);

    // Duplicate add should be idempotent
    const res2 = await request(app)
      .post('/api/wishlist/items')
      .set('Cookie', authCookie)
      .send({ bookId: 1 });

    expect(res2.status).toBe(200);
    expect(res2.body.items.length).toBe(1);
  });

  it('moves book from wishlist to cart', async () => {
    const res = await request(app)
      .post('/api/wishlist/items/1/move-to-cart')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    // Cart should now have 1 item
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].book.id).toBe(1);

    // Wishlist should now be empty
    const wishRes = await request(app)
      .get('/api/wishlist')
      .set('Cookie', authCookie);

    expect(wishRes.body.items.length).toBe(0);
  });

  it('removes book from wishlist via DELETE', async () => {
    // Add book 2 to wishlist
    await request(app)
      .post('/api/wishlist/items')
      .set('Cookie', authCookie)
      .send({ bookId: 2 });

    const delRes = await request(app)
      .delete('/api/wishlist/items/2')
      .set('Cookie', authCookie);

    expect(delRes.status).toBe(204);

    const wishRes = await request(app)
      .get('/api/wishlist')
      .set('Cookie', authCookie);

    expect(wishRes.body.items.length).toBe(0);
  });
});
