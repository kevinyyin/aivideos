// dh016 worlds + shots. Three places, each its own root: the piazza (engine/sets/pisa.js, every era from 1178 to
// today: the era() switch shows that year's props), the cutaway section (the tower in section on its soil), a kitchen
// (the wobbly-table analogy). Each SHOT entry: set, mood ('day' | 'gold' | 'night' | 'interior'), cam(t) {p, a, fov},
// focus(t) (lens focus point), cInf / slab (lens blur), sun [cx, cz, half] + az / el (sun direction relative to the
// camera: az 0 = in front of the lens, + = to the left), update(t, camera). Word times come from timeline.js (nt).
import * as THREE from 'three';
import { clamp, lerp, smooth, easeOut, rng } from '@engine/core.js';
import { makeToon, makeBlob, lidAt, ARMS, cardPoint, makeStickArm } from '@engine/toon/cards.js';
import { makePuffs } from '@engine/toon/extras.js';
import { toonMat } from '@engine/toon/shade.js';
import { plaster, wood, terrazzo } from '@engine/toon/paint.js';
import { makeGlow } from '@engine/toon/light.js';
import { buildPiazza, buildSection, pisaSun, TOWER, PIAZZA } from '@engine/sets/pisa.js';
import {
  PI, TAU, box, cyl, plane, rod, aimRod, boing, ground, atScreen, CAST, mats, makeBucket, makeRig, makeCable, makeBarrier, makeSign,
  makeLabel, makeLeadStack, makeCrane, makeTank, makePump, makeMixer, makeCar, makePlunger, makeLectern, makeTable, makeSaw, makeBoard,
  makeScaffold, makeTreadwheel, makeStone, makeBanner, makeFrost, makeSplat, along, toScreen, rightOf,
} from './kit.js';
import { LINES, WORDS } from './timeline.js';

const NW = {}; for (const id in LINES) NW[id] = WORDS.filter((w) => w[0] >= LINES[id][0] - 0.01 && w[0] < LINES[id][1] + 0.01).map((w) => w[0]);
/** start time of word i of narration line id (video time) */
export const nt = (id, i) => NW[id][Math.min(i, NW[id].length - 1)];
const u01 = (t, a, b) => clamp((t - a) / (b - a));
const HX = 300;
const POSE = {
  down: ARMS.down, hips: ARMS.hips, clasp: ARMS.clasp,
  point: { L: ARMS.down.L, R: [530, 240], bend: -20 }, pointL: { L: [70, 330], R: ARMS.down.R, bend: -20 },
  cheer: { L: [140, 140], R: [460, 140], bend: -40 }, head: { L: [205, 175], R: [395, 175], bend: 80 },
  shrug: { L: [120, 430], R: [480, 430], bend: -70 }, hold: { L: ARMS.down.L, R: [440, 560], bend: 20 },
  push: { L: ARMS.down.L, R: [560, 360], bend: -10 }, palm: { L: ARMS.down.L, R: [520, 110], bend: -30 },
  throwUp: { L: ARMS.down.L, R: [470, 190], bend: 40 }, throwOut: { L: ARMS.down.L, R: [560, 400], bend: -10 },
  thumb: { L: ARMS.down.L, R: [470, 300], bend: -60 }, lift: { L: ARMS.down.L, R: [470, 470], bend: 40 },
  plunge: { L: [40, 380], R: ARMS.down.R, bend: -10 }, both: { L: [80, 360], R: [520, 360], bend: -20 },
  saw: (k) => ({ L: ARMS.down.L, R: [470 + 40 * k, 560], bend: 30 }),
};

