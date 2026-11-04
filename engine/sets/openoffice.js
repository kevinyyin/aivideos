// SET: a bright open-plan office — 16 desks in four rows either side of a center aisle (monitor, keyboard, mug, papers, a swivel
// chair each), ceiling light panels, a window wall on a painted skyline, a door wall with a whiteboard, a clock, posters, a printer,
// a water cooler, plants. Built for video dh010 (the whole office stands up for the hero).
// Coordinates: room x∈[-4,4], z∈[-5,4], ceiling 2.9. Windows on z=-5 (and x=-4). The door is in the z=+4 wall at x=0 (DIMS.door).
// The aisle runs along z at x∈[-0.6,0.6]. Workers sit at DIMS.desks[i].seat facing −z (toward the windows), so a camera near the
// window wall looking +z sees every face and the hero walking in down the aisle. desks[i] = {x, z, seat:[x,z], chair, monitor}.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

const COLS = [-2.55, -1.3, 1.3, 2.55], ROWS = [-3.4, -1.7, 0.0, 1.7];
export const DIMS = {
  room: { x0: -4, x1: 4, z0: -5, z1: 4, h: 2.9 }, deskTop: 0.74, seat: 0.47, door: [0, 4], aisle: 0.6,
  desks: ROWS.flatMap((z) => COLS.map((x) => ({ x, z, seat: [x, z + 0.62] }))),
};

