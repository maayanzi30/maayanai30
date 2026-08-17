import Section from '../../components/Section.jsx'

// אזור 1 — פתיחה (הירו / CTA, ממורכז): כותרת, תת־כותרת
export default function ContactIntro() {
  return (
    <Section tint="tint-plum" center labelledBy="ct-intro-title">
      <span className="eyebrow">יצירת קשר</span>
      <h1 id="ct-intro-title" className="measure" style={{ marginInline: 'auto' }}>
        בואו נדבר על <span className="gradient-text">הלוק שלכן</span>
      </h1>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        לאירוע, ליום צילום או לסדנה — אני כאן לענות על כל שאלה ולעזור לכן לבחור
        את הדרך הנכונה. בחרו את הערוץ שנוח לכן.
      </p>
    </Section>
  )
}
