// A candle-lit attic room (dh013): sloped rafters, a moonlit dormer window, a work table with a candle, a glass jar,
// a little balance and coin stacks, a bed, chest, shelf of bottles, a cloak on a peg, floorboards + rug.
// heap = a growing mountain of silver shavings; chaloner = an alternate dressing (gold fakes, a small screw press, a
// throne-like chair). Camera from +z looking -z; the table top is at y = TABLE_Y.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, wood, plaster, felt } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun, glow, lamp } from '@engine/toon/kit.js';
import { makeGlow, makeShafts } from '@engine/toon/light.js';

import { makeHeap, makeShavings, makeCoin } from '@engine/toon/coins.js';
import { plank, nightSky } from './paint1690.js';

const PI = Math.PI;
export const TABLE_Y = 0.78;

export function buildGarret(root) {
  const wallM = toonMat(plaster('#cdb894', [2, 2])), beamM = toonMat(plank('#5a3d28')), dark = toonMat('#3a281c');
  const fl = plane(root, 5, 4, toonMat(wood('#7a5236', { boards: 6, repeat: [2, 1] })), 0, 0, -0.5); fl.rotation.x = -PI / 2;
  box(root, 4.6, 1.7, 0.1, wallM, 0, 0.85, -2.25);
  for (const s of [-1, 1]) box(root, 0.1, 1.7, 4, wallM, s * 2.25, 0.85, -0.3);
  // sloped roof planes + rafters + ridge beam
  for (const s of [-1, 1]) {
    const p = box(root, 2.75, 0.06, 4.2, toonMat(plank('#6e4c33', [2, 3])), s * 1.15, 2.3, -0.3); p.rotation.z = -s * 0.46; p.castShadow = false;
    for (let i = 0; i < 5; i++) { const r = box(root, 2.6, 0.12, 0.1, beamM, s * 1.12, 2.24, -2.0 + i * 0.85); r.rotation.z = -s * 0.46; }
  }
  box(root, 0.16, 0.16, 4.3, beamM, 0, 2.9, -0.3);
  box(root, 4.4, 0.14, 0.14, beamM, 0, 1.72, -2.12);
  // gable back wall above the knee wall + a dormer window with the moon
  const gb = new THREE.Shape(); gb.moveTo(-2.25, 0); gb.lineTo(0, 1.25); gb.lineTo(2.25, 0); gb.closePath();
  const gm = new THREE.Mesh(new THREE.ShapeGeometry(gb), wallM); gm.position.set(0, 1.7, -2.2); gm.receiveShadow = true; root.add(gm);
  const sky = plane(root, 0.9, 0.7, new THREE.MeshBasicMaterial({ map: ctex('garretMoon', 256, 200, (g, r, W, H) => {
    g.drawImage(nightSky().image, 0, 0, W, H); g.fillStyle = '#f4ecd0'; g.beginPath(); g.arc(W * 0.66, H * 0.36, 30, 0, 7); g.fill();
    g.fillStyle = '#2a3157'; g.beginPath(); g.arc(W * 0.6, H * 0.3, 28, 0, 7); g.fill();
    g.fillStyle = '#20253f'; for (let x = 0; x < W; x += 30) g.fillRect(x, H * 0.75 + (x % 60 ? 6 : -8), 30, H);
  }) }), 0.9, 1.75, -2.16);
  for (const [w, h, x, y] of [[1.0, 0.07, 0.9, 2.12], [1.0, 0.07, 0.9, 1.38], [0.07, 0.8, 0.43, 1.75], [0.07, 0.8, 1.37, 1.75], [0.05, 0.75, 0.9, 1.75]]) box(root, w, h, 0.08, beamM, x, y, -2.14);
  // table + candle + jar + small balance + coin stacks
  const tableM = toonMat(wood('#8a5a36', { boards: 3 }));
  box(root, 1.5, 0.07, 0.8, tableM, 0, TABLE_Y - 0.035, -0.75);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(root, 0.07, TABLE_Y - 0.07, 0.07, dark, sx * 0.66, (TABLE_Y - 0.07) / 2, -0.75 + sz * 0.32);
  cyl(root, 0.07, 0.08, 0.025, toonMat('#b08a4a'), -0.5, TABLE_Y + 0.012, -0.8);
  cyl(root, 0.025, 0.025, 0.16, toonMat('#f1e8d0'), -0.5, TABLE_Y + 0.105, -0.8, 12);
  const flame = ball(root, 0.018, new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1) }), -0.5, TABLE_Y + 0.21, -0.8, 10); flame.scale.y = 1.8; flame.castShadow = false;
  const flameGlow = glow(root, '255,190,110', 0.9, -0.5, TABLE_Y + 0.21, -0.78, 0.8);
  const jarPos = new THREE.Vector3(0.45, TABLE_Y, -0.85);
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.26, 24, 1, true), new THREE.MeshLambertMaterial({ color: 0xcfe6ee, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }));
  jar.position.set(jarPos.x, TABLE_Y + 0.13, jarPos.z); root.add(jar);
  cyl(root, 0.115, 0.115, 0.012, toonMat('#a8c4cc'), jarPos.x, TABLE_Y + 0.006, jarPos.z, 24);
  const inJar = makeShavings(160, { r: 0.022 }); root.add(inJar.mesh);
  const brass = toonMetal('#c79a4a', { rough: 0.3 });
  cyl(root, 0.012, 0.012, 0.3, brass, 0.66, TABLE_Y + 0.15, -1.02, 8); box(root, 0.34, 0.012, 0.012, brass, 0.66, TABLE_Y + 0.3, -1.02);
  for (const s of [-1, 1]) cyl(root, 0.06, 0.05, 0.012, brass, 0.66 + s * 0.16, TABLE_Y + 0.19, -1.02, 16);
  const coinsOld = [];
  for (let i = 0; i < 4; i++) { const c = makeCoin({ r: 0.03, h: 0.004, kind: 'hammered', clip: 0.6, seed: 20 + i }); c.g.position.set(-0.2 + i * 0.012, TABLE_Y + 0.003 + i * 0.0045, -0.55 + i * 0.004); c.g.rotation.y = i; root.add(c.g); coinsOld.push(c); }
  // bed, chest, shelf with bottles, cloak on a peg, rug
  box(root, 0.95, 0.42, 1.9, dark, -1.65, 0.21, -1.1); box(root, 0.9, 0.12, 1.85, toonMat(felt('#7d8fb0')), -1.65, 0.48, -1.1);
  box(root, 0.6, 0.1, 0.4, toonMat('#efe6d2'), -1.65, 0.58, -1.8, 0.04);
  box(root, 0.8, 0.45, 0.45, toonMat(plank('#7a4a2a')), 1.6, 0.225, -1.7, 0.02); box(root, 0.82, 0.06, 0.47, brass, 1.6, 0.36, -1.7);
  box(root, 1.0, 0.04, 0.22, beamM, 1.6, 1.25, -2.1);
  ['#3f6a4a', '#7a3a2a', '#c9a35a', '#4a5a7a'].forEach((c, i) => cyl(root, 0.045, 0.05, 0.2 + (i % 2) * 0.06, toonMat(c), 1.25 + i * 0.22, 1.37 + (i % 2) * 0.03, -2.1, 10));
  cyl(root, 0.02, 0.02, 0.14, dark, -0.9, 1.45, -2.13, 6).rotation.x = PI / 2;
  const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 12, 1, true), toonMat('#4a3a5a', { side: THREE.DoubleSide })); cloak.position.set(-0.9, 0.98, -2.05); cloak.castShadow = true; root.add(cloak);
  const rug = plane(root, 1.8, 1.2, toonMat(ctex('garretRug', 256, 170, (g, r, W, H) => { g.fillStyle = '#8a3a34'; g.fillRect(0, 0, W, H); g.strokeStyle = '#d9b45a'; g.lineWidth = 8; g.strokeRect(14, 14, W - 28, H - 28); g.strokeStyle = '#2f4a6a'; g.strokeRect(30, 30, W - 60, H - 60); })), 0.1, 0.004, 0.2);
  rug.rotation.x = -PI / 2;
  // the silver mountain (grows) + falling shavings
  const heap = makeHeap({ radius: 1.25 }); heap.position.set(0.55, 0, -1.5); heap.scale.setScalar(0.001); root.add(heap);
  const rain = makeShavings(400, { r: 0.05 }); root.add(rain.mesh);
  // Chaloner's dressing: gold stacks, a small screw press on the table, a throne chair
  const chal = new THREE.Group(); chal.visible = false; root.add(chal);
  const gold = toonMetal('#e8b850', { rough: 0.32 });
  for (let i = 0; i < 9; i++) { const n = 3 + (i * 5) % 6; cyl(chal, 0.05, 0.05, n * 0.012, gold, -0.6 + (i % 5) * 0.16, TABLE_Y + n * 0.006, -0.55 - Math.floor(i / 5) * 0.14, 20); }
  const pile = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.6, 24), toonMat(ctex('goldpile', 256, 256, (g, r, W, H) => { g.fillStyle = '#d9a440'; g.fillRect(0, 0, W, H); for (let i = 0; i < 260; i++) { g.strokeStyle = r() < 0.4 ? '#fbe39a' : '#9c6f22'; g.lineWidth = 3; g.beginPath(); g.ellipse(r() * W, r() * H, 10, 5, 0, 0, 7); g.stroke(); } }, [3, 1])));
  pile.position.set(0.9, 0.3, -1.45); pile.castShadow = pile.receiveShadow = true; chal.add(pile);
  const press = new THREE.Group(); press.position.set(0.66, TABLE_Y, -0.95); chal.add(press);
  const iron = toonMetal('#4a4e56', { rough: 0.5 });
  for (const s of [-1, 1]) box(press, 0.05, 0.42, 0.06, iron, s * 0.14, 0.21, 0); box(press, 0.36, 0.06, 0.08, iron, 0, 0.42, 0); box(press, 0.3, 0.04, 0.12, iron, 0, 0.02, 0);
  cyl(press, 0.025, 0.025, 0.3, iron, 0, 0.3, 0, 10); box(press, 0.5, 0.02, 0.02, iron, 0, 0.47, 0);
  const throne = new THREE.Group(); throne.position.set(0.1, 0, -1.35); chal.add(throne);
  box(throne, 0.7, 0.5, 0.6, toonMat('#6b3d8f'), 0, 0.25, 0, 0.05); box(throne, 0.7, 1.5, 0.12, toonMat(wood('#7a4a2a', { boards: 2 })), 0, 0.75, -0.3, 0.03);
  for (const s of [-1, 1]) ball(throne, 0.07, gold, s * 0.33, 1.52, -0.3, 12);
  const key = sun(root, [-2.2, 2.4, 2.6], [0.1, 0.8, -1.0], { half: 3.2, color: 0xffe0b0, hemi: [0x8a9ad0, 0x4a3a40, 0.6] });
  const candle = lamp(root, 0xffaa58, 2.6, 2.8, -0.5, TABLE_Y + 0.32, -0.62);
  makeGlow(root, { x: 0.9, y: 1.75, z: -2.05, size: 1.5, intensity: 0.5, color: 0x9ab8ff });
  const shafts = [makeShafts(root, { from: [0.9, 1.95, -2.1], dir: [-0.25, -0.62, 1], n: 3, spread: 0.6, w: 0.22, len: 2.6, opacity: 0.09, color: 0xa8c4ff })];
  return { root, sun: key, candle, shafts, jarPos, inJar, heap, rain, chal, coinsOld, flame, flameGlow, bg: new THREE.Color('#1c1a2a') };
}
