import Section from '../../components/Section.jsx'
import Accordion from '../../components/Accordion.jsx'

// אזור 6 — שאלות נפוצות (ממורכז): כותרת, אקורדיון
const items = [
  {
    q: 'כמה זמן לוקח איפור לאירוע?',
    a: 'תלוי בלוק, אבל בדרך כלל בין 45 דקות לשעה וחצי. בשיחת האפיון נסגור זמן מדויק שמתאים ללוח הזמנים של האירוע.',
  },
  {
    q: 'האם מגיעים עד מקום האירוע?',
    a: 'כן. מגיעה עם כל הציוד למקום שנוח לכן — בבית, באולם או בסטודיו. לאירועים אפשר לתאם ניידות בכל הארץ.',
  },
  {
    q: 'האם אפשר ניסיון לפני (בעיקר לכלות)?',
    a: 'בהחלט מומלץ. אפשר לתאם ניסיון איפור מראש כדי לוודא שהלוק מדויק לפני היום הגדול.',
  },
  {
    q: 'מה לגבי עמידות מול דמעות, ריקודים וחום?',
    a: 'אני עובדת עם מוצרים עמידים וטכניקות קיבוע שנועדו בדיוק לזה — כדי שהלוק יחזיק מעמד לאורך כל האירוע.',
  },
]

export default function EventsFaq() {
  return (
    <Section center labelledBy="ev-faq-title">
      <span className="eyebrow">שאלות נפוצות</span>
      <h2 id="ev-faq-title">כל מה שחשוב לדעת לפני</h2>
      <div className="center-narrow" style={{ marginTop: 28 }}>
        <Accordion items={items} />
      </div>
    </Section>
  )
}
