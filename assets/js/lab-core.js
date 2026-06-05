const HMG = (() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const store = JSON.parse(localStorage.getItem('hmg-lab-v2') || '{}');
  const D = { students: [], classes: [], progress: {}, badges: [], forumPosts: [] };
  Object.keys(D).forEach(k => { if (store[k] === undefined) store[k] = D[k]; });
  const persist = () => { try { localStorage.setItem('hmg-lab-v2', JSON.stringify(store)); } catch(e) {} };
  const getState = k => store[k];
  const setState = (k, v) => { store[k] = v; persist(); };
  function toast(msg, type = 'info', dur = 4000) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;top:80px;right:1rem;padding:.75rem 1.25rem;border-radius:8px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.15);border-left:4px solid ${type === 'success' ? '#27ae60' : '#e94560'};font-size:.875rem;z-index:9999;animation:slideIn .3s;max-width:400px`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, dur);
  }
  function addStudent(data) {
    if (!store.students.find(s => s.id === data.id)) {
      store.students.push({ id: data.id || 'STU-' + Date.now().toString(36).toUpperCase(), name: data.name, classId: data.classId || '', points: 0, level: 1, badges: [], joinedAt: new Date().toISOString() });
      persist(); toast('✅ Student "' + data.name + '" added', 'success'); return true;
    }
    toast('⚠️ Student already exists', 'warning'); return false;
  }
  function createClass(name, teacher, subject) {
    const c = { id: 'CLS-' + Date.now().toString(36).toUpperCase(), name, teacher: teacher || 'Teacher', subject: subject || 'General', code: Math.random().toString(36).substring(2, 8).toUpperCase(), studentIds: [], createdAt: new Date().toISOString(), archived: false };
    store.classes.push(c); persist(); toast('📚 Class "' + name + '" created! Code: ' + c.code, 'success'); return c;
  }
  function getClasses() { return store.classes.filter(c => !c.archived); }
  function trackProgress(studentId, simId, data) {
    const key = studentId + ':' + simId;
    const e = store.progress[key] || { attempts: 0, scores: [], timeSpent: 0, completed: false };
    e.attempts += 1; if (data.score !== undefined) e.scores.push(data.score);
    if (data.timeSpent) e.timeSpent += data.timeSpent;
    if (data.completed) e.completed = true;
    e.lastAccessed = new Date().toISOString();
    store.progress[key] = e; persist(); return e;
  }
  function getLeaderboard() {
    return [...store.students].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 20).map((s, i) => ({ rank: i + 1, ...s }));
  }
  function awardBadge(studentId, badgeId) {
    const s = store.students.find(x => x.id === studentId);
    if (!s || s.badges.includes(badgeId)) return false;
    s.badges.push(badgeId); s.points = (s.points || 0) + 50; persist(); return true;
  }
  function getStudentBadges(studentId) {
    const s = store.students.find(x => x.id === studentId);
    const BADGES = [
      { id: 'first-sim', name: 'First Steps', icon: '🚀' }, { id: 'five-sims', name: 'Lab Explorer', icon: '🔬' },
      { id: 'ten-sims', name: 'Lab Scientist', icon: '🧪' }, { id: 'perfect-score', name: 'Perfect Score', icon: '🏆' },
      { id: 'streak-3', name: 'On Fire', icon: '🔥' }, { id: 'streak-7', name: 'Week Warrior', icon: '💪' },
      { id: 'top-performer', name: 'Top Performer', icon: '👑' }, { id: 'helpful', name: 'Helper', icon: '🤝' },
      { id: 'all-subjects', name: 'Polymath', icon: '🧠' }, { id: 'teacher-pet', name: "Teacher's Pet", icon: '⭐' }
    ];
    return s ? s.badges.map(id => BADGES.find(b => b.id === id)).filter(Boolean) : [];
  }
  function addForumPost(title, content, author, category) {
    if (!store.forumPosts) store.forumPosts = [];
    store.forumPosts.push({ id: 'PST-' + Date.now().toString(36).toUpperCase(), title, content, author, category: category || 'General', replies: [], createdAt: new Date().toISOString() });
    persist();
  }
  function getForumPosts(category) {
    if (!category) return store.forumPosts || [];
    return (store.forumPosts || []).filter(p => p.category === category);
  }
  function init() {
    // Mobile menu toggle
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.classList.toggle('open');
        toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
      });
    }
    // Back to top
    const btt = document.getElementById('back-to-top');
    if (btt) {
      window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 400), { passive: true });
      btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    // Active nav
    const path = window.location.pathname;
    document.querySelectorAll('.nav-menu a').forEach(a => {
      const h = a.getAttribute('href');
      if (h && h !== 'index.html' && path.includes(h.replace('.html', ''))) a.classList.add('active');
      else if ((path.endsWith('/') || path.endsWith('index.html')) && h === 'index.html') a.classList.add('active');
    });
    // Counter animation
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (!isNaN(target)) {
        const start = performance.now();
        const tick = now => { const p = Math.min((now - start) / 2000, 1); el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    });
  }
  return { $, $$, toast, init, getState, setState, addStudent, createClass, getClasses, trackProgress, getLeaderboard, awardBadge, getStudentBadges, addForumPost, getForumPosts };
})();
document.addEventListener('DOMContentLoaded', HMG.init);
