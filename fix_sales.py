import sys

with open(r'c:\Trener\sales-trainer\app\hr\page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old_block = '''<div className="field" style={{ marginBottom: 0 }}><label>Ssenariy (nomzod nimani va kimga sotishi kerak)</label><textarea value={salesScen} onChange={e => setSalesScen(e.target.value)} placeholder="AI shubhalanuvchi mijoz rolini o'ynaydi."></textarea></div>'''

new_block = '''<div className="field" style={{ marginBottom: 0 }}>
                          <label>Simulyatsiya rollarini tanlang (1 ta yoki bir nechta)</label>
                          <div className="personas-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                            {CHARACTERS.map(c => (
                              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }}>
                                <input 
                                  type="checkbox" 
                                  checked={salesPersonas.includes(c.id)} 
                                  onChange={(e) => {
                                    if (e.target.checked) setSalesPersonas([...salesPersonas, c.id]);
                                    else setSalesPersonas(salesPersonas.filter(x => x !== c.id));
                                  }} 
                                />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.description}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>'''

if old_block in c:
    c = c.replace(old_block, new_block)
    with open(r'c:\Trener\sales-trainer\app\hr\page.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print('Replaced')
else:
    print('Not found')
