const fs = require('fs');

let c = fs.readFileSync('app/vacansiy/page.tsx', 'utf-8');

c = c.replace('sales: { enabled: false, product: "", scenario: "" }', 'sales: { enabled: false, product: "", personas: [] }');
c = c.replace(/sales: \{ enabled: true, product: "Ishla.*scenario: "Siz.*\}./, 'sales: { enabled: true, product: "Ishla - HR platformasi obunasi", personas: ["ishonmaydigan", "bazorchi"] }');
c = c.replace(/sales: \{ enabled: true, product: "Uy-ro'zg'or texnikasi", scenario: "" \}/, 'sales: { enabled: true, product: "Uy-ro\\'zg\\'or texnikasi", personas: ["achchiq", "band"] }');

c = c.replace(/const opener = v\.aiConfig\.sales\.scenario \|\| "Bizga bunday.*nima qilamiz\?";/, 
\let randId = "muloyim_sust";
    if (v.aiConfig.sales.personas && v.aiConfig.sales.personas.length > 0) {
        randId = v.aiConfig.sales.personas[Math.floor(Math.random() * v.aiConfig.sales.personas.length)];
    }
    const selChar = CHARACTERS.find(c => c.id === randId) || CHARACTERS[0];
    const opener = selChar.greeting || "Bizga bunday narsa hozircha kerak emasdek tuyulyapti — xarajatlarni oshirib nima qilamiz?";\);

fs.writeFileSync('app/vacansiy/page.tsx', c);
console.log('Done JS');
