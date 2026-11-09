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
     主题：跟随系统，手动切换后记住
     ============================================================ */
  var systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)');
  var themeToggle = document.getElementById('themeToggle');

  function isLight() {
    return document.body.classList.contains('light');
  }

  function syncThemeLabel() {
    if (!themeToggle) return;
    themeToggle.textContent = isLight() ? '深色' : '浅色';
  }

  function applySystemTheme() {
    if (safeGet('letsgal-theme')) return;
    document.body.classList.toggle('light', systemPrefersLight.matches);
    syncThemeLabel();
  }

  if (safeGet('letsgal-theme') === 'light') {
    document.body.classList.add('light');
  } else {
    applySystemTheme();
  }

  syncThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      document.body.classList.toggle('light');
      safeSet('letsgal-theme', isLight() ? 'light' : 'dark');
      syncThemeLabel();
    });
  }

  if (systemPrefersLight.addEventListener) {
    systemPrefersLight.addEventListener('change', applySystemTheme);
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
      sheet.hidden = false;
      document.body.classList.add('sheet-open');
      if (panel) panel.focus();
    }

    function closeSheet() {
      if (sheet.hidden) return;
      sheet.hidden = true;
      document.body.classList.remove('sheet-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
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

})();
