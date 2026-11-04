// Switch a studio (engine/core.js createStudio) to the toon post chain, per video, without changing any default:
//   render -> NaN guard -> ink (world outlines) -> lens blur (DOF) -> whip blur (off until a whip pan sets it,
//   whip.js) -> bloom (HDR emissives only) -> Neutral tone map + sRGB (OutputPass) -> grade.  Ink runs before the blur
//   so the lines soften with the background.
// The studio's own grain / lift / vignette pass is dropped (the reference has no grain).
import * as THREE from 'three';
import { InkPass } from './ink.js';
import { LensBlurPass } from './lensblur.js';
import { GradePass, GRADE_DAY } from './grade.js';
import { WhipBlurPass } from './whip.js';

export function toonPost(studio, { ink: inkOpts = {}, lens: lensOpts = {}, grade: gradeP = GRADE_DAY, bloom: bloomOpts = {}, exposure = 1.0 } = {}) {
  const { renderer, scene, camera, composer, bloom } = studio;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = exposure;
  const [render, guard, , output] = composer.passes;   // createStudio order: render, guard, bloom, output, grade
  const ink = new InkPass(scene, camera, inkOpts);
  const lens = new LensBlurPass(ink, camera, lensOpts);
  const grade = new GradePass(gradeP);
  const whip = new WhipBlurPass();
  bloom.threshold = bloomOpts.threshold ?? 1.0; bloom.strength = bloomOpts.strength ?? 0.5; bloom.radius = bloomOpts.radius ?? 0.6;
  composer.passes.length = 0;
  for (const p of [render, guard, ink, lens, whip, bloom, output, grade]) composer.addPass(p);
  return { ink, lens, grade, whip };
}
