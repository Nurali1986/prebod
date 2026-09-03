import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';
import { recordTokens } from '@/lib/limits';
import { buildSalesEvalPrompt, parseSalesScore } from '@/lib/sales-eval';

const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || '';
const deploymentName = 'gpt-4o-1';

const openai = new OpenAI({
  baseURL: azureEndpoint,
  apiKey: azureApiKey,
  defaultHeaders: { 'api-key': azureApiKey },
});

export async function POST(request: Request) {
  try {
    const session = await requireRole(request, 'candidate');
    const { history, product, personaId, finalEval } = await request.json();

    if (finalEval) {
      const chatHistory = (history || [])
        .map((m: any) => `${m.from === 'ai' ? 'Mijoz' : 'Sotuvchi'}: ${m.text}`)
        .join('\n');

      const prompt = buildSalesEvalPrompt(chatHistory, product);

      const response = await openai.chat.completions.create({
        model: deploymentName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      recordTokens(session.id, response.usage?.total_tokens || 0);
      const text = response.choices[0].message.content || '';
      const parsed = parseSalesScore(text);
      const score = parsed ?? 60;
      const feedback = text.replace(/JAMI\s*BALL:\s*\d+\s*\/?\s*100?/i, '').trim();

      return NextResponse.json({ score, feedback });
    }

    const sysPrompt = `Sen "${product}" mahsulotini sotib olishi kerak bo'lgan mijozsan. Lekin osonlikcha ko'nmaydigan qiyin mijozsan (Persona: ${personaId}). Sotuvchining xabarlariga qisqa, tabiiy o'zbek tilida, mijozdek javob ber. Dastlabki e'tirozlaringni bildir.`;

    const messages = [
      { role: 'system', content: sysPrompt },
      ...(history || []).map((m: any) => ({
        role: m.from === 'ai' ? 'assistant' : 'user',
        content: m.text,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: deploymentName,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 100,
    });

    recordTokens(session.id, response.usage?.total_tokens || 0);
    return NextResponse.json({ reply: response.choices[0].message.content || '...' });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Tarmoq xatosi' }, { status: 500 });
  }
}
