// dh015 — "The Man Who Sold the Eiffel Tower" (Victor Lustig, 1925). Narrated cartoon explainer in the toon look v3
// (premium pass), written to the explainer formula: no title card, the hook statement from frame 4, a doubter (his
// wife smells something fishy), the mid-video question, the "You see," reveal at ~67 % (he asked for a bribe) with
// an everyday analogy (a bouncer and twenty bucks), the death-certificate payoff, no end card. Narration: voice.json
// -> tools/tts.py (Brian) -> make_voice.py -> timeline.js (LINES, WORDS). 29 pictures over 8 places; new sets in
// engine/sets/toon1925/ (tower, suite, yard, train, deck, club, alcatraz).
//
// Sources (checked Nov 2 2026; numbers + quotes also in caption.md):
//  - Victor Lustig, Wikipedia: posed as Deputy Director-General of the Ministère de Postes et Télégraphes; fake
//    government stationery; a small group of scrap dealers, the tower's upkeep "too much for Paris", sold for scrap,
//    secret to avoid a public outcry; André Poisson, insecure, wanted to rise among Paris's business elite; Lustig
//    played a corrupt official short of salary, Poisson paid a bribe; ~70,000 francs; fled to Austria; Poisson too
//    ashamed to go to the police; Lustig returned to Paris, tried again, the police were informed, he fled to the US;
//    death 11 Mar 1947 (Medical Center for Federal Prisoners, Springfield MO), occupation on the death certificate
//    "apprentice salesman and counterfeiter". https://en.wikipedia.org/wiki/Victor_Lustig
//  - The death certificate itself (Wikimedia Commons, File:Victor_Lustig_Death_Certificate.png): "Usual occupation:
//    Apprentice Salesman & Counterfeiter" (filed under the alias Robert V. Miller).
//  - Gilbert King, "The Smoothest Con Man That Ever Lived", Smithsonian (2012): rusting tower, costly repairs, "Many
//    felt the unsightly tower should be taken down"; Hôtel de Crillon; 7,000 tons of metal; limousines + tours to pick
//    the mark; Poisson new to the city; Lustig hinted officials earned little — "who else would dare seek a bribe?";
//    Poisson too embarrassed to report it. (It gives the money as $20,000 + $50,000, not francs: see caption.md.)
//  - Jeff Maysh, "The Man Who Sold the Eiffel Tower. Twice.", Smithsonian (2016): reached Alcatraz 27 Apr 1936,
//    prisoner #300; the 1925 story traced to Secret Service agent James Johnson's memoir (the 1961 book).
//  - Today I Found Out (2015): Poisson's wife thought the deal seemed fishy.
// Guardrails: Lustig + Poisson are cartoons, not likenesses; the contract, letterhead, nameplate and the death
// certificate are our own simplified drawings (the certificate shows only the real date, place and occupation).
import * as THREE from 'three';
import { toonPost } from '@engine/toon/post.js';
import { setTone } from '@engine/toon/shade.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeEnv } from '@engine/toon/light.js';
import { makeWordCaption } from '@engine/toon/caption.js';
import { makeDissolve } from '@engine/toon/kit.js';
import { WORDS } from './timeline.js';
import { makeParis } from './scenes/paris.js';
import { makeSuite } from './scenes/suite.js';
import { makeYard } from './scenes/yard.js';
import { makeTrain, makeDeck, makeClub, makeIsland, makeCell } from './scenes/misc.js';

