/** Environment + user-preference probes. All safe to call during render. */

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/**
 * Should this device run the WebGL layer?
 * Bails on reduced-motion, tiny screens and machines with very few cores —
 * the site is designed to be complete without it.
 */
export function shouldRenderWebGL() {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  if (window.innerWidth < 560) return false
  const cores = navigator.hardwareConcurrency
  if (typeof cores === 'number' && cores > 0 && cores < 4) return false
  const mem = navigator.deviceMemory
  if (typeof mem === 'number' && mem > 0 && mem < 4) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Cap device pixel ratio — retina at 3x buys nothing here and costs a lot. */
export const cappedDPR = (max = 1.75) =>
  Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, max)
