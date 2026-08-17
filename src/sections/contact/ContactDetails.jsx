import Section from '../../components/Section.jsx'
import { business, whatsappLink } from '../../data/site.js'

// אזור 4 — פרטי קשר (טקסט, ממורכז): כותרת, תת־כותרת, כפתור
export default function ContactDetails() {
  return (
    <Section center labelledBy="ct-details-title">
      <span className="eyebrow">פרטי קשר</span>
      <h2 id="ct-details-title">פרטים ישירים</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        זמינה בוואטסאפ ובאימייל. פועלת ב{business.areas}.
      </p>
      <ul
        className="ticklist"
        style={{ marginTop: 20, maxWidth: 420, marginInline: 'auto' }}
      >
        <li>
          וואטסאפ / טלפון:{' '}
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            {business.phoneDisplay}
          </a>
        </li>
        <li>
          אימייל: <a href={`mailto:${business.email}`}>{business.email}</a>
        </li>
        <li>אזור פעילות: {business.areas}</li>
      </ul>
      <div className="btn-row" style={{ marginTop: 24 }}>
        <a
          href={whatsappLink()}
          className="btn btn--primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          לפתיחת שיחה בוואטסאפ
        </a>
      </div>
    </Section>
  )
}
