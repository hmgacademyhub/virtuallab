# 🚀 Deployment Guide — HMG Academy Virtual Lab v5

## Option 1: Cloudflare Pages (60 seconds — RECOMMENDED)
1. Push all lab-v5 files to a GitHub repository
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → Create a project → Connect to Git
3. Select your repository
4. Framework preset: **None** | Build output directory: **/** (root)
5. Click **Save and Deploy**
6. Site live at: `https://your-project.pages.dev`

## Option 2: GitHub Pages
1. Push to GitHub → Settings → Pages → Deploy from `main` branch at `/` (root)
2. Available at: `https://username.github.io/repo/`

## Option 3: Local
```bash
cd lab-v5 && python3 -m http.server 8000
# Visit http://localhost:8000
```

## Post-Deploy Verification
Verify these URLs:
- `/` — Homepage
- `/subjects/physics/index.html` — Physics lab
- `/subjects/physics/pendulum.html` — Working pendulum sim
- `/tools/periodic-table.html` — Working periodic table
- `/teacher/dashboard.html` — Teacher dashboard
- `/student/portal.html` — Student portal
