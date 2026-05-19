/* ================================================================
   script.js — 5-Jahre-Abi · v3
   Consumes: data.js (SCHOOL, ABI_DATE, ALUMNI, DISTANCE_HIGHLIGHT)
   Powers:   scroll-zoom hero · distance map · scrollytelling reveals
================================================================ */
'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------
   Helpers
---------------------------------------------------------------- */
const MS_PER_DAY = 86_400_000;
const SVG_NS = 'http://www.w3.org/2000/svg';
const NOW = new Date();
const APPLE_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function clamp(x, a = 0, b = 1) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function bell(a, peak, c, x) {
  if (x <= a || x >= c) return 0;
  if (x < peak) return smoothstep(a, peak, x);
  return 1 - smoothstep(peak, c, x);
}
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function fmtDateTime(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function svg(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}


/* ----------------------------------------------------------------
   Footer year + header counter
---------------------------------------------------------------- */
const footerYearEl = document.getElementById('footerYear');
if (footerYearEl) footerYearEl.textContent = NOW.getFullYear();

const TOTAL_DAYS = Math.floor((NOW - ABI_DATE) / MS_PER_DAY);
const headerCounterEl = document.getElementById('headerCounterValue');
if (headerCounterEl) headerCounterEl.textContent = TOTAL_DAYS.toLocaleString('de-DE');


/* ----------------------------------------------------------------
   HERO — MapLibre GL JS map + scrub timeline
   WebGL vector tiles: zoom is GPU-interpolated, no tile gaps or blinking.
   Clock, needle, step indicator unchanged.
---------------------------------------------------------------- */
function setupHeroScroll() {
  const heroEl = document.getElementById('hero');
  if (!heroEl) return;
  if (typeof maplibregl === 'undefined') {
    window.addEventListener('load', setupHeroScroll, { once: true });
    return;
  }

  const isDark = document.documentElement.classList.contains('dark')
              || window.matchMedia('(prefers-color-scheme: dark)').matches;
  const heroStyleUrl = isDark
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  const heroMap = new maplibregl.Map({
    container:        'hero-map',
    style:            heroStyleUrl,
    center:           [9.5, 51.0],
    zoom:             4,
    interactive:      false,  // disables all user pan/zoom
    fadeDuration:     0,      // tiles appear instantly (no built-in fade)
    antialias:        true,
    attributionControl: false,
  });

  // Waypoints — final zoom raised to 15; vector tiles render it cleanly
  const MAP_CHAPTERS = [
    { lat: 51.0,       lng:  9.5,        zoom:  4  },  // Europe
    { lat: 52.0,       lng: 10.1,        zoom:  8  },  // Germany
    { lat: 52.26,      lng: 10.22,       zoom: 11  },  // region
    { lat: SCHOOL.lat, lng: SCHOOL.lon,  zoom: 15  },  // school
  ];

  let heroMapReady = false;
  let currentT = 0;

  // jumpTo() feeds directly into MapLibre's WebGL render loop —
  // the GPU redraws on the next rAF with no tile fetch gap.
  function updateHeroMap(t) {
    if (!heroMapReady) return;
    const n  = MAP_CHAPTERS.length - 1;
    const fi = clamp(t) * n;
    const i  = Math.min(Math.floor(fi), n - 1);
    const fr = fi - i;
    const a  = MAP_CHAPTERS[i], b = MAP_CHAPTERS[i + 1];
    heroMap.jumpTo({
      center: [lerp(a.lng, b.lng, fr), lerp(a.lat, b.lat, fr)],
      zoom:   lerp(a.zoom, b.zoom, fr),
    });
  }

  // --- UI refs ---
  const hourHand   = heroEl.querySelector('.clock-hand--hour');
  const minHand    = heroEl.querySelector('.clock-hand--minute');
  const clockLabel = heroEl.querySelector('.clock-label');
  const stepNum    = heroEl.querySelector('#heroStepNum');
  const needle     = heroEl.querySelector('.hero-timeline__needle');
  const tlNow      = heroEl.querySelector('#heroTimelineNow');

  if (clockLabel) clockLabel.textContent = fmtDateTime(NOW);
  if (tlNow)      tlNow.textContent      = `heute · ${NOW.getFullYear()}`;

  const totalMs = NOW - ABI_DATE;

  function updateHero(t) {
    currentT = t;
    updateHeroMap(t);

    // Clock spinning backwards
    const hourDeg = -t * 1440;
    const minDeg  = -t * 1440 * 12;
    if (hourHand) hourHand.setAttribute('transform', `rotate(${hourDeg})`);
    if (minHand)  minHand .setAttribute('transform', `rotate(${minDeg})`);

    // Date label counting back to Abi day
    const interpolated = new Date(NOW.getTime() - t * totalMs);
    if (clockLabel) {
      clockLabel.textContent = t < 0.95 ? fmtDateTime(interpolated) : '02.07.2022 · 09:00';
    }

    // Timeline needle
    if (needle) needle.style.setProperty('--t', t.toFixed(3));

    // Step indicator
    const chapters = ['Weit', 'Nicht Nah', 'Nah', 'Ganz Nah'];
    const idx = Math.min(3, Math.floor(t * 4));
    if (stepNum) stepNum.textContent = `${String(idx + 1).padStart(2, '0')} / 04 · ${chapters[idx]}`;
  }

  updateHero(0);

  if (prefersReducedMotion) {
    updateHero(1);
    // Don't return — heroMap.on('load') below still needs to run to sync the map
  } else {
    // scrub:true = zero lag, animation tracks scroll position 1:1.
    // This eliminates the "teleport" that happened with scrub:1.2 — with lag, the scrub
    // proxy kept animating for 1.2 s after the pin released, causing a scroll position jump.
    // MapLibre GL renders via WebGL so every jumpTo() is smooth regardless of scrub mode.
    //
    // end formula: GSAP pin inserts a spacer whose height = heroEl.offsetHeight + pin_duration.
    // So we subtract the hero's own height from the pin_duration to make the total scroll
    // space exactly 4×innerHeight — otherwise there is a blank viewport-height gap between
    // the pin zone and the next section.
    const _proxy = { t: 0 };
    gsap.to(_proxy, {
      t: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: heroEl,
        start: 'top top',
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        end: () => `+=${Math.max(window.innerHeight * 4 - heroEl.offsetHeight, 2000)}`,
      },
      onUpdate: () => updateHero(_proxy.t),
    });
  }

  // Build clock face ticks
  const ticksG = heroEl.querySelector('.clock-ticks');
  if (ticksG) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ticksG.appendChild(svg('line', {
        x1: Math.sin(a) * 24, y1: -Math.cos(a) * 24,
        x2: Math.sin(a) * 27, y2: -Math.cos(a) * 27,
      }));
    }
  }

  // Map ready: add school pin, then sync to wherever the scroll is now
  heroMap.on('load', () => {
    heroMapReady = true;
    const pinEl = document.createElement('div');
    pinEl.className = 'map-pin';
    new maplibregl.Marker({ element: pinEl, anchor: 'center' })
      .setLngLat([SCHOOL.lon, SCHOOL.lat])
      .addTo(heroMap);
    updateHeroMap(currentT);
  });
}

