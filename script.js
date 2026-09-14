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
     BACKGROUND MUSIC - V5.10
     Default ON. We first try audible autoplay. If the browser blocks it,
     the track starts muted immediately and is unmuted automatically on the
     visitor's first interaction anywhere on the page.
     ============================================================ */
  const MUSIC_URL =
    'https://audio.soundbreak.ai/980d5807ad05d9ab8f6e91f6b38a5f9b/b288dda860ff65493b01ea10fbf1e10c.mp3';

  const MUSIC_TIME_KEY = 'ipsAmbientMusicTimeV510';
  const TARGET_VOLUME = 0.32;

  const audio = document.createElement('audio');
  audio.id = 'ips-ambient-audio';
  audio.src = MUSIC_URL;
  audio.loop = true;
  audio.preload = 'auto';
  audio.playsInline = true;
  audio.autoplay = true;
  audio.volume = TARGET_VOLUME;
  document.body.appendChild(audio);

  const musicControl = document.createElement('button');
  musicControl.className = 'ips-music-toggle';
  musicControl.type = 'button';
  musicControl.setAttribute('aria-label', 'Opreste muzica ambientala');
  musicControl.setAttribute('aria-pressed', 'true');
  musicControl.innerHTML = `
    <span class="ips-music-icon" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </span>
    <span class="ips-music-copy">
      <strong>MUZICA</strong>
      <small>PORNITA</small>
    </span>
  `;
  document.body.appendChild(musicControl);

  let musicWanted = true;
  let waitingForInteraction = false;
  let fadeTimer = null;

  function setMusicControlState(isPlaying, waiting = false) {
    musicControl.classList.toggle('is-playing', isPlaying);
    musicControl.classList.toggle('needs-action', waiting);
    musicControl.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    musicControl.setAttribute(
      'aria-label',
      isPlaying ? 'Opreste muzica ambientala' : 'Porneste muzica ambientala'
    );

    const status = musicControl.querySelector('small');
    if (status) {
      status.textContent = isPlaying ? 'PORNITA' : 'OPRITA';
    }
  }

  function fadeTo(target, duration = 220, after = null) {
    clearInterval(fadeTimer);

    const start = audio.volume;
    const steps = 10;
    let step = 0;

    fadeTimer = setInterval(() => {
      step += 1;
      audio.volume = Math.max(
        0,
        Math.min(1, start + (target - start) * (step / steps))
      );

      if (step >= steps) {
        clearInterval(fadeTimer);
        audio.volume = target;
        if (after) after();
      }
    }, Math.max(12, duration / steps));
  }

  function restoreMusicTime() {
    const saved = Number(sessionStorage.getItem(MUSIC_TIME_KEY));
    if (Number.isFinite(saved) && saved > 0 && audio.currentTime < 0.25) {
      try {
        audio.currentTime = saved;
      } catch (_) {}
    }
  }

  async function tryAudibleAutoplay() {
    if (!musicWanted) return false;

    restoreMusicTime();
    audio.muted = false;
    audio.volume = TARGET_VOLUME;

    try {
      await audio.play();
      waitingForInteraction = false;
      setMusicControlState(true, false);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function startMutedFallback() {
    if (!musicWanted) return;

    restoreMusicTime();
    audio.muted = true;
    audio.volume = TARGET_VOLUME;

    try {
      await audio.play();
      waitingForInteraction = true;
      // The track is already advancing silently. The first interaction
      // simply unmutes it, avoiding a delayed start or restart.
      setMusicControlState(true, true);
    } catch (_) {
      waitingForInteraction = true;
      setMusicControlState(false, true);
    }
  }

  async function startMusicFromUserAction() {
    if (!musicWanted) return;

    restoreMusicTime();

    try {
      audio.muted = false;
      audio.volume = TARGET_VOLUME;

      if (audio.paused) {
        await audio.play();
      }

      waitingForInteraction = false;
      setMusicControlState(true, false);
      removeUnlockListeners();
    } catch (_) {
      setMusicControlState(false, true);
    }
  }

  function stopMusic() {
    musicWanted = false;
    waitingForInteraction = false;
    removeUnlockListeners();

    fadeTo(0, 180, () => {
      audio.pause();
      audio.muted = false;
      audio.volume = TARGET_VOLUME;
    });

    setMusicControlState(false, false);
  }

  async function toggleMusic() {
    if (!musicWanted || audio.paused || audio.muted) {
      musicWanted = true;
      addUnlockListeners();
      await startMusicFromUserAction();
    } else {
      stopMusic();
    }
  }

  musicControl.addEventListener('click', event => {
    event.stopPropagation();
    toggleMusic();
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

  async function unlockOnFirstInteraction(event) {
    if (!musicWanted || !waitingForInteraction) return;
    if (musicControl.contains(event.target)) return;

    // This runs in capture phase and therefore fires before internal
    // navigation handlers. The visitor doesn't need to press the music button.
    await startMusicFromUserAction();
  }

  function addUnlockListeners() {
    document.addEventListener('pointerdown', unlockOnFirstInteraction, true);
    document.addEventListener('touchstart', unlockOnFirstInteraction, true);
    document.addEventListener('keydown', unlockOnFirstInteraction, true);
    document.addEventListener('click', unlockOnFirstInteraction, true);
  }

  function removeUnlockListeners() {
    document.removeEventListener('pointerdown', unlockOnFirstInteraction, true);
    document.removeEventListener('touchstart', unlockOnFirstInteraction, true);
    document.removeEventListener('keydown', unlockOnFirstInteraction, true);
    document.removeEventListener('click', unlockOnFirstInteraction, true);
  }

  addUnlockListeners();

  // Always ON by default on a fresh load.
  // 1) Try normal audible autoplay.
  // 2) If Chrome/Firefox/Safari blocks it, start muted immediately.
  // 3) First interaction anywhere automatically unmutes it.
  (async () => {
    const started = await tryAudibleAutoplay();
    if (!started) {
      await startMutedFallback();
    }
  })();

  initCurrentPage(document);
})();
