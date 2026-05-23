/* Single-page site — minimal client behavior.
   Hero video plays via the <video autoplay muted loop playsinline> attributes.
   Mobile plus button is intentionally static (no menu logic). */

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