setupHeroScroll();


/* ----------------------------------------------------------------
   Scroll-reveal — Apple-flagship fade-up
---------------------------------------------------------------- */
const REVEAL_TARGETS = [
  '.intro-text-wrap', '.polaroid-cluster',
  '.stat',
  '.distance-stage', '.distance-readout',
  '.wiedersehen-card', '.spotify-card',
  '.archiv-header', '.archiv-card',
  '.form-wrapper',
  // Footer intentionally excluded — iframe height changes after GSAP init
  // cause scroll-position miscalculation and leave the footer permanently invisible.
];
REVEAL_TARGETS.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => el.classList.add('scroll-reveal'));
});

gsap.utils.toArray('.scroll-reveal').forEach(el => {
  const delay = el.classList.contains('stat') || el.classList.contains('archiv-card')
    ? Array.from(el.parentNode.children).indexOf(el) * 0.08
    : 0;
  gsap.fromTo(el,
    { opacity: 0, y: 48 },
    {
      opacity: 1,
      y: 0,
      duration: 1.3,
      delay,
      ease: APPLE_EASE,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
});

// Stagger header children
gsap.utils.toArray('.section-header').forEach(header => {
  gsap.fromTo(header.children,
    { opacity: 0, y: 32 },
    {
      opacity: 1, y: 0,
      duration: 1.1,
      ease: APPLE_EASE,
      stagger: 0.10,
      scrollTrigger: { trigger: header, start: 'top 84%', once: true },
    });
});

// Scrubbed scale on cards
gsap.utils.toArray('.spotify-card, .form-wrapper, .wiedersehen-card').forEach(card => {
  gsap.fromTo(card,
    { scale: 0.96 },
    {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 45%', scrub: 1.2 },
    });
});

// Polaroid parallax
gsap.utils.toArray('.polaroid').forEach((el, i) => {
  gsap.to(el, {
    y: () => (i % 2 === 0 ? -24 : 18),
    ease: 'none',
    scrollTrigger: { trigger: el.closest('.intro'), start: 'top bottom', end: 'bottom top', scrub: true },
  });
});

// Stats count-up
gsap.utils.toArray('.stat__num').forEach(el => {
  const final = el.textContent.trim();
  const num = parseInt(final.replace(/[^\d]/g, ''), 10);
  if (!isFinite(num) || num === 0) return;
  const prefix = final.match(/^[^\d]*/)[0];
  const proxy = { n: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 92%',
    once: true,
    onEnter: () => {
      gsap.to(proxy, {
        n: num,
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => {
          if (prefix && el.querySelector('em')) {
            el.innerHTML = `<em>${prefix.trim()}</em>${Math.round(proxy.n)}`;
          } else {
            el.textContent = `${prefix}${Math.round(proxy.n)}`;
          }
        },
      });
    },
  });
});


/* ----------------------------------------------------------------
   Distance Map — Alumni heatmap
   Shows all ALUMNI locations as a heatmap, auto-fitted to bounds.
---------------------------------------------------------------- */
function initLeafletMap() {
  const el = document.getElementById('leaflet-map');
  if (!el) return;
  if (typeof L === 'undefined') {
    window.addEventListener('load', initLeafletMap, { once: true });
    return;
  }

  const isDark = document.documentElement.classList.contains('dark')
              || window.matchMedia('(prefers-color-scheme: dark)').matches;
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const allPoints = ALUMNI.map(a => [a.lat, a.lon]);
  const bounds    = L.latLngBounds(allPoints);

  const map = L.map('leaflet-map', {
    zoomControl:        false,
    scrollWheelZoom:    false,
    dragging:           false,
    touchZoom:          false,
    doubleClickZoom:    false,
    keyboard:           false,
    attributionControl: true,
  });

  map.fitBounds(bounds, { padding: [40, 40] });

  L.tileLayer(tileUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  // Alumni heatmap (Leaflet.heat), fallback to circle markers
  const heatData = ALUMNI.map(a => [a.lat, a.lon, 1]);
  if (typeof L.heatLayer !== 'undefined') {
    L.heatLayer(heatData, {
      radius:   28,
      blur:     22,
      maxZoom:  12,
      gradient: { 0.3: '#6dc9e5', 0.6: '#2da5c7', 1.0: '#053744' },
    }).addTo(map);
  } else {
    ALUMNI.forEach(a => {
      L.circleMarker([a.lat, a.lon], {
        radius:      5,
        fillColor:   '#6dc9e5',
        color:       'transparent',
        fillOpacity: 0.6,
      }).addTo(map);
    });
  }

  // School pin on top
  const schoolIcon = L.divIcon({
    className:  '',
    html:       '<div class="map-pin"></div>',
    iconSize:   [16, 16],
    iconAnchor: [8, 8],
  });
  L.marker([SCHOOL.lat, SCHOOL.lon], { icon: schoolIcon })
    .bindTooltip(SCHOOL.name, { permanent: false, direction: 'top', className: 'map-tooltip' })
    .addTo(map);

  // Distance km counter + stage parallax
  const counterEl = document.getElementById('distanceNum');
  const KM = DISTANCE_HIGHLIGHT.km;

  if (prefersReducedMotion) {
    if (counterEl) counterEl.textContent = KM.toLocaleString('de-DE');
    return;
  }

  gsap.fromTo('.distance-stage',
    { scale: 0.965, opacity: 0.86 },
    {
      scale: 1, opacity: 1,
      scrollTrigger: { trigger: '#distance', start: 'top 90%', end: 'top 35%', scrub: 1.2 },
    });

  if (counterEl) {
    ScrollTrigger.create({
      trigger: '#distance',
      start:   'top 70%',
      once:    true,
      onEnter: () => {
        const proxy = { n: 0 };
        gsap.to(proxy, {
          n: KM, duration: 2.4, ease: 'power3.out',
          onUpdate: () => { counterEl.textContent = Math.round(proxy.n).toLocaleString('de-DE'); },
        });
      },
    });
  }
}

initLeafletMap();


/* ----------------------------------------------------------------
   Modal — generic multi-modal system (Impressum + Datenschutz)
---------------------------------------------------------------- */
const FOCUSABLE_SEL =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let _activeModal = null;
let _prevFocus   = null;

function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  _activeModal = m;
  _prevFocus   = document.activeElement;
  const dialog   = m.querySelector('.modal-dialog');
  const backdrop = m.querySelector('.modal-backdrop');
  m.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25 });
  gsap.fromTo(dialog,
    { opacity: 0, y: 24, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'power3.out', delay: 0.04 });
  m.querySelector(FOCUSABLE_SEL)?.focus();
  document.addEventListener('keydown', _modalKey);
}

