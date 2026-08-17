import Section from '../../components/Section.jsx'
import ArtImage from '../../components/ArtImage.jsx'
import { whatsappLink } from '../../data/site.js'

// אזור 1 — הירו שירות (הירו / CTA, ממורכז): כותרת, תת־כותרת, תמונה, כפתור
export default function EventsHero() {
  return (
    <Section tint="tint-plum" center labelledBy="ev-hero-title">
      <span className="eyebrow">איפור לאירועים וימי צילום</span>
      <h1 id="ev-hero-title" className="measure" style={{ marginInline: 'auto' }}>
        איפור שמחזיק מהרגע הראשון{' '}
        <span className="gradient-text">ועד סוף הערב</span>
      </h1>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        לאירועים מיוחדים ולימי צילום — איפור לא שגרתי, מדויק ואישי, שנבנה סביבכן
        ומרגיש כמוכן לכל אורך היום.
      </p>
      <div className="btn-row" style={{ marginTop: 4 }}>
        <a href="#booking" className="btn btn--primary">
          <span className="btn__dot" aria-hidden="true">
            ◄
          </span>
          לטופס קביעת תור
        </a>
        <a
          href={whatsappLink('היי, אשמח לפרטים על איפור לאירוע / יום צילום')}
          className="btn btn--wa"
          target="_blank"
          rel="noopener noreferrer"
        >
          שיחה בוואטסאפ
        </a>
      </div>
      <div style={{ maxWidth: 620, marginInline: 'auto', marginTop: 36 }}>
        <ArtImage
          gradient="g4"
          ratio="wide"
          label="איפור אמנותי לאירוע מיוחד"
          alt="דוגמה לאיפור אמנותי מוקפד לאירוע מיוחד"
        />
      </div>
    </Section>
  )
}
