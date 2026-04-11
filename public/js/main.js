// === urbanyellow — main.js ===
gsap.registerPlugin(ScrollTrigger);


document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});



const IMAGES = JSON.parse(document.getElementById('images-data').textContent);
const body = document.body;

let parcoursInitialized = false;
let parcoursGrids = [];

const isMobile = window.matchMedia('(max-width: 767px)').matches;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const forceIndex = isMobile || prefersReduced;

// ---------- HERO reveal ----------
gsap.from('.hero-line', { y: '110%', duration: 1.1, ease: 'expo.out', delay: 0.1 });
gsap.to('.reveal', { opacity: 1, y: 0, duration: 1, stagger: 0.1, delay: 0.4, ease: 'power2.out' });

// ---------- LIGHTBOX ----------
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbCap = document.getElementById('lightbox-caption');
const lbCount = document.getElementById('lightbox-counter');
let lbIndex = 0;

function openLightbox(i) {
  lbIndex = i;
  const img = IMAGES[i];
  lbImg.src = img.src;
  lbImg.alt = img.caption;
  lbCap.textContent = img.caption;
  lbCount.textContent = `${String(i + 1).padStart(2, '0')} / ${String(IMAGES.length).padStart(2, '0')}`;
  lightbox.classList.add('is-open');
  setActiveThumb(i);
}
function closeLightbox() { lightbox.classList.remove('is-open'); }
function nextLb() { openLightbox((lbIndex + 1) % IMAGES.length); }
function prevLb() { openLightbox((lbIndex - 1 + IMAGES.length) % IMAGES.length); }

document.querySelectorAll('#mode-index .masonry-item').forEach((fig) => {
  fig.addEventListener('click', () => openLightbox(parseInt(fig.dataset.index, 10)));
});
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-next').addEventListener('click', nextLb);
document.getElementById('lightbox-prev').addEventListener('click', prevLb);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

// ---------- TIMELINE ----------
const timeline = document.getElementById('timeline');
const timelineThumbs = document.querySelectorAll('.timeline-thumb');
const timelineCounter = document.getElementById('timeline-counter');

