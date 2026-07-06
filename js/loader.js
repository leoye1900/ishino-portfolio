/* === IMAGE/VIDEO LAZY LOADING — non-invasive version === */
/* Does NOT wrap images in containers — only adds loading classes */
(function() {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  // --- 1. Lazy load with IntersectionObserver ---
  var lazyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        
        // For images
        if (el.tagName === 'IMG' && el.dataset.src) {
          el.src = el.dataset.src;
          delete el.dataset.src;
        }
        // For videos
        if (el.tagName === 'VIDEO') {
          var sources = el.querySelectorAll('source[data-src]');
          if (sources.length > 0) {
            sources.forEach(function(source) {
              source.src = source.dataset.src;
              delete source.dataset.src;
            });
            el.load();
          }
        }
        
        lazyObserver.unobserve(el);
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.01
  });

  // --- 2. Add fade-in transition to images (no wrapping) ---
  function setupImage(img) {
    if (img.dataset.lazySetup) return;
    img.dataset.lazySetup = '1';

    // Skip nav logos
    if (img.closest('.nav-logo')) return;

    // Add transition classes
    img.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)';

    if (img.complete && img.naturalWidth > 0) {
      // Already loaded
      img.style.opacity = '1';
    } else {
      img.style.opacity = '0';
      img.addEventListener('load', function() {
        img.style.opacity = '1';
      });
      img.addEventListener('error', function() {
        img.style.opacity = '1';
      });
    }
  }

  // --- 3. Process all images and videos ---
  function processMedia() {
    // Convert loading="lazy" to custom lazy loading
    document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
      if (!img.dataset.src && img.src) {
        img.dataset.src = img.src;
        img.removeAttribute('src');
        img.removeAttribute('loading');
      }
    });

    // Setup fade-in for all images (except nav logos)
    document.querySelectorAll('img').forEach(setupImage);

    // Observe lazy images
    document.querySelectorAll('img[data-src]').forEach(function(img) {
      lazyObserver.observe(img);
    });

    // Lazy load videos
    document.querySelectorAll('video').forEach(function(video) {
      var sources = video.querySelectorAll('source[src]');
      if (sources.length > 0 && !video.closest('.hero-image')) {
        // Don't lazy-load hero video — load immediately
        sources.forEach(function(source) {
          source.dataset.src = source.src;
          source.removeAttribute('src');
        });
        lazyObserver.observe(video);
      }
    });
  }

  // --- 4. Priority load hero image ---
  function loadHeroImage() {
    var heroImg = document.querySelector('.hero-image img');
    if (heroImg && heroImg.dataset.src) {
      heroImg.src = heroImg.dataset.src;
      delete heroImg.dataset.src;
    }
    var heroVideo = document.querySelector('.hero-image video');
    if (heroVideo) {
      heroVideo.querySelectorAll('source[data-src]').forEach(function(s) {
        s.src = s.dataset.src;
        delete s.dataset.src;
      });
      heroVideo.load();
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      processMedia();
      loadHeroImage();
    });
  } else {
    processMedia();
    loadHeroImage();
  }
})();
