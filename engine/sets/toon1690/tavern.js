// "The Bent Shilling", a 1690s tavern at night (dh013): beamed ceiling, a big fireplace with fire glow on the back wall,
// a bar counter along x (keeper behind it at z ≈ -1.9), barrels + shelves of tankards, tables with benches, candles,
// a window with night outside. Newton's corner table at TABLES.newton, the shady coiners' table at TABLES.coiners.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, wood, plaster, fitText } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun, glow, lamp } from '@engine/toon/kit.js';
import { makeGlow, makeShafts } from '@engine/toon/light.js';

import { plank, brick, nightSky } from './paint1690.js';

const PI = Math.PI;
export const TAVERN = { barZ: -1.2, barY: 1.05, tables: { newton: [-2.3, -1.4], coiners: [-0.7, -2.6], drinkers: [0.9, 0.2] } };

export function buildTavern(root) {
  const wallM = toonMat(plaster('#b98a5c', [2, 2])), beamM = toonMat(plank('#4a3020')), dark = toonMat('#2e1f16');
  const fl = plane(root, 10, 8, toonMat(wood('#6a4630', { boards: 8, repeat: [3, 1] })), 0, 0, -1); fl.rotation.x = -PI / 2;
  box(root, 10, 3.0, 0.12, wallM, 0, 1.5, -4.1);
  box(root, 0.12, 3.0, 8, wallM, -4.4, 1.5, -1); box(root, 0.12, 3.0, 8, wallM, 4.4, 1.5, -1);
  box(root, 10, 0.1, 8, toonMat(plank('#5a3a26', [3, 3])), 0, 3.0, -1).castShadow = false;
  for (let i = 0; i < 5; i++) box(root, 10, 0.2, 0.2, beamM, 0, 2.85, -3.6 + i * 1.5).castShadow = false;
  for (const x of [-4.3, 4.3]) for (let i = 0; i < 4; i++) box(root, 0.16, 3, 0.16, beamM, x, 1.5, -3.9 + i * 1.9);
  box(root, 10, 0.16, 0.16, beamM, 0, 1.0, -4.0);
  // fireplace + fire
  box(root, 2.2, 2.2, 0.5, toonMat(brick('#8a4a38', [2, 2])), 2.2, 1.1, -3.85);
  box(root, 1.3, 1.0, 0.3, toonMat('#1e1410'), 2.2, 0.5, -3.62).castShadow = false;
  box(root, 2.5, 0.14, 0.62, beamM, 2.2, 1.6, -3.78);
  const fire = new THREE.Group(); fire.position.set(2.2, 0.1, -3.45); root.add(fire);
  for (let i = 0; i < 3; i++) { const l = cyl(fire, 0.06, 0.06, 0.8, toonMat('#5a3a22'), 0, 0.06 + i * 0.05, (i - 1) * 0.08, 8); l.rotation.z = PI / 2; l.rotation.y = (i - 1) * 0.3; }
  const flames = [0, 1, 2, 3, 4].map((i) => { const f = new THREE.Mesh(new THREE.ConeGeometry(0.12 - i * 0.012, 0.42, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(...(i % 2 ? [3.2, 1.6, 0.5] : [3.6, 2.4, 0.8])) })); f.position.set((i - 2) * 0.13, 0.32, 0); fire.add(f); return f; });
  const fireGlow = glow(root, '255,150,70', 3.2, 2.2, 0.6, -3.2, 0.7);
  // a pot on a hook, a painting over the mantel, a window with the night outside
  cyl(root, 0.18, 0.14, 0.24, toonMat('#2c2a2a'), 2.6, 0.62, -3.5, 14);
  box(root, 1.1, 0.7, 0.05, toonMat('#7a5a2a'), 2.2, 2.25, -3.83);
  plane(root, 0.95, 0.56, toonMat(ctex('tavPaint', 256, 150, (g, r, W, H) => { g.fillStyle = '#6a8a6a'; g.fillRect(0, 0, W, H); g.fillStyle = '#a8c4d8'; g.fillRect(0, 0, W, H * 0.5); g.fillStyle = '#3a5a3a'; g.beginPath(); g.moveTo(0, H * 0.6); g.lineTo(W * 0.4, H * 0.35); g.lineTo(W, H * 0.62); g.lineTo(W, H); g.lineTo(0, H); g.fill(); g.fillStyle = '#efe2c4'; g.fillRect(W * 0.6, H * 0.45, 26, 22); })), 2.2, 2.25, -3.8);
  plane(root, 1.1, 1.0, new THREE.MeshBasicMaterial({ map: nightSky() }), -4.33, 1.75, -2.4).rotation.y = PI / 2;
  for (const [w, h, z, y] of [[0.08, 1.1, -2.95, 1.75], [0.08, 1.1, -1.85, 1.75], [0.08, 1.1, -2.4, 1.75], [1.2, 0.08, -2.4, 2.28], [1.2, 0.08, -2.4, 1.22]]) box(root, 0.1, h, w === 0.08 ? 0.08 : w, beamM, -4.3, y, z);
  // the bar: counter, shelves with tankards + bottles, barrels on a rack
  const counterM = toonMat(wood('#7a4a2e', { boards: 4 }));
  box(root, 3.4, TAVERN.barY, 0.55, counterM, 2.4, TAVERN.barY / 2, TAVERN.barZ);
  box(root, 3.6, 0.07, 0.7, toonMat(wood('#9a6440', { boards: 2 })), 2.4, TAVERN.barY + 0.035, TAVERN.barZ);
  const tank = toonMetal('#9a9ea6', { rough: 0.45 }), bottle = ['#3f6a4a', '#6a3a2a', '#2f4a5a'];
  for (const y of [1.45, 1.95]) {
    box(root, 2.4, 0.05, 0.3, beamM, 3.0, y, -3.85);
    for (let i = 0; i < 8; i++) {
      const x = 2.0 + i * 0.28;
      if (y < 1.6) { cyl(root, 0.06, 0.07, 0.15, tank, x, y + 0.1, -3.82, 12); }
      else cyl(root, 0.045, 0.05, 0.24, toonMat(bottle[i % 3]), x, y + 0.14, -3.82, 10);
    }
  }
  const barrelM = toonMat(plank('#8a5a34')), hoop = toonMat('#3a332e');
  for (let i = 0; i < 3; i++) { const b = cyl(root, 0.32, 0.32, 0.75, barrelM, 3.95, 0.4 + (i === 2 ? 0.62 : 0), -2.0 - (i % 2) * 0.7 + (i === 2 ? 0.35 : 0), 18); b.rotation.x = PI / 2; const h = cyl(root, 0.33, 0.33, 0.05, hoop, 3.95, b.position.y, b.position.z + 0.3, 18); h.rotation.x = PI / 2; }
  // tables, benches, tankards, candles
  const tabM = toonMat(wood('#8a5a38', { boards: 3 })), candles = [];
  for (const [k, [x, z]] of Object.entries(TAVERN.tables)) {
    box(root, 1.3, 0.07, 0.8, tabM, x, 0.76, z);
    for (const s of [-1, 1]) box(root, 0.08, 0.72, 0.6, dark, x + s * 0.5, 0.36, z);
    for (const s of [-1, 1]) box(root, 1.3, 0.06, 0.3, tabM, x, 0.44, z + s * 0.62);
    cyl(root, 0.06, 0.07, 0.15, tank, x + 0.35, 0.87, z + 0.15, 12);
    cyl(root, 0.02, 0.02, 0.12, toonMat('#f1e8d0'), x - 0.2, 0.85, z - 0.1, 10);
    const fl2 = ball(root, 0.014, new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1) }), x - 0.2, 0.93, z - 0.1, 8); fl2.scale.y = 1.8; fl2.castShadow = false;
    candles.push(glow(root, '255,190,110', 0.55, x - 0.2, 0.93, z - 0.08, 0.7));
    if (k === 'coiners') { const bag = ball(root, 0.16, toonMat('#a88a5a'), x + 0.1, 0.92, z, 16); bag.scale.set(1, 0.85, 1); box(root, 0.04, 0.06, 0.04, dark, x + 0.1, 1.06, z); }
  }
  // a hanging tavern sign indoors (readable) + horseshoe + hat pegs
  box(root, 1.4, 0.5, 0.05, toonMat(ctex('tavSign', 512, 180, (g, r, W, H) => { g.fillStyle = '#2f4a3a'; g.fillRect(0, 0, W, H); g.strokeStyle = '#d9b45a'; g.lineWidth = 10; g.strokeRect(8, 8, W - 16, H - 16); g.fillStyle = '#f3e7c9'; g.textAlign = 'center'; fitText(g, 'THE BENT SHILLING', W / 2, H * 0.64, W - 50, 64, 'bold', 'Georgia, serif'); })), -0.8, 2.35, -4.0);
  for (let i = 0; i < 4; i++) cyl(root, 0.02, 0.02, 0.12, dark, -3.4 + i * 0.3, 1.9, -4.0, 6).rotation.x = PI / 2;
  const key = sun(root, [2.6, 2.2, -2.2], [-1.2, 0.8, -0.4], { half: 4.5, color: 0xffc890, hemi: [0x6a74b0, 0x3a2a24, 0.55] });
  const fireLamp = lamp(root, 0xff8a3a, 5.0, 7.5, 2.2, 0.8, -3.0);
  lamp(root, 0xffc070, 2.0, 3.2, 2.4, 2.3, -1.4);
  for (const [x, z] of Object.values(TAVERN.tables)) lamp(root, 0xffb060, 1.1, 1.9, x - 0.2, 1.05, z - 0.05);
  makeGlow(root, { x: -4.2, y: 1.75, z: -2.4, size: 1.6, intensity: 0.4, color: 0x9ab8ff });
  const shafts = [makeShafts(root, { from: [-4.2, 2.2, -2.4], dir: [1, -0.55, 0.35], n: 4, spread: 0.8, w: 0.2, len: 3.2, opacity: 0.08, color: 0xa8c4ff })];
  return { root, sun: key, flames, fire, fireGlow, fireLamp, candles, shafts, bg: new THREE.Color('#1a1420'), fog: new THREE.Fog(0x3a2a24, 5, 18) };
}
