import { Link } from 'react-router-dom'
import Section from '../../components/Section.jsx'
import { whatsappLink } from '../../data/site.js'

// אזור 5 — קריאה לפגישה (טקסט, ממורכז): כותרת, תת־כותרת, כפתור
export default function MeetingCta() {
  return (
    <Section tint="tint-plum" center labelledBy="pf-cta-title">
      <h2 id="pf-cta-title">אהבתן משהו שראיתן?</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        בואו נקבע פגישת אפיון קצרה ונבנה יחד את הלוק שמתאים בדיוק לכן ולאירוע שלכן.
      </p>
      <div className="btn-row" style={{ marginTop: 8 }}>
        <Link to="/contact" className="btn btn--primary">
          לקביעת פגישה
        </Link>
        <a
          href={whatsappLink('היי, ראיתי את תיק העבודות ואשמח לקבוע פגישת אפיון')}
          className="btn btn--wa"
          target="_blank"
          rel="noopener noreferrer"
        >
          שיחה בוואטסאפ
        </a>
      </div>
    </Section>
  )
}
