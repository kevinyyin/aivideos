// dh015 cast + props. Outfits are engine/toon/kit.js makeToonX outfits; the 1920s hats and small face marks are drawToon
// `extra` drawings (600 x 1000 design space, head centre (300, 215), R 148) attached once per toon by toon(). Props are
// toon-lit meshes with painted canvas faces (the contract, the letterhead, francs, the death certificate…).
import * as THREE from 'three';
import { makeToonX, box, cyl, ball } from '@engine/toon/kit.js';
import { INK, makeBlob } from '@engine/toon/cards.js';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, fitText } from '@engine/toon/paint.js';

const HX = 300, HY = 215, R = 148, PI = Math.PI, TAU = PI * 2;
const sh = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
const ink = (g, w, col = INK) => { g.lineWidth = w; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
const fill = (g, c) => { g.fillStyle = c; g.fill(); };

// ---------------------------------------------------------------- hats + marks (drawToon extras)
export const HAT = {
  homburg: (col = '#2c2c34', band = '#15151a') => (g) => {
    const y = HY - R * 0.6;
    g.beginPath(); g.ellipse(HX, y + 6, R * 1.32, R * 0.2, 0, 0, TAU); fill(g, sh(col, 0.85)); ink(g, 9);
    g.beginPath(); g.moveTo(HX - R * 0.8, y + 4); g.bezierCurveTo(HX - R * 0.86, y - R * 0.6, HX - R * 0.5, y - R * 0.86, HX - R * 0.12, y - R * 0.74);
    g.quadraticCurveTo(HX, y - R * 0.62, HX + R * 0.12, y - R * 0.74); g.bezierCurveTo(HX + R * 0.5, y - R * 0.86, HX + R * 0.86, y - R * 0.6, HX + R * 0.8, y + 4); g.closePath();
    const gr = g.createLinearGradient(HX - R, 0, HX + R, 0); gr.addColorStop(0, sh(col, 1.25)); gr.addColorStop(1, sh(col, 0.85)); g.fillStyle = gr; g.fill(); ink(g, 9);
    g.beginPath(); g.moveTo(HX - R * 0.82, y - 2); g.quadraticCurveTo(HX, y + 10, HX + R * 0.82, y - 2); g.lineTo(HX + R * 0.82, y - R * 0.2); g.quadraticCurveTo(HX, y - R * 0.1, HX - R * 0.82, y - R * 0.2); g.closePath(); fill(g, band); ink(g, 5);
  },
  bowler: (col = '#3a2a22') => (g) => {
    const y = HY - R * 0.58;
    g.beginPath(); g.ellipse(HX, y + 4, R * 1.12, R * 0.17, 0, 0, TAU); fill(g, sh(col, 0.8)); ink(g, 9);
    g.beginPath(); g.moveTo(HX - R * 0.84, y + 2); g.bezierCurveTo(HX - R * 0.9, y - R * 1.05, HX + R * 0.9, y - R * 1.05, HX + R * 0.84, y + 2); g.closePath();
    const gr = g.createRadialGradient(HX - R * 0.3, y - R * 0.6, 0, HX, y - R * 0.3, R * 1.1); gr.addColorStop(0, sh(col, 1.6)); gr.addColorStop(1, col); g.fillStyle = gr; g.fill(); ink(g, 9);
    g.beginPath(); g.moveTo(HX - R * 0.84, y - 6); g.quadraticCurveTo(HX, y + 6, HX + R * 0.84, y - 6); ink(g, 12, sh(col, 0.55));
  },
  beret: (col = '#2a3a5a') => (g) => {
    g.beginPath(); g.ellipse(HX + 14, HY - R * 0.72, R * 1.05, R * 0.38, -0.16, 0, TAU); fill(g, col); ink(g, 9);
    g.beginPath(); g.moveTo(HX + 6, HY - R * 1.08); g.lineTo(HX + 12, HY - R * 1.22); ink(g, 10);
  },
  cloche: (col = '#7a3f5a', band = '#e8d9b0') => (g) => {
    g.beginPath(); g.moveTo(HX - R * 1.12, HY - R * 0.02);
    g.bezierCurveTo(HX - R * 1.25, HY - R * 1.25, HX + R * 1.25, HY - R * 1.25, HX + R * 1.12, HY - R * 0.02);
    g.quadraticCurveTo(HX + R * 0.6, HY - R * 0.36, HX, HY - R * 0.4); g.quadraticCurveTo(HX - R * 0.6, HY - R * 0.36, HX - R * 1.12, HY - R * 0.02); g.closePath();
    const gr = g.createLinearGradient(HX - R, 0, HX + R, 0); gr.addColorStop(0, sh(col, 1.2)); gr.addColorStop(1, sh(col, 0.85)); g.fillStyle = gr; g.fill(); ink(g, 9);
    g.beginPath(); g.moveTo(HX - R * 1.0, HY - R * 0.32); g.quadraticCurveTo(HX, HY - R * 0.62, HX + R * 1.0, HY - R * 0.32); ink(g, 16, band);
    g.beginPath(); g.arc(HX - R * 0.62, HY - R * 0.5, 24, 0, TAU); fill(g, '#e8a0b0'); ink(g, 5); g.beginPath(); g.arc(HX - R * 0.62, HY - R * 0.5, 8, 0, TAU); fill(g, '#f2c232');
  },
  kepi: (col = '#2c3a6a', band = '#c8322e') => (g) => {
    const y = HY - R * 0.62;
    g.beginPath(); g.moveTo(HX - R * 0.78, y + 6); g.lineTo(HX - R * 0.7, y - R * 0.72); g.lineTo(HX + R * 0.7, y - R * 0.72); g.lineTo(HX + R * 0.78, y + 6); g.closePath(); fill(g, band); ink(g, 9);
    g.beginPath(); g.rect(HX - R * 0.74, y - R * 0.3, R * 1.48, R * 0.32); fill(g, col); ink(g, 6);
    g.beginPath(); g.ellipse(HX, y - R * 0.72, R * 0.7, R * 0.12, 0, 0, TAU); fill(g, sh(band, 0.8)); ink(g, 6);
    g.beginPath(); g.moveTo(HX - R * 0.8, y + 6); g.quadraticCurveTo(HX, y + R * 0.32, HX + R * 0.8, y + 6); g.closePath(); fill(g, '#15151a'); ink(g, 6);
    g.beginPath(); g.arc(HX, y - R * 0.16, 12, 0, TAU); fill(g, '#f2c232');
  },
  flatcap: (col = '#6a5a46') => (g) => {
    const y = HY - R * 0.55;
    g.beginPath(); g.moveTo(HX - R * 1.0, y + 6); g.bezierCurveTo(HX - R * 1.1, y - R * 0.8, HX + R * 1.2, y - R * 0.9, HX + R * 1.05, y - 4); g.closePath(); fill(g, col); ink(g, 9);
    g.beginPath(); g.moveTo(HX - R * 0.4, y + 6); g.quadraticCurveTo(HX + R * 0.5, y - 4, HX + R * 1.3, y + 18); g.quadraticCurveTo(HX + R * 0.6, y + 30, HX - R * 0.4, y + 18); g.closePath(); fill(g, sh(col, 0.8)); ink(g, 7);
  },
  tophat: (col = '#1e1e24') => (g) => {
    const y = HY - R * 0.6;
    g.beginPath(); g.ellipse(HX, y + 6, R * 1.2, R * 0.18, 0, 0, TAU); fill(g, sh(col, 1.2)); ink(g, 9);
    g.beginPath(); g.rect(HX - R * 0.66, y - R * 1.15, R * 1.32, R * 1.18); fill(g, col); ink(g, 9);
    g.beginPath(); g.rect(HX - R * 0.66, y - R * 0.28, R * 1.32, R * 0.22); fill(g, '#5a2a30'); ink(g, 5);
  },
  chauffeur: (col = '#24242c') => (g) => {
    const y = HY - R * 0.58;
    g.beginPath(); g.ellipse(HX, y - R * 0.3, R * 1.0, R * 0.36, 0, 0, TAU); fill(g, col); ink(g, 9);
    g.beginPath(); g.rect(HX - R * 0.78, y - R * 0.3, R * 1.56, R * 0.32); fill(g, sh(col, 0.8)); ink(g, 7);
    g.beginPath(); g.moveTo(HX - R * 0.8, y); g.quadraticCurveTo(HX, y + R * 0.34, HX + R * 0.8, y); g.closePath(); fill(g, '#101014'); ink(g, 6);
  },
};
export const MARK = {
  scar: () => (g) => { g.beginPath(); g.moveTo(HX + 80, HY + 20); g.lineTo(HX + 96, HY + 54); ink(g, 6, '#c47c7c'); },
  shades: () => (g) => { for (const s of [-1, 1]) { g.beginPath(); g.roundRect(HX + s * 50 - 40, HY - 16, 80, 46, 14); fill(g, '#141418'); ink(g, 6); g.beginPath(); g.moveTo(HX + s * 50 - 24, HY - 6); g.lineTo(HX + s * 50 - 8, HY - 6); ink(g, 4, '#6a6a80'); } g.beginPath(); g.moveTo(HX - 10, HY - 4); g.lineTo(HX + 10, HY - 4); ink(g, 7); },
  pearls: () => (g) => { for (let i = 0; i < 11; i++) { const a = PI * (0.18 + (i / 10) * 0.64); g.beginPath(); g.arc(HX + Math.cos(a) * 46, 330 + Math.sin(a) * 34, 9, 0, TAU); fill(g, '#fbf8f0'); ink(g, 3); } },
  number: (txt = '300') => (g) => { g.beginPath(); g.rect(HX + 20, 420, 74, 40); fill(g, '#f4efe4'); ink(g, 4); g.fillStyle = INK; g.font = 'bold 30px Georgia, serif'; g.textAlign = 'center'; g.fillText(txt, HX + 57, 451); },
  stink: () => (g) => { for (let k = 0; k < 3; k++) { g.beginPath(); const x0 = HX + 120 + k * 30, y0 = HY + 120 - k * 6; g.moveTo(x0, y0); for (let i = 1; i <= 12; i++) g.lineTo(x0 + Math.sin(i * 1.3 + k) * 12, y0 - i * 14); ink(g, 9, '#7aa83a'); } },
  sigh: () => (g) => { for (const [x, y, r] of [[HX + 120, HY + 92, 20], [HX + 152, HY + 72, 15], [HX + 176, HY + 56, 11]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); fill(g, '#eef2f8'); ink(g, 4); } },
  blush: () => (g) => { for (const s of [-1, 1]) { g.beginPath(); g.ellipse(HX + s * 78, HY + 52, 26, 14, 0, 0, TAU); fill(g, 'rgba(232,92,92,0.55)'); } },
  stars: () => (g) => { for (const s of [-1, 1]) { const x = HX + s * 48, y = HY + 4; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 9 : 22; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); fill(g, '#f2c232'); ink(g, 4); } },
};

