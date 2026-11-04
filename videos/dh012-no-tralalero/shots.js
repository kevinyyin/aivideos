// VIDEO dh012 — "What if Tralalero Tralala didn't exist?"  (tone FUNNY: a meme ripple ladder, the companion to
// dh005). Tralalero is patient zero of Italian brainrot: erase him and the whole wave unravels, domino by domino, in many places
// (SECOND 0 → +1 YEAR). His beach strut ends in a poof and three orphaned blue sneakers; the Meme Hall of Fame dominoes; the
// bomber-crocodile un-merges over a public pool; a sneaker store that sold sneakers in threes drowns in third shoes; the fan
// club can't hold the pose without the third leg; the internet's replacements get worse until the meme machine blows up; and his
// sneakers walk the world looking for him — a real shark has no legs — until, at low tide in Australia, they find a shark that
// really walks. The joke is on brainrot culture and the internet, never on Italy or Italians (the beach, espresso and pastel
// houses are the meme's own setting). Our own toy characters; generic sneakers (no brand); no real people; cartoon effects only.
//
// Sources (checked Nov 1 2026; BRAINROT CHARACTERS LEFT is a joke number on purpose):
//  - Tralalero Tralala = the first viral character of Italian brainrot; the sound from TikTok user @eZburger401 (banned) in early
//    Jan 2025; the AI shark in blue Nike-style sneakers on a beach: @amoamimandy.1a, Jan 13 2025, over 7 million plays and
//    600,000 likes in a month (since deleted) — Wikipedia "Italian brainrot"; Know Your Meme "Tralalero Tralala"; Daily Dot
//    "Tralalero tralala meme"; made with AI images + AI-generated Italian narration (Wikipedia)
//  - Bombardiro Crocodilo: earliest documented video Feb 20 2025 (Know Your Meme, Italian brainrot); Tung Tung Tung Sahur:
//    Feb 28 2025 (Wikipedia, "Tung Tung Tung Sahur")
//  - sharks appear ~450 million years ago; the oldest trees (Archaeopteris) ~385 million years ago — BBC Wildlife
//    ("Are sharks older than trees?"); sharks have cartilage skeletons and no legs
//  - walking sharks: 9 species (genus Hemiscyllium), they walk on their fins across reef flats and between tide pools at low
//    tide — Dudgeon et al., Marine and Freshwater Research (Jan 2020), via National Geographic / Conservation International
//  - more than 530 shark species — Gavin Naylor, Florida Museum (UF News, Jul 2023)
//  - 23.9 billion pairs of shoes made in 2024 — World Footwear Yearbook 2025 (APICCAPS)
//  - Italy → Cairns, Australia ≈ 14,800–15,000 km great-circle (computed)
//
// Shot list (video seconds)                     | set     | what happens
//  0.0– 5.4  beachA  SECOND 0 (title over it)    | beach   | Tralalero struts the shoreline for the phones; a kid yells his name; he leaps — POOF at the
//                                                            apex; three blue sneakers rain down; the blast knocks everyone flat
//  5.4– 8.0  beachB                              | beach   | reverse from the sea: every umbrella row topples like dominoes; three sneakers smoking in the sand
//  8.0–13.4  hallA/B +1 SECOND                   | hall    | his gold statue poofs; five pedestals domino; each statue lands as an ordinary thing
// 13.4–19.0  poolA/B +1 MINUTE                   | pool    | Bombardiro Crocodilo un-merges: the plane flies on, the crocodile drops into the pool — SPLASH
// 19.0–24.4  shoeA/B +1 HOUR                     | shoe    | TRIPLE KICKS (sold in threes): 50% → 90% → FREE, a tumbleweed; the stockroom bursts, 1,400 sneakers
// 24.4–29.8  festA/B +1 DAY                      | beach   | the fan club's tripod pose — the third legs poof, they topple back like dominoes, the balloon sags
// 29.8–35.8  officeA/B +1 WEEK                   | office  | the content farm generates replacements (clogs, skates, a fridge); the fridge breaks the machine
// 35.8–40.8  walkA/B +1 MONTH                    | beach   | sunset, empty beach: the sneakers come alive and set off along the shore
// 40.8–45.8  aquaA/B +2 MONTHS                   | aquarium| they sink into the shark tank and try a real shark — no legs; they tumble in its wake
// 45.8–48.6  globe   +11 MONTHS                  | globe   | a trail of tiny footprints from Italy to Australia
// 48.6–55.6  reefA/B +1 YEAR · LOW TIDE          | reef    | a walking shark climbs out of a tide pool; the sneakers hop onto three of its four fins
// 55.6–65.6  final                               | reef    | it struts at us in three sneakers past reef walkers filming it; "tralalero… tralala?" Card 61.4
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, HIP_H } from '@engine/rig.js';
import { makePhone, makeSpeechBubble, makeBanana } from '@engine/props.js';
import { makeSpritePool } from '@engine/sets/tech.js';
import { buildBeach, buildReef } from '@engine/sets/beach.js';
import { buildMemeHall } from '@engine/sets/memehall.js';
import { buildPool, DIMS as PD } from '@engine/sets/pool.js';
import { buildShoeStore } from '@engine/sets/shoestore.js';
import { buildOpenOffice, DIMS as OD } from '@engine/sets/openoffice.js';
import { buildAquarium } from '@engine/sets/aquarium.js';
import { makeGlobe, latLonToVec, faceLon } from '@engine/globe.js';
import { makeSneaker, sneakerGeometry, makeTralalero, makeCroc, makeCrocPlane, makeWalkingShark, makeReefShark, makeLog, poseLog, makeBallerina, makeChimpBanana, googly } from '@engine/brainrot.js';

const PI = Math.PI;
const OFF = { beach: [0, 0, 0], hall: [3000, 0, 0], pool: [-3000, 0, 0], shoe: [6000, 0, 0], office: [-6000, 0, 0], aqua: [9000, 0, 0], globe: [-9000, 0, 0], reef: [12000, 0, 0] };

// ---------------------------------------------------------------- choreography numbers (make_cues.py reads this table)
export const TIMES = {
  SAY1: 3.42, LEAP: 4.12, POOF: 4.6,
  H_GOLD: 8.35, H_T0: 8.6, H_DT: 0.62, H_FALL: 0.5,
  P_POOF: 14.15, P_SPLASH: 15.95,
  S_SIGN1: 19.55, S_SIGN2: 20.2, S_SIGN3: 20.85, S_BULGE: 22.0, S_BURST: 22.55,
  F_SAY: 25.0, F_LEGS: 27.25, F_ROW: 0.22, F_DEFLATE: 28.25,
  O_POP1: 30.35, O_FAIL1: 31.25, O_POP2: 31.65, O_FAIL2: 32.45, O_POP3: 33.15, O_TIP: 34.25, O_BOOM: 34.6,
  W_CRAB: 36.4, W_TWITCH: 37.6, W_GO: 38.35,
  A_SINK: 41.0, A_LAND: 42.25, A_HOP: 44.05, A_SLIP: 44.4,
  G0: 45.8, G1: 48.6,
  R_CLIMB: 50.0, R_HOP1: 52.6, R_HOP2: 52.95, R_HOP3: 53.3, R_GOLD: 53.55,
  Z_PHONES: 56.7, Z_SAY: 57.8, Z_POSE: 59.3, CARD: 61.4, END: 65.6,
};
const T = TIMES;

