(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }

                index = (nextIndex + slides.length) % slides.length;

                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });

                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            }

            function schedule() {
                if (timer) {
                    clearInterval(timer);
                }

                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    schedule();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    schedule();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    schedule();
                });
            }

            show(0);
            schedule();
        }

        var searchInput = document.querySelector("[data-search-input]");
        var searchForm = document.querySelector("[data-search-form]");
        var searchItems = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));

        if (searchInput && searchItems.length) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            searchInput.value = initial;

            function applySearch() {
                var query = searchInput.value.trim().toLowerCase();

                searchItems.forEach(function (item) {
                    var text = (item.getAttribute("data-text") || "").toLowerCase();
                    var title = (item.getAttribute("data-title") || "").toLowerCase();
                    var matched = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
                    item.classList.toggle("is-hidden", !matched);
                });
            }

            searchInput.addEventListener("input", applySearch);

            if (searchForm) {
                searchForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    applySearch();
                });
            }

            applySearch();
        }
    });

    window.initMoviePlayer = function (options) {
        var video = document.querySelector(options.selector);
        var button = document.querySelector(options.buttonSelector);

        if (!video || !button || !options.source) {
            return;
        }

        var frame = video.closest(".player-frame");
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(options.source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = options.source;
            }
        }

        function play() {
            prepare();

            if (frame) {
                frame.classList.add("playing");
            }

            var result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (frame) {
                        frame.classList.remove("playing");
                    }
                });
            }
        }

        button.addEventListener("click", play);

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (frame) {
                frame.classList.add("playing");
            }
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && frame) {
                frame.classList.remove("playing");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
