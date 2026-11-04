// Royal Mint beats: the bag of silver weighs half (the scale kicks up), the doors open on Newton (he catches an
// apple), old coins pour into the crucible, the screw press slams twice and a new milled coin hops off the die.
import * as THREE from 'three';
import { buildMint, MINT, PRESS_UP, PRESS_DOWN } from '@engine/sets/toon1690/mint.js';
import { makeToonX, handFront, NEWTON, CLERKX, WORKER } from '@engine/toon/kit.js';
import { lidAt, makeBlob } from '@engine/toon/cards.js';
import { makeCoin } from '@engine/toon/coins.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes } from '@engine/toon/light.js';
import { MOOD } from '@engine/toon/mood.js';
import { K, PI, sm, clamp, lerp, boing, phase, makeApple, shake } from './util.js';

const SC = MINT.scale, PR = MINT.press, FU = MINT.furnace;
const WORKER2 = { ...WORKER, jacket: '#5a5f6a', front: [['apron', '#7a4a2e', 450], ['knitCap', '#9a4a3a']] };
const CAMS = {
  scale: (t) => ({ p: [SC[0], 1.55, K(t, [[17.6, 3.2], [20.65, 2.8]])], a: [SC[0], 1.5, SC[1]], fov: 52 }),
  hall: (t) => ({ p: [0.3, K(t, [[20.65, 1.2], [23.4, 1.35]]), K(t, [[20.65, 1.9], [23.4, 1.2]])], a: [0, K(t, [[20.65, 1.9], [23.4, 1.55]]), -6], fov: 50 }),
  newton: (t) => ({ p: [0.06, 1.6, K(t, [[23.4, -2.35], [24.85, -2.95]])], a: [0, 1.55, -4.4], fov: 40 }),
  melt: (t) => ({ p: [K(t, [[24.85, 2.05], [26.3, 2.25]]), 2.45, K(t, [[24.85, -1.45], [26.3, -1.8]])], a: [FU[0], 1.7, FU[1] + 0.2], fov: 46 }),
  press: (t) => ({ p: [PR[0] + 0.4 + shake(t, 26.5, 0.03) + shake(t, 27.3, 0.03), 1.5 + shake(t, 26.5, 0.02), K(t, [[26.3, PR[1] + 4.1], [27.75, PR[1] + 3.6]])], a: [PR[0], 1.15, PR[1]], fov: 54 }),
};

