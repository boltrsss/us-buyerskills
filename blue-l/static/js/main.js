(function () {
  'use strict';

  /* Dates use the visitor's locale and device timezone, including at midnight. */
  var locale = navigator.languages && navigator.languages.length ? navigator.languages : navigator.language;
  var dateFormat = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  var timeFormat = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' });
  var yearFormat = new Intl.DateTimeFormat(locale, { year: 'numeric' });

  function localISO(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function renderLocalDates() {
    var now = new Date();
    document.querySelectorAll('[data-local-date]').forEach(function (element) {
      element.textContent = dateFormat.format(now);
      element.setAttribute('datetime', localISO(now));
    });
    document.querySelectorAll('[data-local-time="end-of-day"]').forEach(function (element) {
      var deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
      element.textContent = timeFormat.format(deadline);
      element.setAttribute('datetime', '23:59');
    });
    document.querySelectorAll('[data-local-year]').forEach(function (element) {
      element.textContent = yearFormat.format(now);
    });
  }

  document.querySelectorAll('[data-date]').forEach(function (element) {
    var parts = element.getAttribute('data-date').split('-');
    /* A local calendar date avoids UTC conversion shifting old reviews by a day. */
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12);
    if (!isNaN(date.getTime())) element.textContent = dateFormat.format(date);
  });
  renderLocalDates();
  window.setInterval(renderLocalDates, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) renderLocalDates();
  });

  /* Every video loops inline without native controls; clicks retry blocked play. */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-autoplay]'));

  function fallback(video, visible) {
    var button = video.parentElement.querySelector('.video-play');
    if (button) button.hidden = !visible;
    video.parentElement.classList.toggle('playback-blocked', visible);
  }

  function startVideo(video) {
    video.autoplay = true;
    video.loop = true;
    video.controls = false;
    video.removeAttribute('controls');
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    try {
      var result = video.play();
      if (result && typeof result.then === 'function') {
        result.then(function () { fallback(video, false); }).catch(function () {
          fallback(video, true);
        });
      }
    } catch (error) {
      fallback(video, true);
    }
  }

  function retryVideo(video) {
    if (video.error) video.load();
    startVideo(video);
  }

  videos.forEach(function (video) {
    video.controls = false;
    video.removeAttribute('controls');
    video.addEventListener('playing', function () {
      video.controls = false;
      fallback(video, false);
    });
    video.addEventListener('error', function () {
      video.controls = false;
      video.removeAttribute('controls');
      fallback(video, true);
    });
    video.addEventListener('ended', function () {
      video.currentTime = 0;
      startVideo(video);
    });
    video.addEventListener('click', function () { retryVideo(video); });
    var button = video.parentElement.querySelector('.video-play');
    if (button) button.addEventListener('click', function () { retryVideo(video); });
  });
  videos.forEach(startVideo);

  if ('IntersectionObserver' in window) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startVideo(entry.target);
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    videos.forEach(function (video) { videoObserver.observe(video); });
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) videos.forEach(startVideo);
  });
  ['pointerdown', 'keydown'].forEach(function (eventName) {
    document.addEventListener(eventName, function () {
      videos.forEach(function (video) {
        if (video.paused && !video.error) {
          var box = video.getBoundingClientRect();
          if (box.bottom >= 0 && box.top <= window.innerHeight) startVideo(video);
        }
      });
    });
  });

  /* A compact mobile offer appears once the reader has passed the introduction. */
  var sticky = document.getElementById('sticky-cta');
  if (sticky) {
    var queued = false;
    function renderSticky() {
      var offerVisible = Array.prototype.some.call(document.querySelectorAll('.offer'), function (offer) {
        var box = offer.getBoundingClientRect();
        return box.bottom > 0 && box.top < window.innerHeight;
      });
      sticky.classList.toggle('show', window.scrollY > 700 && !offerVisible);
      queued = false;
    }
    window.addEventListener('scroll', function () {
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(renderSticky);
      }
    }, { passive: true });
    window.addEventListener('resize', renderSticky);
    renderSticky();
  }
}());