export function buildOpenOffice(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 12), Dm = DIMS.room;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const W = Dm.x1 - Dm.x0, D = Dm.z1 - Dm.z0, CZ = (Dm.z0 + Dm.z1) / 2;

  // shell: carpet tiles, walls, ceiling grid with light panels
  const carpet = canvasTex(256, 256, (g, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#7d8a96' : '#6f7c88'; g.fillRect(x * 64, y * 64, 64, 64); } g.fillStyle = 'rgba(255,255,255,.05)'; const r = rng(3); for (let i = 0; i < 900; i++) g.fillRect(r() * w, r() * h, 2, 2); }, [5, 6]);
  const floor = mk(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: carpet, roughness: 0.95 }), root, 0, 0, CZ); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const wallM = mat(0xeef0ec, 0.9), accent = mat(0x4fb3a8, 0.8);
  box(W, Dm.h, 0.12, wallM, 0, Dm.h / 2, Dm.z1 + 0.06);                                   // door wall (the door is a darker panel + frame)
  box(0.12, Dm.h, D, wallM, Dm.x1 + 0.06, Dm.h / 2, CZ);                                   // right wall
  box(W, 0.4, 0.13, accent, 0, 0.2, Dm.z1 + 0.05); box(0.13, 0.4, D, accent, Dm.x1 + 0.05, 0.2, CZ);   // teal skirting band
  box(W + 0.3, 0.1, D + 0.3, mat(0xf6f6f2, 0.95), 0, Dm.h + 0.05, CZ);
  const panelM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.25, 1.25, 1.2), toneMapped: false });
  for (const z of [-3.4, -1.0, 1.4]) for (const x of [-2.2, 0, 2.2]) box(1.1, 0.02, 0.55, panelM, x, Dm.h - 0.01, z).castShadow = false;
  // window walls on a painted skyline (z0 and x0)
  const skyTex = canvasTex(1024, 420, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#79b2e6'); gr.addColorStop(1, '#dbeaf3'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(9); for (let x = 0; x < w;) { const bw = 40 + r() * 70, bh = 120 + r() * 250; g.fillStyle = `hsl(${205 + r() * 20},${15 + r() * 15}%,${55 + r() * 20}%)`; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,.35)'; for (let y = h - bh + 8; y < h; y += 14) for (let xx = x + 5; xx < x + bw - 6; xx += 11) g.fillRect(xx, y, 6, 7); x += bw + 4; }
  });
  const skyA = mk(new THREE.PlaneGeometry(16, 6), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false }), root, 0, 1.7, Dm.z0 - 2.0); skyA.castShadow = false;
  const skyB = mk(new THREE.PlaneGeometry(16, 6), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false }), root, Dm.x0 - 2.0, 1.7, CZ); skyB.rotation.y = Math.PI / 2; skyB.castShadow = false;
  const mullM = mat(0x3a3d42, 0.4);
  for (let x = Dm.x0; x <= Dm.x1 + 1e-6; x += 1.6) box(0.08, Dm.h, 0.1, mullM, x, Dm.h / 2, Dm.z0);
  for (let z = Dm.z0; z <= Dm.z1 + 1e-6; z += 1.8) box(0.1, Dm.h, 0.08, mullM, Dm.x0, Dm.h / 2, z);
  for (const y of [0.06, Dm.h - 0.06]) { box(W, 0.12, 0.12, mullM, 0, y, Dm.z0); box(0.12, 0.12, D, mullM, Dm.x0, y, CZ); }

  // the door (x=0 on the z1 wall): frame + a leaf on a hinge group (rotation.y opens it inward)
  const [dx, dz] = DIMS.door;
  box(1.2, 2.25, 0.16, mat(0x3a3d42, 0.5), dx, 1.125, dz + 0.02);
  const door = new THREE.Group(); door.position.set(dx - 0.5, 0, dz - 0.05); root.add(door);
  rbox(1.0, 2.15, 0.05, 0.01, mat(0x9a7a5a, 0.6), 0.5, 1.075, 0, door);
  mk(new THREE.SphereGeometry(0.035, 10, 8), mat(0xc9c4be, 0.3, { metalness: 0.7 }), door, 0.88, 1.0, -0.05);
  const doorGlass = box(0.3, 0.6, 0.06, new THREE.MeshBasicMaterial({ color: 0xcfe2ef }), 0.5, 1.55, 0, door); doorGlass.castShadow = false;

  // dressing on the door wall: whiteboard (a canvas the video can redraw), clock, two posters, a printer, a water cooler, plants
  const boardCanvas = document.createElement('canvas'); boardCanvas.width = 768; boardCanvas.height = 384;
  const boardTex = new THREE.CanvasTexture(boardCanvas); boardTex.colorSpace = THREE.SRGBColorSpace;
  const drawBoard = (title, lines) => {
    const g = boardCanvas.getContext('2d'), w = boardCanvas.width, h = boardCanvas.height;
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h); g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillStyle = '#2f6fd0'; g.font = 'bold 54px "Marker Felt", "Comic Sans MS", Helvetica, sans-serif'; g.fillText(title, 40, 30);
    g.fillStyle = '#2a2a30'; g.font = '38px "Marker Felt", "Comic Sans MS", Helvetica, sans-serif'; lines.forEach((l, i) => g.fillText(l, 50, 120 + i * 62));
    g.strokeStyle = '#d2483f'; g.lineWidth = 6; g.beginPath(); g.moveTo(420, 300); g.lineTo(520, 220); g.lineTo(600, 250); g.lineTo(720, 120); g.stroke();
    boardTex.needsUpdate = true;
  };
  drawBoard(opts.board ?? 'Q3 GOALS', opts.boardLines ?? ['• synergy', '• more synergy', '• fix the printer']);
  box(2.0, 1.05, 0.04, mat(0xb8bcc2, 0.4, { metalness: 0.5 }), -2.1, 1.55, Dm.z1 - 0.03);
  const board = mk(new THREE.PlaneGeometry(1.9, 0.95), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.5 }), root, -2.1, 1.55, Dm.z1 - 0.055); board.rotation.y = Math.PI; board.castShadow = false;
  const clock = mk(new THREE.CircleGeometry(0.2, 32), new THREE.MeshStandardMaterial({ roughness: 0.5, map: canvasTex(128, 128, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 6; g.stroke(); g.lineCap = 'round'; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 28); g.stroke(); g.beginPath(); g.moveTo(64, 64); g.lineTo(84, 52); g.stroke(); }) }), root, 1.6, 2.3, Dm.z1 - 0.01);
  clock.rotation.y = Math.PI;
  const poster = (w, h, x, y, draw) => { const m = mk(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ roughness: 0.7, map: canvasTex(400, Math.round(400 * h / w), draw) }), root, x, y, Dm.z1 - 0.01); m.rotation.y = Math.PI; m.castShadow = false; return m; };
  poster(0.8, 1.05, 2.3, 1.55, (g, w, h) => { g.fillStyle = '#2f4f73'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2b632'; g.beginPath(); g.moveTo(60, 380); g.lineTo(200, 120); g.lineTo(340, 380); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = 'bold 54px Georgia, serif'; g.fillText('HUSTLE', w / 2, 470); });
  poster(0.7, 0.9, 3.35, 1.5, (g, w, h) => { g.fillStyle = '#f6efe2'; g.fillRect(0, 0, w, h); g.fillStyle = '#d2483f'; g.beginPath(); g.arc(w / 2, 190, 110, 0, 7); g.fill(); g.fillStyle = '#2a2a30'; g.textAlign = 'center'; g.font = 'bold 46px Helvetica, Arial, sans-serif'; g.fillText('BE THE', w / 2, 400); g.fillText('COFFEE', w / 2, 455); });
  const printer = new THREE.Group(); printer.position.set(-3.45, 0, 3.4); root.add(printer);
  box(0.7, 0.75, 0.6, mat(0x6a6f78, 0.6), 0, 0.375, 0, printer); rbox(0.66, 0.32, 0.56, 0.03, mat(0xe9eaec, 0.5), 0, 0.91, 0, printer); box(0.42, 0.01, 0.3, mat(0xffffff, 0.8), 0, 1.075, 0.05, printer);
  const cooler = new THREE.Group(); cooler.position.set(3.45, 0, 3.4); root.add(cooler);
  box(0.36, 1.0, 0.36, mat(0xf4f1ea, 0.4), 0, 0.5, 0, cooler); mk(new THREE.CylinderGeometry(0.15, 0.15, 0.42, 16), mat(0x8fc6ef, 0.05, { transparent: true, opacity: 0.6 }), cooler, 0, 1.22, 0);
  const plant = (x, z, s) => { const pg = new THREE.Group(); pg.position.set(x, 0, z); pg.scale.setScalar(s); root.add(pg); mk(new THREE.CylinderGeometry(0.22, 0.17, 0.42, 14), mat(0xf4f1ea, 0.5), pg, 0, 0.21, 0); for (let k = 0; k < 10; k++) { const lf = mk(new THREE.SphereGeometry(0.22, 10, 8), mat(0x3f7a3a, 0.8), pg, Math.sin(k * 2.4) * 0.18, 0.7 + (k % 3) * 0.2, Math.cos(k * 2.4) * 0.18); lf.scale.set(0.45, 1.6, 0.25); lf.rotation.z = Math.sin(k) * 0.6; } };
  plant(-0.95, 3.55, 1.1); plant(0.95, 3.55, 1.0); plant(3.5, -1.0, 1.2); plant(-3.55, -4.5, 1.1);

  // desks: top + legs + a low front divider, monitor (screen = a soft blue Basic material), keyboard, mug, papers, a swivel chair
  const deskM = mat(0xe8e1d4, 0.5), legM = mat(0x3a3d42, 0.4), divM = mat(0x8fa6b8, 0.8);
  const screenM = [0x9cc8ef, 0xb8e0c8, 0xf0d7a8, 0xc7b8ef].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  const CHAIRS = [0x2f4f73, 0x1d1d22, 0xd2483f, 0x3f7a3a];
  const desks = DIMS.desks.map((d, i) => {
    const g = new THREE.Group(); g.position.set(d.x, 0, d.z); root.add(g);
    rbox(1.1, 0.04, 0.72, 0.01, deskM, 0, DIMS.deskTop - 0.02, 0, g);
    for (const sx of [-0.52, 0.52]) box(0.04, DIMS.deskTop - 0.04, 0.66, legM, sx, (DIMS.deskTop - 0.04) / 2, 0, g);
    box(1.1, 0.3, 0.03, divM, 0, DIMS.deskTop + 0.15, -0.37, g);
    const monitor = new THREE.Group(); monitor.position.set(0, DIMS.deskTop, -0.18); g.add(monitor);
    box(0.5, 0.31, 0.03, mat(0x1d1f24, 0.4), 0, 0.3, 0, monitor); box(0.46, 0.27, 0.005, screenM[i % 4], 0, 0.3, 0.017, monitor).castShadow = false;
    box(0.04, 0.14, 0.04, mat(0x1d1f24, 0.4), 0, 0.08, -0.02, monitor); box(0.2, 0.012, 0.14, mat(0x1d1f24, 0.4), 0, 0.006, -0.02, monitor);
    box(0.36, 0.015, 0.12, mat(0x2a2d31, 0.5), 0, DIMS.deskTop + 0.008, 0.12, g);
    mk(new THREE.CylinderGeometry(0.035, 0.03, 0.09, 12), mat([0xd2483f, 0xf4f1ea, 0x3d7bd9, 0xf2b632][(i * 3) % 4], 0.4), g, 0.4, DIMS.deskTop + 0.045, 0.1);
    for (let k = 0; k < 3; k++) box(0.21, 0.003, 0.297, mat(0xffffff, 0.8), -0.32 + k * 0.01, DIMS.deskTop + 0.002 + k * 0.003, 0.08).rotation.y = (k - 1) * 0.1 + R() * 0.1;
    const chair = new THREE.Group(); chair.position.set(d.seat[0], 0, d.seat[1] + 0.06); root.add(chair);
    const cm = mat(CHAIRS[i % 4], 0.7);
    rbox(0.5, 0.08, 0.48, 0.03, cm, 0, DIMS.seat - 0.04, 0, chair); rbox(0.48, 0.5, 0.07, 0.03, cm, 0, DIMS.seat + 0.3, 0.24, chair);
    mk(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), legM, chair, 0, 0.22, 0);
    for (let k = 0; k < 5; k++) { const l = box(0.3, 0.03, 0.04, legM, Math.cos(k * 1.256) * 0.15, 0.04, Math.sin(k * 1.256) * 0.15, chair); l.rotation.y = -k * 1.256; }
    return { ...d, g, chair, monitor };
  });

  // lights: window daylight + bright ceiling + fills (the room is lit evenly, like an office)
  const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x7a7466, 1.25); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2e0, 1.9); sun.position.set(-3, 6, -9); sun.target.position.set(0, 0, 0); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 24 }); sun.shadow.bias = -0.0005;
  const ceil = [[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z]) => { const l = new THREE.PointLight(0xfff6ea, 3.0, 7, 1.5); l.position.set(x, 2.6, z); root.add(l); return l; });
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) o.castShadow = false; });
  return { root, D: DIMS, desks, door, board, drawBoard, printer, cooler, lights: { hemi, sun, ceil } };
}
