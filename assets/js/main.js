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

// -------------------- Cart: product data, storage, WhatsApp checkout --------------------
// TODO: substituir pelo número real da loja, com DDI+DDD, só dígitos (ex: 5511999999999)
var WHATSAPP_NUMBER = "5500000000000";

// TODO: preços ilustrativos — confirmar valores reais antes de publicar
var PRODUCTS = {
  "don-melchor": {
    name: "Don Melchor",
    type: "Cabernet Sauvignon · Chile",
    price: 549.9,
  },
  "finca-ambrosia": {
    name: "Finca Ambrosía",
    type: "Malbec · Mendoza, Argentina",
    price: 189.9,
  },
  anaia: {
    name: "Anaia",
    type: "Malbec · Agrelo, Argentina",
    price: 149.9,
  },
};

var RinconCart = (function () {
  var STORAGE_KEY = "rincon-cart";

  function formatPrice(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function read() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function write(cart) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* localStorage unavailable (private mode, etc.) — cart just won't persist */
    }
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  function add(id, qty) {
    if (!PRODUCTS[id]) return;
    var cart = read();
    cart[id] = (cart[id] || 0) + (qty || 1);
    write(cart);
  }

  function setQty(id, qty) {
    var cart = read();
    if (qty <= 0) {
      delete cart[id];
    } else {
      cart[id] = qty;
    }
    write(cart);
  }

  function remove(id) {
    setQty(id, 0);
  }

  function items() {
    var cart = read();
    return Object.keys(cart)
      .filter(function (id) {
        return PRODUCTS[id] && cart[id] > 0;
      })
      .map(function (id) {
        return {
          id: id,
          qty: cart[id],
          product: PRODUCTS[id],
          subtotal: PRODUCTS[id].price * cart[id],
        };
      });
  }

  function count() {
    var cart = read();
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + (cart[id] || 0);
    }, 0);
  }

  function total() {
    return items().reduce(function (sum, item) {
      return sum + item.subtotal;
    }, 0);
  }

  function whatsappUrl() {
    var list = items();
    var lines = [
      "Olá! Quero fazer um pedido na Rincón del Vino:",
      "",
    ];
    list.forEach(function (item) {
      lines.push(
        "- " +
          item.product.name +
          " (" +
          item.product.type +
          ") x" +
          item.qty +
          " — " +
          formatPrice(item.subtotal)
      );
    });
    lines.push("");
    lines.push("Total: " + formatPrice(total()));
    lines.push("");
    lines.push(
      "Sei que não tem entrega e que a retirada é na loja — aguardo confirmação!"
    );
    var text = encodeURIComponent(lines.join("\n"));
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
  }

  return {
    add: add,
    remove: remove,
    setQty: setQty,
    items: items,
    count: count,
    total: total,
    formatPrice: formatPrice,
    whatsappUrl: whatsappUrl,
  };
})();

// -------------------- Cart: badge + add-to-cart buttons (present on every page) --------------------
(function () {
  function updateBadge() {
    var badge = document.getElementById("cart-count");
    if (!badge) return;
    var n = RinconCart.count();
    badge.textContent = String(n);
    badge.hidden = n === 0;
  }

  document.addEventListener("cart:change", updateBadge);
  updateBadge();

  document.querySelectorAll("[data-add-to-cart]").forEach(function (button) {
    button.addEventListener("click", function () {
      var id = button.getAttribute("data-add-to-cart");
      RinconCart.add(id);
      var original = button.textContent;
      button.textContent = "Adicionado ✓";
      button.disabled = true;
      setTimeout(function () {
        button.textContent = original;
        button.disabled = false;
      }, 1400);
    });
  });
})();

// -------------------- Cart page: list, quantities, WhatsApp checkout --------------------
(function () {
  var list = document.getElementById("cart-list");
  if (!list) return;

  var emptyState = document.getElementById("cart-empty");
  var totalEl = document.getElementById("cart-total");
  var checkoutLink = document.getElementById("cart-checkout");

  function render() {
    var items = RinconCart.items();
    list.innerHTML = "";

    if (items.length === 0) {
      emptyState.hidden = false;
      list.hidden = true;
      checkoutLink.setAttribute("aria-disabled", "true");
      checkoutLink.classList.add("is-disabled");
      totalEl.textContent = RinconCart.formatPrice(0);
      return;
    }

    emptyState.hidden = true;
    list.hidden = false;
    checkoutLink.removeAttribute("aria-disabled");
    checkoutLink.classList.remove("is-disabled");
    checkoutLink.href = RinconCart.whatsappUrl();

    items.forEach(function (item) {
      var row = document.createElement("li");
      row.className = "cart-item";
      row.innerHTML =
        '<div class="cart-item__info">' +
        '<p class="wine-card__type">' +
        item.product.type +
        "</p>" +
        '<h3 class="wine-card__name">' +
        item.product.name +
        "</h3>" +
        '<p class="cart-item__price">' +
        RinconCart.formatPrice(item.product.price) +
        " cada</p>" +
        "</div>" +
        '<div class="cart-item__qty">' +
        '<button type="button" class="cart-item__step" data-step="-1">−</button>' +
        '<span>' +
        item.qty +
        "</span>" +
        '<button type="button" class="cart-item__step" data-step="1">+</button>' +
        "</div>" +
        '<p class="cart-item__subtotal">' +
        RinconCart.formatPrice(item.subtotal) +
        "</p>" +
        '<button type="button" class="cart-item__remove" aria-label="Remover">×</button>';

      row
        .querySelectorAll("[data-step]")
        .forEach(function (stepButton) {
          stepButton.addEventListener("click", function () {
            var delta = parseInt(stepButton.getAttribute("data-step"), 10);
            RinconCart.setQty(item.id, item.qty + delta);
          });
        });

      row
        .querySelector(".cart-item__remove")
        .addEventListener("click", function () {
          RinconCart.remove(item.id);
        });

      list.appendChild(row);
    });

    totalEl.textContent = RinconCart.formatPrice(RinconCart.total());
  }

  document.addEventListener("cart:change", render);
  render();
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
