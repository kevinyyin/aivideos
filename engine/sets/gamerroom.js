// SET: a gamer's bedroom at 3 AM (built for dh011 "chud to chad") — a desk on the back wall with two monitors (canvas screens),
// an RGB keyboard + LED strip, a racing-style gaming chair on casters, an unmade single bed under a window (night city ↔ morning
// sky), a full-length mirror on the left wall (a live three.js Reflector), a pendant lamp you can swing, and the chud dressing:
// pizza boxes, a laundry hill, a beanbag, a mini fridge, posters of made-up games, fairy lights, a trash bin, a cactus.
// Coordinates: room x∈[-2.4, 2.4], z∈[-2.4, 2.6], ceiling 2.6. The desk faces +z (the player sits at DIMS.chair facing −z).
// Handles: chair (group at the chair's floor point: rotate .y to swivel, its back faces +z), desk {L, R, keyboard}, screens[i] (meshes: swap
// .material.map), mirror (Reflector mesh) + mirrorFrame, lamp (pivot at the ceiling: rotate .x/.z to swing), clock (canvas:
// setClock('3:07')), setMode('night'|'morning'), lights.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

export const DIMS = { x0: -2.4, x1: 2.4, z0: -2.4, z1: 2.6, ceil: 2.6, desk: { x: -0.6, z: -2.02, y: 0.76, w: 1.9, d: 0.7 }, chair: [-0.6, -1.25], seatY: 0.5,
  bed: { x0: 1.2, x1: 2.32, z0: -2.35, z1: -0.35, top: 0.52 }, mirror: { x: -2.36, z: 0.75, y: 1.08, w: 0.62, h: 1.7 }, lamp: [0.25, -0.75], lampY: 2.02 };

