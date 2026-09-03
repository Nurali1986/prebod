'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TelegramButton from './components/TelegramButton';
import Navbar from './components/Navbar';

export default function LandingPage() {
  const router = useRouter();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupRole, setSignupRole] = useState<string>('rep');
  
  // Register state
  const [suFirstName, setSuFirstName] = useState('');
  const [suLastName, setSuLastName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suPassConfirm, setSuPassConfirm] = useState('');
  const [suCompany, setSuCompany] = useState('');
  const [suErr, setSuErr] = useState('');
  
  // Login state
  const [liEmail, setLiEmail] = useState('');
  const [liPass, setLiPass] = useState('');
  const [liErr, setLiErr] = useState('');

  const [hiwTab, setHiwTab] = useState<'rep' | 'manager'>('rep');
    const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [providers, setProviders] = useState<{ google: boolean; telegram: boolean; telegramBot: string | null }>({ google: false, telegram: false, telegramBot: null });

  useEffect(() => {
    const user = localStorage.getItem('ishla_user');
    if (user) {
      const parsed = JSON.parse(user);
      setLoggedInUser(parsed);

    }
    const params = new URLSearchParams(window.location.search);
    const jc = params.get('join');
    if (jc && !user) {
      setJoinCode(jc.trim().toUpperCase());
      openSignup('rep');
    }
    const err = params.get('err');
    if (err) {
      const map: Record<string, string> = {
        blocked: 'Hisobingiz bloklangan.',
        oauth: 'Google orqali kirishda xatolik. Qaytadan urinib ko\'ring.',
        email: 'Google hisobingiz emaili tasdiqlanmagan.',
        tg: 'Telegram orqali kirishda xatolik.',
        tg_expired: 'Telegram kirish muddati o\'tgan, qaytadan urinib ko\'ring.',
      };
      setLiErr(map[err] || 'Kirishda xatolik.');
      openLogin();
    } else if (params.has('login')) {
      openLogin();
    } else if (params.has('register')) {
      setRoleModalOpen(true);
    }

    fetch('/api/auth/providers').then(r => r.json()).then(setProviders).catch(() => {});
  }, [router]);


  const destForRole = (role: string, redir?: string | null) => {
    if (role === 'superadmin') return '/boshqaruv';
    if (role === 'manager') return '/jamoa';
    if (role === 'employer') return '/hr';
    // rep and candidate share the unified cabinet at /vacansiy.
    return redir ? '/vacansiy' + decodeURIComponent(redir) : '/vacansiy';
  };

  const openSignup = (role: string) => {
    setSignupRole(role);
    setRoleModalOpen(false);
    setSuFirstName(''); setSuLastName(''); setSuEmail(''); setSuPhone(''); 
    setSuPass(''); setSuPassConfirm(''); setSuCompany(''); setSuErr('');
    setSignupOpen(true);
  };

  const openLogin = () => {
    setRoleModalOpen(false);
    setSignupOpen(false);
    setLiEmail(''); setLiPass(''); setLiErr('');
    setLoginOpen(true);
  };

  const submitSignup = async () => {
    const needsCompany = signupRole === 'manager' || signupRole === 'employer';
    const companyOk = !needsCompany || suCompany.trim();
    if (!suFirstName.trim() || !suLastName.trim() || !suEmail.trim() || !suPass.trim() || !suPassConfirm.trim() || !companyOk) {
      setSuErr('Iltimos, barcha maydonlarni to\'ldiring.');
      return;
    }
    if (suPass !== suPassConfirm) {
      setSuErr('Parollar mos kelmayapti.');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: suFirstName.trim(),
          lastName: suLastName.trim(),
          email: suEmail.trim(),
          phone: suPhone.trim(),
          password: suPass,
          role: signupRole,
          company: suCompany.trim()
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setSuErr(data.error || 'Xatolik yuz berdi');
        return;
      }
      
      localStorage.setItem('ishla_user', JSON.stringify(data));
      setSignupOpen(false);
      // If they arrived via an invite link, join that team.
      if (joinCode && data.role === 'rep') {
        try { await fetch('/api/team/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: joinCode }) }); } catch {}
      }
      const redir = new URLSearchParams(window.location.search).get('redirect');
        router.push(destForRole(data.role, redir));
    } catch (e) {
      setSuErr('Tarmoq xatosi');
    }
  };

  const submitLogin = async () => {
    if (!liEmail.trim() || !liPass.trim()) {
      setLiErr('Email va parolni kiriting.');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: liEmail.trim(),
          password: liPass
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setLiErr(data.error || 'Xatolik yuz berdi');
        return;
      }
      
      localStorage.setItem('ishla_user', JSON.stringify(data));
      setLoginOpen(false);
      const redir = new URLSearchParams(window.location.search).get('redirect');
        router.push(destForRole(data.role, redir));
    } catch (e) {
      setLiErr('Tarmoq xatosi');
    }
  };

  const SocialButtons = ({ role }: { role: string }) => {
    if (!providers.google && !providers.telegram) return null;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>yoki</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
        {providers.google && (
          <button type="button" onClick={() => { window.location.href = '/api/auth/google?role=' + role; }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 14px', border: '1px solid var(--line-strong)', borderRadius: 8, background: '#fff', color: 'var(--ink)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', marginBottom: 10 }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Google bilan davom etish
          </button>
        )}
        {providers.telegram && providers.telegramBot && (
          <TelegramButton bot={providers.telegramBot} role={role} />
        )}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
:root{
  --ink:#14213D;--ink-soft:#2C3E63;--paper:#EDF1EE;--card:#FFFFFF;
  --accent:#E8A33D;--accent-deep:#C1811F;--accent-ink:#4A3110;--accent-bg:#FBF2E1;
  --success:#2F7A5C;--success-bg:#E3F1EA;
  --violet:#6C5CB0;--violet-bg:#EDEAF7;
  --muted:#6B7280;--line:#DAE1DB;--line-strong:#C3CDC5;
  --font-display:'Fraunces', serif;--font-body:'Inter', sans-serif;--font-mono:'IBM Plex Mono', monospace;
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{margin:0;font-family:var(--font-body);background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}
.wrap{max-width:1160px;margin:0 auto;padding:0 28px;}
header{display:none;}
.btn{font-family:var(--font-body);font-size:13.5px;font-weight:600;border-radius:8px;padding:10px 18px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:transform .1s ease, background .15s ease;}
.btn:active{transform:scale(0.98);}
.btn-primary{background:var(--accent);color:var(--accent-ink);}
.btn-primary:hover{background:var(--accent-deep);color:#fff;}
.btn-ghost{background:transparent;border-color:var(--line-strong);color:var(--ink);}
.btn-ghost:hover{background:#fff;}
.hero{padding:76px 0 40px;text-align:center;}
.hero .eyebrow{display:inline-flex;align-items:center;gap:7px;background:var(--violet-bg);color:var(--violet);font-size:12.5px;font-weight:700;padding:6px 14px;border-radius:999px;margin-bottom:22px;}
.hero h1{font-family:var(--font-display);font-size:48px;line-height:1.12;font-weight:600;margin:0 0 18px;max-width:780px;margin-left:auto;margin-right:auto;}
.hero h1 em{font-style:normal;color:var(--accent-deep);}
.hero p.sub{font-size:16.5px;color:var(--ink-soft);max-width:560px;margin:0 auto 40px;line-height:1.6;}
.role-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:820px;margin:0 auto 54px;text-align:left;}
.role-card{background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:28px 26px;transition:border-color .15s ease, transform .15s ease;display:block;cursor:pointer;}
.role-card:hover{border-color:var(--accent);transform:translateY(-3px);}
.role-card .ricon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}
.role-card.candidate .ricon{background:var(--accent-bg);color:var(--accent-deep);}
.role-card.employer .ricon{background:var(--violet-bg);color:var(--violet);}
.role-card h3{font-family:var(--font-display);font-size:19px;font-weight:600;margin:0 0 6px;}
.role-card p{font-size:13px;color:var(--muted);margin:0 0 16px;line-height:1.55;}
.role-card .go{font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:6px;}
.role-card.candidate .go{color:var(--accent-deep);}
.role-card.employer .go{color:var(--violet);}
.stat-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:980px;margin:0 auto;}
.stat-box{text-align:center;padding:18px 10px;}
.stat-box .num{font-family:var(--font-mono);font-size:28px;font-weight:500;color:var(--ink);}
.stat-box .lbl{font-size:12px;color:var(--muted);margin-top:4px;}
section{padding:64px 0;}
.section-head{text-align:center;max-width:620px;margin:0 auto 44px;}
.section-head .kicker{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent-deep);margin-bottom:10px;}
.section-head h2{font-family:var(--font-display);font-size:32px;font-weight:600;margin:0 0 12px;}
.section-head p{font-size:14.5px;color:var(--muted);line-height:1.6;margin:0;}
.about-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:44px;align-items:center;}
.about-grid .copy p{font-size:14.5px;color:var(--ink-soft);line-height:1.75;margin:0 0 16px;}
.about-cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.about-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px;}
.about-card .n{font-family:var(--font-mono);font-size:23px;color:var(--ink);}
.about-card .l{font-size:12px;color:var(--muted);margin-top:4px;}
.hiw-tabs{display:flex;justify-content:center;gap:6px;margin-bottom:40px;}
.hiw-tab{padding:10px 20px;border-radius:999px;font-size:13.5px;font-weight:600;cursor:pointer;border:1px solid var(--line-strong);color:var(--ink-soft);background:var(--card);}
.hiw-tab.active{background:var(--ink);color:#EFEDE4;border-color:var(--ink);}
.hiw-track{display:none;}
.hiw-track.active{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;position:relative;}
.hiw-track::before{content:"";position:absolute;top:21px;left:40px;right:40px;height:0;border-top:2px dashed var(--line-strong);z-index:0;}
.hiw-step{position:relative;z-index:1;text-align:center;padding:0 6px;}
.hiw-step .num{width:42px;height:42px;border-radius:50%;background:var(--card);border:2px solid var(--accent);color:var(--accent-deep);font-family:var(--font-mono);font-weight:600;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
.hiw-step h4{font-size:13.5px;font-weight:700;margin:0 0 6px;}
.hiw-step p{font-size:12px;color:var(--muted);line-height:1.5;margin:0;}
.feat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
.feat-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px 18px;text-align:left;}
.feat-card .icon{width:38px;height:38px;border-radius:10px;background:var(--violet-bg);color:var(--violet);display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.feat-card .icon svg{width:19px;height:19px;}
.feat-card h4{font-size:14px;font-weight:700;margin:0 0 7px;}
.feat-card p{font-size:12px;color:var(--muted);line-height:1.55;margin:0;}
.trust-row{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;}
.trust-chip{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:9px 18px;font-size:13px;font-weight:600;color:var(--ink-soft);}
.cta-band{background:var(--ink);border-radius:22px;padding:52px 40px;text-align:center;color:#EFEDE4;}
.cta-band h2{font-family:var(--font-display);font-size:28px;font-weight:600;margin:0 0 12px;}
.cta-band p{font-size:14px;color:#C9C6BB;margin:0 0 26px;}
.cta-band .row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
footer{border-top:1px solid var(--line);padding:48px 0 26px;}
.foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:30px;margin-bottom:34px;}
.foot-col h5{font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:0 0 14px;}
.foot-col a, .foot-col p{display:block;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px;line-height:1.5;}
.foot-col a:hover{color:var(--ink);}
.foot-bottom{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:20px;font-size:12px;color:var(--muted);flex-wrap:wrap;gap:10px;}
.overlay{position:fixed;inset:0;background:rgba(20,33,61,0.55);display:none;align-items:center;justify-content:center;padding:20px;z-index:100;}
.overlay.open{display:flex;}
.role-modal{background:var(--card);border-radius:18px;max-width:640px;width:100%;padding:36px 34px 30px;position:relative;}
.role-modal .close-x{position:absolute;top:16px;right:16px;background:none;border:none;cursor:pointer;color:var(--muted);padding:6px;}
.role-modal .close-x:hover{color:var(--ink);}
.role-modal h2{font-family:var(--font-display);font-size:23px;font-weight:600;margin:0 0 6px;text-align:center;}
.role-modal .sub{font-size:13.5px;color:var(--muted);text-align:center;margin:0 0 26px;}
.role-modal .role-grid{margin-bottom:16px;}
.role-modal .later{display:block;text-align:center;font-size:12.5px;color:var(--muted);cursor:pointer;}
.role-modal .later:hover{color:var(--ink);text-decoration:underline;}
.field{margin-bottom:14px;text-align:left;}
.field label{display:block;font-size:12.5px;font-weight:600;color:var(--ink-soft);margin-bottom:6px;}
.field input{width:100%;font-family:var(--font-body);font-size:13.5px;border:1px solid var(--line-strong);border-radius:8px;padding:10px 12px;background:#F9FAF8;color:var(--ink);}
.field input:focus{outline:2px solid var(--accent);outline-offset:1px;background:#fff;}
.err-note{font-size:12px;color:#C1443C;margin:-4px 0 12px;display:none;text-align:left;}
.err-note.show{display:block;}

/* ===== AI effects ===== */
@keyframes auroraDrift{0%{transform:translate(0,0) scale(1);}50%{transform:translate(28px,-18px) scale(1.15);}100%{transform:translate(0,0) scale(1);}}
@keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-9px);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes livePulse{0%,100%{box-shadow:0 0 0 0 rgba(108,92,176,.55);}50%{box-shadow:0 0 0 6px rgba(108,92,176,0);}}
.hero{position:relative;overflow:hidden;}
.hero-aurora{position:absolute;inset:-40px -20px auto -20px;height:520px;z-index:0;pointer-events:none;filter:blur(64px);opacity:.5;}
.hero-aurora span{position:absolute;border-radius:50%;display:block;}
.hero-aurora .b1{width:340px;height:340px;left:6%;top:10px;background:radial-gradient(circle,var(--accent) 0,transparent 70%);animation:auroraDrift 14s ease-in-out infinite;}
.hero-aurora .b2{width:300px;height:300px;right:8%;top:-10px;background:radial-gradient(circle,var(--violet) 0,transparent 70%);animation:auroraDrift 18s ease-in-out infinite reverse;}
.hero-aurora .b3{width:260px;height:260px;left:44%;top:130px;background:radial-gradient(circle,var(--success) 0,transparent 70%);animation:auroraDrift 16s ease-in-out infinite;}
.hero .wrap{position:relative;z-index:1;}
.hero .eyebrow{position:relative;overflow:hidden;background:linear-gradient(90deg,var(--violet-bg),#F4EFFC,var(--violet-bg));background-size:200% 100%;animation:shimmer 3.5s linear infinite;}
.eyebrow .live-dot{width:8px;height:8px;border-radius:50%;background:var(--violet);flex-shrink:0;animation:livePulse 1.8s ease-out infinite;}
.hero h1 em{background:linear-gradient(90deg,var(--accent-deep),var(--violet));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.role-card:hover{box-shadow:0 12px 40px rgba(108,92,176,.12);}
.ai-spark{animation:floatY 4s ease-in-out infinite;transform-origin:center;}
@media(prefers-reduced-motion:reduce){.hero-aurora span,.hero .eyebrow,.ai-spark{animation:none!important;}}


@media(max-width:860px){
  .hero{padding:52px 0 30px;}
  .hero h1{font-size:31px;}
  .hero p.sub{font-size:15px;}
  .role-grid,.role-modal .role-grid{grid-template-columns:1fr;}
  .stat-strip{grid-template-columns:repeat(2,1fr);}
  .about-grid{grid-template-columns:1fr;}
  .hiw-track.active{grid-template-columns:1fr;}
  .hiw-track::before{display:none;}
  .feat-grid{grid-template-columns:repeat(2,1fr);}
  .foot-grid{grid-template-columns:1fr 1fr;}
  .cta-band{padding:36px 20px;}
  section{padding:48px 0;}
  .wrap{padding:0 20px;}
}
@media(max-width:520px){
  .feat-grid,.stat-strip{grid-template-columns:1fr;}
  .foot-grid{grid-template-columns:1fr;}
  .hero h1{font-size:27px;}
}
      `}} />

      <Navbar active="home" onLoginClick={() => openLogin()} />

      {/* HERO */}
      <section className="hero">
        <div className="hero-aurora"><span className="b1"></span><span className="b2"></span><span className="b3"></span></div>
        <div className="wrap">
          <div className="eyebrow">
            <span className="live-dot"></span>
            <svg className="ai-spark" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="4"/></svg>
            AI sotuv murabbiyi — telefonda jonli mashq
          </div>
          <h1>Sotuvchilarni <em>AI mijoz</em> bilan mashq qildirib tayyorlang</h1>
          <p className="sub">Repza — har bir sotuvchi AI mijozga telefon orqali qo&apos;ng&apos;iroq qilib, standart sotuv skripti bo&apos;yicha mashq qiladigan va baho oladigan platforma. Mahoratni o&apos;lchang, o&apos;stiring, jamoani kuchaytiring.</p>

          <div className="role-grid">
            <div className="role-card candidate" onClick={() => openSignup('rep')}>
              <div className="ricon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <h3>Sotuvchiman</h3>
              <p>AI mijoz bilan qo&apos;ng&apos;iroq qilib mashq qiling, sotuv mahoratingizni 100 ballik tizimda o&apos;lchang va o&apos;stiring.</p>
              <span className="go">Bepul boshlash →</span>
            </div>
            <div className="role-card employer" onClick={() => openSignup('manager')}>
              <div className="ricon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <h3>Sotuv bo&apos;limi rahbariman</h3>
              <p>Jamoangizni tayyorlang: sotuvchilarni taklif qiling, o&apos;z skriptingizni yuklang, har birining mahorati o&apos;sishini kuzating.</p>
              <span className="go">Jamoa yaratish →</span>
            </div>
          </div>

          <div className="stat-strip">
            <div className="stat-box"><div className="num">8</div><div className="lbl">bosqichli sotuv skripti</div></div>
            <div className="stat-box"><div className="num">10</div><div className="lbl">turli AI mijoz xarakteri</div></div>
            <div className="stat-box"><div className="num">100</div><div className="lbl">ballik aniq baholash</div></div>
            <div className="stat-box"><div className="num">24/7</div><div className="lbl">istalgan vaqt mashq</div></div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="platforma-haqida">
        <div className="wrap about-grid">
          <div className="copy">
            <div className="section-head" style={{ textAlign: 'left', margin: '0 0 20px' }}>
              <div className="kicker">Platforma haqida</div>
              <h2 style={{ fontSize: 28 }}>Repza nima va nima uchun kerak?</h2>
            </div>
            <p>Repza — sotuvchilarni real qo&apos;ng&apos;iroqdek muhitда, AI mijoz bilan mashq qildirib tayyorlaydigan platforma. Sotuvchi telefon orqali AI mijozga mahsulotni sotishga urinadi, AI esa uni standart sotuv skripti (tanishuv, ehtiyoj, taklif, e&apos;tirozlar, yopish) bo&apos;yicha baholaydi.</p>
            <p>Har bir mashqdan so&apos;ng aniq ball, kuchli tomonlar va xatolar ko&apos;rsatiladi. Sotuv rahbarlari jamoaning mahorat o&apos;sishini kuzatadi, o&apos;z sotuv skriptini yuklaydi. Xohlaganlar esa nomzodlarni ham shu simulyator bilan baholab ishga oladi.</p>
          </div>
          <div className="about-cards">
            <div className="about-card"><div className="n">10×</div><div className="l">ko&apos;proq mashq imkoni</div></div>
            <div className="about-card"><div className="n">24/7</div><div className="l">istalgan vaqt AI mijoz</div></div>
            <div className="about-card"><div className="n">0</div><div className="l">real mijozni yo&apos;qotmasdan</div></div>
            <div className="about-card"><div className="n">100%</div><div className="l">obyektiv AI baholash</div></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="qanday-ishlaydi" style={{ background: 'var(--card)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-head">
            <div className="kicker">Qanday ishlaydi</div>
            <h2>Sodda va samarali jarayon</h2>
            <p>Kimligingizga qarab tegishli bosqichlarni ko&apos;ring.</p>
          </div>
          <div className="hiw-tabs">
            <div className={`hiw-tab ${hiwTab === 'rep' ? 'active' : ''}`} onClick={() => setHiwTab('rep')}>Sotuvchilar uchun</div>
            <div className={`hiw-tab ${hiwTab === 'manager' ? 'active' : ''}`} onClick={() => setHiwTab('manager')}>Rahbarlar uchun</div>
          </div>
          <div className={`hiw-track ${hiwTab === 'rep' ? 'active' : ''}`}>
            <div className="hiw-step"><div className="num">1</div><h4>Ro&apos;yxatdan o&apos;ting</h4><p>Bir necha soniyada bepul boshlang.</p></div>
            <div className="hiw-step"><div className="num">2</div><h4>Mijozni tanlang</h4><p>10 xil AI mijoz xarakteridan birini.</p></div>
            <div className="hiw-step"><div className="num">3</div><h4>Qo&apos;ng&apos;iroq qiling</h4><p>Telefon orqali mahsulotni soting.</p></div>
            <div className="hiw-step"><div className="num">4</div><h4>Baho oling</h4><p>Standart skript bo&apos;yicha 100 ballik.</p></div>
            <div className="hiw-step"><div className="num">5</div><h4>O&apos;sishni kuzating</h4><p>Mahoratingiz tarixini ko&apos;ring.</p></div>
          </div>
          <div className={`hiw-track ${hiwTab === 'manager' ? 'active' : ''}`}>
            <div className="hiw-step"><div className="num">1</div><h4>Jamoa yarating</h4><p>Kompaniyangiz uchun panel oching.</p></div>
            <div className="hiw-step"><div className="num">2</div><h4>Sotuvchilarni taklif qiling</h4><p>Havola/kod orqali qo&apos;shing.</p></div>
            <div className="hiw-step"><div className="num">3</div><h4>Skriptni yuklang</h4><p>O&apos;z sotuv skriptingizni sozlang.</p></div>
            <div className="hiw-step"><div className="num">4</div><h4>Mashqni tayinlang</h4><p>Mahsulot va mijoz xarakterini.</p></div>
            <div className="hiw-step"><div className="num">5</div><h4>Natijani kuzating</h4><p>Leaderboard va o&apos;sishni ko&apos;ring.</p></div>
          </div>
        </div>
      </section>

      {/* AI FEATURES */}
      <section id="ai-imkoniyatlari">
        <div className="wrap">
          <div className="section-head">
            <div className="kicker">AI imkoniyatlari</div>
            <h2>Nima uchun Repza?</h2>
            <p>Real mijozni yo&apos;qotmasdan, xavfsiz muhitda cheksiz mashq.</p>
          </div>
          <div className="feat-grid">
            <div className="feat-card">
              <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <h4>Jonli qo&apos;ng&apos;iroq</h4>
              <p>AI mijoz bilan telefon orqali ovozli suhbat — xuddi real qo&apos;ng&apos;iroqdek.</p>
            </div>
            <div className="feat-card">
              <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="18" cy="8" r="3"/></svg></div>
              <h4>10 xil mijoz</h4>
              <p>Ishonchsiz, injiq, band, narx talashuvchi — har xil xarakterda mijozlar.</p>
            </div>
            <div className="feat-card">
              <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
              <h4>Standart skript</h4>
              <p>8 bosqich (tanishuv, ehtiyoj, taklif, e&apos;tiroz, yopish) bo&apos;yicha aniq baho.</p>
            </div>
            <div className="feat-card">
              <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg></div>
              <h4>O&apos;sish tahlili</h4>
              <p>Har mashqда kuchli tomonlar, xatolar va o&apos;sish dinamikasi ko&apos;rinadi.</p>
            </div>
            <div className="feat-card">
              <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg></div>
              <h4>O&apos;z skriptingiz</h4>
              <p>Kompaniya o&apos;z sotuv skriptini yuklaydi — AI aynan shu bo&apos;yicha baholaydi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: 26 }}>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Repza&apos;dan foydalanayotgan kompaniyalar</p>
          </div>
          <div className="trust-row">
            <span className="trust-chip">TechnoSoft LLC</span>
            <span className="trust-chip">MediaGroup Uz</span>
            <span className="trust-chip">FinCapital</span>
            <span className="trust-chip">RetailPro</span>
            <span className="trust-chip">BuildMax Qurilish</span>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section>
        <div className="wrap">
          <div className="cta-band">
            <h2>Sotuvni AI bilan mashq qilishga tayyormisiz?</h2>
            <p>Individual sotuvchimisiz yoki jamoa rahbari — Repza ikkalasi uchun ham.</p>
            <div className="row">
              <button className="btn btn-primary" onClick={() => openSignup('rep')}>Sotuvchi sifatida bepul boshlash</button>
              <button className="btn btn-ghost" style={{ background: 'transparent', borderColor: 'rgba(239,237,228,0.3)', color: '#EFEDE4' }} onClick={() => openSignup('manager')}>Jamoa yaratish</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-col">
              <div className="brand" style={{ marginBottom: 12 }}><div className="brand-mark">R</div><div className="brand-name">Repza</div></div>
              <p>AI mijoz bilan sotuvchilarni tayyorlaydigan sotuv-mashqi platformasi. Toshkent, O&apos;zbekiston.</p>
            </div>
            <div className="foot-col">
              <h5>Platforma</h5>
              <a href="#qanday-ishlaydi">Qanday ishlaydi</a>
              <a href="#ai-imkoniyatlari">AI imkoniyatlari</a>
              <a href="#platforma-haqida">Platforma haqida</a>
            </div>
            <div className="foot-col">
              <h5>Foydalanuvchilar uchun</h5>
              <a href="/mashq">Sotuvchi kabineti</a>
              <a href="/jamoa">Sotuv rahbari</a>
              <a href="/boshqaruv">Admin kirish</a>
            </div>
            <div className="foot-col">
              <h5>Aloqa</h5>
              <a href="mailto:support@repza.uz">support@repza.uz</a>
              <a href="tel:+998712001010">+998 71 200 10 10</a>
              <p>Toshkent sh., Mirzo Ulug&apos;bek tumani</p>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Repza. Barcha huquqlar himoyalangan.</span>
            <span>Maxfiylik siyosati · Foydalanish shartlari</span>
          </div>
        </div>
      </footer>

      {/* ROLE SELECTION MODAL */}
      <div className={`overlay ${roleModalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setRoleModalOpen(false); }}>
        <div className="role-modal">
          <button className="close-x" onClick={() => setRoleModalOpen(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          <h2>Xush kelibsiz!</h2>
          <p className="sub">Davom etish uchun o&apos;zingizga mos rolni tanlang</p>
          <div className="role-grid">
            <div className="role-card candidate" onClick={() => openSignup('rep')}>
              <div className="ricon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <h3>Sotuvchiman</h3>
              <p>AI mijoz bilan mashq qilib, mahoratimni oshirish uchun.</p>
              <span className="go">Davom etish →</span>
            </div>
            <div className="role-card employer" onClick={() => openSignup('manager')}>
              <div className="ricon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <h3>Sotuv rahbariman</h3>
              <p>Jamoamni tayyorlash va mahorat o&apos;sishini kuzatish uchun.</p>
              <span className="go">Davom etish →</span>
            </div>
          </div>
          <span className="later" onClick={() => setRoleModalOpen(false)}>Keyinroq tanlayman — saytni ko&apos;rib chiqaman</span>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      <div className={`overlay ${signupOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setSignupOpen(false); }}>
        <div className="role-modal" style={{ maxWidth: 440 }}>
          <button className="close-x" onClick={() => setSignupOpen(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          <h2>{signupRole === 'rep' ? "Sotuvchi sifatida ro'yxatdan o'tish" : signupRole === 'manager' ? "Sotuv rahbari — jamoa yaratish" : signupRole === 'candidate' ? "Nomzod sifatida ro'yxatdan o'tish" : "Kompaniya ro'yxatdan o'tishi"}</h2>
          <p className="sub">{signupRole === 'rep' ? "AI mijoz bilan mashq qilib, sotuv mahoratingizni oshiring." : signupRole === 'manager' ? "Jamoangizni tayyorlash va mahorat o'sishini kuzatish uchun." : "Yollash moduli uchun hisob yarating."}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}><label>Ism</label><input type="text" placeholder="Ismingiz" value={suFirstName} onChange={e => setSuFirstName(e.target.value)} /></div>
            <div className="field" style={{ flex: 1 }}><label>Familiya</label><input type="text" placeholder="Familiyangiz" value={suLastName} onChange={e => setSuLastName(e.target.value)} /></div>
          </div>
          {(signupRole === 'manager' || signupRole === 'employer') && (
            <div className="field"><label>Kompaniya / jamoa nomi</label><input type="text" placeholder="Kompaniyangiz nomi" value={suCompany} onChange={e => setSuCompany(e.target.value)} /></div>
          )}
          <div className="field"><label>Email</label><input type="email" placeholder="email@example.com" value={suEmail} onChange={e => setSuEmail(e.target.value)} /></div>
          <div className="field"><label>Telefon raqam</label><input type="text" placeholder="+998..." value={suPhone} onChange={e => setSuPhone(e.target.value)} /></div>
          <div className="field"><label>Parol</label><input type="password" placeholder="Kamida 8 ta belgi" value={suPass} onChange={e => setSuPass(e.target.value)} /></div>
          <div className="field"><label>Parolni tasdiqlash</label><input type="password" placeholder="Parolni qayta kiriting" value={suPassConfirm} onChange={e => setSuPassConfirm(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitSignup(); }} /></div>
          <div className={`err-note ${suErr ? 'show' : ''}`}>{suErr}</div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submitSignup}>Ro&apos;yxatdan o&apos;tish</button>
          <SocialButtons role={signupRole} />
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: 'var(--muted)' }}>Hisobingiz bormi? <a href="#" onClick={(e) => { e.preventDefault(); openLogin(); }} style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>Kirish</a></div>
        </div>
      </div>

      {/* LOGIN MODAL */}
      <div className={`overlay ${loginOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setLoginOpen(false); }}>
        <div className="role-modal" style={{ maxWidth: 400 }}>
          <button className="close-x" onClick={() => setLoginOpen(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          <h2>Tizimga kirish</h2>
          <p className="sub">Platformadan foydalanish uchun hisobingizga kiring.</p>
          <div className="field"><label>Email</label><input type="email" placeholder="email@example.com" value={liEmail} onChange={e => setLiEmail(e.target.value)} /></div>
          <div className="field"><label>Parol</label><input type="password" placeholder="Parolingizni kiriting" value={liPass} onChange={e => setLiPass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitLogin(); }} /></div>
          <div className={`err-note ${liErr ? 'show' : ''}`}>{liErr}</div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submitLogin}>Kirish</button>
          <SocialButtons role="candidate" />
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: 'var(--muted)' }}>Hisobingiz yo&apos;qmi? <a href="#" onClick={(e) => { e.preventDefault(); setRoleModalOpen(true); }} style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>Ro&apos;yxatdan o&apos;tish</a></div>
        </div>
      </div>
    </>
  );
}
