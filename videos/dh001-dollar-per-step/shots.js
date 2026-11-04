// VIDEO dh001 — "What if you earned $1 for every step you took?"  (money lane · tone FUNNY: one named everyman, Walt, + the
// world around him). 68.9 s, 12 beats, 8 sets. The premise you can SEE: every footfall on screen pops a gold coin; the HUD is
// Walt's balance. Escalation: personal → work → commute → commerce → everyone rich → prices climb → money means nothing →
// a warm, small ending (he spends 6,212 steps walking to his mom's door).
//
// Sources (checked Oct 26 2026; one real number per beat in the HUD stat line):
//  - 4,774 steps a day: the average U.S. smartphone user — Althoff et al., Nature 547 (2017), 68 M days from 717,527 people
//    in 111 countries (worldwide mean 4,961). pmc.ncbi.nlm.nih.gov/articles/PMC5774986
//  - "10,000 steps": the 1965 manpo-kei ("10,000-step meter") pedometer from Yamasa Tokei, Japan — a marketing number, not
//    a clinical one (skeptic.org.uk, Dec 2025; Lee et al., JAMA Intern Med 2019: mortality benefits level off ≈ 7,500)
//  - 1 mile ≈ 2,000 walking steps (the common rule of thumb; 2,000–2,500 by stride length)
//  - walking to work: ≈ 3 % of U.S. workers since 2005, lower since 2020 (Census ACS, table B08301; 5.6 % in 1980)
//  - a letter carrier: ~10 miles / ~25,000 steps a day (USPS Link, Jan 9 2024 "Miles of smiles"; KJRH Tulsa)
//  - a marathon ≈ 50,000 running steps (guides: 40,000–60,000); tiptoed in 20 cm steps: 42,195 m / 0.2 m = 210,975 (our math)
//  - bread: $1.83 a pound, U.S. city average, September 2026 (BLS series APU0000702111, via FRED, updated Oct 14 2026)
//  - exercise: 22.9 % of U.S. adults meet both activity guidelines (CDC NCHS National Health Statistics Reports, June 2018)
//  - Germany 1923: a loaf of bread cost 250 marks in January and ~200 billion marks in November (Weimar hyperinflation)
//
// Shot list (seconds)                              | set     | what happens
//  0.0– 6.0  kitA    MONDAY 7:02 (quiet open)        | kitchen | Walt yawns at the table; at 4.3 his phone buzzes on the table
//  6.0– 8.0  phone   POV                              | kitchen | the screen: "You now earn $1 for every step."
//  8.0–13.2  kitB                                    | kitchen | he stands; ONE step → a coin + "+$1" (music enters); a second; then power-laps the table
// 13.2–18.4  office  +1 HOUR                          | office  | 7 workers lap the desk in sync; the chairs spin; the papers lift into a whirlwind
// 18.4–23.6  subway  +2 HOURS                         | subway  | the whole car marches in place, holding the bars; the car bounces on the stomps
// 23.6–28.8  lot     +1 DAY                           | car lot | every sticker says FREE; Honest Bob offers keys, people walk past; the tube man collapses
// 28.8–34.0  mail    +1 WEEK                          | suburb  | the mail carrier power-walks her route in a coin shower; a dog bursts out and chases her
// 34.0–39.2  race    +1 MONTH                         | street  | the marathon pack tiptoes in tiny steps, 3 m past START; the race clock flies
// 39.2–44.4  market  +3 MONTHS                        | market  | shoppers lap the aisles; the bread sign climbs $1.83 → $40; the shelves empty
// 44.4–49.6  couch   +6 MONTHS                        | living  | Uncle Ron rocks three times, POOF (dust), stands, first step → coin
// 49.6–55.0  barrow  +1 YEAR                          | street  | Walt wheels a barrow of cash to the bakery (BREAD $4,000); it tips — a cash avalanche
// 55.0–59.4  walk    +1 YEAR · SUNDAY                 | suburb  | Walt walks across town, long lens, a coin at every step
// 59.4–68.9  door                                     | suburb  | he knocks; Mom opens; the hug. HUD stat turns gold. Fade 64.3, end card 64.9
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, walkLegs, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, L1, L2, ANKLE, STEP_A } from '@engine/rig.js';
import { makePhone, makeMug, makeDog } from '@engine/props.js';
import { makeSpritePool } from '@engine/sets/tech.js';
import { buildKitchen } from '@engine/sets/kitchen.js';
import { buildOffice, DIMS as OD } from '@engine/sets/office.js';
import { buildSubway, DIMS as SD } from '@engine/sets/subway.js';
import { buildCarLot } from '@engine/sets/carlot.js';
import { buildSuburb, SW_H } from '@engine/sets/suburb.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildSupermarket } from '@engine/sets/supermarket.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';

const PI = Math.PI;
const STEP = 2 * STEP_A;                       // one footfall per 0.38 m of gait distance (rig.js)
const STEP1 = 9.275, STEP2 = 10.475;           // Walt's first two footfalls (= story.json HUD rolls)
const OFF = { kit: [0, 0, 0], office: [1500, 0, 0], subway: [-1500, 0, 0], lot: [3000, 0, 0], burb: [-3000, 0, 0],
  street: [4500, 0, 0], mkt: [-4500, 0, 0], liv: [6000, 0, 0] };

