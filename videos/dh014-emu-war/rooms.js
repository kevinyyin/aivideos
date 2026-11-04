// dh014 indoor / graphic sets: the briefing tent (+ its map table of toy soldiers), the 1932 House of Representatives
// (our own simplified chamber: green benches, panelled walls), the newspaper spin, and the coat-of-arms reveal
// (our own simplified drawing: shield, seven-point star, wattle, kangaroo + emu supporters).
import * as THREE from 'three';
import { K, clamp, lerp, smooth, easeOut, rng } from '@engine/core.js';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { makeToon, makeBlob, makeStickArm, cardPoint, lidAt, ARMS, INK, drawToon } from '@engine/toon/cards.js';
import { ctex, wood, felt, plaster, blotch, fitText, vgrad } from '@engine/toon/paint.js';
import { NOINK } from '@engine/toon/ink.js';
import { cardShade } from '@engine/toon/shade.js';
import { makeEmu, makeEmuFlock, drawEmu } from '@engine/toon/emu.js';
import { makePuffs, mustache, extras } from '@engine/toon/extras.js';
import { makeGlow, makeShafts, makeMotes } from '@engine/toon/light.js';
import { MOOD } from '@engine/toon/mood.js';
import { PI, box, cyl, plane, rod, canvasMat, sunLight, atScreen, ground, CAST, XTRA, makeLewis, crate, flatCap } from './kit.js';
import { wt, nt } from './world.js';

const TAU = PI * 2;
const boing = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * PI * 2.5) * Math.exp(-u * 5.5));
const lid = (t, s) => lidAt(t, s);
let SUN = null;   // the current room's key light: toons take their lit / shaded side from it (face() before set())
function put(tt, x, y, z, st, camera, sc = 1) {
  tt.root.visible = sc > 0.001; tt.root.position.set(x, y, z); tt.root.scale.setScalar(Math.max(sc, 0.001)); tt.root.updateMatrixWorld(true); tt.face(camera, SUN); tt.set(st);
  if (tt.blob) { tt.blob.visible = sc > 0.5; tt.blob.position.set(x, y + 0.004, z); }
}
/** a card from any Canvas2D drawing (600 x 1000 design space like the toons), lit like the toons */
function drawnCard(key, draw, H, res = 1) {
  const t = ctex('dh14card' + key, Math.round(600 * res), Math.round(1000 * res), (g) => { g.scale(res, res); draw(g); });
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6 * H, H), cardShade(new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide })));
  m.geometry.translate(0, 0.475 * H, 0); m.layers.set(NOINK); return m;
}

