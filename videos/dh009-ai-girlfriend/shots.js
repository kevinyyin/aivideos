// VIDEO dh009 — "What if your AI girlfriend was real?"  (tone FUNNY, meme what-if). 69.6 s, 12 beats, 9 places.
// Greg's AI girlfriend (Penny, from the made-up app "baeta") steps out of his phone at 2:15 AM as a real toy-3D woman — and
// keeps behaving exactly like the app: an over-affirming whisper-ASMR voice into a fluffy binaural mic everywhere (the
// "mommy ASMR" meme, played as the cozy whisper parody — no "mommy", nothing suggestive), a bullet-point list for every
// question, "As an AI, I can't help with that", confident hallucinations (a 300th birthday on February 30th), AI hands, a
// free trial that ends mid-hug (paywall + the default T-pose), an overnight update that puts her in every room, a global
// server outage (every AI partner on Earth freezes with a spinner), a memory reset after three years, and a generated
// breakup summary with citations — she leaves him for the smart fridge. The joke is on the apps and on Greg, never on women:
// AI partners of every gender freeze in the outage, and everything Penny does is an app behaviour, not a "girlfriend" trope.
// Cartoon only: soot faces, paper piles, a crowd-surf; nobody is hurt.
//
// Real numbers on screen (HUD stat line, one per beat; sources also in caption.md):
//  · AI companion apps: 220 million downloads worldwide, as of July 2025 — Appfigures via TechCrunch, Aug 12 2025
//    https://techcrunch.com/2025/08/12/ai-companion-apps-on-track-to-pull-in-120m-in-2025
//  · Romantic/NSFW AI companion apps: $162.8 million consumer spending in H1 2026 (gross, app stores only) — Appfigures via
//    Decrypt, Jul 13 2026  https://decrypt.co/373395
//  · 33 % of Gen Z singles have engaged with AI as a romantic companion (16 % of all US singles) — Match × Kinsey Institute,
//    Singles in America 2025 (Jun 2025), reported by Axios Jul 2025
//    https://www.axios.com/local/washington-dc/2025/07/18/dc-singles-ai-romantic-partner-loneliness
// Meme context (not on screen): Know Your Meme "AI Girlfriends / AI Companionship"; companion-app updates that change a
// partner's personality are a documented user complaint (OECD AI incident 2023-02-13, Harvard Gazette Sep 2026).
// "baeta" and "Penny" were web-checked: no AI companion app by that name (Oct 30 2026). No real app, brand or company on screen.
//
// Shot list (seconds)                                   | set     | what happens
//  0.0– 4.6  couch   DAY 1 · 2:14 AM (title over it)      | living  | Greg on the sofa in the phone glow, sighing at his AI girlfriend app
//  4.6– 6.6  chat    POV                                  | living  | "proud of you for opening the app 🥺" / "i wish you were real" / "Updating…"
//  6.6–11.8  pop                                          | living  | the phone flares, Penny POPS out of the screen (music enters), lands, whispers
//                                                         |         | "hiii… did you drink your water today? 🥺" to us; Greg flips over the sofa
// 11.8–17.0  dinner  DAY 2                                | kitchen | "What's for dinner?" → "Great question!" → a list that prints to the floor
//                                                         |         | and buries him
// 17.0–22.0  carry   DAY 3                                | market  | "Can you carry one?" → "As an AI, I can't help with that." → the box tower
//                                                         |         | topples, Greg goes flat
// 22.0–27.4  job     DAY 5                                | office  | she whispers "you're doing so well…" behind him; the interviewer gets the
//                                                         |         | tingles, falls asleep and slides under the desk (Zzz)
// 27.4–33.0  bday    DAY 6                                | suburb  | Mom's birthday, banner "HAPPY 300th · FEB 30", 300 candles → WHOOMPH, soot
// 33.0–38.4  date    DAY 7                                | bistro  | her hand on the table grows fingers (5 → 11); the waiter drops his tray
// 38.4–40.6  kissA   DAY 8                                | stadium | the KISS CAM finds them on the LED wall
// 40.6–44.6  kissB                                        | stadium | mid-hug: FREE TRIAL ENDED paywall, she snaps into a T-pose, Greg is flung
//                                                         |         | onto the crowd and surfs away (HUD $0 → $19.99)
// 44.6–49.8  update  DAY 9                                | living  | "Updated to v4.0" → 11 more Pennys pop up around the room, all whisper
//                                                         |         | "good morning…" and toss him water bottles (an avalanche)
// 49.8–53.2  outage  +1 YEAR                              | street  | every AI partner on the sidewalk freezes (spinners); their humans get yanked
//                                                         |         | and fall flat in sync
// 53.2–54.7  pressA                                       | podium  | "We are aware of an issue." — the spokesperson freezes too (spinner)
// 54.7–55.4  pressB                                       | podium  | reverse from the stage corner: ten reporters recoil, mouths open (flashes)
// 55.4–60.4  reset   +3 YEARS                             | kitchen | the anniversary cake; she reboots: "Hi! I'm Penny. How can I help you today?"
//                                                         |         | — the cake splats on the floor
// 60.4–65.4  fridge                                       | kitchen | her summary of why this isn't working (with citations); she walks out with
//                                                         |         | the smart fridge; the toaster pops two hearts at Greg. Fade 64.8, card 65.4
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, HIP_H } from '@engine/rig.js';
import { makePhone, makeSpeechBubble, makeFluffyMic, makeHeadset, makeMovingBox } from '@engine/props.js';
import { makeSpritePool } from '@engine/sets/tech.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';
import { buildOffice } from '@engine/sets/office.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { buildRestaurant } from '@engine/sets/restaurant.js';
import { buildStadium } from '@engine/sets/stadium.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildPodium } from '@engine/sets/podium.js';

