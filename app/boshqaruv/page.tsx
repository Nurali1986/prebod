'use client';

import React, { useState } from 'react';

const AI_META = {
  cvCheck: { label: "CV tahlili" },
  test: { label: "Test" },
  openQ: { label: "Ochiq savollar" },
  sales: { label: "Sotuv simulyatsiyasi" },
  video: { label: "Video-taqdimot" }
};

const initialCompanies: any[] = [];

const initialModVacancies = [
  { id: 1, title: "Frontend dasturchi (React)", company: "TechnoSoft LLC", status: "active", ai: ["cvCheck", "test", "openQ", "video"] },
  { id: 2, title: "Marketing menejeri", company: "MediaGroup Uz", status: "active", ai: ["cvCheck", "sales"] },
  { id: 3, title: "Buxgalter", company: "FinCapital", status: "pending", ai: ["cvCheck"] },
  { id: 4, title: "Omborchi", company: "RetailPro", status: "pending", ai: [] },
  { id: 5, title: "Prorab", company: "BuildMax Qurilish", status: "pending", ai: ["cvCheck", "test"] },
  { id: 6, title: "Sotuv bo'yicha mutaxassis", company: "OldStyle Trading", status: "rejected", ai: ["sales"] },
  { id: 7, title: "Backend dasturchi (Node.js)", company: "TechnoSoft LLC", status: "active", ai: ["cvCheck", "test", "sales"] },
];

const initialHrUsers: any[] = [];

const initialCandidateUsers: any[] = [];

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

const initialPayments = [
  { company: "TechnoSoft LLC", plan: "Premium", amount: "2 100 000 so'm", date: "1-avgust", status: "paid" },
  { company: "MediaGroup Uz", plan: "Standart", amount: "890 000 so'm", date: "3-avgust", status: "paid" },
  { company: "FinCapital", plan: "Standart", amount: "890 000 so'm", date: "5-avgust", status: "paid" },
  { company: "RetailPro", plan: "Bepul", amount: "0 so'm", date: "25-avgust", status: "paid" },
  { company: "OldStyle Trading", plan: "Bepul", amount: "0 so'm", date: "11-may", status: "overdue" },
  { company: "TechnoSoft LLC", plan: "Premium", amount: "2 100 000 so'm", date: "1-sentabr", status: "pending" },
  { company: "MediaGroup Uz", plan: "Standart", amount: "890 000 so'm", date: "3-sentabr", status: "pending" },
];

type DeptTest = { id: number, text: string, options: string[], correct: number };

