import { useEffect, useRef } from 'react'
import { gsap } from './gsap.js'
import { isCoarsePointer, prefersReducedMotion } from './prefs.js'

/**
 * Pulls an element toward the cursor within a radius. Skipped on touch
 * (no hover to speak of) and under reduced motion.
 */
export function useMagnetic(strength = 0.32, radius = 90) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || isCoarsePointer() || prefersReducedMotion()) return undefined

    const qx = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' })
    const qy = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' })

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy)
      const reach = Math.max(r.width, r.height) / 2 + radius
      if (dist > reach) {
        qx(0)
        qy(0)
        return
      }
      qx(dx * strength)
      qy(dy * strength)
    }

    const onLeave = () => {
      qx(0)
      qy(0)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onLeave, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onLeave)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [strength, radius])

  return ref
}
