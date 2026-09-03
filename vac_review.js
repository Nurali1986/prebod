const fs = require('fs');
let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

code = code.replace(
  '<div className="review-row"><span className="k">CV fayli</span><span className="v">{draft.cvFileName}</span></div>',
  `<div className="review-row"><span className="k">CV manbasi</span><span className="v">{draft.cvSource === 'upload' ? draft.cvFileName : 'Profil ma\\'lumotlari'}</span></div>`
);

fs.writeFileSync('app/vacansiy/page.tsx', code);
console.log('Fixed review rendering for CV source');
