const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deptCount = await prisma.department.count();
  if (deptCount > 0) {
    console.log("Database already seeded. Skipping...");
    return;
  }
  
  // Bo'limlar va savollarni yaratish
  const depts = [
    {
      name: "IT va mahsulot",
      tests: {
        create: [
          { text: "React'da komponent holatini boshqarish uchun qaysi hook ishlatiladi?", options: ["useEffect", "useState", "useMemo", "useRef"], correct: 1 },
          { text: "Virtual DOM nima uchun kerak?", options: ["Server bilan aloqa qilish uchun", "Interfeys yangilanishini tezlashtirish uchun", "CSS stilini yozish uchun", "Ma'lumotlar bazasiga ulanish uchun"], correct: 1 }
        ]
      },
      openQs: {
        create: [
          { text: "Oxirgi loyihangizda duch kelgan eng qiyin texnik muammoni tasvirlab bering." },
          { text: "Nima uchun aynan shu lavozimga hujjat topshirmoqdasiz?" }
        ]
      }
    },
    {
      name: "Marketing",
      tests: {
        create: [
          { text: "SMM strategiyasining asosiy maqsadi nima?", options: ["Faqat like yig'ish", "Auditoriya bilan aloqa va brend tanilishini oshirish", "Faqat reklama byudjetini sarflash", "Raqobatchilarni nazorat qilish"], correct: 1 }
        ]
      },
      openQs: {
        create: [
          { text: "Marketing byudjetini qanday taqsimlaysiz?" }
        ]
      }
    },
    { name: "Sotuv" },
    {
      name: "Moliya",
      tests: {
        create: [
          { text: "Debet va kredit tushunchalari qaysi sohaga tegishli?", options: ["Marketing", "Buxgalteriya", "Dizayn", "Logistika"], correct: 1 }
        ]
      }
    },
    { name: "HR" },
    { name: "Qurilish" },
    { name: "Boshqaruv" }
  ];

  for (const d of depts) {
    await prisma.department.create({ data: d });
  }

  const itDept = await prisma.department.findUnique({ where: { name: "IT va mahsulot" } });
  const marketingDept = await prisma.department.findUnique({ where: { name: "Marketing" } });
  const moliyaDept = await prisma.department.findUnique({ where: { name: "Moliya" } });
  const sotuvDept = await prisma.department.findUnique({ where: { name: "Sotuv" } });

  // Vakansiyalar
  await prisma.vacancy.create({
    data: {
      title: "Frontend dasturchi (React)", type: "To'liq stavka", loc: "Toshkent", salary: "10 000 000 – 15 000 000 so'm", status: "active", posted: "12-sentyabr",
      departmentId: itDept.id,
      cvMinScore: 70, cvCheckEnabled: true,
      testEnabled: true,
      openQEnabled: true,
      salesEnabled: false, salesProduct: "", salesPersonas: [],
      videoEnabled: true, videoPrompt: "O'zingiz va tajribangiz haqida 1–2 daqiqalik video yozing.",
      vacancyTests: {
        create: [
          { text: "React'da komponent holatini boshqarish uchun qaysi hook ishlatiladi?", options: ["useEffect", "useState", "useMemo", "useRef"], correct: 1 },
          { text: "Virtual DOM nima uchun kerak?", options: ["Server bilan aloqa qilish uchun", "Interfeys yangilanishini tezlashtirish uchun", "CSS stilini yozish uchun", "Ma'lumotlar bazasiga ulanish uchun"], correct: 1 }
        ]
      },
      vacancyOpenQs: {
        create: [
          { text: "Oxirgi loyihangizda duch kelgan eng qiyin texnik muammoni tasvirlab bering." },
          { text: "Nima uchun aynan shu lavozimga hujjat topshirmoqdasiz?" }
        ]
      },
      candidates: {
        create: [
          {
            name: "Aziz Karimov", role: "React, TypeScript, 3 yil", match: 92, stage: 'interview', cvScore: 94, testScore: 88, videoLink: "https://youtube.com/watch?v=demo1",
            openAnswers: {
              create: [
                { question: "Oxirgi loyihangizda duch kelgan eng qiyin texnik muammoni tasvirlab bering.", answer: "Katta hajmdagi jadvalni virtualizatsiya qilib, sahifa tezligini 3 barobar oshirdim." },
                { question: "Nima uchun aynan shu lavozimga hujjat topshirmoqdasiz?", answer: "Frontend arxitektura bilan chuqur shug'ullanishni va jamoa bilan o'sishni istayman." }
              ]
            }
          }
        ]
      }
    }
  });

  await prisma.vacancy.create({
    data: {
      title: "Marketing menejeri", type: "To'liq stavka", loc: "Toshkent", salary: "7 000 000 – 10 000 000 so'm", status: "active", posted: "18-avgust",
      departmentId: marketingDept.id,
      cvMinScore: 60, cvCheckEnabled: true, testEnabled: false, openQEnabled: false,
      salesEnabled: true, salesProduct: "Ishla - HR platformasi obunasi", salesPersonas: ["ishonmaydigan", "bazorchi"],
      videoEnabled: false, videoPrompt: "",
      candidates: {
        create: [
          { name: "Madina Tosheva", role: "SMM, 3 yil tajriba", match: 80, stage: 'review', cvScore: 80, salesScore: 74 }
        ]
      }
    }
  });

  await prisma.vacancy.create({
    data: {
      title: "Buxgalter", type: "To'liq stavka", loc: "Toshkent", salary: "6 000 000 – 8 500 000 so'm", status: "draft", posted: "—",
      departmentId: moliyaDept.id,
      cvMinScore: 70, cvCheckEnabled: false, testEnabled: false, openQEnabled: false,
      salesEnabled: false, salesProduct: "", salesPersonas: [], videoEnabled: false, videoPrompt: ""
    }
  });

  await prisma.vacancy.create({
    data: {
      title: "Sotuv bo'yicha mutaxassis", type: "To'liq stavka", loc: "Farg'ona", salary: "5 000 000 + bonus", status: "closed", posted: "3-iyul",
      departmentId: sotuvDept.id,
      cvMinScore: 55, cvCheckEnabled: true, testEnabled: false, openQEnabled: false,
      salesEnabled: true, salesProduct: "Uy-ro'zg'or texnikasi", salesPersonas: ["achchiq", "band"],
      videoEnabled: false, videoPrompt: ""
    }
  });

  console.log("Database seeded!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
