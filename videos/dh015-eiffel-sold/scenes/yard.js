// Poisson's scrap yard: his wife by the office door, arms crossed, nose wrinkled at the deal (it smells fishy: stink
// lines); Poisson outside the gate walking up to the police call post, seeing the gendarme, and turning back red-faced
// behind his hat; the question beat — a push-in on Poisson, his wife still glaring behind him.
import * as THREE from 'three';
import { buildYard, YARD } from '@engine/sets/toon1925/yard.js';
import { lidAt } from '@engine/toon/cards.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { makeSky } from '@engine/toon/sky.js';
import { MOOD } from '@engine/toon/mood.js';
import { toon } from '../cast.js';
import { K, sm, phase, place } from './util.js';

const WIFE = [-3.0, 0, -1.25], POI = [-2.0, 0, -0.9];
const walkX = (t) => (t < 33.25 ? 5.95 + (t - 32.26) * 1.16 : 7.1 - Math.max(0, t - 33.6) * 0.9);
const CAMS = {
  wife: (t) => ({ p: [-2.5, 1.6, K(t, [[26.19, 2.35], [28.31, 2.1]])], a: [-2.5, 1.45, -1.1], fov: 48 }),
  shame: (t) => ({ p: [K(t, [[32.26, 3.0], [34.69, 3.4]]), 1.65, 5.9], a: [8.0, 1.4, 4.0], fov: 44 }),
  question: (t) => ({ p: [K(t, [[40.35, -1.7], [42.7, -1.85]]), K(t, [[40.35, 1.6], [42.7, 1.55]]), K(t, [[40.35, 2.35], [42.7, 1.1]])], a: [-2.25, 1.55, -1.0], fov: K(t, [[40.35, 48], [42.7, 40]]) }),
};

export function makeYard(root) {
  const S = buildYard(root);
  const SUN = [0.55, 0.6, 0.6];
  const sky = makeSky(root, { ...MOOD.day.sky, sun: { ...MOOD.day.sky.sun, dir: SUN }, clouds: { ...MOOD.day.sky.clouds, n: 10, az: [-160, 160], el: [8, 30], dist: 90, size: 34 } });
  const motes = makeMotes(root, { ...MOOD.day.motes, n: 220, box: [-6, 0.3, -4, 9, 3.4, 6], intensity: 1.5, color: 0xffe8c0 });
  const wife = toon('wife', { res: 2.4 }), poi = toon('poisson', { res: 2.4 }), gend = toon('gendarme', { res: 2.0 });
  const cast = [wife, poi, gend];
  for (const tn of cast) { root.add(tn.root); root.add(tn.blob); }
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.05, far: 200, bg: S.bg, fog: S.fog, cInf: 10, env: { ...MOOD.day.env, lights: [{ dir: SUN, color: '#fff2d8', intensity: 8, size: 2 }] }, bloom: 0.25 },
    sky, motes: [motes],
    tone: { lit: [1.46, 1.3, 1.06], shade: [0.5, 0.56, 0.84], sat: 0.92, term: 0.22, lambert: 0.35, rim: [0.16, 0.18, 0.24], charTint: [1.0, 0.97, 0.93], charShade: 0.64, charGain: 0.96, headGrad: 0.34, bodyGrad: 0.46 },
    shots: {
      wife: { cam: CAMS.wife, focus: () => [-2.5, 1.5, -1.05], slab: 1.2 },
      shame: { cam: CAMS.shame, focus: (t) => [walkX(t), 1.5, 4.5], slab: 2.4 },
      question: { cam: CAMS.question, focus: (t) => (t < 41.8 ? [-2.4, 1.5, -1.0] : [POI[0], 1.5, POI[2]]), slab: 0.7 },
    },
    update(t, camera, id) {
      for (const tn of cast) { tn.root.visible = false; tn.blob.visible = false; }
      for (const tn of cast) tn.face(camera, S.sun);
      if (id === 'wife' || id === 'question') {
        place(wife, WIFE); place(poi, POI);
        const q = id === 'question';
        wife.set({ expr: 'stern', blink: lidAt(t, 61), look: 1, arms: { L: [330, 470], R: [270, 480], bend: -50 }, add: ['stink'] });
        poi.set({ expr: q ? (t > 41.4 ? 'o' : 'worried') : t > 27.6 ? 'worried' : 'grin', face: { sweat: !q && t > 27.6 }, blink: lidAt(t, 5), look: q ? 0 : -1, arms: q ? { L: [140, 560], R: [460, 560], bend: -30 } : { L: [60, 420], R: [540, 420], bend: 30 } });
      }
      if (id === 'shame') {
        const x = walkX(t), back = t > 33.6;
        place(poi, [x, 0, 4.65]); place(gend, [8.15, 0, 3.7]);
        const stop = t > 33.25 && t < 33.6;
        poi.set({ expr: t > 33.3 ? 'worried' : 'neutral', face: { sweat: t > 33.3 }, blink: lidAt(t, 5), look: back ? -1 : 1, walk: stop ? null : phase(Math.abs(x - 5.95), 0.5),
          add: t > 33.3 ? ['blush'] : [], armsFront: t > 33.4, arms: t > 33.4 ? { L: [245, 215], R: [355, 215], bend: -70, hand: 30 } : { L: [140, 560], R: [460, 560], bend: -20 } });
        gend.set({ expr: 'stern', blink: lidAt(t, 71), look: -1, arms: { L: [180, 600], R: [420, 600], bend: 20 } });
      }
      for (const tn of cast) if (tn.root.visible) tn.face(camera, S.sun);
    },
  };
}
