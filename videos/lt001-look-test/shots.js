// lt001 — LOOK TEST (never posted). Can our engine + the ported toon look (engine/toon/) make frames that read like
// a narrated "2D cartoon characters in a painted 3D world" explainer Short? Four reference compositions, our own
// characters and props: A clerk close-up with a magnifier over a check (0-4 s), B teller counter with cash (4-8 s),
// C glass-elevator two-shot with a guard + brass button panel (8-16 s, the motion clip: walk-in, blinks, glide,
// push-in), D coin tray from above with a pencil (16-20 s). One word-at-a-time caption.
// v3 premium pass: ambient occlusion + surface-tinted world ink,
// reflective metals (toonMetal + makeEnv), floating dust with bokeh, GRADE_RICH, and a new hill set shot two ways
// with the mood presets: E sunset (painted sky, rays, backlit rims, 20-24 s), F moonlit night (stars, fireflies,
// a warm lantern against blue light, 24-28 s).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { K, clamp, lerp, smooth, rng } from '@engine/core.js';
import { toonPost } from '@engine/toon/post.js';
import { toonMat, toonMetal, toonGlass, setTone, cardShade } from '@engine/toon/shade.js';
import { whipCam } from '@engine/toon/whip.js';
import { makeCallout } from '@engine/toon/extras.js';
import { makeToon, makeBlob, makeStickArm, cardPoint, lidAt, drawToon, CLERK, GUARD, ARMS, INK } from '@engine/toon/cards.js';
import { plaster, wood, terrazzo, felt, ctex, fitText, tone, blotch } from '@engine/toon/paint.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeGlow, makeShafts, makeMotes, makeEnv } from '@engine/toon/light.js';
import { makeSky } from '@engine/toon/sky.js';
import { MOOD } from '@engine/toon/mood.js';
import { makeWordCaption } from '@engine/toon/caption.js';
import { NOINK } from '@engine/toon/ink.js';

const PI = Math.PI;

export const SHOTS = [
  { t0: 0, t1: 4, set: 'office' },
  { t0: 4, t1: 8, set: 'counter' },
  { t0: 8, t1: 16, set: 'lift' },
  { t0: 16, t1: 20, set: 'coins' },
  { t0: 20, t1: 24, set: 'dusk' },
  { t0: 24, t1: 28, set: 'night' },
  { t0: 28, t1: 33, set: 'xray' },
];
const OFF = { office: [0, 0, 0], counter: [60, 0, 0], lift: [120, 0, 0], coins: [180, 0, 0], dusk: [240, 0, 0], night: [240, 0, 0], xray: [240, 0, 0] };
const WORDS = [
  [0.3, 1.0, 'He'], [1.0, 1.5, 'was'], [1.5, 2.6, 'sure'], [2.6, 3.3, 'nobody'], [3.3, 4.0, 'checks.'],
  [4.2, 5.0, 'The'], [5.0, 6.5, 'numbers'], [6.5, 7.2, 'looked'], [7.2, 8.0, 'random.'],
  [8.4, 9.2, 'Then'], [9.2, 9.8, 'he'], [9.8, 10.6, 'took'], [10.6, 11.2, 'the'], [11.2, 12.8, 'elevator'],
  [12.8, 13.3, 'to'], [13.3, 14.1, 'floor'], [14.1, 15.6, 'one.'],
  [16.2, 17.0, 'Real'], [17.0, 18.6, 'coins'], [18.6, 19.6, 'streak.'],
  [20.3, 21.0, 'He'], [21.0, 22.0, 'hauled'], [22.0, 22.6, 'it'], [22.6, 23.7, 'home.'],
  [24.3, 25.3, 'Nobody'], [25.3, 26.2, 'slept'], [26.2, 26.8, 'that'], [26.8, 27.8, 'night.'],
  [28.2, 29.0, 'Inside,'], [29.0, 29.4, 'a'], [29.4, 30.5, 'pendulum', { accent: true }], [30.7, 31.3, 'One'], [31.3, 31.9, 'nudge,'],
  [31.9, 32.3, 'and'], [32.3, 32.9, 'run.'],
];

// ---------------------------------------------------------------- shared helpers
function box(parent, w, h, d, m, x, y, z, round = 0) {
  const g = round ? new RoundedBoxGeometry(w, h, d, 3, round) : new THREE.BoxGeometry(w, h, d);
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
function cyl(parent, r0, r1, h, m, x, y, z, seg = 32) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
function plane(parent, w, h, m, x, y, z) { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.receiveShadow = true; parent.add(o); return o; }
/** warm sun = directional light 0 of the set, with a tight shadow box around the action */
function sun(root, pos, target, { half = 2.6, color = 0xfff0d8, map = 2048 } = {}) {
  const s = new THREE.DirectionalLight(color, 2.2);
  s.position.set(...pos); s.target.position.set(...target); root.add(s, s.target);
  s.castShadow = true; s.shadow.mapSize.set(map, map);
  Object.assign(s.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 0.3, far: 30 });
  s.shadow.bias = -0.0004; s.shadow.normalBias = 0.02; s.shadow.radius = 2;
  root.add(new THREE.HemisphereLight(0xdcecff, 0xb49a78, 0.9));
  return s;
}
/** parallel bars between the sun and the scene, invisible but casting (colorWrite + depthWrite off: the ink pass skips
 *  them, three's shadow pass still draws them): blinds stripes across faces, walls, desk */
function blinds(root, s, { dist = 1.6, width = 0.06, period = 0.11, n = 40, roll = 0.5, len = 6 } = {}) {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(len, width, 0.01), m); b.position.y = (i - n / 2) * period; b.castShadow = true; g.add(b); }
  const d = s.position.clone().sub(s.target.position).normalize();
  g.position.copy(s.target.position).addScaledVector(d, dist); g.lookAt(root.localToWorld(s.target.position.clone())); g.rotateZ(roll);
  root.add(g); return g;
}
function canvasMat(w, h, draw, { basic = false, alpha = false } = {}) {
  const t = ctex('lt001' + draw.name + w + h, w, h, (g, r, W, H) => draw(g, r, W, H));
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return basic ? new THREE.MeshBasicMaterial({ map: t, alphaTest: alpha ? 0.5 : 0, transparent: false }) : toonMat(t, alpha ? { alphaTest: 0.5 } : {});
}

