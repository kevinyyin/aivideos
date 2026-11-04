// Painted textures for the 1925 toon sets (dh015): Paris gravel + lawn, Haussmann facades, damask wallpaper, parquet,
// riveted rusty girders, scrap heaps, and the self-lit painted backdrops seen through windows (Place de la Concorde,
// a moonlit valley, a Manhattan skyline, San Francisco Bay). Flat colour + broad drift like engine/toon/paint.js.
import { ctex, jit, tone, blotch } from '@engine/toon/paint.js';

const drift = (g, r, w, h, n, size, a = 0.08) => { for (let i = 0; i < n; i++) blotch(g, r() * w, r() * h, size * (0.6 + r()), r() < 0.5 ? '255,248,235' : '40,30,60', a * (0.5 + r())); };

export const gravel = (base = '#d8c6a2', repeat = [20, 20]) => ctex('gravel' + base, 512, 512, (g, r, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); drift(g, r, w, h, 24, 120, 0.1);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(110,90,60,0.22)' : 'rgba(255,250,236,0.3)'; g.beginPath(); g.arc(r() * w, r() * h, 1.5 + r() * 2.5, 0, 7); g.fill(); }
}, repeat);

export const lawn = (base = '#7fae52', repeat = [4, 16]) => ctex('lawn' + base, 512, 512, (g, r, w, h) => {
  for (let y = 0; y < h; y += 64) { g.fillStyle = (y / 64) % 2 ? base : tone(base, 1.08); g.fillRect(0, y, w, 64); }
  drift(g, r, w, h, 20, 140, 0.08);
  g.strokeStyle = 'rgba(40,80,30,0.25)'; g.lineWidth = 2;
  for (let i = 0; i < 260; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 8 - r() * 6); g.stroke(); }
}, repeat);

/** a Haussmann block facade: cream stone, 6 floors of tall windows with balconies (2nd + 5th), shop fronts */
export const haussmann = (key, { stone = '#e8dcc4', cols = 5 } = {}) => ctex('haus' + key, 512, 768, (g, r, w, h) => {
  g.fillStyle = stone; g.fillRect(0, 0, w, h); drift(g, r, w, h, 16, 140, 0.07);
  g.strokeStyle = tone(stone, 0.86); g.lineWidth = 3;
  for (let y = 40; y < h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  const fh = h / 6.4, cw = w / cols;
  for (let f = 0; f < 6; f++) for (let c = 0; c < cols; c++) {
    const x = c * cw + cw * 0.24, y = f * fh + fh * 0.22, ww = cw * 0.52, hh = fh * (f === 5 ? 0.9 : 0.62);
    if (f === 5) { g.fillStyle = '#6a3a2a'; g.fillRect(c * cw + 6, y + hh * 0.2, cw - 12, hh * 0.8); g.fillStyle = jit(r, '#3f4a55', 0.1); g.fillRect(x, y + hh * 0.3, ww, hh * 0.6); continue; }
    g.fillStyle = jit(r, '#3d4b5c', 0.12); g.fillRect(x, y, ww, hh);
    g.fillStyle = 'rgba(255,240,210,0.28)'; g.fillRect(x + 4, y + 4, ww * 0.3, hh - 8);
    g.strokeStyle = '#f4ecdc'; g.lineWidth = 3; g.strokeRect(x, y, ww, hh); g.beginPath(); g.moveTo(x + ww / 2, y); g.lineTo(x + ww / 2, y + hh); g.stroke();
    g.fillStyle = tone(stone, 0.9); g.fillRect(x - 6, y - 10, ww + 12, 8);
    if (f === 1 || f === 4) { g.strokeStyle = '#2a2a2e'; g.lineWidth = 3; g.strokeRect(x - 10, y + hh * 0.62, ww + 20, hh * 0.38); for (let k = x - 6; k < x + ww + 10; k += 8) { g.beginPath(); g.moveTo(k, y + hh * 0.62); g.lineTo(k, y + hh); g.stroke(); } }
  }
});
export const mansard = (base = '#7d8794', repeat = [4, 1]) => ctex('mansard' + base, 256, 128, (g, r, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 12) for (let x = (y / 12) % 2 ? -8 : 0; x < w; x += 16) { g.fillStyle = jit(r, base, 0.06, 2, 0.1); g.fillRect(x + 1, y + 1, 14, 10); }
  for (let x = 20; x < w; x += 64) { g.fillStyle = '#efe6d4'; g.fillRect(x, h * 0.3, 26, h * 0.5); g.fillStyle = '#3d4b5c'; g.fillRect(x + 5, h * 0.4, 16, h * 0.35); }
}, repeat);

