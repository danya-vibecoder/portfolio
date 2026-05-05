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
