// SET: a small late-night radio station booth (built for dh004, "SAD FM 103.7") + a rooftop antenna tower with neon letters.
// Booth: dark foam walls, a DJ desk facing the camera (mixing console, two monitors, a mic on a boom arm, tissues, a mug,
// records), and on the back wall behind the DJ: the station logo, an ON AIR light and a big LISTENERS counter (readable).
// A rainy night window on the right wall, a record shelf + a SAD HOURS poster on the left wall.
// Coordinates (meters, y up): room x∈[-2.2,2.2], z∈[-2,2.5], ceiling 2.7. The DJ sits at DIMS.dj (seat top DIMS.seat), faces +z;
// the desk's front edge is at z = -0.55 (top DIMS.deskTop). Camera usually at +z looking −z (the wall signs sit behind the DJ).
// Handles: setOnAir(k 0..1), setListeners(n) (redraws the counter), setPower(k 0..1) (everything electric fades: monitors,
// console LEDs, logo, desk lamp; a little blue window light stays), update(t) (rain on the window, soft monitor shimmer).
// makeRadioTower({h, text, letterH, signY}) → { g, beacons[] (red lamp materials, top first), letters[] ({g (pivot at its
// foot), m (material), on (its lit color)}) }: a 3-leg lattice antenna with red beacons and "SAD FM" channel letters, either on
// a frame at its base (signY 0) or riding on the tower's front at height signY (put it on a roof).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng, clamp } from '@engine/core.js';

export const DIMS = { room: { x0: -2.2, x1: 2.2, z0: -2, z1: 2.5, h: 2.7 }, dj: [0, -1.55], seat: 0.48, deskTop: 0.76, deskZ: [-1.2, -0.55] };

