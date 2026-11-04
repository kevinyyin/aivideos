// Stylised lighting for the toon look. Port of templates/bridge/shade.ts + cardshade.ts from
// github.com/mromidev/claude-animated-shorts (MIT).
//  twoTone(mat): world materials = albedo x mix(shadeCol, litCol, sunTerm); sunTerm = the real shadow-map visibility
//    of directional light 0 (the only shadow caster) x a soft N.L terminator. Painted, coloured shadows (lavender /
//    violet), not additive light. TONE uniforms are shared: change them per shot.
//  cardShade(mat): character cards are lit by the scene without looking like geometry: albedo x scene tint x
//    mix(charShade, 1, sunVis) x gain. A blinds / leaf shadow falls across the face; no N.L (the card is flat).
//  Light, not just tone: point / spot lights (lamps, a window's glow, a pool
//    on a table) now ADD to the two-tone sun on world and cards (`extra`, 0 = the old sun-only look), and cards get a
//    real lit / shaded side from the sun's screen direction (the repo's cardshade side gradient: far side darker +
//    lavender, head top a touch brighter).
//  Premium pass: `rim` (linear RGB, default 0 = off) adds a fresnel rim on world materials, strongest
//    when the sun is behind them (backlit props glow at the edges, like a sunset hill); `toonMetal` = a real PBR metal
//    that reflects `scene.environment` (light.js makeEnv): gold, brass, silver read as metal instead of yellow plastic.
import * as THREE from 'three';

export const TONE = {
  uLitCol: { value: new THREE.Vector3(1.45, 1.38, 1.24) }, uShadeCol: { value: new THREE.Vector3(0.62, 0.6, 0.86) },
  uLambert: { value: 0.35 }, uSideK: { value: 0.86 }, uTerm: { value: 0.2 }, uSat: { value: 1 }, uExtra: { value: 1 },
  uRim: { value: new THREE.Vector3(0, 0, 0) },
};
export const CHAR = {
  uCharTint: { value: new THREE.Vector3(1, 0.97, 0.95) }, uCharShade: { value: 0.8 }, uCharGain: { value: 1.0 },
  uHeadGrad: { value: 0.2 }, uBodyGrad: { value: 0.3 }, uSideTint: { value: new THREE.Vector3(0.88, 0.85, 1.0) }, uCharExtra: { value: 1 },
};
/** set the shared look for this shot: lit / shade multipliers (linear RGB), card tint, card shadow floor */
export function setTone({ lit, shade, sat, term, lambert, extra, charTint, charShade, charGain, headGrad, bodyGrad, charExtra, rim } = {}) {
  if (rim) TONE.uRim.value.set(...rim);
  if (extra !== undefined) TONE.uExtra.value = extra;
  if (headGrad !== undefined) CHAR.uHeadGrad.value = headGrad;
  if (bodyGrad !== undefined) CHAR.uBodyGrad.value = bodyGrad;
  if (charExtra !== undefined) CHAR.uCharExtra.value = charExtra;
  if (lit) TONE.uLitCol.value.set(...lit);
  if (shade) TONE.uShadeCol.value.set(...shade);
  if (sat !== undefined) TONE.uSat.value = sat;
  if (term !== undefined) TONE.uTerm.value = term;
  if (lambert !== undefined) TONE.uLambert.value = lambert;
  if (charTint) CHAR.uCharTint.value.set(...charTint);
  if (charShade !== undefined) CHAR.uCharShade.value = charShade;
  if (charGain !== undefined) CHAR.uCharGain.value = charGain;
}

// directional light 0's shadow visibility, captured inside three's own light loop
export const LFB = THREE.ShaderChunk.lights_fragment_begin
  .replace('directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ]',
    'sunVis = ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ]')
  .replace('vDirectionalShadowCoord[ i ] ) : 1.0;', 'vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\tdirectLight.color *= sunVis;')
  // point + spot lights run before the directional loop: keep their diffuse so it can be added back
  .replace('#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )', 'toonPre = reflectedLight.directDiffuse;\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )');
const PRE = 'float sunVis = 1.0; vec3 toonPre = vec3( 0.0 );\n';
if (!LFB.includes('directLight.color *= sunVis') || !LFB.includes('toonPre =')) throw new Error('toon/shade.js: three lights_fragment_begin changed');

const TWO_TONE = /* glsl */ `
#if NUM_DIR_LIGHTS > 0
{
  vec3 sunV = directionalLights[ 0 ].direction;
  vec3 upV = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );
  float ndl = max( dot( geometryNormal, sunV ), 0.0 );
  float sunTerm = sunVis * smoothstep( 0.0, uTerm, ndl );
  float skyK = mix( uSideK, 1.0, 0.5 + 0.5 * dot( geometryNormal, upV ) );
  vec3 lit = uLitCol * mix( 1.0, ndl, uLambert );
  vec3 alb = max( mix( vec3( dot( diffuseColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) ) ), diffuseColor.rgb, uSat ), 0.0 );
  reflectedLight.directDiffuse = alb * mix( uShadeCol, lit, sunTerm ) * skyK + toonPre * uExtra;
  float fres = pow( 1.0 - saturate( dot( geometryNormal, geometryViewDir ) ), 3.0 );
  float back = 0.35 + 0.65 * smoothstep( 0.0, 0.7, -dot( sunV, geometryViewDir ) );
  float side = 1.0 - smoothstep( 0.45, 0.85, dot( geometryNormal, upV ) );   // no rim on floors seen at a grazing angle
  reflectedLight.directDiffuse += uRim * fres * back * side * mix( vec3( 1.0 ), alb, 0.5 );
  reflectedLight.indirectDiffuse = vec3( 0.0 );
}
#endif
`;
const TT_DECL = '#include <common>\nuniform vec3 uLitCol; uniform vec3 uShadeCol; uniform float uLambert; uniform float uSideK; uniform float uTerm; uniform float uSat; uniform float uExtra; uniform vec3 uRim;';

