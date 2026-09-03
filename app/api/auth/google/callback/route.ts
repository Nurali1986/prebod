import { NextResponse } from 'next/server';
import { baseUrl, googleConfigured, finishSocialLogin, normalizeRole } from '@/lib/oauth';

function decodeJwtPayload(idToken: string): any {
  const part = idToken.split('.')[1];
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((part.length + 3) % 4);
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

// Step 2: Google redirects back with a code; exchange it and sign the user in.
export async function GET(request: Request) {
  if (!googleConfigured()) {
    return NextResponse.json({ error: 'Google login sozlanmagan' }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '';

  // CSRF: state must match the cookie we set.
  const cookie = request.headers.get('cookie') || '';
  const stateCookie = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('g_state='))?.slice(8);
  if (!code || !state || state !== stateCookie) {
    return NextResponse.redirect(new URL('/?login=1&err=oauth', baseUrl(request)));
  }
  const role = normalizeRole(state.split('.')[0]);

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl(request)}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new Error('token_exchange_failed');
    const tokens = await tokenRes.json();
    // id_token comes directly from Google over HTTPS, so its payload is trusted.
    const claims = decodeJwtPayload(tokens.id_token);

    const email = String(claims.email || '').toLowerCase();
    if (!email || claims.email_verified === false) {
      return NextResponse.redirect(new URL('/?login=1&err=email', baseUrl(request)));
    }

    return await finishSocialLogin({
      request,
      provider: 'google',
      providerId: String(claims.sub),
      email,
      firstName: claims.given_name || claims.name || 'Foydalanuvchi',
      lastName: claims.family_name || '',
      role,
    });
  } catch (e) {
    console.error('Google callback error:', e);
    return NextResponse.redirect(new URL('/?login=1&err=oauth', baseUrl(request)));
  }
}
