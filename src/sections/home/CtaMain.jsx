import { Link } from 'react-router-dom'
import Section from '../../components/Section.jsx'
import SmartForm from '../../components/SmartForm.jsx'
import { whatsappLink } from '../../data/site.js'

// אזור 7 — קריאה לפעולה (ממורכז): כותרת, תת־כותרת, כפתור, טופס
export default function CtaMain() {
  return (
    <Section tint="tint" center labelledBy="cta-title">
      <span className="eyebrow">קריאה לפעולה</span>
      <h2 id="cta-title">מוכנות ללוק שהוא באמת אתן?</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        השאירו פרטים קצרים ואחזור אליכן, או דברו איתי ישירות בוואטסאפ.
      </p>
      <div className="btn-row" style={{ marginTop: 4, marginBottom: 28 }}>
        <a
          href={whatsappLink()}
          className="btn btn--wa"
          target="_blank"
          rel="noopener noreferrer"
        >
          שיחה בוואטסאפ
        </a>
        <Link to="/contact" className="btn btn--secondary">
          לעמוד יצירת הקשר
        </Link>
      </div>
      <SmartForm
        name="השארת פרטים מהירה"
        fields={[
          { name: 'name', label: 'שם מלא', type: 'text', required: true, autoComplete: 'name' },
          { name: 'phone', label: 'טלפון', type: 'tel', required: true, autoComplete: 'tel' },
          { name: 'about', label: 'על מה תרצו לדבר?', type: 'textarea', required: false, placeholder: 'אירוע, יום צילום, סדנה…' },
        ]}
        consentText="אני מאשרת שייצרו איתי קשר ושהפרטים שמסרתי יישמרו לצורך מענה לפנייה (בהתאם לחוק הגנת הפרטיות)."
        submitLabel="שלחו ואחזור אליכן"
      />
    </Section>
  )
}
