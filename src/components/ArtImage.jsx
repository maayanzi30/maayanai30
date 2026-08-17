// "תמונה" אמנותית — מציין מיקום מעוצב שמייצג צילום איפור.
// alt תיאורי לתמונות תוכן; alt="" (decorative) לתמונות דקורטיביות.
// יש להחליף בצילומים אמיתיים לפני עלייה לאוויר (להשאיר את ה-alt התיאורי).
export default function ArtImage({
  gradient = 'g1',
  label,
  alt,
  ratio = '', // '' | 'wide' | 'tall'
  decorative = false,
}) {
  const cls = ['artframe', ratio && `artframe--${ratio}`, gradient]
    .filter(Boolean)
    .join(' ')

  return (
    <figure
      className={cls}
      role="img"
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : alt || label}
    >
      {label && <figcaption className="artframe__label">{label}</figcaption>}
    </figure>
  )
}