export const SHOTS = [
  { t0: 0, t1: 6.0, cam: 'kitA', set: 'kit' },
  { t0: 6.0, t1: 8.0, cam: 'phone', set: 'kit' },
  { t0: 8.0, t1: 13.2, cam: 'kitB', set: 'kit' },
  { t0: 13.2, t1: 18.4, cam: 'office', set: 'office' },
  { t0: 18.4, t1: 23.6, cam: 'subway', set: 'subway' },
  { t0: 23.6, t1: 28.8, cam: 'lot', set: 'lot' },
  { t0: 28.8, t1: 34.0, cam: 'mail', set: 'burb' },
  { t0: 34.0, t1: 39.2, cam: 'race', set: 'street' },
  { t0: 39.2, t1: 44.4, cam: 'market', set: 'mkt' },
  { t0: 44.4, t1: 49.6, cam: 'couch', set: 'liv' },
  { t0: 49.6, t1: 55.0, cam: 'barrow', set: 'street' },
  { t0: 55.0, t1: 59.4, cam: 'walk', set: 'burb' },
  { t0: 59.4, t1: 64.9, cam: 'door', set: 'burb' },
  { t0: 64.9, t1: 68.9, cam: 'door', set: 'burb' },   // under the end card (black)
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- choreography numbers shared by poses + cameras
const MAIL_T0 = 28.8;
const mailX = (t) => { const u = Math.max(0, t - MAIL_T0), v = Math.max(0, u - 2.4); return -6.4 + 1.35 * u + 0.45 * v * v; };   // speeds up when the dog shows up
const WALK_X0 = -31.0, WALK_V = 1.35;                                                                                       // Sunday walk (suburb, +x)
const walkX = (t) => WALK_X0 + WALK_V * (t - 55.0);

// camera coords are LOCAL to the shot's set. p/a = [start, end]; fn(t) overrides for tracking shots.
export const CAMS = {
  kitA:   { p: [[0.95, 1.32, 1.75], [0.8, 1.28, 1.35]], a: [[0.4, 0.98, -1.0], [0.4, 0.98, -1.05]], fov: 46, amp: 0.004 },
  phone:  { p: [[0.42, 0.99, -0.71], [0.42, 0.97, -0.70]], a: [[0.42, 0.755, -0.615], [0.42, 0.755, -0.615]], fov: 40, amp: 0.0012 },
  kitB:   { p: [[2.5, 1.5, 2.3], [2.4, 1.45, 2.1]], a: [[0.7, 1.15, -1.0], [0.75, 1.12, -0.8]], fov: 54, amp: 0.004 },
  office: { p: [[2.55, 2.45, 2.3], [2.4, 2.35, 2.15]], a: [[-0.3, 0.8, -1.1], [-0.3, 0.8, -1.1]], fov: 64, amp: 0.004 },
  subway: { p: [[0.15, 1.6, 7.6], [0.1, 1.55, 6.9]], a: [[0.0, 1.25, -3.0], [0.0, 1.25, -3.0]], fov: 52, amp: 0.004 },
  lot:    { p: [[0.8, 1.5, 8.2], [0.9, 1.45, 7.6]], a: [[1.2, 1.45, 0.5], [1.25, 1.45, 0.5]], fov: 54, amp: 0.004 },
  mail:   { fn: (t) => ({ p: [mailX(t) - 0.1, 1.15, 6.2], a: [mailX(t) - 0.6, 0.95, -1.4] }), fov: 42, amp: 0.004 },
  race:   { p: [[3.4, 1.2, 3.5], [2.2, 1.16, 3.5]], a: [[-3.0, 1.2, 3.5], [-3.0, 1.2, 3.5]], fov: 44, amp: 0.004 },
  market: { p: [[0.35, 1.75, 3.6], [0.3, 1.7, 2.9]], a: [[0.15, 1.45, -8.0], [0.15, 1.45, -8.0]], fov: 54, amp: 0.004 },
  couch:  { p: [[1.35, 1.35, 1.75], [1.4, 1.32, 1.35]], a: [[1.8, 1.02, -2.0], [1.8, 1.1, -2.0]], fov: 50, amp: 0.004 },
  barrow: { p: [[0.5, 1.4, 3.9], [0.45, 1.38, 3.5]], a: [[-0.3, 1.1, -2.0], [-0.1, 1.1, -2.0]], fov: 50, amp: 0.004 },
  walk:   { fn: (t) => ({ p: [WALK_X0 + 9.0 + 0.55 * (t - 55.0), 1.45, -0.4], a: [walkX(t), 1.25, -1.0] }), fov: 30, amp: 0.004 },   // he gains on the lens (8.9 m → 5.4 m)
  door:   { p: [[-15.3, 1.62, -4.6], [-16.05, 1.66, -6.0]], a: [[-17.95, 1.55, -7.0], [-18.2, 1.78, -8.05]], fov: 40, amp: 0.004 },
};

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const TABLE_A = A(-0.85, 0.05, -1.05, 0.3), TABLE_B = A(-0.85, 0.05, -1.05, -0.3);     // forearms on the table
const UP_A = A(-2.8, 0.35, -0.35), UP_B = A(-2.8, 0.35, -0.35);                           // big stretch / cheer
const BAR_UP = A(-0.15, 2.7, -0.3);                                                       // holding the overhead bar
const PHONE_B = A(-1.05, 0.5, -2.55, -0.35);                                              // phone to the ear (002)
const KEYS_B = A(-1.35, 0.15, -0.25, -0.1);                                               // holding out car keys
const SHRUG_A = A(-0.25, 0.65, -1.35, -0.4), SHRUG_B = A(-0.25, 0.65, -1.35, 0.4);
const CLAP_A = A(-1.2, 0.32, -0.95, 0.5), CLAP_B = A(-1.2, 0.32, -0.95, -0.5);
const SIGN_A = A(-2.45, 0.3, -0.55, 0.3), SIGN_B = A(-2.45, 0.3, -0.55, -0.3);
const BARROW_A = A(-0.45, 0.14, -0.22, 0.1), BARROW_B = A(-0.45, 0.14, -0.22, -0.1);
const HUG_A = A(0, 1.5, -1.45, 0.93), HUG_B = A(0, 1.2, -1.45, -0.93);   // sx 0 + sz ≈ π/2 + twist ±0.93 = forearms wrap inward, level
const KNOCK_B = A(-1.3, 0.12, -1.5, -0.4);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const pump = (ph, s, amp = 0.55) => A(-0.25 + s * amp * Math.sin(ph), 0.12, -1.55);         // power-walk arms (elbows at 90°)

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a, 0x3a4a3a];
const SHIRTS = [0xf4f4f2, 0xcfe0f2, 0xf2e6cf, 0xd8e8d0, 0xe8d8e8, 0xbfd6ea];               // office
const SPORT = [0xff5a4a, 0x2fb8e0, 0xf2c230, 0x58c35a, 0xff7ab0, 0x9a6ae0, 0xff9a2a];        // marathon tops
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

// local copy of rig.js's 2-bone leg IK (019 did the same) → custom gaits: marching in place, tiptoeing
function legIK(leg, dz, dy) {
  let d = Math.hypot(dz, dy); d = Math.min(d, L1 + L2 - 1e-4);
  const gamma = Math.atan2(dz, -dy);
  const alpha = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const beta = PI - Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  leg.hip.rotation.x = -(gamma + alpha); leg.knee.rotation.x = beta; leg.ankle.rotation.x = gamma + alpha - beta;
}
/** a gait you drive by phase: p.gait = {ph, fz (stride half-length), lift}. p.dist is set from ph so coins land on footfalls. */
const gaitPose = (p, ph, fz, lift) => { p.gait = { ph, fz, lift }; p.dist = ph * STEP / PI; p.speed = 0; return p; };

