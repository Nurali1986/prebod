import sys

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# For Register
code = code.replace(
    "router.push(data.role === 'candidate' ? '/vacansiy' : '/hr');",
    "const redir = new URLSearchParams(window.location.search).get('redirect');\n        router.push(data.role === 'candidate' ? (redir ? '/vacansiy' + decodeURIComponent(redir) : '/vacansiy') : '/hr');"
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Added redirect handling to page.tsx")
