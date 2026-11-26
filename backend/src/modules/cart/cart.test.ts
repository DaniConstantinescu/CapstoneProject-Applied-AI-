import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

const app = createApp();

describe('Cart Module API', () => {
  let authCookie: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cart Tester',
        email: 'cart.tester@example.com',
        password: 'password123',
      });
    authCookie = res.headers['set-cookie'][0];
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('returns empty cart initially', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.itemCount).toBe(0);
    expect(res.body.totalCents).toBe(0);
  });

  it('adds an item to the cart', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ bookId: 1, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].book.id).toBe(1);
    expect(res.body.items[0].quantity).toBe(2);
    expect(res.body.itemCount).toBe(2);
    expect(res.body.itemsTotalCents).toBe(1899 * 2);
  });

  it('adding same item again increments quantity', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ bookId: 1, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].quantity).toBe(3);
    expect(res.body.itemCount).toBe(3);
  });

  it('updates item quantity directly', async () => {
    const res = await request(app)
      .put('/api/cart/items/1')
      .set('Cookie', authCookie)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
    expect(res.body.itemCount).toBe(5);
  });

  it('setting quantity to 0 removes the item from cart', async () => {
    const res = await request(app)
      .put('/api/cart/items/1')
      .set('Cookie', authCookie)
      .send({ quantity: 0 });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
    expect(res.body.itemCount).toBe(0);
  });
});
