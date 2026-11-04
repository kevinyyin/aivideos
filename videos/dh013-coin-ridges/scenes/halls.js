// Parliament (Chaloner at the bar calls the Mint incompetent, pointing at Newton, a wall of MPs gasps) and the Old
// Bailey (the jury foreman stands: GUILTY; Chaloner in the spiked dock, a warder's hand lands on his shoulder).
import * as THREE from 'three';
import { buildParliament, buildCourt, verdictTex, PARL, COURT } from '@engine/sets/toon1690/hall.js';
import { makeToonX, CHALONER, NEWTON, MP, MP2, CLERKX, WARDER, SHOPPER, BAKER, TAILOR } from '@engine/toon/kit.js';
import { lidAt, makeStickArm, cardPoint } from '@engine/toon/cards.js';
import { NOINK } from '@engine/toon/ink.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { MOOD } from '@engine/toon/mood.js';
import { K, PI, sm, lerp, boing } from './util.js';

/** extra cards that share a master toon's canvas (a crowd of identical-state faces costs one drawing) */
function crowd(root, master, spots) {
  return spots.map(([x, y, z]) => {
    const r = new THREE.Group(), pv = new THREE.Group(), m = new THREE.Mesh(master.mesh.geometry, master.mat);
    m.position.copy(master.mesh.position); m.layers.set(NOINK); m.customDepthMaterial = master.mesh.customDepthMaterial;
    pv.add(m); r.add(pv); r.position.set(x, y, z); root.add(r);
    return { root: r, face(cam) { const p = r.getWorldPosition(new THREE.Vector3()), c = cam.getWorldPosition(new THREE.Vector3()); pv.rotation.y = Math.atan2(c.x - p.x, c.z - p.z); } };
  });
}
const SEAT = -0.26, F = new THREE.Vector3(), R3 = new THREE.Vector3(), U3 = new THREE.Vector3();   // a seated card's root offset from the seat height

export function makeParl(root) {
  const S = buildParliament(root);
  // (toon look v3) cool window light against warm chandeliers; the gold mace + brass rail reflect both; dust in the shafts
  const ENV = { top: '#5a5868', horizon: '#c8b8a0', ground: '#4a3c32', lights: [{ dir: [-0.47, 0.47, -0.72], color: '#eef4ff', intensity: 6, size: 4 }, { dir: [0, 1, 0.1], color: '#ffd8a0', intensity: 4, size: 2 }] };
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 240, box: [-3, 0.8, -5, 3, 4, 3], size: 0.01, intensity: 1.8 });
  const chal = makeToonX(CHALONER, { res: 2.2 }), newton = makeToonX(NEWTON, { res: 2.0 });
  const masters = [MP, MP2, CLERKX].map((o) => makeToonX(o, { res: 1.1 }));
  for (const tn of [chal, newton, ...masters]) root.add(tn.root);
  const X = PARL.cross, spots = [[], [], []];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 7; j++) spots[(i + j) % 3].push([-2.1 + j * 0.7 + (i % 2) * 0.35, X.y[i] + SEAT, X.z[i] - 0.05]);
  const mps = masters.map((m, k) => { m.root.position.set(...spots[k][0]); return [m, crowd(root, m, spots[k].slice(1))]; });
  const cam = (t) => ({ p: [K(t, [[38.95, 0.35], [41.25, 0.22]]), K(t, [[38.95, 1.85], [41.25, 1.72]]), K(t, [[38.95, -2.7], [41.25, -2.1]])], a: [0.1, 1.42, 1.2], fov: 52 });
  // v2: the laughing benches, close, with Chaloner smirking in the foreground
  const laughCam = (t) => ({ p: [K(t, [[41.4, -1.3], [43.3, -1.15]]), 1.7, K(t, [[41.4, -1.3], [43.3, -1.0]])], a: [-0.4, 1.55, 2.0], fov: 40 });
  const base = new Map();
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.05, far: 40, bg: S.bg, fog: S.fog, cInf: 10, env: ENV, bloom: 0.35 }, shafts: S.shafts, motes: [motes],
    tone: { lit: [1.38, 1.24, 1.02], shade: [0.42, 0.46, 0.72], sat: 0.88, term: 0.22, lambert: 0.4, rim: [0.14, 0.16, 0.24], charTint: [1.0, 0.96, 0.92], charShade: 0.64, charGain: 0.98, headGrad: 0.34, bodyGrad: 0.45 },
    shots: { parl: { cam, focus: () => [0, 1.5, 0.3], cInf: 10, slab: 1.2 }, laugh: { cam: laughCam, focus: () => [-0.2, 1.4, 1.6], cInf: 10, slab: 1.4 } },
    update(t, camera) {
      for (const tn of [chal, newton, ...masters]) tn.face(camera, S.sun);
      // (v2) the House laughs on "mocked" (τ 41.9 = 7.85 s): grins + a shaking bob
      const gasp = t > 41.9;
      chal.root.position.set(-0.15, 0, PARL.bar[1]);
      const talk = Math.floor(t * 7) % 2 === 0;
      chal.set({ expr: 'smug', face: { mouth: t < 41.95 && talk ? 'o' : 'smirk' }, blink: lidAt(t, 61), look: -1, arms: { L: [10, 330], R: [420, 560], bend: 0 } });
      newton.root.position.set(0.55, 0, -0.2);
      newton.set({ expr: t > 41.95 ? 'stern' : 'neutral', blink: lidAt(t, 51), look: -1, arms: { L: [190, 560], R: [420, 560], bend: -30 } });
      mps.forEach(([m, clones], k) => {
        m.set({ expr: gasp ? 'grin' : 'neutral', blink: 0, look: -0.5, noLegs: true });
        [m, ...clones].forEach((c, j) => {
          if (!base.has(c)) base.set(c, c.root.position.y);
          c.root.position.y = base.get(c) + (gasp ? 0.025 * Math.abs(Math.sin(t * 13 + k * 1.7 + j * 2.3)) : 0);
          c.face(camera);
        });
      });
      chal.face(camera); newton.face(camera);
    },
  };
}

