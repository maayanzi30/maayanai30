import { useEffect, useState } from 'react'
import { person, socials, nav, faqLite } from '../data/site.js'
import { scrollToId } from '../lib/useSmoothScroll.js'
import { useReveal } from '../lib/useReveal.js'

function useLocalClock(timeZone) {
  const [now, setNow] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone,
    })
    const tick = () => setNow(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [timeZone])
  return now
}

export default function Footer() {
  const clock = useLocalClock(person.timezone)
  const scope = useReveal({ start: 'top 88%' })
  const year = new Date().getFullYear()

  return (
    <footer className="foot" ref={scope}>
      <div className="shell">
        <div className="foot__grid">
          <div className="foot__col foot__col--lead">
            <span className="label">Elsewhere</span>
            <ul className="foot__social">
              {socials.map((s) => (
                <li key={s.label} data-reveal>
                  <a href={s.href} target="_blank" rel="noreferrer noopener" data-cursor="link">
                    <em>{s.short}</em>
                    <span className="tlink">{s.label}</span>
                    <i aria-hidden="true">↗</i>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="foot__col">
            <span className="label">Index</span>
            <ul className="foot__nav">
              {nav.map((n) => (
                <li key={n.id} data-reveal>
                  <a
                    href={`#${n.id}`}
                    className="tlink"
                    data-cursor="link"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToId(n.id)
                    }}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="foot__col">
            <span className="label">Terms of engagement</span>
            <dl className="foot__meta">
              {faqLite.map((f) => (
                <div key={f.k} data-reveal>
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="foot__col foot__col--now">
            <span className="label">Local time · {person.base}</span>
            <p className="foot__clock" data-reveal>
              <time>{clock || '--:--:--'}</time>
            </p>
            <p className="foot__avail" data-reveal>
              <i className="pulse-dot" />
              {person.availability}
            </p>
          </div>
        </div>
      </div>

      <div className="foot__mark" aria-hidden="true">
        <span className="display">Kestrel</span>
      </div>

      <div className="shell">
        <div className="foot__base">
          <p>
            © {year} {person.name}. A fictional practice, designed and built as a
            portfolio piece.
          </p>
          <p className="foot__colophon">
            Archivo &amp; Space Grotesk · React, GSAP, Three.js · Built with intent
          </p>
          <button
            className="foot__top tlink"
            onClick={() => scrollToId('top')}
            data-cursor="link"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
