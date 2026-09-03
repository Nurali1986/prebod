const fs = require('fs');

const content = `import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import PDFParser from 'pdf2json';

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
        
        candidateInfo = await new Promise((resolve) => {
          const pdfParser = new PDFParser(null, 1);
          pdfParser.on("pdfParser_dataError", errData => {
            console.error("PDF parse error:", errData.parserError);
            resolve("Yuklangan hujjat matnini o'qib bo'lmadi.");
          });
          pdfParser.on("pdfParser_dataReady", pdfData => {
            resolve(\`Yuklangan rezyume (PDF) matni:\\n\${pdfParser.getRawTextContent()}\`);
          });
          pdfParser.parseBuffer(buffer);
        });
      }
    } else {
      const body = await request.json();
      vacancy = body.vacancy || {};
      const profile = body.profile || {};
      candidateInfo = \`Ismi: \${profile.pIsm || ''} \${profile.pFam || ''}\\nMutaxassislik: \${profile.rTitle || ''}\\nO'zi haqida: \${profile.rAbout || ''}\\nTajribasi: \${JSON.stringify(profile.expList || [])}\\nTa'limi: \${JSON.stringify(profile.eduList || [])}\\nKo'nikmalari: \${JSON.stringify(profile.skills || [])}\`;
    }

    const prompt = \`Vakansiya talablari:
Nomi: \${vacancy.title}
Bo'lim: \${vacancy.dept}
Tavsif: \${vacancy.desc}
Maosh: \${vacancy.salary}
Joylashuv: \${vacancy.loc}

Nomzodning ma'lumotlari:
\${candidateInfo}

Ushbu nomzod yuqoridagi vakansiyaga qanchalik mos keladi? 
Iltimos, e'tibor bering, agar bu hujjat umuman boshqa mavzudagi kitob (masalan maktab darsligi) yoki rezyumega umuman aloqador bo'lmagan matn bo'lsa, moslik foizini 0 deb belgilang!
Faqatgina 0 dan 100 gacha bo'lgan bitta raqamni (foizni) yozing. Hech qanday qo'shimcha so'zlarsiz.\`;

    const response = await openai.chat.completions.create({
      model: deploymentName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 10,
    });

    const scoreStr = response.choices[0].message.content?.replace(/\\D/g, '') || '0';
    const score = Math.min(100, Math.max(0, parseInt(scoreStr, 10)));

    return NextResponse.json({ score });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ score: 0 }); // Fallback to 0 to prevent fake scores 
  }
}
`;

fs.writeFileSync('app/api/analyze-cv/route.ts', content);
console.log('Fixed route.ts with PDFParser');
