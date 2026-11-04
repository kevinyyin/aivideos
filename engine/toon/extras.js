// Small additions for the toon look (dh014), all new: hats + a mustache for cards.js people (drawToon `extra`),
// cartoon dust / smoke puffs (camera-facing sprites with an ink outline) and a zoom-dissolve between places.
import * as THREE from 'three';
import { NOINK } from './ink.js';
import { INK } from './cards.js';
import { ctex, fitText } from './paint.js';

const HX = 300, HY = 215, R = 148, TAU = Math.PI * 2;
const sh = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
function ink(g, w, col = INK) { g.lineWidth = w; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }

/** drawToon extra: a period slouch hat (brim pinned up on the left, plain band, no badge) */
export const slouchHat = (col = '#a08b5e', band = '#4a3c2a') => (g) => {
  const y = HY - R * 0.62;
  g.beginPath(); g.ellipse(HX, y + 10, R * 1.5, R * 0.26, 0, 0, TAU); g.fillStyle = sh(col, 0.9); g.fill(); ink(g, 9);
  g.beginPath(); g.moveTo(HX - R * 1.45, y + 4); g.quadraticCurveTo(HX - R * 1.62, y - R * 0.95, HX - R * 0.55, y - R * 0.55); g.lineTo(HX - R * 0.35, y + 6); g.closePath();
  g.fillStyle = sh(col, 0.82); g.fill(); ink(g, 8);
  g.beginPath(); g.moveTo(HX - R * 0.86, y + 6); g.bezierCurveTo(HX - R * 0.95, y - R * 0.95, HX + R * 0.95, y - R * 0.95, HX + R * 0.86, y + 6); g.closePath();
  const gr = g.createLinearGradient(HX - R, 0, HX + R, 0); gr.addColorStop(0, sh(col, 1.08)); gr.addColorStop(1, sh(col, 0.8));
  g.fillStyle = gr; g.fill(); ink(g, 9);
  g.beginPath(); g.moveTo(HX - R * 0.88, y - 6); g.quadraticCurveTo(HX, y + 6, HX + R * 0.88, y - 6); g.lineTo(HX + R * 0.9, y - R * 0.24); g.quadraticCurveTo(HX, y - R * 0.14, HX - R * 0.9, y - R * 0.24); g.closePath();
  g.fillStyle = band; g.fill(); ink(g, 6);
  g.beginPath(); g.moveTo(HX - 10, y - R * 0.7); g.quadraticCurveTo(HX, y - R * 0.58, HX + 10, y - R * 0.7); ink(g, 5, sh(col, 0.6));   // crown pinch
};
/** drawToon extra: a wide straw farm hat */
export const strawHat = (col = '#e2c27a', band = '#8a3f2c') => (g) => {
  const y = HY - R * 0.6;
  g.beginPath(); g.ellipse(HX, y + 8, R * 1.6, R * 0.3, 0, 0, TAU); g.fillStyle = sh(col, 0.92); g.fill(); ink(g, 9);
  g.save(); g.clip(); g.strokeStyle = sh(col, 0.72); g.lineWidth = 4;
  for (let a = 0; a < TAU; a += 0.35) { g.beginPath(); g.moveTo(HX, y + 8); g.lineTo(HX + Math.cos(a) * R * 1.7, y + 8 + Math.sin(a) * R * 0.34); g.stroke(); }
  g.restore();
  g.beginPath(); g.moveTo(HX - R * 0.8, y + 4); g.lineTo(HX - R * 0.7, y - R * 0.62); g.quadraticCurveTo(HX, y - R * 0.8, HX + R * 0.7, y - R * 0.62); g.lineTo(HX + R * 0.8, y + 4); g.closePath();
  g.fillStyle = col; g.fill(); ink(g, 9);
  g.beginPath(); g.rect(HX - R * 0.78, y - R * 0.2, R * 1.56, R * 0.2); g.fillStyle = band; g.fill(); ink(g, 5);
};
/** drawToon extra: a bushy moustache over the mouth */
export const mustache = (col = '#3a2a1e', big = 1) => (g) => {
  const y = HY + 50;
  g.beginPath(); g.moveTo(HX, y - 6);
  g.bezierCurveTo(HX - 30 * big, y - 22, HX - 70 * big, y - 8, HX - 82 * big, y + 16);
  g.bezierCurveTo(HX - 60 * big, y + 8, HX - 30 * big, y + 20, HX, y + 10);
  g.bezierCurveTo(HX + 30 * big, y + 20, HX + 60 * big, y + 8, HX + 82 * big, y + 16);
  g.bezierCurveTo(HX + 70 * big, y - 8, HX + 30 * big, y - 22, HX, y - 6);
  g.closePath(); g.fillStyle = col; g.fill(); ink(g, 6);
};
/** chain several extras (drawToon takes one) */
export const extras = (...fns) => (g) => { for (const f of fns) if (f) f(g); };

