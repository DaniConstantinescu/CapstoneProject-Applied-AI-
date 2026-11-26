import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BookCard } from './BookCard';
import { Book } from '../lib/types';

describe('BookCard component', () => {
  const mockBook: Book = {
    id: 1,
    title: 'The Joy of Minimalism',
    description: 'A transformative guide to decluttering your life.',
    format: 'Paperback',
    priceCents: 1899,
    coverUrl: '/covers/joy-of-minimalism.png',
    publisher: 'Vintage Books',
    author: { id: 1, name: 'Daniel Reed' },
    category: { id: 1, name: 'Self-help' },
    estimatedDeliveryDate: '2025-07-21',
  };

  it('renders book title, author, category, format and formatted price', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('The Joy of Minimalism')).toBeInTheDocument();
    expect(screen.getByText('Daniel Reed')).toBeInTheDocument();
    expect(screen.getByText('Self-help')).toBeInTheDocument();
    expect(screen.getByText('Paperback')).toBeInTheDocument();
    expect(screen.getByText(/€\s?18.99/)).toBeInTheDocument();
  });

  it('renders estimated delivery date', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText(/Delivery by /)).toBeInTheDocument();
  });
});
