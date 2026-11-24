# Albora · yoga, campo y ritual

Web de Albora (@albora.argentina), City Bell. Sitio estático (HTML, CSS y JS) listo para Netlify, armado sobre la base de la web de ADL.

> **Estado:** home terminada para aprobar, con textos provisorios y las fotos que había en `material/`. Faltan las páginas internas (almacén, producto, yoga, nosotros, privacidad, cambios y 404). El README completo, con la sección "Qué reemplazar" y los pasos de publicación, llega con esas páginas.

## Cómo funciona

- `productos.json`: **único archivo de productos** (nombre, categoría, precio, descripción, fotos, variantes, stock, por encargo, link de pago y destacado).
- `generar.js`: arma lo que sale de `productos.json` y pone el mismo encabezado y pie (carpeta `plantillas/`) en todas las páginas. Netlify lo corre solo en cada subida (ver `netlify.toml`), así que no hace falta correrlo a mano.
- `js/config.js`: `gtmId` vacío = "web sola", con ID = "web completa" (aviso de cookies y Tag Manager solo si se acepta).
- `js/main.js`: eventos `clic_whatsapp` (con `ubicacion`), `clic_lo_quiero`, `clic_compartir` y `clic_pago`, más el menú y las animaciones `data-revelar`.

## Fotos (`img/`)

Cada foto se reemplaza **con el mismo nombre de archivo**, sin tocar el HTML. Formato WebP, menos de 200 KB.

| Archivo | Medida | Qué es hoy |
| --- | --- | --- |
| `hero.webp` / `hero-movil.webp` | 1920×1080 / 900×1125 | Campo dorado (post de Instagram sin el texto) |
| `categoria-practica.webp`, `-rituales`, `-hogar` | 640×800 | Mockups del brandbook |
| `productos/<producto>-1.webp` | 1000×1000 | Placeholder con el isotipo y el nombre |
| `paloma.webp` | 900×1125 | Placeholder con el sello. **[FALTA: foto de Paloma]** |
| `franja-campo.webp` / `franja-campo-movil.webp` | 1920×610 / 1000×640 | Pastizal (de `mockup-06`) |
| `instagram-1.webp` … `instagram-4.webp` | 600×750 | Posts de @albora.argentina |
| `og-imagen.jpg` | 1200×630 | Vista previa al compartir |
