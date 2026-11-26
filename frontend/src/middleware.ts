import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/cart', '/wishlist', '/orders'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !token) {
    const nextPath = `${pathname}${search}`;
    const loginUrl = new URL(`/login?next=${encodeURIComponent(nextPath)}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/wishlist/:path*', '/orders/:path*'],
};
