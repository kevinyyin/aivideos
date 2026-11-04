// dh014 shared kit: mesh helpers, screen-space placement, props (1930s army truck, Lewis gun, crates, gum trees)
// and the cast's outfits. Everything uses the engine/toon look (toonMat = two-tone painted shading).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng } from '@engine/core.js';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, wood, fitText, blotch } from '@engine/toon/paint.js';
import { NOINK } from '@engine/toon/ink.js';
import { slouchHat, strawHat, mustache, extras } from '@engine/toon/extras.js';

export const PI = Math.PI;
export function box(parent, w, h, d, m, x, y, z, round = 0) {
  const g = round ? new RoundedBoxGeometry(w, h, d, 3, round) : new THREE.BoxGeometry(w, h, d);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
export function cyl(parent, r0, r1, h, m, x, y, z, seg = 24) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
export function plane(parent, w, h, m, x, y, z) { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.receiveShadow = true; parent.add(o); return o; }
const UP = new THREE.Vector3(0, 1, 0);
/** a cylinder between two points */
export function rod(parent, a, b, r, m, seg = 8) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), seg), m);
  o.position.copy(A).add(B).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
  o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
/** canvas -> material (toon-lit, or flat Basic for readable signs) */
export function canvasMat(key, w, h, draw, { basic = false, alpha = false, repeat } = {}) {
  const t = ctex('dh14' + key, w, h, draw, repeat || [1, 1]);
  if (!repeat) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return basic ? new THREE.MeshBasicMaterial({ map: t, alphaTest: alpha ? 0.5 : 0, toneMapped: true }) : toonMat(t, alpha ? { alphaTest: 0.5, side: THREE.DoubleSide } : {});
}

/** sun = directional light 0 (the two-tone shading + card shadows read it); aim() moves its shadow box per shot */
export function sunLight(root, { color = 0xfff0d8, intensity = 2.3, map = 2048 } = {}) {
  const s = new THREE.DirectionalLight(color, intensity);
  s.castShadow = true; s.shadow.mapSize.set(map, map); s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.radius = 2;
  root.add(s, s.target); root.add(new THREE.HemisphereLight(0xdcecff, 0xb49a78, 0.9));
  return {
    s,
    aim(cx, cz, half = 12, dir = [0.55, 1, 0.6], cy = 0) {
      const d = new THREE.Vector3(...dir).normalize();
      s.target.position.set(cx, cy, cz); s.position.set(cx + d.x * 40, cy + d.y * 40, cz + d.z * 40);
      Object.assign(s.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 100 }); s.shadow.camera.updateProjectionMatrix();
    },
  };
}

