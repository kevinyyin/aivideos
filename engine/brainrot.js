// BRAINROT KIT (dh012): our own toy takes on Italian-brainrot-style characters + real sharks. Everything faces +z, feet at y 0.
//   makeSneaker({upper, sole, scale}) — one generic blue sneaker (no brand), origin under the sole, toe toward +z (~0.32 m long).
//   sneakerGeometry() — the same sneaker merged into ONE vertex-colored geometry (for InstancedMesh walls / avalanches).
//   makeTralalero() — a three-legged shark in blue sneakers (~1.75 m to the dorsal tip). pose(o) drives the strut.
//   makeCroc() — a cartoon crocodile (~2.2 m), makeCrocPlane() — a propeller bomber whose nose IS that crocodile's head.
//   makeWalkingShark() — an epaulette-style walking shark (~1.0 m): walks on its four paddle fins (pose({ph, bend})).
//   makeReefShark() — a plain grey reef shark (~2.4 m) for the aquarium: swim(t, k) sways the tail.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, mk, canvasTex, rng, lerp } from '@engine/core.js';
import { makePerson } from '@engine/rig.js';

const PI = Math.PI;
const _M4 = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _E = new THREE.Euler(), _V = new THREE.Vector3(), _S = new THREE.Vector3();
/** a geometry part with a baked transform + vertex color (merged props) */
function part(geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  geo.applyMatrix4(_M4.compose(_V.set(x, y, z), _Q.setFromEuler(_E.set(rx, ry, rz)), _S.set(sx, sy, sz)));
  const n = geo.attributes.position.count, c = new THREE.Color(color), a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'color'].includes(k)) geo.deleteAttribute(k);
  return geo;
}

export const SNEAKER = { upper: 0x2f6fd8, dark: 0x1f4f9e, sole: 0xf7f7f2, lace: 0xffffff };
const SN_PARTS = (u = SNEAKER.upper, s = SNEAKER.sole) => [
  [new RoundedBoxGeometry(0.15, 0.06, 0.32, 2, 0.025), s, 0, 0.03, 0.0],                  // sole
  [new RoundedBoxGeometry(0.14, 0.1, 0.27, 2, 0.045), u, 0, 0.1, -0.02],                 // upper
  [new RoundedBoxGeometry(0.13, 0.055, 0.09, 2, 0.025), s, 0, 0.075, 0.115],             // toe cap
  [new RoundedBoxGeometry(0.12, 0.08, 0.1, 2, 0.03), SNEAKER.dark, 0, 0.165, -0.08],      // collar
  [new THREE.BoxGeometry(0.16, 0.02, 0.33), SNEAKER.dark, 0, 0.065, 0.0],                // stripe round the midsole
  ...[0, 1, 2].map((k) => [new THREE.BoxGeometry(0.1, 0.014, 0.018), SNEAKER.lace, 0, 0.152 - k * 0.012, 0.02 + k * 0.035]),
];
/** one sneaker (a Group of meshes), origin under the sole, toe toward +z */
export function makeSneaker({ upper = SNEAKER.upper, sole = SNEAKER.sole, scale = 1 } = {}) {
  const g = new THREE.Group(), inner = new THREE.Group(); inner.scale.setScalar(scale); g.add(inner);
  for (const [geo, c, x, y, z] of SN_PARTS(upper, sole)) mk(geo, mat(c, c === sole || c === SNEAKER.lace ? 0.6 : 0.5), inner, x, y, z);
  return g;
}
/** the sneaker as ONE merged vertex-colored geometry (instancing) */
export function sneakerGeometry(upper = SNEAKER.upper) {
  return mergeGeometries(SN_PARTS(upper).map(([geo, c, x, y, z]) => part(geo, c, x, y, z)));
}

function eyes(parent, x, y, z, r, white, black, out = 0.0) {
  const P = [];
  for (const s of [-1, 1]) {
    const e = mk(new THREE.SphereGeometry(r, 16, 12), white, parent, s * x, y, z); e.scale.set(1, 1.1, 0.7); e.rotation.y = s * out;
    P.push(mk(new THREE.SphereGeometry(r * 0.5, 12, 10), black, parent, s * (x + r * 0.12), y, z + r * 0.62));
  }
  return P;
}

/** TRALALERO: a three-legged shark in blue sneakers. The body is horizontal (nose +z) on three long legs: two in front, one
 *  behind. pose({ph, stride, bob, pitch, lean, wave, mouth: 'grin'|'o', look, hop}) — ph = gait phase (radians), wave lifts
 *  the pectoral fins. shoes[i] = the sneaker groups (world positions for the moment they drop). */
