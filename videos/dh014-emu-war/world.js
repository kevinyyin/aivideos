// dh014 outdoor world: one painted outback map, 1932 Western Australian wheatbelt. Areas (set-local metres):
//   farm + wheat field x -45..45, z -42..8 (house at (-16, -32), windmill (-5, -36)); road along z = 14; camp (-40, 25);
//   stubble paddock x 45..105; dam (68, -78); open plain around (0, 120); the long emu fence along x = 160.
// Each SHOT entry: cam(t) {p, a, fov}, focus(t), sky, tone, update(t, camera, k) (k = shot helpers from shots.js).
import * as THREE from 'three';
import { K, clamp, lerp, smooth, easeOut, rng } from '@engine/core.js';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { makeToon, makeBlob, makeStickArm, cardPoint, lidAt, ARMS, INK } from '@engine/toon/cards.js';
import { ctex, wood, blotch, fitText, vgrad, jit } from '@engine/toon/paint.js';
import { NOINK } from '@engine/toon/ink.js';
import { makeEmu, makeEmuFlock } from '@engine/toon/emu.js';
import { makePuffs } from '@engine/toon/extras.js';
import { PI, box, cyl, plane, rod, canvasMat, sunLight, atScreen, ground, CAST, XTRA, makeTruck, makeLewis, crate, gum, noInk } from './kit.js';
import { LINES, WORDS } from './timeline_v1.js';
import { LINES as LINES2, WORDS as WORDS2 } from './timeline.js';

// v1 choreography runs on the frozen v1 timeline (wt); v2's new shots run on video time (nt = v2 word starts)
const LW = {}; for (const id in LINES) LW[id] = WORDS.filter((w) => w[0] >= LINES[id][0] - 0.01 && w[0] < LINES[id][1] + 0.01).map((w) => w[0]);
export const wt = (id, i) => LW[id][Math.min(i, LW[id].length - 1)];
const NW = {}; for (const id in LINES2) NW[id] = WORDS2.filter((w) => w[0] >= LINES2[id][0] - 0.01 && w[0] < LINES2[id][1] + 0.01).map((w) => w[0]);
export const nt = (id, i) => NW[id][Math.min(i, NW[id].length - 1)];
const TAU = PI * 2;
const boing = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * PI * 2.5) * Math.exp(-u * 5.5));

// ---------------------------------------------------------------- painted textures
const dirtTex = () => ctex('dh14dirt', 512, 512, (g, r, W, H) => {
  g.fillStyle = '#c98f5e'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) blotch(g, r() * W, r() * H, 60 + r() * 120, r() < 0.5 ? '235,190,140' : '150,90,55', 0.12);
  for (let i = 0; i < 140; i++) { const x = r() * W, y = r() * H; g.strokeStyle = r() < 0.6 ? 'rgba(130,125,70,0.55)' : 'rgba(110,70,45,0.4)'; g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 12, y - 5 - r() * 9); g.stroke(); } }
}, [90, 90]);
const wheatGround = () => ctex('dh14wheatg', 512, 512, (g, r, W, H) => {
  g.fillStyle = '#d9ad57'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) blotch(g, r() * W, r() * H, 80 + r() * 120, r() < 0.5 ? '250,220,140' : '170,120,50', 0.14);
  for (let y = 0; y < H; y += 16) { g.fillStyle = 'rgba(150,100,40,0.18)'; g.fillRect(0, y, W, 5); }
}, [14, 8]);
const stubbleTex = () => ctex('dh14stub', 512, 512, (g, r, W, H) => {
  g.fillStyle = '#d8c18c'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) blotch(g, r() * W, r() * H, 70 + r() * 100, r() < 0.5 ? '245,230,190' : '160,130,80', 0.14);
  for (let i = 0; i < 700; i++) { const x = r() * W, y = r() * H; g.strokeStyle = 'rgba(150,120,70,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 7); g.stroke(); }
}, [10, 10]);
const roadTex = () => ctex('dh14road', 512, 128, (g, r, W, H) => {
  g.fillStyle = '#dcae7c'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 20; i++) blotch(g, r() * W, r() * H, 40 + r() * 60, r() < 0.5 ? '245,215,175' : '170,110,70', 0.16);
  for (const y of [0.3, 0.7]) { g.fillStyle = 'rgba(150,95,60,0.35)'; g.fillRect(0, H * y - 7, W, 14); }
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(120,80,50,0.35)'; g.beginPath(); g.ellipse(r() * W, r() * H, 3, 2, 0, 0, 7); g.fill(); }
}, [80, 1]);
const wheatClumpTex = () => ctex('dh14clump', 160, 220, (g, r, W, H) => {
  for (let i = 0; i < 7; i++) {
    const x0 = W * (0.2 + 0.6 * r()), lean = (r() - 0.5) * 34, top = 30 + r() * 50;
    g.strokeStyle = '#5c4320'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, H); g.quadraticCurveTo(x0, H * 0.6, x0 + lean, top + 30); g.stroke();
    g.strokeStyle = '#e1b85e'; g.lineWidth = 3.5; g.stroke();
    g.save(); g.translate(x0 + lean, top + 14); g.rotate(lean / 90);
    g.beginPath(); g.ellipse(0, 0, 9, 22, 0, 0, 7); g.fillStyle = '#ecc46a'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#5c4320'; g.stroke();
    g.strokeStyle = 'rgba(120,80,30,0.7)'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(-7, k * 7); g.lineTo(0, k * 7 + 4); g.lineTo(7, k * 7); g.stroke(); }
    g.restore();
  }
});
const corrTex = (base) => ctex('dh14corr' + base, 256, 64, (g, r, W, H) => {
  for (let x = 0; x < W; x += 8) { g.fillStyle = (x / 8) % 2 ? base : jit(r, base, 0.12, 0, 0); g.fillRect(x, 0, 8, H); }
}, [10, 1]);
const nettingTex = () => ctex('dh14net', 256, 256, (g, r, W, H) => {
  g.strokeStyle = 'rgba(70,70,75,0.9)'; g.lineWidth = 2.2;
  for (let k = -W; k < W * 2; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + H, H); g.stroke(); g.beginPath(); g.moveTo(k, H); g.lineTo(k + H, 0); g.stroke(); }
}, [120, 1]);
const bountyTex = () => ctex('dh14bounty', 300, 380, (g, r, W, H) => {
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) blotch(g, r() * W, r() * H, 70, '190,160,110', 0.15);
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 6; g.strokeRect(10, 10, W - 20, H - 20);
  g.fillStyle = '#3a2a1a'; g.textAlign = 'center'; fitText(g, 'BOUNTY', W / 2, 92, W - 50, 74, 'bold', 'Georgia, serif');
  fitText(g, 'PAID HERE', W / 2, 140, W - 60, 38, 'bold', 'Georgia, serif');
  g.beginPath(); g.arc(W / 2, 240, 62, 0, 7); g.fillStyle = '#e9b949'; g.fill(); g.lineWidth = 7; g.stroke();
  g.fillStyle = '#3a2a1a'; fitText(g, '£', W / 2, 266, 80, 76, 'bold', 'Georgia, serif');
  g.font = '22px Georgia, serif'; g.fillText('SHIRE OF CAMPION', W / 2, 345);
});

