// ==================== CURSOR ====================
const body = document.body;
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.nav-link')];

if (window.matchMedia('(pointer: fine)').matches) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });
  const moveRing = () => {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(moveRing);
  };
  moveRing();
  document.querySelectorAll('a, button, input, textarea, .tech-card, .project-card').forEach((element) => {
    element.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
    element.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
  });
}

// ==================== GLASS WATER INTRO ====================
const waterIntro = document.querySelector('#water-intro');

if (waterIntro) {
  let introFinished = false;

  const finishIntro = () => {
    if (introFinished) return;
    introFinished = true;
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-complete');
    waterIntro.classList.add('is-finished');
    waterIntro.setAttribute('aria-hidden', 'true');

    // Remove the overlay after its fade so it no longer sits above the hero.
    window.setTimeout(() => waterIntro.remove(), 900);
  };

  // CSS owns the water animation. JavaScript only listens for its finish.
  waterIntro.addEventListener('animationend', (event) => {
    if (event.animationName === 'water-intro-reveal') finishIntro();
  });

  // Fallback in case the browser does not fire animationend.
  window.setTimeout(finishIntro, 4500);
}

// ==================== GRAVITY TOGGLE ====================
const gravityToggle = document.querySelector('#gravity-toggle');
const gravityArea = document.querySelector('#gravity-area');
let gravityEnabled = false;

if (gravityToggle && gravityArea) {
  gravityToggle.addEventListener('click', () => {
    gravityEnabled = !gravityEnabled;
    gravityArea.classList.toggle('gravity-on', gravityEnabled);
    gravityToggle.setAttribute('aria-pressed', String(gravityEnabled));
    gravityToggle.textContent = gravityEnabled ? 'GRAVITY: ON' : 'GRAVITY: OFF';
  });
}

// ==================== FLEX CAROUSEL ====================
// The carousel keeps one active frame visible. Pointer movement changes the
// track position, while CSS supplies the smooth transition between frames.
const archiveCarousel = document.querySelector('#archive-carousel');

if (archiveCarousel) {
  const archiveTrack = archiveCarousel.querySelector('.flex-carousel__track');
  const archiveSlides = [...archiveCarousel.querySelectorAll('.flex-carousel__slide')];
  const archivePrevious = archiveCarousel.querySelector('.flex-carousel__button--previous');
  const archiveNext = archiveCarousel.querySelector('.flex-carousel__button--next');
  const archiveTitle = archiveCarousel.querySelector('#archive-caption-title');
  const archiveSubtitle = archiveCarousel.querySelector('#archive-caption-subtitle');
  const archiveReel = archiveCarousel.querySelector('.flex-carousel__reel');
  const archiveLive = archiveCarousel.querySelector('#archive-carousel-status');
  let archiveIndex = 0;
  let isZoomed = false;
  let isPointerDown = false;
  let hasDragged = false;
  let pointerStartX = 0;
  let pointerDeltaX = 0;

  const getArchiveWidth = () => archiveCarousel.getBoundingClientRect().width;

  const moveArchiveTrack = (offset) => {
    archiveTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  const renderArchiveFrame = (nextIndex) => {
    archiveIndex = (nextIndex + archiveSlides.length) % archiveSlides.length;
    // Use pixels here because percentage transforms are based on the entire
    // six-frame track, not the width of one visible carousel frame.
    moveArchiveTrack(-archiveIndex * getArchiveWidth());
    archiveSlides.forEach((slide, index) => {
      const isActive = index === archiveIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    const activeSlide = archiveSlides[archiveIndex];
    archiveTitle.textContent = activeSlide.dataset.title;
    archiveSubtitle.textContent = activeSlide.dataset.subtitle;
    archiveReel.style.transform = `translateY(-${archiveIndex}em)`;
    archiveLive.textContent = `Frame ${archiveIndex + 1} of ${archiveSlides.length}: ${activeSlide.dataset.title}`;
  };

  const setZoom = (zoomed) => {
    isZoomed = zoomed;
    archiveCarousel.classList.toggle('is-zoomed', isZoomed);
    archiveCarousel.dataset.hover = isZoomed ? 'close' : 'open';
  };

  const finishPointerInteraction = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    archiveCarousel.removeAttribute('data-dragging');
    archiveTrack.style.removeProperty('transition');

    const threshold = archiveCarousel.getBoundingClientRect().width * 0.12;
    if (Math.abs(pointerDeltaX) > threshold) {
      renderArchiveFrame(archiveIndex + (pointerDeltaX < 0 ? 1 : -1));
    } else {
      renderArchiveFrame(archiveIndex);
    }
  };

  archivePrevious.addEventListener('click', (event) => {
    event.stopPropagation();
    renderArchiveFrame(archiveIndex - 1);
  });

  archiveNext.addEventListener('click', (event) => {
    event.stopPropagation();
    renderArchiveFrame(archiveIndex + 1);
  });

  archiveCarousel.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    isPointerDown = true;
    hasDragged = false;
    pointerStartX = event.clientX;
    pointerDeltaX = 0;
    archiveCarousel.setPointerCapture?.(event.pointerId);
    archiveCarousel.setAttribute('data-dragging', '');
    archiveTrack.style.transition = 'none';
  });

  archiveCarousel.addEventListener('pointermove', (event) => {
    if (!isPointerDown) return;
    pointerDeltaX = event.clientX - pointerStartX;
    if (Math.abs(pointerDeltaX) > 6) hasDragged = true;
    const width = getArchiveWidth();
    moveArchiveTrack(-archiveIndex * width + pointerDeltaX);
  });

  archiveCarousel.addEventListener('pointerup', finishPointerInteraction);
  archiveCarousel.addEventListener('pointercancel', finishPointerInteraction);

  archiveCarousel.addEventListener('click', () => {
    // A drag should not accidentally open the image after the pointer is released.
    if (hasDragged) {
      hasDragged = false;
      return;
    }
    setZoom(!isZoomed);
  });

  archiveCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      renderArchiveFrame(archiveIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      renderArchiveFrame(archiveIndex + 1);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setZoom(!isZoomed);
    }
    if (event.key === 'Escape' && isZoomed) setZoom(false);
  });

  window.addEventListener('resize', () => {
    moveArchiveTrack(-archiveIndex * getArchiveWidth());
  });

  renderArchiveFrame(0);
}

