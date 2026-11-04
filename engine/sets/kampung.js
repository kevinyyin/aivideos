// SET: an Indonesian kampung lane at night (dh005) — a narrow paved lane between rows of small pastel houses with hip roofs
// of terracotta tile, little terraces with potted plants, low gate walls, parked motorbikes, power poles with sagging wires,
// banana trees, and a small mosque with a lit dome + minaret at the far end, under a starry sky with a crescent moon.
// Built for the sahur patrol (drummers walking the lane at 3 AM, windows lighting up as they pass); reusable for any
// night-in-a-neighborhood beat.
//
// Coordinates (meters, y up). The lane runs along z; the mosque stands toward −z (DIMS.mosque). Lane x∈[−2.3, 2.3], y = 0.
//   Houses: front walls at x = ±DIMS.front facing the lane, one every DIMS.pitch m for z∈[−36, 12]; a terrace (top y 0.22)
//   in front of each, a low gate wall at x = ±2.45 with a gap in front of the door.
//   windows[i] = {x, y, z, side, mat}; setWindow(i, 0..1) lights one warm; setWindows(fn(win, i) → 0..1) sets all.
//   doors[i] = {hinge, x, z, side, glow}; hinge.rotation.y = −side · 1.35 opens it into the house (the doorway glows with its window).
// Handles: setWindow, setWindows, aimMoon(cx, cz, half), fog, lights.  The video must raise camera.far to ≥ 340.
import * as THREE from 'three';
import { mat, mk, canvasTex, rng, clamp } from '@engine/core.js';

export const DIMS = { laneHalf: 2.3, front: 3.7, pitch: 5.4, zHouses: [-36, 12], terraceY: 0.22, gate: 2.45, mosque: [0, -48] };

const WALLS = ['#bfe3cf', '#f2c6c2', '#f5e3a8', '#b9d4ee', '#f4efe4', '#d8c4ea', '#f6d2a2', '#c6e2b0'];
const DARK = new THREE.Color(0x1b2236), WARM = new THREE.Color(0xffcf86);

function laneTex() {
  return canvasTex(256, 1024, (g, w, h) => {
    g.fillStyle = '#7d7a74'; g.fillRect(0, 0, w, h);
    const R = rng(4); for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '0,0,0'},${0.04 + R() * 0.07})`; g.fillRect(R() * w, R() * h, 2, 2); }
    g.strokeStyle = 'rgba(40,36,32,.35)'; g.lineWidth = 2; for (let y = 0; y < h; y += 128) { g.beginPath(); g.moveTo(0, y + R() * 8); g.lineTo(w, y + R() * 8); g.stroke(); }
  }, [1, 8]);
}
function wallTex(c) {
  return canvasTex(128, 128, (g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); const R = rng(c.length); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(0,0,0,${R() * 0.05})`; g.fillRect(R() * w, R() * h, 3, 3); } g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, h - 14, w, 14); });
}
function tileTex() {
  return canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#a5522f'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, y, w, 3); for (let x = (y / 16) % 2 ? 8 : 0; x < w; x += 16) { g.fillStyle = 'rgba(255,200,160,.10)'; g.fillRect(x, y + 3, 8, 13); } } }, [3, 3]);
}
function paneTex() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,1)'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a6a58'; g.fillRect(w / 2 - 3, 0, 6, h); g.fillRect(0, h * 0.42, w, 6);                      // mullions
    g.fillStyle = 'rgba(214,120,90,.55)'; g.fillRect(0, 0, w * 0.2, h); g.fillRect(w * 0.8, 0, w * 0.2, h);       // curtains
  });
}
function skyTex() {
  return canvasTex(2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#060a1c'); gr.addColorStop(0.36, '#101a3c'); gr.addColorStop(0.49, '#2a3a66'); gr.addColorStop(0.52, '#35466e'); gr.addColorStop(1, '#141a2c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(77);
    for (let i = 0; i < 1400; i++) {                                                           // soft round stars, upper half only
      const x = R() * w, y = R() * h * 0.47, r = 0.35 + R() * R() * 0.8, a = 0.3 + R() * 0.6;
      const rg = g.createRadialGradient(x, y, 0, x, y, r * 1.6); rg.addColorStop(0, `rgba(255,248,230,${a})`); rg.addColorStop(1, 'rgba(255,248,230,0)');
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r * 1.6, 0, Math.PI * 2); g.fill();
    }
  });
}
function moonTex() {
  return canvasTex(256, 256, (g, w, h) => {
    const rg = g.createRadialGradient(128, 128, 30, 128, 128, 126); rg.addColorStop(0, 'rgba(255,240,200,.35)'); rg.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff4d6'; g.beginPath(); g.arc(128, 128, 54, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(152, 112, 50, 0, Math.PI * 2); g.fill();
  });
}

