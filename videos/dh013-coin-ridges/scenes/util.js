// dh013 shared scene helpers: easing, a boing, ground placement by screen column, and small props (shears, apple,
// file, newspaper with eye holes, a counting label).
import * as THREE from 'three';
import { K, clamp, lerp, smooth } from '@engine/core.js';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, fitText } from '@engine/toon/paint.js';
import { atScreen, box, cyl, ball } from '@engine/toon/kit.js';
import { NOINK } from '@engine/toon/ink.js';

export { K, clamp, lerp, smooth };
export const PI = Math.PI;
export const sm = (t, a, b) => smooth(clamp((t - a) / (b - a)));
/** 0 → 1 with an overshoot (a cartoon "boing") over d seconds from t0 */
export function boing(t, t0, d = 0.35) {
  const u = clamp((t - t0) / d);
  return u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * PI * 2.2) * Math.exp(-u * 5.5);
}
/** ground point (y = 0) on the screen column fx at view depth d for a camera pose {p, a, fov} */
export function onGround(c, fx, d) { const v = atScreen(c, fx, 0.6, d); return [v.x, 0, v.z]; }
/** cheap camera shake offset for an impact at t0 */
export const shake = (t, t0, amp = 0.02, dur = 0.35) => (t < t0 || t > t0 + dur ? 0 : amp * (1 - (t - t0) / dur) * Math.sin((t - t0) * 70));
/** walk phase for a card toon covering dist metres at stride s */
/** quantized to 12 poses per stride cycle so the card cache repeats instead of drawing a new canvas every frame */
export const phase = (dist, stride = 0.42) => Math.round((dist / stride) * 6) * (PI / 6);

/** tailor's shears: two blades on a pivot; open(k) 0 closed .. 1 open. Points along +x from the pivot. */
export function makeShears(parent, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s); parent.add(g);
  const steel = toonMetal('#c9cdd3', { rough: 0.3 }), black = toonMat('#26262a');
  const blades = [-1, 1].map((k) => {
    const b = new THREE.Group(); g.add(b);
    const bl = box(b, 0.16, 0.012, 0.022, steel, 0.08, 0, 0); bl.castShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 16), black); ring.position.set(-0.05, 0, k * 0.012); ring.rotation.x = PI / 2; b.add(ring);
    box(b, 0.04, 0.01, 0.012, black, -0.02, 0, 0);
    return b;
  });
  ball(g, 0.008, black, 0, 0, 0, 8);
  return { g, open(k) { blades[0].rotation.y = 0.32 * k; blades[1].rotation.y = -0.32 * k; } };
}
export function makeApple(parent, r = 0.06) {
  const g = new THREE.Group(); parent.add(g);
  const a = ball(g, r, toonMat('#c9473e'), 0, 0, 0, 18); a.scale.set(1, 0.92, 1);
  cyl(g, 0.005, 0.006, r * 0.6, toonMat('#5a3a22'), 0, r * 0.95, 0, 6);
  const leaf = ball(g, r * 0.35, toonMat('#6aa04a'), r * 0.3, r * 1.05, 0, 8); leaf.scale.set(1, 0.3, 0.6);
  return g;
}
/** a flat file (rasp) with a wooden handle, along +x */
export function makeFile(parent, L = 0.5) {
  const g = new THREE.Group(); parent.add(g);
  box(g, L, 0.012, 0.05, toonMat(ctex('rasp', 256, 32, (c, r, W, H) => { c.fillStyle = '#7d828a'; c.fillRect(0, 0, W, H); c.strokeStyle = '#4a4e55'; c.lineWidth = 2; for (let x = -H; x < W; x += 7) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.stroke(); } })), 0, 0, 0);
  const h = cyl(g, 0.022, 0.026, 0.2, toonMat('#9a6a40'), -L / 2 - 0.1, 0, 0, 12); h.rotation.z = PI / 2;
  return g;
}
/** THE LONDON GAZETTE with two eye holes (alpha cut) — the disguise prop; hole centres at u = 0.5 ± HOLE_DX, v = HOLE_V */
export const HOLE_DX = 0.13, HOLE_V = 0.3;
export function makeGazette(parent, w = 0.62, h = 0.78) {
  const tex = ctex('gazette', 512, 640, (g, r, W, H) => {
    g.fillStyle = '#efe6cf'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#2a2420'; g.textAlign = 'center'; fitText(g, 'THE LONDON', W / 2, 58, W - 60, 46, 'bold', 'Georgia, serif'); fitText(g, 'GAZETTE', W / 2, 112, W - 60, 56, 'bold', 'Georgia, serif');
    g.fillRect(24, 128, W - 48, 4);
    g.fillStyle = '#6a6056';
    for (let col = 0; col < 3; col++) for (let y = 260; y < H - 30; y += 15) g.fillRect(28 + col * 160, y, 140 - (y % 45 === 0 ? 40 : 0), 6);
    g.fillStyle = '#2a2420'; fitText(g, 'COINERS AT LARGE', W / 2, 232, W - 60, 40, 'bold', 'Georgia, serif');
    g.globalCompositeOperation = 'destination-out';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(W * (0.5 + s * HOLE_DX), H * HOLE_V, 30, 24, 0, 0, 7); g.fill(); }
    g.globalCompositeOperation = 'source-over';
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toonMat(tex, { alphaTest: 0.5, side: THREE.DoubleSide }));
  m.castShadow = true; parent.add(m);
  return m;
}
/** a camera-facing label whose text is redrawn only when it changes (the ridge counter) */
export function makeLabel(parent, { w = 512, h = 256, size = 0.3, draw }) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  s.scale.set(size * (w / h), size, 1); s.layers.set(NOINK); parent.add(s);
  let last = null;
  return { s, set(v) { if (v === last) return; last = v; const g = cv.getContext('2d'); g.clearRect(0, 0, w, h); draw(g, v, w, h); tex.needsUpdate = true; } };
}