// ---------------------------------------------------------------- set pieces
function farmhouse(p, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  const boards = toonMat(wood('#efe2c6', { boards: 10, repeat: [2, 1] })), trim = toonMat('#f6f1e4'), deck = toonMat(wood('#9c7650', { boards: 6 }));
  const roofM = toonMat(corrTex('#a6abad')), red = toonMat('#a3503a'), pane = toonMat('#3d5a78'), post = toonMat('#e9e2d0');
  for (let i = 0; i < 12; i++) box(g, 0.25, 0.5, 0.25, toonMat('#6e5640'), -5 + (i % 4) * 3.3, 0.25, -4 + Math.floor(i / 4) * 4);
  box(g, 12.4, 0.14, 10.4, deck, 0, 0.55, 0);
  box(g, 8.4, 2.7, 6.4, boards, 0, 1.97, 0);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1), roofM); roof.rotation.y = PI / 4; roof.scale.set(9.2 / 1.414, 2.4, 7.2 / 1.414); roof.position.set(0, 3.32 + 1.2, 0); roof.castShadow = roof.receiveShadow = true; g.add(roof);
  const ver = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.6, 1, 4, 1, true), roofM); ver.rotation.y = PI / 4; ver.scale.set(8.6 / 1.414, 0.7, 6.6 / 1.414); ver.position.set(0, 3.0, 0);
  ver.material = roofM; ver.castShadow = ver.receiveShadow = true; ver.material.side = THREE.DoubleSide; g.add(ver);
  for (let i = 0; i <= 6; i++) for (const zz of [-5.05, 5.05]) cyl(g, 0.07, 0.07, 2.35, post, -6.05 + i * 2.017, 1.8, zz, 8);
  for (let i = 1; i < 5; i++) for (const xx of [-6.05, 6.05]) cyl(g, 0.07, 0.07, 2.35, post, xx, 1.8, -5.05 + i * 2.02, 8);
  for (const xx of [-2.4, 2.4]) { box(g, 1.3, 1.35, 0.1, trim, xx, 2.1, 3.22); box(g, 1.05, 1.1, 0.06, pane, xx, 2.1, 3.26); box(g, 1.05, 0.06, 0.1, trim, xx, 2.1, 3.3); box(g, 0.06, 1.1, 0.1, trim, xx, 2.1, 3.3);
    box(g, 0.45, 1.35, 0.06, toonMat('#5e8a6a'), xx - 0.9, 2.1, 3.25); box(g, 0.45, 1.35, 0.06, toonMat('#5e8a6a'), xx + 0.9, 2.1, 3.25); }
  box(g, 1.0, 2.0, 0.1, red, 0, 1.62, 3.23); cyl(g, 0.05, 0.05, 0.04, toonMat('#d8b54a'), 0.32, 1.6, 3.3, 8);
  box(g, 2.0, 0.3, 0.8, deck, 0, 0.3, 5.5); box(g, 0.8, 3.2, 0.8, toonMat('#a55a3e'), 2.5, 4.6, -1.5);
  // water tank on a stand
  const tank = new THREE.Group(); tank.position.set(6.8, 0, -1.5); g.add(tank);
  for (const [a, b] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) box(tank, 0.15, 1.6, 0.15, toonMat('#7b6048'), a, 0.8, b);
  box(tank, 2.2, 0.12, 2.2, deck, 0, 1.62, 0);
  const tk = cyl(tank, 1.15, 1.15, 2.0, toonMetal(corrTex('#c4c9cb'), { rough: 0.42 }), 0, 2.68, 0, 28); tk.material.map.repeat.set(14, 1);
  const lid = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.45, 28), toonMetal('#b0b5b8', { rough: 0.45 })); lid.position.set(0, 3.9, 0); lid.castShadow = true; tank.add(lid);
  return g;
}
let BLADE = null;
function windmill(p, x, z, h = 9) {
  BLADE = BLADE || toonMetal('#dfe2e3', { rough: 0.4 });
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  const steel = toonMetal('#a3a8ab', { rough: 0.45 }), dk = toonMetal('#6a7073', { rough: 0.5 });   // galvanised iron
  const leg = (sx, sz) => rod(g, [sx * 1.3, 0, sz * 1.3], [sx * 0.22, h, sz * 0.22], 0.05, steel, 6);
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) leg(a, b);
  for (let k = 1; k < 5; k++) { const y0 = (k - 1) * h / 4.3, y1 = k * h / 4.3, w0 = lerp(1.3, 0.22, y0 / h), w1 = lerp(1.3, 0.22, y1 / h);
    for (const [ax, az, bx, bz] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) rod(g, [ax * w0, y0, az * w0], [bx * w1, y1, bz * w1], 0.025, dk, 5); }
  const head = new THREE.Group(); head.position.set(0, h + 0.3, 0); g.add(head);
  box(head, 0.4, 0.4, 0.6, dk, 0, 0, 0); rod(head, [0, 0, -0.2], [0, 0.1, -2.6], 0.04, dk); const vane = box(head, 0.04, 1.0, 1.4, toonMat('#c2c6c8'), 0, 0.2, -2.7); vane.castShadow = true;
  const fan = new THREE.Group(); fan.position.set(0, 0, 0.45); head.add(fan);
  for (let i = 0; i < 14; i++) { const b = new THREE.Group(); b.rotation.z = (i / 14) * TAU; fan.add(b); const bl = box(b, 0.32, 1.25, 0.03, BLADE, 0, 1.15, 0); bl.rotation.y = 0.5; }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.03, 6, 40), dk); fan.add(ring);
  return { g, fan };
}
function tent(p, x, z, rotY = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; p.add(g);
  const can = toonMat('#e9dfc6'), canDk = toonMat('#d6c8a6');
  const walls = cyl(g, 2.1, 2.1, 1.4, can, 0, 0.7, 0, 20);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.0, 20), canDk); roof.position.y = 2.4; roof.castShadow = roof.receiveShadow = true; g.add(roof);
  box(g, 0.9, 1.3, 0.05, toonMat('#3a3226'), 0, 0.65, 2.08);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; rod(g, [Math.cos(a) * 2.3, 1.42, Math.sin(a) * 2.3], [Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4], 0.008, toonMat('#6b5a44'), 4); }
  return g;
}

