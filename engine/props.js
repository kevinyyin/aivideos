// Reusable props: draped blanket (deformable), plush bunny, phone, toys, moving boxes.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mk, canvasTex, rng } from '@engine/core.js';

// ---------------------------------------------------------------- blanket
function roundHang(d, r) { // distance past a mattress edge -> [outward offset, drop]
  const q = (Math.PI * r) / 2;
  if (d < q) { const a = d / r; return [r * Math.sin(a), r * (1 - Math.cos(a))]; }
  return [r, r + (d - q)];
}
/** Capsule-shaped bump under the blanket. body: {x, zA (feet), zB (shoulders), h, r} */
export function bodyBump(x, z, b) {
  const zc = Math.min(Math.max(z, Math.min(b.zA, b.zB)), Math.max(b.zA, b.zB));
  const d2 = ((x - b.x) ** 2 + (z - zc) ** 2) / (b.r * b.r);
  return b.h * Math.exp(-d2 * 1.6);
}
/**
 * A blanket that drapes over a mattress and over a body bump. Call update(p) whenever p changes:
 * p = { cx, w, top, zFoot, zHead (the folded edge near the pillow), hang, footHang, r, body|null, lift }
 */
export class Blanket {
  constructor(material, segX = 44, segZ = 64) {
    this.segX = segX; this.segZ = segZ;
    this.geo = new THREE.PlaneGeometry(1, 1, segX, segZ);
    this.mesh = new THREE.Mesh(this.geo, material);
    this.mesh.castShadow = true; this.mesh.receiveShadow = true;
    this.key = '';
  }
  heightAt(x, z, p) {
    return p.top + (p.lift ?? 0.014) + (p.body ? bodyBump(x, z, p.body) : 0);
  }
  update(p) {
    const key = JSON.stringify(p);
    if (key === this.key) return; this.key = key;
    const pos = this.geo.attributes.position, uv = this.geo.attributes.uv;
    const totalW = p.w + 2 * p.hang, totalL = p.zHead - p.zFoot + p.footHang;
    for (let j = 0; j <= this.segZ; j++) {
      const v = j / this.segZ, along = v * totalL;
      let z, dropZ = 0;
      if (along < p.footHang) { const [lat, drop] = roundHang(p.footHang - along, p.r); z = p.zFoot - lat; dropZ = drop; }
      else z = p.zFoot + (along - p.footHang);
      for (let i = 0; i <= this.segX; i++) {
        const u = i / this.segX, s = (u - 0.5) * totalW, ax = Math.abs(s) - p.w / 2;
        let x, dropX = 0;
        if (ax > 0) { const [lat, drop] = roundHang(ax, p.r); x = p.cx + Math.sign(s) * (p.w / 2 + lat); dropX = drop; }
        else x = p.cx + s;
        let y = this.heightAt(ax > 0 ? p.cx + Math.sign(s) * p.w / 2 : x, Math.max(z, p.zFoot), p) - dropX - dropZ;
        if (ax > 0 || along < p.footHang) y += 0.004 * Math.sin(u * 37 + v * 11); // tiny cloth wobble on the hanging parts
        const idx = j * (this.segX + 1) + i;
        pos.setXYZ(idx, x, y, z);
        uv.setXY(idx, u * totalW * 1.4, v * totalL * 1.4);
      }
    }
    pos.needsUpdate = true; uv.needsUpdate = true;
    this.geo.computeVertexNormals(); this.geo.computeBoundingSphere();
    const n = this.geo.attributes.normal; // degenerate triangles (coincident hang vertices) give zero normals -> NaN in shading
    for (let i = 0; i < n.count; i++) { const x = n.getX(i), y = n.getY(i), z = n.getZ(i); if (!(x * x + y * y + z * z > 1e-8)) n.setXYZ(i, 0, 1, 0); }
  }
}

// ---------------------------------------------------------------- fabric textures
export function quiltTexture(c1, c2, line = 'rgba(255,255,255,.35)') {
  return canvasTex(512, 512, (g, w, h) => {
    const n = 4, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = (x + y) % 2 ? c1 : c2; g.fillRect(x * s, y * s, s, s); }
    g.strokeStyle = line; g.lineWidth = 3; g.setLineDash([10, 8]);
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
  }, [1, 1]);
}
export function starsTexture(bg, fg) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const R = rng(11); g.fillStyle = fg;
    for (let i = 0; i < 26; i++) {
      const x = R() * w, y = R() * h, r = 10 + R() * 12;
      g.beginPath();
      for (let k = 0; k < 10; k++) { const a = (k * Math.PI) / 5 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.closePath(); g.fill();
    }
  }, [1, 1]);
}
export function dotsTexture(bg, fg) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.beginPath(); g.arc(x * 32 + (y % 2) * 16 + 8, y * 32 + 8, 4, 0, 7); g.fill(); }
  }, [1, 1]);
}

// ---------------------------------------------------------------- small props
export function makeBunny(color = 0xeee2d6) {
  const g = new THREE.Group(), m = mat(color, 0.95), pink = mat(0xe9a6b0, 0.9), dark = mat(0x1b1310, 0.4);
  const body = mk(new THREE.SphereGeometry(0.055, 18, 14), m, g, 0, 0.055, 0); body.scale.set(1, 1.1, 0.9);
  mk(new THREE.SphereGeometry(0.046, 18, 14), m, g, 0, 0.13, 0.008);
  for (const s of [-1, 1]) {
    const ear = mk(new THREE.CapsuleGeometry(0.014, 0.06, 4, 10), m, g, s * 0.02, 0.2, -0.005); ear.rotation.z = s * -0.25;
    const inner = mk(new THREE.CapsuleGeometry(0.007, 0.045, 4, 8), pink, g, s * 0.021, 0.2, 0.007); inner.rotation.z = s * -0.25;
    mk(new THREE.SphereGeometry(0.006, 8, 6), dark, g, s * 0.016, 0.138, 0.05);
    mk(new THREE.SphereGeometry(0.02, 10, 8), m, g, s * 0.045, 0.06, 0.03);
    mk(new THREE.SphereGeometry(0.022, 10, 8), m, g, s * 0.03, 0.012, 0.035);
  }
  mk(new THREE.SphereGeometry(0.007, 8, 6), pink, g, 0, 0.124, 0.054);
  return g;
}
export function makePhone() {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(0.075, 0.009, 0.15, 2, 0.004), mat(0x1c1c22, 0.35), g, 0, 0.0045, 0);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0a0d14, emissive: 0x8fb7ff, emissiveIntensity: 1.6, roughness: 0.3 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138), screenMat); screen.rotation.x = -Math.PI / 2; screen.position.y = 0.0095; g.add(screen);
  return { g, screenMat };
}
export function makeBlock(color, s = 0.075) { const g = new THREE.Group(); mk(new RoundedBoxGeometry(s, s, s, 2, s * 0.12), mat(color, 0.6), g, 0, s / 2, 0); return g; }
export function makeToyCar(color = 0xd2483f) {
  const g = new THREE.Group(), m = mat(color, 0.45), t = mat(0x222222, 0.6);
  mk(new RoundedBoxGeometry(0.2, 0.06, 0.1, 2, 0.02), m, g, 0, 0.05, 0);
  mk(new RoundedBoxGeometry(0.1, 0.05, 0.09, 2, 0.02), m, g, -0.01, 0.095, 0);
  for (const [x, z] of [[0.065, 0.05], [-0.065, 0.05], [0.065, -0.05], [-0.065, -0.05]]) { const w = mk(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 14), t, g, x, 0.025, z); w.rotation.x = Math.PI / 2; }
  return g;
}
export function makeBall(c1 = 0x3d7bd9, c2 = 0xf2c14e) {
  const tex = canvasTex(256, 128, (g, w, h) => { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? c1hex(c1) : c2hex(c2); g.fillRect((i * w) / 6, 0, w / 6 + 1, h); } });
  const g = new THREE.Group(); mk(new THREE.SphereGeometry(0.07, 24, 16), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), g, 0, 0.07, 0); return g;
}
const c1hex = (c) => '#' + c.toString(16).padStart(6, '0'), c2hex = c1hex;
export function makeMovingBox(w = 0.46, h = 0.36, d = 0.4) {
  const g = new THREE.Group();
  mk(new RoundedBoxGeometry(w, h, d, 2, 0.012), mat(0xb98b5c, 0.95), g, 0, h / 2, 0);
  mk(new THREE.BoxGeometry(w * 1.002, 0.004, 0.06), mat(0xd8c49a, 0.5), g, 0, h + 0.001, 0);
  return g;
}

// ---------------------------------------------------------------- food + baby props (video 002; reusable)
/** Swaddled newborn: blanket capsule + tiny sleeping head. Lies along local x (head at +x). */
export function makeBabyBundle(blanket = 0xf3d9e2, skin = 0xebb996) {
  const g = new THREE.Group(), m = mat(blanket, 0.95);
  const body = mk(new THREE.CapsuleGeometry(0.075, 0.16, 6, 14), m, g, -0.03, 0, 0); body.rotation.z = Math.PI / 2;
  const hood = mk(new THREE.SphereGeometry(0.085, 16, 12), m, g, 0.11, 0.01, -0.01); hood.scale.set(1, 1, 0.9);
  const face = mk(new THREE.SphereGeometry(0.058, 16, 12), mat(skin, 0.6), g, 0.12, 0.02, 0.04); face.scale.set(1, 1, 0.75);
  const dark = mat(0x1b1310, 0.4);
  for (const s of [-1, 1]) { const e = mk(new THREE.TorusGeometry(0.011, 0.003, 4, 10, Math.PI), dark, g, 0.12 + s * 0.02, 0.03, 0.083); e.rotation.z = Math.PI; }
  return g;
}
export function makePickleJar() {
  const g = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({ color: 0xcfe8b8, roughness: 0.08, transparent: true, opacity: 0.38, depthWrite: false });
  const jar = mk(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 24), glass, g, 0, 0.17, 0); jar.castShadow = false;
  const brine = mk(new THREE.CylinderGeometry(0.122, 0.122, 0.28, 20), new THREE.MeshStandardMaterial({ color: 0xb9c95a, roughness: 0.3, transparent: true, opacity: 0.5, depthWrite: false }), g, 0, 0.15, 0); brine.castShadow = false;
  const pk = mat(0x5f8a2e, 0.55), R = rng(17);
  for (let i = 0; i < 9; i++) { const a = i * 2.4, rr = 0.06 * (i % 3) / 2 + 0.02, p = mk(new THREE.CapsuleGeometry(0.025, 0.14, 4, 8), pk, g, Math.cos(a) * rr, 0.15 + (R() - 0.5) * 0.06, Math.sin(a) * rr); p.rotation.set((R() - 0.5) * 0.5, 0, (R() - 0.5) * 0.5); }
  mk(new THREE.CylinderGeometry(0.135, 0.135, 0.05, 24), mat(0xd9b23a, 0.35, { metalness: 0.5 }), g, 0, 0.36, 0);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.1315, 0.1315, 0.12, 24, 1, true), new THREE.MeshStandardMaterial({ map: canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#fff4d6'; c.fillRect(0, 0, w, h); c.fillStyle = '#2f7d4f'; c.font = 'bold 54px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('PICKLES', w / 4, 66); c.fillText('PICKLES', (3 * w) / 4, 66); }), roughness: 0.7 }));
  label.position.y = 0.17; g.add(label);
  return g;
}
export function makeIceCreamTub() {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.11, 0.09, 0.15, 24), mat(0xf2a7bb, 0.6), g, 0, 0.075, 0);
  mk(new THREE.CylinderGeometry(0.115, 0.115, 0.025, 24), mat(0xfaf6ee, 0.5), g, 0, 0.16, 0);
  return g;
}
export function makeHotDog() {
  const g = new THREE.Group();
  const bun = mk(new THREE.CapsuleGeometry(0.035, 0.13, 4, 10), mat(0xd9a05b, 0.8), g); bun.rotation.z = Math.PI / 2; bun.scale.set(1, 1, 0.8);
  const dog = mk(new THREE.CapsuleGeometry(0.02, 0.17, 4, 8), mat(0xb5462e, 0.5), g, 0, 0.03, 0); dog.rotation.z = Math.PI / 2;
  const mus = mk(new THREE.CapsuleGeometry(0.006, 0.14, 3, 6), mat(0xf1c24a, 0.5), g, 0, 0.052, 0); mus.rotation.z = Math.PI / 2;
  return g;
}

