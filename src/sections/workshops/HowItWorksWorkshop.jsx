import Section from '../../components/Section.jsx'

// אזור 5 — איך זה עובד (איך זה עובד, ממורכז): כותרת, תת־כותרת, רשת יתרונות
const steps = [
  { n: '1', title: 'הרשמה', text: 'ממלאות טופס עם סוג הסדנה המבוקש וכמה מילים עליכן.' },
  { n: '2', title: 'תיאום', text: 'סוגרות יחד מועד, פורמט (אישי/קבוצתי) ומיקום.' },
  { n: '3', title: 'הסדנה', text: 'לומדות ומתרגלות על עצמכן, צעד־צעד, בקצב נעים.' },
  { n: '4', title: 'המשך ליווי', text: 'מקבלות סיכום, טיפים והמלצות מוצרים — ואפשר גם לשאול אחרי.' },
]

export default function HowItWorksWorkshop() {
  return (
    <Section tint="tint" center labelledBy="ws-how-title">
      <span className="eyebrow">איך זה עובד</span>
      <h2 id="ws-how-title">מההרשמה ועד שאתן שולטות באיפור</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        תהליך פשוט ומלווה, בדיוק כמו בשאר השירותים: פנייה, אפיון, ביצוע וליווי.
      </p>
      <ol
        className="grid grid-4"
        style={{ marginTop: 32, listStyle: 'none', padding: 0 }}
      >
        {steps.map((s) => (
          <li className="card" key={s.n}>
            <span className="card__num" aria-hidden="true">
              {s.n}
            </span>
            <h3>{s.title}</h3>
            <p className="muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
