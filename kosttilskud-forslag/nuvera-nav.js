(function () {
  function init() {
    var nav = document.querySelector('header.site .nav');
    var links = nav && nav.querySelector('.nav-links');
    var style = document.createElement('style');
    style.textContent =
      '.nv-burger{display:none;align-items:center;justify-content:center;width:42px;height:42px;border:none;background:transparent;cursor:pointer;color:var(--ink,#0b1d36);padding:0}' +
      '.nv-burger svg{width:26px;height:26px}' +
      '.nv-sticky{display:none;position:fixed;left:0;right:0;bottom:0;z-index:300;background:rgba(255,255,255,.96);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-top:1px solid var(--line,#e6ecf3);padding:10px 16px}' +
      '.nv-sticky a{display:block;text-align:center;background:var(--sky,#3f86d6);color:#fff;font-weight:600;padding:14px;border-radius:999px;text-decoration:none;font-size:1rem}' +
      ':focus-visible{outline:2px solid var(--sky,#3f86d6);outline-offset:2px;border-radius:4px}' +
      '@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}' +
      '@media(max-width:880px){' +
      '.nv-burger{display:inline-flex}' +
      'header.site .nav-links{position:absolute;top:100%;left:0;right:0;background:#fff;flex-direction:column;align-items:stretch;gap:0;padding:6px 16px 16px;border-bottom:1px solid var(--line,#e6ecf3);box-shadow:0 16px 34px -18px rgba(8,27,52,.4);display:none}' +
      'header.site .nav-links.nv-open{display:flex}' +
      'header.site .nav-links li{width:100%}' +
      'header.site .nav-links .hide-m{display:block!important}' +
      'header.site .nav-links a{display:block;padding:14px 4px;border-bottom:1px solid var(--line,#eef2f7)}' +
      'header.site .nav-links a.nav-cta{margin-top:10px;text-align:center;border-bottom:none}' +
      'body{padding-bottom:72px}' +
      '.nv-sticky{display:block}' +
      '}';
    document.head.appendChild(style);

    var burgerSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
    var closeSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    if (nav && links) {
      var b = document.createElement('button');
      b.className = 'nv-burger';
      b.setAttribute('aria-label', 'Åbn menu');
      b.setAttribute('aria-expanded', 'false');
      b.innerHTML = burgerSVG;
      nav.appendChild(b);
      b.addEventListener('click', function () {
        var open = links.classList.toggle('nv-open');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        b.setAttribute('aria-label', open ? 'Luk menu' : 'Åbn menu');
        b.innerHTML = open ? closeSVG : burgerSVG;
      });
      links.addEventListener('click', function (e) {
        if (e.target.closest('a')) {
          links.classList.remove('nv-open');
          b.setAttribute('aria-expanded', 'false');
          b.setAttribute('aria-label', 'Åbn menu');
          b.innerHTML = burgerSVG;
        }
      });
    }

    var cta = links && links.querySelector('.nav-cta');
    var href = cta ? cta.getAttribute('href') : 'forslag-3-element.html#start';
    var label = cta ? cta.textContent.trim() : 'Få din formel';
    var bar = document.createElement('div');
    bar.className = 'nv-sticky';
    var a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = label;
    bar.appendChild(a);
    document.body.appendChild(bar);
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
