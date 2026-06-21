# OWG Schedule & OT — MongoDB Backend

## Local Setup

```bash
npm install
node seed.js       # seed default data
node server.js     # start server
```

Open: http://localhost:3000
Login: admin@owg.com / admin123

---

## Deploy to Railway (Worldwide Access)

### Step 1 — Push to GitHub
1. Go to github.com → New repository → name: `owg-app`
2. Download GitHub Desktop or run:
```bash
git init
git add .
git commit -m "OWG App"
git remote add origin https://github.com/YOUR_USERNAME/owg-app.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to railway.app → Login with GitHub
2. New Project → Deploy from GitHub → select `owg-app`
3. Add Environment Variable:
   - `MONGODB_URI` = (your Atlas connection string - already in .env)
   - `JWT_SECRET` = owg-super-secret-2025
4. Railway gives you a URL like: `https://owg-app-production.up.railway.app`

### Step 3 — Seed production data
In Railway dashboard → your service → Shell:
```bash
node seed.js
```

Done! Share the Railway URL with your team — anyone can access worldwide!

---

## Environment Variables (for Railway)

| Variable | Value |
|----------|-------|
| MONGODB_URI | mongodb+srv://kgpkvijay86_db_user:...@cluster0.bccxtqe.mongodb.net/owg_db |
| JWT_SECRET | owg-super-secret-2025 |
| PORT | (auto set by Railway) |
