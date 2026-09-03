import sys

with open('app/hr/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    'navigator.clipboard.writeText(window.location.origin + "/vacansiy?id=" + (v.publicId || "XAB12345") + "&apply=1");',
    'navigator.clipboard.writeText(window.location.origin + "/vacansiy?id=" + (v.publicId || "XAB12345"));'
)

with open('app/hr/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Removed apply=1 from copy link")
