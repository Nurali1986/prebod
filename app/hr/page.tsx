'use client';

import React, { useState } from 'react';

const STAGES = [
  { key: 'new', label: "Yangi ariza" },
  { key: 'review', label: "Ko'rib chiqilmoqda" },
  { key: 'interview', label: "Suhbat" },
  { key: 'offer', label: "Taklif yuborildi" },
  { key: 'hired', label: "Ishga qabul qilindi" },
];

const AI_META = {
  cvCheck: { label: "CV moslik tahlili", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg> },
  test: { label: "Test", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  openQ: { label: "Ochiq savollar", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 18h.01M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2 4"/><circle cx="12" cy="12" r="10"/></svg> },
  sales: { label: "Sotuv simulyatsiyasi", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
  video: { label: "Video-taqdimot", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
};

function initials(name: string) { return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(); }

const initialDepartments = [
  {id:1, name:"IT va mahsulot", tests:[
    {id: 1, text:"React'da komponent holatini boshqarish uchun qaysi hook ishlatiladi?", options:["useEffect","useState","useMemo","useRef"], correct:1},
    {id: 2, text:"Virtual DOM nima uchun kerak?", options:["Server bilan aloqa qilish uchun","Interfeys yangilanishini tezlashtirish uchun","CSS stilini yozish uchun","Ma'lumotlar bazasiga ulanish uchun"], correct:1},
  ], openQs: [{id: 1, text: "Oxirgi loyihangizda duch kelgan eng qiyin texnik muammoni tasvirlab bering."}, {id: 2, text: "Nima uchun aynan shu lavozimga hujjat topshirmoqdasiz?"}]},
  {id:2, name:"Marketing", tests:[
    {id: 3, text:"SMM strategiyasining asosiy maqsadi nima?", options:["Faqat like yig'ish","Auditoriya bilan aloqa va brend tanilishini oshirish","Faqat reklama byudjetini sarflash","Raqobatchilarni nazorat qilish"], correct:1},
  ], openQs: [{id: 3, text: "Marketing byudjetini qanday taqsimlaysiz?"}]},
  {id:3, name:"Sotuv", tests:[], openQs: []},
  {id:4, name:"Moliya", tests:[
    {id: 4, text:"Debet va kredit tushunchalari qaysi sohaga tegishli?", options:["Marketing","Buxgalteriya","Dizayn","Logistika"], correct:1},
  ], openQs: []},
  {id:5, name:"HR", tests:[], openQs: []},
  {id:6, name:"Qurilish", tests:[], openQs: []},
  {id:7, name:"Boshqaruv", tests:[], openQs: []},
];

const CHARACTERS = [
  { id: 'ishonmaydigan', name: 'Rustam (Ishonchsiz)', description: 'Hech kimga ishonmaydi' },
  { id: 'band', name: 'Sardor (Band Rahbar)', description: 'Vaqti yo\'q, shoshyapti' },
  { id: 'buhgalter', name: 'Madina (Buhgalter)', description: 'Faqat raqamlarga qaraydi' },
  { id: 'bazorchi', name: 'Aziza (Narx Talashuvchi)', description: 'Doim chegirma so\'raydi' },
  { id: 'bilagon', name: 'Jasur (Ekspert)', description: 'Hammasini "biladi"' },
  { id: 'ikkilanuvchi', name: 'Nigora (Ikkilanuvchi)', description: 'Qaror berolmaydi' },
  { id: 'achchiq', name: 'Tohir (Asabiy)', description: 'Oldin yomon tajriba bo\'lgan' },
  { id: 'muloyim_sust', name: 'Zarina (Muloyim)', description: 'Hammaga "ha" deydi' },
  { id: 'raqobatchi', name: 'Sanjar (Sodiq Mijoz)', description: 'Boshqa firma bilan ishlaydi' },
  { id: 'yangi', name: 'Sevara (Yangi Mijoz)', description: 'Sohani umuman bilmaydi' },
];

const initialVacancies: any[] = [];


export default function HRPanel() {
  const [view, setView] = useState('dashboard');
  const [vacancies, setVacancies] = useState<any[]>(initialVacancies);
  const [departments, setDepartments] = useState<any[]>(initialDepartments);
  const [activeVacancyId, setActiveVacancyId] = useState<number | null>(null);
  const [userObj, setUserObj] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  React.useEffect(() => {
    const userStr = localStorage.getItem('ishla_user');
    if (!userStr) {
      window.location.href = '/?login=1';
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'employer') {
      window.location.href = '/';
      return;
    }
    setUserObj(user);
    setIsAuthChecking(false);
  }, []);

  React.useEffect(() => {
    fetch('/api/vacancies?mine=1')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((v: any) => ({
            ...v,
            dept: v.department?.name || v.dept,
            aiConfig: {
              cvCheck: { enabled: v.cvCheckEnabled, minScore: v.cvMinScore },
              test: { enabled: v.testEnabled, questions: v.vacancyTests || [] },
              openQ: { enabled: v.openQEnabled, questions: (v.vacancyOpenQs || []).map((q: any) => q.text) },
              sales: { enabled: v.salesEnabled, product: v.salesProduct, personas: v.salesPersonas || [] },
              video: { enabled: v.videoEnabled, prompt: v.videoPrompt },
            },
            candidates: v.candidates || []
          }));
          setVacancies(formatted);
        }
      });
      
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setDepartments(data);
      });
  }, []);
  const [toastMsg, setToastMsg] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  
  const [isCProfileOpen, setIsCProfileOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<any>(null);

  // Modal form state
  const [fTitle, setFTitle] = useState('');
  const [fDept, setFDept] = useState('IT va mahsulot');
  const [fType, setFType] = useState("To'liq stavka");
  const [fLoc, setFLoc] = useState('Toshkent');
  const [fSalary, setFSalary] = useState('');
  const [fDesc, setFDesc] = useState('');
  
  const [reqCv, setReqCv] = useState(false);
  const [cvMin, setCvMin] = useState(70);
  const [reqTest, setReqTest] = useState(false);
  const [testQs, setTestQs] = useState<any[]>([]);
  const [reqOpen, setReqOpen] = useState(false);
  const [openQs, setOpenQs] = useState<string[]>([]);
  const [reqSales, setReqSales] = useState(false);
  const [salesProd, setSalesProd] = useState('');
  const [salesPersonas, setSalesPersonas] = useState<string[]>([]);
  const [reqVideo, setReqVideo] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  
  const [baseModalOpen, setBaseModalOpen] = useState(false);
  const [baseModalType, setBaseModalType] = useState<'tests' | 'openQs' | null>(null);

  const openBaseModal = (type: 'tests' | 'openQs') => {
    setBaseModalType(type);
    setBaseModalOpen(true);
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

  const deleteVacancy = async (id: number) => {
    if (!confirm("Ushbu vakansiyani o'chirmoqchimisiz? Barcha arizalar ham o'chadi.")) return;
    try {
      const res = await fetch(`/api/vacancies?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVacancies(vacancies.filter(v => v.id !== id));
        setView('vacancies');
        showToast("Vakansiya o'chirildi");
      } else {
        showToast("O'chirishda xatolik");
      }
    } catch { showToast("Xatolik yuz berdi"); }
  };

  const allCandidates = () => {
    let out: any[] = [];
    vacancies.forEach(v => v.candidates.forEach((c: any) => out.push({ ...c, vac: v.title, vacId: v.id })));
    return out;
  };

  const statusBadge = (status: string) => {
    const map: any = { active: ['active', "Faol"], draft: ['draft', "Qoralama"], closed: ['closed', "Yopilgan"] };
    const [cls, label] = map[status];
    return <span className={`badge ${cls}`}><span className="badge-dot"></span>{label}</span>;
  };

  const scoreClass = (n: number) => {
    if (n === null || n === undefined) return 'mid';
    if (n >= 80) return 'high';
    if (n >= 60) return 'mid';
    return 'low';
  };

  const publishVacancy = async () => {
    if (!fTitle.trim()) {
      setModalStep(1);
      return;
    }
    const newV = {
      title: fTitle,
      dept: fDept,
      type: fType,
      loc: fLoc || "Toshkent",
      salary: fSalary || "Kelishilgan holda",
      desc: fDesc,
      status: 'active',
      posted: "Bugun",
      departmentId: departments.find(d => d.name === fDept)?.id || 1,
      cvMinScore: cvMin,
      cvCheckEnabled: reqCv,
      testEnabled: reqTest,
      openQEnabled: reqOpen,
      salesEnabled: fDept === 'Sotuv' ? reqSales : false,
      salesProduct: salesProd,
      salesPersonas: salesPersonas,
      videoEnabled: reqVideo,
      videoPrompt: videoPrompt,
      tests: testQs.map(({ id, ...rest }) => rest),
      openQs: openQs.map(q => ({ text: q }))
    };
    
    try {
      const res = await fetch('/api/vacancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newV)
      });
      if (res.ok) {
        const savedVacancy = await res.json();
        // The API returns the saved vacancy. Since candidates array might be missing in POST response, add it
        savedVacancy.candidates = [];
        // Optional: rename department property if needed based on API response to match UI mapping
        savedVacancy.dept = savedVacancy.department?.name || fDept;
        
        // Also restructure aiConfig so it matches the expected local state structure for rendering
        savedVacancy.aiConfig = {
          cvCheck: { enabled: savedVacancy.cvCheckEnabled, minScore: savedVacancy.cvMinScore },
          test: { enabled: savedVacancy.testEnabled, questions: savedVacancy.vacancyTests || [] },
          openQ: { enabled: savedVacancy.openQEnabled, questions: savedVacancy.vacancyOpenQs?.map((q: any) => q.text) || [] },
          sales: { enabled: savedVacancy.salesEnabled, product: savedVacancy.salesProduct, personas: savedVacancy.salesPersonas || [] },
          video: { enabled: savedVacancy.videoEnabled, prompt: savedVacancy.videoPrompt },
        };

        setVacancies([savedVacancy, ...vacancies]);
        setIsModalOpen(false);
        showToast("Vakansiya e'lon qilindi");
      } else {
        showToast("Xatolik yuz berdi");
      }
    } catch (e) {
      showToast("Xatolik yuz berdi");
    }
  };

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const onDragStart = (e: React.DragEvent, cIdx: number) => {
    setDraggedItem(cIdx);
  };

  const onDrop = async (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    if (draggedItem === null || !activeVacancyId) return;
    
    const vIdx = vacancies.findIndex(v => v.id === activeVacancyId);
    if (vIdx === -1) return;

    const newVacs = [...vacancies];
    const cand = newVacs[vIdx].candidates[draggedItem];
    cand.stage = stageKey;
    setVacancies(newVacs);
    setDraggedItem(null);
    
    try {
      await fetch('/api/candidates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cand.id, stage: stageKey })
      });
    } catch(err) {}
  };

  if (isAuthChecking) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Yuklanmoqda...</div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{
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
        body{ font-family:var(--font-body); background:var(--paper); color:var(--ink); -webkit-font-smoothing:antialiased; margin:0; padding:0; }
        .app{display:grid;grid-template-columns:236px 1fr;min-height:100vh;}
        .sidebar{ background:var(--ink);color:#EFEDE4;padding:24px 18px; display:flex;flex-direction:column;position:sticky;top:0;height:100vh; }
        .brand{display:flex;align-items:center;gap:10px;padding:0 6px 26px 6px;border-bottom:1px solid rgba(239,237,228,0.14);margin-bottom:22px;}
        .brand-mark{width:30px;height:30px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:600;color:var(--accent-ink);font-size:16px;}
        .brand-name{font-family:var(--font-display);font-size:19px;font-weight:600;letter-spacing:0.2px;}
        .brand-tag{font-size:10.5px;color:#9B9A8F;margin-top:-3px;letter-spacing:.03em;}
        .nav{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;flex:1;}
        .nav-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:8px;font-size:14px;color:#C9C6BB;cursor:pointer;transition:background .15s ease, color .15s ease;user-select:none;}
        .nav-item svg{width:17px;height:17px;flex-shrink:0;opacity:.85;}
        .nav-item:hover{background:rgba(239,237,228,0.08);color:#EFEDE4;}
        .nav-item.active{background:var(--accent);color:var(--accent-ink);font-weight:600;}
        .nav-item.active svg{opacity:1;}
        .sidebar-foot{border-top:1px solid rgba(239,237,228,0.14);padding-top:14px;display:flex;align-items:center;gap:10px;}
        .avatar-sm{width:32px;height:32px;border-radius:50%;background:#3A4D78;color:#EFEDE4;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;}
        .sidebar-foot .who{font-size:12.5px;line-height:1.35;}
        .sidebar-foot .who b{display:block;font-size:13px;color:#EFEDE4;}
        .sidebar-foot .who span{color:#9B9A8F;}
        .main{padding:30px 40px 60px;max-width:1180px;}
        .pagehead{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:26px;gap:20px;}
        .pagehead h1{font-family:var(--font-display);font-size:29px;font-weight:600;margin:0 0 4px;}
        .pagehead p{margin:0;color:var(--muted);font-size:14px;}
        .btn{font-family:var(--font-body);font-size:13.5px;font-weight:600;border-radius:8px;padding:10px 16px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:transform .1s ease, background .15s ease;white-space:nowrap;}
        .btn:active{transform:scale(0.98);}
        .btn-primary{background:var(--accent);color:var(--accent-ink);}
        .btn-primary:hover{background:var(--accent-deep);color:#fff;}
        .btn-ghost{background:transparent;border-color:var(--line-strong);color:var(--ink);}
        .btn-ghost:hover{background:#fff;}
        .btn-sm{padding:7px 12px;font-size:12.5px;}
        .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
        .stat-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px;}
        .stat-card .label{font-size:12.5px;color:var(--muted);margin-bottom:10px;}
        .stat-card .num{font-family:var(--font-mono);font-size:26px;font-weight:500;color:var(--ink);}
        .stat-card .delta{font-size:12px;margin-top:6px;font-family:var(--font-mono);}
        .delta.up{color:var(--success);}
        .delta.flat{color:var(--muted);}
        .conveyor-panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px 26px 20px;margin-bottom:28px;}
        .conveyor-panel .panel-title{font-family:var(--font-display);font-size:16px;font-weight:600;margin:0 0 3px;}
        .conveyor-panel .panel-sub{font-size:12.5px;color:var(--muted);margin:0 0 22px;}
        .conveyor{display:flex;align-items:flex-start;position:relative;}
        .conveyor::before{content:"";position:absolute;top:17px;left:17px;right:17px;height:0;border-top:2px dashed var(--line-strong);z-index:0;}
        .stage{flex:1;display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;}
        .stage .node{width:34px;height:34px;border-radius:50%;background:var(--paper);border:2px solid var(--line-strong);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:13px;font-weight:500;color:var(--ink-soft);margin-bottom:10px;}
        .stage.warm .node{border-color:var(--accent);color:var(--accent-deep);background:var(--accent-bg);}
        .stage.win .node{border-color:var(--success);color:var(--success);background:var(--success-bg);}
        .stage .stage-label{font-size:12px;color:var(--ink);font-weight:600;text-align:center;line-height:1.3;}
        .section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
        .section-title h2{font-family:var(--font-display);font-size:17px;font-weight:600;margin:0;}
        .section-title a{font-size:12.5px;color:var(--accent-deep);text-decoration:none;font-weight:600;cursor:pointer;}
        .vac-table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}
        .vac-table th{text-align:left;font-size:11.5px;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted);font-weight:600;padding:12px 16px;border-bottom:1px solid var(--line);}
        .vac-table td{padding:14px 16px;font-size:13.5px;border-bottom:1px solid var(--line);vertical-align:middle;}
        .vac-table tr.rowlink{cursor:pointer;}
        .vac-table tr.rowlink:hover{background:#F7F9F6;}
        .job-title{font-weight:600;color:var(--ink);}
        .job-meta{font-size:12px;color:var(--muted);margin-top:2px;}
        .badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:600;}
        .badge.active{background:var(--success-bg);color:var(--success);}
        .badge.draft{background:#EFEDE4;color:var(--muted);}
        .badge.closed{background:var(--danger-bg);color:var(--danger);}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;}
        .count-mono{font-family:var(--font-mono);font-size:13.5px;}
        .ai-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10.5px;font-weight:600;background:var(--violet-bg);color:var(--violet);}
        .ai-pill-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;}
        .vac-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
        .vac-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px;cursor:pointer;transition:border-color .15s ease;}
        .vac-card:hover{border-color:var(--line-strong);}
        .vac-card .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
        .vac-card h3{font-family:var(--font-display);font-size:16.5px;font-weight:600;margin:0 0 4px;}
        .vac-card .dept{font-size:12.5px;color:var(--muted);}
        .vac-card .facts{display:flex;gap:14px;margin:14px 0 4px;font-size:12.5px;color:var(--ink-soft);}
        .vac-card .foot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:12px;margin-top:12px;}
        .vac-card .applicants{font-size:12.5px;color:var(--muted);}
        .vac-detail-head{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px 24px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:flex-start;}
        .vac-detail-head h2{font-family:var(--font-display);font-size:21px;font-weight:600;margin:0 0 6px;}
        .vac-detail-head .meta{font-size:13px;color:var(--muted);}
        .back-link{font-size:12.5px;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;gap:5px;margin-bottom:14px;}
        .back-link:hover{color:var(--ink);}
        .ai-stage-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;}
        .ai-stage-card{border:1px solid var(--line);border-radius:9px;padding:13px 14px;background:#F9FAF8;}
        .ai-stage-card .h{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
        .ai-stage-card .icon{width:26px;height:26px;border-radius:7px;background:var(--violet-bg);color:var(--violet);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .ai-stage-card .icon svg{width:14px;height:14px;}
        .ai-stage-card b{font-size:13px;}
        .ai-stage-card p{font-size:11.5px;color:var(--muted);margin:0;line-height:1.4;}
        .ai-off-note{font-size:12.5px;color:var(--muted);padding:6px 2px;}
        .kanban{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;align-items:start;}
        .kcol{background:#E4E9E4;border-radius:var(--radius);padding:12px;min-height:120px;}
        .kcol-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 2px;}
        .kcol-head .name{font-size:12px;font-weight:700;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.03em;}
        .kcol-head .n{font-family:var(--font-mono);font-size:12px;color:var(--muted);background:#fff;border-radius:999px;padding:1px 7px;}
        .kcard{background:var(--card);border-radius:8px;padding:11px 12px;margin-bottom:8px;border:1px solid var(--line);cursor:grab;}
        .kcard:active{cursor:grabbing;}
        .kcard.dragging{opacity:0.4;}
        .kcol.dragover{background:#D8E4D9;outline:2px dashed var(--line-strong);outline-offset:-4px;}
        .kcard .who{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
        .kavatar{width:26px;height:26px;border-radius:50%;background:var(--accent);color:var(--accent-ink);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .kcard .name-txt{font-size:13px;font-weight:600;line-height:1.2;}
        .kcard .role-txt{font-size:11px;color:var(--muted);}
        .kcard .match{font-family:var(--font-mono);font-size:11px;color:var(--success);font-weight:500;}
        .kcard .match.low{color:var(--muted);}
        .overlay{position:fixed;inset:0;background:rgba(20,33,61,0.45);display:flex;align-items:flex-start;justify-content:center;padding:44px 20px;overflow:auto;z-index:50;}
        .modal{background:var(--card);border-radius:14px;width:100%;max-width:660px;padding:28px 30px 26px;}
        .modal.wide{max-width:720px;}
        .modal h2{font-family:var(--font-display);font-size:20px;font-weight:600;margin:0 0 4px;}
        .modal .sub{font-size:13px;color:var(--muted);margin:0 0 22px;}
        .field{margin-bottom:16px;}
        .field label{display:block;font-size:12.5px;font-weight:600;color:var(--ink-soft);margin-bottom:6px;}
        .field input,.field select,.field textarea{width:100%;font-family:var(--font-body);font-size:13.5px;border:1px solid var(--line-strong);border-radius:8px;padding:9px 12px;background:#F9FAF8;color:var(--ink);}
        .field textarea{resize:vertical;min-height:70px;}
        .field input:focus,.field select:focus,.field textarea:focus{outline:2px solid var(--accent);outline-offset:1px;background:#fff;}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .modal-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:22px;}
        .modal-actions .right{display:flex;gap:10px;}
        .stepper{display:flex;align-items:center;gap:8px;margin-bottom:24px;}
        .stepper .sdot{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);font-weight:600;}
        .stepper .num{width:22px;height:22px;border-radius:50%;background:var(--paper);border:1px solid var(--line-strong);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;}
        .stepper .sdot.active{color:var(--ink);}
        .stepper .sdot.active .num{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);}
        .stepper .sline{flex:1;height:1px;background:var(--line-strong);margin:0 2px;}
        .switch{position:relative;display:inline-block;width:38px;height:22px;flex-shrink:0;}
        .switch input{opacity:0;width:0;height:0;position:absolute;}
        .slider-tog{position:absolute;cursor:pointer;inset:0;background:var(--line-strong);transition:.18s;border-radius:999px;}
        .slider-tog::before{content:"";position:absolute;height:16px;width:16px;left:3px;top:3px;background:#fff;transition:.18s;border-radius:50%;}
        .switch input:checked + .slider-tog{background:var(--violet);}
        .switch input:checked + .slider-tog::before{transform:translateX(16px);}
        .ai-req{border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin-bottom:12px;background:#F9FAF8;}
        .ai-req.on{background:#fff;border-color:var(--violet);}
        .ai-req .head{display:flex;justify-content:space-between;align-items:center;gap:12px;}
        .ai-req .head .info{display:flex;gap:11px;align-items:flex-start;}
        .ai-req .head .icon{width:32px;height:32px;border-radius:8px;background:var(--violet-bg);color:var(--violet);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .ai-req .head .icon svg{width:16px;height:16px;}
        .ai-req .head h4{margin:0 0 2px;font-size:13.5px;font-weight:600;}
        .ai-req .head p{margin:0;font-size:12px;color:var(--muted);}
        .ai-req .body{margin-top:14px;padding-top:14px;border-top:1px solid var(--line);}
        .q-row{border:1px solid var(--line);border-radius:8px;padding:11px 12px;margin-bottom:9px;background:#fff;}
        .q-row-top{display:flex;gap:8px;align-items:center;}
        .q-row-top input{flex:1;}
        .opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px;}
        .opt-line{display:flex;align-items:center;gap:6px;}
        .opt-line input[type=radio]{margin:0;accent-color:var(--violet);flex-shrink:0;}
        .opt-line input[type=text]{padding:7px 9px;font-size:12.5px;}
        .rm-x{width:26px;height:26px;border-radius:6px;border:1px solid var(--line-strong);background:#fff;color:var(--muted);cursor:pointer;flex-shrink:0;font-size:13px;line-height:1;}
        .rm-x:hover{color:var(--danger);border-color:var(--danger);}
        .add-q-btn{font-size:12.5px;font-weight:600;color:var(--violet);background:var(--violet-bg);border:none;border-radius:7px;padding:8px 12px;cursor:pointer;}
        .cprofile-top{display:flex;align-items:center;gap:14px;margin-bottom:18px;}
        .cprofile-avatar{width:52px;height:52px;border-radius:50%;background:var(--accent);color:var(--accent-ink);font-weight:700;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .cprofile-top h2{margin:0 0 2px;}
        .cprofile-top .role{font-size:13px;color:var(--muted);}
        .ai-result{border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin-bottom:12px;}
        .ai-result .rh{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .ai-result .rh .t{display:flex;align-items:center;gap:9px;font-size:13.5px;font-weight:600;}
        .ai-result .rh .t .icon{width:26px;height:26px;border-radius:7px;background:var(--violet-bg);color:var(--violet);display:flex;align-items:center;justify-content:center;}
        .ai-result .rh .t .icon svg{width:14px;height:14px;}
        .score-pill{font-family:var(--font-mono);font-size:13px;font-weight:600;padding:3px 10px;border-radius:999px;}
        .score-pill.high{background:var(--success-bg);color:var(--success);}
        .score-pill.mid{background:var(--accent-bg);color:var(--accent-deep);}
        .score-pill.low{background:var(--danger-bg);color:var(--danger);}
        .ai-result .comment{font-size:12.5px;color:var(--ink-soft);line-height:1.5;margin:0;}
        .qa-item{margin-bottom:10px;}
        .qa-item .q{font-size:12.5px;font-weight:600;margin-bottom:3px;}
        .qa-item .a{font-size:12.5px;color:var(--muted);background:var(--paper);border-radius:6px;padding:8px 10px;}
        .video-link-btn{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--violet);background:var(--violet-bg);border-radius:7px;padding:8px 13px;text-decoration:none;}
        .na-note{font-size:12px;color:var(--muted);font-style:italic;}
        .toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--ink);color:#EFEDE4;padding:12px 20px;border-radius:8px;font-size:13.5px;opacity:0;transition:opacity .2s ease, transform .2s ease;z-index:60;pointer-events:none;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        `
      }} />

      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">I</div>
            <div><div className="brand-name">Ishla</div><div className="brand-tag">AI bilan yollash</div></div>
          </div>
          <ul className="nav">
            <li className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
              Boshqaruv paneli
            </li>
            <li className={`nav-item ${view === 'vacancies' || view === 'detail' ? 'active' : ''}`} onClick={() => setView('vacancies')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              Vakansiyalar
            </li>
            <li className={`nav-item ${view === 'candidates' ? 'active' : ''}`} onClick={() => setView('candidates')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17.5" cy="8.5" r="2.4" /><path d="M15.5 14.3c2.6.4 4.5 2.3 4.5 5.2" /></svg>
              Nomzodlar
            </li>
            <li className={`nav-item ${view === 'interviews' ? 'active' : ''}`} onClick={() => setView('interviews')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
              Suhbatlar
            </li>
            <li className={`nav-item ${view === 'stats' ? 'active' : ''}`} onClick={() => setView('stats')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>
              Statistika
            </li>
          </ul>
          <div className="sidebar-foot">
            <div className="avatar-sm">{userObj ? `${userObj.firstName?.charAt(0) || ''}${userObj.lastName?.charAt(0) || ''}`.toUpperCase() : '👤'}</div>
            <div className="who"><b>{userObj ? `${userObj.firstName} ${userObj.lastName}` : 'Yuklanmoqda...'}</b><span>{userObj?.company || 'HR menejer'}</span></div>
            <button onClick={logout} title="Chiqish" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9B9A8F', cursor: 'pointer', padding: 4 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </aside>

        <main className="main">
          <div className="top-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            <input type="text" placeholder="Qidiruv (nomzod, vakansiya)..." />
          </div>
          
          <div className="content">
            {view === 'dashboard' && (
              <section className="view active">
                <div className="pagehead">
                  <div><h1>Xayrli kun, {userObj ? userObj.firstName : '...'}</h1><p>Bugungi holat va faol vakansiyalar bo'yicha qisqacha ma'lumot.</p></div>
                  <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>
                    Yangi vakansiya
                  </button>
                </div>
              <div className="stat-row">
                <div className="stat-card"><div className="label">Faol vakansiyalar</div><div className="num">{vacancies.filter(v => v.status === 'active').length}</div><div className="delta up">+1 shu hafta</div></div>
                <div className="stat-card"><div className="label">Yangi arizalar</div><div className="num">{allCandidates().filter(c => c.stage === 'new').length}</div><div className="delta up">+{allCandidates().filter(c => c.stage === 'new').length} oxirgi 3 kunda</div></div>
                <div className="stat-card"><div className="label">Rejalashtirilgan suhbatlar</div><div className="num">{allCandidates().filter(c => c.stage === 'interview').length}</div><div className="delta flat">Bu hafta</div></div>
                <div className="stat-card"><div className="label">Ishga qabul qilinganlar</div><div className="num">{allCandidates().filter(c => c.stage === 'hired').length}</div><div className="delta flat">Ushbu oyda</div></div>
              </div>
              <div className="conveyor-panel">
                <p className="panel-title">Nomzodlar konveyeri</p>
                <p className="panel-sub">Barcha faol vakansiyalar bo'yicha jami nomzodlar bosqichlari</p>
                <div className="conveyor">
                  {STAGES.map(s => {
                    const n = allCandidates().filter(c => c.stage === s.key).length;
                    let cls = '';
                    if (s.key === 'interview' || s.key === 'offer') cls = 'warm';
                    if (s.key === 'hired') cls = 'win';
                    return <div key={s.key} className={`stage ${cls}`}><div className="node">{n}</div><div className="stage-label">{s.label}</div></div>
                  })}
                </div>
              </div>
              <div className="section-title"><h2>So'nggi vakansiyalar</h2><a onClick={() => setView('vacancies')}>Barchasini ko'rish →</a></div>
              <table className="vac-table">
                <thead><tr><th>Lavozim</th><th>Holat</th><th>Arizalar</th><th>E'lon sanasi</th></tr></thead>
                <tbody>
                  {vacancies.slice(0, 4).map(v => (
                    <tr key={v.id} className="rowlink" onClick={() => { setActiveVacancyId(v.id); setView('detail'); }}>
                      <td><div className="job-title">{v.title}</div><div className="job-meta">{v.dept} · {v.loc}</div></td>
                      <td>{statusBadge(v.status)}</td>
                      <td className="count-mono">{v.candidates.length}</td>
                      <td>{v.posted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {view === 'vacancies' && (
            <section className="view active">
              <div className="pagehead">
                <div><h1>Vakansiyalar</h1><p>Kompaniyangizning barcha e'lonlari — faol, qoralama va yopilgan.</p></div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>
                  Yangi vakansiya
                </button>
              </div>
              <div className="vac-grid">
                {vacancies.map(v => (
                  <div key={v.id} className="vac-card" onClick={() => { setActiveVacancyId(v.id); setView('detail'); }}>
                    <div className="top"><div><h3>{v.title}</h3><div className="dept">{v.dept}</div></div>{statusBadge(v.status)}</div>
                    <div className="facts"><span>{v.loc}</span><span>{v.type}</span></div>
                    <div className="facts" style={{ marginTop: -6, color: 'var(--muted)' }}>{v.salary}</div>
                    <div className="ai-pill-row">
                      {Object.keys(v.aiConfig).filter(k => v.aiConfig[k].enabled).map(k => (
                        <span key={k} className="ai-pill">{AI_META[k as keyof typeof AI_META].icon}{AI_META[k as keyof typeof AI_META].label}</span>
                      ))}
                    </div>
                    <div className="foot"><div className="applicants">Nomzodlar: <b>{v.candidates.length}</b></div><div className="applicants">E'lon: {v.posted}</div></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === 'detail' && activeVacancyId && (() => {
            const v = vacancies.find((x: any) => x.id === activeVacancyId);
            if (!v) return null;
            
            // Umumiy ballni hisoblash funksiyasi
            const calcTotal = (c: any) => {
              let total = 0, count = 0;
              // Use != null so a genuine score of 0 still counts.
              if (v.aiConfig?.cvCheck?.enabled && c.cvScore != null) { total += c.cvScore; count++; }
              if (v.aiConfig?.test?.enabled && c.testScore != null) { total += c.testScore; count++; }
              if (v.aiConfig?.sales?.enabled && c.salesScore != null) { total += c.salesScore; count++; }
              if (count === 0) return 0;
              let avg = Math.round(total / count);
              if (c.videoLink) avg = Math.min(avg + 5, 100); // Video uchun +5 bonus ball
              return avg;
            };

            const sortedCandidates = [...v.candidates].sort((a, b) => calcTotal(b) - calcTotal(a));

            return (
              <section className="view active">
                <div className="back-link" onClick={() => setView('vacancies')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
                  Vakansiyalarga qaytish
                </div>
                
                <div className="pagehead" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2>{v.title}</h2><div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, marginBottom: 8 }}><span style={{ fontFamily: "monospace", background: "var(--line)", color: "var(--ink)", padding: "4px 8px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>ID: {v.publicId || "XAB12345"}</span><button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + "/vacansiy?id=" + (v.publicId || "XAB12345")); showToast("Havola nusxalandi"); }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Nusxalash</button><button className="btn btn-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); deleteVacancy(v.id); }}>O&apos;chirish</button></div>
                    <div className="meta" style={{ marginTop: 6 }}>{v.dept} · {v.loc} · {v.type}</div>
                  </div>
                  
                  {/* Kanban va Reyting o'rtasida o'tish (Tabs) */}
                  <div className="tabs" style={{ background: 'var(--paper)', padding: 4, borderRadius: 8 }}>
                    <div className={`tab ${!v.showRating ? 'active' : ''}`} onClick={() => { v.showRating = false; setVacancies([...vacancies]); }}>Kanban Doska</div>
                    <div className={`tab ${v.showRating ? 'active' : ''}`} onClick={() => { v.showRating = true; setVacancies([...vacancies]); }}>Reyting Jadvali</div>
                  </div>
                </div>

                {!v.showRating ? (
                  <>
                    <div className="conveyor-panel" style={{ marginBottom: 20 }}>
                      <p className="panel-title" style={{ marginBottom: 16 }}>Ushbu vakansiya bo'yicha jarayon</p>
                      <div className="conveyor">
                        {STAGES.map(s => {
                          const n = v.candidates.filter((c: any) => c.stage === s.key).length || 0;
                          let cls = '';
                          if (s.key === 'interview' || s.key === 'offer') cls = 'warm';
                          if (s.key === 'hired') cls = 'win';
                          return <div key={s.key} className={`stage ${cls}`}><div className="node">{n}</div><div className="stage-label">{s.label}</div></div>
                        })}
                      </div>
                    </div>

                    <div className="kanban">
                      {STAGES.map(s => (
                        <div key={s.key} className="kcol" data-stage={s.key}
                          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                          onDragLeave={e => e.currentTarget.classList.remove('dragover')}
                          onDrop={e => { e.currentTarget.classList.remove('dragover'); onDrop(e, s.key); }}>
                          <div className="kcol-head">
                            <span className="name">{s.label}</span>
                            <span className="n">{v.candidates.filter((c: any) => c.stage === s.key).length || 0}</span>
                          </div>
                          {v.candidates.map((c: any, cIdx: number) => c.stage === s.key && (
                            <div key={c.name} className="kcard" draggable
                              onDragStart={(e) => onDragStart(e, cIdx)}
                              onClick={() => { setActiveCandidate({ vacId: activeVacancyId, idx: cIdx }); setIsCProfileOpen(true); }}>
                              <div className="who"><div className="kavatar">{initials(c.name)}</div><div><div className="name-txt">{c.name}</div><div className="role-txt">{c.role}</div></div></div>
                              <div className={`match ${c.match < 75 ? 'low' : ''}`}>{c.match}% AI bali</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rating-table-wrapper" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', overflow: 'auto', border: '1px solid var(--line)' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 850 }}>
                      <thead style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                        <tr>
                          <th style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>Reyting / Nomzod</th>
                          {v.aiConfig?.cvCheck?.enabled && <th style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>CV Mosligi</th>}
                          {v.aiConfig?.test?.enabled && <th style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>Test Natijasi</th>}
                          {v.aiConfig?.openQ?.enabled && <th style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>Ochiq Savollar</th>}
                          {v.aiConfig?.sales?.enabled && <th style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>AI Mijoz (Sotuv)</th>}
                          {v.aiConfig?.video?.enabled && <th style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>Video Taqdimot</th>}
                          <th style={{ padding: '12px 16px', color: 'var(--ink)', fontSize: 14, fontWeight: 700, textAlign: 'right' }}>Umumiy Ball</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCandidates.map((c: any, i: number) => {
                          const score = calcTotal(c);
                          return (
                            <tr key={i} className="rowlink" onClick={() => { setActiveCandidate({ vacId: activeVacancyId, idx: v.candidates.findIndex((x: any) => x.name === c.name) }); setIsCProfileOpen(true); }} style={{ borderBottom: '1px solid var(--line)', transition: '0.2s', cursor: 'pointer' }}>
                              <td style={{ padding: '16px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 15 }}>{i + 1}. {c.name}</div>
                                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{c.role}</div>
                              </td>
                              
                              {v.aiConfig?.cvCheck?.enabled && (
                                <td style={{ padding: '16px' }}>{c.cvScore ? <span className={scoreClass(c.cvScore)} style={{fontWeight:600}}>{c.cvScore}%</span> : '-'}</td>
                              )}
                              
                              {v.aiConfig?.test?.enabled && (
                                <td style={{ padding: '16px' }}>{c.testScore ? <span className={scoreClass(c.testScore)} style={{fontWeight:600}}>{c.testScore}%</span> : '-'}</td>
                              )}
                              
                              {v.aiConfig?.openQ?.enabled && (
                                <td style={{ padding: '16px' }}>
                                  {c.openAnswers && c.openAnswers.length > 0 ? (
                                    <span style={{ color: 'var(--success)', fontWeight: 500, fontSize: 13 }}>✓ Javob berildi</span>
                                  ) : (
                                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>Kutilmoqda...</span>
                                  )}
                                </td>
                              )}
                              
                              {v.aiConfig?.sales?.enabled && (
                                <td style={{ padding: '16px' }}>{c.salesScore ? <span className={scoreClass(c.salesScore)} style={{fontWeight:600}}>{c.salesScore}%</span> : '-'}</td>
                              )}
                              
                              {v.aiConfig?.video?.enabled && (
                                <td style={{ padding: '16px' }}>
                                  {c.videoLink ? <span style={{ color: 'var(--success)', fontWeight: 500, fontSize: 13 }}>✓ Yuklangan</span> : <span style={{ color: 'var(--muted)', fontSize: 13 }}>Yo'q</span>}
                                </td>
                              )}
                              
                              <td style={{ padding: '16px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: '50%', background: score >= 80 ? 'var(--success-bg)' : score >= 60 ? 'var(--accent-bg)' : 'var(--danger-bg)', color: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--accent-deep)' : 'var(--danger)', fontWeight: 700, fontSize: 16 }}>
                                  {score}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {sortedCandidates.length === 0 && (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                              Hali arizalar tushmagan
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })()}

          {view === 'candidates' && (
            <section className="view active">
              <div className="pagehead"><div><h1>Nomzodlar</h1><p>Barcha vakansiyalar bo'yicha tushgan arizalar ro'yxati.</p></div></div>
              <table className="vac-table">
                <thead><tr><th>Ism</th><th>Lavozim</th><th>AI umumiy bali</th><th>Bosqich</th><th></th></tr></thead>
                <tbody>
                  {allCandidates().map((c, i) => (
                    <tr key={i}>
                      <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}><span className="kavatar" style={{ width: 24, height: 24, fontSize: 10 }}>{initials(c.name)}</span>{c.name}</span></td>
                      <td>{c.vac}</td>
                      <td className="count-mono" style={{ color: c.match >= 80 ? 'var(--success)' : 'var(--muted)' }}>{c.match}%</td>
                      <td>{STAGES.find(s => s.key === c.stage)?.label}</td>
                      <td><a onClick={() => {
                        const vIdx = vacancies.findIndex(v => v.id === c.vacId);
                        const cIdx = vacancies[vIdx].candidates.findIndex((cx: any) => cx.name === c.name);
                        setActiveCandidate({ vacId: c.vacId, idx: cIdx });
                        setIsCProfileOpen(true);
                      }} style={{ fontSize: 12.5, color: 'var(--violet)', cursor: 'pointer', fontWeight: 600 }}>AI natijasi →</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {view === 'interviews' && (
            <section className="view active">
              <div className="pagehead"><div><h1>Suhbatlar</h1><p>Rejalashtirilgan va o'tkazilgan suhbatlar jadvali.</p></div></div>
              <table className="vac-table">
                <thead><tr><th>Nomzod</th><th>Lavozim</th><th>Sana</th><th>Format</th><th>Holat</th></tr></thead>
                <tbody>
                  {allCandidates().filter(c => c.stage === 'interview' || c.stage === 'offer').length > 0 ?
                    allCandidates().filter(c => c.stage === 'interview' || c.stage === 'offer').map((c, i) => (
                      <tr key={i}>
                        <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}><span className="kavatar" style={{ width: 24, height: 24, fontSize: 10 }}>{initials(c.name)}</span>{c.name}</span></td>
                        <td>{c.vac}</td>
                        <td>{['28-avgust · 11:00', '29-avgust · 14:30', '2-sentabr · 10:00'][i % 3]}</td>
                        <td>{i % 2 === 0 ? "Video qo'ng'iroq" : 'Offisda'}</td>
                        <td>{c.stage === 'offer' ? <span className="badge active"><span className="badge-dot"></span>Taklif kutilmoqda</span> : <span className="badge draft"><span className="badge-dot"></span>Rejalashtirilgan</span>}</td>
                      </tr>
                    )) : <tr><td colSpan={5} style={{ color: 'var(--muted)', textAlign: 'center', padding: 26 }}>Hozircha rejalashtirilgan suhbatlar yo'q.</td></tr>
                  }
                </tbody>
              </table>
            </section>
          )}

          {view === 'stats' && (
            <section className="view active">
              <div className="pagehead"><div><h1>Statistika</h1><p>Yollash jarayonining umumiy ko'rsatkichlari.</p></div></div>
              <div className="stat-row">
                <div className="stat-card"><div className="label">Faol vakansiyalar</div><div className="num">{vacancies.filter(v => v.status === 'active').length}</div><div className="delta up">+1 shu hafta</div></div>
                <div className="stat-card"><div className="label">Yangi arizalar</div><div className="num">{allCandidates().filter(c => c.stage === 'new').length}</div><div className="delta up">+{allCandidates().filter(c => c.stage === 'new').length} oxirgi 3 kunda</div></div>
                <div className="stat-card"><div className="label">Rejalashtirilgan suhbatlar</div><div className="num">{allCandidates().filter(c => c.stage === 'interview').length}</div><div className="delta flat">Bu hafta</div></div>
                <div className="stat-card"><div className="label">Ishga qabul qilinganlar</div><div className="num">{allCandidates().filter(c => c.stage === 'hired').length}</div><div className="delta flat">Ushbu oyda</div></div>
              </div>
              <div className="conveyor-panel">
                <p className="panel-title">O'rtacha yopilish muddati</p>
                <p className="panel-sub">Vakansiya e'lon qilingandan ishga qabul qilinguncha, kunlarda</p>
                <table className="vac-table" style={{ marginTop: 6 }}>
                  <thead><tr><th>Bo'lim</th><th>Faol vakansiyalar</th><th>O'rtacha kun</th></tr></thead>
                  <tbody>
                    <tr><td>IT va mahsulot</td><td className="count-mono">1</td><td className="count-mono">34 kun</td></tr>
                    <tr><td>Marketing</td><td className="count-mono">1</td><td className="count-mono">26 kun</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
          </div>
        </main>
      </div>

      {baseModalOpen && (
        <div className="overlay open" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) setBaseModalOpen(false) }}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <h2>Bo'lim bazasidan {baseModalType === 'tests' ? 'testlar' : 'ochiq savollar'}ni tanlash</h2>
            <p className="sub">{fDept} bo'limi uchun superadmin tomonidan qo'shilgan savollar.</p>
            
            <div className="base-q-list" style={{ marginTop: 20, maxHeight: 400, overflowY: 'auto' }}>
              {(() => {
                const deptData = departments.find((d: any) => d.name === fDept);
                if (!deptData) return <p>Ushbu bo'lim uchun savollar topilmadi.</p>;
                
                if (baseModalType === 'tests') {
                  if (!deptData.tests || deptData.tests.length === 0) return <p>Testlar bazasi bo'sh.</p>;
                  return deptData.tests.map((q: any) => (
                    <div key={q.id} className="q-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
                      <div style={{ flex: 1 }}><strong>{q.text}</strong><br/><span style={{ fontSize: 13, color: 'var(--muted)' }}>To'g'ri: {q.options[q.correct]}</span></div>
                      <button className="btn btn-sm btn-ghost" onClick={() => { 
                        setTestQs([...testQs, { text: q.text, options: q.options, correct: q.correct }]); 
                        showToast("Savol qo'shildi");
                        setBaseModalOpen(false); 
                      }}>Qo'shish</button>
                    </div>
                  ));
                } else {
                  if (!deptData.openQs || deptData.openQs.length === 0) return <p>Ochiq savollar bazasi bo'sh.</p>;
                  return deptData.openQs.map((q: any) => (
                    <div key={q.id} className="q-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
                      <div style={{ flex: 1 }}><strong>{q.text}</strong></div>
                      <button className="btn btn-sm btn-ghost" onClick={() => { 
                        setOpenQs([...openQs, q.text]);
                        showToast("Savol qo'shildi");
                        setBaseModalOpen(false); 
                      }}>Qo'shish</button>
                    </div>
                  ));
                }
              })()}
            </div>
            
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setBaseModalOpen(false)}>Yopish</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="overlay" style={{ display: 'flex' }}>
          <div className="modal wide">
            <div className="stepper">
              <div className={`sdot ${modalStep === 1 ? 'active' : ''}`}><span className="num">1</span>Asosiy ma'lumot</div>
              <div className="sline"></div>
              <div className={`sdot ${modalStep === 2 ? 'active' : ''}`}><span className="num">2</span>AI saralash talablari</div>
            </div>

            {modalStep === 1 && (
              <div className="modal-step active">
                <h2>Yangi vakansiya e'lon qilish</h2>
                <p className="sub">Avval asosiy ma'lumotlarni kiriting.</p>
                <div className="field"><label>Lavozim nomi</label><input type="text" value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Masalan: Frontend dasturchi (React)" /></div>
                <div className="field-row">
                  <div className="field"><label>Bo'lim</label>
                    <select value={fDept} onChange={e => setFDept(e.target.value)}><option>IT va mahsulot</option><option>Marketing</option><option>Sotuv</option><option>Moliya</option><option>HR</option></select>
                  </div>
                  <div className="field"><label>Ish turi</label>
                    <select value={fType} onChange={e => setFType(e.target.value)}><option>To'liq stavka</option><option>Qisman stavka</option><option>Masofaviy</option><option>Amaliyot</option></select>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Manzil</label><input type="text" value={fLoc} onChange={e => setFLoc(e.target.value)} placeholder="Toshkent" /></div>
                  <div className="field"><label>Maosh (so'm)</label><input type="text" value={fSalary} onChange={e => setFSalary(e.target.value)} placeholder="8 000 000 – 12 000 000" /></div>
                </div>
                <div className="field"><label>Talablar va tavsif</label><textarea value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Asosiy vazifalar, talab qilinadigan ko'nikmalar..."></textarea></div>
                <div className="modal-actions"><button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Bekor qilish</button><div className="right"><button className="btn btn-primary" onClick={() => setModalStep(2)}>Keyingisi →</button></div></div>
              </div>
            )}

            {modalStep === 2 && (
              <div className="modal-step active">
                <h2>AI saralash talablari</h2>
                <p className="sub">Nomzodlarni qaysi avtomatik bosqichlardan o'tkazmoqchisiz — kerakli bandlarni yoqing.</p>

                <div className={`ai-req ${reqCv ? 'on' : ''}`}>
                  <div className="head">
                    <div className="info">
                      <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></svg></div>
                      <div><h4>CV moslik tahlili</h4><p>AI nomzod rezyumesini vakansiya talablari bilan solishtirib, moslik balini chiqaradi.</p></div>
                    </div>
                    <label className="switch"><input type="checkbox" checked={reqCv} onChange={e => setReqCv(e.target.checked)} /><span className="slider-tog"></span></label>
                  </div>
                  {reqCv && <div className="body" style={{ display: 'block' }}>
                    <div className="field" style={{ marginBottom: 0 }}><label>Minimal o'tish bali (%)</label><input type="number" value={cvMin} onChange={e => setCvMin(Number(e.target.value))} min="0" max="100" /></div>
                  </div>}
                </div>

                <div className={`ai-req ${reqTest ? 'on' : ''}`}>
                  <div className="head">
                    <div className="info">
                      <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 8-8" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                      <div><h4>Test (variantli savollar)</h4><p>Nomzod bilim va ko'nikmalarini tekshiruvchi test o'tkaziladi.</p></div>
                    </div>
                    <label className="switch"><input type="checkbox" checked={reqTest} onChange={e => setReqTest(e.target.checked)} /><span className="slider-tog"></span></label>
                  </div>
                  {reqTest && <div className="body" style={{ display: 'block' }}>
                    {testQs.map((q, i) => (
                      <div key={i} className="q-row">
                        <div className="q-row-top">
                          <input type="text" className="q-text" placeholder="Savol matni" value={q.text} onChange={e => { const newQs = [...testQs]; newQs[i].text = e.target.value; setTestQs(newQs); }} />
                          <button className="rm-x" onClick={() => { const newQs = [...testQs]; newQs.splice(i, 1); setTestQs(newQs); }}>✕</button>
                        </div>
                        <div className="opts">
                          {[0,1,2,3].map(optIdx => (
                            <label key={optIdx} className="opt-line">
                              <input type="radio" name={`correct-${i}`} checked={q.correct === optIdx} onChange={() => { const newQs = [...testQs]; newQs[i].correct = optIdx; setTestQs(newQs); }} />
                              <input type="text" className="q-opt" placeholder={`${['A','B','C','D'][optIdx]} varianti`} value={q.options[optIdx]} onChange={e => { const newQs = [...testQs]; newQs[i].options[optIdx] = e.target.value; setTestQs(newQs); }} />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="add-q-btn" onClick={() => setTestQs([...testQs, { text: '', options: ['', '', '', ''], correct: 0 }])}>+ Savol qo'shish</button>
                      <button className="add-q-btn" style={{ background: '#E3F1EA', color: '#2F7A5C' }} onClick={() => openBaseModal('tests')}>+ Baza orqali tanlash</button>
                    </div>
                  </div>}
                </div>

                <div className={`ai-req ${reqOpen ? 'on' : ''}`}>
                  <div className="head">
                    <div className="info">
                      <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 18h.01M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 2-2 4" /><circle cx="12" cy="12" r="10" /></svg></div>
                      <div><h4>Ochiq savollar</h4><p>Nomzod matn ko'rinishida qo'lda javob yozadi.</p></div>
                    </div>
                    <label className="switch"><input type="checkbox" checked={reqOpen} onChange={e => setReqOpen(e.target.checked)} /><span className="slider-tog"></span></label>
                  </div>
                  {reqOpen && <div className="body" style={{ display: 'block' }}>
                    {openQs.map((q, i) => (
                      <div key={i} className="q-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="text" className="oq-text" placeholder="Savol matni" style={{ flex: 1 }} value={q} onChange={e => { const newQs = [...openQs]; newQs[i] = e.target.value; setOpenQs(newQs); }} />
                        <button className="rm-x" onClick={() => { const newQs = [...openQs]; newQs.splice(i, 1); setOpenQs(newQs); }}>✕</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="add-q-btn" onClick={() => setOpenQs([...openQs, ''])}>+ Savol qo'shish</button>
                      <button className="add-q-btn" style={{ background: '#E3F1EA', color: '#2F7A5C' }} onClick={() => openBaseModal('openQs')}>+ Baza orqali tanlash</button>
                    </div>
                  </div>}
                </div>

                {fDept === 'Sotuv' && (
                  <div className={`ai-req ${reqSales ? 'on' : ''}`}>
                    <div className="head">
                      <div className="info">
                        <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                        <div><h4>AI qo'ng'iroq — sotuv simulyatsiyasi</h4><p>AI mijoz rolida qo'ng'iroq qiladi, nomzod mahsulotni sotishga urinadi, AI baholaydi.</p></div>
                      </div>
                      <label className="switch"><input type="checkbox" checked={reqSales} onChange={e => setReqSales(e.target.checked)} /><span className="slider-tog"></span></label>
                    </div>
                    {reqSales && <div className="body" style={{ display: 'block' }}>
                      <div className="field"><label>Mahsulot yoki xizmat nomi</label><input type="text" value={salesProd} onChange={e => setSalesProd(e.target.value)} placeholder="Masalan: korporativ CRM tizimi" /></div>
                        <div className="field" style={{ marginBottom: 0 }}>
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
                        </div>
                    </div>}
                  </div>
                )}

                <div className={`ai-req ${reqVideo ? 'on' : ''}`}>
                  <div className="head">
                    <div className="info">
                      <div className="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg></div>
                      <div><h4>Video-taqdimot</h4><p>Nomzod o'zi haqida qisqa video yozib, havolasini (YouTube, Telegram va h.k.) yuboradi.</p></div>
                    </div>
                    <label className="switch"><input type="checkbox" checked={reqVideo} onChange={e => setReqVideo(e.target.checked)} /><span className="slider-tog"></span></label>
                  </div>
                  {reqVideo && <div className="body" style={{ display: 'block' }}>
                    <div className="field" style={{ marginBottom: 0 }}><label>Ko'rsatma (video nima haqida bo'lishi kerak)</label><textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="O'zingiz, tajribangiz va nima uchun aynan shu lavozimga mos ekanligingiz haqida 1–2 daqiqalik video yozing."></textarea></div>
                  </div>}
                </div>

                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setModalStep(1)}>← Orqaga</button>
                  <div className="right"><button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Bekor qilish</button><button className="btn btn-primary" onClick={publishVacancy}>E'lon qilish</button></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isCProfileOpen && activeCandidate && (() => {
        const v = vacancies.find(x => x.id === activeCandidate.vacId);
        if (!v) return null;
        const c = v.candidates[activeCandidate.idx];
        if (!c) return null;

        return (
          <div className="overlay open" onClick={(e) => { if (e.target === e.currentTarget) setIsCProfileOpen(false) }}>
            <div className="modal wide">
              <div className="cprofile-top">
                <div className="cprofile-avatar">{initials(c.name)}</div>
                <div>
                  <h2>{c.name}</h2>
                  <div className="role">{c.role} · {v.title}</div>
                </div>
              </div>
              
              {v.aiConfig?.cvCheck?.enabled && c.cvScore !== null && (
                <div className="ai-result" style={{ marginBottom: 16 }}>
                  <div className="rh">
                    <div className="t"><div className="icon">📄</div>CV moslik tahlili</div>
                    <span className={`score-pill ${scoreClass(c.cvScore)}`}>{c.cvScore}%</span>
                  </div>
                  <p className="comment">Nomzod CV'si vakansiya talablariga {c.cvScore}% mos keladi.</p>
                </div>
              )}
              
              {v.aiConfig?.test?.enabled && c.testScore !== null && (
                <div className="ai-result" style={{ marginBottom: 16 }}>
                  <div className="rh">
                    <div className="t"><div className="icon">🧠</div>Test natijasi</div>
                    <span className={`score-pill ${scoreClass(c.testScore)}`}>{c.testScore}%</span>
                  </div>
                  <p className="comment">Test savollariga to'g'ri javoblar ko'rsatkichi.</p>
                </div>
              )}
              
              {v.aiConfig?.openQ?.enabled && c.openAnswers && c.openAnswers.length > 0 && (
                <div className="ai-result" style={{ marginBottom: 16 }}>
                  <div className="rh" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 10 }}>
                    <div className="t"><div className="icon">📝</div>Ochiq savollar</div>
                  </div>
                  <div style={{ background: 'var(--paper)', padding: '12px 16px', borderRadius: 8 }}>
                    {c.openAnswers.map((ans: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: idx < c.openAnswers.length - 1 ? 16 : 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 4 }}>S: {ans.question}</div>
                        <div style={{ fontSize: 14, color: 'var(--ink)' }}>J: {ans.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {v.aiConfig?.sales?.enabled && c.salesScore !== null && (
                <div className="ai-result" style={{ marginBottom: 16 }}>
                  <div className="rh">
                    <div className="t"><div className="icon">💼</div>Sotuv simulyatsiyasi (standart skript bo&apos;yicha)</div>
                    <span className={`score-pill ${scoreClass(c.salesScore)}`}>{c.salesScore}%</span>
                  </div>
                  {c.salesFeedback ? (
                    <p className="comment" style={{ whiteSpace: 'pre-wrap' }}>{c.salesFeedback}</p>
                  ) : (
                    <p className="comment">Mijoz (AI) bilan muloqot va e&apos;tirozlar bilan ishlash bahosi.</p>
                  )}
                </div>
              )}
              
              {v.aiConfig?.video?.enabled && c.videoLink && (
                <div className="ai-result" style={{ marginBottom: 16 }}>
                  <div className="rh">
                    <div className="t"><div className="icon">🎥</div>Video-intervyu</div>
                    <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>✓ Yuklangan</span>
                  </div>
                  <p className="comment">
                    Nomzodning taqdimot videosi: <a href={c.videoLink} target="_blank" rel="noreferrer" style={{ color: 'var(--violet)' }}>Videoni ko'rish</a>
                  </p>
                </div>
              )}
  
              <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn btn-ghost" onClick={() => setIsCProfileOpen(false)}>Yopish</button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </>
  );
}
