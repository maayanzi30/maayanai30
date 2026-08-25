import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap.js'
import { prefersReducedMotion } from '../lib/prefs.js'
import { person } from '../data/site.js'

const COLUMNS = 6

export default function Preloader({ onDone }) {
  const root = useRef(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = root.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      setCount(100)
      const id = setTimeout(() => {
        gsap.set(el, { display: 'none' })
        onDone?.()
      }, 220)
      return () => clearTimeout(id)
    }

    const ctx = gsap.context(() => {
      const counter = { v: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(el, { display: 'none' })
          onDone?.()
        },
      })

      tl.from('[data-pre-word]', {
        yPercent: 118,
        duration: 1.0,
        ease: 'expo.out',
        stagger: 0.06,
      })
        .to('[data-pre-rule]', { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, 0.1)
        .to(
          counter,
          {
            v: 100,
            duration: 1.7,
            ease: 'power2.inOut',
            onUpdate: () => setCount(Math.round(counter.v)),
          },
          0.1
        )
        .to('[data-pre-fade]', { opacity: 0, duration: 0.4, ease: 'power2.in' }, '>-0.05')
        .to(
          '[data-pre-col]',
          {
            scaleY: 0,
            duration: 0.95,
            ease: 'expo.inOut',
            stagger: { each: 0.055, from: 'start' },
            transformOrigin: 'top center',
          },
          '<0.1'
        )
        .add(() => {
          document.documentElement.dataset.loaded = 'true'
        }, '<0.35')
    }, el)

    return () => ctx.revert()
  }, [onDone])

  return (
    <div className="pre" ref={root} role="status" aria-live="polite">
      <div className="pre__cols" aria-hidden="true">
        {Array.from({ length: COLUMNS }, (_, i) => (
          <span className="pre__col" data-pre-col key={i} />
        ))}
      </div>

      <div className="pre__inner" data-pre-fade>
        <div className="pre__top">
          <span className="label">Loading portfolio</span>
          <span className="label">{person.base}</span>
        </div>

        <h1 className="pre__name display">
          <span className="rv-line">
            <span data-pre-word>{person.first}</span>
          </span>
          <span className="rv-line">
            <span data-pre-word>{person.last}</span>
          </span>
        </h1>

        <div className="pre__bottom">
          <span className="pre__rule">
            <i data-pre-rule />
          </span>
          <span className="pre__count display">
            {String(count).padStart(3, '0')}
            <em>%</em>
          </span>
        </div>
      </div>
      <span className="sr-only">Loading — {count} percent</span>
    </div>
  )
}
