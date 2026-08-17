import Section from '../../components/Section.jsx'
import SmartForm from '../../components/SmartForm.jsx'

// אזור 3 — טופס יצירת קשר (טופס, ממורכז): כותרת, תת־כותרת, טופס, כפתור
export default function ContactForm() {
  return (
    <Section id="contact-form" tint="tint" center labelledBy="ct-form-title">
      <span className="eyebrow">טופס יצירת קשר</span>
      <h2 id="ct-form-title">השאירו פרטים ואחזור אליכן</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        כמה שורות קצרות על מה שאתן מחפשות, ואחזור אליכן בהקדם.
      </p>
      <div style={{ marginTop: 28 }}>
        <SmartForm
          name="טופס יצירת קשר"
          fields={[
            { name: 'name', label: 'שם מלא', type: 'text', required: true, autoComplete: 'name' },
            { name: 'phone', label: 'טלפון', type: 'tel', required: true, autoComplete: 'tel' },
            { name: 'email', label: 'אימייל', type: 'email', required: false, autoComplete: 'email' },
            {
              name: 'subject',
              label: 'נושא הפנייה',
              type: 'select',
              required: true,
              options: ['איפור לאירוע', 'יום צילום', 'סדנת איפור', 'שאלה כללית'],
            },
            { name: 'message', label: 'הודעה', type: 'textarea', required: true, placeholder: 'ספרו לי במה אוכל לעזור…' },
          ]}
          consentText="אני מאשרת שהפרטים שמסרתי יישמרו וישמשו ליצירת קשר ולמענה לפנייה בלבד, בהתאם לחוק הגנת הפרטיות (תיקון 13)."
          submitLabel="שליחת הפנייה"
        />
      </div>
    </Section>
  )
}
