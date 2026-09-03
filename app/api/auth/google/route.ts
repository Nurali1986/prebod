import { NextResponse } from 'next/server';
import { baseUrl, googleConfigured, normalizeRole } from '@/lib/oauth';

// Step 1: redirect the user to Google's consent screen.
export async function GET(request: Request) {
  if (!googleConfigured()) {
    return NextResponse.json({ error: 'Google login sozlanmagan' }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const role = normalizeRole(searchParams.get('role'));
  const nonce = crypto.randomUUID();
  const state = `${role}.${nonce}`;

  const redirectUri = `${baseUrl(request)}/api/auth/google/callback`;
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('prompt', 'select_account');

  const res = NextResponse.redirect(authUrl.toString());
  // Short-lived state cookie for CSRF protection.
  res.headers.set('Set-Cookie', `g_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
  return res;
}
