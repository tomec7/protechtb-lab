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
