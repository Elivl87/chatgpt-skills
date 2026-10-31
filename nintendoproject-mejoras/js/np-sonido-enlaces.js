document.addEventListener("DOMContentLoaded", () => {
  const a = document.getElementById("link-sound");
  document.querySelectorAll("a[href]").forEach((l) => {
    if (
      l.target !== "_blank" &&
      !l.hasAttribute("download") &&
      !l.href.startsWith("javascript:")
    ) {
      l.addEventListener("click", (e) => {
        e.preventDefault();
        a.currentTime = 0;
        a.play();
        setTimeout(() => {
          window.location = l.href;
        }, 75);
      });
    }
  });
});