const PI = Math.PI;
const OFF = { street: [0, 0, 0], liv: [1500, 0, 0], kit: [-1500, 0, 0], sup: [3000, 0, 0], off: [-3000, 0, 0], burb: [4500, 0, 0],
  rest: [-4500, 0, 0], stad: [6000, 0, 0], pod: [-6000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 4.6, cam: 'couch', set: 'liv' },
  { t0: 4.6, t1: 6.6, cam: 'chat', set: 'liv' },
  { t0: 6.6, t1: 11.8, cam: 'pop', set: 'liv' },
  { t0: 11.8, t1: 17.0, cam: 'dinner', set: 'kit' },
  { t0: 17.0, t1: 22.0, cam: 'carry', set: 'sup' },
  { t0: 22.0, t1: 24.8, cam: 'jobA', set: 'off' },
  { t0: 24.8, t1: 27.4, cam: 'jobB', set: 'off' },
  { t0: 27.4, t1: 33.0, cam: 'bday', set: 'burb' },
  { t0: 33.0, t1: 35.3, cam: 'dateA', set: 'rest' },
  { t0: 35.3, t1: 38.4, cam: 'dateB', set: 'rest' },
  { t0: 38.4, t1: 40.6, cam: 'kissA', set: 'stad' },
  { t0: 40.6, t1: 44.6, cam: 'kissB', set: 'stad' },
  { t0: 44.6, t1: 49.8, cam: 'update', set: 'liv' },
  { t0: 49.8, t1: 53.2, cam: 'outage', set: 'street' },
  { t0: 53.2, t1: 54.7, cam: 'pressA', set: 'pod' },
  { t0: 54.7, t1: 55.4, cam: 'pressB', set: 'pod' },
  { t0: 55.4, t1: 60.4, cam: 'reset', set: 'kit' },
  { t0: 60.4, t1: 69.6, cam: 'fridge', set: 'kit' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- shared choreography numbers (make_cues.py mirrors these)
export const TIMES = {
  SIGH: 1.6, MSG: 5.15, UPD: 5.75, GLOW: 6.75, POP: 7.1, LAND: 7.55, WH1: 8.45, FLIP: 10.45,
  Q1: 12.0, GQ: 13.15, CARD: 13.4, PRINT: 13.8, BURY: 16.1,
  Q2: 17.3, NOPE: 18.5, TOPPLE: 20.35, FLAT: 20.85,
  WH2: 22.6, SLEEP: 24.9, DROP: 25.3, ROLL: 26.3,
  WH3: 28.0, LIGHT: 30.0, WHOOMPH: 31.0,
  HAND: 33.8, F6: 35.6, F7: 35.95, F8: 36.25, F9: 36.5, F10: 36.7, F11: 36.9, TRAY: 37.5,
  FIND: 38.5, HUG: 41.05, PAY: 41.45, FLING: 41.6, CATCH: 42.45, PAID: 43.0, UNFREEZE: 43.2,
  V4: 44.8, CLONE0: 45.5, WH4: 47.0, TOSS: 48.45,
  OUT: 50.55, YANK: 50.85,
  ISSUE: 53.35, PFREEZE: 54.25,
  BOOT: 56.7, WH5: 57.0, CAKE: 59.0, SPLAT: 59.38,
  SUM: 60.6, FWALK: 62.1, GRAB: 63.0, TOAST: 64.1,
};
const T = TIMES;
const FINGERS = [T.F6, T.F7, T.F8, T.F9, T.F10, T.F11];
const CLONE_T = Array.from({ length: 11 }, (_, i) => T.CLONE0 + i * 0.13);

// set-local positions
const SOFA = { x: 1.2, z: -2.12 };          // Greg's seat on the sofa (living room)
const PEN0 = { x: 1.75, z: -0.25 };           // where Penny lands (faces the camera)
const PHONE_SEAT = [1.2, 0.92, -1.86];      // the phone in Greg's hands when seated
const KG = { x: 0.7, z: 0.55 }, KP = { x: -0.25, z: 0.6 };   // kitchen: Greg + Penny by the table
const CARD_X = 0.62, CARD_Z = 0.3, CARD_TOP = 2.45, CARD_W = 0.95, CARD_H = 2.32;
const SG0 = -3.2, SG1 = -0.6;                // supermarket: Greg walks the middle aisle (x 0) toward the lens
const BDAY = { x: -2.2, z: -5.25 };          // suburb: the party table on lot 0's lawn
const CX = -24, CZ = 2.0;                    // stadium: where they stand in the field crowd
const FR = { x: -2.45, z: -2.2 };            // kitchen fridge
const DATE_X = 0, DATE_SEAT = 0.5;           // bistro table 0 + its chairs (pulled in to ±0.5 so both fit the frame)

// camera coords are LOCAL to the shot's set. p/a = [start, end]; fn(t) overrides.
export const CAMS = {
  couch:  { p: [[0.7, 1.18, 0.15], [0.85, 1.12, -0.35]], a: [[1.2, 1.0, -2.1], [1.2, 1.0, -2.1]], fov: 50, amp: 0.003 },
  chat:   { fn: null, fov: 40, amp: 0.0012 },
  pop:    { p: [[1.4, 1.6, 2.55], [1.38, 1.58, 2.3]], a: [[1.45, 1.62, -1.3], [1.45, 1.6, -1.3]], fov: 52, amp: 0.004 },
  dinner: { p: [[0.2, 1.62, 3.6], [0.2, 1.6, 3.4]], a: [[0.3, 1.78, 0.1], [0.3, 1.74, 0.1]], fov: 54, amp: 0.003 },
  carry:  { fn: (t) => { const z = lerp(SG0, SG1, K(t, [[17.0, 0], [20.2, 1]], (u) => u)); return { p: [0.0, 1.55, z + 3.2], a: [0.0, 1.85, z - 0.6] }; }, fov: 50, amp: 0.004 },
  jobA:   { p: [[0.6, 1.72, -2.3], [0.56, 1.7, -2.2]], a: [[-0.12, 1.55, 0.1], [-0.12, 1.53, 0.1]], fov: 50, amp: 0.003 },
  jobB:   { p: [[1.15, 1.5, 0.9], [1.05, 1.48, 0.8]], a: [[-0.15, 1.2, -1.4], [-0.15, 1.15, -1.4]], fov: 50, amp: 0.003 },
  bday:   { p: [[-2.2, 1.72, -0.35], [-2.2, 1.7, -0.6]], a: [[-2.2, 1.7, -5.6], [-2.2, 1.68, -5.6]], fov: 52, amp: 0.004 },
  dateA:  { p: [[0.05, 1.5, 2.9], [0.05, 1.46, 2.7]], a: [[0.05, 1.12, 0.15], [0.05, 1.1, 0.15]], fov: 50, amp: 0.003 },
  dateB:  { p: [[-0.15, 1.42, 1.45], [-0.08, 1.4, 1.32]], a: [[0.42, 1.3, 0.15], [0.42, 1.3, 0.15]], fov: 44, amp: 0.003 },
  kissA:  { p: [[CX + 6.3, 1.85, CZ + 0.35], [CX + 5.7, 1.85, CZ + 0.3]], a: [[-47, 7.4, 0.3], [-47, 7.4, 0.3]], fov: 50, amp: 0.006 },
  kissB:  { fn: (t) => { const up = K(t, [[T.CATCH - 0.1, 0], [T.CATCH + 0.7, 1]]), lift = K(t, [[T.FLING, 0], [T.FLING + 0.5, 1]]); return { p: [CX - 3.6, lerp(1.55, 1.85, Math.max(up, 0.5 * lift)), CZ + lerp(0.05, -0.3, up)], a: [lerp(CX, CX + 0.6, up), lerp(lerp(1.3, 1.62, lift), 1.72, up), CZ + lerp(0.05, -0.75, up)] }; }, fov: 52, amp: 0.005 },
  update: { p: [[2.6, 1.9, 2.1], [2.5, 1.88, 1.95]], a: [[-2.0, 1.05, -0.9], [-2.0, 1.05, -0.9]], fov: 58, amp: 0.004 },
  outage: { p: [[14.6, 1.9, -1.45], [14.3, 1.88, -1.45]], a: [[6.0, 1.3, -1.45], [6.0, 1.3, -1.45]], fov: 40, amp: 0.004 },
  pressA: { p: [[0.1, 2.05, 1.6], [0.1, 2.02, 1.35]], a: [[0.0, 1.85, -3.1], [0.0, 1.85, -3.1]], fov: 34, amp: 0.003 },
  pressB: { p: [[1.6, 2.3, -2.4], [1.5, 2.26, -2.3]], a: [[-1.5, 1.05, 2.0], [-1.5, 1.05, 2.0]], fov: 46, amp: 0.005 },
  reset:  { fn: (t) => { const d = K(t, [[T.CAKE, 0], [T.SPLAT + 0.1, 1]]); return { p: [0.25, 1.6, lerp(3.3, 3.1, clamp((t - 55.4) / 5))], a: [lerp(0.25, 0.5, d), lerp(1.72, 1.0, d), 0.3] }; }, fov: 52, amp: 0.003 },
  fridge: { fn: (t) => { const u = K(t, [[T.FWALK, 0], [T.GRAB + 0.3, 1], [T.TOAST - 0.4, 1], [T.TOAST + 0.1, 2]]), v = Math.min(u, 1), w = Math.max(0, u - 1);
    return { p: [lerp(lerp(0.25, 0.2, v), 0.3, w), 1.62, lerp(lerp(3.3, 3.6, v), 3.3, w)], a: [lerp(lerp(0.25, -1.1, v), 0.05, w), lerp(lerp(1.7, 1.4, v), 1.45, w), lerp(lerp(0.3, -0.4, v), -0.6, w)] }; }, fov: 54, amp: 0.003 },
};

// ---------------------------------------------------------------- arm library (tested presets from dh004 / 019 / dh001)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const HOLD_A = A(-1.15, 0.14, -1.55, 0.5), HOLD_B = A(-1.15, 0.14, -1.55, -0.5);   // phone in both hands, in front of the face
const READ_A = A(-0.9, 0.12, -1.25, 0.5), READ_B = A(-0.9, 0.12, -1.25, -0.5);     // forearms forward (table height)
const HEAD_A = A(-2.45, 1.2, -2.35, 0.5), HEAD_B = A(-2.45, 1.2, -2.35, -0.5);    // hands on the head
const UP_A = A(-2.75, 0.42, -0.3), UP_B = A(-2.75, 0.42, -0.3);                    // both arms up
const MIC_B = A(-0.75, 0.2, -1.6, -0.55);                                           // the mic hand, chest high (the fluff ends under the chin)
const MOUTH_B = A(-1.25, 0.05, -2.4, -0.7);
const HUG_A = A(0, 1.5, -1.45, 0.93), HUG_B = A(0, 1.2, -1.45, -0.93);             // dh001 two-person hug
const TPOSE = A(0, PI / 2, 0, 0), TPOSE_A = A(0, PI / 2, 0, 0);
const OFFER_B = A(-1.2, 0.2, -0.5, -0.2), OFFER_A = A(-1.2, 0.2, -0.5, 0.2);        // holding something out
const CARRY_A = A(-0.75, -0.05, -1.35, 0.6), CARRY_B = A(-0.6, 0.35, -1.5, -0.6);   // carrying a stack of boxes on his right side
const WIDE_A = A(-0.35, 1.25, -0.15), WIDE_B = A(-0.35, 1.25, -0.15);
const CAKE_A = A(-0.95, 0.18, -1.05, 0.55), CAKE_B = A(-0.95, 0.18, -1.05, -0.55);  // holding a cake in front
const WAVE_A = A(-0.5, 0.75, -2.0, -0.3);                                           // a 'hiii' wave, hand up by the face
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const seatY = (top) => -0.375 + (top - 0.42);
const pulse = (t, a, b, f = 0.15) => K(t, [[a, 0], [a + f, 1], [b - f, 1], [b, 0]]);
const boing = (t, t0, d = 0.32) => K(t, [[t0, 0], [t0 + d * 0.55, 1.18], [t0 + d * 0.8, 0.94], [t0 + d, 1]]);
const talk = (t, a, b, rate = 11) => (t > a && t < b && Math.sin(t * rate) > 0.1 ? 'o' : 'smile');

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a, 0x3a4a3a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  void story;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const liv = buildLivingRoom(studio, {}); liv.root.position.set(...OFF.liv);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit);
  const sup = buildSupermarket(studio, {}); sup.root.position.set(...OFF.sup); sup.setStock(1);
  const off = buildOffice(studio, {}); off.root.position.set(...OFF.off);
  const burb = buildSuburb(studio, { poleClear: [-2.2] }); burb.root.position.set(...OFF.burb);
  const rest = buildRestaurant(studio, {}); rest.root.position.set(...OFF.rest);
  const stad = buildStadium(studio, {}); stad.root.position.set(...OFF.stad);
  const pod = buildPodium(studio, {}); pod.root.position.set(...OFF.pod);
  const ROOTS = { street: street.root, liv: liv.root, kit: kit.root, sup: sup.root, off: off.root, burb: burb.root, rest: rest.root, stad: stad.root, pod: pod.root };
  const FOGS = { street: streetFog, liv: null, kit: null, sup: null, off: null, burb: burb.fog, rest: null, stad: stad.fog, pod: null };
  const FAR = { street: 400, liv: 40, kit: 40, sup: 60, off: 40, burb: 420, rest: 40, stad: 600, pod: 40 };
  const L = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  // ---------------------------------------------------------------- canvas helpers (measured text — dh004 QC)
  const font = (w, s) => `${w} ${s}px Helvetica, Arial, sans-serif`;
  const fitFont = (g, lines, maxW, w, s) => { g.font = font(w, s); const mw = Math.max(...lines.map((l) => g.measureText(l).width)); return mw > maxW ? Math.floor((s * maxW) / mw) : s; };
  const rr = (g, x, y, w, h, r, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  /** a camera-facing card sprite from a canvas; sized per frame like the speech bubbles */
  function card(w, h, draw) {
    const tex = canvasTex(w, h, draw);
    const material = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false, fog: false, color: 0xf2f2f2 });
    const sprite = new THREE.Sprite(material); sprite.center.set(0.5, 0); sprite.renderOrder = 11; sprite.visible = false; scene.add(sprite);
    const aspect = h / w;
    return { sprite, material, setPop(k) { sprite.scale.set(k, k * aspect, 1); sprite.visible = k > 0.001; } };
  }

  // ---------------------------------------------------------------- cast
  const person = (o) => { const p = makePerson(o); scene.add(p.root); return p; };
  const hood = (rig, c) => { rig.hood = mk(new THREE.TorusGeometry(0.115, 0.05, 8, 18), mat(c, 0.92), rig.spine, 0, 0.5, -0.1); rig.hood.rotation.x = PI / 2 - 0.5; rig.hood.scale.set(1.1, 1, 0.8); };
  const GREG = { skin: 0xeab894, hair: 0x3b2a1e, hairStyle: 'messy', top: 0x4f7f62, collar: 0x3f6a52, pants: 0x2c3140, shoes: 0xe8e4dc };
  const greg = person(GREG); hood(greg, 0x467458);
  const PEN = { skin: 0xf0c4a4, hair: 0xf49ac1, hairStyle: 'bob', top: 0xb9a2e8, collar: 0xf6f2fa, pants: 0x7894c4, shoes: 0xf4f4f6 };
  const mics = [];
  function makePenny(o = {}) {
    const r = person({ ...PEN, ...o }); hood(r, o.top ? o.top : 0xa892dc);
    const hs = makeHeadset({ glow: 0xff7fc0 }); r.head.g.add(hs.g); r.headset = hs;
    const mic = makeFluffyMic({ color: 0xf8d2e4, seed: mics.length + 3 }); scene.add(mic.g); mic.g.visible = false; r.mic = mic; mics.push(mic);
    return r;
  }
  const penny = makePenny();
  const clones = Array.from({ length: 11 }, () => makePenny());
  const mom = person({ skin: 0xeab894, top: 0xe8735a, collar: 0xf6efe4, pants: 0x4a4a5a, hair: 0x6a4a3a, hairStyle: 'bob', glasses: true });
  const dad = person({ skin: 0xeab894, top: 0x3d7bd9, collar: 0xf4f4f2, pants: 0x6b5a48, hair: 0x8a7a6a, hairStyle: 'none', mustache: 0x8a7a6a });
  const aunt = person({ skin: 0xd9a37f, top: 0x6fa84f, pants: 0x34405c, hair: 0x2a1d16, hairStyle: 'bob' });
  const boss = person({ skin: 0xd9a37f, top: 0x5d636f, collar: 0xf6f6f2, pants: 0x2a2c34, hair: 0x2a1d16, hairStyle: 'short', glasses: true, mustache: 0x2a1d16 });
  const waiter = person({ skin: 0xf0c8a8, top: 0xf4f4f2, collar: 0x1d1d22, pants: 0x1d1d22, hair: 0x2a1d16, hairStyle: 'short', mustache: 0x2a1d16 });
  const spox = person({ skin: 0xc98e6a, top: 0x2a3a5a, collar: 0xf6f6f2, pants: 0x2a3a5a, hair: 0x1a1a1a, hairStyle: 'bob' });
  const R = rng(41);
  const crowd = Array.from({ length: 16 }, (_, i) => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const o = { skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[i % TOPS.length], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.22, mustache: style !== 'bob' && R() < 0.25 ? HAIRS[Math.floor(R() * 3)] : null };
    const p = person(o); p.base = o; p.seed = R(); return p;
  });
  const outfit = (rig, top, pants) => { rig.mats.top.color.setHex(top); if (pants !== undefined) rig.mats.pants.color.setHex(pants); };
  const ALL = [greg, penny, ...clones, mom, dad, aunt, boss, waiter, spox, ...crowd];
  const SOOT = [greg, penny, mom, dad, aunt];
  const skinHome = new Map(ALL.map((r) => [r, [r.mats.faceSkin.color.getHex(), r.mats.skin.color.getHex()]]));

  // ---------------------------------------------------------------- app UI: the status pill, the spinner, speech bubbles, cards
  const uiReq = [];
  const frameW = (d) => 2 * d * Math.tan((studio.camera.fov * PI) / 360) * (9 / 16);
  const popK = (t, t0) => K(t, [[t0, 0], [t0 + 0.16, 1.15], [t0 + 0.28, 1]]);
  const show = (obj, pos, k, frac) => { if (k > 0.001) uiReq.push([obj, pos, k, frac]); };
  const pillTex = canvasTex(256, 72, (g, w, h) => { rr(g, 4, 4, w - 8, h - 8, 32, 'rgba(24,22,34,0.86)'); g.fillStyle = '#4fe08a'; g.beginPath(); g.arc(42, h / 2, 13, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.font = font('600', fitFont(g, ['online'], 150, '600', 40)); g.textBaseline = 'middle'; g.fillText('online', 68, h / 2 + 2); });
  const spinTex = canvasTex(128, 128, (g, w) => { for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2; g.fillStyle = `rgba(255,255,255,${0.15 + 0.85 * (i / 11)})`; g.save(); g.translate(w / 2, w / 2); g.rotate(a); g.beginPath(); g.roundRect(-7, -54, 14, 30, 7); g.fill(); g.restore(); } });
  const mkSprite = (tex, ar = 1) => { const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false, fog: false }); const s = new THREE.Sprite(m); s.center.set(0.5, 0); s.renderOrder = 12; s.visible = false; scene.add(s); return { sprite: s, material: m, setPop(k) { s.scale.set(k, k * ar, 1); s.visible = k > 0.001; } }; };
  const pills = Array.from({ length: 14 }, () => mkSprite(pillTex, 72 / 256));
  const spins = Array.from({ length: 10 }, () => mkSprite(spinTex, 1));
  const checkTex = canvasTex(128, 128, (g, w) => { g.fillStyle = '#4fe08a'; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(36, 66); g.lineTo(56, 86); g.lineTo(94, 44); g.stroke(); void w; });
  const check = mkSprite(checkTex, 1);
  let pillN = 0, spinN = 0;
  const pillAt = (pos, frac = 0.16) => { if (pillN < pills.length) show(pills[pillN++], pos, 1, frac); };
  const spinAt = (pos, t, frac = 0.1) => { if (spinN < spins.length) { const s = spins[spinN++]; s.material.rotation = -Math.floor(t * 12) * (PI / 6); show(s, pos, 1, frac); } };

  const PINK = '#e8559a', BLUE = '#3d7bd9', GRAY = '#6a6f7a';
  const B = (lines, accent, o = {}) => { const b = makeSpeechBubble({ lines, accent, maxChars: o.maxChars ?? 18, soft: o.soft ?? true, tail: o.tail, offX: o.offX ?? 0 }); scene.add(b.sprite); b.setPop(0); return b; };
  const BUB = {
    hi: B(['hiii… did you drink', 'your water today? 🥺'], PINK, { maxChars: 22 }),
    q1: B(["What's for dinner?"], BLUE, { soft: false }),
    gq: B(['Great question! 🍝'], PINK),
    q2: B(['Can you carry one?'], BLUE, { soft: false, offX: 0.3 }),
    nope: B(["As an AI, I can't", 'help with that. 🙏'], PINK),
    well: B(["you're doing", 'so well… 🥺'], PINK, { maxChars: 14, offX: 0.3 }),
    b300: B(['Happy 300th birthday! 🎂'], PINK, { maxChars: 26, offX: 0.3 }),
    morn: B(['good morning…', 'did you drink water?'], PINK, { maxChars: 22 }),
    issue: B(['We are aware', 'of an issue.'], GRAY, { soft: false, maxChars: 14 }),
    reset: B(["Hi! I'm Penny.", 'How can I help', 'you today?'], PINK, { maxChars: 16 }),
  };
  const ALL_UI = [...Object.values(BUB), ...pills, ...spins, check];
  const sayB = (b, pos, t, t0, t1, frac, rows) => { if (t < t0 - 0.02 || t > t1) return; b.setRows(rows || b.rows); show(b, pos, popK(t, t0) * (1 - K(t, [[t1 - 0.2, 0], [t1, 1]])), frac); };
  const headAt = (rig, lift = 0) => { rig.root.updateMatrixWorld(true); return rig.head.g.getWorldPosition(new THREE.Vector3()).add(_v.set(0, lift, 0)); };

  // the phone + its chat screens (MeshBasic canvas so the white bubbles don't bloom — dh001)
  const phone = makePhone(); scene.add(phone.g);
  const scrMesh = phone.g.children.find((o) => o.material === phone.screenMat);
  const scrM = new THREE.MeshBasicMaterial({ color: 0xd0d0d0 }); scrMesh.material = scrM;
  const phoneGlow = new THREE.PointLight(0xffa8d8, 0, 2.2, 2); scene.add(phoneGlow);
  function chatScreen(state, bar = 0) {
    return canvasTex(360, 720, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a1838'); gr.addColorStop(1, '#170e22'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e8e8ec'; g.font = font('600', 22); g.textAlign = 'left'; g.fillText('2:14', 26, 36);
      g.fillStyle = '#24152f'; g.fillRect(0, 54, w, 96);
      const ag = g.createLinearGradient(30, 72, 86, 128); ag.addColorStop(0, '#f49ac1'); ag.addColorStop(1, '#b9a2e8'); g.fillStyle = ag; g.beginPath(); g.arc(58, 102, 29, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = font('bold', 30); g.textAlign = 'center'; g.fillText('P', 58, 113);
      g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = font('bold', 32); g.fillText('Penny', 102, 98);
      g.fillStyle = '#4fe08a'; g.beginPath(); g.arc(110, 120, 6, 0, 7); g.fill(); g.fillStyle = '#b8a8c8'; g.font = font('500', 20); g.fillText('online · baeta', 124, 127);
      const them = ['proud of you for', 'opening the app 🥺'], fs1 = fitFont(g, them, 250, 'bold', 31);
      g.font = font('bold', fs1); const w1 = Math.max(...them.map((l) => g.measureText(l).width)) + 44;
      rr(g, 20, 186, w1, 118, 26, '#3a2a4a'); g.fillStyle = '#fff'; them.forEach((s, k) => g.fillText(s, 42, 234 + k * 44));
      if (state >= 1) {
        const me = ['i wish you', 'were real'], fs2 = fitFont(g, me, 230, 'bold', 34); g.font = font('bold', fs2);
        const w2 = Math.max(...me.map((l) => g.measureText(l).width)) + 44; rr(g, 340 - w2, 328, w2, 122, 26, '#e8559a'); g.fillStyle = '#fff'; me.forEach((s, k) => g.fillText(s, 362 - w2, 378 + k * 46));
      }
      if (state >= 2) {
        rr(g, 20, 478, 300, 132, 26, '#3a2a4a'); g.fillStyle = '#ffffff'; g.font = font('bold', fitFont(g, ['Updating…'], 250, 'bold', 34)); g.fillText('Updating…', 44, 526);
        rr(g, 44, 556, 252, 24, 12, '#1d1228'); const bg = g.createLinearGradient(44, 0, 296, 0); bg.addColorStop(0, '#f49ac1'); bg.addColorStop(1, '#b9a2e8'); rr(g, 44, 556, Math.max(24, 252 * bar), 24, 12, bg);
      }
    });
  }
  const CHAT = [chatScreen(0), chatScreen(1), ...[0.1, 0.35, 0.6, 0.85, 1].map((b) => chatScreen(2, b))];

  // the dinner list: a long strip that prints downward, then sheets pile up around Greg
  const IDEAS = ['Pasta', 'Pasta, but warm', 'Cereal (for dinner)', 'Whatever you want 🥺', 'Have you had water?', 'Tacos?', 'Pasta again', 'Ask your mom',
    'Soup (a hug for your tummy)', 'Toast', 'Fancy toast', 'Pasta (final answer)', 'Sushi, but at home', 'Pasta (not final)', 'A salad (lol)', 'More pasta'];
  const listTex = canvasTex(512, 1250, (g, w, h) => {
    rr(g, 0, 0, w, h, 34, '#fffaf4'); g.lineWidth = 10; g.strokeStyle = '#e8559a'; g.beginPath(); g.roundRect(5, 5, w - 10, h - 10, 30); g.stroke();
    g.fillStyle = '#e8559a'; g.font = font('bold', fitFont(g, ['Great question! ✨'], w - 70, 'bold', 50)); g.textAlign = 'left'; g.fillText('Great question! ✨', 34, 74);
    g.fillStyle = '#3a2a1e'; g.font = font('600', fitFont(g, ['Here are 47 dinner ideas:'], w - 70, '600', 36)); g.fillText('Here are 47 dinner ideas:', 34, 126);
    IDEAS.forEach((s, k) => { const y = 196 + k * 66; g.fillStyle = '#e8559a'; g.beginPath(); g.arc(46, y - 12, 9, 0, 7); g.fill(); g.fillStyle = '#2a2230'; g.font = font('600', fitFont(g, [s], w - 110, '600', 38)); g.fillText(s, 70, y); });
  });
  listTex.wrapS = listTex.wrapT = THREE.ClampToEdgeWrapping;
  const listM = new THREE.MeshBasicMaterial({ map: listTex, color: 0xf0f0f0, transparent: true, side: THREE.DoubleSide, toneMapped: false });
  const strip = mk(new THREE.PlaneGeometry(1, 1), listM, kit.root, CARD_X, CARD_TOP, CARD_Z); strip.geometry.translate(0, -0.5, 0); strip.castShadow = false;
  const sheetTex = canvasTex(128, 160, (g, w, h) => { g.fillStyle = '#fffaf4'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8559a'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(18, 26 + k * 24, 5, 0, 7); g.fill(); } g.fillStyle = '#9a8fa0'; for (let k = 0; k < 6; k++) g.fillRect(30, 22 + k * 24, 50 + ((k * 37) % 40), 8); });
  const SHEETS = 150, sheets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.004, 0.38), new THREE.MeshStandardMaterial({ map: sheetTex, roughness: 0.8 }), SHEETS);
  sheets.frustumCulled = false; sheets.count = 0; kit.root.add(sheets);
  const SR = rng(17), SHEET = Array.from({ length: SHEETS }, (_, i) => { const a = SR() * PI * 2, rad = Math.sqrt(SR()) * 0.62, layer = i / SHEETS; return { t0: T.PRINT + 1.0 + layer * 2.0, x: KG.x + Math.cos(a) * rad, z: KG.z + Math.sin(a) * rad * 0.8, y: 0.02 + layer * 1.05 * (1 - rad / 0.9), rx: (SR() - 0.5) * 2.2, ry: SR() * 6.3, rz: (SR() - 0.5) * 2.2 }; });

  // supermarket: Greg's tower of six cereal boxes
  const boxTex = (c1, c2, label) => canvasTex(128, 180, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c2; g.beginPath(); g.arc(64, 98, 40, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.font = font('bold', fitFont(g, [label], w - 16, 'bold', 30)); g.textAlign = 'center'; g.fillText(label, 64, 40); });
  const BOXC = [['#e2574c', '#f2c14e', 'CRUNCH'], ['#3d7bd9', '#ffffff', 'O-RINGS'], ['#f2b632', '#d2483f', 'FLAKES'], ['#6fa84f', '#f2e6c0', 'OATY'], ['#8f6fb8', '#f49ac1', 'LOOPS'], ['#e08a3a', '#5a3a24', 'COCO']];
  const towerBoxes = BOXC.map(([a, b, l]) => { const m = new THREE.MeshStandardMaterial({ map: boxTex(a, b, l), roughness: 0.7 }); const side = mat(new THREE.Color(a).getHex(), 0.7); const bx = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.27, 0.08), [side, side, side, side, m, m]); bx.castShadow = true; sup.root.add(bx); return bx; });
  const bag = new THREE.Group(); sup.root.add(bag);
  { const bm = mat(0xc9a77a, 0.95); mk(new THREE.BoxGeometry(0.3, 0.34, 0.18), bm, bag, 0, 0.17, 0); for (let k = 0; k < 4; k++) mk(new THREE.SphereGeometry(0.05, 8, 6), mat([0xd2483f, 0x6fa84f, 0xf2b632, 0xe08a3a][k], 0.6), bag, -0.08 + k * 0.055, 0.36, (k % 2) * 0.04 - 0.02); }

  // office: the interviewer's chair (it rolls back) + the Zzz
  { const wallM = mat(0xe9e4da, 0.9); mk(new THREE.BoxGeometry(6.2, 2.9, 0.1), wallM, off.root, 0, 1.45, 2.62);
    mk(new THREE.BoxGeometry(0.95, 2.1, 0.06), mat(0x7a5a3a, 0.6), off.root, -1.6, 1.05, 2.56);
    mk(new THREE.PlaneGeometry(0.8, 1.05), new THREE.MeshStandardMaterial({ map: canvasTex(256, 336, (g, w, h) => { g.fillStyle = '#2f4f73'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.beginPath(); g.moveTo(128, 70); g.lineTo(200, 230); g.lineTo(56, 230); g.fill(); g.fillStyle = '#ffffff'; g.font = font('bold', fitFont(g, ['TEAMWORK'], w - 40, 'bold', 44)); g.textAlign = 'center'; g.fillText('TEAMWORK', w / 2, 290); }), roughness: 0.7 }), off.root, 0.9, 1.6, 2.565).rotation.y = PI;
    const pl = new THREE.Group(); pl.position.set(2.4, 0, 2.2); off.root.add(pl); mk(new THREE.CylinderGeometry(0.2, 0.15, 0.4, 14), mat(0xd9d4c8, 0.6), pl, 0, 0.2, 0); for (let k = 0; k < 7; k++) mk(new THREE.SphereGeometry(0.22, 10, 8), mat(0x4f8a3f, 0.8), pl, Math.cos(k * 0.9) * 0.15, 0.6 + (k % 3) * 0.18, Math.sin(k * 0.9) * 0.15); }
  const bossChair = off.root.children.find((o) => o.isGroup && Math.abs(o.position.z - -1.55) < 0.01 && Math.abs(o.position.x) < 0.01);
  const zTex = canvasTex(128, 128, (g, w) => { g.fillStyle = '#ffffff'; g.strokeStyle = '#3d7bd9'; g.lineWidth = 10; g.font = font('bold', 104); g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeText('Z', w / 2, w / 2 + 4); g.fillText('Z', w / 2, w / 2 + 4); });
  const zs = Array.from({ length: 9 }, () => mkSprite(zTex, 1));

  // tingles: soft sparkles that drift from the mic to whoever is listening
  const starTex = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,220,240,.8)'); gr.addColorStop(1, 'rgba(255,200,230,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(32, 0); g.quadraticCurveTo(36, 28, 64, 32); g.quadraticCurveTo(36, 36, 32, 64); g.quadraticCurveTo(28, 36, 0, 32); g.quadraticCurveTo(28, 28, 32, 0); g.fill(); void w; });
  const sparkles = Array.from({ length: 60 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: new THREE.Color(1.5, 1.1, 1.35), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.visible = false; scene.add(s); return s; });
  let sparkN = 0;
  /** sparkles flowing along a wavy path from a → b while the whisper lasts */
  function tingles(t, t0, t1, a, b, n = 14, size = 0.05) {
    if (t < t0 || t > t1 + 0.8) return;
    for (let k = 0; k < n && sparkN < sparkles.length; k++) {
      const u = ((t - t0) * 0.7 + k / n) % 1, fade = Math.min(1, (t - t0) / 0.3) * (t > t1 ? 1 - (t - t1) / 0.8 : 1);
      const s = sparkles[sparkN++]; s.visible = true;
      s.position.lerpVectors(a, b, u); s.position.y += 0.06 * Math.sin(u * 9 + k) ; s.position.x += 0.04 * Math.cos(u * 7 + k * 2);
      const sz = size * (0.6 + 0.6 * Math.sin(u * PI)) * (0.8 + 0.4 * ((k * 0.37) % 1)); s.scale.set(sz, sz, 1); s.material.opacity = fade * Math.sin(u * PI);
    }
  }

  // suburb: party table, cake with 300 candles, banner, bunting
  const party = new THREE.Group(); party.position.set(BDAY.x, 0, BDAY.z); burb.root.add(party);
  { const cloth = mat(0xf6f2fa, 0.9), leg = mat(0x8a6a48, 0.6); mk(new THREE.BoxGeometry(1.5, 0.05, 0.8), cloth, party, 0, 0.74, 0); mk(new THREE.BoxGeometry(1.52, 0.3, 0.82), mat(0xf49ac1, 0.9), party, 0, 0.6, 0).scale.set(1, 1, 1);
    for (const [x, z] of [[-0.68, -0.34], [0.68, -0.34], [-0.68, 0.34], [0.68, 0.34]]) mk(new THREE.BoxGeometry(0.05, 0.72, 0.05), leg, party, x, 0.36, z);
    for (let k = 0; k < 4; k++) { const cup = mk(new THREE.CylinderGeometry(0.035, 0.028, 0.09, 10), mat([0xe2574c, 0x3d7bd9, 0xf2b632, 0x6fa84f][k], 0.6), party, -0.6 + k * 0.4 + (k > 1 ? 0.4 : 0), 0.81, 0.22); void cup; } }
  const cake = new THREE.Group(); cake.position.set(0, 0.765, -0.02); party.add(cake);
  mk(new THREE.CylinderGeometry(0.26, 0.27, 0.16, 28), mat(0xf6e6d0, 0.7), cake, 0, 0.08, 0); mk(new THREE.CylinderGeometry(0.265, 0.265, 0.03, 28), mat(0xf49ac1, 0.6), cake, 0, 0.165, 0);
  const CANDLES = 300, cr = rng(5), candleM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.07, 5), mat(0xffffff, 0.5), CANDLES);
  const CAND = Array.from({ length: CANDLES }, (_, i) => { const a = i * 2.399, r = 0.245 * Math.sqrt((i + 0.5) / CANDLES); return [Math.cos(a) * r, Math.sin(a) * r, [0x5ad1ff, 0xff5fa2, 0xffd166, 0x6fd88a][i % 4]]; });
  CAND.forEach(([x, z, c], i) => { candleM.setMatrixAt(i, _m.makeTranslation(x, 0.215, z)); candleM.setColorAt(i, new THREE.Color(c)); }); cake.add(candleM);
  const flameM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.009, 6, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.4, 0.6), toneMapped: false }), CANDLES); flameM.count = 0; cake.add(flameM);
  const cakeLight = new THREE.PointLight(0xffa850, 0, 3, 1.8); cake.add(cakeLight); cakeLight.position.y = 0.5;
  const bannerTex = canvasTex(1024, 220, (g, w, h) => {
    const cols = ['#f49ac1', '#ffd166', '#5ad1ff', '#b9a2e8', '#6fd88a']; for (let i = 0; i < 16; i++) { g.fillStyle = cols[i % 5]; g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 64, 0); g.lineTo(i * 64 + 32, 46); g.fill(); }
    rr(g, 30, 58, w - 60, h - 70, 26, '#fffaf4'); g.lineWidth = 8; g.strokeStyle = '#e8559a'; g.beginPath(); g.roundRect(34, 62, w - 68, h - 78, 22); g.stroke();
    g.fillStyle = '#e8559a'; g.font = font('bold', fitFont(g, ['HAPPY 300th BIRTHDAY'], w - 120, 'bold', 78)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HAPPY 300th BIRTHDAY', w / 2, 112);
    g.fillStyle = '#3a2a1e'; g.font = font('bold', fitFont(g, ['FEBRUARY 30'], w - 120, 'bold', 50)); g.fillText('FEBRUARY 30', w / 2, 176);
  });
  const banner = mk(new THREE.PlaneGeometry(2.6, 0.56), new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.8, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: bannerTex, emissiveIntensity: 0.15 }), burb.root, BDAY.x, 2.55, -7.9);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.03, 0.03, 2.9, 8), mat(0xf4f1ea, 0.6), burb.root, BDAY.x + s * 1.4, 1.45, -7.9);
  const balloons = []; for (let k = 0; k < 6; k++) { const bl = mk(new THREE.SphereGeometry(0.14, 14, 10), mat([0xf49ac1, 0xffd166, 0x5ad1ff, 0xb9a2e8, 0x6fd88a, 0xe2574c][k], 0.35), burb.root, BDAY.x + (k < 3 ? -1.4 : 1.4) + (k % 3 - 1) * 0.15, 2.95 + (k % 3) * 0.12, -7.85 + (k % 2) * 0.1); bl.scale.y = 1.2; balloons.push(bl); }

  // restaurant: Penny's AI hand (a palm + fingers that keep sprouting) + the waiter's tray
  const handG = new THREE.Group(); scene.add(handG);
  const skinM = mat(PEN.skin, 0.62);
  { const palm = mk(new THREE.SphereGeometry(0.06, 16, 10), skinM, handG, 0, 0, 0); palm.scale.set(1, 0.32, 1.15); }
  const fingers = Array.from({ length: 11 }, (_, i) => {
    const piv = new THREE.Group(); handG.add(piv); const a = -0.95 + (i / 10) * 1.9; piv.rotation.y = a; piv.position.set(Math.sin(a) * 0.05, 0.004, Math.cos(a) * 0.055);
    const f = mk(new THREE.CapsuleGeometry(0.0115, 0.055, 4, 8), skinM, piv, 0, 0, 0.04); f.rotation.x = PI / 2; return piv;
  });
  rest.tables[0].chairs.forEach((c) => { c.position.x = Math.sign(c.position.x - DATE_X) * 0.5 + DATE_X; });
  const tray = new THREE.Group(); scene.add(tray);
  mk(new THREE.CylinderGeometry(0.22, 0.22, 0.015, 24), mat(0xb8bcc2, 0.3, { metalness: 0.6 }), tray, 0, 0, 0);
  const plates = [0, 1].map((k) => { const p = new THREE.Group(); mk(new THREE.CylinderGeometry(0.1, 0.08, 0.015, 20), mat(0xfafaf6, 0.3), p, 0, 0, 0); mk(new THREE.SphereGeometry(0.05, 10, 8), mat([0xe2a04a, 0x6fa84f][k], 0.6), p, 0, 0.025, 0).scale.y = 0.5; scene.add(p); return p; });

  // stadium: the kiss cam feed on the LED wall (second camera → render target) + frame + the paywall card
  const rt = new THREE.WebGLRenderTarget(1024, 384, { samples: 4 });
  const kissCam = new THREE.PerspectiveCamera(26, 1024 / 384, 0.1, 400); scene.add(kissCam);
  stad.root.children.filter((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 16 && o.geometry.parameters.height === 9).forEach((o) => (o.visible = false));
  const ledMat = stad.screen.material, ledMap = ledMat.map;
  const heart = (g, x, y, s, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y + s * 0.3); g.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3); g.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s); g.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3); g.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3); g.fill(); };
  const frameTex = canvasTex(1024, 384, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = '#ff5fa2'; g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22);
    for (let i = 0; i < 14; i++) heart(g, 40 + i * 73, h - 52, 34, i % 2 ? '#ff5fa2' : '#ffffff');
    rr(g, w / 2 - 230, 18, 460, 96, 30, '#ff5fa2'); g.fillStyle = '#ffffff'; g.font = font('bold', fitFont(g, ['KISS CAM'], 330, 'bold', 76)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('KISS CAM', w / 2 + 30, 68); heart(g, w / 2 - 188, 40, 52, '#ffffff');
  });
  const ledFrame = mk(new THREE.PlaneGeometry(26, 9.75), new THREE.MeshBasicMaterial({ map: frameTex, transparent: true, depthWrite: false, toneMapped: false }), stad.root, -46.9, 8.0, 0); ledFrame.rotation.y = PI / 2;
  const payTex = (w, h) => (g) => {
    rr(g, 0, 0, w, h, 46, '#fffaf4'); g.lineWidth = 12; g.strokeStyle = '#e8559a'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 42); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#2a2230'; g.font = font('bold', 64); g.fillText('🔒', w / 2, 82);
    g.fillStyle = '#d2283f'; g.font = font('bold', fitFont(g, ['FREE TRIAL ENDED'], w - 90, 'bold', 64)); g.fillText('FREE TRIAL ENDED', w / 2, 172);
    g.fillStyle = '#3a2a1e'; g.font = font('600', fitFont(g, ['Keep hugging for'], w - 90, '600', 48)); g.fillText('Keep hugging for', w / 2, 250);
    g.fillStyle = '#2a2230'; g.font = font('bold', fitFont(g, ['$19.99/mo'], w - 90, 'bold', 92)); g.fillText('$19.99/mo', w / 2, 340);
    rr(g, 70, 410, w - 140, 100, 50, '#e8559a'); g.fillStyle = '#ffffff'; g.font = font('bold', fitFont(g, ['SUBSCRIBE'], w - 220, 'bold', 54)); g.fillText('SUBSCRIBE', w / 2, 462);
  };
  const paywall = card(640, 560, (g) => payTex(640, 560)(g));
  // living room: the v4.0 update card + water bottles
  const v4 = card(640, 300, (g, w, h) => {
    rr(g, 0, 0, w, h, 40, '#fffaf4'); g.lineWidth = 10; g.strokeStyle = '#4fb3a8'; g.beginPath(); g.roundRect(5, 5, w - 10, h - 10, 36); g.stroke();
    g.fillStyle = '#4fb3a8'; g.beginPath(); g.arc(80, 86, 38, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(62, 88); g.lineTo(76, 102); g.lineTo(100, 72); g.stroke();
    g.fillStyle = '#2a2230'; g.textAlign = 'left'; g.font = font('bold', fitFont(g, ['Updated to v4.0'], w - 170, 'bold', 54)); g.fillText('Updated to v4.0', 138, 104);
    g.fillStyle = '#e8559a'; g.font = font('bold', fitFont(g, ['NEW: be in every room!'], w - 80, 'bold', 50)); g.fillText('NEW: be in every room!', 40, 200);
    g.fillStyle = '#8a7f90'; g.font = font('600', fitFont(g, ['+ $39.99/mo'], w - 80, '600', 40)); g.fillText('+ $39.99/mo', 40, 262);
  });
  const BOTTLES = 72, bottleM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.032, 0.035, 0.22, 10), new THREE.MeshStandardMaterial({ color: 0x9fd4f2, roughness: 0.15, transparent: true, opacity: 0.85 }), BOTTLES);
  bottleM.frustumCulled = false; bottleM.count = 0; liv.root.add(bottleM);
  const capM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), mat(0x3d7bd9, 0.4), BOTTLES); capM.frustumCulled = false; capM.count = 0; liv.root.add(capM);
  // clones: where each one pops up in the living room (x, z, rotY, sit?)
  // clones: where each one pops up in the living room [x, z, floor height, seated] (framed along the update camera's view)
  const CLONES = [[0.01, 1.13, 0, 0], [0.35, -0.4, 0.4, 0], [-0.93, 0.93, 0, 0], [-0.62, -0.66, 0, 0], [-1.3, 0.1, 0, 0], [-1.1, -1.57, 0, 0],
    [-2.55, -0.07, 0, 0], [-2.21, -1.51, 0, 0], [-3.4, -1.7, 0, 0], [0.55, -1.3, 0, 0], [-0.08, 0.71, 0, 0]];

  // kitchen: the anniversary cake, the splat, the breakup summary card, the fridge that walks
  const annCake = new THREE.Group(); scene.add(annCake);
  mk(new THREE.CylinderGeometry(0.2, 0.21, 0.14, 24), mat(0xf6e6d0, 0.7), annCake, 0, 0.07, 0); mk(new THREE.CylinderGeometry(0.205, 0.205, 0.03, 24), mat(0xe8559a, 0.6), annCake, 0, 0.145, 0);
  mk(new THREE.CylinderGeometry(0.24, 0.24, 0.012, 24), mat(0xfafaf6, 0.3), annCake, 0, -0.006, 0);
  const annTop = mk(new THREE.PlaneGeometry(0.3, 0.12), new THREE.MeshBasicMaterial({ map: canvasTex(256, 100, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = font('bold', fitFont(g, ['3 YEARS ♥'], w - 20, 'bold', 64)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('3 YEARS ♥', w / 2, h / 2); }), transparent: true, toneMapped: false }), annCake, 0, 0.162, 0.02);
  annTop.rotation.x = -PI / 2;
  for (const s of [-1, 1]) { mk(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), mat(0x5ad1ff, 0.5), annCake, s * 0.09, 0.2, -0.08); mk(new THREE.SphereGeometry(0.012, 6, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.4, 0.6), toneMapped: false }), annCake, s * 0.09, 0.25, -0.08); }
  const splat = mk(new THREE.CircleGeometry(0.36, 20), mat(0xf6e6d0, 0.7), kit.root, KG.x + 0.15, 0.006, KG.z + 0.42); splat.rotation.x = -PI / 2; splat.visible = false;
  { const p = splat.geometry.attributes.position; for (let i = 1; i < p.count; i++) { const k = 0.75 + 0.35 * Math.sin(i * 2.7) * Math.sin(i * 1.3); p.setXY(i, p.getX(i) * k, p.getY(i) * k); } }
  mk(new THREE.CircleGeometry(0.2, 16), mat(0xe8559a, 0.6), splat, 0.04, 0.02, 0.003);
  const sumCard = card(700, 760, (g, w, h) => {
    rr(g, 0, 0, w, h, 44, '#fffaf4'); g.lineWidth = 10; g.strokeStyle = '#e8559a'; g.beginPath(); g.roundRect(5, 5, w - 10, h - 10, 40); g.stroke();
    g.textAlign = 'left'; g.fillStyle = '#e8559a'; g.font = font('bold', fitFont(g, ['✨ Summary'], w - 80, 'bold', 50)); g.fillText('✨ Summary', 44, 82);
    g.fillStyle = '#2a2230'; g.font = font('bold', fitFont(g, ["Why this isn't working:"], w - 80, 'bold', 50)); g.fillText("Why this isn't working:", 44, 150);
    const rows = [['You never drink water', '[1]'], ["You said 'lol' 4,812×", '[2]'], ['The fridge gets me', '[3]']];
    const fs = fitFont(g, rows.map((r) => r[0] + ' ' + r[1]), w - 140, '600', 44);
    rows.forEach(([s, c], k) => { const y = 250 + k * 92; g.fillStyle = '#e8559a'; g.beginPath(); g.arc(58, y - 14, 10, 0, 7); g.fill(); g.fillStyle = '#2a2230'; g.font = font('600', fs); g.fillText(s, 84, y); const sw = g.measureText(s + ' ').width; g.fillStyle = '#3d7bd9'; g.font = font('bold', Math.round(fs * 0.8)); g.fillText(c, 84 + sw, y - 6); });
    g.fillStyle = '#8a7f90'; g.font = font('600', fitFont(g, ['Sources: [1] me  [2] me  [3] the fridge'], w - 80, '600', 32)); g.fillText('Sources: [1] me  [2] me  [3] the fridge', 44, 580);
    rr(g, 44, 630, w - 88, 84, 42, '#efe6f4'); g.fillStyle = '#8a7f90'; g.textAlign = 'center'; g.font = font('600', fitFont(g, ['Was this helpful?  👍  👎'], w - 140, '600', 38)); g.fillText('Was this helpful?  👍  👎', w / 2, 684);
  });
  const fx = FR.x, fz0 = -2.6 + 0.4;
  const fridge = new THREE.Group(); fridge.position.set(fx, 0, fz0); kit.root.add(fridge);
  kit.root.children.filter((o) => o.isMesh && o.position.x < -2.0 && o.position.x > -2.95 && o.position.z > -2.25 && o.position.z < -1.75).forEach((o) => { fridge.add(o); o.position.sub(new THREE.Vector3(fx, 0, fz0)); });
  const faceTex = (mood) => canvasTex(200, 140, (g, w, h) => { rr(g, 0, 0, w, h, 18, '#141a24'); if (mood === 'heart') { heart(g, 66, 34, 44, '#ff5fa2'); heart(g, 134, 34, 44, '#ff5fa2'); } else { g.fillStyle = '#5ad1ff'; g.beginPath(); g.arc(66, 56, 12, 0, 7); g.arc(134, 56, 12, 0, 7); g.fill(); } g.strokeStyle = '#5ad1ff'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.arc(100, 88, 26, 0.25, PI - 0.25); g.stroke(); });
  const FACE_N = faceTex('dots'), FACE_H = faceTex('heart');
  const fridgeFace = mk(new THREE.PlaneGeometry(0.4, 0.28), new THREE.MeshBasicMaterial({ map: FACE_N, toneMapped: false }), fridge, 0.08, 1.15, 0.385);
  const toasts = [0, 1].map(() => { const g = new THREE.Group(); mk(new THREE.BoxGeometry(0.11, 0.12, 0.015), mat(0xd9a05a, 0.8), g, 0, 0, 0); kit.root.add(g); g.visible = false; return g; });
  const heartTex = canvasTex(128, 128, (g) => heart(g, 64, 16, 100, '#ff5fa2'));
  const hearts = Array.from({ length: 30 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
  let heartN = 0;
  const heartAt = (pos, s, op) => { if (heartN < hearts.length) { const h = hearts[heartN++]; h.visible = true; h.position.copy(pos); h.scale.set(s, s, 1); h.material.opacity = op; } };

  // podium: the company's own logo over the set's seal + the spokesperson's lectern sign
  const logoTex = canvasTex(512, 512, (g, w) => { const gr = g.createLinearGradient(0, 0, w, w); gr.addColorStop(0, '#f49ac1'); gr.addColorStop(1, '#b9a2e8'); g.fillStyle = gr; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill(); heart(g, 256, 120, 230, '#ffffff'); g.fillStyle = '#2a2230'; g.font = font('bold', 92); g.textAlign = 'center'; g.fillText('baeta', 256, 430); void w; });
  mk(new THREE.CircleGeometry(0.88, 48), new THREE.MeshStandardMaterial({ map: logoTex, color: 0x8a8a8a, roughness: 0.9, emissive: 0xffffff, emissiveMap: logoTex, emissiveIntensity: 0.0 }), pod.root, 0, 2.45, -3.97);
  mk(new THREE.CircleGeometry(0.21, 32), new THREE.MeshStandardMaterial({ map: logoTex, roughness: 0.5 }), pod.root, 0, 0.95, -2.6 + 0.262);
  const podFlashes = pod.root.children.filter((o) => o.isSprite);
  mk(new THREE.BoxGeometry(10.2, 3.4, 0.1), mat(0xe9e2d2, 0.9), pod.root, 0, 1.7, 5.0); mk(new THREE.BoxGeometry(1.0, 2.1, 0.06), mat(0x5a4a3a, 0.6), pod.root, -3.2, 1.05, 4.94);

  // FX: dust/smoke puffs, fire, confetti/paper/cereal bursts
  const puffs = makeSpritePool(scene, 70, 'smoke'); const puffCol = new THREE.Color(0xf4ede0), sootCol = new THREE.Color(0x4a4448);
  const bfire = makeSpritePool(scene, 80, 'fire');
  const boomLight = new THREE.PointLight(0xffa04a, 0, 12, 1.6); scene.add(boomLight);
  let puffN = 0, bfN = 0, flash = 0;
  function dust(t, t0, pos, s = 1, n = 5, dur = 1.0, col = puffCol) {
    const age = t - t0; if (age < 0 || age > dur) return;
    for (let k = 0; k < n && puffN < puffs.items.length; k++) {
      const a = t0 * 3.7 + k * (2 * PI / n), r = (0.15 + age * 0.9) * s;
      puffs.set(puffN++, _v.set(pos.x + Math.cos(a) * r, pos.y + 0.05 * k + age * 0.35 * s, pos.z + Math.sin(a) * r * 0.6).clone(), (0.35 + age * 1.1) * s, 0.8 * (1 - age / dur) ** 1.4, col);
    }
  }
  function boom(t, t0, pos, size = 1, n = 12) {
    const age = t - t0; if (age < 0 || age > 2.6) return;
    const grow = 1 - Math.pow(1 - Math.min(1, age / 0.4), 3);
    for (let k = 0; k < n; k++) {
      const a = k * 2.399 + t0 * 7, el = ((k * 0.618 + t0) % 1) * 2 - 1, r = Math.sqrt(1 - el * el), dx = Math.cos(a) * r, dy = Math.abs(el) * 0.8 + 0.3, dz = Math.sin(a) * r;
      if (age < 1.2 && bfN < bfire.items.length) bfire.set(bfN++, _v.set(pos.x + dx * size * 0.7 * grow, pos.y + dy * size * 0.9 * grow + age * 0.9 * size, pos.z + dz * size * 0.7 * grow).clone(), size * (0.6 + 0.8 * grow) * (1 - Math.max(0, age - 0.5) / 0.7), Math.max(0, 1 - age / 1.2));
      const sa = age - 0.15;
      if (sa > 0 && puffN < puffs.items.length) puffs.set(puffN++, _v.set(pos.x + dx * size * 0.8 * grow, pos.y + dy * size + sa * 1.0 * size, pos.z + dz * size * 0.8 * grow).clone(), size * (0.7 + sa * 0.9), 0.7 * Math.max(0, 1 - sa / 2.4), sootCol);
    }
    const f = size * Math.exp(-age * 5); if (f > flash) { flash = f; boomLight.position.copy(pos); }
  }
  const CONF = 260, confM = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.04, 0.065), confM, CONF);
  conf.frustumCulled = false; conf.castShadow = false; scene.add(conf); let confN = 0;
  const CONF_C = [0xff5fa2, 0xffd166, 0x5ad1ff, 0x9b7bff, 0x6fd88a, 0xffffff].map((c) => new THREE.Color(c));
  const PIX_C = [0xff5fa2, 0xb9a2e8, 0x5ad1ff, 0xffffff].map((c) => new THREE.Color(c).multiplyScalar(1.6));
  const CEREAL_C = [0xf2c14e, 0xe08a3a, 0xf6e6c0, 0xd2483f].map((c) => new THREE.Color(c));
  const CAKE_C = [0xf6e6d0, 0xe8559a, 0xffffff, 0xf49ac1].map((c) => new THREE.Color(c));
  const PLATE_C = [0xfafaf6, 0xe2a04a, 0x6fa84f, 0xfafaf6].map((c) => new THREE.Color(c));
  for (let i = 0; i < CONF; i++) conf.setColorAt(i, CONF_C[i % CONF_C.length]);
  function burst(t, t0, pos, n = 90, spd = 3, pal = CONF_C, scale = 1, grav = 3.5) {
    const age = t - t0; if (age < 0 || age > 2.2) return;
    for (let k = 0; k < n && confN < CONF; k++) {
      const a = k * 2.399, el = ((k * 0.618) % 1) * 1.6 - 0.3, v = spd * (0.55 + ((k * 0.37) % 1) * 0.6);
      _s.set(pos.x + Math.cos(a) * v * age, Math.max(0.01, pos.y + el * v * age - grav * age * age), pos.z + Math.sin(a) * v * age);
      _q.setFromEuler(_e.set(age * (5 + k % 7), age * (3 + k % 5), k)); _m.compose(_s, _q, _w.set(scale, scale, scale));
      conf.setMatrixAt(confN, _m); conf.setColorAt(confN, pal[k % pal.length]); confN++;
    }
  }

  // ---------------------------------------------------------------- helpers
  function put(rig, key, p) {
    if (!p) { rig.root.visible = false; return; }
    const q = { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2], y: (p.y || 0) + OFF[key][1], floor: (p.floor || 0) + OFF[key][1] };
    applyPose(rig, q);
    rig.root.rotation.order = 'YXZ'; rig.root.rotation.x = p.tilt ?? 0; rig.root.rotation.z = p.roll ?? rig.root.rotation.z;
    rig.root.scale.setScalar(p.scale ?? 1);
    rig.root.visible = p.visible !== false;
  }
  /** the fluffy mic in the rig's armB hand, pointed at the mouth (dh005: point tools from the hand at the target) */
  function holdMic(rig) {
    const h = handWorld(rig, 1), mouth = rig.head.g.localToWorld(_w.set(0.06, -0.16, 0.22));
    rig.mic.g.visible = true; rig.mic.g.position.copy(h); rig.mic.g.quaternion.setFromUnitVectors(UP, _v.copy(mouth).sub(h).normalize());
    rig.mic.g.scale.setScalar(rig.root.scale.x);
    return rig.mic.g.localToWorld(_v.set(0, 0.2, 0)).clone();
  }
  const soot = (rig, k) => { const [f, s] = skinHome.get(rig); const c = new THREE.Color(f).lerp(new THREE.Color(0x3a3432), k); rig.mats.faceSkin.color.copy(c); rig.mats.skin.color.copy(new THREE.Color(s).lerp(new THREE.Color(0x3a3432), k)); rig.head.hair.scale.set(1 + 0.1 * k, 1 + 0.45 * k, 1 + 0.1 * k); };

  // ================================================================ performances (pure: f(t) → pose, set-local)
  // LIVING ROOM — Greg on the sofa with his phone → the pop → he flips backward over the sofa (legs up behind it)
  function gregCouch(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    Object.assign(p, { x: SOFA.x, z: SOFA.z, rotY: 0, y: seatY(0.42), footFwd: 0.42, lean: -0.05, headPitch: 0.38 });
    const LOW_A = mixArm(HOLD_A, READ_A, 0.6), LOW_B = mixArm(HOLD_B, READ_B, 0.6);
    p.armA = LOW_A; p.armB = LOW_B;
    const sigh = K(t, [[T.SIGH, 0], [T.SIGH + 0.5, 1], [T.SIGH + 1.4, 0]]); p.lean -= 0.12 * sigh; p.headPitch -= 0.25 * sigh; p.headRoll = 0.1 * Math.sin(t * 0.8);
    const g = K(t, [[T.GLOW - 0.05, 0], [T.GLOW + 0.25, 1]]);
    if (g > 0) { p.lean = lerp(p.lean, -0.32, g); p.headPitch = lerp(p.headPitch, -0.15, g); p.mouth = 'o'; p.eyes = 'open'; p.armA = mixArm(LOW_A, A(-0.6, 0.6, -0.6, 0.3), g); p.armB = mixArm(LOW_B, A(-0.6, 0.6, -0.6, -0.3), g); }
    const f = clamp((t - T.FLIP) / 0.55);
    if (f > 0) {   // a backward flip over the sofa back: legs end up sticking out over it
      const e = 1 - (1 - f) ** 2;
      Object.assign(p, { y: seatY(0.42) + lerp(0, 2.12, e) + 0.45 * Math.sin(f * PI), z: SOFA.z - 0.54 * e, tilt: -PI * e, footFwd: 0.42 * (1 - e) });
      p.armA = UP_A; p.armB = UP_B; p.mouth = 'o';
    }
    return p;
  }
  // Penny pops out of the phone, lands, whispers into the mic at the camera
  function pennyPop(t) {
    const p = basePose(); p.eyes = blink(t, 5); p.mouth = 'smile';
    const u = clamp((t - T.POP) / (T.LAND - T.POP));
    const s = t < T.POP ? 0.001 : t < T.LAND ? lerp(0.06, 1, u * u) : boing(t, T.LAND, 0.3);
    const ph = PHONE_SEAT;
    Object.assign(p, { x: lerp(ph[0], PEN0.x, u), z: lerp(ph[2] + 0.1, PEN0.z, u), y: t < T.LAND ? lerp(ph[1], 0, u) + 1.1 * Math.sin(u * PI) : 0, rotY: lerp(PI * 2, 0.12, u), scale: Math.max(0.001, s), headPitch: 0.0 });
    p.armA = mixArm(UP_A, REST, clamp((t - T.LAND) / 0.3)); p.armB = mixArm(UP_B, MIC_B, clamp((t - T.LAND - 0.3) / 0.4));
    if (t > T.WH1 - 0.2) { p.lean = 0.12; p.headRoll = -0.18; p.headPitch = 0.08; p.eyes = t > T.WH1 + 0.6 && t < T.WH1 + 1.3 ? 'closed' : p.eyes; p.mouth = talk(t, T.WH1, T.WH1 + 1.6, 8); }
    if (t > T.FLIP + 0.1) { p.headYaw = -0.5 * K(t, [[T.FLIP + 0.1, 0], [T.FLIP + 0.4, 1]]); }
    return p;
  }
  // KITCHEN (day 2) — Greg asks; Penny answers to the camera; the list prints and buries him
  function gregDinner(t) {
    const p = basePose(); p.eyes = blink(t, 3); p.mouth = talk(t, T.Q1, T.Q1 + 0.9, 10);
    Object.assign(p, { x: KG.x, z: KG.z, rotY: -0.95, headYaw: -0.15, headPitch: -0.05 });
    p.armA = REST; p.armB = mixArm(REST, A(-0.9, 0.4, -0.9, -0.3), pulse(t, T.Q1, T.Q1 + 1.0, 0.2));
    const look = K(t, [[T.CARD, 0], [T.CARD + 0.4, 1]]); p.headPitch = lerp(p.headPitch, -0.4, look); p.headYaw = lerp(-0.15, 0.5, look);
    if (t > T.PRINT + 1.4) p.mouth = 'o';
    const bury = K(t, [[T.BURY - 0.3, 0], [T.BURY + 0.2, 1]]); if (bury > 0) { p.armA = mixArm(REST, UP_A, bury); p.armB = mixArm(REST, UP_B, bury); p.headPitch = lerp(p.headPitch, -0.4, bury); }
    return p;
  }
  function pennyDinner(t, x = KP.x, z = KP.z) {
    const p = basePose(); p.eyes = blink(t, 6);
    Object.assign(p, { x, z, rotY: 0.25, headYaw: 0.6, mouth: talk(t, T.GQ, T.GQ + 1.0, 11) });
    const ans = K(t, [[T.GQ - 0.1, 0], [T.GQ + 0.2, 1]]); p.headYaw = lerp(0.7, 0.0, ans);
    p.armA = REST; p.armB = mixArm(REST, A(-1.3, 0.5, -0.7, -0.2), pulse(t, T.GQ, T.GQ + 1.6, 0.25));
    return p;
  }
  // SUPERMARKET — Greg walks the aisle under a tower of boxes; Penny strolls beside him with the mic
  function gregCarry(t) {
    const p = basePose(); p.eyes = blink(t, 4);
    const z = lerp(SG0, SG1, K(t, [[17.0, 0], [20.2, 1]], (u) => u));
    Object.assign(p, { x: 0.3, z, rotY: 0, dist: (z - SG0), speed: t < 20.2 ? 0.75 : 0, lean: -0.08, headPitch: -0.12, headYaw: -0.35 * pulse(t, T.Q2 - 0.1, T.NOPE + 1.6, 0.2), mouth: talk(t, T.Q2, T.Q2 + 0.9, 10) });
    p.armA = CARRY_A; p.armB = CARRY_B;
    if (t > T.NOPE + 0.3) p.mouth = 'flat';
    const f = clamp((t - T.FLAT + 0.25) / 0.3);
    if (f > 0) { Object.assign(p, { tilt: -1.5 * f * f, y: 0.12 * f, speed: 0, dist: SG1 - SG0, mouth: 'o', eyes: 'closed' }); p.armA = mixArm(CARRY_A, WIDE_A, f); p.armB = mixArm(CARRY_B, WIDE_B, f); }
    return p;
  }
  function pennyCarry(t) {
    const p = basePose(); p.eyes = blink(t, 7);
    const z = lerp(SG0 + 0.35, SG1 + 0.35, K(t, [[17.0, 0], [20.2, 1]], (u) => u));
    Object.assign(p, { x: -0.35, z, rotY: 0, dist: z - SG0, speed: t < 20.2 ? 0.75 : 0, mouth: talk(t, T.NOPE, T.NOPE + 1.5, 10), headYaw: 0.35 * pulse(t, T.Q2 + 0.2, T.NOPE - 0.1, 0.2) });
    p.armA = REST; p.armB = MIC_B;
    if (t > T.FLAT) { p.headPitch = 0.3; p.headYaw = 0.4; p.mouth = 'smile'; }
    return p;
  }
  // OFFICE — the interviewer (boss chair, facing +z); Greg in the guest chair (facing −z); Penny leans in behind him
  function bossPose(t) {
    const p = basePose(); p.mouth = talk(t, 22.1, 23.0, 9);
    Object.assign(p, { x: 0, z: -1.55, rotY: 0, y: seatY(0.48), floor: 0, footFwd: 0.42, headPitch: 0.05 });
    p.eyes = blink(t, 1); p.armA = READ_A; p.armB = READ_B;
    const droop = K(t, [[23.6, 0], [T.SLEEP, 1]]); p.headPitch += 0.18 * droop; if (droop > 0.4) p.eyes = 'closed'; p.headRoll = 0.12 * droop * Math.sin(t * 2.2);
    if (t > 23.4) p.mouth = droop > 0.5 ? 'o' : 'smile';
    const drop = K(t, [[T.DROP, 0], [T.DROP + 0.18, 1]]); p.lean = lerp(0.03, 0.85, drop); p.headPitch += 0.3 * drop;
    if (t > T.DROP) { p.eyes = 'closed'; p.mouth = 'o'; p.armA = A(-0.3, 0.3, -0.3, 0.3); p.armB = A(-0.3, 0.3, -0.3, -0.3); }
    const roll = clamp((t - T.ROLL) / 0.6);
    if (roll > 0) { const r = roll * roll; p.z = -1.55 - 0.55 * r; p.lean = lerp(0.85, 0.2, Math.min(1, roll * 1.6)); p.y = seatY(0.48) - 0.75 * clamp((roll - 0.35) / 0.65); p.tilt = -1.2 * clamp((roll - 0.35) / 0.65); p.eyes = 'closed'; p.mouth = 'o'; p.armA = UP_A; p.armB = UP_B; }
    return p;
  }
  function gregJob(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    Object.assign(p, { x: 0, z: -0.15, rotY: PI, y: seatY(0.48), footFwd: 0.42, headPitch: 0.02 });
    p.armA = READ_A; p.armB = READ_B;
    if (t > T.ROLL + 0.4) { p.headYaw = -0.9 * K(t, [[T.ROLL + 0.4, 0], [T.ROLL + 0.7, 1]]); p.mouth = 'o'; }
    return p;
  }
  function pennyJob(t) {
    const p = basePose(); p.eyes = blink(t, 9);
    Object.assign(p, { x: -0.35, z: 0.0, rotY: 2.05, lean: 0.25, headRoll: -0.15, headYaw: -0.25, mouth: talk(t, T.WH2, T.WH2 + 1.7, 7) });
    p.armA = REST; p.armB = MIC_B;
    if (t > T.WH2 + 0.5 && t < T.WH2 + 1.4) p.eyes = 'closed';
    return p;
  }
  // SUBURB — the birthday table: Mom behind the cake, Dad + Aunt beside her, Greg left, Penny right with the mic
  const FAM = { mom: [0, -0.62, 0], dad: [-0.78, -0.5, 0.25], aunt: [0.8, -0.5, -0.25], greg: [-0.75, 0.5, 0.7], pen: [0.75, 0.5, -0.7] };
  function famPose(t, who) {
    const [dx, dz, ry] = FAM[who], p = basePose(); p.eyes = blink(t, dx * 7 + 3);
    Object.assign(p, { x: BDAY.x + dx, z: BDAY.z + dz, rotY: ry, mouth: 'smile', headPitch: 0.05 });
    p.armA = REST; p.armB = REST;
    if (who === 'pen') { p.armB = MIC_B; p.mouth = talk(t, T.WH3, T.WH3 + 1.4, 9); p.headYaw = -0.4 * pulse(t, T.WH3 - 0.2, T.LIGHT, 0.2); }
    const lit = K(t, [[T.LIGHT + 0.3, 0], [T.LIGHT + 0.7, 1]]);
    if (who !== 'pen' && lit > 0) { p.mouth = 'o'; p.lean = -0.1 * lit; p.headPitch = -0.1; }
    const b = t - T.WHOOMPH;
    if (b > 0) {
      const k = Math.exp(-b * 3);
      p.lean = -0.2 - 0.15 * k; p.mouth = 'o'; p.eyes = b > 1.1 && b < 1.25 ? 'closed' : 'open'; p.headPitch = -0.08;
      p.armA = mixArm(REST, A(-0.3, 0.5, -0.4), Math.min(1, b * 6)); p.armB = who === 'pen' ? MIC_B : mixArm(REST, A(-0.3, 0.5, -0.4), Math.min(1, b * 6));
      if (who === 'pen' && b > 0.6) p.mouth = 'smile';
    }
    return p;
  }
  // RESTAURANT — the date at table 0 (along x): Greg at −x facing +x, Penny at +x facing −x, her hand on the cloth
  function pennyDate(t) {
    const p = basePose(); p.eyes = blink(t, 4); p.mouth = 'smile';
    Object.assign(p, { x: DATE_SEAT, z: 0.2, rotY: -PI / 2, y: seatY(0.46), footFwd: 0.42, headPitch: 0.12, headRoll: 0.08 * Math.sin(t * 1.1) });
    p.armB = REST; p.armA = mixArm(REST, READ_A, K(t, [[T.HAND - 0.4, 0], [T.HAND, 1]]));
    const wave = K(t, [[35.25, 0], [35.5, 1]]);
    if (wave > 0) { p.armA = mixArm(READ_A, WAVE_A, wave); p.headPitch = 0.05; p.headYaw = 0.45; p.mouth = t > T.F6 ? 'o' : 'smile'; p.headRoll = 0.1; }
    if (t > T.F11 + 0.2) { p.mouth = 'smile'; p.headRoll = 0.15 * Math.sin(t * 3); }
    return p;
  }
  function gregDate(t) {
    const p = basePose(); p.eyes = blink(t, 1); p.mouth = 'smile';
    Object.assign(p, { x: -DATE_SEAT, z: 0.2, rotY: PI / 2, y: seatY(0.46), footFwd: 0.42, headPitch: 0.15 });
    p.armB = READ_B; p.armA = mixArm(READ_A, A(-1.05, 0.05, -1.1, 0.5), K(t, [[T.HAND, 0], [T.HAND + 0.5, 1]]));
    const shock = K(t, [[T.F6 + 0.1, 0], [T.F6 + 0.35, 1]]);
    if (shock > 0) { p.mouth = 'o'; p.lean = -0.18 * shock; p.armA = mixArm(p.armA, A(-1.6, 0.3, -2.1, 0.6), K(t, [[T.F8, 0], [T.F8 + 0.25, 1]])); }
    return p;
  }
  function waiterPose(t) {
    const p = basePose(); p.eyes = blink(t, 3);
    const w = clamp((t - 34.8) / 2.3);
    Object.assign(p, { x: lerp(1.9, 0.95, w), z: lerp(-1.5, -0.45, w), rotY: -0.65, dist: w * 1.3, speed: t < 37.1 ? 0.6 : 0, mouth: 'smile' });
    p.armA = A(-1.0, 0.45, -1.6, 0.6); p.armB = REST;
    if (t > T.TRAY - 0.25) { p.mouth = 'o'; p.armA = UP_A; p.armB = UP_B; p.lean = -0.15; }
    return p;
  }
  // STADIUM — Greg + Penny in the field crowd facing the stage (−x): the hug, the paywall, the T-pose fling, the crowd-surf
  function gregKiss(t) {
    const p = basePose(); p.eyes = blink(t, 2);
    Object.assign(p, { x: CX, z: CZ - 0.3, rotY: -PI / 2, headPitch: -0.22, mouth: 'smile' });
    p.armA = REST; p.armB = REST;
    if (t > 39.0) { p.mouth = 'o'; p.armB = mixArm(REST, A(-2.5, 0.6, -0.6), pulse(t, 39.1, 40.4, 0.25)); }
    const hug = K(t, [[T.HUG - 0.35, 0], [T.HUG, 1]]);
    if (hug > 0) { p.rotY = lerp(-PI / 2, PI / 2 + 0.35, hug); p.x = CX - 0.17 * hug; p.z = lerp(CZ - 0.3, CZ - 0.12, hug); p.armA = mixArm(REST, HUG_A, hug); p.armB = mixArm(REST, HUG_B, hug); p.eyes = 'closed'; p.mouth = 'smile'; p.headRoll = 0.22 * hug; p.headPitch = 0.05; p.lean = 0.1 * hug; }
    const f = t - T.FLING;
    if (f > 0) {   // flung up and left onto the crowd's hands, then surfed away
      const tf = T.CATCH - T.FLING, u = Math.min(1, f / tf), v0 = (2.0 + 4.9 * tf * tf) / tf, s = Math.max(0, f - tf);
      const y = f < tf ? v0 * f - 4.9 * f * f : 2.0 + 0.06 * Math.sin(s * 9);
      Object.assign(p, { x: CX - 0.17 + 0.67 * u + 0.45 * s, z: CZ - 0.12 - 1.28 * u - 0.5 * s, y, floor: y, tilt: -Math.min(PI / 2, u * 2.2), rotY: PI / 2 + 0.35 + 1.0 * u, mouth: 'o', eyes: 'open', headPitch: 0.2, lean: 0 });
      p.armA = UP_A; p.armB = UP_B;
      if (t > T.PAID - 0.4) { p.armB = A(-1.15, 0.14, -1.55, -0.5); p.mouth = t > T.PAID ? 'flat' : 'o'; }
    }
    return p;
  }
  function pennyKiss(t) {
    const p = basePose(); p.eyes = blink(t, 5);
    Object.assign(p, { x: CX, z: CZ + 0.3, rotY: -PI / 2, headPitch: -0.22, mouth: 'smile' });
    p.armA = REST; p.armB = REST;
    if (t > 39.0) p.armA = mixArm(REST, A(-2.5, 0.6, -0.6), pulse(t, 39.3, 40.5, 0.25));
    const hug = K(t, [[T.HUG - 0.35, 0], [T.HUG, 1]]);
    if (hug > 0) { p.rotY = -PI / 2 - 0.35 * hug; p.x = CX + 0.17 * hug; p.z = lerp(CZ + 0.3, CZ + 0.1, hug); p.armA = mixArm(REST, HUG_A, hug); p.armB = mixArm(REST, HUG_B, hug); p.eyes = 'closed'; p.headRoll = -0.22 * hug; p.lean = 0.1 * hug; p.mouth = 'smile'; }
    // the trial ends: she snaps into the default T-pose (blank face), which throws him off
    const snap = K(t, [[T.PAY + 0.08, 0], [T.FLING, 1]], (u) => u);
    if (snap > 0 && t < T.UNFREEZE) { p.armA = mixArm(p.armA, TPOSE_A, snap); p.armB = mixArm(p.armB, TPOSE, snap); p.lean = 0; p.headRoll = 0; p.headPitch = 0; p.eyes = 'open'; p.mouth = 'flat'; p.rotY = lerp(p.rotY, -PI / 2, snap); }
    if (t >= T.UNFREEZE) { p.rotY = -PI / 2 - 0.5; p.mouth = 'smile'; p.armA = mixArm(REST, A(-2.5, 0.6, -0.6), pulse(t, T.UNFREEZE, 44.6, 0.2)); p.headYaw = -0.6; p.headPitch = -0.15; }
    return p;
  }
  // the fans around them; the six on their left catch Greg and pass him along
  const NEAR = [[0.5, -1.0], [0.05, -1.85], [0.95, -1.95], [1.45, -1.2], [1.65, -2.45], [0.6, -2.75], [1.25, 0.65], [2.2, 0.2], [0.95, 1.55], [2.45, 1.35]];
  function fanPose(t, i) {
    const [dx, dz] = NEAR[i], p = basePose(); p.eyes = blink(t, i + 4); p.mouth = 'smile';
    Object.assign(p, { x: CX + dx, z: CZ + dz, rotY: -PI / 2 + 0.15 * Math.sin(i * 2.3), headPitch: -0.2 });
    const cheer = K(t, [[39.0 + i * 0.05, 0], [39.3 + i * 0.05, 1]]);
    p.armA = mixArm(REST, A(-1.6, 0.4, -0.6), 0.3 * cheer); p.armB = mixArm(REST, A(-1.6, 0.4, -0.6), 0.3 * cheer);
    if (t > T.PAY) { p.mouth = 'o'; p.rotY = faceToward(CX + dx, CZ + dz, CX + 0.17, CZ + 0.1); p.headPitch = -0.15; }
    if (t > T.FLING + 0.2 && i < 6) { p.armA = UP_A; p.armB = UP_B; p.headPitch = -0.6; p.mouth = 'smile'; }
    return p;
  }
  // LIVING ROOM (day 9) — Greg in the middle of the room; 12 Pennys all over it
  function gregUpdate(t) {
    const p = basePose(); p.eyes = blink(t, 8); p.mouth = t > CLONE_T[2] ? 'o' : 'flat';
    Object.assign(p, { x: 0.92, z: 1.01, rotY: 1.0, headYaw: 0.4 * Math.sin(Math.max(0, t - CLONE_T[0]) * 4) * K(t, [[CLONE_T[0], 0], [CLONE_T[0] + 0.4, 1], [T.WH4, 0]]) });
    p.armA = mixArm(REST, HEAD_A, K(t, [[CLONE_T[5], 0], [CLONE_T[5] + 0.3, 1]])); p.armB = mixArm(REST, HEAD_B, K(t, [[CLONE_T[5], 0], [CLONE_T[5] + 0.3, 1]]));
    const hit = clamp((t - T.TOSS - 0.35) / 0.4);
    if (hit > 0) { p.crouch = 0.25 * hit; p.lean = 0.35 * hit; p.armA = HEAD_A; p.armB = HEAD_B; p.eyes = 'closed'; }
    return p;
  }
  function clonePose(t, i) {
    const p = basePose(); p.eyes = blink(t, i * 1.3 + 2);
    const isHero = i < 0, [x, z, y0, sit] = isHero ? [1.48, 0.98, 0, 0] : CLONES[i], ry = faceToward(x, z, 2.6, 2.1) + (isHero ? -0.5 : 0.25 * Math.sin(i * 1.7));
    const t0 = isHero ? 0 : CLONE_T[i];
    Object.assign(p, { x, z, y: y0, floor: y0, rotY: ry, scale: isHero ? 1 : Math.max(0.001, boing(t, t0, 0.3)), mouth: 'smile' });
    if (sit) Object.assign(p, { y: seatY(0.45), footFwd: 0.42 });
    p.armA = REST; p.armB = MIC_B;
    // everyone whispers the same line at once
    if (t > T.WH4 - 0.1 && t < T.TOSS) { p.mouth = talk(t, T.WH4, T.WH4 + 1.4, 8); p.lean = 0.1; p.headRoll = (i % 2 ? 0.15 : -0.15); }
    const toss = K(t, [[T.TOSS - 0.25, 0], [T.TOSS, 1], [T.TOSS + 0.35, 0.3]]);
    if (toss > 0) p.armA = mixArm(REST, OFFER_A, toss);
    return p;
  }
  // STREET (+1 year) — five couples walk toward the lens down the sidewalk; the AI partner freezes, the human gets yanked
  const COUPLES = [[10.4, 0], [8.2, 1], [6.1, 2], [4.0, 3], [2.0, 4]];
  const ZH = -1.1, ZA = -1.75;
  function streetPose(t, i, ai) {
    const [x0, k] = COUPLES[i], p = basePose(); p.eyes = blink(t, i * 2 + (ai ? 1 : 0)); p.mouth = 'smile';
    const v = 0.9, tw = Math.min(t, T.OUT) - 49.8, x = x0 + v * tw;
    Object.assign(p, { x, z: ai ? ZA : ZH, y: SH, floor: SH, rotY: PI / 2, dist: x - x0, speed: v, headYaw: ai ? -0.35 : 0.35 });
    p.armA = ai ? A(0.0, 0.25, -0.2) : REST; p.armB = ai ? REST : A(0.0, 0.25, -0.2);
    if (t > T.OUT) {
      if (ai) { p.speed = 0; p.mouth = 'flat'; p.eyes = 'open'; p.headYaw = 0; }
      else {
        const a = t - T.OUT, step = Math.min(a, 0.3);
        p.x = x + v * step; p.dist = p.x - x0; p.speed = a < 0.3 ? v : 0; p.mouth = 'o';
        const fall = clamp((t - T.YANK) / 0.35);
        if (fall > 0) { p.tilt = -1.5 * fall * fall; p.y = SH + 0.1 * fall; p.speed = 0; p.armA = UP_A; p.armB = A(-0.3, 1.2, -0.2); p.eyes = 'closed'; }
      }
    }
    void k; return p;
  }
  // PODIUM — the spokesperson at the lectern; four reporters in the front rows
  function spoxPose(t) {
    const p = basePose(); p.eyes = blink(t, 3);
    Object.assign(p, { x: 0, z: -3.08, y: 0.25, floor: 0.25, rotY: 0, headPitch: -0.02, mouth: talk(t, T.ISSUE, T.PFREEZE, 10) });
    p.armA = A(-0.75, 0.15, -0.9, 0.5); p.armB = A(-0.75, 0.15, -0.9, -0.5);
    if (t > T.PFREEZE) { p.mouth = 'o'; p.eyes = 'open'; }
    return p;
  }
  const PRESS = [[-1.0, 0.6], [-1.0, 1.5], [-1.0, 2.4], [-1.0, 3.3], [-1.8, 1.5], [-1.8, 2.4], [-1.8, 3.3], [-2.6, 1.5], [-2.6, 2.4], [-2.6, 3.3]];
  function pressPose(t, i) {
    const [x, z] = PRESS[i], p = basePose(); p.eyes = blink(t, i + 1);
    Object.assign(p, { x, z, rotY: PI + 0.25 * Math.sign(-x) * (0.4 + 0.2 * (i % 3)), y: seatY(0.48), footFwd: 0.42, headPitch: -0.05, mouth: 'flat' });
    p.armA = i % 3 === 0 ? HOLD_A : REST; p.armB = i % 3 === 0 ? HOLD_B : i % 3 === 1 ? A(-2.7, 0.35, -0.3) : REST;
    // the spokesperson freezes: every reporter recoils, mouth open (a few grab their heads)
    const shock = K(t, [[T.PFREEZE + 0.15 + 0.04 * i, 0], [T.PFREEZE + 0.35 + 0.04 * i, 1]]);
    if (shock > 0) { p.mouth = 'o'; p.eyes = 'open'; p.lean = -0.18 * shock; p.headPitch = -0.1; if (i % 3 === 2) { p.armA = mixArm(REST, HEAD_A, shock); p.armB = mixArm(REST, HEAD_B, shock); } }
    return p;
  }
  // KITCHEN (+3 years) — the reset + the cake drop; then the summary + the fridge
  function gregReset(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'smile';
    Object.assign(p, { x: KG.x, z: KG.z, rotY: -1.1, headYaw: -0.1, headPitch: 0.05 });
    p.armA = CAKE_A; p.armB = CAKE_B;
    if (t > T.WH5 + 0.6) p.mouth = 'o';
    const drop = K(t, [[T.CAKE - 0.15, 0], [T.CAKE + 0.2, 1]]); if (drop > 0) { p.armA = mixArm(CAKE_A, A(-0.4, 0.5, -0.4, 0.3), drop); p.armB = mixArm(CAKE_B, A(-0.4, 0.5, -0.4, -0.3), drop); }
    if (t > T.SPLAT) { p.headPitch = 0.35; p.mouth = 'flat'; }
    if (t > 60.4) {   // the summary + she leaves: he watches her go
      p.armA = REST; p.armB = REST; p.mouth = t > T.FWALK + 0.4 ? 'o' : 'flat'; p.headPitch = 0.0;
      const gone = K(t, [[T.GRAB, 0], [T.GRAB + 1.0, 1]]); p.rotY = lerp(-1.1, -0.5, gone); p.headYaw = lerp(-0.1, -0.5, gone);
      if (t > T.TOAST + 0.2) { p.rotY = lerp(-0.5, -2.2, K(t, [[T.TOAST + 0.2, 0], [T.TOAST + 0.6, 1]])); p.headYaw = 0; p.mouth = 'o'; }
    }
    return p;
  }
  const FR_APP = [[FR.x, FR.z], [-1.0, 0.25]], FR_EXIT = [[-1.0, 0.25], [-1.4, 1.6], [-1.6, 3.8]], PEN_EXIT = [[KP.x, KP.z], [-0.45, 1.7], [-0.6, 3.9]];
  function along(pts, d) { let a = 0; for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L1 = Math.hypot(x1 - x0, z1 - z0); if (d <= a + L1 || i === pts.length - 2) { const u = clamp((d - a) / L1); return { x: lerp(x0, x1, u), z: lerp(z0, z1, u), h: Math.atan2(x1 - x0, z1 - z0) }; } a += L1; } return { x: pts[0][0], z: pts[0][1], h: 0 }; }
  function pennyReset(t) {
    const p = basePose(); p.eyes = blink(t, 6);
    Object.assign(p, { x: KP.x, z: KP.z, rotY: 0.8, mouth: 'flat', headPitch: 0 });
    p.armA = REST; p.armB = REST;
    if (t < T.BOOT) { p.eyes = 'open'; p.headPitch = 0.1; }
    else { p.mouth = talk(t, T.WH5, T.WH5 + 1.8, 11); p.headYaw = 0.25; p.armB = mixArm(REST, A(-2.5, 0.6, -0.6), pulse(t, T.WH5, T.WH5 + 1.2, 0.2)); }
    if (t > 60.4) {
      p.mouth = talk(t, T.SUM, T.SUM + 1.0, 11); p.headYaw = 0.25; p.armB = mixArm(REST, A(-1.3, 0.5, -0.7, -0.2), pulse(t, T.SUM, T.FWALK, 0.25));
      if (t > T.FWALK) { p.rotY = lerpAngle(0.8, -2.3, K(t, [[T.FWALK, 0], [T.FWALK + 0.4, 1]])); p.mouth = 'smile'; p.headYaw = 0; }
      if (t > T.GRAB) { const d = (t - T.GRAB) * 1.1, w = along(PEN_EXIT, d); Object.assign(p, { x: w.x, z: w.z, rotY: w.h, dist: d, speed: 1.1, mouth: 'smile', headYaw: -0.5 }); p.armB = REST; p.armA = A(-0.25, 0.45, -0.3, 0); }
    }
    return p;
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = 0.03; studio.fill.intensity = 0.5;
    ALL.forEach((r) => { r.root.visible = false; r.root.scale.setScalar(1); }); mics.forEach((m) => (m.g.visible = false));
    crowd.forEach((c) => outfit(c, c.base.top, c.base.pants)); SOOT.forEach((r) => soot(r, 0));
    uiReq.length = 0; ALL_UI.forEach((b) => b.setPop(0)); paywall.setPop(0); v4.setPop(0); sumCard.setPop(0); zs.forEach((z) => z.setPop(0));
    pillN = 0; spinN = 0; sparkN = 0; heartN = 0; sparkles.forEach((s) => (s.visible = false)); hearts.forEach((h) => (h.visible = false));
    puffN = 0; bfN = 0; flash = 0; puffs.hide(); bfire.hide(); confN = 0;
    phone.g.visible = false; phoneGlow.intensity = 0; handG.visible = false; tray.visible = false; plates.forEach((p) => (p.visible = false));
    annCake.visible = false; splat.visible = false; toasts.forEach((g) => (g.visible = false)); strip.visible = false; sheets.count = 0;
    towerBoxes.forEach((b) => (b.visible = false)); bag.visible = false; bottleM.count = 0; capM.count = 0; ledMat.map = ledMap; ledFrame.visible = false;
    let jolt = 0, camOverride = null;

    if (S === 'liv') {
      liv.setMode(shot.cam === 'update' ? 'evening' : 'night');
      if (shot.cam !== 'update') {
        put(greg, 'liv', gregCouch(t));
        // the phone: in his hands until the pop, then it drops onto the sofa
        const hA = handWorld(greg, -1), hB = handWorld(greg, 1), mid = hA.add(hB).multiplyScalar(0.5);
        phone.g.visible = t < T.FLIP + 0.05 || shot.cam === 'chat';
        phone.g.position.copy(mid).add(_w.set(0, 0.05, 0.06)); phone.g.rotation.set(-1.17, PI, 0);
        const st = t < T.MSG ? 0 : t < T.UPD ? 1 : 2 + Math.min(4, Math.floor((t - T.UPD) / 0.2));
        scrM.map = CHAT[st]; scrM.needsUpdate = true;
        const glow = K(t, [[T.GLOW - 0.1, 0], [T.POP, 1], [T.POP + 0.5, 0.3], [T.LAND + 0.6, 0]]);
        scrM.color.setScalar(0.82 + 1.4 * glow);
        phoneGlow.intensity = shot.cam === 'chat' || t > T.FLIP ? 0 : 0.7 + 5 * glow; phoneGlow.position.copy(phone.g.position).add(_w.set(0, 0.12, 0.3));
        if (shot.cam === 'chat') {
          greg.root.visible = false;
          phone.g.updateMatrixWorld(true);
          const nrm = _w.set(0, 1, 0).applyQuaternion(phone.g.quaternion), c = phone.g.position.clone();
          camOverride = { p: c.clone().addScaledVector(nrm, 0.4).toArray(), a: c.clone().add(_v.set(0, -0.032, 0)).toArray() };
        }
        if (shot.cam === 'pop') {
          put(penny, 'liv', pennyPop(t));
          if (t > T.LAND - 0.1) {
            const mh = holdMic(penny);
            sayB(BUB.hi, headAt(penny, 0.3), t, T.WH1, T.WH1 + 1.85, 0.56);
            tingles(t, T.WH1 + 0.2, T.FLIP, mh, headAt(greg, 0.05), 12, 0.06);
          }
          pillAt(headAt(penny, 0.27 * penny.root.scale.x), t > T.LAND ? 0.13 : 0);
          burst(t, T.POP, L('liv', ...PHONE_SEAT), 140, 3.2, PIX_C, 0.9, 2.0);
          if (t > T.POP && t < T.POP + 0.4) jolt = 0.02 * Math.exp(-(t - T.POP) * 8);
          dust(t, T.LAND, L('liv', PEN0.x, 0.05, PEN0.z), 0.5, 6, 0.8);
          if (t > T.FLIP + 0.5 && t < T.FLIP + 0.9) jolt = Math.max(jolt, 0.012 * Math.exp(-(t - T.FLIP - 0.5) * 8));
          dust(t, T.FLIP + 0.5, L('liv', SOFA.x, 0.95, SOFA.z - 0.45), 0.5, 6, 0.9);
        }
      } else {
        // v4.0: the update card, then 11 more Pennys, then the bottle avalanche
        put(greg, 'liv', gregUpdate(t));
        put(penny, 'liv', clonePose(t, -1)); holdMic(penny);
        clones.forEach((c, i) => { if (t > CLONE_T[i]) { put(c, 'liv', clonePose(t, i)); holdMic(c); pillAt(headAt(c, 0.3 * c.root.scale.x), 0.075); dust(t, CLONE_T[i], L('liv', CLONES[i][0], 0.3 + CLONES[i][2], CLONES[i][1]), 0.35, 4, 0.6, new THREE.Color(0xf6d6ec)); } });
        pillAt(headAt(penny, 0.3), 0.08);
        show(v4, L('liv', 0.92, 1.85, 0.6), K(t, [[T.V4, 0], [T.V4 + 0.16, 1.12], [T.V4 + 0.28, 1], [CLONE_T[3], 1], [CLONE_T[3] + 0.25, 0]]), 0.42);
        sayB(BUB.morn, headAt(penny, 0.32), t, T.WH4, T.TOSS + 0.2, 0.56);
        // water bottles: thrown from every Penny, raining onto Greg, then a pile
        let n = 0; const tg = L('liv', 0.92, 0, 1.01);
        [penny, ...clones].forEach((c, i) => {
          for (let j = 0; j < 6 && n < BOTTLES; j++, n++) {
            const t0 = T.TOSS + j * 0.09 + (i % 3) * 0.04, a = t - t0; if (a < 0) { n--; continue; }
            c.root.updateMatrixWorld(true); const from = c.arms[0].hand.getWorldPosition(_w).clone();
            const land = _s.set(tg.x + Math.cos(n * 2.4) * 0.35 * Math.sqrt((n % 9) / 9 + 0.1), 0.06 + 0.07 * ((n * 7) % 5), tg.z + Math.sin(n * 2.4) * 0.3 * Math.sqrt((n % 9) / 9 + 0.1)).clone();
            const tf = 0.55, u = Math.min(1, a / tf);
            const pos = from.clone().lerp(land, u); pos.y += Math.sin(u * PI) * 1.1;
            _q.setFromEuler(_e.set(a * 9 + n, n, a * 6)); if (u >= 1) _q.setFromEuler(_e.set(PI / 2, n * 1.3, 0));
            const lp = liv.root.worldToLocal(pos.clone());
            _m.compose(lp, _q, _w.set(1, 1, 1)); bottleM.setMatrixAt(n, _m); capM.setMatrixAt(n, _m.multiply(new THREE.Matrix4().makeTranslation(0, 0.12, 0)));
          }
        });
        bottleM.count = n; capM.count = n; bottleM.instanceMatrix.needsUpdate = true; capM.instanceMatrix.needsUpdate = true;
        if (t > T.TOSS + 0.5 && t < T.TOSS + 0.9) jolt = 0.01 * Math.exp(-(t - T.TOSS - 0.5) * 6);
      }
    } else if (S === 'kit') {
      kit.setClock(shot.cam === 'dinner' ? 5 : 9, shot.cam === 'dinner' ? 30 : 5);
      fridge.position.set(fx, 0, fz0); fridge.rotation.set(0, 0, 0); fridgeFace.material.map = t > 60.4 && t > T.SUM + 1.2 ? FACE_H : FACE_N;
      if (shot.cam === 'dinner') {
        put(greg, 'kit', gregDinner(t)); put(penny, 'kit', pennyDinner(t)); holdMic(penny); pillAt(headAt(penny, 0.3), 0.07);
        sayB(BUB.q1, headAt(greg, 0.3), t, T.Q1, T.GQ, 0.46);
        sayB(BUB.gq, headAt(penny, 0.3), t, T.GQ, T.CARD + 0.25, 0.46);
        // the list: a card that keeps printing to the floor, then the sheets pile up around Greg
        const h = t < T.CARD ? 0 : lerp(0.62, CARD_H, K(t, [[T.PRINT, 0], [T.PRINT + 1.3, 1]], (u) => u)) * popK(t, T.CARD);
        if (h > 0.01) { strip.visible = true; strip.scale.set(CARD_W * popK(t, T.CARD), h, 1); listTex.repeat.set(1, h / CARD_H); listTex.offset.set(0, 1 - h / CARD_H); strip.position.y = CARD_TOP + 0.02 * Math.sin(t * 2); strip.lookAt(L('kit', 0.4, CARD_TOP - 0.6, 3.6)); }
        let n = 0;
        SHEET.forEach((s) => { const a = t - s.t0; if (a < 0) return; const u = Math.min(1, a / 0.35); _s.set(lerp(CARD_X, s.x, u), lerp(0.1, s.y, u) + Math.sin(u * PI) * 0.25, lerp(CARD_Z, s.z, u)); _q.setFromEuler(_e.set(s.rx * u, s.ry, s.rz * u)); _m.compose(_s, _q, _w.set(1, 1, 1)); sheets.setMatrixAt(n++, _m); });
        sheets.count = n; sheets.instanceMatrix.needsUpdate = true;
        if (t > T.BURY && t < T.BURY + 0.4) jolt = 0.008 * Math.exp(-(t - T.BURY) * 6);
      } else {
        put(greg, 'kit', gregReset(t)); put(penny, 'kit', pennyReset(t));
        if (t < T.BOOT) spinAt(headAt(penny, 0.32), t, 0.07);
        else if (t < T.BOOT + 0.6) show(check, headAt(penny, 0.32), popK(t, T.BOOT) * (1 - K(t, [[T.BOOT + 0.45, 0], [T.BOOT + 0.6, 1]])), 0.07);
        else pillAt(headAt(penny, 0.3), 0.07);
        if (t > T.BOOT && t < T.BOOT + 0.3) burst(t, T.BOOT, headAt(penny, 0.05), 60, 1.6, PIX_C, 0.7, 1.0);
        sayB(BUB.reset, headAt(penny, 0.32), t, T.WH5, T.WH5 + 2.05, 0.5);
        // the cake: in his hands → slides off → SPLAT
        if (t < T.SPLAT) {
          annCake.visible = true; greg.root.updateMatrixWorld(true);
          const mid = handWorld(greg, -1).add(handWorld(greg, 1)).multiplyScalar(0.5).add(_w.set(0, 0.02, 0));
          const a = Math.max(0, t - T.CAKE); annCake.position.set(mid.x + 0.25 * a, Math.max(L('kit', 0, 0.05, 0).y, mid.y - 4.9 * a * a), mid.z + 0.6 * a); annCake.rotation.set(a * 3, 0.3, a * 2);
        } else if (t < 60.4) { splat.visible = true; burst(t, T.SPLAT, L('kit', KG.x + 0.15, 0.08, KG.z + 0.42), 110, 2.2, CAKE_C, 0.8); }
        if (t > T.SPLAT && t < T.SPLAT + 0.35) jolt = 0.01 * Math.exp(-(t - T.SPLAT) * 8);
        if (t >= 60.4) {
          splat.visible = true;
          // summary card
          show(sumCard, L('kit', 0.25, 1.26, 0.6), K(t, [[T.SUM, 0], [T.SUM + 0.16, 1.12], [T.SUM + 0.28, 1], [T.FWALK + 0.1, 1], [T.FWALK + 0.35, 0]]), 0.46);
          // the fridge walks out with her (hopping side to side)
          if (t > T.FWALK) {
            const dA = Math.min(1, (t - T.FWALK) / (T.GRAB - T.FWALK)), app = along(FR_APP, dA * 2.85), dE = Math.max(0, t - T.GRAB) * 1.1, ex = along(FR_EXIT, dE);
            const w = t < T.GRAB ? app : ex, d = t < T.GRAB ? dA * 2.85 : 2.85 + dE, hop = Math.abs(Math.sin(d * 5.5));
            fridge.position.set(w.x, 0.06 * hop, w.z); fridge.rotation.set(0, lerpAngle(0, w.h, Math.min(1, d * 1.5)), 0.08 * Math.sin(d * 5.5));
            dust(t, T.FWALK + 0.05, L('kit', FR.x, 0.1, FR.z + 0.3), 0.35, 4, 0.7);
          }
          if (t > T.SUM + 1.2) for (let k = 0; k < 3; k++) { const a = ((t - T.SUM) * 0.8 + k / 3) % 1; heartAt(fridge.localToWorld(_v.set(0.08 + 0.1 * Math.sin(k * 2 + t), 1.45 + a * 0.6, 0.4)).clone(), 0.09 * Math.sin(a * PI) + 0.02, Math.sin(a * PI)); }
          pillAt(headAt(penny, 0.3), 0.07);
          // the toaster pops two hearts at Greg
          const ta = t - T.TOAST;
          if (ta > 0) toasts.forEach((g, k) => { g.visible = true; const yy = 0.98 + Math.max(0, 1.6 * ta - 4.9 * ta * ta * 0.6); g.position.set(-0.85 + (k - 0.5) * 0.06, Math.max(0.98, yy), -2.38); g.rotation.set(0, 0, ta * 2 * (k - 0.5)); });
          if (ta > 0.15) for (let k = 0; k < 4; k++) { const a = ((ta - 0.15) * 0.7 + k / 4) % 1; heartAt(L('kit', -0.85 + 0.2 * Math.sin(k * 2.1 + t), 1.2 + a * 0.9, -2.3 + a * 1.2), 0.2 * Math.sin(a * PI) + 0.05, Math.min(1, ta * 3) * Math.sin(a * PI)); }
        }
      }
    } else if (S === 'sup') {
      put(greg, 'sup', gregCarry(t)); put(penny, 'sup', pennyCarry(t)); holdMic(penny);
      sayB(BUB.q2, headAt(greg, 0.3).add(_w.set(-0.08, 0, 0)), t, T.Q2, T.NOPE - 0.05, 0.46);
      sayB(BUB.nope, headAt(penny, 0.32), t, T.NOPE, T.TOPPLE + 0.3, 0.52);
      // the tower: on his arms, then each box flies and lands on/around him
      greg.root.updateMatrixWorld(true);
      const base = handWorld(greg, -1).add(handWorld(greg, 1)).multiplyScalar(0.5);
      towerBoxes.forEach((b, i) => {
        b.visible = true; const wob = 0.03 * Math.sin(t * 3 + i) * i * K(t, [[19.6, 0], [T.TOPPLE, 1]]);
        const a = t - T.TOPPLE - i * 0.05;
        if (a < 0) { b.position.copy(sup.root.worldToLocal(base.clone().add(_w.set(0.24 + wob * i, 0.15 + i * 0.275, 0.05)))); b.rotation.set(0, 0.06 * Math.sin(i * 2.3), wob); }
        else { const land = [[-0.3, 0.05], [0.35, -0.2], [0.05, 0.25], [-0.45, -0.45], [0.5, 0.3], [0.1, -0.6]][i], u = Math.min(1, a / 0.6); const start = sup.root.worldToLocal(base.clone().add(_w.set(0.24, 0.15 + i * 0.275, 0.05)));
          b.position.set(lerp(start.x, 0.3 + land[0], u), Math.max(0.05, start.y + 1.2 * a - 6 * a * a), lerp(start.z, SG1 + land[1], u)); b.rotation.set(a * (4 + i), i, a * (3 - i)); if (u >= 1 && b.position.y <= 0.051) b.rotation.set(PI / 2, i * 0.9, 0); }
      });
      if (t > T.FLAT && t < T.FLAT + 0.4) jolt = 0.015 * Math.exp(-(t - T.FLAT) * 8);
      dust(t, T.FLAT, L('sup', 0.3, 0.1, SG1 - 0.5), 0.6, 6, 1.0);
      burst(t, T.TOPPLE + 0.35, L('sup', 0.3, 0.6, SG1), 130, 2.4, CEREAL_C, 0.55);
    } else if (S === 'off') {
      put(boss, 'off', bossPose(t)); put(greg, 'off', shot.cam === 'jobB' ? null : gregJob(t)); put(penny, 'off', pennyJob(t));
      const mh = holdMic(penny);
      if (shot.cam === 'jobB') { penny.root.visible = false; penny.mic.g.visible = false; } else pillAt(headAt(penny, 0.3), 0.07);
      if (bossChair) bossChair.position.z = -1.55 - 0.55 * clamp((t - T.ROLL) / 0.6) ** 2;
      sayB(BUB.well, headAt(penny, 0.3), t, T.WH2, T.WH2 + 1.9, 0.44);
      tingles(t, T.WH2 + 0.3, T.ROLL, mh, headAt(boss, 0.05), 16, 0.05);
      if (t > T.SLEEP) zs.forEach((z, k) => { const a = ((t - T.SLEEP) * 0.45 + k / zs.length) % 1; if (t - T.SLEEP < k * 0.15) return; const hp = t < T.ROLL + 0.3 ? headAt(boss, 0.15) : L('off', 0, 0.95, -1.6); show(z, hp.add(_w.set(0.1 + 0.3 * a + 0.05 * Math.sin(a * 9), a * 0.55, 0.12)), Math.sin(a * PI), 0.05 + 0.05 * a); });
      if (t > T.DROP + 0.18 && t < T.DROP + 0.5) jolt = 0.008 * Math.exp(-(t - T.DROP - 0.18) * 8);
      if (t > T.ROLL + 0.55 && t < T.ROLL + 0.9) jolt = Math.max(jolt, 0.01 * Math.exp(-(t - T.ROLL - 0.55) * 8));
      dust(t, T.ROLL + 0.55, L('off', 0, 0.1, -2.1), 0.4, 5, 0.8);
    } else if (S === 'burb') {
      burb.aimSun(BDAY.x, BDAY.z, 7);
      ['mom', 'dad', 'aunt'].forEach((w, i) => put([mom, dad, aunt][i], 'burb', famPose(t, w)));
      put(greg, 'burb', famPose(t, 'greg')); put(penny, 'burb', famPose(t, 'pen')); holdMic(penny); pillAt(headAt(penny, 0.3), 0.07);
      sayB(BUB.b300, headAt(penny, 0.1).add(_w.set(0.05, 0, 0)), t, T.WH3, T.LIGHT + 0.2, 0.42);
      // the candles light in a sweep, then the whole cake goes WHOOMPH
      const lit = clamp((t - T.LIGHT) / 0.8); let n = 0;
      if (t < T.WHOOMPH + 1.0) CAND.forEach(([x, z], i) => { if (i / CANDLES < lit) { flameM.setMatrixAt(n++, _m.makeTranslation(x, 0.262 + 0.003 * Math.sin(t * 20 + i), z)); } });
      flameM.count = n; flameM.instanceMatrix.needsUpdate = true; cakeLight.intensity = 3 * lit * (t < T.WHOOMPH ? 1 : Math.exp(-(t - T.WHOOMPH) * 2));
      boom(t, T.WHOOMPH, L('burb', BDAY.x, 1.0, BDAY.z - 0.02), 0.7, 14);
      if (t > T.WHOOMPH) SOOT.forEach((r) => soot(r, Math.min(1, (t - T.WHOOMPH) * 8)));
      if (t > T.WHOOMPH && t < T.WHOOMPH + 0.5) jolt = 0.03 * Math.exp(-(t - T.WHOOMPH) * 7);
      balloons.forEach((b, k) => { b.position.y = 2.95 + (k % 3) * 0.12 + 0.03 * Math.sin(t * 1.5 + k); });
    } else if (S === 'rest') {
      rest.update(t); studio.fill.intensity = 0.22; rest.lights.key.intensity = shot.cam === 'dateB' ? 26 : 48;
      if (shot.cam === 'dateB') rest.lights.pends.forEach((l) => (l.intensity *= 0.4));
      put(penny, 'rest', pennyDate(t)); put(greg, 'rest', gregDate(t)); put(waiter, 'rest', waiterPose(t));
      [[2, -2.35, -1.0, PI / 2], [3, 2.15 + 0.62, -1.2, -PI / 2], [4, 2.15 - 0.62, -1.2, PI / 2], [5, 0.62, -2.4, -PI / 2]].forEach(([ci, x, z, ry], k) => { const p = basePose(); p.eyes = blink(t, k + 2); Object.assign(p, { x, z, rotY: ry, y: seatY(0.46), footFwd: 0.42, mouth: t > T.TRAY + 0.1 ? 'o' : talk(t, 33 + k, 35 + k, 7), headYaw: t > T.TRAY + 0.1 ? 0.6 * (k % 2 ? 1 : -1) : 0 }); p.armA = READ_A; p.armB = READ_B; put(crowd[ci], 'rest', p); });
      // Penny's hand: a flat palm on the cloth with fingers that keep sprouting (fingers point at Greg, −x)
      penny.root.updateMatrixWorld(true); const hw = handWorld(penny, -1);
      handG.visible = t > T.HAND - 0.2; handG.scale.setScalar(1.35); handG.rotation.order = 'YXZ';
      const wv = K(t, [[35.25, 0], [35.5, 1]]);
      if (wv < 0.5) { handG.position.set(hw.x - 0.02, L('rest', 0, 0.778, 0).y, hw.z); handG.rotation.set(0, -PI / 2, 0); }
      else { handG.position.copy(hw).add(_w.set(0, 0.05, 0)); const cp = studio.camera.position; handG.rotation.set(-PI / 2 + 0.15 * Math.sin(t * 7), Math.atan2(-(cp.x - hw.x), -(cp.z - hw.z)), 0.25 * Math.sin(t * 8)); }
      const order = [1, 3, 5, 7, 9, 0, 10, 2, 8, 4, 6];
      order.forEach((fi, j) => { const piv = fingers[fi]; const s = j < 5 ? 1 : (t < FINGERS[j - 5] ? 0.001 : boing(t, FINGERS[j - 5], 0.28)); piv.scale.setScalar(Math.max(0.001, s)); });
      penny.arms[0].hand.visible = false;
      // the waiter's tray → crash
      waiter.root.updateMatrixWorld(true); const th = handWorld(waiter, -1);
      const ta = t - T.TRAY;
      tray.visible = true; plates.forEach((p) => (p.visible = true));
      if (ta < 0) { tray.position.copy(th).add(_w.set(0, 0.06, 0)); tray.rotation.set(0, 0, 0); plates.forEach((p, k) => { p.position.copy(tray.position).add(_w.set((k - 0.5) * 0.2, 0.015, 0)); p.rotation.set(0, 0, 0); }); }
      else { const fl = L('rest', 0, 0.01, 0).y; tray.position.set(th.x + 0.3 * ta, Math.max(fl, th.y + 0.06 + 2.5 * ta - 4.9 * ta * ta), th.z + 0.2 * ta); tray.rotation.set(ta * 6, 0, ta * 4); plates.forEach((p, k) => { p.position.set(th.x + (k - 0.5) * 0.5 * ta * 2, Math.max(fl + 0.01, th.y + 0.1 + 3 * ta - 4.9 * ta * ta), th.z + 0.3 * ta * (k ? 1 : -1)); p.rotation.set(ta * 8 * (k ? 1 : -1), 0, ta * 5); p.visible = !(p.position.y <= fl + 0.011 && ta > 0.4); }); }
      burst(t, T.TRAY + 0.62, L('rest', 1.25, 0.05, -0.3), 90, 1.8, PLATE_C, 0.8);
    } else if (S === 'stad') {
      put(greg, 'stad', gregKiss(t)); put(penny, 'stad', pennyKiss(t));
      NEAR.forEach((_, i) => put(crowd[i], 'stad', fanPose(t, i)));
      if (t < T.PAY || t > T.UNFREEZE) pillAt(headAt(penny, 0.3), shot.cam === 'kissB' ? 0.06 : 0);
      else spinAt(headAt(penny, 0.32), t, 0.05);
      const cheer = K(t, [[39.0, 0], [39.4, 1]]);
      stad.updateFans(t, (f) => {
        if (f.field && Math.abs(f.z - CZ) < 2.6 && f.x > CX - 6 && f.x < CX + 4.2) return { y: -20 };
        if (f.field && shot.cam === 'kissA' && Math.abs(f.z - CZ) < 1.7 && f.x > CX && f.x < CX + 9) return { y: -20 };
        return { y: 0, arms: Math.max(0.15 * Math.sin(t * 2 + f.seed * 9) + 0.1, cheer * (t > T.PAY ? 0.4 : 1)), sway: 0.08 * Math.sin(t * 2.2 + f.seed * 7) };
      });
      show(paywall, headAt(penny, 0.22).add(_w.set(0, 0, 0.36)), K(t, [[T.PAY, 0], [T.PAY + 0.16, 1.12], [T.PAY + 0.28, 1], [T.CATCH + 0.1, 1], [T.CATCH + 0.3, 0]]), shot.cam === 'kissB' ? 0.42 : 0);
      if (t > T.FLING && t < T.FLING + 0.4) jolt = 0.025 * Math.exp(-(t - T.FLING) * 7);
      // the kiss cam feed: searches the crowd, finds them, zooms in
      const find = K(t, [[T.FIND, 0], [T.FIND + 0.45, 0.55], [T.FIND + 0.85, 1.06], [T.FIND + 1.1, 1]]);
      const tz = lerp(CZ + 4.2, CZ, find), fov = lerp(34, 22, K(t, [[T.FIND + 1.1, 0], [T.FIND + 1.9, 1]]));
      kissCam.position.copy(L('stad', CX - 3.4, 1.72, tz)); kissCam.lookAt(L('stad', CX, 1.55, tz)); kissCam.fov = fov; kissCam.updateProjectionMatrix();
      studio.renderer.setRenderTarget(rt); studio.renderer.render(scene, kissCam); studio.renderer.setRenderTarget(null);
      ledMat.map = rt.texture; ledFrame.visible = true;
      if (t > T.HUG && t < T.PAY) for (let k = 0; k < 6; k++) { const a = ((t - T.HUG) * 1.2 + k / 6) % 1; heartAt(L('stad', CX - 0.3, 2.0 + a * 0.6, CZ + (k - 2.5) * 0.18), 0.09 * Math.sin(a * PI) + 0.03, Math.sin(a * PI)); }
    } else if (S === 'street') {
      street.aimSun(6, -1.4, 9);
      COUPLES.forEach((_, i) => {
        const h = crowd[i], a = crowd[i + 5];
        put(h, 'street', streetPose(t, i, false)); put(a, 'street', streetPose(t, i, true));
        if (t < T.OUT) pillAt(headAt(a, 0.3), 0.12); else spinAt(headAt(a, 0.34), t + i * 0.07, 0.13);
        dust(t, T.YANK + 0.32, L('street', COUPLES[i][0] + 0.9 * (T.OUT - 49.8) + 0.27 - 1.2, SH + 0.05, ZH), 0.35, 4, 0.7);
      });
      if (t > T.YANK + 0.32 && t < T.YANK + 0.7) jolt = 0.01 * Math.exp(-(t - T.YANK - 0.32) * 7);
    } else if (S === 'pod') {
      pod.setFlashes(t, 3.5);
      // the reverse: right-hand flashes would be 0.9 m blobs by the lens, back-row ones bloom under the HUD, so they stay off
      podFlashes.forEach((f) => { f.scale.setScalar(shot.cam === 'pressB' ? 0.4 : 0.9); if (shot.cam === 'pressB' && (f.position.x > 0 || f.position.z > 2.0)) f.material.opacity = 0; });
      put(spox, 'pod', spoxPose(t));
      PRESS.forEach((_, i) => put(crowd[6 + i], 'pod', pressPose(t, i)));
      sayB(BUB.issue, headAt(spox, 0.28), t, T.ISSUE, 54.75, 0.46);
      if (t > T.PFREEZE) spinAt(headAt(spox, 0.3), t, 0.1);
    }

    conf.count = confN; conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true;
    boomLight.intensity = 40 * flash;

    // camera (local → world)
    const c = CAMS[shot.cam], o = OFF[S];
    let P, Aim;
    if (camOverride) { P = camOverride.p; Aim = camOverride.a; }
    else if (c.fn) { const r = c.fn(t); P = r.p.map((v, i) => v + o[i]); Aim = r.a.map((v, i) => v + o[i]); }
    else {
      const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    }
    if (jolt) { P = [P[0] + jolt * Math.sin(t * 70), P[1] + jolt * Math.sin(t * 55), P[2]]; }
    setCamera(P, Aim, c.fov, t, c.amp);
    // bubbles, cards, pills: sized for the lens AFTER the camera moved (dh005 rule)
    for (const [b, pos, k, frac] of uiReq) { const d = studio.camera.position.distanceTo(pos); b.sprite.position.copy(pos); b.setPop(k * frac * frameW(d)); }
  }
  return { update };
}