// ---------------------------------------------------------------- the world
export function buildWorld(root) {
  const r = rng(1932);
  const base = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), toonMat(dirtTex())); base.rotation.x = -PI / 2; base.receiveShadow = true; root.add(base);
  const patch = (w, d, tex, x, z, y = 0.02) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toonMat(tex)); o.rotation.x = -PI / 2; o.position.set(x, y, z); o.receiveShadow = true; root.add(o); return o; };
  patch(92, 52, wheatGround(), 0, -17, 0.06);
  patch(62, 50, stubbleTex(), 75, -16, 0.05);
  patch(600, 6.5, roadTex(), 50, 14, 0.1);
  // far hills + mesas + clouds (fogged)
  const hillM = [toonMat('#b98a62'), toonMat('#a99568'), toonMat('#c49a72')];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * TAU + r() * 0.2, R = 300 + r() * 120, h = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), hillM[i % 3]);
    h.scale.set(50 + r() * 50, 10 + r() * 16, 40 + r() * 30); h.position.set(Math.cos(a) * R, -2, Math.sin(a) * R); root.add(h);
  }
  // farm
  farmhouse(root, -16, -33);
  const mill = windmill(root, -4.5, -37);
  const mill2 = windmill(root, 63, -66, 8);
  // wheat clumps (camera-facing cards, instanced)
  const clumpGeo = new THREE.PlaneGeometry(0.75, 1.0); clumpGeo.translate(0, 0.42, 0);
  const clumpMat = new THREE.MeshLambertMaterial({ map: wheatClumpTex(), alphaTest: 0.5, side: THREE.DoubleSide });
  clumpMat.map.wrapS = clumpMat.map.wrapT = THREE.ClampToEdgeWrapping;
  const NW = 5200, wheat = new THREE.InstancedMesh(clumpGeo, clumpMat, NW); wheat.layers.set(NOINK); wheat.receiveShadow = true; wheat.frustumCulled = false; root.add(wheat);
  const WP = [];
  while (WP.length < NW) {
    const x = -45 + r() * 90, z = -42 + r() * 50;
    if (x > -25 && x < -3 && z < -24) continue;   // house yard
    WP.push([x, z, 0.75 + r() * 0.45]);
  }
  const wM = new THREE.Matrix4(), wQ = new THREE.Quaternion(), wS = new THREE.Vector3(), wP = new THREE.Vector3(), YA = new THREE.Vector3(0, 1, 0);
  function faceWheat(cam) {
    WP.forEach(([x, z, s], i) => { wQ.setFromAxisAngle(YA, Math.atan2(cam.x - x, cam.z - z)); wheat.setMatrixAt(i, wM.compose(wP.set(x, 0, z), wQ, wS.set(s, s, s))); });
    wheat.instanceMatrix.needsUpdate = true;
  }
  // trees
  const trees = [[-30, -40, 1.2], [-34, -26, 1.0], [12, -46, 1.3], [24, -44, 1.1], [-52, -8, 1.2], [52, 4, 1.0], [-20, 22, 1.1], [-58, 34, 1.3], [-28, 40, 1.0],
    [10, 24, 1.2], [36, 22, 1.0], [96, 22, 1.2], [118, 8, 1.1], [56, -86, 1.2], [86, -96, 1.0], [-12, 150, 1.0], [18, 158, 1.2], [176, 20, 1.1], [190, -30, 1.3],
    [148, -40, 1.0], [-80, 10, 1.2], [-110, 22, 1.0], [130, 30, 1.2], [70, 40, 1.1], [-46, -60, 1.2], [30, -70, 1.0], [100, -40, 1.1]];
  trees.forEach(([x, z, s], i) => gum(root, x, z, s, i + 3));
  for (let i = 0; i < 40; i++) { const a = r() * TAU, R = 160 + r() * 120; gum(root, Math.cos(a) * R, Math.sin(a) * R, 0.9 + r() * 0.5, 100 + i); }
  // farm fence along the road
  const postM = toonMat('#7a5f45'), wireM = new THREE.MeshBasicMaterial({ color: 0x3e3a38 });
  for (let x = -60; x <= 130; x += 3) cyl(root, 0.06, 0.07, 1.25, postM, x, 0.62, 11, 6);
  for (const y of [0.45, 0.8, 1.15]) noInk(rod(root, [-60, y, 11], [130, y, 11], 0.012, wireM, 4));
  // camp
  tent(root, -45, 20.5); tent(root, -34.5, 19.5, 0.6);
  for (let i = 0; i < 5; i++) crate(root, -47.5 + (i % 3) * 0.85, Math.floor(i / 3) * 0.45, 30.5, 1, (i * 0.13) % 0.3);
  const fireRing = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; fireRing.push(box(root, 0.22, 0.16, 0.2, toonMat('#8f8a82'), -38.5 + Math.cos(a) * 0.5, 0.08, 31 + Math.sin(a) * 0.5, 0.04)); }
  // dam: water + earth bank (lathe), reeds, a trough
  const water = new THREE.Mesh(new THREE.CircleGeometry(8.4, 48), toonMat(ctex('dh14water', 256, 256, (g, rr, W, H) => { g.fillStyle = '#7fa9b9'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(230,245,250,0.6)'; g.lineWidth = 4; for (let i = 0; i < 14; i++) { const y = rr() * H, x = rr() * W; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 6, x + 40, y); g.stroke(); } })));
  water.rotation.x = -PI / 2; water.position.set(68, 0.35, -78); root.add(water);
  const prof = [[7.9, 0.2], [8.6, 0.7], [10, 1.25], [11.2, 1.2], [13.8, 0.02]].map(([x, y]) => new THREE.Vector2(x, y));
  const bank = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), toonMat('#b9784e')); bank.position.set(68, 0, -78); bank.castShadow = bank.receiveShadow = true; root.add(bank);
  const reedM = toonMat('#8c9a5a');
  for (let i = 0; i < 26; i++) { const a = r() * TAU, R = 8.1 + r() * 0.4; const rd = cyl(root, 0.03, 0.05, 0.9 + r() * 0.6, reedM, 68 + Math.cos(a) * R, 0.6, -78 + Math.sin(a) * R, 5); rd.rotation.z = (r() - 0.5) * 0.4; }
  const berm = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, TAU, 0, PI / 2), toonMat('#c08a5c')); berm.scale.set(1.6, 0.5, 1.0); berm.position.set(76.6, 0, -61.6); berm.castShadow = berm.receiveShadow = true; root.add(berm);
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), toonMat('#a57a5a')); rock.scale.set(1.8, 1.9, 1.5); rock.position.set(76.8, 0.3, -95); rock.castShadow = rock.receiveShadow = true; root.add(rock);
  // paddock scrub + plain spinifex + termite mounds
  const scrubM = [toonMat('#8f9a6a'), toonMat('#a3a073')];
  for (let i = 0; i < 46; i++) { const b = new THREE.Mesh(SPH_LOW, scrubM[i % 2]); b.scale.set(0.6 + r() * 0.7, 0.35 + r() * 0.3, 0.6 + r() * 0.7); b.position.set(48 + r() * 56, 0.1, -40 + r() * 46); b.castShadow = true; root.add(b);
    if (Math.abs(b.position.x - 95.5) < 3.5 && b.position.z > -34 && b.position.z < -15) b.visible = false; }   // v2: clear the lookout push-in
  for (let i = 0; i < 110; i++) { const b = new THREE.Mesh(SPH_LOW, scrubM[i % 2]); b.scale.set(0.5 + r() * 0.6, 0.3 + r() * 0.25, 0.5 + r() * 0.6);
    const x = -40 + r() * 80, z = 90 + r() * 60; if (Math.abs(x) < 8 && z > 106 && z < 140) continue; b.position.set(x, 0.08, z); b.castShadow = true; root.add(b); }
  const moundM = toonMat('#c46f43');
  for (const [x, z, h] of [[-12, 108, 1.8], [14, 112, 1.3], [-22, 124, 2.2], [24, 130, 1.6], [-7, 96, 1.2]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.6, h, 8), moundM); m.position.set(x, h / 2, z); m.castShadow = true; root.add(m); }
  // the long emu fence along x = 160 (posts + wires + netting)
  for (let z = -140; z <= 40; z += 2.5) cyl(root, 0.06, 0.08, 1.9, postM, 160, 0.95, z, 6);
  for (const y of [0.3, 0.9, 1.5, 1.85]) noInk(rod(root, [160, y, -140], [160, y, 40], 0.011, wireM, 4));
  const net = new THREE.Mesh(new THREE.PlaneGeometry(180, 1.7), new THREE.MeshLambertMaterial({ map: nettingTex(), alphaTest: 0.4, side: THREE.DoubleSide, transparent: false }));
  net.material.map.repeat.set(180 / 1.7, 1); net.rotation.y = PI / 2; net.position.set(160, 0.9, -50); net.layers.set(NOINK); root.add(net);
  const notice = plane(root, 0.42, 0.53, toonMat(bountyTex(), { side: THREE.DoubleSide }), 159.9, 1.3, 5.0); notice.rotation.y = -PI / 2; notice.material.map.wrapS = notice.material.map.wrapT = THREE.ClampToEdgeWrapping;
  // props + cast
  const truck = makeTruck(); root.add(truck.g);
  const lewis = makeLewis(), lewis2 = makeLewis({ bipod: false }); root.add(lewis.g, lewis2.g);
  const pile = []; for (let k = 0; k < 34; k++) { const row = k < 12 ? 0 : k < 21 ? 1 : k < 28 ? 2 : k < 32 ? 3 : 4, i = [0, 12, 21, 28, 32][row], n = [12, 9, 7, 4, 2][row];
    const c = crate(root, -42.6 + ((k - i) % 4) * 0.82 + row * 0.2, row * 0.45, 25.2 + Math.floor((k - i) / 4) * 0.52 + row * 0.1, 1, ((k * 7) % 5) * 0.06 - 0.12); c.userData.y = c.position.y; c.userData.x = c.position.x; c.userData.z = c.position.z; pile.push(c); void n; }
  const flock = makeEmuFlock(1400, { H: 1.8, res: 0.3 }); root.add(flock.root);
  const puffs = makePuffs(root, 120);
  const e1 = makeEmu({ H: 1.8, res: 0.85, maxCache: 8 }), e2 = makeEmu({ H: 1.8, res: 0.85, maxCache: 8 }); root.add(e1.root, e2.root);
  const toon = (o, res) => { const tt = makeToon(o, { res, shadow: true, maxCache: 6 }); root.add(tt.root); const b = makeBlob(0.36, 0.22, 0.5); root.add(b); tt.blob = b; return tt; };
  const s1 = toon(CAST.soldier, 1.5), s2 = toon(CAST.soldier, 1.5), mer = toon(CAST.meredith, 1.6), farmer = toon(CAST.farmer, 1.6);
  const eBlob = [makeBlob(0.5, 0.3, 0.5), makeBlob(0.5, 0.3, 0.5)]; root.add(...eBlob);
  const arm = makeStickArm(root, { hand: 24, width: 14 }), arm2 = makeStickArm(root, { hand: 24, width: 14 });
  const wrench = box(root, 0.06, 0.32, 0.03, toonMat('#9aa0a4'), 0, 0, 0); const hammer = new THREE.Group(); root.add(hammer);
  box(hammer, 0.05, 0.4, 0.05, toonMat('#7a4e2c'), 0, 0.2, 0); box(hammer, 0.18, 0.08, 0.08, toonMat('#4a4c4e'), 0, 0.42, 0);
  // v2: the newsreel cameraman (peaked cap, no badge) + a hand-cranked camera on a tripod (lens along +x)
  const camman = toon(CAST.camman, 1.6);
  const reel = new THREE.Group(); root.add(reel);
  { const wd = toonMat(wood('#6b4a2e', { boards: 2 })), blk = toonMetal('#2c2a28', { rough: 0.5 }), brass = toonMetal('#c9a45a', { rough: 0.3 });
    box(reel, 0.42, 0.34, 0.24, wd, 0, 1.42, 0, 0.02);
    const lens = cyl(reel, 0.07, 0.085, 0.2, blk, 0.3, 1.42, 0, 16); lens.rotation.z = PI / 2;
    const ring = cyl(reel, 0.095, 0.095, 0.03, brass, 0.4, 1.42, 0, 16); ring.rotation.z = PI / 2;
    reel.userData.spools = [-0.1, 0.12].map((x) => { const sp = new THREE.Group(); sp.position.set(x, 1.72, 0); reel.add(sp);
      const d = cyl(sp, 0.15, 0.15, 0.05, blk, 0, 0, 0, 24); d.rotation.x = PI / 2; for (let k = 0; k < 3; k++) { const h = box(sp, 0.035, 0.2, 0.055, brass, 0, 0, 0); h.rotation.z = (k * PI) / 3; } return sp; });
    const crank = new THREE.Group(); crank.position.set(-0.05, 1.42, 0.13); reel.add(crank); box(crank, 0.03, 0.16, 0.03, brass, 0, 0.07, 0); box(crank, 0.03, 0.03, 0.1, wd, 0, 0.15, 0.04);
    reel.userData.crank = crank;
    for (const a of [0, 2.1, 4.2]) rod(reel, [0, 1.24, 0], [Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42], 0.022, wd, 6); }
  // a termite mound for the lookout emu (paddock, out of the other shots' frames)
  const mound = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 1.25], [0.32, 1.12], [0.62, 0.7], [0.95, 0.25], [1.15, 0]].map(([x, y]) => new THREE.Vector2(x, y)), 14), toonMat('#b5764a'));
  mound.position.set(95.5, 0, -36.5); mound.castShadow = mound.receiveShadow = true; root.add(mound);
  const sun = sunLight(root);
  const actors = [truck.g, lewis.g, lewis2.g, e1.root, e2.root, s1.root, s2.root, mer.root, farmer.root, s1.blob, s2.blob, mer.blob, farmer.blob, ...eBlob,
    arm.arm, arm.ball, arm2.arm, arm2.ball, wrench, hammer, ...pile, camman.root, camman.blob, reel];
  const K_ = { berm, rock, root, flock, puffs, wheat, faceWheat, truck, lewis, lewis2, pile, e1, e2, s1, s2, mer, farmer, eBlob, arm, arm2, wrench, hammer, mill, mill2, sun, actors, camman, reel, mound };
  return K_;
}
const SPH_LOW = new THREE.IcosahedronGeometry(1, 1);

// ---------------------------------------------------------------- shot helpers
const V = new THREE.Vector3();
const lid = (t, s) => lidAt(t, s);
let SUN = null;   // the outback's sun: toons take their lit / shaded side from it (face() before set())
function put(tt, x, y, z, st, camera, blob = true) {
  tt.root.visible = true; tt.root.position.set(x, y, z); tt.root.updateMatrixWorld(true); tt.face(camera, SUN); tt.set(st);
  if (tt.blob) { tt.blob.visible = blob; tt.blob.position.set(x, y + 0.004, z); }
}
function putEmu(W, i, x, y, z, st, camera, s = 1) {
  const e = i ? W.e2 : W.e1; e.root.visible = true; e.root.position.set(x, y, z); e.root.scale.setScalar(s); e.set(st); e.face(camera);
  W.eBlob[i].visible = true; W.eBlob[i].position.set(x, y + 0.004, z); W.eBlob[i].scale.setScalar(s);
}
/** front / back / side drawing for an emu heading hd (yaw, 0 = +z) as seen from the camera */
function viewFor(hd, x, z, cam) {
  const dx = cam.x - x, dz = cam.z - z, d = Math.hypot(dx, dz) || 1, c = (Math.sin(hd) * dx + Math.cos(hd) * dz) / d;
  return c > 0.75 ? 'front' : c < -0.75 ? 'back' : 'side';
}
const camPos = (camera) => camera.getWorldPosition(new THREE.Vector3());
// toon look v2: a low warm sun, deep lavender shade, faces dimmer than the lit ground
// v3 premium: warm sun against cooler blue-violet shade (warm vs cool, not one brown cast) + a soft fresnel rim
const TONE_DAY = { lit: [1.5, 1.28, 1.0], shade: [0.42, 0.47, 0.74], sat: 0.9, term: 0.22, lambert: 0.35, rim: [0.18, 0.18, 0.22], charTint: [1.0, 0.96, 0.9], charShade: 0.64, charGain: 0.95, headGrad: 0.34, bodyGrad: 0.45 };
const RIM_BACK = [0.55, 0.42, 0.3];   // backlit shots: props glow at the edges

