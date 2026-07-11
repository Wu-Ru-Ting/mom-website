/* 全站共用：Footer 載入、Scroll Reveal、Back to Top、Loading、Lucide */
(function () {
  'use strict';

  const prefixes = ['shared/', './shared/', '../shared/', '/shared/'];

  function getPrefix() {
    for (const p of prefixes) {
      const link = document.querySelector('link[href*="' + p + '"]');
      if (link) return p;
    }
    return 'shared/';
  }

  /* ── Page Loader（Q 版人物走路）：只在載入較久時顯示 ── */
  function initLoader() {
    if (document.querySelector('.page-loader')) return;

    const delay = 900;
    const minVisible = 400;
    let loader = null;
    let shownAt = 0;
    let loaded = document.readyState === 'complete';

    function createLoader() {
      if (loaded || loader) return;
      loader = document.createElement('div');
      loader.className = 'page-loader';
      loader.innerHTML =
        '<div class="loader-chibi" aria-hidden="true">' +
          '<div class="chibi-shadow"></div>' +
          '<div class="chibi">' +
            '<div class="chibi-hair-back"></div>' +
            '<div class="chibi-face">' +
              '<span class="chibi-eye left"></span>' +
              '<span class="chibi-eye right"></span>' +
              '<span class="chibi-blush left"></span>' +
              '<span class="chibi-blush right"></span>' +
              '<span class="chibi-mouth"></span>' +
            '</div>' +
            '<div class="chibi-body"></div>' +
            '<div class="chibi-skirt"></div>' +
            '<div class="chibi-arm left"></div>' +
            '<div class="chibi-arm right"></div>' +
            '<div class="chibi-leg left"></div>' +
            '<div class="chibi-leg right"></div>' +
          '</div>' +
        '</div>' +
        '<div class="loader-text">載入中…</div>';
      document.body.prepend(loader);
      shownAt = Date.now();
    }

    function hideLoader() {
      loaded = true;
      if (!loader) return;
      const wait = Math.max(0, minVisible - (Date.now() - shownAt));
      setTimeout(function () {
        loader.classList.add('hidden');
        setTimeout(function () { loader.remove(); }, 600);
      }, wait);
    }

    const showTimer = setTimeout(createLoader, delay);
    window.addEventListener('load', function () {
      clearTimeout(showTimer);
      hideLoader();
    });
  }

  /* ── Footer ── */
  async function loadFooter() {
    const mount = document.getElementById('footer-mount');
    if (!mount) return;
    for (const p of prefixes) {
      try {
        const res = await fetch(p + 'footer.html', { cache: 'no-store' });
        if (!res.ok) continue;
        mount.outerHTML = await res.text();
        initLucide();
        return;
      } catch (e) {}
    }
  }

  /* ── Back to Top ── */
  function initBackToTop() {
    if (document.querySelector('.back-to-top')) return;
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', '回到頂部');
    btn.innerHTML = '<i data-lucide="arrow-up" style="width:22px;height:22px"></i>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    initLucide();
  }

  /* ── Scroll Reveal ── */
  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ── Lucide Icons ── */
  function initLucide() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /* ── Init ── */
  function initAll() {
    initScrollReveal();
    initLucide();
  }

  initLoader();
  loadFooter().then(initAll);
  initBackToTop();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
