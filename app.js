// app.js

// ===== small helpers =====
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

// ===== Smooth anchor scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ===== Active nav link on scroll =====
const nav = document.getElementById("topNav");
const links = nav ? Array.from(nav.querySelectorAll("a")) : [];
const targets = links
  .map(l => document.querySelector(l.getAttribute("href")))
  .filter(Boolean);

if (targets.length) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const id = "#" + visible.target.id;
    links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === id));
  }, {
    threshold: [0.25, 0.45, 0.65],
    rootMargin: "-30% 0px -55% 0px"
  });

  targets.forEach(t => observer.observe(t));
}

// ===== Footer year =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== DNA Scroll Sync + Idle Motion (SVG spiral tiles) =====
// Requires HTML:
// <div class="dna-track" id="dnaTrack"> ...two .dna-tile SVGs... </div>
const track = document.getElementById("dnaTrack");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Tunables
const DNA = {
  // how strongly DNA reacts to scroll (bigger = moves faster per scroll)
  scrollSpeed: 0.65,

  // constant downward drift even when not scrolling (px/sec)
  idleSpeed: 10,

  // optional: slight side-to-side sway (set 0 to disable)
  swayAmplitude: 3,     // px
  swayFrequency: 0.8,   // Hz

  // optional: tiny rotation to feel alive (degrees). keep small.
  tiltDegrees: 0.6
};

// We continuously animate so the DNA moves even when user stops scrolling.
// Wrap every 100vh because you have two 100vh tiles stacked.
function animateDna(now = performance.now()){
  if (!track || prefersReducedMotion) return;

  const vh = window.innerHeight;

  // Base vertical offset = scroll-linked + idle drift
  const idle = ((now / 1000) * DNA.idleSpeed) % vh;
  const scrollOffset = (window.scrollY * DNA.scrollSpeed) % vh;
  const offsetY = (scrollOffset + idle) % vh;

  // Optional micro motion
  const t = now / 1000;
  const swayX = DNA.swayAmplitude * Math.sin(t * Math.PI * 2 * DNA.swayFrequency);

  // Apply transform (translateY must be first for clean looping)
  track.style.transform = `
    translateY(${-offsetY}px)
    translateX(${swayX}px)
    rotate(${DNA.tiltDegrees}deg)
  `.trim();

  requestAnimationFrame(animateDna);
}

requestAnimationFrame(animateDna);