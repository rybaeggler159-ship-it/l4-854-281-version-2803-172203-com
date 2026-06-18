(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';

      if (!query) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(query);
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(index + 1);
        schedule();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        schedule();
      });
    });

    schedule();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));

    filterInput.addEventListener('input', function() {
      var query = filterInput.value.trim().toLowerCase();

      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();

        card.style.display = haystack.indexOf(query) === -1 ? 'none' : '';
      });
    });
  }

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var queryText = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');

    if (title && queryText) {
      title.textContent = '“' + queryText + '”的搜索结果';
    }

    var normalized = queryText.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function(movie) {
      if (!normalized) {
        return movie.recommend;
      }

      return movie.text.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (!results.length) {
      searchResults.innerHTML = '<p class="empty-result">没有找到匹配内容，可以更换关键词继续搜索。</p>';
      return;
    }

    searchResults.innerHTML = results.map(function(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + movie.url + '">',
        '    <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
        '    <p>' + movie.oneLine + '</p>',
        '    <div class="meta-row"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }
}());
