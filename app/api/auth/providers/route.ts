import { NextResponse } from 'next/server';
import { googleConfigured, telegramConfigured } from '@/lib/oauth';

// Public: tells the client which social-login buttons to show.
export async function GET() {
  return NextResponse.json({
    google: googleConfigured(),
    telegram: telegramConfigured(),
    telegramBot: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || null,
  });
}
