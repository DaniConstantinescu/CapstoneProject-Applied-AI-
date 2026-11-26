'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Tile } from '@carbon/react';
import { Book } from '../lib/types';
import { formatPrice, formatDeliveryBy } from '../lib/formatters';

export function BookCard({ book }: { book: Book }) {
  return (
    <Tile className="clickable-card book-card">
      <Link href={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '2 / 3',
            backgroundColor: '#262626',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.coverUrl}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>

        <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <Tag size="sm" type="cool-gray">
            {book.category.name}
          </Tag>
          <Tag size="sm" type="outline">
            {book.format}
          </Tag>
        </div>

        <h3 className="book-card__title">
          {book.title}
        </h3>
      </Link>

      <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
        <Link href={`/?authorId=${book.author.id}`} style={{ color: '#78a9ff' }}>
          {book.author.name}
        </Link>
      </div>

      <p className="book-card__desc">
        {book.description}
      </p>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #393939', paddingTop: '0.75rem' }}>
        <div className="book-card__price">
          {formatPrice(book.priceCents)}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6f6f6f' }}>
          {formatDeliveryBy(book.estimatedDeliveryDate)}
        </div>
      </div>
    </Tile>
  );
}
