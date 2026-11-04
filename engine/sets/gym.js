// SET: a bright neighborhood gym (built for dh011 "chud to chad") — a mirror wall (a live three.js Reflector) behind a two-tier
// dumbbell rack, black rubber floor + a wooden lifting platform, a power rack with a pull-up bar, a bench press, a cable machine
// with a weight stack, three treadmills facing the windows, kettlebells, medicine balls, foam rollers, a water cooler, posters
// (LEG DAY · HYDRATE · ONE MORE REP), a wall clock, a workout TV, ceiling panels, plants.
// Coordinates: room x∈[-5, 5], z∈[-4, 4], ceiling 3.6. The mirror covers the back wall (z = DIMS.mirrorZ); the platform is
// at DIMS.platform (open floor for the hero); windows on the right wall (x = 5). Handles: mirror (Reflector), mirrorFrame,
// rackBells[] (the rack's dumbbells, {g, setBend}), kettles[] (groups, topple them), lights.
// Props (exported): makeBendBar({len, r, segs, color}) → {g, setBend(a)} a bar made of hinged segments (setBend bends every joint by
// a, so the bar curls into an arch/U; children of g.userData.tips[0|1] ride the ends), makeDumbbell(s) and makeBarbell() on top of it.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

export const DIMS = { x0: -5, x1: 5, z0: -4, z1: 4, ceil: 3.6, mirrorZ: -3.97, mirrorY: 1.45, mirrorH: 2.3, mirrorW: 9.4, platform: [0, -0.4], rackZ: -3.45 };

/** A bar along x built of hinged segments (both halves mirror). setBend(a): every joint turns by a around z (a > 0 = the ends
 *  droop below the middle, an arch; a < 0 = the ends curl up, a U). tips = the two end groups (attach plates/heads there). */
export function makeBendBar({ len = 1.2, r = 0.016, segs = 3, color = 0xb8bcc2, mid = 0.3 } = {}) {
  const g = new THREE.Group(), m = mat(color, 0.25, { metalness: 0.85 });
  const half = (len - mid) / 2, sl = half / segs;
  mk(new THREE.CylinderGeometry(r, r, mid, 10), m, g, 0, 0, 0).rotation.z = Math.PI / 2;
  const joints = [], tips = [];
  for (const s of [-1, 1]) {
    let parent = g, x = (s * mid) / 2;
    for (let k = 0; k < segs; k++) {
      const j = new THREE.Group(); j.position.set(k === 0 ? x : s * sl, 0, 0); parent.add(j); j.userData.s = s; joints.push(j);
      mk(new THREE.CylinderGeometry(r, r, sl + 0.002, 10), m, j, (s * sl) / 2, 0, 0).rotation.z = Math.PI / 2;
      parent = j;
    }
    const tip = new THREE.Group(); tip.position.set(s * sl, 0, 0); parent.add(tip); tips.push(tip);
  }
  g.userData.tips = tips;
  return { g, tips, setBend(a) { joints.forEach((j) => (j.rotation.z = -j.userData.s * a)); } };
}
export function makeDumbbell(s = 1) {
  const bar = makeBendBar({ len: 0.3 * s, r: 0.016 * s, segs: 2, mid: 0.06 * s, color: 0x9a9ca2 });
  const headM = mat(0x5a5e66, 0.45, { metalness: 0.3 });
  bar.tips.forEach((tip, i) => { const h = mk(new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 0.11 * s, 6), headM, tip, (i ? 1 : -1) * 0.05 * s, 0, 0); h.rotation.z = Math.PI / 2; });
  return bar;
}
export function makeBarbell() {
  const bar = makeBendBar({ len: 2.0, r: 0.016, segs: 4, mid: 0.5, color: 0xb8bcc2 });
  const plates = [];
  bar.tips.forEach((tip, i) => {
    const s = i ? 1 : -1, pg = new THREE.Group(); pg.position.set(-s * 0.18, 0, 0); tip.add(pg);
    [[0.225, 0x2f5f9a], [0.2, 0xd2483f], [0.16, 0xf1c24a]].forEach(([r, c], k) => { const p = mk(new THREE.CylinderGeometry(r, r, 0.045, 28), mat(c, 0.55), pg, -s * (0.05 - k * 0.05), 0, 0); p.rotation.z = Math.PI / 2; });
    mk(new THREE.CylinderGeometry(0.026, 0.026, 0.3, 12), mat(0xc8ccd2, 0.2, { metalness: 0.9 }), pg, s * 0.05, 0, 0).rotation.z = Math.PI / 2;
    plates.push(pg);
  });
  bar.plates = plates;
  return bar;
}

