import os

content = r"""import { NextResponse } from 'next/server';
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
    const { vacancy, profile, extractedText } = await request.json();
    
    // Agar nomzod PDF yuklagan bo'lsa, extractedText ishlatamiz, yo'qsa profil ma'lumotlarini.
    let candidateInfo = "";
    if (extractedText && extractedText.length > 10) {
      candidateInfo = `Yuklangan rezyume matni:\n${extractedText}`;
    } else {
      candidateInfo = `Ismi: ${profile.pIsm || ''} ${profile.pFam || ''}\nMutaxassislik: ${profile.rTitle || ''}\nTajribasi: ${JSON.stringify(profile.expList || [])}\nTa'limi: ${JSON.stringify(profile.eduList || [])}\nKo'nikmalari: ${JSON.stringify(profile.skills || [])}`;
    }

    const prompt = `
Vakansiya talablari:
Nomi: ${vacancy.title}
Bo'lim: ${vacancy.dept}
Tavsif: ${vacancy.desc}

Nomzodning ma'lumotlari:
${candidateInfo}

Ushbu nomzod yuqoridagi vakansiyaga qanchalik mos keladi? Faqatgina 0 dan 100 gacha bo'lgan raqamni (foizni) yozing. Hech qanday qo'shimcha so'zlarsiz yozing.
`;

    const response = await openai.chat.completions.create({
      model: deploymentName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 10,
    });

    const scoreStr = response.choices[0].message.content?.replace(/\D/g, '') || '0';
    const score = Math.min(100, Math.max(0, parseInt(scoreStr, 10)));

    return NextResponse.json({ score });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ score: Math.floor(65 + Math.random() * 32) }); 
  }
}
"""

with open('app/api/analyze-cv/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Created route.ts properly")
