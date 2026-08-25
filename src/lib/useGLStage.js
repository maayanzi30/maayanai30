import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { cappedDPR } from './prefs.js'

/**
 * Boilerplate for a self-contained Three.js scene mounted into a container.
 *
 * Handles: renderer creation, DPR cap, ResizeObserver, RAF loop, and pausing
 * when the canvas leaves the viewport or the tab is hidden — an animation
 * nobody can see should not cost a frame.
 *
 * `setup` receives { renderer, scene, camera, size } and returns an optional
 * { update(t, dt, age), resize(w, h), dispose() }.
 *
 * `t` is a clamped animation clock (frame drops never jump the animation);
 * `age` is unclamped wall-clock seconds since the first frame, which is what
 * intro fades must use — clamped deltas make a fade take frame-count time
 * rather than real time, so a slow device would sit at 20% opacity for
 * seconds.
 */
export function useGLStage(setup, { alpha = false, camera: cameraFactory } = {}) {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha,
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      })
    } catch {
      return undefined // no context: the CSS fallback already looks right
    }

    const rect = host.getBoundingClientRect()
    const size = { w: Math.max(1, rect.width), h: Math.max(1, rect.height) }

    renderer.setPixelRatio(cappedDPR())
    renderer.setSize(size.w, size.h, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    const canvas = renderer.domElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.setAttribute('aria-hidden', 'true')
    host.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = cameraFactory
      ? cameraFactory(size)
      : new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const api = setup({ renderer, scene, camera, size }) || {}

    let raf = 0
    let last = performance.now()
    let born = 0
    let visible = true
    let onScreen = true
    let running = false
    const clock = { t: 0 }

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      clock.t += dt
      if (!born) born = now
      api.update?.(clock.t, dt, (now - born) / 1000)
      renderer.render(scene, camera)
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(raf)
    }
    const sync = () => (visible && onScreen ? start() : stop())

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { rootMargin: '120px' }
    )
    io.observe(host)

    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
      sync()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const ro = new ResizeObserver(([entry]) => {
      const box = entry.contentRect
      const w = Math.max(1, box.width)
      const h = Math.max(1, box.height)
      size.w = w
      size.h = h
      renderer.setPixelRatio(cappedDPR())
      renderer.setSize(w, h, false)
      api.resize?.(w, h)
      renderer.render(scene, camera)
    })
    ro.observe(host)

    sync()
    renderer.render(scene, camera)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      api.dispose?.()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        const mat = obj.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else if (mat) mat.dispose()
      })
      renderer.dispose()
      canvas.remove()
    }
    // Scenes are built once; `setup` is expected to be stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return hostRef
}
