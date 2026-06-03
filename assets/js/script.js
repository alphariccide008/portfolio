'use strict';

/* ============================================================
   THREE.JS — Particle Field Background
   ============================================================ */
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.position.z = 5;

  // Particles
  const count    = 1200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    sizes[i] = Math.random() * 2 + 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0x2563EB,
    size: 0.04,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Lines between nearby particles (connection web)
  const lineMat = new THREE.LineBasicMaterial({ color: 0x2563EB, transparent: true, opacity: 0.06 });
  const lineGeo = new THREE.BufferGeometry();
  const lineVerts = [];
  const threshold = 2.5;

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = positions[i*3]   - positions[j*3];
      const dy = positions[i*3+1] - positions[j*3+1];
      const dz = positions[i*3+2] - positions[j*3+2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < threshold) {
        lineVerts.push(positions[i*3], positions[i*3+1], positions[i*3+2]);
        lineVerts.push(positions[j*3], positions[j*3+1], positions[j*3+2]);
      }
    }
  }

  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  let mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 0.3;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.0003;
    particles.rotation.y = t * 0.12 + mouse.x;
    particles.rotation.x = t * 0.06 + mouse.y;
    lines.rotation.y = particles.rotation.y;
    lines.rotation.x = particles.rotation.x;
    renderer.render(scene, camera);
  }

  animate();
})();


/* ============================================================
   CURSOR GLOW
   ============================================================ */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
  });
}


/* ============================================================
   GSAP — Page entrance animation
   ============================================================ */
function runGSAP() {
  if (typeof gsap === 'undefined') return;

  // Sidebar entrance
  gsap.from('.sidebar', {
    x: -40, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all',
  });

  // Navbar
  gsap.from('.topnav', {
    y: -20, opacity: 0, duration: 0.6, delay: 0.2, ease: 'power2.out', clearProps: 'all',
  });

  // Bio + section labels only — NOT their children
  gsap.from('.about-bio', {
    y: 18, opacity: 0, duration: 0.5, delay: 0.3, ease: 'power2.out', clearProps: 'all',
  });

  // Service cards stagger (no parent conflict)
  gsap.from('.service-card', {
    y: 20, opacity: 0, scale: 0.96,
    duration: 0.45, stagger: 0.09, delay: 0.4,
    ease: 'back.out(1.5)', clearProps: 'all',
  });

  // Achievement cards stagger
  gsap.from('.achievement-card', {
    y: 18, opacity: 0,
    duration: 0.4, stagger: 0.07, delay: 0.55,
    ease: 'power2.out', clearProps: 'all',
  });
}

document.addEventListener('DOMContentLoaded', runGSAP);


/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (isNaN(target)) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 30);
}

function runCounters(scope) {
  const root = scope || document;
  root.querySelectorAll('[data-count]').forEach(animateCounter);
}

// Run on load for visible page
document.addEventListener('DOMContentLoaded', () => {
  runCounters(document.getElementById('page-about'));
  runCounters(document.querySelector('.sidebar'));
});


/* ============================================================
   SKILL BAR ANIMATION
   ============================================================ */
function animateSkills() {
  document.querySelectorAll('.skill-fill').forEach(fill => {
    const w = fill.getAttribute('data-w');
    setTimeout(() => { fill.style.width = w + '%'; }, 100);
  });
}


/* ============================================================
   TAB NAVIGATION
   ============================================================ */
const navBtns = document.querySelectorAll('.nav-btn');
const pages   = document.querySelectorAll('.page');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.page;

    navBtns.forEach(b => b.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const page = document.getElementById('page-' + target);
    if (page) page.classList.add('active');

    // Animate direct child sections on tab switch (not inner cards)
    if (typeof gsap !== 'undefined') {
      const directChildren = document.querySelectorAll('#page-' + target + ' > section, #page-' + target + ' > div, #page-' + target + ' > header');
      gsap.from(directChildren, {
        y: 14, opacity: 0, duration: 0.4, stagger: 0.07,
        ease: 'power2.out', clearProps: 'all',
      });
    }

    // Counters + skills for specific tabs
    if (target === 'about') runCounters(page);
    if (target === 'resume') {
      animateSkills();
      runCounters(page);
    }
  });
});


/* ============================================================
   PORTFOLIO FILTER
   ============================================================ */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const categories = (card.dataset.cat || '').split(/\s+/).filter(Boolean);
      if (filter === 'all' || categories.includes(filter)) {
        card.classList.remove('hidden');
        if (typeof gsap !== 'undefined') {
          gsap.from(card, { scale: 0.95, opacity: 0, duration: 0.3, ease: 'power2.out' });
        }
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


/* ============================================================
   CONTACT FORM
   ============================================================ */
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');

if (contactForm && submitBtn) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    submitBtn.innerHTML = `
      <svg style="animation:spin 0.8s linear infinite;width:15px;height:15px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      Sending...
    `;
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:15px;height:15px">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Message Sent!
      `;
      submitBtn.style.background = 'linear-gradient(135deg, #059669, #10B981)';
      contactForm.reset();

      setTimeout(() => {
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send Message
        `;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3500);
    }, 1600);
  });
}

// Spin keyframe via style tag
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }';
document.head.appendChild(spinStyle);


/* ============================================================
   GSAP — Animate page transition on tab switch
   ============================================================ */
// Run skills once resume is visible
document.querySelector('[data-page="resume"]').addEventListener('click', () => {
  setTimeout(animateSkills, 150);
});