// ---------------------------------------------------------------- tent: briefing (10.3-14.6) + map table (39-43.8)
function mapDraw(g, r, W, H) {
  g.fillStyle = '#e9dcb8'; g.fillRect(0, 0, W, H); for (let i = 0; i < 14; i++) blotch(g, r() * W, r() * H, 120, r() < 0.5 ? '200,170,110' : '250,240,210', 0.18);
  const field = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); g.strokeStyle = '#6b5233'; g.lineWidth = 3; g.strokeRect(x, y, w, h);
    g.strokeStyle = 'rgba(120,90,40,0.45)'; g.lineWidth = 2; for (let k = y + 8; k < y + h; k += 10) { g.beginPath(); g.moveTo(x + 3, k); g.lineTo(x + w - 3, k); g.stroke(); } };
  field(60, 90, 220, 150, '#e7c46e'); field(300, 70, 180, 190, '#d9b55c'); field(90, 280, 160, 170, '#e2bf68'); field(520, 120, 200, 140, '#e7c46e'); field(470, 320, 250, 170, '#d9b55c');
  g.strokeStyle = '#a0724a'; g.lineWidth = 12; g.beginPath(); g.moveTo(0, 520); g.bezierCurveTo(250, 500, 500, 560, W, 520); g.stroke();
  g.fillStyle = '#7fa9c0'; g.beginPath(); g.arc(330, 380, 40, 0, 7); g.fill(); g.strokeStyle = '#3d5a6b'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#4a3420'; g.font = 'bold 30px Georgia, serif'; g.fillText('CAMPION', 300, 300);
  g.font = 'italic 34px "Marker Felt", "Comic Sans MS", cursive'; g.fillStyle = '#8a2a1e'; g.fillText('plan of attack', 40, 52);
  for (const [x, y] of [[170, 160], [390, 150], [610, 190], [170, 360], [590, 400], [360, 210]]) {
    g.save(); g.translate(x, y); g.scale(0.07, 0.07); g.translate(-500, -560); drawEmu(g, { view: 'side', pose: 'peck', k: 0.6 }); g.restore();
    g.strokeStyle = '#c0392b'; g.lineWidth = 5; g.beginPath(); g.arc(x, y + 6, 38, 0, 7); g.stroke();
  }
  g.strokeStyle = '#c0392b'; g.lineWidth = 7; g.lineCap = 'round';
  for (const [x0, y0, x1, y1] of [[120, 600, 160, 410], [420, 610, 370, 250], [700, 600, 610, 430]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 40, (y0 + y1) / 2, x1, y1); g.stroke();
    const a = Math.atan2(y1 - (y0 + y1) / 2, x1 - ((x0 + x1) / 2 + 40)); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - 26 * Math.cos(a - 0.5), y1 - 26 * Math.sin(a - 0.5)); g.moveTo(x1, y1); g.lineTo(x1 - 26 * Math.cos(a + 0.5), y1 - 26 * Math.sin(a + 0.5)); g.stroke(); }
}
function buildTent(root) {
  const can = toonMat(ctex('dh14canvas', 512, 512, (g, r, W, H) => { g.fillStyle = '#eadfc3'; g.fillRect(0, 0, W, H); for (let i = 0; i < 20; i++) blotch(g, r() * W, r() * H, 120, r() < 0.5 ? '255,250,230' : '190,170,130', 0.12);
    g.fillStyle = 'rgba(150,125,90,0.45)'; for (let x = 0; x < W; x += 128) g.fillRect(x, 0, 5, H); }, [3, 1]), { side: THREE.DoubleSide, emissive: 0x2e2010 });   // sunlit canvas glows a little
  const floor = box(root, 7.2, 0.1, 7, toonMat(wood('#a98258', { boards: 8, repeat: [1, 1] })), 0, -0.05, 0);
  floor.rotation.y = PI / 2;
  const tri = (pts, m) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); g.computeVertexNormals();
    const uv = pts.map(([x, y]) => [x / 2 + 0.5, y / 3.4]); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv.flat(), 2)); const o = new THREE.Mesh(g, m); o.receiveShadow = true; root.add(o); return o; };
  for (const sx of [-1, 1]) { const w = plane(root, 7, 1.8, can, sx * 3.3, 0.9, 0); w.rotation.y = -sx * PI / 2; }
  for (const sx of [-1, 1]) { tri([[sx * 3.3, 1.8, -3.4], [sx * 3.3, 1.8, 3.4], [0, 3.4, 3.4]], can); tri([[sx * 3.3, 1.8, -3.4], [0, 3.4, 3.4], [0, 3.4, -3.4]], can); }
  // back wall with an open door flap -> a bright painted outside
  tri([[-3.3, 0, -3.4], [-0.55, 0, -3.4], [-0.55, 3.25, -3.4]], can); tri([[-3.3, 0, -3.4], [-0.55, 3.25, -3.4], [-3.3, 1.8, -3.4]], can);
  tri([[0.55, 0, -3.4], [3.3, 0, -3.4], [3.3, 1.8, -3.4]], can); tri([[0.55, 0, -3.4], [3.3, 1.8, -3.4], [0.55, 3.25, -3.4]], can);
  tri([[-0.55, 2.4, -3.4], [0.55, 2.4, -3.4], [0, 3.4, -3.4]], can);
  const flap = plane(root, 0.75, 2.4, can, -0.75, 1.2, -3.2); flap.rotation.y = 0.7;
  plane(root, 6, 4, toonMat(ctex('dh14outside', 512, 340, (g, r, W, H) => { const s = g.createLinearGradient(0, 0, 0, H * 0.55); s.addColorStop(0, '#8fbde4'); s.addColorStop(1, '#e8e2cc'); g.fillStyle = s; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e2b860'; g.fillRect(0, H * 0.55, W, H); for (let i = 0; i < 40; i++) blotch(g, r() * W, H * 0.6 + r() * H * 0.4, 30, '180,130,60', 0.2); })), 0, 1.6, -5.5);
  { const o = root.children[root.children.length - 1]; o.material = new THREE.MeshBasicMaterial({ map: o.material.map, color: new THREE.Color(1.35, 1.28, 1.15) }); }   // bright daylight through the door
  makeGlow(root, { x: 0, y: 1.5, z: -3.1, size: 2.4, intensity: 0.22, color: 0xffe2b4 });
  const doorShafts = makeShafts(root, { from: [0, 2.4, -3.3], dir: [0.12, -0.42, 1], n: 5, spread: 0.9, w: 0.2, len: 4.2, opacity: 0.05, seed: 4 });
  cyl(root, 0.06, 0.06, 3.4, toonMat('#8a6a48'), 0, 1.7, -3.3, 10); rod(root, [0, 3.38, -3.4], [0, 3.38, 3.4], 0.05, toonMat('#8a6a48'));
  // lantern
  const lant = new THREE.Group(); lant.position.set(0.5, 2.55, 0.2); root.add(lant);
  rod(lant, [0, 0.83, 0], [0, 0.2, 0], 0.008, toonMat('#3a3a3a'), 4); cyl(lant, 0.1, 0.12, 0.05, toonMat('#3d4a3c'), 0, 0.17, 0, 12);
  cyl(lant, 0.08, 0.08, 0.2, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.9, 0.95) }), 0, 0.03, 0, 12); cyl(lant, 0.1, 0.12, 0.04, toonMat('#3d4a3c'), 0, -0.1, 0, 12);
  const lamp = new THREE.PointLight(0xffc27a, 3.2, 4.6, 2); lamp.position.set(0.5, 2.5, 0.35); root.add(lamp);
  makeGlow(root, { x: 0.5, y: 2.58, z: 0.2, size: 1.1, intensity: 0.9, color: 0xffc98a });
  // a second lantern over the map table: a warm pool on the toy soldiers, the edges fall off
  const pool = new THREE.SpotLight(0xffd59a, 5.5, 0, 0.7, 0.85, 2); pool.position.set(0.15, 2.3, 1.2); pool.target.position.set(0.15, 0.9, 1.2); root.add(pool, pool.target);
  // easel + map board
  const easel = new THREE.Group(); easel.position.set(-0.62, 0, -1.7); easel.rotation.y = 0.22; root.add(easel);
  const ew = toonMat('#7a5636'); rod(easel, [-0.5, 0, 0.25], [-0.32, 2.0, 0], 0.025, ew, 6); rod(easel, [0.5, 0, 0.25], [0.32, 2.0, 0], 0.025, ew, 6); rod(easel, [0, 0, -0.45], [0, 1.9, -0.02], 0.025, ew, 6);
  box(easel, 1.2, 0.05, 0.08, ew, 0, 0.93, 0.15);
  const board = box(easel, 1.25, 0.92, 0.03, toonMat('#6f4f33'), 0, 1.42, 0.11); board.rotation.x = -0.06;
  const mapM = canvasMat('map', 800, 640, mapDraw, { basic: false });
  const mp = plane(easel, 1.15, 0.86, mapM, 0, 1.42, 0.13); mp.rotation.x = -0.06;
  // map table (toy soldiers live here) + chairs + dressing
  const tw = toonMat(wood('#8f6440', { boards: 4 }));
  box(root, 1.8, 0.06, 1.0, tw, 0.25, 0.86, 1.2); for (const [x, z] of [[-0.55, 0.8], [1.05, 0.8], [-0.55, 1.6], [1.05, 1.6]]) box(root, 0.06, 0.84, 0.06, tw, x, 0.42, z);
  const tmap = plane(root, 1.5, 0.8, canvasMat('map2', 800, 430, mapDraw), 0.25, 0.895, 1.2); tmap.rotation.x = -PI / 2;
  for (let i = 0; i < 4; i++) crate(root, 2.6, Math.floor(i / 2) * 0.45, -2.6 + (i % 2) * 0.55, 1, 0.1);
  const cot = new THREE.Group(); cot.position.set(-2.5, 0, 0.6); root.add(cot); box(cot, 0.8, 0.12, 1.9, toonMat('#6c7350'), 0, 0.45, 0); for (const [x, z] of [[-0.35, -0.85], [0.35, -0.85], [-0.35, 0.85], [0.35, 0.85]]) rod(cot, [x, 0, z], [x, 0.45, z], 0.02, toonMat('#5a4a36'), 4);
  box(cot, 0.5, 0.12, 0.3, toonMat('#ece3d0'), 0, 0.57, -0.7, 0.05);
  const kettle = cyl(root, 0.09, 0.12, 0.16, toonMat('#9aa3a6'), 2.55, 0.98, -2.0, 14); void kettle;
  const phone = box(root, 0.26, 0.2, 0.18, toonMat('#3f3a2e'), 2.5, 1.0, -2.65, 0.02); void phone;
  // guns + ammo for the briefing pop-ins
  const guns = [makeLewis({ bipod: false }), makeLewis({ bipod: false })];
  guns.forEach((gn, i) => { gn.g.position.set(-0.15 + i * 0.2, 0.96, 1.05 + i * 0.32); gn.g.rotation.y = 0.25 - i * 0.12; root.add(gn.g); });
  const ammo = []; for (let i = 0; i < 6; i++) { const c = crate(root, 1.45 + ((i * 37) % 7 - 3) * 0.015, i * 0.36, -2.75, 0.8, ((i * 53) % 9 - 4) * 0.04); c.userData.y = c.position.y; ammo.push(c); }
  // toy soldiers (tin figures) in neat lines + a pointer
  const toys = [], tinB = toonMat('#8e8657'), tinH = toonMat('#e8d9c0'), hatM = toonMat('#9b8a5e');
  for (let row = 0; row < 4; row++) for (let col = 0; col < 7; col++) {
    const g = new THREE.Group(); g.position.set(-0.32 + col * 0.11, 0.9, 1.0 + row * 0.11); root.add(g);
    cyl(g, 0.026, 0.03, 0.08, tinB, 0, 0.04, 0, 10); const h = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), tinH); h.position.y = 0.1; h.castShadow = true; g.add(h);
    cyl(g, 0.034, 0.034, 0.008, hatM, 0, 0.12, 0, 12); cyl(g, 0.014, 0.018, 0.014, hatM, 0, 0.13, 0, 10);
    cyl(g, 0.012, 0.012, 0.012, toonMat('#5a4a36'), 0, 0.004, 0, 8);
    toys.push({ g, row, col, seed: row * 7 + col });
  }
  const pointer = new THREE.Group(); root.add(pointer); rod(pointer, [0, 0, 0], [0, 0.85, 0], 0.008, toonMat('#5a3a20'), 6);
  const toyEmus = makeEmuFlock(40, { H: 1.8, res: 0.22, blob: 0.7 }); root.add(toyEmus.root);
  const mer = makeToon(CAST.meredith, { res: 1.8, shadow: true, maxCache: 6 }), s1 = makeToon(CAST.soldier, { res: 1.6, shadow: true, maxCache: 6 }), s2 = makeToon(CAST.soldier, { res: 1.6, shadow: true, maxCache: 6 });
  for (const tt of [mer, s1, s2]) { root.add(tt.root); tt.blob = makeBlob(0.36, 0.22, 0.55); root.add(tt.blob); }
  const arm = makeStickArm(root, { hand: 22, width: 13 });
  const puffs = makePuffs(root, 40);
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 150, box: [-2.6, 0.3, -3.1, 2.6, 3.0, 2.4], intensity: 2.0 });
  const sun = sunLight(root, { intensity: 2.0 }); sun.aim(0.2, 0.2, 4, [-0.45, 0.7, -0.9]);   // daylight through the door, behind them
  const tone = { rim: MOOD.interior.tone.rim, lit: [1.36, 1.1, 0.82], shade: [0.33, 0.32, 0.54], sat: 0.86, term: 0.3, lambert: 0.35, extra: 1, charTint: [1.02, 0.96, 0.88], charShade: 0.58, charGain: 0.92, headGrad: 0.36, bodyGrad: 0.46, charExtra: 1 };

  const tMer = wt('l03_army', 3), tSol = wt('l03_army', 6), tGun = wt('l03_army', 8), tAmmo = wt('l03_army', 11);
  const tSoldiers = wt('l13_lines', 7), tNo = wt('l14_nolines', 0) - 0.1;
  const emuToys = []; { const r = rng(5); for (let i = 0; i < 14; i++) emuToys.push({ x: -0.25 + r() * 0.6, z: 1.0 + r() * 0.36, hd: r() * TAU, sp: 0.35 + r() * 0.35, ph: r() * TAU, turn: (r() - 0.5) * 4 }); }
  return {
    root,
    shots: {
      brief: {
        bg: new THREE.Color('#3b2f24'), tone, cInf: 10, near: 0.05, far: 60,
        cam: (t) => ({ p: [lerp(0.12, 0.26, smooth((t - 10.3) / 4.3)), 1.6, lerp(4.9, 4.6, smooth((t - 10.3) / 4.3))], a: [0.16, 1.22, -0.7], fov: 48 }),
        focus: () => [-0.1, 1.3, -0.5],
        update(t, camera) {
          SUN = sun.s; doorShafts.face(camera); pool.intensity = 2.0; motes.update(t, camera);
          const point = t > tMer + 0.2;
          put(mer, -0.15, 0, -0.65, { expr: t > tAmmo + 0.3 ? 'grin' : 'smug', blink: lid(t, 8), arms: { L: ARMS.down.L, R: point ? null : ARMS.down.R, bend: 10 }, ...XTRA.meredith }, camera);
          mer.root.updateMatrixWorld(true);
          if (point) { const tip = new THREE.Vector3(-0.5 + 0.16 * Math.sin(t * 2.2), 1.45 + 0.05 * Math.sin(t * 3), -1.45); arm.set(cardPoint(mer, 236, 405), V(-0.42, 1.25, -0.75)); arm.arm.visible = arm.ball.visible = true;
            pointer.visible = true; pointer.position.set(-0.42, 1.25, -0.75); pointer.quaternion.setFromUnitVectors(UP, tip.clone().sub(pointer.position).normalize()); pointer.scale.y = pointer.position.distanceTo(tip) / 0.85; }
          else { arm.arm.visible = arm.ball.visible = false; pointer.visible = false; }
          const sb = (k) => boing((t - tSol - k * 0.18) / 0.5);
          put(s1, 0.5, 0, -1.0, { expr: 'stern', blink: lid(t, 4), arms: { L: ARMS.down.L, R: [398, 150], bend: 70 }, armsFront: true, ...XTRA.soldier }, camera, sb(0));
          put(s2, 1.02, 0, -2.0, { expr: 'stern', blink: lid(t, 5), arms: { L: ARMS.down.L, R: [398, 150], bend: 70 }, armsFront: true, ...XTRA.soldier2 }, camera, sb(1));
          guns.forEach((gn, i) => { const u = boing((t - tGun - i * 0.22) / 0.5); gn.g.visible = u > 0.001; gn.g.scale.setScalar(Math.max(u, 0.001)); });
          ammo.forEach((c, i) => { const te = tAmmo + i * 0.09, u = boing((t - te) / 0.45); c.visible = t > te; c.position.y = c.userData.y + 0.225; c.scale.setScalar(Math.max(u, 0.001)); });
          toys.forEach(({ g }) => { g.visible = false; }); tmap.visible = true;
          toyEmus.begin(camera); toyEmus.end();
          puffs.begin(); ammo.forEach((c, i) => puffs.burst(t, tAmmo + i * 0.09 + 0.22, [c.position.x, c.userData.y, c.position.z + 0.2], { n: 2, size: 0.35, spread: 0.4, rise: 0.15, dur: 0.6, seed: i })); puffs.end();
        },
      },
      lines: {
        bg: new THREE.Color('#3b2f24'), tone, cInf: 14, near: 0.05, far: 60,
        cam: (t) => ({ p: [lerp(0.05, 0.12, smooth((t - 39) / 4.8)), 2.05, lerp(2.35, 2.2, smooth((t - 39) / 4.8))], a: [0.14, 0.9, 1.08], fov: 44 }),
        focus: () => [0.05, 0.9, 1.15],
        update(t, camera) {
          SUN = sun.s; doorShafts.face(camera); pool.intensity = 5.5; motes.update(t, camera);
          guns.forEach((gn) => { gn.g.visible = false; }); ammo.forEach((c) => { c.visible = false; }); s1.root.visible = s2.root.visible = false; s1.blob.visible = s2.blob.visible = false;
          mer.root.visible = false; mer.blob.visible = false;
          const sweep = t < tNo ? smooth((t - tSoldiers + 0.6) / 1.6) : 1;
          const hand = new THREE.Vector3(0.62, 1.32, 0.62), tip = new THREE.Vector3(lerp(-0.34, 0.42, sweep), 0.93, lerp(1.0, 1.36, (Math.sin(t * 5) * 0.5 + 0.5) * 0.4));
          if (t > tNo + 0.3) { hand.y += 0.25 * clamp((t - tNo - 0.3) / 0.3); tip.y += 0.35 * clamp((t - tNo - 0.3) / 0.3); }
          arm.set(V(1.1, 2.4, 0.3), V(hand.x, hand.y, hand.z)); arm.arm.visible = arm.ball.visible = true;
          pointer.visible = true; pointer.position.copy(hand); pointer.quaternion.setFromUnitVectors(UP, tip.clone().sub(hand).normalize()); pointer.scale.y = hand.distanceTo(tip) / 0.85;
          const no = t - tNo;
          toys.forEach(({ g, row, col, seed }) => {
            g.visible = true; const kd = 0.25 + ((seed * 0.37) % 1) * 1.1;   // knocked over after kd s of chaos
            const u = no > kd ? clamp((no - kd) / 0.2) : 0; g.rotation.set(u * (seed % 2 ? 1.5 : -1.5), 0, u * ((seed % 3) - 1) * 1.2); g.position.y = 0.9 - 0.0 * u;
            g.position.x = -0.32 + col * 0.11; g.position.z = 1.0 + row * 0.11;
          });
          toyEmus.begin(camera);
          if (no > 0) for (const e of emuToys) {
            let x = e.x, z = e.z, hd = e.hd; const steps = Math.floor(no * 30);
            for (let s = 0; s < steps; s++) { hd += e.turn / 30; x += Math.sin(hd) * e.sp / 30; z += Math.cos(hd) * e.sp / 30;
              if (x < -0.6 || x > 1.05) { hd = -hd; x = clamp(x, -0.6, 1.05); } if (z < 0.82 || z > 1.6) { hd = PI - hd; z = clamp(z, 0.82, 1.6); } }
            const pop = boing(no / 0.35);
            toyEmus.add(x, 0.89, z, { view: 'side', pose: 'run', ph: e.ph + no * 18, hd, s: 0.16 * pop });
          }
          toyEmus.end();
          puffs.begin(); puffs.burst(t, tNo, [0.05, 0.92, 1.15], { n: 10, size: 0.26, spread: 0.35, rise: 0.12, dur: 0.8, seed: 2 }); puffs.end();
        },
      },
    },
  };
  function V(x, y, z) { return root.localToWorld(new THREE.Vector3(x, y, z)); }
}
const UP = new THREE.Vector3(0, 1, 0);