// ---------------------------------------------------------------- canvases (our own props)
function check(g, r, W, H) {
  g.fillStyle = '#e4f2ec'; g.fillRect(0, 0, W, H);
  blotch(g, W * 0.7, H * 0.4, W * 0.5, '200,230,220', 0.5);
  g.strokeStyle = '#7fa79a'; g.lineWidth = 6; g.strokeRect(10, 10, W - 20, H - 20);
  g.fillStyle = '#c86a3c'; g.beginPath(); g.moveTo(40, 92); g.lineTo(70, 52); g.lineTo(100, 92); g.fill();
  g.fillStyle = '#2b4740'; fitText(g, 'SUNSET STATE TREASURY', 115, 88, 520, 40, 'bold', 'Georgia, serif');
  g.font = '22px Georgia, serif'; g.fillText('PHOENIX, ARIZONA', 118, 120);
  g.fillStyle = '#b5402c'; g.font = 'bold 30px Georgia, serif'; g.fillText('No. 2214', W - 190, 70);
  g.fillStyle = '#2b4740'; g.font = '20px Arial'; g.fillText('PAY TO THE', 40, 200); g.fillText('ORDER OF', 40, 224);
  g.font = 'italic 40px Georgia, serif'; g.fillText('Definitely Real Vendor LLC', 170, 218);
  g.strokeStyle = '#2b4740'; g.lineWidth = 2; g.beginPath(); g.moveTo(160, 232); g.lineTo(W - 280, 232); g.stroke();
  g.strokeRect(W - 260, 168, 220, 70);
  g.fillStyle = '#2f55b8'; g.font = '50px "Marker Felt", "Comic Sans MS", cursive'; g.fillText('87,439', W - 248, 222);
  g.strokeStyle = '#2f55b8'; g.lineWidth = 3; g.beginPath();
  for (let i = 0; i <= 40; i++) g.lineTo(W - 360 + i * 8, 330 + Math.sin(i * 1.3) * 14 * Math.sin(i * 0.4));
  g.stroke();
  g.fillStyle = '#2b4740'; g.font = 'bold 30px "Courier New", monospace'; g.fillText('⑆ 122105155 ⑆  0047 22914 ⑈ 2214', 40, H - 40);
  g.font = '20px Arial'; g.fillText('MEMO', 40, 320); g.font = 'italic 30px Georgia, serif'; g.fillText('consulting', 120, 320);
}
function lens(g, r, W, H) {   // what the magnifier shows: two huge digits of the amount + a glare crescent
  g.fillStyle = '#e8f4ef'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#2b4740'; g.lineWidth = 8; g.strokeRect(-40, 70, W * 0.7, 380);
  g.fillStyle = '#2f55b8'; g.font = `${H * 0.52}px "Marker Felt", "Comic Sans MS", cursive`; g.fillText('7,4', W * 0.02, H * 0.7);
  const gr = g.createRadialGradient(W * 0.32, H * 0.28, 0, W * 0.32, H * 0.28, W * 0.5);
  gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 18; g.beginPath(); g.arc(W / 2, H / 2, W * 0.38, PI * 1.05, PI * 1.45); g.stroke();
}
function auditSign(g, r, W, H) {
  g.fillStyle = '#26303a'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#e9e2cf'; g.lineWidth = 8; g.strokeRect(10, 10, W - 20, H - 20);
  g.fillStyle = '#e9e2cf'; g.textAlign = 'center';
  fitText(g, 'DAYS SINCE', W / 2, 78, W - 60, 46, 'bold', 'Arial'); fitText(g, 'LAST AUDIT', W / 2, 130, W - 60, 46, 'bold', 'Arial');
  g.fillStyle = '#1a1f26'; g.fillRect(W * 0.24, 150, W * 0.52, 120);
  g.fillStyle = '#f2c232'; fitText(g, '385', W / 2, 250, W * 0.48, 104, 'bold', 'Arial');
}
function photo(g, r, W, H) {
  g.fillStyle = '#f1ead9'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#5c8fd0'; g.fillRect(40, 40, W - 80, H * 0.68);
  g.save(); g.beginPath(); g.rect(40, 40, W - 80, H * 0.68); g.clip();
  g.translate(W / 2 - 150, 70); g.scale(0.5, 0.5); drawToon(g, CLERK, { expr: 'grin', arms: ARMS.down, light: -PI / 4 }); g.restore();
  g.fillStyle = '#f2c232'; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? 16 : 36; g.lineTo(W - 90 + Math.cos(a) * rr, 90 + Math.sin(a) * rr); }
  g.fill();
  g.fillStyle = '#c9a24a'; g.fillRect(70, H * 0.76, W - 140, H * 0.16);
  g.fillStyle = '#3a2a16'; g.textAlign = 'center'; fitText(g, 'EMPLOYEE', W / 2, H * 0.83, W - 180, 44, 'bold', 'Georgia, serif');
  fitText(g, 'OF THE MONTH', W / 2, H * 0.895, W - 180, 40, 'bold', 'Georgia, serif');
}
function desert(g, r, W, H) {
  const sky = g.createLinearGradient(0, 0, 0, H * 0.62); sky.addColorStop(0, '#7db8e6'); sky.addColorStop(1, '#d8eaf0');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff6e8'; for (const [x, y, s] of [[0.2, 0.18, 1], [0.7, 0.1, 0.8]]) { blotch(g, W * x, H * y, 120 * s, '255,255,255', 0.9); blotch(g, W * x + 90 * s, H * y + 10, 90 * s, '255,255,255', 0.9); }
  g.fillStyle = '#c98a6c'; g.beginPath(); g.moveTo(0, H * 0.6); g.lineTo(W * 0.1, H * 0.44); g.lineTo(W * 0.38, H * 0.44); g.lineTo(W * 0.46, H * 0.6); g.fill();
  g.fillStyle = '#a7695e'; g.beginPath(); g.moveTo(W * 0.38, H * 0.44); g.lineTo(W * 0.46, H * 0.6); g.lineTo(W * 0.3, H * 0.6); g.fill();
  g.fillStyle = '#e9c897'; g.fillRect(0, H * 0.6, W, H * 0.4);
  blotch(g, W * 0.7, H * 0.8, W * 0.4, '214,170,110', 0.5);
  g.fillStyle = '#6aa05a'; for (const x of [0.62, 0.84]) { g.fillRect(W * x, H * 0.5, 18, H * 0.14); g.fillRect(W * x - 22, H * 0.55, 22, 10); g.fillRect(W * x - 22, H * 0.52, 10, 30); }
}
function cash(g, r, W, H) {
  g.fillStyle = '#9ccf8a'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#5f9a55'; g.lineWidth = 3; for (let y = 6; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#f4efe0'; g.fillRect(W * 0.42, 0, W * 0.16, H);
}
function panelFace(g, r, W, H) {
  const AR = W / 2;   // arch radius in px; the top AR px are the arch
  g.beginPath(); g.moveTo(0, H); g.lineTo(0, AR); g.arc(W / 2, AR, AR, PI, 0); g.lineTo(W, H); g.closePath();
  const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#9c6434'); gr.addColorStop(0.5, '#c88a4e'); gr.addColorStop(1, '#a46a38');
  g.fillStyle = gr; g.fill(); g.lineWidth = 14; g.strokeStyle = '#3a2412'; g.stroke();
  g.beginPath(); g.moveTo(26, H - 26); g.lineTo(26, AR); g.arc(W / 2, AR, AR - 26, PI, 0); g.lineTo(W - 26, H - 26); g.closePath(); g.lineWidth = 5; g.strokeStyle = '#6e4420'; g.stroke();
  g.save(); g.beginPath(); g.arc(W / 2, AR + 20, AR - 60, PI, 0); g.closePath(); g.fillStyle = '#f4e7cc'; g.fill(); g.clip();
  g.strokeStyle = '#c69a5c'; g.lineWidth = 6; for (let i = 0; i <= 16; i++) { const a = PI + (i * PI) / 16; g.beginPath(); g.moveTo(W / 2, AR + 20); g.lineTo(W / 2 + Math.cos(a) * AR, AR + 20 + Math.sin(a) * AR); g.stroke(); }
  g.restore(); g.beginPath(); g.arc(W / 2, AR + 20, AR - 60, PI, 0); g.lineWidth = 6; g.strokeStyle = '#3a2412'; g.stroke();
  g.beginPath(); g.arc(W / 2, AR + 20, 22, PI, 0); g.fillStyle = '#e2a03c'; g.fill();
  g.fillStyle = '#d4b07a'; g.fillRect(60, AR + 50, W - 120, 70); g.strokeStyle = '#3a2412'; g.lineWidth = 5; g.strokeRect(60, AR + 50, W - 120, 70);
  g.fillStyle = '#3a2412'; g.textAlign = 'center'; fitText(g, 'ONE TOWER', W / 2, AR + 100, W - 150, 46, 'bold', 'Georgia, serif');
  const top = AR + 150, step = (H - top - 40) / 10;
  for (let row = 0; row < 10; row++) for (const [col, n] of [[0, row === 0 ? '★' : String(10 - row)], [1, String(20 - row - 1)]]) {
    const x = col ? W * 0.68 : W * 0.32, y = top + row * step + step / 2;
    g.beginPath(); g.arc(x, y, step * 0.44, 0, PI * 2); g.fillStyle = '#efe6d2'; g.fill(); g.lineWidth = 7; g.strokeStyle = '#2a1a0e'; g.stroke();
    g.fillStyle = '#2a1a0e'; g.font = `bold ${Math.round(step * 0.48)}px Georgia, serif`; g.textBaseline = 'middle'; g.fillText(n, x, y + 2); g.textBaseline = 'alphabetic';
  }
}
function facade(g, r, W, H) {
  g.fillStyle = '#efd9bb'; g.fillRect(0, 0, W, H);
  for (let fl = 0; fl < 8; fl++) {
    const y = fl * 128;
    g.fillStyle = fl % 2 ? '#e38a55' : '#4fa4ae';
    for (let x = 0; x < W; x += 64) { g.beginPath(); g.moveTo(x, y + 112); g.lineTo(x + 32, y + 96); g.lineTo(x + 64, y + 112); g.lineTo(x + 64, y + 124); g.lineTo(x + 32, y + 108); g.lineTo(x, y + 124); g.fill(); }
    for (let x = 24; x < W; x += 128) {
      g.fillStyle = '#3d8f9e'; g.fillRect(x, y + 14, 80, 70);
      g.fillStyle = 'rgba(220,245,250,0.55)'; g.beginPath(); g.moveTo(x + 10, y + 84); g.lineTo(x + 50, y + 14); g.lineTo(x + 66, y + 14); g.lineTo(x + 26, y + 84); g.fill();
      g.strokeStyle = '#2a4a50'; g.lineWidth = 4; g.strokeRect(x, y + 14, 80, 70); g.beginPath(); g.moveTo(x + 40, y + 14); g.lineTo(x + 40, y + 84); g.stroke();
    }
  }
}
function coinFace(heads) {
  return (g, r, W, H) => {
    const base = heads ? '#f0c55c' : '#ad6f3e', dk = heads ? '#c9952f' : '#7d4a24', lt = heads ? '#fde39a' : '#d39565';
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    const c = W / 2, gr = g.createRadialGradient(c * 0.7, c * 0.7, 0, c, c, c);
    gr.addColorStop(0, lt); gr.addColorStop(0.7, base); gr.addColorStop(1, dk); g.fillStyle = gr; g.beginPath(); g.arc(c, c, c * 0.98, 0, PI * 2); g.fill();
    g.strokeStyle = dk; g.lineWidth = W * 0.035; g.beginPath(); g.arc(c, c, c * 0.8, 0, PI * 2); g.stroke();
    g.fillStyle = dk; g.strokeStyle = dk; g.lineWidth = W * 0.03; g.lineCap = 'round'; g.lineJoin = 'round';
    if (heads) {   // a profile bust: head, nose, cap
      g.beginPath(); g.ellipse(c, c * 1.02, c * 0.3, c * 0.36, 0, 0, PI * 2); g.stroke();
      g.beginPath(); g.moveTo(c + c * 0.28, c * 0.95); g.lineTo(c + c * 0.4, c * 1.08); g.lineTo(c + c * 0.27, c * 1.12); g.stroke();
      g.beginPath(); g.arc(c - c * 0.02, c * 0.8, c * 0.3, PI * 1.05, PI * 1.95); g.stroke();
      g.font = `bold ${W * 0.1}px Georgia, serif`; g.textAlign = 'center';
      for (const [i, ch] of [...'LIBERTY'].entries()) { g.save(); g.translate(c, c); g.rotate(-0.75 + i * 0.25); g.fillText(ch, 0, -c * 0.62); g.restore(); }
    } else {       // an eagle: body + two wings
      g.beginPath(); g.moveTo(c, c * 0.65); g.lineTo(c, c * 1.35); g.stroke();
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(c, c * 0.95); g.quadraticCurveTo(c + s * c * 0.3, c * 0.55, c + s * c * 0.55, c * 0.78); g.quadraticCurveTo(c + s * c * 0.35, c * 1.0, c, c * 1.12); g.stroke(); }
    }
  };
}

