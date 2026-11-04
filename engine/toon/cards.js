// Flat 2D cartoon characters (round heads, dot / ring eyes, stick arms, ball hands, tube legs, thick dark outline)
// drawn with Canvas2D onto camera-facing cards that the 3D scene lights (cardShade: tint + cast shadows such as
// window blinds across a face). Construction ideas from templates/bridge/toon.ts + cast.ts of
// github.com/mromidev/claude-animated-shorts (MIT); the drawings are our own.
// Design space: 600 x 1000 units, soles at y = 975, head centre (300, 215), R = 148. A card is H metres tall
// (1000 units). Cards live on layer NOINK: the world ink pass never outlines their rectangles.
import * as THREE from 'three';
import { NOINK } from './ink.js';
import { cardShade } from './shade.js';

export const INK = '#17121a';
const HX = 300, HY = 215, R = 148;
const TAU = Math.PI * 2;

/** reusable outfits (any field can be overridden) */
export const CLERK = { jacket: '#e4a83a', pants: '#ddd2c2', hair: '#2a1e19', hairStyle: 'side', tie: '#7c4a30', collar: true, pocket: true };
export const GUARD = { jacket: '#2f4c9e', pants: '#2d3550', cap: '#2a3f86', capBand: '#1c2a5c', star: '#f2c232', badge: true };

const shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };

let OLK = 1;   // ink width scale for this drawing (close-ups: the reference keeps lines ~constant on screen)
function stroke(g, w, col = INK) { g.lineWidth = w * OLK; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function fill(g, col) { g.fillStyle = col; g.fill(); }
function circle(g, x, y, rx, ry = rx, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); }
/** filled shape with a gradient away from the light (lit edge = base, far edge = shadow) */
function litFill(g, x0, y0, x1, y1, base, dark, light) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.hypot(x1 - x0, y1 - y0) / 2, dx = Math.cos(light), dy = Math.sin(light);
  const gr = g.createLinearGradient(cx + dx * r, cy + dy * r, cx - dx * r, cy - dy * r);
  gr.addColorStop(0, base); gr.addColorStop(0.45, base); gr.addColorStop(1, dark);
  g.fillStyle = gr; g.fill();
}