// ---------------------------------------------------------------- parliament (36.7-39)
function buildParl(root) {
  const green = toonMat(felt('#4c7a58', [3, 3])), leather = toonMat('#3f7552'), dkWood = toonMat(wood('#6e4a2c', { boards: 6, repeat: [3, 1] })), wd = toonMat('#7a5232');
  box(root, 12, 0.1, 10, green, 0, -0.05, 0);
  for (let row = 0; row < 3; row++) {
    const y = row * 0.38, z = -0.9 - row * 1.0;
    if (row) box(root, 9, y, 1.0, wd, 0, y / 2, z);
    box(root, 8.6, 0.42, 0.55, leather, 0, y + 0.21, z + 0.12, 0.06); box(root, 8.6, 0.62, 0.14, leather, 0, y + 0.62, z - 0.2, 0.05);
    box(root, 8.7, 0.07, 0.18, wd, 0, y + 0.95, z - 0.2);
  }
  box(root, 8.8, 0.95, 0.08, dkWood, 0, 0.48, -0.32);   // front rail of the first bench row
  const wall = toonMat(plaster('#ede0c6', [2, 2])), panel = toonMat(wood('#7d5534', { boards: 3, repeat: [6, 1] }));
  box(root, 14, 2.6, 0.2, panel, 0, 1.3 + 1.14, -4.4); box(root, 14, 3.66, 0.2, wall, 0, 5.57, -4.4);   // starts where the panelling ends: no shared plane
  const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#d6e8f2').multiplyScalar(2.0) });   // bright windows: they bloom
  for (const x of [-3.6, -1.2, 1.2, 3.6]) makeGlow(root, { x, y: 5.0, z: -4.0, size: 3.0, intensity: 0.35, color: 0xfff0d8 });
  const winShafts = makeShafts(root, { from: [-1.2, 5.6, -4.1], dir: [0.25, -0.62, 0.75], n: 6, spread: 4.2, w: 0.5, len: 6.5, opacity: 0.08, seed: 7 });
  for (const [x, y] of [[-4.6, 2.85], [-1.9, 2.85], [1.9, 2.85], [4.6, 2.85]]) {   // warm sconces: pools on the panelling
    const L = new THREE.PointLight(0xffc27a, 1.6, 2.6, 2); L.position.set(x, y, -3.9); root.add(L);
    cyl(root, 0.07, 0.1, 0.16, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.8, 1.0) }), x, y, -4.22, 12); makeGlow(root, { x, y, z: -4.1, size: 0.9, intensity: 0.7, color: 0xffc98a }); }
  const chand = new THREE.PointLight(0xffd6a0, 2.4, 7, 2); chand.position.set(0.2, 3.4, 1.6); root.add(chand);   // warm front fill on the faces
  for (const x of [-3.6, -1.2, 1.2, 3.6]) { box(root, 1.3, 2.4, 0.06, winM, x, 5.2, -4.24); box(root, 1.45, 0.1, 0.12, toonMat('#f4ecda'), x, 4.0, -4.24); box(root, 0.08, 2.4, 0.1, toonMat('#f4ecda'), x, 5.2, -4.26); }
  box(root, 14, 0.18, 0.5, wd, 0, 3.9, -4.1);   // gallery ledge
  const clock = new THREE.Group(); clock.position.set(-2.4, 3.15, -4.27); root.add(clock);
  cyl(clock, 0.28, 0.28, 0.06, wd, 0, 0, 0, 24).rotation.x = PI / 2; const face = cyl(clock, 0.23, 0.23, 0.07, toonMat('#f6f0e2'), 0, 0, 0.01, 24); face.rotation.x = PI / 2;
  const mp = [makeToon({ jacket: '#3b3f52', pants: '#2c3040', collar: true, tie: '#7c3030', hair: '#3a2a1e', hairStyle: 'side' }, { res: 1.4, maxCache: 6 }),
    makeToon({ jacket: '#4a3b35', pants: '#2f2a28', collar: true, tie: '#2f4f7c' }, { res: 1.4, maxCache: 6 }),
    makeToon({ jacket: '#2f3d4a', pants: '#2a2f38', collar: true, tie: '#6b5a2c', hair: '#8a8a8a', hairStyle: 'side' }, { res: 1.4, maxCache: 6 }),
    makeToon({ jacket: '#56483a', pants: '#2f2a28', collar: true, tie: '#7c3030' }, { res: 1.4, maxCache: 6 }),
    makeToon({ jacket: '#3d4a3c', pants: '#2c3040', collar: true, tie: '#5a2c4a', hair: '#2a1e19', hairStyle: 'side' }, { res: 1.4, maxCache: 6 }),
    makeToon({ jacket: '#444a5e', pants: '#2c3040', collar: true, tie: '#2c5a3a', hair: '#5a4030', hairStyle: 'side' }, { res: 1.4, maxCache: 6 })];
  mp.forEach((m) => { m.mesh.castShadow = true; });
  const XM = [null, { extra: mustache('#5a5a5a', 1.0), key: 'm1' }, null, { extra: mustache('#3a2a1e', 1.2), key: 'm3' }, null, null];
  mp.forEach((m) => root.add(m.root));
  // v3 premium: a real gold medal (metal disc + raised star reflect the room) on a striped ribbon
  const medal = new THREE.Group(); root.add(medal);
  const gold = toonMetal('#e4b04a', { rough: 0.24 }), goldHi = toonMetal('#f4cc66', { rough: 0.18 });
  const disc = cyl(medal, 0.2, 0.2, 0.04, gold, 0, 0, 0, 48); disc.rotation.x = PI / 2;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 12, 48), goldHi); medal.add(rim);
  const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a2 = PI / 2 + (i * PI) / 5, rr = i % 2 ? 0.055 : 0.13; i ? st.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr) : st.moveTo(Math.cos(a2) * rr, Math.sin(a2) * rr); } st.closePath();
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(st, { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1 }), goldHi); star.position.z = 0.02; medal.add(star);
  const ribT = ctex('dh14ribbon', 64, 128, (g, r, W, H) => { g.fillStyle = '#c0392b'; g.fillRect(0, 0, W, H); g.fillStyle = '#f3e6b0'; g.fillRect(W * 0.4, 0, W * 0.2, H); });
  for (const sx of [-1, 1]) { const rb = box(medal, 0.16, 0.5, 0.012, toonMat(ribT), sx * 0.08, 0.38, -0.01); rb.rotation.z = -sx * 0.32; }
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 220, box: [-4.5, 0.5, -4.2, 4.5, 5.2, 2.6], intensity: 2.2 });
  const sun = sunLight(root, { intensity: 2.0 }); sun.aim(0, -1.5, 6, [-0.35, 0.9, -0.75]);   // daylight from the high windows behind the benches
  const tAsk = wt('l12_medals', 0), tMed = wt('l12_medals', 7);
  // v2 minister shot: a target with an emu on it pops up on an easel beside him
  const target = new THREE.Group(); root.add(target);
  { const tt = ctex('dh14target', 512, 512, (g, r, W, H) => { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, W, H); for (let i = 0; i < 10; i++) blotch(g, r() * W, r() * H, 90, '210,190,150', 0.2);
      const cols = ['#c0392b', '#f3ead2', '#c0392b', '#f3ead2', '#c0392b']; cols.forEach((c, k) => { g.beginPath(); g.arc(W / 2, H / 2, 240 - k * 46, 0, TAU); g.fillStyle = c; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); });
      g.save(); g.translate(W / 2 - 92, H / 2 - 175); g.scale(0.3, 0.3); drawEmu(g, { view: 'side', pose: 'stand', eye: 'ring' }); g.restore();
      g.lineWidth = 10; g.strokeStyle = INK; g.strokeRect(5, 5, W - 10, H - 10); });
    tt.wrapS = tt.wrapT = THREE.ClampToEdgeWrapping;
    box(target, 0.66, 0.66, 0.03, [toonMat('#c9b48a'), toonMat('#c9b48a'), toonMat('#c9b48a'), toonMat('#c9b48a'), new THREE.MeshLambertMaterial({ map: tt }), toonMat('#c9b48a')], 0, 0.95, 0);
    for (const [a, b] of [[[-0.3, 0, 0.12], [-0.22, 1.2, 0]], [[0.3, 0, 0.12], [0.22, 1.2, 0]], [[0, 0, -0.35], [0, 1.15, -0.02]]]) rod(target, a, b, 0.018, toonMat('#7a5232'), 6);
    box(target, 0.7, 0.04, 0.08, toonMat('#7a5232'), 0, 0.6, 0.03); }
  const tTarget = nt('n03_minister', 7);
  const seats = [[-1.25, 0, -0.85], [0.05, 0, -0.55], [1.3, 0, -0.85], [-0.75, 0.38, -1.85], [0.9, 0.38, -1.85], [-0.05, 0.76, -2.85]];
  return {
    root,
    shots: {
      medals: {
        bg: new THREE.Color('#5d4a36'), cInf: 10, near: 0.05, far: 60,
        tone: { rim: MOOD.interior.tone.rim, lit: [1.38, 1.14, 0.88], shade: [0.35, 0.35, 0.58], sat: 0.86, term: 0.25, lambert: 0.35, extra: 1, charTint: [1, 0.96, 0.9], charShade: 0.6, charGain: 0.92, headGrad: 0.36, bodyGrad: 0.46, charExtra: 1 },
        cam: (t) => ({ p: [lerp(0.25, 0.1, smooth((t - 36.7) / 2.4)), 1.6, lerp(4.7, 4.35, smooth((t - 36.7) / 2.4))], a: [0, 1.45, -1.2], fov: 48 }),
        focus: () => [0, 1.5, -1.0],
        update(t, camera) {
          SUN = sun.s; winShafts.face(camera); motes.update(t, camera);
          mp.forEach((m, i) => {
            const [x, y, z] = seats[i], asker = i === 1, laugh = t > tMed + 0.1 && !asker;
            const st = { expr: asker ? (t > tAsk + 0.4 ? 'smug' : 'neutral') : laugh ? 'grin' : (i % 2 ? 'stern' : 'neutral'), blink: lid(t, 20 + i), look: asker ? 0 : -0.4 * Math.sign(x),
              arms: asker && t > tAsk + 0.15 ? { L: ARMS.down.L, R: [470, 90], bend: -20 } : ARMS.down, ...(XM[i] || {}) };
            const bob = laugh ? 0.03 * Math.abs(Math.sin((t - tMed) * 12 + i)) : 0;
            put(m, x, y + bob + (asker ? 0.08 : 0), z, st, camera);
          });
          const u = boing((t - tMed) / 0.6); medal.visible = u > 0.001; medal.scale.setScalar(Math.max(u, 0.001));
          medal.position.set(0.05, 2.0, 0.35); medal.rotation.y = 0.25 * Math.sin((t - tMed) * 3); target.visible = false;
        },
      },
      minister: {   // v2, video time: "The defence minister said they'd make good target practice."
        bg: new THREE.Color('#5d4a36'), cInf: 10, near: 0.05, far: 60,
        tone: { rim: MOOD.interior.tone.rim, lit: [1.38, 1.14, 0.88], shade: [0.35, 0.35, 0.58], sat: 0.86, term: 0.25, lambert: 0.35, extra: 1, charTint: [1, 0.96, 0.9], charShade: 0.6, charGain: 0.92, headGrad: 0.36, bodyGrad: 0.46, charExtra: 1 },
        cam: (t) => ({ p: [lerp(0.3, 0.15, smooth((t - 8.4) / 2.6)), 1.6, lerp(4.75, 4.35, smooth((t - 8.4) / 2.6))], a: [-0.02, 1.32, 0.2], fov: 46 }),
        focus: () => [0.1, 1.4, 0.85], slab: 1.2,
        update(t, camera) {
          SUN = sun.s; winShafts.face(camera); motes.update(t, camera); medal.visible = false;
          mp.forEach((m, i) => {
            if (i === 2) { put(m, 0.4, 0, 0.9, { expr: t > tTarget ? 'smug' : 'neutral', blink: lid(t, 22), look: -0.5, arms: t > tTarget - 0.3 ? { L: [70, 250], R: ARMS.down.R, bend: -10 } : ARMS.hips, ...(XM[i] || {}) }, camera); return; }
            const [x, y, z] = seats[i], nod = 0.02 * Math.abs(Math.sin((t - tTarget) * 7 + i)) * (t > tTarget ? 1 : 0);
            put(m, x, y + nod, z, { expr: t > tTarget + 0.2 ? (i % 2 ? 'smug' : 'grin') : 'neutral', blink: lid(t, 20 + i), look: 0.4, arms: ARMS.down, ...(XM[i] || {}) }, camera);
          });
          const u = boing((t - tTarget + 0.15) / 0.6); target.visible = u > 0.001; target.scale.setScalar(Math.max(u, 0.001)); target.position.set(-0.42, 0, 1.05); target.rotation.y = 0.18;
        },
      },
    },
  };
}

