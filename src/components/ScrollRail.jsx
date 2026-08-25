import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap.js'

/** Hairline progress bar pinned to the top edge of the page. */
export default function ScrollRail() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.25 },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="srail" aria-hidden="true">
      <i ref={ref} />
    </div>
  )
}
