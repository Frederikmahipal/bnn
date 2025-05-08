import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the access token from cookies
  const accessToken = request.cookies.get('access_token')?.value;

  // Check if trying to access dashboard without token
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/dashboard/:path*'
}; 