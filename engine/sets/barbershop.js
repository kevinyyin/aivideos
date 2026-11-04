// SET: a sunny neighborhood barbershop (built for dh011 "chud to chad") — a long mirror wall (a live three.js Reflector) over a
// counter of tonic bottles, combs in a blue disinfectant jar, clippers and spray bottles; three red hydraulic barber chairs that
// face the mirror; a black/white checker floor, mint wainscoting, a striped barber pole, a waiting bench with magazines, haircut
// posters, a price board, a wall TV, plants, a coat rack, pendant lights, an OPEN neon, a front window onto a sunny street.
// Coordinates: room x∈[-3, 3], z∈[-2.6, 3.0], ceiling 3.0. Chairs at DIMS.chairs (x) on z = DIMS.chairZ, facing −z (the
// mirror at z = DIMS.mirrorZ). Handles: chairs[i] = {g, lift (raise/lower group), seatY}, mirror (Reflector), mirrorGlass
// (its frame group), lights.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

export const DIMS = { x0: -3, x1: 3, z0: -2.6, z1: 3.0, ceil: 3.0, chairs: [-1.8, 0, 1.8], chairZ: -1.3, seatY: 0.62, mirrorZ: -2.58, mirrorY: 1.68, mirrorH: 1.25, mirrorW: 5.4, counterY: 0.92 };

