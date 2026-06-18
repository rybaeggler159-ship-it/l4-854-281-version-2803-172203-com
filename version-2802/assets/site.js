const MovieSite = (() => {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    let current = 0;
    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => activate(index));
    });
    activate(0);
    window.setInterval(() => activate(current + 1), 5600);
  }

  function setupFilter() {
    const panels = Array.from(document.querySelectorAll(".filter-panel"));
    panels.forEach((panel) => {
      const section = panel.closest("section") || document;
      const list = section.querySelector("[data-filter-list]") || document.querySelector("[data-filter-list]");
      const input = panel.querySelector("[data-filter-input]");
      const buttons = Array.from(panel.querySelectorAll("[data-category-filter]"));
      if (!list) {
        return;
      }
      const cards = Array.from(list.querySelectorAll(".movie-card"));
      let active = "";
      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }
      function apply() {
        const keyword = normalize(input ? input.value : "");
        cards.forEach((card) => {
          const text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.category,
            card.textContent
          ].join(" "));
          const matchKeyword = !keyword || text.includes(keyword);
          const matchActive = !active || text.includes(normalize(active));
          card.classList.toggle("is-filtered-out", !(matchKeyword && matchActive));
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          buttons.forEach((item) => item.classList.remove("is-active"));
          button.classList.add("is-active");
          active = button.dataset.categoryFilter || "";
          apply();
        });
      });
      apply();
    });
  }

  function initPlayer(videoId, overlayId, source) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }
    let attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
      }
    }
    function play() {
      attach();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          video.controls = true;
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", () => {
      if (!attached || video.paused) {
        play();
      }
    });
  }

  ready(() => {
    setupMenu();
    setupHero();
    setupFilter();
  });

  return { initPlayer };
})();
