# 🚀 HMG Academy Virtual Lab v7 — Deployment Guide

> A rich, in-app version is at **/docs/deployment.html**.

## Requirements
* Free GitHub account (https://github.com/signup)
* One of: Cloudflare Pages · Vercel · Netlify · GitHub Pages
* A browser

## Step A — Get the files
Download / clone the `lab v7` folder. Make sure `index.html` is at the top level (not nested).

## Step B — Push to GitHub

**Web (no CLI):**
1. github.com → **+** → **New repository** → name `virtuallab`, **Public**, **Create**
2. Click **uploading an existing file**
3. Drag the *contents* of `lab v7` into the box
4. Commit message: `Initial v7 upload` → **Commit changes**

**Git CLI:**
```bash
cd "lab v7"
git init
git add .
git commit -m "Initial v7 upload"
git branch -M main
git remote add origin https://github.com/<USERNAME>/virtuallab.git
git push -u origin main
```

## Step C — Choose ONE host

### C1 · Cloudflare Pages (recommended)
1. https://pages.cloudflare.com → **Create a project** → **Connect to Git**
2. Pick repo
3. Framework **None** · Build command empty · Build output **/**
4. **Save and Deploy** → `https://<project>.pages.dev`

### C2 · Vercel
New Project → import repo → Framework **Other** → **Deploy**

### C3 · Netlify
Import from Git → Build command empty → Publish dir `.` → **Deploy site**

### C4 · GitHub Pages
Settings → Pages → Deploy from branch `main` / root → wait ~1 min

## Step D — Verify
* `/`
* `/tools/equipment.html` (gallery)
* `/subjects/physics/pendulum.html`
* `/tools/periodic-table.html`
* `/teacher/dashboard.html`

## Step E — Local
```bash
cd "lab v7"
python3 -m http.server 8000     # http://localhost:8000
```

## Step F — Install as PWA
Mobile browser → menu → **Install app / Add to Home Screen**

## Troubleshooting
* **Blank page** → files in an extra folder; re-upload from inside `lab v7`.
* **Equipment Gallery empty** → console (F12) for failed `assets/js/lab-equipment.js`.
* **GitHub Pages 404** → URL includes repo name: `https://<user>.github.io/virtuallab/...`
* **Lost local data** → back up from Admin/Teacher dashboard regularly.
