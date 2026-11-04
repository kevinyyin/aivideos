// dh016 — "The Engineers Who Saved Pisa by Digging Under It". Narrated cartoon explainer (engine/toon look v3 premium,
// Brian via ElevenLabs), built to the explainer formula: no title card, the hook statement from 0.12 s, a doubter
// (the mayor's jab, tomatoes, bookies), the mid-video question, the reveal at ~68 %, the payoff on the bookies' bet.
// Narration: voice.json -> tools/tts.py -> make_voice.py -> timeline.js (LINES, WORDS). Picture table: cut.js (also
// read by make_cues.py). Places: world.js (the piazza in every era, the cutaway section, a kitchen) on
// engine/sets/pisa.js (new: the tower model, the Piazza dei Miracoli, the soil section).
//
// Sources (checked Nov 2 2026; details + URLs in caption.md):
//  - J. B. Burland, "The stabilisation of the Leaning Tower of Pisa", Ingenia 10 (Nov 2001): construction began Aug 1173;
//    work stopped ~1178 at the 4th storey and ~1278 at the 7th; "had the construction continued much further ... the
//    Tower would have fallen over"; the clay had strengthened by consolidation in the pause; 14,500 t; foundations
//    sloped 5.5 deg in 1990; 1934 grout injection into the foundation masonry -> a sudden movement south of ~10 mm;
//    1993: 600 t of lead on the north side via a removable concrete ring; Sept 1995: raised to 900 t during an
//    unsuccessful attempt to replace the lead with ground anchors; "any slight disturbance to the ground on the south
//    side would almost certainly trigger collapse"; soil extraction from beneath the north side (augers in casings);
//    target + result: half a degree, "not visible to the casual observer"; 440 mm back at the 7th floor.
//  - Leaning Tower of Pisa, Wikipedia: began to sink in 1178 (a 3 m foundation in weak subsoil); construction halted for
//    almost a century while Pisa fought Genoa, Lucca and Florence, the soil settled, "otherwise the tower would almost
//    certainly have toppled"; 5.5 deg by 1990; closed 7 Jan 1990; 38 m3 of soil removed from the raised end; straightened
//    by 45 cm; May 2008: stable "for at least 200 years".
//  - A. Smart, Daily Telegraph (via Gulf News, "A structural revival"): liquid-nitrogen freezing; "On the night of
//    September 7, 1995, the tower lurched southwards by more than it had done in the entire previous year"; the mayor:
//    a "plumber with a toilet-jack" would have done a better job; committee members' cars pelted with tomatoes; bookmakers
//    offered 11-4 that the tower wouldn't survive into the 21st century.
//  - History.com, "Leaning Tower needs help" (Feb 27): Mussolini's government had concrete poured into the foundation (1934).
//  - NOVA (PBS), "Pisa interventions": freezing with liquid nitrogen before the anchors; the tower moved south at night ("Black September").
// Guardrails: Mussolini and the real committee members are not drawn (generic workers / engineers / a mayor in a
// sash); the bookmaker is unbranded; the tomato hits are on cars, never on people.
import * as THREE from 'three';
import { lerp, smooth } from '@engine/core.js';
import { toonPost } from '@engine/toon/post.js';
import { setTone } from '@engine/toon/shade.js';
import { GRADE_RICH } from '@engine/toon/grade.js';
import { makeMotes, makeEnv } from '@engine/toon/light.js';
import { makeSky } from '@engine/toon/sky.js';
import { MOOD } from '@engine/toon/mood.js';
import { makeWordCaption } from '@engine/toon/caption.js';
import { makeZoomDissolve } from '@engine/toon/extras.js';
import { buildWorlds, makeShots } from './world.js';
import { WORDS } from './timeline.js';
import { CUT } from './cut.js';

export const SHOTS = CUT.map((e) => ({ ...e }));
SHOTS.forEach((s, i) => { s.t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : 1e9; });
const OFF = { piazza: [0, 0, 0], section: [800, 0, 0], kitchen: [1600, 0, 0] };
const DZ = 0.42;   // dissolve length (s)

