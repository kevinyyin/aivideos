// Piazza dei Miracoli, Pisa, in the toon look (dh016). Set-local metres; the tower stands at the origin and leans
// toward +x ("south"), so cameras on the +z side looking -z see the lean across the frame.
//   makeTower({half}): the Leaning Tower as a parametric model: a blind-arcade ground storey, 6 open loggias (instanced
//     columns + an arch band with alpha cut-outs), the narrower bell chamber, a 3 m masonry foundation drum below y = 0.
//     setLean(deg) tilts it about its base, setStoreys(n) shows the ground storey + n storeys (fractions grow the
//     columns: the half-built 1178 stump), setSink(m) lowers it. half = the back half only with cut faces at z = 0
//     (the cutaway in buildSection: the camera sees the hollow inside and the foundation in section).
//   buildPiazza(root): lawn with the tower in its sunken walkway (catino), white paths, the cathedral (long side to the
//     camera, dome + apse), baptistery, the Camposanto wall, city walls, umbrella pines + cypresses, souvenir stalls.
//   buildSection(root): a block of ground cut at z = 0 (topsoil, the soft blue-grey clay with its dish under the tower,
//     sand below) under a half tower; cavities[] = soil-extraction holes under the high side (scale them in).
// The sun is directional light 0 (the two-tone shader reads it); aim it per shot with sun.aim(cx, cz, half, dir).
import * as THREE from 'three';
import { toonMat } from '@engine/toon/shade.js';
import { ctex, blotch, jit } from '@engine/toon/paint.js';
import { box, cyl, plane } from '@engine/toon/kit.js';

const PI = Math.PI, TAU = PI * 2;
export const TOWER = { base: 11, story: 6.5, bell: 5.9, Rb: 7.8, Rin: 3.2, Rc: 6.2, Rcol: 7.45, Rbell: 4.6, Rf: 9.8, F: 3, H: 55.9 };
export const PIAZZA = { catino: 12, catinoY: -1.6, stalls: [[-26, 34], [-14, 36], [-2, 37], [10, 36]] };

