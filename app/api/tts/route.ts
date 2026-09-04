import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/api-auth';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const ALLOWED_VOICES = new Set(['uz-UZ-MadinaNeural', 'uz-UZ-SardorNeural']);

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const voiceParam = searchParams.get('voice') || '';
  const voice = ALLOWED_VOICES.has(voiceParam) ? voiceParam : 'uz-UZ-MadinaNeural';
  const gender = voice.includes('Sardor') ? 'Male' : 'Female';

  if (!text) return new NextResponse('Missing text', { status: 400 });
  if (text.length > 1000) return new NextResponse('Text too long', { status: 400 });

  try {
    const AZURE_KEY = process.env.AZURE_TTS_API_KEY;
    const AZURE_REGION = process.env.AZURE_TTS_REGION;

    if (!AZURE_KEY || !AZURE_REGION) {
      console.error('Azure TTS credentials are not configured in .env.local');
      return new NextResponse('TTS configuration error', { status: 500 });
    }

    const ssml = `<speak version='1.0' xml:lang='uz-UZ'><voice xml:lang='uz-UZ' xml:gender='${gender}' name='${voice}'>${escapeXml(text)}</voice></speak>`;

    const url = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'sales-trainer-tts'
      },
      body: ssml
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure TTS API returned ${response.status}: ${errorText}`);
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Azure TTS proxy error:', error);
    return new NextResponse('Error generating TTS', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { texts, voice: voiceParam } = await request.json();
  if (!Array.isArray(texts) || texts.length === 0) return new NextResponse('Missing texts', { status: 400 });

  const voice = ALLOWED_VOICES.has(voiceParam) ? voiceParam : 'uz-UZ-MadinaNeural';
  const gender = voice.includes('Sardor') ? 'Male' : 'Female';
  const AZURE_KEY = process.env.AZURE_TTS_API_KEY;
  const AZURE_REGION = process.env.AZURE_TTS_REGION;
  if (!AZURE_KEY || !AZURE_REGION) return new NextResponse('TTS configuration error', { status: 500 });

  const url = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < texts.length; i++) {
        const t = String(texts[i]).slice(0, 1000);
        if (!t.trim()) continue;
        const ssml = `<speak version='1.0' xml:lang='uz-UZ'><voice xml:lang='uz-UZ' xml:gender='${gender}' name='${voice}'>${escapeXml(t)}</voice></speak>`;
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': AZURE_KEY,
              'Content-Type': 'application/ssml+xml',
              'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
              'User-Agent': 'sales-trainer-tts',
            },
            body: ssml,
          });
          if (!res.ok || !res.body) {
            controller.enqueue(encoder.encode(`event: chunk\ndata: ${JSON.stringify({ index: i, error: true })}\n\n`));
            continue;
          }
          const buf = await res.arrayBuffer();
          const b64 = Buffer.from(buf).toString('base64');
          controller.enqueue(encoder.encode(`event: chunk\ndata: ${JSON.stringify({ index: i, audio: b64 })}\n\n`));
        } catch {
          controller.enqueue(encoder.encode(`event: chunk\ndata: ${JSON.stringify({ index: i, error: true })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' },
  });
}