function closeModal() {
  const m = _activeModal;
  if (!m) return;
  const dialog   = m.querySelector('.modal-dialog');
  const backdrop = m.querySelector('.modal-backdrop');
  gsap.timeline({ onComplete() { m.style.display = 'none'; document.body.style.overflow = ''; _activeModal = null; } })
    .to(dialog,   { opacity: 0, y: 14, scale: 0.97, duration: 0.20, ease: 'power2.in' })
    .to(backdrop, { opacity: 0, duration: 0.18 }, '-=0.08');
  document.removeEventListener('keydown', _modalKey);
  _prevFocus?.focus();
}

function _modalKey(e) {
  if (!_activeModal) return;
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
  if (e.key !== 'Tab') return;
  const els   = Array.from(_activeModal.querySelectorAll(FOCUSABLE_SEL));
  const first = els[0], last = els[els.length - 1];
  if (!els.length) return;
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeModal));
document.querySelectorAll('.modal-backdrop').forEach(el => el.addEventListener('click', closeModal));
document.getElementById('openImpressum')?.addEventListener('click', () => openModal('impressum-modal'));
document.getElementById('openDatenschutz')?.addEventListener('click', () => openModal('datenschutz-modal'));
document.getElementById('openDatenschutz2')?.addEventListener('click', e => { e.preventDefault(); openModal('datenschutz-modal'); });


