// dh015 shared scene helpers (dh013's util, the bits this video uses): easing, a boing, walk phase, camera shake,
// placing a toon (+ its contact blob), holding a prop in front of a drawn hand.
import * as THREE from 'three';
import { K, clamp, lerp, smooth } from '@engine/core.js';
import { handFront } from '@engine/toon/kit.js';

export { K, clamp, lerp, smooth };
export const PI = Math.PI;
export const sm = (t, a, b) => smooth(clamp((t - a) / (b - a)));
/** 0 → 1 with an overshoot (a cartoon "boing") over d seconds from t0 */
export function boing(t, t0, d = 0.35) {
  const u = clamp((t - t0) / d);
  return u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * PI * 2.2) * Math.exp(-u * 5.5);
}
export const shake = (t, t0, amp = 0.02, dur = 0.35) => (t < t0 || t > t0 + dur ? 0 : amp * (1 - (t - t0) / dur) * Math.sin((t - t0) * 70));
/** walk phase quantized to 12 poses per stride (the card cache repeats) */
export const phase = (dist, stride = 0.42) => Math.round((dist / stride) * 6) * (PI / 6);
/** put a toon (and its blob) at p = [x, y, z] in its set; y lifts the card (seated toons use y < 0) */
export function place(tn, p, y = 0) {
  tn.root.position.set(p[0], y, p[2]); tn.root.visible = true;
  if (tn.blob) { tn.blob.position.set(p[0], 0.006 + (p[1] || 0), p[2] + 0.02); tn.blob.visible = y > -0.05; }
}
/** move a prop group to a point just in front of a toon's drawn hand (u, v), in the set's local space */
export function hold(root, obj, tn, u, v, camera, d = 0.06) {
  tn.root.updateMatrixWorld(true);
  root.worldToLocal(handFront(tn, u, v, camera, d, obj.position));
  return obj.position;
}
export const V3 = (a) => new THREE.Vector3(...a);
