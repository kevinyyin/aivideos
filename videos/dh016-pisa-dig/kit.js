// dh016 kit: framing helpers, the cast's costumes (card toons + drawn hats) and the story's props, toon look.
// Props face +x unless noted; everything stands on y = 0 of its parent.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, wood, fitText, blotch } from '@engine/toon/paint.js';
import { NOINK } from '@engine/toon/ink.js';
import { INK } from '@engine/toon/cards.js';
import { mustache, extras } from '@engine/toon/extras.js';
import { box, cyl, plane } from '@engine/toon/kit.js';

export const PI = Math.PI, TAU = PI * 2;
export { box, cyl, plane };
const UP = new THREE.Vector3(0, 1, 0);
/** a cylinder between two points */
export function rod(parent, a, b, r, m, seg = 8) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), seg), m);
  o.position.copy(A).add(B).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
  o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
/** re-aim an existing rod between two points */
export function aimRod(o, a, b) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
  o.position.copy(A).add(B).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
  o.scale.set(1, L / o.geometry.parameters.height, 1);
}
export const boing = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * PI * 2.5) * Math.exp(-u * 5.5));

// ---------------------------------------------------------------- framing by screen position (vertical 9:16 frame)
function camOf(c) { const cam = new THREE.PerspectiveCamera(c.fov, 9 / 16, 0.05, 2000); cam.position.set(...c.p); cam.lookAt(...c.a); cam.updateMatrixWorld(true); return cam; }
/** set-local point at screen fraction (fx, fy) and view depth d for camera c = {p, a, fov} */
export function atScreen(c, fx, fy, d) {
  const cam = camOf(c);
  const v = new THREE.Vector3(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  return cam.position.clone().addScaledVector(v, d / v.dot(cam.getWorldDirection(new THREE.Vector3())));
}
/** where the ray through screen (fx, fy) hits the plane y (feet of a standing subject land at fy) */
export function ground(c, fx, fy, y = 0) {
  const cam = camOf(c);
  const v = new THREE.Vector3(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  return cam.position.clone().addScaledVector(v, (y - cam.position.y) / v.y);
}

// ---------------------------------------------------------------- hats + costume bits (drawToon `extra`, 600x1000 card)
const HX = 300, HY = 215, R = 148;
const sh = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
const ink = (g, w, col = INK) => { g.lineWidth = w; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
/** a construction hard hat with a centre ridge and a short peak */
export const hardHat = (col = '#f2c232') => (g) => {
  const y = HY - R * 0.42;
  g.beginPath(); g.ellipse(HX + 6, y + 6, R * 1.18, R * 0.16, 0, 0, TAU); g.fillStyle = sh(col, 0.85); g.fill(); ink(g, 8);
  g.beginPath(); g.moveTo(HX - R * 1.02, y); g.bezierCurveTo(HX - R * 1.05, y - R * 1.15, HX + R * 1.05, y - R * 1.15, HX + R * 1.02, y); g.closePath();
  const gr = g.createLinearGradient(HX - R, 0, HX + R, 0); gr.addColorStop(0, sh(col, 1.08)); gr.addColorStop(1, sh(col, 0.82)); g.fillStyle = gr; g.fill(); ink(g, 9);
  g.beginPath(); g.moveTo(HX - 16, y - R * 0.84); g.quadraticCurveTo(HX, y - R * 0.92, HX + 16, y - R * 0.84); g.lineTo(HX + 12, y - 4); g.lineTo(HX - 12, y - 4); g.closePath(); g.fillStyle = sh(col, 0.92); g.fill(); ink(g, 5);
  g.beginPath(); g.ellipse(HX - R * 0.45, y - R * 0.6, 18, 9, -0.5, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill();
};
/** a hi-vis vest over the jacket (two reflective stripes) */
export const vest = (col = '#f47a2a') => (g) => {
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(HX + s * 40, 395); g.lineTo(HX + s * 118, 430); g.lineTo(HX + s * 112, 640); g.lineTo(HX + s * 22, 640); g.closePath(); g.fillStyle = col; g.fill(); ink(g, 6);
    g.fillStyle = '#e8eef0'; g.fillRect(Math.min(HX + s * 24, HX + s * 112), 560, 88, 16); g.fillRect(Math.min(HX + s * 26, HX + s * 114), 520, 86, 12);
  }
};
/** medieval kettle helmet (iron, wide brim) */
export const kettleHat = (col = '#9aa2a8') => (g) => {
  const y = HY - R * 0.5;
  g.beginPath(); g.ellipse(HX, y + 6, R * 1.45, R * 0.22, 0, 0, TAU); g.fillStyle = sh(col, 0.85); g.fill(); ink(g, 8);
  g.beginPath(); g.moveTo(HX - R * 0.9, y + 2); g.bezierCurveTo(HX - R * 0.95, y - R * 1.0, HX + R * 0.95, y - R * 1.0, HX + R * 0.9, y + 2); g.closePath();
  const gr = g.createLinearGradient(HX - R, 0, HX + R, 0); gr.addColorStop(0, sh(col, 1.12)); gr.addColorStop(1, sh(col, 0.78)); g.fillStyle = gr; g.fill(); ink(g, 9);
  g.beginPath(); g.moveTo(HX, y - R * 0.74); g.lineTo(HX, y); ink(g, 5, sh(col, 0.6));
};
/** a white cross on a red tabard (Pisa's colours) */
export const tabard = (g) => {
  g.beginPath(); g.moveTo(HX - 92, 420); g.lineTo(HX + 92, 420); g.lineTo(HX + 100, 690); g.lineTo(HX - 100, 690); g.closePath(); g.fillStyle = '#b8302f'; g.fill(); ink(g, 6);
  g.fillStyle = '#f4efe4'; g.fillRect(HX - 14, 450, 28, 190); g.fillRect(HX - 64, 510, 128, 26);
};
/** the Italian mayor's green-white-red sash, over the right shoulder */
export const sash = (g) => {
  const cols = ['#2f8a4a', '#f4f1ea', '#c8363a'];
  cols.forEach((c, i) => { g.beginPath(); const o = (i - 1) * 22; g.moveTo(HX + 70 + o, 392); g.lineTo(HX + 92 + o, 398); g.lineTo(HX - 70 + o, 640); g.lineTo(HX - 92 + o, 632); g.closePath(); g.fillStyle = c; g.fill(); });
  g.beginPath(); g.moveTo(HX + 48, 392); g.lineTo(HX + 114, 404); g.lineTo(HX - 48, 642); g.lineTo(HX - 114, 630); g.closePath(); ink(g, 5);
};
/** a bowler hat */
export const bowler = (col = '#2a2428') => (g) => {
  const y = HY - R * 0.6;
  g.beginPath(); g.ellipse(HX, y + 8, R * 1.2, R * 0.18, 0, 0, TAU); g.fillStyle = sh(col, 1.2); g.fill(); ink(g, 8);
  g.beginPath(); g.moveTo(HX - R * 0.78, y + 4); g.bezierCurveTo(HX - R * 0.85, y - R * 0.95, HX + R * 0.85, y - R * 0.95, HX + R * 0.78, y + 4); g.closePath(); g.fillStyle = col; g.fill(); ink(g, 9);
  g.beginPath(); g.ellipse(HX - R * 0.3, y - R * 0.5, 16, 9, -0.4, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fill();
};
/** a plain flat cap (no badge) */
export const flatCap = (col = '#5b4b3b') => (g) => {
  const dk = sh(col, 0.72);
  g.beginPath(); g.ellipse(HX + R * 0.62, HY - R * 0.44, R * 0.72, R * 0.15, -0.06, 0, TAU); g.fillStyle = dk; g.fill(); ink(g, 8);
  g.beginPath(); g.moveTo(HX - R * 1.06, HY - R * 0.42); g.bezierCurveTo(HX - R * 1.12, HY - R * 1.18, HX + R * 1.15, HY - R * 1.22, HX + R * 1.18, HY - R * 0.5);
  g.quadraticCurveTo(HX, HY - R * 0.36, HX - R * 1.06, HY - R * 0.42); g.closePath(); g.fillStyle = col; g.fill(); ink(g, 9);
};
/** a wide sun hat */
export const sunHat = (col = '#f1d48a', band = '#d4574a') => (g) => {
  const y = HY - R * 0.58;
  g.beginPath(); g.ellipse(HX, y + 8, R * 1.55, R * 0.26, 0, 0, TAU); g.fillStyle = sh(col, 0.92); g.fill(); ink(g, 8);
  g.beginPath(); g.moveTo(HX - R * 0.75, y + 4); g.bezierCurveTo(HX - R * 0.8, y - R * 0.8, HX + R * 0.8, y - R * 0.8, HX + R * 0.75, y + 4); g.closePath(); g.fillStyle = col; g.fill(); ink(g, 8);
  g.fillStyle = band; g.fillRect(HX - R * 0.76, y - R * 0.2, R * 1.52, R * 0.18);
};
/** a green bookmaker's visor */
export const visor = (g) => {
  g.beginPath(); g.moveTo(HX - R * 1.0, HY - R * 0.5); g.quadraticCurveTo(HX, HY - R * 0.72, HX + R * 1.0, HY - R * 0.5); g.lineTo(HX + R * 0.9, HY - R * 0.2); g.quadraticCurveTo(HX, HY - R * 0.05, HX - R * 0.9, HY - R * 0.2); g.closePath();
  g.fillStyle = 'rgba(60,170,110,0.85)'; g.fill(); ink(g, 7);
};
/** a camera on a strap */
export const camStrap = (g) => {
  g.beginPath(); g.moveTo(HX - 60, 400); g.lineTo(HX - 10, 520); g.lineTo(HX + 60, 400); ink(g, 5, '#3a3036');
  g.beginPath(); g.roundRect(HX - 44, 505, 88, 58, 10); g.fillStyle = '#2f3138'; g.fill(); ink(g, 6);
  g.beginPath(); g.arc(HX, 534, 18, 0, TAU); g.fillStyle = '#7f9ab8'; g.fill(); ink(g, 5);
};
/** cast: cards.js outfits + drawn extras (key = a unique cache key per extra) */
export const CAST = {
  eng: { o: { jacket: '#4a6fa8', pants: '#2f3a52', collar: true }, x: { extra: extras(vest(), hardHat()), key: 'eng' } },
  eng2: { o: { jacket: '#7a8a98', pants: '#3a3f4a', collar: true }, x: { extra: extras(vest('#f2d23a'), hardHat('#f4f1ea')), key: 'eng2' } },
  burl: { o: { jacket: '#8a6a4a', pants: '#3e3a3a', collar: true, tie: '#7a2a2a', hair: '#cfcac0', hairStyle: 'side' }, x: { extra: hardHat('#f4f1ea'), key: 'burl' } },
  mason: { o: { jacket: '#8a6a48', pants: '#5a4634', hair: '#4a3020' }, x: { extra: extras(flatCap('#a5453a')), key: 'mason' } },
  mason2: { o: { jacket: '#6d7a5a', pants: '#4f4a3a', hair: '#2a1e19' }, x: { extra: mustache('#3a2a1e', 0.9), key: 'mason2' } },
  soldier: { o: { jacket: '#7a7268', pants: '#4a4440' }, x: { extra: extras(tabard, kettleHat()), key: 'soldier' } },
  w34: { o: { jacket: '#5a5048', pants: '#3a342e', collar: true }, x: { extra: extras(flatCap('#4a4038'), mustache('#2a1e19', 0.8)), key: 'w34' } },
  w34b: { o: { jacket: '#6e5a40', pants: '#4a3e30' }, x: { extra: flatCap('#6a5a48'), key: 'w34b' } },
  boss34: { o: { jacket: '#2e2e36', pants: '#26262c', collar: true, tie: '#8a2a2a' }, x: { extra: extras(bowler(), mustache('#1e1714', 1.0)), key: 'boss34' } },
  guard: { o: { jacket: '#2f4c9e', pants: '#2d3550', cap: '#2a3f86', capBand: '#1c2a5c', star: '#f2c232', badge: true }, x: {} },
  mayor: { o: { jacket: '#2b3140', pants: '#22262f', collar: true, tie: '#3a5a9a', hair: '#9a948a', hairStyle: 'side' }, x: { extra: sash, key: 'mayor' } },
  plumber: { o: { jacket: '#3a6fb4', pants: '#2f5a94', hair: '#3a2a1e' }, x: { extra: extras(flatCap('#2f4f7c'), mustache('#3a2a1e', 1.1)), key: 'plumb' } },
  local: { o: { jacket: '#c46a3a', pants: '#4a4a5a', hair: '#2a1e19' }, x: {} },
  local2: { o: { jacket: '#6a8a4a', pants: '#3a3a44', hair: '#7a5a3a', hairStyle: 'side' }, x: { extra: mustache('#5a3a26', 0.9), key: 'local2' } },
  local3: { o: { jacket: '#9a4a6a', pants: '#3a3448', hair: '#c9a46a' }, x: {} },
  tour: { o: { jacket: '#e7a43c', pants: '#3d4a6a', hair: '#5a3524' }, x: { extra: extras(sunHat(), camStrap), key: 'tour' } },
  tour2: { o: { jacket: '#3fa89a', pants: '#e8dcc4', hair: '#2a1e19' }, x: { extra: camStrap, key: 'tour2' } },
  tour3: { o: { jacket: '#d9556a', pants: '#3a5a8a', hair: '#e2c27a' }, x: { extra: sunHat('#f4efe4', '#3a6fb4'), key: 'tour3' } },
  bookie: { o: { jacket: '#f1ebdd', pants: '#3a3a44', collar: true, tie: '#2a2a2a', hair: '#2a1e19', hairStyle: 'side' }, x: { extra: extras(visor, mustache('#2a1e19', 0.8)), key: 'bookie' } },
  you: { o: { jacket: '#5b8fc9', pants: '#3d4a6a', hair: '#5a3524' }, x: {} },
};

// ---------------------------------------------------------------- materials
const MT = {};
export function mats() {
  if (MT.steel) return MT;
  Object.assign(MT, {
    steel: toonMetal('#9aa3aa', { rough: 0.35 }), dark: toonMat('#3a3a40'), yellow: toonMat('#f2c232'), orange: toonMat('#e8762e'), red: toonMat('#c8363a'),
    white: toonMat('#f4f1ea'), dirt: toonMat('#7a5536'), dirtDk: toonMat('#5a3c26'), lead: toonMetal('#6e747c', { rough: 0.5 }), conc: toonMat('#b7b2a8'),
    rope: new THREE.MeshBasicMaterial({ color: 0x2a2a30 }), tyre: toonMat('#2b2827'), glass: toonMat('#9cc0d4'), wood: toonMat(wood('#a8743f', { boards: 3 })),
    pail: toonMat('#e8762e'), tank: toonMat('#e9eef2'), frost: toonMat('#eef6fb'), hose: toonMat('#2c2c34'), cement: toonMat('#9a9a96'), green: toonMat('#4f8a5a'),
  });
  return MT;
}
const noInk = (o) => { o.traverse((c) => c.layers.set(NOINK)); return o; };
export { noInk };

// ---------------------------------------------------------------- props
/** a bucket (pail) of dirt; full 0..1 */
export function makeBucket(col) {
  const m = mats(), g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.36, 18, 1, true), col ? toonMat(col, { side: THREE.DoubleSide }) : toonMat('#e8762e', { side: THREE.DoubleSide }));
  b.position.y = 0.18; b.castShadow = true; g.add(b);
  cyl(g, 0.15, 0.15, 0.02, m.dark, 0, 0.01, 0, 18);
  const dirt = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 8, 0, TAU, 0, PI / 2), m.dirt); dirt.scale.y = 0.45; dirt.position.y = 0.33; g.add(dirt);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 20, PI), m.dark); handle.position.y = 0.36; g.add(handle);
  return { g, dirt, handle };
}
/** the soil-extraction rig (1999): tracked base, an inclined mast + casing (auger turns inside), a spoil chute.
 *  Faces +x: the casing runs down toward +x into the ground at `dip` radians. auger(t) spins it. */
