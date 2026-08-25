import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap.js'
import { prefersReducedMotion } from '../lib/prefs.js'
import { SplitWords } from '../lib/text.jsx'
import { useReveal } from '../lib/useReveal.js'
import Marquee from '../components/Marquee.jsx'
import { recognition, stats, clients } from '../data/site.js'

function Counter({ to, suffix }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (prefersReducedMotion()) {
      el.textContent = `${to}${suffix}`
      return undefined
    }

    const ctx = gsap.context(() => {
      const obj = { v: 0 }
      gsap.to(obj, {
        v: to,
        duration: 2.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => {
          el.textContent = `${Math.round(obj.v)}${suffix}`
        },
      })
    }, el)

    return () => ctx.revert()
  }, [to, suffix])

  return (
    <span className="display stat__k" ref={ref} aria-hidden="true">
      0{suffix}
    </span>
  )
}

export default function Recognition() {
  const scope = useReveal({ start: 'top 82%' })

  return (
    <section className="band recog" ref={scope}>
      <div className="shell">
        <div className="band__index">
          <span className="label">Evidence</span>
          <span className="label">/ 05</span>
        </div>

        <ul className="recog__stats">
          {stats.map((s) => (
            <li key={s.label} data-reveal>
              <Counter to={s.k} suffix={s.suffix} />
              <span className="sr-only">
                {s.k}
                {s.suffix}
              </span>
              <p className="stat__v">{s.label}</p>
            </li>
          ))}
        </ul>

        <div className="recog__split">
          <div className="recog__lead">
            <h2 className="display recog__h">
              <SplitWords text="Occasionally the industry notices." />
            </h2>
            <p className="recog__note" data-reveal>
              Awards are a lagging indicator, not a brief. They are here because
              they answer the only question a jury and a user ask in the same
              breath: did the thing actually work?
            </p>
            <p className="label recog__clientsLabel" data-reveal>
              Selected clients
            </p>
          </div>

          <ol className="recog__list">
            {recognition.map((r) => (
              <li key={`${r.y}-${r.t}`} data-reveal>
                <span className="label recog__y">{r.y}</span>
                <span className="recog__t">{r.t}</span>
                <span className="recog__s muted">{r.s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="recog__clients">
        <Marquee items={clients} speed={38} direction={-1} separator="◦" className="mq--ghost" />
      </div>
    </section>
  )
}
