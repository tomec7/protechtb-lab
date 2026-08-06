
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

  const BOT_EMAIL_ENDPOINT = 'https://formsubmit.co/protechtbsupport@gmail.com';
  const BOT_VISITOR_KEY = 'protechtb-bot-visitor-id';
  const BOT_SESSION_KEY = 'protechtb-bot-session-id';
  const BOT_TRANSCRIPT_KEY = 'protechtb-bot-transcript';
  const BOT_OPEN_KEY = 'protechtb-bot-open';
  const BOT_LAST_EMAIL_KEY = 'protechtb-bot-last-email';

  const readStorage = (key, fallback = '') => {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  };

  const writeStorage = (key, value) => {
    try { localStorage.setItem(key, value); } catch (e) {}
  };

  const makeId = (prefix) => {
    const rand = Math.random().toString(36).slice(2, 10);
    return `${prefix}-${Date.now().toString(36)}-${rand}`;
  };

  const visitorId = readStorage(BOT_VISITOR_KEY) || makeId('visitor');
  writeStorage(BOT_VISITOR_KEY, visitorId);

  const sessionId = readStorage(BOT_SESSION_KEY) || makeId('chat');
  writeStorage(BOT_SESSION_KEY, sessionId);

  const buildBotWidget = () => {
    const widget = document.createElement('div');
    widget.className = 'probot-float is-collapsed';
    widget.dataset.probotWidget = 'true';
    widget.innerHTML = `
      <button class="probot-launch" type="button" data-bot-launch aria-expanded="false" aria-label="Otvoriť ProBot">
        <span class="probot-launch-dot" aria-hidden="true"></span>
        <span class="probot-launch-copy">
          <strong>ProBot</strong>
          <small>rýchly asistent</small>
        </span>
      </button>
      <div class="bot-shell card" data-bot-shell hidden>
        <div class="bot-top">
          <div class="bot-brand">
            <div class="bot-avatar" aria-hidden="true">PB</div>
            <div>
              <strong>ProBot</strong>
              <div class="bot-status">online • lab preview • e-mail prepisu</div>
            </div>
          </div>
          <div class="bot-actions">
            <button class="btn" type="button" data-bot-reset title="Vymazať konverzáciu">Nový chat</button>
            <button class="btn" type="button" data-bot-toggle aria-label="Zbaliť ProBot">−</button>
          </div>
        </div>
        <div class="bot-copy">
          <p class="muted" style="margin:0">Rýchly prehľad služieb, ceny a kontakt. Každý prepis chatu posielam tímu na e-mail s časom, stránkou a celou konverzáciou.</p>
        </div>
        <div class="bot-log" data-bot-log aria-live="polite" aria-label="Rozhovor s chatbotom"></div>
        <form class="bot-form" data-bot-form>
          <label class="sr-only" for="botQuestion">Napíš otázku pre ProBot</label>
          <input id="botQuestion" name="botQuestion" type="text" placeholder="Skús napríklad: Koľko stojí NAS?" autocomplete="off" />
          <button class="btn primary" type="submit">Poslať</button>
        </form>
        <div class="bot-quick" aria-label="Rýchle otázky">
          <button class="bot-pill" type="button" data-bot-query="Koľko stojí Smart Start?">Ceny</button>
          <button class="bot-pill" type="button" data-bot-query="Čo viete o Home Assistante?">Smart Home</button>
          <button class="bot-pill" type="button" data-bot-query="Potrebujem NAS backup">NAS backup</button>
          <button class="bot-pill" type="button" data-bot-query="Ako vás kontaktujem?">Kontakt</button>
        </div>
        <p class="bot-footnote">Prepis sa priebežne posiela tímu na e-mail s časom, stránkou a celou konverzáciou.</p>
      </div>
    `;
    return widget;
  };

  let botWidget = document.querySelector('[data-probot-widget]');
  if (!botWidget) {
    botWidget = buildBotWidget();
    document.body.appendChild(botWidget);
  }

  const botShell = botWidget.querySelector('[data-bot-shell]');
  if (botShell) {
    const botLaunch = botWidget.querySelector('[data-bot-launch]');
    const botLog = botShell.querySelector('[data-bot-log]');
    const botForm = botShell.querySelector('[data-bot-form]');
    const botInput = botShell.querySelector('input[name="botQuestion"]');
    const botToggle = botShell.querySelector('[data-bot-toggle]');
    const botReset = botShell.querySelector('[data-bot-reset]');
    const quickButtons = botShell.querySelectorAll('[data-bot-query]');
    const isEnglish = document.documentElement.lang === 'en';
    const initialTranscript = (() => {
      try {
        const raw = localStorage.getItem(BOT_TRANSCRIPT_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    })();
    const transcript = Array.isArray(initialTranscript) ? initialTranscript : [];
    const botState = {
      lastIntent: 'general',
      pendingEmailTimer: null,
      emailBusy: false,
      profileName: '',
      profileEmail: ''
    };

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
        ? 'Home Assistant and smart home setups work best when they stay simple. I can help with dashboards, automations, lights, heating, Zigbee and multi-hub integration.'
        : 'Home Assistant a smart home dávajú najväčší zmysel, keď zostanú jednoduché. Pomôžem s dashboardmi, automatizáciami, svetlami, kúrením, Zigbee aj multi-hub integráciou.',
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
        : 'Web je postavený tak, aby IT vysvetľoval ľudskou rečou. Live lab stránka je najlepšie miesto na testovanie chatbota pred ostrým nasadením.',
      help: isEnglish
        ? 'Try one of these: services, price, smart home, NAS, PC build or contact.'
        : 'Skús jednu z tém: služby, cena, smart home, NAS, PC build alebo kontakt.'
    };

    const intents = [
      { id: 'pricing', label: 'Cenník', test: ['cena', 'cen', 'price', 'pricing', 'kolko', 'koľko', 'sum'], reply: copy.pricing },
      { id: 'contact', label: 'Kontakt', test: ['kontakt', 'formular', 'form', 'email', 'dopyt', 'kontaktovat', 'contact'], reply: copy.contact },
      { id: 'smart-home', label: 'Smart Home', test: ['smart home', 'home assistant', 'automatiz', 'svetl', 'heating', 'zigbee', 'matter', 'integrac', 'integraciu', 'integracie'], reply: copy.smartHome },
      { id: 'nas', label: 'NAS & Backup', test: ['nas', 'backup', 'zalo', 'zálo', 'disk', 'raid', 'recovery'], reply: copy.nas },
      { id: 'pc', label: 'PC Build', test: ['pc', 'build', 'performance', 'workstation', 'hardware', 'tichy', 'výkon', 'vykon'], reply: copy.performance },
      { id: 'services', label: 'Služby', test: ['sluzby', 'services', 'co robite', 'co ponukate', 'what do you do', 'service'], reply: copy.services },
      { id: 'about', label: 'O nás', test: ['o vas', 'o nás', 'about', 'kto ste', 'kto si', 'about us'], reply: copy.about }
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

    const saveTranscript = () => {
      try { localStorage.setItem(BOT_TRANSCRIPT_KEY, JSON.stringify(transcript)); } catch (e) {}
    };

    const addMessage = (role, text, meta = {}) => {
      const record = {
        role,
        text,
        at: new Date().toISOString(),
        ...meta
      };
      transcript.push(record);
      saveTranscript();

      const item = document.createElement('div');
      item.className = `bot-message ${role}`;
      item.innerHTML = `<p>${escapeText(text)}</p><div class="bot-meta">${role === 'user' ? (isEnglish ? 'You' : 'Ty') : 'ProBot'} · ${formatTime()}</div>`;
      botLog.appendChild(item);
      botLog.scrollTop = botLog.scrollHeight;
    };

    const detectIntent = (input) => {
      const normalized = normalize(input);
      if (/^(a|and)\s+(cena|price|kolko|koľko)/.test(normalized) && botState.lastIntent) {
        return intents.find(intent => intent.id === botState.lastIntent) || null;
      }
      for (const intent of intents) {
        if (intent.test.some(term => normalized.includes(normalize(term)))) {
          return intent;
        }
      }
      return null;
    };

    const captureProfile = (input) => {
      const emailMatch = input.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
      if (emailMatch) botState.profileEmail = emailMatch[0];

      const nameMatch = input.match(/(?:som|ja som|volám sa|volam sa|moje meno je|i am|my name is)\s+([A-Za-zÀ-ž.'-]{2,}(?:\s+[A-Za-zÀ-ž.'-]{2,}){0,2})/i);
      if (nameMatch && nameMatch[1]) botState.profileName = nameMatch[1].trim();
    };

    const topicLabelForIntent = (intent) => {
      if (!intent) return isEnglish ? 'General inquiry' : 'Všeobecný dopyt';
      return intent.label;
    };

    const buildReply = (input) => {
      const normalized = normalize(input);

      if (normalized.includes('dak') || normalized.includes('thank') || normalized.includes('vdaka')) {
        return isEnglish
          ? 'You are welcome. If you want, I can also explain pricing or route you to the contact form.'
          : 'Rado sa stalo. Ak chceš, môžem vysvetliť ceny alebo ťa hneď poslať na formulár.';
      }

      const intent = detectIntent(input);
      if (intent) {
        botState.lastIntent = intent.id;
        if (intent.id === 'pricing') {
          return `${copy.pricing}\n\nAk chceš presnú cenu, napíš rozsah projektu, počet zariadení alebo preferovaný termín.`;
        }
        if (intent.id === 'contact') {
          return `${copy.contact}\n\nMôžeš sem hneď napísať meno, email a krátky popis. Ja to pošlem tímu aj s prepisom chatu.`;
        }
        if (intent.id === 'smart-home') {
          return `${copy.smartHome}\n\nNajsilnejšie výsledky sú, keď je návrh jednoduchý, má dobré názvoslovie a jasné scenáre pre každodenné používanie.`;
        }
        if (intent.id === 'nas') {
          return `${copy.nas}\n\nDôležité je oddeliť zálohu od synchronizácie. Ak chceš, môžem ti navrhnúť aj minimálnu 3-2-1 stratégiu.`;
        }
        if (intent.id === 'pc') {
          return `${copy.performance}\n\nAk chceš, môžem odporučiť aj rozpočet podľa toho, či ide o prácu, hranie alebo tichú domácu zostavu.`;
        }
        if (intent.id === 'services') {
          return `${copy.services}\n\nAk chceš, rozdelím ti to na tri konkrétne balíky podľa rozpočtu.`;
        }
        if (intent.id === 'about') {
          return `${copy.about}\n\nToto je LAB verzia, kde testujeme lepšie odpovede, UI a automatický prepis konverzácie na e-mail.`;
        }
      }

      if (normalized.includes('help') || normalized.includes('pomoc') || normalized.includes('co vies')) {
        return copy.help;
      }

      return `${copy.fallback}\n\n${copy.help}`;
    };

    const renderTranscript = () => {
      botLog.innerHTML = '';
      transcript.forEach(item => {
        const entry = document.createElement('div');
        entry.className = `bot-message ${item.role}`;
        entry.innerHTML = `<p>${escapeText(item.text)}</p><div class="bot-meta">${item.role === 'user' ? (isEnglish ? 'You' : 'Ty') : 'ProBot'} · ${formatTime()}</div>`;
        botLog.appendChild(entry);
      });
      botLog.scrollTop = botLog.scrollHeight;
    };

    const emailSignature = () => transcript.map(item => `${item.role}:${item.text}`).join('||');

    const buildEmailPayload = () => {
      const latestUser = [...transcript].reverse().find(item => item.role === 'user');
      const latestIntent = topicLabelForIntent(intents.find(intent => intent.id === botState.lastIntent));
      const payload = new URLSearchParams();
      payload.set('_captcha', 'false');
      payload.set('_template', 'table');
      payload.set('_subject', `${isEnglish ? 'ProBot chat transcript' : 'Prepis ProBot chatu'} — ${latestIntent}`);
      payload.set('visitor_id', visitorId);
      payload.set('session_id', sessionId);
      payload.set('page_title', document.title);
      payload.set('page_url', location.href);
      payload.set('language', document.documentElement.lang || 'sk');
      payload.set('visitor_name', botState.profileName || (isEnglish ? 'anonymous' : 'anonymný'));
      payload.set('visitor_email', botState.profileEmail || 'unknown');
      payload.set('topic', latestIntent);
      payload.set('last_question', latestUser ? latestUser.text : '');
      payload.set('conversation', transcript.map(item => {
        const label = item.role === 'user' ? (isEnglish ? 'User' : 'Používateľ') : 'ProBot';
        return `[${item.at}] ${label}: ${item.text}`;
      }).join('\n'));
      return payload;
    };

    const sendTranscriptEmail = async () => {
      const signature = emailSignature();
      if (!signature || signature === readStorage(BOT_LAST_EMAIL_KEY)) return;
      botState.emailBusy = true;
      try {
        const body = buildEmailPayload().toString();
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/x-www-form-urlencoded;charset=UTF-8' });
          navigator.sendBeacon(BOT_EMAIL_ENDPOINT, blob);
        } else {
          await fetch(BOT_EMAIL_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body
          });
        }
        writeStorage(BOT_LAST_EMAIL_KEY, signature);
      } catch (e) {
        const fallbackMail = `mailto:protechtbsupport@gmail.com?subject=${encodeURIComponent(isEnglish ? 'ProBot chat transcript' : 'Prepis ProBot chatu')}&body=${encodeURIComponent(buildEmailPayload().toString())}`;
        window.open(fallbackMail, '_blank', 'noopener,noreferrer');
      } finally {
        botState.emailBusy = false;
      }
    };

    const scheduleTranscriptEmail = () => {
      clearTimeout(botState.pendingEmailTimer);
      botState.pendingEmailTimer = window.setTimeout(() => {
        sendTranscriptEmail();
      }, 1200);
    };

    const setCollapsed = (collapsed) => {
      widget.classList.toggle('is-collapsed', collapsed);
      botShell.hidden = collapsed;
      if (botLaunch) botLaunch.hidden = !collapsed;
      if (botToggle) {
        botToggle.textContent = collapsed ? '+' : '−';
        botToggle.setAttribute('aria-label', collapsed ? 'Otvoriť ProBot' : 'Zbaliť ProBot');
      }
      writeStorage(BOT_OPEN_KEY, collapsed ? '0' : '1');
    };

    const ask = (value) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      captureProfile(trimmed);
      addMessage('user', trimmed);
      if (botInput) botInput.value = '';

      window.setTimeout(() => {
        const reply = buildReply(trimmed);
        addMessage('bot', reply);
        scheduleTranscriptEmail();
      }, 220);
    };

    if (!transcript.length) {
      addMessage('bot', copy.greeting, { system: true });
    } else {
      renderTranscript();
    }

    const openPref = readStorage(BOT_OPEN_KEY, '0') === '1';
    setCollapsed(!openPref);

    if (botLaunch) {
      botLaunch.addEventListener('click', () => setCollapsed(false));
    }

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
        transcript.length = 0;
        saveTranscript();
        renderTranscript();
        addMessage('bot', copy.greeting);
        writeStorage(BOT_LAST_EMAIL_KEY, '');
        botInput?.focus();
      });
    }

    if (botToggle) {
      botToggle.addEventListener('click', () => {
        setCollapsed(!botWidget.classList.contains('is-collapsed'));
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
