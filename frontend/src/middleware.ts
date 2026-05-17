import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/signin' || pathname === '/signup';
  const isProtectedRoute = pathname === '/' || pathname.startsWith('/dashboard');

  // If user is not logged in and attempts to access a protected route
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/signin', request.url);
    // Keep track of the original page to redirect back after login
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and attempts to access auth pages (signin/signup)
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Ensure the middleware runs on the dashboard (root) and auth pages
export const config = {
  matcher: ['/', '/signin', '/signup', '/dashboard/:path*'],
};
