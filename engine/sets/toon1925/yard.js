// A Paris scrap-metal yard in 1925, toon look (dh015): packed-dirt ground, scrap heaps (painted cut-out cards in
// layers + 3D junk in front: drums, wheels, girders, a bathtub, an old stove), a timber office shed with the dealer's
// sign, a wooden derrick crane with a hook, a board fence with an open gate, and outside the gate a cobbled street with
// a blue police call post. Yard x -12 … 8, z -10 … 3; the street runs along x at z ≈ 4.5. People stand at z ≈ -1 … 4.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, fitText } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun } from '@engine/toon/kit.js';
import { scrapHeap, haussmann, mansard } from './paint1925.js';

const PI = Math.PI;
export const YARD = { shed: [-3.4, -3.2], gate: [6.5, 2.6], post: [8.3, 4.2], street: 4.6 };

export function buildYard(root) {
  const dirt = toonMat(ctex('yardDirt', 512, 512, (g, r, W, H) => {
    g.fillStyle = '#9a8468'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { const gr = g.createRadialGradient(r() * W, r() * H, 0, r() * W, r() * H, 120); gr.addColorStop(0, r() < 0.5 ? 'rgba(70,56,40,0.25)' : 'rgba(255,240,210,0.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    for (let i = 0; i < 500; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,48,36,0.3)' : 'rgba(220,200,170,0.3)'; g.fillRect(r() * W, r() * H, 3, 3); }
  }, [8, 8]));
  const gnd = plane(root, 60, 40, dirt, 0, 0, -4); gnd.rotation.x = -PI / 2;
  const cob = toonMat(ctex('cob25', 512, 512, (g, r, W, H) => { g.fillStyle = '#6e665e'; g.fillRect(0, 0, W, H); for (let j = 0; j < 8; j++) for (let x = (j % 2) * -32; x < W + 64; x += 64) { g.fillStyle = `hsl(30, 8%, ${40 + r() * 14}%)`; g.beginPath(); g.ellipse(x + 32, j * 64 + 32, 28, 27, 0, 0, 7); g.fill(); } }, [16, 2]));
  const st = plane(root, 60, 5, cob, 0, 0.01, 6.0); st.rotation.x = -PI / 2;
  // heaps: three layers of cut-out cards + 3D junk in front
  const heapM = [1, 2, 3, 4].map((s) => toonMat(scrapHeap(s), { alphaTest: 0.5, side: THREE.DoubleSide }));
  for (const [x, z, w, h, k] of [[-8, -9.5, 14, 6, 0], [2, -9.8, 16, 7, 1], [10, -8.5, 10, 5, 2], [-4, -7.5, 9, 3.8, 3], [5.5, -7.2, 8, 3.4, 0], [-10.5, -5.5, 6, 3, 2]]) {
    const p = plane(root, w, h, heapM[k], x, h / 2 - 0.05, z); p.castShadow = true;
  }
  const rusty = toonMat('#8a5a3a'), steel = toonMat('#7a8088'), dark = toonMat('#4a4440'), red = toonMat('#9a3a2a');
  const drum = (x, z, lie = false, m = red) => { const c = cyl(root, 0.3, 0.3, 0.9, m, x, lie ? 0.3 : 0.45, z, 16); if (lie) { c.rotation.z = PI / 2; c.rotation.y = x; } for (const y of [-0.3, 0.3]) { const h = cyl(c, 0.31, 0.31, 0.04, dark, 0, y, 0, 16); void h; } return c; };
  drum(-6.2, -4.6); drum(-5.6, -4.9, true, rusty); drum(3.2, -5.4, false, steel); drum(4.0, -5.1, true); drum(-1.2, -6.0, false, rusty);
  for (const [x, z, r] of [[-7.2, -3.6, 0.55], [1.6, -5.8, 0.7], [6.8, -4.6, 0.5]]) { const w = new THREE.Mesh(new THREE.TorusGeometry(r, 0.12, 8, 20), dark); w.position.set(x, r * 0.6, z); w.rotation.set(0.4, x, 0.3); w.castShadow = true; root.add(w); }
  for (const [x, z, ry, l] of [[-2.0, -5.2, 0.4, 4], [5.0, -6.4, -0.6, 5], [-8.4, -6.8, 1.2, 4.5]]) { const b = box(root, l, 0.3, 0.3, rusty, x, 0.2, z); b.rotation.set(0, ry, 0.12); }
  const tub = new THREE.Group(); tub.position.set(-0.4, 0, -4.4); tub.rotation.y = 0.5; root.add(tub);
  box(tub, 1.5, 0.55, 0.75, toonMat('#e8e4dc'), 0, 0.42, 0, 0.18); box(tub, 1.3, 0.1, 0.55, dark, 0, 0.66, 0, 0.04);
  for (const s of [-1, 1]) ball(tub, 0.08, toonMetal('#c9a35a'), s * 0.6, 0.1, s * 0.25, 8);
  const stove = new THREE.Group(); stove.position.set(2.5, 0, -3.8); stove.rotation.y = -0.3; root.add(stove);
  box(stove, 0.8, 0.9, 0.6, toonMat('#3a3a40'), 0, 0.45, 0, 0.04); cyl(stove, 0.08, 0.08, 1.4, dark, 0.2, 1.6, -0.15, 10);
  // office shed with the dealer's sign
  const shed = new THREE.Group(); shed.position.set(YARD.shed[0], 0, YARD.shed[1]); root.add(shed);
  const plank = toonMat(ctex('shedPlank', 256, 256, (g, r, W, H) => { for (let x = 0; x < W; x += 32) { g.fillStyle = `hsl(28, 30%, ${34 + r() * 10}%)`; g.fillRect(x, 0, 32, H); g.fillStyle = 'rgba(30,20,10,0.5)'; g.fillRect(x, 0, 3, H); } }, [2, 1]));
  box(shed, 4.2, 2.8, 3.0, plank, 0, 1.4, 0);
  const roof = box(shed, 4.6, 0.12, 3.6, toonMat('#5a5a62'), 0, 2.95, 0.1); roof.rotation.x = 0.12;
  box(shed, 0.95, 1.9, 0.08, toonMat('#4a3020'), -0.9, 0.95, 1.52); ball(shed, 0.04, toonMetal('#c9a35a'), -0.55, 0.95, 1.58, 8);
  const win = plane(shed, 1.1, 0.8, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 0.95, 0.7) }), 0.9, 1.5, 1.52); void win;
  for (const [w, h, x, y] of [[1.2, 0.08, 0.9, 1.9], [1.2, 0.08, 0.9, 1.1], [0.08, 0.86, 0.3, 1.5], [0.08, 0.86, 1.5, 1.5], [0.06, 0.8, 0.9, 1.5]]) box(shed, w, h, 0.06, toonMat('#2e2016'), x, y, 1.54);
  const sign = plane(shed, 3.6, 0.8, toonMat(ctex('poissonSign', 768, 170, (g, r, W, H) => {
    g.fillStyle = '#1f3a2e'; g.fillRect(0, 0, W, H); g.strokeStyle = '#d9b45a'; g.lineWidth = 8; g.strokeRect(8, 8, W - 16, H - 16);
    g.fillStyle = '#f2e6c8'; g.textAlign = 'center'; fitText(g, 'A. POISSON · MÉTAUX', W / 2, H * 0.62, W - 60, 92, 'bold', 'Georgia, serif');
  })), 0, 2.45, 1.56); sign.castShadow = true;
  // derrick crane: mast + boom + cable + hook
  const crane = new THREE.Group(); crane.position.set(-8.6, 0, -2.8); root.add(crane);
  const timber = toonMat('#6a4a30');
  box(crane, 0.3, 6.5, 0.3, timber, 0, 3.25, 0); const boom = box(crane, 0.22, 6.2, 0.22, timber, 1.6, 3.2, 0); boom.rotation.z = -0.55;
  for (const s of [-1, 1]) { const l = box(crane, 0.12, 4.0, 0.12, timber, s * 0.9, 1.8, -1.0); l.rotation.set(-0.25, 0, s * 0.25); }
  cyl(crane, 0.02, 0.02, 2.4, dark, 3.2, 4.4, 0, 6); const hook = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 12, PI * 1.4), toonMetal('#8a8a90')); hook.position.set(3.2, 3.1, 0); crane.add(hook);
  // fence + gate posts
  const fenceM = toonMat(ctex('fence25', 256, 128, (g, r, W, H) => { for (let x = 0; x < W; x += 24) { g.fillStyle = `hsl(30, 20%, ${30 + r() * 10}%)`; g.fillRect(x, 0, 22, H); } }, [8, 1]));
  for (const [x0, x1] of [[-14, 5.6], [7.4, 14]]) box(root, x1 - x0, 2.2, 0.08, fenceM, (x0 + x1) / 2, 1.1, 2.6);
  box(root, 0.08, 2.2, 14, fenceM, -14, 1.1, -4.4);
  for (const x of [5.6, 7.4]) box(root, 0.25, 2.6, 0.25, timber, x, 1.3, 2.6);
  // the street outside: the far side's Haussmann fronts, a blue police call post, a lamp post
  const fm = toonMat(haussmann('yardSt', { stone: '#e6d8bc', cols: 6 })), slab = toonMat('#d8ccb4');
  box(root, 40, 20, 4, [slab, slab, slab, slab, slab, slab], 0, 10, 10.6);
  const front = plane(root, 40, 20, fm, 0, 10, 8.58); front.rotation.y = PI; fm.map = fm.map.clone(); fm.map.repeat.set(1.3, 1); fm.map.needsUpdate = true;
  box(root, 40, 4, 8, toonMat(mansard('#7d8794', [8, 1])), 0, 21.5, 11).rotation.x = -0.4;
  const post = new THREE.Group(); post.position.set(YARD.post[0], 0, YARD.post[1]); root.add(post);
  cyl(post, 0.1, 0.13, 2.3, toonMat('#2f3f6a'), 0, 1.15, 0, 10);
  box(post, 0.42, 0.55, 0.3, toonMat('#2f4a8a'), 0, 2.45, 0, 0.05);
  const pl = plane(post, 0.38, 0.16, toonMat(ctex('policeSign', 256, 110, (g, r, W, H) => { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, W, H); g.fillStyle = '#1f2f6a'; g.textAlign = 'center'; fitText(g, 'POLICE', W / 2, H * 0.72, W - 20, 80, 'bold', 'Georgia, serif'); })), 0, 2.5, 0.16); void pl;
  const lg = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.2, 1.0) });
  for (const x of [-3, 12]) { cyl(root, 0.06, 0.1, 3.6, toonMat('#2a2a30'), x, 1.8, 4.0, 8); const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), lg); b.position.set(x, 3.75, 4.0); root.add(b); }
  const s = sun(root, [10, 14, 12], [0, 0, -1], { half: 12, map: 4096, far: 50, hemi: [0xdce8ff, 0x9a7a5a, 0.9] });
  return { root, sun: s, shed, crane, hook, bg: new THREE.Color(0x9cc4ea), fog: new THREE.Fog(0xe8e0d0, 14, 70) };
}
