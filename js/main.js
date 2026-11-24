/*
  ALBORA · comportamiento del sitio
  - Medición: cada clic manda un evento a Tag Manager (dataLayer). Solo se envía si el visitante aceptó cookies
    (Tag Manager no se carga sin consentimiento; antes de eso los eventos quedan en la página y no salen).
      clic_whatsapp   → cualquier link a WhatsApp, con "ubicacion" (encabezado, flotante, yoga, producto...)
      clic_lo_quiero  → botón "Lo quiero" de un producto, con "producto" y "variante"
      clic_compartir  → botón "Compartir", con "producto" y "metodo" (menu_nativo o copiar_link)
      clic_pago       → link de pago de Mercado Pago, con "producto"
  - Menú en celular, encabezado que se vuelve sólido al bajar.
  - Animaciones suaves con data-revelar (solo opacidad y movimiento).
  - Compartir (menú nativo en el celular, copiar link en la compu), variantes y filtro del almacén.
*/
(function () {
  document.documentElement.classList.add("js");
  window.dataLayer = window.dataLayer || [];
  var reducirMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function medir(evento, datos) {
    var d = { event: evento };
    for (var k in datos) if (datos[k]) d[k] = datos[k];
    window.dataLayer.push(d);
  }

  // ---------- Medición de clics ----------
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("a[href]") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    var producto = link.getAttribute("data-producto") || "";
    var accion = link.getAttribute("data-evento");

    if (href.indexOf("https://wa.me/") === 0 || href.indexOf("https://api.whatsapp.com/") === 0) {
      medir("clic_whatsapp", { ubicacion: link.getAttribute("data-ubicacion") || "sin_dato", producto: producto });
    }
    if (accion === "lo_quiero") {
      medir("clic_lo_quiero", { producto: producto, variante: link.getAttribute("data-variante") || "" });
    }
    if (accion === "pago") {
      medir("clic_pago", { producto: producto });
    }
  });

  // ---------- Menú en celular ----------
  var boton = document.querySelector(".menu-boton");
  var menu = document.getElementById("menu");
  function cerrarMenu() {
    if (!boton) return;
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-label", "Abrir menú");
    menu.classList.remove("abierto");
    document.body.classList.remove("menu-abierto");
  }
  if (boton && menu) {
    boton.addEventListener("click", function () {
      var abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", String(!abierto));
      boton.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
      menu.classList.toggle("abierto", !abierto);
      document.body.classList.toggle("menu-abierto", !abierto);
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", cerrarMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 900) cerrarMenu(); });
  }

  // ---------- Encabezado: sólido al bajar, se esconde al bajar y vuelve al subir ----------
  var encabezado = document.querySelector(".encabezado");
  var ultimoY = window.scrollY;
  var pendiente = false;
  var parallax = reducirMovimiento ? [] : Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));

  function alScrollear() {
    pendiente = false;
    var y = window.scrollY;
    if (encabezado) {
      encabezado.classList.toggle("solido", y > 40);
      var menuAbierto = document.body.classList.contains("menu-abierto");
      encabezado.classList.toggle("oculto", !menuAbierto && y > 600 && y > ultimoY + 4);
      if (y < ultimoY - 4) encabezado.classList.remove("oculto");
    }
    ultimoY = y;
    if (parallax.length) {
      var alto = window.innerHeight;
      parallax.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > alto) return;
        var factor = parseFloat(el.getAttribute("data-parallax")) || 0.06;
        el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - alto / 2) * -factor).toFixed(1) + "px,0)";
      });
    }
  }
  window.addEventListener("scroll", function () {
    if (!pendiente) { pendiente = true; window.requestAnimationFrame(alScrollear); }
  }, { passive: true });
  alScrollear();

  // ---------- Revelar al scrollear (data-revelar) ----------
  var aRevelar = document.querySelectorAll("[data-revelar]");
  if (!("IntersectionObserver" in window) || reducirMovimiento) {
    aRevelar.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    aRevelar.forEach(function (el) { observador.observe(el); });
  }

  // ---------- Compartir producto ----------
  document.querySelectorAll("[data-compartir]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-url") || window.location.href;
      var titulo = btn.getAttribute("data-titulo") || document.title;
      var producto = btn.getAttribute("data-producto") || "";
      var etiqueta = btn.querySelector(".texto");
      var tactil = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
      if (navigator.share && tactil) {
        medir("clic_compartir", { producto: producto, metodo: "menu_nativo" });
        navigator.share({ title: titulo, text: titulo + " · Albora", url: url }).catch(function () {});
        return;
      }
      medir("clic_compartir", { producto: producto, metodo: "copiar_link" });
      function avisar(texto) {
        if (!etiqueta) return;
        var original = etiqueta.getAttribute("data-original") || etiqueta.textContent;
        etiqueta.setAttribute("data-original", original);
        etiqueta.textContent = texto;
        setTimeout(function () { etiqueta.textContent = original; }, 2200);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(function () { avisar("Link copiado"); }, function () { window.prompt("Copiá este link:", url); });
      } else {
        window.prompt("Copiá este link:", url);
      }
    });
  });

  // ---------- Variantes: actualizan el mensaje de WhatsApp de "Lo quiero" ----------
  document.querySelectorAll("[data-variantes]").forEach(function (grupo) {
    var loQuiero = document.querySelector("[data-evento='lo_quiero']");
    if (!loQuiero) return;
    var base = loQuiero.getAttribute("data-base");
    grupo.addEventListener("change", function (e) {
      var v = e.target.value;
      var producto = loQuiero.getAttribute("data-producto");
      var texto = "Hola! Quiero el " + producto + (v ? " (" + v + ")" : "") + " que vi en la web de Albora 🌾";
      loQuiero.href = base + encodeURIComponent(texto);
      loQuiero.setAttribute("data-variante", v);
    });
  });

  // ---------- Filtro del almacén (botones por categoría) ----------
  var filtros = document.querySelectorAll("[data-filtro]");
  if (filtros.length) {
    var tarjetas = document.querySelectorAll("[data-categoria]");
    filtros.forEach(function (f) {
      f.addEventListener("click", function () {
        var cat = f.getAttribute("data-filtro");
        filtros.forEach(function (o) { o.setAttribute("aria-pressed", String(o === f)); });
        tarjetas.forEach(function (t) {
          t.hidden = !(cat === "todo" || t.getAttribute("data-categoria") === cat);
        });
      });
    });
  }

  // ---------- Año actual en el pie ----------
  document.querySelectorAll("[data-anio]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
