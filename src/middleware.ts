import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/marketplace/',
  'vendors',
  'about-us',
  'help',
  'privact-policy',
  'terms-of-services',
  'cookie-policy',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const path = req.nextUrl.pathname;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (!token && isPublic) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
 
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/uploads|.*\\.(?:png|jpg|jpeg|svg|webp|css|js)$|api).*)',
  ],
};
