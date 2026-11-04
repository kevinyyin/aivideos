// Hand-painted look textures on canvases (cached, deterministic), for the toon look. Ideas from
// templates/bridge/paint.ts of github.com/mromidev/claude-animated-shorts (MIT): flat colour fields with a gentle
// broad drift (no photo grain), thin painted lines at ~0.4x the local colour, per-plank / per-tile jitter.
import * as THREE from 'three';
import { rng } from '@engine/core.js';

const cache = new Map();
/** cached CanvasTexture: draw(g, r, w, h) with a seeded random r() */
export function ctex(key, w, h, draw, repeat = [1, 1]) {
  const k = `${key}|${w}x${h}|${repeat}`;
  if (cache.has(k)) return cache.get(k);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  let s = 7; for (const ch of key) s = (s * 31 + ch.charCodeAt(0)) % 100003;
  draw(cv.getContext('2d'), rng(s), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat);
  cache.set(k, t); return t;
}
const _c = new THREE.Color(), _h = {};
/** colour jitter in HSL: lightness x(1 +- dv), hue +- dh deg, saturation x(1 +- ds) */
export function jit(r, hex, dv = 0.06, dh = 3, ds = 0.1) {
  _c.set(hex).getHSL(_h);
  const k = (a) => 1 + (r() * 2 - 1) * a;
  _c.setHSL((_h.h + ((r() * 2 - 1) * dh) / 360 + 1) % 1, Math.min(1, _h.s * k(ds)), Math.min(0.97, _h.l * k(dv)));
  return '#' + _c.getHexString();
}
/** darker / lighter version of a hex colour (k < 1 darker) */
export const tone = (hex, k) => '#' + _c.set(hex).multiplyScalar(k).getHexString();
/** soft radial blotch (broad paint drift) */
export function blotch(g, x, y, rad, rgb, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
}
function drift(g, r, w, h, n, size, light = '255,248,235', dark = '40,30,60', a = 0.08) {
  for (let i = 0; i < n; i++) blotch(g, r() * w, r() * h, size * (0.6 + r()), r() < 0.5 ? light : dark, a * (0.5 + r()));
}

/** flat plaster wall with a broad painterly drift */
export const plaster = (base, repeat = [1, 1]) => ctex('plaster' + base, 512, 512, (g, r, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); drift(g, r, w, h, 26, 140);
}, repeat);

/** wood: boards along x with grain streaks, knots and thin dark seams; boards = boards per tile */
export const wood = (base, { boards = 4, seam = true, repeat = [1, 1] } = {}) => ctex(`wood${base}${boards}${seam}`, 1024, 1024, (g, r, w, h) => {
  const B = h / boards;
  for (let i = 0; i < boards; i++) {
    const y = i * B, col = jit(r, base, 0.05, 2, 0.06);
    g.save(); g.beginPath(); g.rect(0, y, w, B); g.clip();
    g.fillStyle = col; g.fillRect(0, y, w, B);
    for (let k = 0; k < 5; k++) blotch(g, r() * w, y + B / 2, 120 + r() * 160, r() < 0.5 ? '255,236,200' : '110,60,25', 0.1);
    for (let k = 0; k < 16; k++) {   // grain: long thin streaks, never as dark as a seam
      const x0 = r() * w, yy = y + 8 + r() * (B - 16), len = 300 + r() * 700, amp = 2 + r() * 6;
      g.strokeStyle = r() < 0.25 ? 'rgba(255,232,195,0.22)' : 'rgba(95,48,18,0.28)'; g.lineWidth = 1.5 + r() * 2.5;
      g.beginPath();
      for (let s = 0; s <= 24; s++) { const xx = x0 + (len * s) / 24; const v = yy + Math.sin(s * 0.7 + i) * amp; s ? g.lineTo(xx % w, v) : g.moveTo(xx % w, v); }
      g.stroke();
    }
    if (r() < 0.4) { const kx = 80 + r() * (w - 160), ky = y + 20 + r() * (B - 40); g.fillStyle = 'rgba(110,60,25,0.35)'; g.beginPath(); g.ellipse(kx, ky, 18, 8, 0, 0, 7); g.fill(); }
    g.restore();
  }
  if (seam) for (let i = 0; i <= boards; i++) { g.fillStyle = tone(base, 0.4); g.globalAlpha = 0.85; g.fillRect(0, i * B - 2, w, 4); g.globalAlpha = 1; }
}, repeat);

/** terrazzo floor: cream with coloured chips */
export const terrazzo = (base = '#efe6d6', repeat = [1, 1]) => ctex('terrazzo' + base, 1024, 1024, (g, r, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); drift(g, r, w, h, 20, 160, '255,250,240', '120,100,90', 0.07);
  const chips = ['#d9785f', '#5f9fb3', '#e2b24e', '#8a6f9e', '#6aa36b', '#b9a28e'];
  for (let i = 0; i < 900; i++) {
    const x = r() * w, y = r() * h, s = 2 + r() * 6;
    g.fillStyle = chips[Math.floor(r() * chips.length)]; g.beginPath(); g.ellipse(x, y, s, s * (0.5 + r() * 0.5), r() * 3, 0, 7); g.fill();
  }
}, repeat);

/** felt / cloth: flat colour, faint broad mottling */
export const felt = (base, repeat = [1, 1]) => ctex('felt' + base, 512, 512, (g, r, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); drift(g, r, w, h, 40, 90, '255,255,240', '0,20,30', 0.07);
}, repeat);

/** vertical gradient (painted sky / metal band) top -> bottom colour stops */
export const vgrad = (key, stops, w = 64, h = 512) => ctex('vgrad' + key, w, h, (g, _r, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H);
  stops.forEach(([p, c]) => gr.addColorStop(p, c));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
});

/** fit text into maxW at a max size (canvas text is clipped silently otherwise) */
export function fitText(g, text, x, y, maxW, size, font = 'bold', family = 'Georgia, serif') {
  let s = size; g.font = `${font} ${s}px ${family}`;
  while (g.measureText(text).width > maxW && s > 6) { s -= 1; g.font = `${font} ${s}px ${family}`; }
  g.fillText(text, x, y); return s;
}
