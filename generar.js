#!/usr/bin/env node
/*
  GENERAR.JS · arma las partes de la web que salen de productos.json
  -------------------------------------------------------------------
  No hace falta correrlo a mano: Netlify lo corre solo cada vez que se sube un cambio.
  Si querés probarlo en tu compu: abrí una terminal en esta carpeta y escribí  node generar.js

  Qué hace:
  1. Pone el mismo encabezado y pie (carpeta plantillas/) en todas las páginas.
  2. Arma los productos destacados de la home.
  (Más adelante: páginas de producto, de categoría, el almacén y el sitemap.)

  No usa nada externo: solo Node.
*/
"use strict";
const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;

// ---------- Datos del sitio (cambiar acá si cambian) ----------
const SITIO = {
  dominio: "https://albora.com.ar", // [FALTA: dominio definitivo]
  whatsapp: "5492213627376",
  whatsappVisible: "221 362-7376",
  mensajeGeneral: "Hola Paloma! Vi la web de Albora y quería hacer una consulta 🌾",
  mensajeClases: "Hola Paloma! Quería consultar por las clases de yoga 🌾",
};

const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, "productos.json"), "utf8"));
const categorias = Object.fromEntries(datos.categorias.map((c) => [c.id, c]));

// ---------- Utilidades ----------
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const wa = (texto) => `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(texto)}`;

function reemplazarBloque(html, nombre, contenido) {
  const re = new RegExp(`(<!-- inicio:${nombre} -->)[\\s\\S]*?(<!-- fin:${nombre} -->)`);
  return re.test(html) ? html.replace(re, `$1\n${contenido}\n$2`) : html;
}

function paginasHtml(dir = RAIZ, lista = []) {
  for (const nombre of fs.readdirSync(dir)) {
    if ([".git", "material", "plantillas", "node_modules", "img", "fonts", "css", "js"].includes(nombre)) continue;
    const ruta = path.join(dir, nombre);
    if (fs.statSync(ruta).isDirectory()) paginasHtml(ruta, lista);
    else if (nombre.endsWith(".html")) lista.push(ruta);
  }
  return lista;
}

// Texto del precio según stock y encargo
function estadoPrecio(p) {
  if (p.stock === false) return "Sin stock · Consultar";
  if (p.por_encargo) return `${p.precio} · Por encargo`;
  return p.precio;
}

// ---------- Tarjeta de producto ----------
function fotoProducto(p, { lazy = true, sizes = "(min-width: 1100px) 25vw, (min-width: 768px) 33vw, 50vw" } = {}) {
  const foto = (p.fotos || [])[0];
  if (!foto) {
    return `<div class="foto-pendiente foto-pendiente--${esc(p.categoria)}"><img src="/img/isotipo-crema.webp" alt="" width="96" height="96">${esc(p.nombre)}</div>`;
  }
  return `<img src="/${esc(foto)}" alt="${esc(p.nombre)} de Albora" width="1000" height="1000" sizes="${sizes}"${lazy ? ' loading="lazy" decoding="async"' : ""}>`;
}

function tarjeta(p, i = 0) {
  const cat = categorias[p.categoria] || { nombre: "" };
  return `      <li data-categoria="${esc(p.categoria)}" data-revelar style="--d:${(i % 4) * 0.08}s">
        <a class="producto-tarjeta" href="/producto/${esc(p.id)}/">
          <div class="producto-tarjeta__foto">${fotoProducto(p)}</div>
          <span class="producto-tarjeta__categoria">${esc(cat.nombre)}</span>
          <h3 class="producto-tarjeta__nombre">${esc(p.nombre)}</h3>
          <p class="producto-tarjeta__precio">${esc(estadoPrecio(p))}</p>
        </a>
      </li>`;
}

// ---------- Encabezado y pie compartidos ----------
const plantilla = (n) => fs.readFileSync(path.join(RAIZ, "plantillas", n), "utf8").trim();
function completar(html, ruta) {
  const rel = "/" + path.relative(RAIZ, ruta).replace(/\\/g, "/").replace(/index\.html$/, "");
  const seccion = rel.split("/")[1] || "";
  const esHome = rel === "/";
  const actual = (s) => (seccion === s || (s === "almacen" && seccion === "producto") ? ' aria-current="page"' : "");
  return html
    .replace(/\{\{clase_encabezado\}\}/g, esHome ? "" : " encabezado--claro")
    .replace(/\{\{actual:(\w+)\}\}/g, (_, s) => actual(s))
    .replace(/\{\{whatsapp\}\}/g, SITIO.whatsapp)
    .replace(/\{\{whatsapp_visible\}\}/g, SITIO.whatsappVisible)
    .replace(/\{\{mensaje_general\}\}/g, encodeURIComponent(SITIO.mensajeGeneral));
}

// ---------- Escribir ----------
let cambios = 0;
for (const ruta of paginasHtml()) {
  const antes = fs.readFileSync(ruta, "utf8");
  let html = antes;
  html = reemplazarBloque(html, "encabezado", completar(plantilla("encabezado.html"), ruta));
  html = reemplazarBloque(html, "pie", completar(plantilla("pie.html"), ruta));
  html = reemplazarBloque(html, "destacados",
    datos.productos.filter((p) => p.destacado).slice(0, 4).map(tarjeta).join("\n"));
  if (html !== antes) { fs.writeFileSync(ruta, html); cambios++; }
}
console.log(`Listo: ${cambios} página(s) actualizada(s).`);

module.exports = { SITIO, wa };
