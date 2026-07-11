// 1) 量測導覽列高度，讓遮罩/抽屜從綠色底下開始
(function(){
  function setTopbarH(){
    const tb = document.querySelector('.topbar');
    if(!tb) return;
    const h = Math.round(tb.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--topbarH', h + 'px');
  }
  setTopbarH();
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(setTopbarH); }
  window.addEventListener('resize', setTopbarH);
  window.addEventListener('orientationchange', setTopbarH);
})();

// 2) 手機抽屜開關
(function(){
  const btn = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('backdrop');
  const closeBtn = document.getElementById('menuClose');
  if(!btn || !menu || !backdrop || !closeBtn) return;

  function openMenu(){
    menu.classList.add('open'); backdrop.classList.add('show');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow='hidden'; document.body.style.overflow='hidden';
  }
  function closeMenu(){
    menu.classList.remove('open'); backdrop.classList.remove('show');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow=''; document.body.style.overflow='';
  }

  btn.addEventListener('click', () => {
    if(menu.classList.contains('open')){ closeMenu(); } else { openMenu(); }
  });
  closeBtn.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeMenu(); });
  document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click', closeMenu));
})();
