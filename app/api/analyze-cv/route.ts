import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import PDFParser from 'pdf2json';
import { requireRole, AuthError, authErrorResponse } from '@/lib/api-auth';

const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
const azureApiKey = process.env.AZURE_OPENAI_API_KEY || '';
const deploymentName = 'gpt-4o-1';

const openai = new OpenAI({
  baseURL: azureEndpoint,
  apiKey: azureApiKey || 'placeholder-build-key',
  defaultHeaders: { 'api-key': azureApiKey },
});

export async function POST(request: Request) {
  try {
    await requireRole(request, 'sales');
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
          pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF parse error:", errData.parserError);
            resolve("Yuklangan hujjat matnini o'qib bo'lmadi.");
          });
          pdfParser.on("pdfParser_dataReady", () => {
            const raw = pdfParser.getRawTextContent();
            const decoded = decodeURIComponent(raw);
            resolve(`Yuklangan rezyume (PDF) matni:\n${decoded}`);
          });
          pdfParser.parseBuffer(buffer);
        });
      }
    } else {
      const body = await request.json();
      vacancy = body.vacancy || {};
      const profile = body.profile || {};
      const parts: string[] = [];
      if (profile.pIsm || profile.pFam) parts.push(`Ismi: ${profile.pIsm || ''} ${profile.pFam || ''}`);
      if (profile.rTitle) parts.push(`Mutaxassislik: ${profile.rTitle}`);
      if (profile.rAbout) parts.push(`O'zi haqida: ${profile.rAbout}`);
      if (profile.rCity) parts.push(`Shahar: ${profile.rCity}`);
      if (profile.rPhone) parts.push(`Telefon: ${profile.rPhone}`);
      if (Array.isArray(profile.skills) && profile.skills.length > 0) parts.push(`Ko'nikmalari: ${profile.skills.join(', ')}`);
      if (Array.isArray(profile.expList) && profile.expList.length > 0) {
        const exps = profile.expList.map((e: any) => `${e.company || ''} — ${e.position || ''} (${e.from || ''} — ${e.to || 'hozir'})`).join('; ');
        parts.push(`Ish tajribasi: ${exps}`);
      }
      if (Array.isArray(profile.eduList) && profile.eduList.length > 0) {
        const edus = profile.eduList.map((e: any) => `${e.school || ''} — ${e.faculty || ''} (${e.year || ''})`).join('; ');
        parts.push(`Ta'lim: ${edus}`);
      }
      if (Array.isArray(profile.langList) && profile.langList.length > 0) {
        const langs = profile.langList.map((l: any) => `${l.lang || ''} (${l.level || ''})`).join(', ');
        parts.push(`Tillar: ${langs}`);
      }
      if (Array.isArray(profile.scheduleList) && profile.scheduleList.length > 0) parts.push(`Ish grafigi: ${profile.scheduleList.join(', ')}`);
      candidateInfo = parts.join('\n');
    }

    const vacDesc = vacancy.desc || vacancy.description || 'Tavsif kiritilmagan';

    const prompt = `Sen HR mutaxassisisisan. Nomzodning rezyumesi yoki profil ma'lumotlari vakansiyaga qanchalik mos kelishini baholab ber.

Vakansiya:
Lavozim: ${vacancy.title || 'Noma\'lum'}
Bo'lim: ${vacancy.dept || vacancy.department?.name || ''}
Tavsif va talablar: ${vacDesc}
Maosh: ${vacancy.salary || ''}
Joylashuv: ${vacancy.loc || ''}

Nomzod ma'lumotlari:
${candidateInfo || 'Ma\'lumot kiritilmagan'}

Qoidalar:
- Agar hujjat umuman rezyume bo'lmasa (masalan kitob, rasm, bo'sh fayl), 0 foiz ber.
- Agar nomzod ko'nikmalari, tajribasi yoki yo'nalishi vakansiyaga tegishli bo'lsa, tegishli darajada yuqori ball ber.
- Agar to'liq mos kelmasa ham, lekin o'rganish potensiali bo'lsa (masalan "tajriba talab qilinmaydi" deyilgan va nomzod ko'nikmali bo'lsa), 50-70% ber.
- "Tajriba talab qilinmaydi" degan vakansiyalarda nomzodning motivatsiyasi va asosiy ko'nikmalari muhimroq.

Javobingiz faqat bitta raqam bo'lsin (0 dan 100 gacha). Hech qanday qo'shimcha matn yozmang.`;

    const response = await openai.chat.completions.create({
      model: deploymentName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 10,
    });

    const aiResponseText = response.choices[0].message.content || '0';
    const scoreStr = aiResponseText.replace(/\D/g, '');
    const parsed = parseInt(scoreStr, 10);
    const score = Number.isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));

    return NextResponse.json({ score });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error('AI Error:', error);
    return NextResponse.json({ score: null, error: 'ai_unavailable' }, { status: 503 });
  }
}
