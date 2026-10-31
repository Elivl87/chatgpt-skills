(function () {
  if (window.NPMenuImageProtection) return;
  window.NPMenuImageProtection = !0;
  var scope = "#np-nav, #sidebar-menu, #np-menu-personalizer";
  var images = "#np-nav img, #sidebar-menu img, #np-menu-personalizer img";
  function imageItem(target) {
    if (!(target instanceof Element)) return null;
    var item = target.closest("img, a, button");
    if (!item || !item.closest(scope)) return null;
    return item.matches("img") || item.querySelector("img") ? item : null;
  }
  function blockImageAction(event) {
    if (imageItem(event.target)) event.preventDefault();
  }
  function disableImageDragging() {
    document.querySelectorAll(images).forEach(function (img) {
      img.draggable = !1;
    });
  }
  document.addEventListener("contextmenu", blockImageAction, !0);
  document.addEventListener("dragstart", blockImageAction, !0);
  disableImageDragging();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", disableImageDragging, {
      once: !0,
    });
  }
})();
