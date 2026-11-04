// The Eiffel Tower in 1925, toon look (dh015): paris.js's iron lattice (four curved legs with X-bracing, the base arches,
// two platforms + the top) rebuilt with two-tone toon materials in the 1925 yellow-brown paint, rusty riveted chords at
// the foot of every leg (the close-up), stone piers, the Champ de Mars toward +z (gravel esplanade, lawns, rows of
// trees, benches, lamp posts, a kiosk), a ring of cream Haussmann blocks with mansard roofs, and a giant "SOLD" tag
// that can hang from the first platform. Tower centred at the origin (legs at x, z = ±13.5 at the ground); cameras on
// the esplanade at z ≈ 14…40 looking back at it (−z). Handles: sun + aimSun(cx, cz, half), tag {g, swing}, DIMS.
// Video must set camera.far ≈ 900 (the blocks sit at r ≈ 150).
import * as THREE from 'three';
import { toonMat } from '@engine/toon/shade.js';
import { ctex, fitText, tone } from '@engine/toon/paint.js';
import { box, cyl, plane, sun } from '@engine/toon/kit.js';
import { gravel, lawn, haussmann, mansard, girder } from './paint1925.js';

const PI = Math.PI;
export const DIMS = { H: 72, base: 13.5, p1: 12.4, p2: 25, p3: 60 };
const LEGS = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
export const corner = (y) => (y <= DIMS.p2 ? 4.3 + (DIMS.base - 4.3) * Math.pow(1 - y / DIMS.p2, 1.5) : 4.3 - 3.5 * Math.pow((y - DIMS.p2) / (DIMS.p3 - DIMS.p2), 0.8));
export const legW = (y) => 5.4 - 2.6 * Math.min(1, y / DIMS.p2);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/** a deterministic 0..1 hash */
const hh = (i) => { const v = Math.sin(i * 127.1 + 31.7) * 43758.5453; return v - Math.floor(v); };

function instanced(parent, geo, m, mats) {
  const im = new THREE.InstancedMesh(geo, m, mats.length);
  mats.forEach((x, i) => im.setMatrixAt(i, x));
  im.castShadow = im.receiveShadow = true; parent.add(im); return im;
}

