// Attic beats: the clipper shaves a coin by candlelight (a silver sliver flies into the jar), the shavings erupt into
// a silver mountain with him riding the top, and Chaloner — "the king of them" — on a throne among his gold fakes.
import * as THREE from 'three';
import { buildGarret, TABLE_Y } from '@engine/sets/toon1690/garret.js';
import { makeToonX, CLIPPER, CHALONER_KING } from '@engine/toon/kit.js';
import { makeStickArm, lidAt, cardPoint } from '@engine/toon/cards.js';
import { makeCoin, makeShavings } from '@engine/toon/coins.js';
import { GRADE_NIGHT } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { MOOD } from '@engine/toon/mood.js';
import { K, PI, sm, clamp, lerp, boing, makeShears } from './util.js';

const CAMS = {
  clip: (t) => ({ p: [K(t, [[7.05, 0.22], [10.4, 0.12]]), K(t, [[7.05, 1.28], [10.4, 1.22]]), K(t, [[7.05, 1.15], [10.4, 0.78]])], a: [0.04, 1.1, -0.95], fov: 40 }),
  mountain: (t) => ({ p: [0.1, K(t, [[16.15, 1.9], [17.6, 2.15]]), K(t, [[16.15, 2.3], [17.6, 2.6]])], a: [0.4, K(t, [[16.15, 1.0], [17.6, 1.45]]), -1.5], fov: 54 }),
  king: (t) => ({ p: [0.12, 1.25, K(t, [[36.85, 1.35], [37.35, 1.3], [37.7, 0.85], [38.95, 0.75]])], a: [0.1, 1.2, -1.35], fov: 44 }),
};