export function makeMint(root) {
  const S = buildMint(root);
  // (toon look v3) cool daylight from the windows against the furnace's orange; brass + iron reflect both; dust in the
  // window shafts, embers rising off the furnace
  const ENV = { top: '#5a5868', horizon: '#c8b8a0', ground: '#4a3c32', lights: [{ dir: [-0.65, 0.42, 0.63], color: '#eef4ff', intensity: 6, size: 4 }, { dir: [0.6, 0.1, -0.5], color: '#ff8a3a', intensity: 4, size: 2 }] };
  const motes = [makeMotes(root, { ...MOOD.interior.motes, n: 260, box: [-5, 0.5, -5, 4, 3.5, 1.5], size: 0.012, color: 0xfff0d8, intensity: 1.8 }),
    makeMotes(root, { n: 60, box: [2.4, 0.8, -3.8, 3.6, 2.8, -2.6], size: 0.012, color: 0xff8a30, intensity: 3, rise: 0.3, seed: 7 })];
  const mk = (o, res) => { const tn = makeToonX(o, { res, shadow: true }); root.add(tn.root); const b = makeBlob(0.34, 0.2, 0.5); root.add(b); tn.blob = b; return tn; };
  const newton = mk(NEWTON, 2.6), clerk = mk(CLERKX, 2.2), w1 = mk(WORKER, 1.8), w2 = mk(WORKER2, 1.8), w3 = mk({ ...WORKER, jacket: '#7a6a4a' }, 1.6);
  const cast = [newton, clerk, w1, w2, w3];
  const apple = makeApple(root, 0.07);
  const pour = Array.from({ length: 9 }, (_, i) => { const c = makeCoin({ r: 0.05, h: 0.008, kind: 'hammered', clip: 0.5 + (i % 3) * 0.2, seed: 30 + i }); root.add(c.g); return c; });
  const fresh = makeCoin({ r: 0.06, h: 0.01, kind: 'shilling', ridges: 70 }); root.add(fresh.g);
  const scoop = new THREE.Group(); root.add(scoop);
  { const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.26), fresh.mats[0]); scoop.add(m); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), fresh.mats[0]); h.rotation.z = PI / 2; h.position.x = -0.6; scoop.add(h); }
  const cam = new THREE.Vector3();
  const place = (tn, x, z, y = 0) => { tn.root.position.set(x, y, z); tn.blob.position.set(x, 0.004, z + 0.02); tn.root.visible = tn.blob.visible = true; };
  return {
    look: { grade: GRADE_RICH, exposure: 1.0, near: 0.05, far: 60, bg: S.bg, fog: S.fog, cInf: 12, env: ENV, bloom: 0.35 }, shafts: S.shafts, motes,
    tone: { lit: [1.38, 1.24, 1.02], shade: [0.4, 0.44, 0.7], sat: 0.88, term: 0.22, lambert: 0.4, rim: [0.14, 0.16, 0.24], charTint: [1.0, 0.96, 0.92], charShade: 0.64, charGain: 0.98, headGrad: 0.34, bodyGrad: 0.45 },
    shots: {
      scale: { cam: CAMS.scale, focus: () => [SC[0], 1.5, SC[1] - 0.35], cInf: 12, slab: 0.8 },
      hall: { cam: CAMS.hall, focus: (t) => [0, 1.4, K(t, [[21.2, -6.4], [23.2, -4.6]])], cInf: 8 },
      newton: { cam: CAMS.newton, focus: () => [0, 1.5, -4.4], cInf: 16 },
      melt: { cam: CAMS.melt, focus: () => [FU[0], 1.6, FU[1] + 0.2], cInf: 12, slab: 1.0 },
      press: { cam: CAMS.press, focus: () => [PR[0], 1.0, PR[1]], cInf: 10, slab: 1.2 },
    },
    update(t, camera, id) {
      for (const tn of cast) tn.face(camera, S.sun);
      for (const tn of cast) tn.root.visible = tn.blob.visible = false;
      S.scale.g.visible = id !== 'hall';
      apple.visible = scoop.visible = fresh.g.visible = false; for (const c of pour) c.g.visible = false;
      camera.getWorldPosition(cam);
      // the balance: level, then the bag's side kicks up at "half"
      const kick = id === 'scale' ? boing(t, 19.45, 0.5) : 0;
      // the sack lands as the shot opens: the beam rocks and settles level, then kicks up at "half"
      const settle = id === 'scale' && t < 19.45 ? 0.09 * Math.sin((t - 17.6) * 4.2) * Math.exp(-(t - 17.6) * 0.9) : 0;
      S.scale.beam.rotation.z = -0.32 * kick + settle; for (const p of S.scale.pans) p.rotation.z = -S.scale.beam.rotation.z;
      // doors + light shaft
      const open = id === 'hall' ? sm(t, 20.9, 21.8) : id === 'newton' ? 1 : 0;
      S.doors.L.rotation.y = -1.35 * open; S.doors.R.rotation.y = 1.35 * open; S.shaft.material.opacity = 0.22 * open; S.doorLamp.intensity = 3.5 * open; S.doorGlow.material.color.setScalar(0.5 * open);
      // press: ram up, slam at 26.47 + 27.27 (struck … by machine), bar spins with each slam
      const slam = (t0) => (t < t0 - 0.12 ? 0 : t < t0 ? (t - (t0 - 0.12)) / 0.12 : Math.max(0, 1 - (t - t0) / 0.45));
      const down = id === 'press' ? Math.max(slam(26.47), slam(27.27)) : 0;
      S.press.screw.position.y = lerp(PRESS_UP, PRESS_DOWN, down);
      S.press.screw.rotation.y = id === 'press' ? 0.9 * (sm(t, 26.3, 26.47) + sm(t, 27.0, 27.27)) : 0;
      S.furnace.meltGlow.scale.setScalar(1.2 + 0.15 * Math.sin(t * 9) + (id === 'melt' ? 0.5 * sm(t, 25.4, 25.9) : 0));
      if (id === 'scale') {
        place(clerk, SC[0] + 0.55, SC[1] - 0.75);
        clerk.set({ expr: t > 19.5 ? 'o' : 'worried', face: { sweat: t > 19.5 }, blink: lidAt(t, 41), look: t > 19.5 ? -1 : Math.sin((t - 17.6) * 2.4), arms: t > 19.5 ? { L: [100, 330], R: [500, 330], bend: -40 } : { L: [190, 560], R: [420, 560], bend: -30 }, ol: 0.85 });
        place(w1, SC[0] - 1.9, SC[1] - 2.2); w1.set({ expr: 'neutral', blink: lidAt(t, 43), look: 1 });
        place(w2, SC[0] + 1.8, SC[1] - 2.6); w2.set({ expr: 'neutral', blink: lidAt(t, 44), look: -1, arms: { L: [150, 420], R: [450, 420], bend: -40 } });
      }
      if (id === 'hall') {
        const u = sm(t, 21.2, 23.2), z = lerp(-7.0, -4.6, u);
        place(newton, 0, z); newton.set({ expr: 'stern', blink: lidAt(t, 51), walk: u > 0 && u < 1 ? phase((z + 7) * 1.0) : null });
        place(w1, -1.7, -3.2); w1.set({ expr: t > 21.6 ? 'o' : 'neutral', blink: lidAt(t, 43), look: 1 });
        place(w2, 1.6, -2.4); w2.set({ expr: t > 21.8 ? 'o' : 'neutral', blink: lidAt(t, 44), look: -1 });
        place(clerk, 2.3, -4.2); clerk.set({ expr: t > 21.7 ? 'o' : 'worried', face: { sweat: false }, blink: lidAt(t, 41), look: -1 });
      }
      if (id === 'newton') {
        place(newton, 0, -4.4);
        const catchT = 23.92, got = t >= catchT;
        newton.set({ expr: got ? 'smug' : 'stern', blink: lidAt(t, 51), look: got ? 0 : K(t, [[23.4, 0], [23.6, 0.6]]), arms: { L: [180, 590], R: got ? [470, 330] : [lerp(430, 470, sm(t, 23.5, 23.8)), lerp(600, 330, sm(t, 23.5, 23.8))], bend: -40 }, ol: 0.75 });
        newton.face(camera); newton.root.updateMatrixWorld(true);
        const hand = root.worldToLocal(handFront(newton, 470, 330, camera, 0.09, new THREE.Vector3()));
        if (got) apple.position.copy(hand).add(new THREE.Vector3(0, 0.05 + 0.03 * Math.exp(-(t - catchT) * 12) * Math.sin((t - catchT) * 40), 0));
        else apple.position.set(hand.x, hand.y + 0.05 + 4.9 * Math.pow(Math.max(0, catchT - t), 2) * 1.0, hand.z);
        apple.rotation.y = t * 2; apple.visible = t > 23.45;
      }
      if (id === 'melt') {
        place(w1, FU[0] - 1.2, FU[1] + 0.9);
        w1.set({ expr: 'stern', blink: lidAt(t, 43), look: 1, arms: { L: [380, 470], R: [560, 420], bend: -20 } });
        const tip = sm(t, 25.0, 25.35);
        scoop.visible = true; scoop.position.set(FU[0] - 0.55, 1.95, FU[1] + 0.45); scoop.rotation.set(0, -0.5, -0.9 * tip);
        const cru = new THREE.Vector3(FU[0], 1.82, FU[1] + 0.2);
        pour.forEach((c, i) => {
          const t0 = 25.15 + i * 0.07, u = clamp((t - t0) / 0.5);
          if (u >= 1) return;
          c.g.visible = true;
          c.g.position.set(lerp(FU[0] - 0.4, cru.x, u) + Math.sin(i) * 0.05, lerp(2.05, cru.y, u * u) + Math.sin(u * PI) * 0.12, lerp(FU[1] + 0.4, cru.z, u) + Math.cos(i) * 0.04);
          c.g.rotation.set(i + t * 6, i * 2, t * 4);
        });
        place(w2, FU[0] + 1.25, FU[1] + 1.1); w2.set({ expr: 'neutral', blink: lidAt(t, 44), look: -1 });
      }
      if (id === 'press') {
        // two workers at the ends of the bar, arms up on the iron balls
        place(w1, PR[0] - 1.0, PR[1] + 0.3); place(w2, PR[0] + 1.0, PR[1] + 0.3);
        const strain = down > 0.3;
        w1.set({ expr: strain ? 'o' : 'stern', blink: lidAt(t, 43), arms: { L: [160, 120], R: [430, 600], bend: 20 } });
        w2.set({ expr: strain ? 'o' : 'stern', blink: lidAt(t, 44), arms: { L: [170, 600], R: [440, 120], bend: 20 } });
        place(newton, PR[0] + 1.55, PR[1] - 0.45); newton.set({ expr: t > 27.35 ? 'smug' : 'stern', blink: lidAt(t, 51), look: -1, arms: { L: [190, 560], R: [420, 560], bend: -30 } });
        // the new coin hops off the die and lands on the base
        const hop = clamp((t - 27.35) / 0.45);
        if (t > 27.3) {
          fresh.g.visible = true;
          fresh.g.position.set(PR[0] + 0.12 + hop * 0.3, 0.8 + Math.sin(hop * PI) * 0.35, PR[1] + 0.25 * hop + 0.05);
          fresh.mesh.rotation.set(PI / 2 * (1 - hop) + hop * 0.0, 0, 0); fresh.g.rotation.y = hop * 2.0;
          if (hop >= 1) fresh.g.position.y = 0.51;
        }
      }
      for (const tn of cast) if (tn.root.visible) tn.face(camera);
    },
  };
}