// ---------------------------------------------------------------- body
function legs(g, o, s) {
  const ph = s.walk ?? null, st = s.stride ?? 34;
  for (const side of [-1, 1]) {
    const sw = ph === null ? 0 : Math.sin(ph + (side < 0 ? 0 : Math.PI));
    const lift = ph === null ? 0 : Math.max(0, -Math.cos(ph + (side < 0 ? 0 : Math.PI))) * 26;
    const hx = HX + side * 28, hy = 600, fx = HX + side * 40 + sw * st, fy = 958 - lift;
    const kx = (hx + fx) / 2 + side * 6, ky = (hy + fy) / 2;
    g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo(kx, ky, fx, fy);
    stroke(g, 26, INK); stroke(g, 13, o.pants);
    // shoe: a small ink oval pointing outward
    circle(g, fx + side * 14, fy + 8, 25, 12, side * 0.12); fill(g, INK);
  }
}
function torso(g, o, s) {
  const L = s.light;
  g.beginPath();
  g.moveTo(HX - 62, 335);
  g.bezierCurveTo(HX - 92, 410, HX - 112, 540, HX - 96, 610);
  g.bezierCurveTo(HX - 80, 660, HX + 80, 660, HX + 96, 610);
  g.bezierCurveTo(HX + 112, 540, HX + 92, 410, HX + 62, 335);
  g.closePath();
  litFill(g, HX - 110, 330, HX + 110, 660, o.jacket, shade(o.jacket, 0.72), L);
  stroke(g, 9);
  g.save(); g.clip();
  if (o.collar) { // white shirt V + tie
    g.beginPath(); g.moveTo(HX - 34, 330); g.lineTo(HX, 430); g.lineTo(HX + 34, 330); g.closePath(); fill(g, '#f4f1ec'); stroke(g, 6);
  }
  if (o.tie) {
    g.beginPath(); g.moveTo(HX - 11, 360); g.lineTo(HX + 11, 360); g.lineTo(HX + 17, 520); g.lineTo(HX, 545); g.lineTo(HX - 17, 520); g.closePath();
    fill(g, o.tie);
    g.save(); g.clip(); g.strokeStyle = shade(o.tie, 1.45); g.lineWidth = 7;
    for (let y = 360; y < 560; y += 26) { g.beginPath(); g.moveTo(HX - 20, y + 10); g.lineTo(HX + 20, y - 8); g.stroke(); }
    g.restore(); g.beginPath(); g.moveTo(HX - 11, 360); g.lineTo(HX + 11, 360); g.lineTo(HX + 17, 520); g.lineTo(HX, 545); g.lineTo(HX - 17, 520); g.closePath(); stroke(g, 5);
  }
  if (o.pocket) {
    g.beginPath(); g.rect(HX + 30, 445, 46, 50); stroke(g, 4, shade(o.jacket, 0.6));
    g.beginPath(); g.moveTo(HX + 44, 452); g.lineTo(HX + 44, 418); stroke(g, 9, INK); stroke(g, 5, '#3d6fc4');
  }
  if (o.badge) {
    star(g, HX - 48, 440, 17, o.star || '#f2c232');
    g.beginPath(); g.moveTo(HX, 345); g.lineTo(HX, 640); stroke(g, 4, shade(o.jacket, 0.6));
    for (const y of [420, 490, 560]) { circle(g, HX + 14, y, 6); fill(g, '#d9c27a'); }
  }
  g.restore();
}
function star(g, x, y, r, col) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); fill(g, col); stroke(g, 4);
}
const SHOULDER = { L: [HX - 70, 400], R: [HX + 70, 400] };
export const ARMS = {
  down: { L: [HX - 128, 600], R: [HX + 128, 600], bend: 10 },
  clasp: { L: [HX - 8, 590], R: [HX + 14, 596], bend: -30 },
  hips: { L: [HX - 112, 560], R: [HX + 112, 560], bend: 60 },
};
function arms(g, s) {
  const a = s.arms || ARMS.down;
  for (const k of ['L', 'R']) {
    if (!a[k]) continue;   // null = that arm is a 3D stick (makeStickArm) reaching a prop in front of the card
    const [sx, sy] = SHOULDER[k], [hx, hy] = a[k], side = k === 'L' ? -1 : 1, b = (a.bend ?? 10) * side;
    const mx = (sx + hx) / 2 + b, my = (sy + hy) / 2;
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(mx, my, hx, hy); stroke(g, 13);
    circle(g, hx, hy, a.hand ?? 21); fill(g, INK);
  }
}

