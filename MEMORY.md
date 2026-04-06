# MEMORY.md

## User Preferences
- Communicate with Tom in Slovak.
- Prefer to use only OpenAI models for all tasks (set on 2026-03-09).
- Pri práci na webe najprv upravovať iba LAB/staging verziu; produkciu meniť až po explicitnom schválení od Toma (set on 2026-04-05).
- Pri LAB úpravách robiť checkpoint po každej významnej zmene (set on 2026-04-06).
- Keď Tom alebo Klaudy požiada o klon z produkcie do LAB, hneď na prvý pokus spraviť kompletný hardening: prepis všetkých ciest na LAB base path, oprava navigácie (bez úniku na root), route entry stránky bez 404, dostupné assets/media a finálne overenie hlavných URL + menu klikov (set on 2026-04-06).
- Produkčné repozitáre: `protechtb` a `kb-design-lab3` — nemeníme ich bez explicitného potvrdenia.
- Testovacie repozitáre na úpravy: `protechtb-lab` a `kb-design-lab2`.
- Vlastníctvo/režim práce: Tomáš (Tomas) rieši `protechtb-lab`; Klaudy rieši `kb-design-lab2`.
- Pred každou webovou úpravou sa najprv opýtať, kto je práve za klávesnicou (Tomáš alebo Klaudy), a podľa toho viesť odpovede aj prácu.