// ---------------------------------------------------------------- flashlight (handheld; beam along local +z)
/** Returns {g, setOn(v), aim(pos, target)}: a toy flashlight with a soft additive beam cone + a spot light. */
export function makeFlashlight({ length = 34, radius = 2.4, color = 0xfff0d2 } = {}) {
  const g = new THREE.Group();
  const body = mk(new THREE.CylinderGeometry(0.022, 0.026, 0.19, 14), mat(0x2b2f36, 0.45), g, 0, 0, -0.02); body.rotation.x = Math.PI / 2;
  const headM = mat(0x3a3f47, 0.4);
  const head = mk(new THREE.CylinderGeometry(0.038, 0.028, 0.06, 16), headM, g, 0, 0, 0.1); head.rotation.x = Math.PI / 2;
  const lensM = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.5), toneMapped: false });
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.034, 18), lensM); lens.position.z = 0.131; g.add(lens);
  // soft volumetric cone: alpha fades along the length and toward the silhouette edges (no texture → no hard end cap)
  const geo = new THREE.CylinderGeometry(0.035, radius, length, 40, 1, true); geo.translate(0, -length / 2, 0); geo.rotateX(-Math.PI / 2);
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0.3 }, uLen: { value: length } },
    vertexShader: 'varying float vD; varying vec3 vN; varying vec3 vV; void main(){ vD = position.z; vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = mv.xyz; vN = normalMatrix * normal; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity, uLen; varying float vD; varying vec3 vN; varying vec3 vV; void main(){ float d = clamp(vD / uLen, 0.0, 1.0); float a = pow(1.0 - d, 1.7) * uOpacity; float edge = abs(dot(normalize(vN), normalize(-vV))); a *= mix(0.45, 1.0, smoothstep(0.0, 0.7, edge)); gl_FragColor = vec4(uColor * a, a); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(geo, beamMat);
  beam.position.z = 0.13; beam.castShadow = false; g.add(beam);
  const spot = new THREE.SpotLight(color, 0, 60, 0.12, 0.6, 1.2); spot.position.z = 0.13; spot.target.position.set(0, 0, 10); g.add(spot, spot.target);
  const setOn = (v, beamOpacity = 0.3) => { lensM.color.setHex(color).multiplyScalar(0.1 + 2.4 * v); beamMat.uniforms.uOpacity.value = beamOpacity * v; beam.visible = v > 0.001; spot.intensity = 60 * v; };
  const aim = (pos, target) => { g.position.copy(pos); g.lookAt(target); };
  setOn(0);
  return { g, beam, spot, setOn, aim };
}

// ---------------------------------------------------------------- search bubble (008): a floating search bar above a head
/**
 * makeSearchBubble({ query, history: [..], width (m), maxChars, offX })
 *   A camera-facing card: magnifier + query on top, optional history rows (clock icon) below, a small tail pointing down.
 *   Bottom-anchored (sprite.center.y = 0): put `sprite.position` at the top of the head. offX shifts the card sideways
 *   (-0.5…0.5 of its width) so two neighbours' cards don't overlap. setRows(n) reveals history rows one by one (textures are
 *   prebuilt per row count — no per-frame canvas work). setPop(k) scales it (0 = hidden; use a boing for the pop).
 *   Unlit SpriteMaterial (house rule for screens), slightly off-white so it never trips the bloom threshold.
 */
export function makeSearchBubble(o = {}) {
  const W = 1024, PAD = 26, TAIL = 34, R = 44;
  const width = o.width ?? 0.9, history = o.history || [], maxChars = o.maxChars ?? 24;
  const wrap = (s) => { const out = []; let line = ''; for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > maxChars && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; };
  const qLines = wrap(o.query || ''), rows = history.map((h) => wrap(h));
  const QH = 70, RH = 60, TOPH = 46 + qLines.length * QH;
  const texFor = (n) => {
    const rowLines = rows.slice(0, n).reduce((a, r) => a + r.length, 0);
    const cardH = TOPH + (n ? 22 + rowLines * RH + n * 18 + 14 : 0);
    const H = cardH + PAD * 2 + TAIL;
    const tex = canvasTex(W, H, (g) => {
      const x0 = PAD, y0 = PAD, w = W - PAD * 2;
      g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
      g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(x0, y0, w, cardH, R); g.fill();
      const tx = Math.min(W - PAD - 90, Math.max(PAD + 90, (0.5 + (o.offX ?? 0)) * W)); // tail points at the anchor (the head)
      g.beginPath(); g.moveTo(tx - 30, y0 + cardH - 2); g.lineTo(tx, y0 + cardH + TAIL - 4); g.lineTo(tx + 30, y0 + cardH - 2); g.fill();
      g.restore();
      // magnifier
      const my = y0 + 23 + QH / 2 + 4;
      g.strokeStyle = '#6b7078'; g.lineWidth = 9; g.beginPath(); g.arc(x0 + 62, my - 6, 20, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 + 77, my + 9); g.lineTo(x0 + 92, my + 24); g.stroke();
      g.fillStyle = '#202124'; g.font = '600 56px Helvetica, Arial, sans-serif'; g.textBaseline = 'middle';
      qLines.forEach((l, i) => g.fillText(l, x0 + 122, y0 + 23 + QH / 2 + 2 + i * QH));
      if (!n) return;
      let y = y0 + TOPH + 4;
      g.fillStyle = '#e3e5e8'; g.fillRect(x0 + 30, y, w - 60, 4); y += 22;
      rows.slice(0, n).forEach((r) => {
        const cy = y + RH / 2;
        g.strokeStyle = '#9aa0a6'; g.lineWidth = 6; g.beginPath(); g.arc(x0 + 62, cy, 19, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 6; g.beginPath(); g.moveTo(x0 + 62, cy - 11); g.lineTo(x0 + 62, cy); g.lineTo(x0 + 71, cy + 6); g.stroke();
        g.fillStyle = '#5b2a9a'; g.font = '500 46px Helvetica, Arial, sans-serif';
        r.forEach((l, i) => g.fillText(l, x0 + 122, cy + i * RH));
        y += r.length * RH + 18;
      });
    });
    return { tex, aspect: H / W };
  };
  const texs = Array.from({ length: history.length + 1 }, (_, n) => texFor(n));
  const material = new THREE.SpriteMaterial({ map: texs[0].tex, color: o.color ?? 0xf2f2f2, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const sprite = new THREE.Sprite(material); sprite.center.set(0.5 + (o.offX ?? 0), 0); sprite.renderOrder = 5;
  let rowsShown = 0, pop = 1;
  const resize = () => { const a = texs[rowsShown].aspect; sprite.scale.set(width * pop, width * a * pop, 1); sprite.visible = pop > 0.001; };
  const setRows = (n) => { n = Math.max(0, Math.min(history.length, Math.floor(n))); if (n !== rowsShown) { rowsShown = n; material.map = texs[n].tex; } resize(); };
  const setPop = (k) => { pop = Math.max(0, k); resize(); };
  resize();
  return { sprite, material, setRows, setPop, width };
}

// ---------------------------------------------------------------- city bus + basketball hoop (010; reusable)
/**
 * City bus (12 m, faces +z, front at z=+L/2). Returns {g, body, wheels, setSag(k), setSign(text)}.
 * setSag(k 0..1): the body sinks onto its axles and rolls toward the curb (−x side) — "too heavy".
 */
export function makeBus({ color = 0x2f7d6a, stripe = 0xf2c14e, L = 12, sign = '42 DOWNTOWN' } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const W = 2.55, H = 3.0, paint = mat(color, 0.4), glass = new THREE.MeshStandardMaterial({ color: 0x1d2a38, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.55 });
  mk(new RoundedBoxGeometry(W, 0.9, L, 3, 0.12), paint, body, 0, 0.75, 0);                       // lower body
  mk(new RoundedBoxGeometry(W, 0.35, L, 3, 0.12), paint, body, 0, H - 0.18, 0);                  // roof
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) mk(new THREE.BoxGeometry(0.08, 1.55, 0.12), paint, body, s * (W / 2 - 0.04), 2.0, -L / 2 + 0.6 + k * (L - 1.2) / 5); // window pillars
  const win = mk(new THREE.BoxGeometry(W - 0.06, 1.55, L - 0.3), glass, body, 0, 2.0, 0); win.castShadow = false;            // glass box (people inside show through)
  mk(new THREE.BoxGeometry(W + 0.01, 0.16, L + 0.01), mat(stripe, 0.5), body, 0, 1.12, 0);
  const signTex = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffb21c'; c.font = 'bold 64px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sign, w / 2, h / 2 + 3); });
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false });
  const signM = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.34), signMat); signM.position.set(0, H - 0.5, L / 2 + 0.07); body.add(signM);
  const door = mk(new THREE.BoxGeometry(0.06, 2.1, 1.1), glass, body, -W / 2 - 0.01, 1.25, L / 2 - 1.6); door.castShadow = false;
  const wheels = [];
  for (const z of [L / 2 - 2.2, -L / 2 + 2.4]) for (const s of [-1, 1]) {
    const w = mk(new THREE.CylinderGeometry(0.5, 0.5, 0.32, 18), mat(0x1c1c1e, 0.8), g, s * (W / 2 - 0.15), 0.5, z); w.rotation.z = Math.PI / 2; wheels.push(w);
    mk(new THREE.CylinderGeometry(0.22, 0.22, 0.34, 14), mat(0xbfc4ca, 0.3), w, 0, 0, 0);
  }
  const setSag = (k) => { body.position.y = -0.42 * k; body.rotation.z = 0.06 * k; wheels.forEach((w) => w.scale.set(1, 1, 1 - 0.18 * k)); };
  const setSign = (text) => { const c = signTex.image.getContext('2d'); c.fillStyle = '#111'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#ffb21c'; c.font = 'bold 64px Helvetica, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 51); signTex.needsUpdate = true; };
  return { g, body, wheels, door, setSag, setSign, W, H, L };
}
/** Driveway basketball hoop: pole + backboard + orange rim at y=3.05 (regulation). Rim center at (0, 3.05, 0.55) local. */
export function makeHoop() {
  const g = new THREE.Group(), metal = mat(0x3d4a45, 0.5);
  mk(new THREE.CylinderGeometry(0.07, 0.09, 3.6, 12), metal, g, 0, 1.8, -0.35);
  mk(new THREE.BoxGeometry(0.06, 0.06, 0.5), metal, g, 0, 3.35, -0.12);
  const board = mk(new THREE.BoxGeometry(1.8, 1.05, 0.05), new THREE.MeshStandardMaterial({ color: 0xf6f6f4, roughness: 0.3 }), g, 0, 3.4, 0.12);
  mk(new THREE.BoxGeometry(0.6, 0.45, 0.01), mat(0xd2483f, 0.5), g, 0, 3.27, 0.15).scale.set(1, 1, 1);
  mk(new THREE.BoxGeometry(0.52, 0.37, 0.012), new THREE.MeshStandardMaterial({ color: 0xf6f6f4, roughness: 0.3 }), g, 0, 3.27, 0.152);
  const rim = mk(new THREE.TorusGeometry(0.23, 0.018, 8, 28), mat(0xe2572b, 0.4), g, 0, 3.05, 0.4); rim.rotation.x = Math.PI / 2;
  const net = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.15, 0.4, 14, 3, true), new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 }));
  net.position.set(0, 2.84, 0.4); g.add(net);
  return { g, rim: new THREE.Vector3(0, 3.05, 0.4), board };
}
export function makeBasketball(r = 0.12) {
  const tex = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#e0722f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a1a10'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.moveTo(w / 4, 0); c.lineTo(w / 4, h); c.moveTo((3 * w) / 4, 0); c.lineTo((3 * w) / 4, h); c.stroke(); });
  const g = new THREE.Group(); mk(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }), g); return g;
}