export function makeCourt(root) {
  const S = buildCourt(root);
  // (toon look v3) candle-warm key against cool shadows; brass candelabra + iron spikes reflect the flames
  const ENV = { top: '#5a4a48', horizon: '#b08a68', ground: '#3a2a24', lights: [{ dir: [0.1, 0.4, 1], color: '#ffd8a8', intensity: 3, size: 8 }, { dir: [0, 1, 0.2], color: '#ffd8a8', intensity: 2, size: 6 }, { dir: [0.6, 0.53, 0.6], color: '#ffd8a0', intensity: 5, size: 3 }, { dir: [-0.5, 0.5, -0.7], color: '#9ab0e0', intensity: 1.5, size: 4 }] };
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 200, box: [-3, 0.8, -3.5, 3, 3.2, 2], size: 0.008, intensity: 1.8 });
  const chal = makeToonX(CHALONER, { res: 2.4 }), warder = makeToonX(WARDER, { res: 2.0 }), fore = makeToonX(BAKER, { res: 1.8 });
  const masters = [TAILOR, SHOPPER, MP].map((o) => makeToonX(o, { res: 1.2 }));
  for (const tn of [chal, warder, fore, ...masters]) root.add(tn.root);
  const J = COURT.jury, jz = (k) => J[1] - 1.1 + k * 0.72;
  // jurors: front row x J+0.05 (seat 0.45), back row x J+0.65 (seat 0.75); the foreman is front row, seat 2
  const spots = [[J[0] + 0.05, 0.45 + SEAT, jz(0)], [J[0] + 0.05, 0.45 + SEAT, jz(1)], [J[0] + 0.05, 0.45 + SEAT, jz(3)], [J[0] + 0.65, 0.75 + SEAT, jz(0.5)], [J[0] + 0.65, 0.75 + SEAT, jz(1.5)], [J[0] + 0.65, 0.75 + SEAT, jz(2.5)]];
  const jurors = masters.map((m, k) => { m.root.position.set(...spots[k]); return [m, crowd(root, m, [spots[k + 3]])]; });
  const card = new THREE.Sprite(new THREE.SpriteMaterial({ map: verdictTex('GUILTY'), transparent: true, depthWrite: false, toneMapped: false }));
  card.layers.set(NOINK); root.add(card);
  const hand = makeStickArm(root, { hand: 22, width: 14 });
  const cams = {
    // (v2) the move runs to 43.6: v2 holds this shot until τ 43.55, and it froze after 42.4
    jury: (t) => ({ p: [K(t, [[41.25, 0.75], [43.6, 1.2]]), 1.5, K(t, [[41.25, -0.15], [43.6, -0.45]])], a: [J[0] + 0.3, 1.3, J[1] - 0.25], fov: 50 }),
    // from the back of the room: Chaloner sweating in the dock (left), the jury out across the room (right)
    wide: (t) => ({ p: [K(t, [[38.55, -0.6], [40.3, -0.5]]), K(t, [[38.55, 2.3], [40.3, 2.2]]), K(t, [[38.55, 2.8], [40.3, 2.55]])], a: [1.5, 1.35, -0.6], fov: 40 }),
    // (v2) the push starts at 41.0: v2 opens this shot at τ 41.0, and a camera clamped until 42.4 froze for 0.6 s
    dock: (t) => ({ p: [K(t, [[41.0, 0.46], [43.75, 0.35]]), 1.78, K(t, [[41.0, -1.85], [43.75, -0.95]])], a: [COURT.dock[0], 1.55, COURT.dock[1] + 0.1], fov: 44 }),
  };
  const D = COURT.dock;
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.05, far: 40, bg: S.bg, fog: S.fog, cInf: 10, env: ENV, bloom: 0.35 }, motes: [motes],
    tone: { lit: [1.0, 0.84, 0.64], shade: [0.2, 0.2, 0.42], sat: 0.88, term: 0.22, lambert: 0.4, rim: [0.18, 0.2, 0.4], charTint: [1.0, 0.9, 0.78], charShade: 0.58, charGain: 0.98, headGrad: 0.36, bodyGrad: 0.46 },
    shots: {
      wide: { cam: cams.wide, focus: () => [D[0], 1.6, D[1]], cInf: 10, slab: 2.5 },
      jury: { cam: cams.jury, focus: () => [J[0] + 0.1, 1.3, jz(2)], cInf: 12, slab: 1.0 },
      dock: { cam: cams.dock, focus: () => [D[0], 1.6, D[1]], cInf: 14, slab: 0.6 },
    },
    update(t, camera, id) {
      for (const tn of [chal, warder, fore, ...masters]) tn.face(camera, S.sun);
      const inJury = id === 'jury', wide = id === 'wide', showJ = inJury || wide;
      fore.root.visible = showJ; card.visible = inJury;
      for (const [m, c] of jurors) { m.root.visible = showJ; for (const x of c) x.root.visible = showJ; }
      chal.root.visible = !inJury;
      // the wide keeps the warder out: he would stand between the lens and the jury
      warder.root.visible = hand.arm.visible = hand.ball.visible = !inJury && !wide;
      if (showJ) {
        const up = inJury ? sm(t, 41.6, 41.85) : 0;
        fore.root.position.set(J[0] + 0.05, lerp(0.45 + SEAT, 0.0, up), jz(2));
        fore.set({ expr: up > 0.5 ? 'stern' : 'neutral', blink: lidAt(t, 71), look: -1, noLegs: up < 0.5, arms: up > 0.5 ? { L: [170, 600], R: [470, 420], bend: -40 } : undefined });
        fore.face(camera);
        for (const [m, clones] of jurors) { m.set({ expr: t > 42.1 ? 'o' : 'neutral', blink: lidAt(t, 73), look: 0.6, noLegs: true }); m.face(camera); for (const c of clones) c.face(camera); }
        const k = inJury ? boing(t, 42.0, 0.4) : 0;
        card.visible = k > 0.01; card.scale.set(0.8 * k, 0.4 * k, 1);
        // the card floats in the clear band above the jury, placed from the camera so it never crops
        camera.getWorldDirection(F); R3.crossVectors(F, camera.up).normalize(); U3.crossVectors(R3, F);
        card.position.copy(camera.position).addScaledVector(F, 1.9).addScaledVector(R3, 0.05).addScaledVector(U3, 0.42); root.worldToLocal(card.position);
      }
      if (!inJury) {
        chal.root.position.set(D[0], COURT.dockFloor, D[1]);
        chal.set({ expr: wide ? 'worried' : 'o', face: { sweat: true }, blink: lidAt(t, 61), look: K(t, [[42.6, 0], [42.8, 1]]), arms: { L: [210, 560], R: [390, 560], bend: -30 }, ol: 0.85 });
        warder.root.position.set(D[0] + 0.6, COURT.dockFloor, D[1] + 0.4);
        warder.set({ expr: 'stern', blink: lidAt(t, 75), look: -1, arms: { L: null, R: [430, 600] } });
        chal.face(camera); warder.face(camera); chal.root.updateMatrixWorld(true); warder.root.updateMatrixWorld(true);
        const grab = wide ? 1 : sm(t, 42.55, 42.8);
        const shoulder = cardPoint(warder, 230, 400), target = cardPoint(chal, 400, 395);
        hand.set(shoulder, shoulder.clone().lerp(target, lerp(0.35, 1, grab)));
      }
    },
  };
}