export function makeTralalero({ top = 0x6f97b8, belly = 0xf1f4f6, scale = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.scale.setScalar(scale);
  body.position.y = 1.08;
  const topM = mat(top, 0.45), bellyM = mat(belly, 0.5), white = mat(0xffffff, 0.3), black = mat(0x15161a, 0.25);
  const b = mk(new THREE.CapsuleGeometry(0.31, 0.95, 10, 22), topM, body); b.rotation.x = PI / 2; b.scale.set(0.9, 1, 1);
  const bb = mk(new THREE.CapsuleGeometry(0.28, 0.86, 10, 22), bellyM, body, 0, -0.085, 0.03); bb.rotation.x = PI / 2; bb.scale.set(0.86, 1, 0.97);
  // snout: a rounded wedge so the head reads as a shark from the side
  const sn = mk(new THREE.SphereGeometry(0.3, 20, 14), topM, body, 0, 0.02, 0.62); sn.scale.set(0.82, 0.75, 1.05);
  const dorsal = mk(new THREE.ConeGeometry(0.21, 0.5, 4), topM, body, 0, 0.42, -0.08); dorsal.scale.set(0.2, 1, 1); dorsal.rotation.x = -0.4;
  const tailG = new THREE.Group(); tailG.position.set(0, 0.02, -0.72); body.add(tailG);
  for (const [y, r] of [[0.2, 0.7], [-0.13, 2.45]]) { const tl = mk(new THREE.ConeGeometry(0.15, 0.5, 4), topM, tailG, 0, y, -0.12); tl.scale.set(0.22, 1, 1); tl.rotation.x = r; }
  const fins = [];
  for (const s of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(s * 0.25, -0.1, 0.22); body.add(pv);
    const f = mk(new THREE.ConeGeometry(0.11, 0.36, 4), topM, pv, s * 0.12, -0.06, 0); f.scale.set(1, 1, 0.22); f.rotation.set(0, 0, s * 2.15);
    fins.push(pv);
  }
  // face: big eyes high on the snout, a wide grin with cartoon teeth (never biting anything)
  const face = new THREE.Group(); face.position.set(0, 0.05, 0.62); body.add(face);
  const pupils = eyes(face, 0.15, 0.1, 0.17, 0.065, white, black, 0.35);
  const brows = [-1, 1].map((s) => { const br = mk(new THREE.BoxGeometry(0.11, 0.022, 0.03), mat(0x2f4258, 0.6), face, s * 0.15, 0.2, 0.2); br.rotation.z = s * -0.18; return br; });
  const grin = new THREE.Group(); grin.position.set(0, -0.12, 0.2); face.add(grin);
  mk(new THREE.BoxGeometry(0.34, 0.06, 0.05), mat(0x5a1e24, 0.6), grin).scale.set(1, 1, 1);
  for (let k = 0; k < 6; k++) { const tt = mk(new THREE.ConeGeometry(0.019, 0.045, 4), white, grin, -0.125 + k * 0.05, 0.012, 0.022); tt.rotation.x = PI; }
  const mouthO = mk(new THREE.SphereGeometry(0.075, 14, 10), mat(0x5a1e24, 0.6), face, 0, -0.13, 0.18); mouthO.scale.set(1, 1.15, 0.5); mouthO.visible = false;
  // three legs: two front (under the pecs), one at the back; each leg = thigh pivot → shin pivot → sneaker
  const legs = [], shoes = [];
  const legM = mat(top, 0.5);
  for (const [x, z] of [[-0.16, 0.26], [0.16, 0.26], [0, -0.4]]) {
    const hip = new THREE.Group(); hip.position.set(x, -0.2, z); body.add(hip);
    mk(new THREE.CapsuleGeometry(0.058, 0.36, 4, 10), legM, hip, 0, -0.22, 0);
    const knee = new THREE.Group(); knee.position.y = -0.44; hip.add(knee);
    mk(new THREE.CapsuleGeometry(0.05, 0.34, 4, 10), legM, knee, 0, -0.2, 0);
    const shoe = makeSneaker(); shoe.position.y = -0.44; knee.add(shoe);
    legs.push({ hip, knee }); shoes.push(shoe);
  }
  function pose(o = {}) {
    const ph = o.ph ?? 0, st = o.stride ?? 0.45;
    legs.forEach((L, i) => {
      const p = ph + [0, PI, PI * 0.5][i], sw = Math.sin(p) * st;
      L.hip.rotation.x = -sw + (o.legX?.[i] ?? 0);
      L.knee.rotation.x = Math.max(0, Math.cos(p)) * st * 1.4 + (o.kneeX?.[i] ?? 0);
      L.hip.rotation.z = o.splay?.[i] ?? 0;
    });
    body.position.y = 1.08 + (o.bob ?? 0.04 * Math.abs(Math.cos(ph))) + (o.hop ?? 0);
    body.rotation.set(o.pitch ?? 0, 0, o.lean ?? 0);
    fins.forEach((f, i) => { f.rotation.set(0, 0, (i ? -1 : 1) * (o.wave ?? 0) * 1.1 + (i ? 1 : -1) * 0.1 * Math.sin(ph)); });
    tailG.rotation.y = 0.22 * Math.sin(ph * 0.5 + 0.6) + (o.tail ?? 0);
    const O = o.mouth === 'o'; grin.visible = !O; mouthO.visible = O;
    pupils.forEach((p, i) => { p.position.x = (i ? 1 : -1) * 0.158 + (o.look ?? 0) * 0.02; });
    brows.forEach((br, i) => { br.position.y = 0.2 + (O ? 0.03 : 0); });
  }
  pose();
  const mats = { top: topM, belly: bellyM };
  return { g, body, legs, shoes, fins, tail: tailG, face, pose, mats };
}

/** a cartoon crocodile, ~2.2 m nose to tail, faces +z, belly at y≈0.18. pose({ph, flail, jaw, tail, goggles}) */
export function makeCroc({ color = 0x4f8a3a, belly = 0xc8d68a } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); body.position.y = 0.26; g.add(body);
  const gm = mat(color, 0.6), bm = mat(belly, 0.7), white = mat(0xffffff, 0.3), black = mat(0x15161a, 0.3);
  const b = mk(new THREE.CapsuleGeometry(0.24, 0.8, 8, 18), gm, body); b.rotation.x = PI / 2; b.scale.set(1.2, 0.8, 1);
  const bl = mk(new THREE.CapsuleGeometry(0.2, 0.72, 8, 16), bm, body, 0, -0.07, 0); bl.rotation.x = PI / 2; bl.scale.set(1.15, 0.7, 1);
  for (let k = 0; k < 6; k++) mk(new THREE.ConeGeometry(0.05, 0.08, 4), mat(0x3d6e2e, 0.7), body, 0, 0.2, -0.4 + k * 0.15);
  const head = new THREE.Group(); head.position.set(0, 0.03, 0.62); body.add(head);
  const skull = mk(new THREE.SphereGeometry(0.22, 18, 14), gm, head, 0, 0.02, 0); skull.scale.set(1.15, 0.75, 1);
  const upper = new THREE.Group(); upper.position.set(0, 0.02, 0.12); head.add(upper);
  mk(new RoundedBoxGeometry(0.3, 0.1, 0.5, 2, 0.045), gm, upper, 0, 0, 0.24);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.04, 0.12); head.add(jaw);
  mk(new RoundedBoxGeometry(0.28, 0.07, 0.48, 2, 0.03), bm, jaw, 0, -0.02, 0.23);
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const tt = mk(new THREE.ConeGeometry(0.018, 0.05, 4), white, upper, s * 0.12, -0.06, 0.08 + k * 0.1); tt.rotation.x = PI; }
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.02, 8, 6), black, upper, s * 0.06, 0.05, 0.47); }
  const pupils = [];
  for (const s of [-1, 1]) { const bump = mk(new THREE.SphereGeometry(0.075, 12, 10), gm, head, s * 0.11, 0.15, 0.02); void bump; mk(new THREE.SphereGeometry(0.06, 12, 10), white, head, s * 0.11, 0.19, 0.05); pupils.push(mk(new THREE.SphereGeometry(0.03, 10, 8), black, head, s * 0.11, 0.2, 0.1)); }
  // pilot goggles (the bomber's crocodile wore them)
  const goggles = new THREE.Group(); head.add(goggles);
  mk(new THREE.TorusGeometry(0.19, 0.018, 6, 20), mat(0x5a3a24, 0.6), goggles, 0, 0.17, 0.0).rotation.x = PI / 2 - 0.25;
  for (const s of [-1, 1]) { const lens = mk(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 14), mat(0x9fd3ff, 0.1, { metalness: 0.4 }), goggles, s * 0.1, 0.27, 0.06); lens.rotation.x = 0.4; }
  const legs = [];
  for (const [x, z] of [[-0.27, 0.28], [0.27, 0.28], [-0.27, -0.28], [0.27, -0.28]]) {
    const hip = new THREE.Group(); hip.position.set(x, -0.05, z); body.add(hip);
    mk(new THREE.CapsuleGeometry(0.055, 0.14, 4, 8), gm, hip, Math.sign(x) * 0.06, -0.1, 0).rotation.z = Math.sign(x) * 0.6;
    mk(new THREE.SphereGeometry(0.06, 8, 6), gm, hip, Math.sign(x) * 0.12, -0.2, 0.04).scale.set(1, 0.5, 1.4);
    legs.push(hip);
  }
  const tail = new THREE.Group(); tail.position.set(0, 0, -0.58); body.add(tail);
  const segs = [];
  let parent = tail;
  for (let k = 0; k < 4; k++) { const s = new THREE.Group(); s.position.z = k ? -0.22 : 0; parent.add(s); const m = mk(new THREE.CapsuleGeometry(0.16 - k * 0.035, 0.18, 6, 12), gm, s, 0, 0, -0.11); m.rotation.x = PI / 2; m.scale.set(1.1, 0.7, 1); segs.push(s); parent = s; }
  function pose(o = {}) {
    const ph = o.ph ?? 0, fl = o.flail ?? 0;
    legs.forEach((h, i) => { h.rotation.set((i % 2 ? 1 : -1) * 0.5 * Math.sin(ph + i * 1.7) * (0.3 + fl), 0, (i % 2 ? -1 : 1) * fl * 0.6 * (0.5 + 0.5 * Math.sin(ph * 1.3 + i))); });
    jaw.rotation.x = o.jaw ?? 0.05;
    segs.forEach((s, k) => (s.rotation.y = (o.tail ?? 0.25 * Math.sin(ph * 0.6)) * (0.5 + 0.25 * k)));
    goggles.visible = o.goggles !== false;
    pupils.forEach((p, i) => (p.position.x = (i ? 1 : -1) * 0.11 + (o.look ?? 0) * 0.02));
  }
  pose();
  return { g, body, head, jaw, legs, tail, pose };
}

