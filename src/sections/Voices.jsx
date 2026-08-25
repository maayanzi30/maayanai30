import { SplitWords } from '../lib/text.jsx'
import { useReveal } from '../lib/useReveal.js'
import { voices } from '../data/site.js'

export default function Voices() {
  const scope = useReveal({ start: 'top 82%' })

  return (
    <section className="band voices" ref={scope}>
      <div className="shell">
        <div className="band__index">
          <span className="label">In their words</span>
          <span className="label">/ 06</span>
        </div>

        <h2 className="display band__title voices__h">
          <SplitWords text="The people who had to work with me." />
        </h2>

        <ul className="voices__grid">
          {voices.map((v, i) => (
            <li className="voice" key={v.n} data-tone={v.tone} data-reveal>
              <span className="voice__quote" aria-hidden="true">
                “
              </span>
              <blockquote>
                <p>{v.q}</p>
              </blockquote>
              <figcaption className="voice__by">
                <span className="voice__n">{v.n}</span>
                <span className="voice__r label">{v.r}</span>
              </figcaption>
              <span className="voice__i label" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
