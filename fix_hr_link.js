const fs = require('fs');
let code = fs.readFileSync('app/hr/page.tsx', 'utf8');

const target = '<h2>{v.title}</h2>';

const insert = '<h2>{v.title}</h2><div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, marginBottom: 8 }}><span style={{ fontFamily: "monospace", background: "var(--line)", color: "var(--ink)", padding: "4px 8px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>ID: {v.publicId || "XAB12345"}</span><button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + "/vacansiy?id=" + (v.publicId || "XAB12345")); showToast("Havola nusxalandi"); }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Nusxalash</button></div>';

code = code.replace(target, insert);
fs.writeFileSync('app/hr/page.tsx', code);
