// The one-or-two-shot places: the night train to Austria (Lustig fanning seventy 1,000-franc notes), the liner arriving
// in New York (he tips his hat at the rail), the club door ("you" hand the bouncer twenty bucks and the rope opens),
// Alcatraz at dusk, his cell years later (older, prisoner 300, a Paris postcard on the wall) and the records desk with
// his death certificate.
import * as THREE from 'three';
import { buildTrain, TRAIN } from '@engine/sets/toon1925/train.js';
import { buildDeck, DECK } from '@engine/sets/toon1925/deck.js';
import { buildClub, CLUB } from '@engine/sets/toon1925/club.js';
import { buildIsland, buildCell, CELL } from '@engine/sets/toon1925/alcatraz.js';
import { lidAt } from '@engine/toon/cards.js';
import { GRADE_RICH, GRADE_NIGHT } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { makeSky } from '@engine/toon/sky.js';
import { MOOD } from '@engine/toon/mood.js';
import { toon, paper, TEX, makeFan, makeSuitcase } from '../cast.js';
import { K, PI, sm, boing, phase, place, hold, lerp } from './util.js';

export function makeTrain(root) {
  const S = buildTrain(root);
  const lus = toon('lustig', { res: 2.6, blob: false }); root.add(lus.root);
  const fan = makeFan(root, 7, 1.5), suit = makeSuitcase(root, 'WIEN'); suit.position.set(-0.1, 0.55, 0.62); suit.rotation.y = 0.2;
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 90, box: [-1, 0.6, -0.9, 1, 2.3, 0.9], size: 0.006 });
  return {
    look: { grade: GRADE_NIGHT, exposure: 1.0, near: 0.03, far: 30, bg: S.bg, fog: null, cInf: 6, env: MOOD.night.env, bloom: 0.35 }, motes: [motes],
    tone: { lit: [0.9, 0.95, 1.3], shade: [0.2, 0.22, 0.5], sat: 0.9, term: 0.25, lambert: 0.4, rim: [0.3, 0.4, 0.8], charTint: [0.98, 0.94, 0.98], charShade: 0.62, charGain: 1.0, headGrad: 0.34, bodyGrad: 0.46 },
    shots: { train: { cam: (t) => ({ p: [K(t, [[29.99, 0.98], [32.26, 0.9]]), 1.5, K(t, [[29.99, 0.95], [32.26, 0.75]])], a: [-0.75, 1.3, -0.45], fov: 52 }), focus: () => [-0.5, 1.3, -0.72] } },
    update(t, camera) {
      S.update(t, 1.6);
      lus.face(camera, S.sun);
      place(lus, [TRAIN.seatA[0], 0, TRAIN.seatA[1] - 0.05], -0.25);
      const fanK = sm(t, 30.9, 31.5);
      lus.set({ expr: t > 31.4 ? 'grin' : 'smug', blink: lidAt(t, 31), look: t > 30.9 ? 1 : -1, noLegs: true, arms: { L: [120, 300], R: [460, 560], bend: -40 }, add: t > 31.5 ? ['stars'] : [] });
      lus.face(camera, S.sun);
      hold(root, fan.g, lus, 120, 300, camera, 0.07); fan.g.rotation.set(0, 0, 0); fan.g.lookAt(camera.position);
      fan.spread(0.25 + 0.75 * fanK);
    },
  };
}

export function makeDeck(root) {
  const S = buildDeck(root);
  const SUN = [-0.5, 0.45, -0.75];
  const sky = makeSky(root, { ...MOOD.day.sky, top: '#5d8fd0', mid: '#b2c6de', horizon: '#f6cf9c', haze: 0.26, sun: { ...MOOD.day.sky.sun, dir: [0.4, 0.2, 1] }, clouds: { ...MOOD.day.sky.clouds, bottom: '#f3d7c0', n: 9, az: [-60, 60], el: [6, 26], dist: 600, size: 150 } });
  const lus = toon('lustigHat', { res: 2.6, outfit: 'lustig' }); root.add(lus.root); root.add(lus.blob);
  const suit = makeSuitcase(root, 'NEW YORK');
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.05, far: 1400, bg: S.bg, fog: S.fog, cInf: 6, env: MOOD.day.env, bloom: 0.25 }, sky,
    tone: { lit: [1.5, 1.3, 1.08], shade: [0.48, 0.52, 0.84], sat: 0.95, term: 0.22, lambert: 0.35, rim: [0.3, 0.24, 0.2], charTint: [1.0, 0.96, 0.92], charShade: 0.64, charGain: 0.96, headGrad: 0.34, bodyGrad: 0.46 },
    shots: { america: { cam: (t) => ({ p: [K(t, [[38.85, -1.6], [40.35, -2.0]]), 1.55, K(t, [[38.85, -2.0], [40.35, -2.3]])], a: [0.0, 1.85, 4.0], fov: 46 }), focus: () => [-0.6, 1.5, 1.0], cInf: 3 } },
    update(t, camera) {
      S.update(t);
      lus.face(camera, S.sun); place(lus, [-0.55, 0, 1.05]);
      const tip = boing(t, 39.75, 0.4);
      lus.set({ expr: t > 39.7 ? 'grin' : 'smug', blink: lidAt(t, 31), look: -1, arms: { L: [130, 560], R: t > 39.6 ? [430, 130 + 30 * (1 - tip)] : [460, 560], bend: -30 } });
      lus.face(camera, S.sun);
      suit.position.set(-1.05, 0, 1.15); suit.rotation.y = 0.3;
      void DECK;
    },
  };
}