// ---------------------------------------------------------------- newspaper (30.5-32.5)
function paperDraw(g, r, W, H) {
  g.fillStyle = '#efe6cf'; g.fillRect(0, 0, W, H); for (let i = 0; i < 16; i++) blotch(g, r() * W, r() * H, 160, r() < 0.5 ? '220,205,170' : '255,250,235', 0.2);
  g.fillStyle = '#231c16'; g.textAlign = 'center';
  fitText(g, 'THE WHEATBELT GAZETTE', W / 2, 92, W - 80, 66, 'bold', 'Georgia, "Times New Roman", serif');
  g.fillRect(40, 112, W - 80, 5); g.font = 'italic 24px Georgia, serif'; g.fillText('WEDNESDAY, NOVEMBER 9, 1932  ·  PRICE 2d', W / 2, 146); g.fillRect(40, 160, W - 80, 3);
  fitText(g, 'THE EMU', W / 2, 300, W - 90, 150, '900', 'Georgia, "Times New Roman", serif');
  fitText(g, 'WAR', W / 2, 410, W - 140, 104, '900', 'Georgia, "Times New Roman", serif');
  g.font = 'italic 34px Georgia, serif'; g.fillText('Army withdraws after 2,500 rounds', W / 2, 466);
  g.fillRect(40, 490, W - 80, 3);
  g.fillStyle = '#d9cdb0'; g.fillRect(60, 515, 400, 420); g.strokeStyle = '#231c16'; g.lineWidth = 5; g.strokeRect(60, 515, 400, 420);
  g.save(); g.beginPath(); g.rect(60, 515, 400, 420); g.clip(); g.translate(30, 500); g.scale(0.44, 0.44); drawEmu(g, { view: 'side', pose: 'stare', eye: 'lid', brow: 'smug' }); g.restore();
  g.fillStyle = '#231c16'; g.font = 'italic 22px Georgia, serif'; g.fillText('"No comment," says local emu.', 260, 965);
  g.fillStyle = 'rgba(35,28,22,0.55)';
  for (let col = 0; col < 2; col++) for (let k = 0; k < 15; k++) { const x = col ? 490 : 490, y = 525 + k * 28 + col * 440; if (y > H - 40) continue; g.fillRect(x, y, (W - 530) * (0.7 + 0.3 * r()), 12); }
  for (let k = 0; k < 4; k++) g.fillRect(60, 995 + k * 28, (W - 120) * (0.6 + 0.4 * r()), 12);
}
function buildNews(root) {
  const burst = ctex('dh14burst', 1024, 1024, (g, r, W, H) => { g.fillStyle = '#f0c46a'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) { const a0 = (i / 24) * TAU, a1 = ((i + 0.5) / 24) * TAU; g.beginPath(); g.moveTo(W / 2, H / 2); g.lineTo(W / 2 + Math.cos(a0) * W, H / 2 + Math.sin(a0) * W); g.lineTo(W / 2 + Math.cos(a1) * W, H / 2 + Math.sin(a1) * W); g.closePath(); g.fillStyle = '#e39a4c'; g.fill(); }
    const v = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7); v.addColorStop(0, 'rgba(255,240,200,0.5)'); v.addColorStop(1, 'rgba(120,60,30,0.35)'); g.fillStyle = v; g.fillRect(0, 0, W, H); });
  burst.wrapS = burst.wrapT = THREE.ClampToEdgeWrapping;
  const bg = plane(root, 9, 9, new THREE.MeshBasicMaterial({ map: burst, color: new THREE.Color(0.78, 0.74, 0.7) }), 0, 0, -3); bg.layers.set(NOINK);
  makeGlow(root, { x: 0, y: -0.2, z: -1.2, size: 3.6, intensity: 0.55, color: 0xffe0a8 });   // light behind the paper
  const pt = ctex('dh14paper', 820, 1120, paperDraw); pt.wrapS = pt.wrapT = THREE.ClampToEdgeWrapping;
  const paper = new THREE.Group(); root.add(paper);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.366, 0.01), [toonMat('#e3d8bd'), toonMat('#e3d8bd'), toonMat('#e3d8bd'), toonMat('#e3d8bd'), new THREE.MeshBasicMaterial({ map: pt }), toonMat('#e3d8bd')]);
  sheet.castShadow = true; paper.add(sheet);
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 60, box: [-1.5, -1.7, -2.6, 1.5, 1.5, -0.5], intensity: 1.6 });
  const sun = sunLight(root, { intensity: 1.6 }); sun.aim(0, 0, 4, [0.3, 0.6, 1]);
  const t0 = 30.5;
  // v2: "Back home, people are laughing" — three readers crack up on the burst before the paper spins in over them
  const folk = [makeToon({ jacket: '#b0503a', pants: '#3a3030', collar: true, tie: '#2f4f7c', hair: '#3a2a1e', hairStyle: 'side' }, { res: 1.7, maxCache: 8 }),
    makeToon(CAST.farmer, { res: 1.7, maxCache: 8 }), makeToon({ jacket: '#4f6f8f', pants: '#2c3040', collar: true }, { res: 1.7, maxCache: 8 })];
  folk.forEach((f) => root.add(f.root));
  const FX = [[-0.36, -0.62, 'ha1', null, 0.1], [0.06, -0.5, 'ha2', XTRA.farmer, 0.25], [0.44, -0.66, 'ha3', { extra: extras(mustache('#3a2a1e', 0.9), flatCap('#3c3f44')), key: 'ha3' }, 0.05]];
  return {
    root,
    shots: {
      news: {
        bg: new THREE.Color('#e39a4c'), cInf: 4, near: 0.05, far: 40,
        tone: { rim: [0, 0, 0], lit: [1.15, 1.1, 1.0], shade: [0.7, 0.68, 0.82], sat: 0.9, term: 0.25, lambert: 0.3, extra: 1, charTint: [1, 1, 1], charShade: 0.9, charGain: 1.0, headGrad: 0.34, bodyGrad: 0.45, charExtra: 1 },
        cam: (t) => ({ p: [0.05, -0.12, lerp(2.75, 2.5, smooth((t - t0 - 0.5) / 1.6))], a: [0.05, -0.12, 0], fov: 40 }),
        focus: () => [0, 0, 0],
        update(t, camera) {
          motes.update(t, camera); SUN = sun.s;
          folk.forEach((f, i) => { const [x, z, , xt, ph] = FX[i], bob = 0.035 * Math.abs(Math.sin(t * 11 + i * 1.7)), out = smooth((t - t0 - 0.1) / 0.35);
            put(f, x, -1.8 + bob - 0.9 * out, z, { expr: 'grin', blink: 0, look: (i - 1) * -0.4, arms: i === 1 ? { L: [150, 520], R: [575, 300], bend: -10 } : { L: [230, 590 - 40 * Math.sin(t * 11 + ph)], R: [370, 590 - 40 * Math.sin(t * 11 + ph)], bend: 60 }, ...(xt || {}) }, camera, out < 0.99 ? 1 : 0); });
          const u = clamp((t - t0) / 0.55), e = easeOut(u); paper.visible = t > t0 - 0.02;
          paper.rotation.set(0, 0, (1 - e) * 4 * PI - 0.06); paper.scale.setScalar((0.06 + 0.94 * e + 0.03 * boing((t - t0 - 0.55) / 0.4) * (u >= 1 ? 1 : 0)) * 0.8);
          paper.position.set(0.02, -0.3, 0);
          bg.rotation.z = t * 0.12;
        },
      },
    },
  };
}