// ---------------------------------------------------------------- dog, ceiling fan, mug (010 v2; reusable)
/** Toy dog (faces +z, ~0.45 m tall at the head). update(t, speed) trots the legs + wags the tail; bark(k) opens the mouth. */
export function makeDog({ color = 0xc98e4a, patch = 0xf2e6cf } = {}) {
  const g = new THREE.Group(), m = mat(color, 0.85), p = mat(patch, 0.85), dark = mat(0x1b1310, 0.4);
  const body = mk(new THREE.CapsuleGeometry(0.11, 0.26, 6, 12), m, g, 0, 0.27, 0); body.rotation.x = Math.PI / 2;
  mk(new THREE.SphereGeometry(0.09, 12, 10), p, g, 0, 0.24, 0.12).scale.set(1, 0.9, 1.2);
  const head = new THREE.Group(); head.position.set(0, 0.4, 0.2); g.add(head);
  mk(new THREE.SphereGeometry(0.1, 14, 12), m, head);
  const snout = mk(new THREE.SphereGeometry(0.06, 12, 10), p, head, 0, -0.03, 0.08); snout.scale.set(1, 0.8, 1.2);
  mk(new THREE.SphereGeometry(0.02, 8, 6), dark, head, 0, 0.0, 0.15);
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.018, 8, 6), dark, head, s * 0.045, 0.035, 0.08); const ear = mk(new THREE.CapsuleGeometry(0.03, 0.08, 4, 8), mat(0x7a4f28, 0.85), head, s * 0.085, 0.03, -0.01); ear.rotation.z = s * 0.4; }
  const jaw = mk(new THREE.BoxGeometry(0.06, 0.015, 0.06), mat(0x8a2f2b, 0.6), head, 0, -0.07, 0.09);
  const legs = [];
  for (const [x, z] of [[-0.06, 0.14], [0.06, 0.14], [-0.06, -0.14], [0.06, -0.14]]) { const L = new THREE.Group(); L.position.set(x, 0.22, z); g.add(L); mk(new THREE.CapsuleGeometry(0.028, 0.14, 4, 8), m, L, 0, -0.1, 0); legs.push(L); }
  const tail = new THREE.Group(); tail.position.set(0, 0.33, -0.24); g.add(tail); const tm = mk(new THREE.CapsuleGeometry(0.02, 0.12, 4, 8), m, tail, 0, 0.07, -0.02); tm.rotation.x = -0.5;
  // 016: lying down (setLie 0..1 — body + head sink, front legs forward, back legs back) and a wag speed (setWag)
  const chest = g.children[1], base = [body, chest, head, tail].map((o) => o.position.y);
  let lie = 0, wag = 14;
  const update = (t, speed = 0) => {
    const ph = t * (8 + speed * 6);
    legs.forEach((L, i) => (L.rotation.x = Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.7 * Math.min(1, speed) * (1 - lie) + (i < 2 ? -1.45 : 1.45) * lie));
    g.children[0].position.y = 0.27 + Math.abs(Math.sin(ph)) * 0.02 * Math.min(1, speed) - 0.17 * lie;
    tail.rotation.z = Math.sin(t * wag) * 0.6;
  };
  const setLie = (k) => { lie = k; [body, chest, head, tail].forEach((o, i) => (o.position.y = base[i] - 0.17 * k)); legs.forEach((L) => (L.position.y = 0.22 - 0.15 * k)); };
  const setWag = (w) => { wag = w; };
  const bark = (k) => { jaw.position.y = -0.07 - 0.03 * k; head.rotation.x = -0.3 * k; };
  return { g, head, jaw, update, bark, setLie, setWag };
}
/** Ceiling fan (mount at the ceiling, hangs down 0.35 m). update(t, wobble) spins the blades; wobble 0..1 shakes it (after a bonk). */
export function makeCeilingFan() {
  const g = new THREE.Group(), wood = mat(0x7d5233, 0.6), metal = mat(0xc9c2b6, 0.3, { metalness: 0.5 });
  mk(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), metal, g, 0, -0.15, 0);
  const hub = new THREE.Group(); hub.position.y = -0.32; g.add(hub);
  mk(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 16), metal, hub);
  for (let i = 0; i < 4; i++) { const a = new THREE.Group(); a.rotation.y = (i * Math.PI) / 2; hub.add(a); mk(new THREE.BoxGeometry(0.62, 0.015, 0.14), wood, a, 0.4, 0, 0); }
  mk(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshStandardMaterial({ color: 0xfff3d6, emissive: 0xffd9a0, emissiveIntensity: 0.6 }), hub, 0, -0.09, 0);
  const update = (t, wobble = 0) => { hub.rotation.y = t * 7; g.rotation.z = wobble * 0.25 * Math.sin(t * 19); g.rotation.x = wobble * 0.18 * Math.sin(t * 15 + 1); };
  return { g, update };
}
export function makeMug(color = 0xd2483f) {
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(0.04, 0.036, 0.09, 16, 1, true), mat(color, 0.4, { side: THREE.DoubleSide }), g, 0, 0.045, 0);
  mk(new THREE.CircleGeometry(0.036, 16), mat(0x3a2414, 0.2), g, 0, 0.075, 0).rotation.x = -Math.PI / 2;
  mk(new THREE.TorusGeometry(0.022, 0.007, 6, 12, Math.PI), mat(color, 0.4), g, 0.045, 0.045, 0).rotation.z = -Math.PI / 2;
  return g;
}

// ---------------------------------------------------------------- talking pets (016; reusable)
/**
 * makeSpeechBubble({ lines, name, accent, width, maxChars, offX, soft })
 *   A camera-facing speech bubble: rounded white card, a thin accent outline, an optional small name tag, bold lines below,
 *   and a tail pointing down at the speaker. Bottom-anchored like makeSearchBubble: put `sprite.position` just above the mouth.
 *   setRows(n) reveals lines 1..n (one prebuilt texture per count — the card grows upward, chat-style), setPop(k) scales it
 *   (0 = hidden; drive it with a boing). `soft: true` = a warm, quiet line (no shouting) for tender beats. `tail` (px, default 42)
 *   lengthens the tail so the card can float above a crowd and still point down at a small speaker (a goldfish).
 *   Unlit, slightly off-white so it never trips the bloom threshold (house rule for screens/cards).
 */
export function makeSpeechBubble(o = {}) {
  const W = 1024, PAD = 26, TAIL = o.tail ?? 42, R = 52;
  const lines = o.lines || [o.text || ''], width = o.width ?? 0.9, maxChars = o.maxChars ?? 20, accent = o.accent || '#e8553f';
  const soft = !!o.soft, FS = soft ? 74 : 72, LH = Math.round(FS * 1.16), GAP = 16, NAMEH = o.name ? 62 : 0;
  const font = `${soft ? '600' : '800'} ${FS}px Helvetica, Arial, sans-serif`;
  const wrap = (s) => { const out = []; let line = ''; for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > maxChars && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; };
  const rows = lines.map(wrap);
  const texFor = (n) => {
    const nl = rows.slice(0, n).reduce((a, r) => a + r.length, 0);
    const cardH = 40 + NAMEH + nl * LH + Math.max(0, n - 1) * GAP + 30, H = cardH + PAD * 2 + TAIL;
    const tex = canvasTex(W, H, (g) => {
      const x0 = PAD, y0 = PAD, w = W - PAD * 2, tx = Math.min(W - PAD - 110, Math.max(PAD + 110, (0.5 + (o.offX ?? 0)) * W));
      const shape = () => { g.beginPath(); g.roundRect(x0, y0, w, cardH, R); g.moveTo(tx - 34, y0 + cardH - 2); g.lineTo(tx - 6, y0 + cardH + TAIL - 4); g.lineTo(tx + 30, y0 + cardH - 2); };
      g.save(); g.shadowColor = 'rgba(0,0,0,.38)'; g.shadowBlur = 20; g.shadowOffsetY = 7;
      g.fillStyle = soft ? '#fffaf0' : '#ffffff'; shape(); g.fill(); g.restore();
      g.lineWidth = 9; g.strokeStyle = accent; g.beginPath(); g.roundRect(x0 + 5, y0 + 5, w - 10, cardH - 10, R - 5); g.stroke();
      g.fillStyle = soft ? '#fffaf0' : '#ffffff'; g.beginPath(); g.moveTo(tx - 28, y0 + cardH - 14); g.lineTo(tx - 6, y0 + cardH + TAIL - 12); g.lineTo(tx + 24, y0 + cardH - 14); g.fill();
      let y = y0 + 34;
      if (o.name) { g.font = '800 36px Helvetica, Arial, sans-serif'; const nw = g.measureText(o.name).width + 44; g.fillStyle = accent; g.beginPath(); g.roundRect(x0 + 40, y - 6, nw, 48, 24); g.fill(); g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.fillText(o.name, x0 + 62, y + 19); y += NAMEH; }
      g.font = font; g.fillStyle = soft ? '#3a2a1e' : '#1d1e22'; g.textBaseline = 'middle'; g.textAlign = 'center';
      rows.slice(0, n).forEach((r, k) => { r.forEach((l, i) => g.fillText(l, W / 2, y + LH / 2 + i * LH)); y += r.length * LH + GAP; });
    });
    return { tex, aspect: H / W };
  };
  const texs = [null, ...rows.map((_, i) => texFor(i + 1))];
  const material = new THREE.SpriteMaterial({ map: texs[1].tex, color: 0xf0f0f0, transparent: true, depthWrite: false, depthTest: false, toneMapped: false, fog: false });
  const sprite = new THREE.Sprite(material); sprite.center.set(0.5 + (o.offX ?? 0), 0); sprite.renderOrder = 10;
  let shown = 1, pop = 1;
  const resize = () => { const a = texs[shown].aspect; sprite.scale.set(width * pop, width * a * pop, 1); sprite.visible = pop > 0.001; };
  const setRows = (n) => { n = Math.max(1, Math.min(rows.length, Math.floor(n))); if (n !== shown) { shown = n; material.map = texs[n].tex; } resize(); };
  const setPop = (k) => { pop = Math.max(0, k); resize(); };
  resize();
  return { sprite, material, setRows, setPop, width, rows: rows.length };
}

/** Sitting toy cat (faces +z, head top ~0.42 m). update(t) sways the tail; talk(k) opens the mouth; paw(k) raises the right
 *  front paw forward (0 → 1 = reaching out at chest height, for pushing a mug off a counter); squint(k) = the unimpressed look. */
