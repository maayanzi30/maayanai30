import { useState } from 'react'
import { SplitWords } from '../lib/text.jsx'
import { useReveal } from '../lib/useReveal.js'
import { process } from '../data/site.js'

export default function Process() {
  const scope = useReveal({ start: 'top 80%' })
  const [open, setOpen] = useState(0)

  return (
    <section className="band band--paper proc" id="process" ref={scope}>
      <div className="shell">
        <div className="band__index">
          <span className="label">How the work happens</span>
          <span className="label">/ 04</span>
        </div>

        <div className="band__head band__head--split">
          <h2 className="display band__title">
            <SplitWords text="Five weeks in, something real is running." />
          </h2>
          <p className="proc__aside" data-reveal>
            No discovery theatre, no forty-slide readouts. The deliverable at every
            stage is a decision you can act on.
          </p>
        </div>

        <ol className="proc__list">
          {process.map((s, i) => (
            <li
              key={s.n}
              className="proc__row"
              data-open={open === i}
              data-reveal
              onMouseEnter={() => setOpen(i)}
            >
              <button
                className="proc__btn"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                data-cursor="link"
              >
                <span className="proc__n label">{s.n}</span>
                <span className="display proc__t">{s.t}</span>
                <span className="proc__out label">{s.out}</span>
                <span className="proc__plus" aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
              <div className="proc__panel">
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
