/* ============================================================
   SCRIPT.JS — Space-Themed Portfolio
   ============================================================

   TABLE OF CONTENTS
   -----------------
   1.  Star Field Canvas — animated background
   2.  Typed Text Effect — hero role animation
   3.  Navigation — sticky scroll + mobile hamburger
   4.  Active Nav Link — highlight on scroll
   5.  Fade-In on Scroll — reveal animations
   6.  Skill Bar Animation — animate progress bars
   7.  Contact Form — client-side validation + feedback
   8.  Footer Year — auto-update copyright year
   9.  Init — run everything on DOMContentLoaded

   To find a section, search for its number, e.g. "/* 2."
============================================================ */


/* ============================================================
   1. STAR FIELD CANVAS
   — Draws animated stars on the <canvas id="starfield">
   — Edit: STAR_COUNT for density, colors, speed below
============================================================ */
function initStarField() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let W        = window.innerWidth;
  let H        = window.innerHeight;
  let stars    = [];

  /* ── Edit star settings ── */
  const STAR_COUNT  = 450;   // Total number of stars
  const MIN_RADIUS  = 0.3;   // Smallest star radius
  const MAX_RADIUS  = 1.6;   // Largest star radius
  const MIN_SPEED   = 0.05;  // Slowest drift speed
  const MAX_SPEED   = 0.25;  // Fastest drift speed
  const STAR_COLORS = [
    'rgba(255, 255, 255, ',   // white
    'rgba(0, 212, 255, ',     // cyan
    'rgba(162, 89, 255, ',    // purple
    'rgba(0, 255, 179, ',     // mint
  ];

  /* Resize canvas to full viewport */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
  }

  /* Create a single star object */
  function makeStar() {
    const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    return {
      x:      Math.random() * W,
      y:      Math.random() * H,
      r:      MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS),
      vx:     (Math.random() - 0.5) * MAX_SPEED,
      vy:     (Math.random() - 0.5) * MAX_SPEED + MIN_SPEED,
      alpha:  0.3 + Math.random() * 0.7,
      pulse:  Math.random() * Math.PI * 2,  // phase offset for twinkle
      color,
    };
  }

  /* Populate stars array */
  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(makeStar());
    }
  }

  /* Animation loop */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    stars.forEach(s => {
      /* Twinkle: pulse alpha gently */
      s.pulse += 0.015;
      const twinkle = s.alpha * (0.7 + 0.3 * Math.sin(s.pulse));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + twinkle + ')';
      ctx.fill();

      /* Move */
      s.x += s.vx;
      s.y += s.vy;

      /* Wrap around edges */
      if (s.x < -2) s.x = W + 2;
      if (s.x > W + 2) s.x = -2;
      if (s.y < -2) s.y = H + 2;
      if (s.y > H + 2) s.y = -2;
    });

    requestAnimationFrame(draw);
  }

  /* Occasional shooting star */
  function shootingStar() {
    const x = Math.random() * W;
    const y = Math.random() * (H * 0.4);  // top 40% of screen
    const len = 80 + Math.random() * 120;
    const angle = Math.PI / 5;
    let progress = 0;

    function animateShot() {
      if (progress >= 1) return;
      progress += 0.035;

      ctx.save();
      ctx.globalAlpha = (1 - progress) * 0.8;
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.9)';
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * len * (progress - 0.12),
                 y + Math.sin(angle) * len * (progress - 0.12));
      ctx.lineTo(x + Math.cos(angle) * len * progress,
                 y + Math.sin(angle) * len * progress);
      ctx.stroke();
      ctx.restore();

      requestAnimationFrame(animateShot);
    }
    animateShot();
  }

  /* Fire a shooting star every 4–8 seconds */
  setInterval(() => {
    if (Math.random() > 0.4) shootingStar();
  }, 4500);

  /* Init */
  resize();
  buildStars();
  draw();

  window.addEventListener('resize', () => {
    resize();
    buildStars();
  });
}