// ---------------------------------------------------------------- outfits
const SUIT = { collar: true, pocket: true };
export const OUT = {
  lustig: { ...SUIT, jacket: '#3b3f52', pants: '#2b2e3a', hair: '#1c1612', hairStyle: 'side', tie: '#9a2f3a', front: [['moustache', '#1c1612', 0.55]] },
  lustigOld: { jacket: '#5a7090', pants: '#3a4a60', hair: '#a8a8ac', hairStyle: 'side', front: [['moustache', '#a8a8ac', 0.55]] },
  poisson: { collar: true, jacket: '#8b5e3c', pants: '#5c4030', tie: '#3d6b4a', front: [['moustache', '#5a3a26', 1.1], ['buttons', '#d9b45a']] },
  d1: { ...SUIT, jacket: '#5a6470', pants: '#3c434c', tie: '#2f3a5a', front: [['specs']] },
  d2: { collar: true, jacket: '#6b5a46', pants: '#4a3e30', tie: '#7a3a2a' },
  d3: { collar: true, jacket: '#4c5a48', pants: '#36402f', tie: '#a87a2a', hair: '#9a9a9a', hairStyle: 'side', front: [['moustache', '#e2ded6', 1.25]] },
  d4: { collar: true, jacket: '#6a3e4e', pants: '#40262f', tie: '#d9b45a', front: [['moustache', '#2a1e19', 0.9]] },
  d5: { ...SUIT, jacket: '#7a6a3a', pants: '#4a4026', tie: '#3a4a7a', front: [['specs']] },
  d6: { collar: true, jacket: '#3e5a6a', pants: '#2a3a44', tie: '#8a2a34' },
  wife: { jacket: '#7a3f5a', pants: '#5a2f44', front: [['skirt', '#7a3f5a'], ['buttons', '#f2e6c8']] },
  parisM: { jacket: '#3f5f8a', pants: '#3a3a44', front: [['moustache', '#3a2a1e', 0.9]] },
  parisW: { jacket: '#c9784a', pants: '#8a4a30', front: [['skirt', '#b86a3e']] },
  gendarme: { jacket: '#2c3a5e', pants: '#1f2740', front: [['buttons', '#d9b45a'], ['moustache', '#2a1e19', 1.0]] },
  chauffeur: { jacket: '#24242c', pants: '#1c1c22', front: [['buttons', '#c9a35a']] },
  bouncer: { jacket: '#1d1d24', pants: '#24242c' },
  you: { jacket: '#e0763a', pants: '#3d4a6a', front: [['bangs', '#4a3020']] },
  q1: { jacket: '#3aa08a', pants: '#2a3a4a', hair: '#2a1e19', hairStyle: 'side' },
  q2: { jacket: '#c94a7a', pants: '#3a2a4a', front: [['skirt', '#3a2a4a'], ['bangs', '#e0b060']] },
  q3: { jacket: '#5a6ac9', pants: '#2a2a3a', front: [['ballcap', '#e0533f']] },
  q4: { jacket: '#e8c44a', pants: '#3a3a4a', front: [['bangs', '#2a1e19']] },
};
const EXTRA = {
  lustig: [MARK.scar()], lustigHat: [MARK.scar(), HAT.homburg('#2c2c34')], lustigOld: [MARK.number('300')],
  poisson: [HAT.bowler('#3a2a22')], d1: [HAT.tophat()], d2: [HAT.flatcap('#6a5a46')], d3: [], d4: [HAT.bowler('#2a2a30')], d5: [HAT.homburg('#5a4a3a', '#2a2018')], d6: [HAT.flatcap('#3a4a5a')],
  wife: [HAT.cloche('#7a3f5a', '#e8d9b0'), MARK.pearls()], parisM: [HAT.beret('#2a3a5a')], parisW: [HAT.cloche('#4a6a8a', '#f2e6c8')],
  gendarme: [HAT.kepi('#2c3a6a', '#c8322e')], chauffeur: [HAT.chauffeur()], bouncer: [MARK.shades()], you: [], q1: [], q2: [], q3: [], q4: [],
};

