// 1690s London street beats: the wide hook, a coin that shrinks as it is spent (fruit stall), the clipper pays the
// baker (who bites it), the baker → tailor chain (snip, toss, snip), and "everyone can tell" (pointing passers-by).
// v2 'bribe': Chaloner slips the star witness a purse, the witness bolts for Scotland, Chaloner strolls off free.
import * as THREE from 'three';
import { buildStreet } from '@engine/sets/toon1690/street.js';
import { makeToonX, handFront, ball, STALLWIFE, SHOPPER, CLIPPER, BAKER, TAILOR, MP2, CHALONER } from '@engine/toon/kit.js';
import { toonMat } from '@engine/toon/shade.js';
import { makeStickArm, makeBlob, lidAt, cardPoint } from '@engine/toon/cards.js';
import { makeCoin } from '@engine/toon/coins.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { makeSky } from '@engine/toon/sky.js';
import { MOOD } from '@engine/toon/mood.js';
import { K, PI, sm, clamp, lerp, boing, onGround, phase, makeShears } from './util.js';

const WALKER2 = { ...STALLWIFE, jacket: '#8a6ab0', front: [['skirt', '#7a5aa0'], ['mobCap']] };
const BASE_R = 0.06;
const WITNESS = { ...CLIPPER, jacket: '#4a6a8a', pants: '#3a4452', front: [['knitCap', '#c9a23a'], ['moustache', '#4a3020', 0.9]] };
const CAMS = {
  wide: (t) => ({ p: [-11.2, K(t, [[3.45, 4.4], [5.4, 2.5]]), 0.7], a: [-5.0, 1.45, -1.3], fov: 50 }),
  stall: (t) => ({ p: [K(t, [[5.4, -5.5], [7.05, -5.62]]), 1.6, K(t, [[5.4, 0.45], [7.05, 0.22]])], a: [-6.2, 1.38, -2.0], fov: 44 }),
  pay: (t) => ({ p: [K(t, [[10.4, -2.8], [12.05, -2.7]]), 1.6, 0.7], a: [-2.2, 1.38, -1.9], fov: 44 }),
  chain: (t) => ({ p: [K(t, [[12.05, -2.25], [12.6, -2.15], [13.2, -0.7], [13.9, -0.6]]), 1.58, 1.0], a: [K(t, [[12.05, -1.95], [12.6, -1.85], [13.2, -0.5], [13.9, -0.45]]), 1.36, -1.9], fov: 46 }),
  bribe: (t) => ({ p: [K(t, [[31.6, -3.55], [35.0, -3.75]]), K(t, [[31.6, 1.6], [35.0, 1.55]]), K(t, [[31.6, 1.25], [35.0, 0.95]])], a: [K(t, [[31.6, -4.65], [33.2, -4.6], [34.0, -4.95]]), 1.38, -1.5], fov: 46 }),
  caught: (t) => ({ p: [-5.1, 1.6, K(t, [[31.75, 0.75], [33, 0.55]])], a: [-6.1, 1.45, -1.8], fov: 46 }),
};

