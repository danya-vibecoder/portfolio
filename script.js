/* Single-page site — minimal client behavior.
   Hero video plays via the <video autoplay muted loop playsinline> attributes.
   Mobile plus button is intentionally static (no menu logic). */


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
