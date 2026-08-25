import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap.js'
import { useSmoothScroll } from './lib/useSmoothScroll.js'

import Preloader from './components/Preloader.jsx'
import Cursor from './components/Cursor.jsx'
import ScrollRail from './components/ScrollRail.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import CaseOverlay from './components/CaseOverlay.jsx'

import Hero from './sections/Hero.jsx'
import Ticker from './sections/Ticker.jsx'
import Practice from './sections/Practice.jsx'
import Work from './sections/Work.jsx'
import Capabilities from './sections/Capabilities.jsx'
import Process from './sections/Process.jsx'
import Recognition from './sections/Recognition.jsx'
import Voices from './sections/Voices.jsx'
import Contact from './sections/Contact.jsx'

export default function App() {
  const [ready, setReady] = useState(false)
  const [openCase, setOpenCase] = useState(null)

  useSmoothScroll(true)

  /* Web fonts change every measurement on the page — recalculate after they land. */
  useEffect(() => {
    let cancelled = false
    const refresh = () => !cancelled && ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    const id = setTimeout(refresh, 1200)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [])

  useEffect(() => {
    if (ready) ScrollTrigger.refresh()
  }, [ready])

  const onDone = useCallback(() => setReady(true), [])
  const close = useCallback(() => setOpenCase(null), [])

  return (
    <>
      <a className="skip" href="#work">
        Skip to the work
      </a>

      <Preloader onDone={onDone} />
      <Cursor />
      <ScrollRail />
      <span className="grain" aria-hidden="true" />

      <Nav />

      <main id="main">
        <Hero ready={ready} />
        <Ticker />
        <Practice />
        <Work onOpen={setOpenCase} />
        <Capabilities />
        <Process />
        <Recognition />
        <Voices />
        <Contact />
      </main>

      <Footer />

      {openCase && <CaseOverlay id={openCase} onClose={close} onNavigate={setOpenCase} />}
    </>
  )
}
