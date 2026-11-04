// Tavern beats: the keeper holds the clipped coin next to a coat button (same size), and Newton undercover behind a
// Gazette with eye holes, watching two coiners whisper over a bag of fakes. v2: 'hook' = the opening 4.85 s in one camera
// (Newton raises the paper → push in on the eye holes → whip to the coiners), 'informant' = two years of tip-offs.
import * as THREE from 'three';
import { buildTavern, TAVERN } from '@engine/sets/toon1690/tavern.js';
import { makeToonX, handFront, KEEPER, NEWTON_DISGUISED, CLIPPER, MP2, SHOPPER } from '@engine/toon/kit.js';
import { lidAt, cardPoint } from '@engine/toon/cards.js';
import { makeCoin, makeButton } from '@engine/toon/coins.js';
import { GRADE_NIGHT } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { MOOD } from '@engine/toon/mood.js';
import { K, PI, sm, lerp, makeGazette, HOLE_DX, HOLE_V } from './util.js';

const COINER2 = { ...CLIPPER, jacket: '#4a5a4a', front: [['knitCap', '#3a4a6a'], ['moustache', '#2a1e19', 0.8]] };
const NT = TAVERN.tables.newton, CT = TAVERN.tables.coiners;
const CAMS = {
  button: (t) => ({ p: [2.3, 1.62, K(t, [[13.9, 0.35], [15.0, 0.15], [15.6, -0.25], [16.15, -0.32]])], a: [2.38, 1.5, -1.9], fov: 38 }),
  // ease-out bursts between three framings: medium on Newton, the eye holes, the coiners' table (the stakes)
  hook: (t) => ({ p: [K(t, [[0, -1.72], [0.9, -1.82], [1.15, -2.02], [2.4, -2.06], [2.75, -0.25], [4.85, -0.38]]), K(t, [[0, 1.42], [0.9, 1.4], [1.15, 1.33], [2.4, 1.32], [2.75, 1.55], [4.85, 1.52]]), K(t, [[0, -0.4], [0.9, -0.6], [1.15, -1.18], [2.4, -1.26], [2.75, 0.2], [4.85, -0.15]])],
    a: [K(t, [[0, -2.4], [2.4, -2.4], [2.75, -0.68]]), K(t, [[0, 1.12], [0.9, 1.15], [1.15, 1.27], [2.4, 1.27], [2.75, 1.2]]), K(t, [[0, -2.0], [2.4, -2.0], [2.75, -3.0]])], fov: K(t, [[0, 42], [0.9, 40], [1.15, 34], [2.4, 34], [2.75, 44]]) }),
  informant: (t) => ({ p: [K(t, [[35.0, -1.5], [38.55, -1.62]]), 1.32, K(t, [[35.0, 0.6], [38.55, 0.25]])], a: [-2.2, 1.25, -2.1], fov: 38 }),
  disguise: (t) => ({ p: [K(t, [[33.0, 0.2], [34.6, -1.0], [36.85, -1.7]]), K(t, [[33.0, 1.6], [34.6, 1.42], [36.85, 1.36]]), K(t, [[33.0, 1.3], [34.6, 0.6], [36.85, -0.1]])],
    a: [K(t, [[33.0, -0.8], [34.0, -1.2], [34.6, -2.2], [36.85, -2.4]]), K(t, [[33.0, 1.2], [36.85, 1.22]]), K(t, [[33.0, -3.0], [34.0, -2.8], [34.6, -2.1], [36.85, -2.0]])], fov: 46 }),
};

