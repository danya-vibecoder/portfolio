/* Single-page site — minimal client behavior.
   Hero video plays via the <video autoplay muted loop playsinline> attributes.
   Mobile plus button is intentionally static (no menu logic). */


/* Preloader — fixed-duration counter (0→100) with blur reveal on the digits,
   curtain slides up on complete. Independent of asset loading so the timing
   stays predictable on slow connections. Other IIFEs that animate above
   the fold wait for the `preloader:done` event. */
(function () {
  "use strict";

  var preloader = document.getElementById("preloader");
  var numEl = document.getElementById("preloader-num");
  if (!preloader || !numEl) {
    document.documentElement.classList.remove("preloader-active");
    document.dispatchEvent(new Event("preloader:done"));
    return;
  }

  var body = document.body;
  var html = document.documentElement;
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  html.classList.add("preloader-active");
  var prevHtmlOverflow = html.style.overflow;
  var prevBodyOverflow = body.style.overflow;
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  // Kick off the blur-in of the counter after one frame so the transition
  // actually plays (rather than being applied before the initial paint).
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { preloader.classList.add("is-ready"); });
  });

  var DURATION = 2000;
  var start = null;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function done() {
    document.dispatchEvent(new Event("preloader:done"));

    if (prefersReducedMotion) {
      preloader.classList.add("is-leaving");
      setTimeout(cleanup, 320);
      return;
    }

    preloader.classList.add("is-leaving");
    setTimeout(cleanup, 780);
  }

  function cleanup() {
    html.classList.remove("preloader-active");
    html.style.overflow = prevHtmlOverflow;
    body.style.overflow = prevBodyOverflow;
    if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
  }

  function step(ts) {
    if (start === null) start = ts;
    var t = Math.min(1, (ts - start) / DURATION);
    var val = Math.floor(easeOutCubic(t) * 100);
    numEl.textContent = val;
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      numEl.textContent = "100";
      done();
    }
  }

  requestAnimationFrame(step);
})();


(function () {
  "use strict";

  var experience = document.getElementById("experience");
  var panel = document.querySelector(".sidebar__panel");
  var projectsLink = document.querySelector('.sidebar__nav a[href="#top"]');
  var experienceLink = document.querySelector('.sidebar__nav a[href="#experience"]');
  var mProjectsLink = document.querySelector('.mobile-menu a[href="#top"]');
  var mExperienceLink = document.querySelector('.mobile-menu a[href="#experience"]');
  if (!experience) return;

  function setActive(which) {
    var isExp = which === "experience";
    if (experienceLink) {
      experienceLink.classList.toggle("nav-link--active", isExp);
      experienceLink.classList.toggle("nav-link--muted", !isExp);
    }
    if (projectsLink) {
      projectsLink.classList.toggle("nav-link--active", !isExp);
      projectsLink.classList.toggle("nav-link--muted", isExp);
    }
    if (panel) panel.dataset.active = isExp ? "experience" : "projects";
    if (mExperienceLink) {
      mExperienceLink.classList.toggle("mobile-menu__link--active", isExp);
      mExperienceLink.classList.toggle("mobile-menu__link--muted", !isExp);
    }
    if (mProjectsLink) {
      mProjectsLink.classList.toggle("mobile-menu__link--active", !isExp);
      mProjectsLink.classList.toggle("mobile-menu__link--muted", isExp);
    }
  }

  // Initial state — Projects active until observer says otherwise.
  setActive("projects");

  if (!("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        setActive("experience");
      } else {
        setActive("projects");
      }
    });
  }, { threshold: [0.3] });

  observer.observe(experience);
})();


/* Mobile menu — open/close + scroll lock + stagger animations. */
(function () {
  "use strict";

  var body = document.body;
  var btn = document.querySelector(".mobile-header__btn");
  var menu = document.getElementById("mobile-menu");
  var backdrop = document.querySelector(".mobile-menu-backdrop");
  if (!btn || !menu) return;

  var savedScrollY = 0;
  var isAnimating = false;

  function lockScroll() {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    body.style.position = "fixed";
    body.style.top = "-" + savedScrollY + "px";
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  }

  function unlockScroll() {
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    window.scrollTo(0, savedScrollY);
  }

  function openMenu() {
    if (isAnimating || body.classList.contains("menu-open")) return;
    isAnimating = true;
    lockScroll();
    body.classList.remove("menu-closing");
    body.classList.add("menu-open");
    btn.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    setTimeout(function () { isAnimating = false; }, 800);
  }

  function closeMenu() {
    if (isAnimating || !body.classList.contains("menu-open")) return;
    isAnimating = true;
    body.classList.add("menu-closing");
    body.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");

    setTimeout(function () {
      body.classList.remove("menu-closing");
      unlockScroll();
      isAnimating = false;
    }, 800);
  }

  btn.addEventListener("click", function () {
    if (body.classList.contains("menu-open")) closeMenu();
    else openMenu();
  });

  if (backdrop) backdrop.addEventListener("click", closeMenu);

  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (!body.classList.contains("menu-open")) return;
      var href = a.getAttribute("href");
      var isAnchor = href && href.charAt(0) === "#";

      if (isAnchor) {
        // Scroll lock makes body fixed at top: -savedScrollY. If we leave
        // savedScrollY pointing at the spot the user was at when the menu
        // opened, unlockScroll snaps back there before the anchor scroll
        // can run. Override savedScrollY with the target position so the
        // unlock lands exactly where the user wanted to go.
        e.preventDefault();
        var targetY = 0;
        if (href !== "#top" && href !== "#") {
          var t = document.querySelector(href);
          if (t) {
            // getBoundingClientRect is relative to the fixed viewport (top: -savedScrollY).
            // Add savedScrollY back to recover the document-absolute Y.
            targetY = Math.max(0, t.getBoundingClientRect().top + savedScrollY);
          }
        }
        savedScrollY = targetY;
        closeMenu();
      } else {
        closeMenu();
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("menu-open")) closeMenu();
  });
})();


