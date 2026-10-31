var NP = window.NP;
(function () {
  function organizeMobileSections() {
    var list = document.querySelector(
      "#sidebar-menu .mobile_menu_nav .menu_list",
    );
    if (!list) return;
    var consolas = null;
    list.querySelectorAll(":scope > li").forEach(function (li) {
      var link = li.querySelector(":scope > a");
      var label = link
        ? link.textContent.replace(/\s+/g, " ").trim().toUpperCase()
        : "";
      if (
        !consolas &&
        (li.querySelector(
          ':scope > .sub-menu a[href*="coleccion-completa-nintendo-ds"]',
        ) ||
          /\bCONSOLAS\b/.test(label))
      ) {
        consolas = li;
      }
    });
    var sub = consolas && consolas.querySelector(":scope > .sub-menu");
    var pc = null,
      contacto = null;
    list.querySelectorAll("li > a").forEach(function (link) {
      var label = link.textContent.replace(/\s+/g, " ").trim().toUpperCase();
      var href = (link.getAttribute("href") || "")
        .replace(/[?#].*$/, "")
        .replace(/\/+$/, "")
        .toLowerCase();
      if (
        !pc &&
        (/\/multi-nintendo-project-juegos-pc$/.test(href) ||
          /^(?:JUEGOS (?:DE )?)?PC$/.test(label))
      )
        pc = link.parentElement;
      if (
        !contacto &&
        (link.parentElement.classList.contains("np-menu-contacto") ||
          label === "CONTACTO")
      )
        contacto = link.parentElement;
    });
    if (sub) {
      if (!pc) {
        pc = document.createElement("li");
        pc.className = "menu-item";
        var newLink = document.createElement("a");
        newLink.href =
          NP.page("multi-nintendo-project-juegos-pc");
        pc.appendChild(newLink);
      }
      pc.classList.remove(
        "np-menu-novedad-pc",
        "menu-pc-only",
        "menu-movil-only",
      );
      pc.classList.add("np-menu-pc-consolas");
      var pcLink = pc.querySelector(":scope > a");
      if (!pcLink.querySelector(".menu-icon")) {
        var icon = document.createElement("img");
        icon.className = "menu-icon";
        icon.src =
          NP.u("wp-content/uploads/2026/10/PCGAMES.webp");
        icon.alt = "";
        icon.width = 40;
        icon.height = 40;
        icon.decoding = "async";
        icon.draggable = !1;
        pcLink.insertBefore(icon, pcLink.firstChild);
      }
      var walker = document.createTreeWalker(pcLink, NodeFilter.SHOW_TEXT);
      var texts = [],
        text;
      while ((text = walker.nextNode())) {
        if (text.nodeValue.trim()) texts.push(text);
      }
      for (var n = 0; n < texts.length; n++) {
        texts[n].nodeValue = n === 0 ? " JUEGOS DE PC" : "";
      }
      if (!texts.length)
        pcLink.appendChild(document.createTextNode(" JUEGOS DE PC"));
      pcLink.setAttribute("aria-label", "Juegos de PC");
      sub.appendChild(pc);
      if (
        pc.classList.contains("current-menu-item") ||
        /^\/multi-nintendo-project-juegos-pc\/?$/.test(window.location.pathname)
      ) {
        pc.classList.add("current-menu-item");
        pcLink.setAttribute("aria-current", "page");
        consolas.classList.add("current-menu-ancestor");
      }
    }
    var title = list.querySelector(".np-menu-novedades-titulo");
    if (!contacto && !title) return;
    if (!title) {
      title = document.createElement("li");
      title.className = "np-menu-novedades-titulo";
      var anchor = contacto;
      while (anchor.parentElement !== list)
        anchor = anchor.parentElement.closest("li");
      list.insertBefore(
        title,
        anchor === contacto ? anchor : anchor.nextSibling,
      );
    }
    var heading = title.querySelector("span");
    if (!heading) {
      heading = document.createElement("span");
      title.appendChild(heading);
    }
    heading.setAttribute("role", "heading");
    heading.setAttribute("aria-level", "2");
    heading.textContent = "AYUDA Y SOPORTE";
    if (contacto) {
      contacto.classList.add("np-menu-contacto");
      list.insertBefore(contacto, title.nextSibling);
    }
  }
  var PLAZA_TITULO = "CHATEA CON +19.500 MIEMBROS";
  function addPlazaSection() {
    var list = document.querySelector(
      "#sidebar-menu .mobile_menu_nav .menu_list",
    );
    if (!list) return;
    var plaza = list.querySelector(":scope > li.np-menu-plaza-mii");
    var title = list.querySelector(":scope > li.np-menu-plaza-titulo");
    if (!plaza) {
      if (title) title.remove();
      return;
    }
    if (!title) {
      title = document.createElement("li");
      title.className = "np-menu-plaza-titulo";
      var heading = document.createElement("span");
      heading.setAttribute("role", "heading");
      heading.setAttribute("aria-level", "2");
      var dot = document.createElement("i");
      dot.className = "np-plaza-online";
      dot.setAttribute("aria-hidden", "true");
      heading.appendChild(dot);
      heading.appendChild(document.createTextNode(PLAZA_TITULO));
      title.appendChild(heading);
    }
    if (plaza.previousElementSibling !== title) list.insertBefore(title, plaza);
  }
  var POKEMON_MENU = {
    rioluShiny: {
      startLevel: 1,
      forms: [
        {
          name: "RIOLU SHINY",
          img: NP.u("wp-content/uploads/2026/09/riolushiny.gif"),
          color: "#facc15",
        },
        {
          name: "LUCARIO",
          img: NP.u("wp-content/uploads/2026/09/lucariogrande.gif"),
          color: "#3b82f6",
        },
      ],
    },
    ashPikachu: {
      startLevel: 20,
      forms: [
        {
          name: "PIKACHU DE ASH",
          img: NP.u("wp-content/uploads/2026/09/pikapi.gif"),
          color: "#facc15",
          x: "10%",
          zoom: "1.12",
        },
        {
          name: "PIKACHU DE ASH",
          img: NP.u("wp-content/uploads/2026/09/pikapi.gif"),
          color: "#facc15",
          x: "10%",
          zoom: "1.12",
        },
        {
          name: "PIKACHU DE ASH",
          img: NP.u("wp-content/uploads/2026/09/pikapi.gif"),
          color: "#facc15",
          x: "10%",
          zoom: "1.12",
        },
      ],
    },
    darkraiShiny: {
      startLevel: 50,
      forms: [
        {
          name: "DARKRAI",
          img: NP.u("wp-content/uploads/2026/10/shiny-darkrai.gif"),
          color: "#7c3aed",
        },
      ],
    },
    gengarHalloween: {
      startLevel: 30,
      forms: [
        {
          name: "MEGA GENGAR",
          img: NP.u("wp-content/uploads/2026/10/megagengarhd.gif"),
          color: "#6d28d9",
        },
      ],
    },
    mimikyuHalloween: {
      startLevel: 25,
      forms: [
        {
          name: "MIMIKYU",
          img: NP.u("wp-content/uploads/2026/10/Mimikyu.gif"),
          color: "#eab308",
        },
      ],
    },
    zoruaShiny: {
      startLevel: 1,
      forms: [
        {
          name: "ZORUA SHINY",
          img: NP.u("wp-content/uploads/2026/10/pokemon-zoroa.gif"),
          color: "#8b5cf6",
        },
        {
          name: "ZOROARK SHINY",
          img: NP.u("wp-content/uploads/2026/10/zoroark-shiny.gif"),
          color: "#7c3aed",
        },
      ],
    },
    bulbasaur: {
      startLevel: 1,
      forms: [
        {
          name: "BULBASAUR",
          img: NP.u("wp-content/uploads/2026/03/bulbasaur.gif"),
          color: "#22c55e",
        },
        {
          name: "IVYSAUR",
          img: NP.u("wp-content/uploads/2026/03/ivysaur.gif"),
          color: "#14b8a6",
        },
        {
          name: "VENUSAUR",
          img: NP.u("wp-content/uploads/2026/03/venusaur-f.gif"),
          color: "#16a34a",
        },
      ],
    },
    charmander: {
      startLevel: 1,
      forms: [
        {
          name: "CHARMANDER",
          img: NP.u("wp-content/uploads/2026/03/charmander.gif"),
          color: "#ef4444",
        },
        {
          name: "CHARMELEON",
          img: NP.u("wp-content/uploads/2026/03/charmeleon.gif"),
          color: "#dc2626",
        },
        {
          name: "CHARIZARD",
          img: NP.u("wp-content/uploads/2026/03/charizard.gif"),
          color: "#ef4444",
        },
      ],
    },
    squirtle: {
      startLevel: 1,
      forms: [
        {
          name: "SQUIRTLE",
          img: NP.u("wp-content/uploads/2026/03/squirtle.gif"),
          color: "#3b82f6",
        },
        {
          name: "WARTORTLE",
          img: NP.u("wp-content/uploads/2026/03/wartortle-1.gif"),
          color: "#60a5fa",
        },
        {
          name: "BLASTOISE",
          img: NP.u("wp-content/uploads/2026/03/blastoise.gif"),
          color: "#2563eb",
        },
      ],
    },
    chikorita: {
      startLevel: 1,
      forms: [
        {
          name: "CHIKORITA",
          img: NP.u("wp-content/uploads/2026/03/chikorita.gif"),
          color: "#84cc16",
        },
        {
          name: "BAYLEEF",
          img: NP.u("wp-content/uploads/2026/03/bayleef.gif"),
          color: "#d4b62c",
        },
        {
          name: "MEGANIUM",
          img: NP.u("wp-content/uploads/2026/03/meganium-f.gif"),
          color: "#65a30d",
        },
      ],
    },
    cyndaquil: {
      startLevel: 1,
      forms: [
        {
          name: "CYNDAQUIL",
          img: NP.u("wp-content/uploads/2026/03/cyndaquil.gif"),
          color: "#eab308",
        },
        {
          name: "QUILAVA",
          img: NP.u("wp-content/uploads/2026/03/quilava.gif"),
          color: "#2563eb",
        },
        {
          name: "TYPHLOSION",
          img: NP.u("wp-content/uploads/2026/03/typhlosion.gif"),
          color: "#1d4ed8",
        },
      ],
    },
    totodile: {
      startLevel: 1,
      forms: [
        {
          name: "TOTODILE",
          img: NP.u("wp-content/uploads/2026/03/totodile.gif"),
          color: "#38bdf8",
        },
        {
          name: "CROCONAW",
          img: NP.u("wp-content/uploads/2026/03/croconaw.gif"),
          color: "#0ea5e9",
        },
        {
          name: "FERALIGATR",
          img: NP.u("wp-content/uploads/2026/03/feraligatr.gif"),
          color: "#0284c7",
        },
      ],
    },
    treecko: {
      startLevel: 1,
      forms: [
        {
          name: "TREECKO",
          img: NP.u("wp-content/uploads/2026/03/treecko.gif"),
          color: "#22c55e",
        },
        {
          name: "GROVYLE",
          img: NP.u("wp-content/uploads/2026/03/grovyle.gif"),
          color: "#16a34a",
        },
        {
          name: "SCEPTILE",
          img: NP.u("wp-content/uploads/2026/03/sceptile-mega.gif"),
          color: "#15803d",
        },
      ],
    },
    torchic: {
      startLevel: 1,
      forms: [
        {
          name: "TORCHIC",
          img: NP.u("wp-content/uploads/2026/03/torchic.gif"),
          color: "#f97316",
        },
        {
          name: "COMBUSKEN",
          img: NP.u("wp-content/uploads/2026/03/combusken.gif"),
          color: "#fb923c",
        },
        {
          name: "BLAZIKEN",
          img: NP.u("wp-content/uploads/2026/03/blaziken-f.gif"),
          color: "#dc2626",
        },
      ],
    },
    mudkip: {
      startLevel: 1,
      forms: [
        {
          name: "MUDKIP",
          img: NP.u("wp-content/uploads/2026/03/mudkip.gif"),
          color: "#38bdf8",
        },
        {
          name: "MARSHTOMP",
          img: NP.u("wp-content/uploads/2026/03/marshtomp.gif"),
          color: "#0ea5e9",
        },
        {
          name: "SWAMPERT",
          img: NP.u("wp-content/uploads/2026/03/swampert.gif"),
          color: "#2563eb",
        },
      ],
    },
    turtwig: {
      startLevel: 1,
      forms: [
        {
          name: "TURTWIG",
          img: NP.u("wp-content/uploads/2026/03/turtwig.gif"),
          color: "#84cc16",
        },
        {
          name: "GROTLE",
          img: NP.u("wp-content/uploads/2026/03/grotle.gif"),
          color: "#65a30d",
        },
        {
          name: "TORTERRA",
          img: NP.u("wp-content/uploads/2026/03/torterra.gif"),
          color: "#4d7c0f",
        },
      ],
    },
    chimchar: {
      startLevel: 1,
      forms: [
        {
          name: "CHIMCHAR",
          img: NP.u("wp-content/uploads/2026/03/chimchar.gif"),
          color: "#f97316",
        },
        {
          name: "MONFERNO",
          img: NP.u("wp-content/uploads/2026/03/monferno.gif"),
          color: "#fb923c",
        },
        {
          name: "INFERNAPE",
          img: NP.u("wp-content/uploads/2026/03/infernape.gif"),
          color: "#f59e0b",
        },
      ],
    },
    piplup: {
      startLevel: 1,
      forms: [
        {
          name: "PIPLUP",
          img: NP.u("wp-content/uploads/2026/03/piplup.gif"),
          color: "#60a5fa",
        },
        {
          name: "PRINPLUP",
          img: NP.u("wp-content/uploads/2026/03/prinplup.gif"),
          color: "#3b82f6",
        },
        {
          name: "EMPOLEON",
          img: NP.u("wp-content/uploads/2026/03/empoleon.gif"),
          color: "#1d4ed8",
        },
      ],
    },
    snivy: {
      startLevel: 1,
      forms: [
        {
          name: "SNIVY",
          img: NP.u("wp-content/uploads/2026/03/snivy.gif"),
          color: "#84cc16",
        },
        {
          name: "SERVINE",
          img: NP.u("wp-content/uploads/2026/03/servine.gif"),
          color: "#65a30d",
        },
        {
          name: "SERPERIOR",
          img: NP.u("wp-content/uploads/2026/03/serperior.gif"),
          color: "#15803d",
        },
      ],
    },
    tepig: {
      startLevel: 1,
      forms: [
        {
          name: "TEPIG",
          img: NP.u("wp-content/uploads/2026/03/tepig.gif"),
          color: "#f97316",
        },
        {
          name: "PIGNITE",
          img: NP.u("wp-content/uploads/2026/03/pignite.gif"),
          color: "#ea580c",
        },
        {
          name: "EMBOAR",
          img: NP.u("wp-content/uploads/2026/03/emboar.gif"),
          color: "#ef4444",
        },
      ],
    },
    oshawott: {
      startLevel: 1,
      forms: [
        {
          name: "OSHAWOTT",
          img: NP.u("wp-content/uploads/2026/03/oshawott.gif"),
          color: "#38bdf8",
        },
        {
          name: "DEWOTT",
          img: NP.u("wp-content/uploads/2026/03/dewott.gif"),
          color: "#3b82f6",
        },
        {
          name: "SAMUROTT",
          img: NP.u("wp-content/uploads/2026/03/samurott.gif"),
          color: "#1d4ed8",
        },
      ],
    },
    chespin: {
      startLevel: 1,
      forms: [
        {
          name: "CHESPIN",
          img: NP.u("wp-content/uploads/2026/03/chespin.gif"),
          color: "#65a30d",
        },
        {
          name: "QUILLADIN",
          img: NP.u("wp-content/uploads/2026/03/quilladin.gif"),
          color: "#84cc16",
        },
        {
          name: "CHESNAUGHT",
          img: NP.u("wp-content/uploads/2026/03/chesnaught.gif"),
          color: "#a3a56b",
        },
      ],
    },
    fennekin: {
      startLevel: 1,
      forms: [
        {
          name: "FENNEKIN",
          img: NP.u("wp-content/uploads/2026/03/fennekin.gif"),
          color: "#f59e0b",
        },
        {
          name: "BRAIXEN",
          img: NP.u("wp-content/uploads/2026/03/braixen.gif"),
          color: "#fbbf24",
        },
        {
          name: "DELPHOX",
          img: NP.u("wp-content/uploads/2026/03/delphox.gif"),
          color: "#b91c1c",
        },
      ],
    },
    froakie: {
      startLevel: 1,
      forms: [
        {
          name: "FROAKIE",
          img: NP.u("wp-content/uploads/2026/03/froakie.gif"),
          color: "#38bdf8",
        },
        {
          name: "FROGADIER",
          img: NP.u("wp-content/uploads/2026/03/frogadier.gif"),
          color: "#3b82f6",
        },
        {
          name: "GRENINJA",
          img: NP.u("wp-content/uploads/2026/03/greninja.gif"),
          color: "#2563eb",
        },
      ],
    },
    rowlet: {
      startLevel: 1,
      forms: [
        {
          name: "ROWLET",
          img: NP.u("wp-content/uploads/2026/03/rowlet.gif"),
          color: "#b88a57",
        },
        {
          name: "DARTRIX",
          img: NP.u("wp-content/uploads/2026/03/dartrix.gif"),
          color: "#65a30d",
        },
        {
          name: "DECIDUEYE",
          img: NP.u("wp-content/uploads/2026/03/decidueye.gif"),
          color: "#4d7c0f",
        },
      ],
    },
    litten: {
      startLevel: 1,
      forms: [
        {
          name: "LITTEN",
          img: NP.u("wp-content/uploads/2026/03/litten.gif"),
          color: "#dc2626",
        },
        {
          name: "TORRACAT",
          img: NP.u("wp-content/uploads/2026/03/torracat.gif"),
          color: "#f97316",
        },
        {
          name: "INCINEROAR",
          img: NP.u("wp-content/uploads/2026/03/incineroar.gif"),
          color: "#dc2626",
        },
      ],
    },
    popplio: {
      startLevel: 1,
      forms: [
        {
          name: "POPPLIO",
          img: NP.u("wp-content/uploads/2026/03/popplio.gif"),
          color: "#3b82f6",
        },
        {
          name: "BRIONNE",
          img: NP.u("wp-content/uploads/2026/03/brionne.gif"),
          color: "#60a5fa",
        },
        {
          name: "PRIMARINA",
          img: NP.u("wp-content/uploads/2026/03/primarina.gif"),
          color: "#38bdf8",
        },
      ],
    },
    grookey: {
      startLevel: 1,
      forms: [
        {
          name: "GROOKEY",
          img: NP.u("wp-content/uploads/2026/03/grookey.gif"),
          color: "#65a30d",
        },
        {
          name: "THWACKEY",
          img: NP.u("wp-content/uploads/2026/03/thwackey.gif"),
          color: "#84cc16",
        },
        {
          name: "RILLABOOM",
          img: NP.u("wp-content/uploads/2026/03/rillaboom.gif"),
          color: "#15803d",
        },
      ],
    },
    scorbunny: {
      startLevel: 1,
      forms: [
        {
          name: "SCORBUNNY",
          img: NP.u("wp-content/uploads/2026/03/scorbunny.gif"),
          color: "#f97316",
        },
        {
          name: "RABOOT",
          img: NP.u("wp-content/uploads/2026/03/raboot.gif"),
          color: "#ef4444",
        },
        {
          name: "CINDERACE",
          img: NP.u("wp-content/uploads/2026/03/cinderace.gif"),
          color: "#ef4444",
        },
      ],
    },
    sobble: {
      startLevel: 1,
      forms: [
        {
          name: "SOBBLE",
          img: NP.u("wp-content/uploads/2026/03/sobble.gif"),
          color: "#38bdf8",
        },
        {
          name: "DRIZZILE",
          img: NP.u("wp-content/uploads/2026/03/drizzile.gif"),
          color: "#60a5fa",
        },
        {
          name: "INTELEON",
          img: NP.u("wp-content/uploads/2026/03/inteleon.gif"),
          color: "#2563eb",
        },
      ],
    },
    sprigatito: {
      startLevel: 1,
      forms: [
        {
          name: "SPRIGATITO",
          img: NP.u("wp-content/uploads/2026/03/sprigatito-1.gif"),
          color: "#84cc16",
        },
        {
          name: "FLORAGATO",
          img: NP.u("wp-content/uploads/2026/03/floragato-1.gif"),
          color: "#65a30d",
        },
        {
          name: "MEOWSCARADA",
          img: NP.u("wp-content/uploads/2026/03/meowscarada.gif"),
          color: "#15803d",
        },
      ],
    },
    fuecoco: {
      startLevel: 1,
      forms: [
        {
          name: "FUECOCO",
          img: NP.u("wp-content/uploads/2026/03/fuecoco-1.gif"),
          color: "#ef4444",
        },
        {
          name: "CROCALOR",
          img: NP.u("wp-content/uploads/2026/03/crocalor-1.gif"),
          color: "#dc2626",
        },
        {
          name: "SKELEDIRGE",
          img: NP.u("wp-content/uploads/2026/03/skeledirge.gif"),
          color: "#b91c1c",
        },
      ],
    },
    quaxly: {
      startLevel: 1,
      forms: [
        {
          name: "QUAXLY",
          img: NP.u("wp-content/uploads/2026/03/quaxly-1.gif"),
          color: "#38bdf8",
        },
        {
          name: "QUAXWELL",
          img: NP.u("wp-content/uploads/2026/03/quaxwell.gif"),
          color: "#3b82f6",
        },
        {
          name: "QUAQUAVAL",
          img: NP.u("wp-content/uploads/2026/03/quaquaval.gif"),
          color: "#2563eb",
        },
      ],
    },
  };
  function readMenuPokemon() {
    try {
      var raw = localStorage.getItem("pkw_v6");
      var state = raw ? JSON.parse(raw) : null;
      if (!raw && !localStorage.getItem("ns-sync-pkw-done")) {
        var sync = JSON.parse(
          localStorage.getItem("ns-new-account-sync") || "null",
        );
        var key =
          sync && (sync.pokemonKey || (sync.pokemon && sync.pokemon.key));
        if (key === "riolu" || key === "riolushiny") key = "rioluShiny";
        if (key && Object.prototype.hasOwnProperty.call(POKEMON_MENU, key)) {
          state = {
            key: key,
            evoStage: 0,
            level: POKEMON_MENU[key].startLevel,
          };
        }
      }
      if (
        state &&
        state.npView &&
        state.npView.img &&
        !Object.prototype.hasOwnProperty.call(POKEMON_MENU, state.key)
      ) {
        var lgLevel = Math.max(
          1,
          Math.min(100, Math.floor(Number(state.level)) || 1),
        );
        var lgColor = /^#[0-9a-f]{6}$/i.test(state.npView.color || "")
          ? state.npView.color
          : "#7c3aed";
        return {
          key: state.key,
          stage: 0,
          level: lgLevel,
          form: {
            name: String(state.npView.name || "LEGENDARIO"),
            img: String(state.npView.img),
            color: lgColor,
          },
        };
      }
      if (
        !state ||
        !Object.prototype.hasOwnProperty.call(POKEMON_MENU, state.key)
      )
        return null;
      var pokemon = POKEMON_MENU[state.key];
      var stage = Number(state.evoStage),
        level = Number(state.level);
      stage = Math.max(
        0,
        Math.min(
          pokemon.forms.length - 1,
          isFinite(stage) ? Math.floor(stage) : 0,
        ),
      );
      level = Math.max(
        1,
        Math.min(100, isFinite(level) ? Math.floor(level) : 1),
      );
      return {
        key: state.key,
        stage: stage,
        level: level,
        form: pokemon.forms[stage],
      };
    } catch (e) {
      return null;
    }
  }
  var CARE = {
    prefix: "np_pokerecreo_v1:",
    current: "np_pokerecreo_actual",
    dirtPerHour: 0.027,
    dirtyAt: 40,
    capHours: 72,
    sleepMinutes: 10,
  };
  var NIGHT = {
    grad: "linear-gradient(135deg, #4a5a96, #141a33)",
    dark: "#141a33",
    bg: "#1a2242",
  };
  var careMemo = { at: 0, key: "", value: "" };
  function validCare(c) {
    return !!c && c.version === 1 && Array.isArray(c.dirt);
  }
  function findCare(pokemon) {
    var best = null,
      bestScore = -1,
      key = String(pokemon.key).toLowerCase(),
      current = "";
    try {
      current = localStorage.getItem(CARE.current) || "";
    } catch (e) {}
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k.indexOf(CARE.prefix) !== 0) continue;
      var c = null,
        token = "";
      try {
        token = decodeURIComponent(k.slice(CARE.prefix.length));
        c = JSON.parse(localStorage.getItem(k) || "null");
      } catch (e) {
        continue;
      }
      if (!validCare(c)) continue;
      var score =
        (token === current ? 2e15 : 0) +
        (token.toLowerCase().indexOf(key) !== -1 ? 1e15 : 0) +
        (Number(c.updatedAt) || 0);
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  }
  function readMenuCare(pokemon) {
    if (!pokemon) return "";
    var now = Date.now();
    if (careMemo.key === pokemon.key && now - careMemo.at < 2500)
      return careMemo.value;
    var value = "";
    try {
      var c = findCare(pokemon);
      if (c) {
        var last = Number(c.lastTick) || Number(c.updatedAt) || now;
        var ms = Math.max(0, Math.min(now - last, CARE.capHours * 36e5));
        if (c.sleeping === !0) {
          var need =
            (Math.max(0, Number(c.fatigue) || 0) / (100 / CARE.sleepMinutes)) *
            6e4;
          if (ms < need) value = "sleep";
          else ms -= need;
        }
        if (!value) {
          var sum = 0;
          for (var i = 0; i < 12; i++)
            sum += Math.max(
              0,
              Math.min(
                1,
                (Number(c.dirt[i]) || 0) + (ms / 36e5) * CARE.dirtPerHour,
              ),
            );
          if (100 - (sum / 12) * 100 <= CARE.dirtyAt) value = "dirty";
        }
      }
    } catch (e) {
      value = "";
    }
    careMemo = { at: now, key: pokemon.key, value: value };
    return value;
  }
  var DIRT_SVG = (function () {
    var seed = 7321;
    function rnd() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    function splat(cx, cy, r, fill, opacity) {
      var n = 10,
        pts = [],
        d = "",
        i;
      for (i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2,
          q = r * (0.6 + 0.4 * rnd());
        pts.push([cx + Math.cos(a) * q * 1.25, cy + Math.sin(a) * q * 0.8]);
      }
      for (i = 0; i <= n; i++) {
        var p0 = pts[i % n],
          p1 = pts[(i + 1) % n];
        var mx = ((p0[0] + p1[0]) / 2).toFixed(1),
          my = ((p0[1] + p1[1]) / 2).toFixed(1);
        d +=
          i === 0
            ? "M" + mx + " " + my
            : "Q" +
              p0[0].toFixed(1) +
              " " +
              p0[1].toFixed(1) +
              " " +
              mx +
              " " +
              my;
      }
      return (
        '<path d="' +
        d +
        'Z" fill="' +
        fill +
        '" fill-opacity="' +
        opacity +
        '"/>'
      );
    }
    var spots = [
      [30, 36, 15],
      [68, 30, 13],
      [52, 60, 16],
      [27, 69, 12],
      [75, 67, 13],
    ];
    var tones = ["#5e4226", "#8a6841", "#b3956a", "#6f5030"],
      out = "";
    spots.forEach(function (s) {
      out +=
        splat(s[0], s[1], s[2], "#7d5c3a", 0.9) +
        splat(s[0] + 1.5, s[1] - 1, s[2] * 0.55, "#a3835a", 0.88);
      for (var k = 0; k < 9; k++) {
        var a = rnd() * Math.PI * 2,
          d = s[2] * (0.4 + 1.1 * rnd());
        out +=
          '<circle cx="' +
          (s[0] + Math.cos(a) * d * 1.2).toFixed(1) +
          '" cy="' +
          (s[1] + Math.sin(a) * d * 0.85).toFixed(1) +
          '" r="' +
          (0.7 + 1.3 * rnd()).toFixed(1) +
          '" fill="' +
          tones[k % 4] +
          '"/>';
      }
    });
    return (
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false">' +
      out +
      "</svg>"
    );
  })();
  function paintMenuCare(host, circle, status) {
    var fx = circle.querySelector(".np-poke-fx");
    if (!fx) {
      fx = document.createElement("span");
      fx.className = "np-poke-fx";
      fx.setAttribute("aria-hidden", "true");
      fx.innerHTML =
        DIRT_SVG +
        '<span class="np-poke-night"><span class="np-poke-zzz"><i>z</i><i>z</i><i>z</i></span></span>';
      circle.appendChild(fx);
    }
    host.classList.add("np-poke-host");
    if (!host.__npCareReady) {
      host.__npCareReady = !0;
      setTimeout(function () {
        host.classList.add("np-poke-anim");
      }, 400);
    }
    host.classList.toggle("np-poke-dirty", status === "dirty");
    host.classList.toggle("np-poke-sleep", status === "sleep");
  }
  function careText(status, normal) {
    return status === "dirty"
      ? "Báñalo"
      : status === "sleep"
        ? "Shh..."
        : normal;
  }
  function careLabel(status) {
    return status === "dirty"
      ? ". Está sucio: báñalo"
      : status === "sleep"
        ? ". Está durmiendo"
        : "";
  }
  function careKey(key) {
    return !!key && key.indexOf("np_pokerecreo_") === 0;
  }
  window.NPMenuPokemon = {
    read: readMenuPokemon,
    care: readMenuCare,
    paint: paintMenuCare,
    text: careText,
    label: careLabel,
    isCareKey: careKey,
    NIGHT: NIGHT,
  };
  function setupPokemonMenu() {
    if (!document.body.classList.contains("logged-in")) return;
    var menu = document.getElementById("sidebar-menu");
    var list = menu && menu.querySelector(".mobile_menu_nav .menu_list");
    if (!list) return;
    var homeLink = list.querySelector(
      ':scope > li > a:is([href="' + NP.u("").replace(/\/$/, "") + '"], [href="' + NP.u("") + '"], [href="/"])',
    );
    if (!homeLink) return;
    var home = homeLink.parentElement;
    var item = list.querySelector(".np-menu-pokemon");
    if (!item) {
      item = document.createElement("li");
      item.className = "menu-item np-menu-pokemon";
      var link = document.createElement("a");
      link.className = "np-has-carousel np-pokemon-link";
      link.setAttribute("href", NP.u("mi-pokemon"));
      link.appendChild(document.createTextNode("MI POKÉMON"));
      var box = document.createElement("span");
      box.className = "np-profile-wrap np-menu-carousel np-menu-pokemon-avatar";
      box.setAttribute("aria-hidden", "true");
      box.innerHTML =
        '<span class="np-badge np-badge--logged np-badge--swap"><span class="np-sw"><span class="np-sw-a">Mi Pokémon</span><span class="np-sw-b"></span></span><i class="np-badge-arrow"></i></span><span class="np-profile-circle"><img class="np-menu-pokemon-img" alt="" width="64" height="64" decoding="async"></span>';
      link.appendChild(box);
      item.appendChild(link);
      list.insertBefore(item, home);
    }
    var title = list.querySelector(".np-menu-inicio-titulo");
    if (!title) {
      title = document.createElement("li");
      title.className = "np-menu-inicio-titulo";
      var heading = document.createElement("span");
      heading.setAttribute("role", "heading");
      heading.setAttribute("aria-level", "2");
      heading.textContent = "INICIO";
      title.appendChild(heading);
    }
    home.classList.add("np-menu-home-inicio");
    var accountLink = list.querySelector(
      ':scope > li > a[href*="/mi-cuenta"]:not(.np-pokemon-link)',
    );
    var topRowEnd = accountLink ? accountLink.parentElement : item;
    var plaza = list.querySelector(":scope > li.np-menu-plaza-mii");
    if (plaza) {
      list.insertBefore(plaza, topRowEnd.nextSibling);
      topRowEnd = plaza;
    }
    list.insertBefore(title, topRowEnd.nextSibling);
    list.insertBefore(home, title.nextSibling);
    menu.classList.add("np-has-pokemon-menu");
    addPlazaSection();
    renderMenuPokemon();
    watchMenuPokemon();
  }
  function initRegisteredMobileMenu() {
    if (!document.body.classList.contains("logged-in")) return;
    var mobile = window.matchMedia("(max-width: 768px)");
    function syncLayout() {
      if (mobile.matches) {
        setupPokemonMenu();
        return;
      }
      var menu = document.getElementById("sidebar-menu");
      var list = menu && menu.querySelector(".mobile_menu_nav .menu_list");
      if (!list) return;
      var item = list.querySelector(".np-menu-pokemon");
      var home = list.querySelector(".np-menu-home-inicio");
      var title = list.querySelector(".np-menu-inicio-titulo");
      if (item && home) list.insertBefore(home, item);
      if (home) home.classList.remove("np-menu-home-inicio");
      if (item) item.remove();
      if (title) title.remove();
      menu.classList.remove("np-has-pokemon-menu");
      menuPokemonSignature = "";
    }
    if (mobile.addEventListener) mobile.addEventListener("change", syncLayout);
    else mobile.addListener(syncLayout);
    syncLayout();
  }
  var menuPokemonSignature = "";
  function renderMenuPokemon() {
    var link = document.querySelector("#sidebar-menu .np-menu-pokemon > a");
    if (!link) return;
    var pokemon = readMenuPokemon();
    var status = readMenuCare(pokemon);
    var signature =
      (pokemon
        ? pokemon.key + ":" + pokemon.stage + ":" + pokemon.level
        : "none") +
      ":" +
      status;
    if (signature === menuPokemonSignature) return;
    menuPokemonSignature = signature;
    var form = pokemon
      ? pokemon.form
      : {
          name: "Elige tu Pokémon",
          img: NP.u("wp-content/uploads/2026/03/POKEBALL3D.webp"),
          color: "#0ab9e6",
        };
    var box = link.querySelector(".np-menu-pokemon-avatar");
    var badge = box.querySelector(".np-badge");
    var circle = box.querySelector(".np-profile-circle");
    var image = circle.querySelector("img");
    var rgb = [
      parseInt(form.color.slice(1, 3), 16),
      parseInt(form.color.slice(3, 5), 16),
      parseInt(form.color.slice(5, 7), 16),
    ];
    var light = rgb.map(function (n) {
      return Math.min(255, n + 40);
    });
    var dark = rgb.map(function (n) {
      return Math.max(0, n - 50);
    });
    badge.style.background =
      "linear-gradient(135deg, rgb(" +
      light.join(",") +
      "), rgb(" +
      dark.join(",") +
      "))";
    badge.style.color =
      (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 > 150
        ? "#1a1a2e"
        : "#fff";
    badge.querySelector(".np-badge-arrow").style.borderTopColor =
      "rgb(" + dark.join(",") + ")";
    if (status === "sleep")
      badge.querySelector(".np-badge-arrow").style.borderTopColor = NIGHT.dark;
    box.querySelector(".np-sw-b").textContent = careText(
      status,
      pokemon ? "Nivel " + pokemon.level : "Elige uno",
    );
    circle.style.backgroundColor = status === "sleep" ? NIGHT.bg : form.color;
    paintMenuCare(box, circle, status);
    if (image.getAttribute("src") !== form.img)
      image.setAttribute("src", form.img);
    image.style.setProperty("--np-poke-x", form.x || "0px");
    image.style.setProperty("--np-poke-zoom", form.zoom || "1");
    image.alt = form.name;
    link.setAttribute(
      "aria-label",
      (pokemon
        ? "Mi Pokémon: " + form.name + ", nivel " + pokemon.level
        : "Mi Pokémon: elige tu compañero") + careLabel(status),
    );
    link.setAttribute(
      "title",
      pokemon ? form.name + " · Nivel " + pokemon.level : "Elige tu Pokémon",
    );
    tint(link, box, !0);
  }
  function watchMenuPokemon() {
    var menu = document.getElementById("sidebar-menu");
    if (!menu || menu.__npPokemonWatch) return;
    menu.__npPokemonWatch = !0;
    var timer = null;
    function sync() {
      if (
        menu.classList.contains("show_menu") &&
        menu.classList.contains("np-has-pokemon-menu") &&
        !document.hidden
      ) {
        renderMenuPokemon();
        if (!timer) timer = setInterval(renderMenuPokemon, 1000);
      } else if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    new MutationObserver(sync).observe(menu, {
      attributes: !0,
      attributeFilter: ["class"],
    });
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("storage", function (e) {
      if (
        !e.key ||
        e.key === "pkw_v6" ||
        e.key === "ns-new-account-sync" ||
        e.key === "ns-sync-pkw-done" ||
        careKey(e.key)
      ) {
        careMemo.at = 0;
        renderMenuPokemon();
      }
    });
    window.addEventListener("pageshow", renderMenuPokemon);
    window.addEventListener("focus", renderMenuPokemon);
    window.addEventListener("load", renderMenuPokemon);
    window.addEventListener("np:pokemon", renderMenuPokemon);
    sync();
  }
  function findSource() {
    return (
      document.querySelector(".navbar .np-profile-wrap--m") ||
      document.querySelector(".navbar .np-rotating-avatar-wrap--m") ||
      document.querySelector(".navbar .np-profile-wrap") ||
      document.querySelector(".navbar .np-rotating-avatar-wrap")
    );
  }
  function render() {
    var src = findSource();
    var link = document.querySelector(
      '#sidebar-menu .menu_list > li > a[href*="/mi-cuenta"]:not(.np-pokemon-link)',
    );
    if (!src || !link) return;
    var logged = src.classList.contains("np-profile-wrap");
    var box = link.querySelector(".np-menu-carousel");
    if (box && !logged) return;
    if (!box) {
      box = document.createElement("span");
      box.setAttribute("aria-hidden", "true");
      link.appendChild(box);
    }
    box.className =
      (logged ? "np-profile-wrap" : "np-rotating-avatar-wrap") +
      " np-menu-carousel";
    box.innerHTML = src.innerHTML;
    var withId = box.querySelectorAll("[id]");
    for (var i = 0; i < withId.length; i++) withId[i].removeAttribute("id");
    link.classList.add("np-has-carousel");
    tint(link, box, logged);
  }
  function tint(link, box, logged) {
    if (!logged) {
      link.style.removeProperty("--npm-acc-a");
      link.style.removeProperty("--npm-acc-g");
      link.classList.add("np-tint-cycle");
      return;
    }
    link.classList.remove("np-tint-cycle");
    var badge = box.querySelector(".np-badge");
    var bg = badge
      ? badge.style.background || badge.style.backgroundImage || ""
      : "";
    var m = bg.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+|#[0-9a-f]{6}/gi);
    var rgb = [];
    if (m) {
      for (var i = 0; i < m.length && rgb.length < 2; i++) {
        var v = m[i];
        if (v.charAt(0) === "#") {
          rgb.push([
            parseInt(v.substr(1, 2), 16),
            parseInt(v.substr(3, 2), 16),
            parseInt(v.substr(5, 2), 16),
          ]);
        } else {
          var n = v.match(/\d+/g);
          rgb.push([+n[0], +n[1], +n[2]]);
        }
      }
    }
    if (!rgb.length) return;
    var c =
      rgb.length > 1
        ? [
            Math.round((rgb[0][0] + rgb[1][0]) / 2),
            Math.round((rgb[0][1] + rgb[1][1]) / 2),
            Math.round((rgb[0][2] + rgb[1][2]) / 2),
          ]
        : rgb[0];
    link.style.setProperty("--npm-acc-a", "rgba(" + c.join(",") + ",.65)");
    link.style.setProperty("--npm-acc-g", "rgba(" + c.join(",") + ",.32)");
  }
  function addCloseBox() {
    var nav = document.querySelector("#sidebar-menu .mobile_menu_nav");
    if (!nav || nav.querySelector(".np-menu-cerrar")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "np-menu-cerrar";
    b.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg><span>Cerrar</span>';
    b.addEventListener("click", function () {
      var orig = document.querySelector(
        "#sidebar-menu .close_button button.close, #sidebar-menu button.close",
      );
      if (orig) {
        orig.click();
      } else {
        document.getElementById("sidebar-menu").classList.remove("show_menu");
      }
    });
    nav.appendChild(b);
  }
  function pressFX() {
    var menu = document.getElementById("sidebar-menu");
    if (!menu || menu.__npPress) return;
    menu.__npPress = !0;
    var cur = null,
      t0 = 0;
    menu.addEventListener(
      "pointerdown",
      function (e) {
        var a = e.target.closest
          ? e.target.closest(".menu_list a, .np-menu-cerrar")
          : null;
        if (!a) return;
        if (cur) cur.classList.remove("np-pressed");
        cur = a;
        t0 = Date.now();
        a.classList.add("np-pressed");
      },
      !0,
    );
    function release() {
      if (!cur) return;
      var a = cur;
      cur = null;
      setTimeout(
        function () {
          a.classList.remove("np-pressed");
        },
        Math.max(0, 150 - (Date.now() - t0)),
      );
    }
    document.addEventListener("pointerup", release, !0);
    document.addEventListener("pointercancel", release, !0);
    document.addEventListener("dragstart", release, !0);
  }
  function sonidos() {
    var menu = document.getElementById("sidebar-menu");
    if (!menu || menu.__npSnd) return;
    menu.__npSnd = !0;
    var SRC =
      NP.u("wp-content/uploads/2026/07/ajustes.mp3");
    var audio = null,
      primed = !1;
    function allowed() {
      return !(window.npPrefs && window.npPrefs.sound === !1);
    }
    function prime() {
      if (primed) return;
      primed = !0;
      try {
        audio = new Audio(SRC);
        audio.preload = "auto";
        audio.volume = 0.6;
        (window.npAudioReg = window.npAudioReg || []).push(audio);
      } catch (e) {}
    }
    document.addEventListener("pointerdown", prime, {
      once: !0,
      passive: !0,
      capture: !0,
    });
    function playOpen() {
      if (!allowed()) return;
      prime();
      try {
        if (!audio) return;
        audio.currentTime = 0;
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }
    var wasOpen = menu.classList.contains("show_menu");
    new MutationObserver(function () {
      var isOpen = menu.classList.contains("show_menu");
      if (isOpen === wasOpen) return;
      wasOpen = isOpen;
      if (isOpen) playOpen();
    }).observe(menu, { attributes: !0, attributeFilter: ["class"] });
  }
  function addCineSection(list) {
    if (list.querySelector(":scope > li.np-menu-cine")) return;
    var title = document.createElement("li");
    title.className = "np-menu-cine-titulo";
    var heading = document.createElement("span");
    heading.setAttribute("role", "heading");
    heading.setAttribute("aria-level", "2");
    heading.textContent = "PELÍCULAS Y SERIES";
    title.appendChild(heading);
    var item = document.createElement("li");
    item.className = "menu-item np-menu-cine";
    var link = document.createElement("a");
    link.href = NP.page("multi-cine");
    var icon = document.createElement("img");
    icon.className = "menu-icon";
    icon.src =
      NP.u("wp-content/uploads/2026/10/palomitas.webp");
    icon.alt = "";
    icon.width = 40;
    icon.height = 40;
    icon.decoding = "async";
    icon.draggable = !1;
    link.appendChild(icon);
    link.appendChild(document.createTextNode(" CINE"));
    item.appendChild(link);
    if (/^\/multi-cine\/?$/.test(window.location.pathname)) {
      item.classList.add("current-menu-item");
      link.setAttribute("aria-current", "page");
    }
    list.appendChild(title);
    list.appendChild(item);
  }
  function addOnlineSection() {
    var list = document.querySelector(
      "#sidebar-menu .mobile_menu_nav .menu_list",
    );
    if (!list) return;
    addCineSection(list);
    if (list.querySelector(":scope > li.np-menu-online")) return;
    var title = document.createElement("li");
    title.className = "np-menu-online-titulo";
    var heading = document.createElement("span");
    heading.setAttribute("role", "heading");
    heading.setAttribute("aria-level", "2");
    heading.textContent = "JUEGA SIN DESCARGAR NADA";
    title.appendChild(heading);
    var item = document.createElement("li");
    item.className = "menu-item np-menu-online";
    var link = document.createElement("a");
    link.href = NP.page("consolas-navegador");
    var icon = document.createElement("img");
    icon.className = "menu-icon";
    icon.src =
      NP.u("wp-content/uploads/2026/10/jugar-1.webp");
    icon.alt = "";
    icon.width = 40;
    icon.height = 40;
    icon.decoding = "async";
    icon.draggable = !1;
    link.appendChild(icon);
    link.appendChild(document.createTextNode(" JUGAR"));
    item.appendChild(link);
    if (/^\/consolas-navegador\/?$/.test(window.location.pathname)) {
      item.classList.add("current-menu-item");
      link.setAttribute("aria-current", "page");
    }
    list.appendChild(title);
    list.appendChild(item);
  }
  function init() {
    organizeMobileSections();
    addPlazaSection();
    addOnlineSection();
    initRegisteredMobileMenu();
    addCloseBox();
    sonidos();
    pressFX();
    render();
    function later() {
      setTimeout(render, 60);
    }
    window.addEventListener("np:perfil", later);
    window.addEventListener("np:nivel", later);
    window.addEventListener("storage", function (e) {
      if (e.key === "mii-perfil") later();
    });
    window.addEventListener("load", later);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
