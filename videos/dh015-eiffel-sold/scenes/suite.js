// Hotel-suite beats (the Crillon): night — Lustig stamps fake ministry letterhead at the writing desk; day — the dealers
// file in, Lustig behind a brass MINISTÈRE nameplate, the easel cover drops on "sold for scrap", a finger to his lips
// on "Top secret"; Poisson hands over the envelope of francs; the second group of dealers; one of them whispering into
// the candlestick telephone; night again for the flashback — Lustig sighs about his pay, Poisson slides the bribe across
// the table, Lustig pockets it, Poisson beams.
import * as THREE from 'three';
import { buildSuite, armchair } from '@engine/sets/toon1925/suite.js';
import { lidAt, makeStickArm, cardPoint } from '@engine/toon/cards.js';
import { box, glow } from '@engine/toon/kit.js';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, fitText } from '@engine/toon/paint.js';
import { GRADE_RICH, GRADE_NIGHT } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { MOOD } from '@engine/toon/mood.js';
import { toon, paper, TEX, makeStamp, makeEnvelope, makePhone } from '../cast.js';
import { K, PI, sm, boing, shake, phase, place, hold, lerp } from './util.js';

const TBL = [-0.6, -0.9], LUS = [-0.6, 0, -2.05], EASEL = [0.4, -2.5];
const NIGHT = new Set(['letter', 'reveal', 'salary', 'slide', 'dare', 'real']);
const FLASH = ['reveal', 'salary', 'slide', 'dare', 'real'];
const SEAT_Y = -0.17, SL = [TBL[0] - 0.8, 0, TBL[1]], SP = [TBL[0] + 0.8, 0, TBL[1]];   // flashback seats
const CAMS = {
  letter: (t) => ({ p: [K(t, [[9.08, 3.05], [11.35, 2.95]]), K(t, [[9.08, 2.15], [11.35, 2.05]]) + shake(t, 10.5, 0.008), K(t, [[9.08, -1.0], [11.35, -1.2]])], a: [2.6, 0.95, -2.75], fov: 42 }),
  invite: (t) => ({ p: [K(t, [[11.35, -3.5], [14.2, -3.2]]), K(t, [[11.35, 2.4], [14.2, 2.2]]), K(t, [[11.35, 2.7], [14.2, 2.4]])], a: [0.4, 1.55, -1.6], fov: 52 }),
  ministry: (t) => ({ p: [K(t, [[14.2, -0.35], [17.23, -0.5]]), 1.58, K(t, [[14.2, 1.3], [17.23, 0.75]])], a: [-0.6, 1.62, -2.0], fov: 40 }),
  secret: (t) => ({ p: [K(t, [[17.23, 1.2], [18.9, 1.0], [19.94, 0.3]]), 1.6, K(t, [[17.23, 1.5], [18.9, 1.2], [19.94, 0.45]])], a: [K(t, [[17.23, -0.05], [18.9, -0.1], [19.4, -0.55]]), 1.62, -2.2], fov: K(t, [[17.23, 46], [19.94, 38]]) }),
  paid: (t) => ({ p: [-0.38, 1.55, K(t, [[28.31, 1.7], [29.99, 1.4]])], a: [-0.38, 1.4, -1.92], fov: 42 }),
  again: (t) => ({ p: [K(t, [[34.69, 0.7], [36.98, 0.5]]), 1.7, K(t, [[34.69, 2.7], [36.98, 2.4]])], a: [-0.6, 1.4, -1.4], fov: 48 }),
  police: (t) => ({ p: [K(t, [[36.98, 2.55], [38.85, 2.75]]), 1.62, K(t, [[36.98, 2.75], [38.85, 2.45]])], a: [3.45, 1.5, 0.7], fov: 40 }),
  reveal: (t) => ({ p: [-0.6, 1.58, K(t, [[42.7, 3.9], [44.86, 3.3]])], a: [-0.6, 1.18, -0.9], fov: 46 }),
  salary: (t) => ({ p: [K(t, [[44.86, -0.8], [48.7, -0.9]]), 1.45, K(t, [[44.86, 1.25], [48.7, 1.0]])], a: [-1.12, 1.1, -0.9], fov: 40 }),
  slide: (t) => ({ p: [K(t, [[47.3, -0.3], [48.7, -0.42]]), 1.55, K(t, [[47.3, 0.75], [48.7, 0.6]])], a: [-0.98, 0.9, -0.85], fov: 42 }),
  dare: (t) => ({ p: [-1.15, 1.42, K(t, [[48.7, 0.95], [50.05, 0.8]])], a: [-1.38, 1.22, -0.9], fov: 36 }),
  real: (t) => ({ p: [0.05, 1.45, K(t, [[50.05, 0.95], [51.64, 0.8]])], a: [0.22, 1.3, -0.9], fov: 36 }),
};
// standing spots per shot (dealers keep clear of the lens line)
const DAY = {
  invite: { d1: [-1.9, -0.35], d2: [-1.15, 0.45], poi: [0.35, 0.35], d3: [1.2, -0.45] },
  ministry: { d1: [-2.3, -0.8], d2: [-1.8, 0.1], poi: [0.65, -0.1], d3: [1.3, -0.7] },
  secret: { d1: [-2.4, -0.9], d2: [-1.9, -0.2], poi: [-1.35, -1.2], d3: [1.3, -1.7] },
  again: { d4: [-1.35, -1.25], d5: [-1.05, -0.35], d6: [0.35, -1.15] },
};