/** a costumed toon with its fixed hat / marks; set() also takes `add: ['stink', …]` for momentary marks */
export function toon(name, { res = 1.8, shadow = true, blob = true, outfit, extra } = {}) {
  const tn = makeToonX(OUT[outfit || name], { res, shadow, maxCache: 8 });
  const fixed = extra || EXTRA[name] || [];
  const set0 = tn.set;
  tn.set = (s) => {
    const adds = (s.add || []).map((k) => MARK[k]());
    set0({ ...s, key: (s.add || []).join(','), extra: (g) => { for (const f of fixed) f(g); for (const f of adds) f(g); } });
  };
  if (blob) { tn.blob = makeBlob(0.34, 0.2, 0.55); }
  return tn;
}

// ---------------------------------------------------------------- paper props
const PAPER = '#f4ecd8', TYPE = '#2a2420';
const lines = (g, x0, y0, x1, n, dy, r) => { g.fillStyle = 'rgba(60,50,40,0.55)'; for (let i = 0; i < n; i++) g.fillRect(x0, y0 + i * dy, (x1 - x0) * (0.6 + 0.4 * ((Math.sin(i * 7.3 + r) + 1) / 2)), 6); };
function towerSketch(g, cx, by, h, col = '#5a3a26', w = 4) {
  g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(cx - h * 0.32, by); g.quadraticCurveTo(cx - h * 0.12, by - h * 0.45, cx - h * 0.03, by - h * 0.95); g.lineTo(cx, by - h);
  g.lineTo(cx + h * 0.03, by - h * 0.95); g.quadraticCurveTo(cx + h * 0.12, by - h * 0.45, cx + h * 0.32, by); g.stroke();
  g.beginPath(); g.moveTo(cx - h * 0.2, by - h * 0.18); g.lineTo(cx + h * 0.2, by - h * 0.18); g.moveTo(cx - h * 0.1, by - h * 0.42); g.lineTo(cx + h * 0.1, by - h * 0.42); g.stroke();
  g.beginPath(); g.arc(cx, by, h * 0.17, PI, 0); g.stroke();
  for (let i = 0; i < 6; i++) { const y = by - h * (0.05 + i * 0.14), s = h * 0.3 * (1 - i * 0.15); g.beginPath(); g.moveTo(cx - s * 0.6, y); g.lineTo(cx + s * 0.6, y - h * 0.1); g.stroke(); }
}
export const TEX = {
  contract: (stamped) => ctex('contract' + (stamped ? 'S' : ''), 768, 1024, (g, r, W, H) => {
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.strokeStyle = '#b8a27a'; g.lineWidth = 10; g.strokeRect(24, 24, W - 48, H - 48);
    g.fillStyle = TYPE; g.textAlign = 'center';
    fitText(g, 'ACTE DE VENTE', W / 2, 120, W - 140, 64, 'bold', 'Georgia, serif');
    fitText(g, 'LA TOUR EIFFEL', W / 2, 220, W - 120, 96, 'bold', 'Georgia, serif');
    towerSketch(g, W / 2, 620, 340, '#6a4a2e', 6);
    lines(g, 90, 680, W - 90, 6, 34, 1);
    g.strokeStyle = TYPE; g.lineWidth = 3; g.beginPath(); g.moveTo(90, 940); g.lineTo(330, 940); g.moveTo(W - 330, 940); g.lineTo(W - 90, 940); g.stroke();
    g.beginPath(); g.moveTo(110, 925); g.bezierCurveTo(150, 880, 190, 960, 230, 910); g.bezierCurveTo(260, 880, 290, 930, 320, 905); g.stroke();
    if (stamped) {
      g.save(); g.translate(W * 0.56, H * 0.5); g.rotate(-0.22); g.strokeStyle = 'rgba(200,40,40,0.9)'; g.lineWidth = 16; g.strokeRect(-260, -95, 520, 190);
      g.fillStyle = 'rgba(200,40,40,0.9)'; g.font = 'bold 150px Georgia, serif'; g.textAlign = 'center'; g.fillText('SOLD', 0, 52); g.restore();
    }
  }),
  letter: (stamped) => ctex('letter' + (stamped ? 'S' : ''), 768, 1024, (g, r, W, H) => {
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1f3a7a'; g.textAlign = 'center'; fitText(g, 'RÉPUBLIQUE FRANÇAISE', W / 2, 100, W - 200, 40, 'bold', 'Georgia, serif');
    g.beginPath(); g.arc(W / 2, 200, 62, 0, TAU); g.lineWidth = 8; g.strokeStyle = '#1f3a7a'; g.stroke(); g.beginPath(); g.arc(W / 2, 200, 44, 0, TAU); g.lineWidth = 3; g.stroke();
    g.font = 'bold 54px Georgia, serif'; g.fillText('RF', W / 2, 218);
    fitText(g, 'MINISTÈRE DES POSTES', W / 2, 330, W - 120, 58, 'bold', 'Georgia, serif');
    fitText(g, 'ET TÉLÉGRAPHES', W / 2, 395, W - 160, 58, 'bold', 'Georgia, serif');
    g.fillRect(100, 425, W - 200, 5);
    g.fillStyle = TYPE; g.textAlign = 'left'; g.font = 'italic 40px Georgia, serif'; g.fillText('Monsieur,', 100, 510);
    lines(g, 100, 560, W - 100, 8, 40, 3);
    if (stamped) {
      g.save(); g.translate(W * 0.62, H * 0.84); g.rotate(-0.16); g.strokeStyle = 'rgba(200,40,40,0.92)'; g.lineWidth = 10; g.strokeRect(-200, -55, 400, 110);
      g.fillStyle = 'rgba(200,40,40,0.92)'; g.font = 'bold 66px Georgia, serif'; g.textAlign = 'center'; g.fillText('CONFIDENTIEL', 0, 24); g.restore();
    }
  }),
  board: () => ctex('easelBoard', 768, 1000, (g, r, W, H) => {
    g.fillStyle = '#f6efde'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#2a2420'; g.textAlign = 'center'; fitText(g, 'LA TOUR EIFFEL', W / 2, 92, W - 120, 70, 'bold', 'Georgia, serif');
    towerSketch(g, W * 0.36, 820, 640, '#6a4a2e', 7);
    g.strokeStyle = '#c8322e'; g.lineWidth = 10; g.setLineDash([26, 16]); g.beginPath(); g.moveTo(W * 0.1, 470); g.lineTo(W * 0.62, 470); g.stroke(); g.setLineDash([]);
    g.lineWidth = 12; g.beginPath(); g.moveTo(W * 0.6, 660); g.quadraticCurveTo(W * 0.78, 640, W * 0.8, 760); g.stroke();
    g.beginPath(); g.moveTo(W * 0.76, 730); g.lineTo(W * 0.8, 772); g.lineTo(W * 0.84, 728); g.stroke();
    g.fillStyle = '#6a5a4c'; g.beginPath(); g.moveTo(W * 0.64, 900); g.lineTo(W * 0.72, 820); g.lineTo(W * 0.8, 850); g.lineTo(W * 0.92, 800); g.lineTo(W * 0.96, 900); g.closePath(); g.fill();
    g.fillStyle = '#c8322e'; fitText(g, 'FERRAILLE', W * 0.8, 960, W * 0.36, 58, 'bold', 'Georgia, serif');
    fitText(g, '7 000 T', W * 0.8, 600, W * 0.34, 72, 'bold', 'Georgia, serif');
  }),
  franc: () => ctex('franc1000', 512, 256, (g, r, W, H) => {
    g.fillStyle = '#d9c39a'; g.fillRect(0, 0, W, H); g.strokeStyle = '#8a5a6a'; g.lineWidth = 10; g.strokeRect(8, 8, W - 16, H - 16);
    g.fillStyle = '#a87a8a'; g.beginPath(); g.ellipse(W * 0.72, H * 0.52, 62, 78, 0, 0, TAU); g.fill();
    g.fillStyle = '#5a3a4a'; g.textAlign = 'center'; fitText(g, 'BANQUE DE FRANCE', W * 0.36, 70, W * 0.6, 34, 'bold', 'Georgia, serif');
    fitText(g, '1000', W * 0.36, 160, W * 0.5, 90, 'bold', 'Georgia, serif'); fitText(g, 'FRANCS', W * 0.36, 214, W * 0.5, 40, 'bold', 'Georgia, serif');
  }),
  dollar: () => ctex('dollar20', 512, 220, (g, r, W, H) => {
    g.fillStyle = '#cfe0c0'; g.fillRect(0, 0, W, H); g.strokeStyle = '#3f6a3a'; g.lineWidth = 10; g.strokeRect(8, 8, W - 16, H - 16);
    g.fillStyle = '#9ab88a'; g.beginPath(); g.ellipse(W / 2, H / 2, 60, 76, 0, 0, TAU); g.fill();
    g.fillStyle = '#2f5a2a'; g.font = 'bold 90px Georgia, serif'; g.textAlign = 'center'; g.fillText('20', 80, 140); g.fillText('20', W - 80, 140);
  }),
  postcard: () => ctex('postcardParis', 640, 900, (g, r, W, H) => {
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#7ab0e0'); sky.addColorStop(1, '#f4e2c0'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = '#8fae6a'; g.fillRect(0, H * 0.8, W, H * 0.2);
    towerSketch(g, W / 2, H * 0.82, H * 0.68, '#5a3a26', 9);
    g.strokeStyle = '#fbf6ea'; g.lineWidth = 26; g.strokeRect(13, 13, W - 26, H - 26);
    g.fillStyle = '#c8322e'; g.textAlign = 'center'; fitText(g, 'PARIS', W / 2, H * 0.14, W - 160, 96, 'bold', 'Georgia, serif');
  }),
  cert: (hi = 0) => ctex('deathCert' + Math.round(hi * 8), 900, 1100, (g, r, W, H) => {
    g.fillStyle = '#f2ead4'; g.fillRect(0, 0, W, H); g.strokeStyle = '#3a3428'; g.lineWidth = 6; g.strokeRect(30, 30, W - 60, H - 60);
    g.fillStyle = '#2a2420'; g.textAlign = 'center';
    fitText(g, 'STANDARD CERTIFICATE OF DEATH', W / 2, 110, W - 120, 52, 'bold', 'Georgia, serif');
    g.fillRect(60, 140, W - 120, 4);
    g.textAlign = 'left'; g.font = 'bold 32px Georgia, serif'; g.fillStyle = '#3a3226';
    const row = (y, label) => { g.fillText(label, 70, y); g.fillStyle = 'rgba(60,50,40,0.25)'; g.fillRect(70, y + 14, W - 140, 2); g.fillStyle = '#4a4236'; };
    row(220, 'Place of death'); row(300, 'Date of death'); row(380, 'Birthplace');
    g.font = 'bold 36px "Courier New", monospace'; g.fillStyle = '#100c08';
    g.fillText('Springfield, Missouri', 330, 220); g.fillText('March 11, 1947', 330, 300); g.fillText('Hostinne, Czechoslovakia', 330, 380);
    g.font = 'bold 34px Georgia, serif'; g.fillStyle = '#3a3226'; g.fillText('Usual occupation', 70, 500);
    if (hi > 0) { g.fillStyle = `rgba(255,214,60,${0.75 * hi})`; g.fillRect(56, 528, (W - 112) * hi, 210); }
    g.fillStyle = '#100c08'; g.font = 'bold 72px "Courier New", monospace'; g.fillText('Apprentice', 80, 600); g.fillText('Salesman &', 80, 670); g.fillText('Counterfeiter', 80, 740);
    lines(g, 70, 820, W - 70, 6, 44, 5);
  }),
};
/** a flat paper prop (double-sided, toon-lit, casts a shadow), w × h metres */
export function paper(parent, w, h, tex) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toonMat(tex, { side: THREE.DoubleSide }));
  m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}

