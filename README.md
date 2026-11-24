# Albora · yoga, campo y ritual

Web de Albora (@albora.argentina), la marca de Paloma Asprella en City Bell, La Plata. Sitio estático (HTML, CSS y JS), listo para Netlify y armado sobre la base de la web de ADL. Nivel **web completa**: falta el ID de Tag Manager en `js/config.js`.

> **Estado:** todas las páginas terminadas, con **textos provisorios** y las **fotos que había en `material/`** (mockups y texturas del brandbook). Faltan las fotos reales, los precios y algunos datos (ver "Qué reemplazar").

## Páginas

| URL | Archivo | Qué tiene |
| --- | --- | --- |
| `/` | `index.html` | Hero, almacén (categorías y destacados), qué es Albora, quién soy, yoga, Instagram |
| `/almacen/` | generada | Todos los productos, con filtro por categoría (botones) |
| `/almacen/practica/`, `/rituales/`, `/hogar/` | generadas | Una página por categoría |
| `/producto/<id>/` | generadas | Una página por producto: fotos, precio, variantes, "Lo quiero", link de pago y "Compartir" |
| `/yoga/` | `yoga/index.html` | Clases, encuentros y retiros (estos dos, "próximamente") |
| `/nosotros/` | `nosotros/index.html` | Propósito, manifiesto, origen, valores y la historia de Paloma |
| `/cambios/` | `cambios/index.html` | Cambios, devoluciones y botón de arrepentimiento (modelo para revisar) |
| `/privacidad/` | `privacidad/index.html` | Política de privacidad |
| (cualquier otra) | `404.html` | Página no encontrada |

Las páginas **generadas** las arma `generar.js` a partir de `productos.json`. No se editan a mano: cualquier cambio se pisa la próxima vez que se generan.

## Cómo agregar o cambiar un producto (paso a paso, sin programar)

Todo lo de los productos está en **un solo archivo: `productos.json`**. Se puede editar desde la misma página de GitHub (abrir el archivo → ícono del lápiz → editar → "Commit changes"). Netlify se entera solo, vuelve a armar la web y en un par de minutos el cambio está publicado.

