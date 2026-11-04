// VIDEO dh010 — "What if your aura doubled every day?"  (tone FUNNY: a meme what-if, a doubling POV ladder that ends
// planet-scale). Todd (glasses, mustard cardigan, the least cool man alive) has exactly 1 aura on day 1: the no-look toast catch
// bonks him on the head. Every day it doubles (day n = 2^(n−1)) and it is LITERAL: a soft gold glow that grows from a faint rim to
// a dome to a city-wide pillar to a light that outshines the Sun, and the world gets cooler around him: wind indoors, the coffee
// pours itself, the cat salutes, sunglasses fall from the sky, slow motion, the office stands up, every light turns green, pigeons
// fly in formation, a stadium does the wave, planes route around him, the Moon reflects him, the Sun puts on sunglasses.
// Day 31, peak aura (1,073,741,824): a neighbor waves, he waves back — she was waving at the mailman. −∞ aura in one frame, and
// −∞ × 2 is still −∞: the anti-aura has its own gravity (it eats his lawn ornaments, then the Moon, then the Sun, sunglasses on).
// The joke is on Todd and on aura culture. Cartoon only: nobody is hurt, the birds flee (never sucked in), the cat clings and is fine.
// No real people: Todd, the neighbors, the office and the mail carrier are ours; no viral clip is recreated, no brand, no lyrics.
//
// Sources (checked Oct 31 2026):
//  - "aura" / "aura points": Gen Z slang for effortless coolness, scored like game points (+1000 aura for something smooth, −aura for
//    cringe); spread on TikTok and X in 2024 (aura-points jokes notably in May 2024): Know Your Meme, "Aura Points" + "Aura (Slang)";
//    Merriam-Webster notes the slang sense spread from 2020 and went viral in summer 2024 (via Today.com, "What does 'aura' mean?")
//  - "aura farming": Oxford University Press shortlisted it for Oxford Word of the Year 2025 with "biohack" and "rage bait" (rage bait
//    won): OUP, "Meet the candidates for Oxford Word of the Year 2025"; CBS News (Dec 2025). Merriam-Webster + Dictionary.com have
//    slang entries for it. (HUD: OXFORD 2025 SHORTLIST · "AURA FARMING")
//  - stadium waves: 14 waves in stadiums of 50,000+ people roll at ≈ 12 m/s (≈ 20 seats a second), 6–12 m wide, mostly clockwise:
//    Farkas, Helbing & Vicsek, "Mexican waves in an excitable medium", Nature 419, 131–132 (2002). Ours laps at ≈ 60 m/s (5×, a joke)
//  - the Sun's luminosity: 3.828 × 10²⁶ W (IAU 2015 Resolution B3 nominal value)
//  - light to the Moon: 384,400 km (mean, NASA Moon fact sheet) ÷ 299,792 km/s ≈ 1.28 s ("1.3 s")
//  - the doubling: 1 aura on day 1 → 2^(n−1) on day n; day 31 = 2^30 = 1,073,741,824. −∞ × 2 = −∞ (the punch line is the math)
//  - made-up on purpose (jokes): 31 km/h indoor wind, 14 green lights, "flights rerouted: all of them", the Sun's sunglasses
//
// Shot list (seconds)                                 | set    | what happens
//  0.0– 6.0  kit1   DAY 1 · 1                         | kitchen| (title over it) Todd tries the no-look toast catch: it bonks his head, the cat squints
//  6.0–10.6  kit2   DAY 2 · 2 (premise, music in)     | kitchen| a faint gold rim pops on ("+1 aura"); the same catch — perfect. The cat's eyes go wide
// 10.6–15.4  kit3   DAY 5 · 16                        | kitchen| wind indoors (hair, curtains, napkins), the carafe floats over and pours, the cat salutes ("+1000 aura")
// 15.4–20.2  burb   DAY 8 · 128                       | suburb | he walks down his path in slow motion; sunglasses drop out of the sky onto his face; the neighbor drops the hose
// 20.2–25.4  office DAY 11 · 1,024                    | office | he walks in down the aisle: the rows stand up as he passes, papers fly, everyone claps ("+1000 AURA" ×3)
// 25.4–30.4  street DAY 14 · 8,192                    | street | every traffic light turns green as he walks; a V of pigeons flies in formation behind him; a gold dome
// 30.4–33.0  stadA  DAY 17 · 65,536                   | stadium| on the field in a building-size dome; the stands do the wave behind him
// 33.0–35.6  stadB                                    | stadium| blimp view: the wave laps the whole bowl (5× normal speed), cards flash gold
// 35.6–40.6  night  DAY 21 · 1,048,576                | city   | a gold pillar into the clouds over downtown; the clouds part; a jet banks around it; a roof guy points
// 40.6–45.6  spc1   DAY 26 · 33,554,432               | space  | from orbit, a gold star on the night side; the Moon's near side turns gold
// 45.6–50.8  sun    DAY 31 · 1,073,741,824            | space  | his glare swells past the Sun's; giant sunglasses drop onto the Sun
// 50.8–52.0  waveA  peak aura                         | suburb | at his mailbox: neighbors bow, pigeons circle, the cat salutes from the mailbox
// 52.0–52.9  waveB                                    | suburb | his POV: across the street, a neighbor waves
// 52.9–56.4  waveC  → −∞ at FREEZE                    | suburb | he waves back, big. The mail carrier walks past behind him, waving back at her. Freeze. −∞.
//                                                     |        | the glow implodes, the sunglasses slide off, everyone covers their eyes ("−∞ AURA"), the cat turns away
// 56.4–60.4  hole   DAY 32 · −∞                       | suburb | the anti-aura opens behind him: gnome, flamingo, bike, trash lid, chair, the sunglasses spiral in
// 60.4–69.0  eat    DAY 33 · −∞                       | space  | it eats the Moon (GULP!), then the Sun races in, sunglasses on (GULP!). Fade 64.0, card 64.6
// t ≥ 200: pose lineup (debug)
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, walkLegs, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, HIP_H } from '@engine/rig.js';
import { makeSpeechBubble, makeBirdFlock, makeCat, makeMug } from '@engine/props.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildSuburb, SW_H } from '@engine/sets/suburb.js';
import { buildOpenOffice, DIMS as OD } from '@engine/sets/openoffice.js';
import { buildStreet, SIDEWALK_H } from '@engine/sets/street.js';
import { buildStadium } from '@engine/sets/stadium.js';
import { buildCity, ROOF_Y } from '@engine/sets/city.js';
import { buildSpace, makeSpritePool, makeJet } from '@engine/sets/tech.js';

const PI = Math.PI;
// city.js must stay at the origin (its sky domes follow the camera in world space)
const OFF = { kit: [9000, 0, 0], burb: [-3000, 0, 0], off: [3000, 0, 0], street: [-6000, 0, 0], stad: [6000, 0, 0], city: [0, 0, 0], space: [0, 0, 40000] };

// ---------------------------------------------------------------- the timeline (make_story.py + make_cues.py mirror these)
export const TIMES = {
  TOAST1: 4.05, BONK: 4.6, GLOW_ON: 6.3, TOAST2: 7.7, CATCH: 8.25, WIND: 10.75, LIFT: 11.5, POUR0: 12.35, POUR1: 13.6, SALUTE: 13.95,
  SHADES0: 16.45, SHADES1: 16.95, HOSE: 17.15, FLAG: 18.6, ODOOR: 20.3, STAND: 21.3, CLAP: 22.45,
  LIGHT1: 25.9, LIGHT2: 26.8, LIGHT3: 27.7, LIGHT4: 28.6, BIRDS: 27.6, WAVE_AT: 34.3, WAVE_W: 1.25,
  CLOUDS: 39.0, JET: 37.6, BEAM0: 41.0, MOONLIT: 42.3, OUTSHINE: 46.4, SUNSHADES: 48.5,
  NBWAVE: 52.05, TODDWAVE: 52.95, MAIL: 52.9, FREEZE: 54.05, THAW: 54.6, HOLE: 56.55, MOONIN: 60.9, MOONGULP: 62.0, SUNIN: 62.55, SUNGULP: 63.55,
};
const T_ = TIMES;
export const SHOTS = [
  { t0: 0, t1: 6.0, cam: 'kit1', set: 'kit' },
  { t0: 6.0, t1: 10.6, cam: 'kit2', set: 'kit' },
  { t0: 10.6, t1: 15.4, cam: 'kit3', set: 'kit' },
  { t0: 15.4, t1: 20.2, cam: 'burb', set: 'burb' },
  { t0: 20.2, t1: 25.4, cam: 'office', set: 'off' },
  { t0: 25.4, t1: 30.4, cam: 'street', set: 'street' },
  { t0: 30.4, t1: 33.0, cam: 'stadA', set: 'stad' },
  { t0: 33.0, t1: 35.6, cam: 'stadB', set: 'stad' },
  { t0: 35.6, t1: 40.6, cam: 'night', set: 'city' },
  { t0: 40.6, t1: 45.6, cam: 'spc1', set: 'space' },
  { t0: 45.6, t1: 50.8, cam: 'sun', set: 'space' },
  { t0: 50.8, t1: 52.0, cam: 'waveA', set: 'burb' },
  { t0: 52.0, t1: 52.9, cam: 'waveB', set: 'burb' },
  { t0: 52.9, t1: 54.6, cam: 'waveC', set: 'burb' },
  { t0: 54.6, t1: 56.4, cam: 'cringe', set: 'burb' },
  { t0: 56.4, t1: 60.4, cam: 'hole', set: 'burb' },
  { t0: 60.4, t1: 69.0, cam: 'eat', set: 'space' },
  { t0: 200, t1: 400, cam: 'lineup', set: 'street' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 2];

// space layout (local to the space root): the town sits on the night side; the Moon above it; the Sun far toward +x
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const SUN_DIR = v3(1000, 250, 300).normalize(), SUN0 = SUN_DIR.clone().multiplyScalar(4600);
const TOWN = v3(-0.8, 0.42, 0.43).normalize(), TP = TOWN.clone().multiplyScalar(404);
const UPT = v3(0, 1, 0).addScaledVector(TOWN, -TOWN.y).normalize(), RTT = new THREE.Vector3().crossVectors(TOWN, UPT).normalize();
const MOON0 = TP.clone().addScaledVector(UPT, 750).addScaledVector(TOWN, 300).addScaledVector(RTT, 150);
const HOLE_S = TP.clone().addScaledVector(TOWN, 110);

// camera coords are LOCAL to the shot's set. p/a = [start, end]; fn(t) overrides.
export const CAMS = {
  kit1: { p: [[0.95, 1.5, 1.55], [0.82, 1.47, 1.25]], a: [[-0.45, 1.3, -1.8], [-0.47, 1.3, -1.8]], fov: 50, amp: 0.004 },
  kit2: { p: [[0.45, 1.46, 0.75], [0.38, 1.45, 0.55]], a: [[-0.5, 1.48, -1.9], [-0.52, 1.48, -1.9]], fov: 48, amp: 0.004 },
  kit3: { p: [[1.75, 1.55, 0.85], [1.55, 1.52, 0.65]], a: [[-0.62, 1.25, -1.95], [-0.62, 1.25, -1.95]], fov: 50, amp: 0.005 },
  burb: { p: [[-1.45, 1.1, -0.5], [-1.75, 1.22, -2.3]], a: [[-2.0, 1.5, -7.0], [-2.25, 1.68, -7.0]], fov: 44, amp: 0.004 },
  office: { p: [[3.5, 2.0, -4.6], [3.25, 1.95, -4.35]], a: [[-1.5, 1.1, 3.5], [-1.1, 1.15, 2.6]], fov: 62, amp: 0.004 },
  street: { p: [[-6.4, 1.5, -1.25], [-4.1, 1.5, -1.3]], a: [[6.0, 1.6, -0.95], [6.0, 1.6, -0.95]], fov: 36, amp: 0.004 },
  stadA: { p: [[19.5, 1.5, 2.0], [20.1, 1.48, 1.85]], a: [[60, 4.5, -1.0], [60, 4.5, -1.0]], fov: 54, amp: 0.005 },
  stadB: { p: [[-62, 46, 14], [-38, 32, 30]], a: [[18, 0, -4], [16, 0, 2]], fov: 56, amp: 0 },
  night: { p: [[-8.2, 17.45, 15.4], [-8.0, 17.4, 14.9]], a: [[1.5, 53, -80], [1.5, 57, -80]], fov: 54, amp: 0.004 },
  spc1: { p: [[-796, -287, 428], [-722, -180, 390]], a: [[-242, 512, 130], [-246, 506, 132]], fov: 50, amp: 0 },
  sun: { p: [[-2060, 720, 60], [-1840, 650, 78]], a: [[-323, 370, 174], [-323, 372, 174]], fov: 52, amp: 0 },
  waveA: { p: [[-0.95, 1.18, 2.7], [-0.98, 1.2, 2.35]], a: [[-1.05, 1.72, -2.5], [-1.05, 1.72, -2.5]], fov: 50, amp: 0.004 },
  waveB: { p: [[-1.22, 1.6, -0.85], [-1.22, 1.6, -0.7]], a: [[-1.6, 1.42, 8.0], [-1.6, 1.42, 8.0]], fov: 30, amp: 0.003 },
  waveC: { p: [[0.6, 1.45, 1.5], [0.5, 1.45, 1.3]], a: [[-1.5, 1.55, -2.2], [-1.5, 1.55, -2.2]], fov: 44, amp: 0.004 },
  cringe: { p: [[0.25, 1.8, 3.3], [0.45, 1.85, 3.6]], a: [[-1.1, 2.35, -2.6], [-1.1, 2.35, -2.6]], fov: 50, amp: 0.004 },
  hole: { p: [[0.9, 1.35, 4.4], [1.3, 1.5, 5.4]], a: [[-1.4, 2.4, -2.2], [-1.4, 2.6, -2.2]], fov: 52, amp: 0.006 },
  eat: { p: [[-860, -360, 470], [-900, -400, 490]], a: [[-242, 560, 130], [-242, 560, 130]], fov: 52, amp: 0 },
  lineup: { p: [[0, 1.2, 8.8], [0, 1.2, 8.8]], a: [[0, 1.05, 3.5], [0, 1.05, 3.5]], fov: 34, amp: 0 },
};

// ---------------------------------------------------------------- arm library (rig: sx<0 forward, sz>0 out, el<0 bend)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const HEAD_A = A(-2.3, 0.75, -2.0, 0.6), HEAD_B = A(-2.3, 0.75, -2.0, -0.6);             // hands on the head (despair)
const EYES_A = A(-1.55, 0.3, -2.35, 0.8), EYES_B = A(-1.55, 0.3, -2.35, -0.8);           // hands over the eyes (cringe)
const CROSS_A = A(-0.75, 0.05, -1.75, 0.95), CROSS_B = A(-0.7, 0.05, -1.7, -0.95);         // arms crossed (cool)
const BACK_B = A(-2.65, 0.45, -1.5, -0.2);                                                // reaching back over the shoulder (no-look catch)
const CATCH_B = A(-0.55, 0.3, -1.6, -0.3);                                                 // holding the toast in front of the chest
const HOSE_B = A(-0.85, 0.2, -0.5, -0.2);                                                  // holding a hose low
const POINT_B = A(-1.75, 0.35, -0.12, 0);                                                  // pointing up/ahead
const BOW_A = A(-1.35, 0.25, -0.15), BOW_B = A(-1.35, 0.25, -0.15);                       // arms forward, a worship bow
/** waving: upper arm out + up, forearm up, rocking side to side (the elbow angle) */
const wave = (t, rate = 3.2, big = 1) => A(-1.57, 1.57, -1.57 + 0.38 * big * Math.sin(t * rate * 2 * PI));   // 019's GOAL (upper arm out, forearm up), rocking
/** clapping: forearms forward and in, hands meeting in front of the chest */
const clap = (t, ph = 0, side = 1) => { const s = Math.max(0, Math.sin((t * 3.6 + ph) * 2 * PI)); return A(-1.05, 0.5 - 0.32 * s, -1.25, side * 0.75); };
const seatY = (top) => -0.375 + (top - 0.42);

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8, 0x58b368, 0xa77bd1];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a, 0x3a4a3a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const GOLD = new THREE.Color(1.0, 0.74, 0.32);

