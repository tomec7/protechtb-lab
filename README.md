# PROTECHTB Lab 2

Predajná landing page pre PROTECHTB Bratislava: IT pokoj pre malé firmy, bezpečné zálohy, obnoviteľnosť a Smart Energy.

## Úpravy obsahu

Najčastejšie zmeny rob v `content.js`: čísla v `proof`, balíky v `solutions`, benefity, Smart Energy kroky, proces a FAQ. Pri balíkoch zachovaj aj `intent` (`audit`, `care`, `plus`, `resilience` alebo `energy`), aby formulár a chatbot vytvorili správny predmet e-mailu. Vizuál a responzívne správanie je v `styles.css` a `chatbot.css`. Interakcie, menu, chatbot a animácie sú v `script.js`. Štruktúru sekcií upravuj v `index.html`.

## Aktuálna ponuka

- **IT Check** — vstupný audit za 299 €.
- **IT Pokoj** — základný dohľad za 199 €/mes. bez DPH.
- **IT Pokoj Plus** — hlavný balík za 349 €/mes. bez DPH.
- **IT Odolnosť** — rozšírená správa od 549 €/mes. bez DPH.
- **Smart Energy** — samostatná špecializácia podľa technológie.

## Chatbot a dopyty

Chatbot návštevníka prevedie výberom služby, zachytí jeho potrebu a kontakty a odošle dopyt na `protechtbsupport@gmail.com` cez FormSubmit AJAX endpoint. Predmet sa automaticky nastaví podľa služby a telo e-mailu obsahuje celý prepis konverzácie. Klasický formulár používa rovnakú cestu. Pri prvom použití môže FormSubmit vyžiadať potvrdenie prijímacej adresy.

## Lokálne spustenie

```bash
python3 -m http.server 8000
```

Potom otvor http://localhost:8000.

## Publikovanie

```bash
git add .
git commit -m "Update landing page"
git push
```

Live web: https://tomec7.github.io/protechtb-lab2/