export function makeCat({ color = 0xe08a3a, belly = 0xf6e7d2, stripe = 0xb4602a, nose = 0xe88a9a } = {}) {
  const g = new THREE.Group(), m = mat(color, 0.85), b = mat(belly, 0.85), dark = mat(0x1b1310, 0.35), st = mat(stripe, 0.85), pink = mat(nose, 0.6);
  mk(new THREE.SphereGeometry(0.1, 16, 12), m, g, 0, 0.1, -0.02).scale.set(0.95, 1.0, 1.1);              // seat / lower body
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.07, 12, 10), m, g, s * 0.07, 0.065, -0.03).scale.set(0.8, 0.9, 1.25);   // haunches
  const chest = mk(new THREE.CapsuleGeometry(0.07, 0.1, 6, 12), m, g, 0, 0.21, 0.025); chest.rotation.x = 0.3;
  mk(new THREE.SphereGeometry(0.055, 12, 10), b, g, 0, 0.19, 0.075).scale.set(1, 1.3, 0.7);             // white bib
  for (let k = 0; k < 3; k++) mk(new THREE.BoxGeometry(0.15, 0.02, 0.05), st, g, 0, 0.12 + k * 0.055, -0.1 + k * 0.025).rotation.x = 0.3;
  const legs = [];
  for (const s of [-1, 1]) {
    const L = new THREE.Group(); L.position.set(s * 0.04, 0.21, 0.07); g.add(L);
    mk(new THREE.CapsuleGeometry(0.022, 0.15, 4, 8), m, L, 0, -0.1, 0.0);
    mk(new THREE.SphereGeometry(0.027, 10, 8), b, L, 0, -0.195, 0.012).scale.set(1, 0.7, 1.2);
    legs.push(L);
  }
  const head = new THREE.Group(); head.position.set(0, 0.34, 0.05); g.add(head);
  mk(new THREE.SphereGeometry(0.085, 18, 14), m, head).scale.set(1.12, 0.95, 1.0);
  mk(new THREE.SphereGeometry(0.036, 12, 10), b, head, 0, -0.03, 0.068).scale.set(1.35, 0.8, 0.8);
  mk(new THREE.SphereGeometry(0.012, 8, 6), pink, head, 0, -0.008, 0.09);
  const eyes = [];
  for (const s of [-1, 1]) {
    eyes.push(mk(new THREE.SphereGeometry(0.016, 10, 8), dark, head, s * 0.036, 0.015, 0.074));
    const ear = mk(new THREE.ConeGeometry(0.034, 0.075, 4), m, head, s * 0.056, 0.08, 0.0); ear.rotation.z = -s * 0.35; ear.rotation.y = Math.PI / 4;
    const inner = mk(new THREE.ConeGeometry(0.02, 0.05, 4), pink, head, s * 0.054, 0.074, 0.012); inner.rotation.z = -s * 0.35; inner.rotation.y = Math.PI / 4;
    for (let k = -1; k <= 1; k++) { const w = mk(new THREE.CylinderGeometry(0.0016, 0.0016, 0.09, 4), mat(0xffffff, 0.5), head, s * 0.07, -0.028 + k * 0.009, 0.07); w.rotation.z = Math.PI / 2 + k * 0.15 * s; w.castShadow = false; }
    mk(new THREE.BoxGeometry(0.035, 0.008, 0.01), st, head, s * 0.03, 0.065, 0.06).rotation.z = s * 0.3;   // brow stripes
  }
  const jaw = mk(new THREE.BoxGeometry(0.03, 0.008, 0.02), mat(0x8a2f3b, 0.6), head, 0, -0.05, 0.074);
  const tail = []; let prev = g;
  for (let k = 0; k < 5; k++) { const s = new THREE.Group(); s.position.set(0, k ? 0.07 : 0.03, k ? 0 : -0.12); prev.add(s); mk(new THREE.CapsuleGeometry(0.018, 0.06, 4, 8), k === 4 ? st : m, s, 0, 0.035, 0); tail.push(s); prev = s; }
  const update = (t, swish = 1) => tail.forEach((s, k) => { s.rotation.x = k === 0 ? -1.2 : 0.32; s.rotation.z = Math.sin(t * 2.2 - k * 0.6) * 0.22 * swish; });
  const talk = (k) => { jaw.position.y = -0.05 - 0.016 * k; jaw.scale.set(1, 1 + 2.5 * k, 1); };
  const paw = (k) => { legs[1].rotation.x = -1.35 * k; };
  const squint = (k) => eyes.forEach((e) => e.scale.set(1.15, 1 - 0.65 * k, 1));
  update(0);
  return { g, head, legs, update, talk, paw, squint };
}

/** Toy macaw on a perch (faces +z; feet at y=0, head top ~0.31 m, tail hangs ~0.2 m below the feet).
 *  talk(k) opens the beak; update(t, flap) bobs the head and flaps the wings (flap 0..1). */
export function makeParrot({ body = 0xd8352a, wingA = 0xf2c230, wingB = 0x2f6fd0, face = 0xfaf6ee } = {}) {
  const g = new THREE.Group(), m = mat(body, 0.7), dark = mat(0x161616, 0.3);
  const torso = mk(new THREE.CapsuleGeometry(0.06, 0.12, 6, 12), m, g, 0, 0.12, 0); torso.rotation.x = 0.22;
  const head = new THREE.Group(); head.position.set(0, 0.25, 0.035); g.add(head);
  mk(new THREE.SphereGeometry(0.058, 16, 12), m, head);
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.03, 10, 8), mat(face, 0.7), head, s * 0.032, -0.005, 0.035).scale.set(0.6, 1.1, 0.8); mk(new THREE.SphereGeometry(0.0105, 8, 6), dark, head, s * 0.036, 0.012, 0.052); }
  const beak = mk(new THREE.ConeGeometry(0.026, 0.065, 12), mat(0xefe6d2, 0.4), head, 0, -0.012, 0.064); beak.rotation.x = Math.PI * 0.62;
  const jaw = mk(new THREE.ConeGeometry(0.016, 0.03, 10), mat(0x2a2a2a, 0.5), head, 0, -0.042, 0.05); jaw.rotation.x = Math.PI * 0.42;
  const wings = [-1, 1].map((s) => { const w = new THREE.Group(); w.position.set(s * 0.055, 0.17, 0.0); g.add(w); mk(new THREE.SphereGeometry(0.055, 12, 10), mat(wingA, 0.7), w, s * 0.012, -0.02, 0).scale.set(0.35, 1.0, 0.95); mk(new THREE.SphereGeometry(0.05, 12, 10), mat(wingB, 0.7), w, s * 0.014, -0.085, -0.012).scale.set(0.33, 1.25, 0.85); return w; });
  const tail = mk(new THREE.CapsuleGeometry(0.018, 0.2, 4, 8), m, g, 0, -0.05, -0.07); tail.rotation.x = -0.35;
  mk(new THREE.CapsuleGeometry(0.014, 0.08, 4, 8), mat(wingB, 0.7), g, 0, -0.16, -0.11).rotation.x = -0.35;
  for (const s of [-1, 1]) mk(new THREE.CapsuleGeometry(0.012, 0.03, 4, 6), mat(0x5a5a5a, 0.6), g, s * 0.025, 0.012, 0.012).rotation.x = Math.PI / 2;
  const talk = (k) => { jaw.rotation.x = Math.PI * 0.42 + 0.6 * k; jaw.position.y = -0.042 - 0.012 * k; };
  const update = (t, flap = 0) => {
    head.rotation.z = 0.12 * Math.sin(t * 1.7); head.rotation.x = 0.05 * Math.sin(t * 2.3);
    wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.05 + flap * (0.5 + 0.7 * Math.sin(t * 22)))));
  };
  return { g, head, wings, talk, update };
}
/** A T-perch stand (base disc + pole + crossbar). The bird's feet go at y = h. */
export function makePerch(h = 1.2) {
  const g = new THREE.Group(), wood = mat(0x8a5a36, 0.7);
  mk(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 20), mat(0x5a4a3e, 0.7), g, 0, 0.02, 0);
  mk(new THREE.CylinderGeometry(0.018, 0.022, h, 10), wood, g, 0, h / 2, 0);
  mk(new THREE.CylinderGeometry(0.016, 0.016, 0.42, 10), wood, g, 0, h - 0.015, 0).rotation.z = Math.PI / 2;
  mk(new THREE.CylinderGeometry(0.035, 0.03, 0.04, 12), mat(0xd9d4c8, 0.4), g, 0.17, h + 0.005, 0);   // a little food cup
  return { g, h };
}

/** Goldfish bowl (bottom at y=0, radius r) with gravel, a plant and one goldfish. update(t, face) swims the fish in a circle;
 *  face 0..1 brings it to the front glass looking at +z (to "talk"); talk(k) opens its mouth. Glass + water are see-through. */
export function makeFishBowl({ r = 0.16, fishColor = 0xf28a2a } = {}) {
  const g = new THREE.Group(), cy = r * 0.92;
  const glass = mk(new THREE.SphereGeometry(r, 32, 22, 0, Math.PI * 2, Math.PI * 0.2, Math.PI * 0.72), new THREE.MeshStandardMaterial({ color: 0xe6f6ff, roughness: 0.05, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }), g, 0, cy, 0);
  glass.renderOrder = 3; glass.castShadow = false;
  const water = mk(new THREE.SphereGeometry(r * 0.97, 28, 18, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.62), new THREE.MeshStandardMaterial({ color: 0x6fc0ea, roughness: 0.1, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }), g, 0, cy, 0);
  water.renderOrder = 2; water.castShadow = false;
  const wy = cy + r * 0.97 * Math.cos(Math.PI * 0.3), wr = r * 0.97 * Math.sin(Math.PI * 0.3);
  const surf = mk(new THREE.CircleGeometry(wr, 28), new THREE.MeshStandardMaterial({ color: 0x9fd8f2, roughness: 0.05, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), g, 0, wy, 0); surf.rotation.x = -Math.PI / 2; surf.renderOrder = 2; surf.castShadow = false;
  const rimY = cy + r * Math.cos(Math.PI * 0.2), rimR = r * Math.sin(Math.PI * 0.2);
  mk(new THREE.TorusGeometry(rimR, 0.006, 6, 28), new THREE.MeshStandardMaterial({ color: 0xe6f6ff, roughness: 0.1, transparent: true, opacity: 0.5 }), g, 0, rimY, 0).rotation.x = Math.PI / 2;
  const R2 = rng(7);
  for (let k = 0; k < 26; k++) { const a = R2() * Math.PI * 2, d = Math.sqrt(R2()) * r * 0.62; mk(new THREE.SphereGeometry(0.014, 6, 5), mat([0xe2574c, 0x4f9bd9, 0xf2c14e, 0xf2efe8, 0x6fa84f][k % 5], 0.6), g, Math.cos(a) * d, 0.035 + R2() * 0.012, Math.sin(a) * d); }
  for (let k = 0; k < 3; k++) { const p = mk(new THREE.CapsuleGeometry(0.008, 0.09 + k * 0.03, 4, 6), mat(0x3f9a4a, 0.7), g, -r * 0.35 + k * 0.025, 0.1 + k * 0.015, -r * 0.3); p.rotation.z = (k - 1) * 0.25; }
  const fish = new THREE.Group(); g.add(fish);
  const fm = mat(fishColor, 0.5);
  mk(new THREE.SphereGeometry(0.034, 14, 10), fm, fish).scale.set(0.72, 0.85, 1.25);
  const tail = new THREE.Group(); tail.position.set(0, 0, -0.04); fish.add(tail);
  const tf = mk(new THREE.ConeGeometry(0.03, 0.05, 3), fm, tail, 0, 0, -0.02); tf.rotation.x = -Math.PI / 2; tf.scale.set(0.25, 1, 1.3);
  mk(new THREE.ConeGeometry(0.014, 0.03, 3), fm, fish, 0, 0.032, -0.005).scale.set(0.25, 1, 1.4);
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.011, 8, 6), mat(0xffffff, 0.3), fish, s * 0.018, 0.012, 0.028); mk(new THREE.SphereGeometry(0.0065, 8, 6), mat(0x111111, 0.3), fish, s * 0.022, 0.013, 0.034); }
  const mouth = mk(new THREE.TorusGeometry(0.006, 0.0025, 6, 12), mat(0xb8452a, 0.5), fish, 0, -0.004, 0.042);
  const swimY = cy - r * 0.05;
  const update = (t, face = 0) => {
    const a = t * 1.1, rr = r * 0.42, x = Math.cos(a) * rr, z = Math.sin(a) * rr, head = Math.atan2(-Math.sin(a), Math.cos(a));
    fish.position.set(x * (1 - face), swimY + 0.012 * Math.sin(t * 2.3), z * (1 - face) + face * r * 0.45);
    fish.rotation.y = head + (0 - head) * face;
    tail.rotation.y = Math.sin(t * (10 - 6 * face)) * 0.45;
  };
  const talk = (k) => mouth.scale.setScalar(1 + 1.4 * k);
  update(0);
  return { g, fish, update, talk, top: rimY };
}