// ---------------------------------------------------------------- A: office close-up
/** world point at screen fraction (fx, fy) and view depth d for a camera pose (to match a reference layout) */
function atScreen(c, fx, fy, d) {
  const cam = new THREE.PerspectiveCamera(c.fov, 9 / 16, 0.05, 100); cam.position.set(...c.p); cam.lookAt(...c.a); cam.updateMatrixWorld(true);
  const v = new THREE.Vector3(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  const fwd = cam.getWorldDirection(new THREE.Vector3());
  return cam.position.clone().addScaledVector(v, d / v.dot(fwd));
}
function buildOffice(root) {
  const WZ = -1.7, wallM = toonMat(plaster('#3d9ea4', [2, 2])), cream = toonMat('#ece3d1');
  const wall = (x0, x1, y0, y1) => box(root, x1 - x0, y1 - y0, 0.1, wallM, (x0 + x1) / 2, (y0 + y1) / 2, WZ - 0.05);
  wall(-3.5, -1.5, -0.4, 3.6); wall(-0.62, 3.5, -0.4, 3.6); wall(-1.5, -0.62, -0.4, 0.85); wall(-1.5, -0.62, 2.45, 3.6);
  for (const [w, h, x, y] of [[1.0, 0.06, -1.06, 0.82], [1.0, 0.06, -1.06, 2.48], [0.06, 1.7, -1.53, 1.65], [0.06, 1.7, -0.59, 1.65]]) box(root, w, h, 0.14, cream, x, y, WZ + 0.02);
  box(root, 1.02, 0.04, 0.26, cream, -1.06, 0.86, WZ + 0.1);   // sill
  const view = plane(root, 3.2, 2.6, canvasMat(1024, 832, desert, { basic: true }), -1.0, 1.55, WZ - 0.7);
  view.material = view.material.clone(); view.material.color.setScalar(2.3);   // bright outside: blooms through the window
  makeGlow(root, { x: -1.06, y: 1.75, z: WZ + 0.3, size: 2.6, intensity: 0.55, color: 0xffe6bd });
  const winLamp = new THREE.PointLight(0xffd29a, 2.6, 3.4, 2); winLamp.position.set(-0.95, 1.75, WZ + 0.55); root.add(winLamp);
  const slat = toonMat('#f4f0e6');
  for (let i = 0; i < 15; i++) { const s = box(root, 0.92, 0.014, 0.05, slat, -1.06, 2.42 - i * 0.05, WZ + 0.02); s.rotation.x = 0.35; }
  cyl(root, 0.07, 0.055, 0.12, toonMat('#c8673d'), -0.82, 0.94, WZ + 0.1);
  const cactus = toonMat('#5f9e55');
  const c1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.18, 6, 12), cactus); c1.position.set(-0.82, 1.1, WZ + 0.1); root.add(c1);
  const c2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.06, 4, 10), cactus); c2.position.set(-0.77, 1.12, WZ + 0.1); root.add(c2);
  // the sign + employee-of-the-month frame + filing cabinet + chair
  const sign = box(root, 0.52, 0.31, 0.03, toonMat('#26303a'), -0.14, 1.93, WZ + 0.02);
  sign.material = [sign.material, sign.material, sign.material, sign.material, canvasMat(512, 300, auditSign), sign.material];
  box(root, 0.44, 0.58, 0.04, toonMat('#7a4e33'), 0.56, 1.8, WZ + 0.02);
  plane(root, 0.36, 0.5, canvasMat(400, 560, photo), 0.56, 1.8, WZ + 0.045);
  const cab = toonMat('#e6dccb'), handle = toonMat('#8a8f99');
  box(root, 0.55, 1.25, 0.55, cab, 0.86, 0.22, -1.2, 0.02);
  for (let i = 0; i < 3; i++) { box(root, 0.47, 0.34, 0.03, cab, 0.86, 0.66 - i * 0.39, -0.91, 0.01); box(root, 0.16, 0.03, 0.04, handle, 0.86, 0.74 - i * 0.39, -0.88, 0.01); }
  box(root, 0.78, 0.72, 0.12, toonMat('#3c8d9c'), 0, 0.98, -0.34, 0.08);
  // layout from the reference frame: check, lens and both hands placed by screen position + depth at t = 2
  const cam = (t) => ({ p: [K(t, [[0, 0.16], [4, 0.1]]), K(t, [[0, 1.07], [4, 1.05]]), K(t, [[0, 2.32], [4, 2.12]])], a: [0.02, 0.85, 0], fov: 40 });
  const c2s = cam(2);
  const chkC = atScreen(c2s, 0.37, 0.7, 1.75), lensC = atScreen(c2s, 0.6, 0.68, 1.5);
  const handL = atScreen(c2s, 0.12, 0.7, 1.72), handR = atScreen(c2s, 0.84, 0.86, 1.4);
  const deskY = chkC.y - 0.1, deskZ1 = chkC.z + 0.16;
  const deskM = toonMat(wood('#b37444', { boards: 3 }));
  box(root, 2.8, 0.06, deskZ1 + 0.25, deskM, 0, deskY - 0.03, (deskZ1 - 0.25) / 2);
  box(root, 2.8, deskY + 0.4, 0.05, toonMat(wood('#8f5a36', { boards: 4 })), 0, (deskY - 0.4) / 2, deskZ1);
  const chk = plane(root, 0.42, 0.19, canvasMat(1024, 462, check), chkC.x, chkC.y, chkC.z); chk.rotation.x = -0.35; chk.castShadow = true;
  const mag = new THREE.Group(); root.add(mag);
  const gold = toonMetal('#e2b052', { rough: 0.24 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.014, 16, 64), gold); rim.castShadow = true; mag.add(rim);
  mag.add(new THREE.Mesh(new THREE.CircleGeometry(0.118, 48), canvasMat(512, 512, lens, { basic: true })));
  const hnd = cyl(root, 0.017, 0.021, 1, toonMat('#7b4a2a'), 0, 0, 0, 16);
  const clerk = makeToon(CLERK, { res: 2.6 }); clerk.root.position.set(0, -0.3, 0); root.add(clerk.root);
  const armL = makeStickArm(root, { hand: 26, width: 17 }), armR = makeStickArm(root, { hand: 26, width: 17 });
  const s = sun(root, [-2.4, 3.4, 3.0], [0, 0.9, -0.6], { half: 2.8 });
  blinds(root, s, { dist: 1.2, width: 0.13, period: 0.24, n: 24, roll: -0.5 });
  const shafts = makeShafts(root, { from: [-1.9, 2.9, 1.3], dir: [0.48, -0.5, -0.72], n: 5, spread: 1.1, w: 0.16, len: 3.4, opacity: 0.14 });
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 140, box: [-1.9, 0.5, -1.6, 0.5, 2.6, 0.9], intensity: 2.4 });
  const v1 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  return {
    root, tone: { lit: [1.5, 1.32, 1.06], shade: [0.46, 0.54, 0.78], sat: 0.95, term: 0.25, rim: [0.12, 0.11, 0.15], charTint: [1.0, 0.96, 0.92], charShade: 0.66, charGain: 1.1, headGrad: 0.34, bodyGrad: 0.44 },
    grade: GRADE_RICH, env: { ...MOOD.interior.env, lights: [{ dir: [-0.6, 0.7, -1], color: '#fff0d8', intensity: 7, size: 3 }, { dir: [1, 0.5, 1], color: '#a8d8dc', intensity: 1.5, size: 5 }] },
    exposure: 1.0, cInf: 12, near: 0.05, far: 40, bg: new THREE.Color('#2b6f75'),
    cam, focus: () => [0, 1.15, 0],
    update(t, camera, renderer) {
      clerk.face(camera, s); shafts.face(camera); motes.update(t, camera, renderer);
      clerk.set({ expr: 'worried', blink: lidAt(t, 3), look: K(t, [[0, 0.3], [1.6, 0.3], [2.0, -0.4]]), arms: { L: null, R: null }, ol: 0.72 });
      clerk.root.updateMatrixWorld(true);
      const wob = (k) => 0.006 * Math.sin(t * 1.3 + k);
      mag.position.set(lensC.x + wob(0), lensC.y + wob(2), lensC.z); mag.lookAt(camera.getWorldPosition(v1)); mag.updateMatrixWorld(true);
      const hR = handR.clone().add(new THREE.Vector3(wob(0), wob(2), 0));
      const a = v1.set(0.085, -0.085, 0).applyMatrix4(mag.matrixWorld).clone(), b = hR.clone();
      root.worldToLocal(a); root.worldToLocal(b);
      hnd.position.copy(a).add(b).multiplyScalar(0.5); hnd.scale.set(1, a.distanceTo(b) * 1.15, 1);
      hnd.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
      armL.set(cardPoint(clerk, 236, 405), root.localToWorld(handL.clone()));
      armR.set(cardPoint(clerk, 364, 405), root.localToWorld(hR.clone()));
    },
  };
}