export function buildGym(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 31);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const W = DIMS.x1 - DIMS.x0, D = DIMS.z1 - DIMS.z0, cz = (DIMS.z0 + DIMS.z1) / 2, C = DIMS.ceil;
  const steel = mat(0x2a2c32, 0.4, { metalness: 0.6 }), chrome = mat(0xb8bcc2, 0.25, { metalness: 0.85 }), padM = mat(0x1e1e22, 0.6);

  // rubber floor with flecks, a wooden platform, walls, ceiling
  const floorTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#26262a'; g.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 900; i++) { g.fillStyle = ['#3d7bd9', '#d2483f', '#e8e2d4', '#555'][i % 4]; g.fillRect(r() * w, r() * h, 2, 2); } g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); }, [W / 1.0, D / 1.0]);
  const floor = mk(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 }), root, 0, 0, cz); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const plankTex = canvasTex(256, 256, (g, w, h) => { const r = rng(2); for (let y = 0; y < h; y += 32) { g.fillStyle = `hsl(32,${45 + r() * 10}%,${58 + r() * 6}%)`; g.fillRect(0, y, w, 31); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, y + 31, w, 1); } });
  const plat = mk(new THREE.BoxGeometry(2.4, 0.04, 2.4), new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.6 }), root, DIMS.platform[0], 0.02, DIMS.platform[1]); plat.receiveShadow = true;
  const wallM = mat(0xeef0f2, 0.9), accent = mat(0x2f5f9a, 0.7);
  box(W + 0.2, C, 0.1, wallM, 0, C / 2, DIMS.z0 - 0.05);
  box(0.1, C, D, wallM, DIMS.x0 - 0.05, C / 2, cz);
  box(W + 0.2, C, 0.1, wallM, 0, C / 2, DIMS.z1 + 0.05);
  box(W + 0.2, 0.08, D + 0.2, mat(0x3a3c42, 0.9), 0, C + 0.04, cz);
  box(0.02, 0.5, D, accent, DIMS.x0 + 0.01, 2.9, cz); box(W, 0.5, 0.02, accent, 0, 2.9, DIMS.z1 - 0.01);
  // right wall = big windows onto a sunny street (wall strips between panes)
  const outTex = canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#79b8ec'); gr.addColorStop(1, '#d8eef8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#5a9a4a'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(i * 64, h - 60, 44, 0, 7); g.fill(); } g.fillStyle = '#c9b8a0'; g.fillRect(0, h - 30, w, 30); });
  const glass = mk(new THREE.PlaneGeometry(D, 2.0), new THREE.MeshBasicMaterial({ map: outTex, color: 0xe0e0e0 }), root, DIMS.x1 + 0.06, 1.6, cz); glass.rotation.y = -Math.PI / 2; glass.castShadow = false;
  box(0.1, 0.6, D, wallM, DIMS.x1 + 0.05, 0.3, cz); box(0.1, C - 2.6, D, wallM, DIMS.x1 + 0.05, (C + 2.6) / 2, cz);
  for (let k = 0; k <= 4; k++) box(0.12, 2.0, 0.12, steel, DIMS.x1 + 0.03, 1.6, DIMS.z0 + k * 2);

  // the mirror wall
  const mirror = new Reflector(new THREE.PlaneGeometry(DIMS.mirrorW, DIMS.mirrorH), { clipBias: 0.003, textureWidth: 2048, textureHeight: 512, color: 0xc4c8cc });
  mirror.position.set(0, DIMS.mirrorY, DIMS.mirrorZ + 0.02); root.add(mirror);
  const mirrorFrame = new THREE.Group(); root.add(mirrorFrame);
  box(DIMS.mirrorW + 0.1, 0.06, 0.05, steel, 0, DIMS.mirrorY + DIMS.mirrorH / 2 + 0.02, DIMS.mirrorZ + 0.02, mirrorFrame);
  box(DIMS.mirrorW + 0.1, 0.06, 0.05, steel, 0, DIMS.mirrorY - DIMS.mirrorH / 2 - 0.02, DIMS.mirrorZ + 0.02, mirrorFrame);

  // dumbbell rack (two tiers) in front of the mirror
  const rack = new THREE.Group(); rack.position.set(-1.4, 0, DIMS.rackZ); root.add(rack);
  for (const x of [-1.5, 0, 1.5]) { box(0.06, 0.8, 0.5, steel, x, 0.4, 0, rack); }
  for (const [y, z] of [[0.42, 0.1], [0.72, -0.1]]) box(3.1, 0.04, 0.24, steel, 0, y, z, rack);
  const rackBells = [];
  for (let k = 0; k < 18; k++) { const tier = k % 2, i = Math.floor(k / 2), s = 0.8 + i * 0.07; const b = makeDumbbell(s); b.g.rotation.y = Math.PI / 2; b.g.position.set(-1.35 + i * 0.34, (tier ? 0.72 : 0.42) + 0.06 * s + 0.02, tier ? -0.1 : 0.1); rack.add(b.g); rackBells.push(b); }
  // power rack + pull-up bar, bench press, cable machine
  const power = new THREE.Group(); power.position.set(3.0, 0, -2.3); root.add(power);
  for (const [x, z] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) box(0.08, 2.4, 0.08, steel, x, 1.2, z, power);
  for (const z of [-0.6, 0.6]) box(1.28, 0.08, 0.08, steel, 0, 2.38, z, power);
  mk(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 10), chrome, power, 0, 2.3, 0.62).rotation.z = Math.PI / 2;
  const pbar = makeBarbell(); pbar.g.position.set(0, 1.35, 0.64); power.add(pbar.g);
  const bench = new THREE.Group(); bench.position.set(-3.0, 0, -0.6); root.add(bench);
  rbox(0.32, 0.1, 1.2, 0.03, mat(0xd2483f, 0.6), 0, 0.45, 0, bench); box(0.08, 0.4, 0.9, steel, 0, 0.2, 0, bench);
  for (const x of [-0.45, 0.45]) box(0.06, 1.2, 0.06, steel, x, 0.6, -0.55, bench);
  const bbar = makeBarbell(); bbar.g.position.set(0, 1.1, -0.55); bench.add(bbar.g);
  const cable = new THREE.Group(); cable.position.set(-4.3, 0, -2.6); cable.rotation.y = Math.PI / 4; root.add(cable);
  box(1.0, 2.3, 0.08, steel, 0, 1.15, -0.3, cable); box(0.08, 2.3, 0.6, steel, -0.46, 1.15, 0, cable); box(0.08, 2.3, 0.6, steel, 0.46, 1.15, 0, cable);
  for (let k = 0; k < 10; k++) box(0.34, 0.05, 0.2, mat(0x3a3c42, 0.5), 0, 0.2 + k * 0.06, 0, cable);
  // treadmills facing the windows
  for (const z of [0.6, 1.8, 3.0]) {
    const tm = new THREE.Group(); tm.position.set(3.9, 0, z); tm.rotation.y = Math.PI / 2; root.add(tm);
    rbox(0.7, 0.16, 1.7, 0.04, padM, 0, 0.08, 0, tm); box(0.5, 0.01, 1.4, mat(0x111114, 0.9), 0, 0.165, 0, tm);
    for (const s of [-1, 1]) box(0.05, 1.1, 0.05, steel, s * 0.33, 0.65, 0.75, tm);
    rbox(0.72, 0.28, 0.12, 0.03, padM, 0, 1.25, 0.78, tm);
    mk(new THREE.PlaneGeometry(0.4, 0.18), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x4fd8ff).multiplyScalar(1.2), toneMapped: false }), tm, 0, 1.26, 0.71).rotation.y = Math.PI;
  }
  // kettlebells in a row (topple-able), medicine balls, foam rollers, water cooler, plants
  const kettles = [];
  for (let k = 0; k < 8; k++) {
    const kg = new THREE.Group(); kg.position.set(1.4 + k * 0.32, 0, -2.75); root.add(kg);
    const s = 0.75 + k * 0.05, km = mat([0x2a2a30, 0xd2483f, 0xf1c24a, 0x3d7bd9][k % 4], 0.5);
    mk(new THREE.SphereGeometry(0.11 * s, 16, 12), km, kg, 0, 0.11 * s, 0);
    mk(new THREE.TorusGeometry(0.065 * s, 0.018 * s, 8, 16, Math.PI), km, kg, 0, 0.2 * s, 0);
    kettles.push(kg);
  }
  for (let k = 0; k < 4; k++) mk(new THREE.SphereGeometry(0.17, 16, 12), mat([0x6fa84f, 0x8f6fb8, 0xe08a3a, 0x2f5f9a][k], 0.7), root, -4.5 + k * 0.38, 0.17, 3.4);
  for (let k = 0; k < 4; k++) { const f = mk(new THREE.CylinderGeometry(0.075, 0.075, 0.45, 14), mat([0x3d7bd9, 0xe8559a, 0x6fd88a, 0xf1c24a][k], 0.8), root, -4.5 + k * 0.2, 0.075, 2.7); f.rotation.x = Math.PI / 2; }
  box(0.36, 0.95, 0.36, mat(0xeeeeee, 0.6), -4.6, 0.475, 0.9);
  mk(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 16), mat(0x7fc6ef, 0.1, { transparent: true, opacity: 0.75 }), root, -4.6, 1.16, 0.9);
  for (const [x, z] of [[-4.55, 1.8], [4.55, -3.55]]) {
    mk(new THREE.CylinderGeometry(0.18, 0.14, 0.4, 14), mat(0xe8e2d4, 0.6), root, x, 0.2, z);
    for (let k = 0; k < 7; k++) { const a = k * 0.9; const lf = mk(new THREE.SphereGeometry(0.17, 10, 8), mat(0x4f8a3a, 0.8), root, x + Math.cos(a) * 0.13, 0.55 + (k % 3) * 0.13, z + Math.sin(a) * 0.13); lf.scale.set(0.6, 1.2, 0.6); }
  }
  // posters, clock, workout TV
  const poster = (lines, c1, c2, x, y, z, ry, w = 0.8, h = 1.1) => {
    const tex = canvasTex(256, Math.round(256 * h / w), (g, cw, ch) => { const gr = g.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, cw, ch); g.fillStyle = '#fff'; g.textAlign = 'center';
      lines.forEach((l, i) => { let s = 70; g.font = `900 ${s}px Helvetica, Arial, sans-serif`; while (g.measureText(l).width > cw - 26 && s > 14) { s -= 2; g.font = `900 ${s}px Helvetica, Arial, sans-serif`; } g.fillText(l, cw / 2, ch * (0.36 + i * 0.22)); }); });
    const m = mk(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color: 0xc0c0c0 }), root, x, y, z); m.rotation.y = ry; m.castShadow = false; return m;
  };
  poster(['LEG', 'DAY'], '#d2483f', '#7a1a2a', DIMS.x0 + 0.01, 1.8, -1.2, Math.PI / 2);
  poster(['HYDRATE'], '#3d7bd9', '#1a3a7a', DIMS.x0 + 0.01, 1.8, 1.0, Math.PI / 2);
  poster(['ONE', 'MORE', 'REP'], '#f1c24a', '#c87a1a', -1.6, 1.8, DIMS.z1 - 0.01, Math.PI);
  poster(['NO', 'DAYS', 'OFF'], '#3a8a4a', '#1a4a2a', 1.6, 1.8, DIMS.z1 - 0.01, Math.PI);
  const clockT = canvasTex(128, 128, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 6; g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 24); g.stroke(); g.beginPath(); g.moveTo(64, 64); g.lineTo(96, 64); g.stroke(); });
  const clk = mk(new THREE.CircleGeometry(0.22, 24), new THREE.MeshBasicMaterial({ map: clockT, color: 0xdddddd }), root, 0, 3.0, DIMS.z1 - 0.02); clk.rotation.y = Math.PI; clk.castShadow = false;
  // ceiling panels + lights (bright, even)
  const panelM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf4f8ff).multiplyScalar(1.4), toneMapped: false });
  for (const x of [-3, 0, 3]) for (const z of [-2.5, 0, 2.5]) { const p = mk(new THREE.PlaneGeometry(1.2, 0.5), panelM, root, x, C - 0.01, z); p.rotation.x = Math.PI / 2; p.castShadow = false; }
  void R;
  const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x5a5a60, 1.1); root.add(hemi);
  const key = new THREE.DirectionalLight(0xfff4e6, 1.7); key.position.set(6, 7, 3); key.target.position.set(0, 0, -0.5); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 24 });
  const fillA = new THREE.PointLight(0xfff4e6, 4.0, 9, 1.5); fillA.position.set(0, 3.0, 1.5); root.add(fillA);
  const fillB = new THREE.PointLight(0xfff4e6, 3.0, 9, 1.5); fillB.position.set(0, 3.0, -2.0); root.add(fillB);
  return { root, D: DIMS, mirror, mirrorFrame, rackBells, kettles, power, pbar, bench, bbar, lights: { hemi, key, fillA, fillB } };
}
