import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { mainNav, business } from '../data/site.js'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label={`${business.name} — דף הבית`}>
          {business.name}
          <span aria-hidden="true">.</span>
        </Link>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? 'סגירת התפריט' : 'פתיחת התפריט'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '✕' : '☰'}
        </button>

        <nav
          id="primary-nav"
          className={`nav${open ? ' nav--open' : ''}`}
          aria-label="ניווט ראשי"
        >
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            className="btn btn--primary nav__cta"
            onClick={() => setOpen(false)}
          >
            קביעת תור
          </Link>
        </nav>
      </div>
    </header>
  )
}
