// A modern corner store at night, toon look (dh013): counter along x (top at STORE.counterY, cashier behind at
// z ≈ -1.2, customer in front at z ≈ 0.3), a register with a lit screen + cash drawer, a coin dish, candy racks,
// back-wall shelves of instanced snack boxes, a glowing drinks fridge, ceiling light panels (setPower 0..1 = the
// power cut), a night window, a clock, and a framed portrait slot on the back wall (portrait = a canvas plane).
import * as THREE from 'three';
import { toonMat } from '@engine/toon/shade.js';
import { ctex, plaster, terrazzo, fitText, jit } from '@engine/toon/paint.js';
import { box, cyl, plane, sun, lamp } from '@engine/toon/kit.js';
import { makeGlow, makeShafts } from '@engine/toon/light.js';

const PI = Math.PI;
export const STORE = { counterY: 1.0, counterZ: -0.55, register: [0.75, -0.75], dish: [-0.15, -0.38], portrait: [1.65, 2.2, -2.9] };

export function buildStore(root) {
  const wallM = toonMat(plaster('#e9e2d0', [2, 2])), dark = toonMat('#2a2d36');
  const fl = plane(root, 7, 6, toonMat(terrazzo('#e6e1d6', [2, 2])), 0, 0, -0.3); fl.rotation.x = -PI / 2;
  box(root, 6.6, 3, 0.1, wallM, 0, 1.5, -3.05);
  for (const s of [-1, 1]) box(root, 0.1, 3, 6, wallM, s * 3.25, 1.5, -0.3);
  box(root, 6.6, 0.08, 6, toonMat('#f2efe8'), 0, 3.0, -0.3).castShadow = false;
  const lights = [];
  for (const [x, z] of [[-1.5, -1.6], [1.5, -1.6], [-1.5, 0.6], [1.5, 0.6]]) { const l = box(root, 1.2, 0.04, 0.4, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.55) }), x, 2.97, z); l.castShadow = false; lights.push(l); }
  // counter + front panel stripe, register, coin dish, candy rack, tip jar
  const C = STORE;
  box(root, 3.4, C.counterY - 0.05, 0.7, toonMat(ctex('counterFront', 512, 128, (g, r, W, H) => { g.fillStyle = '#2f8a7a'; g.fillRect(0, 0, W, H); g.fillStyle = '#f2c232'; g.fillRect(0, H * 0.18, W, 10); })), 0, (C.counterY - 0.05) / 2, C.counterZ);
  box(root, 3.5, 0.05, 0.8, toonMat('#d8d2c4'), 0, C.counterY - 0.025, C.counterZ);
  const reg = new THREE.Group(); reg.position.set(C.register[0], C.counterY, C.register[1]); root.add(reg);
  box(reg, 0.42, 0.14, 0.42, dark, 0, 0.07, 0, 0.02);
  const drawer = box(reg, 0.38, 0.08, 0.4, toonMat('#3a3e48'), 0, 0.05, 0.02, 0.01);
  const scr = box(reg, 0.3, 0.2, 0.03, dark, 0, 0.32, -0.08, 0.01); scr.rotation.x = -0.3;
  const screen = plane(reg, 0.26, 0.16, new THREE.MeshBasicMaterial({ map: ctex('regScreen', 256, 160, (g, r, W, H) => { g.fillStyle = '#0f2a24'; g.fillRect(0, 0, W, H); g.fillStyle = '#7ef0c8'; g.textAlign = 'center'; fitText(g, 'CHANGE $0.36', W / 2, H * 0.6, W - 20, 40, 'bold', 'Menlo, monospace'); }) }), 0, 0.322, -0.064);
  screen.rotation.x = -0.3;
  box(reg, 0.06, 0.18, 0.06, dark, 0, 0.18, -0.12);
  const dish = cyl(root, 0.13, 0.1, 0.03, toonMat('#c9474a'), C.dish[0], C.counterY + 0.015, C.dish[1], 24);
  const rack = new THREE.Group(); rack.position.set(-1.1, C.counterY, C.counterZ - 0.05); root.add(rack);
  box(rack, 0.6, 0.5, 0.25, toonMat('#c9474a'), 0, 0.25, 0, 0.02);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) box(rack, 0.12, 0.1, 0.04, toonMat(jit(() => ((i * 7 + j * 3) % 10) / 10, ['#f2c232', '#5aa0d8', '#e77a3a', '#8fd06a'][(i + j) % 4], 0.1)), -0.21 + i * 0.14, 0.1 + j * 0.15, 0.14);
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 18, 1, true), new THREE.MeshLambertMaterial({ color: 0xcfe6ee, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }));
  jar.position.set(1.35, C.counterY + 0.1, C.counterZ + 0.05); root.add(jar);
  // back shelves of snacks (instanced), drinks fridge, a clock, the portrait frame, a night window
  const shelfM = toonMat('#b9b2a4');
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.24, 0.12), toonMat('#ffffff'), 200); boxes.castShadow = true;
  const M = new THREE.Matrix4(), col = new THREE.Color(), PAL = ['#e0533f', '#f2c232', '#3f8ad0', '#5bb36a', '#e77ab0', '#8a5ad0', '#f08a3a'];
  let n = 0;
  for (const x0 of [-2.0, 0.0]) for (let row = 0; row < 4; row++) {
    box(root, 1.8, 0.04, 0.4, shelfM, x0 + 0.9 - 0.9 + 0.0, 0.35 + row * 0.5, -2.82);
    for (let i = 0; i < 10 && n < 200; i++) { boxes.setMatrixAt(n, M.makeTranslation(x0 - 0.72 + i * 0.17 - 0.0 + 0.0, 0.49 + row * 0.5, -2.8)); boxes.setColorAt(n, col.set(PAL[(i * 3 + row * 5 + (x0 > -1 ? 2 : 0)) % PAL.length])); n++; }
  }
  boxes.count = n; root.add(boxes);
  const fr = new THREE.Group(); fr.position.set(-3.0, 0, -1.4); root.add(fr);
  box(fr, 0.5, 2.2, 1.6, toonMat('#dfe3e8'), 0, 1.1, 0);
  const fridgeIn = plane(fr, 1.4, 1.8, new THREE.MeshBasicMaterial({ map: ctex('fridgeIn', 256, 320, (g, r, W, H) => {
    g.fillStyle = '#d9f0ff'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < 4; y++) { g.fillStyle = '#a8b8c4'; g.fillRect(0, y * 80 + 74, W, 6); for (let x = 0; x < 9; x++) { g.fillStyle = PAL[(x + y * 2) % PAL.length]; g.fillRect(8 + x * 27, y * 80 + 20, 18, 54); g.fillStyle = '#ffffff'; g.fillRect(8 + x * 27, y * 80 + 40, 18, 10); } }
    g.strokeStyle = '#8a96a0'; g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke();
  }), color: new THREE.Color(1.15, 1.15, 1.15) }), 0.26, 1.1, 0); fridgeIn.rotation.y = PI / 2;
  const clock = cyl(root, 0.18, 0.18, 0.04, toonMat(ctex('storeClock', 128, 128, (g, r, W) => { g.fillStyle = '#fbf8f2'; g.fillRect(0, 0, W, W); g.strokeStyle = '#17121a'; g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, W / 2); g.lineTo(W / 2, W * 0.2); g.moveTo(W / 2, W / 2); g.lineTo(W * 0.72, W * 0.58); g.stroke(); })), -0.9, 2.45, -2.98, 24);
  clock.rotation.x = PI / 2;
  const P = C.portrait;
  box(root, 0.86, 1.06, 0.06, toonMat('#c79a4a'), P[0], P[1], P[2] - 0.02, 0.02);
  const portrait = plane(root, 0.7, 0.9, toonMat('#888888'), P[0], P[1], P[2] + 0.015);
  plane(root, 1.3, 1.1, new THREE.MeshBasicMaterial({ map: ctex('storeNight', 256, 220, (g, r, W, H) => {
    g.fillStyle = '#1e2546'; g.fillRect(0, 0, W, H); g.fillStyle = '#2e3560'; for (let i = 0; i < 6; i++) g.fillRect(i * 44, H * (0.3 + (i % 3) * 0.1), 38, H);
    g.fillStyle = '#f6d98a'; for (let i = 0; i < 18; i++) g.fillRect(8 + (i * 37) % W, H * 0.45 + ((i * 53) % 90), 8, 10);
    g.fillStyle = '#ff6a8a'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.fillText('OPEN', W * 0.72, H * 0.22);
  }) }), 3.19, 1.7, -1.0).rotation.y = -PI / 2;
  const key = sun(root, [0.6, 2.85, 1.9], [0, 0.9, -1.6], { half: 4, color: 0xf4f6ff, hemi: [0xe8eefc, 0x9a948a, 0.9] });
  // (toon look v2) the panels pool cool-white light on the counter + faces; the fridge glows; a streetlight shines in
  // through the window. In the power cut everything inside dies and that streetlight is the only light left.
  const pools = lights.map((l) => lamp(root, 0xeef2ff, 1.7, 4.2, l.position.x, 2.75, l.position.z));
  const fridgeGlow = makeGlow(root, { x: -2.6, y: 1.2, z: -1.4, size: 2.4, intensity: 0.3, color: 0xdff2ff });
  makeGlow(root, { x: 3.1, y: 1.75, z: -1.0, size: 1.8, intensity: 0.35, color: 0xa8bcff });
  const street = new THREE.SpotLight(0x9fb6ff, 9, 0, 0.26, 0.45, 2); street.position.set(3.05, 2.1, -0.85); street.target.position.set(-0.35, 1.2, 0.05); root.add(street, street.target);
  const beam = makeShafts(root, { from: [3.05, 2.1, -0.85], dir: [-3.4, -0.9, 0.9], n: 3, spread: 0.35, w: 0.28, len: 3.6, opacity: 0, color: 0xa8bcff });
  return {
    root, sun: key, lights, drawer, dish, portrait, shafts: [beam], bg: new THREE.Color('#1c2030'),
    /** power cut: 1 = lights on, 0 = off (panels, their pools, the fridge); the streetlight outside stays on */
    setPower(k) {
      for (const l of lights) l.material.color.setScalar(0.04 + 1.56 * k);
      for (const p of pools) p.intensity = 1.7 * k;
      fridgeIn.material.color.setScalar(0.04 + 1.11 * k); fridgeGlow.material.opacity = k; beam.opacity = 0.13 * (1 - k);
    },
  };
}
