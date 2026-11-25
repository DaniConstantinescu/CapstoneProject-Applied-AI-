'use client';

import React from 'react';
import { Subtract, Add } from '@carbon/icons-react';

interface QuantityStepperProps {
  quantity: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
}

export function QuantityStepper({ quantity, onChange, disabled }: QuantityStepperProps) {
  const handleDecrement = () => {
    if (disabled) return;
    onChange(Math.max(0, quantity - 1));
  };

  const handleIncrement = () => {
    if (disabled) return;
    onChange(quantity + 1);
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid #393939',
        borderRadius: '4px',
        backgroundColor: '#262626',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={handleDecrement}
        disabled={disabled}
        style={{
          background: 'none',
          border: 'none',
          color: '#f4f4f4',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Subtract size={16} />
      </button>

      <span
        style={{
          padding: '0 0.75rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#f4f4f4',
          minWidth: '2rem',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {quantity}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        onClick={handleIncrement}
        disabled={disabled}
        style={{
          background: 'none',
          border: 'none',
          color: '#f4f4f4',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Add size={16} />
      </button>
    </div>
  );
}
