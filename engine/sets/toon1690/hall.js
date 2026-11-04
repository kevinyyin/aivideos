// Two 1690s halls, toon look (dh013). buildParliament: oak-panelled chamber, three tiers of green benches facing each
// other along z, the Speaker's canopied chair on a dais at the far end (-z), the clerks' table with the gold mace, the
// brass bar rail near the door (+z) where outsiders stand to speak (PARL.bar). buildCourt: the Old Bailey — the judge's
// raised bench under a royal arms panel, a railed dock with spikes (COURT.dock), counsel table, jury box (COURT.jury,
// seats in two rows), candelabra. Juries, not gavels: British courts never used one.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, wood, plaster, felt, fitText } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun, glow, lamp } from '@engine/toon/kit.js';
import { makeGlow, makeShafts } from '@engine/toon/light.js';

import { plank, stone } from './paint1690.js';

const PI = Math.PI;
export const PARL = { bar: [0, 0.3], speaker: [0, -5.3], benches: { x: [1.7, 2.35, 3.0], y: [0.45, 0.85, 1.25], z0: -4.6, z1: -0.9 }, cross: { z: [1.35, 1.95, 2.55], y: [0.45, 0.85, 1.25], x0: -2.6, x1: 2.6 } };
export const COURT = { judge: [0, -4.6], judgeFloor: 1.1, dock: [0.2, 1.0], dockFloor: 0.35, jury: [3.0, -1.6], counsel: [-1.6, -1.6] };

function panelled(root, w, h, d, cy = 0, winK = 1) {
  const oak = toonMat(wood('#6a4428', { boards: 6, repeat: [2, 1] })), up = toonMat(plaster('#d9cbb0', [2, 1]));
  box(root, w, 2.2, 0.12, oak, 0, 1.1, -d / 2 + cy); box(root, w, h - 2.2, 0.12, up, 0, 2.2 + (h - 2.2) / 2, -d / 2 + cy);
  box(root, w, h, 0.12, up, 0, h / 2, d / 2 + cy);
  for (const s of [-1, 1]) { box(root, 0.12, 2.2, d, oak, s * w / 2, 1.1, cy); box(root, 0.12, h - 2.2, d, up, s * w / 2, 2.2 + (h - 2.2) / 2, cy); }
  box(root, w, 0.14, d, toonMat(plank('#5a3a26', [4, 4])), 0, h, cy).castShadow = false;
  const rail = toonMat('#4a2e1c');
  for (const s of [-1, 1]) box(root, 0.16, 0.1, d, rail, s * (w / 2 - 0.08), 2.2, cy);
  box(root, w, 0.1, 0.16, rail, 0, 2.2, -d / 2 + 0.08 + cy);
  // tall windows high on both side walls
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const z = cy - d / 2 + d * (0.2 + i * 0.3);
    const win = plane(root, 0.9, 1.6, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.3, 1.22).multiplyScalar(winK) }), s * (w / 2 - 0.07), 3.3, z); win.rotation.y = -s * PI / 2;
    if (winK > 1) makeGlow(root, { x: s * (w / 2 - 0.3), y: 3.3, z, size: 2.0, intensity: 0.35, color: 0xfff0d6 });
    for (const [ww, hh, y] of [[0.06, 1.6, 3.3], [0.9, 0.06, 3.3]]) box(root, 0.06, hh, ww === 0.06 ? 0.06 : ww, rail, s * (w / 2 - 0.09), y, z);
  }
}

