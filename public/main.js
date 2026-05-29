/* KSR — Main JS */

// === THEME TOGGLE ===
(function () {
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const sunIcon = toggle?.querySelector('.icon-sun');
  const moonIcon = toggle?.querySelector('.icon-moon');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('ksr-theme', theme);
    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    }
  }

  // Init: check localStorage first, then system pref
  const saved = localStorage.getItem('ksr-theme');
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  toggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();

// === MOBILE NAV ===
(function () {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileNavOverlay');
  const closeBtn = document.getElementById('mobileNavClose');

  function openNav() {
    hamburger?.classList.add('active');
    mobileNav?.classList.add('active');
    overlay?.classList.add('active');
    document.body.classList.add('drawer-open');
    hamburger?.setAttribute('aria-label', 'Navigation schließen');
  }

  function closeNav() {
    hamburger?.classList.remove('active');
    mobileNav?.classList.remove('active');
    overlay?.classList.remove('active');
    document.body.classList.remove('drawer-open');
    hamburger?.setAttribute('aria-label', 'Navigation öffnen');
  }

  hamburger?.addEventListener('click', () => {
    if (mobileNav?.classList.contains('active')) {
      closeNav();
    } else {
      openNav();
    }
  });

  overlay?.addEventListener('click', closeNav);
  closeBtn?.addEventListener('click', closeNav);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('active')) {
      closeNav();
    }
  });

  // Close when a nav link is clicked
  mobileNav?.querySelectorAll('.mobile-nav__link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
})();

// === PAGE TRANSITIONS — re-animate on small screens when nav opens ===
// Hero animate-in when page loads
(function () {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hero.style.transition = 'opacity 0.4s cubic-bezier(0, 0, 0.2, 1)';
        hero.style.opacity = '1';
      });
    });
  }
})();
