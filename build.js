// Genera el sitio estático en la carpeta dist/ a partir de config.json y data/*.json.
// Uso: node build.js
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const leer = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const cfg = leer("config.json");
const fuentes = leer("data/fuentes.json");
const contenido = leer("data/contenido.json");
const guias = leer("data/guias.json");
const palabras = leer("data/palabras.json");

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function adSlot(id) {
  if (!cfg.ads || !cfg.ads.enabled) return "";
  return '<div class="ad-slot" data-slot="' + esc(id) + '">' + ((cfg.ads.codes && cfg.ads.codes[id]) || "") + "</div>";
}

function urlAbsoluta(ruta) {
  return cfg.dominio ? cfg.dominio.replace(/\/$/, "") + "/" + ruta : "";
}

// base: prefijo relativo hacia la raíz ("" en inicio, "../../" en fuentes/<slug>/)
function pagina({ titulo, descripcion, ruta, base, cuerpo, aviso }) {
  const canonical = urlAbsoluta(ruta);
  return `<!doctype html>
<html lang="${esc(cfg.idioma)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ""}
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Public+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${base}style.css">
${cfg.analyticsSnippet || ""}
</head>
<body>
<div class="topbar"><div class="wrap">
  <a class="brand" href="${base}index.html">${esc(cfg.nombre)}</a>
  <nav class="nav" aria-label="Principal">
    <a href="${base}index.html#basico">Lo básico</a>
    <a href="${base}revisor/index.html">Revisor</a>
    <a href="${base}index.html#fuentes">Fuentes</a>
    <a href="${base}index.html#guias">Guías</a>
    <a href="${base}index.html#glosario">Glosario</a>
    <a href="${esc(cfg.feedbackUrl)}" target="_blank" rel="noopener">Dar tu opinión</a>
  </nav>
</div></div>
${cuerpo}
<footer class="footer"><div class="wrap">
  <p class="disclaimer">${aviso || `Resumen armado el ${esc(cfg.fechaVerificacion)} a partir de las páginas de licencia o ayuda de cada sitio, salvo TikTok, que figura como pendiente de verificar. Los pasos y el idioma se comprobaron mirando cada sitio ese mismo día; pueden cambiar. Es una guía y no reemplaza los términos de cada servicio ni un consejo legal: las licencias pueden cambiar y algunas pistas tienen condiciones propias.`}</p>
</div></footer>
<script src="${base}app.js" defer></script>
</body>
</html>
`;
}

function cta() {
  return `<section class="cta">
    <h2>¿Te sirvió esta guía?</h2>
    <p class="lead">Es una página de prueba. Decinos en dos minutos si te ayudó y qué te faltó, y así la mejoramos con lo que realmente necesita quien sube videos.</p>
    <div class="actions">
      <a class="btn" href="${esc(cfg.feedbackUrl)}" target="_blank" rel="noopener">Contanos si te sirvió (2 minutos)</a>
      <a class="btn alt" href="${esc(cfg.encuestaUrl)}" target="_blank" rel="noopener">Responder la encuesta larga (5 minutos)</a>
    </div>
  </section>`;
}

function tarjeta(f, base) {
  const guia = f.pagina
    ? `<a class="btn alt" href="${base}fuentes/${esc(f.slug)}/index.html">Guía completa</a>`
    : "";
  return `<article class="card" data-tipo="${esc(f.tipo)}">
      <div class="card-top">
        <div><div class="kind">${esc(f.tipo)}</div><h3>${esc(f.nombre)}</h3></div>
        <span class="badge ${esc(f.badge.clase)}">${esc(f.badge.texto)}</span>
      </div>
      <div class="rows">
        <div><b>Qué permite</b><span>${esc(f.permite)}</span></div>
        <div><b>Ojo con</b><span>${esc(f.ojo)}</span></div>
      </div>
      <p class="lang">Idioma: ${esc(f.idioma)}</p>
      <div class="card-foot">
        <span class="verified">Fuente: ${esc(f.verificado)}</span>
        <div class="links">${guia}<a class="btn" href="${esc(f.url)}" target="_blank" rel="noopener">Abrir sitio</a></div>
      </div>
    </article>`;
}

