import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// באנר עוגיות פשוט (לא נדרש פופ-אפ מתקדם בסגנון GDPR).
const KEY = 'bioti-cookie-consent'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* חסום אחסון — לא קריטי */
    }
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="cookie" role="region" aria-label="הודעת עוגיות">
      <p>
        אנחנו משתמשים בעוגיות חיוניות בלבד כדי שהאתר יעבוד כראוי. לפרטים ראו{' '}
        <Link to="/privacy">מדיניות הפרטיות</Link>.
      </p>
      <button className="btn btn--light" onClick={accept}>
        הבנתי
      </button>
    </div>
  )
}
