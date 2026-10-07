/* ==========================================================================
   The engine. You shouldn't need to edit this file — all the words, photos,
   names and colours live in js/config.js
   ========================================================================== */
(() => {
'use strict';

const C = window.CONFIG;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- text helpers ---------- */
const her = (!C.herName || C.herName === 'HER NAME') ? '[HER NAME]' : C.herName;
const me  = (!C.myName  || C.myName  === 'MY NAME')  ? '[MY NAME]'  : C.myName;
const sub = s => String(s).replace(/\{her\}/g, her).replace(/\{me\}/g, me);
const fmt = s => esc(sub(s))
  .replace(/\*([^*]+)\*/g, '<em class="em">$1</em>')
  .replace(/\[[^\]]*\]/g, m => `<span class="ph">${m}</span>`);
/* split text into per-word spans (for the handwriting reveal) */
function words(str) {
  let inPh = false, i = 0;
  return sub(str).split(/(\s+)/).map(tok => {
    if (!tok) return '';
    if (/^\s+$/.test(tok)) return tok;
    if (tok.includes('[')) inPh = true;
    const h = `<span class="w${inPh ? ' ph' : ''}" style="--i:${i++}">${esc(tok)}</span>`;
    if (tok.includes(']')) inPh = false;
    return h;
  }).join('');
}

/* ---------- apply colours / title ---------- */
if (C.colors) for (const [k, v] of Object.entries(C.colors)) document.documentElement.style.setProperty('--' + k, v);
if (C.herName && C.herName !== 'HER NAME') document.title = 'For ' + C.herName + ' 🤍';
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------- scroll lock (several reasons can lock) ---------- */
const locks = new Set();
const Lock = {
  add(k) { locks.add(k); this.sync(); },
  del(k) { locks.delete(k); this.sync(); },
  sync() { const on = locks.size > 0; body.classList.toggle('locked', on); document.documentElement.classList.toggle('locked', on); }
};
Lock.add('boot');

/* ==========================================================================
   PHOTOS (with graceful placeholders)
   ========================================================================== */
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'];
function placeholderPhoto(i) {
  const h = [338, 318, 292, 266, 350, 18, 304, 328][i % 8];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},72%,64%)"/><stop offset="1" stop-color="hsl(${h + 40},60%,30%)"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="330" cy="90" r="60" fill="rgba(255,255,255,.12)"/><path d="M200 330 C130 275 112 215 154 188 C182 171 200 193 200 210 C200 193 218 171 246 188 C288 215 270 275 200 330Z" fill="rgba(255,255,255,.4)"/><text x="200" y="400" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="rgba(255,255,255,.85)">photo ${i + 1}</text><text x="200" y="436" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="rgba(255,255,255,.55)">replace me in /assets</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
