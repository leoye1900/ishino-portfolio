/* === IMAGE/VIDEO LAZY LOADING WITH SHIMMER PLACEHOLDERS === */
/* Non-invasive: adds CSS classes to img/video elements, no DOM wrapping */
(function() {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  // Skip these images (logos, icons)
  function shouldSkip(img) {
    if (img.closest('.nav-logo')) return true;
    if (img.width > 0 && img.width < 80) return true;
    return false;
  }

  // --- 1. Setup an image for lazy loading ---
  function setupImage(img) {
    if (img.dataset.lazySetup) return;
    img.dataset.lazySetup = '1';

    if (shouldSkip(img)) return;

    // If already has data-src, skip
    if (img.dataset.src) return;

    // Save src to data-src, add loading class
    if (img.src) {
      img.dataset.src = img.src;
      img.removeAttribute('src');
      img.classList.add('lazy-loading');
    }
  }

  // --- 2. Lazy load observer ---
  var lazyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;

        // Images
        if (el.tagName === 'IMG' && el.dataset.src) {
          el.addEventListener('load', function() {
            el.classList.remove('lazy-loading');
            el.classList.add('lazy-loaded');
          });
          el.addEventListener('error', function() {
            el.classList.remove('lazy-loading');
            el.classList.add('lazy-loaded');
          });
          el.src = el.dataset.src;
          delete el.dataset.src;
        }

        // Videos
        if (el.tagName === 'VIDEO') {
          var sources = el.querySelectorAll('source[data-src]');
          if (sources.length > 0) {
            sources.forEach(function(source) {
              source.src = source.dataset.src;
              delete source.dataset.src;
            });
            el.classList.remove('lazy-loading');
            el.classList.add('lazy-loaded');
            el.load();
          }
        }

        lazyObserver.unobserve(el);
      }
    });
  }, {
    rootMargin: '300px 0px',  // Start loading 300px before entering viewport
    threshold: 0.01
  });

  // --- 3. Process all existing images and videos ---
  function processMedia() {
    // Convert loading="lazy" images
    document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
      if (!img.dataset.src && img.src) {
        img.dataset.src = img.src;
        img.removeAttribute('src');
        img.removeAttribute('loading');
        img.classList.add('lazy-loading');
      }
    });

    // Setup all images (except those already processed or nav logos)
    document.querySelectorAll('img:not(.lazy-loading):not(.lazy-loaded)').forEach(function(img) {
      if (shouldSkip(img)) return;
      if (img.dataset.lazySetup) return;

      // If image already loaded (cached), just mark as loaded
      if (img.complete && img.naturalWidth > 0 && img.src) {
        img.classList.add('lazy-loaded');
        return;
      }

      // If has src, convert to lazy
      if (img.src && !img.closest('.hero-image')) {
        setupImage(img);
      }
    });

    // Observe all lazy-loading images
    document.querySelectorAll('img.lazy-loading[data-src]').forEach(function(img) {
      lazyObserver.observe(img);
    });

    // Lazy load videos (except hero video)
    document.querySelectorAll('video').forEach(function(video) {
      if (video.closest('.hero-image')) return;
      var sources = video.querySelectorAll('source[src]');
      if (sources.length > 0) {
        video.classList.add('lazy-loading');
        sources.forEach(function(source) {
          source.dataset.src = source.src;
          source.removeAttribute('src');
        });
        lazyObserver.observe(video);
      }
    });
  }

  // --- 4. Priority load hero images ---
  function loadHeroImage() {
    var heroImg = document.querySelector('.hero-image img');
    if (heroImg && heroImg.dataset.src) {
      heroImg.classList.remove('lazy-loading');
      heroImg.addEventListener('load', function() {
        heroImg.classList.add('lazy-loaded');
      });
      heroImg.src = heroImg.dataset.src;
      delete heroImg.dataset.src;
    }

    // Hero video: load immediately
    var heroVideo = document.querySelector('.hero-image video');
    if (heroVideo) {
      heroVideo.querySelectorAll('source[data-src]').forEach(function(s) {
        s.src = s.dataset.src;
        delete s.dataset.src;
      });
      heroVideo.load();
    }
  }

  // --- 5. Watch for dynamically added images (gallery page, etc.) ---
  var mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;

        // Check if the added node is an image
        if (node.tagName === 'IMG' && !node.dataset.lazySetup && !shouldSkip(node)) {
          if (node.dataset.src) {
            // Already has data-src (e.g. gallery images) — just observe
            node.dataset.lazySetup = '1';
            lazyObserver.observe(node);
          } else if (node.src && !node.complete) {
            setupImage(node);
            lazyObserver.observe(node);
          }
        }

        // Check for images inside the added node
        var imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
        imgs.forEach(function(img) {
          if (!img.dataset.lazySetup && !shouldSkip(img)) {
            if (img.dataset.src) {
              img.dataset.lazySetup = '1';
              lazyObserver.observe(img);
            } else if (img.src && !img.complete) {
              setupImage(img);
              lazyObserver.observe(img);
            }
          }
        });

        // Check for videos inside the added node
        var videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
        videos.forEach(function(video) {
          if (video.closest('.hero-image')) return;
          var sources = video.querySelectorAll('source[src]');
          if (sources.length > 0 && !video.dataset.lazySetup) {
            video.dataset.lazySetup = '1';
            video.classList.add('lazy-loading');
            sources.forEach(function(source) {
              source.dataset.src = source.src;
              source.removeAttribute('src');
            });
            lazyObserver.observe(video);
          }
          // Also handle videos with source[data-src] (gallery)
          var lazySources = video.querySelectorAll('source[data-src]');
          if (lazySources.length > 0 && !video.dataset.lazySetup) {
            video.dataset.lazySetup = '1';
            lazyObserver.observe(video);
          }
        });
      });
    });
  });

  // --- 6. Initialize ---
  function init() {
    processMedia();
    loadHeroImage();

    // Start observing DOM for dynamically added images
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run after a delay to catch any late-rendered images
  setTimeout(function() {
    processMedia();
    document.querySelectorAll('img.lazy-loading[data-src]').forEach(function(img) {
      lazyObserver.observe(img);
    });
  }, 1000);
})();