function inicio() {
  const tipos = ["Todo"].concat([...new Set(fuentes.map((f) => f.tipo))]);
  const basico = contenido.basico
    .map((b) => {
      const cuerpo = b.lista
        ? b.lista.map((l) => `<p><b>${esc(l[0])}</b> ${esc(l[1])}</p>`).join("")
        : `<p>${esc(b.texto)}</p>`;
      return `<article class="card"><h3>${esc(b.titulo)}</h3>${cuerpo}</article>`;
    })
    .join("\n      ");
  const gloss = contenido.glosario
    .map((g) => `<div><dt>${esc(g[0])}</dt><dd>${esc(g[1])}</dd></div>`)
    .join("");
  const pasos = contenido.checklist
    .map((p, i) => `<label class="check"><input type="checkbox" id="paso-${i}"><span>${esc(p)}</span></label>`)
    .join("\n      ");
  const filtros = tipos
    .map((t) => `<button type="button" class="chip" data-filtro="${esc(t)}" aria-pressed="${t === "Todo"}">${esc(t)}</button>`)
    .join("");

  const cuerpo = `<main class="wrap stack">
  <header class="hero">
    <span class="eyebrow">Guía para quienes suben videos</span>
    <h1>${esc(cfg.nombre)} para TikTok</h1>
    <p class="lead">${esc(cfg.lema)}. Cada ficha dice qué permite la licencia en palabras simples, en qué idioma está el sitio y cómo usarlo paso a paso.</p>
  </header>

  <section class="feature">
    <h2>Probá el revisor de texto</h2>
    <p>Pegá la descripción o el guion de tu video y marcamos palabras y temas que suelen ser delicados en las plataformas. Se revisa en tu navegador y no guardamos lo que pegás.</p>
    <a class="btn" href="revisor/index.html">Revisar mi texto</a>
  </section>

  <section id="basico" style="display:flex;flex-direction:column;gap:16px">
    <h2>Lo básico, en un minuto</h2>
    <div class="grid">
      ${basico}
    </div>
    <p class="lead">Si tu cuenta gana plata o promociona un producto, evitá todo lo que diga "no comercial".</p>
  </section>

  <section class="notice">
    <h2>Antes de elegir: la regla de TikTok para cuentas que promocionan</h2>
    <p>${esc(contenido.avisoTiktok)}</p>
  </section>

  <section id="fuentes" style="display:flex;flex-direction:column;gap:16px">
    <h2>Dónde buscar</h2>
    <div class="filters" role="group" aria-label="Filtrar por tipo">${filtros}</div>
    <div class="grid">
      ${fuentes.map((f) => tarjeta(f, "")).join("\n      ")}
    </div>
  </section>

  ${adSlot("inicio-medio")}

  <section id="guias" style="display:flex;flex-direction:column;gap:16px">
    <h2>Guías para entender las licencias</h2>
    <div class="grid">
      ${guias.map((g) => `<article class="card"><h3>${esc(g.titulo)}</h3><p>${esc(g.resumen)}</p><div class="card-foot"><a class="btn" href="guias/${esc(g.slug)}/index.html">Leer la guía</a></div></article>`).join("\n      ")}
    </div>
  </section>

  <section id="glosario" style="display:flex;flex-direction:column;gap:16px">
    <h2>Palabras que vas a ver en inglés</h2>
    <dl class="gloss">${gloss}</dl>
  </section>

  <section class="checklist">
    <h2>Antes de subir el video</h2>
    <div id="pasos" style="display:flex;flex-direction:column;gap:12px">
      ${pasos}
    </div>
    <p class="progress" id="avance"></p>
  </section>

  ${cta()}
</main>`;
  return pagina({
    titulo: cfg.nombre + " para TikTok: música, sonidos e imágenes con licencia clara",
    descripcion: cfg.lema + ". Guía en español con pasos, glosario y qué revisar antes de subir tu video.",
    ruta: "index.html",
    base: "",
    cuerpo,
  });
}

