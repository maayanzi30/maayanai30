import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import CookieBanner from './CookieBanner.jsx'

// עדכון כותרת הדף וגלילה לראש בכל מעבר עמוד (נגישות + חוויית משתמש).
function usePageChrome(title) {
  const { pathname } = useLocation()
  useEffect(() => {
    if (title) document.title = `${title} | ביו-טי`
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, title])
}

export default function Layout({ title, children }) {
  usePageChrome(title)
  return (
    <>
      <a className="skip-link" href="#main">
        דילוג לתוכן הראשי
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  )
}
