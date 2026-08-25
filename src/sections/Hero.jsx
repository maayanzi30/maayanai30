import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { gsap } from '../lib/gsap.js'
import { prefersReducedMotion, shouldRenderWebGL } from '../lib/prefs.js'
import { scrollToId } from '../lib/useSmoothScroll.js'
import { useMagnetic } from '../lib/useMagnetic.js'
import { hero, person } from '../data/site.js'

const HeroField = lazy(() => import('../components/webgl/HeroField.jsx'))

const NOW = [
  { n: '01', k: 'Now', v: 'Design partner to two product teams' },
  { n: '02', k: 'Based', v: 'Lisbon · working GMT ±3' },
  { n: '03', k: 'Next', v: person.availability },
]

export default function Hero({ ready }) {
  const root = useRef(null)
  const [gl, setGl] = useState(false)
  const cta = useMagnetic(0.3, 80)

  useEffect(() => {
    setGl(shouldRenderWebGL())
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    const el = root.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-hero]'), { yPercent: 0, opacity: 1 })
      gsap.set(el.querySelectorAll('[data-hero-fade]'), { y: 0, opacity: 1 })
      return undefined
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      tl.from('[data-hero]', { yPercent: 118, duration: 1.35, stagger: 0.085 })
        .from(
          '[data-hero-fade]',
          { y: 26, opacity: 0, duration: 1, stagger: 0.07 },
          '-=0.95'
        )
        .from('[data-hero-badge]', { scale: 0.5, opacity: 0, rotate: -70, duration: 1.1, ease: 'back.out(1.7)' }, '-=0.9')
        .from('[data-hero-cell]', { opacity: 0, y: 18, duration: 0.8, stagger: 0.08 }, '-=0.8')

      // Type drifts up and dims as the hero leaves; the field stays put.
      gsap.to('[data-hero-lockup]', {
        yPercent: -16,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    }, el)

    return () => ctx.revert()
  }, [ready])

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__field">
        {gl && (
          <Suspense fallback={null}>
            <HeroField />
          </Suspense>
        )}
        <span className="hero__fallback" aria-hidden="true" />
        <span className="hero__scrim" aria-hidden="true" />
      </div>

      <div className="hero__inner shell">
        <div className="hero__top">
          <p className="label" data-hero-fade>
            {hero.eyebrow}
          </p>
          <p className="label hero__coord" data-hero-fade>
            38.7223° N / 9.1393° W
          </p>
        </div>

        <div className="hero__lockup" data-hero-lockup>
          <h1 className="hero__h">
            <span className="sr-only">
              {person.name} — {person.role}. {hero.lines.join(' ')}.
            </span>
            <span className="rv-line" aria-hidden="true">
              <span className="display hero__l1" data-hero>
                Interfaces
              </span>
            </span>
            <span className="rv-line" aria-hidden="true">
              <span className="display hero__l2" data-hero>
                with a <mark>pulse</mark>
              </span>
            </span>
          </h1>

          <a
            className="hero__badge"
            href={`mailto:${person.email}`}
            data-hero-badge
            data-cursor="link"
            aria-label={`Available — ${person.availability}. Email ${person.email}`}
          >
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <path id="badgePath" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
              </defs>
              <text>
                <textPath href="#badgePath" startOffset="0%">
                  · Available Q1 2027 · Two slots open
                </textPath>
              </text>
            </svg>
            <i aria-hidden="true">↗</i>
          </a>
        </div>

        <div className="hero__mid">
          <p className="lede hero__statement" data-hero-fade>
            {hero.statement}
          </p>
          <div className="hero__acts" data-hero-fade>
            <button className="btn" onClick={() => scrollToId('work')} ref={cta} data-cursor="link">
              <span className="btn__dot" />
              See the work
            </button>
            <a className="btn btn--ghost" href={`mailto:${person.email}`} data-cursor="link">
              {person.email}
            </a>
          </div>
        </div>

        <div className="hero__foot">
          <button className="hero__scroll" onClick={() => scrollToId('practice')} data-cursor="link">
            <span className="label">Scroll</span>
            <i aria-hidden="true" />
          </button>
          <ul className="hero__cells">
            {NOW.map((cell) => (
              <li key={cell.n} data-hero-cell>
                <em className="label">{cell.n}</em>
                <span className="hero__cellK">{cell.k}</span>
                <span className="hero__cellV">{cell.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
