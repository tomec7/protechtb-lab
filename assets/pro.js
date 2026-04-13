
(() => {
  const themeBtn = document.getElementById('themeBtn');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mainNav');

  // light "wow" intro trigger
  requestAnimationFrame(() => {
    setTimeout(() => document.body.classList.add('lab-ready'), 80);
  });

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

  const targets = document.querySelectorAll('section, .card, .project, .faq details, .visual-grid img, .offer-tile, .bento, .steps-modern article, .tile');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i * 10, 90)}ms`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });

  targets.forEach(el => io.observe(el));

  // top scroll progress line
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = `${Math.max(0, Math.min(100, p))}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // hover spotlight for offer cards
  document.querySelectorAll('.offer-tile').forEach((tile) => {
    tile.addEventListener('mousemove', (e) => {
      const r = tile.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      tile.style.setProperty('--mx', `${x}%`);
      tile.style.setProperty('--my', `${y}%`);
    });
  });

  // contact form handling + lightweight GA
  const contactForm = document.querySelector('.contact-form');

  const showFormNetworkWarning = () => {
    if (!contactForm) return;
    let box = contactForm.querySelector('.form-net-warning');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-net-warning';
      contactForm.prepend(box);
    }
    box.textContent = document.documentElement.lang === 'en'
      ? 'We could not reach the form service (possibly blocked by corporate network / Zscaler). Please try another network or email us at protechtbsupport@gmail.com.'
      : 'Nepodarilo sa spojiť so službou formulára (môže ju blokovať firemná sieť / Zscaler). Skúste inú sieť alebo nám napíšte na protechtbsupport@gmail.com.';
  };

  const canReachFormService = async () => {
    try {
      await fetch('https://formsubmit.co/', { method: 'GET', mode: 'no-cors', cache: 'no-store' });
      return true;
    } catch (_) {
      return false;
    }
  };

  const submitToOwnEndpoint = async () => {
    if (!contactForm) return false;
    const endpoint = contactForm.dataset.endpoint;
    if (!endpoint) return false;

    const fd = new FormData(contactForm);
    const body = new URLSearchParams();
    for (const [k, v] of fd.entries()) body.append(k, v);

    const res = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });

    if (!res.ok) return false;
    return true;
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      if (contactForm.dataset.submitting === '1') return;
      e.preventDefault();
      contactForm.dataset.submitting = '1';

      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', {
            event_category: 'contact_form',
            event_label: location.pathname
          });
        }

        const ownOk = await submitToOwnEndpoint();
        if (ownOk) {
          const next = contactForm.querySelector('input[name="_next"]')?.value;
          window.location.href = next || (document.documentElement.lang === 'en' ? 'en/thank-you.html' : 'dakujeme.html');
          return;
        }

        const legacyOk = await canReachFormService();
        if (legacyOk) {
          contactForm.submit();
          return;
        }

        showFormNetworkWarning();
      } catch (_) {
        const legacyOk = await canReachFormService();
        if (legacyOk) {
          contactForm.submit();
          return;
        }
        showFormNetworkWarning();
      } finally {
        delete contactForm.dataset.submitting;
      }
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



  // contact topic prefill via ?topic=... (default: general inquiry)
  const topicParam = new URLSearchParams(location.search).get('topic');

  let getTopicValue = () => 'general';
  let getTopicLabel = () => (document.documentElement.lang === 'en' ? 'General inquiry' : 'Všeobecný dopyt');
  let setTopicValue = () => {};
  let onTopicChange = () => {};

  if (contactForm) {
    const custom = contactForm.querySelector('[data-topic-select]');
    if (custom) {
      const input = custom.querySelector('input[name="topic"]');
      const trigger = custom.querySelector('.custom-select-trigger');
      const options = Array.from(custom.querySelectorAll('.custom-select-option'));

      const applyValue = (val) => {
        const match = options.find(o => o.dataset.value === val) || options.find(o => o.dataset.value === 'general');
        if (!match || !input || !trigger) return;
        input.value = match.dataset.value;
        trigger.textContent = match.textContent.trim();
        options.forEach(o => o.classList.toggle('is-selected', o === match));
      };

      const closeMenu = () => {
        custom.classList.remove('open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      };
      const openMenu = () => {
        custom.classList.add('open');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
      };

      if (trigger) {
        trigger.addEventListener('click', () => {
          if (custom.classList.contains('open')) closeMenu(); else openMenu();
        });
      }

      options.forEach(opt => {
        opt.addEventListener('click', () => {
          applyValue(opt.dataset.value);
          closeMenu();
          custom.dispatchEvent(new CustomEvent('topicchange'));
        });
      });

      document.addEventListener('click', (e) => {
        if (!custom.contains(e.target)) closeMenu();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });

      setTopicValue = (val) => applyValue(val);
      getTopicValue = () => (input ? input.value : 'general');
      getTopicLabel = () => {
        const v = getTopicValue();
        const m = options.find(o => o.dataset.value === v);
        return m ? m.textContent.trim() : (document.documentElement.lang === 'en' ? 'General inquiry' : 'Všeobecný dopyt');
      };
      onTopicChange = (fn) => custom.addEventListener('topicchange', fn);
    } else {
      const topicSelect = contactForm.querySelector('select[name="topic"]');
      if (topicSelect) {
        setTopicValue = (val) => { topicSelect.value = val; };
        getTopicValue = () => topicSelect.value;
        getTopicLabel = () => {
          const selected = topicSelect.options[topicSelect.selectedIndex];
          return selected ? selected.text : '';
        };
        onTopicChange = (fn) => topicSelect.addEventListener('change', fn);
      }
    }
  }

  const enrichSubjectWithTopic = () => {
    if (!contactForm) return;
    const subjectInput = contactForm.querySelector('input[name="_subject"]');
    if (!subjectInput) return;
    const base = document.documentElement.lang === 'en' ? 'New inquiry from ProTechTB website (EN)' : 'Nový dopyt z ProTechTB webu';
    subjectInput.value = `${base} — ${getTopicLabel()}`;
  };

  if (contactForm) {
    const initial = topicParam || 'general';
    setTopicValue(initial);
    onTopicChange(enrichSubjectWithTopic);
    enrichSubjectWithTopic();
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
