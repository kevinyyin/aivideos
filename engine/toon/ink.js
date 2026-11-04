// Ink outlines on the 3D world for the "2D cartoon cards in a painted 3D world" look (lt001 look test).
// Port of templates/bridge/ink.ts from github.com/mromidev/claude-animated-shorts (MIT) to three's EffectComposer.
//  1. Re-render the scene into a non-MSAA target as view normals (rgb) + coverage (a) + a depth texture.
//     Cards on layer NOINK write depth but coverage 0 (never outlined, but world lines stop at them); sprites,
//     points, lines and anything with depthWrite off are skipped. The depth texture is shared with lensblur.js.
//  2. Edge mask: depth jumps (signed 2nd difference of 1/z: 0 on any plane, so no grazing-angle lines; only the NEAR
//     side is inked) + normal creases at the same depth; width shrinks a little with distance (log), fades far away.
//  3. Composite: 3x3 tent AA, near-black ink blended in display gamma (like Canvas2D), into the write buffer.
// Widths are px at 1080x1920 and scale with the output height.
// Premium options, all off by default:
//  - `ao` (0..1): screen-space ambient occlusion from the same normals + depth (half res, 16 taps, depth-aware blur):
//    soft dark corners, contact shadows under props and feet, creases on rounded props. `aoRadius` m, `aoColor` =
//    the colour occluded light falls to (a dark violet reads painted, black reads dirty). World pixels only; a card
//    occludes the floor it stands on but not a wall a metre behind it (occluders much nearer than aoRadius are ignored).
//  - `tint` (0..1): the line takes the surface colour x `tintDark` instead of near-black: world lines read as darker
//    paint, so the bold black lines stay on the characters (the reference's 3D world is barely outlined).
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

/** layer for camera-facing cards / effects: drawn and depth-tested, never outlined by the world ink */
export const NOINK = 3;

const DEF = {
  color: '#0b0a0c', strength: 1.0,
  widthNear: 4.2, widthFar: 2.6, distNear: 2, distFar: 60, creaseScale: 0.7,
  depthLo: 0.01, depthHi: 0.03, angleLo: 35, angleHi: 50, concaveGain: 0.7,
  farOpacity: 0.85, fadeNear: 150, fadeFar: 450,
  tint: 0, tintDark: 0.38, ao: 0, aoRadius: 0.45, aoColor: '#2c2238', aoBias: 0.004, aoPower: 2,
};

const FS_VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

const NORMAL_VERT = /* glsl */ `
#include <common>
uniform mat3 cutUv;
varying vec3 vN;
varying vec3 vV;
varying vec2 vCut;
void main() {
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  vN = transformedNormal;
  vCut = (cutUv * vec3(uv, 1.0)).xy;
  #include <begin_vertex>
  #include <project_vertex>
  vV = mvPosition.xyz;
}`;
const NORMAL_FRAG = /* glsl */ `
uniform sampler2D tCut;
uniform float cut;
uniform float mode;   // 0 world, 1 card (depth only, never inked), 2 skip
varying vec3 vN;
varying vec3 vV;
varying vec2 vCut;
void main() {
  if (mode > 1.5) discard;
  if (cut > 0.0 && texture2D(tCut, vCut).a < cut) discard;
  vec3 n;
  if (dot(vN, vN) < 1e-8) n = normalize(cross(dFdx(vV), dFdy(vV)));
  else n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
  gl_FragColor = vec4(n, mode > 0.5 ? 0.0 : 1.0);
}`;