/* ============================================================
   2. TYPED TEXT EFFECT
   — Cycles through an array of role strings in the hero section
   — Edit: ROLES array to change what gets typed
============================================================ */
function initTypedText() {
  const target = document.getElementById('typedText');
  if (!target) return;

  /* ── Edit these roles ── */
  const ROLES = [
    'UI / Frontend Designer',
    'Aspiring Web Designer',
    'Frontend Learner',
    'UI Design Enthusiast'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const TYPE_SPEED   = 80;   // ms per character (typing)
  const DELETE_SPEED = 45;   // ms per character (deleting)
  const PAUSE_END    = 2000; // ms pause after fully typed
  const PAUSE_START  = 400;  // ms pause before typing next

  function tick() {
    const current = ROLES[roleIndex];

    if (!isDeleting) {
      /* Typing forward */
      target.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      /* Deleting backward */
      target.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex  = (roleIndex + 1) % ROLES.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  tick();
}


/* ============================================================
   3. NAVIGATION
   — Adds .scrolled class to navbar after 60px of scroll
   — Handles hamburger toggle for mobile
============================================================ */
function initNavigation() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar) return;

  /* Sticky scroll state */
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* Mobile hamburger open / close */
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      /* Animate hamburger bars into ✕ */
      const bars = toggle.querySelectorAll('span');
      if (isOpen) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        bars[1].style.opacity   = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      }
    });

    /* Close menu when a link is clicked */
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const bars = toggle.querySelectorAll('span');
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      });
    });
  }
}


/* ============================================================
   4. ACTIVE NAV LINK ON SCROLL
   — Watches all sections; highlights the matching nav link
   — Uses IntersectionObserver for performance
============================================================ */
function initActiveNavLink() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px', // trigger when section is near center
      threshold: 0,
    }
  );

  sections.forEach(s => observer.observe(s));
}


/* ============================================================
   5. FADE-IN ON SCROLL
   — Every element with class .fade-in gets class .visible
   — when it enters the viewport
============================================================ */
function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          /* Stagger delay based on sibling index in its parent */
          const siblings = Array.from(entry.target.parentNode.children)
            .filter(el => el.classList.contains('fade-in'));
          const i = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(i * 0.1, 0.4)}s`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   6. SKILL BAR ANIMATION
   — Reads data-level attribute from .skill-bar-fill elements
   — and animates width when the bar scrolls into view
============================================================ */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const level = entry.target.getAttribute('data-level') || '0';
          /* Small delay so the transition is visible */
          setTimeout(() => {
            entry.target.style.width = level + '%';
          }, 200);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(bar => observer.observe(bar));
}


/* ============================================================
   7. CONTACT FORM
   — Client-side validation only
   — To actually send email: replace the fake submit logic
   — with a real backend call or Formspree integration
============================================================ */
function initContactForm() {
  const sendBtn  = document.getElementById('sendBtn');
  const feedback = document.getElementById('formFeedback');

  if (!sendBtn) return;

  sendBtn.addEventListener('click', () => {
    /* ── Read field values ── */
    const name    = document.getElementById('name')?.value.trim();
    const email   = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    /* ── Validation ── */
    if (!name || !email || !message) {
      showFeedback('Please fill in all fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }

    /* ── Fake submit (replace this block with real API call) ── */
    sendBtn.textContent  = 'Sending…';
    sendBtn.disabled     = true;

    setTimeout(() => {
      showFeedback('✓ Message sent! I\'ll get back to you soon.', 'success');
      sendBtn.textContent = 'Send Message →';
      sendBtn.disabled    = false;
      /* Clear fields */
      document.getElementById('name').value    = '';
      document.getElementById('email').value   = '';
      document.getElementById('message').value = '';
    }, 1400);
  });

  /* Helper: show styled feedback text */
  function showFeedback(text, type) {
    if (!feedback) return;
    feedback.textContent  = text;
    feedback.style.color  = type === 'success'
      ? 'var(--accent-green)'
      : '#ff6b6b';
    /* Clear after 5 seconds */
    setTimeout(() => { feedback.textContent = ''; }, 5000);
  }
}

  /* Will automatically copy the email adress */
function copyEmail(event) {
  event.preventDefault(); // 🔥 stops page from going to top

  const email = "cremamichaellafrancine07@gmail.com";

  navigator.clipboard.writeText(email);

  alert("Email copied to clipboard! 📋"); // simple notification
}


/* ============================================================
   8. FOOTER YEAR
   — Automatically inserts the current year
============================================================ */
function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}


/* ============================================================
   9. INIT — Run everything once the DOM is ready
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initStarField();      // 1 — animated star canvas
  initTypedText();      // 2 — hero typing animation
  initNavigation();     // 3 — sticky nav + hamburger
  initActiveNavLink();  // 4 — highlight nav link on scroll
  initFadeIn();         // 5 — fade-in reveal on scroll
  initSkillBars();      // 6 — animate skill progress bars
  initContactForm();    // 7 — contact form validation
  initFooterYear();     // 8 — auto year in footer
});
