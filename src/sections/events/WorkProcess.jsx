import Section from '../../components/Section.jsx'

// אזור 4 — תהליך העבודה (איך זה עובד, ממורכז): כותרת, תת־כותרת, רשת יתרונות
const steps = [
  { n: '1', title: 'פנייה', text: 'ממלאות טופס קצר או כותבות בוואטסאפ עם פרטי האירוע והתאריך.' },
  { n: '2', title: 'אפיון', text: 'שיחת אפיון שבה מגדירות יחד את הסגנון, הצבעוניות והעוצמה.' },
  { n: '3', title: 'ביצוע', text: 'ביום האירוע מגיעה עם כל הציוד ומבצעת את האיפור ברוגע ובזמן.' },
  { n: '4', title: 'ליווי', text: 'טיפים לשימור הלוק לאורך היום ומענה זמין גם אחרי.' },
]

export default function WorkProcess() {
  return (
    <Section center labelledBy="ev-proc-title">
      <span className="eyebrow">תהליך העבודה</span>
      <h2 id="ev-proc-title">ארבעה שלבים, אפס לחץ</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        פנייה, אפיון, ביצוע וליווי — תהליך ברור מהרגע הראשון ועד סוף האירוע.
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
