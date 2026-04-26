// ── MOBILE MENU ─────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  });
}

// ── HERO VIDEO AUTOPLAY (cross-browser) ─────────────────────
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.setAttribute('muted', '');
  heroVideo.setAttribute('playsinline', '');
  heroVideo.setAttribute('webkit-playsinline', '');

  const tryPlay = () => {
    const p = heroVideo.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        // If autoplay fails, retry on first user interaction
        const resume = () => {
          heroVideo.play().catch(() => {});
          document.removeEventListener('touchstart', resume);
          document.removeEventListener('click', resume);
        };
        document.addEventListener('touchstart', resume, { once: true });
        document.addEventListener('click', resume, { once: true });
      });
    }
  };

  if (heroVideo.readyState >= 2) tryPlay();
  else heroVideo.addEventListener('loadeddata', tryPlay, { once: true });

  // Resume if backgrounded
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && heroVideo.paused) heroVideo.play().catch(() => {});
  });
}

// ── ACTIVITY LIGHTBOX ───────────────────────────────────────
const activityCards = Array.from(document.querySelectorAll('.activity-card[data-src]'));
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

let currentIndex = 0;

if (lightbox && activityCards.length) {
  const updateLightbox = () => {
    const card = activityCards[currentIndex];
    lightboxImg.src = card.dataset.src;
    lightboxImg.alt = card.dataset.title || '';
    if (lightboxTitle) lightboxTitle.textContent = card.dataset.title || '';
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${activityCards.length}`;
  };

  const openLightbox = (index) => {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + activityCards.length) % activityCards.length;
    updateLightbox();
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % activityCards.length;
    updateLightbox();
  };

  activityCards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
  lightboxNext.addEventListener('click', e => { e.stopPropagation(); showNext(); });

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Touch swipe
  let touchStartX = 0;
  let touchStartY = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) showNext();
      else showPrev();
    }
  }, { passive: true });

  // Click on lightbox image → next
  lightboxImg.addEventListener('click', e => {
    e.stopPropagation();
    showNext();
  });
}

// ── SEAMLESS PAGE TRANSITIONS ───────────────────────────────
document.querySelectorAll('a').forEach(link => {
  const href = link.getAttribute('href');
  if (!href) return;
  // Internal page links only (.html)
  if (!/^[^#?]+\.html(\?|#|$)/.test(href)) return;
  if (link.target === '_blank') return;

  // Preload on hover
  link.addEventListener('mouseenter', () => {
    if (link.dataset.preloaded) return;
    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = href;
    document.head.appendChild(prefetch);
    link.dataset.preloaded = '1';
  }, { passive: true });

  // Fade out before navigating
  link.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    document.body.classList.add('fade-out');
    setTimeout(() => { window.location.href = href; }, 220);
  });
});

// ── SCROLL FADE-IN ──────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.activity-card, .about-image, .stat, .page-link-card'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});