export function makeClub(root) {
  const S = buildClub(root);
  const bnc = toon('bouncer', { res: 2.4 }), you = toon('you', { res: 2.4 }), q = ['q1', 'q2', 'q3', 'q4'].map((k) => toon(k, { res: 1.6 }));
  const cast = [bnc, you, ...q];
  for (const tn of cast) { root.add(tn.root); root.add(tn.blob); }
  const bill = paper(root, 0.19, 0.08, TEX.dollar());
  const motes = makeMotes(root, { n: 120, box: [-4, 0.5, -0.4, 4, 4, 3], size: 0.01, color: 0xff9ad8, intensity: 2.2, rise: 0.05 });
  const youX = (t) => (t < 54.1 ? 1.9 : lerp(1.9, CLUB.door[0] + 0.1, sm(t, 54.1, 55.2)));
  return {
    look: { grade: GRADE_NIGHT, exposure: 1.0, near: 0.05, far: 60, bg: S.bg, fog: S.fog, cInf: 8, env: { ...MOOD.night.env, lights: [{ dir: [0, 0.6, -1], color: '#ff6ac8', intensity: 6, size: 3 }, { dir: [1, 0.8, 1], color: '#ffd4a0', intensity: 5, size: 2 }] }, bloom: 0.45 },
    motes: [motes],
    tone: { lit: [1.05, 0.9, 1.25], shade: [0.2, 0.18, 0.46], sat: 0.95, term: 0.25, lambert: 0.4, rim: [0.6, 0.25, 0.6], charTint: [1.0, 0.92, 1.0], charShade: 0.62, charGain: 1.0, headGrad: 0.34, bodyGrad: 0.46 },
    shots: {
      bouncer: { cam: (t) => ({ p: [K(t, [[51.64, 1.65], [53.7, 1.6]]), 1.5, K(t, [[51.64, 4.5], [53.7, 4.1]])], a: [1.6, 1.32, 1.1], fov: 42 }), focus: () => [1.6, 1.35, 1.3], slab: 0.6 },
      skip: { cam: (t) => ({ p: [K(t, [[53.7, 2.9], [55.43, 2.6]]), 1.7, K(t, [[53.7, 4.7], [55.43, 4.3]])], a: [0.3, 1.35, 0.6], fov: 50 }), focus: () => [0.9, 1.4, 1.1], slab: 2.4 },
    },
    update(t, camera, id) {
      for (const tn of cast) { tn.root.visible = false; tn.blob.visible = false; }
      for (const tn of cast) tn.face(camera, S.sun);
      bill.visible = false;
      place(bnc, [1.3, 0, 1.25]);
      const give = sm(t, 52.75, 53.1), open = sm(t, 53.75, 54.15);
      S.rope.userData.open(open);
      bnc.set({ expr: give > 0.9 ? 'smug' : 'stern', blink: lidAt(t, 81), look: 1, arms: id === 'skip' && t > 53.7 ? { L: [140, 560], R: [560, 420], bend: 0 } : { L: [330, 470], R: give > 0 ? [520, 430] : [270, 480], bend: -50 } });
      place(you, [youX(t), 0, 1.45]);
      you.set({ expr: id === 'skip' ? 'grin' : 'smug', blink: lidAt(t, 82), look: -1, walk: t > 54.1 && t < 55.2 ? phase(1.9 - youX(t)) : null, arms: id === 'bouncer' ? { L: give < 1 ? [90, 430] : [140, 560], R: [460, 560], bend: -20 } : { L: [140, 560], R: [460, 560], bend: -20 } });
      q.forEach((tn, i) => { place(tn, [-0.5 - i * 0.75, 0, CLUB.queueZ + (i % 2) * 0.15]); tn.set({ expr: id === 'skip' && t > 54.3 ? 'o' : 'neutral', blink: lidAt(t, 90 + i), look: 1 }); });
      bnc.face(camera); you.face(camera);
      if (id === 'bouncer' && give < 1) {
        const a = hold(root, new THREE.Object3D(), you, 90, 430, camera, 0.06).clone(), b = hold(root, new THREE.Object3D(), bnc, 520, 430, camera, 0.06).clone();
        bill.position.lerpVectors(a, b, give); bill.position.y += Math.sin(give * PI) * 0.06; bill.lookAt(camera.position); bill.visible = true;
      }
      for (const tn of cast) if (tn.root.visible) tn.face(camera, S.sun);
    },
  };
}

