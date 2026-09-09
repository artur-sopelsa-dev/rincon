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
