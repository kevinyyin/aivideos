// An ocean liner's promenade deck arriving in New York, toon look (dh015): teak planks, a white railing along the
// port side (z = 1.6), a lifeboat on davits, a ventilator cowl, a red + black funnel, deck chairs, a lifebuoy, the sea
// (a flat painted plane with a scrolling swell + wake) and the Manhattan skyline (a cut-out card) far off the rail
// under a painted morning sky (the video adds makeSky). People stand at z ≈ 0.6 … 1.3; cameras look +z over the rail.
import * as THREE from 'three';
import { toonMat } from '@engine/toon/shade.js';
import { ctex, fitText } from '@engine/toon/paint.js';
import { box, cyl, plane, sun } from '@engine/toon/kit.js';
import { manhattan } from './paint1925.js';

const PI = Math.PI;
export const DECK = { rail: 1.6 };

export function buildDeck(root) {
  const teak = toonMat(ctex('teak', 512, 512, (g, r, W, H) => { for (let y = 0; y < H; y += 32) { g.fillStyle = `hsl(30, 40%, ${48 + r() * 8}%)`; g.fillRect(0, y, W, 32); g.fillStyle = '#3a2a1e'; g.fillRect(0, y, W, 3); } }, [6, 3]));
  const d = plane(root, 30, 8, teak, 0, 0, -2); d.rotation.x = -PI / 2;
  const white = toonMat('#f4f1ea'), red = toonMat('#c8322e'), black = toonMat('#1e1e24');
  // railing: posts + three rails + the hull's white bulwark below
  box(root, 30, 0.5, 0.1, white, 0, 0.25, DECK.rail + 0.04);
  for (let x = -15; x <= 15; x += 1.2) cyl(root, 0.03, 0.03, 1.05, white, x, 0.52, DECK.rail, 6);
  for (const y of [0.55, 0.8, 1.05]) { const r = cyl(root, 0.025, 0.025, 30, white, 0, y, DECK.rail, 6); r.rotation.z = PI / 2; }
  // the superstructure wall behind, with portholes and a door
  const wallM = toonMat(ctex('superWall', 512, 256, (g, r, W, H) => { g.fillStyle = '#f2eee6'; g.fillRect(0, 0, W, H); for (let x = 40; x < W; x += 110) { g.fillStyle = '#2f3f5a'; g.beginPath(); g.arc(x, H * 0.45, 26, 0, 7); g.fill(); g.strokeStyle = '#c9a35a'; g.lineWidth = 8; g.stroke(); } g.fillStyle = '#d8d2c4'; g.fillRect(0, H - 18, W, 18); }, [5, 1]));
  box(root, 30, 2.6, 0.2, wallM, 0, 1.3, -3.2); box(root, 30, 0.2, 2.2, white, 0, 2.7, -2.3).castShadow = true;
  for (let x = -14; x < 15; x += 2.4) cyl(root, 0.05, 0.05, 2.6, white, x, 1.3, -1.25, 8);
  // lifeboat on davits overhead, a ventilator cowl, the funnel, deck chairs, a lifebuoy on the rail
  const boat = new THREE.Group(); boat.position.set(-3.5, 3.6, -0.6); root.add(boat);
  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 3.6, 6, 12), white); hull.rotation.z = PI / 2; hull.scale.set(1, 1, 0.7); hull.castShadow = true; boat.add(hull);
  box(boat, 4.2, 0.12, 0.9, toonMat('#a87a4a'), 0, 0.4, 0);
  for (const x of [-2.2, 2.2]) { const dv = cyl(root, 0.06, 0.06, 2.4, white, -3.5 + x, 2.8, -1.2, 8); dv.rotation.x = 0.35; }
  const vent = new THREE.Group(); vent.position.set(4.2, 0, -1.8); root.add(vent);
  cyl(vent, 0.22, 0.22, 1.6, white, 0, 0.8, 0, 16); const cowl = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.16, 10, 18, PI), white); cowl.position.set(0, 1.75, 0.15); cowl.rotation.y = PI / 2; vent.add(cowl);
  const fun = new THREE.Group(); fun.position.set(1.0, 2.8, -6); root.add(fun);
  cyl(fun, 1.4, 1.5, 6, red, 0, 3, 0, 24); cyl(fun, 1.42, 1.42, 1.2, black, 0, 5.4, 0, 24);
  for (const x of [-7, -5.6]) { const c = new THREE.Group(); c.position.set(x, 0, -1.6); c.rotation.y = 0.2; root.add(c); box(c, 0.6, 0.06, 1.1, toonMat('#a87a4a'), 0, 0.4, 0); const bk = box(c, 0.6, 0.7, 0.06, toonMat(ctex('chairStripe', 64, 64, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#f4efe4' : '#2f6a9a'; g.fillRect(i * 16, 0, 16, 64); } })), 0, 0.75, -0.5); bk.rotation.x = -0.4; }
  const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 10, 24), toonMat(ctex('buoy', 128, 32, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f4efe4' : '#d8402e'; g.fillRect(i * 16, 0, 16, 32); } }))); buoy.position.set(2.6, 0.82, DECK.rail - 0.08); buoy.castShadow = true; root.add(buoy);
  const lbl = plane(root, 0.5, 0.1, toonMat(ctex('buoyName', 256, 52, (g, r, W, H) => { g.fillStyle = '#1e2a4a'; g.textAlign = 'center'; fitText(g, 'S.S. CONTINENTAL', W / 2, H * 0.75, W - 10, 40, 'bold', 'Georgia, serif'); }), { transparent: true }), 2.6, 1.18, DECK.rail - 0.02); void lbl;
  // the sea + the skyline
  const sea = toonMat(ctex('sea25', 512, 512, (g, r, W, H) => { g.fillStyle = '#3f78a8'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(220,240,255,0.5)'; g.lineWidth = 4; for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 8, x + 28, y); g.stroke(); } }, [40, 40]));
  const water = plane(root, 1200, 1200, sea, 0, -3.0, 600); water.rotation.x = -PI / 2; water.receiveShadow = false;
  const sky = plane(root, 520, 195, new THREE.MeshBasicMaterial({ map: manhattan(), transparent: true, alphaTest: 0.1, fog: true }), 60, 60, 540); sky.rotation.y = PI;
  sky.material.color.set(0x9a9cc0);
  const s = sun(root, [-6, 9, 8], [0, 0, 0], { half: 9, map: 4096, far: 40, color: 0xffe2c0, hemi: [0xcfe0ff, 0x8a7a6a, 0.9] });
  return { root, sun: s, water, bg: new THREE.Color(0xbcd4ec), fog: new THREE.Fog(0xe6dcd6, 60, 900),
    update(t) { water.material.map.offset.set(t * 0.01, -t * 0.03); } };
}
