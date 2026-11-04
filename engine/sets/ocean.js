// SET: a sunny open ocean (built for dh006, "what if electrons disappeared"). Rolling low-poly swell to the horizon, a hazy sky
// dome + a few puffy clouds, a white cruise ship (window rows, red funnel, lifeboats), a striped lighthouse on a rock, red/white
// buoys, and `makeWhale()` (a cartoon humpback for a frozen mid-breach). `update(t)` moves the swell + bobs the buoys.
// Coordinates (meters, y up): sea level y = 0; camera usually low over the water near the origin looking −z.
//   Ship at DIMS.ship (bow toward −x), lighthouse at DIMS.light, buoys around DIMS.buoys. Own `fog`; set camera.far ≥ 700.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';
import { makeSkyDome } from '@engine/sets/military.js';

export const DIMS = { ship: [55, -150], light: [-62, -120], buoys: [[9, -22], [-7, -34], [18, -48]] };

/** A cartoon humpback (~9 m), nose +z, belly −y. Returns {g, body, tail, flippers[]}. */
export function makeWhale({ color = 0x45607a, belly = 0xe8e4dc } = {}) {
  const g = new THREE.Group(), skin = mat(color, 0.55), pale = mat(belly, 0.7);
  const body = mk(new THREE.SphereGeometry(1, 28, 18), skin, g, 0, 0, 0); body.scale.set(1.35, 1.25, 4.4);
  const bel = mk(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42), pale, g, 0, 0.02, 0.2); bel.scale.set(1.3, 1.22, 4.25);
  for (let k = 0; k < 6; k++) { const gr = mk(new THREE.BoxGeometry(0.06, 0.04, 2.6), mat(0xc8c2b6, 0.7), g, (k - 2.5) * 0.28, -1.2, 1.9); gr.rotation.x = -0.12; }   // throat grooves
  for (const s of [-1, 1]) {
    const eye = mk(new THREE.SphereGeometry(0.13, 12, 10), mat(0x111111, 0.3), g, s * 1.12, 0.05, 2.6);
    mk(new THREE.SphereGeometry(0.04, 8, 6), mat(0xffffff, 0.2), eye, 0.03 * s, 0.05, 0.08);
  }
  const smile = mk(new THREE.TorusGeometry(1.15, 0.035, 6, 30, 1.3), mat(0x22303e, 0.6), g, 0, -0.35, 2.9); smile.rotation.set(Math.PI / 2, 0, Math.PI + 0.65 - 0.65);
  const flippers = [-1, 1].map((s) => { const f = mk(new THREE.SphereGeometry(1, 16, 10), pale, g, s * 1.6, -0.55, 1.2); f.scale.set(1.9, 0.12, 0.45); f.rotation.set(0, s * 0.5, s * -0.6); return f; });
  const tail = new THREE.Group(); tail.position.set(0, 0.1, -4.1); g.add(tail);
  mk(new THREE.CylinderGeometry(0.45, 0.85, 2.2, 14), skin, tail, 0, 0, -0.9).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { const fl = mk(new THREE.SphereGeometry(1, 16, 10), skin, tail, s * 1.1, 0, -2.1); fl.scale.set(1.5, 0.12, 0.6); fl.rotation.y = s * 0.45; }
  return { g, body, tail, flippers };
}

