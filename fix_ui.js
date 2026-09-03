const fs = require('fs');

let code = fs.readFileSync('app/vacansiy/page.tsx', 'utf8');

// 1. Update onFilePick
code = code.replace(
  `if (f) setDraft({ ...draft, cvFileName: f.name, cvError: false, fileObj: f });`,
  `if (f) setDraft({ ...draft, cvFileName: f.name, cvError: false, fileObj: f, cvSource: 'file' });`
);

// 2. Fix submitInfo validation so they can pass without a file IF they chose profile
const oldValidation = `    if (!draft.cvFileName) {
      setDraft({ ...draft, cvError: true });
      return;
    }`;
const newValidation = `    if (draft.cvSource === 'file' && !draft.cvFileName) {
      setDraft({ ...draft, cvError: true });
      return;
    }`;
code = code.replace(oldValidation, newValidation);

// 3. Update the UI to have a toggle
const oldInfoStep = `                        <div style={{ marginTop: 24, marginBottom: 24 }}>
                          <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                            Rezyume yuklash (PDF, DOCX)
                          </label>`;
                          
const newInfoStep = `                        <div style={{ marginTop: 24, marginBottom: 24 }}>
                          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                            <label className={\`status-opt \${draft.cvSource === 'profile' ? 'sel-green checked' : 'sel-neutral'}\`}>
                              <input type="radio" name="cvsource" checked={draft.cvSource === 'profile'} onChange={() => setDraft({...draft, cvSource: 'profile', cvError: false})} />
                              Profil CV ni jo'natish
                            </label>
                            <label className={\`status-opt \${draft.cvSource === 'file' ? 'sel-green checked' : 'sel-neutral'}\`}>
                              <input type="radio" name="cvsource" checked={draft.cvSource === 'file'} onChange={() => setDraft({...draft, cvSource: 'file'})} />
                              Fayl yuklash
                            </label>
                          </div>
                          
                          {draft.cvSource === 'file' && (
                            <>
                              <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                                Rezyume yuklash (PDF, DOCX)
                              </label>`;
code = code.replace(oldInfoStep, newInfoStep);

// Add closing tags for the conditional render
const oldErrorDiv = `                            <input 
                              type="file" 
                              id="cv-upload" 
                              style={{ display: 'none' }} 
                              accept=".pdf,.doc,.docx"
                              onChange={onFilePick} 
                            />
                          </label>
                          
                          {draft.cvError && (
                            <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
                              Iltimos, rezyumengizni yuklang (Keyingi bosqichga o'tish uchun majburiy)
                            </div>
                          )}
                        </div>`;
const newErrorDiv = `                            <input 
                              type="file" 
                              id="cv-upload" 
                              style={{ display: 'none' }} 
                              accept=".pdf,.doc,.docx"
                              onChange={onFilePick} 
                            />
                          </label>
                          
                          {draft.cvError && (
                            <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
                              Iltimos, rezyumengizni yuklang (Keyingi bosqichga o'tish uchun majburiy)
                            </div>
                          )}
                            </>
                          )}
                        </div>`;
code = code.replace(oldErrorDiv, newErrorDiv);

fs.writeFileSync('app/vacansiy/page.tsx', code);
console.log('Fixed UI logic to properly handle profile vs file upload');
