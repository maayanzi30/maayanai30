import { Link } from 'react-router-dom'
import Section from '../../components/Section.jsx'
import ArtImage from '../../components/ArtImage.jsx'

// אזור 2 — טעימה מתיק העבודות (גלריה, רשת): כותרת, תת־כותרת, תמונה, כפתור
const shots = [
  { g: 'g1', label: 'איפור אמנותי לאירוע', alt: 'איפור אמנותי צבעוני לאירוע מיוחד' },
  { g: 'g2', label: 'לוק רך לכלה לא שגרתית', alt: 'איפור רך ולא שגרתי לכלה' },
  { g: 'g6', label: 'איפור נחושת ליום צילום', alt: 'איפור בגווני נחושת ליום צילום' },
  { g: 'g7', label: 'איפור עיניים גרפי', alt: 'איפור עיניים גרפי ונועז' },
]

export default function PortfolioTeaser() {
  return (
    <Section center labelledBy="teaser-title">
      <span className="eyebrow">טעימה מתיק העבודות</span>
      <h2 id="teaser-title">כל פנים הן קנבס</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        מבחר קטן מתוך העבודות שלי — כל לוק נבנה סביב מי שיושבת בכיסא, לא סביב
        תבנית מוכנה.
      </p>
      <div className="grid grid-4" style={{ marginTop: 32 }}>
        {shots.map((s) => (
          <ArtImage key={s.label} gradient={s.g} label={s.label} alt={s.alt} />
        ))}
      </div>
      <div className="btn-row" style={{ marginTop: 32 }}>
        <Link to="/portfolio" className="btn btn--secondary">
          לתיק העבודות המלא
        </Link>
      </div>
    </Section>
  )
}
