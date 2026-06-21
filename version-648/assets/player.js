import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(container) {
  var video = container.querySelector('video');
  var toggle = container.querySelector('[data-player-toggle]');
  var source = container.getAttribute('data-video-src');
  var hasInitialized = false;

  if (!video || !source) {
    return;
  }

  function initialize() {
    if (hasInitialized) {
      return;
    }
    hasInitialized = true;

    if (/\.m3u8($|\?)/i.test(source)) {
      if (Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        container._hlsInstance = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    } else {
      video.src = source;
    }
  }

  function play() {
    initialize();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        container.classList.remove('is-playing');
      });
    }
  }

  if (toggle) {
    toggle.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    container.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    container.classList.remove('is-playing');
  });

  video.addEventListener('ended', function () {
    container.classList.remove('is-playing');
  });

  initialize();
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
