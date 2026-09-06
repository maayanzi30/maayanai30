// Loaders for real Gaussian Splatting captures.
//
// The site ships with a procedurally generated cloud so it runs with no assets,
// but the renderer is the real thing: drop a capture at assets/model.splat (or
// .ply) and it is drawn by exactly the same pipeline. Set the path in
// src/scene/chapters.js -> SITE.splatUrl.

const SH_C0 = 0.28209479177387814;

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

function pack(count, read) {
  const texWidth = 2048;
  const texHeight = Math.ceil(count / texWidth);
  const texels = texWidth * texHeight;

  const posOpacity = new Float32Array(texels * 4);
  const scaleGroup = new Float32Array(texels * 4);
  const quat = new Float32Array(texels * 4);
  const colorSeed = new Float32Array(texels * 4);
  const positions = new Float32Array(count * 3);

  const out = {
    px: 0, py: 0, pz: 0,
    sx: 0, sy: 0, sz: 0,
    qx: 0, qy: 0, qz: 0, qw: 1,
    r: 1, g: 1, b: 1, opacity: 1,
  };

  let minY = Infinity, maxY = -Infinity;
  let cx = 0, cz = 0;

  for (let i = 0; i < count; i++) {
    read(i, out);
    const o = i * 4;
    posOpacity[o] = out.px; posOpacity[o + 1] = out.py; posOpacity[o + 2] = out.pz;
    posOpacity[o + 3] = out.opacity;
    scaleGroup[o] = out.sx; scaleGroup[o + 1] = out.sy; scaleGroup[o + 2] = out.sz;
    scaleGroup[o + 3] = 0;   // everything lands in the SKIN group

    const len = Math.hypot(out.qx, out.qy, out.qz, out.qw) || 1;
    quat[o] = out.qx / len; quat[o + 1] = out.qy / len;
    quat[o + 2] = out.qz / len; quat[o + 3] = out.qw / len;

    colorSeed[o] = out.r; colorSeed[o + 1] = out.g; colorSeed[o + 2] = out.b;
    colorSeed[o + 3] = (i * 0.6180339887) % 1;

    positions[i * 3] = out.px; positions[i * 3 + 1] = out.py; positions[i * 3 + 2] = out.pz;
    if (out.py < minY) minY = out.py;
    if (out.py > maxY) maxY = out.py;
    cx += out.px; cz += out.pz;
  }

  return {
    count, texWidth, texHeight, posOpacity, scaleGroup, quat, colorSeed, positions,
    bounds: { minY, maxY, cx: cx / count, cz: cz / count },
  };
}

/** antimatter15 `.splat`: 32 bytes per splat. */
export function parseSplat(buffer) {
  const stride = 32;
  const count = Math.floor(buffer.byteLength / stride);
  const f32 = new Float32Array(buffer);
  const u8 = new Uint8Array(buffer);

  return pack(count, (i, out) => {
    const f = i * 8;
    const b = i * stride;
    out.px = f32[f]; out.py = f32[f + 1]; out.pz = f32[f + 2];
    out.sx = f32[f + 3]; out.sy = f32[f + 4]; out.sz = f32[f + 5];
    out.r = u8[b + 24] / 255; out.g = u8[b + 25] / 255; out.b = u8[b + 26] / 255;
    out.opacity = u8[b + 27] / 255;
    out.qw = (u8[b + 28] - 128) / 128;
    out.qx = (u8[b + 29] - 128) / 128;
    out.qy = (u8[b + 30] - 128) / 128;
    out.qz = (u8[b + 31] - 128) / 128;
  });
}