// one entry per picture (video time); dis = zoom-dissolve into it (place changes)
export const SHOTS = [
  { t0: 0, set: 'paris', id: 'hook' },
  { t0: 1.15, set: 'paris', id: 'contract' },
  { t0: 2.75, set: 'paris', id: 'stakes' },
  { t0: 5.56, set: 'paris', id: 'rust', dis: true },
  { t0: 7.3, set: 'paris', id: 'parisians' },
  { t0: 9.08, set: 'suite', id: 'letter', dis: true },
  { t0: 11.35, set: 'suite', id: 'invite', dis: true },
  { t0: 14.2, set: 'suite', id: 'ministry' },
  { t0: 17.23, set: 'suite', id: 'secret' },
  { t0: 19.94, set: 'paris', id: 'limo', dis: true },
  { t0: 22.9, set: 'paris', id: 'poisson' },
  { t0: 26.19, set: 'yard', id: 'wife', dis: true },
  { t0: 28.31, set: 'suite', id: 'paid', dis: true },
  { t0: 29.99, set: 'train', id: 'train', dis: true },
  { t0: 32.26, set: 'yard', id: 'shame', dis: true },
  { t0: 34.69, set: 'suite', id: 'again', dis: true },
  { t0: 36.98, set: 'suite', id: 'police' },
  { t0: 38.85, set: 'deck', id: 'america', dis: true },
  { t0: 40.35, set: 'yard', id: 'question', dis: true },
  { t0: 42.7, set: 'suite', id: 'reveal', dis: true },
  { t0: 44.86, set: 'suite', id: 'salary' },
  { t0: 47.3, set: 'suite', id: 'slide' },
  { t0: 48.7, set: 'suite', id: 'dare' },
  { t0: 50.05, set: 'suite', id: 'real' },
  { t0: 51.64, set: 'club', id: 'bouncer', dis: true },
  { t0: 53.7, set: 'club', id: 'skip' },
  { t0: 55.43, set: 'island', id: 'island', dis: true },
  { t0: 57.3, set: 'cell', id: 'cell', dis: true },
  { t0: 59.44, set: 'cell', id: 'postcard' },
  { t0: 60.8, set: 'cell', id: 'cert' },
];
SHOTS.forEach((s, i) => { s.t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : 1e9; });
const MAKERS = { paris: makeParis, suite: makeSuite, yard: makeYard, train: makeTrain, deck: makeDeck, club: makeClub, island: makeIsland, cell: makeCell };
const OFF = { paris: [0, 0, 0], suite: [3000, 0, 0], yard: [3200, 0, 0], train: [3400, 0, 0], deck: [5000, 0, 0], club: [3600, 0, 0], island: [8000, 0, 0], cell: [3800, 0, 0] };

export async function build(studio) {
  const { scene, camera, renderer } = studio;
  studio.fill.intensity = 0;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // toon look v3 "premium pass": tinted world lines + AO, bokeh, GRADE_RICH, real metals reflecting one env per set
  const post = toonPost(studio, { grade: GRADE_RICH, bloom: { threshold: 1.05, strength: 0.3, radius: 0.85 },
    ink: { widthNear: 3.6, widthFar: 2.3, distNear: 1.5, distFar: 60, tint: 0.7, ao: 0.85, aoRadius: 0.35 }, lens: { maxCoC: 30, bokeh: 0.5 } });
  const sets = {};
  for (const [k, fn] of Object.entries(MAKERS)) {
    const root = new THREE.Group(); root.position.set(...OFF[k]); scene.add(root); root.updateMatrixWorld(true);
    sets[k] = { root, ...fn(root) };
  }
  const made = new Map(), env = (o) => made.get(o) || made.set(o, makeEnv(renderer, o)).get(o);
  const envs = {};
  for (const k in sets) envs[k] = env(sets[k].look.env);
  const caption = makeWordCaption(WORDS, { size: 78 });
  for (const id of ['hud', 'sub', 'end', 'title']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
  const dissolve = makeDissolve({ dur: 0.42, zoom: 0.2 });
  const add = (v, o) => v.map((x, i) => x + o[i]);
  const fwd = new THREE.Vector3(), tmp = new THREE.Vector3();

  function apply(shot, t) {
    const S = sets[shot.set], sh = S.shots[shot.id], o = OFF[shot.set];
    for (const k in sets) sets[k].root.visible = k === shot.set;
    scene.background = S.look.bg; scene.fog = S.look.fog || null;
    scene.environment = envs[shot.set]; studio.bloom.strength = sh.bloom ?? S.look.bloom ?? 0.3;
    setTone(typeof S.tone === 'function' ? S.tone(t, shot.id) : S.tone);
    post.grade.set(S.grade ? S.grade(shot.id) : S.look.grade); renderer.toneMappingExposure = S.look.exposure;
    camera.near = S.look.near; camera.far = S.look.far;
    const c = sh.cam(t);
    studio.setCamera(add(c.p, o), add(c.a, o), c.fov, t, 0);
    camera.updateMatrixWorld(true);
    S.update(t, camera, shot.id);
    for (const m of S.motes || []) m.update(t, camera, renderer);
    if (S.sky) S.sky.update(camera, t);
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
