/* ============================================
   石野™ ISHINO — Portfolio Replica
   Main JavaScript
   ============================================ */

(function() {
  'use strict';

  /* ---------- Menu Overlay Toggle ---------- */
  const navDots = document.getElementById('navDots');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');

  if (navDots && menuOverlay) {
    navDots.addEventListener('click', function() {
      menuOverlay.classList.add('open');
    });
  }

  if (menuClose && menuOverlay) {
    menuClose.addEventListener('click', function() {
      menuOverlay.classList.remove('open');
    });
  }

  if (menuOverlay) {
    menuOverlay.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        menuOverlay.classList.remove('open');
      });
    });
  }

  /* ---------- Scroll Reveal (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length > 0) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(function(el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all
    revealEls.forEach(function(el) {
      el.classList.add('in');
    });
  }

  /* ---------- FAQ Accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', function() {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(function(other) {
        other.classList.remove('open');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = '0';
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Pricing Toggle ---------- */
  const pricingButtons = document.querySelectorAll('.pricing-toggle button');
  pricingButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      pricingButtons.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // Toggle pricing display based on domestic/overseas
      const tab = btn.dataset.tab;
      const cards = document.querySelectorAll('.pricing-card');
      if (tab === 'overseas') {
        // Convert to USD approx
        cards.forEach(function(card, i) {
          const value = card.querySelector('.pricing-amount .value');
          const currency = card.querySelector('.pricing-amount .currency');
          const period = card.querySelector('.pricing-amount .period');
          if (currency) currency.textContent = '$';
          if (i === 0 && value) value.textContent = '30';
          if (i === 1 && value) value.textContent = '3500';
          if (i === 0 && period) period.textContent = '/hour';
          if (i === 1 && period) period.textContent = '/month';
        });
      } else {
        // Convert back to CNY
        cards.forEach(function(card, i) {
          const value = card.querySelector('.pricing-amount .value');
          const currency = card.querySelector('.pricing-amount .currency');
          const period = card.querySelector('.pricing-amount .period');
          if (currency) currency.textContent = '￥';
          if (i === 0 && value) value.textContent = '200';
          if (i === 1 && value) value.textContent = '25000';
          if (i === 0 && period) period.textContent = '/小时';
          if (i === 1 && period) period.textContent = '/月';
        });
      }
    });
  });

  /* ---------- Skill Percentage + Bar Animation ---------- */
  const skillCards = document.querySelectorAll('.skill-card');
  if ('IntersectionObserver' in window && skillCards.length > 0) {
    const skillObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const card = entry.target;
          const percentEl = card.querySelector('.skill-percent');
          const barEl = card.querySelector('.skill-bar span');
          const target = parseInt((percentEl || barEl).dataset.target || '0', 10);

          if (percentEl) {
            let current = 0;
            const duration = 1500;
            const startTime = performance.now();

            function animate(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              current = Math.round(target * progress);
              percentEl.textContent = current + '%';
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            }
            requestAnimationFrame(animate);
          }

          if (barEl) {
            setTimeout(function() {
              barEl.style.width = target + '%';
            }, 100);
          }

          skillObserver.unobserve(card);
        }
      });
    }, { threshold: 0.5 });

    skillCards.forEach(function(el) {
      skillObserver.observe(el);
    });
  }

  /* ---------- Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Contact Form (prevent default) ---------- */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'SENDING...';
        btn.style.opacity = '0.6';
        setTimeout(function() {
          btn.textContent = 'SENT ✓';
          setTimeout(function() {
            btn.textContent = originalText;
            btn.style.opacity = '1';
            contactForm.reset();
          }, 2000);
        }, 1000);
      }
    });
  }

})();
