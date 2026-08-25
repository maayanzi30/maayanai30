# Milo Kestrel — portfolio

A portfolio site for **Milo Kestrel**, a fictional independent product designer
and creative technologist, built as a piece of art direction as much as a piece
of front-end.

Poster-scale condensed typography on near-black, hard-ruled section breaks,
vivid single-hue blocks, a horizontally scrolling case-study rail, and two
live WebGL surfaces. React + Vite, GSAP + Lenis for motion, Three.js for the
shader work.

> Milo Kestrel, the studio, the clients and every metric on the site are
> invented. Nothing here describes a real person or a real engagement.

## Run it

```bash
npm install
npm run dev      # dev server
npm run build    # production build to dist/
npm run preview  # serve the build on :4173
```

Node 20+.

## What's in here

```
src/
  components/        Site chrome — preloader, cursor, nav, marquee, overlay
    webgl/           The two Three.js scenes
  sections/          One file per band of the page, in page order
  lib/               Motion + WebGL infrastructure
  styles/            tokens → base → chrome → sections → visuals
  data/site.js       Every string on the site
public/fonts/        Self-hosted variable fonts
```

`src/data/site.js` is the single source of truth for content. Change the copy,
projects, capabilities or metrics there and the page follows.

## Design system

Tokens live in `src/styles/tokens.css`.

- **Display** — Archivo variable. The width axis (`wdth` 62–125) does the work:
  headlines run condensed at 70–78, the ticker sits wider at 82.
- **Body** — Space Grotesk. **Meta** — JetBrains Mono for labels and numerals.
- **Colour** — near-black `--ink-900` ground, `--paper` for the light bands, and
  one accent per block: lime, blue, violet, sky, orange. A tile owns its hue;
  hues do not mix inside one block.
- **Sectioning** — hairline rules and full-bleed colour changes mark each band,
  rather than shadow or spacing alone.

## Motion

- **Lenis** drives scrolling and is wired into the GSAP ticker, so smooth
  scroll and ScrollTrigger share one clock (`lib/useSmoothScroll.js`).
- **Reveals** are word-level: `SplitWords` wraps each word in its own clip mask
  and `useReveal` slides them out on a stagger. Word splitting survives resize
  in a way line splitting does not.
- **The work rail** pins the viewport and translates horizontally on scroll
  above 940px. Below that it degrades to a native scroll-snap carousel, which
  is simply better on touch. Keyboard focus on a card is translated back into a
  scroll position so tabbing never focuses something off-screen.
- **Reduced motion** is a real path, not a switch-off: Lenis never
  initialises, the preloader resolves immediately, WebGL is skipped, and every
  reveal renders in its final state.

## WebGL

Two scenes, both lazy-loaded and both optional.

- `HeroField` — a full-screen fragment shader. Three-octave fbm through two
  rounds of domain warping, ramped ink → blue → violet with a luminous seam
  and cursor-reactive warp. Deliberately low frequency: broad forms sit under
  the headline where fine turbulence would fight it.
- `Relief` — an icosphere displaced by noise, shaded with a real terminator, a
  fresnel rim and topographic contours read off the displacement field.
  Normals are solved in the vertex shader from two tangential probes, so the
  surface stays correctly lit while it deforms.

`lib/useGLStage.js` holds the shared scaffolding: DPR cap, `ResizeObserver`,
and a RAF loop that stops when the canvas leaves the viewport or the tab is
hidden. It hands `update()` both a clamped animation clock and unclamped
wall-clock `age` — intro fades must use the latter, or on a slow device a fade
takes frame-count time instead of real time.

`shouldRenderWebGL()` (`lib/prefs.js`) declines on reduced-motion, narrow
screens, low core counts, low device memory, and missing context. Every
section is designed to be complete without it — the hero falls back to a CSS
gradient that carries the same palette.

## Performance

- Three.js and the GSAP/Lenis bundle are split out; Three is only fetched when
  a scene actually mounts, so it never touches the critical path.
- Fonts are self-hosted woff2 variable files, latin subset preloaded,
  latin-ext held behind its unicode-range. No third-party connection.
- The case-study visuals are markup, not images: they weigh nothing, stay sharp
  at any size, and recolour from one token.
- Device pixel ratio is capped at 1.75; offscreen and backgrounded canvases
  stop rendering.

## Accessibility

Semantic landmarks, a skip link, visible focus rings, labelled controls, and a
case-study overlay that traps focus, closes on Escape and restores focus to the
card that opened it. Decorative canvases are `aria-hidden`; the hero headline
carries a screen-reader sentence naming the designer and role. Keyboard order
follows reading order through the pinned rail.

Automated checks only go so far — a manual screen-reader pass is still worth
doing before anything like this goes live.

## Single-file build

`npm run build:embed` produces `dist-embed/standalone.html` — the whole site as
one portable HTML fragment, with the fonts as data URIs and the CSS and JS
inlined. Useful for hosting the site anywhere that takes a single file. Code
splitting is disabled for this build only (`vite.artifact.config.js`); the
normal `npm run build` keeps Three.js off the critical path.
