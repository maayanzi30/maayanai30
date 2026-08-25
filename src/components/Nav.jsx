import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap.js'
import { scrollToId, lockScroll } from '../lib/useSmoothScroll.js'
import { useMagnetic } from '../lib/useMagnetic.js'
import { nav, person, socials } from '../data/site.js'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const bar = useRef(null)
  const sheet = useRef(null)
  const cta = useMagnetic(0.28, 70)

  /* Hide the bar on the way down, bring it back on the way up. */
  useEffect(() => {
    const el = bar.current
    if (!el) return undefined

    const ctx = gsap.context(() => {
      const show = gsap.quickTo(el, 'yPercent', { duration: 0.5, ease: 'power3.out' })
      ScrollTrigger.create({
        start: 'top -10',
        end: 99999,
        onUpdate: (self) => {
          el.dataset.pinned = self.scroll() > 40 ? 'true' : 'false'
          show(self.direction === 1 && self.scroll() > 320 ? -140 : 0)
        },
      })
    })

    return () => ctx.revert()
  }, [])

  /* Which section is under the fold line. The hero is registered last so
     that on first paint it wins and no pill is lit at the top of the page. */
  useEffect(() => {
    const triggers = [...nav.map((n) => n.id), 'top']
      .map((id) => {
        const el = document.getElementById(id)
        if (!el) return null
        return ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => self.isActive && setActive(id === 'top' ? '' : id),
        })
      })
      .filter(Boolean)
    return () => triggers.forEach((t) => t.kill())
  }, [])

  /* Sheet open/close. */
  useEffect(() => {
    const el = sheet.current
    if (!el) return undefined
    lockScroll(open)

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(el, { display: 'block' })
        gsap
          .timeline()
          .fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.72, ease: 'expo.inOut' })
          .from('[data-sheet-item]', { yPercent: 110, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.055 }, '-=0.34')
      } else {
        gsap.to(el, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.55,
          ease: 'expo.inOut',
          onComplete: () => gsap.set(el, { display: 'none' }),
        })
      }
    }, el)

    return () => ctx.revert()
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    // Let the sheet start closing before the scroll takes over.
    setTimeout(() => scrollToId(id, { offset: -8 }), open ? 220 : 0)
  }

  return (
    <>
      <header className="nav" ref={bar} data-pinned="false">
        <div className="nav__inner">
          <a className="nav__mark" href="#top" onClick={go('top')} data-cursor="link" aria-label={`${person.name} — home`}>
            <span className="nav__mark-glyph" aria-hidden="true">
              MK
            </span>
            <span className="nav__mark-text">
              <b>{person.name}</b>
              <i>{person.shortRole}</i>
            </span>
          </a>

          <nav className="nav__links" aria-label="Sections">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={go(item.id)}
                data-cursor="link"
                data-active={active === item.id}
              >
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="nav__end">
            <span className="nav__status">
              <i className="pulse-dot" />
              <span>{person.availability}</span>
            </span>
            <a
              className="btn nav__cta"
              href={`mailto:${person.email}`}
              ref={cta}
              data-cursor="link"
            >
              Start a project
            </a>
            <button
              className="nav__burger"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="nav-sheet"
              data-cursor="link"
            >
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
              <i data-open={open} />
              <i data-open={open} />
            </button>
          </div>
        </div>
      </header>

      <div className="sheet" id="nav-sheet" ref={sheet} hidden={!open}>
        <div className="sheet__inner">
          <ul className="sheet__list">
            {nav.map((item, i) => (
              <li key={item.id}>
                <span className="rv-line">
                  <a
                    className="display"
                    href={`#${item.id}`}
                    onClick={go(item.id)}
                    data-sheet-item
                    data-cursor="link"
                  >
                    <em>{String(i + 1).padStart(2, '0')}</em>
                    {item.label}
                  </a>
                </span>
              </li>
            ))}
          </ul>
          <div className="sheet__foot">
            <a className="sheet__mail tlink" href={`mailto:${person.email}`}>
              {person.email}
            </a>
            <ul className="sheet__social">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="tlink" target="_blank" rel="noreferrer noopener">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