// ---------------------------------------------------------------- framing by screen position (vertical 9:16 frame)
function camOf(c) { const cam = new THREE.PerspectiveCamera(c.fov, 9 / 16, 0.05, 2000); cam.position.set(...c.p); cam.lookAt(...c.a); cam.updateMatrixWorld(true); return cam; }
/** set-local point at screen fraction (fx, fy) and view depth d for camera c = {p, a, fov} */
export function atScreen(c, fx, fy, d) {
  const cam = camOf(c);
  const v = new THREE.Vector3(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  return cam.position.clone().addScaledVector(v, d / v.dot(cam.getWorldDirection(new THREE.Vector3())));
}
/** where the ray through screen (fx, fy) hits the ground plane y (feet of a standing subject land at fy) */
export function ground(c, fx, fy, y = 0) {
  const cam = camOf(c);
  const v = new THREE.Vector3(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  return cam.position.clone().addScaledVector(v, (y - cam.position.y) / v.y);
}

/** drawToon extra: a plain flat cap, peak to the front-right (cards.js `cap` always draws a star badge: not for civilians) */
export const flatCap = (col = '#5b4b3b') => (g) => {
  const HX = 300, HY = 215, R = 148, ink = (w) => { g.lineWidth = w; g.strokeStyle = '#17121a'; g.lineJoin = 'round'; g.stroke(); };
  const c = new THREE.Color(col), dk = '#' + c.clone().multiplyScalar(0.72).getHexString();
  g.beginPath(); g.ellipse(HX + R * 0.62, HY - R * 0.44, R * 0.72, R * 0.15, -0.06, 0, Math.PI * 2); g.fillStyle = dk; g.fill(); ink(8);
  g.beginPath(); g.moveTo(HX - R * 1.06, HY - R * 0.42); g.bezierCurveTo(HX - R * 1.12, HY - R * 1.18, HX + R * 1.15, HY - R * 1.22, HX + R * 1.18, HY - R * 0.5);
  g.quadraticCurveTo(HX, HY - R * 0.36, HX - R * 1.06, HY - R * 0.42); g.closePath(); g.fillStyle = col; g.fill(); ink(9);
  g.beginPath(); g.moveTo(HX - R * 0.2, HY - R * 1.02); g.quadraticCurveTo(HX + R * 0.3, HY - R * 0.8, HX + R * 0.7, HY - R * 0.52); ink(4);
};
// ---------------------------------------------------------------- cast (generic period soldiers: plain hats, no insignia)
export const CAST = {
  soldier: { jacket: '#8e8657', pants: '#766e47', collar: false },
  meredith: { jacket: '#857d4f', pants: '#6c6543', collar: true, tie: '#5b4a2c', pocket: true },
  farmer: { jacket: '#5d7eae', pants: '#7b6248', collar: true },
  camman: { jacket: '#7a5f46', pants: '#4b4036', collar: true, tie: '#2f4f7c' },   // v2 newsreel cameraman (flat cap in XTRA)
};
export const XTRA = {
  soldier: { extra: slouchHat(), key: 'slouch' },
  soldier2: { extra: slouchHat('#94815a', '#3a2f22'), key: 'slouch2' },
  meredith: { extra: extras(mustache('#4f3828', 1.1), slouchHat('#8f7c52', '#3c2f20')), key: 'mered' },
  farmer: { extra: extras(mustache('#6b5040', 0.8), strawHat()), key: 'farmer' },
  camman: { extra: extras(mustache('#2a1e19', 0.75), flatCap()), key: 'camman' },
};

// ---------------------------------------------------------------- props
const M = {};
function mats() {
  if (M.olive) return M;
  // premium pass (toon look v3): real metal for the gun + chrome, reflecting each set's scene.environment
  M.olive = toonMat('#787a4f'); M.dark = toonMat('#34322f'); M.tyre = toonMat('#2b2827'); M.chrome = toonMetal('#d8d0bc', { rough: 0.24 });
  M.glass = toonMat('#9cc0d4'); M.deck = toonMat(wood('#8d6a45', { boards: 5 })); M.gunMetal = toonMetal('#5a6064', { rough: 0.38 }); M.gunDark = toonMetal('#34383b', { rough: 0.48 }); M.stock = toonMat('#7a4e2c');
  M.crate = toonMat(wood('#b88a55', { boards: 3 })); M.bark = toonMat('#d9cdbd'); M.barkDk = toonMat('#a99a88');
  M.leaf = [toonMat('#7e9a68'), toonMat('#6f8d5d'), toonMat('#8ea575')];
  M.stencil = canvasMat('stencil', 256, 128, (g, r, W, H) => {
    g.fillStyle = '#b88a55'; g.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) blotch(g, r() * W, r() * H, 60, '120,80,40', 0.12);
    g.fillStyle = '#2f2418'; g.textAlign = 'center'; fitText(g, '.303 AMMO', W / 2, H * 0.62, W - 30, 50, 'bold', 'Courier New, monospace');
    g.strokeStyle = '#2f2418'; g.lineWidth = 6; g.strokeRect(10, 10, W - 20, H - 20);
  });
  return M;
}
/** 1930s flatbed army truck, front toward +x, wheels on y = 0. body = the sprung part (bounce it) */
export function makeTruck() {
  const m = mats(), g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  box(body, 5.0, 0.22, 1.3, m.dark, -0.1, 0.72, 0);
  box(body, 1.25, 0.72, 1.12, m.olive, 1.95, 1.2, 0, 0.1);                         // engine hood
  box(body, 0.1, 0.82, 0.98, m.chrome, 2.6, 1.2, 0, 0.03);                          // radiator
  for (let i = -3; i <= 3; i++) box(body, 0.04, 0.68, 0.03, m.dark, 2.66, 1.2, i * 0.12);
  for (const z of [-0.6, 0.6]) { const h = cyl(body, 0.13, 0.11, 0.12, m.chrome, 2.62, 1.42, z, 16); h.rotation.z = PI / 2; }
  box(body, 1.1, 1.3, 1.5, m.olive, 0.82, 1.68, 0, 0.12);                           // cab
  box(body, 0.06, 0.5, 1.2, m.glass, 1.38, 1.98, 0);                                // windscreen
  for (const z of [-0.76, 0.76]) box(body, 0.6, 0.42, 0.04, m.glass, 0.86, 1.98, z);
  box(body, 1.2, 0.08, 1.58, m.olive, 0.82, 2.36, 0, 0.04);
  for (const [x, z] of [[1.95, -0.72], [1.95, 0.72], [-1.45, -0.86], [-1.45, 0.86]]) {   // fenders
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, z < 0 ? 0.36 : 0.36, 20, 1, true, 0, PI), m.olive);
    f.rotation.set(PI / 2, 0, PI / 2); f.position.set(x, 0.5, z); f.material = m.olive; f.castShadow = true; body.add(f);
  }
  box(body, 3.0, 0.12, 1.95, m.deck, -0.95, 0.98, 0);                               // flatbed
  for (const z of [-0.95, 0.95]) box(body, 3.0, 0.32, 0.06, m.deck, -0.95, 1.2, z);
  box(body, 0.06, 0.32, 1.95, m.deck, -2.44, 1.2, 0);
  const mount = cyl(body, 0.05, 0.07, 0.75, m.gunDark, -0.7, 1.4, 0, 12); mount.visible = false;
  const wheels = [];
  for (const [x, z] of [[1.95, -0.78], [1.95, 0.78], [-1.45, -0.86], [-1.45, 0.86]]) {
    const w = new THREE.Group(); w.position.set(x, 0.45, z); g.add(w);
    const t = cyl(w, 0.45, 0.45, 0.3, m.tyre, 0, 0, 0, 22); t.rotation.x = PI / 2;
    const hb = cyl(w, 0.2, 0.2, 0.32, m.chrome, 0, 0, 0, 12); hb.rotation.x = PI / 2;
    for (let k = 0; k < 4; k++) { const sp = box(w, 0.06, 0.6, 0.33, m.olive, 0, 0, 0); sp.rotation.z = (k * PI) / 4; }
    wheels.push(w);
  }
  return { g, body, wheels, mount, bed: new THREE.Vector3(-0.95, 1.04, 0) };
}
/** Lewis gun: barrel along +x, bipod feet on y = 0. gun = the part that recoils / tilts */
export function makeLewis({ bipod = true } = {}) {
  const m = mats(), g = new THREE.Group(), gun = new THREE.Group(); gun.position.y = bipod ? 0.36 : 0; g.add(gun);
  const sh = cyl(gun, 0.075, 0.075, 0.78, m.gunMetal, 0.45, 0, 0, 16); sh.rotation.z = PI / 2;
  for (const x of [0.15, 0.35, 0.55, 0.75]) { const r = cyl(gun, 0.083, 0.083, 0.03, m.gunDark, x, 0, 0, 16); r.rotation.z = PI / 2; }
  const mz = cyl(gun, 0.03, 0.035, 0.16, m.gunDark, 0.92, 0, 0, 10); mz.rotation.z = PI / 2;
  box(gun, 0.38, 0.13, 0.1, m.gunMetal, -0.02, 0.0, 0, 0.02);
  cyl(gun, 0.22, 0.22, 0.06, m.gunDark, 0.02, 0.1, 0, 28); cyl(gun, 0.06, 0.06, 0.08, m.gunMetal, 0.02, 0.12, 0, 12);
  const st = box(gun, 0.46, 0.12, 0.06, m.stock, -0.4, -0.04, 0, 0.02); st.rotation.z = 0.12;
  box(gun, 0.05, 0.14, 0.05, m.stock, -0.14, -0.1, 0);
  if (bipod) for (const z of [-0.17, 0.17]) rod(gun, [0.62, 0, 0], [0.72, -0.36, z], 0.014, m.gunDark);
  return { g, gun, muzzle: new THREE.Vector3(1.0, 0, 0), grip: new THREE.Vector3(-0.14, -0.14, 0) };
}
export function crate(parent, x, y, z, s = 1, rotY = 0) {
  const m = mats(), c = box(parent, 0.8 * s, 0.45 * s, 0.5 * s, [m.crate, m.crate, m.crate, m.crate, m.stencil, m.crate], x, y + 0.225 * s, z, 0.02);
  c.rotation.y = rotY; return c;
}
/** a cartoon gum tree (pale trunk, lumpy olive canopy) */
const SPH = new THREE.IcosahedronGeometry(1, 2);
export function gum(parent, x, z, s = 1, seed = 1) {
  const m = mats(), r = rng(seed), g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = r() * 6; parent.add(g);
  const lean = (r() - 0.5) * 0.25;
  const t = cyl(g, 0.16, 0.3, 4.2, m.bark, 0, 2.1, 0, 10); t.rotation.z = lean;
  rod(g, [Math.sin(-lean) * 2.2, 2.6, 0], [1.3, 4.4, 0.4], 0.1, m.bark, 6); rod(g, [-Math.sin(lean) * 2.0, 2.9, 0], [-1.2, 4.6, -0.3], 0.09, m.barkDk, 6);
  const n = 6 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * PI * 2 + r(), rr = 1.0 + r() * 0.9;
    const b = new THREE.Mesh(SPH, m.leaf[i % 3]); b.position.set(Math.cos(a) * rr, 4.7 + r() * 1.3, Math.sin(a) * rr);
    b.scale.set(1.3 + r() * 0.6, 0.75 + r() * 0.3, 1.2 + r() * 0.5); b.castShadow = b.receiveShadow = true; g.add(b);
  }
  return g;
}
/** NOINK billboard-free helper: keep the world ink off thin wires etc. */
export const noInk = (o) => { o.traverse((c) => c.layers.set(NOINK)); return o; };
