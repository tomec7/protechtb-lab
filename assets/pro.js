
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

  // sticky mini-CTA
  const sticky = document.createElement('a');
  sticky.className = 'sticky-cta';
  sticky.href = 'kontakt.html';
  sticky.textContent = document.documentElement.lang === 'en' ? 'Write to us' : 'Napíšte nám';
  sticky.setAttribute('aria-label', sticky.textContent);
  document.body.appendChild(sticky);

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

  const chatLang = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'sk';
  const chatCopy = {
    sk: {
      launcher: 'Probot',
      title: 'Probot',
      subtitle: 'Napíšte presne, čo potrebujete. Text môžete upraviť pred odoslaním.',
      intro: 'Dobrý deň, som Probot. Pomôžem vám spísať otázku tak, aby sme vedeli rýchlo a presne odpovedať.',
      intro2: 'Vyberte si tému, upravte text a potvrďte súhlas so zápisom do systému. Každá správa príde aj ako e-mailový súhrn a pri nejasnom dopyte si vypýtam doplnenie.',
      topicLabel: 'Téma',
      topicPlaceholder: 'Krátke zhrnutie',
      contactLabel: 'Kontakt',
      contactPlaceholder: 'Email alebo telefón',
      messageLabel: 'Vaša otázka',
      messagePlaceholder: 'Popíšte problém alebo požiadavku vlastnými slovami. Môžete to meniť priamo tu.',
      consentLabel: 'Môžeme si túto požiadavku uložiť do systému a ozvať sa späť?',
      summaryTitle: 'Náhľad správy',
      summaryFallback: 'Zatiaľ bez textu. Napíšte, čo presne chcete riešiť.',
      summaryHint: 'Čím presnejšie to napíšete, tým presnejšie sa ozveme späť.',
      transcriptLabel: 'Súhrn konverzácie',
      sendLabel: 'Odoslať e-mailom',
      directLabel: 'Klasický formulár',
      success: 'Hotovo. Požiadavka odišla e-mailom a čoskoro sa ozveme.',
      errorConsent: 'Najprv prosím potvrďte, že požiadavku môžeme uložiť do systému.',
      errorMessage: 'Doplňte aspoň tému a otázku.',
      errorContact: 'Doplňte kontakt, aby sme sa vedeli ozvať späť.',
      categoryLabel: 'Kategória',
      subjectLabel: 'Predmet',
      chips: ['PC build', 'Smart home', 'NAS backup', 'Servis / podpora'],
      categories: {
        pc: 'PC build',
        smart: 'Smart home',
        nas: 'NAS / backup',
        support: 'Servis / podpora',
        general: 'Všeobecný dopyt'
      },
      replies: {
        pcPrice: 'Pri hernom PC záleží hlavne od grafiky, procesora a rozlíšenia, ktoré chceš hrať. Pošli rozpočet, hry a či už máš monitor, a navrhnem rozumný odhad namiesto slepého cenníka.',
        pcGeneral: 'Na herný PC pripravíme zostavu podľa rozpočtu a cieľa. Napíš, aké hry hráš a či chceš skôr tichý, kompaktný alebo výkonový build.',
        smartPrice: 'Pri smart home sa cena odvíja od počtu zariadení a rozsahu automatizácie. Napíš, čo chceš ovládať, a poviem ti orientačný rozsah bez hádania.',
        smartGeneral: 'Napíš, čo chceš automatizovať, koľko zariadení máš a či ide o byt alebo dom. Podľa toho dáme zmysluplný návrh.',
        nasPrice: 'NAS Safe Home je od 349 €, ale finálna cena závisí od kapacity, diskov a záloh. Napíš, koľko dát chceš chrániť a či potrebuješ vzdialený prístup.',
        nasGeneral: 'Pri NAS riešení pomôže, ak napíšeš kapacitu dát, počet diskov a či chceš len backup alebo aj zdieľanie súborov v sieti.',
        supportGeneral: 'Napíš stručne, čo sa deje, na akom zariadení a odkedy problém trvá. Ak vieš, pridaj aj fotku alebo chybové hlásenie.',
        generalFollowup: 'Aby som trafil správnu odpoveď, napíš mi prosím 1 vetou, čo presne chceš vyriešiť a čo už máš pripravené.',
        servicePrices: {
          smartStart: 'Smart Start je od 299 €.',
          nasSafeHome: 'NAS Safe Home je od 349 €.',
          itCareMonthly: 'IT Care Monthly je 49–99 € mesačne.'
        }
      }
    },
    en: {
      launcher: 'Probot',
      title: 'Probot',
      subtitle: 'Write exactly what you need. You can edit the text before sending.',
      intro: 'Hi, I am Probot. I will help you phrase the request so we can reply faster and more precisely.',
      intro2: 'Pick a topic, edit the text and confirm permission to save it in the system. Every message also arrives as an email summary, and I will ask for clarification when needed.',
      topicLabel: 'Topic',
      topicPlaceholder: 'Short summary',
      contactLabel: 'Contact',
      contactPlaceholder: 'Email or phone',
      messageLabel: 'Your question',
      messagePlaceholder: 'Describe the issue or request in your own words. You can edit it here.',
      consentLabel: 'May we store this request in our system and get back to you?',
      summaryTitle: 'Message preview',
      summaryFallback: 'No text yet. Tell us what you need help with.',
      summaryHint: 'The clearer you write it, the more precise our reply will be.',
      transcriptLabel: 'Conversation summary',
      sendLabel: 'Send by email',
      directLabel: 'Classic form',
      success: 'Done. The request was sent by email and we will get back to you soon.',
      errorConsent: 'Please confirm that we may store the request in the system first.',
      errorMessage: 'Please add at least a topic and a question.',
      errorContact: 'Please add a contact so we can reply back.',
      categoryLabel: 'Category',
      subjectLabel: 'Subject',
      chips: ['PC build', 'Smart home', 'NAS backup', 'Service / support'],
      categories: {
        pc: 'PC build',
        smart: 'Smart home',
        nas: 'NAS / backup',
        support: 'Service / support',
        general: 'General request'
      },
      replies: {
        pcPrice: 'For a gaming PC, the price depends mainly on the GPU, CPU and target resolution. Send me your budget, the games you play and whether you already have a monitor, and I will give you a realistic estimate instead of a blind price list.',
        pcGeneral: 'We can shape a gaming PC around your budget and goals. Tell me which games you play and whether you want a quiet, compact or high-performance build.',
        smartPrice: 'For smart home projects, the price depends on the number of devices and how much automation you want. Tell me what you want to control and I will give you a useful range.',
        smartGeneral: 'Tell me what you want to automate, how many devices you have and whether it is an apartment or a house. Then I can suggest a sensible setup.',
        nasPrice: 'NAS Safe Home starts from 349 €, but the final price depends on capacity, disks and backup scope. Tell me how much data you want to protect and whether you need remote access.',
        nasGeneral: 'For a NAS setup, please share the data volume, number of disks and whether you want only backup or also file sharing on the network.',
        supportGeneral: 'Tell me briefly what is happening, on which device and since when the issue started. If you can, add a photo or the error message.',
        generalFollowup: 'To point you to the right answer, please send me one sentence about what you want to solve and what you already have.',
        servicePrices: {
          smartStart: 'Smart Start starts from 299 €.',
          nasSafeHome: 'NAS Safe Home starts from 349 €.',
          itCareMonthly: 'IT Care Monthly is 49–99 € per month.'
        }
      }
    }
  }[chatLang];
  const directContactHref = chatLang === 'en' ? 'en/kontakt.html' : 'kontakt.html';

  const detectCategory = (topic, message) => {
    const haystack = `${topic} ${message}`.toLowerCase();
    if (/(pc|gaming|build|zostav|hardware|komponent|gpu|cpu)/.test(haystack)) return 'pc';
    if (/(smart|home assistant|automatiz|zariaden|scene|dashboard|hub)/.test(haystack)) return 'smart';
    if (/(nas|backup|záloh|zaloha|storage|úlož|ulozisko|raid)/.test(haystack)) return 'nas';
    if (/(servis|podpora|support|oprava|help|problém|problem|issue|chyba|fault)/.test(haystack)) return 'support';
    return 'general';
  };

  const detectIntent = (topic, message) => {
    const haystack = `${topic} ${message}`.toLowerCase();
    const wantsPrice = /(koľko|kolko|cena|stojí|stoji|price|cost|budget|rozpočet|rozpocet|koľko by ma stalo|cenník|ponuka)/.test(haystack);
    const wantsSmartStart = /smart\s*start/.test(haystack);
    const wantsNasSafeHome = /nas\s*safe\s*home/.test(haystack);
    const wantsItCare = /it\s*care/.test(haystack);
    return { haystack, wantsPrice, wantsSmartStart, wantsNasSafeHome, wantsItCare };
  };

  const buildBotReply = (topic, message, category) => {
    const intent = detectIntent(topic, message);
    const reply = chatCopy.replies;

    if (intent.wantsSmartStart) return reply.servicePrices.smartStart;
    if (intent.wantsNasSafeHome) return reply.servicePrices.nasSafeHome;
    if (intent.wantsItCare) return reply.servicePrices.itCareMonthly;

    if (category === 'pc') {
      return intent.wantsPrice ? reply.pcPrice : reply.pcGeneral;
    }
    if (category === 'smart') {
      return intent.wantsPrice ? reply.smartPrice : reply.smartGeneral;
    }
    if (category === 'nas') {
      return intent.wantsPrice ? reply.nasPrice : reply.nasGeneral;
    }
    if (category === 'support') {
      return reply.supportGeneral;
    }

    return reply.generalFollowup;
  };

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'chat-launcher';
  launcher.textContent = chatCopy.launcher;
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-controls', 'probotChat');
  launcher.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('aside');
  panel.className = 'chat-panel';
  panel.id = 'probotChat';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-title">
        <strong>${escapeHtml(chatCopy.title)}</strong>
        <span>${escapeHtml(chatCopy.subtitle)}</span>
      </div>
      <button class="chat-close" type="button" aria-label="${escapeHtml(chatLang === 'en' ? 'Close chat' : 'Zatvoriť chat')}">✕</button>
    </div>
    <div class="chat-body">
      <div class="chat-thread" id="probotThread">
        <div class="chat-bubble bot">${escapeHtml(chatCopy.intro)}</div>
        <div class="chat-bubble bot">${escapeHtml(chatCopy.intro2)}</div>
        <div class="chat-bubble user" id="probotPreview">${escapeHtml(chatCopy.summaryFallback)}</div>
      </div>
      <div class="chat-chips" id="probotChips"></div>
      <form class="chat-form" action="https://formsubmit.co/protechtbsupport@gmail.com" method="POST" target="probotSink" novalidate>
        <div class="chat-grid">
          <div>
            <label for="probotTopic">${escapeHtml(chatCopy.topicLabel)}</label>
            <input id="probotTopic" name="topic" type="text" placeholder="${escapeHtml(chatCopy.topicPlaceholder)}" required />
          </div>
          <div>
            <label for="probotContact">${escapeHtml(chatCopy.contactLabel)}</label>
            <input id="probotContact" name="contact" type="text" placeholder="${escapeHtml(chatCopy.contactPlaceholder)}" required />
          </div>
        </div>
        <div>
          <label for="probotMessage">${escapeHtml(chatCopy.messageLabel)}</label>
          <textarea id="probotMessage" name="message" placeholder="${escapeHtml(chatCopy.messagePlaceholder)}" required></textarea>
        </div>
        <label class="chat-consent">
          <input id="probotConsent" name="consent" type="checkbox" required />
          <span>${escapeHtml(chatCopy.consentLabel)}</span>
        </label>
        <div class="chat-summary" id="probotSummary">
          <strong>${escapeHtml(chatCopy.summaryTitle)}</strong>
          <div class="chat-note">${escapeHtml(chatCopy.summaryHint)}</div>
        </div>
        <div class="chat-status" id="probotStatus" aria-live="polite"></div>
        <div class="chat-actions">
          <button class="btn primary" type="submit">${escapeHtml(chatCopy.sendLabel)}</button>
          <a class="btn" href="${escapeHtml(directContactHref)}">${escapeHtml(chatCopy.directLabel)}</a>
        </div>
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_subject" value="" />
        <input type="hidden" name="page" value="${escapeHtml(location.href)}" />
        <input type="hidden" name="language" value="${escapeHtml(chatLang)}" />
        <input type="hidden" name="category" value="" />
        <input type="hidden" name="summary" value="" />
        <input type="hidden" name="conversation" value="" />
        <input type="hidden" name="interaction" value="" />
      </form>
    </div>
  `;

  const sink = document.createElement('iframe');
  sink.name = 'probotSink';
  sink.title = 'Probot email sink';
  sink.className = 'sr-only';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);
  document.body.appendChild(sink);

  const closeBtn = panel.querySelector('.chat-close');
  const topicInput = panel.querySelector('#probotTopic');
  const contactInput = panel.querySelector('#probotContact');
  const messageInput = panel.querySelector('#probotMessage');
  const consentInput = panel.querySelector('#probotConsent');
  const preview = panel.querySelector('#probotPreview');
  const thread = panel.querySelector('#probotThread');
  const summary = panel.querySelector('#probotSummary');
  const status = panel.querySelector('#probotStatus');
  const chips = panel.querySelector('#probotChips');
  const form = panel.querySelector('.chat-form');
  const subjectField = panel.querySelector('input[name="_subject"]');
  const categoryField = panel.querySelector('input[name="category"]');
  const summaryField = panel.querySelector('input[name="summary"]');
  const conversationField = panel.querySelector('input[name="conversation"]');
  const interactionField = panel.querySelector('input[name="interaction"]');
  let interactionCount = 0;
  const transcript = [];

  const addBubble = (role, text) => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = text;
    thread.appendChild(bubble);
    thread.scrollTop = thread.scrollHeight;
    return bubble;
  };

  chatCopy.chips.forEach((chip) => {
    const chipBtn = document.createElement('button');
    chipBtn.type = 'button';
    chipBtn.className = 'chat-chip';
    chipBtn.textContent = chip;
    chipBtn.addEventListener('click', () => {
      if (!topicInput.value.trim()) topicInput.value = chip;
      if (!messageInput.value.trim()) {
        const starter = chatLang === 'en'
          ? 'Please help me with this request: '
          : 'Prosím pomôžte mi s touto požiadavkou: ';
        messageInput.value = `${starter}${chip.toLowerCase()}`;
      }
      updatePreview();
      messageInput.focus();
    });
    chips.appendChild(chipBtn);
  });

  const getPayload = () => {
    const topic = topicInput.value.trim();
    const message = messageInput.value.trim();
    const contact = contactInput.value.trim();
    const category = detectCategory(topic, message);
    return { topic, message, contact, category };
  };

  const renderSummary = () => {
    const { topic, message, contact, category } = getPayload();
    const subject = `${chatCopy.categories[category]}${topic ? ` • ${topic}` : ''}`;
    subjectField.value = subject;
    categoryField.value = chatCopy.categories[category];

    const messagePreview = topic || message
      ? `${topic ? `<strong>${escapeHtml(topic)}</strong><br>` : ''}${escapeHtml(message || topic)}`
      : escapeHtml(chatCopy.summaryFallback);
    preview.innerHTML = messagePreview;
    summary.innerHTML = `
      <strong>${escapeHtml(chatCopy.summaryTitle)}</strong>
      <div>${escapeHtml(chatCopy.subjectLabel)}: ${escapeHtml(subject)}</div>
      <div>${escapeHtml(chatCopy.categoryLabel)}: ${escapeHtml(chatCopy.categories[category])}</div>
      <div>${contact ? escapeHtml(contact) : escapeHtml(chatCopy.summaryHint)}</div>
    `;
    const transcriptText = transcript.length
      ? transcript.map((entry, index) => `${index + 1}. ${entry.role === 'user' ? 'User' : 'Bot'}: ${entry.text}`).join(' | ')
      : chatCopy.summaryFallback;
    summaryField.value = `${chatCopy.subjectLabel}: ${subject}\n${chatCopy.categoryLabel}: ${chatCopy.categories[category]}\n${chatCopy.transcriptLabel}: ${transcriptText}`;
    conversationField.value = transcriptText;
    interactionField.value = String(interactionCount);
  };

  const updatePreview = () => {
    renderSummary();
    status.textContent = '';
    status.className = 'chat-status';
  };

  [topicInput, contactInput, messageInput].forEach((el) => {
    el.addEventListener('input', updatePreview);
  });
  consentInput.addEventListener('change', updatePreview);

  const openChat = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.setAttribute('aria-expanded', 'true');
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'chatbot_open', {
        event_category: 'lead_capture',
        event_label: location.pathname
      });
    }
    setTimeout(() => topicInput.focus(), 50);
  };

  const closeChat = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    launcher.setAttribute('aria-expanded', 'false');
  };

  launcher.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      closeChat();
    } else {
      openChat();
    }
  });
  closeBtn.addEventListener('click', closeChat);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('open')) closeChat();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const { topic, message, contact } = getPayload();
    const category = detectCategory(topic, message);
    const botReplyText = buildBotReply(topic, message, category);

    if (!topic || !message) {
      status.textContent = chatCopy.errorMessage;
      status.classList.add('error');
      return;
    }
    if (!contact) {
      status.textContent = chatCopy.errorContact;
      status.classList.add('error');
      return;
    }
    if (!consentInput.checked) {
      status.textContent = chatCopy.errorConsent;
      status.classList.add('error');
      return;
    }

    subjectField.value = `${chatCopy.categories[category]}${topic ? ` • ${topic}` : ''}`;
    categoryField.value = chatCopy.categories[category];
    interactionCount += 1;
    transcript.push({ role: 'user', text: `${topic}: ${message}` });
    transcript.push({ role: 'bot', text: botReplyText });
    addBubble('user', `${topic}: ${message}`);
    addBubble('bot', botReplyText);
    status.textContent = chatCopy.success;
    status.className = 'chat-status success';
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'chatbot_submit', {
        event_category: 'lead_capture',
        event_label: category
      });
    }
    renderSummary();
    form.submit();
    setTimeout(() => {
      messageInput.value = '';
      updatePreview();
      messageInput.focus();
    }, 1200);
  });

  updatePreview();

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
