import { prisma } from '@/lib/prisma';

export const DEFAULT_FREE_DAILY_LIMIT = 10;
export const PREMIUM_DAILY_LIMIT = 1000; // effectively unlimited

/** Current date as 'YYYY-MM-DD' in Asia/Tashkent (UTC+5, no DST). */
export function tashkentDay(d: Date = new Date()): string {
  const t = new Date(d.getTime() + 5 * 60 * 60 * 1000);
  return t.toISOString().slice(0, 10);
}

/** The configured global free daily simulator limit (superadmin-editable). */
export async function getFreeDailyLimit(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: 'freeDailyLimit' } });
  const n = row ? parseInt(row.value, 10) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_FREE_DAILY_LIMIT;
}

/** Effective daily limit for a user: per-user override > premium > global free. */
export function effectiveLimit(
  user: { plan?: string | null; dailyLimitOverride?: number | null },
  freeLimit: number,
): number {
  if (user.dailyLimitOverride != null) return user.dailyLimitOverride;
  if (user.plan === 'premium') return PREMIUM_DAILY_LIMIT;
  return freeLimit;
}

/** Add token usage for a user for today (best-effort; never throws). */
export async function recordTokens(userId: number, tokens: number): Promise<void> {
  if (!tokens || tokens <= 0) return;
  const day = tashkentDay();
  try {
    await prisma.simulatorUsage.upsert({
      where: { userId_day: { userId, day } },
      create: { userId, day, sessions: 0, tokens },
      update: { tokens: { increment: tokens } },
    });
  } catch { /* ignore */ }
}