// ---------------------------------------------------------------- B: teller counter
function buildCounter(root) {
  const salmon = toonMat(wood('#e98f68', { boards: 6, seam: false }));
  box(root, 3.2, 1.05, 0.45, salmon, 0, 0.525, 0.55);
  box(root, 3.3, 0.06, 0.62, toonMat(wood('#f0a07a', { boards: 2 })), 0, 1.08, 0.5);
  const cream = toonMat('#ece4d2');
  box(root, 0.12, 1.6, 0.12, cream, -1.05, 1.9, 0.35); box(root, 0.12, 1.6, 0.12, cream, 1.35, 1.9, 0.35);
  const hood = box(root, 0.09, 1.3, 0.9, cream, -0.62, 2.05, 0.75); hood.rotation.z = -0.55;
  const lip = box(root, 2.4, 0.09, 0.9, cream, 0.5, 2.38, 0.75); lip.rotation.x = 0.12;
  const beam = box(root, 3.0, 0.16, 0.5, cream, 0.15, 2.72, 0.2); beam.rotation.z = 0.05;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.5), new THREE.MeshBasicMaterial({ color: 0xdff3ff, transparent: true, opacity: 0.08, depthWrite: false }));
  glass.position.set(0.15, 1.9, 0.33); glass.layers.set(NOINK); root.add(glass);
  for (const [x, w] of [[-0.6, 0.06], [-0.45, 0.025], [0.95, 0.05]]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false })); q.position.set(x, 1.9, 0.34); q.rotation.z = -0.5; q.layers.set(NOINK); root.add(q); }
  // inside: back counter with cash stacks, back wall with a sky-blue panel
  box(root, 3.2, 0.95, 0.6, toonMat(wood('#9a6440', { boards: 3 })), 0, 0.475, -1.15);
  const cashM = toonMat(ctex('lt001cash', 128, 64, cash)), cashTop = toonMat('#a8d796');
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 4 - (i === 2 && j === 0 ? 2 : 0); k++) {
    const b = box(root, 0.17, 0.075, 0.09, [cashM, cashM, cashTop, cashTop, cashM, cashM], -0.52 + i * 0.19, 0.99 + k * 0.076, -1.3 + j * 0.11);
    b.rotation.y = (i * 7 + j * 3 + k) % 5 * 0.03 - 0.06;
  }
  box(root, 6, 3.5, 0.1, toonMat(wood('#9b6a48', { boards: 8, repeat: [3, 1] })), 0, 1.75, -1.6);
  box(root, 1.9, 0.95, 0.04, new THREE.MeshBasicMaterial({ color: new THREE.Color('#a9d6ea').multiplyScalar(1.5) }), 0.35, 1.78, -1.53);   // a bright window: glows
  makeGlow(root, { x: 0.35, y: 1.8, z: -1.4, size: 2.6, intensity: 0.22, color: 0xe8f4ff });
  const lamp = new THREE.PointLight(0xffd8a0, 2.2, 3.2, 2); lamp.position.set(0.1, 2.25, 0.05); root.add(lamp);
  box(root, 1.98, 0.06, 0.06, cream, 0.35, 2.28, -1.52); box(root, 1.98, 0.06, 0.06, cream, 0.35, 1.28, -1.52);
  box(root, 0.06, 1.0, 0.06, cream, 0.35, 1.78, -1.51);
  // pen on a stand + a bell on the customer counter
  cyl(root, 0.06, 0.07, 0.03, toonMat('#2b2b33'), -0.78, 1.125, 0.48);
  const pen = cyl(root, 0.018, 0.018, 0.34, toonMat('#2b2b33'), -0.72, 1.25, 0.47, 12); pen.rotation.z = -0.5;
  cyl(root, 0.075, 0.075, 0.015, toonMat('#3a3a42'), 1.0, 1.118, 0.58);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 12, 0, PI * 2, 0, PI / 2), toonMetal('#e8b850', { rough: 0.2 })); bell.position.set(1.0, 1.125, 0.58); bell.castShadow = true; root.add(bell);
  const chk = plane(root, 0.5, 0.225, canvasMat(1024, 462, check), 0.06, 1.24, -0.34); chk.rotation.set(-0.12, 0.08, 0.06);
  const pen2 = cyl(root, 0.011, 0.011, 0.16, toonMat('#3d6fc4'), 0.36, 1.17, -0.32, 10); pen2.rotation.z = 0.5;
  const clerk = makeToon(CLERK, { res: 2.0 }); clerk.root.position.set(0.42, 0, -0.62); root.add(clerk.root);
  const s = sun(root, [2.5, 3.6, 3.4], [0, 1.0, -0.4], { half: 2.6 });
  blinds(root, s, { dist: 2.2, width: 0.9, period: 1.25, n: 6, roll: 0.75 });
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 110, box: [-1.3, 0.9, -1.45, 1.5, 2.7, 0.2], intensity: 2.2 });
  return {
    root, tone: { lit: [1.36, 1.16, 0.92], shade: [0.34, 0.34, 0.58], sat: 0.95, term: 0.25, rim: [0.12, 0.1, 0.14], charTint: [1.0, 0.97, 0.94], charShade: 0.62, charGain: 1.06, headGrad: 0.34, bodyGrad: 0.44 },
    grade: GRADE_RICH, env: { ...MOOD.interior.env, lights: [{ dir: [0.3, 0.6, -1], color: '#dff0ff', intensity: 4, size: 4 }, { dir: [0, 1, 0.3], color: '#ffd8a0', intensity: 5, size: 2 }] },
    exposure: 1.0, cInf: 9, near: 0.05, far: 40, bg: new THREE.Color('#6b4a36'),
    cam: (t) => ({ p: [K(t, [[4, -0.42], [8, -0.32]]), 1.78, K(t, [[4, 2.05], [8, 1.9]])], a: [0.18, 1.18, -0.5], fov: 42 }),
    focus: () => [0.42, 1.45, -0.62],
    update(t, camera, renderer) {
      clerk.face(camera, s); motes.update(t, camera, renderer);
      clerk.set({ expr: 'smug', blink: lidAt(t, 5), face: { sweat: true }, arms: { L: [100, 590], R: [470, 610], bend: -20 }, ol: 0.8 });
    },
  };
}

