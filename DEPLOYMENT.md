# Deployment Guide

## Option 1: Cloudflare Pages (60 seconds)
1. Push lab-v2/ to a GitHub repository
2. Cloudflare Dashboard → Pages → Connect to Git → Select repo
3. Framework: None | Build output: /
4. Deploy → Site live at your-domain.pages.dev

## Option 2: GitHub Pages
Settings → Pages → Deploy from main branch at root

## Option 3: Local
python3 -m http.server 8000

## Post-Deploy Verification
Visit: / (Home), /subjects/physics/index.html (Physics), /teacher/dashboard.html (Teacher), /student/portal.html (Student), /tools/periodic-table.html (Tools), /parent/portal.html (Parent)