export function makeStreet(root) {
  const S = buildStreet(root);
  const mk = (o, res = 1.8) => { const tn = makeToonX(o, { res, shadow: true }); root.add(tn.root); const b = makeBlob(0.34, 0.2, 0.5); root.add(b); tn.blob = b; return tn; };
  const wife = mk(STALLWIFE, 2.2), shopper = mk(SHOPPER, 2.4), clipper = mk(CLIPPER, 2.4), baker = mk(BAKER, 2.2), tailor = mk(TAILOR, 2.2);
  const w1 = mk(MP2, 1.6), w2 = mk(WALKER2, 1.6), chal = mk(CHALONER, 2.4), wit = mk(WITNESS, 2.2);
  const cast = [wife, shopper, clipper, baker, tailor, w1, w2, chal, wit];
  // (toon look v3) MOOD.day: a painted sky with white clouds above the roofs (the skyline cards are cut out), the sun
  // where the set's sun is, a cool aerial haze down the street, dust + pollen in the sunlight
  const SUN = [0.55, 0.55, 0.61];
  const sky = makeSky(root, { ...MOOD.day.sky, sun: { ...MOOD.day.sky.sun, dir: SUN }, clouds: { ...MOOD.day.sky.clouds, n: 8, az: [-40, 130], el: [10, 32], dist: 55, size: 18 } });
  const ENV = { ...MOOD.day.env, lights: [{ dir: SUN, color: '#fff2d8', intensity: 8, size: 2 }] };
  const FOG = new THREE.Fog(0xd6e2ea, 12, 60);
  const motes = makeMotes(root, { ...MOOD.day.motes, n: 260, box: [-9, 0.3, -2.8, 1, 3.5, 1.4], intensity: 1.7, rise: 0.03 });
  const WIFE = [-6.65, 0, -2.62];
  const at = (k, fx, d) => onGround(CAMS[k]((0)), fx, d);
  const P = {
    shopper: onGround(CAMS.stall(6.2), 0.8, 2.35), payClip: onGround(CAMS.pay(11), 0.28, 2.0), baker: onGround(CAMS.pay(11), 0.72, 2.45),
    tailor: [-0.45, 0, -1.85], chal: onGround(CAMS.bribe(31.6), 0.24, 2.9), wit: onGround(CAMS.bribe(31.6), 0.78, 2.7), caughtClip: onGround(CAMS.caught(32.4), 0.82, 2.6), p1: onGround(CAMS.caught(32.4), 0.12, 3.3),
  };
  void at;
  const coin = makeCoin({ r: BASE_R, h: 0.006, kind: 'hammered', seed: 4 });
  const clipped = makeCoin({ r: BASE_R, h: 0.006, kind: 'hammered', clip: 0.75, seed: 4 });
  const milled = makeCoin({ r: BASE_R, h: 0.007, kind: 'shilling', ridges: 60, shaved: [0.2, 1.0] });
  for (const c of [coin, clipped, milled]) { c.mesh.rotation.x = PI / 2; root.add(c.g); }
  const purse = new THREE.Group(); root.add(purse);
  { const b = ball(purse, 0.07, toonMat('#8a6a3a'), 0, 0, 0, 14); b.scale.set(1, 0.9, 0.85); ball(purse, 0.025, toonMat('#5a3f22'), 0, 0.07, 0, 8); }
  const shearsB = makeShears(root, 1.1), shearsT = makeShears(root, 1.1);
  const v = new THREE.Vector3(), cpos = new THREE.Vector3();
  const place = (tn, p, y = 0) => { tn.root.position.set(p[0], y, p[2]); tn.blob.position.set(p[0], 0.004, p[2] + 0.02); tn.root.visible = tn.blob.visible = true; };
  const hold = (c, tn, u, vv, camera, s = 1, d = 0.06) => { root.worldToLocal(handFront(tn, u, vv, camera, d, c.g.position)); c.g.scale.setScalar(s); c.g.lookAt(camera.getWorldPosition(cpos)); c.g.visible = true; };
  const fly = (c, a, b, u, s, camera, h = 0.35) => { c.g.position.lerpVectors(a, b, u); c.g.position.y += Math.sin(u * PI) * h; c.g.scale.setScalar(s); c.g.lookAt(camera.getWorldPosition(cpos)); c.g.rotateZ(u * 9); c.g.visible = true; };
  const local = (tn, u, vv, camera, d = 0.06) => root.worldToLocal(handFront(tn, u, vv, camera, d, new THREE.Vector3()));
  const shearsAt = (sh, tn, u, vv, camera, snipT, t, flip = 1) => {
    root.worldToLocal(handFront(tn, u, vv, camera, 0.09, sh.g.position)); sh.g.visible = true;
    sh.g.lookAt(camera.getWorldPosition(cpos)); sh.g.rotateX(PI / 2); sh.g.rotateY(flip > 0 ? 0.4 : PI - 0.4);
    const k = Math.abs(t - snipT) < 0.12 ? Math.abs(t - snipT) / 0.12 : 1; sh.open(k);
  };
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.05, far: 80, bg: S.bg, fog: FOG, cInf: 14, env: ENV, bloom: 0.3 }, shafts: S.shafts, motes: [motes], sky,
    tone: { lit: [1.48, 1.32, 1.06], shade: [0.5, 0.58, 0.84], sat: 0.9, term: 0.22, lambert: 0.35, rim: [0.16, 0.18, 0.24], charTint: [1.0, 0.97, 0.93], charShade: 0.64, charGain: 0.96, headGrad: 0.34, bodyGrad: 0.46 },
    shots: {
      wide: { cam: CAMS.wide, focus: () => [-6.2, 1.3, -1.8], cInf: 6 },
      stall: { cam: CAMS.stall, focus: () => P.shopper.map((x, i) => (i === 1 ? 1.5 : x)), slab: 1.4 },
      pay: { cam: CAMS.pay, focus: () => [P.payClip[0], 1.5, P.payClip[2]], slab: 0.8 },
      chain: { cam: CAMS.chain, focus: (t) => (t < 12.9 ? [P.baker[0], 1.5, P.baker[2]] : [P.tailor[0], 1.5, P.tailor[2]]), slab: 0.6 },
      bribe: { cam: CAMS.bribe, focus: (t) => (t < 33.6 ? [(P.chal[0] + P.wit[0]) / 2, 1.5, (P.chal[2] + P.wit[2]) / 2] : [P.chal[0], 1.5, P.chal[2] + 0.5 * sm(t, 33.9, 35.0)]), slab: 1.0 },
      caught: { cam: CAMS.caught, focus: () => [P.caughtClip[0], 1.5, P.caughtClip[2]], slab: 1.6 },
    },
    update(t, camera, id) {
      for (const tn of cast) tn.root.visible = tn.blob.visible = false;
      for (const c of [coin, clipped, milled]) c.g.visible = false;
      purse.visible = false;
      shearsB.g.visible = shearsT.g.visible = false;
      for (const tn of cast) tn.face(camera, S.sun);
      if (id === 'wide') {
        place(wife, WIFE); wife.set({ expr: 'neutral', blink: lidAt(t, 2), arms: { L: [150, 560], R: [450, 560], bend: -30 } });
        place(shopper, [-5.6, 0, -1.3]); shopper.set({ expr: 'neutral', blink: lidAt(t, 4) });
        const d1 = (t - 3.45) * 1.1; place(w1, [-7.9 + d1, 0, -1.0]); w1.set({ expr: 'smug', blink: lidAt(t, 6), walk: phase(d1) });
        const d2 = (t - 3.45) * 0.95; place(w2, [-3.6 - d2, 0, 0.5]); w2.set({ expr: 'neutral', blink: lidAt(t, 8), walk: phase(d2) + 1 });
        place(clipper, [-7.9, 0, -2.2]); clipper.set({ expr: 'smug', blink: lidAt(t, 9), look: 1 });
      }
      if (id === 'stall') {
        place(wife, WIFE); place(shopper, P.shopper);
        const give = sm(t, 6.25, 6.7);
        wife.set({ expr: t > 6.8 ? 'o' : 'neutral', blink: lidAt(t, 2), arms: { L: [170, 600], R: give > 0.1 ? [520, 420] : [430, 600], bend: -20 } });
        shopper.set({ expr: t > 5.6 && t < 6.2 ? 'worried' : 'neutral', face: { sweat: false }, blink: lidAt(t, 4), look: -1, arms: { L: [90, 430], R: [430, 600], bend: -10 } });
        for (const tn of [wife, shopper]) tn.face(camera);
        root.updateMatrixWorld(true);
        const s = 1 - 0.22 * boing(t, 5.5, 0.4) - 0.2 * boing(t, 6.75, 0.4);
        if (give <= 0) hold(coin, shopper, 90, 430, camera, s); else if (give >= 1) hold(coin, wife, 520, 420, camera, s);
        else fly(coin, local(shopper, 90, 430, camera), local(wife, 520, 420, camera), give, s, camera, 0.2);
      }
      if (id === 'pay') {
        place(clipper, P.payClip); place(baker, P.baker);
        const give = sm(t, 10.55, 10.95), bite = K(t, [[11.05, 0], [11.3, 1], [11.6, 1], [11.85, 0]]);
        clipper.set({ expr: 'smug', blink: lidAt(t, 9), look: 1, arms: { L: [170, 600], R: give < 1 ? [540, 450] : [430, 600], bend: -10 } });
        baker.set({ expr: t > 11.55 ? 'grin' : 'neutral', blink: lidAt(t, 12), look: -1, arms: { L: bite > 0.05 ? [lerp(80, 250, bite), lerp(450, 300, bite)] : [80, 450], R: [430, 600], bend: -20 } });
        for (const tn of [clipper, baker]) tn.face(camera);
        root.updateMatrixWorld(true);
        if (give < 1) fly(clipped, local(clipper, 540, 450, camera), local(baker, 80, 450, camera), give, 0.85, camera, 0.15);
        else hold(clipped, baker, lerp(80, 250, bite), lerp(450, 300, bite), camera, 0.85, 0.08);
      }
      if (id === 'chain') {
        place(baker, P.baker); place(tailor, P.tailor);
        const toss = sm(t, 12.82, 13.18);
        baker.set({ expr: t > 12.6 ? 'smug' : 'neutral', blink: lidAt(t, 12), look: 1, arms: { L: [170, 450], R: [430, 450], bend: -30 } });
        tailor.set({ expr: t > 13.5 ? 'smug' : 'neutral', blink: lidAt(t, 13), look: -1, arms: { L: [140, 450], R: [460, 450], bend: -30 } });
        for (const tn of [baker, tailor]) tn.face(camera);
        root.updateMatrixWorld(true);
        const s = 0.85 - 0.2 * boing(t, 12.56, 0.35) - 0.18 * boing(t, 13.48, 0.35);
        if (toss <= 0) hold(clipped, baker, 170, 450, camera, s); else if (toss >= 1) hold(clipped, tailor, 140, 450, camera, s);
        else fly(clipped, local(baker, 170, 450, camera), local(tailor, 140, 450, camera), toss, s, camera, 0.6);
        if (t < 12.95) shearsAt(shearsB, baker, 430, 450, camera, 12.54, t, -1);
        if (t > 13.0) shearsAt(shearsT, tailor, 460, 450, camera, 13.46, t, -1);
      }
      if (id === 'bribe') {
        // the purse changes hands (32.35-32.75), the witness bolts down the street (33.15 on), Chaloner strolls toward us
        const give = sm(t, 32.35, 32.75), run = Math.max(0, t - 33.0) * 1.7, stroll = Math.max(0, t - 33.85) * 0.45;
        place(chal, [P.chal[0] + stroll * 0.15, 0, P.chal[2] + stroll]);
        // he bolts left, behind Chaloner, and out of frame by ~33.9
        place(wit, [P.wit[0] - run, 0, P.wit[2] - Math.min(run, 0.7)]);
        chal.set({ expr: t > 33.3 ? 'smug' : 'grin', blink: lidAt(t, 61), look: t < 33.15 ? 1 : t < 33.85 ? -1 : 0, walk: stroll > 0 ? phase(stroll) : null, arms: { L: [170, 600], R: give < 1 ? [520, 430] : [430, 600], bend: -20 } });
        wit.set({ expr: give > 0.5 ? 'grin' : 'worried', face: { sweat: give < 0.5 }, blink: lidAt(t, 62), look: -1, walk: run > 0 ? phase(run, 0.6) : null, arms: run > 0 ? { L: [60, 330], R: [540, 330], bend: -60 } : { L: [80, 440], R: [430, 600], bend: -20 } });
        for (const tn of [chal, wit]) tn.face(camera);
        root.updateMatrixWorld(true);
        const a = local(chal, 520, 430, camera), b = run > 0 ? local(wit, 60, 330, camera) : local(wit, 80, 440, camera);
        purse.position.lerpVectors(a, b, give); purse.position.y += Math.sin(give * PI) * 0.15 - 0.06; purse.visible = true;
      }
      if (id === 'caught') {
        place(wife, WIFE); place(clipper, P.caughtClip); place(w1, P.p1);
        const point = sm(t, 32.0, 32.25);
        wife.set({ expr: t > 32.0 ? 'stern' : 'o', blink: lidAt(t, 2), look: 1, arms: { L: [170, 600], R: [470, 300], bend: -20 } });
        clipper.set({ expr: 'worried', blink: lidAt(t, 9), look: -1, arms: { L: [190, 590], R: [410, 590], bend: -30 } });
        w1.set({ expr: 'o', blink: lidAt(t, 6), look: 1, arms: point > 0.5 ? { L: [170, 600], R: [590, 380], bend: 0 } : undefined });
        for (const tn of [wife, clipper, w1]) tn.face(camera);
        root.updateMatrixWorld(true);
        hold(milled, wife, 470, 300, camera, 1.0, 0.08);
        milled.g.rotateZ(Math.sin(t * 3) * 0.15);
      }
      for (const tn of cast) if (tn.root.visible) tn.face(camera);
    },
  };
}
