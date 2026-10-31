(function () {
  "use strict";
  function FORCE() {
    var wii = document.getElementById("wii-cursor-global");
    var overlay = document.getElementById("nintendoIntro");
    if (wii && overlay) {
      wii.style.cssText =
        "position:fixed;z-index:2147483647;pointer-events:none;display:block;opacity:1";
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", FORCE);
  } else {
    FORCE();
  }
  if ("MutationObserver" in window) {
    new MutationObserver(FORCE).observe(document.body, {
      childList: !0,
      subtree: !1,
    });
  }
})();
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const cursor = document.getElementById("wii-cursor-global");
    const body = document.body;
    if (!cursor) return;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;
    cursor.onerror = function () {
      console.warn(
        "Wii Cursor: Error cargando imagen. Revertiendo a cursor normal.",
      );
      body.classList.remove("wii-mode-active");
      cursor.style.display = "none";
    };
    let mouseX = -100;
    let mouseY = -100;
    let isMoving = !1;
    body.classList.add("wii-mode-active");
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursor.style.opacity === "0" || cursor.style.opacity === "") {
        cursor.style.opacity = "1";
      }
      if (!isMoving) {
        isMoving = !0;
        requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${mouseX - 12}px, ${mouseY - 5}px, 0)`;
          isMoving = !1;
        });
      }
    });
    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        body.classList.remove("wii-mode-active");
        cursor.style.display = "none";
      }
    });
  });
})();
