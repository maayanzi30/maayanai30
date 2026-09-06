// Generates the scroll-scrubbed image sequence: a seamless loop of flowing silk
// used as the cinematic overlay layer in the "veil" and "moment" chapters.
//
// Zero dependencies - PNG is encoded by hand on top of node:zlib. Replace the
// output with real footage frames (same naming, same manifest) whenever you have
// it; src/media/sequence.js does not care where the frames came from.
//
//   node scripts/make-sequence.mjs [--width 512] [--height 288] [--frames 48]

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', 'assets', 'sequence');

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i].replace(/^--/, ''), process.argv[i + 1]);
}
const WIDTH = Number(args.get('width') || 512);
const HEIGHT = Number(args.get('height') || 288);
const FRAMES = Number(args.get('frames') || 48);

// --- noise ---------------------------------------------------------------------

const lerp = (a, b, t) => a + (b - a) * t;

function hash3(a, b, c) {
  let n = Math.imul(a, 374761393) ^ Math.imul(b, 668265263) ^ Math.imul(c, 2147483647);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const c000 = hash3(xi, yi, zi), c100 = hash3(xi + 1, yi, zi);
  const c010 = hash3(xi, yi + 1, zi), c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1), c101 = hash3(xi + 1, yi, zi + 1);
  const c011 = hash3(xi, yi + 1, zi + 1), c111 = hash3(xi + 1, yi + 1, zi + 1);
  return lerp(
    lerp(lerp(c000, c100, u), lerp(c010, c110, u), v),
    lerp(lerp(c001, c101, u), lerp(c011, c111, u), v),
    w
  ) * 2 - 1;
}

function fbm(x, y, z, octaves) {
  let sum = 0, amp = 0.5, freq = 1;
  for (let o = 0; o < octaves; o++) {
    sum += noise3(x * freq, y * freq, z * freq) * amp;
    freq *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

// --- PNG -----------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(data.length + 12);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/** Encodes RGB8 with per-scanline adaptive filtering (None / Sub / Up / Paeth). */
function encodePng(rgb, width, height) {
  const bpp = 3;
  const stride = width * bpp;
  const raw = Buffer.alloc((stride + 1) * height);
  const candidates = [Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride)];

  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };

  for (let y = 0; y < height; y++) {
    const row = y * stride;
    const prev = row - stride;
    const scores = [0, 0, 0, 0];

    for (let x = 0; x < stride; x++) {
      const value = rgb[row + x];
      const left = x >= bpp ? rgb[row + x - bpp] : 0;
      const up = y > 0 ? rgb[prev + x] : 0;
      const upLeft = y > 0 && x >= bpp ? rgb[prev + x - bpp] : 0;

      candidates[0][x] = value;
      candidates[1][x] = (value - left) & 0xff;
      candidates[2][x] = (value - up) & 0xff;
      candidates[3][x] = (value - paeth(left, up, upLeft)) & 0xff;

      for (let f = 0; f < 4; f++) {
        const s = candidates[f][x];
        scores[f] += s < 128 ? s : 256 - s;
      }
    }

    let best = 0;
    for (let f = 1; f < 4; f++) if (scores[f] < scores[best]) best = f;

    const at = y * (stride + 1);
    raw[at] = [0, 1, 2, 4][best];
    candidates[best].copy(raw, at + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 2;    // colour type: truecolour
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- the frame ------------------------------------------------------------------

// Palette: near-black plum -> warm shadow -> ivory -> gold highlight.
const STOPS = [
  [0.000, [0.020, 0.016, 0.022]],
  [0.320, [0.180, 0.128, 0.128]],
  [0.560, [0.520, 0.400, 0.352]],
  [0.790, [0.880, 0.800, 0.716]],
  [1.000, [1.000, 0.918, 0.760]],
];

function ramp(t, out) {
  t = Math.min(Math.max(t, 0), 1);
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, c0] = STOPS[i];
    const [t1, c1] = STOPS[i + 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0 || 1);
      out[0] = lerp(c0[0], c1[0], k);
      out[1] = lerp(c0[1], c1[1], k);
      out[2] = lerp(c0[2], c1[2], k);
      return out;
    }
  }
  out[0] = STOPS[4][1][0]; out[1] = STOPS[4][1][1]; out[2] = STOPS[4][1][2];
  return out;
}

// The expensive fbm layers are evaluated on a coarse grid and bilinearly
// resampled; the fold pattern on top is per-pixel, so nothing looks soft.
const GX = 176;
const GY = 100;
const FOLD_ANGLE = -0.46;   // radians; the direction the folds run
const COS_A = Math.cos(FOLD_ANGLE);
const SIN_A = Math.sin(FOLD_ANGLE);