// ---------------------------------------------------------------- dust / smoke puffs
function puffTex(col) {
  return ctex('puff' + col, 256, 256, (g, r, W) => {
    const blobs = [[128, 140, 70], [80, 150, 50], [176, 150, 52], [104, 104, 48], [156, 102, 46], [128, 176, 50]];
    g.beginPath(); for (const [x, y, rr] of blobs) { g.moveTo(x + rr, y); g.arc(x, y, rr, 0, TAU); }
    g.lineWidth = 16; g.strokeStyle = INK; g.stroke();
    g.fillStyle = col; for (const [x, y, rr] of blobs) { g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(104, 98, 22, 0, TAU); g.fill();
    g.fillStyle = 'rgba(80,60,40,0.12)'; g.beginPath(); g.arc(140, 186, 40, 0, TAU); g.fill();
  });
}
/** a pool of cartoon puffs: begin(), burst(t, t0, [x,y,z], {n, size, spread, rise, dur, seed, col}), end() */
export function makePuffs(parent, n = 80) {
  const pool = [], mats = new Map();
  const matFor = (col) => {
    if (!mats.has(col)) { const t = puffTex(col); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; mats.set(col, t); }
    return mats.get(col);
  };
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: matFor('#efe3cc'), transparent: true, alphaTest: 0.02, depthWrite: false }));
    s.layers.set(NOINK); s.visible = false; s.renderOrder = 3; parent.add(s); pool.push(s);
  }
  let used = 0;
  const h = (i) => { const v = Math.sin(i * 127.1 + 31.7) * 43758.5453; return v - Math.floor(v); };
  return {
    begin() { used = 0; },
    burst(t, t0, [x, y, z], { n: k = 8, size = 0.6, spread = 0.8, rise = 0.6, dur = 1.0, seed = 1, col = '#efe3cc', opacity = 1 } = {}) {
      const u = (t - t0) / dur;
      if (u < 0 || u > 1) return;
      for (let i = 0; i < k && used < pool.length; i++) {
        const sp = pool[used++], a = h(seed * 13 + i) * TAU, rr = spread * (0.4 + 0.6 * h(seed * 7 + i * 3));
        const e = 1 - (1 - u) ** 3;
        sp.material.map = matFor(col);
        sp.position.set(x + Math.cos(a) * rr * e, y + rise * e * (0.6 + 0.6 * h(i + seed)) + size * 0.3, z + Math.sin(a) * rr * e * 0.6);
        const sc = size * (0.55 + 0.6 * h(seed + i * 5)) * (u < 0.15 ? u / 0.15 : 1) * (1 - 0.5 * Math.max(0, u - 0.6) / 0.4);
        sp.scale.set(sc, sc, 1); sp.material.opacity = opacity * (u > 0.7 ? 1 - (u - 0.7) / 0.3 : 1);
        sp.material.rotation = h(i * 11 + seed) * TAU; sp.visible = true;
      }
    },
    end() { for (let i = used; i < pool.length; i++) pool[i].visible = false; },
  };
}

// ---------------------------------------------------------------- zoom-dissolve between places
/** Overlay canvas over the WebGL canvas (under the text). In update(t), during a transition: render the OUTGOING
 *  shot first (studio.render), grab() it, then set up the incoming shot normally and show(opacity, scale). */
export function makeZoomDissolve(studio) {
  const src = studio.renderer.domElement;
  const cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
  cv.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;opacity:0;transform-origin:50% 46%;';
  src.parentNode.insertBefore(cv, src.nextSibling);
  const g = cv.getContext('2d');
  return {
    grab() { if (cv.width !== src.width || cv.height !== src.height) { cv.width = src.width; cv.height = src.height; } g.drawImage(src, 0, 0); },
    show(opacity, scale = 1) { cv.style.opacity = String(opacity); cv.style.transform = `scale(${scale})`; },
  };
}

/** a floating label / callout (dh016's makeLabel, promoted): a rounded pill with one bold word or value ("spike",
 *  "<- 45 cm"), camera-facing, never inked, drawn over everything. at(worldPos, camera, px) places it and sizes it to
 *  `px` pixels tall on a 1920-tall frame at any distance. A child of an offset set root takes LOCAL coordinates. */
export function makeCallout(key, text, { fg = '#17121a', bg = 'rgba(255,250,238,0.95)', w = 512, h = 192, size = 120, border = '#17121a' } = {}) {
  const tex = ctex('callout' + key, w, h, (g, r, W, H) => {
    g.fillStyle = bg; g.beginPath(); g.roundRect(8, 8, W - 16, H - 16, H / 2 - 8); g.fill(); g.lineWidth = 12; g.strokeStyle = border; g.stroke();
    g.fillStyle = fg; g.textAlign = 'center'; fitText(g, text, W / 2, H / 2 + size * 0.36, W - 70, size, '900', 'Avenir Next, Arial, sans-serif');
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sprite.layers.set(NOINK); sprite.renderOrder = 20;
  const cam = new THREE.Vector3(), wp = new THREE.Vector3();
  return {
    sprite,
    at(pos, camera, px = 120) {
      sprite.position.set(...pos); sprite.updateMatrixWorld(true);
      const d = camera.getWorldPosition(cam).distanceTo(sprite.getWorldPosition(wp));
      const hm = (px / 1920) * 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      sprite.scale.set(hm * w / h, hm, 1);
    },
  };
}
