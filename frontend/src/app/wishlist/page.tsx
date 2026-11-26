'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Tag,
  Tile,
  InlineLoading,
  InlineNotification,
} from '@carbon/react';
import { ShoppingCart, TrashCan, Favorite } from '@carbon/icons-react';
import { Book } from '../../lib/types';
import { api, ApiError } from '../../lib/api';
import { formatPrice, formatDeliveryBy } from '../../lib/formatters';
import { useCart } from '../../context/CartContext';

export default function WishlistPage() {
  const router = useRouter();
  const { refreshCart } = useCart();

  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadWishlist() {
      try {
        const res = await api.get<{ items: Book[] }>('/wishlist');
        setItems(res.items);
      } catch (err: any) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, []);

  const handleMoveToCart = async (book: Book) => {
    setActionLoading(book.id);
    setNotification(null);
    try {
      await api.post(`/wishlist/items/${book.id}/move-to-cart`);
      setItems((prev) => prev.filter((b) => b.id !== book.id));
      await refreshCart();
      setNotification({
        kind: 'success',
        message: `"${book.title}" moved to your shopping cart!`,
      });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setNotification({ kind: 'error', message: err.message });
      } else {
        setNotification({ kind: 'error', message: 'Failed to move item to cart.' });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (book: Book) => {
    setActionLoading(book.id);
    setNotification(null);
    try {
      await api.delete(`/wishlist/items/${book.id}`);
      setItems((prev) => prev.filter((b) => b.id !== book.id));
      setNotification({
        kind: 'success',
        message: `"${book.title}" removed from your wishlist.`,
      });
    } catch {
      setNotification({ kind: 'error', message: 'Failed to remove item.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <InlineLoading description="Loading wishlist..." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        My Wishlist
      </h1>

      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.kind === 'success' ? 'Success' : 'Notice'}
          subtitle={notification.message}
          onCloseButtonClick={() => setNotification(null)}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {items.length === 0 ? (
        <Tile className="hero-tile" style={{ backgroundColor: '#262626' }}>
          <Favorite size={48} style={{ color: '#8d8d8d', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f4f4f4' }}>
            Your wishlist is empty
          </h2>
          <p style={{ color: '#c6c6c6', marginBottom: '1.5rem' }}>
            Save books you&apos;re interested in by clicking &quot;Add to Wishlist&quot; on any product page.
          </p>
          <Link href="/" passHref legacyBehavior>
            <Button>Discover Books</Button>
          </Link>
        </Tile>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '1.25rem' }}>
          {items.map((book) => (
            <Tile
              key={book.id}
              className="responsive-tile"
              style={{
                backgroundColor: '#262626',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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
                    src={book.coverUrl}
                    alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tag-row" style={{ marginBottom: '0.25rem' }}>
                    <Tag size="sm" type="cool-gray">
                      {book.category.name}
                    </Tag>
                    <Tag size="sm" type="outline">
                      {book.format}
                    </Tag>
                  </div>

                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '0.25rem' }}>
                    <Link href={`/books/${book.id}`} style={{ color: 'inherit' }}>
                      {book.title}
                    </Link>
                  </h3>

                  <div style={{ fontSize: '0.875rem', color: '#a8a8a8', marginBottom: '0.5rem' }}>
                    By {book.author.name}
                  </div>

                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4' }}>
                    {formatPrice(book.priceCents)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', borderTop: '1px solid #393939', paddingTop: '0.75rem' }}>
                <Button
                  size="sm"
                  renderIcon={ShoppingCart}
                  onClick={() => handleMoveToCart(book)}
                  disabled={actionLoading === book.id}
                  style={{ flex: 1 }}
                >
                  Move to Cart
                </Button>
                <Button
                  size="sm"
                  kind="danger--ghost"
                  renderIcon={TrashCan}
                  onClick={() => handleRemove(book)}
                  disabled={actionLoading === book.id}
                >
                  Remove
                </Button>
              </div>
            </Tile>
          ))}
        </div>
      )}
    </div>
  );
}
