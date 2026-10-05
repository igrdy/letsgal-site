/* ============================================================
   LetsGal Studio - Main Script
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     随机背景图
     ============================================================ */
  var BG_FOLDER = 'images/bg/';
  var BG_EXT    = '.png';
  var BG_COUNT  = 5;

  var bgEl = document.getElementById('bgImage');

  if (bgEl && BG_COUNT > 0) {
    var pick = Math.floor(Math.random() * BG_COUNT) + 1;
    var url  = BG_FOLDER + pick + BG_EXT;

    bgEl.style.backgroundImage = 'url("' + url + '")';

    setTimeout(function () {
      bgEl.classList.add('loaded');
    }, 100);

    console.log('[bg] 使用背景图：' + url);
  }

  /* ============================================================
     主题切换
     ============================================================ */
  function safeGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function safeSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  }

  if (safeGet('letsgal-theme') === 'light') {
    document.body.classList.add('light');
  }

  /* ============================================================
     导航栏交互
     ============================================================ */
  var navbar      = document.getElementById('navbar');
  var navCollapse = document.getElementById('navCollapse');
  var hamburger   = document.getElementById('hamburger');
  var themeToggle = document.getElementById('themeToggle');
  var toTop       = document.getElementById('toTop');

  if (!navbar || !navCollapse || !hamburger || !toTop) {
    console.warn('[nav] 关键元素未找到，交互初始化中断');
    return;
  }

  var links    = navCollapse.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('section[id]');

  /* ---------- 主题切换按钮 ---------- */
  if (themeToggle) {
    themeToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      document.body.classList.toggle('light');
      safeSet('letsgal-theme',
        document.body.classList.contains('light') ? 'light' : 'dark');
    });
  }

  /* ---------- 汉堡按钮：切换菜单 ---------- */
  function openMenu() {
    hamburger.classList.add('open');
    navCollapse.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navbar.classList.remove('nav-hidden');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navCollapse.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu(e) {
    if (e) e.stopPropagation();
    if (navCollapse.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* 用 touch + click 双绑定，防止某些移动浏览器 click 不触发 */
  hamburger.addEventListener('click', toggleMenu);
  hamburger.addEventListener('touchend', function (e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  }, { passive: false });

  /* 点击菜单内链接后收起 */
  navCollapse.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* 点击外部收起 */
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      closeMenu();
    }
  });

  /* ESC 收起 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  /* ---------- 滚动处理 ---------- */
  var ticking = false;
  var lastY   = window.scrollY;

  function isMobile() {
    return window.innerWidth <= 960;
  }

  function onScroll() {
    var y = window.scrollY;
    var delta = y - lastY;

    navbar.classList.toggle('scrolled', y > 30);
    toTop.classList.toggle('show', y > 480);

    /* 移动端：向下滚动隐藏顶栏，向上滚动显示 */
    if (isMobile()) {
      var menuOpen = navCollapse.classList.contains('open');

      if (menuOpen || y < 80) {
        navbar.classList.remove('nav-hidden');
      } else if (delta > 4) {
        navbar.classList.add('nav-hidden');
      } else if (delta < -4) {
        navbar.classList.remove('nav-hidden');
      }
    } else {
      navbar.classList.remove('nav-hidden');
    }

    /* 当前区块高亮 */
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

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  /* ---------- 回到顶部 ---------- */
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 进场动画 ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();