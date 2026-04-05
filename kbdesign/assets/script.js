
(function(){
  const m = document.getElementById('menu');
  const t = document.getElementById('mobileToggle');
  if(t && m){ t.addEventListener('click', ()=>m.classList.toggle('open')); }

  let theme = 'light';
  try { theme = localStorage.getItem('kbdesign-theme') || 'light'; } catch(e){}
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');
  function applyTheme(){
    if(theme==='dark'){
      body.style.setProperty('--bg','#191d22');
      body.style.setProperty('--bg-soft','#1f252c');
      body.style.setProperty('--card','#1f252c');
      body.style.setProperty('--line','#303844');
      body.style.setProperty('--text','#f2f4f6');
      body.style.setProperty('--muted','#b5bcc7');
    }
  }
  applyTheme();
  if(themeBtn){
    themeBtn.textContent = theme==='dark' ? '☀️' : '🌙';
    themeBtn.addEventListener('click', ()=>{
      theme = theme==='dark' ? 'light' : 'dark';
      localStorage.setItem('kbdesign-theme', theme);
      location.reload();
    });
  }
})();
