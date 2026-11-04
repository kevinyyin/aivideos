// SET (dh012): a sunny ITALIAN BEACH (a lido: rows of striped umbrellas + sunbeds, a pastel cliff town, a beach bar, a lifeguard
// boat, a wooden walkway) and, separately, a tropical REEF FLAT at low tide at sunset (wet rock, tide pools, corals).
//
// buildBeach — coordinates (m, y up): the shoreline runs along x at z = 0; sand for z > 0 (y 0), the sea for z < 0 (surface
// y ≈ −0.06). Umbrella grid x ∈ [−21, 21] every 3.5 m, rows at DIMS.rows (z). The open stretch x ∈ [27, 46] has no umbrellas
// (the festival goes there: `fest` group, stage at DIMS.stage facing −x… see below). The town climbs the hill at z 45–110.
//   umbrellas[i] = {pivot, canopy, x, z, row, col}: pivot at the pole's foot (rotate .x/.z to topple it); setOpen(i, k) folds it.
//   setTime(k): 0 noon → 1 sunset (sky, sun, fog, umbrellas you close yourself). aimSun(cx, cz, half) per shot. update(t) waves.
//   Own fog; camera.far ≥ 700.
// buildReef — the reef flat: rock shelf y 0 around the origin, sea beyond z < −14, tide pools at DIMS.reef.pools ([x, z, r]).
//   Sunset sky, sun low over −z. update(t). Own fog; far ≥ 700.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng, clamp, lerp } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';

const PI = Math.PI;
export const DIMS = {
  rows: [4.0, 7.6, 11.2, 14.8], cols: [-21, -17.5, -14, -10.5, -7, -3.5, 0, 3.5, 7, 10.5, 14, 17.5, 21],
  stage: [38, 9], bar: [-8, 22], boat: [8.5, 1.6],
  reef: { pools: [[0, 0, 1.25], [-2.6, -2.2, 0.9], [2.8, -3.0, 1.1], [-1.2, 3.4, 0.8], [3.4, 2.6, 0.7]] },
};

function stripes(c1, c2, n = 8) {
  return canvasTex(512, 64, (g, w, h) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? c2 : c1; g.fillRect((i * w) / n, 0, w / n + 1, h); } });
}
function sandTex(base = '#ecd6a6', seed = 4) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const R = rng(seed);
    for (let i = 0; i < 9000; i++) { const v = R(); g.fillStyle = v < 0.5 ? 'rgba(170,140,90,.18)' : 'rgba(255,248,226,.22)'; g.fillRect(R() * w, R() * h, 2, 2); }
    for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(180,150,100,.12)'; g.lineWidth = 3; g.beginPath(); const y = R() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 10, w * 0.6, y - 10, w, y + 5); g.stroke(); }
  }, [30, 30]);
}