// toon look v3 tones per mood (warm sun vs cool shade; the toons slightly under the lit world)
const CHAR = { charTint: [1.0, 0.96, 0.9], charShade: 0.64, charGain: 0.95, headGrad: 0.34, bodyGrad: 0.45 };
const TONES = {
  day: { ...MOOD.day.tone, lit: [1.42, 1.3, 1.1], shade: [0.46, 0.52, 0.8], ...CHAR },
  gold: { ...MOOD.sunset.tone },
  night: { ...MOOD.night.tone, extra: 1, charExtra: 1 },
  interior: { ...MOOD.interior.tone, extra: 1, charExtra: 1, ...CHAR },
};
const SUNCOL = { day: [0xfff0d8, 2.3], gold: [0xffc890, 2.4], night: [0xb8c8ff, 1.3], interior: [0xfff0d8, 1.7] };
const BLOOM = { day: 0.2, gold: 0.3, night: 0.35, interior: 0.3 };

export async function build(studio) {
  const { scene, camera, renderer } = studio;
  studio.fill.intensity = 0;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  for (const id of ['hud', 'title', 'sub', 'end']) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }   // no HUD / title / end card
  // toon look v3 premium: tinted world ink + AO, bokeh, the rich warm-vs-cool grade
  const post = toonPost(studio, { grade: GRADE_RICH, bloom: { threshold: 1.05, strength: 0.25, radius: 0.85 },
    ink: { widthNear: 3.6, widthFar: 2.3, distNear: 2, distFar: 80, tint: 0.7, ao: 0.85, aoRadius: 0.35 }, lens: { maxCoC: 30, bokeh: 0.5 } });
  const roots = {};
  for (const k in OFF) { roots[k] = new THREE.Group(); roots[k].position.set(...OFF[k]); scene.add(roots[k]); roots[k].updateMatrixWorld(true); }
  const W = buildWorlds(roots), { shots: cfg, ctx } = makeShots(W);
  const caption = makeWordCaption(WORDS, { size: 78 });
  const dz = makeZoomDissolve(studio);
  // painted skies: day (clouds all round), golden hour, moonlit night; the section has its own day sky
  const cl = (o) => ({ ...MOOD.day.sky.clouds, n: 16, az: [-180, 180], el: [5, 26], dist: 650, size: 170, ...o });
  const skies = {
    day: makeSky(roots.piazza, { ...MOOD.day.sky, clouds: cl({}) }),
    gold: makeSky(roots.piazza, { ...MOOD.sunset.sky, clouds: { ...MOOD.sunset.sky.clouds, n: 9, az: [-60, 60], dist: 650, size: 170 } }),
    night: makeSky(roots.piazza, { ...MOOD.night.sky, clouds: { ...MOOD.night.sky.clouds, dist: 650, size: 170 } }),
    section: makeSky(roots.section, { ...MOOD.day.sky, clouds: cl({ seed: 4 }) }),
  };
  const envs = { day: makeEnv(renderer, MOOD.day.env), gold: makeEnv(renderer, MOOD.sunset.env), night: makeEnv(renderer, MOOD.night.env), interior: makeEnv(renderer, MOOD.interior.env) };
  const motes = { day: makeMotes(roots.piazza, { ...MOOD.day.motes, n: 200, box: [-6, 0.2, -6, 6, 3.4, 6], intensity: 1.4 }),
    night: makeMotes(roots.piazza, { ...MOOD.night.motes, n: 160, box: [-6, 0.2, -6, 6, 3.4, 6] }),
    interior: makeMotes(roots.kitchen, { ...MOOD.interior.motes, n: 90, box: [-2, 0.3, -2, 2, 2.4, 2], intensity: 1.6 }) };
  const sunOf = { piazza: W.sun, section: W.sunS, kitchen: W.sunK };
  /** sun direction: the camera's horizontal forward turned az degrees (+ = to the left), raised el */
  const sunDir = (c, az, el) => {
    const f = new THREE.Vector3(c.a[0] - c.p[0], 0, c.a[2] - c.p[2]).normalize(), a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
    const x = f.x * Math.cos(a) + f.z * Math.sin(a), z = -f.x * Math.sin(a) + f.z * Math.cos(a);
    return [x * Math.cos(e), Math.sin(e), z * Math.cos(e)];
  };
  const add = (v, o) => v.map((x, i) => x + o[i]);
  const fwd = new THREE.Vector3(), tmp = new THREE.Vector3();

  function show(shot, t, zoom = 1) {
    const S = cfg[shot.shot], o = OFF[shot.set], mood = S.mood;
    for (const k in roots) roots[k].visible = k === shot.set;
    for (const a of W.actors) a.visible = false;
    for (const fx of [W.puffs, W.sPuffs, W.K.sawdust]) { fx.begin(); fx.end(); }   // puff pools keep their last state otherwise
    const c = typeof S.cam === "function" ? S.cam(t) : S.cam, sun = sunOf[shot.set], d = sunDir(c, S.az ?? 130, S.el ?? 38);
    sun.aim(S.sun[0], S.sun[1], S.sun[2], d); sun.s.color.setHex(SUNCOL[mood][0]); sun.s.intensity = SUNCOL[mood][1];
    sun.hemi.intensity = mood === 'night' ? 0.35 : mood === 'gold' ? 0.6 : 0.85;
    for (const k in skies) skies[k].root.visible = false;
    const sky = shot.set === 'section' ? skies.section : skies[mood];
    if (sky) { sky.root.visible = true; sky.material.uniforms.sunDir.value.set(...d).normalize(); }
    if (shot.set === 'kitchen') { scene.background = new THREE.Color('#2a2230'); scene.fog = null; camera.near = 0.05; camera.far = 60; }
    else { scene.background = null; scene.fog = new THREE.Fog(mood === 'night' ? MOOD.night.fog : mood === 'gold' ? MOOD.sunset.fog : MOOD.day.fog, S.fog[0], S.fog[1]); camera.near = 0.3; camera.far = 1600; }
    scene.environment = envs[mood];
    studio.bloom.strength = S.bloom ?? BLOOM[mood];
    setTone({ rim: [0, 0, 0], ...TONES[mood], ...(S.tone || {}) }); post.grade.set(S.grade || MOOD[mood === 'gold' ? 'sunset' : mood === 'interior' ? 'interior' : mood].grade);
    renderer.toneMappingExposure = S.exposure ?? 1.0;
    for (const k in motes) motes[k].points.visible = false;
    const m = shot.set === 'kitchen' ? motes.interior : shot.set === 'piazza' ? (mood === 'night' ? motes.night : mood === 'day' ? motes.day : null) : null;
    studio.setCamera(add(c.p, o), add(c.a, o), c.fov * zoom, t, 0);
    camera.updateMatrixWorld(true);
    ctx(camera, sun.s);
    if (sky) sky.update(camera, t);
    if (m) { const f = S.focus(t); m.points.visible = true; m.points.position.set(f[0], 0, f[2]); m.update(t, camera, renderer); }
    S.update(t, camera);
    camera.getWorldDirection(fwd);
    post.lens.set(Math.max(0.3, tmp.set(...add(S.focus(t), o)).sub(camera.position).dot(fwd)), S.cInf, S.slab || 0);
  }
  function update(t) {
    const i = SHOTS.findIndex((s) => t >= s.t0 && t < s.t1), shot = SHOTS[i < 0 ? SHOTS.length - 1 : i];
    const u = (t - shot.t0) / DZ;
    if (shot.dz && i > 0 && u < 1) {
      show(SHOTS[i - 1], t, 1 - 0.18 * smooth(u));   // the outgoing place keeps moving and pushes in
      studio.render(t); dz.grab();
      dz.show(1 - smooth(u), 1 + 0.12 * smooth(u));
      show(shot, t, lerp(0.88, 1, smooth(u)));
    } else { dz.show(0); show(shot, t); }
    caption.update(t);
  }
  return { update };
}