/* ----------------------------------------------------------------
   GDPR Consent — two-click iFrame activation (Spotify + Google Forms)
   Consent state persisted in localStorage; no iframe src is ever set
   before the user explicitly grants permission.
---------------------------------------------------------------- */
const IFRAME_DEFS = {
  spotify: {
    attrs: {
      class:           'spotify-iframe',
      src:             'https://open.spotify.com/embed/playlist/3XjMcGBj55qmSTiTL2uPKf?utm_source=generator&theme=0',
      width:           '100%',
      height:          '352',
      frameborder:     '0',
      loading:         'lazy',
      allowfullscreen: '',
      allow:           'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
      title:           'Spotify Playlist',
    },
  },
};

function _injectIframe(wrapEl, type, animate) {
  const def = IFRAME_DEFS[type];
  if (!def) return;
  const iframe = document.createElement('iframe');
  Object.entries(def.attrs).forEach(([k, v]) => iframe.setAttribute(k, v));
  if (animate) {
    iframe.style.opacity = '0';
    wrapEl.innerHTML = '';
    wrapEl.appendChild(iframe);
    gsap.to(iframe, { opacity: 1, duration: 0.8, delay: 0.05 });
  } else {
    wrapEl.innerHTML = '';
    wrapEl.appendChild(iframe);
  }
}

document.querySelectorAll('.consent-wrap').forEach(wrapEl => {
  const btn = wrapEl.querySelector('.consent-card__btn');
  if (!btn) return;
  const key  = btn.dataset.consentKey;
  const type = btn.dataset.iframeType;
  if (!key || !type) return;

  if (localStorage.getItem(key) === 'true') {
    _injectIframe(wrapEl, type, false);
    return;
  }

  btn.addEventListener('click', () => {
    localStorage.setItem(key, 'true');
    _injectIframe(wrapEl, type, true);
  });
});


/* ----------------------------------------------------------------
   Erinnerungen — native survey form → Google Apps Script
---------------------------------------------------------------- */
const SURVEY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbziQI7ij_NY25I_9s_XCi-D8apSpiOjeUCwJ9eDsjl4Bh8sbGHas5yCBUw2yM5vu60r/exec';
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const surveyForm    = document.getElementById('surveyForm');
const fileDropZone  = document.getElementById('fileDropZone');
const fileInput     = document.getElementById('fileUpload');
const fileListEl    = document.getElementById('fileList');
const fileSizeTotEl = document.getElementById('fileSizeTotal');

function _updateFileUI() {
  if (!fileListEl || !fileInput) return;
  fileListEl.innerHTML = '';
  let total = 0;
  Array.from(fileInput.files).forEach(f => {
    total += f.size;
    const li = document.createElement('li');
    li.className = 'file-item';
    li.textContent = `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB`;
    fileListEl.appendChild(li);
  });
  if (fileSizeTotEl) {
    fileSizeTotEl.textContent = total > 0 ? `${(total / 1024 / 1024).toFixed(1)} / 20 MB gesamt` : '';
    fileSizeTotEl.classList.toggle('is-over-limit', total > MAX_UPLOAD_BYTES);
  }
  fileDropZone?.classList.toggle('is-over-limit', total > MAX_UPLOAD_BYTES);
}

