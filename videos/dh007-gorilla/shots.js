// VIDEO dh007 — "What if 100 men actually fought 1 gorilla?"  (tone FUNNY, a time-stamped ladder).
// 69.6 s, 11 beats, 5 sets — built from the approved pitch. The internet's
// longest "who would win" argument, played as a deadpan war documentary over a mock-epic sports score: 100 very confident men in
// matching jerseys vs Steve, one sleepy toy silverback, in a sold-out stadium. Dave (red headband) has the plan on a whiteboard
// (GRAB A LEG · SURROUND HIM · TIRE HIM OUT) and has never been to a gym. Every step ends in something big: man #1 grabs a leg →
// flung into the jumbotron; Steve bowls a man into ten others (STRIKE); the perfect circle explodes when he spins; "tire him
// out" — they tire themselves out while he eats a banana; the dogpile launches when he stands up; Dave's last stand: he offers a
// banana, Steve accepts it, and flicks him into the upper deck. GORILLA 1 · HUMANITY 0. Then +1 day a press briefing, +1 week
// Steve runs for mayor (staff in slings), +1 year a support group in casts ("Dave still says he had him") and a sunset bench.
// Guardrails: cartoon slapstick only (men fly, bounce, pile up, see stars, get up) — no blood, no injuries shown. The joke is on the
// men's confidence; Steve is never hurt or mocked and is never dressed up as, or compared to, any person — he is a gorilla, and the
// mayor beat is a gorilla at a lectern eating a banana. The 100 men are a mixed crowd. No real people, no owned characters.
//
// Sources (checked Oct 29 2026):
//  - the meme: first posed on TikTok Feb 22, 2022; exploded on TikTok/X/Reddit in late April 2025 — the Apr 25, 2025 post that set
//    it off drew 70.1 M views in two days — Know Your Meme, "100 Men vs 1 Gorilla"
//  - silverback weight 300–400 lb (136–181 kg); "Gorillas are naturally peaceful", "peaceful, family-oriented, plant-eating
//    primates"; an adult male eats up to 40 lb (18 kg) of food a day — San Diego Zoo Wildlife Alliance, Animals & Plants: Gorilla
//  - standing height up to 6 ft (1.8 m); charges "usually don't make contact"; "never attacks unless provoked" — Smithsonian's
//    National Zoo & Conservation Biology Institute, Western lowland gorilla
//  - "10× stronger than a man" has never been measured: "no research has been conducted" comparing gorilla and human strength; the
//    10× and 27× claims are unproven — Berggorilla & Regenwald Direkthilfe, "How strong are gorillas?"
//  - 1,063 mountain gorillas in the wild (604 Virunga 2015/16 + 459 Bwindi-Sarambwe 2018; released Dec 2019) — Greater Virunga
//    Transboundary Collaboration via Phys.org, "Global mountain gorilla population grows to 1,063"
//  - the HUD's "MEN PER THROW", "QUESTIONS ANSWERED", "VOTES FOR STEVE", "MEN IN CASTS" and his platform are jokes, on purpose
//
// Shot list (seconds)                                   | set      | what happens
//  0.0– 3.4  open    FIGHT NIGHT (title over it)          | stadium  | high wide: 100 men bounce on one side; Steve sits alone far away
//  3.4– 8.2  hype                                         | stadium  | close: the men jump + roar; two chest-bump and both fly flat on their backs
//  8.2–13.2  planA/B/C  LOCKER ROOM                       | locker   | Dave writes THE PLAN; 20 heads nod in sync; he slaps the board, it spins, bonks him
// 13.2–16.8  steve                                        | stadium  | Steve sits, yawns enormously, stands, beats his chest: a shockwave
// 16.8–18.4  flinch                                       | stadium  | the men all step back at once, mouths open
// 18.4–21.0  charge  SECOND 0                             | stadium  | low behind Steve: the charge; man #1 dives on a leg
// 21.0–24.4  throwA/B                                     | stadium  | Steve lifts the leg, flicks it; man #1 flies 30 m into the jumbotron (100 → 99)
// 24.4–29.4  bowl    +5 SECONDS                           | stadium  | Steve bowls a man (curled up) into ten men; they fly like pins (→ 89)
// 29.4–35.0  ring    +30 SECONDS                          | stadium  | top-down: a perfect circle of 89 men; Steve spins; the circle explodes (→ 41)
// 35.0–40.6  tire    +10 MINUTES                          | stadium  | laps around Steve, who eats a banana; they drop one by one (→ 12)
// 40.6–44.6  pile    +11 MINUTES                          | stadium  | dogpile; it wobbles; Steve stands up; men launch and rain down (→ 1)
// 44.6–49.0  lastA/B                                     | stadium  | Dave's last stand: a banana; Steve accepts; a flick → the upper deck (→ 0)
// 49.0–52.6  press/B +1 DAY                               | podium   | PRESS BRIEFING: Steve eats at the lectern in a storm of flashes; reverse: a press corps in slings, every hand up
// 52.6–56.8  camp    +1 WEEK                              | street   | Steve knuckle-walks down Main St: VOTE STEVE boards, staff in slings, confetti
// 56.8–60.8  support +1 YEAR                             | locker   | SUPPORT GROUP, everyone in a cast; Dave demonstrates the leg grab → faceplant
// 60.8–69.6  bench                                        | suburb   | sunset bench: Steve shares his banana with Dave. Card 65.6
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { K, clamp, lerp, lerpAngle, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, makeRigCrowd } from '@engine/rig.js';
import { makeGorilla, makeBanana } from '@engine/props.js';
import { makeSpritePool } from '@engine/sets/tech.js';
import { buildStadium, tread, DIMS as SD } from '@engine/sets/stadium.js';
import { buildStreet, SIDEWALK_H } from '@engine/sets/street.js';
import { buildLocker, DIMS as LD } from '@engine/sets/locker.js';
import { buildPodium, DIMS as PD } from '@engine/sets/podium.js';
import { buildSuburb } from '@engine/sets/suburb.js';

