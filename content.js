// ÚPRAVY OBSAHU: texty a položky stránky sú sústredené v tomto súbore.
// Po úprave stačí commitnúť zmenu a pushnúť ju na GitHub.
const siteContent = {
  proof: [['299 €', 'vstupný IT Check'], ['349 €', 'hlavný paušál / mes.'], ['24 h', 'reakcia na dopyt']],
  solutions: [
    {icon:'🔎', title:'IT Check', intent:'audit', text:'Vstupný audit, ktorý ukáže, či sa po výpadku alebo útoku dokážete obnoviť.', items:['zálohy a test obnovy','účty, MFA a prístupy','sieť, aktualizácie a riziká','plán opráv na 30 dní'], price:'299 €', note:'jednorazovo', cta:'Objednať IT Check'},
    {icon:'🛡️', title:'IT Pokoj', intent:'care', text:'Základný dohľad pre malé firmy, ktoré chcú mať IT pod kontrolou bez vlastného správcu.', items:['monitoring zariadení a záloh','aktualizácie a bezpečnostné kontroly','mesačný stavový report','1 hodina podpory mesačne'], price:'199 €', note:'mesačne bez DPH', cta:'Chcem IT Pokoj'},
    {icon:'⭐', title:'IT Pokoj Plus', intent:'plus', text:'Hlavný balík pre firmy s 5–20 ľuďmi: bezpečnosť, obnova a priebežná správa v jednom.', items:['všetko z IT Pokoj','Microsoft 365, NAS a VPN','štvrťročný test obnovy','3 hodiny podpory + dokumentácia'], price:'349 €', note:'mesačne bez DPH', cta:'Chcem IT Pokoj Plus', featured:true},
    {icon:'🚨', title:'IT Odolnosť', intent:'resilience', text:'Pre firmy, ktorým výpadok alebo strata dát môže zastaviť podnikanie.', items:['oddelené 3-2-1 zálohy','disaster recovery plán','kontrola zraniteľností','SLA a prioritná reakcia'], price:'od 549 €', note:'mesačne bez DPH', cta:'Chcem IT Odolnosť'}
  ],
  benefits: [['🔐 Menej rizika','MFA, aktualizácie, bezpečné prístupy a dokumentácia.'],['🔁 Rýchla obnova','Nie iba záloha, ale pravidelne overený návrat do prevádzky.'],['⏱️ Menej ručnej práce','Automatizácie, reporty a upozornenia namiesto chaosu.'],['🤝 Jeden partner','Jasná komunikácia bez zbytočného technického žargónu.']],
  energy: [['☀️','Výroba','prehľad výkonu a prebytkov'],['🏢','Spotreba','čo budova reálne využíva'],['🚗','Wallbox','nabíjanie podľa dostupnej energie']],
  steps: [['01','Krátky rozhovor','Pochopíme, čo vás stojí čas alebo čo vás môže zastaviť.'],['02','Audit a návrh','Spíšeme riziká, priority, cenu a očakávaný výsledok.'],['03','Implementácia','Nastavíme riešenie, otestujeme ho a odovzdáme zrozumiteľne.'],['04','Dlhodobá starostlivosť','Monitoring, aktualizácie, report a pomoc po nasadení.']],
  faq: [['Ako rýchlo začneme?','Prvý rozhovor trvá približne 20 minút. Po ňom dostanete odporúčanie na konkrétny ďalší krok.'],['Musím mať nové zariadenia?','Nie. Najprv skontrolujeme existujúce vybavenie a nové odporučíme iba vtedy, keď je to potrebné.'],['Robíte aj vzdialenú podporu?','Áno. Bežnú správu a monitoring riešime vzdialene; väčšie inštalácie vieme realizovať aj on-site.'],['Je audit záväzný?','Nie. Audit vám dá fakty, priority a cenu. Rozhodnutie o implementácii je na vás.']]
};