function setActiveThumb(index) {
  timelineThumbs.forEach((t, i) => t.classList.toggle('is-active', i === index));
  if (timelineCounter) {
    timelineCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(IMAGES.length).padStart(2, '0')}`;
  }
}
timelineThumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const i = parseInt(thumb.dataset.index, 10);
    setActiveThumb(i);
    if (body.dataset.mode === 'index') {
      openLightbox(i);
    } else {
      const panelIdx = Math.floor(i / 8);
      const panel = document.querySelector(`.parcours-panel[data-panel="${panelIdx}"]`);
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

let timelineCollapsed = false;
const collapseBtn = document.getElementById('timeline-collapse');
collapseBtn.addEventListener('click', () => {
  timelineCollapsed = !timelineCollapsed;
  timeline.classList.toggle('collapsed', timelineCollapsed);
  collapseBtn.textContent = timelineCollapsed ? 'Afficher' : 'Réduire';
});

// ---------- MODE TOGGLE ----------
const modeIndex = document.getElementById('mode-index');
const modeParcours = document.getElementById('mode-parcours');
const labelIndex = document.querySelector('.mode-label-index');
const labelParcours = document.querySelector('.mode-label-parcours');

function setMode(mode) {
  if (mode === 'parcours' && forceIndex) mode = 'index';
  body.dataset.mode = mode;
  document.documentElement.dataset.mode = mode;
  if (mode === 'parcours') {
    modeIndex.classList.add('hidden');
    modeParcours.classList.remove('hidden');
    labelIndex.classList.add('hidden');
    labelParcours.classList.remove('hidden');
    initParcours();
  } else {
    modeIndex.classList.remove('hidden');
    modeParcours.classList.add('hidden');
    labelIndex.classList.remove('hidden');
    labelParcours.classList.add('hidden');
  }
  try { localStorage.setItem('mode', mode); } catch (e) {}
}

document.getElementById('mode-toggle').addEventListener('click', () => {
  setMode(body.dataset.mode === 'index' ? 'parcours' : 'index');
});

let savedMode = null;
try { savedMode = localStorage.getItem('mode'); } catch (e) {}
if (savedMode === 'index' || forceIndex) setMode('index');
else setMode('parcours');

document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('is-open')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLb();
    if (e.key === 'ArrowLeft') prevLb();
    return;
  }
  if (e.key === 'g' || e.key === 'G') setMode('index');
  if (e.key === 'p' || e.key === 'P') setMode('parcours');
});


// ---------- MODE PARCOURS — Codrops grid-to-preview ----------
class ProductPreview {
  constructor({ products, container }) {
    this.ui = {
      products,
      container,
      clipped: container.querySelector('.masked-preview'),
      img: container.querySelector('.preview-img'),
      title: container.querySelector('.product-title'),
      num: container.querySelector('.product-num'),
    };
    this.scaleFactor = { x: 0.96, y: 0.96 };
    this.armWidth = { x: 10, y: 10 };
    this.timeline = null;
    this.onResize();
  }

  setProduct(product) {
    if (product) {
      this.ui.title.textContent = product.dataset.name;
      this.ui.num.textContent = product.dataset.num;
      // Récupère le src depuis la tuile elle-même
      const tileImg = product.querySelector('img');
      if (tileImg) {
        this.ui.img.src = tileImg.src;
        this.ui.img.alt = tileImg.alt || '';
      }
      this.timeline.play();
    } else {
      this.timeline.reverse();
    }
  }

  buildTimeline() {
    const { x, y } = this.armWidth;
    const crossOpen = `polygon(
      ${50 - x / 2}% 0%, ${50 + x / 2}% 0%,
      ${50 + x / 2}% ${50 - y / 2}%, 100% ${50 - y / 2}%,
      100% ${50 + y / 2}%, ${50 + x / 2}% ${50 + y / 2}%,
      ${50 + x / 2}% 100%, ${50 - x / 2}% 100%,
      ${50 - x / 2}% ${50 + y / 2}%, 0% ${50 + y / 2}%,
      0% ${50 - y / 2}%, ${50 - x / 2}% ${50 - y / 2}%
    )`;
    const crossClosed = `polygon(
      50% 0%, 50% 0%, 50% 50%, 100% 50%,
      100% 50%, 50% 50%, 50% 100%, 50% 100%,
      50% 50%, 0% 50%, 0% 50%, 50% 50%
    )`;
    this.timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', duration: 0.6 } })
      .addLabel('preview', 0)
      .to(this.ui.container, { opacity: 1 }, 'preview')
      .to(this.ui.container, { scaleX: this.scaleFactor.x, scaleY: this.scaleFactor.y, transformOrigin: 'center center' }, 'preview')
      .to(this.ui.products, {
        opacity: 0,
        x: (i) => (i % 2 === 0 ? '2.5vw' : '-2.5vw'),
        y: (i) => (i < 2 ? '2.5vw' : '-2.5vw'),
      }, 'preview')
      .fromTo(this.ui.clipped, { clipPath: crossOpen }, { clipPath: crossClosed }, 'preview');
  }

  onResize() {
    const rect = this.ui.container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const vw = window.innerWidth / 100;
    const armPx = 5 * vw;
    this.armWidth = {
      x: (armPx / rect.width) * 100,
      y: (armPx / rect.height) * 100,
    };
    const wVw = rect.width / vw;
    const hVw = rect.height / vw;
    const shrink = 5;
    this.scaleFactor = {
      x: (wVw - shrink) / wVw,
      y: (hVw - shrink) / hVw,
    };
    this.timeline?.kill();
    this.buildTimeline();
  }
}

class ProductGrid {
  constructor(panel) {
    this.panel = panel;
    this.products = Array.from(panel.querySelectorAll('.product'));
    const left = panel.querySelector('.product-preview.--left');
    const right = panel.querySelector('.product-preview.--right');
    const productsLeftCols  = this.products.filter((_, i) => i % 4 === 0 || i % 4 === 1);
    const productsRightCols = this.products.filter((_, i) => i % 4 === 2 || i % 4 === 3);
    // Container DROIT : reçoit les produits DROITE (à fader). Ses <img> sont celles des produits GAUCHE
    // (parce qu'on hover un produit gauche → preview s'ouvre à droite avec son image).
    this.previewRight = new ProductPreview({
      container: right,
      products: productsRightCols, // ces 4 tuiles fadent quand on hover un produit gauche
    });
    // Container GAUCHE : reçoit les produits GAUCHE (à fader). Ses <img> = images des produits DROITE.
    this.previewLeft = new ProductPreview({
      container: left,
      products: productsLeftCols,
    });
    this.activeProduct = null;
    this.hoverDelay = null;
    this.addEvents();
  }

  getSide(p) {
    const i = parseInt(p.dataset.index, 10);
    // Cols 0-1 → preview opens on RIGHT (previewRight container)
    // Cols 2-3 → preview opens on LEFT (previewLeft container)
    return (i % 4 === 0 || i % 4 === 1) ? this.previewRight : this.previewLeft;
  }

  addEvents() {
    this.products.forEach((p) => {
      p.addEventListener('mouseenter', () => this.onEnter(p));
      p.addEventListener('mouseleave', () => this.onLeave());
      p.addEventListener('click', () => openLightbox(parseInt(p.dataset.img, 10)));
    });
  }

  onEnter(product) {
    if (this.hoverDelay) { clearTimeout(this.hoverDelay); this.hoverDelay = null; }
    this.hoverDelay = setTimeout(() => {
      this.activeProduct = product;
      this.getSide(product).setProduct(product);
      setActiveThumb(parseInt(product.dataset.img, 10));
      this.hoverDelay = null;
    }, 100);
  }

  onLeave() {
    if (this.hoverDelay) { clearTimeout(this.hoverDelay); this.hoverDelay = null; }
    if (this.activeProduct) {
      this.getSide(this.activeProduct).setProduct(null);
      this.activeProduct = null;
    }
  }

  onResize() {
    this.previewLeft.onResize();
    this.previewRight.onResize();
  }
}

function initParcours() {
  if (parcoursInitialized) return;
  parcoursInitialized = true;
  // Need a frame so the section is visible and getBoundingClientRect is non-zero
  requestAnimationFrame(() => {
    parcoursGrids = Array.from(document.querySelectorAll('.parcours-panel'))
      .map((panel) => new ProductGrid(panel));
  });
}

let resizeTO;
window.addEventListener('resize', () => {
  clearTimeout(resizeTO);
  resizeTO = setTimeout(() => {
    parcoursGrids.forEach((g) => g.onResize());
  }, 150);
});