// ---------------------------------------------------------------- build
export function buildWorlds(roots) {
  const P = buildPiazza(roots.piazza), T = P.tower, sun = pisaSun(roots.piazza);
  const m = mats();
  const actors = [];
  const keep = (o) => { actors.push(o); o.visible = false; return o; };
  // toon pools per place
  const pools = new Map();
  function toon(root, key, i = 0, res = 1.4) {
    const k = root.uuid + key; if (!pools.has(k)) pools.set(k, []);
    const arr = pools.get(k);
    while (arr.length <= i) { const tt = makeToon(CAST[key].o, { res, shadow: true, maxCache: 6 }); root.add(tt.root); tt.blob = makeBlob(0.36, 0.22, 0.5); root.add(tt.blob); keep(tt.root); keep(tt.blob); arr.push(tt); }
    return arr[i];
  }
  // ---- piazza props (all eras)
  const R = roots.piazza;
  const rig = makeRig(); rig.g.position.set(-15.5, 0, 8.0); rig.g.rotation.y = 0.476; R.add(keep(rig.g)); rig.g.updateMatrixWorld(true);   // casing aimed at the tower's centre
  const buckets = []; for (let i = 0; i < 14; i++) { const b = makeBucket(); R.add(keep(b.g)); buckets.push(b); }
  const cables = [makeCable(R), makeCable(R)]; cables.forEach((c) => keep(c.c));
  const aframes = []; for (const z of [-7, 7]) { const g = new THREE.Group(); g.position.set(-70, 0, z); R.add(keep(g)); rod(g, [-4, 0, 0], [0, 16, 0], 0.35, m.steel, 6); rod(g, [4, 0, 0], [0, 16, 0], 0.35, m.steel, 6); rod(g, [-2, 8, 0], [2, 8, 0], 0.25, m.steel, 6); aframes.push(g); }
  const barriers = []; for (let i = 0; i < 6; i++) { const b = makeBarrier(2.6); R.add(keep(b)); barriers.push(b); }
  const chiuso = makeSign('chiuso', [['CHIUSO', 150], ['CLOSED', 96]], { w: 1.3, h: 0.95, post: 1.0 }); R.add(keep(chiuso.g));
  const lead = makeLeadStack(); R.add(keep(lead.g));
  const crane = makeCrane(); R.add(keep(crane.g)); const ingot = box(R, 1.5, 0.45, 0.7, m.lead, 0, 0, 0); keep(ingot);
  const tanks = [0, 1, 2].map(() => { const g = makeTank(); R.add(keep(g)); return g; });
  const hoses = [0, 1, 2].map(() => keep(rod(R, [0, 0, 0], [0, 1, 0], 0.07, m.hose, 6)));
  const frost = [0, 1, 2].map(() => { const f = makeFrost(); R.add(keep(f)); return f; });
  const pump = makePump(); R.add(keep(pump.g)); const mixer = makeMixer(); R.add(keep(mixer.g));
  const hose34 = keep(rod(R, [0, 0, 0], [0, 1, 0], 0.06, m.hose, 6));
  const cars = ['#d8d2c2', '#3a6fb4', '#c8363a'].map((c) => { const g = makeCar(c); R.add(keep(g)); return g; });
  const splats = []; for (let i = 0; i < 10; i++) { const s = makeSplat(); R.add(keep(s)); splats.push(s); }
  const tomatoes = []; for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), toonMat('#d33a2c')); R.add(keep(s)); tomatoes.push(s); }
  const plunger = makePlunger(); R.add(keep(plunger));
  const lectern = makeLectern(); R.add(keep(lectern));
  const board = makeBoard(); R.add(keep(board));
  const scaffold = makeScaffold(8.9, 25, 16); R.add(keep(scaffold));
  const tread = makeTreadwheel(); tread.g.position.set(-15, 0, 6); tread.g.rotation.y = 0.5; R.add(keep(tread.g));
  const stones = []; for (let i = 0; i < 8; i++) { const s = makeStone(0.9 + (i % 3) * 0.15); R.add(keep(s)); stones.push(s); }
  const banners = [0, 1].map(() => { const b = makeBanner(); R.add(keep(b.g)); return b; });
  const shovel = new THREE.Group(); R.add(keep(shovel)); cyl(shovel, 0.03, 0.03, 1.2, toonMat('#b58a5a'), 0, 0.6, 0, 6); box(shovel, 0.26, 0.32, 0.03, m.steel, 0, -0.1, 0, 0.02);
  const mound = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.7, 20), m.dirt); mound.position.y = 0.85; mound.castShadow = mound.receiveShadow = true; const moundG = new THREE.Group(); moundG.add(mound); R.add(keep(moundG));
  const flood = [[11, 2, 13], [-12, 2, 11]].map(([x, y, z]) => { const l = new THREE.SpotLight(0xffd29a, 0, 90, 0.5, 0.6, 1.2); l.position.set(x, y, z); l.target.position.set(0, 26, 0); R.add(l, l.target); return l; });
  const glows = [[11, 0.6, 13], [-12, 0.6, 11]].map(([x, y, z]) => keep(makeGlow(R, { color: 0xffc070, size: 2.4, intensity: 0.8, x, y, z })));
  const torches = [0, 1].map(() => { const l = new THREE.SpotLight(0xf2f4ff, 0, 18, 0.32, 0.5, 1.5); R.add(l, l.target); return l; });
  const labels = {
    deg: makeLabel('deg', '5.5°', { size: 130 }), cm: makeLabel('cm', '← 45 cm', { size: 110, w: 640 }), q: makeLabel('q', '?', { w: 192, h: 192, size: 150, bg: 'rgba(255,236,170,0.95)' }),
    m3: makeLabel('m3', '3 m', { size: 120, w: 384 }), clay: makeLabel('clay', 'SOFT CLAY', { size: 96, w: 640, bg: 'rgba(225,235,245,0.95)' }),
  };
  for (const k in labels) R.add(keep(labels[k]));
  const plumb = keep(rod(R, [0, 0, 0], [0, 1, 0], 0.06, m.rope, 5)); const bob = cyl(R, 0.0, 0.35, 0.7, toonMat('#c9a24a'), 0, 0, 0, 12); keep(bob);
  const puffs = makePuffs(R, 90);
  const ghost = keep(new THREE.Group()); R.add(ghost);
  // ---- the section
  const S = buildSection(roots.section), sunS = pisaSun(roots.section);
  const RS = roots.section;
  const spade = new THREE.Group(); RS.add(keep(spade)); cyl(spade, 0.25, 0.25, 9, toonMat('#b58a5a'), 0, 4.5, 0, 8); box(spade, 2.6, 3.0, 0.3, m.steel, 0, -1.4, 0, 0.2);
  const scoop = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: 0x2c211c })); scoop.position.z = 0.06; RS.add(keep(scoop));
  const clayDark = plane(RS, 30, 15, new THREE.MeshBasicMaterial({ color: 0x24303c, transparent: true, opacity: 0, depthWrite: false }), 0, -17, 0.05); keep(clayDark);
  const redZone = plane(RS, 14, 7, new THREE.MeshBasicMaterial({ map: radialTex('255,70,50'), transparent: true, depthWrite: false }), 7.5, -4.2, 0.07); keep(redZone);
  const drill = new THREE.Group(); RS.add(keep(drill)); { const d = cyl(drill, 0.35, 0.35, 10, m.steel, 5, 0, 0, 12); d.rotation.z = PI / 2; const bit = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 12), m.dark); bit.rotation.z = PI / 2; bit.position.x = -0.6; drill.add(bit); }
  const augers = [0, 1, 2].map(() => { const r2 = makeRig({ dip: 0.5, len: 13 }); RS.add(keep(r2.g)); return r2; });
  const sBuckets = []; for (let i = 0; i < 3; i++) { const b = makeBucket(); b.g.scale.setScalar(2.2); RS.add(keep(b.g)); sBuckets.push(b); }
  const sLabels = { m3: makeLabel('sm3', '3 m', { size: 120, w: 384 }), clay: makeLabel('sclay', 'SOFT CLAY', { size: 96, w: 640, bg: 'rgba(225,235,245,0.95)' }) };
  for (const k in sLabels) RS.add(keep(sLabels[k]));
  const dimBar = keep(rod(RS, [0, 0, 0], [0, 1, 0], 0.12, new THREE.MeshBasicMaterial({ color: 0x17121a }), 6));
  const arrows = []; for (let i = 0; i < 5; i++) { const a = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 3), new THREE.MeshBasicMaterial({ color: 0xf4f1ea })); a.rotation.z = PI; RS.add(keep(a)); arrows.push(a); }
  const sPuffs = makePuffs(RS, 40);
  // ---- the kitchen
  const RK = roots.kitchen, K = buildKitchen(RK), sunK = pisaSun(RK, { intensity: 1.7, hemi: [0xfff0e0, 0x8a6a5a, 0.7] });
  return { P, T, sun, rig, buckets, cables, aframes, barriers, chiuso, lead, crane, ingot, tanks, hoses, frost, pump, mixer, hose34, cars, splats, tomatoes,
    plunger, lectern, board, scaffold, tread, stones, banners, shovel, moundG, flood, glows, torches, labels, plumb, bob, puffs, ghost,
    S, sunS, spade, scoop, clayDark, redZone, drill, augers, sBuckets, sLabels, dimBar, arrows, sPuffs, K, sunK, toon, actors, roots };
}
function radialTex(rgb) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${rgb},0.75)`); gr.addColorStop(0.6, `rgba(${rgb},0.35)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function buildKitchen(root) {
  const fl = plane(root, 8, 8, toonMat(wood('#c9965e', { boards: 8, repeat: [2, 2] })), 0, 0, -1); fl.rotation.x = -PI / 2;
  const wallM = toonMat(plaster('#f1e2c8', [2, 1]));
  box(root, 8, 3.2, 0.12, wallM, 0, 1.6, -2.4);
  box(root, 0.12, 3.2, 6, wallM, -3.2, 1.6, 0.4);
  const tiles = toonMat(terrazzo('#dfe9ec', [3, 1]));
  box(root, 3.4, 0.9, 0.62, toonMat('#7aa0b8'), 1.6, 0.45, -2.05, 0.03); box(root, 3.5, 0.06, 0.66, toonMat('#f2ede2'), 1.6, 0.93, -2.05);
  box(root, 3.4, 0.7, 0.02, tiles, 1.6, 1.32, -2.33);
  box(root, 3.4, 0.7, 0.4, toonMat('#7aa0b8'), 1.6, 2.3, -2.15, 0.03);
  const win = plane(root, 1.3, 1.0, new THREE.MeshBasicMaterial({ color: new THREE.Color('#cfe6ff').multiplyScalar(1.6) }), -1.2, 1.7, -2.33); void win;
  box(root, 1.42, 0.08, 0.1, toonMat('#f4f1ea'), -1.2, 1.2, -2.3); box(root, 1.42, 0.08, 0.1, toonMat('#f4f1ea'), -1.2, 2.22, -2.3);
  makeGlow(root, { color: 0xdcecff, size: 2.4, intensity: 0.5, x: -1.2, y: 1.7, z: -2.2 });
  const pot = cyl(root, 0.12, 0.09, 0.2, toonMat('#c8663a'), -0.7, 1.32, -2.25, 12); void pot;
  const plant = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), toonMat('#5a9a4a')); plant.position.set(-0.7, 1.5, -2.25); root.add(plant);
  const lampL = new THREE.PointLight(0xffd9a8, 4, 7, 2); lampL.position.set(0.5, 2.6, 0.6); root.add(lampL);
  const table = makeTable(); root.add(table.g);
  const mug = new THREE.Group(); root.add(mug); cyl(mug, 0.06, 0.06, 0.11, toonMat('#e0533f'), 0, 0.055, 0, 16);
  const hnd = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 12), toonMat('#e0533f')); hnd.position.set(0.07, 0.06, 0); mug.add(hnd);
  const saw = makeSaw(); root.add(saw);
  const chair = new THREE.Group(); chair.position.set(0.9, 0, -0.9); root.add(chair); box(chair, 0.42, 0.05, 0.42, toonMat('#b07a48'), 0, 0.45, 0); box(chair, 0.42, 0.5, 0.05, toonMat('#b07a48'), 0, 0.72, -0.2);
  for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box(chair, 0.04, 0.45, 0.04, toonMat('#b07a48'), x, 0.22, z);
  const sawdust = makePuffs(root, 16);
  const arm = makeStickArm(root);
  return { table, mug, saw, sawdust, arm };
}

