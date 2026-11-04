// Modern corner store: change drops into the dish (today's coins), a framed Newton above the shelves ("tradition"),
// then a power cut — she picks the dime from the penny by touch, eyes shut, and the lights come back.
// v2 'payoff': a 1690s clipper at the modern counter snips a quarter, looks inside, and finds nothing worth stealing.
import * as THREE from 'three';
import { buildStore, STORE } from '@engine/sets/toonstore.js';
import { makeToonX, drawCostumed, handFront, glow, CASHIER, CUSTOMER, NEWTON, CLIPPER } from '@engine/toon/kit.js';
import { lidAt, makeStickArm, makeBlob, cardPoint } from '@engine/toon/cards.js';
import { makeCoin } from '@engine/toon/coins.js';
import { toonMat } from '@engine/toon/shade.js';
import { ctex } from '@engine/toon/paint.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { MOOD } from '@engine/toon/mood.js';
import { K, PI, sm, clamp, lerp, boing, makeShears } from './util.js';

const C = STORE, CY = STORE.counterY;
const portraitTex = (expr) => ctex('newtonPortrait' + expr, 420, 540, (g, r, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#4a5a4a'); gr.addColorStop(1, '#2a3228'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2 - 300 * 0.62, 30); g.scale(0.62, 0.62); drawCostumed(g, NEWTON, { expr, light: -PI / 4, arms: { L: [210, 560], R: [390, 560], bend: -30 } }); g.restore();
  g.fillStyle = '#c79a4a'; g.fillRect(W * 0.2, H - 70, W * 0.6, 44); g.fillStyle = '#2a2018'; g.textAlign = 'center'; g.font = 'bold 30px Georgia, serif'; g.fillText('SIR ISAAC', W / 2, H - 37);
});

