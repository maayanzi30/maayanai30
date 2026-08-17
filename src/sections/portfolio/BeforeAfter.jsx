import Section from '../../components/Section.jsx'
import ArtImage from '../../components/ArtImage.jsx'

// אזור 4 — לפני ואחרי (טקסט, ממורכז): כותרת, תמונה
export default function BeforeAfter() {
  return (
    <Section center labelledBy="pf-ba-title">
      <span className="eyebrow">לפני ואחרי</span>
      <h2 id="pf-ba-title">אותה אישה, נוכחות אחרת</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        המטרה שלי אף פעם לא "לשנות" אתכן — אלא להאיר את מה שכבר שם. הנה איך זה
        נראה מהמבט הראשון ועד הלוק המוגמר.
      </p>
      <div
        className="grid grid-2"
        style={{ marginTop: 32, maxWidth: 760, marginInline: 'auto' }}
      >
        <ArtImage
          gradient="g8"
          ratio="tall"
          label="לפני — עור טבעי, ללא איפור"
          alt="דוגמה של פנים לפני איפור, עור טבעי"
        />
        <ArtImage
          gradient="g5"
          ratio="tall"
          label="אחרי — לוק אמנותי מוגמר"
          alt="אותן פנים אחרי איפור אמנותי מוגמר"
        />
      </div>
    </Section>
  )
}
