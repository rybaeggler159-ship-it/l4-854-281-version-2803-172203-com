const mobileButton = document.querySelector('[data-mobile-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', () => {
        mobilePanel.classList.toggle('open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const showSlide = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === index);
        });
    };

    const startTimer = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => showSlide(index + 1), 5200);
    };

    previous?.addEventListener('click', () => {
        showSlide(index - 1);
        startTimer();
    });

    next?.addEventListener('click', () => {
        showSlide(index + 1);
        startTimer();
    });

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            startTimer();
        });
    });

    showSlide(0);
    startTimer();
}

const filterInput = document.querySelector('[data-card-filter]');
const filterCount = document.querySelector('[data-filter-count]');
const cardList = document.querySelector('[data-card-list]');

if (filterInput && cardList) {
    const cards = Array.from(cardList.querySelectorAll('.movie-card'));
    const updateFilter = () => {
        const keyword = filterInput.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
            const text = card.textContent.toLowerCase();
            const matched = !keyword || text.includes(keyword);
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (filterCount) {
            filterCount.textContent = `${visible} 部`;
        }
    };
    filterInput.addEventListener('input', updateFilter);
    updateFilter();
}

const players = Array.from(document.querySelectorAll('.video-player[data-stream-url]'));

const loadVideo = async (video) => {
    const streamUrl = video.dataset.streamUrl;
    const box = video.closest('.player-box');
    const button = box?.querySelector('.player-start');
    const status = box?.querySelector('[data-player-status]');

    if (!streamUrl) {
        return;
    }

    if (status) {
        status.textContent = '视频加载中...';
    }

    try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = streamUrl;
            }
        } else {
            const module = await import('./hls-vendor.js');
            const Hls = module.H;
            if (Hls && Hls.isSupported()) {
                if (!video.dataset.hlsReady) {
                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    video.dataset.hlsReady = 'true';
                }
            } else {
                video.src = streamUrl;
            }
        }

        button?.classList.add('hidden');
        await video.play();
        if (status) {
            status.textContent = '';
        }
    } catch (error) {
        if (status) {
            status.textContent = '播放失败，请稍后重试。';
        }
        button?.classList.remove('hidden');
    }
};

players.forEach((video) => {
    const box = video.closest('.player-box');
    const button = box?.querySelector('.player-start');
    button?.addEventListener('click', () => loadVideo(video));
    video.addEventListener('play', () => button?.classList.add('hidden'));
});
