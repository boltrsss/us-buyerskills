/* Orivelle prelander — self-contained interactions (no jQuery / no external deps) */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initWheel();
    ensureVideoAutoplay();
  });

  /* ---- Spin-to-win wheel ---- */
  function initWheel() {
    var hub    = document.querySelector('.wheel-hub');
    var svg     = document.querySelector('.wheel-svg');
    var form    = document.querySelector('.spin-form');
    var modal   = document.querySelector('.modal-mask');
    var closers = document.querySelectorAll('[data-close-modal]');
    if (!hub || !svg) return;

    var spun = false;

    hub.addEventListener('click', function () {
      if (spun) return;
      spun = true;
      hub.style.cursor = 'default';

      // Always land on the 70% wedge.
      // Wedges in template.php: ['10%','20%','30%','50%','60%','70%','40%','5%']
      // 70% is index 5 of 8 (each wedge = 45deg), pointer is at the top.
      // Rotation to center that wedge under the pointer = 360 - (5 + 0.5) * 45 = 112.5deg.
      var WIN_INDEX = 5;   // index of '70%' in the $slices array
      var WEDGES    = 8;   // number of wedges
      var wedge     = 360 / WEDGES;
      var offset    = (360 - (WIN_INDEX + 0.5) * wedge) % 360; // = 112.5
      var turns     = 6;   // full spins before landing (visual only)
      var target    = turns * 360 + offset;
      svg.style.transform = 'rotate(' + target + 'deg)';

      setTimeout(function () {
        if (form) form.classList.add('show');
        if (modal) modal.classList.add('show');
      }, 6200);
    });

    closers.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        if (modal) modal.classList.remove('show');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('show');
      });
    }
  }

  /* ---- Nudge muted videos to autoplay on mobile ---- */
  function ensureVideoAutoplay() {
    var vids = document.querySelectorAll('video[autoplay]');
    vids.forEach(function (v) {
      v.muted = true;
      var p = v.play();
      if (p && typeof p.catch === 'function') { p.catch(function () {}); }
    });
  }
})();
