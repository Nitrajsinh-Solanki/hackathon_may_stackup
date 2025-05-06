
// moodify\src\middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const protectedPaths = ['/dashboard'];

const authPaths = ['/login', '/register', '/verify-otp'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some(pp => path.startsWith(pp));
  const isAuthPath = authPaths.some(ap => path.startsWith(ap));

  try {
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      await jwtVerify(token, secret);

      if (isAuthPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } else if (isProtectedPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (error) {
    if (isProtectedPath) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set({
        name: 'auth_token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/verify-otp',
  ],
};
