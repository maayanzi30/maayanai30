import Section from '../../components/Section.jsx'

// אזור 2 — למי זה מתאים (טקסט, ממורכז): כותרת, רשת יתרונות
const items = [
  { icon: '✦', title: 'חוגגות אירוע', text: 'ימי הולדת, ערבי גאלה ואירועים מיוחדים שרוצים בהם לוק שנשאר בזיכרון.' },
  { icon: '❀', title: 'כלות אלטרנטיביות', text: 'למי שרוצה איפור כלה שהוא שלה — לא הנוסחה הרגילה.' },
  { icon: '◈', title: 'ימי צילום', text: 'צלמות, דוגמניות ומותגים שצריכים איפור שעובד מול המצלמה והתאורה.' },
  { icon: '✷', title: 'מופעים והופעות', text: 'אמניות במה שצריכות לוק שנראה חזק גם מהשורה האחרונה.' },
]

export default function WhoFor() {
  return (
    <Section center labelledBy="ev-who-title">
      <span className="eyebrow">למי זה מתאים</span>
      <h2 id="ev-who-title">השירות הזה בשבילכן אם…</h2>
      <div className="grid grid-4" style={{ marginTop: 32 }}>
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