/** BOMBARDIRO-style bomber: a propeller plane (nose +z, ~7.6 m span) whose nose IS a crocodile's head. croc (makeCroc) sits in the
 *  fuselage with only its head out; separate(k) slides a plain nose cone in (k 0 → 1). props[] spin (spin(t)). Plane colors olive. */
export function makeCrocPlane() {
  const g = new THREE.Group(), plane = new THREE.Group(); g.add(plane);
  const olive = mat(0x6a7a48, 0.55), darkO = mat(0x4a5634, 0.6), metal = mat(0xb9bdc2, 0.3, { metalness: 0.6 }), glass = mat(0x9fd3ff, 0.1, { metalness: 0.3 });
  const fus = mk(new THREE.CapsuleGeometry(0.5, 3.6, 10, 22), olive, plane, 0, 0, -0.6); fus.rotation.x = PI / 2;
  mk(new THREE.SphereGeometry(0.36, 16, 12), glass, plane, 0, 0.42, 0.6).scale.set(1, 0.6, 1.6);
  const wing = mk(new RoundedBoxGeometry(7.6, 0.12, 1.25, 2, 0.05), olive, plane, 0, -0.12, -0.3); void wing;
  mk(new RoundedBoxGeometry(2.6, 0.08, 0.7, 2, 0.03), olive, plane, 0, 0.05, -2.7);
  const fin = mk(new RoundedBoxGeometry(0.1, 1.1, 0.85, 2, 0.04), olive, plane, 0, 0.55, -2.75); fin.rotation.x = -0.25;
  for (const s of [-1, 1]) { const star = mk(new THREE.CircleGeometry(0.28, 5), mat(0xf4f1ea, 0.6), plane, s * 2.6, -0.05, -0.3); star.rotation.x = -PI / 2; star.rotation.z = PI / 2; }
  const props = [];
  for (const s of [-1, 1]) {
    const eng = mk(new THREE.CylinderGeometry(0.3, 0.26, 1.1, 14), darkO, plane, s * 1.8, -0.1, 0.25); eng.rotation.x = PI / 2;
    const hub = new THREE.Group(); hub.position.set(s * 1.8, -0.1, 0.84); plane.add(hub);
    mk(new THREE.ConeGeometry(0.12, 0.25, 12), metal, hub, 0, 0, 0.05).rotation.x = PI / 2;
    for (let k = 0; k < 3; k++) { const bl = mk(new THREE.BoxGeometry(0.1, 0.85, 0.03), mat(0x2a2a2e, 0.5), hub, 0, 0, 0); bl.rotation.z = k * 2.094; bl.geometry.translate(0, 0.42, 0); }
    props.push(hub);
  }
  const nose = mk(new THREE.SphereGeometry(0.5, 18, 14), olive, plane, 0, 0, 1.05); nose.scale.set(1, 1, 1.2); nose.visible = false;
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), darkO, plane, s * 0.3, -0.62, 0.0);
  const croc = makeCroc(); g.add(croc.g); croc.g.position.set(0, -0.27, -0.1); croc.g.scale.setScalar(1.25);
  return {
    g, plane, croc, props, nose,
    spin(t) { props.forEach((p, i) => (p.rotation.z = t * 38 * (i ? 1 : -1))); },
    separate(k) { nose.visible = k > 0.5; },
  };
}

