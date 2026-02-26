(function(){
  const y = document.querySelector('[data-year]');
  if(y) y.textContent = String(new Date().getFullYear());

  // simple highlight current nav
  const here = location.pathname.replace(/\/+$/,'/') || '/';
  document.querySelectorAll('[data-nav]').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href) return;
    const full = new URL(href, location.href).pathname.replace(/\/+$/,'/') || '/';
    if(full === here){
      a.style.borderColor = 'rgba(215,184,106,.65)';
      a.style.background = 'rgba(215,184,106,.10)';
    }
  });
})();
