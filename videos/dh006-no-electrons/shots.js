// VIDEO dh006 — "What if electrons disappeared for five seconds?"  (science what-if). 67.5 s, 10 beats.
// v2: ONE immersive POV
// place first, in the second person — you're on a busy toy-city street at noon — and only then the scale-out to Earth and the
// Moon. A live countdown HUD (ELECTRONS DISAPPEAR IN 0:03.000 → ELECTRONS RETURN IN 0:05.000, which stays frozen while the world
// ends, then ticks → ELECTRONS BACK) + a TIME SLOWED DOWN line that falls from 10¹⁵× to 4×. The premise made visible: blue
// sparks boil off everything (the electrons leaving), the noon sky goes black, the street turns to x-ray glass (nothing can
// reflect light — not even your hands), the people fizz into glowing dust and blast apart, the street climbs 300 km.
// v3: the street freezes mid-chaos (a banana-peel slip, the dog mid-leap for a frisbee, the
// vendor's hot dog mid-toss); three cartoon electrons burst out saying "brb"; ONE hot dog never fizzes — it hangs intact in the
// x-ray street, spins past the blast, rides the energy bar, bounces on the Moon, and is all that's left when the electrons come
// back ("Except one hot dog." → NOOOOO → they explode anyway); Earth goes POP!
// Cartoon only: people become glowing dust; nobody suffers.
//
// SCIENCE (checked Oct 28 2026; the premise itself breaks charge conservation, so the numbers are napkin math on purpose):
// - Without electrons, matter is bare nuclei; light interacts with matter through its electrons. The Thomson cross section goes
//   as 1/m², so a proton scatters ~3 million × less light than an electron (astro.umd.edu ASTR601 lecture 13; Britannica
//   "Radiation: Compton scattering"). → nothing reflects light; blue sky = sunlight scattered by the air molecules' electrons.
// - Electrons in a 70 kg body ≈ protons ≈ 70 kg × ~0.55 / 1.66e-27 kg ≈ 2.3 × 10²⁸ (napkin; Z/A of water-rich tissue ≈ 0.55).
// - Coulomb explosion: stripped molecules blow apart in femtoseconds (nuclear motion ~10 fs; CEA/IRAMIS "Coulombian explosion";
//   arXiv 2112.10029 CEI review).
// - Feynman Lectures Vol. II §1-1: two people at arm's length with 1 % more electrons than protons would repel with a force
//   that could lift a "weight" equal to the entire Earth (feynmanlectures.caltech.edu/II_01.html).
// - The electric force between two protons is ≈ 1.24 × 10³⁶ × their gravitational pull (OpenStax College Physics) = "a trillion
//   trillion trillion to one".
// - Earth: diameter 12,742 km (NASA); gravitational binding energy ≈ 2.24 × 10³² J (Wikipedia "Gravitational binding energy").
//   Earth's bare-nucleus charge Q ≈ 2.8e32 C (Z/A ≈ 0.48) → Coulomb energy 3kQ²/5R ≈ 6.5e67 J ≈ 2.9e35 × the binding energy
//   (= 1.24e36 × (Z/A)², any density profile) = "300 billion trillion trillion times"; a supernova ≈ 1e44 J ≈ 450 billion ×.
//   U ≫ Earth's rest-mass energy, so the nuclei go relativistic at once: xkcd What If #140 "Proton Earth, Electron Moon" —
//   pushed "outward at near the speed of light", "untested" physics. → front at ≈ c: 1 ms → 300 km up; 0.021 s → Earth's radius
//   (it doubles); 1.26 s → past the Moon's 384,400 km orbit (NASA Moon fact sheet).
// - TIME SLOWED DOWN (HUD) = video seconds per physical second, per beat: 1 fs over 6 s ≈ 10¹⁵×, 1 ns over 6 s ≈ 10⁹×, 1 ms over
//   6 s = 6,000×, 0.021 s over 5.4 s ≈ 250×, 0.08 s over 5.7 s ≈ 70×, 1.2 s over 5.3 s ≈ 4×.
// - The ending is the premise taken literally: electrons that reappear where they vanished are an Earth-sized ball of pure
//   negative charge, so they Coulomb-explode too.
//
// Shot list (seconds)                                       | set    | what happens
//  0.0–14.0  pov    ELECTRONS DISAPPEAR IN 0:03.000 (title)  | street | POV down a busy sunny street: walkers, cars, a dog, pigeons. 6.5 SECOND 0:
//                                                            |        | everything freezes, blue sparks boil off it all; 8.6 the sky snaps black, the sun stays
// 14.0–20.0  hands  ELECTRONS RETURN IN 0:05.000             | street | look down at your hands + phone; the street, the people, then your hands turn to x-ray glass
// 20.0–26.0  fizz   TIME SLOWED DOWN 10¹⁵×                   | street | the glass people and things fizz into glowing dust
// 26.0–32.0  blast  10⁹×                                     | street | Feynman's 1 % line; on "100%" every dust person blasts apart
// 32.0–38.0  rise   6,000×                                   | street | the whole street lifts off as glowing dust; the camera cranes up after it
// 38.0–43.4  earth  250×                                     | space  | Earth bursts into a glowing dust ball and doubles
// 43.4–49.1  bars   70×                                      | space  | BLOW UP EARTH (tiny) vs ENERGY RELEASED (shoots past 1 SUPERNOVA, off the top)
// 49.1–54.4  moon   4×                                       | moon   | the lunar surface fizzing away; Earth's glow rises over the horizon and hits; rocks float off
// 54.4–59.75 back   FAST-FORWARD → ELECTRONS BACK            | space  | the electrons come back: a blue ball where Earth was
// 59.75–67.5 eboom                                           | space  | the blue ball explodes too. Fade 62.4, end card 63.0
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { K, clamp, lerp, rng, mat, mk, canvasTex, walkLegs } from '@engine/core.js';
import { makePerson, basePose, applyPose, handWorld } from '@engine/rig.js';
import { makePhone, makeDog, makeBirdFlock, makeHotDog, makeSpeechBubble } from '@engine/props.js';
import { buildSpace, makeSpritePool } from '@engine/sets/tech.js';
import { makeCar } from '@engine/sets/city.js';
import { buildStreet, SIDEWALK_H as SH } from '@engine/sets/street.js';
import { buildMoon } from '@engine/sets/moon.js';

const PI = Math.PI;
const OFF = { street: [3000, 0, 0], moon: [-12000, 0, 0], space: [0, 0, 40000] };

export const SHOTS = [
  { t0: 0, t1: 14.0, cam: 'pov', set: 'street' },
  { t0: 14.0, t1: 20.0, cam: 'hands', set: 'street' },
  { t0: 20.0, t1: 26.0, cam: 'fizz', set: 'street' },
  { t0: 26.0, t1: 32.0, cam: 'blast', set: 'street' },
  { t0: 32.0, t1: 38.0, cam: 'rise', set: 'street' },
  { t0: 38.0, t1: 43.4, cam: 'earth', set: 'space' },
  { t0: 43.4, t1: 49.1, cam: 'bars', set: 'space' },
  { t0: 49.1, t1: 54.4, cam: 'moon', set: 'moon' },
  { t0: 54.4, t1: 60.8, cam: 'back', set: 'space' },
  { t0: 60.8, t1: 67.5, cam: 'eboom', set: 'space' },
];
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- the beats (make_cues.py mirrors these)
const T0 = 6.5;         // SECOND 0: the electrons leave, everything freezes (music enters)
const T_SKY = 8.6;      // the noon sky snaps black
const T_GHOST = 16.85;  // "Not the buildings…": the street turns x-ray (far → near); the people at +0.9, your hands at +2.0
const T_FIZZ = 20.5;    // the glass people + things fizz into dust
const T_BLAST = 29.95;  // "100%": every dust person blasts apart
const T_RISE = 32.35;   // the street lifts off
const T_EARTH = 38.8;   // Earth bursts
const T_BAR = 45.95;    // the big bar shoots up
const T_WALL = 50.9;    // Earth's glow reaches the Moon
const T_BACK = 54.95;   // the electrons come back
const T_EBOOM = 60.85;  // …and explode too (v3: after "Except one hot dog." and their NOOOO)
const T_TOSS = 6.04, HD_V = [-1.6, 4.5, 0.6], HD_0 = [5.6, 1.3, -1.4];   // the vendor's toss: THE hot dog peaks at SECOND 0
const T_SLIP = 5.45;    // a passer-by steps on a banana peel (frozen mid-fall)
const BARS = [0, 0, 2150];                              // space: the bar chart (local)
const YOU = [12.8, -2.0];   // where you stand: the shop side of the back sidewalk (the curb lamp posts stay out of the lens), facing −x

