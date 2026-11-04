// SET: the lunar surface at an Apollo-style landing site (built for dh006). Gray cratered regolith to a close horizon (the Moon
// is small), a black sky full of stars, a hard white sun, a lander (gold-foil descent stage + gray ascent stage), a flag on a
// pole with a top rod (no wind on the Moon), boot prints, a few rocks. No Earth in the sky: the video adds its own.
// Coordinates (meters, y up): landing site at the origin, ground ≈ y 0 near it (`heightAt(x, z)`), camera usually low at
// z ≈ +6 looking −z. Lander at DIMS.lander, flag at DIMS.flag. No fog; camera.far ≥ 1200.
import * as THREE from 'three';
import { mat, mk, rng } from '@engine/core.js';
import { usFlagTexture } from '@engine/sets/capital.js';

export const DIMS = { lander: [-3.2, -6.5], flag: [1.6, -2.6] };

export function buildMoon(studio, opts = {}) {
  const { scene } = studio;
  const root = new THREE.Group(); scene.add(root);
  const R = rng(opts.seed ?? 69);
  // stars: soft dots on a far shell
  const sg = new THREE.BufferGeometry(), sp = [];
  for (let i = 0; i < 3000; i++) { const u = R() * 0.95 + 0.02, a = R() * Math.PI * 2, s = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * s * 1000, u * 1000, Math.sin(a) * s * 1000); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const dc = document.createElement('canvas'); dc.width = dc.height = 32; const dg = dc.getContext('2d'); const rg = dg.createRadialGradient(16, 16, 0, 16, 16, 16); rg.addColorStop(0, '#fff'); rg.addColorStop(0.45, 'rgba(255,255,255,.5)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); dg.fillStyle = rg; dg.fillRect(0, 0, 32, 32);
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 2.6, sizeAttenuation: false, map: new THREE.CanvasTexture(dc), transparent: true, depthWrite: false, color: 0xe8eeff, fog: false }));
  root.add(stars);

  // regolith: craters + gentle noise, curving down toward a near horizon (the Moon's radius is 1,737 km)
  const CR = Array.from({ length: 70 }, (_, i) => { const big = i < 8; return [(R() - 0.5) * 320, -R() * 300 + 40, big ? 9 + R() * 14 : 0.8 + R() * 4]; });
  CR.push([5.5, -9, 2.2], [-7.5, -3.5, 1.4], [3.0, -16, 3.5]);
  const heightAt = (x, z) => {
    let h = 0.18 * Math.sin(x * 0.11) * Math.cos(z * 0.09) + 0.07 * Math.sin(x * 0.53 + z * 0.37);
    for (const [cx, cz, r] of CR) { const d = Math.hypot(x - cx, z - cz) / r; if (d < 1.6) h += d < 1 ? -0.32 * r * 0.3 * (1 - d * d) : 0.1 * r * 0.3 * Math.sin((d - 1) / 0.6 * Math.PI); }
    return h - (x * x + z * z) / (2 * 1737000) * 1000 * 0.06;
  };
  const G = new THREE.PlaneGeometry(700, 700, 220, 220); G.rotateX(-Math.PI / 2);
  const P = G.attributes.position, cols = [];
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), z = P.getZ(i), h = heightAt(x, z); P.setY(i, h);
    const v = 0.52 + 0.08 * Math.sin(x * 1.7 + z * 2.3) + 0.05 * R() + Math.max(-0.12, Math.min(0.1, h * 0.05)); cols.push(v, v * 0.98, v * 0.95);
  }
  G.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); G.computeVertexNormals();
  const ground = mk(G, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }), root); ground.receiveShadow = true; ground.castShadow = false;
  // rocks
  const rockM = mat(0x7a7670, 1);
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 40, z = -R() * 40 + 4; if (Math.abs(x) < 2.5 && z > -4) continue; const s = 0.1 + R() * 0.45; const r = mk(new THREE.DodecahedronGeometry(s, 0), rockM, root, x, heightAt(x, z) + s * 0.3, z); r.rotation.set(R() * 3, R() * 3, R() * 3); }
  // boot prints along a little path from the lander to the flag
  const printM = mat(0x5a5753, 1);
  for (let k = 0; k < 16; k++) { const u = k / 15, x = -2.4 + u * 4.0 + (k % 2 ? 0.12 : -0.12), z = -5.6 + u * 3.3; const pr = mk(new THREE.BoxGeometry(0.13, 0.012, 0.3), printM, root, x, heightAt(x, z) + 0.006, z); pr.rotation.y = -0.9; pr.castShadow = false; }

  // the lander
  const lander = new THREE.Group(); lander.position.set(DIMS.lander[0], heightAt(...DIMS.lander), DIMS.lander[1]); lander.rotation.y = 0.5; root.add(lander);
  const foil = new THREE.MeshStandardMaterial({ color: 0xd9a63a, roughness: 0.35, metalness: 0.75 }), gray = mat(0xb8b6b0, 0.6), dark = mat(0x2a2a2e, 0.5);
  const ds = mk(new THREE.CylinderGeometry(1.9, 1.9, 1.5, 8), foil, lander, 0, 1.6, 0); ds.rotation.y = Math.PI / 8;
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + Math.PI / 4, x = Math.cos(a), z = Math.sin(a);
    const leg = mk(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), gray, lander, x * 2.3, 0.95, z * 2.3); leg.rotation.set(z * 0.5, 0, -x * 0.5);
    mk(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 14), gray, lander, x * 2.85, 0.04, z * 2.85);
  }
  const as = mk(new THREE.CylinderGeometry(1.35, 1.6, 1.8, 8), gray, lander, 0, 3.25, 0); as.rotation.y = Math.PI / 8;
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.4, 0.4, 0.05), dark, lander, s * 0.45, 3.5, 1.45).rotation.x = -0.25;
  const dish = mk(new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 3), gray, lander, 1.1, 4.6, -0.3); dish.rotation.z = 0.8;
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 5), gray, lander, 0.9, 4.25, -0.3).rotation.z = 0.8;
  mk(new THREE.BoxGeometry(0.9, 0.1, 0.9), dark, lander, 0, 2.45, 1.75);   // the porch

  // the flag (a top rod holds it out: there is no wind)
  const flag = new THREE.Group(); flag.position.set(DIMS.flag[0], heightAt(...DIMS.flag), DIMS.flag[1]); flag.rotation.y = -0.35; root.add(flag);
  mk(new THREE.CylinderGeometry(0.022, 0.026, 2.3, 8), mat(0xd8d8d4, 0.4, { metalness: 0.5 }), flag, 0, 1.15, 0);
  mk(new THREE.CylinderGeometry(0.015, 0.015, 1.25, 6), mat(0xd8d8d4, 0.4, { metalness: 0.5 }), flag, 0.62, 2.25, 0).rotation.z = Math.PI / 2;
  const fg = new THREE.PlaneGeometry(1.2, 0.75, 12, 4); fg.translate(0.6, -0.375, 0);
  const fp = fg.attributes.position; for (let i = 0; i < fp.count; i++) fp.setZ(i, 0.05 * Math.sin(fp.getX(i) * 5.5) * (fp.getY(i) + 0.75));   // the famous crinkle
  fg.computeVertexNormals();
  mk(fg, new THREE.MeshStandardMaterial({ map: usFlagTexture(), roughness: 0.85, side: THREE.DoubleSide }), flag, 0.02, 2.24, 0);

  // lights: one hard sun, almost no ambient (black sky)
  const hemi = new THREE.HemisphereLight(0xb8c4d8, 0x3a3836, 0.35); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xfffaf0, 3.6); sun.position.set(-40, 26, 18); sun.target.position.set(0, 0, -4); root.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 5, far: 120 }); sun.shadow.bias = -0.0006;
  root.traverse((o) => { if (o.isMesh && (o.material.isMeshBasicMaterial || o.material.transparent)) { o.castShadow = false; o.receiveShadow = false; } });
  return { root, D: DIMS, heightAt, ground, lander, flag, stars, lights: { hemi, sun } };
}
