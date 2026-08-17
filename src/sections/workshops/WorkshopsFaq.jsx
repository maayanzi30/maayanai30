import Section from '../../components/Section.jsx'
import Accordion from '../../components/Accordion.jsx'

// אזור 6 — שאלות נפוצות (ממורכז): כותרת, אקורדיון
const items = [
  {
    q: 'צריך להביא ציוד או איפור משלי?',
    a: 'לא חובה. יש במקום ציוד ומוצרים לתרגול. אם תרצו, אשמח להמליץ מה כדאי לרכוש לערכה האישית שלכן בהמשך.',
  },
  {
    q: 'כמה משתתפות יש בסדנה קבוצתית?',
    a: 'הקבוצות קטנות ואינטימיות כדי שכל אחת תקבל תשומת לב אישית. את המספר המדויק נסגור לפי הקבוצה שלכן.',
  },
  {
    q: 'כמה זמן נמשכת סדנה?',
    a: 'תלוי בפורמט ובתכנים, בדרך כלל בין שעתיים לחצי יום. נעדכן אתכן בזמן המדויק בתיאום.',
  },
  {
    q: 'אין לי שום ניסיון — זה בשבילי?',
    a: 'לגמרי. חלק גדול מהמשתתפות מתחילות מאפס. מתקדמות בקצב שלכן, בלי לחץ ובלי שיפוטיות.',
  },
]

export default function WorkshopsFaq() {
  return (
    <Section center labelledBy="ws-faq-title">
      <span className="eyebrow">שאלות נפוצות</span>
      <h2 id="ws-faq-title">שאלות לפני שנרשמות</h2>
      <div className="center-narrow" style={{ marginTop: 28 }}>
        <Accordion items={items} />
      </div>
    </Section>
  )
}
