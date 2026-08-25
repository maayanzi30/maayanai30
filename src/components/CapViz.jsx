/**
 * Small line motifs for the capability tiles. Pure `currentColor` SVG, so each
 * one inherits the tile's foreground and stays crisp at any size — they exist
 * to give the larger bento cells something to hold above the copy.
 */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, vectorEffect: 'non-scaling-stroke' }

const shapes = {
  /* Stacked screens — zero to shipped. */
  product: (
    <g {...S}>
      <rect x="6" y="26" width="62" height="42" rx="5" opacity="0.35" />
      <rect x="16" y="18" width="62" height="42" rx="5" opacity="0.6" />
      <rect x="26" y="10" width="62" height="42" rx="5" />
      <path d="M34 24h30M34 32h44M34 40h20" opacity="0.75" />
    </g>
  ),
  /* Token lattice — a system with its connections drawn. */
  systems: (
    <g {...S}>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle key={`${r}-${c}`} cx={12 + c * 24} cy={12 + r * 24} r="3.5" opacity={(r + c) % 3 === 0 ? 1 : 0.4} />
        ))
      )}
      <path d="M12 12h72M12 36h72M12 60h72M12 84h72" opacity="0.16" />
      <path d="M12 12v72M36 12v72M60 12v72M84 12v72" opacity="0.16" />
      <path d="M12 12 36 36 60 12 84 60" opacity="0.9" />
    </g>
  ),
  /* An easing curve with its timing marks. */
  motion: (
    <g {...S}>
      <path d="M6 62C24 62 30 14 48 14s24 48 42 48" />
      <path d="M6 62h84" opacity="0.25" />
      {[6, 27, 48, 69, 90].map((x, i) => (
        <path key={x} d={`M${x} 58v8`} opacity={i === 2 ? 1 : 0.4} />
      ))}
      <circle cx="48" cy="14" r="3.5" fill="currentColor" stroke="none" />
    </g>
  ),
  /* Angle brackets — drawing and building are the same gesture. */
  dev: (
    <g {...S}>
      <path d="M30 20 8 40l22 20" />
      <path d="M62 20l22 20-22 20" />
      <path d="M52 14 40 66" opacity="0.55" />
    </g>
  ),
  /* Concentric calibration rings. */
  direction: (
    <g {...S}>
      <circle cx="46" cy="40" r="32" opacity="0.3" />
      <circle cx="46" cy="40" r="22" opacity="0.55" />
      <circle cx="46" cy="40" r="12" />
      <circle cx="46" cy="40" r="2.5" fill="currentColor" stroke="none" />
      <path d="M46 0v14M46 66v14M4 40h14M74 40h14" opacity="0.45" />
    </g>
  ),
}

export default function CapViz({ id }) {
  const shape = shapes[id]
  if (!shape) return null
  return (
    <span className="cap__viz" aria-hidden="true">
      <svg viewBox="0 0 96 80" preserveAspectRatio="xMidYMid meet">
        {shape}
      </svg>
    </span>
  )
}