/** loop around a rectangle [x0, z0, x1, z1] by distance s (front edge +x, right edge −z, back −x, left +z), corners eased */
function loopAt(s, [x0, z0, x1, z1]) {
  const w = x1 - x0, d = z1 - z0, P = 2 * (w + d), E = [[w, PI / 2], [d, PI], [w, -PI / 2], [d, 0]];
  s = ((s % P) + P) % P;
  const start = [[x0, z1], [x1, z1], [x1, z0], [x0, z0]], dir = [[1, 0], [0, -1], [-1, 0], [0, 1]];
  for (let i = 0; i < 4; i++) {
    if (s <= E[i][0] || i === 3) {
      const [sx, sz] = start[i], h = E[i][1], hn = E[(i + 1) % 4][1], near = clamp((s - (E[i][0] - 0.35)) / 0.7);
      return [sx + dir[i][0] * s, sz + dir[i][1] * s, lerpAngle(h, hn, near * 0.5)];
    }
    s -= E[i][0];
  }
}

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(7, 2);
  const office = buildOffice(studio, {}); office.root.position.set(...OFF.office);
  const sub = buildSubway(studio, {}); sub.root.position.set(...OFF.subway);
  const lot = buildCarLot(studio, {}); lot.root.position.set(...OFF.lot);
  const burb = buildSuburb(studio, { poleClear: [-18.2, -16, -24, -28, 0] }); burb.root.position.set(...OFF.burb);
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const mkt = buildSupermarket(studio, {}); mkt.root.position.set(...OFF.mkt);
  const liv = buildLivingRoom(studio, {}); liv.root.position.set(...OFF.liv); liv.setMode('evening');
  const ROOTS = { kit: kit.root, office: office.root, subway: sub.root, lot: lot.root, burb: burb.root, street: street.root, mkt: mkt.root, liv: liv.root };
  const FOGS = { kit: null, office: null, subway: null, lot: lot.fog, burb: burb.fog, street: streetFog, mkt: null, liv: null };
  const FAR = { kit: 40, office: 60, subway: 60, lot: 340, burb: 420, street: 400, mkt: 80, liv: 40 };
  const L = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- cast
  const R = rng(23);
  const person = (o) => { const p = makePerson(o); scene.add(p.root); return p; };
  const walt = person({ skin: 0xf0c4a0, top: 0xe2b23a, collar: 0xf5f0e2, pants: 0x34405c, shoes: 0x5a3a24, hair: 0xb5642e, hairStyle: 'messy', glasses: true, mustache: 0x8a4a22 });
  const crowd = Array.from({ length: 20 }, (_, i) => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const p = person({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[i % TOPS.length], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.22, mustache: style !== 'bob' && R() < 0.25 ? HAIRS[Math.floor(R() * 3)] : null });
    p.seed = R(); p.base = { top: TOPS[i % TOPS.length] }; return p;
  });
  const outfit = (rig, top, pants) => { rig.mats.top.color.setHex(top); if (pants !== undefined) rig.mats.pants.color.setHex(pants); };
  const bob = person({ skin: 0xf0c8a8, top: 0x8ccf3a, collar: 0xf4f4f2, pants: 0x6b5a48, hair: 0x4a3020, hairStyle: 'short', mustache: 0x4a3020 });
  mk(new THREE.BoxGeometry(0.05, 0.24, 0.02), mat(0x2f6aa8, 0.5), bob.spine, 0, 0.41, 0.135).rotation.x = -0.12;   // tie
  const keys = new THREE.Group(); bob.arms.find((a) => a.s === 1).hand.add(keys); keys.position.set(0, -0.07, 0.02);
  mk(new THREE.TorusGeometry(0.022, 0.005, 6, 14), mat(0xd8b44a, 0.3, { metalness: 0.7 }), keys);
  mk(new THREE.BoxGeometry(0.02, 0.06, 0.006), mat(0xb8bcc2, 0.3, { metalness: 0.7 }), keys, 0, -0.045, 0);
  mk(new THREE.BoxGeometry(0.035, 0.05, 0.015), mat(0x1d1d22, 0.5), keys, 0.02, -0.03, 0);
  const carrier = person({ skin: 0x9a6447, top: 0x8fb0d6, collar: 0x2f3f5f, pants: 0x2f3f5f, hair: 0x1a1a1a, hairStyle: 'bob' });
  const cap = new THREE.Group(); carrier.head.g.add(cap); cap.position.set(0, 0.075, 0.0);
  mk(new THREE.CylinderGeometry(0.13, 0.14, 0.08, 18), mat(0x2f3f5f, 0.6), cap, 0, 0.03, 0);
  mk(new THREE.BoxGeometry(0.2, 0.012, 0.11), mat(0x1d2a40, 0.6), cap, 0, -0.005, 0.15);
  const bag = mk(new THREE.BoxGeometry(0.12, 0.3, 0.36), mat(0x7a5236, 0.8), carrier.pelvis, 0.24, 0.02, 0.0);
  mk(new THREE.BoxGeometry(0.02, 0.6, 0.03), mat(0x5a3a26, 0.8), carrier.spine, 0.0, 0.3, 0.13).rotation.z = 0.75;   // strap
  for (let k = 0; k < 4; k++) mk(new THREE.BoxGeometry(0.004, 0.08, 0.13), mat(0xfbf8f0, 0.8), bag, -0.01 + k * 0.012, 0.18, -0.06 + k * 0.03);
  const ron = person({ skin: 0xf3d0b5, top: 0xf2f0ea, pants: 0x8a8f96, hair: 0x9a9690, hairStyle: 'none', mustache: 0x9a9690, headR: 0.145 });
  const remote = mk(new THREE.BoxGeometry(0.04, 0.02, 0.14), mat(0x1d1d22, 0.5), ron.arms.find((a) => a.s === 1).hand, 0, -0.04, 0.04);
  const mom = person({ skin: 0xf1c3a1, top: 0x9a6a8a, collar: 0xf4efe6, pants: 0x5a4a5a, hair: 0xe0dcd6, hairStyle: 'bob', glasses: true });
  const dog = makeDog({ color: 0x8a5a32, patch: 0xf2e6cf }); scene.add(dog.g);
  // marathon bibs (one per crowd rig, shown only in the race)
  const bibs = crowd.map((c, i) => {
    const tx = canvasTex(128, 96, (g, w, h) => { g.fillStyle = '#fbfbf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#d2283f'; g.fillRect(0, 0, w, 18); g.fillStyle = '#1d1d22'; g.font = 'bold 54px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(100 + ((i * 37) % 900)), w / 2, 58); });
    const b = mk(new THREE.PlaneGeometry(0.2, 0.15), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.8 }), c.spine, 0, 0.3, 0.142); b.visible = false; return b;
  });
  const bands = crowd.map((c, i) => { const b = mk(new THREE.TorusGeometry(0.128, 0.018, 6, 20), mat(SPORT[(i + 3) % SPORT.length], 0.7), c.head.g, 0, 0.06, 0); b.rotation.x = PI / 2 - 0.15; b.visible = false; return b; });
  const ALL = [walt, ...crowd, bob, carrier, ron, mom];

  // ---------------------------------------------------------------- props
  const phone = makePhone(); kit.root.add(phone.g); phone.g.position.set(0.42, 0.752, -0.62); phone.g.rotation.y = PI;
  const screenTex = (card) => canvasTex(360, 720, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1d2f5a'); gr.addColorStop(1, '#5a3a78'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.92)'; g.textAlign = 'center'; g.font = '300 116px Helvetica, Arial, sans-serif'; g.fillText('7:02', w / 2, 170);
    g.font = '500 30px Helvetica, Arial, sans-serif'; g.fillText('Monday, October 26', w / 2, 220);
    if (!card) return;
    g.fillStyle = '#e9e5dc'; g.beginPath(); g.roundRect(16, 262, w - 32, 262, 26); g.fill();
    g.fillStyle = '#7a7a80'; g.font = '600 21px Helvetica, Arial, sans-serif'; g.textAlign = 'left'; g.fillText('EVERY PHONE · now', 36, 302);
    g.fillStyle = '#16161c'; g.font = 'bold 43px Helvetica, Arial, sans-serif';
    ['You now earn', '$1 for every', 'step you take.'].forEach((s, k) => g.fillText(s, 36, 362 + k * 52));
    g.fillStyle = '#b8841a'; g.fillText('$1', 36, 414);
  });
  const scrA = screenTex(false), scrB = screenTex(true);
  const scrMesh = phone.g.children.find((o) => o.material === phone.screenMat); const scrM = new THREE.MeshBasicMaterial({ map: scrA, color: 0x0a0d14 }); scrMesh.material = scrM;
  const mug = makeMug(0x3d7bd9); kit.root.add(mug); mug.position.set(0.78, 0.752, -0.7);

  // gold coins: one pops out of every footfall on screen (instanced, camera-independent)
  const COINS = 900;
  const coinFace = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w * 0.4, h * 0.38, 6, w / 2, h / 2, w / 2); gr.addColorStop(0, '#ffe9a0'); gr.addColorStop(0.7, '#f2c14e'); gr.addColorStop(1, '#b8861e');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = '#a8761a'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke();
    g.fillStyle = '#a8761a'; g.font = 'bold 76px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 64, 68);
  });
  const coinGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.012, 24); coinGeo.rotateX(PI / 2);
  const goldSide = new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.3, metalness: 0.65, emissive: 0x6a4a08, emissiveIntensity: 0.7 });
  const goldFace = new THREE.MeshStandardMaterial({ map: coinFace, roughness: 0.32, metalness: 0.55, emissive: 0xffffff, emissiveMap: coinFace, emissiveIntensity: 0.35 });
  const coins = new THREE.InstancedMesh(coinGeo, [goldSide, goldFace, goldFace], COINS); coins.frustumCulled = false; scene.add(coins);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _v = new THREE.Vector3();
  let coinN = 0;
  function coinAt(pos, age, spin, size = 1.3) {
    if (coinN >= COINS) return;
    const k = Math.min(1, age / 0.07) * (age > 0.5 ? Math.max(0, 1 - (age - 0.5) / 0.2) : 1);
    _v.copy(pos); _v.y += 0.1 + 1.9 * age - 1.7 * age * age;
    _q.setFromEuler(_e.set(0, spin + age * 13, 0)); _s.setScalar(Math.max(1e-4, k * size));
    _m.compose(_v, _q, _s); coins.setMatrixAt(coinN++, _m);
  }
  /** coins for one walker: samples its (pure) pose function back in time and pops a coin at every footfall in the last 0.7 s */
  function trail(t, key, fn, o = {}) {
    const S = 10, dt = 0.075, sc = o.scale ?? 1;
    let prev = null, prevT = 0;
    for (let j = S; j >= 0; j--) {
      const tau = t - j * dt, p = fn(tau); if (!p) { prev = null; continue; }
      if (prev) {
        const c0 = Math.floor((prev.dist + STEP_A) / STEP), c1 = Math.floor((p.dist + STEP_A) / STEP);
        for (let k = c0 + 1; k <= c1; k++) {
          const f = clamp((k * STEP - STEP_A - prev.dist) / Math.max(1e-6, p.dist - prev.dist)), tk = lerp(prevT, tau, f), age = t - tk;
          if (age < 0 || age > 0.7) continue;
          const x = lerp(prev.x, p.x, f), z = lerp(prev.z, p.z, f), ry = p.rotY, s = k % 2 ? -1 : 1;   // odd footfall = leg 0 (−x side)
          const lx = s * 0.09 * sc, lz = (p.gait ? p.gait.fz : STEP_A) * sc;
          const wx = x + Math.cos(ry) * lx + Math.sin(ry) * lz, wz = z - Math.sin(ry) * lx + Math.cos(ry) * lz;
          coinAt(L(key, wx, (p.floor || 0), wz), age, k * 1.7 + (o.seed || 0), o.size ?? 1.3);
        }
      }
      prev = p; prevT = tau;
    }
  }

  // "+$1" pop (Walt's first steps, Ron's first step)
  const plusTex = canvasTex(256, 128, (g, w, h) => { g.font = 'bold 92px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = 'rgba(60,36,0,.85)'; g.strokeText('+$1', w / 2, h / 2 + 4); g.fillStyle = '#f7cf5a'; g.fillText('+$1', w / 2, h / 2 + 4); });
  const pluses = [0, 1].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: plusTex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false })); s.renderOrder = 10; s.visible = false; scene.add(s); return s; });
  let plusN = 0;
  function plusOne(t, t0, pos, size = 0.34) {
    const age = t - t0; if (age < 0 || age > 1.1 || plusN >= pluses.length) return;
    const s = pluses[plusN++], k = Math.min(1, age / 0.12), boing = 1 + 0.25 * Math.sin(Math.min(1, age / 0.35) * PI) * (1 - Math.min(1, age / 0.35));
    s.visible = true; s.position.copy(pos); s.position.y += 0.75 + 0.4 * age; s.scale.set(size * k * boing, size * 0.5 * k * boing, 1);
    s.material.opacity = age > 0.8 ? 1 - (age - 0.8) / 0.3 : 1;
  }

  // dust puffs (couch POOF, tube man, the barrow tip, subway stomps)
  const puffs = makeSpritePool(scene, 60, 'smoke'); const puffCol = new THREE.Color(0xf4ede0);
  let puffN = 0;
  function dust(t, t0, pos, s = 1, n = 5, dur = 1.0) {
    const age = t - t0; if (age < 0 || age > dur) return;
    for (let k = 0; k < n && puffN < puffs.items.length; k++) {
      const a = t0 * 3.7 + k * (2 * PI / n), r = (0.15 + age * 0.9) * s;
      puffs.set(puffN++, _v.set(pos.x + Math.cos(a) * r, pos.y + 0.05 * k + age * 0.35 * s, pos.z + Math.sin(a) * r * 0.6).clone(), (0.35 + age * 1.1) * s, 0.8 * (1 - age / dur) ** 1.4, puffCol);
    }
  }

  // office: the two chairs (they spin as the lap traffic brushes past) + 36 papers lifting off the desk into a whirlwind
  const offChairs = office.root.children.filter((o) => o.isGroup && Math.abs(o.position.x) < 1e-6 && (Math.abs(o.position.z - OD.boss[1]) < 1e-6 || Math.abs(o.position.z - OD.guest[1]) < 1e-6));
  const PAPERS = 36, papers = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.21, 0.297), new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.85, side: THREE.DoubleSide }), PAPERS);
  papers.frustumCulled = false; office.root.add(papers);
  const PR = rng(5), paperSeeds = Array.from({ length: PAPERS }, () => [PR(), PR(), PR(), PR()]);

  // subway: nothing extra (the car itself bounces)
  // car lot: every sticker → FREE
  const freeTex = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#ffe14a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d2283f'; g.lineWidth = 10; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#d2283f'; g.font = 'bold 92px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FREE', w / 2, h / 2 + 6); });
  lot.cars.forEach((c) => { c.sticker.material.map = freeTex; c.sticker.material.needsUpdate = true; });
  lot.tube.position.set(1.6, 0, 1.4);
  const bobSign = lot.root.children.find((o) => o.isGroup && Math.abs(o.position.x + 3.5) < 1e-6 && Math.abs(o.position.z + 12.5) < 1e-6); if (bobSign) bobSign.position.set(4.0, 0, -13.0);
  lot.cars.filter((c) => Math.abs(c.z - lot.D.row1) < 0.01).forEach((c) => {
    const a = new THREE.Group(); a.position.set(c.x, 0, c.z + 2.35); lot.root.add(a);
    const pl = mk(new THREE.PlaneGeometry(0.95, 0.6), new THREE.MeshStandardMaterial({ map: freeTex, roughness: 0.7 }), a, 0, 0.62, 0.02); pl.rotation.x = -0.18;
    mk(new THREE.BoxGeometry(0.98, 0.66, 0.03), mat(0x2a2a2e, 0.6), a, 0, 0.62, -0.01).rotation.x = -0.18;
    for (const sx of [-0.4, 0.4]) mk(new THREE.BoxGeometry(0.04, 0.95, 0.04), mat(0x2a2a2e, 0.6), a, sx, 0.45, -0.1).rotation.x = 0.18;
  });
  const tubeChain = []; { let s = lot.tube.children.find((o) => o.isGroup); while (s) { tubeChain.push(s); s = s.children.find((o) => o.isGroup && o.children.some((m) => m.isMesh && m.geometry.type === 'CylinderGeometry')); } }

  // street: START banner + race clock + spectators' signs + a folding chair; the bakery sign + the wheelbarrow of cash
  const raceG = new THREE.Group(); street.root.add(raceG);
  const startTex = canvasTex(1024, 200, (g, w, h) => { g.fillStyle = '#1d3a7a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = 'bold 128px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('START', w / 2, h / 2 + 6); g.fillStyle = '#f2c14e'; g.fillRect(0, h - 18, w, 18); });
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.25), new THREE.MeshStandardMaterial({ map: startTex, roughness: 0.7, side: THREE.DoubleSide })); banner.position.set(-4.6, 3.45, 3.5); banner.rotation.y = PI / 2; raceG.add(banner);
  for (const z of [0.1, 6.9]) mk(new THREE.CylinderGeometry(0.08, 0.08, 4.1, 10), mat(0xd8dce0, 0.4, { metalness: 0.4 }), raceG, -4.6, 2.05, z);
  const clockCan = document.createElement('canvas'); clockCan.width = 512; clockCan.height = 200;
  const clockTex = new THREE.CanvasTexture(clockCan); clockTex.colorSpace = THREE.SRGBColorSpace;
  let clockLast = '';
  const drawClock = (s) => { if (s === clockLast) return; clockLast = s; const g = clockCan.getContext('2d'); g.fillStyle = '#101216'; g.fillRect(0, 0, 512, 200); g.fillStyle = '#9aa0a8'; g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('RACE TIME', 256, 50); g.fillStyle = '#ffd24a'; g.font = 'bold 104px Courier New, monospace'; g.fillText(s, 256, 160); clockTex.needsUpdate = true; };
  const clockBox = new THREE.Group(); clockBox.position.set(-4.5, 0, 2.95); raceG.add(clockBox);
  mk(new THREE.BoxGeometry(0.08, 2.2, 0.08), mat(0x3a3d42, 0.5), clockBox, 0, 1.1, 0);
  mk(new THREE.BoxGeometry(0.16, 0.66, 1.5), mat(0x1d1f24, 0.5), clockBox, 0, 2.45, 0);
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.55), new THREE.MeshBasicMaterial({ map: clockTex, toneMapped: false }));
  clockFace.position.set(0.081, 2.45, 0); clockFace.rotation.y = PI / 2; clockBox.add(clockFace);
  const signTex = (txt, bg = '#fffaf0', fg = '#d2283f') => canvasTex(256, 160, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = 'bold 52px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const ls = txt.split('\n'); ls.forEach((s, k) => g.fillText(s, w / 2, h / 2 + (k - (ls.length - 1) / 2) * 56)); });
  const fanSigns = ['GO\nSLOWER!', 'TINY\nSTEPS!'].map((txt) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), new THREE.MeshStandardMaterial({ map: signTex(txt), roughness: 0.8, side: THREE.DoubleSide })); raceG.add(s); return s; });
  // (spectators stand beyond the START line, where the long lens still sees the road edges)

  const bakeG = new THREE.Group(); street.root.add(bakeG);
  const pickles = street.root.children.find((o) => o.isMesh && Math.abs(o.position.x + 1.4) < 1e-6 && Math.abs(o.position.y - 1.5) < 1e-6);
  const nearTrees = street.trees.filter((tr) => Math.abs(tr.t.position.x) < 4.5);
  const priceCard = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.78), new THREE.MeshStandardMaterial({ map: canvasTex(400, 240, (g, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d2283f'; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#3a2a1a'; g.font = 'bold 54px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('BREAD', w / 2, 82); g.fillStyle = '#d2283f'; g.font = 'bold 92px Helvetica, Arial, sans-serif'; g.fillText('$4,000', w / 2, 186); }), roughness: 0.7, emissive: 0xffffff, emissiveIntensity: 0.08 }));
  priceCard.position.set(-0.2, 1.75, -2.93); bakeG.add(priceCard);
  const barrow = new THREE.Group(); bakeG.add(barrow);                                   // pivot = the wheel axle; tray toward −x (behind the wheel)
  const bm = mat(0x3d8a5a, 0.5), steel = mat(0x8a8f96, 0.4, { metalness: 0.5 });
  const tray = new THREE.Group(); barrow.add(tray); tray.position.set(-0.55, 0.52, 0);
  mk(new THREE.BoxGeometry(0.9, 0.04, 0.62), bm, tray, 0, -0.18, 0);
  for (const s of [-1, 1]) { const w = mk(new THREE.BoxGeometry(0.98, 0.36, 0.04), bm, tray, 0, 0, s * 0.33); w.rotation.x = s * 0.2; }
  for (const s of [-1, 1]) { const w = mk(new THREE.BoxGeometry(0.04, 0.36, 0.7), bm, tray, s * 0.48, 0, 0); w.rotation.z = -s * 0.25; }
  const wheel = mk(new THREE.TorusGeometry(0.17, 0.05, 8, 18), mat(0x1d1d22, 0.8), barrow, 0, 0.22, 0);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), steel, barrow, 0, 0.22, 0).rotation.x = PI / 2;
  for (const s of [-1, 1]) { const h = mk(new THREE.CylinderGeometry(0.02, 0.02, 1.55, 8), steel, barrow, -0.75, 0.42, s * 0.24); h.rotation.z = PI / 2 + 0.2; mk(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 6), steel, barrow, -0.95, 0.17, s * 0.24); }
  const BILLS = 320, billTex = canvasTex(128, 56, (g, w, h) => { g.fillStyle = '#9fc48a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3f6a3a'; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#3f6a3a'; g.beginPath(); g.arc(w / 2, h / 2, 15, 0, 7); g.fill(); g.font = 'bold 22px Helvetica, Arial, sans-serif'; g.fillText('100', 10, 24); });
  const bills = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.155, 0.068), new THREE.MeshStandardMaterial({ map: billTex, roughness: 0.85, side: THREE.DoubleSide }), BILLS);
  bills.frustumCulled = false; bakeG.add(bills);
  const BR = rng(9), billSeeds = Array.from({ length: BILLS }, () => [BR(), BR(), BR(), BR(), BR(), BR()]);

  // supermarket: a hanging BREAD price sign (redrawn as the price climbs) + loaves on the shelf
  const priceCan = document.createElement('canvas'); priceCan.width = 512; priceCan.height = 300;
  const priceTex = new THREE.CanvasTexture(priceCan); priceTex.colorSpace = THREE.SRGBColorSpace;
  let priceLast = '';
  const drawPrice = (s) => { if (s === priceLast) return; priceLast = s; const g = priceCan.getContext('2d'); g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 512, 300); g.strokeStyle = '#d2283f'; g.lineWidth = 16; g.strokeRect(8, 8, 496, 284); g.fillStyle = '#3a2a1a'; g.font = 'bold 64px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('BREAD', 256, 92); g.fillStyle = '#d2283f'; g.font = 'bold 132px Helvetica, Arial, sans-serif'; g.fillText(s, 256, 236); priceTex.needsUpdate = true; };
  drawPrice('$1.83');
  const priceSign = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.73), new THREE.MeshBasicMaterial({ map: priceTex, toneMapped: false, side: THREE.DoubleSide, color: 0xe8e8e8 }));
  priceSign.position.set(1.05, 2.55, -2.6); priceSign.rotation.y = -0.35; mkt.root.add(priceSign);
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.006, 0.006, 1.6, 4), mat(0x444444, 0.5), mkt.root, 1.05 + s * 0.55 * Math.cos(0.35), 3.7, -2.6 + s * 0.55 * Math.sin(0.35));
  const loaves = new THREE.Group(); mkt.root.add(loaves);
  for (let k = 0; k < 10; k++) { const lf = mk(new THREE.CapsuleGeometry(0.07, 0.18, 4, 10), mat(0xc98a4a, 0.75), loaves, 1.42, 1.17 + (k % 2) * 0.0, -1.6 - k * 0.26); lf.rotation.x = PI / 2; lf.scale.set(1.2, 1, 0.85); }

  // ---------------------------------------------------------------- helpers
  function put(rig, key, p) {
    if (!p) { rig.root.visible = false; return; }
    const q = { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2] };
    applyPose(rig, q);
    if (p.gait) rig.legs.forEach((leg, i) => { const phi = p.gait.ph + (i ? PI : 0); legIK(leg, p.gait.fz * Math.sin(phi) + (p.footFwd || 0), ANKLE + p.gait.lift * Math.max(0, Math.cos(phi)) + (p.floor || 0) - (p.y || 0) - leg.hip.position.y); });
    rig.root.visible = p.visible !== false;
  }
  const seatY = (top) => -0.375 + (top - 0.42);

  // ---------------------------------------------------------------- performances (pure: f(t) → pose; the coin trail re-samples them)
  // KITCHEN — Walt at the back chair (faces +z) → stands → step 1 (+x) → step 2 → power-laps the table
  const KX = 0.4, KZ = -1.13, LAPS = [[1.4, -1.58], [-1.1, -1.58], [-1.1, 1.0], [1.75, 1.0], [1.75, -1.58], [-1.1, -1.58], [-1.1, 1.0], [1.75, 1.0]];
  function waltKitchen(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    if (t < 8.6) {
      const up = K(t, [[8.15, 0], [8.6, 1]]);
      Object.assign(p, { x: KX, z: KZ - 0.04 * up, rotY: 0, y: lerp(seatY(0.47), 0, up), footFwd: 0.42 * (1 - up), lean: 0.12 * (1 - up) });
      const yawn = K(t, [[0.5, 0], [1.1, 1], [2.3, 1], [2.9, 0]]);
      p.armA = mixArm(TABLE_A, UP_A, yawn); p.armB = mixArm(TABLE_B, UP_B, yawn);
      if (yawn > 0.3) { p.mouth = 'o'; p.eyes = 'closed'; p.headPitch = -0.25 * yawn; }
      const sip = K(t, [[2.9, 0], [3.35, 1], [4.05, 1], [4.4, 0]]);
      p.armB = mixArm(p.armB, A(-1.25, 0.32, -2.25, -0.75), sip); if (sip > 0.6) { p.headPitch = -0.12; p.eyes = 'closed'; }
      const look = K(t, [[4.5, 0], [4.8, 1], [7.6, 1], [8.0, 0]]);
      p.headPitch = lerp(p.headPitch, 0.55, look); p.lean += 0.12 * look;
      if (t > 4.6 && t < 8.0) p.mouth = 'o';
      p.armA = mixArm(p.armA, REST, up); p.armB = mixArm(p.armB, REST, up);
      return p;
    }
    const w = walkLegs(t, [KX, KZ - 0.04], [{ t0: 8.95, t1: 9.6, pts: [[0.78, KZ - 0.04]] }, { t0: 10.15, t1: 10.8, pts: [[1.16, KZ - 0.04]] }, { t0: 10.95, t1: 22.0, pts: LAPS }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: lerpAngle(0, w.head ?? PI / 2, K(t, [[8.7, 0], [8.95, 1]])) });
    const lap = K(t, [[10.95, 0], [11.4, 1]]);
    if (t > 9.3 && t < 10.15) { p.headPitch = K(t, [[9.3, 0.55], [9.6, 0.55], [9.8, 0.0]]); p.headYaw = K(t, [[9.6, 0], [9.85, -0.9], [10.1, -0.9]]); p.mouth = 'o'; }   // looks at the coin, then at us
    if (t >= 9.6 && t < 10.15) p.mouth = 'smile';
    p.armA = mixArm(REST, pump(w.dist * PI / STEP, 1), lap); p.armB = mixArm(REST, pump(w.dist * PI / STEP, -1), lap);
    p.lean = 0.03 + 0.12 * lap; if (lap > 0.5) p.mouth = 'smile';
    return p;
  }
  // OFFICE — 7 workers lap the desk in perfect sync (same gait phase), one on the phone
  const OLOOP = [-1.3, -2.15, 1.3, 0.4], OV = 1.55;
  function worker(t, i) {
    if (i >= 7) return null;
    const P = 2 * (2.6 + 2.55), s0 = (i / 7) * P, [x, z, ry] = loopAt(s0 + OV * (t - 13.2), OLOOP);
    const p = basePose(); p.eyes = blink(t, i + 2); p.mouth = 'flat';
    Object.assign(p, { x, z, rotY: ry, dist: OV * (t - 13.2) + 4, speed: OV, lean: 0.1 });
    const ph = p.dist * PI / STEP;
    p.armA = pump(ph, 1); p.armB = i === 3 ? PHONE_B : pump(ph, -1);
    if (i === 3) { p.mouth = Math.sin(t * 9) > 0 ? 'o' : 'flat'; }
    return p;
  }
  // SUBWAY — 12 commuters march in place in the aisle, one hand on the bar; the march speeds up
  const SPOTS = [[-0.42, 4.4], [0.42, 4.1], [-0.42, 3.0], [0.42, 2.7], [-0.42, 1.6], [0.42, 1.3], [-0.42, 0.2], [0.42, -0.1], [-0.42, -1.2], [0.42, -1.5], [-0.42, -2.6], [0.42, -2.9]];
  const subPh = (t) => { const u = t - 18.4; return u * 2 * PI * 1.5 + Math.max(0, u - 2.6) ** 2 * 2 * PI * 0.35; };   // 1.5 → 3.3 stomps/s per foot
  function rider(t, i) {
    if (i >= 12) return null;
    const [x, z] = SPOTS[i], p = basePose(); p.eyes = blink(t, i + 1); p.mouth = 'flat';
    Object.assign(p, { x, z, rotY: (x < 0 ? 0.35 : -0.35) + 0.2 * Math.sin(i * 2.1), lean: 0.02 });
    gaitPose(p, subPh(t), 0.03, 0.17);
    const ph = p.gait.ph;
    p.armA = x > 0 ? pump(ph, 1, 0.45) : BAR_UP; p.armB = x > 0 ? BAR_UP : pump(ph, -1, 0.45);
    p.headPitch = -0.05 + 0.04 * Math.sin(ph * 2);
    return p;
  }
  // CAR LOT — Honest Bob holds out keys; three people power-walk past; he gives up
  function passer(t, i) {
    if (i >= 3) return null;
    const p = basePose(); p.eyes = blink(t, i + 4); p.mouth = 'flat';
    const x = -4.4 + 1.65 * (t - 23.6) - i * 1.05, z = 2.6 + (i % 2) * 0.35;
    Object.assign(p, { x, z, rotY: PI / 2, dist: x + 10, speed: 1.65, lean: 0.1 });
    const ph = p.dist * PI / STEP; p.armA = pump(ph, 1); p.armB = pump(ph, -1);
    p.headYaw = i === 0 ? K(t, [[25.4, 0], [25.7, -0.7], [26.2, -0.7], [26.5, 0]]) : 0;   // the first one glances at Bob… keeps walking
    return p;
  }
  function bobPose(t) {
    const p = basePose(); p.eyes = blink(t, 3);
    const lead = -4.4 + 1.65 * (t - 23.6);
    const w = walkLegs(t, [0.2, 1.7], [{ t0: 25.6, t1: 26.6, pts: [[0.95, 1.95]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: clamp(faceToward(w.x, w.z, lead, 2.7), -1.6, 1.6) });
    const give = K(t, [[27.0, 0], [27.5, 1]]);
    p.armB = mixArm(mixArm(REST, KEYS_B, K(t, [[23.9, 0], [24.3, 1]])), REST, give); p.armA = mixArm(REST, A(-0.6, 0.4, -0.9, 0.3), K(t, [[24.4, 0], [24.8, 1]]) * (1 - give));
    p.mouth = give > 0.5 ? 'flat' : 'smile'; p.headPitch = 0.4 * give; p.lean = 0.12 * give;
    if (t > 23.9 && t < 27.0) p.armB.sx += 0.08 * Math.sin(t * 9);
    return p;
  }
  // MAIL — the carrier power-walks +x, then breaks into a run when the dog shows up
  function carrierPose(t) {
    const p = basePose(); p.eyes = blink(t, 5); p.mouth = 'smile';
    const x = mailX(t), u = Math.max(0, t - MAIL_T0), sp = 1.35 + 0.9 * Math.max(0, u - 2.4);
    Object.assign(p, { x, z: -1.0, y: SW_H, floor: SW_H, rotY: PI / 2, dist: x + 10, speed: sp, lean: 0.08 + 0.05 * clamp(sp - 1.35) });
    const ph = p.dist * PI / STEP; p.armA = pump(ph, 1, 0.65); p.armB = pump(ph, -1, 0.65);
    p.headYaw = K(t, [[31.0, 0], [31.3, -1.1], [31.8, -1.1], [32.1, 0]]); if (t > 31.2 && t < 32.0) p.mouth = 'o';
    return p;
  }
  // RACE — 12 runners tiptoe toward the camera (+x) in tiny steps: 7 steps a second, 0.2 m/s
  function runner(t, i) {
    if (i >= 12) return null;
    const row = Math.floor(i / 3), col = i % 3, p = basePose(); p.eyes = blink(t, i); p.mouth = 'flat';
    const x = -2.6 + 0.2 * (t - 34.0) - row * 0.85 + (col % 2) * 0.25, z = 2.4 + col * 0.95 + (row % 2) * 0.3;
    Object.assign(p, { x, z, rotY: PI / 2 + (col - 1) * 0.08, lean: 0.12 });
    gaitPose(p, (t - 34.0) * 2 * PI * 3.5 + i * 0.4, 0.045, 0.06);
    const ph = p.gait.ph; p.armA = pump(ph, 1, 0.35); p.armB = pump(ph, -1, 0.35);
    return p;
  }
  const FANS = [[-8.2, 5.3, 'clap'], [-8.6, 1.7, 'sign0'], [-9.4, 5.8, 'sign1'], [-9.8, 1.3, 'clap'], [-10.6, 5.1, 'clap'], [-11.0, 1.9, 'clap']];
  function fan(t, i) {
    const [x, z, kind] = FANS[i], p = basePose(); p.eyes = blink(t, i + 7);
    Object.assign(p, { x, z, rotY: faceToward(x, z, 3, 3.5) });
    if (kind === 'clap') { const c = Math.abs(Math.sin(t * 7 + i)); p.armA = { ...CLAP_A, sz: CLAP_A.sz + 0.25 * c }; p.armB = { ...CLAP_B, sz: CLAP_B.sz + 0.25 * c }; p.mouth = 'o'; }
    else { p.armA = SIGN_A; p.armB = SIGN_B; p.mouth = 'smile'; p.y += 0.04 * Math.abs(Math.sin(t * 5 + i)); }
    return p;
  }
  // MARKET — 6 shoppers power-walk laps of the center aisle (down the left, back up the right)
  const MLOOP = [-0.55, -9.0, 0.55, 2.4], MV = 1.75;
  function shopper(t, i) {
    if (i >= 6) return null;
    const P = 2 * (1.1 + 11.4), [x, z, ry] = loopAt((i / 6) * P + MV * (t - 39.2) + 1.0, MLOOP);
    const p = basePose(); p.eyes = blink(t, i + 1); p.mouth = 'flat';
    Object.assign(p, { x, z, rotY: ry, dist: MV * (t - 39.2) + i, speed: MV, lean: 0.12 });
    const ph = p.dist * PI / STEP; p.armA = pump(ph, 1); p.armB = pump(ph, -1);
    p.headYaw = (z > -4 && z < -1 && ry < 0.5 && ry > -0.5) ? 0.6 : 0;
    return p;
  }
  // COUCH — Uncle Ron rocks three times, the third gets him up (POOF), one step forward, stares, then grins and marches
  const SOFA = [1.8, -2.0], ROCKS = [[44.9, 0.4], [45.7, 0.55], [46.5, 1]], RON_UP = 46.95, RON_STEP = 47.6;
  function ronPose(t) {
    const p = basePose(); p.eyes = blink(t, 4); p.mouth = 'flat'; p.belly = 0.85;
    const up = K(t, [[46.55, 0], [RON_UP, 1]]);
    let rock = 0; for (const [m, a] of ROCKS) rock = Math.max(rock, a * K(t, [[m - 0.3, 0], [m, 1], [m + 0.3, 0]]));
    if (t < 47.3) {
      Object.assign(p, { x: SOFA[0], z: SOFA[1] + 0.28 * up, rotY: 0, y: lerp(seatY(0.42), 0, up), footFwd: 0.42 * (1 - up), lean: -0.18 * (1 - up) + 0.55 * rock * (1 - up) + 0.1 * up });
      p.armA = mixArm(A(-0.5, 0.2, -0.7, 0.3), A(-1.0, 0.3, -0.3), rock); p.armB = mixArm(A(-0.75, 0.15, -1.1, -0.2), A(-1.0, 0.3, -0.3), rock);
      if (up > 0.5) { p.mouth = 'o'; p.armA = mixArm(p.armA, SHRUG_A, up); p.armB = mixArm(p.armB, SHRUG_B, up); }
      return p;
    }
    const w = walkLegs(t, [SOFA[0], SOFA[1] + 0.28], [{ t0: 47.3, t1: 47.95, pts: [[SOFA[0], SOFA[1] + 0.66]] }, { t0: 48.6, t1: 52, pts: [[SOFA[0] - 0.3, SOFA[1] + 2.0], [SOFA[0] - 1.4, SOFA[1] + 2.4]] }]);
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: w.head ?? 0, lean: 0.06 });
    p.headPitch = K(t, [[47.7, 0.0], [47.9, 0.5], [48.2, 0.5], [48.4, 0.0]]); p.mouth = t < 48.3 ? 'o' : 'smile';
    const go = K(t, [[48.5, 0], [48.9, 1]]); p.armA = mixArm(SHRUG_A, pump(w.dist * PI / STEP, 1), go); p.armB = mixArm(SHRUG_B, pump(w.dist * PI / STEP, -1), go);
    return p;
  }
  // BARROW — Walt pushes a barrow of cash to the bakery door, stops, tips it… the cash pours out
  const BZ = -1.45, TIP = 53.0;
  const barrowX = (t) => K(t, [[49.6, -3.6], [52.4, 0.15]], (u) => (u < 0.85 ? u : u - (u - 0.85) ** 2 / 0.3) / 0.925);   // constant speed, then a soft stop
  function waltBarrow(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    const bx = Math.min(barrowX(t), 0.15), x = bx - 1.35 + 0.35 * K(t, [[TIP - 0.3, 0], [TIP + 0.25, 1]]);
    Object.assign(p, { x, z: BZ, y: SH, floor: SH, rotY: PI / 2, dist: x + 10, speed: t < 52.4 ? 1.3 : 0, lean: 0.12 });
    const tip = K(t, [[TIP - 0.3, 0], [TIP + 0.25, 1]]);
    p.armA = mixArm(BARROW_A, A(-1.0, 0.14, -0.3, 0.1), tip); p.armB = mixArm(BARROW_B, A(-1.0, 0.14, -0.3, -0.1), tip);
    if (t > TIP + 0.7) { const s = K(t, [[TIP + 1.0, 0], [TIP + 1.3, 1]]); p.armA = mixArm(p.armA, SHRUG_A, s); p.armB = mixArm(p.armB, SHRUG_B, s); p.headYaw = 0.75 * s; p.headPitch = 0.05; }
    return p;
  }
  // SUNDAY — Walt walks across town (+x along the near sidewalk), then up Mom's porch
  const DOOR = [-18.2, -8.9];
  function waltWalk(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'smile';
    const x = walkX(t);
    Object.assign(p, { x, z: -1.0, y: SW_H, floor: SW_H, rotY: PI / 2, dist: x + 40, speed: WALK_V });
    return p;
  }
  function waltDoor(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'smile';
    const w = walkLegs(t, [DOOR[0] + 0.1, -6.6], [{ t0: 59.4, t1: 60.85, pts: [[DOOR[0] - 0.14, -7.75]] }]);
    const fl = clamp((-w.z - 6.95) / 0.25) * 0.3;
    Object.assign(p, { x: w.x, z: w.z, dist: w.dist, speed: w.speed, rotY: PI, y: fl, floor: fl });
    const knock = K(t, [[60.9, 0], [61.1, 1], [61.5, 1], [61.7, 0]]);
    p.armB = mixArm(REST, KNOCK_B, knock); p.armB.el += knock * 0.25 * Math.sin(t * 26);
    const hug = K(t, [[62.0, 0], [62.45, 1]]);
    p.armA = mixArm(REST, HUG_A, hug); p.armB = mixArm(p.armB, HUG_B, hug); p.z -= 0.18 * hug; p.lean = 0.03 + 0.12 * hug; p.headRoll = -0.22 * hug; p.headPitch = 0.05 + 0.15 * hug;
    if (hug > 0.5) p.eyes = 'closed';
    return p;
  }
  function momPose(t) {
    const p = basePose(); p.eyes = blink(t, 6); p.mouth = 'o';
    const out = K(t, [[61.85, 0], [62.3, 1]]);
    Object.assign(p, { x: DOOR[0] + 0.08, z: DOOR[1] - 0.5 + 1.2 * out, y: 0.3 + 0.1 * (1 - out), floor: 0.3 + 0.1 * (1 - out), rotY: 0, dist: out * 0.9, speed: out > 0.02 && out < 0.98 ? 0.6 : 0 });
    const hug = K(t, [[62.05, 0], [62.5, 1]]);
    p.armA = mixArm(REST, HUG_A, hug); p.armB = mixArm(REST, HUG_B, hug);
    p.mouth = hug > 0.5 ? 'smile' : 'o'; if (hug > 0.6) p.eyes = 'closed';
    p.headRoll = 0.22 * hug; p.headPitch = -0.08 * hug; p.lean = 0.03 + 0.1 * hug;
    return p;
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  const _w = new THREE.Vector3();
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.fill.intensity = 0.45;
    ALL.forEach((r) => (r.root.visible = false)); bibs.forEach((b) => (b.visible = false)); bands.forEach((b) => (b.visible = false));
    dog.g.visible = false; raceG.visible = false; bakeG.visible = false;
    coinN = 0; plusN = 0; puffN = 0; puffs.hide(); pluses.forEach((s) => (s.visible = false));
    crowd.forEach((c) => outfit(c, c.base.top));
    let jolt = 0;

    if (S === 'kit') {
      const buzz = (t > 4.3 && t < 4.75) || (t > 4.95 && t < 5.4) ? 1 : 0;
      phone.g.rotation.y = PI + buzz * 0.06 * Math.sin(t * 90); phone.g.position.x = 0.42 + buzz * 0.003 * Math.sin(t * 77);
      const lit = t > 4.3 ? 1 : 0, card = t > 6.15;
      scrM.map = card ? scrB : scrA; scrM.color.set(lit ? 0xcfcfcf : 0x0a0d14);
      mug.position.set(0.78, 0.752, -0.7); mug.rotation.set(0, 0, 0);
      if (t > 2.9 && t < 4.4 && shot.cam === 'kitA') { const k = K(t, [[2.9, 0], [3.2, 1], [4.1, 1], [4.4, 0]]); put(walt, 'kit', waltKitchen(t)); const h = handWorld(walt, 1); mug.position.lerp(h.add(_w.set(0, -0.05, 0.03)), k); mug.rotation.z = 0.5 * K(t, [[3.4, 0], [3.6, 1], [3.9, 1], [4.05, 0]]); }
      if (shot.cam !== 'phone') { put(walt, 'kit', waltKitchen(t)); trail(t, 'kit', waltKitchen, { size: 1.9 }); }
      if (shot.cam === 'kitB') {
        for (const [m, x] of [[STEP1, 0.78], [STEP2, 1.16]]) plusOne(t, m, L('kit', x + 0.25, 0.05, KZ + 0.3), 0.6);
      }
    } else if (S === 'office') {
      crowd.forEach((c, i) => { if (i < 7) outfit(c, SHIRTS[i % SHIRTS.length]); const f = (tt) => worker(tt, i); const p = f(t); if (p) { put(c, 'office', p); trail(t, 'office', f, { seed: i }); } });
      const spin = K(t, [[13.6, 0], [15.0, 1]]);
      offChairs.forEach((c, k) => (c.rotation.y = (k ? PI : 0) + spin * (t - 13.6) * (k ? -4.5 : 5.2)));
      const lift = K(t, [[15.3, 0], [17.6, 1]]);
      paperSeeds.forEach((s, i) => {
        const r0 = 0.15 + s[0] * 0.5, a = s[1] * 2 * PI + lift * (t - 15.3) * (2.2 + s[2] * 1.4), r = lerp(r0 * 0.6, 0.5 + s[0] * 1.2, lift);
        const y = lerp(0.752 + i * 0.002, 1.0 + s[3] * 1.6, Math.min(1, lift * (0.6 + s[2]))), x = OD.desk[0] + 0.25 + Math.cos(a) * r * (lift > 0 ? 1 : 0.3), z = OD.desk[1] + Math.sin(a) * r * (lift > 0 ? 1 : 0.3);
        _q.setFromEuler(_e.set(-PI / 2 + lift * (t * (3 + s[0] * 4) + i), lift * t * 2.1 + s[1] * 6, lift * Math.sin(t * 3 + i))); _s.setScalar(1);
        _m.compose(_v.set(x, y, z), _q, _s); papers.setMatrixAt(i, _m);
      });
      papers.instanceMatrix.needsUpdate = true;
    } else if (S === 'subway') {
      sub.update(t, 13);
      crowd.forEach((c, i) => { const f = (tt) => rider(tt, i); const p = f(t); if (p) { put(c, 'subway', p); trail(t, 'subway', f, { seed: i }); } });
      const ph = subPh(t), amp = 0.006 + 0.02 * clamp((t - 20.6) / 2.6);
      sub.root.position.y = OFF.subway[1] - amp * Math.abs(Math.cos(ph));                       // the car dips on every stomp
      if (t > 22.7) jolt = 0.012 * Math.abs(Math.cos(ph));
    } else if (S === 'lot') {
      lot.update(t); lot.aimSun(0.8, 1.5, 9);
      const fall = K(t, [[27.25, 0], [27.85, 1]]);
      tubeChain.forEach((s, k) => { s.rotation.z = lerp(s.rotation.z, k === 0 ? -1.45 : -0.12, fall); s.rotation.x = lerp(s.rotation.x, 0, fall); });   // flops over toward +x
      if (fall > 0.95) dust(t, 27.85, L('lot', 3.4, 0.15, 1.4), 0.9, 5, 1.0);
      if (t > 27.85 && t < 28.3) jolt = 0.012 * Math.exp(-(t - 27.85) * 9);
      put(bob, 'lot', bobPose(t));
      crowd.forEach((c, i) => { const f = (tt) => passer(tt, i); const p = f(t); if (p) { put(c, 'lot', p); trail(t, 'lot', f, { seed: i }); } });
    } else if (S === 'burb') {
      if (shot.cam === 'mail') {
        burb.aimSun(mailX(t), -2, 12);
        const f = carrierPose; put(carrier, 'burb', f(t)); trail(t, 'burb', f, { size: 1.8 });
        if (t > 31.0) {
          dog.g.visible = true;
          const u = t - 31.0, cx = mailX(t), dx = lerp(-4.5, cx - 2.0 + 0.5 * clamp((u - 1) / 2), clamp(u / 1.0)), dz = lerp(-4.6, -1.15, clamp(u / 0.9));
          dog.g.position.copy(L('burb', dx, dz > -2 ? SW_H : 0.0, dz)); dog.g.rotation.y = lerpAngle(0.45, PI / 2, clamp((u - 0.6) / 0.4));
          dog.update(t, 1.6); dog.bark(Math.max(0, Math.sin(t * 13)) * (u > 0.4 ? 1 : 0));
        }
      } else if (shot.cam === 'walk') {
        burb.aimSun(walkX(t), -2, 12);
        put(walt, 'burb', waltWalk(t)); trail(t, 'burb', waltWalk, { size: 2.2 });
      } else {
        burb.aimSun(DOOR[0], -7, 9);
        const h = burb.houses.find((hh) => Math.abs(hh.doorPos.x - DOOR[0]) < 0.6) || burb.houses[1];
        if (h) h.door.rotation.y = K(t, [[61.55, 0], [61.95, 1.45]]);
        put(walt, 'burb', waltDoor(t)); trail(t, 'burb', waltDoor);
        put(mom, 'burb', momPose(t));
      }
    } else if (S === 'street') {
      if (shot.cam === 'race') {
        raceG.visible = true; if (pickles) pickles.visible = true; nearTrees.forEach((tr) => (tr.t.visible = true)); street.aimSun(0, 2.5, 9); street.setSeason('summer', t, [0, 2]);
        crowd.forEach((c, i) => {
          if (i < 12) { outfit(c, SPORT[i % SPORT.length], 0x2a2a2a); bibs[i].visible = true; bands[i].visible = true; const f = (tt) => runner(tt, i); put(c, 'street', f(t)); trail(t, 'street', f, { seed: i, size: 0.9 }); }
          else if (i < 18) put(c, 'street', fan(t, i - 12));
        });
        [crowd[13], crowd[15]].forEach((c, k) => { const hw = handWorld(c, 1), hw2 = handWorld(c, -1); fanSigns[k].position.copy(street.root.worldToLocal(hw.add(hw2).multiplyScalar(0.5))).add(_w.set(0, 0.22, 0)); fanSigns[k].rotation.y = c.root.rotation.y; });
        const secs = 7 * 3600 + 41 * 60 + (t - 34.0) * 520, hh = Math.floor(secs / 3600), mm = Math.floor(secs / 60) % 60, ss = Math.floor(secs) % 60;
        drawClock(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`);
      } else {
        bakeG.visible = true; if (pickles) pickles.visible = false; nearTrees.forEach((tr) => (tr.t.visible = false)); street.aimSun(0, -1.5, 8); street.setSeason('summer', t, [0, -1.5]);
        const bx = Math.min(barrowX(t), 0.15), tip = K(t, [[TIP - 0.3, 0], [TIP + 0.25, 1]]);
        barrow.position.set(bx, SH, BZ); barrow.rotation.z = -0.12 - 0.95 * tip; wheel.rotation.z = -bx / 0.17;
        put(walt, 'street', waltBarrow(t)); if (t < 52.6) trail(t, 'street', waltBarrow);
        // the heap rides in the tray; at the tip each bill flies out, flutters down and lies on the sidewalk
        barrow.updateMatrixWorld(true); tray.updateMatrixWorld(true);
        billSeeds.forEach((s, i) => {
          const hx = (s[0] - 0.5) * 0.8, hz = (s[1] - 0.5) * 0.52, hy = -0.14 + s[2] * 0.42 * (1 - Math.abs(hx) * 0.9) * (1 - Math.abs(hz));
          const launch = TIP + 0.05 + s[3] * 0.45, age = t - launch;
          let pos, rx, ry2, rz;
          _v.set(hx, hy, hz); tray.localToWorld(_v); bakeG.worldToLocal(_v);
          if (age < 0) { pos = _v.clone(); rx = -PI / 2 + (s[4] - 0.5) * 0.8; ry2 = s[5] * 6; rz = 0; }
          else {
            const vx = 0.6 + s[4] * 1.1, vy = 0.8 + s[5] * 1.6, vz = (s[1] - 0.5) * 1.6, g = 1.7, ground = SH + 0.002 + (i % 40) * 0.0006;
            const tLand = (vy + Math.sqrt(vy * vy + 4 * g * Math.max(0, _v.y - ground))) / (2 * g), fallT = Math.min(age, tLand), landed = age >= tLand;
            pos = new THREE.Vector3(_v.x + vx * fallT, Math.max(ground, _v.y + vy * fallT - g * fallT * fallT), _v.z + vz * fallT);
            rx = landed ? -PI / 2 : -PI / 2 + Math.sin(age * 9 + i) * 1.2; ry2 = s[5] * 6 + fallT * 3; rz = landed ? 0 : Math.cos(age * 7 + i) * 0.8;
          }
          _q.setFromEuler(_e.set(rx, ry2, rz, 'YXZ')); _s.setScalar(1); _m.compose(pos, _q, _s); bills.setMatrixAt(i, _m);
        });
        bills.instanceMatrix.needsUpdate = true;
        dust(t, TIP + 0.25, L('street', 0.9, SH + 0.1, BZ), 0.7, 4, 0.9);
        if (t > TIP && t < TIP + 0.5) jolt = 0.01 * Math.exp(-(t - TIP) * 8);
      }
    } else if (S === 'mkt') {
      const k = K(t, [[42.4, 1], [44.1, 0.04]], (u) => u);
      mkt.setStock(k); mkt.setSoldOut(t > 43.2, 'SOLD OUT'); loaves.visible = t < 42.6;
      const pr = K(t, [[40.3, 1.83], [41.9, 40]], (u) => u * u * u);
      drawPrice(pr < 10 ? `$${pr.toFixed(2)}` : `$${Math.round(pr)}`);
      crowd.forEach((c, i) => { const f = (tt) => shopper(tt, i); const p = f(t); if (p) { put(c, 'mkt', p); trail(t, 'mkt', f, { seed: i }); } });
    } else if (S === 'liv') {
      put(ron, 'liv', ronPose(t)); trail(t, 'liv', ronPose, { size: 1.7 });
      dust(t, RON_UP - 0.25, L('liv', SOFA[0], 0.55, SOFA[1] - 0.1), 1.0, 7, 1.2);
      if (t > RON_UP - 0.25 && t < RON_UP + 0.3) jolt = 0.012 * Math.exp(-(t - RON_UP + 0.25) * 7);
      plusOne(t, RON_STEP, L('liv', SOFA[0] + 0.1, 0.05, SOFA[1] + 0.66), 0.5);
      remote.visible = t < 47.2;
    }

    coins.count = Math.max(1, coinN); if (coinN === 0) { coins.setMatrixAt(0, _m.makeScale(0, 0, 0)); }
    coins.instanceMatrix.needsUpdate = true;

    // camera (local → world)
    const c = CAMS[shot.cam], o = OFF[S];
    let P, Aim;
    if (c.fn) { const r = c.fn(t); P = r.p.map((v, i) => v + o[i]); Aim = r.a.map((v, i) => v + o[i]); }
    else {
      const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    }
    if (jolt) { P = [P[0] + jolt * Math.sin(t * 70), P[1] + jolt * Math.sin(t * 55), P[2]]; }
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