// ---------------------------------------------------------------- painted textures
const MARBLE = '#efe8da';
const marbleTex = (rep) => ctex('pisaMarble', 512, 512, (g, r, W, H) => {
  g.fillStyle = MARBLE; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) blotch(g, r() * W, r() * H, 60 + r() * 120, r() < 0.5 ? '255,252,244' : '190,180,165', 0.1);
  for (let y = 0; y < H; y += 64) { g.fillStyle = 'rgba(150,150,165,0.22)'; g.fillRect(0, y + 20, W, 7); }   // the grey courses
  g.strokeStyle = 'rgba(160,150,135,0.35)'; g.lineWidth = 2;
  for (let y = 0; y < H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (y / 32) % 2 ? 0 : 48; x < W; x += 96) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } }
}, rep);
const baseArcTex = () => ctex('pisaBaseArc', 256, 352, (g, r, W, H) => {   // one bay of the ground storey's blind arcade
  g.fillStyle = MARBLE; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 22) { g.fillStyle = (y / 22) % 3 === 1 ? 'rgba(150,152,170,0.25)' : 'rgba(255,255,255,0.0)'; g.fillRect(0, y, W, 9); }
  const x0 = 34, x1 = W - 34, rad = (x1 - x0) / 2, cy = 64 + rad;
  g.beginPath(); g.moveTo(x0, H - 14); g.lineTo(x0, cy); g.arc(W / 2, cy, rad, PI, 0); g.lineTo(x1, H - 14); g.closePath();
  g.fillStyle = '#ddd4c2'; g.fill(); g.lineWidth = 7; g.strokeStyle = '#b9ae9b'; g.stroke();
  g.beginPath(); g.arc(W / 2, cy, rad + 12, PI, 0); g.lineWidth = 10; g.strokeStyle = 'rgba(140,140,160,0.45)'; g.stroke();
  // a lozenge + a small dark window in some bays
  g.fillStyle = 'rgba(120,120,140,0.35)'; g.beginPath(); g.moveTo(W / 2, cy - rad * 0.55); g.lineTo(W / 2 + 18, cy - rad * 0.3); g.lineTo(W / 2, cy - rad * 0.05); g.lineTo(W / 2 - 18, cy - rad * 0.3); g.closePath(); g.fill();
  g.fillStyle = 'rgba(160,150,135,0.5)'; g.fillRect(0, H - 14, W, 14);
});
const innerTex = () => ctex('pisaInner', 256, 256, (g, r, W, H) => {   // the loggia core wall: a door / window per bay
  g.fillStyle = '#ddd5c5'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) blotch(g, r() * W, r() * H, 80, '160,150,135', 0.12);
  const w = 70, x = W / 2 - w / 2, top = 70;
  g.beginPath(); g.moveTo(x, H - 30); g.lineTo(x, top + w / 2); g.arc(W / 2, top + w / 2, w / 2, PI, 0); g.lineTo(x + w, H - 30); g.closePath();
  g.fillStyle = '#4b4552'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#b3a892'; g.stroke();
  g.fillStyle = 'rgba(150,140,125,0.6)'; g.fillRect(0, H - 30, W, 30);
});
const archTex = () => ctex('pisaArch', 128, 104, (g, r, W, H) => {   // one bay of a loggia's arch band (alpha cut-out)
  g.fillStyle = '#f1ebdf'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(150,152,170,0.3)'; g.fillRect(0, 6, W, 8);
  const rad = 44;
  g.beginPath(); g.arc(W / 2, H, rad + 7, PI, 0); g.lineWidth = 7; g.strokeStyle = '#c9bfad'; g.stroke();
  g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(W / 2, H, rad, PI, 0); g.closePath(); g.fill();
  g.globalCompositeOperation = 'source-over';
});
const cutTex = () => ctex('pisaCut', 256, 256, (g, r, W, H) => {   // masonry in section: stone courses + rubble core
  g.fillStyle = '#b9ad98'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { g.fillStyle = r() < 0.5 ? 'rgba(120,108,92,0.35)' : 'rgba(230,220,200,0.35)'; g.beginPath(); g.ellipse(r() * W, r() * H, 6 + r() * 12, 4 + r() * 8, r() * 3, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(90,80,70,0.45)'; g.lineWidth = 3; for (let y = 0; y < H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}, [1, 1]);
const lawnTex = () => ctex('pisaLawn', 512, 512, (g, r, W, H) => {
  g.fillStyle = '#7fb24f'; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 128) { g.fillStyle = 'rgba(200,235,140,0.16)'; g.fillRect(x, 0, 64, H); }   // mowing stripes
  for (let i = 0; i < 40; i++) blotch(g, r() * W, r() * H, 40 + r() * 90, r() < 0.5 ? '170,215,110' : '70,120,50', 0.14);
  for (let i = 0; i < 900; i++) { g.strokeStyle = r() < 0.5 ? 'rgba(60,110,45,0.35)' : 'rgba(190,230,140,0.35)'; g.lineWidth = 2; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - 6); g.stroke(); }
});
const paveTex = () => ctex('pisaPave', 512, 512, (g, r, W, H) => {
  g.fillStyle = '#e9e1d0'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 64) for (let x = ((y / 64) % 2) * 48; x < W + 96; x += 96) { g.fillStyle = jit(r, '#e9e1d0', 0.05, 3, 0.1); g.fillRect(x + 2, y + 2, 92, 60); }
  g.strokeStyle = 'rgba(150,135,110,0.4)'; g.lineWidth = 3;
  for (let y = 0; y < H; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
});
const brickTex = () => ctex('pisaBrick', 512, 512, (g, r, W, H) => {
  g.fillStyle = '#c99a6a'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 24) for (let x = ((y / 24) % 2) * 30; x < W + 60; x += 60) { g.fillStyle = jit(r, '#c99a6a', 0.08, 4, 0.12); g.fillRect(x + 2, y + 2, 56, 20); }
  for (let i = 0; i < 20; i++) blotch(g, r() * W, r() * H, 80, r() < 0.5 ? '230,200,160' : '120,80,50', 0.12);
});
const facadeTex = (key, rows) => ctex('pisaFacade' + key, 512, 512, (g, r, W, H) => {   // cathedral / Camposanto wall: stripes + blind arcades
  g.fillStyle = MARBLE; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 28) { g.fillStyle = (y / 28) % 2 ? 'rgba(140,145,165,0.28)' : 'rgba(255,255,255,0)'; g.fillRect(0, y, W, 12); }
  const rh = H / rows;
  for (let k = 0; k < rows; k++) for (let i = 0; i < 4; i++) {
    const x0 = i * 128 + 18, x1 = x0 + 92, top = k * rh + 22, bot = (k + 1) * rh - 10, rad = 46;
    g.beginPath(); g.moveTo(x0, bot); g.lineTo(x0, top + rad); g.arc((x0 + x1) / 2, top + rad, rad, PI, 0); g.lineTo(x1, bot); g.closePath();
    g.fillStyle = 'rgba(205,196,180,1)'; g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(160,150,135,0.8)'; g.stroke();
    if (k === rows - 1 && i % 2 === 0) { g.fillStyle = '#4e4856'; g.beginPath(); g.moveTo(x0 + 26, bot); g.lineTo(x0 + 26, top + rad + 6); g.arc((x0 + x1) / 2, top + rad + 6, 20, PI, 0); g.lineTo(x1 - 26, bot); g.closePath(); g.fill(); }
  }
});
const awningTex = (c) => ctex('pisaAwning' + c, 256, 64, (g, r, W, H) => {
  for (let x = 0; x < W; x += 32) { g.fillStyle = (x / 32) % 2 ? '#f6f0e4' : c; g.fillRect(x, 0, 32, H - 14); }
  for (let x = 0; x < W; x += 32) { g.fillStyle = (x / 32) % 2 ? '#f6f0e4' : c; g.beginPath(); g.arc(x + 16, H - 14, 16, 0, PI); g.fill(); }
});
/** soil strata for the section face (x -45..45, y -32..0): topsoil, sandy silt, the soft blue-grey clay dished under the
 *  tower (its weight pressed the layer down), dense sand at the bottom */
