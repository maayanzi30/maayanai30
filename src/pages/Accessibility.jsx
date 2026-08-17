import Layout from '../components/Layout.jsx'
import AccessHeader from '../sections/legal/AccessHeader.jsx'
import AccessBody from '../sections/legal/AccessBody.jsx'
import AccessContactForm from '../sections/legal/AccessContactForm.jsx'

// עמוד "הצהרת נגישות" — 4 אזורים (הפוטר משותף דרך Layout).
export default function Accessibility() {
  return (
    <Layout title="הצהרת נגישות">
      <AccessHeader />
      <AccessBody />
      <AccessContactForm />
    </Layout>
  )
}
