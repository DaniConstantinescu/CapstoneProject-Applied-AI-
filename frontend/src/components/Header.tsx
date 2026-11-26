'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Header as CarbonHeader,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderSideNavItems,
  SideNav,
  SideNavItems,
  Button,
} from '@carbon/react';
import {
  ShoppingCart,
  UserAvatar,
  Logout,
  Login,
} from '@carbon/icons-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [sideNavOpen, setSideNavOpen] = useState(false);

  // Close the mobile side nav whenever the route changes
  useEffect(() => {
    setSideNavOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <CarbonHeader aria-label="Book Worm Header">
      <HeaderMenuButton
        aria-label={sideNavOpen ? 'Close menu' : 'Open menu'}
        isActive={sideNavOpen}
        aria-expanded={sideNavOpen}
        onClick={() => setSideNavOpen((open) => !open)}
      />

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

      {/* Mobile / tablet navigation drawer (shown below Carbon's lg breakpoint) */}
      <SideNav
        aria-label="Side navigation"
        expanded={sideNavOpen}
        isPersistent={false}
        onOverlayClick={() => setSideNavOpen(false)}
        onSideNavBlur={() => setSideNavOpen(false)}
      >
        <SideNavItems>
          <HeaderSideNavItems>
            {user && (
              <li className="header-sidenav-user">
                <UserAvatar size={16} />
                <span>{user.name}</span>
              </li>
            )}
            <Link href="/" passHref legacyBehavior>
              <HeaderMenuItem isActive={pathname === '/'}>Catalogue</HeaderMenuItem>
            </Link>
            <Link href="/orders" passHref legacyBehavior>
              <HeaderMenuItem isActive={pathname?.startsWith('/orders')}>My Orders</HeaderMenuItem>
            </Link>
            <Link href="/wishlist" passHref legacyBehavior>
              <HeaderMenuItem isActive={pathname === '/wishlist'}>My Wishlist</HeaderMenuItem>
            </Link>
            <Link href="/cart" passHref legacyBehavior>
              <HeaderMenuItem isActive={pathname === '/cart'}>
                Cart{itemCount > 0 ? ` (${itemCount})` : ''}
              </HeaderMenuItem>
            </Link>
          </HeaderSideNavItems>
        </SideNavItems>
      </SideNav>

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

            <span className="header-user-name">
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
          <>
            <div className="header-login-full">
              <Link href="/login" passHref legacyBehavior>
                <Button size="sm" kind="ghost">
                  Log in / Register
                </Button>
              </Link>
            </div>
            <HeaderGlobalAction
              className="header-login-icon"
              aria-label="Log in"
              tooltipAlignment="end"
              onClick={() => router.push('/login')}
            >
              <Login size={20} />
            </HeaderGlobalAction>
          </>
        )}
      </HeaderGlobalBar>
    </CarbonHeader>
  );
}
