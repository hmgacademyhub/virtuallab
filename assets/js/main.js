document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('sim-search');
  if (search) {
    search.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      document.querySelectorAll('.sim-card').forEach(c => {
        c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  });
  console.log('🏫 HMG Academy Virtual Lab v2 loaded');
});