function renderFrame(frame) {
  const angle = (frame / FRAMES) * Math.PI * 2;   // loops seamlessly
  const ca = Math.cos(angle) * 0.85;
  const sa = Math.sin(angle) * 0.85;

  const field = new Float32Array(GX * GY);
  const gloss = new Float32Array(GX * GY);

  // Silk is anisotropic: long folds running one way, fast variation across them.
  // The whole field is evaluated in a rotated frame so the folds fall diagonally.
  const COS = Math.cos(FOLD_ANGLE);
  const SIN = Math.sin(FOLD_ANGLE);

  for (let gy = 0; gy < GY; gy++) {
    const v = gy / (GY - 1);
    for (let gx = 0; gx < GX; gx++) {
      const u = gx / (GX - 1);
      const ru = u * COS - v * SIN;
      const rv = u * SIN + v * COS;

      const warp = fbm(ru * 1.1 + 3.1, rv * 2.6, ca, 3);
      field[gy * GX + gx] = fbm(ru * 1.35 + warp * 0.55, rv * 4.4, sa * 0.7 + 2.0, 4);
      gloss[gy * GX + gx] = fbm(ru * 0.9 - sa * 0.4, rv * 1.3, ca * 0.4 + 11.0, 3);
    }
  }

  const sample = (grid, fx, fy) => {
    const x = Math.min(Math.max(fx * (GX - 1), 0), GX - 1.001);
    const y = Math.min(Math.max(fy * (GY - 1), 0), GY - 1.001);
    const x0 = x | 0, y0 = y | 0;
    const tx = x - x0, ty = y - y0;
    const a = grid[y0 * GX + x0], b = grid[y0 * GX + x0 + 1];
    const c = grid[(y0 + 1) * GX + x0], d = grid[(y0 + 1) * GX + x0 + 1];
    return lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
  };

  const rgb = Buffer.alloc(WIDTH * HEIGHT * 3);
  const color = [0, 0, 0];

  for (let y = 0; y < HEIGHT; y++) {
    const v = y / (HEIGHT - 1);
    for (let x = 0; x < WIDTH; x++) {
      const u = x / (WIDTH - 1);

      const p = sample(field, u, v);
      const g = sample(gloss, u, v);
      const rv = u * SIN_A + v * COS_A;

      // fabric folds: a dense ripple across the weave, bent by the warped field
      let folds = 0.5 + 0.5 * Math.sin(rv * 27.0 + p * 9.5 + angle * 1.4);
      folds = Math.pow(folds, 2.6);

      // a broad raking light travelling along the folds
      const rake = 0.5 + 0.5 * Math.sin((u * 0.8 + v * 1.35) * Math.PI - angle + p * 1.6);
      let value = folds * (0.30 + 0.70 * rake) * 0.62 + (g * 0.5 + 0.5) * 0.13;

      // specular threads: only the crest of a fold under the rake catches light
      const thread = Math.pow(Math.max(0, folds), 5.0) * Math.pow(rake, 3.0);
      value += thread * 0.62;

      // frame falloff so the layer blends instead of ending at the edges
      const edge =
        Math.min(1, u / 0.16) * Math.min(1, (1 - u) / 0.16) *
        Math.min(1, v / 0.14) * Math.min(1, (1 - v) / 0.20);
      value *= 0.25 + 0.75 * Math.pow(edge, 0.8);

      ramp(value * 0.92, color);
      const o = (y * WIDTH + x) * 3;
      rgb[o] = Math.min(255, Math.max(0, Math.round(color[0] * 255)));
      rgb[o + 1] = Math.min(255, Math.max(0, Math.round(color[1] * 255)));
      rgb[o + 2] = Math.min(255, Math.max(0, Math.round(color[2] * 255)));
    }
  }

  return encodePng(rgb, WIDTH, HEIGHT);
}

// --- run --------------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });

let total = 0;
const started = Date.now();
for (let f = 0; f < FRAMES; f++) {
  const png = renderFrame(f);
  total += png.length;
  const name = `frame_${String(f).padStart(4, '0')}.png`;
  writeFileSync(join(OUT_DIR, name), png);
  process.stdout.write(`\r  ${f + 1}/${FRAMES}  ${(total / 1024 / 1024).toFixed(2)} MB`);
}

const manifest = {
  pattern: 'assets/sequence/frame_{i}.png',
  pad: 4,
  frames: FRAMES,
  width: WIDTH,
  height: HEIGHT,
  loop: true,
  note: 'Generated by scripts/make-sequence.mjs. Replace with real footage frames using the same naming.',
};
writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

process.stdout.write(
  `\n  done in ${((Date.now() - started) / 1000).toFixed(1)}s -> ${OUT_DIR}\n`
);