export function buildOcean(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 33);
  const fog = new THREE.Fog(0xcfe2ee, 120, 620);
  const sky = makeSkyDome(0x4f8fd8, 0xe6f0f4, 650); root.add(sky.mesh);
  // clouds: soft puffy clusters low in the sky
  const cloudM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.25, fog: false });
  const clouds = new THREE.Group(); root.add(clouds);
  for (let c = 0; c < 9; c++) {
    const a = -1.9 + c * 0.42 + R() * 0.2, d = 420 + R() * 120, cg = new THREE.Group(); cg.position.set(Math.sin(a) * d, 55 + R() * 60, -Math.cos(a) * d); clouds.add(cg);
    for (let k = 0; k < 6; k++) mk(new THREE.SphereGeometry(10 + R() * 9, 12, 8), cloudM, cg, (k - 2.5) * 11 + R() * 4, R() * 6, R() * 8).scale.y = 0.6;
  }
  // the sea: a low-poly swell (flat-shaded so the facets catch the sun)
  const SEG = 120, seaG = new THREE.PlaneGeometry(900, 900, SEG, SEG); seaG.rotateX(-Math.PI / 2);
  const base = seaG.attributes.position.array.slice();
  const sea = mk(seaG, new THREE.MeshStandardMaterial({ color: 0x2f86c0, roughness: 0.22, metalness: 0.12, flatShading: true }), root); sea.receiveShadow = true; sea.castShadow = false;
  const waveAt = (x, z, t) => 0.32 * Math.sin(x * 0.09 + t * 0.9) + 0.22 * Math.sin(z * 0.13 - t * 1.1 + x * 0.04) + 0.12 * Math.sin((x + z) * 0.21 + t * 1.7);
  // a sparkle path toward the sun
  const glint = mk(new THREE.PlaneGeometry(60, 520), new THREE.MeshBasicMaterial({ map: canvasTex(64, 512, (g, w, h) => { for (let i = 0; i < 900; i++) { const y = R() * h, sp = (y / h) ** 1.5; g.fillStyle = `rgba(255,250,230,${0.15 + R() * 0.5})`; g.fillRect(w / 2 + (R() - 0.5) * w * (0.2 + sp), y, 2 + R() * 3, 1); } }), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), root, 40, 0.6, -330);
  glint.rotation.x = -Math.PI / 2; glint.rotation.z = -0.12; glint.castShadow = false;

  // cruise ship
  const ship = new THREE.Group(); ship.position.set(DIMS.ship[0], 0, DIMS.ship[1]); ship.rotation.y = 0.35; root.add(ship);
  const white = mat(0xf6f4ee, 0.5), navy = mat(0x22355a, 0.5), red = mat(0xd2483f, 0.5);
  mk(new RoundedBoxGeometry(46, 7, 8.5, 3, 1.2), white, ship, 0, 2.2, 0);
  mk(new THREE.BoxGeometry(46.2, 1.2, 8.6), navy, ship, 0, -0.6, 0);
  mk(new THREE.BoxGeometry(46.2, 0.5, 8.62), mat(0x3d7bd9, 0.5), ship, 0, 3.6, 0);
  const winT = canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, w, h); for (let x = 6; x < w; x += 16) { g.fillStyle = '#2a3e5a'; g.fillRect(x, 22, 9, 20); } }, [3, 1]);
  const deckM = new THREE.MeshStandardMaterial({ map: winT, roughness: 0.5 });
  [[36, 2.6, 7.4, 7.0], [28, 2.4, 6.6, 9.4], [18, 2.2, 5.6, 11.6]].forEach(([L, H, D, y]) => mk(new THREE.BoxGeometry(L, H, D), deckM, ship, -2, y, 0));
  const funnel = mk(new THREE.CylinderGeometry(1.6, 2.0, 5, 16), red, ship, -6, 15, 0); funnel.scale.z = 0.7;
  mk(new THREE.CylinderGeometry(1.62, 1.62, 0.9, 16), mat(0x1d1d22, 0.6), funnel, 0, 2.2, 0);
  for (let k = 0; k < 6; k++) for (const s of [-1, 1]) mk(new RoundedBoxGeometry(3, 1, 1.2, 2, 0.4), mat(0xf28a2a, 0.5), ship, -14 + k * 5.2, 6.4, s * 4.6);
  const bow = mk(new THREE.ConeGeometry(4.25, 7, 4, 1), white, ship, -26, 2.2, 0); bow.rotation.set(0, Math.PI / 4, Math.PI / 2); bow.scale.set(1, 1, 0.8);
  // lighthouse on a rock
  const lh = new THREE.Group(); lh.position.set(DIMS.light[0], 0, DIMS.light[1]); root.add(lh);
  const rock = mk(new THREE.DodecahedronGeometry(9, 1), mat(0x6f6a62, 0.95), lh, 0, -2.5, 0); rock.scale.set(1.4, 0.55, 1.1);
  const stripeT = canvasTex(64, 256, (g, w, h) => { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#f6f2ea' : '#d2483f'; g.fillRect(0, (i * h) / 6, w, h / 6 + 1); } });
  mk(new THREE.CylinderGeometry(1.7, 2.6, 18, 20), new THREE.MeshStandardMaterial({ map: stripeT, roughness: 0.7 }), lh, 0, 11, 0);
  mk(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 20), mat(0x2a2a30, 0.5), lh, 0, 20.2, 0);
  mk(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 16), new THREE.MeshStandardMaterial({ color: 0xfff2b8, emissive: 0xffd86a, emissiveIntensity: 0.7, roughness: 0.2 }), lh, 0, 21.6, 0);
  mk(new THREE.ConeGeometry(1.9, 1.8, 16), mat(0xd2483f, 0.5), lh, 0, 23.7, 0);
  // buoys
  const buoys = DIMS.buoys.map(([x, z], i) => { const b = new THREE.Group(); b.position.set(x, 0, z); root.add(b); mk(new THREE.CylinderGeometry(0.55, 0.7, 1.1, 14), i % 2 ? white : red, b, 0, 0.3, 0); mk(new THREE.ConeGeometry(0.4, 1.0, 12), i % 2 ? red : white, b, 0, 1.35, 0); mk(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff2b8, emissive: 0xffd86a, emissiveIntensity: 0.8 }), b, 0, 1.95, 0); return b; });

  // lights
  const hemi = new THREE.HemisphereLight(0xdff0ff, 0x2a5a7a, 1.2); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.8); sun.position.set(60, 90, -120); sun.target.position.set(0, 0, -20); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 10, far: 300 });

  function update(t) {
    const p = seaG.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, waveAt(x, z, t)); }
    p.needsUpdate = true; seaG.computeVertexNormals();
    buoys.forEach((b, i) => { const [x, z] = DIMS.buoys[i]; b.position.y = waveAt(x, z, t) - 0.1; b.rotation.z = 0.12 * Math.sin(t * 1.3 + i); b.rotation.x = 0.1 * Math.sin(t * 1.1 + i * 2); });
  }
  update(0);
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D: DIMS, fog, sky, clouds, glint, sea, ship, lighthouse: lh, buoys, waveAt, update, lights: { hemi, sun } };
}
