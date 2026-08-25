import { SplitWords } from '../lib/text.jsx'
import { useReveal } from '../lib/useReveal.js'
import CapViz from '../components/CapViz.jsx'
import { capabilities } from '../data/site.js'

export default function Capabilities() {
  const scope = useReveal({ start: 'top 80%' })

  return (
    <section className="band caps" id="capabilities" ref={scope}>
      <div className="shell">
        <div className="band__index">
          <span className="label">Capabilities</span>
          <span className="label">/ 03</span>
        </div>

        <div className="band__head band__head--split">
          <h2 className="display band__title">
            <SplitWords text="What you actually hire." />
          </h2>
          <p className="muted caps__aside" data-reveal>
            Five things, done properly, usually in combination. Most engagements start
            with one and grow into three.
          </p>
        </div>

        <ul className="caps__grid">
          {capabilities.map((c, i) => (
            <li
              key={c.id}
              className="cap"
              data-tone={c.tone}
              data-span={c.span}
              data-reveal
              data-cursor="link"
            >
              <span className="cap__n label">{String(i + 1).padStart(2, '0')}</span>
              <CapViz id={c.id} />
              <div className="cap__body">
                <p className="cap__line">{c.line}</p>
                <h3 className="display cap__title">{c.title}</h3>
                <p className="cap__copy">{c.body}</p>
              </div>
              <ul className="cap__items">
                {c.items.map((it) => (
                  <li key={it}>
                    <i aria-hidden="true" />
                    {it}
                  </li>
                ))}
              </ul>
              <span className="cap__arrow" aria-hidden="true">
                ↗
              </span>
              <span className="cap__sheen" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