// ---------------------------------------------------------------- C: glass elevator (the motion clip)
function buildLift(root) {
  const R = 1.6, brass = toonMetal('#cf9a64', { rough: 0.28 }), dark = toonMat('#7d5232');
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.1, 64), toonMat(terrazzo('#f1e8d8', [2, 2]))); floor.position.y = -0.05; floor.receiveShadow = true; root.add(floor);
  for (const [y, tube] of [[0.04, 0.026], [1.02, 0.017], [2.45, 0.026]]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R - 0.02, tube, 12, 96), brass); ring.rotation.x = PI / 2; ring.position.y = y; ring.castShadow = true; root.add(ring); }
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R, 0.18, 64), dark); lid.position.y = 2.55; root.add(lid);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2 + PI / 8; cyl(root, 0.014, 0.014, 2.45, brass, Math.sin(a) * (R - 0.02), 1.225, Math.cos(a) * (R - 0.02), 12); }
  const back = cyl(root, 0.03, 0.03, 2.45, brass, 0, 1.225, -R + 0.02, 12); back.name = 'post';
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 2.45, 64, 1, true), new THREE.MeshBasicMaterial({ color: 0xcfe8f2, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide }));
  glass.position.y = 1.225; glass.layers.set(NOINK); root.add(glass);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.8), canvasMat(400, 800, panelFace, { alpha: true }));
  panel.position.set(0, 1.42, -R + 0.08); panel.castShadow = true; root.add(panel);
  box(root, 0.36, 0.6, 0.03, dark, 0, 1.3, -R + 0.06);
  // outside: the tower facade + a far city; the sky is the scene background
  const fac = plane(root, 7, 16, new THREE.MeshBasicMaterial({ map: ctex('lt001facade', 1024, 1024, facade, [1, 2]), color: new THREE.Color(1.25, 1.22, 1.18) }), -2.2, 3, -6.5);   // sunlit, high-key outside
  const city = toonMat('#e7c7a6');
  for (let i = 0; i < 8; i++) box(root, 2.5, 3 + (i % 3) * 2, 2.5, city, -14 + i * 4, -2 + (i % 3), -16);
  const guard = makeToon(GUARD, { res: 1.6, shadow: true }), clerk = makeToon(CLERK, { res: 1.6, shadow: true });
  guard.root.position.set(-0.45, 0, -0.45); clerk.root.position.set(0.5, 0, -1.15); root.add(guard.root, clerk.root);
  const blobs = [makeBlob(0.36, 0.22, 0.32), makeBlob(0.36, 0.22, 0.32)]; blobs.forEach((b) => root.add(b));
  const s = sun(root, [-2.6, 4.6, -2.4], [0, 0.6, -0.4], { half: 2.8 });
  makeGlow(root, { x: 2.4, y: 2.8, z: -4.5, size: 7.5, intensity: 0.38, color: 0xfff2dc });
  const shafts = makeShafts(root, { from: [1.9, 3.1, 0.6], dir: [-0.42, -1, -0.38], n: 4, spread: 0.9, w: 0.22, len: 3.2, opacity: 0.1 });
  const motes = makeMotes(root, { ...MOOD.day.motes, n: 90, box: [-1.4, 0.3, -1.5, 1.4, 2.4, 1.2], color: 0xfff4e0, intensity: 2.0 });
  const STRIDE = 0.42, x0 = 1.08, x1 = 0.5, W0 = 8.6, W1 = 10.4;
  const walkX = (t) => lerp(x0, x1, smooth((t - W0) / (W1 - W0)));
  return {
    root, tone: { lit: [1.32, 1.22, 1.06], shade: [0.46, 0.5, 0.76], sat: 0.95, term: 0.2, rim: [0.3, 0.27, 0.24], charTint: [1.0, 0.98, 0.95], charShade: 0.7, charGain: 0.94, headGrad: 0.34, bodyGrad: 0.46 },
    grade: GRADE_RICH, env: { top: '#8cc2ee', horizon: '#fff3de', ground: '#e7c7a6', lights: [{ dir: [-0.5, 0.8, -0.5], color: '#fff6e6', intensity: 7, size: 3 }, { dir: [-0.4, 0.2, -1], color: '#efd9bb', intensity: 2, size: 8 }] },
    exposure: 1.0, cInf: 30, slab: 1.0, fog: new THREE.Fog(0xf4efe4, 3.5, 15), near: 0.05, far: 60, bg: ctex('lt001sky', 64, 512, (g, r, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#8cc2ee'); gr.addColorStop(0.6, '#dcebf6'); gr.addColorStop(1, '#fff3de'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }),
    cam: (t) => {
      const g = smooth((t - 8.3) / 2.6);   // glide, then a slow push-in for the rest of the hold
      return { p: [lerp(0.38, 0.06, g), lerp(1.38, 1.32, g), 1.48 - 0.14 * smooth((t - 10.9) / 5.1)], a: [lerp(0.22, 0.0, g), 1.15, -1.0], fov: 60 };
    },
    focus: () => [0, 1.45, -0.8],
    update(t, camera, renderer) {
      motes.update(t, camera, renderer);
      const x = walkX(t), walking = t > W0 && t < W1, ph = ((x0 - x) / STRIDE) * PI;
      const bob = walking ? 0.045 * Math.abs(Math.sin(ph)) : 0;
      clerk.root.position.set(x, -bob + (walking ? 0.045 : 0), -1.15);
      clerk.pivot.rotation.z = walking ? 0.05 : 0;
      const reach = K(t, [[11.0, 0], [11.5, 1], [13.4, 1], [13.9, 0]]);
      const arms = reach > 0.02 ? { L: [lerp(ARMS.clasp.L[0], 70, reach), lerp(ARMS.clasp.L[1], 470, reach)], R: ARMS.clasp.R, bend: -30 } : ARMS.clasp;
      clerk.face(camera, s); guard.face(camera, s); shafts.face(camera);
      clerk.set({ expr: t > 12.8 ? 'grin' : 'smug', blink: lidAt(t, 7), walk: walking ? ph : null, arms });
      guard.set({ expr: 'stern', blink: lidAt(t, 11), look: K(t, [[9.0, 0], [9.4, 1]]), arms: ARMS.down });
      blobs[0].position.set(x + 0.03, 0.002, -1.13); blobs[1].position.set(-0.45, 0.002, -0.43);
    },
  };
}

// ---------------------------------------------------------------- D: coin tray from above
function buildCoins(root) {
  const feltM = toonMat(felt('#4f6f62', [2, 2])), well = toonMat('#2c443b');
  plane(root, 4, 6, feltM, 0, 0, 0).rotation.x = -PI / 2;
  const COLS = 9, ROWS = 14, SP = 0.235, CR = 0.095;
  const heads = toonMetal(ctex('lt001heads', 256, 256, coinFace(true)), { rough: 0.42 }), tails = toonMetal(ctex('lt001tails', 256, 256, coinFace(false)), { rough: 0.45 });
  const rimH = toonMetal('#e0b050', { rough: 0.28 }), rimT = toonMetal('#a8683a', { rough: 0.32 });
  const geo = new THREE.CylinderGeometry(CR, CR, 0.022, 40);
  const r = rng(42), cells = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) cells.push([i, j, j === 10 && i >= 2 && i <= 7 ? true : r() < 0.5]);
  const mkInst = (h) => { const list = cells.filter((c) => c[2] === h); const m = new THREE.InstancedMesh(geo, h ? [rimH, heads, heads] : [rimT, tails, tails], list.length); m.castShadow = m.receiveShadow = true; root.add(m); return [m, list]; };
  const wellG = new THREE.CircleGeometry(CR * 1.18, 40), wells = new THREE.InstancedMesh(wellG, well, cells.length); wells.receiveShadow = true; root.add(wells);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), P = new THREE.Vector3();
  const at = (i, j) => [(i - (COLS - 1) / 2) * SP, (j - 9.6) * SP];
  for (const h of [true, false]) { const [m, list] = mkInst(h); list.forEach(([i, j], k) => { const [x, z] = at(i, j); Q.setFromEuler(new THREE.Euler(0, ((i * 13 + j * 7) % 10) * 0.3, 0)); m.setMatrixAt(k, M.compose(P.set(x, 0.013, z), Q, S)); }); }
  cells.forEach(([i, j], k) => { const [x, z] = at(i, j); Q.setFromEuler(new THREE.Euler(-PI / 2, 0, 0)); wells.setMatrixAt(k, M.compose(P.set(x, 0.0015, z), Q, S)); });
  // wooden rail across the tray + the far rim
  box(root, 4, 0.05, 0.16, toonMat(wood('#e3a75c', { boards: 1, seam: false })), 0, 0.025, 1.0);
  box(root, 4, 0.08, 0.3, toonMat(wood('#9a6842', { boards: 1 })), 0, 0.04, 2.1);
  // the glowing coin (HDR -> bloom) + a soft halo
  const [gx, gz] = at(1, 6);
  const glow = cyl(root, CR, CR, 0.024, [rimH, new THREE.MeshBasicMaterial({ map: heads.map, color: new THREE.Color(2.2, 1.9, 1.3) }), rimH], gx, 0.014, gz, 40);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctex('lt001halo', 128, 128, (g) => blotch(g, 64, 64, 64, '255,230,150', 0.8)), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.set(0.42, 0.42, 1); halo.position.set(gx, 0.05, gz); halo.layers.set(NOINK); root.add(halo);
  // the pencil + a toon hand lying over the tray (a flat card facing up)
  const pencil = new THREE.Group(); root.add(pencil);
  const L = 0.85, body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, L, 6), toonMat('#e0533f')); body.position.y = L / 2 + 0.07; pencil.add(body);
  const woodTip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 6), toonMat('#f1d3a6')); woodTip.rotation.x = PI; woodTip.position.y = 0.035; pencil.add(woodTip);
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.024, 6), toonMat('#33302e')); lead.rotation.x = PI; lead.position.y = 0.0; pencil.add(lead);
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.05, 12), toonMat('#c9ccd2')); fer.position.y = L + 0.095; pencil.add(fer);
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 12), toonMat('#f2a3a8')); eraser.position.y = L + 0.15; pencil.add(eraser);
  pencil.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const handTex = ctex('lt001hand', 512, 1024, (g, r2, W, H) => {
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 84; g.beginPath(); g.moveTo(170, 150); g.lineTo(400, 860); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(160, 150, 92, 0, PI * 2); g.fill();
    g.save(); g.translate(430, 960); g.rotate(-0.32); g.beginPath(); g.ellipse(0, 0, 150, 120, 0, 0, PI * 2);
    g.fillStyle = '#6a4ad0'; g.fill(); g.lineWidth = 14; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.ellipse(0, -40, 70, 44, 0, 0, PI * 2); g.fillStyle = '#ffffff'; g.fill(); g.stroke(); g.restore();
  });
  handTex.wrapS = handTex.wrapT = THREE.ClampToEdgeWrapping;
  const hand = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.0), cardShade(new THREE.MeshLambertMaterial({ map: handTex, alphaTest: 0.5 }), { grad: false }));
  hand.rotation.x = -PI / 2; hand.layers.set(NOINK); root.add(hand);
  sun(root, [-3, 6, -2.2], [0, 0, 0.3], { half: 2.6 });
  const pool = new THREE.SpotLight(0xfff0d6, 4.5, 0, 0.62, 1, 2); pool.position.set(-0.15, 3.3, 0.25); pool.target.position.set(-0.15, 0, 0.25); root.add(pool, pool.target);   // light pool: tray edges fall off
  const [tx, tz] = at(3, 10), PDIR = new THREE.Vector3(0.36, 0.5, 0.79).normalize();
  return {
    root, tone: { lit: [1.0, 0.95, 0.86], shade: [0.36, 0.44, 0.62], sat: 0.95, term: 0.2, rim: [0, 0, 0], charTint: [1, 1, 1], charShade: 0.8, charGain: 1.0 },
    grade: GRADE_RICH, env: { top: '#3a5248', horizon: '#c9b896', ground: '#20302a', lights: [{ dir: [-0.1, 1, 0.1], color: '#fff0d6', intensity: 6, size: 3 }, { dir: [-1, 0.6, -0.6], color: '#ffe8c8', intensity: 3, size: 3 }] },
    exposure: 1.0, cInf: 7, near: 0.1, far: 60, bg: new THREE.Color('#2f4a40'),
    cam: (t) => ({ p: [0.05, K(t, [[16, 4.6], [20, 4.25]]), 1.55], a: [0.0, 0, 0.42], fov: 40 }),
    focus: () => [tx, 0, tz],
    update(t) {
      const u = smooth((t - 16.4) / 2.6), ci = Math.round(lerp(2, 5, u));
      const [px, pz] = at(lerp(2, 5, u), 10);
      pencil.position.set(px + 0.02, 0.06, pz + 0.03);
      pencil.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), PDIR);
      const hp = pencil.position.clone().addScaledVector(PDIR, 0.62);
      hand.position.set(hp.x + 0.2, hp.y + 0.04, hp.z + 0.33); hand.rotation.z = 0.32;
      glow.material[1].color.setScalar(1).multiply(new THREE.Color(2.0, 1.7, 1.15)).multiplyScalar(0.8 + 0.2 * Math.sin(t * 3));
      return ci;
    },
  };
}

