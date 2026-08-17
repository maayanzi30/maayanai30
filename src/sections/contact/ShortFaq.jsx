import Section from '../../components/Section.jsx'
import Accordion from '../../components/Accordion.jsx'

// אזור 5 — שאלות קצרות (שאלות נפוצות, ממורכז): כותרת, אקורדיון
const items = [
  {
    q: 'תוך כמה זמן חוזרים אליי?',
    a: 'בדרך כלל באותו יום עסקים. בעונות עמוסות זה עשוי לקחת מעט יותר — אבל אני חוזרת לכל פנייה.',
  },
  {
    q: 'אפשר גם רק להתייעץ בלי התחייבות?',
    a: 'בטח. אשמח לשמוע מה אתן מחפשות ולכוון אתכן, גם אם עדיין לא סגרתן כלום.',
  },
  {
    q: 'באילו אזורים את פועלת?',
    a: 'בעיקר במרכז ובשרון, עם ניידות לאירועים בכל הארץ בתיאום מראש.',
  },
]

export default function ShortFaq() {
  return (
    <Section tint="tint" center labelledBy="ct-faq-title">
      <span className="eyebrow">שאלות קצרות</span>
      <h2 id="ct-faq-title">לפני שאתן כותבות</h2>
      <div className="center-narrow" style={{ marginTop: 28 }}>
        <Accordion items={items} />
      </div>
    </Section>
  )
}
