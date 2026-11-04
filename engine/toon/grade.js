// Colour grade for the toon look. Port of templates/bridge/grade.ts from github.com/mromidev/claude-animated-shorts
// (MIT). Runs AFTER three's OutputPass, so it works directly on display (sRGB) values:
//   1. RGB tone curve: monotone cubic Hermite through 7 knots at x = 0, .1, .25, .5, .75, .9, 1
//   2. saturation around luma, separately for shadows / mids / highlights
//   3. 3-way split tone: zero-luma (Cb, Cr) offsets in shadows, mids, highlights
//   4. vignette: x (1 - k * smoothstep(r0, 1, r)), r = elliptical radius
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float ky[7];
uniform float km[7];
uniform vec3 sat, tintS, tintM, tintH;
uniform vec2 vig;
uniform float amount;
varying vec2 vUv;
float herm(float v, float x0, float x1, float y0, float y1, float m0, float m1) {
  float h = x1 - x0, t = (v - x0) / h, t2 = t * t, t3 = t2 * t;
  return (2.0 * t3 - 3.0 * t2 + 1.0) * y0 + (t3 - 2.0 * t2 + t) * h * m0 + (-2.0 * t3 + 3.0 * t2) * y1 + (t3 - t2) * h * m1;
}
float curve(float v) {
  v = clamp(v, 0.0, 1.0);
  if (v < 0.1)  return herm(v, 0.0, 0.1, ky[0], ky[1], km[0], km[1]);
  if (v < 0.25) return herm(v, 0.1, 0.25, ky[1], ky[2], km[1], km[2]);
  if (v < 0.5)  return herm(v, 0.25, 0.5, ky[2], ky[3], km[2], km[3]);
  if (v < 0.75) return herm(v, 0.5, 0.75, ky[3], ky[4], km[3], km[4]);
  if (v < 0.9)  return herm(v, 0.75, 0.9, ky[4], ky[5], km[4], km[5]);
  return herm(v, 0.9, 1.0, ky[5], ky[6], km[5], km[6]);
}
void main() {
  vec4 src = texture2D(tDiffuse, vUv);
  vec3 c = vec3(curve(src.r), curve(src.g), curve(src.b));
  float y = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float wS = 1.0 - smoothstep(0.0, 0.55, y), wH = smoothstep(0.45, 1.0, y), wM = 1.0 - wS - wH;
  float s = sat.y + (sat.x - sat.y) * wS + (sat.z - sat.y) * wH;
  c = vec3(y) + s * (c - vec3(y));
  c += wS * tintS + wM * tintM + wH * tintH;
  float r = length(vUv * 2.0 - 1.0) * 0.70710678;
  c *= 1.0 - vig.x * smoothstep(vig.y, 1.0, r);
  gl_FragColor = vec4(mix(src.rgb, clamp(c, 0.0, 1.0), amount), src.a);
}`;

const KX = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1];
/** Fritsch-Carlson monotone tangents for the 7 fixed knots */
export function monoTangents(ky) {
  const n = KX.length, h = [], d = [], m = new Array(n).fill(0);
  for (let k = 0; k < n - 1; k++) { h.push(KX[k + 1] - KX[k]); d.push((ky[k + 1] - ky[k]) / h[k]); }
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let k = 1; k < n - 1; k++) {
    if (d[k - 1] * d[k] <= 0) continue;
    const w1 = 2 * h[k] + h[k - 1], w2 = h[k] + 2 * h[k - 1];
    m[k] = (w1 + w2) / (w1 / d[k - 1] + w2 / d[k]);
  }
  return m;
}
// BT.709 zero-luma chroma basis: unit Cb / Cr as RGB offsets
const tintRGB = ([cb, cr], v = new THREE.Vector3()) => v.set(1.5748 * cr, -0.18733 * cb - 0.46813 * cr, 1.8556 * cb);

/** gentle day S-curve (bridge GRADE_DAY2) */
export const GRADE_DAY = { ky: [0, 0.1, 0.28, 0.6, 0.835, 0.945, 1], sat: [1.0, 1.05, 1.0], tintS: [0.01, 0.002], tintM: [0, 0], tintH: [0.006, 0], vig: [0.12, 0.45] };
/** warm interior: lifted mids, rich saturation, violet shadows, heavier vignette */
export const GRADE_WARM = { ky: [0.02, 0.12, 0.3, 0.6, 0.84, 0.95, 1], sat: [1.0, 1.12, 1.05], tintS: [0.02, 0.006], tintM: [-0.004, 0.01], tintH: [-0.01, 0.006], vig: [0.18, 0.42] };

/** muted storybook (lt001 fit to a narrated-explainer Short): lifted blacks, soft shoulder, ~0.8x saturation,
 *  warm highlights, faint violet shadows */
export const GRADE_SOFT = { ky: [0.045, 0.14, 0.31, 0.58, 0.8, 0.915, 0.985], sat: [0.82, 0.8, 0.82], tintS: [0.012, 0.004], tintM: [-0.006, 0.006], tintH: [-0.014, 0.008], vig: [0.14, 0.45] };

/** GRADE_SOFT with light in it (lt001 v2): darker toe, brighter shoulder (lit areas reach
 *  white), the same muted saturation, a stronger vignette that pulls the eye to the lit subject */
export const GRADE_LIT = { ky: [0.02, 0.105, 0.27, 0.56, 0.82, 0.94, 1.0], sat: [0.86, 0.84, 0.84], tintS: [0.016, 0.004], tintM: [-0.006, 0.006], tintH: [-0.016, 0.01], vig: [0.18, 0.4] };

/** richer colour: fuller mids, warm highlights
 *  against blue-violet shadows (hue contrast instead of one brown cast), soft toe, bright shoulder, firm vignette */
export const GRADE_RICH = { ky: [0.025, 0.11, 0.27, 0.55, 0.81, 0.935, 0.995], sat: [1.0, 1.1, 0.95], tintS: [0.03, 0.006], tintM: [-0.004, 0.006], tintH: [-0.024, 0.016], vig: [0.22, 0.38] };
/** moonlit night: blue shadows and mids, highlights left neutral so warm lamps still read warm, heavy vignette */
export const GRADE_NIGHT = { ky: [0.03, 0.1, 0.235, 0.5, 0.77, 0.91, 0.985], sat: [1.0, 1.06, 0.92], tintS: [0.045, -0.006], tintM: [0.02, -0.002], tintH: [-0.004, 0.006], vig: [0.3, 0.32] };

export class GradePass extends Pass {
  constructor(p = GRADE_DAY, amount = 1) {
    super();
    this.mat = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: FRAG, depthTest: false, depthWrite: false,
      uniforms: { tDiffuse: { value: null }, ky: { value: [] }, km: { value: [] }, sat: { value: new THREE.Vector3() },
        tintS: { value: new THREE.Vector3() }, tintM: { value: new THREE.Vector3() }, tintH: { value: new THREE.Vector3() },
        vig: { value: new THREE.Vector2() }, amount: { value: amount } },
    });
    this.quad = new FullScreenQuad(this.mat);
    this.set(p);
  }
  /** switch preset (or blend p -> q by t) */
  set(p, q = null, t = 0) {
    const L = (a, b) => (q ? a + (b - a) * t : a), u = this.mat.uniforms, Q = q || p;
    u.ky.value = p.ky.map((v, i) => L(v, Q.ky[i])); u.km.value = monoTangents(u.ky.value);
    u.sat.value.set(...p.sat.map((v, i) => L(v, Q.sat[i])));
    for (const k of ['tintS', 'tintM', 'tintH']) tintRGB(p[k].map((v, i) => L(v, Q[k][i])), u[k].value);
    u.vig.value.set(...p.vig.map((v, i) => L(v, Q.vig[i])));
  }
  set amount(v) { this.mat.uniforms.amount.value = v; }
  render(renderer, writeBuffer, readBuffer) {
    this.mat.uniforms.tDiffuse.value = readBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); this.quad.render(renderer);
  }
}
