/* ============================================================
   IPS Website V5.8
   - background music is ON by default when the browser allows it
   - V5.6 music control restored
   - internal page navigation is handled without a full document reload,
     so the same audio element keeps playing continuously between:
     CCTV / efractie / incendiu / control acces / automatizari /
     monitorizare / interventie / homepage.
   ============================================================ */

(() => {
  const currentScript = [...document.scripts].find(script => {
    try {
      return new URL(script.src, document.baseURI).pathname.endsWith('/script.js');
    } catch (_) {
      return false;
    }
  });

  const SITE_ROOT = currentScript
    ? new URL('.', currentScript.src)
    : new URL('./', document.baseURI);

  const SITE_ROOT_PATH = SITE_ROOT.pathname.endsWith('/')
    ? SITE_ROOT.pathname
    : `${SITE_ROOT.pathname}/`;

  const pageCache = new Map();
  let navigating = false;
  let revealObserver = null;

  /* ----------------------------
     URL normalization
     ---------------------------- */
  function isSpecialHref(value) {
    return /^(?:mailto:|tel:|sms:|javascript:|data:)/i.test(value || '');
  }

  function normalizeUrls(root, baseUrl) {
    if (!root) return;

    root.querySelectorAll('a[href]').forEach(link => {
      const raw = link.getAttribute('href');
      if (!raw || isSpecialHref(raw)) return;

      try {
        link.setAttribute('href', new URL(raw, baseUrl).href);
      } catch (_) {}
    });

    root.querySelectorAll('[src]').forEach(el => {
      const raw = el.getAttribute('src');
      if (!raw || /^(?:data:|blob:)/i.test(raw)) return;

      try {
        el.setAttribute('src', new URL(raw, baseUrl).href);
      } catch (_) {}
    });

    root.querySelectorAll('form[action]').forEach(form => {
      const raw = form.getAttribute('action');
      if (!raw || isSpecialHref(raw)) return;

      try {
        form.setAttribute('action', new URL(raw, baseUrl).href);
      } catch (_) {}
    });
  }

  // The header and footer remain mounted during internal navigation.
  // Make their relative URLs absolute once, before history.pushState()
  // changes the visible browser URL.
  normalizeUrls(document.querySelector('.site-header'), location.href);
  normalizeUrls(document.querySelector('.site-footer'), location.href);

  // Mark the permanent site shell. Internal navigation replaces only <main>.
  document.documentElement.dataset.ipsPersistentShell = '1';

  /* ----------------------------
     Header / navigation
     ---------------------------- */
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const mega = document.querySelector('.has-mega');
  const megaTrigger = document.querySelector('.mega-trigger');

  function closeMenus() {
    if (nav) nav.classList.remove('open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    if (mega) mega.classList.remove('open');
    if (megaTrigger) megaTrigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function updateHeaderOnScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
    });
  }

  if (megaTrigger && mega) {
    megaTrigger.addEventListener('click', event => {
      event.preventDefault();
      const open = mega.classList.toggle('open');
      megaTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.addEventListener('click', event => {
    if (mega && !mega.contains(event.target) && window.innerWidth > 820) {
      mega.classList.remove('open');
      if (megaTrigger) megaTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  /* ----------------------------
     Page-specific functionality
     ---------------------------- */
  function initReveal(root = document) {
    if (revealObserver) revealObserver.disconnect();

    const items = [...root.querySelectorAll('.reveal')];
    if (!items.length) return;

    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      items.forEach(el => revealObserver.observe(el));
    } else {
      items.forEach(el => el.classList.add('revealed'));
    }
  }

  function initVideoPlaceholder(root = document) {
    root.querySelectorAll('.video-placeholder').forEach(button => {
      if (button.dataset.ipsBound === '1') return;
      button.dataset.ipsBound = '1';

      button.addEventListener('click', () => {
        alert('Aici vom integra videoclipul promo IPS cand materialul final este disponibil.');
      });
    });
  }

  function updateYear() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function updateActiveNavigation(url = new URL(location.href)) {
    const path = url.pathname.replace(/\/+$/, '/');

    document.querySelectorAll('.main-nav > a').forEach(link => {
      link.classList.remove('active');

      try {
        const target = new URL(link.href);
        const targetPath = target.pathname.replace(/\/+$/, '/');

        const isHome =
          targetPath === SITE_ROOT_PATH ||
          targetPath === `${SITE_ROOT_PATH}index.html`;

        const currentIsHome =
          path === SITE_ROOT_PATH ||
          path === `${SITE_ROOT_PATH}index.html`;

        if (
          (isHome && currentIsHome && !target.hash) ||
          (!isHome && targetPath === path)
        ) {
          link.classList.add('active');
        }
      } catch (_) {}
    });
  }

  function initCurrentPage(root = document) {
    initReveal(root);
    initVideoPlaceholder(root);
    updateYear();
    updateActiveNavigation();
  }

  /* ----------------------------
     Smooth same-document hash scroll
     ---------------------------- */
  function scrollToHash(hash, behavior = 'smooth') {
    if (!hash || hash === '#') {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    let id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch (_) {
      id = hash.slice(1);
    }

    const target = document.getElementById(id);
    if (!target) {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const headerOffset = header ? header.offsetHeight + 14 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  /* ----------------------------
     Persistent internal navigation
     ---------------------------- */
  function isInternalPageUrl(url) {
    if (url.origin !== location.origin) return false;

    const pathname = decodeURIComponent(url.pathname);
    if (!pathname.startsWith(SITE_ROOT_PATH)) return false;

    let relative = pathname.slice(SITE_ROOT_PATH.length);
    relative = relative.replace(/^\/+/, '');

    // Explicitly allow only the site's own HTML routes.
    // This avoids any ambiguity caused by GitHub Pages paths,
    // trailing slashes or relative links from nested service pages.
    const allowed = [
      '',
      'index.html',
      'monitorizare/',
      'monitorizare/index.html',
      'interventie/',
      'interventie/index.html',
      'solutii/supraveghere-video/',
      'solutii/supraveghere-video/index.html',
      'solutii/alarma-efractie/',
      'solutii/alarma-efractie/index.html',
      'solutii/avertizare-incendiu/',
      'solutii/avertizare-incendiu/index.html',
      'solutii/control-acces/',
      'solutii/control-acces/index.html',
      'solutii/automatizari-porti/',
      'solutii/automatizari-porti/index.html'
    ];

    return allowed.includes(relative);
  }

  async function fetchPage(url) {
    const clean = new URL(url.href);
    clean.hash = '';
    const key = clean.href;

    if (pageCache.has(key)) return pageCache.get(key);

    const promise = fetch(key, {
      credentials: 'same-origin',
      headers: { 'X-IPS-Navigation': '1' }
    }).then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.text();
    });

    pageCache.set(key, promise);

    try {
      return await promise;
    } catch (error) {
      pageCache.delete(key);
      throw error;
    }
  }

  async function navigateTo(targetUrl, { push = true } = {}) {
    if (navigating) return;

    const url = new URL(targetUrl, location.href);
    const current = new URL(location.href);

    const sameDocument =
      url.origin === current.origin &&
      url.pathname === current.pathname &&
      url.search === current.search;

    if (sameDocument) {
      if (push && url.href !== current.href) {
        history.pushState({ ipsSpa: true }, '', url.href);
      }
      scrollToHash(url.hash, 'smooth');
      closeMenus();
      updateActiveNavigation(url);
      return;
    }

    navigating = true;
    document.documentElement.classList.add('ips-page-loading');
    document.body.setAttribute('aria-busy', 'true');

    try {
      const html = await fetchPage(url);
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const incomingMain = parsed.querySelector('main');
      const currentMain = document.querySelector('main');

      if (!incomingMain || !currentMain) {
        throw new Error('Main content not found');
      }

      normalizeUrls(incomingMain, url.href);

      // Replace ONLY the content area. Header, footer, music player and
      // the audio element remain mounted, so the track never restarts.
      currentMain.replaceWith(incomingMain);

      if (parsed.title) document.title = parsed.title;

      const incomingDescription = parsed.querySelector('meta[name="description"]');
      const currentDescription = document.querySelector('meta[name="description"]');
      if (incomingDescription && currentDescription) {
        currentDescription.setAttribute(
          'content',
          incomingDescription.getAttribute('content') || ''
        );
      }

      if (push) {
        history.pushState({ ipsSpa: true }, '', url.href);
      }

      closeMenus();
      initCurrentPage(incomingMain);

      requestAnimationFrame(() => {
        if (url.hash) {
          scrollToHash(url.hash, 'auto');
        } else {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      });
    } catch (error) {
      // Fallback for an unexpected fetch/parser problem.
      // Normal page navigation still works, but it may briefly restart audio.
      location.href = url.href;
      return;
    } finally {
      navigating = false;
      document.documentElement.classList.remove('ips-page-loading');
      document.body.removeAttribute('aria-busy');
    }
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    if (typeof event.button === 'number' && event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href]');
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    let url;
    try {
      url = new URL(link.href, location.href);
    } catch (_) {
      return;
    }

    if (!isInternalPageUrl(url)) return;

    const current = new URL(location.href);
    const sameDocument =
      url.origin === current.origin &&
      url.pathname === current.pathname &&
      url.search === current.search;

    // Same page + hash can be handled without fetching.
    if (sameDocument && url.hash) {
      event.preventDefault();
      history.pushState({ ipsSpa: true }, '', url.href);
      scrollToHash(url.hash, 'smooth');
      closeMenus();
      return;
    }

    // IMPORTANT: cancel the browser's normal page load. The <audio> element
    // lives outside <main> and therefore stays mounted and keeps playing.
    event.preventDefault();
    navigateTo(url, { push: true });
  }, true);

  window.addEventListener('popstate', () => {
    navigateTo(new URL(location.href), { push: false });
  });

  /* ----------------------------
     Prefetch common internal pages
     ---------------------------- */
  function prefetchInternalPages() {
    const urls = new Set();

    document.querySelectorAll('.site-header a[href], .site-footer a[href]').forEach(link => {
      try {
        const url = new URL(link.href, location.href);
        if (!isInternalPageUrl(url)) return;
        url.hash = '';
        urls.add(url.href);
      } catch (_) {}
    });

    urls.forEach(href => {
      const url = new URL(href);
      if (url.pathname === location.pathname) return;
      fetchPage(url).catch(() => {});
    });
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetchInternalPages, { timeout: 1800 });
  } else {
    setTimeout(prefetchInternalPages, 900);
  }

  /* ============================================================
     BACKGROUND MUSIC
     ============================================================ */
  const MUSIC_URL =
    'https://audio.soundbreak.ai/980d5807ad05d9ab8f6e91f6b38a5f9b/b288dda860ff65493b01ea10fbf1e10c.mp3';

  const MUSIC_PREF_KEY = 'ipsAmbientMusicV58';
  const MUSIC_TIME_KEY = 'ipsAmbientMusicTimeV58';
  const TARGET_VOLUME = 0.32;

  const audio = document.createElement('audio');
  audio.id = 'ips-ambient-audio';
  audio.src = MUSIC_URL;
  audio.loop = true;
  audio.preload = 'auto';
  audio.playsInline = true;
  audio.volume = 0;
  document.body.appendChild(audio);

  // V5.6-style button, restored without the old startup modal.
  const musicControl = document.createElement('button');
  musicControl.className = 'ips-music-toggle';
  musicControl.type = 'button';
  musicControl.setAttribute('aria-label', 'Opreste muzica ambientala');
  musicControl.setAttribute('aria-pressed', 'false');
  musicControl.innerHTML = `
    <span class="ips-music-icon" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </span>
    <span class="ips-music-copy">
      <strong>MUZICA</strong>
      <small>PORNESTE</small>
    </span>
  `;
  document.body.appendChild(musicControl);

  let fadeTimer = null;

  // Default = ON. It stays OFF only if the visitor explicitly turned it off.
  let musicWanted = localStorage.getItem(MUSIC_PREF_KEY) !== 'off';
  let autoplayBlocked = false;

  function setMusicControlState(isPlaying, blocked = false) {
    musicControl.classList.toggle('is-playing', isPlaying);
    musicControl.classList.toggle('needs-action', blocked);
    musicControl.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    musicControl.setAttribute(
      'aria-label',
      isPlaying ? 'Opreste muzica ambientala' : 'Porneste muzica ambientala'
    );

    const status = musicControl.querySelector('small');
    if (status) {
      status.textContent = blocked
        ? 'PORNESTE'
        : (isPlaying ? 'PORNITA' : 'OPRITA');
    }
  }

  function fadeMusicTo(target, duration = 300, after = null) {
    clearInterval(fadeTimer);

    const start = audio.volume;
    const steps = 12;
    let step = 0;

    fadeTimer = setInterval(() => {
      step += 1;
      const value = start + (target - start) * (step / steps);
      audio.volume = Math.max(0, Math.min(1, value));

      if (step >= steps) {
        clearInterval(fadeTimer);
        audio.volume = target;
        if (after) after();
      }
    }, Math.max(12, duration / steps));
  }

  function restoreMusicTime() {
    const saved = Number(sessionStorage.getItem(MUSIC_TIME_KEY));
    if (
      Number.isFinite(saved) &&
      saved > 0 &&
      audio.currentTime < 0.25
    ) {
      try {
        audio.currentTime = saved;
      } catch (_) {}
    }
  }

  async function startMusic({ remember = false, userAction = false } = {}) {
    musicWanted = true;
    if (remember) localStorage.setItem(MUSIC_PREF_KEY, 'on');

    restoreMusicTime();
    audio.preload = 'auto';

    try {
      await audio.play();
      autoplayBlocked = false;
      fadeMusicTo(TARGET_VOLUME, userAction ? 240 : 420);
      setMusicControlState(true, false);
      return true;
    } catch (_) {
      autoplayBlocked = true;
      setMusicControlState(false, true);
      return false;
    }
  }

  function stopMusic({ remember = true } = {}) {
    musicWanted = false;
    autoplayBlocked = false;

    if (remember) localStorage.setItem(MUSIC_PREF_KEY, 'off');

    fadeMusicTo(0, 220, () => audio.pause());
    setMusicControlState(false, false);
  }

  musicControl.addEventListener('click', async () => {
    if (audio.paused) {
      await startMusic({ remember: true, userAction: true });
    } else {
      stopMusic({ remember: true });
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.paused) {
      sessionStorage.setItem(MUSIC_TIME_KEY, String(audio.currentTime));
    }
  });

  window.addEventListener('pagehide', () => {
    if (!audio.paused) {
      sessionStorage.setItem(MUSIC_TIME_KEY, String(audio.currentTime));
    }
  });

  // If autoplay with sound is blocked by the browser, start it on the
  // visitor's first interaction anywhere on the page (without a popup).
  async function unlockMusicOnInteraction(event) {
    if (!musicWanted || !autoplayBlocked || !audio.paused) return;
    if (musicControl.contains(event.target)) return;

    const started = await startMusic({ remember: false, userAction: true });
    if (started) removeUnlockListeners();
  }

  function removeUnlockListeners() {
    document.removeEventListener('pointerdown', unlockMusicOnInteraction, true);
    document.removeEventListener('keydown', unlockMusicOnInteraction, true);
    document.removeEventListener('touchstart', unlockMusicOnInteraction, true);
  }

  document.addEventListener('pointerdown', unlockMusicOnInteraction, true);
  document.addEventListener('keydown', unlockMusicOnInteraction, true);
  document.addEventListener('touchstart', unlockMusicOnInteraction, true);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && musicWanted && audio.paused && !autoplayBlocked) {
      startMusic({ remember: false });
    }
  });

  // Try immediately. Browsers that permit autoplay will start at once.
  // Browsers that block unmuted autoplay will show PORNESTE and begin
  // on the first user interaction instead.
  if (musicWanted) {
    startMusic({ remember: false });
  } else {
    setMusicControlState(false, false);
  }

  initCurrentPage(document);
})();
