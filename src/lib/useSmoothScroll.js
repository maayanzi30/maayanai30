import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap.js'
import { prefersReducedMotion } from './prefs.js'

let lenisInstance = null

/** Scroll to a section id (or the top) through Lenis, with native fallback. */
export function scrollToId(id, opts = {}) {
  const target = id === 'top' ? 0 : document.getElementById(id)
  if (target === null) return
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: opts.offset ?? 0, duration: 1.25, ...opts })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * Lenis wired into the GSAP ticker so ScrollTrigger and smooth scrolling
 * share one clock. Disabled entirely under prefers-reduced-motion.
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return undefined

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native momentum feels better than a simulated one
      touchMultiplier: 1.6,
    })
    lenisInstance = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisInstance = null
    }
  }, [enabled])
}

/** Jump the page to an absolute Y, through Lenis when it is running. */
export function scrollToY(y, immediate = true) {
  if (lenisInstance) lenisInstance.scrollTo(y, { immediate })
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' })
}

/** Freeze/unfreeze page scroll (used by the nav sheet and case-study overlay). */
export function lockScroll(locked) {
  document.body.dataset.lock = locked ? 'true' : 'false'
  if (lenisInstance) {
    locked ? lenisInstance.stop() : lenisInstance.start()
  }
}
