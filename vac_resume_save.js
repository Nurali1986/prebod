const fs = require('fs');
let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

// Replace the first button
code = code.replace(
  "onClick={() => showToast('Rezyume nashr qilindi')}>Rezyumeni nashr qilish</button>",
  "onClick={() => { saveProfile(); showToast('Rezyume nashr qilindi'); }}>Rezyumeni nashr qilish</button>"
);

// Replace the second button
code = code.replace(
  "onClick={() => showToast('Qoralama sifatida saqlandi')}>Qoralama sifatida saqlash</button>",
  "onClick={() => { saveProfile(); showToast('Qoralama sifatida saqlandi'); }}>Qoralama sifatida saqlash</button>"
);

fs.writeFileSync('app/vacansiy/page.tsx', code);
console.log('Fixed resume save buttons');
