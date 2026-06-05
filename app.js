/* ═══════════════════════════════════════════════
   app.js — Base global PWA
═══════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────
   1. BLOQUEO DE GESTOS NATIVOS
   - Evita zoom con doble tap, pinch-zoom,
     pull-to-refresh, context menu largo
────────────────────────────────────────────── */
(function lockGestures() {
  // Bloquea doble-tap zoom en iOS
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch < 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  // Bloquea menú contextual en imágenes y elementos genéricos
  document.addEventListener('contextmenu', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (!['input', 'textarea', 'select'].includes(tag)) {
      e.preventDefault();
    }
  });

  // Bloquea pinch-zoom
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // Bloquea pull-to-refresh en Chrome Android
  document.body.style.overscrollBehaviorY = 'none';

document.addEventListener('touchmove', (e) => {
  if (e.target === document.body || e.target === document.documentElement) {
    e.preventDefault();
  }
}, { passive: false });

})();

/* ──────────────────────────────────────────────
   2. SCROLL FANTASMA — bloqueo en páginas full-screen
   El loader y cualquier vista con .page-locked
   bloquea scroll en iOS también (position:fixed
   no es suficiente en Safari sin esto).
────────────────────────────────────────────── */
(function ghostScrollLock() {
  let lockedEl = null;
  let startY   = 0;

  function isLocked(target) {
    return target.closest('#app-loader, .page-locked') !== null;
  }

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    if (isLocked(e.target)) lockedEl = e.target;
    else lockedEl = null;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!lockedEl) return;
    // Bloquear cualquier intento de scroll en elementos fijos
    e.preventDefault();
  }, { passive: false });

  // Bloquear wheel también (desktop/iPad trackpad)
  document.addEventListener('wheel', (e) => {
    if (isLocked(e.target)) e.preventDefault();
  }, { passive: false });
})();

/* ──────────────────────────────────────────────
   3. SAFE AREA — inyectar variables CSS reales
   (útil cuando env() no tiene soporte completo)
────────────────────────────────────────────── */
(function applySafeAreas() {
  function update() {
    const s = getComputedStyle(document.documentElement);
    const sat = s.getPropertyValue('--sat').trim() || '0px';
    const sab = s.getPropertyValue('--sab').trim() || '0px';
    document.documentElement.style.setProperty('--sat', sat);
    document.documentElement.style.setProperty('--sab', sab);
  }
  update();
  window.addEventListener('resize', update);
  screen.orientation?.addEventListener('change', update);
})();

/* ──────────────────────────────────────────────
   4. LOADER → revelar APP
────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('app-loader');
  const app    = document.getElementById('app');
  if (!loader || !app) return;

  // Bloquear scroll en body mientras el loader está activo
  document.body.classList.add('loader-active');

  function revealApp() {
    loader.classList.add('hidden');
    app.classList.remove('app-hidden');
    document.body.classList.remove('loader-active');

    loader.addEventListener('transitionend', () => {
      loader.remove();
    }, { once: true });
  }

  const minDelay = new Promise(res => setTimeout(res, 1400));
  const domReady = new Promise(res => {
    if (document.readyState === 'complete') return res();
    window.addEventListener('load', res, { once: true });
  });

  Promise.all([minDelay, domReady]).then(revealApp);
})();
/* ──────────────────────────────────────────────
   5. RIPPLE EN BOTONES / NAV ITEMS
────────────────────────────────────────────── */
(function initRipple() {
  function addRipple(e) {
    const el = e.currentTarget;
    el.classList.add('ripple-host');

    const rect   = el.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - size / 2;
    const y      = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  document.querySelectorAll('button, .btn, .nav-item').forEach(el => {
    el.addEventListener('pointerdown', addRipple);
  });
})();

/* ──────────────────────────────────────────────
   6. BOTTOM NAV — highlight activo
────────────────────────────────────────────── */
(function initNav() {
  const items = document.querySelectorAll('.nav-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
})();

/* ──────────────────────────────────────────────
   7. VIEWPORT HEIGHT — fix para Safari/Chrome
   100vh en Safari incluye la barra del navegador,
   dvh lo resuelve pero aquí lo forzamos también.
────────────────────────────────────────────── */
(function fixVh() {
  function setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setVh();
  window.addEventListener('resize', setVh);
})();

/* ──────────────────────────────────────────────
   8. REGISTRO DEL SERVICE WORKER
────────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg  => console.info('[SW] registrado:', reg.scope))
      .catch(err => console.warn('[SW] error:', err));
  });
}

/* ──────────────────────────────────────────────
   9. DETECCIÓN DE MODO (PWA vs Browser)
   Agrega clase al <html> para estilos específicos
────────────────────────────────────────────── */
(function detectMode() {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches
             || window.navigator.standalone === true;
  document.documentElement.classList.add(isPWA ? 'mode-pwa' : 'mode-browser');
})();

/* ──────────────────────────────────────────────
   10. HAPTICS (vibración táctil cuando disponible)
   Usar: haptic('light') | haptic('medium') | haptic('heavy')
────────────────────────────────────────────── */
window.haptic = function haptic(type = 'light') {
  if (!navigator.vibrate) return;
  const patterns = { light: [10], medium: [20], heavy: [40] };
  navigator.vibrate(patterns[type] || patterns.light);
};

/* ──────────────────────────────────────────────
   11. NETWORK STATUS
────────────────────────────────────────────── */
(function networkStatus() {
  function update() {
    document.documentElement.classList.toggle('offline', !navigator.onLine);
  }
  update();
  window.addEventListener('online',  update);
  window.addEventListener('offline', update);
})();


/* ──────────────────────────────────────────────
   12. BLOQUEO INSPECCION
────────────────────────────────────────────── */

(function antiDevTools() {
  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I','J','C','U'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U') ||
      (e.metaKey && e.altKey && e.key === 'I')
    ) e.preventDefault();
  });
})();

/* ──────────────────────────────────────────────
   13. FIX SCROLL DESKTOP — .app-main focusable
   y redirección de teclas de navegación.
   El body ya no scrollea (overflow:hidden), por
   lo que las flechas/PageUp/Down deben actuar
   sobre .app-main directamente.
────────────────────────────────────────────── */
(function fixDesktopScroll() {
  const main = document.querySelector('.app-main');
  if (!main) return;

  // Hacer .app-main focusable para que las flechas del teclado lo scrolleen
  main.setAttribute('tabindex', '0');
  main.style.outline = 'none';

  // Auto-focus al cargar para que las flechas funcionen inmediatamente
  window.addEventListener('load', () => {
    main.focus({ preventScroll: true });
  });

  // Redirigir teclas de navegación a .app-main cuando no estamos en un input
  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return;

    const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'];
    if (!keys.includes(e.key)) return;

    e.preventDefault();
    const step = 40;
    const page = main.clientHeight * 0.8;

    switch (e.key) {
      case 'ArrowDown':  main.scrollTop += step; break;
      case 'ArrowUp':    main.scrollTop -= step; break;
      case 'PageDown':
      case ' ':          main.scrollTop += page; break;
      case 'PageUp':     main.scrollTop -= page; break;
      case 'Home':       main.scrollTop = 0; break;
      case 'End':        main.scrollTop = main.scrollHeight; break;
    }
  });
})();
