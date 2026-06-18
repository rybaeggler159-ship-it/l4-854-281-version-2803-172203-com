(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var menu = qs('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    show(0);
    play();
  }

  var filterInput = qs('[data-card-filter]');
  var cardList = qs('[data-card-list]');
  var chips = qsa('[data-filter-term]');
  var activeTerm = '';

  function applyCardFilter() {
    if (!cardList) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    qsa('[data-movie-card]', cardList).forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedTerm = !activeTerm || text.indexOf(activeTerm) !== -1;
      card.classList.toggle('is-hidden', !(matchedKeyword && matchedTerm));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyCardFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeTerm = chip.getAttribute('data-filter-term') || '';
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyCardFilter();
    });
  });

  var searchResults = qs('[data-search-results]');
  var searchStatus = qs('[data-search-status]');
  var searchInput = qs('[data-search-input]');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function resultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card" data-movie-card>' +
      '<a class="card-cover" href="./' + escapeHtml(movie.file) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="card-type">' + escapeHtml(movie.type) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</p>' +
      '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function renderSearch() {
    if (!searchResults || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    if (searchInput) {
      searchInput.value = keyword;
    }
    if (!keyword) {
      searchStatus.textContent = '输入关键词即可浏览相关内容';
      searchResults.innerHTML = '';
      return;
    }
    var lower = keyword.toLowerCase();
    var list = window.SITE_MOVIES.filter(function (movie) {
      return movie.search.indexOf(lower) !== -1;
    }).slice(0, 240);
    searchStatus.textContent = list.length ? '找到与“' + keyword + '”相关的内容' : '未找到与“' + keyword + '”相关的内容';
    searchResults.innerHTML = list.map(resultCard).join('');
  }

  renderSearch();
}());
