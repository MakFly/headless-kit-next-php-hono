import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_BACKEND_COOKIE } from '@/lib/auth/backend-context';

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth/login', request.url));

  response.cookies.set(AUTH_BACKEND_COOKIE, 'laravel', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  return response;
}