/** Toy hamster (faces +z, ~0.11 m long). update(t, run) bobs it (run 0..1 = scurrying); stand(k) rears up on its hind legs with
 *  its front paws raised (for holding a tiny sign; `paws` are attach points); talk(k) opens the mouth. */
export function makeHamster({ color = 0xe2a65e, belly = 0xf7ecdc } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const m = mat(color, 0.9), b = mat(belly, 0.9), pink = mat(0xf0a8b0, 0.6), dark = mat(0x111111, 0.3);
  mk(new THREE.SphereGeometry(0.045, 14, 12), m, body, 0, 0.042, -0.005).scale.set(1.0, 0.88, 1.2);
  mk(new THREE.SphereGeometry(0.036, 12, 10), b, body, 0, 0.03, 0.012).scale.set(0.95, 0.75, 1.15);
  const head = new THREE.Group(); head.position.set(0, 0.052, 0.04); body.add(head);
  mk(new THREE.SphereGeometry(0.034, 14, 12), m, head);
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.019, 10, 8), b, head, s * 0.02, -0.012, 0.016); mk(new THREE.SphereGeometry(0.012, 8, 6), pink, head, s * 0.02, 0.03, -0.004).scale.set(1, 1, 0.5); mk(new THREE.SphereGeometry(0.0068, 8, 6), dark, head, s * 0.017, 0.01, 0.029); }
  mk(new THREE.SphereGeometry(0.0055, 8, 6), pink, head, 0, -0.002, 0.034);
  const jaw = mk(new THREE.BoxGeometry(0.012, 0.004, 0.006), mat(0x8a2f3b, 0.6), head, 0, -0.016, 0.03);
  const paws = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.022, 0.03, 0.045); body.add(p); mk(new THREE.SphereGeometry(0.009, 8, 6), pink, p); return p; });
  const feet = [-1, 1].map((s) => mk(new THREE.SphereGeometry(0.01, 8, 6), pink, g, s * 0.025, 0.006, -0.03));
  let st = 0;
  const update = (t, run = 0) => {
    body.position.y = run * 0.006 * Math.abs(Math.sin(t * 28)); body.position.z = 0;
    if (st < 0.01) paws.forEach((p, i) => (p.position.y = 0.012 + 0.008 * run * Math.max(0, Math.sin(t * 28 + i * Math.PI))));
    feet.forEach((f, i) => (f.position.z = -0.03 + 0.012 * run * Math.sin(t * 28 + i * Math.PI)));
  };
  const stand = (k) => { st = k; body.rotation.x = -1.15 * k; body.position.y = 0.0; paws.forEach((p, i) => { p.position.set((i ? 1 : -1) * (0.022 + 0.012 * k), 0.03 + 0.03 * k, 0.045 + 0.01 * k); }); };
  const talk = (k) => jaw.scale.set(1, 1 + 3 * k, 1);
  return { g, body, head, paws, update, stand, talk };
}
/** Hamster wheel on an A-frame stand: wheel radius r, axis along z (the camera sees its face). spin(angle) turns it.
 *  The runner stands at the wheel's bottom: (0, axleY − r + 0.008, 0) local, facing ±x. */
export function makeHamsterWheel({ r = 0.1, color = 0x3d9be0 } = {}) {
  const g = new THREE.Group(), axleY = r + 0.03, wheel = new THREE.Group(); wheel.position.y = axleY; g.add(wheel);
  const pm = mat(color, 0.4), metal = mat(0xd9dde2, 0.3, { metalness: 0.5 });
  for (const z of [-0.035, 0.035]) mk(new THREE.TorusGeometry(r, 0.006, 6, 32), pm, wheel, 0, 0, z);
  for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2, c = mk(new THREE.CylinderGeometry(0.0025, 0.0025, 0.07, 4), metal, wheel, Math.cos(a) * r, Math.sin(a) * r, 0); c.rotation.x = Math.PI / 2; }
  for (let k = 0; k < 4; k++) { const sp = mk(new THREE.BoxGeometry(r * 2, 0.006, 0.006), pm, wheel, 0, 0, -0.035); sp.rotation.z = (k / 4) * Math.PI; }
  mk(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 12), pm, wheel, 0, 0, -0.04).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { const leg = mk(new THREE.BoxGeometry(0.012, axleY * 1.08, 0.012), pm, g, s * 0.03, axleY / 2, -0.05); leg.rotation.z = s * 0.3; }
  mk(new THREE.BoxGeometry(0.14, 0.012, 0.06), pm, g, 0, 0.006, -0.05);
  return { g, wheel, r, axleY, spin: (a) => (wheel.rotation.z = a) };
}

// ---------------------------------------------------------------- ants (dh002)
/** A cartoon ant, Labrador-sized at scale 1 (~1.1 m from mandibles to gaster, back at ~0.45 m). Faces +z, feet on y = 0.
 *  update(t, o): tripod gait (L1 R2 L3 swing while R1 L2 R3 push) driven by o.dist (meters walked; pure, so foley can mirror
 *  it) or, without dist, an idle shuffle; antennae sway + sniff; o.carry 0..1 lifts the head and opens the jaws (an object
 *  rides at `carryAt` in the ant's local space), o.mouth 0..1 opens the mandibles, o.look = head yaw, o.rear 0..1 rears up.
 *  Parts for tints: mats.body / mats.leg. makeAntSwarm(n) renders hundreds of these, legs and all. */
