'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Button,
  Tag,
  Tile,
  InlineLoading,
} from '@carbon/react';
import { CheckmarkFilled } from '@carbon/icons-react';
import { Order } from '../../../../lib/types';
import { api } from '../../../../lib/api';
import { formatPrice, formatDeliveryBy } from '../../../../lib/formatters';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await api.get<Order>(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <InlineLoading description="Loading purchase confirmation..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Order Confirmation Not Found</h2>
        <p style={{ marginTop: '1rem' }}>
          <Link href="/">Return to Home</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <Tile style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#262626', marginBottom: '2rem' }}>
        <CheckmarkFilled size={48} style={{ color: '#42be65', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '0.5rem' }}>
          Thank you! Your purchase is successful.
        </h1>
        <p style={{ color: '#c6c6c6', fontSize: '1rem', marginBottom: '0.5rem' }}>
          Your order has been confirmed and is being prepared for shipment.
        </p>
        <p style={{ color: '#8d8d8d', fontSize: '0.875rem' }}>
          Order Reference: <strong style={{ color: '#f4f4f4' }}>#{order.id}</strong>
        </p>
      </Tile>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '1rem' }}>
        Purchased Reads ({order.itemCount} items)
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        {order.items.map((item, idx) => (
          <Tile
            key={idx}
            style={{
              backgroundColor: '#262626',
              padding: '1.25rem',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '70px',
                aspectRatio: '2 / 3',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#161616',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.book.coverUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                <Tag size="sm" type="cool-gray">
                  {item.book.category.name}
                </Tag>
                <Tag size="sm" type="outline">
                  {item.book.format}
                </Tag>
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '0.25rem' }}>
                {item.title}
              </h3>

              <div style={{ fontSize: '0.875rem', color: '#a8a8a8', marginBottom: '0.25rem' }}>
                By {item.authorName} • Quantity: {item.quantity}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#42be65' }}>
                {formatDeliveryBy(order.estimatedDeliveryDate)}
              </div>
            </div>

            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4' }}>
              {formatPrice(item.unitPriceCents * item.quantity)}
            </div>
          </Tile>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/" passHref legacyBehavior>
          <Button size="lg">Continue your Shopping</Button>
        </Link>
        <Link href={`/orders/${order.id}`} passHref legacyBehavior>
          <Button size="lg" kind="tertiary">
            View Order Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
