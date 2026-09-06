// Procedural generator for the single object the whole site is built around:
// a sculptural bridal bust - faceless couture head-form, veil, floral crown,
// and a haze of gold motes.
//
// It emits a real Gaussian splat cloud (oriented anisotropic discs laid flat on
// the surface, exactly like a clean capture), so nothing here is a stand-in for
// the renderer: swap in a .ply/.splat from an actual scan and the same pipeline
// draws it. See src/splats/loader.js.

import { mulberry32, fbm3, quatFromNormal, smoothstep, clamp, lerp } from '../core/math.js';

export const GROUP = {
  SKIN: 0,
  VEIL: 1,
  FLOWER: 2,
  MOTE: 3,
  LIPS: 4,
  EYES: 5,
};

const HEAD = { cy: 1.52, rx: 0.555, ry: 0.80, rz: 0.615 };

// --- surfaces -----------------------------------------------------------------

// Facial relief. Without it the head reads as a smooth egg; a handful of gaussian
// lobes is enough to get brow, sockets, cheekbones, mouth and chin. Normals are
// taken numerically from the surface, so the shading follows the relief for free.
const bell = (t) => Math.exp(-t * t);

function headRelief(x, y, z) {
  const ax = Math.abs(x);
  const front = bell((z - 0.85) / 0.45);
  let d = 0;
  d += 0.075 * bell((y - 0.25) / 0.13) * bell((z - 0.68) / 0.40) * bell(x / 0.60);   // brow ridge
  d -= 0.026 * bell((ax - 0.30) / 0.17) * bell((y - 0.045) / 0.115) * front;         // eye sockets
  d += 0.070 * bell((ax - 0.46) / 0.19) * bell((y + 0.08) / 0.17) * bell((z - 0.54) / 0.32); // cheekbones
  d -= 0.042 * bell((ax - 0.30) / 0.20) * bell((y + 0.30) / 0.14) * front;           // under-cheek hollow
  d += 0.056 * bell(x / 0.27) * bell((y + 0.330) / 0.078) * front;                   // upper lip
  d += 0.062 * bell(x / 0.27) * bell((y + 0.462) / 0.082) * front;                   // lower lip
  d -= 0.040 * bell(x / 0.30) * bell((y + 0.395) / 0.024) * front;                   // the mouth line
  d -= 0.036 * bell(x / 0.34) * bell((y + 0.555) / 0.055) * front;                   // under the lip
  d += 0.060 * bell(x / 0.27) * bell((y + 0.71) / 0.16) * bell((z - 0.56) / 0.32);   // chin
  d -= 0.038 * bell((ax - 0.78) / 0.22) * bell((y - 0.28) / 0.26);                   // temples
  d -= 0.034 * bell((ax - 0.52) / 0.16) * bell((y + 0.52) / 0.18) * bell((z - 0.40) / 0.30); // jaw
  return d;
}

function headPoint(u, v, out) {
  const phi = v * Math.PI;
  const theta = u * Math.PI * 2;
  const sp = Math.sin(phi);
  const x = sp * Math.sin(theta);
  const y = Math.cos(phi);
  const z = sp * Math.cos(theta);   // +Z is the face

  const down = Math.max(0, -y);
  const taper = 1 - 0.52 * Math.pow(down, 1.45);      // jaw and chin
  const crown = 1 - 0.07 * Math.pow(Math.max(0, y), 3);
  const occiput = z < 0 ? 1.06 : 1.0;                 // fuller at the back of the skull

  let px = x * HEAD.rx * taper * crown;
  let py = HEAD.cy + y * HEAD.ry;
  let pz = z * HEAD.rz * taper * occiput * crown + (z > 0 ? 0.06 * Math.pow(down, 2.4) : 0);

  const relief = headRelief(x, y, z);
  px += x * relief;
  py += y * relief;
  pz += z * relief;

  // the nose pushes forward only, and tips down a little
  const nose = bell(x / 0.105) * bell((y + 0.03) / 0.22) * bell((z - 0.93) / 0.28);
  pz += nose * 0.115;
  py -= nose * 0.016;

  out[0] = px; out[1] = py; out[2] = pz;
  return out;
}