/* photoIndex is 0-based. Tries the configured path, then other extensions, then the placeholder. */
function loadPhoto(img, photoIndex) {
  const list = C.photos || [];
  const i = list.length ? ((photoIndex % list.length) + list.length) % list.length : photoIndex;
  const main = list[i] || '';
  const base = main.replace(/\.[a-z0-9]+$/i, '');
  const tries = main ? [main, ...EXTS.map(e => `${base}.${e}`).filter(p => p !== main)] : [];
  let n = 0;
  img.onerror = () => {
    n++;
    if (n < tries.length) img.src = tries[n];
    else { img.onerror = null; img.src = placeholderPhoto(i); }
  };
  if (tries.length) img.src = tries[0]; else img.src = placeholderPhoto(i);
}
const photoImg = (i, alt = '') => `<img data-photo="${i}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
function hydratePhotos(root = document) { $$('img[data-photo]', root).forEach(im => { loadPhoto(im, +im.dataset.photo); im.removeAttribute('data-photo'); }); }

/* ==========================================================================
   SOUND (music + tiny sfx)
   ========================================================================== */
const Sound = {
  ctx: null, enabled: false,
  init() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ } }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  tone(f, t = 0, d = .8, v = .05, type = 'sine') {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), now = c.currentTime + t;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(v, now + .02); g.gain.exponentialRampToValueAtTime(.0001, now + d);
    o.connect(g); g.connect(c.destination); o.start(now); o.stop(now + d + .05);
  },
  tap()   { this.tone(660, 0, .35, .035); this.tone(990, .07, .45, .02); },
  pop()   { this.tone(880, 0, .22, .03); },
  chime() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * .12, 1.3, .04)); },
  open()  { [392, 494, 587, 784].forEach((f, i) => this.tone(f, i * .1, 1.4, .035)); },
  soft()  { this.tone(330, 0, 1.2, .035); this.tone(262, .25, 1.4, .025); }
};

const Music = {
  a: null, gain: null, on: false, started: false, scene: .3, level: 0, raf: 0, pt: 0,
  setup() {
    const a = this.a = new Audio();
    a.loop = true; a.preload = 'auto'; a.src = C.music;
    Sound.init();
    /* iOS ignores audio.volume, so on http(s) route through a GainNode for smooth fades */
    if (Sound.ctx && /^https?:$/.test(location.protocol)) {
      try {
        const s = Sound.ctx.createMediaElementSource(a);
        this.gain = Sound.ctx.createGain(); this.gain.gain.value = 0;
        s.connect(this.gain); this.gain.connect(Sound.ctx.destination);
      } catch (e) { this.gain = null; }
    }
    if (!this.gain) a.volume = 0;
  },
  start() {
    if (this.started) return;
    this.started = true; this.on = true; Sound.enabled = true;
    try { this.setup(); const p = this.a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* silent */ }
    const b = $('#music'); b.hidden = false; this.ui();
    this.apply();
  },
  toggle() {
    Sound.init();
    if (!this.started) return this.start();
    this.on = !this.on; Sound.enabled = this.on;
    if (this.on) { const p = this.a.play(); if (p && p.catch) p.catch(() => {}); }
    this.ui(); this.apply();
  },
  ui() { const b = $('#music'); b.classList.toggle('on', this.on); b.setAttribute('aria-pressed', String(this.on)); },
  setScene(v) { this.scene = v; if (this.started) this.apply(); },
  apply() {
    const t = this.on ? this.scene : 0;
    if (this.gain) this.gain.gain.setTargetAtTime(t, Sound.ctx.currentTime, .7);
    else this.fade(t);
    clearTimeout(this.pt);
    if (!this.on) this.pt = setTimeout(() => { if (!this.on && this.a) this.a.pause(); }, 3000);
  },
  fade(t) {
    cancelAnimationFrame(this.raf);
    const step = () => {
      const d = t - this.level;
      if (Math.abs(d) < .01) { this.level = t; this.a.volume = clamp(t, 0, 1); return; }
      this.level += d * .035; this.a.volume = clamp(this.level, 0, 1);
      this.raf = requestAnimationFrame(step);
    };
    step();
  }
};
$('#music').addEventListener('click', () => Music.toggle());

/* ==========================================================================
   BACKGROUND (stars, motes, faint hearts)
   ========================================================================== */
const BG = {
  cv: $('#bg'), ctx: null, w: 0, h: 0, dpr: 1, stars: [], hearts: [],
  init() { this.ctx = this.cv.getContext('2d'); this.resize(); requestAnimationFrame(t => this.draw(t)); },
  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = innerWidth; this.h = innerHeight;
    this.cv.width = this.w * this.dpr; this.cv.height = this.h * this.dpr;
    const n = Math.round(clamp(this.w * this.h / 7500, 50, 150) * (reduce ? .5 : 1));
    this.stars = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), r: rand(.4, 1.7), p: rand(0, 6.3), s: rand(.4, 1.6), d: rand(.2, 1) }));
    this.hearts = Array.from({ length: reduce ? 3 : 9 }, () => ({ x: Math.random(), y: Math.random(), s: rand(7, 16), v: rand(.012, .04), a: rand(.07, .2), p: rand(0, 6.3) }));
  },
  heart(c, x, y, s) {
    c.beginPath(); c.moveTo(x, y + s * .9);
    c.bezierCurveTo(x - s * 1.1, y + s * .1, x - s * .7, y - s * .8, x, y - s * .35);
    c.bezierCurveTo(x + s * .7, y - s * .8, x + s * 1.1, y + s * .1, x, y + s * .9); c.fill();
  },
  draw(t) {
    requestAnimationFrame(tt => this.draw(tt));
    if (document.hidden) return;
    const c = this.ctx, w = this.w, h = this.h, warm = body.dataset.mood === 'warm';
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, w, h);
    const sy = scrollY, ts = t / 1000, col = warm ? '255,120,160' : '255,245,235';
    for (const s of this.stars) {
      let y = (s.y * h - sy * s.d * .06) % h; if (y < 0) y += h;
      const tw = reduce ? .7 : .5 + .5 * Math.sin(ts * s.s + s.p);
      c.fillStyle = `rgba(${col},${(warm ? .22 : .18) + tw * (warm ? .35 : .7)})`;
      c.beginPath(); c.arc(s.x * w, y, warm ? s.r * .85 : s.r, 0, 6.283); c.fill();
    }
    for (const g of this.hearts) {
      g.y -= g.v * .0016 * 16; if (g.y < -.05) { g.y = 1.05; g.x = Math.random(); }
      c.fillStyle = warm ? `rgba(255,80,130,${g.a * 1.2})` : `rgba(255,120,170,${g.a})`;
      this.heart(c, (g.x + Math.sin(ts * .5 + g.p) * .02) * w, g.y * h, g.s);
    }
  }
};

/* ==========================================================================
   FX (hearts, sparkles, confetti, fireworks)
   ========================================================================== */
const FX = {
  cv: $('#fx'), ctx: null, ps: [], run: false, last: 0, w: 0, h: 0, dpr: 1,
  PINK: ['#ff5d8f', '#ff8fb1', '#ffc2d4', '#ff7b9c', '#ffd0e0', '#ffffff'],
  CONF: ['#ff5d8f', '#ffb36b', '#ffd9a0', '#b48bff', '#7fd6ff', '#ffffff', '#ff8fb1'],
  init() { this.ctx = this.cv.getContext('2d'); this.resize(); },
  resize() { this.dpr = Math.min(devicePixelRatio || 1, 2); this.w = innerWidth; this.h = innerHeight; this.cv.width = this.w * this.dpr; this.cv.height = this.h * this.dpr; },
  n(k) { return Math.max(1, Math.round(k * (reduce ? .4 : 1))); },
  add(p) { this.ps.push(p); if (!this.run) { this.run = true; this.last = performance.now(); requestAnimationFrame(t => this.loop(t)); } },
  hearts(x, y, n = 10, o = {}) {
    for (let i = 0; i < this.n(n); i++) this.add({ t: 'heart', x: x + rand(-10, 10), y, vx: rand(-90, 90) * (o.spread || 1), vy: rand(-240, -80) * (o.up || 1), g: 90, drag: .6,
      life: 0, max: rand(1.3, 2.4), size: rand(6, 14) * (o.size || 1), color: this.PINK[(Math.random() * this.PINK.length) | 0], rot: rand(-.5, .5), vr: rand(-1, 1) });
  },
  tiny(x, y) { this.add({ t: 'heart', x, y, vx: rand(-15, 15), vy: rand(-60, -30), g: -5, drag: .3, life: 0, max: rand(.9, 1.5), size: rand(3, 6), color: this.PINK[(Math.random() * 3) | 0], rot: 0, vr: 0 }); },
  sparkles(x, y, n = 8, color) {
    for (let i = 0; i < this.n(n); i++) { const a = rand(0, 6.283), s = rand(30, 160);
      this.add({ t: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 40, drag: 1.8, life: 0, max: rand(.5, 1.1), size: rand(1.2, 2.8), color: color || '#ffe6a8' }); }
  },
  confetti(n = 100, fromX) {
    for (let i = 0; i < this.n(n); i++) this.add({ t: 'conf', x: fromX != null ? fromX + rand(-30, 30) : rand(0, this.w), y: fromX != null ? this.h * .6 : rand(-30, -4),
      vx: fromX != null ? rand(-260, 260) : rand(-50, 50), vy: fromX != null ? rand(-620, -260) : rand(60, 200), g: 220, drag: .7, life: 0, max: rand(3.5, 6),
      size: rand(5, 10), color: this.CONF[(Math.random() * this.CONF.length) | 0], rot: rand(0, 6.28), vr: rand(-6, 6), wob: rand(0, 6) });
  },
  firework(x, y, hue) {
    const cols = hue || [['#ff5d8f', '#ffd0e0'], ['#ffb36b', '#fff0c2'], ['#b48bff', '#e6d9ff'], ['#7fd6ff', '#ffffff']][(Math.random() * 4) | 0];
    for (let i = 0; i < this.n(70); i++) { const a = rand(0, 6.283), s = rand(60, 270);
      this.add({ t: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 110, drag: 1.5, life: 0, max: rand(1, 1.8), size: rand(1.4, 3), color: cols[(Math.random() * 2) | 0] }); }
    this.add({ t: 'spark', x, y, vx: 0, vy: 0, g: 0, drag: 0, life: 0, max: .25, size: 14, color: '#fff' });
  },
  heartPath(c, s) {
    c.beginPath(); c.moveTo(0, s * .9);
    c.bezierCurveTo(-s * 1.1, s * .1, -s * .7, -s * .8, 0, -s * .35);
    c.bezierCurveTo(s * .7, -s * .8, s * 1.1, s * .1, 0, s * .9); c.fill();
  },
  loop(now) {
    const dt = Math.min(.05, (now - this.last) / 1000); this.last = now;
    const c = this.ctx; c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, this.w, this.h);
    const live = [];
    for (const p of this.ps) {
      p.life += dt; if (p.life >= p.max) continue;
      const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy = p.vy * k + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.rot != null) p.rot += (p.vr || 0) * dt;
      const a = clamp(1 - p.life / p.max, 0, 1);
      c.globalAlpha = p.t === 'conf' ? Math.min(1, a * 3) : a;
      if (p.t === 'heart') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.color; this.heartPath(c, p.size); c.restore(); }
      else if (p.t === 'spark') { c.globalCompositeOperation = 'lighter'; c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size * (.5 + a * .5), 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
      else { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.cos(p.life * 6 + p.wob)); c.fillStyle = p.color; c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); c.restore(); }
      if (p.y < this.h + 40) live.push(p);
    }
    c.globalAlpha = 1; this.ps = live;
    if (live.length) requestAnimationFrame(t => this.loop(t)); else { this.run = false; c.clearRect(0, 0, this.w, this.h); }
  }
};

/* ==========================================================================
   CHARACTERS (little SVG people — minimal, stylised)
   ========================================================================== */
const POSES = {
  rest:  { l: 'M33 70 Q26 86 35 100', r: 'M67 70 Q74 86 65 100', hl: [35, 100], hr: [65, 100] },
  hold:  { l: 'M33 70 Q28 90 44 94',  r: 'M67 70 Q72 90 56 94',  hl: [44, 94],  hr: [56, 94] },
  heart: { l: 'M33 70 Q26 94 45 96',  r: 'M67 70 Q74 94 55 96',  hl: [45, 96],  hr: [55, 96] },
  write: { l: 'M33 70 Q28 90 42 99',  r: 'M67 70 Q76 90 60 99',  hl: [42, 99],  hr: [60, 99] },
  none:  null
};
function person(o, { pose = 'rest', legs = false, mood = 'smile', tilt = 0 } = {}) {
  const p = POSES[pose];
  const hairBack = o.girl ? `<path d="M27 42 C25 14 75 14 73 42 L75 86 C66 92 60 82 60 66 L40 66 C40 82 34 92 25 86 Z" fill="${o.hair}"/>` : '';
  const hairFront = o.girl
    ? `<path d="M29 38 C31 18 69 18 71 38 C62 31 46 29 29 38 Z" fill="${o.hair}"/>`
    : `<path d="M29 40 C26 16 46 10 54 13 C68 14 74 26 71 40 C67 31 58 26 50 27 C42 27 34 31 29 40 Z" fill="${o.hair}"/>`;
  const mouth = { smile: 'M44 48 Q50 53 56 48', sad: 'M45 52 Q50 47 55 52', happy: 'M43 47 Q50 57 57 47 Z', flat: 'M45 50 L55 50' }[mood];
  const eyes = mood === 'sad'
    ? '<path d="M39 41 Q43 44 47 41 M53 41 Q57 44 61 41" fill="none" stroke="#2b1b2e" stroke-width="2" stroke-linecap="round"/>'
    : mood === 'happy'
      ? '<path d="M39 41 Q43 36 47 41 M53 41 Q57 36 61 41" fill="none" stroke="#2b1b2e" stroke-width="2" stroke-linecap="round"/>'
      : '<circle cx="43" cy="40" r="2.4" fill="#2b1b2e"/><circle cx="57" cy="40" r="2.4" fill="#2b1b2e"/>';
  const arms = p ? `<path class="arm-l" d="${p.l}" fill="none" stroke="${o.shirt}" stroke-width="10" stroke-linecap="round"/>
    <path class="arm-r" d="${p.r}" fill="none" stroke="${o.shirt}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="${p.hl[0]}" cy="${p.hl[1]}" r="5.2" fill="${o.skin}"/><circle cx="${p.hr[0]}" cy="${p.hr[1]}" r="5.2" fill="${o.skin}"/>` : '';
  return `<g>
    ${legs ? `<ellipse cx="50" cy="108" rx="38" ry="13" fill="${o.pants}"/>` : ''}
    <path d="M24 118 C24 76 36 62 50 62 C64 62 76 76 76 118 Z" fill="${o.shirt}"/>
    ${arms}
    <rect x="45" y="54" width="10" height="13" rx="4" fill="${o.skin}"/>
    <g class="nod"><g transform="rotate(${tilt} 50 56)">
      ${hairBack}<circle cx="50" cy="38" r="20" fill="${o.skin}"/>${hairFront}
      <circle cx="38" cy="46" r="3.4" fill="#ff8fab" opacity=".45"/><circle cx="62" cy="46" r="3.4" fill="#ff8fab" opacity=".45"/>
      ${eyes}<path d="${mouth}" fill="${mood === 'happy' ? '#b53a5a' : 'none'}" stroke="#2b1b2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g></g></g>`;
}
function personBack(o) {
  const hair = o.girl
    ? `<path d="M27 44 C26 18 74 18 73 44 L75 92 C66 98 60 88 60 72 L40 72 C40 88 34 98 25 92 Z" fill="${o.hair}"/>`
    : `<circle cx="50" cy="42" r="21" fill="${o.hair}"/>`;
  return `<g><path d="M24 120 C24 80 36 66 50 66 C64 66 76 80 76 120 Z" fill="${o.shirt}"/>
    <rect x="45" y="58" width="10" height="12" rx="4" fill="${o.skin}"/>
    ${hair}<ellipse cx="38" cy="34" rx="7" ry="4" fill="rgba(255,255,255,.12)"/></g>`;
}
const polaroidSvg = (x, y, w, rot, cls = '', hue = 330) => `<g class="${cls}"><g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-w * .6}" width="${w}" height="${w * 1.2}" fill="#fff" rx="2"/><rect x="${-w / 2 + 3}" y="${-w * .6 + 3}" width="${w - 6}" height="${w - 6}" fill="hsl(${hue},70%,70%)"/><path d="M0 ${-w * .1} c-${w * .3} -${w * .22} -${w * .2} -${w * .4} 0 -${w * .26} c${w * .2} -${w * .14} ${w * .3} ${w * .04} 0 ${w * .26}z" fill="rgba(255,255,255,.55)"/></g></g>`;

