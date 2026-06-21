(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var roots = document.querySelectorAll("[data-hero-slider]");
    roots.forEach(function (root) {
      var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
      if (slides.length < 2) {
        return;
      }
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === current);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === current);
        });
      }
      function next() {
        show(current + 1);
      }
      function start() {
        stop();
        timer = window.setInterval(next, 6200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", start);
      start();
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupFilters() {
    var roots = document.querySelectorAll("[data-filter-root]");
    roots.forEach(function (root) {
      var input = root.querySelector(".js-search-field");
      var year = root.querySelector(".js-year-filter");
      var items = Array.prototype.slice.call(root.querySelectorAll(".js-movie-item"));
      var empty = root.querySelector(".js-empty-state");
      if (!items.length) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }
      function apply() {
        var term = normalize(input ? input.value : "");
        var selectedYear = year ? year.value : "";
        var visible = 0;
        items.forEach(function (item) {
          var text = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-year"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags")
          ].join(" "));
          var matchTerm = !term || text.indexOf(term) !== -1;
          var matchYear = !selectedYear || item.getAttribute("data-year") === selectedYear;
          var matched = matchTerm && matchYear;
          item.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      apply();
    });
  }

  window.VideoPlayer = {
    start: function (videoId, coverId, url) {
      var video = document.getElementById(videoId);
      var cover = document.getElementById(coverId);
      if (!video || !cover || !url) {
        return;
      }
      var loaded = false;
      var hls = null;
      function playVideo() {
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }
      function loadVideo() {
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = url;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
        }
      }
      function activate() {
        cover.classList.add("is-hidden");
        loadVideo();
      }
      cover.addEventListener("click", activate);
      video.addEventListener("click", function () {
        if (!loaded) {
          activate();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
