// dh014 — "The Bird That Beat an Army" (the Emu War). Narrated cartoon explainer (engine/toon look, Brian via ElevenLabs).
// v2 (Nov 2 2026) = the re-cut: no title card, the hook statement from frame 4, a doubter,
// a mid-video question, the reveal at ~72 %, no end card. Narration: voice.json -> make_voice.py -> timeline.js (LINES,
// WORDS). recut.js = the picture table: v2 shots run on video time; v1 shots replay their v1 choreography (frozen in
// timeline_v1.js) from src at rate. Sets: world.js (outback: farm, road, camp, paddock, dam, plain, fence) + rooms.js
// (briefing tent, parliament, newspaper, coat of arms, v2's bowling alley).
//
// Sources (checked Nov 1 2026):
//  - Emu War, Wikipedia (cites Johnson 2006 J. Australian Studies; Robin et al. 2009; The Argus 18 Oct + 19 Nov 1932;
//    The West Australian 9 Nov 1932; Sunday Herald 5 Jul 1953): ~20,000 emus, Campion district WA; Major G. P. W. Meredith
//    (7th Heavy Battery RAA) + 2 soldiers, 2 Lewis guns, 10,000 rounds; ops from 2 Nov 1932; birds "split into small groups
//    and ran"; 4 Nov dam ambush, >1,000 emus, the gun jammed; gun mounted on a truck that "was unable to gain on the birds"
//    and rode too rough to fire; army observers: "each pack seems to have its own leader"; withdrawn 8 Nov after 2,500
//    rounds; Meredith: "They can face machine guns with the invulnerability of tanks"; MP Rowley James asked PM Lyons
//    whether a medal would be struck for the soldiers; 2nd attempt 13 Nov-10 Dec, Meredith's report 986 kills from
//    9,860 rounds ("exactly 10 rounds per confirmed kill", disputed); bounties (57,034 claimed in 6 months of 1934) and
//    exclusion fencing worked better. https://en.wikipedia.org/wiki/Emu_War
//  - Australian Geographic, "Looking back: Australia's Emu Wars" (2016): "at least 20,000", 2 Lewis guns + 10,000 rounds,
//    ~2,500 rounds fired in the first operation, the dam jam, the truck couldn't keep up, the tanks quote, bounty most
//    effective. https://www.australiangeographic.com.au/topics/wildlife/2016/10/australias-emu-wars/
//  - v2 additions (same Wikipedia page, checked Nov 2 2026): Pearce backed it as "good target practice"; "a cinematographer
//    from Fox Movietone was enlisted"; 2 Nov: settlers herded the emus toward an ambush, they split up, ~a dozen killed;
//    4 Nov: "the gunners waited until the birds were in close proximity", the gun jammed after 12; "ridicule of the
//    military", the media named it the "Emu War"; Rowley James "mockingly asked" about medals.
//  - Coat of arms of Australia, Wikipedia: kangaroo + emu supporters since 7 May 1908, kept in the 19 Sep 1912 grant,
//    still the supporters today. https://en.wikipedia.org/wiki/Coat_of_arms_of_Australia
// Guardrails: no bird is shot on screen (they dodge, scatter, outrun, stare); generic soldiers, plain slouch hats, no
// insignia; Meredith is a cartoon, not a likeness; the newspaper (THE WHEATBELT GAZETTE) is fictional; the coat of arms
// is our own simplified drawing.
import * as THREE from 'three';
import { clamp, lerp, smooth } from '@engine/core.js';
import { toonPost } from '@engine/toon/post.js';
import { setTone } from '@engine/toon/shade.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes, makeEnv } from '@engine/toon/light.js';
import { makeSky } from '@engine/toon/sky.js';
import { MOOD } from '@engine/toon/mood.js';
import { makeWordCaption } from '@engine/toon/caption.js';
import { makeZoomDissolve } from '@engine/toon/extras.js';
import { buildWorld, worldShots } from './world.js';
import { buildRooms } from './rooms.js';
import { WORDS } from './timeline.js';

import { RECUT } from './recut.js';

