(function () {
  var header = document.querySelector('.site-header');
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var backToTop = document.querySelector('[data-back-to-top]');

  function onScroll() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }
    if (backToTop) {
      backToTop.classList.toggle('is-visible', window.scrollY > 420);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        schedule();
      });
    }

    showSlide(0);
    schedule();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function filterCards(value) {
    var words = String(value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    var visible = 0;

    filterItems.forEach(function (item) {
      var text = (item.getAttribute('data-filter-text') || '').toLowerCase();
      var matched = words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
      item.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput && filterItems.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query && !filterInput.value) {
      filterInput.value = query;
    }
    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
    filterCards(filterInput.value);
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
