/* ============================================================
   LetsGal Studio — Main Script
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     随机背景图
     ============================================================ */
  var BG_FOLDER = 'images/bg/';
  var BG_EXT = '.png';
  var BG_COUNT = 5;

  var bgEl = document.getElementById('bgImage');

  /* ============================================================
     背景取色
     从当前背景图里采样：整体色相 -> 中性灰阶；最饱和的一簇 -> 强调色。
     ============================================================ */
  function derivePalette(img) {
    try {
      var N = 32;
      var cv = document.createElement('canvas');
      cv.width = N;
      cv.height = N;

      var ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, N, N);

      var data = ctx.getImageData(0, 0, N, N).data;
      var dx = 0, dy = 0, weight = 0, lumSum = 0, lumCount = 0;
      var bins = [];
      var i, k;

      for (i = 0; i < 36; i++) bins[i] = 0;

      for (i = 0; i < data.length; i += 4) {
        var r = data[i] / 255;
        var g = data[i + 1] / 255;
        var b = data[i + 2] / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var v = max;
        var s = max ? (max - min) / max : 0;

        lumSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        lumCount++;

        /* 跳过接近纯黑、纯白与无彩色的像素 */
        if (v < 0.08 || v > 0.97 || s < 0.09) continue;

        var h;
        var d = max - min;
        if (d === 0) h = 0;
        else if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        if (h < 0) h += 360;

        /* 明度适中的像素权重更高 */
        var w = s * (1 - Math.abs(v - 0.55) * 0.8);
        if (w <= 0) continue;

        dx += Math.cos(h * Math.PI / 180) * w;
        dy += Math.sin(h * Math.PI / 180) * w;
        weight += w;

        bins[Math.floor(h / 10) % 36] += w;
      }

      if (weight < 1) return null;

      var base = Math.atan2(dy, dx) * 180 / Math.PI;
      if (base < 0) base += 360;

      /* 强调色取最饱和的一簇，但避开与中性色相过于接近的区间 */
      var bestBin = -1;
      var bestScore = 0;
      for (k = 0; k < 36; k++) {
        var hue = k * 10 + 5;
        var gap = Math.abs(((hue - base + 540) % 360) - 180);
        var score = bins[k] * (gap < 40 ? 0.15 : 1);
        if (score > bestScore) {
          bestScore = score;
          bestBin = k;
        }
      }

      return {
        base: Math.round(base),
        accent: bestBin < 0 ? Math.round((base + 40) % 360) : bestBin * 10 + 5,
        lum: lumCount ? Math.min(1, Math.max(0, lumSum / lumCount)) : 0.5
      };
    } catch (e) {
      return null;
    }
  }

  function applyPalette(palette) {
    if (!palette) return;
    var root = document.documentElement;
    root.style.setProperty('--hue', palette.base);
    root.style.setProperty('--accent-hue', palette.accent);
    root.style.setProperty('--photo-lum', palette.lum.toFixed(3));
  }

  if (bgEl && BG_COUNT > 0) {
    var pick = Math.floor(Math.random() * BG_COUNT) + 1;
    bgEl.style.backgroundImage = 'url("' + BG_FOLDER + pick + BG_EXT + '")';

    var probe = new Image();
    probe.onload = function () {
      applyPalette(derivePalette(probe));
      bgEl.classList.add('loaded');
    };
    probe.src = BG_FOLDER + pick + BG_EXT;

    /* 兜底：图片加载过慢时也不阻断阅读 */
    setTimeout(function () {
      bgEl.classList.add('loaded');
    }, 1200);
  }

  /* ============================================================
     头像加载失败时退回首字
     ============================================================ */
  document.querySelectorAll('.member-avatar img').forEach(function (img) {
    img.addEventListener('error', function () {
      var box = img.parentNode;
      box.textContent = img.getAttribute('data-initial') || '';
      box.style.fontSize = '17px';
    });
  });

  /* ============================================================
     主题
     ============================================================ */
  function safeGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function safeSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  }

  /* 未手动切换时跟随系统外观 */
  var systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)');

  function applySystemTheme() {
    if (safeGet('letsgal-theme')) return;
    document.body.classList.toggle('light', systemPrefersLight.matches);
  }

  if (safeGet('letsgal-theme') === 'light') {
    document.body.classList.add('light');
  } else {
    applySystemTheme();
  }

  if (systemPrefersLight.addEventListener) {
    systemPrefersLight.addEventListener('change', applySystemTheme);
  }

  /* ============================================================
     导航
     ============================================================ */
  var navbar = document.getElementById('navbar');
  var navCollapse = document.getElementById('navCollapse');
  var hamburger = document.getElementById('hamburger');
  var themeToggle = document.getElementById('themeToggle');
  var toTop = document.getElementById('toTop');

  if (!navbar || !navCollapse || !hamburger || !toTop) {
    return;
  }

  var links = navCollapse.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('section[id]');
  var isMobile = function () { return window.innerWidth <= 900; };

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      document.body.classList.toggle('light');
      safeSet('letsgal-theme',
        document.body.classList.contains('light') ? 'light' : 'dark');
    });
  }

  function openMenu() {
    hamburger.classList.add('open');
    navCollapse.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navCollapse.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    if (navCollapse.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navCollapse.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (!isMobile()) closeMenu();
  });

  /* ============================================================
     滚动
     ============================================================ */
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;

    navbar.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 480);

    var current = sections.length ? sections[0].id : '';
    sections.forEach(function (sec) {
      if (y + 140 >= sec.offsetTop) current = sec.id;
    });

    if (y + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }

    links.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================================
     成员资料卡：点卡片就地展开，再从卡里进真实主页
     ============================================================ */
  var sheet = document.getElementById('memberSheet');
  var memberCards = document.querySelectorAll('.member-card[data-name]');

  if (sheet && memberCards.length) {
    var sheetAvatar = document.getElementById('sheetAvatar');
    var sheetName = document.getElementById('sheetName');
    var sheetRole = document.getElementById('sheetRole');
    var sheetBio = document.getElementById('sheetBio');
    var sheetUid = document.getElementById('sheetUid');
    var sheetLink = document.getElementById('sheetLink');
    var sheetClose = document.getElementById('sheetClose');
    var sheetPanel = document.getElementById('sheetPanel');
    var lastFocus = null;

    function openSheet(card) {
      var avatar = card.getAttribute('data-avatar');
      var name = card.getAttribute('data-name') || '';

      sheetAvatar.textContent = '';
      if (avatar) {
        var img = document.createElement('img');
        img.src = avatar;
        img.alt = '';
        sheetAvatar.appendChild(img);
      } else {
        sheetAvatar.textContent = name.charAt(0);
      }

      sheetName.textContent = name;
      sheetRole.textContent = card.getAttribute('data-role') || '';
      sheetBio.textContent = card.getAttribute('data-bio') || '';
      sheetUid.textContent = 'UID ' + card.getAttribute('data-uid');
      sheetLink.href = card.getAttribute('href');

      lastFocus = document.activeElement;
      sheet.hidden = false;
      document.body.classList.add('sheet-open');
      if (sheetPanel) sheetPanel.focus();
    }

    function closeSheet() {
      if (sheet.hidden) return;
      sheet.hidden = true;
      document.body.classList.remove('sheet-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    memberCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        /* 允许用修饰键或中键正常打开新标签 */
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openSheet(card);
      });
    });

    sheet.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeSheet();
    });

    sheetClose.addEventListener('click', closeSheet);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSheet();
      if (e.key !== 'Tab' || sheet.hidden) return;

      var focusable = sheet.querySelectorAll('a[href], button');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ============================================================
     进场动画
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();
