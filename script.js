document.addEventListener("DOMContentLoaded", () => {
  // --- Page Loader ---
  const pageLoader = document.getElementById('page-loader');
  if (pageLoader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        pageLoader.classList.add('hidden');
      }, 400);
    });
    // Fallback: hide after 3 seconds regardless
    setTimeout(() => {
      pageLoader.classList.add('hidden');
    }, 3000);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Unobserve after it appears once to avoid re-triggering
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  const mobileToggle = document.getElementById('mobile-toggle');
  const navElement = document.querySelector('.nav');

  if (mobileToggle && navElement) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('is-active');
      navElement.classList.toggle('menu-open');
      const isExpanded = mobileToggle.classList.contains('is-active');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const hrefAttr = this.getAttribute('href');
      
      // If href is just "#", scroll gracefully to the very top
      if (hrefAttr === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Close menu if it's open
        if (mobileToggle && navElement) {
          mobileToggle.classList.remove('is-active');
          navElement.classList.remove('menu-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
        return;
      }
      
      const target = document.querySelector(hrefAttr);
      if(target) {
        if (mobileToggle && navElement) {
          mobileToggle.classList.remove('is-active');
          navElement.classList.remove('menu-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
        const offset = 40; // Controls how far below the navbar the section lands (smaller = higher up)
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = target.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Title Scroll Observer to show Nav Logo
  const formalTitle = document.querySelector('.formal-title');
  const navLogo = document.getElementById('nav-logo');
  
  if (formalTitle && navLogo) {
    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 100) {
          navLogo.classList.add('show');
        } else {
          navLogo.classList.remove('show');
        }
      });
    }, { threshold: 0, rootMargin: "-80px 0px 0px 0px" });
    
    titleObserver.observe(formalTitle);
  }

  // Apple-style Hero Scroll Animation
  // Title resists scrolling past the nav divider, then fades away
  const parallaxWrapper = document.getElementById('parallax-wrapper');
  const heroSection = document.querySelector('.hero');
  
  if (parallaxWrapper && heroSection) {
    // The nav bar bottom edge acts as the "divider" the title resists
    const NAV_HEIGHT = 80; // approximate nav height in px
    let ticking = false;
    
    const updateHeroOnScroll = () => {
      // Disable parallax completely on mobile devices to prevent scroll jitter/thrashing
      // caused by the dynamic URL address bar resizing the viewport height
      if (window.innerWidth <= 768) {
        parallaxWrapper.style.transform = 'translate3d(0, 0, 0) scale(1)';
        parallaxWrapper.style.opacity = '1';
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // The title's natural center position from top of page
      const titleNaturalTop = viewportHeight * 0.5;
      
      // Phase 1: Resistance zone (0 → titleNaturalTop - NAV_HEIGHT)
      // The title tries to stay in place; it moves up very slowly (5% of scroll)
      // This creates the "stuck / struggling to go past the divider" feel.
      
      // Phase 2: Fade-out zone (after the title reaches near the nav line)
      // The title rapidly fades, scales down, blurs out — Apple dissolve style
      
      const resistanceEnd = titleNaturalTop - NAV_HEIGHT - 60; // where title would hit the nav area
      const fadeZoneLength = 200; // how many px of scroll to fully disappear

      if (scrollY <= 0) {
        // Reset
        parallaxWrapper.style.transform = 'translate3d(0, 0, 0) scale(1)';
        parallaxWrapper.style.opacity = '1';
        parallaxWrapper.style.filter = 'blur(0px)';
        ticking = false;
        return;
      }
      
      if (scrollY < resistanceEnd) {
        // ---- RESISTANCE PHASE ----
        // Ease-out curve: the more you scroll, the harder it resists
        const progress = scrollY / resistanceEnd; // 0 → 1
        // Deceleration curve — starts moving, then slows down dramatically
        const easedProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
        
        // Max upward movement is capped — title barely moves
        const maxTranslate = resistanceEnd * 0.12;
        const translateY = -(easedProgress * maxTranslate);
        
        // Slight scale pulse as it resists (feels alive)
        const scale = 1 - (easedProgress * 0.03);
        
        // Very subtle opacity reduction to hint it will disappear
        const opacity = 1 - (easedProgress * 0.15);
        
        parallaxWrapper.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        parallaxWrapper.style.opacity = opacity;
        // parallaxWrapper.style.filter = 'blur(0px)';
        
      } else {
        // ---- FADE & DISSOLVE PHASE ----
        const fadeProgress = Math.min((scrollY - resistanceEnd) / fadeZoneLength, 1);
        // Smoother cubic ease out for the dissolve phase (Apple-like)
        const easedFade = 1 - Math.pow(1 - fadeProgress, 3);
        
        // Continue from where resistance ended
        const baseTranslate = resistanceEnd * 0.12;
        // Float upwards gracefully into the frosted glass
        const extraTranslate = easedFade * 80;
        const translateY = -(baseTranslate + extraTranslate);
        
        // Scale shrinks gently
        const scale = (1 - 0.03) - (easedFade * 0.12);
        
        // Opacity drops on a slight curve
        const opacity = (1 - 0.15) * (1 - Math.pow(fadeProgress, 2));
        
        // Progressive liquid blur — cinematic dissolve
        const blur = Math.pow(fadeProgress, 2) * 20; // more blur at the end
        
        parallaxWrapper.style.transform = `translate3d(0, ${translateY}px, 0) scale(${Math.max(scale, 0.85)})`;
        parallaxWrapper.style.opacity = Math.max(0, opacity);
        // parallaxWrapper.style.filter = `blur(${blur}px)`;
      }
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeroOnScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // --- Mobile Scroll Darken Effect ---
  // Darkens the hero banner as you scroll down for an underwater dive cinematic feel
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    // Create a dedicated darken overlay that we can control directly
    const darkenOverlay = document.createElement('div');
    darkenOverlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:#010307;opacity:0;transition:opacity 0.15s ease-out;z-index:0;pointer-events:none;';
    heroBg.insertBefore(darkenOverlay, heroBg.firstChild);

    let darkenTicking = false;
    window.addEventListener('scroll', () => {
      if (!darkenTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const viewportHeight = window.innerHeight;
          // Progressively dives from 0 to 0.75 opacity over the hero scroll
          let darkenVal = (scrollY / (viewportHeight * 0.8)) * 0.75;
          darkenVal = Math.min(Math.max(darkenVal, 0), 0.75);
          darkenOverlay.style.opacity = darkenVal.toFixed(3);
          darkenTicking = false;
        });
        darkenTicking = true;
      }
    }, { passive: true });
  }

  // --- Removed Stacked Cards Slider Logic ---

  // --- TR/EN Language Toggling Logic ---
  const langBtns = document.querySelectorAll('.lang-switcher a');
  const langTexts = document.querySelectorAll('.lang-text');

  if (langBtns.length > 0) {
    langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all
        langBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked
        btn.classList.add('active');
        
        const selectedLang = btn.textContent.toLowerCase().trim(); // 'tr' or 'en'
        
        langTexts.forEach(el => {
          if (el.dataset[selectedLang]) {
            el.innerHTML = el.dataset[selectedLang];
          }
        });
        
        document.documentElement.lang = selectedLang;
      });
    });
  }

  // ============================================================
  // ARTISTIC TOUCHES — JS Features (labeled TOUCH #N)
  // Desktop-only effects are skipped on touch devices for performance
  // ============================================================
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (!isTouchDevice) {
    // --- TOUCH #2: Cursor Glow Tracking ---
    // TO REMOVE: Delete this block + remove #cursor-glow from HTML + CSS.
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
      let glowX = 0, glowY = 0, currentX = 0, currentY = 0;
      
      document.addEventListener('mousemove', (e) => {
        glowX = e.clientX;
        glowY = e.clientY;
      }, { passive: true });
      
      // Smooth lerp follow (slightly delayed, organic feel)
      const updateGlow = () => {
        currentX += (glowX - currentX) * 0.12;
        currentY += (glowY - currentY) * 0.12;
        cursorGlow.style.left = currentX + 'px';
        cursorGlow.style.top = currentY + 'px';
        requestAnimationFrame(updateGlow);
      };
      requestAnimationFrame(updateGlow);
    }

    // --- TOUCH #6: Magnetic Button Effect ---
    // TO REMOVE: Delete this block + CSS TOUCH #6.
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Move button slightly toward cursor (max ~6px)
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // --- TOUCH #8: Mobile Orb Scroll Spring (Apple-style Parallax) ---
  // Make the glass orb stubbornly stick under the header, then snap upwards.
  const bioOrbContainer = document.querySelector('.bio-visual');
  const glassOrb = document.querySelector('.glass-orb-wrapper');
  
  if (bioOrbContainer && glassOrb) {
    window.addEventListener('scroll', () => {
      if (window.innerWidth > 768) {
        glassOrb.style.transform = '';
        glassOrb.style.opacity = '';
        return;
      }

      const rect = bioOrbContainer.getBoundingClientRect();
      // The nav bar is ~70px. Tension starts when container reaches the nav.
      const scrollPast = 70 - rect.top;

      if (scrollPast > 0 && rect.bottom > 0) {
        if (scrollPast < 180) {
           // Resist entering standard scroll, push it down by 85% of what it scrolled up (tucks in)
           const tension = scrollPast * 0.85; 
           const scale = 1 - (scrollPast * 0.0005); // Bulge/squish tension
           glassOrb.style.transform = `translateY(${tension}px) scale(${scale})`;
           glassOrb.style.opacity = '1';
        } else {
           // Snap off! Subtracting exponentially to shoot upward.
           const excess = scrollPast - 180;
           const snapY = (180 * 0.85) - Math.pow(excess, 1.35); // Shoot up fast
           glassOrb.style.transform = `translateY(${snapY}px) scale(0.85)`;
           glassOrb.style.opacity = Math.max(0, 1 - (excess / 50));
        }
      } else {
        glassOrb.style.transform = '';
        glassOrb.style.opacity = '';
      }
    }, { passive: true });
  }

  // --- Subscription Modal ---
  const notifyModal = document.getElementById('notify-modal');
  const btnOpen = document.getElementById('btn-notify-open');
  const btnClose = document.getElementById('notify-modal-close');
  const backdrop = document.getElementById('notify-modal-backdrop');
  const notifyForm = document.getElementById('notify-form');
  const notifyEmail = document.getElementById('notify-email');
  const notifySuccess = document.getElementById('notify-success');
  const notifyError = document.getElementById('notify-error');

  function openModal() {
    notifyModal.classList.add('active');
    notifyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => notifyEmail.focus(), 400);
    // Update placeholder based on current language
    const currentLang = document.querySelector('.lang-switcher .active')?.textContent?.trim() === 'TR' ? 'tr' : 'en';
    const phAttr = currentLang === 'tr' ? 'data-tr-placeholder' : 'data-en-placeholder';
    if (notifyEmail.getAttribute(phAttr)) {
      notifyEmail.placeholder = notifyEmail.getAttribute(phAttr);
    }
  }

  function closeModal() {
    notifyModal.classList.remove('active');
    notifyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnOpen) btnOpen.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notifyModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Form submission via FormSubmit.co
  if (notifyForm) {
    notifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = notifyEmail.value.trim();
      if (!email) return;

      const submitBtn = notifyForm.querySelector('.notify-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = '...';
      notifyError.style.display = 'none';

      try {
        const response = await fetch('https://formsubmit.co/ajax/info@hypatiahertz.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            _subject: 'New Subscriber - Hypatia Hertz'
          })
        });

        if (response.ok) {
          notifyForm.style.display = 'none';
          notifySuccess.style.display = 'block';
          // Auto-close modal after 3 seconds
          setTimeout(() => {
            if (notifyModal.classList.contains('active')) closeModal();
          }, 3000);
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        notifyError.style.display = 'block';
        submitBtn.disabled = false;
        const currentLang = document.querySelector('.lang-switcher .active')?.textContent?.trim() === 'TR' ? 'tr' : 'en';
        submitBtn.textContent = currentLang === 'tr' ? 'Abone Ol' : 'Subscribe';
      }
    });
  }

  // --- Fairytale Countdown Timer ---
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');
  const navCdTimer = document.getElementById('nav-cd-timer');
  
  if (cdDays && cdHours && cdMinutes && cdSeconds) {
    // Release date: September 18, 2026 at midnight (Turkey time, UTC+3)
    const releaseDate = new Date('2026-09-18T00:00:00+03:00').getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const distance = releaseDate - now;

      if (distance <= 0) {
        cdDays.textContent = '00';
        cdHours.textContent = '00';
        cdMinutes.textContent = '00';
        cdSeconds.textContent = '00';
        if (navCdTimer) navCdTimer.textContent = 'OUT NOW';
        
        const label = document.querySelector('.coming-soon-label');
        if (label) {
          label.textContent = label.dataset.en === 'COMING SOON' ? 'OUT NOW' : 'YAYINDA';
          label.dataset.en = 'OUT NOW';
          label.dataset.tr = 'YAYINDA';
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      cdDays.textContent = String(days).padStart(2, '0');
      cdHours.textContent = String(hours).padStart(2, '0');
      cdMinutes.textContent = String(minutes).padStart(2, '0');
      cdSeconds.textContent = String(seconds).padStart(2, '0');

      // Update nav mini countdown
      if (navCdTimer) {
        const currentLang = document.querySelector('.lang-switcher .active')?.textContent?.trim().toLowerCase() === 'tr' ? 'tr' : 'en';
        const dStr = currentLang === 'tr' ? 'g' : 'd';
        const hStr = currentLang === 'tr' ? 's' : 'h';
        const mStr = currentLang === 'tr' ? 'd' : 'm';
        navCdTimer.textContent = `${days}${dStr} ${String(hours).padStart(2,'0')}${hStr} ${String(minutes).padStart(2,'0')}${mStr}`;
      }
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // --- Fairytale "Notify Me" button → opens the same subscription modal ---
  const btnNotifyFairytale = document.getElementById('btn-notify-open-fairytale');
  if (btnNotifyFairytale) {
    btnNotifyFairytale.addEventListener('click', openModal);
  }

  // --- Release Carousel ---
  const slides = document.querySelectorAll('.release-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  let currentSlide = 0;
  let isAnimating = false;

  // Initial setup: make inactive slides "behind"
  slides.forEach((slide, index) => {
    if (index !== currentSlide) {
      slide.classList.add('behind');
    }
  });

  function goToSlide(index, direction) {
    if (isAnimating || index === currentSlide || index < 0 || index >= slides.length) return;
    isAnimating = true;
    
    const exitClass = direction === 'left' ? 'exit-left' : 'exit-right';
    
    const oldSlide = slides[currentSlide];
    const newSlide = slides[index];
    
    // Old slide exits
    oldSlide.classList.remove('active');
    oldSlide.classList.add(exitClass);
    
    // New slide enters (remove behind, add active)
    newSlide.classList.remove('behind', 'exit-left', 'exit-right');
    newSlide.classList.add('active');
    
    // Update dots
    dots.forEach(d => d.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
    
    // Clean up classes after transition (600ms matching CSS transition)
    setTimeout(() => {
      oldSlide.classList.remove(exitClass);
      oldSlide.classList.add('behind');
      isAnimating = false;
    }, 600);
    
    currentSlide = index;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const target = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
      goToSlide(target, 'right');
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const target = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
      goToSlide(target, 'left');
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.dataset.dot);
      const direction = target > currentSlide ? 'left' : 'right';
      goToSlide(target, direction);
    });
  });

  // --- Touch Swipe & Mouse Drag Support for Carousel ---
  const carouselEl = document.getElementById('release-carousel');
  if (carouselEl && slides.length > 1) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let isHorizontalSwipe = null; // null = undetermined, true/false once decided
    const SWIPE_THRESHOLD = 40; // minimum px to trigger slide change
    const DIRECTION_LOCK_THRESHOLD = 10; // px to decide swipe direction

    // --- Touch Events (Mobile) ---
    carouselEl.addEventListener('touchstart', (e) => {
      if (isAnimating) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
      isHorizontalSwipe = null;
      carouselEl.classList.add('is-dragging');
    }, { passive: true });

    carouselEl.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);

      // Decide direction once we've moved enough
      if (isHorizontalSwipe === null && (diffX > DIRECTION_LOCK_THRESHOLD || diffY > DIRECTION_LOCK_THRESHOLD)) {
        isHorizontalSwipe = diffX > diffY;
      }

      // If horizontal swipe detected, prevent vertical scroll
      if (isHorizontalSwipe) {
        e.preventDefault();
      }
    }, { passive: false });

    carouselEl.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      carouselEl.classList.remove('is-dragging');

      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;

      if (isHorizontalSwipe && Math.abs(diffX) > SWIPE_THRESHOLD) {
        if (diffX < 0) {
          // Swiped left → next slide
          const target = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
          goToSlide(target, 'left');
        } else {
          // Swiped right → previous slide
          const target = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
          goToSlide(target, 'right');
        }
      }
      isHorizontalSwipe = null;
    }, { passive: true });

    // --- Mouse Drag Events (Desktop) ---
    carouselEl.addEventListener('mousedown', (e) => {
      if (isAnimating) return;
      // Don't interfere with button/link clicks
      if (e.target.closest('a, button')) return;
      e.preventDefault();
      startX = e.clientX;
      isDragging = true;
      carouselEl.classList.add('is-dragging');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      // Optional: could add visual drag feedback here
    });

    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      carouselEl.classList.remove('is-dragging');

      const diffX = e.clientX - startX;
      if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        if (diffX < 0) {
          const target = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
          goToSlide(target, 'left');
        } else {
          const target = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
          goToSlide(target, 'right');
        }
      }
    });

    // Prevent drag ghost images on links/images inside the carousel
    carouselEl.addEventListener('dragstart', (e) => e.preventDefault());
  }

  // --- Dynamic Copyright Year ---
  const copyrightYear = document.getElementById('copyright-year');
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

});
