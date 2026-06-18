(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      menuButton.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  function applyFilter(scope) {
    var searchInput = scope.querySelector('[data-filter-search]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
    var count = scope.querySelector('[data-filter-count]');
    var emptyMessage = scope.querySelector('[data-empty-message]');

    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = String(visible);
    }

    if (emptyMessage) {
      emptyMessage.hidden = visible !== 0;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var searchInput = scope.querySelector('[data-filter-search]');
    var fields = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-search], [data-filter-year], [data-filter-type]'));

    if (scope.hasAttribute('data-read-query') && searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q) {
        searchInput.value = q;
      }
    }

    fields.forEach(function (field) {
      field.addEventListener('input', function () {
        applyFilter(scope);
      });

      field.addEventListener('change', function () {
        applyFilter(scope);
      });
    });

    applyFilter(scope);
  });
})();

function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var mask = document.getElementById(config.maskId);
  var source = config.source;
  var hlsInstance = null;
  var started = false;

  if (!video || !mask || !source) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }

    started = true;
    mask.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  mask.addEventListener('click', attachSource);

  video.addEventListener('click', function () {
    if (!started) {
      attachSource();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
