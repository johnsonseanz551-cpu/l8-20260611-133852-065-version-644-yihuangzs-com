(function () {
  function initVideoPlayer(url) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("moviePlayButton");
    var overlay = document.getElementById("moviePlayOverlay");
    var loaded = false;
    var hls = null;

    if (!video || !button || !overlay) {
      return;
    }

    function attach() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              hls.destroy();
              hls = null;
              loaded = false;
            }
          });
        });
      }
      video.src = url;
      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        overlay.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        play();
      }
    });

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("pause", function () {
      if (loaded && video.currentTime > 0 && !video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  }

  window.initVideoPlayer = initVideoPlayer;
})();
