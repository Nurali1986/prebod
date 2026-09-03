import { promises as dns } from 'dns';

// Common disposable / temporary email domains to block. Extend as needed.
const DISPOSABLE = new Set([
  'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'guerrillamail.info',
  'tempmail.com', 'temp-mail.org', 'throwawaymail.com', 'yopmail.com', 'getnada.com',
  'trashmail.com', 'sharklasers.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
  'mohmal.com', 'emailondeck.com', 'mintemail.com', 'moakt.com', 'tempmailo.com',
  'temp-mail.io', 'mail-temp.com', 'inboxkitten.com', 'mailnesia.com', 'spam4.me',
]);

export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE.has(domain.toLowerCase());
}

/**
 * Checks whether the email's domain can actually receive mail (has MX, or at
 * least an A record as a fallback). Returns:
 *  - true  → domain looks deliverable (or the lookup failed transiently → fail-open)
 *  - false → the domain definitively cannot receive mail (typo / fake domain)
 *
 * NOTE: this cannot detect a non-existent mailbox on a real domain
 * (e.g. random123@gmail.com). Only ownership verification (code/OAuth) can.
 */
export async function domainCanReceiveMail(domain: string): Promise<boolean> {
  try {
    const mx = await dns.resolveMx(domain);
    if (mx && mx.length > 0) return true;
  } catch (err: any) {
    // ENODATA/ENOTFOUND = no MX. Fall through to A-record check; other errors → fail-open.
    if (err?.code && err.code !== 'ENODATA' && err.code !== 'ENOTFOUND') return true;
  }
  // Some valid domains accept mail via an A record without MX.
  try {
    const a = await dns.resolve(domain);
    return Array.isArray(a) && a.length > 0;
  } catch (err: any) {
    if (err?.code === 'ENODATA' || err?.code === 'ENOTFOUND') return false;
    return true; // transient DNS error → don't block a legitimate user
  }
}
