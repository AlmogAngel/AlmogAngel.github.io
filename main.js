/* ============================================================
   Almog Angel personal site behaviors
   Vanilla, dependency-free, progressive enhancement.
   Every behavior is guarded: the page is fully usable with JS off.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. Mobile nav toggle ---- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;

    function close() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close after picking a destination (mobile)
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    // close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    // close on outside click/tap (mobile)
    document.addEventListener("click", function (e) {
      if (menu.classList.contains("open") && !menu.contains(e.target) && !toggle.contains(e.target)) close();
    });
  }

  /* ---- 2. Rotating highlight across hero interest chips ---- */
  function initChipRotator() {
    var chips = document.querySelectorAll(".hero .chip");
    if (chips.length < 2 || reduceMotion) return;
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      chips[i].classList.remove("is-active");
      i = (i + 1) % chips.length;
      chips[i].classList.add("is-active");
    }, 2200);
  }

  /* ---- 3. Scroll-reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- 4. Active-section nav highlight ---- */
  function initActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-menu a"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return; // ignore any non-anchor links
      var sec = document.getElementById(href.slice(1));
      if (sec) { map[sec.id] = a; sections.push(sec); }
    });
    if (!sections.length) return;

    var ratios = {};
    function setActive(id) {
      links.forEach(function (a) { a.classList.toggle("active", map[id] === a); });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      // At the very bottom, the short last section may not fill the band: force it active.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        setActive(sections[sections.length - 1].id);
        return;
      }
      // Otherwise highlight the most-visible section (not order-dependent).
      var best = null, bestRatio = 0;
      Object.keys(ratios).forEach(function (id) {
        if (ratios[id] > bestRatio) { bestRatio = ratios[id]; best = id; }
      });
      if (best) setActive(best);
    }, { rootMargin: "-20% 0px -35% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    sections.forEach(function (sec) { io.observe(sec); });
  }

  /* ---- 5. Footer year ---- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    initNav();
    initChipRotator();
    initReveal();
    initActiveNav();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
