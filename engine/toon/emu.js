// Cartoon emus for the toon look (dh014): Canvas2D drawings on camera-facing cards, same ink + light rules as
// cards.js's people (round ring eyes, thick near-black outline, flat colour + one soft gradient, lit by the scene).
// Design space 1000 x 1000 units, feet on y = 975 (the card's base). Side views face +x (flip = mirror).
//   drawEmu(g, s)          one emu into a 1000 x 1000 design space
//   makeEmu({H, res})      a hero card: set(state) + face(camera), like makeToon
//   makeEmuFlock(max, o)   hundreds of emus = one InstancedMesh per drawing frame (run/walk cycles are 8 frames),
//                          begin(camera) / add(x, y, z, o) / end(): yaw-billboarded, mirrored by heading, contact blobs.
// state: { view: 'side'|'front', pose: 'stand'|'walk'|'run'|'peck'|'stare', ph (cycle phase, rad), k (peck 0..1),
//          eye: 'ring'|'lid'|'wide'|'shut', brow: null|'smug'|'angry'|'up', look (-1..1), hat: null|'slouch',
//          medal, light (rad), ol (ink scale) }
import * as THREE from 'three';
import { NOINK } from './ink.js';
import { cardShade } from './shade.js';
import { INK } from './cards.js';

const TAU = Math.PI * 2;
const C = { body: '#7a6352', bodyDk: '#4f3f33', bodyLt: '#9a826e', neck: '#7c8bab', neckDk: '#55607e', head: '#5c6784',
  cheek: '#93a3c6', beak: '#d6ad70', leg: '#9a8c7e', legDk: '#6f6359' };
const sh = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
let OLK = 1;
function stroke(g, w, col = INK) { g.lineWidth = w * OLK; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function fill(g, col) { g.fillStyle = col; g.fill(); }
function ell(g, x, y, rx, ry = rx, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); }
const lerp = (a, b, t) => a + (b - a) * t;

