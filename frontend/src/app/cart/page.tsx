'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tag,
  Tile,
  InlineLoading,
} from '@carbon/react';
import { ShoppingCart } from '@carbon/icons-react';
import { ShippingAddress } from '../../lib/types';
import { formatPrice, formatDeliveryBy } from '../../lib/formatters';
import { useCart } from '../../context/CartContext';
import { QuantityStepper } from '../../components/QuantityStepper';
import { AddressForm } from '../../components/AddressForm';
import { PaymentDialog } from '../../components/PaymentDialog';

export default function CartCheckoutPage() {
  const { cart, loading, updateQuantity } = useCart();

  const [address, setAddress] = useState<ShippingAddress>({
    firstName: 'Demo',
    lastName: 'Customer',
    phone: '+353 87 123 4567',
    address: '10 Grafton Street',
    city: 'Dublin',
    postalCode: 'D02 X285',
    state: 'Dublin',
    country: 'Ireland',
  });

  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [paymentOpen, setPaymentOpen] = useState(false);

  const validateAddress = (): boolean => {
    const errors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!address.firstName.trim()) errors.firstName = 'First name is required';
    if (!address.lastName.trim()) errors.lastName = 'Last name is required';
    if (!address.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9 ()-]{6,20}$/.test(address.phone.trim())) {
      errors.phone = 'Invalid phone number format';
    }
    if (!address.address.trim()) errors.address = 'Street address is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.postalCode.trim()) errors.postalCode = 'Postal code is required';
    if (!address.state.trim()) errors.state = 'State is required';
    if (!address.country.trim()) errors.country = 'Country is required';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = () => {
    if (validateAddress()) {
      setPaymentOpen(true);
    }
  };

  if (loading && !cart) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <InlineLoading description="Loading shopping cart..." />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div>
      {/* Breadcrumb: Home / Checkout */}
      <Breadcrumb style={{ marginBottom: '1.5rem' }}>
        <BreadcrumbItem>
          <Link href="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>Checkout</BreadcrumbItem>
      </Breadcrumb>

      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem', color: '#f4f4f4' }}>
        Shopping Cart & Checkout
      </h1>

      {isEmpty ? (
        <Tile style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#262626' }}>
          <ShoppingCart size={48} style={{ color: '#8d8d8d', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f4f4f4' }}>
            Your shopping cart is empty
          </h2>
          <p style={{ color: '#c6c6c6', marginBottom: '1.5rem' }}>
            Explore our curated selection of physical books and start your reading journey.
          </p>
          <Link href="/" passHref legacyBehavior>
            <Button>Browse Catalogue</Button>
          </Link>
        </Tile>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Left Column: Cart Items & Address Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.items.map((item) => (
                <Tile
                  key={item.book.id}
                  style={{
                    backgroundColor: '#262626',
                    padding: '1.25rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      aspectRatio: '2 / 3',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#161616',
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.book.coverUrl}
                      alt={item.book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      <Tag size="sm" type="cool-gray">
                        {item.book.category.name}
                      </Tag>
                      <Tag size="sm" type="outline">
                        {item.book.format}
                      </Tag>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4', marginBottom: '0.25rem' }}>
                      <Link href={`/books/${item.book.id}`} style={{ color: 'inherit' }}>
                        {item.book.title}
                      </Link>
                    </h3>

                    <div style={{ fontSize: '0.875rem', color: '#a8a8a8', marginBottom: '0.5rem' }}>
                      By {item.book.author.name}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#42be65' }}>
                      {formatDeliveryBy(item.book.estimatedDeliveryDate)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f4f4f4' }}>
                      {formatPrice(item.lineTotalCents)}
                    </div>
                    <QuantityStepper
                      quantity={item.quantity}
                      onChange={(newQty) => updateQuantity(item.book.id, newQty)}
                    />
                  </div>
                </Tile>
              ))}
            </div>

            {/* Address Form */}
            <AddressForm
              address={address}
              onChange={setAddress}
              errors={addressErrors}
            />
          </div>

          {/* Right Column: Order Summary Breakdown */}
          <Tile style={{ backgroundColor: '#262626', padding: '1.5rem', position: 'sticky', top: '70px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', color: '#f4f4f4' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c6c6c6' }}>
                <span>Price ({cart.itemCount} items)</span>
                <span style={{ color: '#f4f4f4', fontWeight: 500 }}>{formatPrice(cart.itemsTotalCents)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8d8d8d', fontSize: '0.8125rem' }}>
                <span>Includes Tax</span>
                <span>{formatPrice(cart.taxIncludedCents)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c6c6c6' }}>
                <span>Delivery charges</span>
                <span style={{ color: cart.shippingCents === 0 ? '#42be65' : '#f4f4f4', fontWeight: 500 }}>
                  {cart.shippingCents === 0 ? 'Free' : formatPrice(cart.shippingCents)}
                </span>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid #393939',
                paddingTop: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f4' }}>Total Payable</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f4f4f4' }}>
                {formatPrice(cart.totalCents)}
              </span>
            </div>

            <Button onClick={handlePayNow} style={{ width: '100%' }}>
              Pay Now
            </Button>
          </Tile>
        </div>
      )}

      {/* Payment Dialog Modal */}
      {cart && (
        <PaymentDialog
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          cart={cart}
          address={address}
        />
      )}
    </div>
  );
}
