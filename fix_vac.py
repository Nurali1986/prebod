import sys
import re

with open(r'c:\Trener\sales-trainer\app\vacansiy\page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('sales: { enabled: false, product: "", scenario: "" }', 'sales: { enabled: false, product: "", personas: [] }')

old_scen2 = 'sales: { enabled: true, product: "Ishla - HR platformasi obunasi", scenario: "Siz \\"Ishla\\" nomli HR platformasini korporativ mijozga sotmoqchisiz. Mijoz narx yuqori deb hisoblaydi va boshqa yechimlar borligini aytadi." }'
new_scen2 = 'sales: { enabled: true, product: "Ishla - HR platformasi obunasi", personas: ["ishonmaydigan", "bazorchi"] }'
c = c.replace(old_scen2, new_scen2)

old_scen3 = 'sales: { enabled: true, product: "Uy-ro\\'zg\\'or texnikasi", scenario: "" }'
new_scen3 = 'sales: { enabled: true, product: "Uy-ro\\'zg\\'or texnikasi", personas: ["achchiq", "band"] }'
c = c.replace(old_scen3, new_scen3)

old_opener = '''const opener = v.aiConfig.sales.scenario || "Bizga bunday narsa hozircha kerak emasdek tuyulyapti — xarajatlarni oshirib nima qilamiz?";'''
new_opener = '''let randId = "muloyim_sust";
    if (v.aiConfig.sales.personas && v.aiConfig.sales.personas.length > 0) {
        randId = v.aiConfig.sales.personas[Math.floor(Math.random() * v.aiConfig.sales.personas.length)];
    }
    const selChar = CHARACTERS.find(c => c.id === randId) || CHARACTERS[0];
    const opener = selChar.greeting || "Bizga bunday narsa hozircha kerak emasdek tuyulyapti — xarajatlarni oshirib nima qilamiz?";'''

if 'v.aiConfig.sales.scenario' in c:
    c = re.sub(r'const opener = v\.aiConfig\.sales\.scenario.*?nima qilamiz\?";', new_opener, c)


with open(r'c:\Trener\sales-trainer\app\vacansiy\page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Done')