function sceneIntro() {
  const him = C.characters.him;
  return `<svg viewBox="0 0 320 250" role="img" aria-label="">
    <defs><radialGradient id="lampg" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="#ffb36b" stop-opacity=".5"/><stop offset="1" stop-color="#ffb36b" stop-opacity="0"/></radialGradient></defs>
    <circle class="lamp" cx="160" cy="150" r="125" fill="url(#lampg)"/>
    <ellipse cx="160" cy="226" rx="140" ry="13" fill="rgba(0,0,0,.35)"/>
    <g transform="translate(110 100)">${person(him, { pose: 'hold', legs: true, mood: 'sad', tilt: 9 })}</g>
    ${polaroidSvg(160, 190, 30, -8, '', 340)}
    ${polaroidSvg(52, 78, 36, -12, 'bob', 320)}
    ${polaroidSvg(262, 62, 38, 10, 'bob b2', 290)}
    ${polaroidSvg(236, 138, 28, 14, 'bob b3', 350)}
    ${polaroidSvg(82, 160, 26, -16, 'bob b3', 20)}
    ${polaroidSvg(66, 218, 24, 18, '', 300)}
  </svg>`;
}
function sceneWriter() {
  const her_ = C.characters.him;
  return `<svg viewBox="0 0 100 120"><rect x="2" y="100" width="96" height="20" rx="5" fill="#7b4a5a"/>
    ${person(her_, { pose: 'write', mood: 'smile', tilt: 6 })}
    <g transform="rotate(-8 60 98)"><rect x="46" y="94" width="30" height="9" fill="#fffaf0" rx="1"/></g>
    <g class="scribble"><line x1="58" y1="88" x2="62" y2="99" stroke="#ffd9a0" stroke-width="2.4" stroke-linecap="round"/></g></svg>`;
}
function sceneHeart() {
  return `<svg viewBox="0 0 100 120">${person(C.characters.him, { pose: 'heart', mood: 'smile', tilt: -4 })}
    <g class="hold-heart"><path d="M50 92 C34 80 32 66 41 62 C46 60 50 64 50 68 C50 64 54 60 59 62 C68 66 66 80 50 92Z" fill="#ff5d8f"/>
    <circle cx="50" cy="76" r="22" fill="#ff5d8f" opacity=".16"/></g></svg>`;
}
function sceneHug() {
  const him = C.characters.him, hr = C.characters.her;
  return `<svg viewBox="0 0 220 150">
    <g transform="translate(14 22) rotate(5 50 100)">${person(him, { pose: 'none', mood: 'happy', tilt: 9 })}</g>
    <g transform="translate(68 22) rotate(-5 50 100)">${person(hr, { pose: 'none', mood: 'happy', tilt: -9 })}</g>
    <path d="M86 92 Q112 118 140 112" fill="none" stroke="${him.shirt}" stroke-width="10" stroke-linecap="round"/>
    <path d="M100 96 Q74 120 48 114" fill="none" stroke="${hr.shirt}" stroke-width="10" stroke-linecap="round" opacity=".96"/>
    <g class="bob"><path d="M110 22 C98 12 96 2 102 -1 C106 -3 110 0 110 4 C110 0 114 -3 118 -1 C124 2 122 12 110 22Z" fill="#ff5d8f"/></g>
  </svg>`;
}
function sceneFinal() {
  const him = C.characters.him, hr = C.characters.her;
  const stars = [[80, 88, 2], [130, 96, 1.6], [190, 82, 2.2], [240, 100, 1.4], [312, 84, 1.8], [70, 140, 1.4], [100, 170, 1.2], [250, 156, 1.5], [320, 152, 1.4], [212, 130, 1.3], [150, 122, 1.2], [76, 112, 1.2]];
  return `<svg viewBox="62 70 262 180">
    <defs><radialGradient id="mg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6d8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
    <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d52"/><stop offset="1" stop-color="#150d33"/></linearGradient></defs>
    ${stars.map((s, i) => `<circle class="fs-star" cx="${s[0]}" cy="${s[1]}" r="${s[2]}" fill="#fff" style="animation-delay:${(i * .43).toFixed(2)}s"/>`).join('')}
    <g class="fs-shoot"><line x1="262" y1="92" x2="288" y2="76" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g>
    <g class="fs-moon" id="moon"><circle class="moon-glow" cx="266" cy="112" r="50" fill="url(#mg)"/><circle cx="266" cy="112" r="22" fill="#fff3cf"/><circle cx="259" cy="106" r="4" fill="#f1dcae"/><circle cx="273" cy="119" r="3" fill="#f1dcae"/><circle cx="272" cy="102" r="2" fill="#f1dcae"/></g>
    <path d="M-10 214 Q90 190 180 200 T380 196 L380 260 L-10 260Z" fill="url(#hill)"/>
    <g class="fs-him"><g transform="translate(105 118) scale(.7)">${personBack(him)}</g></g>
    <g class="fs-her"><g transform="translate(180 118) scale(.7)">${personBack(hr)}</g></g>
    <g class="fs-hold"><path d="M170 176 Q178 186 177 193" fill="none" stroke="${him.shirt}" stroke-width="6" stroke-linecap="round"/><path d="M185 176 Q179 186 180 193" fill="none" stroke="${hr.shirt}" stroke-width="6" stroke-linecap="round"/><circle cx="178.5" cy="194" r="4.2" fill="${him.skin}"/><circle cx="180.5" cy="194" r="3.6" fill="${hr.skin}"/></g>
    <g class="fs-heart"><path d="M179 176 C171 169 170 162 174 160 C177 159 179 161 179 164 C179 161 181 159 184 160 C188 162 187 169 179 176Z" fill="#ff5d8f"/></g>
  </svg>`;
}

