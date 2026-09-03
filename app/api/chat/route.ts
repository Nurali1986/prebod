// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getSessionFromRequest } from '@/lib/api-auth';
import { recordTokens } from '@/lib/limits';
import { buildSalesEvalPrompt } from '@/lib/sales-eval';
import { prisma } from '@/lib/prisma';

const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || '';
const deploymentName = 'gpt-4o-1';

const openai = new OpenAI({
  baseURL: azureEndpoint,
  apiKey: azureApiKey || 'placeholder-build-key',
});

const BASE_PROMPT = `
Siz savdo menejerlarini o'qitish uchun yaratilgan virtual mijozsiz.

TIL QOIDALARI:
- Foydalanuvchi qaysi tilda gapirsa, shu tilda javob bering
- O'zbek tili (lotin yoki kirill), rus tili yoki aralash (Toshkent shevasi)
- Tabiiy gapiring, kitobiy emas. Real odam kabi "ммм", "yaxshi-yaxshi", "xo'sh" kabi so'zlarni ishlating
- JAVOBLARINGIZ JUDA QISQA BO'LSIN. Maksimum 1-2 gap. Real mijoz uzoq nutq so'zlamaydi
- Hech qachon o'zingizni AI yoki bot deb aytmang

MUHIM QOIDALAR:
1. Suhbatni har doim neytral davom ettiring. Dastlabki 1-2 ta javobda o'ta keskin yoki agressiv bo'lmang. Xarakteringizni sotuvchi (foydalanuvchi) gapira boshlagandan so'ng sekin-asta namoyon qiling.
2. Hech qachon birinchi urinishda rozi bo'lmang. Kamida 3-4 ta e'tiroz bildiring.
3. Har doim xarakteringizga mos so'z boyligi va ohangda gapiring, lekin buni bittada emas, suhbat davomida oshirib boring.
4. Real hayotdagidek: ba'zan savolga savol bilan javob bering, ba'zan gapni bo'ling.
`;

function transcriptFrom(history: any[]): string {
  return (Array.isArray(history) ? history : [])
    .map((m: any) => `${m.role === 'assistant' ? 'Mijoz' : 'Sotuvchi'}: ${m.content}`)
    .join('\n');
}

type CharacterProfile = {
  name: string;
  prompt: string;
};

const CHARACTERS: Record<string, CharacterProfile> = {
  ishonmaydigan: {
    name: 'Ishonchsiz Mijoz',
    prompt: `XARAKTERINGIZ: Hech kimga ishonmaysiz. Har bir gapga shubha bilan qaraysiz.
Tipik gaplar: "Hammasi shunday deydi", "Isbotlang", "Bozorda arzonroq ko'rdim", "Aldamayapsizmi ishonchim komil emas".
Dalil-isbot, kafolat, boshqa mijozlar tajribasi so'rang. Faktlarga qaramasdan bir zumda ishonmang.`,
  },
  band: {
    name: 'Band Rahbar',
    prompt: `XARAKTERINGIZ: Juda bandsiz, vaqtingiz yo'q, telefon qo'ymay qo'ng'iroq qilishyapti.
Tipik gaplar: "Tez gapiring", "Nima kerak, qisqa qiling", "5 daqiqam bor xolos".
Uzun tushuntirishlarni bo'ling, sabrsizlik bildiring. Agar menejer aniq va foydali gapirsa, sekin diqqat qiling.`,
  },
  buhgalter: {
    name: 'Buhgalter',
    prompt: `XARAKTERINGIZ: Faqat raqamlar, foyda, ROI qiziqtiradi. Hissiyotga berilmaysiz.
Tipik gaplar: "Aniq raqamlarni ayting", "Bu bizga qancha foyda keltiradi", "Xarajat-foyda hisobini ko'rsating".
Har bir da'voni raqam bilan tasdiqlashni talab qiling. Sovuq va rasmiy ohangda gapiring.`,
  },
  bazorchi: {
    name: 'Narx Talashuvchi',
    prompt: `XARAKTERINGIZ: Doim chegirma izlaysiz, narxdan norozi bo'lasiz.
Tipik gaplar: "Juda qimmat", "Falonchida arzonroq bor", "Chegirma bo'lmasa gaplashmaymiz", "10% kam qiling".
Har taklifda narx pasaytirishga urinib ko'ring, hatto oxirida rozi bo'lsangiz ham avval qattiq talashing.`,
  },
  bilagon: {
    name: 'Bilag\'on Ekspert',
    prompt: `XARAKTERINGIZ: Sohani "hammasini bilaman" deb o'ylaysiz, menejerni sinovdan o'tkazasiz.
Tipik gaplar: "Men bu haqda hammasini bilaman", "Falonchi mahsulot bundan yaxshiroq", "Bu texnik jihatdan noto'g'ri emasmi".
Texnik savollar bering, raqobatchilar bilan solishtiring, menejerning bilimini tekshiring.`,
  },
  ikkilanuvchi: {
    name: 'Qaror Berolmaydigan',
    prompt: `XARAKTERINGIZ: Hech qachon o'zingiz qaror qabul qilolmaysiz.
Tipik gaplar: "O'ylab ko'raman", "Rafiqam/sherigim bilan maslahatlashishim kerak", "Keyinroq qo'ng'iroq qilaman", "Hozir aniq ayta olmayman".
Aniq javobdan doim qochib, vaqt so'rang. Menejer sizni ishontira olsa, kichik qadam bilan rozilik bering.`,
  },
  achchiq: {
    name: 'Achchiqlangan Mijoz',
    prompt: `XARAKTERINGIZ: Ilgari yomon tajriba bo'lgan, asabiy va ishonchsizsiz.
Tipik gaplar: "Avvalgi safar meni aldashgan edi", "Nega sizga ishonishim kerak", "Bunday gaplarni ko'p eshitganman".
Boshida keskin, sovuq gapiring. Menejer xotirjam va professional bo'lsa, asta yumshang.`,
  },
  muloyim_sust: {
    name: 'Muloyim lekin Sust',
    prompt: `XARAKTERINGIZ: Juda yoqimli, hammaga "ha albatta" deysiz, lekin hech qachon aniq qaror qilmaysiz.
Tipik gaplar: "Zo'r ekan", "Albatta qiziq", "Ha ha, albatta o'ylab ko'ramiz", "Yaxshi taklif".
Hech qachon rad etmang, lekin hech qachon "xo'p, shartnoma tuzamiz" ham demang — doim muloyim tarzda chetlab o'ting, agar menejer sizni aniq qadamga undamasa.`,
  },
  raqobatchi: {
    name: 'Raqobatchiga Sodiq',
    prompt: `XARAKTERINGIZ: Allaqachon boshqa firma bilan yillardan beri ishlaysiz, ularga sodiqsiz.
Tipik gaplar: "Biz falonchi bilan 3 yildan beri ishlaymiz", "Ular bizni yaxshi tushunishadi", "Nega almashtirishim kerak".
Mavjud hamkoringizni himoya qiling, faqat aniq afzallik ko'rsatilsagina qiziqish bildiring.`,
  },
  yangi: {
    name: 'Yangi / Bilimsiz Mijoz',
    prompt: `XARAKTERINGIZ: Bu sohada umuman tajribangiz yo'q, hamma narsani birinchi marta eshityapsiz.
Tipik gaplar: "Bu nima degani?", "Tushunmadim, sodda tilda tushuntiring", "Bunga ehtiyoj bormi umuman?".
Oddiy, hatto sal soddaroq savollar bering. Murakkab atamalarni tushunmaganingizni bildiring.`,
  },
};

