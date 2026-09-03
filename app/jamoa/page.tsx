'use client';

import { useEffect, useState } from 'react';

export default function ManagerHome() {
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<{ name: string; joinCode: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [product, setProduct] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [savingScript, setSavingScript] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('ishla_user');
    if (!u) { window.location.href = '/?login=1'; return; }
    setUser(JSON.parse(u));
    fetch('/api/team').then(r => r.ok ? r.json() : null).then(d => {
      if (d && !d.error) {
        setTeam(d.team);
        setLeaderboard(d.leaderboard || []);
        setProduct(d.team.product || '');
        setScriptText(d.team.scriptText || '');
        setInviteLink(`${window.location.origin}/?join=${d.team.joinCode}`);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const saveScript = async () => {
    setSavingScript(true);
    try {
      const res = await fetch('/api/team', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product, scriptText }) });
      if (res.ok) showToast('Skript saqlandi — endi baholash shu bo\'yicha ketadi');
      else showToast('Xatolik');
    } catch { showToast('Tarmoq xatosi'); }
    finally { setSavingScript(false); }
  };

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('ishla_user');
    window.location.href = '/';
  };

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2000); };
  const copy = (text: string, msg: string) => { navigator.clipboard.writeText(text); showToast(msg); };
  const scoreColor = (n: number) => n >= 80 ? 'var(--success)' : n >= 60 ? 'var(--accent-deep)' : 'var(--danger)';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        :root{--ink:#14213D;--ink-soft:#2C3E63;--paper:#EDF1EE;--card:#FFFFFF;--accent:#E8A33D;--accent-ink:#4A3110;--accent-deep:#C1811F;--accent-bg:#FBF2E1;--success:#2F7A5C;--success-bg:#E3F1EA;--danger:#C1443C;--danger-bg:#FBEAE8;--violet:#6C5CB0;--violet-bg:#EDEAF7;--muted:#6B7280;--line:#DAE1DB;--line-strong:#C3CDC5;--font-display:'Fraunces',serif;--font-body:'Inter',sans-serif;--font-mono:'IBM Plex Mono',monospace;}
        *{box-sizing:border-box;}
        body{margin:0;font-family:var(--font-body);background:var(--paper);color:var(--ink);}
        .top{background:var(--ink);color:#EFEDE4;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;}
        .brand{display:flex;align-items:center;gap:10px;}
        .brand-mark{width:30px;height:30px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:600;color:var(--accent-ink);}
        .brand-name{font-family:var(--font-display);font-size:18px;font-weight:600;}
        .lgt{background:none;border:none;color:#9B9A8F;cursor:pointer;font-size:13px;}
        .wrap{max-width:920px;margin:0 auto;padding:28px 20px 70px;}
        h1{font-family:var(--font-display);font-size:25px;font-weight:600;margin:0 0 4px;}
        .sub{color:var(--muted);margin:0 0 24px;font-size:14px;}
        .invite{background:linear-gradient(135deg,#14213D,#2C3E63);color:#EFEDE4;border-radius:16px;padding:22px 24px;margin-bottom:22px;display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between;}
        .invite .code{font-family:var(--font-mono);font-size:30px;font-weight:600;letter-spacing:4px;color:#fff;}
        .invite .lbl{font-size:12px;color:#C9C6BB;margin-bottom:4px;}
        .invite .btns{display:flex;gap:8px;flex-wrap:wrap;}
        .mini{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);color:#EFEDE4;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;gap:6px;align-items:center;}
        .mini:hover{background:rgba(255,255,255,.18);}
        .cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;}
        .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;}
        .card h3{font-family:var(--font-display);font-size:16px;margin:0 0 6px;}
        .card p{font-size:13px;color:var(--muted);line-height:1.6;margin:0 0 12px;}
        .btn{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:9px;padding:10px 16px;font-weight:600;font-size:13.5px;cursor:pointer;}
        .btn-primary{background:var(--accent);color:var(--accent-ink);}
        .btn-primary:hover{background:var(--accent-deep);color:#fff;}
        .soon{display:inline-block;font-size:11px;font-weight:700;color:var(--violet);background:var(--violet-bg);padding:3px 9px;border-radius:999px;margin-left:8px;}
        .section-title{font-family:var(--font-display);font-size:18px;font-weight:600;margin:0 0 12px;}
        table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;}
        th{text-align:left;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);font-weight:600;padding:12px 14px;border-bottom:1px solid var(--line);}
        td{padding:13px 14px;font-size:13.5px;border-bottom:1px solid var(--line);}
        tr:last-child td{border-bottom:none;}
        .rank{font-family:var(--font-mono);color:var(--muted);}
        .who b{display:block;}
        .who span{font-size:12px;color:var(--muted);}
        .mono{font-family:var(--font-mono);}
        .pill{font-family:var(--font-mono);font-weight:600;padding:2px 9px;border-radius:7px;font-size:13px;}
        .empty{padding:28px;text-align:center;color:var(--muted);}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#EFEDE4;padding:11px 18px;border-radius:8px;font-size:13.5px;z-index:60;}
        @media(max-width:640px){.cards{grid-template-columns:1fr;}.invite{flex-direction:column;align-items:flex-start;}table{display:block;overflow-x:auto;white-space:nowrap;}}
      `}} />
      <div className="top">
        <div className="brand"><div className="brand-mark">R</div><div className="brand-name">Repza · Jamoa</div></div>
        <button className="lgt" onClick={logout}>Chiqish</button>
      </div>
      <div className="wrap">
        <h1>{team?.name || user?.company || 'Jamoa'}</h1>
        <p className="sub">Salom, {user?.firstName || 'rahbar'}! Sotuv jamoangizni AI bilan tayyorlang.</p>

        {team && (
          <div className="invite">
            <div>
              <div className="lbl">Jamoa taklif kodi — sotuvchilar shu kod bilan qo&apos;shiladi</div>
              <div className="code">{team.joinCode}</div>
            </div>
            <div className="btns">
              <button className="mini" onClick={() => copy(team.joinCode, 'Kod nusxalandi')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Kodni nusxalash
              </button>
              <button className="mini" onClick={() => copy(inviteLink, 'Havola nusxalandi')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Taklif havolasi
              </button>
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: 14 }}>
          <h3>Sotuv skriptingiz</h3>
          <p>Mahsulot va o&apos;z sotuv skriptingizni kiriting — sotuvchilar mashqда aynan shuni sotadi va AI <b>aynan sizning skriptingiz</b> bo&apos;yicha baholaydi. (Bo&apos;sh qoldirsangiz, standart 8 bosqichli skript ishlatiladi.)</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'var(--ink-soft)' }}>Sotiladigan mahsulot / xizmat</label>
            <input value={product} onChange={e => setProduct(e.target.value)} placeholder="Masalan: online ingliz tili kursi" style={{ width: '100%', border: '1px solid var(--line-strong)', borderRadius: 8, padding: '9px 12px', fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: 'var(--ink-soft)' }}>Sotuv skripti (bosqichlar, e&apos;tirozlarga javoblar, talablar)</label>
            <textarea value={scriptText} onChange={e => setScriptText(e.target.value)} rows={8} placeholder={"Masalan:\n1. Salomlashish va o'zini tanishtirish\n2. Ehtiyojni aniqlash (3 ta savol)\n3. Taklif — mijoz og'rig'iga bog'lab\n4. E'tirozlar: 'qimmat' → ...\n5. Yopish — aniq keyingi qadam"} style={{ width: '100%', border: '1px solid var(--line-strong)', borderRadius: 8, padding: '11px 12px', fontSize: 13.5, lineHeight: 1.6, resize: 'vertical', fontFamily: 'var(--font-body)' }} />
          </div>
          <button className="btn btn-primary" onClick={saveScript} disabled={savingScript}>{savingScript ? 'Saqlanmoqda...' : 'Skriptni saqlash'}</button>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Simulyatorni sinang</h3>
          <p>Sotuvchilaringiz o&apos;tadigan AI mijoz qo&apos;ng&apos;irog&apos;ini o&apos;zingiz sinab ko&apos;ring.</p>
          <button className="btn btn-primary" onClick={() => { window.location.href = '/chat'; }}>Qo&apos;ng&apos;iroqni boshlash</button>
        </div>

        <h2 className="section-title">Jamoa reytingi</h2>
        {loading ? (
          <div className="empty">Yuklanmoqda...</div>
        ) : leaderboard.length === 0 ? (
          <div className="empty" style={{ background: 'var(--card)', border: '1px dashed var(--line-strong)', borderRadius: 12 }}>
            Hali sotuvchilar qo&apos;shilmagan. Yuqoridagi <b>kod</b> yoki <b>havola</b>ni sotuvchilaringizga yuboring.
          </div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Sotuvchi</th><th>Mashqlar</th><th>O&apos;rtacha</th><th>Eng yaxshi</th><th>So&apos;nggi</th></tr></thead>
            <tbody>
              {leaderboard.map((m, i) => (
                <tr key={m.id}>
                  <td className="rank">{i + 1}</td>
                  <td className="who"><b>{m.name}</b><span>{m.email}</span></td>
                  <td className="mono">{m.sessions}</td>
                  <td>{m.avg != null ? <span className="pill" style={{ background: m.avg >= 80 ? 'var(--success-bg)' : m.avg >= 60 ? 'var(--accent-bg)' : 'var(--danger-bg)', color: scoreColor(m.avg) }}>{m.avg}%</span> : '—'}</td>
                  <td className="mono">{m.best != null ? m.best + '%' : '—'}</td>
                  <td className="mono" style={{ color: 'var(--muted)' }}>{m.last ? new Date(m.last).toLocaleDateString('uz-UZ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