// v2: the picture table lives in recut.js (make_cues.py reads it too); v1 shots replay their old choreography at src
export const SHOTS = RECUT.map((e) => ({ ...e }));
const tm = (s, t) => (s.src === undefined ? t : s.src + (s.rate ?? 1) * (t - s.t0));   // video time -> the shot's own clock
SHOTS.forEach((s, i) => { s.t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : 1e9; });
const OFF = { out: [0, 0, 0], tent: [400, 0, 0], parl: [800, 0, 0], news: [1200, 0, 0], arms: [1600, 0, 0], alley: [2000, 0, 0] };
const DZ = 0.42;   // dissolve length (s)

export async function build(studio) {
  const { scene, camera, renderer } = studio;
  studio.fill.intensity = 0;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // toon look v3 premium: tinted world ink (bold black stays on the toons) + AO, bokeh, richer warm-vs-cool grade
  const post = toonPost(studio, { grade: GRADE_RICH, bloom: { threshold: 1.05, strength: 0.3, radius: 0.85 },
    ink: { widthNear: 3.6, widthFar: 2.3, distNear: 2, distFar: 60, tint: 0.7, ao: 0.85, aoRadius: 0.35 }, lens: { maxCoC: 30, bokeh: 0.5 } });
  const roots = {};
  for (const k in OFF) { roots[k] = new THREE.Group(); roots[k].position.set(...OFF[k]); scene.add(roots[k]); roots[k].updateMatrixWorld(true); }
  const W = buildWorld(roots.out), WS = worldShots(W);
  const rooms = buildRooms(roots);
  const cfg = { ...WS, ...rooms.tent.shots, ...rooms.parl.shots, ...rooms.news.shots, ...rooms.arms.shots, ...rooms.alley.shots };
  // v2: no title card, the hook is the first sound and its first word is on screen from frame 4
  const caption = makeWordCaption(WORDS, { size: 78 });
  document.getElementById('sub').style.display = 'none'; document.getElementById('end').style.display = 'none';   // v2: no end card
  const dz = makeZoomDissolve(studio);
  // painted skies (sky.js): a late-afternoon day sky with lit clouds all round, a warmer morning, a sunset with rays.
  // The sky's sun follows each shot's sun (sunDir). Clouds sit at 650 m: beyond the far hills (≤ 420), inside far 1200.
  const cl = (o) => ({ ...MOOD.day.sky.clouds, n: 16, az: [-180, 180], el: [5, 24], dist: 650, size: 150, ...o });
  const skies = {
    day: makeSky(roots.out, { ...MOOD.day.sky, mid: '#8fbfe7', horizon: '#f2dcb6', haze: 0.22, clouds: cl({}) }),
    morning: makeSky(roots.out, { ...MOOD.day.sky, top: '#5d8fd0', mid: '#b2c6de', horizon: '#f6cf9c', haze: 0.26, clouds: cl({ bottom: '#f3d7c0', seed: 3 }) }),
    dusk: makeSky(roots.out, { ...MOOD.sunset.sky, clouds: { ...MOOD.sunset.sky.clouds, n: 9, az: [-40, 80], dist: 650, size: 160 } }),
  };
  const FOG = { day: 0xd9e2e6, morning: 0xead9c8, dusk: MOOD.sunset.fog };   // cool far haze against the warm sun
  // one prefiltered environment per set (only the toonMetal props read it)
  const envs = {
    out: makeEnv(renderer, { ...MOOD.day.env, horizon: '#f4dcb8', ground: '#a8764e' }), dusk: makeEnv(renderer, MOOD.sunset.env),
    tent: makeEnv(renderer, MOOD.interior.env), parl: makeEnv(renderer, { ...MOOD.interior.env, lights: [{ dir: [0, 0.8, -1], color: '#fff0d8', intensity: 6, size: 5 }, { dir: [1, 0.4, 1], color: '#ffc27a', intensity: 3, size: 2 }] }),
    news: makeEnv(renderer, MOOD.interior.env), alley: makeEnv(renderer, MOOD.interior.env),
    arms: makeEnv(renderer, { top: '#2a3a6a', horizon: '#f0c880', ground: '#2a3a3a', lights: [{ dir: [-0.5, 0.8, 1], color: '#fff0d0', intensity: 8, size: 3 }, { dir: [0, 0.3, -1], color: '#ffd27a', intensity: 6, size: 6 }] }),
  };
  const BLOOM = { out: 0.2, tent: 0.35, parl: 0.35, news: 0.25, arms: 0.3, alley: 0.35 };   // a wide bloom under a bright sky washes the frame
  // pollen / dust in the outback air, moved to each shot's subject
  const motes = { day: makeMotes(roots.out, { ...MOOD.day.motes, n: 220, box: [-6, 0.2, -6, 6, 3.4, 6], intensity: 1.6 }),
    dusk: makeMotes(roots.out, { ...MOOD.sunset.motes, n: 220, box: [-6, 0.2, -6, 6, 3.4, 6] }) };
  /** sun direction for an outdoor shot: the camera's horizontal forward turned az degrees (+ = to the left), raised el */
  const sunDir = (c, az, el) => {
    const f = new THREE.Vector3(c.a[0] - c.p[0], 0, c.a[2] - c.p[2]).normalize(), a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
    const x = f.x * Math.cos(a) + f.z * Math.sin(a), z = -f.x * Math.sin(a) + f.z * Math.cos(a);
    return [x * Math.cos(e), Math.sin(e), z * Math.cos(e)];
  };
  const add = (v, o) => v.map((x, i) => x + o[i]);
  const fwd = new THREE.Vector3(), tmp = new THREE.Vector3();

  function show(shot, t, zoom = 1) {
    const S = cfg[shot.shot], o = OFF[shot.set];
    for (const k in roots) roots[k].visible = k === shot.set;
    const c = S.cam(t);
    if (shot.set === 'out') {
      scene.background = null; scene.fog = new THREE.Fog(FOG[S.sky], S.fog[0], S.fog[1]); camera.near = 0.1; camera.far = 1200;
      const sp = S.sunFn ? S.sunFn(t) : S.sun, d = S.az !== undefined ? sunDir(c, S.az, S.el ?? 22) : sp[3];
      W.sun.aim(sp[0], sp[1], sp[2], d);
      for (const k in skies) skies[k].root.visible = k === S.sky;
      skies[S.sky].material.uniforms.sunDir.value.set(...d).normalize();
      const dusk = S.sky === 'dusk', m = dusk ? motes.dusk : motes.day, f = S.focus(t);
      motes.day.points.visible = !dusk; motes.dusk.points.visible = dusk; m.points.position.set(f[0], 0, f[2]);
      scene.environment = dusk ? envs.dusk : envs.out;
      for (const a of W.actors) a.visible = false;
      W.mill.fan.rotation.z = -t * 1.6; W.mill2.fan.rotation.z = -t * 1.3 - 1;
    } else { scene.background = S.bg; scene.fog = null; camera.near = S.near; camera.far = S.far; scene.environment = envs[shot.set]; }
    studio.bloom.strength = S.bloom ?? BLOOM[shot.set];
    setTone({ rim: [0, 0, 0], ...S.tone }); post.grade.set(S.grade || GRADE_RICH); renderer.toneMappingExposure = S.exposure ? S.exposure(t) : 1.0;
    studio.setCamera(add(c.p, o), add(c.a, o), c.fov * zoom, t, 0);
    camera.updateMatrixWorld(true);
    if (shot.set === 'out') { W.faceWheat(camera.position); W.puffs.begin(); W.flock.begin(camera); W.flock.end(); skies[S.sky].update(camera, t); (S.sky === 'dusk' ? motes.dusk : motes.day).update(t, camera); }
    S.update(t, camera);
    if (shot.set === 'out' && !S.keepPuffs) W.puffs.end();
    camera.getWorldDirection(fwd);
    const blur = S.blur ? S.blur(t) : 0;   // end card: defocus the picture under the question
    post.lens.set(lerp(Math.max(0.3, tmp.set(...add(S.focus(t), o)).sub(camera.position).dot(fwd)), 0.35, blur), lerp(S.cInf, 34, blur), (S.slab || 0) * (1 - blur));
  }
  function update(t) {
    const i = SHOTS.findIndex((s) => t >= s.t0 && t < s.t1), shot = SHOTS[i < 0 ? SHOTS.length - 1 : i];
    const u = (t - shot.t0) / DZ;
    if (shot.dz && i > 0 && u < 1) {
      show(SHOTS[i - 1], tm(SHOTS[i - 1], t), 1 - 0.18 * smooth(u));   // outgoing place keeps moving and pushes in
      studio.render(t); dz.grab();
      dz.show(1 - smooth(u), 1 + 0.12 * smooth(u));
      show(shot, tm(shot, t), lerp(0.88, 1, smooth(u)));
    } else { dz.show(0); show(shot, tm(shot, t)); }
    caption.update(t);
  }
  return { update };
}