export function makeGarret(root) {
  const S = buildGarret(root);
  // (toon look v3) candle-warm key against moon-blue shadows + a moon rim; metals reflect the flame and the window
  const ENV = { top: '#7a6458', horizon: '#c09878', ground: '#4a3a30', lights: [{ dir: [0.1, 0.4, 1], color: '#ffd8a8', intensity: 3, size: 8 }, { dir: [-0.5, 0.35, 0.79], color: '#ffc070', intensity: 6, size: 3 }, { dir: [0, 1, 0.2], color: '#ffd8a8', intensity: 2, size: 6 }, { dir: [0.3, 0.6, -1], color: '#c8d4ff', intensity: 3, size: 2 }] };
  const motes = makeMotes(root, { ...MOOD.interior.motes, n: 140, box: [-1.2, 0.8, -1.6, 1.2, 2.4, 0.6], size: 0.006, intensity: 2.0 });
  const clipper = makeToonX(CLIPPER, { res: 2.6 }), king = makeToonX(CHALONER_KING, { res: 2.4 });
  root.add(clipper.root, king.root);
  const armL = makeStickArm(root, { hand: 24, width: 15 }), armR = makeStickArm(root, { hand: 24, width: 15 });
  const coin = makeCoin({ r: 0.045, h: 0.006, kind: 'hammered', seed: 7 });
  const coinCut = makeCoin({ r: 0.045, h: 0.006, kind: 'hammered', seed: 7, clip: 0.6 });
  for (const c of [coin, coinCut]) { c.mesh.rotation.x = PI / 2; root.add(c.g); }
  const sliver = makeShavings(1, { r: 0.04 }); root.add(sliver.mesh);
  const shears = makeShears(root, 0.9);
  const HAND_L = new THREE.Vector3(-0.1, TABLE_Y + 0.24, -0.5), HAND_R = new THREE.Vector3(0.12, TABLE_Y + 0.25, -0.48);
  const W = new THREE.Vector3(), c2 = new THREE.Vector3(), jar = S.jarPos;
  // the jar fills a little at each snip (fixed scatter, deterministic)
  const fillJar = (n) => { S.inJar.begin(); for (let i = 0; i < n; i++) S.inJar.add(jar.x + Math.sin(i * 2.3) * 0.07, TABLE_Y + 0.01 + i * 0.0012, jar.z + Math.cos(i * 1.7) * 0.07, i, i * 0.6, i * 1.1, 1); S.inJar.commit(); };
  return {
    look: { grade: GRADE_NIGHT, exposure: 1.0, near: 0.03, far: 30, bg: S.bg, cInf: 12, env: ENV, bloom: 0.3 }, shafts: S.shafts, motes: [motes],
    tone: { lit: [1.1, 0.88, 0.62], shade: [0.15, 0.18, 0.44], sat: 0.86, term: 0.25, lambert: 0.4, rim: [0.28, 0.38, 0.78], charTint: [1.0, 0.9, 0.78], charShade: 0.56, charGain: 0.98, headGrad: 0.36, bodyGrad: 0.46 },
    shots: {
      clip: { cam: CAMS.clip, focus: () => [0, 1.05, -0.9], cInf: 14, slab: 0.5 },
      mountain: { cam: CAMS.mountain, focus: () => [0.5, 1.5, -1.5], cInf: 8 },
      king: { cam: CAMS.king, focus: () => [0.1, 1.2, -1.35], cInf: 12, slab: 0.6 },
    },
    update(t, camera, id) {
      for (const tn of [clipper, king]) tn.face(camera, S.sun);
      const flick = 1 + 0.12 * Math.sin(t * 17) * Math.sin(t * 5.3);
      S.flame.scale.set(1, 1.8 * flick, 1); S.flameGlow.scale.setScalar(0.9 * flick); S.candle.intensity = 2.6 * flick;
      const isKing = id === 'king';
      S.chal.visible = isKing; S.heap.visible = id === 'mountain'; S.rain.mesh.visible = id === 'mountain';
      S.inJar.mesh.visible = !isKing; for (const c of S.coinsOld) c.g.visible = !isKing;
      clipper.root.visible = id !== 'king'; king.root.visible = isKing;
      armL.arm.visible = armL.ball.visible = armR.arm.visible = armR.ball.visible = id === 'clip';
      coin.g.visible = coinCut.g.visible = shears.g.visible = sliver.mesh.visible = false;
      if (id === 'clip') {
        fillJar(110 + (t > 9.5 ? 4 : 0));
        clipper.root.position.set(0.0, -0.26, -1.42);
        clipper.set({ expr: t > 9.9 ? 'grin' : 'smug', blink: lidAt(t, 5), look: K(t, [[7.5, 0], [8.2, -0.6], [9.5, -0.6], [9.9, 0.4]]), arms: { L: null, R: null }, ol: 0.75, noLegs: true });
        clipper.face(camera); clipper.root.updateMatrixWorld(true);
        // he turns the coin in his left hand; the shears close on its rim at 9.05
        const hl = HAND_L.clone().add(new THREE.Vector3(0.015 * Math.sin(t * 2), 0.01 * Math.sin(t * 1.7), 0));
        const hr = HAND_R.clone().add(new THREE.Vector3(K(t, [[8.4, 0.05], [8.9, 0], [9.05, -0.025], [9.4, 0.03]]), 0, 0));
        armL.set(cardPoint(clipper, 236, 420), root.localToWorld(hl.clone()));
        armR.set(cardPoint(clipper, 364, 420), root.localToWorld(hr.clone()));
        const c = t < 9.05 ? coin : coinCut; c.g.visible = true;
        c.g.position.copy(hl).add(new THREE.Vector3(0.05, 0.02, 0.03)); c.g.lookAt(camera.getWorldPosition(c2)); c.g.rotateZ(0.4 + Math.sin(t * 2) * 0.2);
        shears.g.visible = true; shears.g.position.copy(hr).add(new THREE.Vector3(-0.02, 0.0, 0.03)); shears.g.rotation.set(0.2, PI, 0.25);
        const k = Math.abs(t - 9.05) < 0.14 ? Math.abs(t - 9.05) / 0.14 : t < 8.4 ? 0.3 : 1; shears.open(k);
        // the sliver arcs into the jar
        const u = sm(t, 9.08, 9.55);
        if (u > 0 && u < 1) {
          W.copy(c.g.position).lerp(new THREE.Vector3(jar.x, TABLE_Y + 0.22, jar.z), u); W.y += Math.sin(u * PI) * 0.18;
          sliver.mesh.visible = true; sliver.begin(); sliver.add(W.x, W.y, W.z, u * 8, u * 5, 0.3, 1); sliver.commit();
        }
      }
      if (id === 'mountain') {
        fillJar(140);
        const g = 0.22 + 1.2 * boing(t, 16.2, 1.0) * sm(t, 16.2, 16.9);
        S.heap.scale.set(g, g * 1.05, g);
        clipper.root.position.set(0.55, g * 1.05 - 0.85, -1.5);
        clipper.set({ expr: 'grin', blink: lidAt(t, 5), arms: { L: [90, 240], R: [510, 240], bend: -20 }, ol: 0.9 });
        clipper.face(camera);
        // a fountain of shavings tumbling off the summit
        S.rain.begin();
        for (let i = 0; i < 400; i++) {
          const ph = ((i * 0.6180339) % 1), age = ((t - 16.2) * 0.9 + ph) % 1.0;
          if (t < 16.25) continue;
          const a = i * 2.39996, rr = age * g * 1.3, y = g * 1.05 * (1 - age) + 0.04;
          S.rain.add(0.55 + Math.cos(a) * rr, Math.max(0.03, y + Math.sin(age * PI) * 0.25), -1.5 + Math.sin(a) * rr, i + t * 3, i * 0.7, t * 2 + i, 1);
        }
        S.rain.commit();
      }
      if (isKing) {
        king.root.position.set(0.1, -0.21, -1.35);
        king.set({ expr: t > 37.4 ? 'smug' : 'grin', blink: lidAt(t, 15), arms: { L: [180, 560], R: [470, 420], bend: 50 }, ol: 0.8, noLegs: true });
        king.face(camera);
      }
    },
  };
}
