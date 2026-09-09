(function () {
  var frame = document.getElementById("frame");
  if (!frame) return;

  var layers = Array.prototype.slice.call(frame.querySelectorAll(".layer"));
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (prefersReducedMotion.matches) return;

  var rafId = null;
  var targetX = 0;
  var targetY = 0;

  function applyParallax() {
    rafId = null;
    layers.forEach(function (layer) {
      var depth = parseFloat(layer.dataset.depth) || 0;
      var moveX = targetX * depth * 26;
      var moveY = targetY * depth * 26;
      layer.style.setProperty("--px", moveX + "px");
      layer.style.setProperty("--py", moveY + "px");
    });
  }

  function onPointerMove(event) {
    var rect = frame.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    targetX = (event.clientX - cx) / (rect.width / 2);
    targetY = (event.clientY - cy) / (rect.height / 2);
    targetX = Math.max(-1, Math.min(1, targetX));
    targetY = Math.max(-1, Math.min(1, targetY));
    if (!rafId) rafId = requestAnimationFrame(applyParallax);
  }

  function onPointerLeave() {
    targetX = 0;
    targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(applyParallax);
  }

  var hero = document.querySelector(".hero");
  hero.addEventListener("mousemove", onPointerMove);
  hero.addEventListener("mouseleave", onPointerLeave);
})();

// -------------------- Nav: scrolled background + mobile toggle --------------------
(function () {
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
})();

// -------------------- Contact form (no backend: UI-only confirmation) --------------------
(function () {
  var form = document.getElementById("contact-form");
  var feedback = document.getElementById("contact-feedback");
  if (!form || !feedback) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    feedback.textContent =
      "Mensagem recebida — retornaremos em até dois dias úteis.";
    form.reset();
  });
})();

// -------------------- Footer year --------------------
(function () {
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
