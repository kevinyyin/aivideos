// Thin-lens depth of field (soft painted backgrounds, sharp subject). Port of templates/bridge/lensblur.ts from
// github.com/mromidev/claude-animated-shorts (MIT) to three's EffectComposer, reading the full-scene depth the
// InkPass already rendered (ink.js `depthTexture`), so it costs no extra scene render.
// CoC radius (px at 1080x1920) = cInf * |1 - focus / depth| (x nearScale in front of focus), clamped to maxCoC.
// Two deterministic gathers: pre (16 taps over 0.29 CoC) fills the gaps of main (64-tap Vogel disc over 0.96 CoC +
// a 32-tap near-field gather so a blurred foreground spreads over sharper pixels behind it). A sample only counts if
// its own disc reaches this pixel; a farther sample never spreads wider than this pixel's CoC (no halos, clean
// silhouettes). Fixed pattern: no grain, no flicker. Set focus / cInf per frame; cInf < 0.25 disables the pass.
// Optional in-focus slab `depth` (m, lt001): everything within focus +- depth/2 stays sharp (a two-shot at two
// distances, both faces crisp, background soft); 0 = the plain thin lens.
// Optional `bokeh` (0 = off): in the main gather a sample brighter than 1.0 (HDR, before tone mapping) weighs
// 1 + bokeh x (luma - 1), so lamps, glints, sun-lit dust and windows open into visible round discs instead of
// smearing into the average (the creamy-bokeh close-ups of a premium explainer).
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const FRAG = /* glsl */ `
#include <packing>
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform vec2 texel;
uniform float cNear, cFar, focus, cInf, nearScale, maxCoC, s, slab, bokeh;
float hiW(vec3 c) { return 1.0 + bokeh * max(dot(c, vec3(0.2126, 0.7152, 0.0722)) - 1.0, 0.0); }
varying vec2 vUv;
#define GOLDEN 2.39996323
float cocAt(float d) {
  float f = clamp(d, focus - slab, focus + slab);
  float c = cInf * s * (1.0 - f / max(d, 1e-3));
  if (c < 0.0) c *= nearScale;
  return clamp(c, -maxCoC * s, maxCoC * s);
}
float distAt(vec2 uv) { return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cNear, cFar); }
void main() {
  vec4 c0 = texture2D(tDiffuse, vUv);
  float d0 = distAt(vUv);
  float R = abs(cocAt(d0)) * SPREAD;
  float w0 = hiW(c0.rgb);
  vec3 acc = c0.rgb * w0; float wsum = w0;
  if (R > 0.5) {
    for (int i = 0; i < TAPS; i++) {
      float rr = sqrt((float(i) + 0.5) / float(TAPS)) * R;
      float a = float(i) * GOLDEN + ROT;
      vec2 suv = vUv + vec2(cos(a), sin(a)) * rr * texel;
      float ds = distAt(suv);
      float rs = abs(cocAt(ds)) * SPREAD;
      if (ds > d0) rs = min(rs, R);
      vec3 sc = texture2D(tDiffuse, suv).rgb;
      float w = clamp(rs - rr + 0.5, 0.0, 1.0) * hiW(sc);
      acc += sc * w; wsum += w;
    }
  }
  vec3 col = acc / wsum;
#if NEAR_TAPS > 0
  float M = maxCoC * s;
  vec3 fg = vec3(0.0); float fw = 0.0, cov = 0.0;
  for (int i = 0; i < NEAR_TAPS; i++) {
    float rr = sqrt((float(i) + 0.5) / float(NEAR_TAPS)) * M;
    if (rr <= R) continue;
    float a = float(i) * GOLDEN + 1.0;
    vec2 suv = vUv + vec2(cos(a), sin(a)) * rr * texel;
    float ds = distAt(suv);
    if (ds >= d0 * 0.97) continue;
    float rs = abs(cocAt(ds));
    float w = clamp(rs - rr + 0.5, 0.0, 1.0);
    fg += texture2D(tDiffuse, suv).rgb * w; fw += w;
    cov += w * (M * M) / max(rs * rs, 1.0);
  }
  if (fw > 0.0) col = mix(col, fg / fw, clamp(cov / float(NEAR_TAPS), 0.0, 1.0));
#endif
  gl_FragColor = vec4(col, c0.a);
}`;

const stage = (taps, spread, nearTaps, rot) => new THREE.ShaderMaterial({
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: FRAG, depthTest: false, depthWrite: false,
  defines: { TAPS: taps, SPREAD: spread.toFixed(4), NEAR_TAPS: nearTaps, ROT: rot.toFixed(4) },
  uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, texel: { value: new THREE.Vector2() }, cNear: { value: 0.1 }, cFar: { value: 100 },
    focus: { value: 5 }, cInf: { value: 0 }, slab: { value: 0 }, nearScale: { value: 1.2 }, maxCoC: { value: 24 }, s: { value: 1 }, bokeh: { value: 0 } },
});

export class LensBlurPass extends Pass {
  /** ink: an InkPass (its depthTexture is the scene depth); camera: the scene camera */
  constructor(ink, camera, { maxCoC = 24, nearScale = 1.2, bokeh = 0 } = {}) {
    super();
    this.ink = ink; this.camera = camera;
    this.pre = stage(16, 0.287, 0, 0.61); this.main = stage(64, 0.958, 32, 0);
    for (const m of [this.pre, this.main]) { m.uniforms.maxCoC.value = maxCoC; m.uniforms.nearScale.value = nearScale; }
    this.main.uniforms.bokeh.value = bokeh;
    this.tmp = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
    this.quad = new FullScreenQuad(this.pre);
    this.enabled = false;
  }
  /** focus distance along the view axis (m), blur radius at infinity (px at 1080x1920), in-focus slab depth (m) */
  set(focus, cInf, depth = 0) {
    for (const m of [this.pre, this.main]) { m.uniforms.focus.value = focus; m.uniforms.cInf.value = cInf; m.uniforms.slab.value = depth / 2; }
    this.enabled = cInf >= 0.25;
  }
  setSize(w, h) {
    this.tmp.setSize(w, h);
    for (const m of [this.pre, this.main]) { m.uniforms.texel.value.set(1 / w, 1 / h); m.uniforms.s.value = h / 1920; }
  }
  render(renderer, writeBuffer, readBuffer) {
    for (const m of [this.pre, this.main]) {
      m.uniforms.tDepth.value = this.ink.depthTexture; m.uniforms.cNear.value = this.camera.near; m.uniforms.cFar.value = this.camera.far;
    }
    this.pre.uniforms.tDiffuse.value = readBuffer.texture;
    this.quad.material = this.pre; renderer.setRenderTarget(this.tmp); this.quad.render(renderer);
    this.main.uniforms.tDiffuse.value = this.tmp.texture;
    this.quad.material = this.main; renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); this.quad.render(renderer);
  }
}
