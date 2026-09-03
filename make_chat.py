import os

content = '''import { NextResponse } from 'next/server';
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
      // Chat tugadi, endi baholash kerak
      let chatHistory = history.map((m: any) => \\: \\).join('\\n');
      
      const prompt = \
Sen mutaxassis sotuv treynerisan (Sales Trainer).
Mijoz va Sotuvchi o'rtasidagi quyidagi suhbatni o'qib chiq. Sotuvchi "\" mahsulotini sotishga harakat qildi.

SUHBAT TARIXI:
\

Vazifang: 
Sotuvchining xato va yutuqlarini qisqacha o'zbek tilida yozib ber va eng oxirida unga 0 dan 100 gacha bo'lgan reyting balini ber.
Javob formating qat'iy shunday bo'lsin:
Yutuqlar: ...
Xatolar: ...
Xulosa: ...
SCORE: [raqam]\;

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

    // Odatiy chat yozishmasi
    const sysPrompt = \Sen "\" mahsulotini sotib olishi kerak bo'lgan mijozsan. Lekin osonlikcha ko'nmaydigan qiyin mijozsan (Persona: \). Sotuvchining xabarlariga qisqa, tabiiy o'zbek tilida, mijozdek javob ber. Dastlabki e'tirozlaringni bildir.\;
    
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
'''

os.makedirs('app/api/chat-simulator', exist_ok=True)
with open('app/api/chat-simulator/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Created route.ts for chat simulator")
