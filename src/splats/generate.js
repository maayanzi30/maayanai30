// Procedural generator for the single object the whole site is built around:
// a sculptural bridal bust - faceless couture head-form, veil, floral crown,
// and a haze of gold motes.
//
// It emits a real Gaussian splat cloud (oriented anisotropic discs laid flat on
// the surface, exactly like a clean capture), so nothing here is a stand-in for
// the renderer: swap in a .ply/.splat from an actual scan and the same pipeline
// draws it. See src/splats/loader.js.

import { mulberry32, fbm3, quatFromNormal, smoothstep, clamp } from '../core/math.js';

export const GROUP = {
  SKIN: 0,
  VEIL: 1,
  FLOWER: 2,
  MOTE: 3,
  LIPS: 4,
  EYES: 5,
};

const HEAD = { cy: 1.52, rx: 0.60, ry: 0.78, rz: 0.62 };

// --- surfaces -----------------------------------------------------------------

// Facial relief. Without it the head reads as a smooth egg; a handful of gaussian
// lobes is enough to get brow, sockets, cheekbones, mouth and chin. Normals are
// taken numerically from the surface, so the shading follows the relief for free.
const bell = (t) => Math.exp(-t * t);

function headRelief(x, y, z) {
  const ax = Math.abs(x);
  let d = 0;
  d += 0.032 * bell((y - 0.24) / 0.13) * bell((z - 0.70) / 0.42) * bell(x / 0.62);   // brow
  d -= 0.028 * bell((ax - 0.30) / 0.15) * bell((y - 0.05) / 0.11) * bell((z - 0.80) / 0.26); // sockets
  d += 0.032 * bell((ax - 0.45) / 0.20) * bell((y + 0.08) / 0.18) * bell((z - 0.56) / 0.32); // cheekbones
  d += 0.020 * bell(x / 0.23) * bell((y + 0.40) / 0.090) * bell((z - 0.80) / 0.24);  // mouth
  d += 0.028 * bell(x / 0.26) * bell((y + 0.70) / 0.17) * bell((z - 0.58) / 0.32);   // chin
  d -= 0.022 * bell((ax - 0.76) / 0.22) * bell((y - 0.30) / 0.26);                   // temples
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
  const taper = 1 - 0.42 * Math.pow(down, 1.5);       // jaw and chin
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
  const nose = bell(x / 0.115) * bell((y + 0.02) / 0.23) * bell((z - 0.92) / 0.30);
  pz += nose * 0.062;
  py -= nose * 0.012;

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

function veilPoint(u, v, layer, out) {
  const theta = u * Math.PI * 2;
  const frontness = Math.cos(theta);
  const open = smoothstep(0.10, 0.95, frontness);     // eased away from the face

  const fall = Math.pow(v, 1.10);
  const y = 2.24 - fall * 3.30;

  // The hem stays well inside the closest camera mark: a veil that reaches past
  // the lens turns into full-screen streaks the moment the camera moves in.
  const base = 0.33 + 0.80 * Math.pow(v, 1.30) + layer * 0.055;
  const folds = 0.075 * Math.sin(theta * 8.0 + v * 5.0 + layer * 2.1) * Math.pow(v, 0.70);
  const ripple = 0.055 * fbm3(Math.cos(theta) * 2.1, Math.sin(theta) * 2.1, v * 3.0 + layer * 5.0, 3);
  const r = (base + folds + ripple) * (1 + 0.18 * open);

  out[0] = Math.sin(theta) * r;
  out[1] = y + 0.08 * Math.sin(theta * 3.0 + layer) * v;
  out[2] = Math.cos(theta) * r - 0.30 * v;
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
const LIP_BASE = [0.80, 0.40, 0.38];
const EYE_BASE = [0.74, 0.63, 0.60];
const VEIL_BASE = [0.975, 0.955, 0.935];
const PETAL_BASE = [0.985, 0.935, 0.915];
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

  const mix = {
    skin: 0.35,
    veil: 0.33,
    flower: 0.09,
    lips: 0.05,
    eyes: 0.06,
    mote: 0.12,
  };

  const nSkin = Math.floor(count * mix.skin);
  const nVeil = Math.floor(count * mix.veil);
  const nFlower = Math.floor(count * mix.flower);
  const nLips = Math.floor(count * mix.lips);
  const nEyes = Math.floor(count * mix.eyes);
  const nMote = count - nSkin - nVeil - nFlower - nLips - nEyes;

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
  const headShare = 0.56, neckShare = 0.10;
  for (let k = 0; k < nSkin; k++) {
    const roll = rand();
    let px, py, pz;

    if (roll < headShare) {
      // cosine-ish latitude sampling keeps density even over the sphere
      const u = rand();
      const v = Math.acos(1 - 2 * rand()) / Math.PI;
      headPoint(u, v, p);
      surfaceNormal(headPoint, u, v, n);
    } else if (roll < headShare + neckShare) {
      const u = rand(), v = rand();
      neckPoint(u, v, p);
      surfaceNormal(neckPoint, u, v, n);
    } else {
      const u = rand(), v = Math.pow(rand(), 0.85);
      torsoPoint(u, v, p);
      surfaceNormal(torsoPoint, u, v, n);
    }

    // a little surface thickness so it reads as volume, not a shell
    const jitter = (rand() - 0.5) * 0.016;
    px = p[0] + n[0] * jitter;
    py = p[1] + n[1] * jitter;
    pz = p[2] + n[2] * jitter;

    const zone = classifyHead(p);
    const grain = fbm3(px * 5.5, py * 5.5, pz * 5.5, 3);
    const ao = clamp(0.62 + 0.5 * n[1] + 0.22 * n[2], 0.35, 1.15);

    let base = SKIN_BASE, opacity = 0.88, size = 0.0165;
    if (zone.group === GROUP.LIPS) {
      base = LIP_BASE; size = 0.0125; opacity = 0.94;
    } else if (zone.group === GROUP.EYES) {
      base = EYE_BASE; size = 0.0130; opacity = 0.92;
    }

    // the torso fades into darkness rather than ending on a hard edge
    if (py < 0.35) opacity *= clamp((py + 0.95) / 1.25, 0.0, 1.0);

    const shade = clamp(ao + grain * 0.10, 0.3, 1.2);
    const r = clamp((base[0] * shade) * 0.86 + SKIN_SHADOW[0] * 0.14, 0, 1.4);
    const g = clamp((base[1] * shade) * 0.86 + SKIN_SHADOW[1] * 0.14, 0, 1.4);
    const b = clamp((base[2] * shade) * 0.86 + SKIN_SHADOW[2] * 0.14, 0, 1.4);

    const s = size * (0.8 + rand() * 0.5);
    write(px, py, pz, n[0], n[1], n[2], s, s, s * 0.20, r, g, b, opacity, zone.group);

    processed++;
    if ((k & 2047) === 0) await breathe();
  }

  // --- makeup zones -------------------------------------------------------------
  // Lips and lids get their own dense pass. These are the splats the palette
  // interaction repaints, so they carry the detail that makes the shade read.
  const zonePass = async (n, sampler, base, size, opacity, group) => {
    for (let k = 0; k < n; k++) {
      // uniform point in the unit disc, pulled slightly toward the centre
      const a = rand() * Math.PI * 2;
      const rr = Math.pow(rand(), 0.62);
      const [u, v, side] = sampler(Math.cos(a) * rr, Math.sin(a) * rr);

      headPoint(u, v, p);
      surfaceNormal(headPoint, u, v, n1);

      const lift = 0.004 + rand() * 0.004;          // sits on top of the skin
      const px = p[0] + n1[0] * lift;
      const py = p[1] + n1[1] * lift;
      const pz = p[2] + n1[2] * lift;

      const edge = 1 - smoothstep(0.72, 1.0, rr);
      const grain = fbm3(px * 26.0, py * 26.0, pz * 26.0, 2);
      const shade = 0.82 + 0.30 * grain + 0.16 * (1 - rr);
      const s = size * (0.7 + rand() * 0.6);

      write(
        px, py, pz, n1[0], n1[1], n1[2], s, s, s * 0.16,
        base[0] * shade, base[1] * shade, base[2] * shade,
        opacity * (0.35 + 0.65 * edge), group
      );
      processed++;
      if ((k & 2047) === 0) await breathe();
      void side;
    }
  };

  await zonePass(
    nLips,
    (dx, dy) => {
      const xl = dx * 0.30;
      const yl = -0.395 + dy * 0.118;
      const [u, v] = headUVFromLocal(xl, yl, 1);
      return [u, v, 1];
    },
    LIP_BASE, 0.0072, 0.96, GROUP.LIPS
  );

  await zonePass(
    nEyes,
    (dx, dy) => {
      const side = rand() < 0.5 ? -1 : 1;
      const xl = 0.315 + dx * 0.20;
      const yl = 0.075 + xl * 0.16 + dy * 0.118;
      const [u, v] = headUVFromLocal(xl, yl, side);
      return [u, v, side];
    },
    EYE_BASE, 0.0075, 0.94, GROUP.EYES
  );

  // --- veil ---------------------------------------------------------------------
  const layers = 3;
  for (let k = 0; k < nVeil; k++) {
    const layer = k % layers;
    const u = rand();
    const v = Math.pow(rand(), 0.78);
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

    const opacity = (0.030 + 0.055 * weave) * sheer * hem * (0.6 + rand() * 0.7);
    const s = 0.014 + rand() * 0.014;
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
    const s = (core ? 0.0045 : 0.0080) * (0.75 + rand() * 0.6);

    write(
      px, py, pz, nx / len, ny / len, nz / len,
      s, s, s * (core ? 0.9 : 0.22),
      base[0] * shade, base[1] * shade, base[2] * shade,
      core ? 0.9 : 0.72, GROUP.FLOWER
    );

    processed++;
    if ((k & 2047) === 0) await breathe();
  }

  // --- motes --------------------------------------------------------------------
  for (let k = 0; k < nMote; k++) {
    const a = rand() * Math.PI * 2;
    const r = 0.9 + Math.pow(rand(), 0.55) * 2.6;
    const py = -1.4 + Math.pow(rand(), 0.8) * 4.9;
    const px = Math.sin(a) * r;
    const pz = Math.cos(a) * r;

    const s = 0.005 + Math.pow(rand(), 3) * 0.016;
    const warm = 0.75 + rand() * 0.5;
    const opacity = 0.20 + Math.pow(rand(), 2.2) * 0.55;

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
