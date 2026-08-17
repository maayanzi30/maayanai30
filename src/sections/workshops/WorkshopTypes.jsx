import Section from '../../components/Section.jsx'

// אזור 2 — סוגי סדנאות (טקסט, ממורכז): כותרת, רשת יתרונות
const types = [
  { icon: '👤', title: 'סדנה אישית 1:1', text: 'סדנה פרטית שמותאמת בדיוק לפנים, לסגנון ולצרכים שלכן — הקצב שלכן.' },
  { icon: '👯', title: 'סדנה קבוצתית', text: 'חוויה משותפת לחברות, צוות או משפחה — לומדות יחד ונהנות.' },
  { icon: '🎨', title: 'סדנת איפור אמנותי', text: 'צוללות לעולם הצבע, המרקמים והלוקים הלא־שגרתיים.' },
  { icon: '💄', title: 'סדנת "היום־יום שלי"', text: 'לוק אישי לשימוש יומיומי — פשוט, מהיר ומחמיא.' },
]

export default function WorkshopTypes() {
  return (
    <Section center labelledBy="ws-types-title">
      <span className="eyebrow">סוגי סדנאות</span>
      <h2 id="ws-types-title">בוחרות את הפורמט שמתאים לכן</h2>
      <div className="grid grid-4" style={{ marginTop: 32 }}>
        {types.map((t) => (
          <article className="card" key={t.title}>
            <span className="card__icon" aria-hidden="true">
              {t.icon}
            </span>
            <h3>{t.title}</h3>
            <p className="muted">{t.text}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