/** riveted iron plate, ochre-brown paint with rust blooms + streaks (the tower in 1925 was painted yellow-brown) */
export const girder = (base = '#a0703e', rust = 0.6, repeat = [1, 1]) => ctex('girder' + base + rust, 512, 512, (g, r, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); drift(g, r, w, h, 14, 120, 0.08);
  for (let i = 0; i < 26 * rust; i++) {
    const x = r() * w, y = r() * h, rr = 14 + r() * 40;
    blotch(g, x, y, rr, '150,62,26', 0.55); blotch(g, x, y, rr * 0.5, '96,40,20', 0.5);
    g.strokeStyle = 'rgba(120,48,22,0.35)'; g.lineWidth = 3 + r() * 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 8, y + 40 + r() * 120); g.stroke();
  }
  g.fillStyle = tone(base, 0.62);
  for (const yy of [24, h - 24]) for (let x = 16; x < w; x += 32) { g.beginPath(); g.arc(x, yy, 7, 0, 7); g.fill(); g.fillStyle = 'rgba(255,230,190,0.5)'; g.beginPath(); g.arc(x - 2, yy - 2, 3, 0, 7); g.fill(); g.fillStyle = tone(base, 0.62); }
  g.fillRect(0, 44, w, 5); g.fillRect(0, h - 49, w, 5);
}, repeat);

export const parquet = (base = '#9a6236', repeat = [3, 3]) => ctex('parquet' + base, 512, 512, (g, r, w, h) => {
  const s = 64;
  for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
    const along = ((x + y) / s) % 2;
    for (let k = 0; k < 4; k++) { g.fillStyle = jit(r, base, 0.1, 3, 0.1); if (along) g.fillRect(x + k * 16, y, 16, s); else g.fillRect(x, y + k * 16, s, 16); }
    g.strokeStyle = tone(base, 0.6); g.lineWidth = 2; g.strokeRect(x, y, s, s);
  }
  drift(g, r, w, h, 14, 140, 0.08);
}, repeat);

/** Louis XVI damask wallpaper: pale ground, a repeating medallion + stripes */
export const damask = (base = '#d9c7a4', ink = '#b89a6a', repeat = [4, 2]) => ctex('damask' + base + ink, 256, 256, (g, r, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  g.fillStyle = tone(base, 0.95); for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 6, h);
  g.fillStyle = ink;
  for (const [cx, cy] of [[64, 64], [192, 192], [192, -64], [64, 320], [-64, 192], [320, 64]]) {
    g.beginPath(); g.ellipse(cx, cy, 22, 34, 0, 0, 7); g.fill();
    g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(cx, cy, 11, 20, 0, 0, 7); g.fill(); g.restore();
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 30, cy + 6, 12, 7, s * 0.6, 0, 7); g.fill(); }
    g.beginPath(); g.moveTo(cx, cy - 46); g.lineTo(cx - 7, cy - 34); g.lineTo(cx + 7, cy - 34); g.fill();
  }
}, repeat);

/** a scrap heap card: tangled girders, wheels, drums, sheet metal (alpha cut-out, self-lit or toon-lit) */
export const scrapHeap = (seed = 1) => ctex('scrap' + seed, 1024, 512, (g, r, w, h) => {
  g.clearRect(0, 0, w, h);
  g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w; x += 32) g.lineTo(x, h - (h * 0.75) * Math.sin(Math.PI * x / w) ** 0.8 - r() * 40);
  g.lineTo(w, h); g.closePath(); g.fillStyle = '#6a5a4c'; g.fill();
  g.save(); g.clip();
  const cols = ['#8a6a52', '#7a7f86', '#5d6670', '#9a5a3a', '#6e5444', '#a88a5c', '#4f5a52'];
  for (let i = 0; i < 70; i++) {
    const x = r() * w, y = h * 0.25 + r() * h * 0.8, c = cols[Math.floor(r() * cols.length)];
    g.fillStyle = c; g.strokeStyle = '#2a221e'; g.lineWidth = 5;
    const k = r();
    if (k < 0.35) { g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 2); g.fillRect(-90, -9, 180, 18); g.strokeRect(-90, -9, 180, 18); g.restore(); }
    else if (k < 0.55) { g.beginPath(); g.arc(x, y, 26 + r() * 22, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(x, y, 10, 0, 7); g.stroke(); }
    else if (k < 0.75) { g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 0.8); g.fillRect(-30, -40, 60, 80); g.strokeRect(-30, -40, 60, 80); g.beginPath(); g.moveTo(-30, -14); g.lineTo(30, -14); g.moveTo(-30, 14); g.lineTo(30, 14); g.stroke(); g.restore(); }
    else { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 60 + r() * 60, y - 20 + r() * 40); g.lineTo(x + 30, y + 50); g.closePath(); g.fill(); g.stroke(); }
  }
  for (let i = 0; i < 10; i++) blotch(g, r() * w, r() * h, 90, '150,70,30', 0.25);
  g.restore();
});