// ---------------------------------------------------------------- head + face
function head(g, o, s) {
  const L = s.light, gx = HX + Math.cos(L) * 0.45 * R, gy = HY + Math.sin(L) * 0.45 * R;
  circle(g, HX, HY, R, R * 0.965);
  const gr = g.createRadialGradient(gx, gy, 0, gx, gy, 1.32 * R);
  gr.addColorStop(0, o.skin || '#f5f3f7'); gr.addColorStop(0.62, o.skin || '#f5f3f7'); gr.addColorStop(1, o.skinShade || '#bdb6c9');
  g.fillStyle = gr; g.fill();
  if (o.hairStyle === 'side') hairSide(g, o, s);
  circle(g, HX, HY, R, R * 0.965); stroke(g, 10);
  if (o.hairStyle === 'side') { // cowlick + the part line over the outline
    g.beginPath(); g.moveTo(HX - 6, HY - R * 0.97); g.quadraticCurveTo(HX - 2, HY - R * 1.12, HX + 14, HY - R * 1.14); stroke(g, 6);
  }
}
function hairPath(g) {
  g.beginPath();
  g.moveTo(HX - R * 1.02, HY - R * 0.05);
  g.bezierCurveTo(HX - R * 1.1, HY - R * 0.9, HX - R * 0.45, HY - R * 1.1, HX + R * 0.1, HY - R * 1.04);
  g.bezierCurveTo(HX + R * 0.75, HY - R * 1.0, HX + R * 1.08, HY - R * 0.6, HX + R * 1.0, HY - R * 0.05);
  g.bezierCurveTo(HX + R * 0.72, HY - R * 0.5, HX + R * 0.32, HY - R * 0.66, HX - R * 0.12, HY - R * 0.58);
  g.bezierCurveTo(HX - R * 0.55, HY - R * 0.5, HX - R * 0.85, HY - R * 0.3, HX - R * 1.02, HY - R * 0.05);
  g.closePath();
}
function hairSide(g, o, s) {
  hairPath(g);
  const L = s.light, gx = HX + Math.cos(L) * 0.5 * R, gy = HY - 0.55 * R;
  const gr = g.createRadialGradient(gx, gy, 0, gx, gy, 1.5 * R);
  gr.addColorStop(0, shade(o.hair, 1.25)); gr.addColorStop(0.55, o.hair); gr.addColorStop(1, shade(o.hair, 0.7));
  g.fillStyle = gr; g.fill(); stroke(g, 9);
  g.save(); hairPath(g); g.clip();   // soft sheen band along the crown
  g.beginPath(); g.ellipse(HX + R * 0.1, HY - R * 0.62, R * 0.72, R * 0.3, -0.08, Math.PI * 1.08, Math.PI * 1.9);
  stroke(g, 16, shade(o.hair, 1.9)); g.restore();
}
function cap(g, o) {
  g.beginPath(); // crown: a wide soft dome over the top of the head
  g.moveTo(HX - R * 1.12, HY - R * 0.4);
  g.bezierCurveTo(HX - R * 1.28, HY - R * 1.25, HX + R * 1.28, HY - R * 1.25, HX + R * 1.12, HY - R * 0.4);
  g.closePath(); litFill(g, HX - R * 1.2, HY - R * 1.2, HX + R * 1.2, HY - R * 0.4, o.cap, shade(o.cap, 0.7), -Math.PI / 4); stroke(g, 9);
  g.beginPath(); g.moveTo(HX - R * 1.06, HY - R * 0.42); g.quadraticCurveTo(HX, HY - R * 0.3, HX + R * 1.06, HY - R * 0.42);
  g.lineTo(HX + R * 1.0, HY - R * 0.22); g.quadraticCurveTo(HX, HY - R * 0.08, HX - R * 1.0, HY - R * 0.22); g.closePath();
  fill(g, o.capBand); stroke(g, 8);
  star(g, HX, HY - R * 0.72, 20, o.star);
}
/** eye at (x, y) of a kind; lid 0 open .. 1 shut; look = pupil shift (-1..1) */
function eye(g, kind, x, y, lid, look, side) {
  if (lid >= 0.99) { g.beginPath(); g.arc(x, y + 2, 22, 0.15 * Math.PI, 0.85 * Math.PI); stroke(g, 8); return; }
  if (kind === 'ring') {
    circle(g, x, y, 31, 33); fill(g, '#ffffff'); stroke(g, 5);
    circle(g, x + look * 9, y + 4, 7.5); fill(g, INK);
    if (lid > 0) { g.save(); circle(g, x, y, 31, 33); g.clip(); g.fillStyle = '#ebe7ef'; g.fillRect(x - 40, y - 40, 80, 40 + 66 * (lid - 0.5)); g.restore();
      g.beginPath(); g.moveTo(x - 31, y - 33 + 66 * lid); g.lineTo(x + 31, y - 33 + 66 * lid); stroke(g, 6); }
  } else if (kind === 'lid') {   // half-lidded: a lid line + a half-disc pupil under it
    g.beginPath(); g.moveTo(x - 27, y - 2 - side * 2); g.lineTo(x + 27, y - 2 + side * 2); stroke(g, 8);
    if (lid < 0.5) { g.beginPath(); g.arc(x + look * 7, y, 11, 0, Math.PI); g.closePath(); fill(g, INK); }
  } else if (kind === 'line') {  // smug: just a flat line
    g.beginPath(); g.moveTo(x - 30, y); g.quadraticCurveTo(x, y + (lid > 0 ? 6 : -3), x + 30, y + side * 3); stroke(g, 9);
  } else { // dot
    circle(g, x + look * 6, y, 11, lid > 0 ? 6 : 15); fill(g, INK);
  }
}
const FACES = {
  worried: { eye: 'ring', brows: 'worried', mouth: 'wave', sweat: true },
  smug: { eye: 'line', brows: 'raised', mouth: 'smirk' },
  stern: { eye: 'lid', brows: 'stern', mouth: 'dash' },
  grin: { eye: 'line', brows: 'raised', mouth: 'grin' },
  neutral: { eye: 'dot', brows: null, mouth: 'smile' },
  o: { eye: 'ring', brows: 'up', mouth: 'o' },
};
function face(g, o, s) {
  const f = { ...FACES[s.expr || 'neutral'], ...(s.face || {}) }, lid = s.blink || 0, look = s.look || 0;
  const ex = 48, ey = HY + 4;
  eye(g, f.eye, HX - ex, ey, lid, look, -1); eye(g, f.eye, HX + ex, ey, lid, look, 1);
  const by = ey - (f.eye === 'ring' ? 58 : 40);
  const brow = (x0, y0, x1, y1, bend = 0) => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - bend, x1, y1); stroke(g, 11); };
  if (f.brows === 'worried') { brow(HX - 80, by + 6, HX - 26, by - 10, 8); brow(HX + 26, by - 12, HX + 82, by + 2, 10); }
  if (f.brows === 'raised') { brow(HX - 76, by + 6, HX - 26, by + 4, 2); brow(HX + 24, by - 4, HX + 76, by - 16, 8); }
  if (f.brows === 'stern') { brow(HX - 80, by - 4, HX - 22, by + 12, 0); brow(HX + 22, by + 12, HX + 80, by - 4, 0); }
  if (f.brows === 'up') { brow(HX - 78, by - 4, HX - 26, by - 12, 10); brow(HX + 26, by - 12, HX + 78, by - 4, 10); }
  const my = HY + 68;
  g.beginPath();
  if (f.mouth === 'wave') { g.moveTo(HX - 42, my); for (let i = 1; i <= 24; i++) g.lineTo(HX - 42 + (84 * i) / 24, my + Math.sin((i / 24) * TAU * 2) * -8); stroke(g, 8); }
  if (f.mouth === 'smirk') { g.moveTo(HX - 6, my + 4); g.quadraticCurveTo(HX + 18, my + 8, HX + 34, my - 6); stroke(g, 8); }
  if (f.mouth === 'dash') { g.moveTo(HX - 14, my); g.lineTo(HX + 16, my - 1); stroke(g, 8); }
  if (f.mouth === 'smile') { g.moveTo(HX - 26, my - 4); g.quadraticCurveTo(HX, my + 16, HX + 26, my - 4); stroke(g, 8); }
  if (f.mouth === 'o') { circle(g, HX, my + 4, 12, 15); fill(g, '#5a2230'); stroke(g, 7); }
  if (f.mouth === 'grin') {
    g.moveTo(HX - 48, my - 10); g.quadraticCurveTo(HX + 6, my + 46, HX + 54, my - 14); g.quadraticCurveTo(HX + 4, my + 4, HX - 48, my - 10); g.closePath();
    fill(g, '#ffffff'); stroke(g, 7);
  }
  if (f.sweat && s.sweat !== false) {
    const x = HX + R * 0.62, y = HY - R * 0.48;
    g.beginPath(); g.moveTo(x, y - 34); g.bezierCurveTo(x + 6, y - 14, x + 26, y + 4, x + 22, y + 16);
    g.bezierCurveTo(x + 18, y + 36, x - 18, y + 36, x - 22, y + 16); g.bezierCurveTo(x - 26, y + 4, x - 6, y - 14, x, y - 34); g.closePath();
    const gr = g.createLinearGradient(x, y - 30, x, y + 30); gr.addColorStop(0, '#bfe0f7'); gr.addColorStop(1, '#6aa7da');
    g.fillStyle = gr; g.fill(); stroke(g, 6);
    circle(g, x - 8, y + 12, 5, 8, -0.4); fill(g, 'rgba(255,255,255,0.85)');
  }
}

