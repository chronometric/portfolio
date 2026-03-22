/**
 * Background music: autoplay when allowed, muted fallback + unlock on gesture,
 * mute toggle, next track (data/audio/*.mp3).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'portfolio-bg-audio-muted';
  var DEFAULT_VOLUME = 0.32;
  var RS_CURRENT = 2; // HTMLMediaElement.HAVE_CURRENT_DATA

  /** Order = skip order; add/remove files to match data/audio/ */
  var TRACKS = [
    'data/audio/A.mp3',
    'data/audio/G.mp3',
    'data/audio/H.mp3',
    'data/audio/I.mp3',
    'data/audio/J.mp3',
    'data/audio/K.mp3',
    'data/audio/L.mp3',
    'data/audio/W.mp3',
    'data/audio/X.mp3',
    '1.mp3'
  ];

  var audio = document.getElementById('bg-audio');
  var btn = document.getElementById('bg-audio-toggle');
  var nextBtn = document.getElementById('bg-audio-next');
  if (!audio || !btn) return;

  var iconPlaying = btn.querySelector('[data-audio-icon="playing"]');
  var iconMuted = btn.querySelector('[data-audio-icon="muted"]');
  var iconPaused = btn.querySelector('[data-audio-icon="paused"]');
  var nextIconActive = nextBtn && nextBtn.querySelector('[data-next-icon="active"]');
  var nextIconIdle = nextBtn && nextBtn.querySelector('[data-next-icon="idle"]');

  var trackIndex = 0;

  var pendingSoundUnlock = false;
  var autoplayAttempted = false;

  function syncTrackIndexFromDom() {
    var el = audio.querySelector('source');
    var src = el && el.getAttribute('src');
    if (!src) return;
    var i = TRACKS.indexOf(src);
    if (i >= 0) trackIndex = i;
  }

  function replaceTrackSource(url) {
    while (audio.firstChild) {
      audio.removeChild(audio.firstChild);
    }
    var source = document.createElement('source');
    source.src = url;
    source.type = 'audio/mpeg';
    audio.appendChild(source);
  }

  function userPrefersMuted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function applyStoredMute() {
    if (userPrefersMuted()) {
      audio.muted = true;
    }
  }

  function persistMute() {
    try {
      localStorage.setItem(STORAGE_KEY, audio.muted ? '1' : '0');
    } catch (e) { /* ignore */ }
  }

  function syncButton() {
    var paused = audio.paused;
    var muted = audio.muted;

    btn.classList.remove(
      'bg-audio-toggle--state-playing',
      'bg-audio-toggle--state-muted',
      'bg-audio-toggle--state-paused',
      'bg-audio-toggle--pulse'
    );

    if (nextBtn) {
      nextBtn.classList.toggle('bg-audio-dock__next--playing', !paused);
      nextBtn.classList.toggle('bg-audio-dock__next--paused', paused);
    }

    if (nextBtn && nextIconActive && nextIconIdle) {
      if (paused) {
        nextIconActive.hidden = true;
        nextIconIdle.hidden = false;
      } else {
        nextIconActive.hidden = false;
        nextIconIdle.hidden = true;
      }
    }

    if (iconPlaying && iconMuted && iconPaused) {
      if (paused) {
        iconPlaying.hidden = true;
        iconMuted.hidden = true;
        iconPaused.hidden = false;
        btn.classList.add('bg-audio-toggle--state-paused');
        btn.removeAttribute('aria-pressed');
        btn.setAttribute('aria-label', 'Play background music');
        btn.title = 'Play background music';
      } else if (pendingSoundUnlock && muted) {
        iconPlaying.hidden = true;
        iconMuted.hidden = false;
        iconPaused.hidden = true;
        btn.classList.add('bg-audio-toggle--pulse');
        btn.removeAttribute('aria-pressed');
        btn.setAttribute('aria-label', 'Tap anywhere or here to turn on sound');
        btn.title = 'Tap anywhere or here to turn on sound';
      } else if (muted) {
        iconPlaying.hidden = true;
        iconMuted.hidden = false;
        iconPaused.hidden = true;
        btn.classList.add('bg-audio-toggle--state-muted');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Unmute background music');
        btn.title = 'Unmute background music';
      } else {
        iconPlaying.hidden = false;
        iconMuted.hidden = true;
        iconPaused.hidden = true;
        btn.classList.add('bg-audio-toggle--state-playing');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Mute background music');
        btn.title = 'Mute background music';
      }
    }
  }

  function tryPlayMutedPolicyFallback() {
    if (!audio.paused || userPrefersMuted()) return;

    audio.muted = true;
    pendingSoundUnlock = true;
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        syncButton();
      }).catch(function () {
        pendingSoundUnlock = false;
        syncButton();
      });
    } else {
      syncButton();
    }
  }

  function tryPlayUnmuted() {
    if (!audio.paused || userPrefersMuted()) return;

    audio.muted = false;
    pendingSoundUnlock = false;
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        syncButton();
      }).catch(function () {
        tryPlayMutedPolicyFallback();
      });
    } else {
      syncButton();
    }
  }

  function beginAutoplay() {
    if (autoplayAttempted) return;
    if (audio.error) {
      autoplayAttempted = true;
      syncButton();
      return;
    }
    if (audio.readyState < RS_CURRENT) return;

    autoplayAttempted = true;

    if (userPrefersMuted()) {
      syncButton();
      return;
    }

    tryPlayUnmuted();
  }

  function onUserActivate() {
    if (pendingSoundUnlock && !userPrefersMuted()) {
      audio.muted = false;
      pendingSoundUnlock = false;
      try {
        localStorage.setItem(STORAGE_KEY, '0');
      } catch (e) { /* ignore */ }
      if (audio.paused) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      }
      syncButton();
      return;
    }

    if (audio.paused && !userPrefersMuted()) {
      audio.muted = false;
      pendingSoundUnlock = false;
      var q = audio.play();
      if (q && q.catch) q.catch(function () {});
      syncButton();
    }
  }

  function playCurrentTrackAfterLoad() {
    if (userPrefersMuted()) {
      audio.muted = true;
      pendingSoundUnlock = false;
      var pm = audio.play();
      if (pm && pm.catch) pm.catch(syncButton);
    } else {
      audio.muted = false;
      pendingSoundUnlock = false;
      var pu = audio.play();
      if (pu && pu.then) {
        pu.then(syncButton).catch(function () {
          tryPlayMutedPolicyFallback();
        });
      }
    }
    syncButton();
  }

  syncTrackIndexFromDom();

  audio.volume = DEFAULT_VOLUME;
  applyStoredMute();
  syncButton();

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      trackIndex = (trackIndex + 1) % TRACKS.length;
      replaceTrackSource(TRACKS[trackIndex]);
      audio.load();

      var start = function () {
        playCurrentTrackAfterLoad();
      };

      if (audio.readyState >= RS_CURRENT) {
        start();
      } else {
        audio.addEventListener(
          'canplay',
          function onReady() {
            audio.removeEventListener('canplay', onReady);
            start();
          },
          { once: true }
        );
      }
    });
  }

  btn.addEventListener('click', function () {
    if (audio.paused) {
      if (userPrefersMuted()) {
        audio.muted = true;
      } else {
        audio.muted = false;
        pendingSoundUnlock = false;
      }
      var p = audio.play();
      if (p && p.catch) {
        p.catch(function () {
          syncButton();
        });
      }
      persistMute();
    } else {
      if (pendingSoundUnlock) {
        audio.muted = false;
        pendingSoundUnlock = false;
        try {
          localStorage.setItem(STORAGE_KEY, '0');
        } catch (e) { /* ignore */ }
      } else {
        audio.muted = !audio.muted;
      }
      persistMute();
    }
    syncButton();
  });

  audio.addEventListener('play', syncButton);
  audio.addEventListener('pause', syncButton);
  audio.addEventListener('volumechange', syncButton);

  audio.addEventListener('error', function () {
    pendingSoundUnlock = false;
    autoplayAttempted = true;
    syncButton();
  });

  audio.addEventListener('canplay', beginAutoplay);
  audio.addEventListener('loadeddata', beginAutoplay);

  beginAutoplay();
  setTimeout(beginAutoplay, 50);
  setTimeout(beginAutoplay, 300);

  document.addEventListener('pointerdown', onUserActivate, { passive: true });
  document.addEventListener('keydown', onUserActivate);
  document.addEventListener('touchstart', onUserActivate, { passive: true });

  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) {
      autoplayAttempted = false;
      beginAutoplay();
    }
  });
})();
