'use client';

import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';

const AI_META = {
  cvCheck: { label: "CV tahlili", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  test: { label: "Test topshirig'i", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  openQ: { label: "Ochiq savollar", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  sales: { label: "AI simulyatsiya", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="4"/></svg> },
  video: { label: "Video-intervyu", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
};

const CHARACTERS = [
  { id: 'ishonmaydigan', name: 'Rustam (Ishonchsiz)', description: 'Hech kimga ishonmaydi', greeting: 'Alo, assalomu alaykum. Eshitaman.' },
  { id: 'band', name: 'Sardor (Band Rahbar)', description: 'Vaqti yo\'q, shoshyapti', greeting: 'Alo, assalomu alaykum. Kim bu?' },
  { id: 'buhgalter', name: 'Madina (Buhgalter)', description: 'Faqat raqamlarga qaraydi', greeting: 'Assalomu alaykum. Eshitaman sizni.' },
  { id: 'bazorchi', name: 'Aziza (Narx Talashuvchi)', description: 'Doim chegirma so\'raydi', greeting: 'Alo, assalomu alaykum. Qanaqa masala edi?' },
  { id: 'bilagon', name: 'Jasur (Ekspert)', description: 'Hammasini "biladi"', greeting: 'Assalomu alaykum. Xo\'sh, qanday masalada telefon qildingiz?' },
  { id: 'ikkilanuvchi', name: 'Nigora (Ikkilanuvchi)', description: 'Qaror berolmaydi', greeting: 'Alo... Assalomu alaykum, eshityapman.' },
  { id: 'achchiq', name: 'Tohir (Asabiy)', description: 'Oldin yomon tajriba bo\'lgan', greeting: 'Alo, assalomu alaykum. Siz kimsiz?' },
  { id: 'muloyim_sust', name: 'Zarina (Muloyim)', description: 'Hammaga "ha" deydi', greeting: 'Assalomu alaykum! Eshitaman, marhamat.' },
  { id: 'raqobatchi', name: 'Sanjar (Sodiq Mijoz)', description: 'Boshqa firma bilan ishlaydi', greeting: 'Alo, assalomu alaykum. Nima deysiz?' },
  { id: 'yangi', name: 'Sevara (Yangi Mijoz)', description: 'Sohani umuman bilmaydi', greeting: 'Assalomu alaykum. Eshitaman, gapiravering.' },
];

const initialVacancies: any[] = [];


const PIPELINE = ["Yuborildi", "Ko'rib chiqilmoqda", "Suhbat", "Taklif", "Ishga qabul"];

const P_STAGE_META = [
  { key: 'tanishuv', label: 'Tanishuv', max: 12 },
  { key: 'programma', label: 'Programma', max: 8 },
  { key: 'yaqinlashuv', label: 'Yaqinlashuv', max: 9 },
  { key: 'ehtiyoj', label: 'Ehtiyoj', max: 20 },
  { key: 'taqdimot', label: 'Taqdimot', max: 20 },
  { key: 'etiroz', label: "E'tirozlar", max: 9 },
  { key: 'yopish', label: 'Yopish', max: 16 },
  { key: 'followup', label: 'Follow-up', max: 6 },
];

const SESSION_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

function ProfileResultsDashboard({ sessions }: { sessions: any[] }) {
  const withStages = sessions.filter((s) => s.stageScores && typeof s.stageScores === 'object');
  const last10 = withStages.slice(0, 10);

  const totalXP = sessions.reduce((sum, s) => sum + (s.score || 0) * 10, 0);
  const sessCount = sessions.length;
  const avgScore = sessCount ? Math.round(sessions.reduce((s, p) => s + p.score, 0) / sessCount) : 0;
  const bestScore = sessCount ? Math.max(...sessions.map((p) => p.score)) : 0;

  if (sessCount === 0) {
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 6, padding: '30px 22px', marginBottom: 22, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
        <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, margin: '0 0 8px' }}>Hali mashq o&apos;tkazilmagan</h3>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 16px' }}>AI mijoz bilan gaplashib, sotuv mahoratingizni o&apos;lchang.</p>
        <button style={{ background: 'var(--brass)', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 20px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }} onClick={() => { window.location.href = '/chat'; }}>Birinchi mashqni boshlash →</button>
      </div>
    );
  }

  const N = P_STAGE_META.length;
  const cx = 210, cy = 185, R = 130;
  const angleStep = (2 * Math.PI) / N;
  const startAngle = -Math.PI / 2;
  const pointAt = (i: number, r: number) => {
    const a = startAngle + i * angleStep;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPaths = gridLevels.map((lv) => {
    const pts = Array.from({ length: N }, (_, i) => pointAt(i, R * lv));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
  });

  const sessionPolygons = last10.map((sess, si) => {
    const pts = P_STAGE_META.map((s, i) => {
      const v = (sess.stageScores as any)?.[s.key] ?? 0;
      return pointAt(i, R * (v / s.max));
    });
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
    const color = SESSION_COLORS[si % SESSION_COLORS.length];
    return { path, pts, color, label: sess.personaName || sess.persona, score: sess.score, date: sess.createdAt };
  });

  // XP chart
  const sorted = [...sessions].reverse();
  let cumXP = 0;
  const xpData = sorted.map((s) => {
    cumXP += (s.score || 0) * 10;
    return { date: new Date(s.createdAt), xp: cumXP };
  });
  const maxXP = Math.max(cumXP, 100);
  const chartW = 560, chartH = 200, padL = 50, padR = 20, padT = 20, padB = 36;
  const plotW = chartW - padL - padR, plotH = chartH - padT - padB;
  const xpPts = xpData.map((d, i) => {
    const x = padL + (xpData.length > 1 ? (i / (xpData.length - 1)) * plotW : plotW / 2);
    const y = padT + plotH - (d.xp / maxXP) * plotH;
    return [x, y];
  });
  const xpLine = xpPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const firstDate = xpData.length > 0 ? xpData[0].date.toLocaleDateString('uz-UZ') : '';
  const lastDate = xpData.length > 0 ? xpData[xpData.length - 1].date.toLocaleDateString('uz-UZ') : '';

  return (
    <>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Jami mashqlar', value: sessCount, icon: '🎯' },
          { label: "O'rtacha ball", value: `${avgScore}%`, icon: '📊' },
          { label: 'Eng yaxshi', value: `${bestScore}%`, icon: '🏆' },
          { label: 'Jami XP', value: `${totalXP.toLocaleString()}`, icon: '⚡' },
        ].map((st) => (
          <div key={st.label} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 18px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{st.icon}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 600 }}>{st.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Radar chart — last 10 sessions */}
      {last10.length > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 6, padding: '20px 22px', marginBottom: 18, boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, margin: '0 0 4px' }}>Mahorat radar diagrammasi</h3>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 12px' }}>Oxirgi {last10.length} ta suhbat natijasi — har bir suhbat alohida rangda</p>
          <svg viewBox="0 0 460 390" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}>
            {gridPaths.map((d, i) => <path key={i} d={d} fill={i === 0 ? 'rgba(140,106,36,.04)' : 'none'} stroke="var(--line)" strokeWidth={i === gridLevels.length - 1 ? 1.2 : 0.5} />)}
            {P_STAGE_META.map((_, i) => {
              const [x, y] = pointAt(i, R);
              return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth={0.4} />;
            })}
            {sessionPolygons.map((sp, si) => (
              <g key={si}>
                <path d={sp.path} fill={sp.color + '18'} stroke={sp.color} strokeWidth={1.6} strokeLinejoin="round" />
                {sp.pts.map((p, pi) => <circle key={pi} cx={p[0]} cy={p[1]} r={2.8} fill={sp.color} />)}
              </g>
            ))}
            {P_STAGE_META.map((s, i) => {
              const [x, y] = pointAt(i, R + 20);
              const anchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle';
              return <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="central" fill="var(--ink-soft)" fontSize={10.5} fontWeight={500} fontFamily="Inter,sans-serif">{s.label}</text>;
            })}
          </svg>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 10, justifyContent: 'center' }}>
            {sessionPolygons.map((sp, si) => (
              <span key={si} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-soft)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: sp.color, flexShrink: 0 }} />
                {sp.label} ({sp.score}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* XP Progress chart */}
      {xpData.length >= 2 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 6, padding: '20px 22px', marginBottom: 22, boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, margin: '0 0 4px' }}>XP o&apos;sish grafigi</h3>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 12px' }}>Har bir mashqdan {'{score × 10}'} XP qo&apos;shiladi</p>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" style={{ maxWidth: 600, display: 'block', margin: '0 auto' }}>
            {/* Y axis labels */}
            <text x={padL - 8} y={padT} textAnchor="end" dominantBaseline="central" fill="var(--ink-soft)" fontSize={10} fontFamily="'IBM Plex Mono',monospace">{maxXP.toLocaleString()} XP</text>
            <text x={padL - 8} y={padT + plotH} textAnchor="end" dominantBaseline="central" fill="var(--ink-soft)" fontSize={10} fontFamily="'IBM Plex Mono',monospace">0</text>
            {/* Grid lines */}
            <line x1={padL} y1={padT} x2={padL + plotW} y2={padT} stroke="var(--line)" strokeWidth={0.5} />
            <line x1={padL} y1={padT + plotH / 2} x2={padL + plotW} y2={padT + plotH / 2} stroke="var(--line)" strokeWidth={0.5} strokeDasharray="4 4" />
            <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--line)" strokeWidth={0.5} />
            {/* Area fill */}
            <path d={`${xpLine} L${xpPts[xpPts.length - 1][0].toFixed(1)},${(padT + plotH).toFixed(1)} L${xpPts[0][0].toFixed(1)},${(padT + plotH).toFixed(1)} Z`} fill="rgba(20,184,166,.1)" />
            {/* Line */}
            <path d={xpLine} fill="none" stroke="#14b8a6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {xpPts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#14b8a6" stroke="var(--white)" strokeWidth={2} />)}
            {/* X axis dates */}
            <text x={padL} y={padT + plotH + 22} textAnchor="start" fill="var(--ink-soft)" fontSize={10} fontFamily="'IBM Plex Mono',monospace">{firstDate}</text>
            <text x={padL + plotW} y={padT + plotH + 22} textAnchor="end" fill="var(--ink-soft)" fontSize={10} fontFamily="'IBM Plex Mono',monospace">{lastDate}</text>
          </svg>
        </div>
      )}
    </>
  );
}