const LOGO_BLUE = '#8fc8ff';
/** set g.font to the largest size ≤ s at which every line fits in maxW px (nothing runs past its card) */
function fit(g, lines, maxW, weight, s) { g.font = `${weight} ${s}px Helvetica, Arial, sans-serif`; const mw = Math.max(...lines.map((l) => g.measureText(l).width)); if (mw > maxW) g.font = `${weight} ${Math.floor((s * maxW) / mw)}px Helvetica, Arial, sans-serif`; }
function logoTex() {
  return canvasTex(768, 288, (g, w, h) => {
    g.fillStyle = '#0d1424'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(143,200,255,.5)'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
    // a little crying cloud
    g.fillStyle = '#9fb0c8'; for (const [x, y, r] of [[118, 112, 46], [80, 128, 34], [158, 128, 36], [120, 142, 40]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.fillStyle = '#0d1424'; g.beginPath(); g.arc(104, 120, 5, 0, 7); g.arc(134, 120, 5, 0, 7); g.fill();
    g.strokeStyle = '#0d1424'; g.lineWidth = 4; g.beginPath(); g.arc(119, 148, 11, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    g.strokeStyle = LOGO_BLUE; g.lineWidth = 5; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(78 + i * 20, 192); g.lineTo(72 + i * 20, 226); g.stroke(); }
    g.shadowColor = LOGO_BLUE; g.shadowBlur = 24; g.fillStyle = '#d8ecff'; g.textAlign = 'left'; g.textBaseline = 'middle';
    fit(g, ['SAD FM'], w - 222 - 34, 'bold', 132); g.fillText('SAD FM', 222, 128);
    fit(g, ['103.7 · SAD HOURS'], w - 228 - 34, 'bold', 54); g.fillStyle = LOGO_BLUE; g.fillText('103.7 · SAD HOURS', 228, 222);
  });
}

export function buildRadio(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 37), D = DIMS.room;
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);

  // shell: carpet, dark walls with acoustic foam, ceiling
  const foamT = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#2a3142'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const vert = (x + y) % 2; for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#323b50' : '#232a39'; if (vert) g.fillRect(x * 64 + k * 16, y * 64, 16, 64); else g.fillRect(x * 64, y * 64 + k * 16, 64, 16); } }
  }, [6, 3]);
  const foamM = new THREE.MeshStandardMaterial({ map: foamT, roughness: 1 });
  const wallM = mat(0x2b3040, 0.9), trimM = mat(0x1a1d26, 0.6);
  box(D.x1 - D.x0, 0.05, D.z1 - D.z0, mat(0x3a3348, 1), 0, -0.025, (D.z0 + D.z1) / 2).receiveShadow = true;
  box(D.x1 - D.x0, D.h, 0.1, foamM, 0, D.h / 2, D.z0 - 0.05);
  box(0.1, D.h, D.z1 - D.z0, foamM, D.x0 - 0.05, D.h / 2, (D.z0 + D.z1) / 2);
  box(0.1, 0.9, D.z1 - D.z0, wallM, D.x1 + 0.05, 0.45, (D.z0 + D.z1) / 2);                        // right wall: low part
  box(0.1, D.h - 2.15, D.z1 - D.z0, wallM, D.x1 + 0.05, (D.h + 2.15) / 2, (D.z0 + D.z1) / 2);     // above the window
  for (const [z0, z1] of [[D.z0, -1.2], [0.6, D.z1]]) box(0.1, 1.25, z1 - z0, wallM, D.x1 + 0.05, 1.525, (z0 + z1) / 2);
  box(D.x1 - D.x0, 0.06, D.z1 - D.z0, mat(0x1d2130, 0.9), 0, D.h + 0.03, (D.z0 + D.z1) / 2);
  box(D.x1 - D.x0, 0.1, 0.03, trimM, 0, 0.05, D.z0 + 0.01);

  // window (right wall): rainy night city, streaks scroll down
  const nightT = canvasTex(512, 384, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1230'); gr.addColorStop(1, '#27305a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { const bw = 30 + R() * 50, bh = 80 + R() * 200, x = i * 38 - 10; g.fillStyle = '#141a33'; g.fillRect(x, h - bh, bw, bh); for (let y = h - bh + 8; y < h - 6; y += 16) for (let xx = x + 5; xx < x + bw - 6; xx += 12) if (R() < 0.35) { g.fillStyle = R() < 0.5 ? '#f2c97a' : '#a8c4f2'; g.fillRect(xx, y, 5, 7); } }
  });
  const view = mk(new THREE.PlaneGeometry(1.9, 1.35), new THREE.MeshBasicMaterial({ map: nightT, color: 0x9aa4c0 }), root, D.x1 + 0.3, 1.55, -0.3); view.rotation.y = -Math.PI / 2;
  const rainT = canvasTex(128, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(200,220,255,${0.25 + R() * 0.35})`; g.lineWidth = 1.5; const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y + 18 + R() * 20); g.stroke(); } }, [3, 2]);
  const rainPane = mk(new THREE.PlaneGeometry(1.8, 1.25), new THREE.MeshBasicMaterial({ map: rainT, transparent: true, depthWrite: false }), root, D.x1 + 0.06, 1.55, -0.3); rainPane.rotation.y = -Math.PI / 2;
  for (const z of [-1.2, 0.6]) box(0.12, 1.3, 0.06, trimM, D.x1 + 0.03, 1.525, z);
  box(0.12, 0.06, 1.86, trimM, D.x1 + 0.03, 0.9, -0.3); box(0.12, 0.06, 1.86, trimM, D.x1 + 0.03, 2.15, -0.3);

  // back wall signs: logo (left of the DJ), ON AIR + the LISTENERS counter (right of the DJ)
  const logoM = new THREE.MeshBasicMaterial({ map: logoTex(), toneMapped: false });
  rbox(1.78, 0.7, 0.06, 0.02, trimM, -0.5, 1.95, D.z0 + 0.03);
  mk(new THREE.PlaneGeometry(1.7, 0.64), logoM, root, -0.5, 1.95, D.z0 + 0.065);
  const airOn = canvasTex(320, 128, (g, w, h) => { g.fillStyle = '#ff3a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff4f0'; fit(g, ['ON AIR'], w - 40, 'bold', 76); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ON AIR', w / 2, h / 2 + 4); });
  const airOff = canvasTex(320, 128, (g, w, h) => { g.fillStyle = '#3a1416'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a2a2c'; fit(g, ['ON AIR'], w - 40, 'bold', 76); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ON AIR', w / 2, h / 2 + 4); });
  rbox(0.78, 0.34, 0.12, 0.03, trimM, 0.95, 2.3, D.z0 + 0.06);
  const airM = new THREE.MeshBasicMaterial({ map: airOn, toneMapped: false });
  mk(new THREE.PlaneGeometry(0.7, 0.28), airM, root, 0.95, 2.3, D.z0 + 0.125);
  const cntCan = document.createElement('canvas'); cntCan.width = 384; cntCan.height = 256;
  const cntTex = new THREE.CanvasTexture(cntCan); cntTex.colorSpace = THREE.SRGBColorSpace;
  let cntLast = null;
  function setListeners(n) {
    if (n === cntLast) return; cntLast = n;
    const g = cntCan.getContext('2d'); g.fillStyle = '#0c0d10'; g.fillRect(0, 0, 384, 256);
    g.strokeStyle = '#3a3d46'; g.lineWidth = 8; g.strokeRect(4, 4, 376, 248);
    g.fillStyle = '#ffb347'; fit(g, ['LISTENERS'], 384 - 50, 'bold', 50); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LISTENERS', 192, 58);
    g.fillStyle = n > 0 ? '#ffd27a' : '#ff6a5a'; g.font = 'bold 150px Courier New, monospace'; g.fillText(String(n), 192, 170);
    cntTex.needsUpdate = true;
  }
  setListeners(1);
  rbox(0.82, 0.58, 0.08, 0.02, trimM, 0.95, 1.68, D.z0 + 0.04);
  const cntM = new THREE.MeshBasicMaterial({ map: cntTex, toneMapped: false });
  mk(new THREE.PlaneGeometry(0.75, 0.5), cntM, root, 0.95, 1.68, D.z0 + 0.085);

  // left wall: record shelf + SAD HOURS poster
  const shelfM = mat(0x4a3a2e, 0.7);
  for (let k = 0; k < 3; k++) box(0.32, 0.03, 1.4, shelfM, D.x0 + 0.17, 0.55 + k * 0.42, 0.9);
  const recC = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xe08a3a, 0x1d1d22];
  for (let k = 0; k < 3; k++) for (let i = 0; i < 30; i++) { const r = box(0.3, 0.3, 0.02, mat(recC[Math.floor(R() * recC.length)], 0.7), D.x0 + 0.18, 0.72 + k * 0.42, 0.25 + i * 0.044); r.rotation.x = (R() - 0.5) * 0.12; }
  const posterT = canvasTex(256, 360, (g, w, h) => { g.fillStyle = '#1f2a48'; g.fillRect(0, 0, w, h); g.fillStyle = '#8fc8ff'; fit(g, ['HOURS'], w - 30, 'bold', 54); g.textAlign = 'center'; g.fillText('SAD', w / 2, 110); g.fillText('HOURS', w / 2, 170); g.fillStyle = '#f2c97a'; g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.fillText('12 – 5 AM', w / 2, 230); g.fillStyle = '#9fb0c8'; fit(g, ['songs to stare', 'at the ceiling to'], w - 30, '', 24); g.fillText('songs to stare', w / 2, 290); g.fillText('at the ceiling to', w / 2, 320); });
  const poster = mk(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshStandardMaterial({ map: posterT, roughness: 0.8 }), root, D.x0 + 0.06, 1.75, -1.0); poster.rotation.y = Math.PI / 2;

  // desk + gear
  const deskM = mat(0x23262f, 0.5), [dz0, dz1] = DIMS.deskZ, dzc = (dz0 + dz1) / 2;
  rbox(2.5, 0.06, dz1 - dz0, 0.02, deskM, 0, DIMS.deskTop - 0.03, dzc);
  rbox(2.5, DIMS.deskTop - 0.06, 0.05, 0.01, mat(0x2f3340, 0.6), 0, (DIMS.deskTop - 0.06) / 2, dz1 - 0.03);
  const ledM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7ad1ff).multiplyScalar(1.4), toneMapped: false });
  box(2.4, 0.025, 0.02, ledM, 0, DIMS.deskTop - 0.075, dz1 - 0.001).castShadow = false;      // LED strip along the desk front
  const consoleT = canvasTex(512, 192, (g, w, h) => {
    g.fillStyle = '#2e323c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) { const x = 24 + i * 40; g.fillStyle = '#15171c'; g.fillRect(x + 12, 70, 6, 100); g.fillStyle = '#d8dce4'; g.fillRect(x + 4, 90 + R() * 60, 22, 12); for (let k = 0; k < 3; k++) { g.fillStyle = ['#ff6a5a', '#ffd27a', '#7ad1ff'][k]; g.beginPath(); g.arc(x + 15, 16 + k * 18, 6, 0, 7); g.fill(); } }
  });
  const consoleM = new THREE.MeshStandardMaterial({ map: consoleT, roughness: 0.5, emissive: 0xffffff, emissiveMap: consoleT, emissiveIntensity: 0.35 });
  const cons = rbox(1.0, 0.07, 0.42, 0.015, consoleM, 0, DIMS.deskTop + 0.04, dzc + 0.05); cons.rotation.x = 0.18;
  const monM = new THREE.MeshBasicMaterial({ color: 0x5a86c8 });
  const monitors = [-0.82, 0.82].map((x) => {
    const m = new THREE.Group(); m.position.set(x, DIMS.deskTop, dz0 + 0.2); m.rotation.y = x < 0 ? 0.35 : -0.35; root.add(m);
    box(0.06, 0.3, 0.06, trimM, 0, 0.15, 0, m); box(0.62, 0.38, 0.04, trimM, 0, 0.45, 0, m);
    mk(new THREE.PlaneGeometry(0.57, 0.33), monM, m, 0, 0.45, -0.021).rotation.y = Math.PI;       // the screen faces the DJ (−z)
    return m;
  });
  // mic on a boom arm from the desk's back-left corner, ending beside the DJ's mouth
  const armM = mat(0x2a2c32, 0.4, { metalness: 0.5 }), boom = new THREE.Group(); boom.position.set(-0.75, DIMS.deskTop, dz0 + 0.1); root.add(boom);
  mk(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 16), armM, boom, 0, 0.02, 0);
  const a1 = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), armM, boom, 0.08, 0.27, -0.05); a1.rotation.z = -0.3;
  const a2 = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 8), armM, boom, 0.38, 0.5, -0.12); a2.rotation.z = -1.35; a2.rotation.y = 0.3;
  const mic = mk(new THREE.CapsuleGeometry(0.035, 0.12, 6, 12), mat(0x1d1f24, 0.4, { metalness: 0.4 }), boom, 0.62, 0.43, -0.2); mic.rotation.z = 0.5;
  mk(new THREE.TorusGeometry(0.06, 0.008, 6, 18), armM, boom, 0.62, 0.43, -0.2).rotation.y = Math.PI / 2;
  // desk dressing: tissues, mug, a wilted plant, a vinyl stack, a lamp
  const tis = rbox(0.24, 0.11, 0.13, 0.01, mat(0x9fc8e6, 0.8), 0.62, DIMS.deskTop + 0.055, dzc + 0.12);
  void tis; mk(new THREE.SphereGeometry(0.05, 10, 8), mat(0xf6f6f4, 0.9), root, 0.62, DIMS.deskTop + 0.13, dzc + 0.12).scale.set(1, 0.9, 0.6);
  for (let i = 0; i < 6; i++) mk(new THREE.SphereGeometry(0.035, 8, 6), mat(0xf4f4f0, 0.9), root, 0.85 + (R() - 0.5) * 0.3, DIMS.deskTop + 0.02, dzc + (R() - 0.5) * 0.3).scale.set(1, 0.6, 1);   // used tissues
  mk(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 16), mat(0x8f6fb8, 0.6), root, -0.5, DIMS.deskTop + 0.05, dzc + 0.15);
  mk(new THREE.CylinderGeometry(0.07, 0.06, 0.12, 12), mat(0xc0603a, 0.8), root, -1.1, DIMS.deskTop + 0.06, dzc);
  for (let k = 0; k < 4; k++) { const l = mk(new THREE.CapsuleGeometry(0.012, 0.16, 3, 6), mat(0x8a7a3a, 0.8), root, -1.1 + (k - 1.5) * 0.03, DIMS.deskTop + 0.18, dzc + 0.02); l.rotation.z = 1.0 - k * 0.6; l.rotation.x = 0.6; }
  for (let i = 0; i < 5; i++) box(0.31, 0.012, 0.31, mat(recC[i], 0.7), 1.0, DIMS.deskTop + 0.006 + i * 0.013, dzc - 0.02).rotation.y = (R() - 0.5) * 0.4;
  const lampG = new THREE.Group(); lampG.position.set(1.05, DIMS.deskTop, dz0 + 0.08); root.add(lampG);
  mk(new THREE.CylinderGeometry(0.07, 0.08, 0.025, 14), armM, lampG, 0, 0.012, 0);
  const la = mk(new THREE.CylinderGeometry(0.01, 0.01, 0.42, 8), armM, lampG, -0.05, 0.22, 0.02); la.rotation.z = 0.25;
  const shade = mk(new THREE.ConeGeometry(0.09, 0.12, 16, 1, true), mat(0x2a2c32, 0.5, { side: THREE.DoubleSide }), lampG, -0.14, 0.42, 0.06); shade.rotation.z = 0.9;
  // chair
  const chair = new THREE.Group(); chair.position.set(DIMS.dj[0], 0, DIMS.dj[1]); root.add(chair);
  rbox(0.5, 0.08, 0.48, 0.03, mat(0x1d1f24, 0.7), 0, DIMS.seat - 0.04, 0, chair);
  rbox(0.5, 0.62, 0.08, 0.03, mat(0x1d1f24, 0.7), 0, DIMS.seat + 0.33, -0.27, chair);
  mk(new THREE.CylinderGeometry(0.03, 0.03, DIMS.seat - 0.1, 8), armM, chair, 0, (DIMS.seat - 0.1) / 2, 0);

  // lights: dim cool hemi, a warm desk lamp, the ON AIR red glow, a blue monitor fill on the DJ's face, cool window light
  const hemi = new THREE.HemisphereLight(0x7a8cc8, 0x2a2230, 0.55); root.add(hemi);
  const lampL = new THREE.PointLight(0xffc98a, 2.6, 4.5, 1.6); lampL.position.set(0.85, 1.35, -0.2); root.add(lampL);
  const airL = new THREE.PointLight(0xff3a3a, 1.2, 3.2, 1.8); airL.position.set(0.95, 2.1, -1.2); root.add(airL);
  const monL = new THREE.PointLight(0x9ab8ff, 3.2, 3.0, 1.8); monL.position.set(0, 1.35, -0.75); root.add(monL);
  const winL = new THREE.PointLight(0x6a86d8, 1.2, 5, 1.6); winL.position.set(D.x1 - 0.8, 1.6, -0.3); root.add(winL);
  const key = new THREE.DirectionalLight(0xb8c8ff, 0.6); key.position.set(1.5, 3, 3); key.target.position.set(0, 1, -1.5); root.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 10 });

  let air = 1, power = 1;
  const logoCol = new THREE.Color(1, 1, 1), ledCol = ledM.color.clone(), monCol = monM.color.clone();
  function apply() {
    const lit = air * power;
    airM.map = lit > 0.5 ? airOn : airOff; airL.intensity = 1.2 * lit;
    logoM.color.copy(logoCol).multiplyScalar(0.18 + 0.82 * power);
    cntM.color.setScalar(0.12 + 0.88 * power);
    ledM.color.copy(ledCol).multiplyScalar(power); monM.color.copy(monCol).multiplyScalar(0.06 + 0.94 * power);
    consoleM.emissiveIntensity = 0.35 * power; lampL.intensity = 2.6 * power; monL.intensity = 3.2 * power;
    hemi.intensity = 0.25 + 0.3 * power;
  }
  const setOnAir = (k) => { air = clamp(k); apply(); };
  const setPower = (k) => { power = clamp(k); apply(); };
  apply();
  function update(t) { rainT.offset.y = (t * 0.9) % 1; monM.color.copy(monCol).multiplyScalar((0.06 + 0.94 * power) * (0.92 + 0.08 * Math.sin(t * 3.1))); }

  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D: DIMS, chair, monitors, boom, setOnAir, setListeners, setPower, update, lights: { hemi, lampL, airL, monL, winL, key } };
}

/** A 3-leg lattice antenna tower (base half-width 1.3 m → 0.25 m at the top) with red beacons, and a frame of "SAD FM" neon
 *  channel letters in front of its base (letters face +z, along x, centered on the tower). */
export function makeRadioTower({ h = 22, text = 'SAD FM', letterH = 1.7, signY = 0 } = {}) {
  const g = new THREE.Group(), steel = mat(0xb8463a, 0.55, { metalness: 0.3 }), white = mat(0xe8e6e0, 0.55, { metalness: 0.3 });
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  function rod(a, b, r, m) {
    _a.set(...a); _b.set(...b); const len = _a.distanceTo(_b);
    const c = mk(new THREE.CylinderGeometry(r, r, len, 6), m, g); c.position.copy(_a).add(_b).multiplyScalar(0.5);
    c.quaternion.setFromUnitVectors(up, _b.sub(_a).normalize()); return c;
  }
  const leg = (k, y) => { const w = 1.3 + (0.25 - 1.3) * (y / h), a = (k / 3) * Math.PI * 2 + Math.PI / 2; return [Math.cos(a) * w, y, Math.sin(a) * w]; };
  const SEG = 12, dy = h / SEG;
  for (let s = 0; s < SEG; s++) {
    const y0 = s * dy, y1 = y0 + dy, m = s % 2 ? steel : white;
    for (let k = 0; k < 3; k++) {
      rod(leg(k, y0), leg(k, y1), 0.06, m);
      const n = (k + 1) % 3; rod(leg(k, y0), leg(n, y1), 0.022, m); rod(leg(n, y0), leg(k, y1), 0.022, m); rod(leg(k, y1), leg(n, y1), 0.022, m);
    }
  }
  rod([0, h, 0], [0, h + 3.5, 0], 0.05, white);
  const beacons = [];
  for (const y of [h + 3.5, h, h * 0.75, h * 0.5, h * 0.25]) {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2a1a).multiplyScalar(2.2), toneMapped: false });
    for (let k = 0; k < (y > h ? 1 : 3); k++) { const p = y > h ? [0, y, 0] : leg(k, y); const b = mk(new THREE.SphereGeometry(0.16, 12, 8), m, g, p[0], p[1], p[2]); b.castShadow = false; }
    beacons.push(m);
  }
  // channel letters on a frame at the base (in front of the tower, facing +z)
  // signY > 0: the letters ride on the tower's front face at that height; signY = 0: on a frame in front of the base
  const zs = signY > 0 ? leg(0, signY)[2] + 0.35 : 2.2, sign = new THREE.Group(); sign.position.set(0, signY, zs); g.add(sign);
  const chars = [...text], step = letterH * 0.78, x0 = -((chars.length - 1) * step) / 2, frameM = mat(0x3a3d44, 0.5, { metalness: 0.4 });
  rod([x0 - step * 0.6, signY + 0.6, zs - 0.15], [-x0 + step * 0.6, signY + 0.6, zs - 0.15], 0.05, frameM);
  rod([x0 - step * 0.6, signY + 0.62 + letterH, zs - 0.15], [-x0 + step * 0.6, signY + 0.62 + letterH, zs - 0.15], 0.04, frameM);
  if (signY === 0) for (const x of [x0 - step * 0.5, 0, -x0 + step * 0.5]) rod([x, 0, zs - 0.15], [x, 0.6, zs - 0.15], 0.05, frameM);
  const letters = [];
  chars.forEach((ch, i) => {
    if (ch === ' ') return;
    const tex = canvasTex(256, 256, (c, w, hh) => { c.clearRect(0, 0, w, hh); c.shadowColor = '#5ab4ff'; c.shadowBlur = 26; c.fillStyle = '#e6f4ff'; c.font = 'bold 230px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, w / 2, hh / 2 + 12); c.fillText(ch, w / 2, hh / 2 + 12); });
    const lg = new THREE.Group(); lg.position.set(x0 + i * step, 0.62, 0.05); sign.add(lg);
    mk(new THREE.BoxGeometry(letterH * 0.74, letterH, 0.12), mat(0x1a1d24, 0.6), lg, 0, letterH / 2, -0.07);
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1.5, 1.5, 1.5) });
    const p = mk(new THREE.PlaneGeometry(letterH * 0.95, letterH * 0.95), m, lg, 0, letterH / 2, 0.005); p.castShadow = false;
    letters.push({ g: lg, m, on: new THREE.Color(1.5, 1.5, 1.5) });
  });
  return { g, beacons, letters, sign };
}
