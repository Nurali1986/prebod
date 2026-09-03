const fs = require('fs');

const content = `import { NextResponse } from 'next/server';
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
    const { history, product, personaId, finalEval } = await request.json();

    if (finalEval) {
      let chatHistory = history.map((m: any) => \`\${m.from === 'ai' ? 'Mijoz' : 'Sotuvchi'}: \${m.text}\`).join('\n');
      
      const prompt = \`Sen mutaxassis sotuv treynerisan (Sales Trainer).
Mijoz va Sotuvchi o'rtasidagi quyidagi suhbatni o'qib chiq. Sotuvchi "\${product}" mahsulotini sotishga harakat qildi.

SUHBAT TARIXI:
\${chatHistory}

Vazifang: 
Sotuvchining xato va yutuqlarini qisqacha o'zbek tilida yozib ber va eng oxirida unga 0 dan 100 gacha bo'lgan reyting balini ber.
Javob formating qat'iy shunday bo'lsin:
Yutuqlar: ...
Xatolar: ...
Xulosa: ...
SCORE: [raqam]\`;

      const response = await openai.chat.completions.create({
        model: deploymentName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const text = response.choices[0].message.content || '';
      const scoreMatch = text.match(/SCORE:\s*(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 70;

      return NextResponse.json({ score, feedback: text.replace(/SCORE:\s*\d+/, '').trim() });
    }

    const sysPrompt = \`Sen "\${product}" mahsulotini sotib olishi kerak bo'lgan mijozsan. Lekin osonlikcha ko'nmaydigan qiyin mijozsan (Persona: \${personaId}). Sotuvchining xabarlariga qisqa, tabiiy o'zbek tilida, mijozdek javob ber. Dastlabki e'tirozlaringni bildir.\`;
    
    const messages = [
      { role: 'system', content: sysPrompt },
      ...history.map((m: any) => ({
        role: m.from === 'ai' ? 'assistant' : 'user',
        content: m.text
      }))
    ];

    const response = await openai.chat.completions.create({
      model: deploymentName,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 100,
    });

    return NextResponse.json({ reply: response.choices[0].message.content || '...' });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Tarmoq xatosi' }, { status: 500 });
  }
}
`;

fs.writeFileSync('app/api/chat-simulator/route.ts', content);
console.log('Fixed route.ts with Node properly');