/** INRIA 3DGS `.ply` (binary_little_endian, SH degree 0 term only). */
export function parsePly(buffer) {
  const bytes = new Uint8Array(buffer);
  const headerEnd = findHeaderEnd(bytes);
  if (headerEnd < 0) throw new Error('.ply: end_header not found');

  const header = new TextDecoder().decode(bytes.subarray(0, headerEnd));
  const lines = header.split(/\r?\n/);

  if (!/binary_little_endian/.test(header)) {
    throw new Error('.ply: only binary_little_endian is supported');
  }

  let count = 0;
  const props = [];
  const SIZES = {
    char: 1, uchar: 1, int8: 1, uint8: 1,
    short: 2, ushort: 2, int16: 2, uint16: 2,
    int: 4, uint: 4, int32: 4, uint32: 4, float: 4, float32: 4,
    double: 8, float64: 8,
  };

  let inVertex = false;
  let offset = 0;
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === 'element') {
      inVertex = parts[1] === 'vertex';
      if (inVertex) count = parseInt(parts[2], 10);
    } else if (parts[0] === 'property' && inVertex) {
      const type = parts[1];
      const name = parts[2];
      const size = SIZES[type];
      if (!size) throw new Error(`.ply: unsupported property type ${type}`);
      props.push({ name, type, size, offset });
      offset += size;
    }
  }

  const stride = offset;
  const view = new DataView(buffer, headerEnd);
  const index = Object.create(null);
  for (const p of props) index[p.name] = p;

  const read = (base, prop) => {
    if (!prop) return 0;
    const at = base + prop.offset;
    switch (prop.type) {
      case 'float': case 'float32': return view.getFloat32(at, true);
      case 'double': case 'float64': return view.getFloat64(at, true);
      case 'uchar': case 'uint8': return view.getUint8(at);
      case 'char': case 'int8': return view.getInt8(at);
      case 'ushort': case 'uint16': return view.getUint16(at, true);
      case 'short': case 'int16': return view.getInt16(at, true);
      case 'uint': case 'uint32': return view.getUint32(at, true);
      default: return view.getInt32(at, true);
    }
  };

  return pack(count, (i, out) => {
    const base = i * stride;
    out.px = read(base, index.x);
    out.py = read(base, index.y);
    out.pz = read(base, index.z);

    // scales and opacity are stored activated in the INRIA format
    out.sx = Math.exp(read(base, index.scale_0));
    out.sy = Math.exp(read(base, index.scale_1));
    out.sz = Math.exp(read(base, index.scale_2));
    out.opacity = sigmoid(read(base, index.opacity));

    out.qw = read(base, index.rot_0);
    out.qx = read(base, index.rot_1);
    out.qy = read(base, index.rot_2);
    out.qz = read(base, index.rot_3);

    if (index.f_dc_0) {
      out.r = 0.5 + SH_C0 * read(base, index.f_dc_0);
      out.g = 0.5 + SH_C0 * read(base, index.f_dc_1);
      out.b = 0.5 + SH_C0 * read(base, index.f_dc_2);
    } else if (index.red) {
      out.r = read(base, index.red) / 255;
      out.g = read(base, index.green) / 255;
      out.b = read(base, index.blue) / 255;
    }
  });
}

function findHeaderEnd(bytes) {
  const needle = 'end_header';
  const limit = Math.min(bytes.length, 1 << 20);
  for (let i = 0; i < limit - needle.length; i++) {
    if (bytes[i] !== 101 /* e */) continue;
    let match = true;
    for (let j = 1; j < needle.length; j++) {
      if (bytes[i + j] !== needle.charCodeAt(j)) { match = false; break; }
    }
    if (!match) continue;
    let k = i + needle.length;
    while (k < bytes.length && bytes[k] !== 10) k++;
    return k + 1;
  }
  return -1;
}

export async function loadSplatFile(url, onProgress) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);

  const total = Number(response.headers.get('content-length')) || 0;
  let buffer;

  if (response.body && total) {
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (onProgress) onProgress(Math.min(received / total, 1));
    }
    const merged = new Uint8Array(received);
    let at = 0;
    for (const chunk of chunks) { merged.set(chunk, at); at += chunk.length; }
    buffer = merged.buffer;
  } else {
    buffer = await response.arrayBuffer();
    if (onProgress) onProgress(1);
  }

  return url.toLowerCase().endsWith('.ply') ? parsePly(buffer) : parseSplat(buffer);
}