const MASK_FRAG = /* glsl */ `
#include <packing>
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 texel;
uniform float cNear, cFar, p00, p11, wNear, wFar, dNear, dFar, creaseScale, depthLo, depthHi, cosLo, cosHi;
uniform float concaveGain, farOpacity, fadeNear, fadeFar, strength, pxScale, fogStart;
uniform vec2 fogRange;
varying vec2 vUv;
const vec2 STEP[4] = vec2[4](vec2(1.0, 0.0), vec2(0.0, 1.0), vec2(1.0, 1.0), vec2(1.0, -1.0));
const float SLEN[4] = float[4](1.0, 1.0, 1.41421, 1.41421);
#define RMAX 8
float dist(vec2 uv) { return -perspectiveDepthToViewZ(textureLod(tDepth, uv, 0.0).x, cNear, cFar); }
vec3 viewPos(vec2 uv, float d) { vec2 n = uv * 2.0 - 1.0; return vec3(n.x * d / p00, n.y * d / p11, -d); }
float crease(vec3 n0, vec3 P0, float zc, vec2 uq, float zq) {
  vec4 nq = textureLod(tNormal, uq, 0.0);
  if (nq.a < 0.5 || abs(zq - zc) > zc * depthLo) return 0.0;
  float k = 1.0 - smoothstep(cosHi, cosLo, dot(n0, nq.xyz));
  if (dot(viewPos(uq, zq) - P0, n0) > 0.0) k *= concaveGain;
  return k;
}
void main() {
  vec4 nc = textureLod(tNormal, vUv, 0.0);
  if (nc.a < 0.5) { gl_FragColor = vec4(0.0); return; }
  float zc = dist(vUv);
  float t = clamp(log(zc / dNear) / log(dFar / dNear), 0.0, 1.0);
  float w = mix(wNear, wFar, t) * pxScale;
  float hc = 0.5 * w * creaseScale;
  float Wc = 1.0 / zc;
  vec3 n0 = nc.xyz, P0 = viewPos(vUv, zc);
  float eD = 0.0, eN = 0.0;
  for (int a = 0; a < 4; a++) {
    for (int r = 1; r <= RMAX; r++) {
      vec2 o = STEP[a] * texel * float(r);
      float d = (float(r) - 0.5) * SLEN[a];
      float cw = clamp(w + 0.5 - d, 0.0, 1.0);
      float ch = clamp(hc + 0.5 - d, 0.0, 1.0);
      if (cw <= 0.0 && ch <= 0.0) break;
      float z1 = dist(vUv - o), z2 = dist(vUv + o);
      float s = (1.0 / z1 + 1.0 / z2 - 2.0 * Wc) / Wc;
      eD = max(eD, smoothstep(depthLo, depthHi, -s) * cw);
      if (ch > 0.0) eN = max(eN, max(crease(n0, P0, zc, vUv - o, z1), crease(n0, P0, zc, vUv + o, z2)) * ch);
    }
  }
  float ink = max(eD, eN) * strength * mix(1.0, farOpacity, t) * (1.0 - smoothstep(fadeNear, fadeFar, zc));
  float f0 = max(fogRange.x, fogStart);
  float fogK = fogRange.y > f0 ? clamp((zc - f0) / (fogRange.y - f0), 0.0, 1.0) : 0.0;
  gl_FragColor = vec4(ink, fogK, 0.0, 1.0);
}`;

// hemisphere AO, view space (P, N from the normal + depth targets); occluders far in front of the sample are ignored
const AO_FRAG = /* glsl */ `
#include <packing>
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform float cNear, cFar, p00, p11, radius, bias, power;
uniform vec3 kernel[16];
varying vec2 vUv;
float dist(vec2 uv) { return -perspectiveDepthToViewZ(textureLod(tDepth, uv, 0.0).x, cNear, cFar); }
void main() {
  vec4 nc = textureLod(tNormal, vUv, 0.0);
  if (nc.a < 0.5) { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); return; }
  float d = dist(vUv);
  vec2 nd = vUv * 2.0 - 1.0;
  vec3 P = vec3(nd.x * d / p00, nd.y * d / p11, -d), N = normalize(nc.xyz);
  float ang = 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  vec3 rv = vec3(cos(ang), sin(ang), 0.0);
  vec3 T = rv - N * dot(rv, N); T = dot(T, T) < 1e-4 ? normalize(cross(N, vec3(0.0, 0.0, 1.0)) + 1e-4) : normalize(T);
  vec3 B = cross(N, T);
  float r = radius * clamp(d / 3.0, 0.6, 2.5), occ = 0.0;
  for (int i = 0; i < 16; i++) {
    vec3 S = P + (T * kernel[i].x + B * kernel[i].y + N * kernel[i].z) * r;
    if (S.z > -cNear) continue;
    vec2 suv = vec2(S.x * p00, S.y * p11) / -S.z * 0.5 + 0.5;
    if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) continue;
    float sd = dist(suv), gap = -S.z - sd;
    occ += step(bias * d, gap) * (1.0 - smoothstep(r, 2.0 * r, gap));
  }
  gl_FragColor = vec4(pow(1.0 - occ / 16.0, power), d, 0.0, 1.0);
}`;
// separable 9-tap blur that stays on its own surface (depth-weighted)
const AO_BLUR_FRAG = /* glsl */ `
uniform sampler2D tAO;
uniform vec2 dir;
varying vec2 vUv;
void main() {
  vec2 c = texture2D(tAO, vUv).rg;
  float acc = 0.0, wsum = 0.0;
  for (int i = -4; i <= 4; i++) {
    vec2 s = texture2D(tAO, vUv + dir * float(i)).rg;
    float w = (1.0 - abs(float(i)) / 5.0) * (1.0 - smoothstep(0.02, 0.08, abs(s.g - c.g) / max(c.g, 1e-3)));
    acc += s.r * w; wsum += w;
  }
  gl_FragColor = vec4(acc / max(wsum, 1e-4), c.g, 0.0, 1.0);
}`;

