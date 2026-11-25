import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

const app = createApp();

describe('Orders Module API', () => {
  let authCookie: string;
  let orderId: number;

  const validAddress = {
    firstName: 'John',
    lastName: 'Smith',
    phone: '+353 87 999 8888',
    address: '42 Wallaby Way',
    city: 'Dublin',
    postalCode: 'D01 AB12',
    state: 'Dublin',
    country: 'Ireland',
  };

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Order Tester',
        email: 'order.tester@example.com',
        password: 'password123',
      });
    authCookie = res.headers['set-cookie'][0];
  });

  it('rejects checkout with 409 CART_EMPTY when cart is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', authCookie)
      .send({
        paymentMethod: 'credit_card',
        address: validAddress,
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CART_EMPTY');
  });

  it('completes checkout transaction with mock payment', async () => {
    // Add book 1 (quantity 2) and book 2 (quantity 1)
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ bookId: 1, quantity: 2 });

    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ bookId: 2, quantity: 1 });

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', authCookie)
      .send({
        paymentMethod: 'credit_card',
        address: validAddress,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    orderId = res.body.id;
    expect(res.body.status).toBe('Confirmed');
    expect(res.body.cancellable).toBe(true);
    expect(res.body.paymentMethod).toBe('credit_card');
    expect(res.body.paymentStatus).toBe('paid');
    expect(res.body.items.length).toBe(2);
    expect(res.body.itemCount).toBe(3);
    expect(res.body.address.firstName).toBe(validAddress.firstName);

    // Verify cart was cleared after checkout
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Cookie', authCookie);
    expect(cartRes.body.items.length).toBe(0);
  });

  it('GET /api/orders lists user orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0].id).toBe(orderId);
  });

  it('GET /api/orders/:id retrieves order detail', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orderId);
    expect(res.body.items.length).toBe(2);
  });

  it('POST /api/orders/:id/cancel cancels order within 48h', async () => {
    const res = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Cancelled');
    expect(res.body.paymentStatus).toBe('refunded');
    expect(res.body.cancellable).toBe(false);
  });

  it('POST /api/orders/:id/cancel on already cancelled order returns 409', async () => {
    const res = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CANCELLATION_NOT_ALLOWED');
  });

  it('POST /api/orders/:id/buy-again re-populates cart with order items', async () => {
    const res = await request(app)
      .post(`/api/orders/${orderId}/buy-again`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(res.body.itemCount).toBe(3);
  });
});
