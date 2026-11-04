// SET: an alpine lookout (built for dh011 "chud to chad") — a wooden viewing deck with a railing, a coin binocular viewer, a
// trail sign and benches on a pine-covered hill, facing a huge toy-faceted snowy peak (DIMS.peak) between two smaller peaks,
// rolling pine hills in between, soft cloud puffs around the summit, a painted sky dome you can run from day to sunset to dusk.
// Coordinates: the deck is at the origin (floor y 0), the view is toward −z. The big peak's base sits ~900 m away. Handles: peak
// (group: move .position.y down to sink it, its own lights unaffected), sides[] (the two side peaks), clouds (group), sky
// (dome mesh), setSky(k: 0 day … 1 sunset … 2 dusk), sunDir (Vector3, the light's direction for the current setSky), fog, lights.
// The video must set camera.far ≥ 2400.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

export const DIMS = { peak: [60, -900], peakH: 470, deckY: 0, rail: -1.35 };

function noise(R) { const a = Array.from({ length: 6 }, () => [R() * 6.28, 0.5 + R() * 2.5]); return (x, z) => a.reduce((s, [p, f]) => s + Math.sin(x * 0.012 * f + p) * Math.cos(z * 0.011 * f - p * 0.7) / f, 0); }

function peakGeo(radius, height, seed, snowAt = 0.62) {
  const R = rng(seed), n = noise(R), geo = new THREE.ConeGeometry(radius, height, 48, 18).toNonIndexed();
  const p = geo.attributes.position, col = [], c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), u = (y + height / 2) / height;
    const k = (1 - u) * 0.09 * radius;
    const d = n(x * 3 + seed, z * 3) * k, a = Math.atan2(z, x);
    if (u < 0.999) { p.setX(i, x + Math.cos(a) * d); p.setZ(i, z + Math.sin(a) * d); p.setY(i, y + n(x, z) * height * 0.015 * (1 - u)); }
  }
  for (let i = 0; i < p.count; i += 3) {   // flat faceted colors per triangle: rock → snow by height (+ a ragged snow line)
    const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, u = (y + height / 2) / height;
    const snow = u > snowAt + 0.06 * Math.sin(i * 0.37);
    c.set(snow ? 0xf4f6fa : u > snowAt - 0.2 ? 0x8a8e96 : 0x6a7a5a).offsetHSL(0, 0, (R() - 0.5) * 0.06);
    for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  return geo;
}

