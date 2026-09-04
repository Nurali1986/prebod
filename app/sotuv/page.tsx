'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';

const CATEGORIES = [
  {
    id: 'asoslar',
    icon: '📘',
    title: 'Sotuv asoslari',
    desc: 'Sotuv nima, nima uchun muhim va qanday ishlaydi',
    color: '#3b82f6',
    sections: [
      {
        title: 'Nega aynan sotuv?',
        body: `Savol: dunyodagi eng muhim ko'nikma qaysi?\n\nJavob — SOTUV. Chunki qanday biznesning hayoti sotuvdan boshlanadi. Mahsulot yoki xizmatni odamlarga yetkazish, ularni muammolarga yechim ekanini tushuntirish — bularning barchasi sotuv orqali amalga oshiriladi.\n\nAgar sotuv bo'lmasa:\n• Zavod → Mahsulot ishlab chiqaradi → SOTUV YO'Q → Hech kim sotib olmaydi\n• Ombor to'ladi → Pul kelmaydi → BIZNES YOPILADI\n\n⚠️ Mahsulot zo'r bo'lishi yetarli emas. Sotuv bo'lmasa — biznes yashamaydi.`,
      },
      {
        title: 'Sotuv nima?',
        body: `Sotuvning 3 ta ta'rifi:\n\n🔴 Oddiy tushuncha: Sotuv — bu mahsulot sotish.\nYa'ni narxga ko'ra mahsulotni sotib oluvchiga yetkazish. Bu eng sodda daraja.\n\n🟢 Amalda esa: Sotuv — insonning qarorini o'zgartirish san'ati.\nTo'g'ri yondashuvda daqiqi mijozni o'ylantiradi, uning muammosini anglab yechim qidiradi va xarid qarorini qabul qilishga yordam beradi.\n\n🟡 Aniq ta'rif: Sotuv — odamni o'zi uchun foydali qarorni qabul qilishiga yordam berish.\nBunda sotuvchi maslahatchi vazifasini o'taydi.`,
      },
      {
        title: 'Hayotning o\'zi — sotuv',
        body: `Hayotda deyarli hamma narsa sotuv:\n\n📄 BILA — O'zingizni tanishtirasiz\n📋 TALABI — Ehtiyojlaringizni bildirasiz\n💼 ISH SUHBATI — O'zingizni "sotasiz"\n👔 RAHBAR — G'oyalaringizni sotasiz\n💰 INVESTOR — Loyihangizni sotasiz\n\nBarchasi — sotuv!`,
      },
    ],
  },
  {
    id: 'menejer',
    icon: '👤',
    title: 'Sotuv menejeri',
    desc: 'Sotuv menejerining roli, vazifalari va ko\'nikmalari',
    color: '#8b5cf6',
    sections: [
      {
        title: 'Sotuv menejeri kim?',
        body: `Sotuv menejeri — kompaniyaning daromad manbai. U mijoz bilan to'g'ridan-to'g'ri muloqot qiladi, ehtiyojni aniqlaydi va mahsulotni sotadi.\n\nAsosiy vazifalari:\n• Yangi mijozlarni qidirish va jalb qilish\n• Mavjud mijozlar bilan munosabatni rivojlantirish\n• Sotuv jarayonini boshidan oxirigacha boshqarish\n• KPI va rejalarni bajarish\n• CRM tizimiga ma'lumotlarni kiritish`,
      },
      {
        title: 'Eng katta xato',
        body: `❌ Sotuvchi = operator\nFaqat telefon ko'taradi, narx aytadi, buyurtma qabul qiladi. Bunday odam — xarajat.\n\n✅ Sotuvchi = daromad yaratuvchi\nBog'lanishni boshlaydi, mijoz ehtiyojini tushunadi, echim taklif qiladi, savdoni yopadi. Bunday odam — INVESTITSIYA.\n\n⚡ Bo'limning KPI'si mahsulot emas — PUL OQIMI. Sotuvchi xarajat emas — INVESTITSIYA.`,
      },
    ],
  },
  {
    id: 'rahbar',
    icon: '👔',
    title: 'Sotuv bo\'limi rahbari',
    desc: 'Bo\'lim boshqaruvi, jamoani yetaklash va natijalarni nazorat qilish',
    color: '#059669',
    sections: [
      {
        title: 'Sotuv bo\'limining vazifasi',
        body: `Sotuv bo'limi 3 ta asosiy vazifani bajaradi:\n\n1️⃣ JALB QILISH — Yangi mijozlarni topish va qiziqtirish\n2️⃣ SOTISH — Mahsulot yoki xizmatni sotib olishga undash\n3️⃣ QAYTA SOTUV — Mavjud mijozlarga qayta-qayta sotish`,
      },
      {
        title: 'Bo\'lim kundalik ishda nima qiladi?',
        body: `• Lid bilan bog'lanadi — har bir yangi so'rovga tez javob beradi\n• Savdoni yopadi — sotuvni yakunlaydi, shartnoma tuzadi\n• Hisobot beradi — har kuni natijalarni yangilaydi\n• Mijozni kuzatadi — xarid qilgan mijozni nazorat qiladi\n• Mijozni ushlab qoladi — qo'shimcha xizmatlar taklif qiladi\n• Ma'lumot yurkladi — barcha ma'lumotni CRM tizimiga kiritadi`,
      },
    ],
  },
  {
    id: 'script',
    icon: '📝',
    title: 'Sotuv scriptlari',
    desc: 'Telefon qo\'ng\'iroqlari va uchrashuv uchun tayyor ssenariylar',
    color: '#d97706',
    sections: [
      {
        title: 'Sotuv scripti nima?',
        body: `Sotuv scripti — bu sotuvchi uchun tayyor so'zlashuv rejasi. U quyidagilardan iborat:\n\n1. Salomlashish — o'zingizni tanishtirish\n2. Qiziqtirish — mijoz e'tiborini tortish\n3. Ehtiyojni aniqlash — savollar berish\n4. Taqdimot — yechim taklif qilish\n5. E'tirozlarni yechish — shubhalarni bartaraf etish\n6. Yopish — shartnoma yoki kelishuv\n7. Follow-up — keyingi qadam belgilash`,
      },
      {
        title: 'Script yozish qoidalari',
        body: `✅ Qisqa va aniq bo'lsin — uzun matnlarni hech kim o'qimaydi\n✅ Tabiiy ohangda yozing — robotdek emas, odamdek gaplashing\n✅ Har bir bosqichda savollar bo'lsin — mijozni suhbatga torting\n✅ E'tirozlarga tayyor javoblar — eng ko'p uchraydigan e'tirozlar ro'yxati\n✅ Moslashuvchan bo'lsin — har bir mijozga moslashtirib qo'llang`,
      },
      {
        title: '📞 Namuna skript: 1-bosqich — TANISHUV',
        body: `"Assalomu alaykum! [Korxona nomi], [lavozim], mening ismim [ism]."\n\n📌 Qoida: korxona nomi + lavozim + ism — shu tartibda.\nOvoz tetik, tabassum "eshitiladigan" bo'lsin.\n\n💡 Mijoz sizni birinchi marta eshitayapti — birinchi taassurot faqat bir marta hosil bo'ladi.`,
      },
      {
        title: '📞 Namuna skript: 2-bosqich — FILTR',
        body: `"Ismingizni bilsam bo'ladimi? ... [Kursimizga] yozilib, raqamingizni qoldirgan ekansiz, to'g'rimi?"\n\n📌 Maqsad: mijoz ismini bilib olish va u so'rov qoldirganini tasdiqlash — suhbatga qonuniy asos yaratiladi.\n\n💡 Bu bosqich mijozga "sizni taniyapmiz, siz o'zingiz murojaat qilgansiz" degan ishonch beradi.`,
      },
      {
        title: '📞 Namuna skript: 3-bosqich — PROGRAMMALASHTIRISH',
        body: `"[Ism] aka/opa, keling bunday qilamiz: bizda [mahsulotning] uch xil yo'nalishi bor. Qaysi biri aynan sizga mos kelishini aniqlash uchun 3–4 ta savol beraman. Keyin mos yo'nalishni tushuntirib beraman, savollaringiz bo'lsa so'rayverasiz. Hammasi ma'qul kelsa — narx va boshqa masalalarni gaplashamiz. Shunday qilsak bo'ladimi?"\n\n📌 Eng muhim qism: suhbat rejasi e'lon qilinadi va rozilik olinadi.\n\n💡 Mijoz endi jarayonni siz boshqarayotganingizni his qiladi va bemalol ochiladi.`,
      },
      {
        title: '📞 Namuna skript: 4-bosqich — EHTIYOJNI ANIQLASH',
        body: `"Xizmatimiz siz uchunmi yoki farzandingiz uchunmi?"\n"[Mahsulot] sizga qaysi maqsad uchun kerak — chet elga ketish, universitetga kirish yoki ish uchunmi?"\n"Bu maqsadga qachongacha erishmoqchisiz?"\n\n📌 Asosiy vazifa — mijozning orzu-maqsadini o'z og'zidan ayttirish.\n\n💡 Keyin taqdimot aynan shu maqsadga bog'lanadi. Mijoz o'zi aytgan gapiga qarshi chiqolmaydi.`,
      },
      {
        title: '📞 Namuna skript: 5-bosqich — TAQDIMOT',
        body: `Taqdimot 4 qavatli qiymatdan quriladi:\n\n1️⃣ ASOSIY qiymat — mahsulotning bosh natijasi (mijoz maqsadiga bog'lab)\n2️⃣ KUTILAYOTGAN qiymat — mijoz odatda kutadigan narsalar (dastur, jadval, ustoz)\n3️⃣ QO'SHIMCHA qiymat — raqobatchilarda yo'q afzalliklar\n4️⃣ BONUS ma'lumot — sovg'a, chegirma yoki qo'shimcha imkoniyat\n\n📌 Har bir qavatni mijozning 4-qismda aytgan maqsadiga bog'lang:\n"Siz ... demoqchi edingiz — aynan shuning uchun bizda ... bor."`,
      },
      {
        title: '📞 Namuna skript: 6-bosqich — E\'TIROZLAR BILAN ISHLASH',
        body: `E'tirozga 4 qadamli javob:\n\n1. ESHITISH — Diqqat bilan, bo'lmasdan oxirigacha eshiting\n2. EMPATIYA — Mijozni maqullang: "Sizni tushunaman, bu muhim savol"\n3. TAKRORLASH — E'tirozni o'z so'zingiz bilan qaytaring\n4. YECHIM — Argument va misol bilan javob bering\n\n📌 Qoida: e'tiroz — rad javobi emas, qo'shimcha ma'lumot so'rovi.\n\n💡 E'tiroz bildirgan mijoz hali qiziqyapti. Indifferent mijoz — shunchaki "keyin qo'ng'iroq qilaman" deydi.`,
      },
      {
        title: '📞 Namuna skript: 7-bosqich — HARAKATGA UNDASH (CTA)',
        body: `"Unda kelishdik: [kun]ga yozib qo'yaman. Sizga qaysi vaqt qulay — [kun] soat [X] mi yoki [Y] mi? ... Yaxshi, [kun] soat [X] da kutamiz. Eslatma yuborishga ruxsat bering."\n\n📌 Uch element majburiy:\n✅ KUNNI belgilash\n✅ SOATNI belgilash\n✅ RUXSAT olish (eslatma yuborish uchun)\n\n⚠️ Aniq sanasiz tugagan suhbat — yo'qotilgan mijoz.\n\n💡 "Qachon qulay?" emas — "Dushanba yoki seshanba?" deb tanlav bering. Mijozga qaror qilish osonroq.`,
      },
    ],
  },
  {
    id: 'voronka',
    icon: '📊',
    title: 'Sotuv voronkalari',
    desc: 'Mijoz yo\'lini boshidan oxirigacha boshqarish',
    color: '#ec4899',
    sections: [
      {
        title: 'Sotuv voronkasi nima?',
        body: `Sotuv voronkasi — bu potentsial mijozning birinchi aloqadan xaridgacha bo'lgan yo'li. U tepadan keng, pastga tor — chunki har bir bosqichda ba'zi mijozlar tushib qoladi.\n\n📌 Voronka bosqichlari:\n1. Xabardorlik — mijoz sizni biladi\n2. Qiziqish — u ko'proq bilishni xohlaydi\n3. Ehtiyoj — u muammosini tan oladi\n4. Taklif — siz yechim taqdim etasiz\n5. Qaror — u xarid qilish yoki qilmaslikni hal qiladi\n6. Xarid — shartnoma/to'lov\n7. Sodiqlik — qayta xarid va tavsiya`,
      },
      {
        title: 'Voronkani optimallashtirish',
        body: `Har bir bosqichda konversiyani oshirish kerak:\n\n• Xabardorlik → Qiziqish: Kontent marketing, reklama\n• Qiziqish → Ehtiyoj: Konsultatsiya, demo\n• Ehtiyoj → Taklif: Shaxsiylashtirilgan taklif\n• Taklif → Qaror: E'tirozlarni bartaraf etish\n• Qaror → Xarid: Chegirmalar, kafolat, urgency\n• Xarid → Sodiqlik: After-sales xizmat, bonus dastur`,
      },
    ],
  },
  {
    id: 'qadamlar',
    icon: '🪜',
    title: 'Sotuv qadamlari',
    desc: '8 bosqichli sotuv jarayoni — tanishuvdan follow-up gacha',
    color: '#0891b2',
    sections: [
      {
        title: '8 bosqichli sotuv jarayoni',
        body: `1️⃣ Tanishuv (12 ball) — O'zingizni tanishtirish, ishonch o'rnatish\n2️⃣ Programma (8 ball) — Suhbat rejasini tushuntirish\n3️⃣ Yaqinlashuv (9 ball) — Mijoz bilan yaqin munosabat o'rnatish\n4️⃣ Ehtiyoj aniqlash (20 ball) — Savollar orqali haqiqiy ehtiyojni topish\n5️⃣ Taqdimot (20 ball) — Mahsulotni ehtiyojga moslab taqdim etish\n6️⃣ E'tirozlarni yechish (9 ball) — Shubha va qarshiliklarni bartaraf etish\n7️⃣ Yopish (16 ball) — Shartnoma tuzish, kelishuvga chiqish\n8️⃣ Follow-up (6 ball) — Keyingi qadamni belgilash, aloqani davom ettirish\n\nJami: 100 ball`,
      },
      {
        title: 'Har bir bosqichning ahamiyati',
        body: `Eng ko'p ball beriladigan bosqichlar — eng muhimlari:\n\n🔥 Ehtiyoj aniqlash (20 ball) — Agar mijoz nimani xohlashini bilmasangiz, noto'g'ri taklif qilasiz\n🔥 Taqdimot (20 ball) — Mahsulotni emas, YECHIMNI sotasiz\n🔥 Yopish (16 ball) — Oxirgi qadam — eng muhimi\n\n💡 Ko'pchilik sotuvchilar faqat taqdimotga e'tibor beradi, lekin ehtiyojni aniqlamasdan taqdimot — o'q otmasdan nishon olish bilan barobar.`,
      },
    ],
  },
  {
    id: 'crm',
    icon: '💻',
    title: 'CRM',
    desc: 'Mijozlar bazasini boshqarish va sotuv jarayonini kuzatish',
    color: '#6366f1',
    sections: [
      {
        title: 'CRM nima va nima uchun kerak?',
        body: `CRM (Customer Relationship Management) — bu mijozlar bilan munosabatlarni boshqarish tizimi.\n\nCRM tizimi nima qiladi:\n• Barcha mijozlar ma'lumotini bir joyda saqlaydi\n• Sotuv voronkasini vizual ko'rsatadi\n• Har bir mijoz bilan qayerda ekanligingizni kuzatadi\n• Vazifalar va eslatmalar o'rnatadi\n• Hisobotlar tayyorlaydi\n• Jamoa ishi samaradorligini oshiradi`,
      },
      {
        title: 'CRM dan to\'g\'ri foydalanish',
        body: `✅ Har bir qo'ng'iroqdan keyin natijani yozing\n✅ Keyingi qadam belgilang (follow-up sana)\n✅ Mijoz statusini yangilang (yangi, faol, yopilgan)\n✅ Barcha aloqalarni qayd qiling (telefon, email, uchrashish)\n✅ Haftada kamida 1 marta hisobotni ko'rib chiqing\n\n❌ Bo'sh qoldirmang — "keyin yozaman" deb unutasiz\n❌ Noto'g'ri status qo'ymang — bu hisobotlarga ta'sir qiladi`,
      },
    ],
  },
  {
    id: 'b2b-b2c-b2g',
    icon: '🤝',
    title: 'B2C, B2B, B2G sotuvlar',
    desc: 'Turli xil bozorlarda sotuv strategiyalari',
    color: '#14b8a6',
    sections: [
      {
        title: 'Sotuv turlari',
        body: `🏠 B2C (Business to Consumer) — Oddiy iste'molchiga sotish\n• Tez qaror qabul qilinadi\n• Hissiyot muhim rol o'ynaydi\n• Ko'p sonli mijozlar\n• Misol: do'konlar, onlayn savdo, xizmatlar\n\n🏢 B2B (Business to Business) — Biznesga sotish\n• Qaror uzoq vaqt oladi\n• Bir nechta qaror qabul qiluvchi\n• Katta summa va shartnomalar\n• Misol: dasturiy ta'minot, uskunalar, xom ashyo\n\n🏛️ B2G (Business to Government) — Davlatga sotish\n• Tender va konkurslar orqali\n• Hujjatlar ko'p talab qilinadi\n• Jarayon juda uzoq\n• Misol: qurilish, ta'minot, konsalting`,
      },
      {
        title: 'Asosiy farqlar',
        body: `| | B2C | B2B | B2G |\n|---|---|---|---|\n| Qaror tezligi | Tez | O'rta-sekin | Juda sekin |\n| Mijoz soni | Ko'p | O'rta | Kam |\n| Shartnoma | Oddiy | Murakkab | Juda murakkab |\n| Hissiyot | Yuqori | Past | Minimal |\n| Munosabat | Qisqa | Uzoq | Juda uzoq |`,
      },
    ],
  },
  {
    id: 'texnikalar',
    icon: '🎯',
    title: 'Sotuv texnikalari',
    desc: 'SPIN, AIDA, sandvich va boshqa samarali usullar',
    color: '#ef4444',
    sections: [
      {
        title: 'SPIN sotuv texnikasi',
        body: `SPIN — savollar orqali sotish usuli:\n\nS — Situatsiya savollari: Hozirgi holatni tushunish\n"Hozir qanday tizim ishlatayapsiz?"\n\nP — Muammo savollari: Qiyinchiliklarni aniqlash\n"Qanday qiyinchiliklar bor?"\n\nI — Implication (Oqibat) savollari: Muammoning zarari\n"Bu muammo kompaniyaga qanday ta'sir qilyapti?"\n\nN — Need-payoff (Foyda) savollari: Yechim foydasi\n"Agar bu muammo hal bo'lsa, qanday o'zgarish bo'lardi?"`,
      },
      {
        title: 'AIDA modeli',
        body: `AIDA — mijoz diqqatini bosqichma-bosqich boshqarish:\n\n👁️ A — Attention (Diqqat): E'tiborni torting\nQiziqarli sarlavha, statistika yoki savol bilan boshlang\n\n💡 I — Interest (Qiziqish): Qiziqtiring\nMijozning muammosiga tegishli ma'lumot bering\n\n❤️ D — Desire (Istak): Xohlash hissini uyg'oting\nMahsulot foydalarini ko'rsating, muvaffaqiyat hikoyalari\n\n🎯 A — Action (Harakat): Harakatga undang\nAniq CTA: "Hozir buyurtma bering", "Demo so'rang"`,
      },
      {
        title: 'Sandvich texnikasi',
        body: `Narx aytishda ishlatiladi — narxni foydalar orasiga joylashtirish:\n\n🍞 Yuqori non — Foyda: "Bu tizim har oyda 30% vaqtingizni tejaydi"\n🥩 Go'sht — Narx: "Oyiga 500,000 so'm"\n🍞 Pastki non — Foyda: "Ya'ni har kuni atigi 16,000 so'm — bir piyola qahva narxida"\n\nNatija: Mijoz narxni emas, qiymatni ko'radi.`,
      },
    ],
  },
];

