'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart } from '../lib/types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (bookId: number, quantity?: number) => Promise<Cart>;
  updateQuantity: (bookId: number, quantity: number) => Promise<Cart>;
  setCartDirect: (cart: Cart | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get<Cart>('/cart');
      setCart(res);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (bookId: number, quantity: number = 1): Promise<Cart> => {
    const updated = await api.post<Cart>('/cart/items', { bookId, quantity });
    setCart(updated);
    return updated;
  };

  const updateQuantity = async (bookId: number, quantity: number): Promise<Cart> => {
    const updated = await api.put<Cart>(`/cart/items/${bookId}`, { quantity });
    setCart(updated);
    return updated;
  };

  const setCartDirect = (c: Cart | null) => {
    setCart(c);
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        setCartDirect,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
