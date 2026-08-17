import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Events from './pages/Events.jsx'
import Workshops from './pages/Workshops.jsx'
import Contact from './pages/Contact.jsx'
import Accessibility from './pages/Accessibility.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import NotFound from './pages/NotFound.jsx'

// route נפרד לכל אחד מ-8 העמודים.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/events" element={<Events />} />
      <Route path="/workshops" element={<Workshops />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/accessibility" element={<Accessibility />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