export function buildMountain(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 51);
  const box = (w, h, d, m, x, y, z, p = root) => mk(new THREE.BoxGeometry(w, h, d), m, p, x, y, z);
  const rbox = (w, h, d, r, m, x, y, z, p = root) => mk(new RoundedBoxGeometry(w, h, d, 2, r), m, p, x, y, z);
  const rockM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });

  // sky dome (gradient redrawn per mode) + fog
  const skyC = document.createElement('canvas'); skyC.width = 16; skyC.height = 512; const skyTex = new THREE.CanvasTexture(skyC); skyTex.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1900, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -1; root.add(sky);
  const fog = new THREE.Fog(0xcfe2f2, 300, 2200); scene.fog = fog;

  // the big peak + two side peaks + far range
  const peak = new THREE.Group(); peak.position.set(DIMS.peak[0], 0, DIMS.peak[1]); root.add(peak);
  const big = new THREE.Mesh(peakGeo(560, DIMS.peakH, 3, 0.55), rockM); big.position.y = DIMS.peakH / 2 - 60; big.castShadow = false; big.receiveShadow = true; peak.add(big);
  const sides = [[-520, -1050, 330, 300, 7], [640, -1150, 360, 280, 9]].map(([x, z, r, h, s]) => { const m = new THREE.Mesh(peakGeo(r, h, s, 0.66), rockM); m.position.set(x, h / 2 - 60, z); m.castShadow = false; root.add(m); return m; });
  for (let k = 0; k < 9; k++) { const h = 160 + R() * 160, r = 260 + R() * 160; const m = new THREE.Mesh(peakGeo(r, h, 20 + k, 0.7), rockM); m.position.set(-1500 + k * 380 + R() * 80, h / 2 - 70, -1650 - R() * 150); m.castShadow = false; root.add(m); }
  // rolling hills between the deck and the peak (vertex-colored greens), the deck's own hill
  const hills = new THREE.PlaneGeometry(4200, 2400, 90, 50).toNonIndexed(); hills.rotateX(-Math.PI / 2);
  const hn = noise(rng(4)), hp = hills.attributes.position, hc = [], c = new THREE.Color();
  for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), z = hp.getZ(i) - 700; const dz = Math.max(0, -z - 80); hp.setZ(i, z); hp.setY(i, -45 + hn(x, z) * 12 - Math.min(dz, 500) * 0.02); }
  for (let i = 0; i < hp.count; i += 3) { c.set(0x5a8a4a).offsetHSL((R() - 0.5) * 0.02, 0, (R() - 0.5) * 0.08); for (let k = 0; k < 3; k++) hc.push(c.r, c.g, c.b); }
  hills.setAttribute('color', new THREE.Float32BufferAttribute(hc, 3)); hills.computeVertexNormals();
  const hillM = new THREE.Mesh(hills, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true })); hillM.receiveShadow = true; hillM.castShadow = false; root.add(hillM);
  const knoll = mk(new THREE.CylinderGeometry(14, 40, 40, 32, 1), mat(0x6a9a4a, 1, { flatShading: true }), root, 0, -20.05, 2); knoll.castShadow = false;
  // pines: instanced cones (near ones on the knoll, far ones on the hills)
  const pineGeo = new THREE.ConeGeometry(1, 3, 7); pineGeo.translate(0, 1.5, 0);
  const pines = new THREE.InstancedMesh(pineGeo, mat(0x2f5a3a, 0.9, { flatShading: true }), 900); pines.castShadow = false; root.add(pines);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
  let np = 0;
  for (let k = 0; k < 900; k++) {
    let x, z, y, s;
    if (k < 70) { const a = R() * 6.28, r = 7 + R() * 7; x = Math.cos(a) * r; z = 2 + Math.sin(a) * r; if (z < -3 && Math.abs(x) < 9) continue; y = -0.2; s = 1.2 + R() * 1.4; }
    else { x = (R() - 0.5) * 2600; z = -60 - R() * 700; y = -45 + hn(x, z) * 12 - Math.min(Math.max(0, -z - 80), 500) * 0.02; s = 5 + R() * 7; }
    _m.compose(_p.set(x, y, z), _q.identity(), _s.set(s, s * (0.9 + R() * 0.4), s)); pines.setMatrixAt(np++, _m);
  }
  pines.count = np;
  // cloud puffs around the summit (sprites)
  const puffTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(0.6, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const clouds = new THREE.Group(); root.add(clouds);
  for (let k = 0; k < 10; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, fog: true, color: 0xffffff, opacity: 0.75 })); const a = (k / 10) * 6.28 + R() * 0.4; sp.position.set(DIMS.peak[0] + Math.cos(a) * (260 + R() * 160), 110 + R() * 80, DIMS.peak[1] + 160 + Math.sin(a) * 90); sp.scale.setScalar(90 + R() * 70); clouds.add(sp); }

  // the lookout deck: planks, railing, binocular viewer, trail sign, bench
  const woodM = mat(0xa8784a, 0.8), darkW = mat(0x6a4a2a, 0.8), steelM = mat(0x3a5a4a, 0.5, { metalness: 0.4 });
  const plank = canvasTex(256, 256, (g, w, h) => { const r = rng(5); for (let x = 0; x < w; x += 32) { g.fillStyle = `hsl(30,${40 + r() * 10}%,${42 + r() * 8}%)`; g.fillRect(x, 0, 31, h); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 31, 0, 1, h); } }, [4, 2]);
  rbox(8, 0.2, 4, 0.03, new THREE.MeshStandardMaterial({ map: plank, roughness: 0.85 }), 0, -0.1, 0.3);
  for (const x of [-3.8, -1.9, 0, 1.9, 3.8]) box(0.12, 1.05, 0.12, darkW, x, 0.52, DIMS.rail);
  for (const y of [0.55, 1.02]) box(7.8, 0.08, 0.1, woodM, 0, y, DIMS.rail);
  for (const s of [-1, 1]) { for (const z of [-0.4, 0.6, 1.6]) box(0.12, 1.05, 0.12, darkW, s * 3.9, 0.52, z); box(0.1, 0.08, 3.1, woodM, s * 3.9, 1.02, 0.1); }
  const viewer = new THREE.Group(); viewer.position.set(-2.5, 0, DIMS.rail + 0.45); root.add(viewer);
  mk(new THREE.CylinderGeometry(0.05, 0.07, 1.05, 10), steelM, viewer, 0, 0.52, 0);
  rbox(0.34, 0.24, 0.3, 0.06, steelM, 0, 1.18, 0, viewer);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 12), steelM, viewer, s * 0.09, 1.2, -0.2).rotation.x = Math.PI / 2;
  const signTex = canvasTex(320, 200, (g, w, h) => { g.fillStyle = '#5a3a1e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8d6b0'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#f4e8cc'; g.textAlign = 'center'; g.font = 'bold 40px Helvetica, Arial, sans-serif'; g.fillText('SUMMIT VIEW', w / 2, 78); g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.fillText('ELEV. 2,412 m', w / 2, 132); void h; });
  const sign = new THREE.Group(); sign.position.set(3.1, 0, 1.4); sign.rotation.y = -0.5; root.add(sign);
  for (const s of [-1, 1]) box(0.08, 1.5, 0.08, darkW, s * 0.4, 0.75, 0, sign);
  mk(new THREE.PlaneGeometry(0.9, 0.56), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.8 }), sign, 0, 1.3, 0.05);
  const bench = new THREE.Group(); bench.position.set(2.2, 0, -0.5); root.add(bench);
  rbox(1.5, 0.06, 0.38, 0.02, woodM, 0, 0.44, 0, bench); for (const x of [-0.6, 0.6]) box(0.06, 0.44, 0.34, darkW, x, 0.22, 0, bench);
  void box;

  // lights: sun (direction follows setSky) + hemi
  const hemi = new THREE.HemisphereLight(0xdfeeff, 0x4a6a3a, 1.0); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.4); root.add(sun, sun.target); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 80 });
  const sunDir = new THREE.Vector3();
  const SKY = [['#4f9be0', '#bfe0f6', 0xcfe2f2, 0xfff2dc, 2.4, 1.0], ['#5a5aa8', '#ffb070', 0xf0b890, 0xffa860, 1.6, 0.75], ['#141a40', '#5a4a7a', 0x3a3a5a, 0x9aa0ff, 0.4, 0.4]];
  function setSky(k) {
    const i = Math.min(1, Math.floor(k)), u = Math.min(1, k - i), A = SKY[i], B = SKY[i + 1], cl = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), u);
    const g = skyC.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#' + cl(A[0], B[0]).getHexString()); gr.addColorStop(0.5, '#' + cl(A[1], B[1]).getHexString()); gr.addColorStop(1, '#' + cl(A[1], B[1]).getHexString()); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); skyTex.needsUpdate = true;
    fog.color.copy(cl(A[2], B[2])); sun.color.copy(cl(A[3], B[3])); sun.intensity = A[4] + (B[4] - A[4]) * u; hemi.intensity = A[5] + (B[5] - A[5]) * u;
    // day: the sun is high behind the deck (faces lit); sunset: low in front, over the range (it can be in frame)
    const kk = Math.min(k, 1); sunDir.set(0.4 - 0.2 * kk, 0.85 - 0.73 * kk - 0.2 * Math.max(0, k - 1), 0.45 - 1.45 * kk).normalize();
    sun.position.copy(sunDir).multiplyScalar(40);
  }
  setSky(0);
  return { root, D: DIMS, peak, sides, clouds, sky, setSky, sunDir, fog, viewer, sign, bench, lights: { hemi, sun } };
}
