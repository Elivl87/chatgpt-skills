document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("video").forEach((v) => {
    v.muted = !0;
    v.play().catch(() => {});
    v.addEventListener("volumechange", () => {
      if (v.muted && v.volume > 0) v.muted = !1;
    });
  });
});
