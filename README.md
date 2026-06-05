# 🧪 HMG Academy Virtual Lab v7

**Africa's most complete free Virtual Laboratory platform for secondary schools**

Built by [Adewale Samson Adeagbo](https://cssadewale.pages.dev) for [HMG Academy](https://hmgacademy.pages.dev) — part of the [HMG Concepts](https://hmgconcepts.pages.dev) ecosystem.

## What's new in v7

- ✅ **75 brand-new simulations** (15 per subject)
- ✅ **36-piece interactive Equipment Gallery** with realistic SVG apparatus (beaker, flask, Bunsen burner, microscope, voltmeter, telescope, DNA helix, …)
- ✅ **Lab Bench preview on every simulation page** — students see and click the real apparatus
- ✅ All v6 features preserved: periodic table fix, teacher dashboard, school admin, gamification, dark mode, PWA, backup/restore
- ✅ 6 tools + 1 new tool (Equipment Gallery)

## Quick stats
- **125 simulations** across 5 subjects
- **36 vector lab apparatus**
- **118 elements** correctly placed periodic table
- **10 unlockable badges**, level system
- WAEC / NECO / JAMB / IGCSE aligned
- 100% free · no AI APIs · no servers · no logins

## Deploy in 60 seconds
1. Push everything in this folder to a new GitHub repo.
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → Connect repo → Framework: **None** → Build command: (empty) → Output dir: `/` → **Save and Deploy**.
3. Site live at `https://<your-project>.pages.dev`.

Full step-by-step (Cloudflare / Vercel / Netlify / GitHub Pages / Local) is in `docs/deployment.html` (or `DEPLOYMENT.md`).

## Repository layout
```
index.html · 404.html · README.md · DEPLOYMENT.md
manifest.json · sw.js · robots.txt · sitemap.xml · vercel.json · _redirects
assets/css/style.css            master stylesheet (light + dark)
assets/js/lab-equipment.js      36 SVG apparatus library  (NEW in v7)
assets/js/lab-core.js           storage, periodic table, badges, quizzes
assets/js/main.js               shared helpers
assets/images/                  logo + founder
subjects/<subject>/             subject hub + 25 sim pages each (125 sims)
tools/                          equipment-gallery + periodic-table + 5 tools
teacher/                        dashboard, classroom, assessments, reports
student/portal.html · parent/portal.html · admin/index.html
gamification/index.html
community/                      forum, resources
docs/                           features, deployment, equipment-guide, changelog
```

## Contact
- Adewale Samson Adeagbo — <https://cssadewale.pages.dev>
- HMG Academy — <https://hmgacademy.pages.dev>
- HMG Concepts — <https://hmgconcepts.pages.dev>
- WhatsApp — +234 810 086 6322
