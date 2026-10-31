(function () {
  var imgs = document.querySelectorAll(
    "#np-nav .np-home-btn img, #np-nav .np-switch-btn img, #np-nav .np-plaza-btn img",
  );
  Array.prototype.forEach.call(imgs, function (img) {
    var btn = img.closest("a");
    if (!btn) return;
    function ok() {
      btn.classList.add("np-img-ok");
    }
    if (img.complete && img.naturalWidth > 1) ok();
    else {
      img.addEventListener("load", ok, { once: !0 });
      img.addEventListener("error", ok, { once: !0 });
    }
  });
})();
(function () {
  try {
    if (
      window.matchMedia("(max-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.sessionStorage.getItem("np-menu-intro:m1")
    ) {
      document.getElementById("np-nav").classList.add("np-mintro");
    }
  } catch (e) {}
})();
