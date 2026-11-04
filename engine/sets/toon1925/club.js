// A modern nightclub entrance at night, toon look (dh015's "you" analogy; modern, despite the folder name): a brick
// wall, a steel door with a neon sign over it, a red velvet rope on two brass stanchions, a queue along the wall, a
// wet sidewalk + kerb, a street lamp, posters. The rope runs along x at z = 0.9 between x = 0.1 and 1.5 (stanchion at
// 1.5 unhooks); the door is at x = 0.8 in the wall (z = -0.6); the queue stands at x = -0.4 … -4, z ≈ 0.4.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, fitText } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun, glow, lamp } from '@engine/toon/kit.js';
import { makeGlow } from '@engine/toon/light.js';

const PI = Math.PI;
export const CLUB = { door: [0.8, -0.6], ropeZ: 0.9, ropeX: [0.1, 1.5], queueZ: 0.35 };

export function buildClub(root) {
  const brick = toonMat(ctex('clubBrick', 512, 512, (g, r, W, H) => { g.fillStyle = '#3a2a30'; g.fillRect(0, 0, W, H); for (let j = 0; j < 16; j++) for (let x = (j % 2) * -32; x < W; x += 64) { g.fillStyle = `hsl(${352 + r() * 12}, 35%, ${26 + r() * 8}%)`; g.fillRect(x + 3, j * 32 + 3, 58, 26); } }, [6, 3]));
  box(root, 14, 6, 0.3, brick, 0, 3, -0.75);
  const walk = toonMat(ctex('clubWalk', 512, 512, (g, r, W, H) => { g.fillStyle = '#4a4a56'; g.fillRect(0, 0, W, H); g.strokeStyle = '#33333e'; g.lineWidth = 6; for (let x = 0; x < W; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let i = 0; i < 18; i++) { const gr = g.createRadialGradient(r() * W, r() * H, 0, r() * W, r() * H, 60); gr.addColorStop(0, 'rgba(120,140,220,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); } }, [5, 2]));
  const sw = plane(root, 14, 4, walk, 0, 0, 1.2); sw.rotation.x = -PI / 2;
  box(root, 14, 0.15, 0.3, toonMat('#7a7a84'), 0, 0.075, 3.25);
  const road = plane(root, 14, 6, toonMat('#2a2a34'), 0, -0.05, 6.4); road.rotation.x = -PI / 2;
  // the door + its frame + a little canopy, the neon sign
  const door = box(root, 1.1, 2.2, 0.1, toonMat('#22242c', { shiny: 40 }), CLUB.door[0], 1.1, -0.58);
  box(root, 1.3, 0.12, 0.14, toonMetal('#c9cdd3', { rough: 0.3 }), CLUB.door[0], 2.26, -0.56);
  ball(root, 0.04, toonMetal('#d6b25e'), CLUB.door[0] + 0.4, 1.1, -0.5, 8);
  const canopy = box(root, 2.6, 0.12, 1.3, toonMat('#1a1a22'), CLUB.door[0], 2.75, 0.0); canopy.castShadow = true;
  const neon = new THREE.MeshBasicMaterial({ map: ctex('neonVelvet', 512, 160, (g, r, W, H) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.textAlign = 'center'; g.shadowColor = '#ff3ab0'; g.shadowBlur = 24; g.fillStyle = '#ffc6ec';
    fitText(g, 'VELVET', W / 2, H * 0.72, W - 40, 120, 'bold', "'Avenir Next', sans-serif");
  }), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
  neon.color.setScalar(2.2);
  const sign = plane(root, 2.2, 0.7, neon, CLUB.door[0], 3.3, -0.58); void sign;
  makeGlow(root, { x: CLUB.door[0], y: 3.3, z: -0.5, size: 4.5, intensity: 0.5, color: 0xff5ac0 });
  lamp(root, 0xff6ac8, 3.0, 6, CLUB.door[0], 3.0, 0.6);
  // velvet rope + brass stanchions (the right stanchion's hook unclips: rope.userData.open(k))
  const brass = toonMetal('#e0b85a', { rough: 0.22 }), velvet = toonMat('#b0182c', { shiny: 30, spec: 0x80303a });
  const stan = (x) => { const g = new THREE.Group(); g.position.set(x, 0, CLUB.ropeZ); root.add(g); cyl(g, 0.16, 0.18, 0.04, brass, 0, 0.02, 0, 20); cyl(g, 0.03, 0.03, 0.9, brass, 0, 0.47, 0, 10); ball(g, 0.06, brass, 0, 0.95, 0, 12); return g; };
  stan(CLUB.ropeX[0]); stan(CLUB.ropeX[1]); stan(-1.3);
  const curve = (x0, x1, sag) => new THREE.QuadraticBezierCurve3(new THREE.Vector3(x0, 0.9, CLUB.ropeZ), new THREE.Vector3((x0 + x1) / 2, 0.9 - sag, CLUB.ropeZ), new THREE.Vector3(x1, 0.9, CLUB.ropeZ));
  const fixed = new THREE.Mesh(new THREE.TubeGeometry(curve(-1.3, CLUB.ropeX[0], 0.28), 20, 0.035, 8), velvet); fixed.castShadow = true; root.add(fixed);
  const rope = new THREE.Mesh(new THREE.TubeGeometry(curve(CLUB.ropeX[0], CLUB.ropeX[1], 0.3), 20, 0.035, 8), velvet); rope.castShadow = true; root.add(rope);
  /** k 0 = hooked across, 1 = unhooked and hanging from the left stanchion */
  rope.userData.open = (k) => {
    const x0 = CLUB.ropeX[0], ex = CLUB.ropeX[1] + (x0 + 0.05 - CLUB.ropeX[1]) * k, ey = 0.9 - 0.75 * k * k, ez = CLUB.ropeZ + 0.25 * Math.sin(k * PI);
    const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x0, 0.9, CLUB.ropeZ), new THREE.Vector3((x0 + ex) / 2, Math.min(0.9, ey) - 0.3 * (1 - k), (CLUB.ropeZ + ez) / 2), new THREE.Vector3(ex, ey, ez));
    rope.geometry.dispose(); rope.geometry = new THREE.TubeGeometry(c, 20, 0.035, 8);
  };
  // posters on the wall, a street lamp, a parked scooter shape
  for (const [x, c1, c2, txt] of [[-2.2, '#2a6ab0', '#f2c232', 'LIVE DJ'], [-3.6, '#c9473e', '#f4efe4', 'FRIDAY'], [3.0, '#6a3ab0', '#7af0e0', 'NO SNEAKERS']]) {
    plane(root, 0.9, 1.25, toonMat(ctex('poster' + txt, 256, 360, (g, r, W, H) => { g.fillStyle = c1; g.fillRect(0, 0, W, H); g.fillStyle = c2; g.beginPath(); g.arc(W / 2, H * 0.4, 70, 0, 7); g.fill(); g.textAlign = 'center'; fitText(g, txt, W / 2, H * 0.86, W - 30, 54, 'bold', "'Avenir Next', sans-serif"); })), x, 1.8, -0.59);
  }
  cyl(root, 0.06, 0.09, 4.6, toonMat('#2a2a34'), 4.4, 2.3, 2.9, 8);
  const lb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.7, 1.2) })); lb.position.set(4.0, 4.55, 2.9); root.add(lb);
  glow(root, '255,214,150', 2.0, 4.0, 4.5, 2.9, 0.6);
  lamp(root, 0xffd4a0, 3.0, 9, 4.0, 4.3, 2.6);
  const s = sun(root, [3.5, 6, 6], [0, 0.5, 0], { half: 5, map: 4096, far: 20, color: 0x9fb0f0, hemi: [0x4a5a9a, 0x2a2030, 0.7] });
  return { root, sun: s, rope, bg: new THREE.Color(0x0e1230), fog: new THREE.Fog(0x161a3a, 8, 30) };
}