/* ==========================================================================
   SMALL HELPERS: toast, wait
   ========================================================================== */
function smoothTo(y) { window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: reduce ? 'auto' : 'smooth' }); }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = sub(msg); t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
/* wait ms — optionally tap `el` to skip (after minTap ms) */
function wait(ms, el, minTap = 1100) {
  return new Promise(res => {
    const t0 = performance.now(); let done = false, timer;
    const fin = () => { if (done) return; done = true; clearTimeout(timer); el && el.removeEventListener('pointerdown', tapFin); res(); };
    const tapFin = () => { if (performance.now() - t0 > minTap) fin(); };
    timer = setTimeout(fin, ms);
    el && el.addEventListener('pointerdown', tapFin);
  });
}
/* show one line at a time in a text element; `holdEnd` keeps the last one visible */
async function playLines(el, lines, { tapEl, gap = 900, keepLast = true, onLine } = {}) {
  for (let i = 0; i < lines.length; i++) {
    const [text, hold, cls] = lines[i];
    el.classList.remove('on'); await sleep(i ? gap : 100);
    el.className = el.className.split(' ').filter(c => !['strong', 'huge', 'whisper', 'big', 'on'].includes(c)).join(' ') + (cls ? ' ' + cls : '');
    el.innerHTML = fmt(text); void el.offsetWidth; el.classList.add('on');
    if (onLine) onLine(i, text);
    const last = i === lines.length - 1;
    if (last && keepLast) return;
    await wait(hold, tapEl);
  }
}