function neckPoint(u, v, out) {
  const theta = u * Math.PI * 2;
  const y = 0.92 - v * 0.46;
  const r = 0.185 + v * 0.10;
  out[0] = Math.sin(theta) * r;
  out[1] = y;
  out[2] = Math.cos(theta) * r * 0.92 + 0.01;
  return out;
}

function torsoPoint(u, v, out) {
  const theta = u * Math.PI * 2;
  const s = Math.sin(theta);
  const spread = smoothstep(0.0, 0.55, v);
  const halfWidth = 0.24 + 1.02 * spread;
  const depth = 0.20 + 0.34 * spread;
  const shoulderFall = 0.34 * Math.pow(Math.abs(s), 1.6) * spread;

  out[0] = s * halfWidth;
  out[1] = 0.54 - v * 1.28 - shoulderFall;
  out[2] = Math.cos(theta) * depth;
  return out;
}

// Silhouette radius of the bust at a given height. The veil is clamped outside
// this, otherwise the cloth passes straight through the skull and the shoulders.
function bodyRadius(y) {
  let r = 0;
  const t = (y - HEAD.cy) / HEAD.ry;
  if (Math.abs(t) < 1) {
    // +6% covers the occiput and the cheekbone relief, which push past the
    // plain ellipsoid the rest of this formula describes.
    r = HEAD.rx * Math.sqrt(1 - t * t) * (1 - 0.52 * Math.pow(Math.max(0, -t), 1.45)) * 1.06;
  }
  if (y < 0.95 && y > 0.40) r = Math.max(r, 0.185 + (0.92 - y) * 0.21);
  if (y < 0.56) {
    const v = clamp((0.54 - y) / 1.28, 0, 1);
    r = Math.max(r, 0.24 + 1.02 * smoothstep(0, 0.55, v));
  }
  return r;
}

function veilPoint(u, v, layer, out) {
  const theta = u * Math.PI * 2;
  const frontness = Math.cos(theta);
  const open = smoothstep(0.10, 0.95, frontness);     // eased away from the face

  const fall = Math.pow(v, 1.10);
  const y = 2.42 - fall * 3.48;

  // The hem stays well inside the closest camera mark: a veil that reaches past
  // the lens turns into full-screen streaks the moment the camera moves in.
  const base = 0.30 + 0.82 * Math.pow(v, 1.30) + layer * 0.042;
  // Folds come mostly from noise; a pure sine reads as combed hair, not tulle.
  const folds = 0.048 * Math.sin(theta * 4.0 + v * 2.6 + layer * 2.1) * Math.pow(v, 0.70);
  const ripple = 0.085 * fbm3(Math.cos(theta) * 1.5, Math.sin(theta) * 1.5, v * 1.9 + layer * 5.0, 4);
  // The height wobble has to be resolved before the clearance test, or a splat
  // clamped for one height ends up at another where the bust is wider.
  const yFinal = y + 0.08 * Math.sin(theta * 3.0 + layer) * v;

  const drape = (base + folds + ripple) * (1 + 0.18 * open);

  // Place the point first (including the backward drift), then push it out along
  // the body axis until it clears. Clamping the radius before the drift lets the
  // front of the veil slide back inside the face.
  const px = Math.sin(theta) * drape;
  const pz = Math.cos(theta) * drape - 0.30 * v;
  const rad = Math.hypot(px, pz);
  const need = bodyRadius(yFinal) + 0.130 + layer * 0.038;
  const push = rad < need ? need / Math.max(rad, 1e-4) : 1;

  out[0] = px * push;
  out[1] = yFinal;
  out[2] = pz * push;
  return out;
}

