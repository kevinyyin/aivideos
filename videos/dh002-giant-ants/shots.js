// VIDEO dh002 — "What if ants were the size of dogs?"  (animals lane · tone WHATIF: one consequence per place on a time ladder,
// Walt from dh001 as the human thread). 60.6 s, 11 shots, 7 sets. Every ant on Earth becomes Labrador-sized at 6:00 AM;
// they keep doing ant things — carrying, marching, building — at our scale. Escalation: a kitchen → a street → a city →
// a wedding → Paris → the suburbs → people move, adopt them, and live with them. Warm last beat: the fridge comes back.
//
// Sources (checked Oct 26 2026; one real number per beat in the HUD stat line; the scaled-up consequences are estimates):
//  - ~20 quadrillion ants (19.8 × 10^15), ~12 Mt of dry carbon, more than wild birds + mammals combined, ≈ 20 % of human
//    biomass — Schultheiss et al., "The abundance, biomass, and distribution of ants on Earth", PNAS 119 (2022)
//  - 2 × 10^16 ÷ 8.2 billion people (U.S. Census Bureau, July 2026) ≈ 2.4 million ants per person (our math)
//  - over 14,000 ant species (~14,260 valid living species) — Oberski et al., Insect Systematics and Diversity 9(4), 2025
//  - ants lift 10–50× their body weight — Arizona State University, Ask A Biologist "Ant Factoids" (a popular estimate)
//  - a Labrador: males 29–36 kg (AKC breed standard) → 30 kg × 50 ≈ 1,500 kg, about a small car (estimate)
//  - a dog-sized insect couldn't breathe: insects breathe by diffusion through spiracles + tracheae, which caps their size;
//    Carboniferous ~70 cm griffinflies lived in ~30–35 % oxygen — Harrison, Kaiser & VandenBrooks, Proc. R. Soc. B 277 (2010)
//  - ant traffic doesn't jam even at 80 % occupancy — Poissonnier et al., eLife 8:e48945 (2019)
//  - world sugar ≈ 185 million tonnes a year (2026/27: 184.9 Mt raw value) — USDA FAS "Sugar: World Markets and Trade", May 2026
//  - the Argentine-ant supercolony of southern Europe spans 6,000 km — Giraud, Pedersen & Keller, PNAS 99 (2002)
//  - a leaf-cutter (Atta laevigata) nest with up to 7,864 chambers ~7 m deep — Moreira, Forti et al., Stud. Neotrop. Fauna
//    Environ. 39 (2004)
//  - ants are ~140 million years old (crown group 140–168 Myr) — Moreau et al., Science 312 (2006)
//  - a Lasius niger queen lived 28¾ years in captivity — Kutter & Stumper 1969, via the University of Florida Book of Insect
//    Records, ch. 34 "Longest Adult Life"
//
// Shot list (seconds)                                 | set     | what happens
//  0.0– 9.2  kitA    6:00 AM (quiet open)            | kitchen | a tiny ant walks the breakfast table to the sugar bowl; at 6.2 it grows to
//                                                   |         | Labrador size (the table sags, the mug jumps, dust); it lifts the bowl and looks at us
//  9.2–14.4  fridge  +1 MINUTE                       | kitchen | it lifts the fridge over its head and walks out past Walt (robe, coffee), who sips
// 14.4–19.6  car     +1 HOUR                         | suburb  | six ants carry Walt's car down the street into an ant hole; Walt chases in his robe
// 19.6–24.8  cross   +2 HOURS                        | city    | rush hour stopped at a crosswalk by an endless two-way ant trail; crane up, the light turns green
// 24.8–30.0  wed     +1 DAY                          | wedding | two ants take the cake (and its table) down the aisle mid-vows; every guest turns
// 30.0–35.2  paris   +3 DAYS · PARIS                 | paris   | four ants lift a picnic blanket by its corners and walk off with it; ants climb the tower
// 35.2–40.4  hill    +1 MONTH                        | suburb  | an ant hill rises behind the Hendersons (time-lapse sun); they turn; FOR SALE pops up
// 40.4–45.6  move    +2 MONTHS                       | living  | moving day: ants carry the sofa, the armchair, boxes and the kid out; dad checks a list
// 45.6–50.8  leash   +6 MONTHS                       | street  | Walt walks his ant on a leash; a dog hides; he throws a ball; it brings back the hot-dog cart
// 50.8–53.6  kitEndA +1 YEAR · 6:00 AM               | kitchen | the ant carries the fridge back in and sets it down
// 53.6–60.6  kitEndB                                 | kitchen | it rears up at the table; Walt slides it the sugar bowl; antennae tap his hand. Fade 55.6, card 56.2
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, walkLegs, faceToward, rng, mat, mk, canvasTex } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink, handWorld, HIP_H } from '@engine/rig.js';
import { makeAnt, makeAntSwarm, makeMug, makeDog, makeMovingBox } from '@engine/props.js';
import { makeSpritePool } from '@engine/sets/tech.js';
import { buildKitchen, DIMS as KD } from '@engine/sets/kitchen.js';
import { buildSuburb, SW_H } from '@engine/sets/suburb.js';
import { buildCity, makeCar } from '@engine/sets/city.js';
import { buildWedding, DIMS as WD } from '@engine/sets/wedding.js';
import { buildParis } from '@engine/sets/paris.js';
import { buildLivingRoom } from '@engine/sets/livingroom.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';

const PI = Math.PI;
const OFF = { city: [0, 0, 0], kit: [3000, 0, 0], burb: [-3000, 0, 0], wed: [6000, 0, 0], paris: [-6000, 0, 0], liv: [9000, 0, 0], street: [-9000, 0, 0] };
const easeOut = (u) => 1 - (1 - u) ** 3;

export const SHOTS = [
  { t0: 0, t1: 9.2, cam: 'kitA', set: 'kit' },
  { t0: 9.2, t1: 14.4, cam: 'fridge', set: 'kit' },
  { t0: 14.4, t1: 19.6, cam: 'car', set: 'burb' },
  { t0: 19.6, t1: 24.8, cam: 'cross', set: 'city' },
  { t0: 24.8, t1: 30.0, cam: 'wed', set: 'wed' },
  { t0: 30.0, t1: 35.2, cam: 'paris', set: 'paris' },
  { t0: 35.2, t1: 40.4, cam: 'hill', set: 'burb' },
  { t0: 40.4, t1: 45.6, cam: 'move', set: 'liv' },
  { t0: 45.6, t1: 50.8, cam: 'leash', set: 'street' },
  { t0: 50.8, t1: 53.6, cam: 'kitEndA', set: 'kit' },
  { t0: 53.6, t1: 60.6, cam: 'kitEndB', set: 'kit' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- polyline helpers (ants follow paths like a train)
const plen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
/** point + heading at arc length d (extrapolates straight past both ends) */
function along(pts, d) {
  if (d <= 0) { const [a, b] = pts, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L; return [a[0] + ux * d, a[1] + uz * d, Math.atan2(ux, uz)]; }
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= L || i === pts.length - 1) { const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L; return [a[0] + ux * d, a[1] + uz * d, Math.atan2(ux, uz)]; }
    d -= L;
  }
}

// ---------------------------------------------------------------- choreography numbers shared by poses + cameras
const TT = KD.tableTop, GROW = 6.2;
const growS = (t) => K(t, [[GROW, 0.025], [GROW + 0.35, 1.1], [GROW + 0.55, 0.96], [GROW + 0.72, 1.0]]);
const kitWalk = (t) => walkLegs(t, [0.8, -0.1], [{ t0: 0.4, t1: 5.3, pts: [[0.56, -0.17], [0.34, -0.33], [0.13, -0.42]] }]);
const FR0 = [-2.45, -1.32];                                                         // where the ant stands to grab the fridge
const FR_PATH = [FR0, [-1.55, -0.45], [-1.0, 0.85], [-0.35, 2.4]];
// car: six ants carry it along CAR_PATH into the ant hole at MOUND (suburb local)
const MOUND = [0.9, -5.0], MR = 2.0, MH = 0.95, MHOLE = 0.75;
const CAR_PATH = [[-6.5, 2.8], [-2.8, 2.4], [-0.6, -1.4], MOUND];
const carD = (t) => walkLegs(t, CAR_PATH[0], [{ t0: 14.4, t1: 18.5, pts: CAR_PATH.slice(1) }]).dist + 3.2 * Math.max(0, t - 18.5);
// city trail
const TRAIL_V = 1.7, TRAIL_GAP = 1.4;
// wedding cake
const CAKE = [-1.95, -2.8];
// paris picnic
const BC = [12.2, 26.2];
// hill
const HILL = [58, -9], HR = 9.5, HH = 9;
const hillK = (t) => K(t, [[35.3, 0.12], [39.0, 1]]);
// leash walk (street local)
const walkX = (t) => walkLegs(t, [-6.0, -1.15], [{ t0: 45.6, t1: 48.0, pts: [[-3.1, -1.15]] }]).x;

