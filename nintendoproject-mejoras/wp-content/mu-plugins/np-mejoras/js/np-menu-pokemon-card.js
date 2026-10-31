var NP = window.NP;
(function () {
  var card = document.querySelector("#np-nav .np-desktop-pokemon-card");
  if (!card || !window.NPMenuPokemon) return;
  var badge = card.querySelector(".np-pokemon-badge");
  var arrow = badge.querySelector(".np-badge-arrow");
  var lvl = card.querySelector(".np-pokemon-lvl");
  var circle = card.querySelector(".np-pokemon-circle");
  var img = card.querySelector(".np-pokemon-img");
  var POKEBALL = {
    name: "Elige tu Pokémon",
    img: NP.u("wp-content/uploads/2026/03/POKEBALL3D.webp"),
    color: "#0ab9e6",
  };
  var signature = "";
  function render() {
    var p = window.NPMenuPokemon.read();
    var status = window.NPMenuPokemon.care(p);
    var NIGHT = window.NPMenuPokemon.NIGHT;
    var sig =
      (p ? p.key + ":" + p.stage + ":" + p.level : "none") + ":" + status;
    if (sig === signature) return;
    signature = sig;
    var form = p ? p.form : POKEBALL;
    var rgb = [
      parseInt(form.color.slice(1, 3), 16),
      parseInt(form.color.slice(3, 5), 16),
      parseInt(form.color.slice(5, 7), 16),
    ];
    var light =
      "rgb(" +
      rgb
        .map(function (n) {
          return Math.min(255, n + 40);
        })
        .join(",") +
      ")";
    var dark =
      "rgb(" +
      rgb
        .map(function (n) {
          return Math.max(0, n - 50);
        })
        .join(",") +
      ")";
    var grad = "linear-gradient(135deg, " + light + ", " + dark + ")";
    badge.style.background = grad;
    badge.style.color =
      (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 > 150
        ? "#1a1a2e"
        : "#fff";
    arrow.style.borderTopColor = dark;
    card.style.setProperty("--np-ring", grad);
    circle.style.backgroundColor = form.color;
    if (status === "sleep") {
      arrow.style.borderTopColor = NIGHT.dark;
      circle.style.backgroundColor = NIGHT.bg;
    }
    window.NPMenuPokemon.paint(card, circle, status);
    if (img.getAttribute("src") !== form.img) img.setAttribute("src", form.img);
    img.style.setProperty("--np-poke-x", form.x || "0px");
    img.style.setProperty("--np-poke-zoom", form.zoom || "1");
    img.alt = form.name;
    lvl.textContent = window.NPMenuPokemon.text(
      status,
      p ? "Nivel " + p.level : "Elige uno",
    );
    var label =
      (p
        ? "Mi Pokémon: " + form.name + ", nivel " + p.level
        : "Mi Pokémon: elige tu compañero") +
      window.NPMenuPokemon.label(status);
    card.setAttribute("aria-label", label);
    card.setAttribute(
      "title",
      p ? form.name + " · Nivel " + p.level : "Elige tu Pokémon",
    );
  }
  render();
  window.addEventListener("storage", function (e) {
    if (
      !e.key ||
      e.key === "pkw_v6" ||
      e.key === "ns-new-account-sync" ||
      e.key === "ns-sync-pkw-done" ||
      window.NPMenuPokemon.isCareKey(e.key)
    )
      render();
  });
  window.addEventListener("np:pokemon", render);
  window.addEventListener("pageshow", render);
  window.addEventListener("focus", render);
  var timer = null;
  function tick() {
    if (document.hidden) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      return;
    }
    render();
    if (!timer) timer = setInterval(render, 2000);
  }
  document.addEventListener("visibilitychange", tick);
  tick();
})();
