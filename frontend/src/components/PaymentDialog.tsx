'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TextInput,
  Button,
  InlineNotification,
} from '@carbon/react';
import { Cart, ShippingAddress } from '../lib/types';
import { api, ApiError } from '../lib/api';
import { formatPrice } from '../lib/formatters';
import { useCart } from '../context/CartContext';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  cart: Cart;
  address: ShippingAddress;
}

export function PaymentDialog({ open, onClose, cart, address }: PaymentDialogProps) {
  const router = useRouter();
  const { setCartDirect } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card'>('credit_card');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardHolder, setCardHolder] = useState('Jane Doe');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const order = await api.post<any>('/orders', {
        paymentMethod,
        address,
      });

      // Clear cart in context
      setCartDirect(null);
      onClose();
      router.push(`/orders/${order.id}/confirmation`);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Payment simulation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      modalHeading="Complete Payment"
      modalLabel={`Payable Amount: ${formatPrice(cart.totalCents)}`}
      passiveModal
      onRequestClose={onClose}
      size="sm"
    >
      <div style={{ padding: '0.5rem 0' }}>
        {error && (
          <InlineNotification
            kind="error"
            title="Payment Failed"
            subtitle={error}
            hideCloseButton
            style={{ marginBottom: '1.25rem' }}
          />
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <Tabs
            selectedIndex={paymentMethod === 'credit_card' ? 0 : 1}
            onChange={({ selectedIndex }) =>
              setPaymentMethod(selectedIndex === 0 ? 'credit_card' : 'debit_card')
            }
          >
            <TabList aria-label="Payment method options">
              <Tab>Credit Card</Tab>
              <Tab>Debit Card</Tab>
            </TabList>
            <TabPanels>
              <TabPanel />
              <TabPanel />
            </TabPanels>
          </Tabs>
        </div>

        <form onSubmit={handlePay}>
          <div style={{ marginBottom: '1rem' }}>
            <TextInput
              id="card-number"
              labelText="Card Number"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <TextInput
              id="card-holder"
              labelText="Name on Card"
              placeholder="Full Name"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <TextInput
              id="card-expiry"
              labelText="Expiry Date (MM/YY)"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              required
            />
            <TextInput
              id="card-cvv"
              labelText="CVV"
              placeholder="123"
              type="password"
              maxLength={4}
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Button kind="secondary" type="button" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Processing...' : `Pay ${formatPrice(cart.totalCents)}`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