function paginaFuente(f) {
  const otras = fuentes
    .filter((o) => o.pagina && o.slug !== f.slug)
    .map((o) => `<li><a href="../${esc(o.slug)}/index.html">${esc(o.nombre)}</a></li>`)
    .join("");
  const pasos = f.pasos && f.pasos.length
    ? `<h2>Cómo usarlo, paso a paso</h2><ol class="steps">${f.pasos.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>`
    : "";
  const cuerpo = `<main class="wrap stack">
  <header class="hero">
    <p class="crumbs"><a href="../../index.html">Inicio</a> / ${esc(f.tipo)}</p>
    <h1>${esc(f.tituloSeo || "Cómo usar " + f.nombre)}</h1>
    <p class="lead">${esc(f.descripcionSeo || f.permite)}</p>
    <div><span class="badge ${esc(f.badge.clase)}">${esc(f.badge.texto)}</span></div>
  </header>

  <section class="panel">
    <h2>Qué permite</h2>
    <p>${esc(f.permite)}</p>
    <h2>Ojo con</h2>
    <p>${esc(f.ojo)}</p>
    <p class="lang">Idioma: ${esc(f.idioma)} Fuente: ${esc(f.verificado)}.</p>
  </section>

  <section style="display:flex;flex-direction:column;gap:12px">
    ${pasos}
    <div class="actions"><a class="btn" href="${esc(f.url)}" target="_blank" rel="noopener">Abrir ${esc(f.nombre)}</a></div>
  </section>

  ${adSlot("fuente-medio")}

  <section style="display:flex;flex-direction:column;gap:12px">
    <h2>Otras fuentes</h2>
    <ul class="more">${otras}</ul>
  </section>

  ${cta()}
</main>`;
  return pagina({
    titulo: (f.tituloSeo || "Cómo usar " + f.nombre) + " | " + cfg.nombre,
    descripcion: f.descripcionSeo || f.permite,
    ruta: "fuentes/" + f.slug + "/index.html",
    base: "../../",
    cuerpo,
  });
}

