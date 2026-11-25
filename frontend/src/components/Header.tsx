'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Header as CarbonHeader,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Button,
} from '@carbon/react';
import {
  ShoppingCart,
  UserAvatar,
  Logout,
} from '@carbon/icons-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <CarbonHeader aria-label="Book Worm Header">
      <Link href="/" passHref legacyBehavior>
        <HeaderName prefix="">Book Worm</HeaderName>
      </Link>

      <HeaderNavigation aria-label="Book Worm Main Nav">
        <Link href="/orders" passHref legacyBehavior>
          <HeaderMenuItem>My Orders</HeaderMenuItem>
        </Link>
        <Link href="/wishlist" passHref legacyBehavior>
          <HeaderMenuItem>My Wishlist</HeaderMenuItem>
        </Link>
      </HeaderNavigation>

      <HeaderGlobalBar>
        {user ? (
          <>
            <HeaderGlobalAction
              aria-label={`Cart with ${itemCount} items`}
              tooltipAlignment="center"
              onClick={() => router.push('/cart')}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-10px',
                      backgroundColor: '#0f62fe',
                      color: '#ffffff',
                      borderRadius: '10px',
                      padding: '1px 5px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      lineHeight: '14px',
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </div>
            </HeaderGlobalAction>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.75rem',
                fontSize: '0.875rem',
                color: '#c6c6c6',
              }}
            >
              <UserAvatar size={16} style={{ marginRight: '6px' }} />
              {user.name}
            </span>

            <HeaderGlobalAction
              aria-label="Log out"
              tooltipAlignment="end"
              onClick={handleLogout}
            >
              <Logout size={20} />
            </HeaderGlobalAction>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
            <Link href="/login" passHref legacyBehavior>
              <Button size="sm" kind="ghost">
                Log in / Register
              </Button>
            </Link>
          </div>
        )}
      </HeaderGlobalBar>
    </CarbonHeader>
  );
}
