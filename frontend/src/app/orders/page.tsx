'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Tile,
  InlineLoading,
  InlineNotification,
} from '@carbon/react';
import { OrderSummary } from '../../lib/types';
import { api, ApiError } from '../../lib/api';
import { formatPrice, formatFullDateTime } from '../../lib/formatters';
import { useCart } from '../../context/CartContext';
import { OrderStatusTag } from '../../components/OrderStatusTag';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { refreshCart } = useCart();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.get<{ items: OrderSummary[] }>('/orders');
        setOrders(res.items);
      } catch (err: any) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleBuyAgain = async (orderId: number) => {
    setActionLoading(orderId);
    setError(null);
    try {
      await api.post(`/orders/${orderId}/buy-again`);
      await refreshCart();
      router.push('/cart');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to re-order items. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <InlineLoading description="Loading order history..." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        My Orders
      </h1>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {orders.length === 0 ? (
        <Tile className="hero-tile" style={{ backgroundColor: '#262626' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f4f4f4' }}>
            No orders placed yet
          </h2>
          <p style={{ color: '#c6c6c6', marginBottom: '1.5rem' }}>
            You haven&apos;t placed any book orders yet. Browse our catalogue to get started!
          </p>
          <Link href="/" passHref legacyBehavior>
            <Button>Explore Books</Button>
          </Link>
        </Tile>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => (
            <Tile
              key={order.id}
              className="responsive-tile"
              style={{
                backgroundColor: '#262626',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #393939',
                  paddingBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4', marginRight: '1rem', display: 'inline-block' }}>
                    Order #{order.id}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#a8a8a8' }}>
                    Placed on {formatFullDateTime(order.confirmedAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <OrderStatusTag status={order.status} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f4f4f4' }}>
                    {formatPrice(order.totalCents)}
                  </span>
                </div>
              </div>

              {/* Items Thumbnails */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: '#161616',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '4px',
                      maxWidth: '100%',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        aspectRatio: '2 / 3',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        backgroundColor: '#262626',
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#f4f4f4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title} ({item.quantity})
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="action-row action-row--end" style={{ marginTop: '0.5rem' }}>
                <Link href={`/orders/${order.id}`} passHref legacyBehavior>
                  <Button kind="tertiary" size="sm">
                    View Order Details
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() => handleBuyAgain(order.id)}
                  disabled={actionLoading === order.id}
                >
                  {actionLoading === order.id ? 'Adding to Cart...' : 'Buy It Again'}
                </Button>
              </div>
            </Tile>
          ))}
        </div>
      )}
    </div>
  );
}