export function makeAnt({ color = 0x5a2a18, leg = 0x2e1a10, scale = 1 } = {}) {
  const g = new THREE.Group(); g.scale.setScalar(scale);
  const bodyM = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.08 });
  const legM = new THREE.MeshStandardMaterial({ color: leg, roughness: 0.45 });
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 0.12 });
  const shineM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const Y = new THREE.Vector3(0, 1, 0);
  /** a capsule from a to b (vectors in parent space) */
  const limb = (a, b, r, m, p) => {
    const d = new THREE.Vector3().subVectors(b, a), L = d.length();
    const o = mk(new THREE.CapsuleGeometry(r, Math.max(0.001, L - r), 3, 8), m, p, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    o.quaternion.setFromUnitVectors(Y, d.normalize()); return o;
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const body = new THREE.Group(); g.add(body);                          // bobs with the gait
  const thorax = mk(new THREE.SphereGeometry(0.1, 14, 10), bodyM, body, 0, 0.42, 0.08); thorax.scale.set(0.95, 0.95, 1.75); thorax.rotation.x = -0.28;
  mk(new THREE.SphereGeometry(0.06, 10, 8), bodyM, body, 0, 0.4, -0.13);                              // petiole node
  const gasterG = new THREE.Group(); gasterG.position.set(0, 0.42, -0.17); body.add(gasterG);          // pivot at the waist
  const gaster = mk(new THREE.SphereGeometry(0.17, 16, 12), bodyM, gasterG, 0, -0.02, -0.19); gaster.scale.set(1, 0.9, 1.3);
  const head = new THREE.Group(); head.position.set(0, 0.47, 0.25); body.add(head);                  // pivot at the neck
  const skull = mk(new THREE.SphereGeometry(0.155, 16, 12), bodyM, head, 0, 0.05, 0.14); skull.scale.set(1.05, 0.92, 0.95);
  for (const s of [-1, 1]) {
    const e = mk(new THREE.SphereGeometry(0.062, 12, 10), eyeM, head, s * 0.088, 0.1, 0.235); e.scale.set(0.85, 1, 0.8);
    mk(new THREE.SphereGeometry(0.019, 8, 6), shineM, head, s * 0.1, 0.13, 0.283);
  }
  const jaws = [-1, 1].map((s) => {
    const j = new THREE.Group(); j.position.set(s * 0.06, -0.02, 0.27); head.add(j);
    limb(V(0, 0, 0), V(s * 0.02, -0.02, 0.09), 0.026, legM, j); limb(V(s * 0.02, -0.02, 0.09), V(-s * 0.05, -0.03, 0.13), 0.02, legM, j);
    j.s = s; return j;
  });
  const antennae = [-1, 1].map((s) => {
    const a = new THREE.Group(); a.position.set(s * 0.06, 0.16, 0.24); head.add(a);
    limb(V(0, 0, 0), V(s * 0.1, 0.17, 0.05), 0.016, legM, a);                                           // scape (up + out)
    const f = new THREE.Group(); f.position.set(s * 0.1, 0.17, 0.05); a.add(f);
    limb(V(0, 0, 0), V(s * 0.04, 0.02, 0.24), 0.013, legM, f);                                         // funiculus (forward)
    mk(new THREE.SphereGeometry(0.024, 8, 6), legM, f, s * 0.04, 0.02, 0.25);
    a.s = s; a.f = f; return a;
  });
  // legs: [front, mid, hind] × [−x, +x]; femur goes out + up to a knee, tibia comes down to the foot on y = 0
  const LEGS = [[0.17, 0.2, 0.3], [0.08, 0.02, 0.04], [-0.01, -0.14, -0.3]];   // [hip z, knee z, foot z]
  const legs = [];
  LEGS.forEach(([hz, kz, fz], pair) => [-1, 1].forEach((s) => {
    const r = new THREE.Group(); r.position.set(s * 0.07, 0.37, hz); body.add(r);
    const knee = V(s * 0.23, 0.15, kz - hz), foot = V(s * 0.34, -0.365, fz - hz);
    limb(V(0, 0, 0), knee, 0.036, legM, r); limb(knee, foot, 0.027, legM, r);
    mk(new THREE.SphereGeometry(0.032, 8, 6), legM, r, foot.x, foot.y, foot.z);
    r.s = s; r.tri = (pair + (s > 0 ? 1 : 0)) % 2;                                                     // tripod 0 = L1 R2 L3
    legs.push(r);
  }));
  const STRIDE = 0.46;                                                                                    // meters per gait cycle
  const carryAt = V(0, 1.02, 0.12);
  function update(t, o = {}) {
    const moving = o.dist !== undefined, ph = moving ? (o.dist / STRIDE) * Math.PI * 2 : t * 2.1, amp = moving ? Math.min(1, (o.speed ?? 1) * 2 + 0.25) : 0.12;
    legs.forEach((r, i) => {
      const p = ph + (r.tri ? Math.PI : 0);
      r.rotation.set(0, -r.s * 0.42 * amp * Math.sin(p), r.s * 0.32 * amp * Math.max(0, Math.cos(p)));
    });
    const carry = o.carry ?? 0, rear = o.rear ?? 0;
    body.position.y = 0.012 * amp * Math.abs(Math.sin(ph * 2)) * (moving ? 1 : 0);
    body.rotation.x = -0.55 * rear; body.position.z = -0.12 * rear; body.position.y += 0.08 * rear;
    gasterG.rotation.x = 0.06 * Math.sin(ph * 2) * amp + 0.15 * carry + 0.35 * rear; gasterG.rotation.y = 0.07 * Math.sin(ph) * amp;
    head.rotation.set(-0.42 * carry + 0.05 * Math.sin(t * 1.3), (o.look ?? 0) + 0.06 * Math.sin(t * 0.9 + 1), 0);
    const open = Math.max(o.mouth ?? 0, carry * 0.6);
    jaws.forEach((j) => (j.rotation.y = j.s * (0.05 + 0.5 * open)));
    antennae.forEach((a) => {
      const w = Math.sin(t * 3.1 + a.s * 1.3) * 0.22 + Math.max(0, Math.sin(t * 0.8 + a.s)) ** 6 * 0.5 * Math.sin(t * 17);   // lazy sway + a quick sniff
      a.rotation.set(-0.15 + w * 0.6 - 0.3 * carry, a.s * w * 0.4, 0); a.f.rotation.x = 0.2 + 0.25 * Math.sin(t * 2.3 + a.s);
    });
  }
  update(0);
  return { g, body, head, gasterG, jaws, legs, update, carryAt, mats: { body: bodyM, leg: legM }, STRIDE };
}

/** Hundreds of ants in a handful of draw calls: every mesh of a template ant becomes an InstancedMesh. Per frame call
 *  begin(), then add(x, y, z, rotY, scale, o) for each ant (o = the same options as makeAnt's update: t, dist, speed, carry…),
 *  then end(). Positions are in the swarm group's parent space. */
export function makeAntSwarm(n, opts = {}) {
  const tpl = makeAnt(opts), meshes = [];
  tpl.g.traverse((o) => o.isMesh && meshes.push(o));
  const g = new THREE.Group();
  const inst = meshes.map((m) => { const im = new THREE.InstancedMesh(m.geometry, m.material, n); im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; im.count = 0; g.add(im); return im; });
  let k = 0;
  const begin = () => { k = 0; };
  function add(x, y, z, rotY, s, o = {}) {
    if (k >= n) return;
    tpl.g.position.set(x, y, z); tpl.g.scale.setScalar(s);
    if (o.quat) tpl.g.quaternion.copy(o.quat); else tpl.g.rotation.set(o.pitch ?? 0, rotY, o.roll ?? 0, 'YXZ');   // quat: any orientation (climbing a wall)
    tpl.update(o.t ?? 0, o); tpl.g.updateMatrixWorld(true);
    meshes.forEach((m, j) => inst[j].setMatrixAt(k, m.matrixWorld)); k++;
  }
  const end = () => inst.forEach((im) => { im.count = k; im.instanceMatrix.needsUpdate = true; });
  return { g, begin, add, end, mats: tpl.mats, get count() { return k; } };
}

// ---------------------------------------------------------------- personal rain cloud (dh004; reusable)
/** A cartoon storm cloud with a face that follows someone around: opaque toy puffs (Lambert, so no specular haze), a face on
 *  +z, rain streaks and/or flower petals falling `fall` m below it (instanced, a pure function of t), an optional bow tie and a
 *  cardboard "laid off" box (with a desk plant) hanging under it on two strings. About 2.6·r wide; the group's origin is the
 *  cloud's center. update(t, { rain 0..1, petals 0..1, mood 'sad'|'o'|'smile'|'sleep', fall (m), white 0..1 (gray storm →
 *  white fluffy), bow (bool), box (bool), bandage (bool: a crossed plaster — it survived something), bob (0..1 idle float) }).
 *  Petals fan out as they fall (spread grows with depth). */
export function makeRainCloud({ r = 0.32, seed = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const R = rng(seed), gray = new THREE.Color(0x737a86), white = new THREE.Color(0xf4f6fb);
  const puffM = new THREE.MeshLambertMaterial({ color: gray.clone() });
  const PUFFS = [[0, 0.05, 0, 1], [-0.7, -0.12, 0.02, 0.72], [0.72, -0.1, 0, 0.76], [-0.34, 0.42, -0.06, 0.74], [0.36, 0.38, -0.02, 0.7],
    [-1.12, -0.24, 0, 0.5], [1.14, -0.22, 0, 0.52], [0, -0.3, 0.12, 0.72], [-0.42, -0.32, -0.1, 0.62], [0.44, -0.3, -0.08, 0.62]];
  for (const [x, y, z, s] of PUFFS) { const p = mk(new THREE.SphereGeometry(r * s, 24, 16), puffM, body, x * r, y * r, z * r); p.castShadow = false; }
  // face features sit on the front of the center puff (center y 0.05 r, radius r)
  const zOn = (y) => Math.sqrt(Math.max(0, r * r - (y - 0.05 * r) ** 2)) + r * 0.01;
  const ink = new THREE.MeshBasicMaterial({ color: 0x1d1f26 }), blushM = new THREE.MeshBasicMaterial({ color: 0xf29aa8 });
  const eyes = new THREE.Group(), shut = new THREE.Group(), blush = new THREE.Group(); body.add(eyes, shut, blush);
  for (const s of [-1, 1]) {
    const e = mk(new THREE.SphereGeometry(r * 0.09, 14, 10), ink, eyes, s * r * 0.3, r * 0.1, zOn(r * 0.1) - r * 0.02); e.scale.set(1, 1.25, 0.5);
    mk(new THREE.SphereGeometry(r * 0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), eyes, s * r * 0.3 + r * 0.03, r * 0.15, zOn(r * 0.15) + r * 0.012);
    const c = mk(new THREE.TorusGeometry(r * 0.08, r * 0.02, 6, 14, Math.PI), ink, shut, s * r * 0.3, r * 0.08, zOn(r * 0.08)); c.rotation.z = Math.PI;
    const b = mk(new THREE.SphereGeometry(r * 0.08, 12, 8), blushM, blush, s * r * 0.5, -r * 0.08, zOn(-r * 0.08) - r * 0.035); b.scale.set(1.3, 0.75, 0.4);
  }
  const arc = new THREE.TorusGeometry(r * 0.14, r * 0.026, 6, 18, Math.PI);
  const sad = mk(arc, ink, body, 0, -r * 0.27, zOn(-r * 0.2));                                   // ∩
  const smile = mk(arc, ink, body, 0, -r * 0.12, zOn(-r * 0.2)); smile.rotation.z = Math.PI;      // ∪
  const oM = mk(new THREE.TorusGeometry(r * 0.065, r * 0.024, 6, 14), ink, body, 0, -r * 0.2, zOn(-r * 0.2));
  // bow tie (wedding) + the laid-off box on two strings
  const bow = new THREE.Group(); bow.position.set(0, -r * 0.5, r * 0.86); body.add(bow);
  const bowM = mat(0xc8324a, 0.55);
  for (const s of [-1, 1]) { const w = mk(new THREE.ConeGeometry(r * 0.12, r * 0.24, 4), bowM, bow, s * r * 0.12, 0, 0); w.rotation.z = s * Math.PI / 2; }
  mk(new THREE.SphereGeometry(r * 0.055, 10, 8), bowM, bow);
  const bandage = new THREE.Group(); bandage.position.set(r * 0.42, r * 0.5, zOn(r * 0.5) - r * 0.02); bandage.rotation.y = 0.35; body.add(bandage);
  for (const rz of [0.6, -0.6]) { const bd = mk(new THREE.BoxGeometry(r * 0.5, r * 0.14, r * 0.03), mat(0xe8c9a0, 0.8), bandage); bd.rotation.z = rz; }
  const box = new THREE.Group(); box.position.set(0, -r * 1.75, 0); g.add(box);
  mk(new RoundedBoxGeometry(r * 0.8, r * 0.55, r * 0.6, 2, r * 0.03), mat(0xb98b5c, 0.95), box, 0, 0, 0);
  mk(new THREE.CylinderGeometry(r * 0.09, r * 0.07, r * 0.16, 12), mat(0xc0603a, 0.8), box, r * 0.15, r * 0.34, 0);
  mk(new THREE.SphereGeometry(r * 0.14, 12, 8), mat(0x4f8a3a, 0.8), box, r * 0.15, r * 0.5, 0);
  const strM = mat(0xe8e2d4, 0.8);
  for (const s of [-1, 1]) { const st = mk(new THREE.CylinderGeometry(r * 0.006, r * 0.006, r * 1.35, 4), strM, box, s * r * 0.28, r * 0.9, 0); st.rotation.z = -s * 0.12; }
  // rain streaks + petals (instanced; positions are a pure function of t)
  const NR = 46, NP = 150;
  const rainM = new THREE.MeshBasicMaterial({ color: 0x9ecbff, transparent: true, opacity: 0.55, depthWrite: false });
  const rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.007, 0.14, 0.007), rainM, NR); rain.frustumCulled = false; rain.castShadow = false; g.add(rain);
  const petalGeo = new THREE.CircleGeometry(0.024, 8); petalGeo.scale(1.45, 1, 1);
  const petals = new THREE.InstancedMesh(petalGeo, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), NP); petals.frustumCulled = false; petals.castShadow = false; g.add(petals);
  const PC = [0xf7a8c4, 0xfbd0de, 0xf27f9f, 0xffffff, 0xf9b9cf];
  const rs = Array.from({ length: NR }, () => [R() * 2 - 1, R() * 2 - 1, R()]);
  const ps = Array.from({ length: NP }, (_, i) => { petals.setColorAt(i, new THREE.Color(PC[i % PC.length])); return [R() * 2 - 1, R() * 2 - 1, R(), R() * 6.28, R()]; });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s1 = new THREE.Vector3(1, 1, 1);
  function update(t, o = {}) {
    const mood = o.mood ?? 'sad', fall = o.fall ?? 2, k = o.white ?? 0;
    puffM.color.copy(gray).lerp(white, k);
    eyes.visible = mood !== 'sleep'; shut.visible = mood === 'sleep';
    sad.visible = mood === 'sad'; smile.visible = mood === 'smile' || mood === 'sleep'; oM.visible = mood === 'o'; blush.visible = mood === 'smile';
    bow.visible = !!o.bow; box.visible = !!o.box; bandage.visible = !!o.bandage;
    const bob = o.bob ?? 1;
    body.position.y = bob * 0.03 * Math.sin(t * 1.7 + seed); body.rotation.z = bob * 0.04 * Math.sin(t * 1.1 + seed);
    box.rotation.z = 0.12 * Math.sin(t * 2.3); box.position.y = -r * 1.75 + body.position.y;
    const nr = Math.round(NR * Math.min(1, Math.max(0, o.rain ?? 0)));
    for (let i = 0; i < nr; i++) {
      const [x, z, ph] = rs[i], u = (t * 3.2 / fall + ph) % 1;
      m4.compose(v.set(x * r * 1.05, -r * 0.35 - u * fall, z * r * 0.45), q.identity(), s1); rain.setMatrixAt(i, m4);
    }
    rain.count = Math.max(1, nr); rain.visible = nr > 0; rain.instanceMatrix.needsUpdate = true;
    const np = Math.round(NP * Math.min(1, Math.max(0, o.petals ?? 0)));
    for (let i = 0; i < np; i++) {
      const [x, z, ph, rot, w] = ps[i], u = (t * 0.75 / fall + ph) % 1, spread = 1 + 1.6 * u;
      e.set(t * (1.5 + w * 2) + rot, rot + t * 0.8, Math.sin(t * 2.5 + rot) * 0.9); q.setFromEuler(e);
      m4.compose(v.set(x * r * 1.2 * spread + 0.12 * Math.sin(t * 1.8 + rot), -r * 0.4 - u * fall, z * r * 0.8 * spread), q, s1); petals.setMatrixAt(i, m4);
    }
    petals.count = Math.max(1, np); petals.visible = np > 0; petals.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { g, body, box, bow, update, mats: { puff: puffM } };
}

// ---------------------------------------------------------------- cartoon birds (dh004; reusable)
/** A round cartoon songbird, ~0.34 m long at scale 1, faces +z, origin under the belly. update({ flap 0..1 (wing raise),
 *  out (bool: fainted — X eyes, limp wings, beak open) }). Body / head / wings / tail share `white` so a flock can tint them. */