function fitText(g, text, maxW, size, font = 'Helvetica, Arial, sans-serif', weight = 'bold') {
  let s = size; g.font = `${weight} ${s}px ${font}`;
  while (g.measureText(text).width > maxW && s > 8) { s -= 2; g.font = `${weight} ${s}px ${font}`; }
  return s;
}

// ---------------------------------------------------------------- build
export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const _V = new THREE.Vector3(), _W = new THREE.Vector3(), _M = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _E = new THREE.Euler(), _S = new THREE.Vector3();

  // ---------------------------------------------------------------- sets (save each fog right after its build)
  const city = buildCity(studio, {}); const cityFog = scene.fog;
  city.setTime({ day: 0, golden: 0, power: 1, milky: 0.25, moon: 0 }); city.setGrowth(0); city.setSnow(0);
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit);
  const burb = buildSuburb(studio, { poleClear: [-20, -11.5, -2.2, 4.5] }); burb.root.position.set(...OFF.burb);
  burb.hoop.g.visible = false;
  const office = buildOpenOffice(studio, {}); office.root.position.set(...OFF.off);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  street.root.children.filter((o) => o.isGroup && Math.abs(o.position.x + 3) < 1e-6 && Math.abs(o.position.z - 5.95) < 1e-6).forEach((o) => (o.visible = false));   // the parked car on the road
  const stad = buildStadium(studio, {}); stad.root.position.set(...OFF.stad);
  stad.root.children.filter((o) => o.isMesh && o.geometry.type === 'BoxGeometry' && o.geometry.parameters.width === 52 && o.geometry.parameters.depth === 48).forEach((o) => (o.visible = false));   // the pit's floor cover (no field crowd here)
  const fanMeshes = stad.root.children.filter((o) => o.isInstancedMesh && o.instanceColor && o.geometry.type !== 'SphereGeometry');
  const fanCols = fanMeshes.map((m) => m.instanceColor.array.slice());
  stad.root.children.filter((o) => o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 16 && o.geometry.parameters.height === 9).forEach((o) => (o.visible = false));   // the DANCE CAM jumbotrons crop onto the HUD
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space); space.setSpin(1.4);
  space.root.children.filter((o) => o.isSprite && o.position.x === 2000 && o.position.y === 500).forEach((o) => (o.visible = false));   // buildSpace's own sun disc (we build a visible Sun)
  const ROOTS = { kit: kit.root, burb: burb.root, off: office.root, street: street.root, stad: stad.root, city: city.root, space: space.root };
  const FOGS = { kit: null, burb: burb.fog, off: null, street: streetFog, stad: stad.fog, city: cityFog, space: null };
  const FAR = { kit: 60, burb: 420, off: 60, street: 400, stad: 600, city: 1500, space: 7000 };
  const L = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);
  const toWorld = (key, v) => v.clone().add(_V.set(...OFF[key]));

  // ---------------------------------------------------------------- cast
  const person = (o) => { const p = makePerson(o); scene.add(p.root); return p; };
  const todd = person({ skin: 0xf1c3a1, top: 0xc99a3e, collar: 0xf4f1ea, pants: 0x5a5f6a, hair: 0x5a3a24, hairStyle: 'short', glasses: true });
  const HR = 0.135;
  // wind hair: tufts on the back of his head that stream back and flutter (hidden when there is no wind)
  const tufts = Array.from({ length: 7 }, (_, i) => {
    const piv = new THREE.Group(); const a = (i - 3) * 0.32;
    piv.position.set(Math.sin(a) * HR * 0.8, HR * (0.78 - Math.abs(i - 3) * 0.06), -HR * 0.35 + Math.cos(a) * HR * 0.2); todd.head.g.add(piv);
    const c = mk(new THREE.ConeGeometry(HR * 0.17, HR * (1.05 + (i % 3) * 0.25), 8), todd.mats.hair, piv, 0, 0, -HR * 0.5); c.rotation.x = -PI / 2; c.castShadow = false;
    return piv;
  });
  const setWind = (w, t) => {
    tufts.forEach((p, i) => { p.visible = w > 0.02; p.scale.setScalar(Math.max(0.01, w)); p.rotation.set(0.25 + 0.22 * Math.sin(t * (9 + i) + i * 1.3) * w, 0.18 * Math.sin(t * (7 + i * 0.7) + i), 0); });
    todd.head.hair.rotation.x = -0.05 * w * (1 + 0.4 * Math.sin(t * 13));
  };
  const extras = Array.from({ length: 18 }, (_, i) => person({ skin: SKINS[(i * 3 + 1) % SKINS.length], top: TOPS[(i * 5 + 2) % TOPS.length], collar: 0xf4f1ea, pants: PANTS[(i * 2) % PANTS.length], hair: HAIRS[(i * 3) % HAIRS.length], hairStyle: ['short', 'bob', 'messy', 'none', 'short', 'bob'][i % 6], glasses: i % 5 === 2, mustache: i % 6 === 3 ? 0x2a1d16 : null }));
  const neighbor = person({ skin: 0xc98e6a, top: 0x58b368, collar: 0xf4f1ea, pants: 0x6b5a48, hair: 0x2a1d16, hairStyle: 'none', mustache: 0x2a1d16 });
  const waver = person({ skin: 0x9a6447, top: 0xe58fa6, collar: 0xf6f2e6, pants: 0x45607a, hair: 0x1a1a1a, hairStyle: 'bob', dress: 0x8f6fb8 });
  const mailman = person({ skin: 0xe2ad8c, top: 0x3d6fb0, collar: 0xf4f1ea, pants: 0x34405c, hair: 0x5a3a24, hairStyle: 'short' });
  { const cap = new THREE.Group(); cap.position.set(0, HR * 0.72, 0); mailman.head.g.add(cap); mk(new THREE.CylinderGeometry(HR * 1.02, HR * 1.06, HR * 0.5, 20), mat(0x2f4f73, 0.6), cap, 0, HR * 0.2, 0); mk(new THREE.BoxGeometry(HR * 1.5, HR * 0.08, HR * 0.9), mat(0x1d2a38, 0.5), cap, 0, 0, HR * 0.75); }
  const bag = new THREE.Group(); scene.add(bag); mk(new THREE.BoxGeometry(0.34, 0.28, 0.12), mat(0x6a4a32, 0.7), bag, 0, 0, 0); mk(new THREE.BoxGeometry(0.36, 0.08, 0.13), mat(0x5a3e2a, 0.7), bag, 0, 0.12, 0.005);
  const ALL = [todd, ...extras, neighbor, waver, mailman];

  // ---------------------------------------------------------------- the aura (additive, camera-facing, BEHIND him so his face stays clean)
  const glowTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,238,190,0.8)'); gr.addColorStop(0.5, 'rgba(255,200,110,0.3)'); gr.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const dotTex = canvasTex(32, 32, (g, w, h) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,240,200,0.6)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const raysTex = canvasTex(512, 512, (g, w, h) => { g.translate(256, 256); for (let k = 0; k < 18; k++) { const a0 = (k * 2 * PI) / 18, a1 = a0 + (PI / 18) * 0.95; const gr = g.createRadialGradient(0, 0, 20, 0, 0, 256); gr.addColorStop(0, 'rgba(255,236,170,0)'); gr.addColorStop(0.2, 'rgba(255,226,140,0.95)'); gr.addColorStop(1, 'rgba(255,205,95,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 256, a0, a1); g.closePath(); g.fill(); } });
  const tintSprite = (map, col) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: col.clone(), transparent: true, depthWrite: false, toneMapped: false, fog: false })); s.visible = false; scene.add(s); return s; };
  const addSprite = (map, col, parent = scene) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: col.clone(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false })); s.visible = false; parent.add(s); return s; };
  const rimMat = (col) => new THREE.ShaderMaterial({
    uniforms: { uC: { value: col.clone() }, uOp: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uC; uniform float uOp; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(1.0 - abs(dot(vN, vV)), 0.0, 1.0), 2.0); gl_FragColor = vec4(uC, (0.05 + 0.8 * f) * uOp); }',
    transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  });
  const aura = (() => {
    const back = [addSprite(glowTex, GOLD), addSprite(glowTex, GOLD), addSprite(glowTex, GOLD)];
    const haze = tintSprite(glowTex, new THREE.Color(1.0, 0.8, 0.35)), rays = tintSprite(raysTex, new THREE.Color(1.0, 0.82, 0.38));
    haze.renderOrder = rays.renderOrder = 1;
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 24, 0, 2 * PI, 0, PI / 2), rimMat(GOLD)); shell.visible = false; shell.renderOrder = 2; scene.add(shell);
    const ground = mk(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ map: glowTex, color: GOLD, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false }), scene); ground.rotation.x = -PI / 2; ground.castShadow = false; ground.visible = false;
    const NM = 220, mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NM * 3), 3));
    const motes = new THREE.Points(mg, new THREE.PointsMaterial({ size: 0.022, map: dotTex, color: new THREE.Color(1.6, 1.25, 0.6), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, sizeAttenuation: true, toneMapped: false, fog: false }));
    motes.frustumCulled = false; motes.visible = false; scene.add(motes);
    const light = new THREE.PointLight(0xffc870, 0, 6, 1.6); scene.add(light);
    const MR = rng(41), MD = Array.from({ length: NM }, () => ({ a: MR() * 2 * PI, r: 0.55 + MR() * 0.6, v: 0.18 + MR() * 0.35, ph: MR(), w: (MR() - 0.5) * 1.2 }));
    let req = null;
    function hide() { back.forEach((s) => (s.visible = false)); haze.visible = rays.visible = false; shell.visible = ground.visible = motes.visible = false; light.intensity = 0; req = null; }
    /** feet (world), S = glow radius (m), k = brightness 0..1, dome 0..1 (the rim shell), height of his body h. Placed by flush()
     *  AFTER setCamera: the sprites sit behind him as seen from THIS frame's lens (with last frame's lens a cut put them in front). */
    function set(t, feet, S, k, o = {}) { req = [t, feet.clone(), S, k, o]; }
    function flush() { const r = req; hide(); if (r) place(...r); }
    function place(t, feet, S, k, o = {}) {
      if (k <= 0.001 || S <= 0.001) return;
      const cam = studio.camera.position, h = o.h ?? 1.6, chest = _V.set(feet.x, feet.y + h * 0.62, feet.z);
      const away = _W.copy(chest).sub(cam).setY(0).normalize(), push = o.push ?? Math.min(0.45, 0.22 + S * 0.15);
      const sz = [S * 2.3, S * 1.45, S * 0.85], op = [0.42, 0.55, 0.7].map((v) => v * k * (o.op ?? (S >= 2 ? 0.45 : 1)));
      back.forEach((s, i) => { s.visible = true; s.position.copy(chest).addScaledVector(away, push).y += (i === 2 ? h * 0.18 : 0); s.scale.setScalar(sz[i]); s.material.opacity = op[i]; });
      // normal-blended gold haze + a slow sunburst: these tint a bright daylight background (additive light alone vanished there)
      haze.visible = rays.visible = true; haze.position.copy(chest).addScaledVector(away, push * 1.4); rays.position.copy(chest).addScaledVector(away, push * 1.6);
      haze.scale.setScalar(S * 2.6); haze.material.opacity = 0.5 * k * (o.haze ?? 1);
      rays.scale.setScalar(S * (o.rayScale ?? 3.4)); rays.material.opacity = 0.42 * k * (o.rays ?? 1); rays.material.rotation = t * 0.25;
      if (o.dome) { shell.visible = true; shell.position.copy(feet); shell.scale.setScalar(S); shell.material.uniforms.uOp.value = o.dome * k; }
      ground.visible = true; ground.position.set(feet.x, feet.y + 0.012, feet.z); ground.scale.setScalar(S * (o.dome ? 1.05 : 1.3)); ground.material.opacity = 0.55 * k;
      const mn = o.motes ?? 1;
      if (mn > 0) {
        motes.visible = true; const p = mg.attributes.position.array, R = Math.max(0.35, S * 0.6), H = Math.max(1.9, S * 1.1);
        MD.forEach((m, i) => { const u = (t * m.v / Math.max(1, H / 2) + m.ph) % 1, a = m.a + t * 0.3 * m.w, r = R * m.r * (1 + 0.15 * Math.sin(t * 2 + i)); p[i * 3] = feet.x + Math.cos(a) * r; p[i * 3 + 1] = feet.y + 0.05 + u * H; p[i * 3 + 2] = feet.z + Math.sin(a) * r; });
        mg.attributes.position.needsUpdate = true; motes.material.size = 0.02 * Math.max(1, S / 1.6) * (o.moteSize ?? 1); motes.material.opacity = Math.min(1, k * 1.2) * mn;
      }
      light.intensity = (o.light ?? 2.6) * k; light.distance = Math.max(4, S * 6); light.position.copy(chest).addScaledVector(away, 0.6).y += 0.3;
    }
    return { set, flush, hide, back, shell, ground, motes, light };
  })();

  // ---------------------------------------------------------------- props
  // sunglasses (head-local units: head radius 0.135); worn = follows rig.head.g
  const makeShades = () => {
    const g = new THREE.Group(), blk = new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 0.12, metalness: 0.4 });
    for (const s of [-1, 1]) {
      const lens = mk(new THREE.SphereGeometry(HR * 0.27, 20, 12), blk, g, s * HR * 0.37, HR * 0.07, HR * 1.0); lens.scale.set(1.25, 0.82, 0.32);
      const gl = mk(new THREE.PlaneGeometry(HR * 0.09, HR * 0.035), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), g, s * HR * 0.37 - HR * 0.08, HR * 0.14, HR * 1.1); gl.rotation.z = 0.5; gl.castShadow = false;
      const arm = mk(new THREE.BoxGeometry(HR * 0.04, HR * 0.04, HR * 0.9), blk, g, s * HR * 0.66, HR * 0.1, HR * 0.55); arm.rotation.y = s * 0.12;
    }
    mk(new THREE.BoxGeometry(HR * 0.3, HR * 0.05, HR * 0.05), blk, g, 0, HR * 0.13, HR * 1.04);
    g.visible = false; scene.add(g); return g;
  };
  const shades = makeShades();
  const wearAt = (rig, obj, slide = 0) => { rig.root.updateMatrixWorld(true); rig.head.g.getWorldPosition(obj.position); rig.head.g.getWorldQuaternion(obj.quaternion); obj.position.add(_V.set(0, -slide * HR * 0.5, 0).applyQuaternion(obj.quaternion)); obj.scale.setScalar(1); };
  // toast
  const toast = new THREE.Group(); scene.add(toast);
  mk(new THREE.BoxGeometry(0.105, 0.115, 0.016), mat(0xe2b06a, 0.85), toast, 0, 0, 0); mk(new THREE.BoxGeometry(0.115, 0.012, 0.018), mat(0xa8682e, 0.8), toast, 0, 0.058, 0);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.01, 0.115, 0.018), mat(0xa8682e, 0.8), toast, s * 0.055, 0, 0);
  const TOASTER = [-0.85, 1.0, -2.36]; toast.scale.setScalar(1.6);
  kit.table.visible = false; kit.chairs.forEach((c) => (c.visible = false));
  // the cat (scaled up so it reads) + a floating carafe, the mug, a pour stream, napkins
  const cat = makeCat({ color: 0x6a6f78, belly: 0xf2efe8, stripe: 0x4a4f58 }); scene.add(cat.g); cat.g.scale.setScalar(1.5);
  const salute = (k) => { cat.legs[1].rotation.set(-2.75 * k, 0, 0.5 * k); cat.head.rotation.z = -0.12 * k; };
  const carafe = new THREE.Group(); scene.add(carafe);
  mk(new THREE.CylinderGeometry(0.062, 0.072, 0.15, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xcfe3ef, roughness: 0.05, transparent: true, opacity: 0.45, side: THREE.DoubleSide }), carafe, 0, 0.075, 0);
  mk(new THREE.CylinderGeometry(0.068, 0.068, 0.08, 18), mat(0x3a2112, 0.2), carafe, 0, 0.042, 0);
  mk(new THREE.CylinderGeometry(0.07, 0.066, 0.025, 18), mat(0x2a2d31, 0.4), carafe, 0, 0.16, 0);
  mk(new THREE.TorusGeometry(0.04, 0.009, 6, 14, PI), mat(0x2a2d31, 0.4), carafe, -0.085, 0.09, 0).rotation.z = PI / 2;
  const CARAFE0 = [-1.3, 0.875, -2.28];
  kit.root.children.filter((o) => o.isMesh && Math.abs(o.position.x + 1.3) < 0.01 && Math.abs(o.position.y - 0.94) < 0.01).forEach((o) => (o.visible = false));   // the set's own carafe
  const mugG = makeMug(0x3d7bd9); scene.add(mugG); mugG.children[1].visible = false;   // (its own coffee disc: ours rises as it pours)
  const MUGP = [-0.42, 0.87, -2.12];
  const coffeeTop = mk(new THREE.CircleGeometry(0.036, 18), mat(0x3a2112, 0.2), scene); coffeeTop.rotation.x = -PI / 2; coffeeTop.castShadow = false;
  const stream = mk(new THREE.CylinderGeometry(0.008, 0.006, 1, 8), mat(0x4a2a16, 0.15), scene); stream.castShadow = false;
  const curtains = kit.root.children.filter((o) => o.isMesh && o.geometry.parameters && o.geometry.parameters.width === 0.45 && o.geometry.parameters.height === 1.3);
  const NN = 26, napkins = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.12, 0.12), new THREE.MeshStandardMaterial({ color: 0xfbf8ee, roughness: 0.9, side: THREE.DoubleSide }), NN);
  napkins.frustumCulled = false; scene.add(napkins); napkins.count = 0;
  const NR = rng(5), NAP = Array.from({ length: NN }, () => ({ x: (NR() - 0.5) * 3.6, y: 0.9 + NR() * 1.2, z: -2.0 + NR() * 2.5, sp: 0.8 + NR() * 1.4, ph: NR() * 6, r: 0.4 + NR() * 0.6 }));
  // papers (office): instanced sheets blown off the desks as he passes
  const NP = 70, papers = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.21, 0.28), new THREE.MeshStandardMaterial({ color: 0xfbf8ee, roughness: 0.9, side: THREE.DoubleSide }), NP);
  papers.frustumCulled = false; papers.castShadow = true; scene.add(papers); papers.count = 0;
  const PR = rng(17), PAPER = Array.from({ length: NP }, (_, i) => { const d = OD.desks[i % 16]; return { x: d.x - 0.32 + (PR() - 0.5) * 0.2, z: d.z + 0.08 + (PR() - 0.5) * 0.2, vx: (PR() - 0.5) * 2.4, vz: -1.2 - PR() * 2.2, vy: 2.0 + PR() * 2.0, sp: 2 + PR() * 5, ph: PR() * 6, d: PR() * 0.3 }; });
  // traffic lights for the street (heads face −x, the camera); state 0 red → 1 green
  const SIG_X = [8.6, 6.2, 1.6, -0.8];
  const signals = SIG_X.map((x) => {
    const g = new THREE.Group(); g.position.set(x, SIDEWALK_H, -0.4); street.root.add(g);
    mk(new THREE.CylinderGeometry(0.06, 0.07, 2.4, 10), mat(0x3a3d42, 0.5), g, 0, 1.2, 0);
    const head = new THREE.Group(); head.position.set(0, 2.6, 0); g.add(head); mk(new THREE.BoxGeometry(0.26, 0.78, 0.3), mat(0x2a2c30, 0.5), head, 0, 0, 0);
    const lamp = (y, c) => { const m = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: c, emissiveIntensity: 0, roughness: 0.3 }); mk(new THREE.SphereGeometry(0.085, 14, 10), m, head, -0.14, y, 0).scale.set(0.5, 1, 1); return m; };
    return { g, red: lamp(0.24, 0xff3a2a), amber: lamp(0, 0xffb02a), green: lamp(-0.24, 0x3aff7a) };
  });
  const setSignal = (s, k) => { s.red.emissiveIntensity = k < 0.5 ? 2.4 : 0; s.green.emissiveIntensity = k >= 0.5 ? 2.8 : 0; s.red.color.setHex(k < 0.5 ? 0xff5a4a : 0x222222); s.green.color.setHex(k >= 0.5 ? 0x7affa8 : 0x222222); };
  // birds (pigeons in formation; the suburb flock that circles and then flees)
  const flock = makeBirdFlock(80); scene.add(flock.g);
  const PIGEON = 0x8a8f9a;
  // the city: a gold pillar (view-angle shader: bright core, soft edges, fading with height) + parting clouds + a jet
  const pillarMat = new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color(1.3, 0.95, 0.42) }, uOp: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uC; uniform float uOp; varying vec3 vN; varying vec3 vV; varying vec2 vUv; void main(){ float c = pow(abs(dot(vN, vV)), 2.2); float fy = mix(1.0, 0.25, vUv.y); gl_FragColor = vec4(uC * c * fy * uOp, 1.0); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  const PILLAR = [0, -78];
  const pillar = new THREE.Group(); city.root.add(pillar); pillar.position.set(PILLAR[0], 0, PILLAR[1]);
  mk(new THREE.CylinderGeometry(9, 9, 520, 40, 1, true), pillarMat, pillar, 0, 260, 0).castShadow = false;
  const pillarCore = mk(new THREE.CylinderGeometry(3.2, 3.2, 520, 32, 1, true), pillarMat.clone(), pillar, 0, 260, 0); pillarCore.castShadow = false; pillarCore.material.uniforms.uC.value = new THREE.Color(2.0, 1.7, 1.1);
  const pillarLight = new THREE.PointLight(0xffc870, 0, 140, 1.2); pillarLight.position.set(PILLAR[0], 14, PILLAR[1] + 12); city.root.add(pillarLight);
  const cloudPuffs = makeSpritePool(scene, 70, 'smoke');
  const jet = makeJet(); scene.add(jet.g); jet.g.scale.setScalar(0.9);
  // space: the town's star, the gold Moon (an emissive half that faces the town), the Sun + corona + its sunglasses, the hole
  const townStar = [addSprite(glowTex, new THREE.Color(1.3, 1.0, 0.5), space.root), addSprite(glowTex, new THREE.Color(1.8, 1.6, 1.2), space.root), addSprite(glowTex, new THREE.Color(1.0, 0.65, 0.25), space.root), addSprite(raysTex, new THREE.Color(1.4, 1.1, 0.55), space.root)];
  const beam = mk(new THREE.CylinderGeometry(1, 1, 1, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.25, 0.55), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }), space.root); beam.visible = false;
  const beamTip = addSprite(glowTex, new THREE.Color(1.8, 1.5, 0.9), space.root);
  const moonTex = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#b8b4ac'; g.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * h, s = 4 + r() ** 3 * 60; g.fillStyle = `rgba(${r() < 0.5 ? '90,88,84' : '150,146,140'},0.45)`; g.beginPath(); g.ellipse(x, y, s, s * 0.9, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(230,226,218,0.35)'; g.lineWidth = 2; g.stroke(); } });
  const halfTex = canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.42, '#ffffff'); gr.addColorStop(0.55, '#000000'); gr.addColorStop(0.95, '#000000'); gr.addColorStop(1, '#ffffff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const moon = mk(new THREE.SphereGeometry(120, 48, 32), new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.95, emissive: 0xffc060, emissiveMap: halfTex, emissiveIntensity: 0 }), space.root, ...MOON0.toArray());
  const sunCol = new THREE.Color(1.9, 1.35, 0.6);
  const sunMesh = mk(new THREE.SphereGeometry(420, 48, 32), new THREE.MeshBasicMaterial({ color: sunCol.clone(), toneMapped: false }), space.root, ...SUN0.toArray());
  const corona = addSprite(glowTex, new THREE.Color(1.4, 0.95, 0.45), space.root); corona.position.copy(SUN0); corona.scale.setScalar(2300);
  const sunShades = makeShades(); space.root.add(sunShades);
  const holeTex = canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.5, 'rgba(4,0,10,1)'); gr.addColorStop(0.62, 'rgba(20,0,40,0.9)'); gr.addColorStop(1, 'rgba(20,0,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const ringTex = canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(128, 128, 40, 128, 128, 128); gr.addColorStop(0, 'rgba(160,80,255,0)'); gr.addColorStop(0.42, 'rgba(190,110,255,1)'); gr.addColorStop(0.55, 'rgba(120,40,220,0.55)'); gr.addColorStop(1, 'rgba(80,0,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const mkHole = (parent) => {
    const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: holeTex, transparent: true, depthWrite: false, toneMapped: false, fog: false })); disc.renderOrder = 3;
    const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, color: new THREE.Color(1.3, 1.0, 1.6), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false })); ring.renderOrder = 4;
    parent.add(disc, ring); disc.visible = ring.visible = false;
    const set = (pos, s, t, on) => { disc.visible = ring.visible = on; if (!on) return; disc.position.copy(pos); ring.position.copy(pos); disc.scale.setScalar(s); ring.scale.setScalar(s * 1.55); ring.material.rotation = t * 3; ring.material.opacity = 0.85 + 0.15 * Math.sin(t * 9); };
    return { disc, ring, set };
  };
  const holeB = mkHole(scene), holeS = mkHole(space.root);
  const PURPLE = new THREE.Color(1.1, 0.55, 1.8);
  const swirlS = Array.from({ length: 70 }, () => addSprite(glowTex, PURPLE));
  const swirl = { hide: () => swirlS.forEach((s) => (s.visible = false)), set: (i, pos, size, op) => { const s = swirlS[i]; if (!s) return; s.visible = op > 0.01; s.position.copy(pos); s.scale.setScalar(size * 1.6); s.material.opacity = op; } };
  // the lawn things the anti-aura eats (our own props, placed on Todd's lawn, lot 2)
  const junk = [];
  const addJunk = (g, x, y, z) => { g.position.set(x, y, z); burb.root.add(g); junk.push({ g, p0: new THREE.Vector3(x, y, z), r0: g.rotation.clone() }); return g; };
  { const gn = new THREE.Group(); mk(new THREE.CylinderGeometry(0.1, 0.13, 0.25, 10), mat(0x3d7bd9, 0.6), gn, 0, 0.12, 0); mk(new THREE.SphereGeometry(0.08, 10, 8), mat(0xf1c3a1, 0.6), gn, 0, 0.3, 0); mk(new THREE.ConeGeometry(0.09, 0.22, 10), mat(0xd2483f, 0.6), gn, 0, 0.45, 0); mk(new THREE.SphereGeometry(0.07, 8, 6), mat(0xf4f1ea, 0.8), gn, 0, 0.24, 0.05); gn.scale.setScalar(1.4); addJunk(gn, -3.4, 0.03, -2.9); }
  { const fl = new THREE.Group(); const pk = mat(0xf27ab0, 0.5); const b = mk(new THREE.SphereGeometry(0.13, 12, 10), pk, fl, 0, 0.62, 0); b.scale.set(0.8, 0.7, 1.3); const nk = mk(new THREE.CylinderGeometry(0.018, 0.02, 0.32, 6), pk, fl, 0, 0.82, 0.1); nk.rotation.x = 0.3; mk(new THREE.SphereGeometry(0.05, 10, 8), pk, fl, 0, 0.98, 0.16); mk(new THREE.ConeGeometry(0.02, 0.07, 6), mat(0x2a2a2a, 0.5), fl, 0, 0.96, 0.22).rotation.x = PI / 2 + 0.6; mk(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 5), mat(0x2a2a2a, 0.5), fl, 0, 0.28, 0); addJunk(fl, -1.4, 0.03, -4.1); }
  { const bk = new THREE.Group(); for (const z of [-0.42, 0.42]) mk(new THREE.TorusGeometry(0.26, 0.032, 8, 20), mat(0x222222, 0.6), bk, 0, 0.27, z).rotation.y = PI / 2; mk(new THREE.BoxGeometry(0.05, 0.05, 0.85), mat(0x3d9be0, 0.4), bk, 0, 0.42, 0); mk(new THREE.BoxGeometry(0.05, 0.36, 0.05), mat(0x3d9be0, 0.4), bk, 0, 0.55, 0.3); mk(new THREE.BoxGeometry(0.3, 0.04, 0.05), mat(0x222222, 0.5), bk, 0, 0.74, 0.3); bk.rotation.y = 0.5; addJunk(bk, -4.6, 0.03, -4.6); }
  { const tc = new THREE.Group(); mk(new THREE.CylinderGeometry(0.28, 0.24, 0.85, 16), mat(0x5a6a5a, 0.5), tc, 0, 0.42, 0); const lid = mk(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), mat(0x4a5a4a, 0.5), tc, 0, 0.87, 0); void lid; addJunk(tc, 1.4, 0.03, -2.6); }
  { const ch = new THREE.Group(); const w = mat(0xf4f1ea, 0.6); mk(new THREE.BoxGeometry(0.5, 0.05, 0.5), w, ch, 0, 0.42, 0); mk(new THREE.BoxGeometry(0.5, 0.55, 0.05), w, ch, 0, 0.7, -0.24).rotation.x = -0.25; for (const [x, z] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) mk(new THREE.BoxGeometry(0.04, 0.42, 0.04), w, ch, x, 0.21, z); ch.rotation.y = 0.4; addJunk(ch, -3.6, 0.03, -5.2); }
  { const ball = new THREE.Group(); mk(new THREE.SphereGeometry(0.12, 14, 10), mat(0xe08a3a, 0.6), ball, 0, 0.12, 0); addJunk(ball, -2.5, 0.03, -2.6); }
  const MAILBOX = [-0.4, -2.4];   // suburb lot 2's mailbox (box top ≈ 1.33)
  // comic starbursts (GULP!) + speech bubbles (sized to the frame every frame)
  const starTex = (txt, fill, ink) => canvasTex(512, 512, (g, w, h) => { g.translate(w / 2, h / 2); g.beginPath(); for (let k = 0; k < 24; k++) { const r = k % 2 ? 150 : 245, a = k * PI / 12; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 14; g.strokeStyle = ink; g.stroke(); g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, txt, 300, 150, 'Arial Black, Helvetica, sans-serif', '900'); g.fillText(txt, 0, 10); });
  const gulp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex('GULP!', '#c9a2ff', '#3a1060'), transparent: true, depthWrite: false, depthTest: false, toneMapped: false, fog: false })); gulp.renderOrder = 20; scene.add(gulp);
  const B = (lines, accent, o = {}) => { const b = makeSpeechBubble({ lines, accent, maxChars: o.maxChars ?? 14, soft: !!o.soft, tail: o.tail }); scene.add(b.sprite); b.setPop(0); return b; };
  const GOLD_C = '#e2a63a', RED = '#d2283f';
  const BUB = {
    plus1: B(['+1 aura'], GOLD_C, { soft: true }), cat: B(['+1000 aura'], GOLD_C), hose: B(['+1000 aura'], GOLD_C),
    o1: B(['+1000 AURA'], GOLD_C), o2: B(['+1000 AURA'], GOLD_C), o3: B(['+1000 AURA'], GOLD_C),
    neg1: B(['−∞ AURA'], RED), neg2: B(['−∞ AURA'], RED), neg3: B(['−∞ AURA'], RED), hi: B(['Hiii!'], '#e58fa6', { soft: true }),
  };
  const ALL_BUBBLES = Object.values(BUB);
  const bubbleReq = [];
  const frameW = (d) => 2 * d * Math.tan((studio.camera.fov * PI) / 360) * (9 / 16);
  const popK = (t, t0) => K(t, [[t0, 0], [t0 + 0.16, 1.15], [t0 + 0.28, 1]]);
  const say = (b, pos, frac, t0, hold, t) => { if (t < t0 - 0.02 || t > t0 + hold) return; bubbleReq.push([b, pos, popK(t, t0) * (1 - K(t, [[t0 + hold - 0.2, 0], [t0 + hold, 1]])), frac]); };
  const headAt = (rig, lift) => { rig.root.updateMatrixWorld(true); return rig.head.g.getWorldPosition(new THREE.Vector3()).add(_V.set(0, lift, 0)); };

  // puffs + sparkles
  const puffs = makeSpritePool(scene, 90, 'smoke'), sparks = makeSpritePool(scene, 90, 'fire');
  let puffN = 0, sparkN = 0;
  const DUST_C = new THREE.Color(0xe8dccb), SPARK_C = new THREE.Color(2.0, 1.5, 0.7);
  function dust(t, t0, pos, s = 1, n = 6, dur = 1.0, col = DUST_C) {
    const age = t - t0; if (age < 0 || age > dur) return;
    for (let k = 0; k < n && puffN < puffs.items.length; k++) { const a = t0 * 3.7 + k * (2 * PI / n), r = (0.15 + age * 0.9) * s; puffs.set(puffN++, _V.set(pos.x + Math.cos(a) * r, pos.y + 0.05 * k + age * 0.35 * s, pos.z + Math.sin(a) * r * 0.6).clone(), (0.35 + age * 1.1) * s, 0.8 * (1 - age / dur) ** 1.4, col); }
  }
  function sparkle(t, t0, pos, s = 1, n = 8, dur = 0.8, col = SPARK_C) {
    const age = t - t0; if (age < 0 || age > dur) return; const u = age / dur;
    for (let k = 0; k < n && sparkN < sparks.items.length; k++) { const a = k * 2.4 + t0, r = (0.3 + 0.9 * u) * s; sparks.set(sparkN++, _V.set(pos.x + Math.cos(a) * r, pos.y + Math.sin(a * 1.3) * r * 0.8 - 0.6 * u * u * s, pos.z + Math.sin(a) * r * 0.4).clone(), 0.14 * s * (1 - u), 0.9 * (1 - u), col); }
  }

  // ---------------------------------------------------------------- helpers
  function put(rig, key, p) {
    if (!p) { rig.root.visible = false; return; }
    applyPose(rig, { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2] });
    rig.root.visible = p.visible !== false;
  }
  const feetW = (rig) => rig.root.position.clone();

  // ---------------------------------------------------------------- performances (pure: f(t) → pose)
  function toddKitchen(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat'; p.glasses = true;
    Object.assign(p, { x: -0.75, z: -1.52, rotY: 0.35, lean: 0.1, headPitch: 0.08 });
    p.armA = A(0.05, 0.1, -0.35, 0, 1); p.armB = A(0.05, 0.1, -0.35, 0, 1);
    if (t < 6.0) {
      // day 1: the reach back (no look), the bonk, the wince
      const r = K(t, [[T_.TOAST1, 0], [T_.TOAST1 + 0.25, 1], [T_.BONK + 0.1, 1], [T_.BONK + 0.45, 0]]);
      p.armB = mixArm(p.armB, BACK_B, r); p.headYaw = -0.08 * r;
      if (t > T_.BONK - 0.02) { const b = K(t, [[T_.BONK, 0], [T_.BONK + 0.08, 1], [T_.BONK + 0.6, 0.6], [5.6, 0.3]]); p.headPitch = 0.08 + 0.35 * b; p.lean = 0.1 + 0.12 * b; p.eyes = t < T_.BONK + 0.5 ? 'closed' : p.eyes; p.mouth = t < T_.BONK + 0.7 ? 'o' : 'flat'; }
      if (t > 5.2) { p.headPitch = 0.42; p.headYaw = 0.15; }   // looks down at the toast on the floor
      p.armA = mixArm(p.armA, A(-0.5, 0.25, -1.6, 0.6), K(t, [[T_.BONK + 0.1, 0], [T_.BONK + 0.3, 1], [5.4, 1], [5.8, 0]]));   // rubs his head
      return p;
    }
    if (t < 10.6) {
      // day 2: he notices the glow; then the same reach back — caught. A bite. He is amazed at himself.
      const look = K(t, [[T_.GLOW_ON + 0.1, 0], [T_.GLOW_ON + 0.35, 1], [7.3, 1], [7.55, 0]]);
      p.headPitch = 0.08 + 0.35 * look; p.mouth = look > 0.5 ? 'o' : 'flat';
      p.armA = mixArm(p.armA, A(-0.75, 0.2, -1.3, 0.5), look);
      const r = K(t, [[T_.TOAST2, 0], [T_.TOAST2 + 0.25, 1], [T_.CATCH, 1], [T_.CATCH + 0.45, 0]]);
      const hold = K(t, [[T_.CATCH + 0.1, 0], [T_.CATCH + 0.45, 1]]);
      p.armB = mixArm(mixArm(p.armB, BACK_B, r), CATCH_B, hold * (1 - r));
      if (t > T_.CATCH + 0.5) { p.mouth = 'smile'; p.headPitch = 0.02; }
      if (t > 9.25) { const bite = K(t, [[9.25, 0], [9.5, 1], [9.75, 1], [10.0, 0]]); p.armB = mixArm(CATCH_B, A(-1.3, 0.3, -2.15, -0.5), bite); if (bite > 0.6) p.mouth = 'o'; }
      return p;
    }
    // day 5: arms crossed, leaning back, the wind in his hair; he never looks at the carafe
    Object.assign(p, { rotY: 0.75, lean: -0.06, headPitch: -0.04, mouth: 'smile' });
    p.armA = CROSS_A; p.armB = CROSS_B; p.headYaw = 0.1 * Math.sin(t * 0.8);
    return p;
  }
  function toastAt(t) {
    // [pos, rot] in kitchen-local space, or null
    const [x0, y0, z0] = TOASTER;
    if (t < 6.0) {
      if (t < T_.TOAST1) return [[x0, y0, z0], [0, 0, 0]];
      if (t < T_.BONK) { const u = (t - T_.TOAST1) / (T_.BONK - T_.TOAST1); return [[lerp(x0, -0.74, u), lerp(y0, 1.8, u) + 4 * 0.62 * u * (1 - u), lerp(z0, -1.55, u)], [u * 7, 0, 0.4 * u]]; }
      const u = clamp((t - T_.BONK) / 0.5); const y = Math.max(0.012, lerp(1.8, 0.012, u * u) + 0.55 * u * (1 - u));
      return u < 1 ? [[lerp(-0.74, -0.5, u), y, lerp(-1.55, -0.85, u)], [7 + u * 9, 0, 0.4 + u * 3]] : [[-0.5, 0.012, -0.85], [-PI / 2, 0, 1.2]];
    }
    if (t < 10.6) {
      if (t < T_.TOAST2) return [[x0, y0, z0], [0, 0, 0]];
      if (t < T_.CATCH) { const u = (t - T_.TOAST2) / (T_.CATCH - T_.TOAST2); return [[lerp(x0, -0.62, u), lerp(y0, 1.62, u) + 4 * 0.5 * u * (1 - u), lerp(z0, -1.68, u)], [u * 6.28, 0, 0]]; }
      return 'hand';
    }
    return null;
  }
  function carafeAt(t) {
    const [x0, y0, z0] = CARAFE0, [mx, my, mz] = MUGP;
    const up = K(t, [[T_.LIFT, 0], [T_.LIFT + 0.45, 1], [14.3, 1], [14.9, 0]]);
    const over = K(t, [[T_.LIFT + 0.3, 0], [T_.POUR0 - 0.1, 1], [T_.POUR1 + 0.1, 1], [14.6, 0]]);
    const tilt = K(t, [[T_.POUR0 - 0.15, 0], [T_.POUR0 + 0.15, 1.15], [T_.POUR1, 1.15], [T_.POUR1 + 0.25, 0]]);
    return { x: lerp(x0, mx - 0.12, over), y: y0 + 0.3 * up + 0.012 * Math.sin(t * 5) * up, z: lerp(z0, mz, over), tilt, bob: up };
  }
  function neighborBurb(t) {
    const p = basePose(); p.eyes = blink(t, 6); p.mouth = 'flat';
    Object.assign(p, { x: -1.0, z: -5.7, rotY: -PI / 2 - 0.35, lean: 0.05 });
    p.armA = A(-0.5, 0.15, -0.9, 0.3); p.armB = HOSE_B;
    const k = K(t, [[T_.HOSE - 0.1, 0], [T_.HOSE + 0.2, 1]]);
    if (k > 0) { p.headYaw = 0.35 * k; p.mouth = 'o'; p.eyes = 'open'; p.armB = mixArm(HOSE_B, A(0.05, 0.12, -0.2, 0, 1), k); p.armA = mixArm(p.armA, A(0.05, 0.1, -0.2, 0, 1), k); }
    if (t > T_.HOSE + 1.2) { const b = K(t, [[T_.HOSE + 1.2, 0], [T_.HOSE + 1.5, 1]]); p.armA = mixArm(p.armA, HEAD_A, b); p.armB = mixArm(p.armB, HEAD_B, b); }
    return p;
  }
  function toddBurb(t) {
    const p = basePose(); p.eyes = blink(t, 3); p.mouth = 'flat'; p.glasses = t < T_.SHADES1;
    const w = walkLegs(t, [-2.2, -7.55], [{ t0: 15.55, t1: 20.6, pts: [[-2.2, -4.6]] }]);
    const floor = 0.3 - 0.27 * clamp((w.z + 7.1) / 0.35);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed * 1.25, rotY: 0, floor, y: floor, lean: -0.04, headPitch: -0.06 });
    if (t > T_.SHADES1) { p.mouth = 'smile'; p.headPitch = -0.1; }
    p.armA = A(0.0, 0.12, -0.3, 0, 1); p.armB = A(0.0, 0.12, -0.3, 0, 1);
    return p;
  }
  function toddOffice(t) {
    const p = basePose(); p.eyes = blink(t, 3); p.mouth = 'smile'; p.glasses = false;
    const w = walkLegs(t, [0, 4.35], [{ t0: 20.4, t1: 25.7, pts: [[0, 3.2], [0, -0.7]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed * 1.2, rotY: PI, lean: -0.05, headPitch: -0.08 });
    p.headYaw = 0.25 * Math.sin(t * 0.9);
    return p;
  }
  // office workers: seated at their desks (facing −z, toward the lens) → stand as he passes (row by row) → turn to him → clap
  const ROWZ = [1.7, 0.0, -1.7, -3.4];
  const HIDE_W = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 15];   // out of the vertical frame or cropped at its edge (bearing.py)
  const standT = (i) => T_.STAND + ROWZ.indexOf(OD.desks[i].z) * 0.32 + ((i * 7) % 4) * 0.04;
  function worker(t, i, tw) {
    const d = OD.desks[i], p = basePose(); p.eyes = blink(t, i); p.mouth = 'flat';
    const st = K(t, [[standT(i), 0], [standT(i) + 0.45, 1]]);
    const sx = d.seat[0], sz = d.seat[1] + 0.12 * st;
    Object.assign(p, { x: sx, z: sz, rotY: PI, footFwd: lerp(0.42, 0, st), y: lerp(seatY(OD.seat), 0, st), lean: lerp(0.12, 0.0, st) });
    p.armA = A(-0.75, 0.15, -1.15, 0.35); p.armB = A(-0.75, 0.15, -1.15, -0.35);    // typing
    p.armA.el += 0.06 * Math.sin(t * 17 + i); p.armB.el += 0.06 * Math.sin(t * 15 + i * 2);
    if (st > 0) {
      p.mouth = 'o'; p.eyes = 'open';
      p.rotY = lerpAngle(PI, faceToward(sx, sz, tw.x, tw.z), 0.6 * st);
      p.headYaw = 0.4 * st * Math.sign(tw.x - sx || 1) * 0.5;
      p.armA = mixArm(p.armA, A(0.05, 0.12, -0.3, 0, 1), st); p.armB = mixArm(p.armB, A(0.05, 0.12, -0.3, 0, 1), st);
      const ck = K(t, [[T_.CLAP + (i % 5) * 0.03, 0], [T_.CLAP + 0.2 + (i % 5) * 0.03, 1]]);
      if (ck > 0) { p.armA = mixArm(p.armA, clap(t, i * 0.07, 1), ck); p.armB = mixArm(p.armB, clap(t, i * 0.07, -1), ck); p.mouth = 'smile'; }
    }
    return p;
  }
  function toddStreet(t) {
    const p = basePose(); p.eyes = blink(t, 3); p.mouth = 'smile'; p.glasses = false;
    const w = walkLegs(t, [6.8, -1.7], [{ t0: 25.4, t1: 30.9, pts: [[0.6, -1.7]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: -PI / 2, floor: SIDEWALK_H, y: SIDEWALK_H, lean: -0.04, headPitch: -0.06, headYaw: -0.12 });
    return p;
  }
  function toddField(t) {
    const p = basePose(); p.eyes = blink(t, 3); p.mouth = 'smile'; p.glasses = false;
    const w = walkLegs(t, [30.0, 0.6], [{ t0: 30.4, t1: 33.4, pts: [[26.5, 0.9]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: -PI / 2 - 0.25, lean: -0.05, headPitch: -0.1 });
    if (t > 31.9) { p.armB = mixArm(REST, A(-2.7, 0.4, -0.2), K(t, [[31.9, 0], [32.2, 1]])); p.mouth = 'o'; }   // one fist up
    return p;
  }
  function rooftopGuy(t, i) {
    const p = basePose(); p.eyes = blink(t, i + 4); p.mouth = 'o';
    if (i === 0) { Object.assign(p, { x: -8.0, z: 12.4, rotY: 0.35, lean: -0.02 }); p.armB = POINT_B; p.headYaw = -0.25; p.armB.sx += 0.05 * Math.sin(t * 5); }
    else { Object.assign(p, { x: -7.3, z: 11.2, rotY: PI - 0.1, lean: -0.12, headPitch: -0.45 }); p.armA = HEAD_A; p.armB = HEAD_B; }
    return p;
  }
  // the wave-back: Todd at the curb (facing the street, +z), the waver across the street, the mail carrier behind him
  const tz = (t) => (t < T_.FREEZE ? t : t < T_.THAW ? T_.FREEZE : t - (T_.THAW - T_.FREEZE));   // the freeze frame
  const TODD_C = [-1.15, -1.0];
  function toddCurb(t) {
    const p = basePose(); p.eyes = blink(t, 3); p.mouth = 'smile'; p.glasses = false;
    Object.assign(p, { x: TODD_C[0], z: TODD_C[1], rotY: 0.05, floor: SW_H, y: SW_H, lean: -0.05, headPitch: -0.06 });
    p.armA = CROSS_A; p.armB = CROSS_B;
    const s = tz(t);
    if (s > T_.TODDWAVE - 0.3) {
      const k = K(s, [[T_.TODDWAVE - 0.3, 0], [T_.TODDWAVE, 1]]);
      p.armB = mixArm(CROSS_B, wave(s, 3.0, 1.15), k); p.armA = mixArm(CROSS_A, REST, k); p.mouth = 'smile'; p.lean = -0.02;
      if (s > 53.55) { p.headYaw = K(s, [[53.55, 0], [53.85, 0.55]]); }   // he notices the mailman
    }
    if (t >= T_.FREEZE) p.mouth = 'flat';
    if (t > T_.THAW) {
      // the arm sinks; he just stands there
      const d = K(t, [[T_.THAW, 0], [T_.THAW + 0.6, 1]]);
      p.armB = mixArm(wave(T_.FREEZE, 3.0, 1.15), REST, d); p.headYaw = lerp(0.55, 0.0, d); p.headPitch = lerp(-0.06, 0.25, d); p.lean = lerp(-0.02, 0.1, d); p.eyes = blink(t, 3);
    }
    if (t >= 56.4) { Object.assign(p, { headYaw: 0, headPitch: 0.12, lean: 0.06, mouth: 'flat' }); p.armA = REST; p.armB = REST; p.glasses = t > 59.4; }
    return p;
  }
  function waverPose(t) {
    const p = basePose(); p.eyes = blink(t, 8); p.mouth = 'smile';
    Object.assign(p, { x: -1.6, z: 8.0, rotY: PI + 0.08, floor: SW_H, y: SW_H });
    const k = K(t, [[T_.NBWAVE - 0.25, 0], [T_.NBWAVE, 1]]);
    p.armB = mixArm(REST, wave(t, 2.6), k); return p;
  }
  function mailmanPose(t) {
    const p = basePose(); p.eyes = blink(t, 9); p.mouth = 'smile';
    const s = tz(t);
    const w = walkLegs(s, [0.7, -3.1], [{ t0: 52.85, t1: 53.75, pts: [[-1.6, -3.1]] }, { t0: 55.0, t1: 57.2, pts: [[-4.0, -2.95]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: w.speed > 0.05 ? (w.head ?? -PI / 2) + 0.4 : 0.15, floor: 0.03, y: 0.03, headYaw: w.speed > 0.05 ? 0.6 : 0 });
    p.armB = wave(s, 2.8); p.armA = A(0.0, 0.1, -0.4, 0, 1);
    return p;
  }
  // neighbors on the lawn: bowing "we're not worthy" → after −∞ they straighten and cover their eyes
  const NBR = [[-2.4, -3.4], [-0.35, -3.7], [-1.1, -5.3]];
  function bower(t, i) {
    const [x, z] = NBR[i], p = basePose(); p.eyes = blink(t, i + 11); p.mouth = 'o';
    Object.assign(p, { x, z, rotY: faceToward(x, z, TODD_C[0], TODD_C[1]) * 0.7, floor: 0.03 });
    const s = tz(t), b = 0.5 + 0.5 * Math.sin(s * 4.2 + i * 0.4);
    p.lean = 0.25 + 0.55 * b; p.crouch = 0.12; p.armA = BOW_A; p.armB = BOW_B; p.headPitch = 0.2 * b;
    if (t > T_.THAW) { const c = K(t, [[T_.THAW + 0.05 + i * 0.04, 0], [T_.THAW + 0.3 + i * 0.04, 1]]); p.lean = lerp(p.lean, -0.08, c); p.crouch = lerp(0.12, 0, c); p.armA = mixArm(BOW_A, EYES_A, c); p.armB = mixArm(BOW_B, EYES_B, c); p.headPitch = lerp(p.headPitch, -0.1, c); p.mouth = 'flat'; }
    if (t >= 56.4) { const g = K(t, [[T_.HOLE, 0], [T_.HOLE + 0.6, 1]]); p.armA = mixArm(EYES_A, A(-1.3, 0.5, -0.3), g); p.armB = mixArm(EYES_B, A(-1.3, 0.5, -0.3), g); p.lean = -0.25 * g; p.mouth = 'o'; p.rotY = faceToward(x, z, -1.6, -3.6) + PI; }   // leaning away from the hole
    return p;
  }

  // ---------------------------------------------------------------- update
  let cur = null;
  const ui = document.getElementById('ui');
  function update(T) {
    const shot = shotAt(T), S = shot.set, t = T;
    bubbleReq.length = 0; ALL_BUBBLES.forEach((b) => b.setPop(0));
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 1 : S === 'city' || S === 'stad' ? 0.1 : 0.03;
    studio.fill.intensity = S === 'space' ? 0 : S === 'stad' || S === 'city' ? 0.9 : S === 'street' ? 0.8 : 0.5;
    ALL.forEach((r) => (r.root.visible = false));
    [toast, cat.g, carafe, mugG, coffeeTop, stream, shades, bag, jet.g, gulp].forEach((o) => (o.visible = false));
    sunShades.visible = false; beam.visible = false; beamTip.visible = false; holeB.set(null, 0, 0, false); holeS.set(null, 0, 0, false);
    napkins.count = 0; papers.count = 0; flock.begin(); aura.hide(); setWind(0, t);
    junk.forEach((J) => { J.g.visible = t >= 50.8; J.g.position.copy(J.p0); J.g.rotation.copy(J.r0); J.g.scale.setScalar(1); });
    puffN = 0; sparkN = 0; puffs.hide(); sparks.hide(); cloudPuffs.hide(); swirl.hide(); townStar.forEach((s) => (s.visible = false));
    if (ui) ui.style.display = t >= 200 ? 'none' : '';
    let jolt = 0, fovMul = 1;
    const kick = (t0, amp, dur = 0.5) => { const a = t - t0; if (a > 0 && a < dur) jolt = Math.max(jolt, amp * Math.exp(-a * 6)); };
    const post = [];   // placements that need THIS frame's camera (run after setCamera, like the bubbles)

    if (t >= 200) {
        // ---- pose lineup (debug): 5 figures per frame
        const k = Math.floor((t - 200) * 2), LB = [[wave(t, 3.2), REST], [wave(t + 0.15, 3.2), REST], [clap(t, 0, -1), clap(t, 0, 1)], [clap(t + 0.12, 0, -1), clap(t + 0.12, 0, 1)], [CROSS_B, CROSS_A], [BACK_B, REST],
          [CATCH_B, REST], [EYES_B, EYES_A], [HEAD_B, HEAD_A], [BOW_B, BOW_A], [POINT_B, REST], [HOSE_B, REST], [A(-1.3, 0.3, -2.15, -0.5), REST], [A(-0.75, 0.15, -1.15, -0.35), A(-0.75, 0.15, -1.15, 0.35)], [REST, REST]];
        [todd, extras[0], extras[1]].forEach((r, j) => { const L3 = LB[(k * 3 + j) % LB.length], p = basePose(); Object.assign(p, { x: -0.62 + j * 0.62, z: 3.5, rotY: 0, mouth: 'o', glasses: j === 0, y: 0 }); p.armB = L3[0]; p.armA = L3[1]; put(r, 'street', p); });
        studio.fill.intensity = 1.2;
    } else if (S === 'kit') {
      kit.setClock(7, 42);
      {
        put(todd, 'kit', toddKitchen(t));
        // the cat on the counter (right of the sink): squints on day 1, eyes wide on day 2, salutes on day 5
        cat.g.visible = true; cat.g.position.copy(L('kit', -0.15, 0.875, -2.3)); cat.g.rotation.set(0, -0.15, 0); cat.update(t, 1); salute(0); cat.talk(0);
        cat.squint(t < 6.0 ? K(t, [[T_.BONK, 0], [T_.BONK + 0.3, 1]]) : t < 10.6 ? (t < T_.CATCH ? 1 : 0) : 0);
        cat.head.rotation.y = t < 6.0 ? K(t, [[T_.BONK + 0.4, 0], [T_.BONK + 0.8, 0.9]]) : t < 10.6 ? -0.25 : -0.2;
        if (t >= 10.6) { cat.g.position.copy(L('kit', -0.15, 0.875, -2.32)); cat.g.rotation.set(0, 0.45, 0); salute(K(t, [[T_.SALUTE, 0], [T_.SALUTE + 0.25, 1]])); cat.squint(0); }
        // the toast
        const ta = toastAt(t);
        if (ta === 'hand') { toast.visible = true; toast.position.copy(handWorld(todd, 1)).add(_V.set(0, 0.05, 0.02)); toast.rotation.set(0, todd.root.rotation.y, 0.1); }
        else if (ta) { toast.visible = true; toast.position.copy(L('kit', ...ta[0])); toast.rotation.set(...ta[1]); }
        if (t > 9.5 && t < 10.6 && ta === 'hand') toast.scale.set(1.6, 1.25, 1.6); else toast.scale.setScalar(1.6);
        if (t < 6.0) { kick(T_.BONK, 0.012); dust(t, T_.BONK + 0.45, L('kit', -0.5, 0.03, -0.85), 0.25, 5, 0.6); }
        // the aura: day 2 (pops on) → day 5 (bigger, wind)
        const feet = feetW(todd);
        if (t >= T_.GLOW_ON && t < 10.6) { const on = K(t, [[T_.GLOW_ON, 0], [T_.GLOW_ON + 0.18, 1.3], [T_.GLOW_ON + 0.4, 1]]); aura.set(t, feet, 0.7 * on, 0.55 * Math.min(1, on), { motes: 0.6, light: 1.6, rays: 0.55 }); sparkle(t, T_.GLOW_ON, feet.clone().add(_V.set(0, 1.2, 0)), 0.5, 10, 0.7); }
        if (t >= 10.6) {
          aura.set(t, feet, 0.95, 0.8, { light: 2.2 });
          const w = K(t, [[T_.WIND, 0], [T_.WIND + 0.4, 1]]); setWind(w, t);
          curtains.forEach((c, i) => { c.rotation.x = -0.22 * w - 0.1 * w * Math.sin(t * 6 + i * 2); c.position.z = -2.6 + 0.04 + 0.1 * w; });
          // napkins swirling through the room in the wind
          let n = 0; for (const N of NAP) { const a = t - T_.WIND; if (a < 0) break; const ang = N.ph + a * N.sp; _S.set(N.x + Math.sin(ang) * N.r + a * 0.3, N.y + 0.25 * Math.sin(ang * 1.7), N.z + Math.cos(ang) * N.r * 0.5); _Q.setFromEuler(_E.set(ang * 2, ang, ang * 0.7)); _M.compose(_S.add(_V.set(...OFF.kit)), _Q, _W.set(1, 1, 1)); napkins.setMatrixAt(n++, _M); }
          napkins.count = n; napkins.instanceMatrix.needsUpdate = true;
          // the carafe floats over to his mug and pours itself
          const c = carafeAt(t); carafe.visible = true; carafe.position.copy(L('kit', c.x, c.y, c.z)); carafe.rotation.set(0, 0, -c.tilt);
          mugG.visible = true; mugG.position.copy(L('kit', ...MUGP)); mugG.rotation.set(0, -0.6, 0);
          const fill = K(t, [[T_.POUR0 + 0.1, 0], [T_.POUR1, 1]], (u) => u);
          coffeeTop.visible = fill > 0.02; coffeeTop.position.copy(L('kit', MUGP[0], MUGP[1] + 0.012 + 0.065 * fill, MUGP[2]));
          if (c.tilt > 0.9) { stream.visible = true; const sp = L('kit', c.x + 0.075, c.y + 0.12, c.z), top = L('kit', MUGP[0], MUGP[1] + 0.012 + 0.065 * fill, MUGP[2]); stream.position.copy(sp).add(top).multiplyScalar(0.5); stream.scale.set(1, sp.distanceTo(top), 1); stream.quaternion.setFromUnitVectors(_V.set(0, 1, 0), _W.copy(sp).sub(top).normalize()); }
          say(BUB.cat, L('kit', -0.3, 1.72, -2.32), 0.42, T_.SALUTE + 0.15, 1.3, t);
          sparkle(t, T_.SALUTE + 0.1, L('kit', -0.15, 1.45, -2.25), 0.3, 8, 0.6);
        }
        if (t >= T_.GLOW_ON && t < 10.6) say(BUB.plus1, headAt(todd, 0.3).add(_W.set(0.45, 0, 0)), 0.38, T_.GLOW_ON + 0.1, 1.4, t);
      }
    } else if (S === 'burb') {
      if (t < 50.8) {
        // ---- day 8: slow-motion walk down his path; sunglasses from the sky; the neighbor drops the hose
        burb.aimSun(-2, -5, 10);
        burb.houses[2].door.rotation.y = 1.45;
        put(todd, 'burb', toddBurb(t)); put(neighbor, 'burb', neighborBurb(t));
        setWind(0.7, t * 0.45);
        const feet = feetW(todd); aura.set(t * 0.5, feet, 1.15, 0.75, { light: 2.0, moteSize: 1.2 });
        shades.visible = t > T_.SHADES0;
        if (shades.visible) {
          wearAt(todd, shades);
          if (t < T_.SHADES1) { const u = clamp((t - T_.SHADES0) / (T_.SHADES1 - T_.SHADES0)); shades.position.y += 6 * (1 - u * u); shades.rotateY(3.5 * (1 - u)); shades.rotateZ(1.2 * (1 - u)); }
          else { const a = t - T_.SHADES1; shades.position.y += a < 0.25 ? 0.02 * Math.sin(a * PI / 0.25) : 0; }
        }
        sparkle(t, T_.SHADES1, headAt(todd, 0.0).add(_V.set(0, 0, 0.12)), 0.35, 10, 0.6); kick(T_.SHADES1, 0.006);
        // the hose: a spray arc onto the lawn, then (dropped) it flails up
        const hw = handWorld(neighbor, 1);
        for (let k = 0; k < 18; k++) { const u = ((t * 1.6 + k / 18) % 1), dropped = t > T_.HOSE; const dir = dropped ? _W.set(Math.sin(t * 7 + k) * 0.7, 1.4, Math.cos(t * 5) * 0.6) : _W.set(-0.45, 0.55, -0.9); const pp = hw.clone().addScaledVector(dir, u * 2.4).add(_V.set(0, -2.6 * u * u, 0)); if (pp.y < 0.04) continue; sparks.set(sparkN++, pp, 0.09, 0.5 * (1 - u), new THREE.Color(0.5, 0.75, 1.0)); }
        say(BUB.hose, headAt(neighbor, 0.36).add(_W.set(-0.55, 0, 0)), 0.42, T_.HOSE + 0.2, 1.6, t);
      } else if (t < 56.4) {
        // ---- day 31, peak aura → the wave back → −∞
        burb.aimSun(-1.2, -1.5, 12);
        burb.houses[2].door.rotation.y = 0;
        put(todd, 'burb', toddCurb(t));
        const feet = feetW(todd), s = tz(t);
        const imp = K(t, [[T_.FREEZE + 0.02, 0], [T_.FREEZE + 0.18, 1]]);   // the glow implodes at the freeze
        const wc = shot.cam === 'waveC';   // (behind him in waveC is the reveal: keep the glow thin there)
        if (t < T_.THAW) aura.set(s, feet, (wc ? 1.05 : 1.45) * (1 - 0.92 * imp), 1.0 * (1 - imp), { light: 2.6, moteSize: 1.15, haze: wc ? 0.3 : 1, rays: wc ? 0.55 : 1, op: wc ? 0.45 : 1 });
        setWind(shot.cam === 'waveA' ? 0.85 : 0, s);
        shades.visible = true; wearAt(todd, shades, t > T_.THAW ? K(t, [[T_.THAW, 0], [T_.THAW + 0.5, 1]]) : 0);
        if (t > T_.THAW + 0.5) { const a = t - T_.THAW - 0.5; shades.position.y -= Math.min(1.4, 4.9 * a * a); shades.rotateX(Math.min(2.5, a * 8)); if (shades.position.y < SW_H + 0.03) shades.position.y = SW_H + 0.03; }
        if (shot.cam === 'waveB') { put(waver, 'burb', waverPose(t)); say(BUB.hi, headAt(waver, 0.42), 0.36, T_.NBWAVE + 0.1, 0.8, t); }
        else {
          if (shot.cam === 'waveA') put(waver, 'burb', waverPose(t));
          NBR.forEach((_, i) => put(extras[i], 'burb', bower(t, i)));
          if (shot.cam === 'waveC' || shot.cam === 'cringe') { put(mailman, 'burb', mailmanPose(t)); bag.visible = mailman.root.visible; bag.position.copy(handWorld(mailman, -1)).add(_V.set(0, 0.05, 0)); bag.rotation.set(0, mailman.root.rotation.y, 0); }
          // the cat on the mailbox, saluting → at −∞ it lowers the paw and turns away
          cat.g.visible = true; cat.g.position.copy(L('burb', MAILBOX[0], 1.33, MAILBOX[1])); const away = K(t, [[T_.THAW + 0.25, 0], [T_.THAW + 0.6, 1]]);
          cat.g.rotation.set(0, lerp(-0.25, -0.25 + PI, away), 0); salute(1 - away); cat.update(s, 1); cat.squint(away);
          // pigeons circling over him in a ring → at −∞ they scatter
          for (let k = 0; k < 14; k++) {
            const a0 = (k / 14) * 2 * PI + s * 0.9, fl = t > T_.THAW ? t - T_.THAW : 0, r = 2.6 + fl * 6;
            flock.add(L('burb', TODD_C[0] + Math.cos(a0) * r, 3.6 + 0.3 * Math.sin(a0 * 2) + fl * 3, TODD_C[1] - 1.2 + Math.sin(a0) * r * 0.6).x, 3.6 + 0.3 * Math.sin(a0 * 2) + fl * 3, TODD_C[1] - 1.2 + Math.sin(a0) * r * 0.6, { rotY: -a0 + (fl ? PI / 2 : 0), s: 1.0, flap: t >= T_.FREEZE && t < T_.THAW ? 0.3 : Math.abs(Math.sin(s * 20 + k)), color: PIGEON });
          }
          if (t >= T_.FREEZE) { for (const [b, i, d] of [[BUB.neg1, 0, 0], [BUB.neg2, 1, 0.04]]) say(b, headAt(extras[i], 0.3), 0.38, T_.THAW + 0.3 + d, 1.5, t); }
          if (shot.cam !== 'waveC') { /* the crash zoom is waveC's */ } else if (t > T_.FREEZE && t < T_.FREEZE + 0.5) fovMul = 1 - 0.32 * K(t, [[T_.FREEZE, 0], [T_.FREEZE + 0.12, 1]]);   // crash zoom on the freeze
          else if (t >= T_.FREEZE + 0.5 && t < T_.THAW + 0.3) fovMul = 0.68 + 0.32 * K(t, [[T_.THAW - 0.05, 0], [T_.THAW + 0.3, 1]]);
          if (t > T_.THAW) dust(t, T_.THAW, feet.clone().add(_V.set(0, 1.0, -0.2)), 0.6, 8, 0.9, new THREE.Color(0x8a6aa8));
        }
        sparkle(t, 51.0, feet.clone().add(_V.set(0, 1.6, 0)), 0.8, 12, 0.9);
      } else {
        // ---- day 32: the anti-aura opens behind him and eats the lawn (people lean away; the cat clings; birds are long gone)
        burb.aimSun(-1.2, -2.5, 12);
        put(todd, 'burb', toddCurb(t)); NBR.forEach((_, i) => put(extras[i], 'burb', bower(t, i)));
        const op = K(t, [[T_.HOLE, 0], [T_.HOLE + 0.35, 1.25], [T_.HOLE + 0.6, 1]]), grow = 1 + 0.45 * K(t, [[57.5, 0], [60.4, 1]]);
        const hp = L('burb', -1.6, 3.4 + 0.5 * K(t, [[59.2, 0], [60.4, 1]]), -3.6);
        holeB.set(hp, 1.9 * op * grow, t, op > 0.01);
        for (let k = 0; k < 40; k++) { const a = k * 2.399 + t * 2.5, u = ((t * 0.9 + k / 40) % 1), r = (1 - u) * 2.6 * grow; swirl.set(k, _V.set(hp.x + Math.cos(a) * r, hp.y + Math.sin(a) * r * 0.55, hp.z + 0.15).clone(), 0.12 + 0.12 * (1 - u), 0.8 * u * op, new THREE.Color(0.9, 0.5, 1.6)); }
        // the junk + the sunglasses spiral in (each starts at its own time, u³ pull, shrinks into the hole)
        const hpL = _S.copy(hp).sub(_V.set(...OFF.burb)).clone();
        const pull = (g, p0, tgt, t0, dur, spin) => { const u = clamp((t - t0) / dur), e = u * u * u; if (u >= 1) { g.visible = false; return; } g.visible = true; const ang = e * 5 + spin; const q = p0.clone().lerp(tgt, e); q.x += Math.cos(ang) * (1 - e) * 0.4 * e * 3; q.y += Math.sin(ang) * (1 - e) * 0.3 * e * 3; g.position.copy(q); g.rotation.set(spin + e * 9, e * 7, e * 5); g.scale.setScalar(1 - 0.85 * e * e); };
        junk.forEach((J, i) => pull(J.g, J.p0, hpL, T_.HOLE + 0.4 + i * 0.42, 1.1, i * 1.3));
        shades.visible = true; pull(shades, L('burb', TODD_C[0], 1.45, TODD_C[1] - 0.05), hp, T_.HOLE + 0.15, 0.9, 0.5);
        cat.g.visible = true; cat.g.position.copy(L('burb', MAILBOX[0], 1.33, MAILBOX[1])); cat.g.rotation.set(0.35 * op, PI - 0.6, 0); cat.update(t, 0.2); cat.squint(1); salute(0); cat.legs[0].rotation.x = -0.6; cat.legs[1].rotation.x = -0.6;
        kick(T_.HOLE, 0.03, 0.8); jolt = Math.max(jolt, 0.006 * op);
        studio.fill.intensity = 0.35;
      }
    } else if (S === 'off') {
      office.door.rotation.y = 1.35 * K(t, [[T_.ODOOR, 0], [T_.ODOOR + 0.35, 1]]);
      const tp = toddOffice(t); put(todd, 'off', tp);
      for (let i = 0; i < 16; i++) { put(extras[i], 'off', HIDE_W.includes(i) ? null : worker(t, i, tp)); const st = K(t, [[standT(i), 0], [standT(i) + 0.45, 1]]); office.desks[i].chair.position.z = OD.desks[i].seat[1] + 0.06 + 0.35 * st; office.desks[i].chair.rotation.y = 0.3 * st * Math.sin(i * 3.1); }
      setWind(0.75, t * 0.5);
      const feet = feetW(todd); aura.set(t * 0.5, feet, 1.6, 0.85, { light: 2.6, moteSize: 1.1 });
      // papers fly off every desk as he passes (the aura wind)
      let n = 0;
      for (const P of PAPER) {
        const a = t - (standT(PAPER.indexOf(P) % 16) - 0.15) - P.d;
        let x = P.x, z = P.z, y = OD.deskTop + 0.006, rx = -PI / 2, ry = P.ph, rz = 0;
        if (a > 0) { const up = Math.min(a, 0.6), fall = Math.max(0, a - 0.6); y = OD.deskTop + P.vy * up - 3.6 * up * up - 0.35 * fall; x += P.vx * Math.min(a, 3) * 0.6 + 0.15 * Math.sin(a * 3 + P.ph); z += P.vz * Math.min(a, 3) * 0.6; rx = -PI / 2 + a * P.sp; rz = 0.6 * Math.sin(a * 4 + P.ph); ry = P.ph + a * 2; if (y < 0.01) { y = 0.01; rx = -PI / 2; rz = 0; } }
        _Q.setFromEuler(_E.set(rx, ry, rz, 'YXZ')); _M.compose(_V.set(x + OFF.off[0], y, z + OFF.off[2]), _Q, _S.set(1, 1, 1)); papers.setMatrixAt(n++, _M);
      }
      papers.count = n; papers.instanceMatrix.needsUpdate = true;
      say(BUB.o1, headAt(extras[9], 0.42), 0.36, 22.9, 1.4, t); say(BUB.o2, headAt(extras[6], 0.42), 0.36, 23.5, 1.4, t); say(BUB.o3, headAt(extras[13], 0.42), 0.36, 24.1, 1.3, t);
    } else if (S === 'street') {
      street.aimSun(3, -1, 14); street.trees.forEach((tr) => (tr.t.visible = false)); street.cart.visible = false; studio.fill.intensity = 1.3;
      const tp = toddStreet(t); put(todd, 'street', tp);
      SIG_X.forEach((x, k) => setSignal(signals[k], t > T_[`LIGHT${k + 1}`] ? 1 : 0));
      SIG_X.forEach((x, k) => sparkle(t, T_[`LIGHT${k + 1}`], L('street', x - 0.15, SIDEWALK_H + 2.36, -0.4), 0.3, 6, 0.5, new THREE.Color(0.6, 2.0, 0.9)));
      const feet = feetW(todd); aura.set(t * 0.6, feet, 3.0, 0.9, { dome: 0.85, light: 3.2, moteSize: 1.0 });
      setWind(0.6, t * 0.6);
      // a V of pigeons in formation, low, behind him (flying in from far down the street)
      const arr = K(t, [[T_.BIRDS, 0], [T_.BIRDS + 1.3, 1]]);
      for (let k = 0; k < 13; k++) {
        const row = Math.ceil(k / 2), side = k === 0 ? 0 : (k % 2 ? 1 : -1);
        const fx = tp.x + 0.9 + row * 0.7 + (1 - arr) * 14, fy = SIDEWALK_H + 1.95 + row * 0.06 + (1 - arr) * 2.5 + 0.06 * Math.sin(t * 3 + k), fz = tp.z + 0.3 + side * row * 0.5;
        flock.add(fx + OFF.street[0], fy, fz + OFF.street[2], { rotY: -PI / 2, s: 1.7, flap: Math.abs(Math.sin(t * 16 + k * 0.6)), color: PIGEON });
      }
    } else if (S === 'stad') {
      stad.beams.forEach((b) => (b.visible = false));
      // two crests half a lap apart (one passes behind him in stadA, the other laps the far end in stadB)
      const sg = shot.cam === 'stadA' ? 0.26 : 0.42;
      const crest = (th) => { const d = (((th - T_.WAVE_W * (t - T_.WAVE_AT)) % PI) + 1.5 * PI) % PI - PI / 2; return Math.exp(-(d * d) / (2 * sg * sg)); };
      const crestC = []; stad.updateFans(t, (f) => { if (f.field) return { y: -60 }; const c = crest(f.theta); crestC[f.i] = c; return { y: 1.3 * c, arms: Math.max(0.15, c), sway: 0.05 * Math.sin(t * 2 + f.seed * 9) }; });
      fanMeshes.forEach((m, j) => { const a = m.instanceColor.array, o0 = fanCols[j]; for (let i = 0; i < stad.NF; i++) { const c = crestC[i] || 0; a[i * 3] = lerp(o0[i * 3], 1.6, c); a[i * 3 + 1] = lerp(o0[i * 3 + 1], 1.25, c); a[i * 3 + 2] = lerp(o0[i * 3 + 2], 0.3, c); } m.instanceColor.needsUpdate = true; });
      const tp = toddField(t); put(todd, 'stad', tp);
      const feet = feetW(todd), close = shot.cam === 'stadA';
      aura.set(t * 0.6, feet, close ? 2.2 : 11, 1.0, { dome: close ? 0 : 0.75, light: 0, moteSize: close ? 1.4 : 5, push: close ? 0.4 : 1.0, rayScale: close ? 2.4 : 3.0, haze: close ? 0.5 : 1 });
      setWind(0.6, t * 0.6);
    } else if (S === 'city') {
      city.setShadowFocus(-6, -20, 60);
      const on = K(t, [[35.6, 0.7], [36.0, 1]]), flare = K(t, [[T_.CLOUDS - 0.3, 0], [T_.CLOUDS, 1], [T_.CLOUDS + 0.8, 0.85]]);
      pillar.scale.set(1 + 0.25 * flare, 1, 1 + 0.25 * flare);
      pillar.children.forEach((m) => (m.material.uniforms.uOp.value = (0.8 + 0.2 * Math.sin(t * 7)) * on * (1 + 0.35 * flare)));
      pillarLight.intensity = 9000 * on;
      [0, 1].forEach((i) => put(extras[i], 'city', (() => { const p = rooftopGuy(t, i); p.floor = p.y = ROOF_Y; return p; })()));
      // the cloud deck around the pillar parts in a ring at the flare
      const CY = 85;
      for (let k = 0; k < 60; k++) { const a = k * 2.399, r0 = 30 + (k % 7) * 9, push = K(t, [[T_.CLOUDS, 0], [T_.CLOUDS + 1.4, 1]]) * (40 + (k % 5) * 12); cloudPuffs.set(k, _V.set(PILLAR[0] + Math.cos(a) * (r0 + push), CY + (k % 4) * 6, PILLAR[1] + Math.sin(a) * (r0 + push) * 0.6), 34 + (k % 3) * 9, 0.75, new THREE.Color(0x9aa4c4)); }
      // the jet banks around it
      const ju = clamp((t - 36.0) / 4.6), ang = lerp(-1.9, 1.6, ju);
      jet.g.visible = true; jet.g.position.set(PILLAR[0] + Math.sin(ang) * 32, 58 + 6 * ju, PILLAR[1] + Math.cos(ang) * 32); jet.g.rotation.set(0, ang + PI / 2, -0.55, 'YXZ');
    } else if (S === 'space') {
      const R = space.R;
      moon.visible = true; moon.position.copy(MOON0); moon.scale.setScalar(1); moon.lookAt(toWorld('space', TP)); moon.material.emissiveIntensity = 0;
      sunMesh.visible = corona.visible = true; sunMesh.position.copy(SUN0); sunMesh.scale.setScalar(1); corona.position.copy(SUN0); corona.scale.setScalar(2300); corona.material.opacity = 1; sunMesh.material.color.copy(sunCol);
      space.sun.intensity = 3.2;
      const star = (s, k) => { const n = TP.clone().addScaledVector(TOWN, 6); townStar.forEach((sp, i) => { sp.visible = k > 0.01; sp.position.copy(n); sp.scale.setScalar(s * [1, 0.3, 2.0, 3.2][i]); sp.material.opacity = k * [0.85, 1, 0.35, 0.7][i]; if (i === 3) sp.material.rotation = t * 0.12; }); };
      if (shot.cam === 'spc1') {
        star(lerp(60, 140, K(t, [[40.6, 0], [42.0, 1]])) * (1 + 0.05 * Math.sin(t * 6)), 1);
        moon.material.emissiveIntensity = 1.4 * K(t, [[T_.MOONLIT, 0], [T_.MOONLIT + 0.9, 1]]);
        // the light front leaves the town and reaches the Moon 1.3 s later (384,400 km at c — the HUD's fact)
        const bu = clamp((t - T_.BEAM0) / (T_.MOONLIT - T_.BEAM0)), from = TP.clone().addScaledVector(TOWN, 8), to = MOON0.clone().addScaledVector(_W.copy(TP).sub(MOON0).normalize(), 118);
        if (t > T_.BEAM0) {
          const tip = from.clone().lerp(to, bu), fade = 1 - K(t, [[T_.MOONLIT + 0.2, 0], [T_.MOONLIT + 1.4, 1]]);
          beam.visible = fade > 0.01; beam.position.copy(from).add(tip).multiplyScalar(0.5); beam.scale.set(7, from.distanceTo(tip) + 0.01, 7); beam.quaternion.setFromUnitVectors(_V.set(0, 1, 0), _S.copy(tip).sub(from).normalize()); beam.material.opacity = 0.75 * fade;
          beamTip.visible = bu < 1 || t < T_.MOONLIT + 0.4; beamTip.position.copy(tip); beamTip.scale.setScalar(bu < 1 ? 70 : 70 + 500 * (t - T_.MOONLIT)); beamTip.material.opacity = bu < 1 ? 1 : Math.max(0, 1 - (t - T_.MOONLIT) / 0.4);
        }
      } else if (shot.cam === 'sun') {
        const o = K(t, [[T_.OUTSHINE - 0.6, 0], [T_.OUTSHINE + 0.8, 1]]);
        star(lerp(170, 560, o) * (1 + 0.04 * Math.sin(t * 7)), 1);
        moon.visible = false;
        const sk = K(t, [[T_.OUTSHINE, 1], [T_.OUTSHINE + 1.2, 0.55]]); corona.material.opacity = sk; sunMesh.material.color.copy(sunCol).multiplyScalar(lerp(0.8, 1, sk));
        // the Sun's sunglasses drop on (from above, along the camera's up), then a little settle
        sunShades.visible = t > T_.SUNSHADES - 0.6;
        if (sunShades.visible) post.push(() => {
          const cam = studio.camera, toCam = _W.copy(cam.position).sub(toWorld('space', SUN0)).normalize();
          const u = clamp((t - (T_.SUNSHADES - 0.6)) / 0.6), drop = (1 - u * u) * 2200 + (u >= 1 ? 30 * Math.sin(clamp((t - T_.SUNSHADES) / 0.3) * PI) : 0);
          sunShades.position.copy(SUN0).addScaledVector(toCam, 420 - HR * 4400).add(_V.set(0, drop - 60, 0));
          sunShades.quaternion.setFromRotationMatrix(_M.lookAt(_V.copy(SUN0).add(toCam), SUN0, _S.set(0, 1, 0)));
          sunShades.scale.setScalar(4400);
          sparkle(t, T_.SUNSHADES, toWorld('space', SUN0).addScaledVector(toCam, 500), 260, 10, 0.6);
        });
      } else {
        // ---- day 33: the −∞ hole above the town eats the Moon, then the Sun (sunglasses on)
        moon.material.emissiveIntensity = 1.2; star(0, 0); moon.lookAt(toWorld('space', TP));
        const op = K(t, [[60.45, 0], [60.9, 1]]), grow = 1 + 0.3 * K(t, [[T_.MOONGULP, 0], [T_.MOONGULP + 0.25, 1]]) + 0.4 * K(t, [[T_.SUNGULP, 0], [T_.SUNGULP + 0.3, 1]]);
        const hp = HOLE_S;
        holeS.set(hp, 150 * op * grow * (1 + 0.04 * Math.sin(t * 8)), t, op > 0.01);
        for (let k = 0; k < 50; k++) { const a = k * 2.399 + t * 2.2, u = ((t * 0.7 + k / 50) % 1), r = (1 - u) * 300 * grow; swirl.set(k, toWorld('space', hp).add(_V.set(Math.cos(a) * r, Math.sin(a) * r * 0.6, 0)), 14 + 14 * (1 - u), 0.85 * u * op, new THREE.Color(0.9, 0.5, 1.6)); }
        // the Moon: stretched toward the hole, pulled in (u³), gone at MOONGULP
        const mu = clamp((t - T_.MOONIN) / (T_.MOONGULP - T_.MOONIN)), me = mu * mu * mu;
        moon.visible = t < T_.MOONGULP; moon.position.copy(MOON0).lerp(hp, me); moon.lookAt(toWorld('space', hp));
        moon.scale.set(1 - 0.5 * me, 1 - 0.5 * me, 1 + 1.2 * me).multiplyScalar(1 - 0.85 * me * me);   // stretched along its +z (toward the hole)
        // the Sun: races in from the top right, sunglasses on
        const su = clamp((t - T_.SUNIN) / (T_.SUNGULP - T_.SUNIN)), se = su * su;
        const SUN_EAT0 = hp.clone().addScaledVector(UPT, 820).addScaledVector(RTT, -560);
        const sp = SUN_EAT0.clone().lerp(hp, se);
        sunMesh.visible = corona.visible = t > T_.SUNIN - 0.05 && t < T_.SUNGULP; sunMesh.position.copy(sp); sunMesh.scale.setScalar(0.45 * (1 - 0.8 * se * se)); corona.position.copy(sp); corona.scale.setScalar(1000 * (1 - 0.8 * se * se)); corona.material.opacity = 0.8;
        if (sunMesh.visible) post.push(() => { const cam = studio.camera, toCam = _W.copy(cam.position).sub(toWorld('space', sp)).normalize(); sunShades.visible = true; const sc = 0.45 * (1 - 0.8 * se * se); sunShades.position.copy(sp).addScaledVector(toCam, 420 * sc + 8 - HR * 4400 * sc); sunShades.quaternion.setFromRotationMatrix(_M.lookAt(_V.copy(sp).add(toCam), sp, _S.set(0, 1, 0))); sunShades.scale.setScalar(4400 * sc); });
        space.sun.intensity = t > T_.SUNGULP ? 0.8 : 3.2;
        for (const g0 of [T_.MOONGULP, T_.SUNGULP]) { const a = t - g0; if (a > 0 && a < 0.9) { gulp.visible = true; gulp.position.copy(toWorld('space', hp)).addScaledVector(UPT, 470); gulp.scale.setScalar(230 * popK(t, g0) * (1 - K(t, [[g0 + 0.7, 0], [g0 + 0.9, 1]]))); } }
        for (const g0 of [T_.MOONGULP, T_.SUNGULP]) sparkle(t, g0, toWorld('space', hp), 160, 14, 0.7, new THREE.Color(1.2, 0.7, 2.0));
      }
    }

    // camera (local → world)
    const c = CAMS[shot.cam], o = OFF[S];
    let P, Aim, fov = c.fov;
    if (c.fn) { const r = c.fn(t); P = r.p.map((v, i) => v + o[i]); Aim = r.a.map((v, i) => v + o[i]); if (r.fov) fov = r.fov; }
    else {
      const u = clamp((T - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    }
    if (shot.cam === 'waveC' && t > T_.FREEZE) { const zk = (1 - fovMul) / 0.32, hd = headAt(todd, 0); Aim = Aim.map((v, i) => lerp(v, hd.getComponent(i), 0.85 * zk)); }   // the crash zoom lands on his face
    if (S === 'space' && jolt === 0) { for (const g0 of [T_.MOONGULP, T_.SUNGULP]) { const a = t - g0; if (a > 0 && a < 1) jolt = Math.max(jolt, 10 * Math.exp(-a * 5)); } }
    if (jolt) { P = [P[0] + jolt * Math.sin(T * 70), P[1] + jolt * Math.sin(T * 55), P[2] + jolt * 0.5 * Math.sin(T * 63)]; }
    setCamera(P, Aim, fov * fovMul, T, c.amp);
    studio.camera.updateMatrixWorld(true);
    aura.flush(); post.forEach((f) => f());
    for (const [b, pos, k, frac] of bubbleReq) { const d = studio.camera.position.distanceTo(pos); b.sprite.position.copy(pos); b.setPop(k * frac * frameW(d)); }
    flock.end();
  }
  return { update };
}