const COMP_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform sampler2D tMask;
uniform sampler2D tAO;
uniform vec2 texel;
uniform vec3 inkColor, fogColor, aoColor;
uniform float fogInk, tint, tintDark, aoK;
uniform int debug;
varying vec2 vUv;
float m(float x, float y) { return texture2D(tMask, vUv + vec2(x, y) * texel).r; }
void main() {
  float a = (4.0 * m(0.0, 0.0) + 2.0 * (m(1.0, 0.0) + m(-1.0, 0.0) + m(0.0, 1.0) + m(0.0, -1.0))
    + m(1.0, 1.0) + m(-1.0, 1.0) + m(1.0, -1.0) + m(-1.0, -1.0)) / 16.0;
  vec4 c = texture2D(tDiffuse, vUv);
  if (debug == 1) { gl_FragColor = vec4(vec3(1.0 - a), 1.0); return; }
  if (aoK > 0.0) {
    float ao = texture2D(tAO, vUv).r;
    if (debug == 2) { gl_FragColor = vec4(vec3(ao), 1.0); return; }
    c.rgb *= mix(aoColor, vec3(1.0), 1.0 - (1.0 - ao) * aoK);
  }
  vec3 inkC = mix(mix(inkColor, c.rgb * tintDark, tint), fogColor, texture2D(tMask, vUv).g * fogInk);
  vec3 g = pow(max(c.rgb, 0.0), vec3(1.0 / 2.2));
  gl_FragColor = vec4(pow(mix(g, pow(inkC, vec3(1.0 / 2.2)), a), vec3(2.2)), c.a);
}`;

export class InkPass extends Pass {
  constructor(scene, camera, options = {}) {
    super();
    const o = { ...DEF, ...options };
    this.scene = scene; this.camera = camera; this.debug = 0;
    camera.layers.enable(NOINK); // the main render shows the cards; the ink pass treats them as depth-only
    this.rt = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false,
      depthBuffer: true, samples: 0, depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
    });
    this.maskRT = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false, depthBuffer: false });
    /** full-scene depth (world + cards with their cut-outs): lensblur.js reads it */
    this.depthTexture = this.rt.depthTexture;

    this.normalMat = new THREE.ShaderMaterial({
      vertexShader: NORMAL_VERT, fragmentShader: NORMAL_FRAG, side: THREE.DoubleSide,
      uniforms: { tCut: { value: null }, cut: { value: 0 }, cutUv: { value: new THREE.Matrix3() }, mode: { value: 0 } },
    });
    // per object: card / skip flag + the original material's alpha cut-out (map + alphaTest keeps card shapes)
    this.normalMat.onBeforeRender = (_r, _s, _c, _g, object, group) => {
      const mat = object.material, src = Array.isArray(mat) ? mat[group?.materialIndex ?? 0] : mat;
      const u = this.normalMat.uniforms;
      const skip = !src || src.depthWrite === false || src.visible === false || object.isSprite || object.isPoints || object.isLine;
      u.mode.value = skip ? 2 : (object.layers.mask & 1) ? 0 : 1;
      const map = src && src.alphaTest > 0 ? src.map : null;
      u.tCut.value = map; u.cut.value = map ? src.alphaTest : 0;
      if (map) { map.updateMatrix(); u.cutUv.value.copy(map.matrix); }
      this.normalMat.uniformsNeedUpdate = true;
    };
    const texel = new THREE.Vector2(1, 1);
    this.maskMat = new THREE.ShaderMaterial({
      vertexShader: FS_VERT, fragmentShader: MASK_FRAG, depthTest: false, depthWrite: false,
      uniforms: {
        tNormal: { value: this.rt.texture }, tDepth: { value: this.rt.depthTexture }, texel: { value: texel },
        cNear: { value: 0.1 }, cFar: { value: 100 }, p00: { value: 1 }, p11: { value: 1 },
        wNear: { value: o.widthNear }, wFar: { value: o.widthFar }, dNear: { value: o.distNear }, dFar: { value: o.distFar },
        creaseScale: { value: o.creaseScale }, depthLo: { value: o.depthLo }, depthHi: { value: o.depthHi },
        cosLo: { value: Math.cos(o.angleLo * Math.PI / 180) }, cosHi: { value: Math.cos(o.angleHi * Math.PI / 180) },
        concaveGain: { value: o.concaveGain }, farOpacity: { value: o.farOpacity }, fadeNear: { value: o.fadeNear },
        fadeFar: { value: o.fadeFar }, strength: { value: o.strength }, pxScale: { value: 1 },
        fogRange: { value: new THREE.Vector2() }, fogStart: { value: 60 },
      },
    });
    // AO at half resolution: raw -> blur x -> blur y (r = AO, g = distance for the depth-aware blur)
    const half = () => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false, generateMipmaps: false });
    this.aoRT = half(); this.aoTmp = half();
    const kernel = [];
    for (let i = 0; i < 16; i++) {   // fixed hemisphere (golden spiral), denser near the centre
      const z = 1 - (i + 0.5) / 16, rr = Math.sqrt(1 - z * z), a = i * 2.39996323, s = 0.15 + 0.85 * ((i + 1) / 16) ** 2;
      kernel.push(new THREE.Vector3(Math.cos(a) * rr * s, Math.sin(a) * rr * s, Math.max(z, 0.15) * s));
    }
    this.aoMat = new THREE.ShaderMaterial({
      vertexShader: FS_VERT, fragmentShader: AO_FRAG, depthTest: false, depthWrite: false,
      uniforms: { tNormal: { value: this.rt.texture }, tDepth: { value: this.rt.depthTexture }, cNear: { value: 0.1 }, cFar: { value: 100 },
        p00: { value: 1 }, p11: { value: 1 }, radius: { value: o.aoRadius }, bias: { value: o.aoBias }, power: { value: o.aoPower }, kernel: { value: kernel } },
    });
    this.aoBlur = new THREE.ShaderMaterial({ vertexShader: FS_VERT, fragmentShader: AO_BLUR_FRAG, depthTest: false, depthWrite: false,
      uniforms: { tAO: { value: null }, dir: { value: new THREE.Vector2() } } });
    this.compMat = new THREE.ShaderMaterial({
      vertexShader: FS_VERT, fragmentShader: COMP_FRAG, depthTest: false, depthWrite: false,
      uniforms: { tDiffuse: { value: null }, tMask: { value: this.maskRT.texture }, tAO: { value: this.aoRT.texture }, texel: { value: texel },
        inkColor: { value: new THREE.Color(o.color) }, fogColor: { value: new THREE.Color() }, fogInk: { value: 0.3 }, debug: { value: 0 },
        tint: { value: o.tint }, tintDark: { value: o.tintDark }, aoK: { value: o.ao }, aoColor: { value: new THREE.Color(o.aoColor) } },
    });
    this.quad = new FullScreenQuad(this.maskMat);
  }

  /** live tuning, e.g. ink.set({ widthNear: 3.4 }) */
  set(o) {
    const u = this.maskMat.uniforms;
    const map = { widthNear: 'wNear', widthFar: 'wFar', distNear: 'dNear', distFar: 'dFar', creaseScale: 'creaseScale', depthLo: 'depthLo',
      depthHi: 'depthHi', concaveGain: 'concaveGain', farOpacity: 'farOpacity', fadeNear: 'fadeNear', fadeFar: 'fadeFar', strength: 'strength' };
    for (const k in map) if (o[k] !== undefined) u[map[k]].value = o[k];
    if (o.angleLo !== undefined) u.cosLo.value = Math.cos(o.angleLo * Math.PI / 180);
    if (o.angleHi !== undefined) u.cosHi.value = Math.cos(o.angleHi * Math.PI / 180);
    if (o.color !== undefined) this.compMat.uniforms.inkColor.value.set(o.color);
    const c = this.compMat.uniforms;
    if (o.tint !== undefined) c.tint.value = o.tint;
    if (o.tintDark !== undefined) c.tintDark.value = o.tintDark;
    if (o.ao !== undefined) c.aoK.value = o.ao;
    if (o.aoColor !== undefined) c.aoColor.value.set(o.aoColor);
    if (o.aoRadius !== undefined) this.aoMat.uniforms.radius.value = o.aoRadius;
    if (o.aoBias !== undefined) this.aoMat.uniforms.bias.value = o.aoBias;
    if (o.aoPower !== undefined) this.aoMat.uniforms.power.value = o.aoPower;
  }

  setSize(w, h) {
    this.rt.setSize(w, h); this.maskRT.setSize(w, h);
    const hw = Math.max(1, Math.round(w / 2)), hh = Math.max(1, Math.round(h / 2));
    this.aoRT.setSize(hw, hh); this.aoTmp.setSize(hw, hh); this.aoTexel = [1 / hw, 1 / hh];
    this.maskMat.uniforms.texel.value.set(1 / w, 1 / h);
    this.maskMat.uniforms.pxScale.value = h / 1920;
  }

  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera: cam } = this;
    const autoClear = renderer.autoClear, shadowAuto = renderer.shadowMap.autoUpdate;
    const override = scene.overrideMaterial, background = scene.background, clear = renderer.getClearColor(new THREE.Color()), ca = renderer.getClearAlpha();
    renderer.autoClear = false;
    // 1) normals + depth of everything the camera sees (shadow maps are reused, not re-rendered)
    scene.overrideMaterial = this.normalMat; scene.background = null; renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x000000, 0); renderer.setRenderTarget(this.rt); renderer.clear(true, true, false);
    renderer.render(scene, cam);
    scene.overrideMaterial = override; scene.background = background; renderer.shadowMap.autoUpdate = shadowAuto;
    renderer.setClearColor(clear, ca);
    // 2) edge mask
    const u = this.maskMat.uniforms, e = cam.projectionMatrix.elements;
    u.cNear.value = cam.near; u.cFar.value = cam.far; u.p00.value = e[0]; u.p11.value = e[5];
    const fog = scene.fog;
    if (fog && fog.isFog) { u.fogRange.value.set(fog.near, fog.far); this.compMat.uniforms.fogColor.value.copy(fog.color); } else u.fogRange.value.set(0, 0);
    this.quad.material = this.maskMat; renderer.setRenderTarget(this.maskRT); this.quad.render(renderer);
    // 2b) ambient occlusion (half res), only when switched on
    if (this.compMat.uniforms.aoK.value > 0) {
      const a = this.aoMat.uniforms; a.cNear.value = cam.near; a.cFar.value = cam.far; a.p00.value = e[0]; a.p11.value = e[5];
      this.quad.material = this.aoMat; renderer.setRenderTarget(this.aoRT); this.quad.render(renderer);
      const b = this.aoBlur.uniforms; this.quad.material = this.aoBlur;
      b.tAO.value = this.aoRT.texture; b.dir.value.set(this.aoTexel[0], 0); renderer.setRenderTarget(this.aoTmp); this.quad.render(renderer);
      b.tAO.value = this.aoTmp.texture; b.dir.value.set(0, this.aoTexel[1]); renderer.setRenderTarget(this.aoRT); this.quad.render(renderer);
    }
    // 3) composite
    this.compMat.uniforms.tDiffuse.value = readBuffer.texture; this.compMat.uniforms.debug.value = this.debug;
    this.quad.material = this.compMat; renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); this.quad.render(renderer);
    renderer.autoClear = autoClear;
  }
}
