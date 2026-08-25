import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from './gsap.js'
import { prefersReducedMotion } from './prefs.js'

/**
 * Scroll-in choreography for a section.
 * Words (from <SplitWords/>) rise out of their masks; anything tagged
 * [data-reveal] fades up behind them on a stagger.
 */
export function useReveal({ start = 'top 82%', once = true } = {}) {
  const scope = useRef(null)

  useEffect(() => {
    const el = scope.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-word]'), { yPercent: 0, opacity: 1 })
      gsap.set(el.querySelectorAll('[data-reveal]'), { y: 0, opacity: 1 })
      return undefined
    }

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('[data-word]')
      const items = el.querySelectorAll('[data-reveal]')

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start, once },
      })

      if (words.length) {
        gsap.set(words, { yPercent: 112, opacity: 0 })
        tl.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 1.05,
          ease: 'expo.out',
          stagger: { each: 0.035, from: 'start' },
        })
      }

      if (items.length) {
        tl.to(
          items,
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: 'power3.out',
            stagger: 0.075,
          },
          words.length ? '-=0.72' : 0
        )
      }
    }, el)

    return () => ctx.revert()
  }, [start, once])

  return scope
}
