import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap.js'
import { prefersReducedMotion } from '../lib/prefs.js'
import { lockScroll } from '../lib/useSmoothScroll.js'
import ProjectVisual from '../components/ProjectVisual.jsx'
import { projects, person } from '../data/site.js'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

export default function CaseOverlay({ id, onClose, onNavigate }) {
  const root = useRef(null)
  const panel = useRef(null)
  const restoreTo = useRef(null)

  const index = projects.findIndex((p) => p.id === id)
  const project = projects[index]
  const next = projects[(index + 1) % projects.length]

  /* Open / close choreography. */
  useEffect(() => {
    const el = root.current
    if (!el) return undefined

    restoreTo.current = document.activeElement
    lockScroll(true)

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 })
        gsap.set(panel.current, { yPercent: 0 })
        return
      }
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .set(el, { autoAlpha: 1 })
        .fromTo('[data-ov-scrim]', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
        .fromTo(panel.current, { yPercent: 100 }, { yPercent: 0, duration: 0.95 }, 0)
        .from('[data-ov-el]', { y: 40, opacity: 0, duration: 0.8, stagger: 0.05 }, 0.35)
    }, el)

    panel.current?.focus({ preventScroll: true })

    return () => {
      ctx.revert()
      lockScroll(false)
      const back = restoreTo.current
      if (back instanceof HTMLElement) back.focus({ preventScroll: true })
    }
  }, [id])

  /* Escape + focus trap. */
  useEffect(() => {
    const el = root.current
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !el) return
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!project) return null

  return (
    <div
      className="ov"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ov-title"
      data-accent={project.accent}
    >
      <button className="ov__scrim" data-ov-scrim onClick={onClose} aria-label="Close case study" />

      <div className="ov__panel" ref={panel} tabIndex={-1}>
        <div className="ov__bar">
          <span className="label">
            Case study {project.index} — {project.year}
          </span>
          <button className="ov__close" onClick={onClose} data-cursor="link">
            <span>Close</span>
            <i aria-hidden="true" />
          </button>
        </div>

        <div className="ov__scroll">
          <header className="ov__head">
            <h2 className="display ov__title" id="ov-title" data-ov-el>
              {project.name}
            </h2>
            <p className="ov__kicker lede" data-ov-el>
              {project.kicker}
            </p>
          </header>

          <div className="ov__stage" data-ov-el>
            <ProjectVisual id={project.id} />
          </div>

          <div className="ov__grid">
            <dl className="ov__facts" data-ov-el>
              <div>
                <dt className="label">Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt className="label">Year</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt className="label">Scope</dt>
                <dd>{project.scope.join(' · ')}</dd>
              </div>
              <div>
                <dt className="label">Toolkit</dt>
                <dd>{project.stack.join(' · ')}</dd>
              </div>
            </dl>

            <div className="ov__body">
              <p className="lede" data-ov-el>
                {project.summary}
              </p>
              {project.body.map((p, i) => (
                <p key={i} data-ov-el>
                  {p}
                </p>
              ))}
            </div>
          </div>

          <ul className="ov__metrics">
            {project.metrics.map((m) => (
              <li key={m.v} data-ov-el>
                <span className="display ov__mk">{m.k}</span>
                <span className="ov__mv">{m.v}</span>
              </li>
            ))}
          </ul>

          <div className="ov__foot">
            <button
              className="ov__next"
              onClick={() => onNavigate(next.id)}
              data-cursor="view"
              data-cursor-label="Next"
            >
              <span className="label">Next case</span>
              <span className="display ov__nextName">{next.name}</span>
              <i aria-hidden="true">↗</i>
            </button>
            <a className="btn" href={`mailto:${person.email}`} data-cursor="link">
              <span className="btn__dot" />
              Work with me
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