/** spots texture for the walking shark (tan with brown spots) */
function spotsTex(seed = 5) {
  return canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#c9a77a'; c.fillRect(0, 0, w, h); const R = rng(seed);
    for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(96,62,36,${0.45 + R() * 0.4})`; c.beginPath(); c.arc(R() * w, R() * h, 4 + R() * 9, 0, 7); c.fill(); }
  }, [2, 1]);
}
/** WALKING SHARK (epaulette-style): slender, tan + brown spots, a black "epaulette" eyespot ringed white behind each pectoral
 *  fin, small eyes on top. Body along z (nose +z, ~1.0 m); it walks on four paddle fins. pose({ph, bend, lift, look, mouth})
 *  — ph = gait phase: diagonal pairs (front-left with back-right) step together while the body S-bends side to side.
 *  fins[i] = {pv, tip}: i 0 front-left, 1 front-right, 2 back-left, 3 back-right. tip = where a sneaker goes. */
export function makeWalkingShark() {
  const g = new THREE.Group(), root = new THREE.Group(); root.position.y = 0.13; g.add(root);
  const skin = new THREE.MeshStandardMaterial({ map: spotsTex(), roughness: 0.55 }), belly = mat(0xf2e6d2, 0.6), black = mat(0x141416, 0.3), white = mat(0xffffff, 0.35);
  // spine: 6 segments from head (+z) to tail tip (−z); each bends in yaw
  const segs = [], R0 = [0.1, 0.105, 0.09, 0.07, 0.05, 0.035], L = 0.17;
  let parent = root; const head = new THREE.Group(); head.position.z = 0.3; root.add(head);
  const hm = mk(new THREE.SphereGeometry(0.11, 18, 12), skin, head, 0, 0, 0.02); hm.scale.set(1.1, 0.62, 1.45);
  mk(new THREE.SphereGeometry(0.1, 16, 10), belly, head, 0, -0.025, 0.02).scale.set(1.05, 0.45, 1.35);
  const pupils = [];
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.03, 12, 10), white, head, s * 0.065, 0.045, 0.06); pupils.push(mk(new THREE.SphereGeometry(0.017, 10, 8), black, head, s * 0.07, 0.055, 0.075)); }
  const mouth = mk(new THREE.BoxGeometry(0.08, 0.008, 0.01), mat(0x5a3a2a, 0.6), head, 0, -0.035, 0.16); mouth.rotation.x = 0.3;
  const mouthO = mk(new THREE.SphereGeometry(0.02, 10, 8), mat(0x5a2a24, 0.6), head, 0, -0.035, 0.155); mouthO.visible = false;
  for (let k = 0; k < 6; k++) {
    const s = new THREE.Group(); s.position.z = k ? -L : 0.12; parent.add(s);
    const m = mk(new THREE.CapsuleGeometry(R0[k], L * 0.8, 6, 14), skin, s, 0, 0, -L / 2); m.rotation.x = PI / 2; m.scale.set(1.1, 0.62, 1);
    const bm = mk(new THREE.CapsuleGeometry(R0[k] * 0.9, L * 0.75, 6, 12), belly, s, 0, -0.022, -L / 2); bm.rotation.x = PI / 2; bm.scale.set(1.05, 0.4, 1);
    segs.push(s); parent = s;
  }
  // two small dorsal fins far back + a long low tail fin
  for (const [k, h] of [[3, 0.09], [4, 0.07]]) { const d = mk(new THREE.ConeGeometry(0.05, h, 4), skin, segs[k], 0, 0.06, -L * 0.4); d.scale.set(0.25, 1, 1.4); d.rotation.x = -0.5; }
  const tf = mk(new THREE.ConeGeometry(0.05, 0.22, 4), skin, segs[5], 0, -0.005, -L * 0.9); tf.scale.set(0.25, 1, 0.5); tf.rotation.x = -PI / 2;
  // epaulette spots behind the pecs
  for (const s of [-1, 1]) { const o = mk(new THREE.CircleGeometry(0.03, 16), mat(0xe8d8bc, 0.6), segs[0], s * 0.113, 0.03, -0.07); o.rotation.y = s * PI / 2; const i = mk(new THREE.CircleGeometry(0.022, 16), mat(0x2a1e16, 0.5), segs[0], s * 0.115, 0.03, -0.07); i.rotation.y = s * PI / 2; }
  // four paddle fins (legs): pivot on the body side, paddle points out-down; tip = sneaker attach (sole down)
  const fins = [];
  for (const [i, k, s] of [[0, 0, -1], [1, 0, 1], [2, 2, -1], [3, 2, 1]]) {
    const pv = new THREE.Group(); pv.position.set(s * 0.09, -0.04, k ? -0.07 : -0.02); segs[k].add(pv);
    const paddle = mk(new THREE.CapsuleGeometry(0.035, 0.08, 4, 10), skin, pv, s * 0.06, -0.035, 0); paddle.rotation.z = s * 1.0; paddle.scale.set(1.4, 1, 0.5);
    const tip = new THREE.Group(); tip.position.set(s * 0.1, -0.1, 0.01); pv.add(tip);
    fins.push({ pv, tip, s, front: k === 0 });
  }
  function pose(o = {}) {
    const ph = o.ph ?? 0, bend = o.bend ?? 0.22;
    segs.forEach((s, k) => (s.rotation.y = bend * Math.sin(ph - k * 0.9) * (k ? 0.85 : 0.5)));
    head.rotation.y = -bend * 0.6 * Math.sin(ph + 0.6) + (o.headYaw ?? 0); head.rotation.x = o.headPitch ?? 0;
    fins.forEach((f, i) => {
      const p = ph + (i === 0 || i === 3 ? 0 : PI), sw = Math.sin(p);
      f.pv.rotation.set(0, (f.front ? 1 : 0.8) * 0.55 * sw * f.s * -1, Math.max(0, Math.cos(p)) * 0.35 * f.s * -1 + (o.splay ?? 0) * f.s);
    });
    root.position.y = 0.13 + (o.lift ?? 0) + 0.01 * Math.abs(Math.sin(ph));
    root.rotation.x = o.pitch ?? 0;
    pupils.forEach((p, i) => (p.position.x = (i ? 1 : -1) * 0.07 + (o.look ?? 0) * 0.01));
    mouth.visible = o.mouth !== 'o'; mouthO.visible = o.mouth === 'o';
  }
  pose();
  return { g, root, head, segs, fins, pose };
}

/** a plain grey reef shark, ~2.4 m, nose +z, centered at its belly. swim(t, k = speed) sways body + tail. */
export function makeReefShark({ top = 0x6d7a86, belly = 0xeef0f2 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const tm = mat(top, 0.45), bm = mat(belly, 0.5), black = mat(0x111214, 0.25);
  const b = mk(new THREE.SphereGeometry(0.42, 22, 16), tm, body, 0, 0, 0.1); b.scale.set(0.95, 0.85, 2.1);
  const bb = mk(new THREE.SphereGeometry(0.4, 20, 14), bm, body, 0, -0.08, 0.12); bb.scale.set(0.9, 0.6, 2.0);
  const dorsal = mk(new THREE.ConeGeometry(0.26, 0.55, 4), tm, body, 0, 0.45, 0.05); dorsal.scale.set(0.2, 1, 1.2); dorsal.rotation.x = -0.45;
  for (const s of [-1, 1]) { const pf = mk(new THREE.ConeGeometry(0.16, 0.6, 4), tm, body, s * 0.38, -0.18, 0.35); pf.scale.set(1, 1, 0.2); pf.rotation.set(-0.5, 0, s * 2.0); }
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.04, 10, 8), black, body, s * 0.26, 0.08, 0.72);
  const mouth = mk(new THREE.BoxGeometry(0.26, 0.02, 0.03), mat(0x3a2a2a, 0.6), body, 0, -0.17, 0.78); mouth.rotation.x = 0.4;
  const tail = new THREE.Group(); tail.position.z = -0.7; body.add(tail);
  const stalk = mk(new THREE.ConeGeometry(0.2, 0.7, 12), tm, tail, 0, 0, -0.3); stalk.rotation.x = -PI / 2;
  for (const [y, r] of [[0.32, 0.6], [-0.2, 2.4]]) { const t = mk(new THREE.ConeGeometry(0.18, 0.62, 4), tm, tail, 0, y, -0.65); t.scale.set(0.2, 1, 1); t.rotation.x = r; }
  return { g, body, tail, swim(t, k = 1) { tail.rotation.y = 0.42 * Math.sin(t * 3.2 * k); body.rotation.y = -0.07 * Math.sin(t * 3.2 * k - 0.6); } };
}

// ---------------------------------------------------------------- dh005's cast, moved here so later videos can import them
export function googly(parent, x, y, z, r = 0.05, look = 0) {
  const e = mk(new THREE.SphereGeometry(r, 14, 10), mat(0xffffff, 0.3), parent, x, y, z); e.scale.z = 0.6;
  mk(new THREE.SphereGeometry(r * 0.48, 10, 8), mat(0x141010, 0.3), parent, x + look * r * 0.3, y - r * 0.1, z + r * 0.45);
}

// ---------------------------------------------------------------- the cast of brainrot (our own toy takes)
/** the log with the bat: faces +z, feet at y 0, ~1.7 m. arms[1] = its +x arm, holding the bat. */
export function makeLog() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const bark = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#8a5a32'; c.fillRect(0, 0, w, h); const R = rng(3);
    for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(60,34,18,${0.25 + R() * 0.35})`; c.lineWidth = 2 + R() * 4; const x = R() * w; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + (R() - 0.5) * 20, h * 0.3, x + (R() - 0.5) * 20, h * 0.7, x + (R() - 0.5) * 14, h); c.stroke(); }
    for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(50,28,14,.6)'; c.beginPath(); c.ellipse(R() * w, R() * h, 9, 14, 0, 0, 7); c.fill(); }
  }, [2, 1]);
  const rings = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e2b98a'; c.fillRect(0, 0, w, h); for (let r = 10; r < 128; r += 11) { c.strokeStyle = 'rgba(150,96,50,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(128, 128, r, 0, 7); c.stroke(); } });
  const R0 = 0.3, TH = 1.15;
  mk(new THREE.CylinderGeometry(R0, R0 * 1.05, TH, 28), new THREE.MeshStandardMaterial({ map: bark, roughness: 0.9 }), body, 0, 0.5 + TH / 2, 0);
  mk(new THREE.CircleGeometry(R0, 28), new THREE.MeshStandardMaterial({ map: rings, roughness: 0.8 }), body, 0, 0.5 + TH + 0.002, 0).rotation.x = -PI / 2;
  const face = new THREE.Group(); face.position.set(0, 1.33, 0); body.add(face);
  const white = mat(0xffffff, 0.3), black = mat(0x141010, 0.3), pupils = [];
  for (const s of [-1, 1]) {
    const e = mk(new THREE.SphereGeometry(0.09, 16, 12), white, face, s * 0.12, 0.04, R0 * 0.92); e.scale.z = 0.55;
    pupils.push(mk(new THREE.SphereGeometry(0.04, 12, 10), black, face, s * 0.12, 0.035, R0 * 0.92 + 0.045));
    mk(new THREE.BoxGeometry(0.14, 0.032, 0.03), mat(0x3a2414, 0.8), face, s * 0.12, 0.16, R0 * 0.98).rotation.z = s * -0.2;
  }
  const mouth = mk(new THREE.BoxGeometry(0.22, 0.035, 0.03), mat(0x3a1a12, 0.6), face, 0, -0.15, R0 * 0.98);
  const mouthO = mk(new THREE.SphereGeometry(0.065, 12, 10), mat(0x3a1a12, 0.6), face, 0, -0.16, R0 * 0.93); mouthO.scale.z = 0.5; mouthO.visible = false;
  const wood = mat(0x9a6a3a, 0.85), arms = [], legs = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * (R0 + 0.02), 1.12, 0); body.add(sh);
    mk(new THREE.CapsuleGeometry(0.045, 0.42, 4, 10), wood, sh, 0, -0.25, 0);
    const hand = new THREE.Group(); hand.position.y = -0.5; sh.add(hand); mk(new THREE.SphereGeometry(0.07, 12, 10), wood, hand);
    arms.push({ sh, hand, s });
    const hip = new THREE.Group(); hip.position.set(s * 0.13, 0.55, 0); body.add(hip);
    mk(new THREE.CapsuleGeometry(0.055, 0.38, 4, 10), wood, hip, 0, -0.25, 0); mk(new THREE.BoxGeometry(0.13, 0.07, 0.2), mat(0x6a4a2a, 0.8), hip, 0, -0.51, 0.04);
    legs.push(hip);
  }
  const bat = makeBat(); arms[1].hand.add(bat);
  return { g, body, arms, legs, pupils, mouth, mouthO, bat };
}
/** the pentungan / "bat": along −y from its grip (a lathe club) */
export function makeBat(scale = 1, color = 0xd9b07a) {
  const bat = new THREE.Group();
  const prof = [[0.0, 0], [0.028, 0.002], [0.03, 0.05], [0.026, 0.32], [0.05, 0.62], [0.062, 0.8], [0.05, 0.86], [0.0, 0.872]].map(([r, y]) => new THREE.Vector2(r * scale, y * scale));
  const m = mk(new THREE.LatheGeometry(prof, 16), mat(color, 0.6), bat, 0, 0.06 * scale, 0); m.rotation.x = PI;
  return bat;
}
/** pose the log: swing (0 raised → 1 contact), the other arm, a walk phase, a hop, shocked mouth */
export function poseLog(L, o = {}) {
  const sw = o.swing ?? 0;
  L.arms[1].sh.rotation.set(o.rx ?? 0, 0, lerp(2.75, 1.2, sw));
  L.arms[0].sh.rotation.set(o.lx ?? 0, 0, -(o.lz ?? 0.25));
  const ph = o.ph ?? 0; L.legs[0].rotation.x = 0.5 * Math.sin(ph); L.legs[1].rotation.x = -0.5 * Math.sin(ph);
  L.body.position.y = o.hop ?? 0; L.body.rotation.z = o.lean ?? 0;
  L.mouth.visible = !o.o; L.mouthO.visible = !!o.o;
  L.pupils.forEach((p, i) => { p.position.x = (i ? 1 : -1) * 0.12 + (o.look ?? 0) * 0.03; });
}