/** shaggy body: an ellipse whose lower / back half breaks into pointed feather tips */
function bodyPath(g, cx, cy, rx, ry, rot, { front = false, n = 34 } = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, ca = Math.cos(a), sa = Math.sin(a);
    const shag = front ? sa > -0.2 : (sa > -0.05 || ca < -0.55);   // bottom (+ the rump on a side view)
    const tip = shag && i % 2 === 0;
    let x = ca * rx * (tip ? 1.07 : 1), y = sa * ry * (tip ? 1.1 : 1);
    if (tip) y += 16;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot), tip]);
  }
  g.beginPath();
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let m0 = mid(pts[n - 1], pts[0]); g.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n], m = mid(p, q);
    if (p[2]) { g.lineTo(p[0], p[1]); g.lineTo(m[0], m[1]); } else g.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  g.closePath();
}
function bodyFill(g, x0, y0, x1, y1) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, C.bodyLt); gr.addColorStop(0.45, C.body); gr.addColorStop(1, C.bodyDk);
  g.fillStyle = gr; g.fill();
}
/** a few darker feather V-strokes inside the body (call while clipped to it) */
function feathers(g, cx, cy, rx, ry, seed = 1) {
  g.strokeStyle = sh(C.bodyDk, 0.85); g.lineWidth = 6 * OLK; g.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    const u = ((i * 0.618 + seed * 0.13) % 1), v = ((i * 0.381 + seed * 0.29) % 1);
    const x = cx + (u - 0.5) * rx * 1.6, y = cy + (v - 0.35) * ry * 1.4;
    g.beginPath(); g.moveTo(x - 16, y - 12); g.quadraticCurveTo(x - 4, y + 6, x, y + 16); g.quadraticCurveTo(x + 4, y + 6, x + 16, y - 12); g.stroke();
  }
}
/** tapered neck along a quadratic B -> Q -> H, width w0 -> w1 */
function neck(g, B, Q, H, w0, w1) {
  const n = 18, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = (1 - t) ** 2 * B[0] + 2 * (1 - t) * t * Q[0] + t * t * H[0], y = (1 - t) ** 2 * B[1] + 2 * (1 - t) * t * Q[1] + t * t * H[1];
    const dx = 2 * (1 - t) * (Q[0] - B[0]) + 2 * t * (H[0] - Q[0]), dy = 2 * (1 - t) * (Q[1] - B[1]) + 2 * t * (H[1] - Q[1]);
    const d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, t) / 2;
    L.push([x - (dy / d) * w, y + (dx / d) * w]); R.push([x + (dy / d) * w, y - (dx / d) * w]);
  }
  g.beginPath(); g.moveTo(...L[0]); for (const p of L) g.lineTo(...p); for (const p of R.reverse()) g.lineTo(...p); g.closePath();
  const gr = g.createLinearGradient(B[0], B[1], H[0], H[1]);
  gr.addColorStop(0, C.body); gr.addColorStop(0.3, C.neckDk); gr.addColorStop(0.55, C.neck); gr.addColorStop(1, C.neck);
  g.fillStyle = gr; g.fill(); stroke(g, 9);
}
function eyeAt(g, x, y, r, s, side = 1) {
  const kind = s.blink >= 0.99 ? 'shut' : s.eye || 'ring', look = s.look ?? 0.5;
  if (kind === 'shut') { g.beginPath(); g.arc(x, y + 2, r * 0.8, 0.15 * Math.PI, 0.85 * Math.PI); stroke(g, 7); return; }
  ell(g, x, y, r, r * 1.05); fill(g, '#ffffff'); stroke(g, 5);
  const pr = kind === 'wide' ? r * 0.26 : r * 0.38;
  ell(g, x + look * r * 0.4, y + 2, pr); fill(g, INK);
  const lid = kind === 'lid' ? 0.5 : (s.blink || 0);
  if (lid > 0) {
    g.save(); ell(g, x, y, r, r * 1.05); g.clip(); g.fillStyle = C.head; g.fillRect(x - r - 2, y - r - 4, 2 * r + 4, (2 * r + 4) * lid + 2); g.restore();
    g.beginPath(); g.moveTo(x - r, y - r * 1.05 + 2 * r * lid); g.lineTo(x + r, y - r * 1.05 + 2 * r * lid - side * 2); stroke(g, 6);
  }
}
function brows(g, s, pts) {   // pts: [[x0,y0,x1,y1], ...] one per eye, outer -> inner
  if (!s.brow) return;
  for (const [x0, y0, x1, y1] of pts) {
    g.beginPath();
    if (s.brow === 'angry') { g.moveTo(x0, y0 - 8); g.lineTo(x1, y1 + 8); }
    else if (s.brow === 'up') { g.moveTo(x0, y0 - 2); g.quadraticCurveTo((x0 + x1) / 2, y0 - 16, x1, y1 - 6); }
    else { g.moveTo(x0, y0 + 2); g.quadraticCurveTo((x0 + x1) / 2, y0 - 10, x1, y1 - 8); }   // smug: raised arch
    stroke(g, 9);
  }
}
function crest(g, x, y, s = 1) {   // a little mohawk of dark crown feathers
  g.beginPath();
  for (const [dx, h, a] of [[-18, 30, -0.5], [-4, 38, -0.15], [10, 32, 0.2]]) { g.moveTo(x + dx * s, y); g.lineTo(x + dx * s + Math.sin(a) * h * s, y - h * s); }
  stroke(g, 10); g.beginPath();
  for (const [dx, h, a] of [[-18, 30, -0.5], [-4, 38, -0.15], [10, 32, 0.2]]) { g.moveTo(x + dx * s, y); g.lineTo(x + dx * s + Math.sin(a) * h * s, y - h * s); }
  stroke(g, 4, '#2c2a36');
}
export function slouch(g, x, y, r, side = 1) {   // a period slouch hat, brim pinned up on one side (no badge)
  const col = '#a08b5e', band = '#4a3c2a';
  g.beginPath(); g.ellipse(x, y + r * 0.05, r * 1.55, r * 0.3, 0, 0, TAU); fill(g, sh(col, 0.92)); stroke(g, 7);
  g.beginPath(); g.moveTo(x - side * r * 1.5, y); g.quadraticCurveTo(x - side * r * 1.7, y - r * 0.9, x - side * r * 0.6, y - r * 0.55); g.lineTo(x - side * r * 0.4, y); g.closePath(); fill(g, sh(col, 0.85)); stroke(g, 6);
  g.beginPath(); g.moveTo(x - r * 0.82, y); g.bezierCurveTo(x - r * 0.9, y - r * 1.05, x + r * 0.9, y - r * 1.05, x + r * 0.82, y); g.closePath(); fill(g, col); stroke(g, 7);
  g.beginPath(); g.moveTo(x - r * 0.84, y - r * 0.08); g.quadraticCurveTo(x, y + r * 0.02, x + r * 0.84, y - r * 0.08); g.lineTo(x + r * 0.86, y - r * 0.3); g.quadraticCurveTo(x, y - r * 0.22, x - r * 0.86, y - r * 0.3); g.closePath(); fill(g, band); stroke(g, 5);
}
function medal(g, x, y, r) {
  g.beginPath(); g.moveTo(x - r * 0.9, y - r * 2.6); g.lineTo(x - r * 0.35, y - r * 0.6); g.lineTo(x + r * 0.35, y - r * 0.6); g.lineTo(x + r * 0.9, y - r * 2.6); g.closePath();
  fill(g, '#c0392b'); stroke(g, 5);
  g.beginPath(); g.moveTo(x - r * 0.15, y - r * 2.6); g.lineTo(x - r * 0.05, y - r * 0.6); g.lineTo(x + r * 0.05, y - r * 0.6); g.lineTo(x + r * 0.15, y - r * 2.6); fill(g, '#f3e6b0');
  ell(g, x, y, r); const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); gr.addColorStop(0, '#fff2a8'); gr.addColorStop(0.6, '#f0c040'); gr.addColorStop(1, '#b8861e');
  g.fillStyle = gr; g.fill(); stroke(g, 6);
  g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.25 : r * 0.55; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); fill(g, '#fff6c8'); stroke(g, 3);
}