export const SHOTS = [
  { t0: 0, t1: 5.4, cam: 'beachA', set: 'beach' },
  { t0: 5.4, t1: 8.0, cam: 'beachB', set: 'beach' },
  { t0: 8.0, t1: 11.85, cam: 'hallA', set: 'hall' },
  { t0: 11.85, t1: 13.4, cam: 'hallB', set: 'hall' },
  { t0: 13.4, t1: 16.3, cam: 'poolA', set: 'pool' },
  { t0: 16.3, t1: 19.0, cam: 'poolB', set: 'pool' },
  { t0: 19.0, t1: 21.6, cam: 'shoeA', set: 'shoe' },
  { t0: 21.6, t1: 24.4, cam: 'shoeB', set: 'shoe' },
  { t0: 24.4, t1: 27.0, cam: 'festA', set: 'beach' },
  { t0: 27.0, t1: 29.8, cam: 'festB', set: 'beach' },
  { t0: 29.8, t1: 35.0, cam: 'officeA', set: 'office' },
  { t0: 35.0, t1: 35.8, cam: 'officeB', set: 'office' },
  { t0: 35.8, t1: 38.35, cam: 'walkA', set: 'beach' },
  { t0: 38.35, t1: 40.8, cam: 'walkB', set: 'beach' },
  { t0: 40.8, t1: 43.4, cam: 'aquaA', set: 'aqua' },
  { t0: 43.4, t1: 45.8, cam: 'aquaB', set: 'aqua' },
  { t0: 45.8, t1: 48.6, cam: 'globe', set: 'globe' },
  { t0: 48.6, t1: 52.2, cam: 'reefA', set: 'reef' },
  { t0: 52.2, t1: 55.6, cam: 'reefB', set: 'reef' },
  { t0: 55.6, t1: 65.6, cam: 'final', set: 'reef' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- blocking
// beach (open): he struts −x along the wet sand at z = 1.3, leaps at LEAP, poofs at the apex
const TRAL_Z = 1.3, tralX = (t) => 5.2 - 1.3 * Math.min(t, T.LEAP);
const BLAST = [tralX(T.LEAP) - 0.25, 2.25, TRAL_Z];
const BEACHERS = [[1.3, 2.35], [2.5, 2.9], [3.6, 3.3], [4.4, 2.6], [2.9, 3.45], [5.6, 3.25]];
const BEACH_KIDS = [[1.9, 2.0], [3.2, 2.2]];
const SUNBATH = [[2.95, 4.3], [4.05, 4.3], [6.45, 4.3], [7.55, 4.3]];
// hall: a diagonal row of five pedestals; each falls along U toward the camera
const U = [0.605, 0.796], NRM = [-0.796, 0.605];
const PED = [0, 1, 2, 3, 4].map((i) => [-2.4 + i * 0.95, -6.0 + i * 1.25]), PED_H = 0.9;
const VIS = [[-1.75, -2.55], [-1.15, -2.05], [-0.65, -1.6], [-1.45, -1.5]], VIS_KID = [-1.0, -2.6];
const pedT = (i) => T.H_T0 + i * T.H_DT;
// pool: the bomber crosses at 12 m/s, 16.7 m up; the crocodile keeps some speed as it falls (cartoon drag)
const PLANE_Y = 16.7, PLANE_Z = -3.0, planeX = (t) => -14 + 12 * (t - 13.4);
const crocFall = (u) => ({ x: planeX(T.P_POOF) + 6 * (1 - Math.exp(-2 * u)), y: PLANE_Y - 0.8 - 4.9 * u * u, z: PLANE_Z + 0.3 * u });
const SPLASH = [planeX(T.P_POOF) + 6 * (1 - Math.exp(-2 * (T.P_SPLASH - T.P_POOF))), PD.water, PLANE_Z + 0.3 * (T.P_SPLASH - T.P_POOF)];
const SWIM = [[-3.2, 0.8], [-1.2, -2.2], [0.6, 1.6], [2.8, -0.8], [-4.6, -1.8], [4.4, 1.2], [-0.4, -4.2], [2.2, -4.4]];
// shoe store: the clerk, the tumbleweed path, the avalanche mound
const CLERK = [0.55, -0.7];
// fest: 14 fans in three rows facing −x (the camera), the stage + balloon behind them
const FANS = [];
// a chorus line of 12 along z, facing −x; the poof runs down the line from the far end toward the camera
for (let k = 0; k < 12; k++) FANS.push({ x: 34.0 + 0.06 * Math.sin(k * 2.3), z: 4.8 + k * 0.75, i: k, t0: T.F_LEGS + (11 - k) * 0.09 });
// office: the meme machine screen on the window wall + a table in front of it
const TABLE = [0.35, -4.15], SCREEN = [0, 1.98, -4.92];
// walk: where the sneakers came to rest (filled at build from the drop), their walk along the shore
// aquarium: kids at the glass
const AQ_KIDS = [[-1.1, 0.33], [-0.55, 0.3], [0.0, 0.32], [0.55, 0.3], [1.1, 0.34]], AQ_ADULTS = [[-0.8, 0.95], [0.9, 1.0]];
// reef
const REEF_IN = [-3.0, 1.65], REEF_STOP = [-0.75, 1.62], SHARK_OUT = [0.15, 1.55];
const TOURISTS = [[-0.7, -2.6], [0.55, -2.2], [-0.9, -1.3], [0.8, -1.0], [-0.15, -3.2]], TOUR_KIDS = [[0.3, -1.85], [-0.4, -2.3]];
const FIN_A = [-0.7, -1.6], FIN_B = [0.05, -0.2];

// camera coords are LOCAL to the shot's set. p/a = [start, end]; fn(t) overrides.
export const CAMS = {
  beachA: { fn: (t) => { const k = K(t, [[0, 0], [5.4, 1]]), up = K(t, [[4.0, 0], [4.6, 1]]); return { p: [lerp(-3.6, -3.3, k), lerp(1.05, 1.08, k), lerp(-1.0, -0.85, k)], a: [lerp(5.2, 4.0, k), lerp(1.75, 1.85, k) + 0.9 * up, lerp(3.68, 3.2, k)] }; }, fov: 46, amp: 0.004 },
  beachB: { p: [[-0.55, 0.9, -1.75], [-0.5, 0.95, -2.0]], a: [[-0.3, 0.05, 4.0], [-0.1, 1.15, 6.0]], fov: 54, amp: 0.005 },
  hallA: { fn: (t) => { const f = clamp((t - T.H_T0 + 0.2) / (4 * T.H_DT + 0.7)) * 4, i = Math.min(3, Math.floor(f)), k = f - i; const ax = lerp(PED[i][0], PED[i + 1][0], k) + U[0] * 0.5, az = lerp(PED[i][1], PED[i + 1][1], k) + U[1] * 0.5; return { p: [lerp(4.4, 4.0, clamp((t - 8) / 3.8)), 1.75, lerp(-6.3, -5.6, clamp((t - 8) / 3.8))], a: [ax, 1.15, az] }; }, fov: 50, amp: 0.004 },
  hallB: { p: [[1.72, 1.35, -4.23], [1.82, 1.3, -4.4]], a: [[-6.26, 1.09, 1.79], [-6.26, 1.09, 1.79]], fov: 54, amp: 0.005 },
  poolA: { fn: (t) => { const u = Math.max(0, t - T.P_POOF), c = crocFall(Math.min(u, T.P_SPLASH - T.P_POOF)), k = K(t, [[T.P_POOF, 0], [T.P_POOF + 0.35, 1]]), w = K(t, [[T.P_SPLASH - 0.2, 0], [T.P_SPLASH + 0.2, 1]]); const pl = [planeX(t), PLANE_Y - 0.6, PLANE_Z]; const a = [lerp(pl[0], c.x, k), lerp(pl[1], c.y - 0.4, k), lerp(pl[2], c.z, k)]; return { p: [0.8, 1.1, 7.6], a: [lerp(a[0], SPLASH[0], w), lerp(a[1], 1.0, w), lerp(a[2], SPLASH[2], w)] }; }, fov: 56, amp: 0.004 },
  poolB: { p: [[2.4, 1.1, 3.6], [2.2, 1.05, 3.2]], a: [[0.4, 0.35, -3.4], [0.4, 0.35, -3.4]], fov: 54, amp: 0.004 },
  shoeA: { p: [[1.3, 1.5, 3.6], [1.15, 1.45, 3.05]], a: [[-0.78, 1.24, -6.18], [-0.78, 1.2, -6.18]], fov: 54, amp: 0.004 },
  shoeB: { p: [[-2.0, 1.3, 2.6], [-2.1, 1.25, 2.95]], a: [[2.2, 1.0, -5.5], [2.1, 0.9, -5.5]], fov: 56, amp: 0.005 },
  festA: { p: [[34.5, 1.3, 0.2], [34.62, 1.18, 2.1]], a: [[33.95, 1.05, 9.0], [33.95, 1.0, 9.0]], fov: 48, amp: 0.004 },
  festB: { p: [[21.0, 2.8, 8.9], [20.4, 3.2, 8.9]], a: [[36.0, 3.6, 8.9], [36.0, 3.3, 8.9]], fov: 60, amp: 0.005 },
  officeA: { p: [[1.6, 1.8, -0.6], [1.5, 1.75, -0.9]], a: [[-2.13, 0.84, -9.83], [-2.13, 0.84, -9.83]], fov: 54, amp: 0.004 },
  officeB: { p: [[-0.4, 1.3, -4.6], [-0.45, 1.25, -4.7]], a: [[5.61, 0.86, 3.38], [5.61, 0.86, 3.38]], fov: 54, amp: 0.006 },
  walkA: { p: [[-2.3, 0.42, 4.3], [-2.15, 0.4, 4.05]], a: [[2.94, 0.45, -5.31], [2.94, 0.45, -5.31]], fov: 42, amp: 0.003 },
  walkB: { p: [[-3.9, 0.32, 2.0], [-3.95, 0.33, 2.05]], a: [[-0.2, 0.18, 1.0], [-0.6, 0.16, 1.0]], fov: 46, amp: 0.003 },
  aquaA: { p: [[0.4, 1.3, -5.4], [0.35, 1.28, -5.0]], a: [[-0.47, 1.91, 4.54], [-0.47, 1.85, 4.54]], fov: 50, amp: 0.004 },
  aquaB: { p: [[-1.6, 0.55, -4.6], [-1.5, 0.58, -4.4]], a: [[1.96, 1.68, 4.68], [1.96, 1.68, 4.68]], fov: 54, amp: 0.004 },
  globe: { p: [[0, 0.1, 4.4], [0, 0.05, 4.1]], a: [[0, 0, 0], [0, 0, 0]], fov: 42, amp: 0.002 },
  reefA: { p: [[-0.25, 0.75, 5.0], [-0.2, 0.7, 4.7]], a: [[-0.42, 0.23, -4.98], [-0.42, 0.23, -4.98]], fov: 46, amp: 0.003 },
  reefB: { p: [[-0.28, 0.45, 3.9], [-0.26, 0.44, 3.75]], a: [[0.07, 0.36, -6.09], [0.07, 0.36, -6.09]], fov: 50, amp: 0.003 },
  final: { p: [[0.6, 0.7, 3.3], [0.5, 0.66, 3.0]], a: [[-0.79, 0.7, -6.6], [-0.79, 0.72, -6.6]], fov: 50, amp: 0.004 },
};

// ---------------------------------------------------------------- arm library (rig: sx<0 forward, sz>0 out, el<0 bend)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const UP_A = A(-2.8, 0.35, -0.35), UP_B = A(-2.8, 0.35, -0.35);
const FILM_A = A(-1.45, 0.12, -0.6, 0.25), FILM_B = A(-1.45, 0.12, -0.6, -0.25);
const TADA_A = A(-0.35, 1.35, -0.25), TADA_B = A(-0.35, 1.35, -0.25);
const TYPE_A = A(-0.95, 0.12, -1.25, 0.35), TYPE_B = A(-0.95, 0.12, -1.25, -0.35);
const SIGN_A = A(-0.85, 0.12, -1.3, 0.45), SIGN_B = A(-0.85, 0.12, -1.3, -0.45);
const HEADC_A = A(-1.6, 0.5, -1.9, 0.6), HEADC_B = A(-1.6, 0.5, -1.9, -0.6);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const flail = (t, s) => A(-2.3 + 0.55 * Math.sin(t * 13 + s), 0.6 + 0.3 * Math.sin(t * 11 + s * 2), -0.5);
const seatY = (top) => -0.375 + (top - 0.42);

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8, 0x58b368, 0xa77bd1];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a, 0x3a4a3a, 0xe8dcc4, 0x5a7a9a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const KS = 0.62;

function fitText(g, text, maxW, size, font = 'Helvetica, Arial, sans-serif', weight = 'bold') {
  let s = size; g.font = `${weight} ${s}px ${font}`;
  while (g.measureText(text).width > maxW && s > 10) { s -= 2; g.font = `${weight} ${s}px ${font}`; }
  return s;
}
const _V = new THREE.Vector3(), _W = new THREE.Vector3(), _Q = new THREE.Quaternion(), _E = new THREE.Euler(), _S = new THREE.Vector3(), _M = new THREE.Matrix4(), UPV = new THREE.Vector3(0, 1, 0);

// ---------------------------------------------------------------- build
export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets
  const beach = buildBeach(studio, {}); beach.root.position.set(...OFF.beach);
  const hall = buildMemeHall(studio, { ropes: [0, 1, 2, 3, 4].map((i) => [PED[i][0] + NRM[0] * 0.95 + U[0] * 0.2, PED[i][1] + NRM[1] * 0.95 + U[1] * 0.2]) }); hall.root.position.set(...OFF.hall);
  const pool = buildPool(studio, {}); pool.root.position.set(...OFF.pool);
  const shoe = buildShoeStore(studio, {}); shoe.root.position.set(...OFF.shoe);
  const office = buildOpenOffice(studio, { board: 'NEW TRALALERO ???', boardLines: ['• shark + crocs?', '• tuna on skates??', '• fridge???'] }); office.root.position.set(...OFF.office);
  const aqua = buildAquarium(studio, {}); aqua.root.position.set(...OFF.aqua);
  const reef = buildReef(studio, {}); reef.root.position.set(...OFF.reef);
  const globeRoot = new THREE.Group(); globeRoot.position.set(...OFF.globe); scene.add(globeRoot);
  const ROOTS = { beach: beach.root, hall: hall.root, pool: pool.root, shoe: shoe.root, office: office.root, aqua: aqua.root, globe: globeRoot, reef: reef.root };
  const FOGS = { beach: beach.fog, hall: null, pool: pool.fog, shoe: null, office: null, aqua: aqua.fog, globe: null, reef: reef.fog };
  const FAR = { beach: 800, hall: 40, pool: 320, shoe: 40, office: 40, aqua: 40, globe: 60, reef: 800 };
  const L = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- cast (one pool of people, dressed per place)
  const R = rng(61);
  const person = (o) => { const p = makePerson(o); scene.add(p.root); p.root.rotation.order = 'YXZ'; return p; };
  const adults = Array.from({ length: 16 }, (_, i) => {
    const style = STYLES[(i * 3 + 1) % STYLES.length];
    const p = person({ skin: SKINS[i % SKINS.length], top: TOPS[i % TOPS.length], collar: 0xf4f1ea, pants: PANTS[(i * 5) % PANTS.length], shoes: 0x3a2e2a,
      hair: HAIRS[(i * 7) % HAIRS.length], hairStyle: style, glasses: i % 5 === 2, mustache: style === 'short' && i % 4 === 1 ? HAIRS[(i * 3) % 3] : null });
    p.base = TOPS[i % TOPS.length]; p.basePants = p.mats.pants.color.getHex(); return p;
  });
  const kids = Array.from({ length: 6 }, (_, i) => {
    const p = person({ skin: SKINS[(i * 3 + 2) % SKINS.length], top: TOPS[(i * 5 + 1) % TOPS.length], collar: TOPS[(i * 5 + 4) % TOPS.length], pants: PANTS[i % PANTS.length], hair: HAIRS[(i * 2) % 5], hairStyle: ['messy', 'bob', 'short', 'bob', 'messy', 'short'][i % 6], headR: 0.175 });
    p.root.scale.setScalar(KS); p.base = TOPS[(i * 5 + 1) % TOPS.length]; p.basePants = p.mats.pants.color.getHex(); return p;
  });
  const clerk = person({ skin: 0xd9a37f, top: 0x2f6fd8, collar: 0xf4f1ea, pants: 0x2a2a30, hair: 0x2a1d16, hairStyle: 'messy', glasses: true });
  const ALL = [...adults, ...kids, clerk];
  const outfit = (rig, top, pants) => { rig.mats.top.color.setHex(top); if (pants !== undefined) rig.mats.pants.color.setHex(pants); };
  // shark hoods for the fan club (on adults 0–13), straw hats for the reef walkers (adults 0–4 + kids 0–1)
  const hoods = adults.slice(0, 14).map((rig) => {
    const h = new THREE.Group(); rig.head.g.add(h); h.visible = false;
    const blue = mat(0x6f97b8, 0.6);
    const shell = mk(new THREE.SphereGeometry(0.165, 20, 14, 0, PI * 2, 0, PI * 0.6), blue, h, 0, 0.0, -0.03); shell.scale.set(1.08, 1.12, 1.15); shell.material.side = THREE.DoubleSide;
    const fin = mk(new THREE.ConeGeometry(0.06, 0.16, 4), blue, h, 0, 0.19, -0.06); fin.scale.set(0.25, 1, 1.1); fin.rotation.x = -0.3;
    for (let k = 0; k < 7; k++) { const tt = mk(new THREE.ConeGeometry(0.014, 0.035, 4), mat(0xffffff, 0.4), h, -0.09 + k * 0.03, 0.105 - Math.abs(k - 3) * 0.008, 0.125 - Math.abs(k - 3) * 0.012); tt.rotation.x = PI; }
    for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.028, 10, 8), mat(0xffffff, 0.3), h, s * 0.07, 0.16, 0.085); mk(new THREE.SphereGeometry(0.014, 8, 6), mat(0x15161a, 0.3), h, s * 0.07, 0.165, 0.108); }
    return h;
  });
  const hatOf = (rig, c) => { const h = new THREE.Group(); rig.head.g.add(h); h.visible = false; h.position.y = 0.1; mk(new THREE.CylinderGeometry(0.26, 0.26, 0.012, 22), mat(c, 0.85), h); mk(new THREE.CylinderGeometry(0.11, 0.13, 0.1, 18), mat(c, 0.85), h, 0, 0.05, 0); mk(new THREE.CylinderGeometry(0.132, 0.132, 0.025, 18), mat(0xd2483f, 0.7), h, 0, 0.02, 0); return h; };
  const hats = [...adults.slice(0, 5), kids[0], kids[1]].map((r, i) => hatOf(r, [0xe8d49a, 0xf4efe4, 0xe2c27a, 0xf4efe4, 0xe8d49a, 0xf2c14e, 0xf4efe4][i]));
  // third legs: a blue costume leg from the pelvis back to a sneaker on the sand
  const thirdLegs = FANS.map(() => { const g = new THREE.Group(); scene.add(g); const leg = mk(new THREE.CylinderGeometry(0.075, 0.08, 1, 12), mat(0x5f8ab0, 0.55), g, 0, 0.5, 0); const sn = makeSneaker({ scale: 0.95 }); scene.add(sn); return { g, leg, sn }; });

  // ---------------------------------------------------------------- brainrot cast
  const tral = makeTralalero(); scene.add(tral.g);
  const looseShoes = [0, 1, 2].map(() => { const s = makeSneaker(); scene.add(s); return s; });
  const goldM = mat(0xd9a93a, 0.32, { metalness: 0.65 });
  const goldTral = makeTralalero(); goldTral.g.traverse((o) => { if (o.isMesh) o.material = goldM; }); scene.add(goldTral.g);
  const balloon = makeTralalero(); scene.add(balloon.g);
  { const vinyl = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.18, metalness: 0.05 }); const top = vinyl(0x6f97b8), bel = vinyl(0xf1f4f6); balloon.g.traverse((o) => { if (o.isMesh && o.material === balloon.mats.top) o.material = top; else if (o.isMesh && o.material === balloon.mats.belly) o.material = bel; }); }
  const tethers = [0, 1, 2].map(() => mk(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), mat(0xf4efe4, 0.6), scene));
  const plane = makeCrocPlane(); scene.add(plane.g);
  const fallCroc = makeCroc(); scene.add(fallCroc.g);
  const statPlane = makeCrocPlane(); scene.add(statPlane.g);
  mk(new THREE.CylinderGeometry(0.12, 0.25, 2.3, 10), mat(0xd9a93a, 0.32, { metalness: 0.65 }), statPlane.g, 0, -1.6, -0.3);
  const bal = makeBallerina(); scene.add(bal.root); bal.root.rotation.order = 'YXZ';
  const log = makeLog(); scene.add(log.g);
  const chimp = makeChimpBanana(); scene.add(chimp.g);
  // the ordinary things they turn back into
  const toyPlane = new THREE.Group(); scene.add(toyPlane);
  { const tp = makeCrocPlane(); tp.croc.g.visible = false; tp.nose.visible = true; tp.g.scale.setScalar(0.11); toyPlane.add(tp.g); }
  const cup = new THREE.Group(); scene.add(cup);
  { mk(new THREE.CylinderGeometry(0.13, 0.095, 0.18, 22), mat(0xfbfaf6, 0.25), cup, 0, 0.12, 0); mk(new THREE.CylinderGeometry(0.2, 0.17, 0.02, 24), mat(0xfbfaf6, 0.25), cup, 0, 0.012, 0); mk(new THREE.TorusGeometry(0.05, 0.016, 8, 14), mat(0xfbfaf6, 0.25), cup, 0.145, 0.13, 0);
    mk(new THREE.CircleGeometry(0.12, 22), mat(0xe8c89a, 0.7), cup, 0, 0.205, 0).rotation.x = -PI / 2; }
  const plainLog = new THREE.Group(); scene.add(plainLog);
  { const m = mk(new THREE.CylinderGeometry(0.17, 0.18, 0.8, 18), mat(0x8a5a32, 0.85), plainLog, 0, 0, 0); m.rotation.z = PI / 2; for (const s of [-1, 1]) { const c = mk(new THREE.CircleGeometry(0.17, 18), mat(0xe2b98a, 0.8), plainLog, s * 0.401, 0, 0); c.rotation.y = s * PI / 2; } }
  const fruit = makeBanana(); fruit.g.scale.setScalar(2.6); scene.add(fruit.g);
  const ORD = [null, toyPlane, cup, plainLog, fruit.g];
  // pool: the crocodile's donut float
  const donut = mk(new THREE.TorusGeometry(0.42, 0.17, 12, 26), mat(0xf28ab0, 0.35), scene); donut.rotation.x = PI / 2;
  // shoe store: shelf walls (3 sneakers per slot), the avalanche, the clerk's price card, a tumbleweed
  const snGeo = sneakerGeometry(), snMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 });
  const wall = new THREE.InstancedMesh(snGeo, snMat, shoe.slots.length * 3); wall.castShadow = true; scene.add(wall);
  shoe.slots.forEach((s, i) => { for (let k = 0; k < 3; k++) { const off = (k - 1) * 0.165; wall.setMatrixAt(i * 3 + k, _M.compose(L('shoe', s.x, s.y, s.z + off), _Q.setFromEuler(_E.set(0, s.ry, 0)), _S.setScalar(0.92))); } });
  wall.instanceMatrix.needsUpdate = true;
  const NAV = 1400, AV = [];
  { const RR = rng(5); for (let i = 0; i < NAV; i++) {
      const order = i / NAV, x = lerp(-3.3, 3.4, RR()), z = lerp(-5.6, 2.4, Math.pow(RR(), 0.85)), d2 = ((x - 1.0) ** 2) / 7 + ((z + 2.6) ** 2) / 11;
      const top = 1.55 * Math.exp(-d2) * Math.sqrt(order + 0.05) + 0.06;
      const t0 = T.S_BURST + 0.05 + 1.05 * Math.pow(order, 0.9), dur = 0.42 + RR() * 0.38;
      AV.push({ t0, dur, p0: [2.3 + (RR() - 0.5) * 1.0, 0.6 + RR() * 1.4, -5.7], p1: [x, top * (0.75 + 0.25 * RR()), z], rot: [RR() * 6, RR() * 6, RR() * 6], spin: [(RR() - 0.5) * 16, (RR() - 0.5) * 12, (RR() - 0.5) * 16] });
    } }
  const aval = new THREE.InstancedMesh(snGeo, snMat, NAV); aval.castShadow = true; aval.frustumCulled = false; scene.add(aval);
  const cardC = document.createElement('canvas'); cardC.width = 512; cardC.height = 360; const cardT = new THREE.CanvasTexture(cardC); cardT.colorSpace = THREE.SRGBColorSpace;
  const priceCard = new THREE.Group(); scene.add(priceCard);
  { const m = mk(new THREE.PlaneGeometry(0.62, 0.44), new THREE.MeshStandardMaterial({ map: cardT, roughness: 0.6, side: THREE.DoubleSide }), priceCard, 0, 0, 0); m.castShadow = false; }
  let cardTxt = '';
  function drawCard(txt) {
    if (txt === cardTxt) return; cardTxt = txt;
    const g = cardC.getContext('2d'), w = 512, h = 360; g.fillStyle = '#fff8e2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d2483f'; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#d2483f'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, txt, w - 70, 170, 'Arial Black, Helvetica, sans-serif', '900'); g.fillText(txt, w / 2, h / 2 + 6); cardT.needsUpdate = true;
  }
  shoe.setPoster((g, w, h) => {
    g.fillStyle = '#2f6fd8'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, 'THE TRIPLE', w - 120, 170, 'Arial Black, Helvetica, sans-serif', '900'); g.fillText('THE TRIPLE', w / 2, 170);
    // three sneaker silhouettes
    for (let k = 0; k < 3; k++) { const cx = 230 + k * 280, cy = 600; g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(cx - 120, cy - 30, 240, 90, 40); g.fill(); g.beginPath(); g.roundRect(cx - 120, cy - 120, 150, 120, 50); g.fill(); g.fillStyle = '#1f4f9e'; g.fillRect(cx - 120, cy + 30, 240, 18); }
    g.fillStyle = '#f2c14e'; fitText(g, 'SOLD IN 3s', w - 120, 150, 'Arial Black, Helvetica, sans-serif', '900'); g.fillText('SOLD IN 3s', w / 2, 930);
    g.fillStyle = '#ffffff'; fitText(g, 'ONE FOR EACH LEG', w - 140, 70); g.fillText('ONE FOR EACH LEG', w / 2, 1090);
  });
  const weed = new THREE.Group(); scene.add(weed);
  { const wm = mat(0xa8865a, 0.9); for (let k = 0; k < 16; k++) { const tr = mk(new THREE.TorusGeometry(0.2 + (k % 3) * 0.03, 0.008, 4, 18), wm, weed); tr.rotation.set(k * 0.7, k * 1.3, k * 0.4); } }
  // office: the meme machine screen, a table, the three replacements (+ name cards)
  const scrC = document.createElement('canvas'); scrC.width = 1024; scrC.height = 576; const scrT = new THREE.CanvasTexture(scrC); scrT.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Group(); office.root.add(screen); screen.position.set(...SCREEN);
  { mk(new THREE.BoxGeometry(2.02, 1.18, 0.08), mat(0x1a1c22, 0.4), screen, 0, 0, -0.03); const s = mk(new THREE.PlaneGeometry(1.9, 1.07), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false }), screen, 0, 0, 0.015); s.castShadow = false; }
  let scrKey = '';
  function drawScreen(mode, k = 0) {
    const key = mode + Math.round(k * 20); if (key === scrKey) return; scrKey = key;
    const g = scrC.getContext('2d'), w = 1024, h = 576;
    if (mode === 'error') { g.fillStyle = '#1a0a0e'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff4a5a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'ERROR', w - 200, 230, 'Arial Black, Helvetica, sans-serif', '900'); g.fillText('ERROR', w / 2, h / 2 - 30); g.fillStyle = '#ffd0d6'; fitText(g, 'NO MORE IDEAS', w - 300, 70); g.fillText('NO MORE IDEAS', w / 2, h / 2 + 130); scrT.needsUpdate = true; return; }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a2a7a'); gr.addColorStop(1, '#1a3a7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // v1.1: all the text sits in the top half (the new characters stand in front of the lower half)
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'MEME MACHINE 3000', w - 120, 104, 'Arial Black, Helvetica, sans-serif', '900'); g.fillText('MEME MACHINE 3000', w / 2, 88);
    g.fillStyle = '#ffd23a'; fitText(g, 'GENERATING NEW TRALALERO…', w - 140, 58); g.fillText('GENERATING NEW TRALALERO…', w / 2, 188);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(160, 248, w - 320, 46); g.fillStyle = '#7dff9a'; g.fillRect(160, 248, (w - 320) * k, 46);
    scrT.needsUpdate = true;
  }
  const officeTable = new THREE.Group(); office.root.add(officeTable); officeTable.position.set(TABLE[0], 0, TABLE[1]);
  { mk(new THREE.BoxGeometry(1.9, 0.05, 0.7), mat(0xe8e1d4, 0.5), officeTable, 0, 0.74, 0); for (const sx of [-0.88, 0.88]) for (const sz of [-0.3, 0.3]) mk(new THREE.BoxGeometry(0.04, 0.72, 0.04), mat(0x3a3d42, 0.4), officeTable, sx, 0.36, sz); }
  const sharkino = makeTralalero(); scene.add(sharkino.g); sharkino.legs[2].hip.visible = false;
  sharkino.shoes.forEach((s) => (s.visible = false));
  for (let i = 0; i < 2; i++) { const c = mk(new RoundedBoxGeometry(0.16, 0.12, 0.3, 2, 0.05), mat(0xf28a2a, 0.5), sharkino.legs[i].knee, 0, -0.42, 0.04); for (let k = 0; k < 4; k++) mk(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), mat(0xd96a1a, 0.6), c, -0.04 + (k % 2) * 0.08, 0.06, -0.06 + Math.floor(k / 2) * 0.1).rotation.x = PI / 2; }
  const tuna = new THREE.Group(); scene.add(tuna);
  { const body = new THREE.Group(); body.position.y = 0.38; tuna.add(body); tuna.userData.body = body;
    const b = mk(new THREE.SphereGeometry(0.22, 20, 14), mat(0x4a6a9a, 0.35, { metalness: 0.3 }), body); b.scale.set(0.75, 0.85, 1.8);
    mk(new THREE.SphereGeometry(0.2, 18, 12), mat(0xdfe6ee, 0.35, { metalness: 0.2 }), body, 0, -0.06, 0.02).scale.set(0.7, 0.6, 1.7);
    const tl = mk(new THREE.ConeGeometry(0.16, 0.3, 4), mat(0x3a5a8a, 0.4), body, 0, 0, -0.48); tl.scale.set(0.2, 1, 1); tl.rotation.x = -PI / 2;
    for (const y of [0.16, -0.16]) { const f = mk(new THREE.ConeGeometry(0.12, 0.26, 4), mat(0xf2c14e, 0.5), body, 0, y, -0.52); f.scale.set(0.15, 1, 0.6); f.rotation.x = y > 0 ? 0.9 : PI - 0.9; }
    googly(body, -0.09, 0.07, 0.3, 0.045); googly(body, 0.09, 0.07, 0.3, 0.045, -0.5);
    for (const s of [-1, 1]) { const sk = new THREE.Group(); sk.position.set(s * 0.1, 0.0, 0); tuna.add(sk); mk(new RoundedBoxGeometry(0.12, 0.16, 0.24, 2, 0.04), mat(0xf4f4f2, 0.5), sk, 0, 0.16, 0); mk(new THREE.BoxGeometry(0.1, 0.02, 0.26), mat(0x9a9ca2, 0.4), sk, 0, 0.07, 0); for (const z of [-0.09, -0.03, 0.03, 0.09]) mk(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), mat(0xe2574c, 0.4), sk, 0, 0.035, z).rotation.z = PI / 2; } }
  const fridge = new THREE.Group(); scene.add(fridge);
  { const body = new THREE.Group(); body.position.y = 0.32; fridge.add(body); fridge.userData.body = body;
    mk(new RoundedBoxGeometry(0.62, 1.15, 0.58, 3, 0.06), mat(0xf4f4f2, 0.3), body, 0, 0.58, 0); mk(new THREE.BoxGeometry(0.6, 0.012, 0.012), mat(0x9a9ca2, 0.4), body, 0, 0.78, 0.295);
    mk(new THREE.BoxGeometry(0.03, 0.3, 0.04), mat(0x9a9ca2, 0.4, { metalness: 0.6 }), body, 0.25, 0.98, 0.31); mk(new THREE.BoxGeometry(0.03, 0.22, 0.04), mat(0x9a9ca2, 0.4, { metalness: 0.6 }), body, 0.25, 0.55, 0.31);
    googly(body, -0.12, 1.0, 0.3, 0.07); googly(body, 0.08, 1.0, 0.3, 0.07, 0.6);
    mk(new THREE.BoxGeometry(0.2, 0.025, 0.02), mat(0x3a1a12, 0.6), body, -0.02, 0.86, 0.3);
    for (const [x, z] of [[-0.2, 0.18], [0.2, 0.18], [0, -0.2]]) { mk(new THREE.CapsuleGeometry(0.04, 0.26, 4, 8), mat(0x6f97b8, 0.6), fridge, x, 0.17, z); const sn = makeSneaker({ scale: 0.7 }); sn.position.set(x, 0, z); fridge.add(sn); } }
  const INV = [sharkino.g, tuna, fridge];
  // sea creatures: a crab, the aquarium shark, the walking shark
  const crab = new THREE.Group(); scene.add(crab);
  { const cm = mat(0xe2574c, 0.5); mk(new THREE.SphereGeometry(0.09, 14, 10), cm, crab, 0, 0.07, 0).scale.set(1.3, 0.6, 1); for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.035, 8, 6), cm, crab, s * 0.13, 0.08, 0.06); for (let k = 0; k < 3; k++) mk(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 4), cm, crab, s * 0.1, 0.03, -0.04 + k * 0.04).rotation.z = s * 1.0; mk(new THREE.SphereGeometry(0.015, 6, 4), mat(0x15161a, 0.3), crab, s * 0.03, 0.13, 0.06); } }
  const reefShark = makeReefShark(); scene.add(reefShark.g);
  const walker = makeWalkingShark(); walker.g.scale.setScalar(1.25); scene.add(walker.g);
  // the globe insert: a toy Earth, a dotted trail Italy → Australia, three tiny sneakers at the head of the trail
  const globe = makeGlobe({ r: 0.82, ocean: '#2a74b8', land: '#7cc06a', border: 'rgba(255,255,255,.55)', grid: 'rgba(255,255,255,.12)', glow: 0.6, glowColor: 0x9fd8ff, emissive: 1.0 });
  globeRoot.add(globe.g);
  { const bg = mk(new THREE.SphereGeometry(30, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d1838'); gr.addColorStop(1, '#2a3a6a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) }), globeRoot); bg.castShadow = false;
    const RR = rng(4), pts = []; for (let i = 0; i < 500; i++) { const v = new THREE.Vector3(RR() - 0.5, RR() - 0.5, RR() - 0.5).normalize().multiplyScalar(25); pts.push(v.x, v.y, v.z); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); globeRoot.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.8 }))); }
  const ROUTE = [[41.9, 12.5], [37.5, 17], [33.5, 27], [31, 32.3], [21, 38], [12.6, 43.6], [9, 58], [5, 76], [1, 92], [-6, 104], [-8.8, 116], [-10.6, 129], [-13.5, 140], [-16.9, 145.8]];
  const routeAt = (u) => { const f = clamp(u) * (ROUTE.length - 1), i = Math.min(ROUTE.length - 2, Math.floor(f)), k = f - i; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], k), lerp(ROUTE[i][1], ROUTE[i + 1][1], k)]; };
  const NDOT = 160, dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.016, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1f4fbe }), NDOT); globe.spin.add(dots);
  const miniShoes = [0, 1, 2].map(() => { const s = makeSneaker({ scale: 0.36 }); globe.spin.add(s); return s; });
  // puffs (poofs, splashes, dust) + sparkles + fire for the machine
  const puffs = makeSpritePool(scene, 320, 'smoke'), sparks = makeSpritePool(scene, 90, 'fire'), fire = makeSpritePool(scene, 60, 'fire');
  const POOF_C = new THREE.Color(0xf6eefc), DUST_C = new THREE.Color(0xe8dccb), SPLASH_C = new THREE.Color(0xf2fbff), SMOKE_C = new THREE.Color(0x5a5458), GOLD = new THREE.Color(1.8, 1.4, 0.6), FLASH_C = new THREE.Color(2.2, 2.0, 1.6), BLUE_C = new THREE.Color(0.8, 1.3, 2.0);
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 48), new THREE.MeshBasicMaterial({ color: 0xfff4e0, transparent: true, depthWrite: false, side: THREE.DoubleSide })); shock.rotation.x = -PI / 2; scene.add(shock);
  const NDROP = 260, drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0xcfefff, roughness: 0.1, transparent: true, opacity: 0.85 }), NDROP); drops.frustumCulled = false; drops.castShadow = false; scene.add(drops);
  const boomLight = new THREE.PointLight(0xffa04a, 0, 12, 1.6); scene.add(boomLight);
  const phones = Array.from({ length: 10 }, () => { const p = makePhone(); scene.add(p.g); return p; });
  // comic speech bubbles (sized to the frame every frame — 016 say(); placed after setCamera)
  const B = (lines, accent, maxChars = 12, o = {}) => { const b = makeSpeechBubble({ lines, accent, maxChars, ...o }); scene.add(b.sprite); b.setRows(b.rows); b.setPop(0); return b; };
  const sayKid = B(['TRALALERO TRALALA!'], '#2f6fd8', 10), sayFans = B(['TRALALERO TRALALA!!'], '#f08a3a', 10), sayEnd = B(['tralalero… tralala?'], '#2f6fd8', 11, { soft: true });
  const names = [B(['SHARKINO CLOGSINI'], '#8f6fb8', 10), B(['TONNO ROLLERINI'], '#8f6fb8', 9), B(['FRIDGERINO FRIDGERÀ'], '#8f6fb8', 11)];
  const ALL_BUBBLES = [sayKid, sayFans, sayEnd, ...names];
  const headAt = (rig, lift) => { rig.root.updateMatrixWorld(true); return rig.head.g.getWorldPosition(new THREE.Vector3()).add(_V.set(0, lift, 0)); };
  const bubbleReq = [];
  const frameW = (d) => 2 * d * Math.tan((studio.camera.fov * PI) / 360) * (9 / 16);
  const popK = (t, t0) => K(t, [[t0, 0], [t0 + 0.16, 1.15], [t0 + 0.28, 1]]);
  let puffN = 0, sparkN = 0, fireN = 0, dropN = 0;
  function poof(t, t0, pos, s = 1, n = 8, dur = 0.9, col = POOF_C) {
    const age = t - t0; if (age < 0 || age > dur) return;
    const u = age / dur;
    for (let k = 0; k < n && puffN < puffs.items.length; k++) {
      const a = t0 * 5.1 + k * (2 * PI / n), r = (0.12 + 0.55 * Math.sqrt(u)) * s;
      puffs.set(puffN++, _V.set(pos.x + Math.cos(a) * r, pos.y + Math.sin(a * 1.7) * r * 0.6 + u * 0.25 * s, pos.z + Math.sin(a) * r * 0.5).clone(), (0.35 + 0.6 * Math.sqrt(u)) * s, 0.95 * (1 - u) ** 1.3, col);
    }
  }
  function sparkle(t, t0, pos, s = 1, n = 8, dur = 0.8, col = GOLD) {
    const age = t - t0; if (age < 0 || age > dur) return; const u = age / dur;
    for (let k = 0; k < n && sparkN < sparks.items.length; k++) { const a = k * 2.4 + t0, r = (0.3 + 0.9 * u) * s; sparks.set(sparkN++, _V.set(pos.x + Math.cos(a) * r, pos.y + Math.sin(a * 1.3) * r * 0.8 + 0.2 * u, pos.z + Math.sin(a) * r * 0.4).clone(), 0.12 * s * (1 - u), 0.9 * (1 - u), col); }
  }
  /** a cartoon splash: a white column of puffs + instanced drops in arcs (no liquid on anyone; it's a pool) */
  function splash(t, t0, pos, s = 1, n = 120) {
    const age = t - t0; if (age < 0 || age > 2.2) return;
    for (let k = 0; k < n && dropN < NDROP; k++) {
      const a = k * 2.399, v = s * (2.5 + ((k * 0.37) % 1) * 4.5), up = s * (5 + ((k * 0.61) % 1) * 6), u = age;
      const y = pos.y + up * u - 4.9 * u * u; if (y < pos.y - 0.1) continue;
      drops.setMatrixAt(dropN++, _M.compose(_V.set(pos.x + Math.cos(a) * v * u * 0.5, y, pos.z + Math.sin(a) * v * u * 0.5), _Q.identity(), _S.setScalar(s * (0.7 + (k % 3) * 0.3))));
    }
    if (age < 1.2) for (let k = 0; k < 10 && puffN < puffs.items.length; k++) { const a = k * 0.63, h = (k / 10) * 4.2 * s * Math.min(1, age / 0.25) * (1 - age / 1.2 * 0.4); puffs.set(puffN++, _V.set(pos.x + Math.cos(a) * 0.4 * s, pos.y + h, pos.z + Math.sin(a) * 0.3 * s).clone(), (0.9 + 0.5 * (k % 3)) * s, 0.9 * (1 - age / 1.2), SPLASH_C); }
  }
  /** a cartoon explosion (dh004 boom): additive fire that blooms in 0.45 s + dark smoke rising + one orange flash */
  let flash = 0;
  function boom(t, t0, pos, size = 1, n = 12) {
    const age = t - t0; if (age < 0 || age > 3.0) return;
    const grow = 1 - Math.pow(1 - Math.min(1, age / 0.45), 3);
    for (let k = 0; k < n; k++) {
      const a = k * 2.399 + t0 * 7, el = ((k * 0.618 + t0) % 1) * 2 - 1, r = Math.sqrt(1 - el * el), dx = Math.cos(a) * r, dy = Math.abs(el) * 0.8 + 0.2, dz = Math.sin(a) * r;
      if (age < 1.3 && fireN < fire.items.length) fire.set(fireN++, _V.set(pos.x + dx * size * 0.9 * grow, pos.y + dy * size * 0.7 * grow + age * 0.8 * size, pos.z + dz * size * 0.6 * grow).clone(), size * (0.7 + 0.9 * grow) * (1 - Math.max(0, age - 0.6) / 0.8), Math.max(0, 1 - age / 1.3));
      const sa = age - 0.12;
      if (sa > 0 && puffN < puffs.items.length) puffs.set(puffN++, _V.set(pos.x + dx * size * 1.1 * grow, pos.y + dy * size * 0.8 + sa * 1.1 * size, pos.z + dz * size * 0.8 * grow).clone(), size * (0.9 + sa * 1.0), 0.75 * Math.max(0, 1 - sa / 2.6), SMOKE_C);
    }
    const f = size * 3 * Math.exp(-age * 5); if (f > flash) { flash = f; boomLight.position.copy(pos); }
  }

  // ---------------------------------------------------------------- helpers
  function put(rig, key, p) {
    if (!p) { rig.root.visible = false; return; }
    applyPose(rig, { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2] });
    rig.root.position.y += OFF[key][1];
    rig.root.rotation.x = p.tip ?? 0;
    rig.root.visible = p.visible !== false;
  }
  /** a scaled rig (kids): ground + root height in LOCAL units (010 putG) */
  function putS(rig, key, p, s, rootY = null) {
    const q = { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2], dist: (p.dist || 0) / s, speed: (p.speed || 0) / s };
    if (rootY !== null) { q.floor = ((p.floor || 0) - rootY) / s; q.y = 0; }
    applyPose(rig, q); rig.root.visible = true;
    rig.root.position.y = rootY !== null ? rootY : (p.y || 0) * s;
    rig.root.rotation.x = p.tip ?? 0;
  }
  const placeG = (g, key, x, y, z, ry = 0) => { g.visible = true; g.position.copy(L(key, x, y, z)); g.rotation.set(0, ry, 0); };
  /** a phone in a hand, screen toward its holder (who faces yaw) and tilted back by `tilt` */
  function phoneIn(ph, rig, side, yaw, tilt = 0) { ph.g.visible = true; ph.g.position.copy(handWorld(rig, side)).add(_V.set(0, 0.06, 0)); ph.g.rotation.set(PI / 2 - tilt, yaw + PI, 0, 'YXZ'); }
  const say = (b, pos, k, frac) => bubbleReq.push([b, pos, k, frac]);
  /** a backward fall from the feet (rotation order YXZ): 0 standing → −1.48 on the back, with a small bounce */
  const fallBack = (t, t0, dur = 0.38) => { const u = clamp((t - t0) / dur); if (u <= 0) return 0; const b = t > t0 + dur ? 0.08 * Math.exp(-(t - t0 - dur) * 7) * Math.abs(Math.sin((t - t0 - dur) * 16)) : 0; return -1.48 * u * u + b; };

  // ---------------------------------------------------------------- performances (pure: f(t) → pose)
  /** Tralalero on the beach: strut, crouch, leap; returns {x, y (hop), z, ph, …} for tral.pose */
  function tralState(t) {
    const x = tralX(t), dist = 5.2 - x, ph = dist / 0.62 * 2 * PI;
    const crouch = K(t, [[T.LEAP - 0.14, 0], [T.LEAP, 1], [T.LEAP + 0.06, 0]]), u = clamp((t - T.LEAP) / (T.POOF - T.LEAP));
    const hop = t > T.LEAP ? 1.35 * (1 - (1 - u) ** 2) : -0.16 * crouch;
    const tuck = t > T.LEAP ? Math.min(1, u * 2.5) : crouch;
    return { x, z: TRAL_Z, hop, ph: t < T.LEAP ? ph : ph + 0.4, stride: t < T.LEAP ? 0.5 : 0.05, wave: 0.35 + 0.35 * Math.sin(t * 5), tuck, pitch: -0.06 - 0.25 * (t > T.LEAP ? u : 0), mouth: t > T.LEAP ? 'grin' : 'grin' };
  }
  function poseTral(t) {
    const s = tralState(t);
    tral.pose({ ph: s.ph, stride: s.stride, hop: s.hop, wave: s.wave, pitch: s.pitch, kneeX: [0.9 * s.tuck, 0.9 * s.tuck, 0.9 * s.tuck], legX: [-0.5 * s.tuck, -0.5 * s.tuck, 0.4 * s.tuck], mouth: s.mouth, look: Math.sin(t * 1.3) });
    tral.g.position.copy(L('beach', s.x, 0, s.z)); tral.g.rotation.set(0, -PI / 2 + 0.35 * Math.sin(t * 0.8) * (t < T.LEAP ? 1 : 0) + 0.25, 0);
    tral.g.updateMatrixWorld(true);
  }
  // the three sneakers' drop: start = where they were at the poof, then fall, flip once and land upright
  const DROP = [];
  // they land in his footprint (a tidy triangle), drifted 0.35 m along his strut
  { poseTral(T.POOF); tral.shoes.forEach((s, i) => { const p = s.getWorldPosition(new THREE.Vector3()).sub(L('beach', 0, 0, 0)); const vy = 0.8 + i * 0.25, land = (vy + Math.sqrt(vy * vy + 2 * 9.8 * p.y)) / 9.8; DROP.push({ p, vy, land, vx: -0.35 / land, vz: (TRAL_Z + (p.z - TRAL_Z) * 1.4 - p.z) / land, spin: i % 2 ? 1 : -1 }); }); }
  const REST = DROP.map((d) => [d.p.x + d.vx * d.land, d.p.z + d.vz * d.land]);
  function shoeDrop(i, t) {
    const d = DROP[i], u = t - T.POOF;
    if (u < d.land) return { x: d.p.x + d.vx * u, y: d.p.y + d.vy * u - 4.9 * u * u, z: d.p.z + d.vz * u, rx: d.spin * 2 * PI * (u / d.land), ry: -PI / 2 };
    const a = u - d.land, b = 0.12 * Math.exp(-a * 7) * Math.abs(Math.sin(a * 14));
    return { x: REST[i][0], y: b, z: REST[i][1], rx: 0, ry: -PI / 2 + (i - 1) * 0.15 };
  }
  function beacher(t, i) {
    const [x, z] = BEACHERS[i], p = basePose(); p.eyes = blink(t, i + 2); p.mouth = 'smile';
    const s = tralState(Math.min(t, T.POOF));
    Object.assign(p, { x, z, rotY: faceToward(x, z, s.x, TRAL_Z) });
    p.armB = FILM_B; p.armA = i % 2 ? FILM_A : REST;
    // beachgoer 0 yells his name (ElevenLabs line l01); the poof cuts it off mid-name
    if (i === 0 && t > T.SAY1 - 0.05 && t < T.POOF) { p.mouth = 'o'; p.armA = A(-2.6, 0.3, -0.6); p.headPitch = -0.12; }
    const d = Math.hypot(x - BLAST[0], z - BLAST[2]), th = T.POOF + 0.05 + d * 0.045;
    if (t > T.POOF) { p.mouth = 'o'; p.rotY = faceToward(x, z, BLAST[0], BLAST[2]); p.armA = flail(t, i); p.armB = flail(t, i + 2); p.tip = fallBack(t, th); p.headPitch = -0.2; }
    return p;
  }
  function beachKid(t, i) {
    const [x, z] = BEACH_KIDS[i], p = basePose(); p.eyes = blink(t, i + 5); p.mouth = 'smile';
    const s = tralState(Math.min(t, T.POOF));
    Object.assign(p, { x, z, rotY: faceToward(x, z, s.x, TRAL_Z) });
    if (i === 0) { const y = K(t, [[T.SAY1 - 0.1, 0], [T.SAY1 + 0.12, 1]]); p.armA = mixArm(REST, UP_A, y); p.armB = mixArm(REST, UP_B, y); if (t > T.SAY1 && t < T.POOF) { p.mouth = 'o'; p.headPitch = -0.15; } }
    else { p.armA = A(-0.55, 0.2, -0.6); p.armB = A(-0.55, 0.2, -0.6); }
    if (t > T.POOF) { p.mouth = 'o'; p.rotY = faceToward(x, z, BLAST[0], BLAST[2]); p.armA = flail(t, i + 4); p.armB = flail(t, i + 6); p.tip = fallBack(t, T.POOF + 0.08 + i * 0.05); }
    return p;
  }
  // umbrella dominoes: each tips away from the blast, starting as the shockwave reaches it
  const UMB = beach.umbrellas.map((u) => { const dx = u.x - BLAST[0], dz = u.z - BLAST[2], d = Math.hypot(dx, dz); return { yaw: Math.atan2(dx, dz), t0: T.POOF + 0.1 + d * 0.085 }; });
  // the hall visitors (behind the ropes, watching the row)
  function visitor(t, i) {
    const [x, z] = VIS[i], p = basePose(); p.eyes = blink(t, i + 1); p.mouth = 'smile';
    Object.assign(p, { x, z, rotY: Math.atan2(-NRM[0], -NRM[1]) + (i - 1.5) * 0.15 });
    // heads track the falling front
    const front = clamp((t - T.H_T0) / (4 * T.H_DT + T.H_FALL)) * 4, fx = lerp(PED[0][0], PED[4][0], front / 4), fz = lerp(PED[0][1], PED[4][1], front / 4);
    if (t > T.H_GOLD) { p.mouth = 'o'; p.headYaw = clamp(rel(faceToward(x, z, fx, fz) - p.rotY), -1.0, 1.0); p.armA = HEADC_A; p.armB = HEADC_B; }
    if (t > T.H_T0 + 4 * T.H_DT + T.H_FALL + 0.1) { p.lean = -0.12; p.armA = mixArm(HEADC_A, UP_A, 0.6); }
    return p;
  }
  const rel = (a) => ((((a + PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI;
  // pool swimmers: heads above water, then flung out by the splash onto the far deck (some), the rest bob
  const SWIM_FLY = SWIM.map(([x, z], i) => { const dx = x - SPLASH[0], dz = z - SPLASH[2], d = Math.max(0.5, Math.hypot(dx, dz)); const far = dz < 0; const land = far ? [x * 0.6 + dx / d * 0.5, -7.3 - (i % 2) * 0.7] : [x + dx / d * 6, z + dz / d * 6]; return { far, land, d }; });
  function swimmer(t, i) {
    const [x, z] = SWIM[i], p = basePose(); p.eyes = blink(t, i); p.mouth = 'smile';
    const f = SWIM_FLY[i], t0 = T.P_SPLASH + 0.04 + f.d * 0.03, dur = 1.0;
    Object.assign(p, { x, z, rotY: faceToward(x, z, 0, 9), y: PD.water - 1.42 + 0.03 * Math.sin(t * 2 + i), headPitch: -0.3 });
    p.armA = A(-0.4, 1.2, -0.3); p.armB = A(-0.4, 1.2, -0.3);
    if (t > T.P_POOF + 0.6) { p.headPitch = -0.7; p.mouth = 'o'; }
    if (t > t0 && f.far) {
      const u = clamp((t - t0) / dur), sx = lerp(x, f.land[0], u), sz = lerp(z, f.land[1], u), sy = lerp(PD.water - 1.42, 0, u) + 4.2 * Math.sin(u * PI);
      Object.assign(p, { x: sx, z: sz, y: sy, rotY: faceToward(f.land[0], f.land[1], 0, 9), headPitch: 0.1, mouth: 'o' });
      p.armA = flail(t, i); p.armB = flail(t, i + 3);
      if (u >= 1) { Object.assign(p, { y: -0.22, footFwd: 0.4, floor: 0, lean: -0.15 }); p.armA = A(-0.2, 0.5, -0.3); p.armB = A(-0.2, 0.5, -0.3); p.headRoll = 0.15 * Math.sin(t * 4 + i); }
      return p;
    }
    if (t > t0 && !f.far) return null;
    return p;
  }
  function clerkPose(t) {
    const p = basePose(); p.eyes = blink(t, 4); p.mouth = 'smile';
    Object.assign(p, { x: CLERK[0], z: CLERK[1], rotY: 0.1 });
    p.armA = SIGN_A; p.armB = SIGN_B;
    if (t > T.S_SIGN3) p.mouth = 'flat';
    if (t > T.S_BULGE) { p.rotY = lerpAngle(0.1, faceToward(CLERK[0], CLERK[1], 2.3, -6) , K(t, [[T.S_BULGE, 0], [T.S_BULGE + 0.3, 1]])); p.mouth = 'o'; }
    if (t > T.S_BURST + 0.1) { p.rotY = lerpAngle(p.rotY, 0.3, K(t, [[T.S_BURST + 0.1, 0], [T.S_BURST + 0.4, 1]])); p.armA = flail(t, 1); p.armB = flail(t, 3); p.lean = -0.1; }
    if (t > T.S_BURST + 1.3) { p.armA = A(-2.7, 0.4, -0.3); p.armB = A(-0.4, 0.4, -0.4); }
    return p;
  }
  function fan(t, f) {
    const p = basePose(); p.eyes = blink(t, f.i); p.mouth = 'smile';
    Object.assign(p, { x: f.x, z: f.z, rotY: -PI / 2 + (f.z - 9) * 0.05, footFwd: 0.12 });
    const chant = t > T.F_SAY - 0.1 && t < T.F_SAY + 2.0;
    // they rock back on the third leg on every dotted-quarter beat of the tarantella (0.6 s), arms pumping
    const rock = Math.sin((t - T.POOF) / 0.6 * 2 * PI + f.i * 0.25);
    p.armA = mixArm(TADA_A, UP_A, 0.25 + 0.25 * rock); p.armB = mixArm(TADA_B, UP_B, 0.25 - 0.25 * rock); p.lean = 0.05; p.tip = -0.26 + 0.07 * rock; p.headRoll = 0.12 * rock;
    if (chant) { p.mouth = 'o'; p.headPitch = -0.15; p.armA = mixArm(TADA_A, UP_A, 0.5 + 0.5 * Math.sin(t * 9 + f.i)); p.armB = mixArm(TADA_B, UP_B, 0.5 + 0.5 * Math.sin(t * 9 + f.i + 1)); }
    const t0 = f.t0;
    if (t > t0) { p.mouth = 'o'; p.armA = flail(t, f.i); p.armB = flail(t, f.i + 2); p.tip = -0.26 + fallBack(t, t0 + 0.06, 0.34) * (1.25 / 1.48); }
    return p;
  }
  function worker(t, i) {
    const d = OD.desks[i], p = basePose(); p.eyes = blink(t, i); p.mouth = 'flat';
    Object.assign(p, { x: d.seat[0], z: d.seat[1], rotY: PI, y: seatY(OD.seat), footFwd: 0.42, headPitch: 0.05 });
    const typ = 0.12 * Math.sin(t * 22 + i * 1.7);
    p.armA = A(TYPE_A.sx + typ, TYPE_A.sz, TYPE_A.el, TYPE_A.twist); p.armB = A(TYPE_B.sx - typ, TYPE_B.sz, TYPE_B.el, TYPE_B.twist);
    const pops = [T.O_POP1, T.O_POP2, T.O_POP3];
    for (const tp of pops) if (t > tp && t < tp + 0.6) { p.mouth = 'o'; p.headPitch = -0.1; p.armA = mixArm(p.armA, UP_A, 0.6); p.armB = mixArm(p.armB, UP_B, 0.6); }
    if (t > T.O_BOOM) { p.mouth = 'o'; p.lean = -0.25; p.armA = HEADC_A; p.armB = HEADC_B; p.headPitch = -0.2; }
    p.headYaw = rel(faceToward(d.seat[0], d.seat[1], TABLE[0], TABLE[1]) - PI) * 0.5;
    return p;
  }
  function aquaKid(t, i) {
    const [x, z] = AQ_KIDS[i], p = basePose(); p.eyes = blink(t, i + 3); p.mouth = 'smile';
    Object.assign(p, { x, z, rotY: PI, lean: 0.12, headPitch: -0.05 + 0.1 * Math.sin(t * 0.7 + i) });
    p.armA = A(-1.5, 0.35, -0.25, 0.2); p.armB = A(-1.5, 0.35, -0.25, -0.2);
    if (t > T.A_SINK + 0.4 && t < T.A_LAND + 0.6) { p.mouth = 'o'; p.headPitch = -0.35; }
    if (t > T.A_SLIP) { p.mouth = 'o'; p.headPitch = 0.15; p.armA = HEADC_A; p.armB = HEADC_B; }
    return p;
  }
  function aquaAdult(t, i) {
    const [x, z] = AQ_ADULTS[i], p = basePose(); p.eyes = blink(t, i + 8); p.mouth = 'smile';
    Object.assign(p, { x, z, rotY: PI }); p.armB = FILM_B;
    if (t > T.A_SLIP) p.mouth = 'o';
    return p;
  }
  /** the sneakers walking alone (formation = his three legs): heading yaw, step phase, a hop each step */
  function shoeWalk(i, cx, cz, yaw, ph, k = 1) {
    const off = [[-0.17, 0.26], [0.17, 0.26], [0, -0.4]][i], c = Math.cos(yaw), s = Math.sin(yaw);
    const p = ph + [0, PI, PI * 0.5][i], lift = Math.max(0, Math.sin(p)) * 0.09 * k, fwd = Math.cos(p) * 0.09 * k;
    return { x: cx + off[0] * c + (off[1] + fwd) * s, y: lift, z: cz - off[0] * s + (off[1] + fwd) * c, rx: -0.4 * Math.max(0, Math.sin(p)) * k, ry: yaw };
  }
  const setShoe = (sn, key, st, sc = 1) => { sn.visible = true; sn.position.copy(L(key, st.x, st.y, st.z)); sn.rotation.set(st.rx ?? 0, st.ry ?? 0, st.rz ?? 0, 'YXZ'); sn.scale.setScalar(sc); };
  const SHOE_CENTER = [(REST[0][0] + REST[1][0] + REST[2][0]) / 3, (REST[0][1] + REST[1][1] + REST[2][1]) / 3];
  // the walking shark: walks along a straight leg from a to b between t0 and t1 (pure)
  function walkerAt(t, legs) {
    for (const [t0, t1, a, b] of legs) if (t < t1 || legs[legs.length - 1][1] === t1) { const u = clamp((t - t0) / (t1 - t0)); return { x: lerp(a[0], b[0], u), z: lerp(a[1], b[1], u), yaw: Math.atan2(b[0] - a[0], b[1] - a[1]), moving: u > 0 && u < 1, dist: Math.hypot(b[0] - a[0], b[1] - a[1]) * u }; }
    return null;
  }

  // the bag of things hidden every frame
  const LOOSE = [fallCroc.g, tral.g, goldTral.g, balloon.g, plane.g, statPlane.g, bal.root, log.g, chimp.g, toyPlane, cup, plainLog, fruit.g, donut, wall, aval, priceCard, weed, ...INV, crab, reefShark.g, walker.g, shock, ...looseShoes, ...tethers, ...phones.map((p) => p.g), ...thirdLegs.map((l) => l.g), ...thirdLegs.map((l) => l.sn)];
  const screenMats = []; office.desks.forEach((d) => d.monitor.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && !screenMats.includes(o.material)) screenMats.push(o.material); }));
  const screenCols = screenMats.map((m) => m.color.getHex());
  const deskPivots = office.desks.map((d) => d.g);
  let cur = null;

  function update(TT) {
    const shot = shotAt(TT), S = shot.set, t = TT, cam = shot.cam;
    bubbleReq.length = 0; ALL_BUBBLES.forEach((b) => b.setPop(0));
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'globe' ? 0.05 : 0.05;
    studio.fill.intensity = S === 'aqua' ? 0.9 : S === 'reef' ? 0.9 : S === 'beach' && cam.startsWith('walk') ? 0.9 : 0.5;
    ALL.forEach((r) => { r.root.visible = false; r.root.rotation.x = 0; });
    adults.forEach((a) => outfit(a, a.base, a.basePants)); kids.forEach((a) => outfit(a, a.base, a.basePants));
    hoods.forEach((h) => (h.visible = false)); hats.forEach((h) => (h.visible = false));
    LOOSE.forEach((o) => (o.visible = false));
    puffN = 0; sparkN = 0; fireN = 0; dropN = 0; puffs.hide(); sparks.hide(); fire.hide(); flash = 0; boomLight.intensity = 0;
    aval.count = 0; drops.count = NDROP;
    let jolt = 0;

    if (S === 'beach') {
      beach.update(t);
      const fest = cam.startsWith('fest'), walk = cam.startsWith('walk');
      beach.fest.visible = fest; beach.boat.visible = !walk;
      beach.setTime(walk ? 1 : 0);
      beach.umbrellas.forEach((u, i) => { u.pivot.rotation.set(0, 0, 0); beach.setOpen(i, walk ? 0 : 1); });
      if (!fest && !walk) {
        // ---- SECOND 0: the strut, the leap, the poof
        beach.aimSun(1.5, 2.5, 14);
        if (t < T.POOF) { tral.g.visible = true; poseTral(t); }
        poof(t, T.POOF, L('beach', ...BLAST), 1.2, 12, 1.2); sparkle(t, T.POOF, L('beach', ...BLAST), 2.0, 24, 1.0);
        if (t > T.POOF && t < T.POOF + 0.2) sparks.set(sparkN++, L('beach', ...BLAST), 2.0 * (1 - (t - T.POOF) / 0.2), 0.8, FLASH_C);
        shock.visible = t > T.POOF && t < T.POOF + 1.0; if (shock.visible) { const u = (t - T.POOF) / 1.0; shock.position.copy(L('beach', BLAST[0], 0.04, BLAST[2])); shock.scale.setScalar(0.5 + 24 * u); shock.material.opacity = 0.7 * (1 - u); }
        if (t > T.POOF && t < T.POOF + 0.7) jolt = 0.045 * Math.exp(-(t - T.POOF) * 5);
        if (t > T.POOF) looseShoes.forEach((sn, i) => { const st = shoeDrop(i, t); setShoe(sn, 'beach', st); if (t > T.POOF + DROP[i].land && t < T.POOF + DROP[i].land + 2.5) poof(t, T.POOF + DROP[i].land, L('beach', st.x, 0.12, st.z), 0.45, 4, 0.9, DUST_C); });
        // after the drop: wisps of smoke off the sneakers
        if (t > T.POOF + 0.9) for (let k = 0; k < 3; k++) { const ph = (t * 0.8 + k / 3) % 1; puffs.set(puffN++, L('beach', REST[k][0], 0.25 + ph * 0.8, REST[k][1]), 0.15 + ph * 0.35, 0.5 * (1 - ph), SMOKE_C); }
        UMB.forEach((u, i) => { const k = clamp((t - u.t0) / 0.5); if (k > 0) { const pv = beach.umbrellas[i].pivot; pv.rotation.order = 'YXZ'; pv.rotation.set(1.42 * k * k + (k >= 1 ? 0.05 * Math.exp(-(t - u.t0 - 0.5) * 6) * Math.sin((t - u.t0) * 20) : 0), u.yaw, 0); } });
        BEACHERS.forEach((_, i) => { const p = beacher(t, i); put(adults[i], 'beach', p); outfit(adults[i], [0xe2574c, 0x3d7bd9, 0xf2c14e, 0x58b368, 0xe58fa6, 0x4fb3a8][i], [0x2f6fd8, 0xf4efe4, 0xe2574c, 0x34405c, 0xf2c14e, 0x2a2a2a][i]); });
        SUNBATH.forEach(([x, z], i) => {
          const p = basePose(); p.eyes = blink(t, i + 9); p.mouth = 'smile'; Object.assign(p, { x, z, rotY: PI + (i - 1.5) * 0.15, y: seatY(0.4), footFwd: 0.42, lean: -0.1 });
          p.armB = FILM_B; p.armA = A(-0.2, 0.3, -1.2, 0.5);
          if (t > T.POOF) { const th = T.POOF + 0.1 + Math.hypot(x - BLAST[0], z - BLAST[2]) * 0.045; p.mouth = 'o'; p.armA = flail(t, i + 7); p.armB = flail(t, i + 9); p.tip = fallBack(t, th) * 0.6; }
          put(adults[6 + i], 'beach', p); outfit(adults[6 + i], [0xf2c14e, 0xe58fa6, 0x3d7bd9, 0xe2574c][i], [0xe2574c, 0x2f6fd8, 0xf4efe4, 0x58b368][i]);
          if (t < T.POOF + 0.05) phoneIn(phones[6 + i], adults[6 + i], 1, p.rotY, -0.2);
        });
        BEACH_KIDS.forEach((_, i) => { putS(kids[i], 'beach', beachKid(t, i), KS); outfit(kids[i], [0xf2c14e, 0xe58fa6][i], [0x3d7bd9, 0x58b368][i]); });
        // phones: in hand while filming, then flung up and away by the blast
        BEACHERS.forEach(([x, z], i) => {
          const ph = phones[i]; if (t < T.POOF + 0.05) { phoneIn(ph, adults[i], 1, faceToward(x, z, tralState(t).x, TRAL_Z)); return; }
          const u = t - T.POOF - 0.05, h0 = 1.5, vy = 3.5 + i * 0.3, land = (vy + Math.sqrt(vy * vy + 2 * 9.8 * h0)) / 9.8, uu = Math.min(u, land), dir = Math.atan2(x - BLAST[0], z - BLAST[2]);
          ph.g.visible = true; ph.g.position.copy(L('beach', x + Math.sin(dir) * 1.6 * uu, Math.max(0.01, h0 + vy * uu - 4.9 * uu * uu), z + Math.cos(dir) * 1.6 * uu)); ph.g.rotation.set(u < land ? u * 9 : 0, dir + u * 3, 0);
        });
        if (t > T.SAY1 && t < T.POOF) say(sayKid, headAt(adults[0], 0.36), popK(t, T.SAY1), 0.5);
      } else if (fest) {
        // ---- +1 DAY: the fan club's tripod pose; third legs poof, they domino backward; the balloon sags over the stage
        beach.aimSun(35, 9, 9);
        FANS.forEach((f, j) => {
          const rig = adults[j], p = fan(t, f); put(rig, 'beach', p); hoods[j].visible = true; outfit(rig, [0x6f97b8, 0x6f97b8, 0xf4efe4, 0x6f97b8, 0x3d7bd9][j % 5], 0x6f97b8);
          const legT = f.t0, tl = thirdLegs[j];
          if (t < legT) {
            rig.root.updateMatrixWorld(true); const hip = rig.pelvis.getWorldPosition(new THREE.Vector3()), foot = L('beach', f.x + 0.72, 0.0, f.z), dir = foot.clone().sub(hip), len = dir.length();
            tl.g.visible = true; tl.g.position.copy(hip); tl.g.quaternion.setFromUnitVectors(_V.set(0, -1, 0), dir.normalize()); tl.leg.scale.set(1, len, 1); tl.leg.position.y = -len / 2;
            tl.sn.visible = true; tl.sn.position.copy(foot); tl.sn.rotation.set(0, PI / 2, 0);
          }
          poof(t, legT, L('beach', f.x + 0.5, 0.35, f.z), 0.55, 5, 0.7);
          poof(t, legT + 0.4, L('beach', f.x + 0.9, 0.2, f.z), 0.8, 5, 0.9, DUST_C);
        });
        // the balloon: tethered and bobbing, then it deflates and drapes over the stage
        const dk = K(t, [[T.F_DEFLATE, 0], [T.F_DEFLATE + 1.1, 1]], (u) => u * u);
        balloon.g.visible = true; balloon.g.scale.set(5.2 * (1 + 0.35 * dk), 5.2 * (1 - 0.82 * dk) * (1 + 0.04 * Math.sin(t * 13) * dk), 5.2 * (1 + 0.2 * dk));
        balloon.g.position.copy(L('beach', 44.0 - 3.0 * dk, (2.2 + 0.25 * Math.sin(t * 0.9)) * (1 - dk) + 0.1 * dk, 9.0)); balloon.g.rotation.set(0.05 * Math.sin(t * 0.7) * (1 - dk), -PI / 2 + 0.12 * Math.sin(t * 0.5), -0.25 * dk);
        balloon.pose({ ph: t * 0.8, stride: 0.12 * (1 - dk), wave: 0.4 + 0.2 * Math.sin(t * 1.3) - 0.8 * dk, mouth: dk > 0.2 ? 'o' : 'grin', pitch: 0.2 * dk });
        tethers.forEach((tt, k) => { if (dk > 0.6) return; balloon.g.updateMatrixWorld(true); const a = balloon.shoes[k].getWorldPosition(new THREE.Vector3()), b = L('beach', 42.0 + k * 0.9, 0, 7.6 + k * 1.4), d = a.clone().sub(b), l = d.length(); tt.visible = true; tt.position.copy(a.clone().add(b).multiplyScalar(0.5)); tt.scale.set(1, l, 1); tt.quaternion.setFromUnitVectors(UPV, d.normalize()); });
        if (t > T.F_DEFLATE + 1.0 && t < T.F_DEFLATE + 1.5) jolt = 0.02 * Math.exp(-(t - T.F_DEFLATE - 1.0) * 6);
        poof(t, T.F_DEFLATE + 1.05, L('beach', 40.5, 0.4, 9.0), 2.6, 12, 1.3, DUST_C);
        if (t > T.F_LEGS + 0.4 && t < T.F_LEGS + 0.9) jolt = Math.max(jolt, 0.01);
        if (t > T.F_SAY && t < T.F_SAY + 2.05) say(sayFans, L('beach', 34.0, 2.05, 8.6), popK(t, T.F_SAY), 0.5);
      } else {
        // ---- +1 MONTH: sunset, the empty beach; a crab; the sneakers come alive and set off along the shore
        beach.aimSun(-0.5, 1.4, 6);
        crab.visible = t > T.W_CRAB && t < T.W_CRAB + 2.6;
        if (crab.visible) { const u = (t - T.W_CRAB) / 2.6; crab.position.copy(L('beach', lerp(-1.7, 0.5, u), 0, lerp(0.75, 0.55, u) + 0.03 * Math.sin(u * 30))); crab.rotation.set(0, 0.1, 0.08 * Math.sin(t * 30)); }
        looseShoes.forEach((sn, i) => {
          let st = { x: REST[i][0], y: 0, z: REST[i][1], rx: 0, ry: -PI / 2 + (i - 1) * 0.15 };
          const tw = t - T.W_TWITCH;
          if (tw > 0 && t < T.W_GO) { const h = Math.max(0, Math.sin(tw * 9 - i * 1.1)) * 0.08 * Math.exp(-tw * 0.6); st.y = h; st.ry += 0.3 * Math.sin(tw * 6 + i); }
          if (t >= T.W_GO) {
            const gk = K(t, [[T.W_GO, 0], [T.W_GO + 0.5, 1]]), d = Math.max(0, t - T.W_GO - 0.25) * 1.15, yaw = lerpAngle(-PI / 2, -PI / 2 - 0.12, gk);
            const w = shoeWalk(i, SHOE_CENTER[0] - d, SHOE_CENTER[1] - 0.08 * d, yaw, d / 0.42 * 2 * PI, gk);
            st = { x: lerp(st.x, w.x, gk), y: w.y, z: lerp(st.z, w.z, gk), rx: w.rx, ry: lerpAngle(st.ry, w.ry, gk) };
          }
          setShoe(sn, 'beach', st);
        });
      }
    } else if (S === 'hall') {
      // ---- +1 SECOND: the domino row
      for (let i = 0; i < 5; i++) {
        const pd = PEDS[i], t0 = pedT(i), u = clamp((t - t0) / T.H_FALL), land = t0 + T.H_FALL;
        pd.pivot.rotation.x = (i < 4 ? 1.38 : 1.5) * u * u + (u >= 1 ? 0.04 * Math.exp(-(t - land) * 8) * Math.sin((t - land) * 24) : 0);
        if (Math.abs(t - land) < 0.25 && t > land) jolt = Math.max(jolt, (i === 4 ? 0.03 : 0.012) * (1 - (t - land) / 0.25));
        poof(t, land, L('hall', PED[i][0] + U[0] * 1.5, 0.3, PED[i][1] + U[1] * 1.5), 1.1, 8, 1.0, DUST_C);
        if (i > 0) poof(t, land, L('hall', PED[i][0] + U[0] * 1.9, 0.5, PED[i][1] + U[1] * 1.9), 0.8, 6, 0.8, POOF_C);
      }
      hall.root.updateMatrixWorld(true);
      // the statues ride their pedestals until they hit the floor, then poof into ordinary things
      const ride = (g, i, ox = 0, oy = 0, oz = 0, ry = 0) => { const pd = PEDS[i]; g.visible = true; pd.body.updateMatrixWorld(true); g.position.copy(pd.body.localToWorld(_V.set(ox, pd.top + oy, oz))); g.quaternion.copy(pd.body.getWorldQuaternion(_Q)); g.rotateY(ry); };
      if (t < T.H_GOLD) { ride(goldTral.g, 0, 0, 0, 0, 0.2); goldTral.g.scale.setScalar(0.62); goldTral.pose({ ph: 0.7, stride: 0.35, wave: 0.6 }); }
      poof(t, T.H_GOLD, L('hall', PED[0][0], PED_H + 0.7, PED[0][1]), 1.4, 12, 1.1); sparkle(t, T.H_GOLD, L('hall', PED[0][0], PED_H + 0.7, PED[0][1]), 1.4, 16, 0.9);
      if (t > T.H_GOLD && t < T.H_GOLD + 0.25) sparks.set(sparkN++, L('hall', PED[0][0], PED_H + 0.7, PED[0][1]), 2.5 * (1 - (t - T.H_GOLD) / 0.25), 1, FLASH_C);
      const landT = (i) => pedT(i) + T.H_FALL;
      if (t < landT(1)) { ride(statPlane.g, 1, 0, 0.42, 0, PI / 2 + 0.35); statPlane.g.scale.setScalar(0.19); statPlane.spin(t); statPlane.croc.pose({ jaw: 0.25 }); }
      if (t < landT(2)) { ride(bal.root, 2, 0, 0, 0, 0.2); bal.root.scale.setScalar(0.72); const pb = basePose(); pb.armA = A(-2.95, 0.5, -0.9, 0.3); pb.armB = A(-2.95, 0.5, -0.9, -0.3); applyPose(bal, { ...pb, x: bal.root.position.x, z: bal.root.position.z, rotY: 0 }); bal.root.position.copy(PEDS[2].body.localToWorld(_V.set(0, PEDS[2].top, 0))); bal.root.quaternion.copy(PEDS[2].body.getWorldQuaternion(_Q)); bal.root.rotateY(0.2); }
      if (t < landT(3)) { ride(log.g, 3, 0, 0, 0, 0.3); log.g.scale.setScalar(0.72); poseLog(log, { swing: 0.2, lz: 0.4 }); }
      if (t < landT(4)) { ride(chimp.g, 4, 0, 0, 0, 0.1); chimp.g.scale.setScalar(0.78); }
      for (let i = 1; i < 5; i++) {
        if (t < landT(i)) continue;
        const o = ORD[i], a = t - landT(i), roll = Math.min(a, 0.8), dst = 1.9 + 0.5 * roll + (i === 4 ? 0.3 * roll : 0);
        o.visible = true; o.position.copy(L('hall', PED[i][0] + U[0] * dst, (i === 3 ? 0.17 : i === 4 ? 0.06 : 0.0) + Math.max(0, 0.6 * Math.sin(Math.min(a, 0.5) * 2 * PI)) * Math.exp(-a * 3), PED[i][1] + U[1] * dst));
        o.rotation.set(i === 4 ? PI / 2 : 0, Math.atan2(U[0], U[1]) + (i === 3 ? PI / 2 : 0) + (i === 1 ? 0.6 : 0), i === 4 ? roll * 4 : 0);
        if (i === 3) o.rotation.x = roll * 3;
        sparkle(t, landT(i), o.position.clone().add(_V.set(0, 0.3, 0)), 0.8, 10, 0.7);
      }
      VIS.forEach((_, i) => { put(adults[i], 'hall', visitor(t, i)); });
      outfit(adults[0], 0x2f4f73); outfit(adults[1], 0xe58fa6); outfit(adults[2], 0xf2c14e); outfit(adults[3], 0x58b368);
      putS(kids[2], 'hall', { ...visitor(t, 2), x: VIS_KID[0], z: VIS_KID[1] }, KS);
    } else if (S === 'pool') {
      // ---- +1 MINUTE: the bomber-crocodile un-merges; the crocodile drops into the pool
      pool.update(t);
      poolUmbrellas.forEach((m) => (m.visible = cam !== 'poolA'));
      const pre = t < T.P_POOF;
      plane.g.visible = true; plane.g.position.copy(L('pool', planeX(t), PLANE_Y + 0.4 * Math.sin(t * 1.3), PLANE_Z)); plane.g.rotation.set(0, PI / 2, 0.08 * Math.sin(t * 1.1)); plane.spin(t);
      plane.separate(pre ? 0 : 1); plane.croc.g.visible = pre;
      if (pre) plane.croc.pose({ jaw: 0.3 + 0.1 * Math.sin(t * 8) });
      poof(t, T.P_POOF, L('pool', planeX(T.P_POOF) + 2.0, PLANE_Y, PLANE_Z), 2.2, 12, 1.1); sparkle(t, T.P_POOF, L('pool', planeX(T.P_POOF) + 2.0, PLANE_Y, PLANE_Z), 2.5, 18, 0.9);
      // the falling crocodile (a separate world-placed croc: reuse the plane's croc mesh tree via a clone made at build)
      if (!pre) {
        const u = t - T.P_POOF;
        if (t < T.P_SPLASH) { const c = crocFall(u); fallCroc.g.visible = true; fallCroc.g.position.copy(L('pool', c.x, c.y, c.z)); fallCroc.g.rotation.set(-0.6 - u * 1.2, PI / 2 + u * 0.8, u * 2.2); fallCroc.g.scale.setScalar(1.25); fallCroc.pose({ ph: t * 9, flail: 1, jaw: 0.5 }); }
        else {
          const a = t - T.P_SPLASH, sx = SPLASH[0] + 0.4 * Math.sin(a * 0.6), sz = SPLASH[2] + 0.8 + 0.25 * a;
          if (a > 0.9) { donut.visible = true; donut.position.copy(L('pool', sx, PD.water + 0.04 + 0.03 * Math.sin(t * 2.2), sz)); donut.rotation.set(PI / 2, 0, a * 0.3); fallCroc.g.visible = true; const rise = K(t, [[T.P_SPLASH + 0.9, 0], [T.P_SPLASH + 1.3, 1]]); fallCroc.g.position.copy(L('pool', sx, lerp(-0.9, PD.water + 0.16, rise) + 0.03 * Math.sin(t * 2.2), sz)); fallCroc.g.rotation.set(0.05 * Math.sin(t * 1.7), PI * 0.85 + a * 0.3, 0.06 * Math.sin(t * 2.3)); fallCroc.g.scale.setScalar(1.25); fallCroc.pose({ ph: t * 2, flail: 0.15, jaw: 0.35, look: Math.sin(t * 1.5) }); }
        }
      }
      splash(t, T.P_SPLASH, L('pool', SPLASH[0], PD.water, SPLASH[2]), 1.0, 160);
      if (t > T.P_SPLASH && t < T.P_SPLASH + 0.7) jolt = 0.05 * Math.exp(-(t - T.P_SPLASH) * 5);
      SWIM.forEach((_, i) => { const p = swimmer(t, i); put(adults[i], 'pool', p); outfit(adults[i], [0xe2574c, 0x3d7bd9, 0xf2c14e, 0x58b368, 0xe58fa6, 0x4fb3a8, 0xf08a3a, 0x8f6fb8][i], 0x2f6fd8); });
    } else if (S === 'shoe') {
      // ---- +1 HOUR: TRIPLE KICKS. Price card 50% → 90% → FREE, a tumbleweed; the stockroom bursts
      wall.visible = true;
      const cp = clerkPose(t); put(clerk, 'shoe', cp);
      const card = t < T.S_SIGN1 ? '20% OFF' : t < T.S_SIGN2 ? '50% OFF' : t < T.S_SIGN3 ? '90% OFF' : 'FREE';
      drawCard(card);
      if (t < T.S_BURST + 0.15) { priceCard.visible = true; const a = handWorld(clerk, -1), b = handWorld(clerk, 1); priceCard.position.copy(a.add(b).multiplyScalar(0.5)).add(_V.set(0, 0.1, 0.06)); priceCard.rotation.set(0, clerk.root.rotation.y, 0); const flip = [T.S_SIGN1, T.S_SIGN2, T.S_SIGN3].some((s) => t > s - 0.12 && t < s + 0.12); if (flip) priceCard.rotation.y += PI * clamp(1 - Math.abs(t - [T.S_SIGN1, T.S_SIGN2, T.S_SIGN3].find((s) => Math.abs(t - s) < 0.12)) / 0.12) * 0.5; }
      else { priceCard.visible = true; const a = t - T.S_BURST - 0.15; priceCard.position.copy(L('shoe', CLERK[0] + 0.3 + 0.6 * Math.min(a, 1), Math.max(0.05, 1.3 + 2.5 * a - 4.9 * a * a), CLERK[1] + 0.4)); priceCard.rotation.set(a * 6, a * 4, 0); }
      weed.visible = t < 21.7; if (weed.visible) { const u = (t - 19.0) / 2.7; weed.position.copy(L('shoe', lerp(-3.2, 3.0, u), 0.24 + 0.15 * Math.abs(Math.sin(u * 14)), lerp(-1.4, 0.9, u))); weed.rotation.set(0, 0, -u * 22); }
      // the door bulges, then bursts open
      const bul = t > T.S_BULGE && t < T.S_BURST ? Math.sin((t - T.S_BULGE) * 40) * 0.05 * (t - T.S_BULGE) / (T.S_BURST - T.S_BULGE) : 0;
      shoe.door.rotation.y = t > T.S_BURST ? 1.9 * K(t, [[T.S_BURST, 0], [T.S_BURST + 0.12, 1]]) : bul;
      shoe.door.position.z = OFF.shoe[2] * 0 + -6 + 0.1 + (t > T.S_BULGE && t < T.S_BURST ? Math.abs(bul) * 2 : 0);
      if (t > T.S_BURST) {
        let n = 0;
        AV.forEach((s) => {
          const a = t - s.t0; if (a < 0) return;
          const u = Math.min(a, s.dur), k = u / s.dur, y0 = s.p0[1], y1 = s.p1[1], vy = (y1 - y0 + 4.9 * s.dur * s.dur) / s.dur;
          const x = lerp(s.p0[0], s.p1[0], k), z = lerp(s.p0[2], s.p1[2], k), y = y0 + vy * u - 4.9 * u * u;
          const sp = Math.min(a, s.dur);
          aval.setMatrixAt(n++, _M.compose(L('shoe', x, Math.max(0.04, y), z), _Q.setFromEuler(_E.set(s.rot[0] + s.spin[0] * sp, s.rot[1] + s.spin[1] * sp, s.rot[2] + s.spin[2] * sp)), _S.setScalar(1)));
        });
        aval.count = n; aval.instanceMatrix.needsUpdate = true; aval.visible = true;
        poof(t, T.S_BURST, L('shoe', 2.3, 1.2, -5.5), 1.6, 10, 1.0, DUST_C);
        if (t < T.S_BURST + 0.5) jolt = 0.03 * Math.exp(-(t - T.S_BURST) * 5);
        else if (t < T.S_BURST + 1.3) jolt = 0.006;
        // the last one lands on his head
        const hd = headAt(clerk, 0.17), la = t - (T.S_BURST + 1.45);
        if (la > -0.5) { const sn = looseShoes[0]; sn.visible = true; const u = clamp((la + 0.5) / 0.5); sn.position.copy(hd.clone().add(_V.set(-0.4 * (1 - u), 1.6 * (1 - u * u), 0.2 * (1 - u)))); sn.rotation.set(0, 0.6, (1 - u) * 5); sn.scale.setScalar(1); }
      }
    } else if (S === 'office') {
      // ---- +1 WEEK: the content farm. Three replacements pop out of the meme machine; the fridge breaks it
      const gen = clamp(((t - 29.8) % 0.9) / 0.9);
      if (t < T.O_BOOM) drawScreen('gen', gen); else drawScreen('error');
      screenMats.forEach((m, k) => m.color.setHex(t > T.O_BOOM + 0.15 ? 0x111114 : screenCols[k]));
      // v1.1: the two workers right under the lens in officeA showed as a cropped dark head
      OD.desks.forEach((d, i) => { if (cam === 'officeA' && (i === 6 || i === 7)) return; put(adults[i], 'office', worker(t, i)); outfit(adults[i], [0x2f4f73, 0xf5f0e2, 0x8f6fb8, 0x4fb3a8, 0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0xe58fa6, 0x2a2a30, 0xe08a3a, 0xa77bd1, 0x58b368, 0x45607a, 0xf2c14e, 0x3d7bd9][i]); });
      const popAt = (i) => [T.O_POP1, T.O_POP2, T.O_POP3][i], failAt = (i) => [T.O_FAIL1, T.O_FAIL2, T.O_BOOM][i];
      INV.forEach((g, i) => {
        const tp = popAt(i); if (t < tp) return;
        const a = t - tp, fly = clamp(a / 0.4), sc = i === 2 ? 1.0 : 0.75;
        const sx = SCREEN[0], sy = SCREEN[1] - 0.35, sz = SCREEN[2] + 0.1, tx = TABLE[0] + (i - 1) * 0.15, ty = 0.77, tz = TABLE[1] + 0.05;
        let x = lerp(sx, tx, fly), y = lerp(sy, ty, fly) + 0.5 * Math.sin(fly * PI), z = lerp(sz, tz, fly), rx = 0, ry = 0.25, rz = 0;
        const s = sc * K(a, [[0, 0.1], [0.25, 1.2], [0.4, 1]]);
        if (i === 0) {
          sharkino.pose({ ph: t * 6, stride: 0.12 * (a > 0.4 ? 1 : 0), wave: 0.4, legX: [0, 0, 0], mouth: t > T.O_FAIL1 - 0.3 ? 'o' : 'grin' });
          if (a > 0.4) { rz = 0.25 * Math.sin((a - 0.4) * 9); }
          if (t > T.O_FAIL1) { const u = clamp((t - T.O_FAIL1) / 0.3); rx = 1.45 * u * u; rz = 0; y = ty + 0.05 * (1 - u); }
          if (t > T.O_FAIL1 + 0.7) return;
        } else if (i === 1) {
          if (a > 0.4) { const r = Math.max(0, t - (tp + 0.55)); x = tx + 1.6 * r * r + 0.6 * r; ry = PI / 2; if (x > 0.95) { const f = x - 0.95; y = ty - 3 * f * f; rz = -f * 2; } }
          tuna.userData.body.rotation.z = 0.15 * Math.sin(t * 7);
          if (t > T.O_FAIL2 + 0.3) return;
        } else {
          fridge.userData.body.rotation.z = a > 0.4 ? 0.06 * Math.sin((a - 0.4) * 7) : 0;
          if (t > T.O_TIP) { const u = clamp((t - T.O_TIP) / 0.35); rx = -1.25 * u * u; z = tz - 0.25 * u; y = ty + 0.3 * u; }
          if (t > T.O_BOOM + 0.05) return;
        }
        g.visible = true; g.position.copy(L('office', x, y, z)); g.rotation.set(rx, ry, rz, 'YXZ'); g.scale.setScalar(s);
        if (t < failAt(i)) say(names[i], L('office', x, y + (i === 2 ? 1.75 : 1.25) * sc, z), popK(t, tp + 0.3), 0.42);
      });
      poof(t, T.O_FAIL1, L('office', 0, 0.9, TABLE[1]), 0.6, 5, 0.6, DUST_C);
      boom(t, T.O_BOOM, L('office', SCREEN[0], SCREEN[1], SCREEN[2] + 0.4), 1.25, 12); sparkle(t, T.O_BOOM, L('office', SCREEN[0], SCREEN[1], SCREEN[2] + 0.3), 1.6, 20, 1.0);
      if (t > T.O_BOOM + 0.3) for (let k = 0; k < 3; k++) { const ph = (t * 0.6 + k / 3) % 1; puffs.set(puffN++, L('office', SCREEN[0] + (k - 1) * 0.5, SCREEN[1] + 0.3 + ph * 1.2, SCREEN[2] + 0.3), 0.4 + ph * 0.6, 0.55 * (1 - ph), SMOKE_C); }
      if (t > T.O_BOOM && t < T.O_BOOM + 0.6) jolt = 0.04 * Math.exp(-(t - T.O_BOOM) * 5);
      boomLight.intensity = flash * 8;
    } else if (S === 'aqua') {
      // ---- +2 MONTHS: the shark tank
      aqua.update(t);
      AQ_KIDS.forEach((_, i) => { putS(kids[i % 6], 'aqua', aquaKid(t, i), KS); });
      AQ_ADULTS.forEach((_, i) => { const p = aquaAdult(t, i); put(adults[i], 'aqua', p); phoneIn(phones[i], adults[i], 1, PI, -0.2); });
      // the shark: crosses left → right in front of the glass (aquaA), back right → left over the sneakers (aquaB)
      reefShark.g.visible = true; reefShark.swim(t, 1);
      if (t < 43.4) { const u = (t - 41.4) / 2.6; reefShark.g.position.copy(L('aqua', lerp(-7, 7, u), 2.45 + 0.15 * Math.sin(t), -0.65)); reefShark.g.rotation.set(0, PI / 2, 0); }
      else { reefShark.g.position.copy(L('aqua', 0.2 - 5 * (t - (T.A_HOP + 0.1)), 1.0 + 0.05 * Math.sin(t * 2), -1.3)); reefShark.g.rotation.set(0, -PI / 2, 0); }
      const SH = new THREE.Vector3().copy(reefShark.g.position).sub(L('aqua', 0, 0, 0));
      looseShoes.forEach((sn, i) => {
        const bx = -0.1 + (i - 1) * 0.3, bz = -1.15 + (i === 2 ? -0.3 : 0.05);
        let st;
        if (t < T.A_LAND) { const u = clamp((t - T.A_SINK) / (T.A_LAND - T.A_SINK)); st = { x: bx + 0.2 * Math.sin(u * 6 + i), y: lerp(4.9, 0.3, u), z: bz, rx: 0.5 * Math.sin(t * 3 + i), ry: -PI / 2 + Math.sin(t + i), rz: 0.4 * Math.sin(t * 2.3 + i) }; if (t < T.A_SINK) st.y = 99; }
        else if (t < T.A_HOP) { const a = t - T.A_LAND; st = { x: bx + 0.1 * a, y: 0.3 + Math.max(0, Math.sin(a * 6 + i)) * 0.05, z: bz, rx: 0, ry: PI / 2 + 0.2 * (i - 1) }; }
        else if (t < T.A_SLIP) { const u = clamp((t - T.A_HOP) / 0.2); st = { x: lerp(bx + 0.14, SH.x + (i - 1) * 0.35, u), y: lerp(0.3, SH.y - 0.32, u), z: lerp(bz, SH.z, u), rx: PI * u, ry: -PI / 2 }; }
        else { const a = t - T.A_SLIP, x0 = SH.x + (i - 1) * 0.35 + 5 * 0.0; st = { x: bx - 1.6 - 0.8 * Math.min(a, 1) + (i - 1) * 0.4, y: Math.max(0.3, 0.95 - 1.2 * a * a + 0.4 * a), z: bz + (i - 1) * 0.2, rx: PI + a * (4 + i), ry: -PI / 2 + a * 3 * (i - 1), rz: a * 2 }; void x0; }
        if (st.y < 50) setShoe(sn, 'aqua', st);
        if (t > T.A_SINK && t < T.A_LAND) for (let k = 0; k < 2; k++) { const ph = (t * 1.2 + k * 0.5 + i * 0.3) % 1; puffs.set(puffN++, L('aqua', st.x + 0.1 * Math.sin(k + i), st.y + ph * 1.4, st.z), 0.06 + ph * 0.05, 0.6 * (1 - ph), SPLASH_C); }
      });
      poof(t, T.A_LAND, L('aqua', -0.1, 0.4, -1.15), 0.5, 5, 0.9, new THREE.Color(0xd9c8a0));
    } else if (S === 'globe') {
      // ---- +11 MONTHS: Italy → Australia on foot (well, on sneaker)
      const u = K(t, [[T.G0 + 0.15, 0], [T.G1 - 0.25, 1]], (x) => x), [la, lo] = routeAt(u);
      globe.spin.rotation.y = faceLon(lo); globe.g.rotation.x = la * PI / 180 * 0.85;
      let n = 0; for (let k = 0; k < NDOT; k++) { const v = k / (NDOT - 1); if (v > u) break; const [a, b] = routeAt(v); dots.setMatrixAt(n++, _M.compose(latLonToVec(a, b, globe.r + 0.004, _V), _Q.identity(), _S.setScalar(1))); }
      dots.count = n; dots.instanceMatrix.needsUpdate = true;
      const head = latLonToVec(la, lo, globe.r + 0.002, new THREE.Vector3()), [la2, lo2] = routeAt(Math.min(1, u + 0.01)), ahead = latLonToVec(la2, lo2, globe.r, new THREE.Vector3());
      const up = head.clone().normalize(), fwd = ahead.clone().sub(head); fwd.addScaledVector(up, -fwd.dot(up)).normalize(); const right = new THREE.Vector3().crossVectors(up, fwd);
      const basis = new THREE.Matrix4().makeBasis(right.clone().negate(), up, fwd), q = new THREE.Quaternion().setFromRotationMatrix(basis);
      miniShoes.forEach((s, i) => { const off = [[-0.05, 0.07], [0.05, 0.07], [0, -0.1]][i], st = Math.max(0, Math.sin(t * 18 + i * 2.1)) * 0.03; s.visible = true; s.position.copy(head).addScaledVector(right, -off[0]).addScaledVector(fwd, off[1]).addScaledVector(up, st); s.quaternion.copy(q); });
    } else if (S === 'reef') {
      // ---- +1 YEAR: low tide in Australia. The walking shark climbs out; the sneakers hop on; it struts at us
      reef.update(t); reef.aimSun(0, 0.8, 5);
      const final = cam === 'final';
      // walking shark path (pure in t)
      let W;
      if (!final) {
        if (t < T.R_CLIMB) W = { x: 0.25, z: 0.2, y: -0.2, yaw: 0, ph: 0, moving: false };
        else if (t < T.R_CLIMB + 1.4) { const u = (t - T.R_CLIMB) / 1.4; W = { x: lerp(0.2, SHARK_OUT[0], u), z: lerp(0.3, SHARK_OUT[1], u), y: lerp(-0.2, 0.0, Math.min(1, u * 1.4)), yaw: 0.1, ph: u * 1.4 / 0.32 * 2 * PI, moving: true }; }
        else { const turn = K(t, [[T.R_CLIMB + 1.5, 0], [T.R_CLIMB + 2.1, 1]]); W = { x: SHARK_OUT[0], z: SHARK_OUT[1], y: 0, yaw: lerpAngle(0.1, -PI / 2, turn), ph: 4.4 * 2 * PI + turn * PI, moving: turn > 0 && turn < 1 }; }
        const hopT = [T.R_HOP1, T.R_HOP2, T.R_HOP3];
        // after the last hop: a look down, a look up (at us), two proud steps toward −x
        if (t > T.R_GOLD + 0.2) { const u = clamp((t - (T.R_GOLD + 0.9)) / 1.6); W = { x: SHARK_OUT[0] - 0.55 * u, z: SHARK_OUT[1], y: 0, yaw: -PI / 2, ph: 4.4 * 2 * PI + PI + u * 3.2 * PI, moving: u > 0 && u < 1 }; }
        walker.g.visible = true; walker.g.position.copy(L('reef', W.x, W.y, W.z)); walker.g.rotation.set(0, W.yaw, 0);
        const lookDown = K(t, [[T.R_HOP3 + 0.15, 0], [T.R_HOP3 + 0.4, 1], [T.R_GOLD + 0.6, 1], [T.R_GOLD + 0.9, 0]]);
        walker.pose({ ph: W.ph, bend: W.moving ? 0.25 : 0.06, headPitch: 0.45 * lookDown - 0.05, headYaw: t > T.R_GOLD + 0.6 && t < T.R_GOLD + 1.2 ? 0.6 : 0, mouth: t > T.R_HOP1 && t < T.R_GOLD + 0.9 ? 'o' : null, look: Math.sin(t * 1.4) * 0.5 });
        walker.g.updateMatrixWorld(true);
        // the sneakers: trudge in, stop, stare, then hop one by one onto fins 0, 1, 2 (fin 3 stays bare)
        looseShoes.forEach((sn, i) => {
          const tin = clamp((t - 48.7) / 1.4), cx = lerp(REEF_IN[0], REEF_STOP[0], tin), cz = lerp(REEF_IN[1], REEF_STOP[1], tin);
          let st = shoeWalk(i, cx, cz, PI / 2, tin * 1.4 / 0.4 * 2 * PI, tin < 1 ? 0.7 : 0);
          if (t > 50.2 && t < hopT[i]) st.y += Math.max(0, Math.sin((t - 50.2) * 3 + i)) * 0.02;
          if (t >= hopT[i]) {
            const fin = walker.fins[i], tip = fin.tip.getWorldPosition(new THREE.Vector3()).sub(L('reef', 0, 0, 0)), u = clamp((t - hopT[i]) / 0.28);
            const target = { x: tip.x, y: Math.max(0, tip.y - 0.06), z: tip.z, rx: 0, ry: W.yaw };
            st = { x: lerp(st.x, target.x, u), y: lerp(st.y, target.y, u) + 0.35 * Math.sin(u * PI), z: lerp(st.z, target.z, u), rx: -2 * PI * u, ry: lerpAngle(st.ry, target.ry, u) };
            if (u >= 1) { st.rx = 0; st.y = target.y; }
          }
          setShoe(sn, 'reef', st, 0.85);
          if (t >= hopT[i] + 0.28) sparkle(t, hopT[i] + 0.28, L('reef', st.x, 0.15, st.z), 0.35, 6, 0.5);
        });
        sparkle(t, T.R_GOLD, L('reef', SHARK_OUT[0], 0.45, SHARK_OUT[1]), 1.2, 22, 1.0);
        poof(t, T.R_CLIMB + 0.1, L('reef', 0.25, 0.0, 0.5), 0.5, 5, 0.8, SPLASH_C);
      } else {
        // ---- the strut at the lens, past the reef walkers filming it
        const u = clamp((t - 55.6) / 3.5), pose = K(t, [[T.Z_POSE, 0], [T.Z_POSE + 0.3, 1]]);
        const x = lerp(FIN_A[0], FIN_B[0], u), z = lerp(FIN_A[1], FIN_B[1], u), ph = u * Math.hypot(FIN_B[0] - FIN_A[0], FIN_B[1] - FIN_A[1]) / 0.3 * 2 * PI;
        walker.g.visible = true; walker.g.position.copy(L('reef', x, 0, z)); walker.g.rotation.set(0, Math.atan2(FIN_B[0] - FIN_A[0], FIN_B[1] - FIN_A[1]) + 0.06 * Math.sin(t * 2) + (u >= 1 ? 0.5 * pose : 0), 0);
        walker.pose({ ph: u < 1 ? ph : ph + Math.sin((t - 59.1) * 2) * 0.2, bend: u < 1 ? 0.24 : 0.05, headPitch: -0.15 * pose, splay: 0.3 * pose, look: t > 57.6 ? 0.6 * Math.sin(t * 0.9) : 0 });
        walker.g.updateMatrixWorld(true);
        looseShoes.forEach((sn, i) => { const tip = walker.fins[i].tip.getWorldPosition(new THREE.Vector3()).sub(L('reef', 0, 0, 0)); setShoe(sn, 'reef', { x: tip.x, y: Math.max(0, tip.y - 0.06), z: tip.z, rx: 0, ry: walker.g.rotation.y + walker.fins[i].pv.rotation.y * 0.5 }, 0.85); });
        TOURISTS.forEach(([tx, tz], i) => {
          const p = basePose(); p.eyes = blink(t, i); p.mouth = 'smile'; const wz = z;
          Object.assign(p, { x: tx, z: tz, rotY: faceToward(tx, tz, x, wz), headPitch: 0.35 });
          if (i === 2) { p.crouch = 0.3; p.lean = 0.3; }
          const ph = K(t, [[T.Z_PHONES + i * 0.04, 0], [T.Z_PHONES + 0.25 + i * 0.04, 1]]);
          p.armB = mixArm(REST, FILM_B, ph); p.armA = i % 2 ? mixArm(REST, FILM_A, ph) : REST;
          if (t > T.Z_PHONES - 0.5 && t < T.Z_PHONES + 0.6) p.mouth = 'o';
          // reef walker 3 asks it (ElevenLabs line l04)
          if (i === 3 && t > T.Z_SAY && t < T.Z_SAY + 2.7) { p.mouth = 'o'; p.headPitch = 0.1; }
          put(adults[i], 'reef', p); hats[i].visible = true; outfit(adults[i], [0xf4efe4, 0x4fb3a8, 0xe58fa6, 0xf2c14e, 0x3d7bd9][i], [0x6b5a48, 0xe8dcc4, 0x34405c, 0x5a7a9a, 0xe8dcc4][i]);
          if (ph > 0) phoneIn(phones[i], adults[i], 1, p.rotY, -0.5);
        });
        TOUR_KIDS.forEach(([tx, tz], i) => {
          const p = basePose(); p.eyes = blink(t, i + 6); p.mouth = 'smile';
          Object.assign(p, { x: tx, z: tz, rotY: faceToward(tx, tz, x, z), headPitch: 0.4, lean: 0.1 });
          p.armA = A(-0.6, 0.2, -0.5); p.armB = A(-0.6, 0.2, -0.5);
          putS(kids[i], 'reef', p, KS); hats[5 + i].visible = true;
        });
        if (t > T.Z_SAY && t < T.Z_SAY + 2.7) say(sayEnd, headAt(adults[3], 0.36), popK(t, T.Z_SAY), 0.5);
      }
    }

    // camera (local → world)
    const c = CAMS[cam], o = OFF[S];
    let P, Aim, fov = c.fov;
    if (c.fn) { const r = c.fn(t); P = r.p.map((v, i) => v + o[i]); Aim = r.a.map((v, i) => v + o[i]); if (r.fov) fov = r.fov; }
    else {
      const u = clamp((TT - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    }
    if (jolt) { P = [P[0] + jolt * Math.sin(TT * 70), P[1] + jolt * Math.sin(TT * 55), P[2]]; }
    setCamera(P, Aim, fov, TT, c.amp);
    studio.camera.updateMatrixWorld(true);
    for (const [b, pos, k, frac] of bubbleReq) { const d = studio.camera.position.distanceTo(pos); b.sprite.position.copy(pos); b.setPop(k * frac * frameW(d)); }
    if (S === 'pool') drops.count = dropN; else drops.count = 0;
    drops.instanceMatrix.needsUpdate = true;
  }

  // the pedestals (built here because they need PED); the crocodile that falls (its own copy)
  const poolUmbrellas = pool.root.children.filter((o) => o.isMesh && Math.abs(o.position.z - 8.6) < 0.01 && (o.geometry.type === 'ConeGeometry' || (o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.height > 2)));
  const PEDS = PED.map(([x, z], i) => hall.addPedestal(x, z, PED_H, ['TRALALERO TRALALA\nJAN 2025', 'BOMBARDIRO CROCODILO\nFEB 2025', 'BALLERINA CAPPUCCINA\n2025', 'TUNG TUNG TUNG SAHUR\nFEB 2025', 'CHIMPANZINI BANANINI\n2025'][i], { ry: Math.atan2(U[0], U[1]), gold: i === 0 }));
  PEDS.forEach((pd) => (pd.pivot.rotation.order = 'YXZ'));
  return { update };
}