/* ==========================================================================
   BUILD THE PAGE FROM CONFIG
   ========================================================================== */
const steps = [];       // scroll-scrubbed scenes
function buildSteps(el, list, { hint = false } = {}) {
  el.classList.add('steps'); el.style.setProperty('--n', list.length);
  el.innerHTML = `<div class="stage">${list.map((lines, i) =>
    `<div class="step" data-i="${i}">${lines.map((l, k) => `<p class="ln" style="--k:${k}">${fmt(l)}</p>`).join('')}</div>`).join('')}
    ${hint ? '<div class="hint">scroll<i></i></div>' : ''}</div>`;
  steps.push({ el, nodes: $$('.step', el), n: list.length, cur: -2, hint: $('.hint', el) });
}

/* intro */
$('#introScene').innerHTML = sceneIntro();
$('#keepGoing').textContent = C.intro.button;

/* memories */
buildSteps($('#memIntro'), C.memoriesIntro, { hint: true });
const DOODLES = [
  '<svg viewBox="0 0 40 40"><path d="M20 34 C6 24 4 14 11 10 C16 7 20 11 20 14 C20 11 24 7 29 10 C36 14 34 24 20 34Z" fill="none" stroke="#ffb3cd" stroke-width="2.4" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 40 40"><path d="M20 4 L24 16 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 16Z" fill="none" stroke="#ffe6a8" stroke-width="2.2" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 40 40"><path d="M6 30 C14 8 28 8 34 28 M26 24 L34 28 L36 18" fill="none" stroke="#ffb3cd" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 40 40"><path d="M20 6 L20 34 M6 20 L34 20 M10 10 L30 30 M30 10 L10 30" stroke="#ffe6a8" stroke-width="2" stroke-linecap="round"/></svg>'
];
$('#memList').innerHTML = C.memories.map((m, i) => {
  const rot = ((i % 2 ? 1 : -1) * rand(2, 5)).toFixed(1);
  const sp = (i % 2 ? -1 : 1) * 0.05;
  const d1 = DOODLES[i % 4], d2 = DOODLES[(i + 2) % 4];
  return `<div class="mem">
    <div class="doodle px" data-speed="${(-sp * 3).toFixed(2)}" style="top:${8 + (i * 13) % 20}%;${i % 2 ? 'left' : 'right'}:${6 + (i * 7) % 14}%;--s:${40 + (i % 3) * 14}px">${d1}</div>
    <div class="doodle px" data-speed="${(sp * 4).toFixed(2)}" style="bottom:${6 + (i * 9) % 18}%;${i % 2 ? 'right' : 'left'}:${5 + (i * 11) % 16}%;--s:${34 + (i % 2) * 14}px">${d2}</div>
    <div class="pol-wrap px" data-speed="${sp.toFixed(2)}">
      <button class="pol" type="button" data-mem="${i}" style="--rot:${rot}deg" aria-label="Open photo: ${esc(m.caption)}">
        <span class="ph-box">${photoImg(m.photo - 1, '')}</span>
        <span class="cap">${fmt(m.caption)}</span>
        ${i === 0 ? '<span class="tap-tag">tap me 🤍</span>' : ''}
      </button>
    </div></div>`;
}).join('');
$('#memEnd').innerHTML = fmt(C.memoriesEnd);
if (C.dates && C.dates.together) {
  const d = new Date(C.dates.together + 'T00:00:00');
  if (!isNaN(d)) {
    const days = Math.max(0, Math.floor((Date.now() - d) / 864e5));
    $('#memDays').innerHTML = `since ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · <b>${days.toLocaleString()}</b> days of us`;
  }
}

/* apology + want */
buildSteps($('#apology'), C.apology, { hint: true });
buildSteps($('#want'), C.want);

/* letter */
$('#writer').innerHTML = sceneWriter();
$('#letterLead').innerHTML = fmt(C.letter.lead);
$('#envHint').textContent = C.letter.hint;
(function buildLetter() {
  const L = C.letter, P = C.personalMessages;
  const paras = [];
  const add = (txt, cls = '') => String(txt).split(/\n\s*\n/).forEach(t => t.trim() && paras.push(`<p class="${cls}">${words(t.trim())}</p>`));
  add(L.greeting, 'greet');
  add(P.message1);
  L.apology.forEach(t => add(t));
  add(P.message2);
  paras.push(`<div class="paper-photo"><div class="ph-box">${photoImg(6, '')}</div></div>`);
  add(P.message3);
  add(P.message4);
  add(L.closing, 'closing');
  add(L.signoff, 'sign');
  add(`${L.psLabel} ${P.onlyShe}`, 'ps');
  $('#paper').innerHTML = paras.join('');
})();