/** draw a whole character into a 600 x 1000 design space (g already scaled) */
export function drawToon(g, o, s) {
  s = { light: -Math.PI / 4, ...s }; OLK = s.ol ?? 1;
  if (!s.noLegs) legs(g, o, s);
  torso(g, o, s);
  if (!s.armsFront) arms(g, s);
  head(g, o, s);
  if (o.cap) cap(g, o);
  face(g, o, s);
  if (s.armsFront) arms(g, s);
  if (s.extra) s.extra(g);
}

// ---------------------------------------------------------------- the 3D card
const q = (v, n = 40) => (typeof v === 'number' ? Math.round(v * n) / n : v);
/** a toon on a camera-facing card. opts: H card height (m), res (canvas px per design unit), shadow (cast) */
export function makeToon(outfit, { H = 1.9, res = 1.2, shadow = false, maxCache = 16 } = {}) {
  const root = new THREE.Group();
  const blank = new THREE.CanvasTexture(document.createElement('canvas'));
  const mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6 * H, H), mat);
  mesh.position.y = 0.475 * H; mesh.layers.set(NOINK); mesh.receiveShadow = true; mesh.castShadow = shadow;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
  const pivot = new THREE.Group(); pivot.add(mesh); root.add(pivot);
  const cache = new Map();
  let curKey = '', sunAngle = -Math.PI / 4;
  /** state: {expr, blink, look, arms, walk, stride, light, sweat, face, extra, key} (extra needs a unique key) */
  function set(state) {
    state = { light: sunAngle, ...state };
    const key = JSON.stringify(state, (k, v) => (k === 'extra' ? undefined : q(v)));
    if (key === curKey) return;
    curKey = key;
    let e = cache.get(key);
    if (!e) {
      const cv = document.createElement('canvas'); cv.width = Math.round(600 * res); cv.height = Math.round(1000 * res);
      const g = cv.getContext('2d'); g.scale(res, res); drawToon(g, outfit, state);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      e = { tex }; cache.set(key, e);
      if (cache.size > maxCache) { const [k0, e0] = cache.entries().next().value; if (k0 !== key) { e0.tex.dispose(); cache.delete(k0); } }
    }
    mat.map = e.tex; mesh.customDepthMaterial.map = e.tex; mat.needsUpdate = true; mesh.customDepthMaterial.needsUpdate = true;
  }
  /** yaw-only billboard toward the camera (call after the camera is placed, BEFORE set()). With `sun` (a
   *  DirectionalLight) the painted shading comes from the sun's screen direction (45 deg steps; state.light overrides). */
  function face(camera, sun) {
    const p = root.getWorldPosition(new THREE.Vector3()), c = camera.getWorldPosition(new THREE.Vector3());
    pivot.rotation.y = Math.atan2(c.x - p.x, c.z - p.z) - root.rotation.y;
    if (sun) {
      const d = sun.getWorldPosition(new THREE.Vector3()).sub(sun.target.getWorldPosition(new THREE.Vector3())).normalize();
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      sunAngle = Math.round(Math.atan2(-d.dot(up), d.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    }
  }
  return { root, pivot, mesh, mat, set, face, H };
}

/** world point of a card design point (u, v) (call after face() + root.updateMatrixWorld) */
export function cardPoint(toon, u, v, out = new THREE.Vector3()) {
  const k = toon.H / 1000;
  return out.set((u - 300) * k, (500 - v) * k, 0).applyMatrix4(toon.mesh.matrixWorld);
}
/** a stick arm + ball hand in 3D (same ink as the drawing) for hands that reach props in front of the card:
 *  set(shoulderWorld, handWorld) every frame. width / hand radius in design units of a card H metres tall. */
export function makeStickArm(parent, { H = 1.9, width = 13, hand = 21 } = {}) {
  const k = H / 1000, m = new THREE.MeshBasicMaterial({ color: INK });
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(width * k / 2, width * k / 2, 1, 12), m);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(hand * k, 24, 16), m);
  for (const o of [arm, ball]) { o.layers.set(NOINK); parent.add(o); }
  const a = new THREE.Vector3(), b = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  return {
    arm, ball,
    set(sw, hw) {
      a.copy(sw); b.copy(hw); parent.worldToLocal(a); parent.worldToLocal(b);
      arm.position.copy(a).add(b).multiplyScalar(0.5); arm.scale.set(1, a.distanceTo(b), 1);
      arm.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize()); ball.position.copy(b);
    },
  };
}

