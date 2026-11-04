// Coins for the toon look (dh013 "Why do coins have ridges?"): a coin is one CylinderGeometry whose rim radius is a
// function of the angle — reeded (N grooves), smooth, or clipped (irregular bites) — with face UVs recomputed from the
// displaced rim, so a clipped coin's legend is cut off like a real clipped coin. Faces are painted canvases.
// Plus silver shavings (instanced slivers) and a growing heap of them.
import * as THREE from 'three';
import { toonMat, toonMetal } from './shade.js';
import { ctex } from './paint.js';
import { INK } from './cards.js';

const PI = Math.PI, TAU = PI * 2;
/** toon look v2: metal gets a tight highlight (a dark spec keeps flat faces seen from above from washing out) */
// real metal (toon look v3): reflects the set's scene.environment; at rough 0.3 a spot pool blew the faces out (lt001)
const FACE = { rough: 0.42 }, EDGE = { rough: 0.36 };
const hash = (i) => { const v = Math.sin(i * 127.1 + 31.7) * 43758.5453; return v - Math.floor(v); };

/** rim profile: ridges = number of reeds (0 = smooth); clip 0..1 = how much was shaved off (irregular bites);
 *  shaved = [a0, a1] an arc (radians) filed flat (the reeds vanish there) */
export function coinGeometry({ r = 0.1, h = 0.012, ridges = 0, depth = 0.025, clip = 0, seed = 1, shaved = null, seg } = {}) {
  seg = seg || (ridges ? ridges * 6 : 96);
  const g = new THREE.CylinderGeometry(r, r, h, seg, 1, false);
  const pos = g.attributes.position, uv = g.attributes.uv;
  const bites = Array.from({ length: 7 }, (_, i) => [hash(seed * 13 + i) * TAU, 0.25 + hash(seed * 7 + i) * 0.55, 0.3 + hash(seed * 3 + i) * 0.7]);
  const f = (a) => {
    let k = 1;
    if (ridges) { const s = Math.cos(a * ridges); k -= depth * (s > 0 ? 1 : 0.15); }
    if (clip) for (const [c, w, d] of bites) { const x = Math.atan2(Math.sin(a - c), Math.cos(a - c)) / w; if (Math.abs(x) < 1) k = Math.min(k, 1 - clip * d * 0.32 * Math.cos(x * PI / 2)); }
    if (shaved) { const x = Math.atan2(Math.sin(a - shaved[0]), Math.cos(a - shaved[0])); if (x >= 0 && x <= shaved[1] - shaved[0]) k = Math.min(k, 1 - depth * 1.3); }
    return k;
  };
  // index ranges: torso first (seg+1)*2 verts, then the two caps (center + rim rings)
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const rr = Math.hypot(v.x, v.z);
    if (rr < r * 0.5) continue;
    const a = Math.atan2(v.x, v.z), k = f(a);
    pos.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  // cap UVs from position so the painted face keeps its scale and is cut off where the rim was clipped
  const torso = (seg + 1) * 2;
  for (let i = torso; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    uv.setXY(i, 0.5 + v.x / (2 * r) * (v.y > 0 ? 1 : -1), 0.5 - v.z / (2 * r));
  }
  pos.needsUpdate = uv.needsUpdate = true; g.computeVertexNormals();
  return g;
}

/** painted coin faces. kind: 'shilling' (1696 milled), 'hammered' (old, clipped), 'quarter', 'dime', 'penny';
 *  side: 'obv' | 'rev'. Generic designs (no real die copied). */
