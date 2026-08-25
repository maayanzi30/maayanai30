import { Fragment } from 'react'

/**
 * Splits a string into word-level mask spans so GSAP can slide each word up
 * from behind its own clip. Words keep their natural wrapping, which line-level
 * splitting would break on resize.
 */
export function SplitWords({ text, className = '', wordClass = '', as: Tag = 'span' }) {
  const words = String(text).split(/(\s+)/)
  return (
    <Tag className={`split ${className}`}>
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <Fragment key={i}> </Fragment>
        ) : (
          <span className="split__mask" key={i}>
            <span className={`split__word ${wordClass}`} data-word>
              {w}
            </span>
          </span>
        )
      )}
    </Tag>
  )
}