// ---------------------------------------------------------------- coat of arms (51.3-60)
function shieldPath(g, x, y, w, h) {
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w, y + h * 0.62); g.quadraticCurveTo(x + w, y + h * 0.92, x + w / 2, y + h); g.quadraticCurveTo(x, y + h * 0.92, x, y + h * 0.62); g.closePath();
}
function shieldDraw(g, r, W, H) {
  const x = 24, y = 24, w = W - 48, h = H - 48;
  shieldPath(g, x, y, w, h); g.fillStyle = '#f4efe2'; g.fill();
  g.save(); shieldPath(g, x, y, w, h); g.clip();
  const cw = w / 3, ch = h * 0.42;
  const cells = [['#f4efe2', 'cross'], ['#2a4f9a', 'stars'], ['#f4efe2', 'bluecross'], ['#e8b84a', 'bird'], ['#e8b84a', 'swan'], ['#f4efe2', 'lion']];
  cells.forEach(([c, kind], i) => {
    const cx = x + (i % 3) * cw, cy = y + Math.floor(i / 3) * ch; g.fillStyle = c; g.fillRect(cx, cy, cw, ch);
    const mx = cx + cw / 2, my = cy + ch / 2;
    g.lineWidth = 8; g.strokeStyle = INK;
    if (kind === 'cross') { g.fillStyle = '#c0392b'; g.fillRect(mx - 14, cy + 10, 28, ch - 20); g.fillRect(cx + 10, my - 14, cw - 20, 28); }
    if (kind === 'stars') { g.fillStyle = '#f4efe2'; for (const [dx, dy, s] of [[0, -50, 14], [-40, 0, 12], [42, -8, 12], [0, 52, 16], [14, 10, 7]]) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -PI / 2 + (k * PI) / 5, rr = k % 2 ? s * 0.45 : s; g.lineTo(mx + dx + Math.cos(a) * rr, my + dy + Math.sin(a) * rr); } g.closePath(); g.fill(); } }
    if (kind === 'bluecross') { g.fillStyle = '#2a4f9a'; for (let k = 0; k < 4; k++) { g.save(); g.translate(mx, my); g.rotate((k * PI) / 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(-26, -58); g.lineTo(26, -58); g.closePath(); g.fill(); g.restore(); } }
    if (kind === 'bird') { g.fillStyle = '#2b2622'; g.beginPath(); g.ellipse(mx, my, 34, 22, -0.3, 0, TAU); g.fill(); g.beginPath(); g.arc(mx + 30, my - 26, 13, 0, TAU); g.fill(); g.fillStyle = '#f4efe2'; g.fillRect(mx - 30, my - 6, 34, 8); }
    if (kind === 'swan') { g.fillStyle = '#1e1b1a'; g.beginPath(); g.ellipse(mx - 6, my + 18, 40, 20, 0, 0, TAU); g.fill(); g.lineWidth = 12; g.strokeStyle = '#1e1b1a'; g.beginPath(); g.moveTo(mx + 22, my + 10); g.quadraticCurveTo(mx + 30, my - 40, mx + 6, my - 40); g.stroke(); g.fillStyle = '#c0392b'; g.fillRect(mx - 8, my - 44, 12, 7); }
    if (kind === 'lion') { g.fillStyle = '#c0392b'; g.beginPath(); g.ellipse(mx, my + 10, 38, 24, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(mx + 30, my - 22, 20, 0, TAU); g.fill(); g.fillRect(mx - 36, my + 20, 10, 34); g.fillRect(mx + 22, my + 20, 10, 34); }
  });
  g.lineWidth = 6; g.strokeStyle = INK; for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(x + i * cw, y); g.lineTo(x + i * cw, y + 2 * ch); g.stroke(); }
  g.beginPath(); g.moveTo(x, y + ch); g.lineTo(x + w, y + ch); g.stroke(); g.beginPath(); g.moveTo(x, y + 2 * ch); g.lineTo(x + w, y + 2 * ch); g.stroke();
  // ermine-like border
  g.lineWidth = 34; g.strokeStyle = '#f7f3e8'; shieldPath(g, x, y, w, h); g.stroke(); g.fillStyle = '#1e1b1a';
  for (let k = 0; k < 40; k++) { const u = k / 40, px = u < 0.5 ? x + 9 + (w - 18) * u * 2 : x + 9, py = u < 0.5 ? y + 9 : y + 9 + (h * 0.6) * (u - 0.5) * 2; g.fillRect(px - 3, py - 5, 6, 10); if (u >= 0.5) g.fillRect(x + w - 12, py - 5, 6, 10); }
  g.restore();
  g.lineWidth = 12; g.strokeStyle = INK; shieldPath(g, x, y, w, h); g.stroke();
}
function rooDraw(g) {   // a cartoon kangaroo, side view facing +x, design space 600 x 1000, feet on 975
  const col = '#bd7a4b', belly = '#e7bf92', dk = '#8d5634';
  const ink = (w) => { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = g.lineCap = 'round'; g.stroke(); };
  g.beginPath(); g.moveTo(230, 720); g.quadraticCurveTo(80, 820, 40, 960); g.quadraticCurveTo(70, 975, 110, 950); g.quadraticCurveTo(170, 840, 270, 780); g.closePath(); g.fillStyle = dk; g.fill(); ink(9);
  g.beginPath(); g.moveTo(250, 940); g.lineTo(470, 948); g.quadraticCurveTo(495, 965, 470, 975); g.lineTo(240, 975); g.closePath(); g.fillStyle = dk; g.fill(); ink(9);
  g.beginPath(); g.ellipse(300, 760, 120, 150, -0.2, 0, TAU); g.fillStyle = col; g.fill(); ink(9);
  g.beginPath(); g.moveTo(250, 640); g.bezierCurveTo(230, 520, 300, 360, 380, 330); g.bezierCurveTo(440, 360, 450, 520, 420, 660); g.bezierCurveTo(380, 720, 280, 720, 250, 640); g.closePath();
  const gr = g.createLinearGradient(260, 0, 440, 0); gr.addColorStop(0, col); gr.addColorStop(1, '#a8673d'); g.fillStyle = gr; g.fill(); ink(9);
  g.beginPath(); g.ellipse(395, 540, 42, 110, 0.1, 0, TAU); g.fillStyle = belly; g.fill();
  g.beginPath(); g.moveTo(410, 460); g.quadraticCurveTo(480, 480, 470, 540); ink(22); g.beginPath(); g.moveTo(410, 460); g.quadraticCurveTo(480, 480, 470, 540); g.lineWidth = 12; g.strokeStyle = col; g.stroke();
  g.beginPath(); g.ellipse(352, 168, 26, 70, -0.25, 0, TAU); g.fillStyle = col; g.fill(); ink(8); g.beginPath(); g.ellipse(352, 175, 12, 46, -0.25, 0, TAU); g.fillStyle = '#e7a98a'; g.fill();
  g.beginPath(); g.ellipse(395, 270, 78, 62, 0.15, 0, TAU); g.fillStyle = col; g.fill(); ink(9);
  g.beginPath(); g.ellipse(465, 300, 52, 34, 0.25, 0, TAU); g.fillStyle = col; g.fill(); ink(8);
  g.beginPath(); g.ellipse(508, 300, 14, 11, 0, 0, TAU); g.fillStyle = INK; g.fill();
  g.beginPath(); g.ellipse(316, 168, 24, 66, -0.55, 0, TAU); g.fillStyle = col; g.fill(); ink(8);
  g.beginPath(); g.ellipse(410, 255, 23, 25, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); ink(5); g.beginPath(); g.arc(418, 258, 9, 0, TAU); g.fillStyle = INK; g.fill();
  g.beginPath(); g.moveTo(470, 326); g.quadraticCurveTo(488, 334, 500, 324); ink(5);
}
function buildArms(root) {
  const rays = ctex('dh14rays', 1024, 1536, (g, r, W, H) => { g.fillStyle = '#1f3566'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 36; i++) { const a0 = (i / 36) * TAU, a1 = ((i + 0.5) / 36) * TAU; g.beginPath(); g.moveTo(W / 2, H * 0.42); g.lineTo(W / 2 + Math.cos(a0) * H, H * 0.42 + Math.sin(a0) * H); g.lineTo(W / 2 + Math.cos(a1) * H, H * 0.42 + Math.sin(a1) * H); g.closePath(); g.fillStyle = 'rgba(70,110,180,0.45)'; g.fill(); }
    const v = g.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.42, H * 0.6); v.addColorStop(0, 'rgba(250,215,140,0.55)'); v.addColorStop(0.5, 'rgba(250,215,140,0.08)'); v.addColorStop(1, 'rgba(10,20,40,0.5)'); g.fillStyle = v; g.fillRect(0, 0, W, H); });
  rays.wrapS = rays.wrapT = THREE.ClampToEdgeWrapping;
  const bg = plane(root, 12, 18, new THREE.MeshBasicMaterial({ map: rays, color: new THREE.Color(1.12, 1.08, 1.0) }), 0, 2.4, -3); bg.layers.set(NOINK);
  makeGlow(root, { x: 0, y: 2.0, z: -1.4, size: 7.0, intensity: 0.75, color: 0xffd27a }); makeGlow(root, { x: 0, y: 3.1, z: -0.4, size: 1.6, intensity: 0.8, color: 0xffe6a0 });   // gold light behind the arms + the star
  const shieldTex = ctex('dh14shield', 600, 720, shieldDraw); shieldTex.wrapS = shieldTex.wrapT = THREE.ClampToEdgeWrapping;
  const shield = plane(root, 1.5, 1.8, new THREE.MeshLambertMaterial({ map: shieldTex, alphaTest: 0.5 }), 0, 1.75, 0.05); shield.layers.set(NOINK); shield.castShadow = true;
  shield.material = cardShade(shield.material, { grad: false });   // a flat drawing: no toon side gradient
  const s = new THREE.Shape(); const sw = 0.8, sh = 0.96; s.moveTo(-sw, sh); s.lineTo(sw, sh); s.lineTo(sw, -sh * 0.24); s.quadraticCurveTo(sw, -sh * 0.84, 0, -sh); s.quadraticCurveTo(-sw, -sh * 0.84, -sw, -sh * 0.24); s.closePath();
  const back = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), toonMetal('#d6a440', { rough: 0.28 })); back.position.set(0, 1.75, -0.12); back.castShadow = back.receiveShadow = true; root.add(back);
  const star = new THREE.Shape(); for (let i = 0; i < 14; i++) { const a = PI / 2 + (i * PI) / 7, rr = i % 2 ? 0.13 : 0.3; i ? star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : star.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } star.closePath();
  const starM = new THREE.Mesh(new THREE.ExtrudeGeometry(star, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 }), toonMetal('#f3c850', { rough: 0.2 })); starM.position.set(0, 3.12, 0); starM.castShadow = true; root.add(starM);
  for (let i = 0; i < 6; i++) { const seg = cyl(root, 0.07, 0.07, 0.26, i % 2 ? toonMat('#2a4f9a') : toonMetal('#e8b84a', { rough: 0.3 }), -0.65 + i * 0.26, 2.8, 0, 12); seg.rotation.z = PI / 2 + 0.5; }
  // wattle: green sprays + instanced gold puff-balls, a scroll
  const leafM = toonMat('#6f9a58'), ballM = toonMat('#f2c43c');
  const r = rng(77), balls = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 1), ballM, 260); balls.castShadow = true; root.add(balls);
  const M4 = new THREE.Matrix4();
  for (let i = 0; i < 260; i++) { const side = i % 2 ? 1 : -1, u = r(), x = side * (0.25 + u * 1.9), y = 0.32 + Math.sin(u * PI) * 0.5 + (r() - 0.5) * 0.35; M4.makeTranslation(x, y, 0.15 + r() * 0.3); balls.setMatrixAt(i, M4); }
  for (let i = 0; i < 22; i++) { const side = i % 2 ? 1 : -1, u = r(); const lf = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), leafM); lf.scale.set(0.24, 0.05, 0.08); lf.position.set(side * (0.3 + u * 1.8), 0.3 + Math.sin(u * PI) * 0.45, 0.12); lf.rotation.z = side * (0.3 + r() * 0.8); lf.castShadow = true; root.add(lf); }
  const scrollT = ctex('dh14scroll', 1024, 160, (g, rr, W, H) => { g.fillStyle = '#e9c66a'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);
    g.fillStyle = '#2b2116'; g.textAlign = 'center'; fitText(g, 'AUSTRALIA', W / 2, H * 0.68, W - 120, 100, 'bold', 'Georgia, serif'); });
  const scroll = box(root, 2.4, 0.36, 0.08, [toonMat('#c9a24a'), toonMat('#c9a24a'), toonMat('#c9a24a'), toonMat('#c9a24a'), toonMat(scrollT), toonMat('#c9a24a')], 0, 0.18, 0.35, 0.02);
  void scroll;
  box(root, 6, 0.1, 3, toonMat('#2a4a3a'), 0, -0.05, 0.2);
  const roo = drawnCard('roo', rooDraw, 2.25, 1.2); roo.position.set(-1.3, 0.26, 0.15); root.add(roo);
  const emu = makeEmu({ H: 2.0, res: 1.1, maxCache: 8 }); root.add(emu.root);
  const motes = makeMotes(root, { n: 160, box: [-2.6, 0.2, -1.6, 2.6, 3.6, 1.6], size: 0.012, color: 0xffd890, intensity: 2.2, rise: 0.05 });   // gold specks
  const sun = sunLight(root, { intensity: 2.0 }); sun.aim(0, 0.5, 4, [-0.5, 0.75, 1]);
  const key = new THREE.SpotLight(0xffe2b0, 4.5, 0, 0.45, 0.75, 2); key.position.set(2.6, 3.4, 2.6); key.target.position.set(0.9, 1.8, 0.15); root.add(key, key.target);   // warm accent on the emu
  const tStand = wt('l17_arms', 4), tUn = wt('l18_undefeated', 0);
  const V = (x, y, z) => root.localToWorld(new THREE.Vector3(x, y, z));
  return {
    root,
    shots: {
      arms: {
        bg: new THREE.Color('#1f3566'), cInf: 9, near: 0.05, far: 60,
        tone: { rim: [0.3, 0.24, 0.16], lit: [1.42, 1.22, 0.98], shade: [0.36, 0.4, 0.68], sat: 0.9, term: 0.25, lambert: 0.35, extra: 1, charTint: [1.02, 0.98, 0.92], charShade: 0.64, charGain: 0.95, headGrad: 0.34, bodyGrad: 0.45, charExtra: 1 },
        cam: (t) => { const u = smooth((t - (tUn - 0.85)) / 2.2); return { p: [lerp(0.2, 1.0, u), lerp(1.75, 1.95, u), lerp(lerp(9.4, 8.7, smooth((t - 51.3) / 3)), 1.75, u)], a: [lerp(0.1, 0.98, u), lerp(1.7, 1.88, u), 0], fov: 42 }; },   // v2: ends centred on his face
        focus: (t) => { const k = smooth((t - (tUn - 0.7)) / 0.8); return [lerp(0, 0.85, k), lerp(1.75, 1.85, k), lerp(0, 0.15, k)]; },
        update(t, camera) {
          SUN = sun.s; motes.update(t, camera);
          const w = clamp((t - 51.35) / (tStand - 51.35 + 0.15)), ex = lerp(3.4, 1.22, 1 - (1 - w) ** 2);
          const state = w < 1 ? { view: 'side', pose: 'walk', ph: ex * 3.2 } : { view: 'side', pose: t > tUn - 0.05 ? 'stare' : 'stand' };
          emu.root.position.copy(root.worldToLocal(V(ex, 0.26, 0.15))); emu.root.visible = true;
          emu.set({ ...state, flip: true, hat: 'slouch', medal: true, eye: t > tUn - 0.05 ? 'lid' : 'ring', brow: t > tUn - 0.05 ? 'smug' : null, look: -0.5, blink: t > tUn - 0.05 ? 0 : lid(t, 3) });
          emu.face(camera);
          roo.lookAt(camera.position.x, roo.getWorldPosition(new THREE.Vector3()).y, camera.position.z);
        },
      },
    },
  };
}

