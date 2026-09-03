import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update query params logic
old_q = '''            const vid = params.get("id");
            if (vid) {
               const targetV = formatted.find(x => x.publicId === vid);
               if (targetV) {
                 setCurrentJobId(targetV.id);
                 setView("job-detail");
               }
            }'''

new_q = '''            const vid = params.get("id");
            const doApply = params.get("apply");
            if (vid) {
               const targetV = formatted.find(x => x.publicId === vid);
               if (targetV) {
                 setCurrentJobId(targetV.id);
                 if (doApply) {
                    // Call the logic of startApply directly here using targetV
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
                    setDraft({ vacancyId: v.id, isCvLoading: false, cvSource: 'profile', cvScore: null, testScore: null, salesScore: null, openAnswers: {}, activePersonaId: randId, videoLink: '' });
                    setView('apply');
                 } else {
                   setView("job-detail");
                 }
               }
            }'''

code = code.replace(old_q, new_q)

# 2. Update AuthModal in vacansiy/page.tsx
old_auth_btn = '''<button className="btn btn-primary" onClick={() => { setAuthModalOpen(false); window.location.href = '/'; }}>Ro&apos;yxatdan o&apos;tish</button>'''
new_auth_btn = '''<button className="btn btn-primary" onClick={() => { setAuthModalOpen(false); const curUrl = encodeURIComponent(window.location.search); window.location.href = '/?register=1&redirect=' + curUrl; }}>Ro&apos;yxatdan o&apos;tish</button>'''

code = code.replace(old_auth_btn, new_auth_btn)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated vacansiy/page.tsx")