export function coinFaceTex(kind, side = 'obv') {
  return ctex(`coin-${kind}-${side}`, 512, 512, (g, rr, W) => {
    const c = W / 2, copper = kind === 'penny';
    const base = copper ? '#c47a4a' : '#c9cdd3', lt = copper ? '#e9a676' : '#f1f3f6', dk = copper ? '#8a4c2c' : '#868c96';
    g.fillStyle = base; g.fillRect(0, 0, W, W);
    const gr = g.createRadialGradient(c * 0.7, c * 0.65, 0, c, c, c);
    gr.addColorStop(0, lt); gr.addColorStop(0.65, base); gr.addColorStop(1, dk);
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, c, 0, TAU); g.fill();
    g.strokeStyle = dk; g.lineWidth = 10; g.beginPath(); g.arc(c, c, c * 0.9, 0, TAU); g.stroke();
    if (kind === 'shilling' || kind === 'hammered') { g.setLineDash([3, 9]); g.lineWidth = 8; g.beginPath(); g.arc(c, c, c * 0.95, 0, TAU); g.stroke(); g.setLineDash([]); }
    g.fillStyle = dk; g.strokeStyle = dk; g.lineCap = 'round'; g.lineJoin = 'round';
    const legend = (txt, rad, size, start = -PI * 0.92, span = PI * 1.84) => {
      g.font = `bold ${size}px Georgia, serif`; g.textAlign = 'center';
      [...txt].forEach((ch, i) => { const a = start + (span * (i + 0.5)) / txt.length; g.save(); g.translate(c + Math.cos(a - PI / 2) * rad, c + Math.sin(a - PI / 2) * rad); g.rotate(a); g.fillText(ch, 0, size * 0.35); g.restore(); });
    };
    const bust = (s, wig) => {   // a filled profile bust facing right (raised relief: dark fill + a light rim)
      const P = (x, y) => [c + x * c * s, c + y * c * s];
      const pts = [[-0.3, 0.62], [-0.34, 0.1], [-0.3, -0.22], [-0.12, -0.42], [0.1, -0.42], [0.24, -0.26], [0.26, -0.1], [0.38, 0.04],
        [0.27, 0.08], [0.29, 0.16], [0.26, 0.2], [0.27, 0.28], [0.16, 0.36], [0.12, 0.62]];
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(...P(x, y)) : g.moveTo(...P(x, y)))); g.closePath();
      g.fillStyle = dk; g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1; g.lineWidth = 6; g.strokeStyle = lt; g.stroke();
      g.beginPath(); g.arc(...P(0.08, -0.06), c * 0.04 * s, 0, TAU); g.fillStyle = lt; g.fill();
      g.fillStyle = dk;
      if (wig) for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(...P(-0.22 + (i % 2) * 0.06, -0.3 + i * 0.1), c * 0.075 * s, 0, TAU); g.globalAlpha = 0.7; g.fill(); g.globalAlpha = 1; g.strokeStyle = lt; g.lineWidth = 4; g.stroke(); }
      else { g.strokeStyle = lt; g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(...P(-0.05, -0.12), c * (0.16 + i * 0.06) * s, PI * 1.05, PI * 1.6); g.stroke(); } }
    };
    if (kind === 'shilling' && side === 'obv') { bust(1, true); legend('GVLIELMVS·III·DEI·GRA·', c * 0.76, 46); }
    else if (kind === 'shilling') {
      for (let i = 0; i < 4; i++) { g.save(); g.translate(c, c); g.rotate(i * PI / 2); g.beginPath(); g.moveTo(-c * 0.16, -c * 0.2); g.lineTo(c * 0.16, -c * 0.2); g.lineTo(c * 0.16, -c * 0.52); g.quadraticCurveTo(0, -c * 0.62, -c * 0.16, -c * 0.52); g.closePath(); g.lineWidth = 10; g.stroke(); g.restore(); }
      legend('MAG·BR·FRA·ET·HIB·REX·1696·', c * 0.76, 40);
    } else if (kind === 'hammered') {
      g.lineWidth = 16; g.beginPath(); g.moveTo(c, c * 0.2); g.lineTo(c, c * 1.8); g.moveTo(c * 0.2, c); g.lineTo(c * 1.8, c); g.stroke();
      for (const [x, y] of [[0.6, 0.6], [1.4, 0.6], [0.6, 1.4], [1.4, 1.4]]) { g.beginPath(); g.arc(c * x, c * y, 16, 0, TAU); g.fill(); }
      legend('POSVI·DEVM·ADIVTOREM·MEVM·', c * 0.8, 44);
    } else if (side === 'obv') {
      bust(kind === 'dime' ? 0.9 : 1, false);
      legend('LIBERTY', c * 0.72, 54, -PI * 0.55, PI * 1.1);
      g.font = 'bold 54px Georgia, serif'; g.textAlign = 'center';
      g.fillText(kind === 'quarter' ? '1965' : kind === 'dime' ? '1998' : '2004', c, c * 1.78);
    } else {
      g.lineWidth = 12; g.beginPath(); g.moveTo(c, c * 0.55); g.lineTo(c, c * 1.4); g.stroke();
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(c, c * 0.85); g.quadraticCurveTo(c + s * c * 0.35, c * 0.45, c + s * c * 0.62, c * 0.72); g.quadraticCurveTo(c + s * c * 0.38, c * 0.98, c, c * 1.1); g.stroke(); }
      legend(kind === 'quarter' ? 'QUARTER·DOLLAR' : kind === 'dime' ? 'ONE·DIME' : 'ONE·CENT', c * 0.74, 48, PI * 0.65, PI * 0.7);
    }
  });
}

