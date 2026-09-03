import sys

with open('app/hr/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_pagehead = '''                  <div className="pagehead" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2>{v.title}</h2>
                      <div className="meta" style={{ marginTop: 6 }}>{v.dept} • {v.loc} • {v.type}</div>
                    </div>'''

new_pagehead = '''                  <div className="pagehead" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2>{v.title}</h2>
                      <div className="meta" style={{ marginTop: 6 }}>{v.dept} • {v.loc} • {v.type}</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
                        <span style={{ fontFamily: 'monospace', background: 'var(--line)', padding: '4px 8px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>ID: {v.publicId || 'LGMAB09123'}</span>
                        <button className="btn btn-outline btn-sm" onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(window.location.origin + '/vacansiy?id=' + (v.publicId || 'LGMAB09123'));
                          showToast('Havola nusxalandi');
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          Nusxalash
                        </button>
                      </div>
                    </div>'''

code = code.replace(old_pagehead, new_pagehead)

with open('app/hr/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
