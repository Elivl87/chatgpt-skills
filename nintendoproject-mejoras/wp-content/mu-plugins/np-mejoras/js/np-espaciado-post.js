(function () {
  var body = document.body;
  if (!body || !body.classList.contains("single-post")) return;
  var desktop = window.matchMedia("(min-width: 992px)");
  var moved = null;
  var GAP = 48;
  var SKIP =
    "#np-nav, #sidebar-menu, #np-menu-personalizer, #pkwLvlOv, .preloader, script, style, link, noscript, template";
  function hasBackground(cs) {
    if (cs.backgroundImage && cs.backgroundImage !== "none") return !0;
    var m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!m) return !1;
    var parts = m[1].split(",");
    return parts.length < 4 || parseFloat(parts[3]) > 0.05;
  }
  function inFlow(el) {
    if (el.matches(SKIP)) return !1;
    var cs = getComputedStyle(el);
    if (
      cs.display === "none" ||
      cs.position === "absolute" ||
      cs.position === "fixed"
    )
      return !1;
    return el.getBoundingClientRect().height > 0;
  }
  function findBackgroundBlock() {
    var node = body;
    for (var depth = 0; depth < 10; depth++) {
      var next = null;
      for (var i = 0; i < node.children.length; i++) {
        var c = node.children[i];
        if (inFlow(c)) {
          next = c;
          break;
        }
      }
      if (!next) return null;
      if (hasBackground(getComputedStyle(next))) return next;
      node = next;
    }
    return null;
  }
  function firstVisual(el) {
    var node = el;
    for (var depth = 0; depth < 12; depth++) {
      var next = null;
      for (var i = 0; i < node.children.length; i++) {
        if (inFlow(node.children[i])) {
          next = node.children[i];
          break;
        }
      }
      if (!next) return node === el ? null : node;
      var cs = getComputedStyle(next);
      if (
        hasBackground(cs) ||
        parseFloat(cs.borderTopWidth) > 0 ||
        /^(IMG|VIDEO|IFRAME|CANVAS|SVG|H1|H2|H3|H4|H5|H6|P|BUTTON|FORM|TABLE)$/i.test(
          next.tagName,
        )
      )
        return next;
      node = next;
    }
    return node === el ? null : node;
  }
  function restore() {
    if (moved) {
      if (moved.inline)
        moved.el.style.setProperty("padding-top", moved.inline, moved.prio);
      else moved.el.style.removeProperty("padding-top");
      moved = null;
    }
    body.classList.remove("np-espacio-movido");
  }
  function apply() {
    restore();
    if (!desktop.matches) return;
    var space = parseFloat(getComputedStyle(body).paddingTop) || 0;
    if (space < 40) return;
    var el = findBackgroundBlock();
    if (!el) return;
    moved = {
      el: el,
      inline: el.style.getPropertyValue("padding-top"),
      prio: el.style.getPropertyPriority("padding-top"),
    };
    body.classList.add("np-espacio-movido");
    var cs = getComputedStyle(el);
    var own = parseFloat(cs.paddingTop) || 0;
    var border = parseFloat(cs.borderTopWidth) || 0;
    var bar = document.querySelector("#np-nav > .container.custom-container");
    var inset = bar
      ? parseFloat(
          getComputedStyle(document.getElementById("np-nav")).getPropertyValue(
            "--np-bar-inset",
          ),
        ) || 8
      : 0;
    var menuBottom = bar
      ? bar.getBoundingClientRect().bottom - inset + window.pageYOffset
      : space;
    var first = firstVisual(el);
    var contentTop = first
      ? first.getBoundingClientRect().top + window.pageYOffset
      : el.getBoundingClientRect().top + window.pageYOffset + border + own;
    var pad = Math.max(0, Math.round(own + (menuBottom + GAP - contentTop)));
    el.style.setProperty("padding-top", pad + "px", "important");
  }
  var timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(apply, 120);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", apply);
  else apply();
  window.addEventListener("load", apply);
  window.addEventListener("resize", schedule);
  if (desktop.addEventListener) desktop.addEventListener("change", apply);
  else desktop.addListener(apply);
})();
