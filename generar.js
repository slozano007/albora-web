#!/usr/bin/env node
/*
  GENERAR.JS · arma las partes de la web que salen de productos.json
  -------------------------------------------------------------------
  No hace falta correrlo a mano: Netlify lo corre solo cada vez que se sube un cambio.
  Para probarlo en la compu: abrir una terminal en esta carpeta y escribir  node generar.js

  Qué hace:
  1. Arma una página por producto:   /producto/<id>/      (con su vista previa para WhatsApp e Instagram)
  2. Arma una página por categoría:  /almacen/<categoria>/
  3. Arma el almacén completo:       /almacen/            (con filtro por categoría)
  4. Arma los destacados de la home (los productos con "destacado": true).
  5. Pone el mismo encabezado y pie (carpeta plantillas/) en todas las páginas.
  6. Arma sitemap.xml.

  No usa nada externo: solo Node.
*/
"use strict";
const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;

// ---------- Datos del sitio (cambiar acá si cambian) ----------
const SITIO = {
  dominio: "https://albora.com.ar", // [FALTA: dominio definitivo]. Cambiarlo también en robots.txt y en las páginas hechas a mano.
  whatsapp: "5492213627376",
  whatsappVisible: "221 362-7376",
  mensajeGeneral: "Hola Paloma! Vi la web de Albora y quería hacer una consulta 🌾",
};

const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, "productos.json"), "utf8"));
const categorias = datos.categorias;
const catPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));
const productos = datos.productos.filter((p) => p.id && p.nombre && catPorId[p.categoria]);
datos.productos.forEach((p) => {
  if (!catPorId[p.categoria]) console.warn(`Aviso: "${p.nombre}" tiene una categoría que no existe ("${p.categoria}"). No se publica.`);
});

const MARCA = "<!-- Página generada por generar.js a partir de productos.json. No editar a mano: los cambios se pisan. -->";

// ---------- Utilidades ----------
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const wa = (texto) => `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(texto)}`;
const abs = (ruta) => SITIO.dominio + (ruta.startsWith("/") ? ruta : "/" + ruta);
const json = (o) => JSON.stringify(o, null, 2).replace(/</g, "\\u003c");

// Precio: si es un número (25000 o "25000"), se muestra "$ 25.000". Si es texto ("Próximamente"), tal cual.
function precioNumero(p) {
  const n = typeof p.precio === "number" ? p.precio : Number(String(p.precio || "").replace(/[$.\s]/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}
function precioTexto(p) {
  const n = precioNumero(p);
  return n ? "$ " + n.toLocaleString("es-AR", { maximumFractionDigits: 0 }) : (p.precio || "Próximamente");
}
function estadoPrecio(p) {
  if (p.stock === false) return "Sin stock · Consultar";
  if (p.por_encargo) return `${precioTexto(p)} · Por encargo`;
  return precioTexto(p);
}
const articulo = (p) => p.articulo || "el";

function reemplazarBloque(html, nombre, contenido) {
  const re = new RegExp(`(<!-- inicio:${nombre} -->)[\\s\\S]*?(<!-- fin:${nombre} -->)`);
  return re.test(html) ? html.replace(re, () => `<!-- inicio:${nombre} -->\n${contenido}\n<!-- fin:${nombre} -->`) : html;
}

function escribir(rutaRel, html) {
  const ruta = path.join(RAIZ, rutaRel);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, html);
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

// ---------- Piezas ----------
const ISOTIPO_CREMA = '<img src="/img/isotipo-crema.webp" alt="" width="96" height="96">';

function fotoProducto(p, i = 0, { lazy = true, sizes = "(min-width: 1100px) 25vw, (min-width: 768px) 33vw, 50vw" } = {}) {
  const foto = (p.fotos || [])[i];
  if (!foto) return `<div class="foto-pendiente foto-pendiente--${esc(p.categoria)}">${ISOTIPO_CREMA}${esc(p.nombre)}</div>`;
  const alt = i === 0 ? `${p.nombre} de Albora` : `${p.nombre} de Albora, foto ${i + 1}`;
  return `<img src="/${esc(foto)}" alt="${esc(alt)}" width="1000" height="1000" sizes="${sizes}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>`;
}

function tarjeta(p, i = 0) {
  return `      <li data-categoria="${esc(p.categoria)}" data-revelar style="--d:${(i % 4) * 0.08}s">
        <a class="producto-tarjeta" href="/producto/${esc(p.id)}/">
          <div class="producto-tarjeta__foto">${fotoProducto(p)}</div>
          <span class="producto-tarjeta__categoria">${esc(catPorId[p.categoria].nombre)}</span>
          <h3 class="producto-tarjeta__nombre">${esc(p.nombre)}</h3>
          <p class="producto-tarjeta__precio">${esc(estadoPrecio(p))}</p>
        </a>
      </li>`;
}

function migas(items) {
  const html = `<nav class="migas" aria-label="Estás en">
      <ol>
${items.map((it, i) => i < items.length - 1
    ? `        <li><a href="${it.url}">${esc(it.nombre)}</a></li>`
    : `        <li aria-current="page">${esc(it.nombre)}</li>`).join("\n")}
      </ol>
    </nav>`;
  const schema = {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nombre, item: abs(it.url) })),
  };
  return { html, schema };
}