export default function SuperadminPanel() {
  const [view, setView] = useState('dashboard');
  const [companies, setCompanies] = useState(initialCompanies);
  const [modVacancies, setModVacancies] = useState(initialModVacancies);
  const [hrUsers, setHrUsers] = useState(initialHrUsers);
  const [candidateUsers, setCandidateUsers] = useState(initialCandidateUsers);
  const [departments, setDepartments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [payments] = useState(initialPayments);
  const [simUsage, setSimUsage] = useState<any>(null);
  const [freeDailyLimit, setFreeDailyLimit] = useState<number>(10);
  const [limitDraft, setLimitDraft] = useState<string>('10');

  const loadSimUsage = React.useCallback(() => {
    fetch('/api/simulator/usage').then(r => r.json()).then(d => { if (!d.error) setSimUsage(d); });
    fetch('/api/settings').then(r => r.json()).then(d => { if (!d.error && typeof d.freeDailyLimit === 'number') { setFreeDailyLimit(d.freeDailyLimit); setLimitDraft(String(d.freeDailyLimit)); } });
  }, []);

  const saveFreeLimit = async () => {
    const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ freeDailyLimit: Number(limitDraft) }) });
    const d = await res.json();
    if (res.ok) { setFreeDailyLimit(d.freeDailyLimit); setLimitDraft(String(d.freeDailyLimit)); showToast(`Kunlik bepul limit: ${d.freeDailyLimit}`); }
    else showToast(d.error || 'Xatolik');
  };

  const setUserPlan = async (userId: number, plan: string) => {
    const res = await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: userId, plan }) });
    if (res.ok) { showToast(plan === 'premium' ? 'Premium berildi' : 'Premium olib tashlandi'); loadSimUsage(); }
    else showToast('Xatolik');
  };

  const setUserOverride = async (userId: number) => {
    const val = prompt('Ushbu foydalanuvchi uchun kunlik limit (bo\'sh qoldirilsa — standart):');
    if (val === null) return;
    const body: any = { id: userId, dailyLimitOverride: val.trim() === '' ? null : Number(val) };
    const res = await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { showToast('Limit yangilandi'); loadSimUsage(); }
    else showToast('Xatolik');
  };

  const [modTab, setModTab] = useState('pending');
  const [userTab, setUserTab] = useState('hr');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [userObj, setUserObj] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  React.useEffect(() => {
    const userStr = localStorage.getItem('ishla_user');
    if (!userStr) { window.location.href = '/?login=1'; return; }
    const u = JSON.parse(userStr);
    if (u.role !== 'superadmin') { window.location.href = '/'; return; }
    setUserObj(u);
    setIsAuthChecking(false);
  }, []);

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('ishla_user');
    window.location.href = '/';
  };

  const loadDepartments = React.useCallback(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDepartments(data); });
  }, []);

  const [coModalId, setCoModalId] = useState<number | null>(null);
  const [vacModalId, setVacModalId] = useState<number | null>(null);

  
  const loadUsers = React.useCallback(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const hr = data.filter((u: any) => u.role === 'employer').map((u: any) => ({
            id: u.id,
            name: u.firstName + ' ' + u.lastName,
            company: u.company || 'Kompaniya ko\'rsatilmagan',
            email: u.email,
            status: u.blocked ? 'blocked' : 'active'
          }));
          const cand = data.filter((u: any) => u.role === 'candidate').map((u: any) => ({
            id: u.id,
            name: u.firstName + ' ' + u.lastName,
            email: u.email,
            applications: u._count?.applications ?? 0,
            status: u.blocked ? 'blocked' : 'active'
          }));
          setHrUsers(hr);
          setCandidateUsers(cand);
          const groupedCos = hr.reduce((acc: any, curr: any) => {
            if (!acc[curr.company]) {
              acc[curr.company] = { id: Object.keys(acc).length + 1, name: curr.company, industry: 'Noma\'lum', plan: 'Bepul', status: 'active', vacancies: 0, hrUsers: 1, joined: 'Bugun' };
            } else {
              acc[curr.company].hrUsers += 1;
            }
            return acc;
          }, {});
          setCompanies(Object.values(groupedCos));
        }
      });
  }, []);

  React.useEffect(() => {
    if (isAuthChecking) return;
    loadUsers();
    loadDepartments();

    fetch('/api/candidates?all=1')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setApplications(data); });

    loadSimUsage();

    fetch('/api/vacancies?all=1')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((v: any) => {
            const aiMods = [];
            if (v.cvCheckEnabled) aiMods.push('cvCheck');
            if (v.testEnabled) aiMods.push('test');
            if (v.openQEnabled) aiMods.push('openQ');
            if (v.salesEnabled) aiMods.push('sales');
            if (v.videoEnabled) aiMods.push('video');
            return {
              id: v.id,
              title: v.title,
              company: v.employer?.company || 'Noma\'lum',
              status: v.status,
              ai: aiMods
            };
          });
          setModVacancies(formatted);
        }
      });
  }, [isAuthChecking, loadUsers, loadDepartments, loadSimUsage]);
  
  const [hrModalOpen, setHrModalOpen] = useState(false);
  const [hrDraft, setHrDraft] = useState({ name: '', email: '', company: '' });
  const [hrErr, setHrErr] = useState(false);

  const [candModalOpen, setCandModalOpen] = useState(false);
  const [candDraft, setCandDraft] = useState({ name: '', email: '', phone: '' });
  const [candErr, setCandErr] = useState(false);

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptDraft, setDeptDraft] = useState('');
  const [deptErr, setDeptErr] = useState(false);

  const [currentDeptId, setCurrentDeptId] = useState<number | null>(null);
  const [deptTestsDraft, setDeptTestsDraft] = useState<DeptTest[]>([]);
  const [deptOpenQsDraft, setDeptOpenQsDraft] = useState<any[]>([]);

  const switchView = (v: string) => {
    setView(v);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, [string, string]> = { active: ['active', "Faol"], pending: ['pending', "Kutilmoqda"], blocked: ['blocked', "Bloklangan"], rejected: ['blocked', "Rad etilgan"], draft: ['pending', "Qoralama"], closed: ['blocked', "Yopilgan"] };
    const mapped = map[status] || ['pending', status || "Noma'lum"];
    const [cls, label] = mapped;
    return <span className={`badge ${cls}`}><span className="badge-dot"></span>{label}</span>;
  };

  const payStatusBadge = (status: string) => {
    const map: Record<string, [string, string]> = { paid: ['active', "To'langan"], pending: ['pending', "Kutilmoqda"], overdue: ['blocked', "Muddati o'tgan"] };
    const [cls, label] = map[status];
    return <span className={`badge ${cls}`}><span className="badge-dot"></span>{label}</span>;
  };

  const setCoStatus = (id: number, status: string) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, status } : c));
    const c = companies.find(x => x.id === id);
    if (c) showToast(status === 'active' ? `${c.name} faollashtirildi` : `${c.name} bloklandi`);
  };

  const setVacStatus = async (id: number, status: string) => {
    const v = modVacancies.find(x => x.id === id);
    try {
      const res = await fetch('/api/vacancies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) { showToast('Xatolik yuz berdi'); return; }
      setModVacancies(modVacancies.map(x => x.id === id ? { ...x, status } : x));
      if (v) showToast(status === 'active' ? `"${v.title}" tasdiqlandi va chop etildi` : `"${v.title}" rad etildi`);
    } catch { showToast('Tarmoq xatosi'); }
  };

  const toggleUserStatus = async (type: string, idx: number) => {
    const list = type === 'hr' ? hrUsers : candidateUsers;
    const user = list[idx];
    if (!user?.id) return;
    const nextBlocked = user.status !== 'blocked';
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, blocked: nextBlocked }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Xatolik yuz berdi');
        return;
      }
      const newList = [...list];
      newList[idx] = { ...user, status: nextBlocked ? 'blocked' : 'active' };
      if (type === 'hr') setHrUsers(newList); else setCandidateUsers(newList);
      showToast(nextBlocked ? `${user.name} bloklandi` : `${user.name} blokdan chiqarildi`);
    } catch { showToast('Tarmoq xatosi'); }
  };

  const submitAddHr = () => {
    if (!hrDraft.name || !hrDraft.email || !hrDraft.company) {
      setHrErr(true);
      return;
    }
    setHrUsers([{ name: hrDraft.name, company: hrDraft.company, email: hrDraft.email, status: 'active' }, ...hrUsers]);
    setCompanies(companies.map(c => c.name === hrDraft.company ? { ...c, hrUsers: c.hrUsers + 1 } : c));
    setHrModalOpen(false);
    setUserTab('hr');
    setView('users');
    showToast(`${hrDraft.name} HR sifatida qo'shildi`);
  };

  const submitAddCandidate = () => {
    if (!candDraft.name || !candDraft.email) {
      setCandErr(true);
      return;
    }
    setCandidateUsers([{ name: candDraft.name, email: candDraft.email, applications: 0, status: 'active' }, ...candidateUsers]);
    setCandModalOpen(false);
    setUserTab('candidates');
    setView('users');
    showToast(`${candDraft.name} nomzod sifatida qo'shildi`);
  };

  const submitAddDept = async () => {
    if (!deptDraft.trim()) {
      setDeptErr(true);
      return;
    }
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: deptDraft.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Xatolik yuz berdi');
        return;
      }
      loadDepartments();
      setDeptModalOpen(false);
      showToast(`"${deptDraft}" bo'limi qo'shildi`);
    } catch { showToast('Tarmoq xatosi'); }
  };

  const deleteDept = async (id: number) => {
    const d = departments.find(x => x.id === id);
    if (!confirm(`"${d?.name}" bo'limini o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/departments?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Xatolik yuz berdi');
        return;
      }
      loadDepartments();
      showToast(`"${d?.name}" o'chirildi`);
    } catch { showToast('Tarmoq xatosi'); }
  };

  const openDeptDetail = (id: number) => {
    setCurrentDeptId(id);
    const d = departments.find(x => x.id === id);
    if (d) {
      setDeptTestsDraft(JSON.parse(JSON.stringify(d.tests)));
      setDeptOpenQsDraft(JSON.parse(JSON.stringify(d.openQs || [])));
      switchView('dept-detail');
    }
  };

  const addDeptQuestion = () => {
    setDeptTestsDraft([...deptTestsDraft, { id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const updateDeptTestDraft = (idx: number, updates: Partial<DeptTest>) => {
    const newList = [...deptTestsDraft];
    newList[idx] = { ...newList[idx], ...updates };
    setDeptTestsDraft(newList);
  };

  const updateDeptTestOption = (qIdx: number, optIdx: number, val: string) => {
    const newList = [...deptTestsDraft];
    newList[qIdx].options[optIdx] = val;
    setDeptTestsDraft(newList);
  };

  const removeDeptQuestion = (idx: number) => {
    const newList = [...deptTestsDraft];
    newList.splice(idx, 1);
    setDeptTestsDraft(newList);
  };

  const addDeptOpenQ = () => {
    setDeptOpenQsDraft([...deptOpenQsDraft, { id: Date.now(), text: '' }]);
  };

  const updateDeptOpenQ = (idx: number, text: string) => {
    const newList = [...deptOpenQsDraft];
    newList[idx] = { ...newList[idx], text };
    setDeptOpenQsDraft(newList);
  };

  const removeDeptOpenQ = (idx: number) => {
    const newList = [...deptOpenQsDraft];
    newList.splice(idx, 1);
    setDeptOpenQsDraft(newList);
  };

  const saveDeptTests = async () => {
    const d = departments.find(x => x.id === currentDeptId);
    try {
      const res = await fetch('/api/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentDeptId,
          tests: deptTestsDraft.map(({ text, options, correct }) => ({ text, options, correct })),
          openQs: deptOpenQsDraft.map((q: any) => ({ text: q.text })),
        }),
      });
      if (!res.ok) { showToast('Xatolik yuz berdi'); return; }
      loadDepartments();
      showToast(`${d?.name} uchun savollar saqlandi`);
      switchView('departments');
    } catch { showToast('Tarmoq xatosi'); }
  };

  const activeCo = companies.filter(c => c.status === 'active').length;
  const pendingCo = companies.filter(c => c.status === 'pending').length;
  const activeVac = modVacancies.filter(v => v.status === 'active').length;
  const pendingVac = modVacancies.filter(v => v.status === 'pending').length;
  const totalCandidates = candidateUsers.length;

  // Real AI-activity counts derived from actual applications.
  const aiStats = {
    cv: applications.filter(a => a.cvScore != null).length,
    test: applications.filter(a => a.testScore != null).length,
    open: applications.filter(a => a.openAnswers && a.openAnswers.length > 0).length,
    sales: applications.filter(a => a.salesScore != null).length,
    video: applications.filter(a => a.videoLink).length,
  };
  const stageLabel: Record<string, string> = { new: 'Yangi', review: 'Ko\'rib chiqilmoqda', interview: 'Suhbat', offer: 'Taklif', hired: 'Qabul qilindi', rejected: 'Rad etildi' };

  if (isAuthChecking) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yuklanmoqda...</div>;

  const currentCo = companies.find(c => c.id === coModalId);
  const coVacs = currentCo ? modVacancies.filter(v => v.company === currentCo.name) : [];
  const currentVac = modVacancies.find(v => v.id === vacModalId);
  const currentDept = departments.find(d => d.id === currentDeptId);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
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
        .app{display:grid;grid-template-columns:236px 1fr;min-height:100vh;}
        .sidebar{background:var(--ink);color:#EFEDE4;padding:24px 18px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;}
        .brand{display:flex;align-items:center;gap:10px;padding:0 6px 26px 6px;border-bottom:1px solid rgba(239,237,228,0.14);margin-bottom:22px;}
        .brand-mark{width:30px;height:30px;border-radius:8px;background:var(--danger);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:600;color:#fff;font-size:15px;}
        .brand-name{font-family:var(--font-display);font-size:19px;font-weight:600;}
        .brand-tag{font-size:10.5px;color:#9B9A8F;margin-top:-3px;letter-spacing:.03em;}
        .nav{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;flex:1;}
        .nav-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:8px;font-size:14px;color:#C9C6BB;cursor:pointer;transition:background .15s ease, color .15s ease;user-select:none;}
        .nav-item svg{width:17px;height:17px;flex-shrink:0;opacity:.85;}
        .nav-item:hover{background:rgba(239,237,228,0.08);color:#EFEDE4;}
        .nav-item.active{background:var(--accent);color:var(--accent-ink);font-weight:600;}
        .nav-item.active svg{opacity:1;}
        .nav-item .flag{margin-left:auto;background:var(--danger);color:#fff;font-size:10px;font-family:var(--font-mono);border-radius:999px;padding:1px 6px;}
        .sidebar-foot{border-top:1px solid rgba(239,237,228,0.14);padding-top:14px;display:flex;align-items:center;gap:10px;}
        .avatar-sm{width:32px;height:32px;border-radius:50%;background:#4A2D6B;color:#EFEDE4;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;}
        .sidebar-foot .who{font-size:12.5px;line-height:1.35;}
        .sidebar-foot .who b{display:block;font-size:13px;color:#EFEDE4;}
        .sidebar-foot .who span{color:#9B9A8F;}
        .main{padding:30px 40px 60px;max-width:1220px;}
        .pagehead{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:26px;gap:20px;}
        .pagehead h1{font-family:var(--font-display);font-size:29px;font-weight:600;margin:0 0 4px;}
        .pagehead p{margin:0;color:var(--muted);font-size:14px;}
        .btn{font-family:var(--font-body);font-size:13.5px;font-weight:600;border-radius:8px;padding:9px 15px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;}
        .btn-primary{background:var(--accent);color:var(--accent-ink);}
        .btn-primary:hover{background:var(--accent-deep);color:#fff;}
        .btn-ghost{background:transparent;border-color:var(--line-strong);color:var(--ink);}
        .btn-ghost:hover{background:#fff;}
        .btn-danger{background:var(--danger-bg);color:var(--danger);}
        .btn-danger:hover{background:var(--danger);color:#fff;}
        .btn-success{background:var(--success-bg);color:var(--success);}
        .btn-success:hover{background:var(--success);color:#fff;}
        .btn-sm{padding:6px 11px;font-size:12px;}
        .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
        .stat-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px;}
        .stat-card .label{font-size:12.5px;color:var(--muted);margin-bottom:10px;}
        .stat-card .num{font-family:var(--font-mono);font-size:26px;font-weight:500;color:var(--ink);}
        .stat-card .delta{font-size:12px;margin-top:6px;font-family:var(--font-mono);}
        .delta.up{color:var(--success);}
        .delta.flat{color:var(--muted);}
        .delta.warn{color:var(--danger);}
        .conveyor-panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px 26px 20px;margin-bottom:28px;}
        .conveyor-panel .panel-title{font-family:var(--font-display);font-size:16px;font-weight:600;margin:0 0 3px;}
        .conveyor-panel .panel-sub{font-size:12.5px;color:var(--muted);margin:0 0 22px;}
        .conveyor{display:flex;align-items:flex-start;position:relative;}
        .conveyor::before{content:"";position:absolute;top:17px;left:17px;right:17px;height:0;border-top:2px dashed var(--line-strong);z-index:0;}
        .stage{flex:1;display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;}
        .stage .node{width:38px;height:38px;border-radius:50%;background:var(--violet-bg);border:2px solid var(--violet);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--violet);margin-bottom:10px;}
        .stage .stage-label{font-size:11.5px;color:var(--ink);font-weight:600;text-align:center;line-height:1.3;}
        .section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
        .section-title h2{font-family:var(--font-display);font-size:17px;font-weight:600;margin:0;}
        .section-title a{font-size:12.5px;color:var(--accent-deep);text-decoration:none;font-weight:600;cursor:pointer;}
        .data-table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;}
        .data-table th{text-align:left;font-size:11.5px;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted);font-weight:600;padding:12px 16px;border-bottom:1px solid var(--line);}
        .data-table td{padding:13px 16px;font-size:13.5px;border-bottom:1px solid var(--line);vertical-align:middle;}
        .data-table tr:last-child td{border-bottom:none;}
        .row-title{font-weight:600;color:var(--ink);}
        .row-meta{font-size:12px;color:var(--muted);margin-top:2px;}
        .badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:600;}
        .badge.active{background:var(--success-bg);color:var(--success);}
        .badge.pending{background:var(--accent-bg);color:var(--accent-deep);}
        .badge.blocked{background:var(--danger-bg);color:var(--danger);}
        .badge.plan{background:var(--violet-bg);color:var(--violet);}
        .badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;}
        .count-mono{font-family:var(--font-mono);font-size:13.5px;}
        .row-actions{display:flex;gap:6px;}
        .tabs{display:flex;gap:4px;margin-bottom:18px;border-bottom:1px solid var(--line);}
        .tab{padding:10px 16px;font-size:13.5px;font-weight:600;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;}
        .tab:hover{color:var(--ink);}
        .tab.active{color:var(--ink);border-bottom-color:var(--accent);}
        .plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
        .plan-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px 22px 20px;}
        .plan-card.highlight{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);}
        .plan-card h3{font-family:var(--font-display);font-size:18px;font-weight:600;margin:0 0 4px;}
        .plan-card .price{font-family:var(--font-mono);font-size:22px;color:var(--ink);margin:10px 0 14px;}
        .plan-card .price span{font-size:12px;color:var(--muted);font-family:var(--font-body);}
        .plan-card ul{list-style:none;padding:0;margin:0 0 16px;display:flex;flex-direction:column;gap:9px;}
        .plan-card li{font-size:12.5px;color:var(--ink-soft);display:flex;gap:8px;align-items:flex-start;}
        .plan-card li svg{width:14px;height:14px;color:var(--success);flex-shrink:0;margin-top:1px;}
        .plan-card .co-count{font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:12px;margin-top:2px;}
        .plan-card .co-count b{font-family:var(--font-mono);color:var(--ink);font-weight:500;}
        
        .back-link{font-size:12.5px;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;gap:5px;margin-bottom:14px;}
        .back-link:hover{color:var(--ink);}
        .dept-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
        .dept-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px;}
        .dept-card h3{font-family:var(--font-display);font-size:16px;font-weight:600;margin:0 0 6px;}
        .dept-card .count{font-size:12.5px;color:var(--muted);margin-bottom:14px;}
        .dept-card .actions{display:flex;gap:8px;}
        .q-row{border:1px solid var(--line);border-radius:8px;padding:11px 12px;margin-bottom:9px;background:#F9FAF8;}
        .q-row-top{display:flex;gap:8px;align-items:center;}
        .q-row-top input{flex:1;font-family:var(--font-body);font-size:13.5px;border:1px solid var(--line-strong);border-radius:8px;padding:9px 12px;background:#fff;}
        .opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px;}
        .opt-line{display:flex;align-items:center;gap:6px;}
        .opt-line input[type=radio]{margin:0;accent-color:var(--violet);flex-shrink:0;}
        .opt-line input[type=text]{padding:7px 9px;font-size:12.5px;border:1px solid var(--line-strong);border-radius:7px;background:#fff;flex:1;}
        .rm-x{width:26px;height:26px;border-radius:6px;border:1px solid var(--line-strong);background:#fff;color:var(--muted);cursor:pointer;flex-shrink:0;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center;}
        .rm-x:hover{color:var(--danger);border-color:var(--danger);}
        .add-q-btn{font-size:12.5px;font-weight:600;color:var(--violet);background:var(--violet-bg);border:none;border-radius:7px;padding:8px 12px;cursor:pointer;}

        .settings-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px 26px;margin-bottom:16px;}
        .settings-card h3{font-family:var(--font-display);font-size:16px;font-weight:600;margin:0 0 16px;}
        .setting-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--line);gap:20px;}
        .setting-row:last-child{border-bottom:none;}
        .setting-row .info b{display:block;font-size:13.5px;margin-bottom:2px;}
        .setting-row .info span{font-size:12px;color:var(--muted);}
        .setting-row input[type=number], .setting-row input[type=text]{width:90px;font-family:var(--font-mono);font-size:13px;border:1px solid var(--line-strong);border-radius:7px;padding:7px 10px;background:#F9FAF8;text-align:right;}
        .switch{position:relative;display:inline-block;width:38px;height:22px;flex-shrink:0;}
        .switch input{opacity:0;width:0;height:0;position:absolute;}
        .slider-tog{position:absolute;cursor:pointer;inset:0;background:var(--line-strong);transition:.18s;border-radius:999px;}
        .slider-tog::before{content:"";position:absolute;height:16px;width:16px;left:3px;top:3px;background:#fff;transition:.18s;border-radius:50%;}
        .switch input:checked + .slider-tog{background:var(--violet);}
        .switch input:checked + .slider-tog::before{transform:translateX(16px);}
        .overlay{position:fixed;inset:0;background:rgba(20,33,61,0.45);display:none;align-items:flex-start;justify-content:center;padding:44px 20px;overflow:auto;z-index:50;}
        .overlay.open{display:flex;}
        .modal{background:var(--card);border-radius:14px;width:100%;max-width:600px;padding:26px 28px 24px;}
        .modal h2{font-family:var(--font-display);font-size:19px;font-weight:600;margin:0 0 4px;}
        .modal .sub{font-size:13px;color:var(--muted);margin:0 0 18px;}
        .modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;}
        .kv-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px;}
        .kv-row:last-child{border-bottom:none;}
        .kv-row .k{color:var(--muted);}
        .kv-row .v{font-weight:600;}
        .field{margin-bottom:14px;}
        .field label{display:block;font-size:12.5px;font-weight:600;color:var(--ink-soft);margin-bottom:6px;}
        .field input,.field select{width:100%;font-family:var(--font-body);font-size:13.5px;border:1px solid var(--line-strong);border-radius:8px;padding:9px 12px;background:#F9FAF8;color:var(--ink);}
        .field input:focus,.field select:focus{outline:2px solid var(--accent);outline-offset:1px;background:#fff;}
        .err-note{font-size:12px;color:var(--danger);margin:-4px 0 10px;display:none;}
        .err-note.show{display:block;}
        .ai-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10.5px;font-weight:600;background:var(--violet-bg);color:var(--violet);}
        .ai-pill-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;}
        .toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--ink);color:#EFEDE4;padding:12px 20px;border-radius:8px;font-size:13.5px;opacity:0;transition:opacity .2s ease, transform .2s ease;z-index:60;pointer-events:none;}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        .mobile-topbar{display:none;}
        .sidebar-backdrop{display:none;}
        @media(max-width:900px){
          .app{grid-template-columns:1fr;}
          .mobile-topbar{display:flex;align-items:center;gap:12px;background:var(--ink);color:#EFEDE4;padding:0 16px;height:58px;position:sticky;top:0;z-index:45;}
          .mobile-topbar .hbtn{background:none;border:none;color:#EFEDE4;cursor:pointer;padding:6px;display:flex;}
          .mobile-topbar .brand-mark{width:26px;height:26px;font-size:13px;}
          .mobile-topbar .brand-name{font-size:16px;}
          .sidebar{position:fixed;left:0;top:0;bottom:0;width:236px;z-index:47;transform:translateX(-105%);transition:transform .22s ease;}
          .sidebar.open{transform:translateX(0);}
          .sidebar-backdrop.open{display:block;position:fixed;inset:0;background:rgba(20,33,61,0.45);z-index:46;}
          .stat-row{grid-template-columns:repeat(2,1fr);}
          .plan-grid{grid-template-columns:1fr;}
          .dept-grid{grid-template-columns:1fr;}
        }
      ` }} />

      <div className="mobile-topbar">
        <button className="hbtn" onClick={() => setSidebarOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
        <div className="brand-mark">R</div>
        <div className="brand-name" style={{ fontFamily: "'Fraunces',serif", fontWeight: 600 }}>Repza · Superadmin</div>
      </div>
      <div className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      <div className="app">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="brand">
            <div className="brand-mark">R</div>
            <div><div className="brand-name">Repza</div><div className="brand-tag">Superadmin</div></div>
          </div>
          <ul className="nav">
            <li className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => switchView('dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
              Boshqaruv paneli
            </li>
            <li className={`nav-item ${view === 'companies' ? 'active' : ''}`} onClick={() => switchView('companies')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21V7l9-4 9 4v14" /><path d="M9 21V12h6v9" /></svg>
              Kompaniyalar
            </li>
            <li className={`nav-item ${view === 'moderation' ? 'active' : ''}`} onClick={() => switchView('moderation')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              Vakansiyalar
              <span className="flag">{pendingVac}</span>
            </li>
            <li className={`nav-item ${view === 'users' ? 'active' : ''}`} onClick={() => switchView('users')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17.5" cy="8.5" r="2.4" /><path d="M15.5 14.3c2.6.4 4.5 2.3 4.5 5.2" /></svg>
              Foydalanuvchilar
            </li>
            <li className={`nav-item ${view === 'applications' ? 'active' : ''}`} onClick={() => switchView('applications')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
              Arizalar
              <span className="flag" style={{ background: 'var(--violet)' }}>{applications.length}</span>
            </li>
            <li className={`nav-item ${view === 'departments' || view === 'dept-detail' ? 'active' : ''}`} onClick={() => switchView('departments')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
              Bo'limlar
            </li>
            <li className={`nav-item ${view === 'ai' ? 'active' : ''}`} onClick={() => switchView('ai')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /><circle cx="12" cy="12" r="4" /></svg>
              AI monitoring
            </li>
            <li className={`nav-item ${view === 'plans' ? 'active' : ''}`} onClick={() => switchView('plans')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
              Tariflar
            </li>
            <li className={`nav-item ${view === 'payments' ? 'active' : ''}`} onClick={() => switchView('payments')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              To'lovlar
            </li>
            <li className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => switchView('settings')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              Sozlamalar
            </li>
          </ul>
          <div className="sidebar-foot">
            <div className="avatar-sm">{userObj ? `${userObj.firstName?.charAt(0) || ''}${userObj.lastName?.charAt(0) || ''}`.toUpperCase() : 'SA'}</div>
            <div className="who"><b>{userObj ? `${userObj.firstName} ${userObj.lastName}` : 'Superadmin'}</b><span>Superadmin · Repza</span></div>
            <button onClick={logout} title="Chiqish" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9B9A8F', cursor: 'pointer', padding: 4 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </aside>

        <main className="main">
          {view === 'dashboard' && (
            <div>
              <div className="pagehead"><div><h1>Platforma holati</h1><p>Barcha kompaniyalar va nomzodlar bo'yicha umumiy ko'rinish.</p></div></div>
              <div className="stat-row">
                <div className="stat-card"><div className="label">Faol kompaniyalar</div><div className="num">{activeCo}</div><div className={`delta ${pendingCo ? 'warn' : 'flat'}`}>{pendingCo} ta tasdiqlash kutmoqda</div></div>
                <div className="stat-card"><div className="label">Faol vakansiyalar</div><div className="num">{activeVac}</div><div className={`delta ${pendingVac ? 'warn' : 'flat'}`}>{pendingVac} ta moderatsiyada</div></div>
                <div className="stat-card"><div className="label">Jami nomzodlar</div><div className="num">{totalCandidates}</div><div className="delta flat">Ro&apos;yxatdan o&apos;tgan</div></div>
                <div className="stat-card"><div className="label">Jami arizalar</div><div className="num">{applications.length}</div><div className="delta flat">Barcha vakansiyalar bo&apos;yicha</div></div>
              </div>

              <div className="conveyor-panel">
                <p className="panel-title">AI funksiyalari faolligi</p>
                <p className="panel-sub">Platforma bo'ylab nomzodlar tomonidan bajarilgan AI bosqichlari soni</p>
                <div className="conveyor">
                  <div className="stage"><div className="node">{aiStats.cv}</div><div className="stage-label">CV tahlillari</div></div>
                  <div className="stage"><div className="node">{aiStats.test}</div><div className="stage-label">Test topshirishlar</div></div>
                  <div className="stage"><div className="node">{aiStats.open}</div><div className="stage-label">Ochiq savollar</div></div>
                  <div className="stage"><div className="node">{aiStats.sales}</div><div className="stage-label">Sotuv simulyatsiyasi</div></div>
                  <div className="stage"><div className="node">{aiStats.video}</div><div className="stage-label">Video yuklamalar</div></div>
                </div>
              </div>

              <div className="section-title"><h2>So'nggi qo'shilgan kompaniyalar</h2><a onClick={() => switchView('companies')}>Barchasini ko'rish →</a></div>
              <table className="data-table" style={{ marginBottom: 28 }}>
                <thead><tr><th>Kompaniya</th><th>Tarif</th><th>Holat</th><th>Qo'shilgan sana</th></tr></thead>
                <tbody>
                  {companies.slice(0, 4).map(c => (
                    <tr key={c.id}>
                      <td><div className="row-title">{c.name}</div><div className="row-meta">{c.industry}</div></td>
                      <td><span className="badge plan">{c.plan}</span></td>
                      <td>{statusBadge(c.status)}</td>
                      <td>{c.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="section-title"><h2>Ko'rib chiqilishi kerak</h2><a onClick={() => switchView('moderation')}>Barchasini ko'rish →</a></div>
              <table className="data-table">
                <thead><tr><th>Vakansiya</th><th>Kompaniya</th><th>Holat</th><th>Amallar</th></tr></thead>
                <tbody>
                  {modVacancies.filter(v => v.status === 'pending').slice(0, 4).length ? (
                    modVacancies.filter(v => v.status === 'pending').slice(0, 4).map(v => (
                      <tr key={v.id}>
                        <td><div className="row-title">{v.title}</div></td>
                        <td>{v.company}</td>
                        <td>{statusBadge(v.status)}</td>
                        <td className="row-actions">
                          <button className="btn btn-success btn-sm" onClick={() => setVacStatus(v.id, 'active')}>Tasdiqlash</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setVacStatus(v.id, 'rejected')}>Rad etish</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 22 }}>Ko'rib chiqilishi kerak bo'lgan e'lonlar yo'q.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {view === 'companies' && (
            <div>
              <div className="pagehead"><div><h1>Kompaniyalar</h1><p>Platformadagi barcha ish beruvchilar.</p></div></div>
              <table className="data-table">
                <thead><tr><th>Kompaniya</th><th>Tarif</th><th>Vakansiyalar</th><th>HR foydalanuvchilar</th><th>Holat</th><th>Amallar</th></tr></thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id}>
                      <td><div className="row-title">{c.name}</div><div className="row-meta">{c.industry} · Qo'shilgan: {c.joined}</div></td>
                      <td><span className="badge plan">{c.plan}</span></td>
                      <td className="count-mono">{c.vacancies}</td>
                      <td className="count-mono">{c.hrUsers}</td>
                      <td>{statusBadge(c.status)}</td>
                      <td className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setCoModalId(c.id)}>Ko'rish</button>
                        {c.status === 'pending' && <button className="btn btn-success btn-sm" onClick={() => setCoStatus(c.id, 'active')}>Tasdiqlash</button>}
                        {c.status === 'active' && <button className="btn btn-danger btn-sm" onClick={() => setCoStatus(c.id, 'blocked')}>Bloklash</button>}
                        {c.status === 'blocked' && <button className="btn btn-success btn-sm" onClick={() => setCoStatus(c.id, 'active')}>Faollashtirish</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'moderation' && (
            <div>
              <div className="pagehead"><div><h1>Vakansiyalar moderatsiyasi</h1><p>Barcha e'lonlar va ko'rib chiqilishi kerak bo'lganlar.</p></div></div>
              <div className="tabs">
                <div className={`tab ${modTab === 'pending' ? 'active' : ''}`} onClick={() => setModTab('pending')}>Ko'rib chiqilmoqda</div>
                <div className={`tab ${modTab === 'all' ? 'active' : ''}`} onClick={() => setModTab('all')}>Barchasi</div>
              </div>
              <table className="data-table">
                <thead><tr><th>Vakansiya</th><th>Kompaniya</th><th>AI talablari</th><th>Holat</th><th>Amallar</th></tr></thead>
                <tbody>
                  {modVacancies.filter(v => modTab === 'pending' ? v.status === 'pending' : true).length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 26 }}>Hech narsa topilmadi.</td></tr>
                  ) : (
                    modVacancies.filter(v => modTab === 'pending' ? v.status === 'pending' : true).map(v => (
                      <tr key={v.id}>
                        <td><div className="row-title">{v.title}</div></td>
                        <td>{v.company}</td>
                        <td>{v.ai.length ? v.ai.map(k => <span key={k} className="ai-pill">{AI_META[k as keyof typeof AI_META].label}</span>) : <span className="row-meta">—</span>}</td>
                        <td>{statusBadge(v.status)}</td>
                        <td className="row-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => setVacModalId(v.id)}>Ko'rish</button>
                          {v.status === 'pending' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => setVacStatus(v.id, 'active')}>Tasdiqlash</button>
                              <button className="btn btn-danger btn-sm" onClick={() => setVacStatus(v.id, 'rejected')}>Rad etish</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {view === 'users' && (
            <div>
              <div className="pagehead">
                <div><h1>Foydalanuvchilar</h1><p>HR foydalanuvchilar va nomzodlar.</p></div>
                <div>
                  {userTab === 'hr' ? (
                    <button className="btn btn-primary" onClick={() => { setHrDraft({ name: '', email: '', company: companies[0]?.name || '' }); setHrErr(false); setHrModalOpen(true); }}>+ HR qo'shish</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => { setCandDraft({ name: '', email: '', phone: '' }); setCandErr(false); setCandModalOpen(true); }}>+ Nomzod qo'shish</button>
                  )}
                </div>
              </div>
              <div className="tabs">
                <div className={`tab ${userTab === 'hr' ? 'active' : ''}`} onClick={() => setUserTab('hr')}>HR foydalanuvchilar</div>
                <div className={`tab ${userTab === 'candidates' ? 'active' : ''}`} onClick={() => setUserTab('candidates')}>Nomzodlar</div>
              </div>
              <table className="data-table">
                {userTab === 'hr' ? (
                  <>
                    <thead><tr><th>Ism</th><th>Kompaniya</th><th>Email</th><th>Holat</th><th>Amallar</th></tr></thead>
                    <tbody>
                      {hrUsers.map((u, i) => (
                        <tr key={i}>
                          <td className="row-title">{u.name}</td><td>{u.company}</td><td>{u.email}</td><td>{statusBadge(u.status)}</td>
                          <td className="row-actions">
                            {u.status !== 'blocked' ? <button className="btn btn-danger btn-sm" onClick={() => toggleUserStatus('hr', i)}>Bloklash</button> : <button className="btn btn-success btn-sm" onClick={() => toggleUserStatus('hr', i)}>Blokdan chiqarish</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead><tr><th>Ism</th><th>Email</th><th>Arizalar soni</th><th>Holat</th><th>Amallar</th></tr></thead>
                    <tbody>
                      {candidateUsers.map((u, i) => (
                        <tr key={i}>
                          <td className="row-title">{u.name}</td><td>{u.email}</td><td className="count-mono">{u.applications}</td><td>{statusBadge(u.status)}</td>
                          <td className="row-actions">
                            {u.status !== 'blocked' ? <button className="btn btn-danger btn-sm" onClick={() => toggleUserStatus('candidate', i)}>Bloklash</button> : <button className="btn btn-success btn-sm" onClick={() => toggleUserStatus('candidate', i)}>Blokdan chiqarish</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          )}

          {view === 'applications' && (
            <div>
              <div className="pagehead"><div><h1>Arizalar</h1><p>Platformadagi barcha vakansiyalarga tushgan arizalar va AI natijalari.</p></div></div>
              <table className="data-table">
                <thead><tr><th>Nomzod</th><th>Vakansiya</th><th>Kompaniya</th><th>CV</th><th>Test</th><th>Sotuv</th><th>Video</th><th>Bosqich</th></tr></thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 26 }}>Hali arizalar yo'q.</td></tr>
                  ) : applications.map((a, i) => (
                    <tr key={i}>
                      <td><div className="row-title">{a.name}</div><div className="row-meta">{a.candidateUser?.email || a.role}</div></td>
                      <td>{a.vacancy?.title || '—'}</td>
                      <td>{a.vacancy?.employer?.company || '—'}</td>
                      <td className="count-mono">{a.cvScore != null ? a.cvScore + '%' : '—'}</td>
                      <td className="count-mono">{a.testScore != null ? a.testScore + '%' : '—'}</td>
                      <td className="count-mono">{a.salesScore != null ? a.salesScore + '%' : '—'}</td>
                      <td>{a.videoLink ? <a href={a.videoLink} target="_blank" rel="noreferrer" style={{ color: 'var(--violet)', fontWeight: 600 }}>Ko'rish</a> : '—'}</td>
                      <td><span className={`badge ${a.stage === 'rejected' ? 'blocked' : a.stage === 'hired' ? 'active' : 'pending'}`}><span className="badge-dot"></span>{stageLabel[a.stage] || a.stage}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'departments' && (
            <div>
              <div className="pagehead">
                <div><h1>Bo'limlar</h1><p>Vakansiya yaratishda HR ko'radigan sohalar va ularning standart test banki.</p></div>
                <button className="btn btn-primary" onClick={() => { setDeptDraft(''); setDeptErr(false); setDeptModalOpen(true); }}>+ Yangi bo'lim qo'shish</button>
              </div>
              <div className="dept-grid">
                {departments.map(d => (
                  <div key={d.id} className="dept-card">
                    <h3>{d.name}</h3>
                    <div className="count">{d.tests.length} ta test savol, {d.openQs?.length || 0} ta ochiq savol</div>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openDeptDetail(d.id)}>Savollarni boshqarish</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteDept(d.id)}>O'chirish</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'dept-detail' && currentDept && (
            <div>
              <div className="back-link" onClick={() => switchView('departments')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
                Bo'limlarga qaytish
              </div>
              <div className="pagehead"><div><h1>{currentDept.name} — standart testlar</h1><p>Bu yerda qo'shilgan savollar HR "Yangi vakansiya" yaratganda ushbu bo'lim uchun standart test sifatida tanlab olinadi.</p></div></div>
              
              <div>
                {deptTestsDraft.map((q, qIdx) => (
                  <div key={q.id} className="q-row">
                    <div className="q-row-top">
                      <input type="text" placeholder="Savol matni" value={q.text} onChange={e => updateDeptTestDraft(qIdx, { text: e.target.value })} />
                      <button className="rm-x" onClick={() => removeDeptQuestion(qIdx)}>✕</button>
                    </div>
                    <div className="opts">
                      {[0, 1, 2, 3].map(oi => (
                        <label key={oi} className="opt-line">
                          <input type="radio" name={`dcorrect-${q.id}`} value={oi} checked={q.correct === oi} onChange={() => updateDeptTestDraft(qIdx, { correct: oi })} />
                          <input type="text" placeholder={`${String.fromCharCode(65 + oi)} varianti`} value={q.options[oi]} onChange={e => updateDeptTestOption(qIdx, oi, e.target.value)} />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="add-q-btn" onClick={addDeptQuestion} style={{ marginBottom: 30 }}>+ Test savoli qo'shish</button>

              <div className="section-title"><h3>Standart ochiq savollar</h3><p style={{fontSize: 13, color: 'var(--muted)', marginBottom: 16}}>Nomzodlarga beriladigan ochiq savollar ro'yxati.</p></div>
              <div>
                {deptOpenQsDraft.map((q, qIdx) => (
                  <div key={q.id} className="q-row">
                    <div className="q-row-top">
                      <input type="text" placeholder="Ochiq savol matni" value={q.text} onChange={e => updateDeptOpenQ(qIdx, e.target.value)} />
                      <button className="rm-x" onClick={() => removeDeptOpenQ(qIdx)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="add-q-btn" onClick={addDeptOpenQ}>+ Ochiq savol qo'shish</button>

              <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: 18 }}><button className="btn btn-primary" onClick={saveDeptTests}>Saqlash</button></div>
            </div>
          )}

          {view === 'ai' && (
            <div>
              <div className="pagehead"><div><h1>AI monitoring</h1><p>AI orqali bajarilgan tekshiruvlar statistikasi, simulyator limiti va foydalanuvchilar sarfi.</p></div></div>

              <div className="settings-card">
                <h3>Sotuv simulyatori — bepul kunlik limit</h3>
                <div className="setting-row">
                  <div className="info"><b>Har bir foydalanuvchiga kuniga bepul suhbatlar</b><span>Bu limitdan oshsa, foydalanuvchi Premiumga o&apos;tishi so&apos;raladi. Toshkent vaqti bilan yarim tunda yangilanadi.</span></div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="number" min={0} max={1000} value={limitDraft} onChange={e => setLimitDraft(e.target.value)} style={{ width: 80 }} />
                    <button className="btn btn-primary btn-sm" onClick={saveFreeLimit}>Saqlash</button>
                  </div>
                </div>
              </div>

              {simUsage && (
                <div className="stat-row">
                  <div className="stat-card"><div className="label">Bugungi suhbatlar</div><div className="num">{simUsage.totalSessions}</div><div className="delta flat">{simUsage.day}</div></div>
                  <div className="stat-card"><div className="label">Bugungi tokenlar</div><div className="num" style={{ fontSize: 20 }}>{Number(simUsage.totalTokens).toLocaleString('ru-RU').replace(/,/g, ' ')}</div><div className="delta flat">LLM sarfi</div></div>
                  <div className="stat-card"><div className="label">Faol foydalanuvchilar (bugun)</div><div className="num">{simUsage.users.length}</div><div className="delta flat">Simulyatordan</div></div>
                  <div className="stat-card"><div className="label">Joriy bepul limit</div><div className="num">{freeDailyLimit}</div><div className="delta flat">Har kuni / foydalanuvchi</div></div>
                </div>
              )}

              {simUsage && (
                <>
                  <div className="section-title"><h2>Bugungi simulyator foydalanuvchilari</h2></div>
                  <table className="data-table" style={{ marginBottom: 28 }}>
                    <thead><tr><th>Foydalanuvchi</th><th>Suhbatlar</th><th>Tokenlar</th><th>Tarif</th><th>Amallar</th></tr></thead>
                    <tbody>
                      {simUsage.users.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 22 }}>Bugun hali hech kim simulyatordan foydalanmagan.</td></tr>
                      ) : simUsage.users.map((u: any) => (
                        <tr key={u.userId}>
                          <td><div className="row-title">{u.name}</div><div className="row-meta">{u.email}</div></td>
                          <td className="count-mono">{u.sessions} / {u.limit}</td>
                          <td className="count-mono">{Number(u.tokens).toLocaleString('ru-RU').replace(/,/g, ' ')}</td>
                          <td>{u.plan === 'premium' ? <span className="badge plan">Premium</span> : <span className="badge" style={{ background: 'var(--paper-3, #EFEDE4)', color: 'var(--muted)' }}>Bepul</span>}</td>
                          <td className="row-actions">
                            {u.plan === 'premium'
                              ? <button className="btn btn-ghost btn-sm" onClick={() => setUserPlan(u.userId, 'free')}>Premiumni olib tashlash</button>
                              : <button className="btn btn-success btn-sm" onClick={() => setUserPlan(u.userId, 'premium')}>Premium berish</button>}
                            <button className="btn btn-ghost btn-sm" onClick={() => setUserOverride(u.userId)}>Limit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div className="stat-row">
                <div className="stat-card"><div className="label">Jami CV tahlillari</div><div className="num">{aiStats.cv}</div><div className="delta flat">Barcha vaqt</div></div>
                <div className="stat-card"><div className="label">Jami test topshirishlar</div><div className="num">{aiStats.test}</div><div className="delta flat">Barcha vaqt</div></div>
                <div className="stat-card"><div className="label">Sotuv simulyatsiyalari</div><div className="num">{aiStats.sales}</div><div className="delta flat">Barcha vaqt</div></div>
                <div className="stat-card"><div className="label">Video yuklamalar</div><div className="num">{aiStats.video}</div><div className="delta flat">Barcha vaqt</div></div>
              </div>
              <div className="section-title"><h2>Kompaniyalar bo'yicha AI foydalanish</h2></div>
              <table className="data-table">
                <thead><tr><th>Kompaniya</th><th>CV tahlillari</th><th>Test topshirishlar</th><th>Sotuv simulyatsiyasi</th><th>Video yuklamalar</th><th>O'rtacha AI bali</th></tr></thead>
                <tbody>
                  {(() => {
                    const byCo: Record<string, any> = {};
                    applications.forEach(a => {
                      const co = a.vacancy?.employer?.company || 'Noma\'lum';
                      if (!byCo[co]) byCo[co] = { company: co, cv: 0, test: 0, sales: 0, video: 0, scoreSum: 0, scoreN: 0 };
                      const r = byCo[co];
                      if (a.cvScore != null) { r.cv++; r.scoreSum += a.cvScore; r.scoreN++; }
                      if (a.testScore != null) { r.test++; r.scoreSum += a.testScore; r.scoreN++; }
                      if (a.salesScore != null) { r.sales++; r.scoreSum += a.salesScore; r.scoreN++; }
                      if (a.videoLink) r.video++;
                    });
                    const rows = Object.values(byCo);
                    if (rows.length === 0) return <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 22 }}>Hali AI faoliyati yo'q.</td></tr>;
                    return rows.map((c: any, i: number) => (
                      <tr key={i}><td className="row-title">{c.company}</td><td className="count-mono">{c.cv}</td><td className="count-mono">{c.test}</td><td className="count-mono">{c.sales}</td><td className="count-mono">{c.video}</td><td className="count-mono">{c.scoreN ? Math.round(c.scoreSum / c.scoreN) : 0}%</td></tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {view === 'plans' && (
            <div>
              <div className="pagehead"><div><h1>Tarif rejalari</h1><p>Kompaniyalar uchun mavjud obuna tariflari.</p></div></div>
              <div className="plan-grid">
                {[
                  { name: "Bepul", price: "0 so'm", period: "/oy", features: ["1 ta faol vakansiya", "CV moslik tahlili", "Asosiy statistika"], highlight: false },
                  { name: "Standart", price: "890 000 so'm", period: "/oy", features: ["10 ta faol vakansiyagacha", "CV tahlili + Test + Ochiq savollar", "Nomzodlar bilan chat", "Email qo'llab-quvvatlash"], highlight: true },
                  { name: "Premium", price: "2 100 000 so'm", period: "/oy", features: ["Cheklanmagan vakansiyalar", "Barcha AI bosqichlari (Sotuv simulyatsiyasi, Video)", "Kengaytirilgan statistika", "Shaxsiy menejer"], highlight: false },
                ].map((p, i) => (
                  <div key={i} className={`plan-card ${p.highlight ? 'highlight' : ''}`}>
                    <h3>{p.name}</h3>
                    <div className="price">{p.price} <span>{p.period}</span></div>
                    <ul>{p.features.map((f, fi) => <li key={fi}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>{f}</li>)}</ul>
                    <div className="co-count"><b>{companies.filter(c => c.plan === p.name).length}</b> ta kompaniya ushbu tarifda</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'payments' && (
            <div>
              <div className="pagehead"><div><h1>To'lovlar</h1><p>Kompaniyalarning obuna to'lovlari va hisob-fakturalar tarixi.</p></div></div>
              <div className="stat-row">
                <div className="stat-card"><div className="label">Jami tushum (to'langan)</div><div className="num" style={{ fontSize: 19 }}>{payments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseInt(p.amount.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString('ru-RU').replace(/,/g, ' ')} so'm</div><div className="delta up">{payments.filter(p => p.status === 'paid').length} ta to'lov</div></div>
                <div className="stat-card"><div className="label">Kutilayotgan to'lovlar</div><div className="num" style={{ fontSize: 19 }}>{payments.filter(p => p.status === 'pending').reduce((s, p) => s + (parseInt(p.amount.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString('ru-RU').replace(/,/g, ' ')} so'm</div><div className="delta flat">{payments.filter(p => p.status === 'pending').length} ta hisob-faktura</div></div>
                <div className="stat-card"><div className="label">Muddati o'tgan</div><div className="num" style={{ fontSize: 19 }}>{payments.filter(p => p.status === 'overdue').reduce((s, p) => s + (parseInt(p.amount.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString('ru-RU').replace(/,/g, ' ')} so'm</div><div className={`delta ${payments.filter(p => p.status === 'overdue').length ? 'warn' : 'flat'}`}>{payments.filter(p => p.status === 'overdue').length} ta kompaniya</div></div>
                <div className="stat-card"><div className="label">Faol obunalar</div><div className="num" style={{ fontSize: 19 }}>{companies.filter(c => c.plan !== 'Bepul' && c.status === 'active').length}</div><div className="delta flat">Pullik tarifda</div></div>
              </div>
              <table className="data-table">
                <thead><tr><th>Kompaniya</th><th>Tarif</th><th>Summa</th><th>Sana</th><th>Holat</th></tr></thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i}><td className="row-title">{p.company}</td><td><span className="badge plan">{p.plan}</span></td><td className="count-mono">{p.amount}</td><td>{p.date}</td><td>{payStatusBadge(p.status)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'settings' && (
            <div>
              <div className="pagehead"><div><h1>Platforma sozlamalari</h1><p>Barcha kompaniyalar uchun standart AI sozlamalari va umumiy parametrlar.</p></div></div>

              <div className="settings-card">
                <h3>Standart AI talablari (yangi vakansiyalar uchun)</h3>
                <div className="setting-row"><div className="info"><b>CV moslik tahlili</b><span>Yangi vakansiya yaratilganda avtomatik yoqilgan bo'lsin</span></div><label className="switch"><input type="checkbox" defaultChecked /><span className="slider-tog"></span></label></div>
                <div className="setting-row"><div className="info"><b>Minimal CV o'tish bali</b><span>Standart chegara, HR har bir vakansiyada o'zgartirishi mumkin</span></div><input type="number" defaultValue="65" /></div>
                <div className="setting-row"><div className="info"><b>Video-taqdimot</b><span>Yangi vakansiya yaratilganda avtomatik yoqilgan bo'lsin</span></div><label className="switch"><input type="checkbox" /><span className="slider-tog"></span></label></div>
              </div>

              <div className="settings-card">
                <h3>Moderatsiya</h3>
                <div className="setting-row"><div className="info"><b>Vakansiyalarni qo'lda tasdiqlash</b><span>Yangi e'lonlar avtomatik chop etilmasdan oldin ko'rib chiqiladi</span></div><label className="switch"><input type="checkbox" defaultChecked /><span className="slider-tog"></span></label></div>
                <div className="setting-row"><div className="info"><b>Yangi kompaniyalarni tasdiqlash</b><span>Ro'yxatdan o'tgan kompaniya faoliyatni boshlashdan oldin tekshiriladi</span></div><label className="switch"><input type="checkbox" defaultChecked /><span className="slider-tog"></span></label></div>
              </div>

              <div className="settings-card">
                <h3>Qo'llab-quvvatlash</h3>
                <div className="setting-row"><div className="info"><b>Yordam email</b><span>Foydalanuvchilarga ko'rinadigan aloqa manzili</span></div><input type="text" defaultValue="support@repza.uz" style={{ width: 180, textAlign: 'left' }} /></div>
              </div>

              <div className="modal-actions" style={{ justifyContent: 'flex-start' }}><button className="btn btn-primary" onClick={() => showToast('Sozlamalar saqlandi')}>Saqlash</button></div>
            </div>
          )}
        </main>
      </div>

      {coModalId && currentCo && (
        <div className="overlay open">
          <div className="modal">
            <h2>{currentCo.name}</h2>
            <p className="sub">{currentCo.industry} · Qo'shilgan sana: {currentCo.joined}</p>
            <div className="kv-row"><span className="k">Tarif</span><span className="v">{currentCo.plan}</span></div>
            <div className="kv-row"><span className="k">Holat</span><span className="v">{statusBadge(currentCo.status)}</span></div>
            <div className="kv-row"><span className="k">HR foydalanuvchilar</span><span className="v">{currentCo.hrUsers}</span></div>
            <div className="kv-row"><span className="k">Vakansiyalar</span><span className="v">{currentCo.vacancies}</span></div>
            <div className="kv-row"><span className="k">E'lonlar</span><span className="v">{coVacs.map(v => v.title).join(', ') || '—'}</span></div>
            <div className="modal-actions"><button className="btn btn-ghost" onClick={() => setCoModalId(null)}>Yopish</button></div>
          </div>
        </div>
      )}

      {vacModalId && currentVac && (
        <div className="overlay open">
          <div className="modal">
            <h2>{currentVac.title}</h2>
            <p className="sub">{currentVac.company}</p>
            <div className="kv-row"><span className="k">Holat</span><span className="v">{statusBadge(currentVac.status)}</span></div>
            <div className="kv-row"><span className="k">AI talablari</span><span className="v">{currentVac.ai.length ? currentVac.ai.map(k => AI_META[k as keyof typeof AI_META].label).join(', ') : "Yo'q"}</span></div>
            <div className="modal-actions"><button className="btn btn-ghost" onClick={() => setVacModalId(null)}>Yopish</button></div>
          </div>
        </div>
      )}

      {hrModalOpen && (
        <div className="overlay open">
          <div className="modal">
            <h2>Yangi HR foydalanuvchi qo'shish</h2>
            <p className="sub">Kompaniyaga yangi HR menejer hisobini yarating.</p>
            <div className="field"><label>To'liq ism</label><input type="text" value={hrDraft.name} onChange={e => setHrDraft({ ...hrDraft, name: e.target.value })} placeholder="Ism Familiya" /></div>
            <div className="field"><label>Email</label><input type="email" value={hrDraft.email} onChange={e => setHrDraft({ ...hrDraft, email: e.target.value })} placeholder="email@company.uz" /></div>
            <div className="field">
              <label>Kompaniya</label>
              <select value={hrDraft.company} onChange={e => setHrDraft({ ...hrDraft, company: e.target.value })}>
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className={`err-note ${hrErr ? 'show' : ''}`}>Iltimos, ism, email va kompaniyani tanlang.</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setHrModalOpen(false)}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={submitAddHr}>Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {candModalOpen && (
        <div className="overlay open">
          <div className="modal">
            <h2>Yangi nomzod qo'shish</h2>
            <p className="sub">Platformaga qo'lda nomzod hisobini qo'shing.</p>
            <div className="field"><label>To'liq ism</label><input type="text" value={candDraft.name} onChange={e => setCandDraft({ ...candDraft, name: e.target.value })} placeholder="Ism Familiya" /></div>
            <div className="field"><label>Email</label><input type="email" value={candDraft.email} onChange={e => setCandDraft({ ...candDraft, email: e.target.value })} placeholder="email@example.com" /></div>
            <div className="field"><label>Telefon</label><input type="text" value={candDraft.phone} onChange={e => setCandDraft({ ...candDraft, phone: e.target.value })} placeholder="+998 90 123 45 67" /></div>
            <div className={`err-note ${candErr ? 'show' : ''}`}>Iltimos, ism va emailni kiriting.</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setCandModalOpen(false)}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={submitAddCandidate}>Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {deptModalOpen && (
        <div className="overlay open">
          <div className="modal">
            <h2>Yangi bo'lim qo'shish</h2>
            <p className="sub">Vakansiya yaratishda HR ko'radigan yangi soha nomini kiriting.</p>
            <div className="field"><label>Bo'lim nomi</label><input type="text" value={deptDraft} onChange={e => setDeptDraft(e.target.value)} placeholder="Masalan: Qurilish, Logistika, Boshqaruv" /></div>
            <div className={`err-note ${deptErr ? 'show' : ''}`}>Iltimos, bo'lim nomini kiriting.</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeptModalOpen(false)}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={submitAddDept}>Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </>
  );
}
