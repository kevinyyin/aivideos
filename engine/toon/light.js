// Visible light for the toon look: soft glows around light sources (a
// window, a lamp, the sky through glass) and dusty light shafts. Both are additive, camera-facing / flat cards on layer
// NOINK (never outlined, never in the DOF depth), so they read as light in the air, not as objects.
import * as THREE from 'three';
import { NOINK } from './ink.js';
import { ctex } from './paint.js';

const radial = () => ctex('toonGlow', 256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});
/** soft additive glow sprite (size m, intensity can go above 1 for bloom) */
export function makeGlow(parent, { color = 0xffe2b0, size = 1, intensity = 0.6, x = 0, y = 0, z = 0 } = {}) {
  const m = new THREE.SpriteMaterial({ map: radial(), color: new THREE.Color(color).multiplyScalar(intensity), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1); s.position.set(x, y, z); s.layers.set(NOINK); parent.add(s);
  return s;
}

const beam = () => ctex('toonShaft', 64, 256, (g) => {
  const across = g.createLinearGradient(0, 0, 64, 0);
  across.addColorStop(0, 'rgba(255,255,255,0)'); across.addColorStop(0.5, 'rgba(255,255,255,1)'); across.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = across; g.fillRect(0, 0, 64, 256);
  g.globalCompositeOperation = 'destination-in';
  const along = g.createLinearGradient(0, 0, 0, 256);
  along.addColorStop(0, 'rgba(0,0,0,0)'); along.addColorStop(0.15, 'rgba(0,0,0,1)'); along.addColorStop(0.7, 'rgba(0,0,0,0.6)'); along.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = along; g.fillRect(0, 0, 64, 256);
});
/** dusty light shafts: n soft additive strips from `from` along `dir` (world, local to parent), spread `spread` m
 *  sideways, each width w and length len; they turn about their own axis to face the camera (call face(camera)). */
export function makeShafts(parent, { from = [0, 2, 0], dir = [0.5, -1, 0.3], n = 4, spread = 0.6, w = 0.18, len = 2.4, color = 0xffe6bf, opacity = 0.12, seed = 1 } = {}) {
  const g = new THREE.Group(), d = new THREE.Vector3(...dir).normalize();
  const side = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1)); if (side.lengthSq() < 1e-4) side.set(1, 0, 0); side.normalize();
  const mats = [];
  for (let i = 0; i < n; i++) {
    const k = n > 1 ? i / (n - 1) - 0.5 : 0, jit = Math.sin(seed * 17 + i * 3.1);
    const m = new THREE.MeshBasicMaterial({ map: beam(), color, transparent: true, opacity: opacity * (0.6 + 0.4 * Math.abs(jit)), blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const ww = w * (0.7 + 0.6 * Math.abs(Math.cos(seed + i * 1.7)));
    const q = new THREE.Mesh(new THREE.PlaneGeometry(ww, len), m);
    q.position.set(...from).addScaledVector(side, k * spread).addScaledVector(d, len / 2);
    q.userData.axis = d.clone(); q.layers.set(NOINK); g.add(q); mats.push(m);
  }
  parent.add(g);
  const tmp = new THREE.Vector3(), c = new THREE.Vector3(), x = new THREE.Vector3(), z = new THREE.Vector3(), M = new THREE.Matrix4();
  return {
    group: g,
    /** each strip keeps its axis (the light direction) and turns its face toward the camera (parent unrotated) */
    face(camera) {
      camera.getWorldPosition(c);
      for (const q of g.children) {
        const a = q.userData.axis; q.getWorldPosition(tmp);
        z.copy(c).sub(tmp); z.addScaledVector(a, -z.dot(a)).normalize(); x.crossVectors(a, z).normalize();
        M.makeBasis(x, a, z); q.quaternion.setFromRotationMatrix(M);
      }
    },
    set opacity(v) { mats.forEach((m) => (m.opacity = v)); },
  };
}

const MOTE_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
uniform float uTime, uScale, uRise, uH, uY0, uNear;
varying float vA;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.37 + aPhase * 6.3) * 0.18 + sin(uTime * 0.11 + aPhase * 2.1) * 0.3;
  p.z += cos(uTime * 0.29 + aPhase * 4.7) * 0.18;
  p.y = uY0 + mod(p.y - uY0 + uTime * uRise * (0.6 + 0.8 * fract(aPhase * 7.13)) + sin(uTime * 0.5 + aPhase * 9.0) * 0.06, uH);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = -mv.z;
  gl_PointSize = aSize * uScale / max(d, 0.05);
  vA = smoothstep(uNear, uNear * 2.5, d) * (0.65 + 0.35 * sin(uTime * 1.7 + aPhase * 40.0))
     * smoothstep(0.0, 0.08, (p.y - uY0) / uH) * smoothstep(1.0, 0.85, (p.y - uY0) / uH);
}`;
const MOTE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.35, 1.0, r)) * vA * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor, a);
}`;
/** floating motes: dust in a window beam, fireflies at night, pollen / embers outside (the reference has drifting
 *  specks in nearly every shot: life in a held frame, and bright ones open into bokeh with lens.js `bokeh`).
 *  box = [x0, y0, z0, x1, y1, z1] (parent space); size = diameter in m (keep near ones <= 1-2 cm, dh006 lesson);
 *  color may be HDR (intensity > 1 blooms). update(t, camera, renderer) every frame. Pure in t: renders stay
 *  deterministic. Points are skipped by the ink pass and the AO. */
