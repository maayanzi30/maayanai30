import Section from '../../components/Section.jsx'

// אזור 5 — המלצות רלוונטיות (ממורכז): כותרת, תת־כותרת
const quotes = [
  {
    text: 'האיפור לחתונה שלי היה בדיוק מה שרציתי — לא "כלה סטנדרטית" אלא אני, ביום הכי חשוב. החזיק מהבוקר עד השעות הקטנות.',
    who: 'שיר — כלה',
  },
  {
    text: 'עבדנו על יום צילום קמפיין שלם. האיפור ישב מושלם מול התאורה ולא נגענו בו כמעט לאורך כל היום.',
    who: 'דנה — צלמת אופנה',
  },
]

export default function RelevantTestimonials() {
  return (
    <Section tint="tint-plum" center labelledBy="ev-testi-title">
      <span className="eyebrow">המלצות</span>
      <h2 id="ev-testi-title">לקוחות שכבר עברו את זה</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        כלות, צלמות ומפיקות שבחרו באיפור לא שגרתי לאירוע או ליום הצילום שלהן.
      </p>
      <div
        className="grid grid-2"
        style={{ marginTop: 32, maxWidth: 900, marginInline: 'auto' }}
      >
        {quotes.map((q) => (
          <figure
            className="card"
            key={q.who}
            style={{ margin: 0, background: 'rgba(247,241,236,0.08)', border: '1px solid rgba(247,241,236,0.2)' }}
          >
            <blockquote style={{ margin: 0 }}>
              <p style={{ color: '#fff', fontSize: '1.08rem' }}>„{q.text}”</p>
            </blockquote>
            <figcaption style={{ color: 'var(--rose-light)', fontWeight: 700 }}>
              {q.who}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}
