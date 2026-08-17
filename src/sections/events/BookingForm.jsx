import Section from '../../components/Section.jsx'
import SmartForm from '../../components/SmartForm.jsx'

// אזור 7 — טופס קביעת תור (טופס, ממורכז): כותרת, תת־כותרת, טופס, כפתור
export default function BookingForm() {
  return (
    <Section id="booking" tint="tint" center labelledBy="ev-form-title">
      <span className="eyebrow">קביעת תור</span>
      <h2 id="ev-form-title">בואו נסגור תאריך</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        מלאו את הפרטים ואחזור אליכן לתיאום שיחת אפיון וקביעת התור.
      </p>
      <div style={{ marginTop: 28 }}>
        <SmartForm
          name="טופס קביעת תור לאיפור לאירוע"
          fields={[
            { name: 'name', label: 'שם מלא', type: 'text', required: true, autoComplete: 'name' },
            { name: 'phone', label: 'טלפון', type: 'tel', required: true, autoComplete: 'tel' },
            { name: 'email', label: 'אימייל', type: 'email', required: false, autoComplete: 'email' },
            {
              name: 'type',
              label: 'סוג האירוע',
              type: 'select',
              required: true,
              options: ['אירוע מיוחד', 'איפור כלה', 'יום צילום', 'מופע / הופעה', 'אחר'],
            },
            { name: 'date', label: 'תאריך משוער', type: 'date', required: false },
            { name: 'notes', label: 'פרטים נוספים', type: 'textarea', required: false, placeholder: 'מיקום, שעה, סגנון שאתן אוהבות…' },
          ]}
          consentText="אני מאשרת שהפרטים שמסרתי יישמרו וישמשו ליצירת קשר ולתיאום התור בלבד, בהתאם לחוק הגנת הפרטיות (תיקון 13)."
          submitLabel="שליחת בקשה לקביעת תור"
          successText="הבקשה נשלחה! אחזור אליכן לתיאום שיחת אפיון וקביעת התור."
        />
      </div>
    </Section>
  )
}
