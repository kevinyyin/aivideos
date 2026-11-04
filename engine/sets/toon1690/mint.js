// The Royal Mint inside the Tower of London, 1696, toon look (dh013): a stone hall with arched windows and great double
// doors at the back (doors.L/R hinge groups; the doorway shows a bright courtyard), a screw press (press.screw descends
// as press.bar swings), a brick furnace with a glowing crucible, a big balance (scale.beam tilts; pans hang level), sacks
// + crates of old coins, workbenches, a royal banner. Local: doors at z = -6, camera usually at z > 0 looking -z.
import * as THREE from 'three';
import { toonMat, toonMetal } from '@engine/toon/shade.js';
import { ctex, wood, fitText } from '@engine/toon/paint.js';
import { box, cyl, plane, ball, sun, glow, lamp } from '@engine/toon/kit.js';
import { makeGlow, makeShafts } from '@engine/toon/light.js';

import { stone, brick, plank, daySky } from './paint1690.js';

const PI = Math.PI;
export const PRESS_UP = 1.11, PRESS_DOWN = 0.91;
export const MINT = { press: [-2.2, -2.4], furnace: [3.0, -3.6], scale: [0.4, -0.2], doors: -6 };

export function buildMint(root) {
  const wallM = toonMat(stone('#a39d92', [4, 2])), dark = toonMat('#2e2620'), iron = toonMetal('#4a4e56', { rough: 0.5 }), woodM = toonMat(plank('#6a4a32'));
  const fl = plane(root, 12, 10, toonMat(stone('#8f877c', [5, 4])), 0, 0, -1.5); fl.rotation.x = -PI / 2;
  // back wall with the doorway (x -1.1..1.1, y 0..3.3), side walls, vaulted ceiling beams
  box(root, 4.9, 5, 0.4, wallM, -3.55, 2.5, -6.2); box(root, 4.9, 5, 0.4, wallM, 3.55, 2.5, -6.2); box(root, 2.2, 1.7, 0.4, wallM, 0, 4.15, -6.2);
  for (const s of [-1, 1]) box(root, 0.4, 5, 10, wallM, s * 6, 2.5, -1.5);
  box(root, 12, 0.2, 10, toonMat(plank('#4a3426', [4, 4])), 0, 5.0, -1.5).castShadow = false;
  for (let i = 0; i < 5; i++) box(root, 12, 0.3, 0.3, woodM, 0, 4.75, -5.5 + i * 2.1).castShadow = false;
  const yard = plane(root, 6, 5, new THREE.MeshBasicMaterial({ map: ctex('mintYard', 256, 256, (g, r, W, H) => {
    g.drawImage(daySky().image, 0, 0, W, H * 0.6); g.fillStyle = '#d8cdb8'; g.fillRect(0, H * 0.45, W, H * 0.55);
    g.fillStyle = '#b9ad98'; g.fillRect(W * 0.1, H * 0.2, W * 0.35, H * 0.3); g.fillRect(W * 0.55, H * 0.15, W * 0.3, H * 0.35);
    for (let x = W * 0.1; x < W * 0.45; x += 18) g.fillRect(x, H * 0.16, 10, 12);
  }), color: new THREE.Color(1.6, 1.55, 1.42) }), 0, 2.2, -7.6);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.16, 8, 24, PI), wallM); arch.position.set(0, 3.3, -6.0); root.add(arch);
  const doors = {};
  for (const s of [-1, 1]) {
    const h = new THREE.Group(); h.position.set(s * 1.1, 0, -6.0); root.add(h);
    box(h, 1.1, 3.3, 0.12, toonMat(plank('#5a3a24', [1, 2])), -s * 0.55, 1.65, 0);
    for (const y of [0.6, 1.65, 2.7]) box(h, 1.1, 0.1, 0.04, iron, -s * 0.55, y, 0.08);
    ball(h, 0.05, iron, -s * 0.95, 1.6, 0.1, 10);
    doors[s < 0 ? 'L' : 'R'] = h;
  }
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 7), new THREE.MeshBasicMaterial({ color: 0xfff1cf, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  shaft.rotation.x = -PI / 2 + 0.25; shaft.position.set(0, 0.25, -2.6); root.add(shaft);
  // arched windows on the left wall with light shafts' source; a royal banner on the right
  for (const z of [-4.2, -1.2, 1.6]) {
    plane(root, 1.0, 1.6, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.1, 1.85) }), -5.79, 3.0, z).rotation.y = PI / 2;
    const a = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 6, 16, PI), wallM); a.position.set(-5.78, 3.8, z); a.rotation.y = PI / 2; root.add(a);
    box(root, 0.1, 0.08, 1.0, dark, -5.76, 3.0, z); box(root, 0.1, 1.6, 0.06, dark, -5.76, 3.0, z);
  }
  plane(root, 1.4, 2.4, toonMat(ctex('mintBanner', 256, 440, (g, r, W, H) => {
    g.fillStyle = '#a8303a'; g.fillRect(0, 0, W, H); g.fillStyle = '#e3b24f';
    g.beginPath(); g.moveTo(0, H); g.lineTo(W / 2, H - 50); g.lineTo(W, H); g.fill(); g.fillStyle = '#a8303a'; g.fillRect(0, H - 4, W, 4);
    g.fillStyle = '#e3b24f'; g.beginPath(); g.moveTo(W * 0.3, H * 0.3); g.lineTo(W * 0.38, H * 0.18); g.lineTo(W * 0.5, H * 0.26); g.lineTo(W * 0.62, H * 0.18); g.lineTo(W * 0.7, H * 0.3); g.closePath(); g.fill();
    g.fillRect(W * 0.3, H * 0.3, W * 0.4, 24); g.textAlign = 'center'; fitText(g, 'ROYAL MINT', W / 2, H * 0.55, W - 40, 40, 'bold', 'Georgia, serif');
    g.font = 'bold 30px Georgia, serif'; g.fillText('1696', W / 2, H * 0.66);
  })), 5.79, 3.0, -2.8).rotation.y = -PI / 2;
  // the screw press: two posts, a crosshead, a big screw, a swinging bar with iron balls, the anvil die
  const press = new THREE.Group(); press.position.set(MINT.press[0], 0, MINT.press[1]); root.add(press);
  box(press, 1.4, 0.5, 0.8, toonMat('#5a4a3e'), 0, 0.25, 0, 0.04);
  // ram centre = screw.position.y (PRESS_UP 1.11 .. PRESS_DOWN 0.91 = ram face on the die); bar just above head height
  for (const s of [-1, 1]) box(press, 0.24, 1.1, 0.3, iron, s * 0.45, 1.05, 0, 0.03);
  box(press, 1.3, 0.28, 0.4, iron, 0, 1.6, 0, 0.04);
  cyl(press, 0.1, 0.1, 0.27, iron, 0, 0.635, 0, 16);
  const screw = new THREE.Group(); screw.position.y = PRESS_UP; press.add(screw);
  cyl(screw, 0.09, 0.09, 0.83, toonMat(ctex('thread', 32, 128, (g, r, W, H) => { g.fillStyle = '#5a5e66'; g.fillRect(0, 0, W, H); g.strokeStyle = '#2a2c30'; g.lineWidth = 6; for (let y = -W; y < H; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + W * 0.6); g.stroke(); } }, [3, 1])), 0, 0.535, 0, 16);
  cyl(screw, 0.14, 0.14, 0.24, iron, 0, 0, 0, 16);
  const bar = new THREE.Group(); bar.position.y = 0.6; screw.add(bar);
  cyl(bar, 0.04, 0.04, 3.2, iron, 0, 0, 0, 10).rotation.z = PI / 2;
  for (const s of [-1, 1]) ball(bar, 0.2, iron, s * 1.6, 0, 0, 18);
  // furnace + crucible + bellows + a coal heap
  const fur = new THREE.Group(); fur.position.set(MINT.furnace[0], 0, MINT.furnace[1]); root.add(fur);
  box(fur, 1.8, 1.4, 1.4, toonMat(brick('#8a4a38', [2, 2])), 0, 0.7, 0);
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.75, 3.6, 4), toonMat(brick('#7a4232', [2, 4]))); chimney.position.set(0, 3.2, -0.2); chimney.rotation.y = PI / 4; fur.add(chimney);
  box(fur, 0.9, 0.6, 0.1, new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.5, 0.4) }), 0, 0.55, 0.66).castShadow = false;
  const furGlow = glow(fur, '255,140,50', 2.4, 0, 0.6, 0.9, 0.85);
  const crucible = new THREE.Group(); crucible.position.set(0, 1.4, 0.2); fur.add(crucible);
  cyl(crucible, 0.28, 0.2, 0.4, toonMat('#4a4040'), 0, 0.2, 0, 18);
  const melt = cyl(crucible, 0.25, 0.25, 0.02, new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 2.0, 0.7) }), 0, 0.39, 0, 18); melt.castShadow = false;
  const meltGlow = glow(crucible, '255,170,80', 1.2, 0, 0.5, 0, 0.8);
  const coal = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.4, 10), toonMat('#26262a')); coal.position.set(-1.2, 0.2, 0.5); coal.castShadow = true; fur.add(coal);
  // the big balance: post, beam (pivot), two pans on chains
  const scale = new THREE.Group(); scale.position.set(MINT.scale[0], 0, MINT.scale[1]); root.add(scale);
  const brass = toonMetal('#c79a4a', { rough: 0.3 });
  box(scale, 0.6, 0.1, 0.4, woodM, 0, 0.9, 0); box(scale, 1.6, 0.9, 0.6, toonMat(wood('#7a4a2e', { boards: 3 })), 0, 0.45, 0);
  cyl(scale, 0.05, 0.06, 1.1, brass, 0, 1.5, 0, 12);
  const beam = new THREE.Group(); beam.position.y = 2.05; scale.add(beam);
  box(beam, 1.5, 0.06, 0.06, brass, 0, 0, 0); ball(beam, 0.07, brass, 0, 0, 0, 12);
  const pans = [-1, 1].map((s) => {
    const hang = new THREE.Group(); hang.position.x = s * 0.7; beam.add(hang);
    for (const a of [0, 2.1, 4.2]) { const ch = cyl(hang, 0.006, 0.006, 0.62, brass, Math.cos(a) * 0.12, -0.31, Math.sin(a) * 0.12, 4); ch.rotation.z = Math.cos(a) * -0.18; ch.rotation.x = Math.sin(a) * 0.18; }
    cyl(hang, 0.22, 0.16, 0.06, brass, 0, -0.64, 0, 20);
    return hang;
  });
  const sack = new THREE.Group(); pans[0].add(sack); sack.position.y = -0.6;
  const sb = ball(sack, 0.19, toonMat('#b29468'), 0, 0.18, 0, 16); sb.scale.set(1, 1.1, 1);
  box(sack, 0.06, 0.08, 0.06, dark, 0, 0.39, 0);
  for (let i = 0; i < 4; i++) cyl(pans[1], 0.07 - i * 0.012, 0.075 - i * 0.012, 0.07, brass, 0, -0.57 + i * 0.07, 0, 14);
  // sacks + crates of old coins, workbench with tools, tool rack
  for (let i = 0; i < 6; i++) { const b = ball(root, 0.25, toonMat(['#b29468', '#a88a5a', '#c2a578'][i % 3]), -4.6 + (i % 3) * 0.5, 0.22, -4.9 + Math.floor(i / 3) * 0.55, 14); b.scale.set(1, 0.85, 1); }
  for (let i = 0; i < 3; i++) box(root, 0.8, 0.5, 0.6, toonMat(plank('#9a6a40')), 4.6, 0.25 + i * 0.5, -0.4 - (i === 2 ? 0 : i) * 0.05);
  box(root, 2.2, 0.08, 0.8, toonMat(wood('#8a5a38', { boards: 2 })), -4.4, 0.92, 0.6);
  for (const sx of [-1, 1]) box(root, 0.08, 0.9, 0.7, dark, -4.4 + sx * 1.0, 0.45, 0.6);
  for (let i = 0; i < 5; i++) { const tl = box(root, 0.05, 0.5 - (i % 2) * 0.15, 0.05, iron, -5.75, 2.0, -2.0 + i * 0.25); tl.rotation.x = 0.1 * (i - 2); }
  const key = sun(root, [-5.3, 4.4, 2.6], [0, 1, -2.5], { half: 6.5, map: 4096, color: 0xfff0d8, hemi: [0xc8d6f0, 0x8a7a68, 0.8] });
  const shafts = [-4.2, -1.2, 1.6].map((z, i) => { makeGlow(root, { x: -5.6, y: 3.0, z, size: 2.4, intensity: 0.4, color: 0xfff0d6 }); return makeShafts(root, { from: [-5.7, 3.5, z], dir: [1, -0.72, 0.18], n: 3, spread: 0.8, w: 0.32, len: 5.5, opacity: 0.09, seed: i + 2 }); });
  lamp(root, 0xff8a3a, 4.5, 6.5, MINT.furnace[0], 2.0, MINT.furnace[1] + 0.4);
  lamp(root, 0xff7a2a, 2.6, 4, MINT.furnace[0], 0.6, MINT.furnace[1] + 0.95);
  const doorLamp = lamp(root, 0xfff0d8, 0, 9, 0, 2.2, -5.4), doorGlow = makeGlow(root, { x: 0, y: 1.8, z: -6.5, size: 4.5, intensity: 0, color: 0xfff2dc });
  return { root, sun: key, doors, shaft, shafts, doorLamp, doorGlow, fog: new THREE.Fog(0xe9dfcc, 7, 26), press: { g: press, screw, bar }, furnace: { g: fur, crucible, melt, glow: furGlow, meltGlow }, scale: { g: scale, beam, pans }, bg: new THREE.Color('#2a2622') };
}
