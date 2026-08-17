import Section from '../../components/Section.jsx'
import SmartForm from '../../components/SmartForm.jsx'
import { business } from '../../data/site.js'

// אזור 3 — פרטי יצירת קשר לפניות נגישות (טופס, ממורכז): כותרת, טופס
export default function AccessContactForm() {
  return (
    <Section tint="tint" center labelledBy="acc-form-title">
      <h2 id="acc-form-title">פנייה בנושא נגישות</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        רכזת הנגישות זמינה עבורכן. אפשר לפנות ישירות באימייל{' '}
        <a href={`mailto:${business.email}`}>{business.email}</a> או דרך הטופס:
      </p>
      <div style={{ marginTop: 28 }}>
        <SmartForm
          name="טופס פנייה בנושא נגישות"
          fields={[
            { name: 'name', label: 'שם מלא', type: 'text', required: true, autoComplete: 'name' },
            { name: 'email', label: 'אימייל', type: 'email', required: true, autoComplete: 'email' },
            { name: 'phone', label: 'טלפון', type: 'tel', required: false, autoComplete: 'tel' },
            { name: 'issue', label: 'תיאור הבעיה בנגישות', type: 'textarea', required: true, placeholder: 'איזה עמוד או רכיב לא היה נגיש עבורכן?' },
          ]}
          consentText="אני מאשרת שהפרטים שמסרתי יישמרו וישמשו לטיפול בפניית הנגישות ולחזרה אליי בלבד, בהתאם לחוק הגנת הפרטיות (תיקון 13)."
          submitLabel="שליחת פנייה"
          successText="הפנייה בנושא הנגישות התקבלה. נטפל בה ונחזור אליכן בהקדם."
        />
      </div>
    </Section>
  )
}
