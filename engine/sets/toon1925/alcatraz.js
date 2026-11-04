// Alcatraz in the 1930s-40s, toon look (dh015): buildIsland = the Rock at dusk in San Francisco Bay (faceted rock with
// a flat top, the long white cell house with rows of windows, the lighthouse with a turning beam, the water tower,
// retaining walls, the dock), the bay hills + city lights as a cut-out card, water. buildCell = one cell (bars that
// face +z, a bunk, a sink, a shelf, a small barred window high on the back wall) and, out in the corridor, a records
// desk with a lamp where a document can lie (DESK). The video adds the painted sky.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex } from '@engine/toon/paint.js';
import { box, cyl, plane, sun, glow, lamp } from '@engine/toon/kit.js';
import { makeGlow } from '@engine/toon/light.js';
import { bayHills } from './paint1925.js';

const PI = Math.PI;
export const ISLAND = { top: 14, lighthouse: [-14, 26, -6] };
export const CELL = { bunk: [-0.75, -0.4], bars: 1.0, desk: [2.6, 2.6] };

export function buildIsland(root) {
  const rockM = toonMat('#8a7a6a'), rockDk = toonMat('#6e6052'), white = toonMat('#ece6da'), roof = toonMat('#8a8a8e');
  const rock = new THREE.Mesh(new THREE.CylinderGeometry(38, 52, 14, 9, 2), rockM); rock.position.y = 7 - 2; rock.castShadow = rock.receiveShadow = true;
  const pos = rock.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (Math.abs(y) < 6.9) { const k = 1 + 0.12 * Math.sin(i * 1.7) ; pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k); } }
  rock.geometry.computeVertexNormals(); root.add(rock);
  rock.scale.set(1.6, 1, 0.8);
  
  // the cell house: long block + roof + rows of windows
  const ch = new THREE.Group(); ch.position.set(4, ISLAND.top - 2, -2); root.add(ch);
  const winTex = ctex('cellhouseWin', 1024, 256, (g, r, W, H) => { g.fillStyle = '#ece6da'; g.fillRect(0, 0, W, H); for (let x = 20; x < W; x += 34) for (const y of [40, 140]) { g.fillStyle = r() < 0.35 ? '#ffd890' : '#3a4256'; g.fillRect(x, y, 16, 70); } }, [1, 1]);
  const front = toonMat(winTex);
  box(ch, 56, 12, 16, [white, white, white, white, front, white], 0, 6, 0);
  box(ch, 57, 1.2, 17, roof, 0, 12.6, 0);
  for (const x of [-24, 24]) box(ch, 6, 4, 6, white, x, 14, 0);
  // lighthouse + beam, water tower, small buildings
  const [lx, , lz] = ISLAND.lighthouse;
  const lh = new THREE.Group(); lh.position.set(lx, ISLAND.top - 2, lz); root.add(lh);
  cyl(lh, 1.4, 1.9, 18, white, 0, 9, 0, 12); cyl(lh, 2.0, 2.0, 0.6, toonMat('#2a2a30'), 0, 18.3, 0, 12);
  const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.7, 2.0) });
  const lm = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.0, 12), lampM); lm.position.y = 19.6; lh.add(lm);
  const lid = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.4, 12), toonMat('#2a2a30')); lid.position.y = 21.3; lh.add(lid);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(9, 70, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.geometry.translate(0, -35, 0); beam.geometry.rotateX(-PI / 2); const bp = new THREE.Group(); bp.position.y = 19.6; bp.add(beam); lh.add(bp);
  glow(lh, '255,236,190', 9, 0, 19.6, 0, 0.8);
  const wt = new THREE.Group(); wt.position.set(30, ISLAND.top - 2, -10); root.add(wt);
  for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) cyl(wt, 0.25, 0.25, 14, toonMat('#5a5a60'), x, 7, z, 6);
  cyl(wt, 3.2, 3.2, 5, toonMat('#a8a6a0'), 0, 16, 0, 16);
  for (const [x, z, w, h] of [[-26, 8, 10, 6], [22, 12, 12, 7], [-8, 16, 8, 5]]) box(root, w, h, 7, white, x, ISLAND.top - 2 + h / 2, z);
  // water + the bay hills
  const water = plane(root, 3000, 3000, toonMat(ctex('bay', 512, 512, (g, r, W, H) => { g.fillStyle = '#4a5a8a'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,200,170,0.35)'; g.lineWidth = 4; for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 16, y - 6, x + 32, y); g.stroke(); } }, [60, 60])), 0, 0, 0);
  water.rotation.x = -PI / 2; water.receiveShadow = false;
  const hills = plane(root, 1600, 400, new THREE.MeshBasicMaterial({ map: bayHills(), transparent: true, alphaTest: 0.1 }), 0, 120, -700); hills.material.color.set(0xb8a8c8);
  const s = sun(root, [-60, 40, -80], [0, 6, 0], { half: 70, map: 4096, far: 300, color: 0xffc89a, hemi: [0x8a7ab8, 0x4a3a4a, 0.8] });
  return { root, sun: s, beam: bp, water, bg: new THREE.Color(0x6a5a8a), fog: new THREE.Fog(0xb89aac, 120, 1200),
    update(t) { bp.rotation.y = t * 0.9; water.material.map.offset.set(t * 0.004, t * 0.01); } };
}

export function buildCell(root) {
  const conc = toonMat(ctex('cellConc', 512, 512, (g, r, W, H) => { g.fillStyle = '#b8b4a8'; g.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) { const gr = g.createRadialGradient(r() * W, r() * H, 0, r() * W, r() * H, 100); gr.addColorStop(0, r() < 0.5 ? 'rgba(80,70,60,0.18)' : 'rgba(255,250,240,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); } }, [2, 2]));
  const greenWall = toonMat('#9ab0a0'), steel = toonMat('#5a6068'), white = toonMat('#ece8de');
  const fl = plane(root, 10, 8, toonMat('#8a8478'), 1.5, 0, 1); fl.rotation.x = -PI / 2;
  box(root, 2.0, 2.8, 0.14, greenWall, -0.3, 1.4, -1.55); box(root, 0.14, 2.8, 2.6, greenWall, -1.3, 1.4, -0.3); box(root, 0.14, 2.8, 2.6, greenWall, 0.7, 1.4, -0.3);
  box(root, 2.2, 0.1, 2.6, conc, -0.3, 2.85, -0.3).castShadow = false;
  // the bars (front at z = CELL.bars), with a crossbar
  for (let x = -1.25; x <= 0.65; x += 0.13) cyl(root, 0.018, 0.018, 2.8, steel, x, 1.4, CELL.bars, 6);
  for (const y of [0.1, 1.1, 2.75]) box(root, 2.0, 0.06, 0.05, steel, -0.3, y, CELL.bars);
  // bunk, blanket, pillow, sink, shelf, a small window up high with moonlight
  box(root, 0.8, 0.08, 1.9, steel, CELL.bunk[0], 0.5, CELL.bunk[1]); box(root, 0.76, 0.12, 1.86, toonMat('#7a7f86'), CELL.bunk[0], 0.6, CELL.bunk[1]);
  box(root, 0.5, 0.1, 0.3, white, CELL.bunk[0], 0.7, CELL.bunk[1] - 0.7);
  for (const z of [-1.2, 0.5]) box(root, 0.06, 0.5, 0.06, steel, CELL.bunk[0] + 0.36, 0.25, z);
  box(root, 0.36, 0.2, 0.3, white, 0.5, 0.85, -1.3); box(root, 0.6, 0.04, 0.24, steel, 0.4, 1.6, -1.42);
  for (let i = 0; i < 3; i++) box(root, 0.06, 0.22, 0.16, toonMat(['#7a3a2a', '#2f4a6a', '#5a6a3a'][i]), 0.2 + i * 0.08, 1.73, -1.42);
  const wv = plane(root, 0.5, 0.4, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.6, 1.0) }), -0.3, 2.35, -1.47); void wv;
  for (let x = -0.5; x <= -0.1; x += 0.1) box(root, 0.02, 0.4, 0.03, steel, x, 2.35, -1.46);
  // corridor: the opposite wall + a records desk under a lamp
  box(root, 10, 3.2, 0.2, toonMat('#c9c2b0'), 1.5, 1.6, 4.4);
  const desk = new THREE.Group(); desk.position.set(CELL.desk[0], 0, CELL.desk[1]); root.add(desk);
  const wood = toonMat('#6a4a32');
  box(desk, 1.4, 0.06, 0.8, wood, 0, 0.76, 0, 0.02); for (const sx of [-1, 1]) box(desk, 0.36, 0.72, 0.7, wood, sx * 0.5, 0.36, 0);
  box(desk, 0.5, 0.012, 0.4, toonMat('#3a5a4a'), 0.3, 0.795, 0.05);
  cyl(desk, 0.03, 0.04, 0.1, toonMat('#1e1e24'), -0.45, 0.84, -0.2, 10);
  const lampG = new THREE.Group(); lampG.position.set(-0.5, 0.79, -0.25); desk.add(lampG);
  cyl(lampG, 0.08, 0.1, 0.03, toonMetal('#8a8a90'), 0, 0.015, 0, 14); cyl(lampG, 0.012, 0.012, 0.4, toonMetal('#8a8a90'), 0, 0.21, 0, 8);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.14, 16, 1, true), toonMat('#3a4a3a', { side: THREE.DoubleSide })); shade.position.set(0.05, 0.42, 0.05); shade.rotation.z = -0.5; lampG.add(shade);
  const deskGlow = glow(desk, '255,214,150', 0.6, -0.42, 1.15, -0.2, 0.6);
  const deskLamp = lamp(desk, 0xffd49a, 3.0, 3.0, -0.35, 1.15, -0.1);
  makeGlow(root, { x: -0.3, y: 2.35, z: -1.4, size: 1.2, intensity: 0.3, color: 0xb8c8ff });
  const s = sun(root, [-0.3, 2.6, -1.3], [0.1, 0.4, 0.8], { half: 3.2, map: 2048, far: 8, color: 0xa8b8f0, hemi: [0x8a94b8, 0x4a4040, 0.75] });
  return { root, sun: s, desk, deskLamp, deskGlow, bg: new THREE.Color(0x2a2a34), fog: null };
}
