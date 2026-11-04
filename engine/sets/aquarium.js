// SET (dh012): an AQUARIUM viewing hall with one giant tank window. Tank x ∈ [−6, 6], z ∈ [−11, 0], sand at y DIMS.sand,
// water surface y DIMS.surface; the acrylic window is the z = 0 plane (y 0.25–4.6). The dark viewing hall is z ∈ [0, 8]: kids
// stand at z ≈ 0.25 with their faces at the glass (a camera INSIDE the tank at z ≈ −2 looking +z sees them lit blue).
// Inside: rocks, corals, swaying kelp, an instanced fish school, light rays, scrolling caustics on the sand.
//   update(t) animates kelp/fish/caustics. Own blue `fog` (it IS the water). SHARK REEF sign over the window.
import * as THREE from 'three';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

const PI = Math.PI;
export const DIMS = { x0: -6, x1: 6, z0: -11, sand: 0.3, surface: 4.8, glassTop: 4.6, hallZ: 8 };

export function buildAquarium(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 44), D = DIMS;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0x0c4468, 4, 30);
  // tank shell: back + side walls painted deep blue, sand floor with caustics
  const deep = mat(0x0e3a5e, 0.9);
  box(12.4, 5.4, 0.2, new THREE.MeshBasicMaterial({ color: 0x0c3a5c }), 0, 2.7, D.z0 - 0.1);
  box(0.2, 5.4, 11.2, deep, D.x0 - 0.1, 2.7, D.z0 / 2); box(0.2, 5.4, 11.2, deep, D.x1 + 0.1, 2.7, D.z0 / 2);
  const sandT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#c9b48a'; g.fillRect(0, 0, w, h); const RR = rng(3); for (let i = 0; i < 3000; i++) { g.fillStyle = RR() < 0.5 ? 'rgba(120,100,70,.2)' : 'rgba(255,245,220,.2)'; g.fillRect(RR() * w, RR() * h, 2, 2); } }, [6, 6]);
  const sand = mk(new THREE.PlaneGeometry(12, 11.2), new THREE.MeshStandardMaterial({ map: sandT, roughness: 0.95 }), root, 0, D.sand, D.z0 / 2); sand.rotation.x = -PI / 2; sand.castShadow = false;
  const causT = canvasTex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(200,240,255,.55)'; const RR = rng(8); for (let i = 0; i < 46; i++) { g.lineWidth = 2 + RR() * 3; g.beginPath(); const x = RR() * w, y = RR() * h; g.moveTo(x, y); g.bezierCurveTo(x + 30, y - 20, x + 50, y + 25, x + 80, y + 4); g.stroke(); } }, [4, 4]);
  const caus = mk(new THREE.PlaneGeometry(12, 11.2), new THREE.MeshBasicMaterial({ map: causT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 }), root, 0, D.sand + 0.01, D.z0 / 2); caus.rotation.x = -PI / 2; caus.castShadow = false;
  // rocks + corals
  const rockM = [mat(0x6a6a72, 0.9), mat(0x5a5048, 0.9), mat(0x7a7468, 0.9)];
  for (const [x, z, s] of [[-4.2, -8, 2.0], [3.6, -8.6, 2.4], [-1.0, -9.8, 1.6], [5.0, -4.5, 1.3], [-5.0, -3.6, 1.2], [1.6, -10, 1.4]]) { const r = mk(new THREE.DodecahedronGeometry(s, 1), rockM[Math.floor(R() * 3)], root, x, D.sand + s * 0.35, z); r.scale.y = 0.7; r.rotation.y = R() * 6; }
  const coralCols = [0xf26a7a, 0xf2a03a, 0xb86ad0, 0xf2d24a, 0x4fd2b0, 0xff8ac0];
  for (let i = 0; i < 40; i++) { const x = -5.5 + R() * 11, z = -10.5 + R() * 9.5; if ((z > -2.2 && Math.abs(x) < 3) || (z > -7.5 && Math.abs(x) < 2.6)) continue; const c = new THREE.Group(); c.position.set(x, D.sand, z); root.add(c); const col = mat(coralCols[i % 6], 0.7); for (let k = 0; k < 4; k++) { const b = mk(new THREE.CylinderGeometry(0.03, 0.05, 0.4 + R() * 0.4, 6), col, c, (R() - 0.5) * 0.2, 0.25, (R() - 0.5) * 0.2); b.rotation.set((R() - 0.5) * 0.8, 0, (R() - 0.5) * 0.8); mk(new THREE.SphereGeometry(0.06, 8, 6), col, b, 0, 0.25, 0); } }
  // kelp: tall thin ribbons that sway
  const kelpM = mat(0x5a8a3a, 0.8, { side: THREE.DoubleSide }), kelp = [];
  for (let i = 0; i < 18; i++) { const x = (i % 2 ? -1 : 1) * (3.4 + R() * 2.2), z = -2 - R() * 8.5, h = 2.4 + R() * 1.8; const k = new THREE.Group(); k.position.set(x, D.sand, z); root.add(k); const pl = mk(new THREE.PlaneGeometry(0.25, h, 1, 8), kelpM, k, 0, h / 2, 0); pl.rotation.y = R() * 3; kelp.push({ k, ph: R() * 6 }); }
  // a fish school (instanced) circling the middle of the tank
  const fishGeo = new THREE.ConeGeometry(0.06, 0.22, 6); fishGeo.rotateX(PI / 2);
  const fish = new THREE.InstancedMesh(fishGeo, mat(0xf2c14e, 0.4, { emissive: 0x3a2a00, emissiveIntensity: 0.4 }), 90); fish.castShadow = false; root.add(fish);
  const FISH = Array.from({ length: 90 }, (_, i) => ({ r: 3.0 + R() * 1.4, y: 2.2 + R() * 1.6, ph: R() * 6, sp: 0.32 + R() * 0.08 }));
  FISH.forEach((f, i) => fish.setColorAt(i, new THREE.Color(i % 3 ? 0xf2c14e : 0x7ad6ff)));
  // light rays from the surface (additive, soft)
  const rayT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(200,240,255,.5)'); gr.addColorStop(1, 'rgba(200,240,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  for (let i = 0; i < 7; i++) { const ry = mk(new THREE.PlaneGeometry(0.9, 5), new THREE.MeshBasicMaterial({ map: rayT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.16, side: THREE.DoubleSide }), root, -5 + i * 1.7, 2.6, -4 - (i % 3) * 2.2); ry.rotation.z = 0.25; ry.castShadow = false; }
  const surf = mk(new THREE.PlaneGeometry(12, 11.2), new THREE.MeshBasicMaterial({ color: 0x5ab0d8, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), root, 0, D.surface, D.z0 / 2); surf.rotation.x = PI / 2; surf.castShadow = false;
  // the window: a faint tint + a dark frame; the viewing hall (dark floor, walls, ceiling, benches, a sign)
  const glass = mk(new THREE.PlaneGeometry(11.6, 4.4), new THREE.MeshStandardMaterial({ color: 0x9fd8f2, transparent: true, opacity: 0.08, roughness: 0.02, metalness: 0.3, depthWrite: false }), root, 0, 2.43, 0); glass.castShadow = false; glass.renderOrder = 3;
  const frameM = mat(0x1a1d24, 0.5);
  box(12.4, 0.3, 0.4, frameM, 0, 0.1, 0.05); box(12.4, 0.8, 0.4, frameM, 0, 5.0, 0.05); box(0.4, 5.4, 0.4, frameM, -6.0, 2.7, 0.05); box(0.4, 5.4, 0.4, frameM, 6.0, 2.7, 0.05);
  const hallFl = mk(new THREE.PlaneGeometry(14, 8.4), mat(0x1c2230, 0.6), root, 0, 0, 4.2); hallFl.rotation.x = -PI / 2; hallFl.castShadow = false;
  box(14, 0.2, 8.4, mat(0x10131a, 0.9), 0, 5.4, 4.2); box(0.2, 5.4, 8.4, mat(0x161a24, 0.9), -7, 2.7, 4.2); box(0.2, 5.4, 8.4, mat(0x161a24, 0.9), 7, 2.7, 4.2); box(14, 5.4, 0.2, mat(0x161a24, 0.9), 0, 2.7, D.hallZ + 0.1);
  for (const x of [-3, 3]) { box(2.2, 0.42, 0.5, mat(0x3a4250, 0.6), x, 0.21, 4.2); }
  const sign = mk(new THREE.PlaneGeometry(3.2, 0.5), new THREE.MeshBasicMaterial({ map: canvasTex(640, 100, (g, w, h) => { g.fillStyle = '#0f1520'; g.fillRect(0, 0, w, h); g.fillStyle = '#7ad6ff'; g.font = 'bold 60px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SHARK REEF', w / 2, h / 2 + 3); }) }), root, 0, 5.0, 0.26); sign.castShadow = false;
  // lights: top light in the tank, the tank glow spilling into the hall onto faces, a dim hall fill
  const hemi = new THREE.HemisphereLight(0x8ad0ff, 0x1a2a3a, 1.05); root.add(hemi);
  const top = new THREE.DirectionalLight(0xbfe8ff, 1.6); top.position.set(1, 12, -4); top.target.position.set(0, 0, -5); root.add(top, top.target);
  top.castShadow = true; top.shadow.mapSize.set(2048, 2048); Object.assign(top.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 2, far: 20 });
  const glow = new THREE.DirectionalLight(0x7acaff, 1.9); glow.position.set(0, 2.6, -6); glow.target.position.set(0, 1.2, 4); root.add(glow, glow.target);
  function update(t) {
    kelp.forEach(({ k, ph }) => { k.rotation.z = 0.12 * Math.sin(t * 0.9 + ph); k.rotation.x = 0.08 * Math.sin(t * 0.7 + ph * 1.3); });
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
    FISH.forEach((f, i) => { const a = f.ph + t * f.sp; p.set(Math.cos(a) * f.r, f.y + 0.2 * Math.sin(t * 1.3 + i), -5.5 + Math.sin(a) * f.r * 0.6); q.setFromEuler(e.set(0, -a + PI, 0.1 * Math.sin(t * 6 + i))); fish.setMatrixAt(i, m.compose(p, q, s)); });
    fish.instanceMatrix.needsUpdate = true;
    causT.offset.set(t * 0.03, t * 0.02);
  }
  update(0);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D: DIMS, fog, glass, update, lights: { hemi, top, glow } };
}