/* Custom cursor follower — white dot trailing the native pointer.
   Disabled on touch devices via CSS + JS guard. */
(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
  if ("ontouchstart" in window && !window.matchMedia("(pointer: fine)").matches) return;

  var cursor = document.querySelector(".cursor");
  var label = cursor && cursor.querySelector(".cursor__label");
  if (!cursor) return;

  var tx = 0, ty = 0, cx = 0, cy = 0;
  var primed = false;
  var rafId = null;
  var EASE = 0.18;

  function tick() {
    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;
    cursor.style.transform = "translate3d(" + cx + "px, " + cy + "px, 0)";
    if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function onMove(e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!primed) {
      cx = tx; cy = ty;
      cursor.style.transform = "translate3d(" + cx + "px, " + cy + "px, 0)";
      primed = true;
      cursor.classList.add("is-shown");
    }
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function onEnter() { if (primed) cursor.classList.add("is-shown"); }
  function onLeave() { cursor.classList.remove("is-shown"); }
  function onDown() { cursor.classList.add("is-pressed"); }
  function onUp() { cursor.classList.remove("is-pressed"); }

  function onOver(e) {
    var t = e.target;
    var textEl = t.closest ? t.closest("[data-cursor-text]") : null;
    if (textEl) {
      cursor.classList.remove("is-hover-link");
      cursor.classList.add("is-hover-text");
      if (label) label.textContent = textEl.getAttribute("data-cursor-text");
      return;
    }
    var linkEl = t.closest ? t.closest("a, button") : null;
    if (linkEl) {
      cursor.classList.remove("is-hover-text");
      cursor.classList.add("is-hover-link");
      if (label) label.textContent = "";
      return;
    }
    cursor.classList.remove("is-hover-link", "is-hover-text");
    if (label) label.textContent = "";
  }

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseover", onOver);
  document.addEventListener("mousedown", onDown);
  document.addEventListener("mouseup", onUp);
  document.documentElement.addEventListener("mouseleave", onLeave);
  document.documentElement.addEventListener("mouseenter", onEnter);
})();


/* Scroll-reveal — split target headlines into words, stagger blur→sharp
   on viewport entry. Fires once per element. */
(function () {
  "use strict";

  var headings = document.querySelectorAll(
    ".hero__text, .case__title, .experience__title"
  );
  if (!headings.length) return;

  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Split each heading into <span class="word">; preserve runs of non-regular-space
  // characters so `&nbsp;`-glued pairs (e.g. "how we") stay one span.
  headings.forEach(function (el) {
    var text = el.textContent;
    var parts = text.match(/[^ ]+|[ ]+/g) || [];
    el.textContent = "";
    el.classList.add("reveal");

    var wordIndex = 0;
    parts.forEach(function (part) {
      if (part.charAt(0) === " ") {
        el.appendChild(document.createTextNode(part));
      } else {
        var span = document.createElement("span");
        span.className = "word";
        span.style.setProperty("--i", wordIndex);
        span.textContent = part;
        el.appendChild(span);
        wordIndex++;
      }
    });
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    headings.forEach(function (el) { el.classList.add("is-revealed"); });
    return;
  }

  function startObserver() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    headings.forEach(function (el) { observer.observe(el); });
  }

  // Wait for the preloader to leave before observing, otherwise the hero
  // headline's reveal would play behind the black curtain.
  if (document.documentElement.classList.contains("preloader-active")) {
    document.addEventListener("preloader:done", startObserver, { once: true });
  } else {
    startObserver();
  }
})();


/* Banxe cards 3D float — animate only while in viewport.
   Mobile + prefers-reduced-motion are disabled via CSS. */
(function () {
  "use strict";

  var cards = document.querySelector(".cards-block--banxe");
  if (!cards || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      cards.classList.toggle("is-animating", entry.isIntersecting);
    });
  }, { threshold: 0.1 });

  observer.observe(cards);
})();

/* Lenis smooth scroll — desktop only. Deferred until the preloader leaves
   so its body-overflow lock doesn't interfere with Lenis's scroll proxy. */
(function() {
  "use strict";

  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

  function initLenis() {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  if (document.documentElement.classList.contains("preloader-active")) {
    document.addEventListener("preloader:done", initLenis, { once: true });
  } else {
    initLenis();
  }
})();
