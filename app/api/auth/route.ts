import { NextResponse } from 'next/server';
import { verifyPassword, createToken, isAuthEnabled } from '@/lib/auth';

export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: '未启用密码认证' }, { status: 400 });
  }

  const { password } = await request.json();

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 });
  }

  const token = await createToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 天
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('access_token');
  return res;
}
