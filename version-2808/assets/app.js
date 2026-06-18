(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initLocalFilter() {
        var filterForm = qs('[data-local-filter-form]');
        if (!filterForm) {
            return;
        }
        var input = qs('[data-local-filter]', filterForm);
        var type = qs('[data-local-type]', filterForm);
        var cards = qsa('[data-card]');

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var selectedType = type ? type.value.trim() : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var typeValue = card.getAttribute('data-type') || '';
                var matchedQuery = !query || haystack.indexOf(query) >= 0;
                var matchedType = !selectedType || typeValue.indexOf(selectedType) >= 0;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedType));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (type) {
            type.addEventListener('change', apply);
        }
    }

    function createSearchCard(movie) {
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<span class="poster-wrap">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="card-badge">' + escapeHtml(movie.category) + '</span>',
            '</span>',
            '<span class="card-body">',
            '<strong>' + escapeHtml(movie.title) + '</strong>',
            '<span class="card-desc">' + escapeHtml(movie.description) + '</span>',
            '<span class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></span>',
            '</span>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initSearchPage() {
        var results = qs('[data-search-results]');
        var form = qs('[data-search-page-form]');
        var summary = qs('[data-search-summary]');
        if (!results || !form || !window.MovieSearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = form.elements.q;
        var category = form.elements.category;
        var type = form.elements.type;
        input.value = params.get('q') || '';
        category.value = params.get('category') || '';
        type.value = params.get('type') || '';

        function render() {
            var query = input.value.trim().toLowerCase();
            var categoryValue = category.value.trim();
            var typeValue = type.value.trim();
            var matched = window.MovieSearchIndex.filter(function (movie) {
                var text = [movie.title, movie.description, movie.tags, movie.genre, movie.region, movie.year, movie.type, movie.category]
                    .join(' ')
                    .toLowerCase();
                var queryOk = !query || text.indexOf(query) >= 0;
                var categoryOk = !categoryValue || movie.category === categoryValue;
                var typeOk = !typeValue || movie.type.indexOf(typeValue) >= 0;
                return queryOk && categoryOk && typeOk;
            }).slice(0, 160);
            results.innerHTML = matched.map(createSearchCard).join('');
            if (summary) {
                summary.textContent = matched.length ? '为你匹配到 ' + matched.length + ' 条内容' : '未找到匹配内容';
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var nextParams = new URLSearchParams();
            if (input.value.trim()) {
                nextParams.set('q', input.value.trim());
            }
            if (category.value) {
                nextParams.set('category', category.value);
            }
            if (type.value) {
                nextParams.set('type', type.value);
            }
            var queryString = nextParams.toString();
            window.history.replaceState(null, '', queryString ? './search.html?' + queryString : './search.html');
            render();
        });
        category.addEventListener('change', render);
        type.addEventListener('change', render);
        render();
    }

    function setupPlayer(source) {
        var video = qs('[data-player]');
        var cover = qs('[data-play-cover]');
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }
            attached = true;
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.SitePlayer = {
        setup: setupPlayer
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initLocalFilter();
        initSearchPage();
    });
})();
