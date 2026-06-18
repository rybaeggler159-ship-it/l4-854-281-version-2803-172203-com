(function () {
  var searchData = window.SITE_SEARCH_DATA || [];

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function attachGlobalSearch(input) {
    var results = input.parentElement.querySelector("[data-search-results]");
    if (!results) {
      return;
    }

    function closeResults() {
      results.classList.remove("is-open");
      results.innerHTML = "";
    }

    function render(items) {
      if (!items.length) {
        closeResults();
        return;
      }
      results.innerHTML = items.map(function (item) {
        var title = escapeHtml(item.title);
        var region = escapeHtml(item.region);
        var year = escapeHtml(item.year);
        var type = escapeHtml(item.type);
        var link = escapeHtml(item.link);
        var cover = escapeHtml(item.cover);
        return [
          '<a href="' + link + '">',
          '<img src="' + cover + '" alt="' + title + '">',
          '<span><strong>' + title + '</strong><span>' + region + ' · ' + year + ' · ' + type + '</span></span>',
          '</a>'
        ].join("");
      }).join("");
      results.classList.add("is-open");
    }

    input.addEventListener("input", function () {
      var query = normalize(input.value);
      if (!query) {
        closeResults();
        return;
      }
      var terms = query.split(/\s+/).filter(Boolean);
      var items = searchData.filter(function (item) {
        var text = normalize([item.title, item.region, item.type, item.year, item.genre, item.category].join(" "));
        return terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
      }).slice(0, 8);
      render(items);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        var firstLink = results.querySelector("a");
        if (firstLink) {
          window.location.href = firstLink.getAttribute("href");
        }
      }
      if (event.key === "Escape") {
        closeResults();
      }
    });

    document.addEventListener("click", function (event) {
      if (!input.parentElement.contains(event.target)) {
        closeResults();
      }
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var search = document.querySelector("[data-local-search]");
    var type = document.querySelector("[data-type-filter]");
    var year = document.querySelector("[data-year-filter]");
    var empty = document.querySelector("[data-no-results]");

    function apply() {
      var query = normalize(search && search.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(" "));
        var matchText = !query || text.indexOf(query) !== -1;
        var matchType = !selectedType || normalize(card.dataset.type) === selectedType;
        var matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        var matched = matchText && matchType && matchYear;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  document.querySelectorAll("[data-global-search]").forEach(attachGlobalSearch);
  setupMenu();
  setupHero();
  setupFilters();
})();