// camera coords are LOCAL to the shot's set. p/a = [start, end]; fn(t) overrides for tracking shots.
export const CAMS = {
  pov:    { fn: (t) => { const u = K(t, [[0, 0], [14, 1]], (x) => x), sky = K(t, [[T_SKY - 0.6, 0], [T_SKY + 1.2, 1]]) * (1 - K(t, [[12.3, 0], [14, 1]])); return { p: [lerp(17.0, YOU[0] + 0.2, u), 1.62, YOU[1]], a: [-30, lerp(4.2, 5.6, u) + 14 * sky, lerp(-0.6, 0.2, u)] }; }, fov: 50, amp: 0.004 },
  hands:  { fn: null, fov: 56, amp: 0.002 },
  fizz:   { fn: (t) => { const u = K(t, [[20.0, 0], [26.0, 1]], (x) => x), pan = K(t, [[21.2, 0], [23.4, 1]]); return { p: [lerp(7.4, 4.2, u), lerp(2.3, 1.6, u), lerp(1.2, 2.2, u)], a: [lerp(4.86, -8, pan), lerp(2.33, 1.3, pan), lerp(-1.12, -1.6, pan)] }; }, fov: 48, amp: 0.004 },
  blast:  { p: [[-0.1, 1.4, 2.4], [-0.35, 1.45, 1.7]], a: [[-0.4, 1.3, -2.2], [-0.45, 1.45, -2.2]], fov: 58, amp: 0.004 },
  rise:   { fn: (t) => { const u = K(t, [[32.0, 0], [38.0, 1]], (x) => x), up = K(t, [[T_RISE, 0], [37.2, 1]], (x) => 1 - (1 - x) ** 2); return { p: [lerp(9, 13, u), 1.8 + 4 * u, lerp(3.4, 7, u)], a: [lerp(-14, -6, u), 1.6 + 34 * up, lerp(2.0, 1.0, u)] }; }, fov: 58, amp: 0.004 },
  earth:  { fn: (t) => { const u = K(t, [[38.0, 0], [43.4, 1]]), d = lerp(2500, 3500, u), a = -0.35 + 0.08 * u; return { p: [Math.sin(a) * d, 260 - 80 * u, Math.cos(a) * d], a: [0, 0, 0] }; }, fov: 46, amp: 0 },
  bars:   { fn: (t) => { const up = K(t, [[T_BAR + 0.1, 0], [T_BAR + 1.6, 1]]), back = K(t, [[T_BAR + 1.2, 0], [49.1, 1]]), sw = K(t, [[43.4, 0], [T_BAR, 1]]); return { p: [BARS[0] + lerp(5.2, 3.2, sw) + 3 * back, BARS[1] + 1.6 + 1.5 * back, BARS[2] + 8.4 + 9 * back], a: [BARS[0], BARS[1] + lerp(0.1, 9.5, up) + 6 * back, BARS[2]] }; }, fov: 46, amp: 0.004 },
  moon:   { fn: (t) => { const u = K(t, [[49.1, 0], [54.4, 1]], (x) => x), up = K(t, [[T_WALL + 0.3, 0], [54.4, 1]]); return { p: [lerp(0.9, 0.5, u), lerp(1.3, 1.6, u), lerp(6.6, 5.4, u)], a: [-1.8, lerp(2.4, 3.6, u) + 9 * up, -20] }; }, fov: 50, amp: 0.004 },
  back:   { p: [[240, 140, 2350], [185, 105, 1850]], a: [[0, 0, 0], [0, 0, 0]], fov: 44, amp: 0 },
  eboom:  { p: [[185, 105, 1850], [300, 175, 2900]], a: [[0, 0, 0], [0, 0, 0]], fov: 50, amp: 0 },
};

// ---------------------------------------------------------------- arm presets (tested in dh004 / 019)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const HOLD_A = A(-1.15, 0.14, -1.55, 0.5), HOLD_B = A(-1.15, 0.14, -1.55, -0.5);    // phone in both hands
const POINT_B = A(-1.45, 0.3, -0.1, -0.2);
const PHONE_B = A(-1.05, 0.5, -2.55, -0.35);                                        // phone to the ear
const TALK_A = A(-0.6, 0.35, -1.1, 0.3);                                            // a talking hand

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a, 0x3a4a3a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];

