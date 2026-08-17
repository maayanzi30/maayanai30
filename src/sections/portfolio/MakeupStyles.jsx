import Section from '../../components/Section.jsx'

// אזור 3 — סגנונות איפור (טקסט, ממורכז): כותרת, רשת יתרונות
const styles = [
  { icon: '✦', title: 'אמנותי־צבעוני', text: 'צבעים לא שגרתיים, מרקמים ומטאליק — לוק שמושך מבטים ומספר סיפור.' },
  { icon: '❋', title: 'רך ולא שגרתי', text: 'עדין למראה אך עם טוויסט אישי — נגיעה אחת שמוציאה אתכן מהברירת מחדל.' },
  { icon: '◈', title: 'עריכה לצילום', text: 'איפור שנבנה למצלמה ולתאורה — נקי, מדויק ומחזיק לאורך יום צילום שלם.' },
  { icon: '✺', title: 'במה והופעות', text: 'לוקים דרמטיים שנראים חזק גם מרחוק וגם בקלוז־אפ.' },
  { icon: '❀', title: 'כלות אלטרנטיביות', text: 'לכלה שרוצה משהו משלה — לא הלוק ה"סטנדרטי", אלא שלה במאה אחוז.' },
  { icon: '✷', title: 'אירועים מיוחדים', text: 'ערבים, מסיבות ורגעים גדולים — איפור שמחזיק מהצילום הראשון ועד סוף הערב.' },
]

export default function MakeupStyles() {
  return (
    <Section tint="tint" center labelledBy="pf-styles-title">
      <span className="eyebrow">סגנונות איפור</span>
      <h2 id="pf-styles-title">שפה אחת, המון ניבים</h2>
      <div className="grid grid-3" style={{ marginTop: 32 }}>
        {styles.map((s) => (
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