export default function SotuvPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root{--ink:#16233A;--ink-soft:#5A6478;--brass:#8C6A24;--brass-bg:rgba(140,106,36,.08);--white:#fff;--paper:#FAFAF7;--paper-2:#F0EDE4;--line:#E5E1D5;--shadow:0 1px 3px rgba(0,0,0,.06);}
        .sv-hero{text-align:center;padding:48px 24px 36px;max-width:700px;margin:0 auto;}
        .sv-hero h1{font-family:'Fraunces',serif;font-size:32px;font-weight:700;color:var(--ink);margin:0 0 10px;}
        .sv-hero p{font-size:15px;color:var(--ink-soft);line-height:1.6;margin:0;}
        .sv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;max-width:1100px;margin:0 auto;padding:0 24px 60px;}
        .sv-card{background:var(--white);border:1px solid var(--line);border-radius:12px;padding:24px;cursor:pointer;transition:transform .15s,box-shadow .15s;position:relative;overflow:hidden;}
        .sv-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08);}
        .sv-card-icon{font-size:32px;margin-bottom:12px;}
        .sv-card h3{font-family:'Fraunces',serif;font-size:18px;font-weight:600;color:var(--ink);margin:0 0 6px;}
        .sv-card p{font-size:13px;color:var(--ink-soft);margin:0;line-height:1.5;}
        .sv-card-bar{position:absolute;top:0;left:0;right:0;height:4px;border-radius:12px 12px 0 0;}
        .sv-detail{max-width:800px;margin:0 auto;padding:0 24px 60px;}
        .sv-back{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;color:var(--brass);cursor:pointer;border:none;background:none;padding:8px 0;margin-bottom:20px;font-family:'Inter',sans-serif;}
        .sv-back:hover{text-decoration:underline;}
        .sv-detail-head{display:flex;align-items:center;gap:16px;margin-bottom:28px;}
        .sv-detail-head .sv-card-icon{margin:0;font-size:40px;}
        .sv-detail-head h1{font-family:'Fraunces',serif;font-size:28px;font-weight:700;color:var(--ink);margin:0;}
        .sv-detail-head p{font-size:14px;color:var(--ink-soft);margin:4px 0 0;}
        .sv-section{background:var(--white);border:1px solid var(--line);border-radius:10px;padding:28px;margin-bottom:20px;box-shadow:var(--shadow);}
        .sv-section h2{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);margin:0 0 16px;padding-bottom:12px;border-bottom:1px solid var(--line);}
        .sv-section-body{font-size:14.5px;color:var(--ink);line-height:1.75;white-space:pre-line;}
        @media(max-width:640px){
          .sv-hero{padding:32px 18px 24px;}
          .sv-hero h1{font-size:24px;}
          .sv-grid{padding:0 16px 40px;gap:12px;}
          .sv-card{padding:18px;}
          .sv-detail{padding:0 16px 40px;}
          .sv-section{padding:20px;}
          .sv-detail-head h1{font-size:22px;}
        }
      `}} />

      <Navbar active="sotuv" />

      {!activeCategory ? (
        <>
          <div className="sv-hero">
            <h1>Sotuv bo&apos;limi bilimlar bazasi</h1>
            <p>Sotuv san&apos;atini o&apos;rganing — asoslardan boshlab ilg&apos;or texnikalargacha. Har bir bo&apos;lim amaliy bilim va tayyor materiallar bilan to&apos;ldirilgan.</p>
          </div>
          <div className="sv-grid">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="sv-card" onClick={() => { setActiveCategory(cat.id); window.scrollTo(0, 0); }}>
                <div className="sv-card-bar" style={{ background: cat.color }} />
                <div className="sv-card-icon">{cat.icon}</div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
              </div>
            ))}
          </div>
        </>
      ) : activeCat && (
        <div className="sv-detail">
          <button className="sv-back" onClick={() => setActiveCategory(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Barcha mavzular
          </button>
          <div className="sv-detail-head">
            <div className="sv-card-icon">{activeCat.icon}</div>
            <div>
              <h1>{activeCat.title}</h1>
              <p>{activeCat.desc}</p>
            </div>
          </div>
          {activeCat.sections.map((sec, i) => (
            <div key={i} className="sv-section">
              <h2>{sec.title}</h2>
              <div className="sv-section-body">{sec.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