// ---------------------------------------------------------------- side view (faces +x)
function legSide(g, hip, foot, far) {
  const L1 = 175, L2 = 180, dx = foot[0] - hip[0], dy = foot[1] - hip[1];
  let d = Math.hypot(dx, dy); const dm = Math.min(d, L1 + L2 - 2);
  const ux = dx / d, uy = dy / d; d = dm;
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const px = hip[0] + ux * a, py = hip[1] + uy * a, ax = px - uy * h, ay = py + ux * h;   // ankle bends backward (-x)
  const fx = hip[0] + ux * d, fy = hip[1] + uy * d;
  const col = far ? C.legDk : C.leg;
  g.beginPath(); g.moveTo(...hip); g.lineTo(ax, ay); g.lineTo(fx, fy); stroke(g, 36); stroke(g, 21, col);
  g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + 46, fy + 10); g.moveTo(fx, fy); g.lineTo(fx + 30, fy + 18); g.moveTo(fx, fy); g.lineTo(fx - 16, fy + 10);
  stroke(g, 15); stroke(g, 7, col);
}
function headSide(g, s, hx, hy, ang) {
  g.save(); g.translate(hx, hy); g.rotate(ang);
  // beak first (the head overlaps its base)
  g.beginPath(); g.moveTo(26, -14); g.quadraticCurveTo(70, -14, 96, -2); g.quadraticCurveTo(102, 8, 92, 14); g.quadraticCurveTo(60, 22, 24, 16); g.closePath();
  fill(g, C.beak); stroke(g, 7);
  g.beginPath(); g.moveTo(34, 4); g.quadraticCurveTo(64, 8, 92, 5); stroke(g, 4);
  crest(g, -6, -40, 1);
  ell(g, 0, 0, 58, 48);
  const gr = g.createRadialGradient(-10, -16, 4, 0, 0, 70); gr.addColorStop(0, sh(C.head, 1.25)); gr.addColorStop(1, sh(C.head, 0.85)); g.fillStyle = gr; g.fill();
  ell(g, -12, 10, 26, 20); fill(g, C.cheek);
  ell(g, 0, 0, 58, 48); stroke(g, 9);
  eyeAt(g, 16, -8, 21, s, 1);
  brows(g, s, [[0, -36, 34, -34]]);
  if (s.hat === 'slouch') slouch(g, -4, -46, 54, -1);
  g.restore();
}
function headFront(g, s, hx, hy, R = 54) {
  // beak front-on: a wide flat oval under the eyes
  crest(g, hx, hy - R * 0.86, 1);
  ell(g, hx, hy, R, R * 0.92);
  const gr = g.createRadialGradient(hx - 14, hy - 18, 4, hx, hy, R * 1.3); gr.addColorStop(0, sh(C.head, 1.25)); gr.addColorStop(1, sh(C.head, 0.85)); g.fillStyle = gr; g.fill();
  ell(g, hx - R * 0.55, hy + R * 0.25, R * 0.3, R * 0.24); fill(g, C.cheek); ell(g, hx + R * 0.55, hy + R * 0.25, R * 0.3, R * 0.24); fill(g, C.cheek);
  ell(g, hx, hy, R, R * 0.92); stroke(g, 9);
  eyeAt(g, hx - R * 0.38, hy - R * 0.12, R * 0.36, s, -1); eyeAt(g, hx + R * 0.38, hy - R * 0.12, R * 0.36, s, 1);
  brows(g, s, [[hx - R * 0.68, hy - R * 0.62, hx - R * 0.14, hy - R * 0.6], [hx + R * 0.68, hy - R * 0.62, hx + R * 0.14, hy - R * 0.6]]);
  if (s.hat === 'slouch') slouch(g, hx, hy - R * 0.72, R * 0.95, 1);
  ell(g, hx, hy + R * 0.5, R * 0.52, R * 0.22); fill(g, C.beak); stroke(g, 7);
  g.beginPath(); g.moveTo(hx - R * 0.42, hy + R * 0.5); g.quadraticCurveTo(hx, hy + R * (s.eye === 'lid' ? 0.62 : 0.56), hx + R * 0.42, hy + R * 0.48); stroke(g, 4);
}
function drawSide(g, s) {
  const pose = s.pose || 'stand', ph = s.ph || 0;
  let stride = 0, lift = 0, bob = 0, tilt = -0.05, head = [700, 178], q = [598, 300], hang = 0.1;
  if (pose === 'walk') { stride = 80; lift = 55; bob = 8 * Math.abs(Math.sin(ph)); head = [702 + 22 * Math.sin(2 * ph), 182]; q = [600 + 10 * Math.sin(2 * ph), 300]; }
  if (pose === 'run') { stride = 175; lift = 120; bob = -24 * Math.abs(Math.cos(ph)) + 12; tilt = 0.14; head = [810, 300]; q = [700, 330]; hang = 0.32; }
  if (pose === 'peck') { const k = s.k || 0; head = [lerp(700, 812, k), lerp(178, 850, k)]; q = [lerp(598, 800, k), lerp(300, 470, k)]; hang = lerp(0.1, 1.5, k); tilt = lerp(-0.05, 0.12, k); }
  const hipY = 640 + bob;
  // far leg (behind the body), body, near leg
  const foot = (sd) => {
    if (!stride) return [sd < 0 ? 452 : 418, 958];
    const p = ph + (sd < 0 ? Math.PI : 0);
    return [432 + stride * Math.sin(p), 958 - lift * Math.max(0, Math.cos(p))];
  };
  legSide(g, [418, hipY], foot(-1), true);
  // neck behind the body's front edge, head on top of everything
  neck(g, [560, 480 + bob], [q[0], q[1] + bob], [head[0] - 30, head[1] + 18 + bob * 0.5], 70, 34);
  g.save(); bodyPath(g, 400, 548 + bob, 222, 152, tilt); bodyFill(g, 0, 400, 0, 720); g.clip(); feathers(g, 400, 548 + bob, 222, 152, 3); g.restore();
  bodyPath(g, 400, 548 + bob, 222, 152, tilt); stroke(g, 9);
  // thigh fluff over the near hip
  g.beginPath(); g.ellipse(456, hipY - 20, 64, 52, 0.3, 0, TAU); bodyFill(g, 0, hipY - 70, 0, hipY + 30); stroke(g, 8);
  legSide(g, [452, hipY], foot(1), false);
  if (s.medal) medal(g, 578, 520 + bob, 34);
  if (pose === 'stare') headFront(g, s, head[0] - 10, head[1] - 6 + bob * 0.5);
  else headSide(g, s, head[0], head[1] + bob * 0.5, hang);
}

