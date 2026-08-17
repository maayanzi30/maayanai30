import { Link } from 'react-router-dom'
import { mainNav, legalNav, business, whatsappLink } from '../data/site.js'

// אזור "פוטר עם קישורים משפטיים" — משותף לכל 8 העמודים.
// כולל קישור להצהרת נגישות בכל עמוד (תקן ישראלי 5568).
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>
              {business.name}
            </h2>
            <p style={{ maxWidth: '34ch' }}>{business.message}</p>
            <p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                וואטסאפ: {business.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </p>
          </div>

          <nav aria-label="ניווט תחתון">
            <h3 style={{ fontSize: '1.05rem' }}>ניווט</h3>
            <ul className="footer-links">
              {mainNav.map((i) => (
                <li key={i.to}>
                  <Link to={i.to}>{i.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="קישורים משפטיים">
            <h3 style={{ fontSize: '1.05rem' }}>מידע ומדיניות</h3>
            <ul className="footer-links">
              {legalNav.map((i) => (
                <li key={i.to}>
                  <Link to={i.to}>{i.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {business.name} · כל הזכויות שמורות
          </span>
          <span>
            <Link to="/accessibility">הצהרת נגישות</Link> · האתר נבנה בנגישות
            לפי תקן ישראלי 5568
          </span>
        </div>
      </div>
    </footer>
  )
}