export function buildBeach(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 21);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const fog = new THREE.Fog(0xe9e2d6, 140, 640);
  const sky = makeSkyDome(0x3f86d8, 0xe8f1f6, 600); root.add(sky.mesh);

  // sand (slopes under the water) + wet band
  const sandG = new THREE.PlaneGeometry(260, 140, 130, 70); sandG.rotateX(-PI / 2); sandG.translate(0, 0, 40);
  { const p = sandG.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setY(i, z < 0 ? z * 0.09 : 0.012 * Math.sin(p.getX(i) * 0.4) * Math.cos(z * 0.5)); } sandG.computeVertexNormals(); }
  const sand = mk(sandG, new THREE.MeshStandardMaterial({ map: sandTex(), roughness: 0.95 }), root); sand.castShadow = false;
  const wet = mk(new THREE.PlaneGeometry(260, 2.6), new THREE.MeshStandardMaterial({ color: 0xb9a070, roughness: 0.35, transparent: true, opacity: 0.55, depthWrite: false }), root, 0, 0.006, 1.1); wet.rotation.x = -PI / 2; wet.castShadow = false;
  // the sea: a gentle flat-shaded swell + a scrolling foam line at the shore
  const SEG = 90, seaG = new THREE.PlaneGeometry(900, 520, SEG, SEG); seaG.rotateX(-PI / 2); seaG.translate(0, 0, -258);
  const base = seaG.attributes.position.array.slice();
  const sea = mk(seaG, new THREE.MeshStandardMaterial({ color: 0x2f9ac4, roughness: 0.2, metalness: 0.1, flatShading: true, transparent: true, opacity: 0.93 }), root); sea.castShadow = false;
  const waveAt = (x, z, t) => { const fz = clamp(-z / 30); return -0.06 + fz * (0.18 * Math.sin(x * 0.11 + t * 0.9) + 0.12 * Math.sin(z * 0.17 - t * 1.2 + x * 0.05)) + 0.03 * Math.sin(z * 0.9 + t * 2.1); };
  const foamT = canvasTex(512, 64, (g, w, h) => { const RR = rng(7); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + RR() * 0.6})`; g.beginPath(); g.ellipse(RR() * w, h * (0.3 + RR() * 0.5), 4 + RR() * 14, 2 + RR() * 4, 0, 0, 7); g.fill(); } }, [16, 1]);
  const foam = mk(new THREE.PlaneGeometry(260, 1.2), new THREE.MeshBasicMaterial({ map: foamT, transparent: true, depthWrite: false, opacity: 0.85 }), root, 0, 0.02, -0.2); foam.rotation.x = -PI / 2; foam.castShadow = false;
  const glint = mk(new THREE.PlaneGeometry(40, 420), new THREE.MeshBasicMaterial({ map: canvasTex(64, 512, (g, w, h) => { const RR = rng(9); for (let i = 0; i < 700; i++) { const y = RR() * h; g.fillStyle = `rgba(255,250,230,${0.12 + RR() * 0.4})`; g.fillRect(w / 2 + (RR() - 0.5) * w * (0.2 + (y / h) ** 1.5), y, 2 + RR() * 3, 1); } }), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), root, -30, 0.25, -240);
  glint.rotation.x = -PI / 2; glint.castShadow = false;

  // umbrellas + sunbeds (rows alternate orange/white and blue/white, the lido look)
  const canTex = [stripes('#f08a3a', '#fbf6ea'), stripes('#2f7bd0', '#fbf6ea')];
  const poleM = mat(0xf4efe4, 0.5), bedM = [mat(0xf4efe4, 0.6), mat(0x2f7bd0, 0.6), mat(0xf08a3a, 0.6)], frameM = mat(0x9a9a98, 0.4, { metalness: 0.5 });
  const canGeo = new THREE.ConeGeometry(1.35, 0.55, 16, 1, true); canGeo.translate(0, -0.275, 0);
  const umbrellas = [];
  DIMS.rows.forEach((z, row) => DIMS.cols.forEach((x, col) => {
    const pivot = new THREE.Group(); pivot.position.set(x, 0, z); root.add(pivot);
    mk(new THREE.CylinderGeometry(0.03, 0.035, 2.45, 8), poleM, pivot, 0, 1.22, 0);
    const canopy = new THREE.Group(); canopy.position.y = 2.6; pivot.add(canopy);
    const cm = new THREE.MeshStandardMaterial({ map: canTex[row % 2], roughness: 0.75, side: THREE.DoubleSide });
    const cone = mk(canGeo, cm, canopy, 0, 0.27, 0); cone.castShadow = true;
    mk(new THREE.SphereGeometry(0.05, 8, 6), poleM, canopy, 0, 0.3, 0);
    // two sunbeds facing the sea (−z): frame + mattress + raised backrest
    for (const s of [-1, 1]) {
      const b = new THREE.Group(); b.position.set(x + s * 0.55, 0, z + 0.4); root.add(b);
      box(0.62, 0.05, 1.5, frameM, 0, 0.3, 0, b); box(0.58, 0.07, 1.25, bedM[(row + col + (s > 0 ? 1 : 0)) % 3], 0, 0.36, -0.1, b);
      const back = box(0.58, 0.07, 0.6, bedM[(row + col + (s > 0 ? 1 : 0)) % 3], 0, 0.55, 0.65, b); back.rotation.x = -0.75;
      for (const [lx, lz] of [[-0.27, -0.65], [0.27, -0.65], [-0.27, 0.65], [0.27, 0.65]]) box(0.03, 0.3, 0.03, frameM, lx, 0.15, lz, b);
      if (R() < 0.3) { const tw = box(0.5, 0.01, 0.9, mat([0xe2574c, 0xf2c14e, 0x58b368, 0xe58fa6][Math.floor(R() * 4)], 0.9), 0, 0.405, -0.1, b); tw.castShadow = false; }
    }
    umbrellas.push({ pivot, canopy, x, z, row, col });
  }));
  function setOpen(i, k) { const c = umbrellas[i].canopy; c.scale.set(lerp(0.16, 1, k), lerp(2.6, 1, k), lerp(0.16, 1, k)); }

  // walkway planks from the bar down to the shore (x 0) and along the back (z 18.5)
  const plankM = mat(0xb07a48, 0.8);
  for (let z = 2; z < 22; z += 0.5) box(1.3, 0.04, 0.42, plankM, 0, 0.02, z).castShadow = false;
  for (let x = -24; x < 24; x += 0.5) box(0.42, 0.04, 1.3, plankM, x, 0.02, 18.6).castShadow = false;
  // beach bar with a striped awning + sign
  const bar = new THREE.Group(); bar.position.set(DIMS.bar[0], 0, DIMS.bar[1]); root.add(bar);
  box(7, 3, 4, mat(0xf6efe0, 0.7), 0, 1.5, 0, bar); box(7.4, 0.3, 4.4, mat(0x2f7bd0, 0.5), 0, 3.15, 0, bar);
  const aw = mk(new THREE.PlaneGeometry(7.2, 1.6), new THREE.MeshStandardMaterial({ map: stripes('#2f7bd0', '#fbf6ea', 14), side: THREE.DoubleSide, roughness: 0.8 }), bar, 0, 2.55, -2.6); aw.rotation.x = -1.1;
  box(6, 1.1, 0.5, mat(0xd9c29a, 0.7), 0, 0.55, -2.4, bar);
  const sign = mk(new THREE.PlaneGeometry(4, 0.8), new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(512, 102, (g, w, h) => { g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f7bd0'; g.font = 'bold 66px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BAR · GELATI', w / 2, h / 2 + 3); }) }), bar, 0, 3.15, -2.22);
  void sign;
  for (let k = 0; k < 4; k++) { const st = new THREE.Group(); st.position.set(-2.2 + k * 1.45, 0, -3.6); bar.add(st); mk(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 14), mat(0xd2483f, 0.5), st, 0, 0.75, 0); mk(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 6), frameM, st, 0, 0.37, 0); }
  // the lifeguard boat (a red-and-white rowing catamaran) + its chair + a flag
  const boat = new THREE.Group(); boat.position.set(DIMS.boat[0], 0, DIMS.boat[1]); boat.rotation.y = 0.3; root.add(boat);
  for (const s of [-1, 1]) { const h = mk(new RoundedBoxGeometry(0.42, 0.42, 3.6, 2, 0.16), mat(0xd2483f, 0.5), boat, s * 0.65, 0.21, 0); void h; }
  box(1.7, 0.06, 1.4, mat(0xf4efe4, 0.6), 0, 0.5, 0, boat); box(0.8, 0.05, 0.4, mat(0xb07a48, 0.7), 0, 0.75, 0.2, boat);
  const lbl = mk(new THREE.PlaneGeometry(2.6, 0.32), new THREE.MeshStandardMaterial({ roughness: 0.6, transparent: true, map: canvasTex(512, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = 'bold 46px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SALVATAGGIO', w / 2, h / 2 + 2); }) }), boat, 0.88, 0.24, 0); lbl.rotation.y = PI / 2; lbl.castShadow = false;
  const flagPole = new THREE.Group(); flagPole.position.set(13, 0, 2.6); root.add(flagPole);
  mk(new THREE.CylinderGeometry(0.035, 0.04, 5, 8), poleM, flagPole, 0, 2.5, 0);
  const flag = mk(new THREE.PlaneGeometry(1.0, 0.6), mat(0xd2483f, 0.7, { side: THREE.DoubleSide }), flagPole, 0.5, 4.6, 0); void flag;
  // beach dressing: towels, balls, a sandcastle with a flag, buckets, a cooler
  for (let i = 0; i < 26; i++) { const x = -24 + R() * 48, z = 1.6 + R() * 1.6; if (Math.abs(x) < 1.2) continue; const tw = box(0.75, 0.012, 1.6, mat([0xe2574c, 0xf2c14e, 0x58b368, 0xe58fa6, 0x3d7bd9][i % 5], 0.9), x, 0.008, z + 0.3); tw.rotation.y = (R() - 0.5) * 0.4; tw.castShadow = false; }
  const balls = [];
  for (let i = 0; i < 5; i++) { const b = mk(new THREE.SphereGeometry(0.17, 16, 12), new THREE.MeshStandardMaterial({ map: stripes('#e2574c', '#fbf6ea', 6), roughness: 0.5 }), root, -18 + i * 9.3 + R() * 2, 0.17, 2.2 + R() * 2); balls.push(b); }
  const castle = new THREE.Group(); castle.position.set(-5.2, 0, 1.4); root.add(castle);
  const sandM = mat(0xd9bf88, 0.95);
  mk(new THREE.CylinderGeometry(0.5, 0.6, 0.35, 14), sandM, castle, 0, 0.17, 0); for (let k = 0; k < 4; k++) { const a = k * PI / 2 + 0.4; mk(new THREE.CylinderGeometry(0.13, 0.16, 0.4, 10), sandM, castle, Math.cos(a) * 0.42, 0.25, Math.sin(a) * 0.42); }
  mk(new THREE.CylinderGeometry(0.16, 0.2, 0.36, 12), sandM, castle, 0, 0.52, 0); mk(new THREE.ConeGeometry(0.17, 0.25, 12), sandM, castle, 0, 0.82, 0);
  mk(new THREE.CylinderGeometry(0.17, 0.12, 0.2, 12, 1, true), mat(0x3d7bd9, 0.5, { side: THREE.DoubleSide }), root, -4.4, 0.1, 1.9);
  box(0.55, 0.35, 0.35, mat(0x3d7bd9, 0.5), 5.5, 0.18, 4.9);

  // the town on the hill: pastel houses in terraces + a bell tower, a cliff headland with pines on the left (−x)
  const houseCols = [0xf2c27a, 0xe8907a, 0xf4e6c8, 0xd9a8c8, 0xa8c8d8, 0xf2b05a, 0xe2d080, 0xc96a5a, 0xf6f0e2];
  const winT = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a5a6a'; g.fillRect(14, 14, 14, 20); g.fillRect(38, 14, 14, 20); g.fillStyle = '#5a7a4a'; g.fillRect(10, 12, 4, 24); g.fillRect(28, 12, 4, 24); g.fillRect(34, 12, 4, 24); g.fillRect(52, 12, 4, 24); }, [1, 1]);
  const hGeo = new THREE.BoxGeometry(1, 1, 1), hMat = new THREE.MeshStandardMaterial({ map: winT, roughness: 0.85 });
  const houses = new THREE.InstancedMesh(hGeo, hMat, 260), roofs = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat(0xb8603a, 0.8), 260);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
  // the hill below is an ellipsoid; every house stands on its surface at the house's lowest front corner (v1.1: houses at fixed
  // heights sank into the hill and only their roofs poked out, floating)
  const hillY = (x, z) => { const u = (x / 2.2) ** 2 + (z - 115) ** 2; return u < 4900 ? -8 + 0.75 * Math.sqrt(4900 - u) : -8; };
  let hn = 0;
  for (let tier = 0; tier < 9; tier++) for (let k = 0; k < 30 && hn < 260; k++) {
    const x = -95 + k * 6.6 + R() * 3, z = 48 + tier * 7 + R() * 2, w = 5 + R() * 2, hh = 7 + R() * 6;
    const base = Math.max(0, Math.min(hillY(x - w / 2, z - 2.5), hillY(x + w / 2, z - 2.5)) - 0.4);
    if (R() < 0.12) continue;
    houses.setMatrixAt(hn, m4.compose(p3.set(x, base + hh / 2, z), q.identity(), s3.set(w, hh, 5)));
    houses.setColorAt(hn, new THREE.Color(houseCols[(tier * 7 + k * 3) % houseCols.length]));
    roofs.setMatrixAt(hn, m4.compose(p3.set(x, base + hh + 0.25, z), q.identity(), s3.set(w + 0.3, 0.5, 5.3))); hn++;
  }
  houses.count = roofs.count = hn; houses.castShadow = roofs.castShadow = false; root.add(houses, roofs);
  const hill = mk(new THREE.SphereGeometry(70, 24, 12, 0, PI * 2, 0, PI / 2), mat(0x7a8a4a, 0.95), root, 0, -8, 115); hill.scale.set(2.2, 0.75, 1); hill.castShadow = false;
  const tower = new THREE.Group(); tower.position.set(12, Math.min(hillY(10, 64), hillY(14, 64)) - 0.5, 66); root.add(tower);
  box(4, 26, 4, mat(0xf2d8a8, 0.8), 0, 13, 0, tower); mk(new THREE.ConeGeometry(3.2, 6, 4), mat(0x5a8a6a, 0.6), tower, 0, 29, 0).rotation.y = PI / 4;
  const cliff = mk(new THREE.DodecahedronGeometry(40, 1), mat(0x8a7a6a, 0.95), root, -140, -6, -10); cliff.scale.set(1.2, 0.9, 1.6); cliff.castShadow = false;
  const pineM = mat(0x3f6a3a, 0.9);
  for (let i = 0; i < 14; i++) { const x = -150 + R() * 40, z = -40 + R() * 70; mk(new THREE.SphereGeometry(5 + R() * 3, 10, 6), pineM, root, x, 24 + R() * 8, z).scale.y = 0.45; }
  // far sailboats
  const boats = [];
  for (let i = 0; i < 4; i++) { const b = new THREE.Group(); b.position.set(-80 + i * 55, 0, -120 - i * 30); root.add(b); box(4, 0.8, 1.4, mat(0xf6f4ee, 0.5), 0, 0.3, 0, b); const sl = mk(new THREE.ConeGeometry(2.0, 6, 3), mat(0xfbf8f0, 0.7), b, 0.4, 3.8, 0); sl.scale.z = 0.08; boats.push(b); }

  // festival dressing (hidden unless shown): a little stage facing −x? no — facing the camera side (+x looks −x)… a stage
  // whose front faces −x at DIMS.stage, bunting, a banner canvas (setBanner)
  const fest = new THREE.Group(); fest.visible = false; root.add(fest);
  const [sx, sz] = DIMS.stage;
  box(3.2, 0.6, 5, mat(0x2f7bd0, 0.6), sx + 2.2, 0.3, sz, fest);
  for (const dz of [-2.4, 2.4]) box(0.12, 4.5, 0.12, frameM, sx + 3.6, 2.25, sz + dz, fest);
  const banC = document.createElement('canvas'); banC.width = 1024; banC.height = 220; const banT = new THREE.CanvasTexture(banC); banT.colorSpace = THREE.SRGBColorSpace;
  const banner = mk(new THREE.PlaneGeometry(4.8, 1.03), new THREE.MeshStandardMaterial({ map: banT, roughness: 0.7, side: THREE.DoubleSide }), fest, sx + 3.55, 3.9, sz); banner.rotation.y = -PI / 2; banner.castShadow = false;
  function setBanner(text) {
    const g = banC.getContext('2d'); g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, 1024, 220); g.fillStyle = '#2f7bd0'; g.fillRect(0, 0, 1024, 24); g.fillRect(0, 196, 1024, 24);
    let fs = 130; g.font = `900 ${fs}px Arial Black, Helvetica, sans-serif`; while (g.measureText(text).width > 960 && fs > 20) { fs -= 4; g.font = `900 ${fs}px Arial Black, Helvetica, sans-serif`; }
    g.fillStyle = '#f08a3a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 512, 114); banT.needsUpdate = true;
  }
  setBanner(opts.banner ?? 'TRALALERO DAY');
  const flagCols = [0xe2574c, 0xf2c14e, 0x3d7bd9, 0x58b368, 0xf6f4ee];
  for (let k = 0; k < 2; k++) for (let i = 0; i < 18; i++) { const u = i / 17, x = sx - 6 + u * 9.6, z = sz + (k ? 4.5 : -4.5), y = 3.4 - 0.7 * Math.sin(u * PI); const f = mk(new THREE.ConeGeometry(0.16, 0.34, 3), mat(flagCols[i % 5], 0.7), fest, x, y, z); f.rotation.x = PI; f.castShadow = false; }

  // lights
  const hemi = new THREE.HemisphereLight(0xdff0ff, 0xc9b080, 1.25); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.7); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004;
  let SUN_DIR = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
  function aimSun(cx = 0, cz = 4, half = 14) {
    sun.target.position.set(cx, 0, cz); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 60);
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 5, far: 140 }); sun.shadow.camera.updateProjectionMatrix();
  }
  aimSun();
  const DAY = { top: new THREE.Color(0x3f86d8), bot: new THREE.Color(0xe8f1f6), sun: new THREE.Color(0xfff2dc), fog: new THREE.Color(0xe9e2d6), sea: new THREE.Color(0x2f9ac4) };
  const DUSK = { top: new THREE.Color(0x5a5aa8), bot: new THREE.Color(0xffa86a), sun: new THREE.Color(0xffa060), fog: new THREE.Color(0xf0b090), sea: new THREE.Color(0x4a6aa0) };
  const _c = new THREE.Color();
  function setTime(k) {
    sky.setColors(_c.copy(DAY.top).lerp(DUSK.top, k).getHex(), new THREE.Color().copy(DAY.bot).lerp(DUSK.bot, k).getHex());
    sun.color.copy(DAY.sun).lerp(DUSK.sun, k); sun.intensity = lerp(2.7, 2.4, k); hemi.intensity = lerp(1.25, 1.05, k);
    hemi.color.set(k > 0.5 ? 0xffd0b0 : 0xdff0ff); fog.color.copy(DAY.fog).lerp(DUSK.fog, k); sea.material.color.copy(DAY.sea).lerp(DUSK.sea, k);
    SUN_DIR = new THREE.Vector3(lerp(0.35, -0.75, k), lerp(0.8, 0.3, k), lerp(0.5, -0.45, k)).normalize(); aimSun(sun.target.position.x, sun.target.position.z, sun.shadow.camera.right);
    glint.position.x = lerp(-30, 60, k); glint.material.opacity = lerp(1, 1.6, k);
  }
  setTime(0);
  function update(t) {
    const p = seaG.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, waveAt(x, z, t)); }
    p.needsUpdate = true; seaG.computeVertexNormals();
    const s = Math.sin(t * 0.9); foam.position.z = -0.25 + 0.35 * s; foamT.offset.x = t * 0.01; foam.material.opacity = 0.55 + 0.3 * (0.5 + 0.5 * s);
    boats.forEach((b, i) => { b.rotation.z = 0.05 * Math.sin(t * 0.8 + i); b.position.y = 0.1 * Math.sin(t * 0.7 + i * 2); });
  }
  update(0);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D: DIMS, fog, sky, sea, sand, umbrellas, setOpen, fest, setBanner, balls, castle, boat, setTime, aimSun, update, waveAt, lights: { hemi, sun } };
}

// ---------------------------------------------------------------- the reef flat at low tide (Australia), sunset
export function buildReef(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 31), D = DIMS.reef;
  const fog = new THREE.Fog(0xf0b48a, 120, 600);
  const sky = makeSkyDome(0x6a5aa8, 0xffa060, 600); root.add(sky.mesh);
  // sun disc + glow low over −z
  const sunTex = canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.18, 'rgba(255,214,140,1)'); gr.addColorStop(0.32, 'rgba(255,170,90,.5)'); gr.addColorStop(1, 'rgba(255,140,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, depthWrite: false, fog: false, toneMapped: false })); sunDisc.position.set(-330, 34, -470); sunDisc.scale.setScalar(150); root.add(sunDisc);
  // rock shelf: a big displaced plane, dark wet rock with lighter patches
  const rockTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#8f8070'; g.fillRect(0, 0, w, h); const RR = rng(12); for (let i = 0; i < 2200; i++) { g.fillStyle = RR() < 0.5 ? 'rgba(40,34,30,.25)' : 'rgba(170,150,120,.2)'; g.beginPath(); g.arc(RR() * w, RR() * h, 2 + RR() * 9, 0, 7); g.fill(); } for (let i = 0; i < 120; i++) { g.fillStyle = 'rgba(70,110,70,.28)'; g.beginPath(); g.arc(RR() * w, RR() * h, 6 + RR() * 16, 0, 7); g.fill(); } }, [12, 12]);
  const shelfG = new THREE.PlaneGeometry(120, 60, 120, 60); shelfG.rotateX(-PI / 2); shelfG.translate(0, 0, 8);
  { const p = shelfG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); let y = 0.05 * Math.sin(x * 1.3) * Math.cos(z * 1.1) + 0.06 * Math.sin(x * 0.4 + z * 0.7); for (const [px, pz, pr] of D.pools) { const d = Math.hypot(x - px, z - pz); if (d < pr + 0.25) y -= 0.18 * clamp((pr + 0.25 - d) / 0.4); } if (z < -14) y -= (-14 - z) * 0.1; p.setY(i, y); } shelfG.computeVertexNormals(); }
  const shelf = mk(shelfG, new THREE.MeshStandardMaterial({ map: rockTex, roughness: 0.35, metalness: 0.05 }), root); shelf.castShadow = false;
  // tide pools: glassy turquoise discs with corals + a starfish inside
  const poolM = new THREE.MeshStandardMaterial({ color: 0x5ad0d0, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.6, depthWrite: false });
  const pools = D.pools.map(([x, z, r], i) => { const m = mk(new THREE.CircleGeometry(r, 28), poolM, root, x, -0.06, z); m.rotation.x = -PI / 2; m.castShadow = false; m.renderOrder = 2; return m; });
  const coralCols = [0xf26a7a, 0xf2a03a, 0xb86ad0, 0xf2d24a, 0x4fd2b0];
  for (const [x, z, r] of D.pools) for (let k = 0; k < 5; k++) { const a = R() * PI * 2, d = r * (0.3 + R() * 0.55); const c = mk(new THREE.SphereGeometry(0.07 + R() * 0.07, 10, 8), mat(coralCols[Math.floor(R() * 5)], 0.7), root, x + Math.cos(a) * d, -0.15, z + Math.sin(a) * d); c.scale.y = 1.4; }
  const star = new THREE.Group(); star.position.set(D.pools[0][0] + 0.6, -0.1, D.pools[0][1] - 0.4); root.add(star);
  for (let k = 0; k < 5; k++) { const arm = mk(new THREE.ConeGeometry(0.04, 0.16, 6), mat(0xf26a3a, 0.7), star, Math.cos(k * 1.2566) * 0.07, 0, Math.sin(k * 1.2566) * 0.07); arm.rotation.set(PI / 2, 0, -k * 1.2566 + PI / 2); }
  // scattered rocks + coral heads on the flat; a sandy beach + palms far behind (+z)
  for (let i = 0; i < 60; i++) { const x = -30 + R() * 60, z = -12 + R() * 28; if (D.pools.some(([px, pz, pr]) => Math.hypot(x - px, z - pz) < pr + 0.8)) continue; const rk = mk(new THREE.DodecahedronGeometry(0.15 + R() * 0.35, 0), mat(R() < 0.7 ? 0x5a5048 : coralCols[Math.floor(R() * 5)], 0.7), root, x, 0.02, z); rk.scale.y = 0.55; rk.rotation.y = R() * 6; }
  const beachS = mk(new THREE.PlaneGeometry(200, 30), new THREE.MeshStandardMaterial({ map: sandTex('#e8cfa0', 5), roughness: 0.95 }), root, 0, 0.08, 46); beachS.rotation.x = -PI / 2; beachS.castShadow = false;
  const palms = [];
  for (let i = 0; i < 16; i++) {
    const x = -60 + i * 8 + R() * 4, z = 50 + R() * 8, h = 7 + R() * 4, p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.z = (R() - 0.5) * 0.25; root.add(p);
    mk(new THREE.CylinderGeometry(0.18, 0.28, h, 8), mat(0x8a6a48, 0.9), p, 0, h / 2, 0);
    for (let k = 0; k < 7; k++) { const fr = mk(new THREE.ConeGeometry(0.5, 3.4, 4), mat(0x3f7a3a, 0.8), p, 0, h, 0); fr.scale.z = 0.15; fr.rotation.set(0, k * 0.9, 2.0); fr.geometry.translate(0, 1.6, 0); }
    palms.push(p);
  }
  // the sea beyond the shelf
  const SEG = 70, seaG = new THREE.PlaneGeometry(900, 500, SEG, SEG); seaG.rotateX(-PI / 2); seaG.translate(0, 0, -264);
  const base = seaG.attributes.position.array.slice();
  const sea = mk(seaG, new THREE.MeshStandardMaterial({ color: 0x3a8aa8, roughness: 0.15, metalness: 0.15, flatShading: true }), root); sea.castShadow = false;
  const glint = mk(new THREE.PlaneGeometry(30, 480), new THREE.MeshBasicMaterial({ map: canvasTex(64, 512, (g, w, h) => { const RR = rng(19); for (let i = 0; i < 900; i++) { const y = RR() * h; g.fillStyle = `rgba(255,220,160,${0.15 + RR() * 0.5})`; g.fillRect(w / 2 + (RR() - 0.5) * w * (0.2 + (y / h) ** 1.4), y, 2 + RR() * 3, 1); } }), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), root, -150, -0.1, -230);
  glint.rotation.x = -PI / 2; glint.rotation.z = 0.6; glint.material.opacity = 0.6; glint.castShadow = false;
  // lights: warm low sun from −z, a pink-blue sky fill
  const hemi = new THREE.HemisphereLight(0xffd8b8, 0x5a6a8a, 1.3); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb878, 2.6); sun.position.set(-22, 9, -14); sun.target.position.set(0, 0, 0); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 5, far: 80 });
  function aimSun(cx = 0, cz = 0, half = 8) { sun.target.position.set(cx, 0, cz); sun.position.set(cx - 22, 9, cz - 14); Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half }); sun.shadow.camera.updateProjectionMatrix(); }
  function update(t) {
    const p = seaG.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, -0.25 + 0.14 * Math.sin(x * 0.1 + t * 0.8) + 0.08 * Math.sin(z * 0.15 - t)); }
    p.needsUpdate = true; seaG.computeVertexNormals();
    pools.forEach((m, i) => (m.position.y = -0.06 + 0.006 * Math.sin(t * 1.4 + i)));
    palms.forEach((pl, i) => (pl.rotation.x = 0.03 * Math.sin(t * 0.9 + i)));
  }
  update(0);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D, fog, sky, sea, pools, star, aimSun, update, lights: { hemi, sun } };
}
