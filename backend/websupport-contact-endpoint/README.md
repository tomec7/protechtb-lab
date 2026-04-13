# ProTechTB Contact Endpoint (Websupport)

Tento endpoint slúži ako vlastná náhrada za formsubmit.co.

## Súbory
- `contact.php` — POST endpoint pre kontaktný formulár
- `.htaccess` — povolenie CORS pre OPTIONS

## Nasadenie na Websupport
1. V DNS vytvor subdoménu: `api.protechtb.sk` -> Websupport hosting.
2. Na hostingu vytvor priečinok (napr. `public_html/` alebo `www/`) a nahraj `contact.php` + `.htaccess`.
3. Otestuj: `https://api.protechtb.sk/contact.php` (má vrátiť JSON `{ "ok": true, ... }`).
4. Otestuj POST z webu `https://protechtb.sk/kontakt.html`.

## Poznámka
- Endpoint momentálne odosiela mail cez PHP `mail()` na `protechtbsupport@gmail.com`.
- Ak Websupport blokuje odchádzajúce maily, prepneme to na SMTP (PHPMailer).
