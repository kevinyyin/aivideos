// Painted textures for the 1690s London toon sets (dh013): cobbles, timber-frame facades, leaded windows, stone,
// brick, roof tiles, a hazy spire skyline, skies. Flat colour + broad drift like engine/toon/paint.js.
import { ctex, jit, tone, blotch } from '@engine/toon/paint.js';

const drift = (g, r, w, h, n, size, a = 0.08) => { for (let i = 0; i < n; i++) blotch(g, r() * w, r() * h, size * (0.6 + r()), r() < 0.5 ? '255,248,235' : '40,30,60', a * (0.5 + r())); };

export const cobbles = (base = '#8d8172', repeat = [8, 3]) => ctex('cobbles' + base, 512, 512, (g, r, w, h) => {
  g.fillStyle = tone(base, 0.55); g.fillRect(0, 0, w, h);
  const rows = 8, rh = h / rows;
  for (let j = 0; j < rows; j++) for (let x = (j % 2) * -32; x < w + 64; x += 64) {
    g.fillStyle = jit(r, base, 0.1, 4, 0.15); g.beginPath();
    g.ellipse(x + 32 + (r() - 0.5) * 8, j * rh + rh / 2, 27 + r() * 3, rh / 2 - 5, (r() - 0.5) * 0.2, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,245,225,0.18)'; g.beginPath(); g.ellipse(x + 26, j * rh + rh / 2 - 8, 14, 6, 0, 0, 7); g.fill();
  }
  drift(g, r, w, h, 20, 120, 0.1);
}, repeat);

/** one storey of a timber-framed facade: cream plaster, dark posts + rails + braces, leaded windows */
export const timber = (key, { plaster = '#efe2c4', beam = '#4a3426', windows = 2, door = false, shop = false } = {}) => ctex('timber' + key, 512, 384, (g, r, w, h) => {
  g.fillStyle = plaster; g.fillRect(0, 0, w, h); drift(g, r, w, h, 14, 120, 0.07);
  g.fillStyle = beam;
  g.fillRect(0, 0, w, 22); g.fillRect(0, h - 22, w, 22);
  for (const x of [0, w / 4, w / 2, (3 * w) / 4, w - 20]) g.fillRect(x, 0, 20, h);
  g.strokeStyle = beam; g.lineWidth = 16;
  for (const x of [w / 4, (3 * w) / 4]) { g.beginPath(); g.moveTo(x - 60, h - 22); g.lineTo(x, h * 0.45); g.lineTo(x + 60, h - 22); g.stroke(); }
  const win = (x0, y0, ww, hh) => {
    g.fillStyle = '#3f4f5f'; g.fillRect(x0, y0, ww, hh);
    g.strokeStyle = '#a9b8c2'; g.lineWidth = 2;
    for (let d = -hh; d < ww + hh; d += 22) { g.beginPath(); g.moveTo(x0 + d, y0); g.lineTo(x0 + d + hh, y0 + hh); g.moveTo(x0 + d + hh, y0); g.lineTo(x0 + d, y0 + hh); g.stroke(); }
    g.fillStyle = 'rgba(255,240,200,0.22)'; g.fillRect(x0 + ww * 0.1, y0 + 6, ww * 0.25, hh - 12);
    g.strokeStyle = beam; g.lineWidth = 12; g.strokeRect(x0, y0, ww, hh);
    g.beginPath(); g.moveTo(x0 + ww / 2, y0); g.lineTo(x0 + ww / 2, y0 + hh); g.stroke();
  };
  if (shop) { g.fillStyle = '#2c2420'; g.fillRect(w * 0.12, h * 0.22, w * 0.76, h * 0.78); g.fillStyle = '#4a3a30'; g.fillRect(w * 0.14, h * 0.24, w * 0.72, h * 0.3); }
  else if (door) { g.fillStyle = '#5a3a26'; g.fillRect(w * 0.4, h * 0.25, w * 0.2, h * 0.75); g.strokeStyle = beam; g.lineWidth = 10; g.strokeRect(w * 0.4, h * 0.25, w * 0.2, h * 0.75); win(w * 0.08, h * 0.3, w * 0.24, h * 0.36); win(w * 0.68, h * 0.3, w * 0.24, h * 0.36); }
  else for (let i = 0; i < windows; i++) win(w * (0.08 + i * (0.84 / windows)) + 8, h * 0.24, w * (0.84 / windows) - 30, h * 0.46);
});

