// A grand hotel salon in 1925 Paris, toon look (dh015, after the Hôtel de Crillon on the Place de la Concorde): damask
// walls over white boiserie, parquet + a big rug, a crystal chandelier, two tall French windows on the back wall with
// the Concorde (obelisk, the Eiffel Tower small on the right) outside, a marble fireplace + mirror on the left wall,
// double doors on the right wall, a writing desk with a green banker's lamp, a round table with velvet armchairs, an
// easel, a side table with a candlestick telephone. Room x -4.5 … 4.5, z -4 … 3 (open toward +z), ceiling 4.2.
// setMode('day' | 'night'): sunny windows + a sun key through them, or a dark-blue night outside, lamps on.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, fitText, plaster } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun, glow, lamp } from '@engine/toon/kit.js';
import { makeGlow } from '@engine/toon/light.js';
import { parquet, damask, concorde } from './paint1925.js';

const PI = Math.PI;
export const SUITE = { desk: [2.6, -2.7], table: [-0.6, -0.9], easel: [0.9, -3.1], phone: [3.75, 0.9], door: [4.45, 1.2], winX: [-2.0, 0.95], H: 4.2 };

/** a velvet armchair (front faces +z before rotY) */
export function armchair(parent, x, z, rotY, col = '#9a2f3a', gold) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; parent.add(g);
  const v = toonMat(col), wd = gold || toonMat('#c9a35a');
  box(g, 0.78, 0.2, 0.7, v, 0, 0.44, 0, 0.06); box(g, 0.78, 0.78, 0.16, v, 0, 0.9, -0.3, 0.07);
  for (const s of [-1, 1]) { box(g, 0.13, 0.26, 0.66, v, s * 0.36, 0.64, 0, 0.05); for (const zz of [-0.28, 0.28]) cyl(g, 0.03, 0.022, 0.36, wd, s * 0.33, 0.17, zz, 8); }
  return g;
}

