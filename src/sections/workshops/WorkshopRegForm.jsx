import Section from '../../components/Section.jsx'
import SmartForm from '../../components/SmartForm.jsx'

// אזור 7 — טופס הרשמה לסדנה (קריאה לפעולה, ממורכז): כותרת, תת־כותרת, טופס, כפתור
export default function WorkshopRegForm() {
  return (
    <Section id="register" tint="tint-plum" center labelledBy="ws-reg-title">
      <span className="eyebrow">הרשמה לסדנה</span>
      <h2 id="ws-reg-title">שומרות לכן מקום</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        מלאו את הפרטים ונתאם יחד את הסדנה שמתאימה לכן.
      </p>
      <div style={{ marginTop: 28 }}>
        <SmartForm
          name="טופס הרשמה לסדנת איפור"
          fields={[
            { name: 'name', label: 'שם מלא', type: 'text', required: true, autoComplete: 'name' },
            { name: 'phone', label: 'טלפון', type: 'tel', required: true, autoComplete: 'tel' },
            { name: 'email', label: 'אימייל', type: 'email', required: false, autoComplete: 'email' },
            {
              name: 'workshop',
              label: 'סוג הסדנה',
              type: 'select',
              required: true,
              options: ['סדנה אישית 1:1', 'סדנה קבוצתית', 'סדנת איפור אמנותי', 'סדנת "היום־יום שלי"'],
            },
            { name: 'notes', label: 'מה תרצו להוציא מהסדנה?', type: 'textarea', required: false, placeholder: 'רמת ניסיון, מטרות, מספר משתתפות…' },
          ]}
          consentText="אני מאשרת שהפרטים שמסרתי יישמרו וישמשו ליצירת קשר ולתיאום הסדנה בלבד, בהתאם לחוק הגנת הפרטיות."
          submitLabel="שליחת הרשמה"
          successText="ההרשמה נשלחה! אחזור אליכן לתיאום הסדנה."
        />
      </div>
    </Section>
  )
}
