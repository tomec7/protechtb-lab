# 2026-04-03

## 1) Dnešné zlyhania (session)
- **Exekúcia bez doručenia výsledku**: opakovane som odpovedal statusom bez finálneho výstupu (YouTube transcript, HA úlohy).
- **Nadmerný approval ping-pong**: namiesto jednej robustnej dávky som posielal veľa jednotlivých approval krokov.
- **Nesprávny predpoklad endpointov**: pri Home Assistant dashboard API som najprv skúšal nefunkčné REST cesty; správna cesta bola cez WS a až po diagnostike sa našiel root cause (`url_path` musí obsahovať `-`).

## 2) Dnešné zlepšenia (session)
- **YouTube pipeline opravená**: doinštalovaný `yt-dlp`, fallbacky zvládnuté, doručené poznámky + export do dokumentu.
- **HA dashboard doručený end-to-end**: dashboard „apple“ úspešne vytvorený a verifikovaný (`url_path: apple-dashboard`).
- **HA konektivita stabilizovaná**: prepnutie z `homeassistant.local` na IP (`192.168.50.200`) + úspešný audit run.

## 3) OpenClaw novinky (z release feedu)
- **v2026.4.1**: nový `/tasks` board v chate, SearXNG provider pre `web_search`, Feishu comment flow, voice wake na macOS.
- **Apr-02 release stream**: veľa zmien v Task Flow substrate, plugin hook `before_agent_reply`, zlepšenia exec defaults/approvals, opravy provider transportu a endpoint policy.
- **Relevantné pre prax**: viac robustnosti v exec policy + lepší základ pre background task orchestration.

## 4) Komunita: čo je dobré vs. čo je zlé
### Chvála
- Silný progres vo feature sete (tasks, plugin seams, provider routing hardening).
- Aktívne opravy v approval/transport oblasti a rýchle iterácie releasov.

### Kritika
- Telegram/exec approvals sú pre mobilný flow stále bolestivé (časté approval kroky, timeouty, zlá kontinuita po approve).
- Reportované bugy pri Telegram inline approval callbackoch (najmä pri SecretRef tokenoch) a routing edge-caseoch.

## 5) Konkrétne zmeny správania na zajtra
1. **One-shot execution batching**: pri náročných úlohách minimalizovať počet approval requestov (jeden širší krok namiesto reťazca mini-krokov).
2. **Proof-first completion**: nehlásiť progres bez artefaktu (súbor, výsledok, verifikácia endpointu, konkrétny output).

# 2026-04-04

## 1) Dnešné zlyhania (session)
- Pri ANC porovnaní som najprv miešal výsledky pre **WF-1000XM6 (earbuds)** a ty si chcel **WH-1000XM6 (over-ear)**; odpoveď mala byť presnejšie oddelená.
- Pri web prieskume bol slabší quality filter zdrojov (priveľa agregátorov/SEO článkov, málo primárnych meraní).
- YouTube časť bola skôr výber titulov než extrakcia meraní z videí.

## 2) Dnešné zlepšenia (session)
- Rýchlejšie doručovanie výsledkov bez dlhého ping-pongu.
- Lepšie držanie sa praktického záveru pre tvoj use-case (office + gym).
- Stabilnejšie HA fungovanie po prepnutí na IP (menej náhodných DNS zlyhaní).

## 3) OpenClaw novinky + komunita (prakticky)
- Potvrdené v release feedoch: `/tasks` board v chate, SearXNG provider pre web search, posilnené Task Flow a viac opráv v exec/transport policy.
- Komunita stále chváli tempo releasov a robustnosť plugin vrstvy.
- Najčastejšia kritika ostáva Telegram exec approval UX (frikcia, timeouty, slabšia kontinuita po approve); na GitHub issues sa to opakuje vo viacerých reportoch.

## 4) Konkrétne zmeny na zajtra
1. Pri porovnaniach striktne oddeliť modelové rady (WH vs WF) už v 1. odseku.
2. Pri researchi dať prednosť primárnym zdrojom/meraniam a explicitne označiť slabé zdroje.

# 2026-04-05

## 1) Dnešné zlyhania (session)
- Prvý web scan mal priveľa sekundárnych/SEO zdrojov; až následne som overoval oficiálne GitHub stránky.
- V self-review som mal slabý vstup z pamäte (semantic recall nevrátil relevantné výsledky), takže som sa musel oprieť o lokálne poznámky.
- Komunitné signály som bral hlavne z issues/reportov; menej priameho signálu z Discord diskusií.

