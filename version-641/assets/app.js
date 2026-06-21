(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startAuto();
      });
    });

    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startAuto();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startAuto();
      });
    }
    hero.addEventListener("mouseenter", stopAuto);
    hero.addEventListener("mouseleave", startAuto);
    showSlide(0);
    startAuto();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
  filterInputs.forEach(function (input) {
    var targetSelector = input.getAttribute("data-search") || "[data-card]";
    var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
    var empty = document.querySelector(input.getAttribute("data-empty") || "");

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  });

  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-filter-value") || "";
        var input = document.querySelector(chip.getAttribute("data-filter-input") || "[data-search]");
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        if (input) {
          input.value = value;
          input.dispatchEvent(new Event("input"));
        }
      });
    });
  }
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-video");
  var overlay = document.getElementById("play-overlay");
  var button = document.getElementById("play-button");
  if (!video || !streamUrl) {
    return;
  }
  var bound = false;
  var hlsInstance = null;

  function bindStream() {
    if (bound) {
      return;
    }
    bound = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    bindStream();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo();
    });
  }
  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }
  });
}
