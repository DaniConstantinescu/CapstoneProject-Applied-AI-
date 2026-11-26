import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { OrderStatusTag } from './OrderStatusTag';

describe('OrderStatusTag component', () => {
  it('renders Confirmed status tag', () => {
    render(<OrderStatusTag status="Confirmed" />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders Shipped status tag', () => {
    render(<OrderStatusTag status="Shipped" />);
    expect(screen.getByText('Shipped')).toBeInTheDocument();
  });

  it('renders Delivered status tag', () => {
    render(<OrderStatusTag status="Delivered" />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('renders Cancelled status tag', () => {
    render(<OrderStatusTag status="Cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});
