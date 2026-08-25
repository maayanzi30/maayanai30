import { useReveal } from '../lib/useReveal.js'
import { useMagnetic } from '../lib/useMagnetic.js'
import Marquee from '../components/Marquee.jsx'
import { person, socials } from '../data/site.js'

export default function Contact() {
  const scope = useReveal({ start: 'top 78%' })
  const mail = useMagnetic(0.24, 100)

  return (
    <section className="band contact" id="contact" ref={scope}>
      <span className="contact__stripes" aria-hidden="true" />

      <div className="shell contact__inner">
        <div className="band__index">
          <span className="label">Contact</span>
          <span className="label">/ 07</span>
        </div>

        <h2 className="contact__h">
          <span className="rv-line">
            <span className="display" data-word>
              Got a hard
            </span>
          </span>
          <span className="rv-line">
            <span className="display" data-word>
              problem?
            </span>
          </span>
          <span className="rv-line">
            <span className="display contact__h2" data-word>
              Then let&rsquo;s make it move.
            </span>
          </span>
        </h2>

        <div className="contact__row">
          <div className="contact__copy" data-reveal>
            <p>
              Tell me what is stuck. A paragraph is enough — the deck can wait.
              I reply to everything within two working days.
            </p>
            <p className="contact__avail">
              <i className="pulse-dot" />
              {person.availability}
            </p>
          </div>

          <a
            className="contact__mail"
            href={`mailto:${person.email}`}
            ref={mail}
            data-cursor="view"
            data-cursor-label="Write"
            data-reveal
          >
            <span className="contact__mailText">{person.email}</span>
            <span className="contact__mailIcon" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>

        <ul className="contact__socials">
          {socials
            .filter((s) => s.label !== 'Email')
            .map((s) => (
              <li key={s.label} data-reveal>
                <a href={s.href} target="_blank" rel="noreferrer noopener" data-cursor="link">
                  <em>{s.short}</em>
                  <span className="tlink">{s.label}</span>
                </a>
              </li>
            ))}
        </ul>
      </div>

      <div className="contact__ticker" aria-hidden="true">
        <Marquee
          items={['Available Q1 2027', 'New work', 'Say hello', 'Design partner', 'Ship something good']}
          speed={34}
          direction={-1}
          separator="✦"
          className="mq--ink"
        />
      </div>
    </section>
  )
}
