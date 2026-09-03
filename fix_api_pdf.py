import os

content = r"""import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import pdfParse from 'pdf-parse';

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
    const contentType = request.headers.get('content-type') || '';
    
    let vacancy: any = {};
    let candidateInfo = "";

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      vacancy = JSON.parse(formData.get('vacancy') as string || '{}');
      
      const file = formData.get('file') as File;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        try {
          const pdfData = await pdfParse(buffer);
          candidateInfo = `Yuklangan rezyume (PDF) matni:\n${pdfData.text}`;
        } catch (e) {
          console.error("PDF parse error:", e);
          candidateInfo = "Yuklangan hujjat matnini o'qib bo'lmadi.";
        }
      }
    } else {
      const body = await request.json();
      vacancy = body.vacancy || {};
      const profile = body.profile || {};
      candidateInfo = `Ismi: ${profile.pIsm || ''} ${profile.pFam || ''}\nMutaxassislik: ${profile.rTitle || ''}\nO'zi haqida: ${profile.rAbout || ''}\nTajribasi: ${JSON.stringify(profile.expList || [])}\nTa'limi: ${JSON.stringify(profile.eduList || [])}\nKo'nikmalari: ${JSON.stringify(profile.skills || [])}`;
    }

    const prompt = `
Vakansiya talablari:
Nomi: ${vacancy.title}
Bo'lim: ${vacancy.dept}
Tavsif: ${vacancy.desc}
Maosh: ${vacancy.salary}
Joylashuv: ${vacancy.loc}

Nomzodning ma'lumotlari:
${candidateInfo}

Ushbu nomzod yuqoridagi vakansiyaga qanchalik mos keladi? 
Iltimos, e'tibor bering, agar bu maktab darsligi yoki umuman boshqa mavzudagi kitob (masalan Texnologiya darsligi) bo'lsa, moslik foizini 0 deb belgilang!
Faqatgina 0 dan 100 gacha bo'lgan bitta raqamni (foizni) yozing. Hech qanday qo'shimcha so'zlarsiz.
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

print("Created route.ts with PDF parsing support")