export function buildGamerRoom(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 11);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const W = DIMS.x1 - DIMS.x0, D = DIMS.z1 - DIMS.z0, cz = (DIMS.z0 + DIMS.z1) / 2, C = DIMS.ceil;

  // floor (wood planks), walls (muted purple-gray), ceiling, skirting
  const floorTex = canvasTex(256, 256, (g, w, h) => { const r = rng(4); for (let y = 0; y < h; y += 32) { g.fillStyle = `hsl(28,${30 + r() * 10}%,${36 + r() * 6}%)`; g.fillRect(0, y, w, 31); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y + 31, w, 1); g.fillRect(r() * w, y, 1, 32); } }, [W / 1.6, D / 1.6]);
  const floor = mk(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.75 }), root, 0, 0, cz); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const wallM = mat(0x8c8496, 0.92), wallB = mat(0x7d7690, 0.92);
  box(W + 0.2, C, 0.1, wallB, 0, C / 2, DIMS.z0 - 0.05);
  box(0.1, C, D, wallM, DIMS.x0 - 0.05, C / 2, cz); box(0.1, C, D, wallM, DIMS.x1 + 0.05, C / 2, cz);
  box(W + 0.2, C, 0.1, wallM, 0, C / 2, DIMS.z1 + 0.05);
  box(W + 0.2, 0.08, D + 0.2, mat(0xd9d4dc, 0.95), 0, C + 0.04, cz);
  const skirtM = mat(0xeee8e0, 0.7);
  box(W, 0.08, 0.02, skirtM, 0, 0.04, DIMS.z0 + 0.01); box(0.02, 0.08, D, skirtM, DIMS.x0 + 0.01, 0.04, cz); box(0.02, 0.08, D, skirtM, DIMS.x1 - 0.01, 0.04, cz); box(W, 0.08, 0.02, skirtM, 0, 0.04, DIMS.z1 - 0.01);
  // rug
  const rugTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#3a4a7a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8b04a'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = '#d2483f'; g.beginPath(); g.arc(w / 2, h / 2, 50, 0, 7); g.fill(); });
  const rug = mk(new THREE.PlaneGeometry(2.0, 1.5), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 }), root, -0.3, 0.004, -0.2); rug.rotation.x = -Math.PI / 2; rug.castShadow = false;

  // ---------------------------------------------------------------- desk + monitors + RGB
  // the desk is two halves, each hinged at its outer leg (desk.L / desk.R: rotate .z to snap it into a V — L by −θ, R by +θ);
  // each half carries its monitor and clutter, the keyboard is its own group (desk.keyboard) in the middle
  const dk = DIMS.desk, deskM = mat(0x23232a, 0.5), legM = mat(0x18181c, 0.4, { metalness: 0.5 });
  const ledM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xb05aff).multiplyScalar(1.6), toneMapped: false });
  box(W - 0.2, 0.02, 0.02, new THREE.MeshBasicMaterial({ color: new THREE.Color(0x4fd8ff).multiplyScalar(1.4), toneMapped: false }), 0, C - 0.04, DIMS.z0 + 0.04);   // ceiling LED strip
  const gameTex = (seed) => canvasTex(512, 300, (g, w, h) => {
    const r = rng(seed); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3a8a'); gr.addColorStop(1, '#7a3a8a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a8a4a'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 32) g.lineTo(x, h * 0.62 + Math.sin(x * 0.03 + seed) * 22 + r() * 10); g.lineTo(w, h); g.fill();
    for (let i = 0; i < 5; i++) { g.fillStyle = ['#ffd166', '#ff5fa2', '#5ad1ff'][i % 3]; g.beginPath(); g.arc(60 + r() * (w - 120), 60 + r() * 120, 8 + r() * 10, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, w, 34); g.fillStyle = '#fff'; g.font = 'bold 22px Helvetica, Arial, sans-serif'; g.fillText(seed % 2 ? 'LVL 99 · GOBLIN' : 'HP ███████░', 14, 24);
  });
  const screens = [], monM = mat(0x111114, 0.4), hw = dk.w / 2;
  const desk = { L: new THREE.Group(), R: new THREE.Group(), keyboard: new THREE.Group() };
  [desk.L, desk.R].forEach((half, i) => {
    const s = i ? 1 : -1, px = dk.x + s * (hw - 0.08);   // hinge = the top of the outer leg
    half.position.set(px, dk.y, dk.z); root.add(half);
    const lx = (x) => x - px;   // room x → this half's local x
    rbox(hw + 0.004, 0.05, dk.d, 0.012, deskM, lx(dk.x + s * hw / 2), -0.025, 0, half);
    box(0.06, dk.y - 0.05, dk.d - 0.1, legM, 0, -(dk.y - 0.05) / 2 - 0.05, 0, half);
    box(hw - 0.1, 0.012, 0.012, ledM, lx(dk.x + s * hw / 2), -0.06, dk.d / 2 - 0.02, half);
    const mon = new THREE.Group(); mon.position.set(lx(dk.x + s * 0.45), 0, -0.14); mon.rotation.y = -s * 0.16; half.add(mon);
    box(0.2, 0.012, 0.16, legM, 0, 0.006, 0, mon); box(0.04, 0.26, 0.03, legM, 0, 0.13, -0.03, mon);
    rbox(0.82, 0.48, 0.035, 0.01, monM, 0, 0.47, 0, mon);
    const sc = mk(new THREE.PlaneGeometry(0.78, 0.44), new THREE.MeshBasicMaterial({ map: gameTex(i + 3), color: 0xcfcfcf }), mon, 0, 0.47, 0.019); sc.castShadow = false;
    screens.push(sc);
    if (s < 0) {   // left half: chip bag + headset stand
      rbox(0.14, 0.2, 0.06, 0.03, mat(0xe8a83a, 0.6), lx(dk.x - 0.62), 0.1, 0.18, half).rotation.z = 0.2;
      box(0.02, 0.32, 0.02, legM, lx(dk.x - 0.78), 0.16, -0.05, half); mk(new THREE.TorusGeometry(0.09, 0.025, 8, 18, Math.PI), mat(0x2a2a30, 0.5), half, lx(dk.x - 0.78), 0.32, -0.05);
    } else {       // right half: mouse + pad, a pizza box, a mug
      mk(new THREE.PlaneGeometry(0.3, 0.25), mat(0x2a2a40, 0.9), half, lx(dk.x + 0.42), 0.002, 0.12).rotation.x = -Math.PI / 2;
      mk(new THREE.SphereGeometry(0.035, 12, 8), mat(0x18181c, 0.4), half, lx(dk.x + 0.42), 0.02, 0.12).scale.set(0.8, 0.5, 1.2);
      rbox(0.36, 0.04, 0.36, 0.005, mat(0xd8b88a, 0.9), lx(dk.x + 0.72), 0.02, 0.05, half);
      mk(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 14), mat(0x5ad1ff, 0.5), half, lx(dk.x + 0.55), 0.05, -0.2);
    }
  });
  // keyboard with rainbow keys (its own group, centered on the desk's crack)
  const kb = desk.keyboard; kb.position.set(dk.x, dk.y, dk.z + 0.12); root.add(kb);
  rbox(0.46, 0.025, 0.15, 0.008, mat(0x18181c, 0.5), 0, 0.012, 0, kb);
  const keyTex = canvasTex(256, 84, (g) => { for (let r = 0; r < 4; r++) for (let c = 0; c < 15; c++) { g.fillStyle = `hsl(${(c * 24 + r * 30) % 360},90%,62%)`; g.fillRect(4 + c * 16.8, 4 + r * 20, 14, 17); } });
  mk(new THREE.PlaneGeometry(0.44, 0.13), new THREE.MeshBasicMaterial({ map: keyTex, toneMapped: false, color: 0xbbbbbb }), kb, 0, 0.026, 0).rotation.x = -Math.PI / 2;

  // ---------------------------------------------------------------- the gaming chair (group at its floor point, back toward +z)
  const chair = new THREE.Group(); chair.position.set(DIMS.chair[0], 0, DIMS.chair[1]); root.add(chair);
  const cRed = mat(0xc8323c, 0.55), cBlk = mat(0x1d1d22, 0.55), chrome = mat(0x9a9ca2, 0.25, { metalness: 0.8 });
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; const leg = box(0.32, 0.04, 0.05, cBlk, Math.cos(a) * 0.16, 0.07, Math.sin(a) * 0.16, chair); leg.rotation.y = -a; mk(new THREE.SphereGeometry(0.035, 10, 8), cBlk, chair, Math.cos(a) * 0.31, 0.035, Math.sin(a) * 0.31); }
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 12), chrome, chair, 0, 0.25, 0);
  rbox(0.54, 0.09, 0.52, 0.04, cBlk, 0, DIMS.seatY - 0.05, 0, chair);
  rbox(0.34, 0.03, 0.44, 0.01, cRed, 0, DIMS.seatY + 0.003, 0, chair);
  for (const s of [-1, 1]) { box(0.04, 0.22, 0.05, cBlk, s * 0.29, DIMS.seatY + 0.11, -0.02, chair); rbox(0.08, 0.04, 0.28, 0.015, cBlk, s * 0.29, DIMS.seatY + 0.23, -0.04, chair); }
  const back = new THREE.Group(); back.position.set(0, DIMS.seatY, 0.24); back.rotation.x = 0.12; chair.add(back);
  rbox(0.54, 0.86, 0.12, 0.05, cBlk, 0, 0.48, 0, back);
  rbox(0.26, 0.8, 0.02, 0.01, cRed, 0, 0.5, -0.062, back);
  for (const s of [-1, 1]) { const wing = rbox(0.1, 0.5, 0.1, 0.04, cRed, s * 0.27, 0.42, -0.06, back); wing.rotation.y = -s * 0.35; }
  rbox(0.3, 0.13, 0.08, 0.05, cBlk, 0, 0.83, -0.09, back);   // the headrest pillow
  chair.userData.back = back;

  // ---------------------------------------------------------------- bed under the window, nightstand + alarm clock
  const B = DIMS.bed, bw = B.x1 - B.x0, bl = B.z1 - B.z0, bcx = (B.x0 + B.x1) / 2, bcz = (B.z0 + B.z1) / 2;
  box(bw + 0.06, 0.28, bl + 0.06, mat(0x5a4a3a, 0.7), bcx, 0.14, bcz);
  rbox(bw, 0.2, bl, 0.06, mat(0xf2efe8, 0.9), bcx, 0.38, bcz);
  rbox(bw - 0.3, 0.12, 0.34, 0.06, mat(0xe8e2f2, 0.95), bcx, B.top + 0.04, B.z0 + 0.25);
  const duvet = rbox(bw + 0.04, 0.12, bl * 0.6, 0.06, mat(0x4a6aa8, 0.95), bcx - 0.02, B.top + 0.02, bcz + 0.35); duvet.rotation.y = 0.08; duvet.rotation.z = 0.04;
  box(0.06, 0.8, bw + 0.06, mat(0x5a4a3a, 0.7), bcx, 0.4, B.z0 - 0.02).rotation.y = Math.PI / 2;
  box(0.44, 0.5, 0.4, mat(0x6a5a4a, 0.7), B.x0 - 0.35, 0.25, B.z0 + 0.25);   // nightstand
  const clockC = document.createElement('canvas'); clockC.width = 256; clockC.height = 96; const clockTex = new THREE.CanvasTexture(clockC); clockTex.colorSpace = THREE.SRGBColorSpace;
  function setClock(s) { const g = clockC.getContext('2d'); g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#ff4a3a'; g.font = 'bold 70px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 128, 52); clockTex.needsUpdate = true; }
  setClock('3:07');
  // the alarm clock sits on the window sill, facing the room
  rbox(0.08, 0.09, 0.2, 0.02, mat(0x18181c, 0.5), DIMS.x1 - 0.12, 1.135, -0.95);
  const clockFace = mk(new THREE.PlaneGeometry(0.17, 0.064), new THREE.MeshBasicMaterial({ map: clockTex, toneMapped: false }), root, DIMS.x1 - 0.162, 1.135, -0.95); clockFace.rotation.y = -Math.PI / 2; clockFace.castShadow = false;
  // window on the right wall above the bed (night city ↔ morning sky)
  const winNight = canvasTex(512, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1030'); gr.addColorStop(1, '#2a2a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(9); g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) g.fillRect(r() * w, r() * h * 0.5, 2, 2); for (let i = 0; i < 14; i++) { const bx = i * 38 - 10, bh = 90 + r() * 170; g.fillStyle = '#141838'; g.fillRect(bx, h - bh, 36, bh); g.fillStyle = '#ffd98a'; for (let y = h - bh + 10; y < h; y += 18) for (let x = bx + 5; x < bx + 32; x += 10) if (r() < 0.3) g.fillRect(x, y, 5, 8); } g.fillStyle = '#f4f0d8'; g.beginPath(); g.arc(400, 70, 26, 0, 7); g.fill(); });
  const winDay = canvasTex(512, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6fb2ee'); gr.addColorStop(1, '#cfe6f6'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(120, 80, 40, 0, 7); g.fill(); const r = rng(9); for (let i = 0; i < 14; i++) { const bx = i * 38 - 10, bh = 90 + r() * 170; g.fillStyle = '#9aa8c2'; g.fillRect(bx, h - bh, 36, bh); } g.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y] of [[300, 90], [360, 70], [420, 95]]) { g.beginPath(); g.arc(x, y, 34, 0, 7); g.fill(); } });
  const winM = new THREE.MeshBasicMaterial({ map: winNight, color: 0xcfcfcf });
  const win = mk(new THREE.PlaneGeometry(1.2, 0.9), winM, root, DIMS.x1 - 0.01, 1.55, -1.35); win.rotation.y = -Math.PI / 2; win.castShadow = false;
  const frameM = mat(0xf2efe8, 0.6);
  for (const dy of [-0.47, 0.47]) box(0.06, 0.05, 1.3, frameM, DIMS.x1 - 0.03, 1.55 + dy, -1.35);
  for (const dz of [-0.62, 0, 0.62]) box(0.06, 0.95, 0.05, frameM, DIMS.x1 - 0.03, 1.55, -1.35 + dz);
  box(0.16, 0.04, 1.36, frameM, DIMS.x1 - 0.08, 1.07, -1.35);

  // ---------------------------------------------------------------- the mirror (left wall), door, posters, shelves
  const M = DIMS.mirror;
  const mirrorFrame = rbox(0.06, M.h + 0.1, M.w + 0.1, 0.02, mat(0xe8e2d4, 0.5), M.x - 0.01, M.y, M.z);
  const mirror = new Reflector(new THREE.PlaneGeometry(M.w, M.h), { clipBias: 0.003, textureWidth: 512, textureHeight: 1024, color: 0xb8bcc4 });
  mirror.position.set(M.x + 0.025, M.y, M.z); mirror.rotation.y = Math.PI / 2; root.add(mirror);
  const door = new THREE.Group(); door.position.set(1.55, 0, DIMS.z1 - 0.03); root.add(door);
  box(0.86, 2.05, 0.05, mat(0xe8e2d4, 0.6), 0, 1.025, 0, door); mk(new THREE.SphereGeometry(0.035, 10, 8), chrome, door, -0.34, 1.0, -0.04);
  box(0.36, 0.5, 0.01, mat(0x2a2a30, 0.6), 0, 1.5, -0.03, door);   // a hoodie hung on the door
  const poster = (text, sub, c1, c2, w, h, x, y, z, ry) => {
    const tex = canvasTex(256, Math.round(256 * h / w), (g, cw, ch) => { const gr = g.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, cw, ch); g.fillStyle = '#fff'; g.textAlign = 'center';
      let s = 54; g.font = `900 ${s}px Helvetica, Arial, sans-serif`; while (g.measureText(text).width > cw - 24 && s > 12) { s -= 2; g.font = `900 ${s}px Helvetica, Arial, sans-serif`; } g.fillText(text, cw / 2, ch * 0.3);
      g.font = 'bold 22px Helvetica, Arial, sans-serif'; g.fillText(sub, cw / 2, ch * 0.42); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(cw / 2, ch * 0.72, cw * 0.25, 0, 7); g.fill(); });
    const m = mk(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color: 0xb4b4b4 }), root, x, y, z); m.rotation.y = ry; m.castShadow = false; return m;
  };
  poster('GOBLIN', 'QUEST II', '#2f5f9a', '#7a3a8a', 0.55, 0.8, -1.6, 1.75, DIMS.z0 + 0.01, 0);
  poster('SPACE', 'GOOSE', '#d2483f', '#e8a83a', 0.5, 0.7, 0.5, 1.8, DIMS.z0 + 0.01, 0);
  poster('RANK', 'BRONZE IV', '#6a6f7a', '#2a2a30', 0.6, 0.85, -0.6, 1.55, DIMS.z1 - 0.01, Math.PI);
  poster('NO', 'SLEEP CLUB', '#3a8a4a', '#1a3a2a', 0.5, 0.7, 0.45, 1.6, DIMS.z1 - 0.01, Math.PI);
  poster('LOOT', 'DROP', '#e8559a', '#5a2a6a', 0.5, 0.7, DIMS.x0 + 0.01, 1.7, -1.4, Math.PI / 2);
  const shelfM = mat(0xd9c4a2, 0.7);
  box(0.9, 0.03, 0.22, shelfM, -1.6, 1.25, DIMS.z0 + 0.12);
  for (let k = 0; k < 5; k++) mk(new THREE.CapsuleGeometry(0.03, 0.06, 4, 8), mat([0xd2483f, 0x5ad1ff, 0xffd166, 0x6fd88a, 0xe8559a][k], 0.5), root, -1.95 + k * 0.17, 1.32, DIMS.z0 + 0.12);
  // fairy lights along the front wall
  const bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd98a).multiplyScalar(1.5), toneMapped: false });
  for (let k = 0; k < 18; k++) { const x = DIMS.x0 + 0.3 + k * 0.24; mk(new THREE.SphereGeometry(0.018, 8, 6), bulbM, root, x, 2.25 - 0.08 * Math.sin((k % 6) / 6 * Math.PI), DIMS.z1 - 0.04).castShadow = false; }

  // ---------------------------------------------------------------- the chud dressing: laundry hill, beanbag, fridge, bin, pizza tower, cactus
  const cloth = [0x2a2a30, 0x4a6aa8, 0xd2483f, 0x6a6f7a, 0xe8e2d4, 0x3a8a4a];
  for (let k = 0; k < 9; k++) { const a = R() * 6.28, r = R() * 0.3; const c = rbox(0.34 + R() * 0.2, 0.08 + R() * 0.06, 0.26 + R() * 0.2, 0.04, mat(cloth[k % 6], 0.95), 1.75 + Math.cos(a) * r, 0.05 + k * 0.035, 1.55 + Math.sin(a) * r); c.rotation.y = R() * 3; c.rotation.z = R() * 0.3 - 0.15; }
  const bean = mk(new THREE.SphereGeometry(0.42, 20, 14), mat(0x6a3a8a, 0.9), root, -1.75, 0.3, 1.75); bean.scale.set(1, 0.7, 1);
  rbox(0.48, 0.62, 0.48, 0.03, mat(0xf2f2f2, 0.5), DIMS.x0 + 0.3, 0.31, -0.25);   // mini fridge
  box(0.02, 0.2, 0.02, chrome, DIMS.x0 + 0.555, 0.42, -0.1);
  mk(new THREE.CylinderGeometry(0.17, 0.14, 0.42, 16, 1, true), mat(0x6a6f7a, 0.6, { side: THREE.DoubleSide }), root, 0.55, 0.21, -2.1);
  for (let k = 0; k < 5; k++) mk(new THREE.SphereGeometry(0.07, 8, 6), mat(0xe8e2d4, 0.95), root, 0.5 + (k % 3) * 0.05, 0.43 + Math.floor(k / 3) * 0.06, -2.12 + (k % 2) * 0.06);
  for (let k = 0; k < 6; k++) { const p = rbox(0.4, 0.045, 0.4, 0.006, mat(0xd8b88a, 0.9), -1.85, 0.025 + k * 0.047, -1.2); p.rotation.y = (R() - 0.5) * 0.3; }
  mk(new THREE.CylinderGeometry(0.06, 0.05, 0.08, 12), mat(0xc87a4a, 0.8), root, -1.85, 0.33, -1.2);
  mk(new THREE.CapsuleGeometry(0.035, 0.08, 4, 8), mat(0x3a8a4a, 0.7), root, -1.85, 0.42, -1.2);

  // ---------------------------------------------------------------- the pendant lamp (pivot at the ceiling)
  const lamp = new THREE.Group(); lamp.position.set(DIMS.lamp[0], C, DIMS.lamp[1]); root.add(lamp);
  mk(new THREE.CylinderGeometry(0.006, 0.006, C - DIMS.lampY - 0.12, 6), legM, lamp, 0, -(C - DIMS.lampY - 0.12) / 2, 0);
  const shade = mk(new THREE.ConeGeometry(0.2, 0.18, 20, 1, true), mat(0xe8b04a, 0.6, { side: THREE.DoubleSide }), lamp, 0, -(C - DIMS.lampY) + 0.09, 0);
  const bulb = mk(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff2d0, toneMapped: false }), lamp, 0, -(C - DIMS.lampY) + 0.04, 0); bulb.castShadow = false;
  void shade;

  // ---------------------------------------------------------------- lights
  const hemi = new THREE.HemisphereLight(0x8a8ac8, 0x3a2a2a, 0.5); root.add(hemi);
  const monGlow = new THREE.PointLight(0x7ab0ff, 3.0, 4.5, 1.6); monGlow.position.set(dk.x, 1.15, dk.z + 0.5); root.add(monGlow);
  const rgb = new THREE.PointLight(0xb05aff, 2.2, 5, 1.6); rgb.position.set(-1.6, 2.2, -1.6); root.add(rgb);
  const lampLight = new THREE.PointLight(0xffd9a0, 0, 5, 1.6); lampLight.position.set(DIMS.lamp[0], DIMS.lampY - 0.05, DIMS.lamp[1]); root.add(lampLight);
  // both window lights start just inside the window (a light outside would be shadowed by the solid wall)
  const sun = new THREE.DirectionalLight(0xfff0d8, 0); sun.position.set(2.3, 2.5, -1.35); sun.target.position.set(0.3, 0, -0.9); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 16 });
  const moon = new THREE.DirectionalLight(0x8aa0ff, 0.5); moon.position.set(2.3, 2.3, -1.2); moon.target.position.set(0.3, 0, -0.6); root.add(moon, moon.target);
  moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 16 });

  function setMode(m, k = m === 'morning' ? 1 : 0) {
    winM.map = k > 0.5 ? winDay : winNight;
    hemi.color.set(k > 0.5 ? 0xfff4e6 : 0x8a8ac8); hemi.intensity = 0.5 + 0.7 * k;
    sun.intensity = 2.6 * k; moon.intensity = 0.5 * (1 - k);
    monGlow.intensity = 3.0 * (1 - 0.7 * k); rgb.intensity = 2.2 * (1 - 0.6 * k);
  }
  setMode(opts.mode ?? 'night');
  return { root, D: DIMS, chair, desk, screens, mirror, mirrorFrame, lamp, setClock, setMode, win, lights: { hemi, monGlow, rgb, lampLight, sun, moon } };
}