export function buildKampung(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 55), D = DIMS;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0x161d36, 30, 170); scene.fog = fog;

  // ---- ground: the lane, gutters, yards
  const lane = mk(new THREE.PlaneGeometry(2 * D.laneHalf, 76), new THREE.MeshStandardMaterial({ map: laneTex(), roughness: 0.9 }), root, 0, 0, -12); lane.rotation.x = -Math.PI / 2; lane.castShadow = false;
  const yard = mk(new THREE.PlaneGeometry(60, 90), mat(0x3a3530, 1), root, 0, -0.01, -14); yard.rotation.x = -Math.PI / 2; yard.castShadow = false;
  for (const s of [-1, 1]) box(0.22, 0.06, 76, mat(0x2a2a2c, 0.8), s * (D.laneHalf + 0.06), 0.0, -12);

  // ---- houses
  const tileM = new THREE.MeshStandardMaterial({ map: tileTex(), roughness: 0.85 });
  const trimM = mat(0xf4efe4, 0.7), postM = mat(0x8a6a4a, 0.8), gateM = mat(0xe9e2d4, 0.85), frameM = mat(0x6a5a48, 0.7);
  const windows = [], doors = [];
  let hi = 0;
  for (let z = D.zHouses[0]; z <= D.zHouses[1]; z += D.pitch) for (const s of [-1, 1]) {
    const zc = z + (s > 0 ? D.pitch / 2 : 0), wallC = WALLS[hi++ % WALLS.length], fx = s * D.front, depth = 5.0, H = 2.9;
    const h = new THREE.Group(); h.position.set(fx + s * depth / 2, 0, zc); root.add(h);
    box(depth, H, 4.8, new THREE.MeshStandardMaterial({ map: wallTex(wallC), roughness: 0.9 }), 0, H / 2, 0, h);
    mk(new THREE.ConeGeometry(3.75, 1.9, 4, 1), tileM, h, 0, H + 0.95, 0).rotation.y = Math.PI / 4;
    box(depth + 0.5, 0.12, 5.3, trimM, 0, H + 0.02, 0, h);                                                   // eave band
    // terrace + its little roof
    const tx = fx - s * 0.55;
    box(1.1, D.terraceY, 4.4, mat(0x9a8a7a, 0.9), tx, D.terraceY / 2, zc);
    box(1.4, 0.07, 4.8, tileM, fx - s * 0.62, 2.38, zc).rotation.z = s * 0.18;
    for (const dz of [-2.0, 2.0]) mk(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), postM, root, fx - s * 1.0, 1.25, zc + dz);
    // door (hinge on its −z edge) + a doorway glow behind it
    const dz0 = zc - 1.75, dw = 0.92;
    const glowM = new THREE.MeshBasicMaterial({ color: DARK.clone() });
    const glow = mk(new THREE.PlaneGeometry(dw, 2.0), glowM, root, fx + s * 0.06, D.terraceY + 1.0, dz0 + dw / 2); glow.rotation.y = -s * Math.PI / 2;
    const hinge = new THREE.Group(); hinge.position.set(fx - s * 0.03, D.terraceY, dz0); root.add(hinge);
    box(0.05, 2.0, dw, mat([0x5a3a2a, 0x2f5a6a, 0x6a2f2f, 0x3f5a3a][hi % 4], 0.6), 0, 1.0, dw / 2, hinge);
    mk(new THREE.SphereGeometry(0.035, 8, 6), mat(0xd9b46a, 0.3, { metalness: 0.6 }), hinge, -s * 0.05, 1.0, dw - 0.1);
    doors.push({ hinge, x: fx, z: dz0 + dw / 2, side: s, glow: glowM });
    // window: frame + glowing pane (curtains baked in) + a sill
    const wz = zc + 0.9;
    box(0.1, 1.25, 1.4, frameM, fx - s * 0.02, 1.55, wz);
    const wm = new THREE.MeshBasicMaterial({ map: paneTex(), color: DARK.clone() });
    const pane = mk(new THREE.PlaneGeometry(1.2, 1.05), wm, root, fx - s * 0.08, 1.55, wz); pane.rotation.y = -s * Math.PI / 2;
    box(0.25, 0.06, 1.5, trimM, fx - s * 0.12, 0.98, wz);
    windows.push({ x: fx, y: 1.55, z: wz, side: s, mat: wm, door: doors.length - 1 });
    // gate wall with a gap in front of the door
    for (const [a, b] of [[zc - 2.6, dz0 - 0.15], [dz0 + dw + 0.45, zc + 2.6]]) box(0.16, 0.85, b - a, gateM, s * D.gate, 0.425, (a + b) / 2);
    // potted plants on the terrace
    for (let k = 0; k < 2; k++) {
      const pz = zc + (k ? 2.0 : 0.15) - 0.4, px = fx - s * (0.35 + R() * 0.3);
      mk(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 10), mat(0xa65a3a, 0.8), root, px, D.terraceY + 0.12, pz);
      for (let j = 0; j < 4; j++) mk(new THREE.SphereGeometry(0.13 + R() * 0.06, 8, 6), mat([0x3f7a3a, 0x4f8a3a, 0x2f6a3a][j % 3], 0.85), root, px + (R() - 0.5) * 0.15, D.terraceY + 0.33 + R() * 0.16, pz + (R() - 0.5) * 0.15);
    }
  }

  // ---- motorbikes parked by the gates
  function bike(x, z, ry, c) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g);
    for (const dz of [-0.62, 0.62]) mk(new THREE.TorusGeometry(0.26, 0.07, 8, 18), mat(0x1c1c1e, 0.8), g, 0, 0.3, dz).rotation.y = Math.PI / 2;
    mk(new THREE.BoxGeometry(0.28, 0.32, 1.0), mat(c, 0.4), g, 0, 0.55, -0.05);
    mk(new THREE.BoxGeometry(0.3, 0.12, 0.62), mat(0x222226, 0.7), g, 0, 0.78, -0.1);
    mk(new THREE.BoxGeometry(0.62, 0.05, 0.05), mat(0x333336, 0.4), g, 0, 1.0, 0.55);
    mk(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), mat(0x555558, 0.4), g, 0, 0.75, 0.55).rotation.x = 0.25;
    return g;
  }
  [[-1.75, -18.8, 0.2, 0xd2483f], [1.8, -8.2, -0.15, 0x2f6aa8], [-1.8, 3.5, 0.1, 0x2a2a30], [1.75, -27.0, 0.1, 0xf2f0ea]].forEach(([x, z, r, c]) => bike(x, z, r, c));

  // ---- power poles + sagging wires, a few warm street lamps
  const poleM = mat(0x8a8478, 0.8), wireM = mat(0x111114, 0.8), lamps = [];
  const poleZ = [-40, -28, -16, -4, 8];
  for (const pz of poleZ) {
    mk(new THREE.CylinderGeometry(0.09, 0.12, 7.2, 8), poleM, root, -2.55, 3.6, pz);
    box(1.2, 0.1, 0.1, poleM, -2.55, 6.8, pz);
  }
  for (let i = 0; i + 1 < poleZ.length; i++) for (const dx of [-0.5, 0, 0.5]) {
    const a = new THREE.Vector3(-2.55 + dx, 6.75, poleZ[i]), b = new THREE.Vector3(-2.55 + dx, 6.75, poleZ[i + 1]), m = a.clone().add(b).multiplyScalar(0.5); m.y -= 0.9;
    const w = mk(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 16, 0.012, 4), wireM, root); w.castShadow = false;
  }
  for (const pz of [-28, -4]) {
    box(0.9, 0.06, 0.06, poleM, -2.15, 5.2, pz);
    mk(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }), root, -1.72, 5.08, pz);
    const L = new THREE.PointLight(0xffd39a, 6, 14, 1.6); L.position.set(-1.72, 4.9, pz); root.add(L); lamps.push(L);
  }

  // ---- banana trees + palms behind the houses
  const leafM = mat(0x2f5a2f, 0.8, { side: THREE.DoubleSide }), trunkM = mat(0x6a5a3a, 0.9);
  for (let i = 0; i < 18; i++) {
    const s = i % 2 ? 1 : -1, x = s * (9.5 + R() * 4), z = -40 + i * 3.1 + R() * 1.5, th = 3 + R() * 2.5;
    mk(new THREE.CylinderGeometry(0.14, 0.2, th, 7), trunkM, root, x, th / 2, z);
    for (let k = 0; k < 6; k++) {
      const lf = mk(new THREE.PlaneGeometry(0.7, 2.6), leafM, root, x, th, z); lf.geometry.translate(0, 1.2, 0);
      lf.rotation.set(0.9 + R() * 0.4, k * 1.05 + R() * 0.3, 0, 'YXZ'); lf.castShadow = false;
    }
  }

  // ---- the mosque at the end of the lane (+ its yard light)
  const [mx, mz] = D.mosque, cream = mat(0xf2ead8, 0.8);
  const mos = new THREE.Group(); mos.position.set(mx, 0, mz); root.add(mos);
  box(10, 4.6, 8, cream, 0, 2.3, 0, mos);
  box(10.4, 0.25, 8.4, mat(0x2f7a5a, 0.6), 0, 4.65, 0, mos);
  for (const dx of [-3, 0, 3]) {
    const arch = mk(new THREE.PlaneGeometry(1.5, 2.5), new THREE.MeshBasicMaterial({ color: 0xffd99a }), mos, dx, 1.35, 4.02);
    mk(new THREE.CircleGeometry(0.75, 16, 0, Math.PI), arch.material, mos, dx, 2.6, 4.02);
  }
  const domeM = mat(0x2f8a6a, 0.45, { emissive: 0x0d2a20, emissiveIntensity: 1 });
  mk(new THREE.CylinderGeometry(2.9, 2.9, 0.9, 24), cream, mos, 0, 5.2, 0);
  mk(new THREE.SphereGeometry(2.9, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeM, mos, 0, 5.65, 0);
  const fin = new THREE.Group(); fin.position.set(0, 8.7, 0); mos.add(fin);
  mk(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), mat(0xd9b46a, 0.3, { metalness: 0.7 }), fin, 0, 0, 0);
  mk(new THREE.TorusGeometry(0.32, 0.06, 6, 18, Math.PI * 1.4), mat(0xd9b46a, 0.3, { metalness: 0.7 }), fin, 0, 0.6, 0).rotation.z = -0.3;
  const mina = new THREE.Group(); mina.position.set(6.4, 0, 1.0); mos.add(mina);
  mk(new THREE.CylinderGeometry(0.62, 0.72, 13, 12), cream, mina, 0, 6.5, 0);
  mk(new THREE.CylinderGeometry(1.0, 1.0, 0.25, 12), mat(0x2f7a5a, 0.6), mina, 0, 10.4, 0);
  mk(new THREE.TorusGeometry(0.95, 0.05, 6, 20), new THREE.MeshBasicMaterial({ color: 0x9affd2 }), mina, 0, 10.6, 0).rotation.x = Math.PI / 2;
  mk(new THREE.SphereGeometry(0.66, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), domeM, mina, 0, 13, 0);
  const mosLight = new THREE.PointLight(0xffd8a0, 30, 22, 1.5); mosLight.position.set(mx, 3.0, mz + 7); root.add(mosLight);

  // ---- sky dome + crescent moon (follow nothing: the lane is short, the dome is big)
  const sky = mk(new THREE.SphereGeometry(320, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex(), side: THREE.BackSide, fog: false }), root, 0, 0, -12);
  sky.castShadow = sky.receiveShadow = false;
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex(), fog: false, transparent: true, depthWrite: false })); moon.position.set(-60, 120, -230); moon.scale.setScalar(46); root.add(moon);

  // ---- lights: dim blue moonlight with soft shadows + a cool sky fill
  const hemi = new THREE.HemisphereLight(0x5a6aa8, 0x2a2420, opts.ambient ?? 0.85); root.add(hemi);
  const moonL = new THREE.DirectionalLight(0xa8bcff, opts.moon ?? 0.75); root.add(moonL, moonL.target);
  const MOON_DIR = new THREE.Vector3(-0.45, 0.75, 0.5).normalize();   // from behind a camera looking down the lane: faces get moonlight
  moonL.castShadow = true; moonL.shadow.mapSize.set(2048, 2048); moonL.shadow.bias = -0.0005; moonL.shadow.normalBias = 0.03;
  function aimMoon(cx = 0, cz = -8, half = 16) {
    moonL.target.position.set(cx, 0, cz); moonL.position.copy(moonL.target.position).addScaledVector(MOON_DIR, 60);
    Object.assign(moonL.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 5, far: 140 }); moonL.shadow.camera.updateProjectionMatrix();
  }
  aimMoon();

  const _c = new THREE.Color();
  function setWindow(i, v) { const w = windows[i]; v = clamp(v); _c.copy(DARK).lerp(WARM, v); w.mat.color.copy(_c); doors[w.door].glow.color.copy(DARK).lerp(WARM, v * 0.9); }
  function setWindows(fn) { windows.forEach((w, i) => setWindow(i, fn(w, i))); }
  setWindows(() => 0);

  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D, fog, windows, doors, setWindow, setWindows, aimMoon, mosque: mos, lights: { hemi, moon: moonL, lamps, mosLight } };
}
