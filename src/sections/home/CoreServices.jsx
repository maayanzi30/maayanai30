import { Link } from 'react-router-dom'
import Section from '../../components/Section.jsx'

// אזור 3 — שירותים מרכזיים (רשת יתרונות, רשת): כותרת, תת־כותרת, רשת יתרונות, כפתור
const services = [
  {
    icon: '✦',
    title: 'איפור לאירועים מיוחדים',
    text: 'אירועים, ערבים מיוחדים והופעות — איפור שמחזיק לאורך כל הערב ומרגיש כמוך, רק יותר.',
    to: '/events',
    cta: 'לפרטים על איפור לאירועים',
  },
  {
    icon: '◈',
    title: 'איפור לימי צילום',
    text: 'איפור מדויק למצלמה לצילומי אופנה, פורטרט ותדמית — עובד עם התאורה ולא נגדה.',
    to: '/events',
    cta: 'לפרטים על ימי צילום',
  },
  {
    icon: '❋',
    title: 'סדנאות איפור',
    text: 'סדנאות אישיות וקבוצתיות שבהן לומדים לאפר את עצמכן בביטחון ובשפה אמנותית.',
    to: '/workshops',
    cta: 'לפרטים על הסדנאות',
  },
]

export default function CoreServices() {
  return (
    <Section tint="tint" center labelledBy="services-title">
      <span className="eyebrow">שירותים מרכזיים</span>
      <h2 id="services-title">שלוש דרכים לעבוד יחד</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        אותה עין אמנותית, שלושה הקשרים שונים. בוחרים את מה שמתאים לכן.
      </p>
      <div className="grid grid-3" style={{ marginTop: 34 }}>
        {services.map((s) => (
          <article className="card" key={s.title}>
            <span className="card__icon" aria-hidden="true">
              {s.icon}
            </span>
            <h3>{s.title}</h3>
            <p className="muted">{s.text}</p>
            <Link to={s.to} className="btn btn--secondary" style={{ marginTop: 6 }}>
              {s.cta}
            </Link>
          </article>
        ))}
      </div>
    </Section>
  )
}
