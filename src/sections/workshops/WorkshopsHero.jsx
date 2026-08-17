import Section from '../../components/Section.jsx'
import ArtImage from '../../components/ArtImage.jsx'

// אזור 1 — הירו סדנאות (הירו / CTA, ממורכז): כותרת, תת־כותרת, תמונה, כפתור
export default function WorkshopsHero() {
  return (
    <Section tint="tint-plum" center labelledBy="ws-hero-title">
      <span className="eyebrow">סדנאות איפור</span>
      <h1 id="ws-hero-title" className="measure" style={{ marginInline: 'auto' }}>
        ללמוד לאפר את עצמכן — בביטחון ובשפה אמנותית
      </h1>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        סדנאות אישיות וקבוצתיות שבהן אתן לוקחות את הכלים הביתה. בלי סודות שמורים —
        רק ידע, תרגול והמון כיף.
      </p>
      <div className="btn-row" style={{ marginTop: 4 }}>
        <a href="#register" className="btn btn--primary">
          להרשמה לסדנה
        </a>
      </div>
      <div style={{ maxWidth: 620, marginInline: 'auto', marginTop: 36 }}>
        <ArtImage
          gradient="g6"
          ratio="wide"
          label="סדנת איפור — תרגול מעשי"
          alt="דוגמה לסדנת איפור עם תרגול מעשי"
        />
      </div>
    </Section>
  )
}