/** Lambert / Phong -> two-tone (Phong keeps its specular, masked by the shadow). Returns the material. */
export function twoTone(m) {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, TONE);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', TT_DECL)
      .replace('#include <lights_fragment_begin>', PRE + LFB)
      .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n' + TWO_TONE);
  };
  m.customProgramCacheKey = () => 'toonTwoTone3';
  return m;
}

// card zones in the cards.js design (600 x 1000, head centre (300, 215), R 148): head v > ~0.64, head half-width
// 0.25 of the card, torso ~0.17. `grad: false` for cards that are not a standing toon (a hand lying on a table).
const CARD = /* glsl */ `
vec3 outgoingLight = diffuseColor.rgb * uCharTint * mix( uCharShade, 1.0, sunVis ) * uCharGain;
#if defined( CARD_GRAD ) && NUM_DIR_LIGHTS > 0
{
  vec3 sunV = directionalLights[ 0 ].direction;
  float side = sign( sunV.x ) * smoothstep( 0.0, 0.35, abs( sunV.x ) );     // + = sun on screen right
  float head = smoothstep( 0.62, 0.66, vMapUv.y );
  float uu = clamp( ( vMapUv.x - 0.5 ) / mix( 0.17, 0.25, head ), -1.0, 1.0 ) * sign( dFdx( vMapUv.x ) + 1e-7 );
  float t = uu * side, dark = smoothstep( -0.15, 0.9, -t );
  float g = mix( uBodyGrad, uHeadGrad, head );
  float top = 1.0 + 0.06 * head * clamp( ( vMapUv.y - 0.785 ) / 0.15, -1.0, 1.0 ) * step( 0.0, sunV.y );
  outgoingLight *= ( 1.0 - g * dark ) * mix( vec3( 1.0 ), uSideTint, dark ) * top * ( 1.0 + 0.05 * smoothstep( 0.0, 0.9, t ) );
}
#endif
outgoingLight += toonPre * uCharExtra;
`;
/** MeshLambertMaterial(map, alphaTest) -> a card lit by the scene (tint + cast shadows + lamps), never by the sun's N.L */
export function cardShade(m, { grad = true } = {}) {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, CHAR);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', (grad ? '#define CARD_GRAD\n' : '') + '#include <common>\nuniform vec3 uCharTint; uniform float uCharShade; uniform float uCharGain; uniform float uHeadGrad; uniform float uBodyGrad; uniform vec3 uSideTint; uniform float uCharExtra;')
      .replace('#include <lights_fragment_begin>', PRE + LFB)
      .replace('vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;', CARD);
  };
  m.customProgramCacheKey = () => 'toonCard2' + (grad ? 'g' : '');
  return m;
}

/** world material helper: painted map or flat colour, two-tone lit */
/** world material helper: painted map or flat colour, two-tone lit; `shiny` (Phong shininess) adds a soft specular
 *  highlight (brass, coins, a magnifier rim), masked by the sun's shadow */
export function toonMat(c, { shiny, spec = 0x5a5048, ...extra } = {}) {
  const base = { ...(c && c.isTexture ? { map: c } : { color: c }), ...extra };
  return twoTone(shiny ? new THREE.MeshPhongMaterial({ ...base, shininess: shiny, specular: spec }) : new THREE.MeshLambertMaterial(base));
}

/** reflective metal (gold, brass, silver, bronze): a plain PBR MeshStandardMaterial, so it needs `scene.environment`
 *  (light.js makeEnv) to have something to reflect; without one it reads near-black. `rough` 0.2 polished .. 0.5 worn */
export function toonMetal(c, { rough = 0.3, ...extra } = {}) {
  return new THREE.MeshStandardMaterial({ ...(c && c.isTexture ? { map: c } : { color: c }), metalness: 1, roughness: rough, ...extra });
}

/** see-through "x-ray" shell for mechanism reveals ("Why Cowboys Never Load Six Bullets" opens its revolver as tinted
 *  glass with the gold rounds showing inside): a faint tint in the middle, a bright fresnel rim at the silhouette.
 *  depthWrite off, so the ink pass and the AO skip it and whatever sits inside keeps its own outlines. */
export function toonGlass(color = '#bfe3ff', { opacity = 0.14, rim = '#ffffff', rimOpacity = 0.85, power = 2.2 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { tint: { value: new THREE.Color(color) }, rimCol: { value: new THREE.Color(rim) }, a0: { value: opacity }, a1: { value: rimOpacity }, pw: { value: power } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }',
    fragmentShader: `uniform vec3 tint, rimCol; uniform float a0, a1, pw; varying vec3 vN; varying vec3 vV;
      void main() { float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), pw); gl_FragColor = vec4(mix(tint, rimCol, f), mix(a0, a1, f)); }`,
  });
}
