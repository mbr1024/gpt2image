import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, isAuthEnabled } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth', '/share', '/favicon.svg', '/icons.svg', '/manifest.json'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname.startsWith('/_next');
}

export async function middleware(request: NextRequest) {
  if (!isAuthEnabled()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const token = request.cookies.get('access_token')?.value;
  if (token && (await verifyToken(token))) {
    return NextResponse.next();
  }

  // API 请求返回 401
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  // 页面请求重定向到登录
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
