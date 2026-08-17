import Section from '../../components/Section.jsx'
import { business, whatsappLink } from '../../data/site.js'

// אזור 2 — אפשרויות פנייה (טקסט, ממורכז): כותרת, רשת יתרונות, כפתור
const options = [
  { icon: '💬', title: 'וואטסאפ', text: 'הדרך המהירה ביותר — כותבות ואני חוזרת אליכן.' },
  { icon: '✉', title: 'אימייל', text: `לפניות מפורטות: ${business.email}` },
  { icon: '📝', title: 'טופס באתר', text: 'משאירות פרטים למטה ואחזור אליכן בהקדם.' },
]

export default function ContactOptions() {
  return (
    <Section center labelledBy="ct-opts-title">
      <span className="eyebrow">אפשרויות פנייה</span>
      <h2 id="ct-opts-title">איך נוח לכן ליצור קשר</h2>
      <div className="grid grid-3" style={{ marginTop: 32 }}>
        {options.map((o) => (
          <article className="card" key={o.title}>
            <span className="card__icon" aria-hidden="true">
              {o.icon}
            </span>
            <h3>{o.title}</h3>
            <p className="muted">{o.text}</p>
          </article>
        ))}
      </div>
      <div className="btn-row" style={{ marginTop: 28 }}>
        <a
          href={whatsappLink()}
          className="btn btn--wa"
          target="_blank"
          rel="noopener noreferrer"
        >
          שיחה בוואטסאפ
        </a>
        <a href="#contact-form" className="btn btn--secondary">
          למילוי הטופס
        </a>
      </div>
    </Section>
  )
}