/* love */
$('#chrHeart').innerHTML = sceneHeart();
$('#lovePre').innerHTML = fmt(C.love.pre);
$('#loveBig').innerHTML = `${esc(sub(C.love.big))}<span class="heart" id="hiddenHeart" role="button" aria-label="a little surprise">❤️</span>`;
$('#loveHint').textContent = C.love.hint;
$('#loveCards').innerHTML = C.love.cards.map((c, i) =>
  `<button class="lcard rv" type="button" style="--d:${(i % 2) * .12 + Math.floor(i / 2) * .1}s" aria-expanded="false"><span class="lc-emoji">${c.emoji}</span><span class="lc-title">${fmt(c.title)}</span><span class="lc-more"><span>${fmt(c.text)}</span></span></button>`).join('');

/* question */
$('#qSo').textContent = C.question.so;
$('#qMain').textContent = C.question.main;
$('#yesBtn').textContent = C.question.yes;
$('#noBtn').textContent = C.question.no;
$('#notNow').textContent = C.question.notNow;

/* chapter two */
$('#c2h').textContent = C.chapter2.title;
$('#c2sub').textContent = C.chapter2.sub;
$('#c2photos').innerHTML = [[7, '2%', '8%', '-8deg', '.1s'], [0, '33%', '0%', '3deg', '.5s'], [3, '62%', '10%', '9deg', '.9s']].map(([p, x, y, r, dl]) =>
  `<div class="c2-pol" style="--x:${x};--y:${y};--r:${r};--dl:${dl}"><span><div>${photoImg(p, '')}</div></span></div>`).join('');
buildSteps($('#c2story'), C.chapter2.story, { hint: false });
$('#prTitle').textContent = C.chapter2.promisesTitle;
$('#prSub').textContent = C.chapter2.promisesSub;
$('#prHint').textContent = C.chapter2.promisesHint;
$('#prNote').innerHTML = fmt(C.chapter2.promisesNote);
$('#pCards').innerHTML = C.chapter2.promises.map((p, i) =>
  `<button class="pcard rv" type="button" style="--d:${(i % 2) * .12 + Math.floor(i / 2) * .1}s" aria-label="${esc(p.title)} — tap to flip"><span class="pc-in"><span class="pc-f"><span class="pc-e">${p.emoji}</span><span class="pc-t">${fmt(p.title)}</span></span><span class="pc-b">${fmt(p.text)}</span></span></button>`).join('');
$('#fuTitle').textContent = C.chapter2.futureTitle;
$('#fuFrames').innerHTML = C.chapter2.futureFrames.map((t, i) =>
  `<div class="fpol" style="--r:${[-5, 2, 6][i % 3]}deg"><div class="fbox"><b>${['🤍', '✨', '❤️'][i % 3]}</b></div><div class="fc">${esc(t)}</div></div>`).join('');
$('#fuWords').innerHTML = C.chapter2.futureWords.map(w => `<span>${esc(w)}</span>`).join('');
$('#finalScene').innerHTML = sceneFinal();
$('#replay').textContent = C.final.replay;
$('#noBack').textContent = C.noEnding.back;
$('#noRestart').textContent = C.noEnding.restart;

hydratePhotos();

/* ==========================================================================
   LOADING SCREEN  ->  INTRO
   ========================================================================== */
(async function boot() {
  BG.init(); FX.init();
  const quick = location.hash === '#skip';  // handy while editing: yoursite.com/#skip jumps past the intro
  const skip = quick || sessionStorage.getItem('skipLoader') === '1';
  sessionStorage.removeItem('skipLoader');
  /* warm the photo cache while the loader plays */
  (C.photos || []).forEach((p, i) => { const im = new Image(); loadPhoto(im, i); });
  const loader = $('#loader');
  if (skip) { loader.classList.add('out'); loader.style.display = 'none'; }
  else {
    const l1 = $('#loadLine1'), l2 = $('#loadLine2');
    l1.textContent = C.loader.line1; l2.textContent = C.loader.line2;
    await sleep(2300); l1.classList.add('on');
    await sleep(2400); l2.classList.add('on');
    await sleep(2100); loader.classList.add('out');
    await sleep(900);
  }
  runIntro();
})();

async function runIntro() {
  const intro = $('#intro'), line = $('#introLine'), btn = $('#keepGoing');
  intro.classList.add('ready');
  if (location.hash === '#skip') { line.innerHTML = fmt(C.intro.final); line.classList.add('whisper', 'on'); }
  else {
  await sleep(1600);
  await playLines(line, [...C.intro.lines, [C.intro.final, 0, 'whisper']], {
    tapEl: intro,
    onLine: (i, t) => { if (/hurt you|betrayed|cheated/i.test(t)) intro.classList.add('dim'); }
  });
  await sleep(1400);
  }
  btn.hidden = false;
  btn.addEventListener('click', e => {
    Sound.init(); Music.start(); Sound.chime();
    const r = btn.getBoundingClientRect(); FX.hearts(r.left + r.width / 2, r.top, 10); FX.sparkles(r.left + r.width / 2, r.top + r.height / 2, 14);
    Lock.del('boot');
    setTimeout(() => smoothTo($('#memIntro').getBoundingClientRect().top + scrollY), 250);
  }, { once: true });
}

/* ==========================================================================
   SCROLL ENGINE: steps, parallax, progress, letter writing
   ========================================================================== */
const progress = $('#progress i');
const px = $$('.px');
const pendingParas = $$('#paper > p, #paper > .paper-photo');
let letterOpen = false;
let ticking = false;
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
function update() {
  ticking = false;
  const vh = innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  progress.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;

  for (const s of steps) {
    const r = s.el.getBoundingClientRect();
    if (!r.height) continue;
    if (r.bottom < -vh * 1.2 || r.top > vh * 1.6) continue;
    let idx;
    if (r.top > vh * .38) idx = -1;
    else idx = Math.min(s.n - 1, Math.floor(clamp(-r.top / Math.max(1, r.height - vh), 0, 1) * s.n));
    if (idx !== s.cur) {
      s.nodes.forEach((n, i) => { n.classList.toggle('on', i === idx); n.classList.toggle('past', i < idx); });
      s.cur = idx; if (s.hint) s.hint.classList.toggle('gone', idx > 0);
    }
  }
  if (!reduce) for (const el of px) {
    const pr = el.parentElement.getBoundingClientRect();
    if (!pr.height || pr.bottom < -300 || pr.top > vh + 300) continue;
    const d = pr.top + pr.height / 2 - vh / 2;
    el.style.transform = `translate3d(0,${(-d * parseFloat(el.dataset.speed || 0)).toFixed(1)}px,0)`;
  }
  if (letterOpen) {
    for (let i = pendingParas.length - 1; i >= 0; i--) {
      const p = pendingParas[i]; const r = p.getBoundingClientRect();
      if (r.top < vh * .92) { p.classList.add('go'); pendingParas.splice(i, 1); }
    }
  }
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { BG.resize(); FX.resize(); onScroll(); });
update();