export const stone = (base = '#a9a59c', repeat = [3, 2]) => ctex('stone' + base, 512, 512, (g, r, w, h) => {
  g.fillStyle = tone(base, 0.7); g.fillRect(0, 0, w, h);
  const rows = 6, rh = h / rows;
  for (let j = 0; j < rows; j++) for (let x = (j % 2) * -64; x < w; x += 128) { g.fillStyle = jit(r, base, 0.07, 3, 0.12); g.fillRect(x + 4, j * rh + 4, 120, rh - 8); }
  drift(g, r, w, h, 20, 140, 0.08);
}, repeat);

export const brick = (base = '#9a5a44', repeat = [2, 2]) => ctex('brick' + base, 512, 512, (g, r, w, h) => {
  g.fillStyle = '#cdbca4'; g.fillRect(0, 0, w, h);
  const rows = 16, rh = h / rows;
  for (let j = 0; j < rows; j++) for (let x = (j % 2) * -32; x < w; x += 64) { g.fillStyle = jit(r, base, 0.1, 4, 0.12); g.fillRect(x + 3, j * rh + 3, 58, rh - 6); }
  drift(g, r, w, h, 16, 120, 0.08);
}, repeat);

export const tiles = (base = '#8a4f3a', repeat = [3, 3]) => ctex('tiles' + base, 256, 256, (g, r, w, h) => {
  g.fillStyle = tone(base, 0.7); g.fillRect(0, 0, w, h);
  for (let j = 0; j < 8; j++) for (let x = (j % 2) * -16; x < w; x += 32) { g.fillStyle = jit(r, base, 0.1, 4, 0.1); g.beginPath(); g.roundRect(x + 2, j * 32 + 2, 28, 30, [0, 0, 10, 10]); g.fill(); }
}, repeat);

export const plank = (base = '#7a5236', repeat = [1, 1]) => ctex('plank' + base, 256, 256, (g, r, w, h) => {
  for (let i = 0; i < 4; i++) { g.fillStyle = jit(r, base, 0.08, 3, 0.1); g.fillRect(0, i * 64, w, 64); g.fillStyle = tone(base, 0.5); g.fillRect(0, i * 64, w, 3); }
  drift(g, r, w, h, 10, 80, 0.08);
}, repeat);

/** a hazy London skyline of spires and roofs for the end of the street (self-lit backdrop) */
// the sky part is left transparent (cut out with alphaTest) so a makeSky dome shows above the roofs (toon look v3)
export const skyline = () => ctex('skyline1690', 1024, 512, (g, r, w, h) => {
  for (const [col, y0, amp] of [['#b9c3cc', 0.62, 0.16], ['#9ea6ad', 0.72, 0.1]]) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 24) { const t = r(); g.lineTo(x, h * (y0 - t * amp)); g.lineTo(x + 12, h * (y0 - t * amp - 0.03)); }
    g.lineTo(w, h); g.fill();
    for (let i = 0; i < 6; i++) { const x = r() * w, top = h * (y0 - 0.3 - r() * 0.15); g.beginPath(); g.moveTo(x - 12, h * y0); g.lineTo(x, top); g.lineTo(x + 12, h * y0); g.fill(); g.fillRect(x - 16, h * (y0 - 0.12), 32, h * 0.12); }
  }
  g.fillStyle = '#aab3bb'; g.beginPath(); g.arc(w * 0.62, h * 0.48, 60, Math.PI, 0); g.fill(); g.fillRect(w * 0.62 - 70, h * 0.48, 140, 60);
  g.fillRect(w * 0.62 - 6, h * 0.48 - 100, 12, 44);
});

export const nightSky = () => ctex('night1690', 64, 512, (g, r, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1b2140'); gr.addColorStop(1, '#3a3f66'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
export const daySky = () => ctex('day1690', 64, 512, (g, r, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fb1de'); gr.addColorStop(0.65, '#bcd6ea'); gr.addColorStop(1, '#efe2cc'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
