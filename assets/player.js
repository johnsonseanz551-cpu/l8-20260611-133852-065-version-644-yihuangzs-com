(function () {
  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-overlay');
    var stream = shell.getAttribute('data-stream');

    if (!video || !stream || shell.getAttribute('data-ready') === '1') {
      if (video) {
        video.play().catch(function () {});
      }
      if (button) {
        button.classList.add('is-hidden');
      }
      return;
    }

    shell.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    video.play().catch(function () {});
  }

  document.querySelectorAll('.js-video-player').forEach(function (shell) {
    var button = shell.querySelector('.player-overlay');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (!shell.getAttribute('data-ready')) {
          startPlayer(shell);
        }
      });
    }
  });
})();
