// 1690s London street, toon look (dh013): cobbles between two rows of jettied timber-framed houses with gables to the
// street, shop fronts with counters + awnings + hanging signs (FRUIT, BREAD, TAILOR, THE BENT SHILLING tavern), a fruit
// stall, barrels, a handcart, lanterns, a washing line, hazy spire skylines at both ends. Street runs along x; the
// north row's fronts are at z = -3 (facing +z), the south row's at z = +3.6. People stand at z ≈ -2 … 0.
import * as THREE from 'three';
import { toonMat } from '@engine/toon/shade.js';
import { ctex, fitText, wood } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun, lamp } from '@engine/toon/kit.js';
import { makeGlow, makeShafts } from '@engine/toon/light.js';

import { cobbles, timber, tiles, plank, skyline, daySky } from './paint1690.js';

const PI = Math.PI;

function signTex(word, icon, bg = '#2f4a3a') {
  return ctex('sign' + word, 512, 384, (g, r, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = '#d9b45a'; g.lineWidth = 14; g.strokeRect(10, 10, W - 20, H - 20);
    g.save(); g.translate(W / 2, H * 0.4); icon(g); g.restore();
    g.fillStyle = '#f3e7c9'; g.textAlign = 'center'; fitText(g, word, W / 2, H * 0.86, W - 60, 72, 'bold', 'Georgia, serif');
  });
}
const ICONS = {
  loaf: (g) => { g.fillStyle = '#d99a4e'; g.beginPath(); g.ellipse(0, 0, 120, 62, 0, 0, 7); g.fill(); g.strokeStyle = '#8a5424'; g.lineWidth = 10; for (const x of [-50, 0, 50]) { g.beginPath(); g.moveTo(x - 18, -40); g.lineTo(x + 18, 40); g.stroke(); } },
  scissors: (g) => { g.strokeStyle = '#e8e2d2'; g.lineWidth = 16; g.beginPath(); g.moveTo(-90, -60); g.lineTo(60, 40); g.moveTo(-90, 60); g.lineTo(60, -40); g.stroke(); for (const y of [-40, 40]) { g.beginPath(); g.arc(90, y, 26, 0, 7); g.stroke(); } },
  coin: (g) => { g.fillStyle = '#c9cdd3'; g.beginPath(); g.arc(0, 0, 86, 0, 7); g.fill(); g.fillStyle = '#2f4a3a'; g.beginPath(); g.moveTo(30, -86); g.lineTo(86, -30); g.lineTo(86, -86); g.fill(); g.strokeStyle = '#7a808a'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 62, 0, 7); g.stroke(); },
  apple: (g) => { g.fillStyle = '#c9473e'; g.beginPath(); g.arc(-34, 10, 64, 0, 7); g.arc(34, 10, 64, 0, 7); g.fill(); g.fillStyle = '#5f9e55'; g.beginPath(); g.ellipse(26, -70, 34, 16, -0.5, 0, 7); g.fill(); },
};

/** one house: ground floor + 2 jettied storeys + a gable roof; side -1 = north row (front faces +z) */
function house(root, cx, w, side, { shop = false, door = false, plaster = '#efe2c4', roof = '#8a4f3a', seed = 0 } = {}) {
  const grp = new THREE.Group(); grp.position.set(cx, 0, side < 0 ? -3 : 3.6); if (side > 0) grp.rotation.y = PI; root.add(grp);
  const plain = toonMat(plaster), beamM = toonMat('#4a3426');
  const fronts = [
    toonMat(timber(`g${seed}`, { plaster, shop, door: !shop && door })),
    toonMat(timber(`a${seed}`, { plaster, windows: 2 + (seed % 2) })),
    toonMat(timber(`b${seed}`, { plaster, windows: 3 - (seed % 2) })),
  ];
  const H = [2.7, 2.3, 2.2];
  let y = 0;
  for (let i = 0; i < 3; i++) {
    const jet = i * 0.32;
    box(grp, w, H[i], 3, [plain, plain, plain, plain, fronts[i], plain], 0, y + H[i] / 2, -1.5 + jet);
    if (i) box(grp, w + 0.04, 0.16, 0.36, beamM, 0, y - 0.04, jet - 0.16);
    y += H[i];
  }
  const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.12, 0); sh.lineTo(0, 1.9); sh.lineTo(w / 2 + 0.12, 0); sh.closePath();
  const gable = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 3.4, bevelEnabled: false }), [toonMat(timber(`c${seed}`, { plaster, windows: 1 })), toonMat(tiles(roof))]);
  gable.position.set(0, y, 0.74 - 3.4); gable.castShadow = gable.receiveShadow = true; grp.add(gable);
  cyl(grp, 0.22, 0.24, 1.6, toonMat('#7a4a3a'), w * 0.28, y + 1.5, -2.2, 10);
  return { grp, top: y };
}