// camera coords are LOCAL to the shot's set. p/a = [start, end]; fn(t) overrides.
export const CAMS = {
  kitA: { fn: (t) => {
    const w = kitWalk(Math.min(t, GROW)), k = K(t, [[GROW, 0], [GROW + 1.0, 1]], easeOut), u = clamp((t - GROW - 1.0) / 2.0);
    const near = [[w.x + 0.11, 0.8, w.z + 0.27], [w.x - 0.03, TT + 0.012, w.z]];
    const far = [[lerp(1.45, 1.25, u), lerp(1.36, 1.3, u), lerp(2.25, 1.95, u)], [0.42, 0.98, -0.62]];
    return { p: near[0].map((v, i) => lerp(v, far[0][i], k)), a: near[1].map((v, i) => lerp(v, far[1][i], k)), fov: lerp(38, 50, k) };
  }, amp: 0.002 },
  fridge:  { fn: (t) => { const w = walkLegs(Math.max(9.2, t - 0.35), FR0, [{ t0: 10.55, t1: 14.6, pts: FR_PATH.slice(1) }]), k = K(t, [[12.2, 0], [13.0, 1]]); return { p: [lerp(2.2, 1.95, clamp((t - 9.2) / 5.2)), 1.5, 2.25], a: [lerp(lerp(w.x, -0.25, 0.35), -0.4, k), 1.05, lerp(lerp(w.z, -1.6, 0.35), -1.5, k)] }; }, fov: 56, amp: 0.004 },
  car:     { fn: (t) => { const c = along(CAR_PATH, carD(t - 0.25)), e = K(t, [[17.6, 0], [18.6, 1]]); return { p: [6.8, 0.95, 1.5], a: [lerp(c[0], 0.3, e), 1.25, lerp(c[1], -4.4, e)] }; }, fov: 46, amp: 0.004 },
  cross:   { fn: (t) => { const k = K(t, [[20.8, 0], [24.6, 1]]); return { p: [lerp(0.0, 0.0, k), lerp(1.55, 8.5, k), lerp(5.6, 9.5, k)], a: [lerp(0.3, 0.0, k), lerp(0.9, 0.0, k), lerp(-8.0, -9.0, k)] }; }, fov: 50, amp: 0.004 },
  wed:     { p: [[0.75, 1.4, 3.8], [0.7, 1.38, 3.4]], a: [[-0.7, 1.05, -2.6], [-0.65, 1.05, -2.5]], fov: 48, amp: 0.004 },
  paris:   { p: [[12.7, 2.0, 32.8], [12.6, 1.95, 32.2]], a: [[12.1, 1.2, 20.0], [12.15, 1.3, 20.0]], fov: 50, amp: 0.004 },
  hill:    { p: [[54.5, 1.45, 5.0], [54.6, 1.5, 4.6]], a: [[57.0, 2.6, -9.0], [57.0, 3.0, -9.0]], fov: 52, amp: 0.004 },
  move:    { fn: (t) => { const k = K(t, [[40.9, 0], [45.6, 1]]); return { p: [lerp(0.15, -0.05, k), 1.6, 2.6], a: [lerp(1.3, -0.7, k), 0.85, -1.5] }; }, fov: 62, amp: 0.004 },
  leash:   { fn: (t) => { const x = walkX(t) + 1.2; return { p: [x, 1.3, 6.0], a: [x + 0.1, 0.85, -1.4] }; }, fov: 52, amp: 0.004 },
  kitEndA: { fn: (t) => { const w = walkLegs(t - 0.35, FR_PATH[3], [{ t0: 50.8, t1: 52.75, pts: [FR_PATH[2], FR_PATH[1], FR0] }]), k = K(t, [[51.2, 0], [52.6, 1]]); return { p: [2.25, 1.52, 2.2], a: [lerp(lerp(w.x, 0.4, 0.3), -1.75, k), 1.0, lerp(lerp(w.z, -1.15, 0.3), -1.5, k)] }; }, fov: 56, amp: 0.004 },
  kitEndB: { p: [[1.1, 1.4, 2.1], [0.95, 1.37, 1.85]], a: [[-0.35, 0.95, -0.85], [-0.37, 0.95, -0.8]], fov: 56, amp: 0.003 },
};

