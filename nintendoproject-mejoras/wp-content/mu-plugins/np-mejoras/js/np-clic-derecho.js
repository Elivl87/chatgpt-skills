(function () {
  if (window.NPNoRightPress) return;
  window.NPNoRightPress = !0;
  var scope = "#np-nav, #np-menu-personalizer";
  function clear() {
    document
      .querySelectorAll("#np-nav.np-rclick, #np-menu-personalizer.np-rclick")
      .forEach(function (n) {
        n.classList.remove("np-rclick");
      });
  }
  document.addEventListener(
    "pointerdown",
    function (e) {
      if (e.pointerType && e.pointerType !== "mouse") {
        clear();
        return;
      }
      if (e.button === 0) {
        clear();
        return;
      }
      var host = e.target instanceof Element ? e.target.closest(scope) : null;
      if (host) host.classList.add("np-rclick");
    },
    !0,
  );
  document.addEventListener("keydown", clear, !0);
})();
