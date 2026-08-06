
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

  const botShell = document.querySelector('[data-bot-shell]');
  if (botShell) {
    const botLog = botShell.querySelector('[data-bot-log]');
    const botForm = botShell.querySelector('[data-bot-form]');
    const botInput = botShell.querySelector('input[name="botQuestion"]');
    const botReset = botShell.querySelector('[data-bot-reset]');
    const quickButtons = botShell.querySelectorAll('[data-bot-query]');
    const isEnglish = document.documentElement.lang === 'en';

    const copy = {
      greeting: isEnglish
        ? 'Hi, I am ProBot. Ask me about services, pricing, smart home or NAS, and I will point you in the right direction.'
        : 'Ahoj, som ProBot. Spýtaj sa ma na služby, ceny, smart home alebo NAS a navediem ťa ďalej.',
      fallback: isEnglish
        ? 'I can help with services, pricing, smart home, NAS or contact. If you want, I will also pass you to the contact form.'
        : 'Viem pomôcť so službami, cenami, smart home, NAS alebo kontaktom. Ak chceš, pošlem ťa aj priamo na formulár.',
      contact: isEnglish
        ? 'The fastest next step is the contact form. Send me a short request and I will help you define the scope.'
        : 'Najrýchlejší ďalší krok je kontakt formulár. Pošli stručný dopyt a pomôžem ti spresniť zadanie.',
      smartHome: isEnglish
        ? 'Home Assistant and smart home setups are best when they are simple to use. I can help with dashboards, automations, lights, heating and multi-hub integration.'
        : 'Home Assistant a smart home dávajú najväčší zmysel, keď sú jednoduché na používanie. Pomôžem s dashboardmi, automatizáciami, svetlami, kúrením aj multi-hub integráciou.',
      nas: isEnglish
        ? 'NAS & Backup starts with architecture, automatic backups and a recovery test. That is the safest path for family photos, work files and shared data.'
        : 'NAS & Backup začína architektúrou, automatickými zálohami a recovery testom. Je to najistejšia cesta pre fotky, pracovné súbory aj zdieľané dáta.',
      pricing: isEnglish
        ? 'The main packages are Smart Start from 299 €, NAS Safe Home from 349 €, and IT Care Monthly at 49–99 € per month.'
        : 'Hlavné balíky sú Smart Start od 299 €, NAS Safe Home od 349 € a IT Care Monthly za 49–99 € mesačne.',
      services: isEnglish
        ? 'ProTechTB covers PC build & performance, Home Assistant & smart home, NAS & backup, and multi-hub integrations.'
        : 'ProTechTB pokrýva PC build & performance, Home Assistant & smart home, NAS & backup a multi-hub integrácie.',
      performance: isEnglish
        ? 'For PC builds we focus on performance, noise, airflow and stability. Good for workstations and home setups that need to stay fast.'
        : 'Pri PC zostavách riešime výkon, hluk, airflow a stabilitu. Je to vhodné pre pracovné aj domáce zostavy, ktoré majú zostať rýchle.',
      about: isEnglish
        ? 'The site is built to explain IT in human language. The live lab page is the best place to test the chatbot behavior before a real launch.'
        : 'Web je postavený tak, aby IT vysvetľoval ľudskou rečou. Live lab stránka je najlepšie miesto na testovanie chatbota pred ostrým nasadením.'
    };

    const keywords = [
      { test: ['cena', 'cen', 'price', 'pricing', 'kolko', 'koľko', 'sum'], reply: copy.pricing },
      { test: ['kontakt', 'formular', 'form', 'email', 'dopyt', 'kontaktovat', 'contact'], reply: copy.contact },
      { test: ['smart home', 'home assistant', 'automatiz', 'svetl', 'heating', 'zigbee', 'matter', 'integrac', 'integraciu', 'integracie'], reply: copy.smartHome },
      { test: ['nas', 'backup', 'zalo', 'zálo', 'disk', 'raid', 'recovery'], reply: copy.nas },
      { test: ['pc', 'build', 'performance', 'workstation', 'hardware', 'tichy', 'výkon', 'vykon'], reply: copy.performance },
      { test: ['sluzby', 'services', 'co robite', 'co ponukate', 'what do you do', 'service'], reply: copy.services },
      { test: ['o vas', 'o nás', 'about', 'kto ste', 'kto si', 'about us'], reply: copy.about }
    ];

    const formatTime = () => new Intl.DateTimeFormat(isEnglish ? 'en-GB' : 'sk-SK', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());

    const escapeText = (value) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const normalize = (value) => value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const addMessage = (role, text) => {
      const item = document.createElement('div');
      item.className = `bot-message ${role}`;
      item.innerHTML = `<p>${escapeText(text)}</p><div class="bot-meta">${role === 'user' ? (isEnglish ? 'You' : 'Ty') : 'ProBot'} · ${formatTime()}</div>`;
      botLog.appendChild(item);
      botLog.scrollTop = botLog.scrollHeight;
    };

    const chooseReply = (input) => {
      const normalized = normalize(input);
      for (const rule of keywords) {
        if (rule.test.some(term => normalized.includes(normalize(term)))) {
          return rule.reply;
        }
      }

      if (normalized.includes('dak') || normalized.includes('thank') || normalized.includes('vdaka')) {
        return isEnglish ? 'You are welcome. If you want, I can also explain pricing or route you to the contact form.' : 'Rado sa stalo. Ak chceš, môžem vysvetliť ceny alebo ťa hneď poslať na formulár.';
      }

      return copy.fallback;
    };

    const ask = (value) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      addMessage('user', trimmed);
      if (botInput) botInput.value = '';

      window.setTimeout(() => {
        addMessage('bot', chooseReply(trimmed));
      }, 220);
    };

    addMessage('bot', copy.greeting);

    if (botForm) {
      botForm.addEventListener('submit', (event) => {
        event.preventDefault();
        ask(botInput ? botInput.value : '');
      });
    }

    quickButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const query = button.getAttribute('data-bot-query') || '';
        if (botInput) botInput.value = query;
        ask(query);
      });
    });

    if (botReset) {
      botReset.addEventListener('click', () => {
        botLog.innerHTML = '';
        addMessage('bot', copy.greeting);
        botInput?.focus();
      });
    }
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

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      if (contactForm.dataset.submitting === '1') return;
      e.preventDefault();
      const ok = await canReachFormService();
      if (!ok) {
        showFormNetworkWarning();
        return;
      }
      contactForm.dataset.submitting = '1';
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'contact_form',
          event_label: location.pathname
        });
      }
      contactForm.submit();
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