export function makeBird() {
  const g = new THREE.Group(), white = new THREE.MeshLambertMaterial({ color: 0xffffff }), orange = mat(0xf0a030, 0.6);
  const ink = new THREE.MeshBasicMaterial({ color: 0x1d1f26 }), cream = mat(0xf4ead8, 0.8);
  const body = mk(new THREE.SphereGeometry(0.1, 16, 12), white, g, 0, 0.1, 0); body.scale.set(0.85, 0.8, 1.2);
  mk(new THREE.SphereGeometry(0.075, 12, 10), cream, g, 0, 0.085, 0.04).scale.set(0.9, 0.8, 1.1);
  mk(new THREE.SphereGeometry(0.07, 16, 12), white, g, 0, 0.19, 0.08);
  const beak = mk(new THREE.ConeGeometry(0.024, 0.065, 8), orange, g, 0, 0.183, 0.165); beak.rotation.x = Math.PI / 2;
  const eyes = new THREE.Group(), xs = new THREE.Group(); g.add(eyes, xs);
  for (const s of [-1, 1]) {
    mk(new THREE.SphereGeometry(0.015, 8, 6), ink, eyes, s * 0.042, 0.205, 0.135);
    for (const rz of [0.785, -0.785]) mk(new THREE.BoxGeometry(0.005, 0.036, 0.008), ink, xs, s * 0.042, 0.205, 0.142).rotation.z = rz;
  }
  const wings = [-1, 1].map((s) => { const w = new THREE.Group(); w.position.set(s * 0.075, 0.13, 0.0); g.add(w); mk(new THREE.SphereGeometry(0.1, 12, 8), white, w, s * 0.07, 0, -0.01).scale.set(0.75, 0.16, 0.8); return w; });
  const tail = mk(new THREE.BoxGeometry(0.09, 0.014, 0.11), white, g, 0, 0.13, -0.15); tail.rotation.x = -0.45;
  for (const s of [-1, 1]) mk(new THREE.CylinderGeometry(0.007, 0.007, 0.07, 6), orange, g, s * 0.03, 0.025, 0.02);
  function update(o = {}) {
    const out = !!o.out, f = o.flap ?? 0;
    eyes.scale.setScalar(out ? 1e-4 : 1); xs.scale.setScalar(out ? 1 : 1e-4);
    wings.forEach((w, i) => { const s = i ? 1 : -1; w.rotation.z = out ? -s * 0.15 : s * (0.15 + 1.25 * f); });
    beak.scale.set(1, out ? 1.25 : 1, 1);
  }
  update();
  return { g, update, white };
}
/** Hundreds of birds in a handful of draw calls (every mesh of a template bird as an InstancedMesh). Per frame: begin(),
 *  add(x, y, z, { rotY, pitch, roll, s, flap, out, color }) per bird (positions in the flock group's parent space), end(). */
export function makeBirdFlock(n) {
  const tpl = makeBird(), meshes = [];
  tpl.g.traverse((o) => o.isMesh && meshes.push(o));
  const g = new THREE.Group(), white = new THREE.Color(0xffffff), col = new THREE.Color();
  const inst = meshes.map((m) => {
    const im = new THREE.InstancedMesh(m.geometry, m.material, n); im.frustumCulled = false; im.castShadow = true; im.receiveShadow = false;
    if (m.material === tpl.white) for (let i = 0; i < n; i++) im.setColorAt(i, white);
    im.count = 0; g.add(im); return im;
  });
  let k = 0;
  return {
    g,
    begin() { k = 0; },
    add(x, y, z, o = {}) {
      if (k >= n) return;
      tpl.g.position.set(x, y, z); tpl.g.rotation.set(o.pitch ?? 0, o.rotY ?? 0, o.roll ?? 0, 'YXZ'); tpl.g.scale.setScalar(o.s ?? 1);
      tpl.update(o); tpl.g.updateMatrixWorld(true); col.setHex(o.color ?? 0x4f86d8);
      meshes.forEach((m, j) => { inst[j].setMatrixAt(k, m.matrixWorld); if (inst[j].instanceColor) inst[j].setColorAt(k, col); });
      k++;
    },
    end() { inst.forEach((im) => { im.count = k; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }); },
  };
}


// ---------------------------------------------------------------- dh007: a toy silverback gorilla + a banana
/** Toy silverback (dh007 "100 men vs 1 gorilla"). Faces +z, feet at y=0; ≈1.85 m standing upright, ≈1.3 m at the shoulder
 *  knuckle-walking, ≈1.1 m wide. A readable toy face: white eyes under a heavy brow (lids = bored/sleepy), a broad nose, a
 *  mouth that opens into a huge yawn. Drive it with plain-data poses, like rig.js:
 *    const G = makeGorilla(); const p = G.basePose(); G.knuckle(p, dist); G.apply(p);
 *  Pose fields: x, y, z, rotY, roll, pitch (whole body), lean (torso, + = forward; 0 upright, ~0.8 knuckle-walk), hipY (null =
 *  standing), dist/speed (gait), footFwd, armA/armB {sx, sz, el, twist} (rig.js conventions: sx < 0 swings forward, sz > 0
 *  raises outward, el < 0 bends the elbow), headPitch/Yaw/Roll (the head counter-tilts the lean by itself), jaw 0..1 (yawn),
 *  mouth 'flat'|'o'|'smile', lids 0 (open) .. 0.5 (bored) .. 1 (closed), look [x, y] (pupils, −1..1), legFwd/legLift [a, b]
 *  (per-leg foot offsets: lift one foot = a leg raise; legs[0] = the local −x leg).
 *  Presets (pure: they mutate p): stand, knuckle(p, dist), sit, chestBeat(p, t, k), throwArm(p, u, side), eat(p, k, side),
 *  yawn(p, k), spinArms(p). handWorld(side) after apply(). */
