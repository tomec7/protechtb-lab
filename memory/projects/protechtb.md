# Project Fact Sheet: ProTechTB

## Repozitáre
- LAB: `tomec7/protechtb-lab`
- PROD: `tomec7/protechtb`

## Hosting / URL
- LAB URL: `https://tomec7.github.io/protechtb-lab/`
- PROD URL: `https://protechtb.sk/`

## Branch map
- `protechtb-lab`: pracovná branch (LAB vývoj)
- `main` v `protechtb-lab`: branch publikovaná cez GitHub Pages (LAB URL)
- `main` v `protechtb`: produkčná vetva (PROD URL)

## Deploy pravidlá
1. Implementácia v LAB.
2. Test URL + cache-buster (`?v=...`).
3. Až po potvrdení nasadiť do PROD.
4. V reporte vždy uviesť:
   - commit,
   - backup timestamp pred/potom,
   - finálny link.

## Rollback minimum
- rollback commit SHA,
- backup súbor s timestampom,
- stručný restore postup.
