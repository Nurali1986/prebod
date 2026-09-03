// Dependency-free, Edge-compatible session tokens signed with HMAC-SHA256 via
// the Web Crypto API. Works in both Next.js middleware (Edge runtime) and
// route handlers (Node runtime). The token is stored in an httpOnly cookie so
// it cannot be read or forged from client-side JavaScript.

export const SESSION_COOKIE = 'ishla_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  id: number;
  role: string;
  email: string;
  exp: number; // epoch seconds
};

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET is not set');
    }
    return 'dev-insecure-secret-change-me';
  }
  return s;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64url.length + 3) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/** Constant-time comparison of two byte arrays. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signSession(
  data: Omit<SessionPayload, 'exp'>,
  maxAgeSeconds = MAX_AGE_SECONDS,
): Promise<string> {
  const payload: SessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const body = bytesToBase64url(enc.encode(JSON.stringify(payload)));
  const key = await hmacKey();
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(body)));
  return `${body}.${bytesToBase64url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  try {
    const key = await hmacKey();
    const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(body)));
    if (!timingSafeEqual(expected, base64urlToBytes(sig))) return null;
    const payload = JSON.parse(dec.decode(base64urlToBytes(body))) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Serialized Set-Cookie header value for a fresh session. */
export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax;${secure} Max-Age=${MAX_AGE_SECONDS}`;
}

/** Serialized Set-Cookie header value that clears the session. */
export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax;${secure} Max-Age=0`;
}