export function buildStreet(root) {
  const g = plane(root, 60, 14, toonMat(cobbles('#8d8172', [14, 3])), 0, 0, 0.3); g.rotation.x = -PI / 2;
  const kerb = toonMat('#9c9284');
  box(root, 60, 0.12, 0.5, kerb, 0, 0.06, -2.75); box(root, 60, 0.12, 0.5, kerb, 0, 0.06, 3.35);
  const N = [[-13.5, 3.2, {}], [-10, 3.6, { door: true }], [-6.2, 3.8, { shop: true, plaster: '#f1dcc0' }], [-2.4, 3.6, { shop: true }],
    [1.3, 3.6, { shop: true, plaster: '#e9dcc8' }], [5.2, 4.0, { shop: true, plaster: '#f0d7b4', roof: '#6e4a3a' }], [9.2, 3.8, { door: true }], [13, 3.6, {}]];
  N.forEach(([x, w, o], i) => house(root, x, w, -1, { ...o, seed: i }));
  [[-12, 3.6], [-8.2, 3.8], [-4.4, 3.6], [-0.6, 3.8], [3.2, 3.6], [7, 3.8], [10.8, 3.6]].forEach(([x, w], i) => house(root, x, w, 1, { door: i % 2 === 0, seed: 10 + i, plaster: i % 3 ? '#efe2c4' : '#e6d6bd' }));
  // shop counters, awnings and hanging signs
  const dark = toonMat('#4a3426'), counterM = toonMat(wood('#8f5a36', { boards: 2 }));
  const shops = { fruit: -6.2, baker: -2.4, tailor: 1.3, tavern: 5.2 };
  const signs = { fruit: ['FRUIT', 'apple', '#3c5a3a'], baker: ['BREAD', 'loaf', '#5a3a2a'], tailor: ['TAILOR', 'scissors', '#2f3f5f'], tavern: ['THE BENT SHILLING', 'coin', '#2f4a3a'] };
  for (const [k, x] of Object.entries(shops)) {
    if (k !== 'tavern') box(root, 2.6, 0.95, 0.5, counterM, x, 0.475, -2.75);
    const aw = box(root, 3.0, 0.05, 1.0, toonMat(ctex('awn' + k, 256, 64, (gg, r, W, Hh) => { for (let i = 0; i < 8; i++) { gg.fillStyle = i % 2 ? '#f1e6cf' : (k === 'baker' ? '#b8553f' : k === 'tailor' ? '#3f6aa8' : '#4f8a5a'); gg.fillRect(i * 32, 0, 32, Hh); } })), x, 2.5, -2.55);
    aw.rotation.x = 0.32;
    box(root, 0.06, 0.06, 1.1, dark, x + 1.3, 3.3, -2.5);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.68), toonMat(signTex(...signs[k].slice(0, 1), ICONS[signs[k][1]], signs[k][2]), { side: THREE.DoubleSide }));
    sg.position.set(x + 1.3, 2.88, -2.05); sg.rotation.y = PI / 2; sg.castShadow = true; root.add(sg);
  }
  box(root, 1.0, 2.1, 0.12, toonMat('#5a3a26'), shops.tavern - 0.9, 1.05, -2.98);
  // fruit stall in front of the fruit shop: table, crates of apples, striped awning on poles
  const stall = new THREE.Group(); stall.position.set(shops.fruit, 0, -2.0); root.add(stall);
  box(stall, 2.2, 0.08, 0.8, toonMat(wood('#a8743f', { boards: 2 })), 0, 0.86, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(stall, 0.06, sz < 0 ? 2.3 : 0.86, 0.06, dark, sx * 1.05, sz < 0 ? 1.15 : 0.43, sz * 0.36);
  const awn = box(stall, 2.4, 0.04, 1.1, toonMat(ctex('stallAwn', 256, 64, (gg, r, W, Hh) => { for (let i = 0; i < 8; i++) { gg.fillStyle = i % 2 ? '#f6ecd6' : '#c9473e'; gg.fillRect(i * 32, 0, 32, Hh); } })), 0, 2.2, 0.12);
  awn.rotation.x = 0.28;
  const red = toonMat('#c9473e'), green = toonMat('#8fb04a'), crateM = toonMat(plank('#b08050'));
  const apples = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 12, 8), red, 60), pears = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 12, 8), green, 30);
  const M = new THREE.Matrix4();
  let ai = 0, pi = 0;
  [[-0.7, 0], [0, 1], [0.7, 0]].forEach(([x, kind]) => {
    box(stall, 0.6, 0.16, 0.5, crateM, x, 0.98, 0);
    for (let i = 0; i < 30; i++) { const m = M.makeTranslation(x - 0.24 + (i % 6) * 0.095, 1.09 + Math.floor(i / 30) * 0.08 + (i % 3) * 0.01, -0.19 + Math.floor(i / 6) * 0.095); if (kind) { if (pi < 30) pears.setMatrixAt(pi++, m); } else if (ai < 60) apples.setMatrixAt(ai++, m); }
  });
  apples.count = ai; pears.count = pi; for (const m of [apples, pears]) { m.castShadow = true; stall.add(m); }
  // barrels, a handcart, lanterns, a washing line between the rows
  const barrelM = toonMat(plank('#8a5a34')), hoop = toonMat('#3a332e');
  const barrel = (x, z, y = 0) => { cyl(root, 0.3, 0.3, 0.85, barrelM, x, y + 0.425, z, 18); for (const h of [0.15, 0.7]) cyl(root, 0.315, 0.315, 0.05, hoop, x, y + h, z, 18); };
  barrel(shops.tavern + 1.4, -2.4); barrel(shops.tavern + 2.1, -2.2); barrel(shops.tavern + 1.75, -2.35, 0.85);
  const cart = new THREE.Group(); cart.position.set(-9.4, 0, -1.6); cart.rotation.y = 0.3; root.add(cart);
  box(cart, 1.6, 0.4, 0.9, toonMat(plank('#9a6a40')), 0, 0.75, 0);
  for (const s of [-1, 1]) { const wh = cyl(cart, 0.42, 0.42, 0.08, toonMat('#5a3a26'), 0.2, 0.42, s * 0.5, 18); wh.rotation.x = PI / 2; }
  box(cart, 1.4, 0.05, 0.05, dark, -1.3, 0.85, 0.3); box(cart, 1.4, 0.05, 0.05, dark, -1.3, 0.85, -0.3);
  for (let i = 0; i < 5; i++) ball(cart, 0.16, toonMat(['#e8cf8a', '#c9a35a', '#d8b86e'][i % 3]), -0.5 + i * 0.25, 1.05, (i % 2) * 0.2 - 0.1, 12);
  for (const x of [-8.1, -0.5, 3.3, 7.3]) { box(root, 0.05, 0.05, 0.5, dark, x, 3.05, -2.75); box(root, 0.2, 0.3, 0.2, toonMat('#2c2622'), x, 2.85, -2.5); box(root, 0.14, 0.2, 0.14, new THREE.MeshBasicMaterial({ color: 0xf6e7b8 }), x, 2.85, -2.5); }
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 6.6, 6), dark); line.rotation.x = PI / 2; line.position.set(-3.5, 6.2, 0.3); root.add(line);
  ['#f1ebdd', '#b8553f', '#e8d9b0', '#5a7fae', '#f1ebdd'].forEach((c, i) => { const cl = plane(root, 0.5, 0.62 - (i % 2) * 0.15, toonMat(c, { side: THREE.DoubleSide }), -3.5, 5.86 + (i % 2) * 0.07, -2.4 + i * 1.15); cl.rotation.y = PI / 2; cl.castShadow = true; });
  // skylines at both ends (self-lit) — the street's vanishing points
  for (const s of [-1, 1]) { const b = plane(root, 18, 9, new THREE.MeshBasicMaterial({ map: skyline(), alphaTest: 0.5 }), s * 24, 4.2, 0.3); b.rotation.y = -s * PI / 2; }
  const s = sun(root, [7, 10, 8], [-2, 1, -2], { half: 10, map: 4096, far: 40 });
  // (toon look v2) light, not just tone: each shop's dark interior has a warm lamp that glows in the opening and pools on
  // the counter + whoever stands there; dusty sun shafts slant down between the rows; haze makes the far street brighter
  for (const x of Object.values(shops)) {
    makeGlow(root, { x, y: 1.5, z: -2.9, size: 2.2, intensity: 0.3, color: 0xffc98a });
    lamp(root, 0xffc890, 1.6, 3.4, x, 1.9, -2.3);
  }
  const shafts = [makeShafts(root, { from: [-4, 8.5, 2.6], dir: [-0.5, -1, -0.55], n: 6, spread: 7, w: 0.6, len: 9, opacity: 0.07, color: 0xfff0d0 })];
  return { root, sun: s, shops, stall, shafts, bg: daySky(), fog: new THREE.Fog(0xf2e8d6, 9, 46) };
}