/** self-lit window views (MeshBasicMaterial; push colour > 1 for a blooming bright window) */
export const concorde = () => ctex('concorde', 1024, 768, (g, r, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h * 0.62); sky.addColorStop(0, '#8fc0ea'); sky.addColorStop(1, '#f4ead6');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i++) blotch(g, r() * w, h * (0.1 + r() * 0.25), 90 + r() * 60, '255,255,255', 0.5);
  g.fillStyle = '#cfc4b0'; g.fillRect(0, h * 0.62, w, h * 0.38);
  // far trees + roofs, the Eiffel Tower small on the right, the obelisk in the middle, a fountain
  g.fillStyle = '#8fa088'; for (let x = 0; x < w; x += 40) { g.beginPath(); g.arc(x, h * 0.6, 34 + r() * 14, Math.PI, 0); g.fill(); }
  g.fillStyle = '#b9aa94'; g.fillRect(0, h * 0.5, w * 0.3, h * 0.12); g.fillRect(w * 0.7, h * 0.52, w * 0.3, h * 0.1);
  g.fillStyle = '#7a6250'; g.beginPath(); g.moveTo(w * 0.82, h * 0.6); g.lineTo(w * 0.85, h * 0.18); g.lineTo(w * 0.88, h * 0.6); g.closePath(); g.fill();
  g.fillStyle = '#d8ccb4'; g.fillRect(w * 0.83, h * 0.47, w * 0.04, 6);
  g.fillStyle = '#c99a5a'; g.beginPath(); g.moveTo(w * 0.48, h * 0.72); g.lineTo(w * 0.495, h * 0.22); g.lineTo(w * 0.5, h * 0.2); g.lineTo(w * 0.505, h * 0.22); g.lineTo(w * 0.52, h * 0.72); g.closePath(); g.fill();
  g.fillStyle = '#9a8a74'; g.fillRect(w * 0.465, h * 0.72, w * 0.07, h * 0.05);
  g.fillStyle = '#a8c4d8'; g.beginPath(); g.ellipse(w * 0.22, h * 0.8, 120, 22, 0, 0, 7); g.fill();
  g.fillStyle = '#c9b48a'; g.beginPath(); g.ellipse(w * 0.22, h * 0.76, 30, 40, 0, 0, 7); g.fill();
});
export const moonValley = () => ctex('moonValley', 2048, 512, (g, r, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#16224e'); sky.addColorStop(0.7, '#3a4f8e'); sky.addColorStop(1, '#4a5f98');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; g.beginPath(); g.arc(r() * w, r() * h * 0.6, 1 + r() * 1.6, 0, 7); g.fill(); }
  g.fillStyle = '#2a3a6a'; g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w; x += 64) g.lineTo(x, h * 0.55 + Math.sin(x * 0.004) * 50 + r() * 30); g.lineTo(w, h); g.fill();
  g.fillStyle = '#1c2a52'; g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w; x += 32) g.lineTo(x, h * 0.75 + Math.sin(x * 0.011 + 1) * 24 + r() * 14); g.lineTo(w, h); g.fill();
  for (let i = 0; i < 40; i++) { const x = r() * w; g.fillStyle = '#152044'; g.beginPath(); g.moveTo(x, h * 0.86); g.lineTo(x + 14, h * 0.7 - r() * 20); g.lineTo(x + 28, h * 0.86); g.fill(); }
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,214,140,0.9)'; g.fillRect(r() * w, h * (0.78 + r() * 0.08), 4, 4); }
}, [1, 1]);
export const manhattan = () => ctex('manhattan', 2048, 768, (g, r, w, h) => {
  g.clearRect(0, 0, w, h);
  const tower = (x, ww, hh, col, spire) => {
    g.fillStyle = col; g.fillRect(x, h - hh, ww, hh);
    if (spire) { g.beginPath(); g.moveTo(x, h - hh); g.lineTo(x + ww / 2, h - hh - spire); g.lineTo(x + ww, h - hh); g.fill(); }
    g.fillStyle = 'rgba(255,226,160,0.55)';
    for (let y = h - hh + 12; y < h - 8; y += 16) for (let xx = x + 6; xx < x + ww - 6; xx += 12) if (r() < 0.32) g.fillRect(xx, y, 5, 7);
  };
  for (let i = 0; i < 44; i++) tower(i * 48 + r() * 20, 40 + r() * 30, 120 + r() * 180, jit(r, '#7a7e9a', 0.08), 0);
  for (let i = 0; i < 16; i++) tower(r() * w, 50 + r() * 40, 260 + r() * 260, jit(r, '#8a8aa6', 0.08), r() < 0.5 ? 40 + r() * 80 : 0);
  tower(w * 0.56, 70, 560, '#9a98b2', 120);
});
export const bayHills = () => ctex('bayHills', 2048, 512, (g, r, w, h) => {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#8a7a9a'; g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w; x += 48) g.lineTo(x, h * 0.45 + Math.sin(x * 0.003) * 80 + Math.sin(x * 0.011) * 30); g.lineTo(w, h); g.fill();
  g.fillStyle = '#6e6488'; g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w; x += 32) g.lineTo(x, h * 0.7 + Math.sin(x * 0.006 + 2) * 40); g.lineTo(w, h); g.fill();
  for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(255,214,150,0.8)'; g.fillRect(r() * w, h * (0.72 + r() * 0.2), 3, 3); }
});