// ---------------------------------------------------------------- arm library
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const UP_A = A(-2.8, 0.35, -0.35), UP_B = A(-2.8, 0.35, -0.35);
const HEAD_A = A(-2.3, 0.9, -2.2, 0.6), HEAD_B = A(-2.3, 0.9, -2.2, -0.6);        // hands on head
const SIP_B = A(-1.25, 0.32, -2.25, -0.75);
const HOLD_B = A(-0.55, 0.15, -1.45, -0.3);                                         // mug held at the chest
const SHRUG_A = A(-0.25, 0.65, -1.35, -0.4), SHRUG_B = A(-0.25, 0.65, -1.35, 0.4);
const POINT_B = A(-1.55, 0.25, -0.15, 0);
const BOOK_A = A(-0.75, 0.12, -1.35, 0.6), BOOK_B = A(-0.75, 0.12, -1.35, -0.6);     // holding a book / clipboard
const LAP_A = A(-0.6, 0.12, -0.6, 0.3), LAP_B = A(-0.6, 0.12, -0.6, -0.3);          // seated, hands on the lap
const THROW_B = A(-2.6, 0.2, -0.6, 0);
const LEASH_B = A(-0.75, 0.2, -0.5, -0.2);
const FACE_B = A(-1.2, 0.3, -2.35, -0.85);                                           // facepalm
const REACH_A = A(-1.05, 0.35, -0.45, 0.2);                                          // reaching across the table
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });
const wave = (t, s) => A(-2.6 + 0.35 * Math.sin(t * 11 + s), 0.45 + 0.2 * Math.sin(t * 9 + s), -0.5);
const seatY = (top) => -0.375 + (top - 0.42);
const rel = (a) => ((((a + PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI;   // wrap to [−π, π)

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a, 0x3a4a3a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const ROBE = 0x3f6fa8, SWEATER = 0xe2b23a;

export async function build(studio, story) {
  const { scene, setCamera } = studio;

  // ---------------------------------------------------------------- sets (city stays at the origin: its sky follows the camera)
  const city = buildCity(studio, {}); city.setTime({ day: 1 }); city.setShadowFocus(0, -4, 30); city.setTime({}); const cityFog = scene.fog;
  const kit = buildKitchen(studio, {}); kit.root.position.set(...OFF.kit); kit.setClock(6, 0);
  const burb = buildSuburb(studio, { poleClear: [0, 2, -4, 50, 52, 54, 56, 58, 60, 62, 64] }); burb.root.position.set(...OFF.burb);
  const wed = buildWedding(studio, {}); wed.root.position.set(...OFF.wed);
  const paris = buildParis(studio, {}); paris.root.position.set(...OFF.paris);
  const liv = buildLivingRoom(studio, {}); liv.root.position.set(...OFF.liv); liv.setMode('evening');
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const ROOTS = { city: city.root, kit: kit.root, burb: burb.root, wed: wed.root, paris: paris.root, liv: liv.root, street: street.root };
  const FOGS = { city: cityFog, kit: null, burb: burb.fog, wed: wed.fog, paris: paris.fog, liv: null, street: streetFog };
  const FAR = { city: 900, kit: 40, burb: 420, wed: 240, paris: 700, liv: 40, street: 400 };
  const L = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);

  // ---------------------------------------------------------------- cast
  const R = rng(37);
  const person = (o) => { const p = makePerson(o); scene.add(p.root); return p; };
  const walt = person({ skin: 0xf0c4a0, top: ROBE, collar: 0xf5f0e2, pants: 0x8fa8c8, shoes: 0x5a3a24, hair: 0xb5642e, hairStyle: 'messy', glasses: true, mustache: 0x8a4a22 });
  const crowd = Array.from({ length: 12 }, (_, i) => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const p = person({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[i % TOPS.length], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.22, mustache: style !== 'bob' && R() < 0.25 ? HAIRS[Math.floor(R() * 3)] : null });
    p.seed = R(); p.base = TOPS[i % TOPS.length]; return p;
  });
  const bride = person({ skin: 0xf1c3a1, top: 0xfbf8f2, collar: 0xfbf8f2, pants: 0xfbf8f2, hair: 0x5a3a24, hairStyle: 'bob', dress: 0xfbf8f2 });
  const groom = person({ skin: 0xc98e6a, top: 0x2a2d34, collar: 0xf4f4f2, pants: 0x2a2d34, hair: 0x1a1a1a, hairStyle: 'short' });
  const officiant = person({ skin: 0xe2ad8c, top: 0x3a3a4a, collar: 0xf4f4f2, pants: 0x3a3a4a, hair: 0xc9c4be, hairStyle: 'none', glasses: true });
  const kid = person({ skin: 0xe8b48f, top: 0xf2b632, collar: 0xf2b632, pants: 0x3d7bd9, hair: 0x5a3a24, hairStyle: 'messy', headR: 0.175 }); kid.root.scale.setScalar(0.62);
  const vendor = person({ skin: 0x9a6447, top: 0xf4f4f2, collar: 0xd2483f, pants: 0x2a2a2a, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a });
  const neighbor = person({ skin: 0xf3d0b5, top: 0x8f6fb8, collar: 0xf5f0e2, pants: 0x45607a, hair: 0xd9b46a, hairStyle: 'bob' });
  const vcap = new THREE.Group(); vendor.head.g.add(vcap); vcap.position.set(0, 0.075, 0);
  mk(new THREE.CylinderGeometry(0.13, 0.14, 0.08, 18), mat(0xd2483f, 0.6), vcap, 0, 0.03, 0); mk(new THREE.BoxGeometry(0.2, 0.012, 0.11), mat(0xa8302a, 0.6), vcap, 0, -0.005, 0.15);
  const ALL = [walt, ...crowd, bride, groom, officiant, kid, vendor, neighbor];
  const outfit = (rig, top, pants) => { rig.mats.top.color.setHex(top); if (pants !== undefined) rig.mats.pants.color.setHex(pants); };
  const handOf = (rig, s) => rig.arms.find((a) => a.s === s).hand;
  // props held in hands
  const mug = makeMug(0xd2483f); handOf(walt, 1).add(mug); mug.position.set(0, -0.06, 0.05); mug.rotation.x = -0.2;
  const book = mk(new THREE.BoxGeometry(0.2, 0.03, 0.26), mat(0x2a2a30, 0.6), scene, 0, 0, 0);
  const bouquet = new THREE.Group(); handOf(bride, 1).add(bouquet); bouquet.position.set(0.06, -0.08, 0.06);
  for (let k = 0; k < 7; k++) mk(new THREE.SphereGeometry(0.035, 8, 6), mat([0xe58fa6, 0xffffff, 0xf2b632][k % 3], 0.7), bouquet, Math.cos(k * 2.4) * 0.04 * (k > 0), 0.02 + (k % 2) * 0.02, Math.sin(k * 2.4) * 0.04 * (k > 0));
  const clip = mk(new THREE.BoxGeometry(0.24, 0.02, 0.32), mat(0xb98b5c, 0.8), scene, 0, 0, 0); mk(new THREE.BoxGeometry(0.2, 0.004, 0.27), mat(0xfbfaf6, 0.8), clip, 0, 0.012, 0.01);
  const baguette = mk(new THREE.CapsuleGeometry(0.035, 0.42, 4, 10), mat(0xd9a05a, 0.75), scene, 0, 0, 0);
  const ball = mk(new THREE.SphereGeometry(0.06, 14, 10), mat(0xd8e84a, 0.6), scene, 0, 0, 0);

  // ants: hero rigs (full detail) + one instanced swarm for crowds
  const ants = Array.from({ length: 8 }, () => { const a = makeAnt(); scene.add(a.g); a.g.visible = false; return a; });
  const swarm = makeAntSwarm(700); scene.add(swarm.g);
  const dog = makeDog({ color: 0x8a5a32, patch: 0xf2e6cf }); scene.add(dog.g);

  // ---------------------------------------------------------------- set dressing + props per place
  // KITCHEN: breakfast on the table (the set's vase goes), two chairs hidden, the fridge becomes a carry-able group
  kit.table.children.filter((o) => o.isMesh && o.position.y > TT + 0.02).forEach((o) => (o.visible = false));
  kit.chairs[0].visible = false; kit.chairs[3].position.set(1.95, 0, 0.9); kit.chairs[3].rotation.y = -2.3;
  const sugar = new THREE.Group(); kit.root.add(sugar);
  mk(new THREE.CylinderGeometry(0.075, 0.058, 0.075, 22, 1, true), mat(0xf6f3ec, 0.35, { side: THREE.DoubleSide }), sugar, 0, 0.0375, 0);
  mk(new THREE.CircleGeometry(0.058, 22), mat(0xf6f3ec, 0.35), sugar, 0, 0.002, 0).rotation.x = -PI / 2;
  mk(new THREE.TorusGeometry(0.075, 0.006, 6, 24), mat(0x4f9bd9, 0.4), sugar, 0, 0.075, 0).rotation.x = PI / 2;
  mk(new THREE.CircleGeometry(0.07, 22), mat(0xfbfbf8, 0.9), sugar, 0, 0.062, 0).rotation.x = -PI / 2;
  for (let k = 0; k < 6; k++) mk(new THREE.BoxGeometry(0.022, 0.022, 0.022), mat(0xffffff, 0.8), sugar, Math.cos(k * 1.1) * 0.035, 0.074, Math.sin(k * 1.1) * 0.035).rotation.y = k;
  const tmug = makeMug(0x4f9bd9); kit.root.add(tmug);
  const plate = new THREE.Group(); kit.root.add(plate);
  mk(new THREE.CylinderGeometry(0.11, 0.09, 0.015, 22), mat(0xf6f3ec, 0.4), plate, 0, 0.008, 0);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.09, 0.018, 0.09), mat(0xd9a05a, 0.8), plate, s * 0.035, 0.024, 0).rotation.y = s * 0.3;
  const paper = mk(new THREE.PlaneGeometry(0.3, 0.42), new THREE.MeshStandardMaterial({ roughness: 0.9, map: canvasTex(150, 210, (g, w, h) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = 'bold 22px Georgia, serif'; g.fillText('THE DAILY', 12, 28); g.fillRect(10, 36, w - 20, 3); g.fillStyle = '#999'; for (let y = 50; y < h - 8; y += 9) g.fillRect(10 + ((y / 9) % 2) * 6, y, w - 26, 4); }) }), kit.root, 0.78, TT + 0.004, -0.25);
  paper.rotation.set(-PI / 2, 0, 0.35);
  const BREAK = { mug: [1.0, 0.0], plate: [0.97, -0.68], sugar: [0.03, -0.42] };
  const fx = -2.45, fz = KD.room.z0 + 0.4;
  const fridge = new THREE.Group(); fridge.position.set(fx, 0.925, fz); kit.root.add(fridge);                      // pivot = the fridge's center
  kit.root.children.filter((o) => o.isMesh && o.position.x < -2.0 && o.position.z > -2.25 && o.position.z < -1.5).forEach((o) => { fridge.add(o); o.position.sub(new THREE.Vector3(fx, 0.925, fz)); });
  const FRIDGE_HOME = { p: new THREE.Vector3(fx, 0.925, fz), q: new THREE.Quaternion() };
  const FRIDGE_CARRY = { p: new THREE.Vector3(0, 1.12, -0.05), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-PI / 2 + 0.22, 0, 0)) };

  // SUBURB: the ant hole Walt's car goes into, the big hill behind the Hendersons, a FOR SALE sign
  function makeMound(Rr, H, hole, seed, color = 0x8a5f3a) {
    const pts = [[0.01, H * 0.3], [hole * 0.6, H * 0.36], [hole * 0.92, H * 0.8], [hole * 1.12, H], [hole * 1.6, H * 0.97], [Rr * 0.55, H * 0.7], [Rr * 0.82, H * 0.3], [Rr, 0.0]];
    const geo = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 40);
    const p = geo.attributes.position, col = [], c0 = new THREE.Color(color), cd = new THREE.Color(0x24160c);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z), a = Math.atan2(z, x);
      const n = 1 + 0.06 * Math.sin(a * 5 + seed) * Math.sin(a * 3 + 1.7 * seed) * clamp(r / hole - 1);
      p.setX(i, x * n); p.setZ(i, z * n); p.setY(i, y * (1 + 0.05 * Math.sin(a * 7 + seed)));
      const c = c0.clone().lerp(cd, clamp(1.2 - r / hole) * 0.95).multiplyScalar(0.9 + 0.12 * Math.sin(a * 11 + y * 9)); col.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
    const g = new THREE.Group(), m = mk(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }), g, 0, 0, 0); m.receiveShadow = true;
    const RR = rng(seed);
    for (let k = 0; k < 26; k++) { const a = RR() * 2 * PI, r = Rr * (0.75 + RR() * 0.6); mk(new THREE.DodecahedronGeometry(0.05 + RR() * 0.07 * Rr / 2), mat(color, 1), g, Math.cos(a) * r, 0.03, Math.sin(a) * r); }
    return g;
  }
  const hole = makeMound(MR, MH, MHOLE, 3); hole.position.set(MOUND[0], 0, MOUND[1]); burb.root.add(hole);
  const moundY = (x, z) => { const r = Math.hypot(x - MOUND[0], z - MOUND[1]); if (r >= MR) return 0; if (r > MHOLE * 1.12) return MH * Math.min(1, 1.15 * (1 - ((r - MHOLE * 1.12) / (MR - MHOLE * 1.12)) ** 1.6)); return MH * lerp(0.36, 1, clamp((r - MHOLE * 0.6) / (MHOLE * 0.52))); };
  const hill = makeMound(HR, HH, 1.4, 7, 0x9a6a40); hill.position.set(HILL[0], 0, HILL[1]); burb.root.add(hill);
  const parkBits = burb.root.children.filter((o) => o !== hill && o.position.x > 50.5 && o.position.x < 69.5 && o.position.z < -1.5 && o.position.z > -15 && !o.isLight);
  const hillY = (x, z, k) => { const r = Math.hypot(x - HILL[0], z - HILL[1]) / lerp(0.55, 1, k); return r >= HR ? 0 : HH * k * Math.min(1, 1.15 * (1 - (Math.max(0, r - 1.6) / (HR - 1.6)) ** 1.6)); };
  /** a lane that walks in from the street and spirals around the hill (scaled with its growth) */
  const spiral = (sc, a0, turns, rev) => { const pts = []; for (let i = 0; i <= 28; i++) { const u = i / 28, a = a0 + (rev ? -1 : 1) * u * turns * 2 * PI, r = lerp(HR * 0.97, 1.5, u) * sc; pts.push([HILL[0] + r * Math.cos(a), HILL[1] + r * Math.sin(a)]); } return pts; };
  const saleSign = new THREE.Group(); burb.root.add(saleSign);
  mk(new THREE.BoxGeometry(0.07, 2.5, 0.07), mat(0xf4f1ea, 0.6), saleSign, 0, 1.25, 0); mk(new THREE.BoxGeometry(0.95, 0.06, 0.06), mat(0xf4f1ea, 0.6), saleSign, 0.44, 2.42, 0);
  const saleBoard = mk(new THREE.PlaneGeometry(0.86, 0.6), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7, map: canvasTex(288, 200, (g, w, h) => { g.fillStyle = '#d2283f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(10, 10, w - 20, h - 20); g.fillStyle = '#d2283f'; g.font = 'bold 66px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('FOR', w / 2, 82); g.fillText('SALE', w / 2, 152); }) }), saleSign, 0.47, 2.04, 0.0);
  void saleBoard;
  const waltCar = makeCar(0x3d9a8a, 4); burb.root.add(waltCar.g);
  const dirt = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.22, 0), mat(0x8a5f3a, 1), 200); dirt.frustumCulled = false; dirt.count = 0; scene.add(dirt);

  // CITY: stopped cars, a driver out of his car, sugar cubes + leaves riding on the trail
  const cityCars = [[2, 2.9, PI, 0xd2483f], [2, 7.7, PI, 0xf2f0ea], [2, 12.5, PI, 0x3d7bd9], [2, 17.3, PI, 0xf1c24a], [2, 22.1, PI, 0x2a2d34], [-2, -12.6, 0, 0x6fa84f], [-2, -17.4, 0, 0xe58fa6], [-2, -22.2, 0, 0xf2f0ea]]
    .map(([x, z, r, c], i) => { const car = makeCar(c, i + 9); car.g.position.set(x, 0, z); car.g.rotation.y = r; city.root.add(car.g); return car; });
  void cityCars;
  const cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), mat(0xffffff, 0.7), 200); cubes.frustumCulled = false; cubes.count = 0; scene.add(cubes);
  const leaves = new THREE.InstancedMesh(new THREE.CircleGeometry(0.42, 7), mat(0x5ea640, 0.7, { side: THREE.DoubleSide }), 120); leaves.frustumCulled = false; leaves.count = 0; scene.add(leaves);

  // WEDDING: the cake moves next to the couple; its tiers become one carry-able group
  const cakeG = wed.root.children.find((o) => o.isGroup && Math.abs(o.position.x + 4.2) < 1e-6 && Math.abs(o.position.z + 2.0) < 1e-6);
  cakeG.position.set(CAKE[0], 0, CAKE[1]);
  const tiers = new THREE.Group(); tiers.position.set(CAKE[0], 0.8, CAKE[1]); wed.root.add(tiers);
  cakeG.children.filter((o) => o.isMesh && o.geometry.type === 'CylinderGeometry').forEach((o) => { tiers.add(o); o.position.y -= 0.8; });
  [[0.22, 0.02], [0.16, 0.16], [0.1, 0.28]].forEach(([r, y]) => mk(new THREE.TorusGeometry(r + 0.004, 0.012, 6, 28), mat(0xe58fa6, 0.6), tiers, 0, y, 0).rotation.x = PI / 2);
  mk(new THREE.SphereGeometry(0.04, 8, 6), mat(0xd2483f, 0.5), tiers, 0.03, 0.42, 0); mk(new THREE.SphereGeometry(0.035, 8, 6), mat(0xe58fa6, 0.6), tiers, -0.03, 0.43, 0.02);
  const CAKE_CARRY = new THREE.Vector3(0, 0.98, 0.18);

  // PARIS: picnic blanket (a sagging cloth with the food on it), a basket, an ant column up leg 0 of the tower
  const blanket = new THREE.Group(); paris.root.add(blanket);
  const clothGeo = new THREE.PlaneGeometry(2.0, 1.6, 10, 8); clothGeo.rotateX(-PI / 2);
  const cloth0 = clothGeo.attributes.position.array.slice();
  const cloth = mk(clothGeo, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9, map: canvasTex(256, 208, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 10; x++) { g.fillStyle = (x + y) % 2 ? '#f4f1ea' : '#d2483f'; g.fillRect(x * 25.6, y * 26, 25.6, 26); } }) }), blanket, 0, 0, 0);
  const food = new THREE.Group(); blanket.add(food);
  const basket = new THREE.Group(); basket.position.set(-0.55, 0, -0.3); food.add(basket);
  mk(new THREE.BoxGeometry(0.42, 0.24, 0.3), mat(0xb8864a, 0.9), basket, 0, 0.12, 0); mk(new THREE.TorusGeometry(0.17, 0.015, 6, 16, PI), mat(0x8a5a2a, 0.8), basket, 0, 0.24, 0);
  for (const [x, z, r] of [[0.15, 0.1, 0.4], [0.32, -0.12, -0.3]]) mk(new THREE.CapsuleGeometry(0.035, 0.42, 4, 10), mat(0xd9a05a, 0.75), food, x, 0.04, z).rotation.set(PI / 2, 0, r);
  for (const [x, z] of [[-0.25, 0.42], [0.5, 0.38]]) mk(new THREE.CylinderGeometry(0.12, 0.1, 0.015, 18), mat(0xf6f3ec, 0.4), food, x, 0.01, z);
  for (let k = 0; k < 9; k++) mk(new THREE.SphereGeometry(0.025, 8, 6), mat(0x7a3a8a, 0.4), food, 0.5 + Math.cos(k) * 0.04, 0.03 + (k % 3) * 0.015, 0.38 + Math.sin(k * 1.7) * 0.04);
  mk(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 3), mat(0xf2c84a, 0.6), food, -0.2, 0.035, 0.42).rotation.y = 0.4;
  mk(new THREE.CylinderGeometry(0.035, 0.04, 0.3, 10), mat(0x3a6a3a, 0.3), food, 0.75, 0.15, -0.15);
  const _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _v = new THREE.Vector3(), _w = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();
  /** orientation whose local +y = up and +z = front (orthogonalized) */
  const basisQ = (up, front) => { const y = up.clone().normalize(), x = new THREE.Vector3().crossVectors(y, front).normalize(), z = new THREE.Vector3().crossVectors(x, y); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); };

  // LIVING ROOM: the sofa becomes a carry-able group; the coffee table + dog bed are already packed; boxes by the wall
  const sofaMeshes = liv.root.children.filter((o) => o.isMesh && o.material.color && o.material.color.getHex() === 0x8f6aa8);
  const sofa = new THREE.Group(); sofa.position.set(1.8, 0, -2.25); liv.root.add(sofa);
  sofaMeshes.forEach((o) => { sofa.add(o); o.position.x -= 1.8; o.position.z += 2.25; });
  liv.root.children.filter((o) => o.isMesh && o.position.y > 0.02 && o.position.y < 0.6 && ((Math.abs(o.position.x - 0.45) < 0.75 && Math.abs(o.position.z + 0.45) < 0.5) || (Math.abs(o.position.x + 0.78) < 0.45 && Math.abs(o.position.z + 0.55) < 0.4))).forEach((o) => (o.visible = false));
  const boxTex = (txt) => canvasTex(128, 96, (g, w, h) => { g.fillStyle = '#b98b5c'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a2a1a'; g.font = 'bold 24px Helvetica, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(txt, w / 2, h / 2 + 8); });
  const labelBox = (txt, w = 0.5, h = 0.38) => { const b = makeMovingBox(w, h, 0.42); const lb = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.5), new THREE.MeshStandardMaterial({ map: boxTex(txt), roughness: 0.9 })); lb.position.set(0, h / 2, 0.212); b.add(lb); return b; };
  const stack = new THREE.Group(); liv.root.add(stack);
  ['BOOKS', 'KITCHEN', 'FRAGILE'].forEach((s, k) => { const b = labelBox(s); b.position.y = k * 0.38; b.rotation.y = (k - 1) * 0.12; stack.add(b); });
  for (const [x, z, r, s] of [[2.55, 0.3, 0.2, 'TOYS'], [-1.05, -2.4, -0.1, 'BEDROOM'], [2.55, 0.9, 0.5, 'LAMPS'], [-4.4, 1.6, 0.3, 'MISC']]) { const b = labelBox(s); b.position.set(x, 0, z); b.rotation.y = r; liv.root.add(b); }
  { const b = labelBox('BEDROOM'); b.position.set(-1.35, 0.38, -2.38); b.rotation.y = 0.05; liv.root.add(b); }

  // STREET: the leash (rebuilt per frame), the hot-dog cart gets carried, the ball
  const leashM = mat(0xd2283f, 0.6);
  let leash = null;
  function setLeash(a, b, sag) {
    if (leash) { leash.geometry.dispose(); street.root.remove(leash); leash = null; }
    if (!a) return;
    const m = a.clone().add(b).multiplyScalar(0.5); m.y -= sag;
    leash = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 16, 0.008, 5), leashM); street.root.add(leash);
  }
  const cart = street.cart, CART_HOME = cart.position.clone();
  street.root.children.filter((o) => (o.isGroup && Math.abs(o.position.x + 3) < 1e-6 && Math.abs(o.position.z - 5.95) < 1e-6) || (o.isMesh && Math.abs(o.position.x + 1.4) < 1e-6 && Math.abs(o.position.y - 1.5) < 1e-6)).forEach((o) => (o.visible = false));
  street.root.children.filter((o) => o.isMesh && o.position.y > 2 && o.position.x > -8 && o.position.x < 2 && o.position.z > -0.5 && o.position.z < 0.3).forEach((o) => (o.visible = false));   // the lamp post in Walt's path
  const collar = mk(new THREE.TorusGeometry(0.1, 0.018, 6, 16), mat(0xd2283f, 0.5), scene, 0, 0, 0);

  // dust puffs (growth, set-downs, the car hole)
  const puffs = makeSpritePool(scene, 70, 'smoke'); const puffCol = new THREE.Color(0xf4ede0), dirtCol = new THREE.Color(0xb8946a);
  let puffN = 0;
  function dust(t, t0, pos, s = 1, n = 5, dur = 1.0, col = puffCol) {
    const age = t - t0; if (age < 0 || age > dur) return;
    for (let k = 0; k < n && puffN < puffs.items.length; k++) {
      const a = t0 * 3.7 + k * (2 * PI / n), r = (0.15 + age * 0.9) * s;
      puffs.set(puffN++, _v.set(pos.x + Math.cos(a) * r, pos.y + 0.05 * k + age * 0.35 * s, pos.z + Math.sin(a) * r * 0.6).clone(), (0.35 + age * 1.1) * s, 0.8 * (1 - age / dur) ** 1.4, col);
    }
  }

  // ---------------------------------------------------------------- helpers
  function put(rig, key, p) {
    if (!p) { rig.root.visible = false; return; }
    applyPose(rig, { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2] });
    rig.root.visible = p.visible !== false;
  }
  /** a scaled rig (the kid): ground height + root height in LOCAL units (010 putG) */
  function putS(rig, key, p, s, rootY = null) {
    const q = { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2], dist: (p.dist || 0) / s, speed: (p.speed || 0) / s };
    if (rootY !== null) { q.floor = ((p.floor || 0) - rootY) / s; q.y = 0; }
    applyPose(rig, q); rig.root.visible = true;
    rig.root.position.y = rootY !== null ? rootY : (p.y || 0) * s;
  }
  /** a hero ant: local coords of a set; o = makeAnt update options */
  function ant(i, key, x, y, z, rotY, t, o = {}, s = 1) {
    const a = ants[i]; a.g.visible = true; a.g.position.copy(L(key, x, y, z)); a.g.rotation.set(o.pitch || 0, rotY, 0, 'YXZ'); a.g.scale.setScalar(s);
    a.update(t, { ...o, dist: o.dist !== undefined ? o.dist / s : undefined }); a.g.updateMatrixWorld(true); return a;
  }
  /** an object riding on an ant: offset + rotation in the ant's local frame → world (pos, quat) */
  function riding(a, off, q) { a.g.updateMatrixWorld(true); const p = off.clone().applyMatrix4(a.g.matrixWorld), qq = a.g.getWorldQuaternion(new THREE.Quaternion()).multiply(q); return { p, q: qq }; }
  /** place obj (child of a set root) at a world pose */
  function placeWorld(obj, p, q, parent) { parent.updateMatrixWorld(true); const inv = parent.getWorldQuaternion(new THREE.Quaternion()).invert(); obj.position.copy(parent.worldToLocal(p.clone())); obj.quaternion.copy(inv.multiply(q)); }

  // ---------------------------------------------------------------- performances (pure: f(t) → pose)
  // KITCHEN: Walt at the sink with coffee; turns, stares, sips
  function waltSink(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'flat';
    const turn = K(t, [[9.85, 0], [10.35, 1]]);
    Object.assign(p, { x: -0.25, z: -1.6, rotY: lerpAngle(PI, faceToward(-0.25, -1.6, -2.2, -1.0), turn) });
    p.armB = mixArm(HOLD_B, SIP_B, K(t, [[12.75, 0], [13.15, 1], [13.75, 1], [14.1, 0]]));
    p.armA = mixArm(A(-0.6, 0.15, -0.9, 0.3), REST, turn);
    if (turn > 0.5) { p.mouth = 'o'; const a = antFridge(t); p.headYaw = clamp(rel(faceToward(-0.25, -1.6, a.x, a.z) - p.rotY), -1.2, 1.2) * 0.85; }
    if (t > 12.85 && t < 13.9) { p.eyes = 'closed'; p.mouth = 'flat'; p.headYaw *= 0.3; }
    if (t > 13.9) { p.mouth = 'flat'; p.headYaw = lerp(p.headYaw, 0.5, K(t, [[13.9, 0], [14.2, 1]])); }
    return p;
  }
  // FRIDGE: the ant grabs the fridge, turns around and carries it out (pure; reused backwards at the end)
  function antFridge(t) {
    const carry = K(t, [[9.55, 0], [10.35, 1]]);
    if (t < 10.4) return { x: FR0[0], z: FR0[1], rotY: PI, carry, dist: 0.04 * Math.sin(t * 3), mouth: K(t, [[9.3, 0], [9.55, 1]]) };
    const w = walkLegs(t, FR0, [{ t0: 10.55, t1: 14.6, pts: FR_PATH.slice(1) }]);
    const turnRot = lerpAngle(PI, w.head ?? 0.55, K(t, [[10.4, 0], [10.95, 1]]));
    return { x: w.x, z: w.z, rotY: turnRot, carry: 1, dist: w.dist + (t - 10.4) * 0.6 };
  }
  // the end: the same walk backwards, then the set-down and a trip to the table
  function antReturn(t) {
    if (t < 53.0) {
      const w = walkLegs(t, FR_PATH[3], [{ t0: 50.8, t1: 52.75, pts: [FR_PATH[2], FR_PATH[1], FR0] }]);
      return { x: w.x, z: w.z, rotY: lerpAngle(w.head ?? PI, PI, K(t, [[52.5, 0], [52.95, 1]])), carry: 1, dist: w.dist + Math.max(0, t - 52.75) * 0.5 };
    }
    const carry = K(t, [[53.0, 1], [53.5, 0]]);
    if (t < 53.6) return { x: FR0[0], z: FR0[1], rotY: PI, carry, dist: 0 };
    const w = walkLegs(t, FR0, [{ t0: 53.7, t1: 54.7, pts: [[-1.3, -0.55], [-0.98, -0.47]] }]);
    return { x: w.x, z: w.z, rotY: lerpAngle(w.head ?? 0, PI / 2, K(t, [[54.5, 0], [54.85, 1]])), carry: 0, dist: w.dist, rear: K(t, [[54.8, 0], [55.2, 0.6]]), look: K(t, [[55.6, 0], [55.9, 0.35]]), mouth: K(t, [[55.0, 0], [55.2, 0.6], [55.5, 0.1]]) };
  }
  function waltTable(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'smile';
    Object.assign(p, { x: 0.4, z: -1.15, rotY: 0, y: seatY(0.47), footFwd: 0.42, lean: 0.1 });
    p.armA = A(-0.85, 0.05, -1.05, 0.3); p.armB = A(-0.85, 0.05, -1.05, -0.3);
    if (t < 53.6) { p.armB = mixArm(HOLD_B, SIP_B, K(t, [[51.3, 0], [51.7, 1], [52.3, 1], [52.6, 0]])); if (t > 51.5 && t < 52.4) p.eyes = 'closed'; const a = antReturn(t); p.headYaw = clamp(rel(faceToward(0.4, -1.15, a.x, a.z)), -1.2, 1.2) * 0.8; }
    else {
      const slide = K(t, [[54.1, 0], [54.6, 1]]);
      p.armA = mixArm(p.armA, REACH_A, slide); p.lean = 0.1 + 0.15 * slide;
      p.headYaw = -0.55 * K(t, [[54.2, 0], [54.6, 1]]); p.headPitch = 0.2;
    }
    return p;
  }
  const bowlSlide = (t) => K(t, [[54.15, 0], [54.6, 1]]);
  const BOWL_END = [[0.25, -0.75], [-0.12, -0.5]];

  // CAR: Walt chases in his robe, then holds his head at the hole
  function waltChase(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'o';
    const w = walkLegs(t, [-11.0, 2.0], [{ t0: 14.4, t1: 18.9, pts: [[-5.4, 1.7], [-1.9, -0.9], [-0.4, -3.3]] }]);
    Object.assign(p, { x: w.x, z: w.z, rotY: w.head ?? PI / 2, dist: w.dist, speed: w.speed, lean: 0.12, y: w.z < 0 && w.z > -2 ? SW_H : 0, floor: w.z < 0 && w.z > -2 ? SW_H : 0 });
    const stop = K(t, [[18.7, 0], [19.1, 1]]);
    p.armA = mixArm(wave(t, 0), HEAD_A, stop); p.armB = mixArm(wave(t, 1.3), HEAD_B, stop);
    if (stop > 0.5) { p.rotY = lerpAngle(p.rotY, faceToward(w.x, w.z, MOUND[0], MOUND[1]), stop); p.headPitch = 0.3; }
    return p;
  }
  // WEDDING
  const WED_A = [-1.7, -9.5], WED_B = [-2.9, -10.5], TB = 27.15;
  function cakeAnt(t) {
    if (t < 26.6) { const w = walkLegs(t, WED_A, [{ t0: 24.8, t1: 26.1, pts: [[-2.2, -5.2], [-2.52, -2.8]] }]); return { x: w.x, z: w.z, rotY: lerpAngle(w.head ?? PI / 2, PI / 2, K(t, [[25.8, 0], [26.1, 1]])), dist: w.dist, carry: K(t, [[26.1, 0], [26.55, 1]]) }; }
    const w = walkLegs(t, [-2.52, -2.8], [{ t0: 26.7, t1: 30.4, pts: [[-1.1, -2.0], [0, -1.0], [0, 6.8]] }]);
    return { x: w.x, z: w.z, rotY: w.head ?? PI / 2, dist: w.dist + 3, carry: 1 };
  }
  function tableAnt(t) {
    if (t < TB + 0.4) { const w = walkLegs(t, WED_B, [{ t0: 25.0, t1: TB, pts: [[-3.4, -5.6], [-3.5, -3.2], [-2.55, -2.8]] }]); return { x: w.x, z: w.z, rotY: lerpAngle(w.head ?? PI / 2, PI / 2, K(t, [[TB - 0.3, 0], [TB, 1]])), dist: w.dist, carry: K(t, [[TB, 0], [TB + 0.35, 1]]) }; }
    const w = walkLegs(t, [-2.55, -2.8], [{ t0: TB + 0.45, t1: TB + 4.0, pts: [[-1.1, -2.0], [0, -1.0], [0, 6.8]] }]);
    return { x: w.x, z: w.z, rotY: w.head ?? PI / 2, dist: w.dist + 3, carry: 1 };
  }
  const GUESTS = [[-2.0, -1.4], [-1.3, -1.4], [1.3, -1.4], [2.0, -1.4], [-2.0, -0.4], [-1.3, -0.4], [1.3, -0.4], [2.0, -0.4], [-2.7, 0.6], [2.7, 0.6]];
  function guest(t, i, cake) {
    const [x, z] = GUESTS[i], p = basePose(); p.eyes = blink(t, i + 3); p.mouth = 'smile';
    Object.assign(p, { x, z, rotY: PI, y: seatY(WD.seat), footFwd: 0.42, lean: 0.05 });
    p.armA = LAP_A; p.armB = LAP_B; p.lean += 0.04 * Math.sin(t * 1.1 + i * 1.7); p.headRoll = 0.08 * Math.sin(t * 0.9 + i * 2.3);
    const look = K(t, [[26.3 + 0.04 * i, 0], [26.6 + 0.04 * i, 1]]); p.headYaw = 0.25 * Math.sin(t * 0.7 + i * 1.3) * (1 - look);
    const yaw = clamp(rel(faceToward(x, z, cake.x, cake.z) - PI), -1.5, 1.5);
    p.headYaw += yaw * look; if (look > 0.5) p.mouth = 'o';
    return p;
  }
  // PARIS: four ants come in from the left, lift the blanket by its corners and walk off to the right
  const CORNERS = [[-0.85, -0.62], [0.85, -0.62], [-0.85, 0.62], [0.85, 0.62]];
  const parisLift = (t) => K(t, [[32.1, 0], [32.6, 1]]);
  const parisX = (t) => K(t, [[30.0, -7.2], [31.9, 0]], (u) => 1 - (1 - u) ** 2) + Math.max(0, t - 32.75) ** 1.4 * 1.5;
  // HILL: ant lanes from the street, between the houses, up the hill
    function henderson(t, i) {
    const spots = [[55.0, -1.2], [55.85, -1.35], [56.7, -1.15]], [x, z] = spots[i], p = basePose(); p.eyes = blink(t, i + 1); p.y = p.floor = SW_H;
    const turn = K(t, [[38.2 + 0.08 * i, 0], [38.75 + 0.08 * i, 1]]);
    Object.assign(p, { x, z, rotY: lerpAngle(-0.12 + i * 0.1, PI - 0.1, turn) });
    p.mouth = turn > 0.6 ? 'o' : 'smile';
    p.armA = i === 1 ? mixArm(A(-1.2, 0.3, -1.6, 0.3), REST, turn) : REST; p.armB = i === 1 ? mixArm(A(-1.2, 0.3, -1.6, -0.3), REST, turn) : (i === 0 ? mixArm(A(-0.4, 1.2, -1.9, -0.6), REST, turn) : REST);   // a family photo pose
    if (turn > 0.8) { p.headPitch = -0.45; p.lean = -0.08; }
    return p;
  }
  // MOVING: the procession walks −x along z = −1.0; each item is lifted from its spot first
  const MV = 1.7, MZ = -1.0;
  function mover(t, j) {
    const starts = [[40.4, 1.8, -1.45, 41.0], [41.3, 3.6, MZ, 0], [42.2, 3.6, MZ, 0], [42.9, 3.6, MZ, 0]];   // [t0, x0, z0, lift-done]
    const [t0, x0, z0, ld] = starts[j];
    if (j === 0) {
      if (t < ld) return { x: x0, z: z0, rotY: -PI / 2, carry: K(t, [[40.5, 0], [41.0, 1]]), dist: 0 };
      const w = walkLegs(t, [x0, z0], [{ t0: ld + 0.05, t1: ld + 5.2, pts: [[x0 - 0.8, MZ], [-6.5, MZ]] }]); return { x: w.x, z: w.z, rotY: w.head ?? -PI / 2, carry: 1, dist: w.dist };
    }
    if (j === 1) {   // armchair: walk to it, lift, go on
      const w = walkLegs(t, [x0, MZ], [{ t0: t0, t1: t0 + 1.9, pts: [[0.25, MZ]] }, { t0: t0 + 2.5, t1: t0 + 6.5, pts: [[-6.5, MZ]] }]);
      return { x: w.x, z: w.z, rotY: -PI / 2, carry: K(t, [[t0 + 1.9, 0], [t0 + 2.4, 1]]), dist: w.dist };
    }
    const w = walkLegs(t, [x0, MZ], [{ t0, t1: t0 + 6.0, pts: [[-6.5, MZ]] }]);
    return { x: w.x, z: w.z, rotY: -PI / 2, carry: j === 2 ? 1 : 0, dist: w.dist };
  }
  // LEASH
  function waltLeash(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.mouth = 'smile';
    const w = walkLegs(t, [-6.0, -1.15], [{ t0: 45.6, t1: 48.0, pts: [[-3.1, -1.15]] }]);
    Object.assign(p, { x: w.x, z: w.z, rotY: PI / 2, dist: w.dist, speed: w.speed, y: SH, floor: SH });
    p.armB = LEASH_B; p.armA = REST;
    const thr = K(t, [[48.05, 0], [48.3, 1], [48.55, 0]]);
    if (t > 47.9 && t < 48.7) { p.armB = mixArm(LEASH_B, THROW_B, thr); p.rotY = PI / 2 - 0.3 * thr; }
    if (t > 48.6) { p.armB = REST; p.headYaw = 0.2; }
    if (t > 49.6) { const f = K(t, [[49.95, 0], [50.25, 1]]); p.armB = mixArm(REST, FACE_B, f); p.mouth = f > 0.5 ? 'flat' : 'o'; if (f > 0.6) p.eyes = 'closed'; }
    return p;
  }
  function antLeash(t) {
    if (t < 48.3) { const x = walkX(t) + 1.55 + 0.08 * Math.sin(t * 2.3), w = walkLegs(t, [-4.45, -1.0], [{ t0: 45.6, t1: 48.0, pts: [[-1.55, -1.0]] }]); return { x, z: -1.0 + 0.06 * Math.sin(t * 1.7), rotY: PI / 2, dist: w.dist, look: K(t, [[46.6, 0], [46.9, 0.6], [47.6, 0.6], [47.9, 0]]) }; }
    if (t < 48.95) { const u = t - 48.3; return { x: -1.55 + 1.6 * u + 7 * u * u, z: -1.0, rotY: PI / 2, dist: 1.6 * u + 7 * u * u + 3 }; }
    const w = walkLegs(t, [6.0, -1.05], [{ t0: 48.95, t1: 49.65, pts: [[-1.0, -1.05]] }]);
    return { x: w.x, z: w.z, rotY: -PI / 2, dist: w.dist, carry: K(t, [[49.65, 1], [49.9, 0.3]]) };
  }
  function neighborWalk(t) {
    const p = basePose(); p.eyes = blink(t, 4); p.mouth = 'smile';
    const w = walkLegs(t, [-0.6, -2.05], [{ t0: 45.6, t1: 47.6, pts: [[-2.7, -2.05]] }, { t0: 48.6, t1: 51.0, pts: [[-6.5, -2.15]] }]);
    Object.assign(p, { x: w.x, z: w.z, rotY: -PI / 2, dist: w.dist, speed: w.speed, y: SH, floor: SH });
    const stare = K(t, [[46.9, 0], [47.2, 1], [48.5, 1], [48.8, 0]]); p.headYaw = 1.0 * stare; if (stare > 0.5) p.mouth = 'o';
    p.armA = A(-0.3, 0.15, -0.4, 0.1); return p;
  }
  function vendorRun(t) {
    const p = basePose(); p.eyes = blink(t, 6); p.mouth = 'o';
    const w = walkLegs(t, [4.5, -1.5], [{ t0: 49.4, t1: 50.5, pts: [[-0.05, -1.5]] }]);
    Object.assign(p, { x: w.x, z: w.z, rotY: -PI / 2, dist: w.dist, speed: w.speed, y: SH, floor: SH, lean: 0.12 });
    p.armA = wave(t, 0.4); p.armB = wave(t, 2.0); return p;
  }

  // ---------------------------------------------------------------- per-frame update
  let cur = null;
  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'kit' && t < GROW + 0.5 ? 0.01 : 0.03; studio.fill.intensity = 0.45;
    ALL.forEach((r) => (r.root.visible = false)); ants.forEach((a) => (a.g.visible = false));
    dog.g.visible = false; book.visible = false; clip.visible = false; baguette.visible = false; ball.visible = false; collar.visible = false;
    mug.visible = false; puffN = 0; puffs.hide(); setLeash(null);
    swarm.begin(); let cubeN = 0, leafN = 0, dirtN = 0;
    crowd.forEach((c) => outfit(c, c.base)); outfit(walt, ROBE, 0x8fa8c8);
    let jolt = 0;

    if (S === 'kit') {
      if (t < 50) {
        // ---- the premise + the fridge
        const s = growS(t), g = clamp((s - 0.025) / 0.975), sag = K(t, [[GROW + 0.1, 0], [GROW + 0.25, 1], [GROW + 0.7, 0.35]]);
        kit.table.scale.y = 1 - 0.06 * sag; kit.table.rotation.z = 0.012 * sag * Math.sin(t * 40);
        const top = TT * kit.table.scale.y;
        const jump = Math.max(0, Math.sin(clamp((t - GROW - 0.15) / 0.35) * PI)) * 0.07;
        tmug.position.set(...[BREAK.mug[0], top + jump, BREAK.mug[1]]); tmug.rotation.z = 0.3 * jump * 10 * Math.sin(t * 30) * 0.1;
        plate.position.set(BREAK.plate[0], top + jump * 0.6, BREAK.plate[1]); paper.position.y = top + 0.004 + jump * 0.5;
        fridge.position.copy(FRIDGE_HOME.p); fridge.quaternion.copy(FRIDGE_HOME.q);
        if (shot.cam === 'kitA') {
          const w = kitWalk(t), carry = K(t, [[7.45, 0], [8.0, 1]]);
          const x = lerp(w.x, 0.53, g), z = lerp(w.z, -0.42, g), ry = lerpAngle(w.head ?? -2.0, -PI / 2, g);
          const a = ant(0, 'kit', x, top, z, ry, t, { dist: t < GROW ? w.dist * s / Math.max(s, 0.08) : undefined, speed: w.speed / 0.05, carry, look: K(t, [[8.15, 0], [8.5, 0.75]]), mouth: K(t, [[5.4, 0], [5.6, 0.6], [5.9, 0.1]]) }, s);
          // the sugar bowl: on the table, then in its jaws
          const home = L('kit', BREAK.sugar[0], top, BREAK.sugar[1]);
          if (carry > 0) { const r = riding(a, new THREE.Vector3(0, 0.38, 0.62), new THREE.Quaternion()); sugar.position.copy(kit.root.worldToLocal(home.lerp(r.p, carry))); } else sugar.position.copy(kit.root.worldToLocal(home));
          sugar.rotation.set(0, 0, 0);
          dust(t, GROW + 0.12, L('kit', 0.5, top + 0.05, -0.42), 0.9, 7, 1.2);
          if (t > GROW + 0.1 && t < GROW + 0.6) jolt = 0.012 * Math.exp(-(t - GROW - 0.1) * 7);
        } else {
          sugar.position.set(BREAK.sugar[0] - 0.1, top, BREAK.sugar[1] + 0.12);
          const f = antFridge(t), a = ant(0, 'kit', f.x, 0, f.z, f.rotY, t, f);
          const r = riding(a, FRIDGE_CARRY.p, FRIDGE_CARRY.q), home = FRIDGE_HOME.p.clone().add(kit.root.position);
          placeWorld(fridge, home.lerp(r.p, f.carry), new THREE.Quaternion().slerp(r.q, f.carry), kit.root);
          put(walt, 'kit', waltSink(t)); mug.visible = true;
          if (t > 10.0 && t < 10.5) jolt = 0.006 * Math.sin((t - 10) * 20);
        }
      } else {
        // ---- +1 year: it brings the fridge back, then visits Walt at the table
        kit.table.scale.y = 1; kit.table.rotation.z = 0;
        tmug.position.set(0.85, TT, -0.95); plate.position.set(BREAK.plate[0], TT, BREAK.plate[1]); paper.position.y = TT + 0.004;
        const f = antReturn(t), a = ant(0, 'kit', f.x, 0, f.z, f.rotY, t, f);
        const r = riding(a, FRIDGE_CARRY.p, FRIDGE_CARRY.q), home = FRIDGE_HOME.p.clone().add(kit.root.position);
        placeWorld(fridge, home.lerp(r.p, f.carry), new THREE.Quaternion().slerp(r.q, f.carry), kit.root);
        dust(t, 53.45, L('kit', fx, 0.05, fz + 0.3), 0.8, 6, 1.0);
        if (t > 53.4 && t < 53.8) jolt = 0.008 * Math.exp(-(t - 53.4) * 8);
        put(walt, 'kit', waltTable(t)); mug.visible = t < 53.6;
        const sl = bowlSlide(t); sugar.position.set(lerp(BOWL_END[0][0], BOWL_END[1][0], sl), TT, lerp(BOWL_END[0][1], BOWL_END[1][1], sl));
      }
    } else if (S === 'burb') {
      if (shot.cam === 'car') {
        burb.aimSun(-1, -1, 12); hill.visible = false; parkBits.forEach((o) => (o.visible = true)); saleSign.visible = false; hole.visible = true; waltCar.g.visible = true;
        const D = carD(t), Lp = plen(CAR_PATH), ys = [];
        const OFFS = [[-0.48, 1.25], [0.48, 1.25], [-0.48, 0], [0.48, 0], [-0.48, -1.25], [0.48, -1.25]];
        OFFS.forEach(([la, lo], j) => {
          const d = D + lo, [x0, z0, h] = along(CAR_PATH, Math.min(d, Lp)), x = x0 + Math.cos(h) * la, z = z0 - Math.sin(h) * la;
          const sink = Math.max(0, d - Lp + 0.3) * 1.6, curb = z < 0 && z > -2 ? SW_H : 0;
          const y = Math.max(moundY(x, z), curb) - sink;
          ys.push(y); ant(1 + j, 'burb', x, y, z, h, t, { dist: D + j * 0.11, speed: 2, carry: 1 });
        });
        const front = (ys[0] + ys[1]) / 2, back = (ys[4] + ys[5]) / 2, [cx, cz, ch] = along(CAR_PATH, Math.min(D, Lp));
        const sinkC = Math.max(0, D - Lp + 0.3) * 1.6;
        waltCar.g.position.set(cx, (front + back) / 2 + 0.78 - sinkC * 0.3, cz);
        waltCar.g.rotation.set(Math.atan2(back - front, 2.5), ch, 0, 'YXZ');
        put(walt, 'burb', waltChase(t));
        dust(t, 18.95, L('burb', MOUND[0], MH, MOUND[1]), 1.0, 7, 1.1, dirtCol);
        if (t > 18.95 && t < 19.5) jolt = 0.01 * Math.exp(-(t - 18.95) * 7);
      } else {
        // HILL time-lapse: the sun sweeps, the hill rises behind the houses, ants stream up it
        const k = hillK(t);
        hole.visible = false; waltCar.g.visible = false; hill.visible = true; parkBits.forEach((o) => (o.visible = false)); hill.scale.set(lerp(0.55, 1, k), k, lerp(0.55, 1, k));
        burb.aimSun(57, -6, 16);
        const sun = burb.lights.sun, ang = lerp(-0.7, 0.7, clamp((t - 35.2) / 5.2));
        sun.position.copy(sun.target.position).add(_v.set(0.45 * Math.cos(ang) - 0.6 * Math.sin(ang), 0.8, 0.45 * Math.sin(ang) + 0.6 * Math.cos(ang)).normalize().multiplyScalar(60));
        const lane = (pts, dir, off) => { const Lp = plen(pts); for (let n = 0; n < 44; n++) { const d = ((n * 1.5 + 2.2 * (t - 35.2) * dir + off) % Lp + Lp) % Lp, [x, z, h] = along(pts, d), y = hillY(x, z, k); const pitch = -Math.atan2(hillY(x + Math.sin(h) * 0.4, z + Math.cos(h) * 0.4, k) - y, 0.4); swarm.add(x + OFF.burb[0], y, z, h, 1, { t, dist: d, speed: 2, pitch, carry: dir > 0 ? 1 : 0 }); if (dir > 0 && dirtN < 200) { _m.compose(_v.set(x + Math.sin(h) * 0.12 + OFF.burb[0], y + 1.0, z + Math.cos(h) * 0.12), _q.identity(), _s.setScalar(1)); dirt.setMatrixAt(dirtN++, _m); } } };
        const sc = lerp(0.55, 1, k); lane([[71, 1.5], [67.5, -1.6], ...spiral(sc, 0.75, 1.15, false)], 1, 0); lane([...spiral(sc, 0.75 + PI, 1.15, false).reverse(), [48.5, -2.0], [45, 1.5]], 1, 0.7);
        crowd.slice(0, 3).forEach((c, i) => { outfit(c, [0x6fa84f, 0xe58fa6, 0xf2b632][i]); put(c, 'burb', henderson(t, i)); });
        saleSign.visible = t > 39.0; const pop = K(t, [[39.0, 0], [39.3, 1.15], [39.45, 0.95], [39.6, 1]]); saleSign.position.set(55.55, 0, -2.7); saleSign.rotation.y = -0.1; saleSign.scale.setScalar(Math.max(0.001, pop));
        dust(t, 39.05, L('burb', 55.6, 0.1, -2.7), 0.6, 5, 0.8, dirtCol);
      }
    } else if (S === 'city') {
      city.setShadowFocus(0, -2, 30); city.setTime({}); city.setSignal(t > 23.3 ? 'green' : 'red');
      for (const [z0, dir] of [[-5.4, 1], [-6.6, -1]]) {
        for (let n = 0; n < 64; n++) {
          const span = 64 * TRAIL_GAP, x = (((n * TRAIL_GAP + TRAIL_V * (t - 19.6) * dir) % span) + span) % span - span / 2;
          const z = z0 + 0.12 * Math.sin(n * 2.3 + t * 1.3), h = dir > 0 ? PI / 2 : -PI / 2;
          const carry = dir > 0 && n % 3 !== 2 ? 1 : 0;
          swarm.add(x, 0, z, h + 0.06 * Math.sin(n * 1.7 + t * 2), 1, { t: t + n * 0.37, dist: x * dir + 100, speed: 1.7, carry });
          if (carry) {
            if (n % 3 === 0 && cubeN < 200) { _m.compose(_v.set(x + 0.15 * dir, 1.12, z), _q.setFromEuler(_e.set(0.2, n, 0.1)), _s.setScalar(1)); cubes.setMatrixAt(cubeN++, _m); }
            else if (leafN < 120) { _m.compose(_v.set(x + 0.1 * dir, 1.15, z), _q.setFromEuler(_e.set(-PI / 2 + 0.5, 0, n)), _s.setScalar(1)); leaves.setMatrixAt(leafN++, _m); }
          }
        }
      }
      const p = basePose(); p.eyes = blink(t, 3); p.mouth = 'flat'; Object.assign(p, { x: 1.25, z: 0.6, rotY: 0.3 });
      p.armA = A(-0.2, 0.55, -1.6, -0.4); p.armB = A(-0.2, 0.55, -1.6, 0.4); outfit(crowd[4], 0x3d7bd9);      // hands on hips
      p.headYaw = 0.25 * Math.sin(t * 0.9); put(crowd[4], 'city', p);
    } else if (S === 'wed') {
      const ca = cakeAnt(t), ta = tableAnt(t);
      const a = ant(1, 'wed', ca.x, 0, ca.z, ca.rotY, t, ca), b = ant(2, 'wed', ta.x, 0, ta.z, ta.rotY, t, ta);
      // cake tiers: on the table → in A's jaws; the table → over B
      const homeT = L('wed', CAKE[0], 0.8, CAKE[1]), rT = riding(a, CAKE_CARRY, new THREE.Quaternion());
      placeWorld(tiers, homeT.lerp(rT.p, ca.carry), new THREE.Quaternion().slerp(rT.q, ca.carry), wed.root);
      const homeG = L('wed', CAKE[0], 0, CAKE[1]), rG = riding(b, new THREE.Vector3(0, 1.85, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(PI, PI / 2, 0)));
      const qT = new THREE.Quaternion().slerp(rG.q, ta.carry); placeWorld(cakeG, homeG.lerp(rG.p, ta.carry), qT, wed.root);
      const cakeW = tiers.getWorldPosition(new THREE.Vector3()).sub(L('wed', 0, 0, 0));
      GUESTS.forEach((_, i) => put(crowd[i], 'wed', guest(t, i, { x: cakeW.x, z: cakeW.z })));
      const pb = basePose(); pb.eyes = blink(t, 8); Object.assign(pb, { x: WD.bride[0], z: WD.bride[1], rotY: -PI / 2 + 0.06 * Math.sin(t * 1.3), lean: 0.03 + 0.03 * Math.sin(t * 1.3) }); pb.armB = A(-0.75, 0.2, -1.2, -0.4); pb.armA = A(-0.75, 0.2, -1.2, 0.4);
      const turn = K(t, [[26.45, 0], [26.8, 1]]); pb.headYaw = clamp(rel(faceToward(WD.bride[0], WD.bride[1], cakeW.x, cakeW.z) + PI / 2), -1.3, 1.3) * turn; pb.mouth = turn > 0.5 ? 'o' : 'smile'; put(bride, 'wed', pb);
      const pg = basePose(); pg.eyes = blink(t, 9); Object.assign(pg, { x: WD.groom[0], z: WD.groom[1], rotY: PI / 2 + 0.06 * Math.sin(t * 1.3 + 0.8) }); pg.mouth = 'smile';
      const sh = K(t, [[28.6, 0], [28.95, 1]]); pg.armA = mixArm(REST, SHRUG_A, sh); pg.armB = mixArm(REST, SHRUG_B, sh); pg.headYaw = clamp(rel(faceToward(WD.groom[0], WD.groom[1], cakeW.x, cakeW.z) - PI / 2), -1.3, 1.3) * turn; if (turn > 0.5) pg.mouth = sh > 0.5 ? 'flat' : 'o'; put(groom, 'wed', pg);
      const po = basePose(); po.eyes = 'closed'; po.mouth = 'flat'; Object.assign(po, { x: WD.officiant[0], z: WD.officiant[1], rotY: 0, headPitch: 0.45 }); po.armA = BOOK_A; po.armB = BOOK_B; put(officiant, 'wed', po);
      book.visible = true; const ha = handWorld(officiant, -1), hb = handWorld(officiant, 1); book.position.copy(ha.add(hb).multiplyScalar(0.5)).add(_w.set(0, 0.03, 0.04)); book.rotation.set(-0.5, 0, 0);
    } else if (S === 'paris') {
      paris.aimSun(BC[0], BC[1] - 4, 16);
      const lift = parisLift(t), dx = parisX(t);
      const cornersW = CORNERS.map(([cx, cz], j) => { const x = BC[0] + cx + Math.min(0, dx) + Math.max(0, dx), z = BC[1] + cz; return [x, z]; });
      cornersW.forEach(([x, z], j) => ant(1 + j, 'paris', x - 0.42, 0, z, PI / 2, t, { dist: dx + j * 0.13, speed: t < 31.9 || t > 32.75 ? 2 : 0, carry: lift }));
      // blanket: sags between the four lifted corners
      const bx = BC[0] + Math.max(0, dx) + Math.min(0, dx) * 0, h = 0.02 + 0.9 * lift;
      blanket.position.set(BC[0] + Math.max(0, dx), h, BC[1]);
      const pa = clothGeo.attributes.position;
      for (let i = 0; i < pa.count; i++) { const x = cloth0[i * 3], z = cloth0[i * 3 + 2]; pa.setY(i, -0.22 * lift * (1 - (x / 1.0) ** 2) * (1 - (z / 0.8) ** 2)); }
      pa.needsUpdate = true; clothGeo.computeVertexNormals();
      food.position.y = -0.2 * lift; void bx;
      // family: dad + kid behind the blanket facing us, mom on the left; heads follow the blanket
      const fam = [[11.75, 24.75, 0, 0], [12.75, 24.8, 0, 1]];
      fam.forEach(([x, z, ry, i]) => {
        const p = basePose(); p.eyes = blink(t, i + 2); p.mouth = 'smile';
        Object.assign(p, { x, z, rotY: ry, y: -0.76, footFwd: 0.75, lean: 0.12 }); p.armA = A(-0.5, 0.25, -0.5, 0.2); p.armB = A(-0.5, 0.25, -0.5, -0.2);
        const look = K(t, [[32.3 + 0.1 * i, 0], [32.7 + 0.1 * i, 1]]), tx = BC[0] + Math.max(0, dx);
        p.headYaw = clamp(rel(faceToward(x, z, tx, BC[1]) - ry), -1.4, 1.4) * look; if (look > 0.5) p.mouth = 'o';
        if (i === 0) { p.armB = A(-1.25, 0.32, -2.1, -0.75); }                                                    // dad: baguette at his mouth
        if (i === 1 && t > 34.0) { p.armB = wave(t, 0); p.mouth = 'smile'; }                                      // the kid waves goodbye
        if (i === 1) putS(kid, 'paris', p, 0.62); else put(crowd[5], 'paris', p);
      });
      outfit(crowd[5], 0x2f4f73);
      baguette.visible = true; const bh = handWorld(crowd[5], 1); baguette.position.copy(bh).add(_w.set(0.0, 0.02, 0.06)); baguette.rotation.set(0.2, 0, 1.3);
      // tower climbers on leg 0 + a column across the lawn
      for (let n = 0; n < 40; n++) {
        const up = n % 2 === 0, yy = ((n * 0.62 + (up ? 1 : -1) * 1.3 * (t - 30)) % 13 + 13) % 13;
        const lp = paris.legPoint(0, yy, up ? -0.35 : 0.35), lp2 = paris.legPoint(0, yy + 0.3, up ? -0.35 : 0.35);
        const fr = lp2.p.clone().sub(lp.p).multiplyScalar(up ? 1 : -1);
        const q = basisQ(lp.n, fr); swarm.add(lp.p.x + OFF.paris[0], lp.p.y, lp.p.z + OFF.paris[2], 0, 1, { t: t + n, dist: yy * 3, speed: 1.3, quat: q });
      }
      for (let n = 0; n < 22; n++) { const zz = 22.0 - (((n * 1.6 + 1.5 * (t - 30)) % 35)); swarm.add(15.6 + 0.15 * Math.sin(n) + OFF.paris[0], 0, zz + OFF.paris[2], PI, 1, { t: t + n, dist: -zz, speed: 1.5 }); }
    } else if (S === 'liv') {
      liv.setMode('evening');
      // sofa (ant 0 lifts it), armchair (ant 1), box stack (ant 2), the kid riding ant 3
      const m0 = mover(t, 0), a0 = ant(1, 'liv', m0.x, 0, m0.z, m0.rotY, t, m0);
      const rs = riding(a0, new THREE.Vector3(0, 0.45, -0.05), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, PI / 2, 0)));
      placeWorld(sofa, L('liv', 1.8, 0, -2.25).lerp(rs.p, m0.carry), new THREE.Quaternion().slerp(rs.q, m0.carry), liv.root);
      const m1 = mover(t, 1), a1 = ant(2, 'liv', m1.x, 0, m1.z, m1.rotY, t, m1);
      const ra = riding(a1, new THREE.Vector3(0, 0.6, 0.35), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, PI / 2, 0)));
      placeWorld(liv.armchair, L('liv', -0.35, 0, -1.92).lerp(ra.p, m1.carry), new THREE.Quaternion().slerp(ra.q, m1.carry), liv.root);
      const m2 = mover(t, 2), a2 = ant(3, 'liv', m2.x, 0, m2.z, m2.rotY, t, m2);
      if (t > 42.2) { const rb = riding(a2, new THREE.Vector3(0, 0.62, 0.0), new THREE.Quaternion()); placeWorld(stack, rb.p, rb.q, liv.root); } else { stack.position.set(5, 0, 0); }
      const m3 = mover(t, 3), a3 = ant(4, 'liv', m3.x, 0, m3.z, m3.rotY, t, m3);
      if (t > 42.9) {
        const seat = riding(a3, new THREE.Vector3(0, 0.6, -0.12), new THREE.Quaternion()).p, sl = liv.root.worldToLocal(seat.clone());
        const p = basePose(); p.eyes = blink(t, 5); p.mouth = 'smile'; Object.assign(p, { x: sl.x, z: sl.z, rotY: -PI / 2, footFwd: 0.25, lean: 0.05 });
        p.armA = wave(t, 0); p.armB = wave(t, 1.7); putS(kid, 'liv', p, 0.62, seat.y - 0.62 * (HIP_H - 0.17));
      }
      // dad with the clipboard at the left, mom with a lamp following the kid
      const pd = basePose(); pd.eyes = blink(t, 3); pd.mouth = 'smile'; Object.assign(pd, { x: -2.0, z: -2.05, rotY: 0.25 }); pd.armA = BOOK_A; pd.armB = BOOK_B; pd.headPitch = 0.35;
      const passing = [m0, m1, m2, m3].some((m) => m.x > -1.9 && m.x < -0.2); if (passing) { pd.headPitch = 0.0; pd.headYaw = 0.5; }
      put(crowd[7], 'liv', pd); outfit(crowd[7], 0x6fa84f);
      clip.visible = true; const ca = handWorld(crowd[7], -1), cb = handWorld(crowd[7], 1); clip.position.copy(ca.add(cb).multiplyScalar(0.5)).add(_w.set(0, 0.03, 0)); clip.rotation.set(-0.6, 0.5, 0);
    } else if (S === 'street') {
      street.aimSun(walkX(t), -1.2, 9); street.setSeason('summer', t, [walkX(t), -1]);
      outfit(walt, SWEATER, 0x34405c);
      const pw = waltLeash(t); put(walt, 'street', pw);
      const al = antLeash(t), a = ant(1, 'street', al.x, SH, al.z, al.rotY, t, al);
      collar.visible = true; a.head.updateMatrixWorld(true); collar.position.copy(a.head.localToWorld(_v.set(0, 0.0, 0.0))); collar.quaternion.copy(a.head.getWorldQuaternion(_q)).multiply(_q.clone().setFromEuler(_e.set(PI / 2 - 0.4, 0, 0)));
      const hand = street.root.worldToLocal(handWorld(walt, 1)), neck = street.root.worldToLocal(collar.position.clone());
      if (t < 48.15) setLeash(hand, neck, 0.25); else if (t < 49.4) { const tip = neck.clone().add(_w.set(-0.6, -0.2, 0)); tip.y = Math.max(SH + 0.02, tip.y - 0.45); setLeash(neck, tip, 0.1); }
      // ball flight
      if (t > 48.25 && t < 48.9) { ball.visible = true; const u = t - 48.25; ball.position.copy(L('street', -2.9 + 7.5 * u, 1.75 + 3.2 * u - 5 * u * u, -1.1)); }
      // cart: carried in from the right, set down in front of Walt
      if (t > 48.9) { const rc = riding(a, new THREE.Vector3(0, 0.62, -0.1), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, PI / 2, 0))); const home = L('street', -2.15, SH, -1.15); placeWorld(cart, rc.p.lerp(home, K(t, [[49.65, 0], [49.9, 1]])), rc.q, street.root); }
      else cart.position.set(CART_HOME.x + 20, CART_HOME.y, CART_HOME.z);
      dust(t, 49.9, L('street', -2.15, SH + 0.05, -1.15), 0.7, 5, 0.9);
      if (t > 49.9 && t < 50.3) jolt = 0.008 * Math.exp(-(t - 49.9) * 8);
      put(neighbor, 'street', neighborWalk(t));
      dog.g.visible = true; { const pn = neighborWalk(t), hide = K(t, [[46.9, 0], [47.3, 1], [48.6, 1], [48.9, 0]]); dog.g.position.copy(L('street', pn.x - 0.6 + 0.85 * hide, SH, pn.z + 0.55 - 1.0 * hide)); dog.g.scale.setScalar(1.3); dog.g.rotation.y = lerpAngle(-PI / 2, PI * 0.9, hide); dog.update(t, pn.speed > 0.1 ? 1 : 0); dog.setLie(0.7 * hide); }
      if (t > 49.4) put(vendor, 'street', vendorRun(t));
    }

    swarm.end(); cubes.count = cubeN; leaves.count = leafN; dirt.count = dirtN;
    cubes.instanceMatrix.needsUpdate = true; leaves.instanceMatrix.needsUpdate = true; dirt.instanceMatrix.needsUpdate = true;

    // camera (local → world)
    const c = CAMS[shot.cam], o = OFF[S];
    let P, Aim, fov = c.fov;
    if (c.fn) { const r = c.fn(t); P = r.p.map((v, i) => v + o[i]); Aim = r.a.map((v, i) => v + o[i]); if (r.fov) fov = r.fov; }
    else {
      const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
      P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]); Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    }
    if (jolt) { P = [P[0] + jolt * Math.sin(t * 70), P[1] + jolt * Math.sin(t * 55), P[2]]; }
    setCamera(P, Aim, fov, t, c.amp);
  }
  return { update };
}
