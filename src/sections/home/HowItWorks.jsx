import Section from '../../components/Section.jsx'

// אזור 4 — איך זה עובד (ממורכז): כותרת, תת־כותרת, רשת יתרונות
const steps = [
  { n: '1', title: 'פנייה', text: 'כותבות לי בוואטסאפ או דרך הטופס, מספרות על האירוע או המטרה.' },
  { n: '2', title: 'אפיון', text: 'יושבות יחד על הסגנון, הצבעוניות והלוק שמתאים לכן — לא תבנית מוכנה.' },
  { n: '3', title: 'ביצוע', text: 'ביום עצמו מגיעה עם כל הציוד ומבצעת את האיפור ברוגע ובזמן.' },
  { n: '4', title: 'ליווי', text: 'טיפים לשימור הלוק לאורך היום, ומענה גם אחרי — כדי שתישארו רגועות.' },
]

export default function HowItWorks() {
  return (
    <Section center labelledBy="how-title">
      <span className="eyebrow">איך זה עובד</span>
      <h2 id="how-title">תהליך פשוט, בלי הפתעות</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        ארבעה שלבים ברורים מהרגע שאתן פונות ועד שאתן יוצאות מהכיסא.
      </p>
      <ol
        className="grid grid-4"
        style={{ marginTop: 34, listStyle: 'none', padding: 0 }}
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
