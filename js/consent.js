/*
  Aviso de cookies + carga de Google Tag Manager.
  Tag Manager (y por lo tanto Analytics, Pixel, Ads) se carga SOLO si el visitante acepta.
  Si gtmId está vacío en config.js, este archivo no hace nada.
*/
(function () {
  var cfg = window.SITE_CONFIG || {};
  var KEY = "consentimiento_cookies";

  window.dataLayer = window.dataLayer || [];

  function leer() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function guardar(valor) {
    try { localStorage.setItem(KEY, valor); } catch (e) {}
  }

  var gtmCargado = false;
  function cargarGTM() {
    if (gtmCargado || !cfg.gtmId) return;
    gtmCargado = true;
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(cfg.gtmId);
    document.head.appendChild(s);
  }

  function mostrarAviso() {
    var aviso = document.getElementById("aviso-cookies");
    if (aviso) aviso.hidden = false;
  }
  function ocultarAviso() {
    var aviso = document.getElementById("aviso-cookies");
    if (aviso) aviso.hidden = true;
  }

  function iniciar() {
    if (!cfg.gtmId) {
      // Nivel "web sola": sin medición, sin aviso, sin link de configuración de cookies.
      document.querySelectorAll("[data-solo-con-medicion]").forEach(function (el) { el.hidden = true; });
      return;
    }

    var eleccion = leer();
    if (eleccion === "aceptadas") cargarGTM();
    else if (eleccion !== "rechazadas") mostrarAviso();

    var aceptar = document.getElementById("cookies-aceptar");
    var rechazar = document.getElementById("cookies-rechazar");
    if (aceptar) aceptar.addEventListener("click", function () {
      guardar("aceptadas"); ocultarAviso(); cargarGTM();
    });
    if (rechazar) rechazar.addEventListener("click", function () {
      guardar("rechazadas"); ocultarAviso();
    });

    // Link "Configurar cookies" del pie: vuelve a mostrar el aviso.
    document.querySelectorAll("[data-abrir-cookies]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); mostrarAviso(); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
