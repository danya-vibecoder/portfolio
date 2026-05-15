/* =============================================
   CLOCK — реальное время Тбилиси (Asia/Tbilisi)
   ============================================= */

document.addEventListener("DOMContentLoaded", function () {
  var monthEls = document.querySelectorAll(".clock__month");
  var dayEls   = document.querySelectorAll(".clock__day");
  var timeEls  = document.querySelectorAll(".clock__time");

  if (!monthEls.length) return;

  var tz = "Asia/Tbilisi";

  var fmtMonth = new Intl.DateTimeFormat("en-US", { month: "long",   timeZone: tz });
  var fmtDay   = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: tz });
  var fmtTime  = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23", timeZone: tz
  });

  function tick() {
    var now = new Date();
    var m = fmtMonth.format(now);
    var d = fmtDay.format(now);
    var t = fmtTime.format(now);
    monthEls.forEach(function (el) { el.textContent = m; });
    dayEls.forEach(function (el)   { el.textContent = d; });
    timeEls.forEach(function (el)  { el.textContent = t; });
  }

  tick();
  setInterval(tick, 1000);
});


/* =============================================
   MOBILE / TABLET MENU
   ============================================= */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var menu = document.getElementById("menu");
  var openBtn = document.querySelector(".mobile-header__menu");
  if (!menu || !openBtn) return;

  var closeBtn = menu.querySelector(".menu__close");
  var overlay = menu.querySelector(".menu__overlay");
  var desktopMq = window.matchMedia("(min-width: 1024px)");

  function setOpen(isOpen) {
    if (isOpen && desktopMq.matches) return;
    menu.classList.toggle("menu--open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    openBtn.setAttribute("aria-expanded", String(isOpen));
  }

  openBtn.addEventListener("click", function () {
    setOpen(!menu.classList.contains("menu--open"));
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () { setOpen(false); });
  }

  if (overlay) {
    overlay.addEventListener("click", function () { setOpen(false); });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("menu--open")) {
      setOpen(false);
    }
  });

  function handleViewport(e) {
    if (e.matches) setOpen(false);
  }
  if (desktopMq.addEventListener) desktopMq.addEventListener("change", handleViewport);
  else if (desktopMq.addListener) desktopMq.addListener(handleViewport);
});


/* =============================================
   LAZY LOAD VIDEOS — preload sources when card enters viewport
   ============================================= */

(function () {
  "use strict";

  var medias = document.querySelectorAll(".case__media");
  if (!medias.length) return;

  function loadVideo(video) {
    var sources = video.querySelectorAll("source[data-src]");
    if (!sources.length) return;
    sources.forEach(function (s) {
      if (!s.src) s.src = s.dataset.src;
    });
    video.load();
  }

  if (!("IntersectionObserver" in window)) {
    medias.forEach(function (m) {
      var v = m.querySelector(".case__video");
      if (v) loadVideo(v);
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var video = entry.target.querySelector(".case__video");
      if (video) loadVideo(video);
      obs.unobserve(entry.target);
    });
  }, {
    threshold: 0.3,
    rootMargin: "0px 0px -20% 0px"
  });

  medias.forEach(function (m) {
    if (m.querySelector(".case__video")) observer.observe(m);
  });
})();


/* =============================================
   PROGRESSIVE MEDIA — fade poster → video, play once, hold last frame
   ============================================= */

(function () {
  "use strict";

  var videos = document.querySelectorAll(".case__video");

  function activate(video) {
    var media = video.parentElement;
    if (media) media.classList.add("is-loaded");
    var p = video.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
  }

  videos.forEach(function (video) {
    if (!video.parentElement) return;

    if (video.readyState >= 2) {
      activate(video);
    } else {
      video.addEventListener("loadeddata", function () { activate(video); });
    }

    // On finish: do nothing — keep last frame visible, never reset to 0.
    video.addEventListener("ended", function () {});
  });
})();


/* =============================================
   CUSTOM HOVER CURSOR — follows mouse over project cards
   Activates only on hover-capable devices ≥1024px wide.
   ============================================= */

(function () {
  "use strict";

  var mq = window.matchMedia("(hover: hover) and (min-width: 1024px)");
  var cursor = document.querySelector(".hover-cursor");
  var targets = document.querySelectorAll(".case__link[data-cursor]");
  if (!cursor || !targets.length) return;

  // Interpolated position state
  var targetX = 0, targetY = 0;
  var currentX = 0, currentY = 0;
  var primed = false;   // becomes true after first mousemove so we don't snap from 0,0
  var rafId = null;

  // Smoothing factor (0..1). Higher = snappier, lower = more lag.
  var EASE = 0.18;

  function onMove(e) {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!primed) {
      // Place the cursor at the pointer for the first frame to avoid a long trail-in.
      currentX = targetX;
      currentY = targetY;
      primed = true;
    }
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    rafId = null;
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;
    cursor.style.transform =
      "translate3d(" + currentX + "px, " + currentY + "px, 0)";

    // Keep animating until we're close enough to settle
    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function show(variant) {
    cursor.setAttribute("data-variant", variant);
    cursor.classList.add("is-visible");
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function hide() {
    cursor.classList.remove("is-visible");
  }

  function bind() {
    targets.forEach(function (el) {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", hide);
    });
    document.addEventListener("mousemove", onMove);
  }

  function unbind() {
    targets.forEach(function (el) {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", hide);
    });
    document.removeEventListener("mousemove", onMove);
    hide();
  }

  function onEnter(e) {
    var variant = e.currentTarget.getAttribute("data-cursor");
    if (variant) show(variant);
  }

  function sync(e) {
    if (e.matches) bind();
    else unbind();
  }

  if (mq.matches) bind();
  if (mq.addEventListener) mq.addEventListener("change", sync);
  else if (mq.addListener) mq.addListener(sync);
})();
