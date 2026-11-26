'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tag,
  InlineNotification,
  InlineLoading,
  Tile,
} from '@carbon/react';
import {
  ShoppingCart,
  Favorite,
  FavoriteFilled,
} from '@carbon/icons-react';
import { BookDetail, Book } from '../../../lib/types';
import { api, ApiError } from '../../../lib/api';
import { formatPrice, formatDeliveryBy } from '../../../lib/formatters';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { BookCard } from '../../../components/BookCard';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id);

  const { user } = useAuth();
  const { addToCart } = useCart();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [related, setRelated] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [notification, setNotification] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      try {
        const [bookRes, relatedRes] = await Promise.all([
          api.get<BookDetail>(`/books/${bookId}`),
          api.get<{ items: Book[] }>(`/books/${bookId}/related`),
        ]);
        setBook(bookRes);
        setRelated(relatedRes.items);
      } catch (err: any) {
        console.error('Failed to load book details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }

    setAddingToCart(true);
    setNotification(null);
    try {
      await addToCart(bookId, 1);
      setNotification({
        kind: 'success',
        message: `"${book?.title}" added to your shopping cart!`,
      });
    } catch (err) {
      setNotification({
        kind: 'error',
        message: 'Failed to add item to cart. Please try again.',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }

    if (!book) return;

    setTogglingWishlist(true);
    setNotification(null);
    try {
      if (book.inWishlist) {
        await api.delete(`/wishlist/items/${bookId}`);
        setBook({ ...book, inWishlist: false });
        setNotification({
          kind: 'success',
          message: 'Removed from your wishlist.',
        });
      } else {
        await api.post('/wishlist/items', { bookId });
        setBook({ ...book, inWishlist: true });
        setNotification({
          kind: 'success',
          message: 'Added to your wishlist!',
        });
      }
    } catch {
      setNotification({
        kind: 'error',
        message: 'Failed to update wishlist. Please try again.',
      });
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <InlineLoading description="Loading book details..." />
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Book Not Found</h2>
        <p style={{ marginTop: '1rem' }}>
          <Link href="/">Return to Catalogue</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb (C10: Home / Category / Book) */}
      <Breadcrumb style={{ marginBottom: '1.5rem' }}>
        <BreadcrumbItem>
          <Link href="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href={`/?categoryId=${book.category.id}`}>{book.category.name}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>{book.title}</BreadcrumbItem>
      </Breadcrumb>

      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.kind === 'success' ? 'Success' : 'Error'}
          subtitle={notification.message}
          onCloseButtonClick={() => setNotification(null)}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {/* 3-Column Layout: Cover | Details | Related Reads */}
      <div className="book-detail-layout">
        {/* Column 1: Book Cover */}
        <div className="book-detail-cover">
          <Tile style={{ padding: '0.75rem', backgroundColor: '#262626' }}>
            <div
              style={{
                width: '100%',
                aspectRatio: '2 / 3',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#161616',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.coverUrl}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </Tile>
        </div>

        {/* Column 2: Main Details & Actions */}
        <div style={{ minWidth: 0 }}>
          <div className="tag-row" style={{ marginBottom: '0.75rem', gap: '0.5rem', alignItems: 'center' }}>
            <Tag size="md" type="cool-gray">
              {book.category.name}
            </Tag>
            <Tag size="md" type="outline">
              {book.format}
            </Tag>
          </div>

          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
            {book.title}
          </h1>

          <div style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#c6c6c6' }}>
            By{' '}
            <Link href={`/?authorId=${book.author.id}`} style={{ color: '#78a9ff', fontWeight: 500 }}>
              {book.author.name}
            </Link>
            <span style={{ margin: '0 0.5rem', color: '#6f6f6f' }}>•</span>
            <span style={{ fontSize: '0.875rem', color: '#a8a8a8' }}>Published by {book.publisher}</span>
          </div>

          {/* Pricing & Delivery Banner */}
          <Tile style={{ marginBottom: '1.5rem', backgroundColor: '#262626' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f4f4f4', marginBottom: '0.25rem' }}>
              {formatPrice(book.priceCents)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#42be65', fontWeight: 500 }}>
              {formatDeliveryBy(book.estimatedDeliveryDate)}
            </div>
          </Tile>

          {/* Action Buttons */}
          <div className="book-actions">
            <Button
              renderIcon={ShoppingCart}
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={{ flex: 1 }}
            >
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </Button>

            <Button
              kind="tertiary"
              renderIcon={book.inWishlist ? FavoriteFilled : Favorite}
              onClick={handleToggleWishlist}
              disabled={togglingWishlist}
            >
              {book.inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </Button>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f4f4f4' }}>
              Description
            </h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: '#c6c6c6' }}>
              {book.description}
            </p>
          </div>

          {/* About the Writer */}
          {book.author.bio && (
            <Tile className="responsive-tile" style={{ backgroundColor: '#262626' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f4f4f4' }}>
                About the Writer
              </h3>
              <div className="author-bio">
                {book.author.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.author.photoUrl}
                    alt={book.author.name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '0.25rem' }}>
                    {book.author.name}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#a8a8a8', lineHeight: 1.4 }}>
                    {book.author.bio}
                  </p>
                </div>
              </div>
            </Tile>
          )}
        </div>

        {/* Column 3: Related Reads (max 4) */}
        <div className="book-detail-related">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#f4f4f4' }}>
            Related Reads
          </h3>
          <div className="book-detail-related__list">
            {related.length > 0 ? (
              related.map((rb) => (
                <BookCard key={rb.id} book={rb} />
              ))
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#8d8d8d' }}>No related reads available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
