# Quick Restore: ProTechTB LAB

## Posledný rýchly backup
- Súbor: `backups/quick-restore/protechtb-lab-quick-restore-2026-04-10_17-58-52.tar.gz`
- Referenčný commit: `942cf3a`

## Restore (z workspace root)
```bash
tar -xzf backups/quick-restore/protechtb-lab-quick-restore-2026-04-10_17-58-52.tar.gz -C .
```

## Overenie po restore
```bash
git status --short
```
Následne otestovať:
- `https://tomec7.github.io/protechtb-lab/`

## Poznámka
Tento quick-restore je určený na rýchly návrat k poslednému stabilnému stavu hlavných web súborov.
