'use client';

import React from 'react';
import { Book } from '../lib/types';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: Book[];
  title?: string;
  emptyMessage?: string;
}

export function BookGrid({
  books,
  title,
  emptyMessage = 'No books found matching your criteria.',
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8d8d8d' }}>
        <p style={{ fontSize: '1.125rem' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.25rem', color: '#f4f4f4' }}>
          {title}
        </h2>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