export default function CandidatePanel() {
  const [view, setView] = useState('jobs');
  const [searchQ, setSearchQ] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);

  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [activeAppId, setActiveAppId] = useState<number | null>(null);
  const [vacancies, setVacancies] = useState<any[]>(initialVacancies);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userObj, setUserObj] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  React.useEffect(() => {
    const user = localStorage.getItem('ishla_user');
    if (user) {
      setIsLoggedIn(true);
      const parsed = JSON.parse(user);
      setUserObj(parsed);
      setPIsm(parsed.firstName || '');
      setPFam(parsed.lastName || '');

      loadApplications();
      loadPractice();

      if (parsed.profileData) {
        if (parsed.profileData.rTitle) setRTitle(parsed.profileData.rTitle);
        if (parsed.profileData.pIsm) setPIsm(parsed.profileData.pIsm);
        if (parsed.profileData.pFam) setPFam(parsed.profileData.pFam);
        if (parsed.profileData.rFio) setRFio(parsed.profileData.rFio);
          if (parsed.profileData.rPatronymic) setRPatronymic(parsed.profileData.rPatronymic);
          if (parsed.profileData.rBirthDate) setRBirthDate(parsed.profileData.rBirthDate);
          if (parsed.profileData.rGender) setRGender(parsed.profileData.rGender);
          if (parsed.profileData.rCity) setRCity(parsed.profileData.rCity);
          if (parsed.profileData.rAddress) setRAddress(parsed.profileData.rAddress);
          if (parsed.profileData.rPhone) setRPhone(parsed.profileData.rPhone);
          if (parsed.profileData.rCitizenship) setRCitizenship(parsed.profileData.rCitizenship);

        if (parsed.profileData.profilePhoto) setProfilePhoto(parsed.profileData.profilePhoto);
        if (parsed.profileData.rAbout) setRAbout(parsed.profileData.rAbout);
        if (parsed.profileData.skills) setSkills(parsed.profileData.skills);
        if (parsed.profileData.expList) setExpList(parsed.profileData.expList);
        if (parsed.profileData.eduList) setEduList(parsed.profileData.eduList);
        if (parsed.profileData.langList) setLangList(parsed.profileData.langList);
        if (parsed.profileData.courseList) setCourseList(parsed.profileData.courseList);
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'profile') setView('profile');
    }
  }, []);

  React.useEffect(() => {
    fetch('/api/vacancies')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          const formatted = data.map((v: any) => ({
            ...v,
            dept: v.department?.name || v.dept,
            aiConfig: {
              cvCheck: { enabled: v.cvCheckEnabled, minScore: v.cvMinScore },
              test: { enabled: v.testEnabled, questions: v.vacancyTests || [] },
              openQ: { enabled: v.openQEnabled, questions: (v.vacancyOpenQs || []).map((q: any) => q.text) },
              sales: { enabled: v.salesEnabled, product: v.salesProduct, personas: v.salesPersonas || [] },
              video: { enabled: v.videoEnabled, prompt: v.videoPrompt },
            }
          }));
          setVacancies(formatted);
            const params = new URLSearchParams(window.location.search);
            const vid = params.get("id");
            const doApply = params.get("apply");
            if (vid) {
               const targetV = formatted.find((x: any) => x.publicId === vid);
               if (targetV) {
                 setCurrentJobId(targetV.id);
                 if (doApply) {
                    const usrStr = localStorage.getItem('ishla_user');
                    if (!usrStr) {
                       setAuthModalOpen(true);
                    } else {
                       const v = targetV;
                       const defs = [{ key: 'info', label: "CV yuklash" }];
                    if (v.aiConfig.test.enabled) defs.push({ key: 'test', label: "Test" });
                    if (v.aiConfig.openQ.enabled) defs.push({ key: 'open', label: "Savollar" });
                    if (v.aiConfig.sales.enabled) defs.push({ key: 'sales', label: "Sotuv simulyatsiyasi" });
                    if (v.aiConfig.video.enabled) defs.push({ key: 'video', label: "Video" });
                    defs.push({ key: 'review', label: "Yakunlash" });
                    setStepDefs(defs);
                    setStepIdx(0);
                    let randId = "muloyim_sust";
                    if (v.aiConfig.sales.personas && v.aiConfig.sales.personas.length > 0) {
                      randId = v.aiConfig.sales.personas[Math.floor(Math.random() * v.aiConfig.sales.personas.length)];
                    }
                    const selChar = CHARACTERS.find(c => c.id === randId) || CHARACTERS[0];
                    const initialLog = v.aiConfig.sales.enabled ? [{ from: 'ai', text: v.aiConfig.sales.product ? `Assalomu alaykum. "${v.aiConfig.sales.product}" haqida gapirmoqchi ekansiz. ${selChar.greeting}` : selChar.greeting }] : [];
                    setDraft({
                      vacancyId: v.id, cvFileName: null, cvScore: null, testAnswers: {}, testScore: null,
                      openAnswers: {}, salesLog: initialLog, salesTurn: 0, salesScore: null, salesFeedback: null,
                      cvSource: 'profile', videoLink: '', isCvLoading: false, testError: false, openError: false,
                      videoError: false, cvError: false, cvErrMsg: '', activePersonaId: randId,
                    });
                    setView('apply');
                    }
                 } else {
                   setView("job-detail");
                 }
               }
            }
        }
      });
  }, []);

  const [stepIdx, setStepIdx] = useState(0);
  const [stepDefs, setStepDefs] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);

  const [toastMsg, setToastMsg] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const [practiceSessions, setPracticeSessions] = useState<any[]>([]);

  const loadPractice = React.useCallback(async () => {
    try {
      const res = await fetch('/api/practice');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setPracticeSessions(data);
    } catch { /* ignore */ }
  }, []);

  const stageIdxMap: Record<string, number> = { new: 0, review: 1, interview: 2, offer: 3, hired: 4, rejected: 1 };

  const loadApplications = React.useCallback(async () => {
    try {
      const res = await fetch('/api/candidates?mine=1');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const apps = data.map((c: any) => {
        const oaMap: Record<number, string> = {};
        const qList = (c.vacancy?.vacancyOpenQs || []).map((q: any) => q.text);
        (c.openAnswers || []).forEach((a: any) => {
          const idx = qList.indexOf(a.question);
          if (idx >= 0) oaMap[idx] = a.answer;
        });
        return {
          id: c.id,
          vacancyId: c.vacancyId,
          vacancyTitle: c.vacancy?.title || '',
          submittedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('uz-UZ') : '—',
          stageIdx: stageIdxMap[c.stage] ?? 0,
          stage: c.stage,
          draft: {
            cvScore: c.cvScore, testScore: c.testScore, salesScore: c.salesScore,
            videoLink: c.videoLink, openAnswers: oaMap,
          },
        };
      });
      setMyApplications(apps);
    } catch { /* ignore */ }
  }, []);
  
  // Profile / Resume State
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [pIsm, setPIsm] = useState('');
  const [pFam, setPFam] = useState('');
  const [rTitle, setRTitle] = useState('');
  const [rFio, setRFio] = useState('');
  const [rPatronymic, setRPatronymic] = useState('');
  const [rBirthDate, setRBirthDate] = useState('');
  const [rGender, setRGender] = useState('');
  const [rCity, setRCity] = useState('');
  const [rAddress, setRAddress] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rCitizenship, setRCitizenship] = useState('');

  
  const [expList, setExpList] = useState<any[]>([{ id: 1 }]);
  const [eduList, setEduList] = useState<any[]>([{ id: 1 }]);
  const [langList, setLangList] = useState<any[]>([{ id: 1 }]);
  const [courseList, setCourseList] = useState<any[]>([]);
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [rAbout, setRAbout] = useState('');
  
  const [contactOk, setContactOk] = useState(false);
  const [salaryOk, setSalaryOk] = useState(false);

  // Compute profile completeness
  const candidateName = (pIsm || pFam) ? `${pIsm} ${pFam}`.trim() : (rFio || 'Ism kiritilmagan');
  const candidateRole = rTitle || 'Lavozim ko\'rsatilmagan';

  let filled = 0, total = 10;
  if (profilePhoto) filled++;
  if (rTitle.trim()) filled++;
  if (rFio.trim()) filled++;
  if (contactOk) filled++;
  if (salaryOk) filled++;
  if (expList.length > 0) filled++;
  if (eduList.length > 0) filled++;
  if (skills.length > 0) filled++;
  if (langList.length > 0) filled++;
  if (rAbout.trim().length > 10) filled++;
  const resumePct = Math.round((filled / total) * 100);

  const getMatchScore = (jobId: number) => {
    if (filled < 3) return null;
    const score = Math.min(99, Math.max(55, 100 - (jobId * 13 % 40) + (filled * 3)));
    return score;
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  };

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('ishla_user');
    window.location.href = '/';
  };

  const filteredJobs = vacancies.filter((v: any) => {
    const matchQ = !searchQ || v.title.toLowerCase().includes(searchQ.toLowerCase()) || v.dept.toLowerCase().includes(searchQ.toLowerCase());
    const matchLoc = !locFilter || v.loc === locFilter;
    return matchQ && matchLoc;
  });

  const activeJob = vacancies.find((v: any) => v.id === currentJobId);
  const activeApp = myApplications.find(a => a.id === activeAppId);
  const activeAppJob = vacancies.find((v: any) => v.id === activeApp?.vacancyId);

  const scoreClass = (n: number) => {
    if (n === null || n === undefined) return 'mid';
    if (n >= 80) return 'high';
    if (n >= 60) return 'mid';
    return 'low';
  };

  const statusBadge = (status: string) => {
    return status === 'active'
      ? <span className="badge active"><span className="badge-dot"></span>Faol</span>
      : <span className="badge closed"><span className="badge-dot"></span>Yopilgan</span>;
  };

  const aiPillsForVacancy = (v: any) => {
    if (!v.aiConfig) return null;
    const keys = Object.keys(v.aiConfig).filter(k => v.aiConfig[k].enabled);
    if (!keys.length) return null;
    return (
      <div className="ai-pill-row" style={{ marginTop: 12 }}>
        {keys.map(k => (
          <span key={k} className="ai-pill">{AI_META[k as keyof typeof AI_META].icon}{AI_META[k as keyof typeof AI_META].label}</span>
        ))}
      </div>
    );
  };

  
  const saveProfile = async () => {
    if (!userObj) { showToast('Avval tizimga kiring'); return; }
    const profileData = {
      rTitle, rAbout, skills, expList, eduList, langList, courseList, pIsm, pFam, rFio, profilePhoto, rPatronymic, rBirthDate, rGender, rCity, rAddress, rPhone, rCitizenship
    };
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData })
      });
      if (res.ok) {
        showToast('Profil muvaffaqiyatli saqlandi');
        const updatedUser = { ...userObj, profileData };
        setUserObj(updatedUser);
        localStorage.setItem('ishla_user', JSON.stringify(updatedUser));
      } else if (res.status === 401) {
        showToast('Sessiya tugagan — qaytadan kiring');
        localStorage.removeItem('ishla_user');
        setTimeout(() => { window.location.href = '/?login=1'; }, 1200);
      } else {
        showToast('Saqlashda xatolik');
      }
    } catch(e) { showToast('Tarmoq xatosi'); }
  };

  
  const updateList = (listName: string, id: number, field: string, val: any) => {
    if (listName === 'expList') setExpList(prev => prev.map(x => x.id === id ? { ...x, [field]: val } : x));
    if (listName === 'eduList') setEduList(prev => prev.map(x => x.id === id ? { ...x, [field]: val } : x));
    if (listName === 'langList') setLangList(prev => prev.map(x => x.id === id ? { ...x, [field]: val } : x));
  };

  const startApply = (id: number) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    if (myApplications.some(a => a.vacancyId === id)) {
      showToast("Siz bu vakansiyaga allaqachon ariza topshirgansiz");
      setView('applications');
      return;
    }
    const v = vacancies.find(x => x.id === id);
    if (!v) return;

    const defs = [{ key: 'info', label: "CV yuklash" }];
    if (v.aiConfig.test.enabled) defs.push({ key: 'test', label: "Test" });
    if (v.aiConfig.openQ.enabled) defs.push({ key: 'open', label: "Savollar" });
    if (v.aiConfig.sales.enabled) defs.push({ key: 'sales', label: "Sotuv simulyatsiyasi" });
    if (v.aiConfig.video.enabled) defs.push({ key: 'video', label: "Video" });
    defs.push({ key: 'review', label: "Yakunlash" });

    setStepDefs(defs);
    setStepIdx(0);
    
    let randId = "muloyim_sust";
    if (v.aiConfig.sales.personas && v.aiConfig.sales.personas.length > 0) {
      randId = v.aiConfig.sales.personas[Math.floor(Math.random() * v.aiConfig.sales.personas.length)];
    }
    const selChar = CHARACTERS.find(c => c.id === randId) || CHARACTERS[0];
    const opener = selChar.greeting || "Bizga bunday narsa hozircha kerak emasdek tuyulyapti — xarajatlarni oshirib nima qilamiz?";
    const initialLog = v.aiConfig.sales.enabled ? [{ from: 'ai', text: v.aiConfig.sales.product ? `Assalomu alaykum. "${v.aiConfig.sales.product}" haqida gapirmoqchi ekansiz. ${opener}` : opener }] : [];

    setDraft({
      vacancyId: v.id, cvFileName: null,
      cvScore: null, testAnswers: {}, testScore: null,
      openAnswers: {}, salesLog: initialLog, salesTurn: 0, salesScore: null, salesFeedback: null,
      cvSource: 'profile', videoLink: '', isCvLoading: false, testError: false, openError: false, videoError: false, cvError: false, cvErrMsg: '',
      activePersonaId: randId,
    });
    
    setView('apply');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const onFilePick = (e: any) => {
    const f = e.target.files[0];
    if (f) setDraft({ ...draft, cvFileName: f.name, cvError: false, fileObj: f, cvSource: 'file' });
  };

  const submitInfo = async () => {
    if (!draft.cvFileName) {
      setDraft({ ...draft, cvError: true });
      return;
    }
    const v = vacancies.find(x => x.id === draft.vacancyId);
    const minScore = v?.aiConfig.cvCheck.minScore || 0;

    // Re-check an already-computed score against the minimum on "back/next".
    if (v?.aiConfig.cvCheck.enabled && draft.cvScore !== null && draft.cvScore !== undefined) {
      if (draft.cvScore < minScore) {
        setDraft({ ...draft, cvErrMsg: `CV mosligingiz ${draft.cvScore}% — minimal ${minScore}% talab qilinadi.` });
        return;
      }
      nextStep();
      return;
    }

    if (v?.aiConfig.cvCheck.enabled) {
      setDraft({ ...draft, isCvLoading: true, cvErrMsg: '' });
      try {
        let reqBody: any;
        const headers: any = {};
        if (draft.cvSource === 'file' && draft.fileObj) {
          reqBody = new FormData();
          reqBody.append('vacancy', JSON.stringify(v));
          reqBody.append('file', draft.fileObj);
          // Omit Content-Type so the browser sets the multipart boundary.
        } else {
          reqBody = JSON.stringify({ vacancy: v, profile: userObj?.profileData || {} });
          headers['Content-Type'] = 'application/json';
        }

        const res = await fetch('/api/analyze-cv', { method: 'POST', headers, body: reqBody });
        const data = await res.json();

        if (!res.ok || data.score === null || data.score === undefined) {
          setDraft((prev: any) => ({ ...prev, isCvLoading: false, cvErrMsg: 'CV tahlilini yakunlab bo\'lmadi. Iltimos, keyinroq urinib ko\'ring.' }));
          return;
        }
        if (data.score < minScore) {
          setDraft((prev: any) => ({ ...prev, cvScore: data.score, isCvLoading: false, cvErrMsg: `Afsuski, CV mosligingiz ${data.score}% — bu vakansiya uchun minimal ${minScore}% talab qilinadi.` }));
          return;
        }
        setDraft((prev: any) => ({ ...prev, cvScore: data.score, isCvLoading: false, cvErrMsg: '' }));
        nextStep();
      } catch (err) {
        console.error('AI fetch failed:', err);
        setDraft((prev: any) => ({ ...prev, isCvLoading: false, cvErrMsg: 'Tarmoq xatosi. Qaytadan urinib ko\'ring.' }));
      }
    } else {
      nextStep();
    }
  };

  const submitTest = async () => {
    const v = vacancies.find(x => x.id === draft.vacancyId);
    if (!v) return;
    const qs = v.aiConfig.test.questions;
    if (Object.keys(draft.testAnswers).length < qs.length) {
      setDraft({ ...draft, testError: true });
      return;
    }
    // Score on the server so correct answers are never exposed to the browser.
    try {
      const res = await fetch('/api/score-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacancyId: v.id, answers: draft.testAnswers }),
      });
      const data = await res.json();
      setDraft((prev: any) => ({ ...prev, testScore: typeof data.score === 'number' ? data.score : 0, testError: false }));
    } catch {
      setDraft((prev: any) => ({ ...prev, testScore: 0, testError: false }));
    }
    nextStep();
  };

  const submitOpen = () => {
    const v = vacancies.find(x => x.id === draft.vacancyId);
    if (!v) return;
    const qs = v.aiConfig.openQ.questions;
    const filled = qs.every((_: any, qi: number) => draft.openAnswers[qi] && draft.openAnswers[qi].trim());
    if (!filled) {
      setDraft({ ...draft, openError: true });
      return;
    }
    setDraft({ ...draft, openError: false });
    nextStep();
  };

  // Live AI sales simulation — talks to /api/chat-simulator instead of the old
  // hard-coded rebuttals so the candidate's replies are actually evaluated.
  const sendChat = async () => {
    if (!chatInput.trim() || draft.salesScore !== null || chatSending) return;
    const v = vacancies.find(x => x.id === draft.vacancyId);
    const text = chatInput.trim();
    const newLog = [...draft.salesLog, { from: 'me', text }];
    setDraft((prev: any) => ({ ...prev, salesLog: newLog }));
    setChatInput('');
    setChatSending(true);
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50);
    try {
      const res = await fetch('/api/chat-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newLog, product: v?.aiConfig.sales.product || '', personaId: draft.activePersonaId, finalEval: false }),
      });
      const data = await res.json();
      setDraft((prev: any) => ({ ...prev, salesLog: [...newLog, { from: 'ai', text: data.reply || '...' }] }));
    } catch {
      setDraft((prev: any) => ({ ...prev, salesLog: [...newLog, { from: 'ai', text: '(Aloqa xatosi, qaytadan urinib ko\'ring)' }] }));
    } finally {
      setChatSending(false);
      setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 60);
    }
  };

  const finalizeSales = async () => {
    if (chatSending || draft.salesScore !== null) return;
    const v = vacancies.find(x => x.id === draft.vacancyId);
    setChatSending(true);
    try {
      const res = await fetch('/api/chat-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: draft.salesLog, product: v?.aiConfig.sales.product || '', personaId: draft.activePersonaId, finalEval: true }),
      });
      const data = await res.json();
      setDraft((prev: any) => ({ ...prev, salesScore: typeof data.score === 'number' ? data.score : 60, salesFeedback: data.feedback || '' }));
    } catch {
      setDraft((prev: any) => ({ ...prev, salesScore: 60, salesFeedback: 'Baholab bo\'lmadi.' }));
    } finally {
      setChatSending(false);
    }
  };

  const submitVideo = () => {
    const url = draft.videoLink.trim();
    if (!/^https?:\/\/.+\..+/i.test(url)) {
      setDraft({ ...draft, videoError: true });
      return;
    }
    setDraft({ ...draft, videoError: false });
    nextStep();
  };

  const nextStep = () => {
    if (stepIdx < stepDefs.length - 1) {
      setStepIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const prevStep = () => {
    if (stepIdx > 0) {
      setStepIdx(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const finalSubmit = async () => {
    const v = vacancies.find(x => x.id === draft.vacancyId);
    if (!v) return;
    
    const formattedOpenAnswers = v.aiConfig.openQ.questions.map((qText: string, i: number) => ({
      question: qText,
      answer: draft.openAnswers[i] || ""
    })).filter((a: any) => a.answer.trim().length > 0);

    const payload = {
      name: candidateName === 'Ism kiritilmagan' ? "Yangi Nomzod" : candidateName,
      role: candidateRole === 'Lavozim ko\'rsatilmagan' ? v.title : candidateRole,
      match: draft.cvScore || 0,
      cvScore: draft.cvScore,
      testScore: draft.testScore,
      salesScore: draft.salesScore,
      salesFeedback: draft.salesFeedback || null,
      videoLink: draft.videoLink || null,
      vacancyId: v.id,
      openAnswers: formattedOpenAnswers
    };

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setDraft(null);
        await loadApplications();
        setView('applications');
        showToast("Ariza muvaffaqiyatli yuborildi");
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Xatolik: Ariza yuborilmadi");
      }
    } catch (e) {
      showToast("Xatolik yuz berdi");
    }
  };

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfilePhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setSkillInput('');
      }
    }
  };

  const isProfileMode = view === 'profile' || view === 'resume' || view === 'practice' || view === 'applications' || view === 'app-detail';

  const practiceAvg = practiceSessions.length
    ? Math.round(practiceSessions.reduce((s, p) => s + p.score, 0) / practiceSessions.length)
    : null;
  const practiceBest = practiceSessions.length
    ? Math.max(...practiceSessions.map((p) => p.score))
    : null;

  return (
    <>
      {!isProfileMode && <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        :root{
          --ink:#14213D; --ink-soft:#2C3E63; --paper:#EDF1EE; --card:#FFFFFF;
          --accent:#E8A33D; --accent-deep:#C1811F; --accent-ink:#4A3110; --accent-bg:#FBF2E1;
          --success:#2F7A5C; --success-bg:#E3F1EA; --danger:#C1443C; --danger-bg:#FBEAE8;
          --violet:#6C5CB0; --violet-bg:#EDEAF7; --muted:#6B7280; --line:#DAE1DB;
          --line-strong:#C3CDC5; --font-display:'Fraunces', serif; --font-body:'Inter', sans-serif;
          --font-mono:'IBM Plex Mono', monospace; --radius:10px;
        }
        *{box-sizing:border-box;}
        body{font-family:var(--font-body);background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased;margin:0;padding:0;}
        .topbar{background:var(--ink);color:#EFEDE4;padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:64px;position:sticky;top:0;z-index:30;}
        .brand{display:flex;align-items:center;gap:10px;}
        .brand-mark{width:30px;height:30px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:600;color:var(--accent-ink);font-size:16px;}
        .brand-name{font-family:var(--font-display);font-size:19px;font-weight:600;}
        .topnav{display:flex;gap:4px;align-items:center;}
        .topnav .nav-item{padding:9px 14px;border-radius:8px;font-size:13.5px;color:#C9C6BB;cursor:pointer;font-weight:500;}
        .topnav .nav-item:hover{background:rgba(239,237,228,0.08);color:#EFEDE4;}
        .topnav .nav-item.active{background:var(--accent);color:var(--accent-ink);font-weight:600;}
        .top-avatar{width:32px;height:32px;border-radius:50%;background:#3A4D78;color:#EFEDE4;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;margin-left:10px;cursor:pointer;}
        .top-avatar:hover{opacity:0.9;}
        .main{max-width:920px;margin:0 auto;padding:32px 24px 70px;}
        .view{display:none;}
        .view.active{display:block;}
        .pagehead{margin-bottom:22px;}
        .pagehead h1{font-family:var(--font-display);font-size:27px;font-weight:600;margin:0 0 4px;}
        .pagehead p{margin:0;color:var(--muted);font-size:14px;}
        .btn{font-family:var(--font-body);font-size:13.5px;font-weight:600;border-radius:8px;padding:10px 16px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:transform .1s ease, background .15s ease;white-space:nowrap;}
        .btn:active{transform:scale(0.98);}
        .btn-primary{background:var(--accent);color:var(--accent-ink);}
        .btn-primary:hover{background:var(--accent-deep);color:#fff;}
        .btn-primary:disabled{background:var(--line-strong);color:var(--muted);cursor:not-allowed;transform:none;}
        .btn-ghost{background:transparent;border-color:var(--line-strong);color:var(--ink);}
        .btn-ghost:hover{background:#fff;}
        .btn-sm{padding:7px 12px;font-size:12.5px;}
        .filter-bar{display:flex;gap:10px;margin-bottom:20px; flex-wrap:wrap;}
        .filter-bar input, .filter-bar select{font-family:var(--font-body);font-size:13.5px;border:1px solid var(--line-strong);border-radius:8px;padding:10px 13px;background:var(--card);color:var(--ink);}
        .filter-bar input{flex:1 1 200px;}
        .filter-bar select{flex:1 1 140px;}
        .filter-bar input:focus, .filter-bar select:focus{outline:2px solid var(--accent);outline-offset:1px;}
        .jobs-grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;}
        .job-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px 22px;cursor:pointer;transition:transform 0.2s ease, border-color .15s ease, box-shadow 0.2s ease; display:flex; flex-direction:column;}
        .job-card:hover{border-color:var(--line-strong); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.04);}
        .job-card .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;}
        .job-card h3{font-family:var(--font-display);font-size:17.5px;font-weight:600;margin:0 0 4px;}
        .job-card .co{font-size:13px;color:var(--ink-soft);font-weight:500;}
        .job-card .loc{font-size:12.5px;color:var(--muted);margin-top:2px;}
        .job-card .salary{font-family:var(--font-mono);font-size:14.5px;color:var(--ink);margin:14px 0;font-weight:500;}
        .job-card .ai-pill-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto;}
        .ai-pill{display:inline-flex;align-items:center;gap:5px;background:var(--violet-bg);color:var(--violet);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;}
        .ai-pill svg{width:12px;height:12px;}
        .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:600;}
        .badge.active{background:var(--success-bg);color:var(--success);}
        .badge.closed{background:var(--danger-bg);color:var(--danger);}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;}
        .detail-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:26px 30px;margin-bottom:20px;}
        .detail-card h2{font-family:var(--font-display);font-size:24px;font-weight:600;margin:0 0 6px;}
        .detail-card .co{font-size:15px;color:var(--ink-soft);font-weight:500;}
        .detail-card .salary{font-family:var(--font-mono);font-size:17px;color:var(--accent-ink);margin:16px 0;font-weight:600;background:var(--accent-bg);display:inline-block;padding:4px 10px;border-radius:6px;}
        .detail-desc{white-space:pre-wrap;font-size:14.5px;line-height:1.6;color:var(--ink);margin-top:20px;}
        .back-link{display:inline-flex;align-items:center;gap:5px;font-size:13.5px;color:var(--muted);cursor:pointer;margin-bottom:20px;font-weight:500;}
        .back-link:hover{color:var(--ink);}
        
        .progress-bar{display:flex;margin:0 auto 30px;max-width:900px;align-items:center;justify-content:space-between;position:relative;}
        .progress-bar::before{content:"";position:absolute;top:14px;left:0;right:0;height:2px;background:var(--line);z-index:0;}
        .step-dot{width:30px;height:30px;border-radius:50%;background:var(--card);border:2px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--muted);position:relative;z-index:1;transition:.2s;}
        .step-dot.active{border-color:var(--accent);background:var(--accent);color:var(--accent-ink);}
        .step-dot.done{border-color:var(--success);background:var(--success);color:#fff;}
        .step-label{position:absolute;top:36px;font-size:11.5px;white-space:nowrap;color:var(--muted);font-weight:500;left:50%;transform:translateX(-50%);}
        .step-dot.active .step-label{color:var(--ink);font-weight:600;}
        
        .apply-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:30px;max-width:900px;margin:0 auto;}
        .apply-card h2{font-family:var(--font-display);font-size:20px;font-weight:900;margin:0 0 8px;}
        .apply-card .sub{font-size:14px;color:var(--muted);margin-bottom:24px;line-height:1.5;}
        .step-actions{display:flex;justify-content:space-between;margin-top:30px;padding-top:20px;border-top:1px solid var(--line);}
        .step-actions .right{margin-left:auto;display:flex;gap:10px;}
        
        .file-drop{border:2px dashed var(--line-strong);border-radius:8px;padding:30px;text-align:center;background:#F9FAF8;cursor:pointer;transition:.2s;}
        .file-drop:hover{border-color:var(--accent);background:#fff;}
        .file-drop.has-file{border-color:var(--success);background:var(--success-bg);}
        .file-drop input{display:none;}
        
        .err-note{font-size:12.5px;color:var(--danger);background:var(--danger-bg);padding:10px 14px;border-radius:8px;margin-bottom:16px;display:none;font-weight:500;}
        .err-note.show{display:block;}
        
        .q-block{margin-bottom:24px;}
        .q-block .qt{font-weight:600;font-size:14.5px;margin-bottom:12px;line-height:1.4;}
        .opt-radio{display:flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid var(--line);border-radius:8px;margin-bottom:8px;cursor:pointer;transition:.15s;}
        .opt-radio:hover{border-color:var(--accent);}
        .opt-radio input{margin:0;accent-color:var(--accent);}
        .field textarea, .field input{width:100%;font-family:var(--font-body);font-size:14px;padding:12px 14px;border:1px solid var(--line-strong);border-radius:8px;resize:vertical;outline:none;}
        .field textarea:focus, .field input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg);}
        
        .chat-box{border:1px solid var(--line);border-radius:8px;height:360px;display:flex;flex-direction:column;background:#F9FAF8;overflow:hidden;}
        .chat-log{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;}
        .msg{max-width:80%;padding:12px 16px;border-radius:12px;font-size:14px;line-height:1.5;}
        .msg.ai{background:var(--card);border:1px solid var(--line);align-self:flex-start;border-bottom-left-radius:4px;}
        .msg.me{background:var(--violet);color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}
        .chat-input{display:flex;padding:14px;background:var(--card);border-top:1px solid var(--line);gap:10px;}
        .chat-input input{flex:1;padding:10px 14px;border:1px solid var(--line-strong);border-radius:20px;font-size:14px;outline:none;}
        .chat-input input:focus{border-color:var(--violet);}
        
        .review-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line);font-size:14px;}
        .review-row:last-child{border-bottom:none;}
        .review-row .k{color:var(--muted);}
        .review-row .v{font-weight:600;text-align:right;}
        
        .loader-box{text-align:center;padding:40px 0;}
        .spinner{width:30px;height:30px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;}
        @keyframes spin { 100% { transform:rotate(360deg); } }

        .app-item{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px 24px;margin-bottom:16px;cursor:pointer;transition:.15s;}
        .app-item:hover{border-color:var(--accent);}
        .app-item .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
        .app-item h3{font-family:var(--font-display);font-size:18px;font-weight:600;margin:0 0 4px;}
        .app-item .meta{font-size:13px;color:var(--muted);}
        
        .progress-track{display:flex;align-items:center;justify-content:space-between;position:relative;margin-top:24px;padding-top:20px;border-top:1px solid var(--line-strong);}
        .progress-track::before{content:"";position:absolute;top:23px;left:10px;right:10px;height:2px;background:var(--line);z-index:0;}
        .pstep{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;}
        .pstep .dot{width:10px;height:10px;border-radius:50%;background:var(--line-strong);border:3px solid var(--card);box-sizing:content-box;}
        .pstep span{font-size:11.5px;color:var(--muted);font-weight:500;text-align:center;}
        .pstep.done .dot{background:var(--success);}
        .pstep.done span{color:var(--ink);}
        .pstep.current .dot{background:var(--accent);box-shadow:0 0 0 3px var(--accent-bg);}
        .pstep.current span{color:var(--accent-ink);font-weight:600;}

        .ai-result{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:18px 22px;margin-top:16px;}
        .ai-result .rh{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
        .ai-result .rh .t{font-weight:600;font-size:15px;display:flex;align-items:center;gap:8px;}
        .ai-result .rh .t .icon{color:var(--violet);}
        .score-pill{font-family:var(--font-mono);font-size:14px;font-weight:600;padding:4px 10px;border-radius:6px;}
        .score-pill.high{background:var(--success-bg);color:var(--success);}
        .score-pill.mid{background:var(--accent-bg);color:var(--accent-deep);}
        .score-pill.low{background:var(--danger-bg);color:var(--danger);}
        .ai-result .comment{font-size:13.5px;color:var(--ink-soft);margin:0;line-height:1.5;}

        .toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--ink);color:#EFEDE4;padding:12px 20px;border-radius:8px;font-size:13.5px;opacity:0;transition:opacity .2s ease, transform .2s ease;z-index:60;pointer-events:none;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        @media(max-width:720px){
          .topbar{padding:0 14px;height:58px;}
          .topnav{gap:2px;overflow-x:auto;max-width:64vw;}
          .topnav .nav-item{padding:8px 10px;font-size:12.5px;white-space:nowrap;}
          .brand-name{font-size:17px;}
          .main{padding:22px 16px 70px;}
          .jobs-grid{grid-template-columns:1fr;}
          .apply-card,.detail-card{padding:20px 16px;}
          .progress-bar{overflow-x:auto;gap:6px;justify-content:flex-start;}
          .step-label{display:none;}
          .review-row{flex-wrap:wrap;gap:2px;}
          .chat-box{height:320px;}
        }
        @media(max-width:420px){
          .topnav .nav-item{padding:7px 7px;font-size:12px;}
        }
        `
      }} />}

      {isProfileMode && <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .profile-scope {
          --ink:#16233A;
          --ink-2:#223454;
          --ink-soft:#4A5875;
          --paper:#FAF8F3;
          --paper-2:#F1EEE4;
          --paper-3:#E9E4D6;
          --brass:#8C6A24;
          --brass-light:#C9A227;
          --brass-bg:#F4EAC9;
          --green:#2F5233;
          --green-bg:#E4ECE1;
          --red:#8B3A3A;
          --red-bg:#F3E4E1;
          --line:#DDD6C6;
          --white:#FFFFFF;
          --radius:4px;
          --shadow:0 1px 2px rgba(22,35,58,.06), 0 4px 14px rgba(22,35,58,.05);
          
          background:var(--paper);
          color:var(--ink);
          font-family:'Inter',system-ui,sans-serif;
          font-size:14px;
          line-height:1.5;
          -webkit-font-smoothing:antialiased;
        }
        .profile-scope h1, .profile-scope h2, .profile-scope h3{font-family:'Fraunces',serif;color:var(--ink);margin:0;}
        .profile-scope .mono{font-family:'IBM Plex Mono',monospace;letter-spacing:.02em;}
        .profile-scope a{color:inherit;}
        .profile-scope button{font-family:inherit;}

        .pm-bar{display:none;}
        .pm-overlay{display:none;}
        .profile-scope .app{display:flex;min-height:calc(100vh - 56px);}
        .profile-scope .sidebar{
          width:264px;flex:0 0 264px;background:var(--ink);color:var(--paper);
          padding:28px 20px;display:flex;flex-direction:column;gap:26px;
          position:sticky;top:56px;height:calc(100vh - 56px);
        }

        .profile-scope .mini-card{
          background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);
          border-radius:var(--radius);padding:16px;
        }
        .profile-scope .mini-photo-wrap{display:flex;align-items:center;gap:12px;}
        .profile-scope .mini-photo{
          width:48px;height:48px;border-radius:50%;object-fit:cover;flex:none;
          border:2px solid var(--brass-light);background:#2B3B58;
        }
        .profile-scope .mini-name{font-weight:600;font-size:13.5px;color:var(--paper);}
        .profile-scope .mini-role{font-size:11.5px;color:#9AA6BF;margin-top:2px;}
        .profile-scope .mini-progress-row{margin-top:14px;}
        .profile-scope .mini-progress-label{display:flex;justify-content:space-between;font-size:10.5px;color:#9AA6BF;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}
        .profile-scope .mini-progress-track{height:5px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden;}
        .profile-scope .mini-progress-fill{height:100%;background:var(--brass-light);border-radius:3px;transition:width .4s ease;}

        .profile-scope nav.tabs{display:flex;flex-direction:column;gap:4px;}
        .profile-scope .tab-btn{
          display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:var(--radius);
          background:transparent;border:none;color:#C7CEDD;text-align:left;cursor:pointer;font-size:13.5px;
          font-weight:500;transition:background .15s ease,color .15s ease;
        }
        .profile-scope .tab-btn svg{flex:none;opacity:.85;}
        .profile-scope .tab-btn:hover{background:rgba(255,255,255,.06);color:#fff;}
        .profile-scope .tab-btn.active{background:var(--brass-light);color:var(--ink);font-weight:600;}
        .profile-scope .tab-btn.active svg{opacity:1;}

        .profile-scope .sidebar-foot{margin-top:auto;font-size:11px;color:#7C88A3;border-top:1px solid rgba(255,255,255,.1);padding-top:14px;}
        .profile-scope .status-pill-mini{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:#C7CEDD;}
        .profile-scope .dot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;}

        .profile-scope .main{flex:1;min-width:0;padding:34px 44px 90px;max-width:920px;}
        .profile-scope .page-head{margin-bottom:26px;}
        .profile-scope .eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass);margin-bottom:8px;}
        .profile-scope .page-head h1{font-size:27px;font-weight:600;}
        .profile-scope .page-head p{color:var(--ink-soft);margin-top:6px;font-size:13.5px;max-width:560px;}

        .profile-scope .doc-card{
          background:var(--white);border:1px solid var(--line);border-radius:6px;
          box-shadow:var(--shadow);margin-bottom:22px;overflow:hidden;
        }
        .profile-scope .doc-card-head{
          display:flex;align-items:center;justify-content:space-between;gap:12px;
          padding:16px 22px;border-bottom:1px solid var(--line);background:var(--paper-2);
        }
        .profile-scope .doc-card-head h3{font-size:15.5px;font-weight:600;}
        .profile-scope .doc-card-head .num{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--brass);letter-spacing:.06em;}
        .profile-scope .doc-card-body{padding:22px;}

        .profile-scope .field-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .profile-scope .field-grid.cols-3{grid-template-columns:1fr 1fr 1fr;}
        .profile-scope .field{display:flex;flex-direction:column;gap:6px;}
        .profile-scope .field.full{grid-column:1 / -1;}
        .profile-scope .field label{font-size:12px;font-weight:600;color:var(--ink-2);}
        .profile-scope .field .hint{font-size:11px;color:#8B93A8;font-weight:400;}
        .profile-scope input[type=text], .profile-scope input[type=email], .profile-scope input[type=tel], .profile-scope input[type=date], .profile-scope input[type=number], .profile-scope input[type=password], .profile-scope select, .profile-scope textarea{
          border:1px solid var(--line);border-radius:var(--radius);padding:9px 11px;font-size:13.5px;
          background:var(--white);color:var(--ink);font-family:inherit;width:100%;transition:border-color .15s ease, box-shadow .15s ease;
        }
        .profile-scope textarea{resize:vertical;min-height:84px;}
        .profile-scope input:focus, .profile-scope select:focus, .profile-scope textarea:focus{outline:none;border-color:var(--brass-light);box-shadow:0 0 0 3px var(--brass-bg);}
        .profile-scope input::placeholder, .profile-scope textarea::placeholder{color:#A8AEBD;}

        .profile-scope .status-options{display:flex;flex-wrap:wrap;gap:8px;}
        .profile-scope .status-opt{
          border:1px solid var(--line);border-radius:20px;padding:8px 14px;font-size:12.5px;font-weight:500;
          cursor:pointer;background:var(--white);color:var(--ink-soft);transition:.15s;user-select:none;
        }
        .profile-scope .status-opt input{display:none;}
        .profile-scope .status-opt.sel-green.checked{background:var(--green-bg);border-color:var(--green);color:var(--green);}
        .profile-scope .status-opt.sel-brass.checked{background:var(--brass-bg);border-color:var(--brass);color:var(--brass);}
        .profile-scope .status-opt.sel-red.checked{background:var(--red-bg);border-color:var(--red);color:var(--red);}
        .profile-scope .status-opt.sel-neutral.checked{background:var(--paper-3);border-color:#B9B198;color:var(--ink);}

        .profile-scope .toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid var(--paper-3);}
        .profile-scope .toggle-row:last-child{border-bottom:none;}
        .profile-scope .toggle-row .t-title{font-size:13.5px;font-weight:600;}
        .profile-scope .toggle-row .t-desc{font-size:12px;color:var(--ink-soft);margin-top:2px;}
        .profile-scope .switch{position:relative;width:40px;height:22px;flex:none;}
        .profile-scope .switch input{opacity:0;width:0;height:0;}
        .profile-scope .slider{position:absolute;inset:0;background:#D6D0C0;border-radius:22px;cursor:pointer;transition:.2s;}
        .profile-scope .slider:before{content:"";position:absolute;width:16px;height:16px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 1px 2px rgba(0,0,0,.25);}
        .profile-scope .switch input:checked + .slider{background:var(--brass);}
        .profile-scope .switch input:checked + .slider:before{transform:translateX(18px);}

        .profile-scope .photo-uploader{display:flex;align-items:center;gap:18px;}
        .profile-scope .photo-frame-round{
          width:88px;height:88px;border-radius:50%;border:2px dashed var(--line);
          display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--paper-2);flex:none;
        }
        .profile-scope .photo-frame-round img{width:100%;height:100%;object-fit:cover;}
        .profile-scope .photo-frame-doc{
          position:relative;width:96px;height:120px;border:1.5px solid var(--ink-2);flex:none;
          background:var(--paper-2);display:flex;align-items:center;justify-content:center;overflow:hidden;
        }
        .profile-scope .photo-frame-doc img{width:100%;height:100%;object-fit:cover;}
        .profile-scope .photo-frame-doc .corner{position:absolute;width:10px;height:10px;border-color:var(--brass);}
        .profile-scope .photo-frame-doc .c1{top:-1px;left:-1px;border-top:2px solid var(--brass);border-left:2px solid var(--brass);}
        .profile-scope .photo-frame-doc .c2{top:-1px;right:-1px;border-top:2px solid var(--brass);border-right:2px solid var(--brass);}
        .profile-scope .photo-frame-doc .c3{bottom:-1px;left:-1px;border-bottom:2px solid var(--brass);border-left:2px solid var(--brass);}
        .profile-scope .photo-frame-doc .c4{bottom:-1px;right:-1px;border-bottom:2px solid var(--brass);border-right:2px solid var(--brass);}
        .profile-scope .photo-icon{color:#B7AF98;}
        .profile-scope .photo-actions{display:flex;flex-direction:column;gap:8px;}
        .profile-scope .photo-actions .hint{font-size:11.5px;color:#8B93A8;}

        .profile-scope .btn{
          display:inline-flex;align-items:center;gap:7px;border-radius:var(--radius);padding:9px 16px;
          font-size:13px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:.15s;
        }
        .profile-scope .btn-brass{background:var(--brass);color:#fff;}
        .profile-scope .btn-brass:hover{background:#755A1E;}
        .profile-scope .btn-outline{background:var(--white);border-color:var(--line);color:var(--ink-2);}
        .profile-scope .btn-outline:hover{border-color:var(--brass);color:var(--brass);}
        .profile-scope .btn-ghost{background:transparent;color:var(--red);border-color:transparent;font-size:12.5px;padding:6px 8px;}
        .profile-scope .btn-ghost:hover{text-decoration:underline;}
        .profile-scope .btn-sm{padding:6px 12px;font-size:12px;}

        .profile-scope .entry{border:1px solid var(--line);border-radius:var(--radius);padding:16px;margin-bottom:14px;position:relative;background:var(--paper);}
        .profile-scope .entry-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;}
        .profile-scope .entry-badge{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--brass);background:var(--brass-bg);padding:2px 8px;border-radius:10px;letter-spacing:.05em;}
        .profile-scope .entries-empty{border:1px dashed var(--line);border-radius:var(--radius);padding:22px;text-align:center;color:#8B93A8;font-size:13px;margin-bottom:14px;}

        .profile-scope .tag-input-wrap{border:1px solid var(--line);border-radius:var(--radius);padding:8px;display:flex;flex-wrap:wrap;gap:7px;align-items:center;}
        .profile-scope .tag-input-wrap input{border:none;padding:5px;flex:1;min-width:140px;background:transparent;}
        .profile-scope .tag-input-wrap input:focus{box-shadow:none;}
        .profile-scope .tag-chip{display:flex;align-items:center;gap:7px;background:var(--brass-bg);color:var(--brass);border-radius:20px;padding:5px 6px 5px 12px;font-size:12.5px;font-weight:600;}
        .profile-scope .tag-chip button{background:none;border:none;color:var(--brass);cursor:pointer;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;padding:0;}
        .profile-scope .tag-chip button:hover{background:rgba(140,106,36,.18);}

        .profile-scope .lang-row{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;margin-bottom:10px;}

        .profile-scope .seal-card{
          display:flex;align-items:center;gap:20px;background:var(--ink);color:var(--paper);
          border-radius:6px;padding:22px 26px;margin-bottom:24px;position:relative;overflow:hidden;
        }
        .profile-scope .seal-card:before{
          content:"";position:absolute;inset:0;
          background-image:repeating-linear-gradient(135deg, rgba(255,255,255,.025) 0 2px, transparent 2px 14px);
          pointer-events:none;
        }
        .profile-scope .seal-ring{
          width:82px;height:82px;border-radius:50%;border:2px solid var(--brass-light);flex:none;
          display:flex;align-items:center;justify-content:center;position:relative;
        }
        .profile-scope .seal-ring:before{content:"";position:absolute;inset:6px;border:1px dashed rgba(201,162,39,.5);border-radius:50%;}
        .profile-scope .seal-pct{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:var(--brass-light);}
        .profile-scope .seal-text h2{color:var(--paper);font-size:17px;}
        .profile-scope .seal-text p{color:#B7C0D6;font-size:12.5px;margin-top:4px;max-width:420px;}
        .profile-scope .seal-doc-id{margin-left:auto;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8794AE;position:relative;}
        .profile-scope .seal-doc-id span{display:block;color:var(--brass-light);font-size:12.5px;margin-top:2px;}

        .profile-scope .perforation{height:0;border-top:2px dotted var(--paper-3);margin:0 0 24px;position:relative;}
        .profile-scope .perforation:before,.profile-scope .perforation:after{
          content:"";position:absolute;top:-9px;width:18px;height:18px;border-radius:50%;background:var(--paper);
        }
        .profile-scope .perforation:before{left:-44px;}
        .profile-scope .perforation:after{right:-44px;}

        .profile-scope .section-title-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
        .profile-scope .section-title-row h2{font-size:19px;}

        .profile-scope .save-bar{
          position:sticky;bottom:0;background:linear-gradient(0deg, var(--paper) 60%, rgba(250,248,243,0));
          padding:22px 0 4px;display:flex;gap:10px;align-items:center;z-index:20;
        }
        .profile-scope .save-note{font-size:11.5px;color:#8B93A8;}

        .profile-scope .checklist{display:flex;flex-direction:column;gap:2px;}
        .profile-scope .check-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;}
        .profile-scope .check-box{width:16px;height:16px;border-radius:3px;border:1.5px solid var(--line);flex:none;margin-top:1px;cursor:pointer;position:relative;}
        .profile-scope .check-box input{position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;margin:0;}
        .profile-scope .check-box.on{background:var(--brass);border-color:var(--brass);}
        .profile-scope .check-box.on:after{content:"";position:absolute;left:4px;top:1px;width:4px;height:8px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg);}
        .profile-scope .check-label{font-size:13px;color:var(--ink-2);}

        @media (max-width:860px){
          .profile-scope .app{flex-direction:column;}
          .profile-scope .sidebar{display:none;}
          .pm-bar{display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--paper-2);border-bottom:1px solid var(--line);}
          .pm-hbtn{background:none;border:1px solid var(--line);border-radius:8px;padding:7px;cursor:pointer;color:var(--ink);display:flex;align-items:center;justify-content:center;}
          .pm-title{font-family:'Fraunces',serif;font-weight:600;font-size:16px;color:var(--ink);}
          .pm-overlay{display:block;position:fixed;inset:0;background:rgba(22,35,58,.5);backdrop-filter:blur(4px);z-index:90;}
          .pm-drawer{position:fixed;top:0;left:0;bottom:0;width:min(300px,82vw);background:#fff;padding:20px;display:flex;flex-direction:column;gap:4px;box-shadow:8px 0 30px rgba(0,0,0,.15);z-index:91;}
          .pm-close{align-self:flex-end;background:none;border:none;cursor:pointer;color:#6B7280;padding:6px;margin-bottom:8px;}
          .pm-item{padding:13px 14px;border-radius:8px;font-size:15px;font-weight:500;color:#2C3E63;display:block;border:none;background:none;text-align:left;cursor:pointer;width:100%;font-family:'Inter',sans-serif;}
          .pm-item:hover{background:#EDF1EE;color:#14213D;}
          .pm-item.active{background:#F4EAC9;color:#8C6A24;font-weight:600;}
          .pm-logout{margin-top:auto;color:#B5615F;}
          .profile-scope .main{padding:24px 18px 80px;}
          .profile-scope .field-grid,.profile-scope .field-grid.cols-3{grid-template-columns:1fr;}
          .profile-scope .seal-doc-id{display:none;}
          .profile-scope .lang-row{grid-template-columns:1fr;}
        }
        `
      }} />}
      
      <Navbar active={isProfileMode ? 'profile' : 'vacansiy'} onLoginClick={() => setAuthModalOpen(true)} onProfileClick={() => {
        if (!isLoggedIn) { setAuthModalOpen(true); return; }
        setView('profile');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }} />

      {!isProfileMode ? (
        <div>
          
          <div className="main">
            {view === 'jobs' && (
              <section className="view active">
                <div className="pagehead"><h1>Vakansiyalar</h1><p>O'zingizga mos ish toping va bir marta bosish orqali ariza yuboring.</p></div>
                <div className="filter-bar">
                  <input type="text" placeholder="Qidiruv (masalan: Frontend, Marketing...)" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                  <select value={locFilter} onChange={e => setLocFilter(e.target.value)}>
                    <option value="">Barcha shaharlar</option>
                    <option value="Toshkent">Toshkent</option>
                    <option value="Samarqand">Samarqand</option>
                    <option value="Farg'ona">Farg'ona</option>
                  </select>
                </div>

                <div className="jobs-grid">
                  {filteredJobs.length === 0 ? <p style={{ color: 'var(--muted)' }}>Hech narsa topilmadi.</p> : filteredJobs.map(v => (
                    <div key={v.id} className="job-card" onClick={() => { setCurrentJobId(v.id); setView('job-detail'); }}>
                      <div className="top"><h3>{v.title}</h3>{statusBadge(v.status)}</div>
                      <div className="co">{v.dept}</div>
                      <div className="loc">{v.loc} • {v.type}</div>
                      <div className="salary">{v.salary}</div>
                      {aiPillsForVacancy(v)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {view === 'job-detail' && activeJob && (
              <section className="view active">
                <div className="back-link" onClick={() => setView('jobs')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
                  Vakansiyalarga qaytish
                </div>
                
                <div className="detail-card">
                  <h2>{activeJob.title}</h2>
                  <div className="co">{activeJob.dept} • {activeJob.loc} • {activeJob.type}</div>
                  <div className="salary">{activeJob.salary}</div>
                  
                  <div style={{ marginTop: 24, marginBottom: 12, fontWeight: 600 }}>Baholash bosqichlari:</div>
                  <div className="ai-pill-row" style={{ marginBottom: 24 }}>
                    <span className="ai-pill">{AI_META.cvCheck.icon}CV tahlili</span>
                    {activeJob.aiConfig.test.enabled && <span className="ai-pill">{AI_META.test.icon}Test</span>}
                    {activeJob.aiConfig.openQ.enabled && <span className="ai-pill">{AI_META.openQ.icon}Ochiq savollar</span>}
                    {activeJob.aiConfig.sales.enabled && <span className="ai-pill">{AI_META.sales.icon}AI Simulyatsiya</span>}
                    {activeJob.aiConfig.video.enabled && <span className="ai-pill">{AI_META.video.icon}Video</span>}
                  </div>

                  {(() => {
                    const applied = myApplications.some(a => a.vacancyId === activeJob.id);
                    return (
                      <button
                        className="btn btn-primary"
                        onClick={() => { if (applied) { setView('applications'); } else { startApply(activeJob.id); } }}
                        disabled={activeJob.status === 'closed'}
                      >
                        {activeJob.status === 'closed'
                          ? "Qabul yopilgan"
                          : applied ? "✓ Ariza topshirilgan — holatini ko'rish" : "Ariza topshirish"}
                      </button>
                    );
                  })()}

                  <div className="detail-desc">{activeJob.desc}</div>
                </div>
              </section>
            )}

            {view === 'apply' && draft && activeJob && (
              <section className="view active">
                <div className="back-link" onClick={() => {
                  if (confirm("Haqiqatan ham chiqib ketmoqchimisiz? Yozilgan ma'lumotlar saqlanmaydi.")) {
                    setDraft(null);
                    setView('job-detail');
                  }
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
                  Bekor qilish
                </div>
                
                <div className="progress-bar">
                  {stepDefs.map((st, i) => (
                    <div key={st.key} className={`step-dot ${i < stepIdx ? 'done' : (i === stepIdx ? 'active' : '')}`}>
                      {i < stepIdx ? '✓' : (i + 1)}
                      <div className="step-label">{st.label}</div>
                    </div>
                  ))}
                </div>

                <div className="apply-card">
                  {stepDefs[stepIdx].key === 'info' && (
                    <div>
                      <h2>Shaxsiy ma'lumotlar va CV</h2>
                      <p className="sub">Tizim CV'ingizni avtomatik o'qib, mosligini tekshiradi.</p>
                      
                      <div style={{ marginTop: 24, marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                          Rezyume yuklash (PDF, DOCX)
                        </label>
                        
                        <label htmlFor="cv-upload" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed var(--line-strong)',
                          borderRadius: '12px',
                          padding: '35px 20px',
                          cursor: 'pointer',
                          background: '#FAFAFA',
                          transition: '0.2s',
                          textAlign: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--line-strong)'}
                        >
                          <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div>
                          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                            {draft.cvFileName ? draft.cvFileName : "+ Fayl tanlash uchun bosing"}
                          </div>
                          {!draft.cvFileName && (
                            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
                              Maksimal hajm: 5MB. PDF, DOC yoki DOCX
                            </div>
                          )}
                          
                          <input 
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
                      </div>

                      {draft.isCvLoading && (
                        <div className="loader-box">
                          <div className="spinner"></div>
                          <p>CV tahlil qilinmoqda...</p>
                        </div>
                      )}

                      {draft.cvErrMsg && (
                        <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: '12px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 500, marginTop: 8 }}>
                          {draft.cvErrMsg}
                        </div>
                      )}

                      <div className="step-actions">
                        <div className="right"><button className="btn btn-primary" onClick={submitInfo} disabled={draft.isCvLoading}>Keyingisi</button></div>
                      </div>
                    </div>
                  )}

                  {stepDefs[stepIdx].key === 'test' && (
                    <div>
                      <h2>Test topshirig'i</h2>
                      <p className="sub">Quyidagi savollarga javob bering.</p>
                      {activeJob?.aiConfig.test.questions.map((q: any, qi: number) => (
                        <div key={qi} className="q-block">
                          <div className="qt">{qi + 1}. {q.text}</div>
                          {q.options.map((op: string, oi: number) => (
                            <label key={oi} className="opt-radio">
                              <input type="radio" name={`tq-\${qi}`} checked={draft.testAnswers[qi] === oi} onChange={() => setDraft({ ...draft, testAnswers: { ...draft.testAnswers, [qi]: oi } })} />
                              {op}
                            </label>
                          ))}
                        </div>
                      ))}
                      <div className={`err-note ${draft.testError ? 'show' : ''}`}>Iltimos, barcha savollarga javob bering.</div>
                      <div className="step-actions">
                        <button className="btn btn-ghost" onClick={prevStep}>Ortga</button>
                        <div className="right"><button className="btn btn-primary" onClick={submitTest}>Keyingisi</button></div>
                      </div>
                    </div>
                  )}

                  {stepDefs[stepIdx].key === 'open' && (
                    <div>
                      <h2>Ochiq savollar</h2>
                      <p className="sub">Iltimos, har bir savolga batafsil javob yozing.</p>
                      {activeJob?.aiConfig.openQ.questions.map((q: string, qi: number) => (
                        <div key={qi} className="field" style={{ marginBottom: 20 }}>
                          <label>{qi + 1}. {q}</label>
                          <textarea rows={4} value={draft.openAnswers[qi] || ''} onChange={e => setDraft({ ...draft, openAnswers: { ...draft.openAnswers, [qi]: e.target.value } })} onPaste={e => e.preventDefault()} onCopy={e => e.preventDefault()} onCut={e => e.preventDefault()} placeholder="Javobingizni o'z so'zlaringiz bilan yozing (nusxalash taqiqlangan)..." />
                        </div>
                      ))}
                      <div className={`err-note ${draft.openError ? 'show' : ''}`}>Barcha savollarga javob yozing.</div>
                      <div className="step-actions">
                        <button className="btn btn-ghost" onClick={prevStep}>Ortga</button>
                        <div className="right"><button className="btn btn-primary" onClick={submitOpen}>Keyingisi</button></div>
                      </div>
                    </div>
                  )}

                  {stepDefs[stepIdx].key === 'sales' && (
                    <div>
                      <h2>Sotuv simulyatsiyasi</h2>
                      <p className="sub">Mijoz e'tiroziga qanday javob berishingizni ko'ramiz. Bu jonli chat, javobingizni yozib yuboring.</p>
                      
                      <div className="chat-box">
                        <div className="chat-log" ref={chatRef}>
                          {draft.salesLog.map((m: any, mi: number) => (
                            <div key={mi} className={`msg ${m.from}`}>{m.text}</div>
                          ))}
                          {chatSending && <div className="msg ai" style={{ opacity: 0.7 }}>...</div>}
                        </div>
                        {draft.salesScore === null ? (
                          <div className="chat-input">
                            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Javobingizni yozing..." disabled={chatSending} />
                            <button className="btn btn-primary btn-sm" onClick={sendChat} disabled={chatSending || !chatInput.trim()}>Yuborish</button>
                          </div>
                        ) : (
                          <div style={{ padding: '14px 20px', background: 'var(--success-bg)', borderTop: '1px solid var(--success)' }}>
                            <p className="comment"><b>Baho: {draft.salesScore}%.</b> {draft.salesFeedback}</p>
                          </div>
                        )}
                      </div>

                      {draft.salesScore === null && (
                        <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={finalizeSales} disabled={chatSending || draft.salesLog.filter((m: any) => m.from === 'me').length < 2}>
                          Suhbatni yakunlash va baho olish
                        </button>
                      )}

                      <div className="step-actions">
                        <button className="btn btn-ghost" onClick={prevStep}>Ortga</button>
                        <div className="right"><button className="btn btn-primary" onClick={nextStep} disabled={draft.salesScore === null}>Keyingisi</button></div>
                      </div>
                    </div>
                  )}

                  {stepDefs[stepIdx].key === 'video' && (
                    <div>
                      <h2>Video-taqdimot</h2>
                      <p className="sub">{activeJob?.aiConfig.video.prompt || "O'zingiz haqingizda qisqa video yozing."}</p>
                      <div className="field"><label>Video havolasi (YouTube, Telegram va h.k.)</label><input type="text" value={draft.videoLink} onChange={e => setDraft({ ...draft, videoLink: e.target.value })} placeholder="https://..." /></div>
                      <div className={`err-note ${draft.videoError ? 'show' : ''}`}>Iltimos, video havolasini kiriting.</div>
                      <div className="step-actions">
                        <button className="btn btn-ghost" onClick={prevStep}>Ortga</button>
                        <div className="right"><button className="btn btn-primary" onClick={submitVideo}>Keyingisi</button></div>
                      </div>
                    </div>
                  )}

                  {stepDefs[stepIdx].key === 'review' && (
                    <div>
                      <h2>Arizangizni tekshiring</h2>
                      <p className="sub">Yuborishdan oldin ma'lumotlarni tasdiqlang.</p>
                      <div className="review-row"><span className="k">CV manbasi</span><span className="v">{draft.cvSource === 'file' ? draft.cvFileName : 'Profil ma\'lumotlari'}</span></div>
                      {activeJob?.aiConfig.cvCheck.enabled && <div className="review-row"><span className="k">CV moslik bali</span><span className="v">{draft.cvScore}%</span></div>}
                      {activeJob?.aiConfig.test.enabled && <div className="review-row"><span className="k">Test natijasi</span><span className="v">{draft.testScore}%</span></div>}
                      {activeJob?.aiConfig.openQ.enabled && <div className="review-row"><span className="k">Ochiq savollar</span><span className="v">{Object.keys(draft.openAnswers).length} ta javob yozildi</span></div>}
                      {activeJob?.aiConfig.sales.enabled && <div className="review-row"><span className="k">Sotuv simulyatsiyasi</span><span className="v">{draft.salesScore}%</span></div>}
                      {activeJob?.aiConfig.video.enabled && <div className="review-row"><span className="k">Video havola</span><span className="v">{draft.videoLink}</span></div>}
                      
                      <div className="step-actions">
                        <button className="btn btn-ghost" onClick={prevStep}>Ortga</button>
                        <div className="right"><button className="btn btn-primary" onClick={finalSubmit}>Arizani yuborish</button></div>
                      </div>
                    </div>
                  )}

                </div>
              </section>
            )}

          </div>
        </div>
      ) : (
        <div className="profile-scope">
          {/* Mobile profile hamburger menu */}
          <div className="pm-bar">
            <button className="pm-hbtn" onClick={() => setProfileMenuOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
            <span className="pm-title">{view === 'profile' ? 'Profil' : view === 'resume' ? 'CV' : view === 'practice' ? 'Mashq' : view === 'applications' ? 'Arizalarim' : 'Profil'}</span>
          </div>
          {profileMenuOpen && (
            <div className="pm-overlay" onClick={() => setProfileMenuOpen(false)}>
              <div className="pm-drawer" onClick={e => e.stopPropagation()}>
                <button className="pm-close" onClick={() => setProfileMenuOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
                <button className={`pm-item ${view === 'profile' ? 'active' : ''}`} onClick={() => { setView('profile'); setProfileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Profil sozlamalari</button>
                <button className={`pm-item ${view === 'resume' ? 'active' : ''}`} onClick={() => { setView('resume'); setProfileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>CV (Rezyume)</button>
                <button className={`pm-item ${view === 'practice' ? 'active' : ''}`} onClick={() => { setView('practice'); loadPractice(); setProfileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Mashq</button>
                <button className={`pm-item ${view === 'applications' ? 'active' : ''}`} onClick={() => { loadApplications(); setView('applications'); setProfileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Mening arizalarim</button>
                <button className="pm-item pm-logout" onClick={logout}>Chiqish</button>
              </div>
            </div>
          )}

          <div className="app">
            <aside className="sidebar">
              <div className="mini-card">
                <div className="mini-photo-wrap">
                  {profilePhoto ? (
                    <img className="mini-photo" src={profilePhoto} alt="Profil" />
                  ) : (
                    <div className="mini-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontWeight: 600, color: '#C7CEDD' }}>—</div>
                  )}
                  <div>
                    <div className="mini-name">{candidateName}</div>
                    <div className="mini-role">{candidateRole}</div>
                  </div>
                </div>
                <div className="mini-progress-row">
                  <div className="mini-progress-label"><span>Rezyume to'liqligi</span><span>{resumePct}%</span></div>
                  <div className="mini-progress-track"><div className="mini-progress-fill" style={{ width: `${resumePct}%` }}></div></div>
                </div>
              </div>

              <nav className="tabs">
                <button className={`tab-btn ${view === 'profile' ? 'active' : ''}`} onClick={() => { setView('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" /></svg>
                  Profil sozlamalari
                </button>
                <button className={`tab-btn ${view === 'resume' ? 'active' : ''}`} onClick={() => { setView('resume'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /><path d="M8 13h8M8 17h5" /></svg>
                  CV (Rezyume)
                </button>
                <button className={`tab-btn ${view === 'practice' ? 'active' : ''}`} onClick={() => { setView('practice'); loadPractice(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  Mashq
                </button>
                <button className={`tab-btn ${(view === 'applications' || view === 'app-detail') ? 'active' : ''}`} onClick={() => { loadApplications(); setView('applications'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  Mening arizalarim
                </button>
                <button className="tab-btn" onClick={logout} style={{ marginTop: 24, color: '#B5615F' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Chiqish
                </button>
              </nav>

              <div className="sidebar-foot">
                <div className="status-pill-mini"><span className="dot"></span> Faol qidiruvda</div>
              </div>
            </aside>

            <main className="main">
              {view === 'applications' && (
                <section className="view active">
                  <div className="page-head">
                    <div className="eyebrow">Kabinet / Arizalar</div>
                    <h1>Mening arizalarim</h1>
                    <p>Yuborilgan arizalaringiz va ularning holati.</p>
                  </div>
                  <div>
                    {myApplications.length === 0 ? (
                      <div className="entries-empty">Hozircha arizalar yo&apos;q. Vakansiyalar bo&apos;limidan ish tanlab, ariza topshiring.</div>
                    ) : (
                      myApplications.map(a => (
                        <div key={a.id} className="doc-card" style={{ cursor: 'pointer', marginBottom: 14 }} onClick={() => { setActiveAppId(a.id); setView('app-detail'); }}>
                          <div className="doc-card-head"><h3>{a.vacancyTitle}</h3><span className="num">{a.submittedDate}</span></div>
                          <div className="doc-card-body" style={{ padding: '14px 22px' }}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {PIPELINE.map((p, i) => (
                                <span key={i} style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: i < a.stageIdx ? 'var(--green-bg)' : i === a.stageIdx ? 'var(--brass-bg)' : 'var(--paper-2)', color: i < a.stageIdx ? 'var(--green)' : i === a.stageIdx ? 'var(--brass)' : '#8B93A8' }}>{p}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}

              {view === 'app-detail' && activeApp && activeAppJob && (
                <section className="view active">
                  <div style={{ marginBottom: 20, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, color: 'var(--brass)', fontWeight: 500 }} onClick={() => setView('applications')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
                    Arizalarimga qaytish
                  </div>
                  <div className="doc-card">
                    <div className="doc-card-head"><h3>{activeAppJob.title}</h3><span className="num">{activeApp.submittedDate}</span></div>
                    <div className="doc-card-body">
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                        {PIPELINE.map((p, i) => (
                          <span key={i} style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: i < activeApp.stageIdx ? 'var(--green-bg)' : i === activeApp.stageIdx ? 'var(--brass-bg)' : 'var(--paper-2)', color: i < activeApp.stageIdx ? 'var(--green)' : i === activeApp.stageIdx ? 'var(--brass)' : '#8B93A8' }}>{p}</span>
                        ))}
                      </div>
                      {activeAppJob.aiConfig.cvCheck.enabled && <div style={{ marginBottom: 12 }}><b>CV moslik:</b> {activeApp.draft.cvScore}%</div>}
                      {activeAppJob.aiConfig.test.enabled && <div style={{ marginBottom: 12 }}><b>Test natijasi:</b> {activeApp.draft.testScore}%</div>}
                      {activeAppJob.aiConfig.sales.enabled && <div style={{ marginBottom: 12 }}><b>Sotuv simulyatsiyasi:</b> {activeApp.draft.salesScore}%</div>}
                    </div>
                  </div>
                </section>
              )}
              {view === 'profile' && (
                <section className="view active">
                  <div className="page-head">
                    <div className="eyebrow">Kabinet / Profil</div>
                    <h1>Profil sozlamalari</h1>
                    <p>AI sotuv simulyatsiya natijalari va shaxsiy ma&apos;lumotlaringiz.</p>
                  </div>

                  {/* ── AI Simulation Results ── */}
                  <ProfileResultsDashboard sessions={practiceSessions} />

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Profil rasmi</h3></div>
                    <div className="doc-card-body">
                      <div className="photo-uploader">
                        <div className="photo-frame-round">
                          {profilePhoto ? (
                            <img src={profilePhoto} alt="Profil" />
                          ) : (
                            <svg className="photo-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" /></svg>
                          )}
                        </div>
                        <div className="photo-actions">
                          <label className="btn btn-outline btn-sm">
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePhoto} />
                            Rasm yuklash
                          </label>
                          <button className="btn btn-ghost btn-sm" onClick={() => setProfilePhoto(null)} style={{ alignSelf: 'flex-start' }}>O'chirish</button>
                          <div className="hint">JPG yoki PNG, 3 MB gacha. Aniq ko'rinadigan portret tavsiya etiladi.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Shaxsiy ma'lumotlar</h3></div>
                    <div className="doc-card-body">
                      <div className="field-grid">
                        <div className="field"><label>Ism</label><input type="text" placeholder="Masalan: Dilnoza" value={pIsm} onChange={e => setPIsm(e.target.value)} /></div>
                        <div className="field"><label>Familiya</label><input type="text" placeholder="Masalan: Yusupova" value={pFam} onChange={e => setPFam(e.target.value)} /></div>
                        <div className="field"><label>Otasining ismi</label><input type="text" placeholder="Ixtiyoriy" value={rPatronymic} onChange={e => setRPatronymic(e.target.value)} /></div>
                        <div className="field"><label>Tug'ilgan sana</label><input type="date" value={rBirthDate} onChange={e => setRBirthDate(e.target.value)} /></div>
                        <div className="field">
                          <label>Jinsi</label>
                          <select><option value="">Tanlang</option><option>Ayol</option><option>Erkak</option></select>
                        </div>
                        <div className="field"><label>Yashash manzili (shahar)</label><input type="text" placeholder="Toshkent" value={rCity} onChange={e => setRCity(e.target.value)} /></div>
                        <div className="field"><label>Telefon raqami</label><input type="tel" placeholder="+998 90 123 45 67" value={rPhone} onChange={e => setRPhone(e.target.value)} /></div>
                        <div className="field"><label>Elektron pochta</label><input type="email" placeholder="ism@pochta.uz" value={userObj?.email || ""} readOnly /></div>
                      </div>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Ish qidirish holati</h3></div>
                    <div className="doc-card-body">
                      <div className="status-options">
                        <label className="status-opt sel-green checked"><input type="radio" name="jobstatus" defaultChecked />Faol ish qidiryapman</label>
                        <label className="status-opt sel-brass"><input type="radio" name="jobstatus" />Takliflarni ko'rib chiqyapman</label>
                        <label className="status-opt sel-neutral"><input type="radio" name="jobstatus" />Suhbatga taklif kutyapman</label>
                        <label className="status-opt sel-red"><input type="radio" name="jobstatus" />Ish taklif qilingan</label>
                        <label className="status-opt sel-neutral"><input type="radio" name="jobstatus" />Hozircha qidirmayapman</label>
                      </div>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Kirish va xavfsizlik</h3></div>
                    <div className="doc-card-body">
                      <div className="field-grid">
                        <div className="field"><label>Joriy parol</label><input type="password" placeholder="••••••••" /></div>
                        <div className="field"></div>
                        <div className="field"><label>Yangi parol</label><input type="password" placeholder="Kamida 8 belgi" /></div>
                        <div className="field"><label>Yangi parolni takrorlang</label><input type="password" placeholder="Qayta kiriting" /></div>
                      </div>
                    </div>
                  </div>

                  <div className="save-bar">
                    <button className="btn btn-brass" onClick={saveProfile}>Saqlash</button>
                    <button className="btn btn-outline" onClick={() => setView('jobs')}>Bekor qilish</button>
                    <span className="save-note">O'zgarishlar avtomatik saqlanmaydi — "Saqlash" tugmasini bosing.</span>
                  </div>
                </section>
              )}

              {view === 'resume' && (
                <section className="view active">
                  <div className="page-head">
                    <div className="eyebrow">Kabinet / Rezyume</div>
                    <h1>Rezyume (CV) yaratish</h1>
                    <p>Standart bo'limlarni to'ldiring — ish beruvchilar aynan shu tartibda ko'radi. Rasm va barcha ma'lumotlar bir joyda saqlanadi.</p>
                  </div>

                  <div className="seal-card">
                    <div className="seal-ring"><span className="seal-pct">{resumePct}%</span></div>
                    <div className="seal-text">
                      <h2>Rezyume to'ldirilganligi</h2>
                      <p>
                        {resumePct >= 90 ? 'Ajoyib! Rezyumeningiz deyarli to\'liq — endi uni nashr qilishingiz mumkin.' : 
                         resumePct >= 50 ? 'Yaxshi boshlanish. Yana bir necha bo\'limni to\'ldiring va ko\'rinuvchanligingiz oshadi.' : 
                         'Rasmingizni yuklang va asosiy bo\'limlarni to\'ldiring — to\'liq rezyumelar 4 barobar ko\'p ko\'riladi.'}
                      </p>
                    </div>
                    <div className="seal-doc-id">Hujjat №<span>UZ-092841</span></div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Rezyume sarlavhasi</h3><span className="num">01</span></div>
                    <div className="doc-card-body">
                      <div className="field full" style={{ marginBottom: 0 }}>
                        <label>Qidirilayotgan lavozim</label>
                        <input type="text" placeholder="Masalan: Frontend dasturchi" value={rTitle} onChange={e => setRTitle(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Rasm va shaxsiy ma'lumotlar</h3><span className="num">02</span></div>
                    <div className="doc-card-body">
                      <div className="photo-uploader" style={{ marginBottom: 20 }}>
                        <div className="photo-frame-doc">
                          <span className="corner c1"></span><span className="corner c2"></span><span className="corner c3"></span><span className="corner c4"></span>
                          {profilePhoto ? (
                            <img src={profilePhoto} alt="Rezyume rasmi" />
                          ) : (
                            <svg className="photo-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" /></svg>
                          )}
                        </div>
                        <div className="photo-actions">
                          <label className="btn btn-outline btn-sm">
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePhoto} />
                            Rasm yuklash
                          </label>
                          <button className="btn btn-ghost btn-sm" onClick={() => setProfilePhoto(null)} style={{ alignSelf: 'flex-start' }}>O'chirish</button>
                          <div className="hint">Hujjat uslubidagi (3x4) rasm tavsiya etiladi.</div>
                        </div>
                      </div>
                      <div className="field-grid">
                        <div className="field"><label>To'liq ism-familiya</label><input type="text" placeholder="Yusupova Dilnoza" value={rFio} onChange={e => setRFio(e.target.value)} /></div>
                        <div className="field"><label>Tug'ilgan sana</label><input type="date" value={rBirthDate} onChange={e => setRBirthDate(e.target.value)} /></div>
                        <div className="field"><label>Yashash manzili</label><input type="text" placeholder="Toshkent, Uzbekistan" value={rAddress} onChange={e => setRAddress(e.target.value)} /></div>
                        <div className="field"><label>Telefon</label><input type="tel" placeholder="+998 90 123 45 67" value={rPhone} onChange={e => { setRPhone(e.target.value); setContactOk(e.target.value.length > 5); }} /></div>
                        <div className="field"><label>Email</label><input type="email" placeholder="ism@pochta.uz" value={userObj?.email || ""} readOnly /></div>
                        <div className="field"><label>Fuqaroligi</label><input type="text" placeholder="O'zbekiston" value={rCitizenship} onChange={e => setRCitizenship(e.target.value)} /></div>
                      </div>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Maosh va bandlik</h3><span className="num">03</span></div>
                    <div className="doc-card-body">
                      <div className="field-grid cols-3">
                        <div className="field"><label>Kutilayotgan maosh</label><input type="number" placeholder="8 000 000" onChange={e => setSalaryOk(e.target.value.length > 3)} /></div>
                        <div className="field"><label>Valyuta</label><select><option>UZS</option><option>USD</option></select></div>
                        <div className="field">
                          <label>Bandlik turi</label>
                          <select><option value="">Tanlang</option><option>To'liq bandlik</option><option>Qisman bandlik</option><option>Loyiha asosida</option><option>Amaliyot</option><option>Frilanс</option></select>
                        </div>
                        <div className="field">
                          <label>Ish grafigi</label>
                          <select><option value="">Tanlang</option><option>Ofisda</option><option>Masofaviy</option><option>Gibrid</option><option>Siljiydigan grafik</option></select>
                        </div>
                        <div className="field"><label>Ko'chib o'tishga tayyorligi</label><select><option>Ko'chib o'tmayman</option><option>Tayyorman</option><option>Vaqtinchalik ko'chishga tayyorman</option></select></div>
                        <div className="field"><label>Ish safarlariga tayyorligi</label><select><option>Tayyor emasman</option><option>Tayyorman</option><option>Vaqti-vaqti bilan tayyorman</option></select></div>
                      </div>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Ish tajribasi</h3><span className="num">04</span></div>
                    <div className="doc-card-body">
                      {expList.map((exp, i) => (
                        <div key={exp.id} className="entry">
                          <div className="entry-head">
                            <span className="entry-badge">Tajriba {i + 1}</span>
                            <button className="btn btn-ghost btn-sm" onClick={() => setExpList(expList.filter(x => x.id !== exp.id))}>O'chirish</button>
                          </div>
                          <div className="field-grid">
                            <div className="field"><label>Kompaniya nomi</label><input type="text" placeholder="Masalan: Tez Tour LLC" value={exp.company || ""} onChange={e => updateList("expList", exp.id, "company", e.target.value)} /></div>
                            <div className="field"><label>Lavozim</label><input type="text" placeholder="Masalan: Marketing bo'yicha mutaxassis" value={exp.role || ""} onChange={e => updateList("expList", exp.id, "role", e.target.value)} /></div>
                            <div className="field"><label>Ish boshlangan sana</label><input type="date" value={exp.startDate || ""} onChange={e => updateList("expList", exp.id, "startDate", e.target.value)} /></div>
                            <div className="field"><label>Ish tugagan sana</label><input type="date" value={exp.endDate || ""} onChange={e => updateList("expList", exp.id, "endDate", e.target.value)} /><span className="hint">Hozirgacha ishlayotgan bo'lsangiz bo'sh qoldiring</span></div>
                            <div className="field full"><label>Faoliyat sohasi</label><input type="text" placeholder="Masalan: IT, Marketing, Moliya" value={exp.industry || ""} onChange={e => updateList("expList", exp.id, "industry", e.target.value)} /></div>
                            <div className="field full"><label>Vazifalar va yutuqlar tavsifi</label><textarea placeholder="Asosiy vazifalaringiz va erishgan natijalaringizni tavsiflang" value={exp.desc || ""} onChange={e => updateList("expList", exp.id, "desc", e.target.value)}></textarea></div>
                          </div>
                        </div>
                      ))}
                      <button className="btn btn-outline btn-sm" onClick={() => setExpList([...expList, { id: Date.now() }])}>+ Ish joyi qo'shish</button>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Ta'lim</h3><span className="num">05</span></div>
                    <div className="doc-card-body">
                      {eduList.map((edu, i) => (
                        <div key={edu.id} className="entry">
                          <div className="entry-head">
                            <span className="entry-badge">Ta'lim {i + 1}</span>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEduList(eduList.filter(x => x.id !== edu.id))}>O'chirish</button>
                          </div>
                          <div className="field-grid">
                            <div className="field full"><label>Ta'lim muassasasi</label><input type="text" placeholder="Masalan: Toshkent Axborot Texnologiyalari Universiteti" value={edu.inst || ""} onChange={e => updateList("eduList", edu.id, "inst", e.target.value)} /></div>
                            <div className="field">
                              <label>Daraja</label>
                              <select value={edu.degree || ""} onChange={e => updateList("eduList", edu.id, "degree", e.target.value)}><option value="">Tanlang</option><option>O'rta maxsus</option><option>Bakalavr</option><option>Magistr</option><option>PhD</option></select>
                            </div>
                            <div className="field"><label>Mutaxassislik</label><input type="text" placeholder="Masalan: Dasturiy injiniring" value={edu.spec || ""} onChange={e => updateList("eduList", edu.id, "spec", e.target.value)} /></div>
                            <div className="field"><label>Bitirgan yili</label><input type="number" placeholder="2024" value={edu.year || ""} onChange={e => updateList("eduList", edu.id, "year", e.target.value)} /></div>
                          </div>
                        </div>
                      ))}
                      <button className="btn btn-outline btn-sm" onClick={() => setEduList([...eduList, { id: Date.now() }])}>+ Ta'lim muassasasi qo'shish</button>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Kasbiy ko'nikmalar</h3><span className="num">06</span></div>
                    <div className="doc-card-body">
                      <div className="tag-input-wrap">
                        {skills.map((sk, i) => (
                          <span key={i} className="tag-chip">{sk} <button aria-label="O'chirish" onClick={() => setSkills(skills.filter(x => x !== sk))}>×</button></span>
                        ))}
                        <input type="text" placeholder="Ko'nikma yozib, Enter bosing (masalan: Excel)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKey} />
                      </div>
                    </div>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>O'zim haqimda</h3><span className="num">07</span></div>
                    <div className="doc-card-body">
                      <div className="field full" style={{ marginBottom: 0 }}>
                        <textarea value={rAbout} onChange={e => setRAbout(e.target.value)} placeholder="Kasbiy yutuqlaringiz, kuchli tomonlaringiz va maqsadlaringiz haqida qisqacha yozing..."></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="perforation"></div>

                  <div className="save-bar">
                    <button className="btn btn-brass" onClick={saveProfile}>Saqlash</button>
                    <button className="btn btn-outline" onClick={() => setView('jobs')}>Vakansiyalarga qaytish</button>
                    <span className="save-note">O&apos;zgarishlarni saqlash uchun &quot;Saqlash&quot; tugmasini bosing.</span>
                  </div>
                </section>
              )}

              {view === 'practice' && (
                <section className="view active">
                  <div className="page-head">
                    <div className="eyebrow">Kabinet / Sotuv mahorati</div>
                    <h1>Sotuv mahorati</h1>
                    <p>AI mijoz bilan istalgan tovar/xizmatni sotib mashq qiling. Har bir mashq standart sotuv skriptining 8 bosqichi (Tanishuv, Programmalashtirish, Yaqinlashuv, Ehtiyojni aniqlash, Taqdimot, E&apos;tirozlar, Yopish, Follow-up) bo&apos;yicha 100 ballik tizimda baholanadi.</p>
                  </div>

                  <div className="seal-card">
                    <div className="seal-ring"><span className="seal-pct">{practiceAvg != null ? practiceAvg + '%' : '—'}</span></div>
                    <div className="seal-text">
                      <h2>O&apos;rtacha mahorat</h2>
                      <p>
                        {practiceSessions.length === 0
                          ? 'Hali mashq qilmagansiz. Birinchi mashqni boshlang — AI mijoz bilan gaplashib, sotuv qobiliyatingizni sinab ko\'ring.'
                          : `${practiceSessions.length} ta mashq bajarilgan. Eng yaxshi natija: ${practiceBest}%. Muntazam mashq mahoratni oshiradi.`}
                      </p>
                    </div>
                    <div className="seal-doc-id">Mashqlar<span>{practiceSessions.length} ta</span></div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <button className="btn btn-brass" onClick={() => { window.location.href = '/chat'; }}>Yangi mashq boshlash →</button>
                  </div>

                  <div className="doc-card">
                    <div className="doc-card-head"><h3>Mashqlar tarixi</h3><span className="num">{practiceSessions.length}</span></div>
                    <div className="doc-card-body">
                      {practiceSessions.length === 0 ? (
                        <div className="entries-empty">Hozircha mashqlar yo&apos;q.</div>
                      ) : (
                        practiceSessions.map((p) => (
                          <details key={p.id} className="entry" style={{ marginBottom: 12 }}>
                            <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', listStyle: 'none' }}>
                              <span>
                                <b>{p.personaName || p.persona}</b>
                                <span style={{ color: '#8B93A8', fontSize: 12, marginLeft: 8 }}>{new Date(p.createdAt).toLocaleString('uz-UZ')}</span>
                              </span>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: p.score >= 80 ? 'var(--green-bg)' : p.score >= 60 ? 'var(--brass-bg)' : 'var(--red-bg)', color: p.score >= 80 ? 'var(--green)' : p.score >= 60 ? 'var(--brass)' : 'var(--red)' }}>{p.score}%</span>
                            </summary>
                            {p.feedback && (
                              <div style={{ marginTop: 12, fontSize: 13, whiteSpace: 'pre-wrap', color: 'var(--ink-2)', lineHeight: 1.6 }}>{p.feedback}</div>
                            )}
                          </details>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      )}

      {/* AUTH REQUIRED MODAL */}
      {authModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,33,61,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 200 }} onClick={(e) => { if (e.target === e.currentTarget) setAuthModalOpen(false); }}>
          <div style={{ background: 'var(--card)', borderRadius: 18, maxWidth: 440, width: '100%', padding: '36px 34px 30px', position: 'relative', textAlign: 'center' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 6 }} onClick={() => setAuthModalOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 10px' }}>Ro&apos;yxatdan o&apos;tish kerak</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 28px', lineHeight: 1.6 }}>
              Vakansiyaga ariza topshirish yoki sotuv mashqiga kirish uchun avval ro&apos;yxatdan o&apos;ting. Bu jarayon atigi 30 soniya davom etadi!
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => { setAuthModalOpen(false); const curUrl = encodeURIComponent(window.location.search); window.location.href = '/?register=1&redirect=' + curUrl; }}>Ro&apos;yxatdan o&apos;tish</button>
              <button className="btn btn-ghost" onClick={() => setAuthModalOpen(false)}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}

      {/* Global toast — inline-styled so it shows in both the job-board and profile scopes */}
      <div style={{
        position: 'fixed', bottom: 26, left: '50%',
        transform: `translateX(-50%) translateY(${toastMsg ? '0' : '20px'})`,
        background: '#14213D', color: '#EFEDE4', padding: '12px 20px', borderRadius: 8,
        fontSize: 13.5, zIndex: 200, pointerEvents: 'none',
        opacity: toastMsg ? 1 : 0, transition: 'opacity .2s ease, transform .2s ease',
      }}>{toastMsg}</div>
    </>
  );
}