export function buildTower(root, { tag = true } = {}) {
  // ---------------------------------------------------------------- ground
  const g = plane(root, 900, 900, toonMat(gravel('#d8c6a2', [120, 120])), 0, 0, 0); g.rotation.x = -PI / 2;
  const grass = toonMat(lawn('#86b456', [3, 14]));
  for (const s of [-1, 1]) { const l = plane(root, 24, 120, grass, s * 17, 0.012, 82); l.rotation.x = -PI / 2; l.castShadow = false; }
  const bed = toonMat('#6a4a32');
  for (const s of [-1, 1]) box(root, 1.0, 0.24, 30, bed, s * 4.8, 0.12, 36).castShadow = false;
  const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.2, 0), toonMat('#ffffff'), 120), m4 = new THREE.Matrix4();
  const FLC = ['#d2483f', '#f2b632', '#e58fa6', '#f6f1e6', '#8f6fb8'].map((c) => new THREE.Color(c));
  for (let i = 0; i < 120; i++) { const s = i % 2 ? 1 : -1, k = i >> 1; fl.setMatrixAt(i, m4.makeTranslation(s * (4.55 + (k % 2) * 0.45), 0.3, 21.5 + k * 0.48)); fl.setColorAt(i, FLC[(k + (s > 0 ? 2 : 0)) % 5]); }
  fl.castShadow = true; root.add(fl);

  // ---------------------------------------------------------------- the tower: instanced beams
  const beams = [];
  const beam = (a, b, th) => beams.push([a.clone(), b.clone(), th]);
  function leg(sx, sz) {
    const N = 10, pts = [];
    for (let i = 0; i <= N; i++) {
      const y = (i / N) * DIMS.p2, c = corner(y), w = legW(y), o = [c, c - w];
      pts.push([V(sx * o[0], y, sz * o[0]), V(sx * o[1], y, sz * o[0]), V(sx * o[1], y, sz * o[1]), V(sx * o[0], y, sz * o[1])]);
    }
    for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) {
      const a = pts[i][k], b = pts[i + 1][k], a2 = pts[i][(k + 1) % 4], b2 = pts[i + 1][(k + 1) % 4];
      if (i > 0) beam(a, b, 0.5);   // the bottom chords are the rusty riveted girders below
      beam(a, b2, 0.18); beam(a2, b, 0.18); beam(b, b2, 0.2);
    }
    return pts;
  }
  const legPts = LEGS.map(([sx, sz]) => leg(sx, sz));
  {
    const N = 12, pts = [];
    for (let i = 0; i <= N; i++) { const y = DIMS.p2 + (i / N) * (DIMS.p3 - DIMS.p2), c = corner(y); pts.push(LEGS.map(([sx, sz]) => V(sx * c, y, sz * c))); }
    for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) {
      const a = pts[i][k], b = pts[i + 1][k], a2 = pts[i][(k + 1) % 4], b2 = pts[i + 1][(k + 1) % 4];
      beam(a, b, 0.38); beam(a, b2, 0.14); beam(a2, b, 0.14); beam(b, b2, 0.16);
    }
  }
  for (let side = 0; side < 4; side++) {   // the base arches + spokes up to the first platform
    const [ax, az] = LEGS[side], [bx, bz] = LEGS[(side + 1) % 4], pts = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16, y = 4.0 + 7.4 * Math.sin(u * PI), c = corner(y) - legW(y) * 0.5;
      pts.push(V(ax * c + (bx * c - ax * c) * u, y, az * c + (bz * c - az * c) * u));
    }
    for (let i = 0; i < 16; i++) { beam(pts[i], pts[i + 1], 0.4); if (i % 2 === 0 && i) beam(pts[i], V(pts[i].x, DIMS.p1 - 0.6, pts[i].z), 0.12); }
  }
  const iron = toonMat('#a37244'), ironDk = toonMat('#8a5e38');
  const unit = new THREE.BoxGeometry(1, 1, 1), up = V(0, 1, 0), d = V(0, 0, 0), mid = V(0, 0, 0), sc = V(1, 1, 1), q = new THREE.Quaternion();
  const mats = { thick: [], thin: [] };
  for (const [a, b, th] of beams) {
    d.subVectors(b, a); const len = d.length(); q.setFromUnitVectors(up, d.normalize()); mid.addVectors(a, b).multiplyScalar(0.5); sc.set(th, len, th);
    (th >= 0.3 ? mats.thick : mats.thin).push(new THREE.Matrix4().compose(mid, q, sc));
  }
  const tower = new THREE.Group(); root.add(tower);
  instanced(tower, unit, iron, mats.thick); instanced(tower, unit, ironDk, mats.thin);
  // rusty riveted chords at the foot of every leg (y 0 -> 2.5) + stone piers
  const rustM = toonMat(girder('#a37244', 1, [1, 2])), pierM = toonMat('#cbbd9f');
  legPts.forEach((pts) => {
    for (let k = 0; k < 4; k++) {
      const a = pts[0][k], b = pts[1][k]; d.subVectors(b, a); const len = d.length(); q.setFromUnitVectors(up, d.clone().normalize());
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, len, 0.62), rustM); m.position.addVectors(a, b).multiplyScalar(0.5); m.quaternion.copy(q); m.castShadow = m.receiveShadow = true; tower.add(m);
      box(tower, 1.5, 0.9, 1.5, pierM, a.x, 0.3, a.z);
    }
  });
  // platforms: decks with a glazed gallery + railings, the top lantern + mast + flag
  const deckM = toonMat('#8a5e38'), galM = toonMat(ctex('gallery25', 256, 64, (gg, r, W, Hh) => { gg.fillStyle = '#9a6a40'; gg.fillRect(0, 0, W, Hh); for (let x = 4; x < W; x += 22) { gg.fillStyle = '#cfe0ec'; gg.fillRect(x, 12, 16, 40); gg.fillStyle = 'rgba(255,255,255,0.5)'; gg.fillRect(x + 2, 14, 4, 30); } }, [6, 1]));
  const deck = (y, c, thick, gal) => {
    for (let k = 0; k < 4; k++) {
      const gr = new THREE.Group(); gr.rotation.y = (k * PI) / 2; tower.add(gr);
      box(gr, 2 * c + 1.2, thick, 2.6, deckM, 0, y, c - 0.7);
      if (gal) box(gr, 2 * c, gal, 0.3, galM, 0, y + thick / 2 + gal / 2, c - 0.2);
      box(gr, 2 * c + 1.2, 0.1, 0.1, ironDk, 0, y + thick / 2 + (gal || 0) + 1.0, c + 0.55);
    }
  };
  deck(DIMS.p1, corner(DIMS.p1) + 0.4, 1.4, 2.4);
  deck(DIMS.p2, corner(DIMS.p2) + 0.4, 1.0, 2.0);
  box(tower, 3.4, 2.6, 3.4, galM, 0, DIMS.p3 + 1.2, 0, 0.1);
  cyl(tower, 0.9, 1.5, 3.2, deckM, 0, DIMS.p3 + 4.0, 0, 8);
  cyl(tower, 0.2, 0.36, DIMS.H - DIMS.p3 - 5, toonMat('#e2dccf'), 0, (DIMS.H + DIMS.p3 + 5) / 2, 0, 8);
  const flag = plane(tower, 2.2, 1.4, toonMat(ctex('tricolore', 96, 64, (gg, r, W, Hh) => { ['#2f4f9f', '#f4f4f2', '#d23a3f'].forEach((c, i) => { gg.fillStyle = c; gg.fillRect((i * W) / 3, 0, W / 3, Hh); }); }), { side: THREE.DoubleSide }), 1.25, DIMS.H - 1.2, 0);

  // ---------------------------------------------------------------- the SOLD tag (hangs from the first platform)
  let tagG = null;
  if (tag) {
    tagG = new THREE.Group(); tagG.position.set(0, DIMS.p1 - 0.75, corner(DIMS.p1) + 0.9); tower.add(tagG);
    const tagTex = ctex('soldTag', 768, 448, (gg, r, W, Hh) => {
      gg.fillStyle = '#f3e3b8'; gg.beginPath(); gg.moveTo(90, 0); gg.lineTo(W, 0); gg.lineTo(W, Hh); gg.lineTo(90, Hh); gg.lineTo(0, Hh / 2); gg.closePath(); gg.fill();
      gg.strokeStyle = '#2a1c14'; gg.lineWidth = 16; gg.stroke();
      gg.fillStyle = '#ffffff'; gg.beginPath(); gg.arc(72, Hh / 2, 26, 0, 7); gg.fill(); gg.lineWidth = 8; gg.stroke();
      gg.fillStyle = '#c8322e'; gg.textAlign = 'center'; fitText(gg, 'SOLD', W * 0.57, Hh * 0.58, W - 200, 230, 'bold', 'Georgia, serif');
      gg.fillStyle = '#2a1c14'; fitText(gg, 'VENDU · 7,000 TONNES', W * 0.57, Hh * 0.86, W - 220, 50, 'bold', 'Georgia, serif');
    });
    const tg = new THREE.Group(); tagG.add(tg);   // swing pivot at the strings' top
    const card = plane(tg, 11, 6.4, toonMat(tagTex, { alphaTest: 0.5, side: THREE.DoubleSide }), 0, -5.0, 0); card.castShadow = true;
    const str = new THREE.MeshBasicMaterial({ color: 0x3a2a20 });
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), str); st.position.set(s * 2.0, -0.95, 0); st.rotation.z = s * 1.0; tg.add(st); }
    tagG.userData.swing = tg;
  }

  // ---------------------------------------------------------------- the Champ de Mars + the city around it
  const trunkM = toonMat('#6b4a33'), leafA = toonMat('#5f9a45'), leafB = toonMat('#4f8a3d');
  const tm = [], la = [], lb = [], M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = V(1, 1, 1);
  let n = 0;
  const tree = (x, z, s = 1) => {
    tm.push(new THREE.Matrix4().compose(V(x, 2.1 * s, z), Q, V(0.5 * s, 4.2 * s, 0.5 * s)));
    for (let k = 0; k < 3; k++) { const r = (2.1 - k * 0.35) * s; (hh(n++) < 0.5 ? la : lb).push(new THREE.Matrix4().compose(V(x + (hh(n++) - 0.5) * 1.4 * s, (4.9 + k * 1.0) * s, z + (hh(n++) - 0.5) * 1.4 * s), Q, V(r, r * 0.9, r))); }
  };
  for (const s of [-1, 1]) for (const x of [31, 37]) for (let z = 18; z < 150; z += 7.5) tree(s * x + (hh(n++) - 0.5), z + (hh(n++) - 0.5) * 2, 0.9 + hh(n++) * 0.25);
  for (let i = 0; i < 26; i++) { const a = -PI * 0.05 - (i / 25) * PI * 0.9; tree(Math.cos(a) * 48, Math.sin(a) * 48 - 6, 1.05); }
  instanced(root, new THREE.CylinderGeometry(0.5, 0.6, 1, 8), trunkM, tm);
  const blob = new THREE.IcosahedronGeometry(1, 1);
  instanced(root, blob, leafA, la); instanced(root, blob, leafB, lb);
  void M; void S;
  // benches + lamp posts along the lawns, a kiosk
  const ironG = toonMat('#2f4a3a'), benchM = toonMat('#3f6a4a'), globe = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.15, 1.0) });
  for (const s of [-1, 1]) for (let z = 22; z < 80; z += 9) {
    const b = new THREE.Group(); b.position.set(s * 5.8, 0, z); b.rotation.y = -s * PI / 2; root.add(b);
    for (let i = 0; i < 3; i++) box(b, 1.8, 0.05, 0.13, benchM, 0, 0.45, -0.16 + i * 0.15);
    box(b, 1.8, 0.3, 0.05, benchM, 0, 0.75, -0.28); for (const x of [-0.8, 0.8]) box(b, 0.06, 0.45, 0.45, ironG, x, 0.225, 0);
    cyl(root, 0.07, 0.11, 3.6, ironG, s * 5.8, 1.8, z + 4.5, 10);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), globe); gl.position.set(s * 5.8, 3.78, z + 4.5); root.add(gl);
  }
  const kiosk = new THREE.Group(); kiosk.position.set(11.5, 0, 40); root.add(kiosk);   // off the limo's camera path (z 29.8)
  cyl(kiosk, 0.9, 0.9, 2.6, toonMat(ctex('kiosk', 256, 128, (gg, r, W, Hh) => { gg.fillStyle = '#2f5a3a'; gg.fillRect(0, 0, W, Hh); for (let x = 8; x < W; x += 40) { gg.fillStyle = ['#e8c45a', '#c9473e', '#f1ebdd'][(x / 40) % 3 | 0]; gg.fillRect(x, 20, 30, 70); } })), 0, 1.3, 0, 16);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.9, 16), toonMat('#2a4a34')); cap.position.y = 3.05; cap.castShadow = true; kiosk.add(cap);
  // Haussmann blocks in a ring (behind the tower and down both sides of the lawn), cream stone + slate mansards
  const roofM = toonMat(mansard('#7d8794', [6, 1])), slab = toonMat('#d8ccb4');
  for (let i = 0; i < 30; i++) {
    const a = PI * 0.62 + (i / 29) * PI * 1.76, r = 150 + hh(i * 7) * 25, x = Math.cos(a) * r, z = Math.sin(a) * r - 10;
    if (z > 60 && Math.abs(x) < 70) continue;
    const w = 34 + hh(i * 3) * 16, hgt = 21 + hh(i * 5) * 6, gr = new THREE.Group(); gr.position.set(x, 0, z); gr.lookAt(0, 0, -10); root.add(gr);
    const fm = toonMat(haussmann('b' + (i % 4), { stone: ['#e8dcc4', '#efe4cf', '#e2d3b8', '#ebe0c9'][i % 4], cols: 6 }));
    fm.map = fm.map.clone(); fm.map.repeat.set(w / 30, 1); fm.map.needsUpdate = true;
    box(gr, w, hgt, 16, [slab, slab, slab, slab, fm, slab], 0, hgt / 2, 0);
    const roof = box(gr, w, 6, 14, roofM, 0, hgt + 2.6, -0.6); roof.scale.set(1, 1, 1);
    box(gr, w - 4, 1.4, 10, slab, 0, hgt + 6.2, -0.6);
  }
  // ---------------------------------------------------------------- sun
  const s = sun(root, [40, 70, 60], [0, 0, 10], { half: 50, map: 4096, far: 300, hemi: [0xdcecff, 0xb49a78, 0.9] });
  s.shadow.bias = -0.0003; s.shadow.normalBias = 0.05;
  const DIR = V(0.45, 0.8, 0.6).normalize();
  function aimSun(cx = 0, cz = 10, half = 50, dir = DIR) {
    s.target.position.set(cx, 0, cz); s.position.copy(s.target.position).addScaledVector(dir, 150);
    Object.assign(s.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 20, far: 320 }); s.shadow.camera.updateProjectionMatrix();
  }
  aimSun();
  root.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshBasicMaterial) o.castShadow = false; });
  void tone; void flag;
  return { root, sun: s, aimSun, tower, tag: tagG, DIMS, corner, legPts };
}
