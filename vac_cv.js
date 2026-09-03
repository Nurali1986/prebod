const fs = require('fs');
let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

// Update initial draft state
code = code.replace(
  "videoLink: '', isCvLoading: false,",
  "cvSource: 'profile', videoLink: '', isCvLoading: false,"
);

// Update submitInfo
let oldSubmitInfo = `    const submitInfo = () => {
      if (!draft.cvFileName) {
        setDraft({ ...draft, cvError: true });
        return;
      }`;
let newSubmitInfo = `    const submitInfo = () => {
      if (draft.cvSource === 'upload' && !draft.cvFileName) {
        setDraft({ ...draft, cvError: true });
        return;
      }`;
code = code.replace(oldSubmitInfo, newSubmitInfo);

// Update the UI
let uiStart = `                        <div style={{ marginTop: 24, marginBottom: 24 }}>
                          <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                            Rezyume yuklash (PDF, DOCX)
                          </label>`;
let uiNew = `                        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                          <button className={\`btn \${draft.cvSource !== 'upload' ? 'btn-brass' : 'btn-outline'}\`} onClick={() => setDraft({...draft, cvSource: 'profile', cvError: false})}>Profil ma'lumotlarini jo'natish</button>
                          <button className={\`btn \${draft.cvSource === 'upload' ? 'btn-brass' : 'btn-outline'}\`} onClick={() => setDraft({...draft, cvSource: 'upload', cvError: false})}>Fayl yuklash</button>
                        </div>
                        
                        {draft.cvSource !== 'upload' ? (
                          <div style={{ background: 'var(--paper)', padding: 20, borderRadius: 12, marginBottom: 24 }}>
                            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Profil ma'lumotlaringiz asosida</div>
                            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Ismingiz, lavozimingiz, tajribangiz va ko'nikmalaringiz AI tomonidan avtomatik tahlil qilinadi.</p>
                          </div>
                        ) : (
                        <div style={{ marginTop: 24, marginBottom: 24 }}>
                          <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                            Rezyume yuklash (PDF, DOCX)
                          </label>`;

code = code.replace(uiStart, uiNew);

// Add the closing brace for the ternary
let uiEnd = `                            />
                          </label>
                          
                          {draft.cvError && (
                            <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
                              Iltimos, rezyumengizni yuklang (Keyingi bosqichga o'tish uchun majburiy)
                            </div>
                          )}
                        </div>`;
let uiEndNew = uiEnd + "\n                        )}";
code = code.replace(uiEnd, uiEndNew);

fs.writeFileSync('app/vacansiy/page.tsx', code);
console.log('Added CV source option');