// ==================== MOBILE NAVIGATION ====================
menuToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
navLinks.forEach((link) => link.addEventListener('click', () => {
  siteNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// ==================== SCROLL REVEALS + ACTIVE NAV ====================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id]')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-38% 0px -52% 0px' });
sections.forEach((section) => sectionObserver.observe(section));

// ==================== ANIMATED STATS ====================
document.querySelectorAll('[data-count]').forEach((stat) => {
  const target = stat.dataset.count;
  if (target === '∞') return;
  let started = false;
  const counterObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return;
    started = true;
    const end = Number(target);
    let current = 0;
    const tick = () => {
      current += 1;
      stat.textContent = current;
      if (current < end) requestAnimationFrame(tick);
    };
    tick();
    counterObserver.disconnect();
  }, { threshold: 1 });
  counterObserver.observe(stat);
});

// ==================== TIMELINE ====================
const timelineItems = [...document.querySelectorAll('.timeline-item')];
const timelineLine = document.querySelector('.timeline-line span');
timelineItems.forEach((item, index) => item.addEventListener('click', () => {
  timelineItems.forEach((timelineItem) => timelineItem.classList.remove('active'));
  item.classList.add('active');
  if (timelineLine) timelineLine.style.top = `${index * 25}%`;
}));

// ==================== MUSIC PLAYER ====================
const audio = document.querySelector('#audio');
const player = document.querySelector('.player');
const playButton = document.querySelector('#play-button');
const progress = document.querySelector('#progress');
const volume = document.querySelector('#volume');
const currentTime = document.querySelector('#current-time');
const duration = document.querySelector('#duration');
const playerStatus = document.querySelector('#player-status');
const audioNote = document.querySelector('#audio-note');
let hasTrack = false;
let visualMode = false;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

audio.volume = Number(volume.value);
audio.addEventListener('loadedmetadata', () => {
  hasTrack = true;
  duration.textContent = formatTime(audio.duration);
  audioNote.textContent = 'Your permitted track is loaded. Press play when you are ready.';
  audioNote.style.color = 'var(--lime)';
});
audio.addEventListener('error', () => {
  hasTrack = false;
  audioNote.innerHTML = 'Drop a permitted track into <code>assets/audio/track.mp3</code> to make this player yours.';
});
audio.addEventListener('timeupdate', () => {
  if (!hasTrack) return;
  progress.value = String((audio.currentTime / audio.duration) * 100 || 0);
  currentTime.textContent = formatTime(audio.currentTime);
});
audio.addEventListener('ended', () => {
  player.classList.remove('playing');
  playerStatus.textContent = 'ENDED';
});
playButton.addEventListener('click', async () => {
  if (hasTrack) {
    if (audio.paused) {
      await audio.play();
      player.classList.add('playing');
      playerStatus.textContent = 'PLAYING';
    } else {
      audio.pause();
      player.classList.remove('playing');
      playerStatus.textContent = 'PAUSED';
    }
    return;
  }
  visualMode = !visualMode;
  player.classList.toggle('playing', visualMode);
  playerStatus.textContent = visualMode ? 'VISUAL MODE' : 'READY';
  audioNote.innerHTML = visualMode
    ? 'Visual mode is running. Add your own permitted <code>assets/audio/track.mp3</code> for real playback.'
    : 'Drop a permitted track into <code>assets/audio/track.mp3</code> to make this player yours.';
});
progress.addEventListener('input', () => {
  if (hasTrack) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
});
volume.addEventListener('input', () => { audio.volume = Number(volume.value); });

// ==================== CONTACT FORM ====================
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const contactFields = {
  name: document.querySelector('#name'),
  email: document.querySelector('#email'),
  message: document.querySelector('#message'),
};

const setFieldError = (field, message) => {
  const errorElement = document.querySelector(`#${field.id}-error`);
  field.setAttribute('aria-invalid', String(Boolean(message)));
  errorElement.textContent = message;
};

const validateContactForm = () => {
  let isValid = true;
  const name = contactFields.name.value.trim();
  const email = contactFields.email.value.trim();
  const message = contactFields.message.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  setFieldError(contactFields.name, name ? '' : 'Please enter your name.');
  if (!name) isValid = false;

  if (!email) {
    setFieldError(contactFields.email, 'Please enter your email.');
    isValid = false;
  } else if (!emailPattern.test(email)) {
    setFieldError(contactFields.email, 'Please enter a valid email address.');
    isValid = false;
  } else {
    setFieldError(contactFields.email, '');
  }

  setFieldError(contactFields.message, message ? '' : 'Please add a message.');
  if (!message) isValid = false;

  return isValid;
};

// A submit event runs when the visitor presses the form's submit button.
// We prevent the browser's default navigation so validation can happen first.
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.classList.remove('is-success');

  if (!validateContactForm()) {
    formStatus.textContent = 'Please fix the highlighted fields and try again.';
    return;
  }

  // FormData reads each named field as a key/value pair: name, email and message.
  // It is ready to be sent to Formspree later, but no endpoint is invented here.
  const formData = new FormData(contactForm);
  const visitorName = formData.get('name');
  formStatus.textContent = `Thanks, ${visitorName}. Your message is valid and ready for Formspree.`;
  formStatus.classList.add('is-success');
});

Object.values(contactFields).forEach((field) => {
  field.addEventListener('input', () => {
    setFieldError(field, '');
    formStatus.textContent = '';
    formStatus.classList.remove('is-success');
  });
});

document.querySelector('#copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('arshhk5775@gmail.com');
    formStatus.textContent = 'Email copied to clipboard.';
  } catch {
    formStatus.textContent = 'Copy unavailable — email me at arshhk5775@gmail.com';
  }
});

// This creates a small magnetic/gravity response around the contact actions.
document.querySelectorAll('[data-gravity]').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    const bounds = button.getBoundingClientRect();
    const offsetX = (event.clientX - (bounds.left + bounds.width / 2)) * 0.16;
    const offsetY = (event.clientY - (bounds.top + bounds.height / 2)) * 0.16;
    button.style.setProperty('--gravity-x', `${offsetX}px`);
    button.style.setProperty('--gravity-y', `${offsetY}px`);
  });

  button.addEventListener('pointerleave', () => {
    button.style.setProperty('--gravity-x', '0px');
    button.style.setProperty('--gravity-y', '0px');
  });
});

// ==================== FOOTER ====================
document.querySelector('#year').textContent = new Date().getFullYear();
