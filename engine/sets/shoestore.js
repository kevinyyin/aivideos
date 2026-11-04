// SET (dh012): a bright SNEAKER STORE ("TRIPLE KICKS" — a made-up shop that sells sneakers in threes). Room x ∈ [−4, 4],
// z ∈ [−6, 4.5], ceiling 3.3; the entrance (glass) is the +z wall. Shelf walls on x = ±4 (slots face the aisle), the back wall
// (z = −6) carries a big ad poster + the store sign, and the STOCKROOM door at DIMS.door (hinge group `door`, rotation.y > 0
// swings it open into the store). Checkout counter front-left, benches + a foot measure in the middle, a mirror, plants.
//   slots[]: {x, y, z, ry} — shelf spots facing the aisle (put 3 sneakers per slot side by side: the joke). The video fills them.
//   setPoster(draw) redraws the poster canvas (1024×1400 portrait). update(t) = nothing yet (kept for symmetry).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

const PI = Math.PI;
export const DIMS = { x0: -4, x1: 4, z0: -6, z1: 4.5, H: 3.3, door: [2.3, -6], counter: [-2.6, 2.4], bench: [0, -1.2] };

export function buildShoeStore(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 17), D = DIMS;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  // floor (light oak planks), walls, ceiling with light panels
  const floorT = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 8; y++) { g.fillStyle = y % 2 ? '#d9b98a' : '#d2b07e'; g.fillRect(0, y * 32, w, 32); g.fillStyle = 'rgba(120,80,40,.25)'; g.fillRect(0, y * 32, w, 2); g.fillRect(((y * 97) % 256), y * 32, 2, 32); } }, [4, 5]);
  const fl = mk(new THREE.PlaneGeometry(D.x1 - D.x0, D.z1 - D.z0), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.55 }), root, 0, 0, (D.z0 + D.z1) / 2); fl.rotation.x = -PI / 2; fl.castShadow = false;
  const wallM = mat(0xf4f1ea, 0.85), accent = mat(0x2f6fd8, 0.6);
  box(8, D.H, 0.2, wallM, 0, D.H / 2, D.z0 - 0.1); box(0.2, D.H, 10.5, wallM, D.x0 - 0.1, D.H / 2, -0.75); box(0.2, D.H, 10.5, wallM, D.x1 + 0.1, D.H / 2, -0.75);
  box(8.4, 0.2, 10.9, mat(0xfbfbf8, 0.9), 0, D.H + 0.1, -0.75);
  box(8, 0.12, 0.04, accent, 0, 0.06, D.z0 + 0.01);
  for (let z = -5; z <= 3; z += 2) { const p = box(1.2, 0.04, 0.5, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, D.H - 0.02, z); p.castShadow = false; }
  // front: glass wall with a door frame (seen only from inside)
  const glass = mk(new THREE.PlaneGeometry(8, D.H), new THREE.MeshStandardMaterial({ color: 0xcfe6f2, transparent: true, opacity: 0.25, roughness: 0.05 }), root, 0, D.H / 2, D.z1); glass.rotation.y = PI; glass.castShadow = false;
  box(8, 0.1, 0.1, mat(0x2a2a2e, 0.5), 0, D.H - 0.05, D.z1);
  // shelf walls: 5 shelves × 6 bays on each side wall; slots face the aisle
  const shelfM = mat(0xfbfbf8, 0.6), backM = mat(0xdfe8f2, 0.8);
  const slots = [];
  for (const s of [-1, 1]) {
    const x = s * (D.x1 - 0.25);
    box(0.06, 2.7, 9.0, backM, s * (D.x1 - 0.02), 1.45, -1.3);
    for (let lv = 0; lv < 5; lv++) {
      const y = 0.45 + lv * 0.5;
      box(0.45, 0.04, 9.0, shelfM, x, y, -1.3);
      for (let bay = 0; bay < 9; bay++) slots.push({ x: x + s * 0.02, y: y + 0.02, z: -5.3 + bay * 1.0, ry: -s * PI / 2 });
    }
    for (let bay = 0; bay <= 9; bay++) box(0.45, 2.55, 0.04, shelfM, x, 1.47, -5.8 + bay * 1.0);
    const strip = box(0.04, 0.06, 9, new THREE.MeshBasicMaterial({ color: 0xffffff }), s * (D.x1 - 0.48), 2.82, -1.3); strip.castShadow = false;
  }
  // back wall: the ad poster (left), the store sign, the stockroom door (right)
  const posterC = document.createElement('canvas'); posterC.width = 1024; posterC.height = 1400;
  const posterT = new THREE.CanvasTexture(posterC); posterT.colorSpace = THREE.SRGBColorSpace;
  const poster = mk(new THREE.PlaneGeometry(1.8, 2.46), new THREE.MeshStandardMaterial({ map: posterT, roughness: 0.6 }), root, -1.7, 1.55, D.z0 + 0.02); poster.castShadow = false;
  function setPoster(draw) { const g = posterC.getContext('2d'); g.clearRect(0, 0, 1024, 1400); draw(g, 1024, 1400); posterT.needsUpdate = true; }
  setPoster((g, w, h) => { g.fillStyle = '#2f6fd8'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 150px Arial Black, Helvetica, sans-serif'; g.textAlign = 'center'; g.fillText('SALE', w / 2, h / 2); });
  const signT = canvasTex(1024, 160, (g, w, h) => { g.fillStyle = '#1a1c22'; g.fillRect(0, 0, w, h); g.fillStyle = '#7ad6ff'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 112; g.font = `900 ${fs}px Arial Black, Helvetica, sans-serif`; while (g.measureText(opts.sign ?? 'TRIPLE KICKS').width > w - 70) { fs -= 4; g.font = `900 ${fs}px Arial Black, Helvetica, sans-serif`; } g.fillText(opts.sign ?? 'TRIPLE KICKS', w / 2, h / 2 + 4); });
  const sign = mk(new THREE.PlaneGeometry(3.4, 0.53), new THREE.MeshBasicMaterial({ map: signT }), root, 0.4, 3.0, D.z0 + 0.03); sign.castShadow = false;
  const [dx, dz] = D.door;
  box(1.25, 2.3, 0.12, mat(0x2a2a2e, 0.5), dx, 1.15, dz + 0.02);              // dark doorway
  for (const s of [-1, 1]) box(0.08, 2.3, 0.16, mat(0x9a9ca2, 0.4), dx + s * 0.62, 1.15, dz + 0.06);
  box(1.32, 0.08, 0.16, mat(0x9a9ca2, 0.4), dx, 2.32, dz + 0.06);
  const door = new THREE.Group(); door.position.set(dx - 0.58, 0, dz + 0.1); root.add(door);      // hinge on its left edge
  box(1.14, 2.22, 0.05, mat(0xe8e2d6, 0.6), 0.57, 1.12, 0, door);
  mk(new THREE.PlaneGeometry(0.8, 0.22), new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#d2483f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'bold 36px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STOCKROOM', w / 2, h / 2 + 2); }) }), door, 0.57, 1.7, 0.03);
  mk(new THREE.SphereGeometry(0.035, 8, 6), mat(0x9a9ca2, 0.3, { metalness: 0.7 }), door, 1.0, 1.05, 0.05);
  // checkout counter with a register, benches + a foot measure, a mirror, plants, a shoe-box pyramid
  const [cx, cz] = D.counter;
  box(1.8, 1.0, 0.7, mat(0x2f6fd8, 0.55), cx, 0.5, cz); box(1.9, 0.05, 0.8, mat(0xfbfbf8, 0.4), cx, 1.02, cz);
  const reg = box(0.36, 0.2, 0.3, mat(0x2a2a2e, 0.4), cx + 0.4, 1.15, cz); reg.rotation.y = 0.3;
  for (const z of [D.bench[1], D.bench[1] + 2.4]) { box(1.6, 0.42, 0.5, mat(0x3a3d44, 0.5), 0, 0.21, z); box(1.5, 0.08, 0.45, mat(0xe2574c, 0.6), 0, 0.46, z); }
  mk(new RoundedBoxGeometry(0.22, 0.03, 0.42, 2, 0.01), mat(0x9a9ca2, 0.4, { metalness: 0.6 }), root, 0.9, 0.015, D.bench[1] + 0.9);
  const mirror = mk(new THREE.PlaneGeometry(0.5, 1.4), new THREE.MeshStandardMaterial({ color: 0xd8e6ee, roughness: 0.05, metalness: 0.9 }), root, 3.75, 0.95, 2.6); mirror.rotation.y = -PI / 2; void mirror;
  for (const [x, z] of [[-3.5, 3.9], [3.5, 3.9], [-0.6, -5.6]]) { mk(new THREE.CylinderGeometry(0.2, 0.16, 0.45, 12), mat(0xf4f1ea, 0.5), root, x, 0.22, z); for (let k = 0; k < 5; k++) mk(new THREE.SphereGeometry(0.2, 10, 8), mat(0x3f8a4a, 0.8), root, x + Math.cos(k * 1.3) * 0.1, 0.65 + k * 0.1, z + Math.sin(k * 1.3) * 0.1); }
  const boxM = [mat(0x2f6fd8, 0.6), mat(0xfbfbf8, 0.6)];
  for (let r = 0; r < 4; r++) for (let k = 0; k <= 3 - r; k++) box(0.5, 0.2, 0.34, boxM[(r + k) % 2], 1.6 + k * 0.52 + r * 0.26 - 0.8, 0.1 + r * 0.2, 2.9);
  // lights: bright retail
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd9c8a8, 1.35); root.add(hemi);
  const key = new THREE.DirectionalLight(0xfff6ea, 1.4); key.position.set(2, 9, 6); key.target.position.set(0, 0, -2); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 7, bottom: -7, near: 1, far: 30 });
  for (const z of [-4, 0, 3]) { const L = new THREE.PointLight(0xfff4e6, 4, 7, 1.6); L.position.set(0, D.H - 0.3, z); root.add(L); }
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  void R;
  return { root, D: DIMS, slots, door, setPoster, update() {}, lights: { hemi, key } };
}
