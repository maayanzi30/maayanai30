import Section from '../../components/Section.jsx'

// אזור 1 — כותרת העמוד (טקסט, ממורכז): כותרת, תת־כותרת
export default function PrivacyHeader() {
  return (
    <Section tint="tint-plum" center labelledBy="pr-title">
      <span className="eyebrow">פרטיות</span>
      <h1 id="pr-title" className="gradient-text">מדיניות פרטיות</h1>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        אנחנו מכבדות את פרטיותכן ומחויבות להגן על המידע שאתן מוסרות. עודכן
        לאחרונה בתאריך 17 באוגוסט 2026.
      </p>
    </Section>
  )
}
