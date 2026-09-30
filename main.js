/* =========================================================
   Magnettique — comportamiento del sitio (JS clásico, sin módulos)
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[Magnettique] falló " + name, e); }
  }

  /* ---------- Catálogo (datos) ---------- */
  var PRODUCTS = [
    { id: "esencial-blanco-h", linea: "Esencial", nombre: "Camisa Esencial blanca", color: "Blanco", hex: "#FFFFFF", molde: "Hombre", precio: 89900, img: "camisas/esencial-blanco-frente.webp", tela: "Poplín 100% algodón, cartera lisa" },
    { id: "esencial-celeste-h", linea: "Esencial", nombre: "Camisa Esencial celeste", color: "Celeste", hex: "#D9E6F7", molde: "Hombre", precio: 89900, img: "camisas/esencial-celeste-frente.webp", tela: "Poplín 100% algodón, cartera lisa" },
    { id: "esencial-rayado-h", linea: "Esencial", nombre: "Camisa Esencial rayado fino", color: "Rayado fino", hex: "#E4EBF6", molde: "Hombre", precio: 89900, img: "camisas/esencial-rayado-frente.webp", tela: "Poplín 100% algodón, cartera lisa" },
    { id: "esencial-blanco-m", linea: "Esencial", nombre: "Camisa Esencial blanca", color: "Blanco", hex: "#FFFFFF", molde: "Mujer", precio: 89900, img: "camisas/esencial-blanco-m-frente.webp", tela: "Poplín 100% algodón, molde entallado" },
    { id: "esencial-celeste-m", linea: "Esencial", nombre: "Camisa Esencial celeste", color: "Celeste", hex: "#D9E6F7", molde: "Mujer", precio: 89900, img: "camisas/esencial-celeste-m-frente.webp", tela: "Poplín 100% algodón, molde entallado" },
    { id: "signature-celeste-h", linea: "Signature", nombre: "Camisa Signature oxford celeste", color: "Celeste", hex: "#D9E6F7", molde: "Hombre", precio: 119900, img: "camisas/signature-celeste-frente.webp", tela: "Oxford de algodón, botones decorativos símil nácar y puños magnéticos" },
    { id: "signature-blanco-h", linea: "Signature", nombre: "Camisa Signature oxford blanca", color: "Blanco", hex: "#FFFFFF", molde: "Hombre", precio: 119900, img: "camisas/signature-blanco-frente.webp", tela: "Oxford de algodón, botones decorativos símil nácar y puños magnéticos" },
    { id: "signature-blanco-m", linea: "Signature", nombre: "Camisa Signature blanca", color: "Blanco", hex: "#FFFFFF", molde: "Mujer", precio: 119900, img: "camisas/signature-blanco-m-frente.webp", tela: "Algodón egipcio, botones decorativos símil nácar y puños magnéticos" }
  ];
  var TALLES = ["38", "40", "42", "44", "46", "48", "50", "52"];
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function money(n) { return "$" + Math.round(n).toLocaleString("es-AR"); }

  /* ---------- Carrito (localStorage con respaldo en memoria) ---------- */
  var KEY = "magnettique_cart_v1", memory = [];
  function readCart() {
    try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return memory; }
  }
  function writeCart(items) {
    memory = items;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* sin almacenamiento: queda en memoria */ }
    updateCount();
  }
  function addToCart(id, talle, qty) {
    var items = readCart(), found = false;
    items.forEach(function (it) { if (it.id === id && it.talle === talle) { it.qty += qty; found = true; } });
    if (!found) items.push({ id: id, talle: talle, qty: qty });
    writeCart(items);
  }
  function totals(items) {
    var units = 0, sub = 0;
    items.forEach(function (it) { var p = byId(it.id); if (p) { units += it.qty; sub += p.precio * it.qty; } });
    return { units: units, sub: sub, freeShip: units >= 2, transfer: sub * 0.9, cuota6: sub / 6, cuota3: sub / 3 };
  }
  function updateCount() {
    var t = totals(readCart());
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = t.units; el.hidden = t.units === 0;
      var link = el.closest("a"); if (link) link.setAttribute("aria-label", "Carrito, " + t.units + (t.units === 1 ? " producto" : " productos"));
    });
  }

  /* ---------- Menú móvil ---------- */
  function initMenu() {
    var btn = document.querySelector(".menu-toggle"), menu = document.getElementById("mobile-menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) { if (e.target.tagName === "A") { menu.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); } });
  }

  /* ---------- Revelado al hacer scroll (umbral bajo + red de seguridad) ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add("is-in"); }); }, 6000);
  }

  /* ---------- Modelos en bucle (home) ---------- */
  function initHeroLoop() {
    var box = document.querySelector("[data-hero-loop]"); if (!box) return;
    var imgs = box.querySelectorAll("img"), i = 0;
    if (imgs.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setInterval(function () {
      if (document.hidden) return;
      imgs[i].classList.remove("is-on"); i = (i + 1) % imgs.length; imgs[i].classList.add("is-on");
    }, 3500);
  }

  /* ---------- Videos (ventana emergente) ---------- */
  function initVideos() {
    var links = document.querySelectorAll("[data-video]"); if (!links.length) return;
    var dlg = document.createElement("dialog"); dlg.className = "video-modal";
    dlg.innerHTML = '<div class="video-modal__bar"><span data-video-label></span><button type="button" class="video-modal__close" aria-label="Cerrar video">×</button></div><video controls playsinline muted preload="none"></video>';
    document.body.appendChild(dlg);
    var video = dlg.querySelector("video");
    function close() { video.pause(); dlg.close(); }
    dlg.querySelector(".video-modal__close").addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener("close", function () { video.pause(); });
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (typeof dlg.showModal !== "function") return; // navegador viejo: abre el archivo directo
        e.preventDefault();
        video.src = a.getAttribute("data-video"); video.poster = a.getAttribute("data-video-poster") || "";
        dlg.querySelector("[data-video-label]").textContent = a.getAttribute("data-video-title") || "";
        video.setAttribute("aria-label", a.getAttribute("data-video-title") || "Video");
        dlg.showModal(); var p = video.play(); if (p && p.catch) p.catch(function () {});
      });
    });
  }

  /* ---------- Formularios de suscripción ---------- */
  function initNewsletter() {
    document.querySelectorAll("[data-newsletter]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input[type=email]"), msg = form.parentNode.querySelector(".form-msg");
        if (!input.value || !input.checkValidity()) { input.setAttribute("aria-invalid", "true"); input.focus(); if (msg) msg.textContent = "Revisá el correo electrónico."; return; }
        input.removeAttribute("aria-invalid");
        if (msg) msg.textContent = "¡Listo! Te avisamos del lanzamiento.";
        form.reset();
      });
    });
  }

  /* ---------- Catálogo: filtros ---------- */
  function initCatalog() {
    var grid = document.querySelector("[data-grid]"); if (!grid) return;
    var filters = document.querySelector("[data-filters]"), sort = document.getElementById("orden");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".card")), empty = grid.querySelector(".empty");
    function apply() {
      var sel = {};
      filters.querySelectorAll("input:checked").forEach(function (i) { (sel[i.name] = sel[i.name] || []).push(i.value); });
      var shown = 0;
      cards.forEach(function (c) {
        var ok = Object.keys(sel).every(function (k) { return sel[k].indexOf(c.getAttribute("data-" + k)) !== -1; });
        c.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      var order = sort ? sort.value : "destacados";
      var sorted = cards.slice().sort(function (a, b) {
        var pa = +a.getAttribute("data-precio"), pb = +b.getAttribute("data-precio");
        if (order === "menor") return pa - pb; if (order === "mayor") return pb - pa;
        return +a.getAttribute("data-orden") - +b.getAttribute("data-orden");
      });
      sorted.forEach(function (c) { grid.appendChild(c); }); if (empty) grid.appendChild(empty);
    }
    filters.addEventListener("change", apply); if (sort) sort.addEventListener("change", apply);
    var q = new URLSearchParams(location.search);
    ["linea", "molde"].forEach(function (k) { var v = q.get(k); if (v) { var box = filters.querySelector('input[name="' + k + '"][value="' + v + '"]'); if (box) box.checked = true; } });
    apply();
  }

  /* ---------- Ficha de producto ---------- */
  function initProduct() {
    var root = document.querySelector("[data-product]"); if (!root) return;
    var id = new URLSearchParams(location.search).get("id") || root.getAttribute("data-product");
    var p = byId(id) || byId(root.getAttribute("data-product"));
    var talle = "42";
    function render() {
      document.title = p.nombre + " — Magnettique";
      root.querySelector("[data-name]").textContent = p.nombre;
      root.querySelector("[data-eyebrow]").textContent = "Línea " + p.linea + " · Molde " + p.molde.toLowerCase();
      root.querySelector("[data-crumb]").textContent = p.linea;
      root.querySelector("[data-price]").textContent = money(p.precio);
      root.querySelector("[data-sub]").innerHTML = "6 cuotas sin interés de " + money(p.precio / 6) + " · <strong>" + money(p.precio * 0.9) + "</strong> por transferencia";
      root.querySelector("[data-color-label]").textContent = p.color;
      root.querySelector("[data-tela]").textContent = p.tela;
      var main = root.querySelector("[data-main-img]"); main.src = "assets/img/" + p.img; main.alt = p.nombre + ", vista de frente";
      root.querySelectorAll("[data-thumb-img]").forEach(function (img) { img.src = "assets/img/" + p.img.replace("-frente.", "-" + img.getAttribute("data-thumb-img") + "."); });
      root.querySelectorAll(".gallery__thumbs button").forEach(function (o, i) { o.setAttribute("aria-pressed", i === 0 ? "true" : "false"); });
      var sw = root.querySelector("[data-swatches]"); sw.innerHTML = "";
      PRODUCTS.filter(function (x) { return x.linea === p.linea && x.molde === p.molde; }).forEach(function (x) {
        var b = document.createElement("button"); b.type = "button"; b.className = "swatch"; b.style.background = x.hex;
        if (x.color === "Rayado fino") b.style.backgroundImage = "repeating-linear-gradient(90deg, #FFFFFF 0 5px, #9FB2D6 5px 6px)";
        b.setAttribute("aria-label", x.color); b.setAttribute("aria-pressed", x.id === p.id ? "true" : "false");
        b.addEventListener("click", function () { p = x; history.replaceState(null, "", "?id=" + x.id); render(); });
        sw.appendChild(b);
      });
      var sz = root.querySelector("[data-sizes]"); sz.innerHTML = "";
      TALLES.forEach(function (t) {
        var b = document.createElement("button"); b.type = "button"; b.className = "size"; b.textContent = t;
        b.setAttribute("aria-pressed", t === talle ? "true" : "false");
        b.addEventListener("click", function () { talle = t; render(); });
        sz.appendChild(b);
      });
      root.querySelector("[data-size-label]").textContent = talle;
    }
    render();
    root.querySelector("[data-add]").addEventListener("click", function () {
      addToCart(p.id, talle, 1);
      var ok = root.querySelector("[data-added]"); ok.hidden = false;
      ok.querySelector("span").textContent = p.nombre + ", talle " + talle + ", agregada al carrito.";
    });
    // galería
    document.querySelectorAll(".gallery__thumbs button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".gallery__thumbs button").forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var main = document.querySelector("[data-main-img]"), t = b.querySelector("img");
        main.src = t.src; main.alt = p.nombre + ", vista de " + t.getAttribute("data-thumb-img");
      });
    });
    // pestañas
    var tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (o) { o.setAttribute("aria-selected", "false"); document.getElementById(o.getAttribute("aria-controls")).hidden = true; });
        t.setAttribute("aria-selected", "true"); document.getElementById(t.getAttribute("aria-controls")).hidden = false;
      });
    });
  }

  /* ---------- Carrito ---------- */
  function itemHTML(it, p, mini) {
    var img = '<div class="cart-item__img"><img src="assets/img/' + p.img + '" alt=""></div>';
    if (mini) return '<div class="mini">' + img + '<div>' + p.nombre + '<br><span class="muted">' + p.color + " · Talle " + it.talle + " · x" + it.qty + '</span></div><span>' + money(p.precio * it.qty) + "</span></div>";
    return '<div class="cart-item">' + img +
      '<div><h3>' + p.nombre + '</h3><div class="meta">' + p.color + " · Molde " + p.molde.toLowerCase() + " · Talle " + it.talle + '</div>' +
      '<div><span class="qty"><button type="button" data-dec aria-label="Restar una unidad">−</button><span aria-live="polite">' + it.qty + '</span><button type="button" data-inc aria-label="Sumar una unidad">+</button></span>' +
      '<button type="button" class="remove" data-remove>Quitar</button></div></div>' +
      '<div class="price">' + money(p.precio * it.qty) + "</div></div>";
  }
  function initCart() {
    var list = document.querySelector("[data-cart-list]"); if (!list) return;
    function render() {
      var items = readCart(), t = totals(items);
      list.innerHTML = "";
      if (!items.length) {
        list.innerHTML = '<div class="empty-cart"><p class="lead">Tu carrito está vacío.</p><a class="btn" href="camisas.html">Ver camisas</a></div>';
      }
      items.forEach(function (it, idx) {
        var p = byId(it.id); if (!p) return;
        var wrap = document.createElement("div"); wrap.innerHTML = itemHTML(it, p, false);
        var node = wrap.firstChild;
        node.querySelector("[data-inc]").addEventListener("click", function () { items[idx].qty++; writeCart(items); render(); });
        node.querySelector("[data-dec]").addEventListener("click", function () { if (items[idx].qty > 1) { items[idx].qty--; } else { items.splice(idx, 1); } writeCart(items); render(); });
        node.querySelector("[data-remove]").addEventListener("click", function () { items.splice(idx, 1); writeCart(items); render(); });
        list.appendChild(node);
      });
      fill(t);
      var notice = document.querySelector("[data-ship-notice]");
      if (notice) notice.innerHTML = t.freeShip ? "Llevás " + t.units + " camisas: <strong>el envío es sin cargo.</strong>" : "Sumá una segunda camisa y <strong>el envío es sin cargo.</strong>";
      var go = document.querySelector("[data-go-checkout]"); if (go) go.classList.toggle("is-disabled", !items.length);
    }
    render();
    var cpBtn = document.querySelector("[data-cp]");
    if (cpBtn) cpBtn.addEventListener("click", function () {
      var cp = document.getElementById("cp"), out = document.querySelector("[data-cp-out]");
      if (!/^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/.test(cp.value.trim())) { cp.setAttribute("aria-invalid", "true"); out.textContent = "Ingresá un código postal válido."; return; }
      cp.removeAttribute("aria-invalid");
      out.textContent = totals(readCart()).freeShip ? "Envío sin cargo a " + cp.value.trim() + "." : "El costo del envío a " + cp.value.trim() + " se confirma en el checkout.";
    });
  }
  function fill(t) {
    var set = function (sel, v) { document.querySelectorAll(sel).forEach(function (el) { el.textContent = v; }); };
    set("[data-sub-total]", money(t.sub));
    set("[data-ship]", t.freeShip ? "Sin cargo" : (t.units ? "Se calcula en el checkout" : "—"));
    set("[data-total]", money(t.sub));
    set("[data-transfer]", money(t.transfer));
    set("[data-cuota6]", money(t.cuota6) + " c/u");
  }

  /* ---------- Checkout ---------- */
  function initCheckout() {
    var form = document.querySelector("[data-checkout]"); if (!form) return;
    var items = readCart(), t = totals(items), mini = document.querySelector("[data-mini]");
    if (!items.length) { mini.innerHTML = '<p class="muted">No hay productos en el carrito. <a href="camisas.html">Ver camisas</a></p>'; }
    items.forEach(function (it) { var p = byId(it.id); if (p) mini.insertAdjacentHTML("beforeend", itemHTML(it, p, true)); });
    fill(t);
    var cuotas = document.getElementById("cuotas");
    if (cuotas) cuotas.innerHTML = '<option>1 pago de ' + money(t.sub) + '</option><option>3 cuotas sin interés de ' + money(t.cuota3) + '</option><option>6 cuotas sin interés de ' + money(t.cuota6) + '</option>';
    function payChange() {
      var v = form.querySelector('input[name="pago"]:checked').value;
      document.querySelector("[data-total]").textContent = money(v === "transferencia" ? t.transfer : t.sub);
      document.querySelector("[data-cuotas-wrap]").hidden = v !== "tarjeta";
    }
    form.querySelectorAll('input[name="pago"]').forEach(function (r) { r.addEventListener("change", payChange); });
    payChange();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll("[required]").forEach(function (inp) {
        var ok = inp.value.trim() !== "" && inp.checkValidity();
        inp.setAttribute("aria-invalid", ok ? "false" : "true");
        var err = inp.parentNode.querySelector(".err"); if (err) err.textContent = ok ? "" : "Completá este dato.";
        if (!ok && !firstBad) firstBad = inp;
      });
      if (!items.length) { alert("Tu carrito está vacío."); return; }
      if (firstBad) { firstBad.focus(); return; }
      /* IMPORTANTE: acá se conecta la pasarela real (Tiendanube / Mercado Pago).
         En esta versión el pedido se registra solo en el navegador. */
      try { localStorage.setItem("magnettique_last_order", JSON.stringify({ items: items, pago: form.querySelector('input[name="pago"]:checked').value, fecha: new Date().toISOString() })); } catch (err2) {}
      writeCart([]);
      location.href = "gracias.html";
    });
  }

  safe(updateCount, "contador");
  safe(initMenu, "menú");
  safe(initReveal, "reveal");
  safe(initHeroLoop, "modelos en bucle");
  safe(initVideos, "videos");
  safe(initNewsletter, "newsletter");
  safe(initCatalog, "catálogo");
  safe(initProduct, "producto");
  safe(initCart, "carrito");
  safe(initCheckout, "checkout");
})();
