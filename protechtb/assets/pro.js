
(() => {
  const themeBtn = document.getElementById('themeBtn');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mainNav');
  let theme = 'dark';
  try { theme = localStorage.getItem('protechtb-theme') || 'dark'; } catch(e) {}
  document.body.classList.toggle('light', theme === 'light');
  if (themeBtn) {
    themeBtn.textContent = theme === 'light' ? '☀️' : '🌙';
    themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light');
      const mode = isLight ? 'light' : 'dark';
      themeBtn.textContent = isLight ? '☀️' : '🌙';
      try { localStorage.setItem('protechtb-theme', mode); } catch(e) {}
    });
  }

  if (mobileBtn && nav) {
    mobileBtn.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#mainNav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  const targets = document.querySelectorAll('section, .card, .project, .faq details, .visual-grid img');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i * 18, 200)}ms`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => io.observe(el));

  // contact form success notice (Netlify Forms redirect with ?sent=1)
  const sent = new URLSearchParams(location.search).get('sent');
  if (sent === '1') {
    const form = document.querySelector('.contact-form');
    if (form) {
      const msg = document.createElement('div');
      msg.className = 'form-success';
      msg.textContent = document.documentElement.lang === 'en'
        ? 'Thank you. Your message has been sent successfully.'
        : 'Ďakujeme, váš dopyt bol úspešne odoslaný.';
      form.prepend(msg);
      try {
        const clean = location.pathname + location.hash;
        history.replaceState({}, '', clean);
      } catch (e) {}
    }
  }
})();
