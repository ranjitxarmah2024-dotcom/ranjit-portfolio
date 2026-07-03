// Minimal interactions: nav toggle, loader, counters, hero particles, typing, smooth behaviors
(function(){
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  // Add small CSS for typing cursor
  (function injectCursorStyle(){
    const css = `@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}.hero-cursor{display:inline-block;width:2px;height:1.05em;background:currentColor;margin-left:8px;vertical-align:bottom;animation:blink 1s steps(2,end) infinite}`;
    const el = document.createElement('style'); el.textContent = css; document.head.appendChild(el);
  })();

  // Loader
  window.addEventListener('load', () => {
    const loader = $('#site-loader'); if (loader) loader.classList.add('loaded');
    initCounters();
    initParticles();
  });

  // Nav toggle for small screens
  const navToggle = $('.nav-toggle');
  const nav = $('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open', !expanded);
    });
    $$('.nav a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }));
  }

  // Back to top
  const topBtn = document.querySelector('.top-btn');
  window.addEventListener('scroll', () => {
    if (!topBtn) return; topBtn.classList.toggle('visible', window.scrollY > 320);
  });
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  // Improved typing effect (non-invasive: uses existing text)
  (function typing(){
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    const full = heroTitle.textContent.trim();
    heroTitle.textContent = '';
    const cursor = document.createElement('span'); cursor.className = 'hero-cursor';
    let i = 0; const speed = 28;
    const tick = () => {
      if (i <= full.length) {
        heroTitle.textContent = full.slice(0, i++);
        if (!heroTitle.querySelector('.hero-cursor')) heroTitle.appendChild(cursor);
        setTimeout(tick, speed);
      } else {
        // keep cursor for a short while then stop blinking visually
        setTimeout(()=> cursor.style.opacity = '0', 1200);
      }
    };
    setTimeout(tick, 240);
  })();

  // Counters
  function initCounters(){
    const counters = $$('.stat');
    counters.forEach(el => {
      const valueEl = el.querySelector('.stat-value');
      const target = Number(el.getAttribute('data-target')) || 0; const duration = 1600; const start = performance.now();
      const step = (ts) => {
        const progress = Math.min((ts - start) / duration, 1);
        const value = Math.floor(progress * target);
        if (valueEl) valueEl.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // Intersection animations
  const animated = $$('[data-animate]');
  if ('IntersectionObserver' in window && animated.length) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('inview'); observer.unobserve(entry.target); }
    }), { threshold: 0.15 });
    animated.forEach(n => observer.observe(n));
  }

  // Contact form submission behavior
  const form = $('#contact-form');
  if (form) form.addEventListener('submit', (event) => {
    event.preventDefault(); const btn = form.querySelector('button[type="submit"]'); if (!btn) return; btn.textContent = 'Sending...';
    setTimeout(() => { btn.textContent = 'Sent ✓'; form.reset(); setTimeout(()=>{ if (btn) btn.textContent = 'Send Message'; }, 2200); }, 900);
  });

  // Lightweight particle system for hero canvas
  let particleRAF = null;
  function initParticles(){
    const canvas = document.getElementById('hero-particles'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); let DPR = Math.max(1, window.devicePixelRatio || 1);
    let W = canvas.clientWidth, H = canvas.clientHeight; canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR); canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; ctx.scale(DPR, DPR);

    let particles = [];
    function makeCount(){ const w = Math.max(window.innerWidth, 320); if (w < 480) return 24; if (w < 768) return 40; if (w < 1200) return 56; return 80; }
    function reset(){ W = canvas.clientWidth; H = canvas.clientHeight; DPR = Math.max(1, window.devicePixelRatio||1); canvas.width = Math.floor(W*DPR); canvas.height = Math.floor(H*DPR); canvas.style.width = W+'px'; canvas.style.height = H+'px'; ctx.setTransform(DPR,0,0,DPR,0,0); particles = []; const count = makeCount();
      for(let i=0;i<count;i++){ particles.push({x: Math.random()*W, y: Math.random()*H, r: 0.6+Math.random()*2.2, vx:(Math.random()-0.5)*0.25, vy:-0.1 - Math.random()*0.4, alpha:0.08+Math.random()*0.26}); }
    }
    reset();
    window.addEventListener('resize', () => { cancelAnimationFrame(particleRAF); setTimeout(reset, 120); particleLoop(); });

    let last = performance.now();
    function particleLoop(now){ particleRAF = requestAnimationFrame(particleLoop); const dt = Math.min(40, now - last); last = now; ctx.clearRect(0,0,W,H);
      // subtle background glow
      particles.forEach(p => {
        p.x += p.vx * (dt/16); p.y += p.vy * (dt/16);
        if (p.y < -12) { p.y = H + 8; p.x = Math.random()*W; }
        if (p.x < -20) p.x = W + 10; if (p.x > W+20) p.x = -10;
        ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
    }
    particleLoop(last);
  }

})();
