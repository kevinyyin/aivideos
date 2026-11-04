// Painted sky for the toon look: a painted gradient with a glowing sun / moon, radiating rays and soft clouds lit
// from below. One dome that rides with the camera (never clipped, always behind
// everything), plus camera-facing cloud cards and optional stars. Colours are sRGB hex; the sun / moon disc is HDR
// (sunHDR > 1 blooms). Everything is on layer NOINK with depthWrite off: no outlines, no AO, and the lens blur treats
// it as infinitely far.
import * as THREE from 'three';
import { NOINK } from './ink.js';
import { ctex } from './paint.js';

const VERT = /* glsl */ `
varying vec3 vD;
void main() {
  vD = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;   // on the far plane: behind everything, never clipped
}`;
const FRAG = /* glsl */ `
uniform vec3 top, mid, hor, gnd, sunDir, sunCol;
uniform float midH, sunSize, sunHDR, glow, glowW, rays, rayN, rayRot, haze, stars;
varying vec3 vD;
// soft round stars on an az / el grid (one candidate per cell, jittered); radius ~3 px at 1080 wide, fov ~50
float starField(vec3 d) {
  float el = asin(clamp(d.y, -1.0, 1.0)), az = atan(d.x, -d.z);
  vec2 g = vec2(az / 6.2831853 * 220.0, el / 1.5707963 * 60.0), cell = floor(g), f = fract(g);
  float h = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  if (h > stars) return 0.0;
  vec2 c = vec2(fract(h * 17.31), fract(h * 31.73)) * 0.6 + 0.2;
  vec2 dd = (f - c) * vec2(6.2831853 / 220.0 * cos(el), 1.5707963 / 60.0);
  return smoothstep(0.0022, 0.0, length(dd)) * (0.25 + 0.7 * fract(h * 91.7)) * smoothstep(0.05, 0.3, d.y);   // < 1: no bokeh blobs
}
void main() {
  vec3 d = normalize(vD);
  float h = d.y;
  vec3 c = h < midH ? mix(hor, mid, smoothstep(0.0, midH, h)) : mix(mid, top, smoothstep(midH, 1.0, h));
  c = mix(c, gnd, smoothstep(0.0, -0.2, h));
  c += hor * haze * exp(-abs(h) * 14.0);                       // bright band on the horizon
  float cs = dot(d, sunDir), ang = acos(clamp(cs, -1.0, 1.0));
  c += sunCol * glow * (pow(max(cs, 0.0), glowW) + 0.6 * pow(max(cs, 0.0), glowW * 8.0));
  vec3 u = normalize(cross(sunDir, abs(sunDir.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0))), v = cross(sunDir, u);
  float phi = atan(dot(d, v), dot(d, u)) + rayRot;
  float stripe = pow(0.5 + 0.5 * sin(phi * rayN + 1.7 * sin(phi * 3.0)), 5.0) * (0.6 + 0.4 * sin(phi * 7.0 + 1.3));
  c += sunCol * rays * stripe * exp(-max(ang - sunSize, 0.0) * 2.2) * smoothstep(sunSize * 0.9, sunSize * 1.6, ang) * step(0.0, cs);
  if (stars > 0.0) c += vec3(1.0, 0.97, 0.92) * starField(d) * smoothstep(sunSize * 3.0, sunSize * 6.0, ang);
  c = mix(c, sunCol * sunHDR, smoothstep(sunSize * 1.04, sunSize * 0.97, ang));
  gl_FragColor = vec4(c, 1.0);
}`;

/** a puffy cloud card: union of round puffs on a flat base, top colour fading to a lit bottom + a bright under-rim */
function cloudTex(topC, botC, rimC, seed) {
  return ctex(`toonCloud${topC}${botC}${rimC}${seed}`, 512, 256, (g, r, W, H) => {
    const base = H * 0.7, puffs = 5 + Math.floor(r() * 3), path = new Path2D();
    path.roundRect(W * 0.08, base - H * 0.16, W * 0.84, H * 0.16, H * 0.08);
    for (let i = 0; i < puffs; i++) {
      const x = W * (0.18 + (0.64 * i) / (puffs - 1)) + (r() - 0.5) * 20, rad = H * (0.13 + 0.17 * Math.sin((Math.PI * (i + 0.5)) / puffs) + r() * 0.06);
      path.moveTo(x + rad, base - rad * 0.55); path.arc(x, base - rad * 0.55, rad, 0, Math.PI * 2);
    }
    g.filter = 'blur(2.5px)';
    const gr = g.createLinearGradient(0, H * 0.1, 0, base);
    gr.addColorStop(0, topC); gr.addColorStop(0.55, topC); gr.addColorStop(1, botC);
    g.fillStyle = gr; g.fill(path);
    g.save(); g.clip(path);
    const rim = g.createLinearGradient(0, base - H * 0.1, 0, base);
    rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(1, rimC);
    g.fillStyle = rim; g.fillRect(0, base - H * 0.1, W, H * 0.1); g.restore();
  });
}

