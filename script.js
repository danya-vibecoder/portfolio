/* =============================================
   CLOCK — реальное время Тбилиси (Asia/Tbilisi)
   ============================================= */

document.addEventListener("DOMContentLoaded", function () {
  var elMonth = document.querySelector(".clock__month");
  var elDay   = document.querySelector(".clock__day");
  var elTime  = document.querySelector(".clock__time");

  if (!elMonth || !elDay || !elTime) return;

  var tz = "Asia/Tbilisi";

  var fmtMonth = new Intl.DateTimeFormat("en-US", { month: "long",   timeZone: tz });
  var fmtDay   = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: tz });
  var fmtTime  = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23", timeZone: tz
  });

  function tick() {
    var now = new Date();
    elMonth.textContent = fmtMonth.format(now);
    elDay.textContent   = fmtDay.format(now);
    elTime.textContent  = fmtTime.format(now);
  }

  tick();
  setInterval(tick, 1000);
});


/* =============================================
   HOVER VIDEOS
   Воспроизводим видео при наведении, на mouseleave
   ставим паузу и сбрасываем на начало.
   Включается только на устройствах с реальным ховером
   (десктоп с мышью). На тачах — не запускаем.
   ============================================= */

(function () {
  "use strict";

  // Тач-устройства не получают ховер-видео.
  if (!window.matchMedia("(hover: hover)").matches) return;

  // Только видео внутри карточек — hero autoplay, его не трогаем.
  var tiles = document.querySelectorAll(".case .video-tile");

  tiles.forEach(function (tile) {
    var video = tile.querySelector(".video-tile__video");
    if (!video) return;

    // Если у <video> ещё нет источников (плейсхолдер) — не пытаемся играть.
    var hasSource = video.querySelector("source");
    if (!hasSource) return;

    // Триггер по родителю (вся плитка), чтобы зона ховера совпадала с визуалом.
    var trigger = tile.closest(".case__link") || tile;

    trigger.addEventListener("mouseenter", function () {
      var p = video.play();
      if (p && typeof p.catch === "function") {
        // Браузер может вернуть Promise — глушим NotAllowedError на тачах/иос-PWA.
        p.catch(function () {});
      }
    });

    trigger.addEventListener("mouseleave", function () {
      video.pause();
      video.currentTime = 0;
    });
  });
})();
