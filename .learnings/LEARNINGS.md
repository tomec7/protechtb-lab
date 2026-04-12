# Learnings

## [LRN-20260412-001] correction

**Logged**: 2026-04-12T21:55:00+02:00
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary
Pri synchronizácii LAB2 z PRODU som preniesol produkčný bundle bez validácie base-path správania pre GitHub Pages podcestu, čo spôsobilo 404 a nefunkčné preklikávanie.

### Details
- V kroku sync som nahradil `kb-design-lab2/assets/index-BjskkBJk.js` produkčnou verziou z `kb-design-lab3`.
- Build v PRODU používa root path (`/assets/...`), ale LAB2 beží pod `/kb-design-lab2/`.
- Statické HTTP kontroly 200 neodhalili runtime SPA chyby (routing/asset loading po kliknutí).
- Používateľ správne nahlásil, že to sme už riešili a že sa problém zopakoval.

### Suggested Action
1. Nikdy nekopírovať compiled JS bundle medzi LAB/PROD pri odlišnom base path.
2. Kopírovať len obsahové assety/dáta, nie build artefakty.
3. Po každom zásahu do SPA robiť povinný runtime smoke test v prehliadači (nie len HTTP check): Home, /about, /services, /portfolio, /pricing, /contact + preklik medzi stránkami.
4. Pred odpoveďou "hotovo" validovať, že žiadny asset/routing nejde na nesprávny base path.
5. Pri buildoch bez zdrojového kódu považovať deep-link funkčnosť na GitHub Pages podceste za neoverenú, kým neprejde runtime test; statické checky nestačia.

### Metadata
- Source: user_feedback
- Related Files: /home/lenovo/.openclaw/workspace/kb-design-lab2/assets/index-BjskkBJk.js
- Tags: lab-prod-sync, base-path, spa-routing, github-pages

---
