// SET (dh012, from dh005's buildHall): the MEME HALL OF FAME — a marble-and-velvet museum room (x ∈ [−5, 5], z ∈ [−7.6, 4.5],
// ceiling 4.6), MEME HALL OF FAME banner on the back wall, framed "classic memes" on the side walls, benches, plants, velvet ropes.
// addPedestal(x, z, h, label, {ry, gold}) builds a pedestal with a plaque in its OWN pivot group placed at the pedestal's front-bottom
// edge (+z side after ry) — rotate pivot.rotation.x (> 0) and it topples forward like a domino. Returns {pivot, top (y), label}.
// lights.spots[] follow the pedestals you add (one spot each).
import * as THREE from 'three';
import { mat, mk, canvasTex } from '@engine/core.js';

const PI = Math.PI;
function fitText(g, text, maxW, size, font = 'Helvetica, Arial, sans-serif', weight = 'bold') {
  let s = size; g.font = `${weight} ${s}px ${font}`;
  while (g.measureText(text).width > maxW && s > 10) { s -= 2; g.font = `${weight} ${s}px ${font}`; }
  return s;
}

export function buildMemeHall(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const X0 = -5, X1 = 5, Z0 = -7.6, Z1 = 4.5, H = 4.6;
  const floorT = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#e9e2d4' : '#b9b2a6'; g.fillRect(x * 64, y * 64, 64, 64); } }, [5, 6]);
  const fl = mk(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.3 }), root, 0, 0, (Z0 + Z1) / 2); fl.rotation.x = -PI / 2; fl.castShadow = false;
  const wallM = mat(opts.wall ?? 0x7a2430, 0.85), trim = mat(0xd9b46a, 0.35, { metalness: 0.5 });
  box(X1 - X0, H, 0.2, wallM, 0, H / 2, Z0 - 0.1); box(0.2, H, Z1 - Z0, wallM, X0 - 0.1, H / 2, (Z0 + Z1) / 2); box(0.2, H, Z1 - Z0, wallM, X1 + 0.1, H / 2, (Z0 + Z1) / 2);
  box(X1 - X0, H, 0.2, wallM, 0, H / 2, Z1 + 0.1);
  box(X1 - X0 + 0.4, 0.2, Z1 - Z0 + 0.4, mat(0x3a1a20, 0.9), 0, H + 0.1, (Z0 + Z1) / 2);
  for (const [w, d, x, z] of [[X1 - X0, 0.06, 0, Z0 + 0.02], [0.06, Z1 - Z0, X0 + 0.02, (Z0 + Z1) / 2], [0.06, Z1 - Z0, X1 - 0.02, (Z0 + Z1) / 2]]) { box(w, 0.12, d, trim, x, 0.06, z); box(w, 0.08, d, trim, x, 3.4, z); }
  const tex = (w, h, draw) => canvasTex(w, h, draw);
  mk(new THREE.PlaneGeometry(4.0, 0.56), new THREE.MeshStandardMaterial({ roughness: 0.6, map: tex(1024, 140, (g, w, h) => { g.fillStyle = '#20141a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d9b46a'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#f2cf7a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'MEME HALL OF FAME', w - 80, 92, 'Georgia, serif'); g.fillText('MEME HALL OF FAME', w / 2, h / 2 + 4); }) }), root, 0.35, 3.75, Z0 + 0.02);
  const doodles = [
    ['DANCING HOT DOG · 2017', (g, w, h) => { g.fillStyle = '#ffd36a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e2574c'; g.beginPath(); g.ellipse(w / 2, h / 2, 34, 80, 0.3, 0, 7); g.fill(); g.fillStyle = '#f2b04a'; g.beginPath(); g.ellipse(w / 2 - 10, h / 2 + 6, 46, 84, 0.3, 0, 7); g.globalAlpha = 0.6; g.fill(); }],
    ['CAT AT A TABLE · 2019', (g, w, h) => { g.fillStyle = '#bfe3f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f1ea'; g.beginPath(); g.arc(w / 2, h / 2, 50, 0, 7); g.fill(); g.beginPath(); g.moveTo(w / 2 - 46, h / 2 - 20); g.lineTo(w / 2 - 30, h / 2 - 70); g.lineTo(w / 2 - 10, h / 2 - 44); g.fill(); g.beginPath(); g.moveTo(w / 2 + 46, h / 2 - 20); g.lineTo(w / 2 + 30, h / 2 - 70); g.lineTo(w / 2 + 10, h / 2 - 44); g.fill(); g.fillStyle = '#222'; g.fillRect(w / 2 - 22, h / 2 - 8, 10, 10); g.fillRect(w / 2 + 12, h / 2 - 8, 10, 10); }],
    ['SURPRISED FROG · 2015', (g, w, h) => { g.fillStyle = '#f7e3c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#6fbf5a'; g.beginPath(); g.ellipse(w / 2, h / 2 + 20, 70, 50, 0, 0, 7); g.fill(); for (const s of [-1, 1]) { g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2 + s * 34, h / 2 - 22, 22, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(w / 2 + s * 34, h / 2 - 22, 9, 0, 7); g.fill(); } g.fillStyle = '#3a2a2a'; g.beginPath(); g.arc(w / 2, h / 2 + 34, 14, 0, 7); g.fill(); }],
    ['THE FIRST LOL · 1993', (g, w, h) => { g.fillStyle = '#20242c'; g.fillRect(0, 0, w, h); g.fillStyle = '#7dff9a'; g.font = 'bold 64px Courier New, monospace'; g.textAlign = 'center'; g.fillText('LOL', w / 2, h / 2 + 20); }],
  ];
  [[X0 + 0.05, 2.2, -4.6, PI / 2], [X0 + 0.05, 2.2, -1.2, PI / 2], [X1 - 0.05, 2.2, -1.6, -PI / 2], [X1 - 0.05, 2.2, 1.6, -PI / 2]].forEach(([x, y, z, ry], i) => {
    const f = new THREE.Group(); f.position.set(x, y, z); f.rotation.y = ry; root.add(f);
    box(1.3, 1.0, 0.06, trim, 0, 0, 0, f);
    mk(new THREE.PlaneGeometry(1.14, 0.84), new THREE.MeshStandardMaterial({ roughness: 0.7, map: tex(256, 190, doodles[i][1]) }), f, 0, 0, 0.035);
    mk(new THREE.PlaneGeometry(0.9, 0.16), new THREE.MeshStandardMaterial({ roughness: 0.6, map: tex(360, 64, (g, w, h) => { g.fillStyle = '#20141a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2cf7a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, doodles[i][0], w - 20, 30); g.fillText(doodles[i][0], w / 2, h / 2 + 2); }) }), f, 0, -0.68, 0.035);
  });
  // velvet ropes (posts + sagging ropes) along `ropes` (default: in front of the display row)
  const ropePosts = opts.ropes ?? [[-2.3, -1.4], [-0.8, -0.9], [0.8, -0.4], [2.3, 0.1]];
  const stanchions = ropePosts.map(([x, z]) => { const s = new THREE.Group(); s.position.set(x, 0, z); root.add(s); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 10), trim, s, 0, 0.475, 0); mk(new THREE.CylinderGeometry(0.16, 0.18, 0.04, 16), trim, s, 0, 0.02, 0); mk(new THREE.SphereGeometry(0.05, 10, 8), trim, s, 0, 0.97, 0); return s; });
  const ropeM = mat(0x8a1a2a, 0.6), ropes = [];
  for (let i = 0; i + 1 < ropePosts.length; i++) { const a = new THREE.Vector3(ropePosts[i][0], 0.9, ropePosts[i][1]), b = new THREE.Vector3(ropePosts[i + 1][0], 0.9, ropePosts[i + 1][1]), m = a.clone().add(b).multiplyScalar(0.5); m.y -= 0.22; ropes.push(mk(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 12, 0.022, 6), ropeM, root)); }
  for (const [x, z] of [[-3.8, 1.0], [3.8, 0.2]]) box(0.5, 0.42, 1.6, mat(0x3a2a24, 0.6), x, 0.21, z);
  for (const [x, z] of [[-4.4, -6.9], [4.4, -6.9], [-4.4, 3.8], [4.4, 3.8]]) { mk(new THREE.CylinderGeometry(0.22, 0.17, 0.5, 14), mat(0xe9e2d4, 0.5), root, x, 0.25, z); for (let k = 0; k < 5; k++) mk(new THREE.SphereGeometry(0.24, 10, 8), mat(0x3f7a3a, 0.8), root, x + Math.cos(k * 1.3) * 0.12, 0.75 + k * 0.12, z + Math.sin(k * 1.3) * 0.12); }
  const hemi = new THREE.HemisphereLight(0xfff0e0, 0x6a3a30, 1.05); root.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0dc, 1.3); key.position.set(3, 9, 6); key.target.position.set(0, 0, -3); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  const spots = [];
  const gold = mat(0xd9a93a, 0.32, { metalness: 0.65 }), stone = mat(0xe9e4da, 0.5);
  /** a pedestal that can topple forward (+z after ry): pivot at its front-bottom edge */
  function addPedestal(x, z, h, label, o = {}) {
    const W = o.w ?? 0.8, ry = o.ry ?? 0, m = o.gold ? gold : stone;
    const pivot = new THREE.Group(); pivot.position.set(x + Math.sin(ry) * W / 2, 0, z + Math.cos(ry) * W / 2); pivot.rotation.y = ry; root.add(pivot);
    const body = new THREE.Group(); body.position.z = -W / 2; pivot.add(body);
    box(W, h, W, m, 0, h / 2, 0, body); box(W + 0.1, 0.06, W + 0.1, m, 0, h, 0, body);
    if (label) {
      const pt = tex(512, 128, (g, w, hh) => { g.fillStyle = '#20141a'; g.fillRect(0, 0, w, hh); g.fillStyle = '#f2cf7a'; g.textAlign = 'center'; g.textBaseline = 'middle'; const [a, b] = label.split('\n'); fitText(g, a, w - 40, 48); g.fillText(a, w / 2, b ? 44 : hh / 2); if (b) { fitText(g, b, w - 60, 32); g.fillText(b, w / 2, 98); } });
      mk(new THREE.PlaneGeometry(W * 0.86, W * 0.215), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.5 }), body, 0, h * 0.62, W / 2 + 0.005);
    }
    const s = new THREE.SpotLight(0xffe2b0, o.spot ?? 10, 9, 0.42, 0.6, 1.2); s.position.set(x * 0.8, H - 0.1, z + 1.6); s.target.position.set(x, 0.8, z); root.add(s, s.target); spots.push(s);
    return { pivot, body, top: h + 0.03, x, z, ry, W };
  }
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, stanchions, ropes, addPedestal, lights: { hemi, key, spots } };
}
