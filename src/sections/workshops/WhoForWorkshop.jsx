import Section from '../../components/Section.jsx'

// אזור 4 — למי זה מתאים (טקסט, ממורכז): כותרת, תת־כותרת
export default function WhoForWorkshop() {
  return (
    <Section center labelledBy="ws-who-title">
      <span className="eyebrow">למי זה מתאים</span>
      <h2 id="ws-who-title">לכל אישה שרוצה לאפר את עצמה טוב יותר</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        אין צורך בניסיון קודם. הסדנאות מתאימות למי שמתחילות מאפס, למי שרוצות
        לרענן ולשדרג, ולמי שכבר אוהבות איפור ורוצות לצלול לעולם הלא־שגרתי
        והאמנותי. מגיעות כמו שאתן — ויוצאות עם ביטחון וכלים.
      </p>
      <ul
        className="ticklist"
        style={{ marginTop: 24, maxWidth: 520, marginInline: 'auto' }}
      >
        <li>מתחילות שרוצות בסיס יציב וברור</li>
        <li>מי שיודעת קצת ורוצה לשדרג את הלוק היומיומי</li>
        <li>חובבות איפור שרוצות ללמוד טכניקות אמנותיות ולא שגרתיות</li>
        <li>קבוצות חברות, צוותים או משפחה לחוויה משותפת</li>
      </ul>
    </Section>
  )
}
