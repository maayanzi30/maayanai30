import Section from '../../components/Section.jsx'
import ArtImage from '../../components/ArtImage.jsx'

// אזור 2 — גלריית עבודות (גלריה, רשת): כותרת, תת־כותרת, תמונה
const works = [
  { g: 'g1', label: 'איפור אמנותי צבעוני לאירוע', alt: 'איפור אמנותי צבעוני לאירוע מיוחד' },
  { g: 'g3', label: 'לוק ערב עם נגיעות זהב', alt: 'איפור ערב כהה עם נגיעות זהב' },
  { g: 'g4', label: 'איפור רך ולא שגרתי לכלה', alt: 'איפור כלה רך בגוונים חמים' },
  { g: 'g5', label: 'איפור עיניים גרפי ונועז', alt: 'איפור עיניים גרפי בקווים נועזים' },
  { g: 'g6', label: 'איפור נחושת ליום צילום', alt: 'איפור בגווני נחושת ליום צילום' },
  { g: 'g7', label: 'לוק במה דרמטי', alt: 'איפור במה דרמטי לא שגרתי' },
  { g: 'g8', label: 'איפור טבעי־פלוס לפורטרט', alt: 'איפור טבעי מוקפד לצילום פורטרט' },
  { g: 'g2', label: 'שילוב מרקמים מטאליים', alt: 'איפור עם שילוב מרקמים מטאליים' },
]

export default function GalleryFull() {
  return (
    <Section center labelledBy="pf-gallery-title">
      <h2 id="pf-gallery-title">גלריית עבודות</h2>
      <p className="lead measure" style={{ marginInline: 'auto' }}>
        מבחר עבודות מהשנים האחרונות. כל תמונה היא נקודת פתיחה לשיחה על הלוק שלכן.
      </p>
      <div className="grid grid-4" style={{ marginTop: 32 }}>
        {works.map((w) => (
          <ArtImage key={w.label} gradient={w.g} label={w.label} alt={w.alt} />
        ))}
      </div>
    </Section>
  )
}