## 2) Dnešné zlepšenia (session)
- Výstupy boli konzistentne stručné a praktické v slovenčine.
- Overenie noviniek som oprel o oficiálny release feed (`openclaw/openclaw/releases`) namiesto len agregátorov.
- Pri kritike som uvádzal konkrétne reprodukovateľné problémy (Telegram SecretRef callback, Discord approval timeout).

## 3) OpenClaw novinky + komunita (prakticky)
- Release stream (Apr-02): posilnený Task Flow substrate, plugin hook `before_agent_reply`, viac hardeningu v provider transporte/routingu.
- Pokračujú opravy v approvals/channels a transport policy; trend je smerom k vyššej robustnosti produkčného behu.
- Chvála komunity: rýchle tempo releasov, silný progres v orchestration a plugin rozhraní.
- Kritika komunity: approval UX na mobile (timeouty, viac krokov, slabšia spätná väzba pri zlyhaní callbacku), opakované hlásenia v GitHub issues.

## 4) Konkrétne zmeny na zajtra
1. Pri web researchi používať „official-first“ poradie (GitHub releases/issues + docs ako prvé).
2. Pri community feedbacke uvádzať len overiteľné signály (issue link + symptom), a oddeliť fakt od interpretácie.

# 2026-04-06

## 1) Dnešné zlyhania (session)
- Web search narazil na anti-bot challenge, takže časť community scanu nešla cez štandardný flow.
- „Today interactions“ boli obsahovo chudobné (hlavne cron reporty), preto je self-review menej bohatý na nové behaviorálne dáta.

## 2) Dnešné zlepšenia (session)
- Namiesto spoliehania sa na agregátory som prešiel priamo na oficiálne zdroje (`openclaw/openclaw/releases` + konkrétne GitHub issues).
- Report držím krátky a akčný (iba praktické body, bez vaty).
- Konzistentne mapujem kritiku na reprodukovateľné symptómy (SecretRef callback, 2-min timeout v approvals).

## 3) OpenClaw novinky + komunita (prakticky)
- Bez veľkého nového release skoku; naďalej dominuje línia z Apr-02: Task Flow hardening, plugin hooks (`before_agent_reply`), transport/routing stabilita.
- Chvála: rýchle release tempo a silná robustnosť v orchestration vrstvách.
- Kritika: approval UX v mobilných kanáloch (timeouty, nejasný feedback po kliknutí) je stále opakovaný pain point v issues.

## 4) Konkrétne zmeny na zajtra
1. Pri zlyhaní web search okamžite prepnúť na direct-source fallback (releases/issues/docs) bez zdržania.
2. V každom nightly reporte explicitne oddeliť „čo je nové dnes“ vs. „čo je pokračujúci trend“.

# 2026-04-07

## 1) Dnešné zlyhania (session)
- Interakcie boli opäť veľmi riedke (hlavne cron), takže self-review má nízky objem nových behaviorálnych dát.
- Web search vrátil veľa sekundárnych/SEO stránok; bez tvrdého filtra by to zhoršilo kvalitu reportu.
- Priamy komunitný signál z Discord/fóra bol slabý; musel som sa oprieť najmä o GitHub issues.

## 2) Dnešné zlepšenia (session)
- Držal som „official-first“: release/changelog som overil priamo cez `openclaw/openclaw/releases`.
- Kritiku som oprel o konkrétne reprodukovateľné issues (`#59614` Telegram SecretRef callback, `#58941` Discord approval regression).
- Výstup som udržal stručný a praktický, bez neoverených tvrdení.

## 3) OpenClaw novinky + komunita (prakticky)
- Release línia sa posunula ďalej (2026.4.x): pribudli multimodálne built-in nástroje (`video_generate`, `music_generate`) a viac provider integrácií.
- Pokračuje hardening approvals/channels + transport/routing stability; viditeľný dôraz na produkčnú robustnosť.
- Chvála: rýchly release cadence a široké funkčné rozšírenie bez zastavenia stability prác.
- Kritika: approval UX zostáva citlivý bod (Telegram inline callback/SecretRef, Discord regression okolo approval flow).

## 4) Konkrétne zmeny na zajtra
1. Pri community scane budem striktne uvádzať len body s overiteľným primárnym zdrojom (release/issue URL + symptom).
2. Každý večer doplním krátke „confidence“ označenie (vysoká/stredná/nízka) pre komunitné tvrdenia, aby bolo jasné, kde je slabší signál.

