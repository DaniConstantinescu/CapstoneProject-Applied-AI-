'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  TextInput,
  PasswordInput,
  Button,
  InlineNotification,
  InlineLoading,
  Tile,
} from '@carbon/react';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../lib/api';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      router.push(next);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <Tile className="form-tile" style={{ width: '100%', maxWidth: '440px' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 600 }}>Create an Account</h2>

        {error && (
          <InlineNotification
            kind="error"
            title="Registration Failed"
            subtitle={error}
            hideCloseButton
            style={{ marginBottom: '1.5rem' }}
          />
        )}

        <Form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <TextInput
              id="name"
              labelText="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <TextInput
              id="email"
              labelText="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <PasswordInput
              id="password"
              labelText="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Must be between 8 and 72 characters"
              required
            />
          </div>

          <Button type="submit" disabled={loading} style={{ width: '100%', marginBottom: '1rem' }}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </Form>

        <div style={{ borderTop: '1px solid #393939', paddingTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>
            Log in here
          </Link>
        </div>
      </Tile>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}><InlineLoading description="Loading..." /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
