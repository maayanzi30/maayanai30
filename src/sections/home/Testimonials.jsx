import Section from '../../components/Section.jsx'

// אזור 5 — המלצות (ממורכז): כותרת, תת־כותרת, לוגואים (לקוחות ומסגרות עבודה)
const quotes = [
  {
    text: 'הגעתי עם בקשה מעורפלת ל"משהו אחר", ויצאתי עם לוק שהרגיש בדיוק אני. כל הערב קיבלתי מחמאות.',
    who: 'נועה — איפור לאירוע',
  },
  {
    text: 'עבדנו יחד על יום צילום שלם. האיפור החזיק מעמד מול התאורה והמצלמה בלי נגיעה אחת מיותרת.',
    who: 'סטודיו צילום פורטרט',
  },
  {
    text: 'הגעתי לסדנה בלי ניסיון, ויצאתי יודעת לאפר את עצמי לערב. הסבלנות וההסבר היו מדהימים.',
    who: 'רוני — משתתפת סדנה',
  },
]

const partners = ['סטודיו צילום', 'הפקות אירועים', 'מותגי יופי', 'תיאטרון ומופעים', 'צלמות אופנה']

export default function Testimonials() {
  return (
    <Section tint="tint-plum" center labelledBy="testi-title">
      <span className="eyebrow">המלצות</span>
      <h2 id="testi-title">מה מספרות עליי</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        לקוחות פרטיות, צלמות ומפיקים שבחרו בסגנון הלא־שגרתי — וחזרו.
      </p>
      <div className="grid grid-3" style={{ marginTop: 34 }}>
        {quotes.map((q) => (
          <figure
            className="card"
            key={q.who}
            style={{ margin: 0, background: 'rgba(247,241,236,0.08)', border: '1px solid rgba(247,241,236,0.2)' }}
          >
            <blockquote style={{ margin: 0 }}>
              <p style={{ color: '#fff', fontSize: '1.05rem' }}>„{q.text}”</p>
            </blockquote>
            <figcaption style={{ color: 'var(--rose-light)', fontWeight: 700 }}>
              {q.who}
            </figcaption>
          </figure>
        ))}
      </div>

      <div style={{ marginTop: 34 }}>
        <p className="muted" style={{ marginBottom: 12 }}>
          עבדתי לצד:
        </p>
        <div className="badge-row" role="list" aria-label="שותפים ולקוחות">
          {partners.map((p) => (
            <span className="badge" role="listitem" key={p}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}