export function makeStore(root) {
  const S = buildStore(root);
  // (toon look v3) cool fluorescent panels + the blue streetlight; dust only shows in the streetlight beam when the
  // power is cut. The coins are real metal: their reflections dim with the power (scene.environmentIntensity)
  const ENV = { top: '#c8ccd4', horizon: '#8a8c90', ground: '#3a3c40', lights: [{ dir: [0, 1, 0.2], color: '#f4f8ff', intensity: 6, size: 4 }, { dir: [1, 0.3, -0.2], color: '#9fb6ff', intensity: 2, size: 2 }] };
  const motes = makeMotes(root, { n: 160, box: [-0.6, 0.9, -1.4, 3.0, 2.3, 0.4], size: 0.006, color: 0xcfe0ff, intensity: 2.2, rise: 0.02 });
  const cashier = makeToonX(CASHIER, { res: 2.0 }), cust = makeToonX(CUSTOMER, { res: 2.4 });
  const clip = makeToonX(CLIPPER, { res: 2.4 });
  root.add(cashier.root, cust.root, clip.root);
  const shears = makeShears(root, 0.8), bigQ = makeCoin({ r: 0.05, h: 0.008, kind: 'quarter', ridges: 60, edge: 'clad' }); root.add(bigQ.g);
  const blob = makeBlob(0.34, 0.2, 0.5); root.add(blob);
  const pNeutral = toonMat(portraitTex('neutral')), pSmug = toonMat(portraitTex('smug'));
  const arm = makeStickArm(root, { hand: 22, width: 14 });
  const quarter = makeCoin({ r: 0.036, h: 0.006, kind: 'quarter', ridges: 60, edge: 'clad' });
  const dime = makeCoin({ r: 0.028, h: 0.005, kind: 'dime', ridges: 50 });
  const penny = makeCoin({ r: 0.031, h: 0.006, kind: 'penny', edge: 'copper' });
  const coins = [quarter, dime, penny];
  for (const c of coins) root.add(c.g);
  const glint = glow(root, '235,240,255', 0.12, 0, 0, 0, 0.9);
  const DISH = new THREE.Vector3(C.dish[0], CY + 0.035, C.dish[1]);
  const cams = {
    wide: (t) => ({ p: [K(t, [[43.75, -1.25], [45.5, -0.95]]), 1.72, K(t, [[43.75, 2.1], [45.5, 1.75]])], a: [0.15, 1.25, -1.0], fov: 50 }),
    trad: (t) => ({ p: [K(t, [[50.7, 1.25], [51.9, 1.45]]), K(t, [[50.7, 1.7], [51.9, 1.82]]), K(t, [[50.7, 1.4], [51.9, 0.35]])], a: [C.portrait[0] - 0.1, 1.78, C.portrait[2]], fov: 42 }),
    // whole face left of centre, the dish + coins at her fingertips right of centre, above the caption band (v1.1 fix)
    dark: (t) => ({ p: [K(t, [[51.9, 0.3], [55.6, 0.2]]), K(t, [[51.9, 1.62], [55.6, 1.58]]), K(t, [[51.9, 2.1], [55.6, 1.8]])], a: [-0.3, 1.3, -0.1], fov: 54 }),
    end: () => ({ p: [-0.95, 1.72, 1.75], a: [0.15, 1.25, -1.0], fov: 50 }),
    payoff: (t) => ({ p: [K(t, [[62.9, -0.3], [65.2, -0.42]]), K(t, [[62.9, 1.62], [65.2, 1.6]]), K(t, [[62.9, 2.2], [65.2, 1.85]])], a: [-0.7, 1.42, -0.1], fov: 44 }),
  };
  const power = (t) => 1 - sm(t, 52.2, 52.4) + sm(t, 54.85, 55.0);
  // a real blackout: the inside goes near-black; only the streetlight spot through the window (set) still lights her
  const ON = { lit: [1.3, 1.28, 1.22], shade: [0.46, 0.52, 0.74], rim: [0.1, 0.11, 0.15], sat: 0.9, term: 0.22, charTint: [1, 0.99, 0.97], charShade: 0.66, charGain: 0.98, headGrad: 0.34, bodyGrad: 0.45 };
  const OFF = { lit: [0.03, 0.035, 0.07], shade: [0.015, 0.018, 0.035], rim: [0.06, 0.09, 0.22], sat: 0.6, term: 0.22, charTint: [0.05, 0.055, 0.1], charShade: 0.66, charGain: 1.0, headGrad: 0.34, bodyGrad: 0.45 };
  const mix = (k) => Object.fromEntries(Object.keys(ON).map((n) => [n, Array.isArray(ON[n]) ? ON[n].map((v, i) => lerp(OFF[n][i], v, k)) : lerp(OFF[n], ON[n], k)]));
  const cam = new THREE.Vector3();
  const lay = (c, x, z, rot) => { c.g.position.set(x, CY + 0.004, z); c.g.rotation.set(0, rot, 0); c.mesh.rotation.set(0, 0, 0); c.g.visible = true; };
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.03, far: 40, bg: S.bg, cInf: 12, env: ENV, bloom: 0.35 }, shafts: S.shafts, motes: [motes],
    tone: ON,
    shots: {
      wide: { cam: cams.wide, focus: () => [0.3, 1.3, -1.2], cInf: 10, slab: 1.4 },
      trad: { cam: cams.trad, focus: () => C.portrait, cInf: 14 },
      dark: { cam: cams.dark, focus: () => [-0.35, 1.25, -0.1], cInf: 14, slab: 0.7, tone: (t) => mix(power(t)) },
      payoff: { cam: cams.payoff, focus: () => [-0.75, 1.5, 0.12], cInf: 12, slab: 0.8 },
      end: { cam: cams.end, focus: () => [0.3, 1.3, -1.2], cInf: 10 },
    },
    update(t, camera, id) {
      for (const tn of [cashier, cust]) tn.face(camera, S.sun);
      camera.getWorldPosition(cam);
      S.setPower(id === 'dark' ? power(t) : 1);
      root.parent.environmentIntensity = id === 'dark' ? 0.12 + 0.88 * power(t) : 1;
      S.portrait.material = id === 'trad' && t > 51.25 ? pSmug : pNeutral;
      arm.arm.visible = arm.ball.visible = glint.visible = false;
      for (const c of coins) c.g.visible = false;
      cashier.root.position.set(0.35, 0, -1.25); cust.root.position.set(-0.75, 0, 0.12); blob.position.set(-0.75, 0.004, 0.14);
      const pay = id === 'payoff';
      cust.root.visible = id !== 'trad' && !pay; blob.visible = id !== 'trad'; clip.root.visible = shears.g.visible = bigQ.g.visible = pay;
      if (pay) {
        // snip (63.1), he lifts the quarter to his eye (63.25-63.6): copper, not silver; a slow, let-down shrug (64.0)
        clip.face(camera, S.sun);
        clip.root.position.set(-0.75, 0, 0.12);
        const lift = sm(t, 63.25, 63.6), shrug = sm(t, 63.95, 64.35);
        const qh = [lerp(200, 250, lift), lerp(420, 250, lift)];
        clip.set({ expr: t < 63.4 ? 'smug' : t < 63.95 ? 'o' : 'worried', face: { sweat: false }, blink: lidAt(t, 9), look: t < 63.95 ? -0.6 : 0, arms: { L: qh, R: [lerp(430, 470, shrug), lerp(450, 380, shrug)], bend: -30 - 20 * shrug }, ol: 0.85 });
        clip.face(camera); clip.root.updateMatrixWorld(true);
        root.worldToLocal(handFront(clip, qh[0], qh[1], camera, 0.07, bigQ.g.position)); bigQ.g.position.y += 0.012 * boing(t, 63.1, 0.3);
        bigQ.g.lookAt(camera.getWorldPosition(cam)); bigQ.mesh.rotation.set(PI / 2, 0, 0); bigQ.g.rotateY(lerp(0.2, 1.25, lift)); bigQ.g.visible = true;
        root.worldToLocal(handFront(clip, lerp(430, 470, shrug), lerp(450, 380, shrug), camera, 0.09, shears.g.position));
        shears.g.lookAt(cam); shears.g.rotateX(PI / 2); shears.g.rotateY(PI - 0.4); shears.open(Math.abs(t - 63.1) < 0.12 ? Math.abs(t - 63.1) / 0.12 : 1);
      }
      if (id === 'wide' || id === 'end') {
        const drop = id === 'wide' ? sm(t, 44.0, 44.5) : 1;
        cashier.set({ expr: 'neutral', blink: lidAt(t, 81), look: -1, arms: { L: drop < 1 ? [120, 430] : [170, 600], R: [430, 600], bend: -20 } });
        cust.set({ expr: 'neutral', blink: lidAt(t, 83), look: 1, arms: { L: [170, 600], R: [450, 500], bend: -30 } });
        cashier.face(camera); cashier.root.updateMatrixWorld(true);
        const from = root.worldToLocal(handFront(cashier, 120, 430, camera, 0.1, new THREE.Vector3()));
        coins.forEach((c, i) => {
          const u = clamp((t - (44.0 + i * 0.12)) / 0.45), target = DISH.clone().add(new THREE.Vector3((i - 1) * 0.06, i * 0.006, (i % 2) * 0.03));
          if (id === 'end' || u >= 1) { lay(c, target.x, target.z, i); c.g.position.y = target.y; return; }
          c.g.visible = true; c.g.position.lerpVectors(from, target, u); c.g.position.y += Math.sin(u * PI) * 0.12; c.g.rotation.set(u * 9 + i, i, 0);
        });
      }
      if (pay) cashier.set({ expr: t > 63.9 ? 'smug' : 'neutral', blink: lidAt(t, 81), look: -1, arms: { L: [170, 600], R: [430, 600], bend: -20 } });
      if (id === 'trad') {
        cashier.set({ expr: t > 51.3 ? 'grin' : 'neutral', blink: lidAt(t, 81), look: 1, arms: { L: [90, 470], R: [510, 470], bend: -70 } });
        cashier.root.position.set(1.3, 0, -1.6);
      }
      if (id === 'dark') {
        const pk = power(t);
        cust.root.position.set(-0.45, 0, 0.1); blob.position.set(-0.45, 0.004, 0.12);
        cashier.set({ expr: pk > 0.5 && t > 54 ? 'o' : 'neutral', blink: lidAt(t, 81), look: -1 });
        cust.set({ expr: t > 53.6 ? 'grin' : 'neutral', blink: t > 52.4 && t < 55.05 ? 1 : lidAt(t, 83), arms: { L: [170, 600], R: null }, ol: 0.85 });
        cust.face(camera); cust.root.updateMatrixWorld(true);
        // coins in the dish; her fingers rummage, lift the dime (53.55) and set it down by the register (54.4)
        lay(quarter, DISH.x - 0.05, DISH.z + 0.02, 0.3); lay(penny, DISH.x + 0.05, DISH.z - 0.01, 1.1);
        const lift = sm(t, 53.5, 53.85), put = sm(t, 54.1, 54.5);
        const rummage = new THREE.Vector3(DISH.x + 0.03 * Math.sin(t * 9), CY + 0.07 + 0.015 * Math.sin(t * 13), DISH.z + 0.025 * Math.cos(t * 7));
        const up = new THREE.Vector3(DISH.x + 0.02, CY + 0.28, DISH.z + 0.08), down = new THREE.Vector3(C.register[0] - 0.42, CY + 0.06, C.dish[1] - 0.05);
        const h = t < 53.5 ? rummage : put <= 0 ? rummage.clone().lerp(up, lift) : up.clone().lerp(down, put);
        if (t > 52.5) { arm.arm.visible = arm.ball.visible = true; arm.set(cardPoint(cust, 364, 410), root.localToWorld(h.clone())); }
        else { arm.arm.visible = arm.ball.visible = true; arm.set(cardPoint(cust, 364, 410), root.localToWorld(new THREE.Vector3(-0.42, CY + 0.06, -0.15))); }
        if (t < 53.5) lay(dime, DISH.x + 0.01, DISH.z + 0.04, 0.7);
        else { dime.g.visible = true; dime.g.position.copy(h).add(new THREE.Vector3(0.0, -0.035, 0.02)); dime.g.lookAt(cam); dime.mesh.rotation.x = PI / 2; if (put >= 1) { lay(dime, down.x, down.z, 0.4); } glint.visible = power(t) < 0.5; glint.position.copy(dime.g.position); glint.scale.setScalar(0.12 + 0.03 * Math.sin(t * 12)); }
      }
      cashier.face(camera); cust.face(camera);
    },
  };
}
