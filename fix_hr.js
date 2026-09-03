const fs = require('fs');
let code = fs.readFileSync('app/hr/page.tsx', 'utf8');

let firstVacIdx = code.indexOf('const initialVacancies: any[] = [];');
if (firstVacIdx !== -1) {
  let afterFirstVac = code.indexOf(';', firstVacIdx) + 1;
  let fetchDeptIdx = code.indexOf('fetch(\`/api/departments\`)');
  if (fetchDeptIdx === -1) fetchDeptIdx = code.indexOf('fetch(' + String.fromCharCode(39) + '/api/departments' + String.fromCharCode(39) + ')');
  
  if (fetchDeptIdx !== -1) {
    let topCode = code.substring(0, afterFirstVac);
    
    let injected = `
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
      setAuthModalOpen(true);
      setIsAuthChecking(false);
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
            },
            candidates: v.candidates || []
          }));
          setVacancies(formatted);
        }
      });
      
    `;
    let bottomCode = code.substring(fetchDeptIdx);
    fs.writeFileSync('app/hr/page.tsx', topCode + '\n\n' + injected + bottomCode);
    console.log('Restored HRPanel definition properly');
  } else {
    console.log('Could not find fetch departments');
  }
} else {
  console.log('Could not find initialVacancies');
}