/* ---------- reveal on view + mood/music per scene ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .2 });
$$('.rv, .pol, .c2-pol').forEach(el => io.observe(el));

const moodIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  body.dataset.mood = e.target.dataset.mood;
  if (e.target.dataset.vol) Music.setScene(parseFloat(e.target.dataset.vol));
}), { rootMargin: '-48% 0px -48% 0px' });
$$('[data-mood]').forEach(el => { if (el !== body) moodIO.observe(el); });

/* ==========================================================================
   LIGHTBOX
   ========================================================================== */
const lb = $('#lightbox'), lbCard = $('#lbCard'), lbImg = $('#lbImg'), lbMsg = $('#lbMsg');
let lbSrc = null, lbOpen = false;
function openLB(i, srcEl) {
  const m = C.memories[i]; lbSrc = srcEl; lbOpen = true;
  loadPhoto(lbImg, m.photo - 1); lbMsg.innerHTML = fmt(m.message);
  lb.hidden = false; lb.classList.remove('on'); Lock.add('lb');
  lbCard.style.transition = 'none'; lbCard.style.transform = 'none'; lbCard.style.opacity = '1';
  const to = lbCard.getBoundingClientRect(), from = srcEl.getBoundingClientRect();
  const s = from.width / to.width;
  lbCard.style.transform = `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px,${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${s})`;
  lbCard.style.opacity = '.3'; void lbCard.offsetWidth;
  lbCard.style.transition = ''; lbCard.style.transform = ''; lbCard.style.opacity = '';
  lb.classList.add('on'); Sound.tap();
  setTimeout(() => { const r = lbCard.getBoundingClientRect(); FX.hearts(r.left + r.width / 2, r.top + r.height * .55, 14); FX.sparkles(r.left + r.width / 2, r.top + r.height / 2, 16); }, 420);
}
function closeLB() {
  if (!lbOpen) return; lbOpen = false;
  lb.classList.remove('on');
  const to = lbCard.getBoundingClientRect();
  if (lbSrc) {
    const from = lbSrc.getBoundingClientRect();
    if (from.bottom > 0 && from.top < innerHeight) {
      lbCard.style.transform = `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px,${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${from.width / to.width})`;
    } else lbCard.style.transform = 'scale(.85)';
  }
  lbCard.style.opacity = '0';
  setTimeout(() => { lb.hidden = true; Lock.del('lb'); lbCard.style.transform = ''; lbCard.style.opacity = ''; }, 650);
}
$('#memList').addEventListener('click', e => { const b = e.target.closest('.pol'); if (b) openLB(+b.dataset.mem, b); });
$('#lbBack').addEventListener('click', closeLB);
$('#lbClose').addEventListener('click', closeLB);
lbCard.addEventListener('click', closeLB);
addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

/* ==========================================================================
   LETTER
   ========================================================================== */
$('#envelope').addEventListener('click', () => {
  if (letterOpen) return; letterOpen = true;
  const env = $('#envelope');
  Sound.open(); env.classList.add('open'); $('#envHint').style.opacity = 0;
  const r = env.getBoundingClientRect(); FX.sparkles(r.left + r.width / 2, r.top + r.height / 2, 18);
  setTimeout(() => { $('#envWrap').classList.add('away'); $('#paperWrap').classList.add('show'); FX.hearts(innerWidth / 2, innerHeight * .6, 8); }, 1900);
  let n = 0; const iv = setInterval(() => { update(); if (++n > 30) clearInterval(iv); }, 120);
});
$('#paper').addEventListener('click', () => {
  $('#paper').classList.add('all'); pendingParas.splice(0).forEach(p => p.classList.add('go'));
});

/* ==========================================================================
   LOVE cards + hidden heart
   ========================================================================== */
$('#loveCards').addEventListener('click', e => {
  const c = e.target.closest('.lcard'); if (!c) return;
  const open = !c.classList.contains('open');
  $$('.lcard.open').forEach(o => { o.classList.remove('open'); o.setAttribute('aria-expanded', 'false'); });
  if (open) {
    c.classList.add('open'); c.setAttribute('aria-expanded', 'true'); Sound.tap();
    const r = c.getBoundingClientRect(); FX.hearts(e.clientX || r.left + r.width / 2, e.clientY || r.top, 7, { size: .8 });
    setTimeout(() => { const r = c.getBoundingClientRect(); smoothTo(scrollY + r.top + r.height / 2 - innerHeight / 2); }, 380);
  }
});
$('#hiddenHeart').addEventListener('click', e => { Sound.chime(); FX.hearts(e.clientX, e.clientY, 18); toast(C.love.toast); });

/* ==========================================================================
   THE QUESTION
   ========================================================================== */
const qEl = $('#question'), yes = $('#yesBtn'), no = $('#noBtn'), qMsg = $('#qMsg');
const qIO = new IntersectionObserver(async es => {
  if (!es[0].isIntersecting) return; qIO.disconnect();
  qEl.classList.add('go1'); await sleep(3300); qEl.classList.add('go2');
}, { threshold: .55 });
qIO.observe(qEl);

let noCount = 0;
no.addEventListener('click', e => {
  const msgs = C.question.noMessages; noCount++;
  Sound.pop();
  const r = no.getBoundingClientRect(); FX.hearts(r.left + r.width / 2, r.top, 7);
  qMsg.textContent = msgs[Math.min(noCount, msgs.length) - 1];
  qMsg.classList.remove('pop'); void qMsg.offsetWidth; qMsg.classList.add('pop');
  no.classList.remove('shake'); void no.offsetWidth; no.classList.add('shake');
  yes.classList.remove('bump'); void yes.offsetWidth; yes.classList.add('bump');
  if (noCount >= msgs.length) {
    no.classList.add('gone'); yes.style.fontSize = ''; yes.classList.add('huge');
    FX.sparkles(innerWidth / 2, yes.getBoundingClientRect().top, 20);
  } else {
    no.style.fontSize = Math.max(.9 * Math.pow(.74, noCount), .1) + 'rem';
    yes.style.fontSize = (1.05 + noCount * .085) + 'rem';
  }
});
yes.addEventListener('click', () => celebrate());
$('#notNow').addEventListener('click', () => showNoEnding());