const strataTex = () => ctex('pisaStrata', 2048, 728, (g, r, W, H) => {
  const X = (x) => ((x + 45) / 90) * W, Y = (y) => (-y / 32) * H;
  const dish = (x, d) => d * Math.exp(-((x / 15) ** 2));   // the dish: deepest under the tower
  const band = (y0, y1, col, d0, d1) => {
    g.beginPath(); for (let x = -45; x <= 45; x += 0.5) g.lineTo(X(x), Y(y0 - dish(x, d0))); for (let x = 45; x >= -45; x -= 0.5) g.lineTo(X(x), Y(y1 - dish(x, d1))); g.closePath();
    g.fillStyle = col; g.fill();
  };
  band(0.4, -0.8, '#6e4a2c', 0, 0);           // topsoil
  band(-0.8, -9, '#b38e5e', 0, 0.6);          // layer A: sandy silt
  band(-9, -27, '#8d9aa6', 0.6, 2.2);         // layer B: soft marine clay
  band(-27, -40, '#d6bf86', 2.2, 0);          // layer C: dense sand
  for (let i = 0; i < 90; i++) blotch(g, r() * W, r() * H, 30 + r() * 70, r() < 0.5 ? '255,250,240' : '40,30,30', 0.07);
  g.strokeStyle = 'rgba(60,50,40,0.25)'; g.lineWidth = 3;   // fine bedding lines
  for (let y = -1.5; y > -32; y -= 1.6) { g.beginPath(); for (let x = -45; x <= 45; x += 0.5) g.lineTo(X(x), Y(y - dish(x, y < -9 ? 1.6 : 0.4)) + Math.sin(x * 0.7 + y) * 2); g.stroke(); }
  for (let i = 0; i < 260; i++) { const x = -45 + r() * 90, y = -1 - r() * 8; g.fillStyle = 'rgba(90,60,35,0.5)'; g.beginPath(); g.ellipse(X(x), Y(y), 3 + r() * 5, 2 + r() * 3, 0, 0, TAU); g.fill(); }
});

