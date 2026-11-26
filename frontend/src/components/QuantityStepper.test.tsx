import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { QuantityStepper } from './QuantityStepper';

describe('QuantityStepper component', () => {
  it('displays current quantity', () => {
    render(<QuantityStepper quantity={3} onChange={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('increments quantity when plus button is clicked', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={2} onChange={handleChange} />);

    const plusBtn = screen.getByLabelText('Increase quantity');
    fireEvent.click(plusBtn);

    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('decrements quantity when minus button is clicked', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={2} onChange={handleChange} />);

    const minusBtn = screen.getByLabelText('Decrease quantity');
    fireEvent.click(minusBtn);

    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('triggers 0 on decrement when quantity is 1', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={1} onChange={handleChange} />);

    const minusBtn = screen.getByLabelText('Decrease quantity');
    fireEvent.click(minusBtn);

    expect(handleChange).toHaveBeenCalledWith(0);
  });
});