export function buildSuite(root) {
  const S = SUITE;
  const fl = plane(root, 9, 7, toonMat(parquet('#a06a3c', [4, 3])), 0, 0, -0.5); fl.rotation.x = -PI / 2;
  const rug = plane(root, 5.2, 3.6, toonMat(ctex('rug25', 512, 360, (g, r, W, H) => {
    g.fillStyle = '#7a2a34'; g.fillRect(0, 0, W, H); g.strokeStyle = '#d9b45a'; g.lineWidth = 14; g.strokeRect(18, 18, W - 36, H - 36);
    g.strokeStyle = '#2f3f6a'; g.lineWidth = 22; g.strokeRect(46, 46, W - 92, H - 92);
    g.fillStyle = '#c9a35a'; g.beginPath(); g.ellipse(W / 2, H / 2, 110, 70, 0, 0, 7); g.fill(); g.fillStyle = '#7a2a34'; g.beginPath(); g.ellipse(W / 2, H / 2, 70, 40, 0, 0, 7); g.fill();
  })), -0.4, 0.005, -1.0); rug.rotation.x = -PI / 2; rug.castShadow = false;
  // walls: damask above, white panelled boiserie below, cornice
  const wallM = toonMat(damask('#dccaa6', '#c2a272', [5, 2])), panel = toonMat('#f1ebdf'), gilt = toonMat('#d4b062'), white = toonMat('#f6f1e7');
  const winL = S.winX[0], winR = S.winX[1], WW = 1.5;
  // back wall in pieces around the two windows (x -4.5 … 4.5, windows 1.5 wide, sill 0.5, top 3.5)
  const segs = [[-4.5, winL - WW / 2], [winL + WW / 2, winR - WW / 2], [winR + WW / 2, 4.5]];
  for (const [a, b] of segs) box(root, b - a, S.H, 0.14, [wallM, wallM, wallM, wallM, wallM, wallM], (a + b) / 2, S.H / 2, -4.07);
  for (const x of S.winX) { box(root, WW, 0.5, 0.14, wallM, x, 0.25, -4.07); box(root, WW, S.H - 3.5, 0.14, wallM, x, (S.H + 3.5) / 2, -4.07); }
  box(root, 0.14, S.H, 7, wallM, -4.5, S.H / 2, -0.5); box(root, 0.14, S.H, 7, wallM, 4.5, S.H / 2, -0.5);
  box(root, 9.2, 0.18, 7.2, toonMat('#f4efe4'), 0, S.H + 0.05, -0.5).castShadow = false;
  for (const [w, x, z, ry] of [[9, 0, -3.98, 0], [7, -4.42, -0.5, PI / 2], [7, 4.42, -0.5, -PI / 2]]) {
    const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.y = ry; root.add(gr);
    box(gr, w, 1.0, 0.06, panel, 0, 0.5, 0); box(gr, w, 0.08, 0.1, white, 0, 1.02, 0.02); box(gr, w, 0.22, 0.2, white, 0, S.H - 0.11, 0.04);
    box(gr, w, 0.12, 0.08, white, 0, 0.06, 0.03);
    for (let k = -w / 2 + 0.6; k < w / 2 - 0.4; k += 1.25) { const p = box(gr, 0.95, 0.66, 0.02, panel, k + 0.45, 0.5, 0.04); void p; plane(gr, 0.85, 0.02, gilt, k + 0.45, 0.82, 0.056); plane(gr, 0.85, 0.02, gilt, k + 0.45, 0.18, 0.056); }
  }
  // the two French windows: frame, mullions, curtains + swags, the view (self-lit)
  const view = new THREE.MeshBasicMaterial({ map: concorde() }), viewN = new THREE.MeshBasicMaterial({ map: ctex('concordeN', 512, 384, (g, r, W, H) => {
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#101a44'); sky.addColorStop(1, '#3a4a86'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(r() * W, r() * H * 0.5, 2, 2); }
    g.fillStyle = '#1a2348'; g.fillRect(0, H * 0.62, W, H); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,214,140,0.9)'; g.fillRect(r() * W, H * (0.5 + r() * 0.15), 3, 3); }
    g.fillStyle = '#26305a'; g.beginPath(); g.moveTo(W * 0.48, H * 0.72); g.lineTo(W * 0.5, H * 0.22); g.lineTo(W * 0.52, H * 0.72); g.fill();
  }) });
  const views = [], curtainM = toonMat('#8a2a36'), frameM = toonMat('#f4efe6');
  for (const x of S.winX) {
    const v = plane(root, WW, 3.0, view, x, 2.0, -4.6); v.receiveShadow = false; views.push(v);
    for (const s of [-1, 1]) box(root, 0.08, 3.0, 0.12, frameM, x + s * WW / 2, 2.0, -4.02);
    box(root, WW, 0.08, 0.12, frameM, x, 3.5, -4.02); box(root, WW, 0.1, 0.16, frameM, x, 0.5, -3.98);
    box(root, 0.05, 3.0, 0.06, frameM, x, 2.0, -4.0); for (const y of [1.25, 2.0, 2.75]) box(root, WW, 0.04, 0.06, frameM, x, y, -4.0);
    for (const s of [-1, 1]) { const c = box(root, 0.42, 3.6, 0.16, curtainM, x + s * (WW / 2 + 0.16), 2.0, -3.86, 0.05); c.scale.x = 1; }
    box(root, WW + 1.1, 0.42, 0.2, curtainM, x, 3.72, -3.84, 0.08); box(root, WW + 1.2, 0.06, 0.22, gilt, x, 3.95, -3.82);
  }
  // fireplace + mirror on the left wall, clock + candelabra on the mantel
  const marble = toonMat('#ece6dc');
  box(root, 0.5, 1.2, 1.9, marble, -4.2, 0.6, -1.4); box(root, 0.6, 0.1, 2.1, marble, -4.15, 1.24, -1.4);
  box(root, 0.06, 0.7, 1.0, toonMat('#1e1612'), -3.94, 0.45, -1.4);
  const mirror = plane(root, 1.6, 1.6, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.62, 0.66, 0.72) }), -4.4, 2.4, -1.4); mirror.rotation.y = PI / 2;
  box(root, 0.08, 1.8, 1.8, gilt, -4.44, 2.4, -1.4);
  box(root, 0.22, 0.34, 0.3, gilt, -4.15, 1.46, -1.4);
  const fireGlow = glow(root, '255,150,70', 1.0, -3.9, 0.4, -1.4, 0.6);
  // chandelier: a gilt ring + arms + candle bulbs (self-lit) + crystals
  const ch = new THREE.Group(); ch.position.set(-0.4, S.H - 0.9, -1.0); root.add(ch);
  cyl(ch, 0.015, 0.015, 0.8, gilt, 0, 0.5, 0, 6);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 8, 32), gilt); ring.rotation.x = PI / 2; ch.add(ring);
  ball(ch, 0.14, gilt, 0, -0.1, 0, 12);
  const bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.0, 1.4) });
  for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2, x = Math.cos(a) * 0.5, z = Math.sin(a) * 0.5; cyl(ch, 0.02, 0.02, 0.12, white, x, 0.08, z, 6); const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), bulbM); b.position.set(x, 0.17, z); ch.add(b); }
  const crystal = toonMat('#e8f0f8', { shiny: 90, spec: 0xffffff });
  for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2; const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), crystal); c.position.set(Math.cos(a) * 0.36, -0.12 - (i % 2) * 0.08, Math.sin(a) * 0.36); c.scale.y = 1.8; ch.add(c); }
  const chGlow = makeGlow(ch, { size: 2.2, intensity: 0.35, color: 0xffd9a0, y: 0.1 });
  // writing desk + banker's lamp + inkwell + blotter
  const deskM = toonMat('#6a3e24'), brass = toonMetal('#d6b25e', { rough: 0.3 });
  const desk = new THREE.Group(); desk.position.set(S.desk[0], 0, S.desk[1]); root.add(desk);
  box(desk, 1.6, 0.08, 0.8, deskM, 0, 0.78, 0, 0.02); for (const sx of [-1, 1]) box(desk, 0.4, 0.74, 0.72, deskM, sx * 0.58, 0.37, 0);
  box(desk, 0.9, 0.012, 0.5, toonMat('#2f5a3e'), 0, 0.825, 0.05);
  cyl(desk, 0.05, 0.06, 0.07, toonMat('#1e1e2a'), 0.55, 0.86, -0.18, 12);
  const lampG = new THREE.Group(); lampG.position.set(-0.55, 0.82, -0.2); desk.add(lampG);
  cyl(lampG, 0.09, 0.11, 0.03, brass, 0, 0.015, 0, 16); cyl(lampG, 0.012, 0.012, 0.32, brass, 0, 0.17, 0, 8);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.12, 20, 1, true, 0, PI), toonMat('#2f8a52', { side: THREE.DoubleSide, shiny: 60, spec: 0x8affc0 }));
  shade.rotation.set(0, PI, PI / 2); shade.position.set(0, 0.34, 0.02); lampG.add(shade);
  const deskLamp = lamp(desk, 0xffd49a, 0, 3.2, -0.45, 1.1, 0.0);
  const deskGlow = glow(desk, '255,214,150', 0.5, -0.55, 1.08, -0.1, 0.6);
  // round table + 5 armchairs for the dealers; the easel; a side table with the telephone by the double doors
  const table = new THREE.Group(); table.position.set(S.table[0], 0, S.table[1]); root.add(table);
  cyl(table, 0.75, 0.75, 0.06, toonMat('#7a4a2c'), 0, 0.74, 0, 32); cyl(table, 0.07, 0.12, 0.7, deskM, 0, 0.36, 0, 10); cyl(table, 0.35, 0.4, 0.05, deskM, 0, 0.03, 0, 16);
  const chairs = [[-1.25, 0.3, 2.2], [0.05, 1.1, PI], [1.2, 0.35, -2.2], [-1.15, -0.8, 1.0], [1.05, -0.9, -1.0]].map(([x, z, ry]) => armchair(table, x, z, ry));
  const easel = new THREE.Group(); easel.position.set(S.easel[0], 0, S.easel[1]); root.add(easel);
  for (const s of [-1, 1]) { const l = box(easel, 0.05, 2.0, 0.05, deskM, s * 0.42, 1.0, 0); l.rotation.z = s * 0.12; }
  const bl = box(easel, 0.05, 2.0, 0.05, deskM, 0, 0.95, -0.4); bl.rotation.x = -0.3;
  box(easel, 1.1, 0.05, 0.12, deskM, 0, 0.82, 0.05);
  const boardMat = toonMat('#f3ead6'), board = plane(easel, 1.0, 1.3, boardMat, 0, 1.5, 0.08); board.rotation.x = -0.08; board.castShadow = true;
  const side = new THREE.Group(); side.position.set(S.phone[0], 0, S.phone[1]); root.add(side);
  cyl(side, 0.3, 0.3, 0.04, marble, 0, 0.82, 0, 24); for (let i = 0; i < 3; i++) { const a = (i / 3) * PI * 2; const l = cyl(side, 0.02, 0.02, 0.8, gilt, Math.cos(a) * 0.2, 0.4, Math.sin(a) * 0.2, 6); l.rotation.z = Math.cos(a) * 0.1; }
  // double doors on the right wall (x = 4.45), panelled, gilt handles
  for (const s of [-1, 1]) { box(root, 0.08, 2.7, 0.7, toonMat('#f6f1e7'), 4.42, 1.35, S.door[1] + s * 0.36); ball(root, 0.03, gilt, 4.36, 1.2, S.door[1] + s * 0.08, 8); }
  box(root, 0.1, 0.2, 1.7, gilt, 4.42, 2.8, S.door[1]);
  // potted palms, a console with flowers, a portrait
  for (const [x, z] of [[-3.8, -3.5], [3.9, -3.5]]) {
    cyl(root, 0.24, 0.18, 0.5, toonMat('#3a5a7a'), x, 0.25, z, 16);
    for (let i = 0; i < 7; i++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.0, 5), toonMat(i % 2 ? '#3f7a3a' : '#4f8a44')); const a = (i / 7) * PI * 2; lf.position.set(x + Math.cos(a) * 0.22, 0.95, z + Math.sin(a) * 0.22); lf.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8); lf.castShadow = true; root.add(lf); }
  }
  const portrait = plane(root, 0.9, 1.15, toonMat(ctex('portrait25', 256, 320, (g, r, W, H) => { g.fillStyle = '#3a4a3a'; g.fillRect(0, 0, W, H); g.fillStyle = '#e8d4b8'; g.beginPath(); g.ellipse(W / 2, H * 0.4, 50, 64, 0, 0, 7); g.fill(); g.fillStyle = '#2a2420'; g.fillRect(W / 2 - 80, H * 0.62, 160, H * 0.4); g.fillStyle = '#4a3a2a'; g.beginPath(); g.ellipse(W / 2, H * 0.3, 54, 30, 0, PI, 0); g.fill(); })), 4.42, 2.6, -2.3);
  portrait.rotation.y = -PI / 2; box(root, 0.06, 1.3, 1.05, gilt, 4.45, 2.6, -2.3);
  // ---------------------------------------------------------------- light: sun through the windows (day) / moon (night)
  const key = sun(root, [-1.0, 4.0, -3.6], [0.2, 0, -0.6], { half: 4.6, map: 4096, far: 14, hemi: [0xfff1dc, 0x8a6a52, 0.7] });
  const winGlow = S.winX.map((x) => makeGlow(root, { x, y: 2.0, z: -3.9, size: 3.2, intensity: 0.35, color: 0xfff2d8 }));
  const chLamp = lamp(root, 0xffd29a, 0, 6, -0.4, S.H - 1.2, -1.0);
  function setMode(m) {
    const night = m === 'night';
    for (const v of views) v.material = night ? viewN : view;
    view.color.setScalar(1.6);
    key.color.set(night ? 0x8fa4e8 : 0xfff0d8); key.intensity = night ? 0.9 : 2.2;
    for (const g of winGlow) g.visible = !night;
    deskLamp.intensity = night ? 3.5 : 0.6; deskGlow.visible = night; chLamp.intensity = night ? 2.6 : 0.8; chGlow.visible = true;
    fireGlow.visible = night;
  }
  setMode('day');
  return { root, sun: key, setMode, desk, table, chairs, easel, board, boardMat, side, bg: new THREE.Color(0x2a2230), fog: null };
}
