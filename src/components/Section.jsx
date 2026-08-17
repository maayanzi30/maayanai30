// עוטף אזור סמנטי אחיד. כל אזור באתר משתמש בו כדי לשמור על מרווחים ומבנה.
export default function Section({
  id,
  center = false,
  tint = null, // null | 'tint' | 'tint-plum'
  tight = false,
  className = '',
  labelledBy,
  children,
}) {
  const classes = [
    'section',
    tight && 'section--tight',
    center && 'section--center',
    tint === 'tint' && 'tint',
    tint === 'tint-plum' && 'tint-plum',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={classes} aria-labelledby={labelledBy}>
      <div className="container">{children}</div>
    </section>
  )
}
