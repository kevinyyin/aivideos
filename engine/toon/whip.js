// Whip pan for the toon look: change the picture with a hard cut or a fast camera swing smeared by motion blur,
// not a ~0.45 s zoom-dissolve (that leaves ~15 % of the frames as double exposures).
//   whipCam(A, B, t, t0, dur): camera A swings sideways out of frame, the cut happens mid-swing, camera B swings in
//   and settles. Returns { p, a, fov, blur } with blur = [dx, dy] in px at 1080x1920 (the screen speed this frame).
//   WhipBlurPass: directional box blur along blur; toonPost adds it (off until set to something > 0.5 px).
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 dir;   // half the smear, in uv
varying vec2 vUv;
void main() {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 32; i++) acc += texture2D(tDiffuse, vUv + dir * (float(i) / 31.0 * 2.0 - 1.0)).rgb;
  gl_FragColor = vec4(acc / 32.0, texture2D(tDiffuse, vUv).a);
}`;

export class WhipBlurPass extends Pass {
  constructor() {
    super();
    this.mat = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: FRAG, depthTest: false, depthWrite: false,
      uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2() } },
    });
    this.quad = new FullScreenQuad(this.mat);
    this.enabled = false;
  }
  /** smear length in px at 1080x1920 (the camera's screen motion over one frame); < 0.5 px switches the pass off */
  set(dx = 0, dy = 0) {
    this.mat.uniforms.dir.value.set(dx / 1080 / 2, dy / 1920 / 2);
    this.enabled = Math.hypot(dx, dy) >= 0.5;
  }
  render(renderer, writeBuffer, readBuffer) {
    this.mat.uniforms.tDiffuse.value = readBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); this.quad.render(renderer);
  }
}

const easeIn = (u) => u * u;
const MAX_BLUR = 320;   // px: longer smears show the 32 taps as separate copies
const UP = new THREE.Vector3(0, 1, 0);
/** aim of camera c turned by yaw (rad, + = left) about its own position */
function turned(c, yaw) {
  const d = new THREE.Vector3(c.a[0] - c.p[0], c.a[1] - c.p[1], c.a[2] - c.p[2]).applyAxisAngle(UP, yaw);
  return [c.p[0] + d.x, c.p[1] + d.y, c.p[2] + d.z];
}
/** the yaw offset of the whip at time t: A turns right (accelerating) until the cut at mid-swing, B arrives from
 *  the left and settles (decelerating); outside [t0, t0 + dur] it's 0 and the camera is A before, B after */
function yawAt(t, t0, dur, angle) {
  const u = (t - t0) / dur;
  if (u <= 0 || u >= 1) return 0;
  return u < 0.5 ? -angle * easeIn(u * 2) : angle * easeIn(2 - u * 2);
}
/**
 * whipCam(A, B, t, t0, { dur = 0.32, angle = 0.7, fps = 30 })
 * A, B = { p: [x, y, z], a: [x, y, z], fov } (B may be a function of t, e.g. a shot that is already moving).
 * Swing direction: +angle = the picture slides left (a pan to the right); pass a negative angle for the other way.
 */
export function whipCam(A, B, t, t0, { dur = 0.32, angle = 0.7, fps = 30 } = {}) {
  const pick = (tt) => (tt < t0 + dur / 2 ? A : B);
  const cam = (tt) => { const c = pick(tt); const k = typeof c === 'function' ? c(tt) : c; return { ...k, a: turned(k, yawAt(tt, t0, dur, angle)) }; };
  const now = cam(t);
  const u = (t - t0) / dur, prevT = t - 1 / fps;
  const focal = 960 / Math.tan(THREE.MathUtils.degToRad(now.fov) / 2);   // px per radian at the frame centre (H 1920)
  let dyaw = 0;
  if (u > 0 && u < 1) {
    // across the cut the yaw jumps from one side to the other: use the peak speed there (d/du of angle·(2u)² at u = ½)
    dyaw = (prevT < t0 + dur / 2) === (t < t0 + dur / 2) ? Math.abs(yawAt(t, t0, dur, angle) - yawAt(prevT, t0, dur, angle)) : 4 * Math.abs(angle) / (dur * fps);
  }
  return { ...now, blur: [Math.min(MAX_BLUR, dyaw * focal), 0] };
}
