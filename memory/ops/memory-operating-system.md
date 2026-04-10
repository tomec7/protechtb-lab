# Memory Operating System (Tomáš)

## Cieľ
Minimalizovať opakovanie chýb a zabezpečiť, že pred každou úlohou sa použije aktuálna pamäť.

## 1) Pre-flight (povinné pred každou úlohou)
1. Skontrolovať projektový fact-sheet (`memory/projects/*.md`).
2. Overiť cieľ: LAB vs PROD.
3. Pri webových zásahoch overiť operátora (Tomáš/Klaudy).
4. Pri deployi pripraviť rollback bod (commit + backup timestamp).

## 2) Post-task zápis (po každej významnej úlohe)
Zapísať do dennej poznámky:
- čo sa menilo,
- kde (repo/branch/link),
- prečo,
- rollback bod.

## 3) Denná hygiene
Krátky review:
- nové rozhodnutia,
- 1 procesné zlepšenie,
- doplnenie do dlhodobej pamäte.

## 4) Týždenný review
- deduplikácia faktov,
- kontrola aktuálnosti repo/deploy mapy,
- kontrola funkčnosti backup workflow.

## Non-negotiables
- Komunikácia po slovensky.
- Uprednostniť OpenAI modely.
- Pri weboch: najprv LAB, produkcia až po explicitnom schválení.
- Pri každej LAB/PROD zmene zapisovať backup timestamp.
