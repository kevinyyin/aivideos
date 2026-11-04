// SET: a sports locker room (built for dh007 "100 men vs 1 gorilla") — orange metal lockers on three walls with vents + number
// plates, two long wooden benches, a whiteboard on a rolling stand that FLIPS on its horizontal pivot (board.rotation.x), a
// TEAM banner, towels on hooks, a water cooler, gym bags, a ball cart, a wall clock, a "GIVE 110%" poster, fluorescent panels.
// Coordinates: room x∈[-4,4], z∈[-3,4.5], ceiling 3.0. The whiteboard stands at DIMS.board facing +z (the team sits on the
// benches DIMS.benches (z) facing −z, seat top DIMS.seat). Handles: board (pivot group, rotation.x flips it), boardFace (the
// front mesh: swap its material.map for your own canvas), setBanner(text), banner (its mesh, to move/scale), lights.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeBasketball } from '@engine/props.js';

export const DIMS = { board: [0, -1.9], boardY: 1.4, benches: [0.35, 1.55], seat: 0.45, benchX: [-2.6, 2.6], x0: -4, x1: 4, z0: -3, z1: 4.5, ceil: 3.0 };

export function buildLocker(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 12);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const W = DIMS.x1 - DIMS.x0, D = DIMS.z1 - DIMS.z0, cz = (DIMS.z0 + DIMS.z1) / 2;

  // floor tiles + walls + ceiling
  const floorTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7d8a96'; g.fillRect(0, 0, w, h); const r = rng(3); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.fillStyle = `hsl(208,${8 + r() * 6}%,${50 + r() * 6}%)`; g.fillRect(x + 1, y + 1, 30, 30); } }, [W / 1.2, D / 1.2]);
  const floor = mk(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4 }), root, 0, 0, cz); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const tileTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e8ece8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,130,130,.35)'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } }, [6, 3]);
  const wallM = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.6 });
  box(W + 0.2, DIMS.ceil, 0.12, wallM, 0, DIMS.ceil / 2, DIMS.z0 - 0.06);
  box(0.12, DIMS.ceil, D, wallM, DIMS.x0 - 0.06, DIMS.ceil / 2, cz); box(0.12, DIMS.ceil, D, wallM, DIMS.x1 + 0.06, DIMS.ceil / 2, cz);
  box(W + 0.2, DIMS.ceil, 0.12, wallM, 0, DIMS.ceil / 2, DIMS.z1 + 0.06);
  box(W + 0.2, 0.1, D + 0.2, mat(0xeef0ee, 0.95), 0, DIMS.ceil + 0.05, cz);
  box(W, 0.12, 0.04, mat(0x2f5f9a, 0.6), 0, 1.0, DIMS.z0 + 0.02);   // a team-blue stripe on the tiles

  // lockers: a row of tall orange metal lockers (vents, handles, number plates)
  const lockM = mat(0xe8742a, 0.45, { metalness: 0.25 }), darkM = mat(0x2a2a30, 0.5), plateM = mat(0xf4f2ea, 0.5);
  const vents = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#e8742a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,20,10,.55)'; for (let y = 6; y < h; y += 12) g.fillRect(8, y, w - 16, 5); });
  const ventM = new THREE.MeshStandardMaterial({ map: vents, roughness: 0.5, metalness: 0.2 });
  function lockerRow(n, x0, z, rotY, num0) {
    const row = new THREE.Group(); row.position.set(x0, 0, z); row.rotation.y = rotY; root.add(row);
    for (let i = 0; i < n; i++) {
      const x = i * 0.42;
      box(0.4, 1.95, 0.42, lockM, x, 0.975 + 0.1, 0, row);
      box(0.3, 0.16, 0.01, ventM, x, 1.75, 0.215, row); box(0.3, 0.16, 0.01, ventM, x, 0.45, 0.215, row);
      box(0.03, 0.14, 0.03, darkM, x + 0.13, 1.1, 0.225, row);
      box(0.12, 0.06, 0.01, plateM, x, 1.5, 0.218, row);
      if (R() < 0.35) { const tw = rbox(0.2, 0.38, 0.05, 0.02, mat([0xffffff, 0x5ad1ff, 0xf2c14e][i % 3], 0.95), x - 0.06, 1.25, 0.25, row); tw.rotation.z = 0.08; }   // a towel hung on the door
    }
    box(n * 0.42, 0.1, 0.44, darkM, (n - 1) * 0.21, 0.05, 0, row);
    void num0; return row;
  }
  lockerRow(19, DIMS.x0 + 0.21, DIMS.z0 + 0.22, 0, 1);
  lockerRow(15, DIMS.x0 + 0.22, DIMS.z1 - 0.6, Math.PI / 2, 20);
  lockerRow(15, DIMS.x1 - 0.22, DIMS.z0 + 0.95, -Math.PI / 2, 40);

  // benches
  const woodM = mat(0xc08a52, 0.6), legM = mat(0x8a8f96, 0.4, { metalness: 0.6 });
  for (const z of DIMS.benches) {
    rbox(DIMS.benchX[1] - DIMS.benchX[0] + 0.4, 0.06, 0.34, 0.02, woodM, 0, DIMS.seat - 0.03, z);
    for (const x of [-2.4, 0, 2.4]) box(0.06, DIMS.seat - 0.06, 0.26, legM, x, (DIMS.seat - 0.06) / 2, z);
  }

  // the whiteboard on a rolling stand (pivot = the stand's horizontal axle at boardY)
  const [bx, bz] = DIMS.board;
  for (const s of [-1, 1]) { box(0.05, DIMS.boardY + 0.05, 0.05, legM, bx + s * 1.05, (DIMS.boardY + 0.05) / 2, bz); box(0.05, 0.05, 0.6, legM, bx + s * 1.05, 0.08, bz); for (const dz of [-0.28, 0.28]) mk(new THREE.SphereGeometry(0.04, 8, 6), darkM, root, bx + s * 1.05, 0.04, bz + dz); }
  const board = new THREE.Group(); board.position.set(bx, DIMS.boardY, bz); root.add(board);
  rbox(2.0, 1.3, 0.05, 0.02, mat(0xb8bcc2, 0.35, { metalness: 0.5 }), 0, 0, 0, board);
  const blank = canvasTex(1024, 640, (g, w, h) => { g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h); });
  const boardFace = mk(new THREE.PlaneGeometry(1.9, 1.2), new THREE.MeshBasicMaterial({ map: blank, color: 0xd8d8d4 }), board, 0, 0, 0.027);
  const back = mk(new THREE.PlaneGeometry(1.9, 1.2), new THREE.MeshBasicMaterial({ map: blank, color: 0xd8d8d4 }), board, 0, 0, -0.027); back.rotation.y = Math.PI;
  box(1.9, 0.04, 0.08, legM, 0, -0.66, 0.05, board);   // marker tray
  for (const [x, c] of [[-0.3, 0x2f6fd0], [-0.18, 0xd2483f], [0.4, 0x2a2a2a]]) { const m = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), mat(c, 0.5), board, x, -0.63, 0.07); m.rotation.z = Math.PI / 2; }

  // dressing: banner, poster, clock, water cooler, gym bags, ball cart, cones
  const banner = canvasTex(1024, 192, () => {});
  const bannerMesh = mk(new THREE.PlaneGeometry(4.2, 0.78), new THREE.MeshBasicMaterial({ map: banner, color: 0xe0e0e0 }), root, 0, 2.55, DIMS.z0 + 0.45); bannerMesh.castShadow = false;
  function setBanner(text) {
    const c = banner.image, g = c.getContext('2d'); g.fillStyle = '#2f5f9a'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#f2c14e'; g.fillRect(0, 0, c.width, 14); g.fillRect(0, c.height - 14, c.width, 14);
    let s = 128; g.font = `bold ${s}px Helvetica, Arial, sans-serif`; const mw = g.measureText(text).width; if (mw > c.width - 80) { s = Math.floor((s * (c.width - 80)) / mw); g.font = `bold ${s}px Helvetica, Arial, sans-serif`; }
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, c.height / 2 + 6); banner.needsUpdate = true;
  }
  setBanner(opts.banner ?? 'TEAM 100');
  const poster = mk(new THREE.PlaneGeometry(0.7, 1.0), new THREE.MeshBasicMaterial({ color: 0xd8d8d8, map: canvasTex(256, 360, (g, w, h) => { g.fillStyle = '#d2483f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = 'bold 64px Helvetica, Arial, sans-serif'; g.fillText('GIVE', w / 2, 120); g.font = 'bold 92px Helvetica, Arial, sans-serif'; g.fillText('110%', w / 2, 230); g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.fillText('NO EXCUSES', w / 2, 300); }) }), root, DIMS.x1 - 0.01, 1.7, 3.2); poster.rotation.y = -Math.PI / 2;
  const clockT = canvasTex(128, 128, (g, w) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 6; g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 24); g.stroke(); g.beginPath(); g.moveTo(64, 64); g.lineTo(92, 70); g.stroke(); void w; });
  const clock = mk(new THREE.CircleGeometry(0.2, 24), new THREE.MeshBasicMaterial({ map: clockT, color: 0xdddddd }), root, 2.6, 2.55, DIMS.z0 + 0.45); clock.castShadow = false;
  // water cooler (right wall, front)
  box(0.36, 0.95, 0.36, mat(0xeeeeee, 0.6), DIMS.x1 - 0.35, 0.475, 3.9);
  mk(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 16), mat(0x7fc6ef, 0.1, { transparent: true, opacity: 0.75 }), root, DIMS.x1 - 0.35, 1.16, 3.9);
  // gym bags + a ball cart + towels in a bin
  for (let k = 0; k < 6; k++) { const bag = rbox(0.55, 0.28, 0.3, 0.1, mat([0x2a2a30, 0xd2483f, 0x2f5f9a, 0x6fa84f][k % 4], 0.85), -3.3 + (k % 3) * 0.7, 0.14, -2.35 + Math.floor(k / 3) * 3.4); bag.rotation.y = R() * 0.6 - 0.3; }
  const cart = new THREE.Group(); cart.position.set(3.35, 0, 0.6); root.add(cart);
  box(0.6, 0.04, 0.9, legM, 0, 0.35, 0, cart); for (const [x, z] of [[-0.28, -0.42], [0.28, -0.42], [-0.28, 0.42], [0.28, 0.42]]) box(0.03, 0.9, 0.03, legM, x, 0.45, z, cart);
  for (let k = 0; k < 6; k++) { const b = makeBasketball(0.12); b.position.set(-0.15 + (k % 2) * 0.3, 0.5 + Math.floor(k / 4) * 0.24, -0.3 + (k % 3) * 0.3); cart.add(b); }
  for (const [x, z] of [[-3.5, 3.6], [-3.2, 3.9]]) mk(new THREE.ConeGeometry(0.12, 0.3, 12), mat(0xff7a2a, 0.6), root, x, 0.15, z);

  // fluorescent panels + lights
  const panelM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf4f8ff).multiplyScalar(1.4), toneMapped: false });
  for (const x of [-2, 0, 2]) for (const z of [-1.2, 1.2, 3.4]) mk(new THREE.PlaneGeometry(0.5, 1.1), panelM, root, x, DIMS.ceil - 0.01, z).rotation.x = Math.PI / 2;
  const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x6a6a60, 1.05); root.add(hemi);
  const key = new THREE.DirectionalLight(0xfff6ea, 1.5); key.position.set(1.5, 6, 3.5); key.target.position.set(0, 0, 0); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  const fillA = new THREE.PointLight(0xfff4e6, 3.5, 8, 1.5); fillA.position.set(0, 2.6, 2.5); root.add(fillA);
  const fillB = new THREE.PointLight(0xfff4e6, 2.5, 7, 1.5); fillB.position.set(0, 2.6, -1.0); root.add(fillB);
  return { root, D: DIMS, board, boardFace, setBanner, banner: bannerMesh, lights: { hemi, key, fillA, fillB } };
}
