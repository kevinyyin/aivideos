// A first-class night-train compartment in 1925, toon look (dh015): walnut panelling, two facing green velvet benches,
// a brass luggage rack with a suitcase, a little table under the window, a reading lamp, lace antimacassars, and a
// window (x = -1.15) on a moonlit valley that scrolls past (update(t, speed)). The moon key comes in through the
// window; the lamp adds a warm pool. Compartment x -1.15 … 1.15, z -1.0 … 1.0, ceiling 2.5; benches face ±z.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun, glow, lamp } from '@engine/toon/kit.js';
import { moonValley } from './paint1925.js';

const PI = Math.PI;
export const TRAIN = { seatA: [-0.45, -0.72], seatB: [-0.45, 0.72], seatY: 0.46, win: -1.15 };

export function buildTrain(root) {
  const walnut = toonMat(ctex('walnut', 256, 256, (g, r, W, H) => { g.fillStyle = '#6a3e24'; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 6) { g.fillStyle = `rgba(${40 + r() * 30},20,10,${0.15 + r() * 0.2})`; g.fillRect(0, y, W, 2 + r() * 3); } g.strokeStyle = '#d4b062'; g.lineWidth = 4; g.strokeRect(14, 14, W - 28, H - 28); }, [2, 1]));
  const velvet = toonMat('#2f6a4e'), brass = toonMetal('#d6b25e', { rough: 0.3 }), lace = toonMat('#f4efe4');
  const fl = plane(root, 2.4, 2.2, toonMat(ctex('trainRug', 256, 256, (g, r, W, H) => { g.fillStyle = '#6a2a30'; g.fillRect(0, 0, W, H); g.strokeStyle = '#c9a35a'; g.lineWidth = 6; for (let i = 0; i < 4; i++) g.strokeRect(20 + i * 24, 20 + i * 24, W - 40 - i * 48, H - 40 - i * 48); })), 0, 0, 0); fl.rotation.x = -PI / 2;
  box(root, 2.4, 0.1, 2.2, toonMat('#efe6d6'), 0, 2.55, 0).castShadow = false;
  box(root, 0.1, 2.6, 2.2, walnut, 1.2, 1.3, 0);                         // corridor wall (behind the camera)
  for (const z of [-1.08, 1.08]) box(root, 2.4, 2.6, 0.1, walnut, 0, 1.3, z);
  // window wall: panels below + above the window, the frame, a blind rolled up, curtains
  const W0 = TRAIN.win;
  box(root, 0.1, 0.85, 2.2, walnut, W0, 0.425, 0); box(root, 0.1, 0.65, 2.2, walnut, W0, 2.27, 0);
  for (const z of [-0.85, 0.85]) box(root, 0.1, 1.1, 0.5, walnut, W0, 1.4, z);
  const view = plane(root, 4.0, 1.6, new THREE.MeshBasicMaterial({ map: moonValley() }), W0 - 0.6, 1.45, 0); view.rotation.y = PI / 2;
  view.material.map.wrapS = THREE.RepeatWrapping; view.material.map.repeat.set(0.5, 1); view.material.color.setScalar(1.35);
  for (const [w, h, y, z] of [[0.06, 1.15, 1.4, -0.58], [0.06, 1.15, 1.4, 0.58], [0.06, 0.06, 1.95, 0], [0.06, 0.06, 0.88, 0]]) box(root, 0.08, h, w === 0.06 && h === 0.06 ? 1.2 : w, brass, W0 + 0.04, y, z);
  for (const s of [-1, 1]) box(root, 0.08, 1.4, 0.22, toonMat('#7a2a34'), W0 + 0.09, 1.55, s * 0.62, 0.04);
  // the two benches (seat + back + headrest lace) and the folding table under the window
  for (const s of [-1, 1]) {
    box(root, 2.2, 0.16, 0.6, velvet, -0.05, 0.42, s * 0.74, 0.05);
    box(root, 2.2, 0.85, 0.14, velvet, -0.05, 0.95, s * 1.0, 0.06);
    for (const x of [-0.45, 0.45]) box(root, 0.36, 0.22, 0.03, lace, x, 1.22, s * 0.92);
    box(root, 2.2, 0.42, 0.56, walnut, -0.05, 0.17, s * 0.74);
  }
  box(root, 0.5, 0.04, 0.7, walnut, W0 + 0.3, 0.78, 0); box(root, 0.06, 0.2, 0.06, brass, W0 + 0.1, 0.68, 0);
  // luggage rack (brass rails) above the far bench with a leather suitcase
  for (const y of [2.05, 2.15]) for (const z of [-0.98, -0.72]) { const r = cyl(root, 0.012, 0.012, 2.1, brass, -0.05, y, z, 6); r.rotation.z = PI / 2; }
  const suit = new THREE.Group(); suit.position.set(0.15, 2.28, -0.85); root.add(suit);
  box(suit, 0.75, 0.24, 0.45, toonMat('#7a4a2a'), 0, 0, 0, 0.04); for (const x of [-0.25, 0.25]) box(suit, 0.05, 0.25, 0.46, toonMat('#4a2a18'), x, 0, 0);
  // reading lamp on the bulkhead + the moon key through the window
  const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.8, 1.2) });
  const lb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), lampM); lb.position.set(0.7, 2.05, -1.0); root.add(lb);
  box(root, 0.16, 0.08, 0.1, brass, 0.7, 2.13, -1.0);
  glow(root, '255,214,150', 0.8, 0.7, 2.05, -0.95, 0.6);
  lamp(root, 0xffcf90, 2.2, 3.0, 0.5, 1.9, -0.6);
  const s = sun(root, [W0 + 0.05, 2.1, 0.4], [0.6, 0.4, -0.2], { half: 2.0, map: 2048, far: 6, color: 0x9fb4f0, hemi: [0x6a7ab8, 0x3a2a30, 0.7] });
  return {
    root, sun: s, view,
    update(t, speed = 1) { view.material.map.offset.x = -t * 0.12 * speed; },
    bg: new THREE.Color(0x101a40), fog: null,
  };
}
