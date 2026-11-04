// Lighting moods for the toon look: one preset keeps the sky, the light colours, the reflections, the haze and the
// floating dust in agreement, so every shot has one clear light idea: candle-warm vs cool shadow, blue
// moonlight, a pink sunset with rays.
// Plain data, use what you need per shot:
//   setTone(M.tone); post.grade.set(M.grade); scene.environment = makeEnv(renderer, M.env) (once per mood);
//   makeSky(root, M.sky); scene.fog = new THREE.Fog(M.fog, near, far); makeMotes(root, { ...M.motes, box });
// Tested in videos/lt001-look-test (shots E sunset, F night) and the interiors A-D.
import { GRADE_RICH, GRADE_NIGHT } from './grade.js';

export const MOOD = {
  /** warm lamp / window interior: warm key, violet shadows, a warm-grey room for metals to reflect */
  interior: {
    tone: { lit: [1.48, 1.26, 0.98], shade: [0.42, 0.42, 0.66], sat: 0.95, term: 0.25, lambert: 0.4, rim: [0.1, 0.09, 0.13] },
    env: { top: '#4a4458', horizon: '#c49a74', ground: '#3a2c2a', lights: [{ dir: [-1, 1, 0.6], color: '#ffe0b0', intensity: 5, size: 4 }, { dir: [1, 0.6, 1], color: '#b8c8ff', intensity: 1.2, size: 5 }] },
    motes: { color: 0xffe2b0, intensity: 1.8, size: 0.01 },
    grade: GRADE_RICH,
  },
  /** clear day: blue sky, white clouds with cool undersides, crisp sun */
  day: {
    tone: { lit: [1.42, 1.34, 1.18], shade: [0.48, 0.56, 0.84], sat: 0.98, term: 0.2, lambert: 0.35, rim: [0.16, 0.18, 0.24] },
    sky: { top: '#3f84d6', mid: '#86bbe9', horizon: '#eef1ea', ground: '#b9c7b0', haze: 0.18, sun: { dir: [0.5, 0.6, -0.6], color: '#fff6e0', size: 0.035, hdr: 3, glow: 0.25, glowW: 8 },
      clouds: { top: '#ffffff', bottom: '#d9e3f0', rim: 'rgba(255,255,255,0.6)', n: 7, el: [6, 28] } },
    env: { top: '#5a98e0', horizon: '#eef0ea', ground: '#7a8a5a', lights: [{ dir: [0.5, 0.6, -0.6], color: '#fff2d8', intensity: 8, size: 2 }] },
    fog: 0xcfe0ee, motes: { color: 0xfff6dc, intensity: 1.2, size: 0.01 },
    grade: GRADE_RICH,
  },
  /** low sun behind the subject: pink-orange sky with rays, violet shadows, glowing rims */
  sunset: {
    tone: { lit: [1.6, 1.1, 0.76], shade: [0.3, 0.2, 0.46], sat: 0.72, term: 0.25, lambert: 0.4, rim: [1.0, 0.6, 0.38],
      charTint: [1.04, 0.92, 0.88], charShade: 0.66, charGain: 1.0 },
    sky: { top: '#b8668a', mid: '#ee9488', horizon: '#ffd48e', ground: '#7a4a5a', midH: 0.22, haze: 0.12,
      sun: { dir: [0.12, 0.17, -1], color: '#fff2c6', size: 0.11, hdr: 2.6, glow: 0.32, glowW: 6, rays: 0.18, rayN: 22 },
      clouds: { top: '#9a7cb4', bottom: '#f6c9aa', rim: 'rgba(255,236,206,0.95)', n: 6, el: [14, 36], az: [-40, 40] } },
    env: { top: '#6a58a8', horizon: '#ffb98a', ground: '#4a2e3e', lights: [{ dir: [0.18, 0.1, -1], color: '#ffd9a0', intensity: 9, size: 3 }] },
    fog: 0xd7909a, motes: { color: 0xffcf98, intensity: 2.2, size: 0.012, rise: 0.06 },
    grade: GRADE_RICH,
  },
  /** moonlit night: blue key from the moon, deep blue shadows, stars, warm fireflies / lamps for contrast */
  night: {
    tone: { lit: [0.56, 0.7, 1.32], shade: [0.14, 0.17, 0.44], sat: 0.55, term: 0.25, lambert: 0.4, rim: [0.32, 0.42, 0.85],
      charTint: [0.82, 0.86, 1.1], charShade: 0.6, charGain: 0.95 },
    sky: { top: '#0f1c4c', mid: '#23408a', horizon: '#4a62a8', ground: '#1a2240', midH: 0.3, haze: 0.12, stars: 0.11,
      sun: { dir: [-0.12, 0.36, -1], color: '#f2f4ff', size: 0.04, hdr: 2.4, glow: 0.22, glowW: 60, rays: 0 },
      clouds: { top: '#34498e', bottom: '#5c74ba', rim: 'rgba(190,205,255,0.7)', n: 3, el: [10, 24], az: [15, 75], brightness: 0.85 } },
    env: { top: '#2a3c78', horizon: '#6a7cbc', ground: '#151c34', lights: [{ dir: [-0.12, 0.4, -1], color: '#d8e2ff', intensity: 7, size: 2.5 }, { dir: [1, 0.2, 0.4], color: '#ffc070', intensity: 4, size: 1.5 }] },
    fog: 0x1e2c5a, motes: { color: 0xffe27a, intensity: 3.5, size: 0.022, rise: 0.02, opacity: 0.9 },
    grade: GRADE_NIGHT,
  },
};
