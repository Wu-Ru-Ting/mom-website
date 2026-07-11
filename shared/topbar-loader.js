/* 全頁共用：載入 topbar + 初始化 Lucide */
(function () {
  'use strict';
  const mountId = 'topbar-mount';
  const prefixes = ['shared/', './shared/', '../shared/', '/shared/'];

  async function tryLoad() {
    for (const p of prefixes) {
      try {
        const res = await fetch(p + 'topbar.html', { cache: 'no-store' });
        if (!res.ok) continue;
        const html = await res.text();
        const mount = document.getElementById(mountId);
        if (!mount) return;
        mount.outerHTML = html;
        const s = document.createElement('script');
        s.src = p + 'topbar.js';
        document.body.appendChild(s);
        setTimeout(function () {
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 50);
        return;
      } catch (e) {}
    }
    const mount = document.getElementById(mountId);
    if (mount) {
      mount.innerHTML =
        '<div style="background:#fee;border:1px solid #f99;color:#900;padding:10px;border-radius:8px;">' +
        '無法載入 <code>shared/topbar.html</code>。請以本地伺服器開啟網站。' +
        '</div>';
    }
  }

  tryLoad();
})();