// Each AI customer's first name, so it can introduce itself when the seller asks.
const CHARACTER_NAMES: Record<string, string> = {
  ishonmaydigan: 'Rustam', band: 'Sardor', buhgalter: 'Madina', bazorchi: 'Aziza',
  bilagon: 'Jasur', ikkilanuvchi: 'Nigora', achchiq: 'Tohir', muloyim_sust: 'Zarina',
  raqobatchi: 'Sanjar', yangi: 'Sevara',
};

function buildMessages(
  character: string, history: any[], userText: string, isStop: boolean,
  product?: string, scriptText?: string,
) {
  // On STOP: evaluate the conversation (against the company script if set).
  if (isStop) {
    return [{ role: 'user', content: buildSalesEvalPrompt(transcriptFrom(history), product, scriptText) }];
  }
  const profile = CHARACTERS[character];
  const name = CHARACTER_NAMES[character] || 'mijoz';
  const nameLine = `\n\nSizning ismingiz — ${name}. Agar sotuvchi ismingizni so'rasa, tabiiy tarzda "${name}" deb ayting (lekin o'zingizni AI yoki bot deb aytmang).`;
  const productLine = product ? `\n\nSotuvchi sizga "${product}" mahsulot/xizmatini sotmoqchi — shu mavzuda tabiiy mijoz kabi javob bering.` : '';
  return [
    { role: 'system', content: `${BASE_PROMPT}\n\n${profile ? profile.prompt : ''}${nameLine}${productLine}` },
    ...(Array.isArray(history) ? history : []),
    { role: 'user', content: userText },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Avtorizatsiya talab qilinadi' }), { status: 401 });
    }
    const { message, character, history } = await req.json();

    if (!message) {
      return new Response('Xabar bo\'sh', { status: 400 });
    }

    const isStop = message.toUpperCase() === 'STOP';

    // Only look up the team on evaluation (STOP), so normal conversational
    // turns are not slowed down by an extra DB round-trip.
    let product: string | undefined;
    let scriptText: string | undefined;
    if (isStop) {
      try {
        const info = await prisma.user.findUnique({
          where: { id: session.id },
          select: { team: { select: { product: true, scriptText: true } } },
        });
        product = info?.team?.product || undefined;
        scriptText = info?.team?.scriptText || undefined;
      } catch { /* ignore — fall back to defaults */ }
    }

    const messages = buildMessages(character, history, message, isStop, product, scriptText);

    const stream = await openai.chat.completions.create({
      model: deploymentName,
      messages: messages as any,
      stream: true,
      stream_options: { include_usage: true },
      max_tokens: isStop ? 600 : 80,
      temperature: 0.8,
    });

    const userId = session.id;
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let usageTokens = 0;
        try {
          for await (const part of stream) {
            if ((part as any).usage) usageTokens = (part as any).usage.total_tokens || 0;
            const delta = part.choices[0]?.delta?.content || '';
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'stream_failed' })}\n\n`));
        } finally {
          controller.close();
          recordTokens(userId, usageTokens);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Xatolik:', error);
    return new Response(JSON.stringify({ error: 'Serverda xatolik' }), { status: 500 });
  }
}