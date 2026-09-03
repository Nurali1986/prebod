import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession, type SessionPayload } from '@/lib/auth';

/** Read and verify the session from an incoming request's Cookie header. */
export async function getSessionFromRequest(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  const token = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
  return verifySession(token);
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Require any authenticated user, or throw AuthError(401). */
export async function requireUser(request: Request): Promise<SessionPayload> {
  const session = await getSessionFromRequest(request);
  if (!session) throw new AuthError(401, 'Avtorizatsiya talab qilinadi');
  return session;
}

/** Require an authenticated user with one of the given roles, or throw. */
export async function requireRole(request: Request, ...roles: string[]): Promise<SessionPayload> {
  const session = await requireUser(request);
  if (!roles.includes(session.role)) throw new AuthError(403, 'Ruxsat yo\'q');
  return session;
}

/** Convert an AuthError (or anything) into a JSON NextResponse. */
export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
}
