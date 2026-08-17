import Section from '../../components/Section.jsx'

// אזור 1 — כותרת העמוד (טקסט, ממורכז): כותרת, תת־כותרת
export default function AccessHeader() {
  return (
    <Section tint="tint-plum" center labelledBy="acc-title">
      <span className="eyebrow">נגישות</span>
      <h1 id="acc-title" className="gradient-text">הצהרת נגישות</h1>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        אנחנו רואות חשיבות בכך שהאתר יהיה נגיש לכלל הגולשות והגולשים, לרבות
        אנשים עם מוגבלות. עודכן לאחרונה בתאריך 17 באוגוסט 2026.
      </p>
    </Section>
  )
}
