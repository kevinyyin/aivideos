// Macro tabletop: the coins up close. 'new' = a store counter under cool light (title, the clad quarter, 119 ridges),
// 'old' = a candle-lit wooden table (the 1696 milled shilling, the file that shaves its ridges off).
// v2: 'sliver' = a file takes a sliver off a SMOOTH old coin and nothing shows (the mystery); 'jar' = the analogy, a
// new jar's foil seal that a spoon can't get past without tearing it.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { wood, ctex, fitText } from '@engine/toon/paint.js';
import { plane, sun, glow, cyl, ball, box } from '@engine/toon/kit.js';
import { makeCoin, makeShavings } from '@engine/toon/coins.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { K, PI, sm, clamp, lerp, makeFile, makeLabel } from './util.js';

const R = 0.12, V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3();
export function makeMacro(root) {
  const oldTop = plane(root, 4, 4, toonMat(wood('#7a4a2c', { boards: 5 })), 0, 0, -0.8); oldTop.rotation.x = -PI / 2;
  const newTop = plane(root, 4, 4, toonMat(ctex('laminate', 256, 256, (g, r, W, H) => { g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? '#c4bdae' : '#e8e3d8'; g.fillRect(r() * W, r() * H, 2, 2); } }, [4, 4])), 0, 0.001, -0.8);
  newTop.rotation.x = -PI / 2;
  // out-of-focus background glows (bokeh): warm candle shop / cool store
  const warm = new THREE.Group(), cool = new THREE.Group(); root.add(warm, cool);
  [[-0.9, 0.5, -2.2, 0.7], [0.7, 0.3, -1.8, 0.5], [0.2, 0.9, -3, 0.9], [-0.3, 0.2, -1.4, 0.35]].forEach(([x, y, z, s]) => glow(warm, '255,180,100', s, x, y, z, 0.7));
  [[-0.8, 0.6, -2.4, 0.8, '200,225,255'], [0.8, 0.4, -2.0, 0.6, '255,120,150'], [0.1, 1.0, -3.0, 1.0, '220,240,255'], [0.5, 0.15, -1.5, 0.4, '255,210,120']].forEach(([x, y, z, s, c]) => glow(cool, c, s, x, y, z, 0.6));
  const backOld = plane(root, 8, 3, toonMat('#3a2a22'), 0, 1.2, -3.5), backNew = plane(root, 8, 3, toonMat('#3a4256'), 0, 1.2, -3.5);
  // coins (standing on edge, faces along ±z unless turned)
  const quarter = makeCoin({ r: R, h: 0.02, kind: 'quarter', ridges: 119, edge: 'clad' });
  const shilling = makeCoin({ r: R, h: 0.018, kind: 'shilling', ridges: 100 });
  for (const c of [quarter, shilling]) { c.g.position.set(0, R, 0); c.mesh.rotation.x = PI / 2; root.add(c.g); }
  // flat coins for the shave: rim angle 0 faces +z (the camera); the shaved arc is the part the file rubs
  const flat = makeCoin({ r: R, h: 0.03, kind: 'shilling', ridges: 100 }), shaved = makeCoin({ r: R, h: 0.03, kind: 'shilling', ridges: 100, shaved: [-0.22, 0.22] });
  for (const c of [flat, shaved]) { c.g.position.set(0, 0.015, 0); root.add(c.g); }
  // (v2) the same strokes on a smooth hammered coin: the filed arc is there, but nobody could tell
  const oldFlat = makeCoin({ r: R, h: 0.03, kind: 'hammered', seed: 9 }), oldShaved = makeCoin({ r: R, h: 0.03, kind: 'hammered', seed: 9, shaved: [-0.22, 0.22] });
  for (const c of [oldFlat, oldShaved]) { c.g.position.set(0, 0.015, 0); root.add(c.g); }
  // (v2) the analogy: a jar of peanut butter, lid off, foil seal; a spoon pokes through it
  const jar = new THREE.Group(); jar.position.set(0, 0, -0.1); root.add(jar);
  const JR = 0.16, JH = 0.3;
  cyl(jar, JR * 0.96, JR * 0.96, JH * 0.92, toonMat('#b9773a'), 0, JH * 0.46, 0, 40);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(JR, JR, JH, 40, 1, true), new THREE.MeshLambertMaterial({ color: 0xe6f0f4, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
  glass.position.y = JH / 2; jar.add(glass);
  const lbl = new THREE.Mesh(new THREE.CylinderGeometry(JR * 1.005, JR * 1.005, JH * 0.46, 40, 1, true), toonMat(ctex('pbLabel', 1024, 256, (g, r, W, H) => {
    g.fillStyle = '#f2c232'; g.fillRect(0, 0, W, H); g.fillStyle = '#c9474a'; g.fillRect(0, 18, W, 16); g.fillRect(0, H - 34, W, 16);
    g.fillStyle = '#5a2e14'; g.textAlign = 'center'; for (const x of [W * 0.25, W * 0.75]) fitText(g, 'PEANUT BUTTER', x, H * 0.62, W * 0.44, 64, 'bold', 'Arial Black, Arial, sans-serif');
  })));
  lbl.position.y = JH * 0.42; jar.add(lbl);
  cyl(jar, JR * 1.02, JR * 1.02, 0.03, toonMat('#e8e2d4'), 0, JH - 0.012, 0, 40);
  const foilM = toonMetal('#dfe3ea', { rough: 0.28 });
  const seal = new THREE.Mesh(new THREE.CircleGeometry(JR * 0.99, 48), foilM); seal.rotation.x = -PI / 2; seal.position.y = JH + 0.004; jar.add(seal);
  // torn: the foil with a ragged hole + a flap folded up; the peanut butter shows through
  const torn = new THREE.Group(); torn.position.y = JH + 0.004; jar.add(torn);
  { const ring = new THREE.Mesh(new THREE.RingGeometry(JR * 0.42, JR * 0.99, 48, 1, 0.9, PI * 2 - 0.9), foilM); ring.rotation.x = -PI / 2; torn.add(ring);
    const rest = new THREE.Mesh(new THREE.RingGeometry(JR * 0.62, JR * 0.99, 24, 1, -0.9, 1.8), foilM); rest.rotation.x = -PI / 2; torn.add(rest);
    const flap = new THREE.Mesh(new THREE.CircleGeometry(JR * 0.5, 24, -0.6, 1.2), foilM); flap.position.set(JR * 0.35, 0.002, 0); flap.rotation.set(-PI / 2, -0.9, 0); torn.add(flap); }
  const lid = new THREE.Group(); jar.add(lid); cyl(lid, JR * 1.08, JR * 1.08, 0.07, toonMat('#c9474a'), 0, 0, 0, 40);
  const spoon = new THREE.Group(); root.add(spoon);
  { const steel = toonMetal('#cfd3da', { rough: 0.25 }); const h = cyl(spoon, 0.012, 0.016, 0.42, steel, 0, 0.25, 0, 10); h.castShadow = true;
    const bowl = ball(spoon, 0.045, steel, 0, 0.02, 0, 16); bowl.scale.set(0.85, 0.45, 1.25);
    const scoop = ball(spoon, 0.04, toonMat('#b9773a'), 0, 0.045, 0, 12); scoop.scale.set(0.9, 0.6, 1.1); spoon.userData.scoop = scoop; }
  const spark = glow(root, '255,255,240', 0.05, 0, 0.015, R + 0.01, 0.9);
  const file = makeFile(root, 0.5);
  const filings = makeShavings(120, { r: 0.006 }); root.add(filings.mesh);
  const label = makeLabel(root, { size: 0.04, draw: (g, v, W, H) => {
    g.font = '900 150px "Avenir Next", Arial, sans-serif'; g.textAlign = 'center'; g.lineWidth = 22; g.strokeStyle = '#17121a'; g.lineJoin = 'round';
    g.strokeText(String(v), W / 2, H * 0.72); g.fillStyle = '#f3c46b'; g.fillText(String(v), W / 2, H * 0.72);
  } });
  const key = sun(root, [0.6, 1.4, 1.2], [0, 0.1, 0], { half: 0.6, map: 2048, far: 6, hemi: [0xdfe8ff, 0x8a7a68, 0.8] });
  // (toon look v2) a light pool on the coin: a store spot from above (new) / the candle just off frame (old)
  const spot = new THREE.SpotLight(0xfff4e0, 2.2, 0, 0.45, 0.7, 2); spot.position.set(0.25, 0.95, 0.55); spot.target.position.set(0, 0.1, 0); root.add(spot, spot.target);
  const candle = new THREE.PointLight(0xffa858, 1.4, 1.6, 2); candle.position.set(-0.42, 0.3, 0.35); root.add(candle);
  const show = (mode) => {
    const isNew = mode === 'new';
    newTop.visible = cool.visible = backNew.visible = spot.visible = isNew; oldTop.visible = warm.visible = backOld.visible = candle.visible = !isNew;
  };
  // (toon look v3) warm key vs cool shade + a rim; the coins are real metal, so each mode gets its own reflections:
  // the store = a white spot overhead + cool and neon-pink fills (its bokeh), the candle table = one warm flame + a dim blue
  const NEW = { lit: [1.12, 1.1, 1.06], shade: [0.36, 0.4, 0.62], sat: 0.85, term: 0.25, lambert: 0.4, rim: [0.12, 0.14, 0.2], charTint: [1, 1, 1], charShade: 0.85, charGain: 1 };
  const OLD = { lit: [1.08, 0.86, 0.62], shade: [0.2, 0.2, 0.42], sat: 0.86, term: 0.25, lambert: 0.4, rim: [0.14, 0.12, 0.24], charTint: [1, 1, 1], charShade: 0.85, charGain: 1 };
  const ENV_NEW = { top: '#8a90a0', horizon: '#d8dce4', ground: '#3a3a40', lights: [{ dir: [0.25, 0.95, 0.55], color: '#fff4e0', intensity: 7, size: 3 }, { dir: [0, 0.3, 1], color: '#eef2f8', intensity: 3, size: 8 }, { dir: [-1, 0.4, -0.6], color: '#b8d0ff', intensity: 2, size: 4 }, { dir: [0.8, 0.25, -1], color: '#ff9ab0', intensity: 1.2, size: 3 }] };
  const ENV_OLD = { top: '#4a4644', horizon: '#9a948e', ground: '#3a3230', lights: [{ dir: [-0.42, 0.3, 0.35], color: '#ffd8b0', intensity: 4, size: 2 }, { dir: [0, 1, 0.3], color: '#e8e8ec', intensity: 2.5, size: 6 }, { dir: [0.6, 0.8, -0.4], color: '#a8b8e0', intensity: 1.2, size: 4 }] };
  // (v2) seen from above, the coin faces mirror the space behind the table: a warm bounce there lights them
  const ENV_TOP = { ...ENV_OLD, lights: [...ENV_OLD.lights, { dir: [0, 0.4, -0.92], color: '#c8a888', intensity: 1.0, size: 5 }] };
  // dust in the light, millimetres across: the lens is 0.3-0.6 m from the coin
  const motes = makeMotes(root, { n: 70, box: [-0.35, 0.02, -0.55, 0.35, 0.45, 0.12], size: 0.0016, near: 0.08, color: 0xfff0d8, intensity: 1.4, rise: 0.01 });
  const coinAt = [0, R, 0];
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.01, far: 12, bg: new THREE.Color('#2a2622'), cInf: 26, env: ENV_NEW, bloom: 0.35 }, motes: [motes],
    shots: {
      title: { tone: NEW, cam: (t) => ({ p: [Math.sin(t * 0.2) * 0.05, 0.15, 0.6 - t * 0.02], a: [0, 0.115, 0], fov: 34 }), focus: () => coinAt },
      sliver: { tone: OLD, env: ENV_TOP, cam: (t) => ({ p: [K(t, [[24.8, -0.05], [27.35, 0.02]]), K(t, [[24.8, 0.17], [27.35, 0.13]]), K(t, [[24.8, 0.46], [27.35, 0.36]])], a: [0, 0.01, 0.06], fov: 30 }), focus: () => [0, 0.015, R] },
      jar: { tone: NEW, cam: (t) => ({ p: [K(t, [[51.45, 0.3], [54.75, 0.18]]), K(t, [[51.45, 0.95], [54.75, 0.82]]), K(t, [[51.45, 1.0], [54.75, 0.72]])], a: [0, K(t, [[51.45, 0.24], [54.75, 0.28]]), -0.1], fov: 34 }), focus: () => [0, 0.3, -0.1], cInf: 18 },
      mill: { tone: OLD, env: ENV_OLD, cam: (t) => { const u = sm(t, 27.75, 29.4), a = lerp(1.3, 0.75, u); return { p: [Math.sin(a) * 0.4, lerp(0.17, 0.12, u), Math.cos(a) * 0.4], a: [0, 0.12, 0], fov: 32 }; }, focus: () => [0, 0.12, 0.05] },
      shave: { tone: OLD, env: ENV_TOP, cam: (t) => ({ p: [K(t, [[29.4, 0.04], [31.75, 0.0]]), K(t, [[29.4, 0.12], [31.75, 0.1]]), K(t, [[29.4, 0.44], [30.9, 0.36], [31.75, 0.4]])], a: [0, 0.016, 0.09], fov: 30 }), focus: () => [0, 0.015, R] },
      clad: { tone: NEW, cam: (t) => ({ p: [K(t, [[45.5, 0.05], [48.1, -0.02]]), 0.15, K(t, [[45.5, 0.34], [48.1, 0.42]])], a: [0, 0.12, 0], fov: 32 }), focus: () => [0, 0.12, 0.02] },
      count: { tone: NEW, cam: (t) => { const a = lerp(-0.6, 0.5, sm(t, 48.1, 50.7)); return { p: [Math.sin(a) * 0.36, 0.2, Math.cos(a) * 0.36], a: [0.03, 0.13, 0], fov: 34 }; }, focus: () => [0, 0.12, 0.05] },
    },
    update(t, camera, id) {
      show(id === 'mill' || id === 'shave' || id === 'sliver' ? 'old' : 'new');
      const sl = id === 'sliver';
      // the sliver shot replays the shave's strokes 4.8 s earlier on the smooth coin (no reeds to give it away)
      const tt = sl ? t + 4.8 : t;
      oldFlat.g.visible = sl && tt < 31.28; oldShaved.g.visible = sl && tt >= 31.28;
      jar.visible = spoon.visible = id === 'jar';
      quarter.g.visible = id === 'title' || id === 'clad' || id === 'count';
      shilling.g.visible = id === 'mill';
      flat.g.visible = id === 'shave' && t < 31.28; shaved.g.visible = id === 'shave' && t >= 31.28;
      spark.visible = id === 'shave' && t > 31.28 && t < 32.0; spark.scale.setScalar(0.025 * Math.sin(clamp((t - 31.28) / 0.7) * PI));
      file.visible = id === 'shave' || sl; label.s.visible = id === 'count'; filings.mesh.visible = id === 'shave' || sl;
      if (id === 'title') quarter.g.rotation.y = 0.5 + t * 0.55;
      if (id === 'mill') shilling.g.rotation.y = 0.2 + (t - 27.75) * 0.35;
      if (id === 'shave' || sl) {
        const t = tt;
        // rasp strokes across the top of the coin, then the file lifts away
        const k = clamp((t - 29.6) / 1.3), stroke = Math.sin(k * PI * 2 * 4.5) * 0.045 * (k > 0 && k < 1 ? 1 : 0);
        const lift = sm(t, 30.9, 31.2);
        file.position.set(0.0 + stroke, 0.016 + lift * 0.14, R + 0.008 + lift * 0.03); file.rotation.set(PI / 2, 0, 0.04);
        filings.begin();
        for (let i = 0; i < 120; i++) {
          const born = 29.6 + (i / 120) * 1.3, age = t - born;
          if (age < 0) continue;
          const y = Math.max(0.001, 0.02 - 0.5 * 9.8 * age * age * 0.2), dx = Math.sin(i * 2.7) * 0.06 + Math.sin(i) * age * 0.03;
          filings.add(dx, y, R + 0.012 + Math.abs(Math.cos(i * 1.3)) * 0.03 + age * 0.02, i, i * 0.7, i * 1.3, 1);
        }
        filings.commit();
      }
      if (id === 'jar') {
        // lid off (51.6-52.1), the spoon comes down (53.0), can't get in without tearing the foil (53.75), scoops (54.1-54.6)
        const off = sm(t, 51.55, 52.1);
        lid.position.set(-0.32 * off, JH + 0.035 + 0.22 * Math.sin(off * PI * 0.5) - 0.05 * off, 0.08 * off); lid.rotation.z = 0.5 * off;
        lid.visible = off < 0.98;
        const rip = t >= 53.75; seal.visible = !rip; torn.visible = rip;
        const down = sm(t, 52.9, 53.75), dip = sm(t, 53.75, 53.95), up = sm(t, 54.15, 54.6);
        spoon.position.set(lerp(0.3, 0.02, down), JH + lerp(0.32, 0.03, down) - 0.06 * dip + 0.2 * up, lerp(0.05, -0.12, down));
        spoon.rotation.set(0.35 - 0.25 * up, 0, lerp(-0.6, -0.2, down));
        spoon.userData.scoop.visible = up > 0.05;
      }
      if (id === 'clad') {
        // edge-on (the copper core shows as a stripe), then it turns to show the date
        quarter.g.rotation.y = K(t, [[45.5, PI / 2 - 0.2], [46.3, PI / 2 - 0.1], [46.9, 0.35], [48.1, 0.25]]);
      }
      if (id === 'count') {
        quarter.g.rotation.y = 1.25 + (t - 48.1) * 0.25;
        // float the count in the clear band right of centre, at the focus distance (so it is sharp)
        const f = camera.getWorldDirection(V1), rt = V2.crossVectors(f, camera.up).normalize(), up = V3.crossVectors(rt, f);
        label.s.position.copy(camera.position).addScaledVector(f, 0.33).addScaledVector(rt, 0.022).addScaledVector(up, 0.012);
        root.worldToLocal(label.s.position);
        label.set(Math.round(119 * sm(t, 48.95, 50.15)));
      }
    },
  };
}