// ---------------------------------------------------------------- front view (walking toward the lens)
function drawFront(g, s) {
  const walking = s.pose === 'walk' || s.pose === 'run', ph = s.ph || 0;
  const sway = walking ? Math.sin(ph) : 0, bob = walking ? 10 * Math.abs(Math.cos(ph)) : 0;
  for (const sd of [-1, 1]) {
    const up = walking ? 70 * Math.max(0, Math.sin(ph + (sd < 0 ? 0 : Math.PI))) : 0;
    const hx = 500 + sd * 52 + sway * 8, fx = 500 + sd * 62, fy = 958 - up;
    g.beginPath(); g.moveTo(hx, 650 + bob); g.quadraticCurveTo(hx + sd * (18 + up * 0.4), (650 + fy) / 2, fx, fy);
    stroke(g, 36); stroke(g, 21, sd < 0 ? C.legDk : C.leg);
    g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx - 28, fy + 18); g.moveTo(fx, fy); g.lineTo(fx, fy + 22); g.moveTo(fx, fy); g.lineTo(fx + 28, fy + 18);
    stroke(g, 15); stroke(g, 7, C.leg);
  }
  const bx = 500 + sway * 14, by = 530 + bob, rot = sway * 0.05;
  neck(g, [bx, 430 + bob], [bx + sway * 6, 300 + bob], [500 + sway * 10, 200 + bob], 76, 38);
  g.save(); bodyPath(g, bx, by, 190, 168, rot, { front: true }); bodyFill(g, 0, 370, 0, 700); g.clip(); feathers(g, bx, by, 190, 168, 5); g.restore();
  bodyPath(g, bx, by, 190, 168, rot, { front: true }); stroke(g, 9);
  if (s.back) { headBack(g, 500 + sway * 10, 158 + bob); return; }
  if (s.medal) medal(g, bx, 440 + bob, 36);
  headFront(g, s, 500 + sway * 10, 158 + bob);
}
function headBack(g, hx, hy, R = 54) {
  ell(g, hx, hy, R, R * 0.92);
  const gr = g.createRadialGradient(hx - 14, hy - 18, 4, hx, hy, R * 1.3); gr.addColorStop(0, sh(C.head, 1.15)); gr.addColorStop(1, sh(C.head, 0.8)); g.fillStyle = gr; g.fill();
  ell(g, hx, hy, R, R * 0.92); stroke(g, 9);
  crest(g, hx, hy - R * 0.86, 1);
}