/** edge paint: silver, copper, or the clad sandwich (silver / copper core / silver) of a modern quarter */
export function edgeMat(kind) {
  if (kind === 'clad') return toonMetal(ctex('coinEdgeClad', 16, 64, (g, r, W, H) => {
    g.fillStyle = '#c9cdd3'; g.fillRect(0, 0, W, H); g.fillStyle = '#c8783f'; g.fillRect(0, H * 0.36, W, H * 0.28);
  }), EDGE);
  return toonMetal(kind === 'copper' ? '#b8703f' : '#bfc4cb', EDGE);
}

/** a whole coin: {g (group), mesh, setFace(kind)}; lies flat (axis +y) unless rotated */
export function makeCoin({ r = 0.1, h = 0.012, kind = 'shilling', ridges = 0, clip = 0, seed = 1, edge = 'silver', shaved = null } = {}) {
  const geo = coinGeometry({ r, h, ridges, clip, seed, shaved });
  const mats = [edgeMat(edge), toonMetal(coinFaceTex(kind, 'obv'), FACE), toonMetal(coinFaceTex(kind, 'rev'), FACE)];
  const mesh = new THREE.Mesh(geo, mats); mesh.castShadow = mesh.receiveShadow = true;
  const g = new THREE.Group(); g.add(mesh);
  return { g, mesh, mats };
}

/** instanced silver slivers (clipped-off crescents): set(i, x, y, z, rx, ry, rz, s) then commit() */
export function makeShavings(n, { r = 0.05, color = '#d5d9df' } = {}) {
  const geo = new THREE.TorusGeometry(r, r * 0.12, 3, 10, 1.5); geo.scale(1, 1, 0.35);
  const m = new THREE.InstancedMesh(geo, toonMetal(color, { rough: 0.4 }), n); m.castShadow = m.receiveShadow = true;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3();
  m.count = 0;
  return {
    mesh: m,
    begin() { m.count = 0; },
    add(x, y, z, rx, ry, rz, s = 1) { if (m.count >= n) return; Q.setFromEuler(E.set(rx, ry, rz)); m.setMatrixAt(m.count++, M.compose(P.set(x, y, z), Q, S.setScalar(s))); },
    commit() { m.instanceMatrix.needsUpdate = true; },
  };
}

/** a heap of silver shavings: a lumpy cone with a painted crescent texture; scale it to grow (1 = 1 m tall) */
export function makeHeap({ radius = 1.3, seed = 3 } = {}) {
  const pts = [];
  for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push(new THREE.Vector2(radius * Math.pow(1 - u, 0.8) * (1 + 0.05 * Math.sin(i * 2.3 + seed)) + 0.001 * i, u)); }
  pts[14].x = 0.02;
  const geo = new THREE.LatheGeometry(pts, 40);
  const tex = ctex('heap' + seed, 512, 512, (g, rr, W, H) => {
    g.fillStyle = '#b7bcc4'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 700; i++) {
      const x = rr() * W, y = rr() * H, s = 6 + rr() * 16, a = rr() * TAU;
      g.strokeStyle = rr() < 0.35 ? '#f4f6f8' : rr() < 0.6 ? '#8d939c' : '#d3d7dd'; g.lineWidth = 2 + rr() * 3;
      g.beginPath(); g.arc(x, y, s, a, a + 1.6); g.stroke();
    }
  }, [4, 2]);
  const mesh = new THREE.Mesh(geo, toonMetal(tex, { rough: 0.5 })); mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** a coin button (for the "size of a button" comparison): a dark wood disc with four holes */
export function makeButton(r = 0.012) {
  const tex = ctex('button', 128, 128, (g, rr, W) => {
    g.fillStyle = '#d9a440'; g.fillRect(0, 0, W, W); g.fillStyle = '#7a5418';
    for (const [x, y] of [[0.4, 0.4], [0.6, 0.4], [0.4, 0.6], [0.6, 0.6]]) { g.beginPath(); g.arc(W * x, W * y, W * 0.06, 0, TAU); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, W / 2, W * 0.42, 0, TAU); g.stroke();
  });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.3, 32), [toonMetal('#b8862e', { rough: 0.32 }), toonMetal(tex, { rough: 0.36 }), toonMetal(tex, { rough: 0.36 })]);
  m.castShadow = true; return m;
}
