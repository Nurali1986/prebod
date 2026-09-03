'use client';

import { useEffect, useState } from 'react';

// Salesperson (rep) home — practice-first dashboard.
export default function RepHome() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number; plan?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<{ name: string } | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('ishla_user');
    if (!u) { window.location.href = '/?login=1'; return; }
    setUser(JSON.parse(u));
    Promise.all([
      fetch('/api/practice').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/simulator/start').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/team/join').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([s, q, t]) => {
      if (Array.isArray(s)) setSessions(s);
      if (q && !q.error) setQuota(q);
      if (t && t.team) setTeam(t.team);
      setLoading(false);
    });
  }, []);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  const joinTeam = async () => {
    if (!joinInput.trim() || joining) return;
    setJoining(true);
    try {
      const res = await fetch('/api/team/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: joinInput.trim() }) });
      const d = await res.json();
      if (res.ok) { setTeam({ name: d.teamName }); showToast(`"${d.teamName}" jamoasiga qo'shildingiz`); }
      else showToast(d.error || 'Xatolik');
    } catch { showToast('Tarmoq xatosi'); }
    finally { setJoining(false); }
  };

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('ishla_user');
    window.location.href = '/';
  };

  const avg = sessions.length ? Math.round(sessions.reduce((s, p) => s + p.score, 0) / sessions.length) : null;
  const best = sessions.length ? Math.max(...sessions.map(p => p.score)) : null;
  const scoreColor = (n: number) => n >= 80 ? 'var(--success)' : n >= 60 ? 'var(--accent-deep)' : 'var(--danger)';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        :root{--ink:#14213D;--ink-soft:#2C3E63;--paper:#EDF1EE;--card:#FFFFFF;--accent:#E8A33D;--accent-deep:#C1811F;--accent-ink:#4A3110;--accent-bg:#FBF2E1;--success:#2F7A5C;--success-bg:#E3F1EA;--danger:#C1443C;--danger-bg:#FBEAE8;--violet:#6C5CB0;--violet-bg:#EDEAF7;--muted:#6B7280;--line:#DAE1DB;--line-strong:#C3CDC5;--font-display:'Fraunces',serif;--font-body:'Inter',sans-serif;--font-mono:'IBM Plex Mono',monospace;}
        *{box-sizing:border-box;}
        body{margin:0;font-family:var(--font-body);background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased;}
        .top{background:var(--ink);color:#EFEDE4;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;}
        .brand{display:flex;align-items:center;gap:10px;}
        .brand-mark{width:30px;height:30px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:600;color:var(--accent-ink);}
        .brand-name{font-family:var(--font-display);font-size:18px;font-weight:600;}
        .lgt{background:none;border:none;color:#9B9A8F;cursor:pointer;font-size:13px;}
        .lgt:hover{color:#fff;}
        .wrap{max-width:860px;margin:0 auto;padding:28px 20px 70px;}
        .hero-call{position:relative;overflow:hidden;background:linear-gradient(135deg,#14213D,#2C3E63);color:#EFEDE4;border-radius:20px;padding:34px 30px;text-align:center;margin-bottom:24px;}
        .hero-call .glow{position:absolute;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,var(--accent),transparent 70%);opacity:.25;top:-80px;right:-40px;filter:blur(30px);}
        .hero-call h1{font-family:var(--font-display);font-size:26px;font-weight:600;margin:0 0 8px;position:relative;}
        .hero-call p{color:#C9C6BB;font-size:14px;margin:0 0 22px;position:relative;}
        .call-btn{position:relative;display:inline-flex;align-items:center;gap:10px;background:#2F7A5C;color:#fff;border:none;border-radius:999px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(47,122,92,.4);transition:transform .12s ease,background .15s ease;}
        .call-btn:hover{background:#25664c;transform:translateY(-2px);}
        .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:26px;}
        .stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;text-align:center;}
        .stat .n{font-family:var(--font-mono);font-size:24px;font-weight:500;}
        .stat .l{font-size:11.5px;color:var(--muted);margin-top:4px;}
        .section-title{font-family:var(--font-display);font-size:18px;font-weight:600;margin:0 0 14px;}
        .sess{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:10px;}
        .sess summary{display:flex;justify-content:space-between;align-items:center;cursor:pointer;list-style:none;}
        .sess summary::-webkit-details-marker{display:none;}
        .sess .who{font-weight:600;}
        .sess .dt{font-size:12px;color:var(--muted);margin-left:8px;font-weight:400;}
        .pill{font-family:var(--font-mono);font-weight:600;padding:3px 10px;border-radius:8px;font-size:13px;}
        .sess .fb{margin-top:12px;font-size:13px;white-space:pre-wrap;line-height:1.6;color:var(--ink-soft);}
        .empty{background:var(--card);border:1px dashed var(--line-strong);border-radius:12px;padding:30px;text-align:center;color:var(--muted);}
        .join-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:24px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;}
        .join-card .ttl{font-weight:600;font-size:14px;}
        .join-card .row{display:flex;gap:8px;flex-wrap:wrap;}
        .join-card input{border:1px solid var(--line-strong);border-radius:8px;padding:9px 12px;font-size:14px;font-family:var(--font-mono);letter-spacing:2px;text-transform:uppercase;width:130px;}
        .join-card button{background:var(--violet);color:#fff;border:none;border-radius:8px;padding:9px 16px;font-weight:600;font-size:13.5px;cursor:pointer;}
        .team-badge{display:inline-flex;align-items:center;gap:7px;background:var(--violet-bg);color:var(--violet);padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#EFEDE4;padding:11px 18px;border-radius:8px;font-size:13.5px;z-index:60;}
        @media(max-width:640px){.stat-row{grid-template-columns:repeat(2,1fr);}.hero-call{padding:26px 18px;}}
      `}} />
      <div className="top">
        <div className="brand"><div className="brand-mark">I</div><div className="brand-name">Ishla</div></div>
        <button className="lgt" onClick={logout}>Chiqish</button>
      </div>

      <div className="wrap">
        <div className="hero-call">
          <div className="glow"></div>
          <h1>Salom, {user?.firstName || 'sotuvchi'}! 👋</h1>
          <p>AI mijoz bilan telefon orqali mashq qiling — standart sotuv skripti bo&apos;yicha baho oling.</p>
          <button className="call-btn" onClick={() => { window.location.href = '/chat'; }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Qo&apos;ng&apos;iroqni boshlash
          </button>
        </div>

        <div className="stat-row">
          <div className="stat"><div className="n" style={{ color: avg != null ? scoreColor(avg) : 'var(--ink)' }}>{avg != null ? avg + '%' : '—'}</div><div className="l">O&apos;rtacha mahorat</div></div>
          <div className="stat"><div className="n">{best != null ? best + '%' : '—'}</div><div className="l">Eng yaxshi</div></div>
          <div className="stat"><div className="n">{sessions.length}</div><div className="l">Jami mashq</div></div>
          <div className="stat"><div className="n">{quota ? (quota.plan === 'premium' ? '∞' : quota.remaining) : '—'}</div><div className="l">Bugun qolgan</div></div>
        </div>

        <div className="join-card">
          {team ? (
            <>
              <span className="ttl">Jamoa</span>
              <span className="team-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
                {team.name}
              </span>
            </>
          ) : (
            <>
              <span className="ttl">Jamoaga qo&apos;shilish</span>
              <div className="row">
                <input value={joinInput} onChange={e => setJoinInput(e.target.value)} placeholder="KOD" maxLength={6} onKeyDown={e => { if (e.key === 'Enter') joinTeam(); }} />
                <button onClick={joinTeam} disabled={joining}>Qo&apos;shilish</button>
              </div>
            </>
          )}
        </div>

        <h2 className="section-title">Mashqlar tarixi</h2>
        {loading ? (
          <div className="empty">Yuklanmoqda...</div>
        ) : sessions.length === 0 ? (
          <div className="empty">Hali mashq qilmadingiz. Yuqoridagi tugma bilan birinchi qo&apos;ng&apos;iroqni boshlang.</div>
        ) : (
          sessions.map((p) => (
            <details key={p.id} className="sess">
              <summary>
                <span><span className="who">{p.personaName || p.persona}</span><span className="dt">{new Date(p.createdAt).toLocaleString('uz-UZ')}</span></span>
                <span className="pill" style={{ background: p.score >= 80 ? 'var(--success-bg)' : p.score >= 60 ? 'var(--accent-bg)' : 'var(--danger-bg)', color: scoreColor(p.score) }}>{p.score}%</span>
              </summary>
              {p.feedback && <div className="fb">{p.feedback}</div>}
            </details>
          ))
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
