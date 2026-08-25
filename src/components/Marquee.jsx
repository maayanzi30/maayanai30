import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap.js'
import { prefersReducedMotion } from '../lib/prefs.js'

/**
 * Infinite ticker. Two identical groups slide as one track, so the loop is
 * seamless at any width. Scroll velocity nudges timeScale — the strip leans
 * into the direction you are travelling.
 */
export default function Marquee({
  items,
  speed = 26,
  direction = 1,
  className = '',
  separator = '—',
  reactive = true,
}) {
  const track = useRef(null)

  useEffect(() => {
    const el = track.current
    if (!el || prefersReducedMotion()) return undefined

    const ctx = gsap.context(() => {
      // Travel one group's width in whichever direction, always starting
      // from the edge that keeps the strip full.
      const tween = gsap.fromTo(
        el,
        { xPercent: direction === 1 ? 0 : -50 },
        { xPercent: direction === 1 ? -50 : 0, duration: speed, ease: 'none', repeat: -1 }
      )

      if (!reactive) return

      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-9, 9, self.getVelocity() / 260)
          gsap.to(tween, {
            timeScale: 1 + Math.abs(v) * 0.55,
            duration: 0.4,
            overwrite: true,
          })
        },
      })

      let idle
      const settle = () => {
        clearTimeout(idle)
        idle = setTimeout(() => gsap.to(tween, { timeScale: 1, duration: 0.8 }), 180)
      }
      window.addEventListener('scroll', settle, { passive: true })

      return () => {
        clearTimeout(idle)
        window.removeEventListener('scroll', settle)
        st.kill()
      }
    }, el)

    return () => ctx.revert()
  }, [speed, direction, reactive])

  const group = (key) => (
    <span className="mq__group" key={key} aria-hidden={key === 'b' ? 'true' : undefined}>
      {items.map((it, i) => (
        <span className="mq__item" key={i}>
          {it}
          <i className="mq__sep" aria-hidden="true">
            {separator}
          </i>
        </span>
      ))}
    </span>
  )

  return (
    <div className={`mq ${className}`}>
      <div className="mq__track" ref={track}>
        {group('a')}
        {group('b')}
      </div>
    </div>
  )
}