// ---------------------------------------------------------------- helpers: soft dot texture, glowing dust, surface sampling
function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(0.35, 'rgba(255,255,255,.75)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
/** One additive Points cloud refilled every frame: begin(), add(x,y,z, r,g,b, size m), end(camera). Color carries the alpha. */
function makeDust(scene, cap, dot) {
  const geo = new THREE.BufferGeometry(), P = new Float32Array(cap * 3), C = new Float32Array(cap * 3), S = new Float32Array(cap);
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aCol', new THREE.BufferAttribute(C, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(S, 1).setUsage(THREE.DynamicDrawUsage));
  const m = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: dot }, uScale: { value: 1000 } },
    vertexShader: 'attribute vec3 aCol; attribute float aSize; uniform float uScale; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(aSize * uScale / max(0.02, -mv.z), 1.2, 110.0); vC = aCol; }',
    fragmentShader: 'uniform sampler2D uMap; varying vec3 vC; void main(){ float a = texture2D(uMap, gl_PointCoord).r; gl_FragColor = vec4(vC * a, 1.0); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false; scene.add(pts);
  let n = 0;
  return {
    begin() { n = 0; },
    add(x, y, z, r, g, b, s) { if (n >= cap) return; const i = n * 3; P[i] = x; P[i + 1] = y; P[i + 2] = z; C[i] = r; C[i + 1] = g; C[i + 2] = b; S[n] = s; n++; },
    end(cam) {
      geo.setDrawRange(0, n); pts.visible = n > 0;
      for (const k of ['position', 'aCol', 'aSize']) geo.attributes[k].needsUpdate = true;
      m.uniforms.uScale.value = 1920 / (2 * Math.tan((cam.fov * PI) / 360));
    },
  };
}
const texCache = new Map();
function texel(map, u, v, out) {
  const img = map.image; if (!img || !img.getContext) return 1;
  let d = texCache.get(img); if (!d) { d = img.getContext('2d').getImageData(0, 0, img.width, img.height); texCache.set(img, d); }
  let uu = u * map.repeat.x + map.offset.x, vv = v * map.repeat.y + map.offset.y; uu -= Math.floor(uu); vv -= Math.floor(vv);
  const x = Math.min(d.width - 1, Math.floor(uu * d.width)), y = Math.min(d.height - 1, Math.floor((map.flipY ? 1 - vv : vv) * d.height)), i = (y * d.width + x) * 4;
  out.multiply(new THREE.Color().setRGB(d.data[i] / 255, d.data[i + 1] / 255, d.data[i + 2] / 255, THREE.SRGBColorSpace)); return d.data[i + 3] / 255;
}
/** n points spread over every mesh under objs (area-weighted, world space, current matrices) with each surface's color. */
function sampleSurface(objs, n, R, filter = null) {
  const list = [];
  for (const o of objs) { o.updateMatrixWorld(true); o.traverse((m) => { if (m.isMesh && !m.isInstancedMesh && !Array.isArray(m.material) && m.geometry.attributes.position && (!filter || filter(m))) list.push(m); }); }
  const sc = new THREE.Vector3();
  const S = list.map((m) => { const s = new MeshSurfaceSampler(m).setRandomGenerator(R).build(); sc.setFromMatrixScale(m.matrixWorld); const a = s.distribution[s.distribution.length - 1] * (sc.x * sc.y + sc.y * sc.z + sc.x * sc.z) / 3; return { m, s, a: a > 0 ? a : 0 }; });
  const total = S.reduce((q, e) => q + e.a, 0) || 1;
  const P = [], C = [], p = new THREE.Vector3(), nrm = new THREE.Vector3(), uv = new THREE.Vector2(), c = new THREE.Color();
  for (const e of S) {
    const k = Math.round((n * e.a) / total); if (!k) continue;
    const base = e.m.material.color || new THREE.Color(0xffffff), map = e.m.material.map;
    for (let j = 0; j < k; j++) {
      e.s.sample(p, nrm, undefined, uv); p.applyMatrix4(e.m.matrixWorld);
      c.copy(base); let alpha = 1; if (map) alpha = texel(map, uv.x, uv.y, c);
      if (e.m.material.emissive && e.m.material.emissiveIntensity > 0.3) c.lerp(e.m.material.emissive, 0.5);
      if (alpha < 0.35) continue;
      P.push(p.x, p.y, p.z); C.push(c.r, c.g, c.b);
    }
  }
  return { P: new Float32Array(P), C: new Float32Array(C), n: P.length / 3 };
}

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const DOT = dotTexture();

  // ---------------------------------------------------------------- sets (parked at offsets; one visible per shot)
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const moon = buildMoon(studio, {}); moon.root.position.set(...OFF.moon);
  const space = buildSpace(studio, {}); space.root.position.set(...OFF.space); space.setSpin(2.6);
  const ROOTS = { street: street.root, moon: moon.root, space: space.root };
  const blackFog = new THREE.Fog(0x020306, 45, 190);
  const FOGS = { street: streetFog, moon: null, space: null };
  const FAR = { street: 400, moon: 3600, space: 6000 };
  const L = (key, x, y, z) => new THREE.Vector3(x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]);
  const R = rng(61);
  const font = (w, sz) => `${w} ${sz}px Helvetica, Arial, sans-serif`;
  /** largest font size ≤ sz at which every line fits in maxW px (measured, so nothing runs past its card) */
  const fitFont = (g, lines, maxW, w, sz) => { g.font = font(w, sz); const mw = Math.max(...lines.map((l) => g.measureText(l).width)); return mw > maxW ? Math.floor((sz * maxW) / mw) : sz; };

  // ---------------------------------------------------------------- cast: a lunchtime crowd + you (head hidden: the camera is your eyes)
  const person = (o) => { const p = makePerson(o); scene.add(p.root); p.base = o; return p; };
  const crowd = Array.from({ length: 16 }, (_, i) => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    return person({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[i % TOPS.length], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.22, mustache: style !== 'bob' && R() < 0.25 ? HAIRS[Math.floor(R() * 3)] : null });
  });
  crowd.forEach((c) => (c.seed = R()));
  const ALL = [...crowd];
  const put = (rig, key, p) => {
    if (!p) { rig.root.visible = false; return; }
    applyPose(rig, { ...p, x: p.x + OFF[key][0], z: p.z + OFF[key][2], y: (p.y || 0) + OFF[key][1], floor: (p.floor || 0) + OFF[key][1] });
    rig.root.rotation.order = 'YXZ'; rig.root.rotation.x = -1.15 * (p.slip || 0); rig.root.position.y += 0.5 * (p.slip || 0);
    rig.root.visible = p.visible !== false;
  };
  // the lunch rush (τ = time, frozen at SECOND 0): walkers both ways on both sidewalks, one crossing, a dog walker, chatters, the cart
  const WALK = [[-16, -2.35, 1, 1.25], [-9, -1.5, 1, 1.35], [-2.5, -2.3, 1, 1.2], [6.2, -0.55, -1, 1.3], [0.5, -0.6, -1, 1.4], [-6, -0.5, -1, 1.25],
    [-14, 8.2, 1, 1.3], [-4, 8.3, 1, 1.2], [3, 9.0, -1, 1.35], [-9, 9.1, -1, 1.3]];
  const tau = (t) => Math.min(t, T0);
  function crowdPose(i, t) {
    const c = crowd[i], p = basePose(), q = tau(t); p.floor = SH; p.y = SH;
    if (i < WALK.length) {
      const [x0, z0, dir, v] = WALK[i], len = 40, w = walkLegs(q + c.seed * 0.7, [x0, z0], [{ t0: 0, t1: len / v, pts: [[x0, z0], [x0 + dir * len, z0]] }]);
      Object.assign(p, { x: w.x, z: w.z, rotY: w.head ?? (dir > 0 ? PI / 2 : -PI / 2), dist: w.dist, speed: w.speed, headYaw: (c.seed - 0.5) * 0.5, mouth: c.seed > 0.6 ? 'smile' : null });
      if (i === 4) p.armB = PHONE_B;
    } else if (i === 10) {   // crossing the road at the crosswalk
      const w = walkLegs(q, [4.2, 7.6], [{ t0: 0, t1: 8, pts: [[4.2, 7.6], [4.2, -0.3]] }]); Object.assign(p, { x: w.x, z: w.z, rotY: PI, dist: w.dist, speed: w.speed, floor: w.z > 7 || w.z < 0 ? SH : 0, y: w.z > 7 || w.z < 0 ? SH : 0 });
    } else if (i === 11) {   // the dog walker
      const w = walkLegs(q, [4.0, -0.95], [{ t0: 0, t1: 30, pts: [[4.0, -0.95], [-32, -0.95]] }]); Object.assign(p, { x: w.x, z: w.z, rotY: -PI / 2, dist: w.dist, speed: w.speed }); p.armA = A(-0.35, 0.2, -0.4, 0.2);
    } else if (i === 12 || i === 13) {   // two friends chatting at the market door
      const k = i - 12; Object.assign(p, { x: 0.6 + (k ? 0.35 : -0.35), z: -2.1, rotY: k ? -PI / 2 - 0.5 : PI / 2 + 0.5, mouth: Math.sin(q * 7 + k * 2) > 0.2 ? 'o' : 'smile', headPitch: 0.05 }); p.armB = k ? TALK_A : POINT_B;
    } else if (i === 14) {   // the hot-dog vendor, mid-toss
      const up = K(q, [[T_TOSS - 0.45, 0], [T_TOSS, 1]]); Object.assign(p, { x: 5.6, z: -1.95, rotY: 0.25, headPitch: -0.25 * up, mouth: 'smile' }); p.armB = A(lerp(-0.6, -2.6, up), lerp(0.2, 0.35, up), lerp(-1.2, -0.3, up), -0.2);
    } else {                 // the banana peel: walking +x, then feet up, frozen mid-fall
      const w = walkLegs(q, [6.6, -1.35], [{ t0: 0, t1: 30, pts: [[6.6, -1.35], [27.6, -1.35]] }]), sl = K(q, [[T_SLIP, 0], [T_SLIP + 0.9, 1]]);
      Object.assign(p, { x: w.x, z: w.z, rotY: PI / 2, dist: sl > 0 ? w.dist - 0.2 * sl : w.dist, speed: w.speed * (1 - sl), mouth: sl > 0.3 ? 'o' : null, footFwd: 0.7 * sl, headPitch: -0.3 * sl });
      p.armA = A(lerp(0.03, -2.4, sl), lerp(0.07, 0.9, sl), -0.3, 0, 1 - sl); p.armB = A(lerp(0.03, -2.2, sl), lerp(0.07, 0.8, sl), -0.4, 0, 1 - sl); p.slip = sl;
    }
    return p;
  }
    const dogR = makeDog({ color: 0xc98e4a }); scene.add(dogR.g);
  // THE hot dog (the one thing that never fizzes) + two that do; a banana peel; the dog's frisbee
  const hotdog = makeHotDog(); scene.add(hotdog);
  hotdog.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.emissive = m.material.color.clone(); } });   // it glows a little: it's the one thing still reflecting light
  const hd2 = [0, 1].map(() => { const h = makeHotDog(); h.scale.setScalar(2.2); street.root.add(h); return h; });
  const HD2 = [[[5.6, 1.3, -1.4], [-0.6, 4.1, 1.1], 5.95], [[5.6, 1.3, -1.4], [-2.4, 3.6, 0.2], 6.1]];
  const tossAt = (p0, v, t0, q) => { const a = Math.max(0, q - t0); return new THREE.Vector3(p0[0] + v[0] * a, p0[1] + v[1] * a - 4.9 * a * a, p0[2] + v[2] * a); };
  const peel = new THREE.Group(); street.root.add(peel); peel.position.set(6.6 + 0.7 * T_SLIP + 0.15, SH + 0.01, -1.35);
  { const pm = mat(0xf2d34a, 0.6); for (let k = 0; k < 3; k++) { const leaf = mk(new THREE.SphereGeometry(0.09, 10, 6), pm, peel, Math.cos(k * 2.1) * 0.08, 0.015, Math.sin(k * 2.1) * 0.08); leaf.scale.set(1.3, 0.18, 0.5); leaf.rotation.y = k * 2.1; } mk(new THREE.SphereGeometry(0.03, 8, 6), mat(0x6a4a2a, 0.7), peel, 0, 0.03, 0); }
  const frisbee = mk(new THREE.CylinderGeometry(0.13, 0.11, 0.025, 20), mat(0xe2574c, 0.4), scene, 0, 0, 0);
  function makeElectron() {
    const g = new THREE.Group();
    mk(new THREE.SphereGeometry(1, 28, 20), new THREE.MeshStandardMaterial({ color: 0x4f94ff, emissive: 0x2a64e8, emissiveIntensity: 0.75, roughness: 0.25 }), g);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: new THREE.Color(0.3, 0.55, 1.5), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }));
    glow.scale.setScalar(3.6); g.add(glow);
    const eyes = new THREE.Group(); g.add(eyes); const black = mat(0x0d0f18, 0.3), white = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (const sx of [-1, 1]) { const e = mk(new THREE.SphereGeometry(0.17, 14, 10), black, eyes, sx * 0.33, 0.16, 0.9); mk(new THREE.SphereGeometry(0.06, 8, 6), white, e, 0.05, 0.07, 0.13); }
    const smile = mk(new THREE.TorusGeometry(0.27, 0.055, 6, 18, PI), black, g, 0, -0.2, 0.93); smile.rotation.z = PI;
    const oh = mk(new THREE.SphereGeometry(0.15, 12, 10), black, g, 0, -0.27, 0.93); oh.scale.set(1, 1.25, 0.4);
    const minus = mk(new THREE.BoxGeometry(0.5, 0.11, 0.08), white, g, 0, 0.62, 0.77); minus.rotation.x = -0.68;
    return { g, setFace(m) { smile.visible = m !== 'o'; oh.visible = m === 'o'; }, look(dx, dy = 0) { eyes.position.set(dx * 0.12, dy * 0.08, 0); } };
  }
  const elec = [0, 1, 2].map(() => { const e = makeElectron(); scene.add(e.g); e.g.visible = false; return e; });
  const brb = makeSpeechBubble({ lines: ['brb'], maxChars: 8, accent: '#4f94ff', width: 1 }); scene.add(brb.sprite); brb.sprite.visible = false;
  const huh = makeSpeechBubble({ lines: ['?'], maxChars: 4, accent: '#4f94ff', width: 1 }); scene.add(huh.sprite); huh.sprite.visible = false;
  const noo = makeSpeechBubble({ lines: ['NOOOOO'], maxChars: 10, accent: '#d2283f', width: 1 }); scene.add(noo.sprite); noo.sprite.visible = false;
  const popTex = canvasTex(512, 512, (g, w, h) => {
    g.translate(w / 2, h / 2); g.beginPath(); for (let k = 0; k < 28; k++) { const a = (k / 28) * PI * 2, r = k % 2 ? 150 : 240; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
    g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 14; g.strokeStyle = '#d2283f'; g.stroke();
    g.fillStyle = '#d2283f'; g.font = font('900', fitFont(g, ['POP!'], 300, '900', 170)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('POP!', 0, 8);
  });
  const pop = new THREE.Sprite(new THREE.SpriteMaterial({ map: popTex, transparent: true, depthWrite: false, toneMapped: false, fog: false })); pop.visible = false; scene.add(pop);
  const flock = makeBirdFlock(30); scene.add(flock.g);
  const PIGEONS = Array.from({ length: 14 }, (_, i) => [-10 + (i % 5) * 1.6, 4.0 + ((i * 0.37) % 1) * 2.8, 1.0 + ((i * 0.61) % 1) * 5, ((i * 0.53) % 1) * 6]);
  const pigeonAt = (i, t) => { const [x, y, z, ph] = PIGEONS[i], q = tau(t); return [x + 4.2 * q, y + 0.3 * Math.sin(q * 2 + ph), z + 0.2 * Math.sin(q * 1.3 + ph), Math.abs(Math.sin(q * 14 + ph * 3))]; };
  // cars: two lanes, one each way, timed so nobody is ever in front of a car (and the one by the crosswalk freezes just past it)
  const CARS = [[0xd2483f, 22, 2.6, -7], [0x3d7bd9, -40, 4.4, 7], [0xf1c24a, 48, 2.6, -6]];
  const cars = CARS.map(([c, x0, z, v], i) => { const car = makeCar(c, i + 3); car.g.rotation.y = v > 0 ? PI / 2 : -PI / 2; street.root.add(car.g); return { car, x0, z, v }; });
  const placeCars = (t) => cars.forEach(({ car, x0, z, v }) => car.g.position.set(x0 + v * tau(t), 0, z));
  const povHands = new THREE.Group(); scene.add(povHands);
  { const sleeve = mat(0x2f4f73, 0.85), skin = mat(0xe2ad8c, 0.6);
    for (const sx of [-1, 1]) {
      const a0 = new THREE.Vector3(sx * 0.2, -0.36, 0.0), a1 = new THREE.Vector3(sx * 0.075, -0.15, -0.36), d = a1.clone().sub(a0);
      const arm = mk(new THREE.CapsuleGeometry(0.038, d.length(), 4, 12), sleeve, povHands); arm.position.copy(a0).add(a1).multiplyScalar(0.5); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      const hand = mk(new THREE.SphereGeometry(0.04, 16, 12), skin, povHands, sx * 0.06, -0.135, -0.39); hand.scale.set(0.75, 0.45, 1.25); hand.rotation.z = -sx * 0.5;
      for (let f = 0; f < 4; f++) { const fg = mk(new THREE.CapsuleGeometry(0.009, 0.03, 3, 6), skin, povHands, sx * (0.035 - 0.004 * f), -0.115 - 0.012 * f, -0.415 + 0.005 * f); fg.rotation.set(1.2, 0, sx * 1.3); }
      const thumb = mk(new THREE.CapsuleGeometry(0.011, 0.035, 3, 8), skin, povHands, sx * 0.04, -0.11, -0.38); thumb.rotation.set(0.6, 0, sx * 0.8);
    } }
  const phone = makePhone(); povHands.add(phone.g); phone.g.position.set(0, -0.105, -0.41); phone.g.rotation.set(1.05, 0, 0);
  const povCam = new THREE.PerspectiveCamera();
  const scrMesh = phone.g.children.find((o) => o.material === phone.screenMat);
  scrMesh.material = new THREE.MeshBasicMaterial({ color: 0x050608 });

  // ---------------------------------------------------------------- particles
  const dust = makeDust(scene, 150000, DOT);
  const flashes = makeSpritePool(scene, 6, 'fire');
  const boomLight = new THREE.PointLight(0xffe0b0, 0, 60, 1.4); scene.add(boomLight);

  // ---------------------------------------------------------------- STREET: black sky + sun, the x-ray look, everything frozen at SECOND 0
  const streetSky = street.root.children.find((o) => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius === 150);
  const skyDay = streetSky ? streetSky.material : null;
  const starTex = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#020306'; g.fillRect(0, 0, w, h); const r = rng(9); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.65})`; g.beginPath(); g.arc(r() * w, r() * h * 0.62, 0.5 + r() * 1.1, 0, 7); g.fill(); } });
  const skyBlack = new THREE.MeshBasicMaterial({ map: starTex, side: THREE.BackSide, fog: false, toneMapped: false });
  const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: new THREE.Color(3, 2.8, 2.4), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
  sunDisc.visible = false; street.root.add(sunDisc);
  const ghostVS = 'varying vec3 vN; varying vec3 vV;\n#include <common>\nvoid main(){\n#include <beginnormal_vertex>\n#include <defaultnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>\nvN = normalize(transformedNormal); vV = normalize(-mvPosition.xyz); }';
  const ghostFS = 'uniform vec3 uC; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6); gl_FragColor = vec4(uC * (0.012 + uK * f), 1.0); }';
  const ghost = (c, k) => new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color(c) }, uK: { value: k } }, vertexShader: ghostVS, fragmentShader: ghostFS, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const ghostSet = ghost(0x7fd4ff, 0.42), ghostPeople = ghost(0xffb8e8, 1.2), ghostCar = ghost(0x9fe8ff, 0.9), ghostYou = ghost(0xfff0f6, 1.5);
  const camStart = L('street', YOU[0], 1.6, YOU[1]);
  const ghosts = [];
  street.root.updateMatrixWorld(true);
  street.root.traverse((m) => { if (!m.isMesh || m === streetSky) return; const d = m.getWorldPosition(new THREE.Vector3()).distanceTo(camStart); ghosts.push({ m, orig: m.material, gm: ghostSet, ts: T_GHOST + 0.9 * (1 - clamp((d - 4) / 70)) }); });
  cars.forEach(({ car }) => car.g.traverse((m) => { const g0 = ghosts.find((g) => g.m === m); if (g0) g0.gm = ghostCar; }));
  const rigGhosts = [];
  crowd.forEach((c) => c.root.traverse((m) => { if (m.isMesh) rigGhosts.push({ m, orig: m.material, gm: ghostPeople, ts: T_GHOST + 0.9 }); }));
  dogR.g.traverse((m) => { if (m.isMesh) rigGhosts.push({ m, orig: m.material, gm: ghostPeople, ts: T_GHOST + 0.9 }); });
  flock.g.traverse((m) => { if (m.isMesh) rigGhosts.push({ m, orig: m.material, gm: ghostPeople, ts: T_GHOST + 0.9 }); });
  povHands.traverse((m) => { if (m.isMesh) rigGhosts.push({ m, orig: m.material, gm: ghostYou, ts: T_GHOST + 2.0 }); });
  // frozen at SECOND 0: pose everyone once and sample them (the electrons boil off these points; later the people fizz from them)
  crowd.forEach((c, i) => put(c, 'street', crowdPose(i, T0))); placeCars(T0);
  dogR.g.position.copy(L('street', 4.0 - 1.2 * T0 - 0.9, SH, -0.6)); dogR.g.rotation.y = -PI / 2; dogR.update(T0, 1.2);
  const people = crowd.map((c, i) => { const s = sampleSurface([c.root], 1100, rng(100 + i)); c.root.updateMatrixWorld(true); return { ...s, c: c.root.position.clone().add(new THREE.Vector3(0, 1.0, 0)) }; });
  hd2.forEach((h, k) => { h.position.copy(tossAt(HD2[k][0], HD2[k][1], HD2[k][2], T0)); h.rotation.set(0.5 + k, 0.4 * k, 1.1 * (T0 - HD2[k][2]) * 6); });
  const things = [...cars.map(({ car }) => car.g), dogR.g, street.cart, street.bench, peel, ...hd2, ...street.trees.map((tr) => tr.t)].map((o, i) => { const s = sampleSurface([o], 900, rng(200 + i)); const b = new THREE.Box3().setFromObject(o); return { ...s, c: b.getCenter(new THREE.Vector3()) }; });
  const boil = sampleSurface([street.root, ...crowd.map((c) => c.root)], 12000, rng(5), (m) => m !== streetSky && m.getWorldPosition(new THREE.Vector3()).distanceTo(camStart) < 60);
  const BR = rng(7), boilSeeds = Array.from({ length: boil.n }, () => [BR(), BR(), BR(), BR()]);
  let streetDust = null;   // the whole street for the lift-off, sampled on first use
  const allDust = [...people, ...things];
  const DR = rng(8), dustSeeds = allDust.map((s) => Array.from({ length: s.n }, () => [DR(), DR(), DR(), DR()]));

  // ---------------------------------------------------------------- SPACE: Earth's surface as dust, a plasma core, the bar chart, the electron ball
  let earthDust = null;
  const core = mk(new THREE.SphereGeometry(1, 64, 32), new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color(1.6, 1.1, 0.6) }, uK: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uC; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uC * uK * (0.25 + 0.9 * pow(f, 1.5)), 1.0); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), space.root, 0, 0, 0);
  core.visible = false;
  const shell = mk(new THREE.SphereGeometry(1, 64, 32), new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color(1.0, 0.62, 0.3) }, uK: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uC; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uC * uK * (0.06 + 0.5 * pow(f, 2.0)), 1.0); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }), space.root, 0, 0, 0);
  shell.visible = false;
  // the bar chart (space-local, near BARS): a floating grid, a tiny gold bar, a big bar that never stops
  const chart = new THREE.Group(); chart.position.set(...BARS); space.root.add(chart);
  const gridT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = 'rgba(20,30,60,0.7)'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,190,255,0.8)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } });
  const plat = mk(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ map: gridT, transparent: true, toneMapped: false, depthWrite: false }), chart, 0, 0, 0); plat.rotation.x = -PI / 2;
  const goldM = new THREE.MeshStandardMaterial({ color: 0xf3c46b, emissive: 0xc98a2a, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.4 });
  const barA = mk(new THREE.BoxGeometry(0.7, 1, 0.7), goldM, chart, -1.05, 0.3, 0.2); barA.scale.y = 0.6;
  const barBM = new THREE.MeshStandardMaterial({ color: 0xff7a5a, emissive: 0xff4a2a, emissiveIntensity: 0.8, roughness: 0.3 });
  const barB = mk(new THREE.BoxGeometry(0.7, 1, 0.7), barBM, chart, 0.95, 0.5, 0.2); barB.geometry.translate(0, 0.5, 0); barB.position.y = 0;
  const chartLight = new THREE.PointLight(0xfff0e0, 3, 30, 1.2); chartLight.position.set(3, 4, 6); chart.add(chartLight);
  const chartHemi = new THREE.HemisphereLight(0xcfe0ff, 0x30304a, 0.9); chart.add(chartHemi);
  const label = (lines, w, sub = null, colr = '#ffffff') => {
    const tex = canvasTex(512, sub ? 200 : 150, (g, W, H) => {
      g.fillStyle = 'rgba(8,12,28,0.78)'; g.beginPath(); g.roundRect(4, 4, W - 8, H - 8, 26); g.fill(); g.strokeStyle = colr; g.lineWidth = 5; g.stroke();
      const fs = fitFont(g, lines, W - 60, 'bold', 52); g.fillStyle = colr; g.font = font('bold', fs); g.textAlign = 'center'; g.textBaseline = 'middle';
      lines.forEach((l, k) => g.fillText(l, W / 2, (sub ? 62 : 75) + (k - (lines.length - 1) / 2) * fs * 1.1));
      if (sub) { g.fillStyle = 'rgba(255,255,255,0.82)'; g.font = font('600', fitFont(g, [sub], W - 70, '600', 34)); g.fillText(sub, W / 2, 150); }
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })); s.scale.set(w, w * (sub ? 200 : 150) / 512, 1); return s;
  };
  const labA = label(['BLOW UP EARTH'], 1.55, 'binding energy', '#f3c46b'); labA.position.set(-1.05, -0.4, 0.9); chart.add(labA);
  const labB = label(['ENERGY RELEASED'], 1.55, 'napkin math', '#ff9a7a'); labB.position.set(0.95, -0.4, 0.9); chart.add(labB);
  const SN_Y = 7.5;
  const snRing = mk(new THREE.TorusGeometry(0.75, 0.035, 6, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.4, 2.0), toneMapped: false }), chart, 0.95, SN_Y, 0.2); snRing.rotation.x = PI / 2;
  const labSN = label(['1 SUPERNOVA'], 1.9, '≈ 450 billion × Earth', '#c9b8ff'); labSN.position.set(-0.75, SN_Y, 0.4); chart.add(labSN);
  // the electrons' homecoming: an Earth-shaped ball of blue sparks
  const EB = (() => { const r = rng(13), n = 26000, P = new Float32Array(n * 3), F = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * PI * 2, s = Math.sqrt(1 - u * u), rr = i < 17000 ? 1 : Math.cbrt(r()); P.set([Math.cos(a) * s * rr, u * rr, Math.sin(a) * s * rr], i * 3); const v = r() * 2 - 1, b = r() * PI * 2, q = Math.sqrt(1 - v * v); F.set([Math.cos(b) * q, v, Math.sin(b) * q], i * 3); } return { P, F, n }; })();

  // ---------------------------------------------------------------- MOON: the surface already leaving + Earth's wall rising
  const wall = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: new THREE.Color(1.9, 1.25, 0.7), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
  moon.root.add(wall); wall.visible = false;
  let moonDust = null;
  const rocks = moon.root.children.filter((m) => m.isMesh && m.geometry.type === 'DodecahedronGeometry').map((m, i) => ({ m, p: m.position.clone(), r: m.rotation.clone(), s: ((i * 0.618) % 1) }));


  // ================================================================ per-frame update
  let cur = null;
  const _v = new THREE.Vector3(), _w = new THREE.Vector3();
  const boing = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * PI * 3) * Math.exp(-u * 5));
  const WARM = new THREE.Color(1.6, 1.2, 0.8), BLUE = new THREE.Color(0.5, 0.8, 1.8);
  function flash(t, t0, pos, size, dur = 0.5, k = 0, c = WARM) {
    const age = t - t0; if (age < 0 || age > dur) return 0;
    const f = 1 - age / dur; flashes.set(k, pos, size * (0.6 + 0.6 * Math.min(1, age / 0.08)), f * f, c); return f;
  }
  /** blue sparks rising out of a whole place (the electrons leaving): n sparks spread over x/z/y ranges, rising v m/s */
  function updraft(t, key, n, X, Z, Y, V, size, k0, seed) {
    const o = OFF[key];
    for (let i = 0; i < n; i++) {
      const h1 = ((i * 0.6180339 + seed * 0.13) % 1), h2 = ((i * 0.7548776 + seed * 0.29) % 1), h3 = ((i * 0.5698403 + seed * 0.41) % 1);
      const life = 2.2 + 1.4 * h3, ph = ((t + h1 * 7.3) / life) % 1, v = lerp(V[0], V[1], h2);
      const x = lerp(X[0], X[1], h1) + 0.6 * Math.sin(t * 1.3 + i), z = lerp(Z[0], Z[1], h2 ** 0.7), y = lerp(Y[0], Y[1], h3 ** 2) + v * ph * life;
      const k = k0 * Math.sin(PI * ph) * (0.7 + 0.3 * Math.sin(t * 11 + i));
      dust.add(x + o[0], y + o[1], z + o[2], 0.2 * k, 0.48 * k, 1.6 * k, size * (0.7 + 0.6 * h3));
    }
  }

  function camAt(shot, t) {
    const c = CAMS[shot.cam], o = OFF[shot.set];
    if (c.fn) { const r = c.fn(t); return { P: r.p.map((v, i) => v + o[i]), A: r.a.map((v, i) => v + o[i]) }; }
    if (!c.p) return { P: [o[0], o[1] + 1.6, o[2]], A: [o[0] - 1, o[1] + 1.4, o[2]] };
    const u = clamp((t - shot.t0) / (shot.t1 - shot.t0)), e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    return { P: c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]), A: c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]) };
  }
  function frameW(d) { return 2 * d * Math.tan((studio.camera.fov * PI) / 360) * (9 / 16); }

  function update(t) {
    const shot = shotAt(t), S = shot.set;
    if (S !== cur) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; cur = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S]; studio.camera.near = S === 'space' ? 0.3 : S === 'moon' ? 0.1 : 0.02;
    studio.fill.intensity = 0.45;
    ALL.forEach((r) => (r.root.visible = false));
    povHands.visible = false; dogR.g.visible = false; flock.begin(); hotdog.visible = false; frisbee.visible = false; pop.visible = false;
    elec.forEach((e) => (e.g.visible = false)); [brb, huh, noo].forEach((b) => (b.sprite.visible = false));
    dust.begin(); flashes.hide(); boomLight.intensity = 0;
    for (const g of ghosts) { g.m.material = g.orig; g.m.visible = true; } for (const g of rigGhosts) g.m.material = g.orig;
    let jolt = 0, camOverride = null;
    const bubbles = [], faces = [];
    const cam = camAt(shot, t), camP = new THREE.Vector3(...cam.P), camA = new THREE.Vector3(...cam.A), fwdV = camA.clone().sub(camP).normalize();
    const rightV = new THREE.Vector3().crossVectors(fwdV, new THREE.Vector3(0, 1, 0)).normalize(), upV = new THREE.Vector3().crossVectors(rightV, fwdV);
    const inFront = (d, x = 0, y = 0) => camP.clone().addScaledVector(fwdV, d).addScaledVector(rightV, x).addScaledVector(upV, y);

    if (S === 'street') {
      // ---------------------------------------------------------- the street: alive → SECOND 0 (frozen, electrons boil off) → black sky → x-ray → dust
      street.aimSun(-4, 2, 18); street.setSeason('summer', t);
      const dark = t >= T_SKY, gone = t >= T_FIZZ, lift = t - T_RISE, age = t - T0;
      if (streetSky) streetSky.material = dark ? skyBlack : skyDay;
      scene.fog = dark ? blackFog : streetFog;
      street.lights.hemi.intensity = dark ? 0.22 : 1.3;
      if (dark) studio.fill.intensity = 0.25;
      sunDisc.visible = dark; sunDisc.position.set(-75, 36, 4.5); sunDisc.scale.setScalar(11);
      placeCars(t);
      if (!gone) {
        crowd.forEach((c, i) => put(c, 'street', crowdPose(i, t)));
        const lp = K(tau(t), [[5.7, 0], [6.4, 1]], (x) => Math.sin(x * PI / 2));
        dogR.g.visible = true; dogR.g.position.copy(L('street', 4.0 - 1.2 * tau(t) - 0.9 - 0.4 * lp, SH + 0.75 * lp, -0.6)); dogR.g.rotation.set(0, -PI / 2, 0); dogR.g.rotateX(-0.7 * lp); dogR.update(tau(t), t < T0 ? 1.2 : 0);
        frisbee.visible = true; frisbee.position.copy(L('street', 4.0 - 1.2 * tau(t) - 1.55 - 3.5 * (1 - lp), SH + 0.95 * lp + 1.1 * (1 - lp), -0.6)); frisbee.rotation.set(0.25, tau(t) * 9, 0.1);
        PIGEONS.forEach((_, i) => { const [x, y, z, fl] = pigeonAt(i, t), q = L('street', x, y, z); flock.add(q.x, q.y, q.z, { rotY: PI / 2, s: 1.1, flap: fl, color: 0x8a8f9a }); });
      }
      cars.forEach(({ car }) => (car.g.visible = !gone));
      hd2.forEach((h, k) => { h.visible = !gone && tau(t) > HD2[k][2]; h.position.copy(tossAt(HD2[k][0], HD2[k][1], HD2[k][2], tau(t))); h.rotation.set(0.5 + k, 0.4 * k, 1.1 * (tau(t) - HD2[k][2]) * 6); });
      peel.visible = !gone;
      // THE hot dog: tossed, frozen at its peak at SECOND 0 — and when everything else fizzes, it just… doesn't
      hotdog.traverse((m) => { if (m.isMesh) m.material.emissiveIntensity = dark ? 0.75 : 0; });
      if (tau(t) > T_TOSS || t > T0) {
        hotdog.visible = shot.cam !== 'rise' || t < T_RISE + 4.5; hotdog.scale.setScalar(2.2);
        const fz0 = tossAt(HD_0, HD_V, T_TOSS, tau(t)), spin = (tau(t) - T_TOSS) * 7;
        hotdog.position.copy(L('street', fz0.x, fz0.y, fz0.z)); hotdog.rotation.set(0.3, 0.6, spin);
        if (shot.cam === 'blast' && t > T_BLAST + 0.25) { const u = clamp((t - T_BLAST - 0.25) / 0.9); hotdog.position.lerp(inFront(1.1, -0.9 + 1.6 * (1 - u), 0.15), Math.min(1, u * 1.4)); hotdog.rotation.set(0.3 + u * 6, 0.6, spin + u * 14); hotdog.visible = u < 1; }
        if (shot.cam === 'rise') { const a = Math.max(0, t - T_RISE); hotdog.position.copy(inFront(5.5, 0.7 * Math.sin(a * 0.8), -0.6 + 0.3 * Math.sin(a * 1.3))); hotdog.rotation.set(a * 2.1, a * 1.3, a * 3.1); }
      }
      // SECOND 0: three of them burst out of the crowd by the cart, wave "brb", and zoom off into the sky
      if (shot.cam === 'pov' && age >= 0) elec.forEach((e, k) => {
        const a = age - k * 0.14; if (a < 0 || a > 2.6) return;
        const lift = K(a, [[0, 0], [0.5, 1]], (x) => 1 - (1 - x) ** 3), zip = Math.max(0, a - 1.55);
        e.g.visible = true; e.g.position.copy(L('street', 5.2 - k * 0.6, 1.6 + 1.0 * lift + k * 0.25 + zip * zip * 9, -1.0 + (k - 1) * 0.8 + zip * (k - 1) * 2)); e.g.scale.setScalar(0.32 * K(a, [[0, 0], [0.12, 1.15], [0.22, 1]]));
        faces.push([e.g, 0]); e.setFace(zip > 0 ? 'o' : 'smile'); e.look(Math.sin(a * 3 + k) * 0.5, 0.3);
        if (k === 0 && a > 0.45 && a < 1.55) bubbles.push({ b: brb, pos: e.g.position.clone().add(_w.set(0, 0.38, 0)), k: K(a, [[0.45, 0], [0.57, 1.12], [0.67, 1], [1.4, 1], [1.55, 0]]), frac: 0.46 });
      });
      [street.cart, street.bench, ...street.trees.map((tr) => tr.t)].forEach((o) => (o.visible = !gone)); street.trash.visible = false;
      if (shot.cam === 'hands') {
        // your eyes: standing where the opening dolly ended, looking down at your hands, then up the street again
        const eye = L('street', YOU[0], 1.6, YOU[1]), look = K(t, [[14.0, 0], [15.6, 1]]) * (1 - K(t, [[17.2, 0], [18.6, 0.55]]));
        const aim = eye.clone().add(_w.set(-1.0, lerp(-0.12, -0.42, look), 0.04 * Math.sin(t * 0.6)));
        camOverride = { p: eye.toArray(), a: aim.toArray() };
        povCam.position.copy(eye); povCam.lookAt(aim); povHands.position.copy(eye); povHands.quaternion.copy(povCam.quaternion);
        povHands.position.y += 0.012 * Math.sin(t * 1.7); povHands.visible = true;
        const shake = K(t, [[14.5, 0], [14.7, 1], [15.9, 1], [16.1, 0]]); povHands.rotateZ(0.16 * shake * Math.sin((t - 14.5) * 11)); povHands.rotateX(0.06 * shake * Math.sin((t - 14.5) * 13));
      }
      // the x-ray sweep: buildings far → near, then the people, then your own hands
      if (t >= T_GHOST) { for (const g of ghosts) if (t >= g.ts) g.m.material = g.gm; for (const g of rigGhosts) if (t >= g.ts) g.m.material = g.gm; }
      // SECOND 0: every electron boils off (a wave out from you), plus a standing updraft over the whole street
      if (age > 0 && t < T_RISE) {
        for (let i = 0; i < boil.n; i++) {
          const [s0, s1, s2, s3] = boilSeeds[i], x0 = boil.P[i * 3], y0 = boil.P[i * 3 + 1], z0 = boil.P[i * 3 + 2];
          const dd = Math.hypot(x0 - camStart.x, z0 - camStart.z);
          const a = age - (dd * 0.03 + (s3 < 0.5 ? s0 * 0.4 : 0.5 + s0 * 6)); if (a < 0 || a > 2.2) continue;
          const sp = 0.6 + s1 * 1.4, up = 0.8 + s2 * 1.8;
          const x = x0 + (s3 - 0.5) * sp * a, y = y0 + up * a + 1.2 * a * a, z = z0 + (s1 - 0.5) * sp * a;
          const k = Math.min(1, a / 0.08) * (1 - a / 2.2) * (0.7 + 0.3 * Math.sin(a * 20 + s0 * 40));
          dust.add(x, y, z, 0.18 * k, 0.45 * k, 1.7 * k, 0.012 + 0.012 * s2);
        }
        updraft(t, 'street', 3600, [-45, 16], [-3, 10], [0, 14], [1.2, 4], 0.06, 0.4 * Math.min(1, age / 0.8), 402);
      }
      // +1 fs: the glass people and things fizz into glowing dust; +1 ns: on "100%" it all blasts apart
      if (gone) {
        const fz = K(t, [[T_FIZZ, 0], [T_BLAST, 1]]), bl = t - T_BLAST;
        allDust.forEach((s, j) => {
          const isP = j < people.length, seeds = dustSeeds[j];
          for (let i = 0; i < s.n; i++) {
            const [a1, a2, a3, a4] = seeds[i], x0 = s.P[i * 3], y0 = s.P[i * 3 + 1], z0 = s.P[i * 3 + 2];
            let dx = x0 - s.c.x, dy = y0 - s.c.y, dz = z0 - s.c.z;
            const jit = 0.004 + 0.1 * fz, gr = 1 + 0.3 * fz;
            let x = s.c.x + dx * gr + (a1 - 0.5) * jit * 2 + 0.01 * Math.sin(t * 9 + i), y = s.c.y + dy * gr + (a2 - 0.5) * jit * 2 + 0.35 * fz * a2 * a2, z = s.c.z + dz * gr + (a3 - 0.5) * jit * 2;
            if (bl > 0) { const L0 = Math.hypot(dx, dy, dz) || 1, v = (isP ? 2.2 : 1.4) + 6.5 * a4; x += (dx / L0) * v * bl; y += (dy / L0) * v * bl + 2 * bl; z += (dz / L0) * v * bl; }
            const tw = 0.65 + 0.35 * Math.sin(t * 13 + i * 1.7), fade = bl > 0 ? Math.exp(-bl * (t > T_RISE ? 1.6 : 0.25)) : 1, hot = bl > 0 ? 0.8 * Math.exp(-bl * 2) : 0;
            const k = (isP ? 1.15 : 0.8) * tw * fade * Math.min(1, (t - T_FIZZ) / 0.25);
            const r = isP ? 1.0 : 0.45, g = isP ? 0.72 : 0.85, b = isP ? 0.9 : 1.0;
            dust.add(x, y, z, (r + hot) * k, (g + hot) * k, (b + hot * 0.6) * k, isP ? 0.011 + 0.008 * a4 : 0.02 + 0.015 * a4);
          }
        });
        if (bl > 0) { const f = flash(t, T_BLAST, L('street', -0.4, 1.4, -1.6), 9, 0.6); boomLight.position.copy(L('street', -4, 5, 5)); boomLight.intensity = 120 * f; if (bl < 0.6) jolt = 0.04 * Math.exp(-bl * 6); }
      }
      // +1 ms: the whole street lifts off as glowing dust
      if (lift > -0.05 && shot.cam === 'rise') {
        if (!streetDust) {
          const s = sampleSurface([street.root], 95000, rng(300), (m) => m !== streetSky && m !== sunDisc), fr = rng(301);
          streetDust = { ...s, V: Float32Array.from({ length: s.n }, () => 2 + 14 * fr() ** 1.3), J: Float32Array.from({ length: s.n * 2 }, () => fr() - 0.5) };
        }
        if (lift > 0.12) for (const g of ghosts) g.m.visible = false;
        if (lift > 0) for (let i = 0; i < streetDust.n; i++) {
          const v = streetDust.V[i], a = lift, rise = v * a + 5 * a * a;
          const x = streetDust.P[i * 3] + streetDust.J[i * 2] * 3 * a, y = streetDust.P[i * 3 + 1] + rise, z = streetDust.P[i * 3 + 2] + streetDust.J[i * 2 + 1] * 3 * a;
          const hot = 0.6 * Math.exp(-a * 0.8), k = Math.min(1, a / 0.1) * (0.75 + 0.25 * Math.sin(t * 9 + i));
          dust.add(x, y, z, (streetDust.C[i * 3] * 0.7 + 0.35 + hot) * k, (streetDust.C[i * 3 + 1] * 0.7 + 0.35 + hot * 0.8) * k, (streetDust.C[i * 3 + 2] * 0.7 + 0.45 + hot * 0.5) * k, 0.11 + 0.1 * Math.abs(streetDust.J[i * 2]));
        }
        if (lift > 0) { const f = flash(t, T_RISE, L('street', -10, 3, 3), 40, 0.6); boomLight.position.copy(L('street', -8, 8, 4)); boomLight.intensity = 150 * f; if (lift < 0.6) jolt = 0.05 * Math.exp(-lift * 5); }
      }
    } else if (S === 'moon') {
      // ---------------------------------------------------------- +1.3 s: the Moon is already leaving; Earth's glowing wall arrives
      const age = t - T_WALL;
      if (!moonDust) {
        const fr = rng(71), P = [], C = [], V = [], SZ = [];
        for (let i = 0; i < 30000; i++) { const z = 1.5 - 80 * fr() ** 1.4, x = (fr() - 0.5) * (8 + Math.abs(z) * 1.3); const y = moon.heightAt(x, z); const v = 0.45 + 0.25 * fr(); P.push(x, y, z); C.push(v, v * 0.98, v * 0.95); V.push((fr() - 0.5) * 0.3, 0.15 + 0.5 * fr(), (fr() - 0.5) * 0.3); SZ.push(0.012 + 0.02 * fr()); }
        const smp = sampleSurface([moon.lander, moon.flag], 6000, rng(72));
        for (let k = 0; k < smp.n; k++) { P.push(smp.P[k * 3] - OFF.moon[0], smp.P[k * 3 + 1], smp.P[k * 3 + 2] - OFF.moon[2]); C.push(smp.C[k * 3], smp.C[k * 3 + 1], smp.C[k * 3 + 2]); V.push((fr() - 0.5) * 4 - 2, 2 + 6 * fr(), (fr() - 0.5) * 4 + 4); SZ.push(0.012 + 0.01 * fr()); }
        moonDust = { P, C, V, SZ, n: P.length / 3, ground: 30000 };
      }
      const hit = age >= 0;
      moon.lander.visible = moon.flag.visible = !hit;
      const ox = OFF.moon[0], oz = OFF.moon[2];
      for (let i = 0; i < moonDust.n; i++) {
        const gnd = i < moonDust.ground;
        if (!gnd && !hit) continue;
        const a = gnd ? t - 49.1 + (i % 7) * 0.1 : age, k = gnd ? Math.min(1, a / 0.6) * 0.8 * Math.min(1, (6.5 - moonDust.P[i * 3 + 2]) / 14) : Math.min(1, a / 0.05) * 1.3;
        const boost = hit && gnd ? age * age * 14 : 0;
        const x = moonDust.P[i * 3] + moonDust.V[i * 3] * a + (hit ? moonDust.V[i * 3] * boost : 0), y = moonDust.P[i * 3 + 1] + moonDust.V[i * 3 + 1] * (a + boost), z = moonDust.P[i * 3 + 2] + moonDust.V[i * 3 + 2] * a + (hit ? 3 * age * age : 0);
        const g = hit ? 0.6 * Math.exp(-age * 1.2) : 0;
        dust.add(x + ox, y, z + oz, (moonDust.C[i * 3] + g) * k, (moonDust.C[i * 3 + 1] + g * 0.8) * k, (moonDust.C[i * 3 + 2] + g * 0.5) * k, moonDust.SZ[i]);
      }
      // Earth's wall: a glow that rises over the horizon and swallows the sky at T_WALL
      const wu = clamp((t - 49.1) / (T_WALL - 49.1));
      wall.visible = true; wall.position.set(-300, -60, -2800); wall.scale.setScalar(hit ? 16000 : 900 + 8000 * wu ** 3);
      wall.material.color.setRGB(1.9, 1.25, 0.7).multiplyScalar(hit ? 1.3 * Math.exp(-age * 2.2) + 0.1 : 0.7 + 0.5 * wu);
      moon.ground.material.color.setScalar(hit ? Math.max(0.3, 1 - age * 0.8) : 1); moon.ground.visible = !(hit && age > 0.45); moon.lander.position.x = -1.9;
      moon.lights.hemi.intensity = 0.35 + 1.8 * K(t, [[T_WALL - 1.6, 0], [T_WALL, 1]]);
      const f = flash(t, T_WALL, L('moon', 0.3, 1.6, 3.6), 9, 0.9); boomLight.position.copy(L('moon', 0, 5, 3)); boomLight.intensity = 200 * f;
      if (hit && age < 0.7) jolt = 0.05 * Math.exp(-age * 5);
      { const a0 = t - 49.4, MP = [0.9, 0, -1.9];
        if (a0 > 0) { hotdog.visible = true; hotdog.scale.setScalar(2.4); const g = 1.62 / 2, gy = moon.heightAt(MP[0], MP[2]) + 0.12;
          let y = gy + Math.max(0, 3.2 - 3.2 * a0 * a0 * g * 1.6), x = MP[0] - 0.4 * Math.min(a0, 1.6);
          if (a0 > 1.1) { const b = (a0 - 1.1) % 0.9, n = Math.floor((a0 - 1.1) / 0.9); y = gy + 0.45 * Math.pow(0.45, n) * Math.sin(PI * b / 0.9); }
          hotdog.position.copy(L('moon', x, y, MP[2])); hotdog.rotation.set(0.2, 0.7, a0 > 1.1 ? 0.3 * Math.sin(a0 * 3) : a0 * 5);
          if (hit) { hotdog.position.add(_w.set(-1.5 * age, 2.5 * age * age + 1.2 * age, 3 * age)); hotdog.rotation.set(age * 6, age * 4, age * 9); } } }
      rocks.forEach(({ m, p, r, s: q }) => { const a2 = hit ? age : 0; m.position.set(p.x + a2 * (q - 0.5) * 1.5, p.y + a2 * a2 * (1.2 + 2.5 * q), p.z + a2 * 1.2); m.rotation.set(r.x + a2 * (1 + q * 3), r.y + a2 * 2, r.z); });
    } else if (S === 'space') {
      const R0 = space.R, earthOn = shot.cam === 'earth' && t < T_EARTH;
      space.earth.visible = space.clouds.visible = space.lights.visible = space.atm.visible = earthOn;
      space.setSpin(2.6 + 0.02 * (Math.min(t, T_EARTH) - 38));
      core.visible = false; shell.visible = false; chart.visible = shot.cam === 'bars';
      space.sun.intensity = 3.2;
      if (!earthDust) {
        space.setSpin(2.6 + 0.02 * (T_EARTH - 38)); space.root.updateMatrixWorld(true);
        const e = sampleSurface([space.earth], 52000, rng(81)), c = sampleSurface([space.clouds], 16000, rng(82));
        const o = space.root.position;
        const dirs = [], cols = [];
        for (const s of [e, c]) for (let i = 0; i < s.n; i++) { _v.set(s.P[i * 3] - o.x, s.P[i * 3 + 1] - o.y, s.P[i * 3 + 2] - o.z).normalize(); dirs.push(_v.x, _v.y, _v.z); cols.push(s === c ? 1 : s.C[i * 3], s === c ? 1 : s.C[i * 3 + 1], s === c ? 1 : s.C[i * 3 + 2]); }
        const fr = rng(83); earthDust = { D: new Float32Array(dirs), C: new Float32Array(cols), J: Float32Array.from({ length: dirs.length / 3 }, () => fr()), n: dirs.length / 3 };
      }
      const o = space.root.position;
      const age = t - T_EARTH;
      if (shot.cam === 'earth' || shot.cam === 'bars') {
        if (age >= 0) {
          // the surface flies off as dust; the inside glows; the ball doubles (and keeps going in the bar shot)
          const u = K(age, [[0, 0], [2.65, 1]], (x) => 1 - (1 - x) ** 2.2), grow = shot.cam === 'bars' ? 2.15 + 0.12 * (t - 43.4) : 1 + u + 0.16 * Math.max(0, age - 2.65), spin = 0.15 * age, cs = Math.cos(spin), sn = Math.sin(spin);
          const sun = _w.set(1, 0.25, 0.3).normalize(), cv = studio.camera.position.clone().sub(o).normalize();
          for (let i = 0; i < earthDust.n; i++) {
            const dx0 = earthDust.D[i * 3], dy = earthDust.D[i * 3 + 1], dz0 = earthDust.D[i * 3 + 2], j = earthDust.J[i], dx = dx0 * cs + dz0 * sn, dz = dz0 * cs - dx0 * sn;
            if (dx * cv.x + dy * cv.y + dz * cv.z < -0.15) continue;
            const rr = R0 * (grow + (j - 0.5) * 0.18 * (grow - 1));
            const lit = 0.55 + 1.0 * Math.max(0, dx * sun.x + dy * sun.y + dz * sun.z), heat = Math.exp(-age * 1.4) * 0.35;
            const k = (shot.cam === 'bars' ? 0.55 : 1) * (0.8 + 0.3 * Math.sin(t * 11 + i));
            dust.add(o.x + dx * rr, o.y + dy * rr, o.z + dz * rr, (earthDust.C[i * 3] * lit + heat) * k, (earthDust.C[i * 3 + 1] * lit + heat * 0.7) * k, (earthDust.C[i * 3 + 2] * lit + heat * 0.4) * k, 4.2 + 3.0 * j);
          }
          if (shot.cam === 'earth') {
            const pk = K(age, [[0, 0], [0.14, 1.2], [0.26, 1], [1.3, 1], [1.7, 0]]); pop.visible = pk > 0.01; pop.position.copy(o).add(cv.clone().multiplyScalar(R0 * 1.4)).add(_w.set(R0 * 0.35, R0 * 0.55, 0)); pop.scale.setScalar(R0 * 1.15 * pk); pop.material.rotation = -0.15;
            const hu = clamp((t - 39.6) / 2.6); if (hu > 0 && hu < 1) { hotdog.visible = true; hotdog.scale.setScalar(55); hotdog.position.copy(inFront(80, lerp(34, -34, hu), lerp(-6, 8, hu))); hotdog.rotation.set(hu * 5, hu * 3, hu * 9); }
          }
          core.visible = true; core.scale.setScalar(R0 * grow * 0.6); core.material.uniforms.uK.value = (shot.cam === 'bars' ? 0.35 : 1) * (0.04 + 0.1 * Math.exp(-age * 1.5));
          const f = flash(t, T_EARTH, o.clone(), R0 * 4, 0.8); boomLight.intensity = 0 * f;
          if (shot.cam === 'earth' && age < 0.6) jolt = 6 * Math.exp(-age * 6);
        }
      }
      if (shot.cam === 'bars') {
        const b = t - T_BAR, h = b < 0 ? 0.02 : Math.min(4000, 0.6 * Math.exp(3.1 * b) - 0.6 + 0.02);
        { const dropU = K(t, [[44.2, 0], [44.75, 1]], (x) => x * x), bnc = Math.abs(Math.sin(clamp((t - 44.75) / 0.6) * PI)) * 0.35 * Math.exp(-(t - 44.75) * 3) * (t > 44.75 ? 1 : 0);
          hotdog.visible = t > 44.2; hotdog.scale.setScalar(2.6); hotdog.position.copy(chart.localToWorld(_v.set(0.95, h + 0.08 + (1 - dropU) * 4 + bnc, 0.2))); hotdog.rotation.set(0, 0.4, (1 - dropU) * 6); }
        barB.scale.y = h; labSN.material.opacity = 1 - K(t, [[47.15, 0], [47.45, 1]]); labSN.visible = labSN.material.opacity > 0.01;   // gone before the tilt drops it into the subtitles barA.scale.y = 0.6 * Math.max(0.02, boing(clamp((t - 43.75) / 0.8)));
        snRing.material.color.setRGB(1.5, 1.4, 2.0).multiplyScalar(h > SN_Y ? 1.6 : 0.8);
      }
      if (shot.cam === 'back' || shot.cam === 'eboom') {
        // +5.000 s: the nuclei are a shell 1.5 million km out; the electrons come back where they left
        shell.visible = true; shell.scale.setScalar(4200); shell.material.uniforms.uK.value = 0.22;
        const arr = K(t, [[T_BACK, 0], [T_BACK + 1.0, 1]], (x) => 1 - (1 - x) ** 3), bo = t - T_EBOOM;
        for (let i = 0; i < EB.n; i++) {
          const sp0 = 0.3 * Math.max(0, t - T_BACK), c0 = Math.cos(sp0), s0 = Math.sin(sp0), px = EB.P[i * 3] * c0 + EB.P[i * 3 + 2] * s0, py = EB.P[i * 3 + 1], pz = EB.P[i * 3 + 2] * c0 - EB.P[i * 3] * s0, fx = EB.F[i * 3], fy = EB.F[i * 3 + 1], fz = EB.F[i * 3 + 2];
          let x, y, z, k;
          if (bo < 0) { const far = (1 - arr) * 3200, tr = 1 + 0.05 * K(t, [[T_BACK + 1.2, 0], [T_EBOOM, 1]], (q) => q * q) * Math.sin(t * 23 + i * 1.3); x = px * R0 * tr + fx * far; y = py * R0 * tr + fy * far; z = pz * R0 * tr + fz * far; k = arr * (0.75 + 0.25 * Math.sin(t * 9 + i)); }
          else { const rr = R0 * (1 + bo * 2.6 * (1 + 0.4 * ((i * 0.37) % 1))); x = px * rr; y = py * rr; z = pz * rr; k = 1.5 * Math.exp(-bo * 0.8); }
          if (t < T_BACK) continue;
          dust.add(o.x + x, o.y + y, o.z + z, 0.22 * k, 0.5 * k, 1.5 * k, 4.6);
        }
        if (bo >= 0) { flash(t, T_EBOOM, o.clone(), R0 * 3.2, 0.6, 0, BLUE); if (bo < 0.6) jolt = 6 * Math.exp(-bo * 5); }
        // all that's left: one hot dog. Three electrons arrive, look around, "?", spot it… NOOOOO… and blow up anyway
        hotdog.visible = true; hotdog.scale.setScalar(3.0); hotdog.position.copy(inFront(9, 0.15 * Math.sin(t * 0.5), -0.9 + 0.06 * Math.sin(t * 0.9))); hotdog.rotation.set(0.35, t * 0.6, 0.25 * Math.sin(t * 0.7));
        elec.forEach((e, k) => {
          const a = t - (T_BACK + 0.35 + k * 0.25); if (a < 0) return;
          const slot = [[-1.2, 0.35], [0.0, 0.95], [1.2, 0.3]][k], arrive = K(a, [[0, 0], [0.7, 1]], (x) => 1 - (1 - x) ** 3);
          const pe = inFront(9, slot[0] + (1 - arrive) * (k - 1 || 0.5) * 8 + 0.08 * Math.sin(t * 2.3 + k), slot[1] + (1 - arrive) * 5 + 0.12 * Math.sin(t * 3.1 + k * 2));
          if (bo > 0) pe.addScaledVector(rightV, (k - 1 || 0.6) * bo * 12).addScaledVector(upV, bo * 6).addScaledVector(fwdV, -bo * 6);
          e.g.visible = true; e.g.position.copy(pe); e.g.scale.setScalar(0.42); faces.push([e.g, bo > 0 ? bo * 8 * (k - 1 || 1) : 0.15 * Math.sin(t * 2.7 + k * 1.7)]);
          const lookT = t - T_BACK, spot = t > 58.9;
          e.look(spot ? -slot[0] * 0.6 : lookT < 1.8 ? 0 : Math.sin(lookT * 2.6 + k * 2) > 0 ? 1 : -1, spot ? -0.8 : 0.2); e.setFace(t > 59.85 ? 'o' : 'smile');
          if (k === 2 && t > 57.2 && t < 58.75) bubbles.push({ b: huh, pos: pe.clone().addScaledVector(upV, 0.5), k: K(t, [[57.2, 0], [57.32, 1.12], [57.42, 1], [58.6, 1], [58.75, 0]]), frac: 0.36 });
          if (k === 1 && t > 59.9 && t < T_EBOOM + 0.1) bubbles.push({ b: noo, pos: pe.clone().addScaledVector(upV, 0.5), k: K(t, [[59.9, 0], [60.02, 1.12], [60.12, 1], [T_EBOOM - 0.05, 1], [T_EBOOM + 0.1, 0]]), frac: 0.58 });
        });
      }
    }

    // camera (local → world)
    const c = CAMS[shot.cam];
    let P = camOverride ? camOverride.p : cam.P, Aim = camOverride ? camOverride.a : cam.A;
    if (jolt) { P = [P[0] + jolt * Math.sin(t * 70), P[1] + jolt * Math.sin(t * 55), P[2]]; }
    setCamera(P, Aim, c.fov, t, c.amp);
    for (const [g, roll] of faces) { g.lookAt(studio.camera.position); if (roll) g.rotateZ(roll); }
    for (const q of bubbles) { const d = studio.camera.position.distanceTo(q.pos); q.b.sprite.position.copy(q.pos); q.b.setRows(1); q.b.setPop(q.k * q.frac * frameW(d)); }
    flock.end(); dust.end(studio.camera);
  }
  return { update };
}
