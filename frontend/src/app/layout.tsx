'use client';

import React from 'react';
import { Theme } from '@carbon/react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Header } from '../components/Header';
import '../styles/globals.scss';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Book Worm – E-Bookstore</title>
        <meta name="description" content="Physical e-bookstore Proof of Concept" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>" />
      </head>
      <body>
        <Theme theme="g100">
          <AuthProvider>
            <CartProvider>
              <Header />
              <div style={{ paddingTop: '48px' }}>
                <main className="main-content">{children}</main>
              </div>
            </CartProvider>
          </AuthProvider>
        </Theme>
      </body>
    </html>
  );
}