// ---------------------------------------------------------------- E / F: a hill road at sunset, then at night (v3)
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
/** ground height: a road climbing to the right (+x) up a slope that rises away from the lens to a crest at z ~ -5
 *  (a low camera sees the crest against the sky), then a drop to a far plain */
const hillH = (x, z) => { const k = sstep(-9, -4.5, z); return (0.3 * x - 0.12 * z + 0.45 + 0.07 * Math.sin(x * 1.3 + z * 0.8)) * k - 2.2 * (1 - k); };
function meadow(g, r, W, H) {
  g.fillStyle = '#a99556'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) blotch(g, r() * W, r() * H, 40 + r() * 90, r() < 0.5 ? '196,176,104' : '120,110,60', 0.25);
  g.lineCap = 'round';
  for (let i = 0; i < 900; i++) {
    const x = r() * W, y = r() * H, l = 6 + r() * 12;
    g.strokeStyle = r() < 0.5 ? 'rgba(112,98,48,0.55)' : 'rgba(214,196,120,0.5)'; g.lineWidth = 1.5 + r() * 1.5;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - l); g.stroke();
  }
}
function buildHill(root) {
  const ground = new THREE.PlaneGeometry(40, 30, 160, 120); ground.rotateX(-PI / 2); ground.translate(0, 0, -5);
  const gp = ground.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, hillH(gp.getX(i), gp.getZ(i)));
  ground.computeVertexNormals();
  const gm = new THREE.Mesh(ground, toonMat(ctex('lt001meadow', 512, 512, meadow, [10, 8]))); gm.receiveShadow = true; root.add(gm);
  const plain = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toonMat('#8f7a52')); plain.rotation.x = -PI / 2; plain.position.set(0, -2.25, -460); root.add(plain);
  // road: a paler strip of the same paint
  const road = new THREE.PlaneGeometry(14, 1.5, 70, 6); road.rotateX(-PI / 2);
  const rp = road.attributes.position;
  for (let i = 0; i < rp.count; i++) { const x = rp.getX(i), z = rp.getZ(i) - 1.5; rp.setZ(i, z); rp.setY(i, hillH(x, z) + 0.012); }
  road.computeVertexNormals();
  const rm = new THREE.Mesh(road, toonMat('#c9ad78')); rm.receiveShadow = true; root.add(rm);
  // far mountains (the fog + the mood's haze colour them)
  const mtn = toonMat('#a98a8e'), r = rng(7);
  for (let i = 0; i < 9; i++) {
    const h = 40 + r() * 50, c = new THREE.Mesh(new THREE.ConeGeometry(h * (0.9 + r() * 0.5), h, 7), mtn);
    c.position.set(-260 + i * 65 + r() * 30, h / 2 - 18, -170 - r() * 90); c.rotation.y = r() * PI; root.add(c);
  }
  // grass tufts + rocks
  const blade = (lean, yaw) => new THREE.ConeGeometry(0.012, 0.2, 3).translate(0, 0.1, 0).rotateZ(lean).rotateY(yaw);
  const tuftG = mergeGeometries([blade(0.05, 0), blade(0.35, 0.4), blade(-0.3, 2.2), blade(0.25, 4.0)]);
  const tuft = new THREE.InstancedMesh(tuftG, toonMat('#6a6232'), 520); tuft.castShadow = true;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3();
  for (let i = 0; i < 520; i++) {
    let x = -7 + r() * 14, z = -8 + r() * 10.5;
    if (Math.abs(z + 1.5) < 0.8) z += 1.7 * Math.sign(z + 1.5 || 1);   // keep the road clear
    const sc = 0.6 + r() * 0.9;
    E.set((r() - 0.5) * 0.5, r() * PI, (r() - 0.5) * 0.5); Q.setFromEuler(E);
    tuft.setMatrixAt(i, M.compose(P.set(x, hillH(x, z) - 0.01, z), Q, S.set(sc, sc, sc)));
  }
  root.add(tuft);
  const rock = toonMat('#857266');
  for (const [x, z, s] of [[-2.2, -0.2, 0.32], [2.6, -0.4, 0.22], [-3.4, -3.0, 0.5], [3.4, -3.4, 0.4], [0.4, 0.4, 0.14], [-1.4, -3.6, 0.25]]) {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rock); m.scale.y = 0.6; m.position.set(x, hillH(x, z) + s * 0.25, z); m.rotation.y = x * 3; m.castShadow = m.receiveShadow = true; root.add(m);
  }
  // a tree on the crest (backlit at sunset: the rim light catches the leaves)
  const tree = new THREE.Group(); tree.position.set(2.5, hillH(2.5, -4.6), -4.6); root.add(tree);
  cyl(tree, 0.08, 0.13, 2.2, toonMat('#4a3428'), 0, 1.1, 0, 10);
  const leaf = toonMat('#4f6b38');
  for (const [x, y, z, s] of [[0, 2.5, 0, 0.9], [-0.6, 2.2, 0.2, 0.65], [0.6, 2.3, -0.1, 0.7], [0.2, 3.0, 0.1, 0.6], [-0.3, 2.8, -0.3, 0.55]]) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), leaf); m.position.set(x, y, z); m.castShadow = true; tree.add(m);
  }
  // the cart with a big bronze urn (our own prop) and a lantern
  const cart = new THREE.Group(); root.add(cart);
  const woodM = toonMat(wood('#8e5d36', { boards: 3 })), dark = toonMat('#4a3022');
  box(cart, 1.5, 0.08, 0.95, woodM, 0, 0.62, 0);
  for (const z of [-0.45, 0.45]) box(cart, 1.5, 0.16, 0.05, woodM, 0, 0.72, z);
  for (const z of [-0.55, 0.55]) {
    const w = new THREE.Group(); w.position.set(0, 0.36, z); cart.add(w);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 10, 32), dark); tire.castShadow = true; w.add(tire);
    for (let k = 0; k < 6; k++) { const sp = box(w, 0.03, 0.62, 0.03, woodM, 0, 0, 0); sp.rotation.z = (k * PI) / 6; }
    cyl(w, 0.07, 0.07, 0.08, dark, 0, 0, 0, 12).rotation.x = PI / 2;
  }
  for (const z of [-0.3, 0.3]) { const sh = box(cart, 1.3, 0.05, 0.05, woodM, 1.35, 0.6, z); sh.rotation.z = -0.12; }
  const prof = [[0.001, 0], [0.34, 0], [0.4, 0.08], [0.46, 0.38], [0.44, 0.7], [0.34, 0.86], [0.24, 0.92], [0.26, 0.97], [0.12, 1.02], [0.06, 1.08], [0.09, 1.15], [0.001, 1.2]].map(([a, b]) => new THREE.Vector2(a, b));
  const bronze = toonMetal('#a07a52', { rough: 0.34 }), goldM = toonMetal('#e0aa4c', { rough: 0.22 });
  const urn = new THREE.Mesh(new THREE.LatheGeometry(prof, 56), bronze); urn.scale.setScalar(1.25); urn.position.y = 0.66; urn.castShadow = urn.receiveShadow = true; cart.add(urn);
  for (const [y, rr] of [[0.16, 0.425], [0.62, 0.455], [0.9, 0.3]]) { const b = new THREE.Mesh(new THREE.TorusGeometry(rr * 1.25, 0.022, 10, 64), goldM); b.rotation.x = PI / 2; b.position.y = 0.66 + y * 1.25; cart.add(b); }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 12), goldM); knob.position.y = 0.66 + 1.24 * 1.25; cart.add(knob);
  for (const a of [0.4, 1.4, 2.4, 3.4, 4.4, 5.4]) { const lug = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10), goldM); lug.position.set(Math.sin(a) * 0.56, 0.66 + 0.7 * 1.25, Math.cos(a) * 0.56); lug.scale.set(1, 0.7, 1); cart.add(lug); }
  // v4 x-ray reveal (whip.js / toonGlass / makeCallout test): the urn turns to glass and shows a pendulum, 8 rods, 8 balls
  const glassM = toonGlass('#9cc4e6', { opacity: 0.08, rim: '#eaf6ff', rimOpacity: 0.85 });
  const insides = new THREE.Group(); insides.visible = false; cart.add(insides);
  const pend = new THREE.Group(); pend.position.y = 0.66 + 1.08 * 1.25; insides.add(pend);
  cyl(pend, 0.012, 0.012, 0.72, goldM, 0, -0.36, 0, 10);
  const bob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 12), goldM); bob.position.y = -0.74; pend.add(bob);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * PI * 2, arm = cyl(insides, 0.008, 0.008, 0.44, goldM, Math.cos(a) * 0.24, 1.42, Math.sin(a) * 0.24, 8);
    arm.rotation.set(0, -a, PI / 2);
    const ballI = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 10), goldM); ballI.position.set(Math.cos(a) * 0.5, 1.6, Math.sin(a) * 0.5); insides.add(ballI);
  }
  const callout = makeCallout('pendulum', 'pendulum', { w: 560, size: 104 }); callout.sprite.visible = false; root.add(callout.sprite);
  const lantern = new THREE.Group(); lantern.position.set(1.95, 0.42, 0); cart.add(lantern);
  box(lantern, 0.14, 0.03, 0.14, dark, 0, 0.12, 0); box(lantern, 0.14, 0.03, 0.14, dark, 0, -0.12, 0);
  const flame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.0, 0.9) })); lantern.add(flame);
  const lanternLight = new THREE.PointLight(0xffb060, 0, 5, 2); lanternLight.position.set(0, 0.05, 0.25); lantern.add(lanternLight);
  const lanternGlow = makeGlow(lantern, { size: 1.1, intensity: 0, color: 0xffb060 });
  const rope = cyl(root, 0.011, 0.011, 1, toonMat('#cfae74'), 0, 0, 0, 8);
  const clerk = makeToon(CLERK, { res: 1.7, shadow: true }); root.add(clerk.root);
  const s = sun(root, [0, 0, 0], [0, 0, 0], { half: 5.5, map: 4096 });
  const hemi = root.children.find((o) => o.isHemisphereLight);
  const C = (t, night) => night ? { x: 0.8, z: -0.55 } : { x: lerp(1.05, 1.55, (t - 20) / 4), z: -1.5 };
  const WHIP = 30.6;
  // the tilted cart puts the urn's middle ~0.4 m left of the cart's origin (cart -0.45 -> urn -0.85)
  const urnCam = (t) => ({ p: [-0.55, 2.0, K(t, [[28, 1.75], [WHIP, 1.3]])], a: [-0.85, 1.75, -1.4], fov: 46 });
  const clerkCam = (t) => ({ p: [K(t, [[WHIP, 0.95], [33, 0.85]]), 2.25, K(t, [[WHIP, 2.6], [33, 2.25]])], a: [0.75, 2.0, -0.55], fov: 44 });
  const up = new THREE.Vector3(0, 1, 0), slope = Math.atan(0.3);
  const skies = {}, motes = {};
  const variant = (mood, night, xray = false) => {
    const M0 = MOOD[mood];
    if (!skies[mood]) {
      skies[mood] = makeSky(root, M0.sky); skies[mood].root.visible = false;
      motes[mood] = makeMotes(root, { ...M0.motes, n: night ? 70 : 160, box: night ? [-2.2, 0.4, -3.5, 2.6, 2.6, 0.6] : [-4, 0.2, -5, 4, 3.6, 1.5] });
      motes[mood].points.visible = false;
    }
    const still = night || xray;   // the cart is parked and the clerk stands beside it
    const sd = new THREE.Vector3(...M0.sky.sun.dir).normalize();
    return {
      root, tone: { charExtra: 1, ...M0.tone }, grade: M0.grade, env: M0.env, exposure: night ? 1.05 : 1.0,
      cInf: night ? 4 : 5, slab: night ? 0.8 : 0, bloom: night ? 0.3 : 0.2, near: 0.05, far: 700, bg: null, fog: new THREE.Fog(M0.fog, night ? 8 : 14, night ? 200 : 300),
      enter() {
        for (const k in skies) { skies[k].root.visible = k === mood; motes[k].points.visible = k === mood; }
        const tgt = new THREE.Vector3(1.0, hillH(1, -1.5), -1.5);
        s.target.position.copy(tgt); s.position.copy(tgt).addScaledVector(sd, 25);
        s.color.set(night ? 0xb8c8ff : 0xffd2a0); s.intensity = night ? 1.2 : 2.6; hemi.intensity = night ? 0.25 : 0.7;
        lanternLight.intensity = night ? 2.4 : 0; lanternGlow.material.color.set(0xffb060).multiplyScalar(night ? 0.9 : 0); flame.visible = night;
        urn.material = xray ? glassM : bronze; urn.castShadow = !xray; insides.visible = xray; callout.sprite.visible = xray;
      },
      cam: xray ? (t) => whipCam(urnCam, clerkCam, t, WHIP) : night
        ? (t) => ({ p: [K(t, [[24, -0.05], [28, 0.05]]), hillH(0, 4.6) + 1.35, K(t, [[24, 4.6], [28, 4.2]])], a: [-0.12, hillH(0, -1.0) + 1.5, -1.0], fov: 46 })
        : (t) => ({ p: [K(t, [[20, -0.25], [24, 0.05]]), hillH(0, 6.6) + 0.3, 6.6], a: [K(t, [[20, -0.12], [24, 0.12]]), hillH(0, -1.5) + 1.2, -1.5], fov: 50 }),
      focus: (t) => { if (xray) return t < WHIP + 0.16 ? [-0.85, 1.75, -1.4] : [0.8, 2.1, -0.55]; const c = C(t, night); return [c.x, hillH(c.x, c.z) + 1.3, c.z]; },
      update(t, camera, renderer) {
        skies[mood].update(camera, t); motes[mood].update(t, camera, renderer);
        const c = C(t, still), gy = hillH(c.x, c.z);
        const walking = !still, ph = ((c.x - 1.05) / 0.36) * PI;
        clerk.root.position.set(c.x, gy - (walking ? 0.03 * Math.abs(Math.sin(ph)) : 0), c.z);
        clerk.pivot.rotation.z = walking ? -0.1 : 0;
        clerk.face(camera, s);
        clerk.set(xray ? { expr: 'o', blink: lidAt(t, 19), look: -0.5, face: { sweat: true }, arms: ARMS.clasp } : night
          ? { expr: 'worried', blink: lidAt(t, 13), look: K(t, [[24, -0.2], [25.5, -0.2], [26, 0.5]]), face: { sweat: true }, arms: ARMS.clasp }
          : { expr: 'neutral', blink: lidAt(t, 17), walk: ph, arms: { L: [120, 470], R: [190, 520], bend: -20 } });
        const cx = still ? -0.45 : c.x - 2.3;
        cart.position.set(cx, hillH(cx, -1.45), -1.45); cart.rotation.set(Math.atan(0.12), 0, slope);
        clerk.root.updateMatrixWorld(true); cart.updateMatrixWorld(true);
        const a = root.worldToLocal(cardPoint(clerk, 120, 470)), b = root.worldToLocal(cart.localToWorld(new THREE.Vector3(1.45, 0.62, 0)));
        rope.visible = !still;
        if (xray) {
          callout.sprite.visible = t < WHIP + 0.16;
          pend.rotation.z = Math.sin(t * 2.6) * 0.14;
          // up-left of the bob: the bob sits right of centre, a label to its right left the frame
          const bw = bob.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(-0.42, 0.28, 0.15));
          callout.at(root.worldToLocal(bw).toArray(), camera, 104);
        }
        rope.position.copy(a).add(b).multiplyScalar(0.5); rope.scale.set(1, a.distanceTo(b), 1); rope.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
      },
    };
  };
  return { dusk: variant('sunset', false), night: variant('night', true), xray: variant('sunset', false, true) };
}