// ---------- Página completa ----------
function pagina({ ruta, titulo, descripcion, ogTitulo, ogDescripcion, ogImagen, ogImagenAlt, ogTipo = "website", ogExtra = "", schema = [], contenido, precargar = "" }) {
  const url = abs(ruta);
  const img = ogImagen ? abs(ogImagen) : abs("/img/og-imagen.jpg");
  const esJpg = /\.jpe?g$/i.test(img);
  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
  ${MARCA}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(titulo)}</title>
  <meta name="description" content="${esc(descripcion)}">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#695041">

  <meta property="og:type" content="${ogTipo}">
  <meta property="og:locale" content="es_AR">
  <meta property="og:site_name" content="Albora">
  <meta property="og:title" content="${esc(ogTitulo || titulo)}">
  <meta property="og:description" content="${esc(ogDescripcion || descripcion)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:type" content="${esJpg ? "image/jpeg" : "image/webp"}">
  <meta property="og:image:width" content="${ogImagen ? 1000 : 1200}">
  <meta property="og:image:height" content="${ogImagen ? 1000 : 630}">
  <meta property="og:image:alt" content="${esc(ogImagenAlt || "Albora · Yoga, campo y ritual")}">
${ogExtra}  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ogTitulo || titulo)}">
  <meta name="twitter:description" content="${esc(ogDescripcion || descripcion)}">
  <meta name="twitter:image" content="${img}">

  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/img/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/fonts/cormorant-light.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/funnel-light.woff2" as="font" type="font/woff2" crossorigin>
${precargar}  <link rel="stylesheet" href="/css/styles.css">
  <script>document.documentElement.classList.add("js");</script>
${schema.length ? `  <script type="application/ld+json">\n${json({ "@context": "https://schema.org", "@graph": schema })}\n  </script>\n` : ""}</head>
<body>
<!-- inicio:encabezado -->
<!-- fin:encabezado -->

<main id="contenido" class="con-encabezado">
${contenido}
</main>

<!-- inicio:pie -->
<!-- fin:pie -->

<script src="/js/config.js"></script>
<script src="/js/consent.js"></script>
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}

// ---------- Filtros / pestañas de categoría ----------
function pestanas(actual, comoBotones) {
  const items = [{ id: "todo", nombre: "Todo", url: "/almacen/" }].concat(
    categorias.map((c) => ({ id: c.id, nombre: c.nombre, url: `/almacen/${c.id}/` })));
  return `<div class="filtros" role="group" aria-label="Filtrar por categoría">
${items.map((it) => comoBotones
    ? `        <button class="filtro" type="button" data-filtro="${it.id}" aria-pressed="${it.id === actual}">${esc(it.nombre)}</button>`
    : `        <a class="filtro" href="${it.url}"${it.id === actual ? ' aria-current="page"' : ""}>${esc(it.nombre)}</a>`).join("\n")}
      </div>`;
}

