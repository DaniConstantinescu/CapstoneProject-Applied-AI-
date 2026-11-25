'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Tile } from '@carbon/react';
import { Book } from '../lib/types';
import { formatPrice, formatDeliveryBy } from '../lib/formatters';

export function BookCard({ book }: { book: Book }) {
  return (
    <Tile className="clickable-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem' }}>
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

        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '0.25rem',
            color: '#f4f4f4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
            minHeight: '2.6rem',
          }}
        >
          {book.title}
        </h3>
      </Link>

      <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
        <Link href={`/?authorId=${book.author.id}`} style={{ color: '#78a9ff' }}>
          {book.author.name}
        </Link>
      </div>

      <p
        style={{
          fontSize: '0.8125rem',
          color: '#a8a8a8',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {book.description}
      </p>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #393939', paddingTop: '0.75rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '0.25rem' }}>
          {formatPrice(book.priceCents)}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6f6f6f' }}>
          {formatDeliveryBy(book.estimatedDeliveryDate)}
        </div>
      </div>
    </Tile>
  );
}