export function buildParliament(root) {
  const W = 9, D = 9, H = 5, cz = -1.5;
  const fl = plane(root, W, D, toonMat(wood('#7a5236', { boards: 10, repeat: [2, 2] })), 0, 0, cz); fl.rotation.x = -PI / 2;
  panelled(root, W, H, D, cz, 1.7);
  const green = toonMat(felt('#3f6b4f')), oak = toonMat(wood('#5a3a24', { boards: 2 })), B = PARL.benches;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const x = s * B.x[i], y = B.y[i], len = B.z1 - B.z0, zc = (B.z0 + B.z1) / 2;
    box(root, 0.7, y - 0.4 + 0.4, len, oak, x + s * 0.05, (y - 0.4 + 0.4) / 2 - 0.0, zc);
    box(root, 0.55, 0.12, len, green, x, y, zc, 0.03);
    box(root, 0.1, 0.5, len, green, x + s * 0.3, y + 0.3, zc, 0.03);
  }
  // cross benches behind the bar, facing the Speaker: the "wall of faces" behind anyone addressing the House
  const X = PARL.cross;
  for (let i = 0; i < 3; i++) {
    const y = X.y[i], z = X.z[i], len = X.x1 - X.x0;
    box(root, len, y, 0.62, oak, 0, y / 2, z + 0.05);
    box(root, len, 0.12, 0.5, green, 0, y, z, 0.03);
    box(root, len, 0.5, 0.1, green, 0, y + 0.3, z + 0.28, 0.03);
  }
  // Speaker's chair on a dais with a canopy
  const sp = new THREE.Group(); sp.position.set(PARL.speaker[0], 0, PARL.speaker[1]); root.add(sp);
  box(sp, 2.0, 0.4, 1.4, oak, 0, 0.2, 0);
  box(sp, 1.0, 0.5, 0.8, green, 0, 0.65, 0, 0.04); box(sp, 1.1, 2.6, 0.14, oak, 0, 1.7, -0.4);
  box(sp, 1.4, 0.3, 1.0, oak, 0, 3.1, 0); for (const s of [-1, 1]) ball(sp, 0.12, toonMat('#e3b24f'), s * 0.55, 3.35, 0.2, 12);
  // clerks' table with the mace, books, papers + quill
  const tb = new THREE.Group(); tb.position.set(0, 0, -2.9); root.add(tb);
  box(tb, 1.2, 0.85, 2.6, toonMat(wood('#6a4428', { boards: 3 })), 0, 0.425, 0); box(tb, 1.3, 0.05, 2.7, toonMat(felt('#3a5a44')), 0, 0.87, 0);
  const gold = toonMetal('#e3b24f', { rough: 0.26 });
  const mace = cyl(tb, 0.035, 0.035, 1.5, gold, 0, 0.95, 0.2, 10); mace.rotation.x = PI / 2; ball(tb, 0.13, gold, 0, 0.99, -0.62, 14);
  ['#7a2a2a', '#2a4a7a', '#3a5a2a'].forEach((c, i) => box(tb, 0.3, 0.06, 0.22, toonMat(c), -0.32, 0.92 + i * 0.06, 0.9, 0.01));
  plane(tb, 0.3, 0.4, toonMat('#f4ecd8'), 0.3, 0.9, -0.9).rotation.x = -PI / 2;
  // the bar of the House: a brass rail across the floor near the door, + the door
  const brass = toonMetal('#c79a4a', { rough: 0.3 });
  box(root, 2.4, 0.05, 0.05, brass, 0, 1.0, PARL.bar[1] - 0.4); for (const s of [-1, 1]) cyl(root, 0.03, 0.03, 1.0, brass, s * 1.2, 0.5, PARL.bar[1] - 0.4, 8);
  
  const key = sun(root, [-3.0, 4.2, -3.8], [0.3, 0.9, 1.2], { half: 6, map: 4096, color: 0xfff2dc, hemi: [0xd8e2f4, 0x8a7258, 0.85] });
  // window light: dusty shafts from the high left windows across the chamber; two chandeliers pool on the benches + faces
  const shafts = [-4.2, -1.5, 1.2].map((z, i) => makeShafts(root, { from: [-4.3, 3.7, z], dir: [1, -0.72, 0.28], n: 3, spread: 0.7, w: 0.32, len: 5.2, opacity: 0.08, seed: i + 5 }));
  for (const z of [1.9, -2.6]) { lamp(root, 0xffd8a0, 2.0, 4.2, 0, 3.5, z); makeGlow(root, { x: 0, y: 3.6, z, size: 0.9, intensity: 0.7, color: 0xffd8a0 }); }
  return { root, sun: key, shafts, bg: new THREE.Color('#3a2a20'), fog: new THREE.Fog(0xe8dccb, 6, 22) };
}

