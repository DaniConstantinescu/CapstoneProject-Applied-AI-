'use client';

import React from 'react';
import { TextInput, Tile } from '@carbon/react';
import { ShippingAddress } from '../lib/types';

interface AddressFormProps {
  address: ShippingAddress;
  onChange: (updated: ShippingAddress) => void;
  errors?: Partial<Record<keyof ShippingAddress, string>>;
}

export function AddressForm({ address, onChange, errors = {} }: AddressFormProps) {
  const handleChange = (field: keyof ShippingAddress, val: string) => {
    onChange({
      ...address,
      [field]: val,
    });
  };

  return (
    <Tile className="responsive-tile" style={{ backgroundColor: '#262626' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', color: '#f4f4f4' }}>
        Delivery Address
      </h3>

      <div className="form-grid form-grid--2" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="address-first-name"
          labelText="First Name"
          value={address.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          invalid={Boolean(errors.firstName)}
          invalidText={errors.firstName}
          required
        />
        <TextInput
          id="address-last-name"
          labelText="Last Name"
          value={address.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          invalid={Boolean(errors.lastName)}
          invalidText={errors.lastName}
          required
        />
      </div>

      <div className="form-grid form-grid--2" style={{ marginBottom: '1rem' }}>
        <TextInput
          id="address-phone"
          labelText="Phone Number"
          placeholder="e.g. +353 87 123 4567"
          value={address.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          invalid={Boolean(errors.phone)}
          invalidText={errors.phone}
          required
        />
        <TextInput
          id="address-country"
          labelText="Country"
          value={address.country}
          onChange={(e) => handleChange('country', e.target.value)}
          invalid={Boolean(errors.country)}
          invalidText={errors.country}
          required
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <TextInput
          id="address-line"
          labelText="Street Address"
          placeholder="Street name, house/apartment number"
          value={address.address}
          onChange={(e) => handleChange('address', e.target.value)}
          invalid={Boolean(errors.address)}
          invalidText={errors.address}
          required
        />
      </div>

      <div className="form-grid form-grid--3">
        <TextInput
          id="address-city"
          labelText="City"
          value={address.city}
          onChange={(e) => handleChange('city', e.target.value)}
          invalid={Boolean(errors.city)}
          invalidText={errors.city}
          required
        />
        <TextInput
          id="address-state"
          labelText="State / Province"
          value={address.state}
          onChange={(e) => handleChange('state', e.target.value)}
          invalid={Boolean(errors.state)}
          invalidText={errors.state}
          required
        />
        <TextInput
          id="address-postal"
          labelText="Postal Code"
          value={address.postalCode}
          onChange={(e) => handleChange('postalCode', e.target.value)}
          invalid={Boolean(errors.postalCode)}
          invalidText={errors.postalCode}
          required
        />
      </div>
    </Tile>
  );
}
