// dh013 — "Why do coins have ridges?" (v2: re-cut to the viral explainer formula, hook first). The channel's first narrated cartoon explainer (engine/toon look, ElevenLabs
// narrator Brian; make_voice.py tightens the takes and writes words.js). 26 shots over 8 places: a macro tabletop, a
// 1690s London street, a clipper's attic, a tavern, the Royal Mint in the Tower, Parliament, the Old Bailey, a modern
// corner store. Zoom-dissolves (engine/toon/kit.js makeDissolve) on the place changes marked `dis`.
//
// Facts (checked Nov 1 2026):
//  - Pre-1662 hammered silver was clipped; by 1695 bags of it weighed about half their face value (Exchequer weighing of
//    1695: ~114,000 oz against ~221,000 oz, quoted from Oman) — oldcurrencyexchange.com/2015/07/19/the-great-monetary-crisis-of-the-1690s/
//  - Great Recoinage of 1696: clipped hammered coin called in, re-struck by machine with milled edges (machine coins
//    with milled edges since 1662) — en.wikipedia.org/wiki/Great_Recoinage_of_1696
//  - Newton: Warden of the Mint 1696–1699, Master 1699–1727; "Disguised as a habitué of bars and taverns, he gathered much
//    of that evidence himself"; 100+ cross-examinations, 28 coiners prosecuted — en.wikipedia.org/wiki/Isaac_Newton
//  - William Chaloner accused the Mint before Parliament / the Lord Justices (1696–97) and "insinuated that Newton was
//    incompetent"; arrested 1697, bribed the star witness to flee to Scotland and was released; convicted of high treason at the
//    Old Bailey on 3 March 1699 (jury out a few minutes) after ~2 more years of pursuit — en.wikipedia.org/wiki/William_Chaloner,
//    mentalfloss.com/history/isaac-newton-17th-century-londons-dirty-harry. Execution not shown or narrated.
//  - Coinage Act of 1965: US dimes + quarters became copper-nickel clad, no silver; reeding kept for tradition and so the
//    blind / anyone can tell coins apart by touch (dime vs penny); a quarter has 119 reeds, a dime 118 —
//    ngccoin.com/news/article/513/, mentalfloss.com/live-smarter/money/why-coins-have-ridges, learn.apmex.com/answers/how-many-ridges-are-on-u-s-coins/
import * as THREE from 'three';
import { toonPost } from '@engine/toon/post.js';
import { setTone } from '@engine/toon/shade.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeEnv } from '@engine/toon/light.js';
import { MOOD } from '@engine/toon/mood.js';
import { makeWordCaption } from '@engine/toon/caption.js';
import { makeDissolve } from '@engine/toon/kit.js';
import { WORDS } from './words.js';
import { makeMacro } from './scenes/macro.js';
import { makeStreet } from './scenes/street.js';
import { makeGarret } from './scenes/garret.js';
import { makeTavern } from './scenes/tavern.js';
import { makeMint } from './scenes/mint.js';
import { makeParl, makeCourt } from './scenes/halls.js';
import { makeStore } from './scenes/store.js';

// v2 (Nov 2 2026): no title card; the hook statement plays over frame 0. Shots made for v1 run
// their old choreography on t = src + rate·(T − t0) (dh005's retime trick); shots without src run on video time T.
export const SHOTS = [
  { t0: 0, t1: 4.85, set: 'tavern', id: 'hook' },
  { t0: 4.85, t1: 7.3, set: 'parl', id: 'parl', src: 38.95, dis: true },
  { t0: 7.3, t1: 9.2, set: 'parl', id: 'laugh', src: 41.4 },
  { t0: 9.2, t1: 12.0, set: 'garret', id: 'clip', src: 6.75, dis: true },
  { t0: 12.0, t1: 13.55, set: 'street', id: 'stall', src: 5.4, dis: true },
  { t0: 13.55, t1: 15.3, set: 'street', id: 'chain', src: 12.09 },
  { t0: 15.3, t1: 17.45, set: 'tavern', id: 'button', src: 13.9, dis: true },
  { t0: 17.45, t1: 19.0, set: 'garret', id: 'mountain', src: 16.15, dis: true },
  { t0: 19.0, t1: 21.4, set: 'mint', id: 'scale', src: 17.94, dis: true },
  { t0: 21.4, t1: 23.4, set: 'mint', id: 'hall', src: 20.75, rate: 1.2 },
  { t0: 23.4, t1: 24.8, set: 'mint', id: 'newton', src: 22.92 },
  { t0: 24.8, t1: 27.35, set: 'macro', id: 'sliver', dis: true },
  { t0: 27.35, t1: 29.4, set: 'garret', id: 'king', src: 36.85, dis: true },
  { t0: 29.4, t1: 31.6, set: 'court', id: 'dock', src: 41.0, dis: true },
  { t0: 31.6, t1: 35.0, set: 'street', id: 'bribe', dis: true },
  { t0: 35.0, t1: 38.55, set: 'tavern', id: 'informant', dis: true },
  { t0: 38.55, t1: 40.3, set: 'court', id: 'wide', dis: true },
  { t0: 40.3, t1: 42.65, set: 'court', id: 'jury', src: 41.2 },
  { t0: 42.65, t1: 44.9, set: 'mint', id: 'melt', src: 23.8, dis: true },
  { t0: 44.9, t1: 46.75, set: 'mint', id: 'press', src: 26.17 },
  { t0: 46.75, t1: 48.3, set: 'macro', id: 'mill', src: 27.75, dis: true },
  { t0: 48.3, t1: 50.5, set: 'macro', id: 'shave', src: 29.63 },
  { t0: 50.5, t1: 51.45, set: 'street', id: 'caught', src: 31.85, dis: true },
  { t0: 51.45, t1: 54.75, set: 'macro', id: 'jar', dis: true },
  { t0: 54.75, t1: 56.5, set: 'store', id: 'wide', src: 43.75, dis: true },
  { t0: 56.5, t1: 58.9, set: 'macro', id: 'clad', src: 45.5, dis: true },
  { t0: 58.9, t1: 61.3, set: 'macro', id: 'count', src: 48.25 },
  { t0: 61.3, t1: 62.9, set: 'store', id: 'trad', src: 50.6, dis: true },
  { t0: 62.9, t1: 99, set: 'store', id: 'payoff' },
];
/** a shot's own clock: v1 shots replay their old choreography, new shots run on video time */
const clock = (shot, T) => (shot.src == null ? T : shot.src + (shot.rate ?? 1) * (T - shot.t0));
const MAKERS = { macro: makeMacro, street: makeStreet, garret: makeGarret, tavern: makeTavern, mint: makeMint, parl: makeParl, court: makeCourt, store: makeStore };
const OFF = { macro: [0, 0, 0], street: [100, 0, 0], garret: [200, 0, 0], tavern: [300, 0, 0], mint: [400, 0, 0], parl: [500, 0, 0], court: [600, 0, 0], store: [700, 0, 0] };

