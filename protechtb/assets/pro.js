
(() => {
  const themeBtn = document.getElementById('themeBtn');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mainNav');

  // Google Analytics (GA4)
  const GA_ID = 'G-DX988YYFYP';
  const host = location.hostname;
  const analyticsAllowed = host.endsWith('protechtb.sk') || host.endsWith('github.io') || host === 'localhost' || host === '127.0.0.1';

  if (analyticsAllowed && GA_ID) {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(gaScript);

    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

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

  // lightweight custom events for GA
  const contactForm = document.querySelector('.contact-form');
  if (contactForm && typeof window.gtag === 'function') {
    contactForm.addEventListener('submit', () => {
      window.gtag('event', 'generate_lead', {
        event_category: 'contact_form',
        event_label: location.pathname
      });
    });
  }

  const langSwitch = document.querySelector('.controls > a.btn');
  if (langSwitch && typeof window.gtag === 'function') {
    langSwitch.addEventListener('click', () => {
      window.gtag('event', 'language_switch', {
        event_category: 'navigation',
        event_label: langSwitch.textContent.trim()
      });
    });
  }

  // contact form success notice (?sent=1)
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