// ---------------------------------------------------------------- shots
export function makeShots(W) {
  const { T, P } = W;
  const R = W.roots.piazza, RS = W.roots.section, RK = W.roots.kitchen;
  let CAM = null, SUN = W.sun.s;
  /** the frame's camera + the place's sun (toons take their lit side from it) */
  const ctx = (camera, sun) => { CAM = camera; SUN = sun; };
  /** pose a toon (face the camera with the place's sun first, then draw the state) */
  function put(root, key, i, x, z, st = {}, y = 0) {
    const tt = W.toon(root, key, i); tt.root.visible = true; tt.root.position.set(x, y, z); tt.root.updateMatrixWorld(true);
    tt.face(CAM, SUN); tt.set({ blink: lidAt(st.tb ?? 0, i * 7 + key.length), ...CAST[key].x, ...st, tb: undefined });
    tt.blob.visible = true; tt.blob.position.set(x, y + 0.01, z); return tt;
  }
  const P0 = (key, i, x, z, st, y) => put(R, key, i, x, z, st, y);
  const show = (...os) => os.forEach((o) => { o.visible = true; });
  const towerSink = (deg) => 8.4 * Math.sin((deg * PI) / 180);
  /** piazza era: tower storeys + lean, which props stand */
  function era(e, { lean = 5.5, storeys = 7, sink = 0 } = {}) {
    T.setStoreys(storeys); T.setLean(lean); T.setSink(towerSink(lean) + sink); T.g.updateMatrixWorld(true);
    const modern = e === '1990' || e === '1999' || e === 'today';
    P.stalls.forEach((s) => { s.visible = e === 'today' || e === '1999'; });
    if (e === '1999' || e === '1993') { show(W.lead.g); }
    if (e === '1999') { show(W.aframes[0], W.aframes[1]); W.cables.forEach((c, k) => { show(c.c); const a = T.lean.localToWorld(new THREE.Vector3(-TOWER.Rc - 0.3, 24.5, k ? 2.5 : -2.5)); c.set([a.x, a.y, a.z], [-70, 16, k ? 7 : -7]); }); }
    W.flood.forEach((l) => { l.intensity = 0; }); void modern;
  }
  const towerTop = () => T.lean.localToWorld(new THREE.Vector3(0, TOWER.H, 0));
  const twr = (x, y, z) => T.lean.localToWorld(new THREE.Vector3(x, y, z));
  /** small shake offset for a camera (amp m, decaying after t0) */
  const shake = (t, t0, amp, dur = 0.8) => { const u = (t - t0) / dur; if (u < 0 || u > 1) return [0, 0, 0]; const k = amp * (1 - u) ** 2; return [Math.sin(t * 61) * k, Math.sin(t * 47 + 1) * k, Math.sin(t * 53 + 2) * k]; };
  const addv = (a, b) => a.map((v, i) => v + b[i]);
  const lurch = (t, t0, base, amp) => base + amp * (t < t0 ? 0 : 1 - Math.exp(-(t - t0) * 6) * Math.cos((t - t0) * 18));   // springy settle to base + amp
  const label = (s, pos, h, t, t0, dur = 99) => { const u = clamp((t - t0) / 0.25) * clamp((t0 + dur - t) / 0.25); if (u <= 0) return; s.visible = true; s.position.copy(pos); s.scale.set(h * s.userData.aspect, h, 1); s.material.opacity = u; };
  const bucketAt = (b, x, y, z, full = 1, s = 1, mat = null) => { b.dirt.material = mat || mats().dirt; b.g.visible = true; b.g.position.set(x, y, z); b.g.scale.setScalar(s); b.dirt.visible = full > 0.02; b.dirt.scale.set(1, 0.45 * full + 0.01, 1); };
  const ENG = (k, x, z, st) => P0(k % 2 ? 'eng2' : 'eng', Math.floor(k / 2), x, z, st);
  const rigW = (x, y, z) => W.rig.g.localToWorld(new THREE.Vector3(x, y, z));
  const hand = (tt, u, v) => { tt.root.updateMatrixWorld(true); return cardPoint(tt, u, v); };

  // ======== piazza cameras + positions ========
  // h1: frame 0 at the north foot of the tower: the rig drilling, an engineer hauling a bucket of dirt, the tower overhead
  const cH1 = (t) => { const u = easeOut(t / 1.4); return { p: [lerp(-25.7, -24.9, u), 0.5, lerp(17.2, 16.4, u)], a: [-7, 8.5, -1], fov: 56 }; };
  // h2: close on the auger casing spitting dirt into a bucket
  const cH2 = (t) => { const u = easeOut((t - 1.22) / 1.3); return { p: rigW(lerp(3.3, 3.05, u), 1.05, lerp(2.9, 2.6, u)).toArray(), a: rigW(1.75, 0.42, 0.35).toArray(), fov: 42 }; };
  // h3: pull back: the whole tower leaning over the tiny crew, safeguard cables, tourists at the barrier
  const cH3 = (t) => { const u = easeOut((t - 2.63) / 2.4); return { p: [lerp(-14, -24, u), lerp(1.8, 2.4, u), lerp(42, 82, u)], a: [lerp(-4, 0, u), lerp(16, 25, u), 0], fov: 52 }; };
  // s2: under the overhang on the low side, looking up
  const cS2 = (t) => ({ p: [lerp(19, 18.4, (t - 7.13) / 1.8), 1.3, lerp(15.5, 14.8, (t - 7.13) / 1.8)], a: [5, 30, -2], fov: 56 });
  // m1: 1178, the half-built stump in scaffolding
  const cM1 = (t) => ({ p: [lerp(-5.6, -5, smooth((t - 8.9) / 1.9)), 1.0, lerp(27.5, 26, smooth((t - 8.9) / 1.9))], a: [0, 5, 0], fov: 50 });
  // w1: soldiers march past the abandoned stump
  const cW1 = { p: [-1.5, 1.2, 33], a: [0, 5, 0], fov: 50 };
  // c1 / c2: 1934, the grout pump at the foot of the tower; the lurch from wider
  const cC1 = (t) => ({ p: [lerp(18.9, 18.4, smooth((t - 16.9) / 3)), 1.0, lerp(19.6, 18.9, smooth((t - 16.9) / 3))], a: [11, 2.8, 6.5], fov: 48 });
  const c34 = cC1(16.9), K34 = { w: along(c34, 6, -0.7), pump: along(c34, 7.6, 0.4), w2: along(c34, 8.4, 1.4), boss: along(c34, 9.6, -1.7), mixer: along(c34, 10.8, 2.5) };
  const cC2 = { p: [8, 2.0, 66], a: [2, 25, 0], fov: 52 };
  // d1: 1990, a plumb line from the top shows the overhang; d2: the gate is chained shut
  const cD1 = (t) => ({ p: [lerp(2, 3, smooth((t - 21.2) / 2.4)), 2.2, lerp(86, 80, smooth((t - 21.2) / 2.4))], a: [3, 27, 0], fov: 46 });
  const cD2 = { p: [3.6, 1.55, 22.5], a: [-0.6, 2.2, 13.5], fov: 44 };
  // l1: 1993, a crane lowers lead ingots onto the north side
  const cL1 = (t) => ({ p: [lerp(-15.5, -15, smooth((t - 24.6) / 2.7)), 1.0, lerp(22, 21, smooth((t - 24.6) / 2.7))], a: [-13, 5.5, 0], fov: 52 });
  // f1 / f2: 1995 at night, liquid-nitrogen tanks freeze the ground; the lurch
  const cF1 = (t) => ({ p: [lerp(-27.5, -26.5, smooth((t - 27.3) / 3.4)), 1.6, lerp(12.5, 11.8, smooth((t - 27.3) / 3.4))], a: [-14, 3.2, -1], fov: 50 });
  const cF2 = (t) => ({ p: [lerp(13.3, 12.9, smooth((t - 30.75) / 2.9)), 0.6, lerp(39.5, 38.3, smooth((t - 30.75) / 2.9))], a: [1, 14, 0], fov: 52 });
  // y1 / y2: the mayor at the microphones; the plumber
  const MAY = [7.5, 23];
  // no still cameras: freezedetect found 0.5 s holds in every static shot (QC pass after the first full render)
  const cY1 = (t) => { const u = clamp((t - 33.6) / 1.5); return { p: [MAY[0] + lerp(1.0, 0.8, u), 1.5, MAY[1] + lerp(3.3, 2.85, u)], a: [MAY[0] - 0.1, 1.42, MAY[1]], fov: 40 }; };
  const cY2 = (t) => ({ p: [lerp(6.4, 6.8, smooth((t - 34.95) / 2)), -0.4, lerp(8.8, 8.5, smooth((t - 34.95) / 2))], a: [9.7, -0.5, 2.9], fov: 50 });   // inside the catino, along the ring
  // t1: locals throw tomatoes at the committee's parked cars
  const CARZ = 22.5, cT1 = (t) => ({ p: [lerp(-29.2, -29.8, smooth((t - 37.06) / 2.3)), 1.4, lerp(32, 31.3, smooth((t - 37.06) / 2.3))], a: [-38.5, 1.2, CARZ], fov: 54 });
  // q1: golden hour, the committee looks up at the tower
  const cQ1 = (t) => ({ p: [lerp(15, 14.2, smooth((t - 39.45) / 3)), 1.0, lerp(28, 26.5, smooth((t - 39.45) / 3))], a: [2, 5.5, 0], fov: 52 });
  // n1 / n2: the dirt heap; the top swings back
  const cN1 = (t) => ({ p: [lerp(-29.6, -29, smooth((t - 51.9) / 1.6)), 1.1, lerp(17.6, 17, smooth((t - 51.9) / 1.6))], a: [-17, 4, 2], fov: 50 });
  const cN2 = (t) => { const u = clamp((t - 53.42) / 2.7); return { p: [lerp(16.6, 15.4, u), 50.5, lerp(31.6, 28.6, u)], a: [4.5, 53, 0], fov: 40 }; };
  // p1 / p2 / b1 / e1
  const cP1 = (t) => ({ p: [lerp(-27, -26.4, smooth((t - 55.67) / 2.2)), 1.0, lerp(16, 15.4, smooth((t - 55.67) / 2.2))], a: [-14, 3, 2], fov: 52 });
  const cP2 = (t) => { const u = clamp((t - 57.9) / 1.35); return { p: [lerp(6.7, 6.4, u), 1.2, lerp(37.8, 37.0, u)], a: [3.0, 6.0, 0], fov: 48 }; };
  const BRD = [15, 33];
  const cB1 = (t) => ({ p: [BRD[0] + lerp(1.9, 1.6, smooth((t - 58.83) / 2)), 1.6, BRD[1] + lerp(4.8, 4.4, smooth((t - 58.83) / 2))], a: [BRD[0] + 0.25, 1.55, BRD[1]], fov: 46 });
  const cE1 = (t) => ({ p: [lerp(27.2, 27.6, smooth((t - 60.98) / 2.6)), 0.35, lerp(70.5, 71.6, smooth((t - 60.98) / 2.6))], a: [5, 15, 0], fov: 50 });

  // ======== section cameras ========
  const cS1 = (t) => ({ p: [lerp(6, 5, smooth((t - 5.46) / 1.7)), 8, lerp(76, 72, smooth((t - 5.46) / 1.7))], a: [3, 18, 0], fov: 50 });
  const cM2 = (t) => ({ p: [0.5, -3, lerp(48, 45, smooth((t - 10.72) / 2.3))], a: [0.5, -6, 0], fov: 48 });
  const cW2 = { p: [0, -6, 36], a: [0, -8, 0], fov: 48 };
  const cR1 = (t) => ({ p: [lerp(7, 6, smooth((t - 42.5) / 3.3)), -1.5, lerp(30, 27, smooth((t - 42.5) / 3.3))], a: [6, -2.5, 0], fov: 46 });
  // a slow drift on the section (no still start), then a softer push down to the bucket (was 13 m in 1.4 s)
  const r2u = (t) => smooth((t - 47.0) / 1.8);
  const cR2 = (t) => { const d = clamp((t - 45.87) / 1.43), u = r2u(t); return { p: [lerp(lerp(-7, -8.6, d), -21.5, u), lerp(-1.5, 1.6, u), lerp(lerp(33, 31.5, d), 8.5, u)], a: [lerp(-9, -24.5, u), lerp(-2, 0.9, u), lerp(0, 0.6, u)], fov: lerp(48, 44, u) }; };

  const day = { mood: 'day', fog: [140, 1000] };
  const shots = {
    h1: { ...day, set: 'piazza', cam: cH1, focus: (t) => { const e = along(cH1(0), 3.6, -0.45); return [e.x, 1.2, e.z]; }, cInf: 12, slab: 3, sun: [-12, 6, 24], az: 120, el: 38,
      update(t) {
        era('1999', { lean: 5.5 });
        show(W.rig.g); W.rig.auger(t);
        const c = cH1(0), e = along(c, 3.6, -0.45), e2 = along(c, 11, 1.8);
        const tt = ENG(0, e.x, e.z, { expr: 'stern', look: 0.4, arms: POSE.lift, tb: t });
        const hp = hand(tt, 470, 470); bucketAt(W.buckets[0], hp.x, hp.y - 0.44, hp.z + 0.04, 1);
        ENG(1, e2.x, e2.z, { expr: 'worried', look: -0.4, arms: POSE.point, tb: t });
        for (let i = 1; i < 5; i++) { const b = rigW(-0.9 + (i % 2) * 0.48, 0, 1.3 + i * 0.45); bucketAt(W.buckets[i], b.x, 0, b.z, 1); }
        const m = rigW(2.6, 0.3, 0);
        W.puffs.begin(); for (let k = 0; k < 3; k++) W.puffs.burst(t, -0.5 + k * 0.5, m.toArray(), { n: 3, size: 0.7, spread: 0.5, rise: 0.5, dur: 1.2, col: '#b08a62', seed: 2 + k }); W.puffs.end();
      } },
    h2: { ...day, set: 'piazza', cam: cH2, focus: () => rigW(1.9, 0.4, 0.5).toArray(), cInf: 30, slab: 0.8, sun: [-14, 6, 6], az: 130, el: 40,
      update(t) {
        era('1999', { lean: 5.5 }); show(W.rig.g); W.rig.auger(t);
        const b = rigW(1.5, 0, 0.85); bucketAt(W.buckets[0], b.x, 0, b.z, 0.25 + 0.75 * u01(t, 1.3, 2.5));
        const m = rigW(2.55, 0.25, 0.15);
        W.puffs.begin(); for (let k = 0; k < 6; k++) W.puffs.burst(t, 1.0 + k * 0.25, m.toArray(), { n: 2, size: 0.34, spread: 0.3, rise: 0.35, dur: 0.7, col: '#8a6440', seed: 10 + k }); W.puffs.end();
      } },
    h3: { ...day, set: 'piazza', cam: cH3, focus: (t) => [0, 18, 0], cInf: 6, slab: 30, sun: [-6, 4, 40], az: 120, el: 38,
      update(t) {
        era('1999', { lean: 5.5 }); show(W.rig.g); W.rig.auger(t);
        ENG(0, -14.2, 7.2, { expr: 'stern', arms: POSE.hold, tb: t }); ENG(1, -18.2, 7.8, { expr: 'worried', arms: POSE.point, tb: t });
        for (let i = 0; i < 4; i++) { const b = W.barriers[i]; b.visible = true; b.position.set(-10 + i * 2.7, 0, 24); }
        const tours = [['tour', 0, -9.2, 25.5], ['tour2', 0, -6.4, 25.8], ['tour3', 0, -3.0, 25.3], ['local', 0, 0.4, 25.9]];
        tours.forEach(([k, i, x, z], j) => P0(k, i, x, z, { expr: j % 2 ? 'o' : 'worried', look: -0.3, tb: t + j }));
      } },
    s2: { ...day, set: 'piazza', cam: (t) => { const c = cS2(t); return { ...c, p: addv(c.p, shake(t, 8.1, 0.12, 0.9)) }; }, focus: () => [6, 14, 0], cInf: 4, slab: 30, sun: [8, 2, 30], az: 150, el: 40,
      update(t) {
        const k = smooth(u01(t, 7.5, 8.9));
        era('today', { lean: 5.5 + 0.9 * k });
        W.puffs.begin(); for (let i = 0; i < 4; i++) W.puffs.burst(t, 8.1 + i * 0.12, [9 + i * 0.6, 0.3, 3 - i * 0.7], { n: 3, size: 1.4, spread: 1.4, rise: 0.8, dur: 1.4, seed: 30 + i }); W.puffs.end();
      } },
    m1: { ...day, set: 'piazza', cam: cM1, focus: () => { const e = along(cM1(8.9), 7.5, 0); return [e.x, 1.4, e.z]; }, cInf: 8, slab: 6, sun: [-2, 14, 18], az: 125, el: 36,
      update(t) {
        const k = smooth(u01(t, 9.3, 10.6));
        era('1178', { lean: 0.15 + 0.35 * k, storeys: 2.25, sink: 0.6 * k });
        show(W.scaffold, W.tread.g); W.tread.wheel.rotation.z = -t * 0.8;
        const c = cM1(8.9), a = along(c, 6.8, -1.05), b = along(c, 9.2, 1.3), d = along(c, 12.5, 0.2);
        [[a, -0.7, 0.4], [b, 0.8, 0.3], [d, -1.4, -0.5], [d, 1.6, 0.2], [b, -1.2, 1.5]].forEach(([q, dx, dz], i) => { const s = W.stones[i]; s.visible = true; s.position.set(q.x + dx, 0, q.z + dz); s.rotation.y = i * 0.7; });
        P0('mason', 0, a.x, a.z, { expr: 'worried', look: 0.5, arms: POSE.both, tb: t });
        P0('mason2', 0, b.x, b.z, { expr: 'o', look: -0.4, arms: POSE.head, tb: t + 1 });
        P0('mason', 1, d.x, d.z, { expr: 'stern', arms: POSE.hold, tb: t + 2 });
      } },
    w1: { ...day, set: 'piazza', cam: cW1, focus: () => [0, 1.5, 17.5], cInf: 6, slab: 10, sun: [0, 12, 24], az: 115, el: 36,
      update(t) {
        era('1178', { lean: 0.5, storeys: 2.25, sink: 0.6 }); show(W.scaffold, W.tread.g);
        const X = (k) => -6.5 + (t - 13.0) * 2.2 + k * 1.7;
        for (let k = 0; k < 4; k++) P0('soldier', k, X(k), 17.5 + (k % 2) * 0.6, { expr: 'stern', walk: (t * 2.6 + k * 0.5) % 1, arms: k % 2 ? POSE.down : POSE.hold, tb: t + k });
        W.banners.forEach((b, k) => { b.g.visible = true; const tt = W.toon(R, 'soldier', k * 2 + 1); b.g.position.set(tt.root.position.x + 0.35, 0.35, tt.root.position.z + 0.15); b.flag.rotation.y = Math.sin(t * 4 + k) * 0.25; });
        const lv = u01(t, 13.3, 15.4);
        P0('mason', 0, -1.6 - lv * 5, 22.5 + lv * 2, { expr: 'worried', look: -0.6, walk: (t * 2.2) % 1, tb: t });
        P0('mason2', 0, 1.6 + lv * 5, 23 + lv * 1, { expr: 'o', look: 0.6, walk: (t * 2.2 + 0.4) % 1, tb: t + 2 });
        [[-3, 14], [2.5, 13.6], [4.6, 14.6]].forEach(([x, z], i) => { const s = W.stones[i]; s.visible = true; s.position.set(x, 0, z); s.rotation.y = i * 0.7; });
      } },
    c1: { ...day, set: 'piazza', cam: cC1, focus: () => [K34.w.x, 1.4, K34.w.z], cInf: 12, slab: 5, sun: [12, 10, 14], az: 130, el: 38,
      update(t) {
        era('1934', { lean: 5.2 });
        show(W.pump.g, W.mixer.g, W.hose34); W.pump.g.position.copy(K34.pump); W.pump.g.rotation.y = 2.4; W.pump.lever.rotation.z = Math.sin(t * 5) * 0.35;
        W.mixer.g.position.copy(K34.mixer); W.mixer.g.rotation.y = 1.2; W.mixer.drum.rotation.y = t * 3;
        aimRod(W.hose34, [K34.pump.x - 0.3, 0.6, K34.pump.z - 0.2], [9.4, PIAZZA.catinoY + 0.2, 4.6]);
        P0('w34', 0, K34.w.x, K34.w.z, { expr: 'stern', arms: POSE.push, tb: t });
        P0('w34b', 0, K34.w2.x, K34.w2.z, { expr: 'grin', arms: POSE.hold, tb: t + 1 });
        P0('boss34', 0, K34.boss.x, K34.boss.z, { expr: 'smug', arms: POSE.pointL, tb: t + 2 });
        bucketAt(W.buckets[13], K34.w2.x + 0.6, 0, K34.w2.z + 0.3, 1, 1, mats().cement);
      } },
    c2: { ...day, set: 'piazza', cam: (t) => ({ ...cC2, p: addv(cC2.p, shake(t, 20.11, 0.25, 0.9)) }), focus: () => [2, 18, 0], cInf: 6, slab: 30, sun: [4, 4, 34], az: 125, el: 38,
      update(t) {
        era('1934', { lean: lurch(t, 20.11, 5.2, 0.35) + 0.9 * Math.exp(-Math.max(0, t - 20.11) * 3) * (t > 20.11 ? Math.sin((t - 20.11) * 9) : 0) });
        show(W.pump.g, W.mixer.g); W.pump.g.position.copy(K34.pump); W.mixer.g.position.copy(K34.mixer);
        P0('w34', 0, K34.w.x, K34.w.z, { expr: 'o', arms: POSE.head, tb: t }); P0('w34b', 0, K34.w2.x, K34.w2.z, { expr: 'o', arms: POSE.head, tb: t + 1 }); P0('boss34', 0, K34.boss.x, K34.boss.z, { expr: 'o', arms: POSE.down, tb: t + 2 });
        W.puffs.begin(); for (let i = 0; i < 6; i++) W.puffs.burst(t, 20.11 + i * 0.05, twr(8 + (i % 3), 0.2, -6 + i * 2.2).toArray(), { n: 3, size: 2.4, spread: 2.2, rise: 1.0, dur: 1.4, seed: 50 + i }); W.puffs.end();
      } },
    d1: { ...day, set: 'piazza', cam: cD1, focus: () => [3, 26, 0], cInf: 5, slab: 40, sun: [2, 2, 40], az: 120, el: 34,
      update(t) {
        era('1990', { lean: 5.5 });
        const top = twr(TOWER.Rbell + 0.5, TOWER.H - 0.4, 0), drop = u01(t, 21.3, 22.4), y = lerp(top.y, 0.4, smooth(drop));
        show(W.plumb, W.bob); aimRod(W.plumb, [top.x, top.y, top.z + 0.4], [top.x, y + 0.7, top.z + 0.4]); W.bob.position.set(top.x, y + 0.35, top.z + 0.4);
        label(W.labels.deg, atScreen(cD1(t), 0.76, 0.3, 40), 3.6, t, nt('n06_1990', 4) - 0.1);
      } },
    d2: { ...day, set: 'piazza', cam: cD2, focus: () => [0, 1.4, 14], cInf: 22, slab: 3, sun: [0, 14, 10], az: 130, el: 40,
      update(t) {
        era('1990', { lean: 5.5 });
        for (let i = 0; i < 3; i++) { const b = W.barriers[i]; b.visible = true; b.position.set(-4.4 + i * 2.75, 0, 13.6); }
        show(W.chiuso.g); W.chiuso.g.position.set(1.1, 0, 13.9); W.chiuso.g.rotation.y = 0.3;
        P0('guard', 0, -1.2, 13.0, { expr: 'stern', arms: POSE.clasp, tb: t });
        P0('tour', 0, -2.2, 16.6, { expr: 'worried', look: -0.3, arms: POSE.shrug, tb: t + 1 });
        P0('tour2', 0, 0.6, 17.4, { expr: 'o', look: -0.5, walk: (t * 1.5) % 1, tb: t + 2 });
      } },
    l1: { ...day, set: 'piazza', cam: cL1, focus: () => [-12, 3, 4], cInf: 10, slab: 8, sun: [-12, 4, 18], az: 120, el: 40,
      update(t) {
        era('1993', { lean: 5.5 });
        const per = 0.9, k = Math.floor((t - 24.6) / per), n = Math.min(92, 46 + k * 8); W.lead.setCount(n);
        show(W.crane.g, W.ingot); W.crane.g.position.set(-21.6, 0, 1.0); W.crane.g.rotation.y = 0; W.crane.boom.rotation.z = 0.62;
        R.updateMatrixWorld(true); const tip = W.crane.tip.getWorldPosition(new THREE.Vector3()); R.worldToLocal(tip);
        const topY = 1.35 + Math.floor(n / 16) * 0.47, y = lerp(tip.y - 1.2, topY, smooth(((t - 24.6) % per) / per));
        W.ingot.position.set(tip.x, y, tip.z); W.ingot.rotation.y = PI / 2;
        aimRod(W.crane.line, [tip.x, tip.y, tip.z], [tip.x, y + 0.25, tip.z]); W.crane.line.visible = true;
        const c = cL1(24.6), a = along(c, 5, -1.25), b = along(c, 7.6, 1.15);
        ENG(0, a.x, a.z, { expr: 'stern', arms: POSE.point, look: 0.3, tb: t }); ENG(1, b.x, b.z, { expr: 'grin', arms: POSE.cheer, tb: t + 1 });
      } },
    f1: { mood: 'night', fog: [90, 700], set: 'piazza', cam: cF1, focus: () => [-14, 2, 0], cInf: 9, slab: 8, sun: [-12, 0, 18], az: 60, el: 30,
      update(t) {
        era('1993', { lean: 5.5 }); W.flood.forEach((l) => { l.intensity = 240; }); W.glows.forEach((g) => { g.visible = true; });
        const fr = smooth(u01(t, 27.3, 30.6));
        [[-15.5, -3.5], [-16.8, 0.8], [-15.2, 5.0]].forEach(([x, z], i) => {
          W.tanks[i].visible = true; W.tanks[i].position.set(x - 4, 0, z); show(W.hoses[i]); aimRod(W.hoses[i], [x - 3.3, 1.2, z], [x + 2.5, 0.08, z * 0.6]);
          const f = W.frost[i]; f.visible = true; f.position.set(x + 2.6, 0.06 + i * 0.002, z * 0.6); f.scale.setScalar(0.4 + 3.4 * fr);
        });
        W.puffs.begin(); for (let k = 0; k < 9; k++) { const te = 27.0 + k * 0.42; W.puffs.burst(t, te, [-13 + (k % 3) * 0.9, 0.3, -3 + (k % 3) * 4], { n: 3, size: 1.3, spread: 1.0, rise: 1.3, dur: 1.6, col: '#eef6fb', seed: 70 + k, opacity: 0.9 }); } W.puffs.end();
        ENG(0, -21.6, 7.4, { expr: 'stern', arms: POSE.hold, tb: t }); ENG(1, -20.1, 9.3, { expr: 'worried', arms: POSE.clasp, tb: t + 1 });
      } },
    f2: { mood: 'night', fog: [120, 800], set: 'piazza', cam: (t) => { const c = cF2(t); return { ...c, p: addv(c.p, shake(t, nt('n09_night', 4), 0.2, 1.0)) }; }, focus: () => { const e = along(cF2(33.7), 3.7, 0); return [e.x, 1.4, e.z]; }, cInf: 3, slab: 2, sun: [0, 0, 36], az: 40, el: 35,
      update(t) {
        const t0 = nt('n09_night', 4);
        era('1993', { lean: lurch(t, t0, 5.5, 0.15) + (t > t0 ? 0.8 * Math.exp(-(t - t0) * 3) * Math.sin((t - t0) * 10) : 0) }); W.flood.forEach((l) => { l.intensity = 240; }); W.glows.forEach((g) => { g.visible = true; });
        for (let i = 0; i < 3; i++) { W.tanks[i].visible = true; W.tanks[i].position.set(-19.5, 0, -3.5 + i * 4.2); W.frost[i].visible = true; W.frost[i].position.set(-13, 0.06, -2 + i * 2.5); W.frost[i].scale.setScalar(3.8); }
        const c = cF2(33.7), a = along(c, 3.4, -0.95), b = along(c, 4.0, 1.0);
        const sc = t > t0 + 0.1;
        ENG(0, a.x, a.z, { expr: sc ? 'o' : 'neutral', arms: sc ? POSE.head : POSE.hold, look: 0.3, tb: t }); ENG(1, b.x, b.z, { expr: sc ? 'o' : 'stern', arms: sc ? POSE.point : POSE.clasp, look: -0.3, tb: t + 1 });
        W.puffs.begin(); if (t > t0) for (let i = 0; i < 5; i++) W.puffs.burst(t, t0 + i * 0.06, twr(8.5, 0.3, -5 + i * 2.5).toArray(), { n: 3, size: 2.2, spread: 2.0, rise: 1.0, dur: 1.5, col: '#c9d4ea', seed: 90 + i }); W.puffs.end();
      } },
    y1: { ...day, set: 'piazza', cam: cY1, focus: () => [MAY[0], 1.6, MAY[1]], cInf: 24, slab: 1.2, sun: [MAY[0], MAY[1], 8], az: 135, el: 40,
      update(t) {
        era('1999', { lean: 5.5 });
        show(W.lectern); W.lectern.position.set(MAY[0] + 0.05, 0, MAY[1] + 0.55); W.lectern.rotation.y = 0.25;
        P0('mayor', 0, MAY[0], MAY[1], { expr: 'stern', arms: t > 34.2 ? POSE.pointL : POSE.clasp, tb: t });
      } },
    y2: { ...day, set: 'piazza', cam: cY2, focus: () => [9.7, -0.6, 2.9], cInf: 10, slab: 6, sun: [10, 4, 12], az: 140, el: 40,
      update(t) {
        era('1999', { lean: 5.5 });
        const pl = P0('plumber', 0, 9.7, 2.9, { expr: 'grin', arms: POSE.plunge, tb: t }, PIAZZA.catinoY);
        const g = hand(pl, 40, 380), wall = twr(TOWER.Rb + 0.05, 1.0 + 0.05 * Math.sin(t * 6), 2.4), d = wall.clone().sub(g);
        show(W.plunger); W.plunger.position.copy(g); W.plunger.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); W.plunger.scale.set(1, d.length() / 1.12, 1);
        P0('mayor', 0, 12.4, 0.5, { expr: 'smug', arms: POSE.pointL, look: -0.4, tb: t + 2 });
      } },
    t1: { ...day, set: 'piazza', cam: cT1, focus: () => [-38.5, 1.0, CARZ], cInf: 12, slab: 4, sun: [-38, 24, 10], az: 120, el: 42,
      update(t) {
        era('1999', { lean: 5.5 });
        W.cars.forEach((c, i) => { c.visible = true; c.position.set(-42.5 + i * 3.9, 0, CARZ); c.rotation.y = 0; });
        const throwers = [['local', -41.8, 26.6], ['local2', -38.0, 27.4], ['local3', -34.4, 26.5]];
        throwers.forEach(([k, x, z], j) => { const ph = ((t - 37.0 + j * 0.37) % 1.1) / 1.1; P0(k, 0, x, z, { expr: 'stern', arms: ph < 0.35 ? POSE.throwUp : POSE.throwOut, tb: t + j }); });
        W.tomatoes.forEach((s, i) => { const j = i % 3, t0 = 37.0 + j * 0.37 + Math.floor(i / 3) * 1.1 + 0.4, u = (t - t0) / 0.45; if (u < 0 || u > 1) return;
          const x0 = -41.8 + j * 3.75 + 0.3, x1 = -42.5 + j * 3.9 + (i % 2 ? 0.6 : -0.6); s.visible = true; s.position.set(lerp(x0, x1, u), 1.9 + 1.2 * Math.sin(u * PI) - 0.6 * u, lerp(26.4, CARZ + 0.85, u)); });
        W.splats.forEach((s, i) => { const j = i % 3, ts = 37.0 + j * 0.37 + Math.floor(i / 3) * 1.1 + 0.85; if (t < ts) return; s.visible = true; s.position.set(-42.5 + j * 3.9 + (i % 2 ? 0.6 : -0.6) + (i > 5 ? 0.3 : 0), 1.05 + (i % 3) * 0.12, CARZ + 0.82); s.scale.setScalar(Math.min(1, (t - ts) / 0.12) * (0.8 + (i % 2) * 0.3)); });
      } },
    q1: { mood: 'gold', fog: [90, 900], set: 'piazza', cam: cQ1, focus: () => { const e = along(cQ1(39.45), 5, 0.1); return [e.x, 1.4, e.z]; }, cInf: 7, slab: 6, sun: [6, 18, 30], az: 125, el: 12,
      update(t) {
        era('1999', { lean: 5.5 });
        const c = cQ1(42.5), spots = [[4.0, -1.0, 'eng'], [4.6, 0.12, 'burl'], [5.4, 1.15, 'eng2']];
        spots.forEach(([d, sd, k], j) => { const g = along(c, d, sd); P0(k, 0, g.x, g.z, { expr: j === 1 ? 'stern' : 'worried', look: j === 0 ? 0.4 : -0.3, arms: j === 1 ? POSE.hold : POSE.head, tb: t + j }); });
        const bl = W.toon(R, 'burl', 0), hp = hand(bl, 440, 600);
        show(W.shovel); W.shovel.position.set(hp.x, hp.y - 0.45, hp.z + 0.05); W.shovel.rotation.set(0, 0, 0.15);
        label(W.labels.q, cardPoint(bl, 300, -170, new THREE.Vector3()), 0.62, t, nt('n12_question', 1));
      } },
    n1: { ...day, set: 'piazza', cam: cN1, focus: () => { const e = along(cN1(51.9), 6, 0.6); return [e.x, 1.4, e.z]; }, cInf: 12, slab: 6, sun: [-20, 10, 18], az: 125, el: 40,
      update(t) {
        era('1999', { lean: 5.5 - 0.3 * u01(t, 51.9, 53.4) }); show(W.rig.g); W.rig.auger(t);
        const c = cN1(51.9), mo = along(c, 10, -2.4), bk = along(c, 7.5, 1.6);
        show(W.moundG); W.moundG.position.copy(mo); W.moundG.scale.setScalar(lerp(0.55, 1.2, smooth(u01(t, 51.9, 53.3))));
        const r = rightOf(c), f = new THREE.Vector3(c.a[0] - c.p[0], 0, c.a[2] - c.p[2]).normalize();
        for (let i = 0; i < 14; i++) { const q = bk.clone().addScaledVector(r, (i % 5) * 0.46).addScaledVector(f, Math.floor(i / 5) * 0.48); bucketAt(W.buckets[i], q.x, 0, q.z, 1); }
        const e = along(c, 5.2, 0.7), b = along(c, 6.4, -0.8);
        ENG(0, e.x, e.z, { expr: 'grin', arms: POSE.cheer, tb: t }); P0('burl', 0, b.x, b.z, { expr: 'smug', arms: POSE.clasp, tb: t + 1 });
      } },
    n2: { ...day, set: 'piazza', cam: cN2, focus: () => [4.5, 53, 0], cInf: 2, slab: 10, sun: [4, 0, 14], az: 125, el: 30,
      update(t) {
        const k = smooth(u01(t, 53.5, 55.2));
        era('1999', { lean: 5.5 - 0.5 * k });
        label(W.labels.cm, atScreen(cN2(t), 0.5, 0.2, 20), 1.9, t, nt('n16_numbers', 6));   // over plain sky, clear of the tower top
      } },
    p1: { ...day, set: 'piazza', cam: cP1, focus: () => { const e = along(cP1(55.67), 5.4, 0); return [e.x, 1.4, e.z]; }, cInf: 10, slab: 4, sun: [-18, 10, 20], az: 125, el: 40,
      update(t) {
        era('1999', { lean: 5.0 }); show(W.rig.g);
        const done = t > nt('n17_stop', 2), c = cP1(55.67), a = along(c, 5, -1.15), b = along(c, 5.6, 0.35), d = along(c, 6.6, 1.5);
        ENG(0, a.x, a.z, { expr: done ? 'grin' : 'stern', arms: done ? POSE.cheer : POSE.hold, tb: t });
        ENG(1, b.x, b.z, { expr: done ? 'grin' : 'neutral', arms: done ? POSE.cheer : POSE.clasp, tb: t + 1 });
        P0('burl', 0, d.x, d.z, { expr: done ? 'smug' : 'stern', arms: POSE.clasp, tb: t + 2 });
        for (let i = 0; i < 5; i++) { const q = rigW(-1.2 + (i % 3) * 0.5, 0, 1.4 + Math.floor(i / 3) * 0.5); bucketAt(W.buckets[i], q.x, 0, q.z, 1); }
      } },
    p2: { ...day, set: 'piazza', cam: cP2, focus: () => { const e = along(cP2(58.83), 3.2, -0.35); return [e.x, 1.4, e.z]; }, cInf: 8, slab: 2, sun: [4, 30, 10], az: 130, el: 38,
      update(t) {
        era('today', { lean: 5.0 });
        const sq = t < 58.4, e = along(cP2(58.83), 3.2, -0.35);
        P0('tour3', 0, e.x, e.z, { expr: sq ? 'stern' : 'neutral', arms: sq ? POSE.thumb : POSE.shrug, face: sq ? { eye: 'line' } : undefined, look: -0.3, tb: t });
      } },
    b1: { ...day, set: 'piazza', cam: cB1, focus: () => [BRD[0], 1.6, BRD[1]], cInf: 16, slab: 1.5, sun: [BRD[0], BRD[1], 8], az: 135, el: 40,
      update(t) {
        era('1990', { lean: 5.5 });
        show(W.board); W.board.position.set(BRD[0] - 0.45, 0, BRD[1] - 0.6); W.board.rotation.y = 0.32;
        P0('bookie', 0, BRD[0] + 1.0, BRD[1] + 0.75, { expr: 'smug', arms: POSE.pointL, look: -0.4, tb: t });
      } },
    e1: { ...day, set: 'piazza', cam: cE1, focus: () => { const c = cE1(60.98), P = twr(TOWER.Rcol + 0.2, 26, 0), [fx, fy] = toScreen(c, P), g = ground(c, fx, fy, 1.643); return [g.x, 1.5, g.z]; }, cInf: 3, slab: 60, sun: [20, 50, 30], az: 130, el: 42,
      update(t) {
        era('today', { lean: 5.0 });
        // forced perspective: the hero tourist's palm sits on the same screen point as the tower's low side, 20 m up
        const c = cE1(60.98), P = twr(TOWER.Rcol + 0.2, 26, 0), [fx, fy] = toScreen(c, P), palm = ground(c, fx + 0.01, fy, 1.643);
        const root = palm.clone().addScaledVector(rightOf(c), -0.418); root.y = 0;
        P0('tour', 0, root.x, root.z, { expr: 'grin', arms: POSE.palm, tb: t });
        const b = along(c, 9, -1.6), d = along(c, 11, 0.4);
        P0('tour2', 0, b.x, b.z, { expr: 'grin', arms: POSE.cheer, tb: t + 1 });
        P0('local3', 0, d.x, d.z, { expr: 'grin', arms: POSE.both, tb: t + 2 });
      } },
  };

  // ======== section shots ========
  const ST = W.S.tower;
  const sec = (lean, storeys = 7, sink = 0) => { ST.setStoreys(storeys); ST.setLean(lean); ST.setSink(towerSink(lean) + sink); ST.g.updateMatrixWorld(true); };
  const S = (o) => ({ ...day, set: 'section', ...o });
  Object.assign(shots, {
    s1: S({ cam: (t) => { const c = cS1(t); return { ...c, p: addv(c.p, shake(t, 6.4, 0.5, 1.2)) }; }, focus: () => [4, 6, 0], cInf: 4, slab: 40, sun: [0, 0, 40], az: 150, el: 35,
      update(t) {
        const ts = nt('n02_stakes', 2), k = smooth(u01(t, ts + 0.1, 8.9));
        sec(5.5 + 3.5 * k);
        const dig = u01(t, 5.6, ts + 0.25);
        show(W.spade); W.spade.position.set(lerp(15, 11.5, smooth(dig)), lerp(4, -3.2, smooth(dig)) + (t > ts + 0.25 ? 3 * smooth(u01(t, ts + 0.25, ts + 0.8)) : 0), 0.9); W.spade.rotation.z = lerp(-0.2, 0.5, smooth(dig));
        if (t > ts + 0.2) { show(W.scoop); W.scoop.position.set(10.6, -3.8, 0.06); W.scoop.scale.set(2.6 * smooth(u01(t, ts + 0.2, ts + 0.5)), 1.3, 1); }
        W.sPuffs.begin(); W.sPuffs.burst(t, ts + 0.2, [11, 0.5, 1], { n: 6, size: 2.6, spread: 2.4, rise: 1.6, dur: 1.4, col: '#8a6440', seed: 3 }); W.sPuffs.end();
      } }),
    m2: S({ cam: cM2, focus: () => [0, -2, 0], cInf: 20, slab: 6, sun: [0, 0, 24], az: 145, el: 40,
      update(t) {
        sec(0.5, 2.25, 0.6);
        const ta = nt('n03_1178', 8), tc = nt('n03_1178', 12);
        show(W.dimBar); aimRod(W.dimBar, [10.4, -0.7, 0.5], [10.4, -3.7, 0.5]);
        label(W.sLabels.m3, new THREE.Vector3(7.0, -2.2, 0.8), 2.0, t, ta);
        label(W.sLabels.clay, new THREE.Vector3(-2, -11.5, 0.8), 2.3, t, tc);
      } }),
    w2: S({ cam: cW2, focus: () => [0, -5, 0], cInf: 20, slab: 10, sun: [0, 0, 26], az: 145, el: 40,
      update(t) {
        sec(0.5, 2.25, 0.6 + 0.4 * smooth(u01(t, 15.4, 16.4)));
        const k = smooth(u01(t, 15.4, 16.6)); show(W.clayDark); W.clayDark.material.opacity = 0.32 * k;
        W.arrows.forEach((a, i) => { a.visible = true; a.position.set(-8 + i * 4, -9.5 - 2.2 * ((t * 0.9 + i * 0.2) % 1), 0.4); a.scale.setScalar(1.2); });
      } }),
    r1: S({ cam: (t) => { const c = cR1(t); return { ...c, p: addv(c.p, shake(t, nt('n13_reveal', 10), 0.25, 0.8)) }; }, focus: () => [7, -3, 0], cInf: 20, slab: 8, sun: [4, 0, 24], az: 145, el: 40,
      update(t) {
        const tt = nt('n13_reveal', 10);
        sec(lurch(t, tt, 5.5, 0) + (t > tt ? 0.6 * Math.exp(-(t - tt) * 3) * Math.sin((t - tt) * 11) : 0));
        show(W.redZone); W.redZone.material.opacity = 0.55 + 0.25 * smooth(u01(t, 43.0, 44.0));
        const inX = t < tt ? lerp(24, 10.4, smooth(u01(t, 42.9, tt))) : lerp(10.4, 26, smooth(u01(t, tt + 0.15, tt + 0.7)));
        show(W.drill); W.drill.position.set(inX, -4.0, 0.7);
      } }),
    r2: S({ cam: cR2, focus: (t) => { const u = r2u(t); return [lerp(-9, -24.5, u), lerp(-2, 0.9, u), lerp(0, 0.6, u)]; }, cInf: 20, slab: 8, sun: [-10, 0, 24], az: 140, el: 40,
      update(t) {
        sec(5.5 - 0.3 * smooth(u01(t, 46.6, 49.1)));
        W.augers.forEach((a, i) => { a.g.visible = true; a.g.position.set(-25.5 - i * 0.2, 0, 0.9 + i * 0.15); a.auger(t + i * 0.3); });
        W.S.cavities.forEach((c, i) => { const s = smooth(u01(t, 46.2 + i * 0.35, 46.8 + i * 0.35)); c.visible = s > 0; c.scale.set(1.8 * s, 0.8 * s, 1); });
        W.sBuckets.forEach((b, i) => bucketAt(b, -23.8 + i * 1.1, 0, 1.6, i === 0 ? u01(t, 47.6, 48.9) : 1, 2.2));
        W.sPuffs.begin(); for (let k = 0; k < 6; k++) W.sPuffs.burst(t, 47.4 + k * 0.25, [-24.2, 1.3, 1.6], { n: 2, size: 0.7, spread: 0.4, rise: 0.4, dur: 0.6, col: '#8a6440', seed: 20 + k }); W.sPuffs.end();
      } }),
  });

  // ======== the kitchen ========
  const KC = (t) => ({ p: [lerp(0.6, 0.5, smooth((t - 49.1) / 2.7)), 1.1, lerp(3.0, 2.8, smooth((t - 49.1) / 2.7))], a: [-0.3, 0.55, 0], fov: 46 });
  shots.k1 = { mood: 'interior', set: 'kitchen', cam: KC,
    focus: () => [0, 0.7, 0], cInf: 24, slab: 1.2, sun: [0, 0, 4], az: 150, el: 45,
    update(t) {
      const { table, mug, saw, sawdust } = W.K, ts = nt('n15_table', 6), tl = nt('n15_table', 9);
      const lv = smooth(u01(t, tl - 0.15, tl + 0.4)), th = 0.11 * (1 - lv);
      // the tilt group pivots at the +x feet: the -x (long) legs are trimmed
      table.g.position.set(0.62, 0, 0); table.tilt.position.set(-0.62, 0, 0); table.g.rotation.z = -th;
      table.legs.forEach((lg, i) => { lg.scale.y = i % 2 === 0 ? 1 + (1.24 * Math.sin(th)) / 0.72 : 1; });
      const slide = t < tl ? smooth(u01(t, 49.2, 50.6)) * 0.42 : 0.42;
      table.g.updateMatrixWorld(true); const mp = table.tilt.localToWorld(new THREE.Vector3(-0.3 + slide, 0.79, 0.05)); RK.worldToLocal(mp); mug.position.copy(mp); mug.rotation.z = -th;
      const shp = RK.localToWorld(new THREE.Vector3(-0.75, 0.55, 1.75));   // your arm, from the bottom-left corner of the frame
      const sawing = t > ts - 0.4 && t < tl, sx = sawing ? 0.07 * Math.sin(t * 22) : 0;
      saw.visible = true; saw.position.set(-0.62, 0.07, 0.74 + sx); saw.rotation.set(0, PI / 2, 0);   // blade runs back through the long front leg
      W.K.arm.set(shp, RK.localToWorld(new THREE.Vector3(-0.62, 0.05, 0.76 + sx)));
      sawdust.begin(); if (sawing) for (let k = 0; k < 4; k++) sawdust.burst(t, ts + k * 0.22, [-0.62, 0.05, 0.36], { n: 2, size: 0.07, spread: 0.08, rise: 0.04, dur: 0.5, col: '#e8c890', seed: k }); sawdust.end();
    } };
  return { shots, ctx };
}
