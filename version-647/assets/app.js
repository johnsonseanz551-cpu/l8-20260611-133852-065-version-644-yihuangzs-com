(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("is-open");
        toggle.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function activate(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          activate(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          activate(Number(dot.getAttribute("data-slide") || 0));
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          activate(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          activate(index + 1);
          restart();
        });
      }

      restart();
    }

    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var input = scope.querySelector(".site-search");
      var chips = Array.prototype.slice.call(scope.querySelectorAll(".filter-chip"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var currentFilter = "all";

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var matchText = !keyword || haystack.indexOf(keyword) !== -1;
          var matchFilter = currentFilter === "all" || category === currentFilter;
          card.classList.toggle("is-hidden", !(matchText && matchFilter));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          currentFilter = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          applyFilter();
        });
      });
    });
  });
})();
