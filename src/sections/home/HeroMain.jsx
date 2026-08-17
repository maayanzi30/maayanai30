import { Link } from 'react-router-dom'
import Section from '../../components/Section.jsx'
import ArtImage from '../../components/ArtImage.jsx'
import { business, whatsappLink } from '../../data/site.js'

// אזור 1 — הירו ראשי (הירו / CTA, ממורכז): כותרת, תת־כותרת, תמונה, כפתור
export default function HeroMain() {
  return (
    <Section tint="tint-plum" center labelledBy="hero-title">
      <span className="eyebrow">{business.tagline}</span>
      <h1 id="hero-title" className="measure" style={{ marginInline: 'auto' }}>
        איפור אמנותי שמביא את האופי שלך לקדמת הבמה
      </h1>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        {business.message} אני מתמחה באיפור לא שגרתי לאירועים מיוחדים, ימי צילום
        וסדנאות — עם עין אמנותית וניסיון של שנים.
      </p>
      <div className="btn-row" style={{ marginTop: 8 }}>
        <Link to="/contact" className="btn btn--primary">
          לקביעת תור
        </Link>
        <a
          href={whatsappLink()}
          className="btn btn--wa"
          target="_blank"
          rel="noopener noreferrer"
        >
          שיחה בוואטסאפ
        </a>
        <Link to="/portfolio" className="btn btn--ghost-light">
          לתיק העבודות
        </Link>
      </div>

      <div
        className="grid grid-3"
        style={{ marginTop: 48, maxWidth: 860, marginInline: 'auto' }}
      >
        <ArtImage
          gradient="g5"
          ratio="tall"
          label="איפור ערב אמנותי בגווני שזיף"
          alt="דוגמה לאיפור ערב אמנותי בגווני שזיף עמוקים"
        />
        <ArtImage
          gradient="g4"
          ratio="tall"
          label="איפור צילום עם נגיעות זהב"
          alt="דוגמה לאיפור ליום צילום עם נגיעות זהב ונחושת"
        />
        <ArtImage
          gradient="g3"
          ratio="tall"
          label="לוק במה נועז וצבעוני"
          alt="דוגמה ללוק במה נועז וצבעוני לא שגרתי"
        />
      </div>
    </Section>
  )
}
