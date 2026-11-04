// Paris beats at the Eiffel Tower (day): the hook (Lustig stamps the bill of sale on a touring car's bonnet at the foot
// of the tower, Poisson leaning in) → the stamp slams SOLD → the stakes wide (the whole tower, a giant SOLD tag drops
// from the first platform) → rust flaking off a leg → two Parisians scowling at it → the limousine tour → Poisson
// standing up in the back seat, starry-eyed, swelling into a "big shot".
import * as THREE from 'three';
import { buildTower } from '@engine/sets/toon1925/tower.js';
import { lidAt } from '@engine/toon/cards.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { makeSky } from '@engine/toon/sky.js';
import { MOOD } from '@engine/toon/mood.js';
import { glow } from '@engine/toon/kit.js';
import { toon, paper, TEX, makeStamp, makeTourer } from '../cast.js';
import { K, PI, sm, boing, shake, phase, place, hold } from './util.js';

const CAR = [-2.6, 0, 18.0], DOC = [-0.75, 1.07, 18.0], LUS = [-0.85, 0, 16.95], POI = [0.05, 0, 18.35];
const carX = (t) => -17 + Math.min(t - 19.94, 3.0) * 5.4;          // the tour drives past the tower (t 19.94 … 22.9)
const SEAT = 0.36;   // a seated card's root height on the car's seats
const CAMS = {
  hook: (t) => ({ p: [K(t, [[0, -0.1], [1.15, -0.25]]), K(t, [[0, 1.9], [1.15, 1.86]]), K(t, [[0, 22.1], [1.15, 21.5]])], a: [-0.38, 1.45, 17.4], fov: 46 }),
  contract: (t) => ({ p: [-0.75, K(t, [[1.15, 1.95], [2.75, 1.78]]) + shake(t, 1.99, 0.012), K(t, [[1.15, 18.62], [2.75, 18.52]])], a: [-0.75, 1.06, 17.96], fov: 40 }),
  stakes: (t) => ({ p: [K(t, [[2.75, -0.3], [3.5, 0], [5.56, 0]]), K(t, [[2.75, 1.6], [3.5, 2.2], [5.56, 2.0]]), K(t, [[2.75, 21.5], [3.5, 70], [5.56, 84]])],
    a: [K(t, [[2.75, -0.3], [3.5, 0]]), K(t, [[2.75, 2.0], [3.5, 30], [5.56, 34]]), K(t, [[2.75, 17.4], [3.5, 0]])], fov: K(t, [[2.75, 44], [3.5, 52], [5.56, 52]]) }),
  rust: (t) => ({ p: [K(t, [[5.56, 12.0], [7.3, 12.25]]), K(t, [[5.56, 0.75], [7.3, 0.85]]), K(t, [[5.56, 16.7], [7.3, 16.2]])], a: [12.85, 1.5, 13.3], fov: 40 }),
  parisians: (t) => ({ p: [K(t, [[7.3, -0.55], [9.08, -0.75]]), 1.5, K(t, [[7.3, 36.6], [9.08, 36.0]])], a: [-1.1, 2.3, 30.0], fov: 46 }),
  limo: (t) => { const x = carX(t); return { p: [x + 1.1, 1.75, 29.8], a: [x + 0.3, 1.7, 24.0], fov: 46 }; },
  poisson: (t) => ({ p: [K(t, [[22.9, -0.1], [26.19, -0.35]]), K(t, [[22.9, 2.1], [26.19, 2.15]]), K(t, [[22.9, 28.1], [26.19, 27.5]])], a: [-1.9, 2.0, 24.0], fov: 42 }),
};