// Numeric surface normal from the parametric tangents - robust for every
// surface above without hand-deriving each one.
const _pa = new Float32Array(3);
const _pb = new Float32Array(3);
const _pc = new Float32Array(3);

function surfaceNormal(fn, u, v, out, arg) {
  const e = 1e-3;
  if (arg === undefined) {
    fn(u, v, _pa);
    fn(u + e, v, _pb);
    fn(u, Math.min(v + e, 1), _pc);
  } else {
    fn(u, v, arg, _pa);
    fn(u + e, v, arg, _pb);
    fn(u, Math.min(v + e, 1), arg, _pc);
  }
  const ax = _pb[0] - _pa[0], ay = _pb[1] - _pa[1], az = _pb[2] - _pa[2];
  const bx = _pc[0] - _pa[0], by = _pc[1] - _pa[1], bz = _pc[2] - _pa[2];
  let nx = ay * bz - az * by;
  let ny = az * bx - ax * bz;
  let nz = ax * by - ay * bx;
  const len = Math.hypot(nx, ny, nz) || 1;
  out[0] = nx / len; out[1] = ny / len; out[2] = nz / len;
  return out;
}

// Pure random sampling clumps, and a clumped splat cloud reads as noise rather
// than a surface. These low-discrepancy sequences spread samples evenly:
// a Fibonacci spiral over the sphere, and the R2 sequence over a unit square.
const GOLDEN = 0.6180339887498949;
const R2_A1 = 0.7548776662466927;   // 1/plastic
const R2_A2 = 0.5698402909980532;   // 1/plastic^2

function fibonacciSphere(i, n, out) {
  out[0] = (i * GOLDEN) % 1;                       // azimuth
  out[1] = Math.acos(1 - 2 * (i + 0.5) / n) / Math.PI;  // polar, equal-area
  return out;
}

function r2(i, out) {
  out[0] = (0.5 + R2_A1 * i) % 1;
  out[1] = (0.5 + R2_A2 * i) % 1;
  return out;
}

// --- makeup zones ---------------------------------------------------------------
// The zones are what the palette interaction paints. They are defined on the
// head in normalised local coordinates so they stay put as the head is tapered.

function classifyHead(p) {
  const x = (p[0]) / HEAD.rx;
  const y = (p[1] - HEAD.cy) / HEAD.ry;
  const z = (p[2]) / HEAD.rz;
  if (z < 0.42) return { group: GROUP.SKIN, weight: 0 };

  const facing = smoothstep(0.42, 0.78, z);

  // lips: a soft lozenge low on the face, centred
  const lipDx = x / 0.30;
  const lipDy = (y + 0.395) / 0.115;
  const lip = (1 - smoothstep(0.55, 1.0, Math.hypot(lipDx, lipDy))) * facing;
  if (lip > 0.35) return { group: GROUP.LIPS, weight: lip };

  // eyes: two lids either side, swept slightly outward and up
  const ex = (Math.abs(x) - 0.315) / 0.20;
  const ey = (y - 0.075 - Math.abs(x) * 0.16) / 0.115;
  const eye = (1 - smoothstep(0.5, 1.0, Math.hypot(ex, ey))) * facing;
  if (eye > 0.35) return { group: GROUP.EYES, weight: eye };

  return { group: GROUP.SKIN, weight: 0 };
}

// Invert the head parametrisation so the zones can be sampled directly at high
// density instead of hoping the general skin pass lands enough splats on them.
function headUVFromLocal(xl, yl, side) {
  const y = clamp(yl, -0.999, 0.999);
  const phi = Math.acos(y);
  const sp = Math.sin(phi) || 1e-4;
  const sinTheta = clamp((xl * side) / sp, -1, 1);
  const theta = Math.asin(sinTheta);                 // front hemisphere branch
  let u = theta / (Math.PI * 2);
  if (u < 0) u += 1;
  return [u, phi / Math.PI];
}

// --- palette --------------------------------------------------------------------

