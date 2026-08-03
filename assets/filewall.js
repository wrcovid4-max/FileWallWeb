(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── Theme ──────────────────────────────────────────────────────────────
     Dark-first: dark is the default regardless of OS preference. The toggle
     writes an explicit choice that survives navigation between pages. */
  var THEME_KEY = 'filewall-theme';

  function setTheme(name) {
    if (name === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem(THEME_KEY, name); } catch (e) {}
    $$('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', name === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    });
  }

  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  });
  setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  /* ── Mobile navigation drawer ───────────────────────────────────────── */
  var drawer = $('#navDrawer');
  var navToggle = $('[data-nav-toggle]');

  if (drawer && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        drawer.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Site search ────────────────────────────────────────────────────────
     A static index — there is no server to query, which is rather the point
     of the product. Entries are page sections, matched on title + keywords. */
  var INDEX = [
    ['Your own private cloud, on your own phone', 'What FileWall is and who it is for.', 'index.html', 'Overview', 'hero vault encrypted android'],
    ['The keys never leave your phone', 'Generated in the Android Keystore, exportable by nobody.', 'index.html#how', 'Overview', 'keystore hardware key'],
    ['Even the backup is unreadable', 'Encrypted with a passphrase before it is uploaded.', 'index.html#how', 'Overview', 'backup google drive passphrase'],
    ['Nothing on disk says what anything is', 'Stored files have no names and no extensions.', 'index.html#how', 'Overview', 'filenames metadata database'],
    ['The vault', 'Import, sort, search, colour-coded folders, export.', 'index.html#features', 'Features', 'import picker sort search folders export'],
    ['The hidden archive', 'A second vault behind a passcode, with biometric unlock.', 'index.html#features', 'Features', 'hidden passcode pin fingerprint face lockout auto-lock'],
    ['Viewing', 'Pinch-to-zoom photos and video played from the encrypted file.', 'index.html#features', 'Features', 'video scrub zoom documents'],
    ['Privacy controls', 'Screenshots blocked by default; media sync can be switched off.', 'index.html#features', 'Features', 'screenshot recording app switcher theme'],
    ['Backup', 'One passphrase-protected file, or a daily Wi-Fi schedule to Drive.', 'index.html#features', 'Features', 'backup restore drive schedule'],
    ['It is on your wrist, not in your pocket', 'The Wear OS companion, and why hidden files never reach it.', 'index.html#wear', 'Wear OS', 'watch wear os companion'],
    ['How the encryption works', 'AES-256, encrypt-then-MAC, PBKDF2 and the file format.', 'index.html#encryption', 'Security', 'aes ctr hmac pbkdf2 gcm format iv mac'],
    ['What we do not do', 'No account, no server, no trackers, no subscription.', 'index.html#never', 'Overview', 'ads analytics telemetry account server'],
    ['Honest limits', 'What FileWall cannot do for you.', 'index.html#limits', 'Overview', 'audit limits android only passphrase oauth'],
    ['Screens', 'The real app screens, drawn rather than photographed.', 'screens.html', 'Screens', 'vault hidden security backup gallery screenshots'],
    ['Platforms', 'Where FileWall runs today and what is in development.', 'platforms.html', 'Platforms', 'ios watchos visionos xr carplay android auto web'],
    ['News', 'Release notes and product updates.', 'news.html', 'News', 'changelog release updates announcements'],
    ['Support and FAQs', 'Searchable answers, plus how to reach a person.', 'support.html', 'Support', 'help faq contact question'],
    ['Download', 'Get the Android app, and see what is not ready yet.', 'download.html', 'Download', 'install apk google play get'],
    ['Can FileWall staff see my files?', 'No, and not because we promise not to look.', 'support.html', 'Support', 'staff privacy read server'],
    ['What happens if I lose my phone?', 'The files stay encrypted; the keys do not travel.', 'support.html', 'Support', 'lost stolen phone recovery'],
    ['Is it really free?', 'Free and open source, with nothing to buy.', 'support.html', 'Support', 'price cost subscription free'],
    ['Does it work offline?', 'Everything except Drive backup runs on-device.', 'support.html', 'Support', 'offline airplane network']
  ];

  var overlay = $('#searchOverlay');

  if (overlay) {
    var input   = $('#searchInput', overlay);
    var results = $('#searchResults', overlay);
    var empty   = $('#searchEmpty', overlay);
    var lastFocus = null;

    function render(q) {
      var query = q.trim().toLowerCase();
      var hits = INDEX;
      if (query) {
        var terms = query.split(/\s+/);
        hits = INDEX.filter(function (row) {
          var hay = (row[0] + ' ' + row[1] + ' ' + row[3] + ' ' + row[4]).toLowerCase();
          return terms.every(function (t) { return hay.indexOf(t) !== -1; });
        });
      }
      results.innerHTML = hits.slice(0, 12).map(function (r) {
        return '<li><a href="' + r[2] + '"><b>' + r[0] + '</b><small>' + r[1] +
               '</small><span class="where">' + r[3] + '</span></a></li>';
      }).join('');
      empty.hidden = hits.length > 0;
    }

    function openSearch() {
      lastFocus = document.activeElement;
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      input.value = '';
      render('');
      input.focus();
    }

    function closeSearch() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', openSearch); });
    input.addEventListener('input', function () { render(input.value); });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('[data-search-close]')) closeSearch();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) { closeSearch(); return; }
      if (overlay.hidden && e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); openSearch();
      }
    });

    /* Keep tabbing inside the dialog while it is open. */
    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button, input', overlay).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ── Updates carousel ─────────────────────────────────────────────────
     A CSS marquee, not a scroller: the track holds the cards twice and
     translates by exactly -50%, so the loop is seamless with no pause at
     the seam. JS only handles pausing and the flip interaction. */
  $$('[data-marquee]').forEach(function (carousel) {
    var track = $('.marquee-track', carousel);
    if (!track) return;

    /* Duplicate the set so the -50% translation lands on an identical frame.
       The copy is decorative: hidden from AT and skipped by the tab order. */
    var originals = $$('.up-card', track);
    originals.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      clone.dataset.clone = 'true';
      track.appendChild(clone);
    });

    var paused = false;
    function setPaused(v) {
      paused = v;
      carousel.classList.toggle('is-paused', v);
      $$('[data-carousel-pause]').forEach(function (b) {
        b.setAttribute('aria-pressed', v ? 'true' : 'false');
        b.setAttribute('aria-label', v ? 'Resume the updates carousel' : 'Pause the updates carousel');
      });
    }

    $$('[data-carousel-pause]').forEach(function (b) {
      b.addEventListener('click', function () { setPaused(!paused); });
    });

    /* Hold still while someone is reading or interacting. */
    carousel.addEventListener('mouseenter', function () { carousel.classList.add('is-paused'); });
    carousel.addEventListener('mouseleave', function () { if (!paused) carousel.classList.remove('is-paused'); });
    carousel.addEventListener('focusin',  function () { carousel.classList.add('is-paused'); });
    carousel.addEventListener('focusout', function () { if (!paused) carousel.classList.remove('is-paused'); });

    /* Flip a card to reveal the longer note on its back. */
    track.addEventListener('click', function (e) {
      var card = e.target.closest('.up-card');
      if (!card) return;
      var open = card.getAttribute('aria-expanded') === 'true';
      card.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (!open) carousel.classList.add('is-paused');
      else if (!paused) carousel.classList.remove('is-paused');
    });

    if (reduced.matches) setPaused(true);
  });

  /* ── Filter chips + in-page search (support, news) ───────────────────── */
  $$('[data-filter-scope]').forEach(function (scope) {
    var chips = $$('.chip', scope);
    var field = $('input[data-filter-search]', scope);
    var items = $$('[data-cat]', scope);
    var groups = $$('[data-group]', scope);
    var none = $('[data-no-results]', scope);

    function apply() {
      var active = (chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; })[0] || {});
      var cat = active.dataset ? active.dataset.chip : 'all';
      var q = field ? field.value.trim().toLowerCase() : '';
      var shown = 0;

      items.forEach(function (it) {
        var okCat = cat === 'all' || it.dataset.cat === cat;
        var okTxt = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
        var show = okCat && okTxt;
        it.hidden = !show;
        if (show) shown++;
      });

      /* Hide a category heading once everything under it is filtered out. */
      groups.forEach(function (g) {
        g.hidden = !$$('[data-cat]', g).some(function (it) { return !it.hidden; });
      });

      if (none) none.hidden = shown > 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        apply();
      });
    });
    if (field) field.addEventListener('input', apply);
    apply();
  });

  /* ── FAQ accordion ──────────────────────────────────────────────────── */
  var questions = $$('.faq-q');

  function setOpen(btn, open) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('data-open', open ? 'true' : 'false');
    /* Keep collapsed answers out of the tab order and the accessibility tree. */
    if (open) panel.removeAttribute('inert');
    else panel.setAttribute('inert', '');
  }

  questions.forEach(function (btn, i) {
    setOpen(btn, btn.getAttribute('aria-expanded') === 'true');

    btn.addEventListener('click', function () {
      setOpen(btn, btn.getAttribute('aria-expanded') !== 'true');
    });

    /* Arrow / Home / End move between headers, per the disclosure pattern. */
    btn.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown') next = questions[(i + 1) % questions.length];
      else if (e.key === 'ArrowUp') next = questions[(i - 1 + questions.length) % questions.length];
      else if (e.key === 'Home') next = questions[0];
      else if (e.key === 'End') next = questions[questions.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  });

  /* ── Scroll reveals ─────────────────────────────────────────────────── */
  var revealables = $$('.reveal');

  function showAll() { revealables.forEach(function (el) { el.classList.add('is-in'); }); }

  if (reduced.matches || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + 'ms';
      io.observe(el);
    });

    if (typeof reduced.addEventListener === 'function') {
      reduced.addEventListener('change', function (e) { if (e.matches) showAll(); });
    }
  }

  /* ── Header hairline once scrolled ──────────────────────────────────── */
  var header = $('#siteHeader');
  var ticking = false;

  function syncHeader() {
    header.classList.toggle('is-stuck', window.scrollY > 8);
    ticking = false;
  }

  if (header) {
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncHeader);
    }, { passive: true });
    syncHeader();
  }
})();