/* ==========================================================================
   YES -> celebration -> chapter two
   ========================================================================== */
async function celebrate() {
  const ov = $('#celebrate'); if (!ov.hidden) return;
  Sound.init(); Sound.enabled = Music.on; Sound.chime(); Music.setScene(.95);
  Lock.add('cel');
  const photos = $('#celPhotos'), hug = $('#celHug'), line = $('#celLine');
  const spots = [[4, 8], [70, 5], [80, 36], [2, 42], [74, 66], [8, 70], [38, 3], [42, 84]];
  photos.innerHTML = spots.map(([x, y], i) => `<div class="cel-pol" style="--x:${x};--y:${y};--r:${rand(-14, 14).toFixed(0)}deg;--dl:${(i * .25).toFixed(2)}s"><span><div>${photoImg(i, '')}</div></span></div>`).join('');
  hydratePhotos(photos);
  hug.innerHTML = sceneHug();
  ov.hidden = false; void ov.offsetWidth; ov.classList.add('on');
  $('#flash').classList.add('go');
  const W = innerWidth, H = innerHeight;
  FX.hearts(W / 2, H / 2, 40, { spread: 3, up: 1.3, size: 1.4 }); FX.confetti(140);
  for (let i = 0; i < 9; i++) setTimeout(() => FX.firework(rand(W * .12, W * .88), rand(H * .1, H * .5)), 300 + i * 420);
  setTimeout(() => FX.confetti(110), 1300); setTimeout(() => FX.confetti(90, W * .1), 1800); setTimeout(() => FX.confetti(90, W * .9), 1800);
  setTimeout(() => hug.classList.add('show'), 1200);
  setTimeout(() => FX.hearts(W / 2, H * .45, 16, { up: .8 }), 2400);
  await sleep(3200);
  await playLines(line, C.celebration.lines, { tapEl: ov, keepLast: false, gap: 700 });
  line.classList.remove('on'); await sleep(900);
  ov.classList.add('out'); await sleep(1500);
  enterChapterTwo();
  ov.hidden = true; ov.classList.remove('on', 'out'); hug.classList.remove('show'); Lock.del('cel');
}
function enterChapterTwo() {
  $('#chapter1').hidden = true; $('#chapter2').hidden = false;
  body.dataset.mood = 'warm'; body.classList.add('ch2');
  Music.setScene(.8);
  window.scrollTo(0, 0);
  $$('.c2-pol').forEach(el => setTimeout(() => el.classList.add('in'), 400));
  update(); setTimeout(update, 200);
}

/* ---------- chapter two: promises, future, final ---------- */
$('#pCards').addEventListener('click', e => {
  const c = e.target.closest('.pcard'); if (!c) return;
  c.classList.toggle('flip'); Sound.tap();
  const r = c.getBoundingClientRect(); FX.sparkles(r.left + r.width / 2, r.top + r.height / 2, 10, '#ffb36b');
});

const futureIO = new IntersectionObserver(async es => {
  if (!es[0].isIntersecting) return; futureIO.disconnect();
  const frames = $$('#fuFrames .fpol'), ws = $$('#fuWords span');
  await sleep(500);
  for (const f of frames) { f.classList.add('lit'); Sound.pop(); const r = f.getBoundingClientRect(); FX.sparkles(r.left + r.width / 2, r.top + r.height / 2, 14, '#ff9bbb'); await sleep(900); }
  await sleep(300);
  for (let i = 0; i < ws.length; i++) { ws[i].classList.add('on'); await sleep(i === ws.length - 2 ? 1100 : 750); }
  FX.hearts(innerWidth / 2, innerHeight * .8, 18);
}, { threshold: .45 });
futureIO.observe($('#future'));

const finalEl = $('#final');
const finalIO = new IntersectionObserver(async es => {
  if (!es[0].isIntersecting) return; finalIO.disconnect();
  $('#finalScene').classList.add('go');
  const line = $('#finalLine'), L = C.final.lines;
  await sleep(1800);
  await playLines(line, L.map((l, i) => [l[0], l[1], i >= L.length - 2 ? 'big' : '']), { tapEl: finalEl, gap: 900 });
  FX.hearts(innerWidth / 2, innerHeight * .3, 14);
  await sleep(1200); $('#replay').hidden = false;
}, { threshold: .6 });
finalIO.observe(finalEl);
$('#moon').addEventListener('click', e => { Sound.chime(); FX.sparkles(e.clientX, e.clientY, 22, '#fff3cf'); toast(C.final.toast); });
$('#replay').addEventListener('click', () => {
  sessionStorage.setItem('skipLoader', '1');
  Music.setScene(0.05);
  setTimeout(() => location.reload(), 400);
});

/* ==========================================================================
   NO ending (respectful)
   ========================================================================== */
async function showNoEnding() {
  const ov = $('#noEnd'), line = $('#noLine'), act = $('#noActions');
  if (!ov.hidden) return;
  Sound.soft(); Music.setScene(.12); Lock.add('no');
  act.hidden = true; ov.hidden = false; void ov.offsetWidth; ov.classList.add('on');
  await sleep(1400);
  await playLines(line, C.noEnding.lines, { tapEl: ov, gap: 1100 });
  await sleep(1800); act.hidden = false;
}
$('#noBack').addEventListener('click', async () => {
  const ov = $('#noEnd'); ov.classList.remove('on'); await sleep(1400);
  ov.hidden = true; $('#noLine').classList.remove('on'); Lock.del('no'); Music.setScene(.35);
});
$('#noRestart').addEventListener('click', () => { sessionStorage.setItem('skipLoader', '1'); location.reload(); });

/* ==========================================================================
   Little extras: cursor hearts (desktop), tap sparkles
   ========================================================================== */
let lastHeart = 0;
addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || reduce || locks.has('boot')) return;
  const t = performance.now(); if (t - lastHeart < 70) return; lastHeart = t; FX.tiny(e.clientX, e.clientY);
});
addEventListener('pointerdown', e => {
  if (reduce) return;
  if (e.target.closest('button, a')) return;
  FX.sparkles(e.clientX, e.clientY, 4);
});
})();