export function makeRig({ dip = 0.42, len = 7 } = {}) {
  const m = mats(), g = new THREE.Group();
  box(g, 2.2, 0.5, 1.6, m.dark, 0, 0.25, 0, 0.08);
  for (const z of [-0.7, 0.7]) box(g, 2.4, 0.4, 0.3, m.tyre, 0, 0.2, z, 0.12);
  box(g, 1.4, 1.1, 1.3, m.yellow, -0.3, 1.05, 0, 0.1);
  box(g, 0.5, 0.6, 0.9, m.glass, 0.25, 1.25, 0, 0.04);
  const mast = new THREE.Group(); mast.position.set(0.7, 1.0, 0); mast.rotation.z = -(PI / 2 - dip) * 0 - dip; g.add(mast);
  // the casing points along mast -y rotated: build along +x then dip down
  const casing = new THREE.Group(); casing.position.set(0.8, 0.8, 0); casing.rotation.z = -dip; g.add(casing);
  const tube = cyl(casing, 0.11, 0.11, len, m.steel, len / 2, 0, 0, 16); tube.rotation.z = PI / 2;
  const motor = box(casing, 0.6, 0.5, 0.5, m.orange, -0.1, 0.05, 0, 0.06);
  const flights = [];
  for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 14), m.dark); f.rotation.y = PI / 2; f.position.set(0.5 + k * 0.28, 0, 0); casing.add(f); flights.push(f); }
  const chute = box(g, 0.7, 0.08, 0.45, m.steel, 0.15, 0.95, 0.75); chute.rotation.z = 0.5;
  void mast; void motor;
  return { g, casing, tube, flights, auger(t) { flights.forEach((f, k) => { f.position.x = 0.5 + ((k * 0.28 + t * 0.6) % 1.7); f.rotation.x = t * 6; }); } };
}
/** an A-frame anchor + a safeguard cable (1998): set(fromWorld, toWorld) */
export function makeCable(parent) {
  const m = mats(), c = rod(parent, [0, 0, 0], [0, 1, 0], 0.05, m.rope, 6);
  return { c, set(a, b) { aimRod(c, a, b); } };
}
/** red-white barrier on two legs, length along x */
export function makeBarrier(len = 2.4) {
  const g = new THREE.Group(), stripes = ctex('dh16barrier', 256, 32, (gg, r, W, H) => { for (let x = -32; x < W + 32; x += 32) { gg.fillStyle = (x / 32) % 2 ? '#f4f1ea' : '#d13a34'; gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x + 32, 0); gg.lineTo(x + 16, H); gg.lineTo(x - 16, H); gg.closePath(); gg.fill(); } });
  stripes.wrapS = THREE.RepeatWrapping; stripes.repeat.set(len / 1.2, 1);
  box(g, len, 0.22, 0.06, toonMat(stripes), 0, 0.95, 0, 0.02);
  for (const s of [-1, 1]) { const l = box(g, 0.06, 1.0, 0.5, mats().white, s * (len / 2 - 0.15), 0.5, 0); l.scale.z = 0.12; box(g, 0.08, 0.06, 0.5, mats().dark, s * (len / 2 - 0.15), 0.03, 0); }
  return g;
}
/** canvas sign on a stand (text lines, colours) */
export function makeSign(key, lines, { w = 1.0, h = 0.7, bg = '#f4f1ea', fg = '#c8363a', border = '#c8363a', post = 1.2, font = 'Avenir Next, Arial, sans-serif' } = {}) {
  const g = new THREE.Group(), tex = ctex('dh16sign' + key, 512, Math.round(512 * h / w), (gg, r, W, H) => {
    gg.fillStyle = bg; gg.fillRect(0, 0, W, H); gg.lineWidth = 18; gg.strokeStyle = border; gg.strokeRect(9, 9, W - 18, H - 18);
    gg.fillStyle = fg; gg.textAlign = 'center';
    lines.forEach((ln, i) => { const [txt, sz] = Array.isArray(ln) ? ln : [ln, 120]; fitText(gg, txt, W / 2, H * (0.5 + (i - (lines.length - 1) / 2) * 0.38) + sz * 0.35, W - 60, sz, '900', font); });
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const face = box(g, w, h, 0.04, [mats().white, mats().white, mats().white, mats().white, new THREE.MeshBasicMaterial({ map: tex }), mats().white], 0, post + h / 2, 0);
  if (post > 0) cyl(g, 0.03, 0.03, post + 0.05, mats().dark, 0, post / 2, -0.04, 8);
  return { g, face };
}
/** a camera-facing label sprite (text on a soft pill) */
export function makeLabel(key, text, { fg = '#17121a', bg = 'rgba(255,250,238,0.95)', w = 512, h = 192, size = 120, border = '#17121a' } = {}) {
  const tex = ctex('dh16label' + key, w, h, (g, r, W, H) => {
    g.fillStyle = bg; g.beginPath(); g.roundRect(8, 8, W - 16, H - 16, H / 2 - 8); g.fill(); g.lineWidth = 12; g.strokeStyle = border; g.stroke();
    g.fillStyle = fg; g.textAlign = 'center'; fitText(g, text, W / 2, H / 2 + size * 0.36, W - 70, size, '900', 'Avenir Next, Arial, sans-serif');
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.layers.set(NOINK); s.renderOrder = 20; s.userData.aspect = w / h; return s;
}
/** the 1993 counterweight: a post-tensioned concrete ring at the tower's foot + a stack of lead ingots on the north
 *  (-x) half; setCount(n) shows the first n ingots (0..N) */
export function makeLeadStack(R = 9.4) {
  const m = mats(), g = new THREE.Group(), N = 96;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.55, 8, 48, PI * 0.9), m.conc); ring.rotation.set(PI / 2, 0, PI / 2 + PI * 0.05); ring.position.y = 0.55; ring.castShadow = ring.receiveShadow = true; g.add(ring);
  const ing = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.45, 0.7), m.lead, N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), P = [];
  for (let i = 0; i < N; i++) {
    const layer = Math.floor(i / 16), k = i % 16, a = PI * 0.6 + (k / 15) * PI * 0.8, rr = R - 0.1 + (layer % 2) * 0.05;
    P.push({ x: Math.cos(a) * rr, y: 1.35 + layer * 0.47, z: Math.sin(a) * rr, a });
  }
  ing.castShadow = ing.receiveShadow = true; g.add(ing);
  const set = (n) => { ing.count = Math.max(0, Math.min(N, Math.round(n))); for (let i = 0; i < ing.count; i++) { const p = P[i]; q.setFromAxisAngle(UP, -p.a + PI / 2); ing.setMatrixAt(i, m4.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(1, 1, 1))); } ing.instanceMatrix.needsUpdate = true; };
  set(N);
  return { g, ring, ing, N, setCount: set, slot: (i) => P[Math.min(N - 1, i)] };
}
/** truck crane (boom toward +x); setBoom(angle), hook(world) for the ingot; boom tip local */
export function makeCrane() {
  const m = mats(), g = new THREE.Group();
  box(g, 6, 1.2, 2.4, m.yellow, 0, 1.2, 0, 0.12); box(g, 1.6, 1.4, 2.2, m.yellow, 2.6, 2.4, 0, 0.1); box(g, 0.6, 0.7, 1.9, m.glass, 3.15, 2.6, 0);
  for (const [x, z] of [[-2, -1.15], [-2, 1.15], [0.4, -1.15], [0.4, 1.15], [2.4, -1.15], [2.4, 1.15]]) { const w = cyl(g, 0.55, 0.55, 0.4, m.tyre, x, 0.55, z, 18); w.rotation.x = PI / 2; }
  const boom = new THREE.Group(); boom.position.set(-1.5, 2.2, 0); g.add(boom);
  box(boom, 16, 0.6, 0.6, m.yellow, 8, 0, 0, 0.06);
  const tip = new THREE.Object3D(); tip.position.set(16, 0, 0); boom.add(tip);
  const line = rod(g, [0, 0, 0], [0, 1, 0], 0.025, m.rope, 5);
  return { g, boom, tip, line };
}
/** liquid-nitrogen tank on legs (white, frosty) */
export function makeTank() {
  const m = mats(), g = new THREE.Group();
  cyl(g, 0.75, 0.75, 3.2, m.tank, 0, 2.0, 0, 24);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 10, 0, TAU, 0, PI / 2), m.tank); top.position.y = 3.6; top.scale.y = 0.5; g.add(top);
  for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU + 0.4; cyl(g, 0.06, 0.06, 0.6, m.steel, Math.cos(a) * 0.6, 0.3, Math.sin(a) * 0.6, 6); }
  cyl(g, 0.78, 0.78, 0.12, m.dark, 0, 2.9, 0, 24); box(g, 0.5, 0.36, 0.05, toonMat('#3a6fb4'), 0, 2.3, 0.75);
  cyl(g, 0.1, 0.1, 0.4, m.steel, 0, 4.05, 0, 8);
  return g;
}
/** 1934 grout pump: a hand-cart with a pressure drum, a lever and a hose */
export function makePump() {
  const m = mats(), g = new THREE.Group();
  box(g, 1.6, 0.12, 0.9, m.wood, 0, 0.55, 0);
  for (const s of [-1, 1]) { const w = cyl(g, 0.38, 0.38, 0.08, m.dark, -0.4, 0.38, s * 0.5, 16); w.rotation.x = PI / 2; }
  const drum = cyl(g, 0.38, 0.38, 0.9, toonMat('#6a7a6a'), 0.15, 1.08, 0, 18); void drum;
  const lever = new THREE.Group(); lever.position.set(0.15, 1.6, 0); g.add(lever); box(lever, 1.4, 0.07, 0.07, m.dark, 0.3, 0, 0);
  cyl(g, 0.1, 0.1, 0.3, m.steel, 0.15, 1.6, 0, 8);
  return { g, lever };
}
/** a cement mixer drum on a stand (turn drum.rotation.x) */
export function makeMixer() {
  const m = mats(), g = new THREE.Group();
  box(g, 1.2, 0.5, 0.8, toonMat('#7a5a3a'), 0, 0.25, 0, 0.05);
  const drum = new THREE.Group(); drum.position.set(0, 1.15, 0); drum.rotation.z = 0.5; g.add(drum);
  const d = new THREE.Mesh(new THREE.LatheGeometry([[0.2, -0.55], [0.55, -0.3], [0.6, 0.1], [0.35, 0.5], [0.3, 0.56]].map(([x, y]) => new THREE.Vector2(x, y)), 16), toonMat('#c8a24a', { side: THREE.DoubleSide }));
  d.castShadow = true; drum.add(d);
  for (let k = 0; k < 4; k++) { const fin = box(drum, 0.05, 0.6, 0.12, toonMat('#a8842a'), Math.cos(k * 1.57) * 0.58, 0, Math.sin(k * 1.57) * 0.58); fin.rotation.y = -k * 1.57; }
  return { g, drum };
}
/** a small 1990s hatchback, nose +x */
export function makeCar(col = '#d8d2c2') {
  const m = mats(), g = new THREE.Group(), body = toonMat(col);
  box(g, 3.4, 0.7, 1.6, body, 0, 0.65, 0, 0.18);
  box(g, 2.0, 0.6, 1.5, body, -0.3, 1.25, 0, 0.16);
  box(g, 0.06, 0.48, 1.36, m.glass, 0.72, 1.25, 0); box(g, 1.7, 0.42, 0.04, m.glass, -0.32, 1.27, 0.76); box(g, 1.7, 0.42, 0.04, m.glass, -0.32, 1.27, -0.76);
  for (const [x, z] of [[1.1, -0.78], [1.1, 0.78], [-1.1, -0.78], [-1.1, 0.78]]) { const w = cyl(g, 0.32, 0.32, 0.22, m.tyre, x, 0.32, z, 16); w.rotation.x = PI / 2; }
  for (const z of [-0.5, 0.5]) box(g, 0.05, 0.14, 0.26, toonMat('#fff2c0'), 1.72, 0.75, z);
  return g;
}
/** a toilet plunger (handle along +y from the grip) */
export function makePlunger() {
  const g = new THREE.Group(); cyl(g, 0.025, 0.025, 1.0, toonMat('#b58a5a'), 0, 0.5, 0, 8);
  const cup = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 8, 0, TAU, PI / 2, PI / 2), toonMat('#c8363a', { side: THREE.DoubleSide })); cup.position.y = 1.05; cup.rotation.x = PI; g.add(cup);
  return g;
}
/** a lectern with three microphones */
export function makeLectern() {
  const m = mats(), g = new THREE.Group();
  box(g, 0.7, 1.1, 0.5, m.wood, 0, 0.55, 0, 0.04); box(g, 0.8, 0.06, 0.6, m.wood, 0, 1.12, 0.02, 0.02);
  for (const [x, c] of [[-0.16, '#c8363a'], [0, '#3a6fb4'], [0.16, '#f2c232']]) { rod(g, [x, 1.15, 0.15], [x * 1.3, 1.2, 0.3], 0.012, m.dark, 5); const h = cyl(g, 0.04, 0.035, 0.12, toonMat(c), x * 1.3, 1.24, 0.32, 10); h.rotation.x = 0.6; }
  return g;
}
/** the wobbly kitchen table: legs[i] groups (scale y to trim), top */
export function makeTable() {
  const g = new THREE.Group(), tilt = new THREE.Group(); g.add(tilt);
  const wd = toonMat(wood('#c08a52', { boards: 4 }));
  box(tilt, 1.4, 0.07, 0.8, wd, 0, 0.75, 0, 0.02);
  const legs = [];
  for (const [x, z] of [[-0.62, -0.32], [0.62, -0.32], [-0.62, 0.32], [0.62, 0.32]]) { const lg = new THREE.Group(); lg.position.set(x, 0.72, z); tilt.add(lg); box(lg, 0.07, 0.72, 0.07, wd, 0, -0.36, 0); legs.push(lg); }
  return { g, tilt, legs };
}
/** a hand saw (blade along +x from the grip) */
export function makeSaw() {
  const g = new THREE.Group(), blade = new THREE.Shape(); blade.moveTo(0, 0.02); blade.lineTo(0.55, -0.01); blade.lineTo(0.55, -0.06); blade.lineTo(0, -0.11); blade.closePath();
  const b = new THREE.Mesh(new THREE.ExtrudeGeometry(blade, { depth: 0.008, bevelEnabled: false }), toonMetal('#c9ced2', { rough: 0.25 })); b.position.x = 0.08; g.add(b);
  box(g, 0.14, 0.12, 0.04, toonMat('#a8433a'), 0.02, -0.04, 0.004, 0.02);
  return g;
}
/** a chalk betting board on an easel */
export function makeBoard() {
  const g = new THREE.Group(), tex = ctex('dh16board', 512, 640, (gg, r, W, H) => {
    gg.fillStyle = '#2f3f36'; gg.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) blotch(gg, r() * W, r() * H, 60, '230,240,230', 0.05);
    gg.lineWidth = 22; gg.strokeStyle = '#8a6440'; gg.strokeRect(11, 11, W - 22, H - 22);
    gg.fillStyle = '#f2efe4'; gg.textAlign = 'center';
    fitText(gg, 'LEANING TOWER', W / 2, 112, W - 80, 62, '900', 'Avenir Next, Arial, sans-serif');
    fitText(gg, 'FALLS BEFORE', W / 2, 196, W - 80, 66, '900', 'Avenir Next, Arial, sans-serif');
    fitText(gg, 'THE YEAR 2001', W / 2, 278, W - 80, 66, '900', 'Avenir Next, Arial, sans-serif');
    gg.fillStyle = '#f2c232'; fitText(gg, '11-4', W / 2, 470, W - 80, 150, '900', 'Avenir Next, Arial, sans-serif');
    gg.strokeStyle = '#f2efe4'; gg.lineWidth = 5; gg.beginPath(); gg.moveTo(80, 330); gg.lineTo(W - 80, 330); gg.stroke();
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const wd = toonMat('#8a6440');
  box(g, 1.3, 1.62, 0.06, [wd, wd, wd, wd, new THREE.MeshBasicMaterial({ map: tex, color: 0xe8e8e8 }), wd], 0, 1.55, 0);
  rod(g, [-0.72, 0, 0.3], [-0.69, 2.3, -0.02], 0.03, wd, 6); rod(g, [0.72, 0, 0.3], [0.69, 2.3, -0.02], 0.03, wd, 6);   // legs outside the board: never across the text rod(g, [0, 0, -0.7], [0, 2.2, -0.05], 0.03, wd, 6);
  return g;
}
/** medieval treadwheel crane + scaffolding poles around a radius */
export function makeScaffold(R = 8.6, h = 18, n = 14) {
  const g = new THREE.Group(), pole = toonMat('#9a7046'), plank = toonMat(wood('#b88a55', { boards: 2 }));
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; cyl(g, 0.09, 0.1, h, pole, Math.cos(a) * R, h / 2, Math.sin(a) * R, 6); }
  for (let y = 3; y < h; y += 3.2) for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
    rod(g, [Math.cos(a0) * R, y, Math.sin(a0) * R], [Math.cos(a1) * R, y, Math.sin(a1) * R], 0.06, pole, 5);
    const pk = box(g, 1.2, 0.08, 3.6, plank, Math.cos((a0 + a1) / 2) * (R - 0.6), y + 0.05, Math.sin((a0 + a1) / 2) * (R - 0.6)); pk.rotation.y = -(a0 + a1) / 2;
  }
  return g;
}
export function makeTreadwheel() {
  const g = new THREE.Group(), wd = toonMat('#8f6640');
  const wheel = new THREE.Group(); wheel.position.y = 2.2; g.add(wheel);
  for (const z of [-0.6, 0.6]) { const r = new THREE.Mesh(new THREE.TorusGeometry(2, 0.1, 6, 28), wd); r.position.z = z; r.castShadow = true; wheel.add(r); }
  for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; rod(wheel, [Math.cos(a) * 2, Math.sin(a) * 2, -0.6], [Math.cos(a) * 2, Math.sin(a) * 2, 0.6], 0.05, wd, 5); }
  for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU; rod(wheel, [0, 0, 0], [Math.cos(a) * 2, Math.sin(a) * 2, 0], 0.06, wd, 5); }
  rod(g, [-1.6, 0, 0], [0, 2.2, 0], 0.1, wd, 6); rod(g, [1.6, 0, 0], [0, 2.2, 0], 0.1, wd, 6);
  rod(g, [0, 2.2, 0], [3.5, 7.5, 0], 0.12, wd, 6);
  return { g, wheel };
}
/** a block of cut stone */
export function makeStone(w = 0.9, h = 0.45, d = 0.5) { const g = new THREE.Group(); box(g, w, h, d, toonMat('#e6dfd0'), 0, h / 2, 0, 0.03); return g; }
/** a Pisan banner on a pole (red, white cross) */
export function makeBanner() {
  const g = new THREE.Group(), tex = ctex('dh16pisaflag', 256, 192, (gg, r, W, H) => { gg.fillStyle = '#b8302f'; gg.fillRect(0, 0, W, H); gg.fillStyle = '#f4efe4'; gg.fillRect(W * 0.42, H * 0.12, W * 0.16, H * 0.76); gg.fillRect(W * 0.18, H * 0.38, W * 0.64, H * 0.16); });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  cyl(g, 0.03, 0.03, 3.2, toonMat('#7a5a3a'), 0, 1.6, 0, 6);
  const f = plane(g, 0.9, 0.68, toonMat(tex, { side: THREE.DoubleSide }), 0.47, 2.8, 0); f.castShadow = true;
  return { g, flag: f };
}
/** frost spreading on the ground: a white disc (scale it), slightly above y = 0 */
export function makeFrost() {
  const tex = ctex('dh16frost', 256, 256, (g, r, W, H) => {
    const gr = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2); gr.addColorStop(0, 'rgba(240,248,255,1)'); gr.addColorStop(0.7, 'rgba(225,238,250,0.95)'); gr.addColorStop(1, 'rgba(225,238,250,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(180,205,230,0.7)'; g.lineWidth = 3; for (let i = 0; i < 60; i++) { const a = r() * TAU, d = r() * W * 0.4; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d); g.lineTo(W / 2 + Math.cos(a) * (d + 20), H / 2 + Math.sin(a) * (d + 20)); g.stroke(); }
  });
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -PI / 2; m.position.y = 0.05; m.layers.set(NOINK); m.receiveShadow = true; return m;
}
/** tomato splat decal (a red star blob) on a plane facing +z */
export function makeSplat() {
  const tex = ctex('dh16splat', 128, 128, (g, r, W, H) => {
    g.fillStyle = '#d33a2c'; g.beginPath();
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * TAU, rr = (i % 2 ? 0.28 : 0.42 + r() * 0.08) * W; g.lineTo(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.fillStyle = '#f07a5a'; g.beginPath(); g.arc(W * 0.44, H * 0.42, W * 0.08, 0, TAU); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = '#d33a2c'; g.beginPath(); g.arc(W / 2 + Math.cos(i) * W * 0.46, H / 2 + Math.sin(i) * H * 0.46, 5, 0, TAU); g.fill(); }
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  m.layers.set(NOINK); return m;
}
/** a ground point d metres ahead of camera c (horizontal forward) and `side` metres to its right */
export function along(c, d, side = 0, y = 0) {
  const f = new THREE.Vector3(c.a[0] - c.p[0], 0, c.a[2] - c.p[2]).normalize(), r = new THREE.Vector3(-f.z, 0, f.x);
  return new THREE.Vector3(c.p[0] + f.x * d + r.x * side, y, c.p[2] + f.z * d + r.z * side);
}
/** screen fraction (fx, fy) of a set-local point for camera c */
export function toScreen(c, P) { const v = P.clone().project(camOf(c)); return [(v.x + 1) / 2, (1 - v.y) / 2]; }
/** the camera's right vector (horizontal) */
export function rightOf(c) { const f = new THREE.Vector3(c.a[0] - c.p[0], 0, c.a[2] - c.p[2]).normalize(); return new THREE.Vector3(-f.z, 0, f.x); }
