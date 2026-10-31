(function () {
  "use strict";
  if (!("IntersectionObserver" in window)) return;

  function waitForElementor(cb) {
    if (window.elementorFrontend && window.elementorFrontend.hooks) {
      cb();
    } else {
      document.addEventListener("elementor/frontend/init", cb, { once: true });
    }
  }

  waitForElementor(function () {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var widget = entry.target;
          obs.unobserve(widget);
          var swiperEl = widget.querySelector(".swiper");
          if (!swiperEl || !swiperEl.swiper) return;
          var swiper = swiperEl.swiper;
          swiper.update();
          if (swiper.params.autoplay && swiper.params.autoplay.enabled) {
            swiper.autoplay.start();
          }
        });
      },
      { rootMargin: "300px 0px", threshold: 0 },
    );

    var carouselWidgets = document.querySelectorAll(
      ".elementor-widget-holaa-category-slider-widget, " +
        '[data-widget_type="carousel.default"], ' +
        '[data-widget_type="media-carousel.default"], ' +
        '[data-widget_type="testimonial-carousel.default"], ' +
        '[data-widget_type*="carousel"]',
    );

    carouselWidgets.forEach(function (widget, index) {
      var swiperEl = widget.querySelector(".swiper");

      // El primero (above the fold) se deja normal para no retrasar el LCP
      if (index === 0) {
        if (swiperEl && swiperEl.swiper) swiperEl.swiper.update();
        return;
      }

      // El resto: autoplay parado hasta que sean visibles
      if (swiperEl && swiperEl.swiper && swiperEl.swiper.autoplay) {
        swiperEl.swiper.autoplay.stop();
      }
      observer.observe(widget);
    });
  });
})();
