// Turns scroll position into a camera move, an object state, and a colour grade.
//
// The rhythm of every segment is hold -> move -> hold: the camera sits still
// while a paragraph is readable, then travels to the next mark. Transition
// effects (letterbox swell, aberration, a one-frame flash, a breath of splat
// scatter) peak in the middle of the move, where a cut would land.

import { mat4, lerp, lerp3, clamp, smoothstep, damp, catmullRom3, noise3 } from '../core/math.js';

const GROUP_KEYS = ['skin', 'veil', 'flower', 'mote', 'lips', 'eyes'];

const GRADE_SCALARS = [
  'exposure', 'contrast', 'saturation', 'vignette', 'grain',
  'bloomStrength', 'bloomThreshold', 'aberration', 'bleed',
  'letterbox', 'sequenceOpacity', 'sequenceScale',
];
const GRADE_VECTORS = ['lift', 'gain', 'bloomTint'];
const BACKDROP_VECTORS = ['top', 'bottom', 'glowColor'];

export class Director {
  constructor(chapters, { reducedMotion = false } = {}) {
    this.chapters = chapters;
    this.reducedMotion = reducedMotion;

    this.progress = 0;       // raw scroll, 0..1
    this.smoothT = 0;        // damped chapter-space position, 0..n-1
    this.targetT = 0;
    this.velocity = 0;
    this.activeIndex = 0;

    this.pointer = { x: 0, y: 0, sx: 0, sy: 0, active: false };

    this.view = mat4.create();
    this.proj = mat4.create();

    this.state = {
      view: this.view,
      proj: this.proj,
      eye: new Float32Array(3),
      target: new Float32Array(3),
      fov: 32,
      focusDist: 3,
      dofStrength: 2.2,
      dofMax: 8,
      dissolve: 0,
      breathe: 1,
      exposure: 1,
      lightDir: new Float32Array([0.6, 0.65, 0.55]),
      time: 0,
      width: 1,
      height: 1,
      focalX: 1,
      focalY: 1,
      groups: new Float32Array(6).fill(1),
      grade: {
        lift: new Float32Array(3),
        gain: new Float32Array(3),
        bloomTint: new Float32Array(3),
        flash: 0,
        fade: 0,
      },
      backdrop: {
        top: new Float32Array(3),
        bottom: new Float32Array(3),
        glowColor: new Float32Array(3),
        glowPos: new Float32Array(2),
        glowStrength: 0,
      },
      transition: 0,
      chapterWeights: new Float32Array(chapters.length),
    };

    this._eye = new Float32Array(3);
    this._target = new Float32Array(3);
    this._scratchA = new Float32Array(3);
    this._scratchB = new Float32Array(3);
    this._up = new Float32Array([0, 1, 0]);
  }

  setProgress(progress) {
    this.progress = clamp(progress, 0, 1);
    this.targetT = this.progress * (this.chapters.length - 1);
  }

  setPointer(x, y, active = true) {
    this.pointer.x = clamp(x, -1, 1);
    this.pointer.y = clamp(y, -1, 1);
    this.pointer.active = active;
  }

  at(index) {
    return this.chapters[clamp(index, 0, this.chapters.length - 1)];
  }

