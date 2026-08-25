import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Lenis drives the RAF loop; lag smoothing fights it.
gsap.ticker.lagSmoothing(0)

gsap.defaults({ ease: 'power3.out', duration: 1 })

export { gsap, ScrollTrigger }
