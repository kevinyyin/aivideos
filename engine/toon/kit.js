// Toon-look building kit (dh013, the first narrated explainer): set helpers lifted from lt001, a card toon with a
// BACK layer (long wigs / hair behind the shoulders) + a FRONT layer (hats, cravats, aprons, moustaches) for period and
// modern costumes, ready-made outfits, and a zoom-dissolve between places. Additive: nothing in cards.js changes.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { drawToon, INK } from './cards.js';
import { NOINK } from './ink.js';
import { cardShade, toonMat } from './shade.js';
import { ctex } from './paint.js';

const PI = Math.PI, TAU = PI * 2;

// ---------------------------------------------------------------- set helpers (lt001)
export function box(parent, w, h, d, m, x, y, z, round = 0) {
  const g = round ? new RoundedBoxGeometry(w, h, d, 3, round) : new THREE.BoxGeometry(w, h, d);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
export function cyl(parent, r0, r1, h, m, x, y, z, seg = 32) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
export function plane(parent, w, h, m, x, y, z) { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.receiveShadow = true; parent.add(o); return o; }
export function ball(parent, r, m, x, y, z, seg = 24) { const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg >> 1)), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; }
/** the set's key light = directional light 0 (the only shadow caster the two-tone shader reads) + a soft hemisphere */
export function sun(root, pos, target, { half = 2.6, color = 0xfff0d8, map = 2048, hemi = [0xdcecff, 0xb49a78, 0.9], far = 30 } = {}) {
  // (toon look v2) only light 0's shadow + direction shape the two-tone; point / spot lights add pools on top
  const s = new THREE.DirectionalLight(color, 2.2);
  s.position.set(...pos); s.target.position.set(...target); root.add(s, s.target);
  s.castShadow = true; s.shadow.mapSize.set(map, map);
  Object.assign(s.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 0.3, far });
  s.shadow.bias = -0.0004; s.shadow.normalBias = 0.02; s.shadow.radius = 2;
  if (hemi) root.add(new THREE.HemisphereLight(...hemi));
  return s;
}
/** canvas material: toon-lit by default, `basic` for self-lit pictures (skies, screens), `alpha` cut-outs */
export function canvasMat(key, w, h, draw, { basic = false, alpha = false, color } = {}) {
  const t = ctex(key, w, h, draw);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return basic ? new THREE.MeshBasicMaterial({ map: t, alphaTest: alpha ? 0.5 : 0, color: color ?? 0xffffff }) : toonMat(t, alpha ? { alphaTest: 0.5 } : {});
}
/** world point at screen fraction (fx, fy) and view depth d for a camera pose {p, a, fov} */
export function atScreen(c, fx, fy, d) {
  const cam = new THREE.PerspectiveCamera(c.fov, 9 / 16, 0.05, 100); cam.position.set(...c.p); cam.lookAt(...c.a); cam.updateMatrixWorld(true);
  const v = new THREE.Vector3(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  const fwd = cam.getWorldDirection(new THREE.Vector3());
  return cam.position.clone().addScaledVector(v, d / v.dot(fwd));
}
/** a warm/cool light pool: a decaying PointLight (adds to the two-tone sun on world materials and cards, toon look v2) */
export function lamp(parent, color, intensity, dist, x, y, z) { const l = new THREE.PointLight(color, intensity, dist, 2); l.position.set(x, y, z); parent.add(l); return l; }
/** additive soft glow sprite (candles, furnace mouths, lamps) on the NOINK layer */
export function glow(parent, rgb, size, x, y, z, a = 0.9) {
  const tex = ctex('glow' + rgb, 128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.35, `rgba(${rgb},${a * 0.35})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.scale.set(size, size, 1); s.position.set(x, y, z); s.layers.set(NOINK); parent.add(s); return s;
}

// ---------------------------------------------------------------- costume layers (600 x 1000 design space, cards.js)
const HX = 300, HY = 215, R = 148;
let OL = 1;
const st = (g, w, col = INK) => { g.lineWidth = w * OL; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
const fl = (g, col) => { g.fillStyle = col; g.fill(); };
const circ = (g, x, y, rx, ry = rx, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); };
const dk = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();

/** a long curly wig: back = curls falling behind the shoulders, front = the crown + side curls framing the face */
function wigBack(g, col, len = 1) {
  const curl = (x, y, r) => { circ(g, x, y, r, r * 0.92); fl(g, col); st(g, 6); circ(g, x - r * 0.25, y - r * 0.2, r * 0.45); st(g, 3, dk(col, 0.75)); };
  for (const side of [-1, 1]) for (let i = 0; i < 6 * len; i++) {
    const y = HY - 20 + i * 44, x = HX + side * (R * 0.95 + 18 + Math.sin(i * 1.7) * 10);
    curl(x, y, 40 - i * 1.5); curl(x - side * 34, y + 22, 34);
  }
}
function wigFront(g, col) {
  g.beginPath(); g.moveTo(HX - R * 1.08, HY - R * 0.1);
  g.bezierCurveTo(HX - R * 1.18, HY - R * 1.2, HX + R * 1.18, HY - R * 1.2, HX + R * 1.08, HY - R * 0.1);
  g.bezierCurveTo(HX + R * 0.8, HY - R * 0.55, HX + R * 0.4, HY - R * 0.66, HX, HY - R * 0.6);
  g.bezierCurveTo(HX - R * 0.4, HY - R * 0.66, HX - R * 0.8, HY - R * 0.55, HX - R * 1.08, HY - R * 0.1);
  g.closePath(); fl(g, col); st(g, 8);
  for (let i = 0; i < 7; i++) { const a = PI * (1.12 + i * 0.127); g.beginPath(); g.arc(HX + Math.cos(a) * R * 0.78, HY + Math.sin(a) * R * 0.78 + 8, 22, a + 0.4, a + 2.6); st(g, 4, dk(col, 0.72)); }
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
    const x = HX + side * (R * 1.0 + 4), y = HY + 10 + i * 46; circ(g, x, y, 30, 27); fl(g, col); st(g, 6);
    g.beginPath(); g.arc(x, y, 14, 0.5, 3.8); st(g, 3, dk(col, 0.72));
  }
}
function tricorn(g, col, trim = '#d9b45a', y0 = HY - R * 0.62) {
  g.beginPath(); g.moveTo(HX - R * 1.25, y0 + 8);
  g.quadraticCurveTo(HX - R * 0.9, y0 - R * 0.62, HX, y0 - R * 0.36); g.quadraticCurveTo(HX + R * 0.9, y0 - R * 0.62, HX + R * 1.25, y0 + 8);
  g.quadraticCurveTo(HX, y0 + 30, HX - R * 1.25, y0 + 8); g.closePath(); fl(g, col); st(g, 8);
  g.beginPath(); g.moveTo(HX - R * 1.18, y0 + 6); g.quadraticCurveTo(HX, y0 + 24, HX + R * 1.18, y0 + 6); st(g, 7, trim);
  circ(g, HX - R * 0.85, y0 - 4, 9); fl(g, trim);
}
function slouch(g, col) {   // the disguise: a big floppy brim pulled low
  const y0 = HY - R * 0.48;
  circ(g, HX, y0 - R * 0.42, R * 0.78, R * 0.5); fl(g, col); st(g, 8);
  g.beginPath(); g.ellipse(HX, y0, R * 1.42, R * 0.26, 0.04, 0, TAU); fl(g, dk(col, 1.15)); st(g, 8);
  g.beginPath(); g.moveTo(HX - R * 0.72, y0 - R * 0.22); g.quadraticCurveTo(HX, y0 - R * 0.12, HX + R * 0.74, y0 - R * 0.2); st(g, 14, dk(col, 0.6));
}
function plumed(g, col, plume) {   // a cavalier hat with an ostrich plume (Chaloner)
  const y0 = HY - R * 0.62;
  g.beginPath(); g.moveTo(HX - R * 0.7, y0); g.quadraticCurveTo(HX - R * 0.7, y0 - R * 0.8, HX, y0 - R * 0.82); g.quadraticCurveTo(HX + R * 0.72, y0 - R * 0.8, HX + R * 0.7, y0); g.closePath(); fl(g, col); st(g, 8);
  g.beginPath(); g.ellipse(HX, y0 + 4, R * 1.32, R * 0.22, -0.06, 0, TAU); fl(g, dk(col, 1.2)); st(g, 8);
  // the plume lies across the crown and droops off the left brim: the card canvas starts just above the crown, so a
  // plume standing up got sliced off by its top edge (two floating stubs on his hat, dh013 v1.1 glitch scan)
  const bz = (u, a, b, c) => (1 - u) * (1 - u) * a + 2 * u * (1 - u) * b + u * u * c, up = [], lo = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14, w = R * 0.16 * Math.sin(PI * (0.1 + 0.9 * u)), n = (i % 2) * Math.min(w, 12);
    const x = bz(u, HX + R * 0.5, HX - R * 0.4, HX - R * 1.35), y = bz(u, y0 - R * 0.32, y0 - R * 0.95, y0 + R * 0.3);
    let tx = -0.9 * (1 - u) - 0.95 * u, ty = -0.63 * (1 - u) + 1.25 * u; const l = Math.hypot(tx, ty); tx /= l; ty /= l;
    up.push([x - ty * (w - n), y + tx * (w - n)]); lo.push([x + ty * w, y - tx * w]);
  }
  g.beginPath(); for (const [x, y] of [...up, ...lo.reverse()]) g.lineTo(x, y);
  g.closePath(); fl(g, plume); st(g, 6);
  g.beginPath(); g.moveTo(HX - R * 0.7, y0 - 14); g.lineTo(HX + R * 0.7, y0 - 14); st(g, 12, '#d9b45a');
}
function toque(g) {   // baker's cap
  const y0 = HY - R * 0.66;
  g.beginPath(); g.moveTo(HX - R * 0.78, y0 + 10);
  for (const [dx, dy] of [[-0.95, -0.55], [-0.5, -0.95], [0, -1.05], [0.5, -0.95], [0.95, -0.55]]) g.quadraticCurveTo(HX + R * (dx - 0.1), y0 + R * (dy - 0.25), HX + R * dx * 0.8, y0 + R * dy * 0.6);
  g.lineTo(HX + R * 0.78, y0 + 10); g.closePath(); fl(g, '#fbf8f2'); st(g, 8);
  g.beginPath(); g.rect(HX - R * 0.8, y0 - 6, R * 1.6, 30); fl(g, '#efe9de'); st(g, 7);
}
function knitCap(g, col) {   // the clipper's woolly cap, a bit askew
  g.save(); g.translate(HX, HY - R * 0.55); g.rotate(-0.12);
  g.beginPath(); g.moveTo(-R * 0.98, 12); g.bezierCurveTo(-R * 1.05, -R * 0.95, R * 1.05, -R * 0.95, R * 0.98, 12); g.closePath(); fl(g, col); st(g, 8);
  g.beginPath(); g.rect(-R * 1.0, -6, R * 2.0, 34); fl(g, dk(col, 0.8)); st(g, 7);
  for (let x = -R * 0.85; x < R * 0.9; x += 26) { g.beginPath(); g.moveTo(x, -2); g.lineTo(x, 24); st(g, 3, dk(col, 0.6)); }
  g.restore();
}
function mobCap(g) {   // a 1690s woman's white linen cap
  const y0 = HY - R * 0.6;
  g.beginPath(); g.moveTo(HX - R * 1.08, y0 + R * 0.35);
  for (let i = 0; i <= 10; i++) { const a = PI + (i / 10) * PI; g.lineTo(HX + Math.cos(a) * R * 1.08 + (i % 2) * 6, y0 + Math.sin(a) * R * 0.62 + (i % 2) * 8); }
  g.lineTo(HX + R * 1.08, y0 + R * 0.35); g.quadraticCurveTo(HX, y0 + R * 0.1, HX - R * 1.08, y0 + R * 0.35); g.closePath(); fl(g, '#fbf7ef'); st(g, 7);
  g.beginPath(); g.moveTo(HX - R * 0.9, y0 + R * 0.18); g.quadraticCurveTo(HX, y0 - R * 0.05, HX + R * 0.9, y0 + R * 0.18); st(g, 4, '#c9bfae');
}
function bun(g, col) { circ(g, HX + R * 0.1, HY - R * 1.08, R * 0.38); fl(g, col); st(g, 8); }
function bangs(g, col) {   // a modern short haircut (the customer)
  g.beginPath(); g.moveTo(HX - R * 1.02, HY + 10);
  g.bezierCurveTo(HX - R * 1.12, HY - R * 1.15, HX + R * 1.12, HY - R * 1.15, HX + R * 1.02, HY + 10);
  g.bezierCurveTo(HX + R * 0.86, HY - R * 0.45, HX + R * 0.2, HY - R * 0.52, HX - R * 0.3, HY - R * 0.36);
  g.bezierCurveTo(HX - R * 0.7, HY - R * 0.4, HX - R * 0.9, HY - R * 0.3, HX - R * 1.02, HY + 10);
  g.closePath(); fl(g, col); st(g, 8);
}
function ballcap(g, col) {
  const y0 = HY - R * 0.52;
  g.beginPath(); g.moveTo(HX - R * 1.0, y0 + 6); g.bezierCurveTo(HX - R * 1.05, y0 - R * 0.85, HX + R * 1.05, y0 - R * 0.85, HX + R * 1.0, y0 + 6); g.closePath(); fl(g, col); st(g, 8);
  g.beginPath(); g.moveTo(HX + R * 0.2, y0 + 4); g.quadraticCurveTo(HX + R * 1.2, y0 - 10, HX + R * 1.45, y0 + 22); g.quadraticCurveTo(HX + R * 0.9, y0 + 30, HX + R * 0.2, y0 + 20); g.closePath(); fl(g, dk(col, 0.85)); st(g, 7);
  circ(g, HX, y0 - R * 0.8, 9); fl(g, dk(col, 0.7));
}
function cravat(g, col = '#fbf8f2') {   // white lace jabot at the neck
  g.beginPath(); g.moveTo(HX - 30, 338); g.quadraticCurveTo(HX, 352, HX + 30, 338); g.lineTo(HX + 22, 420);
  g.quadraticCurveTo(HX + 10, 432, HX, 422); g.quadraticCurveTo(HX - 10, 432, HX - 22, 420); g.closePath(); fl(g, col); st(g, 6);
  for (const y of [372, 400]) { g.beginPath(); g.moveTo(HX - 20, y); g.quadraticCurveTo(HX, y + 10, HX + 20, y); st(g, 3, '#c9bfae'); }
}
function bands(g) {   // a judge's / clerk's white bands
  for (const s of [-1, 1]) { g.beginPath(); g.rect(HX + (s < 0 ? -26 : 2), 336, 24, 84); fl(g, '#fbf8f2'); st(g, 5); }
}
function buttons(g, col = '#d9b45a', x = HX + 2) { for (const y of [400, 450, 500, 550, 600]) { circ(g, x, y, 8); fl(g, col); st(g, 3); } }
function apron(g, col = '#f1ebdd', y0 = 470) {
  g.beginPath(); g.moveTo(HX - 64, y0); g.lineTo(HX + 64, y0); g.lineTo(HX + 82, 680); g.quadraticCurveTo(HX, 700, HX - 82, 680); g.closePath(); fl(g, col); st(g, 6);
  g.beginPath(); g.moveTo(HX - 64, y0); g.lineTo(HX - 46, 352); g.moveTo(HX + 64, y0); g.lineTo(HX + 46, 352); st(g, 6, dk(col, 0.8));
  g.beginPath(); g.rect(HX - 30, 560, 60, 44); st(g, 4, dk(col, 0.75));
}
function skirt(g, col) {
  g.beginPath(); g.moveTo(HX - 96, 600); g.quadraticCurveTo(HX - 150, 800, HX - 160, 950); g.quadraticCurveTo(HX, 975, HX + 160, 950);
  g.quadraticCurveTo(HX + 150, 800, HX + 96, 600); g.closePath(); fl(g, col); st(g, 8);
  for (const x of [-70, 0, 70]) { g.beginPath(); g.moveTo(HX + x * 0.7, 640); g.quadraticCurveTo(HX + x * 1.1, 800, HX + x * 1.35, 950); st(g, 4, dk(col, 0.72)); }
}
function moustache(g, col = '#1e1714', big = 1) {
  const y = HY + 50;
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(HX, y); g.bezierCurveTo(HX + s * 30 * big, y - 18, HX + s * 62 * big, y - 4, HX + s * 76 * big, y - 24 * big);
    g.bezierCurveTo(HX + s * 70 * big, y + 16, HX + s * 30 * big, y + 20, HX, y + 8); g.closePath(); fl(g, col); st(g, 4);
  }
}
function specs(g) { for (const s of [-1, 1]) { circ(g, HX + s * 48, HY + 4, 36); st(g, 6); } g.beginPath(); g.moveTo(HX - 12, HY); g.quadraticCurveTo(HX, HY - 8, HX + 12, HY); st(g, 5); }
function tape(g) {   // a tailor's tape measure over the shoulders
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(HX + s * 40, 340); g.quadraticCurveTo(HX + s * 62, 420, HX + s * 56, 560); st(g, 22, INK); st(g, 15, '#f0cd4a');
    for (let y = 360; y < 550; y += 18) { g.beginPath(); g.moveTo(HX + s * (48 + (y - 340) * 0.05) - 5, y); g.lineTo(HX + s * (48 + (y - 340) * 0.05) + 5, y); st(g, 2, '#6a5418'); }
  }
}
function crown(g) {   // a crown of coins on top of the plumed hat (the "king" of the counterfeiters)
  // +30 keeps the points inside the card canvas (at -R * 1.38 their tips were cut flat by its top edge)
  const y0 = HY - R * 1.38 + 30;
  g.beginPath(); g.moveTo(HX - 70, y0 + 40);
  for (let i = 0; i <= 4; i++) { g.lineTo(HX - 70 + i * 35, y0 - (i % 2 ? -4 : 34)); if (i < 4) g.lineTo(HX - 52 + i * 35, y0 + 10); }
  g.lineTo(HX + 70, y0 + 40); g.closePath(); fl(g, '#f2c232'); st(g, 7);
  for (let i = 0; i < 3; i++) { circ(g, HX - 40 + i * 40, y0 + 26, 9); fl(g, '#c9474a'); st(g, 3); }
}
function bowtie(g, col) { for (const s of [-1, 1]) { g.beginPath(); g.moveTo(HX, 344); g.lineTo(HX + s * 34, 328); g.lineTo(HX + s * 34, 362); g.closePath(); fl(g, col); st(g, 5); } circ(g, HX, 344, 9); fl(g, dk(col, 0.8)); st(g, 4); }
function nametag(g) { g.beginPath(); g.rect(HX + 30, 430, 58, 30); fl(g, '#ffffff'); st(g, 4); g.beginPath(); g.moveTo(HX + 38, 445); g.lineTo(HX + 78, 445); st(g, 4, '#c9474a'); }

/** costume layer catalogue: each outfit lists back / front layer calls */
const LAYERS = { wigBack, wigFront, tricorn, slouch, plumed, toque, knitCap, mobCap, bun, bangs, ballcap, cravat, bands, buttons, apron, skirt, moustache, specs, tape, crown, bowtie, nametag };

// outfits: drawToon fields (jacket, pants, hair, hairStyle 'side' | none, collar, tie, pocket) + back / front layer lists
export const NEWTON = { jacket: '#6e4a3a', pants: '#4b3a33', back: [['wigBack', '#f1ede4', 1.2]], front: [['cravat'], ['buttons', '#d9b45a'], ['wigFront', '#f1ede4']] };
export const NEWTON_DISGUISED = { jacket: '#3a3a44', pants: '#2c2c33', back: [['wigBack', '#f1ede4', 0.7]], front: [['wigFront', '#f1ede4'], ['slouch', '#4a3b30'], ['moustache', '#1e1714', 1.15]] };
export const CLIPPER = { jacket: '#7b6a4a', pants: '#5a4c3c', front: [['knitCap', '#a5453a'], ['buttons', '#3a2c20', HX + 4]] };
export const BAKER = { jacket: '#e9dcc4', pants: '#8a7a64', front: [['apron', '#fbf8f2', 440], ['toque']] };
export const TAILOR = { jacket: '#5a6fa8', pants: '#3e4660', front: [['tape'], ['specs'], ['buttons', '#e0d6c0']] , hair: '#7a6a5e', hairStyle: 'side' };
export const KEEPER = { jacket: '#9c4f36', pants: '#4f3d30', front: [['apron', '#e9e0cc', 460], ['moustache', '#5a3a26', 0.9]] };
export const STALLWIFE = { jacket: '#5d8a6a', pants: '#4f6b58', front: [['skirt', '#5d8a6a'], ['apron', '#f1ebdd', 470], ['mobCap']] };
export const SHOPPER = { jacket: '#b2605e', pants: '#7f4645', front: [['skirt', '#a8585a'], ['mobCap']] };
export const CHALONER = { jacket: '#6b3d8f', pants: '#3b2a4d', back: [['wigBack', '#3a261c', 0.9]], front: [['cravat'], ['buttons', '#f2c232'], ['wigFront', '#3a261c'], ['plumed', '#2b2230', '#f3ead8']] };
export const CHALONER_KING = { ...CHALONER, front: [...CHALONER.front, ['crown']] };
export const JUDGE = { jacket: '#b3343a', pants: '#6e1f24', back: [['wigBack', '#f4f0e6', 1.5]], front: [['bands'], ['wigFront', '#f4f0e6']] };
export const MP = { jacket: '#2f4a6e', pants: '#283447', back: [['wigBack', '#c9b89a', 1.0]], front: [['cravat'], ['wigFront', '#c9b89a']] };
export const MP2 = { jacket: '#5a2f3f', pants: '#3a2630', back: [['wigBack', '#7a5a3c', 1.0]], front: [['cravat'], ['wigFront', '#7a5a3c'], ['tricorn', '#24202a']] };
export const WORKER = { jacket: '#6d5a48', pants: '#3f342c', front: [['apron', '#8a5a36', 450], ['knitCap', '#5a6a7a']] };
export const WARDER = { jacket: '#b02f34', pants: '#2c2430', front: [['buttons', '#f2c232'], ['tricorn', '#1f1b22', '#f2c232']] };
export const CLERKX = { jacket: '#4a5a4a', pants: '#363d36', back: [['wigBack', '#d8ccb2', 0.8]], front: [['bands'], ['wigFront', '#d8ccb2'], ['specs']] };
export const CASHIER = { jacket: '#2f8a7a', pants: '#3a3f4a', front: [['nametag'], ['ballcap', '#e0533f']] };
export const CUSTOMER = { jacket: '#e7a43c', pants: '#3d4a6a', front: [['bangs', '#5a3524']] };

function layers(g, list, s) { OL = s.ol ?? 1; for (const [name, ...args] of list || []) LAYERS[name](g, ...args); }
/** draw one costumed toon (back layers, cards.js body + face, front layers) */
export function drawCostumed(g, o, s) {
  layers(g, o.back, s);
  drawToon(g, o, { ...s, extra: (gg) => { layers(gg, o.front, s); if (s.extra) s.extra(gg); } });
}

const q = (v, n = 40) => (typeof v === 'number' ? Math.round(v * n) / n : v);
/** makeToon (cards.js) with costume layers: same API ({root, pivot, mesh, mat, set, face, H}) */
export function makeToonX(outfit, { H = 1.9, res = 1.2, shadow = false, maxCache = 6 } = {}) {
  const root = new THREE.Group();
  const blank = new THREE.CanvasTexture(document.createElement('canvas'));
  const mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6 * H, H), mat);
  mesh.position.y = 0.475 * H; mesh.layers.set(NOINK); mesh.receiveShadow = true; mesh.castShadow = shadow;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
  const pivot = new THREE.Group(); pivot.add(mesh); root.add(pivot);
  const cache = new Map();
  let curKey = '', sunAngle = -PI / 4;
  function set(state) {
    state = { light: sunAngle, ...state };
    const key = JSON.stringify(state, (k, v) => (k === 'extra' ? undefined : q(v)));
    if (key === curKey) return;
    curKey = key;
    let e = cache.get(key);
    if (!e) {
      // a full render makes a new pose almost every frame: recycle the oldest canvas + texture instead of allocating
      // (fresh 6-16 MB canvases per frame crashed the headless tab after ~120 frames in dh013)
      if (cache.size >= maxCache) { const [k0, e0] = cache.entries().next().value; cache.delete(k0); e = e0; }
      else {
        const cv = document.createElement('canvas'); cv.width = Math.round(600 * res); cv.height = Math.round(1000 * res);
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
        e = { tex };
      }
      const cv = e.tex.image, g = cv.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.scale(res, res); drawCostumed(g, outfit, state);
      e.tex.needsUpdate = true; cache.set(key, e);
    }
    mat.map = e.tex; mesh.customDepthMaterial.map = e.tex; mat.needsUpdate = true; mesh.customDepthMaterial.needsUpdate = true;
  }
  /** yaw billboard; with `sun` (DirectionalLight) the painted lit side follows the sun's screen direction (toon look v2:
   *  call face(camera, sun) BEFORE set(), as cards.js makeToon does) */
  function face(camera, sun) {
    const p = root.getWorldPosition(new THREE.Vector3()), c = camera.getWorldPosition(new THREE.Vector3());
    pivot.rotation.y = Math.atan2(c.x - p.x, c.z - p.z) - root.rotation.y;
    if (sun) {
      const d = sun.getWorldPosition(new THREE.Vector3()).sub(sun.target.getWorldPosition(new THREE.Vector3())).normalize();
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      sunAngle = Math.round(Math.atan2(-d.dot(up), d.dot(right)) / (PI / 4)) * (PI / 4);
    }
  }
  return { root, pivot, mesh, mat, set, face, H };
}
/** world point just in front of a card point (u, v) toward the camera: props held "in" a drawn hand */
export function handFront(toon, u, v, camera, d = 0.04, out = new THREE.Vector3()) {
  const k = toon.H / 1000;
  out.set((u - 300) * k, (500 - v) * k, 0).applyMatrix4(toon.mesh.matrixWorld);
  const c = camera.getWorldPosition(new THREE.Vector3());
  return out.addScaledVector(c.sub(out).normalize(), d);
}

// ---------------------------------------------------------------- zoom-dissolve between places
/** A frozen frame of the outgoing shot (rendered once into a 2D canvas under the captions) that scales up + fades out
 *  over the incoming shot. render(prevT) must pose + render the outgoing shot; returns {update(t, cut, render)}. */
export function makeDissolve({ dur = 0.45, zoom = 0.22 } = {}) {
  const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920;
  cv.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:0;transform-origin:50% 45%;';
  const ui = document.getElementById('ui'); ui.insertBefore(cv, ui.firstChild);
  const g = cv.getContext('2d'), gl = document.getElementById('gl');
  let have = null;
  return {
    /** cut = time of the cut into this shot, or null (no dissolve); renderPrev() renders the outgoing frame */
    update(t, cut, renderPrev) {
      const k = cut === null ? 1 : (t - cut) / dur;
      if (k < 0 || k >= 1) { cv.style.opacity = 0; return; }
      if (have !== cut) { renderPrev(); g.drawImage(gl, 0, 0, 1080, 1920); have = cut; }
      const e = k * k * (3 - 2 * k);
      cv.style.opacity = (1 - e).toFixed(3); cv.style.transform = `scale(${(1 + zoom * e).toFixed(4)})`;
    },
  };
}
