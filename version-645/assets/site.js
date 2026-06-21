(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setHeaderState() {
    var header = document.querySelector("[data-site-header]");
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add("shadow-lg");
    } else {
      header.classList.remove("shadow-lg");
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    var icon = document.querySelector("[data-menu-icon]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      if (icon) {
        icon.textContent = panel.classList.contains("is-open") ? "×" : "☰";
      }
    });
    selectAll("[data-mobile-link]", panel).forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
        if (icon) {
          icon.textContent = "☰";
        }
      });
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function setupFilters() {
    var grid = document.querySelector("[data-movie-grid]");
    if (!grid) {
      return;
    }
    var chips = selectAll("[data-filter]");
    var cards = selectAll(".movie-card", grid);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-filter") || "all";
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        cards.forEach(function (card) {
          var tags = card.getAttribute("data-tags") || "";
          if (value === "all" || tags.indexOf(value) !== -1) {
            card.classList.remove("is-filtered");
          } else {
            card.classList.add("is-filtered");
          }
        });
      });
    });
  }

  function setupSorting() {
    var grid = document.querySelector("[data-movie-grid]");
    var select = document.querySelector("[data-sort-select]");
    if (!grid || !select) {
      return;
    }
    select.addEventListener("change", function () {
      var cards = selectAll(".movie-card", grid);
      var mode = select.value;
      cards.sort(function (a, b) {
        if (mode === "views") {
          return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
        }
        if (mode === "year") {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        }
        if (mode === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
        }
        return 0;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function searchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">' + escapeHtml(tag) + '</span>';
    }).join("");
    return '<a href="' + escapeHtml(movie.url) + '" class="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">' +
      '<div class="relative h-48 overflow-hidden">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">' +
        '<div class="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-full">' + escapeHtml(movie.category) + '</div>' +
      '</div>' +
      '<div class="p-4">' +
        '<h3 class="font-bold text-lg mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">' + escapeHtml(movie.title) + '</h3>' +
        '<p class="text-sm text-gray-600 mb-3 line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<div class="flex flex-wrap gap-2">' + tags + '</div>' +
      '</div>' +
    '</a>';
  }

  function setupSearch() {
    var results = document.getElementById("searchResults");
    var summary = document.getElementById("searchSummary");
    var empty = document.getElementById("searchEmpty");
    var input = document.getElementById("searchInput");
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      results.innerHTML = "";
      if (summary) {
        summary.textContent = "输入关键词开始搜索。";
      }
      return;
    }
    var lower = query.toLowerCase();
    var matched = window.SITE_MOVIES.filter(function (movie) {
      var haystack = [movie.title, movie.category, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].concat(movie.tags || []).join(" ").toLowerCase();
      return haystack.indexOf(lower) !== -1;
    });
    if (summary) {
      summary.textContent = '搜索结果：“' + query + '”';
    }
    if (empty) {
      empty.classList.add("is-hidden");
    }
    if (!matched.length) {
      results.innerHTML = '<div class="col-span-full text-center py-16 bg-white rounded-xl shadow-md"><div class="text-6xl mb-4">⌕</div><h2 class="text-xl font-bold text-gray-800 mb-2">未找到相关影片</h2><p class="text-gray-600">试试更换关键词。</p></div>';
      return;
    }
    results.innerHTML = matched.slice(0, 200).map(searchCard).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupBackTop();
    setupFilters();
    setupSorting();
    setupSearch();
    setHeaderState();
  });

  window.addEventListener("scroll", setHeaderState);
})();
