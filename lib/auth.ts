import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'gpt2image-default-jwt-secret-key',
);

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD ?? '';

export function isAuthEnabled(): boolean {
  return ACCESS_PASSWORD.length > 0;
}

export function verifyPassword(password: string): boolean {
  return password === ACCESS_PASSWORD;
}

export async function createToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}
