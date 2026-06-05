/* ============================================================
   HMG Academy Virtual Lab v6 — Core Library
   Author: Adewale Samson Adeagbo · HMG Concepts
   100% Vanilla JS · No dependencies · LocalStorage backed
   ============================================================ */
var HMG = (function () {
  'use strict';

  /* ---------- Storage layer ---------- */
  var KEY = 'hmg-lab-v6';
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { store = {}; }
  var DEF = {
    students: [], classes: [], progress: {}, badges: [], forumPosts: [],
    parentAccounts: [], assessments: [], submissions: [], resources: [],
    settings: { theme: 'light', school: '', logo: '' }, currentUser: null,
    activityLog: [], notifications: []
  };
  Object.keys(DEF).forEach(function (k) { if (store[k] === undefined) store[k] = DEF[k]; });

  function persist() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { console.warn('LocalStorage full', e); } }
  function getState(k) { return store[k]; }
  function setState(k, v) { store[k] = v; persist(); }
  function logActivity(type, detail) {
    store.activityLog = store.activityLog || [];
    store.activityLog.unshift({ type: type, detail: detail, at: new Date().toISOString() });
    if (store.activityLog.length > 200) store.activityLog.length = 200;
    persist();
  }

  /* ---------- Badge definitions ---------- */
  var BADGES = [
    { id: 'first', name: 'First Steps', icon: '🚀', desc: 'Complete your first simulation' },
    { id: 'five', name: 'Lab Explorer', icon: '🔬', desc: 'Complete 5 simulations' },
    { id: 'ten', name: 'Lab Scientist', icon: '🧪', desc: 'Complete 10 simulations' },
    { id: 'perfect', name: 'Perfect Score', icon: '🏆', desc: 'Score 100% on any quiz' },
    { id: 'streak3', name: 'On Fire', icon: '🔥', desc: '3-day learning streak' },
    { id: 'streak7', name: 'Week Warrior', icon: '💪', desc: '7-day learning streak' },
    { id: 'top3', name: 'Top Performer', icon: '👑', desc: 'Reach top 3 on leaderboard' },
    { id: 'helpful', name: 'Helper', icon: '🤝', desc: 'Post 5 helpful community replies' },
    { id: 'polymath', name: 'Polymath', icon: '🧠', desc: 'Complete sims in 4+ subjects' },
    { id: 'pet', name: "Teacher's Pet", icon: '⭐', desc: 'Recognised by your teacher' }
  ];

  /* ---------- Student / Class operations ---------- */
  function addStudent(data) {
    if (!data || !data.name) { toast('Name required', 'warn'); return false; }
    if (!store.students.find(function (s) { return s.id === data.id; })) {
      var s = {
        id: data.id || 'STU-' + Date.now().toString(36).toUpperCase(),
        name: data.name, email: data.email || '', classId: data.classId || '',
        points: 0, level: 1, badges: [], joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(), streak: 0
      };
      store.students.push(s); persist();
      logActivity('student.add', s.id);
      toast('✓ ' + data.name + ' added', 'success');
      return s;
    }
    toast('⚠️ Student already exists', 'warn'); return false;
  }
  function bulkImportStudents(csv) {
    var lines = csv.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    if (!lines.length) return 0;
    var headers = lines[0].toLowerCase().split(',').map(function (h) { return h.trim(); });
    var ni = headers.indexOf('name'), ei = headers.indexOf('email'), ci = headers.indexOf('class');
    if (ni === -1) ni = 0;
    var added = 0;
    for (var i = 1; i < lines.length; i++) {
      var cols = lines[i].split(',').map(function (c) { return c.trim(); });
      if (cols[ni]) {
        var s = addStudent({ name: cols[ni], email: cols[ei] || '', classId: cols[ci] || '' });
        if (s) added++;
      }
    }
    return added;
  }
  function createClass(name, teacher, subject) {
    var c = {
      id: 'CLS-' + Date.now().toString(36).toUpperCase(),
      name: name, teacher: teacher || 'Teacher', subject: subject || 'General',
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      studentIds: [], createdAt: new Date().toISOString(), archived: false
    };
    store.classes.push(c); persist(); logActivity('class.create', c.id);
    toast('📚 Class "' + name + '" created. Code: ' + c.code, 'success');
    return c;
  }
  function getClasses() { return store.classes.filter(function (c) { return !c.archived; }); }
  function archiveClass(id) {
    var c = store.classes.find(function (x) { return x.id === id; });
    if (c) { c.archived = true; persist(); toast('Class archived', 'warn'); }
  }
  function joinClass(sid, code) {
    var c = store.classes.find(function (x) { return x.code === code.toUpperCase(); });
    if (!c) { toast('Invalid class code', 'error'); return false; }
    if (!c.studentIds.includes(sid)) c.studentIds.push(sid);
    var s = store.students.find(function (x) { return x.id === sid; });
    if (s) s.classId = c.id;
    persist(); toast('✓ Joined ' + c.name, 'success'); return true;
  }
  function trackProgress(sid, sim, data) {
    var key = sid + ':' + sim;
    var e = store.progress[key] || { attempts: 0, scores: [], timeSpent: 0, completed: false, sim: sim };
    e.attempts++;
    if (data.score !== undefined) e.scores.push(data.score);
    if (data.timeSpent) e.timeSpent += data.timeSpent;
    if (data.completed) {
      if (!e.completed) {
        var s = store.students.find(function (x) { return x.id === sid; });
        if (s) { s.points = (s.points || 0) + 10; if (s.points >= s.level * 200) s.level++; }
      }
      e.completed = true;
    }
    e.lastAccessed = new Date().toISOString();
    store.progress[key] = e; persist();
    checkAutoBadges(sid);
    return e;
  }
  function checkAutoBadges(sid) {
    var s = store.students.find(function (x) { return x.id === sid; });
    if (!s) return;
    var keys = Object.keys(store.progress).filter(function (k) { return k.indexOf(sid + ':') === 0; });
    var done = keys.filter(function (k) { return store.progress[k].completed; });
    if (done.length >= 1) awardBadge(sid, 'first', true);
    if (done.length >= 5) awardBadge(sid, 'five', true);
    if (done.length >= 10) awardBadge(sid, 'ten', true);
    var perfect = keys.some(function (k) { return store.progress[k].scores.some(function (sc) { return sc >= 100; }); });
    if (perfect) awardBadge(sid, 'perfect', true);
    var subs = {};
    done.forEach(function (k) { var n = store.progress[k].sim || ''; subs[n.split('/')[0]] = 1; });
    if (Object.keys(subs).length >= 4) awardBadge(sid, 'polymath', true);
  }
  function getLeaderboard() {
    return store.students.slice().sort(function (a, b) { return (b.points || 0) - (a.points || 0); })
      .slice(0, 20).map(function (s, i) { return Object.assign({ rank: i + 1 }, s); });
  }
  function awardBadge(sid, bid, silent) {
    var s = store.students.find(function (x) { return x.id === sid; });
    if (!s || s.badges.includes(bid)) return false;
    s.badges.push(bid); s.points = (s.points || 0) + 50; persist();
    var b = BADGES.find(function (x) { return x.id === bid; });
    if (!silent) toast('🏅 Badge unlocked: ' + (b ? b.icon + ' ' + b.name : bid), 'success');
    logActivity('badge.award', sid + ':' + bid);
    return true;
  }
  function getStudentBadges(sid) {
    var s = store.students.find(function (x) { return x.id === sid; });
    return s ? s.badges.map(function (id) { return BADGES.find(function (b) { return b.id === id; }); }).filter(Boolean) : [];
  }

  /* ---------- Assessments ---------- */
  function createAssessment(a) {
    a.id = a.id || 'ASM-' + Date.now().toString(36).toUpperCase();
    a.createdAt = new Date().toISOString();
    store.assessments.push(a); persist();
    toast('📝 Assessment created', 'success'); return a;
  }
  function deleteAssessment(id) {
    store.assessments = store.assessments.filter(function (a) { return a.id !== id; }); persist();
  }
  function submitAssessment(aid, sid, answers) {
    var a = store.assessments.find(function (x) { return x.id === aid; });
    if (!a) return null;
    var correct = 0;
    a.questions.forEach(function (q, i) { if (answers[i] === q.correct) correct++; });
    var score = Math.round((correct / a.questions.length) * 100);
    var sub = { id: 'SUB-' + Date.now().toString(36), assessmentId: aid, studentId: sid, score: score, correct: correct, total: a.questions.length, at: new Date().toISOString(), answers: answers };
    store.submissions.push(sub); persist();
    if (sid && score >= 100) awardBadge(sid, 'perfect');
    return sub;
  }

  /* ---------- Notifications ---------- */
  function notify(msg, level) {
    store.notifications = store.notifications || [];
    store.notifications.unshift({ msg: msg, level: level || 'info', at: new Date().toISOString(), read: false });
    if (store.notifications.length > 50) store.notifications.length = 50;
    persist();
  }

  /* ---------- Toast ---------- */
  var tc = null;
  function toast(msg, type, dur) {
    dur = dur || 3500;
    if (!tc) {
      tc = document.createElement('div');
      tc.style.cssText = 'position:fixed;top:80px;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;max-width:90vw';
      document.body.appendChild(tc);
    }
    var t = document.createElement('div');
    var color = type === 'success' ? '#27ae60' : type === 'warn' ? '#f39c12' : type === 'error' ? '#e74c3c' : '#e94560';
    t.style.cssText = 'padding:.7rem 1.1rem;border-radius:8px;background:#fff;color:#1a1a2e;box-shadow:0 4px 20px rgba(0,0,0,.15);border-left:4px solid ' + color + ';font-size:.86rem;max-width:420px;transition:all .3s';
    t.textContent = msg; tc.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; setTimeout(function () { t.remove(); }, 300); }, dur);
  }

  /* ---------- Modal ---------- */
  function modal(title, html) {
    var bg = document.querySelector('.modal-bg') || (function () { var d = document.createElement('div'); d.className = 'modal-bg'; document.body.appendChild(d); return d; })();
    bg.innerHTML = '<div class="modal"><button class="modal-close" aria-label="Close">&times;</button><h3>' + title + '</h3><div class="modal-body">' + html + '</div></div>';
    bg.classList.add('open');
    bg.querySelector('.modal-close').onclick = function () { bg.classList.remove('open'); };
    bg.onclick = function (e) { if (e.target === bg) bg.classList.remove('open'); };
    return bg;
  }

  /* ---------- Theme ---------- */
  function setTheme(t) {
    document.body.classList.toggle('theme-dark', t === 'dark');
    store.settings = store.settings || {}; store.settings.theme = t; persist();
  }
  function applyTheme() {
    var t = (store.settings && store.settings.theme) || 'light';
    document.body.classList.toggle('theme-dark', t === 'dark');
  }

  /* ---------- CSV / Export ---------- */
  function downloadCSV(filename, rows) {
    var csv = rows.map(function (r) { return r.map(function (c) { var s = (c === null || c === undefined) ? '' : String(c); if (/[",\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; return s; }).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function downloadJSON(filename, obj) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function backupAll() { downloadJSON('hmg-lab-backup-' + Date.now() + '.json', store); }
  function restoreAll(json) {
    try {
      var d = typeof json === 'string' ? JSON.parse(json) : json;
      Object.keys(DEF).forEach(function (k) { if (d[k] !== undefined) store[k] = d[k]; });
      persist(); toast('✓ Restored from backup', 'success');
      setTimeout(function () { location.reload(); }, 800);
    } catch (e) { toast('Invalid backup file', 'error'); }
  }

  /* ============================================================
     PERIODIC TABLE — Full corrected dataset (118 elements)
     ============================================================ */
  /* Each: {n,sym,name,m(mass),cat(category),r(row 1-9),c(col 1-18),
     ec(electronic configuration), state(s/l/g), eneg(electronegativity Pauling), use(common uses)} */
  var ELEMENTS = [
    {n:1,sym:'H',name:'Hydrogen',m:1.008,cat:'nonmetal',r:1,c:1,ec:'1s¹',state:'g',eneg:2.20,use:'Fuel cells, ammonia synthesis'},
    {n:2,sym:'He',name:'Helium',m:4.003,cat:'noble-gas',r:1,c:18,ec:'1s²',state:'g',eneg:null,use:'Balloons, MRI cooling'},
    {n:3,sym:'Li',name:'Lithium',m:6.941,cat:'alkali-metal',r:2,c:1,ec:'[He] 2s¹',state:'s',eneg:0.98,use:'Batteries, psychiatric meds'},
    {n:4,sym:'Be',name:'Beryllium',m:9.012,cat:'alkaline-earth',r:2,c:2,ec:'[He] 2s²',state:'s',eneg:1.57,use:'Aerospace alloys'},
    {n:5,sym:'B',name:'Boron',m:10.811,cat:'metalloid',r:2,c:13,ec:'[He] 2s² 2p¹',state:'s',eneg:2.04,use:'Glass, detergents'},
    {n:6,sym:'C',name:'Carbon',m:12.011,cat:'nonmetal',r:2,c:14,ec:'[He] 2s² 2p²',state:'s',eneg:2.55,use:'Life, steel, diamonds'},
    {n:7,sym:'N',name:'Nitrogen',m:14.007,cat:'nonmetal',r:2,c:15,ec:'[He] 2s² 2p³',state:'g',eneg:3.04,use:'Fertilizer, atmosphere'},
    {n:8,sym:'O',name:'Oxygen',m:15.999,cat:'nonmetal',r:2,c:16,ec:'[He] 2s² 2p⁴',state:'g',eneg:3.44,use:'Respiration, combustion'},
    {n:9,sym:'F',name:'Fluorine',m:18.998,cat:'halogen',r:2,c:17,ec:'[He] 2s² 2p⁵',state:'g',eneg:3.98,use:'Toothpaste, Teflon'},
    {n:10,sym:'Ne',name:'Neon',m:20.180,cat:'noble-gas',r:2,c:18,ec:'[He] 2s² 2p⁶',state:'g',eneg:null,use:'Neon signs, lasers'},
    {n:11,sym:'Na',name:'Sodium',m:22.990,cat:'alkali-metal',r:3,c:1,ec:'[Ne] 3s¹',state:'s',eneg:0.93,use:'Salt, soap, street lamps'},
    {n:12,sym:'Mg',name:'Magnesium',m:24.305,cat:'alkaline-earth',r:3,c:2,ec:'[Ne] 3s²',state:'s',eneg:1.31,use:'Alloys, flares, chlorophyll'},
    {n:13,sym:'Al',name:'Aluminium',m:26.982,cat:'post-transition',r:3,c:13,ec:'[Ne] 3s² 3p¹',state:'s',eneg:1.61,use:'Cans, aircraft, foil'},
    {n:14,sym:'Si',name:'Silicon',m:28.086,cat:'metalloid',r:3,c:14,ec:'[Ne] 3s² 3p²',state:'s',eneg:1.90,use:'Chips, glass, solar cells'},
    {n:15,sym:'P',name:'Phosphorus',m:30.974,cat:'nonmetal',r:3,c:15,ec:'[Ne] 3s² 3p³',state:'s',eneg:2.19,use:'Fertilizer, matches, DNA'},
    {n:16,sym:'S',name:'Sulfur',m:32.065,cat:'nonmetal',r:3,c:16,ec:'[Ne] 3s² 3p⁴',state:'s',eneg:2.58,use:'Sulfuric acid, vulcanisation'},
    {n:17,sym:'Cl',name:'Chlorine',m:35.453,cat:'halogen',r:3,c:17,ec:'[Ne] 3s² 3p⁵',state:'g',eneg:3.16,use:'Water treatment, PVC'},
    {n:18,sym:'Ar',name:'Argon',m:39.948,cat:'noble-gas',r:3,c:18,ec:'[Ne] 3s² 3p⁶',state:'g',eneg:null,use:'Welding shield, light bulbs'},
    {n:19,sym:'K',name:'Potassium',m:39.098,cat:'alkali-metal',r:4,c:1,ec:'[Ar] 4s¹',state:'s',eneg:0.82,use:'Fertilizer, body electrolyte'},
    {n:20,sym:'Ca',name:'Calcium',m:40.078,cat:'alkaline-earth',r:4,c:2,ec:'[Ar] 4s²',state:'s',eneg:1.00,use:'Bones, cement, milk'},
    {n:21,sym:'Sc',name:'Scandium',m:44.956,cat:'transition',r:4,c:3,ec:'[Ar] 3d¹ 4s²',state:'s',eneg:1.36,use:'Lightweight alloys'},
    {n:22,sym:'Ti',name:'Titanium',m:47.867,cat:'transition',r:4,c:4,ec:'[Ar] 3d² 4s²',state:'s',eneg:1.54,use:'Implants, aircraft, paint'},
    {n:23,sym:'V',name:'Vanadium',m:50.942,cat:'transition',r:4,c:5,ec:'[Ar] 3d³ 4s²',state:'s',eneg:1.63,use:'Steel alloy, catalysts'},
    {n:24,sym:'Cr',name:'Chromium',m:51.996,cat:'transition',r:4,c:6,ec:'[Ar] 3d⁵ 4s¹',state:'s',eneg:1.66,use:'Stainless steel, plating'},
    {n:25,sym:'Mn',name:'Manganese',m:54.938,cat:'transition',r:4,c:7,ec:'[Ar] 3d⁵ 4s²',state:'s',eneg:1.55,use:'Steel, batteries'},
    {n:26,sym:'Fe',name:'Iron',m:55.845,cat:'transition',r:4,c:8,ec:'[Ar] 3d⁶ 4s²',state:'s',eneg:1.83,use:'Steel, haemoglobin'},
    {n:27,sym:'Co',name:'Cobalt',m:58.933,cat:'transition',r:4,c:9,ec:'[Ar] 3d⁷ 4s²',state:'s',eneg:1.88,use:'Magnets, Li-ion batteries'},
    {n:28,sym:'Ni',name:'Nickel',m:58.693,cat:'transition',r:4,c:10,ec:'[Ar] 3d⁸ 4s²',state:'s',eneg:1.91,use:'Coins, stainless steel'},
    {n:29,sym:'Cu',name:'Copper',m:63.546,cat:'transition',r:4,c:11,ec:'[Ar] 3d¹⁰ 4s¹',state:'s',eneg:1.90,use:'Wiring, plumbing, bronze'},
    {n:30,sym:'Zn',name:'Zinc',m:65.380,cat:'transition',r:4,c:12,ec:'[Ar] 3d¹⁰ 4s²',state:'s',eneg:1.65,use:'Galvanising, brass, batteries'},
    {n:31,sym:'Ga',name:'Gallium',m:69.723,cat:'post-transition',r:4,c:13,ec:'[Ar] 3d¹⁰ 4s² 4p¹',state:'s',eneg:1.81,use:'LEDs, semiconductors'},
    {n:32,sym:'Ge',name:'Germanium',m:72.630,cat:'metalloid',r:4,c:14,ec:'[Ar] 3d¹⁰ 4s² 4p²',state:'s',eneg:2.01,use:'Fibre optics, transistors'},
    {n:33,sym:'As',name:'Arsenic',m:74.922,cat:'metalloid',r:4,c:15,ec:'[Ar] 3d¹⁰ 4s² 4p³',state:'s',eneg:2.18,use:'Semiconductors (toxic)'},
    {n:34,sym:'Se',name:'Selenium',m:78.971,cat:'nonmetal',r:4,c:16,ec:'[Ar] 3d¹⁰ 4s² 4p⁴',state:'s',eneg:2.55,use:'Photocells, glass colouring'},
    {n:35,sym:'Br',name:'Bromine',m:79.904,cat:'halogen',r:4,c:17,ec:'[Ar] 3d¹⁰ 4s² 4p⁵',state:'l',eneg:2.96,use:'Flame retardants, photography'},
    {n:36,sym:'Kr',name:'Krypton',m:83.798,cat:'noble-gas',r:4,c:18,ec:'[Ar] 3d¹⁰ 4s² 4p⁶',state:'g',eneg:3.00,use:'Lighting, lasers'},
    {n:37,sym:'Rb',name:'Rubidium',m:85.468,cat:'alkali-metal',r:5,c:1,ec:'[Kr] 5s¹',state:'s',eneg:0.82,use:'Atomic clocks, research'},
    {n:38,sym:'Sr',name:'Strontium',m:87.620,cat:'alkaline-earth',r:5,c:2,ec:'[Kr] 5s²',state:'s',eneg:0.95,use:'Fireworks (red), magnets'},
    {n:39,sym:'Y',name:'Yttrium',m:88.906,cat:'transition',r:5,c:3,ec:'[Kr] 4d¹ 5s²',state:'s',eneg:1.22,use:'Lasers, superconductors'},
    {n:40,sym:'Zr',name:'Zirconium',m:91.224,cat:'transition',r:5,c:4,ec:'[Kr] 4d² 5s²',state:'s',eneg:1.33,use:'Nuclear reactors, ceramics'},
    {n:41,sym:'Nb',name:'Niobium',m:92.906,cat:'transition',r:5,c:5,ec:'[Kr] 4d⁴ 5s¹',state:'s',eneg:1.6,use:'Superconducting magnets'},
    {n:42,sym:'Mo',name:'Molybdenum',m:95.95,cat:'transition',r:5,c:6,ec:'[Kr] 4d⁵ 5s¹',state:'s',eneg:2.16,use:'Steel alloys, catalysts'},
    {n:43,sym:'Tc',name:'Technetium',m:98,cat:'transition',r:5,c:7,ec:'[Kr] 4d⁵ 5s²',state:'s',eneg:1.9,use:'Medical imaging'},
    {n:44,sym:'Ru',name:'Ruthenium',m:101.07,cat:'transition',r:5,c:8,ec:'[Kr] 4d⁷ 5s¹',state:'s',eneg:2.2,use:'Electronics, catalysts'},
    {n:45,sym:'Rh',name:'Rhodium',m:102.906,cat:'transition',r:5,c:9,ec:'[Kr] 4d⁸ 5s¹',state:'s',eneg:2.28,use:'Catalytic converters'},
    {n:46,sym:'Pd',name:'Palladium',m:106.42,cat:'transition',r:5,c:10,ec:'[Kr] 4d¹⁰',state:'s',eneg:2.20,use:'Catalysts, jewellery'},
    {n:47,sym:'Ag',name:'Silver',m:107.868,cat:'transition',r:5,c:11,ec:'[Kr] 4d¹⁰ 5s¹',state:'s',eneg:1.93,use:'Jewellery, photography, antimicrobial'},
    {n:48,sym:'Cd',name:'Cadmium',m:112.414,cat:'transition',r:5,c:12,ec:'[Kr] 4d¹⁰ 5s²',state:'s',eneg:1.69,use:'Batteries (toxic)'},
    {n:49,sym:'In',name:'Indium',m:114.818,cat:'post-transition',r:5,c:13,ec:'[Kr] 4d¹⁰ 5s² 5p¹',state:'s',eneg:1.78,use:'LCD screens'},
    {n:50,sym:'Sn',name:'Tin',m:118.71,cat:'post-transition',r:5,c:14,ec:'[Kr] 4d¹⁰ 5s² 5p²',state:'s',eneg:1.96,use:'Solder, cans, bronze'},
    {n:51,sym:'Sb',name:'Antimony',m:121.76,cat:'metalloid',r:5,c:15,ec:'[Kr] 4d¹⁰ 5s² 5p³',state:'s',eneg:2.05,use:'Flame retardants, alloys'},
    {n:52,sym:'Te',name:'Tellurium',m:127.6,cat:'metalloid',r:5,c:16,ec:'[Kr] 4d¹⁰ 5s² 5p⁴',state:'s',eneg:2.1,use:'Solar cells, alloys'},
    {n:53,sym:'I',name:'Iodine',m:126.904,cat:'halogen',r:5,c:17,ec:'[Kr] 4d¹⁰ 5s² 5p⁵',state:'s',eneg:2.66,use:'Antiseptics, thyroid'},
    {n:54,sym:'Xe',name:'Xenon',m:131.293,cat:'noble-gas',r:5,c:18,ec:'[Kr] 4d¹⁰ 5s² 5p⁶',state:'g',eneg:2.6,use:'High-intensity lamps'},
    {n:55,sym:'Cs',name:'Caesium',m:132.905,cat:'alkali-metal',r:6,c:1,ec:'[Xe] 6s¹',state:'s',eneg:0.79,use:'Atomic clocks'},
    {n:56,sym:'Ba',name:'Barium',m:137.327,cat:'alkaline-earth',r:6,c:2,ec:'[Xe] 6s²',state:'s',eneg:0.89,use:'X-ray contrast, fireworks (green)'},
    /* Lanthanides on row 8 (display row) */
    {n:57,sym:'La',name:'Lanthanum',m:138.905,cat:'lanthanide',r:8,c:3,ec:'[Xe] 5d¹ 6s²',state:'s',eneg:1.10,use:'Camera lenses, batteries'},
    {n:58,sym:'Ce',name:'Cerium',m:140.116,cat:'lanthanide',r:8,c:4,ec:'[Xe] 4f¹ 5d¹ 6s²',state:'s',eneg:1.12,use:'Catalytic converters, alloys'},
    {n:59,sym:'Pr',name:'Praseodymium',m:140.908,cat:'lanthanide',r:8,c:5,ec:'[Xe] 4f³ 6s²',state:'s',eneg:1.13,use:'Magnets, glass colouring'},
    {n:60,sym:'Nd',name:'Neodymium',m:144.243,cat:'lanthanide',r:8,c:6,ec:'[Xe] 4f⁴ 6s²',state:'s',eneg:1.14,use:'Strong magnets'},
    {n:61,sym:'Pm',name:'Promethium',m:145,cat:'lanthanide',r:8,c:7,ec:'[Xe] 4f⁵ 6s²',state:'s',eneg:1.13,use:'Luminous paint (rare)'},
    {n:62,sym:'Sm',name:'Samarium',m:150.362,cat:'lanthanide',r:8,c:8,ec:'[Xe] 4f⁶ 6s²',state:'s',eneg:1.17,use:'Magnets, lasers'},
    {n:63,sym:'Eu',name:'Europium',m:151.964,cat:'lanthanide',r:8,c:9,ec:'[Xe] 4f⁷ 6s²',state:'s',eneg:1.20,use:'Red phosphors in TVs'},
    {n:64,sym:'Gd',name:'Gadolinium',m:157.25,cat:'lanthanide',r:8,c:10,ec:'[Xe] 4f⁷ 5d¹ 6s²',state:'s',eneg:1.20,use:'MRI contrast'},
    {n:65,sym:'Tb',name:'Terbium',m:158.925,cat:'lanthanide',r:8,c:11,ec:'[Xe] 4f⁹ 6s²',state:'s',eneg:1.20,use:'Green phosphors'},
    {n:66,sym:'Dy',name:'Dysprosium',m:162.5,cat:'lanthanide',r:8,c:12,ec:'[Xe] 4f¹⁰ 6s²',state:'s',eneg:1.22,use:'Magnets, lasers'},
    {n:67,sym:'Ho',name:'Holmium',m:164.93,cat:'lanthanide',r:8,c:13,ec:'[Xe] 4f¹¹ 6s²',state:'s',eneg:1.23,use:'Strongest magnetic fields'},
    {n:68,sym:'Er',name:'Erbium',m:167.259,cat:'lanthanide',r:8,c:14,ec:'[Xe] 4f¹² 6s²',state:'s',eneg:1.24,use:'Fibre-optic amplifiers'},
    {n:69,sym:'Tm',name:'Thulium',m:168.934,cat:'lanthanide',r:8,c:15,ec:'[Xe] 4f¹³ 6s²',state:'s',eneg:1.25,use:'Portable X-ray devices'},
    {n:70,sym:'Yb',name:'Ytterbium',m:173.054,cat:'lanthanide',r:8,c:16,ec:'[Xe] 4f¹⁴ 6s²',state:'s',eneg:1.10,use:'Stress gauges, lasers'},
    {n:71,sym:'Lu',name:'Lutetium',m:174.967,cat:'lanthanide',r:8,c:17,ec:'[Xe] 4f¹⁴ 5d¹ 6s²',state:'s',eneg:1.27,use:'Catalysts, PET scanners'},
    /* Period 6 continuation */
    {n:72,sym:'Hf',name:'Hafnium',m:178.49,cat:'transition',r:6,c:4,ec:'[Xe] 4f¹⁴ 5d² 6s²',state:'s',eneg:1.3,use:'Nuclear reactors'},
    {n:73,sym:'Ta',name:'Tantalum',m:180.948,cat:'transition',r:6,c:5,ec:'[Xe] 4f¹⁴ 5d³ 6s²',state:'s',eneg:1.5,use:'Capacitors, surgical implants'},
    {n:74,sym:'W',name:'Tungsten',m:183.84,cat:'transition',r:6,c:6,ec:'[Xe] 4f¹⁴ 5d⁴ 6s²',state:'s',eneg:2.36,use:'Light bulb filaments'},
    {n:75,sym:'Re',name:'Rhenium',m:186.207,cat:'transition',r:6,c:7,ec:'[Xe] 4f¹⁴ 5d⁵ 6s²',state:'s',eneg:1.9,use:'Jet engines'},
    {n:76,sym:'Os',name:'Osmium',m:190.23,cat:'transition',r:6,c:8,ec:'[Xe] 4f¹⁴ 5d⁶ 6s²',state:'s',eneg:2.2,use:'Pen tips, alloys'},
    {n:77,sym:'Ir',name:'Iridium',m:192.217,cat:'transition',r:6,c:9,ec:'[Xe] 4f¹⁴ 5d⁷ 6s²',state:'s',eneg:2.20,use:'Spark plugs, alloys'},
    {n:78,sym:'Pt',name:'Platinum',m:195.084,cat:'transition',r:6,c:10,ec:'[Xe] 4f¹⁴ 5d⁹ 6s¹',state:'s',eneg:2.28,use:'Jewellery, catalysts'},
    {n:79,sym:'Au',name:'Gold',m:196.967,cat:'transition',r:6,c:11,ec:'[Xe] 4f¹⁴ 5d¹⁰ 6s¹',state:'s',eneg:2.54,use:'Jewellery, electronics, currency'},
    {n:80,sym:'Hg',name:'Mercury',m:200.592,cat:'transition',r:6,c:12,ec:'[Xe] 4f¹⁴ 5d¹⁰ 6s²',state:'l',eneg:2.00,use:'Thermometers (phasing out)'},
    {n:81,sym:'Tl',name:'Thallium',m:204.38,cat:'post-transition',r:6,c:13,ec:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹',state:'s',eneg:1.62,use:'Electronics, rat poison (toxic)'},
    {n:82,sym:'Pb',name:'Lead',m:207.2,cat:'post-transition',r:6,c:14,ec:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²',state:'s',eneg:2.33,use:'Batteries, radiation shields'},
    {n:83,sym:'Bi',name:'Bismuth',m:208.98,cat:'post-transition',r:6,c:15,ec:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³',state:'s',eneg:2.02,use:'Cosmetics, alloys'},
    {n:84,sym:'Po',name:'Polonium',m:209,cat:'post-transition',r:6,c:16,ec:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴',state:'s',eneg:2.0,use:'Antistatic devices'},
    {n:85,sym:'At',name:'Astatine',m:210,cat:'halogen',r:6,c:17,ec:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵',state:'s',eneg:2.2,use:'Research only'},
    {n:86,sym:'Rn',name:'Radon',m:222,cat:'noble-gas',r:6,c:18,ec:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶',state:'g',eneg:2.2,use:'Hazardous radioactive gas'},
    /* Period 7 */
    {n:87,sym:'Fr',name:'Francium',m:223,cat:'alkali-metal',r:7,c:1,ec:'[Rn] 7s¹',state:'s',eneg:0.7,use:'Research only'},
    {n:88,sym:'Ra',name:'Radium',m:226,cat:'alkaline-earth',r:7,c:2,ec:'[Rn] 7s²',state:'s',eneg:0.9,use:'Historical luminous paint'},
    /* Actinides on row 9 */
    {n:89,sym:'Ac',name:'Actinium',m:227,cat:'actinide',r:9,c:3,ec:'[Rn] 6d¹ 7s²',state:'s',eneg:1.1,use:'Neutron sources'},
    {n:90,sym:'Th',name:'Thorium',m:232.038,cat:'actinide',r:9,c:4,ec:'[Rn] 6d² 7s²',state:'s',eneg:1.3,use:'Nuclear fuel research'},
    {n:91,sym:'Pa',name:'Protactinium',m:231.036,cat:'actinide',r:9,c:5,ec:'[Rn] 5f² 6d¹ 7s²',state:'s',eneg:1.5,use:'Research'},
    {n:92,sym:'U',name:'Uranium',m:238.029,cat:'actinide',r:9,c:6,ec:'[Rn] 5f³ 6d¹ 7s²',state:'s',eneg:1.38,use:'Nuclear fuel, weapons'},
    {n:93,sym:'Np',name:'Neptunium',m:237,cat:'actinide',r:9,c:7,ec:'[Rn] 5f⁴ 6d¹ 7s²',state:'s',eneg:1.36,use:'Research'},
    {n:94,sym:'Pu',name:'Plutonium',m:244,cat:'actinide',r:9,c:8,ec:'[Rn] 5f⁶ 7s²',state:'s',eneg:1.28,use:'Nuclear weapons, RTGs'},
    {n:95,sym:'Am',name:'Americium',m:243,cat:'actinide',r:9,c:9,ec:'[Rn] 5f⁷ 7s²',state:'s',eneg:1.13,use:'Smoke detectors'},
    {n:96,sym:'Cm',name:'Curium',m:247,cat:'actinide',r:9,c:10,ec:'[Rn] 5f⁷ 6d¹ 7s²',state:'s',eneg:1.28,use:'Spacecraft power'},
    {n:97,sym:'Bk',name:'Berkelium',m:247,cat:'actinide',r:9,c:11,ec:'[Rn] 5f⁹ 7s²',state:'s',eneg:1.3,use:'Research'},
    {n:98,sym:'Cf',name:'Californium',m:251,cat:'actinide',r:9,c:12,ec:'[Rn] 5f¹⁰ 7s²',state:'s',eneg:1.3,use:'Neutron sources, well logging'},
    {n:99,sym:'Es',name:'Einsteinium',m:252,cat:'actinide',r:9,c:13,ec:'[Rn] 5f¹¹ 7s²',state:'s',eneg:1.3,use:'Research'},
    {n:100,sym:'Fm',name:'Fermium',m:257,cat:'actinide',r:9,c:14,ec:'[Rn] 5f¹² 7s²',state:'s',eneg:1.3,use:'Research'},
    {n:101,sym:'Md',name:'Mendelevium',m:258,cat:'actinide',r:9,c:15,ec:'[Rn] 5f¹³ 7s²',state:'s',eneg:1.3,use:'Research'},
    {n:102,sym:'No',name:'Nobelium',m:259,cat:'actinide',r:9,c:16,ec:'[Rn] 5f¹⁴ 7s²',state:'s',eneg:1.3,use:'Research'},
    {n:103,sym:'Lr',name:'Lawrencium',m:262,cat:'actinide',r:9,c:17,ec:'[Rn] 5f¹⁴ 7s² 7p¹',state:'s',eneg:1.3,use:'Research'},
    /* Period 7 continuation */
    {n:104,sym:'Rf',name:'Rutherfordium',m:267,cat:'transition',r:7,c:4,ec:'[Rn] 5f¹⁴ 6d² 7s²',state:'s',eneg:null,use:'Synthetic, research'},
    {n:105,sym:'Db',name:'Dubnium',m:268,cat:'transition',r:7,c:5,ec:'[Rn] 5f¹⁴ 6d³ 7s²',state:'s',eneg:null,use:'Synthetic'},
    {n:106,sym:'Sg',name:'Seaborgium',m:269,cat:'transition',r:7,c:6,ec:'[Rn] 5f¹⁴ 6d⁴ 7s²',state:'s',eneg:null,use:'Synthetic'},
    {n:107,sym:'Bh',name:'Bohrium',m:270,cat:'transition',r:7,c:7,ec:'[Rn] 5f¹⁴ 6d⁵ 7s²',state:'s',eneg:null,use:'Synthetic'},
    {n:108,sym:'Hs',name:'Hassium',m:269,cat:'transition',r:7,c:8,ec:'[Rn] 5f¹⁴ 6d⁶ 7s²',state:'s',eneg:null,use:'Synthetic'},
    {n:109,sym:'Mt',name:'Meitnerium',m:278,cat:'transition',r:7,c:9,ec:'[Rn] 5f¹⁴ 6d⁷ 7s²',state:'s',eneg:null,use:'Synthetic'},
    {n:110,sym:'Ds',name:'Darmstadtium',m:281,cat:'transition',r:7,c:10,ec:'[Rn] 5f¹⁴ 6d⁸ 7s²',state:'s',eneg:null,use:'Synthetic'},
    {n:111,sym:'Rg',name:'Roentgenium',m:282,cat:'transition',r:7,c:11,ec:'[Rn] 5f¹⁴ 6d⁹ 7s²',state:'s',eneg:null,use:'Synthetic'},
    {n:112,sym:'Cn',name:'Copernicium',m:285,cat:'transition',r:7,c:12,ec:'[Rn] 5f¹⁴ 6d¹⁰ 7s²',state:'s',eneg:null,use:'Synthetic'},
    {n:113,sym:'Nh',name:'Nihonium',m:286,cat:'post-transition',r:7,c:13,ec:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹',state:'s',eneg:null,use:'Synthetic'},
    {n:114,sym:'Fl',name:'Flerovium',m:289,cat:'post-transition',r:7,c:14,ec:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²',state:'s',eneg:null,use:'Synthetic'},
    {n:115,sym:'Mc',name:'Moscovium',m:290,cat:'post-transition',r:7,c:15,ec:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³',state:'s',eneg:null,use:'Synthetic'},
    {n:116,sym:'Lv',name:'Livermorium',m:293,cat:'post-transition',r:7,c:16,ec:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴',state:'s',eneg:null,use:'Synthetic'},
    {n:117,sym:'Ts',name:'Tennessine',m:294,cat:'halogen',r:7,c:17,ec:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵',state:'s',eneg:null,use:'Synthetic'},
    {n:118,sym:'Og',name:'Oganesson',m:294,cat:'noble-gas',r:7,c:18,ec:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶',state:'g',eneg:null,use:'Synthetic'}
  ];
  var CAT_NAMES = { nonmetal:'Nonmetal','noble-gas':'Noble Gas','alkali-metal':'Alkali Metal','alkaline-earth':'Alkaline Earth Metal',transition:'Transition Metal','post-transition':'Post-Transition Metal',metalloid:'Metalloid',halogen:'Halogen',lanthanide:'Lanthanide',actinide:'Actinide' };
  var CAT_COLORS = { nonmetal:'#c8e6c9','noble-gas':'#bbdefb','alkali-metal':'#ffcdd2','alkaline-earth':'#f8bbd0',transition:'#ffe0b2','post-transition':'#d7ccc8',metalloid:'#e1bee7',halogen:'#b3e5fc',lanthanide:'#f0f4c3',actinide:'#dcedc8' };
  var STATE_NAMES = { s:'Solid', l:'Liquid', g:'Gas' };

  /* ---------- Subject content library (curriculum + quizzes) ---------- */
  var CONTENT = {
    physics: {
      pendulum:    { title:'Simple Pendulum',  formula:'T = 2π√(L/g)', summary:'Period depends on length and gravity, not mass or amplitude (small angles).', quiz:[
        { q:'For a simple pendulum, doubling the length L will…', o:['Double T','Multiply T by √2','Halve T','Have no effect'], correct:1, fb:'T ∝ √L; doubling L gives √2·T.' },
        { q:'A pendulum on the Moon (g lower) compared to Earth has…', o:['Shorter period','Same period','Longer period','Stops oscillating'], correct:2, fb:'Smaller g → longer T.' },
        { q:'The plot of T² vs L gives a straight line with slope =', o:['4π²/g','g/4π²','π/g','2π/g'], correct:0, fb:'T²=4π²L/g; slope = 4π²/g.' }
      ]},
      projectile:  { title:'Projectile Motion', formula:'R = u²sin(2θ)/g', summary:'Horizontal motion is uniform, vertical is uniformly accelerated by g.', quiz:[
        { q:'Maximum range occurs at launch angle of…', o:['30°','45°','60°','90°'], correct:1, fb:'sin(2θ) is maximum when 2θ=90°.' },
        { q:'Horizontal velocity during flight (no air)…', o:['Increases','Decreases','Stays constant','Becomes zero at peak'], correct:2, fb:'No horizontal force → vx is constant.' },
        { q:'At the highest point of a projectile’s path, its…', o:['Vy = 0','Vx = 0','Acceleration = 0','Speed = 0'], correct:0, fb:'Only the vertical component is momentarily zero.' }
      ]},
      waves:       { title:'Wave Motion',       formula:'v = fλ', summary:'Wave speed equals frequency times wavelength. Superposition gives interference.', quiz:[
        { q:'A wave has f=50Hz, λ=2m. Speed = ?', o:['25 m/s','52 m/s','100 m/s','None'], correct:2, fb:'v=fλ=50·2=100 m/s.' },
        { q:'Destructive interference happens when phase difference is…', o:['0','π/2','π','2π'], correct:2, fb:'Opposite phase cancels.' },
        { q:'In a transverse wave, particle motion is…', o:['Parallel to propagation','Perpendicular to propagation','Random','Circular'], correct:1 }
      ]},
      ohms:        { title:"Ohm's Law",         formula:'V = IR', summary:'For a metallic conductor at constant temperature, V ∝ I.', quiz:[
        { q:'If R=10Ω and V=20V then I = ?', o:['0.5A','2A','200A','None'], correct:1, fb:'I = V/R = 2A.' },
        { q:'Power P in a resistor equals…', o:['V/I','I²R','I/R','V·R'], correct:1 },
        { q:'Doubling the voltage across a fixed resistor will…', o:['Halve I','Double I','Quadruple I','Not change I'], correct:1 }
      ]},
      lens:        { title:'Thin Lens Optics',  formula:'1/f = 1/u + 1/v', summary:'Convex lenses converge light; image position depends on object distance and focal length.', quiz:[
        { q:'For a real image with a convex lens, object must be at…', o:['u < f','u = f','u > f','u = 0'], correct:2, fb:'Object beyond focal point → real, inverted image.' },
        { q:'Linear magnification m = ?', o:['v/u','u/v','v−u','v+u'], correct:0 },
        { q:'Focal length of a converging lens is taken as…', o:['Negative','Positive','Zero','Imaginary'], correct:1 }
      ]},
      hookes:      { title:"Hooke's Law",       formula:'F = ke', summary:'Within elastic limit, extension is proportional to applied force.', quiz:[
        { q:'k in F=ke is called…', o:['Stiffness/Spring constant','Friction coefficient','Modulus','Elastic ratio'], correct:0 },
        { q:'Unit of k =', o:['N','N/m','J','m/s²'], correct:1 },
        { q:'Beyond the elastic limit, the spring will…', o:['Snap back','Permanently deform','Lose all length','Become rigid'], correct:1 }
      ]},
      gaslaws:     { title:'Gas Laws',          formula:'PV/T = constant', summary:"Boyle's, Charles', Gay-Lussac's combine into the ideal gas equation.", quiz:[
        { q:"Boyle's Law: at constant T, P × V =", o:['constant','T','nR','0'], correct:0 },
        { q:"Charles' Law states V/T =", o:['constant at constant P','PT','P/T','0'], correct:0 },
        { q:'Absolute zero is approximately…', o:['0°C','−100°C','−273°C','−373°C'], correct:2 }
      ]},
      shm:         { title:'Simple Harmonic Motion', formula:'a = −ω²x', summary:'Acceleration is proportional to and opposite displacement from equilibrium.', quiz:[
        { q:'Period of a mass-spring system T =', o:['2π√(m/k)','2π√(k/m)','π√(m/k)','m/k'], correct:0 },
        { q:'At maximum displacement, KE is…', o:['Maximum','Zero','Half max','Constant'], correct:1 },
        { q:'Angular frequency ω =', o:['2π/T','T/2π','1/T','πT'], correct:0 }
      ]},
      induction:   { title:'EM Induction',       formula:'ε = −dΦ/dt', summary:"Faraday's law: changing flux induces EMF. Lenz: induced current opposes the change.", quiz:[
        { q:'A magnet moved faster through a coil → induced EMF…', o:['Decreases','Increases','Stays the same','Becomes zero'], correct:1 },
        { q:"Lenz's law follows from…", o:['Conservation of momentum','Conservation of energy','Newton II','Coulomb law'], correct:1 },
        { q:'Unit of magnetic flux is…', o:['Tesla','Weber','Henry','Coulomb'], correct:1 }
      ]},
      photo:       { title:'Photoelectric Effect', formula:'hf = φ + KEmax', summary:'Light below threshold frequency cannot eject electrons regardless of intensity.', quiz:[
        { q:'Increasing intensity (above threshold) increases…', o:['KE of electrons','Number of electrons','Threshold frequency','Work function'], correct:1 },
        { q:'Work function φ is…', o:['Minimum energy to free an electron','Photon energy','Photon momentum','Speed of light'], correct:0 },
        { q:'h represents…', o:["Planck's constant",'Hubble constant','Helium','Henry'], correct:0 }
      ]}
    },
    chemistry: {
      titration:   { title:'Acid-Base Titration', formula:'CₐVₐ = C_bV_b (n=1:1)', summary:'Find unknown concentration using a known standard solution and indicator.', quiz:[
        { q:'25mL HCl needs 12.5mL 0.1M NaOH. [HCl] =', o:['0.05M','0.1M','0.2M','0.4M'], correct:0, fb:'C=0.1·12.5/25=0.05M' },
        { q:'Phenolphthalein turns pink above pH about…', o:['3','5','8','12'], correct:2 },
        { q:'End-point is when…', o:['Indicator changes colour','Reaction stops','pH = 7','Solution boils'], correct:0 }
      ]},
      stoichiometry:{ title:'Stoichiometry', formula:'moles = mass/Mr', summary:'Limit by the limiting reagent; % yield = actual/theoretical × 100.', quiz:[
        { q:'Molar mass of H₂O =', o:['16','17','18','20'], correct:2 },
        { q:'In 2H₂+O₂→2H₂O, 4 mol H₂ needs… mol O₂', o:['1','2','4','8'], correct:1 },
        { q:'% yield = (actual/theoretical) × ?', o:['10','100','1000','π'], correct:1 }
      ]},
      bonding:     { title:'Chemical Bonding', formula:'ionic / covalent / metallic', summary:'Atoms bond to attain noble-gas configurations by transferring or sharing electrons.', quiz:[
        { q:'NaCl is held together by… bonds', o:['Ionic','Covalent','Metallic','Hydrogen'], correct:0 },
        { q:'Sharing of electrons creates a…', o:['Ionic bond','Covalent bond','Metallic bond','Dipole'], correct:1 },
        { q:'Metals conduct electricity because of…', o:['Mobile ions','Mobile electrons','Strong covalent bonds','Lattice vibrations only'], correct:1 }
      ]},
      ph:          { title:'pH & Indicators', formula:'pH = −log₁₀[H⁺]', summary:'Acids have pH<7, bases pH>7. Universal indicator shows full colour range.', quiz:[
        { q:'pH of 0.01M HCl =', o:['1','2','3','12'], correct:1 },
        { q:'Lemon juice has pH about…', o:['2','7','9','13'], correct:0 },
        { q:'Adding water to acid raises pH towards…', o:['0','7','14','−1'], correct:1 }
      ]},
      electro:     { title:'Electrochemistry', formula:'E°cell = E°cathode − E°anode', summary:'Galvanic cells convert chemical energy to electrical; electrolysis is the reverse.', quiz:[
        { q:'In a Zn|Cu Daniell cell, the anode is…', o:['Zn','Cu','Both','Neither'], correct:0 },
        { q:"Faraday's constant ≈", o:['96 500 C/mol','9.81 C','3·10⁸ m/s','6.02·10²³'], correct:0 },
        { q:'Electrolysis of brine produces…', o:['Cl₂, H₂, NaOH','O₂ only','CO₂','Na metal at room temp'], correct:0 }
      ]},
      organic:     { title:'Organic Chemistry', formula:'CnH(2n+2) alkanes', summary:'Hydrocarbons & functional groups define organic families.', quiz:[
        { q:'Methane formula =', o:['CH','CH₂','CH₃','CH₄'], correct:3 },
        { q:'Functional group of alcohol is…', o:['−OH','−COOH','−NH₂','−CHO'], correct:0 },
        { q:'Isomers have same… but different…', o:['Mass; volume','Formula; structure','Charge; mass','None'], correct:1 }
      ]},
      rates:       { title:'Reaction Rates', formula:'rate = Δ[product]/Δt', summary:'Temperature, concentration, surface area, catalysts affect rate.', quiz:[
        { q:'Increasing temperature usually… reaction rate', o:['Decreases','No effect','Doubles every 10°C (rule)','Eliminates'], correct:2 },
        { q:'A catalyst works by…', o:['Lowering activation energy','Raising activation energy','Adding mass','Changing products'], correct:0 },
        { q:'Powdered solid reacts faster than a block because of greater…', o:['Mass','Surface area','Volume','Density'], correct:1 }
      ]},
      qualitative: { title:'Qualitative Analysis', formula:'Flame, ppt, gas tests', summary:'Each cation/anion has distinctive colour/precipitation/gas reactions.', quiz:[
        { q:'Na⁺ flame colour =', o:['Crimson','Lilac','Yellow-orange','Green'], correct:2 },
        { q:'Cl⁻ confirmed with AgNO₃ giving… ppt', o:['Yellow','Cream','White','Brown'], correct:2 },
        { q:'CO₃²⁻ + acid → gas that…', o:['Turns lime water milky','Smells of egg','Bleaches paper','Explodes'], correct:0 }
      ]},
      separation:  { title:'Separation Techniques', formula:'physical methods', summary:'Use differences in properties (size, density, BP, solubility).', quiz:[
        { q:'Salt from sea water →', o:['Filtration','Evaporation','Distillation','Decantation'], correct:1 },
        { q:'Inks of different colours →', o:['Chromatography','Filtration','Distillation','Boiling'], correct:0 },
        { q:'Iodine from sand (sublimable) →', o:['Distillation','Sublimation','Filtration','Decantation'], correct:1 }
      ]},
      nuclear:     { title:'Nuclear Chemistry', formula:'N = N₀ e^(−λt)', summary:'Half-life: time for activity to halve. α, β, γ emissions.', quiz:[
        { q:'After 3 half-lives, fraction remaining =', o:['1/2','1/4','1/8','1/16'], correct:2 },
        { q:'β-particle is a…', o:['Electron','Helium nucleus','Photon','Proton'], correct:0 },
        { q:'γ-rays are…', o:['Particles','Electromagnetic waves','Sound','Magnetic only'], correct:1 }
      ]}
    },
    biology: {
      cell:        { title:'Cell Structure', formula:'—', summary:'Eukaryotes have membrane-bound organelles; prokaryotes do not.', quiz:[
        { q:'Powerhouse of the cell =', o:['Nucleus','Mitochondrion','Ribosome','Golgi'], correct:1 },
        { q:'Cell wall is found in…', o:['Animals','Plants & bacteria','Only humans','Only viruses'], correct:1 },
        { q:'Site of protein synthesis =', o:['Mitochondria','Ribosome','Nucleus','Lysosome'], correct:1 }
      ]},
      dna:         { title:'DNA & Genetics', formula:'A-T, G-C', summary:'DNA is a double helix; codons code for amino acids.', quiz:[
        { q:'Adenine pairs with…', o:['Guanine','Cytosine','Thymine','Uracil'], correct:2 },
        { q:'Number of bases in a codon =', o:['1','2','3','4'], correct:2 },
        { q:'Genes are located on…', o:['Mitochondria','Chromosomes','Ribosomes','Lipids'], correct:1 }
      ]},
      microbio:    { title:'Microbiology', formula:'—', summary:'Bacteria, viruses, fungi, protists — pathogens vs beneficial microbes.', quiz:[
        { q:'Antibiotics work against…', o:['Viruses','Bacteria','Fungi only','All germs'], correct:1 },
        { q:'Yeast is a…', o:['Bacterium','Virus','Fungus','Protist'], correct:2 },
        { q:'Vaccines train the…', o:['Brain','Immune system','Digestive system','Heart'], correct:1 }
      ]},
      ecology:     { title:'Ecology & Food Webs', formula:'Producers → Consumers', summary:'Energy flows; matter cycles. Trophic levels lose ~90% energy each step.', quiz:[
        { q:'Producers obtain energy from…', o:['Other plants','Sunlight','Soil only','Animals'], correct:1 },
        { q:'Apex predators are at the… trophic level', o:['Lowest','Middle','Highest','Equal'], correct:2 },
        { q:'A niche is…', o:['A pond','A role/place in ecosystem','A species','A nest'], correct:1 }
      ]},
      anatomy:     { title:'Human Anatomy', formula:'Systems', summary:'11 organ systems coordinate to maintain homeostasis.', quiz:[
        { q:'Hardest substance in the body =', o:['Bone','Enamel','Cartilage','Nail'], correct:1 },
        { q:'Number of chambers in the human heart =', o:['2','3','4','5'], correct:2 },
        { q:'Largest organ =', o:['Liver','Lung','Skin','Brain'], correct:2 }
      ]},
      photosynthesis:{ title:'Photosynthesis', formula:'6CO₂+6H₂O→C₆H₁₂O₆+6O₂', summary:'Plants use light energy to make glucose, releasing oxygen.', quiz:[
        { q:'Site of photosynthesis =', o:['Mitochondria','Chloroplast','Ribosome','Cell wall'], correct:1 },
        { q:'Pigment that absorbs light =', o:['Haemoglobin','Chlorophyll','Melanin','Keratin'], correct:1 },
        { q:'Gas released =', o:['CO₂','O₂','N₂','H₂'], correct:1 }
      ]},
      blood:       { title:'Blood & Circulation', formula:'—', summary:'Plasma carries cells; RBCs carry O₂ via haemoglobin; WBCs fight infection.', quiz:[
        { q:'Universal donor blood group =', o:['A','B','AB','O−'], correct:3 },
        { q:'O₂ binds to…', o:['Albumin','Haemoglobin','Glucose','Platelets'], correct:1 },
        { q:'Clotting cells =', o:['Erythrocytes','Leukocytes','Platelets','Lymph'], correct:2 }
      ]},
      nervous:     { title:'Nervous System', formula:'—', summary:'Neurons transmit signals via electrochemical action potentials.', quiz:[
        { q:'Basic unit of the nervous system =', o:['Neuron','Axon','Synapse','Dendrite'], correct:0 },
        { q:'Reflex arc bypasses the…', o:['Spinal cord','Brain','Muscles','Skin'], correct:1 },
        { q:'CNS comprises…', o:['Brain only','Brain + spinal cord','Nerves only','Muscles'], correct:1 }
      ]},
      evolution:   { title:'Evolution & Natural Selection', formula:'Variation + selection', summary:'Heritable traits that improve survival become more frequent over generations.', quiz:[
        { q:'Darwin proposed natural selection in…', o:['On The Origin of Species','Principia','Genetics','Microcosm'], correct:0 },
        { q:'Fossils provide evidence of…', o:['Climate only','Past life forms','Earthquakes','Stars'], correct:1 },
        { q:'A mutation is a change in…', o:['DNA sequence','Habitat','Mass','Energy'], correct:0 }
      ]},
      reproduction:{ title:'Reproduction', formula:'Mitosis vs Meiosis', summary:'Sexual reproduction provides variation; asexual produces clones.', quiz:[
        { q:'Human gametes are…', o:['Diploid','Haploid','Triploid','Polyploid'], correct:1 },
        { q:'Site of fertilisation in humans =', o:['Vagina','Uterus','Fallopian tube','Ovary'], correct:2 },
        { q:'Asexual reproduction produces offspring that are…', o:['Identical','Mixed','Mutated always','Sterile'], correct:0 }
      ]}
    },
    mathematics: {
      graphing:    { title:'Function Graphing', formula:'y = f(x)', summary:'Visualise linear, quadratic, trigonometric functions on Cartesian axes.', quiz:[
        { q:'y = 2x+1 has slope =', o:['1','2','3','0'], correct:1 },
        { q:'The graph of y = x² is a…', o:['Line','Parabola','Circle','Hyperbola'], correct:1 },
        { q:'y = sin x has period…', o:['π','2π','π/2','4π'], correct:1 }
      ]},
      trigonometry:{ title:'Trigonometry', formula:'sin²θ + cos²θ = 1', summary:'Ratios in right triangles; identities; sine & cosine rules.', quiz:[
        { q:'sin 30° =', o:['0','1/2','√3/2','1'], correct:1 },
        { q:'Cosine rule: a² =', o:['b²+c²−2bc cosA','b+c+A','b·c·A','b²−c²'], correct:0 },
        { q:'tan θ = sin θ / ?', o:['cot θ','cos θ','sec θ','1'], correct:1 }
      ]},
      statistics:  { title:'Statistics', formula:'mean = Σx/n', summary:'Measures of centre and spread; probability of events.', quiz:[
        { q:'Median of 2,4,6,8,10 =', o:['4','5','6','7'], correct:2 },
        { q:'Range of 3,7,2,9,5 =', o:['7','9','2','5'], correct:0, fb:'Max−Min = 9−2 = 7' },
        { q:'Variance is the … of standard deviation', o:['Square','Square root','Half','Cube'], correct:0 }
      ]},
      geometry:    { title:'Geometry', formula:'Various', summary:'Properties of shapes; angle sum, areas, volumes, similar/congruent figures.', quiz:[
        { q:'Sum of interior angles of a triangle =', o:['90°','180°','270°','360°'], correct:1 },
        { q:'Area of a circle =', o:['πr','πr²','2πr','πd'], correct:1 },
        { q:'Pythagoras: a² + b² =', o:['c','c²','2c','ab'], correct:1 }
      ]},
      algebra:     { title:'Algebra', formula:'Identities & equations', summary:'Solve linear, quadratic and simultaneous equations.', quiz:[
        { q:'Solve 2x+3=11 → x =', o:['2','3','4','5'], correct:2 },
        { q:'(a+b)² =', o:['a²+b²','a²+2ab+b²','a²−b²','2ab'], correct:1 },
        { q:'Roots of x²−5x+6 are…', o:['1,5','2,3','−2,3','−1,6'], correct:1 }
      ]},
      calculus:    { title:'Calculus (Intro)', formula:'dy/dx', summary:'Derivatives measure rate of change; integrals accumulate area under curves.', quiz:[
        { q:'d/dx(x²) =', o:['x','2x','x²','2'], correct:1 },
        { q:'∫2x dx =', o:['x','x²+C','2x²+C','x³'], correct:1 },
        { q:'The slope of a tangent line equals the…', o:['Integral','Derivative','Limit','Variance'], correct:1 }
      ]},
      sequences:   { title:'Sequences & Series', formula:'Tₙ = a + (n−1)d', summary:'Arithmetic and geometric progressions.', quiz:[
        { q:'AP with a=2, d=3, T₅ =', o:['11','14','17','20'], correct:1, fb:'2 + 4·3 = 14' },
        { q:'Sum of first n positive integers =', o:['n','n²','n(n+1)/2','2n'], correct:2 },
        { q:'GP common ratio r is…', o:['Tₙ−Tₙ₋₁','Tₙ/Tₙ₋₁','Tₙ+Tₙ₋₁','Tₙ²'], correct:1 }
      ]},
      vectors:     { title:'Vectors', formula:'|v| = √(x²+y²)', summary:'Quantities with magnitude and direction; addition by triangle/parallelogram.', quiz:[
        { q:'Magnitude of (3,4) =', o:['5','7','12','25'], correct:0 },
        { q:'Dot product (1,2)·(3,4) =', o:['8','10','11','14'], correct:2 },
        { q:'Resultant of perpendicular 3N + 4N forces =', o:['5N','7N','12N','25N'], correct:0 }
      ]},
      probability: { title:'Probability', formula:'P = favourable/total', summary:'0 ≤ P ≤ 1. Independent vs dependent events.', quiz:[
        { q:'P(heads) on fair coin =', o:['0','1/4','1/2','1'], correct:2 },
        { q:'P(6 on a die) =', o:['1/2','1/3','1/6','1/12'], correct:2 },
        { q:'P(A) + P(not A) =', o:['0','1','2','depends'], correct:1 }
      ]},
      matrices:    { title:'Matrices', formula:'AB ≠ BA generally', summary:'Rectangular arrays used for linear transformations and systems.', quiz:[
        { q:'A 2×3 matrix has… rows and columns', o:['2,3','3,2','2,2','3,3'], correct:0 },
        { q:'Identity matrix I has 1s on the…', o:['Top row','Diagonal','Bottom row','Corner'], correct:1 },
        { q:'det([[1,2],[3,4]]) =', o:['−2','2','10','−10'], correct:0, fb:'1·4 − 2·3 = −2' }
      ]}
    },
    'general-science': {
      earth:       { title:'Earth Science', formula:'—', summary:'Layers, plates, weathering, atmosphere, water cycle.', quiz:[
        { q:'Innermost layer =', o:['Crust','Mantle','Outer core','Inner core'], correct:3 },
        { q:'Continental drift is caused by…', o:['Tides','Plate tectonics','Wind','Earthquakes only'], correct:1 },
        { q:'Most abundant gas in air =', o:['O₂','N₂','CO₂','Ar'], correct:1 }
      ]},
      solar:       { title:'Solar System & Astronomy', formula:'—', summary:'Planets, moons, gravitation, eclipses.', quiz:[
        { q:'Closest planet to the Sun =', o:['Venus','Mercury','Earth','Mars'], correct:1 },
        { q:'A solar eclipse occurs when…', o:['Sun blocks Moon','Moon between Sun & Earth','Earth between Sun & Moon','Mars passes'], correct:1 },
        { q:'Light from Sun reaches Earth in about…', o:['8 sec','8 min','8 hr','8 days'], correct:1 }
      ]},
      method:      { title:'Scientific Method', formula:'—', summary:'Observation → Hypothesis → Experiment → Conclusion → Communication.', quiz:[
        { q:'A testable explanation is a…', o:['Theory','Hypothesis','Law','Conclusion'], correct:1 },
        { q:'Variable changed by the scientist =', o:['Independent','Dependent','Control','Constant'], correct:0 },
        { q:'Repeating an experiment increases its…', o:['Bias','Reliability','Cost','Speed'], correct:1 }
      ]},
      electronics: { title:'Basic Electronics', formula:'V=IR, P=VI', summary:'Resistors, capacitors, diodes, simple logic gates.', quiz:[
        { q:'AND gate: 1 AND 0 =', o:['0','1','undefined','both'], correct:0 },
        { q:'A diode allows current in…', o:['Both directions','One direction','No direction','Random'], correct:1 },
        { q:'Capacitance is measured in…', o:['Ohms','Henrys','Farads','Volts'], correct:2 }
      ]},
      safety:      { title:'Lab Safety', formula:'PPE', summary:'Goggles, gloves, lab coat, fire safety, MSDS.', quiz:[
        { q:'PPE stands for…', o:['Personal Protective Equipment','Pump Power Energy','Public Park Entry','Plant Plant Equipment'], correct:0 },
        { q:'For acid burns first…', o:['Apply oil','Wash with plenty of water','Put on plaster','Cover with cloth'], correct:1 },
        { q:'Bunsen burner blue flame is…', o:['Hotter than yellow','Cooler than yellow','Same','Toxic'], correct:0 }
      ]},
      environment: { title:'Environmental Science', formula:'—', summary:'Pollution, climate change, conservation, sustainability.', quiz:[
        { q:'Greenhouse gas mainly =', o:['O₂','CO₂','N₂','Ar'], correct:1 },
        { q:'Ozone layer protects us from…', o:['UV','IR','Visible','Radio'], correct:0 },
        { q:'Biodegradable waste =', o:['Plastic','Glass','Food scraps','Aluminium'], correct:2 }
      ]},
      matter:      { title:'States of Matter', formula:'Solid/Liquid/Gas/Plasma', summary:'Particles arrangement and energy define state. Phase changes need energy.', quiz:[
        { q:'Melting is solid →…', o:['Gas','Liquid','Plasma','Same'], correct:1 },
        { q:'Sublimation is solid →…', o:['Liquid','Gas','Plasma','Solid'], correct:1 },
        { q:'Plasma exists in…', o:['Ice','Sun/stars','Lakes','Caves'], correct:1 }
      ]},
      machines:    { title:'Simple Machines', formula:'MA = load/effort', summary:'Lever, pulley, inclined plane, wheel & axle reduce effort.', quiz:[
        { q:'A see-saw is an example of a…', o:['Lever','Pulley','Wedge','Wheel'], correct:0 },
        { q:'Mechanical advantage > 1 means…', o:['Less effort needed','More effort','No effect','Negative'], correct:0 },
        { q:'A ramp is also called an…', o:['Inclined plane','Wedge','Lever','Pulley'], correct:0 }
      ]},
      ocean:       { title:'Ocean & Hydrology', formula:'—', summary:'Currents, tides, salinity, water cycle.', quiz:[
        { q:'Cause of tides =', o:['Sun & Moon gravity','Wind only','Volcanoes','Currents'], correct:0 },
        { q:'~% of Earth covered by water =', o:['30%','50%','71%','90%'], correct:2 },
        { q:'Salinity is highest in…', o:['Rivers','Open ocean','Dead Sea','Springs'], correct:2 }
      ]},
      telescopes:  { title:'Telescopes & Optics', formula:'M = fo/fe', summary:'Refracting and reflecting telescopes magnify distant objects.', quiz:[
        { q:'Refracting telescope uses…', o:['Lenses','Mirrors','Prisms only','Lasers'], correct:0 },
        { q:'Magnification depends on…', o:['Eyepiece focal length','Both objective & eyepiece f','Diameter only','Colour'], correct:1 },
        { q:'Hubble is a … telescope', o:['Refracting','Reflecting (space)','Radio','Solar'], correct:1 }
      ]}
    }
  };

  /* ---------- Generic interactive simulation engines ---------- */
  /* Generic graphing helper */
  function drawGrid(cx, w, h, step) {
    step = step || 40;
    cx.save();
    cx.strokeStyle = 'rgba(150,150,150,.18)'; cx.lineWidth = 1;
    for (var x = 0; x <= w; x += step) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, h); cx.stroke(); }
    for (var y = 0; y <= h; y += step) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(w, y); cx.stroke(); }
    cx.restore();
  }

  /* ---------- Periodic Table renderer ---------- */
  function renderPeriodicTable(rootSel, infoSel, opts) {
    opts = opts || {};
    var root = typeof rootSel === 'string' ? document.querySelector(rootSel) : rootSel;
    var info = typeof infoSel === 'string' ? document.querySelector(infoSel) : infoSel;
    if (!root) return;
    var search = opts.searchInput ? (typeof opts.searchInput === 'string' ? document.querySelector(opts.searchInput) : opts.searchInput) : null;
    var legend = opts.legend ? (typeof opts.legend === 'string' ? document.querySelector(opts.legend) : opts.legend) : null;

    // Build main grid (rows 1-7)
    var grid = document.createElement('div'); grid.className = 'pt-grid';
    for (var r = 1; r <= 7; r++) {
      for (var c = 1; c <= 18; c++) {
        var el = ELEMENTS.find(function (e) { return e.r === r && e.c === c; });
        var cell;
        if (el) {
          cell = makeElCell(el);
        } else {
          cell = document.createElement('div'); cell.className = 'pt-el emp';
        }
        grid.appendChild(cell);
      }
    }
    // f-block (rows 8 and 9)
    var fb1 = document.createElement('div'); fb1.className = 'pt-fb';
    var lbl1 = document.createElement('div'); lbl1.className = 'pt-fb-label'; lbl1.textContent = '57–71';
    fb1.appendChild(lbl1);
    for (var c1 = 3; c1 <= 17; c1++) {
      var lanEl = ELEMENTS.find(function (e) { return e.r === 8 && e.c === c1; });
      fb1.appendChild(lanEl ? makeElCell(lanEl) : (function(){var d=document.createElement('div');d.className='pt-el emp';return d;})());
    }
    var fb2 = document.createElement('div'); fb2.className = 'pt-fb';
    var lbl2 = document.createElement('div'); lbl2.className = 'pt-fb-label'; lbl2.textContent = '89–103';
    fb2.appendChild(lbl2);
    for (var c2 = 3; c2 <= 17; c2++) {
      var actEl = ELEMENTS.find(function (e) { return e.r === 9 && e.c === c2; });
      fb2.appendChild(actEl ? makeElCell(actEl) : (function(){var d=document.createElement('div');d.className='pt-el emp';return d;})());
    }
    var wrap = document.createElement('div'); wrap.className = 'pt-wrap';
    wrap.appendChild(grid); wrap.appendChild(fb1); wrap.appendChild(fb2);
    root.innerHTML = ''; root.appendChild(wrap);

    if (legend) {
      legend.className = 'pt-legend';
      legend.innerHTML = Object.keys(CAT_COLORS).map(function (k) {
        return '<span data-cat="' + k + '"><span class="sw" style="background:' + CAT_COLORS[k] + '"></span>' + CAT_NAMES[k] + '</span>';
      }).join('') + '<span data-cat="all" style="background:var(--bg-alt)"><strong>Show All</strong></span>';
      legend.querySelectorAll('span[data-cat]').forEach(function (s) {
        s.addEventListener('click', function () {
          var k = s.getAttribute('data-cat');
          root.querySelectorAll('.pt-el').forEach(function (e) {
            if (e.classList.contains('emp')) return;
            if (k === 'all') { e.classList.remove('dimmed'); }
            else { e.classList.toggle('dimmed', e.getAttribute('data-cat') !== k); }
          });
        });
      });
    }
    if (search) {
      search.addEventListener('input', function () {
        var q = this.value.toLowerCase().trim();
        root.querySelectorAll('.pt-el').forEach(function (e) {
          if (e.classList.contains('emp')) return;
          var n = (e.getAttribute('data-name') || '').toLowerCase();
          var s = (e.getAttribute('data-sym') || '').toLowerCase();
          var num = e.getAttribute('data-n');
          var match = !q || n.indexOf(q) !== -1 || s === q || num === q;
          e.classList.toggle('dimmed', !match);
          e.classList.toggle('focused', !!q && match);
        });
      });
    }

    function makeElCell(el) {
      var d = document.createElement('div');
      d.className = 'pt-el';
      d.style.background = CAT_COLORS[el.cat] || '#ddd';
      d.setAttribute('data-n', el.n); d.setAttribute('data-sym', el.sym);
      d.setAttribute('data-name', el.name); d.setAttribute('data-cat', el.cat);
      d.title = el.name + ' (' + el.sym + ') — ' + CAT_NAMES[el.cat];
      d.innerHTML = '<span class="num">' + el.n + '</span><span class="sym">' + el.sym + '</span><span class="name">' + el.name + '</span><span class="mass">' + el.m + '</span>';
      d.addEventListener('click', function () { showElement(el); });
      return d;
    }
    function showElement(el) {
      if (!info) return;
      var st = STATE_NAMES[el.state] || '—';
      var period = el.r <= 7 ? el.r : (el.r === 8 ? '6 (f-block)' : '7 (f-block)');
      var group = (el.r <= 7 && [1,2,13,14,15,16,17,18].indexOf(el.c) !== -1) ? String(el.c) : (el.r >= 8 ? '—' : '3–12 (d-block)');
      info.innerHTML =
        '<div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;">' +
          '<div class="pt-el" style="width:120px;height:120px;border:2px solid #333;background:' + CAT_COLORS[el.cat] + ';cursor:default;transform:none;">' +
            '<span class="num" style="font-size:11px">' + el.n + '</span>' +
            '<span class="sym" style="font-size:2rem">' + el.sym + '</span>' +
            '<span class="name" style="font-size:.8rem">' + el.name + '</span>' +
            '<span class="mass" style="font-size:.7rem">' + el.m + '</span>' +
          '</div>' +
          '<div style="flex:1;min-width:240px">' +
            '<h3 style="font-size:1.6rem;font-weight:800;margin:0">' + el.name + ' <span style="color:var(--tl2);font-weight:400;font-size:1rem">(' + el.sym + ')</span></h3>' +
            '<p style="color:var(--tl);margin:.25rem 0">Atomic number <strong>' + el.n + '</strong> · ' + CAT_NAMES[el.cat] + '</p>' +
            '<p style="font-size:.85rem;color:var(--tl)">' + el.use + '</p>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.6rem;margin-top:1rem;font-size:.86rem">' +
          card('Atomic Mass', el.m + ' u') +
          card('Electron Config', el.ec) +
          card('State (STP)', st) +
          card('Period', String(period)) +
          card('Group', group) +
          card('Category', CAT_NAMES[el.cat]) +
          card('Electronegativity', el.eneg !== null && el.eneg !== undefined ? String(el.eneg) : 'N/A') +
        '</div>' +
        '<p style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--bl);font-size:.82rem;color:var(--tl2)">' +
          (el.cat === 'transition' ? 'Transition metals form coloured compounds and have variable oxidation states.' :
           el.cat === 'noble-gas' ? 'Noble gases have full outer shells — very unreactive.' :
           el.cat === 'alkali-metal' ? 'Alkali metals are highly reactive and form +1 ions.' :
           el.cat === 'halogen' ? 'Halogens are reactive non-metals forming −1 ions.' :
           'Elements in the same group have similar chemical properties.') +
        '</p>';
      try { info.scrollIntoView({ behavior:'smooth', block:'nearest' }); } catch(e){}
    }
    function card(k, v){ return '<div style="background:var(--bg-alt);padding:.6rem .8rem;border-radius:6px;border:1px solid var(--bl)"><div style="font-size:.7rem;color:var(--tl2);text-transform:uppercase;letter-spacing:.05em">'+k+'</div><div style="font-weight:600;margin-top:2px">'+v+'</div></div>'; }
    // Auto-show H
    var first = ELEMENTS[0]; showElement(first);
    return { showElement: showElement };
  }

  /* ---------- Quiz engine ---------- */
  function renderQuiz(rootSel, qs, opts) {
    opts = opts || {};
    var root = typeof rootSel === 'string' ? document.querySelector(rootSel) : rootSel;
    if (!root) return;
    var html = qs.map(function (q, i) {
      return '<div class="quiz-q" data-i="' + i + '"><div class="q-txt">' + (i + 1) + '. ' + q.q + '</div><div class="opts">' +
        q.o.map(function (o, j) { return '<label><input type="radio" name="q' + i + '" value="' + j + '"> ' + o + '</label>'; }).join('') +
        '<div class="quiz-fb" style="display:none"></div></div>';
    }).join('');
    html += '<div style="display:flex;gap:.5rem;margin-top:.75rem;flex-wrap:wrap"><button class="btn btn-pri q-submit">✓ Submit</button><button class="btn btn-ghost q-reset">↺ Reset</button><span class="q-score" style="margin-left:auto;font-weight:700;color:var(--a)"></span></div>';
    root.innerHTML = html;
    root.querySelector('.q-submit').onclick = function () {
      var got = 0;
      qs.forEach(function (q, i) {
        var sel = root.querySelector('input[name=q' + i + ']:checked');
        var card = root.querySelector('.quiz-q[data-i="' + i + '"]');
        card.classList.remove('correct', 'wrong');
        var fb = card.querySelector('.quiz-fb');
        if (sel) {
          var v = +sel.value;
          if (v === q.correct) { got++; card.classList.add('correct'); fb.innerHTML = '✓ Correct. ' + (q.fb || ''); }
          else { card.classList.add('wrong'); fb.innerHTML = '✗ Correct answer: <strong>' + q.o[q.correct] + '</strong>. ' + (q.fb || ''); }
          fb.style.display = 'block';
        }
      });
      var pct = Math.round(got / qs.length * 100);
      root.querySelector('.q-score').textContent = 'Score: ' + got + '/' + qs.length + ' (' + pct + '%)';
      if (opts.studentId && opts.sim) trackProgress(opts.studentId, opts.sim, { score: pct, completed: true });
      if (pct === 100 && opts.studentId) awardBadge(opts.studentId, 'perfect');
      toast('Quiz scored: ' + pct + '%', pct >= 70 ? 'success' : 'warn');
    };
    root.querySelector('.q-reset').onclick = function () {
      root.querySelectorAll('input[type=radio]').forEach(function (i) { i.checked = false; });
      root.querySelectorAll('.quiz-q').forEach(function (c) { c.classList.remove('correct', 'wrong'); c.querySelector('.quiz-fb').style.display = 'none'; });
      root.querySelector('.q-score').textContent = '';
    };
  }

  /* ---------- Auto init ---------- */
  function init() {
    applyTheme();
    var tg = document.querySelector('.nav-toggle'), mn = document.querySelector('.nav-menu');
    if (tg && mn) { tg.addEventListener('click', function () { mn.classList.toggle('open'); tg.classList.toggle('open'); }); }
    var bt = document.querySelector('.btt, #back-to-top');
    if (bt) {
      window.addEventListener('scroll', function () { bt.classList.toggle('visible', window.scrollY > 400); }, { passive: true });
      bt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
    var p = window.location.pathname;
    document.querySelectorAll('.nav-menu a').forEach(function (a) {
      var h = a.getAttribute('href') || '';
      if (h && h !== 'index.html' && p.indexOf(h.replace('.html','').replace(/^\.\.\//,'')) !== -1) a.classList.add('active');
    });
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var t = parseInt(el.dataset.count, 10); if (isNaN(t)) return;
      var s = performance.now();
      requestAnimationFrame(function tick(now) {
        var p = Math.min((now - s) / 1800, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * t);
        if (p < 1) requestAnimationFrame(tick);
      });
    });

    // Sim search hook
    var sb = document.getElementById('sim-search');
    if (sb) sb.addEventListener('input', function () {
      var q = this.value.toLowerCase();
      document.querySelectorAll('.sim-card').forEach(function (c) { c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none'; });
    });

    // Theme toggle button if present
    var tt = document.getElementById('theme-toggle');
    if (tt) tt.addEventListener('click', function () {
      var cur = (store.settings && store.settings.theme) === 'dark' ? 'light' : 'dark';
      setTheme(cur); tt.textContent = cur === 'dark' ? '☀️' : '🌙';
    });
    if (tt) tt.textContent = (store.settings && store.settings.theme) === 'dark' ? '☀️' : '🌙';

    console.log('🏫 HMG Academy Virtual Lab v6 — ready');
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    /* state */ getState:getState, setState:setState, persist:persist, logActivity:logActivity,
    /* students/classes */ addStudent:addStudent, bulkImportStudents:bulkImportStudents,
    createClass:createClass, getClasses:getClasses, archiveClass:archiveClass, joinClass:joinClass,
    trackProgress:trackProgress, getLeaderboard:getLeaderboard,
    /* badges */ awardBadge:awardBadge, getStudentBadges:getStudentBadges, BADGES:BADGES,
    /* assessments */ createAssessment:createAssessment, deleteAssessment:deleteAssessment, submitAssessment:submitAssessment,
    /* ui */ toast:toast, modal:modal, notify:notify, setTheme:setTheme,
    /* data */ ELEMENTS:ELEMENTS, CAT_NAMES:CAT_NAMES, CAT_COLORS:CAT_COLORS, STATE_NAMES:STATE_NAMES,
    CONTENT:CONTENT,
    /* exports */ downloadCSV:downloadCSV, downloadJSON:downloadJSON, backupAll:backupAll, restoreAll:restoreAll,
    /* helpers */ drawGrid:drawGrid, renderPeriodicTable:renderPeriodicTable, renderQuiz:renderQuiz,
    init:init
  };
})();

/* --- v7 additional CONTENT (auto-generated) --- */
(function(){if(typeof HMG==='undefined')return;var EXT={"physics": {"freefall": {"title": "Free Fall", "formula": "s = ½gt²", "summary": "Falling from rest under gravity only.", "quiz": [{"q": "After 2 s of free fall, v = ?", "o": ["9.8", "19.6", "4.9", "2"], "correct": 1, "fb": "v=gt=9.8·2=19.6 m/s"}, {"q": "Distance fallen in 3 s ≈", "o": ["29.4 m", "44.1 m", "9.8 m", "19.6 m"], "correct": 1, "fb": "s=½·9.8·9=44.1"}, {"q": "On the Moon g is smaller, so an object falls…", "o": ["Faster", "Slower", "Same", "Sideways"], "correct": 1, "fb": ""}]}, "newton2": {"title": "Newton's 2nd Law", "formula": "F=ma", "summary": "Acceleration ∝ net force and ∝ 1/mass.", "quiz": [{"q": "F=20N on m=5kg → a = ?", "o": ["1", "2", "4", "5"], "correct": 2, "fb": "20/5=4"}, {"q": "Doubling mass halves the…", "o": ["Force", "Acceleration", "Friction", "Weight"], "correct": 1, "fb": ""}, {"q": "Unit of force = …", "o": ["Joule", "Newton", "Watt", "Pascal"], "correct": 1, "fb": ""}]}, "friction": {"title": "Friction", "formula": "f=μN", "summary": "Friction opposes motion; depends on surfaces.", "quiz": [{"q": "μ between two surfaces is…", "o": ["Mass", "Acceleration", "Coefficient of friction", "Force"], "correct": 2, "fb": ""}, {"q": "Static friction is usually… kinetic", "o": [">", "<", "=", "none"], "correct": 0, "fb": ""}, {"q": "Doubling normal force will…", "o": ["Halve f", "Double f", "Not change f", "Reduce f"], "correct": 1, "fb": ""}]}, "energy": {"title": "Work & Power", "formula": "W=Fd", "summary": "Energy is conserved; work = energy transferred.", "quiz": [{"q": "Unit of power =", "o": ["Newton", "Watt", "Joule", "Pascal"], "correct": 1, "fb": ""}, {"q": "Lifting 5kg by 2m needs W=… (g=10)", "o": ["10 J", "50 J", "100 J", "20 J"], "correct": 2, "fb": ""}, {"q": "1 kWh equals…", "o": ["3 600 J", "3.6×10⁶ J", "60 J", "10⁶ J"], "correct": 1, "fb": ""}]}, "momentum": {"title": "Momentum", "formula": "p=mv", "summary": "Total momentum conserved in collisions.", "quiz": [{"q": "Unit of momentum =", "o": ["kg·m/s", "N/s", "J", "W"], "correct": 0, "fb": ""}, {"q": "Inelastic collision conserves…", "o": ["KE only", "Momentum only", "Both", "Neither"], "correct": 1, "fb": ""}, {"q": "Δp equals…", "o": ["F·t", "F/t", "F+t", "m·a"], "correct": 0, "fb": ""}]}, "density": {"title": "Density", "formula": "ρ=m/V", "summary": "Floats if density < fluid.", "quiz": [{"q": "Density of water =", "o": ["1 kg/m³", "100 kg/m³", "1 000 kg/m³", "10 000 kg/m³"], "correct": 2, "fb": ""}, {"q": "Floats means object is …er than water", "o": ["dens", "less dens", "equal", "none"], "correct": 1, "fb": ""}, {"q": "Buoyant force depends on…", "o": ["Mass only", "Volume submerged", "Colour", "Height of bucket"], "correct": 1, "fb": ""}]}, "pressure": {"title": "Pressure", "formula": "P=F/A", "summary": "Smaller area → more pressure.", "quiz": [{"q": "Unit of pressure =", "o": ["Pa", "N", "J", "W"], "correct": 0, "fb": ""}, {"q": "Same force, smaller area → P …", "o": ["smaller", "larger", "same", "zero"], "correct": 1, "fb": ""}, {"q": "Pressure in liquids increases with…", "o": ["depth", "colour", "width", "temperature only"], "correct": 0, "fb": ""}]}, "refraction": {"title": "Snell's Law", "formula": "n₁sinθ₁=n₂sinθ₂", "summary": "Light bends towards normal in denser medium.", "quiz": [{"q": "n of water ≈", "o": ["1.00", "1.33", "1.52", "2.42"], "correct": 1, "fb": ""}, {"q": "Going from air to glass, light bends …", "o": ["away from", "toward", "never", "along"], "correct": 1, "fb": ""}, {"q": "Critical angle leads to…", "o": ["More refraction", "Total internal reflection", "Reflection only", "Dispersion"], "correct": 1, "fb": ""}]}, "sound": {"title": "Sound", "formula": "v=fλ", "summary": "Sound is a longitudinal mechanical wave.", "quiz": [{"q": "Speed of sound in air ≈", "o": ["3×10⁸ m/s", "340 m/s", "1500 m/s", "30 m/s"], "correct": 1, "fb": ""}, {"q": "Higher frequency → … pitch", "o": ["lower", "higher", "same", "none"], "correct": 1, "fb": ""}, {"q": "Ultrasound is above…", "o": ["20 Hz", "2000 Hz", "20 kHz", "20 MHz"], "correct": 2, "fb": ""}]}, "heat": {"title": "Heat", "formula": "Q=mcΔT", "summary": "Heat needed depends on mass, c and ΔT.", "quiz": [{"q": "c of water (J/kg·K) ≈", "o": ["420", "4200", "42", "42000"], "correct": 1, "fb": ""}, {"q": "Doubling mass doubles…", "o": ["Specific heat", "Heat needed", "Temperature", "Volume only"], "correct": 1, "fb": ""}, {"q": "Unit of heat = …", "o": ["J", "Pa", "N", "W"], "correct": 0, "fb": ""}]}, "capacitor": {"title": "Capacitor", "formula": "V=V₀(1−e^(-t/RC))", "summary": "RC determines charging speed.", "quiz": [{"q": "Unit of capacitance =", "o": ["Ω", "F", "H", "C"], "correct": 1, "fb": ""}, {"q": "Time constant =", "o": ["R/C", "RC", "C/R", "RC²"], "correct": 1, "fb": ""}, {"q": "After 5τ capacitor is ≈…% charged", "o": ["50", "63", "99", "37"], "correct": 2, "fb": ""}]}, "doppler": {"title": "Doppler", "formula": "f'=fv/(v-vs)", "summary": "Approaching source → higher pitch.", "quiz": [{"q": "Siren approaching: pitch …", "o": ["lower", "higher", "same", "silent"], "correct": 1, "fb": ""}, {"q": "Doppler also applies to…", "o": ["heat", "light/radio", "mass", "weight"], "correct": 1, "fb": ""}, {"q": "Used by radar to measure…", "o": ["mass", "speed", "colour", "gravity"], "correct": 1, "fb": ""}]}, "radioactivity": {"title": "Radioactive Decay", "formula": "N=N₀(½)^(t/T)", "summary": "Random spontaneous nuclear decay.", "quiz": [{"q": "After 2 half-lives N/N₀ =", "o": ["1/2", "1/4", "1/8", "1/16"], "correct": 1, "fb": ""}, {"q": "α-particle is a…", "o": ["H nucleus", "He-4 nucleus", "Electron", "Photon"], "correct": 1, "fb": ""}, {"q": "γ-rays are…", "o": ["Electrons", "EM waves", "Sound", "Heavy particles"], "correct": 1, "fb": ""}]}, "blackbody": {"title": "Thermal Radiation", "formula": "P=εσAT⁴", "summary": "Power ∝ T⁴.", "quiz": [{"q": "Doubling T multiplies power by…", "o": ["2", "4", "8", "16"], "correct": 3, "fb": ""}, {"q": "Stefan constant σ ≈", "o": ["1×10⁻⁸", "5.67×10⁻⁸", "6.02×10²³", "9.81"], "correct": 1, "fb": ""}, {"q": "Sun appears yellow because its T ≈", "o": ["300 K", "1000 K", "6000 K", "20000 K"], "correct": 2, "fb": ""}]}, "spectrum": {"title": "Light Spectrum", "formula": "λRed > λViolet", "summary": "White light = mixture of colours.", "quiz": [{"q": "Longest visible wavelength =", "o": ["Red", "Yellow", "Green", "Violet"], "correct": 0, "fb": ""}, {"q": "Order of dispersion:", "o": ["VIBGYOR", "ROYGBIV", "RGBVOY", "BVRYOG"], "correct": 1, "fb": ""}, {"q": "Visible range (nm) ≈", "o": ["10-100", "400-700", "700-1000", "1-10"], "correct": 1, "fb": ""}]}}, "chemistry": {"atomic-structure": {"title": "Atomic Structure", "formula": "A = Z + N", "summary": "Atom = nucleus + electron shells.", "quiz": [{"q": "Charge of a proton =", "o": ["−1", "0", "+1", "+2"], "correct": 2, "fb": ""}, {"q": "Mass number A =", "o": ["protons", "protons+electrons", "protons+neutrons", "electrons"], "correct": 2, "fb": ""}, {"q": "Maximum electrons in 1st shell =", "o": ["2", "8", "18", "32"], "correct": 0, "fb": ""}]}, "molar-mass": {"title": "Molar Mass", "formula": "M=Σ(nₐ·Mₐ)", "summary": "Sum atomic masses with subscripts.", "quiz": [{"q": "M of H₂O ≈", "o": ["10", "18", "20", "32"], "correct": 1, "fb": ""}, {"q": "M of CO₂ ≈", "o": ["28", "32", "44", "48"], "correct": 2, "fb": ""}, {"q": "1 mole of any substance contains…", "o": ["1", "6.02×10²³", "100", "1000"], "correct": 1, "fb": ""}]}, "solubility": {"title": "Solubility", "formula": "g solute / 100 g water", "summary": "Most salts ↑ solubility with T.", "quiz": [{"q": "NaCl solubility with T is almost…", "o": ["unchanged", "tripled", "halved", "zero"], "correct": 0, "fb": ""}, {"q": "Above solubility limit, solution is…", "o": ["unsaturated", "saturated", "supersaturated", "colloidal"], "correct": 2, "fb": ""}, {"q": "Solubility of gases in liquids… with T", "o": ["increases", "decreases", "stays", "none"], "correct": 1, "fb": ""}]}, "concentration": {"title": "Concentration", "formula": "C₁V₁=C₂V₂", "summary": "Moles conserved on dilution.", "quiz": [{"q": "100 mL 2M HCl diluted to 500 mL gives", "o": ["0.2 M", "0.4 M", "1 M", "2 M"], "correct": 1, "fb": ""}, {"q": "Molarity unit =", "o": ["mol/L", "g/L", "mol/kg", "%"], "correct": 0, "fb": ""}, {"q": "Adding water… concentration", "o": ["increases", "decreases", "stays", "triples"], "correct": 1, "fb": ""}]}, "equilibrium": {"title": "Equilibrium", "formula": "Kc=[P]/[R]", "summary": "Dynamic balance.", "quiz": [{"q": "Adding heat to endothermic reaction shifts equilibrium…", "o": ["←", "→", "none", "cancels"], "correct": 1, "fb": ""}, {"q": "Kc depends on…", "o": ["pressure", "temperature", "colour", "volume"], "correct": 1, "fb": ""}, {"q": "Catalyst affects…", "o": ["Kc", "rates only", "yield", "equilibrium position"], "correct": 1, "fb": ""}]}, "kinetic-theory": {"title": "KMT", "formula": "KE∝T", "summary": "Gas particles move faster when hot.", "quiz": [{"q": "Doubling T quadruples…", "o": ["v_rms", "KE", "P at const V", "volume"], "correct": 1, "fb": ""}, {"q": "At absolute zero, KE = ", "o": ["max", "0", "∞", "constant"], "correct": 1, "fb": ""}, {"q": "Diffusion is…", "o": ["mixing of gases", "reflection", "sublimation", "melting"], "correct": 0, "fb": ""}]}, "hess": {"title": "Hess's Law", "formula": "ΔH=ΣΔHsteps", "summary": "Enthalpy is path-independent.", "quiz": [{"q": "If A→B is −80 and B→C is −20, A→C = ", "o": ["+100", "−60", "−100", "+60"], "correct": 2, "fb": ""}, {"q": "Endothermic ΔH is…", "o": ["−", "+", "0", "both"], "correct": 1, "fb": ""}, {"q": "Hess's law is based on…", "o": ["energy conservation", "mass conservation", "momentum", "entropy"], "correct": 0, "fb": ""}]}, "buffer": {"title": "Buffer", "formula": "Henderson-Hasselbalch", "summary": "Resists pH change.", "quiz": [{"q": "Buffer pH depends on…", "o": ["mass", "pKa & ratio", "volume", "colour"], "correct": 1, "fb": ""}, {"q": "Blood is a … buffer", "o": ["bicarbonate", "sulfate", "nitrate", "none"], "correct": 0, "fb": ""}, {"q": "Buffer made of weak acid + …", "o": ["strong acid", "salt of acid", "strong base", "water only"], "correct": 1, "fb": ""}]}, "catalysis": {"title": "Catalysis", "formula": "Lowers Ea", "summary": "Increases rate, not equilibrium.", "quiz": [{"q": "Catalyst is …", "o": ["consumed", "unchanged", "always solid", "slow"], "correct": 1, "fb": ""}, {"q": "Enzymes are biological…", "o": ["acids", "catalysts", "sugars", "bases"], "correct": 1, "fb": ""}, {"q": "MnO₂ catalyses decomposition of…", "o": ["H₂O", "H₂O₂", "NaCl", "CO₂"], "correct": 1, "fb": ""}]}, "polymers": {"title": "Polymers", "formula": "n·M → (M)ₙ", "summary": "Long chains from monomers.", "quiz": [{"q": "Polyethene is made from…", "o": ["ethene", "ethane", "ethanol", "ethanoic acid"], "correct": 0, "fb": ""}, {"q": "Condensation polymers release…", "o": ["O₂", "H₂O", "CO₂", "H₂"], "correct": 1, "fb": ""}, {"q": "Natural polymer example:", "o": ["nylon", "starch", "PVC", "Teflon"], "correct": 1, "fb": ""}]}, "indicators": {"title": "Indicators", "formula": "Colour vs pH", "summary": "Detect acid/base.", "quiz": [{"q": "Phenolphthalein turns pink above pH ≈", "o": ["3", "6", "8", "12"], "correct": 2, "fb": ""}, {"q": "Methyl orange is red below pH ≈", "o": ["3", "6", "9", "12"], "correct": 0, "fb": ""}, {"q": "Universal indicator gives a … of colours", "o": ["one", "two", "range", "none"], "correct": 2, "fb": ""}]}, "empirical": {"title": "Empirical Formula", "formula": "mol ratio", "summary": "Simplest atom ratio.", "quiz": [{"q": "C 40% H 6.7% O 53.3% → empirical", "o": ["CHO", "CH₂O", "C₂H₄O", "C₃H₆O₃"], "correct": 1, "fb": ""}, {"q": "Convert % to moles by dividing by…", "o": ["atomic mass", "Avogadro", "100", "volume"], "correct": 0, "fb": ""}, {"q": "Molecular ÷ Empirical = ", "o": ["whole number", "fraction", "negative", "irrational"], "correct": 0, "fb": ""}]}, "periodic-trends": {"title": "Periodic Trends", "formula": "across vs down", "summary": "Trends explained by shells.", "quiz": [{"q": "Atomic radius down a group…", "o": ["increases", "decreases", "same", "random"], "correct": 0, "fb": ""}, {"q": "Most electronegative element =", "o": ["O", "N", "F", "H"], "correct": 2, "fb": ""}, {"q": "IE generally … across a period", "o": ["decreases", "increases", "stays", "negates"], "correct": 1, "fb": ""}]}, "thermo": {"title": "Thermodynamics", "formula": "ΔH", "summary": "Energy released or absorbed.", "quiz": [{"q": "Combustion is …", "o": ["endo", "exo", "neither", "both"], "correct": 1, "fb": ""}, {"q": "ΔH &lt; 0 means heat is …", "o": ["absorbed", "released", "unchanged", "stored"], "correct": 1, "fb": ""}, {"q": "Bond breaking is …", "o": ["exo", "endo", "neither", "random"], "correct": 1, "fb": ""}]}, "crystallisation": {"title": "Crystallisation", "formula": "cool sat soln", "summary": "Pure crystals form.", "quiz": [{"q": "Crystallisation purifies because…", "o": ["impurities stay in solution", "crystals are random", "T changes", "H₂O evaporates only"], "correct": 0, "fb": ""}, {"q": "Used to obtain… from sea water", "o": ["O₂", "salt", "sand", "iron"], "correct": 1, "fb": ""}, {"q": "Slower cooling gives … crystals", "o": ["smaller", "larger", "none", "cubic only"], "correct": 1, "fb": ""}]}}, "biology": {"plant-cell": {"title": "Plant Cell", "formula": "Cell wall + chloroplast", "summary": "Plant cells have features animal cells lack.", "quiz": [{"q": "Chloroplast contains…", "o": ["DNA", "chlorophyll", "mitochondria", "Golgi"], "correct": 1, "fb": ""}, {"q": "Plant cell wall is mostly…", "o": ["protein", "cellulose", "starch", "fat"], "correct": 1, "fb": ""}, {"q": "Vacuole in plant cell is usually…", "o": ["small", "central & large", "absent", "cytoplasm"], "correct": 1, "fb": ""}]}, "enzyme": {"title": "Enzymes", "formula": "Activity vs T & pH", "summary": "Catalysts in cells.", "quiz": [{"q": "Typical optimum body T =", "o": ["20°C", "37°C", "60°C", "100°C"], "correct": 1, "fb": ""}, {"q": "Above optimum T, enzymes…", "o": ["work faster", "denature", "disappear", "stay same"], "correct": 1, "fb": ""}, {"q": "Substrate fits enzyme like a…", "o": ["lock & key", "glove", "tube", "random"], "correct": 0, "fb": ""}]}, "respiration": {"title": "Respiration", "formula": "Glucose + O₂ → energy", "summary": "Releases energy as ATP.", "quiz": [{"q": "Site of aerobic respiration =", "o": ["nucleus", "mitochondrion", "ribosome", "Golgi"], "correct": 1, "fb": ""}, {"q": "ATP is the cell's…", "o": ["DNA", "energy currency", "sugar", "fat"], "correct": 1, "fb": ""}, {"q": "Anaerobic in muscle produces…", "o": ["alcohol", "lactic acid", "O₂", "CO₂"], "correct": 1, "fb": ""}]}, "heart-circulation": {"title": "Heart", "formula": "Pump", "summary": "4-chambered cardiac pump.", "quiz": [{"q": "Number of heart chambers =", "o": ["2", "3", "4", "5"], "correct": 2, "fb": ""}, {"q": "Oxygenated blood returns via…", "o": ["pulmonary vein", "aorta", "vena cava", "capillary"], "correct": 0, "fb": ""}, {"q": "Resting HR ≈", "o": ["30", "70", "150", "250"], "correct": 1, "fb": ""}]}, "kidney": {"title": "Kidney", "formula": "Filter blood", "summary": "Removes urea, balances water.", "quiz": [{"q": "Filtration unit of kidney =", "o": ["nephron", "alveolus", "villus", "neuron"], "correct": 0, "fb": ""}, {"q": "Urine contains mostly…", "o": ["water", "O₂", "glucose", "protein"], "correct": 0, "fb": ""}, {"q": "Kidneys regulate…", "o": ["temperature", "ions/water", "O₂", "light"], "correct": 1, "fb": ""}]}, "digestion": {"title": "Digestion", "formula": "Mouth→Anus", "summary": "Breakdown of food.", "quiz": [{"q": "Protein digestion starts in…", "o": ["mouth", "stomach", "duodenum", "colon"], "correct": 1, "fb": ""}, {"q": "Bile is made in…", "o": ["pancreas", "liver", "gallbladder", "stomach"], "correct": 1, "fb": ""}, {"q": "Absorption happens mostly in…", "o": ["stomach", "small intestine", "large intestine", "mouth"], "correct": 1, "fb": ""}]}, "mitosis": {"title": "Mitosis", "formula": "2n → 2n", "summary": "Identical daughter cells.", "quiz": [{"q": "Mitosis produces…", "o": ["1 cell", "2 cells", "4 cells", "random"], "correct": 1, "fb": ""}, {"q": "Phase where chromosomes line up =", "o": ["prophase", "metaphase", "anaphase", "telophase"], "correct": 1, "fb": ""}, {"q": "Mitosis is for…", "o": ["growth/repair", "reproduction", "both gametes & body", "none"], "correct": 0, "fb": ""}]}, "food-chain": {"title": "Food Chain", "formula": "Energy flows", "summary": "~10% efficiency.", "quiz": [{"q": "First trophic level =", "o": ["Producer", "Carnivore", "Decomposer", "Omnivore"], "correct": 0, "fb": ""}, {"q": "Energy lost per step ≈", "o": ["10%", "50%", "90%", "100%"], "correct": 2, "fb": ""}, {"q": "Decomposers include…", "o": ["bacteria & fungi", "plants", "mammals", "insects only"], "correct": 0, "fb": ""}]}, "blood-types": {"title": "Blood Types", "formula": "ABO + Rh", "summary": "Cross-match required.", "quiz": [{"q": "Universal donor =", "o": ["O+", "O−", "AB+", "AB−"], "correct": 1, "fb": ""}, {"q": "Universal recipient =", "o": ["O+", "O−", "AB+", "AB−"], "correct": 2, "fb": ""}, {"q": "Rh+ has the … antigen", "o": ["A", "B", "D", "O"], "correct": 2, "fb": ""}]}, "breathing": {"title": "Breathing", "formula": "Diaphragm", "summary": "Air enters lungs.", "quiz": [{"q": "Inhalation diaphragm moves…", "o": ["up", "down", "sideways", "none"], "correct": 1, "fb": ""}, {"q": "Air enters alveoli for…", "o": ["digestion", "gas exchange", "support", "filtering"], "correct": 1, "fb": ""}, {"q": "Resting rate ≈", "o": ["5", "15", "60", "100"], "correct": 1, "fb": ""}]}, "skeleton": {"title": "Skeleton", "formula": "206 bones", "summary": "Frame of body.", "quiz": [{"q": "Longest bone =", "o": ["femur", "tibia", "humerus", "radius"], "correct": 0, "fb": ""}, {"q": "Skull protects…", "o": ["brain", "heart", "lungs", "kidneys"], "correct": 0, "fb": ""}, {"q": "Bone marrow makes…", "o": ["enzymes", "blood cells", "fat", "insulin"], "correct": 1, "fb": ""}]}, "muscles": {"title": "Muscle", "formula": "Contract→shorter", "summary": "Generates force.", "quiz": [{"q": "Bicep flexes the…", "o": ["leg", "arm", "neck", "wrist"], "correct": 1, "fb": ""}, {"q": "Antagonistic pair to bicep =", "o": ["tricep", "quad", "glute", "calf"], "correct": 0, "fb": ""}, {"q": "Cardiac muscle is found in…", "o": ["heart", "gut", "arm", "leg"], "correct": 0, "fb": ""}]}, "ecosystem": {"title": "Ecosystem", "formula": "Predator-prey", "summary": "Coupled populations.", "quiz": [{"q": "More predators → fewer…", "o": ["plants", "prey", "decomposers", "detritus"], "correct": 1, "fb": ""}, {"q": "If prey grow fast, predators…", "o": ["decrease", "increase later", "extinct", "unchanged"], "correct": 1, "fb": ""}, {"q": "Carrying capacity =", "o": ["min", "max sustained", "death rate", "none"], "correct": 1, "fb": ""}]}, "genetics-punnett": {"title": "Punnett", "formula": "Cross alleles", "summary": "Predicts ratios.", "quiz": [{"q": "Aa × Aa phenotype ratio =", "o": ["1:1", "3:1", "9:3:3:1", "all aa"], "correct": 1, "fb": ""}, {"q": "AA × aa → all…", "o": ["AA", "Aa", "aa", "random"], "correct": 1, "fb": ""}, {"q": "Capital allele is usually…", "o": ["recessive", "dominant", "X-linked", "mutant"], "correct": 1, "fb": ""}]}, "evolution-finch": {"title": "Darwin's Finches", "formula": "Variation+Selection", "summary": "Adaptation over time.", "quiz": [{"q": "Natural selection acts on…", "o": ["individuals", "heritable variation", "random", "none"], "correct": 1, "fb": ""}, {"q": "Beak shape adapts to…", "o": ["climate", "food", "colour", "predators only"], "correct": 1, "fb": ""}, {"q": "Darwin visited…", "o": ["Mars", "Galápagos", "Sahara", "Antarctica"], "correct": 1, "fb": ""}]}}, "mathematics": {"linear-equations": {"title": "Linear", "formula": "ax+b=0", "summary": "Single root.", "quiz": [{"q": "Solve 3x − 9 = 0 → x =", "o": ["1", "2", "3", "4"], "correct": 2, "fb": ""}, {"q": "If a = 0, equation has…", "o": ["one root", "none/infinite", "infinite", "always 0"], "correct": 1, "fb": ""}, {"q": "Slope of y = 2x + 5 is", "o": ["2", "5", "-2", "-5"], "correct": 0, "fb": ""}]}, "factoring": {"title": "Factoring", "formula": "(x-r)(x-s)", "summary": "Roots show where graph cuts x-axis.", "quiz": [{"q": "Roots of (x−1)(x+3) =", "o": ["1,−3", "−1,3", "1,3", "−1,−3"], "correct": 0, "fb": ""}, {"q": "Sum of roots of x²−5x+6 =", "o": ["1", "5", "6", "-5"], "correct": 1, "fb": ""}, {"q": "Product of roots = ", "o": ["a", "c/a", "b/a", "−b"], "correct": 1, "fb": ""}]}, "derivative": {"title": "Derivative", "formula": "slope of tangent", "summary": "Rate of change.", "quiz": [{"q": "d/dx(x²) =", "o": ["x", "2x", "x²", "2"], "correct": 1, "fb": ""}, {"q": "d/dx(sin x) =", "o": ["cos x", "-sin x", "-cos x", "tan x"], "correct": 0, "fb": ""}, {"q": "d/dx(constant) =", "o": ["0", "1", "-1", "∞"], "correct": 0, "fb": ""}]}, "integral": {"title": "Integration", "formula": "Σf(x)Δx", "summary": "Area under curve.", "quiz": [{"q": "∫2x dx =", "o": ["x", "x²", "x²+C", "2x²"], "correct": 2, "fb": ""}, {"q": "Definite integral gives…", "o": ["slope", "area", "derivative", "limit"], "correct": 1, "fb": ""}, {"q": "∫sin x dx =", "o": ["cos x", "-cos x +C", "sin x", "tan x"], "correct": 1, "fb": ""}]}, "limits": {"title": "Limits", "formula": "x→a", "summary": "Behaviour near a.", "quiz": [{"q": "lim x→0 sin(x)/x =", "o": ["0", "1", "∞", "undef"], "correct": 1, "fb": ""}, {"q": "Continuous at a means lim f = …", "o": ["0", "f(a)", "∞", "-f(a)"], "correct": 1, "fb": ""}, {"q": "Removable discontinuity → limit", "o": ["exists", "none", "oscillates", "NaN"], "correct": 0, "fb": ""}]}, "logarithm": {"title": "Logarithm", "formula": "logₐx", "summary": "Inverse of exponent.", "quiz": [{"q": "log₁₀ 100 =", "o": ["1", "2", "3", "10"], "correct": 1, "fb": ""}, {"q": "log(xy) =", "o": ["log x · log y", "log x + log y", "log x / log y", "x log y"], "correct": 1, "fb": ""}, {"q": "ln means log base", "o": ["10", "2", "e", "100"], "correct": 2, "fb": ""}]}, "exponential": {"title": "Exponential", "formula": "A=A₀eᵏᵗ", "summary": "Rate ∝ amount.", "quiz": [{"q": "Exponential decay: k …", "o": ["positive", "negative", "zero", "integer"], "correct": 1, "fb": ""}, {"q": "Doubling time T = ln2/k applies to…", "o": ["linear", "exponential", "quadratic", "none"], "correct": 1, "fb": ""}, {"q": "Population growth often modelled by…", "o": ["linear", "exponential", "trig", "constant"], "correct": 1, "fb": ""}]}, "circle-geometry": {"title": "Circle", "formula": "central=2·inscribed", "summary": "Key theorems.", "quiz": [{"q": "Inscribed angle for 90° arc =", "o": ["30", "45", "60", "90"], "correct": 1, "fb": ""}, {"q": "Angles in same segment are…", "o": ["equal", "supplementary", "complementary", "different"], "correct": 0, "fb": ""}, {"q": "Tangent meets radius at…", "o": ["45°", "60°", "90°", "180°"], "correct": 2, "fb": ""}]}, "permutations": {"title": "Permutations", "formula": "nPr=n!/(n-r)!", "summary": "Order matters in P, not in C.", "quiz": [{"q": "5! =", "o": ["20", "60", "120", "720"], "correct": 2, "fb": ""}, {"q": "4C2 =", "o": ["4", "6", "8", "12"], "correct": 1, "fb": ""}, {"q": "nPr ≥ nCr because…", "o": ["P counts order", "C counts order", "equal", "always less"], "correct": 0, "fb": ""}]}, "complex-numbers": {"title": "Complex", "formula": "z=a+bi", "summary": "2D number plane.", "quiz": [{"q": "i² =", "o": ["1", "0", "-1", "i"], "correct": 2, "fb": ""}, {"q": "|3+4i| =", "o": ["7", "5", "12", "25"], "correct": 1, "fb": ""}, {"q": "Conjugate of 3-2i =", "o": ["3+2i", "-3-2i", "-3+2i", "2-3i"], "correct": 0, "fb": ""}]}, "number-bases": {"title": "Number Bases", "formula": "binary/octal/hex", "summary": "Same value, different bases.", "quiz": [{"q": "10 decimal in binary =", "o": ["1010", "1100", "1001", "1110"], "correct": 0, "fb": ""}, {"q": "FF hex =", "o": ["15", "256", "255", "100"], "correct": 2, "fb": ""}, {"q": "Octal uses digits 0–", "o": ["7", "8", "9", "16"], "correct": 0, "fb": ""}]}, "mean-median-mode": {"title": "Central Tendency", "formula": "Mean median mode", "summary": "Summary stats.", "quiz": [{"q": "Mode of 2,3,3,4,5 =", "o": ["2", "3", "4", "5"], "correct": 1, "fb": ""}, {"q": "Median of 1,3,5,7 =", "o": ["3", "4", "5", "6"], "correct": 1, "fb": ""}, {"q": "Mean of 1,2,3,4,5 =", "o": ["2", "3", "4", "5"], "correct": 1, "fb": ""}]}, "percentage": {"title": "Percentage", "formula": "part/whole·100", "summary": "Ratio as 100ths.", "quiz": [{"q": "25% of 200 =", "o": ["25", "50", "75", "100"], "correct": 1, "fb": ""}, {"q": "1/4 as % =", "o": ["20%", "25%", "40%", "50%"], "correct": 1, "fb": ""}, {"q": "Increase 100 by 20% =", "o": ["110", "120", "125", "140"], "correct": 1, "fb": ""}]}, "financial": {"title": "Compound Interest", "formula": "A=P(1+r)^n", "summary": "Interest on interest.", "quiz": [{"q": "₦100 at 10% for 1 yr (compound) =", "o": ["₦100", "₦110", "₦121", "₦150"], "correct": 1, "fb": ""}, {"q": "Higher rate → … final A", "o": ["smaller", "larger", "equal", "none"], "correct": 1, "fb": ""}, {"q": "Compound > simple after…", "o": ["1 year", "2+ years", "never", "always"], "correct": 1, "fb": ""}]}}, "general-science": {"weather": {"title": "Weather", "formula": "P+T+humidity", "summary": "Atmospheric science.", "quiz": [{"q": "Low pressure = …", "o": ["fair", "stormy", "cold only", "still"], "correct": 1, "fb": ""}, {"q": "Standard pressure ≈", "o": ["500", "1013", "2000", "3000"], "correct": 1, "fb": ""}, {"q": "Wind blows from … to …", "o": ["high to low P", "low to high P", "cold to hot", "random"], "correct": 0, "fb": ""}]}, "water-cycle": {"title": "Water Cycle", "formula": "E→C→P→C", "summary": "Solar-driven.", "quiz": [{"q": "Energy for evaporation comes from…", "o": ["wind", "sun", "moon", "gravity"], "correct": 1, "fb": ""}, {"q": "Clouds form by…", "o": ["evaporation", "condensation", "precipitation", "collection"], "correct": 1, "fb": ""}, {"q": "Rain is a form of…", "o": ["evaporation", "condensation", "precipitation", "runoff"], "correct": 2, "fb": ""}]}, "food-pyramid": {"title": "Diet", "formula": "Balance", "summary": "Variety of food groups.", "quiz": [{"q": "Main energy source =", "o": ["protein", "carbohydrate", "vitamin", "mineral"], "correct": 1, "fb": ""}, {"q": "Build & repair tissues =", "o": ["fat", "protein", "sugar", "iron"], "correct": 1, "fb": ""}, {"q": "Calcium important for …", "o": ["bones", "sight", "blood", "skin"], "correct": 0, "fb": ""}]}, "climate": {"title": "Climate Change", "formula": "Greenhouse", "summary": "Anthropogenic warming.", "quiz": [{"q": "Main GHG from burning fuel =", "o": ["O₂", "CO₂", "N₂", "Ar"], "correct": 1, "fb": ""}, {"q": "Reducing emissions slows…", "o": ["sun", "warming", "tides", "gravity"], "correct": 1, "fb": ""}, {"q": "Methane comes from…", "o": ["coal only", "livestock & gas", "clouds", "plastic"], "correct": 1, "fb": ""}]}, "renewable": {"title": "Renewables", "formula": "sun/wind/water", "summary": "Sustainable energy.", "quiz": [{"q": "Most reliable 24/7 renewable =", "o": ["solar", "wind", "hydro", "tidal only"], "correct": 2, "fb": ""}, {"q": "Solar cells convert light to…", "o": ["heat", "electricity", "sound", "colour"], "correct": 1, "fb": ""}, {"q": "Wind turbines extract energy from…", "o": ["sun", "moving air", "tides", "rain"], "correct": 1, "fb": ""}]}, "recycle": {"title": "Recycle", "formula": "Sort by material", "summary": "Reduces landfill.", "quiz": [{"q": "Glass bottles → … bin", "o": ["blue", "yellow", "green", "brown"], "correct": 2, "fb": ""}, {"q": "Banana peel goes to…", "o": ["recycle", "compost", "glass", "plastic"], "correct": 1, "fb": ""}, {"q": "3 R's are…", "o": ["read,write,run", "reduce,reuse,recycle", "red,run,roll", "none"], "correct": 1, "fb": ""}]}, "seasons": {"title": "Seasons", "formula": "Tilt", "summary": "23.5° axial tilt causes seasons.", "quiz": [{"q": "Earth's tilt ≈", "o": ["10°", "23.5°", "45°", "90°"], "correct": 1, "fb": ""}, {"q": "Equator has … seasons", "o": ["4 strong", "weak", "none", "2"], "correct": 1, "fb": ""}, {"q": "Longest day in N hemisphere =", "o": ["June 21", "Dec 21", "Mar 21", "Sep 21"], "correct": 0, "fb": ""}]}, "tides": {"title": "Tides", "formula": "Gravity", "summary": "Moon dominates tides.", "quiz": [{"q": "Number of high tides per day ≈", "o": ["1", "2", "4", "6"], "correct": 1, "fb": ""}, {"q": "Spring tides occur when Sun and Moon are…", "o": ["aligned", "perpendicular", "opposite hemisphere", "random"], "correct": 0, "fb": ""}, {"q": "Tides are caused by…", "o": ["wind", "heat", "gravity", "temperature"], "correct": 2, "fb": ""}]}, "ph-environment": {"title": "Acid Rain", "formula": "pH<5.6", "summary": "Damages ecosystems.", "quiz": [{"q": "Normal rain pH ≈", "o": ["3", "5.6", "7", "9"], "correct": 1, "fb": ""}, {"q": "Acid rain caused by", "o": ["O₂", "SO₂/NO₂", "H₂O", "CO"], "correct": 1, "fb": ""}, {"q": "Lime is added to lakes to…", "o": ["acidify", "neutralise", "colour", "sweeten"], "correct": 1, "fb": ""}]}, "sound-music": {"title": "Music", "formula": "f→pitch", "summary": "Notes are frequencies.", "quiz": [{"q": "Higher freq = … pitch", "o": ["lower", "higher", "same", "silent"], "correct": 1, "fb": ""}, {"q": "Standard A above middle C =", "o": ["256 Hz", "440 Hz", "880 Hz", "1000 Hz"], "correct": 1, "fb": ""}, {"q": "One octave up = freq ×", "o": ["1", "1.5", "2", "10"], "correct": 2, "fb": ""}]}, "magnetic-field": {"title": "Magnetic Field", "formula": "B-field", "summary": "Force per unit pole.", "quiz": [{"q": "Field lines exit at the … pole", "o": ["N", "S", "both", "neither"], "correct": 0, "fb": ""}, {"q": "Compass aligns with…", "o": ["wind", "Earth's field", "heat", "light"], "correct": 1, "fb": ""}, {"q": "Field unit =", "o": ["N", "T", "C", "Ω"], "correct": 1, "fb": ""}]}, "star-life": {"title": "Star Cycle", "formula": "Nebula→…", "summary": "Stellar evolution.", "quiz": [{"q": "Stars form from…", "o": ["asteroids", "nebulae", "comets", "planets"], "correct": 1, "fb": ""}, {"q": "Sun is currently in…", "o": ["red giant", "main sequence", "white dwarf", "supernova"], "correct": 1, "fb": ""}, {"q": "Massive star end →", "o": ["dwarf", "supernova", "comet", "nebula only"], "correct": 1, "fb": ""}]}, "plate-tectonics": {"title": "Tectonics", "formula": "convection", "summary": "Plates float on mantle.", "quiz": [{"q": "Mid-Atlantic ridge is a … boundary", "o": ["divergent", "convergent", "transform", "none"], "correct": 0, "fb": ""}, {"q": "Earthquakes happen mostly at…", "o": ["plate boundaries", "ocean centre", "Antarctica", "equator"], "correct": 0, "fb": ""}, {"q": "Plates move at about… ", "o": ["km/sec", "cm/year", "m/day", "km/year"], "correct": 1, "fb": ""}]}, "biodiversity": {"title": "Biodiversity", "formula": "Species variety", "summary": "Healthy ecosystems are diverse.", "quiz": [{"q": "Reducing species count is…", "o": ["good", "bad for stability", "neutral", "irrelevant"], "correct": 1, "fb": ""}, {"q": "Hotspot example =", "o": ["Sahara", "Amazon", "Antarctica", "Mt. Everest"], "correct": 1, "fb": ""}, {"q": "Keystone species disproportionately…", "o": ["small", "important", "weak", "colourful"], "correct": 1, "fb": ""}]}}};
Object.keys(EXT).forEach(function(sub){if(!HMG.CONTENT[sub])HMG.CONTENT[sub]={};Object.keys(EXT[sub]).forEach(function(k){HMG.CONTENT[sub][k]=EXT[sub][k];});});})();
