import Section from '../../components/Section.jsx'
import ArtImage from '../../components/ArtImage.jsx'

// אזור 1 — פתיחה (הירו / CTA, ממורכז): כותרת, תת־כותרת, תמונה
export default function PortfolioIntro() {
  return (
    <Section tint="tint-plum" center labelledBy="pf-intro-title">
      <span className="eyebrow">תיק עבודות</span>
      <h1 id="pf-intro-title" className="measure" style={{ marginInline: 'auto' }}>
        אוסף של לוקים, כל אחד עם סיפור
      </h1>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        אלה עבודות שנבנו סביב אנשים אמיתיים — אירועים, ימי צילום ורגעים מיוחדים.
        הצבעוניות והמרקמים משתנים, אבל הכוונה תמיד אחת: להביא את מי שמולי לקדמת הבמה.
      </p>
      <div style={{ maxWidth: 640, marginInline: 'auto', marginTop: 36 }}>
        <ArtImage
          gradient="g2"
          ratio="wide"
          label="מבט־על על מגוון הסגנונות בתיק העבודות"
          alt="קולאז' צבעוני המייצג את מגוון סגנונות האיפור בתיק העבודות"
        />
      </div>
    </Section>
  )
}
