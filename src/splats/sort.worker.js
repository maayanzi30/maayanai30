// Depth sort for the splat cloud, off the main thread.
//
// Alpha blending is order dependent, so every frame the splats must be drawn
// back-to-front. A 16-bit counting sort is O(n) and comfortably beats a
// comparison sort at these counts; the result is a plain index buffer that the
// renderer binds as a per-instance attribute.

let positions = null;   // Float32Array, 3 per splat
let count = 0;
let depths = null;      // Int32Array bucket per splat
let indices = null;     // Uint32Array output
const BUCKETS = 65536;
const counts = new Uint32Array(BUCKETS);
const starts = new Uint32Array(BUCKETS);

self.onmessage = (event) => {
  const msg = event.data;

  if (msg.type === 'init') {
    positions = msg.positions;
    count = positions.length / 3;
    depths = new Int32Array(count);
    indices = new Uint32Array(count);
    self.postMessage({ type: 'ready', count });
    return;
  }

  if (msg.type === 'sort') {
    if (!positions) return;
    const view = msg.view;      // column-major mat4, world -> view
    // Distance from the camera along the view axis: -(z component of view * pos).
    const m2 = view[2], m6 = view[6], m10 = view[10], m14 = view[14];

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      const d = -(m2 * positions[j] + m6 * positions[j + 1] + m10 * positions[j + 2] + m14);
      depths[i] = d * 4096;   // fixed point; the exact scale is irrelevant, only order
      if (depths[i] < min) min = depths[i];
      if (depths[i] > max) max = depths[i];
    }

    const range = max - min;
    const scale = range > 0 ? (BUCKETS - 1) / range : 0;

    counts.fill(0);
    for (let i = 0; i < count; i++) {
      const b = ((depths[i] - min) * scale) | 0;
      depths[i] = b;
      counts[b]++;
    }

    // Descending prefix sum: the farthest bucket is written first, which is
    // exactly the back-to-front order the blend equation needs.
    let running = 0;
    for (let b = BUCKETS - 1; b >= 0; b--) {
      starts[b] = running;
      running += counts[b];
    }

    for (let i = 0; i < count; i++) {
      indices[starts[depths[i]]++] = i;
    }

    // Hand the buffer over; the renderer sends it straight back next frame.
    const out = indices;
    indices = new Uint32Array(count);
    self.postMessage({ type: 'sorted', indices: out, generation: msg.generation }, [out.buffer]);
  }

  if (msg.type === 'recycle') {
    // Reuse the buffer the renderer finished with instead of allocating.
    if (msg.indices && msg.indices.length === count) indices = msg.indices;
  }
};
