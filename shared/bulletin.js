/* 公告／新聞列表：搜尋、分類、分頁、燈箱 */
(function (global) {
  'use strict';

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function norm(s) {
    return (s || '').toLowerCase().trim();
  }

  function initLightbox() {
    if (global.openLightbox) return;
    const box = document.getElementById('lightbox');
    if (!box) return;
    const img = box.querySelector('img');
    const closeBtn = box.querySelector('.close, .lightbox-close');

    global.openLightbox = function (src, alt) {
      img.src = src;
      img.alt = alt || '';
      box.classList.add('open');

      function hide() {
        box.classList.remove('open');
        img.src = '';
        document.removeEventListener('keydown', onKey);
        closeBtn.removeEventListener('click', hide);
        box.removeEventListener('click', onBg);
      }
      function onKey(e) { if (e.key === 'Escape') hide(); }
      function onBg(e) { if (e.target === box) hide(); }

      document.addEventListener('keydown', onKey);
      closeBtn.addEventListener('click', hide);
      box.addEventListener('click', onBg);
    };
  }

  function initBulletin(options) {
    const {
      dataSource,
      listId,
      searchId,
      filterId,
      pagerId,
      anchorId,
      perPage = 6,
      enableImages = false,
      enableDataCat = false,
      preview = false
    } = options;

    const data = Array.isArray(dataSource) ? dataSource : [];
    const list = document.getElementById(listId);
    const search = searchId ? document.getElementById(searchId) : null;
    const filter = filterId ? document.getElementById(filterId) : null;
    const pager = pagerId ? document.getElementById(pagerId) : null;
    const anchor = () => {
      const el = document.getElementById(anchorId);
      return el ? el.offsetTop - 80 : 0;
    };

    if (!list) return;

    let view = { q: '', cat: '全部', page: 1, idx: [...Array(data.length).keys()] };

    function applyFilters() {
      const q = norm(view.q);
      const cat = view.cat;
      view.idx = data
        .map((_, i) => i)
        .filter(i => {
          const it = data[i];
          const hay = norm((it.title || '') + ' ' + (it.desc || '') + ' ' + (it.categories || []).join(' '));
          const okQ = q ? hay.includes(q) : true;
          const okCat = cat === '全部' ? true : (it.categories || []).includes(cat);
          return okQ && okCat;
        });
      view.page = 1;
      render();
    }

    function renderCard(item) {
      const hasLink = !!item.href;
      const el = document.createElement(hasLink ? 'a' : 'div');
      el.className = 'news' + (hasLink ? '' : ' is-static');
      if (hasLink) {
        el.href = item.href;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }

      (item.categories || []).forEach(cat => {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = cat;
        if (enableDataCat) b.setAttribute('data-cat', cat);
        el.appendChild(b);
      });

      const t = document.createElement('div');
      t.className = 'title';
      t.textContent = item.title || '';
      el.appendChild(t);

      if (item.desc) {
        const d = document.createElement('div');
        d.className = 'desc';
        d.innerHTML = (item.desc || '').replace(/\n/g, '<br>');
        el.appendChild(d);
      }

      if (enableImages && item.img) {
        const wrap = document.createElement('div');
        wrap.className = 'thumb-wrap';
        const img = document.createElement('img');
        img.src = item.img;
        img.alt = item.title || '公告圖片';
        img.loading = 'lazy';
        wrap.appendChild(img);

        const overlay = document.createElement('div');
        overlay.className = 'thumb-overlay';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '點我放大';
        overlay.appendChild(btn);
        wrap.appendChild(overlay);

        btn.addEventListener('click', ev => {
          ev.preventDefault();
          ev.stopPropagation();
          if (global.openLightbox) global.openLightbox(item.img, item.title || '公告圖片');
        });

        el.appendChild(wrap);
      }

      const m = document.createElement('div');
      m.className = 'meta';
      m.textContent = [item.date, item.source].filter(Boolean).join(' · ');
      el.appendChild(m);

      return el;
    }

    function pageBtn(label, className, disabled, onClick) {
      const b = document.createElement('button');
      b.className = className;
      b.textContent = label;
      b.disabled = !!disabled;
      if (!disabled) b.addEventListener('click', onClick);
      return b;
    }

    function pageNum(num, current) {
      const btn = document.createElement('button');
      btn.className = 'page-num' + (num === current ? ' active' : '');
      btn.textContent = num;
      btn.addEventListener('click', () => {
        view.page = num;
        render();
        window.scrollTo({ top: anchor(), behavior: 'smooth' });
      });
      return btn;
    }

    function drawPager(pages) {
      if (!pager || preview) return;
      pager.innerHTML = '';
      if (pages <= 1) return;

      pager.appendChild(pageBtn('上一頁', 'page-btn page-prev', view.page === 1, () => {
        view.page--;
        render();
        window.scrollTo({ top: anchor(), behavior: 'smooth' });
      }));

      const cur = view.page;
      const want = new Set([1, cur - 1, cur, cur + 1, pages]);
      const nums = [...Array(pages)].map((_, i) => i + 1).filter(n => want.has(n) && n >= 1 && n <= pages);
      let last = 0;
      nums.forEach(n => {
        if (n - last > 1) {
          const ell = document.createElement('span');
          ell.className = 'ellipsis';
          ell.textContent = '…';
          pager.appendChild(ell);
        }
        pager.appendChild(pageNum(n, cur));
        last = n;
      });

      pager.appendChild(pageBtn('下一頁', 'page-btn page-next', view.page === pages, () => {
        view.page++;
        render();
        window.scrollTo({ top: anchor(), behavior: 'smooth' });
      }));
    }

    function render() {
      const total = view.idx.length;
      const pages = Math.max(1, Math.ceil(total / perPage));
      view.page = Math.min(view.page, pages);

      const start = (view.page - 1) * perPage;
      const end = Math.min(start + perPage, total);
      const pageIdx = view.idx.slice(start, end);

      list.innerHTML = '';
      const frag = document.createDocumentFragment();
      pageIdx.forEach(i => frag.appendChild(renderCard(data[i])));
      list.appendChild(frag);

      drawPager(pages);
    }

    if (search && !preview) {
      search.addEventListener('input', debounce(e => {
        view.q = e.target.value;
        applyFilters();
      }, 150));
    }
    if (filter && !preview) {
      filter.addEventListener('change', e => {
        view.cat = e.target.value;
        applyFilters();
      });
    }

    if (enableImages) initLightbox();
    applyFilters();
  }

  global.initBulletin = initBulletin;
})(window);