export function makeTavern(root) {
  const S = buildTavern(root);
  // (toon look v3) fire- and candle-warm against moon-blue windows; pewter reflects both; dust + embers by the fire
  const ENV = { top: '#5a4038', horizon: '#b07a58', ground: '#3a2620', lights: [{ dir: [0.1, 0.4, 1], color: '#ffd8a8', intensity: 3, size: 8 }, { dir: [0.86, 0.32, -0.41], color: '#ff9a50', intensity: 6, size: 3 }, { dir: [0, 1, 0.2], color: '#ffc890', intensity: 2, size: 6 }, { dir: [-0.6, 0.6, -0.6], color: '#c8d4ff', intensity: 2, size: 3 }] };
  const motes = [makeMotes(root, { ...MOOD.interior.motes, n: 180, box: [-3, 0.6, -3.5, 1.5, 2.6, 0.5], size: 0.007, intensity: 1.8 }),
    makeMotes(root, { n: 50, box: [1.6, 0.4, -3.5, 2.8, 2.4, -2.5], size: 0.01, color: 0xff9a40, intensity: 3, rise: 0.25, seed: 5 })];
  const keeper = makeToonX(KEEPER, { res: 2.6 }), newton = makeToonX(NEWTON_DISGUISED, { res: 2.4 });
  const c1 = makeToonX(CLIPPER, { res: 1.6 }), c2 = makeToonX(COINER2, { res: 1.6 }), d1 = makeToonX(MP2, { res: 1.4 }), d2 = makeToonX(SHOPPER, { res: 1.4 });
  const cast = [keeper, newton, c1, c2, d1, d2];
  for (const tn of cast) root.add(tn.root);
  const tiny = makeCoin({ r: 0.045, h: 0.006, kind: 'hammered', clip: 0.75, seed: 4 }); tiny.mesh.rotation.x = PI / 2; root.add(tiny.g);
  const button = makeButton(0.045 * 0.8); button.rotation.x = PI / 2; const btn = new THREE.Group(); btn.add(button); root.add(btn);
  const paper = makeGazette(root);
  const cam = new THREE.Vector3(), eyeL = new THREE.Vector3(), eyeR = new THREE.Vector3(), mid = new THREE.Vector3();
  return {
    look: { grade: GRADE_NIGHT, exposure: 1.0, near: 0.03, far: 40, bg: S.bg, fog: S.fog, cInf: 12, env: ENV, bloom: 0.3 }, shafts: S.shafts, motes,
    tone: { lit: [1.16, 0.92, 0.68], shade: [0.16, 0.18, 0.42], sat: 0.88, term: 0.25, lambert: 0.4, rim: [0.26, 0.34, 0.72], charTint: [1.0, 0.88, 0.76], charShade: 0.56, charGain: 0.98, headGrad: 0.36, bodyGrad: 0.46 },
    shots: {
      button: { cam: CAMS.button, focus: () => [2.4, 1.5, -1.9], cInf: 16 },
      hook: { cam: CAMS.hook, focus: (t) => (t < 2.55 ? [NT[0] - 0.1, 1.25, NT[1] - 0.6] : [CT[0], 1.2, CT[1] - 0.5]), cInf: 12 },
      informant: { cam: CAMS.informant, focus: () => [NT[0] - 0.05, 1.25, NT[1] - 0.55], cInf: 12, slab: 0.5 },
      disguise: { cam: CAMS.disguise, focus: (t) => (t < 34.2 ? [CT[0], 1.2, CT[1] - 0.5] : [NT[0], 1.2, NT[1] - 0.6]), cInf: 12, slab: 0.9 },
    },
    update(t, camera, id) {
      for (const tn of cast) tn.face(camera, S.sun);
      for (const tn of cast) tn.root.visible = false;
      tiny.g.visible = btn.visible = paper.visible = false;
      const fl = 1 + 0.1 * Math.sin(t * 13) * Math.sin(t * 4.1);
      S.flames.forEach((f, i) => f.scale.set(1, fl * (0.9 + 0.2 * Math.sin(t * 9 + i)), 1)); S.fireGlow.scale.setScalar(3.2 * fl); S.fireLamp.intensity = 5.0 * fl;
      camera.getWorldPosition(cam);
      if (id === 'button') {
        keeper.root.visible = true; keeper.root.position.set(2.4, 0, -1.9);
        const look = K(t, [[14.2, -1], [14.9, -1], [15.2, 1], [15.7, 1], [15.95, -1]]);
        keeper.set({ expr: t > 15.15 ? 'o' : 'stern', face: { sweat: false }, blink: lidAt(t, 21), look, arms: { L: [195, 385], R: [405, 385], bend: -60 }, ol: 0.7 });
        keeper.face(camera); keeper.root.updateMatrixWorld(true);
        root.worldToLocal(handFront(keeper, 195, 360, camera, 0.07, tiny.g.position)); tiny.g.scale.setScalar(0.8); tiny.g.lookAt(cam); tiny.g.visible = true;
        root.worldToLocal(handFront(keeper, 405, 360, camera, 0.07, btn.position)); btn.lookAt(cam); btn.visible = true;
        // two drinkers at the far end of the bar
        for (const [tn, x, s] of [[d1, 0.9, 3], [d2, 3.75, 4]]) { tn.root.visible = true; tn.root.position.set(x, 0, -0.55); tn.set({ expr: 'neutral', blink: lidAt(t, s) }); tn.face(camera); }
      }
      if (id === 'disguise' || id === 'hook' || id === 'informant') {
        const hook = id === 'hook', inf = id === 'informant';
        newton.root.visible = true; c1.root.visible = c2.root.visible = !inf;
        newton.root.position.set(NT[0] - 0.1, -0.26, NT[1] - 0.6);
        // hook: the paper is still coming up at frame 0 (mid-action) and sits on his eyes by 0.5 s; informant: lowered
        const lower = hook ? 1 - sm(t, -0.3, 0.5) : inf ? 1 : sm(t, 35.75, 36.15);
        const look = hook ? K(t, [[0, 0.3], [1.3, 0], [1.55, -1], [1.95, -1], [2.15, 1], [4.85, 1]]) : inf ? -1 : lower > 0.5 ? 1 : K(t, [[33.5, 0.6], [34.6, 1], [35.2, 0.4]]);
        newton.set({ expr: inf ? (t > 36.4 && t < 36.95 ? 'o' : 'stern') : lower > 0.5 && !hook ? 'stern' : 'neutral', blink: hook && t < 0.4 ? 0 : lidAt(t, 17), look, arms: { L: [150, 520], R: [450, 520], bend: -50 }, ol: hook && t > 0.95 && t < 2.6 ? 0.7 : 0.85, noLegs: true });
        newton.face(camera); newton.root.updateMatrixWorld(true);
        // the Gazette floats in front of his face with its holes on his eyes (computed along the view rays)
        cardPoint(newton, 252, 219, eyeL); cardPoint(newton, 348, 219, eyeR); mid.addVectors(eyeL, eyeR).multiplyScalar(0.5);
        const dCard = cam.distanceTo(mid), dPaper = dCard - 0.14, k = dPaper / dCard;
        const sx = eyeL.distanceTo(eyeR) * k / (2 * HOLE_DX * 0.62);
        // position in set-local space first: lookAt() reads the world matrix, so a world position here would aim it sideways
        paper.scale.setScalar(sx); paper.position.copy(root.worldToLocal(cam.clone().lerp(mid, k))); paper.updateMatrixWorld(true);
        paper.lookAt(cam); paper.translateY(-(0.5 - HOLE_V) * 0.78 * sx - lower * 0.62); paper.visible = true;
        if (inf) {
          // tip-offs, one informant at a time: each leans in to his ear, whispers, and is gone
          const first = t < 36.95, tn = first ? d2 : d1, t0 = first ? 35.0 : 36.95;
          tn.root.visible = true; tn.root.position.set(NT[0] + 0.4, 0, NT[1] - 0.95);
          tn.pivot.rotation.z = 0.16 * sm(t, t0 + 0.1, t0 + 0.45);
          tn.set({ expr: first ? 'worried' : 'smug', face: { sweat: false }, blink: lidAt(t, first ? 4 : 3), look: -1, arms: { L: [120, 300], R: [430, 600], bend: -40 } });
          tn.face(camera);
        } else {
          c1.root.position.set(CT[0] - 0.35, -0.26, CT[1] - 0.6); c2.root.position.set(CT[0] + 0.35, -0.26, CT[1] - 0.6);
          c1.pivot.rotation.z = 0.08 * (hook ? 1 : sm(t, 33.4, 33.8)); c2.pivot.rotation.z = -0.1;
          c1.set({ expr: 'smug', blink: lidAt(t, 31), look: 1, noLegs: true, arms: { L: [170, 560], R: [460, 470], bend: -30 } });
          // hook: the second coiner glances up at "hunting a forger", as if he felt the eyes on him
          const spooked = hook ? t > 3.95 : t > 35.9;
          c2.set({ expr: spooked ? 'worried' : 'grin', face: { sweat: spooked }, blink: lidAt(t, 33), look: -1, noLegs: true });
          c1.face(camera); c2.face(camera);
        }
      }
    },
  };
}