export function makeIsland(root) {
  const S = buildIsland(root);
  const sky = makeSky(root, { ...MOOD.sunset.sky, sun: { ...MOOD.sunset.sky.sun, dir: [-0.6, 0.12, -1] }, clouds: { ...MOOD.sunset.sky.clouds, n: 8, az: [-80, 60], dist: 900, size: 260 } });
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.5, far: 2600, bg: S.bg, fog: S.fog, cInf: 2, env: MOOD.sunset.env, bloom: 0.4 }, sky,
    tone: MOOD.sunset.tone,
    shots: { island: { cam: (t) => ({ p: [K(t, [[55.43, 34], [57.3, 28]]), K(t, [[55.43, 33], [57.3, 37]]), K(t, [[55.43, 130], [57.3, 116]])], a: [-2, 16, 0], fov: 50 }), focus: () => [0, 16, 0], cInf: 1 } },
    update(t) { S.update(t); },
  };
}

export function makeCell(root) {
  const S = buildCell(root);
  const old = toon('lustigOld', { res: 2.4, blob: false }); root.add(old.root);
  const card = paper(root, 0.2, 0.28, TEX.postcard()); card.position.set(0.0, 1.55, -1.47); card.rotation.z = 0.06;
  const cert = paper(root, 0.45, 0.55, TEX.cert(0)); cert.rotation.set(-PI / 2, 0, -0.03); cert.position.set(CELL.desk[0] + 0.05, 0.808, CELL.desk[1] + 0.02);
  return {
    look: { grade: GRADE_NIGHT, exposure: 1.0, near: 0.03, far: 40, bg: S.bg, fog: null, cInf: 8, env: MOOD.night.env, bloom: 0.3 },
    tone: { lit: [0.95, 0.98, 1.2], shade: [0.2, 0.22, 0.42], sat: 0.8, term: 0.25, lambert: 0.4, rim: [0.2, 0.25, 0.5], charTint: [0.96, 0.94, 0.98], charShade: 0.62, charGain: 1.0, headGrad: 0.34, bodyGrad: 0.46 },
    shots: {
      cell: { cam: (t) => ({ p: [K(t, [[57.3, 0.3], [59.44, 0.1]]), 1.5, K(t, [[57.3, 2.4], [59.44, 2.0]])], a: [-0.45, 1.15, -0.5], fov: 44 }), focus: () => [-0.6, 1.1, -0.4], cInf: 10 },
      postcard: { cam: (t) => ({ p: [K(t, [[59.44, 0.05], [60.8, 0.02]]), 1.56, K(t, [[59.44, -0.55], [60.8, -0.75]])], a: [0.0, 1.55, -1.47], fov: 40 }), focus: () => [0.0, 1.55, -1.47], cInf: 18 },
      cert: { cam: (t) => ({ p: [CELL.desk[0] + 0.05, K(t, [[60.8, 2.25], [62.4, 2.1], [64.9, 1.8]]), CELL.desk[1] + K(t, [[60.8, 0.42], [62.4, 0.36], [64.9, 0.36]])], a: [CELL.desk[0] + K(t, [[62.4, 0.05], [64.9, 0.03]]), 0.81, CELL.desk[1] + K(t, [[60.8, -0.02], [62.4, 0.0], [64.9, 0.06]])], fov: 40 }), focus: () => [CELL.desk[0], 0.81, CELL.desk[1]], cInf: 24 },
    },
    update(t, camera, id) {
      old.root.visible = id === 'cell';
      if (id === 'cell') { place(old, [CELL.bunk[0] + 0.1, 0, CELL.bunk[1]], -0.08); old.face(camera, S.sun); old.set({ expr: 'neutral', blink: lidAt(t, 91), look: 1, noLegs: true, arms: { L: [150, 560], R: [450, 560], bend: -30 } }); old.face(camera, S.sun); }
      cert.material.map = TEX.cert(id === 'cert' ? sm(t, 62.6, 63.3) : 0);
      S.deskLamp.intensity = id === 'cert' ? 1.1 : 3.0; S.deskGlow.visible = id !== 'cert';
    },
  };
}