const SKIN_BASE = [0.955, 0.876, 0.822];
const SKIN_SHADOW = [0.78, 0.66, 0.62];
const LIP_BASE = [0.79, 0.455, 0.435];
const EYE_BASE = [0.850, 0.760, 0.730];
const LASH = [0.180, 0.135, 0.130];
const BROW_BASE = [0.455, 0.355, 0.310];
const VEIL_BASE = [0.975, 0.955, 0.935];
const PETAL_BASE = [0.930, 0.885, 0.870];
const PETAL_BLUSH = [0.96, 0.80, 0.78];
const GOLD = [1.0, 0.84, 0.52];

// --- main -----------------------------------------------------------------------

/**
 * @param {object}   options
 * @param {number}   options.count            total splats
 * @param {number}   options.seed
 * @param {function} options.onProgress       0..1
 */
export async function generateBridalSplats({ count = 150000, seed = 20260906, onProgress } = {}) {
  const rand = mulberry32(seed);

  // Reference tuning was done at 175k splats.
  const spread = Math.sqrt(175000 / Math.max(count, 1));

  const mix = {
    skin: 0.37,
    veil: 0.35,
    flower: 0.09,
    lips: 0.055,
    eyes: 0.060,
    brows: 0.016,
    mote: 0.07,
  };

  const nSkin = Math.floor(count * mix.skin);
  const nVeil = Math.floor(count * mix.veil);
  const nFlower = Math.floor(count * mix.flower);
  const nLips = Math.floor(count * mix.lips);
  const nEyes = Math.floor(count * mix.eyes);
  const nBrows = Math.floor(count * mix.brows);
  const nMote = count - nSkin - nVeil - nFlower - nLips - nEyes - nBrows;

  const texWidth = 2048;
  const texHeight = Math.ceil(count / texWidth);
  const texels = texWidth * texHeight;

  const posOpacity = new Float32Array(texels * 4);
  const scaleGroup = new Float32Array(texels * 4);
  const quat = new Float32Array(texels * 4);
  const colorSeed = new Float32Array(texels * 4);
  const positions = new Float32Array(count * 3);

  const p = new Float32Array(3);
  const n = new Float32Array(3);
  const n1 = new Float32Array(3);
  const q = new Float32Array(4);
  let i = 0;

  const write = (px, py, pz, nx, ny, nz, sx, sy, sz, r, g, b, opacity, group) => {
    const o = i * 4;
    posOpacity[o] = px; posOpacity[o + 1] = py; posOpacity[o + 2] = pz; posOpacity[o + 3] = opacity;
    scaleGroup[o] = sx; scaleGroup[o + 1] = sy; scaleGroup[o + 2] = sz; scaleGroup[o + 3] = group;
    quatFromNormal(q, nx, ny, nz, rand() * Math.PI * 2);
    quat[o] = q[0]; quat[o + 1] = q[1]; quat[o + 2] = q[2]; quat[o + 3] = q[3];
    colorSeed[o] = r; colorSeed[o + 1] = g; colorSeed[o + 2] = b; colorSeed[o + 3] = rand();
    positions[i * 3] = px; positions[i * 3 + 1] = py; positions[i * 3 + 2] = pz;
    i++;
  };

  let processed = 0;
  const total = count;
  let lastYield = performance.now();
  const breathe = async () => {
    // Keep the preloader animating instead of locking the main thread.
    if (performance.now() - lastYield > 12) {
      if (onProgress) onProgress(processed / total);
      await new Promise((resolve) => setTimeout(resolve, 0));
      lastYield = performance.now();
    }
  };

  // --- bust: head, neck, torso --------------------------------------------------
  const nHead = Math.floor(nSkin * 0.64);
  const nNeck = Math.floor(nSkin * 0.10);
  const nTorso = nSkin - nHead - nNeck;
  const uv = [0, 0];

  const bustSplat = async (count, surface, sample, sizeScale) => {
    for (let k = 0; k < count; k++) {
      sample(k, count, uv);
      const u = uv[0], v = uv[1];
      surface(u, v, p);
      surfaceNormal(surface, u, v, n);

      // a little surface thickness so it reads as volume, not a shell
      const jitter = (rand() - 0.5) * 0.005;
      const px = p[0] + n[0] * jitter;
      const py = p[1] + n[1] * jitter;
      const pz = p[2] + n[2] * jitter;

      const zone = classifyHead(p);
      const grain = fbm3(px * 14.0, py * 14.0, pz * 14.0, 2);
      const ao = clamp(0.62 + 0.5 * n[1] + 0.22 * n[2], 0.35, 1.15);

      let base = SKIN_BASE, opacity = 0.60, size = 0.0140 * sizeScale * spread;
      if (zone.group === GROUP.LIPS) {
        base = LIP_BASE; size = 0.0110 * spread; opacity = 0.70;
      } else if (zone.group === GROUP.EYES) {
        base = EYE_BASE; size = 0.0115 * spread; opacity = 0.68;
      }

      // the torso fades into darkness rather than ending on a hard edge
      if (py < 0.35) opacity *= clamp((py + 0.95) / 1.25, 0.0, 1.0);

      const shade = clamp(ao + grain * 0.045, 0.3, 1.2);
      const r = clamp((base[0] * shade) * 0.86 + SKIN_SHADOW[0] * 0.14, 0, 1.4);
      const g = clamp((base[1] * shade) * 0.86 + SKIN_SHADOW[1] * 0.14, 0, 1.4);
      const b = clamp((base[2] * shade) * 0.86 + SKIN_SHADOW[2] * 0.14, 0, 1.4);

      const sz = size * (0.90 + rand() * 0.24);
      write(px, py, pz, n[0], n[1], n[2], sz, sz, sz * 0.20, r, g, b, opacity, zone.group);

      processed++;
      if ((k & 2047) === 0) await breathe();
    }
  };

  await bustSplat(nHead, headPoint, fibonacciSphere, 1.0);
  await bustSplat(nNeck, neckPoint, (i, n2, o) => r2(i, o), 1.15);
  await bustSplat(nTorso, torsoPoint, (i, n2, o) => { r2(i, o); o[1] = Math.pow(o[1], 0.85); }, 1.55);

  // --- makeup zones -------------------------------------------------------------
  // Lips and lids get their own dense pass. These are the splats the palette
  // interaction repaints, so they carry the detail that makes the shade read.
  const zonePass = async (n, sampler, base, size, opacity, group, detail) => {
    const mixed = [0, 0, 0];
    for (let k = 0; k < n; k++) {
      // evenly spread over the unit disc, pulled slightly toward the centre
      r2(k, uv);
      const a = uv[0] * Math.PI * 2;
      const rr = Math.pow(uv[1], 0.62);
      const dx = Math.cos(a) * rr;
      const dy = Math.sin(a) * rr;
      const [u, v, side] = sampler(dx, dy);

      headPoint(u, v, p);
      surfaceNormal(headPoint, u, v, n1);

      const lift = 0.004 + rand() * 0.004;          // sits on top of the skin
      const px = p[0] + n1[0] * lift;
      const py = p[1] + n1[1] * lift;
      const pz = p[2] + n1[2] * lift;

      const edge = 1 - smoothstep(0.72, 1.0, rr);
      const grain = fbm3(px * 26.0, py * 26.0, pz * 26.0, 2);
      const shade = 0.82 + 0.30 * grain + 0.16 * (1 - rr);

      mixed[0] = base[0]; mixed[1] = base[1]; mixed[2] = base[2];
      let alpha = opacity * (0.35 + 0.65 * edge);
      let s = size * spread * (0.7 + rand() * 0.6);
      if (detail) s = (detail(dx, dy, side, mixed, rr) ?? (s / spread)) * spread;

      write(
        px, py, pz, n1[0], n1[1], n1[2], s, s, s * 0.16,
        mixed[0] * shade, mixed[1] * shade, mixed[2] * shade,
        alpha, group
      );
      processed++;
      if ((k & 2047) === 0) await breathe();
      void side;
    }
  };

  await zonePass(
    nLips,
    (dx, dy) => {
      // two lobes around the mouth line, wider at the centre
      const xl = dx * 0.330;
      const bow = 0.030 * bell(dx / 0.45);
      const yl = -0.398 + bow * Math.sign(dy || 1) + dy * 0.118 * (1 - 0.30 * Math.abs(dx));
      const [u, v] = headUVFromLocal(xl, yl, 1);
      return [u, v, 1];
    },
    LIP_BASE, 0.0064, 0.72, GROUP.LIPS
  );

  await zonePass(
    nEyes,
    (dx, dy) => {
      // almond lid: tilted up toward the temple, tapering at both corners
      const side = rand() < 0.5 ? -1 : 1;
      const xl = 0.312 + dx * 0.185;
      const taperY = 0.105 * (1 - 0.40 * Math.abs(dx));
      const yl = 0.062 + xl * 0.20 + dy * taperY;
      const [u, v] = headUVFromLocal(xl, yl, side);
      return [u, v, side];
    },
    EYE_BASE, 0.0068, 0.70, GROUP.EYES,
    // The lash line is what makes an eye read as an eye. It sits on the lower
    // margin of the lid and darkens sharply.
    (dx, dy, side, out) => {
      const lash = smoothstep(-0.52, -0.88, dy);
      if (lash <= 0.01) return undefined;
      out[0] = lerp(out[0], LASH[0], lash);
      out[1] = lerp(out[1], LASH[1], lash);
      out[2] = lerp(out[2], LASH[2], lash);
      return 0.0062 * (0.55 + 0.45 * (1 - lash));
    }
  );

  // brow: a thin arc riding the brow ridge
  await zonePass(
    nBrows,
    (dx, dy) => {
      const side = rand() < 0.5 ? -1 : 1;
      const xl = 0.300 + dx * 0.215;
      const arch = 0.052 - 0.30 * (dx + 0.15) * (dx + 0.15);
      const yl = 0.248 + xl * 0.14 + arch + dy * 0.022;
      const [u, v] = headUVFromLocal(xl, yl, side);
      return [u, v, side];
    },
    BROW_BASE, 0.0050, 0.40, GROUP.SKIN
  );

  // --- veil ---------------------------------------------------------------------
  const layers = 5;
  for (let k = 0; k < nVeil; k++) {
    const layer = k % layers;
    r2(Math.floor(k / layers), uv);
    const u = uv[0];
    const v = Math.pow(uv[1], 0.78);
    veilPoint(u, v, layer, p);
    surfaceNormal(veilPoint, u, v, n, layer);

    const jitter = (rand() - 0.5) * 0.05;
    const px = p[0] + n[0] * jitter;
    const py = p[1] + n[1] * jitter;
    const pz = p[2] + n[2] * jitter;

    const frontness = Math.cos(u * Math.PI * 2);
    const sheer = 1 - 0.80 * smoothstep(0.05, 0.85, frontness);  // near-invisible over the face
    const hem = 1 - smoothstep(0.82, 1.0, v);                    // dissolves at the hem
    const weave = 0.5 + 0.5 * fbm3(px * 9.0, py * 9.0, pz * 9.0, 2);

    const opacity = (0.013 + 0.024 * weave) * sheer * hem * (0.55 + rand() * 0.75);
    const s = (0.032 + rand() * 0.030) * spread;
    const glint = 1 + 0.35 * Math.pow(weave, 6);

    write(
      px, py, pz, n[0], n[1], n[2], s, s, s * 0.16,
      VEIL_BASE[0] * glint, VEIL_BASE[1] * glint, VEIL_BASE[2] * glint,
      opacity, GROUP.VEIL
    );

    processed++;
    if ((k & 2047) === 0) await breathe();
  }

  // --- floral crown -------------------------------------------------------------
  const clusters = 30;
  const clusterCenters = [];
  for (let c = 0; c < clusters; c++) {
    // A ring around the hairline: small at the temples, fuller toward the back,
    // with one heavier shoulder so the crown is not perfectly symmetrical.
    const t = c / clusters;
    const theta = t * Math.PI * 2 + (rand() - 0.5) * 0.16;
    const front = Math.cos(theta);                       // 1 at the face
    const weight = 0.42 + 0.58 * (1 - Math.max(0, front));
    const bias = 1 + 0.28 * Math.max(0, Math.sin(theta));

    const r = (0.50 + rand() * 0.06) * (1 + 0.10 * (1 - front));
    clusterCenters.push([
      Math.sin(theta) * r,
      1.98 + 0.10 * (1 - front) * 0.5 + (rand() - 0.5) * 0.10,
      Math.cos(theta) * r * 0.98 - 0.02,
      (0.032 + rand() * 0.028) * weight * bias,
    ]);
  }

  for (let k = 0; k < nFlower; k++) {
    const c = clusterCenters[(rand() * clusters) | 0];
    // a blossom: points on a small lobed shell
    const a = rand() * Math.PI * 2;
    const b2 = Math.acos(1 - 2 * rand());
    const lobe = 0.72 + 0.34 * Math.abs(Math.sin(a * 2.5));
    const rr = c[3] * lobe * (0.55 + Math.pow(rand(), 0.4) * 0.45);

    const nx = Math.sin(b2) * Math.cos(a);
    const ny = Math.cos(b2) * 0.8 + 0.25;
    const nz = Math.sin(b2) * Math.sin(a);
    const len = Math.hypot(nx, ny, nz) || 1;

    const px = c[0] + (nx / len) * rr;
    const py = c[1] + (ny / len) * rr;
    const pz = c[2] + (nz / len) * rr;

    const core = rr < c[3] * 0.35;
    const blush = rand();
    const base = core ? GOLD : (blush > 0.72 ? PETAL_BLUSH : PETAL_BASE);
    const shade = 0.75 + 0.45 * rand();
    const s = (core ? 0.0045 : 0.0080) * spread * (0.75 + rand() * 0.6);

    write(
      px, py, pz, nx / len, ny / len, nz / len,
      s, s, s * (core ? 0.9 : 0.22),
      base[0] * shade, base[1] * shade, base[2] * shade,
      core ? 0.85 : 0.62, GROUP.FLOWER
    );

    processed++;
    if ((k & 2047) === 0) await breathe();
  }

  // --- motes --------------------------------------------------------------------
  for (let k = 0; k < nMote; k++) {
    // Kept outside the object so a close camera mark never sits inside the haze.
    const a = rand() * Math.PI * 2;
    const r = 1.75 + Math.pow(rand(), 0.55) * 2.4;
    const py = -1.2 + Math.pow(rand(), 0.85) * 4.6;
    const px = Math.sin(a) * r;
    const pz = Math.cos(a) * r;

    const s = (0.004 + Math.pow(rand(), 3.2) * 0.011) * spread;
    const warm = 0.75 + rand() * 0.5;
    const opacity = 0.14 + Math.pow(rand(), 2.4) * 0.42;

    write(
      px, py, pz, rand() - 0.5, rand() - 0.5, rand() - 0.5,
      s, s, s * 0.75,
      GOLD[0] * warm, GOLD[1] * warm, GOLD[2] * warm,
      opacity, GROUP.MOTE
    );

    processed++;
    if ((k & 4095) === 0) await breathe();
  }

  if (onProgress) onProgress(1);

  return { count: i, texWidth, texHeight, posOpacity, scaleGroup, quat, colorSeed, positions };
}