  update(dt, time) {
    const s = this.state;
    const previous = this.smoothT;

    // Camera lag: the frame follows the scroll rather than being welded to it.
    const rate = this.reducedMotion ? 0.0002 : 0.0022;
    this.smoothT = damp(this.smoothT, this.targetT, rate, dt);
    this.velocity = dt > 0 ? (this.smoothT - previous) / dt : 0;

    const t = this.smoothT;
    const i = Math.min(Math.floor(t), this.chapters.length - 2);
    const frac = clamp(t - i, 0, 1);

    // hold - move - hold
    const eased = smoothstep(0.16, 0.86, frac);
    // the move peaks mid-segment; that is where the "cut" energy goes
    const transition = this.reducedMotion ? 0 : Math.pow(Math.sin(frac * Math.PI), 1.6);

    const a = this.at(i);
    const b = this.at(i + 1);

    // --- camera path ------------------------------------------------------------
    catmullRom3(
      this._eye,
      this.at(i - 1).camera.pos, a.camera.pos, b.camera.pos, this.at(i + 2).camera.pos,
      eased
    );
    catmullRom3(
      this._target,
      this.at(i - 1).camera.target, a.camera.target, b.camera.target, this.at(i + 2).camera.target,
      eased
    );

    const fov = lerp(a.camera.fov, b.camera.fov, eased);

    // --- camera basis -------------------------------------------------------------
    let fx = this._target[0] - this._eye[0];
    let fy = this._target[1] - this._eye[1];
    let fz = this._target[2] - this._eye[2];
    const flen = Math.hypot(fx, fy, fz) || 1;
    fx /= flen; fy /= flen; fz /= flen;

    let rx = fz, ry = 0, rz = -fx;             // forward x world-up
    const rlen = Math.hypot(rx, ry, rz) || 1;
    rx /= rlen; ry /= rlen; rz /= rlen;

    const ux = ry * fz - rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy - ry * fx;

    // --- framing shift ------------------------------------------------------------
    // Slides the whole camera sideways/up so the object sits opposite the copy
    // instead of underneath it. Moving the camera right pushes the subject left.
    const shiftR = lerp(a.camera.shift?.[0] ?? 0, b.camera.shift?.[0] ?? 0, eased);
    const shiftU = lerp(a.camera.shift?.[1] ?? 0, b.camera.shift?.[1] ?? 0, eased);
    if (shiftR !== 0 || shiftU !== 0) {
      const dx0 = rx * shiftR + ux * shiftU;
      const dy0 = ry * shiftR + uy * shiftU;
      const dz0 = rz * shiftR + uz * shiftU;
      this._eye[0] += dx0; this._eye[1] += dy0; this._eye[2] += dz0;
      this._target[0] += dx0; this._target[1] += dy0; this._target[2] += dz0;
    }

    // --- pointer parallax + handheld float ----------------------------------------
    this.pointer.sx = damp(this.pointer.sx, this.pointer.x, 0.002, dt);
    this.pointer.sy = damp(this.pointer.sy, this.pointer.y, 0.002, dt);

    if (!this.reducedMotion) {
      const amount = 0.11 * flen * 0.28;
      const px = this.pointer.sx * amount;
      const py = -this.pointer.sy * amount * 0.7;

      this._eye[0] += rx * px + ux * py;
      this._eye[1] += ry * px + uy * py;
      this._eye[2] += rz * px + uz * py;

      // handheld: low-frequency noise, plus a kick while the camera is moving
      const sway = 0.010 + 0.022 * transition + Math.min(Math.abs(this.velocity), 2) * 0.012;
      this._eye[0] += noise3(time * 0.21, 11.3, 0.0) * sway;
      this._eye[1] += noise3(0.0, time * 0.19, 27.1) * sway * 0.8;
      this._eye[2] += noise3(5.7, 0.0, time * 0.17) * sway * 0.6;
      this._target[0] += noise3(time * 0.13, 3.1, 0.0) * sway * 0.35;
      this._target[1] += noise3(0.0, time * 0.11, 9.4) * sway * 0.35;
    }

    s.eye.set(this._eye);
    s.target.set(this._target);
    s.fov = fov;

    mat4.lookAt(this.view, this._eye, this._target, this._up);

    // --- object state -----------------------------------------------------------
    const dx = this._target[0] - this._eye[0];
    const dy = this._target[1] - this._eye[1];
    const dz = this._target[2] - this._eye[2];
    const distance = Math.hypot(dx, dy, dz);

    s.focusDist = distance + lerp(a.focusOffset, b.focusOffset, eased);
    s.dofStrength = lerp(a.dof.strength, b.dof.strength, eased);
    s.dofMax = lerp(a.dof.max, b.dof.max, eased);
    s.dissolve = lerp(a.dissolve, b.dissolve, eased) + transition * 0.045;
    s.breathe = lerp(a.breathe, b.breathe, eased);

    for (let g = 0; g < GROUP_KEYS.length; g++) {
      s.groups[g] = lerp(a.groups[GROUP_KEYS[g]], b.groups[GROUP_KEYS[g]], eased);
    }

    // --- grade ------------------------------------------------------------------
    const grade = s.grade;
    for (const key of GRADE_SCALARS) {
      grade[key] = lerp(a.grade[key], b.grade[key], eased);
    }
    for (const key of GRADE_VECTORS) {
      lerp3(grade[key], a.grade[key], b.grade[key], eased);
    }

    const speed = clamp(Math.abs(this.velocity) * 0.55, 0, 1);

    grade.letterbox += transition * 0.05;
    grade.aberration += transition * 0.55 + speed * 0.30;
    grade.grain += transition * 0.014;
    grade.exposure *= 1 - transition * 0.06;
    grade.bloomStrength += transition * 0.16;
    // a very short bloom of white right where a cut would be
    grade.flash = Math.pow(transition, 16) * 0.12;
    grade.fade = 0;

    s.exposure = 1.0;
    s.transition = transition;

    // --- backdrop ---------------------------------------------------------------
    const backdrop = s.backdrop;
    for (const key of BACKDROP_VECTORS) {
      lerp3(backdrop[key], a.backdrop[key], b.backdrop[key], eased);
    }
    backdrop.glowPos[0] = lerp(a.backdrop.glowPos[0], b.backdrop.glowPos[0], eased);
    backdrop.glowPos[1] = lerp(a.backdrop.glowPos[1], b.backdrop.glowPos[1], eased);
    backdrop.glowStrength = lerp(a.backdrop.glowStrength, b.backdrop.glowStrength, eased);
    // the pointer nudges the key light in the backdrop too
    backdrop.glowPos[0] += this.pointer.sx * 0.06;
    backdrop.glowPos[1] -= this.pointer.sy * 0.04;

    // --- key light ---------------------------------------------------------------
    // Ambient behaviour is a slow orbit; the "light" chapter hands control to the
    // pointer, blended in by how close we are to that chapter.
    const lightIndex = this.chapters.findIndex((c) => c.interactive === 'light');
    const manual = lightIndex >= 0 ? clamp(1 - Math.abs(t - lightIndex) / 0.85, 0, 1) : 0;

    const orbit = time * 0.11;
    const autoX = Math.cos(orbit) * 0.75;
    const autoY = 0.60 + Math.sin(orbit * 0.7) * 0.15;
    const autoZ = Math.sin(orbit) * 0.55 + 0.35;

    const manualX = this.pointer.sx * 1.5;
    const manualY = 0.35 - this.pointer.sy * 1.1;
    const manualZ = 0.85;

    const lx = lerp(autoX, manualX, manual);
    const ly = lerp(autoY, manualY, manual);
    const lz = lerp(autoZ, manualZ, manual);
    const llen = Math.hypot(lx, ly, lz) || 1;
    s.lightDir[0] = lx / llen;
    s.lightDir[1] = ly / llen;
    s.lightDir[2] = lz / llen;

    // --- per-chapter weights, for the DOM copy -----------------------------------
    let best = 0;
    let bestWeight = -1;
    for (let c = 0; c < this.chapters.length; c++) {
      const w = 1 - smoothstep(0.08, 0.46, Math.abs(t - c));
      s.chapterWeights[c] = w;
      if (w > bestWeight) { bestWeight = w; best = c; }
    }
    this.activeIndex = Math.round(clamp(t, 0, this.chapters.length - 1));
    s.time = time;
    void best;

    return s;
  }

  updateProjection(width, height) {
    const s = this.state;
    s.width = width;
    s.height = height;
    const aspect = width / height;
    const fovY = (s.fov * Math.PI) / 180;
    mat4.perspective(this.proj, fovY, aspect, 0.1, 200);
    // pixel focal lengths, needed to project the 3D covariance into screen space
    s.focalX = (this.proj[0] * width) / 2;
    s.focalY = (this.proj[5] * height) / 2;
  }
}
