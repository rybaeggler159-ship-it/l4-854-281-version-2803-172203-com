(function () {
  function setup(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-cover");
    var url = shell.getAttribute("data-video-src");
    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (loaded || !video || !url) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
      loaded = true;
    }

    function play() {
      load();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("error", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
          loaded = false;
        }
      });
    }
  }

  document.querySelectorAll(".js-player").forEach(setup);
})();
