# Sitio base: Fuentes seguras para TikTok

Sitio estático en español. No usa librerías: solo Node.js para generarlo.

## Cómo se usa

1. Instalá Node.js si no lo tenés.
2. En esta carpeta, ejecutá `node build.js`.
3. Se crea la carpeta `dist/`. Ahí está el sitio listo. Abrí `dist/index.html` para verlo.

## Qué editar

- `config.json`: nombre del sitio, dominio, enlaces a los formularios, código de estadísticas y propagandas.
- `data/fuentes.json`: las fuentes. Para agregar una, copiá un bloque y cambiá los datos. Con `"pagina": true` se genera su página propia.
- `data/contenido.json`: textos de "Lo básico", aviso de TikTok, glosario y lista previa a subir.
- `src/style.css`: el diseño.

## Estadísticas y propagandas

- `analyticsSnippet`: pegá ahí el código de la herramienta de estadísticas que elijas. Se inserta en todas las páginas.
- `ads.enabled`: ponelo en `true` y pegá el código del anunciante en `ads.codes`. Hay un lugar reservado en el inicio y otro en cada página de fuente. Antes de activarlo, revisá las condiciones del servicio de propagandas que uses.

## Para publicarlo

Subí el contenido de `dist/` a cualquier hosting de archivos estáticos. Cuando tengas dominio, escribilo en `config.json` (por ejemplo `https://tudominio.com`) y volvé a correr `node build.js`: así se generan el mapa del sitio y las direcciones canónicas.

## Importante

Las fichas dicen qué se verificó y qué no. Antes de promocionar el sitio, volvé a revisar las licencias: pueden cambiar.