// ---------------------------------------------------------------- the tower
let MATS = null;
function mats() {
  if (MATS) return MATS;
  const at = archTex(); at.wrapT = THREE.ClampToEdgeWrapping;
  MATS = {
    marble: toonMat(marbleTex([4, 6])), col: toonMat('#f3ede1'), base: toonMat(baseArcTex()), inner: toonMat(innerTex()),
    arch: toonMat(at, { alphaTest: 0.5, side: THREE.DoubleSide }), roof: toonMat('#cfc4ae'), found: toonMat('#a99c86'), cut: toonMat(cutTex()),
  };
  return MATS;
}
/** the Leaning Tower; group origin = the centre of its base at ground level */
export function makeTower({ half = false } = {}) {
  const T = TOWER, M = mats(), g = new THREE.Group(), lean = new THREE.Group(); g.add(lean);
  const t0 = half ? PI / 2 : 0, tl = half ? PI : TAU, side = half ? THREE.DoubleSide : THREE.FrontSide;
  const sideMat = (m) => { if (!half) return m; const c = m.clone(); c.side = THREE.DoubleSide; c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey; return c; };
  const tube = (parent, r0, r1, h, m, y, rep = 1, open = false) => {
    const geo = new THREE.CylinderGeometry(r0, r1, h, 48, 1, open, t0, tl);
    if (rep !== 1) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * rep * (half ? 0.5 : 1)); }
    const o = new THREE.Mesh(geo, m); o.position.y = y; o.castShadow = o.receiveShadow = true; parent.add(o); return o;
  };
  /** cut faces of a wall annulus [ri, ro] x [y0, y1] at z = 0 (half tower only) */
  const cutFace = (parent, ri, ro, y0, y1) => {
    if (!half) return;
    for (const s of [-1, 1]) { const p = plane(parent, ro - ri, y1 - y0, M.cut, s * (ri + ro) / 2, (y0 + y1) / 2, 0.02); p.castShadow = true; }
  };
  const levels = [];
  const colGeo = (h) => new THREE.CylinderGeometry(0.22, 0.26, h, 10);
  const ring = (parent, n, R, y, h, phase = 0) => {   // instanced columns + capitals around a loggia
    const ang = []; for (let i = 0; i < n; i++) { const a = phase + (i / n) * TAU; if (!half || Math.cos(a) < 0.02) ang.push(a); }
    const im = new THREE.InstancedMesh(colGeo(h), M.col, ang.length), cap = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.28, 0.62), M.col, ang.length);
    const m4 = new THREE.Matrix4();
    ang.forEach((a, i) => { im.setMatrixAt(i, m4.makeTranslation(Math.sin(a) * R, y + h / 2, Math.cos(a) * R)); cap.setMatrixAt(i, m4.makeTranslation(Math.sin(a) * R, y + h + 0.14, Math.cos(a) * R)); });
    im.castShadow = im.receiveShadow = cap.castShadow = cap.receiveShadow = true; parent.add(im, cap);
    return { im, cap, h, y };
  };
  // foundation drum (below ground) + plinth steps
  const found = new THREE.Group(); lean.add(found);
  tube(found, T.Rf, T.Rf, T.F, sideMat(M.found), -T.F / 2);
  if (half) { const c = plane(found, T.Rf * 2, T.F, M.cut, 0, -T.F / 2, 0.03); c.castShadow = true; }
  // ground storey: thick wall with a blind arcade, 15 engaged columns, plinth, cornice
  const L0 = new THREE.Group(); lean.add(L0); levels.push(L0);
  tube(L0, 8.4, 8.4, 0.35, sideMat(M.marble), 0.17); tube(L0, 8.1, 8.1, 0.35, sideMat(M.marble), 0.52);
  tube(L0, T.Rb, T.Rb, T.base - 0.7, sideMat(M.base), 0.7 + (T.base - 0.7) / 2, 15);
  if (half) tube(L0, T.Rin, T.Rin, T.base, sideMat(M.inner), T.base / 2, 6, true);
  cutFace(L0, T.Rin, T.Rb, 0, T.base);
  ring(L0, 15, T.Rb + 0.12, 0.7, T.base - 1.4, PI / 15);
  tube(L0, T.Rb + 0.45, T.Rb + 0.3, 0.5, sideMat(M.marble), T.base - 0.25);
  // six loggias
  for (let i = 0; i < 6; i++) {
    const L = new THREE.Group(), y0 = T.base + i * T.story; lean.add(L); levels.push(L);
    tube(L, T.Rcol + 0.5, T.Rcol + 0.5, 0.35, sideMat(M.marble), y0 + 0.17);
    const core = tube(L, T.Rc, T.Rc, T.story, sideMat(M.inner), y0 + T.story / 2, 15);
    if (half) { tube(L, T.Rin, T.Rin, T.story, sideMat(M.inner), y0 + T.story / 2, 6, true); cutFace(L, T.Rin, T.Rc, y0, y0 + T.story); cutFace(L, T.Rc, T.Rcol + 0.5, y0, y0 + 0.35); }
    const cols = ring(L, 30, T.Rcol, y0 + 0.35, T.story - 1.95);
    const band = tube(L, T.Rcol + 0.06, T.Rcol + 0.06, 1.25, M.arch, y0 + T.story - 0.62 - 0.35, 30, true);
    tube(L, T.Rcol + 0.42, T.Rcol + 0.36, 0.38, sideMat(M.marble), y0 + T.story - 0.19);
    if (half) cutFace(L, T.Rc, T.Rcol + 0.42, y0 + T.story - 0.38, y0 + T.story);
    L.userData = { cols, band, core, y0 };
  }
  // bell chamber
  const LB = new THREE.Group(), yb = T.base + 6 * T.story; lean.add(LB); levels.push(LB);
  tube(LB, T.Rbell + 0.4, T.Rbell + 0.4, 0.35, sideMat(M.marble), yb + 0.17);
  tube(LB, T.Rbell - 0.9, T.Rbell - 0.9, T.bell, sideMat(M.inner), yb + T.bell / 2, 8);
  ring(LB, 16, T.Rbell, yb + 0.35, T.bell - 1.9);
  tube(LB, T.Rbell + 0.05, T.Rbell + 0.05, 1.2, M.arch, yb + T.bell - 0.95, 16, true);
  tube(LB, T.Rbell + 0.4, T.Rbell + 0.3, 0.42, sideMat(M.marble), yb + T.bell - 0.2);
  tube(LB, 0.9, T.Rbell - 0.2, 1.1, sideMat(M.roof), yb + T.bell + 0.5);   // (top, bottom) radii: a low cone roof
  if (half) cutFace(LB, T.Rbell - 0.9, T.Rbell + 0.4, yb, yb + T.bell);
  const top = new THREE.Object3D(); top.position.set(0, T.H, 0); lean.add(top);
  let leanDeg = 0;
  return {
    g, lean, levels, found, top,
    /** tilt toward +x by deg degrees (about the base centre) */
    setLean(deg) { leanDeg = deg; lean.rotation.z = (-deg * PI) / 180; },
    getLean: () => leanDeg,
    setSink(m) { lean.position.y = -m; },
    /** ground storey + n storeys (n up to 7 = the bell chamber); a fraction grows that storey's columns */
    setStoreys(n) {
      levels.forEach((L, i) => {
        L.visible = i <= Math.ceil(n);
        if (i >= 1 && i <= 6) {
          const f = i <= n ? 1 : Math.max(0.05, n - (i - 1)), U = L.userData;
          U.cols.im.scale.y = f; U.cols.cap.visible = f === 1; U.band.visible = f === 1;
          U.cols.im.position.y = U.cols.y * (1 - f);
          L.children.forEach((o) => { if (o !== U.cols.im && o !== U.cols.cap && o !== U.band && o !== L.children[0]) o.visible = f === 1 || o === U.core; });
          U.core.scale.y = f; U.core.position.y = U.y0 + (T.story * f) / 2;
        }
      });
    },
    /** world point of the top centre (call after updateMatrixWorld) */
    topWorld: (out = new THREE.Vector3()) => top.getWorldPosition(out),
  };
}

