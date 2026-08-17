import Section from '../../components/Section.jsx'

// אזור 3 — מה לומדות בסדנה (טקסט, ממורכז): כותרת, תת־כותרת, רשת יתרונות
const skills = [
  { icon: '✦', title: 'הכרת הפנים שלכן', text: 'להבין את מבנה הפנים ומה מחמיא לו — הבסיס לכל לוק.' },
  { icon: '◈', title: 'הכנת עור ובסיס', text: 'הכנה, בסיס ומרקם שמחזיקים לאורך היום.' },
  { icon: '❋', title: 'עיניים וצבע', text: 'טכניקות עיניים, שילובי צבע ומעברים — כולל הנגיעה הלא־שגרתית.' },
  { icon: '✷', title: 'קונטור והדגשה', text: 'לפסל ולהאיר את הפנים בצורה טבעית ומדויקת.' },
  { icon: '✧', title: 'עמידות וקיבוע', text: 'איך גורמות ללוק להישאר יפה שעות.' },
  { icon: '🛍', title: 'ערכת הכלים שלכן', text: 'מה כדאי שיהיה בתיק, ואיך בוחרות מוצרים נכון.' },
]

export default function WhatYouLearn() {
  return (
    <Section tint="tint" center labelledBy="ws-learn-title">
      <span className="eyebrow">מה לומדות בסדנה</span>
      <h2 id="ws-learn-title">יוצאות עם ידע שנשאר אתכן</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        כל סדנה מותאמת לרמה ולמטרה שלכן, אבל אלה הנושאים שאנחנו בדרך כלל עוברות.
      </p>
      <div className="grid grid-3" style={{ marginTop: 32 }}>
        {skills.map((s) => (
          <article className="card" key={s.title}>
            <span className="card__icon" aria-hidden="true">
              {s.icon}
            </span>
            <h3>{s.title}</h3>
            <p className="muted">{s.text}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