if (fileInput) fileInput.addEventListener('change', _updateFileUI);

if (fileDropZone) {
  fileDropZone.addEventListener('dragover', e => { e.preventDefault(); fileDropZone.classList.add('is-over'); });
  fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('is-over'));
  fileDropZone.addEventListener('drop', e => {
    e.preventDefault();
    fileDropZone.classList.remove('is-over');
    if (fileInput) { fileInput.files = e.dataTransfer.files; _updateFileUI(); }
  });
  fileDropZone.querySelector('.file-drop-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    fileInput?.click();
  });
}

function _showSuccess() {
  const successEl = document.getElementById('successMessage');
  if (!successEl || !surveyForm) return;

  gsap.to(surveyForm, {
    opacity: 0, y: -16, duration: 0.35, ease: 'power2.in',
    onComplete() {
      surveyForm.style.display = 'none';
      successEl.style.opacity = '0';
      successEl.style.display = 'flex';

      gsap.to('.success-circle', { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut', delay: 0.1 });
      gsap.to('.success-check',  { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out',   delay: 0.6 });
      gsap.to(successEl,         { opacity: 1, duration: 0.45, ease: 'power2.out' });

      gsap.delayedCall(3.2, () => {
        gsap.to(successEl, {
          opacity: 0, y: 16, duration: 0.35, ease: 'power2.in',
          onComplete() {
            successEl.style.display = 'none';
            gsap.set('.success-circle', { strokeDashoffset: 70 });
            gsap.set('.success-check',  { strokeDashoffset: 15 });
            surveyForm.reset();
            if (fileListEl)    fileListEl.innerHTML = '';
            if (fileSizeTotEl) fileSizeTotEl.textContent = '';
            fileDropZone?.classList.remove('is-over-limit');
            gsap.set(surveyForm, { y: 20, opacity: 0 });
            surveyForm.style.display = 'flex';
            gsap.to(surveyForm, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
          },
        });
      });
    },
  });
}

if (surveyForm) {
  surveyForm.addEventListener('submit', async e => {
    e.preventDefault();

    const totalBytes = Array.from(fileInput?.files ?? []).reduce((s, f) => s + f.size, 0);
    if (totalBytes > MAX_UPLOAD_BYTES) {
      alert('Die Dateien überschreiten das Limit von 20 MB. Bitte weniger oder kleinere Dateien auswählen.');
      return;
    }

    const btn = document.getElementById('submitBtn');
    const origText = btn.textContent;
    btn.textContent = 'Wird gesendet…';
    btn.disabled = true;

    const fileData = await Promise.all(
      Array.from(fileInput?.files ?? []).map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve({ name: file.name, type: file.type, data: reader.result.split(',')[1] });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }))
    );

    const body = new URLSearchParams({
      name:         document.getElementById('name').value,
      email:        document.getElementById('email').value,
      plz:          document.getElementById('plz').value,
      lebensphase:  document.getElementById('lebensphase').value,
      beschreibung: document.getElementById('beschreibung').value,
      kommentar:    document.getElementById('kommentar').value,
      files:        JSON.stringify(fileData),
    });

    try {
      await fetch(SURVEY_ENDPOINT, { method: 'POST', body, mode: 'no-cors' });
      _showSuccess();
    } catch (err) {
      alert(`Fehler beim Senden: ${err.message}`);
      btn.textContent = origText;
      btn.disabled = false;
    }
  });
}


/* ----------------------------------------------------------------
   Polaroid photos — fade in on load, remove broken picture elements
---------------------------------------------------------------- */
document.querySelectorAll('.polaroid-photo').forEach(img => {
  const wrap = img.closest('.polaroid-img');
  if (!wrap) return;
  const reveal = () => wrap.classList.add('has-photo');
  if (img.complete && img.naturalWidth > 0) { reveal(); return; }
  img.addEventListener('load',  reveal);
  img.addEventListener('error', () => img.closest('picture')?.remove());
});


/* ----------------------------------------------------------------
   ScrollTrigger refresh — after fonts AND after window.load
   (window.load catches Google Form iframe height changes)
---------------------------------------------------------------- */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  // Second pass after any post-load iframe resizing
  setTimeout(() => ScrollTrigger.refresh(), 800);
});