export function makeSuite(root) {
  const S = buildSuite(root);
  S.easel.position.set(EASEL[0], 0, EASEL[1]); S.easel.rotation.y = -0.18;
  S.board.material = toonMat(TEX.board());
  for (const c of S.chairs) c.visible = false;
  const chA = armchair(root, SL[0], SL[2], PI / 2), chB = armchair(root, SP[0], SP[2], -PI / 2);
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.4), toonMat('#7a2030', { side: THREE.DoubleSide })); cover.castShadow = true; S.easel.add(cover);
  // the brass nameplate on the round table
  const plate = new THREE.Group(); plate.position.set(TBL[0], 0.77, TBL[1] - 0.45); root.add(plate);
  box(plate, 0.62, 0.08, 0.12, toonMat('#5a3420'), 0, 0.04, 0, 0.01);
  const brassFace = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.13), toonMat(ctex('namePlate', 768, 172, (g, r, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#f0d27a'); gr.addColorStop(0.5, '#c9a040'); gr.addColorStop(1, '#a8802c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#6a4a14'; g.lineWidth = 8; g.strokeRect(6, 6, W - 12, H - 12); g.fillStyle = '#2a1c08'; g.textAlign = 'center';
    fitText(g, 'MINISTÈRE DES POSTES', W / 2, H * 0.47, W - 50, 60, 'bold', 'Georgia, serif'); fitText(g, 'ET TÉLÉGRAPHES', W / 2, H * 0.86, W - 120, 52, 'bold', 'Georgia, serif');
  }), { shiny: 70, spec: 0xfff0b0 })); brassFace.position.set(0, 0.15, 0.03); brassFace.rotation.x = -0.25; brassFace.castShadow = true; plate.add(brassFace);
  const slope = box(plate, 0.6, 0.15, 0.04, toonMat('#5a3420'), 0, 0.14, 0.0); slope.rotation.x = -0.25;
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 220, box: [-3, 0.6, -3.8, 3, 3.6, 1.0], size: 0.008, intensity: 1.7 });
  const lus = toon('lustig', { res: 2.6 }), poi = toon('poisson', { res: 2.6 });
  const D = { d1: toon('d1', { res: 1.8 }), d2: toon('d2', { res: 1.8 }), d3: toon('d3', { res: 1.8 }), d4: toon('d4', { res: 1.8 }), d5: toon('d5', { res: 2.4 }), d6: toon('d6', { res: 1.8 }) };
  const cast = [lus, poi, ...Object.values(D)];
  for (const tn of cast) { root.add(tn.root); root.add(tn.blob); }
  const letter = paper(root, 0.36, 0.48, TEX.letter(false)); letter.rotation.set(-PI / 2, 0, 0.1); letter.position.set(2.55, 0.835, -2.62);
  const letterS = TEX.letter(true), letter0 = TEX.letter(false);
  const stamp = makeStamp(root, 1.4), arm = makeStickArm(root, { H: 1.9 });
  const env = makeEnvelope(root, 1.4), phone = makePhone(root); phone.g.position.set(3.75, 0.84, 0.95); phone.g.rotation.y = -0.6;
  const halo = glow(root, '255,214,120', 1.8, 0, 0, 0, 0.6);
  const sh = new THREE.Vector3(), hd = new THREE.Vector3();
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.05, far: 40, bg: S.bg, fog: null, cInf: 12, env: MOOD.interior.env, bloom: 0.32 }, motes: [motes],
    tone: (t, id) => (NIGHT.has(id)
      ? { lit: [1.12, 0.9, 0.7], shade: [0.18, 0.2, 0.44], sat: 0.9, term: 0.25, lambert: 0.4, rim: [0.18, 0.22, 0.5], charTint: [1.0, 0.9, 0.8], charShade: 0.6, charGain: 1.0, headGrad: 0.34, bodyGrad: 0.46 }
      : { lit: [1.5, 1.3, 1.04], shade: [0.46, 0.46, 0.7], sat: 0.95, term: 0.24, lambert: 0.38, rim: [0.12, 0.1, 0.14], charTint: [1.0, 0.95, 0.9], charShade: 0.66, charGain: 0.98, headGrad: 0.34, bodyGrad: 0.46 }),
    grade: (id) => (NIGHT.has(id) ? GRADE_NIGHT : GRADE_RICH),
    shots: {
      letter: { cam: CAMS.letter, focus: () => [2.55, 0.9, -2.75], cInf: 14 },
      invite: { cam: CAMS.invite, focus: () => [0, 1.5, -0.6], slab: 2.2, cInf: 6 },
      ministry: { cam: CAMS.ministry, focus: () => [-0.6, 1.5, -1.6], slab: 0.6 },
      secret: { cam: CAMS.secret, focus: (t) => (t < 18.9 ? [0.4, 1.5, -2.3] : [-0.6, 1.6, -2.05]), slab: 0.8 },
      paid: { cam: CAMS.paid, focus: () => [-0.4, 1.4, -1.9], slab: 0.8 },
      again: { cam: CAMS.again, focus: () => [-0.6, 1.5, -1.6], slab: 1.4 },
      police: { cam: CAMS.police, focus: () => [3.45, 1.5, 0.75], cInf: 12 },
      reveal: { cam: CAMS.reveal, focus: () => [-0.6, 1.2, -0.9], slab: 1.2 },
      salary: { cam: CAMS.salary, focus: () => [-1.5, 1.2, -0.9], slab: 0.6 },
      slide: { cam: CAMS.slide, focus: (t) => [lerp(SP[0] - 0.6, SL[0] + 0.5, sm(t, 47.45, 48.15)), 0.85, TBL[1] + 0.15], slab: 0.5, cInf: 14 },
      dare: { cam: CAMS.dare, focus: () => [-1.55, 1.25, -0.9] },
      real: { cam: CAMS.real, focus: () => [0.35, 1.25, -0.9] },
    },
    update(t, camera, id) {
      const night = NIGHT.has(id);
      S.setMode(night ? 'night' : 'day');
      for (const tn of cast) { tn.root.visible = false; tn.blob.visible = false; tn.pivot.rotation.z = 0; }
      letter.visible = stamp.visible = env.visible = halo.visible = arm.arm.visible = arm.ball.visible = false;
      chA.visible = chB.visible = FLASH.includes(id);
      plate.visible = !night;
      cover.visible = id === 'invite' || id === 'ministry' || (id === 'secret');
      for (const tn of cast) tn.face(camera, S.sun);
      const stand = (tn, p) => place(tn, [p[0], 0, p[1]]);
      if (id === 'letter') {
        letter.visible = stamp.visible = true;
        place(lus, [2.6, 0, -3.3], -0.2); lus.blob.visible = false;
        const lift = K(t, [[9.08, 0.32], [10.2, 0.28], [10.48, 0.0], [10.62, 0.0], [10.95, 0.26]]);
        letter.material.map = t >= 10.48 ? letterS : letter0;
        lus.set({ expr: t > 10.6 ? 'grin' : 'smug', blink: lidAt(t, 31), look: 1, noLegs: true, arms: { L: [150, 560], R: null, bend: -30 } });
        lus.face(camera); lus.root.updateMatrixWorld(true);
        stamp.position.set(2.58, 0.84 + lift, -2.6); stamp.rotation.set(0, 0.3, 0);
        cardPoint(lus, 370, 400, sh); hd.set(2.58, 0.84 + lift + 0.2, -2.6); root.localToWorld(hd);
        arm.set(sh, hd); arm.arm.visible = arm.ball.visible = true;
      }
      const day = DAY[id];
      if (day) {
        stand(lus, [LUS[0], LUS[2]]);
        const shh = id === 'secret' && t > 19.15;
        const open = id === 'invite' ? { L: [70, 330], R: [530, 330], bend: 20 } : id === 'secret' && t < 19.15 ? { L: [150, 560], R: [560, 380], bend: 0 } : shh ? { L: [150, 560], R: [312, 292], bend: -60 } : { L: [140, 560], R: [460, 560], bend: -30 };
        lus.set({ expr: shh ? 'smug' : id === 'invite' ? 'grin' : 'smug', blink: lidAt(t, 31), look: 0, arms: open, armsFront: shh });
        if (id === 'secret') {
          const k = sm(t, 17.95, 18.3); cover.position.set(0, 1.5 - k * 1.45, 0.12); cover.scale.set(1, 1 - 0.9 * k, 1);
        } else { cover.position.set(0, 1.5, 0.12); cover.scale.set(1, 1, 1); }
        for (const [k, p] of Object.entries(day)) {
          const tn = k === 'poi' ? poi : D[k];
          let q = p;
          if (id === 'invite') {   // they file in from the double doors, one after another
            const i = Object.keys(day).indexOf(k), u = sm(t, 11.35 + i * 0.35, 12.9 + i * 0.35), door = [4.1, 1.2];
            q = [lerp(door[0], p[0], u), lerp(door[1], p[1], u)];
            tn.set({ expr: 'neutral', blink: lidAt(t, 40 + i), look: -1, walk: u > 0 && u < 1 ? phase(u * 5) : null });
          } else {
            const wow = id === 'secret' && t > 18.05;
            tn.set({ expr: wow ? 'o' : k === 'poi' ? 'grin' : 'neutral', blink: lidAt(t, 40 + k.length + k.charCodeAt(1)), look: p[0] < LUS[0] ? 1 : -1, face: { sweat: false } });
          }
          stand(tn, q);
        }
      }
      if (id === 'paid') {
        stand(poi, [-1.05, -1.9]); stand(lus, [0.25, -1.95]);
        const u = sm(t, 28.78, 29.12);
        poi.set({ expr: 'grin', blink: lidAt(t, 5), look: 1, arms: { L: [140, 560], R: u < 1 ? [490, 440] : [460, 560], bend: -20 } });
        lus.set({ expr: u > 0.9 ? 'grin' : 'smug', blink: lidAt(t, 31), look: -1, arms: { L: [110, 440], R: [460, 560], bend: -20 } });
        poi.face(camera); lus.face(camera);
        const a = hold(root, new THREE.Object3D(), poi, 490, 440, camera, 0.07).clone(), b = hold(root, new THREE.Object3D(), lus, 110, 440, camera, 0.07).clone();
        env.position.lerpVectors(a, b, u); env.position.y += Math.sin(u * PI) * 0.12; env.rotation.set(0, 0, -0.2 + u * 0.4); env.visible = true;
      }
      if (id === 'again') {
        for (const tn of [D.d1, D.d2, D.d3, poi]) tn.root.visible = false;
      }
      if (id === 'police') {
        stand(D.d5, [3.42, 0.72]);
        D.d5.set({ expr: 'worried', blink: lidAt(t, 51), look: -1, arms: { L: [120, 225], R: [470, 520], bend: -40 } });
        D.d5.face(camera);
        phone.ear.visible = true; hold(root, phone.ear, D.d5, 120, 225, camera, 0.05); phone.ear.rotation.set(0, 0, -0.5);
        // in the far corner of the room Lustig keeps pitching to the others
        stand(lus, [LUS[0], LUS[2]]); lus.set({ expr: 'grin', blink: lidAt(t, 31), arms: { L: [70, 330], R: [530, 330], bend: 20 } });
        stand(D.d4, [-2.0, -0.4]); D.d4.set({ expr: 'neutral', blink: lidAt(t, 44), look: 1 }); stand(D.d6, [0.6, -0.4]); D.d6.set({ expr: 'neutral', blink: lidAt(t, 46), look: -1 });
      } else { phone.ear.position.set(3.82, 1.1, 0.93); phone.ear.rotation.set(0, 0, 0); }
      if (FLASH.includes(id)) {
        place(lus, SL, SEAT_Y); place(poi, SP, SEAT_Y);
        const lean = id === 'reveal' ? sm(t, 43.0, 43.5) : 0;
        lus.pivot.rotation.z = -0.14 * lean;
        const rub = id === 'reveal' && t > 44.1 ? Math.sin(t * 30) * 12 : 0;
        const sigh = id === 'salary';
        lus.set({ expr: id === 'reveal' ? (t > 43.6 ? 'smug' : 'neutral') : sigh ? 'worried' : 'smug', face: { sweat: false }, blink: lidAt(t, 31), look: 1,
          noLegs: true, add: sigh && t > 45.0 ? ['sigh'] : [], arms: id === 'reveal' && t > 43.9 ? { L: [150, 560], R: [480, 400 + rub], bend: -30 } : sigh ? { L: [90, 470], R: [510, 470], bend: 30 } : { L: [150, 560], R: [450, 540], bend: -30 } });
        const beam = id === 'real' || (id === 'dare' && t > 49.6);
        poi.set({ expr: beam ? 'grin' : id === 'salary' ? 'worried' : id === 'slide' ? 'smug' : 'neutral', face: { sweat: false }, blink: lidAt(t, 5), look: -1, noLegs: true,
          add: beam ? ['blush'] : [], arms: id === 'slide' ? { L: [60, 520], R: [460, 560], bend: -10 } : { L: [140, 560], R: [460, 560], bend: -30 } });
        if (id === 'slide') {
          const u = sm(t, 47.45, 48.15); env.visible = true; env.position.set(lerp(SP[0] - 0.6, SL[0] + 0.5, u), 0.8, TBL[1] + 0.15); env.rotation.set(-PI / 2, 0, 0.3);
        }
        if (id === 'dare') {
          lus.face(camera); lus.root.updateMatrixWorld(true);
          const u = sm(t, 48.9, 49.55), a = new THREE.Vector3(SL[0] + 0.5, 0.8, TBL[1] + 0.15), b = hold(root, new THREE.Object3D(), lus, 380, 430, camera, 0.04).clone();
          if (t < 49.62) { env.visible = true; env.position.lerpVectors(a, b, u); env.rotation.set(-PI / 2 * (1 - u), 0, 0.3 * (1 - u)); env.scale.setScalar(1.4 * (1 - 0.6 * u)); }
          lus.set({ expr: t > 49.55 ? 'grin' : 'smug', blink: lidAt(t, 31), look: 1, noLegs: true, arms: { L: [150, 560], R: t < 49.62 ? [380 + (1 - u) * 120, 430 + (1 - u) * 120] : [400, 460], bend: -30 } });
        } else env.scale.setScalar(1.4);
        if (id === 'real' && t > 50.7) { halo.visible = true; halo.position.set(SP[0], 1.5, SP[2] - 0.35); halo.scale.setScalar(2.4 * boing(t, 50.75, 0.5)); }
      }
      for (const tn of cast) if (tn.root.visible) tn.face(camera, S.sun);
    },
  };
}
