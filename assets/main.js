// AI Global Branding V4: page behaviour
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Footer year (element exists in index.html)
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Mobile navigation
const toggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('nav-list');
if (toggle && navList) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  navList.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
}

// Hero 3D molecule (poster image stays as fallback if WebGL is unavailable)
let molecule = null;
const canvas = document.getElementById('molecule-canvas');
async function initMolecule() {
  if (!canvas) return;
  try {
    const mod = await import('./molecule.js');
    if (!mod.supportsWebGL()) return;
    molecule = mod.createMolecule(canvas, { reducedMotion });
    requestAnimationFrame(() => document.documentElement.classList.add('is-3d-ready'));
  } catch (err) {
    console.warn('3D scene unavailable, showing poster.', err);
  }
}
initMolecule().then(initScroll);

// Scroll: hero handoff + restrained section entrances
function initScroll() {
  const { gsap, ScrollTrigger } = window;
  const hero = document.getElementById('hero');
  if (!gsap || !ScrollTrigger || !hero) {
    // Fallback handoff without GSAP
    if (molecule && hero) {
      addEventListener('scroll', () => {
        const r = hero.getBoundingClientRect();
        molecule.setProgress(-r.top / Math.max(1, r.height));
      }, { passive: true });
    }
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (molecule) {
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom top', scrub: reducedMotion ? false : 0.6,
      onUpdate: (self) => molecule.setProgress(self.progress),
    });
  }
  if (reducedMotion) return;

  const mm = gsap.matchMedia();

  // Social-proof rises into view as the hero exits
  gsap.from('.proof-grid > *, .logo-strip', {
    y: 32, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.06,
    scrollTrigger: { trigger: '#proof', start: 'top 85%', once: true },
  });

  document.querySelectorAll('.section .section-head, .services-grid, .timeline, .deliverables-list, .quotes, .faq-list, .contact-form, .mission-copy').forEach((el) => {
    gsap.from(el, {
      y: 28, opacity: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Why-us stack: earlier cards ease back slightly as the next one covers them (desktop only)
  mm.add('(min-width: 861px)', () => {
    const cards = gsap.utils.toArray('.stack-card');
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: 0.96, filter: 'brightness(0.55)', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 75%', end: 'top 30%', scrub: true },
      });
    });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
}

// Contact form
const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  const startedAt = Date.now();
  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
    message: (v) => (v.trim().length >= 10 ? '' : 'Please tell us a little more (at least 10 characters).'),
    consent: (_, el) => (el.checked ? '' : 'Please confirm consent so we can reply.'),
  };

  const validateField = (name) => {
    const el = form.elements[name];
    const msg = rules[name](el.value, el);
    const err = document.getElementById(`cf-${name}-err`);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach((name) => {
    const el = form.elements[name];
    // Re-check while typing so errors clear before the user moves on (avoids layout shift mid-click)
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
      if (el.getAttribute('aria-invalid') === 'true') validateField(name);
    });
    if (el.type !== 'checkbox') el.addEventListener('blur', () => { if (el.value) validateField(name); });
  });

  const setStatus = (msg, kind) => {
    status.textContent = msg;
    status.className = `form-status is-${kind}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      setStatus('Please correct the highlighted fields.', 'error');
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.consent.checked;
    data.elapsed = Date.now() - startedAt;

    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      setStatus('Preview mode: your details passed validation but were not sent, because form delivery is not connected yet.', 'info');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    setStatus('Sending…', 'info');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.message || `Request failed (${res.status})`);
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      setStatus('Thank you. Your message was sent and a specialist will be in touch.', 'success');
    } catch (err) {
      setStatus('Sorry, your enquiry could not be sent. Please try again in a moment.', 'error');
      console.error(err);
    } finally {
      btn.disabled = false;
    }
  });
}
