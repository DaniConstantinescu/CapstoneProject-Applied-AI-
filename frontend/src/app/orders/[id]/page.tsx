'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tag,
  Tile,
  InlineLoading,
  InlineNotification,
  Modal,
} from '@carbon/react';
import { Order } from '../../../lib/types';
import { api, ApiError } from '../../../lib/api';
import { formatPrice, formatFullDateTime, formatDeliveryBy } from '../../../lib/formatters';
import { useCart } from '../../../context/CartContext';
import { OrderStatusTag } from '../../../components/OrderStatusTag';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { refreshCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [buyingAgain, setBuyingAgain] = useState(false);
  const [notification, setNotification] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const data = await api.get<Order>(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    setNotification(null);
    try {
      const updated = await api.post<Order>(`/orders/${orderId}/cancel`);
      setOrder(updated);
      setCancelModalOpen(false);
      setNotification({
        kind: 'success',
        message: 'Order cancelled successfully. Mock payment has been refunded.',
      });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setNotification({ kind: 'error', message: err.message });
      } else {
        setNotification({ kind: 'error', message: 'Failed to cancel order.' });
      }
    } finally {
      setCancelling(false);
    }
  };

  const handleBuyAgain = async () => {
    setBuyingAgain(true);
    setNotification(null);
    try {
      await api.post(`/orders/${orderId}/buy-again`);
      await refreshCart();
      router.push('/cart');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setNotification({ kind: 'error', message: err.message });
      } else {
        setNotification({ kind: 'error', message: 'Failed to re-order items.' });
      }
    } finally {
      setBuyingAgain(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <InlineLoading description="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Order Not Found</h2>
        <p style={{ marginTop: '1rem' }}>
          <Link href="/orders">Return to Orders</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb style={{ marginBottom: '1.5rem' }}>
        <BreadcrumbItem>
          <Link href="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/orders">My Orders</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>Order #{order.id}</BreadcrumbItem>
      </Breadcrumb>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '0.25rem' }}>
            Order #{order.id}
          </h1>
          <p style={{ color: '#a8a8a8', fontSize: '0.875rem' }}>
            Placed on {formatFullDateTime(order.confirmedAt)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <OrderStatusTag status={order.status} size="lg" />
          <Tag size="lg" type={order.paymentStatus === 'paid' ? 'green' : 'red'}>
            Payment: {order.paymentStatus === 'paid' ? 'Paid' : 'Refunded'}
          </Tag>
        </div>
      </div>

      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.kind === 'success' ? 'Success' : 'Notice'}
          subtitle={notification.message}
          onCloseButtonClick={() => setNotification(null)}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Items & Shipping Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Purchased Items */}
          <Tile style={{ backgroundColor: '#262626', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '1.25rem' }}>
              Items in Order ({order.itemCount} items)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    borderBottom: idx < order.items.length - 1 ? '1px solid #393939' : 'none',
                    paddingBottom: idx < order.items.length - 1 ? '1rem' : 0,
                  }}
                >
                  <div
                    style={{
                      width: '60px',
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
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '0.25rem' }}>
                      <Link href={`/books/${item.book.id}`} style={{ color: 'inherit' }}>
                        {item.title}
                      </Link>
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: '#a8a8a8' }}>
                      By {item.authorName} • Quantity: {item.quantity}
                    </div>
                  </div>

                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4' }}>
                    {formatPrice(item.unitPriceCents * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </Tile>

          {/* Delivery Address Snapshot */}
          <Tile style={{ backgroundColor: '#262626', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '1rem' }}>
              Delivery Details
            </h2>
            <div style={{ color: '#c6c6c6', lineHeight: 1.6, fontSize: '0.9375rem' }}>
              <p style={{ fontWeight: 600, color: '#f4f4f4' }}>
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>{order.address.address}</p>
              <p>
                {order.address.city}, {order.address.state} {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              <p style={{ color: '#8d8d8d', marginTop: '0.5rem' }}>Phone: {order.address.phone}</p>
              <p style={{ color: '#42be65', marginTop: '0.5rem', fontWeight: 500 }}>
                {formatDeliveryBy(order.estimatedDeliveryDate)}
              </p>
            </div>
          </Tile>
        </div>

        {/* Right Column: Pricing Breakdown & Order Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Tile style={{ backgroundColor: '#262626', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', color: '#f4f4f4' }}>
              Payment Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c6c6c6' }}>
                <span>Items Subtotal</span>
                <span style={{ color: '#f4f4f4', fontWeight: 500 }}>{formatPrice(order.itemsTotalCents)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d8d', fontSize: '0.8125rem' }}>
                <span>Includes Tax</span>
                <span>{formatPrice(order.taxIncludedCents)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c6c6c6' }}>
                <span>Delivery charges</span>
                <span style={{ color: order.shippingCents === 0 ? '#42be65' : '#f4f4f4', fontWeight: 500 }}>
                  {order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}
                </span>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid #393939',
                paddingTop: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4' }}>Total Paid</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f4f4f4' }}>
                {formatPrice(order.totalCents)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button onClick={handleBuyAgain} disabled={buyingAgain} style={{ width: '100%' }}>
                {buyingAgain ? 'Adding to Cart...' : 'Buy Again'}
              </Button>

              {order.cancellable && (
                <Button
                  kind="danger--ghost"
                  onClick={() => setCancelModalOpen(true)}
                  style={{ width: '100%' }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </Tile>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        open={cancelModalOpen}
        modalHeading="Cancel Order"
        primaryButtonText={cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        secondaryButtonText="Keep Order"
        danger
        onRequestSubmit={handleCancelOrder}
        onRequestClose={() => setCancelModalOpen(false)}
        primaryButtonDisabled={cancelling}
      >
        <p style={{ margin: '1rem 0' }}>
          Are you sure you want to cancel <strong>Order #{order.id}</strong>?
        </p>
        <p style={{ color: '#c6c6c6', fontSize: '0.875rem' }}>
          This will cancel the shipment and refund the total amount of{' '}
          <strong>{formatPrice(order.totalCents)}</strong> back to your original payment method.
        </p>
      </Modal>
    </div>
  );
}
