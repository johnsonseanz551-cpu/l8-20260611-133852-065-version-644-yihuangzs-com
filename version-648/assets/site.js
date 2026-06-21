(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var header = document.querySelector('[data-site-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || input.value.trim() === '') {
          return;
        }
        event.preventDefault();
        var action = form.getAttribute('action') || 'search.html';
        window.location.href = action + '?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  function setupFilters() {
    document.querySelectorAll('[data-list-filter]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var categorySelect = panel.querySelector('[data-filter-category]');
      var countTarget = panel.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var category = normalize(categorySelect && categorySelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var search = normalize(card.getAttribute('data-search'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var matched = true;

          if (keyword && search.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (category && cardCategory !== category) {
            matched = false;
          }

          card.classList.toggle('is-hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (countTarget) {
          countTarget.textContent = String(visible);
        }
      }

      if (panel.hasAttribute('data-sync-query') && keywordInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
          keywordInput.value = query;
        }
      }

      [keywordInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  ready(function () {
    setupNavigation();
    setupHeaderSearch();
    setupHero();
    setupFilters();
  });
})();