export function makeGorilla({ fur = 0x3b3532, silver = 0x67625c, skin = 0x2a2624, face = 0x54483f } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const mFur = mat(fur, 0.95), mSil = mat(silver, 0.95), mSkin = mat(skin, 0.55), mFace = mat(face, 0.62);
  const mEye = mat(0xf6f1e8, 0.3), mPup = mat(0x24160f, 0.3), mDark = mat(0x1d0c0b, 0.6), mTooth = mat(0xf4efe2, 0.4), mTongue = mat(0xc4606a, 0.6);
  const glint = new THREE.MeshBasicMaterial({ color: 0xd8d8d8 });
  const LT = 0.34, LS = 0.32, ANK = 0.06, HIP = LT + LS + ANK;
  const hips = new THREE.Group(); hips.position.y = HIP; body.add(hips);
  mk(new THREE.SphereGeometry(0.34, 24, 18), mFur, hips, 0, 0.02, -0.03).scale.set(1.05, 0.82, 0.92);
  const torso = new THREE.Group(); hips.add(torso);
  mk(new THREE.SphereGeometry(0.5, 32, 24), mFur, torso, 0, 0.42, 0).scale.set(1.1, 0.92, 0.78);          // chest + shoulder mass
  mk(new THREE.SphereGeometry(0.4, 28, 20), mFur, torso, 0, 0.12, 0.05).scale.set(0.95, 0.9, 0.88);         // belly
  mk(new THREE.SphereGeometry(0.42, 28, 20), mSil, torso, 0, 0.38, -0.19).scale.set(0.86, 0.62, 0.56);       // the silver saddle (back only)
  mk(new THREE.SphereGeometry(0.3, 24, 16), mSkin, torso, 0, 0.42, 0.27).scale.set(1.15, 0.72, 0.42);   // the bare chest (one broad plate)
  const arms = [];
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Group(); shoulder.position.set(0.52 * s, 0.58, 0.02); torso.add(shoulder);
    mk(new THREE.SphereGeometry(0.19, 18, 14), mFur, shoulder);
    mk(new THREE.CapsuleGeometry(0.125, 0.34, 6, 14), mFur, shoulder, 0, -0.27, 0);
    const elbow = new THREE.Group(); elbow.position.y = -0.52; shoulder.add(elbow);
    mk(new THREE.CapsuleGeometry(0.118, 0.3, 6, 14), mFur, elbow, 0, -0.23, 0);
    const hand = new THREE.Group(); hand.position.y = -0.46; elbow.add(hand);
    mk(new THREE.SphereGeometry(0.11, 16, 12), mSkin, hand, 0, -0.07, 0.01).scale.set(1.05, 1.15, 0.82);
    for (let k = 0; k < 4; k++) mk(new THREE.SphereGeometry(0.035, 10, 8), mSkin, hand, (k - 1.5) * 0.05, -0.17, 0.035);
    mk(new THREE.CapsuleGeometry(0.03, 0.06, 4, 8), mSkin, hand, -0.09 * s, -0.08, 0.06).rotation.z = 0.5 * s;
    arms.push({ shoulder, elbow, hand, s });
  }
  // head: sits low and forward between the shoulders
  const head = new THREE.Group(); head.position.set(0, 0.86, 0.14); torso.add(head);
  mk(new THREE.SphereGeometry(0.22, 28, 20), mFur, head).scale.set(1.0, 1.0, 0.95);
  mk(new THREE.SphereGeometry(0.13, 18, 14), mFur, head, 0, 0.17, -0.06).scale.set(0.62, 1.0, 1.25);       // sagittal crest
  mk(new THREE.SphereGeometry(0.19, 24, 18), mFace, head, 0, -0.02, 0.1).scale.set(1.05, 1.0, 0.7);        // face
  const brow = mk(new THREE.CapsuleGeometry(0.036, 0.19, 6, 12), mSkin, head, 0, 0.082, 0.218); brow.rotation.z = Math.PI / 2;
  const eyes = [], lids = [], pupils = [];
  for (const s of [-1, 1]) {
    eyes.push(mk(new THREE.SphereGeometry(0.044, 16, 12), mEye, head, s * 0.07, 0.022, 0.213));
    const pg = new THREE.Group(); pg.position.set(s * 0.07, 0.022, 0.213); head.add(pg); pupils.push(pg);
    mk(new THREE.SphereGeometry(0.03, 12, 10), mPup, pg, 0, -0.004, 0.035).scale.set(1, 1.1, 0.55);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 5), glint); gl.position.set(0.011, 0.008, 0.052); pg.add(gl);
    const lid = mk(new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mFace, head, s * 0.07, 0.022, 0.213); lids.push(lid);
    mk(new THREE.SphereGeometry(0.04, 10, 8), mSkin, head, s * 0.215, 0.0, 0.0).scale.set(0.5, 1, 0.8);     // ears
  }
  mk(new THREE.SphereGeometry(0.12, 20, 14), mFace, head, 0, -0.09, 0.2).scale.set(1.25, 0.85, 0.8);       // muzzle
  mk(new THREE.SphereGeometry(0.06, 14, 10), mFace, head, 0, -0.035, 0.27).scale.set(1.35, 0.85, 0.75);    // broad nose
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.02, 8, 6), mDark, head, s * 0.03, -0.05, 0.312).scale.set(1.25, 0.8, 0.5);
  const chin = mk(new THREE.SphereGeometry(0.1, 16, 12), mFace, head, 0, -0.17, 0.2); chin.scale.set(1.2, 0.68, 0.85);
  const mouth = new THREE.Group(); mouth.position.set(0, -0.135, 0.272); head.add(mouth);
  const hole = mk(new THREE.SphereGeometry(0.07, 18, 12), mDark, mouth); hole.scale.set(1.35, 0.1, 0.4);
  const teeth = mk(new THREE.BoxGeometry(0.12, 0.018, 0.02), mTooth, mouth, 0, 0.0, 0.012);
  const fangs = [-1, 1].map((s) => { const f = mk(new THREE.ConeGeometry(0.013, 0.045, 6), mTooth, mouth, s * 0.055, 0, 0.012); f.rotation.x = Math.PI; return f; });
  const tongue = mk(new THREE.SphereGeometry(0.045, 12, 8), mTongue, mouth, 0, 0, 0.004); tongue.scale.set(1.3, 0.45, 0.6);
  const smile = mk(new THREE.TorusGeometry(0.055, 0.011, 6, 16, Math.PI), mDark, mouth, 0, 0.022, 0.005); smile.rotation.z = Math.PI;
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(0.2 * s, HIP, 0); body.add(hip);
    mk(new THREE.CapsuleGeometry(0.135, 0.2, 6, 14), mFur, hip, 0, -LT / 2, 0);
    const knee = new THREE.Group(); knee.position.y = -LT; hip.add(knee);
    mk(new THREE.CapsuleGeometry(0.11, 0.16, 6, 14), mFur, knee, 0, -LS / 2, 0);
    const ankle = new THREE.Group(); ankle.position.y = -LS; knee.add(ankle);
    mk(new RoundedBoxGeometry(0.2, 0.08, 0.3, 2, 0.035), mSkin, ankle, 0, -0.03, 0.06);
    legs.push({ hip, knee, ankle, s });
  }
  function legIK(leg, dz, dy) {
    let d = Math.hypot(dz, dy); d = Math.min(d, LT + LS - 1e-4);
    const gm = Math.atan2(dz, -dy), al = Math.acos(Math.min(1, Math.max(-1, (LT * LT + d * d - LS * LS) / (2 * LT * d))));
    const be = Math.PI - Math.acos(Math.min(1, Math.max(-1, (LT * LT + LS * LS - d * d) / (2 * LT * LS))));
    leg.hip.rotation.x = -(gm + al); leg.knee.rotation.x = be; leg.ankle.rotation.x = gm + al - be;
  }
  const A = (sx, sz, el, twist = 0) => ({ sx, sz, el, twist });
  function basePose() {
    return { x: 0, y: 0, z: 0, rotY: 0, roll: 0, pitch: 0, lean: 0.25, hipY: null, dist: 0, speed: 0, footFwd: 0.05, splay: 0.12,
      armA: A(-0.15, 0.12, -0.25), armB: A(-0.15, 0.12, -0.25), headPitch: 0, headYaw: 0, headRoll: 0, jaw: 0, mouth: 'flat', lids: 0.3, look: [0, 0] };
  }
  function apply(p) {
    g.position.set(p.x, p.y || 0, p.z); g.rotation.set(p.pitch || 0, p.rotY || 0, p.roll || 0, 'YXZ');
    const walk = Math.min(1, (p.speed || 0) / 0.5), ph = ((p.dist || 0) * Math.PI) / 0.5;
    const hy = (p.hipY ?? HIP) + walk * 0.03 * Math.abs(Math.sin(ph));
    hips.position.y = hy; hips.rotation.set(0, walk * 0.08 * Math.sin(ph), walk * 0.06 * Math.sin(ph));
    torso.rotation.set(p.lean, 0, 0);
    legs.forEach((leg, i) => {
      leg.hip.position.y = hy; leg.hip.rotation.z = 0;
      const phi = ph + (i ? Math.PI : 0), fz = walk * 0.22 * Math.sin(phi) + (p.footFwd || 0) + (p.legFwd?.[i] || 0), lift = walk * 0.08 * Math.max(0, Math.cos(phi)) + (p.legLift?.[i] || 0);
      legIK(leg, fz, ANK + lift - hy); leg.hip.rotation.z = leg.s * (p.splay ?? 0.12);
    });
    arms.forEach((a) => { const q = a.s < 0 ? p.armA : p.armB; a.shoulder.rotation.set(q.sx, q.twist || 0, a.s * q.sz); a.elbow.rotation.x = q.el; });
    head.rotation.set(p.headPitch - p.lean * 0.85, p.headYaw, p.headRoll);
    const k = Math.max(0, Math.min(1, p.jaw || 0)), o = p.mouth === 'o' ? 0.45 : 0, open = Math.max(k, o);
    hole.scale.set(1.35 - 0.25 * open, 0.1 + 1.25 * open, 0.4); hole.position.y = -0.045 * open; chin.position.y = -0.17 - 0.07 * open;
    teeth.visible = open > 0.35; teeth.position.y = 0.075 * open - 0.012; fangs.forEach((f) => { f.visible = open > 0.35; f.position.y = 0.06 * open - 0.02; });
    tongue.visible = open > 0.2; tongue.position.y = -0.11 * open;
    smile.visible = p.mouth === 'smile' && open < 0.05; hole.visible = !smile.visible;
    const lk = Math.max(0, Math.min(1, p.lids ?? 0.3)); lids.forEach((l) => (l.rotation.x = -Math.PI / 2 + lk * Math.PI));
    pupils.forEach((pg) => pg.rotation.set(-(p.look?.[1] || 0) * 0.45, (p.look?.[0] || 0) * 0.5, 0));
  }
  // ---------------------------------------------------------------- presets (pure: mutate and return p)
  const stand = (p) => Object.assign(p, { lean: 0.12, hipY: null, armA: A(-0.1, 0.2, -0.3), armB: A(-0.1, 0.2, -0.3) });
  function knuckle(p, dist = 0, speed = 0) {
    const ph = (dist * Math.PI) / 0.5, w = Math.min(1, speed / 0.5);
    p.lean = 0.82; p.hipY = HIP - 0.04; p.dist = dist; p.speed = speed; p.headPitch = 0.05;
    p.armA = A(-0.82 - 0.32 * w * Math.sin(ph + Math.PI), 0.16, -0.12); p.armB = A(-0.82 - 0.32 * w * Math.sin(ph), 0.16, -0.12);
    return p;
  }
  function sit(p) {
    return Object.assign(p, { lean: 0.18, hipY: 0.3, footFwd: 0.42, splay: 0.42, armA: A(-0.55, 0.28, -0.85, 0.4), armB: A(-0.55, 0.28, -0.85, -0.4) });
  }
  function chestBeat(p, t, k = 1) {   // hands alternately slap the chest (~3 beats a second each), head up, mouth open
    const a = Math.max(0, Math.sin(t * 19)), b = Math.max(0, Math.sin(t * 19 + Math.PI)), mix = (u, v, w) => u + (v - u) * w;
    const IN = (s) => A(-1.15, 0.05, -1.95, -0.85 * s), OUT = (s) => A(-1.35, 0.3, -1.05, -0.35 * s), cur = (q, s, w) => { const i = IN(s), o2 = OUT(s); return A(mix(q.sx, mix(o2.sx, i.sx, w), k), mix(q.sz, mix(o2.sz, i.sz, w), k), mix(q.el, mix(o2.el, i.el, w), k), mix(q.twist || 0, mix(o2.twist, i.twist, w), k)); };
    p.armA = cur(p.armA, -1, a); p.armB = cur(p.armB, 1, b);
    p.lean = mix(p.lean, -0.05, k); p.headPitch = mix(p.headPitch, -0.35, k); p.jaw = Math.max(p.jaw || 0, 0.6 * k); p.lids = mix(p.lids, 0, k);
    return p;
  }
  function throwArm(p, u, side = 1) {   // u 0 wind-up behind + up → 1 follow-through forward-down
    const e = u < 0.45 ? u / 0.45 : 1 + (u - 0.45) / 0.55, q = e <= 1 ? A(0.2 + 0.7 * e, 0.4 + 1.6 * e, -0.6 + 0.3 * e) : A(0.9 - 3.2 * (e - 1), 2.0 - 1.7 * (e - 1), -0.3 + 0.15 * (e - 1));
    if (side > 0) p.armB = q; else p.armA = q;
    p.lean = 0.12 + 0.35 * Math.max(0, u - 0.4); return p;
  }
  function eat(p, k, side = -1) {    // hand to the mouth (banana)
    const q = A(-0.4 - 1.05 * k, 0.18 + 0.1 * k, -0.6 - 1.75 * k, (side < 0 ? 0.6 : -0.6) * k);
    if (side < 0) p.armA = q; else p.armB = q; return p;
  }
  const yawn = (p, k) => Object.assign(p, { jaw: Math.max(p.jaw || 0, k), lids: Math.max(p.lids ?? 0.3, 0.3 + 0.65 * k), headPitch: (p.headPitch || 0) - 0.35 * k });
  const spinArms = (p) => Object.assign(p, { lean: 0.05, armA: A(0, 1.45, -0.15), armB: A(0, 1.45, -0.15) });
  const _v = new THREE.Vector3();
  const handWorld = (side = -1) => { g.updateMatrixWorld(true); return arms.find((a) => a.s === side).hand.localToWorld(_v.set(0, -0.08, 0.02)).clone(); };
  return { g, body, hips, torso, head, arms, legs, basePose, apply, stand, knuckle, sit, chestBeat, throwArm, eat, yawn, spinArms, handWorld, HIP, mats: { fur: mFur, silver: mSil, skin: mSkin, face: mFace } };
}

/** A cartoon banana (stem up, along +y, ≈0.2 m). setPeel(k) opens three peel petals (0 = closed, 1 = hanging), setBite(k)
 *  eats the flesh from the top (0 = whole, 1 = gone). Parent it to a hand (rig or gorilla) or place it in the world. */
export function makeBanana() {
  const g = new THREE.Group(), yel = mat(0xf2cf3a, 0.55), tip = mat(0x5a4022, 0.7), flesh = mat(0xf6ecc4, 0.6);
  const curve = (r, x0) => new THREE.QuadraticBezierCurve3(new THREE.Vector3(x0, 0, 0), new THREE.Vector3(x0 + 0.012, 0.11, 0), new THREE.Vector3(x0, 0.22, 0));
  const fleshM = mk(new THREE.TubeGeometry(curve(0, 0), 16, 0.019, 10, false), flesh, g);
  const petals = [0, 1, 2].map((k) => {
    const pv = new THREE.Group(); pv.position.y = 0.04; pv.rotation.order = 'YXZ'; pv.rotation.y = (k * 2 * Math.PI) / 3; g.add(pv);
    mk(new THREE.CylinderGeometry(0.022, 0.026, 0.17, 10, 1, true, -Math.PI / 3, (2 * Math.PI) / 3), mat(0xf2cf3a, 0.55, { side: THREE.DoubleSide }), pv, 0, 0.085, 0); return pv;
  });
  mk(new THREE.CylinderGeometry(0.024, 0.02, 0.05, 10), yel, g, 0, 0.015, 0);
  mk(new THREE.CylinderGeometry(0.008, 0.012, 0.03, 6), tip, g, 0, -0.022, 0);
  const setPeel = (k) => petals.forEach((pv) => (pv.rotation.x = 2.6 * k));
  const setBite = (k) => { fleshM.scale.y = Math.max(0.001, 1 - k); fleshM.visible = k < 0.98; };
  setPeel(0);
  return { g, setPeel, setBite };
}

/** dh009: the fluffy binaural ASMR mic — two fluffy "ears" (shaggy pom-poms) on a short bar over a black handle. Built along
 *  +y from the grip (y = 0) to the fluff (y ≈ 0.2), so point it from the hand at a mouth each frame:
 *  `mic.g.position.copy(hand); mic.g.quaternion.setFromUnitVectors(UP, dir)`. color = the fluff, seed = the shag pattern. */
export function makeFluffyMic({ color = 0xf6d6e6, seed = 4 } = {}) {
  const g = new THREE.Group(), R = rng(seed), dark = mat(0x1d1d22, 0.45), fur = mat(color, 1.0);
  mk(new THREE.CylinderGeometry(0.016, 0.02, 0.15, 12), dark, g, 0, 0.06, 0);
  mk(new THREE.BoxGeometry(0.15, 0.022, 0.03), dark, g, 0, 0.14, 0);
  for (const s of [-1, 1]) {
    const geo = new THREE.IcosahedronGeometry(0.058, 3), p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + 0.32 * R() * R() + 0.06 * Math.sin(v.x * 90 + v.y * 70); v.multiplyScalar(n); p.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals();
    const ball = mk(geo, fur, g, s * 0.07, 0.2, 0); ball.scale.set(1, 1.15, 1);
  }
  return { g, fur };
}

/** dh009: over-ear headset for a makePerson head (parent to rig.head.g): a band + two cups with a soft glowing ring. */
export function makeHeadset({ color = 0xf4f2f6, glow = 0xff7fc0, r = 0.135 } = {}) {
  const g = new THREE.Group(), m = mat(color, 0.4), ringM = new THREE.MeshBasicMaterial({ color: glow });
  const band = mk(new THREE.TorusGeometry(r * 1.1, r * 0.11, 8, 24, Math.PI), m, g, 0, r * 0.05, 0); band.rotation.y = Math.PI / 2;
  for (const s of [-1, 1]) {
    const cup = mk(new THREE.CylinderGeometry(r * 0.42, r * 0.42, r * 0.34, 18), m, g, s * r * 1.08, -r * 0.05, 0); cup.rotation.z = Math.PI / 2;
    const ring = mk(new THREE.TorusGeometry(r * 0.3, r * 0.05, 6, 18), ringM, g, s * r * 1.26, -r * 0.05, 0); ring.rotation.y = Math.PI / 2;
  }
  return { g, ringM };
}
