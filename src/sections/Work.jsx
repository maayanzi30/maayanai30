import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap.js'
import { scrollToY } from '../lib/useSmoothScroll.js'
import { SplitWords } from '../lib/text.jsx'
import { useReveal } from '../lib/useReveal.js'
import ProjectVisual from '../components/ProjectVisual.jsx'
import { projects, person } from '../data/site.js'

function Card({ p, total, onOpen }) {
  return (
    <article className="pcard" data-accent={p.accent}>
      <button
        className="pcard__hit"
        onClick={() => onOpen(p.id)}
        data-cursor="view"
        data-cursor-label="Case"
        aria-label={`Open case study — ${p.name}: ${p.kicker}`}
      />
      <header className="pcard__top">
        <span className="label pcard__index">
          {p.index} <i>/ {total}</i>
        </span>
        <span className="label">{p.year}</span>
      </header>

      <div className="pcard__visual" data-card-el>
        <ProjectVisual id={p.id} />
        <span className="pcard__glow" aria-hidden="true" />
      </div>

      <div className="pcard__meta">
        <h3 className="display pcard__name" data-card-el>
          {p.name}
        </h3>
        <p className="pcard__kicker" data-card-el>
          {p.kicker}
        </p>
        <p className="pcard__summary" data-card-el>
          {p.summary}
        </p>
        <ul className="pcard__scope" data-card-el>
          {p.scope.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
        <footer className="pcard__foot" data-card-el>
          <span>{p.role}</span>
          <span className="pcard__go" aria-hidden="true">
            Open case <i>↗</i>
          </span>
        </footer>
      </div>
    </article>
  )
}

export default function Work({ onOpen }) {
  const head = useReveal({ start: 'top 82%' })
  const pin = useRef(null)
  const track = useRef(null)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const pinEl = pin.current
    const trackEl = track.current
    if (!pinEl || !trackEl) return undefined

    const mm = gsap.matchMedia()

    /* Desktop: pin the viewport and translate the rail horizontally. */
    mm.add('(min-width: 940px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth + 32)

      const tween = gsap.to(trackEl, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setProgress(self.progress)
            const cards = trackEl.querySelectorAll('.pcard').length
            setCurrent(Math.min(cards - 1, Math.round(self.progress * (cards - 1))))
          },
        },
      })

      /* Each card composes itself as it slides into frame. */
      const cards = gsap.utils.toArray('.pcard', trackEl)
      cards.forEach((card) => {
        const bits = card.querySelectorAll('[data-card-el]')
        gsap.from(bits, {
          y: 44,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: {
            trigger: card,
            containerAnimation: tween,
            start: 'left 92%',
            once: true,
          },
        })
        gsap.fromTo(
          card.querySelector('.pcard__visual'),
          { xPercent: 4 },
          {
            xPercent: -4,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          }
        )
      })

      /* Keyboard focus moves along the rail, but the rail is driven by page
         scroll — so translate "this card is focused" back into a scroll
         position, or tabbing would focus cards nobody can see. */
      const onFocusIn = (e) => {
        const card = e.target.closest?.('.pcard')
        const st = tween.scrollTrigger
        if (!card || !st) return
        const d = distance()
        if (d <= 0) return
        const ratio = gsap.utils.clamp(
          0,
          1,
          (card.offsetLeft - window.innerWidth * 0.22) / d
        )
        scrollToY(st.start + ratio * (st.end - st.start))
      }
      trackEl.addEventListener('focusin', onFocusIn)

      return () => {
        trackEl.removeEventListener('focusin', onFocusIn)
        setProgress(0)
        gsap.set(trackEl, { x: 0 })
      }
    })

    /* Below the breakpoint the rail is a native, snapping scroller. */
    mm.add('(max-width: 939px), (prefers-reduced-motion: reduce)', () => {
      const onScroll = () => {
        const max = trackEl.scrollWidth - trackEl.clientWidth
        setProgress(max > 0 ? trackEl.scrollLeft / max : 0)
      }
      trackEl.addEventListener('scroll', onScroll, { passive: true })
      return () => trackEl.removeEventListener('scroll', onScroll)
    })

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      mm.revert()
      window.removeEventListener('load', onLoad)
    }
  }, [])

  const total = String(projects.length).padStart(2, '0')

  return (
    <section className="band band--flush work" id="work">
      <div className="shell work__head" ref={head}>
        <div className="band__index">
          <span className="label">Selected work</span>
          <span className="label">/ 02</span>
        </div>
        <div className="band__head band__head--split">
          <h2 className="display band__title">
            <SplitWords text="Six products, shipped and still running." />
          </h2>
          <div className="work__aside">
            <p className="muted" data-reveal>
              Case studies from {person.years} years of practice — wallets, editors,
              rosters and control rooms. Keep scrolling — the rail moves with you.
            </p>
            <p className="work__hint label" data-reveal>
              <i aria-hidden="true">←</i> Horizontal <i aria-hidden="true">→</i>
            </p>
          </div>
        </div>
      </div>

      <div className="work__pin" ref={pin}>
        <div
          className="work__track"
          ref={track}
          role="region"
          aria-label="Selected work, horizontally scrolling"
          tabIndex={0}
        >
          {projects.map((p) => (
            <Card key={p.id} p={p} total={total} onOpen={onOpen} />
          ))}

          <article className="pcard pcard--end" data-accent="lime">
            <div className="pcard__endInner">
              <span className="label">End of reel</span>
              <p className="display pcard__endH">
                Yours
                <br />
                next?
              </p>
              <p className="pcard__summary">
                Archive and long-form write-ups available on request — including the
                three that never shipped and taught me more.
              </p>
              <a className="btn btn--ink" href={`mailto:${person.email}`} data-cursor="link">
                <span className="btn__dot" />
                Start a project
              </a>
            </div>
          </article>
        </div>

        <div className="work__hud" aria-hidden="true">
          <span className="work__hudIdx label">
            {projects[current]?.index ?? '07'} —{' '}
            {projects[current]?.name ?? 'Your project'}
          </span>
          <span className="work__bar">
            <i style={{ transform: `scaleX(${Math.max(0.02, progress)})` }} />
          </span>
          <span className="work__hudTotal label">{total}</span>
        </div>
      </div>
    </section>
  )
}