export function drawEmu(g, s = {}) {
  OLK = s.ol ?? 1;
  if (s.view === 'front' || s.view === 'back') drawFront(g, { ...s, back: s.view === 'back' }); else drawSide(g, s);
}

// ---------------------------------------------------------------- hero card
const q = (v, n = 40) => (typeof v === 'number' ? Math.round(v * n) / n : v);
export function makeEmu({ H = 1.8, res = 0.9, maxCache = 24, shadow = true } = {}) {
  const root = new THREE.Group();
  const blank = new THREE.CanvasTexture(document.createElement('canvas'));
  const mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(H, H), mat);
  mesh.position.y = 0.475 * H; mesh.layers.set(NOINK); mesh.receiveShadow = true; mesh.castShadow = shadow;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
  const pivot = new THREE.Group(); pivot.add(mesh); root.add(pivot);
  const cache = new Map();
  let cur = '';
  function set(state) {
    const { flip, ...st } = state;
    mesh.scale.x = flip ? -1 : 1;
    const key = JSON.stringify(st, (k, v) => q(v));
    if (key === cur) return;
    cur = key;
    let tex = cache.get(key);
    if (!tex) {
      const cv = document.createElement('canvas'); cv.width = cv.height = Math.round(1000 * res);
      const g = cv.getContext('2d'); g.scale(res, res); drawEmu(g, st);
      tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; cache.set(key, tex);
      if (cache.size > maxCache) { const [k0, t0] = cache.entries().next().value; if (k0 !== key) { t0.dispose(); cache.delete(k0); } }
    }
    mat.map = tex; mat.needsUpdate = true; mesh.customDepthMaterial.map = tex; mesh.customDepthMaterial.needsUpdate = true;
  }
  function face(camera) {
    const p = root.getWorldPosition(new THREE.Vector3()), c = camera.getWorldPosition(new THREE.Vector3());
    pivot.rotation.y = Math.atan2(c.x - p.x, c.z - p.z) - root.rotation.y;
  }
  return { root, pivot, mesh, mat, set, face, H };
}