// ---------------------------------------------------------------- build / update
export async function build(studio) {
  const { scene, camera, renderer } = studio;
  studio.fill.intensity = 0;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const post = toonPost(studio, { grade: GRADE_RICH, bloom: { threshold: 1.05, strength: 0.35, radius: 0.85 },
    ink: { widthNear: 3.6, widthFar: 2.3, distNear: 1.5, distFar: 40, tint: 0.7, ao: 0.85, aoRadius: 0.35 }, lens: { maxCoC: 32, bokeh: 0.5 } });
  const sets = {};
  for (const [k, fn] of [['office', buildOffice], ['counter', buildCounter], ['lift', buildLift], ['coins', buildCoins], ['hill', buildHill]]) {
    const root = new THREE.Group(); root.position.set(...OFF[k === 'hill' ? 'dusk' : k]); scene.add(root); root.updateMatrixWorld(true);
    const S = fn(root);
    if (k === 'hill') Object.assign(sets, S); else sets[k] = S;
  }
  const envs = new Map();   // one prefiltered environment per set (only metals read it)
  for (const k in sets) envs.set(k, makeEnv(renderer, sets[k].env));
  const caption = makeWordCaption(WORDS, { size: 78 });
  // no title / HUD / subtitles in this format: hide them (their empty backdrops still draw a dark smudge)
  for (const id of ['title', 'hud', 'sub', 'end']) document.getElementById(id).style.display = 'none';
  const add = (v, o) => v.map((x, i) => x + o[i]);
  const fwd = new THREE.Vector3(), tmp = new THREE.Vector3();
  let lastSet = null;
  function update(t) {
    const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
    const S = sets[shot.set], o = OFF[shot.set];
    if (lastSet !== shot.set) {
      for (const k in sets) sets[k].root.visible = false;
      S.root.visible = true; S.enter?.();
      scene.background = S.bg; scene.fog = S.fog || null; scene.environment = envs.get(shot.set); studio.bloom.strength = S.bloom ?? 0.35;
      setTone(S.tone); post.grade.set(S.grade); renderer.toneMappingExposure = S.exposure;
      camera.near = S.near; camera.far = S.far; camera.updateProjectionMatrix();
      lastSet = shot.set;
    }
    const c = S.cam(t);
    post.whip.set(...(c.blur || [0, 0]));
    studio.setCamera(add(c.p, o), add(c.a, o), c.fov, t, 0);
    camera.updateMatrixWorld(true);
    S.update(t, camera, renderer);
    camera.getWorldDirection(fwd);
    const focus = tmp.set(...add(S.focus(t), o)).sub(camera.position).dot(fwd);
    post.lens.set(focus, S.cInf, S.slab || 0);
    caption.update(t);
  }
  return { update };
}