export function buildBarbershop(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 21);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const W = DIMS.x1 - DIMS.x0, D = DIMS.z1 - DIMS.z0, cz = (DIMS.z0 + DIMS.z1) / 2, C = DIMS.ceil;

  // checker floor, two-tone walls, ceiling
  const floorTex = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#1e1e22' : '#f2efe6'; g.fillRect(x * 64, y * 64, 64, 64); } void w; void h; }, [W / 1.6, D / 1.6]);
  const floor = mk(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.35 }), root, 0, 0, cz); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const upper = mat(0xf3e9d6, 0.9), lower = mat(0x7fc2a8, 0.8), trim = mat(0x2a2a30, 0.6);
  const wall = (w, x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); box(w, C, 0.1, upper, 0, C / 2, -0.05, g); box(w, 1.0, 0.04, lower, 0, 0.5, 0.0, g); box(w, 0.05, 0.06, trim, 0, 1.02, 0.01, g); return g; };
  wall(W + 0.2, 0, DIMS.z0, 0); wall(D, DIMS.x0, cz, Math.PI / 2); wall(D, DIMS.x1, cz, -Math.PI / 2);
  // front wall with a big window + a glass door (sunny street outside)
  const streetTex = canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8cc4ee'); gr.addColorStop(1, '#dff0f8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(6); for (let i = 0; i < 8; i++) { g.fillStyle = ['#e9c9a3', '#d98f7a', '#a9c4c9', '#efe0b8'][i % 4]; const bh = 120 + r() * 90; g.fillRect(i * 66, h - bh, 62, bh); g.fillStyle = 'rgba(80,110,150,.6)'; for (let y = h - bh + 14; y < h - 30; y += 34) g.fillRect(i * 66 + 12, y, 38, 20); } g.fillStyle = '#5a9a4a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(40 + i * 90, h - 40, 34, 0, 7); g.fill(); } g.fillStyle = '#8a8a8a'; g.fillRect(0, h - 18, w, 18); });
  const front = new THREE.Group(); front.position.set(0, 0, DIMS.z1); front.rotation.y = Math.PI; root.add(front);
  box(1.0, C, 0.1, upper, -2.5, C / 2, -0.05, front); box(1.6, C, 0.1, upper, 2.2, C / 2, -0.05, front); box(3.4, 0.9, 0.1, upper, -0.3, 0.45, -0.05, front); box(3.4, 0.5, 0.1, upper, -0.3, C - 0.25, -0.05, front);
  box(1.6, 0.9, 0.04, lower, 2.2, 0.45, 0.0, front); box(1.0, 0.9, 0.04, lower, -2.5, 0.45, 0.0, front);
  const glassM = new THREE.MeshBasicMaterial({ map: streetTex, color: 0xd8d8d8 });
  mk(new THREE.PlaneGeometry(3.4, 1.6), glassM, front, -0.3, 1.7, -0.08);
  for (const x of [-2.0, -0.3, 1.4]) box(0.06, 1.6, 0.08, trim, x, 1.7, -0.05, front);
  const neon = canvasTex(256, 96, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.font = 'bold 64px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff4a6a'; g.shadowBlur = 16; g.fillStyle = '#ffd0da'; g.fillText('OPEN', w / 2, h / 2); });
  const neonM = mk(new THREE.PlaneGeometry(0.7, 0.26), new THREE.MeshBasicMaterial({ map: neon, transparent: true, toneMapped: false, color: 0xffffff }), front, 0.8, 2.15, 0.06); neonM.castShadow = false;
  box(1.0, 2.1, 0.06, mat(0x2a2a30, 0.5), 2.2, 1.05, -0.06, front);   // the door (dark frame) …
  mk(new THREE.PlaneGeometry(0.8, 1.6), glassM, front, 2.2, 1.2, -0.02);   // … with glass
  box(W + 0.2, 0.08, D + 0.2, mat(0xf6f2ea, 0.95), 0, C + 0.04, cz);

  // the mirror wall over the counter
  const mirror = new Reflector(new THREE.PlaneGeometry(DIMS.mirrorW, DIMS.mirrorH), { clipBias: 0.003, textureWidth: 1024, textureHeight: 256, color: 0xc4c8cc });
  mirror.position.set(0, DIMS.mirrorY, DIMS.mirrorZ + 0.06); root.add(mirror);
  const mirrorGlass = new THREE.Group(); root.add(mirrorGlass);
  const chrome = mat(0xb8bcc2, 0.22, { metalness: 0.85 });
  box(DIMS.mirrorW + 0.1, 0.05, 0.06, chrome, 0, DIMS.mirrorY + DIMS.mirrorH / 2 + 0.02, DIMS.mirrorZ + 0.05, mirrorGlass);
  box(DIMS.mirrorW + 0.1, 0.05, 0.06, chrome, 0, DIMS.mirrorY - DIMS.mirrorH / 2 - 0.02, DIMS.mirrorZ + 0.05, mirrorGlass);
  // counter + its clutter
  const counterM = mat(0xf4f2ee, 0.35), cabM = mat(0x6a4a3a, 0.6);
  box(5.6, 0.86, 0.42, cabM, 0, 0.43, DIMS.z0 + 0.26);
  rbox(5.7, 0.06, 0.48, 0.01, counterM, 0, DIMS.counterY - 0.03, DIMS.z0 + 0.27);
  const bottleC = [0x3a8a4a, 0xe8a83a, 0x5ad1ff, 0xd2483f, 0x8f6fb8, 0xf2efe8];
  for (let k = 0; k < 22; k++) {
    const x = -2.7 + k * 0.26 + (R() - 0.5) * 0.06, h = 0.14 + R() * 0.12, r = 0.03 + R() * 0.015;
    if (Math.abs(x - DIMS.chairs[0]) < 0.25 || Math.abs(x) < 0.3 || Math.abs(x - DIMS.chairs[2]) < 0.25) continue;   // keep the mirror clear in front of each chair
    mk(new THREE.CylinderGeometry(r, r, h, 12), mat(bottleC[k % 6], 0.25, { transparent: true, opacity: 0.9 }), root, x, DIMS.counterY + h / 2, DIMS.z0 + 0.22);
    mk(new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.04, 8), mat(0x2a2a30, 0.5), root, x, DIMS.counterY + h + 0.02, DIMS.z0 + 0.22);
  }
  for (const x of [-2.25, 1.0]) {   // the blue disinfectant jar with combs
    mk(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 16), mat(0x3ab0e0, 0.1, { transparent: true, opacity: 0.75 }), root, x, DIMS.counterY + 0.12, DIMS.z0 + 0.36);
    for (let k = 0; k < 4; k++) { const c = box(0.012, 0.2, 0.035, mat(0x1a1a1a, 0.4), x - 0.03 + k * 0.02, DIMS.counterY + 0.2, DIMS.z0 + 0.36); c.rotation.z = (k - 1.5) * 0.12; }
  }
  for (const x of [-1.3, 0.55, 2.3]) { rbox(0.07, 0.04, 0.17, 0.015, mat(0x2a2a30, 0.4), x, DIMS.counterY + 0.02, DIMS.z0 + 0.4).rotation.y = 0.3; }   // clippers
  // barber chairs (red leather, chrome base, hydraulic column)
  const red = mat(0xb8282e, 0.45), white = mat(0xf4f2ee, 0.4), blk = mat(0x1e1e22, 0.5);
  const chairs = DIMS.chairs.map((x) => {
    const g = new THREE.Group(); g.position.set(x, 0, DIMS.chairZ); root.add(g);
    mk(new THREE.CylinderGeometry(0.32, 0.36, 0.08, 24), chrome, g, 0, 0.04, 0);
    mk(new THREE.CylinderGeometry(0.06, 0.07, 0.36, 14), chrome, g, 0, 0.24, 0);
    const lift = new THREE.Group(); g.add(lift);
    rbox(0.56, 0.12, 0.54, 0.05, red, 0, DIMS.seatY - 0.06, 0, lift);
    rbox(0.5, 0.04, 0.5, 0.02, white, 0, DIMS.seatY - 0.13, 0, lift);
    for (const s of [-1, 1]) { rbox(0.09, 0.07, 0.48, 0.03, red, s * 0.31, DIMS.seatY + 0.18, -0.02, lift); box(0.03, 0.2, 0.03, chrome, s * 0.31, DIMS.seatY + 0.06, 0.12, lift); }
    const back = rbox(0.52, 0.62, 0.12, 0.05, red, 0, DIMS.seatY + 0.33, 0.27, lift); back.rotation.x = 0.16;
    rbox(0.26, 0.14, 0.09, 0.04, blk, 0, DIMS.seatY + 0.72, 0.36, lift);
    box(0.03, 0.12, 0.03, chrome, 0, DIMS.seatY + 0.62, 0.34, lift);
    const foot = rbox(0.36, 0.03, 0.16, 0.01, chrome, 0, 0.18, -0.42, lift); foot.rotation.x = 0.2;
    box(0.03, 0.3, 0.03, chrome, 0, 0.32, -0.32, lift).rotation.x = -0.6;
    return { g, lift, seatY: DIMS.seatY };
  });
  // the barber pole (inside, by the door), waiting bench + magazines, coat rack, plants, posters, price board, TV, pendant lights
  const poleTex = canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#f4f2ee'; g.fillRect(0, 0, w, h); for (let k = -4; k < 12; k++) { g.fillStyle = k % 2 ? '#d2283a' : '#2a4aa8'; g.beginPath(); g.moveTo(0, k * 32); g.lineTo(w, k * 32 + 64); g.lineTo(w, k * 32 + 80); g.lineTo(0, k * 32 + 16); g.fill(); } });
  const poleM = new THREE.MeshStandardMaterial({ map: poleTex, roughness: 0.3 });
  const pole = mk(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 20), poleM, root, DIMS.x1 - 0.2, 1.8, DIMS.z1 - 1.5);
  for (const dy of [-0.45, 0.45]) mk(new THREE.SphereGeometry(0.11, 14, 10), chrome, root, DIMS.x1 - 0.2, 1.8 + dy, DIMS.z1 - 1.5);
  const bench = new THREE.Group(); bench.position.set(-0.6, 0, DIMS.z1 - 0.45); root.add(bench);
  rbox(2.4, 0.08, 0.44, 0.03, mat(0x7a4a2a, 0.5), 0, 0.46, 0, bench); rbox(2.4, 0.42, 0.08, 0.03, mat(0x7a4a2a, 0.5), 0, 0.72, 0.2, bench);
  for (const x of [-1.1, 1.1]) box(0.05, 0.44, 0.38, blk, x, 0.22, 0, bench);
  rbox(0.5, 0.04, 0.4, 0.01, mat(0xf2efe8, 0.6), 1.3, 0.48, 0, bench);
  for (let k = 0; k < 3; k++) { const m = box(0.22, 0.012, 0.3, mat([0xd2483f, 0x3d7bd9, 0xf1c24a][k], 0.7), 1.25 + k * 0.03, 0.51 + k * 0.012, -0.02 + k * 0.02, bench); m.rotation.y = k * 0.3; }
  const rack = new THREE.Group(); rack.position.set(DIMS.x0 + 0.35, 0, DIMS.z1 - 0.45); root.add(rack);
  mk(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8), blk, rack, 0, 0.9, 0); mk(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 16), blk, rack, 0, 0.015, 0);
  rbox(0.4, 0.7, 0.18, 0.06, mat(0x3a5a8a, 0.9), 0.05, 1.4, 0.0, rack); mk(new THREE.SphereGeometry(0.12, 12, 8), mat(0xc8a46a, 0.8), rack, 0, 1.86, 0);
  for (const [x, z] of [[DIMS.x0 + 0.35, DIMS.z0 + 0.75], [DIMS.x1 - 0.35, DIMS.z1 - 0.4]]) {
    mk(new THREE.CylinderGeometry(0.17, 0.13, 0.36, 14), mat(0xe8e2d4, 0.6), root, x, 0.18, z);
    for (let k = 0; k < 7; k++) { const a = k * 0.9; const lf = mk(new THREE.SphereGeometry(0.16, 10, 8), mat(0x4f8a3a, 0.8), root, x + Math.cos(a) * 0.12, 0.5 + (k % 3) * 0.12, z + Math.sin(a) * 0.12); lf.scale.set(0.6, 1.2, 0.6); }
  }
  const styleTex = (name, kind, c) => canvasTex(256, 340, (g, w, h) => {
    g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = '#f0c8a8'; g.beginPath(); g.arc(w / 2, 150, 70, 0, 7); g.fill();
    g.fillStyle = '#2a1d16'; g.beginPath();
    if (kind === 0) { g.arc(w / 2, 130, 72, Math.PI, 0); g.fill(); } else if (kind === 1) { g.ellipse(w / 2 + 10, 92, 80, 40, -0.2, 0, 7); g.fill(); } else { g.fillRect(w / 2 - 70, 78, 140, 22); }
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(w / 2 - 24, 150, 7, 0, 7); g.arc(w / 2 + 24, 150, 7, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center'; let s = 40; g.font = `900 ${s}px Helvetica, Arial, sans-serif`; while (g.measureText(name).width > w - 24) { s -= 2; g.font = `900 ${s}px Helvetica, Arial, sans-serif`; } g.fillText(name, w / 2, 290);
  });
  [['THE CLASSIC', 0, '#2a4aa8', -1.0], ['THE SWOOP', 1, '#d2283a', 0.0], ['THE FLAT TOP', 2, '#3a8a4a', 1.0]].forEach(([n, k, c, z]) => {
    const p = mk(new THREE.PlaneGeometry(0.5, 0.66), new THREE.MeshBasicMaterial({ map: styleTex(n, k, c), color: 0xbcbcbc }), root, DIMS.x0 + 0.01, 1.75, z); p.rotation.y = Math.PI / 2; p.castShadow = false;
  });
  const price = canvasTex(320, 240, (g, w, h) => { g.fillStyle = '#1e1e22'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3e9d6'; g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.textAlign = 'left'; ['CUT ....... $25', 'FADE ...... $30', 'BEARD ..... $15', 'SHAVE ..... $20'].forEach((l, i) => g.fillText(l, 22, 52 + i * 52)); void w; void h; });
  const pb = mk(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({ map: price, color: 0xd0d0d0 }), root, DIMS.x1 - 0.01, 1.9, -1.0); pb.rotation.y = -Math.PI / 2; pb.castShadow = false;
  const tv = new THREE.Group(); tv.position.set(DIMS.x1 - 0.08, 2.35, 0.8); tv.rotation.y = -Math.PI / 2; root.add(tv);
  rbox(1.0, 0.6, 0.06, 0.01, blk, 0, 0, 0, tv);
  const tvTex = canvasTex(256, 150, (g, w, h) => { g.fillStyle = '#2f8a4a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(20, 20, w - 40, h - 40); g.beginPath(); g.arc(w / 2, h / 2, 26, 0, 7); g.stroke(); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, h - 26, w, 26); g.fillStyle = '#fff'; g.font = 'bold 18px Helvetica, Arial, sans-serif'; g.fillText('HOME 2 · AWAY 1', 12, h - 8); });
  mk(new THREE.PlaneGeometry(0.94, 0.54), new THREE.MeshBasicMaterial({ map: tvTex, toneMapped: false, color: 0xbbbbbb }), tv, 0, 0, 0.032).castShadow = false;
  const lampM = new THREE.MeshBasicMaterial({ color: 0xfff2d0, toneMapped: false });
  for (const x of DIMS.chairs) { mk(new THREE.CylinderGeometry(0.005, 0.005, 0.5, 6), blk, root, x, C - 0.25, -0.6); mk(new THREE.ConeGeometry(0.16, 0.16, 18, 1, true), mat(0x2a2a30, 0.5, { side: THREE.DoubleSide }), root, x, C - 0.55, -0.6); mk(new THREE.SphereGeometry(0.05, 10, 8), lampM, root, x, C - 0.6, -0.6).castShadow = false; }

  // lights: warm afternoon sun through the front window + soft room light
  const hemi = new THREE.HemisphereLight(0xfff6ea, 0x8a7a6a, 1.0); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.6); sun.position.set(2.5, 5.5, 8); sun.target.position.set(0, 0, -1); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  const fillA = new THREE.PointLight(0xfff0e0, 3.2, 7, 1.5); fillA.position.set(0, 2.6, -0.4); root.add(fillA);
  const fillB = new THREE.PointLight(0xfff0e0, 2.0, 7, 1.5); fillB.position.set(0, 2.5, 1.9); root.add(fillB);
  return { root, D: DIMS, chairs, mirror, mirrorGlass, pole, bench, lights: { hemi, sun, fillA, fillB } };
}
