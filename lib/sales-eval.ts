// Standard sales-script evaluation, based on the Pifagor school sales rubric
// (8 stages, 100 points), generalized so it applies to selling ANY product or
// service. Both the practice simulator (/api/chat) and the application-flow
// simulator (/api/chat-simulator) use this single source of truth.

export const SALES_STAGES = [
  { key: 'tanishuv', label: 'Tanishuv', max: 12 },
  { key: 'programma', label: 'Programmalashtirish', max: 8 },
  { key: 'yaqinlashuv', label: 'Yaqinlashuv (iliq muhit)', max: 9 },
  { key: 'ehtiyoj', label: 'Ehtiyojni aniqlash', max: 20 },
  { key: 'taqdimot', label: 'Taqdimot', max: 20 },
  { key: 'etiroz', label: "E'tirozlar bilan ishlash", max: 9 },
  { key: 'yopish', label: 'Yopish / keyingi qadam', max: 16 },
  { key: 'followup', label: 'Follow-up / xayrlashuv', max: 6 },
] as const;

/**
 * Builds the trainer prompt that scores a transcript. `product` is what the
 * seller was trying to sell. If `scriptText` is given, the conversation is
 * scored against THAT company script instead of the default standard rubric.
 */
export function buildSalesEvalPrompt(transcript: string, product?: string, scriptText?: string): string {
  const productLine = product
    ? `Sotuvchi "${product}" mahsulot/xizmatini sotishga harakat qildi.`
    : `Sotuvchi mijozga mahsulot/xizmat sotishga harakat qildi.`;

  if (scriptText && scriptText.trim()) {
    return `Sen mutaxassis sotuv treynerisan. ${productLine}
Quyidagi suhbatni KOMPANIYANING O'Z SOTUV SKRIPTI asosida baholang.

=== KOMPANIYA SKRIPTI (etalon) ===
${scriptText.trim()}
=== SKRIPT TUGADI ===

SUHBAT TARIXI:
${transcript}

Vazifang: sotuvchi yuqoridagi kompaniya skriptiga qanchalik rioya qilganini baholang.
Skriptdagi asosiy bosqich va talablarni aniqlang, har biriga sotuvchi amal qildimi — tekshiring.
Umumiy ballni 0 dan 100 gacha bering (skriptga to'liq rioya = 100).

Javob formatini QAT'IY o'zbek tilida shunday ber:
📊 BAHOLASH (kompaniya skripti bo'yicha):
- [Skriptdagi har bir asosiy bosqich]: bajarildi / qisman / bajarilmadi + qisqa izoh
...

💡 Kuchli tomonlari: ...
⚠️ Skriptdan chetlanishlar va xatolar: ...
🎯 Tavsiyalar: ...
JAMI BALL: X/100`;
  }

  return `Sen mutaxassis sotuv treynerisan. ${productLine}
Quyidagi suhbatni O'ZBEK korxonalari uchun standart sotuv skripti bo'yicha baholang.
Skript qaysi mahsulot sotilishidan qat'i nazar bir xil ketma-ketlikda bo'lishi kerak.

SUHBAT TARIXI:
${transcript}

Har bir bosqichni belgilangan maksimal ball asosida baholang (sotuvchi shu bosqichni bajardimi, qanchalik sifatli):

1. TANISHUV (0–12) — salomlashish, o'zini ism va kompaniya bilan tanishtirish, suhbat uchun ruxsat/vaqt so'rash, boshlang'ich e'tirozga to'g'ri javob.
2. PROGRAMMALASHTIRISH (0–8) — suhbat rejasini oldindan aytib, mijozdan rozilik olish ("bir necha savol beraman, keyin mos-mosligini aytaman" mantig'i).
3. YAQINLASHUV / ILIQ MUHIT (0–9) — iliq, tabiiy muloqot, shaxsiy savollar, mijozni tinglash (80/20 qoidasi).
4. EHTIYOJNI ANIQLASH (0–20) — ochiq va SPIN savollar (vaziyat, muammo, oqibat, yechim), mijozning og'riq nuqtalari va maqsadini aniqlash, qaror qabul qiluvchini aniqlash.
5. TAQDIMOT (0–20) — mijozning aynan o'z og'rig'iga bog'langan taklif (Vaziyat → Taklif → Foyda), ortiqcha emas 2–3 ta kuchli yechim, foyda va natijaga urg'u.
6. E'TIROZLAR BILAN ISHLASH (0–9) — POAP ketma-ketligi (qo'shilish → javob/burilish → argument → undov), narxni investitsiyaga aylantirish, ijtimoiy tasdiqlash.
7. YOPISH / KEYINGI QADAM (0–16) — aniq va kichik keyingi qadam taklifi, alternativ tanlov ("X mi yoki Y mi?"), cheklov/muhimlik motivi, kelishuv.
8. FOLLOW-UP / XAYRLASHUV (0–6) — kelishilgan narsalarni takrorlash, eslatma, iliq yakun.

Agar biror bosqich suhbatda umuman bo'lmagan bo'lsa, unga 0 qo'y va buni xatolar qismida alohida ta'kidlang.

Javob formatini QAT'IY o'zbek tilida shunday ber:
📊 BAHOLASH (standart sotuv skripti bo'yicha):
- Tanishuv: X/12
- Programmalashtirish: X/8
- Yaqinlashuv: X/9
- Ehtiyojni aniqlash: X/20
- Taqdimot: X/20
- E'tirozlar bilan ishlash: X/9
- Yopish: X/16
- Follow-up: X/6

💡 Kuchli tomonlari: ...
⚠️ Yetishmagan bosqichlar va xatolar: ...
🎯 Tavsiyalar: ...
JAMI BALL: X/100`;
}

/** Parses the 0–100 total score from an evaluation text. */
export function parseSalesScore(text: string): number | null {
  // Tolerate markdown/punctuation between the label and the number
  // (e.g. "**JAMI BALL:** 72/100").
  const jami = text.match(/JAMI\s*BALL[^\d]{0,6}(\d+)/i);
  if (jami) return clamp(parseInt(jami[1], 10));
  const score = text.match(/SCORE[^\d]{0,6}(\d+)/i);
  if (score) return clamp(parseInt(score[1], 10));
  // Fallback: sum the per-stage "X/max" lines.
  let sum = 0, found = false;
  for (const s of SALES_STAGES) {
    const re = new RegExp(`/\\s*${s.max}\\b`);
    const line = text.split('\n').find(l => re.test(l) && /\d+\s*\//.test(l));
    if (line) {
      const m = line.match(/(\d+)\s*\//);
      if (m) { sum += Math.min(s.max, parseInt(m[1], 10)); found = true; }
    }
  }
  return found ? clamp(sum) : null;
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}
