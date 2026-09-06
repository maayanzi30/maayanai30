// Bundles the whole site into one self-contained HTML file: no module graph, no
// worker script, no asset requests. Everything is inlined, which is what a
// sandboxed preview host (or an offline copy on a USB stick) needs.
//
//   node scripts/build-standalone.mjs [outFile] [frameStride]
//
// The image sequence is the only thing that gets trimmed: frames are embedded as
// data URIs, so `frameStride` lets you drop every Nth frame to keep the file
// small. Stride 2 keeps 24 of the 48 frames and still loops seamlessly.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || join(ROOT, 'dist', 'index.html');
const STRIDE = Number(process.argv[3] || 2);

// Dependency order. The modules have no circular imports and no name
// collisions, so concatenating them in this order is all the bundling needed.
const MODULES = [
  'src/core/math.js',
  'src/core/gl.js',
  'src/splats/shaders.js',
  'src/splats/generate.js',
  'src/splats/loader.js',
  'src/splats/renderer.js',
  'src/post/shaders.js',
  'src/post/composer.js',
  'src/scene/chapters.js',
  'src/scene/director.js',
  'src/media/sequence.js',
  'src/ui/preloader.js',
  'src/ui/cursor.js',
  'src/ui/nav.js',
  'src/ui/palette.js',
  'src/main.js',
];

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

function flatten(source) {
  return source
    .split('\n')
    .filter((line) => !/^import\s/.test(line) && !/^export\s*\{/.test(line))
    .map((line) => line.replace(/^export\s+/, ''))
    .join('\n');
}

// --- the sorter -------------------------------------------------------------------
// The worker source expects a `self` with onmessage/postMessage. Handing it a
// stand-in object runs the identical code on the main thread, so the single-file
// build needs no worker script and no blob URL (which a strict CSP would block).
const workerSource = read('src/splats/sort.worker.js');

const sorterShim = `
const __SORT_WORKER_SOURCE = ${JSON.stringify(workerSource)};

globalThis.__splatSorterFactory = () => {
  const shim = {
    onmessage: null,
    postMessage(message) {
      if (shim.onmessage) shim.onmessage({ data: message });
    },
  };
  // eslint-disable-next-line no-new-func
  const run = new Function('self', __SORT_WORKER_SOURCE);
  const inner = {
    onmessage: null,
    postMessage: (message) => shim.postMessage(message),
  };
  run(inner);
  return {
    set onmessage(handler) { shim.onmessage = handler; },
    get onmessage() { return shim.onmessage; },
    postMessage(message) {
      // synchronous: the sort is a few ms and only runs when the camera moves
      if (inner.onmessage) inner.onmessage({ data: message });
    },
    terminate() {},
  };
};
`;

// --- the image sequence -----------------------------------------------------------
const manifestPath = join(ROOT, 'assets', 'sequence', 'manifest.json');
let sequenceShim = 'const __SEQUENCE = null;\n';

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const uris = [];
  for (let i = 0; i < manifest.frames; i += STRIDE) {
    const name = manifest.pattern.replace('{i}', String(i).padStart(manifest.pad ?? 4, '0'));
    const bytes = readFileSync(join(ROOT, name));
    uris.push(`data:image/png;base64,${bytes.toString('base64')}`);
  }
  sequenceShim =
    `const __SEQUENCE = {\n  aspect: ${manifest.width / manifest.height},\n` +
    `  frames: ${JSON.stringify(uris)},\n};\n`;
  console.log(`  sequence: ${uris.length} of ${manifest.frames} frames inlined`);
}

// main.js fetches the manifest; point it at the embedded frames instead.
let bundle = MODULES.map((m) => `\n// ===== ${m} =====\n${flatten(read(m))}`).join('\n');

const loadCall = `await sequence.loadSequence('assets/sequence/manifest.json',
      (p) => preloader.setProgress(0.58 + p * 0.34));`;
if (!bundle.includes(loadCall)) throw new Error('sequence load call not found - bundler is out of date');
bundle = bundle.replace(
  loadCall,
  `await sequence.loadInlineSequence(__SEQUENCE.frames, __SEQUENCE.aspect,
      (p) => preloader.setProgress(0.58 + p * 0.34));`
);

// --- markup -----------------------------------------------------------------------
const html = read('index.html');
const bodyMatch = html.match(/<body>([\s\S]*)<script type="module"/);
if (!bodyMatch) throw new Error('could not extract the body from index.html');
const body = bodyMatch[1].replace(/<noscript>[\s\S]*?<\/noscript>/, '').trim();

const css = read('styles/main.css');

const page = `<title>מעיין זי</title>
<!-- Without this a phone lays the page out at 980px and every mobile media
     query misses. Hosts that inject their own viewport meta just win the tie. -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='9' fill='none' stroke='%23d9b48f' stroke-width='1.5'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500&family=Assistant:wght@200;300;400;600&display=swap">
<style>
/* The host page supplies its own light ground, so paint ours explicitly. */
html, body { background: #0a0709; margin: 0; padding: 0; }
${css}
</style>

<div class="site-root" dir="rtl" lang="he">
${body}
</div>

<script type="module">
${sorterShim}
${sequenceShim}
${bundle}
</script>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, page);

const kb = (Buffer.byteLength(page) / 1024).toFixed(0);
console.log(`  wrote ${OUT}  (${kb} KB, ${(kb / 1024).toFixed(2)} MB)`);

// Also emit the bundled script on its own so it can be syntax-checked.
writeFileSync(join(dirname(OUT), 'bundle.mjs'), sorterShim + sequenceShim + bundle);