// ---------------------------------------------------------------- instanced flock
/** frame key for a flock member: 8-frame walk / run cycles, 4-frame peck */
function frameOf(o) {
  const view = o.view || 'side', pose = o.pose || 'stand';
  const cyc = (n) => ((Math.floor(((o.ph || 0) / TAU) * n) % n) + n) % n;
  if (pose === 'walk' || pose === 'run') return `${view}|${pose}|${cyc(8)}|${o.eye || ''}|${o.brow || ''}`;
  if (pose === 'peck') return `${view}|peck|${Math.round((o.k || 0) * 3)}|${o.eye || ''}|`;
  return `${view}|${pose}||${o.eye || ''}|${o.brow || ''}`;
}
function stateOf(key) {
  const [view, pose, f, eye, brow] = key.split('|');
  const s = { view, pose, eye: eye || 'ring', brow: brow || null, look: 0.5 };
  if (pose === 'walk' || pose === 'run') s.ph = ((+f + 0.5) / 8) * TAU;
  if (pose === 'peck') s.k = +f / 3;
  return s;
}
/** max emus; H = card height (m); res = canvas px per design unit; blob = contact shadow darkness (0 = none) */
export function makeEmuFlock(max = 600, { H = 1.8, res = 0.34, blob = 0.62, ol = 1.25, shadow = true } = {}) {
  const root = new THREE.Group();
  const geo = new THREE.PlaneGeometry(H, H); geo.translate(0, 0.475 * H, 0);
  const meshes = new Map();
  function meshFor(key) {
    let m = meshes.get(key);
    if (m) return m;
    const cv = document.createElement('canvas'); cv.width = cv.height = Math.round(1000 * res);
    const g = cv.getContext('2d'); g.scale(res, res); drawEmu(g, { ...stateOf(key), ol });
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mat = cardShade(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    m = new THREE.InstancedMesh(geo, mat, max); m.count = 0; m.layers.set(NOINK); m.receiveShadow = true; m.frustumCulled = false; m.castShadow = shadow;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
    m.userData.n = 0; root.add(m); meshes.set(key, m);
    return m;
  }
  // contact blobs (multiply), one instanced mesh
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  { const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32), v = Math.round(255 * blob);
    gr.addColorStop(0, `rgb(${v},${v},${Math.round(v * 1.06)})`); gr.addColorStop(1, '#fff'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  const bgeo = new THREE.PlaneGeometry(1, 1); bgeo.rotateX(-Math.PI / 2);
  const blobs = new THREE.InstancedMesh(bgeo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), depthWrite: false, toneMapped: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), max);
  blobs.layers.set(NOINK); blobs.renderOrder = 1; blobs.frustumCulled = false; blobs.count = 0; root.add(blobs);
  if (!blob) blobs.visible = false;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const cam = new THREE.Vector3(), right = new THREE.Vector3();
  let nb = 0;
  return {
    root, meshes,
    /** call after the camera is placed for this frame */
    begin(camera) {
      for (const m of meshes.values()) m.userData.n = 0;
      nb = 0;
      root.updateMatrixWorld(true);
      camera.getWorldPosition(cam); root.worldToLocal(cam);
      right.set(1, 0, 0).applyQuaternion(camera.quaternion);   // roots are never rotated: world right = local right
    },
    /** o: state (view/pose/ph/k/eye/brow) + hd (heading yaw: 0 = +z) + s (scale) + flip (force) + noBlob */
    add(x, y, z, o = {}) {
      const m = meshFor(frameOf(o)), s = o.s ?? 1;
      let flip = o.flip;
      if (flip === undefined) flip = (o.view || 'side') === 'side' && (Math.sin(o.hd || 0) * right.x + Math.cos(o.hd || 0) * right.z) < 0;
      Q.setFromAxisAngle(Y, Math.atan2(cam.x - x, cam.z - z));
      M.compose(P.set(x, y, z), Q, S.set(flip ? -s : s, s, s));
      if (m.userData.n < max) m.setMatrixAt(m.userData.n++, M);
      if (!o.noBlob && nb < max) {
        M.compose(P.set(x, y + 0.004, z), Q.identity(), S.set(H * 0.52 * s, 1, H * 0.3 * s));
        blobs.setMatrixAt(nb++, M);
      }
    },
    end() {
      for (const m of meshes.values()) { m.count = m.userData.n; m.instanceMatrix.needsUpdate = true; }
      blobs.count = nb; blobs.instanceMatrix.needsUpdate = true;
    },
  };
}