// ---------------------------------------------------------------- v2: bowling alley ("It's like bowling, if the pins could run.")
// Emus are the pins (a 4.6x-scale lane: 5 m wide, pins 1.35 m apart); the ball rolls in from the lens, they scatter on "run".
function buildAlley(root) {
  const laneT = ctex('dh14lane', 512, 2048, (g, r, W, H) => {
    for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#e2b277' : '#d8a467'; g.fillRect((i * W) / 16, 0, W / 16 + 1, H); }
    for (let i = 0; i < 40; i++) blotch(g, r() * W, r() * H, 120, r() < 0.5 ? '170,110,60' : '255,230,190', 0.12);
    g.fillStyle = '#5a2f22'; for (let k = 0; k < 7; k++) { const x = W * (0.2 + k * 0.1), y = H * 0.62 - Math.abs(k - 3) * 40; g.beginPath(); g.moveTo(x, y - 34); g.lineTo(x - 12, y + 16); g.lineTo(x + 12, y + 16); g.closePath(); g.fill(); }
    for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(W * (0.3 + k * 0.1), H * 0.82, 7, 0, TAU); g.fill(); }
  });
  laneT.wrapS = laneT.wrapT = THREE.ClampToEdgeWrapping;
  const lane = plane(root, 5, 26, toonMat(laneT), 0, 0, -3); lane.rotation.x = -PI / 2;
  const gut = toonMat('#3c3a44'), div = toonMat('#d9d2c4'), side = toonMat(laneT);
  for (const sx of [-1, 1]) {
    box(root, 0.9, 0.12, 26, gut, sx * 2.95, -0.06, -3, 0.04);                       // gutters
    box(root, 0.5, 0.42, 26, div, sx * 3.65, 0.21, -3, 0.06);                        // capping / ball return
    const l2 = plane(root, 5, 26, side, sx * 6.4, 0, -3); l2.rotation.x = -PI / 2;   // the neighbouring lanes
    box(root, 0.9, 0.12, 26, gut, sx * 9.35, -0.06, -3, 0.04);
  }
  // pin deck + masking unit with a sign, the dark pit behind
  const mask = canvasMat('alleysign', 1024, 256, (g, r, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b3f8f'); gr.addColorStop(1, '#1d2a66'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    ['#f2c232', '#e0582c', '#3fb8a8'].forEach((c, k) => { g.fillStyle = c; g.fillRect(0, H - 40 + k * 12, W, 9); });
  }, { basic: true });
  mask.color = new THREE.Color(1.15, 1.15, 1.15);
  box(root, 20, 2.4, 0.3, [toonMat('#22305f'), toonMat('#22305f'), toonMat('#22305f'), toonMat('#22305f'), mask, toonMat('#22305f')], 0, 4.4, -12.2);
  box(root, 20, 6, 0.3, toonMat('#1b1726'), 0, 3, -15.6);
  for (const x of [-7.5, -2.6, 2.6, 7.5]) makeGlow(root, { x, y: 4.2, z: -11.6, size: 3.2, intensity: 0.4, color: 0xffd9a0 });
  const deckL = new THREE.PointLight(0xfff0d0, 9, 14, 2); deckL.position.set(0, 3.2, -7.5); root.add(deckL);
  for (let k = 0; k < 5; k++) { const L = new THREE.PointLight(0xffd6a0, 2.2, 9, 2); L.position.set(0, 3.6, 6 - k * 4); root.add(L); }
  box(root, 26, 0.3, 30, toonMat('#2a2140'), 0, 5.9, -3);   // ceiling
  // the ball (dark blue, glossy) with three finger holes
  const ball = new THREE.Group(); root.add(ball);
  const bm = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 20), toonMetal('#2d4fa8', { rough: 0.3 })); bm.castShadow = true; ball.add(bm);
  for (const [a, b] of [[0.25, 0.15], [0.25, -0.15], [-0.05, 0]]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), toonMat('#0d1022')); h.position.set(0.48 * Math.cos(a) * Math.cos(b), 0.48 * Math.sin(a), 0.48 * Math.cos(a) * Math.sin(b)); ball.add(h); }
  const flock = makeEmuFlock(16, { H: 1.8, res: 0.6 }); root.add(flock.root);
  const puffs = makePuffs(root, 40);
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 120, box: [-4, 0.3, -10, 4, 4, 6], intensity: 1.8 });
  const sun = sunLight(root, { intensity: 1.8 }); sun.aim(0, -5, 12, [0.25, 1, 0.55]);
  const pins = []; for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) pins.push({ x: (i - row / 2) * 1.35, z: -8 - row * 1.17, side: i - row / 2 === 0 ? (row % 2 ? 1 : -1) : Math.sign(i - row / 2), k: pins.length });
  const tRel = nt('n19_bowling', 0) - 0.05, tRun = nt('n19_bowling', 5) + 0.1, ballZ = (t) => lerp(5.5, -16, clamp((t - tRel) / 2.1));
  return {
    root,
    shots: {
      bowling: {
        bg: new THREE.Color('#1b1726'), cInf: 14, near: 0.05, far: 80,
        tone: { rim: [0.25, 0.2, 0.3], lit: [1.4, 1.2, 0.98], shade: [0.4, 0.38, 0.66], sat: 0.95, term: 0.25, lambert: 0.35, extra: 1, charTint: [1.02, 0.98, 0.92], charShade: 0.64, charGain: 0.96, headGrad: 0.34, bodyGrad: 0.45, charExtra: 1 },
        cam: (t) => ({ p: [lerp(0.55, 0.3, smooth((t - 53.4) / 2)), lerp(1.45, 1.25, smooth((t - 53.4) / 2)), lerp(5.6, 4.6, smooth((t - 53.4) / 2))], a: [0, 0.95, -10], fov: 34 }),
        focus: (t) => [0, 1.0, Math.max(-9, ballZ(t) - 1)],
        update(t, camera) {
          SUN = sun.s; motes.update(t, camera);
          const z = ballZ(t); ball.position.set(0.05 * Math.sin(t * 2), 0.5, z); ball.rotation.x = (z - 5.5) / 0.5;
          flock.begin(camera); const c = camera.getWorldPosition(new THREE.Vector3()); void c;
          for (const p of pins) {
            const u = t - tRun - p.k * 0.025;
            if (u <= 0) { flock.add(p.x, 0, p.z, { view: 'front', pose: 'stand', hd: 0, eye: t > tRun - 0.5 ? 'ring' : null, brow: t > tRun - 0.5 ? null : 'smug' }); continue; }
            const hd = p.side * PI / 2, d = 7.5 * u, x = p.x + p.side * d;
            flock.add(x, 0.35 * Math.abs(Math.sin(u * 12)) * Math.exp(-u * 2), p.z, { view: 'side', pose: 'run', ph: d * 2.8 + p.k, hd });
          }
          flock.end();
          puffs.begin(); for (const p of pins) puffs.burst(t, tRun + p.k * 0.025, [p.x, 0, p.z], { n: 1, size: 0.8, spread: 0.4, rise: 0.3, dur: 0.8, seed: 90 + p.k });
          puffs.burst(t, tRel + 2.1, [0, 0.5, -15.2], { n: 6, size: 1.2, spread: 1.0, rise: 0.4, dur: 0.9, seed: 7 }); puffs.end();
        },
      },
    },
  };
}

export function buildRooms(roots) {
  return { tent: buildTent(roots.tent), parl: buildParl(roots.parl), news: buildNews(roots.news), arms: buildArms(roots.arms), alley: buildAlley(roots.alley) };
}