// ---------------------------------------------------------------- shots
export function worldShots(W) {
  SUN = W.sun.s;
  const R = (seed) => rng(seed);
  // ---- title: the wheat field at morning, one emu pops up
  const cTitle = { p: [-3.0, 1.45, 4.0], a: [-13, 2.5, -30], fov: 46 };
  const eTitle = ground(cTitle, 0.72, 0.83);
  // ---- hook: the truck rolls in, a single emu watches
  const cHook = { p: [24, 1.15, 18.2], a: [4, 1.8, 13.6], fov: 44 };
  const eHook = ground(cHook, 0.7, 0.78);
  // ---- farm: the farmer among 300 feasting emus
  const cFarm = (t) => ({ p: [lerp(-4.6, -3.6, smooth((t - 6.5) / 4)), 2.3, -6.6], a: [-13.5, 1.4, -24], fov: 46 });
  const fFarm = ground(cFarm(8.4), 0.4, 0.8);
  const farmEmus = []; { const r = R(7), cp = cFarm(8.4).p, dF = Math.hypot(fFarm.x - cp[0], fFarm.z - cp[2]);
    while (farmEmus.length < 300) { const c = cFarm(8.4), d = 5.5 + r() ** 0.8 * 38, b = (r() - 0.5) * 0.85;
      if (d < dF + 1.5 && Math.abs(0.5 + b * 0.62 - 0.4) < 0.17) continue;
      const P = atScreen(c, 0.5 + b * 0.62, 0.5, d); const x = P.x, z = P.z;
      if (Math.hypot(x - fFarm.x, z - fFarm.z) < 1.6 || z < -42 || (x > -25 && x < -5 && z < -26)) continue;
      farmEmus.push({ x, z, ph: r() * TAU, rate: 0.7 + r() * 0.8, walk: r() < 0.18, hd: r() * TAU, s: 0.92 + r() * 0.16 }); } }
  // ---- split: paddock, gun crew left, flock right
  const cSplit = { p: [62.5, 2.5, 6], a: [78, 0.9, -18], fov: 46 };
  const gunSplit = ground(cSplit, 0.34, 0.78), crewG = ground(cSplit, 0.17, 0.86), merG = ground(cSplit, 0.44, 0.9);
  const FS = ground(cSplit, 0.66, 0.6), farmG = ground(cSplit, 0.9, 0.62); const splitEmus = []; { const r = R(11);
    for (let i = 0; i < 64; i++) { const a = r() * TAU, rr = Math.sqrt(r()) * 3.6; splitEmus.push({ x: FS.x + Math.cos(a) * rr, z: FS.z + Math.sin(a) * rr * 0.8, g: i % 8, ph: r() * TAU, sp: 8 + r() * 3, hd: r() * TAU, jit: (r() - 0.5) * 0.5 }); } }
  // ---- dam: the column marches up to the gun
  const cDam = (t) => ({ p: [78.0, lerp(1.75, 1.95, smooth((t - 18.7) / 3.3)), lerp(-56.2, -58.6, smooth((t - 18.7) / 3.4))], a: [76.6, 1.55, -80], fov: 46 });
  const G = ground(cDam(18.7), 0.4, 0.84); G.y = 0.5; W.berm.position.set(G.x, 0, G.z);
  const GN = ground(cDam(18.7), 0.8, 0.74);
  // ---- jam close-up
  const cJam = { p: [G.x + 0.1, 1.0, G.z + 2.35], a: [G.x + 0.12, 1.08, G.z - 0.6], fov: 40 };
  // ---- bolt: camp, truck side-on
  const cBolt = { p: [-39.2, 2.0, 33.4], a: [-40.3, 1.45, 26], fov: 46 };
  // ---- chase / retreat / tanks / second / fence
  const XT = (t) => 22 + 13.5 * (t - 25.6);
  const cChase = (t) => ({ p: [XT(t) + 17.5, 1.45, 18.4], a: [XT(t) + 2.5, 1.6, 14.2], fov: 44 });
  const cBumpy = (t) => ({ p: [XT(t) - 1.4, 2.3, 20.6], a: [XT(t) - 1.1, 2.15, 14.0], fov: 46 });
  const cRetreat = (t) => ({ p: [9.5, 1.35, 16.0 - 0.2 * smooth((t - 28.9) / 1.7)], a: [-20, 1.7, 13.4], fov: 42 });
  const cTanks = (t) => ({ p: [0.7, 1.0, lerp(141.5, 140.2, smooth((t - 32.5) / 4.2))], a: [0, 2.0, 118], fov: 48 });
  const mTanks = ground(cTanks(33), 0.72, 0.84);
  const cSecond = (t) => ({ p: [lerp(-45.3, -44.6, smooth((t - 43.8) / 4.3)), 1.8, 34.2], a: [-40.6, 1.25, 22], fov: 46 });
  const cS = cSecond(46), pileC = ground(cS, 0.55, 0.7), pOff = [pileC.x + 41.0, pileC.z - 26.0];
  const s1S = ground(cS, 0.2, 0.9), merS = ground(cS, 0.86, 0.93), eS0 = ground(cS, 1.2, 0.76), eS1 = ground(cS, 0.62, 0.745);
  const campEmus = []; { const r = R(41); for (let i = 0; i < 26; i++) { const P = ground(cS, 0.05 + r() * 0.9, 0.56 + r() * 0.1); campEmus.push({ x: P.x, z: P.z, ph: r() * TAU, rate: 0.6 + r() * 0.7, hd: r() * TAU }); } }
  const secEmus = []; { const r = R(23); for (let i = 0; i < 140; i++) secEmus.push({ x: -62 + r() * 46, z: -6 - r() * 26, ph: r() * TAU, rate: 0.6 + r() * 0.7, hd: r() * TAU }); }
  const cFence = (t) => { const u = smooth((t - 48.1) / 3.3); return { p: [lerp(154.3, 155.7, u), 1.65, lerp(10.0, 7.7, u)], a: [163.4, 1.25, -4.2], fov: 46 }; };
  const fenceEmus = []; { const r = R(31); for (let i = 0; i < 34; i++) fenceEmus.push({ x: 161.5 + r() * 14, z: -30 + r() * 34, ph: r() * TAU, rate: 0.7 + r() * 0.7, hd: r() * TAU }); }

  const tSplit = wt('l04_split', 5), tJam = wt('l06_jam', 3), tBolt = wt('l07_truck', 2), tTanks = wt('l11_tanks', 12), tBird = wt('l01_hook', 8);

  const shots = {
    title: {
      sky: 'morning', tone: { ...TONE_DAY, lit: [1.55, 1.25, 0.94] }, fog: [24, 320], cInf: 7, az: -115, el: 18,
      sun: [-12, -20, 30, [0.7, 0.75, 0.9]],
      cam: (t) => ({ p: [cTitle.p[0], cTitle.p[1], lerp(4.2, 3.4, smooth(t / 3.3))], a: cTitle.a, fov: 46 }),
      focus: () => [eTitle.x, 1.4, eTitle.z],
      update(t, camera) {
        const pop = boing((t - 1.35) / 0.9);
        putEmu(W, 0, eTitle.x, -1.25 * (1 - pop), eTitle.z, { view: 'side', pose: t > 2.45 ? 'stare' : 'stand', eye: 'ring', look: K(t, [[1.6, 0.6], [2.0, -0.6], [2.3, 0.6]]), blink: lid(t, 2) }, camera);
        W.eBlob[0].visible = false;
        const F = W.flock, c = camPos(camera); F.begin(camera);
        for (let i = 0; i < 6; i++) { const x = -22 + i * 3.2, z = -22 - (i % 3) * 2; F.add(x, 0, z, { view: 'side', pose: 'peck', k: 0.5 + 0.5 * Math.sin(t * 2 + i), hd: i % 2 ? 1.5 : -1.5 }); }
        F.end(); void c;
      },
    },
    hook: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 8, az: 120, el: 21,
      sun: [12, 15, 20, [0.4, 1, 0.75]],
      cam: (t) => ({ p: [lerp(24, 23.2, smooth((t - 3.1) / 3.5)), 1.15, 18.2], a: cHook.a, fov: 44 }),
      focus: (t) => { const k = smooth((t - (tBird - 0.9)) / 0.6), x = lerp(-10, 8, smooth((t - 3.1) / 3.4)); return [lerp(x, eHook.x, k), lerp(1.5, 1.4, k), lerp(14, eHook.z, k)]; },
      update(t, camera) {
        const T = W.truck, u = clamp((t - 3.1) / 3.3), x = lerp(-34, 7.5, 1 - (1 - u) ** 2.2);
        T.g.visible = true; T.g.position.set(x, 0, 14.2); T.g.rotation.y = 0;
        T.body.position.y = 0.04 * Math.abs(Math.sin(t * 9)) * (1 - u ** 4); T.body.rotation.x = 0.015 * Math.sin(t * 7);
        T.wheels.forEach((w) => { w.rotation.z = -(x + 34) / 0.45; }); T.mount.visible = false;
        T.g.updateMatrixWorld(true);
        const bedP = (lx, lz) => T.body.localToWorld(V.set(lx, 1.04, lz)).clone();
        const a = bedP(-1.7, -0.45), b = bedP(-1.2, 0.5), m = bedP(-0.15, 0.1);
        put(W.s1, a.x, a.y, a.z, { expr: 'stern', blink: lid(t, 4), arms: ARMS.down, ...XTRA.soldier }, camera, false);
        put(W.s2, b.x, b.y, b.z, { expr: 'smug', blink: lid(t, 6), arms: ARMS.down, ...XTRA.soldier2 }, camera, false);
        put(W.mer, m.x, m.y, m.z, { expr: 'stern', blink: lid(t, 8), arms: t > 5.3 ? { L: ARMS.down.L, R: [575, 300], bend: -10 } : ARMS.down, ...XTRA.meredith }, camera, false);
        putEmu(W, 0, eHook.x, 0, eHook.z, { view: 'side', pose: t > tBird - 0.05 ? 'stare' : 'stand', eye: 'ring', look: -0.6, blink: lid(t, 3), flip: true }, camera, 1.0);
        W.puffs.begin(); for (let k = 0; k < 8; k++) { const te = 3.2 + k * 0.32; if (te < t) W.puffs.burst(t, te, [lerp(-34, 7.5, 1 - (1 - clamp((te - 3.1) / 3.3)) ** 2.2) - 2.2, 0, 14.2], { n: 2, size: 0.9, spread: 0.6, rise: 0.4, dur: 1.2, seed: k }); } W.puffs.end();
        cameraman(t, camera);
        W.flock.begin(camera); W.flock.end();
      },
    },
    farm: {
      sky: 'day', tone: TONE_DAY, fog: [22, 320], cInf: 9, az: -112, el: 23,
      sun: [-12, -20, 26, [0.65, 1, 0.8]],
      cam: cFarm, focus: () => [fFarm.x, 1.3, fFarm.z],
      update(t, camera) {
        put(W.farmer, fFarm.x, 0, fFarm.z, { expr: 'worried', blink: lid(t, 9), look: Math.sin(t * 1.7) * 0.8, arms: { L: [196, 92], R: [404, 92], bend: -50 }, armsFront: true, ...XTRA.farmer }, camera);
        const F = W.flock, c = camPos(camera); F.begin(camera);
        for (const e of farmEmus) {
          const k = 0.5 + 0.5 * Math.sin(t * e.rate * 3 + e.ph);
          if (e.walk) { const d = (t - 6.5) * 0.9; const x = e.x + Math.sin(e.hd) * d, z = e.z + Math.cos(e.hd) * d; F.add(x, 0, z, { view: viewFor(e.hd, x, z, c), pose: 'walk', ph: e.ph + d * 3.4, hd: e.hd, s: e.s }); }
          else F.add(e.x, 0, e.z, { view: 'side', pose: 'peck', k: k * k, hd: e.hd, s: e.s });
        }
        F.end();
      },
    },
    split: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 8, az: 115, el: 22,
      sun: [72, -8, 24, [0.3, 1, 0.9]],
      cam: (t) => ({ p: [cSplit.p[0], cSplit.p[1], lerp(6.3, 5.6, smooth((t - 14.6) / 4))], a: cSplit.a, fov: 46 }),
      focus: () => [gunSplit.x, 1, gunSplit.z],
      update(t, camera) {
        const L = W.lewis; L.g.visible = true; L.g.position.set(gunSplit.x, 0, gunSplit.z); L.g.rotation.y = Math.atan2(FS.x - gunSplit.x, FS.z - gunSplit.z) - PI / 2;
        L.gun.rotation.z = 0.02 + (t > tSplit + 0.2 ? 0.05 * Math.sin(t * 6) : 0);
        const hit = t > tSplit - 0.1;
        put(W.s1, crewG.x, 0, crewG.z, { expr: hit ? 'o' : 'stern', blink: lid(t, 4), arms: ARMS.clasp, face: hit ? { sweat: true } : {}, ...XTRA.soldier }, camera);
        put(W.mer, merG.x, 0, merG.z, { expr: hit ? 'worried' : 'smug', blink: lid(t, 8), arms: hit ? ARMS.hips : { L: ARMS.down.L, R: [575, 300], bend: -10 }, ...XTRA.meredith }, camera);
        // v2: "farmers herd the flock toward the guns" — a farmer behind the flock, arms up, shooing (then gaping)
        const hz = hit ? 0 : 0.5 * Math.sin(t * 9);
        put(W.farmer, farmG.x + (hit ? 0 : 0.6 * smooth((t - (tSplit - 3)) / 3)) * -1, 0, farmG.z, { expr: hit ? 'o' : 'grin', blink: lid(t, 9), arms: hit ? { L: [196, 300], R: [404, 300], bend: -40 } : { L: [176 + hz * 30, 92], R: [424 - hz * 30, 92], bend: -50 }, armsFront: true, ...XTRA.farmer }, camera);
        const F = W.flock, c = camPos(camera); F.begin(camera);
        for (const e of splitEmus) {
          if (t < tSplit) { F.add(e.x, 0, e.z, { view: 'side', pose: 'peck', k: 0.5 + 0.5 * Math.sin(t * 2.2 + e.ph), hd: e.hd }); continue; }
          const hd = (e.g / 8) * TAU + 0.3 + e.jit, u = t - tSplit - 0.12, d = u > 0 ? e.sp * u + 0.6 : 0.6 * (u + 0.12) / 0.12;
          const x = e.x + Math.sin(hd) * d, z = e.z + Math.cos(hd) * d * 0.9;
          F.add(x, 0, z, { view: viewFor(hd, x, z, c), pose: 'run', ph: e.ph + d * 2.8, hd });
        }
        F.end();
        W.puffs.begin(); W.puffs.burst(t, tSplit - 0.05, [FS.x, 0, FS.z], { n: 16, size: 2.4, spread: 4.5, rise: 1.2, dur: 1.3, seed: 5 }); W.puffs.end();
      },
    },
    dam: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 8, az: -122, el: 20,
      sun: [74, -72, 26, [0.5, 1, 0.75]],
      cam: cDam, focus: (t) => [77, 1.2, lerp(-76, -70, smooth((t - 18.7) / 3.3))], slab: 9,
      update(t, camera) {
        const L = W.lewis; L.g.visible = true; L.g.position.copy(G); L.g.rotation.y = PI / 2 - 0.08; L.gun.rotation.z = 0.04;
        put(W.s1, GN.x, 0, GN.z, { expr: t > 20.4 ? 'worried' : 'stern', blink: lid(t, 4), look: -0.6, arms: ARMS.clasp, face: t > 20.4 ? { sweat: true } : {}, ...XTRA.soldier }, camera);
        putEmu(W, 1, 76.8, 2.25, -95, { view: 'side', pose: t > 21.0 ? 'stare' : 'stand', eye: 'lid', brow: 'smug', look: 0.6, blink: lid(t, 13), flip: true }, camera, 1.15);
        W.eBlob[1].visible = false;
        const F = W.flock; F.begin(camera);
        const adv = 11 * smooth((t - 18.4) / 3.8);
        for (let row = 0; row < 16; row++) for (let col = 0; col < 13; col++) {
          const x = 77.6 + (col - 6) * 1.3 + (row % 2) * 0.6, z = -80 - row * 1.4 + adv, d = adv;
          F.add(x, 0, z, { view: 'front', pose: 'walk', ph: (row % 2) * PI + d * 2.6, hd: 0 });
        }
        F.end();
      },
    },
    jam: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 16, az: -118, el: 22,
      sun: [76, -62, 16, [0.5, 1, 0.75]],
      cam: (t) => { const j = t > tJam ? 0.03 * Math.exp(-(t - tJam) * 8) * Math.sin((t - tJam) * 60) : 0; return { p: [cJam.p[0], cJam.p[1] + j, cJam.p[2]], a: cJam.a, fov: 38 }; },
      focus: () => [G.x + 0.3, 1.0, G.z - 0.1],
      update(t, camera) {
        const L = W.lewis; L.g.visible = true; L.g.position.copy(G); L.g.rotation.y = PI / 2 - 0.08;
        const k = t > tJam ? Math.exp(-(t - tJam) * 5) : 0; L.gun.rotation.z = 0.04 + 0.12 * k * Math.sin((t - tJam) * 40); L.gun.position.x = -0.06 * k;
        const jam = t > tJam - 0.05;
        put(W.mer, G.x + 0.5, 0, G.z - 0.3, { expr: jam ? 'o' : 'stern', blink: jam ? 0 : lid(t, 4), look: jam ? -0.8 : -0.3, arms: { L: ARMS.clasp.L, R: null, bend: -30 }, face: jam ? { sweat: true } : {}, ol: 0.85, ...XTRA.meredith }, camera);
        W.mer.root.updateMatrixWorld(true); L.g.updateMatrixWorld(true);
        W.arm.set(cardPoint(W.mer, 364, 405), L.gun.localToWorld(L.grip.clone()));
        W.arm.arm.visible = W.arm.ball.visible = true;
        W.puffs.begin();
        W.puffs.burst(t, tJam, L.gun.localToWorld(new THREE.Vector3(0.1, 0.12, 0)), { n: 6, size: 0.3, spread: 0.25, rise: 0.18, dur: 1.2, seed: 9, col: '#6b6460' });
        W.puffs.end();
        const F = W.flock, c = camPos(camera); F.begin(camera);
        const near = 7.5 * smooth((t - (tJam - 3.0)) / 2.9);   // v2: the column bunches up behind the gun and walks right up to it
        for (let i = 0; i < 70; i++) { const r0 = (i * 0.618) % 1, row = Math.floor(i / 10), x = G.x - 3.4 + (i % 10) * 0.75 + (row % 2) * 0.37, z = G.z - 12 - row * 1.3 + near;
          if (t < tJam + 0.2) F.add(x, 0, z, { view: 'front', pose: 'walk', ph: t * 4 + (i % 2) * PI, hd: 0 });
          else { const hd = (r0 < 0.5 ? 1 : -1) * (1.2 + r0), d = (t - tJam - 0.2) * 9; const X = x + Math.sin(hd) * d, Z = z + Math.cos(hd) * d; F.add(X, 0, Z, { view: viewFor(hd, X, Z, c), pose: 'run', ph: d * 2.8 + i, hd }); } }
        F.end();
      },
    },
    bolt: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 9, az: 115, el: 24,
      sun: [-40, 26, 16, [0.45, 1, 0.9]],
      cam: (t) => { const j = t > tBolt + 0.28 ? 0.035 * Math.exp(-(t - tBolt - 0.28) * 7) * Math.sin((t - tBolt) * 55) : 0; return { p: [cBolt.p[0], cBolt.p[1] + j, cBolt.p[2]], a: cBolt.a, fov: 46 }; },
      focus: () => [-40.5, 1.4, 26],
      update(t, camera) {
        const T = W.truck; T.g.visible = true; T.g.position.set(-40.6, 0, 26); T.g.rotation.y = 0; T.body.position.y = 0; T.body.rotation.set(0, 0, 0); T.mount.visible = true;
        T.wheels.forEach((w) => { w.rotation.z = 0; });
        const L = W.lewis2; L.g.visible = true; T.g.updateMatrixWorld(true);
        const mountTop = T.body.localToWorld(new THREE.Vector3(-0.7, 1.82, 0));
        const drop = clamp((t - tBolt) / 0.3); L.g.position.set(mountTop.x, mountTop.y + 2.6 * (1 - drop * drop), mountTop.z);
        L.g.rotation.set(0, 0, 0.1 * (1 - drop)); L.gun.rotation.z = t > tBolt + 0.3 ? 0.04 * Math.exp(-(t - tBolt - 0.3) * 6) * Math.sin(t * 40) : 0;
        const hitW = (t - (tBolt + 0.5)) % 0.42, swing = t > tBolt + 0.5 && t < tBolt + 1.8 ? Math.max(0, 1 - hitW / 0.18) : 0;
        put(W.mer, -40.0, 0, 27.6, { expr: t > 25.2 ? 'grin' : 'stern', blink: lid(t, 8), arms: { L: ARMS.down.L, R: null, bend: 10 }, ...XTRA.meredith }, camera);
        W.mer.root.updateMatrixWorld(true);
        const hand = new THREE.Vector3(-40.45, 1.6 + 0.25 * swing, 26.95);
        W.arm.set(cardPoint(W.mer, 364, 405), hand); W.arm.arm.visible = W.arm.ball.visible = true;
        W.wrench.visible = true; W.wrench.position.copy(hand).add(V.set(-0.05, 0.12, -0.05)); W.wrench.rotation.z = 0.6 - swing * 0.8;
        const b = T.body.localToWorld(new THREE.Vector3(-1.8, 1.04, 0.3));
        put(W.s2, b.x, b.y, b.z, { expr: t > 25.1 ? 'grin' : 'smug', blink: lid(t, 6), arms: t > 25.1 ? { L: [150, 150], R: [450, 150], bend: -40 } : ARMS.hips, ...XTRA.soldier2 }, camera, false);
        W.puffs.begin();
        W.puffs.burst(t, tBolt + 0.3, [mountTop.x, mountTop.y, mountTop.z], { n: 8, size: 0.55, spread: 0.9, rise: 0.3, dur: 0.9, seed: 3 });
        for (let k = 0; k < 3; k++) W.puffs.burst(t, tBolt + 0.5 + k * 0.42, [mountTop.x - 0.15, mountTop.y - 0.2, mountTop.z + 0.3], { n: 3, size: 0.2, spread: 0.3, rise: 0.25, dur: 0.4, seed: 20 + k, col: '#ffd76a' });
        W.puffs.end();
        W.flock.begin(camera); W.flock.end();
      },
    },
    chase: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 9, az: -105, el: 21,
      sun: [44, 15, 34, [0.3, 1, 0.8]],
      cam: (t) => { const c = cChase(t); c.p[1] += 0.04 * Math.sin(t * 13); return c; },
      focus: (t) => [XT(t) + 9, 1.4, 14], slab: 6,
      update(t, camera) {
        const T = W.truck, x = XT(t); T.g.visible = true; T.g.position.set(x, 0, 14.0); T.g.rotation.y = 0; T.mount.visible = true;
        const bump = Math.abs(Math.sin(t * 10.5)) * 0.16 + 0.05 * Math.sin(t * 23);
        T.body.position.y = bump; T.body.rotation.z = 0.06 * Math.sin(t * 8.3); T.body.rotation.x = 0.05 * Math.sin(t * 6.1);
        T.wheels.forEach((w) => { w.rotation.z = -(x - 22) / 0.45; });
        T.g.updateMatrixWorld(true);
        const L = W.lewis2; L.g.visible = true; const mt = T.body.localToWorld(new THREE.Vector3(-0.7, 1.82, 0));
        L.g.position.copy(mt); L.g.rotation.set(T.body.rotation.x, 0, T.body.rotation.z + 0.35 * Math.sin(t * 7.7) + 0.2); L.gun.rotation.z = 0;
        const air = Math.abs(Math.sin(t * 6.4)) * (t > wt('l08_chase', 9) - 0.2 ? 0.95 : 0.5);
        const g1 = T.body.localToWorld(new THREE.Vector3(-0.75, 1.04, 0.5));
        put(W.s1, g1.x, g1.y + air, g1.z, { expr: 'o', blink: 0, look: Math.sin(t * 5), arms: { L: [130, 160], R: [470, 170], bend: -40 }, face: { sweat: true }, ...XTRA.soldier }, camera, false);
        const g2 = T.body.localToWorld(new THREE.Vector3(-2.0, 1.04, -0.4));
        if (t < 26.75) put(W.s2, g2.x, g2.y + air * 0.4, g2.z, { expr: 'worried', blink: lid(t, 6), arms: ARMS.clasp, ...XTRA.soldier2 }, camera, false);
        const F = W.flock, c = camPos(camera); F.begin(camera);
        const ZS = [-1.3, 1.2, -0.5, 1.7, -1.9, 0.5];
        for (let i = 0; i < 6; i++) { const ex = x + 7.5 + i * 0.9 + (t - 25.6) * (1.0 + i * 0.2), ez = 14 + ZS[i]; F.add(ex, 0, ez, { view: viewFor(PI / 2, ex, ez, c), pose: 'run', ph: ex * 2.6 + i, hd: PI / 2 }); }
        F.end();
        W.puffs.begin(); for (let k = 0; k < 14; k++) { const te = t - k * 0.13; const q = Math.floor(te / 0.13) * 0.13; if (q < 25.6) continue; W.puffs.burst(t, q, [XT(q) - 2.6, 0, 14 + ((k % 2) ? 0.8 : -0.8)], { n: 1, size: 1.1, spread: 0.5, rise: 0.6, dur: 1.3, seed: Math.round(q * 100) }); } W.puffs.end();
      },
    },
    retreat: {
      sky: 'day', tone: { ...TONE_DAY, lit: [1.55, 1.22, 0.9], rim: RIM_BACK }, fog: [22, 320], cInf: 9, az: 135, el: 16,
      sun: [2, 14, 16, [0.35, 0.8, 0.95]],
      cam: cRetreat, focus: () => [3.5, 1.2, 14],
      update(t, camera) {
        const T = W.truck, u = clamp((t - 28.8) / 2.0), x = lerp(-6, -48, u * u * 0.6 + u * 0.4);
        T.g.visible = true; T.g.position.set(x, 0, 14.2); T.g.rotation.y = PI; T.mount.visible = true; T.body.position.y = 0.05 * Math.abs(Math.sin(t * 9)); T.body.rotation.set(0, 0, 0);
        T.wheels.forEach((w) => { w.rotation.z = -x / 0.45; });
        const L = W.lewis2; L.g.visible = true; T.g.updateMatrixWorld(true); L.g.position.copy(T.body.localToWorld(new THREE.Vector3(-0.7, 1.82, 0))); L.g.rotation.set(0, PI, 0.5);
        const F = W.flock; F.begin(camera);
        const ZR = [11.4, 12.3, 16.0, 16.9, 17.8, 10.5];
        for (let i = 0; i < 6; i++) { const ex = 1.6 - (i % 2) * 0.7, ez = ZR[i]; const hop = Math.max(0, Math.sin((t - 29.9 - i * 0.12) * 9)) * (t > 29.9 && t < 30.9 + i * 0.12 ? 0.35 : 0);
          F.add(ex, hop, ez, { view: 'back', pose: 'stand', hd: -PI / 2 }); }
        F.end();
        W.puffs.begin(); for (let k = 0; k < 6; k++) { const te = 28.9 + k * 0.3; if (te < t) W.puffs.burst(t, te, [lerp(-6, -48, ((te - 28.8) / 2) ** 2 * 0.6 + (te - 28.8) / 2 * 0.4) + 2.4, 0, 14.2], { n: 2, size: 1.3, spread: 0.8, rise: 0.6, dur: 1.6, seed: k + 40 }); } W.puffs.end();
      },
    },
    tanks: {
      sky: 'day', tone: { ...TONE_DAY, lit: [1.55, 1.22, 0.92], shade: [0.38, 0.42, 0.68], rim: RIM_BACK }, fog: [20, 300], cInf: 7, az: 32, el: 14,
      sun: [0, 122, 26, [0.55, 0.9, 0.85]],
      cam: (t) => { const c = cTanks(t), st = Math.abs(Math.sin((t - 32.5) * 2.6 * PI / 2)), big = t > tTanks ? 0.06 * Math.exp(-(t - tTanks) * 6) : 0; c.p[1] += 0.012 * st + big * Math.sin(t * 50); return c; },
      focus: () => [mTanks.x, 1.5, mTanks.z], slab: 14,
      update(t, camera) {
        const za = Math.min(125 + 2.6 * (t - 32.5), 125 + 2.6 * (tTanks - 32.5));
        put(W.mer, mTanks.x, 0, mTanks.z, { expr: t > 35.0 ? 'o' : 'worried', blink: lid(t, 8), look: 0.4, arms: ARMS.clasp, face: { sweat: true }, ol: 0.8, ...XTRA.meredith }, camera, false);
        const F = W.flock; F.begin(camera);
        const stomp = t > tTanks ? 1 : 0;
        for (let row = 0; row < 8; row++) for (let c = 0; c <= 2 * row; c++) {
          const x = (c - row) * 1.3, z = za - row * 1.55;
          F.add(x, 0, z, { view: 'front', pose: stomp ? 'stand' : 'walk', ph: (t - 32.5) * 2.6 * PI, hd: 0, brow: 'angry', eye: 'ring' });
        }
        F.end();
        W.puffs.begin();
        for (let k = 0; k < 10; k++) { const te = 32.6 + k * 0.4; if (te < t) W.puffs.burst(t, te, [((k * 5) % 9) - 4.5, 0, Math.min(125 + 2.6 * (te - 32.5), 125 + 2.6 * (tTanks - 32.5)) - 12], { n: 3, size: 2.0, spread: 2.5, rise: 1.0, dur: 1.8, seed: k + 60 }); }
        W.puffs.burst(t, tTanks, [0, 0, za - 2], { n: 14, size: 2.2, spread: 6, rise: 0.8, dur: 1.4, seed: 77 });
        W.puffs.end();
      },
    },
    second: {
      sky: 'dusk', tone: { lit: [1.6, 1.1, 0.76], shade: [0.3, 0.22, 0.46], sat: 0.74, term: 0.25, lambert: 0.4, rim: [1.0, 0.6, 0.38], charTint: [1.04, 0.92, 0.88], charShade: 0.62, charGain: 0.96, headGrad: 0.36, bodyGrad: 0.46 }, fog: [18, 240], cInf: 9, az: -7, el: 6.5,
      sun: [pileC.x, pileC.z - 3, 20, [-0.8, 0.32, 0.55]],
      cam: cSecond, focus: () => [pileC.x, 1.0, pileC.z], slab: 4,
      update(t, camera) {
        W.pile.forEach((c, k) => { const te = 43.95 + k * 0.105, u = clamp((t - te) / 0.35); c.visible = t > te; c.position.set(c.userData.x + pOff[0], c.userData.y + 0.225 + 5.5 * (1 - u * u), c.userData.z + pOff[1]); });
        put(W.s1, s1S.x, 0, s1S.z, { expr: 'worried', blink: lid(t, 4), look: 0.6, arms: ARMS.down, face: { sweat: true }, ...XTRA.soldier }, camera);
        put(W.mer, merS.x, 0, merS.z, { expr: t > 47.0 ? 'o' : 'stern', blink: lid(t, 8), look: t > 47.0 ? 0.9 : 0, arms: ARMS.hips, ...XTRA.meredith }, camera);
        const tE = wt('l15_second', 9), ew = clamp((t - (tE - 1.1)) / 1.1), ex = lerp(eS0.x, eS1.x, ew);
        putEmu(W, 0, ex, 0, lerp(eS0.z, eS1.z, ew), { view: 'side', pose: ew < 1 ? 'walk' : 'peck', ph: ex * 3, k: ew < 1 ? 0 : 0.5 + 0.5 * Math.sin((t - tE) * 7), flip: true, eye: 'lid', brow: 'smug' }, camera);
        const F = W.flock; F.begin(camera);
        for (const e of [...secEmus, ...campEmus]) F.add(e.x, 0, e.z, { view: 'side', pose: 'peck', k: 0.5 + 0.5 * Math.sin(t * e.rate * 3 + e.ph), hd: e.hd });
        F.end();
      },
    },
    fence: {
      sky: 'day', tone: TONE_DAY, fog: [22, 320], cInf: 8, az: -115, el: 23,
      sun: [158, 0, 18, [-0.45, 1, 0.7]],
      cam: cFence, focus: () => [159.4, 1.2, 3.2], slab: 3,
      update(t, camera) {
        const hit = Math.max(0, Math.sin((t - 48.2) * 9)), sw = hit ** 3;
        put(W.farmer, 159.15, 0, 3.4, { expr: 'smug', blink: lid(t, 9), arms: { L: ARMS.down.L, R: null, bend: 10 }, ...XTRA.farmer }, camera);
        W.farmer.root.updateMatrixWorld(true);
        const hand = new THREE.Vector3(159.75, 1.35 + 0.45 * sw, 2.75);
        W.arm.set(cardPoint(W.farmer, 364, 405), hand); W.arm.arm.visible = W.arm.ball.visible = true;
        W.hammer.visible = true; W.hammer.position.copy(hand); W.hammer.rotation.set(0, 0, -0.4 - 1.1 * (1 - sw));
        const F = W.flock, c = camPos(camera); F.begin(camera);
        fenceEmus.forEach((e, i) => {
          if (i < 3) {   // three walk up to the netting and bounce off it
            const t0 = 48.2 + i * 0.5, u = t - t0, z = -2 - i * 5.5, uh = (167 - 160.7) / 3.4;
            let x = 167 - 3.4 * u; if (x < 160.7) x = 160.7 + Math.max(0, Math.sin((u - uh) * 6)) * 0.5 * Math.exp(-(u - uh) * 2);
            F.add(x, 0, z, { view: viewFor(-PI / 2, x, z, c), pose: x > 160.8 ? 'walk' : 'stare', ph: x * 3, hd: -PI / 2, eye: x > 160.8 ? 'ring' : 'wide' });
          } else F.add(e.x, 0, e.z, { view: 'side', pose: 'peck', k: 0.5 + 0.5 * Math.sin(t * e.rate * 3 + e.ph), hd: e.hd });
        });
        F.end();
      },
    },
  };
  // ================================================================ v2 (viral re-cut) shots: VIDEO time, anchored on nt()
  // ---- open / gun / stakes = the first 5 s (playbook): frame 0 mid-action, a close-up on the gun at ~1.2 s, the flock wide at ~3 s
  // truck parked at the field edge facing -x (cab on screen-right); gun mount top; framed with tools/bearing.py solve()
  const TK = [-8, 11.0], MT = new THREE.Vector3(TK[0] + 0.7, 1.82, TK[1]);
  const cOpen = (t) => ({ p: [lerp(-5.6, -5.72, smooth(t / 1.3)), 1.6, lerp(5.4, 5.95, smooth(t / 1.3))], a: [-7.51, 1.69, 15.22], fov: 46 });
  const EO = new THREE.Vector3(-5.8, 0, 8.5);   // the emu that stares back: left foreground, head at ~(23 %, 45 %); Meredith ~(64 %, 31 %)
  const gunYaw = Math.atan2(-(EO.z - MT.z), EO.x - MT.x), bDir = new THREE.Vector3(EO.x - MT.x, 0, EO.z - MT.z).normalize();
  const cGun = (t) => { const k = smooth((t - 1.15) / 1.8), back = lerp(0.95, 0.72, k);
    return { p: [MT.x - bDir.x * back + bDir.z * 0.2, 2.2, MT.z - bDir.z * back - bDir.x * 0.2], a: [EO.x, 1.45, EO.z], fov: 38 }; };
  const cStake = (t) => { const u = easeOut(clamp((t - 2.85) / 2.4)); return { p: [lerp(-5.6, -4.4, u), lerp(3.0, 8.6, u), lerp(19.0, 24.5, u)], a: [lerp(-9.5, -11, u), lerp(0.8, 0, u), lerp(-6, -14, u)], fov: 46 }; };
  const fieldEmus = []; { const r = R(91); while (fieldEmus.length < 620) { const x = -42 + r() * 82, z = -40 + r() * 44;
    if ((x > -25 && x < -3 && z < -24) || Math.hypot(x - EO.x, z - EO.z) < 2.5 || (z > -2 && Math.abs(x - TK[0]) < 4)) continue;
    fieldEmus.push({ x, z, ph: r() * TAU, rate: 0.6 + r() * 0.8, hd: r() * TAU, up: r() < 0.3 }); } }
  const midEmus = fieldEmus.filter((e) => e.z > -14 && e.z < 4 && e.x < -10).slice(0, 10);
  /** the truck parked at the field edge, Meredith on the bed behind the mounted gun (aimed at the emu) */
  function parked(t, camera, { mer = true, sway = 1 } = {}) {
    const T = W.truck; T.g.visible = true; T.g.position.set(TK[0], 0, TK[1]); T.g.rotation.y = PI; T.mount.visible = true;
    T.body.position.y = 0; T.body.rotation.set(0, 0, 0); T.wheels.forEach((w) => { w.rotation.z = 0; }); T.g.updateMatrixWorld(true);
    const L = W.lewis2; L.g.visible = true; L.g.position.copy(MT); L.g.rotation.set(0, gunYaw + sway * 0.05 * Math.sin(t * 2.3), 0); L.gun.rotation.z = -0.05 + sway * 0.015 * Math.sin(t * 3.1);
    L.g.updateMatrixWorld(true);
    if (mer) { const m = T.body.localToWorld(V.set(-0.75, 1.04, -0.62)).clone();
      put(W.mer, m.x, m.y, m.z, { expr: t > nt('n01_hook', 14) ? 'worried' : 'stern', blink: lid(t, 8), look: -0.5, arms: { L: ARMS.clasp.L, R: null, bend: -30 }, face: t > nt('n01_hook', 14) ? { sweat: true } : {}, ...XTRA.meredith }, camera, false);
      W.mer.root.updateMatrixWorld(true); W.arm.set(cardPoint(W.mer, 364, 405), L.gun.localToWorld(L.grip.clone())); W.arm.arm.visible = W.arm.ball.visible = true; }
  }
  const staring = (t, camera, s = 1) => putEmu(W, 0, EO.x, 0, EO.z, { view: 'side', pose: 'stare', eye: 'ring', brow: t > 2.6 ? 'angry' : null, look: 0.7, blink: lid(t, 3), flip: false }, camera, s);
  // ---- newsreel: the cameraman cranks at the roadside as the army truck comes up the road
  const CM = [11.5, 17.8];
  function cameraman(t, camera, crank = 1) {
    const R_ = W.reel; R_.visible = true; R_.position.set(CM[0] - 0.55, 0, CM[1] - 0.1); R_.rotation.y = PI - 0.25;
    R_.userData.crank.rotation.z = -t * 11 * crank; R_.userData.spools.forEach((sp, i) => { sp.rotation.z = -t * (i ? 3.1 : 2.4) * crank; });
    put(W.camman, CM[0], 0, CM[1], { expr: 'grin', blink: lid(t, 17), look: -0.6, arms: { L: [176, 380], R: null, bend: -20 }, ...XTRA.camman }, camera);
    W.camman.root.updateMatrixWorld(true); R_.updateMatrixWorld(true);
    W.arm2.set(cardPoint(W.camman, 364, 405), R_.userData.crank.localToWorld(V.set(0, 0.15, 0.08)).clone()); W.arm2.arm.visible = W.arm2.ball.visible = true;
  }
  // ---- lookout: tiny groups across the paddock, each with one tall bird on watch; push in on the one on the mound
  const MD = W.mound.position, MD_TOP = 1.18;
  const cLook = (t) => { const u = smooth((t - 49.7) / 3.4); return { p: [lerp(95.5, 94.7, u), lerp(7.2, 2.35, u), lerp(-18.5, -31.2, u)], a: [lerp(95.5, MD.x, u), lerp(0.2, 2.25, u), lerp(-40, MD.z, u)], fov: lerp(48, 40, u) }; };
  const groups = [[87.5, -41], [101, -44], [91.5, -50], [104, -34], [86, -31.5], [99, -55], [MD.x, MD.z]];
  const lookEmus = []; { const r = R(57); groups.forEach(([gx, gz], gi) => { for (let i = 0; i < 5; i++) { const a = r() * TAU, rr = 1.0 + r() * 1.1;
    lookEmus.push({ x: gx + Math.cos(a) * rr * 1.2, z: gz + Math.sin(a) * rr, ph: r() * TAU, rate: 0.6 + r() * 0.7, hd: r() * TAU, gi }); } }); }

  const v2 = {
    open: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 9, az: 128, el: 24,
      sun: [TK[0] + 1, TK[1] - 3, 14],
      cam: cOpen, focus: () => [MT.x, 1.9, MT.z], slab: 5,
      update(t, camera) {
        parked(t, camera);
        staring(t, camera, 1.05);
        const F = W.flock; F.begin(camera);
        for (const e of midEmus) F.add(e.x, 0, e.z, { view: 'side', pose: 'peck', k: 0.5 + 0.5 * Math.sin(t * e.rate * 3 + e.ph), hd: e.hd });
        F.end();
        W.puffs.begin(); W.puffs.burst(t, -0.4, [TK[0] - 2.4, 0, TK[1]], { n: 4, size: 1.2, spread: 1.2, rise: 0.5, dur: 1.8, seed: 3 }); W.puffs.end();
      },
    },
    gun: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 16, az: 140, el: 24,
      sun: [MT.x, MT.z - 3, 10],
      cam: cGun, focus: (t) => { const k = smooth((t - 1.75) / 0.55); return [lerp(MT.x + bDir.x * 0.2, EO.x, k), lerp(1.95, 1.5, k), lerp(MT.z + bDir.z * 0.2, EO.z, k)]; },
      update(t, camera) {
        parked(t, camera, { mer: false, sway: 0.4 });
        putEmu(W, 0, EO.x, 0, EO.z, { view: 'front', pose: 'stare', eye: 'ring', brow: t > nt('n01_hook', 7) ? 'angry' : null, look: 0, blink: lid(t, 3) }, camera, 1.05);
        W.flock.begin(camera); W.flock.end();
      },
    },
    stakes: {
      sky: 'day', tone: TONE_DAY, fog: [30, 380], cInf: 30, az: 125, el: 26,
      sun: [-10, -12, 34],
      cam: cStake, focus: (t) => [TK[0], 1.2, lerp(TK[1], -8, smooth((t - 3.0) / 1.6))], slab: 12,
      update(t, camera) {
        parked(t, camera);
        staring(t, camera);
        const L = W.lewis; L.g.visible = true; L.g.position.set(TK[0] - 3.2, 0, TK[1] - 2.0); L.g.rotation.y = gunYaw + 0.4;
        put(W.s1, TK[0] - 2.6, 0, TK[1] - 1.5, { expr: 'stern', blink: lid(t, 4), arms: ARMS.clasp, ...XTRA.soldier }, camera);
        put(W.s2, TK[0] - 3.6, 0, TK[1] - 1.3, { expr: 'worried', blink: lid(t, 6), arms: ARMS.hips, ...XTRA.soldier2 }, camera);
        const F = W.flock, c = camPos(camera); F.begin(camera);
        for (const e of fieldEmus) {
          if (e.up) F.add(e.x, 0, e.z, { view: 'side', pose: 'stand', hd: e.hd });
          else F.add(e.x, 0, e.z, { view: 'side', pose: 'peck', k: 0.5 + 0.5 * Math.sin(t * e.rate * 3 + e.ph), hd: e.hd });
        }
        F.end(); void c;
      },
    },
    newsreel: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 9, az: 118, el: 22,
      sun: [CM[0], CM[1], 12],
      cam: (t) => ({ p: [lerp(13.4, 13.0, smooth((t - 11.0) / 1.9)), 1.5, lerp(21.0, 20.4, smooth((t - 11.0) / 1.9))], a: [10.7, 1.45, 17.2], fov: 42 }),
      focus: () => [CM[0], 1.5, CM[1]], slab: 2,
      update(t, camera) {
        cameraman(t, camera);
        const T = W.truck, x = lerp(-44, -30, clamp((t - 11.0) / 2.0)); T.g.visible = true; T.g.position.set(x, 0, 14.2); T.g.rotation.y = 0; T.mount.visible = false;
        T.body.position.y = 0.04 * Math.abs(Math.sin(t * 9)); T.wheels.forEach((w) => { w.rotation.z = -x / 0.45; });
        W.puffs.begin(); for (let k = 0; k < 7; k++) { const te = 10.9 + k * 0.3; if (te < t) W.puffs.burst(t, te, [lerp(-44, -30, clamp((te - 11.0) / 2.0)) - 2.2, 0, 14.2], { n: 2, size: 1.3, spread: 0.7, rise: 0.5, dur: 1.4, seed: 70 + k }); } W.puffs.end();
        W.flock.begin(camera); W.flock.end();
      },
    },
    lookout: {
      sky: 'day', tone: TONE_DAY, fog: [24, 340], cInf: 10, az: 120, el: 22,
      sun: [MD.x, MD.z, 22],
      cam: cLook, focus: (t) => [MD.x, lerp(0.6, 2.2, smooth((t - 49.7) / 3.2)), lerp(-40, MD.z, smooth((t - 49.7) / 3.2))], slab: 8,
      update(t, camera) {
        const tTall = nt('n18_lookout', 10), tLook = nt('n18_lookout', 13), scan = Math.floor((t - 49.7) / 0.7) % 2 === 1;
        putEmu(W, 0, MD.x, MD_TOP, MD.z, { view: 'side', pose: t > tLook - 0.05 ? 'stare' : 'stand', eye: t > tLook - 0.05 ? 'ring' : 'lid', look: t > tLook - 0.05 ? 0 : 0.4, flip: t > tLook - 0.05 ? false : scan, blink: lid(t, 5) }, camera, 1.0 + 0.16 * boing((t - tTall + 0.1) / 0.7));
        W.eBlob[0].visible = false;
        const F = W.flock, c = camPos(camera); F.begin(camera);
        for (const e of lookEmus) F.add(e.x, 0, e.z, { view: 'side', pose: 'peck', k: 0.5 + 0.5 * Math.sin(t * e.rate * 3 + e.ph), hd: e.hd });
        groups.slice(0, -1).forEach(([gx, gz], gi) => {   // each group's lookout: head up, turning side to side
          const hd = Math.floor((t - 49.7) / 0.8 + gi * 0.37) % 2 ? PI / 2 : -PI / 2; F.add(gx, 0, gz, { view: viewFor(hd, gx, gz, c), pose: 'stand', hd, s: 1.14 }); });
        F.end();
      },
    },
  };
  Object.assign(shots, v2);
  shots.bumpy = { ...shots.chase, cam: (t) => { const c = cBumpy(t); c.p[1] += 0.05 * Math.sin(t * 13); return c; }, focus: (t) => [XT(t) - 1.2, 1.8, 14], slab: 0 };
  return shots;
}