const ayuda = (ubicacion) => `
  <section class="seccion seccion--compacta centrado">
    <div class="contenedor">
      <img class="isotipo-chico" src="/img/isotipo-arena.webp" alt="" width="96" height="96" loading="lazy">
      <h2 class="titulo-seccion titulo-seccion--chico">¿Buscás algo <em>especial</em>?</h2>
      <p class="lead">Escribime y lo vemos: colores, medidas o un regalo para alguien.</p>
      <a class="boton" href="${wa("Hola Paloma! Vi el almacén de Albora y quería consultarte por algo especial 🌾")}" target="_blank" rel="noopener" data-ubicacion="${ubicacion}">
        <svg aria-hidden="true"><use href="#i-whatsapp"/></svg> Escribime por WhatsApp
      </a>
    </div>
  </section>`;

// ---------- 1. Página de producto ----------
function paginaProducto(p) {
  const cat = catPorId[p.categoria];
  const ruta = `/producto/${p.id}/`;
  const fotos = (p.fotos || []).filter(Boolean);
  const n = precioNumero(p);
  const variantes = (p.variantes || []).filter(Boolean);
  const v0 = variantes[0] || "";
  const sinStock = p.stock === false;
  const conPrecio = !!n;

  // Botón principal (WhatsApp)
  let etiqueta, mensaje;
  if (sinStock) {
    etiqueta = "Sin stock · Consultar";
    mensaje = `Hola! Quería consultar por ${articulo(p)} ${p.nombre} que vi en la web de Albora 🌾`;
  } else if (conPrecio) {
    etiqueta = "Lo quiero";
    mensaje = `Hola! Quiero ${articulo(p)} ${p.nombre}${v0 ? ` (${v0})` : ""} que vi en la web de Albora 🌾`;
  } else {
    etiqueta = "Consultar";
    mensaje = `Hola! Quería consultar por ${articulo(p)} ${p.nombre}${v0 ? ` (${v0})` : ""} que vi en la web de Albora 🌾`;
  }
  const base = `https://wa.me/${SITIO.whatsapp}?text=`;

  const galeria = fotos.length > 1
    ? `<div class="galeria" data-galeria>
          <div class="galeria__principal">${fotoProducto(p, 0, { lazy: false, sizes: "(min-width: 900px) 50vw, 100vw" })}</div>
          <ul class="galeria__miniaturas">
${fotos.map((f, i) => `            <li><button type="button" data-foto="/${esc(f)}" aria-label="Ver foto ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}><img src="/${esc(f)}" alt="" width="1000" height="1000" loading="lazy" decoding="async"></button></li>`).join("\n")}
          </ul>
        </div>`
    : `<div class="galeria"><div class="galeria__principal">${fotoProducto(p, 0, { lazy: false, sizes: "(min-width: 900px) 50vw, 100vw" })}</div></div>`;

  const selectorVariantes = variantes.length && !sinStock ? `
          <fieldset class="variantes" data-variantes>
            <legend class="etiqueta">Elegí ${variantes.length > 1 ? "una opción" : "la opción"}</legend>
${variantes.map((v, i) => `            <label class="variante"><input type="radio" name="variante" value="${esc(v)}"${i === 0 ? " checked" : ""}><span>${esc(v)}</span></label>`).join("\n")}
          </fieldset>` : "";

  const notas = [];
  if (p.por_encargo && !sinStock) notas.push(`<p class="producto__nota"><strong>Por encargo.</strong> Se hace especialmente para vos. Escribime y te cuento los tiempos.</p>`);
  if (!conPrecio && !sinStock) notas.push(`<p class="producto__nota">Muy pronto con precio. Mientras tanto, escribime y te cuento todo.</p>`);

  const pago = p.link_pago && !sinStock
    ? `\n            <a class="boton boton--ancho" href="${esc(p.link_pago)}" target="_blank" rel="noopener" data-evento="pago" data-producto="${esc(p.nombre)}">Pagar con Mercado Pago</a>`
    : "";

  const relacionados = productos.filter((o) => o.id !== p.id && o.categoria === p.categoria)
    .concat(productos.filter((o) => o.categoria !== p.categoria)).slice(0, 4);

  const { html: htmlMigas, schema: schemaMigas } = migas([
    { nombre: "Inicio", url: "/" }, { nombre: "Almacén", url: "/almacen/" },
    { nombre: cat.nombre, url: `/almacen/${cat.id}/` }, { nombre: p.nombre, url: ruta },
  ]);

  const disponibilidad = sinStock ? "https://schema.org/OutOfStock"
    : p.por_encargo ? "https://schema.org/PreOrder" : "https://schema.org/InStock";
  const schemaProducto = {
    "@type": "Product",
    "@id": abs(ruta) + "#producto",
    name: p.nombre,
    description: p.descripcion,
    sku: p.id,
    category: cat.nombre,
    brand: { "@type": "Brand", name: "Albora" },
    image: fotos.length ? fotos.map(abs) : [abs("/img/og-imagen.jpg")],
    url: abs(ruta),
  };
  // Google pide precio para mostrar la oferta: se agrega solo cuando el producto tiene precio cargado.
  if (conPrecio) {
    schemaProducto.offers = {
      "@type": "Offer",
      price: n,
      priceCurrency: "ARS",
      availability: disponibilidad,
      url: abs(ruta),
      seller: { "@type": "Organization", name: "Albora" },
    };
  }

  const ogExtra = conPrecio
    ? `  <meta property="product:price:amount" content="${n}">\n  <meta property="product:price:currency" content="ARS">\n`
    : "";
  const desc = String(p.descripcion || "").trim();
  const descCorta = desc.length > 150 ? desc.slice(0, 147).replace(/\s+\S*$/, "") + "…" : desc;

  const contenido = `
  <section class="seccion seccion--producto">
    <div class="contenedor">
      ${htmlMigas}
      <div class="producto">
        ${galeria}
        <div class="producto__info">
          <a class="etiqueta producto__categoria" href="/almacen/${cat.id}/">${esc(cat.nombre)}</a>
          <h1 class="producto__nombre">${esc(p.nombre)}</h1>
          <p class="producto__precio">${esc(estadoPrecio(p))}</p>
          <div class="producto__descripcion">
            ${desc.split(/\n+/).map((par) => `<p>${esc(par)}</p>`).join("\n            ")}
          </div>${selectorVariantes}
          ${notas.join("\n          ")}
          <div class="producto__acciones">
            <a class="boton boton--lleno boton--ancho" href="${base}${encodeURIComponent(mensaje)}" target="_blank" rel="noopener" data-evento="lo_quiero" data-ubicacion="producto" data-producto="${esc(p.nombre)}" data-articulo="${esc(articulo(p))}" data-variante="${esc(v0)}" data-base="${base}" data-modo="${conPrecio && !sinStock ? "quiero" : "consultar"}">
              <svg aria-hidden="true"><use href="#i-whatsapp"/></svg> ${esc(etiqueta)}
            </a>${pago}
            <button class="enlace producto__compartir" type="button" data-compartir data-url="${abs(ruta)}" data-titulo="${esc(p.nombre)}" data-producto="${esc(p.nombre)}">
              <svg aria-hidden="true"><use href="#i-compartir"/></svg> <span class="texto">Compartir</span>
            </button>
          </div>
          <ul class="producto__detalles">
            <li><span class="detalle">hecho con calma</span> Coordinamos el pago y la entrega por WhatsApp.</li>
            <li><span class="detalle">retiro o envío</span> Retiro en City Bell. <!-- [FALTA: ¿hace envíos? ¿a dónde y con qué costo?] --> Consultá por envíos.</li>
            <li><span class="detalle">cambios</span> <a href="/cambios/">Ver cambios y devoluciones</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="seccion seccion--relacionados">
    <div class="contenedor">
      <div class="encabezado-seccion encabezado-seccion--fila">
        <h2 class="titulo-seccion titulo-seccion--chico">También te puede <em>gustar</em></h2>
        <a class="enlace" href="/almacen/">Ver todo <span aria-hidden="true">→</span></a>
      </div>
      <ul class="productos">
${relacionados.map(tarjeta).join("\n")}
      </ul>
    </div>
  </section>`;

  return pagina({
    ruta,
    titulo: `${p.nombre} · ${cat.nombre} | Almacén Albora, City Bell`,
    descripcion: `${descCorta} ${estadoPrecio(p)}. Almacén Albora, City Bell, La Plata.`.replace(/\s+/g, " ").trim(),
    ogTitulo: `${p.nombre} · ${estadoPrecio(p)}`,
    ogDescripcion: descCorta,
    ogImagen: fotos[0] ? "/" + fotos[0] : null,
    ogImagenAlt: `${p.nombre} de Albora`,
    ogTipo: "product",
    ogExtra,
    precargar: fotos[0] ? `  <link rel="preload" as="image" href="/${esc(fotos[0])}" fetchpriority="high">\n` : "",
    schema: [schemaProducto, schemaMigas],
    contenido,
  });
}

// ---------- 2. Página de categoría ----------
const SEO_CATEGORIA = {
  practica: { titulo: "Almohadón y puff de meditación, bolso para el mat", clave: "almohadón de meditación, puff de meditación, bolso para el mat y antifaz de lavanda" },
  rituales: { titulo: "Mates y yerbero artesanal", clave: "mates, yerbero artesanal y objetos de nuestras tradiciones" },
  hogar: { titulo: "Cortinas y deco para el hogar", clave: "cortinas para el hogar y el baño, almohadones y deco con colores de la tierra" },
};

function paginaCategoria(c) {
  const ruta = `/almacen/${c.id}/`;
  const lista = productos.filter((p) => p.categoria === c.id);
  const seo = SEO_CATEGORIA[c.id] || { titulo: c.nombre, clave: c.bajada };
  const { html: htmlMigas, schema: schemaMigas } = migas([
    { nombre: "Inicio", url: "/" }, { nombre: "Almacén", url: "/almacen/" }, { nombre: c.nombre, url: ruta },
  ]);
  const contenido = `
  <section class="seccion cabecera-pagina">
    <div class="contenedor">
      ${htmlMigas}
      <div class="cabecera-pagina__fila">
        <div>
          <span class="etiqueta">El almacén · ${String(categorias.indexOf(c) + 1).padStart(2, "0")}</span>
          <h1 class="titulo-pagina">${esc(c.nombre)}</h1>
          <p class="lead">${esc(c.bajada)}</p>
        </div>
${c.foto ? `        <div class="cabecera-pagina__foto"><img src="/${esc(c.foto)}" alt="" width="640" height="800" fetchpriority="high"></div>\n` : ""}      </div>
      ${pestanas(c.id, false)}
    </div>
  </section>

  <section class="seccion seccion--grilla">
    <div class="contenedor">
      <h2 class="visually-hidden">Productos</h2>
      <ul class="productos">
${lista.length ? lista.map(tarjeta).join("\n") : `        <li class="vacio detalle">muy pronto, productos nuevos.</li>`}
      </ul>
    </div>
  </section>
${ayuda("categoria_" + c.id)}`;

  return pagina({
    ruta,
    titulo: `${c.nombre}: ${seo.titulo} | Almacén Albora, City Bell`,
    descripcion: `${c.bajada} En el almacén de Albora: ${seo.clave}. City Bell, La Plata.`,
    ogTitulo: `${c.nombre} · Almacén Albora`,
    ogDescripcion: c.bajada,
    schema: [schemaMigas, {
      "@type": "CollectionPage", name: c.nombre, url: abs(ruta),
      hasPart: lista.map((p) => ({ "@type": "Product", name: p.nombre, url: abs(`/producto/${p.id}/`) })),
    }],
    contenido,
  });
}

// ---------- 3. Almacén completo ----------
function paginaAlmacen() {
  const { html: htmlMigas, schema: schemaMigas } = migas([{ nombre: "Inicio", url: "/" }, { nombre: "Almacén", url: "/almacen/" }]);
  const contenido = `
  <section class="seccion cabecera-pagina">
    <div class="contenedor">
      ${htmlMigas}
      <div class="cabecera-pagina__fila cabecera-pagina__fila--solo">
        <div>
          <span class="etiqueta">El almacén</span>
          <h1 class="titulo-pagina">Para habitar <em>la</em> calma</h1>
          <p class="lead">Objetos simples para tu práctica, tus rituales y tu casa. Elegí el que te guste y escribime por WhatsApp: lo coordinamos.</p>
        </div>
      </div>
      ${pestanas("todo", true)}
    </div>
  </section>

  <section class="seccion seccion--grilla">
    <div class="contenedor">
      <h2 class="visually-hidden">Productos</h2>
      <ul class="productos" aria-live="polite">
${productos.map(tarjeta).join("\n")}
      </ul>
    </div>
  </section>
${ayuda("almacen")}`;
  return pagina({
    ruta: "/almacen/",
    titulo: "Almacén Albora: almohadones de meditación, mates y yerberos artesanales | City Bell",
    descripcion: "Objetos para tu práctica, tus rituales y tu hogar: almohadón y puff de meditación, bolso para el mat, mates, yerbero artesanal y cortinas. City Bell, La Plata.",
    ogTitulo: "El almacén de Albora",
    ogDescripcion: "Objetos simples para tu práctica, tus rituales y tu casa.",
    schema: [schemaMigas, {
      "@type": "CollectionPage", name: "Almacén Albora", url: abs("/almacen/"),
      hasPart: productos.map((p) => ({ "@type": "Product", name: p.nombre, url: abs(`/producto/${p.id}/`) })),
    }],
    contenido,
  });
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

// ---------- Escribir todo ----------
// Borra páginas de productos que ya no están en productos.json (solo las generadas por este script)
const dirProductos = path.join(RAIZ, "producto");
if (fs.existsSync(dirProductos)) {
  for (const d of fs.readdirSync(dirProductos)) {
    const f = path.join(dirProductos, d, "index.html");
    if (!productos.some((p) => p.id === d) && fs.existsSync(f) && fs.readFileSync(f, "utf8").includes(MARCA)) {
      fs.rmSync(path.join(dirProductos, d), { recursive: true });
      console.log(`Borrada: /producto/${d}/ (ya no está en productos.json)`);
    }
  }
}

productos.forEach((p) => escribir(`producto/${p.id}/index.html`, paginaProducto(p)));
categorias.forEach((c) => escribir(`almacen/${c.id}/index.html`, paginaCategoria(c)));
escribir("almacen/index.html", paginaAlmacen());

let cambios = 0;
for (const ruta of paginasHtml()) {
  const antes = fs.readFileSync(ruta, "utf8");
  let html = antes;
  html = reemplazarBloque(html, "encabezado", completar(plantilla("encabezado.html"), ruta));
  html = reemplazarBloque(html, "pie", completar(plantilla("pie.html"), ruta));
  html = reemplazarBloque(html, "destacados", productos.filter((p) => p.destacado).slice(0, 4).map(tarjeta).join("\n"));
  if (html !== antes) { fs.writeFileSync(ruta, html); cambios++; }
}

// ---------- 6. Sitemap ----------
const hoy = new Date().toISOString().slice(0, 10);
const urls = ["/", "/almacen/"]
  .concat(categorias.map((c) => `/almacen/${c.id}/`))
  .concat(productos.map((p) => `/producto/${p.id}/`))
  .concat(["/yoga/", "/nosotros/", "/cambios/", "/privacidad/"]);
fs.writeFileSync(path.join(RAIZ, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generado por generar.js. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${abs(u)}</loc><lastmod>${hoy}</lastmod></url>`).join("\n")}
</urlset>
`);

console.log(`Listo: ${productos.length} productos, ${categorias.length} categorías, ${cambios} página(s) actualizada(s), sitemap con ${urls.length} direcciones.`);
