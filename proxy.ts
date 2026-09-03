import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

// Page-level route protection. API routes enforce their own authorization
// (they need per-record ownership checks), so they are not matched here.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const loginUrl = new URL('/?login=1', request.url);
  const homeUrl = new URL('/', request.url);

  if (!session) {
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/boshqaruv') && session.role !== 'superadmin') {
    return NextResponse.redirect(homeUrl);
  }
  if (pathname.startsWith('/hr') && session.role !== 'employer' && session.role !== 'superadmin') {
    return NextResponse.redirect(homeUrl);
  }
  // /chat: any authenticated user is allowed.

  return NextResponse.next();
}

export const config = {
  matcher: ['/hr/:path*', '/boshqaruv/:path*', '/chat/:path*'],
};
