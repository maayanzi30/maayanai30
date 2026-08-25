import { lazy, Suspense, useEffect, useState } from 'react'
import { SplitWords } from '../lib/text.jsx'
import { useReveal } from '../lib/useReveal.js'
import { shouldRenderWebGL } from '../lib/prefs.js'
import { manifesto } from '../data/site.js'

const Relief = lazy(() => import('../components/webgl/Relief.jsx'))

export default function Practice() {
  const scope = useReveal({ start: 'top 78%' })
  const [gl, setGl] = useState(false)

  useEffect(() => {
    setGl(shouldRenderWebGL())
  }, [])

  return (
    <section className="band practice" id="practice" ref={scope}>
      <div className="shell">
        <div className="band__index">
          <span className="label">{manifesto.label}</span>
          <span className="label">/ 01</span>
        </div>

        <div className="practice__grid">
          <div className="practice__lead">
            <h2 className="display practice__h">
              <SplitWords text={manifesto.headline} />
            </h2>

            <div className="practice__body">
              {manifesto.body.map((p, i) => (
                <p key={i} className="lede" data-reveal>
                  {p}
                </p>
              ))}
            </div>

            <ul className="practice__facts">
              {manifesto.facts.map((f) => (
                <li key={f.v} data-reveal>
                  <span className="display practice__factK">{f.k}</span>
                  <span className="practice__factV">{f.v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="practice__object" data-reveal>
            <div className="practice__objectInner">
              {gl && (
                <Suspense fallback={null}>
                  <Relief />
                </Suspense>
              )}
              <span className="practice__halo" aria-hidden="true" />
              <span className="practice__ring" aria-hidden="true" />
            </div>
            <p className="practice__caption label">
              Fig. 01 — Icosphere displaced by noise. Normals and contours solved in the shader.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