/**
 * makeSky(parent, opts) -> { root, dome, clouds, update(camera) }
 *  top / mid / horizon / ground: gradient (mid sits at elevation midH, 0..1 = sin of the angle)
 *  sun: { dir: [x, y, z] toward the sun / moon, color, size (rad, 0.05 = a big toon sun), hdr (disc brightness),
 *         glow, glowW (glow tightness), rays (0 = none), rayN (ray count) }
 *  clouds: { n, top, bottom, rim, az: [from, to] (deg, 0 = -z, 90 = +x), el: [from, to] (deg), size (m), dist (m),
 *            brightness, seed }  (dist must stay < camera.far, and beyond your farthest hills: the cards are depth-tested)
 *  stars: 0..1 = share of grid cells holding a star (0.1 = a clear night)
 * Call update(camera) every frame after the camera moves (the dome follows it).
 */
export function makeSky(parent, { top = '#6fa7e0', mid = '#a9cdec', horizon = '#f3e6d2', ground = '#cdb89a', midH = 0.28, haze = 0.15,
  sun = {}, clouds = null, stars = 0, r = 50 } = {}) {
  const root = new THREE.Group(); parent.add(root);
  const S = { dir: [0.3, 0.25, -1], color: '#fff2d6', size: 0.045, hdr: 3, glow: 0.35, glowW: 6, rays: 0, rayN: 18, ...sun };
  const col = (h) => new THREE.Color(h);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: col(top) }, mid: { value: col(mid) }, hor: { value: col(horizon) }, gnd: { value: col(ground) }, midH: { value: midH }, haze: { value: haze },
      sunDir: { value: new THREE.Vector3(...S.dir).normalize() }, sunCol: { value: col(S.color) }, sunSize: { value: S.size }, sunHDR: { value: S.hdr },
      glow: { value: S.glow }, glowW: { value: S.glowW }, rays: { value: S.rays }, rayN: { value: S.rayN }, rayRot: { value: 0 }, stars: { value: stars } },
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), mat);
  dome.renderOrder = -1000; dome.frustumCulled = false; dome.layers.set(NOINK); root.add(dome);
  const cl = [];
  if (clouds) {
    const C = { n: 6, top: '#ffffff', bottom: '#e9eef5', rim: 'rgba(255,255,255,0.9)', az: [-50, 50], el: [8, 30], size: 60, dist: 300, brightness: 1, seed: 1, ...clouds };
    let s = C.seed * 7919 + 13;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < C.n; i++) {
      const az = THREE.MathUtils.degToRad(C.az[0] + ((C.az[1] - C.az[0]) * (i + 0.2 + rnd() * 0.6)) / C.n);
      const el = THREE.MathUtils.degToRad(C.el[0] + (C.el[1] - C.el[0]) * rnd());
      const m = new THREE.SpriteMaterial({ map: cloudTex(C.top, C.bottom, C.rim, (C.seed + i) % 4), transparent: true, depthWrite: false, fog: false,
        color: new THREE.Color().setScalar(C.brightness) });
      const sp = new THREE.Sprite(m), w = C.size * (0.7 + rnd() * 0.6) * (1 + 0.3 * Math.cos(el));
      sp.scale.set(w, w / 2, 1);
      sp.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).multiplyScalar(C.dist);
      sp.renderOrder = -999; sp.layers.set(NOINK); root.add(sp); cl.push(sp);
    }
  }
  const v = new THREE.Vector3();
  return {
    root, dome, clouds: cl, material: mat,
    /** keep the dome centred on the camera; t (s) slowly turns the rays */
    update(camera, t = 0) {
      camera.getWorldPosition(v); parent.worldToLocal(v); root.position.copy(v);
      mat.uniforms.rayRot.value = t * 0.02;
    },
  };
}
