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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
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

  const fillDemo = () => {
    setEmail('demo@bookworm.local');
    setPassword('demo12345');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <Tile className="form-tile" style={{ width: '100%', maxWidth: '440px' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 600 }}>Log In</h2>

        {error && (
          <InlineNotification
            kind="error"
            title="Login Failed"
            subtitle={error}
            hideCloseButton
            style={{ marginBottom: '1.5rem' }}
          />
        )}

        <Form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <TextInput
              id="email"
              labelText="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. demo@bookworm.local"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <PasswordInput
              id="password"
              labelText="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} style={{ width: '100%', marginBottom: '1rem' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <Button
            type="button"
            kind="ghost"
            size="sm"
            onClick={fillDemo}
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            Fill Demo Credentials
          </Button>
        </Form>

        <div style={{ borderTop: '1px solid #393939', paddingTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Don&apos;t have an account?{' '}
          <Link href={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>
            Register here
          </Link>
        </div>
      </Tile>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}><InlineLoading description="Loading..." /></div>}>
      <LoginForm />
    </Suspense>
  );
}
