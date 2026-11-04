(function () {
  var datos = JSON.parse(document.getElementById("palabras").textContent);
  var ta = document.getElementById("texto");
  var out = document.getElementById("resultado");
  var btn = document.getElementById("revisar");
  var ej = document.getElementById("ejemplo");
  var limpiar = document.getElementById("limpiar");

  // Pasa a minúsculas y quita acentos, conservando la ñ. Cada carácter da un carácter,
  // así los índices del texto normalizado coinciden con los del texto original.
  function norm(s) {
    var r = "";
    for (var i = 0; i < s.length; i++) {
      var l = s[i].toLowerCase();
      if (l === "ñ") { r += "ñ"; continue; }
      var b = l.normalize("NFD").replace(/[̀-ͯ]/g, "");
      r += b.length ? b.charAt(0) : l;
    }
    return r;
  }
  function escapar(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Un patrón por palabra. Un * al final acepta cualquier terminación (droga*, droga, drogas, drogarse).
  var patrones = [];
  datos.categorias.forEach(function (cat) {
    cat.palabras.forEach(function (p) {
      var comodin = p.charAt(p.length - 1) === "*";
      var base = norm(comodin ? p.slice(0, -1) : p);
      var cuerpo = escapar(base).replace(/ +/g, "\\s+") + (comodin ? "[a-zñ]*" : "");
      patrones.push({
        cat: cat,
        palabra: comodin ? p.slice(0, -1) : p,
        re: new RegExp("(^|[^a-z0-9ñ])(" + cuerpo + ")(?![a-z0-9ñ])", "g")
      });
    });
  });

  function buscar(texto) {
    var n = norm(texto);
    var hallazgos = [];
    patrones.forEach(function (p) {
      p.re.lastIndex = 0;
      var m;
      while ((m = p.re.exec(n)) !== null) {
        var inicio = m.index + m[1].length;
        hallazgos.push({ inicio: inicio, fin: inicio + m[2].length, cat: p.cat, palabra: p.palabra });
        if (m[0].length === 0) p.re.lastIndex++;
      }
    });
    hallazgos.sort(function (a, b) { return a.inicio - b.inicio || (b.fin - b.inicio) - (a.fin - a.inicio); });
    var limpios = [];
    hallazgos.forEach(function (h) {
      var ult = limpios[limpios.length - 1];
      if (!ult || h.inicio >= ult.fin) limpios.push(h);
    });
    return limpios;
  }

  function el(tag, cls, texto) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function mostrar() {
    var texto = ta.value;
    out.textContent = "";
    if (!texto.trim()) {
      out.appendChild(el("p", "lead", "Pegá primero el texto de tu video: la descripción, el guion o los hashtags."));
      return;
    }
    var hallazgos = buscar(texto);

    var vista = el("div", "texto-marcado");
    var pos = 0;
    hallazgos.forEach(function (h) {
      if (h.inicio > pos) vista.appendChild(document.createTextNode(texto.slice(pos, h.inicio)));
      var mk = el("mark", "marca", texto.slice(h.inicio, h.fin));
      mk.title = h.cat.nombre;
      vista.appendChild(mk);
      pos = h.fin;
    });
    if (pos < texto.length) vista.appendChild(document.createTextNode(texto.slice(pos)));

    if (!hallazgos.length) {
      out.appendChild(el("h2", null, "No encontramos palabras de nuestra lista"));
      out.appendChild(el("p", null, "Eso no garantiza nada: la lista es corta y no es oficial de TikTok. Revisá igual las normas de la comunidad y la música que vas a usar."));
      out.appendChild(vista);
      return;
    }

    var porCat = {};
    hallazgos.forEach(function (h) {
      (porCat[h.cat.id] = porCat[h.cat.id] || { cat: h.cat, palabras: [] });
      var ya = porCat[h.cat.id].palabras;
      var visible = texto.slice(h.inicio, h.fin).toLowerCase();
      if (ya.indexOf(visible) === -1) ya.push(visible);
    });
    var cats = Object.keys(porCat);
    out.appendChild(el("h2", null, hallazgos.length + (hallazgos.length === 1 ? " palabra marcada" : " palabras marcadas") + " en " + cats.length + (cats.length === 1 ? " tema" : " temas")));
    out.appendChild(vista);
    var lista = el("div", "hallazgos");
    cats.forEach(function (id) {
      var g = porCat[id];
      var c = el("article", "card");
      c.appendChild(el("h3", null, g.cat.nombre));
      c.appendChild(el("p", "lang", "Marcadas: " + g.palabras.join(", ")));
      c.appendChild(el("p", null, g.cat.aviso));
      c.appendChild(el("p", null, g.cat.sugerencia));
      lista.appendChild(c);
    });
    out.appendChild(lista);
  }

  btn.addEventListener("click", mostrar);
  ej.addEventListener("click", function () { ta.value = datos.ejemplo; mostrar(); });
  limpiar.addEventListener("click", function () { ta.value = ""; out.textContent = ""; ta.focus(); });
})();
