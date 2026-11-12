/* ============================================================
   晓逸·随风 — Main Script
   ============================================================ */
(function () {
  'use strict';

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  /* ============================================================
     页面底图：每次随机一张，加载完再淡入
     ============================================================ */
  var pageBg = document.getElementById('pageBg');

  if (pageBg) {
    /* 子页面（html/）用 body[data-assets] 指回上层目录 */
    var assets = document.body.getAttribute('data-assets') || 'images/';
    var plate = Math.floor(Math.random() * 5) + 1;
    var url = assets + 'plate-' + plate + '.webp';
    var img = new Image();

    img.onload = function () {
      pageBg.style.backgroundImage = 'url("' + url + '")';
      pageBg.classList.add('loaded');
    };

    img.src = url;
  }

  /* ============================================================
     主题：默认深色，只有手动切到浅色才记住（不再跟随系统）
     ============================================================ */
  var themeToggle = document.getElementById('themeToggle');
  var themeTimer = null;

  function isLight() {
    return document.body.classList.contains('light');
  }

  function syncThemeLabel() {
    if (!themeToggle) return;
    themeToggle.textContent = isLight() ? '深色' : '浅色';
  }

  if (safeGet('letsgal-theme') === 'light') {
    document.body.classList.add('light');
  }

  syncThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      document.documentElement.classList.add('theming');
      document.body.classList.toggle('light');
      safeSet('letsgal-theme', isLight() ? 'light' : 'dark');
      syncThemeLabel();

      window.clearTimeout(themeTimer);
      themeTimer = window.setTimeout(function () {
        document.documentElement.classList.remove('theming');
      }, 320);
    });
  }

  /* ============================================================
     导航
     ============================================================ */
  var nav = document.getElementById('navbar');
  var navLinks = document.getElementById('navLinks');
  var toggle = document.getElementById('hamburger');
  var toTop = document.getElementById('toTop');

  var links = navLinks ? navLinks.querySelectorAll('a[href^="#"]') : [];
  var sections = document.querySelectorAll('section[id]');

  function closeMenu() {
    if (!navLinks || !toggle) return;
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('click', function (e) {
      if (nav && !nav.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  /* ============================================================
     滚动：当前区块高亮 + 回到顶部
     ============================================================ */
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;

    if (toTop) toTop.classList.toggle('show', y > 600);

    var current = sections.length ? sections[0].id : '';
    sections.forEach(function (section) {
      if (y + 120 >= section.offsetTop) current = section.id;
    });

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

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     成员资料卡
     ============================================================ */
  var sheet = document.getElementById('memberSheet');
  var people = document.querySelectorAll('.person[data-name]');

  if (sheet && people.length) {
    var panel = document.getElementById('sheetPanel');
    var avatarBox = document.getElementById('sheetAvatar');
    var nameEl = document.getElementById('sheetName');
    var roleEl = document.getElementById('sheetRole');
    var bioEl = document.getElementById('sheetBio');
    var uidEl = document.getElementById('sheetUid');
    var linkEl = document.getElementById('sheetLink');
    var closeBtn = document.getElementById('sheetClose');
    var lastFocus = null;
    var closeTimer = null;

    function openSheet(person) {
      var name = person.getAttribute('data-name') || '';
      var avatar = person.getAttribute('data-avatar');

      avatarBox.textContent = '';
      avatarBox.classList.remove('person-avatar--text');

      if (avatar) {
        var img = document.createElement('img');
        img.src = avatar;
        img.alt = '';
        img.className = 'person-avatar';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.border = '0';
        img.style.borderRadius = 'inherit';
        avatarBox.appendChild(img);
      } else {
        avatarBox.textContent = name.charAt(0);
        avatarBox.classList.add('person-avatar--text');
      }

      nameEl.textContent = name;
      roleEl.textContent = person.getAttribute('data-role') || '';
      bioEl.textContent = person.getAttribute('data-bio') || '';
      uidEl.textContent = 'UID ' + person.getAttribute('data-uid');
      linkEl.href = person.getAttribute('href');

      lastFocus = document.activeElement;
      window.clearTimeout(closeTimer);
      sheet.hidden = false;
      document.body.classList.add('sheet-open');

      /* 下一帧再加 open，浏览器才会认这次过渡 */
      window.requestAnimationFrame(function () {
        sheet.classList.add('open');
      });

      if (panel) panel.focus();
    }

    function closeSheet() {
      if (sheet.hidden) return;

      sheet.classList.remove('open');
      document.body.classList.remove('sheet-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();

      /* 退场只有 180ms，比入场短；期间重新打开会被 clearTimeout 取消 */
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(function () {
        sheet.hidden = true;
      }, 200);
    }

    people.forEach(function (person) {
      person.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openSheet(person);
      });
    });

    sheet.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeSheet();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSheet);

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
     进场与翻页：首屏缓出进场，下面的文字块随滚动渐显渐隐
     ============================================================ */
  function markLoaded() {
    document.body.classList.add('loaded');
  }

  if (document.readyState === 'complete') {
    markLoaded();
  } else {
    window.addEventListener('load', markLoaded);
  }

  /* 图片迟迟不加载也不能把首屏文字卡住 */
  window.setTimeout(markLoaded, 1200);

  var revealObserver = null;

  function reveal(el, index) {
    el.style.setProperty('--d', Math.min(index || 0, 5) * 45 + 'ms');

    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add('in');
    }
  }

  var revealEls = document.querySelectorAll(
    '.head, .person, .clause, .specs > div, .specs-note, .team-note, ' +
    '.about-copy, .about-note, .shot'
  );

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        /* 进场加 in，离场撤掉，方向由 CSS 的缓动区分：进 460ms 缓出，出 180ms 加速 */
        entry.target.classList.toggle('in', entry.isIntersecting);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

    revealEls.forEach(function (el, i) {
      var parent = el.parentElement;
      var index = parent ? Array.prototype.indexOf.call(parent.children, el) : i;
      reveal(el, index);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('in');
    });
  }

  /* ============================================================
     杂项图片墙：按 images/misc/manifest.js 生成，有几张图就几格
     ============================================================ */
  var gallery = document.getElementById('miscGallery');
  var miscItems = window.MISC_ITEMS || [];

  if (gallery) {
    if (!miscItems.length) {
      var empty = document.createElement('p');
      empty.className = 'gallery-empty';
      empty.textContent = '还没有图片。';
      gallery.appendChild(empty);
    } else {
      var assets = document.body.getAttribute('data-assets') || 'images/';

      miscItems.forEach(function (item, i) {
        var fig = document.createElement('figure');
        fig.className = 'shot';

        var cap = document.createElement('figcaption');
        cap.className = 'shot-name mono';
        cap.textContent = item.title || item.file;

        var box = document.createElement('div');
        box.className = 'media';

        var img = document.createElement('img');
        img.src = assets + 'misc/' + item.file;
        img.alt = item.title || item.file;
        img.loading = 'lazy';
        img.decoding = 'async';

        /* 图小的时候看不清表格，点开看原图 */
        var link = document.createElement('a');
        link.href = assets + 'misc/' + item.file;
        link.target = '_blank';
        link.rel = 'noopener';
        link.appendChild(img);

        box.appendChild(link);
        fig.appendChild(cap);
        fig.appendChild(box);
        gallery.appendChild(fig);

        /* 卡片刚插入时高度还是 0，观察器会判成不可见并一直不触发，
           所以这里直接错峰淡入，不走观察器 */
        (function (el, delay) {
          el.style.setProperty('--d', Math.min(delay, 5) * 45 + 'ms');
          window.requestAnimationFrame(function () {
            el.classList.add('in');
          });
        }(fig, i));
      });
    }
  }
})();
