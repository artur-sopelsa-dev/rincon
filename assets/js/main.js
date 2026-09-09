// -------------------- Rail: mobile menu toggle --------------------
(function () {
  var rail = document.getElementById("rail");
  var toggle = document.getElementById("nav-toggle");
  var links = document.getElementById("nav-links");
  if (!rail || !toggle || !links) return;

  toggle.addEventListener("click", function () {
    var isOpen = rail.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      rail.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// -------------------- Catalog: pinned scroll-through product switcher --------------------
(function () {
  var catalog = document.getElementById("catalog");
  if (!catalog) return;

  var products = Array.prototype.slice.call(
    catalog.querySelectorAll(".catalog-product")
  );
  var dots = Array.prototype.slice.call(catalog.querySelectorAll(".catalog__dot"));
  var count = products.length;
  var mq = window.matchMedia("(min-width: 921px)");
  var rafId = null;
  var activeIndex = 0;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    products.forEach(function (product, i) {
      product.classList.toggle("is-active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function onScroll() {
    rafId = null;
    var rect = catalog.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return;
    var progress = Math.min(Math.max(-rect.top / total, 0), 1);
    var index = Math.min(Math.floor(progress * count), count - 1);
    setActive(index);
  }

  function requestUpdate() {
    if (!rafId) rafId = requestAnimationFrame(onScroll);
  }

  function enable() {
    catalog.classList.add("is-active-js");
    window.addEventListener("scroll", requestUpdate, { passive: true });
    requestUpdate();
  }

  function disable() {
    catalog.classList.remove("is-active-js");
    window.removeEventListener("scroll", requestUpdate);
  }

  function sync() {
    if (mq.matches) {
      enable();
    } else {
      disable();
    }
  }

  sync();
  mq.addEventListener("change", sync);
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
