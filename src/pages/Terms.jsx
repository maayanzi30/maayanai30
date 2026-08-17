import Layout from '../components/Layout.jsx'
import TermsHeader from '../sections/legal/TermsHeader.jsx'
import TermsBody from '../sections/legal/TermsBody.jsx'

// עמוד "תקנון" — 3 אזורים (הפוטר משותף דרך Layout).
export default function Terms() {
  return (
    <Layout title="תקנון ותנאי שימוש">
      <TermsHeader />
      <TermsBody />
    </Layout>
  )
}
