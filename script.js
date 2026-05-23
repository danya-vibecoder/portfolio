/* Single-page site — minimal client behavior.
   Hero video plays via the <video autoplay muted loop playsinline> attributes.
   Mobile plus button is intentionally static (no menu logic). */


/* Hard-block pinch/double-tap zoom on iOS Safari.
   passive: false is required for preventDefault to take effect. */
(function () {
  "use strict";

  ["gesturestart", "gesturechange", "gestureend"].forEach(function (evt) {
    document.addEventListener(evt, function (e) { e.preventDefault(); }, { passive: false });
  });

  document.addEventListener("touchstart", function (e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  document.addEventListener("touchmove", function (e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  var lastTouchEnd = 0;
  document.addEventListener("touchend", function (e) {
    var now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  window.addEventListener("resize", function () {
    if (window.visualViewport && window.visualViewport.scale !== 1) {
      document.documentElement.style.zoom = 1;
    }
  });
})();

(function () {
  "use strict";

  var experience = document.getElementById("experience");
  var panel = document.querySelector(".sidebar__panel");
  var projectsLink = document.querySelector('.sidebar__nav a[href="#top"]');
  var experienceLink = document.querySelector('.sidebar__nav a[href="#experience"]');
  if (!experience || !panel || !projectsLink || !experienceLink) return;

  function setActive(which) {
    var isExp = which === "experience";
    experienceLink.classList.toggle("nav-link--active", isExp);
    experienceLink.classList.toggle("nav-link--muted", !isExp);
    projectsLink.classList.toggle("nav-link--active", !isExp);
    projectsLink.classList.toggle("nav-link--muted", isExp);
    panel.dataset.active = isExp ? "experience" : "projects";
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
