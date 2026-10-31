(function () {
  if (window.NPAvatarSpacing) return;
  window.NPAvatarSpacing = !0;
  var desktop = window.matchMedia("(min-width: 992px)");
  var frame = 0;
  function place() {
    frame = 0;
    var nav = document.getElementById("np-nav");
    var bar = nav && nav.querySelector(".container.custom-container");
    var card =
      nav &&
      nav.querySelector(
        ".nav-right-part-desktop > a.np-desktop-account-card:not(.np-desktop-pokemon-card)",
      );
    if (!bar || !card) return;
    var group = [card];
    var poke = nav.querySelector(
      ".nav-right-part-desktop > a.np-desktop-pokemon-card",
    );
    if (poke && poke.getClientRects().length) group.unshift(poke);
    group.forEach(function (el) {
      el.style.removeProperty("left");
    });
    if (!desktop.matches) return;
    var prev = group[0].previousElementSibling;
    while (prev && !prev.getClientRects().length)
      prev = prev.previousElementSibling;
    if (!prev) return;
    var b = bar.getBoundingClientRect();
    var first = group[0].getBoundingClientRect();
    var last = card.getBoundingClientRect();
    var p = prev.getBoundingClientRect();
    var antes = first.left - p.right;
    var despues = b.right - last.right;
    var mover = (despues - antes) / 2;
    mover -= 10;
    if (Math.abs(mover) > 0.5)
      group.forEach(function (el) {
        el.style.setProperty("left", mover.toFixed(1) + "px", "important");
      });
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(place);
  }
  function watch() {
    var bar = document.querySelector("#np-nav > .container.custom-container");
    if (bar && window.ResizeObserver) new ResizeObserver(schedule).observe(bar);
    schedule();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", watch);
  else watch();
  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule);
  if (desktop.addEventListener) desktop.addEventListener("change", schedule);
  else desktop.addListener(schedule);
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(schedule);
})();
