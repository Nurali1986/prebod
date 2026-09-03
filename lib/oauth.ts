import { prisma } from '@/lib/prisma';
import { signSession, sessionCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

/** The app's public base URL (for OAuth redirect URIs). */
export function baseUrl(request: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function googleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
export function telegramConfigured(): boolean {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);
}

const VALID_ROLES = new Set(['rep', 'manager', 'candidate', 'employer']);
export function normalizeRole(role: string | null | undefined): string {
  return role && VALID_ROLES.has(role) ? role : 'rep';
}

/**
 * Find an existing user by provider id or email, or create a new one, then
 * redirect the browser to /auth/finish with the session cookie set. Social
 * accounts are created with a null password (they can't password-login).
 */
export async function finishSocialLogin(params: {
  request: Request;
  provider: 'google' | 'telegram';
  providerId: string;
  email: string;         // real email for Google; synthetic for Telegram
  firstName: string;
  lastName: string;
  role: string;
}): Promise<NextResponse> {
  const { request, provider, providerId, email, firstName, lastName, role } = params;
  const idField = provider === 'google' ? 'googleId' : 'telegramId';

  // 1) Existing account linked to this provider id.
  let user = await prisma.user.findFirst({ where: { [idField]: providerId } as any });

  // 2) Otherwise, an existing account with the same email — link it.
  if (!user && email) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      user = await prisma.user.update({ where: { id: byEmail.id }, data: { [idField]: providerId } as any });
    }
  }

  // 3) Otherwise create a fresh account.
  if (!user) {
    user = await prisma.user.create({
      data: {
        firstName: firstName || 'Foydalanuvchi',
        lastName: lastName || '',
        email,
        password: null,
        role: normalizeRole(role),
        [idField]: providerId,
      } as any,
    });
  }

  if (user.blocked) {
    return NextResponse.redirect(new URL('/?login=1&err=blocked', baseUrl(request)));
  }

  const token = await signSession({ id: user.id, role: user.role, email: user.email });
  const res = NextResponse.redirect(new URL('/auth/finish', baseUrl(request)));
  res.headers.set('Set-Cookie', sessionCookie(token));
  return res;
}
