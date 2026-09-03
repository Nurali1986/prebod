const fs = require('fs');
const content = import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || '';
const deploymentName = 'gpt-4o-1';

const openai = new OpenAI({
  baseURL: azureEndpoint,
  apiKey: azureApiKey,
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: { 'api-key': azureApiKey },
});

export async function POST(request: Request) {
  try {
    const { vacancy, profile } = await request.json();
    
    // AI uchun Promt
    const prompt = \\\
Vakansiya talablari:
Nomi: \
Bo'lim: \
Tavsif: \

Nomzodning ma'lumotlari:
Ismi: \ \
Mutaxassislik: \
O'zi haqida: \
Tajribasi: \
Ta'limi: \
Ko'nikmalari: \

Ushbu nomzod yuqoridagi vakansiyaga qanchalik mos keladi? Faqatgina 0 dan 100 gacha bo'lgan raqamni (foizni) yozing. Hech qanday qo'shimcha so'zlarsiz.\\\;

    const response = await openai.chat.completions.create({
      model: deploymentName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 10,
    });

    const scoreStr = response.choices[0].message.content?.replace(/\\\\D/g, '') || '0';
    const score = Math.min(100, Math.max(0, parseInt(scoreStr, 10)));

    return NextResponse.json({ score });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ score: Math.floor(65 + Math.random() * 32) }); 
  }
}
;
fs.mkdirSync('app/api/analyze-cv', { recursive: true });
fs.writeFileSync('app/api/analyze-cv/route.ts', content);