const PI = Math.PI;
const OFF = { stad: [0, 0, 0], lock: [2000, 0, 0], pod: [-2000, 0, 0], burb: [4000, 0, 0], street: [6000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 3.4, cam: 'open', set: 'stad' },
  { t0: 3.4, t1: 8.2, cam: 'hype', set: 'stad' },
  { t0: 8.2, t1: 10.45, cam: 'planA', set: 'lock' },
  { t0: 10.45, t1: 11.75, cam: 'planB', set: 'lock' },
  { t0: 11.75, t1: 13.2, cam: 'planC', set: 'lock' },
  { t0: 13.2, t1: 16.8, cam: 'steve', set: 'stad' },
  { t0: 16.8, t1: 18.4, cam: 'flinch', set: 'stad' },
  { t0: 18.4, t1: 21.0, cam: 'charge', set: 'stad' },
  { t0: 21.0, t1: 22.3, cam: 'throwA', set: 'stad' },
  { t0: 22.3, t1: 24.4, cam: 'throwB', set: 'stad' },
  { t0: 24.4, t1: 26.35, cam: 'bowl', set: 'stad' },
  { t0: 26.35, t1: 29.4, cam: 'bowlB', set: 'stad' },
  { t0: 29.4, t1: 35.0, cam: 'ring', set: 'stad' },
  { t0: 35.0, t1: 40.6, cam: 'tire', set: 'stad' },
  { t0: 40.6, t1: 44.6, cam: 'pile', set: 'stad' },
  { t0: 44.6, t1: 47.0, cam: 'lastA', set: 'stad' },
  { t0: 47.0, t1: 49.0, cam: 'lastB', set: 'stad' },
  { t0: 49.0, t1: 50.9, cam: 'press', set: 'pod' },
  { t0: 50.9, t1: 52.6, cam: 'pressB', set: 'pod' },
  { t0: 52.6, t1: 56.8, cam: 'camp', set: 'street' },
  { t0: 56.8, t1: 60.8, cam: 'support', set: 'lock' },
  { t0: 60.8, t1: 69.6, cam: 'bench', set: 'burb' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- shared choreography numbers (make_cues.py mirrors the event times)
const ST = [-18, 0];                                   // Steve's spot on the field (faces +x, toward the men)
const SX = ST[0];
const BUMP = 7.15;                                     // hype: the chest bump
const SLAP = 12.05, BONK = 12.42;                      // plan: the board spins into Dave's face
const YAWN0 = 13.6, UP = 15.45, BEAT0 = 15.9, WAVE = 16.35, STEP = 16.95;
const DIVE0 = 19.65, GRAB = 20.35, LIFT = 21.0, FLING = 21.75, SPLAT = 22.75, SLIDE = 23.25;
const PICK = 24.9, REL = 25.85, BALL_V = 9.5;
const HIT = REL + (9.6 - 0.45 - 1.0) / BALL_V;        // the ball reaches the head pin (released ≈ 1 m in front of Steve)
const FORM = 29.4, SET_ = 31.3, SPIN = 32.25, BLAST = 32.55;
const DROP0 = 36.0, DROP1 = 39.95;
const JUMP0 = 40.75, LAUNCH = 43.12;
const OFFER = 45.5, TAKE = 46.0, FLICK = 46.55, DLAND = 48.25;   // Dave's last stand
const CONF2 = 55.8;                                    // the campaign's confetti
const DIVE = 59.35, PLANT = 59.75;                     // the support group: Dave demonstrates the leg grab
const GIVE = 61.7;                                     // the bench: half a banana
const SCREEN = [-46.85, 7.8, 0.3];                   // where man #1 hits the stage LED wall (stadium-local)
const BENCH = [58, -6.2];

// camera coords are LOCAL to the shot's set. p/a = [start, end]; fn(t) overrides for moving shots.
export const CAMS = {
  open:   { p: [[16, 6.8, 1.6], [13.5, 5.9, 1.3]], a: [[SX + 4, 0.8, -0.2], [SX + 4, 0.9, -0.2]], fov: 50, amp: 0.01 },
  hype:   { p: [[-2.5, 1.7, 1.25], [-2.15, 1.66, 1.05]], a: [[1.4, 1.42, -0.35], [1.4, 1.42, -0.35]], fov: 54, amp: 0.006 },
  planA:  { p: [[0.5, 1.72, 3.05], [0.42, 1.68, 2.7]], a: [[0.12, 1.4, -1.9], [0.12, 1.4, -1.9]], fov: 48, amp: 0.003 },
  planB:  { p: [[-2.6, 1.85, -1.55], [-2.45, 1.82, -1.4]], a: [[1.0, 1.0, 1.4], [1.0, 1.0, 1.4]], fov: 56, amp: 0.004 },
  planC:  { fn: (t) => { const u = K(t, [[11.75, 0], [13.2, 1]]); return { p: [lerp(3.7, 3.5, u), 1.4, lerp(0, -0.05, u)], a: [0.37, K(t, [[11.75, 1.05], [BONK, 1.05], [BONK + 0.28, 2.15], [BONK + 0.42, 2.1], [BONK + 0.85, 0.95]]), -1.13] }; }, fov: 54, amp: 0.004 },   // follows Dave to the ceiling and back
  steve:  { fn: (t) => { const u = K(t, [[13.2, 0], [16.8, 1]]), up = K(t, [[UP, 0], [UP + 0.45, 1]]); return { p: [SX + lerp(3.5, 2.75, u), lerp(1.12, 1.3, up), lerp(0.95, 0.75, u)], a: [SX, lerp(1.0, 1.42, up), 0] }; }, fov: 48, amp: 0.004 },
  flinch: { p: [[-2.9, 1.75, 1.1], [-2.6, 1.72, 0.9]], a: [[1.9, 1.35, -0.3], [1.9, 1.35, -0.3]], fov: 56, amp: 0.006 },
  charge: { p: [[SX - 3.8, 0.95, 1.5], [SX - 3.5, 0.92, 1.4]], a: [[SX + 6, 1.2, -0.5], [SX + 6, 1.1, -0.5]], fov: 58, amp: 0.008 },
  throwA: { p: [[SX + 1.2, 1.15, 3.9], [SX + 1.0, 1.2, 3.7]], a: [[SX - 0.2, 1.25, 0], [SX - 0.6, 1.6, 0]], fov: 52, amp: 0.005 },
  throwB: { p: [[-39.4, 5.2, 1.8], [-39.7, 4.9, 1.6]], a: [[SCREEN[0], 7.4, 0.2], [SCREEN[0], 5.0, 0.2]], fov: 52, amp: 0.005 },
  bowl:   { p: [[SX - 5.5, 1.7, 2.2], [SX - 5.1, 1.65, 2.0]], a: [[SX + 8, 0.9, -1.2], [SX + 8, 0.9, -1.2]], fov: 50, amp: 0.005 },
  bowlB:  { p: [[SX + 5.4, 1.15, 2.0], [SX + 5.6, 1.2, 1.9]], a: [[SX + 10.8, 0.95, 0.35], [SX + 10.8, 1.0, 0.35]], fov: 52, amp: 0.006 },
  ring:   { fn: (t) => { const u = K(t, [[BLAST, 0], [BLAST + 1.6, 1]]); return { p: [SX, lerp(17.5, 21, u) - 1.2 * K(t, [[FORM, 0], [BLAST, 1]]), 0.9], a: [SX, 0, 0] }; }, fov: 52, amp: 0.004 },
  tire:   { p: [[SX + 8.5, 7.5, 7.2], [SX + 7.9, 7.0, 6.7]], a: [[SX, 0.3, 0], [SX, 0.3, 0]], fov: 54, amp: 0.004 },
  pile:   { fn: (t) => { const up = K(t, [[LAUNCH, 0], [LAUNCH + 0.55, 1], [LAUNCH + 1.25, 1], [LAUNCH + 1.9, 0.25]]); return { p: [SX + 6.6, 1.35 + 0.3 * up, 3.3], a: [SX + 0.3, lerp(1.25, 4.6, up), 0.2] }; }, fov: 58, amp: 0.006 },
  lastA:  { p: [[SX + 1.4, 1.3, 3.9], [SX + 1.25, 1.28, 3.7]], a: [[SX + 0.6, 1.05, 0.15], [SX + 0.6, 1.1, 0.15]], fov: 50, amp: 0.004 },
  lastB:  { p: [[SX + 2.3, 0.9, 1.25], [SX + 2.15, 0.9, 1.15]], a: [[SX - 4, 2.2, -3.1], [SX - 4, 2.25, -3.1]], fov: 50, amp: 0.004 },   // Steve's face + banana low-center, Dave sails into the deck behind him (right of the HUD)
  press:  { p: [[0.35, 1.7, 4.7], [0.15, 1.66, 3.4]], a: [[0, 1.85, -3.2], [0, 1.95, -3.2]], fov: 44, amp: 0.003 },
  pressB: { p: [[-2.2, 2.1, -2.6], [-2.1, 2.05, -2.45]], a: [[-0.6, 1.3, 2.2], [-0.6, 1.3, 2.2]], fov: 54, amp: 0.004 },
  camp:   { p: [[-4.5, 1.35, -2.2], [-4.2, 1.35, -2.15]], a: [[5, 1.1, -1.3], [5, 1.15, -1.3]], fov: 38, amp: 0.004 },
  support: { p: [[0.7, 1.75, 4.15], [0.7, 1.72, 3.95]], a: [[0.7, 1.25, -0.4], [0.7, 1.22, -0.4]], fov: 62, amp: 0.004 },   // reverse: Dave's face, the circle, THE PLAN v2 behind
  bench:  { fn: (t) => { const u = K(t, [[60.8, 0], [65.6, 1]]), c = K(t, [[64.6, 0], [69.6, 1]]), th = lerp(-0.3, 0.1, u), r = lerp(4.7, 4.2, u) + 2.0 * c; return { p: [BENCH[0] + 0.1 + r * Math.sin(th), lerp(1.2, 1.12, u) + 1.6 * c, BENCH[1] + r * Math.cos(th)], a: [BENCH[0] + 0.12, 1.0 + 0.15 * c, BENCH[1] - 0.2 - 0.4 * c] }; }, fov: 48, amp: 0.003 },   // a slow orbit, then the crane
};

// ---------------------------------------------------------------- arm library (tested presets from 002 / 019 / dh001 / dh004)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const UP_A = A(-2.75, 0.42, -0.3), UP_B = A(-2.75, 0.42, -0.3);                    // both arms up
const HEAD_A = A(-2.45, 1.2, -2.35, 0.5), HEAD_B = A(-2.45, 1.2, -2.35, -0.5);    // hands on the head
const WIDE_A = A(-0.35, 1.25, -0.15), WIDE_B = A(-0.35, 1.25, -0.15);              // arms spread wide
const HUG_A = A(0, 1.5, -1.45, 0.93), HUG_B = A(0, 1.2, -1.45, -0.93);             // dh001: arms around something
const GUARD_A = A(-1.35, 0.3, -1.7, 0.45), GUARD_B = A(-1.35, 0.3, -1.7, -0.45);   // hands up in front of the face
const READ_A = A(-0.9, 0.12, -1.25, 0.5), READ_B = A(-0.9, 0.12, -1.25, -0.5);     // forearms forward (a phone)
const CROSS_A = A(-0.05, 0.2, -2.0, 0.9), CROSS_B = A(-0.05, 0.2, -2.0, -0.9);     // hands on the chest
const KNEE_A = A(-0.75, 0.15, -0.25, 0.2), KNEE_B = A(-0.75, 0.15, -0.25, -0.2);   // hands on the knees (panting)
const STAR_A = A(-0.2, 2.2, -0.15), STAR_B = A(-0.2, 2.2, -0.15);                  // spread-eagle
const BALL_A = A(-1.7, 0.25, -2.1, 0.6), BALL_B = A(-1.7, 0.25, -2.1, -0.6);       // hugging the knees (cannonball)
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const pulse = (t, a, b, f = 0.15) => K(t, [[a, 0], [a + f, 1], [b - f, 1], [b, 0]]);
const seatY = (top) => -0.375 + (top - 0.42);
const ease = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f, 0x8a5a3c, 0xb57a52];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be, 0x7a3a22, 0x3a2a20];
const JERSEY = 0xe8742a, SHORTS = 0x2f3f5f, HC = 0.95;   // HC = body-center height of a standing figure

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const stad = buildStadium(studio, {}); stad.root.position.set(...OFF.stad);
  const lock = buildLocker(studio, {}); lock.root.position.set(...OFF.lock);
  lock.banner.position.x = 2.3; lock.banner.scale.setScalar(0.6);   // off the HUD corner of the planA frame
  const benchMeshes = lock.root.children.filter((o) => o.isMesh && o.position.y < 0.5 && LD.benches.some((z) => Math.abs(o.position.z - z) < 0.2));
  const chairs = Array.from({ length: 11 }, () => { const g = new THREE.Group(), cm = mat(0x3a3f4a, 0.6); mk(new THREE.BoxGeometry(0.44, 0.05, 0.42), cm, g, 0, 0.45, 0); mk(new THREE.BoxGeometry(0.44, 0.42, 0.04), cm, g, 0, 0.7, -0.2); for (const [a, b] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) mk(new THREE.BoxGeometry(0.03, 0.45, 0.03), mat(0x8a8f96, 0.4), g, a, 0.225, b); g.visible = false; lock.root.add(g); return g; });
  const pod = buildPodium(studio, {}); pod.root.position.set(...OFF.pod);
  const burb = buildSuburb(studio, { poleClear: [BENCH[0]] }); burb.root.position.set(...OFF.burb);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  [street.cart, street.bench, street.trash].forEach((o) => (o.visible = false));   // keep the campaign's sidewalk clear
  stad.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'BoxGeometry' && Math.abs(o.position.y - 0.012) < 1e-3) o.visible = false; });   // concert floor cover → grass
  const ROOTS = { stad: stad.root, lock: lock.root, pod: pod.root, burb: burb.root, street: street.root };
  const FOGS = { stad: stad.fog, lock: null, pod: null, burb: burb.fog, street: streetFog };
  const FAR = { stad: 600, lock: 40, pod: 40, burb: 420, street: 400 };
  const L = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // stadium: re-aimable key (shadows follow the action) + a floodlight from the stands so Steve's face reads
  const sKey = stad.lights.key, front = new THREE.DirectionalLight(0xfff3e4, 1.25); stad.root.add(front, front.target);
  const aimKey = (cx, cz, half = 12) => { sKey.target.position.set(cx, 0, cz); sKey.position.set(cx - 24, 22, cz + 6); Object.assign(sKey.shadow.camera, { left: -half, right: half, top: half, bottom: -half }); sKey.shadow.camera.updateProjectionMatrix(); front.target.position.set(cx, 1, cz); front.position.set(cx + 30, 24, cz + 14); };
  // the stage LED wall = the scoreboard (MEN n vs GORILLA 1), with a crack where Dave lands; rim jumbotrons say FIGHT NIGHT / STRIKE!
  const font = (w, s) => `${w} ${s}px Helvetica, Arial, sans-serif`;
  /** largest font size ≤ s at which every line fits in maxW px (measured, so nothing runs past its card) */
  const fitFont = (g, lines, maxW, w, s) => { g.font = font(w, s); const mw = Math.max(...lines.map((l) => g.measureText(l).width)); return mw > maxW ? Math.floor((s * maxW) / mw) : s; };
  const ledC = document.createElement('canvas'); ledC.width = 2048; ledC.height = 768;   // 26 × 9.75 m → 78.8 px per m
  const ledT = new THREE.CanvasTexture(ledC); ledT.colorSpace = THREE.SRGBColorSpace; stad.screen.material.map = ledT;
  let ledKey = '';
  const PXM = 2048 / 26, ledX = (z) => 1024 - z * PXM, ledY = (y) => (8 + 4.875 - y) * PXM;   // screen-local z/y → canvas px
  function drawLed(men, crack, strike, plain = false) {   // plain: no score column (it sat behind the HUD in Steve's shot)
    const k = `${men}|${crack}|${strike}|${plain}`; if (k === ledKey) return; ledKey = k;
    const g = ledC.getContext('2d'), w = 2048, h = 768;
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#3a1a5a'); gr.addColorStop(0.35, '#0d0f1a'); gr.addColorStop(0.65, '#0d0f1a'); gr.addColorStop(1, '#3a1a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.05)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#e8742a'; g.font = font('bold', fitFont(g, ['FIGHT'], 560, 'bold', 300)); g.fillText('FIGHT', ledX(8), h / 2); g.fillText('NIGHT', ledX(-8), h / 2);
    const col = 300;   // the visible column (≈ 3.8 m) in the throwB frame
    if (plain) { /* wings only */ }
    else if (strike) { g.fillStyle = '#ffd166'; g.font = font('bold', fitFont(g, ['STRIKE!'], col, 'bold', 200)); g.fillText('STRIKE!', ledX(0), ledY(7.8)); }
    else {
      g.fillStyle = '#e8742a'; g.fillRect(ledX(0) - col / 2, ledY(10.8), col, ledY(9.0) - ledY(10.8));
      g.fillStyle = '#fff'; g.font = font('bold', fitFont(g, [`MEN ${men}`], col - 30, 'bold', 120)); g.fillText(`MEN ${men}`, ledX(0), ledY(9.9));
      g.fillStyle = '#ffd166'; g.font = font('bold', 64); g.fillText('VS', ledX(0), ledY(7.8));
      g.fillStyle = '#5a5248'; g.fillRect(ledX(0) - col / 2, ledY(6.8), col, ledY(5.0) - ledY(6.8));
      g.fillStyle = '#fff'; g.font = font('bold', fitFont(g, ['GORILLA 1'], col - 30, 'bold', 120)); g.fillText('GORILLA 1', ledX(0), ledY(5.9));
    }
    if (crack) {
      const cx = ledX(SCREEN[2]), cy = ledY(SCREEN[1]), r = rng(9); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 6;
      for (let i = 0; i < 12; i++) { let a = (i / 12) * PI * 2 + r() * 0.3, x = cx, y = cy; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 4; s++) { const L2 = 30 + r() * 40; a += (r() - 0.5) * 0.7; x += Math.cos(a) * L2; y += Math.sin(a) * L2; g.lineTo(x, y); } g.stroke(); }
      g.fillStyle = 'rgba(10,10,14,.9)'; g.beginPath(); g.arc(cx, cy, 46, 0, 7); g.fill();
    }
    ledT.needsUpdate = true;
  }
  const jumboC = document.createElement('canvas'); jumboC.width = 512; jumboC.height = 288;
  const jumboT = new THREE.CanvasTexture(jumboC); jumboT.colorSpace = THREE.SRGBColorSpace; let jumboKey = '';
  const jumbos = []; stad.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 16 && o.geometry.parameters.height === 9) { o.material.map = jumboT; jumbos.push(o); } });
  function drawJumbo(text, col) {
    if (text === jumboKey) return; jumboKey = text; const g = jumboC.getContext('2d'), w = 512, h = 288;
    g.fillStyle = '#101018'; g.fillRect(0, 0, w, h); const lines = text.split('\n');
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font('bold', fitFont(g, lines, 460, 'bold', 110));
    lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * 110)); jumboT.needsUpdate = true;
  }

  // locker room: THE PLAN on the whiteboard (written line by line), Dave circles step 1
  const boardC = document.createElement('canvas'); boardC.width = 1024; boardC.height = 640;
  const boardT = new THREE.CanvasTexture(boardC); boardT.colorSpace = THREE.SRGBColorSpace; lock.boardFace.material.map = boardT; let boardKey = '';
  const PLAN = ['1. GRAB A LEG', '2. SURROUND HIM', '3. TIRE HIM OUT'];
  function drawBoard(n, circle) {
    const k = `${n}|${circle.toFixed(2)}`; if (k === boardKey) return; boardKey = k;
    const g = boardC.getContext('2d'), w = 1024, h = 640; g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h);
    if (n === 6) {   // +1 year: Dave's revised plan
      g.fillStyle = '#d2483f'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = font('bold', 92); g.fillText('THE PLAN v2', 52, 140);
      g.fillStyle = '#1d3f8a'; g.font = font('bold', fitFont(g, ['1. GRAB BOTH LEGS'], 730, 'bold', 96)); g.fillText('1. GRAB BOTH LEGS', 52, 300);   // ≤ 730 px: clear of Dave's head
      boardT.needsUpdate = true; return;
    }
    g.fillStyle = '#d2483f'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = font('bold', 92); if (n >= 1) g.fillText('THE PLAN', 52, 120);
    if (n >= 1) { g.strokeStyle = '#d2483f'; g.lineWidth = 8; g.beginPath(); g.moveTo(52, 140); g.lineTo(470, 140); g.stroke(); }
    const fs = fitFont(g, PLAN, 650, 'bold', 86); g.font = font('bold', fs); g.fillStyle = '#1d3f8a';
    PLAN.forEach((l, i) => { if (n >= i + 2) g.fillText(l, 52, 262 + i * 128); });
    if (n >= 5) {   // a doodle: a gorilla face in a ring of x's
      const cx = 862, cy = 410; g.strokeStyle = '#2a2a2a'; g.lineWidth = 7; g.beginPath(); g.arc(cx, cy, 44, 0, 7); g.stroke();
      g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(cx - 15, cy - 6, 6, 0, 7); g.arc(cx + 15, cy - 6, 6, 0, 7); g.fill(); g.beginPath(); g.moveTo(cx - 26, cy - 22); g.lineTo(cx + 26, cy - 22); g.stroke();
      g.font = font('bold', 44); g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < 10; i++) { const a = (i / 10) * PI * 2; g.fillText('x', cx + Math.cos(a) * 112, cy + Math.sin(a) * 100); }
    }
    if (circle > 0) { g.strokeStyle = '#d2483f'; g.lineWidth = 10; g.beginPath(); g.ellipse(382, 232, 360, 70, -0.03, -0.5, -0.5 + circle * PI * 2); g.stroke(); }
    boardT.needsUpdate = true;
  }

  // podium: PRESS BRIEFING over the (fictional) seal, STEVE on the lectern
  pod.root.traverse((o) => { if (o.isMesh && o.geometry.type === 'CircleGeometry' && (o.geometry.parameters.radius === 0.85 || o.geometry.parameters.radius === 0.2)) o.visible = false; });
  const bannerT = canvasTex(1200, 600, (g, w, h) => {
    g.fillStyle = '#f4efe2'; g.fillRect(0, 0, w, h); g.fillStyle = '#b5462e'; g.fillRect(0, 0, w, 30); g.fillRect(0, h - 30, w, 30);
    g.fillStyle = '#1c3a6e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font('bold', fitFont(g, ['PRESS'], w - 140, 'bold', 280)); g.fillText('PRESS', w / 2, 220);
    g.fillStyle = '#b5462e'; g.font = font('bold', fitFont(g, ['BRIEFING'], w - 160, 'bold', 150)); g.fillText('BRIEFING', w / 2, 455);
  });
  mk(new THREE.PlaneGeometry(3.0, 1.5), new THREE.MeshBasicMaterial({ map: bannerT, color: 0xdddddd }), pod.root, 0, 2.55, -3.94).castShadow = false;
  const plaqueT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#1c3a6e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe2'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font('bold', fitFont(g, ['STEVE'], 440, 'bold', 150)); g.fillText('STEVE', w / 2, 132); });
  mk(new THREE.PlaneGeometry(0.62, 0.31), new THREE.MeshBasicMaterial({ map: plaqueT, color: 0xdddddd }), pod.root, PD.lectern[0], 0.98, PD.lectern[1] + 0.262).castShadow = false;
  mk(new THREE.BoxGeometry(10.4, 3.4, 0.12), mat(0x4a3a30, 0.8), pod.root, 0, 1.7, 6.06);   // the set has no back wall: the press reverse looked into a void
  mk(new THREE.BoxGeometry(10.4, 0.9, 0.04), mat(0x2f4f7a, 0.7), pod.root, 0, 0.45, 5.99);

  // suburb: the sunset sky + a bush behind the bench (Dave's landing pad)
  const burbSky = burb.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 300);
  if (burbSky) burbSky.material.map = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a4a8a'); gr.addColorStop(0.28, '#8a6aa8'); gr.addColorStop(0.42, '#f29a7a'); gr.addColorStop(0.49, '#ffd08a'); gr.addColorStop(0.5, '#f6e2c0'); gr.addColorStop(1, '#f6e2c0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const benchFill = new THREE.PointLight(0xffd2a8, 7, 9, 1.5); benchFill.position.set(BENCH[0] + 0.9, 2.2, BENCH[1] + 2.6); burb.root.add(benchFill);
  const benchBack = new THREE.PointLight(0xffe2c4, 5, 8, 1.5); benchBack.position.set(BENCH[0] - 1.2, 2.3, BENCH[1] - 3.6); burb.root.add(benchBack);
  const bush = new THREE.Group(); bush.position.set(BENCH[0] - 0.7, 0, BENCH[1] - 2.0); burb.root.add(bush);
  for (const [x, y, z, r] of [[0, 0.35, 0, 0.5], [0.45, 0.3, 0.1, 0.4], [-0.45, 0.28, 0.05, 0.38], [0.1, 0.62, -0.05, 0.36]]) mk(new THREE.SphereGeometry(r, 16, 12), mat(0x4f8a3a, 0.9), bush, x, y, z);
  for (let k = 0; k < 7; k++) mk(new THREE.SphereGeometry(0.06, 8, 6), mat([0xff5fa2, 0xffd166, 0xffffff][k % 3], 0.6), bush, Math.cos(k * 2.3) * 0.45, 0.45 + (k % 3) * 0.12, Math.sin(k * 2.3) * 0.3 + 0.25);

  // ---------------------------------------------------------------- cast
  const steve = makeGorilla(); scene.add(steve.g);
  const banana = makeBanana(); steve.arms[0].hand.add(banana.g); banana.g.position.set(0.02, -0.15, 0.08); banana.g.rotation.set(1.1, 0, 0);
  const peel = makeBanana(); scene.add(peel.g); peel.setPeel(1); peel.setBite(1);
  const dave = makePerson({ skin: 0xf1c3a1, top: JERSEY, collar: 0xffffff, pants: SHORTS, hair: 0x7a3a22, hairStyle: 'messy' }); scene.add(dave.root);
  const band = mk(new THREE.TorusGeometry(0.142, 0.022, 8, 28), mat(0xd2283f, 0.7), dave.head.g, 0, 0.065, 0); band.rotation.x = PI / 2 - 0.12;
  const flyBand = mk(new THREE.TorusGeometry(0.142, 0.022, 8, 28), mat(0xd2283f, 0.7), scene); flyBand.visible = false;
  const daveCast = mk(new THREE.CapsuleGeometry(0.068, 0.17, 6, 12), mat(0xf4f2ec, 0.95), dave.arms.find((a) => a.s === -1).elbow, 0, -0.13, 0); daveCast.visible = false;
  const kBanana = makeBanana(); dave.arms.find((a) => a.s === 1).hand.add(kBanana.g); kBanana.g.position.set(0, -0.07, 0.05); kBanana.g.rotation.set(-0.4, 0, 0);
  const LOOKS = [{ hairStyle: 'short' }, { hairStyle: 'messy' }, { hairStyle: 'none', mustache: true }, { hairStyle: 'short', glasses: true }, { hairStyle: 'bob' }, { hairStyle: 'short', mustache: true }];
  const crowd = makeRigCrowd(40, LOOKS); scene.add(crowd.g);
  const R = rng(7);
  const MEN = Array.from({ length: 99 }, (_, i) => ({ k: i % LOOKS.length, look: { skin: SKINS[Math.floor(R() * SKINS.length)], top: JERSEY, pants: SHORTS, hair: HAIRS[Math.floor(R() * HAIRS.length)] }, seed: R(), s2: R(), s3: R() }));
  // the block the men stand in before the fight (9 rows × 11), facing −x toward Steve; Dave in front
  const BLK = MEN.map((m, i) => [1.5 + Math.floor(i / 11) * 0.95 + (m.s2 - 0.5) * 0.25, -5.0 + (i % 11) * 1.0 + (m.s3 - 0.5) * 0.3]);
  const DAV0 = [0.45, 0.55];
  const BUMPERS = [[1.5, -0.95], [1.5, -0.1]], DOMINO = [[1.5, -1.8, 2], [1.5, -2.6, 3]];   // (x, z) · dominoes: (x, z, MEN index)

  // ---------------------------------------------------------------- effects: dust, impact stars, dizzy stars, sparks, confetti, balloons, ring
  const puffs = makeSpritePool(scene, 120, 'smoke'); const puffCol = new THREE.Color(0xf4ede0), grassDust = new THREE.Color(0xe8dcc4);
  const sparks = makeSpritePool(scene, 40, 'fire');
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
  let puffN = 0, sparkN = 0, starN = 0, dizN = 0;
  function dust(t, t0, pos, s = 1, n = 5, dur = 1.0, col = grassDust) {
    const age = t - t0; if (age < 0 || age > dur) return;
    for (let k = 0; k < n && puffN < puffs.items.length; k++) {
      const a = t0 * 3.7 + k * (2 * PI / n), r = (0.15 + age * 0.9) * s;
      puffs.set(puffN++, _v.set(pos.x + Math.cos(a) * r, pos.y + 0.05 * k + age * 0.35 * s, pos.z + Math.sin(a) * r * 0.6).clone(), (0.35 + age * 1.1) * s, 0.8 * (1 - age / dur) ** 1.4, col);
    }
  }
  function spark(t, t0, pos, s = 1) {
    const age = t - t0; if (age < 0 || age > 0.6) return;
    for (let k = 0; k < 8 && sparkN < sparks.items.length; k++) { const a = k * 0.8 + t0; sparks.set(sparkN++, _v.set(pos.x + 0.3 * age * s, pos.y + Math.sin(a) * age * 2 * s - age * age * 3 * s, pos.z + Math.cos(a) * age * 2 * s).clone(), 0.35 * s * (1 - age / 0.6), 1 - age / 0.6); }
  }
  const starTex = canvasTex(128, 128, (c) => { c.translate(64, 64); c.fillStyle = 'rgba(255,240,170,1)'; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, r = i % 2 ? 22 : 60; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,1)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); });
  const stars = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  /** cartoon impact at time m, world position w: a starburst + dust */
  function impact(t, m, w, s = 1, col = grassDust) {
    const age = t - m; if (age < 0 || age > 0.75) return;
    if (age < 0.32 && starN < stars.length) { const sp = stars[starN++], k = age / 0.32; sp.visible = true; sp.position.copy(w); sp.scale.setScalar(s * (0.3 + 0.55 * Math.sqrt(k))); sp.material.opacity = 1 - k * k; sp.material.rotation = m * 7.3; }
    dust(t, m, w, 0.8 * s, 4, 0.75, col);
  }
  const dizTex = canvasTex(64, 64, (c) => { c.translate(32, 32); c.fillStyle = '#ffd84a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * PI * 2 - PI / 2, r = i % 2 ? 11 : 28; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); });
  const dizzies = Array.from({ length: 36 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dizTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
  /** three little stars circling over a dazed head (world position of the head top) */
  function dizzy(t, head, s = 1) {
    for (let k = 0; k < 3 && dizN < dizzies.length; k++) { const a = t * 5 + k * 2.09, sp = dizzies[dizN++]; sp.visible = true; sp.position.set(head.x + Math.cos(a) * 0.2 * s, head.y + 0.05 * Math.sin(a * 2), head.z + Math.sin(a) * 0.2 * s); sp.scale.setScalar(0.11 * s); }
  }
  const CONFN = 260, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.05, 0.08), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CONFN);
  conf.frustumCulled = false; conf.castShadow = false; scene.add(conf); let confN = 0;
  const CONF_C = [0xff5fa2, 0xffd166, 0x5ad1ff, 0x9b7bff, 0x6fd88a, 0xffffff, 0xe8742a].map((c) => new THREE.Color(c));
  function burst(t, t0, pos, n = 90, spd = 3, dir = null, scale = 1) {
    const age = t - t0; if (age < 0 || age > 2.4) return;
    for (let k = 0; k < n && confN < CONFN; k++) {
      const a = k * 2.399, el = ((k * 0.618) % 1) * 1.6 - 0.3, v = spd * (0.55 + ((k * 0.37) % 1) * 0.6), d = dir || { x: 0, z: 0 };
      _s.set(pos.x + (Math.cos(a) * 0.6 + d.x) * v * age, pos.y + (el * 0.8 + 0.9) * v * age - 3.0 * age * age, pos.z + (Math.sin(a) * 0.6 + d.z) * v * age);
      _q.setFromEuler(_e.set(age * (5 + k % 7), age * (3 + k % 5), k)); _m.compose(_s, _q, _w.set(scale, scale, scale));
      conf.setMatrixAt(confN, _m); conf.setColorAt(confN, CONF_C[k % CONF_C.length]); confN++;
    }
  }
  const BAL_N = 44, balloons = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 14, 10), new THREE.MeshStandardMaterial({ roughness: 0.35 }), BAL_N);
  balloons.frustumCulled = false; scene.add(balloons);
  const BR = rng(31), BAL = Array.from({ length: BAL_N }, (_, i) => { balloons.setColorAt(i, CONF_C[i % CONF_C.length]); return [(BR() - 0.5) * 7.5, 0.2 + BR() * 4.2, BR() * 1.6, BR()]; });
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff3d0).multiplyScalar(1.4), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const shock = mk(new THREE.RingGeometry(0.9, 1.0, 64), ringMat, scene); shock.rotation.x = -PI / 2; shock.visible = false; shock.castShadow = false;
  // casts (+1 day on): white plaster on a forearm, placed from the elbow's world matrix (works on crowd templates too)
  const castG = new THREE.CapsuleGeometry(0.068, 0.17, 6, 12), castM = mat(0xf4f2ec, 0.95), castT = new THREE.Matrix4().makeTranslation(0, -0.13, 0);
  const casts = Array.from({ length: 40 }, () => { const m = mk(castG, castM, scene); m.matrixAutoUpdate = false; m.visible = false; return m; });
  let castN = 0;
  function castOn(rig, side = 1) { if (castN >= casts.length) return; rig.root.updateMatrixWorld(true); const c = casts[castN++]; c.visible = true; c.matrix.multiplyMatrices(rig.arms.find((a) => a.s === side).elbow.matrixWorld, castT); }
  // VOTE STEVE signs for the campaign: two planes back to back (readable from both sides)
  const signT = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#f4efe2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1c3a6e'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#b5462e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font('bold', fitFont(g, ['VOTE'], 200, 'bold', 52)); g.fillText('VOTE', w / 2, 52); g.font = font('bold', fitFont(g, ['STEVE'], 220, 'bold', 70)); g.fillText('STEVE', w / 2, 112); });
  const signs = Array.from({ length: 16 }, () => { const g = new THREE.Group(); for (const ry of [0, PI]) { const pl = mk(new THREE.PlaneGeometry(0.5, 0.31), new THREE.MeshBasicMaterial({ map: signT, color: 0xdddddd }), g); pl.rotation.y = ry; pl.position.z = ry ? -0.004 : 0.004; } mk(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), mat(0xc08a52, 0.6), g, 0, -0.38, 0); g.visible = false; scene.add(g); return g; });
  // the campaign street: VOTE STEVE A-frame boards facing the camera + a STEVE FOR MAYOR banner across Main St
  const aT = canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#1c3a6e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe2'; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = '#b5462e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font('bold', fitFont(g, ['VOTE'], 200, 'bold', 90)); g.fillText('VOTE', w / 2, 110); g.fillStyle = '#1c3a6e'; g.font = font('bold', fitFont(g, ['STEVE'], 210, 'bold', 90)); g.fillText('STEVE', w / 2, 215); });
  for (const x of [4.2, 8.6]) { const b = new THREE.Group(); b.position.set(x, SIDEWALK_H, -2.6); b.rotation.y = -PI / 2; street.root.add(b); mk(new THREE.PlaneGeometry(0.62, 0.78), new THREE.MeshBasicMaterial({ map: aT, color: 0xdddddd }), b, 0, 0.62, 0.03).rotation.x = -0.12; mk(new THREE.BoxGeometry(0.66, 0.82, 0.04), mat(0x5a4a3a, 0.7), b, 0, 0.62, 0); }
  const bnT = canvasTex(1600, 240, (g, w, h) => { g.fillStyle = '#b5462e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe2'; g.fillRect(0, 18, w, h - 36); g.fillStyle = '#1c3a6e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font('bold', fitFont(g, ['STEVE FOR MAYOR'], w - 140, 'bold', 170)); g.fillText('STEVE FOR MAYOR', w / 2, h / 2 + 6); });
  const bn = mk(new THREE.PlaneGeometry(5.4, 0.81), new THREE.MeshBasicMaterial({ map: bnT, color: 0xdddddd, side: THREE.DoubleSide }), street.root, 13, 4.7, -0.5); bn.rotation.y = -PI / 2; bn.castShadow = false;
  const campFill = new THREE.DirectionalLight(0xfff0dc, 1.6); campFill.position.set(-20, 6, -3); campFill.target.position.set(4, 1, -1.3); street.root.add(campFill, campFill.target);   // Main St is backlit: light the faces from the camera side
  for (const z of [-3.2, 2.2]) mk(new THREE.CylinderGeometry(0.01, 0.01, 1.6, 4), mat(0x333333, 0.5), street.root, 13, 4.7, z).rotation.x = PI / 2;

  // ---------------------------------------------------------------- placement helpers
  function put(rig, key, p) {
    const q = { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2], y: (p.y || 0) + OFF[key][1], floor: (p.floor || 0) + OFF[key][1] };
    applyPose(rig, q);
    rig.root.rotation.order = 'YXZ'; rig.root.rotation.x = p.tilt ?? 0; rig.root.rotation.z = p.roll ?? 0;
    rig.root.visible = p.visible !== false;
  }
  const _c = new THREE.Vector3(), _eu = new THREE.Euler(0, 0, 0, 'YXZ');
  /** pose by BODY CENTER C (set-local) with a whole-body yaw/tilt/roll (flying, lying, clinging); legs dangle */
  function putC(rig, key, p, C, yaw, tilt = 0, roll = 0, fold = 0) {   // fold > 0: legs tucked up by that much (a koala cling)
    _eu.set(tilt, yaw, roll); _c.set(0, HC, 0).applyEuler(_eu);
    p.x = C[0] - _c.x; p.y = C[1] - _c.y; p.z = C[2] - _c.z; p.rotY = yaw; p.tilt = tilt; p.roll = roll;
    if (fold > 0) p.floor = p.y + fold;
    else if (p.floor === 0 || p.floor === undefined) p.floor = p.y - 2.5;
    put(rig, key, p);
  }
  /** pose by body center C (set-local) with any orientation q (the rolling cannonball) */
  function putQ(rig, key, p, C, q, hc = HC) {
    p.x = 0; p.z = 0; p.y = 0; p.tilt = 0; p.roll = 0; put(rig, key, p);
    rig.root.quaternion.copy(q); _c.set(0, hc, 0).applyQuaternion(q);
    rig.root.position.set(C[0] - _c.x + OFF[key][0], C[1] - _c.y + OFF[key][1], C[2] - _c.z + OFF[key][2]);
  }
  const man = (i, key, poseFn) => { const m = MEN[i]; crowd.add(m.k, m.look, (rig) => poseFn(rig, key, m)); };
  const headTop = (rig) => { rig.root.updateMatrixWorld(true); return rig.head.g.localToWorld(_w.set(0, 0.2, 0)).clone(); };
  const toward = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const shout = (t, s, rate = 6) => (Math.sin(t * rate + s * 9) > -0.2 ? 'o' : 'smile');
  const gpose = () => steve.basePose();
  function gput(key, p) { p.x += OFF[key][0]; p.z += OFF[key][2]; p.y = (p.y || 0) + OFF[key][1]; steve.apply(p); steve.g.visible = true; }
  const placeK = (r, key, o) => (o.kind === 'P' ? put(r, key, o.p) : putC(r, key, o.p, o.C, o.yaw, o.tilt || 0, o.roll || 0));

  // ================================================================ performances (pure: f(t) → pose)
  // the men before the fight: bouncing, fists up, shouting (faces −x)
  function hypeMan(t, i, m) {
    const p = basePose(); p.eyes = blink(t, i * 0.37); const [x, z] = BLK[i];
    const b = Math.max(0, Math.sin(t * 7.5 + m.seed * 6.3));
    Object.assign(p, { x, z, y: 0.14 * b * b, floor: 0.14 * b * b, rotY: -PI / 2 + (m.s2 - 0.5) * 0.4, mouth: shout(t, m.seed), headPitch: -0.12, lean: -0.05 });
    const pump = Math.sin(t * 8 + m.s3 * 7);
    const over = m.seed > 0.5 && i >= 11;
    p.armA = over ? mixArm(UP_A, A(-2.3, 0.5, -1.4, 0.3), 0.5 + 0.5 * pump) : A(-1.2 - 0.3 * pump, 0.4, -1.9, 0.5);
    p.armB = over ? mixArm(UP_B, A(-2.3, 0.5, -1.4, -0.3), 0.5 - 0.5 * pump) : A(-1.2 + 0.3 * pump, 0.4, -1.9, -0.5);
    return p;
  }
  // the chest bump: they jump, collide mid-air at BUMP and rocket apart — the left one takes out two men like dominoes,
  // the right one slams into Dave
  const bumpEnd = (j) => (j ? [0.75, 0.25, 1.15] : [1.5, 0.17, -2.9]);
  function bumper(t, j) {
    const [x, z0] = BUMPERS[j], s = j ? -1 : 1, p = basePose(); p.eyes = blink(t, j + 3);
    const u = clamp((t - BUMP + 0.3) / 0.3), back = t - BUMP;
    if (back < 0) {
      const turn = K(t, [[6.4, 0], [6.7, 1]]), jump = Math.sin(PI * u) * 0.55;
      Object.assign(p, { mouth: 'o', headPitch: -0.2 });
      p.armA = mixArm(UP_A, A(0.5, 0.6, -0.4), u); p.armB = mixArm(UP_B, A(0.5, 0.6, -0.4), u);
      return { p, C: [x, HC + jump, z0 + s * 0.42 * u], yaw: lerpAngle(-PI / 2, s > 0 ? 0 : PI, turn), tilt: -0.25 * u };
    }
    const fl = clamp(back / 0.55), e = bumpEnd(j), z1 = z0 + s * 0.42;
    Object.assign(p, { mouth: 'o', eyes: fl >= 1 ? 'closed' : p.eyes }); p.armA = STAR_A; p.armB = STAR_B;
    const b = Math.max(0, back - 0.55), bounce = 0.25 * Math.exp(-b * 7) * Math.abs(Math.sin(b * 13));
    return { p, C: [lerp(x, e[0], fl), lerp(HC + 0.55, e[1], fl) + 0.9 * Math.sin(PI * fl) + bounce, lerp(z1, e[2], fl)], yaw: s > 0 ? 0 : PI, tilt: (-PI / 2 - 2 * PI) * ease(fl) };
  }
  function domino(t, k, m) {   // knocked over sideways (toward −z), one after the other
    const [x, z] = DOMINO[k], p = hypeMan(t, DOMINO[k][2], m); Object.assign(p, { x, z, rotY: -PI / 2, y: 0, floor: 0 });
    const f = K(t, [[BUMP + 0.25 + k * 0.13, 0], [BUMP + 0.6 + k * 0.13, 1]], (u) => u * u);
    if (f > 0) { p.roll = (PI / 2) * f; p.y = 0.13 * f; p.mouth = 'o'; p.armA = mixArm(p.armA, STAR_A, f); p.armB = mixArm(p.armB, STAR_B, f); p.eyes = f > 0.9 ? 'closed' : p.eyes; }
    return p;
  }
  function daveHype(t) {
    const p = basePose(); p.eyes = blink(t, 1); const b = Math.max(0, Math.sin(t * 7.5 + 1));
    Object.assign(p, { x: DAV0[0], z: DAV0[1], y: 0.16 * b * b, floor: 0.16 * b * b, rotY: -PI / 2 - 0.55, mouth: shout(t, 0.3, 7), headPitch: -0.1 });
    p.armA = A(-2.2, 0.45, -1.7, 0.4); p.armB = mixArm(UP_B, A(-2.4, 0.4, -1.5, -0.3), 0.5 + 0.5 * Math.sin(t * 9));
    const f = K(t, [[BUMP + 0.4, 0], [BUMP + 0.75, 1]], (u) => u * u);   // the right bumper lands on him: face-first at the lens
    if (f > 0 && t < 8.2) { p.tilt = (PI / 2) * f; p.y = 0.13 * f; p.floor = 0; p.mouth = 'o'; p.armA = mixArm(p.armA, STAR_A, f); p.armB = mixArm(p.armB, STAR_B, f); p.eyes = f > 0.9 ? 'closed' : p.eyes; }
    return p;
  }
  const flinchK = (t, m) => K(t, [[STEP + m.seed * 0.08, 0], [STEP + 0.25 + m.seed * 0.08, 1]]);
  function flinchMan(t, i, m) {   // the shockwave reaches row by row: everyone skids back, arms flung up; some go flat, some spin around
    const p = hypeMan(t, i, m), a = t - (STEP + 0.03 * Math.floor(i / 11));
    if (a <= 0) return p;
    const k = ease(a / 0.35);
    p.x += 1.7 * k + 0.25 * a; p.y = 0; p.floor = 0; p.mouth = 'o'; p.lean = -0.35 * k; p.headPitch = -0.2 * k;
    p.armA = mixArm(p.armA, A(-2.6, 1.0, -0.4), k); p.armB = mixArm(p.armB, A(-2.6, 1.0, -0.4), k);
    if (m.seed < 0.28) { const f = ease((a - 0.12) / 0.35); if (f > 0) { p.tilt = (-PI / 2) * f; p.y = 0.13 * f; p.eyes = f > 0.7 ? 'closed' : p.eyes; } }
    else if (m.s3 < 0.15) p.rotY += 2 * PI * ease(a / 0.6);
    return p;
  }
  // the charge: the block runs at Steve (seen from behind him) and skids to a stop once Dave has the leg
  const runDist = (t) => (t < GRAB ? 5.5 * (t - 18.4) : 5.5 * (GRAB - 18.4) + 5.5 * Math.min(t - GRAB, 0.55) - 5.0 * Math.min(t - GRAB, 0.55) ** 2);
  function chargeMan(t, i, m) {
    const p = basePose(); p.eyes = blink(t, i * 0.37); const row = Math.floor(i / 11);
    const xAt = (tt) => SX + 14.4 + row * 0.95 + (m.s2 - 0.5) * 0.3 - runDist(tt), d = runDist(t), x = xAt(t), z = BLK[i][1] * 0.75;
    const trip = m.seed < 0.1 ? 18.75 + m.s2 * 1.2 : 1e9;   // ~10 men trip over their own feet and tumble
    if (t > trip) { const a = t - trip, x0 = xAt(trip), f = ease(a / 0.9); p.mouth = 'o'; p.armA = STAR_A; p.armB = STAR_B; p.eyes = a > 0.9 ? 'closed' : p.eyes;
      return { kind: 'C', p, C: [x0 - 3.2 * (1 - Math.exp(-a * 2.2)), lerp(HC, 0.2, f) + 0.5 * Math.abs(Math.sin(a * 7)) * (1 - f), z], yaw: -PI / 2, tilt: lerp(0, 2 * PI + PI / 2, f) }; }
    const running = t < GRAB + 0.4;
    Object.assign(p, { x, z, rotY: -PI / 2, dist: running ? d * 0.55 + m.seed : 0, speed: running ? 0.9 : 0, lean: running ? 0.28 : -0.12, mouth: 'o', headPitch: running ? -0.25 : 0 });
    const ph = d * 4 + m.seed * 6;
    p.armA = running ? A(-0.6 * Math.sin(ph) - 0.3, 0.15, -1.5, 0.3) : GUARD_A; p.armB = running ? A(0.6 * Math.sin(ph) - 0.3, 0.15, -1.5, -0.3) : GUARD_B;
    return { kind: 'P', p };
  }

  // Steve -----------------------------------------------------------------------------------------------
  function steveSit(t, p) { steve.sit(p); p.lids = 0.42; p.mouth = 'flat'; p.headPitch = 0.05; p.headYaw = 0.12 * Math.sin(t * 0.7); return p; }
  function steveAt(t, cam) {
    const p = gpose(); Object.assign(p, { x: SX, z: ST[1], rotY: PI / 2 });
    if (cam === 'open') { steveSit(t, p); return p; }
    if (cam === 'steve') {
      const up = K(t, [[UP, 0], [UP + 0.4, 1]]);
      if (up < 1) { steveSit(t, p); steve.yawn(p, pulse(t, YAWN0, YAWN0 + 1.6, 0.45)); if (t > YAWN0 + 1.5 && t < UP) { p.armB = mixArm(p.armB, A(-0.9, 0.25, -1.8, -0.7), pulse(t, YAWN0 + 1.5, UP, 0.12)); p.armB.sx += 0.15 * Math.sin(t * 20); } }
      if (up > 0) { const q = gpose(); steve.stand(q); q.hipY = lerp(0.3, steve.HIP, up); q.lids = 0.15; const cb = K(t, [[BEAT0, 0], [BEAT0 + 0.12, 1]]); if (cb > 0) steve.chestBeat(q, t, cb); Object.assign(p, q, { x: SX, z: ST[1], rotY: PI / 2, footFwd: lerp(0.42, 0.05, up), splay: lerp(0.42, 0.12, up) }); }
      return p;
    }
    if (cam === 'flinch') { steve.stand(p); return p; }
    if (cam === 'charge' || cam === 'throwA') {
      steve.stand(p); p.lids = 0.35; p.headPitch = K(t, [[GRAB, 0], [GRAB + 0.3, 0.45]]); p.look = [0, -0.6 * K(t, [[GRAB, 0], [GRAB + 0.3, 1]])];
      const lift = K(t, [[LIFT + 0.05, 0], [LIFT + 0.35, 0.85], [FLING - 0.06, 0.85], [FLING + 0.04, 1.0], [FLING + 0.4, 0]]);
      const shake = t > LIFT + 0.35 && t < FLING - 0.06 ? 0.16 * Math.sin(t * 30) : 0;
      p.legLift = [lift + shake, 0]; p.legFwd = [0.5 * lift, 0]; p.lean = 0.12 - 0.12 * lift; p.armA = A(-0.2, 0.35 + 0.6 * lift, -0.3); p.armB = A(-0.2, 0.35 + 0.6 * lift, -0.3);
      return p;
    }
    if (cam === 'bowl') {
      steve.stand(p); p.lids = 0.4;
      const sw = clamp((t - PICK - 0.15) / (REL - PICK - 0.15));
      if (t > PICK - 0.25) { const reach = K(t, [[PICK - 0.25, 0], [PICK, 1]]); p.armA = mixArm(p.armA, A(-0.9, 0.55, -0.2), reach); p.headYaw = 0.5 * reach; }
      if (t > PICK + 0.15 && t < REL + 0.6) { const back = sw < 0.55 ? Math.sin(PI * clamp(sw / 0.55)) : 0, fwd = sw >= 0.55 ? ease((sw - 0.55) / 0.45) : 0; p.armA = A(lerp(-0.9, 0.95, back) - 1.7 * fwd, 0.25, -0.15); p.lean = 0.12 + 0.45 * fwd; p.headYaw = 0.5 * (1 - fwd); p.legFwd = [0.25 * fwd, -0.15 * fwd]; }
      if (t >= REL + 0.6) { p.armA = A(-1.25, 0.2, -0.15); p.lean = 0.5 - 0.3 * K(t, [[HIT + 0.6, 0], [HIT + 1.4, 1]]); p.lids = 0.5; p.legFwd = [0.25, -0.15]; }
      return p;
    }
    if (cam === 'ring') {
      steve.stand(p); p.lids = 0.4; p.headYaw = 0.7 * Math.sin((t - FORM) * 1.7) * K(t, [[FORM + 0.5, 0], [SET_, 1], [SPIN - 0.1, 0]]);
      const sp = K(t, [[SPIN - 0.15, 0], [SPIN + 0.1, 1], [BLAST + 1.2, 1], [BLAST + 1.8, 0]]);
      if (sp > 0) { const q = steve.spinArms(gpose()); p.armA = mixArm(p.armA, q.armA, sp); p.armB = mixArm(p.armB, q.armB, sp); p.lean = 0.05; }
      const u = clamp((t - SPIN) / 1.6); p.rotY = PI / 2 + 4 * PI * (u - 0.5 * u * u) * 1.33;
      return p;
    }
    if (cam === 'tire' || cam === 'lastA' || cam === 'lastB' || cam === 'pile') {
      steveSit(t, p); p.lids = 0.5; const bites = cam === 'tire' ? [36.5, 37.6, 38.7, 39.6] : [47.55, 48.5];
      let e = 0.55; for (const b of bites) e = Math.max(e, pulse(t, b - 0.3, b + 0.25, 0.2));
      if (cam === 'tire' || cam === 'lastB') { steve.eat(p, e, -1); p.jaw = 0.08 + 0.08 * Math.max(0, Math.sin(t * 9)); p.headYaw = cam === 'lastB' ? -0.32 : 0.2 * Math.sin(t * 0.8); if (cam === 'lastB') p.look = [-0.4, 0]; }
      if (cam === 'lastA') {   // Dave's banana: reach, take, hold it; a one-finger flick
        const reach = K(t, [[TAKE - 0.35, 0], [TAKE, 1], [TAKE + 0.35, 0.4]]); p.armA = mixArm(p.armA, A(-1.3, 0.4, -0.35, 0.3), reach); p.headYaw = 0.25; p.look = [0.3, 0];
        const fl = pulse(t, FLICK - 0.14, FLICK + 0.12, 0.08); if (fl > 0) p.armB = mixArm(p.armB, A(-1.5, 0.7, -0.1, -0.2), fl);
      }
      if (cam === 'pile') {
        const up = K(t, [[LAUNCH - 0.05, 0], [LAUNCH + 0.18, 1]]), down = K(t, [[LAUNCH + 1.3, 0], [LAUNCH + 1.7, 1]]);
        if (up > 0) { const k = up * (1 - down); p.hipY = lerp(0.3, steve.HIP, k); p.footFwd = lerp(0.42, 0.05, k); p.splay = lerp(0.42, 0.12, k); p.lean = lerp(0.18, 0.05, k); p.armA = mixArm(p.armA, A(-2.6, 0.6, -0.3), k); p.armB = mixArm(p.armB, A(-2.6, 0.6, -0.3), k); p.lids = lerp(0.5, 0.15, k); p.mouth = k > 0.5 ? 'o' : 'flat'; }
      }
      return p;
    }
    steve.stand(p); return p;
  }
  // where Dave leaves the shin, and where the cannonball man leaves Steve's hand — computed once, so every frame is pure
  function shinAt(t) { gput('stad', steveAt(t, 'throwA')); steve.g.updateMatrixWorld(true); const s = steve.legs[0].knee.localToWorld(new THREE.Vector3(0, -0.06, 0)); return [s.x - OFF.stad[0] + 0.26, s.y - 0.05, s.z - OFF.stad[2] + 0.1]; }
  function handAt(t) { gput('stad', steveAt(t, 'bowl')); steve.g.updateMatrixWorld(true); const h = steve.arms[0].hand.localToWorld(new THREE.Vector3(0, -0.3, 0.1)); return [h.x - OFF.stad[0], Math.max(0.48, h.y), h.z - OFF.stad[2]]; }
  const FLING_FROM = shinAt(FLING), REL_POS = handAt(REL);

  // Dave in the stadium: charge → dive → cling to the shin → fling → the jumbotron → slide down
  function daveStad(t) {
    const p = basePose(); p.eyes = blink(t, 1); p.mouth = 'o';
    if (t < DIVE0) { const d = 6.2 * (t - 18.4); Object.assign(p, { x: SX + 11.0 - d, z: 0.3, rotY: -PI / 2, dist: d * 0.55, speed: 0.9, lean: 0.32, headPitch: -0.3 }); const ph = d * 4; p.armA = A(-0.6 * Math.sin(ph) - 0.3, 0.15, -1.5, 0.3); p.armB = A(0.6 * Math.sin(ph) - 0.3, 0.15, -1.5, -0.3); return { kind: 'P', p }; }
    if (t < GRAB) { const u = (t - DIVE0) / (GRAB - DIVE0), x0 = SX + 11.0 - 6.2 * (DIVE0 - 18.4); p.armA = A(-2.95, 0.15, -0.1); p.armB = A(-2.95, 0.15, -0.1); return { kind: 'C', p, C: [lerp(x0, FLING_FROM[0], u), lerp(HC, FLING_FROM[1], u) + 0.9 * Math.sin(PI * u), lerp(0.3, FLING_FROM[2], u)], yaw: -PI / 2, tilt: lerp(0.4, 1.45, ease(u)) }; }   // a slow-motion superman dive
    if (t < FLING) { p.mouth = t < LIFT + 0.35 ? 'smile' : 'o'; p.armA = HUG_A; p.armB = HUG_B; return { kind: 'shin', p }; }
    p.armA = STAR_A; p.armB = STAR_B; p.eyes = 'open';
    if (t < SPLAT) { const u = clamp((t - FLING) / (SPLAT - FLING)); return { kind: 'C', p, C: [lerp(FLING_FROM[0], SCREEN[0] + 0.25, u), lerp(FLING_FROM[1], SCREEN[1], u) + 7.5 * Math.sin(PI * u) * (1 - u * 0.2), lerp(FLING_FROM[2], SCREEN[2], u)], yaw: PI / 2, tilt: -1.4 + (1.4 + 2 * PI) * u, roll: 0.3 * Math.sin(u * 7) }; }
    const sl = K(t, [[SLIDE, 0], [SLIDE + 0.6, 1]], (u) => u * u);
    if (sl < 1) { p.eyes = t > SPLAT + 0.15 ? 'closed' : 'open'; return { kind: 'C', p, C: [SCREEN[0] + 0.25, lerp(SCREEN[1], 2.0 + HC, sl), SCREEN[2]], yaw: PI / 2, tilt: 0, roll: 0 }; }
    // sitting on the stage deck (top y = 2.0), legs out, dazed
    Object.assign(p, { x: SCREEN[0] + 0.45, z: SCREEN[2], y: 2.15 - 0.865, floor: 2.1, footFwd: 0.7, rotY: PI / 2, lean: -0.15, eyes: 'closed', mouth: 'o' });
    p.armA = A(-0.3, 0.5, -0.4); p.armB = A(-0.3, 0.5, -0.4);
    return { kind: 'P', p };
  }

  // bowling: the ball man + ten pins
  const PINS = []; for (let r = 0; r < 4; r++) for (let j = 0; j <= r; j++) PINS.push([SX + 9.6 + r * 0.75, (j - r / 2) * 0.8, r]);
  const BALL_I = 50, PIN_I = (k) => 60 + k;
  const pinV = (m, z) => [2.2 + 3 * m.seed, (z === 0 ? m.s2 - 0.5 : Math.sign(z)) * (1.8 + 2.4 * m.s3), 5.5 + 2.5 * m.s2];
  function pinPose(t, k, m) {
    const [x, z, r] = PINS[k], p = basePose(); p.eyes = blink(t, k);
    const a = t - (HIT + r * 0.07);
    if (a < 0) { const scared = K(t, [[HIT - 0.45, 0], [HIT - 0.3, 1]]); Object.assign(p, { x, z, rotY: -PI / 2, mouth: scared > 0 ? 'o' : 'smile' }); p.armA = mixArm(REST, HEAD_A, scared); p.armB = mixArm(REST, HEAD_B, scared); return { kind: 'P', p }; }
    const [vx, vz, vy] = pinV(m, z), tl = (2 * vy) / 9.8;
    p.mouth = 'o'; p.armA = STAR_A; p.armB = STAR_B;
    if (a < tl) return { kind: 'C', p, C: [x + vx * a, HC + vy * a - 4.9 * a * a, z + vz * a], yaw: -PI / 2 + m.seed * 3 * a, tilt: (4 + 4 * m.s3) * a * (m.seed > 0.5 ? 1 : -1), roll: 3 * a * (m.s2 - 0.5) };
    const b = a - tl; p.eyes = 'closed';
    return { kind: 'C', p, C: [x + vx * tl + 0.3 * Math.min(b, 0.3), 0.17 + 0.25 * Math.exp(-b * 7) * Math.abs(Math.sin(b * 13)), z + vz * tl], yaw: -PI / 2 + m.seed * 6, tilt: -PI / 2, roll: 0, land: [x + vx * tl, z + vz * tl, HIT + r * 0.07 + tl] };
  }
  const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qc = new THREE.Quaternion(), XA = new THREE.Vector3(1, 0, 0), YA = new THREE.Vector3(0, 1, 0), ZA = new THREE.Vector3(0, 0, 1);
  const BALL_STOP = SX + 12.6;
  const ballG = new THREE.Group(); scene.add(ballG); ballG.visible = false;
  { const B = MEN[BALL_I].look;
    mk(new THREE.SphereGeometry(0.42, 24, 18), mat(JERSEY, 0.9), ballG);
    const st = mk(new THREE.TorusGeometry(0.42, 0.035, 8, 40), mat(0xffffff, 0.8), ballG); st.rotation.y = PI / 2;
    const hd = new THREE.Group(); hd.position.set(0, 0.22, 0.33); ballG.add(hd);
    mk(new THREE.SphereGeometry(0.15, 18, 14), mat(B.skin, 0.62), hd);
    mk(new THREE.SphereGeometry(0.158, 18, 10, 0, PI * 2, 0, PI * 0.5), mat(B.hair, 0.75), hd).rotation.x = -0.4;
    for (const sx of [-1, 1]) mk(new THREE.SphereGeometry(0.018, 8, 6), mat(0x1b1310, 0.35), hd, sx * 0.05, 0.02, 0.135);
    mk(new THREE.SphereGeometry(0.03, 10, 8), mat(0x3a1512, 0.6), hd, 0, -0.06, 0.13).scale.set(1, 1.2, 0.5);
    for (const sx of [-1, 1]) mk(new RoundedBoxGeometry(0.1, 0.07, 0.2, 2, 0.03), mat(0x3a2e2a, 0.7), ballG, sx * 0.13, -0.28, 0.3).rotation.x = 0.5;
    for (const sx of [-1, 1]) mk(new THREE.SphereGeometry(0.055, 10, 8), mat(B.skin, 0.62), ballG, sx * 0.3, 0.05, 0.28);   // hands hugging the knees
  }
  function ballMan(t, r, key) {   // before PICK: a man standing next to Steve; then the man-ball (hand → backswing → roll)
    const p = basePose(); p.eyes = blink(t, 7); p.mouth = t > PICK - 0.4 ? 'o' : 'smile';
    if (t < PICK) { Object.assign(p, { x: SX + 1.1, z: 0.9, rotY: toward(SX + 1.1, 0.9, SX, 0) }); p.armA = REST; p.armB = REST; return put(r, key, p); }
    p.visible = false; put(r, key, p);
    let C, spin;
    if (t < REL) { C = handAt(t); gput('stad', steveAt(t, 'bowl')); C[1] = Math.max(0.42, C[1]); spin = (t - PICK) * 3; }
    else { const d = BALL_V * (t - REL), full = BALL_STOP - REL_POS[0], dd = d < full - 1.2 ? d : full - 1.2 * Math.exp(-(d - full + 1.2) / 1.2); C = [REL_POS[0] + dd, 0.42, lerp(REL_POS[2], 0, clamp(dd / 8))]; spin = dd / 0.42; }
    ballG.visible = true; ballG.position.set(C[0] + OFF.stad[0], C[1] + OFF.stad[1], C[2] + OFF.stad[2]);
    _qa.setFromAxisAngle(ZA, -spin); _qb.setFromAxisAngle(YA, -PI / 2); ballG.quaternion.copy(_qa.multiply(_qb));
  }

  // the ring: 89 men on five rings around Steve (top-down), then the spin blows it apart
  const RINGS = [[1.65, 10], [2.45, 15], [3.25, 20], [4.05, 24], [4.85, 20]], SLOT = [];
  RINGS.forEach(([r, n], ri) => { for (let j = 0; j < n; j++) SLOT.push([r, (j / n) * PI * 2 + ri * 0.21, ri]); });
  function ringMan(t, i, m) {
    const [r, a, ri] = SLOT[i], p = basePose(); p.eyes = blink(t, i * 0.3);
    const tx = SX + Math.cos(a) * r, tz = Math.sin(a) * r, r0 = 9.5 + 3 * m.seed, sx0 = SX + Math.cos(a + 0.4) * r0, sz0 = Math.sin(a + 0.4) * r0;
    const u = clamp((t - FORM - m.seed * 0.5) / (1.4 + 0.3 * m.s2)), arrive = ease(u);
    const x = lerp(sx0, tx, arrive), z = lerp(sz0, tz, arrive), face = toward(tx, tz, SX, 0);
    const fly = t - (BLAST + ri * 0.05);
    if (fly < 0) {
      const ready = K(t, [[SET_ - 0.2 + m.seed * 0.2, 0], [SET_ + 0.1 + m.seed * 0.2, 1]]);
      Object.assign(p, { x, z, rotY: u < 1 ? toward(sx0, sz0, tx, tz) : face, dist: arrive * r0 * 0.5, speed: u > 0 && u < 1 ? 0.9 : 0, crouch: 0.16 * ready, lean: 0.25 * ready, mouth: 'o' });
      p.armA = mixArm(REST, WIDE_A, ready); p.armB = mixArm(REST, WIDE_B, ready);
      return { kind: 'P', p };
    }
    const v = 2.4 + 1.2 * m.seed - ri * 0.15, vy = 8.0 - ri * 0.4 + 2 * m.s2, tl = (2 * vy) / 9.8, ox = Math.cos(a), oz = Math.sin(a);   // high + short: they come down inside the frame
    p.armA = STAR_A; p.armB = STAR_B; p.mouth = 'o';
    if (fly < tl) return { kind: 'C', p, C: [tx + ox * v * fly, HC + vy * fly - 4.9 * fly * fly, tz + oz * v * fly], yaw: face + fly * 3 * (m.seed - 0.5), tilt: -(3 + 3 * m.s3) * fly, roll: 2 * fly * (m.s2 - 0.5) };
    p.eyes = 'closed';
    return { kind: 'C', p, C: [tx + ox * v * tl, 0.17, tz + oz * v * tl], yaw: face, tilt: -PI / 2, roll: 0 };
  }

  // tire him out: 41 men jog laps around Steve and drop one by one (29 of them); the last 12 stop and pant
  const LOOP_R = 2.9, NRUN = 41, NDROP = 29;
  const dropT = (k) => DROP0 + (DROP1 - DROP0) * (k / (NDROP - 1));
  const runA = (t, k) => { const tt = Math.min(t, 40.3); return (k / NRUN) * PI * 2 + 1.05 * (tt - 35) - 0.075 * Math.max(0, tt - 38) ** 2; };
  function tireMan(t, k, m) {
    const p = basePose(); p.eyes = blink(t, k * 0.4);
    const dropped = k < NDROP, td = dropped ? dropT(k) : 1e9, a = runA(Math.min(t, td), k), r = LOOP_R + (m.seed - 0.5) * 0.5;
    const x = SX + Math.cos(a) * r, z = Math.sin(a) * r, yaw = toward(x, z, SX + Math.cos(a + 0.1) * r, Math.sin(a + 0.1) * r);
    if (t < td) {
      let hop = 0; for (let j = 0; j < NDROP; j++) { if (dropT(j) > t) break; const aj = runA(dropT(j), j), da = Math.atan2(Math.sin(a - aj), Math.cos(a - aj)); if (Math.abs(da) < 0.14) hop = Math.max(hop, Math.cos((da / 0.14) * (PI / 2)) * 0.32); }
      const tired = K(t, [[35, 0], [40, 1]]), stopK = dropped ? 0 : K(t, [[40.15, 0], [40.45, 1]]);
      Object.assign(p, { x, z, y: hop, floor: hop, rotY: yaw, dist: a * r * 0.55, speed: 0.85 * (1 - stopK), lean: 0.2 + 0.25 * tired + 0.4 * stopK, mouth: 'o', headPitch: -0.2 * tired });
      const ph = a * r * 2.2; p.armA = A(-0.5 * Math.sin(ph) - 0.3, 0.2 + 0.25 * tired, -1.4, 0.3); p.armB = A(0.5 * Math.sin(ph) - 0.3, 0.2 + 0.25 * tired, -1.4, -0.3);
      if (stopK > 0) { p.armA = mixArm(p.armA, KNEE_A, stopK); p.armB = mixArm(p.armB, KNEE_B, stopK); p.crouch = 0.12 * stopK; p.headPitch = -0.35 * stopK; p.y = 0; p.floor = 0; }
      return { kind: 'P', p };
    }
    const f = ease((t - td) / 0.38); p.mouth = 'o'; p.eyes = f > 0.8 ? 'closed' : 'open'; p.armA = mixArm(REST, STAR_A, f); p.armB = mixArm(REST, STAR_B, f);
    return { kind: 'C', p, C: [x, lerp(HC, 0.17, f) + 0.15 * Math.sin(PI * f), z], yaw, tilt: -PI / 2 * f, roll: 0, flop: td + 0.38, pos: [x, z] };
  }

  // the dogpile: 11 of the last 12 leap on Steve and vanish into a cartoon fight cloud — arms, legs and heads poke out of it,
  // stars pop, it wobbles; then Steve stands up, the cloud bursts and they launch and rain down
  const PC = [SX, 1.15, 0], LASTI = NRUN - 1;
  const inCloud = (t, j) => { const th = j * 2.399 + t * (j % 2 ? 2.1 : -1.7), ph = 0.45 + 1.0 * ((j * 0.618) % 1), r = 1.0 + 0.18 * Math.sin(t * 8 + j);
    return [PC[0] + r * Math.sin(ph) * Math.cos(th) + 0.12 * Math.sin(t * 11), PC[1] + 0.8 * r * Math.cos(ph) + 0.08 * Math.sin(t * 13 + 1), PC[2] + r * Math.sin(ph) * Math.sin(th)]; };
  function pileMan(t, j, m) {
    const k = NDROP + j, p = basePose(); p.eyes = blink(t, j);
    const a0 = runA(40.3, k), sx = SX + Math.cos(a0) * LOOP_R, sz = Math.sin(a0) * LOOP_R;
    const jt = JUMP0 + j * 0.07, u = clamp((t - jt) / 0.55);
    if (t < jt) { Object.assign(p, { x: sx, z: sz, rotY: toward(sx, sz, SX, 0), crouch: 0.15, lean: 0.35, mouth: 'o' }); p.armA = UP_A; p.armB = UP_B; return { kind: 'P', p }; }
    const fly = t - (LAUNCH + 0.02 * j);
    p.mouth = 'o'; p.armA = STAR_A; p.armB = STAR_B;
    if (fly < 0) {
      const c = inCloud(t, j), tgt = u < 1 ? inCloud(jt + 0.55, j) : c, C = u < 1 ? [lerp(sx, tgt[0], u), lerp(HC, tgt[1], u) + 1.5 * Math.sin(PI * u), lerp(sz, tgt[2], u)] : c;
      const out = toward(PC[0], PC[2], C[0], C[2]);   // the body points out of the cloud, so limbs poke through
      return { kind: 'C', p, C, yaw: out, tilt: u < 1 ? lerp(0.3, 1.3, u) : 1.3 + 0.5 * Math.sin(t * 9 + j), roll: u < 1 ? 0 : 0.6 * Math.sin(t * 7 + j * 2) };
    }
    const st = inCloud(LAUNCH + 0.02 * j, j), sa = Math.atan2(st[2] - PC[2], st[0] - PC[0]);
    const vx = Math.cos(sa) * (2.0 + 2.5 * m.seed), vz = Math.sin(sa) * (2.0 + 2.5 * m.seed), vy = 9.5 + 2 * m.s2, tl = (vy + Math.sqrt(vy * vy + 2 * 9.8 * (st[1] - 0.17))) / 9.8;
    if (fly < tl) return { kind: 'C', p, C: [st[0] + vx * fly, st[1] + vy * fly - 4.9 * fly * fly, st[2] + vz * fly], yaw: toward(PC[0], PC[2], st[0], st[2]) + fly * 2 * (m.seed - 0.5), tilt: 1.3 + (5 + 3 * m.s3) * fly, roll: 2 * fly * (m.s2 - 0.5) };
    const b = fly - tl; p.eyes = 'closed';
    return { kind: 'C', p, C: [st[0] + vx * tl, 0.17 + 0.3 * Math.exp(-b * 7) * Math.abs(Math.sin(b * 12)), st[2] + vz * tl], yaw: toward(PC[0], PC[2], st[0], st[2]), tilt: -PI / 2, roll: 0, land: [st[0] + vx * tl, st[2] + vz * tl, LAUNCH + 0.02 * j + tl] };
  }
  const cloudPool = makeSpritePool(scene, 30, 'smoke'), cloudCol = new THREE.Color(0xf2e6cf);
  const CLOUD0 = JUMP0 + 0.25;
  function fightCloud(t) {
    cloudPool.hide(); if (t < CLOUD0 || t > LAUNCH + 0.6) return;
    const grow = ease((t - CLOUD0) / 0.35), pop = t > LAUNCH ? (t - LAUNCH) / 0.6 : 0;
    for (let k = 0; k < 30; k++) {
      const th = k * 2.399 + t * 1.3, ph = Math.acos(1 - 2 * ((k + 0.5) / 30)), r = (0.75 + 0.12 * Math.sin(t * 9 + k)) * (1 + 2.2 * pop);
      cloudPool.set(k, L('stad', PC[0] + r * Math.sin(ph) * Math.cos(th) + 0.1 * Math.sin(t * 6), PC[1] + 0.85 * r * Math.cos(ph) + 0.06 * Math.sin(t * 7), PC[2] + r * Math.sin(ph) * Math.sin(th)), (1.1 + 0.25 * Math.sin(t * 5 + k)) * grow, 0.95 * (1 - pop), cloudCol);
    }
  }
  const STAR_T = Array.from({ length: 16 }, (_, k) => CLOUD0 + 0.2 + k * 0.15);   // stars popping on the cloud
  // Dave's last stand: he walks up with a banana, offers it, Steve takes it, one flick → the upper deck (the crowd catches him)
  const DSTART = [SX + 2.8, -1.6], DOFF = [SX + 1.3, 0.35];   // Dave waits off to the side (he blocked the dogpile)
  const DECK = tread(20), DTH = (-140 * PI) / 180, DLANDP = [DECK.r * Math.cos(DTH), DECK.y + 2.0, DECK.r * Math.sin(DTH) * (SD.B / SD.A)];   // the upper deck behind Steve's left shoulder
  const SLING_A = A(-0.25, 0.15, -1.6, 0.9), SLING_B = A(-0.25, 0.15, -1.6, -0.9), PALM_A = A(-1.45, 0.1, -2.5, 0.7), OFFER_B = A(-1.35, 0.25, -0.25, -0.2);
  function daveLast(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    if (t < 44.7) { Object.assign(p, { x: DSTART[0], z: DSTART[1], rotY: toward(DSTART[0], DSTART[1], SX, 0), mouth: 'o' }); p.armA = HEAD_A; p.armB = HEAD_B; return { kind: 'P', p }; }
    if (t < FLICK) {
      const u = ease((t - 44.7) / (OFFER - 44.7)), x = lerp(DSTART[0], DOFF[0], u), z = lerp(DSTART[1], DOFF[1], u);
      Object.assign(p, { x, z, rotY: toward(x, z, SX, 0), dist: u * 2.4, speed: u > 0 && u < 1 ? 0.5 : 0, mouth: 'smile', headPitch: -0.05 });
      const off = K(t, [[44.9, 0], [45.3, 1]]), back = K(t, [[TAKE + 0.05, 0], [TAKE + 0.3, 1]]);
      p.armB = mixArm(mixArm(REST, OFFER_B, off), REST, back); p.armA = mixArm(REST, A(-1.6, 0.4, -1.9, 0.6), K(t, [[TAKE + 0.2, 0], [TAKE + 0.4, 1]]));
      return { kind: 'P', p };
    }
    p.mouth = 'o'; p.armA = STAR_A; p.armB = STAR_B;
    const u = clamp((t - FLICK) / (DLAND - FLICK)), P0 = [DOFF[0] + 0.1, HC, DOFF[1]];
    if (u < 1) return { kind: 'C', p, C: [lerp(P0[0], DLANDP[0], u), lerp(P0[1], DLANDP[1], u) + 6 * Math.sin(PI * u), lerp(P0[2], DLANDP[2], u)], yaw: PI / 2, tilt: -3 * PI * u, roll: 0.5 * Math.sin(u * 9) };
    const a = t - DLAND; p.mouth = 'smile';   // crowd-surfing: the fans pass him along the row
    return { kind: 'C', p, C: [DLANDP[0] + 0.9 * a, DLANDP[1] + 0.1 * Math.sin(a * 9), DLANDP[2]], yaw: 0, tilt: -PI / 2, roll: 0.1 * Math.sin(a * 7) };
  }

  // locker room: Dave at the board, 20 teammates (12 on the benches, 8 standing behind)
  const STAND = [[-2.9, 2.6], [-2.2, 3.1], [-1.5, 2.6], [-0.8, 3.2], [1.3, 2.6], [2.0, 3.1], [2.7, 2.6], [3.3, 3.2]];   // a gap at x −0.4…1.0 for the planA camera
  const TEAM = Array.from({ length: 20 }, (_, i) => (i < 12 ? { x: -2.25 + (i % 6) * 0.9 + (i >= 6 ? 0.45 : 0), z: LD.benches[i < 6 ? 0 : 1], sit: true } : { x: STAND[i - 12][0], z: STAND[i - 12][1], sit: false }));
  const DAVB = [0.3, -1.25];
  function teamMan(t, i, m, cam) {
    const T = TEAM[i], p = basePose(); p.eyes = blink(t, i * 0.41);
    Object.assign(p, { x: T.x, z: T.z, rotY: PI + (m.s2 - 0.5) * 0.25, mouth: 'smile' });
    if (T.sit) Object.assign(p, { y: seatY(LD.seat), footFwd: 0.42 });
    if (cam === 'planA' || cam === 'planB') { const nod = Math.max(0, Math.sin((t - 10.5) * 9.5)) * K(t, [[10.5, 0], [10.7, 1]]); p.headPitch = 0.05 + 0.32 * nod; p.armA = A(-0.6, 0.1, -1.0, 0.4); p.armB = A(-0.6, 0.1, -1.0, -0.4); }
    if (cam === 'planC') { const ch = K(t, [[BONK + 0.25, 0], [BONK + 0.5, 1]]); p.armA = mixArm(A(-0.6, 0.1, -1.0, 0.4), UP_A, ch); p.armB = mixArm(A(-0.6, 0.1, -1.0, -0.4), UP_B, ch); p.mouth = ch > 0 ? 'o' : 'smile'; }
    if (cam === 'support') {   // a circle of chairs, everyone in a cast + a sling; they facepalm in sync when Dave faceplants
      if (i < CIRCLE.length) { const [cx, cz] = CIRCLE[i]; Object.assign(p, { x: cx, z: cz, rotY: toward(cx, cz, DSUP[0], DSUP[1]), y: seatY(0.475), footFwd: 0.42 }); } else p.visible = false;
      p.armB = SLING_B; p.armA = A(-0.6, 0.1, -1.0, 0.4); p.mouth = 'flat';
      const fp = K(t, [[PLANT + 0.1 + m.seed * 0.12, 0], [PLANT + 0.3 + m.seed * 0.12, 1]]); if (fp > 0) { p.armA = mixArm(p.armA, PALM_A, fp); p.headPitch = 0.25 * fp; }
    }
    return p;
  }
  function davePlan(t, cam) {
    const p = basePose(); p.eyes = blink(t, 2);
    if (cam === 'planA' || cam === 'planB') {
      const write = t < 10.6;
      Object.assign(p, { x: 1.1, z: -1.5, rotY: write ? -2.3 : -0.5, mouth: write ? 'flat' : 'smile', headPitch: -0.05 });
      p.armA = write ? A(-1.75 + 0.15 * Math.sin(t * 13), 0.3 + 0.12 * Math.sin(t * 7), -0.5, 0.3) : A(-1.5, 0.9, -0.2, 0.2);
      p.armB = A(-0.2, 0.15, -0.6, -0.3);
      return { kind: 'P', p };
    }
    // planC: he slaps the board (it spins past his nose), leans in to look, and the top edge comes round into his face
    if (t < BONK) { const lean = K(t, [[12.22, 0], [BONK, 1]]); Object.assign(p, { x: 0.55, z: lerp(-1.12, -1.2, lean), rotY: PI, mouth: 'o', lean: 0.15 * lean, headPitch: -0.05 }); const sl = pulse(t, SLAP - 0.2, SLAP + 0.15, 0.12); p.armB = mixArm(A(-1.2, 0.4, -0.9, -0.2), A(-1.65, 0.25, -0.15, -0.2), sl); p.armA = A(-0.3, 0.3, -0.6, 0.3); return { kind: 'P', p }; }
    // …and it launches him: up into the ceiling (BONK + 0.3), then flat on the floor (BONK + 0.75)
    const a = t - BONK, dn = clamp((a - 0.3) / 0.45), b = Math.max(0, a - 0.75);
    const y = a < 0.3 ? lerp(HC, 2.55, 1 - (1 - a / 0.3) ** 2) : lerp(2.55, 0.17, dn * dn) + 0.2 * Math.exp(-b * 8) * Math.abs(Math.sin(b * 14));
    p.mouth = 'o'; p.eyes = a > 0.75 ? 'closed' : 'open'; p.armA = STAR_A; p.armB = STAR_B;
    return { kind: 'C', p, C: [0.55, y, lerp(-1.2, -0.55, ease(a / 0.75))], yaw: PI, tilt: a < 0.75 ? -(2 * PI + PI / 2) * ease(a / 0.75) : -PI / 2 };
  }
  const HIT_A = 4 * PI + 1.27;   // the board's top edge reaches Dave's face after two full turns + 1.27 rad (a propeller)
  const boardRot = (t) => (t < SLAP ? 0 : t < BONK ? HIT_A * ((t - SLAP) / (BONK - SLAP)) : HIT_A + 6 * PI * (1 - Math.exp(-(t - BONK) * 2.2)));   // keeps spinning after the hit
  // +1 year: the support group — Dave demonstrates the leg grab one more time
  const DSUP = [0.95, 0.6], DSUP_YAW = 0, DFWD = [Math.sin(DSUP_YAW), Math.cos(DSUP_YAW)];   // the middle of the circle, facing the lens
  const CIRCLE = Array.from({ length: 11 }, (_, k) => { const a = ((55 + (250 * k) / 10) * PI) / 180; return [DSUP[0] + 1.5 * Math.sin(a), DSUP[1] - 0.05 + 1.5 * Math.cos(a)]; });   // a gap toward the camera
  function daveSupport(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    Object.assign(p, { x: DSUP[0], z: DSUP[1], rotY: DSUP_YAW, mouth: Math.sin(t * 9) > 0 ? 'o' : 'smile' });
    const mime = K(t, [[57.4, 0], [57.7, 1]]), w = mime * (0.5 + 0.5 * Math.sin(t * 4));
    p.armA = mixArm(A(-0.9, 0.4, -0.9, 0.4), HUG_A, w); p.armB = mixArm(A(-0.9, 0.4, -0.9, -0.4), HUG_B, w); p.crouch = 0.12 * w;
    if (t < DIVE) return { kind: 'P', p };
    const u = clamp((t - DIVE) / (PLANT - DIVE)); p.armA = HUG_A; p.armB = HUG_B; p.mouth = 'o';
    if (u < 1) return { kind: 'C', p, C: [DSUP[0] + DFWD[0] * 0.75 * u, lerp(HC, 0.2, u) + 0.35 * Math.sin(PI * u), DSUP[1] + DFWD[1] * 0.75 * u], yaw: DSUP_YAW, tilt: (PI / 2) * ease(u) };
    p.eyes = 'closed'; p.armA = mixArm(HUG_A, A(1.4, 0.2, -0.2), K(t, [[60.15, 0], [60.35, 1]]));   // face down; one hand up: he still had him
    return { kind: 'C', p, C: [DSUP[0] + DFWD[0] * 0.75, 0.17, DSUP[1] + DFWD[1] * 0.75], yaw: DSUP_YAW, tilt: PI / 2 };
  }

  // +1 day: the press briefing — a press corps in casts + slings, every hand up; Steve eats
  const SEATS = []; PD.rows.forEach((z) => PD.seats.forEach((x) => SEATS.push([x, z])));
  function pressMan(t, i, m) {
    const [x, z] = SEATS[i], p = basePose(); p.eyes = blink(t, i * 0.33);
    Object.assign(p, { x, z, rotY: PI, mouth: 'smile', headPitch: -0.05, y: seatY(0.48), footFwd: 0.42 });
    const hand = K(t, [[51.0 + m.seed * 0.3, 0], [51.25 + m.seed * 0.3, 1]]);
    p.armB = SLING_B; p.armA = mixArm(A(-0.6, 0.1, -1.0, 0.4), A(-2.7, 0.3, -0.25 - 0.2 * Math.sin(t * 7 + i)), hand); if (hand > 0) p.mouth = 'o';
    return p;
  }
  function stevePress(t) {
    const p = gpose(); steve.stand(p); Object.assign(p, { x: PD.speaker[0], z: PD.speaker[1] - 0.05, y: 0.25, rotY: 0, lids: 0.45 });
    let e = 0.5; for (const b of [49.6, 50.7, 51.8]) e = Math.max(e, pulse(t, b - 0.3, b + 0.25, 0.2));
    steve.eat(p, e, -1); p.jaw = 0.08 + 0.08 * Math.max(0, Math.sin(t * 9));
    return p;
  }
  // +1 week: the campaign walks down Main St (street-local): Steve knuckle-walks at the camera, two sign-holders, a cheering curb
  const CAMPZ = -1.3, campX = (t) => lerp(7.6, 2.4, ease((t - 52.6) / 3.0));
  function steveCamp(t) {
    const p = gpose(), x = campX(t);
    steve.knuckle(p, 7.6 - x, t < 55.5 ? 0.9 : 0); Object.assign(p, { x, z: CAMPZ, y: SIDEWALK_H, rotY: -PI / 2, lids: 0.35 });
    const st = K(t, [[55.6, 0], [55.95, 1]]);
    if (st > 0) { p.lean = lerp(0.82, 0.12, st); p.hipY = lerp(steve.HIP - 0.04, steve.HIP, st); p.armA = mixArm(p.armA, A(-0.1, 0.2, -0.3), st); p.armB = mixArm(p.armB, A(-2.6 + 0.25 * Math.sin(t * 9), 0.55, -0.35), st); p.headPitch = 0; p.mouth = 'smile'; p.lids = 0.2; }
    return p;
  }
  const CAMPERS = [[0.7, -0.45], [0.7, -2.2], ...Array.from({ length: 6 }, (_, k) => [null, 1.0 + k * 1.15])];
  function camper(t, k, m) {
    const p = basePose(); p.eyes = blink(t, k); const [dx, zz] = CAMPERS[k];
    if (dx !== null) { const x = campX(t) + dx; Object.assign(p, { x, z: zz, y: SIDEWALK_H, floor: SIDEWALK_H, rotY: -PI / 2, dist: 7.6 - x, speed: t < 55.5 ? 0.6 : 0, mouth: 'smile' }); }
    else Object.assign(p, { x: zz, z: -0.2, y: SIDEWALK_H, floor: SIDEWALK_H, rotY: PI - 0.5, mouth: shout(t, m.seed, 8) });
    const b = dx === null ? Math.max(0, Math.sin(t * 8 + m.seed * 6)) : 0; p.y += 0.08 * b; p.floor += 0.08 * b;
    p.armA = SLING_A; p.armB = A(-2.6, 0.35, -0.5, -0.2);
    return p;
  }

  // bench: Dave (arm in a sling) + Steve at sunset, sharing a banana
  function steveBench(t) {
    const p = gpose(); steve.sit(p); Object.assign(p, { x: BENCH[0] + 0.5, z: BENCH[1] + 0.02, y: 0, rotY: -0.18, hipY: 0.475 + 0.28, footFwd: 0.32, splay: 0.3, lids: 0.45, headYaw: -0.25 });
    let e = 0.45; for (const b of [62.4, 63.4, 64.6, 66.0]) e = Math.max(e, pulse(t, b - 0.3, b + 0.25, 0.2));
    steve.eat(p, e, -1); p.jaw = 0.06 + 0.06 * Math.max(0, Math.sin(t * 8));
    const give = pulse(t, GIVE - 0.45, GIVE + 0.35, 0.25); if (give > 0) { p.armB = A(-1.1, 0.75, -0.6, -0.4); p.headYaw = -0.5; }
    if (t > 64.0) { p.headYaw = lerp(-0.25, -0.05, K(t, [[64, 0], [64.6, 1]])); p.mouth = 'smile'; p.lids = 0.3; }
    return p;
  }
  function daveBench(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'smile';
    Object.assign(p, { x: BENCH[0] - 0.6, z: BENCH[1] - 0.02, rotY: 0.32, y: seatY(0.475), footFwd: 0.42, lean: 0.05, headYaw: 0.35 });
    p.armA = SLING_A; p.armB = A(-0.75, 0.12, -1.0, -0.45);
    const take = K(t, [[GIVE - 0.2, 0], [GIVE + 0.1, 1]]);
    let e = 0; for (const b of [62.6, 63.6, 65.0]) e = Math.max(e, pulse(t, b - 0.25, b + 0.2, 0.15));
    if (take > 0) p.armB = mixArm(A(-0.95, 0.5, -0.7, -0.4), A(-1.25, 0.05, -2.3, -0.7), e);
    const lean = K(t, [[64.2, 0], [64.9, 1]]); if (lean > 0) { p.headRoll = -0.28 * lean; p.headYaw = lerp(0.35, 0.15, lean); p.eyes = lean > 0.8 ? 'closed' : p.eyes; }
    return p;
  }

  // ---------------------------------------------------------------- per-frame
  let cur = null, bannerKey = 'TEAM 100';
  function update(t) {
    const shot = shotAt(t), S = shot.set, cam = shot.cam;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'stad' ? 0.08 : 0.03; studio.fill.intensity = S === 'stad' ? 0.7 : 0.5;
    const man1 = cam === 'charge' || cam.startsWith('throw');   // the Dave rig plays man #1 here: black hair, darker skin, no headband
    dave.mats.hair.color.setHex(man1 ? 0x1a1a1a : 0x7a3a22); dave.mats.skin.color.setHex(man1 ? 0x9a6447 : 0xf1c3a1); dave.mats.faceSkin.color.setHex(man1 ? 0x9a6447 : 0xf1c3a1);
    dave.root.visible = false; steve.g.visible = false; ballG.visible = false; peel.g.visible = false; banana.g.visible = false; kBanana.g.visible = false;
    shock.visible = false; flyBand.visible = false; band.visible = !man1; casts.forEach((m) => (m.visible = false)); castN = 0; signs.forEach((s) => (s.visible = false)); daveCast.visible = false;
    puffN = 0; sparkN = 0; starN = 0; dizN = 0; puffs.hide(); cloudPool.hide(); sparks.hide(); stars.forEach((s) => (s.visible = false)); dizzies.forEach((s) => (s.visible = false));
    confN = 0; balloons.count = 0; lock.board.visible = true;
    crowd.begin();
    let jolt = 0, camOverride = null;
    const J = (t0, a, k = 7) => { if (t > t0 && t < t0 + 0.6) jolt = Math.max(jolt, a * Math.exp(-(t - t0) * k)); };

    if (S === 'stad') {
      // the fans: on their feet, a jump wave on every big moment
      const big = [WAVE, SPLAT, HIT, BLAST, LAUNCH + 0.3], hype = cam === 'open' ? 0.35 : 0.6;
      stad.updateFans(t, (f) => { if (f.field) return { y: -60 }; let jy = 0; for (const b of big) { const a = t - b - f.seed * 0.25; if (a > 0 && a < 0.7) jy = Math.max(jy, 0.5 * Math.sin((PI * a) / 0.7)); } if (t > DLAND - 0.1 && Math.hypot(f.x - DLANDP[0], f.z - DLANDP[2]) < 9) { const a = t - DLAND - f.seed * 0.15; jy = Math.max(jy, a > 0 ? 0.45 * Math.abs(Math.sin(a * 7)) : 0); return { y: jy, arms: 1, sway: 0.1 * Math.sin(t * 5 + f.seed * 9) }; }   // the section that catches Dave
        return { y: jy, arms: Math.max(hype * (0.5 + 0.5 * Math.sin(t * 3 + f.seed * 9)), jy > 0 ? 1 : 0), sway: 0.06 * Math.sin(t * 2.2 + f.seed * 7) }; });
      const menLeft = t < SPLAT ? 100 : t < HIT + 0.1 ? 99 : t < BLAST + 0.4 ? 89 : t < DROP0 ? 41 : t < LAUNCH + 1 ? 12 : t < DLAND ? 1 : 0;
      const strike = cam.startsWith('bowl') && t > HIT + 0.15;
      drawLed(menLeft, t > SPLAT, strike, cam === 'steve');
      // the −z rim screen sat right behind the HUD in the charge: hide both rim screens there
      jumbos.forEach((j) => (j.visible = !(cam === 'charge' || cam === 'throwA'))); drawJumbo(strike ? 'STRIKE!' : 'FIGHT\nNIGHT', strike ? '#ffd166' : '#e8742a');
      aimKey(cam === 'throwB' ? -42 : cam === 'hype' || cam === 'flinch' ? 2 : cam === 'open' ? -6 : cam === 'bowlB' ? SX + 9 : SX + 3, 0, cam === 'open' ? 22 : 12);
      if (cam !== 'throwB') gput('stad', steveAt(t, cam === 'bowlB' ? 'bowl' : cam));

      if (cam === 'open' || cam === 'hype' || cam === 'flinch') {
        MEN.forEach((m, i) => { if (cam === 'hype' && i < 4) return; man(i, 'stad', (r, key) => put(r, key, cam === 'flinch' ? flinchMan(t, i, m) : hypeMan(t, i, m))); });
        if (cam === 'hype') {
          [0, 1].forEach((j) => { const o = bumper(t, j); man(j, 'stad', (r, key) => putC(r, key, o.p, o.C, o.yaw, o.tilt)); const e = bumpEnd(j); dust(t, BUMP + 0.55, L('stad', e[0], 0.1, e[2]), 0.7, 5, 0.8); });
          [0, 1].forEach((k) => { man(DOMINO[k][2], 'stad', (r, key) => put(r, key, domino(t, k, MEN[DOMINO[k][2]]))); dust(t, BUMP + 0.6 + k * 0.13, L('stad', DOMINO[k][0], 0.1, DOMINO[k][1] - 0.8), 0.5, 4, 0.7); });
          impact(t, BUMP, L('stad', BUMPERS[0][0], 1.55, -0.52), 1.6); J(BUMP, 0.035, 8); dust(t, BUMP + 0.75, L('stad', DAV0[0] + 0.6, 0.1, DAV0[1]), 0.6, 5, 0.8);
          if (t > BUMP + 0.9) dizzy(t, L('stad', DAV0[0] + 0.9, 0.45, DAV0[1] - 0.3));
        }
        const kp = daveHype(t);
        if (cam === 'flinch') { const a = t - STEP; if (a > 0) { const k = ease(a / 0.35); kp.x += 1.7 * k + 0.25 * a; kp.y = 0; kp.floor = 0; kp.mouth = 'o'; kp.lean = -0.35 * k; kp.armA = mixArm(kp.armA, A(-2.6, 1.0, -0.4), k); kp.armB = mixArm(kp.armB, A(-2.6, 1.0, -0.4), k); }
          band.visible = a <= 0; if (a > 0 && a < 1.4) { flyBand.visible = true; flyBand.position.copy(L('stad', DAV0[0] + 2.2 * a, 1.75 + 2.2 * a - 1.6 * a * a, DAV0[1] - 0.4 * a)); flyBand.rotation.set(a * 9, a * 5, 0); } }   // the shockwave takes Dave's headband
        put(dave, 'stad', kp);
        if (cam === 'flinch') for (let k = 0; k < 7; k++) dust(t, STEP + k * 0.04, L('stad', 1.2 + 0.25 * k, 0.15, -4.5 + k * 1.5), 1.2, 5, 0.9);   // the wind wall
      }
      if (cam === 'steve') {
        peel.g.visible = true; peel.g.position.copy(L('stad', SX + 0.95, 0.03, -0.75)); peel.g.rotation.set(PI / 2, 0.6, 0);
        const wa = t - WAVE; if (wa > 0 && wa < 1.0) { shock.visible = true; shock.position.copy(L('stad', SX, 0.05, 0)); shock.scale.setScalar(0.5 + 14 * wa); ringMat.opacity = 0.9 * (1 - wa); }
        dust(t, WAVE, L('stad', SX, 0.1, 0), 2.2, 8, 1.1); J(WAVE, 0.035, 6); dust(t, UP + 0.35, L('stad', SX, 0.05, 0), 0.9, 5, 0.7);
      }
      if (cam === 'charge' || cam === 'throwA') {
        MEN.forEach((m, i) => { const o = chargeMan(t, i, m); man(i, 'stad', (r, key) => placeK(r, key, o)); if (m.seed < 0.1) dust(t, 18.75 + m.s2 * 1.2 + 0.25, L('stad', SX + 14.4 + Math.floor(i / 11) * 0.95 - runDist(18.75 + m.s2 * 1.2) - 1.5, 0.1, BLK[i][1] * 0.75), 0.6, 4, 0.8); });
        if (cam === 'charge') { for (let k = 0; k < 4; k++) dust(t, 18.4 + k * 0.5, L('stad', SX + 8.5 - 3.2 * k * 0.5, 0.1, (k - 1.5) * 1.8), 1.0, 5, 1.2); dust(t, GRAB + 0.1, L('stad', SX + 3.5, 0.1, 0), 1.6, 8, 1.0); impact(t, GRAB, L('stad', SX + 0.4, 0.6, 0.3), 0.7); J(GRAB, 0.012, 9); }
        const o = daveStad(t);
        if (o.kind === 'shin') { steve.g.updateMatrixWorld(true); const sh = steve.legs[0].knee.localToWorld(_w.set(0, -0.06, 0)).clone(); const wob = t > LIFT + 0.35 && t < FLING ? 0.5 * Math.sin(t * 30) : 0; putC(dave, 'stad', o.p, [sh.x - OFF.stad[0] + 0.26, sh.y - 0.05, sh.z - OFF.stad[2] + 0.1], -PI / 2, 0.1, wob, 0.55); }   // clinging like a koala, flapping like a flag
        else placeK(dave, 'stad', o);
        if (cam === 'throwA') { J(FLING, 0.015, 9); dust(t, FLING, L('stad', SX + 0.4, 0.4, -0.2), 0.8, 6, 0.8); }
      }
      if (cam === 'throwB') {
        placeK(dave, 'stad', daveStad(t));
        impact(t, SPLAT, L('stad', SCREEN[0] + 0.35, SCREEN[1] + 0.2, SCREEN[2] - 0.9), 1.1, puffCol); spark(t, SPLAT, L('stad', SCREEN[0] + 0.3, SCREEN[1], SCREEN[2]), 2.0); spark(t, SPLAT + 0.12, L('stad', SCREEN[0] + 0.3, SCREEN[1] - 0.6, SCREEN[2] + 0.7), 1.5);
        J(SPLAT, 0.05, 6); dust(t, SLIDE + 0.62, L('stad', SCREEN[0] + 0.5, 2.05, SCREEN[2]), 0.8, 5, 0.8, puffCol);
        if (t > SLIDE + 0.62) dizzy(t, headTop(dave));
      }
      if (cam.startsWith('bowl')) {
        for (let w = 0; w < 18; w++) {   // the watchers line the lane
          const i = 2 + w, m = MEN[i], side = w % 2 ? 1 : -1, x = SX + 5 + Math.floor(w / 2) * 0.95, z = side * (2.5 + m.seed * 0.5);
          if (cam === 'bowlB' && side > 0 && x > SX + 6) continue;   // keep the near line out of the pins' close-up
          man(i, 'stad', (r, key) => { const p = basePose(); p.eyes = blink(t, i); const sh = K(t, [[HIT + 0.05 + m.seed * 0.1, 0], [HIT + 0.25 + m.seed * 0.1, 1]]); Object.assign(p, { x, z, rotY: toward(x, z, x - 1.5, 0), mouth: sh > 0 ? 'o' : 'smile' }); p.armA = mixArm(A(-0.6, 0.15, -1.1, 0.4), HEAD_A, sh); p.armB = mixArm(A(-0.6, 0.15, -1.1, -0.4), HEAD_B, sh); put(r, key, p); });
        }
        PINS.forEach((_, k) => { const o = pinPose(t, k, MEN[PIN_I(k)]); man(PIN_I(k), 'stad', (r, key) => placeK(r, key, o)); if (o.land) dust(t, o.land[2], L('stad', o.land[0], 0.1, o.land[1]), 0.7, 4, 0.8); });
        man(BALL_I, 'stad', (r, key) => ballMan(t, r, key));
        impact(t, HIT, L('stad', SX + 9.6, 1.0, 0), 1.6); J(HIT, 0.03, 7); dust(t, REL, L('stad', REL_POS[0], 0.1, REL_POS[2]), 0.6, 4, 0.7); dust(t, PICK, L('stad', SX + 1.0, 0.6, 0.8), 0.6, 5, 0.6, puffCol);
        if (t > HIT + 1.3) dizzy(t, L('stad', BALL_STOP - 1.2, 1.0, 0));
      }
      if (cam === 'ring') {
        for (let i = 0; i < 89; i++) { const o = ringMan(t, i, MEN[i]); man(i, 'stad', (r, key) => placeK(r, key, o)); }
        const ba = t - BLAST; if (ba > 0 && ba < 0.9) { shock.visible = true; shock.position.copy(L('stad', SX, 0.06, 0)); shock.scale.setScalar(1 + 12 * ba); ringMat.opacity = 0.9 * (1 - ba / 0.9); }
        dust(t, BLAST, L('stad', SX, 0.1, 0), 3.0, 10, 1.3); J(BLAST, 0.05, 6);
        if (t > SPIN && t < BLAST + 1.2) dust(t, SPIN + Math.floor((t - SPIN) / 0.3) * 0.3, L('stad', SX, 0.1, 0), 1.2, 6, 0.6);
      }
      if (cam === 'tire') {
        banana.g.visible = true; banana.setPeel(1); banana.setBite(clamp((t - 36.0) / 4.0) * 0.8 + 0.1);
        for (let k = 0; k < NRUN; k++) { const o = tireMan(t, k, MEN[k]); if (k === LASTI) placeK(dave, 'stad', o); else man(k, 'stad', (r, key) => placeK(r, key, o)); if (o.flop) dust(t, o.flop, L('stad', o.pos[0], 0.1, o.pos[1]), 0.5, 4, 0.7); }   // runner 40 = Dave
      }
      if (cam === 'pile' || cam === 'lastA' || cam === 'lastB') {
        for (let k = 0; k < NDROP; k++) { const o = tireMan(41.5, k, MEN[k]); man(k, 'stad', (r, key) => placeK(r, key, o)); }   // the 29 from the laps still lie where they dropped
        for (let j = 0; j < 11; j++) { const o = pileMan(t, j, MEN[NDROP + j]); man(NDROP + j, 'stad', (r, key) => placeK(r, key, o)); if (o.land) { dust(t, o.land[2], L('stad', o.land[0], 0.1, o.land[1]), 0.8, 5, 0.9); if (cam === 'lastA' && j < 6) dizzy(t, L('stad', o.land[0], 0.4, o.land[1])); } }
        placeK(dave, 'stad', daveLast(t));
        if (cam === 'pile') { fightCloud(t); STAR_T.forEach((tk, k) => impact(t, tk, L('stad', PC[0] + 1.05 * Math.cos(k * 2.4), PC[1] + 0.9 * Math.sin(k * 1.7), PC[2] + 1.05 * Math.sin(k * 2.4) + 0.4), 0.7, cloudCol)); if (t > CLOUD0 && t < LAUNCH) J(CLOUD0 + Math.floor((t - CLOUD0) / 0.15) * 0.15, 0.008, 12); } else cloudPool.hide();
        J(LAUNCH, 0.05, 6); dust(t, LAUNCH, L('stad', SX, 0.1, 0), 2.2, 9, 1.2); dust(t, JUMP0 + 0.6, L('stad', SX, 0.1, 0), 1.4, 6, 0.9);
        if (cam === 'lastA') {
          kBanana.g.visible = t < TAKE; kBanana.setPeel(0); kBanana.setBite(0);
          banana.g.visible = t >= TAKE; banana.setPeel(0); banana.setBite(0);
          impact(t, FLICK, L('stad', DOFF[0] + 0.1, 1.45, DOFF[1]), 0.9, puffCol); J(FLICK, 0.02, 8);
        }
        if (cam === 'lastB') {
          banana.g.visible = true; banana.setPeel(1); banana.setBite(clamp((t - 47.3) / 1.6) * 0.6);
          impact(t, DLAND, L('stad', DLANDP[0], DLANDP[1], DLANDP[2] + 1.0), 8.0, puffCol); burst(t, DLAND, L('stad', DLANDP[0], DLANDP[1], DLANDP[2] + 1.0), 200, 7, null, 5.0);
        }
      }
    } else if (S === 'lock') {
      const bText = cam === 'support' ? 'SUPPORT GROUP' : 'TEAM 100'; if (bText !== bannerKey) { lock.setBanner(bText); bannerKey = bText; }
      if (cam.startsWith('plan')) {
        benchMeshes.forEach((o) => (o.visible = true)); chairs.forEach((c) => (c.visible = false));
        drawBoard(clamp(Math.floor((t - 8.35) / 0.42) + 1, 0, 5), clamp((t - 10.0) / 0.5));
        lock.board.rotation.x = cam === 'planC' ? boardRot(t) : 0;
        TEAM.forEach((_, i) => man(i, 'lock', (r, key) => put(r, key, teamMan(t, i, MEN[i], cam))));
        placeK(dave, 'lock', davePlan(t, cam));
        if (cam === 'planC') { impact(t, BONK, L('lock', 0.55, 1.55, -1.25), 0.8, puffCol); impact(t, BONK + 0.3, L('lock', 0.55, 2.9, -0.95), 1.0, puffCol); J(BONK, 0.025, 8); J(BONK + 0.3, 0.03, 8); J(BONK + 0.75, 0.025, 8); if (t > BONK + 0.8) dizzy(t, headTop(dave)); dust(t, BONK + 0.75, L('lock', 0.55, 0.05, -0.55), 0.7, 5, 0.8, puffCol); }
      } else {   // +1 year: the support group
        drawBoard(6, 0); lock.board.rotation.x = 0;
        benchMeshes.forEach((o) => (o.visible = false)); chairs.forEach((c, k) => { c.visible = true; c.position.set(CIRCLE[k][0], 0, CIRCLE[k][1]); c.rotation.y = toward(CIRCLE[k][0], CIRCLE[k][1], DSUP[0], DSUP[1]); });
        TEAM.forEach((_, i) => { if (i < CIRCLE.length) man(i, 'lock', (r, key) => { put(r, key, teamMan(t, i, MEN[i], cam)); castOn(r, 1); }); });
        placeK(dave, 'lock', daveSupport(t)); daveCast.visible = true;
        impact(t, PLANT, L('lock', DSUP[0] + DFWD[0] * 1.0, 0.3, DSUP[1] + DFWD[1] * 1.0), 0.9, puffCol); J(PLANT, 0.02, 8); dust(t, PLANT, L('lock', DSUP[0] + DFWD[0] * 0.75, 0.05, DSUP[1] + DFWD[1] * 0.75), 0.7, 5, 0.8, puffCol);
        if (t > PLANT + 0.15) dizzy(t, headTop(dave));
      }
    } else if (S === 'pod') {   // +1 day: the press briefing
      pod.setFlashes(t, 3.2);
      gput('pod', stevePress(t)); banana.g.visible = true; banana.setPeel(1); banana.setBite(0.15 + 0.6 * clamp((t - 49.0) / 3.6));
      SEATS.forEach((_, i) => man(i, 'pod', (r, key) => { put(r, key, pressMan(t, i, MEN[i])); castOn(r, 1); }));
    } else if (S === 'street') {   // +1 week: the campaign on Main St
      street.aimSun(4, -1.5, 9);
      gput('street', steveCamp(t));
      CAMPERS.forEach((_, k) => man(20 + k, 'street', (r, key) => {
        put(r, key, camper(t, k, MEN[20 + k])); castOn(r, -1);
        r.root.updateMatrixWorld(true); const h = r.arms.find((a) => a.s === 1).hand.localToWorld(_w.set(0, -0.05, 0)).clone(), sg = signs[k];
        sg.visible = true; sg.position.set(h.x, h.y + 0.38, h.z); sg.rotation.set(0, -PI / 2 + 0.15 * Math.sin(t * 6 + k), 0.1 * Math.sin(t * 5 + k));
      }));
      burst(t, CONF2, L('street', 3.4, 0.6, -0.3), 120, 4.0, { x: -0.3, z: -0.4 }); burst(t, CONF2 + 0.1, L('street', 3.4, 0.6, -2.8), 120, 4.0, { x: -0.3, z: 0.4 });
      J(CONF2, 0.012, 8); dust(t, 55.95, L('street', campX(56), SIDEWALK_H + 0.05, CAMPZ), 0.6, 4, 0.7, puffCol);
    } else if (S === 'burb') {   // +1 year: the bench
      const sunL = burb.lights.sun, hemi = burb.lights.hemi;
      burb.aimSun(BENCH[0], BENCH[1], 8); sunL.color.set(0xffb070); sunL.intensity = 2.3; hemi.color.set(0xffd8c0); hemi.intensity = 1.0;
      sunL.position.copy(sunL.target.position).add(_w.set(-40, 14, 30));
      gput('burb', steveBench(t)); banana.g.visible = true; banana.setPeel(1); banana.setBite(t < GIVE - 0.4 ? 0 : 0.45 + 0.4 * clamp((t - 62) / 5));
      put(dave, 'burb', daveBench(t)); daveCast.visible = true;
      kBanana.g.visible = t > GIVE; kBanana.setPeel(1); kBanana.setBite(0.45 + 0.4 * clamp((t - 62.4) / 3));
    }

    crowd.end(); conf.count = confN; conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true;

    // camera (local → world)
    const c = CAMS[cam], o = OFF[S];
    let P, Aim;
    if (camOverride) { P = camOverride.p; Aim = camOverride.a; }
    else if (c.fn) { const r = c.fn(t); P = r.p.map((v, i) => v + o[i]); Aim = r.a.map((v, i) => v + o[i]); }
    else {
      const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    }
    if (jolt) { P = [P[0] + jolt * Math.sin(t * 70), P[1] + jolt * Math.sin(t * 55), P[2]]; }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
