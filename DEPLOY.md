# Ishla — Ubuntu serverga deploy qilish qo'llanmasi

Bu qo'llanma **Ubuntu 24.04** serverga (masalan `46.62.203.181`) platformani yuklab, domen va HTTPS ulashni qadamma-qadam ko'rsatadi.

**Arxitektura:** Nginx (80/443) → Next.js (localhost:3000, PM2 bilan) → PostgreSQL (localhost:5432).

Barcha buyruqlar `root` sifatida serverda (`ssh root@46.62.203.181`) bajariladi.

---

## 1. Tizimni tayyorlash

```bash
apt update && apt upgrade -y
apt install -y curl git ufw nginx

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## 2. Node.js 20 (LTS) + PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v      # v20.x bo'lishi kerak

npm install -g pm2
```

---

## 3. PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
```

Baza va foydalanuvchi yaratish:

```bash
sudo -u postgres psql
```

`psql` ichida (parolni o'zingiznikiga o'zgartiring):

```sql
CREATE DATABASE ishla_db;
CREATE USER ishla WITH ENCRYPTED PASSWORD 'KUCHLI_PAROL';
GRANT ALL PRIVILEGES ON DATABASE ishla_db TO ishla;
\c ishla_db
GRANT ALL ON SCHEMA public TO ishla;
\q
```

`DATABASE_URL` shunday bo'ladi:
```
postgresql://ishla:KUCHLI_PAROL@localhost:5432/ishla_db
```

---

## 4. Kodni serverga yuklash

**Tavsiya: GitHub orqali** (yangilash oson bo'ladi).

Avval o'z kompyuteringizdan loyihani **private GitHub repo**ga yuboring:
```bash
# Windows (loyiha papkasida)
git add -A
git commit -m "deploy"
git remote add origin https://github.com/<siz>/ishla.git   # birinchi marta bo'lsa
git push -u origin master
```

So'ng serverda:
```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/<siz>/ishla.git ishla
cd /var/www/ishla
```

> **Muqobil (GitHub'siz):** Windows'dan `scp` bilan yuklash mumkin, lekin `node_modules` va `.next` papkalarini yubormang (juda katta). GitHub baribir qulayroq.

---

## 5. Muhit fayllarini (.env) yaratish

`AUTH_SECRET` uchun tasodifiy kalit generatsiya qiling:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`.env` yarating:
```bash
nano /var/www/ishla/.env
```
```bash
DATABASE_URL="postgresql://ishla:KUCHLI_PAROL@localhost:5432/ishla_db"
```

`.env.local` yarating:
```bash
nano /var/www/ishla/.env.local
```
```bash
AUTH_SECRET="yuqorida_generatsiya_qilingan_kalit"

# Azure OpenAI
AZURE_OPENAI_ENDPOINT="https://<resurs>.openai.azure.com/..."
AZURE_OPENAI_API_KEY="..."

# Azure Speech (ovoz)
AZURE_TTS_API_KEY="..."
AZURE_TTS_REGION="..."

# Domeningiz (OAuth va Telegram uchun MUHIM)
APP_URL="https://sizning-domeningiz.uz"

# Google (ixtiyoriy)
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# Telegram (ixtiyoriy)
TELEGRAM_BOT_TOKEN="123456:ABC..."
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="bot_useri_nomi"
```

Saqlash: `Ctrl+O` → `Enter` → `Ctrl+X`.

---

## 6. O'rnatish, baza va build

```bash
cd /var/www/ishla
npm install
npx prisma generate
npx prisma db push

# (Ixtiyoriy) boshlang'ich bo'limlar/namunalar
node prisma/seed.js

# Superadmin yaratish
node scripts/create-superadmin.mjs admin@sizning-domeningiz.uz
# → chiqgan parolni saqlab qo'ying

# Production build
npm run build
```

---

## 7. PM2 bilan ishga tushirish

```bash
cd /var/www/ishla
pm2 start npm --name ishla -- start
pm2 save
pm2 startup     # chiqgan buyruqni nusxalab, alohida ishga tushiring (avtostart uchun)
```

Tekshirish:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
pm2 logs ishla   # loglarni ko'rish
```

---

## 8. Nginx (domen → localhost:3000)

```bash
nano /etc/nginx/sites-available/ishla
```

```nginx
server {
    listen 80;
    server_name sizning-domeningiz.uz www.sizning-domeningiz.uz;

    client_max_body_size 12M;   # CV/rasm yuklash uchun

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # AI chat (SSE stream) uzilmasligi uchun MUHIM:
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
}
```

Yoqish:
```bash
ln -s /etc/nginx/sites-available/ishla /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## 9. Domenni ulash (DNS)

Domen registratoringiz (yoki Cloudflare) panelida **A yozuvlari** qo'shing:

| Turi | Nomi | Qiymati |
|------|------|---------|
| A | `@` | `46.62.203.181` |
| A | `www` | `46.62.203.181` |

Tarqalishini kuting (odatda bir necha daqiqa – bir necha soat). Tekshirish:
```bash
dig +short sizning-domeningiz.uz
```

---

## 10. HTTPS (Let's Encrypt — bepul)

DNS ishlagach:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d sizning-domeningiz.uz -d www.sizning-domeningiz.uz
```

Certbot Nginx'ni avtomatik 443 (HTTPS)ga o'tkazadi va sertifikatni avtomatik yangilaydi.
Endi sayt `https://sizning-domeningiz.uz` da ishlaydi.

---

## 11. Google va Telegram'ni domenga moslash

HTTPS ishlagach:

**Google Cloud** → Clients → OAuth client → **Authorized redirect URIs** ga qo'shing:
```
https://sizning-domeningiz.uz/api/auth/google/callback
```
Va **Publish app** qiling (hammaga ochiq bo'lishi uchun).

**@BotFather** → `/setdomain` → `sizning-domeningiz.uz`

`.env.local` da `APP_URL` to'g'ri (https domen) ekaniga ishonch hosil qiling, so'ng:
```bash
pm2 restart ishla
```

---

## Keyingi yangilanishlar (kod o'zgarganda)

```bash
cd /var/www/ishla
git pull
npm install
npx prisma db push     # faqat schema o'zgargan bo'lsa
npm run build
pm2 restart ishla
```

---

## Foydali buyruqlar

```bash
pm2 status            # holat
pm2 logs ishla        # loglar
pm2 restart ishla     # qayta ishga tushirish
systemctl status nginx
nginx -t              # nginx konfiguratsiyasini tekshirish
```

---

## Xavfsizlik tavsiyalari
- `root` o'rniga alohida `sudo` foydalanuvchi yaratish va SSH kalit bilan kirish (parolni o'chirish) yaxshi amaliyot.
- PostgreSQL faqat `localhost`da tinglaydi (standart) — tashqaridan ochmang.
- `.env.local` ni hech qachon git'ga qo'ymang (`.gitignore`da bor).
- Serverni vaqti-vaqti bilan yangilang: `apt update && apt upgrade`.
