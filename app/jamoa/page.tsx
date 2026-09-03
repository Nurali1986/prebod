'use client';

import { useEffect, useState } from 'react';

// Sales-team manager home. Phase 1 shell — team leaderboard/invites come in Phase 2.
export default function ManagerHome() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('ishla_user');
    if (!u) { window.location.href = '/?login=1'; return; }
    setUser(JSON.parse(u));
  }, []);

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('ishla_user');
    window.location.href = '/';
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        :root{--ink:#14213D;--paper:#EDF1EE;--card:#FFFFFF;--accent:#E8A33D;--accent-ink:#4A3110;--accent-deep:#C1811F;--violet:#6C5CB0;--violet-bg:#EDEAF7;--muted:#6B7280;--line:#DAE1DB;--font-display:'Fraunces',serif;--font-body:'Inter',sans-serif;}
        *{box-sizing:border-box;}
        body{margin:0;font-family:var(--font-body);background:var(--paper);color:var(--ink);}
        .top{background:var(--ink);color:#EFEDE4;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;}
        .brand{display:flex;align-items:center;gap:10px;}
        .brand-mark{width:30px;height:30px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:600;color:var(--accent-ink);}
        .brand-name{font-family:var(--font-display);font-size:18px;font-weight:600;}
        .lgt{background:none;border:none;color:#9B9A8F;cursor:pointer;font-size:13px;}
        .wrap{max-width:900px;margin:0 auto;padding:30px 20px 70px;}
        h1{font-family:var(--font-display);font-size:26px;font-weight:600;margin:0 0 6px;}
        .sub{color:var(--muted);margin:0 0 26px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;}
        .card h3{font-family:var(--font-display);font-size:17px;margin:0 0 6px;}
        .card p{font-size:13.5px;color:var(--muted);line-height:1.6;margin:0 0 14px;}
        .btn{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:9px;padding:11px 18px;font-weight:600;font-size:14px;cursor:pointer;}
        .btn-primary{background:var(--accent);color:var(--accent-ink);}
        .btn-primary:hover{background:var(--accent-deep);color:#fff;}
        .btn-ghost{background:var(--violet-bg);color:var(--violet);}
        .soon{display:inline-block;font-size:11px;font-weight:700;color:var(--violet);background:var(--violet-bg);padding:3px 9px;border-radius:999px;margin-left:8px;}
        @media(max-width:640px){.grid{grid-template-columns:1fr;}}
      `}} />
      <div className="top">
        <div className="brand"><div className="brand-mark">I</div><div className="brand-name">Ishla · Jamoa</div></div>
        <button className="lgt" onClick={logout}>Chiqish</button>
      </div>
      <div className="wrap">
        <h1>Salom, {user?.firstName || 'rahbar'}!</h1>
        <p className="sub">{user?.company || 'Jamoangiz'} — sotuv jamoangizni AI bilan tayyorlang.</p>
        <div className="grid">
          <div className="card">
            <h3>Simulyatorni sinang</h3>
            <p>Sotuvchilaringiz o&apos;tadigan AI mijoz qo&apos;ng&apos;irog&apos;ini o&apos;zingiz sinab ko&apos;ring.</p>
            <button className="btn btn-primary" onClick={() => { window.location.href = '/chat'; }}>Qo&apos;ng&apos;iroqni boshlash</button>
          </div>
          <div className="card">
            <h3>Jamoa paneli <span className="soon">Tez orada</span></h3>
            <p>Sotuvchilarni taklif qiling, leaderboard va har birining sotuv mahorati o&apos;sishini kuzating. (2-bosqichда qo&apos;shiladi)</p>
            <button className="btn btn-ghost" disabled style={{ opacity: .6, cursor: 'default' }}>Sotuvchi taklif qilish</button>
          </div>
          <div className="card">
            <h3>Kompaniya skripti <span className="soon">Tez orada</span></h3>
            <p>O&apos;z sotuv skriptingizni yuklang — AI aynan sizning skriptingiz bo&apos;yicha baholaydi.</p>
          </div>
        </div>
      </div>
    </>
  );
}
