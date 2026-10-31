(function () {
  if (window.NPGuestColors) return;
  window.NPGuestColors = !0;
  var BG = [
    "linear-gradient(135deg, #FFE066, #D4A800)",
    "linear-gradient(135deg, #6BB3FF, #2A6FD4)",
    "linear-gradient(135deg, #FF8DB8, #E0456E)",
    "linear-gradient(135deg, #FF6B6B, #C62828)",
    "linear-gradient(135deg, #B8F5B0, #5BBF52)",
  ];
  var ARROW = ["#D4A800", "#2A6FD4", "#E0456E", "#C62828", "#5BBF52"];
  var CYCLE = 10000,
    STEP = 2000;
  var wraps = [],
    timer = 0,
    start = performance.now();
  function elapsed() {
    for (var i = 0; i < wraps.length; i++) {
      var slot = wraps[i].querySelector(".np-s1");
      if (slot && slot.getAnimations) {
        var a = slot.getAnimations()[0];
        if (a && a.currentTime != null) return a.currentTime;
      }
    }
    return performance.now() - start;
  }
  function paint() {
    var t = elapsed();
    var idx = Math.floor((t % CYCLE) / STEP);
    wraps.forEach(function (w) {
      var badge = w.querySelector(":scope > .np-badge");
      if (badge) {
        badge.style.background = BG[idx];
        var arrow = badge.querySelector(".np-badge-arrow");
        if (arrow) arrow.style.borderTopColor = ARROW[idx];
      }
      w.style.setProperty("--np-ring", BG[idx]);
    });
    clearTimeout(timer);
    timer = setTimeout(paint, STEP - (t % STEP) + 20);
  }
  function init() {
    wraps = Array.prototype.slice.call(
      document.querySelectorAll("#np-nav .np-rotating-avatar-wrap"),
    );
    if (!wraps.length) return;
    wraps.forEach(function (w) {
      w.classList.add("np-js-colors");
    });
    paint();
  }
  document.addEventListener("visibilitychange", function () {
    if (!wraps.length) return;
    if (document.hidden) clearTimeout(timer);
    else paint();
  });
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
