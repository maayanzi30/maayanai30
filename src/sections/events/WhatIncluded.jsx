import Section from '../../components/Section.jsx'

// אזור 3 — מה כולל השירות (רשת יתרונות, רשת): כותרת, תת־כותרת, רשת יתרונות
const items = [
  { icon: '☎', title: 'שיחת אפיון', text: 'שיחה מקדימה להבנת האירוע, הסגנון וההעדפות שלכן.' },
  { icon: '✎', title: 'עיצוב לוק אישי', text: 'בניית לוק שמתאים לכן, ללבוש ולתאורה — לא תבנית מוכנה.' },
  { icon: '✧', title: 'איפור מלא ביום האירוע', text: 'ביצוע מקצועי עם מוצרים איכותיים שמחזיקים לאורך זמן.' },
  { icon: '☂', title: 'עמידות לאורך היום', text: 'קיבוע ומרקמים שנשארים יפים מהצילום הראשון ועד הסוף.' },
  { icon: '⚑', title: 'הגעה עד אליכן', text: 'ניידות עם כל הציוד למקום האירוע או הצילום.' },
  { icon: '❤', title: 'ליווי ורוגע', text: 'אווירה רגועה, טיפים לשימור הלוק ומענה גם אחרי.' },
]

export default function WhatIncluded() {
  return (
    <Section tint="tint" center labelledBy="ev-incl-title">
      <span className="eyebrow">מה כולל השירות</span>
      <h2 id="ev-incl-title">הכול מתחילת התהליך ועד סופו</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        חבילת שירות מלאה כדי שביום עצמו יהיה לכן רק להיות נוכחות.
      </p>
      <div className="grid grid-3" style={{ marginTop: 32 }}>
        {items.map((i) => (
          <article className="card" key={i.title}>
            <span className="card__icon" aria-hidden="true">
              {i.icon}
            </span>
            <h3>{i.title}</h3>
            <p className="muted">{i.text}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