export async function build(studio) {
  const { scene, camera, renderer } = studio;
  studio.fill.intensity = 0;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // toon look v3 "premium pass": tinted world lines + AO, bokeh, GRADE_RICH, real metals reflecting one env per set
  const post = toonPost(studio, { grade: GRADE_RICH, bloom: { threshold: 1.05, strength: 0.35, radius: 0.85 },
    ink: { widthNear: 3.6, widthFar: 2.3, distNear: 1.5, distFar: 40, tint: 0.7, ao: 0.85, aoRadius: 0.35 }, lens: { maxCoC: 32, bokeh: 0.5 } });
  const sets = {};
  for (const [k, fn] of Object.entries(MAKERS)) {
    const root = new THREE.Group(); root.position.set(...OFF[k]); scene.add(root); root.updateMatrixWorld(true);
    sets[k] = { root, ...fn(root) };
  }
  // one prefiltered environment per set (+ per shot where a set has two moods); only toonMetal materials read it
  const envs = {}, made = new Map(), env = (o) => made.get(o) || made.set(o, makeEnv(renderer, o)).get(o);
  for (const k in sets) {
    envs[k] = env(sets[k].look.env || MOOD.interior.env);
    for (const id in sets[k].shots) if (sets[k].shots[id].env) envs[k + '.' + id] = env(sets[k].shots[id].env);
  }
  const caption = makeWordCaption(WORDS, { size: 78 });
  // this format has no HUD and no subtitles; their empty backdrops would still draw a smudge
  for (const id of ['hud', 'sub']) document.getElementById(id).style.display = 'none';
  const dissolve = makeDissolve({ dur: 0.45, zoom: 0.22 });
  const add = (v, o) => v.map((x, i) => x + o[i]);
  const fwd = new THREE.Vector3(), tmp = new THREE.Vector3();

  function apply(shot, T) {
    const t = clock(shot, T), S = sets[shot.set], sh = S.shots[shot.id], o = OFF[shot.set];
    for (const k in sets) sets[k].root.visible = k === shot.set;
    scene.background = S.look.bg; scene.fog = S.look.fog || null;
    scene.environment = envs[shot.set + '.' + shot.id] || envs[shot.set]; scene.environmentIntensity = 1; studio.bloom.strength = sh.bloom ?? S.look.bloom ?? 0.35;
    const tone = sh.tone || S.tone;
    setTone(typeof tone === 'function' ? tone(t) : tone);
    post.grade.set(sh.grade || S.look.grade); renderer.toneMappingExposure = S.look.exposure;
    camera.near = S.look.near; camera.far = S.look.far;
    const c = sh.cam(t);
    studio.setCamera(add(c.p, o), add(c.a, o), c.fov, t, 0);
    camera.updateMatrixWorld(true);
    S.update(t, camera, shot.id);
    for (const sh of S.shafts || []) sh.face(camera);
    for (const m of S.motes || []) m.update(T, camera, renderer);
    if (S.sky) S.sky.update(camera, T);
    camera.getWorldDirection(fwd);
    const focus = tmp.set(...add(sh.focus(t), o)).sub(camera.position).dot(fwd);
    post.lens.set(Math.max(0.05, focus), sh.cInf ?? S.look.cInf, sh.slab || 0);
  }
  function update(t) {
    const i = Math.max(0, SHOTS.findIndex((s) => t >= s.t0 && t < s.t1));
    const shot = SHOTS[i];
    dissolve.update(t, shot.dis ? shot.t0 : null, () => { apply(SHOTS[i - 1], shot.t0 - 1 / 30); studio.render(shot.t0); });
    apply(shot, t);
    caption.update(t);
  }
  return { update };
}
