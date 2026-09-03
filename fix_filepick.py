import sys

with open('app/vacansiy/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_pick = '''  const onFilePick = (e: any) => {
    const f = e.target.files[0];
    if (f) setDraft({ ...draft, cvFileName: f.name, cvError: false });
  };'''

new_pick = '''  const onFilePick = (e: any) => {
    const f = e.target.files[0];
    if (f) setDraft({ ...draft, cvFileName: f.name, cvError: false, fileObj: f });
  };'''

code = code.replace(old_pick, new_pick)

with open('app/vacansiy/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated onFilePick")
