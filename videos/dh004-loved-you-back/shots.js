// VIDEO dh004 — "What if she loved you back?"  (tone FUNNY). 68.8 s, 10 beats, 12 sets.
// v3: her "yes" is a cosmic event. The cloud explodes, a pink
// shockwave crosses the planet, every bird on Earth faints out of the sky, the Friend Zone blows up (you walk away in
// sunglasses), the boys cry the living room into a flood, Grandma rockets through the library roof, the SAD FM tower blows
// up and falls, a meteor shower ends the world outside your first date (nobody notices), the kiss launches the stadium,
// the birds come back for the wedding, and 60 years later the moon still has a heart-shaped dent. Cartoon only: birds faint
// (X eyes), nobody is hurt.
// The joke is on "you" and sad-boy culture, never on her: she's warm and in on it (she says yes, she kisses you on the kiss
// cam, she laughs at all three jokes for 60 years). The premise you can SEE: your personal rain cloud (a little gray cloud
// with a face that rains on your head) gets laid off, and comes back three years later raining petals.
// HUD = your heart rate (BPM); the stat line is a running joke per beat. Real bits: the max-heart-rate rule of thumb
// "220 − age" (Fox & Haskell 1971, still the common formula; at 19 → 201); 60 years of one joke a day = 21,915 days
// (60 × 365 + 15 leap days). The rest of the numbers are jokes on purpose.
//
// Shot list (seconds)                                    | set      | what happens
//  0.0– 5.9  bedA    TUESDAY 3:07 AM (title over it)       | bedroom  | you sit up in bed in the phone glow; your rain cloud rains on your head
//  5.9– 8.0  phone   POV                                   | bedroom  | "Seen 2:14 AM" … typing … "yes 🙂" (music enters on it)
//  8.0– 9.7  bedB                                          | bedroom  | you spring up, bounce, BONK the ceiling (dust); the cloud dodges, rain stops
//  9.7–13.0  plan                                          | bedroom  | the corkboard: IF SHE SAYS NO (a full plan) / IF SHE SAYS YES ("???"); you lean in, panic
// 13.0–15.6  porchA  +5 HOURS 8:12 AM                      | suburb   | you step out; the cloud stops raining, a cardboard box drops under it, it floats away
// 15.6–18.2  porchB                                        | suburb   | sky POV: you look up for the first time since ninth grade, arms wide
// 18.2–23.4  fz      +1 DAY                                | street   | THE FRIEND ZONE (CLOSING DOWN): you walk out with a box; the sign swings down and crashes
// 23.4–25.8  chat    +1 DAY 9:40 PM                        | bedroom  | phone POV: THE BOYS group chat floods
// 25.8–28.6  boys                                          | living   | four boys read it, burst into tears (fountains), phones fly, group hug, Mike dives on
// 28.6–31.0  mom     +2 DAYS SUNDAY                        | kitchen  | Mom with a phone at EACH ear, bouncing; the toaster fires toast to the ceiling
// 31.0–33.8  gran                                          | library  | the librarian grandma screams for joy; QUIET PLEASE falls; four readers shush her in sync
// 33.8–36.5  booth   +1 WEEK 3:07 AM                       | radio    | SAD FM: LISTENERS 1 → 0; the DJ's head sinks to the desk
// 36.5–39.0  tower                                         | city     | the SAD FM letters go dark one by one, the beacons die, the D drops and swings
// 39.0–44.2  date    +2 WEEKS FIRST DATE                   | bistro   | time-lapse: you two stare and smile while the diners leave, chairs go up, the clock spins
// 44.2–46.8  kissA   +3 MONTHS                             | stadium  | the giant screen: KISS CAM searches the crowd… and lands on you
// 46.8–49.4  kissB                                         | stadium  | she kisses your cheek; your buddy holds the popcorn alone; the crowd erupts, hearts
// 49.4–54.6  wed     +3 YEARS THE WEDDING                  | wedding  | the cloud comes back (white, bow tie, smiling) and rains petals; the groomsmen faint 4→0
// 54.6–60.4  oldA    +60 YEARS                             | suburb   | sunset bench: three jokes, three laughs (the third one she slaps your knee)
// 60.4–68.8  oldB                                          | suburb   | crane up to the sky; the little cloud sprinkles petals. Fade 64.0, end card 64.6
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, walkLegs, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, HIP_H } from '@engine/rig.js';
import { makePhone, makeRainCloud, makeIceCreamTub, makeMovingBox, makeSpeechBubble, makeBirdFlock } from '@engine/props.js';
import { makeSpritePool, buildSpace } from '@engine/sets/tech.js';
import { buildBedroom, DIMS as BD } from '@engine/sets/bedroom.js';
import { buildSuburb } from '@engine/sets/suburb.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildLibrary } from '@engine/sets/library.js';
import { buildRadio, makeRadioTower, DIMS as RD } from '@engine/sets/radio.js';
import { buildCity, ROOF_Y } from '@engine/sets/city.js';
import { buildRestaurant } from '@engine/sets/restaurant.js';
import { buildStadium } from '@engine/sets/stadium.js';
import { buildWedding, DIMS as WD } from '@engine/sets/wedding.js';

const PI = Math.PI;
const OFF = { city: [0, 0, 0], bed: [1500, 0, 0], burb: [-1500, 0, 0], street: [3000, 0, 0], liv: [-3000, 0, 0], kit: [4500, 0, 0],
  lib: [-4500, 0, 0], radio: [6000, 0, 0], rest: [-6000, 0, 0], stad: [7500, 0, 0], wed: [-7500, 0, 0], space: [0, 0, 40000] };