function paginaGuia(g) {
  const bloques = g.bloques
    .map((b) => {
      let h = "";
      if (b.h2) h += `<h2>${esc(b.h2)}</h2>`;
      if (b.p) h += b.p.map((t) => `<p>${esc(t)}</p>`).join("");
      if (b.puntos) h += `<ul class="steps">${b.puntos.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
      if (b.lista) {
        h += `<ul class="steps">${b.lista
          .map((it) => {
            const slug = it[0];
            const texto = it[1];
            const i = texto.indexOf(": ");
            const nombre = i > 0 ? texto.slice(0, i) : texto;
            const resto = i > 0 ? texto.slice(i) : "";
            return `<li><a href="../../fuentes/${esc(slug)}/index.html">${esc(nombre)}</a>${esc(resto)}</li>`;
          })
          .join("")}</ul>`;
      }
      return `<section class="panel">${h}</section>`;
    })
    .join("\n  ");
  const otras = guias
    .filter((o) => o.slug !== g.slug)
    .map((o) => `<li><a href="../${esc(o.slug)}/index.html">${esc(o.titulo)}</a></li>`)
    .join("");
  const cuerpo = `<main class="wrap stack">
  <header class="hero">
    <p class="crumbs"><a href="../../index.html">Inicio</a> / Guías</p>
    <h1>${esc(g.titulo)}</h1>
    <p class="lead">${esc(g.descripcion)}</p>
  </header>

  ${bloques}

  ${adSlot("fuente-medio")}

  <section style="display:flex;flex-direction:column;gap:12px">
    <h2>Otras guías</h2>
    <ul class="more">${otras}</ul>
  </section>

  ${cta()}
</main>`;
  return pagina({
    titulo: g.titulo + " | " + cfg.nombre,
    descripcion: g.descripcion,
    ruta: "guias/" + g.slug + "/index.html",
    base: "../../",
    cuerpo,
  });
}

function paginaRevisor() {
  const datos = JSON.stringify(palabras).replace(/</g, "\\u003c");
  const cuerpo = `<main class="wrap stack">
  <header class="hero">
    <span class="eyebrow">Versión de prueba</span>
    <h1>Revisor de texto para tus videos</h1>
    <p class="lead">Pegá la descripción, el guion o los hashtags de tu video. Marcamos palabras y temas que suelen ser delicados en las plataformas. Se revisa en tu navegador: no guardamos ni enviamos lo que pegás.</p>
  </header>

  <section class="notice">
    <h2>Lo que sí y lo que no hace</h2>
    <p>Es una lista armada por nosotros, no una lista oficial de TikTok. Que no marque nada no garantiza que tu video no tenga problemas, y que marque algo no significa que lo vayan a penalizar. Sirve para que revises antes de subir. Todavía no revisa la música.</p>
  </section>

  <section class="tool">
    <label for="texto">Texto de tu video</label>
    <textarea id="texto" placeholder="Pegá acá la descripción, el guion o los hashtags"></textarea>
    <div class="actions">
      <button type="button" class="btn" id="revisar">Revisar</button>
      <button type="button" class="btn alt" id="ejemplo">Probar con un ejemplo</button>
      <button type="button" class="btn alt" id="limpiar">Borrar</button>
    </div>
    <div id="resultado" aria-live="polite"></div>
  </section>

  <section class="cta">
    <h2>¿Te sirvió el revisor?</h2>
    <p class="lead">Decinos en dos minutos qué marcó bien, qué marcó de más y qué le falta.</p>
    <div class="actions"><a class="btn" href="${esc(cfg.feedbackUrl)}" target="_blank" rel="noopener">Contanos si te sirvió (2 minutos)</a></div>
  </section>
  <script type="application/json" id="palabras">${datos}</script>
</main>
<script src="../revisor.js" defer></script>`;
  return pagina({
    titulo: "Revisor de texto para videos de TikTok | " + cfg.nombre,
    descripcion: "Pegá la descripción o el guion de tu video y mirá qué palabras y temas suelen ser delicados antes de subirlo. Gratis y en tu navegador.",
    ruta: "revisor/index.html",
    base: "../",
    cuerpo,
    aviso: "Herramienta de prueba. La lista de palabras la armamos nosotros, no es oficial de TikTok y puede tener errores. No reemplaza las normas de la comunidad de cada plataforma.",
  });
}

// --- salida ---
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(root, "src/style.css"), path.join(dist, "style.css"));
fs.copyFileSync(path.join(root, "src/app.js"), path.join(dist, "app.js"));
fs.copyFileSync(path.join(root, "src/revisor.js"), path.join(dist, "revisor.js"));
fs.writeFileSync(path.join(dist, "index.html"), inicio());

const rutas = ["index.html", "revisor/index.html"];
fs.mkdirSync(path.join(dist, "revisor"), { recursive: true });
fs.writeFileSync(path.join(dist, "revisor", "index.html"), paginaRevisor());
fuentes.filter((f) => f.pagina).forEach((f) => {
  const dir = path.join(dist, "fuentes", f.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), paginaFuente(f));
  rutas.push("fuentes/" + f.slug + "/index.html");
});

guias.forEach((g) => {
  const dir = path.join(dist, "guias", g.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), paginaGuia(g));
  rutas.push("guias/" + g.slug + "/index.html");
});

if (cfg.dominio) {
  const urls = rutas.map((r) => `  <url><loc>${esc(urlAbsoluta(r))}</loc></url>`).join("\n");
  fs.writeFileSync(
    path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${urlAbsoluta("sitemap.xml")}\n`);
} else {
  fs.writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nAllow: /\n");
}

console.log("Listo: " + rutas.length + " páginas en " + dist);
