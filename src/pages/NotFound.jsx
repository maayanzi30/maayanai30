import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Section from '../components/Section.jsx'

// עמוד שגיאה 404 (fallback לנתיב לא קיים) — אינו נספר בין 8 עמודי התוכן.
export default function NotFound() {
  return (
    <Layout title="הדף לא נמצא">
      <Section center>
        <h1>אופס, הדף לא נמצא</h1>
        <p className="lead measure" style={{ marginInline: 'auto' }}>
          נראה שהגעתן לכתובת שאינה קיימת. אפשר לחזור לדף הבית ולהמשיך משם.
        </p>
        <div className="btn-row">
          <Link to="/" className="btn btn--primary">
            חזרה לדף הבית
          </Link>
          <Link to="/contact" className="btn btn--secondary">
            ליצירת קשר
          </Link>
        </div>
      </Section>
    </Layout>
  )
}