/** the ballerina with a cappuccino cup for a head (a rig, the head swapped for a cup) */
export function makeBallerina() {
  const r = makePerson({ skin: 0xf3d0b5, top: 0xf2a6c0, collar: 0xf2a6c0, pants: 0xf7dde4, shoes: 0xf2a6c0, hair: 0x5a3a24, hairStyle: 'none' });
  r.head.g.visible = false;
  const cup = new THREE.Group(); cup.position.y = 0.16; r.headG.add(cup);
  mk(new THREE.CylinderGeometry(0.17, 0.125, 0.25, 26), mat(0xfbfaf6, 0.25), cup, 0, 0, 0);
  const foam = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#c9925a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f6e6cc'; c.beginPath(); c.arc(128, 128, 86, 0, 7); c.fill(); c.fillStyle = '#b07a48'; c.beginPath(); c.moveTo(128, 172); c.bezierCurveTo(60, 120, 92, 66, 128, 104); c.bezierCurveTo(164, 66, 196, 120, 128, 172); c.fill(); });
  mk(new THREE.CircleGeometry(0.158, 26), new THREE.MeshStandardMaterial({ map: foam, roughness: 0.7 }), cup, 0, 0.115, 0).rotation.x = -PI / 2;
  mk(new THREE.TorusGeometry(0.075, 0.022, 8, 16), mat(0xfbfaf6, 0.25), cup, 0.19, 0, 0).rotation.y = 0;
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.022, 10, 8), mat(0x141010, 0.3), cup, s * 0.06, 0.02, 0.152); mk(new THREE.CircleGeometry(0.03, 12), mat(0xf29aa8, 0.6), cup, s * 0.1, -0.03, 0.148); }
  mk(new THREE.TorusGeometry(0.03, 0.008, 6, 12, PI), mat(0x6e2f2b, 0.5), cup, 0, -0.035, 0.15).rotation.z = PI;
  const plate = mk(new THREE.CylinderGeometry(0.23, 0.2, 0.025, 26), mat(0xfbfaf6, 0.25), r.headG, 0, 0.03, 0); void plate;
  const tutu = new THREE.Group(); tutu.position.y = 0.02; r.pelvis.add(tutu);
  for (const [y, rr] of [[0.0, 0.46], [-0.04, 0.4]]) mk(new THREE.CylinderGeometry(0.19, rr, 0.13, 26, 1, true), mat(0xf7c3d4, 0.8, { side: THREE.DoubleSide }), tutu, 0, y, 0);
  return r;
}
/** the banana with a chimp head, faces +z, ~1.55 m. arms[i].hand for props */
export function makeChimpBanana() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const yel = mat(0xf2d24a, 0.55), fur = mat(0x5a3a24, 0.8), skin = mat(0xd9b48a, 0.7);
  const b = mk(new THREE.CapsuleGeometry(0.27, 0.72, 8, 20), yel, body, 0, 0.92, 0); b.rotation.x = 0.1;
  mk(new THREE.CylinderGeometry(0.05, 0.07, 0.1, 10), mat(0x3a2a14, 0.8), body, 0, 0.47, -0.02);
  for (let k = 0; k < 4; k++) { const a = k * PI / 2 + PI / 4, fl = new THREE.Group(); fl.position.set(Math.cos(a) * 0.22, 1.33, Math.sin(a) * 0.22); fl.rotation.set(0, -a + PI / 2, 0); body.add(fl); const f = mk(new THREE.CapsuleGeometry(0.08, 0.3, 4, 10), yel, fl, 0, -0.12, 0.08); f.rotation.x = 0.55; f.scale.set(1, 1, 0.35); }
  const head = new THREE.Group(); head.position.y = 1.47; body.add(head);
  mk(new THREE.SphereGeometry(0.21, 20, 16), fur, head);
  const fc = mk(new THREE.SphereGeometry(0.16, 18, 14), skin, head, 0, -0.03, 0.1); fc.scale.set(1.05, 0.95, 0.75);
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.065, 12, 10), skin, head, s * 0.21, 0.02, 0).scale.z = 0.5; mk(new THREE.SphereGeometry(0.03, 10, 8), mat(0x141010, 0.3), head, s * 0.06, 0.04, 0.205); }
  mk(new THREE.BoxGeometry(0.1, 0.02, 0.02), mat(0x3a1a12, 0.6), head, 0, -0.09, 0.215);
  const arms = [], legs = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.28, 1.1, 0); body.add(sh);
    mk(new THREE.CapsuleGeometry(0.04, 0.34, 4, 10), fur, sh, 0, -0.2, 0);
    const hand = new THREE.Group(); hand.position.y = -0.4; sh.add(hand); mk(new THREE.SphereGeometry(0.055, 10, 8), skin, hand);
    arms.push({ sh, hand, s });
    const hip = new THREE.Group(); hip.position.set(s * 0.12, 0.5, 0); body.add(hip);
    mk(new THREE.CapsuleGeometry(0.05, 0.32, 4, 10), fur, hip, 0, -0.22, 0); mk(new THREE.BoxGeometry(0.12, 0.06, 0.2), skin, hip, 0, -0.46, 0.04);
    legs.push(hip);
  }
  return { g, body, head, arms, legs };
}

export { lerp };