1. **Subí las fotos** a la carpeta `img/productos/` (en GitHub: entrar a la carpeta → "Add file" → "Upload files").
   - Cuadradas (1000 × 1000), en WebP o JPG, de menos de 200 KB cada una. Para convertirlas y achicarlas sirve [squoosh.app](https://squoosh.app).
   - Nombre en minúsculas, sin espacios ni tildes: `almohadon-crudo-1.webp`, `almohadon-crudo-2.webp`.
   - Mejor si se ven lindas en casa, en el living, y no solo en clase.
2. **Abrí `productos.json`** y copiá un producto entero, desde la `{` hasta la `}`. Pegalo después del último y **poné una coma** entre los dos.
3. **Completá los datos:**

```json
{
  "id": "almohadon-crudo",
  "nombre": "Almohadón de meditación crudo",
  "articulo": "el",
  "categoria": "practica",
  "precio": 28000,
  "descripcion": "Texto corto, cálido, en el tono de Albora.",
  "fotos": ["img/productos/almohadon-crudo-1.webp", "img/productos/almohadon-crudo-2.webp"],
  "variantes": ["Crudo", "Terracota"],
  "stock": true,
  "por_encargo": false,
  "link_pago": "",
  "destacado": false
}
```

| Campo | Qué poner |
| --- | --- |
| `id` | La dirección de la página: `/producto/almohadon-crudo/`. En minúsculas, con guiones, sin tildes ni espacios. **No repetirlo** y no cambiarlo una vez publicado, porque el link que ya se compartió dejaría de funcionar. |
| `nombre` | Como se muestra en la web. |
| `articulo` | `"el"` o `"la"`, para el mensaje de WhatsApp ("Quiero **la** Cortina de baño…"). |
| `categoria` | `"practica"`, `"rituales"` o `"hogar"`. |
| `precio` | Un número sin puntos ni signo: `28000` se muestra como "$ 28.000". Si todavía no hay precio: `"Próximamente"` (con comillas). |
| `descripcion` | Dos o tres líneas. |
| `fotos` | Entre corchetes y con comillas, separadas por comas. La **primera** es la que se ve en la tarjeta y al compartir por WhatsApp o Instagram. Si queda vacía (`[]`), la web muestra sola una tarjeta del color de la categoría con el isotipo. |
| `variantes` | Colores o modelos: `["Crudo", "Terracota"]`. Si no hay: `[]`. |
| `stock` | `true` (hay) o `false` (se muestra "Sin stock · Consultar"). |
| `por_encargo` | `true` muestra "Por encargo". |
| `link_pago` | El link de pago de Mercado Pago de ese producto, entre comillas. Si está vacío (`""`), no aparece el botón. |
| `destacado` | `true` para que aparezca en la home (se muestran los primeros 4). |

4. **Guardá** con "Commit changes". Si después de unos minutos la web no cambió, en Netlify → *Deploys* aparece el error: casi siempre es una coma o una comilla de más o de menos. [jsonlint.com](https://jsonlint.com) muestra dónde está.

**Botón principal:** con precio dice "Lo quiero" y abre WhatsApp con `Hola! Quiero el [producto] ([variante]) que vi en la web de Albora 🌾`. Sin precio ("Próximamente") dice "Consultar", y sin stock dice "Sin stock · Consultar".

**Cambiar un producto:** editar sus datos en `productos.json`. **Sacarlo:** borrar su bloque (y la coma que sobre); su página se borra sola. **Categorías:** el nombre y la bajada se cambian arriba de todo en `productos.json`.

## Qué reemplazar cuando llegue el contenido

Buscá estos textos en todos los archivos (en VS Code: Ctrl+Shift+F):

| Buscar | Qué es |
| --- | --- |
| `FALTA` | Cada dato que falta, marcado en comentarios y en `/cambios/` (fotos, texto de Paloma, horarios, envíos, email, plazos de cambio) |
| `https://albora.com.ar` | Dominio provisorio. Cambiarlo en todos los archivos (también en `generar.js` y `robots.txt`) |
| `gtmId: ""` en `js/config.js` | ID de Tag Manager de la cuenta de Paloma |
| `Próximamente` en `productos.json` | Precios |
| `Hola, soy` (en `index.html` y `nosotros/index.html`) | Texto provisorio "quién soy" y "mi historia": reemplazarlo por el de Paloma |
| `Días y horarios a coordinar` (en `yoga/index.html`) | Días, horarios, lugar y valor de las clases |

El WhatsApp (`5492213627376`) está en `generar.js` (encabezado, pie, productos) y en los botones de clases de `index.html` y `yoga/index.html`.

## Fotos (`img/`)

Cada foto se reemplaza **con el mismo nombre de archivo**, sin tocar el HTML. WebP, menos de 200 KB, con la misma proporción (si no, se recorta sola).

| Archivo | Medida | Dónde | Hoy es |
| --- | --- | --- | --- |
| `hero.webp` / `hero-movil.webp` | 1920×1080 / 900×1125 | Portada de la home (compu / celular) | Campo dorado de los posts de Instagram |
| `categoria-practica.webp`, `-rituales`, `-hogar` | 640×800 | Tarjetas de categoría | Mockups del brandbook |
| `productos/<id>-1.webp` | 1000×1000 | Productos (se cambian desde `productos.json`) | Placeholder de color con el isotipo |
| `paloma.webp` | 900×1125 | Quién soy (home y Nosotros) | Sello. **[FALTA: foto de Paloma]** |
| `franja-campo.webp` / `-movil` | 1920×610 / 1000×640 | Franja "Habitar la tierra" (home) | Pastizal de `mockup-06` |
| `yoga-portada.webp` / `-movil` | 1920×612 / 900×1000 | Portada de Yoga | Pastizal |
| `yoga-clases.webp` | 640×800 | Clases (Yoga) | Mockup con postura de yoga |
| `nosotros-proposito.webp`, `nosotros-concepto.webp` | 640×800 | Nosotros | Logo en relieve, textura de crin |
| `instagram-1.webp` … `instagram-4.webp` | 600×750 | Bloque de Instagram | Posts de @albora.argentina |
| `og-imagen.jpg` | 1200×630 | Vista previa al compartir (todas menos productos) | Logo sobre el campo |
| Logos, `favicon-32.png`, `apple-touch-icon.png`, `icono-*.png`, `favicon.ico` | | Marca | Del Drive de Bene Studio (isotipo de favicon) |

`material/` es el material original de marca (brandbook, logos, fuentes y fotos). No se publica en la web, pero queda en el repo como referencia.

## Diseño

- **Colores:** solo los 7 del brandbook, como variables al principio de `css/styles.css`. Para texto se usa marrón sobre crema (6,6:1), oliva (5:1) y crema sobre bordó, marrón u oliva. Arena, rosa y beige quedan para fondos y detalles.
- **Tipografías** (en `fonts/`): Funnel Sans (textos y etiquetas), Baskervville Italic (detalles en minúscula) y **Cormorant Garamond en lugar de Cigars**, que es paga. Si compran la licencia web de Cigars: subir los `.woff2` a `fonts/`, sumar su `@font-face` y cambiar `--fuente-titulos` en `css/styles.css`.
- **Guarda pampa:** `img/guarda.svg`, dibujada sobre la geometría del isotipo. Se usa como franja fina en el manifiesto y en el pie.
- **Animaciones:** atributo `data-revelar` (aparece subiendo; `="aparecer"` solo se funde) y `style="--d:.2s"` para el retraso. Se desactivan si el visitante pidió "reducir movimiento".

## Medición (Tag Manager)

| Nivel | `js/config.js` | Qué pasa |
| --- | --- | --- |
| Web sola | `gtmId: ""` | Sin medición, sin aviso de cookies, sin "Configurar cookies" |
| Web completa | `gtmId: "GTM-XXXXXXX"` | Aviso de cookies. Tag Manager se carga solo si el visitante acepta |

Eventos que manda `js/main.js` (al `dataLayer`):

| Evento | Cuándo | Datos |
| --- | --- | --- |
| `clic_whatsapp` | Cualquier link a WhatsApp | `ubicacion` (encabezado, flotante, pie, home_yoga, yoga_clases, producto, almacen...) y `producto` si corresponde |
| `clic_lo_quiero` | "Lo quiero" / "Consultar" de un producto | `producto`, `variante` |
| `clic_compartir` | "Compartir" | `producto`, `metodo` (`menu_nativo` en celular, `copiar_link` en compu) |
| `clic_pago` | Link de Mercado Pago | `producto` |

Nunca pegar el código de Analytics, del Pixel de Meta ni de Google Ads directo en el HTML: van siempre dentro de Tag Manager, así respetan el aviso de cookies y no se cuenta nada doble.

## Publicar y conectar Google

### 1. Netlify
1. En [app.netlify.com](https://app.netlify.com) (idealmente con una cuenta a nombre de Paloma): *Add new site* → *Import an existing project* → GitHub → `albora-web`.
2. Rama: `main`. Lo demás ya viene de `netlify.toml` (build `node generar.js`, publicar `.`). *Deploy*.
3. Probar el link `*.netlify.app` en el celular y compartir un producto por WhatsApp para ver la vista previa.

### 2. Dominio
1. Registrar `albora.com.ar` en [nic.ar](https://nic.ar) (con la clave fiscal de Paloma).
2. Netlify → *Domain management* → *Add a domain* → `albora.com.ar`. En NIC Argentina, cargar como DNS delegados los 4 *nameservers* que da Netlify. El certificado HTTPS se activa solo.
3. Si el dominio es otro: reemplazar `https://albora.com.ar` en todos los archivos (ver "Qué reemplazar") y subir.

### 3. Google Tag Manager + Analytics 4 (a nombre de Paloma)
1. Con la cuenta de Google de Paloma, crear la propiedad en [analytics.google.com](https://analytics.google.com): *Administrar* → *Crear propiedad* (zona horaria Argentina, moneda ARS) → flujo de datos *Web* con el dominio. Copiar el ID `G-XXXXXXX`.
2. En [tagmanager.google.com](https://tagmanager.google.com), crear la cuenta "Albora" y el contenedor *Web*. Copiar el ID `GTM-XXXXXXX` y pegarlo en `js/config.js`.
3. En Tag Manager:
   - Etiqueta **Google tag** con el ID `G-XXXXXXX`, activador *Initialization - All Pages*.
   - Variables de capa de datos: `ubicacion`, `producto`, `variante`, `metodo`.
   - Por cada evento (`clic_whatsapp`, `clic_lo_quiero`, `clic_compartir`, `clic_pago`): activador *Evento personalizado* con ese nombre y etiqueta *Evento de GA4* con el mismo nombre y sus parámetros.
   - *Vista previa*, tocar los botones en la web y, si todo llega, *Enviar* → *Publicar*.
4. En Analytics: marcar `clic_lo_quiero`, `clic_whatsapp` y `clic_pago` como **eventos clave**, poner la retención de datos en 14 meses y excluir el tráfico interno. Si alguien más administra la web, sumarlo como administrador, sin sacar a Paloma como propietaria.
5. **Más adelante:** el Pixel de Meta y Google Ads se suman como etiquetas en el mismo Tag Manager, con los activadores de los eventos de arriba. Por ejemplo, `clic_lo_quiero` → evento *Lead* o *Contact* de Meta, o una conversión de Google Ads.

### 4. Google Search Console
1. En [search.google.com/search-console](https://search.google.com/search-console), *Agregar propiedad* → **Dominio** → `albora.com.ar`.
2. Verificar con el registro TXT que da Google: en Netlify → *Domains* → *DNS settings* → *Add new record* → TXT. Esperar unos minutos y *Verificar*.
3. *Sitemaps* → enviar `https://albora.com.ar/sitemap.xml`. Se actualiza solo cada vez que se suma un producto.
4. Con *Inspección de URLs*, pedir indexación de la home, `/almacen/` y `/yoga/`. En *Mejoras*, revisar que los productos y las migas de pan no tengan errores.

### 5. Perfil de Negocio en Google (Maps)
1. En [business.google.com](https://business.google.com) (cuenta de Paloma): *Agregar empresa* → "Albora".
2. Categoría principal: **Centro de yoga** (o *Instructor de yoga*). Secundaria: *Tienda de artículos para el hogar*.
3. Como da clases en su casa: elegir **no mostrar la dirección** y cargar el área de servicio (City Bell, La Plata, Gonnet, Villa Elisa).
4. Teléfono +54 9 221 362-7376, web `https://albora.com.ar`, horarios de clase y fotos lindas (logo, isotipo, clases, productos).
5. Verificar (Google suele pedir un video o una postal). Después, pedir reseñas a sus alumnas con el link para dejar reseñas.

## Antes de cada entrega

- Buscar `FALTA` y revisar qué sigue pendiente.
- Probar en celular y compu, pasar por [PageSpeed Insights](https://pagespeed.web.dev) (objetivo: más de 90 en móvil) y compartir un producto por WhatsApp.
- La política de privacidad y la de cambios son modelos generales: revisarlas con Paloma.