// ---------------------------------------------------------------- the piazza
function roofPrism(parent, len, w, h, m, x, y, z, alongX = true) {   // a gabled roof: a lying 3-sided cylinder, ridge up, eaves at y
  const r = w / Math.sqrt(3), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 3, 1), m);
  o.scale.set(1, 1, h / (1.5 * r));
  o.rotation.set(-PI / 2, 0, alongX ? -PI / 2 : 0);
  o.position.set(x, y + h / 3, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
function pine(root, x, z, s, M) {   // Italian umbrella pine
  cyl(root, 0.35 * s, 0.5 * s, 9 * s, M.trunk, x, 4.5 * s, z, 8).rotation.z = 0.08;
  for (const [dx, dy, dz, r] of [[0, 10, 0, 4.2], [2.6, 9.4, 1, 3.0], [-2.4, 9.6, -0.8, 3.2], [0.6, 9.2, -2.4, 2.8]]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r * s, 14, 8), M.pine); b.scale.y = 0.42; b.position.set(x + dx * s, dy * s, z + dz * s); b.castShadow = true; root.add(b);
  }
}
function cypress(root, x, z, s, M) {
  const c = new THREE.Mesh(new THREE.ConeGeometry(1.3 * s, 11 * s, 10), M.cypress); c.position.set(x, 5.6 * s, z); c.castShadow = true; root.add(c);
}
function stall(root, x, z, color, M) {   // souvenir stall: counter, striped awning, little leaning towers for sale
  const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
  box(g, 3.2, 1.0, 1.1, M.stallWood, 0, 0.5, 0, 0.04);
  for (const sx of [-1.5, 1.5]) for (const sz of [-0.5, 0.5]) cyl(g, 0.05, 0.05, 2.5, M.post, sx, 1.25, sz, 6);
  const aw = box(g, 3.5, 0.08, 1.7, toonMat(awningTex(color)), 0, 2.55, 0.15); aw.rotation.x = 0.18;
  const front = plane(g, 3.5, 0.42, toonMat(awningTex(color), { side: THREE.DoubleSide }), 0, 2.32, 1.02); front.material.map.wrapT = THREE.ClampToEdgeWrapping;
  for (let i = 0; i < 7; i++) {   // souvenirs: tiny leaning towers
    const t = cyl(g, 0.07, 0.08, 0.36, M.souv, -1.25 + i * 0.42, 1.18, 0.15 + (i % 2) * 0.22, 10); t.rotation.z = -0.1;
    cyl(g, 0.055, 0.06, 0.06, M.souvTop, -1.25 + i * 0.42 + 0.02, 1.38, 0.15 + (i % 2) * 0.22, 10);
  }
  box(g, 0.5, 0.35, 0.3, toonMat('#c0473a'), 1.1, 1.18, -0.3, 0.03);   // a stack of postcards
  return g;
}
/** sun + hemisphere; aim(cx, cz, half, dir) moves the shadow box per shot */
export function pisaSun(root, { color = 0xfff0d8, intensity = 2.3, map = 2048, hemi = [0xdcecff, 0xa4b48a, 0.85] } = {}) {
  const s = new THREE.DirectionalLight(color, intensity);
  s.castShadow = true; s.shadow.mapSize.set(map, map); s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.radius = 2;
  root.add(s, s.target); const h = new THREE.HemisphereLight(...hemi); root.add(h);
  return {
    s, hemi: h,
    aim(cx, cz, half = 14, dir = [0.55, 1, 0.6], cy = 0) {
      const d = new THREE.Vector3(...dir).normalize();
      s.target.position.set(cx, cy, cz); s.position.set(cx + d.x * 90, cy + d.y * 90, cz + d.z * 90);
      Object.assign(s.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 220 }); s.shadow.camera.updateProjectionMatrix();
    },
  };
}
export function buildPiazza(root) {
  const M = {
    lawn: toonMat(lawnTex()), pave: toonMat(paveTex()), catino: toonMat('#cfc5b2'), marble: toonMat(marbleTex([2, 2])),
    duomo: toonMat(facadeTex('d', 2)), campo: toonMat(facadeTex('c', 1)), roof: toonMat('#9aa0a8'), dome: toonMat('#c9a26a'),
    wall: toonMat(brickTex()), trunk: toonMat('#7a5a40'), pine: toonMat('#4f7a3c'), cypress: toonMat('#3e6236'),
    stallWood: toonMat('#a8743f'), post: toonMat('#e8e2d6'), souv: toonMat('#f4efe4'), souvTop: toonMat('#c9b27a'),
  };
  M.lawn.map.repeat.set(1 / 9, 1 / 9); M.pave.map.repeat.set(1 / 4, 1 / 4); M.wall.map.repeat.set(1 / 6, 1 / 6);
  // lawn with a round hole for the tower's sunken walkway (catino)
  const sh = new THREE.Shape(); sh.moveTo(-300, -300); sh.lineTo(300, -300); sh.lineTo(300, 300); sh.lineTo(-300, 300); sh.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, PIAZZA.catino, 0, TAU, true); sh.holes.push(hole);
  const lawn = new THREE.Mesh(new THREE.ShapeGeometry(sh, 64), M.lawn); lawn.rotation.x = -PI / 2; lawn.receiveShadow = true; root.add(lawn);
  const cat = new THREE.Mesh(new THREE.CircleGeometry(PIAZZA.catino, 64), M.catino); cat.rotation.x = -PI / 2; cat.position.y = PIAZZA.catinoY; cat.receiveShadow = true; root.add(cat);
  const cw = new THREE.Mesh(new THREE.CylinderGeometry(PIAZZA.catino, PIAZZA.catino, -PIAZZA.catinoY, 64, 1, true), toonMat(paveTex(), { side: THREE.BackSide }));
  cw.position.y = PIAZZA.catinoY / 2; cw.receiveShadow = true; root.add(cw);
  const curb = new THREE.Mesh(new THREE.TorusGeometry(PIAZZA.catino + 0.25, 0.25, 6, 64), M.marble); curb.rotation.x = PI / 2; curb.position.y = 0.05; curb.castShadow = curb.receiveShadow = true; root.add(curb);
  // paths
  const path = (w, d, x, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.pave); p.rotation.x = -PI / 2; p.position.set(x, 0.03, z); p.receiveShadow = true; root.add(p); return p; };
  path(9, 110, -2, 40); path(150, 9, -40, 30); path(9, 40, -18, -30);
  const tower = makeTower(); root.add(tower.g);
  // the cathedral: long side to the camera (nave along x), aisles, transept, a dome on a drum, the apse toward the tower
  const D = new THREE.Group(); root.add(D);
  box(D, 72, 15, 34, M.duomo, -62, 7.5, -48);                       // aisles
  box(D, 72, 12, 16, M.duomo, -62, 21, -48);                        // clerestory
  box(D, 26, 24, 60, M.duomo, -64, 12, -48);                        // transept
  roofPrism(D, 72, 17, 5, M.roof, -62, 27, -48, true);
  roofPrism(D, 60, 27, 6, M.roof, -64, 24, -48, false);
  for (const s of [-1, 1]) { const r = box(D, 72, 0.6, 9.5, M.roof, -62, 15.6, -48 + s * 12.4); r.rotation.x = s * 0.32; }
  const drum = cyl(D, 7.5, 7.5, 5, M.marble, -64, 31, -48, 24);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(7.6, 28, 14, 0, TAU, 0, PI / 2), M.dome); dome.scale.y = 1.35; dome.position.set(-64, 33.5, -48); dome.castShadow = true; D.add(dome);
  cyl(D, 0.5, 0.9, 2.6, M.dome, -64, 45, -48, 10); void drum;
  const apse = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 20, 24, 1, false, 0, PI), M.duomo); apse.position.set(-26, 10, -48); apse.castShadow = apse.receiveShadow = true; D.add(apse);
  const apR = new THREE.Mesh(new THREE.SphereGeometry(8.2, 20, 10, PI / 2, PI, 0, PI / 2), M.roof); apR.position.set(-26, 20, -48); D.add(apR);
  // baptistery (far left), Camposanto (a long low wall), the city walls with crenellations
  const bap = cyl(root, 17, 17, 22, M.duomo, -135, 11, -60, 40); void bap;
  const bd = new THREE.Mesh(new THREE.SphereGeometry(13, 28, 14, 0, TAU, 0, PI / 2), M.roof); bd.scale.y = 1.25; bd.position.set(-135, 22, -60); bd.castShadow = true; root.add(bd);
  cyl(root, 1.2, 1.6, 4, M.marble, -135, 39, -60, 12);
  box(root, 120, 11, 14, M.campo, -80, 5.5, -92);
  roofPrism(root, 120, 15, 3, M.roof, -80, 11, -92, true);
  const walls = [[[-220, -120], [140, -120]], [[140, -120], [140, 110]]];
  const merl = new THREE.BoxGeometry(1.4, 1.4, 1.4), mPos = [];
  for (const [[x0, z0], [x1, z1]] of walls) {
    const len = Math.hypot(x1 - x0, z1 - z0), w = box(root, x0 === x1 ? 3 : len, 11, x0 === x1 ? len : 3, M.wall, (x0 + x1) / 2, 5.5, (z0 + z1) / 2);
    void w; for (let d = 1; d < len; d += 3) mPos.push([x0 + ((x1 - x0) * d) / len, 11.7, z0 + ((z1 - z0) * d) / len]);
  }
  const merM = new THREE.InstancedMesh(merl, M.wall, mPos.length), m4 = new THREE.Matrix4();
  mPos.forEach((p, i) => merM.setMatrixAt(i, m4.makeTranslation(...p))); merM.castShadow = true; root.add(merM);
  // trees
  const pines = [[60, -40, 1.2], [75, -10, 1.0], [70, 25, 1.3], [92, -70, 1.1], [-110, 10, 1.2], [-160, 20, 1.0], [40, 75, 1.1], [-60, 80, 1.2], [100, 60, 1.3], [-20, -105, 1.0], [30, -100, 1.2]];
  pines.forEach(([x, z, s]) => pine(root, x, z, s, M));
  for (let i = 0; i < 9; i++) cypress(root, 55 + (i % 3) * 7, -70 + i * 9, 1 + (i % 2) * 0.2, M);
  // souvenir stalls along the front path
  const stalls = PIAZZA.stalls.map(([x, z], i) => stall(root, x, z, ['#c94a3c', '#3c6fb4', '#d99a2a', '#3f9a72'][i], M));
  return { root, tower, duomo: D, lawn, stalls, M };
}

