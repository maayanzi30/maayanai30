import fs from 'node:fs'
import path from 'node:path'

/**
 * Folds dist-embed into one portable HTML fragment: fonts become data URIs
 * inside the stylesheet, the stylesheet becomes a <style>, and the module
 * bundle becomes an inline <script type="module">.
 *
 * The output is a body fragment — no doctype, <html>, <head> or <body> — since
 * the host that renders it supplies its own document skeleton.
 */

const root = process.argv[2] || 'dist-embed'
const out = process.argv[3] || 'dist-embed/standalone.html'
// The site's <title> is written for search results; a hosted single page wants
// the short name instead. Pass one to override.
const titleOverride = process.argv[4]

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')

const cssHref = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)?.[1]
const jsSrc = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1]
if (!cssHref || !jsSrc) throw new Error('could not locate the built css/js in index.html')

const read = (href) => fs.readFileSync(path.join(root, href.replace(/^\//, '')), 'utf8')

let css = read(cssHref)

// Fonts live in public/ and are copied verbatim, so rewrite their url()s.
css = css.replace(/url\(["']?(\/fonts\/[^"')]+)["']?\)/g, (_m, p) => {
  const buf = fs.readFileSync(path.join(root, p.replace(/^\//, '')))
  return `url("data:font/woff2;base64,${buf.toString('base64')}")`
})

const js = read(jsSrc)

const title = titleOverride ?? html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'Portfolio'
const description = html.match(/name="description"\s+content="([^"]*)"/s)?.[1] ?? ''

const fragment = `<title>${title}</title>
<meta name="description" content="${description.replace(/\s+/g, ' ').trim()}" />

<style>
${css}
</style>

<div id="root"></div>

<script type="module">
${js}
</script>
`

fs.writeFileSync(out, fragment)
const kb = (n) => `${Math.round(n / 1024)} kB`
console.log(
  `wrote ${out} — ${kb(Buffer.byteLength(fragment))} total (css ${kb(css.length)}, js ${kb(js.length)})`
)
