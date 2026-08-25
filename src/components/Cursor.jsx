import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap.js'
import { isCoarsePointer, prefersReducedMotion } from '../lib/prefs.js'

/**
 * Two-part cursor: a hard dot that tracks 1:1 and a ring that lags behind.
 * Elements opt into a state with data-cursor="view|drag|link|hide".
 */
export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (isCoarsePointer() || prefersReducedMotion()) return undefined

    const d = dot.current
    const r = ring.current
    const l = label.current
    if (!d || !r) return undefined

    document.documentElement.dataset.cursor = 'on'

    const dx = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'none' })
    const dy = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'none' })
    const rx = gsap.quickTo(r, 'x', { duration: 0.55, ease: 'power3.out' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.55, ease: 'power3.out' })

    let shown = false
    const onMove = (e) => {
      if (!shown) {
        shown = true
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)

      const hit = e.target instanceof Element ? e.target.closest('[data-cursor]') : null
      const state = hit?.getAttribute('data-cursor') || 'default'
      if (r.dataset.state !== state) {
        r.dataset.state = state
        if (l) l.textContent = hit?.getAttribute('data-cursor-label') || ''
      }
    }

    const onDown = () => gsap.to(r, { scale: 0.78, duration: 0.22 })
    const onUp = () => gsap.to(r, { scale: 1, duration: 0.32 })
    const onLeave = () => {
      shown = false
      gsap.to([d, r], { autoAlpha: 0, duration: 0.2 })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      delete document.documentElement.dataset.cursor
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <span className="cursor__dot" ref={dot} />
      <span className="cursor__ring" ref={ring} data-state="default">
        <em ref={label} />
      </span>
    </div>
  )
}