// ---------------------------------------------------------------- the cutaway
/** ground cut at z = 0 under a half tower: strata face, lawn on top, a grey sky wall far behind (the section reads as a
 *  diagram); cavities[i] = dark soil-extraction holes under the high (-x) side, grown with .scale */
export function buildSection(root) {
  const face = plane(root, 90, 32, toonMat(strataTex()), 0, -16, 0); face.material.map.wrapS = face.material.map.wrapT = THREE.ClampToEdgeWrapping;
  const top = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), toonMat(lawnTex())); top.material.map.repeat.set(10, 8); top.rotation.x = -PI / 2; top.position.set(0, 0, -35); top.receiveShadow = true; root.add(top);
  const lip = box(root, 90, 0.5, 0.4, toonMat('#5e8f3c'), 0, -0.2, 0.2); void lip;   // a grass lip on the cut edge
  for (const s of [-1, 1]) { const sd = plane(root, 70, 32, toonMat('#7d6248'), s * 45, -16, -35); sd.rotation.y = s * PI / 2; }
  const tower = makeTower({ half: true }); root.add(tower.g);
  const holeM = new THREE.MeshBasicMaterial({ color: 0x2c211c });
  const cavities = [];
  for (let i = 0; i < 6; i++) {   // under the north edge, just outside the critical line
    const c = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), holeM); c.scale.set(1.8, 0.8, 1); c.position.set(-8.6 - i * 0.55, -3.6 - (i % 2) * 0.5, 0.05); c.visible = false; root.add(c); cavities.push(c);
  }
  return { root, tower, face, cavities };
}