export function makeMotes(parent, { n = 160, box = [-2, 0, -2, 2, 2.5, 2], size = 0.012, color = 0xfff0d0, intensity = 1.6, rise = 0.04, opacity = 0.8, near = 0.4, seed = 3 } = {}) {
  const [x0, y0, z0, x1, y1, z1] = box, pos = new Float32Array(n * 3), sz = new Float32Array(n), ph = new Float32Array(n);
  let s = seed * 9301 + 49297;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    pos.set([x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), z0 + r() * (z1 - z0)], i * 3);
    sz[i] = size * (0.45 + r() * r() * 1.6); ph[i] = r();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1)); g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  const m = new THREE.ShaderMaterial({
    vertexShader: MOTE_VERT, fragmentShader: MOTE_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uScale: { value: 1000 }, uRise: { value: rise }, uH: { value: y1 - y0 }, uY0: { value: y0 }, uNear: { value: near },
      uColor: { value: new THREE.Color(color).multiplyScalar(intensity) }, uOpacity: { value: opacity } },
  });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.layers.set(NOINK); parent.add(pts);
  const v = new THREE.Vector2();
  return {
    points: pts, material: m,
    update(t, camera, renderer) {
      m.uniforms.uTime.value = t;
      const H = renderer ? renderer.getDrawingBufferSize(v).y : 1920;
      m.uniforms.uScale.value = H / (2 * Math.tan((camera.fov * Math.PI) / 360));
    },
  };
}

/** a soft procedural environment for reflective materials (shade.js toonMetal): a gradient room (top / horizon /
 *  ground) + bright soft panels for the key lights (a window, a lamp, the sun), prefiltered with PMREM. Use one per
 *  set and swap `scene.environment` per shot (only MeshStandard/Physical materials read it; the two-tone world and
 *  the cards ignore it). lights: [{ dir: [x, y, z], color, intensity, size }] (dir from the object toward the light). */
export function makeEnv(renderer, { top = '#9cc4ea', horizon = '#f2e4cf', ground = '#5b4a3c', lights = [], sigma = 0.02 } = {}) {
  const sc = new THREE.Scene();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(10, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color(top) }, hor: { value: new THREE.Color(horizon) }, gnd: { value: new THREE.Color(ground) } },
    vertexShader: 'varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, hor, gnd; varying vec3 vP;
      void main() { float h = normalize(vP).y; vec3 c = h > 0.0 ? mix(hor, top, smoothstep(0.0, 0.7, h)) : mix(hor, gnd, smoothstep(0.0, -0.25, h)); gl_FragColor = vec4(c, 1.0); }`,
  }));
  sc.add(dome);
  for (const L of lights) {
    const d = new THREE.Vector3(...L.dir).normalize();
    const q = new THREE.Mesh(new THREE.PlaneGeometry(L.size ?? 3, L.size ?? 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(L.color ?? 0xffffff).multiplyScalar(L.intensity ?? 4), side: THREE.DoubleSide }));
    q.position.copy(d).multiplyScalar(8); q.lookAt(0, 0, 0); sc.add(q);
  }
  const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(sc, sigma);
  pm.dispose(); dome.geometry.dispose(); dome.material.dispose();
  return rt.texture;
}
