(function () {
  const root = document.documentElement.dataset.root || '';

  function withRoot(path) {
    if (!path) {
      return root;
    }

    if (/^(https?:)?\/\//.test(path) || path.startsWith('#')) {
      return path;
    }

    return root + path;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function renderSearchResults(query, panel) {
    const data = window.MOVIE_SEARCH_DATA || [];
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }

    const results = data
      .filter(function (item) {
        const haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          (item.tags || []).join(' '),
          item.desc,
        ].join(' ').toLowerCase();

        return haystack.includes(normalized);
      })
      .slice(0, 12);

    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
      panel.classList.add('is-open');
      return;
    }

    panel.innerHTML = results
      .map(function (item) {
        return `
          <a class="search-result" href="${escapeHtml(withRoot(item.url))}">
            <img src="${escapeHtml(withRoot(item.image))}" alt="${escapeHtml(item.title)}" loading="lazy">
            <span>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.region)} · ${escapeHtml(item.year)} · ${escapeHtml(item.type)}</span>
            </span>
          </a>
        `;
      })
      .join('');

    panel.classList.add('is-open');
  }

  function setupGlobalSearch() {
    document.querySelectorAll('[data-global-search]').forEach(function (input) {
      const panel = input.closest('.search-box').querySelector('[data-search-panel]');

      if (!panel) {
        return;
      }

      input.addEventListener('input', function () {
        renderSearchResults(input.value, panel);
      });

      input.addEventListener('focus', function () {
        renderSearchResults(input.value, panel);
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.search-box')) {
        document.querySelectorAll('[data-search-panel]').forEach(function (panel) {
          panel.classList.remove('is-open');
        });
      }
    });
  }

  function setupPageFilters() {
    const cardList = document.querySelector('[data-card-list]');

    if (!cardList) {
      return;
    }

    const cards = Array.from(cardList.querySelectorAll('[data-card]'));
    const searchInput = document.querySelector('[data-page-search]');
    const filters = Array.from(document.querySelectorAll('[data-page-filter]'));
    const clearButton = document.querySelector('[data-clear-filters]');
    const countNode = document.querySelector('[data-filter-count]');

    function applyFilters() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const activeFilters = {};

      filters.forEach(function (select) {
        activeFilters[select.dataset.pageFilter] = select.value;
      });

      let visibleCount = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags,
          card.textContent,
        ].join(' ').toLowerCase();

        const matchesQuery = !query || text.includes(query);
        const matchesFilters = Object.entries(activeFilters).every(function ([key, value]) {
          return !value || card.dataset[key] === value;
        });
        const visible = matchesQuery && matchesFilters;

        card.classList.toggle('is-filtered-out', !visible);

        if (visible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = `共 ${visibleCount} 部影片`;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filters.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }

        filters.forEach(function (select) {
          select.value = '';
        });

        applyFilters();
      });
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector(`script[src="${src}"]`);

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initializeHls(video, source) {
    function startPlayback() {
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      startPlayback();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
      return;
    }

    loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest')
      .then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          initializeHls(video, source);
        } else {
          video.src = source;
          startPlayback();
        }
      })
      .catch(function () {
        video.src = source;
        startPlayback();
      });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      const video = player.querySelector('video[data-src]');
      const button = player.querySelector('[data-play-button]');

      if (!video || !button) {
        return;
      }

      button.addEventListener('click', function () {
        const source = video.dataset.src;
        button.classList.add('is-hidden');
        initializeHls(video, source);
      });
    });

    document.querySelectorAll('[data-scroll-player]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        const player = document.querySelector('[data-player]');

        if (player) {
          player.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      });
    });
  }

  function setupImageFallback() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        image.closest('.movie-card__cover, .category-card__thumbs, .hero-feature, .detail-poster, .spotlight-card')?.classList.add('image-fallback');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupGlobalSearch();
    setupPageFilters();
    setupPlayers();
    setupImageFallback();
  });
})();