/** soft multiply contact blob under a toon's feet (rx, rz metres) */
export function makeBlob(rx = 0.35, rz = 0.22, k = 0.6) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  const v = Math.round(255 * k);
  gr.addColorStop(0, `rgb(${v},${v},${Math.round(v * 1.08)})`); gr.addColorStop(0.55, `rgb(${Math.round((v + 255) / 2)},${Math.round((v + 255) / 2)},${Math.round((v + 255) / 2)})`); gr.addColorStop(1, '#fff');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({
    map: tex, depthWrite: false, toneMapped: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  }));
  m.rotation.x = -Math.PI / 2; m.layers.set(NOINK); m.renderOrder = 1;
  return m;
}

/** eyelid for blinks: 0 open .. 1 shut. 4-frame blink (half / shut / shut / half), gaps 0.5-2.3 s, per-seed */
export function lidAt(t, seed = 0, fps = 30) {
  const h = (i) => { const v = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return v - Math.floor(v); };
  const f = Math.round(t * fps), LID = [0.5, 1, 1, 0.5];
  let s = Math.round(-60 * h(9));
  for (let n = 0; s <= f && n < 2000; n++) { const k = f - s; if (k >= 0 && k < 4) return LID[k]; s += Math.round(15 + 54 * h(n * 31 + 13)); }
  return 0;
}
