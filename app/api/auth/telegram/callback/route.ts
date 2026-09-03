import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { baseUrl, telegramConfigured, finishSocialLogin, normalizeRole } from '@/lib/oauth';

// Telegram Login Widget redirects here (data-auth-url) with the signed user
// data. We verify the hash per Telegram's spec before trusting it.
export async function GET(request: Request) {
  if (!telegramConfigured()) {
    return NextResponse.json({ error: 'Telegram login sozlanmagan' }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const role = normalizeRole(searchParams.get('role'));
  const hash = searchParams.get('hash') || '';

  // Build the data-check-string from all fields except hash & our own role param.
  const data: Record<string, string> = {};
  searchParams.forEach((v, k) => { if (k !== 'hash' && k !== 'role') data[k] = v; });
  const checkString = Object.keys(data).sort().map(k => `${k}=${data[k]}`).join('\n');

  const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  if (computed !== hash) {
    return NextResponse.redirect(new URL('/?login=1&err=tg', baseUrl(request)));
  }
  // Reject stale logins (older than 1 day).
  const authDate = parseInt(data.auth_date || '0', 10);
  if (!authDate || Date.now() / 1000 - authDate > 86400) {
    return NextResponse.redirect(new URL('/?login=1&err=tg_expired', baseUrl(request)));
  }

  const tgId = data.id;
  if (!tgId) return NextResponse.redirect(new URL('/?login=1&err=tg', baseUrl(request)));

  return await finishSocialLogin({
    request,
    provider: 'telegram',
    providerId: tgId,
    email: `tg${tgId}@telegram.local`, // Telegram gives no email
    firstName: data.first_name || data.username || 'Telegram',
    lastName: data.last_name || '',
    role,
  });
}
