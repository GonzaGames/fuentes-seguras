(function () {
  // Filtro de fuentes por tipo. Sin JavaScript, todas las fichas siguen visibles.
  var chips = document.querySelectorAll("[data-filtro]");
  var cards = document.querySelectorAll("[data-tipo]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var valor = chip.getAttribute("data-filtro");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      cards.forEach(function (card) {
        card.hidden = !(valor === "Todo" || card.getAttribute("data-tipo") === valor);
      });
    });
  });

  // Lista de pasos antes de subir: cuenta cuántos se tildaron.
  var avance = document.getElementById("avance");
  var checks = document.querySelectorAll("#pasos input");
  function contar() {
    if (!avance) return;
    var hechos = document.querySelectorAll("#pasos input:checked").length;
    avance.textContent = hechos + " de " + checks.length + " revisados";
  }
  checks.forEach(function (c) { c.addEventListener("change", contar); });
  contar();
})();
