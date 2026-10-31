(function () {
  if (window.NPLongSubmenus) return;
  window.NPLongSubmenus = !0;
  var desktop = window.matchMedia("(min-width: 992px)");
  function setVar(el, name, value) {
    if (el.style.getPropertyValue(name) !== String(value))
      el.style.setProperty(name, String(value));
  }
  function setup() {
    if (!desktop.matches) return;
    document
      .querySelectorAll(
        "#np-nav #holaa_main_menu #menu-main-menu > li > .sub-menu",
      )
      .forEach(function (sub) {
        var items = Array.prototype.filter.call(sub.children, function (li) {
          return (
            li.tagName === "LI" &&
            !li.classList.contains("np-oculto-pc") &&
            getComputedStyle(li).display !== "none"
          );
        });
        sub.classList.add("np-sub-lite");
        if (items.length < 10) {
          sub.classList.remove("np-sub-long");
          return;
        }
        sub.classList.add("np-sub-long");
        setVar(sub, "--np-rows-2", Math.ceil(items.length / 2));
        setVar(sub, "--np-rows-3", Math.ceil(items.length / 3));
      });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", setup);
  else setup();
  window.addEventListener("load", setup);
  if (desktop.addEventListener) desktop.addEventListener("change", setup);
  else desktop.addListener(setup);
})();