export const SHOTS = [
  { t0: 0, t1: 5.9, cam: 'bedA', set: 'bed' },
  { t0: 5.9, t1: 7.6, cam: 'phone', set: 'bed' },
  { t0: 7.6, t1: 9.0, cam: 'bedB', set: 'bed' },
  { t0: 9.0, t1: 10.8, cam: 'space', set: 'space' },
  { t0: 10.8, t1: 13.0, cam: 'plan', set: 'bed' },
  { t0: 13.0, t1: 15.6, cam: 'porchA', set: 'burb' },
  { t0: 15.6, t1: 18.2, cam: 'porchB', set: 'burb' },
  { t0: 18.2, t1: 23.4, cam: 'fz', set: 'street' },
  { t0: 23.4, t1: 25.8, cam: 'chat', set: 'bed' },
  { t0: 25.8, t1: 28.6, cam: 'boys', set: 'liv' },
  { t0: 28.6, t1: 31.0, cam: 'mom', set: 'kit' },
  { t0: 31.0, t1: 33.0, cam: 'gran', set: 'lib' },
  { t0: 33.0, t1: 33.8, cam: 'granR', set: 'lib' },
  { t0: 33.8, t1: 36.5, cam: 'booth', set: 'radio' },
  { t0: 36.5, t1: 39.0, cam: 'tower', set: 'city' },
  { t0: 39.0, t1: 44.2, cam: 'date', set: 'rest' },
  { t0: 44.2, t1: 46.8, cam: 'kissA', set: 'stad' },
  { t0: 46.8, t1: 49.4, cam: 'kissB', set: 'stad' },
  { t0: 49.4, t1: 54.6, cam: 'wed', set: 'wed' },
  { t0: 54.6, t1: 57.55, cam: 'oldA', set: 'burb' },
  { t0: 57.55, t1: 60.4, cam: 'oldC', set: 'burb' },
  { t0: 60.4, t1: 68.8, cam: 'oldB', set: 'burb' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- shared choreography numbers
const B = BD.bed, SIT = { x: B.cx, z: -1.95 };       // sitting up against the headboard
const YES = 7.0, POPC = 7.72, JUMP = 8.0, BONK = 8.42;   // her yes · the cloud explodes · you jump · the ceiling
const DOOR = [-2.2, -8.94];                           // suburb lot 0 front door
const FZ = { cx: 5.8, door: 7.21, win: 5.27, z: -3 }; // street: the generic shop at x 3.6–8.0
const SIGN1 = 21.05, SIGN2 = 21.6, SIGN_LAND = 21.88;
const EXP = 19.55;                                    // the Friend Zone explodes
const CX = -24, CZ = 2.0;                             // stadium: where you stand in the field crowd
const KISS = 47.55;
const BENCH = [58, -6.2];
const EPI = new THREE.Vector3(-0.72, 0.38, 0.58).normalize();   // space: where the shockwave starts (your house, night side)
const LIFT = 32.4, CEIL = 32.77;                      // Grandma's liftoff + the ceiling

// camera coords are LOCAL to the shot's set. p/a = [start, end]; fn(t) overrides for tracking shots.
export const CAMS = {
  bedA:   { p: [[1.15, 1.62, 1.55], [0.5, 1.45, 0.2]], a: [[-0.3, 1.5, -1.9], [-0.3, 1.52, -1.9]], fov: 50, amp: 0.004 },
  phone:  { fn: null, fov: 40, amp: 0.0012 },
  bedB:   { p: [[1.35, 1.45, 1.55], [1.3, 1.45, 1.4]], a: [[-0.3, 1.75, -1.5], [-0.3, 1.75, -1.5]], fov: 62, amp: 0.004 },
  space:  { fn: (t) => { const u = K(t, [[9.0, 0], [10.8, 1]]); const d = lerp(1320, 1150, u); return { p: [EPI.x * d + 140, EPI.y * d - 60, EPI.z * d - 120], a: [EPI.x * 120, EPI.y * 120 - 30, EPI.z * 120] }; }, fov: 46, amp: 0 },
  plan:   { p: [[-1.0, 1.52, -1.05], [-0.55, 1.5, -0.85]], a: [[2.0, 1.6, -1.12], [2.0, 1.58, -0.72]], fov: 44, amp: 0.002 },
  porchA: { p: [[-1.25, 0.95, -2.2], [-1.3, 0.95, -2.6]], a: [[-2.15, 1.25, -7.6], [-2.15, 1.3, -7.2]], fov: 58, amp: 0.004 },
  porchB: { p: [[-2.2, 5.0, -5.15], [-2.2, 4.6, -5.25]], a: [[-2.2, 0.6, -5.75], [-2.2, 0.6, -5.85]], fov: 46, amp: 0.003 },
  fz:     { p: [[6.15, 1.8, 6.9], [5.85, 1.72, 5.3]], a: [[5.95, 1.95, -3.0], [5.85, 1.95, -3.0]], fov: 46, amp: 0.004 },
  chat:   { fn: null, fov: 40, amp: 0.0012 },
  boys:   { p: [[1.75, 1.6, 1.35], [1.75, 1.6, 1.05]], a: [[1.75, 1.05, -2.0], [1.75, 1.08, -2.0]], fov: 52, amp: 0.004 },
  mom:    { p: [[-0.35, 1.42, 0.85], [-0.35, 1.4, 0.6]], a: [[-0.35, 1.32, -1.8], [-0.35, 1.32, -1.8]], fov: 48, amp: 0.004 },
  gran:   { fn: (t) => { const up = K(t, [[LIFT, 0], [CEIL + 0.05, 1]]); return { p: [0, lerp(1.42, 1.5, up), lerp(-0.2, -0.05, K(t, [[31.0, 0], [33.0, 1]]))], a: [0, lerp(1.22, 3.05, up), -4.0] }; }, fov: 52, amp: 0.004 },
  granR:  { p: [[0.4, 2.6, -4.5], [0.38, 2.5, -4.4]], a: [[0.0, 0.5, -2.1], [0.0, 0.5, -2.1]], fov: 56, amp: 0.004 },
  booth:  { p: [[-0.02, 1.42, 2.4], [0.05, 1.38, 1.95]], a: [[-0.02, 1.55, -2.0], [0.05, 1.5, -2.0]], fov: 56, amp: 0.003 },
  tower:  { p: [[8.5, 21.0, 13.2], [7.0, 21.2, 13.0]], a: [[-10.5, 23.2, 12.5], [-10.5, 23.2, 12.5]], fov: 55, amp: 0.01 },
  date:   { p: [[0.05, 1.5, 3.45], [0.05, 1.48, 3.3]], a: [[0.0, 1.1, -0.3], [0.0, 1.1, -0.3]], fov: 54, amp: 0.002 },
  kissA:  { p: [[CX + 6.3, 1.85, CZ + 0.35], [CX + 5.7, 1.85, CZ + 0.3]], a: [[-47, 7.4, 0.3], [-47, 7.4, 0.3]], fov: 50, amp: 0.006 },
  kissB:  { p: [[CX - 3.5, 1.62, CZ + 0.05], [CX - 3.15, 1.62, CZ + 0.05]], a: [[CX, 1.5, CZ + 0.05], [CX, 1.5, CZ + 0.05]], fov: 50, amp: 0.005 },
  wed:    { p: [[-0.95, 2.3, 3.3], [-0.92, 2.25, 2.9]], a: [[-0.95, 1.75, -3.2], [-0.95, 1.75, -3.2]], fov: 54, amp: 0.004 },
  oldA:   { p: [[BENCH[0], 1.12, BENCH[1] + 3.1], [BENCH[0], 1.1, BENCH[1] + 2.8]], a: [[BENCH[0], 1.12, BENCH[1]], [BENCH[0], 1.12, BENCH[1]]], fov: 48, amp: 0.003 },
  oldC:   { p: [[BENCH[0] + 1.55, 1.0, BENCH[1] + 2.45], [BENCH[0] + 1.35, 1.0, BENCH[1] + 2.2]], a: [[BENCH[0] - 0.12, 1.28, BENCH[1]], [BENCH[0] - 0.12, 1.28, BENCH[1]]], fov: 48, amp: 0.003 },
  oldB:   { fn: (t) => { const u = K(t, [[60.4, 0], [64.4, 1]]); return { p: [BENCH[0] + 0.4 * u, lerp(1.12, 2.6, u), BENCH[1] + lerp(2.8, 6.2, u)], a: [BENCH[0], lerp(1.12, 1.02, u), BENCH[1] - 0.4 * u] }; }, fov: 50, amp: 0.003 },
};

// ---------------------------------------------------------------- arm library (tested presets from 002 / 019 / dh001)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const HOLD_A = A(-1.15, 0.14, -1.55, 0.5), HOLD_B = A(-1.15, 0.14, -1.55, -0.5);   // phone in both hands, in front of the face
const READ_A = A(-0.9, 0.12, -1.25, 0.5), READ_B = A(-0.9, 0.12, -1.25, -0.5);     // forearms forward (desk, phone low)
const POCKET_A = A(-0.32, -0.02, -1.25, 0.55), POCKET_B = A(-0.32, -0.02, -1.25, -0.55); // hoodie pocket
const HEAD_A = A(-2.45, 1.2, -2.35, 0.5), HEAD_B = A(-2.45, 1.2, -2.35, -0.5);    // hands on the head
const UP_A = A(-2.75, 0.42, -0.3), UP_B = A(-2.75, 0.42, -0.3);                    // both arms up
const WIDE_A = A(-0.35, 1.25, -0.15), WIDE_B = A(-0.35, 1.25, -0.15);              // arms spread wide
const PHONE_B = A(-1.05, 0.5, -2.55, -0.35), PHONE_A = A(-1.05, 0.5, -2.55, 0.35); // phone to the ear
const MOUTH_B = A(-1.25, 0.05, -2.4, -0.7), MOUTH_A = A(-1.25, 0.05, -2.4, 0.7);   // hand over the mouth / shh
const BOX_A = A(-0.62, -0.05, -1.55, 0.7), BOX_B = A(-0.62, -0.05, -1.55, -0.7);   // hugging a box to the chest
const HUG_A = A(-1.3, 0.3, -1.35, 0.95), HUG_B = A(-1.3, 0.3, -1.35, -0.95);
const CHEST_B = A(-0.05, 0.2, -2.0, -0.9), CHEST_A = A(-0.05, 0.2, -2.0, 0.9);    // hand on the chest
const TELL_B = A(-1.25, 0.55, -0.9, -0.2), TELL_A = A(-1.25, 0.55, -0.9, 0.2);    // a joke: hand out, palm up
const SALUTE_B = A(-1.6, 1.3, -2.3, -0.6);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const seatY = (top) => -0.375 + (top - 0.42);
const pulse = (t, a, b, f = 0.15) => K(t, [[a, 0], [a + f, 1], [b - f, 1], [b, 0]]);

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a, 0x3a4a3a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot; city stays at the origin)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 0, golden: 0, power: 1, milky: 0.25, moon: 1 }); city.setGrowth(0); city.setSnow(0);
  const bed = buildBedroom(studio, {}); bed.root.position.set(...OFF.bed);
  Object.values(bed.decor).forEach((g) => (g.visible = false)); bed.decor.teen.visible = true; bed.crib.visible = false;
  const burb = buildSuburb(studio, { poleClear: [-2.2, 0, 58] }); burb.root.position.set(...OFF.burb);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const liv = buildLivingRoom(studio, {}); liv.root.position.set(...OFF.liv); liv.setMode('night');
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(10, 15);
  const lib = buildLibrary(studio, {}); lib.root.position.set(...OFF.lib);
  const radio = buildRadio(studio, {}); radio.root.position.set(...OFF.radio);
  const rest = buildRestaurant(studio, {}); rest.root.position.set(...OFF.rest);
  const stad = buildStadium(studio, {}); stad.root.position.set(...OFF.stad);
  const wed = buildWedding(studio, {}); wed.root.position.set(...OFF.wed);
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space); space.setSpin(2.2);
  const archTree = wed.root.children.find((o) => o.isGroup && Math.abs(o.position.x) < 1e-6 && Math.abs(o.position.z + 12) < 1e-6); if (archTree) archTree.visible = false;
  const ROOTS = { city: city.root, bed: bed.root, burb: burb.root, street: street.root, liv: liv.root, kit: kit.root, lib: lib.root, radio: radio.root, rest: rest.root, stad: stad.root, wed: wed.root, space: space.root };
  const FOGS = { city: cityFog, bed: null, burb: burb.fog, street: streetFog, liv: null, kit: null, lib: null, radio: null, rest: null, stad: stad.fog, wed: wed.fog, space: null };
  const FAR = { city: 1500, bed: 40, burb: 420, street: 400, liv: 40, kit: 40, lib: 40, radio: 30, rest: 40, stad: 600, wed: 300, space: 6000 };
  const L = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- cast
  const person = (o) => { const p = makePerson(o); scene.add(p.root); return p; };
  const hood = (rig, c) => { rig.hood = mk(new THREE.TorusGeometry(0.115, 0.05, 8, 18), mat(c, 0.92), rig.spine, 0, 0.5, -0.1); rig.hood.rotation.x = PI / 2 - 0.5; rig.hood.scale.set(1.1, 1, 0.8); };
  const YOU = { skin: 0xeab894, hair: 0x3b2a1e, hairStyle: 'messy' };
  const you = person({ ...YOU, top: 0x5a6680, collar: 0x46516a, pants: 0x2c3140, shoes: 0xe8e4dc });
  hood(you, 0x4f5a73);
  const HER = { skin: 0xc98e6a, hair: 0x7a3a22, hairStyle: 'bob' };
  const her = person({ ...HER, top: 0xe8735a, collar: 0xf6efe4, pants: 0x3a4a6a });
  const groom = person({ ...YOU, top: 0x2a2c34, collar: 0xf6f6f2, pants: 0x2a2c34, shoes: 0x1a1a1a });
  mk(new THREE.BoxGeometry(0.05, 0.22, 0.02), mat(0x9a2a3a, 0.5), groom.spine, 0, 0.41, 0.135).rotation.x = -0.12;
  const bride = person({ ...HER, top: 0xfaf7f2, dress: 0xfaf7f2, pants: 0xfaf7f2 });
  for (let k = 0; k < 9; k++) { const a = -1.3 + k * 0.33; mk(new THREE.SphereGeometry(0.03, 8, 6), mat([0xf7a8c4, 0xffffff, 0xf2c14e][k % 3], 0.6), bride.head.g, Math.sin(a) * 0.13, 0.11 + Math.cos(a) * 0.035, Math.cos(a) * 0.1 - 0.02); }
  const oldYou = person({ skin: 0xeab894, hair: 0xe9e7e3, hairStyle: 'messy', mustache: 0xe9e7e3, glasses: true, top: 0x8a6a4a, collar: 0xf2efe6, pants: 0x6a6a72 });
  const oldHer = person({ skin: 0xc98e6a, hair: 0xeeebe8, hairStyle: 'bob', glasses: true, top: 0xe8735a, collar: 0xf6efe4, pants: 0x5a4a5a });
  const BOYS = [
    { skin: 0x9a6447, top: 0x2f7f5f, pants: 0x2a2a2a, hair: 0x1a1a1a, hairStyle: 'short', glasses: true },
    { skin: 0xf1c3a1, top: 0xd2483f, pants: 0x45607a, hair: 0xd9b46a, hairStyle: 'short', mustache: 0xc9a25a },
    { skin: 0x6e4430, top: 0xf1c24a, pants: 0x34405c, hair: 0x1a1a1a, hairStyle: 'none' },
    { skin: 0xe2ad8c, top: 0x3d7bd9, pants: 0x6b5a48, hair: 0x9a6a3a, hairStyle: 'messy' },
  ];
  const boys = BOYS.map((o) => { const r = person(o); r.base = o; r.glassesOn = !!o.glasses; return r; });
  const suit = (r, on) => { r.mats.top.color.setHex(on ? 0x5d636f : r.base.top); r.mats.pants.color.setHex(on ? 0x5d636f : r.base.pants); };
  const mom = person({ skin: 0xeab894, top: 0x8f6fb8, collar: 0xf4efe6, pants: 0x4a4a5a, hair: 0x5a3a24, hairStyle: 'bob' });
  const gran = person({ skin: 0xf1c8a8, top: 0xc46b7b, collar: 0xf4efe6, pants: 0x6a5a6a, hair: 0xe8e4de, hairStyle: 'bob', glasses: true, headR: 0.14 });
  const dj = person({ skin: 0xd9a37f, top: 0x3a3f52, pants: 0x2a2a2a, hair: 0x2a1d16, hairStyle: 'messy', mustache: 0x2a1d16 });
  const phones = new THREE.Group(); dj.head.g.add(phones);
  { const hm = mat(0x1d1f24, 0.5); const band = mk(new THREE.TorusGeometry(0.15, 0.016, 6, 20, PI), hm, phones, 0, 0.02, 0); band.rotation.y = PI / 2; band.rotation.z = 0; band.rotation.x = 0;
    for (const s of [-1, 1]) { const cup = mk(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), hm, phones, s * 0.145, -0.01, 0); cup.rotation.z = PI / 2; } }
  const waiter = person({ skin: 0xf0c8a8, top: 0xf4f4f2, collar: 0x1d1d22, pants: 0x1d1d22, hair: 0x2a1d16, hairStyle: 'short', mustache: 0x2a1d16 });
  const R = rng(41);
  const crowd = Array.from({ length: 14 }, (_, i) => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const o = { skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[i % TOPS.length], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.22, mustache: style !== 'bob' && R() < 0.25 ? HAIRS[Math.floor(R() * 3)] : null };
    const p = person(o); p.base = o; p.seed = R(); return p;
  });
  const outfit = (rig, top, pants) => { rig.mats.top.color.setHex(top); if (pants !== undefined) rig.mats.pants.color.setHex(pants); };
  const ALL = [you, her, groom, bride, oldYou, oldHer, ...boys, mom, gran, dj, waiter, ...crowd];
  // +60 years: his three jokes, readable (the third is the line he used 60 years ago — THAT JOKE in the HUD)
  const JOKE_TXT = ['Knock knock.', "I'm on a seafood diet.", 'Did it hurt when you fell from heaven?'];
  const jokeB = JOKE_TXT.map((txt) => { const b = makeSpeechBubble({ lines: [txt], maxChars: 18, accent: '#e8735a', soft: true, offX: -0.32, width: 1 }); scene.add(b.sprite); b.sprite.visible = false; return b; });

  // ---------------------------------------------------------------- props
  const cloud = makeRainCloud({ r: 0.3, seed: 3 }); scene.add(cloud.g);
  const phone = makePhone(); scene.add(phone.g);                          // your phone (POV shots + bedroom)
  const scrMesh = phone.g.children.find((o) => o.material === phone.screenMat);
  const scrM = new THREE.MeshBasicMaterial({ color: 0xd0d0d0 }); scrMesh.material = scrM;
  const phoneGlow = new THREE.PointLight(0x9fc0ff, 0, 1.6, 2); scene.add(phoneGlow);
  const mkPhone = (parent, x, y, z) => { const p = makePhone(); parent.add(p.g); p.g.position.set(x, y, z); p.screenMat.emissiveIntensity = 0.6; return p; };

  // phone screens (canvas, MeshBasic so the white bubbles don't bloom — dh001)
  const font = (w, s) => `${w} ${s}px Helvetica, Arial, sans-serif`;
  /** largest font size ≤ s at which every line fits in maxW px (measured, so nothing runs past its card) */
  const fitFont = (g, lines, maxW, w, s) => { g.font = font(w, s); const mw = Math.max(...lines.map((l) => g.measureText(l).width)); return mw > maxW ? Math.floor((s * maxW) / mw) : s; };
  function bubble(g, x, y, w, h, col) { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, 26); g.fill(); }
  function chatScreen(state) {
    return canvasTex(360, 720, (g, w, h) => {
      g.fillStyle = '#0e1014'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e8e8ec'; g.font = font('600', 22); g.textAlign = 'left'; g.fillText('3:07', 26, 36);
      g.fillStyle = '#1b1e24'; g.fillRect(0, 54, w, 92);
      g.fillStyle = '#e8735a'; g.beginPath(); g.arc(58, 100, 28, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = font('bold', 30); g.textAlign = 'center'; g.fillText('M', 58, 111);
      g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = font('bold', 32); g.fillText('Maya', 102, 96); g.fillStyle = '#8a8f99'; g.font = font('500', 20); g.fillText(state < 1 ? 'Active now' : 'typing…', 102, 124);
      const ask = ['would you maybe', 'want to get coffee', 'sometime? haha'], afs = fitFont(g, ask, 236, 'bold', 32);
      g.font = font('bold', afs); const aw = Math.max(...ask.map((l) => g.measureText(l).width)) + 44;
      bubble(g, 342 - aw, 196, aw, 162, '#2f7cf6'); g.fillStyle = '#ffffff'; g.font = font('bold', afs);
      ask.forEach((s, k) => g.fillText(s, 342 - aw + 22, 244 + k * 44));
      g.fillStyle = '#8a8f99'; g.font = font('600', 21); g.textAlign = 'right'; g.fillText('Seen 2:14 AM', 338, 392);
      g.textAlign = 'left';
      if (state === 1) { bubble(g, 20, 430, 120, 68, '#2a2d34'); g.fillStyle = '#c8ccd4'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(52 + k * 28, 464, 8, 0, 7); g.fill(); } }
      if (state >= 2) { const yfs = fitFont(g, ['yes 🙂'], 170, 'bold', 56), yw = g.measureText('yes 🙂').width + 50; bubble(g, 20, 424, Math.max(160, yw), 98, '#2a2d34'); g.fillStyle = '#ffffff'; g.font = font('bold', yfs); g.fillText('yes 🙂', 45, 492); }
    });
  }
  const CHAT = [chatScreen(0), chatScreen(1), chatScreen(2)];
  const GC = [['Dev', 'WHAT'], ['Mike', 'BRO 😭'], ['Jay', 'who is this'], ['Theo', 'NO WAY'], ['Dev', 'we lost him'], ['Mike', '😭😭😭😭']];
  function groupScreen(n) {
    return canvasTex(360, 720, (g, w, h) => {
      g.fillStyle = '#0e1014'; g.fillRect(0, 0, w, h);
      const rows = [{ me: true, txt: 'she said yes' }, ...GC.slice(0, n).map(([who, txt]) => ({ who, txt }))];
      const rowH = (r) => (r.me ? 96 : 112), total = rows.reduce((s, r) => s + rowH(r), 0), y0 = Math.min(178, 700 - total);
      let y = y0;
      rows.forEach((r) => {
        const rfs = fitFont(g, [r.txt], 270, 'bold', 38); g.font = font('bold', rfs); const tw = g.measureText(r.txt).width + 44;
        if (r.me) { bubble(g, 340 - tw, y, tw, 74, '#2f7cf6'); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(r.txt, 362 - tw, y + 50); }
        else { g.fillStyle = '#8a8f99'; g.font = font('600', 20); g.textAlign = 'left'; g.fillText(r.who, 34, y + 18); bubble(g, 20, y + 26, tw, 74, '#2a2d34'); g.fillStyle = '#fff'; g.font = font('bold', rfs); g.fillText(r.txt, 42, y + 76); }
        y += rowH(r);
      });
      g.fillStyle = '#1b1e24'; g.fillRect(0, 0, w, 150); g.fillStyle = '#e8e8ec'; g.font = font('600', 22); g.textAlign = 'left'; g.fillText('9:40', 26, 36);
      g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(58, 100, 28, 0, 7); g.fill(); g.font = font('bold', 28); g.textAlign = 'center'; g.fillText('🐐', 58, 110);
      g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = font('bold', 32); g.fillText('THE BOYS', 102, 96); g.fillStyle = '#8a8f99'; g.font = font('500', 20); g.fillText('Dev, Mike, Jay, Theo', 102, 124);
    });
  }
  const GROUP = Array.from({ length: GC.length + 1 }, (_, n) => groupScreen(n));

  // bedroom: blanket over your legs, the corkboard "plan", the no-kit on the dresser
  const blanket = mk(new THREE.BoxGeometry(1.0, 0.12, 1.42), new THREE.MeshStandardMaterial({ color: 0x6a7ea8, roughness: 0.95 }), bed.root, B.cx, B.top + 0.06, -1.24);
  const legBump = mk(new THREE.CapsuleGeometry(0.17, 0.85, 6, 12), new THREE.MeshStandardMaterial({ color: 0x6a7ea8, roughness: 0.95 }), bed.root, B.cx, B.top + 0.08, -1.3); legBump.rotation.x = PI / 2; legBump.scale.set(1.15, 1, 0.45);
  const boardTex = canvasTex(1024, 760, (g, w, h) => {
    g.fillStyle = '#b98a58'; g.fillRect(0, 0, w, h); const r = rng(5);
    for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,50,20,.18)' : 'rgba(240,200,150,.16)'; g.fillRect(r() * w, r() * h, 3, 3); }
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 26; g.strokeRect(13, 13, w - 26, h - 26);
    g.save(); g.translate(60, 70); g.rotate(-0.02); g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, 500, 620);
    g.fillStyle = '#d2283f'; g.font = font('bold', fitFont(g, ['IF SHE SAYS NO:'], 448, 'bold', 50)); g.fillText('IF SHE SAYS NO:', 26, 74);
    const plan = ['✓ ice cream (2 tubs)', '✓ text "haha all good!!"', '✓ sad playlist', '✓ grow a mustache', '✓ move to Canada', '✓ become a monk'];
    g.fillStyle = '#1d2a4a'; g.font = font('bold', fitFont(g, plan, 448, 'bold', 44));
    plan.forEach((s, k) => g.fillText(s, 26, 160 + k * 74));
    g.restore();
    g.fillStyle = '#d2283f'; g.beginPath(); g.arc(300, 72, 14, 0, 7); g.fill();
  });
  const yesTex = canvasTex(360, 420, (g, w, h) => {
    g.fillStyle = '#ffe66a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d2a4a'; g.font = font('bold', fitFont(g, ['SAYS YES:'], w - 48, 'bold', 46)); g.fillText('IF SHE', 24, 70); g.fillText('SAYS YES:', 24, 126);
    g.fillStyle = '#d2283f'; g.font = font('bold', 150); g.fillText('???', 30, 330); g.beginPath(); g.arc(180, 18, 13, 0, 7); g.fill();
  });
  const board = mk(new THREE.PlaneGeometry(1.15, 0.854), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.85 }), bed.root, 1.985, 1.55, -0.95); board.rotation.y = -PI / 2;
  const yesCard = mk(new THREE.PlaneGeometry(0.405, 0.472), new THREE.MeshStandardMaterial({ map: yesTex, roughness: 0.85, side: THREE.DoubleSide }), bed.root, 1.975, 1.6, -0.62); yesCard.rotation.y = -PI / 2;
  const boardLight = new THREE.PointLight(0xffd9a8, 0, 3.2, 1.6); boardLight.position.set(0.9, 2.1, -0.95); bed.root.add(boardLight);
  const tub = makeIceCreamTub(); bed.root.add(tub); tub.position.set(1.72, 0.9, -1.25);
  const tub2 = makeIceCreamTub(); bed.root.add(tub2); tub2.position.set(1.7, 0.9, -1.0); tub2.rotation.z = 1.4; tub2.position.y = 1.0;
  for (let k = 0; k < 2; k++) mk(new THREE.BoxGeometry(0.24, 0.1, 0.12), mat([0x9fc8e6, 0xe6b8c8][k], 0.8), bed.root, 1.72, 0.95 + k * 0.1, -0.55).rotation.y = k * 0.2;
  // ceiling dust (bonk) + general dust
  const puffs = makeSpritePool(scene, 70, 'smoke'); const puffCol = new THREE.Color(0xf4ede0);
  const sparks = makeSpritePool(scene, 30, 'fire');
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
  let puffN = 0, sparkN = 0;
  function dust(t, t0, pos, s = 1, n = 5, dur = 1.0, col = puffCol) {
    const age = t - t0; if (age < 0 || age > dur) return;
    for (let k = 0; k < n && puffN < puffs.items.length; k++) {
      const a = t0 * 3.7 + k * (2 * PI / n), r = (0.15 + age * 0.9) * s;
      puffs.set(puffN++, _v.set(pos.x + Math.cos(a) * r, pos.y + 0.05 * k + age * 0.35 * s, pos.z + Math.sin(a) * r * 0.6).clone(), (0.35 + age * 1.1) * s, 0.8 * (1 - age / dur) ** 1.4, col);
    }
  }
  function spark(t, t0, pos, s = 1) {
    const age = t - t0; if (age < 0 || age > 0.6) return;
    for (let k = 0; k < 5 && sparkN < sparks.items.length; k++) { const a = k * 1.3 + t0; sparks.set(sparkN++, _v.set(pos.x + Math.cos(a) * age * 1.2 * s, pos.y - age * age * 3 * s + Math.sin(a) * 0.3 * age, pos.z + Math.sin(a) * age * s).clone(), 0.35 * s * (1 - age / 0.6), 1 - age / 0.6); }
  }

  // ---------------------------------------------------------------- the disaster kit (v3): explosions, confetti, birds
  const bfire = makeSpritePool(scene, 110, 'fire'), bsmoke = makeSpritePool(scene, 90, 'smoke'), smokeCol = new THREE.Color(0x4a4448);
  const boomLight = new THREE.PointLight(0xffa04a, 0, 30, 1.6); scene.add(boomLight);
  let bfN = 0, bsN = 0, flash = 0;
  /** a cartoon explosion: a fireball that blooms in 0.45 s and burns out by 1.4 s, then a rising column of dark smoke */
  function boom(t, t0, pos, size = 1, n = 14) {
    const age = t - t0; if (age < 0 || age > 3.4) return;
    const grow = 1 - Math.pow(1 - Math.min(1, age / 0.45), 3);
    for (let k = 0; k < n; k++) {
      const a = k * 2.399 + t0 * 7, el = ((k * 0.618 + t0) % 1) * 2 - 1, r = Math.sqrt(1 - el * el), dx = Math.cos(a) * r, dy = Math.abs(el) * 0.8 + 0.2, dz = Math.sin(a) * r;
      if (age < 1.4 && bfN < bfire.items.length) bfire.set(bfN++, _v.set(pos.x + dx * size * 0.9 * grow, pos.y + dy * size * 0.7 * grow + age * 0.8 * size, pos.z + dz * size * 0.9 * grow).clone(), size * (0.7 + 0.9 * grow) * (1 - Math.max(0, age - 0.6) / 0.8), Math.max(0, 1 - age / 1.4));
      const sa = age - 0.12;
      if (sa > 0 && bsN < bsmoke.items.length) bsmoke.set(bsN++, _v.set(pos.x + dx * size * 1.1 * grow, pos.y + dy * size * 0.8 + sa * 1.3 * size, pos.z + dz * size * 1.1 * grow).clone(), size * (0.9 + sa * 1.1), 0.75 * Math.max(0, 1 - sa / 3.0), smokeCol);
    }
    const f = size * Math.exp(-age * 5); if (f > flash) { flash = f; boomLight.position.copy(pos); }
  }
  /** steady flames + smoke (something still burning after the boom) */
  function flames(t, pos, size = 1, n = 4) {
    for (let k = 0; k < n && bfN < bfire.items.length; k++) { const ph = (t * 1.7 + k / n) % 1; bfire.set(bfN++, _v.set(pos.x + (k - (n - 1) / 2) * 0.45 * size, pos.y + ph * 1.1 * size, pos.z).clone(), size * (0.75 - 0.4 * ph) * (1 + 0.12 * Math.sin(t * 13 + k)), 0.9 * (1 - ph)); }
    for (let k = 0; k < 3 && bsN < bsmoke.items.length; k++) { const ph = (t * 0.35 + k / 3) % 1; bsmoke.set(bsN++, _v.set(pos.x + 0.3 * Math.sin(k * 2 + t * 0.5), pos.y + 1.0 * size + ph * 4.5 * size, pos.z).clone(), size * (0.9 + ph * 2.2), 0.6 * (1 - ph), smokeCol); }
  }
  // confetti / popcorn / debris chips: one instanced burst at a time
  const CONF = 220, confM = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.04, 0.065), confM, CONF);
  conf.frustumCulled = false; conf.castShadow = false; scene.add(conf); let confN = 0;
  const CONF_C = [0xff5fa2, 0xffd166, 0x5ad1ff, 0x9b7bff, 0x6fd88a, 0xffffff].map((c) => new THREE.Color(c)), POP_C = [new THREE.Color(0xfff3c8), new THREE.Color(0xffffff)];
  for (let i = 0; i < CONF; i++) conf.setColorAt(i, CONF_C[i % CONF_C.length]);
  function burst(t, t0, pos, n = 90, spd = 3, pal = CONF_C, scale = 1) {
    const age = t - t0; if (age < 0 || age > 2.2) return;
    for (let k = 0; k < n && confN < CONF; k++) {
      const a = k * 2.399, el = ((k * 0.618) % 1) * 1.6 - 0.3, v = spd * (0.55 + ((k * 0.37) % 1) * 0.6);
      _s.set(pos.x + Math.cos(a) * v * age, pos.y + el * v * age - 3.5 * age * age, pos.z + Math.sin(a) * v * age);
      _q.setFromEuler(_e.set(age * (5 + k % 7), age * (3 + k % 5), k)); _m.compose(_s, _q, _v.set(scale, scale, scale));
      conf.setMatrixAt(confN, _m); conf.setColorAt(confN, pal[k % pal.length]); confN++;
    }
  }
  const flock = makeBirdFlock(240); scene.add(flock.g);
  const BIRD_C = [0x4f86d8, 0xd84f4f, 0xf2c94e, 0x8a6a4a, 0x2a2d34, 0xb8bcc4, 0x6fb05a];
  const BRR = rng(77);
  // the bird rain (+5 hours): 160 birds faint mid-air and drop onto the lawn around you; the first 70 fall near you
  const RAIN = Array.from({ length: 150 }, (_, i) => { const near = i < 45; let x = -2.2 + (BRR() - 0.5) * (near ? 3.6 : 8), z = near ? -5.4 + (BRR() - 0.5) * 3.0 : -8.2 + BRR() * 5.4; if (near && Math.abs(x - -2.15) < 0.45 && z < -4.9 && z > -7.0) x += x < -2.15 ? -0.5 : 0.5; return { t0: 12.2 + BRR() * 5.5, x, z, y0: 6.5 + BRR() * 2.5, spin: (BRR() - 0.5) * 12, roll: BRR() * 6.28, yaw: BRR() * 6.28, c: BIRD_C[i % BIRD_C.length], s: 0.95 + BRR() * 0.35 }; });   // keep your fall line clear
  const groundAt = (x, z) => (x > -3.7 && x < -0.7 && z > -9 && z < -7 ? 0.3 : 0);
  function birdRain(t) {
    for (const b of RAIN) {
      const age = t - b.t0; if (age < 0) continue;
      const g0 = groundAt(b.x, b.z), tf = Math.sqrt((2 * (b.y0 - g0)) / 9.8);
      if (age < tf) { const p = L('burb', b.x, b.y0 - 4.9 * age * age, b.z); flock.add(p.x, p.y, p.z, { rotY: b.yaw, pitch: b.spin * age, roll: b.roll + age * 3, s: b.s, out: true, color: b.c }); }
      else { const a2 = age - tf, p = L('burb', b.x, g0 + 0.22 * Math.exp(-a2 * 6) * Math.abs(Math.sin(a2 * 14)) + 0.17 * b.s, b.z); flock.add(p.x, p.y, p.z, { rotY: b.yaw, roll: PI, s: b.s, out: true, color: b.c }); }
    }
  }
  // the wedding: the birds are back, flying in to make a heart around the cloud
  const HEART = Array.from({ length: 34 }, (_, j) => { const th = (j / 34) * 2 * PI; return [16 * Math.sin(th) ** 3, 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th), BRR() < 0.5 ? -1 : 1, BRR()]; });
  // sunglasses (the Friend Zone walk)
  const shades = new THREE.Group(); you.head.g.add(shades); shades.visible = false;
  { const sm = mat(0x111114, 0.2, { metalness: 0.3 }); for (const sx of [-1, 1]) mk(new THREE.BoxGeometry(0.095, 0.05, 0.02), sm, shades, sx * 0.052, 0.012, 0.128).rotation.y = sx * 0.18; mk(new THREE.BoxGeometry(0.03, 0.012, 0.012), sm, shades, 0, 0.026, 0.136); for (const sx of [-1, 1]) mk(new THREE.BoxGeometry(0.008, 0.012, 0.13), sm, shades, sx * 0.105, 0.02, 0.07); }
  // space: three pink shockwave rings + the flash at your house
  const ringM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff6fb0).multiplyScalar(2.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 160), ringM.clone()); r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), EPI); space.root.add(r); return r; });
  const epiFlash = new THREE.Sprite(new THREE.SpriteMaterial({ map: bfire.items[0].material.map, color: new THREE.Color(1.6, 0.55, 1.4), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })); space.root.add(epiFlash);
  // living room flood
  const water = mk(new THREE.PlaneGeometry(8.4, 5.9), new THREE.MeshStandardMaterial({ color: 0x2f86e0, transparent: true, opacity: 0.8, roughness: 0.05, metalness: 0.15, emissive: 0x0d3a6a, emissiveIntensity: 0.5, depthWrite: false }), liv.root, -1.0, 0, 0); water.rotation.x = -PI / 2; water.castShadow = false;
  const duck = new THREE.Group(); liv.root.add(duck); { const y = mat(0xf2c430, 0.5); mk(new THREE.SphereGeometry(0.11, 14, 10), y, duck, 0, 0.06, 0).scale.set(1, 0.75, 1.25); mk(new THREE.SphereGeometry(0.07, 12, 10), y, duck, 0, 0.17, 0.08); mk(new THREE.ConeGeometry(0.03, 0.06, 8), mat(0xf08a2a, 0.5), duck, 0, 0.16, 0.16).rotation.x = PI / 2; for (const sx of [-1, 1]) mk(new THREE.SphereGeometry(0.012, 6, 5), mat(0x111111, 0.3), duck, sx * 0.03, 0.19, 0.135); }
  const sofa = liv.root.children.filter((o) => o.isMesh && o.material.color && o.material.color.getHex() === 0x8f6aa8).map((m) => ({ m, y: m.position.y }));
  // library: the hole Grandma leaves in the ceiling
  const hole = mk(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0x0a0a0c }), lib.root, 0, 3.735, -4.35); hole.rotation.x = PI / 2; hole.visible = false;
  // the SAD FM tower falls over (pivot at its base)
  const towerPivot = new THREE.Group(); towerPivot.position.set(-10.5, ROOF_Y, 12.5); city.root.add(towerPivot);
  // bistro: meteors streaking down the window + their glow in the room
  const meteorTex = bfire.items[0].material.map;
  const meteors = Array.from({ length: 8 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: meteorTex, color: new THREE.Color(2.0, 1.3, 0.8), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })); sp.visible = false; rest.root.add(sp); return sp; });
  const METEORS = [[40.15, -0.9, 0.9], [40.75, 1.6, -0.7], [41.3, 0.2, 0.6], [41.85, -1.1, 1.1], [42.3, 1.2, -0.9], [42.75, 0.4, 0.5], [43.1, -0.5, 0.9], [43.45, 1.8, -0.6]];
  const meteorLight = new THREE.PointLight(0xff8a3a, 0, 9, 1.6); meteorLight.position.set(0.4, 1.8, -2.6); rest.root.add(meteorLight);
  // stadium: the kiss shockwave ring
  const kissRing = mk(new THREE.TorusGeometry(1, 0.05, 8, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff6fb0).multiplyScalar(1.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), stad.root, CX, 1.1, CZ); kissRing.rotation.x = PI / 2; kissRing.visible = false;
  // +60 years: the moon still has a heart-shaped dent
  const moonTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#e8e2d2'; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill(); const r = rng(12);
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(150,140,125,${0.25 + r() * 0.3})`; g.beginPath(); g.arc(60 + r() * 392, 60 + r() * 392, 8 + r() * 30, 0, 7); g.fill(); }
    g.save(); g.translate(256, 250); g.scale(5.2, 5.2); g.fillStyle = '#8a7a6a'; g.beginPath(); g.moveTo(0, -8); g.bezierCurveTo(0, -18, -22, -18, -22, -4); g.bezierCurveTo(-22, 10, 0, 18, 0, 26); g.bezierCurveTo(0, 18, 22, 10, 22, -4); g.bezierCurveTo(22, -18, 0, -18, 0, -8); g.fill();
    g.strokeStyle = '#f6f0e0'; g.lineWidth = 1.6; g.stroke(); g.restore();
  });
  const moon = mk(new THREE.CircleGeometry(4.2, 48), new THREE.MeshBasicMaterial({ map: moonTex, transparent: true, fog: false, toneMapped: false, color: 0xd8d0c0 }), burb.root, BENCH[0] - 13, 37, BENCH[1] - 95);
  moon.visible = false;

  // suburb: the sunset sky for +60 years
  const burbSky = burb.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 300);
  const daySkyMap = burbSky ? burbSky.material.map : null;
  const sunsetMap = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a4a8a'); gr.addColorStop(0.28, '#8a6aa8'); gr.addColorStop(0.42, '#f29a7a'); gr.addColorStop(0.49, '#ffd08a'); gr.addColorStop(0.5, '#f6e2c0'); gr.addColorStop(1, '#f6e2c0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const lot0 = burb.houses.find((h) => Math.abs(h.doorPos.x - DOOR[0]) < 0.6 && h.doorPos.z < 0) || burb.houses[0];
  const laidBox = cloud.box;

  // street: THE FRIEND ZONE storefront dressing
  const fzG = new THREE.Group(); street.root.add(fzG);
  const fzTex = canvasTex(1024, 190, (g, w, h) => {
    g.fillStyle = '#f7c2d0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c2466a'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#8a2246'; g.font = font('bold', fitFont(g, ['THE FRIEND ZONE'], w - 80, 'bold', 104)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('THE FRIEND ZONE', w / 2, h / 2 + 6);
  });
  const signPivot = new THREE.Group(); signPivot.position.set(FZ.cx, 2.78, FZ.z + 0.1); fzG.add(signPivot);
  const signBody = new THREE.Group(); signPivot.add(signBody);
  mk(new THREE.BoxGeometry(3.6, 0.7, 0.1), mat(0x6a2a40, 0.6), signBody, 0, 0, -0.03);
  mk(new THREE.PlaneGeometry(3.5, 0.65), new THREE.MeshStandardMaterial({ map: fzTex, roughness: 0.6, emissive: 0xffffff, emissiveMap: fzTex, emissiveIntensity: 0.12 }), signBody, 0, 0, 0.025);
  const closeTex = canvasTex(768, 220, (g, w, h) => {
    g.fillStyle = '#ffe14a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d2283f'; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#d2283f'; g.font = font('bold', fitFont(g, ['CLOSING DOWN'], w - 90, 'bold', 104)); g.textAlign = 'center'; g.fillText('CLOSING DOWN', w / 2, 118); g.font = font('bold', fitFont(g, ['EVERYTHING MUST GO'], w - 90, 'bold', 46)); g.fillStyle = '#3a2a1a'; g.fillText('EVERYTHING MUST GO', w / 2, 186);
  });
  const closing = mk(new THREE.PlaneGeometry(2.1, 0.6), new THREE.MeshStandardMaterial({ map: closeTex, roughness: 0.7, emissive: 0xffffff, emissiveMap: closeTex, emissiveIntensity: 0.1 }), fzG, FZ.win, 1.55, FZ.z + 0.07); closing.rotation.z = 0.05;
  const popTex = (n) => canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#fbf6ec'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a2246'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#8a2246'; g.font = font('bold', fitFont(g, ['POPULATION'], w - 36, 'bold', 36)); g.textAlign = 'center'; g.fillText('POPULATION', w / 2, 50); g.fillStyle = n ? '#8a2246' : '#d2283f'; g.font = font('bold', 92); g.fillText(String(n), w / 2, 142); });
  const POP1 = popTex(1), POP0 = popTex(0);
  const popM = new THREE.MeshStandardMaterial({ map: POP1, roughness: 0.7, emissive: 0xffffff, emissiveMap: POP1, emissiveIntensity: 0.15 });
  mk(new THREE.PlaneGeometry(0.62, 0.39), popM, fzG, FZ.door - 0.62, 1.62, FZ.z + 0.07);
  const newGuy = person({ skin: 0xd9a37f, top: 0x6a6f7a, collar: 0x5a5f6a, pants: 0x2a2f3a, hair: 0x2a1d16, hairStyle: 'short' }); hood(newGuy, 0x5f6470);
  const cloud2 = makeRainCloud({ r: 0.22, seed: 9 }); scene.add(cloud2.g);
  const newBox = makeMovingBox(0.4, 0.3, 0.34); scene.add(newBox);
  ALL.push(newGuy);
  const fzBoxes = [[3.95, -2.55, 0], [4.15, -2.6, 0.36], [6.55, -2.5, 0]].map(([x, z, y]) => { const b = makeMovingBox(); b.position.set(x, SH + y, z); b.rotation.y = x * 0.7; fzG.add(b); return b; });
  const DEBRIS_V = [[-2.6, 5.2, 2.4], [-1.2, 6.6, 3.1], [2.4, 5.6, 2.9], [1.6, 4.4, 3.6]];
  const beanbag = mk(new THREE.SphereGeometry(0.38, 16, 12), mat(0x8f6aa8, 0.9), fzG, 6.65, SH + 0.25, -2.25); beanbag.scale.set(1.1, 0.62, 1.0);
  const carryBox = makeMovingBox(0.44, 0.32, 0.36); scene.add(carryBox);
  { const neck = mk(new THREE.BoxGeometry(0.05, 0.5, 0.025), mat(0x6a4a2a, 0.6), carryBox, 0.1, 0.5, 0.0); neck.rotation.z = -0.35; mk(new THREE.BoxGeometry(0.07, 0.1, 0.035), mat(0x3a2a1a, 0.6), neck, 0, 0.27, 0); }
  const fzAwning = street.root.children.find((o) => o.isMesh && Math.abs(o.position.y - 2.75) < 0.01 && Math.abs(o.position.x - (FZ.cx - 4.4 * 0.05)) < 0.06);
  const nearTrees = street.trees.filter((tr) => Math.abs(tr.t.position.x - FZ.cx) < 3.2);

  // living room: four phones that fly
  const boyPhones = boys.map(() => { const p = makePhone(); scene.add(p.g); p.screenMat.emissiveIntensity = 0.9; return p; });
  // tear fountains (instanced drops: two arcs out of each crying head)
  const DROPS = 260, drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.024, 8, 6), new THREE.MeshBasicMaterial({ color: 0x4fa8f0, transparent: true, opacity: 0.85 }), DROPS);
  drops.frustumCulled = false; scene.add(drops); let dropN = 0;
  function tears(t, rig, k = 1) {
    if (k <= 0.01) return;
    rig.root.updateMatrixWorld(true);
    for (const s of [-1, 1]) {
      const eye = rig.head.g.localToWorld(_v.set(s * 0.06, 0.0, 0.12)).clone();
      const side = rig.head.g.localToWorld(_w.set(s * 1, 0.25, 0.3)).sub(rig.head.g.localToWorld(new THREE.Vector3(0, 0, 0))).normalize().clone();
      for (let j = 0; j < 14 && dropN < DROPS; j++) {
        const age = ((t * 2.2 + j / 14) % 1) * 0.5, sp = 0.95 * k;
        _m.compose(_s.copy(eye).addScaledVector(side, sp * age).add(_w.set(0, -3.2 * age * age, 0)), _q.identity(), _v.set(1, 1.5, 1).multiplyScalar(k * (1 - 0.4 * age))); drops.setMatrixAt(dropN++, _m);
      }
    }
  }

  function cloudTears(t, k) {
    if (k <= 0.01 || !cloud.g.visible) return;
    cloud.g.updateMatrixWorld(true);
    for (const sd of [-1, 1]) {
      const eye = cloud.body.localToWorld(_v.set(sd * 0.09, 0.02, 0.3)).clone(), side = _w.set(sd, 0.3, 0.35).normalize().clone();
      for (let j = 0; j < 14 && dropN < DROPS; j++) {
        const age = ((t * 2.4 + j / 14) % 1) * 0.55;
        _m.compose(_s.copy(eye).addScaledVector(side, 0.9 * k * age).add(_w.set(0, -3.0 * age * age, 0)), _q.identity(), _v.set(1, 1.5, 1).multiplyScalar(k * (1 - 0.4 * age))); drops.setMatrixAt(dropN++, _m);
      }
    }
  }
  // kitchen: two phones on Mom's ears + toast
  const momPhones = [-1, 1].map((s) => { const p = makePhone(); mom.arms.find((a) => a.s === s).hand.add(p.g); p.g.position.set(0, -0.06, 0.05); p.g.rotation.set(PI / 2, 0, 0); p.g.scale.setScalar(1.35); p.g.children[0].material = mat(s < 0 ? 0xf28ab0 : 0x5ac8e0, 0.4); return p; });
  void momPhones;
  const TOASTER = [0.3, -2.38], toaster = kit.root.children.find((o) => o.isMesh && Math.abs(o.position.x + 0.85) < 0.01 && Math.abs(o.position.y - 0.95) < 0.01);
  if (toaster) toaster.position.set(TOASTER[0], 0.95, TOASTER[1]);
  const toast = [0, 1].map((k) => mk(new THREE.BoxGeometry(0.11, 0.12, 0.018), mat(0xd09a52, 0.8), kit.root, TOASTER[0] + (k - 0.5) * 0.05, 1.0, TOASTER[1]));
  const steam = makeSpritePool(scene, 10, 'smoke');

  // library: grandma's phone, the sign moved into the shot
  const granPhone = makePhone(); gran.arms.find((a) => a.s === 1).hand.add(granPhone.g); granPhone.g.position.set(0, -0.05, 0.035); granPhone.g.rotation.set(PI / 2, 0, 0);
  lib.sign.position.x = 0.62; const signHome = lib.sign.position.clone();

  // radio: tower on the city rooftop
  const tower = makeRadioTower({ h: 12, letterH: 1.75, signY: 5.0 });
  tower.g.position.set(0, 0, 0); tower.g.rotation.y = PI / 2; towerPivot.add(tower.g);

  // (the pivot is created with the disaster kit below; attach after it exists)
  // restaurant: a wall clock (spins through four hours) + the waiter's mop
  const clockG = new THREE.Group(); clockG.position.set(1.62, 2.3, -3.5); rest.root.add(clockG);
  mk(new THREE.CircleGeometry(0.26, 32), mat(0xfbf8f0, 0.6), clockG, 0, 0, 0.0);
  mk(new THREE.TorusGeometry(0.26, 0.025, 8, 32), mat(0x3a2a1a, 0.4), clockG, 0, 0, 0.0);
  for (let k = 0; k < 12; k++) mk(new THREE.BoxGeometry(0.018, 0.045, 0.005), mat(0x3a2a1a, 0.5), clockG, Math.sin(k * PI / 6) * 0.21, Math.cos(k * PI / 6) * 0.21, 0.005).rotation.z = -k * PI / 6;
  const hourH = new THREE.Group(), minH = new THREE.Group(); hourH.position.z = 0.01; minH.position.z = 0.014; clockG.add(hourH, minH);
  mk(new THREE.BoxGeometry(0.025, 0.13, 0.006), mat(0x1d1d22, 0.5), hourH, 0, 0.055, 0); mk(new THREE.BoxGeometry(0.016, 0.2, 0.006), mat(0x1d1d22, 0.5), minH, 0, 0.09, 0);
  const mop = new THREE.Group(); scene.add(mop);
  { const st = mk(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 6), mat(0x9a7a4a, 0.6), mop, 0, 0.65, 0); void st; mk(new THREE.CylinderGeometry(0.12, 0.09, 0.12, 10), mat(0xe8e2d0, 0.95), mop, 0, 0.06, 0); }
  const T0 = rest.tables[0], T3 = rest.tables[3];
  const heroDishes = T0.dishes;
  const candle0 = T0.dishes.children.find((o) => o.isMesh && o.geometry.type === 'CylinderGeometry' && Math.abs(o.geometry.parameters.height - 0.12) < 1e-6);
  const chairHome = T3.chairs.map((c) => ({ p: c.position.clone(), r: c.rotation.clone() }));

  // stadium: the kiss cam feed on the stage LED wall (a second camera rendered into a texture) + its heart frame
  const rt = new THREE.WebGLRenderTarget(1024, 384, { samples: 4 });
  const kissCam = new THREE.PerspectiveCamera(28, 1024 / 384, 0.1, 400); scene.add(kissCam);
  const ledMat = stad.screen.material, ledMap = ledMat.map;
  const frameTex = canvasTex(1024, 384, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = '#ff5fa2'; g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22);
    const heart = (x, y, s, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y + s * 0.3); g.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3); g.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s); g.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3); g.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3); g.fill(); };
    for (let i = 0; i < 14; i++) { heart(40 + i * 73, h - 52, 34, i % 2 ? '#ff5fa2' : '#ffffff'); }
    g.fillStyle = '#ff5fa2'; g.beginPath(); g.roundRect(w / 2 - 230, 18, 460, 96, 30); g.fill();
    g.fillStyle = '#ffffff'; g.font = font('bold', fitFont(g, ['KISS CAM'], 330, 'bold', 76)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('KISS CAM', w / 2 + 30, 68); heart(w / 2 - 188, 40, 52, '#ffffff');
  });
  const frame = mk(new THREE.PlaneGeometry(26, 9.75), new THREE.MeshBasicMaterial({ map: frameTex, transparent: true, depthWrite: false, toneMapped: false }), stad.root, -46.9, 8.0, 0); frame.rotation.y = PI / 2;
  const popcorn = new THREE.Group(); boys[2].arms.find((a) => a.s === -1).hand.add(popcorn); popcorn.position.set(0, -0.08, 0.06);
  mk(new THREE.CylinderGeometry(0.1, 0.075, 0.2, 14), mat(0xd2283f, 0.6), popcorn, 0, 0, 0);
  for (let k = 0; k < 9; k++) mk(new THREE.SphereGeometry(0.03, 6, 5), mat(0xfff3c8, 0.8), popcorn, Math.cos(k * 2.1) * 0.06, 0.1 + (k % 3) * 0.02, Math.sin(k * 2.1) * 0.06);
  popcorn.visible = false;
  const heartTex = canvasTex(128, 128, (g, w) => { g.fillStyle = '#ff5fa2'; g.beginPath(); g.moveTo(64, 38); g.bezierCurveTo(64, 14, 18, 14, 18, 46); g.bezierCurveTo(18, 74, 64, 96, 64, 116); g.bezierCurveTo(64, 96, 110, 74, 110, 46); g.bezierCurveTo(110, 14, 64, 14, 64, 38); g.fill(); void w; });
  const hearts = Array.from({ length: 26 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
  const HR = rng(8), heartSeeds = hearts.map(() => [HR() - 0.5, HR() - 0.5, HR(), HR()]);

  // ---------------------------------------------------------------- helpers
  function put(rig, key, p) {
    if (!p) { rig.root.visible = false; return; }
    const q = { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2], y: (p.y || 0) + OFF[key][1], floor: (p.floor || 0) + OFF[key][1] };
    applyPose(rig, q);
    rig.root.rotation.order = 'YXZ'; rig.root.rotation.x = p.tilt ?? 0; if (p.roll !== undefined) rig.root.rotation.z = p.roll;
    rig.root.visible = p.visible !== false;
  }
  const talk = (t, rate = 9) => (Math.sin(t * rate) > 0.1 ? 'o' : 'smile');

  // ================================================================ performances (pure: f(t) → pose)
  // BEDROOM — sitting up against the headboard, phone in both hands → springs up, bounces into the ceiling → panics at the board
  function youBed(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    if (t < JUMP - 0.3) {
      Object.assign(p, { x: SIT.x, z: SIT.z, rotY: 0, y: 0.7 - HIP_H, floor: B.top, footFwd: 0.7, lean: -0.1, headPitch: 0.22 });
      const sigh = K(t, [[2.4, 0], [2.9, 1], [3.6, 0]]); p.lean += 0.1 * sigh; p.headPitch += 0.12 * sigh;
      const refresh = pulse(t, 4.4, 5.2, 0.25); p.lean -= 0.12 * refresh; p.headPitch += 0.15 * refresh; p.headRoll = 0.12 * Math.sin(t * 0.9);
      p.armA = mixArm(HOLD_A, READ_A, refresh); p.armB = mixArm(HOLD_B, READ_B, refresh);
      const read = K(t, [[YES - 0.1, 0], [YES + 0.15, 1]]);
      p.headPitch = lerp(p.headPitch, 0.05, read); p.lean = lerp(p.lean, 0.05, read);
      if (t > YES + 0.1) { p.mouth = 'o'; p.eyes = 'open'; }
      return p;
    }
    // stand on the mattress, bounce, bonk the ceiling, land
    const up = K(t, [[JUMP - 0.3, 0], [JUMP, 1]]);
    const air = t > JUMP && t < BONK + 0.4 ? Math.max(0, Math.sin(clamp((t - JUMP) / 0.84) * PI)) : 0;
    const hop = 0.4 * Math.min(1, air * 1.15);
    Object.assign(p, { x: SIT.x, z: lerp(SIT.z, -1.55, up), rotY: 0, y: lerp(0.7 - HIP_H, B.top, up) + hop, floor: B.top + hop, footFwd: lerp(0.7, 0, up), lean: 0.05, mouth: 'o' });
    p.crouch = 0.12 * K(t, [[JUMP - 0.05, 0], [JUMP, 1], [JUMP + 0.08, 0]]) + 0.18 * K(t, [[BONK + 0.4, 0], [BONK + 0.5, 1], [BONK + 0.75, 0]]);
    p.armA = mixArm(HOLD_A, UP_A, K(t, [[JUMP - 0.2, 0], [JUMP + 0.1, 1]])); p.armB = mixArm(HOLD_B, UP_B, K(t, [[JUMP - 0.2, 0], [JUMP + 0.1, 1]]));
    const ouch = K(t, [[BONK, 0], [BONK + 0.15, 1]]);
    p.armA = mixArm(p.armA, HEAD_A, ouch); p.armB = mixArm(p.armB, HEAD_B, ouch);
    if (t > BONK && t < BONK + 0.5) p.eyes = 'closed';
    p.headPitch = -0.1 + 0.25 * K(t, [[BONK, 0], [BONK + 0.12, 1], [BONK + 0.5, 0]]);
    return p;
  }
  // the plan shot: you lean in from the left of frame, staring at the YES card, hands on your head
  function youPlan(t) {
    const p = basePose(); p.eyes = blink(t, 5); p.mouth = 'o';
    const lean = K(t, [[10.9, 0], [11.6, 1]]);
    Object.assign(p, { x: lerp(0.75, 1.12, lean), z: -0.62, rotY: PI / 2 + 0.3, lean: 0.05 + 0.15 * lean, headPitch: -0.05, crouch: 0.3 });
    p.armA = HEAD_A; p.armB = HEAD_B;
    const shake = Math.sin(t * 16) * 0.05 * lean; p.headRoll = shake; p.armA = { ...p.armA, sz: p.armA.sz + shake };
    if (t > 12.3) p.eyes = 'closed';
    return p;
  }
  // SUBURB morning — out the door, head down, hands in the hoodie, through the falling birds; you look up… and get one in the face
  const PORCH_T = 13.3, HIT = 17.05;
  function youPorch(t) {
    const p = basePose(); p.eyes = blink(t, 3); p.mouth = 'flat';
    const w = walkLegs(t, [DOOR[0], -9.3], [{ t0: PORCH_T, t1: 15.3, pts: [[DOOR[0], -7.2], [DOOR[0] + 0.05, -5.6]] }, { t0: 15.65, t1: 16.2, pts: [[DOOR[0] + 0.05, -5.15]] }]);
    const fl = w.z < -7.05 ? 0.3 : w.z < -6.85 ? lerp(0.3, 0, (w.z + 7.05) / 0.2) : 0;
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: 0, y: fl, floor: fl, headPitch: 0.5, lean: 0.12 });
    p.armA = POCKET_A; p.armB = POCKET_B;
    if (t > 15.6) {
      const look = K(t, [[16.3, 0], [16.85, 1]]);
      p.headPitch = lerp(0.5, -1.0, look); p.lean = lerp(0.12, -0.1, look); if (look > 0.6) p.mouth = 'o';
      if (t > HIT) {
        const u = clamp((t - HIT - 0.04) / 0.4); p.tilt = -(PI / 2 - 0.03) * u * u; p.y += 0.14 * u; p.eyes = 'closed';
        p.armA = mixArm(POCKET_A, A(-0.2, 1.1, -0.2), u); p.armB = mixArm(POCKET_B, A(-0.2, 1.1, -0.2), u); p.headPitch = lerp(-1.0, -0.2, u);
      }
    }
    return p;
  }
  // STREET — out of the Friend Zone with a box (sunglasses on). It explodes behind you. You don't look back.
  function youFZ(t) {
    const p = basePose(); p.eyes = blink(t, 4); p.mouth = t > EXP + 0.5 ? 'smile' : 'flat';
    const w = walkLegs(t, [FZ.door, -3.15], [{ t0: 18.3, t1: 21.3, pts: [[FZ.door - 0.15, -2.2], [6.35, -0.45]] }, { t0: 21.3, t1: 23.7, pts: [[6.1, 1.3]] }]);
    const fl = w.z < -0.05 ? SH : 0;
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: w.head ?? 0, y: fl, floor: fl, headPitch: -0.05 });
    p.armA = BOX_A; p.armB = BOX_B;
    return p;
  }
  // LIVING ROOM — the boys on the sofa (+ Mike on the floor), phones down → heads up → wail → hug → Mike dives on
  const READ_T = 26.25, WAIL = 26.5, HUG_T = 27.15, DIVE = 27.55, DIVE_LAND = 27.95;
  const floodLv = (t) => K(t, [[26.6, 0], [27.6, 0.6], [28.6, 1.12]]);   // the tears fill the room
  const SOFA_X = [1.18, 1.8, 2.42];
  function boyPose(t, i) {
    const p = basePose(); p.eyes = blink(t, i + 1); p.mouth = 'flat'; p.glasses = boys[i].glassesOn;
    if (i < 3) Object.assign(p, { x: SOFA_X[i], z: -2.12, rotY: 0, y: seatY(0.42), footFwd: 0.42, lean: -0.05 });
    else Object.assign(p, { x: 1.5, z: -1.3, rotY: 0, y: -0.74, footFwd: 0.78, lean: 0.08 });
    const heads = K(t, [[READ_T + i * 0.02, 0], [READ_T + 0.12 + i * 0.02, 1]]);
    p.headPitch = lerp(0.55, -0.05, heads); p.armA = READ_A; p.armB = READ_B;
    if (t > READ_T) p.mouth = 'o';
    const wail = K(t, [[WAIL, 0], [WAIL + 0.15, 1]]);
    if (wail > 0) {
      p.eyes = 'closed'; p.headPitch = lerp(p.headPitch, -0.35, wail); p.lean += 0.06 * Math.sin(t * 17 + i) * wail;
      p.armA = mixArm(READ_A, UP_A, pulse(t, WAIL, WAIL + 0.55, 0.12)); p.armB = mixArm(READ_B, UP_B, pulse(t, WAIL, WAIL + 0.55, 0.12));
    }
    const hug = K(t, [[HUG_T, 0], [HUG_T + 0.3, 1]]);
    if (hug > 0 && i < 3) {
      const toward = (SOFA_X[1] - SOFA_X[i]) * 0.28;
      p.x += toward * hug; p.headRoll = (i === 0 ? -0.3 : i === 2 ? 0.3 : 0) * hug; p.lean += 0.15 * hug;
      p.armA = mixArm(p.armA, HUG_A, hug); p.armB = mixArm(p.armB, HUG_B, hug);
    }
    const lv = floodLv(t); if (i < 3) { const f = Math.max(0, lv - 0.5); p.y += f; p.floor = f; } else if (t < HUG_T) { const f = Math.max(0, lv - 0.1); p.y += f; }
    if (i === 3) {   // Mike gets up and dives onto the pile
      const up = K(t, [[HUG_T, 0], [DIVE - 0.05, 1]]);
      if (up > 0) { p.y = lerp(p.y, 0, up); p.footFwd = lerp(0.78, 0, up); p.rotY = lerpAngle(0, PI, up); }
      if (t > DIVE) {
        const u = clamp((t - DIVE) / (DIVE_LAND - DIVE)), arcY = 0.55 * Math.sin(u * PI) + 0.25 * u;
        Object.assign(p, { x: lerp(1.5, 1.75, u), z: lerp(-1.3, -1.75, u), y: arcY, floor: arcY + 0.3 * u, rotY: PI, tilt: 1.1 * u, footFwd: -0.3 * u });
        p.armA = UP_A; p.armB = UP_B; p.mouth = 'o';
      }
    }
    return p;
  }
  // KITCHEN — Mom, a phone at each ear, bouncing and pacing
  function momPose(t) {
    const p = basePose(); p.eyes = blink(t, 6); p.mouth = talk(t, 11);
    const x = -0.05 + 0.22 * Math.sin((t - 28.6) * 2.2);
    Object.assign(p, { x, z: -1.5, rotY: 0.25 * Math.cos((t - 28.6) * 2.2), y: 0.04 * Math.abs(Math.sin(t * 9)), floor: 0.04 * Math.abs(Math.sin(t * 9)), lean: 0.04, headRoll: 0.12 * Math.sin(t * 4.5) });
    p.armA = PHONE_A; p.armB = PHONE_B;
    if (t > 29.85 && t < 30.4) { p.mouth = 'o'; p.eyes = 'closed'; }
    return p;
  }
  // LIBRARY — Grandma at the desk on the phone → leaps up, arms up, screams → LIFTOFF, straight through the ceiling
  const SCREAM = 32.15, SHUSH = 33.15;
  function granPose(t) {
    const p = basePose(); p.eyes = blink(t, 7); p.mouth = 'flat'; p.glasses = true;
    const up = K(t, [[SCREAM - 0.1, 0], [SCREAM + 0.12, 1]]);
    Object.assign(p, { x: 0, z: -4.35, rotY: 0, y: lerp(seatY(0.46), 0, up), footFwd: lerp(0.42, 0, up), headPitch: 0.1 });
    p.armA = READ_A; p.armB = PHONE_B;
    if (t < SCREAM) { p.mouth = t > 31.5 ? 'o' : 'flat'; return p; }
    const arms = K(t, [[SCREAM, 0], [SCREAM + 0.12, 1]]);
    p.armA = mixArm(READ_A, UP_A, arms); p.armB = mixArm(PHONE_B, UP_B, arms);
    p.mouth = 'o'; p.eyes = 'closed'; p.headPitch = -0.3 * arms;
    if (t > LIFT) { const a = t - LIFT; p.y = 15 * a * a; p.floor = p.y; p.eyes = 'open'; }
    return p;
  }
  const READERS = [[-0.43, -2.7, -PI / 2], [0.43, -2.7, PI / 2], [-0.43, -1.75, -PI / 2], [0.43, -1.75, PI / 2], [-1.67, -2.7, PI / 2], [1.67, -1.75, -PI / 2]];
  function readerPose(t, i) {
    const [x, z, ry] = READERS[i], p = basePose(); p.eyes = blink(t, i + 9); p.mouth = 'flat';
    Object.assign(p, { x, z, rotY: ry, y: seatY(0.46), footFwd: 0.42, headPitch: 0.45, lean: 0.12 });
    p.armA = READ_A; p.armB = READ_B;
    const look = K(t, [[SCREAM + 0.1, 0], [SCREAM + 0.25, 1]]);
    p.rotY = ry + (ry > 0 ? 0.55 : -0.55) * look; p.headYaw = (ry > 0 ? 1 : -1) * 0.9 * look; p.headPitch = lerp(0.45, 0.0, look);
    const upw = K(t, [[LIFT + 0.15, 0], [CEIL, 1]]); p.headPitch = lerp(p.headPitch, -0.85, upw); p.lean = lerp(p.lean, -0.08, upw);
    if (look > 0.5 && t < SHUSH) p.mouth = 'o';
    const sh = K(t, [[SHUSH, 0], [SHUSH + 0.18, 1]]);
    if (sh > 0) { if (ry < 0) p.armA = mixArm(READ_A, MOUTH_A, sh); else p.armB = mixArm(READ_B, MOUTH_B, sh); p.mouth = 'flat'; p.eyes = 'open'; }
    return p;
  }
  // RADIO — the DJ sings into the mic, sees the counter drop to 0, slumps onto the desk
  const ZERO = 35.25;
  function djPose(t) {
    const p = basePose(); p.eyes = t < ZERO + 0.15 ? 'closed' : blink(t, 3); p.mouth = t < ZERO ? (Math.sin(t * 6) > -0.2 ? 'o' : 'flat') : 'flat';
    Object.assign(p, { x: RD.dj[0], z: RD.dj[1] + 0.05, rotY: 0, y: seatY(RD.seat), footFwd: 0.42, lean: 0.1, headRoll: t < ZERO ? 0.14 * Math.sin(t * 2.4) : 0, headPitch: 0.05, tear: true });
    p.armA = READ_A; p.armB = READ_B;
    const look = K(t, [[ZERO + 0.15, 0], [ZERO + 0.4, 1]]); p.headYaw = -0.45 * look; if (look > 0.3 && t < ZERO + 0.9) p.mouth = 'o';
    const slump = K(t, [[ZERO + 0.75, 0], [ZERO + 1.35, 1]]);
    p.lean = lerp(p.lean, 0.85, slump); p.headPitch = lerp(p.headPitch, 0.55, slump); p.headYaw = lerp(p.headYaw, 0, slump);
    p.armA = mixArm(READ_A, A(-1.45, 0.25, -0.9, 0.4), slump); p.armB = mixArm(READ_B, A(-1.45, 0.25, -0.9, -0.4), slump);
    if (slump > 0.5) p.eyes = 'closed';
    return p;
  }
  // BISTRO — you two at table 0, staring and smiling; the room fast-forwards around you
  const TL0 = 39.9, TL1 = 43.55;                         // the time-lapse window
  const tl = (t) => K(t, [[TL0, 0], [TL1, 1]], (u) => u);
  function datePose(t, s) {
    const p = basePose(); p.mouth = 'smile';
    const fast = t > TL0 && t < TL1;
    p.eyes = fast ? blink(t * 7, s > 0 ? 3 : 1) : blink(t, s > 0 ? 3 : 1);
    Object.assign(p, { x: s * 0.6, z: 0.2, rotY: s < 0 ? PI / 2 : -PI / 2, y: seatY(0.47), footFwd: 0.42, lean: 0.22, headPitch: -0.12 });
    p.armA = READ_A; p.armB = READ_B;
    p.headRoll = (s < 0 ? 0.08 : -0.1) + 0.03 * Math.sin(t * (fast ? 9 : 1.3) + s);
    return p;
  }
  function dinerPose(t, i) {
    const s = i ? 1 : -1, p = basePose(); p.eyes = blink(t * 4, i + 5); p.mouth = talk(t * 2.5, 7 + i);
    const leave = TL0 + 0.5 + i * 0.25, up = K(t, [[leave, 0], [leave + 0.12, 1]], (u) => u);
    const sx = T3.x + s * 0.62, sz = T3.z;
    if (t < leave + 0.12) { Object.assign(p, { x: sx, z: sz, rotY: s < 0 ? PI / 2 : -PI / 2, y: lerp(seatY(0.47), 0, up), footFwd: lerp(0.42, 0, up), lean: 0.1, headRoll: 0.08 * Math.sin(t * 9 + i) }); p.armA = READ_A; p.armB = READ_B; return p; }
    const u = (t - leave - 0.12) * 4.5;
    const x = sx + s * u * 1.2, z = sz + u * 0.9;
    if (Math.abs(x) > 4.2) return null;
    Object.assign(p, { x, z, rotY: faceToward(sx, sz, sx + s * 1.2, sz + 0.9), dist: u * 1.5, speed: 2.2, lean: 0.12 });
    return p;
  }
  const FLEE = 42.5;
  function waiterPose(t) {
    const p = basePose(); p.eyes = blink(t * 3, 2); p.mouth = 'flat';
    if (t < TL0 + 1.4) return null;
    const u = t - TL0 - 1.4, uf = Math.min(t, FLEE) - TL0 - 1.4;
    const x = 0.0 + 0.95 * Math.sin(uf * 5.0), z = -1.05 + 0.3 * Math.sin(uf * 10.0);
    if (t < FLEE) {   // zips around table 3 flipping chairs, then mops in fast figure-eights behind you
      Object.assign(p, { x, z, rotY: Math.atan2(0.95 * 5.0 * Math.cos(u * 5.0), 0.3 * 10 * Math.cos(u * 10)), dist: u * 9, speed: 3.0, lean: 0.25 });
      p.armA = A(-0.9, 0.2, -0.6, 0.3); p.armB = A(-0.9, 0.2, -0.6, -0.3);
      return p;
    }
    // sees the meteors, throws his arms up, runs for it (you two don't notice)
    const run = Math.max(0, t - FLEE - 0.35);
    Object.assign(p, { x: x + 3.4 * run * run + 1.4 * run, z, rotY: run > 0 ? PI / 2 : PI, dist: (t - FLEE) * 6, speed: run > 0 ? 3.5 : 0, lean: run > 0 ? 0.3 : -0.1, mouth: 'o', eyes: 'open' });
    p.armA = UP_A; p.armB = UP_B;
    return p;
  }
  // STADIUM — you, her, and Jay (popcorn) in the field crowd, facing the stage (−x)
  function kissPose(t, who) {
    const p = basePose(); p.eyes = blink(t, who + 2);
    const z = CZ + [0, 0.6, -0.6][who];
    Object.assign(p, { x: CX, z, rotY: -PI / 2, headPitch: -0.22, mouth: 'smile' });
    p.armA = REST; p.armB = REST;
    const seen = K(t, [[45.25, 0], [45.45, 1]]);
    if (who === 0) {
      if (seen > 0.5) p.mouth = 'o';
      const melt = K(t, [[KISS + 0.1, 0], [KISS + 0.45, 1]]);
      const lean = K(t, [[KISS - 0.25, 0], [KISS, 1], [KISS + 0.9, 1], [KISS + 1.2, 0.3]]); p.headRoll = 0.22 * lean; p.z += 0.06 * lean;
      if (melt > 0) { p.eyes = 'closed'; p.mouth = 'smile'; p.crouch = 0.12 * melt; p.headRoll = 0.22 * lean + 0.12 * melt; p.headPitch = lerp(-0.22, 0.05, melt); }
      p.armB = mixArm(REST, A(-0.4, 0.2, -0.6, -0.2), seen);
    } else if (who === 1) {
      if (seen > 0.5) p.mouth = 'o';
      p.armB = mixArm(REST, MOUTH_B, pulse(t, 45.4, 46.9, 0.2));
      const kiss = K(t, [[KISS - 0.3, 0], [KISS, 1], [KISS + 0.9, 1], [KISS + 1.2, 0.4]]);
      if (kiss > 0) { p.z -= 0.36 * kiss; p.headYaw = -1.25 * kiss; p.lean = 0.03 + 0.16 * kiss; p.headRoll = -0.3 * kiss; p.eyes = kiss > 0.5 ? 'closed' : p.eyes; p.mouth = 'smile'; p.headPitch = lerp(-0.22, -0.05, kiss); }
      p.armA = mixArm(REST, A(-0.9, 0.35, -1.2, 0.6), kiss);
    } else {
      p.mouth = 'flat'; popcorn.visible = true;
      p.armA = A(-0.85, 0.1, -1.35, 0.5);
      const look = K(t, [[KISS - 0.2, 0], [KISS + 0.1, 1], [KISS + 0.7, 1], [KISS + 0.95, 0]]); p.headYaw = 0.85 * look;
      p.armB = mixArm(REST, MOUTH_B, pulse(t, 46.9, 47.35, 0.1) + pulse(t, 48.45, 48.9, 0.1));   // eats a piece, staring at us
    }
    return p;
  }
  const NEAR = [[1.2, -1.1], [1.25, 0.15], [1.2, 1.35], [2.3, -0.5], [2.35, 0.8], [0.15, -1.6], [0.1, 1.75]];
  function fanPose(t, i) {
    const [dx, dz] = NEAR[i], p = basePose(); p.eyes = blink(t, i + 4); p.mouth = 'smile';
    Object.assign(p, { x: CX + dx, z: CZ + dz, rotY: -PI / 2 + 0.15 * Math.sin(i * 2.3), headPitch: -0.2 });
    const a = t - (KISS + 0.06 + Math.hypot(dx, dz) / 40);
    if (a > 0) {   // the kiss shockwave throws them into the sky (backflipping)
      const v0 = 7 + 2 * Math.sin(i * 1.7); p.y = Math.max(0, v0 * a - 4.9 * a * a); p.floor = p.y; p.tilt = -Math.min(2.6, a * 4.5); p.x += 2.2 * a;
      p.armA = UP_A; p.armB = UP_B; p.mouth = 'o';
    }
    return p;
  }
  // WEDDING — groom + bride at the arch, the boys as groomsmen (they cry, then faint backward one by one)
  const FAINT = [51.95, 52.2, 52.45, 52.65];
  const GM = [[-1.2, -3.05], [-1.62, -2.92], [-2.04, -2.79], [-2.46, -2.66]];
  function weddingPose(t, who) {
    const p = basePose(); p.eyes = blink(t, who + 1); p.mouth = 'smile';
    const [x, z] = who === 0 ? WD.groom : WD.bride;
    Object.assign(p, { x: x + (who === 0 ? 0.08 : -0.08), z, rotY: who === 0 ? PI / 2 : -PI / 2, headPitch: 0.0 });
    p.armA = who === 0 ? A(-0.55, 0.05, -0.55, 0.3) : REST; p.armB = who === 0 ? REST : A(-0.55, 0.05, -0.55, -0.3);
    const up = K(t, [[49.9, 0], [50.3, 1]]); p.headPitch = lerp(0, -0.55, up * (1 - K(t, [[51.2, 0], [51.6, 1]])));
    if (up > 0.5 && t < 51.3) p.mouth = 'o';
    const kiss = K(t, [[53.5, 0], [53.85, 1]]);
    if (kiss > 0) { p.x += (who === 0 ? 0.12 : -0.12) * kiss; p.lean = 0.12 * kiss; p.headRoll = (who === 0 ? 0.2 : -0.2) * kiss; p.eyes = 'closed'; p.armA = mixArm(p.armA, HUG_A, kiss); p.armB = mixArm(p.armB, HUG_B, kiss); }
    return p;
  }
  function gmPose(t, i) {
    const [x, z] = GM[i], p = basePose(); p.eyes = blink(t, i + 3); p.mouth = 'smile'; p.glasses = boys[i].glassesOn;
    Object.assign(p, { x, z, rotY: 0.55, headPitch: 0.05 });
    p.armA = A(-0.35, -0.05, -0.6, 0.6); p.armB = A(-0.35, -0.05, -0.6, -0.6);
    if (t > 50.7) { p.eyes = 'closed'; p.mouth = 'o'; p.armB = mixArm(p.armB, MOUTH_B, K(t, [[50.7 + i * 0.1, 0], [50.95 + i * 0.1, 1]])); }
    const f = FAINT[i];
    if (t > f) {
      const u = clamp((t - f) / 0.42), ang = -(PI / 2 - 0.04) * u * u + 0.05 * Math.sin(clamp((t - f - 0.42) / 0.3) * PI) * (u >= 1 ? 1 : 0);
      p.roll = -ang; p.armA = A(-0.2, 0.5, -0.1); p.armB = A(-0.2, 0.5, -0.1); p.headPitch = -0.2;
    }
    return p;
  }
  // +60 YEARS — the bench: three jokes, three laughs
  const JOKES = [[54.95, 55.75], [56.3, 57.3], [57.75, 58.55]], LAUGHS = [[55.6, 56.3], [57.2, 57.75], [58.45, 60.3]];
const BUBBLES = [[54.95, 55.95], [56.3, 57.45], [57.7, 59.15]];
  function oldYouPose(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'smile'; p.glasses = true;
    Object.assign(p, { x: BENCH[0] - 0.33, z: BENCH[1] - 0.02, rotY: 0.28, y: seatY(0.475), footFwd: 0.42, lean: 0.06, headYaw: 0.35 });
    p.armA = A(-0.75, 0.12, -1.0, 0.45); p.armB = A(-0.75, 0.12, -1.0, -0.45);
    JOKES.forEach(([a, b], k) => { const j = pulse(t, a, b, 0.18); if (j > 0) { p.armA = mixArm(p.armA, k === 2 ? A(-2.2, 0.55, -0.9, 0.2) : TELL_A, j); if (k === 1) p.armB = mixArm(p.armB, TELL_B, j); p.mouth = talk(t, 12); p.headYaw = lerp(0.35, 0.5, j); p.lean += 0.1 * j; p.headPitch = -0.1 * j; } });
    LAUGHS.forEach(([a, b]) => { if (t > a && t < b) { p.mouth = 'smile'; p.headPitch = -0.12; p.lean += 0.03 * Math.sin(t * 15); } });
    const lean = K(t, [[61.0, 0], [61.8, 1]]);
    if (lean > 0) { p.armB = mixArm(p.armB, A(-0.25, 1.3, -1.1, -0.9), lean); p.headYaw = lerp(p.headYaw, 0.25, lean); p.headRoll = 0.12 * lean; p.eyes = blink(t, 2); }
    return p;
  }
  function oldHerPose(t) {
    const p = basePose(); p.eyes = blink(t, 4); p.mouth = 'smile'; p.glasses = true;
    Object.assign(p, { x: BENCH[0] + 0.33, z: BENCH[1] - 0.02, rotY: -0.28, y: seatY(0.475), footFwd: 0.42, lean: 0.06, headYaw: -0.3 });
    p.armA = A(-0.75, 0.12, -1.0, 0.45); p.armB = A(-0.75, 0.12, -1.0, -0.45);
    LAUGHS.forEach(([a, b], k) => {
      const l = pulse(t, a, b, 0.15);
      if (l > 0) {
        p.eyes = 'closed'; p.mouth = 'o'; p.headPitch = -0.5 * l; p.headYaw = lerp(-0.3, 0.1, l); p.lean += (0.07 + 0.04 * k) * Math.sin(t * 16) * l - 0.12 * l;
        p.armB = mixArm(p.armB, k === 2 ? CHEST_B : MOUTH_B, l);
        if (k === 2) { const slap = pulse(t, 58.7, 59.4, 0.12); p.armA = mixArm(p.armA, A(-0.7, -0.35, -0.5, 0.2), slap); p.lean += 0.12 * slap; }
      }
    });
    const rest = K(t, [[61.0, 0], [61.8, 1]]);
    if (rest > 0) { p.headRoll = lerp(0, 0.38, rest); p.headYaw = lerp(-0.3, -0.15, rest); p.x -= 0.06 * rest; p.eyes = rest > 0.7 ? 'closed' : p.eyes; }
    return p;
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  const camW = new THREE.Vector3();
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'city' ? 0.3 : 0.03; studio.fill.intensity = 0.45;
    ALL.forEach((r) => (r.root.visible = false)); boys.forEach((r) => suit(r, false));
    crowd.forEach((c) => outfit(c, c.base.top, c.base.pants)); outfit(you, 0x5a6680, 0x2c3140); you.hood.visible = true; cloud.g.scale.setScalar(1); cloud.mats.puff.emissive.setHex(0x000000);
    cloud.g.visible = false; cloud2.g.visible = false; newBox.visible = false; jokeB.forEach((b) => (b.sprite.visible = false)); phone.g.visible = false; phoneGlow.intensity = 0; carryBox.visible = false; mop.visible = false; popcorn.visible = false;
    boyPhones.forEach((p) => (p.g.visible = false)); hearts.forEach((h) => (h.visible = false));
    puffN = 0; sparkN = 0; dropN = 0; puffs.hide(); sparks.hide(); steam.hide();
    bfN = 0; bsN = 0; flash = 0; bfire.hide(); bsmoke.hide(); confN = 0; flock.begin();
    shades.visible = false; water.visible = false; moon.visible = false; kissRing.visible = false; meteors.forEach((m) => (m.visible = false)); meteorLight.intensity = 0;
    ledMat.map = ledMap;
    let jolt = 0, camOverride = null;
    studio.camera.near = S === 'space' ? 1 : S === 'city' ? 0.3 : 0.03;

    if (S === 'bed') {
      bed.setDoor(0); bed.lights.spill.intensity = 0; bed.setNightlight(0); bed.setSeason('summer', t);
      const night = shot.cam !== 'chat';
      bed.setLamp(night ? 0 : 1);
      if (shot.cam === 'chat') {
        phone.g.visible = true; phone.g.position.copy(L('bed', SIT.x, 1.18, -1.62)); phone.g.rotation.set(-1.17, PI, 0);
        const n = clamp(Math.floor((t - 23.85) / 0.27) + 1, 0, GC.length); scrM.map = GROUP[n]; scrM.needsUpdate = true;
        const buzz = n > 0 && ((t - 23.85) % 0.27) < 0.08 ? 1 : 0; phone.g.position.x += buzz * 0.0025 * Math.sin(t * 90);
        phone.g.updateMatrixWorld(true);
        const nrm = _w.set(0, 1, 0).applyQuaternion(phone.g.quaternion), c = phone.g.position.clone();
        camOverride = { p: c.clone().addScaledVector(nrm, 0.4).toArray(), a: c.clone().add(_v.set(0, -0.032, 0)).toArray() };
      } else {
        const pose = shot.cam === 'plan' ? youPlan(t) : youBed(t);
        put(you, 'bed', pose);
        if (shot.cam === 'plan' || shot.cam === 'phone') you.root.visible = false;
        bed.setLamp(shot.cam === 'plan' ? 1 : 0); boardLight.intensity = shot.cam === 'plan' ? 2.2 : 0;
        const yf = K(t, [[12.25, 0], [12.85, 1]], (u) => u * u); yesCard.position.set(1.975 - 0.25 * yf, 1.6 - 0.95 * yf, -0.62 - 0.05 * yf); yesCard.rotation.set(0.6 * yf, -PI / 2 + 0.5 * yf, 0.03 + 1.6 * yf);
        blanket.visible = legBump.visible = shot.cam !== 'plan' && t < JUMP - 0.2;
        // the phone: in your hands (sitting), then it flies up when you jump
        const hA = handWorld(you, -1), hB = handWorld(you, 1), mid = hA.add(hB).multiplyScalar(0.5);
        const fly = t - (JUMP - 0.15);
        if (fly < 0 || shot.cam === 'phone') { phone.g.position.copy(mid).add(_w.set(0, 0.05, 0.06)); phone.g.rotation.set(-1.17, PI, 0); }
        else { phone.g.position.copy(L('bed', SIT.x + 0.15 + 0.4 * fly, Math.max(B.top + 0.05, 1.25 + 2.6 * fly - 4.9 * fly * fly), -1.6 + 0.3 * fly)); phone.g.rotation.set(-1.17 + fly * 9, fly * 4, 0); }
        phone.g.visible = shot.cam !== 'plan';
        const state = t < 6.55 ? 0 : t < YES ? 1 : 2; scrM.map = CHAT[state]; scrM.needsUpdate = true;
        phoneGlow.intensity = shot.cam === 'phone' ? 0 : 0.55; phoneGlow.position.copy(phone.g.position).add(_w.set(0, 0.08, 0.25));
        if (shot.cam === 'phone') {
          phone.g.updateMatrixWorld(true);
          const nrm = _w.set(0, 1, 0).applyQuaternion(phone.g.quaternion), c = phone.g.position.clone();
          camOverride = { p: c.clone().addScaledVector(nrm, 0.4).toArray(), a: c.clone().add(_v.set(0, -0.032, 0)).toArray() };
        }
        // the cloud: over your head raining → her yes → it swells and EXPLODES into confetti
        cloud.g.visible = shot.cam !== 'plan' && t < POPC + 0.06; cloud.mats.puff.emissive.setHex(0x1c2230);
        const cpos = L('bed', SIT.x, 2.2, -1.85); cloud.g.position.copy(cpos);
        cloud.g.scale.setScalar(1 + 0.5 * K(t, [[POPC - 0.3, 0], [POPC, 1]], (u) => u * u));
        if (shot.cam !== 'plan') { boom(t, POPC, cpos, 0.6, 10); burst(t, POPC, cpos, 160, 3.4); }
        if (t > POPC && t < POPC + 0.5) jolt = 0.03 * Math.exp(-(t - POPC) * 7);
        cloud.update(t, { rain: t < YES + 0.3 && shot.cam !== 'phone' ? 1 : 0, mood: t < YES ? 'sad' : 'o', fall: 1.55 });   // no rain in the phone POV: a drop crosses the lens
        dust(t, BONK, L('bed', SIT.x, 2.62, -1.55), 0.55, 6, 0.9);
        if (t > BONK && t < BONK + 0.35) jolt = Math.max(jolt, 0.014 * Math.exp(-(t - BONK) * 9));
      }
    } else if (S === 'burb') {
      if (burbSky) burbSky.material.map = shot.cam.startsWith('old') ? sunsetMap : daySkyMap;
      const sunL = burb.lights.sun, hemi = burb.lights.hemi;
      if (shot.cam.startsWith('porch')) {
        burb.aimSun(DOOR[0], -6.5, 8); sunL.color.set(0xfff2dc); sunL.intensity = 2.7; hemi.color.set(0xcfe3ff); hemi.intensity = 1.25;
        lot0.door.rotation.y = K(t, [[13.0, 0], [13.35, 1.45]]);
        const p = youPorch(t); put(you, 'burb', p);
        birdRain(t);
        // the one that gets you: falls from above your head, hits your face at HIT, rides your face down
        you.root.updateMatrixWorld(true);
        const tf = Math.sqrt((2 * (7 - 1.85)) / 9.8), ha = t - (HIT - tf);
        if (ha > 0 && t < HIT) { const hx = DOOR[0] + 0.05, hz = -5.15; const q = L('burb', hx, 7 - 4.9 * ha * ha, hz + 0.08); flock.add(q.x, q.y, q.z, { pitch: ha * 7, roll: ha * 4, s: 1.3, out: true, color: 0xd84f4f }); }
        else if (t >= HIT) { const q = you.head.g.localToWorld(_v.set(0, 0.03, 0.2)).clone(); flock.add(q.x, q.y, q.z, { rotY: 0.4, pitch: -PI / 2 + 0.3, roll: PI, s: 1.3, out: true, color: 0xd84f4f }); }
        dust(t, HIT + 0.44, L('burb', DOOR[0] - 0.35, 0.1, -6.2), 0.35, 5, 0.7, new THREE.Color(0xe8e2d0));
        if (t > HIT && t < HIT + 0.3) jolt = 0.012 * Math.exp(-(t - HIT) * 10);
        if (t > HIT + 0.44 && t < HIT + 0.8) jolt = Math.max(jolt, 0.018 * Math.exp(-(t - HIT - 0.44) * 8));
      } else {
        burb.aimSun(BENCH[0], BENCH[1], 8);
        sunL.color.set(0xffb070); sunL.intensity = 2.3; hemi.color.set(0xffd8c0); hemi.intensity = 1.0;
        sunL.position.copy(sunL.target.position).add(_w.set(-40, 14, 30));
        put(oldYou, 'burb', oldYouPose(t)); put(oldHer, 'burb', oldHerPose(t));
        moon.visible = true;
        for (const [bx, k] of [[BENCH[0] - 0.82, 0], [BENCH[0] + 0.86, 1]]) { const q = L('burb', bx, 0.94, BENCH[1] - 0.34); flock.add(q.x, q.y, q.z, { rotY: (k ? -0.3 : 0.3) + 0.25 * Math.sin(t * 2.3 + k * 2), s: 1.1, flap: Math.max(0, Math.sin(t * 9 + k * 3)) * (Math.sin(t * 0.9 + k) > 0.7 ? 0.6 : 0), color: k ? 0x4f86d8 : 0xf2c94e }); }
        cloud.g.visible = true; cloud.g.scale.setScalar(0.8);
        const aside = shot.cam === 'oldB' ? 0 : 1;
        cloud.g.position.copy(L('burb', BENCH[0] + 0.15 * Math.sin(t * 0.4) + 0.85 * aside, 2.2 + 0.25 * aside, BENCH[1] - 0.1));
        cloud.update(t, { petals: shot.cam === 'oldB' ? 0.6 : 0.3, mood: t > 58.6 && t < 60.5 ? 'smile' : 'sleep', fall: 2.2, white: 1 });
      }
    } else if (S === 'street') {
      street.aimSun(FZ.cx, -2, 9); street.setSeason('summer', t, [FZ.cx, -2]);
      if (fzAwning) fzAwning.visible = false; nearTrees.forEach((tr) => (tr.t.visible = false)); street.cart.visible = false;
      put(you, 'street', youFZ(t));
      carryBox.visible = true; const hA = handWorld(you, -1), hB = handWorld(you, 1);
      carryBox.position.copy(hA.add(hB).multiplyScalar(0.5)).add(_w.set(0, -0.2, 0)); carryBox.rotation.y = you.root.rotation.y;
      shades.visible = true;
      // KABOOM: the Friend Zone explodes (three booms), the sign flies, the boxes fly, it keeps burning
      const fbase = L('street', FZ.cx - 0.4, 1.6, FZ.z + 0.3);
      boom(t, EXP, fbase, 2.4, 16); boom(t, EXP + 0.22, L('street', FZ.door, 1.3, FZ.z + 0.4), 1.5, 10); boom(t, EXP + 0.45, L('street', 4.6, 4.8, FZ.z + 0.2), 1.6, 10);
      if (t > EXP + 0.6) { flames(t, L('street', 5.0, 0.3, FZ.z + 0.35), 1.0, 4); flames(t, L('street', 7.1, 0.3, FZ.z + 0.35), 0.8, 3); flames(t, L('street', 5.6, 3.6, FZ.z + 0.25), 0.9, 3); }
      const su = Math.max(0, t - EXP), sLand = 1.56, sf = Math.min(su, sLand);
      signPivot.position.set(FZ.cx - 1.1 * sf, Math.max(0.2, 2.78 + 6 * sf - 4.9 * sf * sf), FZ.z + 0.1 + 1.25 * sf);
      signPivot.rotation.set(su < sLand ? -4 * sf : -PI / 2, 0, su < sLand ? 6 * sf : 0.3);
      dust(t, EXP + sLand, L('street', 4.1, SH + 0.1, -0.95), 1.0, 7, 1.0);
      closing.visible = t < EXP + 0.08; popM.visible = t < EXP + 0.08;
      [...fzBoxes, beanbag].forEach((b, k) => {
        if (!b.userData.home) b.userData.home = b.position.clone();
        const h = b.userData.home, [vx, vy, vz] = DEBRIS_V[k], a = Math.max(0, t - EXP - 0.02);
        const tl = (vy + Math.sqrt(vy * vy + 2 * 9.8 * Math.max(0, h.y - SH))) / 9.8, fa = Math.min(a, tl);
        b.position.set(h.x + vx * fa, Math.max(SH, h.y + vy * fa - 4.9 * fa * fa), h.z + vz * fa); b.rotation.set(fa * 7, fa * 4, fa * 5);
      });
      if (t > EXP && t < EXP + 0.9) jolt = 0.05 * Math.exp(-(t - EXP) * 5);
    } else if (S === 'liv') {
      boys.forEach((b, i) => {
        const p = boyPose(t, i); put(b, 'liv', p);
        tears(t, b, K(t, [[WAIL, 0], [WAIL + 0.2, 1]]) * (i === 3 && t > DIVE ? 0.4 : 1));
        const ph = boyPhones[i]; ph.g.visible = true;
        const fly = t - (WAIL + 0.08 + i * 0.03);
        if (fly < 0) { const hA = handWorld(b, -1), hB = handWorld(b, 1); ph.g.position.copy(hA.add(hB).multiplyScalar(0.5)).add(_w.set(0, 0.03, 0.04)); ph.g.rotation.set(-0.6, 0, 0); }
        else { const base = L('liv', p.x, 1.0, p.z + 0.3); ph.g.position.set(base.x + (i - 1.5) * 0.35 * fly, Math.max(0.42, floodLv(t), base.y + 3.4 * fly - 4.9 * fly * fly), base.z + 0.4 * fly); ph.g.rotation.set(fly * 11 + i, fly * 7, fly * 3); }
      });
      const lv = floodLv(t); water.visible = lv > 0.01; water.position.y = lv + 0.012 * Math.sin(t * 3);
      sofa.forEach(({ m, y }) => (m.position.y = y + Math.max(0, lv - 0.32) + 0.02 * Math.sin(t * 2.4)));
      dust(t, DIVE_LAND, L('liv', 1.75, lv + 0.1, -1.8), 0.55, 6, 0.8, new THREE.Color(0xe6f4ff));
      duck.visible = lv > 0.15; duck.position.set(1.15 + 0.35 * Math.sin(t * 0.9), lv - 0.02 + 0.015 * Math.sin(t * 5), -1.0); duck.rotation.set(0.08 * Math.sin(t * 4), 0.6 + 0.3 * Math.sin(t * 0.7), 0); burst(t, DIVE_LAND, L('liv', 1.75, lv, -1.8), 90, 2.4, [new THREE.Color(0x9fd4ff), new THREE.Color(0xe6f4ff)], 0.8);
      if (t > DIVE_LAND && t < DIVE_LAND + 0.4) jolt = 0.016 * Math.exp(-(t - DIVE_LAND) * 8);
    } else if (S === 'kit') {
      put(mom, 'kit', momPose(t));
      const POP = 29.9;
      toast.forEach((s, k) => { const a = Math.max(0, t - POP - k * 0.04), fl = Math.min(a, 0.92); const y = Math.max(1.0, 1.0 + 4.5 * fl - 4.9 * fl * fl); s.position.set(TOASTER[0] + (k - 0.5) * (0.05 + 0.5 * fl), y, TOASTER[1] + 0.75 * fl); s.rotation.set(fl * 5, 0, fl * 9 * (k ? -1 : 1)); });
      for (let k = 0; k < 6; k++) { const age = ((t * 0.7 + k / 6) % 1); steam.set(k, L('kit', 1.47 + 0.15 * age, 1.1 + age * 0.8, -2.42), 0.15 + age * 0.35, 0.35 * (1 - age), puffCol); }
      if (t > POP && t < POP + 0.25) jolt = 0.006 * Math.exp(-(t - POP) * 10);
    } else if (S === 'lib') {
      put(gran, 'lib', granPose(t));
      READERS.forEach((_, i) => put(crowd[i], 'lib', readerPose(t, i)));
      const fall = K(t, [[SCREAM + 0.18, 0], [SCREAM + 0.62, 1]], (u) => u * u);
      lib.sign.position.copy(signHome); lib.sign.rotation.set(fall * (PI / 2 - 0.05), 0, 0.2 * fall);
      dust(t, SCREAM + 0.62, L('lib', 0.62, 0.15, -3.0), 0.5, 5, 0.8);
      if (t > SCREAM && t < SCREAM + 0.45) jolt = 0.01 * Math.exp(-(t - SCREAM) * 6);
      // liftoff: a rocket plume under her feet, then she punches through the ceiling
      if (t > LIFT - 0.1 && t < CEIL + 0.25) { const fy = 15 * Math.max(0, t - LIFT) ** 2; for (let k = 0; k < 7 && bfN < bfire.items.length; k++) { const j = Math.sin(t * 40 + k * 3) * 0.05; bfire.set(bfN++, L('lib', j, fy - 0.1 - k * 0.22, -4.35), 0.55 - k * 0.05, 1 - k * 0.11); } }
      for (let k = 0; k < 5 && t > LIFT && bsN < bsmoke.items.length; k++) { const ph = ((t - LIFT) * 0.8 + k / 5) % 1; bsmoke.set(bsN++, L('lib', 0.25 * Math.sin(k * 2.1), 0.2 + ph * 3.2, -4.35), 0.6 + ph * 1.2, 0.55 * (1 - ph) * K(t, [[LIFT, 0], [LIFT + 0.2, 1]]), smokeCol); }
      boom(t, CEIL, L('lib', 0, 3.6, -4.35), 0.9, 8); dust(t, CEIL, L('lib', 0, 3.5, -4.35), 1.2, 8, 1.4);
      hole.visible = t > CEIL;
      if (t > LIFT && t < CEIL) jolt = Math.max(jolt, 0.012);
      if (t > CEIL && t < CEIL + 0.4) jolt = Math.max(jolt, 0.03 * Math.exp(-(t - CEIL) * 8));
    } else if (S === 'radio') {
      radio.update(t); radio.setPower(1); radio.setOnAir(1); radio.setListeners(t < ZERO ? 1 : 0);
      put(dj, 'radio', djPose(t));
    } else if (S === 'city') {
      city.setTime({ day: 0, golden: 0, power: 1, milky: 0.25, moon: 1 });
      const OUT = { F: 37.0, M: 37.25, S: 37.55, A: 37.8, D: 38.05 };
      const order = ['S', 'A', 'D', 'F', 'M'];
      tower.letters.forEach((Lt, i) => {
        const ch = order[i], off = t > OUT[ch];
        Lt.m.color.copy(Lt.on).multiplyScalar(off ? 0.06 : 1);
        if (ch === 'D') { const sw = K(t, [[38.05, 0], [38.35, 2.6], [38.55, 2.2], [38.75, 2.45], [38.95, 2.35]], (u) => u * u); Lt.g.rotation.z = sw; }
        _v.copy(Lt.g.getWorldPosition(_w)); _v.y += 0.9; spark(t, OUT[ch], _v.clone(), 1.6);
      });
      tower.beacons.forEach((b, k) => { b.color.setHex(0xff2a1a).multiplyScalar(t > 37.15 + k * 0.22 ? 0.05 : 2.2); });
      boom(t, 38.05, new THREE.Vector3(-10.5, ROOF_Y + 1.0, 12.5), 3.4, 16); boom(t, 38.3, new THREE.Vector3(-10.5, ROOF_Y + 6.0, 12.5), 2.4, 10);
      if (t > 38.5) flames(t, new THREE.Vector3(-10.5, ROOF_Y + 0.4, 12.5), 1.6, 4);
      towerPivot.rotation.x = -K(t, [[38.2, 0], [39.0, 1.25]], (u) => u * u);
      if (t > 38.05 && t < 38.6) jolt = 0.06 * Math.exp(-(t - 38.05) * 6);
    } else if (S === 'rest') {
      const u = tl(t), fast = t > TL0 && t < TL1;
      rest.update(fast ? t * 6 : t);
      put(you, 'rest', datePose(t, -1)); put(her, 'rest', datePose(t, 1));
      outfit(you, 0x2f4a73, 0x2c3140); you.hood.visible = false;
      [0, 1].forEach((i) => put(crowd[4 + i], 'rest', dinerPose(t, i)));
      put(waiter, 'rest', waiterPose(t));
      // the clock: 7:00 → 11:00
      const hours = 7 + 4 * u; minH.rotation.z = -(hours % 1) * 2 * PI; hourH.rotation.z = -(hours / 12) * 2 * PI;
      // the candle burns down; the pendants dim; table 3's chairs go up on the table
      if (candle0) candle0.scale.y = lerp(1, 0.25, u), candle0.position.y = 0.06 * lerp(1, 0.25, u);
      T0.flame.position.y = 0.04 + 0.12 * lerp(1, 0.25, u);
      const off = K(t, [[TL1 - 0.4, 0], [TL1, 1]]);
      rest.lights.pends.forEach((l, i) => (l.intensity = (i === 0 ? 3.2 : 3.2 * (1 - 0.85 * u))));
      rest.lights.hemi.intensity = 1.25 * (1 - 0.35 * u - 0.4 * off); rest.lights.key.intensity = 52 * (1 - 0.3 * u - 0.45 * off); rest.lights.barL.intensity = 3.5 * (1 - off);
      T3.chairs.forEach((c, k) => {
        const f = K(t, [[TL0 + 1.6 + k * 0.35, 0], [TL0 + 1.85 + k * 0.35, 1]]);
        c.position.set(lerp(chairHome[k].p.x, T3.x + (k ? 0.18 : -0.18), f), lerp(0, 1.24, f), lerp(chairHome[k].p.z, T3.z, f));
        c.rotation.set(PI * f, chairHome[k].r.y, 0);
      });
      T3.dishes.visible = t < TL0 + 1.5;
      heroDishes.visible = true;
      if (t > TL0 + 1.4 && t < FLEE + 0.1) { mop.visible = true; const w = handWorld(waiter, 1); mop.position.set(w.x, OFF.rest[1], w.z + 0.1); mop.rotation.set(0.25 * Math.sin(t * 12), 0, 0.3); }
      else if (t >= FLEE + 0.1) { mop.visible = true; mop.rotation.set(0, 0, 1.45); }
      let glow = 0;
      METEORS.forEach(([t0, x, vx], i) => {
        const m = meteors[i], age = t - t0; if (age < 0 || age > 1.3) return;
        m.visible = true;
        if (age < 0.55) { m.position.set(x - vx * (0.55 - age), 3.0 - 2.4 * age, -3.46); m.scale.set(0.16, 0.62, 1); m.material.rotation = Math.atan2(-2.4, vx) + PI / 2; m.material.opacity = 1; }
        else { const a = age - 0.55; m.position.set(x, 1.7 + 0.25 * a, -3.47); m.scale.setScalar(0.5 + 1.6 * a); m.material.rotation = 0; m.material.opacity = Math.max(0, 1 - a / 0.75); glow += Math.exp(-a * 4); }
      });
      meteorLight.intensity = 9 * glow;
    } else if (S === 'stad') {
      [0, 1, 2].forEach((w) => put([you, her, boys[2]][w], 'stad', kissPose(t, w)));
      NEAR.forEach((_, i) => put(crowd[6 + i], 'stad', fanPose(t, i)));
      const cheer = K(t, [[KISS + 0.05, 0], [KISS + 0.4, 1]]);
      stad.updateFans(t, (f) => {
        if (f.field && Math.abs(f.z - CZ) < 2.4 && f.x > CX - 6 && f.x < CX + 3.2) return { y: -20 };
        if (f.field && shot.cam === 'kissA' && Math.abs(f.z - CZ) < 1.7 && f.x > CX && f.x < CX + 9) return { y: -20 };
        const d = Math.hypot(f.x - CX, f.z - CZ), a = t - (KISS + 0.06 + d / 40);
        if (a > 0) { const v0 = 4 + 10 * Math.exp(-d / 30); return { y: Math.max(0, v0 * a - 4.9 * a * a), arms: 1, sway: Math.min(1.5, a * 3.5) * (f.seed > 0.5 ? 1 : -1) }; }   // the kiss shockwave: everybody, airborne
        return { y: 0, arms: Math.max(0.15 * Math.sin(t * 2 + f.seed * 9) + 0.1, cheer), sway: 0.08 * Math.sin(t * 2.2 + f.seed * 7) };
      });
      const ka = t - KISS;
      if (ka > 0 && ka < 1.1) { kissRing.visible = true; kissRing.scale.setScalar(0.4 + 26 * ka); kissRing.material.opacity = 1 - ka / 1.1; }
      if (popcorn.visible) { boys[2].root.updateMatrixWorld(true); burst(t, KISS + 0.08, popcorn.getWorldPosition(_w).clone().add(_v.set(0, 0.12, 0)), 70, 2.6, POP_C, 0.75); }
      if (ka > 0 && ka < 0.6) jolt = 0.035 * Math.exp(-ka * 6);
      // the kiss cam feed: searches the crowd, finds you, zooms in
      const find = K(t, [[44.3, 0], [44.75, 0.55], [45.15, 1.06], [45.4, 1]]);
      const tz = lerp(CZ + 4.2, CZ + 0.0, find), fov = lerp(34, 24, K(t, [[45.4, 0], [46.2, 1]]));
      kissCam.position.copy(L('stad', CX - 3.4, 1.72, tz)); kissCam.lookAt(L('stad', CX, 1.55, tz)); kissCam.fov = fov; kissCam.updateProjectionMatrix();
      studio.renderer.setRenderTarget(rt); studio.renderer.render(scene, kissCam); studio.renderer.setRenderTarget(null);
      ledMat.map = rt.texture; frame.visible = true;
      // hearts burst at the kiss
      hearts.forEach((h, i) => {
        const [a, b, c, d] = heartSeeds[i], age = t - KISS - c * 0.6; if (age < 0 || age > 1.5) return;
        h.visible = true; const k = Math.min(1, age / 0.15), s = (0.16 + 0.12 * d) * k * (1 + 0.2 * Math.sin(Math.min(1, age / 0.3) * PI));
        h.position.copy(L('stad', CX - 0.2 + b * 0.8, 1.7 + age * (0.6 + d * 0.5), CZ + a * 2.2)); h.scale.set(s, s, 1); h.material.opacity = age > 1.1 ? 1 - (age - 1.1) / 0.4 : 1;
      });
    } else if (S === 'space') {
      // her yes, seen from orbit: a pink shockwave rolls out from your house and crosses the planet (three echoes)
      const Rr = space.R * 1.004;
      rings.forEach((r, k) => {
        const u = clamp((t - 9.12 - k * 0.32) / 1.5); r.visible = u > 0 && u < 1;
        const th = 0.02 + 1.25 * (1 - (1 - u) ** 2); r.position.copy(EPI).multiplyScalar(Rr * Math.cos(th)); r.scale.setScalar(Rr * Math.sin(th)); r.material.opacity = (1 - u) * (k ? 0.6 : 1);
      });
      const fa = t - 9.05; epiFlash.position.copy(EPI).multiplyScalar(space.R * 1.02); epiFlash.scale.setScalar(fa > 0 ? 60 + 140 * Math.min(1, fa / 0.3) : 0.01); epiFlash.material.opacity = fa > 0 ? Math.max(0, 1 - fa / 1.6) : 0;
    } else if (S === 'wed') {
      put(groom, 'wed', weddingPose(t, 0)); put(bride, 'wed', weddingPose(t, 1));
      boys.forEach((b, i) => { suit(b, true); const p = gmPose(t, i); put(b, 'wed', p); if (t > 50.7 && t < FAINT[i] + 0.2) tears(t, b, K(t, [[50.7, 0], [50.9, 1]])); dust(t, FAINT[i] + 0.42, L('wed', GM[i][0] - 0.75 * Math.sin(0.55), 0.2, GM[i][1] - 0.75 * Math.cos(0.55)), 0.55, 5, 0.8); });
      put(crowd[10], 'wed', (() => { const p = basePose(); p.eyes = blink(t, 1); Object.assign(p, { x: WD.officiant[0], z: WD.officiant[1], rotY: 0, mouth: talk(t, 6) }); p.armA = A(-0.8, 0.1, -1.2, 0.5); p.armB = A(-0.8, 0.1, -1.2, -0.5); return p; })());
      outfit(crowd[10], 0x2a2a30, 0x2a2a30);
      [[-1.3, -1.4], [1.3, -1.4], [2.0, -1.4], [-2.0, -0.4], [1.3, -0.4]].forEach(([x, z], k) => { const c = crowd[k]; const p = basePose(); p.eyes = blink(t, k + 2); Object.assign(p, { x, z, rotY: PI + 0.1 * Math.sin(k), y: seatY(WD.seat), footFwd: 0.42, mouth: t > 52 ? 'o' : 'smile', headPitch: -0.1 }); p.armA = READ_A; p.armB = READ_B; put(c, 'wed', p); });
      cloud.g.visible = true; cloud.g.scale.setScalar(1.25);
      const come = K(t, [[49.5, 0], [50.6, 1]]);
      cloud.g.position.copy(L('wed', -0.5 + 0.08 * Math.sin(t * 1.3), lerp(7.5, 3.3, come), -3.35));
      cloud.update(t, { petals: K(t, [[50.7, 0], [51.4, 1]]), mood: 'smile', fall: 3.1, white: 1, bow: true, bandage: true });
      HEART.forEach(([hx, hy, side, r], j) => {
        const arr = K(t, [[49.9 + 0.6 * r, 0], [50.9 + 0.5 * r, 1]], (u) => 1 - (1 - u) ** 3); if (arr <= 0) return;
        const tx = -0.5 + hx * 0.085, ty = 3.4 + (hy + 2.5) * 0.085, q = L('wed', lerp(tx + side * 9, tx, arr) + 0.04 * Math.sin(t * 3 + j), lerp(ty + 2.5, ty, arr) + 0.05 * Math.sin(t * 4 + j), lerp(-7.5, -3.6, arr));
        flock.add(q.x, q.y, q.z, { rotY: lerpAngle(side > 0 ? -PI / 2 : PI / 2, 0, K(arr, [[0.8, 0], [1, 1]])), s: 1.25, flap: Math.abs(Math.sin(t * 20 + j)), color: BIRD_C[j % BIRD_C.length] });
      });
      if (t > FAINT[3] + 0.42 && t < FAINT[3] + 0.8) jolt = 0.01 * Math.exp(-(t - FAINT[3] - 0.42) * 8);
    }

    drops.count = Math.max(1, dropN); if (dropN === 0) drops.setMatrixAt(0, _m.makeScale(0, 0, 0)); drops.instanceMatrix.needsUpdate = true;
    flock.end(); conf.count = confN; conf.instanceMatrix.needsUpdate = true; if (conf.instanceColor) conf.instanceColor.needsUpdate = true;
    boomLight.intensity = 70 * flash;
    frame.visible = S === 'stad';

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
    if (shot.cam === 'oldA' || shot.cam === 'oldC') {   // the joke bubbles, sized for the lens (016 say())
      oldYou.root.updateMatrixWorld(true); const hd = oldYou.head.g.getWorldPosition(camW).clone(); hd.x += 0.12; hd.y += 0.24;
      const d = studio.camera.position.distanceTo(hd), fw = 2 * d * Math.tan((studio.camera.fov * PI) / 360) * (9 / 16);
      BUBBLES.forEach(([a, b], i) => { const k = K(t, [[a, 0], [a + 0.12, 1.12], [a + 0.22, 1], [b - 0.15, 1], [b, 0]]); if (k > 0.01) { jokeB[i].sprite.position.copy(hd); jokeB[i].setRows(1); jokeB[i].setPop(k * 0.6 * fw); } });
    }
  }
  return { update };
}
