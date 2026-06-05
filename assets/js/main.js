/* ============================================================
   HMG Academy Virtual Lab v6 — Shared UI helpers
   Header / footer / nav are inlined per page (offline-first).
   This file: optional sim search, copy buttons, lazy embeds.
   ============================================================ */
(function () {
  // Copy-to-clipboard handler for any [data-copy="text"]
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-copy]');
    if (!t) return;
    var txt = t.getAttribute('data-copy');
    try { navigator.clipboard.writeText(txt); HMG.toast('📋 Copied: ' + txt, 'success'); }
    catch (er) { HMG.toast('Copy failed', 'error'); }
  });

  // Tab switcher: container with .tabs > .tab[data-tab] and .tab-panel[data-tab]
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    tabs.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-tab');
        tabs.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('active', x === tab); });
        var scope = tabs.parentElement;
        scope.querySelectorAll('.tab-panel').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-tab') === name);
        });
      });
    });
    // activate first
    var first = tabs.querySelector('.tab');
    if (first && !tabs.querySelector('.tab.active')) first.click();
  });

  // Print button
  document.querySelectorAll('[data-print]').forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });
})();
