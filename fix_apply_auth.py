import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old = '''                 if (doApply) {
                    // Call the logic of startApply directly here using targetV
                    const v = targetV;
                    const defs = [{ key: 'info', label: "CV yuklash" }];'''

new = '''                 if (doApply) {
                    const usrStr = localStorage.getItem('ishla_user');
                    if (!usrStr) {
                       setAuthModalOpen(true);
                    } else {
                       const v = targetV;
                       const defs = [{ key: 'info', label: "CV yuklash" }];'''

code = code.replace(old, new)
code = code.replace("setView('apply');\n                 } else {", "setView('apply');\n                    }\n                 } else {")

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Added auth check back to doApply")
