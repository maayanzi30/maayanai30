import Section from '../../components/Section.jsx'

// אזור 1 — כותרת העמוד (טקסט, ממורכז): כותרת, תת־כותרת
export default function TermsHeader() {
  return (
    <Section tint="tint-plum" center labelledBy="tr-title">
      <span className="eyebrow">תקנון</span>
      <h1 id="tr-title">תקנון ותנאי שימוש</h1>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        תנאי השימוש באתר ובשירותים. אנא קראו אותם בעיון. עודכן לאחרונה בתאריך
        17 באוגוסט 2026.
      </p>
    </Section>
  )
}