/** the "GUILTY" speech card (canvas sprite) for the jury foreman */
export function verdictTex(word = 'GUILTY') {
  return ctex('verdict' + word, 512, 256, (g, r, W, H) => {
    g.fillStyle = '#fbf6ea'; g.strokeStyle = '#17121a'; g.lineWidth = 12;
    g.beginPath(); g.roundRect(14, 14, W - 28, H - 70, 40); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(W * 0.3, H - 58); g.lineTo(W * 0.26, H - 12); g.lineTo(W * 0.42, H - 58); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#fbf6ea'; g.fillRect(W * 0.3, H - 66, W * 0.12, 14);
    g.fillStyle = '#a8303a'; g.textAlign = 'center'; fitText(g, word, W / 2, H * 0.52, W - 90, 104, '900', 'Georgia, serif');
  });
}

export function buildCourt(root) {
  const W = 9, D = 9, H = 5, cz = -1.5;
  const fl = plane(root, W, D, toonMat(stone('#9a9184', [4, 4])), 0, 0, cz); fl.rotation.x = -PI / 2;
  panelled(root, W, H, D, cz);
  const oak = toonMat(wood('#5a3a24', { boards: 3 })), dark = toonMat('#2e1f16'), red = toonMat(felt('#8a2a30'));
  // the judge's bench: raised platform, a long front panel, a high-backed chair, the royal arms
  const jb = new THREE.Group(); jb.position.set(COURT.judge[0], 0, COURT.judge[1]); root.add(jb);
  box(jb, 5, COURT.judgeFloor, 1.8, oak, 0, COURT.judgeFloor / 2, -0.4);
  box(jb, 4.6, 0.95, 0.14, toonMat(wood('#6a4428', { boards: 2 })), 0, COURT.judgeFloor + 0.475, 0.5);
  box(jb, 4.8, 0.08, 0.5, toonMat(felt('#3a5a44')), 0, COURT.judgeFloor + 0.95, 0.35);
  box(jb, 1.0, 2.2, 0.14, red, 0, COURT.judgeFloor + 1.1, -1.2, 0.05);
  plane(jb, 1.5, 1.3, toonMat(ctex('arms', 300, 260, (g, r, Wc, Hc) => {
    g.fillStyle = '#d9b45a'; g.beginPath(); g.moveTo(Wc * 0.25, Hc * 0.22); g.lineTo(Wc * 0.75, Hc * 0.22); g.lineTo(Wc * 0.75, Hc * 0.6); g.quadraticCurveTo(Wc / 2, Hc * 0.95, Wc * 0.25, Hc * 0.6); g.closePath(); g.fill();
    g.strokeStyle = '#17121a'; g.lineWidth = 8; g.stroke();
    g.fillStyle = '#a8303a'; g.fillRect(Wc * 0.27, Hc * 0.24, Wc * 0.23, Hc * 0.2); g.fillStyle = '#2a4a8a'; g.fillRect(Wc * 0.5, Hc * 0.44, Wc * 0.23, Hc * 0.2);
    g.fillStyle = '#e3b24f'; g.beginPath(); g.moveTo(Wc * 0.36, Hc * 0.2); g.lineTo(Wc * 0.4, Hc * 0.05); g.lineTo(Wc * 0.5, Hc * 0.14); g.lineTo(Wc * 0.6, Hc * 0.05); g.lineTo(Wc * 0.64, Hc * 0.2); g.closePath(); g.fill(); g.stroke();
    for (const s of [-1, 1]) { g.fillStyle = s < 0 ? '#d9a440' : '#f4f0e6'; g.beginPath(); g.ellipse(Wc / 2 + s * Wc * 0.36, Hc * 0.5, Wc * 0.1, Hc * 0.24, s * 0.2, 0, 7); g.fill(); g.stroke(); }
  }), { alphaTest: 0.5 }), 0, COURT.judgeFloor + 2.9, -1.25);
  ball(jb, 0.05, toonMat('#c79a4a'), -2.2, COURT.judgeFloor + 1.0, 0.45, 10);
  // the dock: a railed box on a step, iron spikes along the top rail
  const dock = new THREE.Group(); dock.position.set(COURT.dock[0], 0, COURT.dock[1]); root.add(dock);
  box(dock, 1.8, COURT.dockFloor, 1.4, oak, 0, COURT.dockFloor / 2, 0);
  box(dock, 1.8, 0.75, 0.1, oak, 0, COURT.dockFloor + 0.38, -0.65); for (const s of [-1, 1]) box(dock, 0.1, 0.75, 1.4, oak, s * 0.85, COURT.dockFloor + 0.38, 0);
  box(dock, 1.9, 0.08, 0.14, dark, 0, COURT.dockFloor + 0.78, -0.65);
  const iron = toonMetal('#4a4e56', { rough: 0.5 });
  for (let i = 0; i < 13; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.16, 6), iron); sp.position.set(-0.85 + i * 0.142, COURT.dockFloor + 0.9, -0.65); dock.add(sp); }
  const gate = new THREE.Group(); gate.position.set(0.85, COURT.dockFloor, 0.65); dock.add(gate);
  box(gate, 0.06, 0.75, 0.06, dark, 0, 0.38, 0); box(gate, 0.06, 0.75, 0.06, dark, 0, 0.38, -0.6); box(gate, 0.06, 0.06, 0.6, dark, 0, 0.72, -0.3);
  // counsel table with papers, jury box with two benches
  box(root, 2.2, 0.8, 0.9, oak, COURT.counsel[0], 0.4, COURT.counsel[1]);
  box(root, 2.3, 0.05, 1.0, toonMat(felt('#3a5a44')), COURT.counsel[0], 0.82, COURT.counsel[1]);
  for (let i = 0; i < 4; i++) plane(root, 0.25, 0.32, toonMat('#f4ecd8'), COURT.counsel[0] - 0.6 + i * 0.4, 0.85 + i * 0.002, COURT.counsel[1] + (i % 2) * 0.1).rotation.x = -PI / 2;
  const jury = new THREE.Group(); jury.position.set(COURT.jury[0], 0, COURT.jury[1]); root.add(jury);
  box(jury, 1.4, 0.3, 3.0, oak, 0.2, 0.15, 0); box(jury, 0.1, 1.0, 3.0, oak, -0.5, 0.5, 0);
  for (const [x, y] of [[0.05, 0.45], [0.65, 0.75]]) box(jury, 0.4, 0.08, 2.9, toonMat(felt('#6a3a2a')), x, y, 0);
  // candelabra on the bench + wall sconces
  const brass = toonMetal('#c79a4a', { rough: 0.3 }), flames = [];
  for (const x of [-1.6, 1.6]) {
    cyl(jb, 0.03, 0.06, 0.5, brass, x, COURT.judgeFloor + 1.2, 0.35, 10);
    for (const dx of [-0.12, 0, 0.12]) { cyl(jb, 0.015, 0.015, 0.12, toonMat('#f1e8d0'), x + dx, COURT.judgeFloor + 1.5, 0.35, 8); flames.push(glow(jb, '255,200,120', 0.35, x + dx, COURT.judgeFloor + 1.6, 0.38, 0.75)); }
  }
  const key = sun(root, [3.4, 4.4, 2.4], [-0.4, 1.0, -1.8], { half: 6, map: 4096, color: 0xfff0d8, hemi: [0xd0dcf0, 0x7a6a58, 0.85] });
  // candlelight: the two candelabra on the bench, a sconce by the jury and one by the dock pool warm light on faces
  for (const x of [-1.6, 1.6]) lamp(root, 0xffb868, 2.4, 3.8, COURT.judge[0] + x, COURT.judgeFloor + 1.75, COURT.judge[1] + 0.6);
  for (const [x, y, z] of [[COURT.jury[0] - 0.9, 2.1, COURT.jury[1] - 0.2], [COURT.dock[0] + 1.0, 2.2, COURT.dock[1] - 0.6]]) {
    lamp(root, 0xffb060, 2.0, 3.0, x, y, z); flames.push(glow(root, '255,200,120', 0.5, x, y, z, 0.8)); cyl(root, 0.02, 0.02, 0.14, toonMat('#f1e8d0'), x, y - 0.1, z, 8);
  }
  return { root, sun: key, gate, flames, bg: new THREE.Color('#2a2420'), fog: new THREE.Fog(0x2a2220, 6, 18) };
}