// ---------------------------------------------------------------- 3D props
/** a rubber stamp: dark-red rubber base at y = 0, handle up (+y) */
export function makeStamp(parent, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s); parent.add(g);
  box(g, 0.1, 0.02, 0.07, toonMat('#7a1e22'), 0, 0.01, 0); box(g, 0.11, 0.03, 0.08, toonMat('#5a3a24'), 0, 0.035, 0);
  cyl(g, 0.014, 0.018, 0.09, toonMat('#6a4a2c'), 0, 0.09, 0, 10); ball(g, 0.032, toonMat('#3a2418'), 0, 0.15, 0, 12);
  return g;
}
/** a fat envelope of francs (flap toward +z), notes sticking out */
export function makeEnvelope(parent, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s); parent.add(g);
  box(g, 0.26, 0.15, 0.035, toonMat('#c9a874'), 0, 0, 0, 0.008);
  const note = toonMat(TEX.franc(), { side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) { const n = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), note); n.position.set(-0.03 + i * 0.03, 0.09 + i * 0.006, 0.0); n.rotation.z = 0.12 - i * 0.1; n.castShadow = true; g.add(n); }
  return g;
}
/** a fan of n 1000-franc notes held at the bottom corner (local origin), spread(k) 0 … 1 */
export function makeFan(parent, n = 7, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s); parent.add(g);
  const m = toonMat(TEX.franc(), { side: THREE.DoubleSide }), notes = [];
  for (let i = 0; i < n; i++) { const p = new THREE.Group(); g.add(p); const q = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), m); q.position.set(0.09, 0.04, i * 0.002); q.castShadow = true; p.add(q); notes.push(p); }
  return { g, spread(k) { notes.forEach((p, i) => { p.rotation.z = (i - (n - 1) / 2) * 0.16 * k + 0.6; }); } };
}
/** a candlestick telephone: base, stem, mouthpiece; the earpiece (hand-held) is returned separately */
export function makePhone(parent) {
  const g = new THREE.Group(); parent.add(g); const blk = toonMat('#1a1a1e', { shiny: 50, spec: 0x606070 }), brass = toonMetal('#d6b25e', { rough: 0.3 });
  cyl(g, 0.06, 0.07, 0.03, blk, 0, 0.015, 0, 16); cyl(g, 0.014, 0.016, 0.28, blk, 0, 0.16, 0, 10);
  const mp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.015, 0.06, 14), blk); mp.position.set(0, 0.31, 0.03); mp.rotation.x = PI / 2.6; mp.castShadow = true; g.add(mp);
  box(g, 0.02, 0.05, 0.02, brass, 0.03, 0.22, 0);
  const ear = new THREE.Group(); parent.add(ear); cyl(ear, 0.02, 0.02, 0.1, blk, 0, 0, 0, 10); const cup = cyl(ear, 0.03, 0.022, 0.04, blk, 0, 0.065, 0, 12); void cup;
  return { g, ear };
}
/** a leather suitcase (handle up) with a luggage tag */
export function makeSuitcase(parent, tag = 'WIEN') {
  const g = new THREE.Group(); parent.add(g);
  box(g, 0.6, 0.42, 0.18, toonMat('#7a4a2a'), 0, 0.21, 0, 0.03); for (const x of [-0.18, 0.18]) box(g, 0.05, 0.43, 0.19, toonMat('#4a2a18'), x, 0.21, 0);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 6, 14, PI), toonMat('#3a2418')); h.position.y = 0.42; h.castShadow = true; g.add(h);
  const t = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), toonMat(ctex('tag' + tag, 160, 96, (gg, r, W, H) => { gg.fillStyle = '#f1e2b8'; gg.fillRect(0, 0, W, H); gg.fillStyle = '#2a2420'; gg.textAlign = 'center'; fitText(gg, tag, W / 2, H * 0.68, W - 20, 48, 'bold', 'Georgia, serif'); }), { side: THREE.DoubleSide }));
  t.position.set(0.2, 0.3, 0.1); t.rotation.z = -0.3; g.add(t);
  return g;
}
/** a 1920s open touring car (front toward +x), dark green, brass lamps; seats: front (x 0.35), rear (x -0.85), y 0.62 */
export function makeTourer(parent) {
  const g = new THREE.Group(); parent.add(g);
  const body = toonMat('#1f4a3a', { shiny: 60, spec: 0x6a8a7a }), black = toonMat('#17171c', { shiny: 40 }), leather = toonMat('#a8743f'), brass = toonMetal('#e0b85a', { rough: 0.25 }), cream = toonMat('#efe6d0');
  box(g, 3.2, 0.5, 1.5, body, -0.2, 0.75, 0, 0.08);                       // tub
  box(g, 1.3, 0.55, 1.1, body, 1.85, 0.78, 0, 0.1);                       // bonnet
  box(g, 0.12, 0.66, 1.0, toonMat('#c9cdd3', { shiny: 70 }), 2.52, 0.8, 0, 0.03);   // radiator
  for (const z of [-0.78, 0.78]) { box(g, 3.9, 0.06, 0.28, black, 0.1, 0.42, z); }   // running boards
  for (const [x, z] of [[1.6, -0.72], [1.6, 0.72], [-1.3, -0.72], [-1.3, 0.72]]) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 20, 1, false, 0, PI), black); f.rotation.set(PI / 2, 0, PI / 2); f.position.set(x, 0.42, z); f.castShadow = true; g.add(f);
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 10, 24), black); w.position.set(x, 0.4, z); w.castShadow = true; g.add(w);
    const hub = cyl(g, 0.24, 0.24, 0.1, cream, x, 0.4, z, 16); hub.rotation.x = PI / 2;
    for (let k = 0; k < 6; k++) { const sp = box(g, 0.03, 0.46, 0.03, toonMat('#6a5a3a'), x, 0.4, z + Math.sign(z) * 0.06); sp.rotation.z = (k * PI) / 6; }
  }
  for (const [x, w] of [[0.35, 0.5], [-0.85, 0.6]]) { box(g, w, 0.16, 1.3, leather, x, 0.98, 0, 0.05); box(g, 0.14, 0.5, 1.3, leather, x - w / 2, 1.2, 0, 0.05); }
  const ws = box(g, 0.04, 0.5, 1.2, new THREE.MeshLambertMaterial({ color: 0xcfe0ec, transparent: true, opacity: 0.35 }), 0.9, 1.25, 0); ws.castShadow = false;
  box(g, 0.05, 0.05, 1.25, brass, 0.9, 1.5, 0);
  for (const z of [-0.5, 0.5]) { const l = cyl(g, 0.12, 0.12, 0.16, brass, 2.55, 1.05, z, 14); l.rotation.z = PI / 2; const lens = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.3, 1.05) })); lens.position.set(2.64, 1.05, z); lens.rotation.y = PI / 2; g.add(lens); }
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 20), black); sw.position.set(0.72, 1.18, 0.35); sw.rotation.y = PI / 2; sw.rotation.x = 0.4; g.add(sw);
  const spare = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 10, 22), black); spare.position.set(-1.88, 0.85, 0); spare.rotation.y = PI / 2; spare.castShadow = true; g.add(spare);
  return { g };
}