export function makeParis(root) {
  const S = buildTower(root);
  const SUN = [0.45, 0.8, 0.6];
  const sky = makeSky(root, { ...MOOD.day.sky, sun: { ...MOOD.day.sky.sun, dir: SUN }, clouds: { ...MOOD.day.sky.clouds, n: 12, az: [-120, 120], el: [8, 30], dist: 420, size: 140 } });
  const motes = makeMotes(root, { ...MOOD.day.motes, n: 260, box: [-6, 0.3, 14, 4, 3.6, 34], intensity: 1.6, rise: 0.03 });
  const lus = toon('lustig', { res: 2.4, outfit: 'lustig', extra: undefined }), lusHat = toon('lustigHat', { res: 2.4, outfit: 'lustig' });
  const poi = toon('poisson', { res: 2.4 }), pm = toon('parisM', { res: 2.2 }), pw = toon('parisW', { res: 2.2 });
  const d1 = toon('d1', { res: 1.6, blob: false }), d2 = toon('d2', { res: 1.6, blob: false }), drv = toon('chauffeur', { res: 1.6, blob: false });
  const cast = [lus, lusHat, poi, pm, pw, d1, d2, drv];
  for (const tn of cast) { root.add(tn.root); if (tn.blob) root.add(tn.blob); }
  const car = makeTourer(root);
  const doc = paper(root, 0.42, 0.56, TEX.contract(false)); doc.rotation.set(-PI / 2, 0, 0.06); doc.position.set(...DOC);
  const docS = TEX.contract(true);
  const stamp = makeStamp(root, 1.5);
  const big = glow(root, '255,214,120', 2.2, 0, 0, 0, 0.7);
  // rust flakes: little orange chips tumbling off the leg's foot
  const flakeM = new THREE.MeshLambertMaterial({ color: 0xa8502a, side: THREE.DoubleSide });
  const flakes = Array.from({ length: 30 }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06 + (i % 3) * 0.02, 0.045), flakeM); m.castShadow = true; root.add(m); return m; });
  const hsh = (i) => { const v = Math.sin(i * 91.7 + 3.1) * 43758.5; return v - Math.floor(v); };
  const look = { grade: GRADE_RICH, exposure: 1.0, near: 0.05, far: 900, bg: new THREE.Color(0x9cc4ea), fog: new THREE.Fog(0xd9e4ec, 70, 520), cInf: 10,
    env: { ...MOOD.day.env, lights: [{ dir: SUN, color: '#fff2d8', intensity: 8, size: 2 }] }, bloom: 0.25 };
  return {
    look, sky, motes: [motes],
    tone: { lit: [1.46, 1.32, 1.08], shade: [0.5, 0.58, 0.86], sat: 0.95, term: 0.22, lambert: 0.35, rim: [0.16, 0.18, 0.24], charTint: [1.0, 0.97, 0.93], charShade: 0.64, charGain: 0.96, headGrad: 0.34, bodyGrad: 0.46 },
    shots: {
      hook: { cam: CAMS.hook, focus: () => [-0.2, 1.5, 17.6], slab: 1.4, cInf: 8 },
      contract: { cam: CAMS.contract, focus: () => DOC, cInf: 16 },
      stakes: { cam: CAMS.stakes, focus: (t) => (t < 3.3 ? [-0.2, 1.5, 17.6] : [0, 20, 0]), cInf: 4 },
      rust: { cam: CAMS.rust, focus: () => [12.9, 1.4, 13.4], cInf: 14 },
      parisians: { cam: CAMS.parisians, focus: () => [-1.1, 1.5, 31.4], slab: 1.0, cInf: 8 },
      limo: { cam: CAMS.limo, focus: (t) => [carX(t), 1.6, 24.0], slab: 1.4, cInf: 8 },
      poisson: { cam: CAMS.poisson, focus: () => [-1.6, 1.9, 24.0], slab: 1.2, cInf: 10 },
    },
    update(t, camera, id) {
      for (const tn of cast) { tn.root.visible = false; tn.root.scale.setScalar(1); if (tn.blob) tn.blob.visible = false; }
      car.g.visible = doc.visible = stamp.visible = big.visible = false; for (const f of flakes) f.visible = false;
      if (S.tag) S.tag.visible = id === 'hook' || id === 'contract' || id === 'stakes';
      const aim = { hook: [-0.5, 18, 6], contract: [-0.5, 18, 4], stakes: [0, 10, 60], rust: [12.5, 14.5, 5], parisians: [-1, 31, 6], limo: [carX(t), 24, 9], poisson: [-1.5, 24, 6] }[id];
      S.aimSun(aim[0], aim[1], aim[2]);
      for (const tn of cast) tn.face(camera, S.sun);
      if (id === 'hook' || id === 'contract' || id === 'stakes') {
        car.g.visible = doc.visible = true; car.g.position.set(...CAR); car.g.rotation.y = 0;
        doc.material.map = t >= 1.99 ? docS : TEX.contract(false);
        place(lusHat, LUS); place(poi, POI);
        // frame 0: the stamp is already up in his hand (mid-action); the close-up slams it down on "sold" (1.99)
        const up = id === 'hook' ? 1 : 0;
        lusHat.set({ expr: t > 2.0 ? 'grin' : 'smug', blink: lidAt(t, 3), look: 1, arms: { L: [180, 600], R: up ? [470, 290] : [430, 560], bend: -40 } });
        poi.set({ expr: t > 2.1 ? 'grin' : 'o', blink: lidAt(t, 5), look: -1, arms: { L: [110, 470], R: [440, 600], bend: -30 }, add: t > 2.1 ? ['stars'] : [] });
        stamp.visible = id !== 'stakes';
        if (id === 'hook') { hold(root, stamp, lusHat, 470, 290, camera, 0.08); stamp.position.y -= 0.12; stamp.rotation.set(0, 0, -0.3); }
        else if (id === 'contract') {
          const lift = K(t, [[1.15, 0.5], [1.7, 0.42], [1.93, 0.0]]) + K(t, [[2.25, 0], [2.7, 0.35]]);
          stamp.position.set(DOC[0] + 0.03, DOC[1] + lift, DOC[2] + 0.02); stamp.rotation.set(0, 0.2, 0);
        }
        if (S.tag) { const sw = S.tag.userData.swing, k = boing(t, 3.05, 0.6); sw.scale.set(1, Math.max(0.001, k), 1); sw.rotation.z = 0.18 * Math.sin((t - 3.05) * 3.2) * Math.exp(-Math.max(0, t - 3.05) * 0.6) * (t > 3.05 ? 1 : 0); }
      }
      if (id === 'rust') {
        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i], per = 1.4 + hsh(i) * 0.8, u = ((t + hsh(i + 7) * per) % per) / per;
          const y0 = 0.6 + hsh(i + 3) * 1.6, x = 12.6 + hsh(i + 11) * 0.5 - (y0 - 0.6) * 0.22, z = 13.55 + hsh(i + 13) * 0.12;
          f.position.set(x + Math.sin(u * 9 + i) * 0.05, y0 - u * u * y0, z + u * 0.15); f.rotation.set(u * 11 + i, u * 7, u * 5); f.visible = true;
        }
      }
      if (id === 'parisians') {
        place(pm, [-1.7, 0, 31.3]); place(pw, [-0.55, 0, 31.7]);
        const shake2 = t > 8.36 && t < 9.0 ? Math.sin(t * 24) : 0;
        pm.set({ expr: 'stern', blink: lidAt(t, 11), look: -1 + 0.6 * shake2, arms: { L: [330, 470], R: [270, 480], bend: -50 } });
        pw.set({ expr: t > 8.3 ? 'stern' : 'worried', face: { sweat: false }, blink: lidAt(t, 12), look: -1, arms: { L: [170, 600], R: [500, 150], bend: 10 } });
      }
      if (id === 'limo' || id === 'poisson') {
        const x = id === 'limo' ? carX(t) : -1.6;
        car.g.visible = true; car.g.position.set(x, 0, 24.0); car.g.rotation.y = 0;
        const bump = id === 'limo' ? 0.02 * Math.sin(t * 17) : 0;
        car.g.position.y = bump;
        const seat = (tn, dx, dz, y = SEAT) => { place(tn, [x + dx, 0, 24.0 + dz], y + bump); };
        seat(drv, 0.3, -0.32); seat(lus, 0.3, 0.34); seat(d1, -0.85, -0.45); seat(d2, -0.85, 0.45);
        const stand = id === 'poisson' ? sm(t, 23.2, 23.7) * 0.3 : 0;
        seat(poi, -0.85, 0.0, SEAT + stand);
        const swell = id === 'poisson' ? 1 + 0.16 * boing(t, 25.6, 0.5) : 1;
        poi.root.scale.setScalar(swell);
        drv.set({ expr: 'neutral', blink: lidAt(t, 21), look: 1, noLegs: true });
        lus.set({ expr: id === 'poisson' && t > 23.0 ? 'smug' : 'grin', blink: lidAt(t, 22), look: -1, noLegs: true, arms: id === 'poisson' && t > 22.95 && t < 24.4 ? { L: [80, 330], R: [430, 600], bend: 0 } : { L: [140, 520], R: [460, 520], bend: -30 } });
        d1.set({ expr: 'o', blink: lidAt(t, 23), look: id === 'poisson' ? 1 : 0, noLegs: true, arms: { L: [150, 330], R: [440, 600], bend: 10 } });
        d2.set({ expr: 'neutral', blink: lidAt(t, 24), look: id === 'poisson' ? -1 : 0, noLegs: true });
        const starry = id === 'poisson' && t > 23.6;
        poi.set({ expr: starry ? 'grin' : 'o', blink: starry ? 0 : lidAt(t, 25), look: 0, noLegs: true, add: starry ? (t > 25.6 ? ['stars', 'blush'] : ['stars']) : [], arms: starry ? { L: [60, 260], R: [540, 260], bend: 20 } : { L: [140, 520], R: [460, 520], bend: -30 } });
        if (id === 'poisson' && t > 25.55) { big.visible = true; poi.root.updateMatrixWorld(true); big.position.set(x - 0.95, SEAT + 0.3 + 1.6, 23.6); big.scale.setScalar(2.6 * boing(t, 25.6, 0.5)); }
      }
      for (const tn of cast) if (tn.root.visible) tn.face(camera, S.sun);
      void phase;
    },
  };
}
